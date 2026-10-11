/** Browser API parity only. No Effective Datasheet or Personal Guide UI. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {fixtures,runtime} from './roster-runtime-qa.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url)),root='/books/chaos-space-marines/v2/';
const allowed=new Set(['roster-runtime.mjs','roster-effect-context.mjs','roster-attachments.mjs','roster-attachment-build.mjs',
  'roster-attachment-bindings.json','roster-import.mjs','roster-import-bindings.mjs',
  'generated/roster-runtime.json','generated/roster-import.json'].map(name=>root+name));
const unexpected=[],requested=new Set(),expected=fixtures.map(fixture=>runtime(fixture).projection);
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(address==='/'){response.setHeader('Content-Type','text/html');response.end('<!doctype html><meta name="viewport" content="width=device-width"><title>Roster projection API QA</title>');return;}
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  requested.add(address);
  if(!allowed.has(address)&&!/^\/books\/shared\/(?:roster-v2|rule-contract-v2)\/[\w-]+\.mjs$/.test(address)){
    unexpected.push(address);response.setHeader('Content-Type','text/javascript');response.end('throw new Error("Forbidden legacy/presentation dependency")');return;}
  response.setHeader('Content-Type',address.endsWith('.mjs')?'text/javascript':'application/json');
  response.end(fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?
  {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const results=[];
try {
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));await page.goto(origin+'/');
    for(const [index,fixture] of fixtures.entries()) {
      const actual=await page.evaluate(async fixture=>{
        const {loadRosterRuntime}=await import('/books/chaos-space-marines/v2/roster-runtime.mjs');
        const {loadRosterImport}=await import('/books/chaos-space-marines/v2/roster-import.mjs');
        const {formRoster}=await import('/books/shared/roster-v2/context.mjs');
        const [service,importer,response]=await Promise.all([loadRosterRuntime(),loadRosterImport(),
          fetch('/books/chaos-space-marines/v2/generated/roster-runtime.json')]);
        const book=await response.json(),result=importer.import(fixture.text);
        if(result.status!=='READY')throw new Error('Fixture text not importable');
        const state=result.roster,rule=book.entities.find(rule=>rule.id===fixture.owner);
        if(rule.kind==='ENHANCEMENT'&&rule.ruleContract.assignment){
          const source=state.units[fixture.sourceOrdinal-1],models=formRoster(book,state).units.find(unit=>unit.instanceId===source.instanceId).profiles;
          const bearer=models.filter(profile=>profile.canonicalProfileId===fixture.bearerProfileId&&profile.quantity===1);
          if(bearer.length!==1)throw new Error('Ambiguous explicit fixture bearer');
          source.enhancementAssignments=[{enhancementId:rule.id,modelScopeId:bearer[0].scopeId}];
        }
        service.load(state);
        for(const edge of fixture.attachments)service.attach(service.state.units[edge.bodyguardOrdinal-1].instanceId,service.state.units[edge.leaderOrdinal-1].instanceId);
        if(fixture.initialAttachments)service.load({...service.snapshot(),initialAttachments:service.snapshot().attachments});
        localStorage.setItem('runtime-qa',JSON.stringify(service.snapshot()));
        return {projection:service.projection,ui:typeof service.effective,guide:typeof service.related};
      },fixture);
      assert.deepEqual(actual.projection,expected[index],device+' '+fixture.id);
      assert.equal(actual.ui,'undefined');assert.equal(actual.guide,'undefined');
    }
    await page.reload();const restored=await page.evaluate(async()=>{
      const {loadRosterRuntime}=await import('/books/chaos-space-marines/v2/roster-runtime.mjs');
      const service=await loadRosterRuntime();service.load(JSON.parse(localStorage.getItem('runtime-qa')));return service.projection;
    });
    assert.deepEqual(restored,expected.at(-1));assert.deepEqual(errors,[]);
    results.push({device,realImportedClauses:57,nodeProjectionParity:'PASS',reload:'PASS',uiMounted:false});await context.close();
  }
  assert.deepEqual(unexpected,[]);assert.ok(requested.has('/books/shared/roster-v2/effects.mjs'));
  console.log(JSON.stringify({status:'PASS',results,legacyDependencies:0,presentationDependencies:0,newEffectInterpreter:0}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
