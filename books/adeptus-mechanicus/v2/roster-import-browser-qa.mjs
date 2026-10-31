import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createAdMechRosterImport} from './roster-import.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const book=read('./generated/effective.json'),metadata=read('./roster-import-aliases.json'),fixtures=read('./roster-import-fixtures.json').fixtures;
const results=fixtures.map(fixture=>createAdMechRosterImport(book,metadata).import(fixture.text));
const root='/books/adeptus-mechanicus/v2/',allowed=new Set([
  root+'roster-import.mjs',root+'roster-import-aliases.json',root+'generated/effective.json',
  ...['import-service','parser','import','context'].map(name=>'/books/shared/roster-v2/'+name+'.mjs')
]);
const unexpected=[],requests=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if (address==='/') {response.setHeader('Content-Type','text/html');response.end('<!doctype html><title>Import boundary test</title>');return;}
  if (address==='/favicon.ico') {response.writeHead(204);response.end();return;}
  requests.push(address);
  if (!allowed.has(address)) {
    unexpected.push(address);response.setHeader('Content-Type','text/javascript');
    response.end('throw new Error("Poisoned/disconnected legacy or effect dependency")');return;
  }
  response.setHeader('Content-Type',address.endsWith('.mjs')?'text/javascript':'application/json');
  response.end(fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await launchQaBrowser(chromium,{headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const devices=[];
try {
  for (const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/');
    for (const [i,fixture] of fixtures.entries()) {
      const actual=await page.evaluate(async text=>{
        const {loadRosterImport}=await import('/books/adeptus-mechanicus/v2/roster-import.mjs');
        const service=await loadRosterImport(),result=service.import(text);
        const snapshot=service.state;
        if (snapshot) {localStorage.setItem('import-qa',JSON.stringify(snapshot));service.load(JSON.parse(localStorage.getItem('import-qa')));}
        return {result,state:service.state,api:Object.keys(service)};
      },fixture.text);
      assert.deepEqual(actual.result,results[i],`${device} ${fixture.id}`);
      assert.deepEqual(actual.state,results[i].roster);
      assert.deepEqual(actual.api,['state','draft','import','load','snapshot']);
    }
    // A real reload restores only the imported canonical UNIT_INSTANCE state.
    await page.reload();
    const restored=await page.evaluate(async()=>{
      const {loadRosterImport}=await import('/books/adeptus-mechanicus/v2/roster-import.mjs');
      const service=await loadRosterImport();return service.load(JSON.parse(localStorage.getItem('import-qa')));
    });
    assert.deepEqual(restored,results.filter(result=>result.status==='READY').at(-1).roster);
    assert.deepEqual(errors,[]);
    devices.push({device,status:'PASS',fixtures:fixtures.length,reload:'PASS',effectProjection:0,attachmentUI:0});
    await context.close();
  }
  assert.deepEqual(unexpected,[],'Legacy/effect/Rule Contract dependency is forbidden during import');
  assert.deepEqual(new Set(requests),allowed);
  console.log(JSON.stringify({status:'PASS',devices,legacyPoisonDisconnect:'PASS',legacyRuntimeReads:0,effectModulesLoaded:0,ruleContractModulesLoaded:0,requestedPaths:[...new Set(requests)]}));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
