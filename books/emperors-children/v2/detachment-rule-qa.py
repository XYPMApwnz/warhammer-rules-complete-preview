"""Eleven raw named blocks, one restored official sibling; not a content audit."""
import copy
import json
from build import ROOT, SOURCE, build, read
from detachment_rules import read_named_rules, validate_named_rules

result = build()
oracle = read_named_rules(ROOT, read(ROOT/SOURCE/'corpus.json'))
records = result['base']['entities']
validate_named_rules(records, oracle)
assert len(oracle) == 11
master_id = 'detachment-court-of-the-phoenician:rule:master-of-the-pageant'
master, = [row for row in records if row['id'] == master_id]
assert master['parentId'] == 'detachment-court-of-the-phoenician'
assert master == next(row for row in result['effective']['entities'] if row['id'] == master_id)
assert master['provenance']['page'] == 5
mutations = 0


def rejected(rows):
    global mutations
    try:
        validate_named_rules(rows, oracle)
    except ValueError:
        mutations += 1
        return
    raise AssertionError('Named inventory comparator accepted a mutation')


for source in oracle:
    for mode in ['missing', 'identity', 'owner', 'duplicate', 'title', 'text', 'provenance', 'sourceId']:
        rows = copy.deepcopy(records)
        target = next(row for row in rows if row['id'] == source['id'])
        if mode == 'missing':
            rows.remove(target)
        elif mode == 'identity':
            target['id'] = 'unknown-source-identity'
        elif mode == 'owner':
            target['parentId'] = 'detachment-carnival-of-excess' if source['owner'] != 'detachment-carnival-of-excess' else 'detachment-court-of-the-phoenician'
        elif mode == 'duplicate':
            rows.append(copy.deepcopy(target))
        elif mode == 'title':
            target['data']['title'] = 'Wrong named rule'
        elif mode == 'text':
            target['data']['text'] = target['data']['text'][:-1]
        elif mode == 'provenance':
            target['provenance'] = {}
        elif mode == 'sourceId':
            target['provenance']['sourceId'] = 'foreign-source'
        rejected(rows)
    if source['id'] != master_id:
        for field in ['corpusDocument', 'corpusSha256', 'pointer']:
            for value in [None, 'foreign-nonempty-value']:
                rows = copy.deepcopy(records)
                proof = next(row for row in rows if row['id'] == source['id'])['provenance']
                if value is None:
                    proof.pop(field)
                else:
                    proof[field] = value
                rejected(rows)
for old, new in [('Once per battle round', 'Once per battle'), ('Fulgrim unit', 'unit'),
                 ('Sinuous Breach or ', ''), (' or Prideful Superiority', ''),
                 ('you can reduce', 'reduce'), ('1CP', '2CP')]:
    rows = copy.deepcopy(records)
    target = next(row for row in rows if row['id'] == master_id)
    assert old in target['data']['text']
    target['data']['text'] = target['data']['text'].replace(old, new)
    rejected(rows)
for field in ['acceptedOccurrence', 'textSha256', 'page']:
    rows = copy.deepcopy(records)
    next(row for row in rows if row['id'] == master_id)['provenance'].pop(field)
    rejected(rows)
print(json.dumps({'status': 'PASS', 'namedSourceBlocks': len(oracle), 'matched': len(oracle),
                  'sourceShaVerified': master['provenance']['sha256'], 'mutations': mutations,
                  'masterCanonicalId': master_id, 'gameplayExecutionAdded': False}))
