# Test hygiene, part 1

Baseline: 8e9a95289168048086639ba8099f2e686023de9b. Windows execution evidence is stored outside the repository at E:/Warhammer/qa-evidence/test-hygiene-1.

A 180-second per-file exploratory cap records TIMEOUT as incomplete coverage. Timeouts, assertion failures, external prerequisites and never-tracked missing inputs are retained. The initial incorrect Windows Path batch is archived and excluded from final counts.

## Removed standalone tests

| Test | Observed missing repository path | Git deletion commit |
| --- | --- | --- |
| books/adeptus-mechanicus/tests/adeptus-mechanicus-waha-player-visible-reference-census-qa.mjs | books/adeptus-mechanicus/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/adeptus-mechanicus/tests/enhancement-unit-scope-roster-effects-qa.mjs | books/adeptus-mechanicus/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/adeptus-mechanicus/tests/roster-canonical-consumption-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/adeptus-mechanicus/tests/selected-wargear-roster-effects-qa.mjs | books/adeptus-mechanicus/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/blood-angels/tests/compatible-rules-qa.mjs | books/blood-angels/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/blood-angels/tests/enhancement-effects-qa.mjs | books/blood-angels/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/blood-angels/tests/enhancement-presentation-qa.mjs | books/blood-angels/scripts/data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/blood-angels/tests/overlay-conformance-qa.mjs | books/space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/blood-angels/tests/qa.mjs | books/blood-angels/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/abaddon-supreme-commander-roster-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/advance-charge-roster-effects-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/chaos-space-marines-waha-player-visible-reference-census-qa.mjs | books/chaos-space-marines/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/compatible-rules-qa.mjs | books/chaos-space-marines/scripts/app.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/crown-of-worms-roster-effect-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/cult-of-the-dark-gods-roster-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/daemonic-allegiance-roster-choice-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/devoted-to-destruction-roster-effect-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/effect-provenance-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/experimental-augmentations-roster-choice-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/greyveil-hex-roster-effect-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/marks-of-chaos-roster-legality-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/masters-of-misdirection-roster-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/mutated-bodyguard-roster-effect-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/roster-composition-profile-stats-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/roster-conformance-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/roster-wargear-options-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/source-availability-qa.mjs | books/chaos-space-marines/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/transport-roster-rules-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/wargear-options-qa.mjs | books/chaos-space-marines/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/chaos-space-marines/tests/warp-talons-enhancement-qualifiers-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/core-rules/tests/qa.mjs | books/core-rules/index.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/dark-angels/tests/enhancement-presentation-qa.mjs | books/dark-angels/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/dark-angels/tests/overlay-attachment-real-front-qa.mjs | books/dark-angels/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/dark-angels/tests/overlay-conformance-qa.mjs | books/dark-angels/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/death-guard/tests/contagion-range-roster-effects-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/death-guard/tests/death-guard-waha-player-visible-reference-census-qa.mjs | books/death-guard/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/death-guard/tests/plagueveil-roster-effect-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/death-guard/tests/roster-composition-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/death-guard/tests/roster-wargear-options-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/death-guard/v2/navigation-v1-qa.mjs | books/shared/controllers/navigation-controller.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/compatible-rules-qa.mjs | books/emperors-children/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/effect-provenance-qa.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/emperors-children-waha-player-visible-reference-census-qa.mjs | books/emperors-children/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/enhancement-runtime-qa.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/remaining-roster-effects-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/roster-composition-profile-stats-qa.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/roster-legality-rules-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/roster-wargear-options-qa.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/transport-roster-rules-qa.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/emperors-children/tests/unit-wide-roster-effects-qa.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/space-marines/tests/base-conformance-qa.mjs | books/space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/space-marines/tests/qa.mjs | books/space-marines/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tau-empire/tests/enhancement-runtime-qa.mjs | books/tau-empire/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tau-empire/tests/roster-composition-profile-stats-qa.mjs | books/tau-empire/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tau-empire/tests/roster-wargear-options-qa.mjs | books/tau-empire/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tau-empire/tests/selected-wargear-roster-effects-qa.mjs | books/tau-empire/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tau-empire/tests/tau-empire-waha-player-visible-reference-census-qa.mjs | books/tau-empire/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tau-empire/tests/transport-bay-roster-effect-qa.mjs | books/tau-empire/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tyranids/tests/compatible-rules-qa.mjs | books/tyranids/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tyranids/tests/enhancement-runtime-qa.mjs | books/tyranids/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tyranids/tests/qa.mjs | books/tyranids/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tyranids/tests/roster-composition-profile-stats-qa.mjs | books/tyranids/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tyranids/tests/roster-effects-qa.mjs | books/tyranids/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tyranids/tests/roster-wargear-options-qa.mjs | books/tyranids/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tyranids/tests/surprise-assault-roster-choice-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| books/tyranids/tests/tyranids-waha-player-visible-reference-census-qa.mjs | books/tyranids/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/am-synergy-semantic-qa.mjs | books/adeptus-mechanicus/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/army-book-eligibility-qa.mjs | books/space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/army-book-source-qa.mjs | books/chaos-space-marines/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/attached-unit-wide-effect-scope-qa.mjs | books/adeptus-mechanicus/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/attachment-group-constraints-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/am-final-conformance.mjs | books/adeptus-mechanicus/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/attached-canonical-ability-references.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/attached-unit-wide-effects.mjs | books/adeptus-mechanicus/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/csm-final-conformance.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/dg-final-conformance.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/dg-tainted-narthecium.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/ec-final-conformance.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/imported-paid-wargear-quantities.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/imported-warlord-context.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/roster-attachment-workflow.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/roster-effective-stats-and-composition.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/roster-game-datasheet.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/roster-physical-navigation.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/selection-gated-ability-projection.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/shared-army-book-phone-datasheet-sections.mjs | books/shared/army-related-rules.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/sm-base-final-conformance.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/tau-final-conformance.mjs | books/tau-empire/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/tau-leading-state.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/tyranids-final-conformance.mjs | books/tyranids/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/browser/w2-11-personal-presentation.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/canonical-child-identity-qa.mjs | books/tyranids/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/canonical-enhancement-reference-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/characteristic-effect-runtime-target-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/compatible-rules-attachment-qa.mjs | books/death-guard/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/dark-angels-lion-update-qa.mjs | books/dark-angels/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/death-guard-canonical-metadata-qa.mjs | books/death-guard/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/death-guard-unit-art-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/ec-pledge-dark-glory-condition-qa.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/enhancement-owner-qa.mjs | books/death-guard/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/factual-completion-qa.mjs | books/dark-angels/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/invulnerable-source-qa.mjs | books/death-guard/scripts/target-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/pedro-kantor-identity-qa.mjs | books/space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/physical-unit-game-effects-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/physical-unit-game-projection-qa.mjs | books/death-guard/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/presentation-contract-qa.mjs | books/death-guard/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/qa-h1-portability-qa.mjs | books/shared/controllers/navigation-controller.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/r1-relation-qa.mjs | books/emperors-children/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/r3b-support-relations-qa.mjs | books/space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/roster-attachment-roles-qa.mjs | books/space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/roster-effective-total-reconciliation-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/roster-projection-handoff-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/rule-facts-qa.mjs | books/death-guard/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/shared-army-book-presentation-structure-qa.mjs | books/death-guard/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/shared-army-book-runtime-qa.mjs | books/shared/army-book-app.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/shared-roster-context-qa.mjs | books/death-guard/reader.html | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/sm-family-normalization-qa.mjs | books/space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/space-marines-feedback-edge-qa.mjs | books/dark-angels/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/structured-roster-effects-qa.mjs | books/shared/book-roster-enhancements.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/structured-rule-publication-qa.mjs | books/chaos-space-marines/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/tau-auxiliary-provenance-qa.mjs | books/tau-empire/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/tau-leading-state-qa.mjs | roster-guides/points-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |
| tests/tau-synergy-semantic-qa.mjs | books/tau-empire/scripts/roster-data.js | ec08bbb654d36c57dd885d322fc1c1feddbe1863 |

