/** Actual shared app, synthetic canonical/effective inputs, no army data or writes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createSyntheticPersonalFixture} from './personal-datasheet-qa.mjs';
import {encodeRoute} from './route-context.mjs';

const f=createSyntheticPersonalFixture('route-synthetic');
const bookId=f.payload.book.id,weaponId=f.id('selected-weapon');
const detachmentId=f.id('detachment');
f.payload.cards.push({id:detachmentId,kind:'DETACHMENT',title:'Synthetic Detachment',parentId:null,contextId:detachmentId,
  source:{entityId:detachmentId},fields:[],children:[],links:[]});
f.payload.groups.find(group=>group.id==='detachments').itemIds.push(detachmentId);
f.payload.bookPresentation={schema:'army-book-app-v2/book-v1-presentation',records:{}};
f.payload.glossary={schema:'army-book-glossary/v2',authority:'DISPOSABLE_PROJECTION',entries:[weaponId,f.id('commander')].map(id=>{
  const card=f.cards.get(id);return {targetId:id,label:card.title,category:card.kind,contextLabel:'Synthetic Book',aliases:[]};
})};
const a=f.unit,b=f.duplicate.unit;
const effectiveA=f.effective,effectiveB=structuredClone(effectiveA);
effectiveB.instanceId=b.instanceId;
for(const record of [...effectiveB.profiles,...effectiveB.weapons]){
  record.ownerInstanceId=b.instanceId;record.scopeId=record.scopeId.replace(a.instanceId,b.instanceId);
}
function modify(effective,skills,moves){
  effective.applied=[];
  effective.weapons.forEach((weapon,index)=>{
    weapon.fields.find(field=>field.label==='skill').value=skills[index];
    effective.applied.push({operation:'MODIFY_STAT',field:'skill',before:'3+',after:skills[index],
      targetWeaponProfileId:weapon.id,targetCompositionId:weapon.scopeId});
  });
  effective.profiles.forEach((profile,index)=>{
    profile.fields.find(field=>field.label==='stats').value.M=moves[index];
    effective.applied.push({operation:'MODIFY_STAT',field:'M',before:'6"',after:moves[index],
      targetProfileId:profile.id,targetCompositionId:profile.scopeId});
  });
}
modify(effectiveA,['2+','4+','5+'],['8"','9"','10"']);
modify(effectiveB,['5+','6+','4+'],['11"','12"','13"']);
const foreign={instanceId:f.id('foreign-owner'),canonicalUnitId:f.id('other-unit'),startingStrength:1,
  enhancementIds:[],modelRows:[{rowId:'other-row',canonicalProfileId:f.id('other-profile'),quantity:1,selections:[],loadouts:[]}],selections:[]};
const foreignEffective={instanceId:foreign.instanceId,canonicalUnitId:foreign.canonicalUnitId,startingStrength:1,
  keywords:['INFANTRY'],profiles:[],weapons:[],unitAbilities:[],applied:[],conditional:[]};
const state={bookId,rosterId:'synthetic-route-roster',units:[a,b,foreign],attachments:[],detachmentIds:[detachmentId],
  detachments:[{instanceId:'detachment-instance',canonicalDetachmentId:detachmentId}]};
const data={payload:f.payload,state,effective:{[a.instanceId]:effectiveA,[b.instanceId]:effectiveB,[foreign.instanceId]:foreignEffective}};
const immutable=JSON.stringify(data);
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/books/shared/army-book-app-v2/styles.css">
<link rel="stylesheet" href="/books/shared/army-book-app-v2/datasheet-v1.css">
<link rel="stylesheet" href="/books/shared/army-book-app-v2/book-v1.css"></head><body><script type="module">
import {mount} from '/books/shared/army-book-app-v2/runtime.mjs';
const data=await (await fetch('/fixture.json')).json();
const service={state:data.state,catalog:data.payload.cards.map(card=>({id:card.id,title:card.title,kind:card.kind})),
 draft:()=>({}),import:()=>({}),load(value){this.state=value;return {valid:true};},snapshot(){return structuredClone(this.state);},
 effective(id){return data.effective[id];},related:()=>[],candidates:()=>[],attach:()=>({valid:true}),detach:()=>({valid:true})};
window.syntheticService=service;
mount(document,data.payload,{roster:service});
</script></body></html>`;
const requests=[],types={'.mjs':'text/javascript','.css':'text/css','.js':'text/javascript'};
const platformFile=address=>address.startsWith('/books/shared/army-book-app-v2/')||
  ['/books/shared/datasheet-system.css','/books/shared/unit-art.css'].includes(address);
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(address==='/app.html'){response.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});response.end(html);return;}
  if(address==='/fixture.json'){response.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify(data));return;}
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(repo,'.'+address);
  if(!platformFile(address)||!file.startsWith(repo)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/app.html`;
const installed='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installed)?installed:undefined);
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const errors=[],results=[];
const ready=async page=>{await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const physicalURL=instanceId=>encodeRoute(base,{destination:'UNIT_INSTANCE',bookId,registryId:bookId,rosterId:state.rosterId,instanceId});
const referenceURL=(instanceId,scopeId,profileId,canonicalId=weaponId)=>encodeRoute(base,{destination:'REFERENCE',bookId,registryId:bookId,
  rosterId:state.rosterId,instanceId,scopeId,profileId,canonicalId});
async function assertValue(page,id,field,value,dialog=false){
  const root=dialog?'dialog[open]':'main';
  const fact=page.locator(root+' [data-fact-id]');
  const values=await fact.evaluateAll((nodes,key)=>nodes.filter(node=>node.dataset.factId===key).map(node=>JSON.parse(node.dataset.factValue)),id+'::'+field);
  assert.deepEqual(values,[value],`Wrong effective ${id}${field} at ${page.url()}`);
}
async function blocked(page,url){
  await page.goto(url);await ready(page);await page.waitForSelector('main .v2-not-found');
  assert.equal(await page.locator('main .weapon-row').count(),0,'Invalid identity fell back to canonical weapon');
  assert.equal(await page.locator('dialog[open]').count(),0,'Invalid identity retained a detail popup');
}
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    context.on('page',page=>{page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(12000);});
    const page=await context.newPage();await page.goto(physicalURL(a.instanceId));await ready(page);
    const first=page.locator('main .weapon-row[data-card-id="'+weaponId+'"] a[data-target-id="'+weaponId+'"]').first();
    const href=await first.getAttribute('href'),expectedScope=effectiveA.weapons[0].scopeId;
    const identity=new URL(href);
    assert.equal(identity.searchParams.get('instance'),a.instanceId);assert.equal(identity.searchParams.get('scope'),expectedScope);
    assert.equal(identity.searchParams.get('profile'),effectiveA.profiles[0].id);
    await first.click();await page.waitForSelector('dialog[open]');await assertValue(page,weaponId,'/skill','2+',true);
    await page.goBack();await page.waitForSelector('main .unit-card');await page.waitForSelector('dialog[open]',{state:'hidden'});
    await page.goForward();await page.waitForSelector('dialog[open]');await assertValue(page,weaponId,'/skill','2+',true);
    await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});
    const opening=context.waitForEvent('page');await first.click({modifiers:['Control']});const tab=await opening;
    await ready(tab);await assertValue(tab,weaponId,'/skill','2+');
    await tab.reload();await ready(tab);await assertValue(tab,weaponId,'/skill','2+');await tab.close();
    const direct=await context.newPage();await direct.goto(href);await ready(direct);await assertValue(direct,weaponId,'/skill','2+');
    await direct.reload();await ready(direct);await assertValue(direct,weaponId,'/skill','2+');
    // Same canonical weapon, distinct physical owner, distinct composition scope.
    for(const [effective,skills]of [[effectiveA,['2+','4+','5+']],[effectiveB,['5+','6+','4+']]])for(let index=0;index<3;index++){
      await direct.goto(referenceURL(effective.instanceId,effective.weapons[index].scopeId,effective.profiles[index].id));await ready(direct);
      await assertValue(direct,weaponId,'/skill',skills[index]);
    }
    const profile=effectiveA.profiles[1];
    await direct.goto(referenceURL(a.instanceId,profile.scopeId,profile.id,profile.id));await ready(direct);
    await assertValue(direct,profile.id,'/stats/M','9"');
    const selectedA=referenceURL(a.instanceId,expectedScope,effectiveA.profiles[0].id);
    const selectedB=referenceURL(b.instanceId,effectiveB.weapons[0].scopeId,effectiveB.profiles[0].id);
    await direct.goto(selectedA);await ready(direct);
    await direct.evaluate(({url,wrongOwner,wrongScope})=>{
      history.replaceState({armyBookV2:{detailId:decodeURIComponent(location.hash.slice(1)),detailInstanceId:wrongOwner,
        detailScopeId:wrongScope,backgroundView:'PERSONAL',backgroundId:decodeURIComponent(location.hash.slice(1)),backgroundInstanceId:wrongOwner}},'',url);
      dispatchEvent(new PopStateEvent('popstate'));
    },{url:selectedB,wrongOwner:a.instanceId,wrongScope:expectedScope});
    await assertValue(direct,weaponId,'/skill','5+',true);
    for(const url of [referenceURL('missing-owner',expectedScope,effectiveA.profiles[0].id),
      referenceURL(foreign.instanceId,null,null),referenceURL(a.instanceId,'missing-scope',effectiveA.profiles[0].id),
      referenceURL(a.instanceId,expectedScope,'missing-profile'),referenceURL(a.instanceId,expectedScope,effectiveA.profiles[1].id),
      referenceURL(a.instanceId,expectedScope,effectiveA.profiles[0].id,f.id('unselected-weapon'))])await blocked(direct,url);
    assert.deepEqual(errors,[],'Shared app emitted runtime errors');
    results.push({device,normalClick:'PASS',nativeNewTab:'PASS',directURL:'PASS',reload:'PASS',backForward:'PASS',
      duplicateInstances:2,mixedScopes:3,profileValues:'PASS',invalidContexts:6,staleHistory:'PASS'});
    await context.close();
  }
  assert.equal(JSON.stringify(data),immutable,'Browser harness mutated immutable fixture');
  const external=requests.filter(address=>address!=='/app.html'&&address!=='/fixture.json'&&address!=='/favicon.ico'&&!platformFile(address));
  assert.deepEqual(external,[],'Unexpected non-platform dependency was requested');
  console.log(JSON.stringify({status:'PASS',syntheticOnly:true,armyFactualReads:0,results,errors}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
