"""Independent accepted-HTML oracle for Tyranids V2 factual completeness.

Corpus entries supply source addresses only; expected gameplay values are read
from the frozen HTML. No legacy parser, producer or generated data supplies the
oracle. The comparator is also exercised against in-memory corruptions.
"""
from __future__ import annotations
import copy
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from lxml import html

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = ROOT / 'books/tyranids/sources/waha-11e-current-2026-09-27'
norm = lambda value: ' '.join(value.split())
read = lambda path: json.loads(path.read_text(encoding='utf-8'))
css = lambda token: 'contains(concat(" ",normalize-space(@class)," ")," '+token+' ")'


def body(node, headings=False):
    node = copy.deepcopy(node)
    selector = './/script|.//style|.//*['+' or '.join(css(x) for x in ['ShowFluff', 'faqErrataSpoiler', 'faqErrataStrat'])+']'
    if headings:
        selector += '|.//h2|.//h3'
    for unwanted in node.xpath(selector):
        parent = unwanted.getparent()
        if parent is None:
            continue
        previous, tail = unwanted.getprevious(), unwanted.tail or ''
        if previous is not None:
            previous.tail = (previous.tail or '') + tail
        else:
            parent.text = (parent.text or '') + tail
        parent.remove(unwanted)
    for br in node.xpath('.//br'):
        br.tail = '\n' + (br.tail or '')
    for li in node.xpath('.//li'):
        li.text = '\n- ' + (li.text or '')
        li.tail = '\n' + (li.tail or '')
    return '\n'.join(norm(line) for line in ''.join(node.itertext()).splitlines() if norm(line))


