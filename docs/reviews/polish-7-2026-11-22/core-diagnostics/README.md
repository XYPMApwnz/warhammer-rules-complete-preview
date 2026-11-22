# Core browser failure diagnostics

The existing browser test observes console, page errors, navigation and network lifecycle without changing requests, wait predicates, assertions, action order or timeouts. On failure its catch writes `failure-diagnostics/FAILURE.json` and one HTML file per live frame beneath the test's existing evidence directory, prints the absolute report path, then rethrows the original error. Existing browser/server cleanup follows.

Pending requests and the journal are copied at failure entry, before potentially asynchronous DOM capture. The JSON includes the original stack, page/frame URLs, document readiness, visible dialogs, Core host visibility, application/module presence and capture errors. No request/response bodies, cookies, localStorage, request headers or roster exports are collected.

DOM/state capture is bounded to two seconds per operation solely after failure; the original 15-second assertion timeout is untouched. If capture itself fails, the original test failure still propagates and the intended diagnostics path is printed. No retry is added.

Static Acorn audit: 46 original assertions, 15 waits and the one default-timeout setter are exact ordered-source matches. The assertCorePopup function is unchanged. See ASSERTION_PRESERVATION.json and CORE_TEST_CHANGES.patch.

The new lightweight helper QA creates a synthetic failed popup, console/page errors and pending/completed requests and checks the resulting DOM/JSON artifacts and original stack. It also tests partial capture failure. The primary agent executed it: 13 controls PASS. The disposable external Core failure control also saved real browser artifacts and propagated the exact injected error; see NEGATIVE_CONTROL.json. The full unchanged-scenario Core test is part of the single final pre-FF.

Suggested targeted commands: `node tests/browser-failure-diagnostics-qa.mjs` and `node v2/core-reader-browser-qa.mjs`. Set QA_EVIDENCE_DIR outside the repository and the configured Chromium executable as normal.
