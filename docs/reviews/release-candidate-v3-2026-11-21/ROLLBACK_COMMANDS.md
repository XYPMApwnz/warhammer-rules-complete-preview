# Rollback of this candidate after a separately authorized release

These commands are documentation only and were not executed. The current live release remains 1fd0b279051d76f1a262f7c8f117e35551b7de39; the preparation guard stops while it is still that release. If candidate e3db1b345eca989436eea7af758900eee7795203 is later published, prepare a new rollback commit on the then-current release, restore tree fb96adf457eef15e25030562261cae193db29f9c, push only a new rollback review branch, obtain Claude PASS/manual acceptance and separate owner authorization for the rollback SHA before its ordinary release FF. If another release intervenes, capture it again; never reuse a stale parent.

Source: tools/PAGES_RUNTIME_RELEASE.md at 6f2e5fb23643fc0041efcd7006f3e150bd5ce4be.

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
