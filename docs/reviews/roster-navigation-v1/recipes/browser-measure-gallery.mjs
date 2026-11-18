/** Prepared recipe only. Run sequentially after checking other browser/QA work.
 * Public import/attachment/navigation controls; page.evaluate only observes.
 * Based on rule-popups-v1 RECIPES/measure-render-revision-2.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const evidence=path.resolve(arg('--evidence')||'E:/Warhammer/qa-evidence/roster-navigation-v1-2026-11-17');
const mode=arg('--mode')||'measure';assert(['measure','gallery'].includes(mode));
const phase=arg('--phase')||'both';assert(['base','head','both'].includes(phase));
const roots={base:path.resolve(arg('--base-root')||'E:/Warhammer/qa-tmp/roster-navigation-baseline-c477d20a'),head:path.resolve(arg('--head-root')||'E:/Warhammer/worktrees/roster-navigation-v1')};
const fixtureRoot=path.resolve(arg('--fixture-root')||roots.base);
const helperRoot=path.resolve(arg('--helper-root')||'E:/Warhammer/worktrees/rule-popups-v1');
const widths=(arg('--widths')||(mode==='measure'?'390':'390,1440')).split(',').map(Number);
assert(widths.length&&widths.every(width=>Number.isInteger(width)&&width>0));
const target=path.join(evidence,mode+'-'+phase);assert(!fs.existsSync(target),'Fresh output required: '+target);fs.mkdirSync(target,{recursive:true});
const hash=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
const git=(root,...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const baseSha='c477d20aaa16f850b56f18aa878d6b5fb8b4057f';
assert.equal(git(roots.base,'rev-parse','HEAD'),baseSha,'Exact task baseline');
assert.equal(git(roots.base,'status','--porcelain'),'','Baseline must be clean');
const read=relative=>JSON.parse(fs.readFileSync(path.join(fixtureRoot,relative),'utf8'));
const sweep=read('v2/fixtures/sweep-polish-v1.json');
const selected={'adeptus-mechanicus':'input-0045','chaos-space-marines':'input-0120','emperors-children':'input-0421','space-marines':'additional-0012','blood-angels':'additional-0010','dark-angels':'additional-0011'};
const ownerBytes=fs.readFileSync(path.join(fixtureRoot,'v2/fixtures/new-recruit-v37.25-owner-death-guard.txt'));
assert.equal(hash(ownerBytes),read('v2/fixtures/new-recruit-plain-header-v37.25.json').owner.sha256,'Unchanged owner export');
const tau=read('v2/fixtures/csm-tau-recipient-gaps-v1-browser.json').find(book=>book.bookId==='tau-empire').browserCases.find(row=>row.id==='csm-tau-gaps-v1:tau:18');
const tyr=read('v2/fixtures/unit-recipient-scope-browser.json').find(book=>book.bookId==='tyranids').browserCases.find(row=>row.id==='unit-no-scope:vicious-insight');
const fixtures=[{book:'death-guard',id:'owner-v37.25-derived-attachments',text:ownerBytes.toString('utf8'),source:'v2/fixtures/new-recruit-v37.25-owner-death-guard.txt',owner:true},
 ...Object.entries(selected).map(([book,id])=>{const row=sweep.cases.find(row=>row.id===id);assert.equal(row.bookId,book);return {book,id,text:row.text,attachment:row.attachment,source:'v2/fixtures/sweep-polish-v1.json#'+id};}),
 {book:'tau-empire',id:tau.id,text:tau.text,attachment:{leader:'parsed-unit-1',target:'parsed-unit-2'},source:'v2/fixtures/csm-tau-recipient-gaps-v1-browser.json#'+tau.id},
 {book:'tyranids',id:tyr.id,text:tyr.text,attachment:{leader:'parsed-unit-1',target:'parsed-unit-2'},source:'v2/fixtures/unit-recipient-scope-browser.json#'+tyr.id}];
assert.equal(new Set(fixtures.map(row=>row.book)).size,9);
const report={schema:'roster-navigation-browser-recipe/v1',mode,phase,status:'RUNNING',started:new Date().toISOString(),
 policy:{freshContext:true,serviceWorkers:'block',widths,height:844,network:'unthrottled local static HTTP',cpu:'unthrottled',repetitions:mode==='measure'?3:1,
 order:phase==='both'?'base/head; head/base; base/head, sequential':phase+' only, three consecutive repetitions per fixture in measure mode; sequential fixtures',materialRegression:'headMedian/baseMedian > 1.10 AND headMedian-baseMedian > 100 ms (owner clarification 2)',parallelHeavyRuns:false,
 timing:'Node performance.now immediately before actual UI click through exact rendered destination and two animation frames; import/attachment setup and opening Units menu excluded'},
 roots,fixtureRoot,helperRoot,identities:Object.fromEntries(Object.entries(roots).map(([version,root])=>[version,{sha:git(root,'rev-parse','HEAD'),workingTree:git(root,'status','--porcelain'),diffSha256:hash(git(root,'diff','--binary','HEAD'))}])),
 fixtures:fixtures.map(({text,...row})=>({...row,textSha256:hash(text)})),rows:[],screenshots:[],observations:[],errors:[],missing:[]};
const save=()=>fs.writeFileSync(path.join(target,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');save();
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const parts=decodeURIComponent(new URL(req.url,'http://local').pathname).split('/').filter(Boolean),version=parts.shift(),root=roots[version];
 if(!root||parts.join('/')==='favicon.ico'){res.writeHead(204).end();return;}
 const file=path.resolve(root,parts.join('/'));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){report.missing.push(req.url);res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const urls={base:arg('--base-url')||origin+'/base/v2/app.html',head:arg('--head-url')||origin+'/head/v2/app.html'};
report.urls=urls;
if(arg('--base-url')){const status=JSON.parse(fs.readFileSync(arg('--preview-status')||'E:/Warhammer/qa-evidence/rule-popups-v1-2026-11-17/PREVIEW_STATUS.json','utf8'));assert.equal(status.sha,baseSha);assert.equal(status.status,'RUNNING');report.baselinePreview=status;}
let browser;
async function frames(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function ready(page){await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster));await page.evaluate(async()=>{await window.WarhammerAppV2?.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;});}
async function settle(page){await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));}
async function setup(page){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.locator('.v2-roster[data-roster-view]').waitFor();await settle(page);}
async function importOpen(page){const input=page.getByRole('textbox',{name:'New Recruit text export',exact:true});if(!await input.isVisible())await page.getByText('Import another roster',{exact:true}).click();await input.waitFor();return input;}
async function attach(page,leader,target){const article=page.locator('.v2-roster-instance[data-roster-instance-id="'+target+'"]');await article.locator('[data-attachment-candidate-for="'+target+'"]').selectOption(leader);await article.locator('[data-roster-action="attach"]').click();await settle(page);
 await page.waitForFunction(({leader,target})=>ArmyBookAppV2.roster.state.attachments.some(edge=>edge.leaderInstanceId===leader&&edge.bodyguardInstanceId===target),{leader,target});}
async function prepare(page,c,version){await page.goto(urls[version]);await page.locator('[data-v2-book="'+c.book+'"]').click();await ready(page);await setup(page);await(await importOpen(page)).fill(c.text);await page.locator('[data-roster-action="review-import"]').click();await settle(page);
 const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible()){await replace.click();await settle(page);}
 await page.waitForFunction(()=>ArmyBookAppV2.roster.state?.units?.length>0);
 const state=await page.evaluate(()=>ArmyBookAppV2.roster.snapshot());let focusId;
 if(c.owner){assert.equal(state.units.length,8);const one=(canonical,count)=>{const rows=state.units.filter(unit=>unit.canonicalUnitId===canonical&&(count===undefined||unit.startingStrength===count));assert.equal(rows.length,1,canonical+' '+count);return rows[0].instanceId;};
  const loc=one('unit-lord-of-contagion'),ds=one('unit-deathshroud-terminators'),bio=one('unit-biologus-putrifier'),pm=one('unit-plague-marines',10);
  await attach(page,loc,ds);await attach(page,bio,pm);focusId=ds;
  const edges=await page.evaluate(()=>ArmyBookAppV2.roster.snapshot().attachments.map(edge=>[edge.leaderInstanceId,edge.bodyguardInstanceId]));assert.deepEqual(edges.toSorted(),[[loc,ds],[bio,pm]].toSorted(),'Exactly the two explicit derived UI attachments');
 }else if(c.attachment){await attach(page,c.attachment.leader,c.attachment.target);focusId=c.attachment.target;}
 else focusId=state.units[0].instanceId;
 return {focusId,instances:state.units.map(unit=>({instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,models:unit.startingStrength}))};}
async function guide(page){await page.locator('[data-roster-action="open-personal-guide"]').click();await page.waitForFunction(()=>new URL(location.href).searchParams.get('v2')==='PERSONAL_GUIDE');await page.locator('main h1').filter({hasText:/guide/i}).waitFor();await frames(page);}
async function unitControl(page,id){let control=page.locator('[data-roster-nav-instance-id="'+id+'"]').filter({visible:true}).first();if(await control.count())return control;
 const menu=page.getByRole('button',{name:'Open navigation',exact:true});if(await menu.isVisible()&&await menu.getAttribute('aria-expanded')!=='true')await menu.click();
 const units=page.getByRole('button',{name:'Units',exact:true});if(await units.isVisible()&&await units.getAttribute('aria-expanded')!=='true')await units.click();
 control=page.locator('[data-roster-nav-instance-id="'+id+'"]').filter({visible:true}).first();await control.waitFor();return control;}
async function revealNavigation(page){const menu=page.getByRole('button',{name:'Open navigation',exact:true});if(await menu.isVisible()&&await menu.getAttribute('aria-expanded')!=='true')await menu.click();
 const units=page.getByRole('button',{name:'Units',exact:true});if(await units.isVisible()&&await units.getAttribute('aria-expanded')!=='true')await units.click();await frames(page);}
async function card(page,id,control){await control.click();await page.waitForFunction(id=>new URL(location.href).searchParams.get('instance')===id,id);const selected=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').first();await selected.waitFor();await frames(page);return selected;}
async function observation(page,c,version,width){const value=await page.evaluate(()=>{const r=ArmyBookAppV2.roster;return {state:r.snapshot(),projection:r.projection,points:r.points,effective:r.state.units.map(unit=>r.effective(unit.instanceId))};});report.observations.push({book:c.book,fixture:c.id,version,width,sha256:hash(value),value});}
async function shot(page,c,version,width,stage,locator=page){const file=[version,c.book,width,stage].join('-')+'.png';await locator.screenshot({path:path.join(target,file),animations:'disabled'});report.screenshots.push({version,book:c.book,fixture:c.id,width,stage,file});save();}
try{
 const {launchChromium}=await import(pathToFileURL(path.join(helperRoot,'tests/helpers/browser-launch.mjs')).href);browser=await launchChromium();
 const cases=mode==='measure'?fixtures.filter(row=>['death-guard','space-marines'].includes(row.book)):fixtures;
 for(const c of cases)for(const width of widths)for(let repeat=0;repeat<(mode==='measure'?3:1);repeat++)for(const version of (phase==='both'?(repeat%2?['head','base']:['base','head']):[phase])){
  const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',error=>report.errors.push({book:c.book,version,width,message:error.message}));
  try{const prepared=await prepare(page,c,version);
   if(mode==='gallery'&&version==='head'&&c.owner&&process.argv.includes('--select-warlord')){
    await shot(page,c,version,width,'attachment-setup-before-warlord');
    const leader=prepared.instances.find(unit=>unit.canonicalUnitId==='unit-lord-of-contagion');assert(leader);
    await page.locator('[data-roster-warlord-select]').selectOption(leader.instanceId);await page.locator('[data-roster-action="set-warlord"]').click();await settle(page);
    assert.equal(await page.evaluate(()=>ArmyBookAppV2.roster.state.warlordInstanceId),leader.instanceId);
    (report.manualActions||=[]).push({version,book:c.book,width,action:'Choose Warlord through Attachment Setup',instanceId:leader.instanceId});
   }
   if(mode==='gallery')await shot(page,c,version,width,'attachment-setup');
   const guideBegin=performance.now();await guide(page);const guideMs=performance.now()-guideBegin;
   if(mode==='gallery'){await shot(page,c,version,width,'guide');await revealNavigation(page);await unitControl(page,prepared.focusId);await shot(page,c,version,width,'units-menu');
    if(version==='head'&&c.owner){await page.locator('#tocTree [data-roster-nav-instance-id="'+prepared.focusId+'"]').scrollIntoViewIfNeeded();await shot(page,c,version,width,'units-menu-attachments');}
   }
   const control=await unitControl(page,prepared.focusId);const cardBegin=performance.now();const selectedCard=await card(page,prepared.focusId,control);const cardMs=performance.now()-cardBegin;
   report.rows.push({book:c.book,fixture:c.id,version,width,repeat:repeat+1,instanceId:prepared.focusId,guideMs,cardMs});
   if(mode==='gallery'){await shot(page,c,version,width,'physical-'+prepared.focusId,selectedCard);
    if(version==='head'){
     const pane=selectedCard.locator('details[data-datasheet-section="stratagems"]');
     if(await pane.count()){await pane.locator(':scope > summary').click();await frames(page);if(await pane.count())await shot(page,c,version,width,'stratagems-expanded',selectedCard);}
    }
    await observation(page,c,version,width);
    if(c.owner)for(const unit of prepared.instances.filter(unit=>unit.instanceId!==prepared.focusId)){await setup(page);await guide(page);await card(page,unit.instanceId,await unitControl(page,unit.instanceId));await shot(page,c,version,width,'physical-'+unit.instanceId,page.locator('main .unit-card[data-roster-instance-id="'+unit.instanceId+'"]').first());}
   }save();
  }finally{await context.close();}
 }
 assert.deepEqual(report.errors,[],'Application errors');assert.deepEqual(report.missing,[],'Missing local runtime dependencies');
 if(mode==='measure'&&phase==='both'){const median3=values=>{assert.equal(values.length,3);return values.toSorted((a,b)=>a-b)[1];};report.comparisons=[];
  for(const c of cases)for(const width of widths)for(const metric of ['guideMs','cardMs']){const samples=version=>report.rows.filter(row=>row.book===c.book&&row.width===width&&row.version===version).map(row=>row[metric]);const baseSamples=samples('base'),headSamples=samples('head'),base=median3(baseSamples),head=median3(headSamples);report.comparisons.push({book:c.book,width,metric,baseSamples,headSamples,baseMedianMs:base,headMedianMs:head,deltaMs:head-base,ratio:head/base,materialRegression:head/base>1.10&&head-base>100});}
  report.status=report.comparisons.some(row=>row.materialRegression)?'STOP_OVER_10_PERCENT_AND_100_MS':'PASS';
 }else report.status='CAPTURE_COMPLETE_COMPARISON_PENDING';
 report.finished=new Date().toISOString();save();if(report.status==='STOP_OVER_10_PERCENT_AND_100_MS')process.exitCode=1;
}catch(error){report.status='FAIL';report.failure={message:error.message,stack:error.stack};save();throw error;}
finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));save();}
console.log(JSON.stringify({status:report.status,out:target,rows:report.rows.length,screenshots:report.screenshots.length}));
