from pathlib import Path
import subprocess
import json
import re
import hashlib

root=Path('E:/Warhammer/worktrees/roster-navigation-v1')
out=Path('E:/Warhammer/qa-evidence/roster-navigation-v1-2026-11-17')
base='c477d20aaa16f850b56f18aa878d6b5fb8b4057f'
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode('utf8').strip()
manifest=json.loads((out/'EXISTING_BROWSER_TEST_MIGRATION.json').read_text(encoding='utf8'))
files=list(dict.fromkeys(row['file'] for row in manifest))
assert len(files)==31
def git(*args):
    return subprocess.check_output(['git',*args],cwd=root).decode('utf8')
def sha(value):
    return hashlib.sha256(value.encode('utf8')).hexdigest()
assert git('rev-parse','HEAD').strip()==head
assert git('status','--porcelain').strip()==''
rows=[]
for file in files:
    original=git('show',base+':'+file).replace('\r\n','\n')
    current=git('show',head+':'+file).replace('\r\n','\n')
    diff=git('diff','--unified=0',base,head,'--',file)
    assert diff,file
    changes=[{'beforeLine':int(a),'afterLine':int(b)} for a,b in re.findall(r'^@@ -(\d+)(?:,\d+)? \+(\d+)',diff,re.M)]
    if file=='v2/shell-browser-qa.mjs':
        # Review the only relocated panel interaction. Every old assertion line
        # is retained verbatim; no source/recipient/value expectation is reset.
        assert all(line.strip() in current for line in original.splitlines() if 'assert.' in line)
        start=current.index('      const physicalUrl=page.url();')
        end=current.index("      await popupGeometry(page,'dialog.v2-related-dialog[open] .related-rules-dialog');",start)
        body=current[:start]+"      await page.locator('main .ds-related-rules-button').first().click();await page.waitForSelector('dialog.v2-related-dialog[open]');\n"+current[end:]
        start=body.index("      await page.locator('[data-v2-primary-nav] [data-v2-destination=\"ROSTER\"]').click();await active(page,book);",body.index('const physicalUrl') if 'const physicalUrl' in body else body.index('shell-${book}-related-${device}'))
        end=body.index("      assert.equal(new URL(page.url()).searchParams.get('instance'),'parsed-unit-1');",start)
        body=body[:start]+body[end:]
        assert body==original,'Out-of-scope shell change'
        before='Compatible Stratagems & Enhancements dialog opened on parsed-unit-1 roster card.'
        after='Assert removed roster button/label absent, open the actual Full Army Book button and same canonical datasheet, retain dialog geometry/tab/close checks, return via Roster/Open card, and assert the complete original physical URL plus existing instance/effective-reference checks.'
        why='The user removed this panel only from roster cards; its Full Army Book consumer remains supported.'
        audit='Original assertion lines unchanged; only the reviewed panel interaction moved.'
    elif file.endswith('route-context-synthetic-browser-qa.mjs'):
        body=current.replace("page.locator('.toc-bottom-shortcuts button, .toc-shortcuts button')", "page.locator('.toc-shortcuts button')")
        body=body.replace("if(!await control.isVisible())await page.locator('#navMenu').click();", "if(!await control.isVisible())await page.getByRole('button',{name:'Open navigation',exact:true}).click();")
        assert body==original,'Out-of-scope synthetic route change'
        before='Attachment Setup/Roster searched only in .toc-shortcuts; mobile drawer selected by Open navigation name.'
        after='Search bottom shortcuts and the retained full-book shortcuts; open the same #navMenu control across Units/Open navigation labels.'
        why='Attachment Setup moved to the bottom, and the roster drawer has a new accessible label.'
        audit='All remaining source and every original guard/assertion are byte-equivalent after newline normalization.'
    else:
        marker=re.search(r'\n\nasync function (?:openCard|openImportForm)\(',current)
        assert marker,file
        expected_helpers=[]
        if 'async function openCard(' in current:
            if file.startswith('tests/browser/'):
                expected_helpers.append("async function openCard(page){\n  assert.equal(await page.getByRole('button',{name:'Effective datasheet',exact:true,includeHidden:true}).count(),0,'Removed card label is absent');\n  await page.getByRole('button',{name:'Open card',exact:true}).first().click();\n}")
            else:
                expected_helpers.append("async function openCard(page,owner){\n  assert.equal(await page.getByRole('button',{name:'Effective datasheet',exact:true,includeHidden:true}).count(),0,'Removed card label is absent');\n  await owner.getByRole('button',{name:'Open card',exact:true}).click();\n}")
        if 'async function openImportForm(' in current:
            expected_helpers.append("async function openImportForm(page){\n  await page.locator('[data-roster-view]').waitFor();\n  const raw=page.locator('[data-roster-input=\"raw-text\"]');\n  if(!await raw.isVisible())await page.locator('details[data-roster-import] > summary').filter({hasText:/^Import another roster$/}).click();\n  await raw.waitFor();\n}")
        assert current[marker.start():].strip()=='\n\n'.join(expected_helpers),'Unreviewed appended helper: '+file
        body=current[:marker.start()]
        body=re.sub(r'await openImportForm\((?:page|p|sibling)\);','',body)
        pattern=r'await openCard\((?P<page>page|p),(?P<owner>(?:page|p)\.locator\([^;\r\n]*?\))\)'
        body=re.sub(pattern,lambda match:'await '+match['owner']+".getByRole('button',{name:'Effective datasheet',exact:true}).click()",body)
        body=body.replace('await openCard(p)',"await p.getByRole('button',{name:'Effective datasheet',exact:true}).first().click()")
        expected=original.replace("await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();", "await page.locator('[data-roster-view]').waitFor();")
        before_parts=[];after_parts=[];why_parts=[]
        if "name:'Effective datasheet'" in original:
            before_parts.append('Open the exact physical owner using Effective datasheet.')
            after_parts.append('Open the same owner using Open card; assert the old label is absent including hidden controls.')
            why_parts.append('Authorized action-label change.')
        if 'async function openImportForm(' in current:
            before_parts.append('Fill the existing raw-text input directly; some Setup helpers await that input.')
            after_parts.append('Before the same fills, wait for unique [data-roster-view] and open actual details[data-roster-import] through Import another roster only when raw input is hidden.')
            why_parts.append('Successful imports now fold the form; no new fixture or import scenario.')
        elif "getByRole('textbox'" in original:
            before_parts.append('Wait for the visible import textbox as Setup readiness.')
            after_parts.append('Wait for the unique [data-roster-view] owner, allowing the form to remain folded.')
            why_parts.append('Authorized layout/readiness relocation.')
        if file=='v2/cards-cosmetics-browser-qa.mjs':
            body=body.replace("const menu=page.locator('#navMenu');", "const menu=page.getByRole('button',{name:'Open navigation',exact:true});")
            body=body.replace("node.locator(':scope > summary, h2').first()", "node.locator('h2').first()")
            # This is the explicitly authorized Warlord UI relocation. Verify
            # the exact new observation block before recovering the old one.
            new_prefix="""await check(6,book,width,async()=>{assert.equal(await page.locator('[data-roster-warlord-select]').count(),1,'Warlord has one roster-wide control');
     assert.equal(await page.locator('.v2-roster-instance dt').filter({hasText:/^Warlord$/}).count(),0,'Removed per-unit Warlord captions are absent');
     const selected=await page.locator('[data-roster-warlord-select]').inputValue();
     const labels=await page.locator('.v2-roster-instance').evaluateAll((nodes,selected)=>nodes.map(node=>selected?(node.dataset.rosterInstanceId===selected?'Yes':'No'):'Not set'),selected);
     """
            assert new_prefix in body,'Unreviewed Warlord observation change'
            old_start=original.index('await check(6,book,width,async()=>{')
            old_end=original.index("if(book==='death-guard')assert.deepEqual(labels,",old_start)
            body=body.replace(new_prefix,original[old_start:old_end])
            before_parts.append('Import-pane screenshot scrolls to h2; warnings read from open pane; Warlord labels read from each unit dt; drawer found by old name.')
            after_parts.append('Screenshot scrolls to actual summary/h2 and disclosure is opened before identical warning checks. Warlord labels derive from the actual selected instance and original rendered unit order; exact nine Yes/No DG array and all Not set expectations remain. Assert exactly one Warlord control and zero removed per-unit captions. Use #navMenu.')
            why_parts.append('Authorized heading/form and single roster-wide Warlord-control relocation; no changed owner, ordinal, or expected label values.')
        if file=='v2/card-gained-rules-browser-qa.mjs':
            desktop_start=body.index("        assert.equal(await card.locator('.local-nav').evaluate(node=>getComputedStyle(node).display),'flex','Roster section navigation is visible on desktop');")
            desktop_end=body.index("        navigation={mode:'visible-desktop-clicked',target};",desktop_start)+len("        navigation={mode:'visible-desktop-clicked',target};")
            desktop=body[desktop_start:desktop_end]
            assert "assert(await tab.isVisible(),'Desktop Gained rules navigation is player-visible');" in desktop
            mobile_click=original[original.index('        await tab.click();await page.waitForFunction('):].split('\n',1)[0]
            assert mobile_click in desktop,'Desktop must keep the same exact physical section/heading visibility check as mobile'
            assert len(desktop.splitlines())==4,'Only the exact desktop navigation assertion and interaction change'
            old_start=original.index("        assert.equal(await card.locator('.local-nav').evaluate(node=>getComputedStyle(node).display),'none','Preserve the existing hidden desktop local-navigation policy');")
            old_end=original.index("        navigation={mode:'existing-hidden-desktop-policy',target};",old_start)+len("        navigation={mode:'existing-hidden-desktop-policy',target};")
            body=body[:desktop_start]+original[old_start:old_end]+body[desktop_end:]
            before_parts.append('Require desktop local navigation display:none; mobile already clicks the exact Gained rules tab and validates its physical section.')
            after_parts.append('Require desktop display:flex and the exact Gained rules tab visible; click it and use the unchanged mobile physical-target/heading visibility check. Mobile and every factual/value/scope check remain unchanged.')
            why_parts.append('The accepted immediate roster-card section menu includes desktop. Sole test-only correction after the full pre-FF; no runtime or generated byte changed.')
        assert body.rstrip()==expected.rstrip(),'STOP: source outside approved migration changed: '+file
        before=' '.join(before_parts)
        after=' '.join(after_parts)
        why=' '.join(why_parts)
        audit='Original source recovered exactly after reversing enumerated UI migrations (newline-normalized); no numeric/source/identity/factual expectation change.'
    rows.append({'file':file,'changes':changes,'before':before,'after':after,'why':why,'audit':audit,'baselineFileSha256':sha(original),'finalFileSha256':sha(current)})