def raw_oracle():
    corpus = read(SOURCE / 'corpus.json')
    rows = []
    def add(source_id, kind, owner, data, document):
        rows.append({'sourceId': source_id, 'kind': kind, 'ownerSourceId': owner,
                     'data': data, 'document': str(document.relative_to(ROOT)).replace('\\', '/'),
                     'sourceAuthorityId': 'tyranids-waha-11e-2026-09-27',
                     'sha256': hashlib.sha256(document.read_bytes()).hexdigest().upper()})
    hub_path = SOURCE / 'tyranids.html'
    tree = html.fromstring(hub_path.read_text(encoding='utf-8'))
    raw_filters = [node.get('data-f') for node in tree.xpath('//label['+css('DetFilterItem')+' and @data-f and not(contains(@class,"dropShowBoardingActions"))]')]
    if len(raw_filters) != len(set(raw_filters)) or set(raw_filters) != {r['filterId'] for r in corpus['detachments']}:
        raise ValueError('Missing/extra raw Detachment source address')
    pages = read(SOURCE/'pages.json')
    raw_unit_urls = {page['url'] for page in pages}
    if raw_unit_urls != {unit['url'] for unit in corpus['datasheets']}:
        raise ValueError('Missing/extra raw datasheet source address')
    if {page['file'] for page in pages} | {'tyranids.html'} != {p.name for p in SOURCE.glob('*.html')}:
        raise ValueError('Unaccounted raw HTML page')
    for address in corpus['armyRules']:
        heading, = tree.xpath('//*[@id=$anchor]', anchor=address['title'].replace(' ', '-'))
        text = body(heading.getparent(), headings=True)
        add(address['sourceId'], 'ARMY_RULE', None, {'title': norm(heading.text_content())}, hub_path)
        component, = address['components']
        add(component['sourceId'], 'ARMY_RULE_COMPONENT', address['sourceId'],
            {'title': norm(heading.text_content()), 'text': text}, hub_path)
    for address in corpus['detachments']:
        source_id = address['sourceId']
        label, = tree.xpath('//label['+css('DetFilterItem')+' and @data-f=$filter]', filter=address['filterId'])
        add(source_id, 'DETACHMENT', None, {'title': label.get('data-det-name')}, hub_path)
        rule_heading, = tree.xpath('//div[@data-f=$filter]//h2[starts-with(@id,"Detachment-Rule")]', filter=address['filterId'])
        node = rule_heading.getparent().getnext()
        order = 0
        while node is not None and not node.xpath('self::h2|.//h2'):
            for heading in node.xpath('self::h3|.//h3'):
                if heading.xpath('ancestor::*['+css('faqErrataSpoiler')+']'):
                    continue
                order += 1
                anchor = heading.get('id') or next(iter(heading.xpath('preceding-sibling::a[1]/@name')), None)
                identity = source_id+':rule' if order == 1 else source_id+':rule:vanguard-prime'
                if order > 1 and anchor != 'Vanguard-Prime':
                    raise ValueError('Unbound additional raw Detachment rule: '+str(anchor))
                add(identity, 'DETACHMENT_RULE', source_id,
                    {'title': norm(heading.text_content()), 'text': body(heading.getparent(), headings=True)}, hub_path)
            node = node.getnext()
        wraps = tree.xpath('//div[@data-f=$filter]', filter=address['filterId'])
        enhancements = [n for wrap in wraps for n in wrap.xpath('.//ul[contains(@class,"EnhancementsPts")]/..')]
        for index, node in enumerate(enhancements, 1):
            name, = node.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[1]')
            title = norm(''.join(name.xpath('./text()'))) or norm(name.text_content())
            paragraphs = node.xpath('.//p[not(contains(@class,"ShowFluff"))]')
            add(source_id+':enhancement:'+str(index), 'ENHANCEMENT', source_id,
                {'title': title, 'text': '\n'.join(body(p) for p in paragraphs if body(p))}, hub_path)
        strata = [n for wrap in wraps for n in wrap.xpath('.//div['+css('str11Wrap')+' and not(contains(@class,"sShowBoardingActions"))]')]
        for index, node in enumerate(strata, 1):
            value = lambda token: norm(node.xpath('.//*['+css(token)+']')[0].text_content())
            text = body(node.xpath('.//*['+css('str11Text')+']')[0])
            markers = list(re.finditer(r'(?i)(WHEN|TARGET|EFFECT|RESTRICTIONS?):\s*', text))
            lines = [{'label': marker[1].upper(), 'text': norm(text[marker.end():markers[i+1].start() if i+1<len(markers) else len(text)])}
                     for i, marker in enumerate(markers)]
            add(source_id+':stratagem:'+str(index), 'STRATAGEM', source_id,
                {'title': value('str11Name'), 'cp': value('str11CP'), 'category': value('str11Type'), 'lines': lines}, hub_path)
    for address in corpus['datasheets']:
        page, = [p for p in corpus['pages'] if p['url'] == address['url']]
        document = SOURCE / page['file']
        tree = html.fromstring(document.read_text(encoding='utf-8'))
        frame, = tree.xpath('//div['+css('dsOuterFrame')+' and '+css('datasheet')+']')
        main, = frame.xpath('./div['+css('ds2col')+' and not(contains(@class,"ShowDatasheetFeatures"))]')
        source_id = address['sourceId']
        title, = frame.xpath('./div[contains(@class,"dsBannerWrap")]//*[contains(@class,"dsH2Header")]/div[1]')
        kwbox, = frame.xpath('./div['+css('ds2colKWFlat')+']')
        left, right = kwbox.xpath('./div')
        keyword_node = copy.deepcopy(left)
        for separator in keyword_node.xpath('.//*['+css('dsVertLine')+']'):
            separator.tail = ' SCOPEBREAK '+(separator.tail or '')
        raw_keywords = re.sub(r'^KEYWORDS(?:\s*(?:–|-)\s*ALL MODELS)?\s*:\s*', '', norm(keyword_node.text_content()), flags=re.I)
        scoped = re.search(r'\s*SCOPEBREAK\s+([A-Z][A-Z \-]+):\s*(.+)$', raw_keywords)
        common = raw_keywords[:scoped.start()].strip() if scoped else raw_keywords
        split = lambda value: [norm(x) for x in re.split(r'[;,]', value) if norm(x)]
        groups = [{'scope': 'ALL MODELS', 'keywords': split(common)}]
        if scoped:
            groups.append({'scope': norm(scoped[1]), 'keywords': split(scoped[2])})
        keywords = groups[0]['keywords']+[g['scope']+': '+x for g in groups[1:] for x in g['keywords']]
        faction = split(re.sub(r'^FACTION KEYWORDS:\s*', '', norm(right.text_content()), flags=re.I))
        add(source_id, 'DATASHEET', None, {'title': norm(title.text_content()), 'keywords': keywords,
            'factionKeywords': faction, 'keywordGroups': groups}, document)
        for index, profile in enumerate(frame.xpath('.//*['+css('dsProfileBaseWrap')+']'), 1):
            values = [norm(x.text_content()) for x in profile.xpath('.//*['+css('dsCharValue')+']')]
            names = profile.xpath('./div['+css('dsProfileWrapRight')+']')
            name = re.sub(r'\s*\([^)]*\)\s*$', '', norm(names[0].text_content()) if names else '') or norm(title.text_content())
            stats = dict(zip(['M', 'T', 'SV', 'W', 'LD', 'OC'], values))
            panels = profile.xpath('.//*['+css('dsInvulWrap')+']')
            if not panels:
                panels = profile.getparent().xpath('./*['+css('dsInvulWrap')+']')
            if panels:
                invs = [norm(x.text_content()) for panel in panels for x in panel.xpath('.//*['+css('dsCharInvulValue')+']')]
                if len(set(invs)) != 1:
                    raise ValueError('Ambiguous raw Invulnerable Save')
                stats['INSV'] = invs[0]
            add(source_id+':profile:'+str(index), 'MODEL_PROFILE', source_id, {'name': name, 'stats': stats}, document)
        for index, weapon in enumerate(main.xpath('.//tr['+css('dsWeaponRow')+']'), 1):
            cells = weapon.xpath('./td')
            if len(cells) != 8:
                raise ValueError('Unknown raw weapon row shape')
            names = cells[1].xpath('.//*['+css('dsWeaponName')+']')
            name = norm(names[0].text_content()) if names else norm(cells[1].text_content())
            values = [norm(x.text_content()) for x in cells[2:8]]
            abilities = list(dict.fromkeys(norm(x.text_content()) for x in cells[1].xpath('.//*['+css('kwbw')+']') if norm(x.text_content())))
            data = dict(zip(['range', 'attacks', 'skill', 'strength', 'ap', 'damage'], values))
            data.update({'name': name, 'mode': 'melee' if values[0].lower() == 'melee' else 'ranged', 'abilities': abilities})
            add(source_id+':weapon:'+str(index), 'WEAPON_PROFILE', source_id, data, document)
        for ability in main.xpath('.//*['+css('dsAbility')+']'):
            text = body(ability)
            if source_id == 'datasheet-norn-assimilator' and text.startswith('Harpooned:'):
                add(source_id+':weapon:1:ability:harpooned', 'WEAPON_ABILITY', source_id+':weapon:1',
                    {'title': 'Harpooned', 'text': text}, document)
        options = main.xpath('.//div['+css('dsWargearOptionsList')+']/ul/li')+main.xpath('.//*['+css('dsOptionsComment')+']')
        for index, option in enumerate(options, 1):
            add(source_id+':wargear:'+str(index), 'WARGEAR_OPTION', source_id, {'text': body(option)}, document)
        references = []
        for cell in main.xpath('.//td['+css('dsCoreArmyValue')+']'):
            candidates = cell.xpath('./b/span[contains(@class,"tooltip")]') or cell.xpath('./span[contains(@class,"tooltip")]')
            references.extend(norm(x.text_content()) for x in candidates) if candidates else references.extend(x for x in re.split(r'\s*,\s*', norm(cell.text_content())) if x)
        for index, label in enumerate(references, 1):
            add(source_id+':rule-reference:'+str(index), 'RULE_REFERENCE', source_id, {'label': label}, document)
        for header in main.xpath('.//div['+css('dsHeader')+']'):
            heading = norm(header.text_content())
            addresses = [x for x in address['sections'] if x['title'] == heading]
            if not addresses:
                if heading in ['RANGED WEAPONS', 'MELEE WEAPONS', 'RANGE', 'A', 'BS', 'WS', 'S', 'AP', 'D', 'WARGEAR OPTIONS']:
                    continue
                raise ValueError('Unbound raw datasheet section: '+source_id+'/'+heading)
            section, = addresses
            blocks, sibling = [], header.getnext()
            while sibling is not None and 'dsHeader' not in (sibling.get('class') or '').split():
                text = body(sibling)
                if text and not (heading.upper() == 'UNIT COMPOSITION' and text.upper().startswith('YOUR ')):
                    blocks.append({'text': text, 'wargearAbility': heading == 'WARGEAR ABILITIES' or 'dsWargearAbility' in (sibling.get('class') or '').split()})
                sibling = sibling.getnext()
            add(section['sourceId'], 'DATASHEET_SECTION', source_id, {'title': heading, 'blocks': blocks}, document)
            if heading == 'UNIT COMPOSITION':
                members = [line for block in blocks for line in block['text'].splitlines() if re.match(r'^- \d', line)]
                for index, line in enumerate(members, 1):
                    quantity = re.match(r'^- (\d+)(?:-(\d+))? (.+)$', line)
                    if quantity is None:
                        raise ValueError('Unparsed raw physical composition: '+line)
                    add(section['sourceId']+':member:'+str(index), 'COMPOSITION_MEMBER', source_id,
                        {'sourceText': line, 'quantity': {'min': int(quantity[1]), 'max': int(quantity[2] or quantity[1])}}, document)
    return rows


