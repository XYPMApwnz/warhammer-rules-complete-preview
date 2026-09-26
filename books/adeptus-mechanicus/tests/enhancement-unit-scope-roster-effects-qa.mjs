import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRosterFixture} from '../../../tests/helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const source=JSON.stringify(JSON.parse(read('books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json')));
assert.ok(source.includes('The bearer, and models in any unit they are leading, have the Infiltrators and Scouts 6\\" abilities.'),'Clandestine Infiltrator accepted wording');
assert.ok(source.includes('SKITARII MARSHAL model only. This unit has Infiltrators'),'Explorator Dispensation accepted wording');
assert.ok(source.includes('Models in the bearer’s unit have the SKITARII keyword.'),'Martial Signatum Amplificator accepted wording');

const runtime={console,addEventListener(){}};runtime.window=runtime;runtime.globalThis=runtime;vm.createContext(runtime);
for(const file of [
  'books/adeptus-mechanicus/scripts/roster-data.js',
  'roster-guides/points-data.js',
  'books/shared/rule-facts.js',
  'roster-guides/points-validator.js',
  'books/shared/effect-contract-runtime.js',
  'books/shared/roster-parser.js',
  'books/shared/roster-context.js',
])vm.runInContext(read(file),runtime,{filename:file});

const baseline=runtime.WH_BOOK_ROSTER_CATALOG,pointsCatalog=runtime.WH_POINTS_CATALOG['adeptus mechanicus'];
const definitions=[
  {id:'enhancement-clandestine-infiltrator',detachmentId:'detachment-skitarii-hunter-cohort',ownerId:'unit-skitarii-marshal',bodyId:'unit-skitarii-rangers',targets:['core-infiltrators','core-scouts']},
  {id:'enhancement-explorator-dispensation',detachmentId:'detachment-cohort-acquisitus',ownerId:'unit-skitarii-marshal',bodyId:'unit-skitarii-rangers',targets:['core-infiltrators']},
  {id:'enhancement-martial-signatum-amplificator',detachmentId:'detachment-eradication-cohort',ownerId:'unit-tech-priest-manipulus',bodyId:'unit-skitarii-rangers',targets:['SKITARII']},
];

const fixtureFor=(catalog,definition,{enhancement=true,attached=true}={})=>createRosterFixture({
  catalog,pointsCatalog,id:`${definition.id}-${enhancement?'enhanced':'plain'}-${attached?'attached':'detached'}`,
  detachmentId:definition.detachmentId,
  units:[
    {datasheetId:definition.ownerId,instanceId:'parsed-unit-1',quantity:1,...(enhancement?{enhancementId:definition.id}:{})},
    {datasheetId:definition.bodyId,instanceId:'parsed-unit-2',quantity:10},
    {datasheetId:definition.bodyId,instanceId:'parsed-unit-3',quantity:10},
    {datasheetId:'unit-kataphron-breachers',instanceId:'parsed-unit-4',quantity:3},
  ],
  attachments:attached?{'parsed-unit-2':['parsed-unit-1']}: {},
});
const project=(catalog,definition,options)=>{
  runtime.WH_BOOK_ROSTER_CATALOG=catalog;
  const fixture=fixtureFor(catalog,definition,options),roster=runtime.WHRosterParser.parse(fixture.record.sourceText);
  return runtime.WHArmyRosterContext.project({catalog,roster,record:fixture.record,provider:{gameEffects:context=>runtime.WHEffectContractRuntime.project(context)}}).game;
};
const hasAbility=(unit,id)=>unit.effective.abilities.some(item=>item.id===id);
const hasKeyword=(unit,id)=>unit.effective.keywords.some(item=>String(item).toUpperCase()===id);
const hasTarget=(unit,id)=>id==='SKITARII'?hasKeyword(unit,id):hasAbility(unit,id);
const enhancementEffects=(unit,id)=>unit.effects.filter(effect=>effect.source?.id===id);

const certify=catalog=>{
  for(const definition of definitions){
    const attached=project(catalog,definition,{enhancement:true,attached:true}),owner=attached.units[0],body=attached.units[1],duplicate=attached.units[2],unrelated=attached.units[3];
    for(const target of definition.targets){
      assert.equal(hasTarget(owner,target),true,`${definition.id}: bearer receives ${target}`);
      assert.equal(hasTarget(body,target),true,`${definition.id}: attached Bodyguard receives ${target}`);
      assert.equal(hasTarget(unrelated,target),false,`${definition.id}: unrelated unit gained ${target}`);
    }
    assert.equal(enhancementEffects(duplicate,definition.id).length,0,`${definition.id}: effect leaked to duplicate physical unit`);
    assert.equal(enhancementEffects(unrelated,definition.id).length,0,`${definition.id}: effect leaked to unrelated physical unit`);
    assert.equal(enhancementEffects(owner,definition.id).length,definition.targets.length,`${definition.id}: bearer effect inventory`);
    assert.equal(enhancementEffects(body,definition.id).length,definition.targets.length,`${definition.id}: Bodyguard effect inventory`);

    const detached=project(catalog,definition,{enhancement:true,attached:false});
    assert.equal(enhancementEffects(detached.units[1],definition.id).length,0,`${definition.id}: detach did not remove propagated effect`);
    assert.equal(enhancementEffects(detached.units[0],definition.id).length,definition.targets.length,`${definition.id}: detached bearer lost own-unit effect`);

    const absent=project(catalog,definition,{enhancement:false,attached:true});
    assert.equal(absent.units.every(unit=>enhancementEffects(unit,definition.id).length===0),true,`${definition.id}: absent Enhancement emitted an effect`);
  }
  const clandestine=project(catalog,definitions[0],{enhancement:true,attached:true});
  for(const unit of clandestine.units.slice(0,2)){
    const scouts=unit.effects.find(effect=>effect.source?.id===definitions[0].id&&effect.targetId==='core-scouts');
    assert.equal(scouts?.distance,6,'Clandestine Infiltrator Scouts distance');
  }
};

certify(baseline);

let mutations=0;
const contract=(catalog,id)=>catalog.effectContracts.find(item=>item.canonicalRecordId===id);
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} must be killed`);mutations++;};
for(const definition of definitions)killed(`${definition.id}-BEARER_SCOPE`,catalog=>{contract(catalog,definition.id).scope='bearer';});
for(const definition of definitions)killed(`${definition.id}-BEARER_CLAUSE`,catalog=>{contract(catalog,definition.id).clauses[0].selector={subject:'bearer'};});
killed('CLANDESTINE_SCOUTS_DISTANCE',catalog=>{contract(catalog,definitions[0].id).clauses[0].operations.find(item=>item.id==='clandestine-scouts').parameters.distance=3;});
killed('EXPLORATOR_TARGET',catalog=>{contract(catalog,definitions[1].id).clauses[0].operations[0].canonicalTarget='core-stealth';});
killed('MARTIAL_KEYWORD',catalog=>{contract(catalog,definitions[2].id).clauses[0].operations[0].canonicalTarget='CULT MECHANICUS';});
assert.equal(mutations,9,'Enhancement unit-scope mutation inventory');

console.log('Adeptus Mechanicus Enhancement unit scopes: 3/3 executable; positive 8/8; negative 13/13; detach 3/3; physical-instance 6/6; mutations 9/9 KILLED; PASS');
