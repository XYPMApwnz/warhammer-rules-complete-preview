/** Archived synthetic import-side-effect RISK, not a current product failure.
 * The observed FAIL/exit 1 is intentional and retained; the accepted product
 * criterion is checked separately by v2/pwa-transition-qa.mjs on real factories.
 * Diagnostic security gate for the requested minimal policy, not game fixtures.
 * Actual Tau registration/factory/dependencies/data are served unchanged except
 * a declared top-level generation marker appended by the diagnostic HTTP server.
 * No production facts, names, IDs, points, exports or contracts are rewritten.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../helpers/browser-launch.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=process.env.WH_PWA_EVIDENCE;
if(!out)throw new Error('WH_PWA_EVIDENCE is required; evidence must stay outside repository');
fs.mkdirSync(out,{recursive:true});
const prefix='/warhammer-rules-complete-preview/',versions={A:'aaaaaaaaaaaaaaaa',B:'bbbbbbbbbbbbbbbb'};
// Freeze the original transport implementation; later production changes must
// not silently change this archived synthetic risk reproduction.
const rawWorker=execFileSync('git',['show','0cbf20e54fa5cecddb1f5e231db646772fafc525:service-worker.js'],{cwd:root,encoding:'utf8'});
// Bounded transport fixture: preserve the production cache/network functions,
// use a two-file shell and substitute only the proposed no-state fetch policy.
let worker=rawWorker.replace(/const APP_SHELL = \[[\s\S]*?\n\];/,'const APP_SHELL = ["./transport.html", "./cached-small.txt"];');
const fetchStart=worker.indexOf('self.addEventListener("fetch", (event) => {');
assert.ok(fetchStart>0);
worker=worker.slice(0,fetchStart)+`self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/glossary/generated/cache-revision.js')&&url.searchParams.has('version-check')){
  event.respondWith(fetch(new Request(request,{cache:'no-store'})));return;
 }
 event.respondWith(fetchAndCache(new Request(request,{cache:'no-store'})).catch(async()=>
  (await caches.match(request))||new Response('offline',{status:503})));
});\n`;
// Retention is part of the minimal policy; no version/client state is added.
worker=worker.replace(/self\.addEventListener\("activate", \(event\) => \{[\s\S]*?\n\}\);/,"self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));");
let generation='A';const requests=[];
const factory='books/tau-empire/v2/roster-boot.mjs';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://fixture'),relative=decodeURIComponent(url.pathname.startsWith(prefix)?url.pathname.slice(prefix.length):'');
 requests.push({url:req.url,generation});res.setHeader('cache-control','no-store');
 if(relative==='service-worker.js'){res.writeHead(200,{'content-type':'text/javascript'});return res.end(worker);}
 if(relative==='glossary/generated/cache-revision.js'){res.writeHead(200,{'content-type':'text/javascript'});return res.end(`self.WH40K_CACHE_REVISION='${versions[generation]}';`);}
 if(relative==='cached-small.txt'){res.writeHead(200);return res.end('transport shell');}
 if(relative==='transport.html'){
  res.writeHead(200,{'content-type':'text/html'});
  return res.end(`<!doctype html><title>Minimal PWA transport</title><script>
    window.runningVersion='${versions[generation]}';
    window.registrationReady=navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'});
    window.readVersion=async()=>{
      const nonce=crypto.randomUUID();
      const r=await fetch('./glossary/generated/cache-revision.js?version-check='+nonce,{cache:'no-store'});
      if(!r.ok)throw new Error('version unavailable');
      return (await r.text()).match(/WH40K_CACHE_REVISION='([^']+)'/)[1];
    };
    // Perfect knowledge of the running revision is deliberately granted here.
    // If the race is unsafe even with it, weaker startup inference cannot fix it.
    window.loadChecked=async()=>{
      const before=await readVersion();if(before!==runningVersion)return {state:'UPDATE_REQUIRED_BEFORE',before};
      window.preflightPassed=true;
      await new Promise(resolve=>window.releaseLoad=resolve);
      const roster=await window.tauRegistration.createRoster();
      const after=await readVersion();
      return {state:after===runningVersion?'READY':'UPDATE_REQUIRED_AFTER',before,after,rosterState:roster.state};
    };
  </script>`);
 }
 const resolved=path.resolve(root,relative);
 if(!relative||!resolved.startsWith(root+path.sep)||!fs.existsSync(resolved)||!fs.statSync(resolved).isFile()){
  res.writeHead(404);return res.end('not found');
 }
 const ext=path.extname(resolved),mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css'};
 let body=fs.readFileSync(resolved);
 if(relative===factory)body=Buffer.concat([body,Buffer.from(`\n// Diagnostic generation marker: no game fact or export changes.\nglobalThis.__pwaEvaluatedFactory=${JSON.stringify(generation)};\n`)]);
 res.writeHead(200,{'content-type':mime[ext]||'application/octet-stream'});res.end(body);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await launchChromium();const results=[];
try{
 for(const scenario of ['stable','changed-before-check','publication-between-check-and-import']){
  generation='A';requests.length=0;
  const context=await browser.newContext({serviceWorkers:'allow',viewport:{width:1440,height:900}}),page=await context.newPage();page.setDefaultTimeout(120000);
  try{
   await page.goto(origin+'transport.html');await page.evaluate(()=>registrationReady);await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
   // Load the real registration A now; its factory remains genuinely lazy.
   await page.evaluate(async()=>window.tauRegistration=(await import('./books/tau-empire/v2/registration.mjs')).registration);
   assert.equal(requests.some(row=>row.url.split('?')[0]===prefix+factory),false);
   if(scenario==='changed-before-check')generation='B';
   const pending=page.evaluate(()=>loadChecked());
   if(scenario!=='changed-before-check'){
    await page.waitForFunction(()=>window.preflightPassed===true);
    if(scenario==='publication-between-check-and-import')generation='B';
    await page.evaluate(()=>releaseLoad());
   }
   const actual=await pending,marker=await page.evaluate(()=>window.__pwaEvaluatedFactory||null);
   const registrationSource=fs.readFileSync(path.join(root,'books/tau-empire/v2/registration.mjs'));
   const row={scenario,runningVersion:versions.A,actual,evaluatedFactory:marker,
    expected:scenario==='stable'?'READY with factory A':scenario==='changed-before-check'?'UPDATE_REQUIRED before any factory import':'Do not execute B in document A, even when publication occurs after preflight',
    sourceRegistrationSha256:createHash('sha256').update(registrationSource).digest('hex'),
    actualRequests:requests.filter(r=>r.url.includes('version-check')||r.url.split('?')[0]===prefix+factory)};
   row.status=scenario==='stable'?(actual.state==='READY'&&marker==='A'?'PASS':'FAIL'):
    scenario==='changed-before-check'?(actual.state==='UPDATE_REQUIRED_BEFORE'&&marker===null?'PASS':'FAIL'):
    (marker==='B'?'FAIL':'PASS');
   results.push(row);
  }finally{await context.close();}
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
const report={kind:'MINIMAL_NETWORK_FIRST_PRE_POST_VERSION_CHECK_SECURITY_GATE',fixture:'Actual source graph and JSON; external HTTP-only generation markers; no production source mutation',strategy:'Network first with offline cache fallback; fresh nonce version requests; before/after factory checks; no client pin map',results};
fs.writeFileSync(path.join(out,'MINIMAL_RACE_RESULTS.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exitCode=results.some(result=>result.status==='FAIL')?1:0;
