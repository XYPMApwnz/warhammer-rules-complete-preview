"""Independent raw-source lifetime census. No producer/contract imports.

Reviewed recipient bindings are QA evidence only. Re-enumerate source cards and
boundaries, verify exact clause scopes, and reject unreviewed source changes.
"""
import hashlib
import json
import re
from pathlib import Path
from lxml import html
import pdfplumber

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent


def normalize(value):
    value = re.sub(r'(^|\s)-\s+', r'\1', value.lower())
    value = re.sub(r'([.!?])\s*', r'\1 ', value)
    return re.sub(r'\s+', ' ', value).strip()


def flow(node):
    value = node.text or ''
    for child in node:
        value += ('\n' if child.tag == 'br' else flow(child)) + (child.tail or '')
    return value


def census():
    reviewed = json.loads((HERE / 'stratagem-duration-source-expectations.json').read_text('utf8'))
    enrollment = json.loads((HERE / 'sources/source-enrollment.json').read_text('utf8'))
    source_path = 'books/death-guard/v2/sources/accepted-waha-pages/death-guard.html'
    raw = (ROOT / source_path).read_bytes()
    digest = hashlib.sha256(raw).hexdigest().upper()
    capture = next(row for row in enrollment['acceptedRawCaptures'] if row['path'] == source_path)
    assert digest == capture['sha256'], 'Accepted raw source changed'
    doc = html.fromstring(raw.decode('utf8'))
    tree = doc.getroottree()
    scopes = {'DG:1001', 'DG:41', 'DG:5', 'DG:201', 'DG:101', 'DG:11', 'DG:9', 'DG:21', 'DG:81'}
    sections = [node for node in doc.xpath('//div[@id="wahMainContent"]/div[@data-f]') if node.get('data-f') in scopes]
    assert {node.get('data-f') for node in sections} == scopes
    nodes = [node for section in sections for node in section.xpath('.//div[@class="str11Text"][b[normalize-space(.)="TARGET:"]]')]
    bindings = {row['sourceProof']['rawLocator']: row for row in reviewed['stratagems']}
    assert len(bindings) == len(reviewed['stratagems'])
    assert set(bindings) == {tree.getpath(node) for node in nodes}, 'Independent whole-source Stratagem denominator'
    pdf_sources = {row['path']: row for row in enrollment['sources'] if row['type'] == 'OFFICIAL_PDF'}
    pdf_pages = {}
    official_count = 0
    rows = []
    for node in nodes:
        row = bindings[tree.getpath(node)]
        assert row['sourceProof']['path'] == source_path and row['sourceProof']['sha256'] == digest
        body = flow(node)
        effect = re.split(r'\bEFFECT:\s*', body, maxsplit=1)[1]
        effect = re.split(r'\bRESTRICTIONS?:', effect, maxsplit=1)[0].strip()
        assert normalize(effect) == normalize(row['sourceEffect']), (row['sourceId'], 'Accepted EFFECT changed')
        boundaries = list(re.finditer(r'\buntil (?:the )?[^.,:;]+|\bin the same phase\b', effect, re.I))
        assert [normalize(match[0]) for match in boundaries] == [normalize(d['sourcePhrase']) for d in row['expectedDurations']], 'Missing/unreviewed source lifetime'
        for boundary, expected in zip(boundaries, row['expectedDurations']):
            assert normalize(expected['sourceScopeQuote']) in normalize(effect)
            assert normalize(boundary[0]) in normalize(expected['sourceScopeQuote'])
            assert expected['bindings'], 'Source lifetime has no reviewed recipient'
            assert all(binding in row['operations'] for binding in expected['bindings'])
        for operation in enrollment['overlayOperations']:
            if operation.get('targetId') != row['sourceId'] or operation['field'] != ['lines']:
                continue
            proof = operation['provenance']
            key = (proof['documentPath'], proof['page'])
            if key not in pdf_pages:
                document = ROOT / key[0]
                assert hashlib.sha256(document.read_bytes()).hexdigest().upper() == pdf_sources[key[0]]['sha256']
                with pdfplumber.open(document) as pdf:
                    page = pdf.pages[key[1] - 1]
                    pdf_pages[key] = '\n'.join(page.crop(box).extract_text() or '' for box in
                        [(0, 0, page.width / 2, page.height), (page.width / 2, 0, page.width, page.height)])
            typography = lambda value: re.sub(r'[^a-z0-9]+', '', value.lower())
            assert typography(row['sourceEffect']) in typography(pdf_pages[key]), (row['sourceId'], 'Official EFFECT contradiction')
            official_count += 1
        rows.append(row)
    totals = {'stratagemsScanned': len(rows), 'durationClausesTotal': sum(len(row['expectedDurations']) for row in rows),
              'effectRecipientBindings': sum(len(d['bindings']) for row in rows for d in row['expectedDurations']),
              'sourceUnspecified': sum(not row['expectedDurations'] for row in rows), 'officialEffectsVerified': official_count}
    return {'authority': 'INDEPENDENT_QA_EVIDENCE_ONLY', 'totals': totals, 'stratagems': rows}


if __name__ == '__main__':
    print(json.dumps(census(), ensure_ascii=True))
