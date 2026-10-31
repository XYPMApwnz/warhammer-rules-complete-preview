import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchQaBrowser} from '../tests/helpers/qa-browser.cjs';
/** Focused selected-rule regression through the real main application.
 * Constructed New Recruit grammar; all changes use ordinary player controls.
 * DOM reads are assertions only. No state, style or runtime-output injection. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const fixtures=JSON.parse(fs.readFileSync(new URL('./enhancement-presentation-fixtures.json',import.meta.url),'utf8'));
const out=process.env.ENHANCEMENT_V2_SCREENSHOTS||createQaEvidenceDir('enhancement-presentation-browser-qa-');
fs.mkdirSync(out,{recursive:true});
const require=createRequire(import.meta.url);
let playwright,playwrightVersion;
try{playwright=require('playwright');playwrightVersion=require('playwright/package.json').version;}catch(error){
  if(error.code!=='MODULE_NOT_FOUND')throw error;
  const installed=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  playwright=require(installed);playwrightVersion=require(path.join(installed,'package.json')).version;
}
const books='(?:death-guard|adeptus-mechanicus|chaos-space-marines|emperors-children|tyranids)';
const bookFiles=new RegExp('^/books/'+books+'/v2/[\\w./-]+\\.(?:mjs|js|json|css)$');
const artFiles=new RegExp('^/books/'+books+'/assets/[\\w./-]+\\.(?:png|webp|jpe?g|svg)$');
const allowed=address=>!/(?:\/sources\/|-qa\.|-fixtures\.)/.test(address)&&(
  isApplicationTestDependency(address)||bookFiles.test(address)||artFiles.test(address)||
  /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)\/[\w./-]+\.(?:mjs|js|json|css)$/.test(address)||
  ['/books/shared/datasheet-system.css','/books/shared/unit-art.css','/assets/death-guard-cover.jpg'].includes(address));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const results=[],errors=[],missing=[],requestFailures=[];
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(repo,'.'+address);
  if(!allowed(address)||!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)){
    response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  response.end(fs.readFileSync(file));
});
const norm=text=>text.replace(/\s+/g,' ').replace(/[‘’]/g,"'").replace(/\s*\/\s*/g,'/').replace(/\s+([.,])/g,'$1').trim();
const ready=page=>page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function imported(page,text){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
}
async function attachment(page,c,detach=false){
  await roster(page);
  if(detach)await page.locator('[data-roster-action="detach"][data-leader-instance-id="'+c.leaderInstance+'"]').click();
  else{
    await page.locator('[data-attachment-candidate-for="'+c.bodyguardInstance+'"]').selectOption(c.leaderInstance);
    await page.locator('[data-attachment-target-instance-id="'+c.bodyguardInstance+'"] [data-roster-action="attach"]').click();
  }
  await page.locator('[data-attached-leader-instance-id="'+c.leaderInstance+'"]').waitFor({state:detach?'hidden':'visible'});
}
async function view(page,id,mode){
  await roster(page);
  if(mode==='Effective')await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
  else{
    await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
    await page.locator('main a[data-target-id="roster-unit/'+id+'"]').click();
  }
  await page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').waitFor();
}
async function inspect(page,c,device,mode,target,stage,wanted){
  await view(page,target,mode);
  const selected=page.locator('main [data-card-id="'+c.ruleId+'"][data-enhancement-owner-instance-id]');
  assert.equal(await selected.count(),wanted?1:0,c.name+' '+stage+' selected count');
  if(wanted){
    assert.equal(await selected.getAttribute('data-enhancement-owner-instance-id'),c.ownerInstance);
    const owner=page.locator('main .unit-card[data-roster-instance-id="'+c.ownerInstance+'"]');
    assert.equal(await owner.getAttribute('data-card-id'),c.ownerCanonicalId);
    assert.ok(norm(await selected.innerText()).includes(norm(c.sourceQuote)),c.name+' full source text');
    for(const rule of c.grantedRules||[]){
      const granted=selected.locator('[data-card-id="'+rule.canonicalId+'"][data-granted-by-rule-id="'+c.ruleId+'"]');
      assert.equal(await granted.count(),1);assert.equal(await granted.getAttribute('data-recipient-subject'),'UNIT');
      const recipients=JSON.parse(await granted.getAttribute('data-recipient-instance-ids'));
      assert.deepEqual(recipients.toSorted(),(stage==='detached-owner'?[c.ownerInstance]:[c.ownerInstance,c.bodyguardInstance]).toSorted());
      for(const segment of rule.segments)assert.ok(norm(await granted.innerText()).includes(norm(segment)),rule.canonicalId+' missing source cell segment');
    }
    if(stage==='attached'){
      await selected.scrollIntoViewIfNeeded();assert.ok(await selected.isVisible());
      await page.screenshot({path:path.join(out,device+'-'+c.n+'-'+mode.toLowerCase()+'.png')});
      if(c.grantedRules)await page.screenshot({path:path.join(out,device+'-'+c.n+'-'+mode.toLowerCase()+'-full-granted-rules.png'),fullPage:true});
      await selected.locator('a[data-target-id="'+c.ruleId+'"]').first().click();
      await page.locator('dialog[open]').waitFor();
      assert.ok(norm(await page.locator('dialog[open]').innerText()).includes(norm(c.sourceQuote)));
      await page.keyboard.press('Escape');
    }
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow');
  results.push({case:c.name,device,mode,stage,wanted,url:page.url(),status:'PASS'});
}
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const executable=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
  browser=await launchQaBrowser(playwright.chromium,{headless:true,...(fs.existsSync(executable)?{executablePath:executable}:{})});
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]])for(const c of fixtures.cases){
    const context=await browser.newContext({viewport}),page=await context.newPage();
    page.on('pageerror',error=>errors.push({case:c.name,device,error:error.message}));
    page.on('response',response=>{if(response.status()>=400)missing.push({url:response.url(),status:response.status()});});
    page.on('requestfailed',request=>{if(!request.failure()?.errorText.includes('ERR_ABORTED'))requestFailures.push({url:request.url(),error:request.failure()?.errorText});});
    try{
      await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+c.book+'"]').click();await ready(page);
      await imported(page,c.text);await attachment(page,c);
      for(const mode of ['Effective','Guide']){
        await inspect(page,c,device,mode,c.ownerInstance,'attached',true);
        await inspect(page,c,device,mode,c.bodyguardInstance,'attached-bodyguard-view',true);
        await inspect(page,c,device,mode,c.controlInstance,'independent-control',false);
      }
      await attachment(page,c,true);
      for(const mode of ['Effective','Guide']){
        await inspect(page,c,device,mode,c.ownerInstance,'detached-owner',true);
        await inspect(page,c,device,mode,c.bodyguardInstance,'detached-bodyguard',false);
      }
      await attachment(page,c);await page.reload();await ready(page);
      await inspect(page,c,device,'Effective',c.ownerInstance,'reload',true);
      await page.goBack();await page.goForward();await ready(page);
      await inspect(page,c,device,'Guide',c.ownerInstance,'back-forward',true);
      await imported(page,c.disabledText);await attachment(page,c);
      for(const mode of ['Effective','Guide'])await inspect(page,c,device,mode,c.ownerInstance,'removed',false);
      await imported(page,c.text);await attachment(page,c);
      await inspect(page,c,device,'Effective',c.ownerInstance,'reimport',true);
      console.log('PASS '+device+' '+c.name);
    }catch(error){results.push({case:c.name,device,status:'FAIL',error:error.stack});console.error(error.message);process.exitCode=1;}
    finally{await context.close();}
  }
  assert.equal(errors.length,0,'Uncaught JavaScript errors');assert.equal(missing.length,0,'Missing resources');
  assert.equal(requestFailures.length,0,'Failed requests');
}finally{
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({browser:browser?.version(),playwright:playwrightVersion,
    realNewRecruitExportTested:false,results,errors,missing,requestFailures},null,2));
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
