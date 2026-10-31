import {createQaTempDir,createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
/** Non-CSM F1 table fixture through the real native application.
 * Synthetic declarations exist only in external runtime-package copies. The
 * browser uses normal fetch/import/Guide controls; evaluation only reads public
 * roster evidence. No common-code replacement, state mutation or DOM patching.
 * The default invocation builds a fresh external runtime package and fixtures,
 * then runs every desktop/mobile case. Optional --prepare-only can use an
 * explicit F1_SYNTHETIC_TABLE_PACKAGE; --run-prepared requires an explicit
 * F1_SYNTHETIC_TABLE_OUT containing the earlier fixture manifest. Preparation
 * across processes requires KEEP_QA_TMP=1 to retain its owned package copies.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {projectArmyBook} from '../books/shared/army-book-app-v2/project.mjs';
import {projectBookPresentation} from '../books/shared/army-book-app-v2/book-v1-projection.mjs';
import {writeCacheRevision,verifyCacheRevision} from '../tools/cache-revision.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {buildPagesRuntimePackage} from '../tools/pages-runtime-package.mjs';
import {recipientDeclarationView} from '../books/shared/rule-contract-v2/recipients.mjs';
import {finalizeRecipientBook} from '../books/shared/rule-contract-v2/finalize-recipients.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const runPrepared=process.argv.includes('--run-prepared'),prepareOnly=process.argv.includes('--prepare-only');
assert.ok(!(runPrepared&&prepareOnly),'Choose only one optional preparation mode');
if(runPrepared)assert.ok(process.env.F1_SYNTHETIC_TABLE_OUT,'--run-prepared requires F1_SYNTHETIC_TABLE_OUT');
const workspace=runPrepared?null:createQaTempDir('wh-f1-synthetic-table-');
const outputHint=process.env.F1_SYNTHETIC_TABLE_OUT?path.resolve(process.env.F1_SYNTHETIC_TABLE_OUT):null;
if(outputHint)assert.ok(outputHint!==path.resolve(repo)&&!outputHint.startsWith(path.resolve(repo)+path.sep),'Fixture output must be outside the repository');
// An optional evidence destination is a parent for fresh default runs, so
// repeated mandatory invocations cannot accidentally reuse prior fixtures.
if(outputHint&&!runPrepared&&!prepareOnly)fs.mkdirSync(outputHint,{recursive:true});
const out=outputHint?(!runPrepared&&!prepareOnly?createQaEvidenceDir('run-',outputHint):outputHint):
  process.env.QA_EVIDENCE_DIR?createQaEvidenceDir('f1-table-fixtures-'):path.join(workspace,'fixtures');
const preparedManifest=runPrepared?parseSourceFixtureJSON(fs.readFileSync(path.join(out,'FIXTURES.json'),'utf8')):null;
const source=path.resolve(preparedManifest?.source||(prepareOnly&&process.env.F1_SYNTHETIC_TABLE_PACKAGE)||path.join(workspace,'runtime'));
assert.ok(!out.startsWith(path.resolve(repo)+path.sep)&&out!==path.resolve(repo),'Fixture output must be outside the repository');
assert.ok(out!==source&&!out.startsWith(source+path.sep)&&!source.startsWith(out+path.sep),'Fixture output and source package must be separate');
// Default runs always package current reviewed runtime bytes, even when a
// previous manual preparation left F1_SYNTHETIC_TABLE_PACKAGE in the environment.
const packageReport=!runPrepared&&!(prepareOnly&&process.env.F1_SYNTHETIC_TABLE_PACKAGE)
  ?buildPagesRuntimePackage({sourceRoot:repo,outRoot:source}):null;
const sha=value=>createHash('sha256').update(value).digest('hex');
const read=file=>parseSourceFixtureJSON(fs.readFileSync(file,'utf8'));
const clone=structuredClone;
const bookId='adeptus-mechanicus',ownerId='detachment-lords-of-the-forge';
const ruleId=ownerId+':rule:f1-synthetic-table',tableId=ruleId+':table:1';
const leadId='synthetic-leading-choice',childId='synthetic-option-row';
const title='Synthetic calibration choices';
const leading='At the start of the battle, select one from the list below for friendly TECH-PRIEST models from your army until the end of the battle.';
const cells=['Synthetic calibration','Synthetic fixture choice: this is a pending option and applies no calculated effect.'];
const optionText=cells.join(' · ');
const runtimeRelative=`books/${bookId}/v2/generated/roster-runtime.json`;
const presentationRelative=`books/${bookId}/v2/generated/app-presentation.json`;
const variants=['valid','missing-table','missing-row'];
const sourceHashes=Object.fromEntries([runtimeRelative,presentationRelative].map(relative=>[relative,sha(fs.readFileSync(path.join(source,relative)))]));
const trackedGeneratedHashes=Object.fromEntries([runtimeRelative,presentationRelative].map(relative=>[relative,sha(fs.readFileSync(path.join(repo,relative)))]));
const assertNoInternalIds=text=>{
  assert.doesNotMatch(text,/:rule:table:|table-\d+-row-\d+|source-clause-/i);
  for(const id of [ruleId,tableId,leadId,childId])assert.equal(text.includes(id),false,'Internal fixture identity is visible: '+id);
};
const rosterText=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Lords of the Forge
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`;

function fixtureEntities(book){
  const parent=clone(book.entities.find(entity=>entity.id===ownerId));assert.equal(parent.kind,'DETACHMENT');
  parent.data.ruleIds=[parent.data.ruleId,ruleId];
  const provenance={sourceId:'f1-synthetic-am-table-fixture',fixtureOnly:true};
  const role={id:'recipient',subject:'MODEL',allegiance:'FRIENDLY',purpose:'RECIPIENT',binding:'ROSTER_MODELS',
    selector:{predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',arguments:{keyword:'TECH-PRIEST'},
      evidence:{field:['content',0,'text'],quote:'TECH-PRIEST models'}},conditions:[]};
  const common={roles:[role],rosterClassification:'BATTLE_ONLY',
    rosterClassificationNote:{reason:'Synthetic fixture battle choice; never executed.'},rosterEffects:[]};
  const lead={...clone(common),id:leadId,sourceFields:[['content',0,'text']],
    evidence:{field:['content',0,'text'],quote:leading},conditions:[],
    effect:{sourceClause:leading,recipientRoleId:'recipient'}};
  const child={...clone(common),id:childId,sourceFields:[['content',1,'tableId']],
    evidence:{otherEntityId:tableId,field:['rows',0],quote:JSON.stringify(cells)},conditions:[],
    effect:{canonicalTableId:tableId,rowIndex:0,recipientRoleId:'recipient'}};
  const rule={id:ruleId,kind:'DETACHMENT_RULE',bookId,parentId:ownerId,provenance,
    // AM's ordinary source page reads data.text; ordered content also keeps
    // the generic canonical table reference used by the new fixture clause.
    data:{title,text:leading,content:[{text:leading},{tableId}]},ruleContract:{schema:'rule-contract/v2',ruleId,ownerId,
      sourceId:provenance.sourceId,kind:'DETACHMENT_RULE',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'BATTLE',
      detachmentId:ownerId,sourceFields:[['content',0,'text'],['content',1,'tableId']],roles:[clone(role)],
      conditions:[{predicate:'DETACHMENT',subject:'ROSTER',contextLevel:'ROSTER',arguments:{id:ownerId},
        evidence:{otherEntityId:ownerId,field:['title'],quote:parent.data.title}}],clauses:[lead,child]}};
  const table={id:tableId,kind:'STRUCTURED_RULE_TABLE',bookId,parentId:ruleId,
    provenance:{sourceId:'f1-synthetic-am-table-fixture-table',fixtureOnly:true},data:{rows:[clone(cells)]}};
  return {parent,rule,table};
}
function prepare(){
  fs.mkdirSync(out,{recursive:true});assert.ok(!fs.existsSync(path.join(out,'FIXTURES.json')),'Use a fresh external output for preparation');
  // Append source declarations only in an explicit producer scratch view. Each
  // fixture is normalized before deliberate runtime source-proof corruption.
  const book=recipientDeclarationView(read(path.join(source,runtimeRelative))),payload=read(path.join(source,presentationRelative));
  const {parent,rule,table}=fixtureEntities(book);
  const emptyMfm={source:{label:'SYNTHETIC FIXTURE'},unitBindings:[],detachmentBindings:[],enhancementBindings:[],
    paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]};
  const projectionModel={bookId,entities:[parent,rule,table],mfm:emptyMfm,
    currentness:{currentness:'SYNTHETIC_FIXTURE',lastReconciledSource:'No factual enrollment'}};
  // Real generic producers create the fixture's canonical cards/typed record;
  // no alternate interpreter or conditional-row projection is built by this test.
  const projected=projectArmyBook(projectionModel,new Map(),{title:'Synthetic AM table fixture'});
  const records=projectBookPresentation({...projectionModel,entities:[rule,table]},new Map()).records;
  const fixtures=[];
  for(const variant of variants){
    const root=path.join(workspace,'fixture-'+variant);assert.ok(!fs.existsSync(root),'Fixture directory already exists: '+root);
    fs.cpSync(source,root,{recursive:true});
    const fixtureBook=clone(book),fixturePayload=clone(payload);
    fixtureBook.entities[fixtureBook.entities.findIndex(entity=>entity.id===ownerId)]=clone(parent);
    fixtureBook.entities.push(clone(rule),clone(table));
    finalizeRecipientBook(fixtureBook);
    for(const card of projected.cards.filter(card=>[ruleId,tableId].includes(card.id)))fixturePayload.cards.push(card);
    fixturePayload.factManifest.push(...projected.factManifest.filter(field=>[ruleId,tableId].includes(field.entityId)));
    fixturePayload.cards.find(card=>card.id===ownerId).children.push(ruleId);
    Object.assign(fixturePayload.bookPresentation.records,records);
    fixturePayload.bookPresentation.records[ownerId].ruleIds=[parent.data.ruleId,ruleId];
    if(Array.isArray(fixturePayload.ruleContractIds))fixturePayload.ruleContractIds.push(ruleId);
    // Corrupt only the fetched runtime proof. The normal source-card heading
    // and leading source text stay available in all three fixture payloads.
    if(variant==='missing-table')fixtureBook.entities=fixtureBook.entities.filter(entity=>entity.id!==tableId);
    if(variant==='missing-row')fixtureBook.entities.find(entity=>entity.id===tableId).data.rows=[];
    fs.writeFileSync(path.join(root,runtimeRelative),JSON.stringify(fixtureBook,null,2)+'\n');
    fs.writeFileSync(path.join(root,presentationRelative),JSON.stringify(fixturePayload,null,2)+'\n');
    const revision=writeCacheRevision({root});assert.equal(verifyCacheRevision({root}).revision,revision);
    fixtures.push({variant,root,revision,fixtureOnly:true,hashes:Object.fromEntries([runtimeRelative,presentationRelative].map(relative=>
      [relative,sha(fs.readFileSync(path.join(root,relative)))]))});
  }
  const manifest={source,sourceHashes,bookId,ownerId,ruleId,tableId,leadId,childId,leading,cells,
    freshRuntimePackage:packageReport?{fileCount:packageReport.fileCount,contentSha256:packageReport.contentSha256,cacheRevision:packageReport.cacheRevision}:null,
    boundary:'Synthetic declaration fixture only. No accepted source, factual enrollment, tracked generated output or common production code is changed.',fixtures};
  fs.writeFileSync(path.join(out,'FIXTURES.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
const manifest=runPrepared?preparedManifest:prepare();
assert.deepEqual(manifest.sourceHashes,sourceHashes,'Source runtime package changed since fixture preparation');
for(const fixture of manifest.fixtures){assert.equal(verifyCacheRevision({root:fixture.root}).revision,fixture.revision);
  for(const [relative,expected]of Object.entries(fixture.hashes))assert.equal(sha(fs.readFileSync(path.join(fixture.root,relative))),expected);}
if(prepareOnly){
  console.log(JSON.stringify({status:'PREPARED',manifest:path.join(out,'FIXTURES.json'),variants:manifest.fixtures.map(f=>({variant:f.variant,revision:f.revision}))}));
}else{
  const prefix='/warhammer-rules-complete-preview/',results=[],errors=[],requests=[];
  const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
    '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
  let current=manifest.fixtures[0],browser,status='NOT_RUN';
  const server=http.createServer((request,response)=>{
    try{const address=decodeURIComponent(new URL(request.url,'http://localhost').pathname);assert.ok(address.startsWith(prefix));
      let file=path.resolve(current.root,address.slice(prefix.length));assert.ok(file===path.resolve(current.root)||file.startsWith(path.resolve(current.root)+path.sep));
      if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      requests.push({variant:current.variant,address,status:200});response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});response.end(fs.readFileSync(file));
    }catch{requests.push({variant:current.variant,address:request.url,status:404});response.writeHead(404);response.end('Missing fixture resource');}
  });
  const ready=page=>page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster));
  async function openRoster(page){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
    await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
  async function guideIndex(page){await openRoster(page);await page.getByRole('button',{name:'Open personal guide',exact:true}).click();}
  async function guide(page,instance){await guideIndex(page);await page.locator('main a[data-target-id="roster-unit/'+instance+'"]').click();
    await page.locator('main .unit-card[data-roster-instance-id="'+instance+'"]').waitFor();}
  const visibleRows=page=>page.locator('main .ds-conditional-policy').evaluateAll((nodes,ruleId)=>nodes.flatMap(node=>{
    const proof=JSON.parse(node.dataset.policySource||'{}');
    const refs=JSON.parse(node.dataset.detachmentClauseFieldRefs||'[]');
    const withoutTables=node=>node.nodeType===Node.TEXT_NODE?node.textContent:
      node.nodeType!==Node.ELEMENT_NODE||node.tagName==='TABLE'?'':[...node.childNodes].map(withoutTables).join('');
    const clauseText=refs.length?refs.map(id=>{const field=document.getElementById(id);if(!field||!field.getClientRects().length)throw new Error('Missing visible clause source field');
      return field.matches('table[data-detachment-source-table]')?[...field.querySelectorAll('tr')].map(row=>[...row.querySelectorAll('th,td')].map(cell=>cell.textContent).join(' · ')).join('\n'):withoutTables(field);
    }).join('\n'):node.querySelector('[data-detachment-clause-text]')?.textContent;
    return proof.ruleId===ruleId?[{proof,subject:node.dataset.recipientSubject,
      instances:JSON.parse(node.dataset.recipientInstanceIds),models:JSON.parse(node.dataset.recipientModelScopeIds),text:node.innerText,
      clauseText,
      options:[...node.querySelectorAll('[data-detachment-options] li')].map(item=>({text:item.textContent,tableId:item.dataset.optionTableId,rowIndex:Number(item.dataset.optionRowIndex),clauseId:item.dataset.optionClauseId}))}]:[];
  }),ruleId);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const entry=`http://127.0.0.1:${server.address().port}${prefix}v2/app.html`;
  try{
    browser=await launchChromium();
    for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]])for(const fixture of manifest.fixtures){
      current=fixture;const context=await browser.newContext({viewport,serviceWorkers:'allow'}),page=await context.newPage();page.setDefaultTimeout(30000);
      const pageErrors=[];page.on('pageerror',error=>{pageErrors.push(error.message);errors.push({device,variant:fixture.variant,message:error.message});});
      try{
        await page.goto(entry);await page.locator('[data-v2-book="'+bookId+'"]').click();await ready(page);
        await openRoster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(rosterText);
        await page.locator('[data-roster-action="review-import"]').click();
        await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent.startsWith('Roster imported.'));
        const evidence=await page.evaluate(ruleId=>{const roster=window.ArmyBookAppV2.roster,snapshot=roster.snapshot();return {snapshot,
          units:snapshot.units.map(unit=>({instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,effective:roster.effective(unit.instanceId)}))};},ruleId);
        assert.deepEqual(evidence.snapshot.units.map(unit=>unit.canonicalUnitId),['unit-tech-priest-dominus','unit-skitarii-rangers']);
        const allRows=evidence.units.flatMap(unit=>unit.effective.conditional.filter(row=>row.ruleId===ruleId).map(row=>({instance:unit.instanceId,row})));
        const leadRows=allRows.filter(item=>item.row.clauseId===leadId),childRows=allRows.filter(item=>item.row.clauseId===childId);
        assert.equal(leadRows.length,1);assert.equal(leadRows[0].instance,'parsed-unit-1');
        assert.equal(childRows.length,fixture.variant==='valid'?1:0,'Broken table proof must omit the F1 child across every imported unit');
        const dominus=evidence.units[0].effective.profiles.find(model=>model.id==='datasheet-tech-priest-dominus:profile:default');assert.ok(dominus);
        assert.deepEqual(leadRows[0].row.recipientModelScopeIds,[dominus.scopeId]);
        assert.equal(leadRows[0].row.detachmentText.text,leading);assert.equal(leadRows[0].row.execution,'CONDITIONAL_TEXT_ONLY');
        assert.ok(evidence.units.every(unit=>!unit.effective.applied.some(row=>row.ruleId===ruleId)),'Fixture is text-only and executes no gameplay effect');
        if(fixture.variant==='valid'){
          assert.deepEqual(childRows[0].row.recipientModelScopeIds,[dominus.scopeId]);
          const option=leadRows[0].row.detachmentText.tableOptions[0];assert.equal(option.tableId,tableId);assert.equal(option.rowIndex,0);
          assert.deepEqual(option.cells,cells);assert.equal(option.text,optionText);assert.equal(option.leadingText,leading);
          assert.deepEqual(option,childRows[0].row.detachmentText.tableOption);
        }else assert.deepEqual(leadRows[0].row.detachmentText.tableOptions||[],[]);
        await guide(page,'parsed-unit-1');const rows=await visibleRows(page);assert.equal(rows.length,1,'Option child is grouped under the actual leading row');
        assert.equal(rows[0].proof.clauseId,leadId);assert.equal(rows[0].subject,'MODEL');assert.deepEqual(rows[0].instances,['parsed-unit-1']);
        assert.deepEqual(rows[0].models,[dominus.scopeId]);assert.equal(rows[0].clauseText,leading);
        assert.equal(rows[0].options.length,fixture.variant==='valid'?1:0);if(fixture.variant==='valid'){
          assert.deepEqual(rows[0].options,[{text:optionText,tableId,rowIndex:0,clauseId:childId}]);assert.doesNotMatch(rows[0].text,/Selection not recorded|Not automatically calculated|Conditional rule|model count unresolved/);
        }
        assertNoInternalIds(await page.locator('main').innerText());
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No horizontal overflow');
        const shot=path.join(out,device+'-'+fixture.variant+'-guide.png');await page.screenshot({path:shot,fullPage:true});
        await guide(page,'parsed-unit-2');assert.deepEqual(await visibleRows(page),[],'MODEL table fixture never leaks to Rangers');
        await guideIndex(page);await page.locator('main a[data-target-id="'+ownerId+'"]').click();
        const sourceRule=page.locator('main [data-card-id="'+ruleId+'"]');await sourceRule.waitFor();
        const sourcePageText=await sourceRule.innerText();
        assert.ok(sourcePageText.includes(title));assert.ok(sourcePageText.includes(leading),'Detachment source page retains canonical leading text even when runtime table proof is absent');
        assertNoInternalIds(sourcePageText);
        const sourceShot=path.join(out,device+'-'+fixture.variant+'-source.png');await page.screenshot({path:sourceShot,fullPage:true});
        assert.deepEqual(pageErrors,[]);results.push({device,variant:fixture.variant,status:'PASS',effectiveRows:allRows,
          visibleLeadingRows:rows,sourceHeadingAndTextPreserved:true,sourcePageText,allImportedInstancesChecked:true,screenshots:[shot,sourceShot]});
        console.log('PASS '+device+' '+fixture.variant);
      }catch(error){results.push({device,variant:fixture.variant,status:'FAIL',error:error.stack,body:await page.locator('body').innerText().catch(()=>''),url:page.url()});throw error;}
      finally{await context.close();}
    }
    for(const fixture of manifest.fixtures)for(const relative of [runtimeRelative,presentationRelative])assert.ok(requests.some(request=>request.variant===fixture.variant&&request.address===prefix+relative&&request.status===200),'Native loader did not fetch '+relative+' for '+fixture.variant);
    for(const [relative,expected]of Object.entries(sourceHashes))assert.equal(sha(fs.readFileSync(path.join(source,relative))),expected,'Source package was modified');
    for(const [relative,expected]of Object.entries(trackedGeneratedHashes))assert.equal(sha(fs.readFileSync(path.join(repo,relative))),expected,'Tracked generated output was modified');
    assert.deepEqual(errors,[]);status='PASS';console.log(JSON.stringify({status,cases:results.length,out}));
  }catch(error){status='FAIL';console.error(error.stack);process.exitCode=1;}
  finally{
    fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status,fixtureOnly:true,realNewRecruitExportTested:false,
      automaticFreshRun:!runPrepared&&!prepareOnly,freshRuntimePackage:manifest.freshRuntimePackage,
      normalApplicationPath:true,sourceHashes,trackedGeneratedHashes,trackedGeneratedUnchanged:Object.entries(trackedGeneratedHashes).every(([relative,expected])=>sha(fs.readFileSync(path.join(repo,relative)))===expected),
      fixtures:manifest.fixtures,results,errors,requests},null,2)+'\n');
    if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
  }
}