patch=git('diff','--full-index',base,head,'--',*files)
(out/'FINAL_EXISTING_TESTS.patch').write_bytes(patch.encode('utf8'))
baseline_log=(out/'base-synthetic-diagnostic.log').read_text(encoding='utf8')
head_log=(out/'targeted-3-route-context-synthetic-browser-qa.mjs.log').read_text(encoding='utf8')
failure='Error: Failed to load resource: the server responded with a status of 404 (Not Found)'
assert failure in baseline_log and failure in head_log
report={'schema':'roster-navigation-existing-test-audit/v1','baseline':base,'finalCommit':head,'files':len(rows),'review':'NO_OUT_OF_SCOPE_EXPECTATION_CHANGE_FOUND','testsRunByThisAudit':False,'buildsRunByThisAudit':False,'sourceTreeClean':True,
 'scope':'31 pre-existing browser tests only; new tests and production files excluded from this patch',
 'preserved':['canonical and physical IDs','sourceInstanceId','recipients','scope IDs','factual rule text','numeric values','source hashes','negative and mutation controls','exact DG nine-element Warlord Yes/No array and Not set expectations','shell exact instance and effective-reference checks'],
 'knownFailure':{'test':'books/shared/army-book-app-v2/route-context-synthetic-browser-qa.mjs','status':'KNOWN_BASELINE_FAILURE_NOT_FIXED','message':failure,'baselineCommit':base,'baselineLog':'base-synthetic-diagnostic.log','featureLog':'targeted-3-route-context-synthetic-browser-qa.mjs.log','guardsPreserved':True,'note':'Existing evidence reproduced the same HTTP 404 at the unchanged console-error guard on baseline c477 and feature. This audit did not rerun it or claim PASS.'},
 'patch':'FINAL_EXISTING_TESTS.patch','patchSha256':sha(patch),'rows':rows}
