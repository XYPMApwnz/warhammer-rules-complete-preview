$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath('E:/Warhammer/qa-tmp/release-candidate-v4').TrimEnd([char]92)
$owner = 'E:/Warhammer/worktrees/polish-7-v1'
$out = 'E:/Warhammer/qa-evidence/release-candidate-v4-2026-11-22/CLEANUP.json'
$worktrees = @(
 @{Path='source';Head='9c18451452a478be2509314b6b80224313506ec9'},
 @{Path='candidate';Head='818d3b0c34503a166b58b21810666feafe858bc5'}
)
$ordinary = @('package-qa','qa-work','browser-profiles','browser-profiles-final','browser-temp','historical-updates')
$done = [Collections.Generic.List[string]]::new()
$status = 'PREFLIGHT';$reason = $null
function Bound([string]$relative) {
 $path = [IO.Path]::GetFullPath((Join-Path $root $relative)).TrimEnd([char]92)
 if(-not $path.StartsWith($root+[char]92,[StringComparison]::OrdinalIgnoreCase)){throw 'Target escaped owned task root'}
 return $path
}
function InvokeGitChecked([string[]]$Arguments) {
 $result = & git.exe -C $owner @Arguments 2>&1
 if($LASTEXITCODE-ne0){throw ('Git command failed: '+($result -join "`n"))}
 return ($result -join "`n")
}
try {
 $targets=@($worktrees|ForEach-Object {Bound $_.Path})+@($ordinary|ForEach-Object {Bound $_})
 foreach($path in $targets){
  if(-not(Test-Path -LiteralPath $path)){continue}
  $cursor=$path
  while($cursor){$entry=Get-Item -LiteralPath $cursor -Force;if($entry.Attributes-band[IO.FileAttributes]::ReparsePoint){throw ('Reparse ancestor refused: '+$cursor)};$cursor=[IO.Path]::GetDirectoryName($cursor)}
 }
 $junction=Bound 'candidate/node_modules'
 $link=Get-Item -LiteralPath $junction -Force
 $linkTargets=@($link.Target)
 if($link.LinkType-ne'Junction'-or$linkTargets.Count-ne1-or[IO.Path]::GetFullPath([string]$linkTargets[0]).TrimEnd([char]92)-ine[IO.Path]::GetFullPath('E:/Warhammer/worktrees/fast-first-load-v1/node_modules').TrimEnd([char]92)){throw 'Dependency junction differs'}
 foreach($t in $worktrees){
  $p=Bound $t.Path
  if((& git.exe -C $p rev-parse HEAD).Trim()-cne$t.Head-or$LASTEXITCODE-ne0){throw 'Checkout HEAD changed'}
  $state=& git.exe -C $p status --porcelain
  if($LASTEXITCODE-ne0-or$state){throw 'Checkout has changes'}
 }
 foreach($p in $targets){
  if(-not(Test-Path -LiteralPath $p)){continue}
  $stack=[Collections.Generic.Stack[string]]::new();$stack.Push($p)
  while($stack.Count){foreach($entry in [IO.Directory]::EnumerateFileSystemEntries($stack.Pop())){
   $item=Get-Item -LiteralPath $entry -Force
   if($item.Attributes-band[IO.FileAttributes]::ReparsePoint){if($item.FullName-ine$junction){throw ('Unexpected reparse entry: '+$entry)}}elseif($item.PSIsContainer){$stack.Push($entry)}
  }}
 }
 $processes=Get-CimInstance Win32_Process
 foreach($process in $processes){if($process.ProcessId-eq$PID){continue};foreach($p in $targets){foreach($value in @($process.CommandLine,$process.ExecutablePath)){if($value-and$value.Replace('/','\').IndexOf($p,[StringComparison]::OrdinalIgnoreCase)-ge0){throw ('Active process references cleanup target: '+$process.ProcessId)}}}}
 $refs=InvokeGitChecked -Arguments @('for-each-ref','--format=%(refname) %(objectname)')
 $previewBefore=Invoke-WebRequest -Uri 'http://127.0.0.1:8765/PAGES_RUNTIME_MANIFEST.json' -UseBasicParsing -TimeoutSec 15
 if($previewBefore.StatusCode-ne200){throw 'Existing preview not healthy'}
 if((InvokeGitChecked -Arguments @('worktree','list','--porcelain'))-match '(?m)^prunable(?: |$)'){throw 'Existing prunable metadata; do not prune unrelated worktrees'}
 # All checks complete. The only external junction is removed as a link, never recursively.
 Remove-Item -LiteralPath $junction -Force
 $done.Add($junction+' (junction only)')
 foreach($t in $worktrees){$p=Bound $t.Path;[void](InvokeGitChecked -Arguments @('worktree','remove','--force','--',$p));$done.Add($p)}
 foreach($name in $ordinary){$p=Bound $name;if(Test-Path -LiteralPath $p){Remove-Item -LiteralPath $p -Recurse -Force;$done.Add($p)}}
 if((InvokeGitChecked -Arguments @('for-each-ref','--format=%(refname) %(objectname)'))-cne$refs){throw 'Git references changed'}
 $previewAfter=Invoke-WebRequest -Uri 'http://127.0.0.1:8765/PAGES_RUNTIME_MANIFEST.json' -UseBasicParsing -TimeoutSec 15
 if($previewAfter.StatusCode-ne200-or$previewAfter.Content-cne$previewBefore.Content){throw 'Existing preview publication changed'}
 $status='PASS'
} catch {$status='STOPPED';$reason=$_.Exception.Message;throw}
finally {
 $receipt=@{status=$status;reason=$reason;completed=$done.ToArray();root=$root;kept=@('package for owner review','evidence working copy until report push');previewChanged=$false;protectedBranchesChanged=$false}
 $receipt|ConvertTo-Json -Depth 5|Set-Content -LiteralPath $out -Encoding utf8
 Write-Output ('Cleanup receipt: '+$out)
}
