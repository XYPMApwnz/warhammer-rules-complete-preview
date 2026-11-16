# PowerShell 7+. Prepared cleanup plan only: the author has NOT executed it.
# The final report/manifest and all private archive content must already exist.
# This script deliberately performs the entire preflight before its first mutation.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Apply = $true

$ManifestPath = 'E:/Warhammer/archive-reports/cleanup-2-manifest.json'
$ManifestSha256 = 'da9dc1edd38835b958a45203168d294565ae1302b943052db49fce1b86cc7674'
$EmbeddedOperationsJson = @'
[
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/wh-book-update-WVLHxS/work/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/capture-repo",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/mfm-update-v1/warhammer-source-contract-B22n5D/work/tracked-inputs",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/mfm-update-v1/wh-mfm-update-LuGjf2/work/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/official-updates-v1/trials-approved-5bc26d82/tyranids/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/official-updates-v1/trials-final/death-guard/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/official-updates-v1/trials-final/tyranids/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028/baseline-checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028/baseline-checkout/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/test-speedup-20261030/baseline/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-final/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v2/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-ledger-v3/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-bd4W8f/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-jooswU/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-sugJ53/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-ufMFO6/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-wnwCOx/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/book-update-command-v1/trial-mfm-yRGrgn/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/official-updates-v1/tyranids-trial-guard-diagnostic/checkout",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/test-hygiene-min-v1/tmp/bsdata-wh40k-11e",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028/baseline-checkout",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028/baseline-checkout",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/qa-evidence/test-speedup-20261030/baseline",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/qa-tmp/test-hygiene-min-v1/bsdata-wh40k-11e-fa30730fca11fbfe87be90684d481d50e0efaf66",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-72620b",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e"
  },
  {
    "path": "E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-b6d179",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e"
  },
  {
    "path": "E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e-d5af57",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-rules-complete-preview/tmp/bsdata-wh40k-11e"
  },
  {
    "path": "E:/Warhammer/worktrees/am-dg-recipient-gaps-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/card-polish-2-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/cards-cosmetics-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/compatible-related-panel-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/core-importer-a-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/csm-tau-recipient-gaps-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/csm-tau-tyranids-ec-rule-recipients/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/glossary-builder/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/keywords-access-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/new-recruit-export-import-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/new-recruit-model-names-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/new-recruit-plain-header-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/norma-1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/o1-recipient-rule-text/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/o3-detachment-card-text-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/show-1-card-labels/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/show-2-card-display/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/sm-ba-da-rule-recipients/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/sm-da-recipient-gaps-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/source-catalog-registry-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/sw-update-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/sweep-polish-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/test-hygiene-1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/test-hygiene-2/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/test-hygiene-min-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/test-temp-cleanup-tau/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/tyranids-ec-rule-coverage-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/v1-cleanup-v1/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/Codex-Archive/patchrepo-2026-09-11",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/_manifests",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ability-category-76022d87-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ability-dedup-855d641b",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ability-presentation-synthetic",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ability-release-20673f6d-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/admech-fnp-fix-6e4aa58e-20261016",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/admech-native-fnp-fix-6e4aa58e-20261016",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/admech-omnispex-fix-f8f82f38-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/admech-v2-deep-audit",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-datasheet-noise-022790fe",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-final-fdefd4da",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-glossary-fdefd4da",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-official-v1.4-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-omnispex-caption-fix-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-player-scenario-20261014-7545da94-f692-440f-ba70-36a107258fb3",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-recert-ca771f43",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-theme-1be58024",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am-ux-fdefd4da",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am06",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/am09-binding-ca771f43",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/b1-b3-pwa-production-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/charge-family-fix-ee6387be-20261016",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/charge-family-implementation-ee6387be-20261016",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-b1-integration-source-sync-20261025",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-b1-term-bindings-20261025",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-b2-b3-20261025",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-b2-b3-concept-fallback-20261026",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-b2-b3-integration-20261026",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-b2-b3-resume-20261025",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-preintegration-audit.mjs",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-preintegration-cc84bfe2",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/core-preintegration-targets.mjs",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/csm-blank-inventory-fix-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/csm-independent-content-078de95d",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/csm-personal-guide-14916f21",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/csm-player-scenario-20261014-34263d24-8422-4621-9e02-ddd8412c4e37",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/csm-source-first-e77ea12d",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/csm-v13-implementation",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/csm-wargear-contracts-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/csm-wargear-integration-ca8567a1-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/datasheet-certification-98fc94a5",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/datasheet-parity-51088e8e",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/datasheet-recertification-855d641b",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/death-guard-v2-deep-audit",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/death-guard-v2-stage1-targeted-fix-df80f6a3-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-caption-blockers-b31acbe7-8506e545-e88f-4edb-93c5-050bc8f1142b",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-content-03-06-9c41816e-eff883b1-2f6e-49b8-8b1d-70226c346952",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-content-04-70ccef5c-d9176fb8-9f3a-4baa-8ecf-c86f8e8037bb",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-content-05-bdd33731-964bf822-3476-4efe-850e-1bdab7aadf51",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-content-05-official-6dfd3360-6dee-4a77-af71-9071ddf875c8",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-content-final-9c41816e-20261013",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-content03-closure-9c41816e-efe1bc3d-34f9-425c-b593-38075452ab47",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-content0306-official-review-20261013",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-errata-title-fix-70ccef5c-5513bb9f-e1fa-4ba9-a43f-f6a821138f6b",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-fixed-oracle-build.cjs",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-icon-bearer-fix-82c5ad7b-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-navigation-acceptance-76a48286-20261013",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-navigation-forensic-76a48286-20261013-1791884146259",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-player-scenario-20261014-14f4ceb8-88a2-4ff6-80ba-bf5eb82ef66c",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-source-enrollment-20261028",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-two-failures-history-8eb9b843-181a-4fd0-be73-8a9b5f0c7c44",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/dg-upgrade-label-fix-bdd33731-90d9ee74-f0fe-454d-a0b5-5f0578df4f54",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-foundation-20673f6d-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-four-books-live-47495cc5-20261015",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-master-pageant-273b8bd3-20261015",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-native-fnp-a56909db-20261015",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-two-defects-forensic-a56909db-20261015",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-user-stress-a56909db-20261015",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-v2-app-browser",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-v2-unified-browser",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/ec-wargear-integration-b1d69da4-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/effective-datasheet-presentation-d087",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/effective-profile-annotations-0b55381c",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/effective-profile-annotations-browser.log",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/effective-profile-annotations-integration.log",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/exact-user-roster-preview",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-20261028",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-authorized-20261028",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-final-20261028",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-resume-20261028",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-detachment-recipients-tables-20261028",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-diagnosis-before-edit.log",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-qa-wiring-20261028",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/f1-table-schema.jsonl",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/five-books-effect-root-causes-ee6387be-20261016",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/five-books-physical-wargear-investigation-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/five-books-roster-effect-coverage-ee6387be-20261015",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/formed-units-9a952c7c",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/glossary-dependencies-bfd04cae-b070687c-0a02-44b8-afcd-be37dc18bb6a",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/glossary-dependencies-bfd04cae-home-96ae611d-79b8-47f2-90c4-4022b3cc1829",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/glossary-display-review.log",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/glossary-forensic-bfd04cae-96819709-f747-41b7-82b6-7228fb409f68",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/glossary-owner-parity.log",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/glossary-release-76022d87-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/glossary-single-owner-4a8b9a29-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/glossary-v1-v2-forensic-98fc94a5",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/gw-freshness-2026-10-14",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/home-core-glossary-smoke-20261014-8b2d75e0-3c99-4f13-96f5-5184a1f1d269",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/legacy-pending-patches",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/live-v2-release-20261014-27e692ae",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/manual-release-plan-98fc94a5-20261009",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/mega-glossary-v2",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/mfm-v16-integration-2026-10-14",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/minimal-pwa-core-glossary-20261026",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/minimal-pwa-css-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/minimal-pwa-fix-20261026",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/minimal-pwa-recovery-integration-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/normal-datasheet-parity-51088e8e",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/patch-release-4a8b9a29-20261014",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/personal-datasheet-parity-43bd6aaf",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/phase2b-shell-final",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/pwa-historical-failure-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-admech-five-qa-fixes-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-admech-megaroster-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-admech-omega-acceptance-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-admech-omega-caption-fix-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-admech-omega-proposal-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-army-book-cover-restoration-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-omega-acceptance-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-omega-root-cause-fix-safety-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-real-newrecruit37-p2-validation-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage1-discovery-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2a-foundation-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2b-mfm-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage2c-mixed-owner-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3a-gameplay-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3b-physical-import-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage3c-coverage-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4a-application-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b-capabilities-20261022",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b1-independent-review-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage4b2-integration-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage52-safe-attribution-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage53-attribution-integration-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ba-v2-stage54-points-p2-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-charge-frontend-review-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-crlf-integrity-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-cross-book-root-fixes-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-csm-dd-fix-4bef79a7-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-csm-megaroster-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-csm-omega-acceptance-4bef79a7-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-csm-omega-proposal-4bef79a7-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-omega-acceptance-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-root-cause-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage1-discovery-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage2a-foundation-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage2b-mfm-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage2c-mixed-owner-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage3a-mechanics-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage3b-chapter-context-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage3b1-applicability-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage3c-physical-import-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage3d-static-gameplay-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage4a-application-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage4b-coverage-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-capabilities-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-final-review-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-integration-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage4c-shared-capabilities-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage51-fixes-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage52-integration-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage53-omega-closure-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a-release-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a-resume-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage6a1-enrollment-bytes-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-da-v2-stage6b-production-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-dg-megaroster-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-dg-omega-final-d53656ad-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-dg-omega-fixed-roster-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-dg-selective-transfer-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ec-omega-acceptance-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ec-omega-import-fix-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-ec-omega-proposal-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-equipment-identity-grouping-fix-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-granted-ability-attribution-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-preserve-reimport-attachments-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-qa-census-eca6c72d-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-reimport-attachments-investigation-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-shared-equipment-caption-fix-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-mfm-v16-enrollment-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-native-mfm-stage4a-20261020-mapping-review.py",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-omega-acceptance-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage1-discovery-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage1-independent-review-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2a-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2b-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage2c-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage3a-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage3b-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4a-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4b-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4b-20261020-gameplay-qa.tmp.json",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4c-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage4d-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5a-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5c-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-sm-v2-stage5d-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-omega-acceptance-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-omega-evidence-closure-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-omega-final-reacceptance-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-omega-final-reconciliation-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-omega-proposal-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-omega-reviewed-addendum-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-student-source-scenario-review-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage1-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage2-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage3-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4b-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4c-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4d-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-completion-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage4g-final-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage5-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tau-v2-stage6-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tyranids-omega-acceptance-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tyranids-omega-proposal-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tyranids-trygon-selection-fix-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-tyranids-trygon-source-choice-fix-20261019",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6a-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6b1-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6b2-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-unified-v2-stage6c-20261021",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-15-rule-presentation-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-controlled-nr373-integration-20261024",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-controlled-stage57-integration-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-enhancement-text-fix-78522fcf-20261018",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-four-original-nr373-validation-20261024",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-model-identity-safety-20261024",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-model-membership-no-brackets-20261024",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-nine-book-release-20261024",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-real-newrecruit373-validation-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-real-nr373-import-fix-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-sm-appqa-independent-review-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-sm-deathwatch-qa-contract-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-sm-newrecruit373-original-validation-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-stage56-multi-detachment-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-stage57-stage56-p2-integration-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-stage58-universal-knownness-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-stage59-universal-pricing-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-stage591-canonical-option-knownness-20261023",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/recovery-v2-universal-nr373-mfm-20261024",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/release-candidate-b1-b3-pwa-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/release-candidate-b1-b3-pwa-fresh-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/release-certification-98fc94a5-20261009",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/release-manifest-sw-investigation-20261026",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/release-preview-98fc94a5",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/release-remainder-df80f6a3-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/runtime-manifest-integration-20261026",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/safe-pwa-updates-20261026",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/shell-allowlist-210a6aab-home-6880624e-7b49-4335-ab19-e457c693250e",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/sm-original373-readonly.mjs",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/source-completeness-gate-1af1d51f-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/source-completeness-gate-1af1d51f-20261017-mutations.log",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/source-runtime-manifest-fix-20261026",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/stale-test-input-fix-ab41bb1f-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/tyranids-seven-effects-4edfabbd-20261016",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/tyranids-v2-isolated-browser",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/tyranids-v2-unified-browser",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/tyranids-v2-user-stress-ee6387be-20261015",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-glossary-reference-98fc94a5",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-regression-f5d203d2-20261013-fa10caa3-1781-40e9-8c32-86d70a1c4b75",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-cover-release-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-five-books-release-df80f6a3-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-image-audit-ca651a23-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-live-playwright-df80f6a3-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-pages-release-ca651a23-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-recovery-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-release-preflight-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-release-preparation-3f362abb-20261020",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-safety-backup-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/unified-v2-technical-acceptance-ab41bb1f-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v1-home-port",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v1-leftovers-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v1-tests-pdf-cleanup-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v1-v2-home-audit-b7db5f31",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-home-forensic-f4854559-1791893512065",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-home-forensic-f4854559-1791893580312",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-home-qa-f4854559-acceptance",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-home-qa-f4854559-acceptance-final",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-only-baseline-adjudication-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-only-baseline-resume-rc-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-only-core-glossary-qa-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-only-eol-integration-candidate-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-only-integration-release-candidate-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-only-production-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/v2-only-remove-legacy-20261027",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/wargear-compatibility-a316ff0c-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/wargear-contract-pilot-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/wargear-schema-capabilities-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/wargear-schema-regression-preqa.json",
    "kind": "file",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-artifacts/wargear-technical-review-b1d69da4-20261017",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/dg-am-rule-recipients",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/o1-core-diagnosis-20261031",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/o1-pre-ff-reviewed-0ba0426b",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/o1-recipient-rule-text",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/show-1-card-labels",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/show-2-card-display",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/test-speedup-20261030",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/test-temp-cleanup-tau",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/translate-3-final-jbowQJ",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-evidence/translate-3-sources-v2-EnpOFC",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/core-rules-refresh-v1-baseline-949d98f",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-baseline",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/core-rules-refresh-v1-registry-u6-recovery",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/qa-tmp/core-rules-refresh-v1-source-catalog-baseline-write",
    "kind": "directory",
    "owner": null
  },
  {
    "path": "E:/Warhammer/warhammer-ec-eager/node_modules",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/warhammer-ec-eager/tmp",
    "kind": "junction",
    "owner": null
  },
  {
    "path": "E:/Warhammer/worktrees/am-dg-recipient-gaps-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/card-polish-2-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/cards-cosmetics-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/compatible-related-panel-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/core-importer-a-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/csm-tau-recipient-gaps-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/csm-tau-tyranids-ec-rule-recipients",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/glossary-builder",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/keywords-access-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/new-recruit-export-import-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/new-recruit-model-names-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/new-recruit-plain-header-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/norma-1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/o1-recipient-rule-text",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/o3-detachment-card-text-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/show-1-card-labels",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/show-2-card-display",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/sm-ba-da-rule-recipients",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/sm-da-recipient-gaps-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/source-catalog-registry-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/sw-update-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/sweep-polish-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/test-hygiene-1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/test-hygiene-2",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/test-hygiene-min-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/test-temp-cleanup-tau",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/tyranids-ec-rule-coverage-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/worktrees/v1-cleanup-v1",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-v2-recovery"
  },
  {
    "path": "E:/Warhammer/warhammer-ec-eager",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-rules-complete-preview"
  },
  {
    "path": "E:/Warhammer/warhammer-w2-16-root-overflow",
    "kind": "worktree",
    "owner": "E:/Warhammer/warhammer-rules-complete-preview"
  }
]
'@

