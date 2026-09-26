import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRosterFixture} from '../../../tests/helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));

const source=JSON.parse(read('books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json'));
const plagueveilSource=source.detachments.flatMap(detachment=>detachment.enhancements||[]).find(enhancement=>enhancement.title==='Plagueveil');
assert.equal(plagueveilSource?.text,'PLAGUE MARINES unit only. This unit has -3" detection range.','accepted Plagueveil source wording');

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
const enhancementId='enhancement-plagueveil';
const ownerId='unit-plague-marines';
const characterId='unit-lord-of-poxes';
const detachmentId='detachment-flyblown-host';

const fixtureFor=(catalog,{enhancement=true,attached=true}={})=>createRosterFixture({
  catalog,pointsCatalog,id:`plagueveil-${enhancement?'enhanced':'plain'}-${attached?'attached':'detached'}`,
  detachmentId,
  units:[
    {datasheetId:ownerId,instanceId:'parsed-unit-1',quantity:5,...(enhancement?{enhancementId}:{})},
    {datasheetId:characterId,instanceId:'parsed-unit-2',quantity:1},
    {datasheetId:ownerId,instanceId:'parsed-unit-3',quantity:5},
    {datasheetId:'unit-poxwalkers',instanceId:'parsed-unit-4',quantity:10},
  ],
  attachments:attached?{'parsed-unit-1':['parsed-unit-2']}: {},
});
const project=(catalog,options)=>{
  runtime.WH_BOOK_ROSTER_CATALOG=catalog;
  const fixture=fixtureFor(catalog,options),roster=runtime.WHRosterParser.parse(fixture.record.sourceText);
  return runtime.WHArmyRosterContext.project({catalog,roster,record:fixture.record,provider:{gameEffects:context=>runtime.WHEffectContractRuntime.project(context)}}).game;
};
const modifier=unit=>unit.effective.characteristicModifiers?.find(item=>item.targetId==='Detection Range');
const effects=unit=>unit.effects.filter(effect=>effect.source?.id===enhancementId);
const contract=catalog=>catalog.effectContracts.find(item=>item.canonicalRecordId===enhancementId);

const certify=catalog=>{
  const current=contract(catalog);
  assert.equal(current.scope,'owner-or-attached-group','Plagueveil scope');
  assert.deepEqual([...current.selector.unitIds],[ownerId],'Plagueveil exact owner identity');
  const operation=current.clauses[0].operations.find(item=>item.id==='plagueveil-detection-range');
  assert.equal(operation.type,'CHARACTERISTIC_ADD','Plagueveil structured range operation');
  assert.equal(operation.canonicalTarget,'Detection Range','Plagueveil characteristic identity');
  assert.equal(operation.parameters.value,-3,'Plagueveil exact modifier');
  assert.equal(operation.parameters.modifierOnly,true,'Plagueveil non-datasheet characteristic modifier');

  const attached=project(catalog,{enhancement:true,attached:true});
  const owner=attached.units[0],character=attached.units[1],duplicate=attached.units[2],unrelated=attached.units[3];
  assert.equal(modifier(owner)?.delta,-3,'owning Plague Marines receive -3 detection range');
  assert.equal(modifier(character)?.delta,-3,'attached Character receives formed-unit modifier');
  assert.equal(modifier(duplicate),undefined,'duplicate physical Plague Marines remain isolated');
  assert.equal(modifier(unrelated),undefined,'unrelated unit remains unaffected');
  assert.equal(effects(owner).length,2,'owner receives structured modifier and canonical reference');
  assert.equal(effects(character).length,2,'attached Character receives structured modifier and canonical reference');
  assert.equal(effects(duplicate).length,0,'no effect leaks to duplicate instance');
  assert.equal(effects(unrelated).length,0,'no effect leaks to unrelated unit');

  const detached=project(catalog,{enhancement:true,attached:false});
  assert.equal(modifier(detached.units[0])?.delta,-3,'detach preserves owner modifier');
  assert.equal(modifier(detached.units[1]),undefined,'detach removes Character modifier');
  assert.equal(effects(detached.units[1]).length,0,'detach removes Character effect inventory');

  const reattached=project(catalog,{enhancement:true,attached:true});
  assert.equal(modifier(reattached.units[1])?.delta,-3,'re-attach recomputes Character modifier');
  assert.equal(modifier(reattached.units[2]),undefined,'re-attach preserves duplicate isolation');

  const absent=project(catalog,{enhancement:false,attached:true});
  assert.equal(absent.units.every(unit=>effects(unit).length===0&&modifier(unit)===undefined),true,'absent Plagueveil emits no effect');
};

certify(baseline);

let mutations=0;
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(contract(catalog));assert.throws(()=>certify(catalog),undefined,`${label} must be killed`);mutations++;};
killed('PLAGUEVEIL_SCOPE',value=>{value.scope='unit-upgrade';});
killed('PLAGUEVEIL_OWNER',value=>{value.selector.unitIds=['unit-poxwalkers'];});
killed('PLAGUEVEIL_VALUE',value=>{value.clauses[0].operations.find(item=>item.id==='plagueveil-detection-range').parameters.value=-2;});
assert.equal(mutations,3,'Plagueveil mutation inventory');

console.log('Death Guard Plagueveil roster effect: owner 1/1; attached Character 1/1; unrelated 2/2; duplicate isolation 2/2; detach/re-attach 3/3; mutations 3/3 KILLED; PASS');
