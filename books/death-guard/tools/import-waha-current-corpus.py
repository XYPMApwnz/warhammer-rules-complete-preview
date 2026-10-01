from __future__ import annotations

import hashlib
import json
import re
import sys
from copy import deepcopy
from pathlib import Path

from lxml import html


def norm(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def text(node) -> str:
    clone = deepcopy(node)
    for unwanted in clone.xpath('.//script|.//style|.//*[contains(concat(" ",normalize-space(@class)," ")," ShowFluff ")]'):
        parent = unwanted.getparent()
        if parent is not None:
            tail = unwanted.tail or ''
            previous = unwanted.getprevious()
            if previous is not None:
                previous.tail = (previous.tail or '') + tail
            else:
                parent.text = (parent.text or '') + tail
            parent.remove(unwanted)
    for br in clone.xpath('.//br'):
        br.tail = '\n' + (br.tail or '')
    for li in clone.xpath('.//li'):
        li.text = '\n- ' + (li.text or '')
        li.tail = '\n' + (li.tail or '')
    return '\n'.join(norm(line) for line in ''.join(clone.itertext()).splitlines() if norm(line))


def slug(value: str) -> str:
    value = value.lower().replace('’', '').replace("'", '')
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', value))


def sha(value) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    return hashlib.sha256(raw).hexdigest().upper()


def page_source_record(path: Path, url: str) -> dict:
    raw = path.read_bytes()
    return {'url': url, 'file': path.name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest().upper()}


def profile_invulnerable(frame, base, profile_name):
    """Read the source save in its profile container, including sibling INSV panels."""
    classes = lambda token: f'contains(concat(" ",normalize-space(@class)," ")," {token} ")'
    panels = base.xpath(f'.//*[{classes("dsInvulWrap")}]')
    scope = base
    if not panels:
        scope = base.getparent()
        panels = scope.xpath(f'./*[{classes("dsInvulWrap")}]')
    if not panels:
        return None
    values = [norm(node.text_content()) for panel in panels
              for node in panel.xpath(f'.//*[{classes("dsCharInvulValue")}]')]
    if not values or len(set(values)) != 1 or not re.fullmatch(r'\d\+', values[0]):
        raise ValueError('ambiguous or malformed profile Invulnerable Save')
    comments = [norm(node.text_content()) for node in scope.xpath(f'./*[{classes("dsInvulComment")}]')]
    marked = any('*' in norm(node.text_content()) for panel in panels
                 for node in panel.xpath(f'.//*[{classes("dsCharInvulText")}]'))
    if comments:
        if len(comments) != 1:
            raise ValueError('ambiguous Invulnerable Save profile scope')
        match = re.fullmatch(r'\*?\s*(.+?)\s+model only\.?', comments[0], flags=re.I)
        if not match:
            raise ValueError('unsupported Invulnerable Save profile scope')
        key = lambda value: re.sub(r'[^a-z0-9]+', '', value.lower())
        target = key(match[1])
        names = [re.sub(r'\s*\([^)]*\)\s*$', '', norm(node.text_content()))
                 for node in scope.xpath(f'./*[{classes("dsProfileBaseWrap")}]/*[{classes("dsProfileWrapRight")}]')]
        if sum(key(name) == target for name in names) != 1:
            raise ValueError('unresolved Invulnerable Save profile scope')
        if key(profile_name) != target:
            return None
    elif marked:
        raise ValueError('Invulnerable Save scope marker has no source comment')
    return values[0]


def parse_datasheet(path: Path, url: str) -> dict:
    document = html.fromstring(path.read_bytes())
    frames = document.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," dsOuterFrame ") and contains(concat(" ",normalize-space(@class)," ")," datasheet ")]')
    if len(frames) != 1:
        raise ValueError(f'{path.name}: expected one datasheet, got {len(frames)}')
    frame = frames[0]
    title_nodes = frame.xpath('./div[contains(@class,"dsBannerWrap")]//*[contains(@class,"dsH2Header")]/div[1]')
    title = norm(title_nodes[0].text_content())
    record_id = f'datasheet-{slug(title)}'
    statline = {}
    for item in frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsCharWrap ")]'):
        names = item.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsCharName ")]')
        values = item.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsCharValue ")]')
        if names and values:
            statline[norm(names[0].text_content())] = norm(values[0].text_content())
    invulnerable = frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsInvulWrap ")]')
    if invulnerable:
        inv_value = invulnerable[0].xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsCharInvulValue ")]')
        if not inv_value:
            inv_value = invulnerable[0].xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsCharValue ")]')
        if inv_value:
            statline['INSV'] = norm(inv_value[0].text_content())
    main = frame.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," ds2col ") and not(contains(@class,"ShowDatasheetFeatures"))]')
    if len(main) != 1:
        raise ValueError(f'{path.name}: missing factual datasheet columns')
    main = main[0]
    weapons = []
    for order, row in enumerate(main.xpath('.//tr[contains(concat(" ",normalize-space(@class)," ")," dsWeaponRow ")]'), 1):
        cells = row.xpath('./td')
        if len(cells) < 8:
            continue
        name_nodes = cells[1].xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsWeaponName ")]')
        name = norm(name_nodes[0].text_content()) if name_nodes else norm(cells[1].text_content())
        abilities = [norm(node.text_content()) for node in cells[1].xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," kwbw ")]')]
        abilities = list(dict.fromkeys(filter(None, abilities)))
        values = [norm(cell.text_content()) for cell in cells[2:8]]
        range_value = values[0]
        weapons.append({
            'sourceId': f'{record_id}:weapon:{order}', 'order': order, 'name': name,
            'mode': 'melee' if range_value.lower() == 'melee' else 'ranged',
            'range': range_value, 'attacks': values[1], 'skill': values[2],
            'strength': values[3], 'ap': values[4], 'damage': values[5],
            'abilities': abilities,
        })
    wargear = []
    lists = main.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," dsWargearOptionsList ")]/ul/li')
    for order, node in enumerate(lists, 1):
        wargear.append({'sourceId': f'{record_id}:wargear:{order}', 'order': order, 'text': text(node)})
    sections = []
    allowed = {'ABILITIES', 'WARGEAR ABILITIES', 'UNIT COMPOSITION', 'LEADER', 'TRANSPORT', 'DEPLOYMENT', 'LORD OF THE DEATH GUARD', 'SUPREME COMMANDER'}
    for header in main.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," dsHeader ")]'):
        heading = norm(header.text_content()).upper()
        if heading.startswith('DAMAGED:'):
            allowed_heading = True
        else:
            allowed_heading = heading in allowed
        if not allowed_heading:
            continue
        blocks = []
        sibling = header.getnext()
        while sibling is not None and not ('dsHeader' in (sibling.get('class') or '').split()):
            value = text(sibling)
            if value:
                # The points box is presentation sourced from MFM and is not a
                # Waha-owned datasheet composition fact.
                if heading == 'UNIT COMPOSITION' and value.upper().startswith('YOUR UNIT COSTS'):
                    sibling = sibling.getnext()
                    continue
                blocks.append({'text': value, 'wargearAbility': heading == 'WARGEAR ABILITIES' or 'dsWargearAbility' in (sibling.get('class') or '').split()})
            sibling = sibling.getnext()
        sections.append({'sourceId': f'{record_id}:section:{len(sections)+1}', 'order': len(sections)+1, 'title': norm(header.text_content()), 'blocks': blocks})
    rule_references = []
    for order, row in enumerate(main.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsCoreArmy ")]'), 1):
        label = text(row)
        if label:
            rule_references.append({'sourceId': f'{record_id}:rule-reference:{order}', 'order': order, 'label': label})
    keyword_boxes = frame.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," ds2colKWFlat ")]')
    keywords, faction_keywords = [], []
    if keyword_boxes:
        raw = norm(keyword_boxes[0].text_content())
        match = re.search(r'KEYWORDS:\s*(.*?)\s*FACTION KEYWORDS:\s*(.*)$', raw, re.I)
        if match:
            keywords = [norm(x) for x in match.group(1).split(';') if norm(x)]
            faction_keywords = [norm(x) for x in match.group(2).split(';') if norm(x)]
    source_badges = list(dict.fromkeys(norm(img.get('title') or '') for img in frame.xpath('.//img[contains(concat(" ",normalize-space(@class)," ")," logo3 ")]') if norm(img.get('title') or '')))
    record = {
        'sourceId': record_id, 'class': 'DATASHEET', 'title': title, 'sourceOrder': 0,
        'url': url, 'sourceBadges': source_badges, 'statline': statline,
        'weapons': weapons, 'wargearOptions': wargear, 'sections': sections,
        'ruleReferences': rule_references,
        'keywords': keywords, 'factionKeywords': faction_keywords,
    }
    record['normalizedContentFingerprint'] = sha(record)
    return record


