# Browser evidence — roster gained rules

Accepted source baseline: 9a48765744f32f467f6e53c1f85e94921cbdd54b.

Before: `before-final-9b99-20261117`. After: `after-final-9b99-20261117`. Both use the same committed input bytes and explicit derived attachment/copy setup recorded in RESULTS.json.

| Requirement | Baseline PASS | Baseline expected FAIL | Feature PASS | Feature FAIL |
|---|---:|---:|---:|---:|
| a-self-caption-absent | 8 | 54 | 62 | 0 |
| b-one-source-caption | 58 | 4 | 62 | 0 |
| c-gained-final-ordered-groups | 18 | 44 | 62 | 0 |
| d-one-instance-price | 0 | 62 | 62 | 0 |
| e-visible-technical-text | 62 | 0 | 62 | 0 |
| canonical-ability-references | 62 | 0 | 62 | 0 |
| existing-unit-metrics-at-top | 60 | 2 | 62 | 0 |
| critical-hits-chip | 0 | 2 | 2 | 0 |
| gained-vector-chips-and-tooltip | 0 | 2 | 2 | 0 |
| existing-computed-fnp-at-top | 0 | 2 | 2 | 0 |
| native-librarian-source-navigation | 2 | 0 | 2 | 0 |
| lord-of-host-core-navigation | 2 | 0 | 2 | 0 |
| d-copy-tier-order-and-sum | 0 | 2 | 2 | 0 |

The technical-text guard already passes on the accepted baseline; it is not claimed as a new baseline failure. Deliberately injecting the visible caption `From datasheet-synthetic-internal-id-00001` failed the test with process exit 1: 1 failure, all exactly in that guard. The `From` wording isolates the internal-ID guard from the separate visible Source/Applies prefix guard. See `mutation-final-9b99-visible-id-20261117/RESULTS.json`.

Gallery: GALLERY.html; 64 baseline and 64 feature screenshots, at 390 and 1440 px. Camera-only styling hides external fixed application chrome/skip link and makes the in-card local navigation static; it does not hide any in-card content. Identical styling is applied on both sides.

Full available runtime state/projection/effective/points: 30 exact SHA-256 matches across nine books and all cases. AM and CSM services do not expose a points property on either tree; no aggregate API is invented. Every available points result and the full remaining runtime tuple are compared. Viewing cards also leaves each tuple unchanged within its run.

Full Army Book Plague Marines: 2 exact snapshots equal (all three 5/7/10-model price tiers preserved at both widths).

The exact Gained rules local-tab target is checked at both widths. At 390 px the player-visible tab is clicked and its heading must enter the viewport. At 1440 px the pre-existing native policy hides the in-card local navigation; the test asserts that unchanged policy rather than forcing a hidden click. No desktop navigation was redesigned.

## Canonical-navigation regressions

The added native SM Librarian case retains its original Veil of Time / Force Dome aggregate links and opens both exact canonical popups. The existing EC Lord of the Host fixture retains its two original Core targets on the same physical card, checks unchanged MODEL source/recipient metadata and Scouts distance 6, and opens the Scouts popup. These canonical-navigation checks pass on the clean 9a487657 baseline: they are regression-preservation checks, not invented baseline failures. The new rendered-prefix absence guard independently rejects the old visible attribution text.

## Exact price coverage

All inspected original cards assert one exact base MFM cost and, where selected, the exact enhancement surcharge. CSM Dark Apostle is 70 + 10 Warped Foresight. Additional explicitly derived three-copy cases assert CSM Accursed Cultists 90 / 90 / 110 (sum 290) and DG five-model Blightlord Terminators 185 / 185 / 215 (sum 585), in physical roster order. No game data or input fixture file is modified.

Those are the observed v1.6 results, not frozen numeric test expectations. The test follows the current MFM pointer, reads its independent raw captures, resolves explicit fixture identities to exactly one source unit/enhancement, and selects typed model/copy bounds. Space Marines facts inherited by BA/DA retain the explicit SM raw owner. No app-presentation price field is used by the oracle.

The unchanged existing Death Blow input still declares 170 exported points; current accepted v1.6 MFM prices its five Terminators at 190. The new display expectation uses 190. Existing fixture text and existing test expectations are untouched. Its charge-roll modifier +1 is checked against the existing typed runtime, including exact source proofs, scope, recipients and visual position above stat profiles.

Feature browser run duration: 74.8 seconds.
