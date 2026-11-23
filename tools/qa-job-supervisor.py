"""Linux-only, private-fd supervisor for one unchanged QA command.

FD 4 receives exact argv/environment. FD 3 emits fixed-schema process metadata;
source output passes straight through stdout/stderr and is never inspected.
"""
from __future__ import annotations

import ctypes
import errno
import json
import os
import signal
import subprocess
import sys
import time

STOPPING = False


def report(event, **values):
    raw = (json.dumps({"event": event, **values}, separators=(",", ":")) + "\n").encode("ascii")
    offset = 0
    while offset < len(raw):
        offset += os.write(3, raw[offset:])


def stop(_signum, _frame):
    global STOPPING
    STOPPING = True


def process_info(pid):
    with open("/proc/" + str(pid) + "/stat", encoding="utf-8", errors="replace") as handle:
        raw = handle.read()
    fields = raw[raw.rfind(")") + 2:].split()
    return int(fields[1]), fields[19]


def processes():
    result = {}
    for name in os.listdir("/proc"):
        if not name.isdigit():
            continue
        try:
            result[int(name)] = process_info(int(name))
        except OSError as error:
            if error.errno not in (errno.ENOENT, errno.ESRCH):
                raise
    return result


def descendants(supervisor):
    snapshot = processes()
    owned = {supervisor}
    changed = True
    while changed:
        changed = False
        for pid, (parent, _start) in snapshot.items():
            if parent in owned and pid not in owned:
                owned.add(pid)
                changed = True
    return [(pid, snapshot[pid][1]) for pid in owned if pid != supervisor]


def signal_descendants(supervisor, signum):
    for pid, start in descendants(supervisor):
        descriptor = None
        try:
            # A PID fd cannot accidentally signal a different process after PID reuse.
            descriptor = os.pidfd_open(pid, 0)
            current = process_info(pid)
            if current[1] == start:
                signal.pidfd_send_signal(descriptor, signum)
        except OSError as error:
            if error.errno not in (errno.ENOENT, errno.ESRCH):
                raise
        finally:
            if descriptor is not None:
                os.close(descriptor)


def leaf_status(status):
    code = os.waitstatus_to_exitcode(status)
    if code >= 0:
        return code, None
    try:
        name = signal.Signals(-code).name
    except ValueError:
        name = "SIGNAL_" + str(-code)
    return None, name


def main():
    if not sys.platform.startswith("linux") or not hasattr(os, "pidfd_open") or not hasattr(signal, "pidfd_send_signal"):
        report("supervisorError", code="SUBREAPER_UNAVAILABLE")
        return 125
    libc = ctypes.CDLL(None, use_errno=True)
    if libc.prctl(36, 1, 0, 0, 0) != 0:  # PR_SET_CHILD_SUBREAPER
        report("supervisorError", code="SUBREAPER_UNAVAILABLE")
        return 125
    for signum in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
        signal.signal(signum, stop)
    with os.fdopen(4, "r", encoding="utf-8") as handle:
        config = json.load(handle)
    if (not isinstance(config, dict) or set(config) != {"argv", "env", "termGraceMs"}
            or not isinstance(config["argv"], list) or not config["argv"]
            or any(not isinstance(item, str) for item in config["argv"])
            or not isinstance(config["env"], dict)
            or any(not isinstance(key, str) or not isinstance(value, str) for key, value in config["env"].items())
            or type(config["termGraceMs"]) is not int or not 0 <= config["termGraceMs"] <= 10000):
        report("supervisorError", code="SUPERVISOR_CONFIG_INVALID")
        return 125
    child = subprocess.Popen(config["argv"], env=config["env"], stdin=subprocess.DEVNULL,
                             close_fds=True)  # FD 3/4 never reach the leaf command.
    report("leafSpawn", pid=child.pid)
    supervisor, reaped, exit_code, exit_signal = os.getpid(), 0, None, None
    stop_started = None
    while True:
        empty = False
        while True:
            try:
                pid, status = os.waitpid(-1, os.WNOHANG)
            except ChildProcessError:
                empty = True  # ECHILD proves every descendant has exited and been reaped.
                break
            if not pid:
                break
            reaped += 1
            if pid == child.pid:
                child.returncode = os.waitstatus_to_exitcode(status)
                exit_code, exit_signal = leaf_status(status)
                report("leafExit", pid=pid, exitCode=exit_code, signal=exit_signal)
        if empty:
            report("complete", reaped=reaped)
            return exit_code if exit_code is not None else 128 + (-child.returncode if child.returncode else 0)
        if STOPPING:
            if stop_started is None:
                stop_started = time.monotonic()
            force = (time.monotonic() - stop_started) * 1000 >= config["termGraceMs"]
            # Repeat while reaping: newly adopted/forked children remain ours even after setsid().
            signal_descendants(supervisor, signal.SIGKILL if force else signal.SIGTERM)
        time.sleep(0.01)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception:
        # No exception text, argv, environment, paths, or source output goes to either public stream.
        try:
            report("supervisorError", code="SUPERVISOR_INTERNAL_FAILURE")
        except Exception:
            pass
        raise SystemExit(125)
