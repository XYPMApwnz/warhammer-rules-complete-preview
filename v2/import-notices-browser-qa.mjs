/** Real owner export and bounded derived controls through the public import UI.
 * Native snapshots and saved bytes remain exact across presenter refreshes. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {assertPlayerImportCopy,collectPlayerImportCopy} from '../tests/helpers/import-copy-assertions.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url)));
const out=path.resolve(arg('--out')||createQaEvidenceDir('wh-import-notices-browser-'));
const widths=(arg('--widths')||'390,1440').split(',').map(Number);
assert(widths.length&&widths.every(width=>Number.isSafeInteger(width)&&width>0));
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const fixtures=read('v2/fixtures/new-recruit-plain-header-v37.25.json');
const ownerBytes=fs.readFileSync(path.join(root,'v2/fixtures',fixtures.owner.file)),owner=ownerBytes.toString('utf8');
assert.equal(createHash('sha256').update(ownerBytes).digest('hex'),fixtures.owner.sha256);
const tau=fixtures.derived.find(row=>row.bookId==='tau-empire');assert(tau);
const csm=fixtures.derived.find(row=>row.bookId==='chaos-space-marines');assert(csm);
const allowed=new Set(read('tools/pages-runtime-manifest.json').files.map(row=>'/'+row.path));
const report={status:'RUNNING',root,widths,checks:[],screenshots:[],errors:[],missing:[]};
fs.mkdirSync(out,{recursive:true});
const save=()=>fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');save();
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){response.writeHead(204).end();return;}
  if(!file.startsWith(root+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
    report.missing.push(address);response.writeHead(404).end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
const settled=page=>page.waitForFunction(()=>!document.querySelector('[data-roster-view][aria-busy="true"]'));
async function open(page,book){
  await page.goto(origin+'/v2/app.html');await page.locator(`[data-v2-book="${book}"]`).click();
  await page.waitForFunction(book=>window.ArmyBookAppV2?.payload.book.id===book&&ArmyBookAppV2.roster,book);
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await ArmyBookAppV2.rosterPanel.ready;});
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await settled(page);
}
async function submit(page,text,bindings={}){
  const native=await page.evaluate(({text,bindings})=>{
    const result=ArmyBookAppV2.roster.import(text,bindings,{replaceExisting:true});
    return {status:result.status,errors:result.errors,needs:result.needsBindings,state:ArmyBookAppV2.roster.snapshot()};
  },{text,bindings});
  assert.equal(native.status,'READY',JSON.stringify({errors:native.errors,needs:native.needs}));
  const pane=page.locator('details[data-roster-import]');
  if(!await pane.evaluate(node=>node.open))await pane.locator(':scope > summary').click();
  await page.locator('[data-roster-input="raw-text"]').fill(text);
  await page.locator('[data-roster-action="review-import"]').click();await settled(page);
  const replace=page.locator('[data-roster-action="confirm-replace-roster"]');
  if(await replace.isVisible()){await replace.click();await settled(page);}
  assert.equal(await page.locator('.v2-roster-status').innerText(),'Roster imported.');
  const actual=await page.evaluate(()=>({state:ArmyBookAppV2.roster.snapshot(),saved:localStorage.getItem(ArmyBookAppV2.rosterPanel.storageKey)}));
  assert.deepEqual(actual.state,native.state,'The public UI preserves the exact native import outcome');
  assert.deepEqual(JSON.parse(actual.saved),native.state,'The saved roster preserves the native state');
  await page.evaluate(()=>ArmyBookAppV2.rosterPanel.refresh());
  assert.deepEqual(await page.evaluate(()=>({state:ArmyBookAppV2.roster.snapshot(),saved:localStorage.getItem(ArmyBookAppV2.rosterPanel.storageKey)})),actual,
    'Informational notice rendering cannot change the roster or saved bytes');
  return actual.state;
}
async function shot(page,width,name){
  const file=`${width}-${name}.png`;await page.screenshot({path:path.join(out,file),animations:'disabled'});
  report.screenshots.push({width,name,file});save();
}
async function guard(page){
  return assertPlayerImportCopy(await page.locator('[data-roster-view]').evaluate(collectPlayerImportCopy));
}
async function presentationReused(page,book){
  const result=await page.evaluate(book=>({
    requests:performance.getEntriesByType('resource').filter(row=>new URL(row.name).pathname===`/books/${book}/v2/generated/app-presentation.json`).length,
    parses:window.__noticePresentationParses[book]||0
  }),book);
  assert.deepEqual(result,{requests:1,parses:1},'Header notices reuse the already loaded Army Book presentation');return result;
}
try{
  browser=await launchChromium();
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:width<600?844:1000},serviceWorkers:'block'});
    context.setDefaultTimeout(25000);const page=await context.newPage();
    await page.addInitScript(()=>{
      window.__noticePresentationParses={};const json=Response.prototype.json;
      Response.prototype.json=function(...args){
        const match=new URL(this.url,location.href).pathname.match(/^\/books\/([^/]+)\/v2\/generated\/app-presentation\.json$/);
        if(match)window.__noticePresentationParses[match[1]]=(window.__noticePresentationParses[match[1]]||0)+1;
        return json.apply(this,args);
      };
    });
    page.on('pageerror',error=>report.errors.push(error.message));
    try{
      await open(page,'death-guard');
      const state=await submit(page,owner);
      assert.equal(state.units.length,8);
      assert.deepEqual(state.detachmentIds,['detachment-shamblerot-vectorium','detachment-virulent-vectorium']);
      const dp=page.locator('[data-roster-header-notice="DETACHMENT_POINTS_OVER_BATTLE_SIZE"]');
      assert.equal(await dp.innerText(),'The selected Detachments total 5 DP. The Strike Force table allows 3 DP. Review your Detachments and the Core Rules before playing.');
      assert.equal(await page.locator('[data-roster-header-notice="FORCE_DISPOSITION_NOT_SELECTED"]').count(),0,
        'Disruption is a member of one selected Detachment, so no membership warning appears');
      await page.locator('[data-roster-header-notices]').scrollIntoViewIfNeeded();await shot(page,width,'death-guard-owner-dp');
      report.checks.push({width,name:'real-owner-dp',nativeStatus:'READY',units:8,totalDP:5,tableLimit:3,
        anySelectedMembership:true,copyRecords:await guard(page),presentation:await presentationReused(page,'death-guard')});
      const mismatched=owner.replace('\nDisruption\n','\nReconnaissance\n');assert.notEqual(mismatched,owner);
      await submit(page,mismatched);
      const force=page.locator('[data-roster-header-notice="FORCE_DISPOSITION_NOT_SELECTED"]');
      assert.equal(await force.innerText(),'The exported Force Disposition, Reconnaissance, is not listed for any selected Detachment. Check the Force Disposition and Detachments in New Recruit.');
      assert.equal(await dp.count(),1);await force.scrollIntoViewIfNeeded();await shot(page,width,'death-guard-disposition-note');
      report.checks.push({width,name:'known-disposition-mismatch',nativeStatus:'READY',copyRecords:await guard(page)});
      const threeLines=owner.replace('Disruption\nStrike Force (2,000 Points)\n','');
      await submit(page,threeLines);assert.equal(await page.locator('[data-roster-header-notices]').count(),0);
      report.checks.push({width,name:'three-line-header',nativeStatus:'READY',noGuessedContext:true,copyRecords:await guard(page)});
      await open(page,'chaos-space-marines');await submit(page,csm.plainText,csm.bindings);
      assert.equal(await page.locator('[data-roster-header-notice="DETACHMENT_POINTS_OVER_BATTLE_SIZE"]').count(),0,
        'The source-owned CSM 2 DP selection stays within the Strike Force table value');
      assert.equal(await page.locator('[data-roster-header-notice="FORCE_DISPOSITION_NOT_SELECTED"]').count(),0,
        'The CSM named source relation matches its exported Force Disposition');
      const otherDisposition=await page.evaluate(()=>{
        const rows=Object.values(ArmyBookAppV2.payload.bookPresentation.records).filter(row=>row.kind==='DETACHMENT');
        const selected=new Set(ArmyBookAppV2.roster.state.detachmentIds.flatMap(id=>
          ArmyBookAppV2.payload.bookPresentation.records[id].forceDispositions.map(field=>field.value)));
        return rows.flatMap(row=>row.forceDispositions.map(field=>field.value)).find(name=>!selected.has(name));
      });
      assert(otherDisposition,'A different CSM source-owned Force Disposition supplies the negative control');
      const csmMismatch=csm.plainText.replace('\n'+csm.disposition+'\n','\n'+otherDisposition+'\n')
        .replace('Strike Force (2,000 Points)','Incursion (1,000 Points)');
      assert.notEqual(csmMismatch,csm.plainText);await submit(page,csmMismatch,csm.bindings);
      assert.equal(await page.locator('[data-roster-header-notice="DETACHMENT_POINTS_OVER_BATTLE_SIZE"]').count(),0,
        'The CSM source-owned 2 DP selection equals the Incursion table value');
      assert.equal(await page.locator('[data-roster-header-notice="FORCE_DISPOSITION_NOT_SELECTED"]').count(),1);
      await page.locator('[data-roster-header-notices]').scrollIntoViewIfNeeded();await shot(page,width,'csm-source-shape');
      report.checks.push({width,name:'csm-named-source-shape',nativeStatus:'READY',sourceMembershipPositiveAndNegative:true,
        totalDP:2,tableLimit:2,copyRecords:await guard(page),presentation:await presentationReused(page,'chaos-space-marines')});
      await open(page,'tau-empire');await submit(page,tau.plainText,tau.bindings);
      await page.locator('[data-roster-action="open-personal-guide"]').click();
      const summary=page.locator('[data-roster-summary]');
      assert.doesNotMatch(await summary.textContent(),/Imported points/);
      const total=await page.evaluate(()=>{
        const service=ArmyBookAppV2.roster,native=service.points;
        return Number.isFinite(native?.totalPoints)?native.totalPoints:service.state.units.reduce((sum,unit)=>sum+(unit.raw?.points??unit.points),0);
      });
      assert.match(await summary.textContent(),new RegExp(`${total} / 2000`),'The existing numeric points total and limit remain visible');
      if(width<600)await page.locator('#navMenu').click();
      assert(await summary.isVisible());await shot(page,width,'tau-summary');
      report.checks.push({width,name:'tau-common-summary-label',total,oldCopyAbsent:true,presentation:await presentationReused(page,'tau-empire')});save();
    }catch(error){await shot(page,width,'failure').catch(()=>{});throw error;}
    finally{await context.close();}
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.missing,[]);report.status='PASS';
}catch(error){report.status='FAIL';report.failure=error.message;throw error;}
finally{save();await browser?.close();await new Promise(resolve=>server.close(resolve));}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,out}));
