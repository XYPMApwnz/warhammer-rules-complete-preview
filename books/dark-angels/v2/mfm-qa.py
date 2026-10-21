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
RAW = HERE / 'sources/raw/mfm-da-hydrated.html'
RAW_SHA = '1D62A03EB40A56D0FF68CDDF735201453D1E52C2C72E9DDCE4482CCEB98CA566'


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
              'category': text(node[1]), 'enhancements': [],
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


def reviewed_lazarus_leaders(native, official):
    """Compare the two pinned occurrences, not a title-based canonical join."""
    headings = native.xpath('.//div[contains(@class,"dsHeader") and normalize-space()="LEADER"]')
    assert len(headings) == 1, 'Ambiguous Lazarus Leader source section'
    body = headings[0].getnext()
    links = body.xpath('./ul/li/a')
    army = [{'label': text(link), 'href': link.get('href'),
             'pointer': link.getroottree().getpath(link)} for link in links]
    labels = [row['label'] for row in army]
    expected = official['relations']['leader']
    assert len(labels) == len(set(labels)) == 7
    assert sorted(labels) == sorted(expected), 'RAW/MFM Lazarus Leader permissions disagree'
    assert 'COMPANY HEROES' in labels and 'HELLBLASTER SQUAD' not in labels
    assert all(row['href'].startswith('/wh40k11ed/factions/space-marines/datasheets.html#') for row in army)
    return {'property': 'INDEPENDENT_EXACT_LEADER_RECIPIENT_CONSENSUS',
            'armySourceLinks': army, 'officialLeaderLabels': expected,
            'canonicalIdentityPolicy': 'SOURCE_HREF_TARGETS_ONLY; NOT_LABEL_MATCHING'}


