/** Real ArmyBookApp V2 browser consumer, entirely synthetic facts and roster.
 * Loads no Death Guard or Adeptus Mechanicus book data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {fixture,cardsFor} from './weapon-contribution-effects-qa.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const id=name=>'synthetic-contribution:'+name;
const {book,state}=fixture();
// Source classification can be carried by the declaration without adding a
// competing canonical weapon definition. The effective adapter preserves it.
delete book.entities.find(entity=>entity.id===id('gift-weapon')).data.mode;
book.entities.find(entity=>entity.id===id('gift')).ruleContract.clauses[0].rosterEffects[0].weaponMode='ranged';
const cards=[...cardsFor(book).values()];
cards.find(card=>card.id===id('detachment')).children=[id('gift')];
cards.find(card=>card.id===id('gift')).children=[id('gift-weapon')];
const payload={schema:'army-book-app-v2/presentation',book:{id:book.bookId,title:'Synthetic Army Book',edition:'Synthetic'},
  cards,groups:[{id:'detachments',label:'Detachments',itemIds:[id('detachment')]},
    {id:'datasheets',label:'Datasheets',itemIds:[id('bearer'),id('bodyguard')]}],
  datasheetPresentation:{schema:'army-book-app-v2/datasheet-layout',sectionRoles:{},artwork:{}},
  bookPresentation:{schema:'army-book-app-v2/book-v1-presentation',records:{[id('detachment')]:{enhancementIds:[id('gift')]},[id('gift')]:{}}}};
const inputs={book,state,payload};
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/books/shared/army-book-app-v2/styles.css"></head><body><script type="module">
import {mount} from '/books/shared/army-book-app-v2/runtime.mjs';
import {createRosterRuntime} from '/books/shared/roster-v2/runtime.mjs';
import {createRuleContractSchema} from '/books/shared/rule-contract-v2/schema.mjs';
const inputs=await fetch('/synthetic-input.json').then(response=>response.json());
window.syntheticBefore=JSON.stringify(inputs);window.syntheticInputs=inputs;
const runtime=createRosterRuntime(inputs.book,{parse:()=>null,...createRuleContractSchema({stateFields:{}})});
runtime.load(inputs.state);const app=mount(document,inputs.payload,{roster:runtime});
await app.rosterPanel.ready;app.openInstance('owner-a');window.syntheticReady=true;
</script></body></html>`;
const reads=[],errors=[];
const server=http.createServer((request,response)=>{
  const pathname=new URL(request.url,'http://127.0.0.1').pathname;
  response.setHeader('Cache-Control','no-store');
  if(pathname==='/synthetic.html'){response.setHeader('Content-Type','text/html');response.end(html);return;}
  if(pathname==='/synthetic-input.json'){response.setHeader('Content-Type','application/json');response.end(JSON.stringify(inputs));return;}
  // Only shared executable/presentation modules can be read; no book payload.
  if(pathname.startsWith('/books/shared/') && /\.(mjs|js|css)$/.test(pathname)) {
    const resolved=path.resolve(repo,'.'+pathname),root=path.resolve(repo,'books/shared')+path.sep;
    if(resolved.startsWith(root) && fs.existsSync(resolved)) {
      reads.push(pathname);response.setHeader('Content-Type',pathname.endsWith('.css')?'text/css':'text/javascript');
      response.end(fs.readFileSync(resolved));return;
    }
  }
  response.statusCode=404;response.end('Not a synthetic dependency');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const results=[];
try {
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    const page=await browser.newPage({viewport});page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(device+': '+error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/synthetic.html`);
    await page.waitForFunction(()=>window.syntheticReady===true);
    const row=page.locator('main .weapon-row').filter({has:page.locator(`a[data-target-id="${id('gift-weapon')}"]`)});
    assert.equal(await row.count(),1,'Exact owner omitted or duplicated the contributed weapon');
    const rowIdentity=await row.evaluate(node=>({canonical:node.dataset.cardId,scope:node.dataset.compositionId,instance:node.dataset.rosterInstanceId}));
    assert.equal(rowIdentity.canonical,id('gift-weapon'));assert.equal(rowIdentity.instance,'owner-a');assert(rowIdentity.scope);
    assert.equal(await row.locator('[data-label="S"] .ds-effective-value').innerText(),'6');
    await row.locator('a.weapon-button').click();
    const popup=page.locator('dialog.v2-detail-dialog[open]');await popup.waitFor({state:'visible'});
    const popupWeapon=popup.locator('.popup-weapon-profile');assert.equal(await popupWeapon.count(),1);
    const popupIdentity=await popupWeapon.evaluate(node=>({canonical:node.dataset.cardId,scope:node.dataset.compositionId,instance:node.dataset.rosterInstanceId}));
    assert.deepEqual(popupIdentity,rowIdentity,'Popup changed canonical/effective physical scope');
    assert.equal(await popupWeapon.locator('[data-label="S"] .ds-effective-value').innerText(),'6');
    assert.equal(await popupWeapon.locator('[data-label="Range"] .ds-effective-value').innerText(),'24"');
    await page.keyboard.press('Escape');await popup.waitFor({state:'hidden'});
    await page.evaluate(()=>window.ArmyBookAppV2.openInstance('owner-b'));
    assert.equal(await page.locator(`main .weapon-row a[data-target-id="${id('gift-weapon')}"]`).count(),0,'Unenhanced duplicate exposed the contributed weapon');
    await page.evaluate(()=>window.ArmyBookAppV2.openInstance('owner-a'));
    assert.equal(await page.locator(`main .weapon-row a[data-target-id="${id('gift-weapon')}"]`).count(),1);
    assert.equal(await page.evaluate(()=>JSON.stringify(window.syntheticInputs)===window.syntheticBefore),true,'Browser changed canonical input/payload or imported ownership');
    results.push({device,status:'PASS',canonicalId:rowIdentity.canonical,physicalInstance:rowIdentity.instance,scope:rowIdentity.scope});
    await page.close();
  }
  assert.deepEqual(errors,[]);assert(reads.every(file=>file.startsWith('/books/shared/')));
  console.log(JSON.stringify({status:'PASS',bookFactualReads:0,browserErrors:0,results},null,2));
} catch(error) {if(errors.length)console.error(JSON.stringify({browserErrors:errors},null,2));throw error;}
finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
