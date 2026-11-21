"""Publish the accepted, isolated Core candidate without scanning HTML again.

The candidate's ownership and representation controls remain upstream. This step
only projects its accepted records and exact corpus locators into active inputs.
"""
from __future__ import annotations

import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
CONTENT = ROOT / 'books/core-rules/content'
SOURCE = ROOT / 'books/core-rules/sources/waha-core-2026-11-11'
BASELINE = '7b15dc36425ac577b6928837ec9983409972e278'
SOURCE_ID = 'waha-core-corpus-2026-11-11'
ACCEPTED_CANDIDATE_SHA256 = 'a91415eaf2f67438b6326585752dba4fbd8eee0db52dafe5a7b4abf5347b4109'
ACCEPTED_CORPUS_FINGERPRINT = '2E39280BEB3D0C92F87F4F3DB231CA3BC40192C12575AF998E5D2A2DB684C14A'
HISTORICAL_SOURCE_SHA256 = '075d31795979cbe8feb7ac999d013134a4fe09fc40dd4dbddb0d8d97e83196c0'


def read(path):
    return json.loads(path.read_text('utf-8'))


def digest(value):
    return hashlib.sha256(value).hexdigest()


def fact_hash(value):
    return digest(json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode())


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def historical(relative):
    result = subprocess.run(['git', 'show', BASELINE + ':' + relative], cwd=ROOT,
                            check=True, capture_output=True)
    return json.loads(result.stdout)


def at(value, pointer):
    for part in pointer.strip('/').split('/'):
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def semantic_words(value):
    # Existing procedure rendering numbers the two alternative placement rows.
    # Those structural labels are not words in the captured erratum body.
    return re.sub(r'[^a-z0-9]', '', re.sub(r'\([12]\)', '', value).lower())


