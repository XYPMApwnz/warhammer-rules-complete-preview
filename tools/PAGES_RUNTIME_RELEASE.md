# Unified V2 runtime publication

[README](../README.md#runtime-only-packaging-and-publication) is the primary build and product guide. Unified V2 is the sole UI. Roster Guides, V1 readers, old mobile HTML routes and V1 URL/roster/update compatibility are retired. Canonical sources, accepted RAW/PDF, required producers, the Core iframe reader and active V2 presentation modules remain in source.

## Build and verify

Use Node.js 24 and a fresh clean checkout of the exact reviewed source commit. Check working bytes with `git ls-files --eol` when hashes differ from Git blobs. Do not change accepted enrollment bytes or normalize source inputs to force a desired hash.

```text
node tools/pages-runtime-package.mjs --source SOURCE --out NEW_PUBLISH_DIRECTORY
node tools/pages-runtime-package.mjs --source SOURCE --out NEW_PUBLISH_DIRECTORY --check
node tools/pages-runtime-package-qa.mjs --source SOURCE --published NEW_PUBLISH_DIRECTORY --work NEW_QA_DIRECTORY
```

Normal packaging is network-free. It publishes only the explicit `tools/pages-runtime-manifest.json` allowlist and refuses a non-empty output directory, missing module/resource dependencies, symlinks, unsafe paths, unlisted files or corrupted bodies. QA files and development archives are not runtime inputs. Retained publicly linked source downloads remain explicitly declared; a `/sources/` pathname alone is not permission to publish a capture.

`PAGES_RUNTIME_MANIFEST.json` records paths, byte sizes, SHA-256, input hashes and a deterministic aggregate. Runtime bodies are copied verbatim except declared outputs of existing publication/cache producers and the static `.nojekyll` LF marker. Review any changed dependency reason and repeat dist-only browser checks. File counts and hashes are new release baselines, not fixed historical targets.

The mandatory precache contains V2 code and small shell resources, including `books/shared/datasheet-system.css` and `books/shared/unit-art.css`. Army Book JSON and the large glossary payloads remain lazy. Core still needs `glossary/v2/generated/index.en.js` after it is opened. Test current V2 install, compatible cached data, manual updates and offline reading; no retired V1 migration journey is an acceptance requirement.

## Source review and release authorization

The GitHub repository is `XYPMApwnz/warhammer-rules-complete-preview`. Check actual remotes and current GitHub refs; a local `origin` may be a backup rather than GitHub.

Start a separate feature branch from current `codex/unified-v2-source` and push only that branch. After independent Claude review returns PASS for its exact head, explicit owner authorization permits an ordinary fast-forward push of that head to `codex/unified-v2-source`. Recheck both remote SHAs and ancestry before pushing; never force-push or update `main`.

The owner authorizes publication; Codex executes it. After Claude PASS for the exact release candidate and the owner's manual check, Codex performs the ordinary fast-forward of `unified-v2-release` only after separate explicit owner authorization naming that exact candidate SHA. Permission to prepare, test or push a candidate review branch is not permission to publish. The same authority and checks apply to rollback.

`.github/workflows/pages-runtime.yml` runs on `unified-v2-release` and guards its build/deploy jobs with that exact ref. Pages is configured for GitHub Actions. Source or feature pushes do not publish the site. Never change Pages settings, dispatch a workflow or push a release without explicit authorization.

### Prepare and review a candidate without publishing

1. Verify clean reviewed source, current GitHub source/release refs, reviewed limitations and required QA. Record the previous release SHA, last Pages deployment/run and whether a previous Pages artifact is available for rollback.
2. Create the candidate with `git commit-tree <reviewed-source-tree> -p <current-release-sha>`. Its tree must equal the reviewed source tree and its only parent must equal current `unified-v2-release`. Verify the proposed review branch does not exist; otherwise stop. Push only to that new review branch. Do not update source, release or `main`, change Pages settings or dispatch a workflow.
3. Package a clean checkout of the exact candidate with all three commands above. Obtain independent Claude review of that exact SHA, including Linux packaging, runtime hashes, file inventories, deterministic rebuilds and browser acceptance. Require PASS and the owner's manual check before requesting separate release authorization.

### Publish only the separately authorized exact candidate

1. Recheck candidate tree/only parent, remote refs, Pages configuration and release workflow. After separate explicit owner authorization for the exact reviewed candidate SHA, Codex performs the ordinary fast-forward push of that candidate to `unified-v2-release` through the explicit GitHub URL. No force push, merge, rebase or history rewrite; if release moved, stop and prepare/review a new candidate.
2. Wait for hosted build and deploy SUCCESS at the candidate SHA. Verify the actual HTTPS `PAGES_RUNTIME_MANIFEST.json`, not only local output or an Actions conclusion.
3. Check root V2 entry, nine books, Core, Glossary, representative roster/Effective/Guide paths, required assets, cache revision, manual updates and desktop/mobile behavior on the live site.

## Rollback without a previous Pages artifact

The previous Pages artifact for release `1fd0b279051d76f1a262f7c8f117e35551b7de39` is unavailable. Do not reset release, force-push, dispatch an old workflow or replace deployed files manually. Prepare a new rollback commit with that old release's tree and the current release as its only parent. Review and authorize it as a new candidate before any release push. Restoring the old tree also restores its known behavior and limitations; check saved-roster/update compatibility without clearing player data.

Run preparation from a clean checkout with the required Git objects and the configured automation identity. These PowerShell commands create and push only a new review branch, not a release:

```powershell
$ErrorActionPreference = 'Stop'
$github = 'https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git'
$releaseRef = 'refs/heads/unified-v2-release'
$oldRelease = '1fd0b279051d76f1a262f7c8f117e35551b7de39'
git fetch --no-tags $github $releaseRef
if ($LASTEXITCODE -ne 0) { throw 'Release fetch failed; STOP' }
$currentRelease = (git rev-parse FETCH_HEAD).Trim()
if ($currentRelease -eq $oldRelease) { throw 'Release is already the old release; STOP' }
$oldTree = (git rev-parse "${oldRelease}^{tree}").Trim()
if ($LASTEXITCODE -ne 0) { throw 'Old release tree is unavailable; STOP' }
$rollbackSha = (git commit-tree $oldTree -p $currentRelease -m "Rollback candidate: restore $oldRelease over $currentRelease").Trim()
if ($LASTEXITCODE -ne 0) { throw 'Rollback commit creation failed; STOP' }
if ((git rev-parse "${rollbackSha}^{tree}").Trim() -ne $oldTree -or
    (git show -s --format=%P $rollbackSha).Trim() -ne $currentRelease) {
  throw 'Rollback tree or only parent differs; STOP'
}
$reviewBranch = 'codex/rollback-candidate-' + $rollbackSha.Substring(0, 8)
$existing = @(git ls-remote $github "refs/heads/$reviewBranch")
if ($LASTEXITCODE -ne 0 -or $existing.Count -ne 0) { throw 'Cannot prove new review branch; STOP' }
git push $github "${rollbackSha}:refs/heads/$reviewBranch"
if ($LASTEXITCODE -ne 0) { throw 'Review push failed; STOP' }
Write-Output "Rollback SHA: $rollbackSha; tree: $oldTree; parent: $currentRelease; review: $reviewBranch"
```

Record those exact values, package/test a clean checkout of `$rollbackSha` with the build/QA and browser checks above, obtain Claude PASS and the owner's manual check, then wait for separate explicit owner authorization for that SHA. Only after that authorization may Codex run the following in the same preparation context (or restore the recorded values exactly):

```powershell
$approvedRollback = '<exact rollback SHA separately authorized by the owner>'
if ($approvedRollback -ne $rollbackSha) { throw 'Authorization is for a different SHA; STOP' }
$releaseRows = @(git ls-remote $github $releaseRef)
if ($LASTEXITCODE -ne 0 -or $releaseRows.Count -ne 1 -or
    ($releaseRows[0] -split '\s+')[0] -ne $currentRelease) {
  throw 'Release moved since preparation; prepare and review a new rollback candidate; STOP'
}
if ((git rev-parse "${approvedRollback}^{tree}").Trim() -ne $oldTree -or
    (git show -s --format=%P $approvedRollback).Trim() -ne $currentRelease) {
  throw 'Approved rollback tree or only parent differs; STOP'
}
git merge-base --is-ancestor $currentRelease $approvedRollback
if ($LASTEXITCODE -ne 0) { throw 'Rollback is not a fast-forward; STOP' }
git push $github "${approvedRollback}:refs/heads/unified-v2-release"
if ($LASTEXITCODE -ne 0) { throw 'Authorized ordinary release push failed; STOP' }
git ls-remote $github $releaseRef
```

Then require hosted build/deploy SUCCESS at the approved rollback SHA and verify the live manifest, cache/update behavior, saved rosters and desktop/mobile paths exactly as for a release. Do not clear current V2 localStorage/rosters to make a test pass.
