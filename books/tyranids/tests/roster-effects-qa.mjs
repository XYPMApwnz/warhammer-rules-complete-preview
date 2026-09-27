import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRosterFixture} from '../../../tests/helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const corpus=JSON.parse(read('books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json'));
const corpusText=JSON.stringify(corpus);
assert.ok(corpusText.includes('Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack.'),'accepted Synapse melee Strength wording');
assert.ok(corpusText.includes('While this unit is within Synapse Range of a friendly TYRANIDS unit (excluding NEUROGAUNT units), it has the SYNAPSE keyword.'),'accepted Neurocytes wording');
assert.ok(corpusText.includes('TYRANID WARRIORS.')&&corpusText.includes('BATTLELINE.'),'accepted Leader Beasts keyword wording');

const runtime={console,addEventListener(){}};runtime.window=runtime;runtime.globalThis=runtime;vm.createContext(runtime);
for(const file of [
  'books/tyranids/scripts/roster-data.js',
  'roster-guides/points-data.js',
  'books/shared/rule-facts.js',
  'roster-guides/points-validator.js',
  'books/shared/effect-contract-runtime.js',
  'books/shared/roster-parser.js',
  'books/shared/roster-context.js',
])vm.runInContext(read(file),runtime,{filename:file});

const baseline=runtime.WH_BOOK_ROSTER_CATALOG,pointsCatalog=runtime.WH_POINTS_CATALOG.tyranids;
const ids={synapse:'tyranids-ability-synapse',neurocytes:'tyranids-ability-neurocytes',leader:'tyranids-detachment-rule-leader-beasts'};
const contract=(catalog,id)=>catalog.effectContracts.find(item=>item.canonicalRecordId===id);
const hasKeyword=(unit,value)=>unit.effective.keywords.some(item=>String(item).toUpperCase()===value);
const effect=(unit,id)=>unit.effects.find(item=>item.id===id);
const profile=(unit,id)=>unit.effective.weaponProfiles.find(item=>item.id===id);

const neuroFixture=(catalog,attached=true)=>createRosterFixture({
  catalog,pointsCatalog,id:`neurocytes-${attached?'attached':'detached'}`,
  units:[
    {datasheetId:'unit-neurotyrant',instanceId:'parsed-unit-1',quantity:1,selectionIds:['unit-neurotyrant-selection-neurotyrant-claws-and-lashes','unit-neurotyrant-selection-psychic-scream']},
    {datasheetId:'unit-neurogaunts',instanceId:'parsed-unit-2',quantity:11,selectionIds:['unit-neurogaunts-selection-chitinous-claws-and-teeth']},
    {datasheetId:'unit-neurogaunts',instanceId:'parsed-unit-3',quantity:11,selectionIds:['unit-neurogaunts-selection-chitinous-claws-and-teeth']},
  ],
  attachments:attached?{'parsed-unit-2':['parsed-unit-1']}: {},
});
const leaderFixture=catalog=>createRosterFixture({
  catalog,pointsCatalog,id:'leader-beasts',detachmentId:'warrior-bioform-onslaught',
  units:[
    {datasheetId:'unit-tyranid-warriors-with-melee-bio-weapons',instanceId:'parsed-unit-1',quantity:3},
    {datasheetId:'unit-tyranid-warriors-with-ranged-bio-weapons',instanceId:'parsed-unit-2',quantity:3},
    {datasheetId:'unit-tyranid-prime-with-lash-whip',instanceId:'parsed-unit-3',quantity:1},
    {datasheetId:'unit-winged-tyranid-prime',instanceId:'parsed-unit-4',quantity:1},
    {datasheetId:'unit-neurogaunts',instanceId:'parsed-unit-5',quantity:11},
  ],
});
const plainLeaderFixture=catalog=>createRosterFixture({
  catalog,pointsCatalog,id:'leader-beasts-absent',
  units:[
    {datasheetId:'unit-tyranid-warriors-with-melee-bio-weapons',instanceId:'parsed-unit-1',quantity:3},
    {datasheetId:'unit-neurogaunts',instanceId:'parsed-unit-2',quantity:11},
  ],
});
const projectFixture=(catalog,fixture)=>{
  runtime.WH_BOOK_ROSTER_CATALOG=catalog;
  const roster=runtime.WHRosterParser.parse(fixture.record.sourceText);
  return runtime.WHArmyRosterContext.project({catalog,roster,record:fixture.record,provider:{gameEffects:context=>runtime.WHEffectContractRuntime.project(context)}}).game;
};
const projectNeuro=(catalog,attached=true)=>projectFixture(catalog,neuroFixture(catalog,attached));
const projectLeader=catalog=>projectFixture(catalog,leaderFixture(catalog));
const projectPlainLeader=catalog=>projectFixture(catalog,plainLeaderFixture(catalog));

