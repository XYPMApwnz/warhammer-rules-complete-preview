import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {launchChromium} from '../helpers/browser-launch.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const context={window:{}};
vm.createContext(context);
for(const file of ['books/shared/roster-parser.js','books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js']){
  vm.runInContext(await readFile(path.join(root,file),'utf8'),context);
}
const {WHRosterParser:parser,WHRosterPoints:points}=context.window;
const exportText=(faction,total,units)=>`+ FACTION KEYWORD: ${faction}\n+ BATTLE SIZE: Strike Force (2000 Point limit)\n+ TOTAL ARMY POINTS: ${total}pts\n${units}`;
const forgefiend=gear=>`1x Forgefiend (170 pts)\n• 1x Forgefiend: Armoured limbs${gear?', '+gear:''}`;
const fixtures=[
  {name:'Forgefiend',faction:'chaos space marines',total:170,text:exportText('Chaos - Chaos Space Marines',170,forgefiend('3x Ectoplasma cannon'))},
  {name:'Fireknife',faction:'t au empire',total:130,text:exportText("T'au Empire",130,"3x Crisis Fireknife Battlesuits (130 pts)\n• 1x Crisis Fireknife Shas'vre: Battlesuit fists, 2x Missile pod\n• 2x Crisis Fireknife Shas'ui: 2 with Battlesuit fists, 2x Missile pod")}
];
for(const fixture of fixtures){
  const check=points.check(parser.parse(fixture.text),fixture.faction);
  assert.equal(check.total,fixture.total,fixture.name);
  assert.equal(check.exportMatches,true);
  assert.equal(check.unresolved.length,0);
}
for(const [gear,total]of [['Ectoplasma cannon',160],['1x Ectoplasma cannon',160],['3× Ectoplasma cannon',170],['0x Ectoplasma cannon',155],['',155],['Ectoplasma cannon, 2x Ectoplasma cannon',170],['Armoured limbs (strike, sweep), 3x Ectoplasma cannon',170]]){
  assert.equal(points.check(parser.parse(exportText('Chaos - Chaos Space Marines',total,forgefiend(gear))),'chaos space marines').total,total,gear);
}
const mixed=parser.parse(exportText('Death Guard',330,'1x Defiler (330 pts)\n• 1x Defiler: Heavy Reaper autocannon, Hades lascannon'));
assert.equal(points.check(mixed,'death guard').total,330,'Each paid option is counted separately');
const aggregate=parser.parse(exportText('Chaos - Chaos Space Marines',170,'1x Forgefiend (170 pts): Armoured limbs, 3x Ectoplasma cannon'));
assert.equal(points.check(aggregate,'chaos space marines').total,170,'Unit-level equipment also preserves multiplicity');
const cohort=parser.parse(exportText("T'au Empire",130,"3x Crisis Fireknife Battlesuits (130 pts)\n• 3x Crisis Fireknife Shas'ui: Battlesuit fists, 2x Missile pods"));
assert.equal(points.check(cohort,'t au empire').total,130,'Model cohorts multiply embedded quantities and retain plural matching');
const duplicates=parser.parse(exportText('Chaos - Chaos Space Marines',495,[forgefiend('3x Ectoplasma cannon'),forgefiend('Ectoplasma cannon'),forgefiend('')].join('\n')));
const duplicateCheck=points.check(duplicates,'chaos space marines');
assert.deepEqual(Array.from(duplicateCheck.unitTotals,item=>item.value),[170,160,165]);
assert.equal(new Set(duplicateCheck.unitTotals.map(item=>item.instanceId)).size,3);
for(const gear of ['9007199254740992x Ectoplasma cannon','9007199254740991x Ectoplasma cannon']){
  const check=points.check(parser.parse(exportText('Chaos - Chaos Space Marines',170,forgefiend(gear))),'chaos space marines');
  assert.ok(check.unresolved.includes('Unit points: Forgefiend'),'Unsafe quantities fail closed');
}

const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer(async(request,response)=>{
  try{
    const url=new URL(request.url,'http://localhost');
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    assert.ok(file.startsWith(root+path.sep));
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    response.setHeader('Cache-Control','no-store');
    response.end(await readFile(file));
  }catch{response.writeHead(404);response.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
const errors=[];
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]'));
const verify=(record,fixture)=>{
  assert.equal(record.roster.pointsCheck.total,fixture.total);
  assert.equal(record.roster.pointsCheck.exportMatches,true);
  assert.equal(record.roster.pointsCheck.unresolved.length,0);
};
try{
  browser=await launchChromium();
  for(const fixture of fixtures){
    const session=await browser.newContext({serviceWorkers:'block',acceptDownloads:true});
    const page=await session.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/roster-guides/index.html');
    await page.locator('#roster-input').fill(fixture.text);
    await page.locator('#roster-form button[type="submit"]').click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]').length===1);
    const [imported]=await stored(page);
    verify(imported,fixture);
    assert.doesNotMatch(await page.locator('#roster-result').innerText(),/Roster total warning|Points warning/);
    const identities=imported.roster.units.map(unit=>unit.id);
    await page.reload();
    const [reloaded]=await stored(page);
    verify(reloaded,fixture);
    assert.deepEqual(reloaded.roster.units.map(unit=>unit.id),identities);
    assert.equal(await page.evaluate(faction=>{
      const [record]=JSON.parse(localStorage.getItem('wh40k-rosters-v1'));
      return window.WHRosterPoints.check(record.roster,faction).total;
    },fixture.faction),fixture.total,'Reload recomputation');
    const downloading=page.waitForEvent('download');
    await page.locator('[data-export-roster]').click();
    const stream=await (await downloading).createReadStream(),chunks=[];
    for await(const chunk of stream)chunks.push(chunk);
    const backup=Buffer.concat(chunks);
    verify(JSON.parse(backup.toString()),fixture);
    await session.close();
    const restoredSession=await browser.newContext({serviceWorkers:'block'});
    const restoredPage=await restoredSession.newPage();
    restoredPage.on('pageerror',error=>errors.push(error.message));
    await restoredPage.goto(origin+'/roster-guides/index.html');
    await restoredPage.locator('#import-roster-file').setInputFiles({name:'roster.json',mimeType:'application/json',buffer:backup});
    await restoredPage.waitForFunction(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]').length===1);
    const [restored]=await stored(restoredPage);
    verify(restored,fixture);
    assert.deepEqual(restored.roster.units.map(unit=>unit.id),identities);
    assert.deepEqual(restored.roster.units.map(unit=>unit.models),imported.roster.units.map(unit=>unit.models));
    assert.equal(restored.sourceText,fixture.text);
    await restoredSession.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS imported paid quantities: both reproductions, single/zero/mixed options, duplicate instances, unsafe quantities, production import/reload/backup, no false total warnings.');
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
