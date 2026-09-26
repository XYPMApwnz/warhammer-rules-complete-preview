import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRosterFixture} from '../../../tests/helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const source=JSON.stringify(JSON.parse(read('books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json')));
assert.ok(source.includes('Gift of Poxes: Add 3\\" to the range of this model’s Contagion Range.'),'Gift of Poxes accepted source wording');
assert.ok(source.includes('Friendly DEATH GUARD CHARACTER units have +3\\" to their Contagion Range (to a maximum of 12\\").'),'Hypervirulent Strains accepted source wording');
assert.ok(source.includes('Contagion Range cannot be greater than 12\\" after modifiers.'),'global Contagion Range cap source wording');

const runtime={console,addEventListener(){}};runtime.window=runtime;runtime.globalThis=runtime;vm.createContext(runtime);
for(const file of [
  'books/death-guard/scripts/roster-data.js',
  'roster-guides/points-data.js',
  'books/shared/rule-facts.js',
  'roster-guides/points-validator.js',
  'books/shared/effect-contract-runtime.js',
  'books/shared/roster-parser.js',
  'books/shared/roster-context.js',
])vm.runInContext(read(file),runtime,{filename:file});

const baseline=runtime.WH_BOOK_ROSTER_CATALOG;
const pointsCatalog=runtime.WH_POINTS_CATALOG['death guard'];
const giftId='lord-of-poxes-ability-gift-of-poxes';
const hyperId='detachment-rule-hypervirulent-strains';
const lordId='unit-lord-of-poxes';
const paragonsId='detachment-paragons-of-putrescence';
const otherDetachmentId='detachment-flyblown-host';
const modifier=unit=>unit.effective.characteristicModifiers?.find(item=>item.targetId==='Contagion Range');
const effect=(unit,id)=>unit.effects.find(item=>item.id===id);
const contract=(catalog,id)=>catalog.effectContracts.find(item=>item.canonicalRecordId===id);
const resolve=(record,base)=>Math.min(record.maximum??Infinity,Math.max(record.minimum??-Infinity,base+record.delta));

const fixtureFor=(catalog,{detachmentId=otherDetachmentId,includeLords=true}={})=>createRosterFixture({
  catalog,pointsCatalog,id:`contagion-${detachmentId}-${includeLords?'lords':'no-lords'}`,
  detachmentId,
  units:[
    ...(includeLords?[
      {datasheetId:lordId,instanceId:'parsed-unit-1',quantity:1},
      {datasheetId:lordId,instanceId:'parsed-unit-2',quantity:1},
    ]:[]),
    {datasheetId:'unit-plague-marines',instanceId:`parsed-unit-${includeLords?3:1}`,quantity:5},
  ],
});
const project=(catalog,options)=>{
  runtime.WH_BOOK_ROSTER_CATALOG=catalog;
  const fixture=fixtureFor(catalog,options),roster=runtime.WHRosterParser.parse(fixture.record.sourceText);
  return runtime.WHArmyRosterContext.project({catalog,roster,record:fixture.record,provider:{gameEffects:context=>runtime.WHEffectContractRuntime.project(context)}}).game;
};

