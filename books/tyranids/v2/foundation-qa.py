"""Bounded official-overlay, scope and source-integrity regression controls."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import pdfplumber

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('tyranids_build', HERE/'build.py')
producer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(producer)
read = lambda path: json.loads(path.read_text(encoding='utf-8'))
norm = lambda value: ' '.join(value.replace('‑', '-').split())


def expected_official():
    path = HERE/'sources/tyranids-faction-pack-v1.3.pdf'
    assert hashlib.sha256(path.read_bytes()).hexdigest().upper() == 'B8AF0DF04063ACC6E935C8B8C29A2E722367B4B90BF5023E06F441E2B8DE8E6F'
    with pdfplumber.open(path) as pdf:
        cover = norm(pdf.pages[0].extract_text())
        assert 'VERSION 1.3' in cover and '14th October 2026' in cover
        # These expected addresses/values are independent of official-bindings.
        column = lambda page, box: norm(pdf.pages[page-1].crop(box).extract_text(x_tolerance=2, y_tolerance=3) or '')
        malign = column(20, (301, 327, 558, 382)).split('Change to:')[1].strip().strip("'")
        will = column(20, (40, 569, 292, 636)).split('Change to:')[1].strip().strip('‘’')
        harpooned = column(20, (301, 63, 558, 153)).split('Change to:')[1].strip().strip('‘’')
        assert '+2 to charge rolls' in harpooned and 'must end that charge move engaged' in harpooned
        assert "Remove 'Hover'" in column(21, (40, 162, 292, 194))
        assert 'FACTION: Shadow in the Warp' in column(20, (40, 228, 292, 255))
        faq = column(21, (40, 228, 292, 261))
        assert faq == 'Q: When my Biovores unit uses the Seed Spore Mines ability, does my unit lose hidden? A: No.'
        foul = column(20, (301, 744, 558, 782))
        foul_faq = column(21, (40, 679, 292, 724))
        assert 'Friendly TYRANIDS units within 6"' in foul and 'excludes MONSTERS' in foul_faq
        goading = column(19, (301, 613, 558, 712)).split('EFFECT: ')[1].strip().rstrip('’')
    return {'malign': malign, 'will': will, 'harpooned': harpooned, 'faq': faq, 'goading': goading}


def compare(result, official):
    errors = []
    base, effective = result['base'], result['effective']
    b, e = {r['id']: r for r in base['entities']}, {r['id']: r for r in effective['entities']}
    def need(condition, message):
        if not condition:
            errors.append(message)
    allowed = {'datasheet-the-swarmlord:section:1', 'datasheet-hive-tyrant:section:1',
        'datasheet-winged-hive-tyrant:section:1', 'datasheet-harpy:rule-reference:2',
        'unit-harpy', 'unit-parasite-of-mortrex', 'datasheet-norn-assimilator:weapon:1:ability:harpooned',
        'detachment-unending-swarm:stratagem:1', 'datasheet-venomthropes:section:1'}
    for identity, record in b.items():
        need(identity in e, 'lost base canonical identity '+identity)
        if identity in e:
            need(record.get('parentId') == e[identity].get('parentId'), 'changed owner '+identity)
            if identity not in allowed:
                need(record == e[identity], 'unrelated semantic delta '+identity)
    need(set(e)-set(b) == {'datasheet-parasite-of-mortrex:rule-reference:shadow-in-the-warp-official',
        'faq-biovores-seed-spore-mines-hidden-v1.3', 'tyranids-source-conflict-foul-spores'}, 'unexpected official additions')
    for identity, index, key, name in [
        ('datasheet-the-swarmlord:section:1', 1, 'malign', 'Malign Presence'),
        ('datasheet-hive-tyrant:section:1', 0, 'will', 'Will of the Hive Mind'),
        ('datasheet-winged-hive-tyrant:section:1', 0, 'will', 'Will of the Hive Mind')]:
        record = e[identity]
        need(norm(record['data']['blocks'][index]['text']) == name+': '+official[key], 'wrong official ability '+identity)
        need(bool(record.get('fieldProvenance')), 'lost official field provenance '+identity)
        for j, block in enumerate(b[identity]['data']['blocks']):
            if j != index:
                need(record['data']['blocks'][j] == block, 'changed sibling ability '+identity)
    need('datasheet-harpy:rule-reference:2' not in e['unit-harpy']['data']['ruleReferenceIds'], 'effective Hover retained')
    need(e['datasheet-harpy:rule-reference:2']['data'].get('status') == 'SUPERSEDED', 'suppression status lost')
    need(e['unit-harpy']['data']['profileIds'] == b['unit-harpy']['data']['profileIds'], 'Harpy identity changed')
    shadow = e['datasheet-parasite-of-mortrex:rule-reference:shadow-in-the-warp-official']
    need(shadow['parentId'] == 'unit-parasite-of-mortrex' and shadow['data']['label'] == 'Shadow in the Warp', 'wrong Parasite owner/reference')
    need(shadow['data']['conditionalOnly'] is True, 'Shadow made unconditional')
    harpoon = e['datasheet-norn-assimilator:weapon:1:ability:harpooned']
    actual = norm(harpoon['data']['text']).replace('- This', '▪ This')
    need(actual == official['harpooned'].replace('MONSTER/ VEHICLE', 'MONSTER/VEHICLE'), 'Harpooned condition/charge restriction lost')
    need(harpoon['parentId'] == 'datasheet-norn-assimilator:weapon:1', 'wrong Harpooned weapon owner')
    goading = next(l['text'] for l in e['detachment-unending-swarm:stratagem:1']['data']['lines'] if l['label'] == 'EFFECT')
    need(norm(goading) == official['goading'], 'wrong Synaptic Goading official text')
    faq = e['faq-biovores-seed-spore-mines-hidden-v1.3']
    need('Q: '+faq['data']['title']+' A: '+faq['data']['text'] == official['faq'] and faq['parentId'] == 'unit-biovores', 'wrong Biovores FAQ')
    conflict = e['tyranids-source-conflict-foul-spores']['data']
    need(conflict.get('classification') == 'UNRESOLVED_OFFICIAL_CONTRADICTION' and conflict.get('executable') is False, 'invented Foul Spores resolution')
    need(len(conflict.get('officialEvidence', [])) == 2, 'lost contradictory official statement')
    upgrade_ids = {'detachment-ambush-predators:enhancement:1', 'detachment-ambush-predators:enhancement:2',
                   'detachment-talons-of-the-norn-queen:enhancement:1', 'detachment-talons-of-the-norn-queen:enhancement:2'}
    need({r['id'] for r in e.values() if r['kind'] == 'ENHANCEMENT' and r['data']['scope'] == 'UNIT'} == upgrade_ids, 'MODEL/UNIT Upgrade scope drift')
    prime = e['datasheet-hyperadapted-raveners:rule-reference:3']['data']['recipient']
    need(prime['modelProfileIds'] == ['datasheet-hyperadapted-raveners:profile:1'] and len(prime['compositionMemberIds']) == 1, 'Prime ability widened')
    for owner in ['old-one-eye', 'psychophage']:
        refs = [r for r in e.values() if r['kind'] == 'RULE_REFERENCE' and r.get('parentId') == 'unit-'+owner and r['data']['label'] == 'Feel No Pain 5+']
        need(len(refs) == 1, 'native FNP duplicate/loss')
        if refs:
            native = effective['rosterReferenceSemantics'].get(refs[0]['id'], {})
            need(native.get('abilities') == [{'name': 'Feel No Pain', 'value': 5}] and native.get('modelProfileIds') == ['datasheet-'+owner+':profile:1'], 'native FNP owner/value drift')
    transport = [r for r in e.values() if r['kind'] == 'DATASHEET_SECTION' and r['data']['title'] == 'TRANSPORT']
    need(len(transport) == 3 and all(r['data']['declaration']['conditionalOnly'] for r in transport), 'Transport declaration lost')
    need(e['datasheet-tyrannocyte:section:2']['data']['declaration']['capacityAlternatives'] == [
        {'models':20,'faction':'TYRANIDS','keyword':'INFANTRY'},
        {'models':1,'faction':'TYRANIDS','keyword':'MONSTER','maximumWounds':12}], 'Tyrannocyte alternate capacity drift')
    need(e['datasheet-hierophant:section:2']['data']['declaration']['excludedCapability'] == 'FLY', 'Hierophant restriction lost')
    need(e['datasheet-harridan:section:2']['data']['declaration']['capacityGroups'] == [
        {'models':20,'unitSourceId':'datasheet-gargoyles'}, {'models':1,'unitSourceId':'datasheet-winged-tyranid-prime'}], 'Harridan passenger restriction drift')
    return errors


def main():
    expected = expected_official()
    result = producer.build()
    errors = compare(result, expected)
    assert not errors, '\n'.join(errors)
    def test(name, mutate):
        damaged = copy.deepcopy(result)
        mutate(damaged)
        assert compare(damaged, expected), 'Comparator missed '+name
        return name
    entity = lambda r, identity: next(x for x in r['effective']['entities'] if x['id'] == identity)
    mutations = [
        test('official-text-loss', lambda r: entity(r,'datasheet-the-swarmlord:section:1')['data']['blocks'][1].update(text='Any enemy unit pays +1CP.')),
        test('wrong-native-FNP', lambda r: r['effective']['rosterReferenceSemantics']['datasheet-old-one-eye:rule-reference:1'].update(abilities=[])),
        test('Prime-to-all-models', lambda r: entity(r,'datasheet-hyperadapted-raveners:rule-reference:3')['data']['recipient']['modelProfileIds'].append('datasheet-hyperadapted-raveners:profile:2')),
        test('UNIT-Upgrade-to-MODEL', lambda r: entity(r,'detachment-ambush-predators:enhancement:1')['data'].update(scope='MODEL')),
        test('lost-Foul-FAQ', lambda r: entity(r,'tyranids-source-conflict-foul-spores')['data']['officialEvidence'].pop()),
        test('wrong-transport-capacity', lambda r: entity(r,'datasheet-tyrannocyte:section:2')['data']['declaration']['capacityAlternatives'][1].update(maximumWounds=99)),
        test('missing-Parasite-reference', lambda r: entity(r,'datasheet-parasite-of-mortrex:rule-reference:shadow-in-the-warp-official')['data'].update(label='Synapse')),
    ]
    stale = copy.deepcopy(result['base'])
    stale['entities'][0]['data']['points'] = 999
    try:
        producer.validate(stale)
    except ValueError:
        mutations.append('Army-owned-MFM-copy')
    else:
        raise AssertionError('Accepted duplicate MFM owner')
    enrollment = read(HERE/'sources/enrollment.json')
    poisoned_enrollment = copy.deepcopy(enrollment)
    poisoned_enrollment['artifacts'][0]['sha256'] = '0'*64
    try:
        producer.verify_sources(poisoned_enrollment)
    except ValueError:
        mutations.append('source-integrity-mismatch')
    else:
        raise AssertionError('Accepted wrong source SHA')
    occurrences = producer.official_occurrences()
    poisoned_occurrences = copy.deepcopy(occurrences)
    column = next(row for row in poisoned_occurrences if row['id'] == 'gw-v1.3-retained-updates-page19-left')
    column['targetIds'].append('datasheet-biovores:section:1')
    try:
        producer.apply_official(result['base'], poisoned_occurrences, read(HERE/'identity-bindings.json'))
    except ValueError as error:
        assert 'named owner' in str(error)
        mutations.append('wrong-official-crop-owner')
    else:
        raise AssertionError('Accepted unrelated official crop provenance')
    for name, value in result.items():
        assert producer.serialize(value) == (HERE/'generated'/(name+'.json')).read_bytes(), 'Stale generated '+name
    assert producer.serialize(producer.build()) == producer.serialize(result), 'Non-deterministic build'
    print(json.dumps({'FOUNDATION':'PASS','OFFICIAL_OVERLAYS':'PASS','MODEL_SCOPE':'PASS',
        'TRANSPORTS':'3/3','MUTATIONS_DETECTED':mutations,'DETERMINISM':'PASS','STALE_GUARD':'PASS'}))


if __name__ == '__main__':
    main()
