import {isApplicationTestDependency} from '../../shared/application-v2/browser-test-dependencies.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const dependent=process.argv.includes('--dependent-roles');
const {cases,rosterText,attachedPairText}=await import(dependent?'./dependent-roles-qa.mjs':'./required-recipients-qa.mjs');

const repo=fileURLToPath(new URL('../../../',import.meta.url)),legacy=[],errors=[],requests=[];
const server=http.createServer((request,response)=>{
  const pathname=new URL(request.url,'http://localhost').pathname;
  const allowed=isApplicationTestDependency(pathname)||/^\/books\/adeptus-mechanicus\/v2\//.test(pathname)||
    /^\/books\/shared\/(?:army-book-app-v2|roster-v2|rule-contract-v2)\//.test(pathname)||
    /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(pathname)||
    /^\/(?:books\/adeptus-mechanicus\/assets|assets)\//.test(pathname);
  if(!allowed){if(pathname!=='/favicon.ico')legacy.push(pathname);response.writeHead(404);response.end();return;}
  const file=path.resolve(repo,'.'+pathname);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)){requests.push(pathname);response.writeHead(404);response.end();return;}
  const types={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json',
    '.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
  response.writeHead(200,{'Content-Type':types[path.extname(file)]||'image/jpeg','Cache-Control':'no-store'});
  response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?
  {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;
if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
const results=[];
try {
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(15000);
    page.on('pageerror',error=>errors.push(device+': '+error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/books/adeptus-mechanicus/v2/app.html`);
    await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));
    await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
    const importRoster=async text=>{
      await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
      await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
      await page.locator('[data-roster-action="review-import"]').click();
      await page.waitForSelector('[data-roster-action="open-personal-guide"]');
      assert.equal(await page.locator('[data-roster-bindings] select').count(),0);
      await page.locator('[data-roster-action="open-personal-guide"]').click();
    };
    const related=async(instanceId,ruleId,expected,caption)=>{
      await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),instanceId);
      await page.waitForFunction(id=>document.querySelector('main .v2-current-card')?.dataset.rosterInstanceId===id,instanceId);
      const state=await page.evaluate(({instanceId,ruleId})=>window.ArmyBookAppV2.roster.related(instanceId).find(row=>row.ruleId===ruleId).applicability,{instanceId,ruleId});
      assert.equal(state,expected,caption+' runtime');
      await page.locator('main .ds-related-rules-button').click();
      await page.waitForSelector('dialog.v2-related-dialog[open]');
      const card=page.locator(`dialog[open] [data-rule-id="${ruleId}"]`);
      assert.equal(await card.count(),expected==='NO_MATCH'?0:1,caption+' DOM');
      if(expected!=='NO_MATCH')assert.equal(await card.getAttribute('data-applicability'),expected);
      const visible=await page.locator('dialog[open] [data-rule-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.applicability));
      assert.ok(visible.every(value=>['MATCH','CONDITIONAL'].includes(value)));
      if(screenshots)await page.screenshot({path:path.join(screenshots,`${caption}-${device}.png`),fullPage:true});
      await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
    };
    for(const test of cases)for(const present of [false,true]) {
      await importRoster(rosterText(test,present));
      await related('parsed-unit-1',test.ruleId,present?'CONDITIONAL':test.absentState||'NO_MATCH',test.id+(present?'-present':'-absent'));
    }
    if(!dependent) {
    await importRoster(attachedPairText);
    await related('parsed-unit-2',cases[3].ruleId,'CONDITIONAL','AM05-separate');
    const attach=async()=>{
      await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
      await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
      await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();
      await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
      await page.locator('[data-roster-action="open-personal-guide"]').click();
    };
    await attach();
    await related('parsed-unit-2',cases[3].ruleId,'NO_MATCH','AM05-attached-bodyguard');
    await related('parsed-unit-1',cases[3].ruleId,'NO_MATCH','AM05-attached-support');
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
    await page.locator('[data-roster-action="detach"]').click();
    await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
    await page.locator('[data-roster-action="open-personal-guide"]').click();
    await related('parsed-unit-2',cases[3].ruleId,'CONDITIONAL','AM05-detached');
    await attach();await related('parsed-unit-2',cases[3].ruleId,'NO_MATCH','AM05-reattached');
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    results.push({device,status:'PASS',cases:cases.map(test=>test.id),recipientPresenceCases:8,
      attachmentCardinalityCases:dependent?0:5,conditionalPreserved:true});
    await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(legacy,[]);assert.deepEqual(requests,[]);
  console.log(JSON.stringify({status:'PASS',results,legacyRuntimeReads:0,uncaughtErrors:0}));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
