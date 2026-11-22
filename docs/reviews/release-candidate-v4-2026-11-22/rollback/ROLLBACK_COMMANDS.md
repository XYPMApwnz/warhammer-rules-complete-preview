# Rollback data for release candidate v4

Read-only snapshot: 2026-11-22T08:57:14.280384+00:00. No rollback commit, branch, push, workflow dispatch or Pages change was performed.

Current release is `e3db1b345eca989436eea7af758900eee7795203`; its tree is **`74a8064e67dafa06b20120ef5563da176db6d793`**. This is the old tree to restore if candidate `818d3b0c34503a166b58b21810666feafe858bc5` (`codex/release-candidate-818d3b0c`) is later published and needs rollback. The old tree is **not** the older 1fd0b279 tree.

Latest Pages run: [44863910786](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/44863910786), at e3db1b34, build and deploy SUCCESS. Deployment 7958227298 became successful at 2026-11-21T04:01:49Z. The live HTTPS manifest still returns HTTP 200, contentSha256 `0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909`, revision `d08e23b961b6f507`, 456 inventory files.

The authenticated Actions artifact API lists **zero artifacts** for both e3db1b34/run44863910786 and 1fd0b279/run40496093519. No downloadable prior Pages artifact can currently be used for rollback. Zero entries do not establish whether an artifact expired or was deleted. A successful deployment is not proof of retained downloadable artifacts.

## Proposed preparation commands — NOT EXECUTED

Per tools/PAGES_RUNTIME_RELEASE.md, prepare a new commit with the old release tree and the then-current release as its only parent. This preserves fast-forward history. Do not reset, force-push, dispatch an old workflow or replace deployed files manually. These commands are for a future separately requested rollback investigation; they push only a new review branch. Use the same public automation identity as candidate preparation; the command sets it for this operation only.

```powershell
$ErrorActionPreference = 'Stop'
$github = 'https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git'
$releaseRef = 'refs/heads/unified-v2-release'
$oldRelease = 'e3db1b345eca989436eea7af758900eee7795203'
$expectedOldTree = '74a8064e67dafa06b20120ef5563da176db6d793'
$expectedPublishedCandidate = '818d3b0c34503a166b58b21810666feafe858bc5'

git fetch --no-tags $github $releaseRef
if ($LASTEXITCODE -ne 0) { throw 'Release fetch failed; STOP' }
$currentRelease = (git rev-parse FETCH_HEAD).Trim()
if ($currentRelease -eq $oldRelease) { throw 'Release is already e3db1b34; no rollback is needed; STOP' }
if ($currentRelease -ne $expectedPublishedCandidate) { throw 'Release differs from the v4 rollback context; obtain a fresh review; STOP' }
$oldTree = (git rev-parse "${oldRelease}^{tree}").Trim()
if ($LASTEXITCODE -ne 0 -or $oldTree -ne $expectedOldTree) { throw 'Old tree unavailable or changed; STOP' }
$rollbackSha = (git -c user.name=Codex -c user.email=codex@openai.com commit-tree $oldTree -p $currentRelease -m "Rollback candidate: restore $oldRelease over $currentRelease").Trim()
if ($LASTEXITCODE -ne 0) { throw 'Rollback commit creation failed; STOP' }
if ((git rev-parse "${rollbackSha}^{tree}").Trim() -ne $oldTree -or
    (git show -s --format=%P $rollbackSha).Trim() -ne $currentRelease) {
  throw 'Rollback tree or only parent differs; STOP'
}
$reviewBranch = 'codex/rollback-candidate-' + $rollbackSha.Substring(0, 8)
$existing = @(git ls-remote $github "refs/heads/$reviewBranch")
if ($LASTEXITCODE -ne 0 -or $existing.Count -ne 0) { throw 'Review branch is not new; STOP' }
git push $github "${rollbackSha}:refs/heads/$reviewBranch"
if ($LASTEXITCODE -ne 0) { throw 'Review push failed; STOP' }
Write-Output "Rollback SHA: $rollbackSha; tree: $oldTree; parent: $currentRelease; review: $reviewBranch"
```

Package/test that exact rollback candidate, obtain Claude PASS and the owner's manual acceptance of its behavior and saved-roster compatibility, and wait for separate owner authorization naming the exact rollback SHA. Restoring e3db1b34 also restores its known first-load/offline behavior and does not permit clearing player data.

## Release step — ONLY AFTER separate exact-SHA authorization

Restore the exact recorded preparation variables. The placeholder below is intentionally not an approval.

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

Then require hosted build/deploy SUCCESS on the approved rollback SHA and verify the live HTTPS manifest, nine books, Core, glossary, saved DG/SM rosters, offline/update behavior and desktop/mobile paths. No such action is authorized or performed by this report.
