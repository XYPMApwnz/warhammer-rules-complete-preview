# Unified V2 fixes

| Task | Status | Priority | Assignee | Commit | Independent review |
|---|---|---|---|---|---|
| B1 — Core term bindings | Published in release 1fd0b279 (tree a45f81d6) | P1 | Codex | c03cd157503ec2222966cc6304d9e046bfb5e0ad | PASS |
| B2 — Glossary search | Published in release 1fd0b279 (tree a45f81d6) | P1 | Codex | 8052202e399a1e529f1f56af7a49fc23da7949c2 | Independent Claude review PASS on 8052202e |
| B3 — Core navigation | Published in release 1fd0b279 (tree a45f81d6) | P1 | Codex | 8052202e399a1e529f1f56af7a49fc23da7949c2 | Independent Claude review PASS on 8052202e |
| Popup action link spacing | Cosmetic backlog; adjacent links on mobile | P3 | Unassigned | — | Observed; functional QA passes |
| SM / Deathwatch freshness QA ownership | Open historical QA failure: `source-completeness-check.mjs --fresh` rejects `detachment-dw-c015c08e99c14972`; not PASS | P2 | Unassigned | Reproduced at 0cbf20e5 and c7d8652c; no fix | Same environment: identical ERR_ASSERTION and stack after worktree path normalization |
| General points producer canonical join | Open pre-existing failure: `detachment-sm-624df9cefb95455f`; moved producer preserves FAIL, native pricing checked separately | P2 | Unassigned | Reproduced before/after relocation at f072b72e | No numeric/identity correction in V1 retirement |
| DA QA stale inventory counts | Open historical assertions: app QA expects 8 books, import QA expects 18 Detachments; baseline and current are 9 / 19 | P2 | Unassigned | Reproduced at f072b72e before changes | EXPECTED unchanged; actual native membership checked independently |
| Source enrollment DG input coverage | Open historical FAIL: manifest omits declared wargear-option-contracts source; identical at base f072b72e | P2 | Unassigned | Baseline reproduced during V1 retirement | No source acceptance or assertion change |
| Python generator line endings on Windows | Open: `Path.write_text` without `newline='\n'` writes CRLF, e.g. `books/chaos-space-marines/v2/build.py:438`; `--check` normalizes line endings and misses the byte difference | P3 | Unassigned | — | Documented; no fix |
| Fresh source check lxml reproducibility | Open: `source-completeness-check.mjs --fresh` depends on lxml version; CSM `v2/build.py` hashes lxml HTML serialization. lxml 6.1.3 reports `Weapon source occurrence changed` already at a45f81d6; this CSM check passes with Codex bundled Python | P3 | Unassigned | — | Environment risk; no fix; overall `--fresh` still has the separate Deathwatch failure |
| Remaining V1 tools and tests | Separate cleanup task: trace consumers before splitting `books/shared/tools/build-army-book.mjs`; review `books/shared/tools/build-mobile-stubs.mjs`, `tests/browser/offline-progress.mjs` and `tests/browser/weapon-keyword-navigation.mjs` for removal | P3 | Unassigned | — | No removal or consumer audit in this task |
