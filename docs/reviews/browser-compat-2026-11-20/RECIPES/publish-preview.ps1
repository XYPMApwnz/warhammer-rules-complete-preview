$ErrorActionPreference = 'Stop'
$repo = 'E:/Warhammer/worktrees/browser-compat-v1'
$out = 'E:/Warhammer/qa-evidence/browser-compat-v1-2026-11-20'
$previewRoot = 'E:/Warhammer/qa-tmp/preview-v1'
$expected = 'b0aa1273b907020776dec41ca0466d646e5435e2'
$base = '9876164de85f1e35aa2cf070a3eb9de662093980'
$package = Join-Path $previewRoot 'package-browser-compat-b0aa1273'
$record = Get-Content -LiteralPath "$out/PRE_FF_RUN.json" -Raw | ConvertFrom-Json
if ($record.status -ne 'PASS' -or $record.passed -ne 202 -or $record.failed -ne 0 -or $record.sha -ne $expected -or $record.headAfter -ne $expected -or $record.treeAfter -ne '') { throw 'Exact complete pre-FF must pass before preview handoff' }
if ((git -C $repo rev-parse HEAD).Trim() -ne $expected -or (git -C $repo status --porcelain)) { throw 'Feature changed after pre-FF' }
$old = Get-Content -LiteralPath "$previewRoot/CURRENT_PREVIEW.json" -Raw | ConvertFrom-Json
if ($old.sha -ne $base -or $old.pid -ne 9344 -or [IO.Path]::GetFullPath($old.stopFile) -ne [IO.Path]::GetFullPath("$previewRoot/STOP-polish-6-9876164d")) { throw 'Unexpected current preview; inspect rather than stopping another process' }
$oldProcess = Get-CimInstance Win32_Process -Filter 'ProcessId = 9344'
$expectedOldCommand = '"C:\Program Files\nodejs\node.exe" E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20/RECIPES/start-reviewed-preview-final.mjs'
if (-not $oldProcess -or $oldProcess.Name -ne 'node.exe' -or $oldProcess.CommandLine -ne $expectedOldCommand) { throw 'Old preview identity not proven' }
node "$repo/tools/pages-runtime-package.mjs" --source $repo --out $package
if ($LASTEXITCODE -ne 0) { throw 'Package build failed' }
node "$repo/tools/pages-runtime-package.mjs" --source $repo --out $package --check
if ($LASTEXITCODE -ne 0) { throw 'Package byte check failed' }
$acceptedHash = (Get-FileHash -LiteralPath "$out/pre-ff/RUNTIME_MANIFEST.json" -Algorithm SHA256).Hash
$actualHash = (Get-FileHash -LiteralPath "$package/PAGES_RUNTIME_MANIFEST.json" -Algorithm SHA256).Hash
if ($actualHash -ne $acceptedHash) { throw 'Preview differs from the exact tested publication; old preview remains running' }
$remote = @(git -C $repo ls-remote https://github.com/XYPMApwnz/warhammer-rules-complete-preview.git refs/heads/codex/unified-v2-source)
if ($LASTEXITCODE -ne 0 -or $remote.Count -ne 1 -or ($remote[0] -split '\s+')[0] -ne $base) { throw 'Remote source changed; inspect before preview handoff' }
[IO.File]::WriteAllText($old.stopFile, "Reviewed preview handoff after 202/202 PASS`n")
for ($i = 0; $i -lt 20; $i++) {
  if (-not (Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 8765,8443 })) { break }
  Start-Sleep -Milliseconds 500
}
if (Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 8765,8443 }) { throw 'Old server has not released preview ports; no process was killed' }
$started = Start-Process node.exe -ArgumentList "$out/RECIPES/start-reviewed-preview.mjs" -WindowStyle Hidden -PassThru -RedirectStandardOutput "$out/preview-stdout.log" -RedirectStandardError "$out/preview-stderr.log"
$state = $null
for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Milliseconds 500
  $state = Get-Content -LiteralPath "$previewRoot/CURRENT_PREVIEW.json" -Raw | ConvertFrom-Json
  if ($state.sha -eq $expected -and $state.status -eq 'RUNNING') { break }
}
if ($state.sha -ne $expected -or $state.status -ne 'RUNNING' -or $state.pid -ne $started.Id) { throw 'New preview did not report the exact reviewed SHA' }
$response = Invoke-WebRequest -UseBasicParsing -Uri $state.lan -TimeoutSec 15
if ([int]$response.StatusCode -ne 200) { throw 'LAN preview did not return HTTP200' }
$listeners = @(Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 8765,8443 })
if ($listeners.Count -ne 2 -or @($listeners | Where-Object { $_.LocalAddress -ne '0.0.0.0' -or $_.OwningProcess -ne $started.Id }).Count) { throw 'Both preview listeners must belong to the new process on all IPv4 interfaces' }
$publication = [ordered]@{status='PASS'; feature=$expected; verifiedAt=[DateTime]::UtcNow.ToString('o'); preview=$state; packageMatchesExactPreff=$true; manifestSha256=$actualHash.ToLowerInvariant(); http=@{url=$state.lan; status=[int]$response.StatusCode}; listeners=@($listeners | Select-Object LocalAddress,LocalPort,OwningProcess); remoteSource=$base; fastForwardPerformed=$false; networkOrTlsChanged=$false}
[IO.File]::WriteAllText("$out/PUBLICATION.json", ($publication | ConvertTo-Json -Depth 15), [Text.UTF8Encoding]::new($false))
$publication | ConvertTo-Json -Depth 15
