"""Independent complete-page oracle for the five accepted SM instructions."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path

import pdfplumber

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PDF_SHA = '98C2B114E4E4B33EA385C7115BB9ACBA83C32AE4E17F753A3D73EF20C7D45D1F'
PDF_DOCUMENT = 'books/space-marines/v2/sources/raw/official-sm-updates.pdf'

# These source addresses and printed headings are independent of the producer
# ledger. In particular, the oracle reads the complete page, not ledger crops.
TARGETS = [
    ('Captain Titus, Righteous Fury Ability', 'DATASHEET_ABILITY',
     '/html/body/div/div[1]/div[3]/div[2]/div[8]/div[2]/div[2]/div[3]', 'text'),
    ('Iron Father Feirros, Iron Father Ability', 'DATASHEET_ABILITY',
     '/html/body/div/div[1]/div[3]/div[2]/div[16]/div[2]/div[2]/div[4]', 'text'),
    ('Kayvaan Shrike, Keywords Section', 'DATASHEET',
     '/html/body/div/div[1]/div[3]/div[2]/div[20]', 'keywords'),
    ('Librarian in Terminator Armour, Keywords Section', 'DATASHEET',
     '/html/body/div/div[1]/div[3]/div[10]/div[36]', 'keywords'),
    ('Techmarine, Techmarine Ability', 'DATASHEET_ABILITY',
     '/html/body/div/div[1]/div[3]/div[10]/div[44]/div[2]/div[2]/div[2]', 'text'),
]


def normalized(value):
    return ' '.join(re.sub(r'(?m)^\s*(?:▪|-)[ \t]+', '', value).split())


def official_oracle(root=ROOT):
    path = Path(root) / PDF_DOCUMENT
    assert hashlib.sha256(path.read_bytes()).hexdigest().upper() == PDF_SHA, 'Accepted PDF bytes changed'
    with pdfplumber.open(path) as pdf:
        assert len(pdf.pages) == 1, 'Printed update must have exactly one complete page'
        text = pdf.pages[0].extract_text(x_tolerance=3, y_tolerance=3)
    assert 'PRINTED PRODUCT UPDATES: VERSION 1.1' in text
    assert text.count('Change to:') == 3 and len(re.findall(r'(?m)^Add ', text)) == 2
    result = []
    for number, (heading, kind, pointer, field) in enumerate(TARGETS):
        instruction = text.split(heading + '\n', 1)[1]
        if number + 1 < len(TARGETS):
            instruction = instruction.split(TARGETS[number + 1][0], 1)[0]
        instruction = instruction.strip()
        if field == 'text':
            assert instruction.startswith('Change to:\n‘') and instruction.endswith('’')
            value = normalized(instruction.split('Change to:', 1)[1].strip()[1:-1])
        else:
            value = re.findall('‘([^’]+)’', instruction)
        result.append({'heading': heading, 'kind': kind, 'pointer': pointer,
                       'field': field, 'value': value,
                       'sourceText': heading + '\n' + instruction})
    return result


def check_official(base, effective, root=ROOT):
    oracle = official_oracle(root)
    base_ids = {e['id']: e for e in base['entities']}
    effective_ids = {e['id']: e for e in effective['entities']}
    assert len(base_ids) == len(base['entities'])
    assert set(base_ids) == set(effective_ids), 'Official application changed the identity inventory'
    updates = effective['officialUpdates']
    assert len(updates) == len(oracle), 'Not all five printed instructions are covered'
    expected_entities = copy.deepcopy(base_ids)
    for item in oracle:
        targets = [e for e in base['entities'] if e['kind'] == item['kind']
                   and e['provenance']['pointer'] == item['pointer']]
        assert len(targets) == 1
        target = targets[0]
        current = effective_ids[target['id']]
        field = item['field']
        before, after = target['data'][field], current['data'][field]
        if field == 'text':
            prefix = target['data']['title'] + ':'
            assert after.startswith(prefix), 'Printed update changed the accepted ability heading/frequency'
            assert normalized(after[len(prefix):]) == item['value'], 'Effective ability differs from independent PDF body'
            if 'Righteous Fury' in prefix:
                assert 'Once per battle, per army' in prefix
        else:
            expected = before + [keyword for keyword in item['value'] if keyword not in before]
            assert after == expected, 'Official keyword addition changed other keywords'
        expected_entities[target['id']]['data'][field] = copy.deepcopy(after)
        proof = current['fieldProvenance'][field]
        assert proof['document'] == PDF_DOCUMENT and proof['sha256'] == PDF_SHA
        assert proof['page'] == 1 and proof['authority'] == 'AUTHORITATIVE_CURRENT'
        assert proof['sourceText'] == item['sourceText'], 'Field proof is not the complete printed instruction'
        assert hashlib.sha256(proof['sourceText'].encode()).hexdigest().upper() == proof['textSha256']
        update = [u for u in updates if u['targetIds'] == [target['id']] and u['field'] == field]
        assert len(update) == 1 and update[0]['provenance'] == proof
        assert update[0]['status'] == ('VERIFY_CURRENT' if before == after else 'APPLIED')
        expected_entities[target['id']].setdefault('fieldProvenance', {})[field] = copy.deepcopy(proof)
    assert expected_entities == effective_ids, 'Unrelated factual fields changed during official application'
    return {'instructions': len(oracle), 'changedFields': sum(u['status'] == 'APPLIED' for u in updates),
            'verifiedCurrentFields': sum(u['status'] == 'VERIFY_CURRENT' for u in updates)}


def corruption_controls(base, apply_official, root=ROOT):
    controls = 0
    for item in TARGETS:
        heading, kind, pointer, field = item
        broken = copy.deepcopy(base)
        target = next(e for e in broken['entities'] if e['kind'] == kind and e['provenance']['pointer'] == pointer)
        target['data'][field] = target['data'][field] + (['INVALID'] if field == 'keywords' else ' INVALID')
        try:
            apply_official(broken, root=root)
        except ValueError:
            controls += 1
        else:
            raise AssertionError('Corrupted official target was accepted: ' + heading)
    for mode in ('missing', 'duplicate', 'parent'):
        broken = copy.deepcopy(base)
        target = next(e for e in broken['entities'] if e['provenance']['pointer'] == TARGETS[0][2])
        if mode == 'missing':
            broken['entities'].remove(target)
        elif mode == 'duplicate':
            broken['entities'].append(copy.deepcopy(target))
        else:
            target['parentId'] = 'invalid-parent'
        try:
            apply_official(broken, root=root)
        except ValueError:
            controls += 1
        else:
            raise AssertionError('Corrupted official binding was accepted: ' + mode)
    return controls


if __name__ == '__main__':
    spec = importlib.util.spec_from_file_location('sm_official', HERE / 'official.py')
    producer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(producer)
    base = json.loads((HERE / 'generated/base.json').read_text(encoding='utf-8'))
    pristine = copy.deepcopy(base)
    effective = producer.apply_official(base)
    result = check_official(base, effective)
    assert base == pristine, 'Official application mutated base'
    result['corruptionControls'] = corruption_controls(base, producer.apply_official)
    print(json.dumps({'status': 'PASS', **result}, indent=2))