def make_review():
    dom, own_nodes, shared_nodes, det_nodes = source_oracle()
    assert len(own_nodes) == 16 and len(shared_nodes) == 69
    own = [mfm_unit(n) for n in own_nodes]
    assert sum(len(u['pointSchedules']) for u in own) == 22
    assert sum(len(s['entries']) for u in own for s in u['pointSchedules']) == 28
    boundary = load(HERE / 'mfm-boundary.json')
    assert len(boundary['identityCandidates']) == 27
    facts = {e['id']: e for e in load(HERE / 'generated/base.json')['entities']}
    docs, rows = {}, []
    for c in boundary['identityCandidates']:
        entity = facts[c['candidateNativeCanonicalId']]
        assert entity['bookId'] == 'dark-angels'
        assert entity['sourceEntityId'] == c['candidateNativeSourceIdentity']
        address = c['candidateNativeSourceAddress']
        path = ROOT / address['document']
        assert sha(path) == address['sha256']
        native_dom = docs.setdefault(address['document'], tree(path))
        native = native_dom.xpath(address['pointer'])
        official = dom.xpath(c['sourcePointer'])
        assert len(native) == len(official) == 1, 'Ambiguous source address'
        native, official = native[0], official[0]
        properties, caveats = [], []
        if c['kind'] == 'UNIT':
            source = mfm_unit(official)
            costs, paid = waha_costs(native)
            assert prices_equal(costs, source['pointSchedules']), 'Independent numeric schedules disagree'
            assert paid == source['paidOptions'], 'Independent paid options disagree'
            assert native.xpath('.//img[@title="App. Dark Angels (11th edition)"]')
            assert 'DARK ANGELS' in entity['data']['factionKeywords']
            properties = [
                {'property': 'DA_APP_AND_FACTION_OWNERSHIP', 'officialGroup': 'UNITS',
                 'nativePublication': 'App. Dark Angels (11th edition)', 'nativeFaction': 'DARK ANGELS'},
                {'property': 'INDEPENDENT_COMPLETE_MODEL_COPY_PRICE_TIERS',
                 'official': source['pointSchedules'], 'secondary': costs},
                {'property': 'EXACT_PAIRED_PERSISTENT_SOURCE_OCCURRENCE',
                 'sourceAnchor': entity['data']['sourceAnchor'], 'modelProfileIds': entity['data']['profileIds']},
            ]
            if paid:
                properties.append({'property': 'PAID_EQUIPMENT_SOURCE_PARITY', 'official': paid, 'secondary': paid})
            if entity['id'] == 'unit-da-efa93d33ea414d8b8f11':
                properties.append(reviewed_lazarus_leaders(native, source))
        elif c['kind'] == 'DETACHMENT':
            source = mfm_detachment(official)
            dp = native.xpath('.//*[contains(@class,"dpPts")]')[0]
            assert integer(text(dp)) == source['detachmentPoints']
            native_category = dp.xpath('.//img')[0].get('title').removeprefix('Force Disposition: ')
            assert norm(native_category) == norm(source['category'])
            children = [facts[key] for key in entity['data']['enhancementIds']]
            expected = []
            for child in children:
                p = child['provenance']; n = native_dom.xpath(p['pointer'])[0]
                price = n.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[last()]')[0]
                expected.append((child['data']['title'], integer(text(price)), child['data']['itemKind']))
            # Explicit already-reviewed occurrence pairs, never a global title alias.
            candidates = [k for k in boundary['identityCandidates'] if k['kind'] == 'ENHANCEMENT_OR_UPGRADE'
                          and facts[k['candidateNativeCanonicalId']].get('parentId') == entity['id']]
            actual = []
            for child in candidates:
                entry = dom.xpath(child['sourcePointer'])[0]
                e = facts[child['candidateNativeCanonicalId']]
                raw_name = text(entry[0][0])
                item_kind = 'UNIT_UPGRADE' if re.search(r'\((?:upgrade|upgarde)\)', raw_name, re.I) else 'ENHANCEMENT'
                assert entry in official.xpath('.//li')
                actual.append((e['data']['title'], integer(text(entry[0][1])), item_kind))
            assert sorted(actual) == sorted(expected)
            properties = [
                {'property': 'DETACHMENT_DP_AND_FORCE_DISPOSITION', 'officialDP': source['detachmentPoints'],
                 'secondaryDP': integer(text(dp)), 'officialCategory': source['category'], 'secondaryCategory': native_category},
                {'property': 'EXACT_CHILD_COST_AND_ITEM_KIND_SET', 'officialPairedChildren': sorted(actual),
                 'secondaryChildren': sorted(expected)},
                {'property': 'DA_APP_OWNERSHIP', 'publication': 'App. Dark Angels (11th edition)'},
            ]
        else:
            assert entity['kind'] == 'ENHANCEMENT'
            parent = facts[entity['parentId']]
            parent_c = next(k for k in boundary['identityCandidates'] if k['candidateNativeCanonicalId'] == parent['id'])
            official_parent = dom.xpath(parent_c['sourcePointer'])[0]
            assert official in official_parent.xpath('.//li')
            source_name = text(official[0][0])
            official_kind = 'UNIT_UPGRADE' if re.search(r'\((?:upgrade|upgarde)\)', source_name, re.I) else 'ENHANCEMENT'
            native_kind = 'UNIT_UPGRADE' if native.xpath('.//*[contains(@class,"EnhUpgrade")]') else 'ENHANCEMENT'
            assert official_kind == native_kind == entity['data']['itemKind']
            cost = integer(text(official[0][1]))
            secondary_cost = integer(text(native.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[last()]')[0]))
            assert cost == secondary_cost
            properties = [
                {'property': 'INDEPENDENT_DETACHMENT_PARENT_MEMBERSHIP', 'nativeParentId': parent['id'],
                 'officialParentPointer': parent_c['sourcePointer']},
                {'property': 'SOURCE_ITEM_KIND', 'official': official_kind, 'secondary': native_kind},
                {'property': 'INDEPENDENT_NUMERIC_COST', 'official': cost, 'secondary': secondary_cost},
            ]
            if 'Upgarde' in source_name:
                caveats.append('Official MFM source preserves literal Upgarde spelling; no canonical identity rename or alias was created.')
        rows.append({'entityId': entity['id'], 'sourceEntityId': entity['sourceEntityId'], 'bookId': 'dark-angels',
                     'candidateKind': c['kind'], 'sourceTitle': c['sourceTitle'], 'status': 'PROVEN',
                     'proofPolicy': 'EXPLICIT_PAIRED_OCCURRENCE_PLUS_INDEPENDENT_STRUCTURAL_AND_NUMERIC_PROPERTIES_NOT_TITLE_MATCH',
                     'native': entity['provenance'],
                     'mfm': {'document': RAW.relative_to(ROOT).as_posix(), 'sha256': RAW_SHA,
                             'pointer': c['sourcePointer'], 'sourceOwner': 'dark-angels', 'version': 'v1.6'},
                     'corroboratedProperties': properties, 'limitations': caveats})
    assert len(rows) == 27 and len({r['entityId'] for r in rows}) == 27
    return {'schema': 'dark-angels-v2-mfm-source-mapping-review/v1', 'reviewedAt': '2026-10-21',
            'authority': 'OFFICIAL_MFM_WITH_ACCEPTED_SECONDARY_CODEX_STRUCTURAL_CORROBORATION',
            'sourceCompleteness': 'PARTIAL', 'gameplayRuntimeCertified': False,
            'reviewedBindings': rows}


def leader_review_mutations():
    candidate = next(row for row in load(HERE / 'mfm-boundary.json')['identityCandidates']
                     if row['candidateNativeCanonicalId'] == 'unit-da-efa93d33ea414d8b8f11')
    address = candidate['candidateNativeSourceAddress']
    native = tree(ROOT / address['document']).xpath(address['pointer'])[0]
    official = mfm_unit(tree(RAW).xpath(candidate['sourcePointer'])[0])
    reviewed_lazarus_leaders(native, official)
    for mutation in ['missing_company_heroes', 'substituted_hellblaster', 'foreign_href']:
        changed = copy.deepcopy(native)
        links = changed.xpath('.//div[contains(@class,"dsHeader") and normalize-space()="LEADER"]')[0].getnext().xpath('./ul/li/a')
        company = next(link for link in links if text(link) == 'COMPANY HEROES')
        if mutation == 'missing_company_heroes':
            company.getparent().remove(company)
        elif mutation == 'substituted_hellblaster':
            company.clear()
            company.text = 'HELLBLASTER SQUAD'
        else:
            company.set('href', 'https://invalid.example/#Company-Heroes')
        try:
            reviewed_lazarus_leaders(changed, official)
        except AssertionError:
            continue
        raise AssertionError('Lazarus source review mutation survived: ' + mutation)
    return 3


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


def central_and_projection():
    program = "import {createCanonicalMfmFacts} from './mfm/content/canonical-mfm-facts.mjs'; console.log(JSON.stringify(createCanonicalMfmFacts()));"
    run = subprocess.run(['node', '--input-type=module', '-e', program], cwd=ROOT,
                         capture_output=True, encoding='utf8', check=True)
    facts = json.loads(run.stdout)
    source = next(s for s in facts['sourceSnapshots'] if s['sourceId'] == 'dark-angels-mfm-v1.6')
    capture = load(ROOT / source['sourcePath'])
    assert capture['version'] == 'v1.6'
    for date in ['observedAt', 'verifiedAt', 'currentnessCutoff']:
        assert capture[date] == '2026-10-21'
    assert capture['effectiveDate'] is None
    dom, nodes, _, _ = source_oracle()
    expected_units = {text(node[0]): mfm_unit(node) for node in nodes}
    current = [r for r in facts['unitPointRecords'] if r['factionId'] == 'dark-angels' and r['status'] == 'CURRENT']
    assert len(current) == 16, 'Inherited SM prices duplicated under DA owner'
    def check_units(units):
        assert len(units) == 16
        for row in units:
            expected = expected_units[row['provenance']['sourceLocator']['sourceTitle']]
            assert prices_equal(row['pointSchedules'], expected['pointSchedules'])
            assert row['provenance']['sourceId'] == 'dark-angels-mfm-v1.6'
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
        assert sum(len(r['pointSchedules']) for r in units) == 22
        assert sum(len(s['entries']) for r in units for s in r['pointSchedules']) == 28
    check_units(current)
    historic = [r for r in facts['unitPointRecords'] if r['factionId'] == 'dark-angels' and r['status'] == 'LEGENDS']
    assert len(historic) == 3 and all(r['provenance']['sourceVersion'] != 'v1.6' for r in historic)
    dets = [r for r in facts['detachments'] if r['factionId'] == 'dark-angels' and r['provenance']['sourceId'] == 'dark-angels-mfm-v1.6']
    costs = [r for r in facts['enhancementCosts'] if r['factionId'] == 'dark-angels' and r['provenance']['sourceId'] == 'dark-angels-mfm-v1.6']
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
    for key, count in [('unitBindings', 16), ('detachmentBindings', 3), ('enhancementBindings', 8)]:
        assert len(bindings[key]) == count
        for row in bindings[key]:
            assert row['entityId'] in {r['entityId'] for r in review['reviewedBindings']}
            central = central_by_id[row['mfmRecordId']]
            assert central['factionId'] == 'dark-angels'
            assert central['provenance']['sourceId'] == 'dark-angels-mfm-v1.6'
    model = load(HERE / 'generated/native-mfm-book.json')
    base = load(HERE / 'generated/effective.json')
    assert model['entities'] == base['entities'], 'MFM changed native source-owned facts'
    payload = load(HERE / 'generated/mfm-presentation.json')
    serialized = json.dumps(payload)
    assert 'v1.4' not in serialized, 'Stale prices exposed in new DA projection'
    def check_payload(value):
        assert value['counts'] == {'units': 16, 'detachments': 3, 'enhancements': 8, 'pricedOptions': 1}
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
            assert norm(det['forceDisposition']) == norm(expected['category'])
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
            value[0]['provenance']['sourceId'] = 'dark-angels-mfm-v1.4'
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
    return {'currentUnits': 16, 'schedules': 22, 'rows': 28, 'detachments': 3,
            'enhancementsAndUpgrades': 8, 'historicalLegends': 3, 'mutationControls': mutations}


def binding_mutations():
    program = r"""
      import assert from 'node:assert/strict';
      import fs from 'node:fs';
      import {consumeMfm} from './books/dark-angels/v2/mfm-boundary.mjs';
      const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
      const entities=read('books/dark-angels/v2/generated/effective.json').entities;
      const bindings=read('books/dark-angels/v2/mfm-bindings.json');
      consumeMfm(entities,{bindings});
      const mutations=[
        b=>{b.unitBindings[0].entityId=b.unitBindings[1].entityId;},
        b=>{b.unitBindings[0].bookId='space-marines';},
        b=>{b.unitBindings.push(structuredClone(b.unitBindings[0]));},
        b=>{b.unitBindings[0].mfmRecordId='mfm-unit-points-unproven';},
        b=>{b.unitBindings[0].sourceEntityId='da-source-unproven';},
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
    parser.add_argument('--write-review', action='store_true')
    parser.add_argument('--source-only', action='store_true')
    args = parser.parse_args()
    review = json.loads(json.dumps(make_review(), ensure_ascii=False))
    output = HERE / 'mfm-mapping-review.json'
    if args.write_review:
        output.write_bytes((json.dumps(review, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
    assert load(output) == review, 'Source review no longer matches independent pinned RAW evidence'
    shared = shared_parity()
    result = {'reviewedProvenCandidates': len(review['reviewedBindings']), 'sharedSMSourceParity': shared,
              'titleOnlyMatchingUsed': False, 'mixedOwnerRuntimeCertified': False,
              'lazarusSourceConsensus': 7, 'lazarusSourceMutationControls': leader_review_mutations()}
    if not args.source_only:
        result.update(central_and_projection())
        result.update(binding_mutations())
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf8')
    main()
