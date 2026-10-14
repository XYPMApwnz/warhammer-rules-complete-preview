"""Frozen EC V2 factual foundation; no legacy builder, runtime, UI or network.

Accepted source occurrences and persistent canonical bindings are separate.
Central MFM facts are referenced, never copied into Army-owned records.
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
from official_sources import read_official

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BOOK = 'emperors-children'
SOURCE = 'books/emperors-children/sources/waha-11e-current-2026-09-28'
read = lambda path: json.loads(Path(path).read_text(encoding='utf-8'))
sha = lambda value: hashlib.sha256(value).hexdigest().upper()
value_sha = lambda value: sha(json.dumps(value, ensure_ascii=False, sort_keys=True).encode())
norm = lambda text: ' '.join(text.split())
MFM_FIELDS = {'points', 'pointSchedules', 'wahaPoints', 'paidOptions', 'paidWargear', 'wargearCosts',
              'enhancementCost', 'enhancementPoints', 'detachmentPoints', 'forceDisposition',
              'forceDispositions', 'forceDispositionIds', 'mfmForceDispositionIds', 'missionForceDispositionIds', 'mfmQualifiers'}


def unique(rows, key):
    result = {}
    for row in rows:
        identity = row[key]
        if identity in result:
            raise ValueError('Duplicate identity: '+str(identity))
        result[identity] = row
    return result


def resolve(value, pointer):
    for token in pointer.strip('/').split('/') if pointer else []:
        token = token.replace('~1', '/').replace('~0', '~')
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def leaves(value, pointer=''):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from leaves(child, pointer+'/'+key.replace('~', '~0').replace('/', '~1'))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from leaves(child, pointer+'/'+str(index))
    else:
        yield pointer, value


def verify_sources(root, enrollment):
    artifacts = unique(enrollment['artifacts'], 'path')
    for name, artifact in artifacts.items():
        raw = (root/name).read_bytes()
        if sha(raw) != artifact['sha256'] or len(raw) != artifact['bytes']:
            raise ValueError('Enrolled source integrity mismatch: '+name)
        if 'capturedSha256' in artifact:
            if b'\r' in raw:
                raise ValueError('Unexpected Git source byte representation: '+name)
            captured = raw.replace(b'\n', b'\r\n')
            if sha(captured) != artifact['capturedSha256'] or len(captured) != artifact['capturedBytes']:
                raise ValueError('Historical capture representation mismatch: '+name)
    return artifacts


def collect_sources(corpus, models):
    """Source addresses only. Canonical identities come from the frozen registry."""
    rows = []
    def add(item, kind, parent, pointer, document, data=None):
        rows.append({'sourceId': item['sourceId'], 'kind': kind, 'parentSourceId': parent,
                     'sourcePointer': pointer, 'document': document,
                     'payload': copy.deepcopy(item if data is None else data)})
    hub = SOURCE+'/emperor-s-children.html'
    for i, army in enumerate(corpus['armyRules']):
        pointer = f'/armyRules/{i}'
        add(army, 'ARMY_RULE', None, pointer, hub)
        for j, child in enumerate(army['components']):
            add(child, 'ARMY_RULE_COMPONENT', army['sourceId'], f'{pointer}/components/{j}', hub)
    for i, detachment in enumerate(corpus['detachments']):
        pointer = f'/detachments/{i}'
        add(detachment, 'DETACHMENT', None, pointer, hub)
        rule = detachment['rule']
        add(rule, 'DETACHMENT_RULE', detachment['sourceId'], pointer+'/rule', hub)
        for j, table in enumerate(rule['tables']):
            add(table, 'STRUCTURED_RULE_TABLE', rule['sourceId'], f'{pointer}/rule/tables/{j}', hub)
        for field, kind in [('enhancements', 'ENHANCEMENT'), ('stratagems', 'STRATAGEM')]:
            for j, child in enumerate(detachment[field]):
                add(child, kind, detachment['sourceId'], f'{pointer}/{field}/{j}', hub)
    model_map = unique(models['datasheets'], 'sourceId')
    for i, unit in enumerate(corpus['datasheets']):
        pointer = f'/datasheets/{i}'
        page, = [page for page in corpus['pages'] if page['url'] == unit['url']]
        document = SOURCE+'/'+page['file']
        add(unit, 'DATASHEET', None, pointer, document)
        for field, kind in [('profiles', 'MODEL_PROFILE'), ('weapons', 'WEAPON_PROFILE'),
                            ('wargearOptions', 'WARGEAR_OPTION'), ('sections', 'DATASHEET_SECTION'),
                            ('ruleReferences', 'RULE_REFERENCE')]:
            for j, child in enumerate(unit[field]):
                add(child, kind, unit['sourceId'], f'{pointer}/{field}/{j}', document)
        for member in model_map[unit['sourceId']]['compositionMembers']:
            reference, = member['sourceReferences']
            add(member, 'COMPOSITION_MEMBER', unit['sourceId'], reference['path'], document)
    for i, item in enumerate(corpus['errata']):
        # Core appendix occurrences are retained in accounting, not EC fact owners.
        if item['class'] == 'FAQ' and int(item['sourceId'].split('-')[1]) > 3:
            continue
        add(item, item['class'], None, f'/errata/{i}', hub)
    unique(rows, 'sourceId')
    return rows


def validate_model_sources(corpus, models, artifacts, root):
    bindings = unique(models['datasheets'], 'sourceId')
    if set(bindings) != {unit['sourceId'] for unit in corpus['datasheets']}:
        raise ValueError('Incomplete model ownership bindings')
    for unit in corpus['datasheets']:
        declared = bindings[unit['sourceId']]
        section, = [item for item in unit['sections'] if item['title'] == 'UNIT COMPOSITION']
        lines = [line for block in section['blocks'] for line in block['text'].splitlines() if re.match(r'^- \d', line)]
        if lines != [member['sourceLine'] for member in declared['compositionMembers']]:
            raise ValueError('Physical composition source changed: '+unit['sourceId'])
        profiles = unique(unit['profiles'], 'sourceId')
        members = unique(declared['compositionMembers'], 'sourceId')
        if {p['sourceId'] for p in declared['statProfiles']} != set(profiles):
            raise ValueError('Missing/mismatched shared statline binding')
        for member in members.values():
            if member['modelProfileSourceId'] not in profiles:
                raise ValueError('Unknown physical model profile')
            reference, = member['sourceReferences']
            if reference['sourceId'] != section['sourceId'] or resolve(corpus, reference['path']).splitlines()[reference['sourceLineIndex']] != member['sourceLine']:
                raise ValueError('Physical model source occurrence changed')
            quantity = re.match(r'^- (\d+)(?:-(\d+))? (.+)$', member['sourceLine'])
            if not quantity or member['quantity'] != {'min': int(quantity[1]), 'max': int(quantity[2] or quantity[1])}:
                raise ValueError('Physical model quantity differs from source')
        for profile in declared['statProfiles']:
            if set(profile['compositionMemberSourceIds']) != {m['sourceId'] for m in members.values() if m['modelProfileSourceId'] == profile['sourceId']}:
                raise ValueError('Shared profile widened/lost its physical recipients')
        page, = [page for page in corpus['pages'] if page['url'] == unit['url']]
        tree = html.fromstring((root/SOURCE/page['file']).read_text(encoding='utf-8'))
        wraps = tree.xpath('//div[contains(@class,"dsProfileBaseWrap")]')
        if len(wraps) != len(unit['profiles']):
            raise ValueError('Raw model profile census differs')
        for wrap, profile in zip(wraps, unit['profiles']):
            values = [norm(node.text_content()) for node in wrap.xpath('.//div[contains(@class,"dsCharValue")]')]
            if values != [profile['stats'][key] for key in ['M', 'T', 'SV', 'W', 'LD', 'OC']]:
                raise ValueError('Raw model characteristics differ: '+profile['sourceId'])
        if unit['statline'] != unit['profiles'][0]['stats']:
            raise ValueError('Flattened capture is not the same shared model profile')
    for rule in models['ruleScopeBindings']:
        reference, = rule['sourceReferences']
        if rule['scope'] != 'COMPOSITION_MEMBER' or resolve(corpus, reference['path']) != rule['sourceQualifier']:
            raise ValueError('Model ability scope evidence changed')
        owner, = [unit for unit in corpus['datasheets'] if any(section['sourceId'] == rule['sourceEntityId'] for section in unit['sections'])]
        section, = [section for section in owner['sections'] if section['sourceId'] == rule['sourceEntityId']]
        declared = bindings[owner['sourceId']]
        if reference['sourceDocument'] != SOURCE+'/corpus.json' or reference['sourceId'] != section['sourceId'] or resolve(corpus, reference['path'].split('/blocks/')[0]) != section:
            raise ValueError('Model ability source owner changed')
        # The enrolled Lord Exultant occurrence says "this model", not its attached unit.
        if len(declared['compositionMembers']) != 1 or rule['compositionMemberSourceIds'] != [declared['compositionMembers'][0]['sourceId']] or rule['modelProfileSourceIds'] != [declared['compositionMembers'][0]['modelProfileSourceId']]:
            raise ValueError('MODEL recipient widened or transferred to a Bodyguard')


def canonicalize(rows, registry, models, artifacts, corpus, root):
    source = unique(rows, 'sourceId')
    declared = unique(registry['bindings'], 'sourceEntityId')
    unique(registry['bindings'], 'id')
    if set(source) != set(declared):
        raise ValueError('Missing/extra source identity bindings')
    canonical = lambda sid: declared[sid]['id']
    by_unit = unique(models['datasheets'], 'sourceId')
    records, accounting = [], []
    table_wrappers = {}
    hub = html.fromstring((root/SOURCE/'emperor-s-children.html').read_text(encoding='utf-8'))
    for detachment in corpus['detachments']:
        rule = detachment['rule']
        if not rule['tables']:
            continue
        # Same nested-layout ownership rule used by the existing AdMech foundation.
        containers = hub.xpath('//div[@data-f=$id and @class="clFl"]', id=detachment['filterId'])
        headings = containers[0].xpath('.//h2[starts-with(@id,"Detachment-Rule")]') if len(containers) == 1 else []
        tables = headings[0].getparent().getnext().xpath('.//table') if len(headings) == 1 else []
        matched = []
        for table in tables:
            values = [[norm(cell.text_content()) for cell in row if cell.tag in ('td', 'th')] for row in table.xpath('.//tr')]
            values = [row for row in values if row]
            for captured in rule['tables']:
                if values == captured['rows']:
                    matched.append((table, captured))
        if len(matched) != len(rule['tables']):
            raise ValueError('Structured rule table source occurrences changed')
        for table, captured in matched:
            inner = [other['sourceId'] for node, other in matched if table in node.iterancestors() and not node.xpath('.//table')]
            if inner:
                table_wrappers[captured['sourceId']] = inner
    for sid, row in source.items():
        binding = declared[sid]
        if binding['kind'] != row['kind'] or binding['ownerSourceId'] != row['parentSourceId']:
            raise ValueError('Wrong source kind/owner binding: '+sid)
        item = copy.deepcopy(row['payload'])
        for key in ['sourceId', 'class', 'normalizedContentFingerprint', 'wahaPoints']:
            item.pop(key, None)
        kind = row['kind']
        children = [child for child in rows if child['parentSourceId'] == sid]
        ids = lambda kind: [canonical(child['sourceId']) for child in children if child['kind'] == kind]
        if kind == 'DATASHEET':
            item = {key: item[key] for key in ['title', 'url', 'keywords', 'factionKeywords']}
            item.update(profileIds=ids('MODEL_PROFILE'), weaponIds=ids('WEAPON_PROFILE'), sectionIds=ids('DATASHEET_SECTION'), wargearOptionIds=ids('WARGEAR_OPTION'), ruleReferenceIds=ids('RULE_REFERENCE'), compositionMemberIds=ids('COMPOSITION_MEMBER'))
        elif kind == 'ARMY_RULE':
            item = {'title': item['title'], 'componentIds': ids('ARMY_RULE_COMPONENT')}
        elif kind == 'DETACHMENT':
            item = {'title': item['title'], 'ruleIds': ids('DETACHMENT_RULE'), 'enhancementIds': ids('ENHANCEMENT'), 'stratagemIds': ids('STRATAGEM')}
        elif kind == 'DETACHMENT_RULE':
            tables = item.pop('tables')
            item['tableIds'] = [canonical(table['sourceId']) for table in tables if table['sourceId'] not in table_wrappers]
            for table in tables:
                if table['sourceId'] in table_wrappers:
                    flattened = table['rows'][0][0]
                    if item['text'].count(flattened) != 1:
                        raise ValueError('Table wrapper text no longer occurs once')
                    item['text'] = item['text'].replace(flattened, '').strip()
        elif kind == 'STRUCTURED_RULE_TABLE' and sid in table_wrappers:
            kind = 'SOURCE_PRESENTATION_NOTE'
            item = {'semanticTableIds': [canonical(value) for value in table_wrappers[sid]], 'classification': 'LAYOUT_WRAPPER_REFERENCE'}
        elif kind == 'MODEL_PROFILE':
            profile, = [p for p in by_unit[row['parentSourceId']]['statProfiles'] if p['sourceId'] == sid]
            item['compositionMemberIds'] = [canonical(member) for member in profile['compositionMemberSourceIds']]
        elif kind == 'COMPOSITION_MEMBER':
            item = {'name': item['name'], 'quantity': item['quantity'], 'sourceText': item['sourceLine'], 'modelProfileId': canonical(item['modelProfileSourceId'])}
        elif kind == 'DATASHEET_SECTION':
            unit = by_unit[row['parentSourceId']]
            if item['title'] == 'UNIT COMPOSITION':
                for member in unit['compositionMembers']:
                    for block in item['blocks']:
                        block['text'] = '\n'.join(line for line in block['text'].splitlines() if line != member['sourceLine'])
                item['blocks'] = [block for block in item['blocks'] if block['text']]
                item['memberIds'] = [canonical(member['sourceId']) for member in unit['compositionMembers']]
            scoped = [rule for rule in models['ruleScopeBindings'] if rule['sourceEntityId'] == sid]
            if scoped:
                item['recipientBindings'] = [{**copy.deepcopy(rule), 'compositionMemberIds': [canonical(value) for value in rule['compositionMemberSourceIds']], 'modelProfileIds': [canonical(value) for value in rule['modelProfileSourceIds']], 'executable': False} for rule in scoped]
        proof = {'sourceId': 'ec-waha-11e-2026-09-28', 'document': row['document'], 'sha256': artifacts[row['document']]['sha256'], 'corpusDocument': SOURCE+'/corpus.json', 'corpusSha256': artifacts[SOURCE+'/corpus.json']['sha256'], 'pointer': row['sourcePointer'], 'authority': 'ACCEPTED_SECONDARY'}
        record = {'id': canonical(sid), 'kind': kind, 'data': item, 'provenance': proof}
        if row['parentSourceId']:
            record['parentId'] = canonical(row['parentSourceId'])
        records.append(record)
        accounting.append({'sourceEntityId': sid, 'sourcePointer': row['sourcePointer'], 'entityId': record['id'], 'classification': 'CAPTURE_OCCURRENCE_REFERENCE' if sid in table_wrappers else 'CANONICAL_FACT',
                           **({'scalarOwnership': False, 'reason': 'A source line inside the composition field; the containing field owns the composite scalar.'} if kind == 'COMPOSITION_MEMBER' else {})})
    return records, accounting


def build(root=ROOT):
    root = Path(root); here = root/'books/emperors-children/v2'
    enrollment = read(here/'sources/enrollment.json')
    artifacts = verify_sources(root, enrollment)
    corpus = read(root/SOURCE/'corpus.json'); models = read(here/'model-bindings.json')
    validate_model_sources(corpus, models, artifacts, root)
    rows = collect_sources(corpus, models)
    records, accounting = canonicalize(rows, read(here/'identity-bindings.json'), models, artifacts, corpus, root)
    by_source = {row['sourceId']: row for row in rows}
    bindings = {row['sourceEntityId']: row for row in read(here/'identity-bindings.json')['bindings']}
    for i, unit in enumerate(corpus['datasheets']):
        accounting.append({'sourcePointer': f'/datasheets/{i}/statline', 'entityId': bindings[unit['profiles'][0]['sourceId']]['id'], 'classification': 'CAPTURE_OCCURRENCE_REFERENCE', 'reason': 'Shared model profile owns this flattened capture occurrence.'})
    for i, detachment in enumerate(corpus['detachments']):
        for field in ['detachmentPoints', 'forceDisposition']:
            accounting.append({'sourcePointer': f'/detachments/{i}/{field}', 'classification': 'MFM_OWNED', 'reason': 'Resolve the current centralized MFM record; do not copy captured values.'})
        for j, enhancement in enumerate(detachment['enhancements']):
            accounting.append({'sourcePointer': f'/detachments/{i}/enhancements/{j}/wahaPoints', 'classification': 'MFM_OWNED'})
    for i, item in enumerate(corpus['errata']):
        if item['class'] == 'FAQ' and int(item['sourceId'].split('-')[1]) > 3:
            accounting.append({'sourceEntityId': item['sourceId'], 'sourcePointer': f'/errata/{i}', 'classification': 'EXTERNAL_CORE_REFERENCE', 'sourceOccurrence': copy.deepcopy(item)})
    for i, reference in enumerate(corpus['references']):
        accounting.append({'sourcePointer': f'/references/{i}', 'classification': 'REFERENCE_METADATA', 'sourceOccurrence': copy.deepcopy(reference)})
    metadata = {'schema', 'edition', 'captureDate', 'currentnessCutoff', 'scope', 'pages', 'inventory', 'gameplayUnits', 'corpusFingerprint'}
    leaf_accounting = []
    for pointer, value in leaves(corpus):
        if pointer.split('/')[1] in metadata or pointer.rsplit('/', 1)[-1] in {'sourceId', 'class', 'normalizedContentFingerprint', 'filterId', 'detachmentCode'} or '/sourceBadges/' in pointer:
            disposition = {'classification': 'SOURCE_METADATA'}
        else:
            candidates = [row for row in accounting if row.get('scalarOwnership', True) and (pointer == row.get('sourcePointer') or pointer.startswith(row.get('sourcePointer', '')+'/'))]
            if not candidates:
                raise ValueError('Unclassified source scalar: '+pointer)
            owner = max(candidates, key=lambda row: len(row['sourcePointer']))
            disposition = {key: owner[key] for key in ['classification', 'entityId'] if key in owner}
        leaf_accounting.append({'sourcePointer': pointer, **disposition})
    official = read_official(root)
    for update in official['updates']:
        records.append({'id': update['id'], 'kind': 'SOURCE_UPDATE_REFERENCE', 'data': {'instruction': update['sourceText'], 'status': update['status'], 'targetIds': sorted({patch['targetId'] for patch in update['patches']}), 'group': update['group'], 'adjudications': update.get('adjudications', [])}, 'provenance': update['provenance']})
    base = {'schema': 'ec-v2-canonical/v1', 'bookId': BOOK, 'edition': '11E', 'acceptedBaseHead': enrollment['acceptedBaseHead'], 'sources': enrollment, 'entities': records, 'sourceAccounting': accounting, 'sourceLeafAccounting': leaf_accounting, 'ruleContractsStarted': False, 'rosterRuntimeStarted': False}
    base['mfmBoundary'] = {'owner': 'CENTRALIZED_MFM', 'sourceVersion': 'v1.6', 'bindingsDocument': 'books/emperors-children/v2/mfm-bindings.json', 'consumerInterface': 'books/emperors-children/v2/mfm-boundary.mjs#consumeMfm', 'valuesCopied': False}
    effective = copy.deepcopy(base); effective['schema'] = 'ec-v2-effective/v1'; effective['appliedOfficialUpdates'] = []
    index = unique(effective['entities'], 'id')
    touched = set()
    for update in official['updates']:
        applications = []
        for patch in update['patches']:
            source_row = by_source[patch['sourceId']]
            if bindings[patch['sourceId']]['id'] != patch['targetId'] or not patch['corpusPointer'].startswith(source_row['sourcePointer']+'/'):
                raise ValueError('Official correction owner/identity changed')
            target = index[patch['targetId']]
            field = patch['field']
            if field != patch['corpusPointer'][len(source_row['sourcePointer']):]:
                raise ValueError('Official canonical field differs from its exact source address')
            current = resolve(target['data'], field)
            identity = (target['id'], field)
            if identity in touched:
                raise ValueError('Multiple official replacements for one canonical field')
            if any(owner_id == target['id'] and (field.startswith(path+'/') or path.startswith(field+'/')) for owner_id, path in touched):
                raise ValueError('Overlapping official field replacement scopes')
            touched.add(identity)
            if value_sha(current) != patch['beforeSha256']:
                raise ValueError('Official canonical input changed: '+str(identity))
            owner = resolve(target['data'], field.rsplit('/', 1)[0])
            key = field.rsplit('/', 1)[1]
            owner[int(key) if isinstance(owner, list) else key] = copy.deepcopy(patch['value'])
            target.setdefault('fieldProvenance', {})[field.lstrip('/')] = {**update['provenance'], 'correctionId': update['id'], 'sourcePointer': patch['corpusPointer'], 'supersedes': copy.deepcopy(target['provenance'])}
            applications.append({'targetId': target['id'], 'field': field, 'changed': current != patch['value']})
        effective['appliedOfficialUpdates'].append({'id': update['id'], 'group': update['group'], 'status': update['status'], 'applications': applications})
    source_ids = {row['sourceId'] for row in rows}
    census = read(here/'sources/source-census.json')
    if dict(sorted(Counter(row['kind'] for row in rows).items())) != census['sourceKinds'] or sorted(source_ids) != census['sourceEntityIds']:
        raise ValueError('Frozen source census changed')
    all_ids = set(index)
    for record in index.values():
        if record.get('parentId') and record['parentId'] not in all_ids:
            raise ValueError('Missing canonical owner')
        if not record.get('provenance'):
            raise ValueError('Canonical provenance gap')
        for pointer, value in leaves(record['data']):
            if any(token in MFM_FIELDS for token in pointer.split('/')):
                raise ValueError('Army-owned copy of central MFM value: '+record['id']+pointer)
    summary = {'schema': 'ec-v2-factual-census/v1', 'sourceEntities': len(rows), 'canonicalEntities': len(index), 'sourceScalarLeaves': len(leaf_accounting), 'counts': dict(sorted(Counter(record['kind'] for record in index.values()).items())), 'officialNewGroups': sum(update['group']=='V13_CHANGE' for update in official['updates']), 'officialOccurrences': len(official['updates']), 'ruleContractsImplemented': 0, 'rosterRuntimeImplemented': 0, 'contentCertified': False}
    return {'base': base, 'effective': effective, 'factual-census': summary}


def main():
    parser = argparse.ArgumentParser(description=__doc__); parser.add_argument('--check', action='store_true'); args = parser.parse_args()
    outputs = build()
    if not args.check:
        (HERE/'generated').mkdir(exist_ok=True)
    for name, value in outputs.items():
        serialized = (json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode()
        target = HERE/'generated'/(name+'.json')
        if args.check:
            if not target.exists() or target.read_bytes() != serialized:
                raise ValueError('Stale factual output: '+name)
        else:
            target.write_bytes(serialized)
    print(json.dumps(outputs['factual-census'], ensure_ascii=False))


if __name__ == '__main__':
    main()
