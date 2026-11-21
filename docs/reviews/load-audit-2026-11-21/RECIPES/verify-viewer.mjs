/** Verify only the standalone evidence viewer, not application tests. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {chromium} from 'file:///E:/Warhammer/worktrees/browser-compat-v1/node_modules/playwright/index.mjs';
const OUT='E:/Warhammer/qa-evidence/load-audit-v1-2026-11-21',TMP='E:/Warhammer/qa-tmp/load-audit';
const context=await chromium.launchPersistentContext(TMP+'/viewer-profile',{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:1440,height:1000}});
try{const page=await context.newPage(),errors=[],remote=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))remote.push(request.url());});
 await page.goto(pathToFileURL(OUT+'/WATERFALL.html').href);await page.locator('#body tr').last().waitFor();assert.equal(await page.locator('#pick option').count(),144);assert.equal(await page.locator('#body tr').count(),20);
 await page.selectOption('#pick','live-slow4g-home-3-cold');await page.locator('#duration').click();assert.equal(await page.locator('#duration').getAttribute('aria-pressed'),'true');assert.match(await page.locator('#metrics').innerText(),/34\.72 s/);
 await page.screenshot({path:OUT+'/WATERFALL_PREVIEW.png',fullPage:true});assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
 fs.writeFileSync(OUT+'/VIEWER_QA.json',JSON.stringify({status:'PASS',observations:144,tableRows:20,localFileOnly:true,remoteRequests:remote,pageErrors:errors,switchObservation:true,switchRanking:true},null,2)+'\n');console.log('Offline waterfall viewer PASS:144 observations,20 rows,zero remote requests');
}finally{await context.close();}
