# Cancelled run: evidence boundary

Run 45125199666: 201 PASS, 3 FAIL, 9 without a persisted result. The queue step lasted 222 min 28 s; persisted job times end after 90 min 11.329 s.

No START/active-phase metadata was retained by that report format. Job 204 is the last persisted PASS; job 205 is the next planned job, not a proven started job. A child, inherited stream, post-job cleanup or wrapper phase cannot be distinguished retrospectively.

| Index | Job | GitHub | Safe class / cause | PC seconds | GitHub seconds |
|---:|---|---|---|---:|---:|
| 2 | `tests/qa-temp-qa.mjs`  | FAIL | AssertionError / ASSERTION_FAILED | 4.018 | 3.355 |
| 151 | `tests/book-update-command-qa.mjs`  | FAIL | AssertionError / ASSERTION_FAILED | 54.814 | 31.929 |
| 165 | `books/shared/tools/check-generated-rebuild.mjs`  | FAIL | Error / ERROR_MESSAGE_REDACTED | 671.034 | 8.795 |
| 205 | `v2/lazy-glossary-browser-qa.mjs`  | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 110.826 | not recorded |
| 206 | `v2/dg-am-recipient-enrollment-browser-qa.mjs` --fixtures=v2/fixtures/sm-da-recipient-gaps-v1-browser.json | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 154.349 | not recorded |
| 207 | `v2/dg-am-recipient-enrollment-browser-qa.mjs` --fixtures=v2/fixtures/csm-tau-recipient-gaps-v1-browser.json | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 184.033 | not recorded |
| 208 | `books/core-rules/tests/core-switch-browser-qa.mjs`  | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 4.020 | not recorded |
| 209 | `tools/pages-runtime-package-qa.mjs` --source <REPO> --published <QA_WORK>/runtime --work <QA_WORK>/packaging | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 33.477 | not recorded |
| 210 | `tests/source-enrollment-qa.mjs`  | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 10.634 | not recorded |
| 211 | `books/shared/tools/source-freshness.mjs`  | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 2.332 | not recorded |
| 212 | `tests/source-ingestion-contract-qa.mjs`  | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 8.477 | not recorded |
| 213 | `books/shared/army-book-app-v2/keyword-attribution-qa.mjs`  | NO_RESULT | NOT_RECORDED / NOT_RECORDED | 1.438 | not recorded |
