"""Source verification around the one shared official-update interpreter.

The PDF supplies the instruction and replacement body. Explicit source XPath
bindings identify records; display titles only assert that a binding still owns
the reviewed source field. This module does not create gameplay contracts.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

import pdfplumber

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT/'books/shared/official-updates-v1'))
from bridge import apply_book_official_updates


def value_sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode('utf-8')).hexdigest().upper()


def _sha(value):
    return hashlib.sha256(value).hexdigest().upper()


def _body_norm(value):
    # Compare prose while allowing only presentation differences in list markers.
    return ' '.join(re.sub(r'(?m)^\s*(?:▪|-)[ \t]+', '', value).split())


def _one(items, label):
    if len(items) != 1:
        raise ValueError(f'Official binding must resolve exactly once: {label} ({len(items)})')
    return items[0]


def _target(entities, binding):
    target = _one([e for e in entities if e['kind'] == binding['kind']
        and e.get('provenance', {}).get('pointer') == binding['pointer']], binding['pointer'])
    for key in ('id', 'sourceEntityId'):
        if binding.get(key) and target.get(key) != binding[key]:
            raise ValueError('Official bound identity changed: ' + binding['pointer'])
    if target['bookId'] != 'space-marines':
        raise ValueError('Official target belongs to another book')
    owner = target if binding['kind'] == 'DATASHEET' else _one(
        [e for e in entities if e['id'] == target.get('parentId') and e['kind'] == 'DATASHEET'],
        'parent of ' + target['id'])
    if owner['data']['sourceAnchor'] != binding['sourceAnchor']:
        raise ValueError('Official source owner changed: ' + binding['sourceAnchor'])
    if target['data']['title'] != binding['expectedTitle']:
        raise ValueError('Official source heading changed: ' + binding['pointer'])
    if any(target['provenance'].get(key) != binding[expected]
           for key, expected in (('sourceId', 'sourceId'), ('document', 'sourceDocument'),
                                 ('sha256', 'sourceSha256'))):
        raise ValueError('Official source enrollment changed')
    return target


def verify_official_source(base, root=ROOT):
    """Authenticate all accepted PDF instructions without changing any facts."""
    root = Path(root)
    declarations = json.loads((root / 'books/space-marines/v2/official-bindings.json').read_text(encoding='utf-8'))
    document = declarations['sourceDocument']
    pdf_path = root / document
    if _sha(pdf_path.read_bytes()) != declarations['sourceSha256']:
        raise ValueError('Accepted official PDF changed')
    entities = base['entities']
    with pdfplumber.open(pdf_path) as pdf:
        if len(pdf.pages) != declarations['sourcePageCount']:
            raise ValueError('Official PDF page inventory changed')
        page_text = pdf.pages[0].extract_text(x_tolerance=3, y_tolerance=3) or ''
        if _sha(page_text.encode('utf-8')) != declarations['completePageTextSha256']:
            raise ValueError('Official complete-page text changed')
        for item in declarations['occurrences']:
            box = item['sourceBox']
            text = pdf.pages[box['page'] - 1].crop(tuple(box['bbox'])).extract_text(x_tolerance=3, y_tolerance=3) or ''
            if text != item['sourceQuote'] or _sha(text.encode('utf-8')) != box['textSha256']:
                raise ValueError('Official instruction changed: ' + item['id'])
            binding = item['target']
            target = _target(entities, binding)
            field = item['field']
            before = target['data'][field]
            if value_sha(before) != item['beforeSha256']:
                raise ValueError('Official target field changed: ' + item['id'])
            operation = item['operation']
            if operation == 'REPLACE_BODY':
                body = text.split('Change to:', 1)[1].strip()
                if not (body.startswith('‘') and body.endswith('’')):
                    raise ValueError('Official replacement is not a complete quotation')
                body = body[1:-1]
                if _body_norm(body) != item['replacementBodyNormalized']:
                    raise ValueError('Official replacement body changed')
                prefix = target['data']['title'] + ':'
                if not before.startswith(prefix):
                    raise ValueError('Official ability heading is not preserved')
            elif operation == 'REQUIRE_KEYWORDS':
                if not isinstance(before, list) or not all(isinstance(v, str) for v in before):
                    raise ValueError('Official keywords are not a native string array')
                if any('‘' + keyword + '’' not in text for keyword in item['requiredKeywords']):
                    raise ValueError('Official keyword instruction changed')
            else:
                raise ValueError('Unknown official operation: ' + operation)


def apply_official(base, root=ROOT):
    """Return the shared transaction after authenticating accepted evidence."""
    root = Path(root)
    verify_official_source(base, root)
    effective = apply_book_official_updates('space-marines', base, root)['model']
    effective['schema'] = 'space-marines-v2-effective/v1'
    return effective