const certify=catalog=>{
  const neuroContract=contract(catalog,ids.neurocytes),synapseContract=contract(catalog,ids.synapse),leaderContract=contract(catalog,ids.leader);
  assert.equal(neuroContract.sourceUnitId,'unit-neurogaunts','Neurocytes canonical source unit');
  assert.equal(neuroContract.clauses[0].operations[0].canonicalTarget,'SYNAPSE','Neurocytes exact keyword target');
  assert.equal(synapseContract.clauses[0].conditions[0].keyword,'SYNAPSE','Synapse effective keyword condition');
  assert.equal(synapseContract.clauses[0].operations[0].canonicalTarget,'melee','Synapse melee-only target');
  assert.deepEqual({...synapseContract.clauses[0].operations[0].parameters},{stat:'S',delta:1},'Synapse exact Strength modifier');
  const leaderKeyword=leaderContract.clauses[0].operations.find(item=>item.id==='leader-beasts:tyranid-warriors');
  assert.equal(leaderKeyword?.canonicalTarget,'TYRANID WARRIORS','Leader Beasts exact Warriors keyword');

  const attached=projectNeuro(catalog,true),neurotyrant=attached.units[0],neurogaunts=attached.units[1],duplicate=attached.units[2];
  assert.equal(hasKeyword(neurogaunts,'SYNAPSE'),true,'attached Neurogaunts gain SYNAPSE');
  assert.equal(effect(neurogaunts,'neurocytes:synapse')?.source.id,ids.neurocytes,'Neurocytes grant provenance');
  assert.equal(effect(neurogaunts,'synapse:melee-strength')?.source.id,ids.synapse,'derived Synapse modifier provenance');
  assert.equal(profile(neurogaunts,'unit-neurogaunts-profile-8766ebf34c')?.values.S,'4','Neurocytes-derived Synapse grants melee S +1');
  assert.equal(profile(neurotyrant,'unit-neurotyrant-profile-f3d25213c1')?.values.S,'6','intrinsic SYNAPSE model gains melee S +1');
  assert.equal(profile(neurotyrant,'unit-neurotyrant-profile-0461ca45af')?.values.S,'5','ranged weapon remains unchanged');
  assert.equal(hasKeyword(duplicate,'SYNAPSE'),false,'unrelated duplicate Neurogaunts do not gain SYNAPSE');
  assert.equal(profile(duplicate,'unit-neurogaunts-profile-8766ebf34c')?.values.S,'3','unrelated duplicate melee Strength unchanged');
  assert.equal(effect(duplicate,'neurocytes:synapse'),undefined,'Neurocytes does not leak to duplicate physical instance');
  assert.equal(effect(duplicate,'synapse:melee-strength'),undefined,'Synapse modifier does not leak to duplicate physical instance');

  const detached=projectNeuro(catalog,false),detachedNeurogaunts=detached.units[1];
  assert.equal(hasKeyword(detachedNeurogaunts,'SYNAPSE'),false,'detach removes Neurocytes keyword');
  assert.equal(profile(detachedNeurogaunts,'unit-neurogaunts-profile-8766ebf34c')?.values.S,'3','detach recomputes base melee Strength');
  assert.equal(effect(detachedNeurogaunts,'neurocytes:synapse'),undefined,'detach removes Neurocytes effect');
  assert.equal(effect(detachedNeurogaunts,'synapse:melee-strength'),undefined,'detach removes chained Synapse effect');
  const reattached=projectNeuro(catalog,true);
  assert.equal(hasKeyword(reattached.units[1],'SYNAPSE'),true,'reattach restores Neurocytes keyword');
  assert.equal(profile(reattached.units[1],'unit-neurogaunts-profile-8766ebf34c')?.values.S,'4','reattach restores melee Strength');

  const leader=projectLeader(catalog),melee=leader.units[0],ranged=leader.units[1],prime=leader.units[2],winged=leader.units[3],unrelated=leader.units[4];
  for(const unit of [melee,ranged]){
    assert.equal(hasKeyword(unit,'TYRANID WARRIORS'),true,'Leader Beasts grants TYRANID WARRIORS');
    assert.equal(hasKeyword(unit,'BATTLELINE'),true,'Leader Beasts preserves BATTLELINE');
    assert.equal(unit.effective.stats.Invulnerable,'5+','Leader Beasts preserves Warrior invulnerable');
  }
  for(const unit of [prime,winged]){
    assert.equal(hasKeyword(unit,'TYRANID WARRIORS'),false,'Prime does not gain unit keyword');
    assert.equal(hasKeyword(unit,'BATTLELINE'),false,'Prime does not gain BATTLELINE');
    assert.equal(unit.effective.stats.Invulnerable,'5+','Prime preserves 5+ invulnerable');
  }
  assert.equal(hasKeyword(unrelated,'TYRANID WARRIORS'),false,'Leader Beasts does not leak Warriors keyword');
  assert.equal(hasKeyword(unrelated,'BATTLELINE'),false,'Leader Beasts does not leak BATTLELINE');
  assert.equal(unrelated.effective.stats.Invulnerable,'','Leader Beasts does not leak invulnerable');
  const absent=projectPlainLeader(catalog),absentWarrior=absent.units[0];
  assert.equal(hasKeyword(absentWarrior,'TYRANID WARRIORS'),false,'wrong Detachment has no Warriors grant');
  assert.equal(hasKeyword(absentWarrior,'BATTLELINE'),false,'wrong Detachment has no Battleline grant');
  assert.equal(absentWarrior.effective.stats.Invulnerable,'','wrong Detachment has no invulnerable grant');
};

