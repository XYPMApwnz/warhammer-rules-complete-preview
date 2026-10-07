import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createAdMechRosterAttachments} from './roster-attachments.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const book=read('./generated/effective.json'),metadata=read('./roster-import-aliases.json');
const bindings=read('./roster-attachment-bindings.json'),fixtures=read('./roster-attachment-fixtures.json').fixtures;
assert.equal(fixtures.length,9);
const plain=value=>JSON.parse(JSON.stringify(value,(_key,item)=>item instanceof Set?[...item].sort():item instanceof Map?Object.fromEntries(item):item));
const inspect=service=>plain({state:service.snapshot(),groups:service.groups,
  units:service.state.units.map(unit=>({instanceId:unit.instanceId,candidates:service.candidates(unit.instanceId),
    unit:service.context(unit.instanceId,'UNIT'),formed:service.context(unit.instanceId,'FORMED_ATTACHED_UNIT'),
    roster:service.context(unit.instanceId,'ROSTER'),
    models:service.modelScopes(unit.instanceId).map(scope=>({scope,context:service.context(unit.instanceId,'MODEL',scope.scopeId)}))}))});

// Node and browser execute the same public product boundary. Expectations are
// source-backed fixture actions, never generated attachment answers.
const expected=fixtures.map(fixture=>{
  const service=createAdMechRosterAttachments(book,metadata,bindings),result=service.import(fixture.text);
  assert.equal(result.status,'READY',fixture.id);assert.deepEqual(service.state.attachments,[],'Import inferred attachment');
  const imported=service.snapshot(),initial=inspect(service),trace=[];
  const perform=action=>{
    const before=service.snapshot();let success=true,error;
    try {if(action.action==='DETACH')service.detach(action.participant);else service.attach(action.recipient,action.participant);}
    catch(failure) {success=false;error=failure.message;}
    assert.equal(success,action.valid,fixture.id);
    if(!success)assert.deepEqual(service.state,before,'Rejected action changed attachment state');
    return {success,...(error?{error}:{}),view:inspect(service)};
  };
  for(const action of fixture.actions)trace.push(perform(action));
  const final=inspect(service),orders=[];
  for(const order of fixture.equivalentOrders||[]) {
    service.load(imported);const actions=order.map(perform);
    assert.deepEqual(inspect(service),final,'Attachment order changed physical state');orders.push(actions);
  }
  service.load(final.state);
  assert.equal(service.effective,undefined);assert.equal(service.projection,undefined);
  return {result:plain(result),initial,trace,final,orders,api:Object.keys(service)};
});