## Package aliases

| Alias | Previous command | Remaining command |
| --- | --- | --- |
| tau:enhancements:qa | node books/tau-empire/tests/enhancement-runtime-qa.mjs | Removed empty alias |
| tau:conformance:qa | node tests/browser/tau-final-conformance.mjs | Removed empty alias |
| ec:enhancements:qa | node books/emperors-children/tests/enhancement-runtime-qa.mjs && node tests/ec-pledge-dark-glory-condition-qa.mjs | Removed empty alias |
| ec:conformance:qa | node tests/browser/ec-final-conformance.mjs | Removed empty alias |
| tyranids:enhancements:qa | node books/tyranids/tests/enhancement-runtime-qa.mjs | Removed empty alias |
| tyranids:conformance:qa | node tests/browser/tyranids-final-conformance.mjs | Removed empty alias |
| csm:enhancements:qa | node books/chaos-space-marines/tests/roster-conformance-qa.mjs | Removed empty alias |
| csm:conformance:qa | node books/chaos-space-marines/tests/roster-composition-profile-stats-qa.mjs && node books/chaos-space-marines/tests/roster-conformance-qa.mjs && node tests/browser/csm-final-conformance.mjs | Removed empty alias |
| csm:wargear:qa | node books/chaos-space-marines/tests/wargear-options-qa.mjs && node books/chaos-space-marines/tests/roster-wargear-options-qa.mjs | Removed empty alias |
| qa:core | node books/core-rules/tests/term-bindings-qa.mjs && node books/core-rules/tests/reader-presentation-qa.mjs && node books/core-rules/tests/fact-provenance-qa.mjs && node books/core-rules/tests/source-node-ingestion-qa.mjs && node books/shared/canonical-content-v2/tests/effective-content-qa.mjs && node books/core-rules/tests/core-waha-source-corpus-qa.mjs && node books/core-rules/tests/core-waha-player-visible-reference-census-qa.mjs && node books/core-rules/tests/core-waha-certification-qa.mjs && node books/core-rules/tests/effective-catalog-qa.mjs && node books/core-rules/tests/factual-ownership-qa.mjs && node glossary/v2/tests/core-projection-qa.mjs && node books/core-rules/tests/reader-propagation-qa.mjs && node books/core-rules/tests/currentness-qa.mjs && node books/core-rules/tests/qa.mjs && node tests/core-reader-popup-glossary-qa.mjs && node books/core-rules/tests/factual-ownership-browser-qa.mjs && node books/core-rules/tests/reader-presentation-browser-qa.mjs | node books/core-rules/tests/term-bindings-qa.mjs && node books/core-rules/tests/reader-presentation-qa.mjs && node books/core-rules/tests/fact-provenance-qa.mjs && node books/core-rules/tests/source-node-ingestion-qa.mjs && node books/shared/canonical-content-v2/tests/effective-content-qa.mjs && node books/core-rules/tests/core-waha-source-corpus-qa.mjs && node books/core-rules/tests/core-waha-player-visible-reference-census-qa.mjs && node books/core-rules/tests/core-waha-certification-qa.mjs && node books/core-rules/tests/effective-catalog-qa.mjs && node books/core-rules/tests/factual-ownership-qa.mjs && node glossary/v2/tests/core-projection-qa.mjs && node books/core-rules/tests/reader-propagation-qa.mjs && node books/core-rules/tests/currentness-qa.mjs && node tests/core-reader-popup-glossary-qa.mjs && node books/core-rules/tests/factual-ownership-browser-qa.mjs && node books/core-rules/tests/reader-presentation-browser-qa.mjs |
| qa:tau:leading | node tests/tau-leading-state-qa.mjs && node tests/browser/tau-leading-state.mjs | Removed empty alias |
| qa:invulnerable | node tests/invulnerable-source-qa.mjs && node tests/browser/source-invulnerable-presentation.mjs | node tests/browser/source-invulnerable-presentation.mjs |

