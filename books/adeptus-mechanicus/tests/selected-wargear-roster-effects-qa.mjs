import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const normalize=value=>String(value||'').toUpperCase();

const scope={console};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/adeptus-mechanicus/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js']){
  vm.runInContext(read(file),scope,{filename:file});
}
const baseline=scope.WH_BOOK_ROSTER_CATALOG;

const sourceText=JSON.stringify(JSON.parse(read('books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json')));
assert.equal(sourceText.match(/Chaff Launcher: The bearer has the SMOKE keyword\./g)?.length,3,'accepted source Chaff Launcher inventory');
assert.equal(sourceText.match(/Omnispex: Ranged weapons equipped by models in the bearer’s unit have the \[IGNORES COVER\] ability\./g)?.length,2,'accepted source Omnispex inventory');
assert.equal(sourceText.match(/Broad spectrum data-tether: The bearer loses the SMOKE keyword/g)?.length,1,'accepted source Onager data-tether inventory');

const unit=(catalog,id)=>catalog.units.find(item=>item.id===id);
const selectionForProfile=(catalogUnit,mode)=>{
  const profile=catalogUnit.gameSelections.weaponProfiles.find(item=>item.mode===mode);
  return catalogUnit.gameSelections.selections.find(item=>item.profileIds?.includes(profile.id));
};
const raw=(catalog,id,instanceId,selectionIds=[])=>{
  const record=unit(catalog,id),selections=selectionIds.map(selectionId=>record.gameSelections.selections.find(item=>item.id===selectionId));
  assert.ok(selections.every(Boolean),`${id}: fixture selections resolve exactly`);
  return {id:instanceId,canonicalUnitId:id,name:record.title,quantity:1,points:0,models:[],wargear:selections.map(item=>item.title).join(', ')};
};
const project=(catalog,units,attachments={})=>{
  scope.WH_BOOK_ROSTER_CATALOG=catalog;
  return scope.WHArmyRosterContext.project({
    catalog,
    roster:{faction:'Adeptus Mechanicus',detachments:[],enhancements:[],units},
    record:{id:'am-selected-wargear-effects',attachments},
    provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)},
  }).game;
};
const hasKeyword=(gameUnit,keyword)=>gameUnit.effective.keywords.some(item=>normalize(item)===normalize(keyword));
const tags=(gameUnit,mode)=>gameUnit.effective.weaponProfiles.filter(item=>item.mode===mode).flatMap(item=>item.tags.map(normalize));

