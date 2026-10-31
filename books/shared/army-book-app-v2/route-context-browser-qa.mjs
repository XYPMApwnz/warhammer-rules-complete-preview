import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
import {isApplicationTestDependency} from '../application-v2/browser-test-dependencies.mjs';
/** Real links on both books; fresh tabs never receive originating history state. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {decodeRoute} from './route-context.mjs';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const baseline=process.argv.includes('--baseline');
const changed=['runtime.mjs','datasheet-v1.mjs','reference-contract.mjs','roster.mjs'];
const baselineFiles=new Map(baseline?changed.map(file=>['/books/shared/army-book-app-v2/'+file,
  execFileSync('git',['show','8baf7915da347c5400858fd01ef1bd3ff644e733:books/shared/army-book-app-v2/'+file],{cwd:repo})]):[]);
const forbidden=[],errors=[],results=[];
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const allowed=isApplicationTestDependency(address)||/^\/books\/(?:death-guard|adeptus-mechanicus)\/v2\/[\w./-]+\.(?:html|mjs|json|css)$/.test(address)||
    /^\/books\/shared\/(?:army-book-app-v2|roster-v2|rule-contract-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
    /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
    /^\/(?:assets|books\/(?:death-guard|adeptus-mechanicus)\/assets)\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address);
  const file=path.resolve(repo,address.slice(1));
  if(!allowed||!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)){
    forbidden.push(address);response.writeHead(404);response.end();return;
  }
  const types={'.html':'text/html','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml',
    '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
  response.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});
  response.end(baselineFiles.get(address)||fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const cases=[
  {book:'adeptus-mechanicus',canonical:'unit-tech-priest-dominus',weapon:'datasheet-tech-priest-dominus:weapon:3',field:'skill',base:'3+',effective:'2+',text:
`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
Char2: 1x Tech-priest Dominus (75 pts): Volkite blaster, Macrostubber, Omnissian axe
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`},
  {book:'death-guard',canonical:'unit-lord-of-contagion',weapon:'datasheet-lord-of-contagion:weapon:1',field:'strength',base:'9',effective:'10',text:
`+ DETACHMENT: Paragons of Putrescence
+ DETACHMENT: Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues
Char2: 1x Lord of Contagion (120 pts): Manreaper
3x Deathshroud Terminators (150 pts): 3x Manreaper, 3x Plaguespurt gauntlet`}
];
const ready=async page=>{await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const observe=async(page,c,surface)=>{
  const root=page.locator(surface+` [data-card-id="${c.weapon}"]`).first();await root.waitFor();
  return root.evaluate((node,field)=>({id:node.dataset.cardId,instanceId:node.dataset.rosterInstanceId||null,scopeId:node.dataset.compositionId||null,
    value:JSON.parse(node.querySelector(`[data-fact-id$="::/${field}"]`).dataset.factValue)}),c.field);
};
try {
 for(const c of cases)for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(12000);
  context.on('page',tab=>tab.on('pageerror',error=>errors.push(error.message)));page.on('pageerror',error=>errors.push(error.message));
  const app=`${origin}/books/${c.book}/v2/app.html`;
  await page.goto(app);await ready(page);await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(c.text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===3);
  if(c.book==='death-guard'){
    await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption('parsed-unit-1');
    await page.locator('[data-attachment-target-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();
    await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
  }
  await page.locator('[data-roster-action="open-personal-guide"]').click();
  const personalUrl=page.url();
  await page.locator('main [data-roster-nav-instance-id="parsed-unit-1"]').click();
  const instanceUrl=page.url();
  const weaponLink=()=>page.locator(`main .weapon-name a[data-target-id="${c.weapon}"]`).first();
  const native=await weaponLink().getAttribute('href');
  await weaponLink().click();await page.waitForSelector('dialog[open]');
  const clicked=await observe(page,c,'dialog[open]');assert.equal(clicked.value,c.effective);
  const effectiveUrl=page.url();
  const tab=await context.newPage();await tab.goto(new URL(native,instanceUrl).href);await ready(tab);
  if(baseline){
    const directValue=await tab.locator(`[data-fact-id="${c.weapon}::/${c.field}"]`).first().getAttribute('data-fact-value');
    assert.equal(JSON.parse(directValue),c.base);results.push({book:c.book,device,clicked:clicked.value,native:JSON.parse(directValue),defectReproduced:true});
    await context.close();continue;
  }
  const identity=decodeRoute(native);assert.equal(identity.instanceId,'parsed-unit-1');assert.equal(identity.bookId,c.book);assert.equal(identity.registryId,c.book);
  assert.equal(identity.canonicalId,c.weapon);assert.ok(identity.rosterId);
  const direct=await observe(tab,c,'main');assert.deepEqual(direct,clicked,'Fresh URL lost effective identity');
  assert.equal(await tab.evaluate(()=>history.state?.armyBookV2?.detailId||null),null);
  await tab.reload();await ready(tab);assert.deepEqual(await observe(tab,c,'main'),clicked);
  await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
  const [modifiedTab]=await Promise.all([context.waitForEvent('page'),weaponLink().click({modifiers:['Control']})]);
  await ready(modifiedTab);assert.deepEqual(await observe(modifiedTab,c,'main'),clicked);await modifiedTab.close();
  // A middle-click uses the browser's native href, without the popup click handler.
  const [middleTab]=await Promise.all([context.waitForEvent('page'),weaponLink().click({button:'middle'})]);
  await ready(middleTab);assert.deepEqual(await observe(middleTab,c,'main'),clicked);await middleTab.close();
  await weaponLink().click();await page.waitForSelector('dialog[open]');
  await page.reload();await ready(page);assert.deepEqual(await observe(page,c,'dialog[open]'),clicked);
  // Clear all history: URL + persistent roster must be sufficient even in this tab.
  await page.evaluate(()=>{history.replaceState(null,'',location.href);dispatchEvent(new PopStateEvent('popstate'));});
  await page.waitForSelector('dialog[open]',{state:'hidden'});assert.deepEqual(await observe(page,c,'main'),clicked);
  await page.goto(instanceUrl);await ready(page);await weaponLink().click();await page.waitForSelector('dialog[open]');
  await page.goBack();await page.waitForSelector('dialog[open]',{state:'hidden'});
  assert.equal(page.url(),instanceUrl);await page.goForward();await page.waitForSelector('dialog[open]');assert.deepEqual(await observe(page,c,'dialog[open]'),clicked);
  // Same canonical identity, independently imported second owner, different effective result.
  await page.goto(personalUrl);await ready(page);await page.locator('main [data-roster-nav-instance-id="parsed-unit-2"]').click();
  const secondLink=await weaponLink().getAttribute('href');assert.equal(decodeRoute(secondLink).instanceId,'parsed-unit-2');
  await tab.goto(secondLink);await ready(tab);const second=await observe(tab,c,'main');assert.equal(second.value,c.base);assert.equal(second.instanceId,'parsed-unit-2');
  // Canonical references must shed unrelated effective owner/scope, while retaining reference access.
  await page.goto(effectiveUrl);await ready(page);await page.evaluate(()=>window.ArmyBookAppV2.showDetail('core-deep-strike',{reference:true}));
  const coreRoute=decodeRoute(page.url());assert.equal(coreRoute.registryId,'core-rules');assert.equal(coreRoute.instanceId,null);assert.equal(coreRoute.scopeId,null);
  const coreURL=page.url();await tab.goto(coreURL);await ready(tab);await tab.waitForSelector('main .v1-reference-article[data-card-id="core-deep-strike"]');
  await tab.reload();await ready(tab);await tab.waitForSelector('main .v1-reference-article[data-card-id="core-deep-strike"]');
  for(const mutate of [url=>url.searchParams.set('instance','absent-owner'),url=>url.searchParams.set('registry','another-registry'),
    url=>url.searchParams.set('scope','absent-scope'),url=>url.searchParams.set('profile','absent-profile')]){
    const bad=new URL(native);mutate(bad);await tab.goto(bad.href);await ready(tab);await tab.waitForSelector('main .v2-not-found');
    assert.equal(await tab.locator(`main [data-card-id="${c.weapon}"]`).count(),0,'Invalid explicit identity fell back to canonical');
  }
  // Old aliases are still valid; reloading the instance restores its persistent roster.
  for(const [url,selector]of [[app+'#view-roster','main .v2-roster'],[app+'#view-glossary','main .v2-glossary'],
    [app+'?view=reference#core-deep-strike','main .v1-reference-article'],
    [app+'?roster='+identity.rosterId+'#view-roster-guide','main .v2-hero'],
    [app+'?roster='+identity.rosterId+'#roster-unit%2Fparsed-unit-1','main .unit-card[data-roster-instance-id="parsed-unit-1"]']]){
    await tab.goto(url);await ready(tab);await tab.waitForSelector(selector);
  }
  await tab.goto(native);await ready(tab);assert.deepEqual(await observe(tab,c,'main'),clicked);
  results.push({book:c.book,device,normalClick:true,nativeNewTab:true,controlClick:true,middleClick:true,reload:true,
    directURL:true,historyIndependent:true,backForward:true,duplicateIsolation:true,invalidContextRejected:true,legacyAliases:true,effectiveValue:clicked.value});
  await context.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(forbidden,[]);
 console.log(JSON.stringify({status:'PASS',baseline,results,errors,forbidden}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
