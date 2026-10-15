"""Focused raw-source reconciliation; no legacy build or gameplay lowering."""
import copy
import json
from lxml import html
import build

SID = 'detachment-warrior-bioform-onslaught:enhancement:1'
OWNER = 'detachment-warrior-bioform-onslaught'
tree = html.fromstring((build.ROOT/build.HUB).read_bytes())
# Independent source selection and text extraction, including sibling lists.
cells = tree.xpath("//div[@data-f='TY:4001']//td[ul/li/span[1][normalize-space(.)='Elevated Might']]")
assert len(cells) == 1
cell = cells[0]
paragraphs = cell.xpath('./p[not(contains(@class,"ShowFluff"))]')
bullets = cell.xpath('./ul[not(@class)]/li')
assert len(paragraphs) == 1 and len(bullets) == 2
normalize = lambda node: ' '.join(node.text_content().split())
expected = '\n'.join([normalize(paragraphs[0])] + ['- '+normalize(li) for li in bullets])
assert expected == ('WINGED TYRANID PRIME/TYRANID PRIME WITH LASH WHIP model only. '
    'This model’s melee attacks:\n- Can re-roll wound rolls.\n- Have +1 AP.')
bindings = build.read(build.HERE/'identity-bindings.json')['bindings']
canonical = {r['sourceEntityId']: r['id'] for r in bindings}
corpus = build.read(build.ROOT/build.SOURCE/'corpus.json')
det, = [d for d in corpus['detachments'] if d['sourceId'] == OWNER]
# Explicitly demonstrate the historical first loss rather than trusting corpus.
assert det['enhancements'][0]['text'] == normalize(paragraphs[0])


def reconcile(document):
    matches = [r for r in document['entities'] if r.get('sourceEntityId') == SID or r['id'] == canonical[SID]]
    if len(matches) != 1:
        return False
    rule = matches[0]
    proof = rule['provenance']
    return (rule['id'] == canonical[SID] and rule['sourceEntityId'] == SID
        and rule['parentId'] == canonical[OWNER] and rule['kind'] == 'ENHANCEMENT'
        and rule['data']['title'] == 'Elevated Might' and rule['data']['text'] == expected
        and rule['data']['scope'] == 'MODEL' and rule['data']['itemKind'] == 'ENHANCEMENT'
        and rule['data']['eligibilityText'] == expected.split('.', 1)[0]+'.'
        and proof['sourceEntityId'] == SID and proof['document'] == build.HUB
        and proof['sha256'] == build.sha((build.ROOT/build.HUB).read_bytes())
        and proof['corpusSha256'] == build.sha((build.ROOT/build.SOURCE/'corpus.json').read_bytes())
        and tree.xpath(proof['pointer']) == cells)


outputs = build.build()
assert build.serialize(outputs) == build.serialize(build.build()), 'Non-deterministic build'
for name, document in outputs.items():
    assert (build.HERE/'generated'/(name+'.json')).read_bytes() == build.serialize(document)
for name in ['base', 'effective']:
    assert reconcile(outputs[name]), name
assert reconcile(build.read(build.HERE/'generated/roster-import.json'))
# Directly affected Enhancement block has exactly these two source entries.
raw_names = tree.xpath("//div[@data-f='TY:4001']//ul[@class='EnhancementsPts']/li/span[1]")
assert [normalize(n) for n in raw_names] == ['Elevated Might', 'Ocular Adaptation']
for item in det['enhancements']:
    record, = [r for r in outputs['base']['entities'] if r.get('sourceEntityId') == item['sourceId']]
    assert record['data']['title'] == item['title'] and record['parentId'] == canonical[OWNER]
    if item['sourceId'] != SID:
        assert record['data']['text'] == item['text']
        source_cell, = tree.xpath("//div[@data-f='TY:4001']//td[ul/li/span[1][normalize-space(.)='Ocular Adaptation']]")
        assert item['text'] == '\n'.join(normalize(p) for p in source_cell.xpath('./p[not(contains(@class,"ShowFluff"))]'))

mutations = 0
for mode in ['missing', 'duplicate', 'identity', 'owner', 'scope', 'condition', 'reroll', 'ap', 'provenance']:
    changed = copy.deepcopy(outputs['effective'])
    record, = [r for r in changed['entities'] if r.get('sourceEntityId') == SID]
    if mode == 'missing': changed['entities'].remove(record)
    elif mode == 'duplicate': changed['entities'].append(copy.deepcopy(record))
    elif mode == 'identity': record['id'] += '-wrong'
    elif mode == 'owner': record['parentId'] = 'wrong-detachment'
    elif mode == 'scope': record['data']['scope'] = 'UNIT'
    elif mode == 'condition': record['data']['text'] = record['data']['text'].replace('melee', 'ranged')
    elif mode == 'reroll': record['data']['text'] = record['data']['text'].replace('\n- Can re-roll wound rolls.', '')
    elif mode == 'ap': record['data']['text'] = record['data']['text'].replace('+1 AP', '+2 AP')
    elif mode == 'provenance': record['provenance']['sha256'] = 'wrong'
    assert not reconcile(changed), 'Undetected mutation: '+mode
    mutations += 1
print(json.dumps({'status': 'PASS', 'sourceRules': 2, 'completeRule': SID,
    'generatedParity': True, 'deterministic': True, 'mutationsDetected': mutations}))
