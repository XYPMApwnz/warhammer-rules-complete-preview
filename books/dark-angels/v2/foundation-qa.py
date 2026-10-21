"""Independent, offline DA RAW parity and factual-boundary QA.

Expected values are rediscovered from enrolled HTML. The producer's discover(),
generated census, Stage 1 inventory and runtime are never expected-value inputs.
Persistent bindings name source occurrences; they do not supply their facts.
"""
from __future__ import annotations
import copy
import hashlib
import importlib.util
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from lxml import html

sys.dont_write_bytecode = True
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
RAW = HERE / 'sources/raw'
BADGE = 'App. Dark Angels (11th edition)'
read = lambda path: json.loads(path.read_text(encoding='utf-8-sig'))
norm = lambda value: ' '.join(value.split())
digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest().upper()


def has(node, token):
    return token in (node.get('class') or '').split()


def nodes(node, token):
    return [element for element in node.iter() if has(element, token)]


def text(node):
    """Independent prose extraction; source MFM mirrors are not Army facts."""
    clone = copy.deepcopy(node)
    for element in list(clone.iterdescendants()):
        if element.getparent() is None:
            continue
        if element.tag in ('script', 'style') or any(has(element, token) for token in
                ('ShowFluff', 'faqErrataSpoiler', 'faqErrataStrat')):
            element.drop_tree()
        elif has(element, 'dsAbility') and nodes(element, 'dsUnitCostHeader'):
            element.drop_tree()
    for price in clone.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[position()>1]'):
        price.drop_tree()
    for element in clone.iter():
        if element.tag in ('div', 'p', 'li', 'ul', 'ol', 'table', 'tr', 'td', 'th',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br'):
            element.text = ' ' + (element.text or '')
            element.tail = ' ' + (element.tail or '')
    return norm(''.join(clone.itertext()))


def equivalent(actual, expected):
    if isinstance(expected, str):
        if not isinstance(actual, str):
            return False
        # The production formatter adds list markers; all printed prose remains.
        normalize = lambda value: norm('\n'.join(re.sub(r'^\s*-\s+', '', line)
            for line in value.splitlines()))
        return normalize(actual) == normalize(expected)
    if isinstance(expected, list):
        return isinstance(actual, list) and len(actual) == len(expected) and all(
            equivalent(a, b) for a, b in zip(actual, expected))
    if isinstance(expected, dict):
        return isinstance(actual, dict) and all(k in actual and equivalent(actual[k], v)
            for k, v in expected.items())
    return actual == expected


def raw_oracle():
    rows = []
    coverage = Counter()
    def observe(kind, element, path, data, owner=None):
        row = {'kind': kind, 'document': path.relative_to(ROOT).as_posix(),
            'pointer': element.getroottree().getpath(element), 'sha256': digest(path),
            'rawNodeSha256': hashlib.sha256(html.tostring(element, encoding='utf-8')).hexdigest().upper(),
            'ownerPointer': owner.getroottree().getpath(owner) if owner is not None else None,
            'data': data}
        rows.append(row)
        return row
    path = RAW / 'wahapedia-datasheets.html'
    tree = html.fromstring(path.read_text(encoding='utf-8'))
    all_frames = nodes(tree, 'datasheet')
    anchors = {frame.getprevious().get('id') for frame in all_frames}
    for frame in all_frames:
        badges = sorted(set(image.get('title') for box in nodes(frame, 'dsPicWide')
            for image in box.xpath('.//img[contains(@src,"expansions/")]')))
        if badges != [BADGE]:
            continue
        title = norm(nodes(frame, 'dsH2Header')[0][0].text_content())
        owner = observe('DATASHEET', frame, path, {'title': title,
            'sourceAnchor': frame.getprevious().get('id'), 'sourcePublication': badges})
        keyword_box = next(n for n in frame if has(n, 'ds2colKWFlat'))
        left, right = list(keyword_box)[:2]
        groups = [n for n in left if n.tag == 'span' and not has(n, 'dsVertLine')]
        owner['data']['keywords'] = [norm(v) for v in groups[0].text_content().split(';') if norm(v)]
        owner['data']['factionKeywords'] = [norm(v) for v in text(right).split(':', 1)[1].split(';') if norm(v)]
        owner['data']['keywordScope'] = 'ALL_SOURCE_MODELS'
        profile_rows = []
        for panel in nodes(frame, 'dsProfileWrap'):
            values = [norm(n.text_content()) for n in nodes(panel, 'dsCharValue')]
            assert len(values) == 6, 'Incomplete six-column MODEL source'
            base = next(n for n in panel.iterancestors() if has(n, 'dsProfileBaseWrap'))
            names = nodes(base, 'dsModelName')
            profile_rows.append(observe('MODEL_PROFILE', base, path,
                {'name': norm(names[0].text_content()) if names else title,
                 'stats': dict(zip(['M', 'T', 'SV', 'W', 'LD', 'OC'], values)),
                 'scope': 'SOURCE_MODEL_PROFILE'}, frame))
        for panel in nodes(frame, 'dsInvulWrap'):
            adjacent = panel.getnext()
            condition = text(adjacent) if adjacent is not None and has(adjacent, 'dsInvulComment') else ''
            named = re.fullmatch(r'\*\s*(.+?)\s+only', condition, re.I) if condition and not condition.lower().startswith('* against') else None
            eligible = [p for p in profile_rows if not named or p['data']['name'].casefold() == named[1].casefold()]
            assert eligible, 'Unknown explicit InSv MODEL recipient'
            row = observe('INVULNERABLE_SAVE', panel, path,
                {'text': norm(text(panel) + ' ' + condition),
                 'value': norm(nodes(panel, 'dsCharInvulValue')[0].text_content()),
                 'conditionText': condition,
                 'scopeQualification': 'EXPLICIT_NAMED_MODEL' if named else
                     'CONDITIONAL_SOURCE_MODEL' if condition else 'DATASHEET_HEADER_SOURCE_PROFILES'}, frame)
            row['profilePointers'] = [p['pointer'] for p in eligible]
        main, = [n for n in frame if has(n, 'ds2col') and not has(n, 'ShowDatasheetFeatures')]
        for weapon in nodes(main, 'dsWeaponRow'):
            cells = weapon.xpath('./td')
            assert len(cells) == 8
            observe('WEAPON_PROFILE', weapon, path,
                {'name': norm(nodes(weapon, 'dsWeaponName')[0].text_content()),
                 **dict(zip(['range', 'attacks', 'skill', 'strength', 'ap', 'damage'], map(text, cells[-6:]))),
                 'abilities': [text(n) for n in nodes(weapon, 'kwbw')],
                 'ownership': 'DATASHEET_PROFILE_ONLY'}, frame)
        for cell in nodes(main, 'dsCoreArmyValue'):
            declarations = cell.xpath('./b/span|./b/a')
            assert declarations, 'Unclassified source ability reference'
            for declaration in declarations:
                observe('RULE_REFERENCE', declaration, path, {'label': text(declaration),
                    'scope': 'SOURCE_DECLARATION', 'recipientBindingStatus': 'NOT_EXECUTABLE'}, frame)
        for column in main:
            if not any(has(column, token) for token in ('dsLeftColFlat', 'dsRightColFlat')):
                continue
            for header in [n for n in column if has(n, 'dsHeader')]:
                label = text(header)
                siblings = []
                for sibling in header.itersiblings():
                    if has(sibling, 'dsHeader'):
                        break
                    if not nodes(sibling, 'dsUnitCostHeader') and text(sibling):
                        siblings.append(sibling)
                body = norm(label + ' ' + ' '.join(map(text, siblings)))
                observe('DATASHEET_SECTION', header, path, {'title': label, 'text': body}, frame)
                supplemental = label in ('CHIEF LIBRARIAN (PSYKER LEVEL 3)', 'PRIMARCH OF THE FIRST LEGION')
                if label in ('ABILITIES', 'PSYCHIC ABILITIES', 'WARGEAR ABILITIES') or supplemental:
                    for ability in siblings:
                        if not (has(ability, 'dsAbility') or has(ability, 'dsAbility_noLine')):
                            continue
                        bold = ability.xpath('./b[1]|./div[contains(@class,"dsWargearAbilityText")]/b[1]')
                        row = observe('DATASHEET_ABILITY', ability, path,
                            {'title': text(bold[0]).rstrip(':') if bold else '', 'text': text(ability),
                             'section': label, 'supplemental': supplemental,
                             'sourceSectionPointer': header.getroottree().getpath(header)}, frame)
                        coverage['supplementalAbilities' if supplemental else 'mainAbilities'] += 1
                if label == 'WARGEAR OPTIONS':
                    for sibling in siblings:
                        for option in sibling.xpath('./ul/li'):
                            observe('WARGEAR_OPTION', option, path, {'text': text(option),
                                'nestedListItems': len(option.xpath('.//li'))}, frame)
                if label == 'UNIT COMPOSITION':
                    for sibling in siblings:
                        for member in sibling.xpath('./ul/li'):
                            literal = text(member)
                            match = re.match(r'^(\d+)(?:[-–](\d+))?\s+(.+)$', literal)
                            assert match, 'Unparsed composition source: ' + literal
                            name = re.sub(r'\s+models?\.?$', '', match[3])
                            target = [p for p in profile_rows if p['data']['name'].casefold() == name.casefold()]
                            target = target[0] if len(target) == 1 else profile_rows[0] if len(profile_rows) == 1 else None
                            row = observe('COMPOSITION_MEMBER', member, path,
                                {'name': name, 'quantity': {'min': int(match[1]), 'max': int(match[2] or match[1])},
                                 'text': literal, 'profileBindingStatus': 'SOURCE_CONFIRMED' if target else 'NOT_PROVEN'}, frame)
                            row['modelProfilePointer'] = target['pointer'] if target else None
                if label in ('LEADER', 'SUPPORT'):
                    targets = list(dict.fromkeys(link.get('href').split('#')[-1]
                        for sibling in siblings for link in sibling.xpath('.//a[@href]')
                        if link.get('href').split('#')[-1] in anchors))
                    observe('SOURCE_RELATION', header, path, {'role': label, 'rawText': body,
                        'targetSourceAnchors': targets, 'effectiveEligibility': False,
                        'mfmIntegrated': False}, frame)
                    coverage[label + 'Edges'] += len(targets)
    path = RAW / 'wahapedia-dark-angels-main.html'
    tree = html.fromstring(path.read_text(encoding='utf-8'))
    army, = tree.xpath('//*[@id="Army-Rules"]')
    for heading in army.getnext().xpath('.//h3[@id]|.//h4[@id]'):
        if heading.get('id') in ('The-Ravenwing', 'The-Deathwing'):
            observe('ARMY_RULE', heading.getparent(), path,
                {'title': text(heading), 'sourceAnchor': heading.get('id'), 'text': text(heading.getparent())})
    for heading in tree.xpath('//h2'):
        if not has(heading, 'outline_header') or not nodes(heading, 'dpPts'):
            continue
        badges = sorted(set(heading.xpath('.//img[contains(@src,"expansions/")]/@title')))
        if badges != [BADGE]:
            continue
        container = heading.getparent()
        observe('DETACHMENT', heading, path, {'sourceAnchor': heading.get('id'), 'sourcePublication': badges})
        for rule in container.xpath('.//h3[@id]'):
            observe('DETACHMENT_RULE', rule.getparent(), path,
                {'title': text(rule), 'sourceAnchor': rule.get('id'), 'text': text(rule.getparent())}, heading)
        for price in nodes(container, 'EnhancementsPts'):
            cell = next(n for n in price.iterancestors() if n.tag == 'td')
            label, = price.xpath('./li/span[1]')
            upgrade = bool(nodes(label, 'EnhancementUnitUpgrade')) or 'UPGRADE' in text(label)
            observe('ENHANCEMENT', cell, path,
                {'title': norm(text(label).replace('UPGRADE', '')) if upgrade else text(label),
                 'text': text(cell), 'itemKind': 'UNIT_UPGRADE' if upgrade else 'ENHANCEMENT',
                 'scope': 'UNIT' if upgrade else 'MODEL'}, heading)
        for stratagem in nodes(container, 'str11Wrap'):
            observe('STRATAGEM', stratagem, path, {'title': text(nodes(stratagem, 'str11Name')[0]),
                'text': text(stratagem)}, heading)
    return {'rows': rows, 'coverage': dict(coverage), 'counts': dict(Counter(row['kind'] for row in rows))}


def compare(snapshot, oracle, bindings, addresses):
    errors = []
    need = lambda condition, message: errors.append(message) if not condition else None
    records = snapshot['entities']
    by_id = {r['id']: r for r in records}
    enrolled = {r['sourceEntityId']: r for r in bindings}
    located = {r['sourceEntityId']: r for r in addresses}
    actual = defaultdict(list)
    expected = {(r['kind'], r['document'], r['pointer']): r for r in oracle['rows']}
    for row in records:
        proof = row.get('provenance', {})
        actual[(row['kind'], proof.get('document'), proof.get('pointer'))].append(row)
    need(set(actual) == set(expected), 'raw-source-address-set-mismatch')
    for label, items, key in [('canonical', records, 'id'), ('source', records, 'sourceEntityId'),
            ('identity', bindings, 'sourceEntityId'), ('address', addresses, 'sourceEntityId')]:
        need(len({r[key] for r in items}) == len(items), 'duplicate-' + label)
    for key, raw in expected.items():
        found = actual.get(key, [])
        if len(found) != 1:
            errors.append('missing-or-duplicate-occurrence:' + str(key))
            continue
        row = found[0]
        sid = row['sourceEntityId']
        binding, address = enrolled.get(sid, {}), located.get(sid, {})
        need(row.get('bookId') == 'dark-angels', 'foreign-owner:' + sid)
        need(row['id'] == binding.get('id') and row['kind'] == binding.get('kind'), 'identity-disagreement:' + sid)
        need(re.fullmatch(r'[a-z-]+da-[0-9a-f]{20}', row['id']) is not None, 'nonopaque-id:' + sid)
        need(re.fullmatch(r'da-source-[0-9a-f]{20}', sid) is not None, 'nonopaque-source-id:' + sid)
        for field, value in raw['data'].items():
            need(equivalent(row.get('data', {}).get(field), value), 'source-value-mismatch:' + sid + '/' + field)
        proof = row.get('provenance', {})
        need(proof.get('sha256') == raw['sha256'] and proof.get('sourceEntityId') == sid
            and proof.get('authority') == 'ACCEPTED_SECONDARY' and bool(proof.get('sourceId')), 'provenance-mismatch:' + sid)
        need(address.get('document') == raw['document'] and address.get('pointer', address.get('xpath')) == raw['pointer']
            and address.get('rawNodeSha256') == raw['rawNodeSha256'], 'source-enrollment-mismatch:' + sid)
        owners = [r for candidates in actual.values() for r in candidates if r.get('provenance', {}).get('document') == raw['document']
            and r.get('provenance', {}).get('pointer') == raw['ownerPointer'] and r['kind'] in ('DATASHEET', 'DETACHMENT')]
        parent = owners[0]['id'] if len(owners) == 1 else None
        need(row.get('parentId') == parent, 'wrong-parent:' + sid)
        need(binding.get('ownerSourceId') == (by_id[parent]['sourceEntityId'] if parent in by_id else None), 'wrong-enrolled-owner:' + sid)
        def model_id(pointer):
            choices = actual.get(('MODEL_PROFILE', raw['document'], pointer), [])
            return choices[0]['id'] if len(choices) == 1 else None
        if raw['kind'] == 'COMPOSITION_MEMBER':
            need(row['data'].get('modelProfileId') == model_id(raw['modelProfilePointer']), 'wrong-composition-MODEL:' + sid)
        if raw['kind'] == 'INVULNERABLE_SAVE':
            need(row['data'].get('sourceProfileIds') == [model_id(p) for p in raw['profilePointers']], 'wrong-InSv-MODEL:' + sid)
    children = {'DATASHEET': {'MODEL_PROFILE': 'profileIds', 'WEAPON_PROFILE': 'weaponIds',
        'DATASHEET_SECTION': 'sectionIds', 'DATASHEET_ABILITY': 'abilityIds', 'WARGEAR_OPTION': 'wargearOptionIds',
        'RULE_REFERENCE': 'ruleReferenceIds', 'COMPOSITION_MEMBER': 'compositionMemberIds',
        'SOURCE_RELATION': 'relationIds', 'INVULNERABLE_SAVE': 'invulnerableIds'},
        'DETACHMENT': {'DETACHMENT_RULE': 'ruleIds', 'ENHANCEMENT': 'enhancementIds', 'STRATAGEM': 'stratagemIds'}}
    for row in records:
        for kind, field in children.get(row['kind'], {}).items():
            expected_ids = {r['id'] for r in records if r.get('parentId') == row['id'] and r['kind'] == kind}
            listed = row['data'].get(field, [])
            need(len(listed) == len(set(listed)) and set(listed) == expected_ids, 'wrong-child-index:' + row['id'] + '/' + field)
    forbidden = {'points', 'pointCost', 'pointsCost', 'unitCost', 'mfmCost', 'mfmPoints', 'officialPoints',
        'rosterPoints', 'pointSchedules', 'wahaPoints', 'paidOptions', 'paidWargear', 'wargearCosts',
        'enhancementCost', 'enhancementPoints', 'detachmentPoints', 'forceDisposition', 'forceDispositions'}
    def walk(value):
        if isinstance(value, dict):
            for key, child in value.items():
                need(key not in forbidden, 'invented-or-copied-MFM-field:' + key)
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)
    for row in records:
        walk(row.get('data', {}))
    for key in ('contentCertified', 'presentationImplemented', 'rosterIntegrationImplemented'):
        need(snapshot.get(key) is False, 'premature-stage-claim:' + key)
    need(snapshot.get('gameplayContractsImplemented') == 0, 'premature-executable-bindings')
    need(snapshot.get('bookId') == 'dark-angels' and snapshot.get('edition') == '11E', 'wrong-book-edition')
    need(snapshot.get('sourceCompleteness') == 'PARTIAL' and snapshot.get('semanticCompleteness') == 'NOT_PROVEN',
        'unproven-source-certification')
    need(snapshot.get('mfmBoundary') == {'owner': 'CENTRALIZED_MFM', 'integration': 'NATIVE_PRICING_BOUND',
        'valuesCopied': False, 'relationsConnected': False}, 'premature-MFM-activation')
    need({r['sourceEntityId'] for r in records} == set(enrolled) == set(located), 'unused-or-missing-enrollment')
    return errors


