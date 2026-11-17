# Diagnostic pre-FF timings

Commit `5b28b1d2be8fc6f146a664bfa009f61215b4167a`; 173 sequential jobs; 109.18 minutes; 171 PASS / 2 FAIL. No acceptance PASS claimed.

| # | Job | Result | Seconds |
|---|---|---|---:|
| 1 | git diff --check --check | PASS | 0.04 |
| 2 | tests/qa-temp-qa.mjs  | PASS | 4.10 |
| 3 | tests/book-passport-qa.mjs  | PASS | 0.83 |
| 4 | tests/keyword-access-qa.mjs  | PASS | 1.79 |
| 5 | v2/executable-detachment-source-qa.mjs  | PASS | 2.48 |
| 6 | books/shared/army-book-app-v2/plain-header-explanation-qa.mjs  | PASS | 0.17 |
| 7 | v2/sweep-polish-qa.mjs  | PASS | 0.05 |
| 8 | tests/official-updates-qa.mjs  | PASS | 0.06 |
| 9 | tests/official-update-books-qa.mjs  | PASS | 0.12 |
| 10 | tests/official-update-report-qa.mjs  | PASS | 0.05 |
| 11 | tests/official-update-integration-qa.mjs  | PASS | 23.08 |
| 12 | tests/official-effect-review-qa.mjs  | PASS | 0.11 |
| 13 | tests/current-gw-contract-qa.mjs  | PASS | 0.05 |
| 14 | books/core-rules/tests/core-importer-candidate-qa.mjs  | PASS | 16.91 |
| 15 | books/core-rules/tests/core-importer-isolation-qa.mjs  | PASS | 54.96 |
| 16 | books/adeptus-mechanicus/v2/app-qa.mjs  | PASS | 22.91 |
| 17 | books/adeptus-mechanicus/v2/roster-import-qa.mjs  | PASS | 3.27 |
| 18 | v2/new-recruit-export-qa.mjs --book=adeptus-mechanicus | PASS | 0.47 |
| 19 | v2/new-recruit-plain-header-qa.mjs --book=adeptus-mechanicus | PASS | 9.01 |
| 20 | v2/new-recruit-model-names-qa.mjs --book=adeptus-mechanicus | PASS | 0.38 |
| 21 | v2/related-panel-qa.mjs --book=adeptus-mechanicus --phase=all | PASS | 5.17 |
| 22 | books/blood-angels/v2/app-qa.mjs  | PASS | 46.16 |
| 23 | books/blood-angels/v2/roster-qa.mjs  | PASS | 187.24 |
| 24 | v2/new-recruit-export-qa.mjs --book=blood-angels | PASS | 24.34 |
| 25 | v2/new-recruit-plain-header-qa.mjs --book=blood-angels | PASS | 12.61 |
| 26 | v2/new-recruit-model-names-qa.mjs --book=blood-angels | PASS | 4.09 |
| 27 | v2/related-panel-qa.mjs --book=blood-angels --phase=all | PASS | 34.86 |
| 28 | v2/detachment-card-text-qa.mjs --book=blood-angels | PASS | 0.30 |
| 29 | books/chaos-space-marines/v2/app-qa.mjs  | PASS | 1.07 |
| 30 | books/chaos-space-marines/v2/roster-import-qa.mjs  | PASS | 16.33 |
| 31 | v2/new-recruit-export-qa.mjs --book=chaos-space-marines | PASS | 1.52 |
| 32 | v2/new-recruit-plain-header-qa.mjs --book=chaos-space-marines | PASS | 10.59 |
| 33 | v2/new-recruit-model-names-qa.mjs --book=chaos-space-marines | PASS | 3.00 |
| 34 | v2/related-panel-qa.mjs --book=chaos-space-marines --phase=all | PASS | 12.43 |
| 35 | books/dark-angels/v2/app-qa.mjs  | PASS | 50.22 |
| 36 | books/dark-angels/v2/roster-import-qa.mjs  | PASS | 333.47 |
| 37 | v2/new-recruit-export-qa.mjs --book=dark-angels | PASS | 177.56 |
| 38 | v2/new-recruit-plain-header-qa.mjs --book=dark-angels | PASS | 31.55 |
| 39 | v2/new-recruit-model-names-qa.mjs --book=dark-angels | PASS | 16.42 |
| 40 | v2/related-panel-qa.mjs --book=dark-angels --phase=all | PASS | 34.40 |
| 41 | v2/detachment-card-text-qa.mjs --book=dark-angels | PASS | 0.35 |
| 42 | books/death-guard/v2/app-qa.mjs  | PASS | 7.08 |
| 43 | books/death-guard/v2/roster-import-qa.mjs  | PASS | 0.15 |
| 44 | v2/new-recruit-export-qa.mjs --book=death-guard | PASS | 0.35 |
| 45 | v2/new-recruit-plain-header-qa.mjs --book=death-guard | PASS | 8.89 |
| 46 | v2/related-panel-qa.mjs --book=death-guard --phase=all | PASS | 4.48 |
| 47 | v2/detachment-card-text-qa.mjs --book=death-guard | PASS | 0.19 |
| 48 | books/emperors-children/v2/app-qa.mjs  | PASS | 4.69 |
| 49 | books/emperors-children/v2/roster-import-qa.mjs  | PASS | 12.14 |
| 50 | v2/new-recruit-export-qa.mjs --book=emperors-children | PASS | 1.59 |
| 51 | v2/new-recruit-plain-header-qa.mjs --book=emperors-children | PASS | 9.81 |
| 52 | v2/new-recruit-model-names-qa.mjs --book=emperors-children | PASS | 0.64 |
| 53 | v2/reviewed-text-coverage-qa.mjs --book=emperors-children | PASS | 11.21 |
| 54 | v2/related-panel-qa.mjs --book=emperors-children --phase=all | PASS | 18.29 |
| 55 | v2/detachment-card-text-qa.mjs --book=emperors-children | PASS | 0.23 |
| 56 | books/space-marines/v2/app-qa.mjs  | PASS | 79.65 |
| 57 | books/space-marines/v2/roster-import-qa.mjs  | PASS | 216.87 |
| 58 | books/space-marines/v2/roster-static-model-bindings-qa.mjs  | PASS | 14.57 |
| 59 | v2/new-recruit-export-qa.mjs --book=space-marines | PASS | 13.87 |
| 60 | v2/new-recruit-plain-header-qa.mjs --book=space-marines | PASS | 11.36 |
| 61 | v2/new-recruit-model-names-qa.mjs --book=space-marines | PASS | 4.29 |
| 62 | v2/related-panel-qa.mjs --book=space-marines --phase=all | PASS | 37.98 |
| 63 | v2/detachment-card-text-qa.mjs --book=space-marines | PASS | 0.34 |
| 64 | v2/wardens-source-binding-qa.mjs  | PASS | 1.57 |
| 65 | books/tau-empire/v2/app-qa.mjs  | PASS | 5.67 |
| 66 | books/tau-empire/v2/roster-import-qa.mjs  | PASS | 319.25 |
| 67 | books/tau-empire/v2/physical-choice-qa.mjs  | PASS | 14.93 |
| 68 | v2/new-recruit-export-qa.mjs --book=tau-empire | PASS | 1.61 |
| 69 | v2/new-recruit-plain-header-qa.mjs --book=tau-empire | PASS | 10.06 |
| 70 | v2/new-recruit-model-names-qa.mjs --book=tau-empire | PASS | 1.05 |
| 71 | v2/related-panel-qa.mjs --book=tau-empire --phase=all | PASS | 19.28 |
| 72 | v2/detachment-card-text-qa.mjs --book=tau-empire | PASS | 0.37 |
| 73 | books/tyranids/v2/app-qa.mjs  | PASS | 5.86 |
| 74 | books/tyranids/v2/roster-import-qa.mjs  | PASS | 7.10 |
| 75 | v2/new-recruit-export-qa.mjs --book=tyranids | PASS | 1.06 |
| 76 | v2/new-recruit-plain-header-qa.mjs --book=tyranids | PASS | 9.97 |
| 77 | v2/new-recruit-model-names-qa.mjs --book=tyranids | PASS | 0.68 |
| 78 | v2/reviewed-text-coverage-qa.mjs --book=tyranids | PASS | 11.41 |
| 79 | v2/related-panel-qa.mjs --book=tyranids --phase=all | PASS | 21.34 |
| 80 | v2/detachment-card-text-qa.mjs --book=tyranids | PASS | 0.30 |
| 81 | books/shared/rule-contract-v2/recipients-qa.mjs  | PASS | 3.10 |
| 82 | books/shared/roster-v2/physical-selection-effects-qa.mjs  | PASS | 0.21 |
| 83 | books/shared/roster-v2/condition-execution-qa.mjs  | PASS | 0.13 |
| 84 | books/shared/roster-v2/numeric-effects-qa.mjs  | PASS | 0.20 |
| 85 | books/shared/roster-v2/keyword-effects-qa.mjs  | PASS | 0.18 |
| 86 | books/shared/roster-v2/ability-effects-qa.mjs  | PASS | 0.16 |
| 87 | books/shared/roster-v2/weapon-contribution-effects-qa.mjs  | PASS | 0.15 |
| 88 | books/shared/roster-v2/advance-roll-effects-qa.mjs  | PASS | 0.13 |
| 89 | v2/source-effect-regression-qa.mjs  | PASS | 79.82 |
| 90 | v2/detachment-source-binding-qa.mjs  | PASS | 35.60 |
| 91 | books/shared/roster-v2/reimport-attachments-qa.mjs  | PASS | 10.11 |
| 92 | books/shared/roster-v2/service-qa.mjs  | PASS | 0.11 |
| 93 | books/shared/roster-v2/import-service-qa.mjs  | PASS | 0.11 |
| 94 | books/shared/roster-v2/import-selections-qa.mjs  | PASS | 0.13 |
| 95 | books/shared/roster-v2/attachment-service-qa.mjs  | PASS | 0.14 |
| 96 | books/shared/roster-v2/attachment-conditions-qa.mjs  | PASS | 0.10 |
| 97 | tests/roster-execution-atomic-qa.mjs  | PASS | 4.52 |
| 98 | v2/detachment-recipient-qa.mjs  | PASS | 1.50 |
| 99 | v2/card-recipient-qa.mjs  | PASS | 0.68 |
| 100 | v2/attached-rule-text-qa.mjs  | PASS | 14.18 |
| 101 | v2/card-display-2-qa.mjs  | PASS | 2.04 |
| 102 | books/shared/roster-v2/singleton-model-import-qa.mjs  | PASS | 0.09 |
| 103 | books/shared/roster-v2/plain-header-qa.mjs  | PASS | 0.08 |
| 104 | v2/epic-hero-enhancements-qa.mjs  | PASS | 7.26 |
| 105 | books/shared/roster-v2/initial-attachment-qa.mjs  | PASS | 0.11 |
| 106 | v2/faction-safe-import-qa.mjs  | PASS | 0.85 |
| 107 | books/shared/army-book-app-v2/card-text-formatting-qa.mjs  | PASS | 0.04 |
| 108 | books/shared/army-book-app-v2/library-currentness-qa.mjs  | PASS | 0.22 |
| 109 | books/shared/roster-v2/text-roster-facts-qa.mjs  | PASS | 0.07 |
| 110 | v2/source-completeness-check.mjs  | PASS | 1.60 |
| 111 | tests/integration-qa.mjs  | PASS | 4.32 |
| 112 | books/shared/army-book-app-v2/cosmetics-qa.mjs  | PASS | 0.47 |
| 113 | tests/codex-workflow-qa.mjs  | PASS | 0.10 |
| 114 | tests/source-book-clone-qa.mjs --root=E:\Warhammer\worktrees\card-gained-rules-v1 | PASS | 1.65 |
| 115 | books/shared/source-refs-v2/source-catalog-qa.mjs  | PASS | 1.06 |
| 116 | v2/unit-recipient-scope-qa.mjs  | PASS | 2.92 |
| 117 | tests/book-update-declarations-qa.mjs  | PASS | 0.16 |
| 118 | tests/book-update-report-qa.mjs  | PASS | 0.07 |
| 119 | tests/book-update-snapshots-qa.mjs  | PASS | 14.37 |
| 120 | tests/book-update-metadata-qa.mjs  | PASS | 0.05 |
| 121 | tests/book-update-command-qa.mjs  | PASS | 61.24 |
| 122 | tests/mfm-release-history-qa.mjs  | PASS | 0.27 |
| 123 | tests/mfm-update-qa.mjs  | PASS | 44.09 |
| 124 | tests/source-catalog-registry-qa.mjs  | PASS | 55.94 |
| 125 | tests/source-catalog-additions-qa.mjs  | PASS | 16.66 |
| 126 | books/core-rules/tests/factual-ownership-qa.mjs  | PASS | 0.55 |
| 127 | books/core-rules/tests/core-waha-certification-qa.mjs  | PASS | 0.19 |
| 128 | glossary/v2/tests/core-projection-qa.mjs  | PASS | 268.12 |
| 129 | books/core-rules/tests/term-bindings-qa.mjs  | PASS | 0.65 |
| 130 | books/core-rules/tests/reader-see-also-regression-qa.mjs  | PASS | 1.47 |
| 131 | books/core-rules/tests/core-faq-anchor-qa.mjs  | PASS | 1.88 |
| 132 | tests/generated-rebuild-qa.mjs  | PASS | 27.21 |
| 133 | tests/csm-model-alias-bootstrap-qa.mjs  | PASS | 3.69 |
| 134 | tests/source-review-execution-book-qa.mjs  | PASS | 3.68 |
| 135 | books/shared/tools/check-generated-rebuild.mjs  | PASS | 1079.08 |
| 136 | tools/pages-runtime-package.mjs --source E:\Warhammer\worktrees\card-gained-rules-v1 --out E:\Warhammer\qa-tmp\card-gained-rules\wh-qa-pre-ff-work-8ns4ou\work\runtime | PASS | 6.73 |
| 137 | v2/shell-browser-qa.mjs  | PASS | 56.05 |
| 138 | v2/core-reader-browser-qa.mjs  | PASS | 99.03 |
| 139 | tests/minimal-pwa-cache-qa.mjs  | PASS | 0.14 |
| 140 | v2/pwa-transition-qa.mjs  | PASS | 103.97 |
| 141 | tests/browser/pwa-update-flow.mjs  | PASS | 77.12 |
| 142 | tests/browser/pwa-bootstrap-update.mjs  | PASS | 161.23 |
| 143 | tests/startup-precache-qa.mjs  | PASS | 1.56 |
| 144 | tests/browser/cold-offline.mjs  | PASS | 144.88 |
| 145 | v2/detachment-recipient-browser-qa.mjs  | PASS | 166.07 |
| 146 | v2/detachment-synthetic-table-browser-qa.mjs  | PASS | 52.43 |
| 147 | v2/card-recipient-browser-qa.mjs  | PASS | 91.47 |
| 148 | v2/attached-rule-text-browser-qa.mjs  | PASS | 258.15 |
| 149 | v2/card-display-browser-qa.mjs  | PASS | 155.73 |
| 150 | v2/card-display-2-browser-qa.mjs  | FAIL | 66.98 |
| 151 | v2/source-equipment-browser-qa.mjs  | PASS | 105.24 |
| 152 | v2/new-recruit-export-browser-qa.mjs  | PASS | 24.24 |
| 153 | v2/new-recruit-plain-header-browser-qa.mjs  | PASS | 86.64 |
| 154 | v2/new-recruit-model-names-browser-qa.mjs  | PASS | 50.88 |
| 155 | v2/reviewed-text-coverage-browser-qa.mjs  | PASS | 20.72 |
| 156 | v2/related-panel-browser-qa.mjs  | PASS | 26.73 |
| 157 | v2/detachment-card-text-browser-qa.mjs  | PASS | 64.10 |
| 158 | v2/wardens-source-binding-browser-qa.mjs  | PASS | 11.09 |
| 159 | v2/cards-cosmetics-browser-qa.mjs  | PASS | 53.33 |
| 160 | v2/epic-hero-enhancements-browser-qa.mjs  | PASS | 24.11 |
| 161 | v2/fabius-safe-import-browser-qa.mjs  | FAIL | 8.48 |
| 162 | v2/card-texts-browser-qa.mjs  | PASS | 54.62 |
| 163 | v2/card-polish-2-browser-qa.mjs  | PASS | 61.79 |
| 164 | v2/sweep-polish-browser-qa.mjs  | PASS | 74.24 |
| 165 | v2/card-gained-rules-browser-qa.mjs  | PASS | 62.55 |
| 166 | v2/dg-am-recipient-enrollment-browser-qa.mjs --fixtures=v2/fixtures/sm-da-recipient-gaps-v1-browser.json | PASS | 255.29 |
| 167 | v2/dg-am-recipient-enrollment-browser-qa.mjs --fixtures=v2/fixtures/csm-tau-recipient-gaps-v1-browser.json | PASS | 279.97 |
| 168 | books/core-rules/tests/core-switch-browser-qa.mjs  | PASS | 4.15 |
| 169 | tools/pages-runtime-package-qa.mjs --source E:\Warhammer\worktrees\card-gained-rules-v1 --published E:\Warhammer\qa-tmp\card-gained-rules\wh-qa-pre-ff-work-8ns4ou\work\runtime --work E:\Warhammer\qa-tmp\card-gained-rules\wh-qa-pre-ff-work-8ns4ou\work\packaging | PASS | 26.87 |
| 170 | tests/source-enrollment-qa.mjs  | PASS | 12.59 |
| 171 | books/shared/tools/source-freshness.mjs  | PASS | 2.33 |
| 172 | tests/source-ingestion-contract-qa.mjs  | PASS | 9.38 |
| 173 | books/shared/army-book-app-v2/keyword-attribution-qa.mjs  | PASS | 1.35 |
