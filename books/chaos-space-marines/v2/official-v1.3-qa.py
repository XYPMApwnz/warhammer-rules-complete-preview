"""Bounded v1.3 profile inventory, immutable-field controls and mutations.
Expected values were extracted from the official p.38 table before publication.
The independent raw-source reconciliation is retained outside the repository.
"""
import copy
import hashlib
import json
from pathlib import Path
import pdfplumber
from official_sources import read_official, apply_official_overrides
from build import ROOT, HERE
read = lambda p: json.loads(p.read_text(encoding="utf-8"))
EXPECTED = {
  "datasheet-abaddon-the-despoiler:profile:1": {
    "T": "6"
  },
  "datasheet-chaos-bikers:profile:1": {
    "T": "6"
  },
  "datasheet-chaos-lord-in-terminator-armour:profile:1": {
    "T": "6"
  },
  "datasheet-chaos-terminator-squad:profile:1": {
    "T": "6"
  },
  "datasheet-huron-blackheart:profile:1": {
    "T": "6"
  },
  "datasheet-kravek-morne:profile:1": {
    "T": "6"
  },
  "datasheet-sorcerer-in-terminator-armour:profile:1": {
    "T": "6"
  },
  "datasheet-chaos-lord:profile:1": {
    "T": "5"
  },
  "datasheet-chaos-lord-with-jump-pack:profile:1": {
    "T": "5"
  },
  "datasheet-chosen:profile:1": {
    "T": "5"
  },
  "datasheet-cypher:profile:1": {
    "T": "5"
  },
  "datasheet-dark-apostle:profile:1": {
    "T": "5"
  },
  "datasheet-dark-apostle:profile:2": {
    "T": "5"
  },
  "datasheet-fabius-bile:profile:1": {
    "T": "5"
  },
  "datasheet-fabius-bile:profile:2": {
    "T": "5"
  },
  "datasheet-haarken-worldclaimer:profile:1": {
    "T": "5"
  },
  "datasheet-legionaries:profile:1": {
    "T": "5"
  },
  "datasheet-master-of-executions:profile:1": {
    "T": "5"
  },
  "datasheet-master-of-possession:profile:1": {
    "T": "5"
  },
  "datasheet-masters-of-the-maelstrom:profile:1": {
    "T": "5"
  },
  "datasheet-nemesis-claw:profile:1": {
    "T": "5"
  },
  "datasheet-raptors:profile:1": {
    "T": "5"
  },
  "datasheet-red-corsairs-raiders:profile:1": {
    "T": "5"
  },
  "datasheet-red-corsairs-reave-captain:profile:1": {
    "T": "5"
  },
  "datasheet-sorcerer:profile:1": {
    "T": "5"
  },
  "datasheet-warpsmith:profile:1": {
    "T": "5"
  },
  "datasheet-warp-talons:profile:1": {
    "T": "5"
  },
  "datasheet-havocs:profile:1": {
    "W": "3"
  },
  "datasheet-chaos-bikers:weapon:12": {
    "strength": "5"
  },
  "datasheet-chaos-lord:weapon:4": {
    "strength": "5"
  },
  "datasheet-havocs:weapon:15": {
    "strength": "5"
  },
  "datasheet-legionaries:weapon:17": {
    "strength": "5"
  },
  "datasheet-nemesis-claw:weapon:13": {
    "strength": "5"
  },
  "datasheet-raptors:weapon:9": {
    "strength": "5"
  },
  "datasheet-chaos-bikers:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-lord-with-jump-pack:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chosen:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-dark-apostle:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-legionaries:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-lord-discordant-on-helstalker:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-master-of-executions:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-master-of-possession:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-masters-of-the-maelstrom:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-nemesis-claw:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-raptors:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-red-corsairs-raiders:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-red-corsairs-reave-captain:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-sorcerer:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chosen:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-havocs:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-legionaries:weapon:3": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-nemesis-claw:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-red-corsairs-raiders:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-bikers:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-land-raider:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-lord-in-terminator-armour:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-predator-annihilator:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-predator-destructor:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-rhino:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-terminator-squad:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-vindicator:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-helbrute:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-kravek-morne:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-sorcerer-in-terminator-armour:weapon:1": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-land-raider:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-lord-in-terminator-armour:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-predator-annihilator:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-predator-destructor:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-rhino:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-terminator-squad:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-vindicator:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chosen:weapon:3": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-sorcerer-in-terminator-armour:weapon:2": {
    "strength": "5",
    "ap": "-1"
  },
  "datasheet-chaos-bikers:weapon:10": {
    "strength": "5"
  },
  "datasheet-havocs:weapon:16": {
    "strength": "5"
  },
  "datasheet-legionaries:weapon:18": {
    "strength": "5"
  },
  "datasheet-raptors:weapon:10": {
    "strength": "5"
  },
  "datasheet-cypher:weapon:1": {
    "strength": "5"
  },
  "datasheet-cypher:weapon:3": {
    "strength": "5"
  },
  "datasheet-possessed:weapon:1": {
    "strength": "6"
  },
  "datasheet-nemesis-claw:weapon:15": {
    "strength": "5"
  }
}


