import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../helpers/browser-launch.mjs';
import {createCanonicalBuildContext} from '../../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../../books/shared/tools/build-army-book.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const json=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const norm=text=>text.normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
const cases=[
  {book:'adeptus-mechanicus',id:'unit-skorpius-dunerider',date:'2026-09-25'},
  {book:'tyranids',id:'unit-tyrannocyte',date:'2026-09-27'},
  {book:'tau-empire',id:'unit-devilfish',date:'2026-09-28'},
  {book:'death-guard',id:'unit-chaos-rhino',date:'2026-09-25'},
  {book:'emperors-children',id:'unit-chaos-rhino'},
  {book:'chaos-space-marines',id:'unit-chaos-rhino'}
];
for(const fixture of cases){
  const context=createCanonicalBuildContext({configPath:path.join(root,`books/${fixture.book}/book.config.json`)});
  const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
  const unit=model.units.find(unit=>unit.id===fixture.id);
  assert.ok(unit,`${fixture.book}: canonical identity`);
  fixture.title=unit.title;
  fixture.faction=context.config.title;
  fixture.detachment=model.detachments[0].title;
  const texts=unit.relations?.transport||unit.subsections?.filter(section=>/^transport$/i.test(section.title)).flatMap(section=>section.blocks.map(block=>block.text).filter(Boolean))||[];
  assert.ok(texts.length,`${fixture.book}: effective model retains Transport facts`);
  if(fixture.date){
    const corpus=json(`books/${fixture.book}/sources/waha-11e-current-${fixture.date}/corpus.json`);
    const source=corpus.datasheets.find(unit=>unit.sourceId===fixture.id.replace(/^unit-/,'datasheet-'));
    fixture.texts=source.sections.filter(section=>/^transport$/i.test(section.title)).flatMap(section=>section.blocks.map(block=>block.text).filter(Boolean));
    assert.deepEqual(texts.map(norm),fixture.texts.map(norm),`${fixture.book}: complete source-owned Transport clauses`);
  }else fixture.texts=texts;
}
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(request,response)=>{
  try{
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
    assert.ok(file.startsWith(root+path.sep));
    if((await fs.promises.stat(file)).isDirectory())file=path.join(file,'index.html');
    response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    response.end(await fs.promises.readFile(file));
  }catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,context;
try{
  browser=await launchChromium();
  context=await browser.newContext({serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];
  page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const check=async fixture=>{
    await page.waitForFunction(id=>document.getElementById(id)?.matches('.unit-card')&&window.DG_APP,fixture.id);
    const state=await page.evaluate(id=>{
      const card=document.getElementById(id),section=[...card.querySelectorAll('.unit-part')].find(section=>/\-transport$/.test(section.id));
      return {text:section?[...section.querySelectorAll('p')].map(node=>node.textContent):[],hidden:!section||section.hidden||getComputedStyle(section).display==='none',nav:!!section&&!!card.querySelector(`[data-journey-target="${section.id}"]`),instance:card.dataset.rosterInstance||null,game:card.classList.contains('roster-game-view')};
    },fixture.id);
    assert.deepEqual(state.text.map(norm),fixture.texts.map(norm),`${fixture.book}: full player-visible Transport text`);
    assert.equal(state.hidden,false,`${fixture.book}: visible Transport section`);
    assert.equal(state.nav,true,`${fixture.book}: Transport navigation`);
    return state;
  };
  for(const fixture of cases){
    if(!fixture.date)continue; // EC/CSM controls verify their existing canonical facts above.
    for(const mobile of [false,true]){
      await page.setViewportSize(mobile?{width:390,height:844}:{width:1280,height:900});
      await page.goto(`${origin}/books/${fixture.book}/reader.html${mobile?'?view=mobile':''}#${fixture.id}`);
      await check(fixture);
    }
    await page.goto(`${origin}/roster-guides/index.html`);
    const text=`+ FACTION KEYWORD: ${fixture.faction}\n+ DETACHMENT: ${fixture.detachment}\n+ BATTLE SIZE: Strike Force (2000 Point limit)\n1x ${fixture.title} (100 pts)`;
    await page.locator('#roster-input').fill(text);await page.locator('#roster-form button[type="submit"]').click();
    await page.waitForFunction(source=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]').some(record=>record.sourceText===source),text);
    const record=await page.evaluate(source=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')).find(record=>record.sourceText===source),text);
    const instance=record.roster.units[0].id;
    for(const mobile of [false,true]){
      await page.setViewportSize(mobile?{width:390,height:844}:{width:1280,height:900});
      await page.goto(`${origin}/books/${fixture.book}/reader.html?roster=${record.id}&rosterInstance=${instance}${mobile?'&view=mobile':''}#${fixture.id}`);
      await page.waitForFunction(instance=>document.querySelector(`.unit-card[data-roster-instance="${instance}"].roster-game-view`),instance);
      const state=await check(fixture);
      assert.equal(state.instance,instance);assert.equal(state.game,true);
      const game=await page.evaluate(instance=>window.WH_ARMY_ROSTER_GAME_PROJECTION.units.find(unit=>unit.identity.instanceId===instance).identity,instance);
      assert.equal(game.canonicalDatasheetId,fixture.id);
      await page.reload();await check(fixture);
    }
    console.log(`${fixture.book}/${fixture.id}: source/effective model, Army Book and imported roster desktop/phone/reload PASS`);
  }
  assert.deepEqual(errors,[],'production browser errors');
}finally{
  await context?.close();await browser?.close();await new Promise(resolve=>server.close(resolve));
}
