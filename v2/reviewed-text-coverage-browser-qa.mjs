/** Owner-authored text expectations through import/attach/detach controls. */
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=createQaEvidenceDir('wh-text-coverage-browser-');
const ownerTyr=fs.readFileSync(new URL('./fixtures/text-coverage-tyranids-owner.txt',import.meta.url),'utf8');
const ownerEC=fs.readFileSync(new URL('./fixtures/text-coverage-ec-owner.txt',import.meta.url),'utf8');
const cases=[
 {id:'owner-piercing-talons',book:'tyranids',text:ownerTyr,title:'Piercing Talons',ruleId:'detachment-unending-swarm:enhancement:3',field:['text'],owner:'Broodlord',expected:true},
 {id:'owner-steeped-in-suffering',book:'emperors-children',text:ownerEC,title:'Steeped in Suffering',ruleId:'detachment-mercurial-host:enhancement:1',field:['text'],owner:'Lord Exultant',expected:true},
 {id:'bearer-only-negative',book:'tyranids',text:ownerTyr.replace('Unending Swarm (1 Detachment Point)','Synaptic Nexus (1 Detachment Point)').replace('Piercing Talons','Synaptic Control'),title:'Synaptic Control',ruleId:'detachment-synaptic-nexus:enhancement:3',field:['text'],owner:'Broodlord',expected:false},
 {id:'node-lash',book:'tyranids',text:'+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: Unending Swarm\n1x Neurotyrant (0 pts)\n3x Tyrant Guard (0 pts)',title:'Node Lash (Psychic)',ruleId:'datasheet-neurotyrant:section:1',field:['blocks',0,'text'],owner:'Neurotyrant',expected:true},
 {id:'warped-interference',book:'emperors-children',text:ownerEC.replace('Mercurial Host','Court of the Phoenician').replace('Char1: 1x Lord Exultant (90 pts): Bolt pistol, Close combat weapon, Phoenix power spear, Rapture lash\nEnhancement: Steeped in Suffering (+15 pts)','1x Sorcerer (0 pts)'),title:'Warped Interference (Psychic)',ruleId:'datasheet-sorcerer:section:1',field:['blocks',0,'text'],owner:'Sorcerer',expected:true}
];
for(const c of cases){const facts=parseProducerJSON(fs.readFileSync(path.join(root,'books',c.book,'v2/generated/effective.json'),'utf8'));
 const source=facts.entities.find(e=>e.id===c.ruleId);assert(source);c.original=c.field.reduce((v,k)=>v[k],source.data);
 c.body=c.original.startsWith(c.title+':')?c.original.slice(c.title.length+1):c.original;
}
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[];
const server=http.createServer((request,response)=>{
 const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
 if(address==='/favicon.ico'){response.writeHead(204).end();return;}
 if(!file.startsWith(path.resolve(root)+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){missing.push(address);response.writeHead(404).end();return;}
 response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
async function roster(page){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function imported(page,text){
 await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();
 await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
 const confirm=page.locator('[data-roster-action="confirm-replace-roster"]');if(await confirm.isVisible())await confirm.click();
 await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
 assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./,'The ordinary UI must accept the constructed fixture');
}
async function inspect(page,c,device,id,mode,stage,wanted){
 await roster(page);
 if(mode==='Effective')await page.locator(`[data-roster-instance-id="${id}"]`).getByRole('button',{name:'Effective datasheet',exact:true}).click();
 else{await page.getByRole('button',{name:'Open personal guide',exact:true}).click();await page.locator(`main a[data-target-id="roster-unit/${id}"]`).click();}
 const card=page.locator(`main .unit-card[data-roster-instance-id="${id}"]`);await card.waitFor();
 const rows=await card.locator('article[data-attached-rule-id]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.attachedRuleId,source:n.dataset.sourceInstanceId,title:n.querySelector('h5')?.textContent,text:n.querySelector('[data-attached-rule-text]')?.textContent,content:n.innerText})));
 const found=rows.filter(row=>row.id===c.ruleId&&row.title===c.title);assert.equal(found.length,wanted?1:0,`${c.id}/${device}/${mode}/${stage}`);
 if(wanted){assert.equal(found[0].text,c.body,'Original English text changes only by removing its duplicate heading');assert.equal(found[0].source,'parsed-unit-1');assert(found[0].content.includes('Source:'));assert(found[0].content.includes(c.owner));assert.doesNotMatch(found[0].content,/Not automatically|Conditional rule|source-clause-/i);}
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 results.push({id:c.id,book:c.book,device,mode,stage,target:id,expected:wanted,status:'PASS',observed:found});
}
let browser,completed=false;
try{
 browser=await launchChromium();
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]])for(const book of ['tyranids','emperors-children']){
  const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();context.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(origin+'/v2/app.html');await page.locator(`[data-v2-book="${book}"]`).click();await page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
   for(const c of cases.filter(c=>c.book===book)){
    console.log('RUN '+device+' '+c.id);await imported(page,c.text);
    assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units.length),2,'Exact two-unit fixture');
    await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor();
    const before=await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection));
    for(const mode of ['Effective','Guide'])await inspect(page,c,device,'parsed-unit-2',mode,'attached',c.expected);
    assert.equal(await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection)),before,'Opening cards never changes execution');
    if(c.id.startsWith('owner-'))await page.screenshot({path:path.join(out,device+'-'+c.id+'.png')});
    await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor({state:'hidden'});
    for(const mode of ['Effective','Guide'])await inspect(page,c,device,'parsed-unit-2',mode,'detached',false);
    if(c.expected){
     // A separate derived fixture adds an independent duplicate; the owner
     // fixture above remains byte-for-byte the two-unit input from the task.
     const body=c.text.slice(c.text.indexOf(c.book==='tyranids'&&c.id==='node-lash'?'3x Tyrant Guard':'5x '));
     await imported(page,c.text.trimEnd()+'\n'+body);
     assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units.length),3);
     await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor();
     await inspect(page,c,device,'parsed-unit-3','Effective','independent',false);
    }
    console.log('PASS '+device+' '+c.id);
   }
  }catch(e){await page.screenshot({path:path.join(out,device+'-'+book+'-failure.png')}).catch(()=>{});throw e;}finally{await context.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results,errors,missing},null,2)+'\n');if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log(JSON.stringify({status:'PASS',scenarios:cases.length,devices:2,checks:results.length,evidence:out}));
