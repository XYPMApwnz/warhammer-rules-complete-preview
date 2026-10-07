"""Source-only factual build. No contracts, legacy adapters, runtime or network."""
import argparse
import copy
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlparse
from lxml import html

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = 'books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25'
SOURCE_ID = 'am-waha-11e-2026-09-25'
sha = lambda value: hashlib.sha256(value).hexdigest().upper()
norm = lambda value: re.sub(r'\s+', ' ', str(value)).strip()
cls = lambda name: 'contains(concat(" ", normalize-space(@class), " "), " '+name+' ")'
read = lambda name: json.loads((ROOT/name).read_text('utf8'))


def flow(node, skip=()):
    if not isinstance(node.tag, str) or set((node.get('class') or '').split()) & set(skip):
        return ''
    value = node.text or ''
    for child in node:
        value += '\n' if child.tag == 'br' else flow(child, skip)
        value += child.tail or ''
        if child.tag in ('p', 'li', 'ul', 'div', 'tr'):
            value += '\n'
    return '\n'.join(norm(line) for line in value.splitlines() if norm(line))


def leaves(value, pointer=''):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from leaves(child, pointer+'/'+key.replace('~', '~0').replace('/', '~1'))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from leaves(child, pointer+'/'+str(index))
    else:
        yield pointer, value


