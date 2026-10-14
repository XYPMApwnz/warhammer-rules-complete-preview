"""Read only frozen, source-bound official PDF fields; never import QA expectations."""
import copy
import hashlib
import json
from pathlib import Path
import pdfplumber

sha = lambda value: hashlib.sha256(value).hexdigest().upper()
value_sha = lambda value: sha(json.dumps(value, ensure_ascii=False, sort_keys=True).encode())


def resolve(value, pointer):
    for token in pointer.strip('/').split('/') if pointer else []:
        token = token.replace('~1', '/').replace('~0', '~')
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def read_official(root):
    root = Path(root)
    bindings = json.loads((root/'books/emperors-children/v2/official-bindings.json').read_text(encoding='utf-8'))
    document = root/bindings['sourceDocument']
    if sha(document.read_bytes()) != bindings['sourceSha256']:
        raise ValueError('Official EC PDF integrity mismatch')
    corpus = json.loads((root/bindings['corpusDocument']).read_text(encoding='utf-8'))
    updates = []
    with pdfplumber.open(document) as pdf:
        for occurrence in bindings['occurrences']:
            box = occurrence['sourceBox']
            text = ' '.join((pdf.pages[box['page']-1].crop(tuple(box['bbox'])).extract_text(x_tolerance=2, y_tolerance=3) or '').split())
            if sha(text.encode()) != box['textSha256']:
                raise ValueError('Official source occurrence changed: '+occurrence['id'])
            patches = []
            for patch in occurrence['patches']:
                old = resolve(corpus, patch['corpusPointer'])
                if value_sha(old) != patch['beforeSha256']:
                    raise ValueError('Official source target/input changed: '+patch['sourceId'])
                if patch['mode'] == 'VERIFY_ALREADY_CURRENT':
                    value = copy.deepcopy(old)
                elif patch['mode'] == 'SOURCE_SPANS':
                    parts = []
                    for part in patch['parts']:
                        start, end = part['span']
                        if not 0 <= start < end <= len(text):
                            raise ValueError('Invalid official replacement span')
                        fragment = text[start:end]
                        if sha(fragment.encode()) != part['sha256']:
                            raise ValueError('Official replacement source changed')
                        for operation in part.get('typography', []):
                            if operation == 'NONBREAKING_HYPHEN_TO_ASCII':
                                fragment = fragment.replace('\u2011', '-')
                            elif operation == 'BULLET_TO_ASCII' and fragment.startswith('▪ '):
                                fragment = '- '+fragment[2:]
                            else:
                                raise ValueError('Unrecognized bounded source typography operation')
                        parts.append(fragment)
                    value = patch.get('join', '').join(parts)
                else:
                    raise ValueError('Unsupported official field operation')
                patches.append({**copy.deepcopy(patch), 'value': value})
            updates.append({'id': occurrence['id'], 'group': occurrence['group'], 'status': occurrence['status'],
                            'sourceText': text, 'patches': patches, 'adjudications': occurrence.get('adjudications', []),
                            'provenance': {'sourceId': bindings['sourceId'], 'document': bindings['sourceDocument'], 'sha256': bindings['sourceSha256'],
                                           'page': box['page'], 'bbox': box['bbox'], 'textSha256': box['textSha256'], 'effectiveFrom': bindings['effectiveFrom'], 'authority': 'AUTHORITATIVE_CURRENT'}})
    if len({update['id'] for update in updates}) != len(updates):
        raise ValueError('Duplicate official occurrence identity')
    return {'sourceDocument': bindings['sourceDocument'], 'sourceSha256': bindings['sourceSha256'], 'updates': updates}
