"""Independent accepted-source census for every DG V2 Enhancement predicate.

The expectation file is reviewed source adjudication, never contract output.
Default stdout is machine-readable source evidence for the Node QA consumer.
An optional --model JSON path (or '-' for stdin) checks a supplied effective
model without building, writing, importing producers, or consulting V1 facts.
"""
import argparse
from collections import Counter
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
import sys

from lxml import html
import pdfplumber

ROOT = Path(__file__).resolve().parents[3]
DIRECTORY = ROOT / 'books/death-guard/v2'
EXPECTATIONS = DIRECTORY / 'enhancement-predicate-source-expectations.json'


def norm(value):
    """Typography normalization for separately typeset HTML/PDF evidence."""
    value = str(value).replace('\u2011', '-').replace('\u2010', '-')
    value = value.replace('\u2019', "'").replace('\u2018', "'")
    return re.sub(r'\s+', ' ', value).strip().lower()


def has_class(node, token):
    return token in (node.get('class') or '').split()


def sha256(file):
    return hashlib.sha256(file.read_bytes()).hexdigest().upper()


def predicates(value):
    if isinstance(value, dict):
        if 'predicate' in value:
            yield value
        for child in value.values():
            yield from predicates(child)
    elif isinstance(value, list):
        for child in value:
            yield from predicates(child)


def semantic(value):
    """Keep every declared selector/condition value; remove evidence metadata."""
    if isinstance(value, dict):
        return {key: semantic(child) for key, child in value.items()
                if key not in ('sourceQuote', 'evidence', 'sourceFields')}
    if isinstance(value, list):
        return [semantic(child) for child in value]
    return value


