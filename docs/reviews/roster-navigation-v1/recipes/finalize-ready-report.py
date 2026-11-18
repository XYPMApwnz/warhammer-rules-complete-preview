from pathlib import Path
import json,re

root=Path('E:/Warhammer/qa-evidence/roster-navigation-v1-2026-11-17')
def data(name): return json.loads((root/name).read_text(encoding='utf-8-sig'))
gate=data('FINAL_PREFLIGHT_RUN.json'); acceptance=data('FINAL_ACCEPTANCE.json'); target=data('POST_PREFLIGHT_TEST_RUN.json')
assert acceptance['status']=='PASS' and gate['passed']==178 and gate['failed']==1 and target['status']=='PASS'
sha=acceptance['finalSha']; minutes=gate['elapsedMs']/60000
s=(root/'REPORT_READY_DRAFT.md').read_text(encoding='utf8')
s=s.replace('# Roster navigation review — final evidence draft','# Roster navigation — READY_FOR_REVIEW')
s=re.sub(r'\*\*Review status: PENDING_FINAL_PREFLIGHT\.\*\*[^\n]+',f'**READY_FOR_REVIEW — `{sha}`.** The single full pre-FF on `880a98dbb9dd743f548fc1ed750093912628b570` completed in {minutes:.2f} minutes: **178 PASS / 1 FAIL**. The sole failure was an obsolete desktop-menu visibility expectation. Under the original task\'s explicit one-test-file completion exception, only that test changed afterward and its complete separate run passed **446 checks, 0 failures**. The run-to-delivery diff is exactly one test file; runtime, generated facts, and gameplay bytes are unchanged. The original failed run is retained verbatim and is not relabelled a fully green rerun.',s)
s=s.replace('| Final source commit for pre-FF |','| Exact commit of the one full pre-FF |')
s=s.replace('| Runtime cache revision |',f'| Final feature/review commit | `{sha}` |\n| Runtime cache revision |',1)
rows={
'| Full pre-FF |':f'| Full pre-FF | **178 PASS / 1 FAIL**, {minutes:.2f} min; sole corrected test **446/446 PASS**, 2.08 min; no second full run |',
'| Review publication, feature push |':f'| Review publication, feature push | Feature `{sha}` pushed; evidence branch `codex/roster-navigation-evidence`, one docs-only commit above this feature, never merged |',
'| Protected source/release refs |':'| Protected source/release refs | GitHub source remains `c477d20aaa16f850b56f18aa878d6b5fb8b4057f`; protected refs verified unchanged after feature push; no FF |',
'| Preview switch |':'| Preview switch | Final SHA, HTTP 200 on localhost and LAN; PID 41928; existing HTTPS/TLS unchanged |',
'| Cleanup |':'| Cleanup | Exact task-root removal rejected by automatic execution review; temporary directory retained, no deletion executed |',
}
s='\n'.join(next((replacement for prefix,replacement in rows.items() if line.startswith(prefix)),line) for line in s.splitlines())+'\n'
s=s.replace('The measured commit and final source commit differ only','The measured commit and the full-pre-FF commit differ only',1)
bridge=f'''\nThe delivery commit `{sha}` adds exactly one later **test-only** correction. [Run-to-delivery boundary proof](proofs/FINAL_TEST_ONLY_DIFF.json), [complete sole-test patch](proofs/POST_PREFLIGHT_TEST_ONLY.patch), and [diff stat](proofs/POST_PREFLIGHT_TEST_ONLY.stat.txt) prove that no application, package manifest, cache stamp, generated fact, or gameplay implementation changed after the full pre-FF. All runtime measurements/gallery captures therefore also cover the identical runtime at the delivery commit.\n\n```text\n{(root/'POST_PREFLIGHT_TEST_ONLY.stat.txt').read_text(encoding='utf8').strip()}\n```\n'''
s=s.replace('Five implementation commits, in dependency order:',bridge+'\nSix feature commits, in dependency order:',1)
s=s.replace('| `880a98dbb9dd743f548fc1ed750093912628b570` | chore: keep runtime dependency manifest serialization canonical |',f'| `880a98dbb9dd743f548fc1ed750093912628b570` | chore: keep runtime dependency manifest serialization canonical |\n| `{sha}` | test: verify visible desktop roster section navigation |')
s=s.replace('| New all-book UI guard | **206** checks across **18** contexts, nine books at 390/1440, including old-save admission |','| New all-book UI guard in full queue | **224** checks across **18** contexts, nine books at 390/1440, including old-save admission — [results](proofs/final-queue-navigation/RESULTS.json) |')
s=s.replace('| Integration | Completed targeted log retained — [log](proofs/integration-final.log); full queue status remains separately pending |','| Integration | **PASS**, 529/529 — [log](proofs/integration-final.log); its full-queue job also passed |')
s=s.replace('| Full pre-FF on `880a98db` | **PENDING — RUNNING**, 179 planned jobs; no aggregate PASS claimed |','| Full pre-FF on `880a98db` | **178 PASS / 1 FAIL**; all 179 jobs completed; failure and correction documented below |\n| New all-book navigation in that queue | **PASS**, 224 checks — [results](proofs/final-queue-navigation/RESULTS.json) |\n| Sole corrected existing test on final SHA | **PASS**, 446 checks, 0 failures — [results](proofs/post-preff-card-gained-5bc1b038/RESULTS.json), [log](proofs/post-preff-card-gained.log) |')
s=s.replace('The archive source is external `review-gallery/index.html`; the planned review destination is','The archive source is external `review-gallery/index.html`; the review destination is')
start=s.index('These are the complete approved migrations of pre-existing tests, not new factual expectations.')
end=s.index('\n\nFor 29 label/form files,',start)
s=s[:start]+f'These are the complete approved migrations of pre-existing tests, not new factual expectations. The baseline-to-final `{sha}` patch includes the sole post-pre-FF desktop visibility correction. [Full unabridged patch](approved-tests.patch) · [detailed audit](approved-tests.md) · [audit JSON](proofs/FINAL_EXISTING_TESTS.json).'+s[end:]
s=s.replace('The explicitly reviewed cosmetics relocation preserves','The explicitly reviewed gained-rules change replaces the obsolete desktop-hidden policy with visible exact-tab and physical-target click checks; its unchanged mobile check is reused verbatim. The explicitly reviewed cosmetics relocation preserves',1)
audit=(root/'FINAL_EXISTING_TESTS.md').read_text(encoding='utf8')
table_start=audit.index('| Test and final changed line starts |');table_end=audit.index('\n\n## Review details',table_start)
start=s.index('| Test and final changed line starts |');end=s.index('\n\nNo change outside',start)
s=s[:start]+audit[table_start:table_end]+s[end:]
s=s.replace('No unresolved application functional failure is identified in the completed targeted evidence; the full queue can still reveal an additional issue and is not assumed green.','The completed queue found only the obsolete desktop local-menu visibility expectation. Its corrected complete test passed separately; no application code was changed after the full run. The raw full-run FAIL remains in the archived evidence.')
start=s.index('## Final gate, elapsed time, and delivery checklist')
s=s[:start]+f'''## Final checks, sole test correction, and delivery

| Record | Exact result |
|---|---|
| Single full pre-FF commit | `880a98dbb9dd743f548fc1ed750093912628b570` |
| Sequential queue | All **179** jobs completed: **178 PASS / 1 FAIL** |
| Start / finish UTC | `{gate['startedUtc']}` / `{gate['finishedUtc']}` |
| Full-run time | **{minutes:.2f} minutes** ({gate['elapsedMs']:,} ms) |
| Sole raw failure | `v2/card-gained-rules-browser-qa.mjs:243`, `Preserve the existing hidden desktop local-navigation policy`; actual `flex`, expected `none` |
| Cause | Obsolete UI policy; the accepted roster-card section menu is immediately visible on desktop |
| Correction | Only this test file: require `flex`, visible exact Gained rules tab, click, then the unchanged exact mobile physical-section/heading visibility check |
| Preserved | Every numeric/source/recipient/scope/text/gameplay check and all mobile checks; the independent reverse audit recovers every other original line |
| Separate complete test | **446 PASS / 0 FAIL**, {target['elapsedMs']/1000:.3f} s, on `{sha}`; no viewport/scenario filtering |
| Run-to-delivery diff | One test file, **4 insertions / 2 deletions**; no application or generated byte changed |
| Final feature SHA / tree | `{sha}`, clean |
| Final completion path | **PASS** under the original task's one-test-file exception; **not** a claim of a second fully green pre-FF |
| Generated gate in the full queue | **147/147 byte-identical**, 67 normal producer steps; 1,331,614 ms including queue overhead |
| All-nine gameplay A/B | **199 rosters / 507 frames**, **0 differences** |
| New navigation browser test in full queue | **224/224 PASS**, 18 contexts, nine books, 390/1440 |
| Runtime package | **453 files**, **219** mandatory URLs, revision `a4ab4bdc382e9a00`; normal final-SHA build and `--check` PASS |
| Package bytes | `282918911`; content SHA-256 `2b1e393cf757df0f55b3fb3c1871e6c0ed4f0941a13b57b8e425b33a374f15ec`, identical to measured/pre-FF runtime |
| Feature publication | `codex/roster-navigation-v1` pushed normally at `{sha}` |
| Evidence publication | `codex/roster-navigation-evidence`: exactly one documentation/assets commit above `{sha}`; never merged; exact remote SHA is reported with delivery `git ls-remote` |
| Protected refs | Source still `c477d20aaa16f850b56f18aa878d6b5fb8b4057f`; source/main/release/Pages not changed by this task |
| Preview | `http://localhost:8765/` and `http://192.168.1.124:8765/`: **200**, exact final SHA in `X-Preview-Package`; PID **41928**, managed session **37596** |
| Preview HTTPS | Existing `https://192.168.1.124:8443/`, unchanged key/certificate and server behavior |
| Owned temporary directory | `E:/Warhammer/qa-tmp/roster-navigation` retained: removal rejected as **blocked by policy**; no deletion executed |

The original task expressly allows showing the one-test-file run-to-final diff and running that test separately instead of a second full pre-FF. The acceptance record verifies the exact original failed leaf, all other 178 passing leaves, the clean original run tree, the single changed test path, and the complete corrected test's PASS/zero failures. It preserves the original run and makes no aggregate-rerun claim.

[Final acceptance](proofs/FINAL_ACCEPTANCE.json) · [original full-run wrapper](proofs/FINAL_PREFLIGHT_RUN.json) · [all 179 job commands, statuses, and times](proofs/pre-ff-final-880a98db/RESULTS.json) · [original console](proofs/pre-ff-console.log) · [corrected test wrapper](proofs/POST_PREFLIGHT_TEST_RUN.json) · [corrected complete test](proofs/post-preff-card-gained-5bc1b038/RESULTS.json) · [single-file patch](proofs/POST_PREFLIGHT_TEST_ONLY.patch) · [single-file diff stat](proofs/POST_PREFLIGHT_TEST_ONLY.stat.txt) · [final clean-tree proof](proofs/FINAL_TREE_VERIFICATION.json).

[Live-preview checks](proofs/PREVIEW_CHECK.json) · [preview process/package](proofs/PREVIEW_STATUS.json) · [protected refs before push](proofs/PROTECTED_REFS_BEFORE_PUSH.txt) · [protected refs after feature push](proofs/PROTECTED_REFS_AFTER_FEATURE_PUSH.txt) · [cleanup outcome](proofs/CLEANUP_STATUS.json).

The review archive is `docs/reviews/roster-navigation-v1/`: this report, `GALLERY.html`, images/index, equipment inventory, full approved test diff/audit, and selected proofs including every final queue log. Archive-local `.gitattributes` preserves the exact evidence bytes without Git newline conversion; `ARCHIVE_MANIFEST.json` records their sizes and SHA-256 values. No source repository clone, accepted RAW/candidate capture, private contact detail, or runtime package is included in the archive. The published site package remains the explicit runtime-only package.

No protected-source fast-forward, release mutation, or Pages deployment was performed. Independent review and the owner's separate exact-SHA authorization remain required before any protected-branch update.
'''
assert 'PENDING_' not in s and 'RUNNING / PENDING' not in s
(root/'REPORT.md').write_text(s,encoding='utf8')
print(json.dumps({'status':'READY_FOR_REVIEW','sha':sha,'report':str(root/'REPORT.md'),'bytes':len(s.encode('utf8'))}))
