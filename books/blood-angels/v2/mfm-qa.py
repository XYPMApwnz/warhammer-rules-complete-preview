"""Independent Stage 2B RAW-source pricing and explicit bridge review checks.

EXPECTED is extracted from pinned HTML, never native computed prices. This QA
does not run the legacy builder or mixed-owner gameplay runtime.
"""
import argparse
import copy
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
sys.dont_write_bytecode = True

from lxml import html

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
RAW = HERE / 'sources/raw/mfm-ba-hydrated.html'
RAW_SHA = 'CFB2246142919E21E77CAB5F7945A59125BE2F1D81F2673914F8A6912F4AD9FD'


def load(path):
    return json.loads(Path(path).read_text(encoding='utf8'))


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest().upper()


def text(node):
    return re.sub(r'\s+', ' ', ''.join(node.itertext())).strip()


def norm(value):
    return re.sub(r'\s+', '', value).upper()


def integer(value):
    return int(re.search(r'\d+', value).group())


def tree(path):
    return html.fromstring(Path(path).read_text(encoding='utf8'))


def mfm_unit(node):
    result = {'title': text(node[0]), 'pointSchedules': [], 'paidOptions': [], 'relations': {}}
    for block in node[1:]:
        heading = text(block[0])
        entries = block.xpath('.//ul/li')
        if entries:
            rows = [{'sourceLabel': text(row[0]), 'value': integer(text(row[1]))} for row in entries]
            if heading.startswith('YOUR '):
                result['pointSchedules'].append({'sourceLabel': heading, 'entries': rows})
            else:
                result['paidOptions'].extend({'sourceGroup': heading, **row} for row in rows)
        elif heading in ['LEADER', 'SUPPORT']:
            result['relations'][heading.lower()] = [s.strip() for s in text(block[1]).split(',')]
    return result


def mfm_detachment(node):
    result = {'title': text(node[0][0]), 'detachmentPoints': integer(text(node[0][1])),
              'category': '; '.join(text(c) for c in node[1:] if c.get('style', '').startswith('background-color:')), 'enhancements': [],
              'qualifiers': [text(block) for block in node if text(block).startswith('UNIQUE:')]}
    for row in node.xpath('.//ul/div/li'):
        name = text(row[0][0])
        result['enhancements'].append({'title': name, 'value': integer(text(row[0][1])),
            'itemKind': 'UNIT_UPGRADE' if re.search(r'\((?:upgrade|upgarde)\)', name, re.I) else 'ENHANCEMENT'})
    return result


def source_oracle():
    assert sha(RAW) == RAW_SHA, 'Accepted official RAW bytes changed'
    dom = tree(RAW)
    own = dom.xpath('/html/body/main/div[2]/div[3]/div[1]/div/div')
    shared = dom.xpath('/html/body/main/div[2]/div[3]/div[2]/div/div')
    det = dom.xpath('/html/body/main/div[2]/div[4]/div/div')
    return dom, own, shared, det


def waha_costs(node):
    schedules, paid, current = [], [], None
    tables = node.xpath('.//table[.//*[contains(@class,"dsUnitCostHeader")]]')
    for table in tables:
        for row in table.xpath('./tbody/tr|./tr'):
            headers = row.xpath('./td[contains(@class,"dsUnitCostHeader")]')
            if headers:
                label = text(headers[0])
                current = {'sourceLabel': label, 'entries': []}
                if label.startswith('YOUR '):
                    schedules.append(current)
                continue
            cells = row.xpath('./td')
            if len(cells) != 2:
                continue
            item = {'sourceLabel': text(cells[0]), 'value': integer(text(cells[1]))}
            if current['sourceLabel'].startswith('YOUR '):
                current['entries'].append(item)
            else:
                paid.append({'sourceGroup': current['sourceLabel'], **item})
    return schedules, paid


def prices_equal(left, right):
    def normalized(rows):
        return [(norm(row['sourceLabel']), [(norm(e['sourceLabel']), e['value']) for e in row['entries']]) for row in rows]
    return normalized(left) == normalized(right)