def following_until(heading, stop_tags=('h2',)):
    nodes = []
    node = heading.getnext()
    while node is not None and node.tag not in stop_tags:
        nodes.append(node)
        node = node.getnext()
    return nodes


def parse_hub(path: Path, url: str) -> dict:
    document = html.fromstring(path.read_bytes())
    dispositions = []
    for order, node in enumerate(document.xpath('//label[contains(concat(" ",normalize-space(@class)," ")," DetFilterItem ") and @data-f and not(contains(@class,"dropShowBoardingActions"))]'), 1):
        image = node.xpath('.//img[contains(@class,"detFD")]')
        fd = norm(image[0].get('title') or '').replace('Force Disposition:', '').strip() if image else ''
        dispositions.append({'sourceId': f'detachment-{slug(node.get("data-det-name"))}', 'order': order, 'title': node.get('data-det-name'), 'filterId': node.get('data-f'), 'detachmentCode': node.get('data-det-code'), 'detachmentPoints': int(node.get('data-dp-base')), 'forceDisposition': fd})
    if len(dispositions) != 9:
        raise ValueError(f'expected 9 current detachments, got {len(dispositions)}')
    detachment_by_filter = {item['filterId']: item for item in dispositions}
    detachments = []
    for meta in dispositions:
        heading = document.xpath(f'//h2[normalize-space(string(.//*[self::text()]))="{meta["title"]}"]')
        if not heading:
            heading = document.xpath(f'//h2[@id="{slug(meta["title"]).replace("-s-","-s-")}"]')
        # The filter identity is the reliable bridge to section containers.
        candidates = document.xpath(f'//h2[@data-f="{meta["filterId"]}"]')
        if candidates:
            heading = candidates[:1]
        # H2 itself does not consistently carry data-f; find exact id/title.
        if not heading:
            heading = [h for h in document.xpath('//h2[contains(@class,"outline_header")]') if norm(''.join(h.itertext()).replace(re.sub(r'\d+DP$', '', norm(h.text_content())), ''))]
        exact = [h for h in document.xpath('//h2[contains(@class,"outline_header")]') if norm(''.join(h.itertext())).startswith(meta['title'])]
        if exact:
            heading = [exact[0]]
        if not heading:
            raise ValueError(f'missing detachment heading {meta["title"]}')
        start = heading[0]
        parent = start.getparent()
        # The rules/enhancements are inside the first Columns2 sibling; stratagems in the next sibling.
        section_nodes = []
        node = start.getnext()
        while node is not None:
            if node.tag == 'h2' and 'outline_header' in (node.get('class') or '').split():
                break
            section_nodes.append(node)
            node = node.getnext()
        holder = html.Element('div')
        for node in section_nodes:
            holder.append(deepcopy(node))
        rule_h = holder.xpath('.//h2[starts-with(@id,"Detachment-Rule")]')
        rule_title = ''
        rule_text = ''
        rule_tables = []
        if rule_h:
            h3 = rule_h[0].xpath('following::h3[1]')
            if h3:
                rule_title = norm(h3[0].text_content())
                rule_container = deepcopy(h3[0].getparent())
                for heading_node in rule_container.xpath('.//h2|.//h3'):
                    parent_node = heading_node.getparent()
                    tail = heading_node.tail or ''
                    previous = heading_node.getprevious()
                    if previous is not None:
                        previous.tail = (previous.tail or '') + tail
                    else:
                        parent_node.text = (parent_node.text or '') + tail
                    parent_node.remove(heading_node)
                rule_text = text(rule_container)
                for table_order, table in enumerate(rule_container.xpath('.//table'), 1):
                    rows = [[norm(cell.text_content()) for cell in row.xpath('./th|./td')] for row in table.xpath('.//tr')]
                    rule_tables.append({'sourceId': f'{meta["sourceId"]}:rule:table:{table_order}', 'rows': [row for row in rows if row]})
        enhancements = []
        enh_h = holder.xpath('.//h2[starts-with(@id,"Enhancements")]')
        if enh_h:
            n = enh_h[0].getnext()
            order = 0
            while n is not None and not (n.tag == 'h2'):
                names = n.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[1]')
                prices = n.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[2]')
                if names:
                    order += 1
                    paragraphs = n.xpath('.//p[not(contains(@class,"ShowFluff"))]')
                    direct_title = norm(''.join(names[0].xpath('./text()'))) or norm(names[0].text_content())
                    enhancements.append({'sourceId': f'{meta["sourceId"]}:enhancement:{order}', 'order': order, 'title': direct_title, 'wahaPoints': norm(prices[0].text_content()) if prices else '', 'text': '\n'.join(text(p) for p in paragraphs if text(p))})
                n = n.getnext()
        stratagems = []
        for order, wrap in enumerate(holder.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," str11Wrap ") and not(contains(@class,"sShowBoardingActions"))]'), 1):
            name = wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Name ")]')
            cp = wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11CP ")]')
            kind = wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Type ")]')
            legend = wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Legend ")]')
            body = wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Text ")]')
            if not name or not body:
                continue
            body_clone = deepcopy(body[0])
            for sub in body_clone.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataStrat ")]'):
                sub.getparent().remove(sub)
            body_text = text(body_clone)
            lines = []
            matches = list(re.finditer(r'(?i)(WHEN|TARGET|EFFECT|RESTRICTIONS?):\s*', body_text))
            for index, match in enumerate(matches):
                end = matches[index + 1].start() if index + 1 < len(matches) else len(body_text)
                lines.append({'label': match.group(1).upper(), 'text': norm(body_text[match.end():end])})
            stratagems.append({'sourceId': f'{meta["sourceId"]}:stratagem:{order}', 'order': order, 'title': norm(name[0].text_content()), 'cp': norm(cp[0].text_content()) if cp else '', 'category': norm(kind[0].text_content()) if kind else '', 'flavor': text(legend[0]) if legend else '', 'lines': lines})
        det = {**meta, 'class': 'DETACHMENT', 'rule': {'sourceId': f'{meta["sourceId"]}:rule', 'title': rule_title, 'text': rule_text, 'tables': rule_tables}, 'enhancements': enhancements, 'stratagems': stratagems}
        det['normalizedContentFingerprint'] = sha(det)
        detachments.append(det)
    army_rules = []
    nurgle_heading = document.xpath('//*[@id="Nurgle-s-Gift-Aura-"]')[0]
    main_block = nurgle_heading.getnext()
    while main_block is not None and 'BreakInsideAvoid' not in (main_block.get('class') or '').split():
        main_block = main_block.getnext()
    components = []
    components.append({'sourceId': 'army-rule-nurgles-gift:contagion-range', 'title': 'Contagion Range', 'text': text(main_block), 'visuals': [img.get('src') for img in main_block.xpath('.//img[@src]')]})
    afflicted = main_block.getnext()
    while afflicted is not None and norm(afflicted.text_content()).upper() != 'AFFLICTED':
        afflicted = afflicted.getnext()
    components.append({'sourceId': 'army-rule-nurgles-gift:afflicted', 'title': 'Afflicted', 'text': norm(afflicted.tail or '')})
    node = afflicted.getnext()
    while node is not None:
        if node.xpath('.//*[@id="Pact-of-Decay"]') or node.get('id') == 'Pact-of-Decay':
            break
        titles = node.xpath('.//p[contains(concat(" ",normalize-space(@class)," ")," impact18 ")]')
        if titles:
            paragraphs = node.xpath('.//p[not(contains(concat(" ",normalize-space(@class)," ")," ShowFluff ")) and not(contains(concat(" ",normalize-space(@class)," ")," impact18 "))]')
            title = norm(titles[0].text_content())
            components.append({'sourceId': f'army-rule-nurgles-gift:{slug(title)}', 'title': title, 'text': '\n'.join(text(p) for p in paragraphs if text(p))})
        node = node.getnext()
    nurgle = {'sourceId': 'army-rule-nurgles-gift', 'class': 'ARMY_RULE', 'title': 'Nurgle’s Gift (Aura)', 'components': components}
    nurgle['normalizedContentFingerprint'] = sha(nurgle)
    army_rules.append(nurgle)
    pact_heading = document.xpath('//*[@id="Pact-of-Decay"]')[0]
    pact_container = deepcopy(pact_heading.getparent())
    for unwanted in pact_container.xpath('.//h2|.//h3'):
        parent_node = unwanted.getparent()
        tail = unwanted.tail or ''
        previous = unwanted.getprevious()
        if previous is not None:
            previous.tail = (previous.tail or '') + tail
        else:
            parent_node.text = (parent_node.text or '') + tail
        parent_node.remove(unwanted)
    pact = {'sourceId': 'army-rule-pact-of-decay', 'class': 'ARMY_RULE', 'title': 'Pact of Decay', 'text': text(pact_container)}
    pact['normalizedContentFingerprint'] = sha(pact)
    army_rules.append(pact)
    errata = []
    seen = set()
    for wrapper in document.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]'):
        heads = wrapper.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," errata_H ")]')
        bodies = wrapper.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," errata ")]')
        for head, body in zip(heads, bodies):
            pair = (text(head), text(body))
            if pair in seen:
                continue
            seen.add(pair)
            if pair[0].startswith('13.09') or pair[0] == 'Grenades Stratagem':
                continue
            errata.append({'sourceId': f'errata-{len(errata)+1}', 'class': 'ERRATA', 'title': pair[0], 'text': pair[1]})
    references = []
    factual_root = document.xpath('//div[@id="wrapper"]') or [document]
    for node in factual_root[0].xpath('.//a[@href]'):
        label, href = norm(node.text_content()), norm(node.get('href') or '')
        if label and href and ('/wh40k11ed/' in href or href.startswith('#')):
            references.append({'sourceId': f'hub-reference:{len(references)+1}', 'label': label, 'href': href})
    return {'armyRules': army_rules, 'detachments': detachments, 'errata': errata, 'references': references}