Removed test files: 123. Removed helpers/fixtures: 0. Removed package references: 17.

## Retained cases

The architecture conformance gate remains because its Windows run aggregates external-input, assertion and canonical-join failures in addition to missing child paths. Its two npm aliases remain. Exported QA helpers remain. All protected queue script values remain exact.

The final pre-FF run and five named diagnoses are recorded in the task report and external evidence. The specifically authorized repairs are documented below.

### Deleted-input tests retained for live callers

| Test | Retained callers |
| --- | --- |
| tests/canonical-join-architecture-qa.mjs | tests/helpers/architecture-behavioral-oracles.mjs |
| tests/effect-contract-ownership-qa.mjs | tests/helpers/architecture-behavioral-oracles.mjs |
| tests/effect-provider-interpreter-equality-qa.mjs | tests/helpers/architecture-behavioral-oracles.mjs |
| tests/persistent-child-identity-qa.mjs | tests/helpers/architecture-behavioral-oracles.mjs |
| tests/roster-base-stat-ownership-qa.mjs | tests/helpers/architecture-behavioral-oracles.mjs |
| tests/roster-fixtures-qa.mjs | tests/helpers/architecture-behavioral-oracles.mjs |
| tests/roster-gameplay-projection-ownership-qa.mjs | tests/helpers/architecture-behavioral-oracles.mjs |
| tests/stratagem-architecture-qa.mjs | tests/helpers/architecture-behavioral-oracles.mjs |

