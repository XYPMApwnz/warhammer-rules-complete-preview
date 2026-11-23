# Ten longest full CI jobs

| Index | Job / arguments | Accepted PC b06 (s) | GitHub43 (s) | Result |
|---:|---|---:|---:|---|
|165|`books/shared/tools/check-generated-rebuild.mjs` |683.609|977.299|PASS|
|179|`v2/attached-rule-text-browser-qa.mjs` |193.598|364.781|PASS|
|207|`v2/dg-am-recipient-enrollment-browser-qa.mjs` --fixtures=v2/fixtures/csm-tau-recipient-gaps-v1-browser.json|185.764|357.280|PASS|
|200|`v2/roster-navigation-browser-qa.mjs` |200.751|329.284|PASS|
|206|`v2/dg-am-recipient-enrollment-browser-qa.mjs` --fixtures=v2/fixtures/sm-da-recipient-gaps-v1-browser.json|155.169|306.255|PASS|
|96|`books/tau-empire/v2/roster-import-qa.mjs` |252.375|301.873|PASS|
|66|`books/dark-angels/v2/roster-import-qa.mjs` |235.129|299.449|PASS|
|198|`v2/rule-popups-browser-qa.mjs` |107.624|272.928|PASS|
|205|`v2/lazy-glossary-browser-qa.mjs` |111.414|248.825|PASS|
|87|`books/space-marines/v2/roster-import-qa.mjs` |174.646|222.937|PASS|

PC is the accepted b06 reference, not another local full run in this task. Job205 adds four new assertions; no old assertion is removed.