def verify_profiles(base, effective):
    before = {e['id']: e for e in base['entities'] if e['kind'] in {'MODEL_PROFILE', 'WEAPON_PROFILE'}}
    after = {e['id']: e for e in effective['entities'] if e['kind'] in {'MODEL_PROFILE', 'WEAPON_PROFILE'}}
    assert len(before) == len(after) == 375
    assert sum(e['kind'] in {'MODEL_PROFILE', 'WEAPON_PROFILE'} for e in effective['entities']) == len(after), 'Duplicated profile'
    assert before.keys() == after.keys(), 'Missing, extra or duplicated profile identity'
    assert len(EXPECTED) == 81 and sum(map(len, EXPECTED.values())) == 120
    for identity, raw in before.items():
        actual = after[identity]
        expected = copy.deepcopy(raw['data'])
        values = expected['stats'] if raw['kind'] == 'MODEL_PROFILE' else expected
        values.update(EXPECTED.get(identity, {}))
        assert actual['data'] == expected, 'Incorrect or unrelated profile change: ' + identity
        assert actual['ownerId'] == raw['ownerId'] and actual['displayName'] == raw['displayName'], 'Identity/ownership/name drift'
        if identity in EXPECTED:
            assert any(p['document'].endswith('faction-pack-v1.3.pdf') for p in actual['provenance'])
    assert after['datasheet-chaos-lord:weapon:4']['data']['name'] == 'Astartes chainblade'
    assert after['datasheet-masters-of-the-maelstrom:profile:2']['data']['stats']['T'] == '3'


def rejects(action):
    try:
        action()
    except (AssertionError, ValueError):
        return
    raise AssertionError('Mutation escaped source/profile comparator')


def main():
    base, effective = (read(HERE / 'generated' / (name + '.json')) for name in ('base', 'effective'))
    verify_profiles(base, effective)
    bindings = read(HERE / 'official-bindings.json')
    official = read_official(ROOT)
    table = [u for u in official['updates'] if u.get('profileInventory')]
    assert len(table) == 12
    assert sum(len(u['profileInventory']) for u in table) == 81
    orphan, = [o for u in table for o in u.get('unappliedOccurrences', [])]
    assert orphan['ownerSourceId'] == 'datasheet-havocs' and orphan['canonicalTargetId'] is None
    assert orphan['classification'] == 'UNRESOLVED_ORPHAN_OFFICIAL_CORRECTION' and orphan['status'] == 'UNAPPLIED'
    index = {e['id']: e for e in effective['entities']}
    for u in table:
        record = index[u['sourceEntityId']]
        assert record['data']['profileInventory'] == u['profileInventory']
        if u.get('unappliedOccurrences'):
            assert record['data']['status'] == 'partially_applied'
            assert record['data']['unappliedOccurrences'] == [orphan]
    lord = index['official-update-38']['data']
    assert lord['adjudications'], 'Explicit Chaos Lord identity adjudication lost'
    assert len([e for e in index.values() if e['kind']=='WEAPON_PROFILE' and e['ownerId']=='unit-chaos-lord' and 'chain' in e['data']['name'].lower()]) == 1
    assert not any(e['kind']=='WEAPON_PROFILE' and e['ownerId']=='unit-havocs' and e['data']['name'].lower()=='bolt pistol' for e in index.values())
    source = ROOT / bindings['sourceDocument']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == '237a44973f019f0bf72def98f747a0fcf2d5644a559b815a64987bdb468a7cf9'
    historical, = bindings['historicalSources']
    assert hashlib.sha256((ROOT/historical['sourceDocument']).read_bytes()).hexdigest() == historical['sourceSha256']
    # Read the enrolled official row crops anew; no projection supplies evidence.
    with pdfplumber.open(source) as pdf:
        for u in table:
            column = next(c for c in bindings['columns'] if c['key']==next(b['columnKey'] for b in bindings['updates'] if b['sourceEntityId']==u['sourceEntityId']))
            text = ' '.join(pdf.pages[37].crop(column['bbox']).extract_text(x_tolerance=2,y_tolerance=3).split())
            assert text == u['sourceText']
    mutations = []
    wrong = copy.deepcopy(effective)
    next(e for e in wrong['entities'] if e['id']=='datasheet-chaos-lord:weapon:4')['data']['strength'] = '4'
    mutations.append(wrong)
    missing = copy.deepcopy(effective)
    missing['entities'] = [e for e in missing['entities'] if e['id']!='datasheet-havocs:profile:1']
    mutations.append(missing)
    owner = copy.deepcopy(effective)
    next(e for e in owner['entities'] if e['id']=='datasheet-havocs:weapon:1')['ownerId'] = 'datasheet-legionaries'
    mutations.append(owner)
    extra = copy.deepcopy(effective)
    invented = copy.deepcopy(index['datasheet-havocs:weapon:1'])
    invented.update(id='invented-havoc-bolt-pistol', displayName='Bolt pistol')
    extra['entities'].append(invented)
    mutations.append(extra)
    unchanged = copy.deepcopy(effective)
    next(e for e in unchanged['entities'] if e['id']=='datasheet-masters-of-the-maelstrom:profile:2')['data']['stats']['T'] = '5'
    mutations.append(unchanged)
    duplicate = copy.deepcopy(effective)
    duplicate['entities'].append(copy.deepcopy(index['datasheet-chaos-lord:weapon:4']))
    mutations.append(duplicate)
    for mutant in mutations:
        rejects(lambda: verify_profiles(base, mutant))
    corpus = read(ROOT / bindings['corpusDocument'])
    bad_target = copy.deepcopy(official)
    bad_target['updates'][-1]['targets'][0]['sourceId'] = 'datasheet-havocs:weapon:1'
    rejects(lambda: apply_official_overrides(corpus, bad_target))
    print(json.dumps({'status':'PASS','officialGroups':12,'officialOwnerOccurrences':81,'appliedOwnerOccurrences':80,
                      'unappliedOrphans':1,'modelProfiles':28,'weaponProfiles':53,'fieldAssignments':120,
                      'negativeProfileControls':294,'mutationSensitivity':'7/7','historicalSourcePreserved':True}))


if __name__ == '__main__':
    main()