(out/'FINAL_EXISTING_TESTS.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
md=['# Final existing-browser-test changes','',f'Baseline: `{base}`. Final clean committed source: `{head}`.',
 'Read-only source audit; no test, browser, or build was run for this audit. This file and patch cover exactly the 31 pre-existing browser tests; new tests and production changes are outside this patch.',
 'Review result: no expectation change outside the authorized label, layout, disclosure, and Warlord-control relocation was found. Canonical/physical IDs, sourceInstanceId, recipients, scope IDs, factual text/values, source hashes, and all existing numeric, negative, and mutation controls remain unchanged.',
 '', '| Test and final changed line starts | Before | After | Why |', '|---|---|---|---|']
for row in rows:
    location=row['file']+':'+', '.join(str(change['afterLine']) for change in row['changes'])
    md.append('| `'+location+'` | '+row['before'].replace('|','\\|')+' | '+row['after'].replace('|','\\|')+' | '+row['why'].replace('|','\\|')+' |')
md+=['', '## Review details', '',
 'For the 29 label/form files, reversing only the enumerated migrations recovers the original source exactly after newline normalization. The cards-cosmetics exception additionally verifies the exact authorized Warlord observation block and snapshot/disclosure interaction before reversal. Its original DG expected array remains `No, Yes, No, No, No, No, No, No, No`; every other book still requires all `Not set`. The card-gained-rules exception verifies the four-line desktop visibility/click block against the unchanged exact mobile physical-target/heading check before reversing it; every remaining original line is recovered.',
 'The Warlord observation uses the actual visible roster-wide selector value and actual rendered physical instance order. It is not obtained from injected state or a fake hidden panel. The new assertions require one control and absence of the removed per-unit captions. Existing import-warning text checks still read the same notices after opening the actual disclosure.',
 'The shell keeps every old assertion line verbatim. Its compatible panel now opens through the actual Full Army Book control on the same canonical datasheet, then returns through Roster and Open card to the original exact physical URL. Existing geometry, Enhancement tab state, instance, weapon, scope, and effective-value checks remain.',
 'The synthetic route test differs only in the actual shortcut location and stable menu-control selector. Its remaining source, including all guards and assertions, is unchanged.',
 '', '## Preserved baseline failure', '',
 'The synthetic route browser test still has the independently reproduced baseline HTTP 404 failure at its unchanged console-error guard. Baseline c477 evidence: [base-synthetic-diagnostic.log](base-synthetic-diagnostic.log). Feature evidence: [targeted-3-route-context-synthetic-browser-qa.mjs.log](targeted-3-route-context-synthetic-browser-qa.mjs.log). This was not fixed, suppressed, or relabeled PASS. No rerun was performed during this audit.',
 '', '## Complete diff', '',
 '[FINAL_EXISTING_TESTS.patch](FINAL_EXISTING_TESTS.patch) contains the unabridged diff for all 31 files between the exact commits above. [FINAL_EXISTING_TESTS.json](FINAL_EXISTING_TESTS.json) records file hashes, line starts, preservation checks, and the failure classification.',
 '', 'No STOP conflict was found in the reviewed existing-test changes.', '']
(out/'FINAL_EXISTING_TESTS.md').write_text('\n'.join(md),encoding='utf8')
print(json.dumps({'review':report['review'],'files':len(rows),'patchSha256':report['patchSha256'],'outputs':['FINAL_EXISTING_TESTS.md','FINAL_EXISTING_TESTS.patch','FINAL_EXISTING_TESTS.json']},indent=2))
