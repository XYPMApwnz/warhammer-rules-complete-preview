/** Focused native-path controls for static physical choice operations. */
import assert from 'node:assert/strict';
import {buildTauImportBook} from './roster-import-build.mjs';
import {createTauBrowserRoster} from './roster-boot.mjs';
import {resolvePhysicalChoiceEffects} from '../../shared/roster-v2/physical-choice.mjs';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createTauRuleSchema} from './rule-contract-schema.mjs';
import {tauSourceChoiceInputs} from './roster-source-choices.mjs';

const book=buildTauImportBook(),original=JSON.stringify(book),clone=structuredClone;
const checks=[],negatives=[];
const check=(id,fn)=>{fn();checks.push(id);console.log('PASS '+id);};
const observed=service=>JSON.stringify({state:service.snapshot(),projection:service.projection,
  contexts:service.state.units.map(unit=>service.context(unit.instanceId)),
  effective:service.state.units.map(unit=>service.effective(unit.instanceId))},(_key,value)=>value instanceof Set?[...value].sort():value);
const reject=(id,service,fn,expected)=>{
  const before=observed(service);assert.throws(fn,error=>!(error instanceof assert.AssertionError)&&expected.test(error.message),id);
  assert.equal(observed(service),before,'Atomic state/context/projection/effective after '+id);negatives.push(id);
};
const ruleId='detachment-auxiliary-cadre:enhancement:1';
const source=(name)=>`1x ${name} (100 pts)\n• 1x ${name}\nEnhancement: Student of Kauyon\n`;
const carnivores='10x Kroot Carnivores (100 pts)\n• 1x Long-quill\n• 9x Kroot Carnivores\n';
const farstalkers='12x Kroot Farstalkers (100 pts)\n• 1x Kroot Kill-broker\n• 9x Kroot Farstalkers\n• 2x Kroot Hounds\n';
const studentText='+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Auxiliary Cadre\n'+
  source('Kroot Trail Shaper')+source('Kroot War Shaper')+carnivores+carnivores+farstalkers;
const imported=text=>{const service=createTauBrowserRoster(book),result=service.import(text);assert.equal(result.status,'READY',JSON.stringify(result.errors));return service;};
const choose=(service,source,ids)=>service.setSourceChoice(source,ruleId,ids.length?JSON.stringify(ids):null);
const deep=unit=>(unit.abilities||[]).filter(ability=>ability.canonicalId==='core-deep-strike');
const pairSources=unit=>unit.applied.filter(row=>row.ruleId===ruleId&&row.operation==='GRANT_ABILITY').map(row=>row.sourceInstanceId).sort();

