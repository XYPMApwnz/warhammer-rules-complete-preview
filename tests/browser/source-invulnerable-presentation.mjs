import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../helpers/browser-launch.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),baseline=process.env.RT09_BASELINE==='1';
const ids=['unit-taunar-supremacy-armour','unit-tiger-shark','unit-ax-1-0-tiger-shark','unit-manta'];
const corpus=JSON.parse(fs.readFileSync(path.join(root,'books/tau-empire/sources/waha-11e-current-2026-09-28/corpus.json'),'utf8'));
const sources=ids.map(id=>corpus.datasheets.find(unit=>unit.sourceId===id.replace(/^unit-/,'datasheet-')));
for(const source of sources){assert.ok(source);assert.equal(source.profiles.length,1);assert.equal(source.profiles[0].stats.INSV,'5+');}
const overrides=new Map(baseline?['target-data.js','roster-data.js'].map(name=>{
  const file=`books/tau-empire/scripts/${name}`;
  return [path.join(root,file),execFileSync('git',['show',`HEAD:${file}`],{cwd:root,maxBuffer:32*1024*1024})];
}):[]);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer((request,response)=>{
  try{
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
    assert.ok(file.startsWith(root+path.sep));
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    response.setHeader('Cache-Control','no-store');response.end(overrides.get(file)||fs.readFileSync(file));
  }catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,errors=[];
const text=`+ FACTION KEYWORD: T'au Empire\n`+sources.flatMap(source=>[1,2].map(()=>`1x ${source.title} (0 pts)`)).join('\n');
let browser;
try{
  browser=await launchChromium();
  for(const phone of [false,true]){
    const context=await browser.newContext({serviceWorkers:'block',viewport:phone?{width:390,height:844}:{width:1440,height:1000}});
    const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
    const view=phone?'mobile':'full';
    async function cardCheck(id,instance,record){
      const query=new URLSearchParams({view});if(record){query.set('roster',record.id);query.set('rosterInstance',instance);}
      await page.goto('about:blank');
      await page.goto(`${origin}/books/tau-empire/reader.html?${query}#${id}`);
      const card=page.locator(instance?`.unit-card[data-roster-instance="${instance}"]`:`.unit-card[id="${id}"]`);
      await card.waitFor({state:'visible'});
      const source=sources[ids.indexOf(id)],inv=card.locator('.stat[data-source-field="stats.Invulnerable"] span');
      assert.equal(await inv.count(),baseline?0:1,`${view}/${id}/${instance||'book'}: Invulnerable characteristic presence`);
      if(!baseline){assert.equal(await inv.textContent(),'5+');assert.equal(await inv.isVisible(),true);}
      const save=card.locator('.stat[data-source-field="stats.Sv"] span');
      assert.equal(await save.textContent(),source.profiles[0].stats.SV,`${id}: ordinary armour Save`);
      assert.equal(await save.isVisible(),true);
      if(record){
        await page.waitForFunction(id=>window.WH_ARMY_ROSTER_GAME_PROJECTION?.units.some(unit=>unit.identity.instanceId===id),instance);
        const state=await page.evaluate(instance=>{
          const units=window.WH_ARMY_ROSTER_GAME_PROJECTION.units;
          return {ids:units.map(unit=>unit.identity.instanceId),selected:units.find(unit=>unit.identity.instanceId===instance).effective.stats};
        },instance);
        assert.equal(new Set(state.ids).size,8,'duplicate physical instances stay isolated');
        assert.equal(String(state.selected.Invulnerable||''),baseline?'':'5+','imported effective profile');
        assert.equal(state.selected.Sv,source.profiles[0].stats.SV);
      }
    }
    for(const id of ids)await cardCheck(id);
    await page.goto(origin+'/roster-guides/index.html');
    await page.locator('#roster-input').fill(text);await page.locator('#roster-form button[type="submit"]').click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]').some(record=>record.roster.units.length===8));
    const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1'))[0]);
    assert.equal(new Set(record.roster.units.map(unit=>unit.id)).size,8);
    for(let index=0;index<record.roster.units.length;index++)await cardCheck(ids[Math.floor(index/2)],record.roster.units[index].id,record);
    console.log(`PASS ${baseline?'original omission':'restored source Invulnerable 5+'}: ${view}, four book cards and eight imported physical cards`);
    await context.close();
  }
  assert.deepEqual(errors,[]);
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
