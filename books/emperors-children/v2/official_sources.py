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
    """Verify source evidence from the common document; never apply a field."""
    root = Path(root)
    passport = json.loads((root/'books/emperors-children/book.config.json').read_text(encoding='utf-8'))['passport']
    declared = json.loads((root/passport['official']['input']).read_text(encoding='utf-8'))
    if declared['schema'] != 'army-book-official-updates/v1' or declared['bookId'] != 'emperors-children':
        raise ValueError('Official EC common-format ownership mismatch')
    updates, grouped, pdfs = [], {}, {}
    source_documents = {}
    try:
        for entry in declared['entries']:
            source = entry['source']
            document = root/source['document']
            if source['document'] not in source_documents:
                source_documents[source['document']] = sha(document.read_bytes())
            if source_documents[source['document']] != source['sha256']:
                raise ValueError('Official EC PDF integrity mismatch')
            annotation = entry.get('annotations', {})
            occurrence = annotation.get('occurrence')
            if occurrence is None:
                # New plain common-format updates need no historical PDF-span
                # transcription. Their exact field guard is owned by the applier.
                continue
            patch = annotation['sourcePatch']
            corpus = json.loads((root/annotation['corpusDocument']).read_text(encoding='utf-8'))
            box = occurrence['sourceBox']
            if source['page'] != box['page']:
                raise ValueError('Official source page identity changed')
            if source['document'] not in pdfs:
                pdfs[source['document']] = pdfplumber.open(document)
            text = ' '.join((pdfs[source['document']].pages[box['page']-1].crop(tuple(box['bbox'])).extract_text(x_tolerance=2, y_tolerance=3) or '').split())
            if sha(text.encode()) != box['textSha256']:
                raise ValueError('Official source occurrence changed: '+occurrence['id'])
            old = resolve(corpus, patch['corpusPointer'])
            if value_sha(old) != patch['beforeSha256'] or old != entry['expectedBefore']:
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
            if value != entry['after']:
                raise ValueError('Declared official after differs from verified source: '+entry['id'])
            provenance = {'sourceId': source['id'], 'document': source['document'], 'sha256': source['sha256'],
                          'page': box['page'], 'bbox': box['bbox'], 'textSha256': box['textSha256'],
                          'effectiveFrom': source['effectiveFrom'], 'authority': 'AUTHORITATIVE_CURRENT'}
            if entry['provenance'] != provenance:
                raise ValueError('Official field provenance differs from verified source')
            field = '/'+('/'.join(str(part).replace('~', '~0').replace('/', '~1') for part in entry['target']['field']))
            if field != patch['field']:
                raise ValueError('Official canonical field differs from its exact source address')
            update_id = occurrence['id']
            if update_id not in grouped:
                update = {'id': update_id, 'group': occurrence['group'], 'status': occurrence['status'],
                          'sourceText': text, 'patches': [], 'adjudications': occurrence.get('adjudications', []),
                          'provenance': provenance}
                grouped[update_id] = (copy.deepcopy(occurrence), update)
                updates.append(update)
            prior_occurrence, update = grouped[update_id]
            if prior_occurrence != occurrence or update['provenance'] != provenance or update['sourceText'] != text:
                raise ValueError('Conflicting official occurrence metadata')
            update['patches'].append({**copy.deepcopy(patch), 'targetId': entry['target']['id'], 'value': value})
    finally:
        for pdf in pdfs.values():
            pdf.close()
    return {'updates': updates, 'document': declared}