def outputs():
    candidate_file = SOURCE / 'core-rules.candidate.v1.json'
    candidate = read(candidate_file)
    corpus = read(SOURCE / 'waha-core-corpus.v1.json')
    identities = read(SOURCE / 'candidate-identities.v1.json')
    source_ids = read(SOURCE / 'source-identities.v1.json')
    history_file = ROOT / 'books/core-rules/sources/core-importer-baselines/7b15dc36.v1.json'
    if digest(history_file.read_bytes()) != HISTORICAL_SOURCE_SHA256:
        raise ValueError('Changed authenticated historical Core source view')
    historical_source = read(history_file)
    old_by_id = {item['id']: item for item in historical_source['view']['records']}
    by_id = {item['id']: item for item in candidate['records']}
    if digest(candidate_file.read_bytes()) != ACCEPTED_CANDIDATE_SHA256:
        raise ValueError('Candidate differs from the reviewed Task A artifact')
    if candidate['corpusFingerprint'] != corpus['fingerprint'] or corpus['fingerprint'] != ACCEPTED_CORPUS_FINGERPRINT or len(by_id) != 385:
        raise ValueError('Unaccepted candidate/corpus identity set')
    if set(old_by_id) - set(by_id):
        raise ValueError('Candidate lost an accepted Core identity')
    units = {item['id']: item for page in corpus['pages']
             for key in ('numbered', 'faqs', 'errata', 'universalRulesUpdates') for item in page[key]}
    old_digital = historical('books/core-rules/content/core-rules.digital-11e.json')
    old_record_by_code = {record['code']: record for record in old_digital['records']}
    snapshot = deepcopy(old_digital)
    snapshot['meta'].update(captureDate='2026-11-11', corpusFingerprint=corpus['fingerprint'],
                            coreRawSha256=corpus['pages'][0]['rawSha256'],
                            appendixRawSha256=corpus['pages'][1]['rawSha256'],
                            acceptedCandidateSha256=digest(candidate_file.read_bytes()))
    records = []
    for item in candidate['records']:
        if item['recordType'] != 'MAIN_RULE':
            continue
        previous = old_record_by_code.get(item['code'], {})
        record = {key: deepcopy(item[key]) for key in ('code', 'title', 'text', 'content', 'presentation', 'compatibilityAliases') if key in item}
        record['kind'] = item.get('kind', previous.get('kind', 'rule'))
        if 'presentation' not in record and 'presentation' in previous:
            record['presentation'] = deepcopy(previous['presentation'])
        if 'internalLocator' in item:
            record['code'] = item['internalLocator']
            record['sourceCode'] = item['sourceCitation']
        locator = next((row for row in item.get('sourceLocators', []) if row.get('anchor')), None)
        if locator and locator['anchor'] in identities['sourceNodes']:
            record['sourceCode'] = item.get('sourceCitation', item['code'])
            record['sourceNode'] = {'sourceUnitId': locator['sourceUnitId'], 'anchor': locator['anchor'],
                                    'sourceOrder': locator['sourceOrder'], 'contentHash': locator['sourceContentHash']}
        if item['id'] == 'core-support':
            record['preservedBaselineBinding'] = deepcopy(item)
        records.append(record)
    snapshot['records'] = records
    bindings = historical('books/core-rules/content/core-effective-bindings.v1.json')
    bindings['corpusFingerprint'] = corpus['fingerprint']
    bindings['acceptedCandidate'] = {'file': '../sources/waha-core-2026-11-11/core-rules.candidate.v1.json',
                                     'sha256': digest(candidate_file.read_bytes())}
    # The fresh accepted bodies incorporate both errata. Refuse to remove the
    # old edit declarations if a future source no longer carries their words.
    for owner, erratum in [('core-rule-12-08-consolidation-move', 'core-waha-errata-12-08'),
                           ('core-rule-18-05-emergency-disembark-move', 'core-waha-errata-18-05')]:
        correction = re.sub(r'^(?:Change to:|Add:)\s*', '', by_id[erratum]['text'])
        if semantic_words(correction) not in semantic_words(by_id[owner]['text']):
            raise ValueError('Fresh source does not incorporate accepted erratum: ' + owner)
    if semantic_words('Objective Consolidation: Your unit must be unengaged and within range of the selected objective.') not in semantic_words(by_id['core-rule-12-08-consolidation-move']['text']):
        raise ValueError('Fresh Consolidation source lacks the corrected objective placement clause')
    bindings['effectiveEdits'] = []
    bindings['sourceNodes'] = []
    for anchor, identity in identities['sourceNodes'].items():
        item = by_id[identity['id']]
        locator = next(row for row in item['sourceLocators'] if row.get('anchor') == anchor)
        unit = units[locator['sourceUnitId']]
        occurrence = next(row for row in unit['occurrences'] if row['sourceOrder'] == locator['sourceOrder'] and row['stableDomId'] == anchor)
        label = occurrence['ownerHeading']['label']
        start = len(label) if occurrence['content']['text'].startswith(label) else None
        if start is None:
            raise ValueError('Source-node heading is not the owned content prefix: ' + anchor)
        previous = next((row for row in historical('books/core-rules/content/core-effective-bindings.v1.json')['sourceNodes'] if row['targetRuleId'] == item['id']), {})
        bindings['sourceNodes'].append({'targetRuleId': item['id'], 'code': identity['code'],
            'sourceCode': unit.get('sourceCode', unit['code']), 'sourceUnitId': unit['id'],
            'anchor': anchor, 'sourceOrder': occurrence['sourceOrder'], 'contentHash': occurrence['content']['contentHash'],
            'textRange': {'start': start, 'end': len(occurrence['content']['text'])},
            'referenceIndexes': list(range(len(occurrence['content']['references']))),
            'acceptedCandidateId': item['id'], 'renderedContentHash': digest(item['text'].encode()),
            'relatedRuleIds': deepcopy(previous.get('relatedRuleIds', []))})
    faq_mapping = {row['canonicalId']: row for row in source_ids['faqs']}
    for binding in bindings['faqRelationships']:
        unit = units[faq_mapping[binding['faqId']]['sourceId']]
        binding['sourceContentHash'] = unit['contentHash']
        evidence = binding.get('evidence', {})
        evidence.update(sourceUnitId=unit['id'], sourceContentHash=unit['contentHash'])
        if 'enclosingSourceUnitId' in evidence:
            enclosing = [(owner, occurrence) for owner in units.values() for occurrence in owner.get('occurrences', [])
                         if unit['content']['text'] in occurrence['content']['text']]
            if not enclosing:
                raise ValueError('Missing physical FAQ container: ' + binding['faqId'])
            owner, occurrence = min(enclosing, key=lambda row: len(row[1]['content']['text']))
            evidence['enclosingSourceUnitId'] = owner['id']
            evidence['sourceOrder'] = occurrence['sourceOrder']
    # Retain only appearances which actually existed in the accepted catalog.
    # A same-Q/A group is a witness, never permission to add a new old context.
    faq_bindings = {row['faqId']: row for row in bindings['faqRelationships']}
    current_faqs = {row['id']: row for row in candidate['records'] if row['recordType'] == 'FAQ_CLARIFICATION'}
    initial = {}
    for faq_id, faq in current_faqs.items():
        relations = faq_bindings.get(faq_id, faq.get('relationships', {'primaryRuleId': faq.get('parentId')}))
        for owner in [relations.get('primaryRuleId'), *relations.get('relatedRuleIds', [])]:
            if owner:
                initial.setdefault(owner, set()).add(faq_id)
    bindings['faqAppearanceSource'] = {'file': '../sources/core-importer-baselines/7b15dc36.v1.json', 'sha256': HISTORICAL_SOURCE_SHA256}
    bindings['faqAppearanceRetentions'] = []
    for owner in historical_source['view']['records']:
        if owner['recordType'] != 'MAIN_RULE':
            continue
        for faq_id in owner['relationships'].get('faqIds', []):
            if faq_id in initial.get(owner['id'], set()):
                continue
            faq = current_faqs[faq_id]
            old_faq = old_by_id[faq_id]
            if (faq['question'], faq['answer']) != (old_faq['question'], old_faq['answer']):
                raise ValueError('Changed historical FAQ payload: ' + faq_id)
            witnesses = sorted(other for other in initial.get(owner['id'], set())
                               if (current_faqs[other]['question'], current_faqs[other]['answer']) == (faq['question'], faq['answer']))
            if not witnesses:
                continue
            source = units[faq_mapping[faq_id]['sourceId']]
            bindings['faqAppearanceRetentions'].append({'ownerId': owner['id'], 'faqId': faq_id,
                'existingGroupWitnessId': witnesses[0], 'sourceUnitId': source['id'], 'sourceContentHash': source['contentHash']})
    if len(bindings['faqAppearanceRetentions']) != 15:
        raise ValueError('Historical FAQ appearance restoration differs from the reviewed fifteen associations')
    snapshot_by_id = {}
    for record in records:
        node = identities['sourceNodes'].get(record.get('sourceNode', {}).get('anchor'))
        identity = node['id'] if node else identities['rules'][record['code']]
        snapshot_by_id[identity] = record
    for binding in bindings['factContributions']:
        target = snapshot_by_id[binding['targetRuleId']]
        value = at(target, binding['target']['path'])
        if 'range' in binding['target']:
            start, end = binding['target']['range']; value = value[start:end]
        binding['valueHash'] = fact_hash(value)
        source = binding['source']
        if source.get('unitId'):
            unit = units[source['unitId']]
            source.update(sourceId=SOURCE_ID, contentHash=unit['contentHash'])
            # The old path remains valid only if it still denotes the same fact.
            if fact_hash(at(unit, source['path'])) != binding['valueHash']:
                raise ValueError('Changed source fact path: ' + source['path'])
    registry = historical('books/core-rules/content/core-official-source-registry.en.json')
    old_source = next(row for row in registry['sources'] if row['sourceId'] == 'waha-core-corpus-2026-09-25')
    fresh = deepcopy(old_source)
    fresh.update(sourceId=SOURCE_ID, date='2026-11-11',
                 corpusFingerprint=corpus['fingerprint'],
                 title='Accepted Wahapedia 11E Core corpus, captured 2026-11-11',
                 urlOrLocalArtifact='books/core-rules/sources/waha-core-2026-11-11/waha-core-corpus.v1.json')
    fresh['notes'] = 'Accepted offline corpus and candidate; stronger enrolled current GW evidence retains priority.'
    registry['sources'].append(fresh)
    ledger = historical('books/core-rules/sources/waha-core-2026-09-25/known-source-defects.v1.json')
    ledger['corpusBinding'].update(corpusFingerprint=corpus['fingerprint'], corePageRawSha256=corpus['pages'][0]['rawSha256'], appendixPageRawSha256=corpus['pages'][1]['rawSha256'])
    ledger['defects'] = [row for row in ledger['defects'] if row['id'] != 'waha-core-18-07-suspect-after-moving-clause']
    for defect in ledger['defects']:
        for name in ('source', 'adjudicatedTarget'):
            ref = defect.get(name)
            if not ref:
                continue
            unit = units[ref['unitId']]
            occurrences = unit['occurrences']
            occurrence = next((row for row in occurrences if row.get('stableDomId') == ref.get('stableDomId') and ref.get('stableDomId')), occurrences[0])
            ref.update(unitContentHash=unit['contentHash'], occurrenceContentHash=occurrence['content']['contentHash'])
            if 'sourceOrder' in ref:
                ref['sourceOrder'] = occurrence['sourceOrder']
            if ref.get('rawFragment') and ref['rawFragment'] not in occurrence['content']['text']:
                raise ValueError('Resolved/changed source defect witness: ' + defect['id'])
            if ref.get('rawTarget') and not any(row.get('rawTarget') == ref['rawTarget'] and row.get('label') == ref['label'] for row in occurrence['content']['references']):
                raise ValueError('Changed source navigation defect witness: ' + defect['id'])
    return {CONTENT / 'core-rules.digital-11e.json': snapshot,
            CONTENT / 'core-identities.v1.json': identities,
            CONTENT / 'core-effective-bindings.v1.json': bindings,
            CONTENT / 'core-official-source-registry.en.json': registry,
            SOURCE / 'known-source-defects.v1.json': ledger}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--check', action='store_true')
    args = parser.parse_args()
    values = outputs()
    for file, value in values.items():
        data = encoded(value)
        if args.check:
            if not file.exists() or file.read_bytes() != data:
                raise ValueError('Stale ' + file.relative_to(ROOT).as_posix() + '; run python books/core-rules/tools/publish_core_candidate.py --write')
        else:
            file.write_bytes(data)
        print(('CHECK ' if args.check else 'WRITE ') + file.relative_to(ROOT).as_posix())


if __name__ == '__main__':
    main()