def mutation_controls(snapshot, oracle, bindings, addresses):
    checks = []
    def first(rows, kind):
        return next(r for r in rows if r['kind'] == kind)
    def reject(name, mutation):
        damaged = copy.deepcopy(snapshot)
        mutation(damaged['entities'])
        assert compare(damaged, oracle, bindings, addresses), 'QA missed corruption: ' + name
        checks.append(name)
    reject('missing-weapon', lambda rows: rows.remove(first(rows, 'WEAPON_PROFILE')))
    reject('duplicate-canonical-id', lambda rows: rows.append(copy.deepcopy(rows[0])))
    reject('wrong-MODEL-owner', lambda rows: first(rows, 'MODEL_PROFILE').update(parentId='unit-da-invalid'))
    reject('changed-weapon-stat', lambda rows: first(rows, 'WEAPON_PROFILE')['data'].update(strength='99'))
    reject('truncated-full-rule', lambda rows: first(rows, 'DATASHEET_ABILITY')['data'].update(text='Truncated'))
    reject('lost-nested-ability', lambda rows: rows.remove(next(r for r in rows if r['kind'] == 'DATASHEET_ABILITY' and r['data']['supplemental'])))
    reject('lost-nested-parent-condition', lambda rows: next(r for r in rows if r['kind'] == 'DATASHEET_ABILITY' and r['data']['supplemental'])['data'].update(sourceSectionPointer=None))
    reject('missing-provenance', lambda rows: first(rows, 'ENHANCEMENT').update(provenance={}))
    reject('wrong-source-hash', lambda rows: first(rows, 'ENHANCEMENT')['provenance'].update(sha256='0' * 64))
    reject('changed-canonical-id', lambda rows: first(rows, 'MODEL_PROFILE').update(id='model-da-0000000000000000'))
    reject('foreign-SM-fact', lambda rows: first(rows, 'DATASHEET').update(bookId='space-marines'))
    reject('unreachable-weapon', lambda rows: first(rows, 'DATASHEET')['data']['weaponIds'].pop())
    reject('invented-MFM-price', lambda rows: first(rows, 'DATASHEET')['data'].update(points=0))
    reject('executed-source-relation', lambda rows: first(rows, 'SOURCE_RELATION')['data'].update(effectiveEligibility=True))
    reject('invented-native-MODEL-scope', lambda rows: first(rows, 'RULE_REFERENCE')['data'].update(scope='MODEL'))
    reject('lost-invulnerable-recipient', lambda rows: first(rows, 'INVULNERABLE_SAVE')['data'].update(sourceProfileIds=[]))
    return checks


