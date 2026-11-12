"""Thin JSON transport to the one JS official-update interpreter."""
import json
import os
from pathlib import Path
import subprocess


def apply_book_official_updates(book_id, model, root, sources=None):
    root = Path(root)
    request = {'bookId': book_id, 'model': model, 'root': str(root)}
    if sources is not None:
        request['sources'] = sources
    result = subprocess.run(
        ['node', str(root / 'books/shared/official-updates-v1/book.mjs')],
        input=json.dumps(request, ensure_ascii=False), text=True,
        encoding='utf-8', capture_output=True,
        env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
    if result.returncode:
        raise ValueError(result.stderr.strip() or 'Official update interpreter failed')
    return json.loads(result.stdout)