if(!process.argv.includes('--prototypes-only')){
 check('Student zero to three exact physical recipients and stable reload',()=>{
  const service=imported(studentText);
  assert.ok(service.projection.units.every(unit=>deep(unit).length===0));
  for(const ids of [[],['parsed-unit-3'],['parsed-unit-3','parsed-unit-4'],['parsed-unit-3','parsed-unit-4','parsed-unit-5']]){
   choose(service,'parsed-unit-1',ids);
   for(const unit of service.projection.units)assert.equal(deep(unit).length,ids.includes(unit.instanceId)?1:0);
   const before=observed(service);service.load(service.snapshot());assert.equal(observed(service),before);
  }
  const state=service.snapshot(),entries=resolvePhysicalChoiceEffects(book,service.projection);
  assert.equal(entries.length,3);
  for(const entry of entries){
   assert.equal(entry.clause.id,ruleId+'::physical-pair/'+JSON.stringify(['parsed-unit-1',entry.physicalTarget.unit.instanceId]));
   assert.equal(entry.effect.id,entry.clause.id+'/deep-strike');
   assert.equal(sourceSnapshot(entry.effect,{book}).physicalSourcePair.sourceModelScopeId,state.units[0].enhancementAssignments[0].modelScopeId);
  }
 });
 check('Student independent sources share one recipient without duplicate ability or lost grant',()=>{
  const service=imported(studentText);choose(service,'parsed-unit-1',['parsed-unit-3']);choose(service,'parsed-unit-2',['parsed-unit-3']);
  assert.deepEqual(pairSources(service.projection.units[2]),['parsed-unit-1','parsed-unit-2']);assert.equal(deep(service.projection.units[2]).length,1);
  choose(service,'parsed-unit-1',[]);assert.deepEqual(pairSources(service.projection.units[2]),['parsed-unit-2']);assert.equal(deep(service.projection.units[2]).length,1);
  assert.equal(deep(service.projection.units[3]).length,0,'Same datasheet does not identify the chosen UNIT');
  service.attach('parsed-unit-2','parsed-unit-3');assert.equal(deep(service.projection.units[2]).length,1);
  service.detach('parsed-unit-2');assert.equal(deep(service.projection.units[2]).length,1);
  service.reattach('parsed-unit-2','parsed-unit-3');const before=observed(service);
  assert.equal(service.import(studentText).status,'READY');assert.equal(observed(service),before);
 });
 check('Student rejected source recipient scope detachment and late preparation preserve every observation',()=>{
  const service=imported(studentText);choose(service,'parsed-unit-1',['parsed-unit-3']);
  reject('foreign recipient',service,()=>choose(service,'parsed-unit-1',['missing-unit']),/^Unconfirmed physical source choice$/);
  reject('foreign source',service,()=>choose(service,'parsed-unit-3',['parsed-unit-4']),/^Unconfirmed physical source choice$/);
  reject('enemy or ineligible recipient',service,()=>choose(service,'parsed-unit-1',['parsed-unit-2']),/^Unconfirmed physical source choice$/);
  reject('four recipients',service,()=>choose(service,'parsed-unit-1',['parsed-unit-3','parsed-unit-4','parsed-unit-5','parsed-unit-2']),/^Unconfirmed physical source choice$/);
  for(const [id,alter,pattern]of [
   ['stale scope',state=>state.units[0].modelRows[0].selections.find(row=>row.recipientInstanceIds).sourceModelScopeId='missing-scope',/physical source evidence/],
   ['detachment removed',state=>{state.detachmentIds=[];state.detachments=[];},/Student of Kauyon requires|Detachment/],
   ['late duplicate decision',state=>state.units[0].modelRows[0].selections.push(clone(state.units[0].modelRows[0].selections.find(row=>row.recipientInstanceIds))),/source choice field|duplicate|Duplicate/]
  ]){const bad=service.snapshot();alter(bad);reject(id,service,()=>service.load(bad),pattern);}
 });
 check('Interpreter failure after the first source grant cannot publish partial state or context',()=>{
  const source=imported(studentText);choose(source,'parsed-unit-1',['parsed-unit-3']);choose(source,'parsed-unit-2',['parsed-unit-4']);
  const schema=createTauRuleSchema();let fail=false,calls=0;
  const service=createRosterRuntime(book,{...schema,conditionInputs:tauSourceChoiceInputs(book),evaluatePredicate:(node,context)=>{
   if(fail&&node.arguments?.key==='physicalUnitInstanceId'&&++calls===3)throw new TypeError('Intentional failure after first physical grant');
   return schema.evaluatePredicate(node,context);
  }});
  service.load(source.snapshot());const before=observed(service),bad=service.snapshot();bad.rosterId+='-rejected';
  fail=true;assert.throws(()=>service.load(bad),/^TypeError: Intentional failure after first physical grant$/);fail=false;
  assert.equal(calls,3,'The first source and target gates completed before the injected interpreter failure');
  assert.equal(observed(service),before);service.load(service.snapshot());assert.equal(observed(service),before);
  negatives.push('interpreter failure after first physical grant');
 });
}
if(!process.argv.includes('--student-only')){
 const specs=[
  ['Thermoneutronic Projector','T’au flamer',{strength:2,ap:-1,damage:1}],
  ['Plasma Accelerator Rifle','Plasma rifle',{strength:2,attacks:1,ap:-1,damage:1}],
  ['Supernova Launcher','Airbursting fragmentation projector',{strength:3,ap:-1,damage:1}]
 ];
 for(const [i,[name,weaponName,deltas]]of specs.entries())check('Prototype '+name+' exact weapon partition lifecycle and rollback',()=>{
  const id='detachment-experimental-prototype-cadre:enhancement:'+(i+1);
  for(const count of [1,2]){
   const one=`1x Commander In Coldstar Battlesuit (100 pts)\n• 1x Commander in Coldstar Battlesuit: ${count}x ${weaponName}\n`;
   const text='+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Experimental Prototype Cadre\n'+one+'Enhancement: '+name+'\n'+one;
   const service=imported(text);service.setSourceChoice('parsed-unit-1',id,null);
   const base=service.projection,option=service.sourceChoices('parsed-unit-1').find(row=>row.id===id).options[0];assert.ok(option);
   assert.ok(base.units.every(unit=>!unit.applied.some(row=>row.ruleId===id)),'No effect without a recorded choice');
   service.setSourceChoice('parsed-unit-1',id,option.id);
   const unit=service.projection.units[0],weapons=[...unit.weapons,...unit.profiles.flatMap(model=>model.weapons)];
   assert.equal(weapons.reduce((sum,weapon)=>sum+weapon.physicalQuantity,0),count);
   assert.equal(weapons.length,count);assert.equal(weapons[0].physicalQuantity,1);
   const beforeWeapon=base.units[0].profiles[0].weapons[0];
   for(const [field,delta]of Object.entries(deltas))assert.equal(Number(weapons[0].data[field]),Number(beforeWeapon.data[field])+delta);
   if(count===2)assert.deepEqual(weapons[1].data,beforeWeapon.data,'Remainder gets no Prototype effect');
   assert.deepEqual(service.projection.units[1],base.units[1],'Independent duplicate MODEL receives no effect or partition');
   const before=observed(service),saved=service.snapshot();service.load(saved);assert.equal(observed(service),before);
   assert.equal(service.import(text).status,'READY');assert.equal(observed(service),before);
   for(const [label,alter,pattern]of [
    ['foreign weapon owner',decision=>decision.sourceWeaponReference.unitInstanceId='parsed-unit-2',/weapon choice evidence/],
    ['wrong weapon scope',decision=>decision.sourceWeaponReference.scopeId='missing-scope',/weapon choice evidence/],
    ['stale weapon key',decision=>decision.sourceWeaponReference.selectionKey='missing-selection',/exact weapon|aggregate|selection/],
    ['stale loadout',decision=>decision.sourceLoadoutEvidence=[],/Stale Prototype|stale weapon/],
    ['foreign choice source',decision=>decision.sourceInstanceId='parsed-unit-2',/MODEL source/]
   ]){
    const bad=service.snapshot(),decision=bad.units[0].modelRows[0].selections.find(selection=>selection.sourceRuleId===id);assert.ok(decision);
    alter(decision);reject(name+'/'+count+'/'+label,service,()=>service.load(bad),pattern);
   }
   service.setSourceChoice('parsed-unit-1',id,null);assert.deepEqual(service.projection,base);
   service.setSourceChoice('parsed-unit-1',id,option.id);assert.equal(observed(service),before);
  }
 });
 check('Prototype inherited weapon keeps original row evidence after a physical loadout split',()=>{
  const id='detachment-experimental-prototype-cadre:enhancement:1';
  const text='+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Experimental Prototype Cadre\n'+
   '3x Crisis Starscythe Battlesuits (100 pts)\n• 1x Crisis Starscythe Shas’vre: 1x T’au flamer\n'+
   '• 2x Crisis Starscythe Shas’ui: 1x T’au flamer\n1 with 1x Battlesuit fists\nEnhancement: Thermoneutronic Projector\n';
  const service=createTauBrowserRoster(book),candidate=service.import(text);
  assert.equal(candidate.status,'NEEDS_BINDINGS');
  const physical=formRoster(book,candidate.candidateRoster),model=physical.units[0].profiles.find(model=>model.scopeId.includes('/LOADOUT/'));
  assert.ok(model);assert.equal(model.quantity,1);
  const result=service.import(text,{modelBearers:{'parsed-unit-1':{[id]:model.scopeId}}});assert.equal(result.status,'READY');
  const row=service.snapshot().units[0].modelRows[1],input=row.selections[0];
  assert.equal(row.quantity,2);assert.equal(input.physicalQuantity,2);assert.equal(input.quantityEvidence.modelQuantity,2);
  const base=service.projection,choice=service.sourceChoices('parsed-unit-1').find(row=>row.id===id).options[0];assert.ok(choice);
  service.setSourceChoice('parsed-unit-1',id,choice.id);
  const selected=service.projection.units[0].profiles.find(group=>group.scopeId===model.scopeId);
  assert.equal(Number(selected.weapons.find(weapon=>weapon.canonicalProfileId===input.canonicalProfileIds[0]).data.strength),
    Number(base.units[0].profiles.find(group=>group.scopeId===model.scopeId).weapons.find(weapon=>weapon.canonicalProfileId===input.canonicalProfileIds[0]).data.strength)+2);
  for(const other of service.projection.units[0].profiles.filter(group=>group.scopeId!==model.scopeId))
    assert.deepEqual(other,base.units[0].profiles.find(group=>group.scopeId===other.scopeId));
  const before=observed(service);service.load(service.snapshot());assert.equal(observed(service),before);
  const bad=service.snapshot();bad.units[0].modelRows[1].selections[0].quantityEvidence.modelQuantity=1;
  reject('split weapon proof cannot use derived group count',service,()=>service.load(bad),/INPUT_QUANTITY_EVIDENCE_MISMATCH/);
 });
}
assert.equal(JSON.stringify(book),original,'Canonical book never changes during any choice or failed edit');
console.log(JSON.stringify({status:'PASS',checks,negativeControls:negatives,bookUnchanged:true}));