const certify=catalog=>{
  const gift=contract(catalog,giftId),hyper=contract(catalog,hyperId);
  assert.equal(gift.scope,'source-model','Gift of Poxes exact source-model scope');
  assert.equal(gift.sourceUnitId,lordId,'Gift of Poxes exact source model identity');
  const giftOperation=gift.clauses[0].operations.find(item=>item.id==='gift-of-poxes-contagion-range');
  assert.deepEqual({...giftOperation.parameters},{value:3,maximum:12,modifierOnly:true},'Gift of Poxes structured modifier');
  assert.deepEqual([...hyper.clauses[0].selector.allKeywords],['DEATH GUARD','CHARACTER'],'Hypervirulent exact source selector');
  const hyperOperation=hyper.clauses[0].operations.find(item=>item.id==='hypervirulent-strains-contagion-range');
  assert.deepEqual({...hyperOperation.parameters},{value:3,maximum:12,modifierOnly:true},'Hypervirulent structured modifier');

  const giftOnly=project(catalog,{detachmentId:otherDetachmentId,includeLords:true});
  const giftA=giftOnly.units.find(unit=>unit.identity.instanceId==='parsed-unit-1'),giftB=giftOnly.units.find(unit=>unit.identity.instanceId==='parsed-unit-2'),unrelated=giftOnly.units.find(unit=>unit.identity.instanceId==='parsed-unit-3');
  for(const [unit,instanceId] of [[giftA,'parsed-unit-1'],[giftB,'parsed-unit-2']]){
    assert.equal(modifier(unit)?.delta,3,'Gift of Poxes +3 range');
    assert.equal(modifier(unit)?.maximum,12,'Gift of Poxes global cap');
    assert.deepEqual([...modifier(unit).sourceEffectIds],['gift-of-poxes-contagion-range'],'Gift effect inventory');
    assert.equal(effect(unit,'gift-of-poxes-contagion-range')?.source.ownerInstanceId,instanceId,'Gift source stays on its physical model');
    assert.equal(resolve(modifier(unit),9),12,'Gift cap resolves 9 + 3 to 12');
  }
  assert.equal(modifier(unrelated),undefined,'Gift does not affect unrelated physical unit');
  const removed=project(catalog,{detachmentId:otherDetachmentId,includeLords:false});
  assert.equal(removed.units.every(unit=>modifier(unit)===undefined),true,'removing Gift source recomputes to base state');

  const falseCondition=project(catalog,{detachmentId:otherDetachmentId,includeLords:true});
  assert.equal(falseCondition.units.every(unit=>effect(unit,'hypervirulent-strains-contagion-range')===undefined),true,'Hypervirulent false detachment condition emits no bonus');
  const trueCondition=project(catalog,{detachmentId:paragonsId,includeLords:true});
  const stackedA=trueCondition.units.find(unit=>unit.identity.instanceId==='parsed-unit-1'),stackedB=trueCondition.units.find(unit=>unit.identity.instanceId==='parsed-unit-2'),nonCharacter=trueCondition.units.find(unit=>unit.identity.instanceId==='parsed-unit-3');
  for(const unit of [stackedA,stackedB]){
    assert.equal(effect(unit,'hypervirulent-strains-contagion-range')?.delta,3,'Hypervirulent true condition +3');
    assert.equal(modifier(unit)?.delta,6,'Gift and Hypervirulent stack additively');
    assert.equal(modifier(unit)?.maximum,12,'stacked Contagion Range retains absolute cap');
    assert.deepEqual(new Set(modifier(unit).sourceEffectIds),new Set(['gift-of-poxes-contagion-range','hypervirulent-strains-contagion-range']),'stacked source inventory');
    assert.equal(resolve(modifier(unit),3),9,'stacked round-one range');
    assert.equal(resolve(modifier(unit),6),12,'stacked round-two range caps at 12');
    assert.equal(resolve(modifier(unit),9),12,'stacked round-three range caps at 12');
    assert.equal(resolve(modifier(unit),12),12,'stacked modifier never exceeds cap');
  }
  assert.equal(effect(nonCharacter,'hypervirulent-strains-contagion-range'),undefined,'Hypervirulent excludes non-CHARACTER unit');
  assert.equal(modifier(nonCharacter),undefined,'non-CHARACTER effective state remains unchanged');

  const recomputedFalse=project(catalog,{detachmentId:otherDetachmentId,includeLords:true});
  assert.equal(modifier(recomputedFalse.units[0])?.delta,3,'detachment change removes only Hypervirulent modifier');
  const recomputedTrue=project(catalog,{detachmentId:paragonsId,includeLords:true});
  assert.equal(modifier(recomputedTrue.units[0])?.delta,6,'detachment change restores Hypervirulent modifier');
};

certify(baseline);

let mutations=0;
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} must be killed`);mutations++;};
killed('GIFT_VALUE',catalog=>{contract(catalog,giftId).clauses[0].operations[0].parameters.value=2;});
killed('GIFT_CAP',catalog=>{contract(catalog,giftId).clauses[0].operations[0].parameters.maximum=15;});
killed('GIFT_SCOPE',catalog=>{contract(catalog,giftId).scope='attached-unit';});
killed('HYPER_VALUE',catalog=>{contract(catalog,hyperId).clauses[0].operations[0].parameters.value=2;});
killed('HYPER_CAP',catalog=>{contract(catalog,hyperId).clauses[0].operations[0].parameters.maximum=15;});
killed('HYPER_DETACHMENT',catalog=>{contract(catalog,hyperId).detachmentId=otherDetachmentId;contract(catalog,hyperId).selector.detachmentId=otherDetachmentId;});
killed('HYPER_SELECTOR',catalog=>{contract(catalog,hyperId).clauses[0].selector.allKeywords=['DEATH GUARD'];});
assert.equal(mutations,7,'Contagion Range mutation inventory');

console.log('Death Guard Contagion Range effects: 2/2 executable; positive 10/10; negative 5/5; cap 10/10; stacking 8/8; physical-instance 6/6; recompute 4/4; mutations 7/7 KILLED; PASS');