def compare(records, oracle, bindings):
    errors = []
    identities = {x['sourceEntityId']: x for x in bindings}
    binding_counts = Counter(x['sourceEntityId'] for x in bindings)
    errors.extend('duplicate-source-binding:'+key for key, count in binding_counts.items() if count != 1)
    counts = Counter(x['id'] for x in records)
    errors.extend('duplicate:'+key for key, count in counts.items() if count != 1)
    actual = {x['id']: x for x in records}
    covered = {x['kind'] for x in oracle}
    expected_ids = set()
    for expected in oracle:
        source_id = expected['sourceId']
        binding = identities.get(source_id)
        if binding is None:
            errors.append('missing-binding:'+source_id)
            continue
        identity = binding['id']
        expected_ids.add(identity)
        row = actual.get(identity)
        if row is None:
            errors.append('missing:'+identity)
            continue
        owner = identities[expected['ownerSourceId']]['id'] if expected['ownerSourceId'] else None
        if row['kind'] != expected['kind'] or row.get('parentId') != owner or binding['kind'] != expected['kind'] or binding.get('ownerSourceId') != expected['ownerSourceId']:
            errors.append('wrong-owner-kind:'+identity)
        for key, value in expected['data'].items():
            if row['data'].get(key) != value:
                errors.append('wrong-data:'+identity+'/'+key)
        provenance = row.get('provenance', {})
        if any(provenance.get(key) != expected[key] for key in ['document', 'sha256']) or provenance.get('sourceId') != expected['sourceAuthorityId']:
            errors.append('wrong-provenance:'+identity)
    errors.extend('extra:'+row['id'] for row in records if row['kind'] in covered and row['id'] not in expected_ids)
    return errors