function Get-Sha256File([string]$Path) {
    $stream = [IO.File]::OpenRead($Path)
    $hash = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($hash.ComputeHash($stream)).Replace('-', '').ToLowerInvariant() }
    finally { $hash.Dispose(); $stream.Dispose() }
}

function Get-Sha256Utf8([string]$Text) {
    $hash = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($hash.ComputeHash([Text.Encoding]::UTF8.GetBytes($Text))).Replace('-', '').ToLowerInvariant() }
    finally { $hash.Dispose() }
}

function Test-SamePath([string]$A, [string]$B) {
    return [string]::Equals($A.TrimEnd([char]92), $B.TrimEnd([char]92), [StringComparison]::OrdinalIgnoreCase)
}

function Test-Within([string]$Path, [string]$Root) {
    return (Test-SamePath $Path $Root) -or $Path.StartsWith(
        $Root.TrimEnd([char]92) + [string][char]92, [StringComparison]::OrdinalIgnoreCase)
}

function Get-BoundedPath([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path) -or -not [IO.Path]::IsPathFullyQualified($Path)) {
        throw 'An absolute path is required.'
    }
    if ($Path.StartsWith([string]::new([char]92, 2)) -or $Path.Substring(2).Contains(':')) {
        throw 'UNC, device and alternate-stream paths are not permitted.'
    }
    $full = [IO.Path]::GetFullPath($Path).TrimEnd([char]92)
    $boundary = [IO.Path]::GetFullPath('E:/Warhammer').TrimEnd([char]92)
    if (-not (Test-Within $full $boundary) -or (Test-SamePath $full $boundary)) {
        throw ('Path is outside the approved Warhammer descendants: ' + $full)
    }
    return $full
}

