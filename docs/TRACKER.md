# Unified V2 fixes

| Task | Status | Priority | Assignee | Commit | Independent review |
|---|---|---|---|---|---|
| B1 — Core term bindings | Integrated in Recovery and GitHub source; not on Pages | P1 | Codex | c03cd157503ec2222966cc6304d9e046bfb5e0ad | PASS |
| B2 — Glossary search | Integrated in Recovery; Pages not updated | P1 | Codex | 8052202e399a1e529f1f56af7a49fc23da7949c2 | Independent Claude review PASS on 8052202e |
| B3 — Core navigation | Integrated in Recovery; Pages not updated | P1 | Codex | 8052202e399a1e529f1f56af7a49fc23da7949c2 | Independent Claude review PASS on 8052202e |
| B4–B8 | Backlog | Untriaged | Unassigned | — | Not reviewed |
| Popup action link spacing | Cosmetic backlog; adjacent links on mobile | P3 | Unassigned | — | Observed; functional QA passes |
| SM / Deathwatch freshness QA ownership | Open historical QA failure: `source-completeness-check.mjs --fresh` rejects `detachment-dw-c015c08e99c14972`; not PASS | P2 | Unassigned | Reproduced at 0cbf20e5 and c7d8652c; no fix | Same environment: identical ERR_ASSERTION and stack after worktree path normalization |
| General points producer canonical join | Open pre-existing failure: `detachment-sm-624df9cefb95455f`; moved producer preserves FAIL, native pricing checked separately | P2 | Unassigned | Reproduced before/after relocation at f072b72e | No numeric/identity correction in V1 retirement |
| DA QA stale inventory counts | Open historical assertions: app QA expects 8 books, import QA expects 18 Detachments; baseline and current are 9 / 19 | P2 | Unassigned | Reproduced at f072b72e before changes | EXPECTED unchanged; actual native membership checked independently |
| Source enrollment DG input coverage | Open historical FAIL: manifest omits declared wargear-option-contracts source; identical at base f072b72e | P2 | Unassigned | Baseline reproduced during V1 retirement | No source acceptance or assertion change |
