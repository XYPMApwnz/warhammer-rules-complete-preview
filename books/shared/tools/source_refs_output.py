"""Normalize source declarations only at the final generated-output boundary.

The factual producer keeps its accepted-source objects and hash inputs intact.
One shared Node invocation normalizes every output independently; Python then
retains the existing UTF-8, two-space, non-ASCII-escaped JSON byte format.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path


def generated_source_outputs(outputs, repo_root):
    """Return normalized output objects without mutating the producer's inputs."""
    if not isinstance(outputs, dict):
        raise TypeError("Generated source outputs must be a named object")
    root = Path(repo_root).resolve()
    cli = root / "books/shared/source-refs-v2/producer-io.mjs"
    result = subprocess.run(
        ["node", str(cli), "--batch"],
        input=json.dumps(outputs, ensure_ascii=False, separators=(",", ":")).encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=root,
        check=False,
    )
    if result.returncode:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError("Source-reference output normalization failed: " + message)
    normalized = json.loads(result.stdout.decode("utf-8"))
    if not isinstance(normalized, dict) or list(normalized) != list(outputs):
        raise ValueError("Source-reference normalizer changed the output document set/order")
    return normalized


def serialized_source_outputs(outputs, repo_root):
    """Return final generated JSON bytes, always UTF-8 with LF and one newline."""
    root = Path(repo_root).resolve()
    result = subprocess.run(
        ["node", str(root / "books/shared/source-refs-v2/producer-io.mjs"), "--batch", "--serialized"],
        input=json.dumps(outputs, ensure_ascii=False, separators=(",", ":")).encode("utf-8"),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=root, check=False,
    )
    if result.returncode:
        raise RuntimeError("Source-reference serialization failed: " + result.stderr.decode("utf-8", errors="replace"))
    values = json.loads(result.stdout.decode("utf-8"))
    if not isinstance(values, dict) or list(values) != list(outputs) or not all(isinstance(value, str) for value in values.values()):
        raise ValueError("Source-reference serializer changed the output document set/order")
    return {name: value.encode("utf-8") for name, value in values.items()}