def independent_mapping_review(review_rows=None):
    dom, own_nodes, shared_nodes, _ = source_oracle()
    assert len(own_nodes) == 14 and len(shared_nodes) == 69
    candidates = load(HERE / 'mfm-identity-candidates.json')['identityCandidates']
    review = load(HERE / 'mfm-mapping-review.json')['reviewedBindings'] if review_rows is None else review_rows
    facts = {e['id']: e for e in load(HERE / 'generated/base.json')['entities']}
    reviewed = {e['entityId']: e for e in review}
    assert len(candidates) == len(reviewed) == len(review) == 25
    assert {c['candidateNativeCanonicalId'] for c in candidates} == set(reviewed)
    docs = {}
    native_differences = []
    for c in candidates:
        entity = facts[c['candidateNativeCanonicalId']]
        r = reviewed[entity['id']]
        assert entity['bookId'] == r['bookId'] == 'blood-angels'
        assert entity['sourceEntityId'] == r['sourceEntityId'] == c['candidateNativeSourceIdentity']
        assert r['status'] == 'PROVEN'
        assert r['native'] == entity['provenance']
        assert len(r['corroboratedProperties']) >= 2, 'Title-only proof is forbidden'
        address, mfm_address = c['native'], c['mfm']
        assert sha(ROOT / address['document']) == address['sha256']
        assert r['mfm']['sha256'] == mfm_address['sha256'] == RAW_SHA
        assert r['mfm']['sourceOwner'] == 'blood-angels'
        assert r['mfm']['version'] == 'v1.6'
        assert r['mfm']['pointer'] == mfm_address['pointer']
        native_dom = docs.setdefault(address['document'], tree(ROOT / address['document']))
        native = native_dom.xpath(address['pointer'])
        official = dom.xpath(mfm_address['pointer'])
        assert len(native) == len(official) == 1
        native, official = native[0], official[0]
        if c['candidateKind'] == 'UNIT':
            source = mfm_unit(official)
            costs, paid = waha_costs(native)
            assert prices_equal(costs, source['pointSchedules'])
            assert paid == source['paidOptions'] == []
            assert native.xpath('.//img[@title="App. Blood Angels (11th edition)"]')
            assert 'BLOOD ANGELS' in entity['data']['factionKeywords']
            assert entity['data']['profileIds'], 'Independent MODEL source ownership missing'
        elif c['candidateKind'] == 'DETACHMENT':
            source = mfm_detachment(official)
            dp = native.xpath('.//*[contains(@class,"dpPts")]')[0]
            assert integer(text(dp)) == source['detachmentPoints']
            categories = [img.get('title').removeprefix('Force Disposition: ') for img in dp.xpath('.//img')]
            assert [norm(v) for v in source['category'].split(';')] == [norm(v) for v in categories]
            children = [facts[k] for k in entity['data']['enhancementIds']]
            expected = []
            for child in children:
                n = native_dom.xpath(child['provenance']['pointer'])[0]
                expected.append((child['id'], integer(text(n.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[last()]')[0])), child['data']['itemKind']))
            actual = []
            for child in candidates:
                e = facts[child['candidateNativeCanonicalId']]
                if child['candidateKind'] != 'ENHANCEMENT' or e.get('parentId') != entity['id']:
                    continue
                n = dom.xpath(child['mfm']['pointer'])[0]
                assert n in official.xpath('.//li')
                kind = 'UNIT_UPGRADE' if re.search(r'\((?:upgrade|upgarde)\)', text(n[0][0]), re.I) else 'ENHANCEMENT'
                actual.append((e['id'], integer(text(n[0][1])), kind))
            assert sorted(actual) == sorted(expected)
            assert native.xpath('./img[@title="App. Blood Angels (11th edition)"]')
        else:
            assert c['candidateKind'] == entity['kind'] == 'ENHANCEMENT'
            parent_c = next(k for k in candidates if k['candidateNativeCanonicalId'] == entity['parentId'])
            parent = dom.xpath(parent_c['mfm']['pointer'])[0]
            assert official in parent.xpath('.//li')
            assert not re.search(r'\((?:upgrade|upgarde)\)', text(official[0][0]), re.I)
            assert entity['data']['itemKind'] == 'ENHANCEMENT'
            assert integer(text(official[0][1])) == integer(text(native.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[last()]')[0]))
    return {'reviewedProvenCandidates': 25, 'titleOnlyMatchingUsed': False,
            'independentPairedOccurrenceChecks': 25, 'nativeForceDispositionDifferences': native_differences}


def source_proof_mutations():
    rows = load(HERE / 'mfm-mapping-review.json')['reviewedBindings']
    for mutation in ['unproven', 'foreign_owner', 'wrong_native_identity', 'wrong_official_occurrence', 'title_only', 'missing_candidate']:
        altered = copy.deepcopy(rows)
        if mutation == 'unproven':
            altered[0]['status'] = 'REFERENCE_ONLY'
        elif mutation == 'foreign_owner':
            altered[0]['mfm']['sourceOwner'] = 'space-marines'
        elif mutation == 'wrong_native_identity':
            altered[0]['sourceEntityId'] = altered[1]['sourceEntityId']
        elif mutation == 'wrong_official_occurrence':
            altered[0]['mfm']['pointer'] = altered[1]['mfm']['pointer']
        elif mutation == 'title_only':
            altered[0]['corroboratedProperties'] = [{'property': 'TITLE_ONLY'}]
        else:
            altered.pop()
        try:
            independent_mapping_review(altered)
        except AssertionError:
            continue
        raise AssertionError('Independent source proof mutation survived: ' + mutation)
    return 6


def shared_parity():
    _, _, nodes, _ = source_oracle()
    sm = load(ROOT / 'mfm/sources/v1.6/space-marines.json')
    source = {u['title']: u for u in sm['units']}
    assert len(source) == len(sm['units'])
    for node in nodes:
        observed = mfm_unit(node)
        expected = source[observed['title']]
        assert prices_equal(observed['pointSchedules'], expected['pointSchedules'])
        expected_paid = [{key: row[key] for key in ['sourceGroup', 'sourceLabel', 'value']}
                         for row in expected.get('paidOptions', [])]
        assert observed['paidOptions'] == expected_paid
    assert len(nodes) == 69
    return 69


def stormlance_source_conflict(facts):
    native_path = HERE / 'sources/raw/wahapedia-blood-angels-main.html'
    native = tree(native_path).xpath('//*[@id="Stormlance-Task-Force"]')
    official = tree(RAW).xpath('/html/body/main/div[2]/div[4]/div/div[14]')
    assert len(native) == len(official) == 1
    native_dp = integer(text(native[0].xpath('.//*[contains(@class,"dpPts")]')[0]))
    official_dp = mfm_detachment(official[0])['detachmentPoints']
    assert (native_dp, official_dp) == (2, 1)
    current = [d for d in facts['detachments'] if d['provenance']['sourceId'] == 'space-marines-mfm-v1.6'
               and d['provenance']['sourceLocator']['sourceTitle'] == 'STORMLANCE TASK FORCE']
    assert len(current) == 1 and current[0]['factionId'] == 'space-marines'
    assert current[0]['detachmentPoints'] == official_dp
    assert not any(d['factionId'] == 'blood-angels' and d['provenance']['sourceLocator']['sourceTitle'] == 'STORMLANCE TASK FORCE'
                   for d in facts['detachments']), 'Shared Stormlance owner duplicated or overridden under BA'
    return {'status': 'SOURCE_CONFLICT', 'nativeDP': native_dp, 'officialDP': official_dp,
            'canonicalOwner': 'space-marines', 'baOverrideCreated': False}


def central_and_projection():
    program = "import {createCanonicalMfmFacts} from './mfm/content/canonical-mfm-facts.mjs'; console.log(JSON.stringify(createCanonicalMfmFacts()));"
    run = subprocess.run(['node', '--input-type=module', '-e', program], cwd=ROOT,
                         capture_output=True, encoding='utf8', check=True)
    facts = json.loads(run.stdout)
    source = next(s for s in facts['sourceSnapshots'] if s['sourceId'] == 'blood-angels-mfm-v1.6')
    capture = load(ROOT / source['sourcePath'])
    assert capture['version'] == 'v1.6'
    for date in ['observedAt', 'verifiedAt', 'currentnessCutoff']:
        assert capture[date] == '2026-10-22'
    assert capture['effectiveDate'] is None
    assert capture['capturedAt'] == '2026-10-22T07:14:15.463Z'
    assert capture['rawArtifacts'][0]['sha256'] == RAW_SHA
    assert capture['rawArtifacts'][0]['bytes'] == RAW.stat().st_size == 506163
    dom, nodes, _, _ = source_oracle()
    expected_units = {text(node[0]): mfm_unit(node) for node in nodes}
    current = [r for r in facts['unitPointRecords'] if r['factionId'] == 'blood-angels' and r['status'] == 'CURRENT']
    assert len(current) == 14, 'Inherited SM prices duplicated under BA owner'
    def check_units(units):
        assert len(units) == 14
        for row in units:
            expected = expected_units[row['provenance']['sourceLocator']['sourceTitle']]
            assert prices_equal(row['pointSchedules'], expected['pointSchedules'])
            assert row['provenance']['sourceId'] == 'blood-angels-mfm-v1.6'
            for schedule in row['pointSchedules']:
                for entry in schedule['entries']:
                    count = integer(entry['sourceLabel'])
                    assert entry['minModels'] == entry['maxModels'] == count
                if '1ST TO 2ND' in schedule['sourceLabel']:
                    assert schedule['minCopies'] == 1 and schedule['maxCopies'] == 2
                elif '3RD' in schedule['sourceLabel']:
                    assert schedule['minCopies'] == 3 and schedule.get('maxCopies') is None
                else:
                    assert 'minCopies' not in schedule and 'maxCopies' not in schedule
        assert sum(len(r['pointSchedules']) for r in units) == 19
        assert sum(len(s['entries']) for r in units for s in r['pointSchedules']) == 25
    check_units(current)
    references = {r['id']: r for r in facts['unitReferences']}
    for role, partition, record_count, edge_count in [('leader', 'leaderEligibilityRecords', 6, 12), ('support', 'supportEligibilityRecords', 1, 8)]:
        relations = [r for r in facts[partition] if r['factionId'] == 'blood-angels' and r['provenance']['sourceId'] == 'blood-angels-mfm-v1.6']
        assert len(relations) == record_count
        assert sum(len(r['targetUnitReferenceIds']) for r in relations) == edge_count
        for relation in relations:
            owner = relation['provenance']['sourceLocator']['sourceTitle']
            labels = [references[k]['provenance']['sourceLocator']['sourceTitle'] for k in relation['targetUnitReferenceIds']]
            assert labels == expected_units[owner]['relations'][role]
    current_reference_only = [r for r in facts['unitReferences'] if r['factionId'] == 'blood-angels'
                              and r['provenance']['sourceId'] == 'blood-angels-mfm-v1.6'
                              and r['provenance']['sourceLocator']['partition'] == 'relationTargets']
    assert current_reference_only and all(r['armyBinding']['bindingStatus'] == 'REFERENCE_ONLY' for r in current_reference_only)
    assert all(not r['armyBinding'].get('armyUnitId') and r['armyBinding'].get('reason') for r in current_reference_only)
    historic = [r for r in facts['unitPointRecords'] if r['factionId'] == 'blood-angels' and r['status'] == 'LEGENDS']
    assert len(historic) == 10 and all(r['provenance']['sourceVersion'] != 'v1.6' for r in historic)
    dets = [r for r in facts['detachments'] if r['factionId'] == 'blood-angels' and r['provenance']['sourceId'] == 'blood-angels-mfm-v1.6']
    costs = [r for r in facts['enhancementCosts'] if r['factionId'] == 'blood-angels' and r['provenance']['sourceId'] == 'blood-angels-mfm-v1.6']
    assert len(dets) == 3 and len(costs) == 8
    det_source = {text(node[0][0]): mfm_detachment(node) for node in dom.xpath('/html/body/main/div[2]/div[4]/div/div')}
    for row in dets:
        expected = det_source[row['provenance']['sourceLocator']['sourceTitle']]
        assert row['detachmentPoints'] == expected['detachmentPoints']
        own_costs = [cost for cost in costs if cost['detachmentId'] == row['id']]
        assert sorted(cost['id'] for cost in own_costs) == sorted(row['enhancementCostIds'])
        assert sorted((cost['provenance']['sourceLocator']['sourceTitle'], cost['value']) for cost in own_costs) == sorted((cost['title'], cost['value']) for cost in expected['enhancements'])
    review = load(HERE / 'mfm-mapping-review.json')
    central_by_id = {r['id']: r for partition in ['unitPointRecords', 'detachments', 'enhancementCosts', 'paidUpgradeRecords'] for r in facts[partition]}
    bindings = load(HERE / 'mfm-bindings.json')
    for key, count in [('unitBindings', 14), ('detachmentBindings', 3), ('enhancementBindings', 8)]:
        assert len(bindings[key]) == count
        for row in bindings[key]:
            assert row['entityId'] in {r['entityId'] for r in review['reviewedBindings']}
            central = central_by_id[row['mfmRecordId']]
            assert central['factionId'] == 'blood-angels'
            assert central['provenance']['sourceId'] == 'blood-angels-mfm-v1.6'
    model = load(HERE / 'generated/native-mfm-book.json')
    base = load(HERE / 'generated/effective.json')
    assert model['entities'] == base['entities'], 'MFM changed native source-owned facts'
    payload = load(HERE / 'generated/mfm-presentation.json')
    serialized = json.dumps(payload)
    assert payload['relationsActivated'] is False
    assert not any(r['paidWargear'] for r in payload['units'])
    assert 'v1.4' not in serialized, 'Stale prices exposed in new BA projection'
    def check_payload(value):
        assert value['counts'] == {'units': 14, 'detachments': 3, 'enhancements': 8, 'pricedOptions': 0}
        def flattened(source_unit):
            rows = []
            for schedule in source_unit['pointSchedules']:
                for entry in schedule['entries']:
                    count = integer(entry['sourceLabel'])
                    row = {'sourceLabel': entry['sourceLabel'], 'value': entry['value'], 'minModels': count, 'maxModels': count}
                    if '1ST TO 2ND' in schedule['sourceLabel']:
                        row.update(minCopies=1, maxCopies=2)
                    elif '3RD' in schedule['sourceLabel']:
                        row.update(minCopies=3)
                    rows.append(row)
            return rows
        unit_binding = {r['entityId']: r for r in bindings['unitBindings']}
        assert len(value['units']) == len(unit_binding)
        for unit in value['units']:
            binding = unit_binding[unit['id']]
            assert unit['unitId'] == unit['id'] and unit['mfmRecordId'] == binding['mfmRecordId']
            raw_expected = expected_units[central_by_id[binding['mfmRecordId']]['provenance']['sourceLocator']['sourceTitle']]
            selected = [{key: row[key] for key in ['sourceLabel', 'value', 'minModels', 'maxModels', 'minCopies', 'maxCopies'] if key in row} for row in unit['points']]
            assert selected == flattened(raw_expected), 'Projected numeric/model/copy tier differs from independent RAW oracle'
            assert [(r['value']) for r in unit['paidWargear']] == [r['value'] for r in raw_expected['paidOptions']]
        det_binding = {r['entityId']: r for r in bindings['detachmentBindings']}
        for det in value['detachments']:
            binding = det_binding[det['id']]
            central = central_by_id[binding['mfmRecordId']]
            expected = det_source[central['provenance']['sourceLocator']['sourceTitle']]
            assert det['mfmRecordId'] == central['id'] and det['detachmentPoints'] == expected['detachmentPoints']
            assert [norm(v) for v in det['forceDispositions']] == [norm(v) for v in expected['category'].split(';')]
            assert sorted(q['label'] for q in det['mfmQualifiers']) == sorted(expected['qualifiers'])
        enh_binding = {r['entityId']: r for r in bindings['enhancementBindings']}
        for enhancement in value['enhancements']:
            binding = enh_binding[enhancement['id']]
            central = central_by_id[binding['mfmRecordId']]
            assert enhancement['value'] == central['value']
            assert enhancement['mfmRecordId'] == central['id']
            assert enhancement['detachmentId'] == central['armyDetachmentId']
            assert enhancement['canonicalEnhancementId'] == enhancement['id']
    check_payload(payload)
    # Numeric checks are sensitive to changed tiers, duplicated shared owners,
    # stale authority and missing rows; these are not implementation-mirror tests.
    mutations = 0
    for change in ['price', 'missing_row', 'stale_source', 'shared_duplicate']:
        value = copy.deepcopy(current)
        if change == 'price':
            value[0]['pointSchedules'][0]['entries'][0]['value'] += 1
        elif change == 'missing_row':
            value[0]['pointSchedules'][0]['entries'].pop()
        elif change == 'stale_source':
            value[0]['provenance']['sourceId'] = 'blood-angels-mfm-v1.4'
        else:
            value.append(copy.deepcopy(value[0]))
        try:
            check_units(value)
        except AssertionError:
            mutations += 1
        else:
            raise AssertionError('Numeric/source mutation survived: ' + change)
    for change in ['projected_price', 'copy_tier', 'wrong_physical_owner', 'enhancement_parent']:
        value = copy.deepcopy(payload)
        if change == 'projected_price':
            value['units'][0]['points'][0]['value'] += 1
        elif change == 'copy_tier':
            next(unit for unit in value['units'] if any('minCopies' in p for p in unit['points']))['points'][0]['minCopies'] = 9
        elif change == 'wrong_physical_owner':
            value['units'][0]['unitId'] = value['units'][1]['unitId']
        else:
            value['enhancements'][0]['detachmentId'] = 'wrong-detachment'
        try:
            check_payload(value)
        except AssertionError:
            mutations += 1
        else:
            raise AssertionError('Projection mutation survived: ' + change)
    return {'currentUnits': 14, 'schedules': 19, 'rows': 25, 'detachments': 3,
            'stormlanceSourceConflict': stormlance_source_conflict(facts),
            'enhancementsAndUpgrades': 8, 'historicalLegends': 10, 'mutationControls': mutations}


def binding_mutations():
    program = r"""
      import assert from 'node:assert/strict';
      import fs from 'node:fs';
      import {consumeMfm} from './books/blood-angels/v2/mfm-boundary.mjs';
      const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
      const entities=read('books/blood-angels/v2/generated/effective.json').entities;
      const bindings=read('books/blood-angels/v2/mfm-bindings.json');
      consumeMfm(entities,{bindings});
      const mutations=[
        b=>{b.unitBindings[0].entityId=b.unitBindings[1].entityId;},
        b=>{b.unitBindings[0].bookId='space-marines';},
        b=>{b.unitBindings.push(structuredClone(b.unitBindings[0]));},
        b=>{b.unitBindings[0].mfmRecordId='mfm-unit-points-unproven';},
        b=>{b.unitBindings[0].sourceEntityId='ba-source-unproven';},
      ];
      for(const mutation of mutations){const value=structuredClone(bindings);mutation(value);assert.throws(()=>consumeMfm(entities,{bindings:value}));}
      const wrong=structuredClone(entities);wrong.find(e=>e.id===bindings.unitBindings[0].entityId).bookId='space-marines';
      assert.throws(()=>consumeMfm(wrong,{bindings}));
      console.log(JSON.stringify({bindingMutationControls:mutations.length+1}));
    """
    run = subprocess.run(['node', '--input-type=module', '-e', program], cwd=ROOT,
                         capture_output=True, encoding='utf8', check=True)
    return json.loads(run.stdout)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-only', action='store_true')
    args = parser.parse_args()
    result = independent_mapping_review()
    result['sharedSMSourceParity'] = shared_parity()
    result['sourceProofMutationControls'] = source_proof_mutations()
    result['mixedOwnerRuntimeCertified'] = False
    if not args.source_only:
        result.update(central_and_projection())
        result.update(binding_mutations())
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf8')
    main()