def enrollment_controls(producer, result):
    """Check persistence and fail-closed enrollment without altering real files."""
    sources = read(HERE / 'source-bindings.json')
    identities = read(HERE / 'identity-bindings.json')
    pristine = copy.deepcopy((sources, identities))
    expected = producer.collect()
    reversed_sources, reversed_identities = copy.deepcopy(pristine)
    reversed_sources['recordAddresses'].reverse()
    reversed_identities['bindings'].reverse()
    assert producer.collect(source_bindings=reversed_sources, identity_bindings=reversed_identities) == expected
    checks = ['reversed-enrollment-preserves-exact-identities-and-facts']
    def reject(name, mutate):
        source, identity = copy.deepcopy(pristine)
        mutate(source, identity)
        try:
            producer.collect(source_bindings=source, identity_bindings=identity)
        except ValueError:
            checks.append(name)
        else:
            raise AssertionError('Producer accepted invalid enrollment: ' + name)
    reject('missing-source-binding', lambda source, identity: source['recordAddresses'].pop())
    reject('duplicate-source-binding', lambda source, identity: source['recordAddresses'].append(
        copy.deepcopy(source['recordAddresses'][0])))
    reject('missing-identity-binding', lambda source, identity: identity['bindings'].pop())
    reject('duplicate-identity-binding', lambda source, identity: identity['bindings'].append(
        copy.deepcopy(identity['bindings'][0])))
    reject('altered-source-node-hash', lambda source, identity: source['recordAddresses'][0].update(rawNodeSha256='0' * 64))
    reject('altered-data-fingerprint', lambda source, identity: source['recordAddresses'][0].update(dataFingerprint='0' * 64))
    def wrong_owner(source, identity):
        child = next(r for r in identity['bindings'] if r.get('ownerSourceId'))
        other = next(r for r in identity['bindings'] if not r.get('ownerSourceId') and r['sourceEntityId'] != child['ownerSourceId'])
        child['ownerSourceId'] = other['sourceEntityId']
    reject('changed-to-existing-wrong-owner', wrong_owner)
    enrollment = read(HERE / 'sources/enrollment.json')
    assert enrollment['sourceCompleteness'] == 'PARTIAL' and enrollment['semanticCompleteness'] == 'NOT_PROVEN'
    for artifact in enrollment['artifacts']:
        path = ROOT / artifact['path']
        assert digest(path) == artifact['sha256'] and path.stat().st_size == artifact['bytes'], 'Enrolled bytes changed: ' + str(path)
        assert artifact['httpStatus'] == 200 and artifact.get('capturedAtUTC') and artifact.get('url')
    pinned = {'wahapedia-datasheets.html': '66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D',
        'wahapedia-dark-angels-main.html': '67E319B48234DFE7CA854A66E3408146FE637ACB4722AC1DFBC5FC86847DE3DC'}
    assert all(digest(RAW / name) == expected_sha for name, expected_sha in pinned.items()), 'Stage 1 accepted factual source changed'
    damaged = copy.deepcopy(enrollment)
    damaged['artifacts'][0]['sha256'] = '0' * 64
    try:
        producer.verify_sources(enrollment=damaged)
    except ValueError:
        checks.append('altered-enrolled-artifact-sha')
    else:
        raise AssertionError('Producer accepted altered artifact SHA')
    assert (sources, identities) == pristine, 'QA mutated pristine enrollment'
    for name, value in result.items():
        assert read(HERE / 'generated' / (name + '.json')) == value, 'Stale generated output: ' + name
    return checks


