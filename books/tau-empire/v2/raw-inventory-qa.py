"""Independent, offline accepted-RAW oracle for the Tau V2 foundation.

Expected values are read from HTML with lxml, never from the legacy corpus,
the production parser, a generated snapshot, or an external evidence report.
Persistent bindings are source addresses only, not expected gameplay values.
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
SOURCE = ROOT/'books/tau-empire/sources/waha-11e-current-2026-09-28'
read = lambda path: json.loads(path.read_text(encoding='utf-8-sig'))
norm = lambda value: ' '.join(value.split())
css = lambda token: 'contains(concat(" ",normalize-space(@class)," ")," '+token+' ")'


def has(node, token):
    return token in (node.get('class') or '').split()


def text(node, headings=False):
    """Keep every gameplay sibling and nested list; remove display-only text."""
    node = copy.deepcopy(node)
    tokens = ['ShowFluff', 'faqErrataSpoiler', 'faqErrataStrat']
    selector = './/script|.//style|.//*['+' or '.join(css(c) for c in tokens)+']'
    if headings:
        selector += '|.//h2|.//h3'
    for child in node.xpath(selector):
        if child.getparent() is not None:
            child.drop_tree()
    for block in node.iter():
        if block.tag in ['p','div','ul','ol','table','tr','td','th']:
            block.text = ' '+(block.text or '')
            block.tail = ' '+(block.tail or '')
    for br in node.xpath('.//br'):
        br.tail = '\n'+(br.tail or '')
    for li in node.xpath('.//li'):
        li.text = '\n- '+(li.text or '')
        li.tail = '\n'+(li.tail or '')
    return '\n'.join(norm(line) for line in ''.join(node.itertext()).splitlines() if norm(line))


def location(node, path):
    return {'document': path.relative_to(ROOT).as_posix(),
            'xpath': node.getroottree().getpath(node), 'line': node.sourceline,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest().upper()}


def raw_oracle():
    """Census by physical page/DOM address, including non-heading siblings."""
    result = {'armyRules': [], 'detachments': [], 'drones': [], 'datasheets': [], 'errata': [], 'faqs': []}
    hub = SOURCE/'tau-empire.html'
    tree = html.parse(str(hub))
    root, = tree.xpath('//*[@id="wahMainContent"]')
    nodes = list(root.iter())
    order = {node: i for i, node in enumerate(nodes)}
    anchor = lambda identity: tree.xpath('//*[@id=$identity]', identity=identity)[0]
    army, first, drones, crusade = map(anchor, ['Army-Rules', 'Kauyon', 'Drones', 'Crusade-Rules'])
    for node in nodes:
        if node.tag == 'h3' and node.get('id') and order[army] < order[node] < order[first]:
            result['armyRules'].append({**location(node, hub), 'anchor': node.get('id'),
                'title': norm(node.text_content()), 'text': text(node.getparent(), True)})
    headings = [node for node in nodes if node.tag == 'h2' and has(node, 'outline_header')
                and node.xpath('.//*['+css('dpPts')+']') and order[node] < order[drones]]
    for index, heading in enumerate(headings):
        stop = order[headings[index+1]] if index+1 < len(headings) else order[drones]
        region = nodes[order[heading]:stop]
        end_rules = next(n for n in region if n.tag == 'h2' and (n.get('id') or '').startswith('Enhancements'))
        badge, = heading.xpath('.//*['+css('dpPts')+']')
        det = {**location(heading, hub), 'anchor': heading.get('id'),
            'title': norm(heading.text_content().replace(badge.text_content(), '')),
            'rules': [], 'enhancements': [], 'stratagems': []}
        for node in region:
            if node.tag == 'h3' and has(node, 'padHeader') and order[node] < order[end_rules]:
                rule = {**location(node.getparent(), hub), 'anchor': node.get('id'),
                    'title': norm(node.text_content()), 'text': text(node.getparent(), True), 'children': []}
                for child in node.getparent().xpath('.//*['+css('blackComment')+']'):
                    bold = child.xpath('./b[1]')
                    rule['children'].append({**location(child, hub),
                        'title': norm(bold[0].text_content()).rstrip(':') if bold else '', 'text': text(child)})
                det['rules'].append(rule)
            if has(node, 'EnhancementsPts'):
                cell = next(parent for parent in node.iterancestors() if parent.tag == 'td')
                title, = node.xpath('./li/span[1]')
                # A nested UPGRADE badge is presentation, not part of the name.
                name = norm(''.join(title.xpath('./text()'))) or norm(title.text_content())
                clone = copy.deepcopy(cell)
                for label in clone.xpath('./*['+css('EnhancementsPts')+']'):
                    label.drop_tree()
                det['enhancements'].append({**location(cell, hub), 'title': name,
                    'text': text(clone), 'gameplayBlocks': [text(n) for n in cell
                    if isinstance(n.tag, str) and not has(n, 'EnhancementsPts')
                    and not has(n, 'ShowFluff') and n.tag != 'br' and text(n)]})
            if has(node, 'str11Wrap'):
                get = lambda token: node.xpath('.//*['+css(token)+']')[0]
                value = text(get('str11Text'))
                markers = list(re.finditer(r'(?i)(WHEN|TARGET|EFFECT|RESTRICTIONS?):\s*', value))
                det['stratagems'].append({**location(node, hub), 'title': norm(get('str11Name').text_content()),
                    'cp': norm(get('str11CP').text_content()), 'category': norm(get('str11Type').text_content()),
                    'lines': [{'label': m[1].upper(), 'text': norm(value[m.end():markers[i+1].start()
                        if i+1 < len(markers) else len(value)])} for i, m in enumerate(markers)]})
        result['detachments'].append(det)
    for node in nodes[order[drones]+1:order[crusade]]:
        if node.tag == 'p' and has(node, 'impact18'):
            result['drones'].append({**location(node.getparent(), hub), 'title': norm(node.text_content()),
                'text': text(node.getparent()), 'weapons': [weapon(w, hub)
                    for w in node.getparent().xpath('.//*['+css('dsWeaponRow')+']')]})
    seen = set()
    for spoiler in tree.xpath('//*['+css('faqErrataSpoiler')+']'):
        for head, value in zip(spoiler.xpath('.//*['+css('errata_H')+']'), spoiler.xpath('.//*['+css('errata')+']')):
            pair = (text(head), text(value))
            if pair in seen or pair[0].startswith('13.09'):
                continue
            seen.add(pair)
            result['errata'].append({**location(head, hub), 'title': pair[0], 'text': pair[1]})
    seen = set()
    for table in tree.xpath('//div['+css('faq')+']//table'):
        # Core popup FAQs follow the Crusade boundary and are not Tau facts.
        if table not in order or order[table] >= order[crusade]:
            continue
        question = table.xpath('.//tr[contains(@class,"faq_Q_line")]/td[2]')
        answer = table.xpath('.//td[contains(@class,"faq_A")]/following-sibling::td[1]')
        if question and answer:
            pair = (text(question[0]), text(answer[0]))
            if pair not in seen:
                seen.add(pair)
                result['faqs'].append({**location(question[0], hub), 'title': pair[0], 'text': pair[1]})
    for path in sorted(SOURCE.glob('*.html')):
        if path == hub:
            continue
        document = html.parse(str(path))
        frame, = document.xpath('//*['+css('dsOuterFrame')+']')
        main, = frame.xpath('./*['+css('ds2col')+' and not('+css('ShowDatasheetFeatures')+')]')
        title, = frame.xpath('./div[contains(@class,"dsBannerWrap")]//*[contains(@class,"dsH2Header")]/div[1]')
        unit = {**location(frame, path), 'title': norm(title.text_content()),
                'profiles': [], 'weapons': [], 'sections': [], 'wargearOptions': [],
                'wargearFootnotes': [], 'references': [], 'keywords': [], 'factionKeywords': []}
        for field, token, prefix in [('keywords', 'dsLeftСolKW', 'KEYWORDS:'),
                                      ('factionKeywords', 'dsRightСolKW', 'FACTION KEYWORDS:')]:
            for box in frame.xpath('.//*['+css(token)+']'):
                unit[field] += [norm(v) for v in norm(box.text_content()).replace(prefix, '', 1).split(';') if norm(v)]
        for base in frame.xpath('.//*['+css('dsProfileBaseWrap')+']'):
            panel, = base.xpath('.//*['+css('dsProfileWrap')+']')
            values = [norm(n.text_content()) for n in panel.xpath('.//*['+css('dsCharValue')+']')]
            names = base.xpath('./*['+css('dsProfileWrapRight')+']')
            name = (re.sub(r'\s*\([^)]*\)\s*$', '', norm(names[0].text_content())) if names else '') or unit['title']
            stats = dict(zip(['M', 'T', 'SV', 'W', 'LD', 'OC'], values))
            inv = base.xpath('.//*['+css('dsCharInvulValue')+']') or base.getparent().xpath('./*['+css('dsInvulWrap')+']//*['+css('dsCharInvulValue')+']')
            if inv:
                assert len({norm(n.text_content()) for n in inv}) == 1, 'Ambiguous invulnerable save'
                stats['INSV'] = norm(inv[0].text_content())
            unit['profiles'].append({**location(panel, path), 'name': name, 'stats': stats})
        unit['weapons'] = [weapon(n, path) for n in main.xpath('.//*['+css('dsWeaponRow')+']')]
        for box in main.xpath('.//*['+css('dsCoreArmyValue')+']'):
            links = box.xpath('./b/span[contains(@class,"tooltip")]') or box.xpath('./span[contains(@class,"tooltip")]')
            labels = [norm(n.text_content()) for n in links] if links else re.split(r'\s*,\s*', norm(box.text_content()))
            unit['references'] += [{**location(box, path), 'label': label} for label in labels if label]
        for header in main.xpath('.//*['+css('dsHeader')+']'):
            if header.getparent().tag != 'div' or not any(has(header.getparent(), c) for c in ['dsRightColFlat', 'dsLeftColFlat']):
                continue
            title = norm(header.text_content())
            section = {**location(header, path), 'title': title, 'blocks': [], 'composition': [], 'leaders': []}
            for sibling in header.itersiblings():
                if has(sibling, 'dsHeader'):
                    break
                if sibling.xpath('.//*['+css('dsUnitCostHeader')+']'):
                    continue
                value = text(sibling)
                if value:
                    section['blocks'].append({'text': value, 'wargearAbility': title == 'WARGEAR ABILITIES' or has(sibling, 'dsWargearAbility')})
                if title == 'UNIT COMPOSITION':
                    section['composition'] += [{**location(li, path), 'text': text(li)} for li in sibling.xpath('./ul/li')]
                if title == 'LEADER':
                    for link in sibling.xpath('./ul/li/a'):
                        section['leaders'].append({'title': norm(link.text_content()), 'href': link.get('href'),
                            'legends': any(has(a, 'sLegendary') for a in link.iterancestors())})
                if title == 'WARGEAR OPTIONS':
                    unit['wargearOptions'] += [{**location(li, path), 'text': text(li)} for li in (sibling.xpath('./li') if sibling.tag == 'ul' else sibling.xpath('./ul/li'))]
                    unit['wargearFootnotes'] += [{**location(n, path), 'text': text(n)} for n in sibling.xpath('.//*['+css('dsOptionsComment')+']')]
            unit['sections'].append(section)
        result['datasheets'].append(unit)
    return result


def weapon(node, path):
    cells = node.xpath('./td')
    assert len(cells) in (7, 8), 'Unexpected raw weapon shape'
    name, = node.xpath('.//*['+css('dsWeaponName')+']')
    values = [norm(cell.text_content()) for cell in cells[-6:]]
    return {**location(node, path), 'name': norm(name.text_content()),
        **dict(zip(['range', 'attacks', 'skill', 'strength', 'ap', 'damage'], values)),
        'mode': 'melee' if values[0].lower() == 'melee' else 'ranged',
        'abilities': list(dict.fromkeys(norm(n.text_content()) for n in node.xpath('.//*['+css('kwbw')+']') if norm(n.text_content())))}


def census(oracle):
    units, detachments = oracle['datasheets'], oracle['detachments']
    sections = [s for u in units for s in u['sections']]
    return {'htmlPages': len(list(SOURCE.glob('*.html'))), 'datasheets': len(units),
        'modelProfiles': sum(len(u['profiles']) for u in units),
        'weaponProfiles': sum(len(u['weapons']) for u in units),
        'nativeReferences': sum(len(u['references']) for u in units),
        'abilityBlocks': sum(len(s['blocks']) for s in sections if s['title'] == 'ABILITIES'),
        'compositionDeclarations': sum(len(s['composition']) for s in sections),
        'wargearOptions': sum(len(u['wargearOptions']) for u in units),
        'wargearFootnotes': sum(len(u['wargearFootnotes']) for u in units),
        'detachments': len(detachments), 'namedRules': sum(bool(r['anchor']) for d in detachments for r in d['rules']),
        'keywordSections': sum(not r['anchor'] for d in detachments for r in d['rules']),
        'childAbilities': sum(len(r['children']) for d in detachments for r in d['rules']),
        'enhancements': sum(len(d['enhancements']) for d in detachments),
        'stratagems': sum(len(d['stratagems']) for d in detachments),
        'droneDefinitions': len(oracle['drones']), 'droneWeapons': sum(len(d['weapons']) for d in oracle['drones']),
        'leaderPairs': sum(not t['legends'] for s in sections for t in s['leaders']),
        'transports': sum(s['title'] == 'TRANSPORT' for s in sections),
        'damagedBlocks': sum(s['title'].startswith('DAMAGED:') for s in sections)}


def equivalent(actual, expected):
    """Whitespace, list-marker and quote typography do not change wording."""
    if isinstance(expected, str):
        if not re.search(r'[A-Za-z]', expected):
            return isinstance(actual, str) and norm(actual) == norm(expected)
        tokens = lambda value: re.findall(r'(?<!\w)[+-]?\d+(?:[-–‑]\d+)?\+?|\w+|["%/]', value.casefold())
        return isinstance(actual, str) and tokens(actual) == tokens(expected)
    if isinstance(expected, list):
        return isinstance(actual, list) and len(actual) == len(expected) and all(equivalent(a, e) for a, e in zip(actual, expected))
    if isinstance(expected, dict):
        return isinstance(actual, dict) and all(key in actual and equivalent(actual[key], value) for key, value in expected.items())
    return actual == expected


def expected_rows(oracle, bindings, addresses):
    """Use persistent source addresses to name independently observed rows.

    Ordinals below are frozen source-address suffixes in the existing registry;
    this QA never creates, repairs or writes identity bindings.
    """
    identities = {row['sourceEntityId']: row for row in bindings}
    address_map = {row['sourceId']: row for row in addresses}
    rows = []
    def add(sid, kind, owner, item, fields):
        rows.append({'sourceId': sid, 'kind': kind, 'ownerSourceId': owner,
            'data': {key: copy.deepcopy(item[key]) for key in fields},
            'document': item['document'], 'sha256': item['sha256'], 'xpath': item['xpath']})
    def addressed_root(kind, raw):
        candidates = [row for row in bindings if row['kind'] == kind
            and address_map.get(row['sourceEntityId'], {}).get('document') == raw['document']]
        if len(candidates) == 1:
            return candidates[0]['sourceEntityId']
        # Main-page roots have explicit source node addresses, not title joins.
        candidates = [row for row in candidates
            if address_map[row['sourceEntityId']]['xpath'] == raw['xpath']]
        if len(candidates) != 1:
            raise ValueError('Missing/ambiguous root source address: '+kind+'/'+raw['xpath'])
        return candidates[0]['sourceEntityId']
    for army in oracle['armyRules']:
        sid = addressed_root('ARMY_RULE', army)
        add(sid, 'ARMY_RULE', None, army, ['title'])
        add(sid+':definition', 'ARMY_RULE_COMPONENT', sid, army, ['title', 'text'])
    for det in oracle['detachments']:
        sid = addressed_root('DETACHMENT', det)
        add(sid, 'DETACHMENT', None, det, ['title'])
        for index, rule in enumerate(det['rules']):
            suffix = ':rule' if index == 0 else ':keywords' if not rule['anchor'] else ':rule:skirmish-fighters'
            add(sid+suffix, 'DETACHMENT_RULE', sid, rule, ['title', 'text'])
            rows[-1]['data']['sourceOccurrences'] = [{'xpath':c['xpath'],'title':c['title']} for c in rule['children']]
        for field, kind, keys, suffix in [('enhancements', 'ENHANCEMENT', ['title', 'text'], ':enhancement:'),
                ('stratagems', 'STRATAGEM', ['title', 'cp', 'category', 'lines'], ':stratagem:')]:
            for index, item in enumerate(det[field], 1):
                add(sid+suffix+str(index), kind, sid, item, keys)
    for unit in oracle['datasheets']:
        sid = addressed_root('DATASHEET', unit)
        add(sid, 'DATASHEET', None, unit, ['title', 'keywords', 'factionKeywords'])
        for field, kind, suffix, keys in [
            ('profiles', 'MODEL_PROFILE', ':profile:', ['name', 'stats']),
            ('weapons', 'WEAPON_PROFILE', ':weapon:', ['name','range','attacks','skill','strength','ap','damage','abilities','mode']),
            ('references', 'RULE_REFERENCE', ':rule-reference:', ['label'])]:
            for index, item in enumerate(unit[field], 1):
                add(sid+suffix+str(index), kind, sid, item, keys)
                if kind == 'MODEL_PROFILE':
                    rows[-1]['data']['scope'] = 'SOURCE_PROFILE'
        for index, item in enumerate(unit['wargearOptions']+unit['wargearFootnotes'], 1):
            add(sid+':wargear:'+str(index), 'WARGEAR_OPTION', sid, item, ['text'])
        section_index, composition_index = 0, 0
        for section in unit['sections']:
            title = section['title']
            if title == 'WARGEAR OPTIONS':
                continue
            if title in ['INDEPENDENT POWER', 'BODYGUARD']:
                section_id = sid+':section:'+title.lower().replace(' ', '-')
            else:
                section_index += 1
                section_id = sid+':section:'+str(section_index)
            add(section_id, 'DATASHEET_SECTION', sid, section, ['title', 'blocks'])
            for member in section['composition']:
                composition_index += 1
                member = copy.deepcopy(member)
                match = re.match(r'^(\d+)(?:-(\d+))?\s+(.+)$', member['text'])
                assert match, 'Unparsed physical composition: '+member['text']
                member['quantity'] = {'min': int(match[1]), 'max': int(match[2] or match[1])}
                member['name'] = re.sub(r'\s+[–-]\s+EPIC HERO$', '', match[3])
                add(sid+':composition:'+str(composition_index), 'COMPOSITION_MEMBER', sid, member, ['name','quantity','text'])
                profile = 2 if len(unit['profiles']) == 2 and 'Hound' in member['name'] else 1
                rows[-1]['data']['modelProfileId'] = identities[sid+':profile:'+str(profile)]['id']
    for drone in oracle['drones']:
        sid = addressed_root('EQUIPMENT_RULE', drone)
        add(sid, 'EQUIPMENT_RULE', None, drone, ['title','text'])
        rows[-1]['data'].update(scope='MODEL_BEARER', tokensAreModels=False)
        for index, item in enumerate(drone['weapons'], 1):
            add(sid+':weapon:'+str(index), 'WEAPON_PROFILE', sid, item,
                ['name','range','attacks','skill','strength','ap','damage','abilities','mode'])
    for key, kind, prefix in [('errata','ERRATA','errata-'), ('faqs','FAQ','faq-')]:
        for index, item in enumerate(oracle[key], 1):
            add(prefix+str(index), kind, None, item, ['title','text'])
    return rows


def compare(records, oracle, bindings, addresses):
    errors = []
    by_source = {row['sourceEntityId']: row for row in bindings}
    address_map = {row['sourceId']: row for row in addresses}
    for key, values, field in [('record',records,'id'),('binding',bindings,'sourceEntityId'),('address',addresses,'sourceId')]:
        errors += ['duplicate-'+key+':'+name for name, count in Counter(r[field] for r in values).items() if count != 1]
    actual = {row['sourceEntityId']: row for row in records}
    expected = expected_rows(oracle, bindings, addresses)
    expected_ids = {row['sourceId'] for row in expected}
    for label, values in [('entity',set(actual)),('binding',set(by_source)),('address',set(address_map))]:
        errors += ['missing-'+label+':'+sid for sid in expected_ids-values]
        errors += ['extra-'+label+':'+sid for sid in values-expected_ids]
    for wanted in expected:
        sid = wanted['sourceId']
        if sid not in actual or sid not in by_source or sid not in address_map:
            continue
        row, binding, address = actual[sid], by_source[sid], address_map[sid]
        owner = by_source.get(wanted['ownerSourceId'], {}).get('id')
        if row['id'] != binding['id'] or row['kind'] != wanted['kind'] or binding['kind'] != wanted['kind'] or row.get('parentId') != owner or binding.get('ownerSourceId') != wanted['ownerSourceId'] or row.get('bookId') != 'tau-empire':
            errors.append('wrong-identity-owner-kind:'+sid)
        for key, value in wanted['data'].items():
            if (key in ['stats','quantity'] and row['data'].get(key) != value) or not equivalent(row['data'].get(key), value):
                errors.append('wrong-data:'+sid+'/'+key)
        proof = row.get('provenance', {})
        if proof.get('sourceId') != 'tau-empire-waha-11e-2026-09-28' or proof.get('document') != wanted['document'] or proof.get('sha256') != wanted['sha256'] or proof.get('sourceEntityId') != sid or proof.get('pointer') != address.get('xpath') or address.get('document') != wanted['document']:
            errors.append('wrong-provenance:'+sid)
        # Locators must name the independently observed raw occurrence. A
        # reference row may hold multiple labels, and FAQs name the italic Q.
        locator = wanted['xpath']
        if wanted['kind'] in ['ARMY_RULE','ARMY_RULE_COMPONENT','RULE_REFERENCE']:
            locator = locator.rsplit('/',1)[0]
        elif wanted['kind'] == 'FAQ':
            locator += '/i'
        if wanted['kind'] == 'ERRATA' and address.get('xpath') != locator:
            # Identical errata are physically duplicated in the accepted hub.
            nodes = html.parse(str(ROOT/wanted['document'])).xpath(address['xpath'])
            valid = len(nodes) == 1 and equivalent(text(nodes[0]),wanted['data']['title']) and nodes[0].getnext() is not None and equivalent(text(nodes[0].getnext()),wanted['data']['text'])
            errors += [] if valid else ['wrong-raw-address:'+sid]
        elif address.get('xpath') != locator:
            errors.append('wrong-raw-address:'+sid)
    # Every physical child must also be reachable through its factual owner.
    fields = {'DATASHEET': {'MODEL_PROFILE':'profileIds','WEAPON_PROFILE':'weaponIds','DATASHEET_SECTION':'sectionIds',
        'WARGEAR_OPTION':'wargearOptionIds','RULE_REFERENCE':'ruleReferenceIds','COMPOSITION_MEMBER':'compositionMemberIds'},
        'DETACHMENT': {'DETACHMENT_RULE':'ruleIds','ENHANCEMENT':'enhancementIds','STRATAGEM':'stratagemIds'},
        'ARMY_RULE': {'ARMY_RULE_COMPONENT':'componentIds'}, 'EQUIPMENT_RULE': {'WEAPON_PROFILE':'weaponIds'}}
    for sid, row in actual.items():
        for kind, field in fields.get(row['kind'], {}).items():
            expected_children = [by_source[e['sourceId']]['id'] for e in expected if e['kind'] == kind and e['ownerSourceId'] == sid and e['sourceId'] in by_source]
            if row['data'].get(field) != expected_children:
                errors.append('wrong-child-membership:'+sid+'/'+field)
        if row['kind'] == 'RULE_REFERENCE' and row.get('parentId'):
            parent = next((r for r in records if r['id'] == row['parentId']),{})
            recipient = row['data'].get('recipient',{})
            if row['data'].get('scope') != 'MODEL' or 'conditionalOnly' in row['data'] or recipient.get('scope') != 'MODEL' or recipient.get('modelProfileIds') != parent.get('data',{}).get('profileIds') or recipient.get('compositionMemberIds') != parent.get('data',{}).get('compositionMemberIds'):
                errors.append('wrong-native-recipient:'+sid)
        if row['kind'] == 'MODEL_PROFILE':
            members = [e['sourceId'] for e in expected if e['kind'] == 'COMPOSITION_MEMBER' and e['data']['modelProfileId'] == row['id']]
            if row['data'].get('compositionMemberIds') != [by_source[s]['id'] for s in members]:
                errors.append('wrong-physical-profile-members:'+sid)
    return errors


def mutation_controls(records, oracle, bindings, addresses):
    def row(rows, sid):
        return next(r for r in rows if r['sourceEntityId'] == sid)
    def trial(name, change):
        damaged = copy.deepcopy(records)
        change(damaged)
        assert compare(damaged, oracle, bindings, addresses), 'Comparator missed '+name
        return name
    first = lambda kind: next(r['sourceEntityId'] for r in records if r['kind'] == kind)
    return [
        trial('missing-weapon', lambda r: r.remove(row(r,first('WEAPON_PROFILE')))),
        trial('duplicate-id', lambda r: r.append(copy.deepcopy(r[0]))),
        trial('wrong-owner', lambda r: row(r,first('MODEL_PROFILE')).update(parentId='wrong-owner')),
        trial('wrong-value', lambda r: row(r,first('WEAPON_PROFILE'))['data'].update(strength='99')),
        trial('lost-provenance', lambda r: row(r,first('ENHANCEMENT')).update(provenance={})),
        trial('missing-skirmish-sibling', lambda r: r.remove(row(r,'detachment-kroot-hunting-pack:rule:skirmish-fighters'))),
        trial('missing-keywords-sibling', lambda r: r.remove(row(r,'detachment-kroot-hunting-pack:keywords'))),
        trial('missing-independent-power', lambda r: r.remove(row(r,'datasheet-commander-farsight:section:independent-power'))),
        trial('missing-bodyguard', lambda r: r.remove(row(r,'datasheet-kroot-carnivores:section:bodyguard'))),
        trial('lost-first-prototype-list', lambda r: row(r,'detachment-experimental-prototype-cadre:enhancement:1')['data'].update(text=row(r,'detachment-experimental-prototype-cadre:enhancement:1')['data']['text'].split('have:')[0]+'have:')),
        trial('changed-second-prototype-numeric', lambda r: row(r,'detachment-experimental-prototype-cadre:enhancement:2')['data'].update(text=row(r,'detachment-experimental-prototype-cadre:enhancement:2')['data']['text'].replace('+2 S','+9 S'))),
        trial('lost-third-prototype-list-item', lambda r: row(r,'detachment-experimental-prototype-cadre:enhancement:3')['data'].update(text=row(r,'detachment-experimental-prototype-cadre:enhancement:3')['data']['text'].replace('+1 AP and D.',''))),
        trial('lost-nested-ability-occurrence', lambda r: row(r,'detachment-auxiliary-cadre:rule')['data']['sourceOccurrences'].pop()),
        trial('lost-condition', lambda r: row(r,first('STRATAGEM'))['data']['lines'].pop(0)),
        trial('unreachable-child', lambda r: row(r,first('DATASHEET'))['data']['weaponIds'].pop()),
        trial('native-reference-loss', lambda r: row(r,first('RULE_REFERENCE'))['data'].update(label='ABILITIES')),
    ]


def main():
    oracle = raw_oracle()
    bindings = read(HERE/'identity-bindings.json')['bindings']
    addresses = read(HERE/'source-bindings.json')['recordAddresses']
    base = read(HERE/'generated/base.json')
    errors = compare(base['entities'], oracle, bindings, addresses)
    assert not errors, '\n'.join(errors)
    controls = mutation_controls(base['entities'], oracle, bindings, addresses)
    print(json.dumps({'RAW_TO_CANONICAL':'PASS','rawInventory':census(oracle),
        'MUTATIONS_DETECTED':controls,'oracle':'accepted HTML only; corpus and producer not imported'},indent=2))


if __name__ == '__main__':
    main()