function Assert-NoReparseAncestors([string]$FullPath, [switch]$AllowLeafReparse) {
    $current = $FullPath
    while (-not [string]::IsNullOrEmpty($current)) {
        $item = Get-Item -LiteralPath $current -Force -ErrorAction Stop
        if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -and
            -not ($AllowLeafReparse -and (Test-SamePath $current $FullPath))) {
            throw ('Reparse root or ancestor refused: ' + $current)
        }
        $parent = [IO.Path]::GetDirectoryName($current)
        if ($parent -eq $current) { break }
        $current = $parent
    }
}

function Get-NormalizedLinkTarget([string]$Target) {
    $value = $Target.Replace([char]92, [char]47)
    if ($value.StartsWith('//?/')) { $value = $value.Substring(4) }
    if ($value.StartsWith('/??/')) { $value = $value.Substring(4) }
    return $value.TrimEnd('/').ToLowerInvariant()
}

function Get-PlanIdentity($Operations) {
    $values = @($Operations | ForEach-Object {
        [ordered]@{
            path = [string]$_.path
            kind = [string]$_.kind
            owner = $(if ($_.Contains('owner')) { [string]$_.owner } else { $null })
        }
    })
    return ConvertTo-Json -InputObject $values -Depth 5 -Compress
}

function Get-GitRaw {
    param([string]$Root, [string[]]$Arguments, [switch]$Capture,
          [int[]]$AllowedExitCodes = @(0))
    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName = 'git'
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    $start.Environment['GIT_OPTIONAL_LOCKS'] = '0'
    $start.Environment['GIT_TERMINAL_PROMPT'] = '0'
    foreach ($arg in @('--no-optional-locks', '-c', 'core.quotePath=false', '-C', $Root) + $Arguments) {
        $start.ArgumentList.Add($arg)
    }
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $start
    $hash = [Security.Cryptography.IncrementalHash]::CreateHash([Security.Cryptography.HashAlgorithmName]::SHA256)
    $copy = $(if ($Capture) { [IO.MemoryStream]::new() } else { $null })
    $started = $false
    try {
        if (-not $process.Start()) { throw 'Could not start Git.' }
        $started = $true
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $buffer = [byte[]]::new(65536)
        while (($count = $process.StandardOutput.BaseStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $hash.AppendData($buffer, 0, $count)
            if ($null -ne $copy) {
                if ($copy.Length + $count -gt 16777216) { throw 'Git metadata capture exceeded 16 MiB.' }
                $copy.Write($buffer, 0, $count)
            }
        }
        $process.WaitForExit()
        $stderr = $stderrTask.GetAwaiter().GetResult()
        if ($process.ExitCode -notin $AllowedExitCodes) {
            throw ('Git preflight failed in ' + $Root + ' (exit ' + $process.ExitCode + '): ' + $stderr)
        }
        return [pscustomobject]@{
            ExitCode = $process.ExitCode
            Sha256 = [BitConverter]::ToString($hash.GetHashAndReset()).Replace('-', '').ToLowerInvariant()
            Text = $(if ($null -ne $copy) { [Text.Encoding]::UTF8.GetString($copy.ToArray()) } else { $null })
        }
    }
    finally {
        if ($started -and -not $process.HasExited) { $process.Kill($true); $process.WaitForExit() }
        if ($null -ne $copy) { $copy.Dispose() }
        $hash.Dispose(); $process.Dispose()
    }
}

function Get-RefsStable([string]$Root) {
    $result = Get-GitRaw -Root $Root -Arguments @(
        'for-each-ref', '--format=%(refname)%09%(objectname)', 'refs/heads', 'refs/tags', 'refs/stash') -Capture
    $builder = [Text.StringBuilder]::new()
    $hasHeads = $false
    foreach ($line in $result.Text.Split("`n")) {
        if ($line.Length -eq 0) { continue }
        $tab = $line.IndexOf("`t")
        if ($tab -lt 0 -or $line.Contains("`r")) { throw 'Unexpected Git ref metadata encoding.' }
        $name = $line.Substring(0, $tab)
        if ($name.StartsWith('refs/heads/', [StringComparison]::Ordinal)) { $hasHeads = $true }
        if ($name -ceq 'refs/heads/codex/disk-e-audit-evidence') { continue }
        [void]$builder.Append($line).Append("`n")
    }
    return [pscustomobject]@{ Sha256 = Get-Sha256Utf8 $builder.ToString(); HasHeads = $hasHeads }
}

function Get-RegisteredWorktrees([string]$Owner) {
    $result = Get-GitRaw -Root $Owner -Arguments @('worktree', 'list', '--porcelain', '-z') -Capture
    $records = [Collections.Generic.List[object]]::new()
    $record = $null
    foreach ($field in $result.Text.Split([char]0)) {
        if ($field.Length -eq 0) {
            if ($null -ne $record) { $records.Add($record); $record = $null }
            continue
        }
        if ($field.StartsWith('worktree ', [StringComparison]::Ordinal)) {
            if ($null -ne $record) { throw 'Malformed worktree metadata.' }
            $record = @{ Path = [IO.Path]::GetFullPath($field.Substring(9)).TrimEnd([char]92); Locked = $false }
        }
        elseif ($field -eq 'locked' -or $field.StartsWith('locked ', [StringComparison]::Ordinal)) {
            if ($null -eq $record) { throw 'Malformed locked-worktree metadata.' }
            $record.Locked = $true
        }
    }
    if ($null -ne $record) { $records.Add($record) }
    return $records.ToArray()
}

function Get-TreeFingerprint([string]$Root) {
    $records = [Collections.Generic.List[string]]::new()
    $gitRoots = [Collections.Generic.List[string]]::new()
    $reparseEntries = [Collections.Generic.List[string]]::new()
    $stack = [Collections.Generic.Stack[IO.FileSystemInfo]]::new()
    $stack.Push([IO.DirectoryInfo]::new($Root))
    [long]$files = 0; [long]$bytes = 0
    while ($stack.Count -gt 0) {
        $entry = $stack.Pop()
        $entry.Refresh()
        if (-not $entry.Exists) { throw ('Tree entry disappeared: ' + $entry.FullName) }
        $attrs = [int]$entry.Attributes
        $isDirectory = ($entry.Attributes -band [IO.FileAttributes]::Directory) -ne 0
        $isReparse = ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0
        [long]$length = 0
        if (-not $isDirectory) { $length = ([IO.FileInfo]$entry).Length; $files++; $bytes += $length }
        $kind = $(if ($isReparse) { 'R' } elseif ($isDirectory) { 'D' } else { 'F' })
        $relative = $(if (Test-SamePath $entry.FullName $Root) { '' } else {
            [IO.Path]::GetRelativePath($Root, $entry.FullName).Replace([char]92, [char]47)
        })
        $records.Add($relative + [char]0 + $kind + [char]0 +
            $length.ToString([Globalization.CultureInfo]::InvariantCulture) + [char]0 +
            $entry.LastWriteTimeUtc.Ticks.ToString([Globalization.CultureInfo]::InvariantCulture) + [char]0 +
            $attrs.ToString([Globalization.CultureInfo]::InvariantCulture) + "`n")
        if ($isReparse) { $reparseEntries.Add($entry.FullName.TrimEnd([char]92)) }
        if ($entry.Name -ceq '.git') {
            $gitRoots.Add($(if ($entry -is [IO.DirectoryInfo]) { $entry.Parent.FullName } else { $entry.DirectoryName }))
        }
        if ($isDirectory -and -not $isReparse) {
            foreach ($child in ([IO.DirectoryInfo]$entry).EnumerateFileSystemInfos()) { $stack.Push($child) }
        }
    }
    [string[]]$sorted = $records.ToArray()
    [Array]::Sort($sorted, [StringComparer]::Ordinal)
    $hash = [Security.Cryptography.IncrementalHash]::CreateHash([Security.Cryptography.HashAlgorithmName]::SHA256)
    try {
        foreach ($record in $sorted) { $hash.AppendData([Text.Encoding]::UTF8.GetBytes($record)) }
        $sha = [BitConverter]::ToString($hash.GetHashAndReset()).Replace('-', '').ToLowerInvariant()
    }
    finally { $hash.Dispose() }
    return [pscustomobject]@{ Sha256 = $sha; Entries = $sorted.Length; Files = $files; LogicalBytes = $bytes; GitRoots = $gitRoots.ToArray(); ReparseEntries = $reparseEntries.ToArray() }
}

function Assert-TreeFingerprint($Actual, $Expected, [string]$Path) {
    if ($Actual.Sha256 -cne [string]$Expected.sha256 -or
        $Actual.Entries -ne [long]$Expected.entries -or
        $Actual.Files -ne [long]$Expected.files -or
        $Actual.LogicalBytes -ne [long]$Expected.logicalBytes) {
        throw ('Tree fingerprint changed: ' + $Path)
    }
}

function Assert-GitState([string]$Path, $Expected) {
    $head = Get-GitRaw -Root $Path -Arguments @('rev-parse', '--verify', 'HEAD') -Capture -AllowedExitCodes @(0, 128)
    $branch = Get-GitRaw -Root $Path -Arguments @('symbolic-ref', '--quiet', '--short', 'HEAD') -Capture -AllowedExitCodes @(0, 1)
    $common = Get-GitRaw -Root $Path -Arguments @('rev-parse', '--path-format=absolute', '--git-common-dir') -Capture
    $actualHead = $(if ($head.ExitCode -eq 0) { $head.Text.TrimEnd("`r", "`n") } else { $null })
    $actualBranch = $(if ($branch.ExitCode -eq 0) { $branch.Text.TrimEnd("`r", "`n") } else { '' })
    $expectedBranch = $(if ($null -eq $Expected.branch) { '' } else { [string]$Expected.branch })
    if ($actualHead -cne $Expected.head -or $actualBranch -cne $expectedBranch) { throw ('Git HEAD/branch changed: ' + $Path) }
    if (-not (Test-SamePath ([IO.Path]::GetFullPath($common.Text.Trim())) ([IO.Path]::GetFullPath([string]$Expected.commonDir)))) {
        throw ('Git common directory changed: ' + $Path)
    }
    $refs = Get-RefsStable $Path
    if ($null -eq $Expected.head -and ($head.ExitCode -ne 128 -or $refs.HasHeads)) {
        throw ('Expected unborn Git repository is no longer unborn: ' + $Path)
    }
    $status = Get-GitRaw -Root $Path -Arguments @('status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignore-submodules=all')
    $tracked = Get-GitRaw -Root $Path -Arguments @('diff', '--binary', '--full-index', '--no-ext-diff', '--no-textconv')
    $cached = Get-GitRaw -Root $Path -Arguments @('diff', '--cached', '--binary', '--full-index', '--no-ext-diff', '--no-textconv')
    if ($status.Sha256 -cne [string]$Expected.statusSha256 -or
        $tracked.Sha256 -cne [string]$Expected.trackedSha256 -or
        $cached.Sha256 -cne [string]$Expected.cachedSha256 -or
        $refs.Sha256 -cne [string]$Expected.refsStableSha256) { throw ('Git bytes/refs changed: ' + $Path) }
}

function Assert-RemovalBoundary([string]$Path) {
    foreach ($tree in $script:ProtectedTrees) {
        if ((Test-Within $Path $tree) -or (Test-Within $tree $Path)) { throw ('Protected tree intersects target: ' + $Path) }
    }
    foreach ($owner in $script:ProtectedRootOnly) {
        if (Test-Within $owner $Path) { throw ('A retained Git owner/root would be removed: ' + $Path) }
    }
}

function Assert-NoUnplannedGitOwnership([string]$Path, $GitRoots) {
    foreach ($gitRoot in @($GitRoots | Sort-Object -Unique)) {
        $commonResult = Get-GitRaw -Root $gitRoot -Arguments @('rev-parse', '--path-format=absolute', '--git-common-dir') -Capture
        $common = [IO.Path]::GetFullPath($commonResult.Text.Trim()).TrimEnd([char]92)
        $registered = @(Get-RegisteredWorktrees $gitRoot)
        if (Test-Within $common $Path) {
            # A standalone clone may own its own .git. Shared object/ref stores must stay.
            if ($registered.Count -gt 1) { throw ('Shared Git owner inside directory target: ' + $gitRoot) }
            foreach ($member in $registered) {
                if ($member.Locked) { throw ('Locked worktree under directory target: ' + $member.Path) }
                if (-not (Test-Within $member.Path $Path) -and -not $script:PlannedWorktrees.Contains($member.Path)) {
                    throw ('External registered worktree depends on target: ' + $member.Path)
                }
            }
        }
        else {
            # Linked checkouts nested in a QA directory must be explicitly unregistered first.
            if (-not $script:PlannedWorktrees.Contains([IO.Path]::GetFullPath($gitRoot).TrimEnd([char]92))) {
                throw ('Unplanned linked worktree inside directory target: ' + $gitRoot)
            }
        }
    }
}

$freeBefore = $null
try {
    if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'PowerShell 7 or later is required.' }
    $freeBefore = [IO.DriveInfo]::new('E:/').AvailableFreeSpace
    $manifestFull = Get-BoundedPath $ManifestPath
    Assert-NoReparseAncestors $manifestFull
    if ((Get-Sha256File $manifestFull) -cne $ManifestSha256.ToLowerInvariant()) { throw 'Manifest SHA256 mismatch.' }
    $manifest = [IO.File]::ReadAllText($manifestFull, [Text.Encoding]::UTF8) | ConvertFrom-Json -AsHashtable
    $embedded = $EmbeddedOperationsJson | ConvertFrom-Json -AsHashtable
    if ((Get-PlanIdentity $embedded) -cne (Get-PlanIdentity $manifest.operations)) { throw 'Embedded operations do not exactly match manifest.' }
    if (@($manifest.operations).Count -eq 0) { throw 'Empty cleanup plan refused.' }

    $script:ProtectedTrees = [Collections.Generic.List[string]]::new()
    foreach ($path in @($manifest.protectedTrees) + @(
        'E:/Warhammer/qa-tmp/preview-v1',
        'E:/Warhammer/archive-reports',
        'E:/Warhammer/qa-evidence/disk-e-audit-2026-11-16')) {
        $script:ProtectedTrees.Add((Get-BoundedPath ([string]$path)))
    }
    $script:ProtectedRootOnly = [Collections.Generic.List[string]]::new()
    foreach ($path in @($manifest.protectedRootOnly)) { $script:ProtectedRootOnly.Add((Get-BoundedPath ([string]$path))) }
    $script:PlannedWorktrees = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $script:PlannedGitRoots = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $seenTargets = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $owners = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $junctions = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $prepared = [Collections.Generic.List[object]]::new()

    # Resolve and protect every owner before validating any target.
    foreach ($operation in $manifest.operations) {
        if ($operation.Contains('git') -and $null -ne $operation.git) {
            if ($operation.kind -notin @('directory', 'worktree')) { throw 'Git proof must identify a directory or worktree operation.' }
            [void]$script:PlannedGitRoots.Add((Get-BoundedPath ([string]$operation.path)))
        }
        if ($operation.kind -eq 'worktree') {
            $owner = Get-BoundedPath ([string]$operation.owner)
            Assert-NoReparseAncestors $owner
            if (-not (Get-Item -LiteralPath $owner -Force).PSIsContainer) { throw 'Worktree owner is not a directory.' }
            [void]$owners.Add($owner); $script:ProtectedRootOnly.Add($owner)
            $ownerCommon = Get-GitRaw -Root $owner -Arguments @('rev-parse', '--path-format=absolute', '--git-common-dir') -Capture
            $script:ProtectedTrees.Add((Get-BoundedPath $ownerCommon.Text.Trim()))
            [void]$script:PlannedWorktrees.Add((Get-BoundedPath ([string]$operation.path)))
        }
        elseif ($operation.kind -eq 'junction') {
            [void]$junctions.Add((Get-BoundedPath ([string]$operation.path)))
        }
    }
    $archivePaths = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $archiveRoot = [IO.Path]::GetFullPath('E:/Warhammer/archive-reports').TrimEnd([char]92)
    [long]$archiveBytes = 0
    foreach ($archive in $manifest.archives) {
        $path = Get-BoundedPath ([string]$archive.path)
        if (-not (Test-Within $path $archiveRoot)) { throw ('Archive is outside the protected archive-reports tree: ' + $path) }
        if (-not $archivePaths.Add($path)) { throw ('Duplicate archive path: ' + $path) }
        Assert-NoReparseAncestors $path
        $file = Get-Item -LiteralPath $path -Force
        if ($file.PSIsContainer -or $file.Length -ne [long]$archive.bytes) { throw ('Archive missing/size changed: ' + $path) }
        if ((Get-Sha256File $path) -cne [string]$archive.sha256) { throw ('Archive SHA256 changed: ' + $path) }
        $archiveBytes += $file.Length
        if (($archivePaths.Count % 1000) -eq 0) {
            Write-Host ('Archive preflight: {0} files verified.' -f $archivePaths.Count)
        }
    }
    if ($archivePaths.Count -ne [long]$manifest.totals.archivesCount -or
        $archiveBytes -ne [long]$manifest.totals.archivesBytes) { throw 'Archive count/byte totals mismatch.' }

    $processes = @(Get-CimInstance Win32_Process | Where-Object ProcessId -ne $PID)
    foreach ($operation in $manifest.operations) {
        if ($operation.kind -notin @('worktree', 'directory', 'file', 'junction')) { throw 'Unknown operation kind.' }
        $path = Get-BoundedPath ([string]$operation.path)
        if (-not $seenTargets.Add($path)) { throw ('Duplicate target: ' + $path) }
        Assert-NoReparseAncestors $path -AllowLeafReparse:($operation.kind -eq 'junction')
        Assert-RemovalBoundary $path
        $item = Get-Item -LiteralPath $path -Force
        if ($operation.kind -ne 'junction' -and (($operation.kind -eq 'file') -eq $item.PSIsContainer)) { throw ('Operation type mismatch: ' + $path) }
        foreach ($process in $processes) {
            if ($process.CommandLine -and $process.CommandLine.Replace([char]47, [char]92).IndexOf($path, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                throw ('Running process references target: ' + $path)
            }
        }
        if ($operation.kind -eq 'junction') {
            if (-not $item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -eq 0 -or $item.LinkType -ne 'Junction') {
                throw ('Expected directory junction, not a regular directory or symbolic link: ' + $path)
            }
            if (-not $operation.Contains('linkTarget') -or [string]::IsNullOrWhiteSpace([string]$operation.linkTarget)) { throw 'Junction target proof required.' }
            $targets = @($item.Target)
            if ($targets.Count -ne 1 -or (Get-NormalizedLinkTarget ([string]$targets[0])) -cne (Get-NormalizedLinkTarget ([string]$operation.linkTarget))) {
                throw ('Junction target changed: ' + $path)
            }
        }
        elseif ($operation.Contains('git') -and $null -ne $operation.git) { Assert-GitState $path $operation.git }
        elseif ($operation.kind -eq 'worktree') { throw ('Worktree has no Git fingerprint: ' + $path) }

        if ($operation.kind -eq 'file') {
            if (-not $operation.Contains('fileFingerprint')) { throw ('File fingerprint required: ' + $path) }
            $fp = $operation.fileFingerprint
            if ($item.Length -ne [long]$fp.bytes -or $item.LastWriteTimeUtc.Ticks -ne [long]$fp.lastWriteTicks -or
                (Get-Sha256File $path) -cne [string]$fp.sha256) { throw ('File fingerprint changed: ' + $path) }
        }
        elseif ($operation.kind -in @('directory', 'worktree')) {
            if (-not $operation.Contains('treeFingerprint')) { throw ('Directory fingerprint required: ' + $path) }
            $tree = Get-TreeFingerprint $path
            Assert-TreeFingerprint $tree $operation.treeFingerprint $path
            foreach ($link in $tree.ReparseEntries) {
                if (-not $junctions.Contains($link)) { throw ('Unplanned reparse descendant: ' + $link) }
            }
            foreach ($gitRoot in $tree.GitRoots) {
                $nestedRoot = [IO.Path]::GetFullPath($gitRoot).TrimEnd([char]92)
                if (-not (Test-SamePath $nestedRoot $path) -and -not $script:PlannedGitRoots.Contains($nestedRoot)) {
                    throw ('Nested Git repository lacks an explicit planned Git operation/proof: ' + $nestedRoot)
                }
            }
            Assert-NoUnplannedGitOwnership $path $tree.GitRoots
        }
        if ($operation.kind -eq 'worktree') {
            $owner = Get-BoundedPath ([string]$operation.owner)
            $registered = @(Get-RegisteredWorktrees $owner | Where-Object { Test-SamePath $_.Path $path })
            if ($registered.Count -ne 1 -or $registered[0].Locked) { throw ('Target is absent/locked in owner worktree list: ' + $path) }
        }
        $prepared.Add([pscustomobject]@{ Path = $path; Kind = [string]$operation.kind; Owner = $(if ($operation.kind -eq 'worktree') { $owner } else { $null }); Depth = $path.Split([char]92).Length })
        if (($prepared.Count % 25) -eq 0) {
            Write-Host ('Operation preflight: {0} targets verified.' -f $prepared.Count)
        }
    }

    # Only a directory may contain other exact planned operations. All child worktrees
    # are removed through Git before an enclosing old QA directory is removed.
    foreach ($parent in $prepared) {
        foreach ($child in $prepared) {
            if (-not (Test-SamePath $parent.Path $child.Path) -and (Test-Within $child.Path $parent.Path) -and
                $parent.Kind -ne 'directory' -and -not ($parent.Kind -eq 'worktree' -and $child.Kind -eq 'junction')) {
                throw ('Unsafe overlapping operation types: ' + $parent.Path)
            }
        }
    }
    # Refresh the process snapshot after all potentially long archive/source checks.
    # This is still before the first junction/worktree/directory mutation.
    $finalProcesses = @(Get-CimInstance Win32_Process | Where-Object ProcessId -ne $PID)
    foreach ($operation in $prepared) {
        foreach ($process in $finalProcesses) {
            if ($process.CommandLine -and $process.CommandLine.Replace([char]47, [char]92).IndexOf($operation.Path, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                throw ('Running process now references target: ' + $operation.Path)
            }
        }
    }
    Write-Host ('Preflight complete: {0} operations; {1} verified archive files / {2:N0} bytes.' -f $prepared.Count, $archivePaths.Count, $archiveBytes)
    $ordered = @($prepared | Sort-Object @{ Expression = 'Depth'; Descending = $true }, @{ Expression = 'Path'; Descending = $false })
    foreach ($operation in $ordered) {
        if ($operation.Kind -eq 'worktree') {
            if ($Apply) {
                [void](Get-GitRaw -Root $operation.Owner -Arguments @('worktree', 'remove', '--force', '--', $operation.Path))
            } else { Write-Host ('WhatIf: git worktree remove --force ' + $operation.Path) }
        }
        elseif ($operation.Kind -eq 'junction') {
            # Link-only operation. NEVER add -Recurse here and never touch its target.
            Remove-Item -LiteralPath $operation.Path -Force -WhatIf:(-not $Apply)
        }
        elseif ($operation.Kind -eq 'directory') {
            Remove-Item -LiteralPath $operation.Path -Recurse -Force -WhatIf:(-not $Apply)
        }
        else { Remove-Item -LiteralPath $operation.Path -Force -WhatIf:(-not $Apply) }
    }
    foreach ($owner in $owners) {
        if ($Apply) { [void](Get-GitRaw -Root $owner -Arguments @('worktree', 'prune')) }
        else { Write-Host ('WhatIf: git worktree prune in ' + $owner) }
    }
    Write-Host 'Exact planned operations completed. No branch, source/main/release reference or execution policy was changed.'
}
catch {
    Write-Error ('Cleanup stopped: ' + $_.Exception.Message) -ErrorAction Continue
    throw
}
finally {
    $freeAfter = [IO.DriveInfo]::new('E:/').AvailableFreeSpace
    Write-Host ('E: free bytes before: {0}; after: {1}' -f $freeBefore, $freeAfter)
    [void](Read-Host 'Press Enter to close')
}
