/** Display-only source text, physical recipients and separate library dates. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url)));
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/card-texts.json',import.meta.url)));
const chosen=arg('--case')||'all';
assert.ok(['all','attached','lion','headers','titus'].includes(chosen),'Unknown card-text scenario');
const observe=process.argv.includes('--observe-only');
const out=createQaEvidenceDir('wh-card-texts-browser-');
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[];
const server=http.createServer((request,response)=>{
 const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
 if(address==='/favicon.ico'){response.writeHead(204).end();return;}
 if(!file.startsWith(root+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
  missing.push(address);response.writeHead(404).end();return;
 }
 response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const item=id=>{const row=fixture.cases.find(row=>row.id===id);assert.ok(row,'Missing exact fixture '+id);return row;};



let browser,context,page,current='initialization',completed=false;
const effective=id=>page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),id);
async function settled(){await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));}
async function roster(){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function open(book){
 await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();
 await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.roster));
 await page.evaluate(async()=>await window.ArmyBookAppV2.rosterPanel?.ready);await roster();
}
async function submit(text,{ready=true}={}){
 await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
 await page.locator('[data-roster-action="review-import"]').click();await settled();
 const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible()){await replace.click();await settled();}
 const status=await page.locator('.v2-roster-status').innerText();
 if(ready)assert.ok(status.startsWith('Roster imported.'),'Expected a READY UI import: '+status);
 return status;
}
async function attach(leader='parsed-unit-1',bodyguard='parsed-unit-2'){
 await roster();await page.locator('[data-attachment-candidate-for="'+bodyguard+'"]').selectOption(leader);
 await page.locator('[data-attachment-target-instance-id="'+bodyguard+'"] [data-roster-action="attach"]').click();await settled();
 await page.waitForFunction(({leader,bodyguard})=>window.ArmyBookAppV2.roster.state.attachments.some(edge=>edge.leaderInstanceId===leader&&edge.bodyguardInstanceId===bodyguard),{leader,bodyguard});
}
async function detach(){
 await roster();await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();await settled();
 await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
}
async function card(id){
 await roster();await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
 const value=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').first();await value.waitFor();return value;
}
async function screenshot(name,node){if(node)await node.scrollIntoViewIfNeeded();const file=path.join(out,name+'.png');await page.screenshot({path:file});return file;}
const normalized=value=>String(value).replace(/\s+/g,' ').trim();
const occurrences=(text,part)=>text.split(part).length-1;
async function attached(width,c){
 await open(c.bookId);await submit(c.text);const {leader,bodyguard}=c.attach;
 const target=c.id==='p2-network-override'||c.id==='electro-infusion'?leader:bodyguard;
 const selector='[data-attached-rule-id="'+c.ruleId+'"]';
 let node=await card(target);assert.equal(await node.locator(selector).count(),0,'No cross-component rule before attachment');
 const shots=[await screenshot(c.id+'-before-'+width,node)];
 const before=await page.evaluate(()=>window.ArmyBookAppV2.roster.projection);
 await attach(leader,bodyguard);node=await card(target);
 const block=node.locator(selector);const present=await block.count();
 if(!observe){
  assert.equal(present,1,'Full source text must appear on the exact attached recipient: '+c.id);
  assert.ok(await block.isVisible(),'Attached source text is visible');
  assert.ok(await block.locator('[data-source-attribution],.v2-source-caption,.ds-source-caption,.ds-source').count()||/Source:/.test(await block.innerText()),'Attached rule has a source caption');
  const view=await effective(target),row=view.attachedRuleTexts.find(row=>row.ruleId===c.ruleId);
  assert.ok(row,'Public effective view must carry the source-backed text');
  const body=await block.locator('[data-attached-rule-text]').textContent();
  const heading=await block.locator('h5').textContent();
  const restored=row.text.startsWith(heading+':')?heading+':'+body:body;
  assert.equal(restored,row.text,'Full rule text is retained, with its source heading shown separately');
  assert.equal(row.recipientInstanceId,target,'Exact physical recipient');
  assert.ok(row.sourceInstanceId===leader||row.sourceInstanceId===bodyguard,'Source is the attached component');
 }
 shots.push(await screenshot(c.id+'-attached-'+width,present?block:node));
 if(c.id!=='p43-lion-candidate'){
  const isolated=await effective('parsed-unit-3');
  assert.ok(!isolated.attachedRuleTexts.some(row=>row.ruleId===c.ruleId),'Another copy receives no attached rule');
 }
 await detach();node=await card(target);assert.equal(await node.locator(selector).count(),0,'Detach removes dependent text');
 const after=await page.evaluate(()=>window.ArmyBookAppV2.roster.projection);
 assert.deepEqual(after,before,'Attach then detach must restore the whole gameplay projection');
 results.push({case:c.id,width,status:observe?'OBSERVED':'PASS',attachedTextCount:present,screenshots:shots});
}
async function lion(width){
 const c=item('p43-lion-candidate');await open(c.bookId);await submit(c.text);
 const node=await card('parsed-unit-2'),view=await effective('parsed-unit-2');
 const rows=view.conditional.filter(row=>row.policy?.contextQuote?.includes('Martial Exemplar'));
 assert.ok(rows.length>=2,'Two independently recorded Martial Exemplar effects remain');
 const quote=rows[0].policy.contextQuote;
 const quoteCount=occurrences(normalized(await node.innerText()),normalized(quote));
 const refs=await node.locator('.ds-conditional-policy').evaluateAll((nodes,ruleId)=>nodes.filter(n=>JSON.parse(n.dataset.policySource).ruleId===ruleId).map(n=>n.dataset.policyTextRef).filter(Boolean),rows[0].ruleId);
 if(!observe){
  assert.equal(quoteCount,1,'One full text per physical source, with both effects retained');
  assert.ok(refs.length>=2,'Each separate effect points to full source text');
  assert.equal(new Set(refs).size,1,'The same physical source text is shared');
  const source=node.locator('[id="'+refs[0]+'"]');assert.equal(await source.count(),1);assert.ok(await source.isVisible());
  const supreme=node.locator('section.unit-part[data-card-id="section-da-c36cec25932b4675ab25"]');
  assert.equal(occurrences(normalized(await supreme.innerText()),'Supreme Commander'),1,'Supreme Commander content heading appears once; its navigation label is retained');
  assert.ok((await supreme.innerText()).includes('If this model is in your army, it must be your WARLORD.'),'The complete restriction is retained');
  for(const policy of view.conditional.filter(row=>row.policy?.contextQuote?.split('\n').some(line=>/^\s*[-•] /.test(line)))){
   const id=await node.locator('.ds-conditional-policy').evaluateAll((nodes,p)=>nodes.find(n=>{const s=JSON.parse(n.dataset.policySource);return s.ruleId===p.ruleId&&s.clauseId===p.clauseId;})?.dataset.policyTextRef,{ruleId:policy.ruleId,clauseId:policy.clauseId});
   assert.ok(id,'A conditional list retains its full source reference');
   assert.deepEqual(await node.locator('[id="'+id+'"] ul.ds-source-text-list > li').allTextContents(),policy.policy.contextQuote.split('\n').filter(line=>/^\s*[-•] /.test(line)),'Conditional bullets remain individual list items in source order');
  }
 }
 results.push({case:'lion',width,status:observe?'OBSERVED':'PASS',effects:rows.length,fullTextOccurrences:quoteCount,refs,screenshots:[await screenshot('lion-'+width,node)]});
}
async function titus(width){
 const c=item('titus-wargear');await open(c.bookId);await submit(c.text);const node=await card('parsed-unit-2');
 const section=node.locator('section.unit-part[data-datasheet-section="wargear"]');assert.equal(await section.count(),1,'One WARGEAR OPTIONS section');
 const count=occurrences(normalized(await section.innerText()),'WARGEAR OPTIONS');
 if(!observe)assert.equal(count,1,'Derived Titus Bodyguard: WARGEAR OPTIONS heading once');
 results.push({case:'titus',width,status:observe?'OBSERVED':'PASS',headingOccurrences:count,screenshots:[await screenshot('titus-wargear-'+width,section)]});
}
async function headers(width,book){
 await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();
 await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.payload));
 const node=page.locator('.v2-hero').first();await node.waitFor();
 const labels=await node.locator('[data-book-data-version]').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.dataset.bookDataVersion,n.textContent])));
 if(!observe){
  const payload=JSON.parse(fs.readFileSync(path.join(root,'books',book,'v2/generated/app-presentation.json')));
  const data=payload.book.dataVersions;assert.ok(data,'Source-owned version metadata must be published');
  assert.equal(labels.core,'Core rules snapshot: '+data.coreSnapshotDate);
  assert.equal(labels.mfm,'MFM points: '+data.mfmVersion);
  assert.ok(labels.official?.startsWith('Book corrections: '));
  assert.equal(Object.keys(labels).length,3,'Three separate source labels');
  for(const update of data.officialUpdates){assert.ok(labels.official.includes(update.version));if(update.date)assert.ok(labels.official.includes(update.date));}
 }
 results.push({case:'headers',book,width,status:observe?'OBSERVED':'PASS',labels,screenshots:[await screenshot('header-'+book+'-'+width,node)]});
}
let browserRunError;
try{
 browser=await launchChromium();
 for(const width of [390,1440])for(const [kind,label,run] of [
  ...fixture.cases.filter(c=>c.attach).map(c=>['attached',c.id,()=>attached(width,c)]),
  ['lion','lion',()=>lion(width)],
  ['titus','titus',()=>titus(width)],
  ...['death-guard','adeptus-mechanicus','tau-empire'].map(book=>['headers',book,()=>headers(width,book)])
 ]){
  if(chosen!=='all'&&chosen!==kind)continue;
  current=label+'-'+width;console.log('RUN '+current);
  context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});context.setDefaultTimeout(25000);page=await context.newPage();page.on('pageerror',error=>errors.push({case:current,error:error.message}));
  try{await run();}catch(error){const shot=path.join(out,current+'-failure.png');await page.screenshot({path:shot}).catch(()=>{});results.push({case:label,width,status:'FAIL',error:error.message,screenshots:[shot],url:page.url()});throw error;}finally{await context.close();context=null;}
  console.log((observe?'OBSERVED ':'PASS ')+current);
 }
 assert.deepEqual(errors,[],'No application page errors');assert.deepEqual(missing,[],'No missing runtime resources');completed=true;
}catch(error){browserRunError=error;}
finally{
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?(observe?'OBSERVED':'PASS'):'FAIL',root,chosen,current,results,errors,missing},null,2)+'\n');
 if(context)await context.close();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
 console.log(JSON.stringify({status:completed?(observe?'OBSERVED':'PASS'):'FAIL',evidence:out,checks:results.length}));
}
if(browserRunError)throw browserRunError;
