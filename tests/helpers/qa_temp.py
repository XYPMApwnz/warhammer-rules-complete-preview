"""Owned, automatically cleaned scratch directories for this project's Python QA.

KEEP_QA_TMP=1 preserves an owned directory for debugging. Abrupt OS termination
cannot run Python cleanup; the shared queue's age/ownership sweep handles it.
"""
from __future__ import annotations

import atexit
from contextlib import contextmanager
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import shutil
import signal
import sys
import tempfile

PROJECT = "XYPMApwnz/warhammer-rules-complete-preview"
SCHEMA = "warhammer-rules-complete-preview/qa-temp-v1"
MARKER = ".warhammer-qa-temp.json"
REPOSITORY = Path(__file__).resolve().parents[2]
_owned: dict[Path, tuple[Path, dict]] = {}
_previous_signals = {}


def qa_tmp_root() -> Path:
    """Select a writable project scratch root, with no system-Temp fallback."""
    default = Path("E:/Warhammer/qa-tmp") if os.name == "nt" else REPOSITORY.parent / "qa-tmp"
    requested = Path(os.environ.get("QA_TMP_ROOT", str(default))).expanduser()
    try:
        root = requested.resolve()
        if root == REPOSITORY or root.is_relative_to(REPOSITORY):
            raise ValueError("QA_TMP_ROOT must be outside the Git checkout")
        if os.name == "nt":
            forbidden = [Path(value) / "Temp" for value in
                         (os.environ.get("LOCALAPPDATA"), os.environ.get("SystemRoot")) if value]
            if any(root == item.resolve() or root.is_relative_to(item.resolve()) for item in forbidden):
                raise ValueError("QA_TMP_ROOT must not use the Windows system Temp directory")
        root.mkdir(parents=True, exist_ok=True)
        if not root.is_dir():
            raise ValueError("QA_TMP_ROOT is not a directory")
    except (OSError, ValueError) as error:
        raise RuntimeError(f"QA_TMP_ROOT is unavailable: {requested}. Set a writable project scratch root; no system-Temp fallback is allowed.") from error
    os.environ["QA_TMP_ROOT"] = str(root)
    for key in ("TMP", "TEMP", "TMPDIR"):
        os.environ[key] = str(root)
    os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
    sys.dont_write_bytecode = True
    tempfile.tempdir = str(root)
    return root


def _cleanup(directory: Path) -> None:
    owned = _owned.get(directory)
    if owned is None:
        return
    root, expected = owned
    if not directory.exists():
        _owned.pop(directory, None)
        return
    if directory.is_symlink() or directory.parent.resolve() != root:
        raise RuntimeError(f"Refusing unsafe QA temporary cleanup: {directory}")
    marker = directory / MARKER
    actual = json.loads(marker.read_text(encoding="utf-8"))
    if actual != expected:
        raise RuntimeError(f"Refusing QA temporary cleanup with changed ownership: {directory}")
    if expected["keep"] or os.environ.get("KEEP_QA_TMP") == "1":
        if not expected["keep"]:
            expected["keep"] = True
            marker.write_text(json.dumps(expected, indent=2) + "\n", encoding="utf-8")
        _owned.pop(directory, None)
        return
    shutil.rmtree(directory)
    _owned.pop(directory, None)


def cleanup_all() -> None:
    """A failure to clean one owned directory must not hide a test exception."""
    for directory in list(_owned):
        try:
            _cleanup(directory)
        except (OSError, ValueError, RuntimeError) as error:
            print(f"QA temporary cleanup failed for {directory}: {error}", file=sys.stderr)


def _on_signal(number, frame):
    cleanup_all()
    previous = _previous_signals[number]
    if callable(previous):
        previous(number, frame)
    elif previous != signal.SIG_IGN:
        signal.signal(number, signal.SIG_DFL)
        os.kill(os.getpid(), number)


@contextmanager
def create_qa_temp_dir(prefix: str):
    """Yield an owned scratch path and remove it on success or assertion failure."""
    root = qa_tmp_root()
    if not prefix or any(character in prefix for character in ("/", "\\", "\0")):
        raise ValueError("QA temporary prefix must be a nonempty directory label")
    directory = None
    try:
        directory = Path(tempfile.mkdtemp(prefix=prefix, dir=root)).resolve()
        record = {"schema": SCHEMA, "project": PROJECT, "pid": os.getpid(),
                  "createdAt": datetime.now(timezone.utc).isoformat(),
                  "keep": os.environ.get("KEEP_QA_TMP") == "1"}
        _owned[directory] = (root, record)
        (directory / MARKER).write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    except OSError as error:
        # Allocation may succeed before the ownership marker cannot be written.
        # This path is still the just-created, in-memory-owned child of root.
        if directory is not None:
            try:
                shutil.rmtree(directory)
                _owned.pop(directory, None)
            except OSError as cleanup_error:
                print(f"QA temporary allocation cleanup failed for {directory}: {cleanup_error}", file=sys.stderr)
        raise RuntimeError(f"Cannot create QA scratch directory in {root}; no system-Temp fallback is allowed.") from error
    try:
        yield str(directory)
    finally:
        if sys.exc_info()[0] is None:
            _cleanup(directory)
        else:
            # Preserve the original failing assertion/exception and its traceback.
            try:
                _cleanup(directory)
            except (OSError, ValueError, RuntimeError) as error:
                print(f"QA temporary cleanup failed for {directory}: {error}", file=sys.stderr)


qa_tmp_root()
atexit.register(cleanup_all)
for _name in ("SIGINT", "SIGTERM"):
    if hasattr(signal, _name):
        _number = getattr(signal, _name)
        try:
            _previous = signal.getsignal(_number)
            if _previous != signal.SIG_IGN:
                _previous_signals[_number] = _previous
                signal.signal(_number, _on_signal)
        except (OSError, ValueError):
            # Installing signal handlers is only available in the main thread.
            pass
