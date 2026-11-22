# Owner-run reviewed preview replacement. Not executed by Codex: automatic policy rejected it.
$ErrorActionPreference = 'Stop'
$evidence = 'E:\Warhammer\qa-evidence\visual-polish-v1-2026-11-22'
$currentFile = 'E:\Warhammer\qa-tmp\preview-v1\CURRENT_PREVIEW.json'
$old = Get-Content -LiteralPath $currentFile -Raw | ConvertFrom-Json
$proof = Get-Content -LiteralPath (Join-Path $evidence 'FINAL_VERIFICATION.json') -Raw | ConvertFrom-Json
if ($proof.status -ne 'PASS' -or $proof.sha -ne '9e04d5d43240795979d0257a27ba4c35cd2259f6' -or $proof.preff.passed -ne 213) { throw 'Final verification differs; STOP' }
if ($old.pid -ne 1348 -or $old.sha -ne 'e08ec20df980d4e6700c32b65069de983b250e03' -or $old.stopFile -ne 'E:\Warhammer\qa-tmp\preview-v1\STOP-fast-first-load-e08ec20d') { throw 'Current preview identity changed; STOP' }
$current = Get-CimInstance Win32_Process -Filter 'ProcessId=1348'
if ($current.CommandLine -notlike '*fast-first-load-v1-2026-11-21/RECIPES/start-reviewed-preview.mjs*') { throw 'Preview process differs; STOP' }
Copy-Item -LiteralPath $currentFile -Destination (Join-Path $evidence 'PREVIEW_BEFORE.json')
Set-Content -LiteralPath $old.stopFile -Value 'Owner requested reviewed visual-polish replacement after213/213PASS' -Encoding utf8
for ($attempt = 0; $attempt -lt 15; $attempt++) {
  if (-not (Get-NetTCPConnection -State Listen -LocalPort 8765,8443 -ErrorAction SilentlyContinue)) { break }
  Start-Sleep -Seconds 1
}
if (Get-NetTCPConnection -State Listen -LocalPort 8765,8443 -ErrorAction SilentlyContinue) { throw 'Ports remain occupied; STOP' }
$started = Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList (Join-Path $evidence 'RECIPES\start-reviewed-preview.mjs') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $evidence 'PREVIEW_STDOUT.txt') -RedirectStandardError (Join-Path $evidence 'PREVIEW_STDERR.txt') -PassThru
Start-Sleep -Seconds 2
if ($started.HasExited) { Get-Content -LiteralPath (Join-Path $evidence 'PREVIEW_STDERR.txt'); throw 'Preview start failed; STOP' }
$response = Invoke-WebRequest -Uri 'http://192.168.1.124:8765/' -TimeoutSec 20
$manifest = Invoke-RestMethod -Uri 'http://192.168.1.124:8765/PAGES_RUNTIME_MANIFEST.json' -TimeoutSec 20
if ($response.StatusCode -ne 200 -or $manifest.contentSha256 -ne '2b3643a912a65dcdf285d5a8de5647d8c0bf2f156f39d1db920f4d108cf4f1c0') { throw 'Preview verification failed; STOP' }
Get-Content -LiteralPath (Join-Path $evidence 'PREVIEW_STATUS.json')
Write-Output ('HTTP status: '+$response.StatusCode)