const root='/books/adeptus-mechanicus/v2/',allowed=new Set([
  root+'roster-attachments.mjs',root+'roster-attachment-build.mjs',root+'roster-attachment-bindings.json',
  root+'roster-import.mjs',root+'roster-import-aliases.json',root+'generated/effective.json',
  ...['attachment-service','context','parser','import','import-service'].map(name=>'/books/shared/roster-v2/'+name+'.mjs')
]);
const requests=[],unexpected=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(address==='/') {
    response.setHeader('Content-Type','text/html');
    response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Attachment boundary test</title>');return;
  }
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  requests.push(address);
  if(!allowed.has(address)) {
    unexpected.push(address);response.setHeader('Content-Type','text/javascript');
    response.end('throw new Error("Poisoned/disconnected legacy, Rule Contract, effect, UI or projection dependency")');return;
  }
  response.setHeader('Content-Type',address.endsWith('.mjs')?'text/javascript':'application/json');
  response.setHeader('Cache-Control','no-store');response.end(fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const devices=[];
try {
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport,...(device==='phone'?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/');assert.equal(await page.evaluate(()=>innerWidth),viewport.width);
    for(const [index,fixture]of fixtures.entries()) {
      const actual=await page.evaluate(async fixture=>{
        const {loadRosterAttachments}=await import('/books/adeptus-mechanicus/v2/roster-attachments.mjs');
        const service=await loadRosterAttachments(),result=service.import(fixture.text);
        if(result.status!=='READY')throw new Error('Canonical import failed: '+fixture.id);
        if(service.state.attachments.length)throw new Error('Imported roster inferred attachments');
        const plain=value=>JSON.parse(JSON.stringify(value,(_key,item)=>item instanceof Set?[...item].sort():item instanceof Map?Object.fromEntries(item):item));
        const inspect=()=>plain({state:service.snapshot(),groups:service.groups,
          units:service.state.units.map(unit=>({instanceId:unit.instanceId,candidates:service.candidates(unit.instanceId),
            unit:service.context(unit.instanceId,'UNIT'),formed:service.context(unit.instanceId,'FORMED_ATTACHED_UNIT'),
            roster:service.context(unit.instanceId,'ROSTER'),
            models:service.modelScopes(unit.instanceId).map(scope=>({scope,context:service.context(unit.instanceId,'MODEL',scope.scopeId)}))}))});
        const imported=service.snapshot(),initial=inspect(),trace=[];
        const perform=action=>{
          const before=JSON.stringify(service.snapshot());let success=true,error;
          try {if(action.action==='DETACH')service.detach(action.participant);else service.attach(action.recipient,action.participant);}
          catch(failure){success=false;error=failure.message;}
          if(success!==action.valid)throw new Error('Wrong action validity: '+fixture.id);
          if(!success&&JSON.stringify(service.state)!==before)throw new Error('Invalid action changed physical state');
          return {success,...(error?{error}:{}),view:inspect()};
        };
        for(const action of fixture.actions)trace.push(perform(action));
        const final=inspect(),orders=[];
        for(const order of fixture.equivalentOrders||[]) {
          service.load(imported);const actions=order.map(perform);
          if(JSON.stringify(inspect())!==JSON.stringify(final))throw new Error('Attachment order changed physical state');orders.push(actions);
        }
        service.load(final.state);localStorage.setItem('attachment-qa/'+fixture.id,JSON.stringify(service.snapshot()));
        if(service.effective!==undefined||service.projection!==undefined)throw new Error('Attachment boundary enabled effects/projection');
        if(document.querySelector('input,button,dialog,nav,main'))throw new Error('Attachment harness unexpectedly enabled player UI');
        return {result:plain(result),initial,trace,final,orders,api:Object.keys(service)};
      },fixture);
      assert.deepEqual(actual,expected[index],`${device} ${fixture.id}: Node/browser physical state parity`);
      await page.reload();
      const restored=await page.evaluate(async identity=>{
        const {loadRosterAttachments}=await import('/books/adeptus-mechanicus/v2/roster-attachments.mjs');
        const service=await loadRosterAttachments();service.load(JSON.parse(localStorage.getItem('attachment-qa/'+identity)));
        const plain=value=>JSON.parse(JSON.stringify(value,(_key,item)=>item instanceof Set?[...item].sort():item instanceof Map?Object.fromEntries(item):item));
        return plain({state:service.snapshot(),groups:service.groups,
          units:service.state.units.map(unit=>({instanceId:unit.instanceId,candidates:service.candidates(unit.instanceId),
            unit:service.context(unit.instanceId,'UNIT'),formed:service.context(unit.instanceId,'FORMED_ATTACHED_UNIT'),
            roster:service.context(unit.instanceId,'ROSTER'),
            models:service.modelScopes(unit.instanceId).map(scope=>({scope,context:service.context(unit.instanceId,'MODEL',scope.scopeId)}))}))});
      },fixture.id);
      assert.deepEqual(restored,expected[index].final,`${device} ${fixture.id}: reload lost physical attachment context`);
    }
    assert.deepEqual(errors,[],'Uncaught attachment browser error');
    devices.push({device,status:'PASS',fixtures:fixtures.length,actions:fixtures.reduce((sum,fixture)=>sum+fixture.actions.length,0),
      orderComparisons:fixtures.reduce((sum,fixture)=>sum+(fixture.equivalentOrders||[]).length,0),reloads:fixtures.length,
      noInferredAttachments:'PASS',invalidActionsAtomic:'PASS',nodeContextParity:'PASS',playerUIEnabled:0,effectsEnabled:0});
    await context.close();
  }
  assert.deepEqual(unexpected,[],'Forbidden attachment dependency');assert.deepEqual(new Set(requests),allowed);
  console.log(JSON.stringify({status:'PASS',devices,legacyPoisonDisconnect:'PASS',legacyRuntimeReads:0,
    effectModulesLoaded:0,projectionModulesLoaded:0,ruleContractModulesLoaded:0,requestedPaths:[...new Set(requests)]},null,2));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
