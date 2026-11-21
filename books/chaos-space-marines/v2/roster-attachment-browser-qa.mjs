import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createCSMRosterAttachments} from './roster-attachments.mjs';
import {runAttachmentFixture} from './roster-attachment-fixture-runner.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const book=read('./generated/roster-import.json'),bindings=read('./roster-attachment-bindings.json'),fixtures=read('./roster-attachment-fixtures.json').fixtures;
const expected=fixtures.map(fixture=>runAttachmentFixture(createCSMRosterAttachments(book,bindings),fixture));
const root='/books/chaos-space-marines/v2/',allowed=new Set([
  ...['roster-attachments.mjs','roster-attachment-build.mjs','roster-attachment-bindings.json','roster-attachment-fixture-runner.mjs',
    'roster-import.mjs','roster-import-bindings.mjs','generated/roster-import.json'].map(name=>root+name),
  ...['attachment-service','import-service','parser','import','context'].map(name=>'/books/shared/roster-v2/'+name+'.mjs')]);
const unexpected=[],requested=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(address==='/') {response.setHeader('Content-Type','text/html');response.end('<!doctype html><meta name="viewport" content="width=device-width"><title>Shared attachment API boundary</title>');return;}
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  requested.push(address);
  if(!allowed.has(address)){unexpected.push(address);response.setHeader('Content-Type','text/javascript');response.end('throw new Error("Forbidden legacy/effect/UI dependency")');return;}
  response.setHeader('Content-Type',address.endsWith('.mjs')?'text/javascript':'application/json');response.end(fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await launchQaBrowser(chromium,{headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const devices=[];
try {
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));await page.goto(origin+'/');
    for(const [index,fixture] of fixtures.entries()) {
      const actual=await page.evaluate(async fixture=>{
        const {loadRosterAttachments}=await import('/books/chaos-space-marines/v2/roster-attachments.mjs');
        const {runAttachmentFixture}=await import('/books/chaos-space-marines/v2/roster-attachment-fixture-runner.mjs');
        const service=await loadRosterAttachments(),result=runAttachmentFixture(service,fixture);
        localStorage.setItem('attachment-qa',JSON.stringify(service.snapshot()));
        return {result,api:Object.keys(service)};
      },fixture);
      assert.deepEqual(actual.result,expected[index],device+' '+fixture.id);
      assert.deepEqual(actual.api,['state','groups','draft','import','load','snapshot','candidates','attach','detach','reattach','context','modelScopes']);
    }
    await page.reload();
    const restored=await page.evaluate(async()=>{
      const {loadRosterAttachments}=await import('/books/chaos-space-marines/v2/roster-attachments.mjs');
      const service=await loadRosterAttachments();return service.load(JSON.parse(localStorage.getItem('attachment-qa')));
    });
    assert.deepEqual(restored,expected.at(-1).trace.at(-1).state);assert.deepEqual(errors,[]);
    devices.push({device,status:'PASS',fixtures:fixtures.length,reload:'PASS',bodyguardFirstAPI:'PASS',effectsExecuted:0,uiMounted:0});await context.close();
  }
  assert.deepEqual(unexpected,[]);assert.deepEqual(new Set(requested),allowed);
  console.log(JSON.stringify({status:'PASS',devices,dependencyPoisoning:'PASS',legacyRuntimeReads:0,effectModulesLoaded:0,personalGuideModulesLoaded:0}));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
