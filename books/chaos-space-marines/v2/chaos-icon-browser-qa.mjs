/** Focused real-application acceptance using the existing static-byte transport.
 * No fixture payloads, effect substitutions or DOM/style injection. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const baseline=process.env.CHAOS_ICON_BASELINE_HEAD||'89ab22b4274ef07d4d3330efd9ed93c17dfa3ecb';
const changed=['books/chaos-space-marines/v2/roster-import-bindings.mjs','books/shared/roster-v2/import.mjs',
  'books/shared/roster-v2/context.mjs','books/shared/army-book-app-v2/datasheet-v1.mjs'];
const oldBytes=new Map(changed.map(file=>['/'+file,execFileSync('git',['show',baseline+':'+file],{cwd:repo})]));
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css',
  '.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
const errors=[],missing=[],results=[];
const header='+ FACTION KEYWORD: Chaos - Chaos Space Marines\n+ DETACHMENT: Veterans of the Long War\n';
const cases=[
  ['dark-commune','5x Dark Commune (90 pts)\n• 1x Cult Demagogue: Autopistol, Commune stave\n• 1x Mindwitch: Warp Curse, Close combat weapon\n• 1x Iconarch: Autopistol, Close combat weapon, Chaos icon\n• 2x Blessed Blade: Commune blade'],
  ['chaos-bikers','3x Chaos Bikers (80 pts)\n• 1x Biker Champion: Bolt pistol, Combi-bolter, Close combat weapon, Chaos icon\n• 2x Chaos Biker: Bolt pistol, Combi-bolter, Close combat weapon'],
  ['chosen','5x Chosen (140 pts)\n• 1x Chosen Champion: Boltgun, Bolt pistol, Accursed weapon, Chaos icon\n• 4x Chosen: Boltgun, Bolt pistol, Accursed weapon'],
  ['legionaries','5x Legionaries (95 pts)\n• 1x Aspiring Champion: Boltgun, Bolt pistol, Close combat weapon, Chaos icon\n• 4x Legionary: Boltgun, Bolt pistol, Close combat weapon'],
  ['possessed','5x Possessed (130 pts)\n• 1x Possessed Champion: Hideous mutations, Chaos icon\n• 4x Possessed: Hideous mutations'],
  ['nemesis-claw','5x Nemesis Claw (105 pts)\n• 1x Visionary: Bolt pistol, Nostraman chainblade\n• 1x Legionaries: Bolt pistol, Close combat weapon, Voice eater, Astartes chainsword\n• 3x Legionaries: Bolt pistol, Boltgun, Close combat weapon'],
  ['sorcerer-in-terminator-armour','1x Sorcerer in Terminator Armour (80 pts): Combi-bolter, Force weapon, Chaos familiar']
];
const bodyguard='10x Cultist Mob (50 pts)\n• 1x Cultist Champion: Autopistol, Brutal assault weapon\n• 9x Chaos Cultist: Autopistol, Brutal assault weapon';
const ready=async page=>{await page.waitForFunction(()=>!!window.WarhammerAppV2);await page.evaluate(async()=>{
  await window.WarhammerAppV2.ready;await window.ArmyBookAppV2?.rosterPanel?.ready;
});};
async function open(page,id){await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),id);await ready(page);await page.waitForSelector('main .unit-card');}
async function guide(page,id){await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.locator('[data-roster-action="open-personal-guide"]').click();
  await page.locator(`main [data-roster-nav-instance-id="${id}"]`).click();await ready(page);await page.waitForSelector('main .unit-card');}
async function importText(page,text,count){await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();await page.waitForFunction(n=>window.ArmyBookAppV2.roster.state?.units.length===n,count);
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
}
async function inspect(page,id){return page.evaluate(id=>{const app=window.ArmyBookAppV2,unit=app.roster.state.units.find(unit=>unit.instanceId===id),
  root=[...document.querySelectorAll('main .unit-card')].find(node=>node.dataset.rosterInstanceId===id);
  if(!root)throw Error('Missing physical card '+id);
  return {equipment:[...root.querySelectorAll('[data-selected-canonical-ids]')].filter(node=>JSON.parse(node.dataset.selectedCanonicalIds).some(id=>!id.includes(':weapon:')))
    // innerText adds layout line breaks at phone width; textContent checks the
    // exact label characters independently of wrapping. Visibility is separate.
    .map(node=>({text:node.textContent,visible:node.getClientRects().length>0,ids:JSON.parse(node.dataset.selectedCanonicalIds),owner:node.closest('[data-canonical-profile-id]')?.dataset.canonicalProfileId})),
    snapshot:app.roster.snapshot(),effective:app.roster.effective(id),ability:root.innerText.includes('Chaos Icon: Each time'),
    voiceAbility:root.innerText.includes('Voice Eater: Enemy units'),
    familiarAbility:root.innerText.includes('Chaos Familiar: Once per battle, when an attack is allocated to the bearer, you can change the Damage characteristic to 0.'),
    aggregate:unit.selections.filter(selection=>selection.canonicalEquipmentIds.length),
    rows:unit.modelRows.flatMap(row=>row.selections.filter(selection=>selection.canonicalEquipmentIds.length).map(selection=>({owner:row.canonicalProfileId,selection})))};
},id);}
function verify(report,slug,selected=true){assert.equal(report.equipment.length,selected?1:0);
  if(!selected)return;
  const familiar=slug==='sorcerer-in-terminator-armour';
  assert.equal(report.equipment[0].text,familiar?'1 × Chaos familiar':slug==='nemesis-claw'?'1 × voice eater':'1 × Chaos icon',slug+' exact equipment caption');
  assert.equal(report.equipment[0].visible,true,slug+' equipment label is visible');
  if(familiar){
    assert.equal(report.rows.length,0,'No fabricated MODEL equipment assignment');
    assert.equal(report.aggregate.length,1,'Equipment remains on its physical UNIT instance');
    assert.deepEqual(report.equipment[0].ids,['datasheet-sorcerer-in-terminator-armour:wargear:2']);
    assert.deepEqual(report.equipment[0].ids,report.aggregate[0].canonicalEquipmentIds);
    assert.equal(report.aggregate[0].physicalQuantity,1);assert.equal(report.aggregate[0].perModelQuantity,null);
    assert.equal(report.familiarAbility,true,'Full canonical ability text unchanged');return;
  }
  assert.deepEqual(report.equipment[0].ids,report.rows[0].selection.canonicalEquipmentIds);
  assert.equal(report.equipment[0].owner,report.rows[0].owner);
  assert.equal(report.rows[0].selection.physicalQuantity,1);
  assert.equal(slug==='nemesis-claw'?report.voiceAbility:report.ability,true,'Canonical ability heading unchanged');
  if(slug==='dark-commune')assert.equal(report.equipment[0].owner,'datasheet-dark-commune:section:2:member:3');
  if(slug==='nemesis-claw')assert.equal(report.equipment[0].owner,'datasheet-nemesis-claw:section:2:member:2');
}
function withoutCaptions(value,allEquipmentReferences=false){if(Array.isArray(value))return value.map(item=>withoutCaptions(item,allEquipmentReferences));if(!value||typeof value!=='object')return value;
  return Object.fromEntries(Object.entries(value).flatMap(([key,item])=>{
    if(key==='sourceReferences'){if(allEquipmentReferences)return [];const refs=item.filter(ref=>!ref.caption);return refs.length?[[key,withoutCaptions(refs)]]:[];}
    return [[key,withoutCaptions(item,allEquipmentReferences)]];
  }));}
async function mount(old,viewport){const origin=old?'http://icon-baseline.test':'http://icon-current.test',context=await browser.newContext({viewport,serviceWorkers:'block'});
  await context.route('**/*',async route=>{const url=new URL(route.request().url()),file=path.resolve(repo,'.'+decodeURIComponent(url.pathname));
    if(url.origin!==origin){await route.abort();return;}if(url.pathname==='/favicon.ico'){await route.fulfill({status:204});return;}
    if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){missing.push(url.pathname);await route.fulfill({status:404,body:'Missing file'});return;}
    await route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',body:old&&oldBytes.has(url.pathname)?oldBytes.get(url.pathname):fs.readFileSync(file)});
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(origin+'/v2/app.html?v2=ARMY_BOOK&registry=chaos-space-marines');await ready(page);return {page,context,origin};
}
try{
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const current=await mount(false,viewport),previous=await mount(true,viewport),page=current.page;
    for(const [slug,block] of cases){const familiar=slug==='sorcerer-in-terminator-armour';
      const text=header+block+'\n'+block.replace(familiar?', Chaos familiar':slug==='nemesis-claw'?', Voice eater':', Chaos icon','')+
      (slug==='dark-commune'?'\n'+bodyguard:slug==='nemesis-claw'?'\n1x Chaos Lord (95 pts): Plasma pistol, Daemon hammer':
        familiar?'\n5x Chaos Terminator Squad (175 pts)\n• 1x Terminator Champion: Combi-bolter, Accursed weapon\n• 4x Chaos Terminator: Combi-bolter, Accursed weapon':'');
      const count=['dark-commune','nemesis-claw'].includes(slug)||familiar?3:2;
      await importText(page,text,count);await open(page,'parsed-unit-1');const effective=await inspect(page,'parsed-unit-1');verify(effective,slug);
      await guide(page,'parsed-unit-1');verify(await inspect(page,'parsed-unit-1'),slug);
      await page.reload();await ready(page);assert.deepEqual(await inspect(page,'parsed-unit-1'),effective,'Reload preserves state and caption');
      await open(page,'parsed-unit-2');const absent=await inspect(page,'parsed-unit-2');verify(absent,slug,false);
      if(slug==='nemesis-claw')assert.equal(absent.voiceAbility,false,'Unselected Voice Eater ability hidden');
      if(familiar)assert.equal(absent.familiarAbility,false,'Unselected Chaos Familiar ability hidden');
      await guide(page,'parsed-unit-2');verify(await inspect(page,'parsed-unit-2'),slug,false);
      await importText(previous.page,text,count);await open(previous.page,'parsed-unit-1');const before=await inspect(previous.page,'parsed-unit-1');
      assert.deepEqual(withoutCaptions(effective.snapshot),before.snapshot,'Only caption references may change snapshot');
      assert.deepEqual(withoutCaptions(effective.effective),before.effective,'Gameplay projection unchanged');
      if(slug==='dark-commune'||familiar){
        await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption('parsed-unit-1');
        await page.locator('[data-attachment-target-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
        await open(page,'parsed-unit-3');verify(await inspect(page,'parsed-unit-1'),slug);verify(await inspect(page,'parsed-unit-3'),slug,false);
        await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.locator('[data-roster-action="detach"]').click();await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===0);
        await open(page,'parsed-unit-1');verify(await inspect(page,'parsed-unit-1'),slug);
        await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.locator('[data-attachment-candidate-for="parsed-unit-3"]').selectOption('parsed-unit-1');
        await page.locator('[data-attachment-target-instance-id="parsed-unit-3"] [data-roster-action="attach"]').click();await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state.attachments.length===1);
        await guide(page,'parsed-unit-3');verify(await inspect(page,'parsed-unit-1'),slug);verify(await inspect(page,'parsed-unit-3'),slug,false);
        if(familiar){await page.reload();await ready(page);verify(await inspect(page,'parsed-unit-1'),slug);verify(await inspect(page,'parsed-unit-3'),slug,false);}
      }
      if(slug==='nemesis-claw'){
        for(const transition of ['attach','detach','reattach']){
          await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
          if(transition==='detach')await page.locator('[data-roster-action="detach"]').click();
          else {await page.locator('[data-attachment-candidate-for="parsed-unit-1"]').selectOption('parsed-unit-3');
            await page.locator('[data-attachment-target-instance-id="parsed-unit-1"] [data-roster-action="attach"]').click();}
          await page.waitForFunction(n=>window.ArmyBookAppV2.roster.state.attachments.length===n,transition==='detach'?0:1);
          await open(page,'parsed-unit-1');verify(await inspect(page,'parsed-unit-1'),slug);
          if(transition==='detach')await open(page,'parsed-unit-3');
          verify(await inspect(page,'parsed-unit-3'),slug,false);
          await guide(page,'parsed-unit-1');verify(await inspect(page,'parsed-unit-1'),slug);
          if(transition==='reattach'){await page.reload();await ready(page);verify(await inspect(page,'parsed-unit-1'),slug);verify(await inspect(page,'parsed-unit-3'),slug,false);}
        }
      }
      results.push({device,slug,effective:'PASS',personalGuide:'PASS',reload:'PASS',isolation:'PASS',semanticComparison:'PASS'});
    }
    // Existing caption consumers run against both versions of the production
    // modules. Their actual inventory text and semantic state must be identical.
    const am=JSON.parse(fs.readFileSync(path.join(repo,'books/adeptus-mechanicus/v2/roster-import-fixtures.json'),'utf8')).fixtures.find(f=>f.text.includes('1x Onager Dunecrawler'));
    for(const [army,text] of [['death-guard','+ DETACHMENT: Virulent Vectorium\n5x Plague Marines (95 pts): 5x Boltgun, 5x Plague knives, 1x Icon of despair'],['adeptus-mechanicus',am.text]]){
      const reports=[];for(const session of [current,previous]){await session.page.goto(session.origin+'/v2/app.html?v2=ARMY_BOOK&registry='+army);await ready(session.page);
        await importText(session.page,text,1);await open(session.page,'parsed-unit-1');reports.push(await inspect(session.page,'parsed-unit-1'));}
      if(army==='death-guard'){
        // DG now explicitly quotes its source equipment caption. The historical
        // pre-CSM-caption importer also predates ancillary ability references;
        // neither display reference may be mistaken for a gameplay delta.
        assert.equal(reports[0].equipment[0].text,'1 × icon of despair');
        assert.deepEqual(reports[0].equipment.map(({text,...item})=>item),reports[1].equipment.map(({text,...item})=>item));
        assert.deepEqual(withoutCaptions({...reports[0],equipment:[]},true),withoutCaptions({...reports[1],equipment:[]},true),
          'DG ownership, quantity and gameplay projection unchanged');
      }else assert.deepEqual(reports[0],reports[1],army+' legacy equipment captions and projection unchanged');
      assert.ok(reports[0].equipment.length,army+' exercises actual selected equipment');results.push({device,army,legacyCaption:'PASS'});
    }
    await current.context.close();await previous.context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log(JSON.stringify({status:'PASS',transport:'unmodified static-byte transport; not live hosting',results,errors,missing}));
}finally{await browser.close();}