def main():
    oracle = raw_oracle()
    spec = importlib.util.spec_from_file_location('da_actual_producer', HERE / 'build.py')
    producer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(producer)
    result = producer.build()
    bindings = read(HERE / 'identity-bindings.json')['bindings']
    addresses = read(HERE / 'source-bindings.json')['recordAddresses']
    errors = compare(result['base'], oracle, bindings, addresses) + compare(result['effective'], oracle, bindings, addresses)
    assert not errors, '\n'.join(errors)
    expected_counts = {'DATASHEET': 16, 'MODEL_PROFILE': 21, 'WEAPON_PROFILE': 68,
        'COMPOSITION_MEMBER': 21, 'WARGEAR_OPTION': 12, 'DATASHEET_SECTION': 49,
        'DATASHEET_ABILITY': 40, 'RULE_REFERENCE': 43, 'INVULNERABLE_SAVE': 15,
        'SOURCE_RELATION': 7, 'ARMY_RULE': 2, 'DETACHMENT': 3, 'DETACHMENT_RULE': 3,
        'ENHANCEMENT': 8, 'STRATAGEM': 12}
    assert oracle['counts'] == expected_counts, 'Accepted raw source population changed'
    assert oracle['coverage'] == {'mainAbilities': 35, 'supplementalAbilities': 5, 'LEADEREdges': 35, 'SUPPORTEdges': 2}
    units = [r for r in result['base']['entities'] if r['kind'] == 'DATASHEET']
    command = next(r for r in units if r['data']['sourceAnchor'] == 'Ravenwing-Command-Squad')
    assert len(command['data']['profileIds']) == 3, 'Ravenwing independent MODEL profiles lost'
    assert sum(r['kind'] == 'DATASHEET_SECTION' and r['data']['title'] == 'Supreme Commander'
        for r in result['base']['entities']) == 1, 'Supreme Commander requirement lost'
    enhancements = [r for r in result['base']['entities'] if r['kind'] == 'ENHANCEMENT']
    assert Counter(r['data']['itemKind'] for r in enhancements) == {'ENHANCEMENT': 6, 'UNIT_UPGRADE': 2}
    controls = mutation_controls(result['base'], oracle, bindings, addresses)
    enrollment_checks = enrollment_controls(producer, result)
    assert producer.build() == result, 'Build is not deterministic'
    print(json.dumps({'status': 'PASS', 'independentRawCounts': oracle['counts'],
        'coverage': oracle['coverage'], 'sourceRows': len(oracle['rows']), 'mutationControls': controls,
        'enrollmentControls': enrollment_checks,
        'boundaries': {'MFMPointsImported': False, 'gameplayActivated': False,
            'SMFactsCopied': False, 'fullOfficialAppCertified': False}}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