def build():
    enrollment = read('books/adeptus-mechanicus/v2/sources/enrollment.json')
    for source in enrollment['artifacts']:
        assert sha((ROOT/source['path']).read_bytes()) == source['sha256'], source['path']
    corpus = read(SOURCE+'/corpus.json')
    docs = {page['file']: html.fromstring((ROOT/SOURCE/page['file']).read_text('utf8')) for page in corpus['pages']}
    page_info = {Path(page['path']).name: page for page in enrollment['artifacts'] if page['path'].endswith('.html')}
    entities, accounting, ids = [], [], set()

    def add(identity, kind, parent, data, pointer=None, file=None, xpath=None):
        assert identity not in ids, 'Duplicate semantic owner: '+identity
        ids.add(identity)
        provenance = {'sourceId': SOURCE_ID, 'sourcePath': SOURCE+'/corpus.json', 'pointer': pointer}
        if file:
            provenance.update(sourcePath=SOURCE+'/'+file, sha256=page_info[file]['sha256'], xpath=xpath)
        record = dict(id=identity, kind=kind, data=copy.deepcopy(data), provenance=provenance)
        if parent:
            record['parentId'] = parent
        entities.append(record)
        if pointer is not None:
            accounting.append(dict(sourcePointer=pointer, entityId=identity, classification='CANONICAL_FACT'))
        return record

    omit = lambda obj, names: {k: copy.deepcopy(v) for k, v in obj.items() if k not in names}
    by_source_unit = {urlparse(u['url']).path.rstrip('/'): u['sourceId'].replace('datasheet-', 'unit-', 1) for u in corpus['datasheets']}
    profile_bindings = read('books/adeptus-mechanicus/v2/profile-bindings.json')
    for index, unit in enumerate(corpus['datasheets']):
        pointer = '/datasheets/'+str(index)
        identity = unit['sourceId'].replace('datasheet-', 'unit-', 1)
        file = next(p['file'] for p in corpus['pages'] if p['url'] == unit['url'])
        doc = docs[file]
        frame, = doc.xpath('//div['+cls('dsOuterFrame')+']')
        header = frame[0]
        wraps = header.xpath('.//div['+cls('dsProfileBaseWrap')+']')
        bindings = profile_bindings[identity]
        assert len(wraps) == len(bindings), identity+': complete model profile bindings'
        profile_ids = []
        invuln = header.xpath('.//div['+cls('dsCharInvulValue')+']')
        assert len(invuln) <= 1, identity+': ambiguous defensive scope'
        invuln_id = unit['sourceId']+':invulnerable-save' if invuln else None
        if invuln:
            add(invuln_id, 'INVULNERABLE_SAVE', identity, {'value': norm(invuln[0].text_content()), 'profileIds': [b['id'] for b in bindings]}, file=file, xpath=doc.getroottree().getpath(invuln[0]))
        for wrap, binding in zip(wraps, bindings):
            assert doc.getroottree().getpath(wrap) == binding['xpath'], identity+': profile evidence moved'
            chars = wrap.xpath('.//div['+cls('dsCharValue')+']')
            assert len(chars) == 6, identity+': six ordinary characteristics'
            stats = dict(zip(('M', 'T', 'SV', 'W', 'LD', 'OC'), (norm(n.text_content()) for n in chars)))
            names = wrap.xpath('.//span['+cls('dsModelName')+']')
            name = norm(names[0].text_content()) if names else unit['title']
            assert name == binding['sourceLabel'], identity+': exact model scope'
            data = {'name': name, 'stats': stats, 'keywordScopeIds': binding['keywordScopeIds']}
            if invuln_id:
                data['invulnerableSaveId'] = invuln_id
            add(binding['id'], 'PROFILE', identity, data, file=file, xpath=binding['xpath'])
            profile_ids.append(binding['id'])
            bases = wrap.xpath('.//span[starts-with(@class,"dsModelBase")]')
            if not bases and len(wraps) == 1:
                bases = header.xpath('.//span[starts-with(@class,"dsModelBase")]')
                bases = [n for n in bases if not any(a in bases for a in n.iterancestors())]
            assert len(bases) <= 1, identity+': ambiguous Base scope'
            if bases:
                notes = [norm(n.text_content()) for n in bases[0].xpath('.//span['+cls('dsBaseSizeComment')+']')]
                add(binding['id']+':base', 'MODEL_BASE', binding['id'], {'text': flow(bases[0], skip=('dsBaseSizeComment',)), 'notes': notes}, file=file, xpath=doc.getroottree().getpath(bases[0]))
        accounting.append(dict(sourcePointer=pointer+'/statline', classification='CAPTURE_OCCURRENCE_REFERENCE', entityId=profile_ids[0], reason='Raw model profiles own characteristics; capture flattens mixed profiles.'))
        for field, kind in [('weapons', 'WEAPON_PROFILE'), ('wargearOptions', 'WARGEAR_OPTION'), ('sections', 'DATASHEET_SECTION'), ('ruleReferences', 'RULE_REFERENCE')]:
            for j, child in enumerate(unit[field]):
                data = omit(child, ['sourceId'])
                if field == 'ruleReferences':
                    tables = frame.xpath('.//table['+cls('dsCoreArmy')+']')
                    assert len(tables) == len(unit[field]), identity+': Core/Army reference groups'
                    groups = []
                    for row in tables[j].xpath('.//tr'):
                        label, value = row.xpath('./td')
                        entries = []
                        for k, item in enumerate(value.xpath('.//*[@data-tooltip-content]')):
                            entries.append({'id': child['sourceId']+':entry:'+str(len(groups)+1)+':'+str(k+1), 'label': norm(item.text_content()), 'sourceTooltipIds': [item.get('data-tooltip-content')]})
                        assert entries, identity+': empty rule reference group'
                        groups.append({'label': norm(label.text_content()), 'entries': entries})
                    data = {'order': child['order'], 'groups': groups}
                if field == 'sections':
                    data['blocks'] = []
                    for k, block in enumerate(child['blocks']):
                        if re.match(r'^YOUR\b.*COST', block['text'], re.I):
                            accounting.append(dict(sourcePointer=f'{pointer}/{field}/{j}/blocks/{k}', classification='MFM_OWNED', reason='Pricing is not Army-owned.'))
                        else:
                            data['blocks'].append(copy.deepcopy(block))
                add(child['sourceId'], kind, identity, data, f'{pointer}/{field}/{j}')
        # Preserve raw facts omitted by the structured capture. These are factual
        # source supplements, not inferred effects or attachment policy contracts.
        combat = next(n for n in frame if n.get('class') == 'ds2col')
        for section in unit['sections']:
            if section['title'] not in ('LEADER', 'SUPPORT', 'ATTACHED UNIT'):
                continue
            heading, = combat.xpath('.//div['+cls('dsHeader')+' and normalize-space(.)="'+section['title']+'"]')
            body = heading.getnext()
            references = []
            for link in body.xpath('.//a[@href]'):
                path = urlparse(link.get('href')).path.rstrip('/')
                if path in by_source_unit:
                    references.append({'targetId': by_source_unit[path], 'sourceHref': link.get('href')})
                elif any('sLegendary' in (n.get('class') or '').split() for n in link.iterancestors()):
                    references.append({'excludedScope': 'LEGENDS', 'sourceHref': link.get('href'), 'label': norm(link.text_content())})
                elif '/the-rules/' in path:
                    references.append({'externalDomain': 'CORE', 'sourceHref': link.get('href'), 'label': norm(link.text_content())})
                else:
                    raise AssertionError(identity+': unresolved attachment reference '+path)
            assert references, identity+': attachment declaration without source references'
            add(section['sourceId']+':attachment-declaration', 'ATTACHMENT_DECLARATION', identity, {'roleHeading': section['title'], 'sourceSectionId': section['sourceId'], 'references': references}, file=file, xpath=doc.getroottree().getpath(body))
        compact = lambda value: re.sub(r'\s+', '', re.sub(r'^\s*[-•]\s*', '', value, flags=re.M))
        known = compact('\n'.join([b['text'] for s in unit['sections'] for b in s['blocks']]+[o['text'] for o in unit['wargearOptions']]))
        supplements = []
        for node in combat.xpath('.//div['+cls('dsAbility')+' or '+cls('dsOptionsComment')+']'):
            value = flow(node)
            if not value or re.match(r'^YOUR\b.*COST', value, re.I):
                continue
            if compact(value) not in known:
                supplements.append({'text': value, 'xpath': doc.getroottree().getpath(node)})
        if supplements:
            add(unit['sourceId']+':raw-supplement', 'SOURCE_DATASHEET_SUPPLEMENT', identity, {'blocks': supplements}, file=file, xpath=doc.getroottree().getpath(combat))
        keywords = frame.xpath('./div['+cls('ds2colKWFlat')+']')[0]
        scoped = []
        for child in keywords:
            if 'KEYWORDS' in norm(child.text_content()):
                title = norm(child.text).rstrip(':')
                key = 'faction' if 'FACTION' in title else 'all-models'
                for span in child:
                    if 'dsVertLine' in (span.get('class') or '').split():
                        title, key = norm(span.tail).rstrip(':'), 'underseer'
                    elif span.tag == 'span':
                        values = [norm(v) for v in span.text_content().split(';') if norm(v)]
                        scoped.append({'id': unit['sourceId']+':keyword-scope:'+key, 'label': title, 'keywords': values, 'xpath': doc.getroottree().getpath(span)})
        add(unit['sourceId']+':keyword-scopes', 'KEYWORD_SCOPES', identity, {'scopes': scoped}, file=file, xpath=doc.getroottree().getpath(keywords))
        for field in ('keywords', 'factionKeywords'):
            accounting.append({'sourcePointer': pointer+'/'+field, 'classification': 'CAPTURE_OCCURRENCE_REFERENCE', 'entityId': unit['sourceId']+':keyword-scopes', 'reason': 'Raw scoped keyword records own these values; flattened capture is not a second owner.'})
        marked = combat.xpath('.//*[@data-tooltip-content="#tooltip_contenttooltipPointy"]')
        if marked:
            note, = doc.xpath('//*[@id="tooltip_contenttooltipPointy"]')
            values = []
            rows = combat.xpath('.//tr['+cls('dsWeaponRow')+']')
            assert len(rows) == len(unit['weapons']), identity+': weapon source binding'
            for j, row in enumerate(rows):
                if row.xpath('.//*[@data-tooltip-content="#tooltip_contenttooltipPointy"]'):
                    values.append(unit['weapons'][j]['sourceId'])
            groups = read('books/adeptus-mechanicus/v2/weapon-selection-bindings.json')[identity]
            assert sorted(w for g in groups for w in g['weaponProfileIds']) == sorted(values), identity+': every marked profile must belong to one weapon group'
            add(unit['sourceId']+':weapon-profile-selection', 'WEAPON_PROFILE_SELECTION', identity, {'text': flow(note), 'groups': groups}, file=file, xpath=doc.getroottree().getpath(note))
        add(identity, 'DATASHEET', None, {**omit(unit, ['sourceId', 'statline', 'weapons', 'wargearOptions', 'sections', 'ruleReferences', 'keywords', 'factionKeywords', 'normalizedContentFingerprint']), 'keywordScopesId': unit['sourceId']+':keyword-scopes', 'profileIds': profile_ids, 'weaponIds': [w['sourceId'] for w in unit['weapons']], 'sectionIds': [s['sourceId'] for s in unit['sections']], 'wargearOptionIds': [w['sourceId'] for w in unit['wargearOptions']], 'ruleReferenceIds': [r['sourceId'] for r in unit['ruleReferences']]}, pointer)

    hub = docs['adeptus-mechanicus.html']
    for i, rule in enumerate(corpus['armyRules']):
        add(rule['sourceId'], 'ARMY_RULE', None, {**omit(rule, ['sourceId', 'components', 'normalizedContentFingerprint']), 'componentIds': [c['sourceId'] for c in rule['components']]}, f'/armyRules/{i}')
        for j, component in enumerate(rule['components']):
            record = add(component['sourceId'], 'ARMY_RULE_COMPONENT', rule['sourceId'], omit(component, ['sourceId']), f'/armyRules/{i}/components/{j}')
            if not component['text']:
                paragraph, = hub.xpath('//*[@id="Doctrina-Imperatives"]/../p['+cls('ShowFluff')+']')
                assert norm(paragraph.tail), 'Missing raw Army Rule activation text'
                record['data']['text'] = norm(paragraph.tail)
                record['fieldProvenance'] = {'text': {'sourcePath': SOURCE+'/adeptus-mechanicus.html', 'sha256': page_info['adeptus-mechanicus.html']['sha256'], 'xpath': hub.getroottree().getpath(paragraph)+'/following-sibling::text()[1]'}}

    for i, detachment in enumerate(corpus['detachments']):
        pointer = '/detachments/'+str(i)
        owner = detachment['sourceId']
        add(owner, 'DETACHMENT', None, {**omit(detachment, ['sourceId', 'rule', 'enhancements', 'stratagems', 'normalizedContentFingerprint', 'detachmentPoints', 'forceDisposition']), 'ruleId': detachment['rule']['sourceId'], 'enhancementIds': [x['sourceId'] for x in detachment['enhancements']], 'stratagemIds': [x['sourceId'] for x in detachment['stratagems']]}, pointer)
        for field in ['detachmentPoints', 'forceDisposition']:
            accounting.append(dict(sourcePointer=pointer+'/'+field, classification='MFM_OWNED', reason='Centralized MFM remains numeric/assignment owner.'))
        rule = detachment['rule']
        data = omit(rule, ['sourceId'])
        container, = hub.xpath('//div[@data-f="'+detachment['filterId']+'" and @class="clFl"]')
        heading, = container.xpath('.//h2[starts-with(@id,"Detachment-Rule")]')
        raw_rule = heading.getparent().getnext()
        tables = raw_rule.xpath('.//table')
        assert len(tables) == len(rule['tables']), owner+': table occurrence evidence'
        data['tables'], occurrences = [], []
        for table, captured in zip(tables, rule['tables']):
            nested = table.xpath('.//table')
            source_rows = [[norm(cell.text_content()) for cell in row if cell.tag in ('td', 'th')] for row in table.xpath('.//tr')]
            assert [row for row in source_rows if row] == captured['rows'], captured['sourceId']+': exact table values'
            if nested:
                semantic = [other['sourceId'] for n, other in zip(tables, rule['tables']) if table in n.iterancestors() and not n.xpath('.//table')]
                occurrences.append({'sourceRecordId': captured['sourceId'], 'semanticTableIds': semantic, 'classification': 'LAYOUT_WRAPPER_REFERENCE'})
                accounting.append({'sourcePointer': pointer+'/rule/tables/'+str(len(occurrences)-1), 'classification': 'CAPTURE_OCCURRENCE_REFERENCE', 'entityId': rule['sourceId'], 'reason': 'Nested layout occurrence references the innermost semantic table; not a second table owner.'})
            else:
                data['tables'].append(copy.deepcopy(captured))
                occurrences.append({'sourceRecordId': captured['sourceId'], 'semanticTableIds': [captured['sourceId']], 'classification': 'CANONICAL_FACT'})
        for table in tables:
            if not any(ancestor in tables for ancestor in table.iterancestors()):
                flattened = norm(table.text_content())
                assert flattened in norm(data['text']), owner+': table source text evidence'
                data['text'] = data['text'].replace(flattened, '').strip()
        data['tableOccurrences'] = occurrences
        add(rule['sourceId'], 'DETACHMENT_RULE', owner, data, pointer+'/rule')
        for field, kind in [('enhancements', 'ENHANCEMENT'), ('stratagems', 'STRATAGEM')]:
            for j, child in enumerate(detachment[field]):
                value = omit(child, ['sourceId', 'wahaPoints', 'weaponProfiles'])
                if field == 'enhancements':
                    nodes = container.xpath('.//ul['+cls('EnhancementsPts')+']')
                    assert len(nodes) == len(detachment['enhancements']), owner+': complete Enhancement source denominator'
                    raw_card = nodes[j].getparent()
                    type_labels = nodes[j].xpath('.//span['+cls('EnhUpgrade')+']')
                    assert len(type_labels) <= 1
                    if type_labels:
                        value['sourceTypeLabel'] = norm(type_labels[0].text_content())
                    if not child['text']:
                        value['text'] = flow(raw_card, skip=('ShowFluff', 'EnhancementsPts', 'itc'))
                        assert value['text'], child['sourceId']+': missing enhancement qualifier'
                    for k, weapon in enumerate(child.get('weaponProfiles', [])):
                        wid = weapon.get('sourceId', child['sourceId']+':weapon-profile')
                        add(wid, 'WEAPON_PROFILE', child['sourceId'], omit(weapon, ['sourceId']), f'{pointer}/{field}/{j}/weaponProfiles/{k}')
                        value.setdefault('weaponIds', []).append(wid)
                    accounting.append(dict(sourcePointer=f'{pointer}/{field}/{j}/wahaPoints', classification='MFM_OWNED', reason='Enhancement cost has one centralized MFM owner.'))
                record = add(child['sourceId'], kind, owner, value, f'{pointer}/{field}/{j}')
                if field == 'enhancements' and not child['text']:
                    record['fieldProvenance'] = {'text': {'sourcePath': SOURCE+'/adeptus-mechanicus.html', 'sha256': page_info['adeptus-mechanicus.html']['sha256'], 'xpath': hub.getroottree().getpath(raw_card)}}
                if field == 'enhancements' and type_labels:
                    record.setdefault('fieldProvenance', {})['sourceTypeLabel'] = {'sourcePath': SOURCE+'/adeptus-mechanicus.html', 'sha256': page_info['adeptus-mechanicus.html']['sha256'], 'xpath': hub.getroottree().getpath(type_labels[0])}
    for i, erratum in enumerate(corpus['errata']):
        add(erratum['sourceId'], 'SOURCE_ERRATUM', None, omit(erratum, ['sourceId']), '/errata/'+str(i))
    # References are explicitly metadata, never executable rules or authority for
    # unit×rule answers. Excluded-mode navigation stays in source accounting only.
    for i, reference in enumerate(corpus['references']):
        accounting.append(dict(sourcePointer='/references/'+str(i), classification='REFERENCE_METADATA', value=copy.deepcopy(reference)))
    intro, = hub.xpath('//*[@id="Introduction"]/following-sibling::div[1]')
    introductory = flow(intro)
    excluded_intro = re.findall(r'If you are playing a Crusade battle,.*?(?:rules\.|rules\.)', introductory)
    assert len(excluded_intro) == 2, 'Explicit excluded-mode Introduction source clauses'
    for text in excluded_intro:
        introductory = introductory.replace(text, '')
        accounting.append({'classification': 'EXCLUDED_SCOPE', 'sourcePath': SOURCE+'/adeptus-mechanicus.html', 'xpath': hub.getroottree().getpath(intro), 'text': text, 'reason': 'Crusade is excluded by accepted product scope.'})
    add('book-introduction', 'BOOK_USAGE', None, {'text': '\n'.join(norm(line) for line in introductory.splitlines() if norm(line))}, file='adeptus-mechanicus.html', xpath=hub.getroottree().getpath(intro))
    # Update directives are evidence, not competing copies of operative rules.
    # The exact official document remains a source artifact; these records own
    # only document/page references, with canonical targets, not copied effects.
    official = 'books/adeptus-mechanicus/v2/sources/gw-adeptus-mechanicus-faction-pack-v1.3.pdf'
    updates = read('books/adeptus-mechanicus/v2/update-bindings.json')
    for update in updates:
        assert all(target in ids for target in update['targetIds']), update['id']+': canonical update target'
        record = add(update['id'], 'SOURCE_UPDATE_REFERENCE', None, omit(update, ['id']), None)
        record['provenance'] = {'sourceId': 'gw-am-faction-pack-v1.3', 'sourcePath': official, 'sha256': next(s['sha256'] for s in enrollment['artifacts'] if s['path']==official), 'page': update['page']}
    # Every scalar capture leaf has an explicit disposition. This projection
    # accounts for metadata/occurrences as well as facts, without promoting them
    # into a second gameplay owner. Unknown source domains fail the build.
    leaf_accounting = []
    metadata_roots = {'schema', 'edition', 'captureDate', 'currentnessCutoff', 'scope', 'pages', 'inventory', 'gameplayUnits', 'corpusFingerprint'}
    for pointer, value in leaves(corpus):
        root = pointer.split('/')[1]
        if root in metadata_roots:
            disposition = {'classification': 'SOURCE_METADATA', 'reason': 'Capture identity, scope, integrity or diagnostic count; not an operative gameplay fact.'}
        else:
            matches = [a for a in accounting if a.get('sourcePointer') and (pointer == a['sourcePointer'] or pointer.startswith(a['sourcePointer']+'/'))]
            assert matches, 'Unclassified accepted source leaf: '+pointer
            owner = max(matches, key=lambda a: len(a['sourcePointer']))
            disposition = {k: owner[k] for k in ('classification', 'entityId', 'reason') if k in owner}
            if pointer.rsplit('/', 1)[-1] in ('sourceId', 'normalizedContentFingerprint', 'sourceBadges', 'url', 'filterId', 'detachmentCode'):
                disposition['classification'] = 'SOURCE_METADATA'
            if '/ruleReferences/' in pointer and pointer.endswith('/label'):
                disposition['classification'] = 'CAPTURE_OCCURRENCE_REFERENCE'
                disposition['reason'] = 'Concatenated capture label; raw Core/Army entries retain individual source reference identity.'
        leaf_accounting.append({'sourcePointer': pointer, **disposition})
    base = {'schema': 'am-v2-canonical/v1', 'bookId': 'adeptus-mechanicus', 'entities': entities, 'sources': enrollment, 'sourceAccounting': accounting, 'sourceLeafAccounting': leaf_accounting, 'scope': enrollment['scope']}
    effective = copy.deepcopy(base)
    effective['schema'] = 'am-v2-effective/v1'
    effective['ruleContractsStarted'] = False
    effective['rosterRuntimeStarted'] = False
    effective['appliedSourceAdjudications'] = []
    index = {record['id']: record for record in effective['entities']}
    defects = read(SOURCE+'/source-defects.json')
    for operation in read('books/adeptus-mechanicus/v2/source-adjudications.json'):
        assert any(d['id'] == operation['sourceDefectId'] for d in defects['records']), 'Unaccepted source correction'
        target = index[operation['targetId']]
        owner = target['data']
        for key in operation['field'][:-1]:
            owner = owner[key]
        key = operation['field'][-1]
        assert owner[key] == operation['before'], 'Source correction does not match accepted occurrence'
        evidence = {'sourcePath': SOURCE+'/source-defects.json', 'sourceDefectId': operation['sourceDefectId']}
        if operation.get('evidence'):
            proof = read('books/adeptus-mechanicus/v2/'+operation['evidence'])
            source = read(proof['sourcePath'])
            for part in proof['pointer'].strip('/').split('/'):
                source = source[int(part)] if isinstance(source, list) else source[part]
            assert source == proof['acceptedTitle'] == operation['after']
            assert proof['targetId'] == operation['targetId']
            evidence = proof
        owner[key] = operation['after']
        target.setdefault('fieldProvenance', {})['/'.join(map(str, operation['field']))] = evidence
        effective['appliedSourceAdjudications'].append(copy.deepcopy(operation))
    return {'base': base, 'effective': effective}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    output = build()
    target = HERE/'generated'
    if not args.check:
        target.mkdir(exist_ok=True)
    for name, value in output.items():
        data = (json.dumps(value, indent=2, ensure_ascii=False)+'\n').encode('utf8')
        file = target/(name+'.json')
        if args.check:
            assert file.read_bytes() == data, 'Non-deterministic generated projection: '+name
        else:
            file.write_bytes(data)
    print(json.dumps({'entities': len(output['base']['entities'])}))


if __name__ == '__main__':
    main()
