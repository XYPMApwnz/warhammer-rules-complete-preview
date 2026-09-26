import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const OWNER = 'books/death-guard/scripts/roster-semantics.js';
const FRENZY = 'froth-spattered-frenzy';
const RULE = 'helbrute-ability-froth-spattered-frenzy';
const profileId = name => 'helbrute-weapon-' + name;
const selectionId = name => 'unit-helbrute-selection-' + name;
const plain = value => JSON.parse(JSON.stringify(value));
const sorted = values => [...values].sort();
// Independent internal-consistency oracle, not Codex factual recertification.
const BASE = {'close-combat-weapon':'5','helbrute-fist':'5','helbrute-hammer':'4','combi-bolter':'2','multi-melta':'2','missile-launcher-frag':'D6','missile-launcher-krak':'1'};
const raw = (id, wargear) => ({id, name:'Helbrute', quantity:1, points:100, wargear, models:[]});
const fixtures = [
  {id:'fist-melta', wargear:'Close combat weapon, Helbrute fist, Multi-melta', attacks:{'close-combat-weapon':'5','helbrute-fist':'5','multi-melta':'2'}, boosted:[]},
  {id:'two-melee', wargear:'Close combat weapon, Helbrute fist, Helbrute hammer', attacks:{'close-combat-weapon':'5','helbrute-fist':'7','helbrute-hammer':'6'}, boosted:['helbrute-fist','helbrute-hammer']},
  {id:'two-melee-bolter', wargear:'Close combat weapon, Helbrute fist, Helbrute hammer, Combi-bolter', attacks:{'close-combat-weapon':'5','helbrute-fist':'7','helbrute-hammer':'6','combi-bolter':'2'}, boosted:['helbrute-fist','helbrute-hammer']},
  {id:'two-fists-quantity', wargear:'Close combat weapon, 2x Helbrute fist', attacks:{'close-combat-weapon':'5','helbrute-fist':'7'}, boosted:['helbrute-fist']},
  {id:'two-fists-records', wargear:'Close combat weapon, Helbrute fist, Helbrute fist', attacks:{'close-combat-weapon':'5','helbrute-fist':'7'}, boosted:['helbrute-fist']},
  {id:'one-fist', wargear:'Close combat weapon, Helbrute fist', attacks:{'close-combat-weapon':'5','helbrute-fist':'5'}, boosted:[]}
];
const expectedAttacks = fixture => Object.fromEntries(Object.entries(fixture.attacks).map(([id,a])=>[profileId(id),a]));
function assertUnit(unit, fixture) {
  const label = 'RA08 ' + fixture.id;
  assert.equal(unit.identity.instanceId, fixture.id, label + ': physical identity');
  assert.equal(unit.identity.canonicalDatasheetId, 'unit-helbrute', label + ': canonical identity');
  assert.equal(unit.selection.modelCount.value, 1, label + ': physical model count');
  assert.equal(unit.selection.loadout.state, 'resolved', label + ': fixture equipment must resolve');
  assert.deepEqual(sorted(unit.selection.loadout.selectedProfileIds), sorted(Object.keys(expectedAttacks(fixture))), label + ': fixture selected profiles');
  assert.ok(unit.selection.loadout.weapons.every(item=>item.state==='resolved' && item.selectionId && item.modelQuantity===1), label + ': resolved equipment records');
  const actual = Object.fromEntries(unit.effective.weaponProfiles.filter(p=>unit.selection.loadout.selectedProfileIds.includes(p.id)).map(p=>[p.id,p.values.A]));
  assert.deepEqual(actual, expectedAttacks(fixture), label + ': exact effective A');
  const effects = unit.effects.filter(effect=>effect.id===FRENZY);
  assert.equal(effects.length, fixture.boosted.length ? 1 : 0, label + ': activation once');
  if (effects.length) {
    const effect = effects[0];
    assert.deepEqual({component:effect.component,targetId:effect.targetId,operation:effect.operation,stat:effect.stat,delta:effect.delta}, {component:'weapon',targetId:'selected-melee',operation:'add-stat',stat:'A',delta:2}, label + ': recipe');
    assert.deepEqual(effect.source, {kind:'datasheet',id:RULE,ownerInstanceId:fixture.id}, label + ': source owner');
    assert.equal(effect.targetInstanceId, fixture.id, label + ': target owner');
    assert.deepEqual(sorted(effect.profileIds), sorted(fixture.boosted.map(profileId)), label + ': exact qualifying profile IDs');
    assert.deepEqual([...effect.targets].sort((a,b)=>a.profileId.localeCompare(b.profileId)),
      fixture.boosted.map(id=>({profileId:profileId(id),field:'A',base:BASE[id],effective:fixture.attacks[id]})).sort((a,b)=>a.profileId.localeCompare(b.profileId)), label + ': independent base/effective target oracle');
  }
}
export function runHelbruteProviderQa({root, sourceOverrides={}}) {
  const cache = new Map();
  const read = name => {
    if (!cache.has(name)) cache.set(name, sourceOverrides[name] ?? fs.readFileSync(path.join(root,name),'utf8'));
    return cache.get(name);
  };
  const scope = {console,URL,URLSearchParams};
  scope.window=scope; scope.globalThis=scope;
  for (const file of ['books/shared/roster-context.js','books/death-guard/scripts/roster-data.js','books/shared/effect-contract-runtime.js',OWNER]) vm.runInNewContext(read(file),scope,{filename:file});
  const api=scope.WHArmyRosterContext;
  let installed;
  scope.WHArmyRosterContext={...api,install(options){installed=options;}};
  vm.runInNewContext(read('books/death-guard/scripts/roster-filter.js'),scope);
  scope.WHArmyRosterContext=api;
  assert.equal(typeof installed?.providerFactory,'function','RA08 actual provider factory');
  const catalog=plain(scope.WH_BOOK_ROSTER_CATALOG);
  const helbrute=catalog.units.find(unit=>unit.id==='unit-helbrute');
  for (const [id,a] of Object.entries(BASE)) assert.equal(helbrute.gameSelections.weaponProfiles.find(p=>p.id===profileId(id))?.a,a,'RA08 frozen base A: '+id);
  const project=(units, currentCatalog=catalog, alterDraft=null)=>{
    scope.WH_BOOK_ROSTER_CATALOG=currentCatalog;
    const roster={faction:'Death Guard',units,detachments:[],enhancements:[],warnings:[]},record={attachments:{}};
    const input={catalog:currentCatalog,roster,record},initial=api.project(input),provider=installed.providerFactory(initial);
    if (alterDraft) {
      const original=provider.gameEffects;
      provider.gameEffects=args=>{alterDraft(args.gameUnit);return original(args);};
    }
    return plain(api.project({...input,provider}).game);
  };
  const checks=[];
  const game=project(fixtures.map(f=>raw(f.id,f.wargear)));
  for (const fixture of fixtures) {
    assertUnit(game.units.find(unit=>unit.identity.instanceId===fixture.id),fixture);
    checks.push(fixture.id);
  }
  assert.deepEqual(game.units[0].selection.loadout.weapons.map(w=>w.selectionId),['close-combat-weapon','helbrute-fist','multi-melta'].map(selectionId),'RA08 negative selected equipment identities');
  for (const id of ['two-fists-quantity','two-fists-records']) {
    const unit=game.units.find(u=>u.identity.instanceId===id);
    assert.equal(unit.selection.loadout.weapons.filter(w=>w.selectionId===selectionId('helbrute-fist')).reduce((sum,w)=>sum+w.totalQuantity,0),2,'RA08 physical fist quantity: '+id);
  }
  const modelFixture={...fixtures[1],id:'model-loadout'};
  const modelRaw=raw(modelFixture.id,modelFixture.wargear);
  modelRaw.models=[{name:'Helbrute',quantity:1,loadouts:[{quantity:1,wargear:modelFixture.wargear}]}];
  assertUnit(project([modelRaw]).units[0],modelFixture);
  checks.push(modelFixture.id);

  const noEffect=(id,unit,currentCatalog=catalog,alterDraft=null)=>{
    const result=project([unit],currentCatalog,alterDraft).units[0];
    assert.equal(result.effects.filter(e=>e.id===FRENZY).length,0,'RA08 '+id+': unresolved/invalid must fail closed');
    checks.push(id);
  };
  noEffect('unknown-loadout',raw('unknown-loadout',fixtures[1].wargear+', Unresolved equipment'));
  noEffect('zero-equipment',raw('zero-equipment','Close combat weapon, 0x Helbrute fist, Helbrute hammer'));
  noEffect('three-physical-items',raw('three-physical-items','Close combat weapon, 2x Helbrute fist, Helbrute hammer'));
  noEffect('three-fists',raw('three-fists','Close combat weapon, 3x Helbrute fist'));
  noEffect('multiple-models',{...raw('multiple-models','Close combat weapon, Helbrute fist'),quantity:2});
  noEffect('missing-model-quantity',{...raw('missing-model-quantity',fixtures[1].wargear),quantity:undefined});
  noEffect('unknown-selection-id',raw('unknown-selection-id',fixtures[1].wargear),catalog,draft=>{
    draft.selection={...draft.selection,loadout:{...draft.selection.loadout,weapons:draft.selection.loadout.weapons.map((w,i)=>i===1?{...w,selectionId:'unresolved-selection'}:w)}};
  });
  noEffect('foreign-physical-owner',raw('foreign-physical-owner',fixtures[1].wargear),catalog,draft=>{draft.identity={...draft.identity,instanceId:'other-helbrute'};});
  const unknownMode=plain(catalog);
  unknownMode.units.find(u=>u.id==='unit-helbrute').gameSelections.weaponProfiles.find(p=>p.id===profileId('helbrute-fist')).mode='unknown';
  noEffect('unknown-profile-mode',raw('unknown-profile-mode',fixtures[1].wargear),unknownMode);

  // Reuse the real existing two-mode equipment family in memory only.
  // Its melee classification here tests identity, not a new canonical weapon rule.
  const modeCatalog=plain(catalog),metadata=modeCatalog.units.find(u=>u.id==='unit-helbrute').gameSelections;
  const family=metadata.weaponFamilies.find(f=>f.id==='unit-helbrute-weapon-family-missile-launcher');
  assert.deepEqual(sorted(family.profileIds),sorted(['missile-launcher-frag','missile-launcher-krak'].map(profileId)));
  for (const p of metadata.weaponProfiles.filter(p=>family.profileIds.includes(p.id))) p.mode='melee';
  const familySelection=metadata.selections.find(s=>s.familyId===family.id);
  const modeTitles=family.profileIds.map(id=>metadata.selections.find(s=>!s.familyId&&s.profileIds.length===1&&s.profileIds[0]===id).title);
  const modeFixtures=[
    {id:'one-equipment-two-modes',wargear:'Close combat weapon, '+familySelection.title,attacks:{'close-combat-weapon':'5','missile-launcher-frag':'D6','missile-launcher-krak':'1'},boosted:[]},
    {id:'separate-mode-records',wargear:'Close combat weapon, '+modeTitles.join(', '),attacks:{'close-combat-weapon':'5','missile-launcher-frag':'D6','missile-launcher-krak':'1'},boosted:[]},
    {id:'family-plus-fist',wargear:'Close combat weapon, '+familySelection.title+', Helbrute fist',attacks:{'close-combat-weapon':'5','missile-launcher-frag':'D6+2','missile-launcher-krak':'3','helbrute-fist':'7'},boosted:['missile-launcher-frag','missile-launcher-krak','helbrute-fist']}
  ];
  for (const fixture of modeFixtures) {
    const projected=project([raw(fixture.id,fixture.wargear)],modeCatalog).units[0];
    assertUnit(projected,fixture);
    const selected=projected.selection.loadout.weapons.filter(w=>w.profileIds.some(id=>family.profileIds.includes(id)));
    assert.equal(selected.reduce((sum,w)=>sum+w.totalQuantity,0),fixture.id==='separate-mode-records'?2:1,fixture.id+': explicit input equipment/mode records');
    checks.push(fixture.id);
  }
  const renamed=plain(catalog),renamedMetadata=renamed.units.find(u=>u.id==='unit-helbrute').gameSelections;
  const renamedFist=renamedMetadata.selections.find(s=>s.id===selectionId('helbrute-fist'));
  renamedFist.title='Opaque equipment label';renamedFist.aliases=[renamedFist.title];
  const renamedFixture={...fixtures[1],id:'canonical-identity-not-title',wargear:'Close combat weapon, Opaque equipment label, Helbrute hammer'};
  assertUnit(project([raw(renamedFixture.id,renamedFixture.wargear)],renamed).units[0], renamedFixture);
  checks.push(renamedFixture.id);
  return {checks, count:checks.length};
}

