"""Bounded raw-source inventory and official restoration of a missed sibling.

No legacy parser imports, gameplay execution or independently maintained text.
"""
import copy
import hashlib
import json
from lxml import html
import pdfplumber

norm = lambda text: ' '.join(text.split())
sha = lambda value: hashlib.sha256(value).hexdigest().upper()


def body(node):
    node = copy.deepcopy(node)
    for unwanted in node.xpath('.//h2|.//h3|.//script|.//style|.//*[contains(concat(" ",normalize-space(@class)," ")," ShowFluff ") or contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]'):
        parent = unwanted.getparent()
        if parent is not None:
            previous = unwanted.getprevious()
            if previous is not None:
                previous.tail = (previous.tail or '') + (unwanted.tail or '')
            else:
                parent.text = (parent.text or '') + (unwanted.tail or '')
            parent.remove(unwanted)
    for br in node.xpath('.//br'):
        br.tail = '\n' + (br.tail or '')
    for li in node.xpath('.//li'):
        li.text = '\n- ' + (li.text or '')
        li.tail = '\n' + (li.tail or '')
    return '\n'.join(norm(line) for line in ''.join(node.itertext()).splitlines() if norm(line))


def read_named_rules(root, corpus):
    here = root/'books/emperors-children/v2'
    binding = json.loads((here/'detachment-rule-bindings.json').read_text(encoding='utf-8'))
    raw = (root/binding['sourceDocument']).read_bytes()
    if sha(raw) != binding['sourceSha256']:
        raise ValueError('Named Detachment source integrity mismatch')
    tree = html.fromstring(raw.decode('utf-8'))
    corpus_document = 'books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json'
    corpus_sha = sha((root/corpus_document).read_bytes())
    declared = {(row['owner'], row['anchor']): row for row in binding['rules']}
    if len(declared) != len(binding['rules']) or len({row['id'] for row in binding['rules']}) != len(declared):
        raise ValueError('Duplicate named rule source identity')
    oracle = []
    for index, detachment in enumerate(corpus['detachments']):
        headings = tree.xpath('//div[@data-f=$filter]//h2[starts-with(@id,"Detachment-Rule")]', filter=detachment['filterId'])
        if len(headings) != 1:
            raise ValueError('Ambiguous raw Detachment rule section')
        node = headings[0].getparent().getnext()
        while node is not None and not node.xpath('self::h2|.//h2'):
            for heading in node.xpath('self::h3[@id]|.//h3[@id]'):
                key = (detachment['sourceId'], heading.get('id'))
                if key not in declared:
                    raise ValueError('Missing named rule identity: '+str(key))
                oracle.append({**declared[key], 'corpusPointer': f'/detachments/{index}/rule',
                               'corpusDocument': corpus_document, 'corpusSha256': corpus_sha, 'title': norm(heading.text_content()),
                               'text': body(heading.getparent()),
                               'provenance': {'sourceId': 'ec-waha-11e-2026-09-28', 'document': binding['sourceDocument'],
                                              'sha256': binding['sourceSha256'], 'anchor': heading.get('id')}})
            node = node.getnext()
    if {(row['owner'], row['anchor']) for row in oracle} != set(declared) or len(oracle) != len(declared):
        raise ValueError('Missing/duplicate raw named rule occurrence')
    addition = binding['officialAddition']
    official = json.loads((here/'official-bindings.json').read_text(encoding='utf-8'))
    document = root/official['sourceDocument']
    if sha(document.read_bytes()) != official['sourceSha256']:
        raise ValueError('Official named rule PDF integrity mismatch')
    with pdfplumber.open(document) as pdf:
        text = norm(pdf.pages[addition['page']-1].crop(tuple(addition['bbox'])).extract_text(x_tolerance=2, y_tolerance=3) or '')
    if sha(text.encode()) != addition['textSha256']:
        raise ValueError('Official named rule body changed')
    master, = [row for row in oracle if row['id'] == addition['id']]
    # PDF small-cap keyword extraction yields "Fulgrim"; raw HTML says FULGRIM.
    # This bounded cross-source typography check does not normalize game facts.
    if norm(master['text']).casefold() != text.casefold():
        raise ValueError('Official/raw named rule contradiction')
    master['text'] = text
    master['provenance'] = {'sourceId': official['sourceId'], 'document': official['sourceDocument'],
        'sha256': official['sourceSha256'], 'page': addition['page'], 'bbox': addition['bbox'],
        'textSha256': addition['textSha256'], 'effectiveFrom': official['effectiveFrom'],
        'authority': 'AUTHORITATIVE_CURRENT', 'acceptedOccurrence': master['provenance']}
    master['referenceBindings'] = copy.deepcopy(addition['referenceBindings'])
    return oracle


def validate_named_rules(records, oracle):
    """Compare raw named inventory with canonical base, before official overlays."""
    actual = [row for row in records if row['kind'] == 'DETACHMENT_RULE']
    if len(actual) != len(oracle) or {row['id'] for row in actual} != {row['id'] for row in oracle}:
        raise ValueError('Missing/extra/duplicate named canonical rule')
    by_id = {row['id']: row for row in actual}
    for expected in oracle:
        record = by_id[expected['id']]
        if record.get('parentId') != expected['owner'] or record['data']['title'] != expected['title']:
            raise ValueError('Wrong named rule identity/owner')
        # A nested source table wrapper is separately owned in the base model.
        tables = [row for row in records if row.get('parentId') == record['id'] and row['kind'] == 'SOURCE_PRESENTATION_NOTE']
        text = expected['text']
        for table in tables:
            original = next(row for row in records if row['id'] == table['data']['semanticTableIds'][0])
            # Canonicalization removes the duplicated flattened wrapper line.
            wrapper = ''.join(''.join(line) for line in original['data']['rows'])
            text = text.replace(wrapper, '').strip()
        if record['data']['text'] != text:
            raise ValueError('Lost/changed named rule text: '+record['id'])
        proof = record.get('provenance', {})
        source = expected['provenance']
        if any(proof.get(key) != source[key] for key in ['sourceId', 'sha256', 'document']):
            raise ValueError('Missing named rule provenance')
        if not expected.get('referenceBindings') and (proof.get('pointer') != expected['corpusPointer'] or
                any(proof.get(key) != expected[key] for key in ['corpusDocument', 'corpusSha256'])):
            raise ValueError('Lost named rule source identity')
        if expected.get('referenceBindings') and (proof != expected['provenance'] or record['data'].get('referenceBindings') != expected['referenceBindings']):
            raise ValueError('Lost official named rule source identity/provenance')
        parent, = [row for row in records if row['id'] == expected['owner']]
        if parent['data']['ruleIds'].count(record['id']) != 1:
            raise ValueError('Missing/duplicate Detachment rule binding')