const chaffUnits=['unit-archaeopter-fusilave','unit-archaeopter-stratoraptor','unit-archaeopter-transvector'];
const omnispexUnits=['unit-skitarii-rangers','unit-skitarii-vanguard'];
const certify=catalog=>{
  for(const id of chaffUnits){
    const abilityId=`${id}-wargear-ability-12711a645a`,selectionId=`${id}-selection-chaff-launcher`;
    const game=project(catalog,[raw(catalog,id,`${id}-selected`,[selectionId]),raw(catalog,id,`${id}-plain`)]),selected=game.units[0],plain=game.units[1];
    assert.ok(selected.selection.loadout.selectedWargearAbilityIds.includes(abilityId),`${id}: Chaff Launcher exact selected identity`);
    assert.equal(hasKeyword(selected,'SMOKE'),true,`${id}: selected Chaff Launcher grants SMOKE`);
    assert.equal(hasKeyword(plain,'SMOKE'),false,`${id}: unselected copy does not gain SMOKE`);
    assert.equal(plain.effects.some(effect=>effect.source?.id===abilityId),false,`${id}: selected effect does not leak to duplicate physical copy`);
  }

  const onager='unit-onager-dunecrawler',tetherId=`${onager}-wargear-ability-7c2b04fe30`,tetherSelection=`${onager}-selection-broad-spectrum-data-tether`;
  const onagers=project(catalog,[raw(catalog,onager,'onager-selected',[tetherSelection]),raw(catalog,onager,'onager-plain')]);
  assert.ok(onagers.units[0].selection.loadout.selectedWargearAbilityIds.includes(tetherId),'Onager data-tether exact selected identity');
  assert.equal(hasKeyword(onagers.units[0],'SMOKE'),false,'selected data-tether removes SMOKE');
  assert.equal(hasKeyword(onagers.units[1],'SMOKE'),true,'unselected Onager retains intrinsic SMOKE');
  assert.equal(onagers.units[1].effects.some(effect=>effect.source?.id===tetherId),false,'data-tether does not leak to duplicate physical copy');

  for(const id of omnispexUnits){
    const record=unit(catalog,id),abilityId=`${id}-wargear-ability-2e4de9ef20`,omnispexId=`${id}-selection-omnispex`,ranged=selectionForProfile(record,'ranged'),melee=selectionForProfile(record,'melee');
    const game=project(catalog,[raw(catalog,id,`${id}-selected`,[ranged.id,melee.id,omnispexId]),raw(catalog,id,`${id}-plain`,[ranged.id,melee.id])]),selected=game.units[0],plain=game.units[1];
    assert.ok(selected.selection.loadout.selectedWargearAbilityIds.includes(abilityId),`${id}: Omnispex exact selected identity`);
    assert.ok(tags(selected,'ranged').includes('IGNORES COVER'),`${id}: selected Omnispex grants IGNORES COVER to ranged weapons`);
    assert.equal(tags(selected,'melee').includes('IGNORES COVER'),false,`${id}: Omnispex does not affect melee weapons`);
    assert.equal(tags(plain,'ranged').includes('IGNORES COVER'),false,`${id}: unselected duplicate does not gain IGNORES COVER`);
    assert.equal(plain.effects.some(effect=>effect.source?.id===abilityId),false,`${id}: Omnispex does not leak to duplicate physical copy`);
  }

  const rangers=unit(catalog,'unit-skitarii-rangers'),manipulus=unit(catalog,'unit-tech-priest-manipulus'),rangerRanged=selectionForProfile(rangers,'ranged'),rangerMelee=selectionForProfile(rangers,'melee'),manipulusRanged=selectionForProfile(manipulus,'ranged'),manipulusMelee=selectionForProfile(manipulus,'melee');
  const attached=project(catalog,[
    raw(catalog,rangers.id,'rangers-body',[rangerRanged.id,rangerMelee.id,`${rangers.id}-selection-omnispex`]),
    raw(catalog,manipulus.id,'manipulus-leader',[manipulusRanged.id,manipulusMelee.id]),
  ],{'rangers-body':['manipulus-leader']});
  assert.ok(tags(attached.units[1],'ranged').includes('IGNORES COVER'),'Omnispex applies to ranged weapons across the formed Attached Unit');
  assert.equal(tags(attached.units[1],'melee').includes('IGNORES COVER'),false,'attached member melee weapons remain unchanged');
};

certify(baseline);

let mutations=0;
const killed=(label,mutate)=>{
  const catalog=clone(baseline);mutate(catalog);
  assert.throws(()=>certify(catalog),undefined,`${label} must be killed`);mutations++;
};
const contract=(catalog,id)=>catalog.effectContracts.find(item=>item.canonicalRecordId===id);
killed('MISSING_CHAFF_CONTRACT',catalog=>{catalog.effectContracts=catalog.effectContracts.filter(item=>item.canonicalRecordId!=='unit-archaeopter-fusilave-wargear-ability-12711a645a');});
killed('WRONG_CHAFF_KEYWORD',catalog=>{contract(catalog,'unit-archaeopter-stratoraptor-wargear-ability-12711a645a').clauses[0].operations[0].canonicalTarget='STEALTH';});
killed('REVERSED_DATA_TETHER_OPERATION',catalog=>{contract(catalog,'unit-onager-dunecrawler-wargear-ability-7c2b04fe30').clauses[0].operations[0].type='KEYWORD_GRANT';});
killed('WRONG_OMNISPEX_SELECTION_ID',catalog=>{contract(catalog,'unit-skitarii-rangers-wargear-ability-2e4de9ef20').selector.selectedWargearAbilityIds=['unit-skitarii-rangers-wargear-ability-893f3b727c'];});
killed('OMNISPEX_MELEE_SCOPE',catalog=>{contract(catalog,'unit-skitarii-vanguard-wargear-ability-2e4de9ef20').clauses[0].operations[0].canonicalTarget='all';});
killed('OMNISPEX_ATTACHED_SCOPE',catalog=>{contract(catalog,'unit-skitarii-rangers-wargear-ability-2e4de9ef20').scope='selected-wargear';});

assert.equal(mutations,6,'selected-wargear mutation inventory');
console.log('Adeptus Mechanicus selected-wargear roster effects: 6/6 executable; positive 6/6; negative 14/14; physical-instance 6/6; mutations 6/6 KILLED; PASS');
