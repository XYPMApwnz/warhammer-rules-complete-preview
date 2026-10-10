/** Player surfaces must not expose dataset metadata; facts/provenance stay intact. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const repo=fileURLToPath(new URL('../',import.meta.url));
const books=['death-guard','adeptus-mechanicus'];
const originals=new Map(books.map(id=>{
  const file=path.join(repo,`books/${id}/v2/generated/app-presentation.json`);
  return [id,{file,bytes:fs.readFileSync(file),payload:JSON.parse(fs.readFileSync(file,'utf8'))}];
}));
const internal=Object.fromEntries(['mfmVersion','currentness','snapshotId','schemaVersion','buildVersion','producer','datasetLabel']
  .map(key=>[key,`opaque-internal-${key}-731`]));
const forbidden=[...Object.values(internal),...books.flatMap(id=>{
  const book=originals.get(id).payload.book;return [book.mfmVersion,book.currentness];
})].filter(Boolean);
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webmanifest':'application/manifest+json'};
let poison=false;
const server=http.createServer((request,response)=>{
  try {
    const address=new URL(request.url,'http://local').pathname;
    if(address==='/favicon.ico'){response.writeHead(204).end();return;}
    const file=path.resolve(repo,'.'+decodeURIComponent(address));
    assert(file.startsWith(path.resolve(repo)+path.sep)&&fs.statSync(file).isFile());
    response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    const original=[...originals.values()].find(record=>record.file===file);
    if(poison&&original){
      const payload=structuredClone(original.payload);Object.assign(payload.book,internal);
      assert.deepEqual(payload.factManifest,original.payload.factManifest);
      assert.deepEqual(payload.bookPresentation,original.payload.bookPresentation);
      response.end(JSON.stringify(payload));
    }else response.end(fs.readFileSync(file));
  }catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const entry=`http://127.0.0.1:${server.address().port}/v2/app.html`;
const {chromium}=createRequire(import.meta.url)('playwright');
const installed='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installed)?installed:undefined);
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const screenshots=process.env.V2_METADATA_SCREENSHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'v2-presentation-metadata-'));
fs.mkdirSync(screenshots,{recursive:true});
const errors=[],missing=[],results=[];
const ready=async page=>{await page.waitForFunction(()=>!!window.WarhammerAppV2);await page.evaluate(async()=>{
  await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;
});};
const top=async(page,destination)=>{await page.locator(`[data-v2-primary-nav] [data-v2-destination="${destination}"]`).click();await ready(page);};
async function clean(page,surface){
  const text=await page.locator('[data-v2-mount-root]').innerText();
  for(const value of forbidden)assert(!text.includes(value),`${surface}: visible internal metadata ${value}`);
  assert(!/CORE_MAIN_RULE|CORE_ERRATA|SUPPORT_EXCEPTION|Active roster effects|Effective unit keywords|\[object Object\]/.test(text),surface);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${surface}: overflow`);
}
const imports={
  'death-guard':`+ DETACHMENT: Paragons of Putrescence
+ DETACHMENT: Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues
3x Deathshroud Terminators (150 pts): 3x Manreaper, 3x Plaguespurt gauntlet`,
  'adeptus-mechanicus':`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw`
};
try {
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},serviceWorkers:'block'});
    context.on('page',page=>{page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
      page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))missing.push(response.url());});});
    const page=await context.newPage();await page.goto(entry);await ready(page);await clean(page,'Home');
    await top(page,'ROSTER');await clean(page,'Roster chooser');await top(page,'HOME');
    let datasheets=0,pointFields=0;
    for(const id of books){
      await page.locator(`.v2-library-home [data-v2-book="${id}"]`).click();await ready(page);await clean(page,id);
      assert.deepEqual(await page.locator('.v2-book-meta .v2-meta-badge').allTextContents(),['Edition '+originals.get(id).payload.book.edition]);
      assert.deepEqual(await page.evaluate(()=>window.ArmyBookAppV2.payload.book),originals.get(id).payload.book,'Internal provenance metadata was removed');
      await page.screenshot({path:path.join(screenshots,`${width}-${id}-library.png`)});
      const payload=originals.get(id).payload,manifest=new Map(payload.factManifest.map(fact=>[fact.id,fact.value]));
      for(const card of payload.cards.filter(card=>card.kind==='DATASHEET')){
        await page.evaluate(id=>window.ArmyBookAppV2.open(id),card.id);await clean(page,card.id);
        const fields=await page.locator('main .points [data-fact-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),text:node.textContent})));
        assert(fields.length,`${card.id}: missing canonical points`);
        for(const field of fields){assert.deepEqual(field.value,manifest.get(field.id));if(typeof field.value==='number')assert.equal(field.text,String(field.value));pointFields++;}
        datasheets++;
      }
      await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await clean(page,id+' roster');
      await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(imports[id]);
      await page.locator('[data-roster-action="review-import"]').click();await page.locator('[data-roster-action="open-personal-guide"]').waitFor();await clean(page,id+' imported roster');
      await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
      await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();await clean(page,id+' attachments');
      await page.locator('[data-roster-action="open-personal-guide"]').click();await clean(page,id+' Personal Guide');
      await page.locator('main [data-roster-nav-instance-id="parsed-unit-1"]').click();await clean(page,id+' effective datasheet');
      await page.locator('main .weapon-name a').first().click();await page.locator('dialog[open]').waitFor();await clean(page,id+' weapon popup');await page.keyboard.press('Escape');
      await top(page,'HOME');
    }
    await top(page,'CORE_RULES');await clean(page,'Core Rules');
    const core=page.frameLocator('iframe.v2-core-reader');const text=await core.locator('main').innerText();
    for(const value of forbidden)assert(!text.includes(value),'Core reader metadata leakage');
    await top(page,'GLOSSARY');await clean(page,'Mega Glossary');
    await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill('Deep Strike');
    await page.locator('.v2-glossary-result[data-target-id="core::core-deep-strike"]').click();await page.locator('dialog[open]').waitFor();await clean(page,'Glossary popup');
    await page.locator('dialog[open]').getByRole('link',{name:'Open full entry',exact:true}).click();await clean(page,'Glossary article');
    await context.close();
    poison=true;
    const synthetic=await browser.newContext({viewport:{width,height:width===390?844:900},serviceWorkers:'block'}),probe=await synthetic.newPage();
    for(const id of books){
      await probe.goto(entry+`?v2=ARMY_BOOK&book=${id}&registry=${id}`);await ready(probe);await clean(probe,'opaque metadata control');
      assert.equal(await probe.evaluate(()=>window.ArmyBookAppV2.payload.book.mfmVersion),internal.mfmVersion,'Control was not injected');
      assert.deepEqual(await probe.evaluate(()=>window.ArmyBookAppV2.payload.factManifest),originals.get(id).payload.factManifest);
    }
    await synthetic.close();poison=false;
    results.push({width,datasheets,pointFields,surfaces:7,internalLabelsVisible:0,pointsUnchanged:true,metadataPreserved:true,opaqueMetadataControl:true});
  }
  for(const original of originals.values())assert.deepEqual(fs.readFileSync(original.file),original.bytes);
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  console.log(JSON.stringify({status:'PASS',results,errors,missing,screenshots}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