certify(baseline);
const reversed=clone(baseline);reversed.effectContracts.reverse();certify(reversed);

let mutations=0;
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} must be killed`);mutations++;};
killed('SYNAPSE_DELTA',catalog=>{contract(catalog,ids.synapse).clauses[0].operations[0].parameters.delta=2;});
killed('SYNAPSE_TARGET',catalog=>{contract(catalog,ids.synapse).clauses[0].operations[0].canonicalTarget='ranged';});
killed('SYNAPSE_CONDITION',catalog=>{contract(catalog,ids.synapse).clauses[0].conditions[0].keyword='BATTLELINE';});
killed('NEUROCYTES_KEYWORD',catalog=>{contract(catalog,ids.neurocytes).clauses[0].operations[0].canonicalTarget='BATTLELINE';});
killed('NEUROCYTES_ATTACHMENT',catalog=>{contract(catalog,ids.neurocytes).selector.groupContainsUnitIds=['unit-winged-tyranid-prime'];});
killed('NEUROCYTES_SCOPE',catalog=>{contract(catalog,ids.neurocytes).scope='attached-leaders';});
killed('LEADER_WARRIORS_KEYWORD',catalog=>{contract(catalog,ids.leader).clauses[0].operations.find(item=>item.id==='leader-beasts:tyranid-warriors').canonicalTarget='SYNAPSE';});
killed('LEADER_SELECTOR',catalog=>{contract(catalog,ids.leader).clauses[0].selector={};});
killed('LEADER_BATTLELINE',catalog=>{contract(catalog,ids.leader).clauses[0].operations.find(item=>item.id==='leader-beasts:battleline').canonicalTarget='SYNAPSE';});
killed('LEADER_INVULNERABLE',catalog=>{contract(catalog,ids.leader).clauses[1].operations.find(item=>item.id==='leader-beasts:invulnerable').parameters.to='4+';});
killed('LEADER_DETACHMENT',catalog=>{contract(catalog,ids.leader).detachmentId='invasion-fleet';});
assert.equal(mutations,11,'Tyranids Synapse and keyword mutation inventory');

console.log('Tyranids Synapse and keyword effects: 3/3 executable; interaction 3/3; positive 11/11; negative 12/12; physical-instance 6/6; recompute 14/14; mutations 11/11 KILLED; order-independent PASS');