## Final outside-queue inventory

Executed entrypoints: 534; standalone tests: 532; exported assertion helpers: 2. Removed standalone tests: 123. Retained standalone tests: 409.

| Retained state | Tests |
| --- | --- |
| ASSERT | 111 |
| OTHER | 149 |
| PASS | 144 |
| TIMEOUT | 5 |

The primary baseline audit is immutable. This retained-state table additionally records the two specifically authorized standalone test repairs and their separate PASS logs. Retained deleted-input tests have live callers in the architecture oracle graph and are included under OTHER; their exact primary classification remains in the evidence. TIMEOUT remains incomplete coverage under the 180-second exploratory cap. A file stopped by an assertion has an unexecuted tail; the file is not reported as fully checked. No unrelated assertions or environment failures were repaired.

## Named stale checks

| Check | Diagnosis | Change and preserved protection |
| --- | --- | --- |
| SM static-gameplay | The sourceRefs migration changed serialization, while this test still used JSON.parse. The accepted factual view is unchanged. | Use the existing parseProducerJSON inverse reader. The original fingerprint remains 024841EF613FFFEFC101875CEA900EA6D02EF9F4B79765D96B483C35E606866F. The restored complete document and all 1714 entities equal the accepted 75d322e4 document. The full test passes and a changed fact still fails its original guard. |
| Shell browser | New-page creation and DOM readiness precede the asynchronous offline bootstrap. Waiting only for the URL proved insufficient. The intermittent timeout was not reproduced by two original baseline runs in this audit. | Focus the actual native tab, wait for its exact source-bound URL and offline bootstrap, then keep every existing application, roster and reference assertion. Final targeted runs pass twice. Application code is unchanged. Historical and intermediate failures remain in the evidence. |
| BA datasheet --check | The native adapter is consumed in memory. The standalone native-datasheets.json and datasheet-presentation.json pair is not tracked or published. | Keep in-memory adapter invariants, then check the actual mixed-owner publication through its existing producer. No missing artifact is generated. Corrupting a published mixed-owner artifact still fails the check. |
| Points consumer convergence | The test addressed retired V1 consumers, old identities and the wrong owner of inherited prices. | Read native V2 consumers and accepted v1.6 captures through reviewed canonical bindings. Check all BA/DA own and inherited schedules, Tau/Tyranids paid-option names and values, physical owners and source locators. Repulsor Executioner is SM-owned 260/280 plus the accepted paid weapon, and Stormlance is SM-owned 1DP with the BA secondary-source conflict retained. A native price mutation fails. |
| Authenticated BSData argument binding | External input prerequisite, not a never-tracked project artifact. | No change. The configured repository is https://github.com/BSData/wh40k-11e at fa30730fca11fbfe87be90684d481d50e0efaf66, under tmp/bsdata-wh40k-11e. No provisioning helper exists. The checkout and authenticated files must be pristine and tracked. The test is valuable for authenticated extraction; making source:check portable would require a separately reviewed split or explicit prerequisite. |

The BSData test remains in source:check. The protected pre-FF queue runs the three source gates separately and does not execute that external-input leaf. Its argument-parser and later negative controls are not reached when the checkout is missing.

## Data and runtime parity

All 109 tracked generated/cache files are byte-identical to the baseline. Both independently built packages contain 438 byte-identical files, including the package manifest. Content SHA-256: 1605c22b7f5a7a32551d28cefdcca72fd92e41339f0cf227e24f41b32f27d9db.

## Validation boundaries

The original and final pre-FF and all-book quick plans must be byte-identical. All protected package script strings remain unchanged. The complete final pre-FF result is stored separately in the evidence directory; it does not turn retained failures outside the queue into PASS.

All test-created temporary data uses E:/Warhammer/qa-tmp. No source, main, release, staging or Pages update is authorized by this change.
