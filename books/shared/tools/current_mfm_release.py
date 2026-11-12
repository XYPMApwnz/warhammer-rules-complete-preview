"""Read the current MFM selection through its shared JavaScript validator.

Python factual producers only consume this result; pointer validation and the
release schema remain owned by mfm/content/current-mfm-release.mjs.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path


def read_current_mfm_release(repo_root):
    root = Path(repo_root).resolve()
    script = """import {pathToFileURL} from 'node:url';
const root=process.argv[1];
const {readCurrentMfmRelease}=await import(pathToFileURL(root+'/mfm/content/current-mfm-release.mjs'));
process.stdout.write(JSON.stringify(readCurrentMfmRelease({repoRoot:root})));
"""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script, str(root)],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=root, check=False,
    )
    if result.returncode:
        raise RuntimeError("Current MFM selection failed: " + result.stderr.decode("utf-8", errors="replace").strip())
    return json.loads(result.stdout.decode("utf-8"))