export async function runHelbruteBrowserQa({openRecord}) {
  const selected=fixtures.slice(0,6);
  const record={id:'ra08-helbrute-consistency',roster:{faction:'Death Guard',units:selected.map(f=>raw(f.id,f.wargear)),detachments:[],enhancements:[],warnings:[]},attachments:{}};
  for (const fixture of selected) {
    const {context,page}=await openRecord({bookId:'death-guard',record,instance:fixture.id,unitId:'unit-helbrute'});
    try {
      const read=()=>page.evaluate(({id,base,expectedIds})=>{
        const projection=window.WH_ARMY_ROSTER_GAME_PROJECTION;
        const card=document.querySelector('.unit-card.roster-game-view[data-roster-instance="'+id+'"]');
        const rows=[...card.querySelectorAll('.weapon-row:not(.weapon-head)')];
        const visible=rows.filter(row=>row.getClientRects().length&&getComputedStyle(row).display!=='none');
        const cells=Object.fromEntries(visible.map(row=>[row.id,row.querySelector('[data-label="A"]')?.textContent.trim()]));
        const current=window.WH_ARMY_ROSTER_PROJECTION,rawUnit=current.roster.units.find(u=>u.id===id);
        const semantics=window.DGRosterSemantics.createContext({roster:current.roster,attachments:{},terms:{...(window.WH40K_GLOSSARY?.forBook('death-guard')||{}),...(window.DG_TERMS||{})},profileFor:unit=>current.units.find(item=>item.raw.id===unit.id)?.catalogUnit.ruleFacts});
        const decorateTwice=effects=>{
          const clone=card.cloneNode(true);
          for (const row of clone.querySelectorAll('.weapon-row:not(.weapon-head)')) {
            const cell=row.querySelector('[data-label="A"]');
            if (cell&&Object.hasOwn(base,row.id)) {
              cell.textContent=base[row.id];
              delete cell.dataset.rosterDerivedEffects;delete cell.dataset.rosterBase;
              cell.classList.remove('roster-modified-value');
            }
          }
          const snapshots=[];
          for (let pass=0;pass<2;pass++) {
            semantics.decorate(clone,[rawUnit],[],effects,Boolean(effects));
            snapshots.push(Object.fromEntries(expectedIds.map(profileId=>[profileId,clone.querySelector('[id="'+profileId+'"] [data-label="A"]')?.textContent.trim()])));
          }
          return snapshots;
        };
        return {units:projection.units,cells,legacy:decorateTwice(null)};
      },{id:fixture.id,base:Object.fromEntries(Object.entries(BASE).map(([id,a])=>[profileId(id),a])),expectedIds:Object.keys(expectedAttacks(fixture))});
      const state=await read();
      for (const control of selected) {
        const unit=state.units.find(u=>u.identity.instanceId===control.id);
        assertUnit(unit,control);
        assert.deepEqual(unit.attachments,{leaders:[],leading:[]},'RA08 fixture has no physical attachment: '+control.id);
      }
      assert.deepEqual(state.cells,expectedAttacks(fixture),'RA08 '+fixture.id+': exact visible A cells');
      for (const [pass,values] of state.legacy.entries()) assert.deepEqual(values,Object.fromEntries(Object.keys(expectedAttacks(fixture)).map(id=>[id,BASE[id.replace('helbrute-weapon-','')]])),'RA08 '+fixture.id+': retired local decorator pass '+pass);
      if (fixture.id==='two-melee-bolter') {
        await page.reload();
        await page.waitForFunction(id=>document.querySelector('.unit-card.roster-game-view[data-roster-instance="'+id+'"]'),fixture.id);
        assert.deepEqual((await read()).cells,expectedAttacks(fixture),'RA08 rerender must not compound A');
        await page.goto(page.url().split('?')[0]+'?view=mobile#unit-helbrute');
        await page.waitForSelector('.unit-card');
        const canonical=await page.evaluate(ids=>Object.fromEntries(ids.map(id=>[id,document.querySelector('[id="'+id+'"] [data-label="A"]')?.textContent.trim()])),['close-combat-weapon','helbrute-fist','helbrute-hammer'].map(profileId));
        assert.deepEqual(canonical,{'helbrute-weapon-close-combat-weapon':'5','helbrute-weapon-helbrute-fist':'5','helbrute-weapon-helbrute-hammer':'4'},'RA08 non-roster canonical A unchanged');
      }
    } finally { await context.close(); }
  }
  return {count:selected.length,checks:selected.map(f=>f.id)};
}
