$ErrorActionPreference = 'Stop'
$target = 'E:\Warhammer\qa-tmp\visual-polish'
$evidence = 'E:\Warhammer\qa-evidence\visual-polish-v1-2026-11-22'
$repository = 'E:\Warhammer\worktrees\visual-polish-v1'
$expectedSha = '9e04d5d43240795979d0257a27ba4c35cd2259f6'
$proof = Get-Content -LiteralPath (Join-Path $evidence 'FINAL_VERIFICATION.json') -Raw | ConvertFrom-Json
if ($proof.status -ne 'PASS' -or $proof.sha -ne $expectedSha -or $proof.preff.passed -ne 213) { throw 'Final successful verification is required before cleanup.' }
$preview = Get-Content -LiteralPath (Join-Path $evidence 'PREVIEW_STATUS.json') -Raw | ConvertFrom-Json
if ($preview.status -ne 'RUNNING' -or $preview.sha -ne $expectedSha) { throw 'Reviewed persistent preview must be running first.' }
$expectedPath = [System.IO.Path]::GetFullPath($target).TrimEnd('\')
if ($expectedPath -cne 'E:\Warhammer\qa-tmp\visual-polish') { throw 'Cleanup boundary differs.' }
if (-not (Test-Path -LiteralPath $target)) { Write-Output 'Task temporary directory already absent.'; exit 0 }
$item = Get-Item -LiteralPath $target -Force
if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Cleanup root must not be a link.' }
$resolved = (Resolve-Path -LiteralPath $target).ProviderPath.TrimEnd('\')
if ($resolved -ine $expectedPath) { throw 'Resolved cleanup root differs.' }
if ([IO.Path]::GetFullPath([string]$preview.root).StartsWith($expectedPath+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Preview root is protected.' }
$escaped = [Regex]::Escape($expectedPath)
$active = @(Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -and $_.CommandLine.Replace('/','\') -match $escaped })
if ($active.Count) { throw ('Task temporary paths still used by processes: '+($active.ProcessId -join ', ')) }
$registered = @(& git -C $repository worktree list --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'Cannot verify worktree ownership.' }
$worktrees = @($registered | Where-Object { $_.StartsWith('worktree ') } | ForEach-Object { $_.Substring(9).Replace('/','\') } | Where-Object { $_.StartsWith($expectedPath+'\',[StringComparison]::OrdinalIgnoreCase) })
$links = @(Get-ChildItem -LiteralPath $target -Recurse -Force -Attributes ReparsePoint -ErrorAction Stop)
foreach ($entry in @($worktrees)+@($links.FullName)) {
  if ([string]::IsNullOrEmpty($entry)) { continue }
  if (-not [IO.Path]::GetFullPath($entry).StartsWith($expectedPath+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'A cleanup child escapes the approved task directory.' }
}
# All boundary, process and preview checks above run before the first deletion.
$freeBefore = (Get-PSDrive -Name E).Free
foreach ($worktree in $worktrees) {
  & git -C $repository worktree remove --force $worktree
  if ($LASTEXITCODE -ne 0) { throw ('Owned task worktree removal failed: '+$worktree) }
}
foreach ($link in $links) {
  if (Test-Path -LiteralPath $link.FullName) { Remove-Item -LiteralPath $link.FullName -Force }
}
Remove-Item -LiteralPath $target -Recurse -Force
$result = [ordered]@{ status='PASS'; removed=$target; previewProtected=$preview.root; freeBeforeBytes=$freeBefore; freeAfterBytes=(Get-PSDrive -Name E).Free }
$result | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $evidence 'CLEANUP.json') -Encoding utf8
$result | ConvertTo-Json -Depth 3