def source_census():
    census = json.loads(EXPECTATIONS.read_text('utf8'))
    enrollment = json.loads((DIRECTORY / 'sources/source-enrollment.json').read_text('utf8'))
    accepted_base = enrollment['acceptedBase']
    assert sha256(ROOT / accepted_base['path']) == accepted_base['sha256'].upper(), 'Accepted corpus byte identity changed'
    corpus = json.loads((ROOT / accepted_base['path']).read_text('utf8'))
    page_pins = {page['file']: page for page in corpus['pages']}
    hub_path = DIRECTORY / 'sources/accepted-waha-pages/death-guard.html'
    hub_sha = sha256(hub_path)
    assert hub_sha == page_pins['death-guard.html']['sha256'].upper(), 'Accepted hub byte identity changed'
    document = html.fromstring(hub_path.read_bytes())
    tree = document.getroottree()
    ordered = list(document.iter())
    positions = {node: index for index, node in enumerate(ordered)}
    cutoff = positions[document.get_element_by_id('Crusade-Rules')]
    # Fresh denominator: all Enhancement price cards before excluded Crusade.
    # These DOM addresses are evidence locators, never gameplay identity joins.
    source_cards = [node for node in ordered[:cutoff]
                    if node.tag == 'ul' and has_class(node, 'EnhancementsPts')]
    source_owners = {tree.getpath(node.getparent()) for node in source_cards}
    rows = census['records']
    ids = [row['id'] for row in rows]
    assert len(ids) == len(set(ids)), 'Duplicate census canonical identity'
    assert len(source_cards) == len(source_owners), 'Ambiguous raw Enhancement card ownership'
    assert source_owners == {row['sourceProof']['rawLocator'] for row in rows}, 'Incomplete or extra source Enhancement census'

    addresses = json.loads((DIRECTORY / 'rule-source-addresses.json').read_text('utf8'))
    bindings = {item['ruleId']: item for item in addresses['bindings']
                if ':enhancement:' in item['ruleId']}
    assert set(ids) == set(bindings), 'Census does not cover the exact canonical source address set'
    intro = document.get_element_by_id(census['introductionProof']['rawAnchor']).getnext()
    intro_text = norm(intro.text_content())
    for quote in census['introductionProof']['quotes']:
        assert norm(quote) in intro_text, ('Missing Introduction scope evidence', quote)

    enrolled = {item['id']: item for item in enrollment['sources']}
    overlay_by_target = {}
    for operation in enrollment['overlayOperations']:
        if ':enhancement:' in operation['targetId']:
            overlay_by_target.setdefault(operation['targetId'], []).append(operation)
    official_rows = set()
    source_upgrades = set()
    label_rows = set()
    pdfs = {}
    publisher_pages = {}
    try:
        for row in rows:
            proof = row['sourceProof']
            assert proof['path'] == hub_path.relative_to(ROOT).as_posix(), row['id']
            assert proof['sha256'].upper() == hub_sha, row['id']
            owners = document.xpath(proof['rawLocator'])
            assert len(owners) == 1, ('Unresolved/ambiguous source address', row['id'])
            owner = owners[0]
            title = owner.xpath('./ul/li/span')[0]
            if any(has_class(node, 'EnhUpgrade') for node in title.iter()):
                source_upgrades.add(row['id'])
            copied_title = deepcopy(title)
            for badge in list(copied_title.iter()):
                if has_class(badge, 'EnhUpgrade'):
                    badge.drop_tree()
            assert norm(copied_title.text_content()) == norm(proof['title']), ('Source title changed', row['id'])
            paragraphs = owner.xpath('./p[not(contains(concat(" ",normalize-space(@class)," ")," ShowFluff "))]')
            body = norm(' '.join(node.text_content() for node in paragraphs))
            assert body == norm(proof['text']), ('Reviewed raw gameplay text changed', row['id'])

            # Existing canonical address registry supplies only identity proof.
            # It supplies no expected subjects, predicates or compatibility.
            binding = bindings[row['id']]
            reference_path = ROOT / binding['proof']['sourceArtifact']
            if reference_path not in publisher_pages:
                assert sha256(reference_path) == page_pins[reference_path.name]['sha256'].upper(), reference_path.name
                publisher_pages[reference_path] = html.fromstring(reference_path.read_bytes())
            publisher = publisher_pages[reference_path]
            reference = publisher.xpath(binding['proof']['sourceLocation']['domPath'])
            assert len(reference) == 1 and reference[0].get('data-tooltip-content') == '#' + binding['publisherReferenceId'], ('Canonical publisher address changed', row['id'])
            publisher_record = publisher.get_element_by_id(binding['publisherReferenceId'])
            assert norm(proof['title']) in norm(publisher_record.text_content()), ('Wrong canonical source identity', row['id'])
            assert row['parentId'] == row['id'].split(':')[0], ('Wrong canonical Detachment parent', row['id'])

            for atom in predicates(row['expected']):
                quote = atom['sourceQuote']
                accepted = intro_text if quote in ('CHARACTERS', 'your chosen Detachment') else body
                assert norm(quote) in accepted, ('Predicate expectation lacks raw source proof', row['id'], quote)
                if atom['subject'] == 'FORMED_ATTACHED_UNIT':
                    assert 'leading a' in body, ('Invented attachment expectation', row['id'])
            expected_leading = [atom for atom in predicates(row['expected']) if atom['predicate'] == 'LEADING']
            assert bool(expected_leading) == ('leading a' in body), ('Dropped/invented explicit leading condition', row['id'])
            owner_subject = row['expected']['roles'][0]['subject']
            assert owner_subject == ('UNIT' if 'unit only.' in body else 'MODEL'), ('Owner MODEL/UNIT source scope changed', row['id'])
            # Formation declarations and battle triggers are events. Their
            # FIELD predicates remain BATTLE; roster relationships stay ROSTER.
            for atom in predicates(row['expected']):
                if atom['predicate'] == 'LEADING' or atom['predicate'] == 'BODYGUARD_ID':
                    assert atom['contextLevel'] == 'ROSTER', row['id']
                if atom['predicate'] == 'FIELD':
                    level = 'ROSTER' if atom['arguments']['key'] in ('isBodyguardModel', 'memberOfBearerUnit') else 'BATTLE'
                    assert atom['contextLevel'] == level, ('Temporal expectation drift', row['id'], atom)

            official = row.get('officialProof')
            if official:
                source = enrolled[official['sourceId']]
                assert source['status'] == 'CURRENT' and source['reconciled'] and source['authority'] == 'OFFICIAL_GW', row['id']
                assert source['path'] == official['path'] and source['sha256'].upper() == official['sha256'].upper(), row['id']
                file = ROOT / official['path']
                assert sha256(file) == official['sha256'].upper(), ('Official PDF byte identity changed', row['id'])
                if file not in pdfs:
                    pdfs[file] = pdfplumber.open(file)
                page = pdfs[file].pages[official['page'] - 1]
                # Left column is the supplement Enhancement source body. The
                # right column contains independent Stratagems on these pages.
                official_text = norm(page.crop((0, 0, page.width / 2, page.height)).extract_text())
                for fragment in official['fragments']:
                    assert norm(fragment) in official_text, ('Official current scope evidence changed', row['id'], fragment)
                current_body = norm(official.get('currentText', body))
                if 'currentText' in official:
                    assert current_body in official_text, ('Reviewed official current text changed', row['id'])
                operations = overlay_by_target.get(row['id'], [])
                assert operations and all(item['sourceId'] == official['sourceId'] for item in operations), ('Unbound official Enhancement source', row['id'])
                for operation in operations:
                    assert operation['provenance']['page'] == official['page'], row['id']
                    if operation['field'] == ['sourceTypeLabel']:
                        assert row['id'] in source_upgrades, ('Invented UPGRADE classification', row['id'])
                        assert operation['operation'] == 'ADD' and operation['value'] == 'UPGRADE', row['id']
                        assert operation['provenance']['sourceLocator'] == row['id'], row['id']
                        assert norm(operation['provenance']['quote']) == norm(proof['title'] + ' UPGRADE'), row['id']
                        assert norm(operation['provenance']['quote']) in official_text, ('Official UPGRADE evidence changed', row['id'])
                        assert owner_subject == 'UNIT', ('UPGRADE owner scope changed', row['id'])
                        assert row['id'] not in label_rows, ('Duplicate UPGRADE label overlay', row['id'])
                        label_rows.add(row['id'])
                        continue
                    assert operation['field'] == ['text'], row['id']
                    if operation['operation'] == 'REPLACE':
                        assert norm(operation['value']) == current_body, ('Unreviewed current replacement', row['id'])
                    else:
                        assert operation['operation'] == 'QUALIFY' and operation['value']['verifiedFields'] == ['text'], row['id']
                official_rows.add(row['id'])
            else:
                assert row['id'] not in overlay_by_target, ('New unreviewed Enhancement overlay', row['id'])
        assert official_rows == set(overlay_by_target), 'Incomplete current Enhancement overlay census'
        assert label_rows == source_upgrades, 'Missing/extra source-backed UPGRADE labels'
    finally:
        for pdf in pdfs.values():
            pdf.close()

    role_counts = Counter()
    atom_counts = Counter()
    contexts = Counter()
    atoms = 0
    for row in rows:
        expected = row['expected']
        for role in expected['roles'] + [role for clause in expected['clauses'] for role in clause['roles']]:
            role_counts[role['subject']] += 1
        for atom in predicates(expected):
            atom_counts[atom['subject']] += 1
            contexts[atom['contextLevel']] += 1
            atoms += 1
    return {'schema': census['schema'], 'authority': census['authority'], 'records': rows,
            'summary': {'enhancements': len(rows), 'officialCurrentRecords': len(official_rows),
                        'rolesBySubject': dict(role_counts), 'predicates': atoms,
                        'predicatesBySubject': dict(atom_counts), 'predicatesByContext': dict(contexts)}}


