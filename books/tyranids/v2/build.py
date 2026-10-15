"""Tyranids source-owned V2 facts. Offline build; no gameplay, UI or legacy build.

Accepted occurrences are joined through persistent source-address bindings.
Raw named blocks repair the historical one-rule parser; raw QA independently
checks the remaining capture. MFM values stay exclusively in the central owner.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from lxml import html
import pdfplumber

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = 'books/tyranids/sources/waha-11e-current-2026-09-27'
HUB = SOURCE + '/tyranids.html'
BOOK = 'tyranids'
read = lambda path: json.loads(Path(path).read_text(encoding='utf-8'))
sha = lambda value: hashlib.sha256(value).hexdigest().upper()
norm = lambda value: ' '.join(value.split())
serialize = lambda value: (json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode('utf-8')
MFM_FIELDS = {'points', 'pointSchedules', 'wahaPoints', 'paidOptions', 'paidWargear',
              'wargearCosts', 'enhancementCost', 'enhancementPoints', 'detachmentPoints',
              'forceDisposition', 'forceDispositions', 'mfmQualifiers'}


def unique(rows, key='id'):
    result = {}
    for row in rows:
        value = row[key]
        if not value or value in result:
            raise ValueError('Missing/duplicate identity: '+str(value))
        result[value] = row
    return result


def body(node):
    node = copy.deepcopy(node)
    for bad in node.xpath('.//h2|.//h3|.//script|.//style|.//*[contains(concat(" ",normalize-space(@class)," ")," ShowFluff ") or contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]'):
        bad.drop_tree()
    for br in node.xpath('.//br'):
        br.tail = '\n'+(br.tail or '')
    for li in node.xpath('.//li'):
        li.text = '\n- '+(li.text or '')
        li.tail = '\n'+(li.tail or '')
    return '\n'.join(norm(line) for line in ''.join(node.itertext()).splitlines() if norm(line))


def verify_sources(enrollment):
    artifacts = unique(enrollment['artifacts'], 'path')
    for path, proof in artifacts.items():
        raw = (ROOT/path).read_bytes()
        if sha(raw) != proof['sha256'] or len(raw) != proof['bytes']:
            raise ValueError('Source integrity mismatch: '+path)
        if 'capturedSha256' in proof:
            captured = raw.replace(b'\n', b'\r\n')
            if b'\r' in raw or sha(captured) != proof['capturedSha256'] or len(captured) != proof['capturedBytes']:
                raise ValueError('Historical EOL representation mismatch: '+path)
    return artifacts


def raw_named_rules(corpus, bindings):
    tree = html.fromstring((ROOT/HUB).read_text(encoding='utf-8'))
    declared = {(row['ownerSourceId'], row['anchor']): row for row in bindings['namedRules']}
    if len(declared) != len(bindings['namedRules']):
        raise ValueError('Duplicate named rule binding')
    result = []
    for detachment in corpus['detachments']:
        headings = tree.xpath('//div[@data-f=$f]//h2[starts-with(@id,"Detachment-Rule")]', f=detachment['filterId'])
        if len(headings) != 1:
            raise ValueError('Ambiguous Detachment rule section')
        node = headings[0].getparent().getnext()
        while node is not None and not node.xpath('self::h2|.//h2'):
            for heading in node.xpath('self::h3|.//h3'):
                if heading.xpath('ancestor::*[contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]'):
                    continue
                previous = heading.getprevious()
                anchor = heading.get('id') or (previous.get('name') if previous is not None and previous.tag == 'a' else None)
                key = (detachment['sourceId'], anchor)
                if key not in declared:
                    raise ValueError('Unbound raw named rule '+str(key))
                result.append({**declared[key], 'title': norm(heading.text_content()), 'text': body(heading.getparent())})
            node = node.getnext()
    if len(result) != len(declared) or {(r['ownerSourceId'], r['anchor']) for r in result} != set(declared):
        raise ValueError('Missing/duplicate raw named rule')
    return result


def collect(corpus, source_bindings):
    rows = []
    def add(item, kind, parent, pointer, document, data=None):
        rows.append({'sourceId': item['sourceId'], 'kind': kind, 'ownerSourceId': parent,
                     'pointer': pointer, 'document': document, 'data': copy.deepcopy(item if data is None else data)})
    for i, rule in enumerate(corpus['armyRules']):
        add(rule, 'ARMY_RULE', None, f'/armyRules/{i}', HUB)
        for j, component in enumerate(rule['components']):
            add(component, 'ARMY_RULE_COMPONENT', rule['sourceId'], f'/armyRules/{i}/components/{j}', HUB)
    named = raw_named_rules(corpus, source_bindings)
    for i, det in enumerate(corpus['detachments']):
        add(det, 'DETACHMENT', None, f'/detachments/{i}', HUB)
        for rule in [r for r in named if r['ownerSourceId'] == det['sourceId']]:
            add(rule, 'DETACHMENT_RULE', det['sourceId'], '#'+rule['anchor'], HUB,
                {'title': rule['title'], 'text': rule['text'], 'tableIds': []})
        for j, table in enumerate(det['rule']['tables']):
            # Table text is already owned by the complete rule text. This is an
            # explicitly non-owning layout occurrence, not another gameplay fact.
            add(table, 'SOURCE_PRESENTATION_NOTE', det['rule']['sourceId'], f'/detachments/{i}/rule/tables/{j}', HUB,
                {'classification': 'TABLE_OCCURRENCE_IN_RULE_TEXT', 'scalarOwnership': False,
                 'renderedBySourceId': det['rule']['sourceId']})
        for field, kind in [('enhancements', 'ENHANCEMENT'), ('stratagems', 'STRATAGEM')]:
            for j, item in enumerate(det[field]):
                add(item, kind, det['sourceId'], f'/detachments/{i}/{field}/{j}', HUB)
    models = unique(source_bindings['modelUnits'], 'sourceId')
    for i, unit in enumerate(corpus['datasheets']):
        page, = [p for p in corpus['pages'] if p['url'] == unit['url']]
        document = SOURCE+'/'+page['file']
        add(unit, 'DATASHEET', None, f'/datasheets/{i}', document)
        for field, kind in [('profiles', 'MODEL_PROFILE'), ('weapons', 'WEAPON_PROFILE'), ('wargearOptions', 'WARGEAR_OPTION'),
                            ('sections', 'DATASHEET_SECTION'), ('ruleReferences', 'RULE_REFERENCE')]:
            for j, item in enumerate(unit[field]):
                add(item, kind, unit['sourceId'], f'/datasheets/{i}/{field}/{j}', document)
        for member in models[unit['sourceId']]['members']:
            add(member, 'COMPOSITION_MEMBER', unit['sourceId'], member['sourcePointer'], document)
    for i, item in enumerate(corpus['errata']):
        add(item, item['class'], None, f'/errata/{i}', HUB)
    for supplement in source_bindings['rawSupplements']:
        tree = html.fromstring((ROOT/supplement['document']).read_text(encoding='utf-8'))
        nodes = tree.xpath(supplement['xpath'])
        if len(nodes) != 1:
            raise ValueError('Missing/ambiguous raw supplemental rule')
        text = body(nodes[0])
        if sha(text.encode()) != supplement['textSha256']:
            raise ValueError('Raw supplemental wording changed')
        add(supplement, supplement['kind'], supplement['ownerSourceId'], supplement['xpath'], supplement['document'],
            {'title': supplement['title'], 'text': text, 'scope': 'UNIT', 'conditionalOnly': True})
    unique(rows, 'sourceId')
    return rows


def official_occurrences():
    declarations = read(HERE/'official-bindings.json')
    result = []
    with pdfplumber.open(ROOT/declarations['document']) as pdf:
        for item in declarations['occurrences']:
            text = norm(pdf.pages[item['page']-1].crop(tuple(item['bbox'])).extract_text(x_tolerance=2, y_tolerance=3) or '')
            if sha(text.encode()) != item['textSha256']:
                raise ValueError('Official PDF occurrence mismatch: '+item['id'])
            result.append({**item, 'text': text, 'provenance': {
                'sourceId': declarations['sourceId'], 'document': declarations['document'], 'sha256': declarations['sha256'],
                'page': item['page'], 'bbox': item['bbox'], 'textSha256': item['textSha256'],
                'effectiveFrom': declarations['effectiveFrom'], 'authority': 'AUTHORITATIVE_CURRENT'}})
    return result


def official_body(text):
    value = text.split('Change to:', 1)[1].strip().strip('‘’\'')
    return value.replace('MONSTER/ VEHICLE', 'MONSTER/VEHICLE').replace('‑', '-').replace('▪ ', '\n- ')


def apply_official(base, official, bindings):
    effective = copy.deepcopy(base)
    effective['schema'] = 'tyranids-v2-effective/v1'
    records = unique(effective['entities'])
    ids = {r['sourceEntityId']: r['id'] for r in bindings['bindings']}
    updates = []
    for proof in official:
        mode = proof['mode']
        if mode in {'VERIFY_CURRENT', 'UNRESOLVED_EVIDENCE'}:
            target_ids = [ids[sid] for sid in proof.get('targetIds', [])]
            if any(identity not in records for identity in target_ids):
                raise ValueError('Unresolved official source target')
            if mode == 'VERIFY_CURRENT':
                # The source address must contain its named occurrence; merely
                # finding a valid canonical ID cannot establish PDF provenance.
                for identity in target_ids:
                    record = records[identity]
                    label = record['data'].get('title', record['data'].get('name'))
                    if record['kind'] == 'DATASHEET_SECTION':
                        label = records[record['parentId']]['data']['title']
                    if not label or norm(label).casefold() not in norm(proof['text']).casefold():
                        raise ValueError('Official source crop does not contain its named owner: '+identity)
            updates.append({'id': proof['id'], 'status': mode, 'provenance': proof['provenance'], 'targetIds': target_ids})
            continue
        target = records[ids[proof['targetSourceId']]] if proof.get('targetSourceId') else None
        if mode == 'REPLACE_BLOCK':
            old = target['data']['blocks'][proof['blockIndex']]['text']
            if sha(old.encode()) != proof['beforeSha256']:
                raise ValueError('Official block target changed')
            name = proof['ruleName']
            target['data']['blocks'][proof['blockIndex']]['text'] = name+': '+official_body(proof['text'])
            # The obsolete Designer's Note belongs to the replaced Malign
            # Presence block in the accepted source, not to an unrelated rule.
            target.setdefault('fieldProvenance', {})[f'blocks/{proof["blockIndex"]}/text'] = proof['provenance']
        elif mode == 'REPLACE_STRATAGEM_EFFECT':
            line, = [r for r in target['data']['lines'] if r['label'] == 'EFFECT']
            if sha(line['text'].encode()) != proof['beforeSha256']:
                raise ValueError('Official Stratagem target changed')
            value = proof['text'].split('EFFECT: ', 1)[1].split('VANGUARD ONLSAUGHT DETACHMENT')[0].strip().rstrip('’')
            line['text'] = value.replace('‑', '-')
            target.setdefault('fieldProvenance', {})['lines/EFFECT'] = proof['provenance']
        elif mode == 'SUPPRESS_REFERENCE':
            if target['data']['label'] != 'Hover':
                raise ValueError('Wrong official suppression target')
            target['data'].update(status='SUPERSEDED', suppressionProvenance=proof['provenance'])
            records[target['parentId']]['data']['ruleReferenceIds'].remove(target['id'])
        elif mode == 'ADD_REFERENCE':
            identity = ids[proof['newSourceId']]
            if identity in records:
                raise ValueError('Duplicate official ability reference')
            unit = target
            record = {'id': identity, 'kind': 'RULE_REFERENCE', 'bookId': BOOK, 'parentId': unit['id'], 'sourceEntityId': proof['newSourceId'],
                'data': {'label': 'Shadow in the Warp', 'scope': 'MODEL', 'conditionalOnly': True,
                         'recipient': {'scope': 'MODEL', 'modelProfileIds': unit['data']['profileIds'],
                                       'compositionMemberIds': unit['data']['compositionMemberIds']}}, 'provenance': proof['provenance']}
            effective['entities'].append(record); records[identity] = record
            unit['data']['ruleReferenceIds'].append(identity)
        elif mode == 'REPLACE_WEAPON_ABILITY':
            target['data']['text'] = official_body(proof['text'])
            target['fieldProvenance'] = {'text': proof['provenance']}
        elif mode == 'ADD_FAQ':
            identity = ids[proof['newSourceId']]
            question, answer = proof['text'].removeprefix('Q: ').split(' A: ', 1)
            record = {'id': identity, 'kind': 'FAQ', 'bookId': BOOK, 'sourceEntityId': proof['newSourceId'],
                'parentId': ids['datasheet-biovores'], 'data': {'title': question, 'text': answer, 'conditionalOnly': True},
                'provenance': proof['provenance']}
            if identity in records:
                raise ValueError('Duplicate official FAQ')
            effective['entities'].append(record); records[identity] = record
        else:
            raise ValueError('Unknown source correction mode '+mode)
        updates.append({'id': proof['id'], 'status': 'APPLIED', 'provenance': proof['provenance'],
                        'targetIds': [target['id']] if target else [ids[proof['newSourceId']]]})
    effective['officialUpdates'] = updates
    return effective


def build():
    enrollment = read(HERE/'sources/enrollment.json')
    artifacts = verify_sources(enrollment)
    corpus = read(ROOT/SOURCE/'corpus.json')
    source_bindings = read(HERE/'source-bindings.json')
    bindings = read(HERE/'identity-bindings.json')
    declarations = unique(bindings['bindings'], 'sourceEntityId')
    unique(bindings['bindings'])
    rows = collect(corpus, source_bindings)
    official = official_occurrences()
    expected_ids = {r['sourceId'] for r in rows} | {p['newSourceId'] for p in official if p.get('newSourceId')}
    if set(declarations) != expected_ids:
        raise ValueError('Missing/extra persistent source binding')
    cid = lambda sid: declarations[sid]['id']
    models = unique(source_bindings['modelUnits'], 'sourceId')
    records = []
    for row in rows:
        sid, kind, parent = row['sourceId'], row['kind'], row['ownerSourceId']
        declaration = declarations[sid]
        if declaration['kind'] != kind or declaration['ownerSourceId'] != parent:
            raise ValueError('Wrong canonical kind/owner '+sid)
        data = copy.deepcopy(row['data'])
        for field in ['sourceId', 'class', 'normalizedContentFingerprint', 'wahaPoints']:
            data.pop(field, None)
        children = [r for r in rows if r['ownerSourceId'] == sid]
        child_ids = lambda kind: [cid(r['sourceId']) for r in children if r['kind'] == kind]
        if kind == 'DATASHEET':
            data = {key: data[key] for key in ['title', 'url', 'keywords', 'factionKeywords', 'keywordGroups']}
            data.update(profileIds=child_ids('MODEL_PROFILE'), weaponIds=child_ids('WEAPON_PROFILE'),
                sectionIds=child_ids('DATASHEET_SECTION'), wargearOptionIds=child_ids('WARGEAR_OPTION'),
                ruleReferenceIds=child_ids('RULE_REFERENCE'), compositionMemberIds=child_ids('COMPOSITION_MEMBER'))
        elif kind == 'ARMY_RULE':
            data = {'title': data['title'], 'componentIds': child_ids('ARMY_RULE_COMPONENT'), 'conditionalOnly': True}
        elif kind == 'DETACHMENT':
            data = {'title': data['title'], 'ruleIds': child_ids('DETACHMENT_RULE'),
                'enhancementIds': child_ids('ENHANCEMENT'), 'stratagemIds': child_ids('STRATAGEM')}
        elif kind == 'MODEL_PROFILE':
            data['compositionMemberIds'] = [cid(m['sourceId']) for m in models[parent]['members'] if m['modelProfileSourceId'] == sid]
            data['scope'] = 'MODEL'
        elif kind == 'COMPOSITION_MEMBER':
            data = {'name': data['name'], 'quantity': data['quantity'], 'sourceText': data['sourceLine'],
                    'modelProfileId': cid(data['modelProfileSourceId']), 'scope': 'MODEL'}
        elif kind == 'DATASHEET_SECTION' and data['title'] == 'UNIT COMPOSITION':
            data['memberIds'] = [cid(m['sourceId']) for m in models[parent]['members']]
        elif kind == 'DATASHEET_SECTION' and data['title'] == 'TRANSPORT':
            declaration = copy.deepcopy(source_bindings['transports'][sid])
            if sha('\n'.join(b['text'] for b in data['blocks']).encode()) != declaration['sourceTextSha256']:
                raise ValueError('Transport restrictions source changed')
            data['declaration'] = declaration
        elif kind == 'DATASHEET_SECTION' and data['title'] == 'LEADER':
            members = models[parent]['members']
            if parent == 'datasheet-hyperadapted-raveners':
                members = [m for m in members if m['modelProfileSourceId'] == parent+':profile:1']
            data['sourceModelProfileIds'] = sorted({cid(m['modelProfileSourceId']) for m in members})
            data['scope'] = 'MODEL_DECLARATION'
        elif kind == 'RULE_REFERENCE':
            # This declares factual native recipients, not an executable effect.
            member_rows = models[parent]['members']
            if sid == 'datasheet-hyperadapted-raveners:rule-reference:3':
                member_rows = [m for m in member_rows if m['modelProfileSourceId'] == parent+':profile:1']
            data['recipient'] = {'scope': 'MODEL', 'modelProfileIds': sorted({cid(m['modelProfileSourceId']) for m in member_rows}),
                                 'compositionMemberIds': [cid(m['sourceId']) for m in member_rows]}
            data['scope'] = 'MODEL'
            data['conditionalOnly'] = data['label'].startswith(('Synapse', 'Shadow'))
        elif kind == 'ENHANCEMENT':
            eligibility = data['text'].split('.', 1)[0]+'.'
            scope = source_bindings['enhancementScopes'][sid]
            if ('unit only' in eligibility.lower()) != (scope == 'UNIT'):
                raise ValueError('Enhancement physical scope changed '+sid)
            data.update(scope=scope, itemKind='UPGRADE' if scope == 'UNIT' else 'ENHANCEMENT', eligibilityText=eligibility)
        if kind in {'DETACHMENT_RULE', 'STRATAGEM', 'DATASHEET_SECTION'}:
            data['executable'] = False
        if kind == 'STRATAGEM':
            if not {'WHEN', 'TARGET', 'EFFECT'} <= {r['label'] for r in data['lines']}:
                raise ValueError('Incomplete Stratagem source wording')
        proof = {'sourceId': 'tyranids-waha-11e-2026-09-27', 'document': row['document'],
                 'sha256': artifacts[row['document']]['sha256'], 'sourceEntityId': sid, 'pointer': row['pointer'],
                 'authority': 'ACCEPTED_SECONDARY', 'corpusDocument': SOURCE+'/corpus.json',
                 'corpusSha256': artifacts[SOURCE+'/corpus.json']['sha256']}
        if kind == 'COMPOSITION_MEMBER':
            proof['sourceLineIndex'] = row['data']['sourceLineIndex']
        records.append({'id': cid(sid), 'kind': kind, 'sourceEntityId': sid, 'bookId': BOOK, 'data': data,
                        'provenance': proof, **({'parentId': cid(parent)} if parent else {})})
    native = {}
    for record in records:
        if record['kind'] == 'RULE_REFERENCE' and record['data']['label'] == 'Feel No Pain 5+':
            native[record['id']] = {'abilities': [{'name': 'Feel No Pain', 'value': 5}], 'scope': 'MODEL',
                'modelProfileIds': record['data']['recipient']['modelProfileIds'],
                'compositionMemberIds': record['data']['recipient']['compositionMemberIds'], 'provenance': record['provenance']}
    base = {'schema': 'tyranids-v2-canonical/v1', 'bookId': BOOK, 'edition': '11E', 'entities': records,
        'sourceAccounting': [{key: row[key] for key in ['sourceId', 'kind', 'ownerSourceId', 'pointer', 'document']} for row in rows],
        'sourceReferences': copy.deepcopy(corpus['references']),
        'rosterReferenceSemantics': native, 'mfmBoundary': {'owner': 'CENTRALIZED_MFM', 'sourceVersion': 'v1.6',
            'bindingsDocument': 'books/tyranids/v2/mfm-bindings.json', 'valuesCopied': False},
        'sourceEnrollment': 'books/tyranids/v2/sources/enrollment.json', 'gameplayContractsImplemented': 0,
        'rosterIntegrationImplemented': False, 'presentationImplemented': False, 'contentCertified': False}
    effective = apply_official(base, official, bindings)
    conflicts = read(HERE/'source-issues.json')
    effective['unresolvedSources'] = conflicts['unresolved']
    for proof in official:
        if proof['mode'] == 'UNRESOLVED_EVIDENCE':
            effective['unresolvedSources'][0].setdefault('officialEvidence', []).append({'text': proof['text'], 'provenance': proof['provenance']})
    effective['entities'].append({'id': 'tyranids-source-conflict-foul-spores', 'kind': 'SOURCE_CONFLICT', 'bookId': BOOK,
        'parentId': cid('datasheet-venomthropes'), 'data': copy.deepcopy(effective['unresolvedSources'][0]),
        'provenance': [p['provenance'] for p in official if p['mode'] == 'UNRESOLVED_EVIDENCE']})
    for record in effective['entities']:
        if record['id'] == cid('datasheet-venomthropes:section:1'):
            record['data']['unresolvedSourceIds'] = ['tyranids-source-conflict-foul-spores']
    validate(base); validate(effective)
    counts = dict(sorted(Counter(r['kind'] for r in effective['entities']).items()))
    census = {'schema': 'tyranids-v2-factual-census/v1', 'counts': counts, 'nativeFnpBindings': len(native),
              'officialOccurrences': len(official), 'sourceRows': len(rows), 'contentCertified': False,
              'unresolvedIds': [r['id'] for r in conflicts['unresolved']]}
    return {'base': base, 'effective': effective, 'factual-census': census}


def validate(document):
    records = unique(document['entities'])
    def visit(value):
        if isinstance(value, dict):
            for key, child in value.items():
                if key in MFM_FIELDS:
                    raise ValueError('Duplicate MFM value owner '+key)
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)
    for record in records.values():
        if record.get('bookId') != BOOK:
            raise ValueError('Wrong factual book owner')
        if not record.get('provenance'):
            raise ValueError('Missing source provenance')
        if record.get('parentId') and record['parentId'] not in records:
            raise ValueError('Missing canonical owner')
        visit(record['data'])
        if record['kind'] == 'COMPOSITION_MEMBER':
            profile = records.get(record['data']['modelProfileId'])
            if not profile or profile['kind'] != 'MODEL_PROFILE' or profile.get('parentId') != record['parentId'] or record['id'] not in profile['data']['compositionMemberIds']:
                raise ValueError('Wrong physical model/profile owner')
        if record['kind'] == 'MODEL_PROFILE':
            for identity in record['data']['compositionMemberIds']:
                member = records.get(identity)
                if not member or member.get('parentId') != record['parentId'] or member['data'].get('modelProfileId') != record['id']:
                    raise ValueError('Wrong physical profile recipients')
        for key, values in record['data'].items():
            if key.endswith('Ids') and isinstance(values, list) and key not in {'unresolvedSourceIds'}:
                if len(values) != len(set(values)) or any(v not in records for v in values):
                    raise ValueError('Missing/duplicate canonical reference '+record['id']+'/'+key)
                if record['kind'] == 'DATASHEET' and any(records[v].get('parentId') != record['id'] for v in values):
                    raise ValueError('Foreign physical unit child')
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    outputs = build()
    if not args.check:
        (HERE/'generated').mkdir(exist_ok=True)
    for name, value in outputs.items():
        target = HERE/'generated'/(name+'.json')
        if args.check:
            if not target.exists() or target.read_bytes() != serialize(value):
                raise ValueError('Stale factual output '+name)
        else:
            target.write_bytes(serialize(value))
    print(json.dumps(outputs['factual-census']))


if __name__ == '__main__':
    main()