def mutation_controls(records, oracle, bindings):
    by_kind = lambda kind: next(i for i, row in enumerate(records) if row['kind'] == kind)
    def trial(name, mutate):
        changed = copy.deepcopy(records)
        mutate(changed)
        if not compare(changed, oracle, bindings):
            raise AssertionError('Comparator missed mutation: '+name)
        return name
    tests = []
    tests.append(trial('missing-weapon', lambda rows: rows.pop(by_kind('WEAPON_PROFILE'))))
    tests.append(trial('duplicate-identity', lambda rows: rows.append(copy.deepcopy(rows[0]))))
    tests.append(trial('wrong-owner', lambda rows: rows[by_kind('MODEL_PROFILE')].update(parentId='wrong-physical-owner')))
    tests.append(trial('wrong-value', lambda rows: rows[by_kind('WEAPON_PROFILE')]['data'].update(strength='99')))
    tests.append(trial('wrong-label', lambda rows: rows[by_kind('RULE_REFERENCE')]['data'].update(label='ABILITIES')))
    tests.append(trial('lost-condition', lambda rows: rows[by_kind('STRATAGEM')]['data']['lines'].pop(0)))
    tests.append(trial('lost-restriction', lambda rows: rows[by_kind('WARGEAR_OPTION')]['data'].update(text='Any model may take any weapon.')))
    tests.append(trial('lost-provenance', lambda rows: rows[by_kind('ENHANCEMENT')].update(provenance={})))
    sibling_id = next(x['id'] for x in bindings if x['sourceEntityId'] == 'detachment-vanguard-onslaught:rule:vanguard-prime')
    tests.append(trial('lost-sibling', lambda rows: rows.pop(next(i for i, row in enumerate(rows) if row['id'] == sibling_id))))
    return tests


def main():
    oracle = raw_oracle()
    base, effective = read(HERE/'generated/base.json'), read(HERE/'generated/effective.json')
    bindings = read(HERE/'identity-bindings.json')['bindings']
    errors = compare(base['entities'], oracle, bindings)
    if errors:
        raise AssertionError('\n'.join(errors))
    mutations = mutation_controls(base['entities'], oracle, bindings)
    by_source = {x['sourceEntityId']: x['id'] for x in bindings}
    for snapshot in [base, effective]:
        semantics = snapshot['rosterReferenceSemantics']
        for source_id in ['datasheet-old-one-eye:rule-reference:1', 'datasheet-psychophage:rule-reference:2']:
            native = semantics[by_source[source_id]]
            owner = source_id.split(':rule-reference:')[0]
            if native['scope'] != 'MODEL' or native['abilities'] != [{'name': 'Feel No Pain', 'value': 5}] or native['modelProfileIds'] != [by_source[owner+':profile:1']]:
                raise AssertionError('Native FNP owner/value lost: '+source_id)
    print(json.dumps({'RAW_TO_CANONICAL': 'PASS', 'rawInventory': dict(Counter(row['kind'] for row in oracle)),
                      'NATIVE_FNP': '2/2 MODEL', 'MUTATIONS_DETECTED': mutations}, indent=2))


if __name__ == '__main__':
    main()