def main(source_dir: str, output_file: str):
    source = Path(source_dir)
    pages_manifest = json.loads((source / 'pages.json').read_text(encoding='utf-8'))
    hub_path = source / 'death-guard.html'
    hub_url = 'https://wahapedia.ru/wh40k11ed/factions/death-guard/'
    hub = parse_hub(hub_path, hub_url)
    datasheets = []
    pages = [page_source_record(hub_path, hub_url)]
    for order, info in enumerate(pages_manifest, 1):
        path = source / info['file']
        record = parse_datasheet(path, info['url'])
        record['sourceOrder'] = order
        datasheets.append(record)
        pages.append(page_source_record(path, info['url']))
    inventory = {
        'armyRule': len(hub['armyRules']),
        'errata': len(hub['errata']),
        'detachment': len(hub['detachments']),
        'detachmentRule': sum(bool(x['rule']['text']) for x in hub['detachments']),
        'enhancement': sum(len(x['enhancements']) for x in hub['detachments']),
        'stratagem': sum(len(x['stratagems']) for x in hub['detachments']),
        'datasheet': len(datasheets),
        'statline': len(datasheets),
        'statCharacteristic': sum(len(x['statline']) for x in datasheets),
        'weaponProfile': sum(len(x['weapons']) for x in datasheets),
        'wargearOption': sum(len(x['wargearOptions']) for x in datasheets),
        'datasheetSection': sum(len(x['sections']) for x in datasheets),
        'datasheetSectionBlock': sum(sum(len(s['blocks']) for s in x['sections']) for x in datasheets),
        'ruleReference': sum(len(x['ruleReferences']) for x in datasheets) + len(hub['references']),
        'keywordOccurrence': sum(len(x['keywords']) + len(x['factionKeywords']) for x in datasheets),
    }
    gameplay_units = sum(inventory.values())
    corpus = {
        'schema': 'wh40k-waha-death-guard-corpus/v1', 'edition': '11E',
        'captureDate': '2026-09-25', 'currentnessCutoff': '2026-09-22',
        'scope': {'included': ['current Faction Pack 11E v1.2', '36 non-Legends current datasheets'], 'excluded': ['35 Legends datasheets', '10E Boarding Actions', '10E Crusade']},
        'pages': pages, 'inventory': inventory, 'gameplayUnits': gameplay_units,
        **hub, 'datasheets': datasheets,
    }
    fingerprint_payload = {k: v for k, v in corpus.items() if k not in {'pages', 'corpusFingerprint'}}
    corpus['corpusFingerprint'] = sha(fingerprint_payload)
    Path(output_file).write_text(json.dumps(corpus, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'pages': len(pages), 'inventory': inventory, 'gameplayUnits': gameplay_units, 'fingerprint': corpus['corpusFingerprint']}, indent=2))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