def assert_model(model, evidence):
    entities = [entity for entity in model['entities'] if entity['kind'] == 'ENHANCEMENT']
    by_id = {entity['id']: entity for entity in entities}
    expected_ids = {row['id'] for row in evidence['records']}
    assert len(entities) == len(by_id) and set(by_id) == expected_ids, 'Exact source Enhancement identity coverage changed'
    for row in evidence['records']:
        entity = by_id[row['id']]
        assert entity['parentId'] == row['parentId'], ('Wrong canonical Enhancement parent', row['id'])
        current_text = row.get('officialProof', {}).get('currentText', row['sourceProof']['text'])
        assert norm(entity['data']['text']) == norm(current_text), ('Current factual text differs from accepted source', row['id'])
        contract = entity['ruleContract']
        actual = {key: contract[key] for key in ('roles', 'conditions', 'clauses')}
        assert semantic(actual) == semantic(row['expected']), ('Source predicate/participant subject, context or binding differs', row['id'])
        assignment = contract['assignment']
        assert assignment['ownerRoleId'] == row['expected']['roles'][0]['id'], row['id']
        assert semantic(assignment['selector']) == semantic(row['expected']['roles'][0]['selector']), ('Assignment clone differs from source owner', row['id'])
        assert assignment['contextLevel'] == 'ROSTER' and assignment['detachmentId'] == row['parentId'], row['id']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model', help='Read-only effective model JSON path, or - for stdin')
    parser.add_argument('--summary', action='store_true', help='Print compact verified source counts without the evidence rows')
    options = parser.parse_args()
    evidence = source_census()
    if options.model:
        model = json.loads(sys.stdin.read() if options.model == '-' else Path(options.model).read_text('utf8'))
        assert_model(model, evidence)
        evidence['summary']['modelStatus'] = 'PASS'
    print(json.dumps(evidence['summary'] if options.summary else evidence, ensure_ascii=False))


if __name__ == '__main__':
    main()
