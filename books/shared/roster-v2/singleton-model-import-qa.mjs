import assert from 'node:assert/strict';
import {bindSingletonModelEquipment,resolveSingletonCompositionMember} from './singleton-model-import.mjs';
const clone=structuredClone,checks=[];
const equipment={selectionKey:'unit-1/unit/selection/1',canonicalProfileIds:[],canonicalEquipmentIds:['gear'],canonicalFieldPaths:{gear:['/text']},
  physicalQuantity:1,perModelQuantity:null,quantityEvidence:{scope:'UNIT',modelQuantity:null,selectedQuantity:1,explicitSelectedQuantity:false},sourceReferences:[{entityId:'gear',path:'/text'}]};
const binding={ownerId:'unit',canonicalEquipmentIds:['gear'],canonicalFieldPaths:{gear:['/text']},modelEffectRequiresConfirmedBearer:true};
const make=()=>({units:[{instanceId:'unit-1',canonicalUnitId:'unit',startingStrength:1,selections:[clone(equipment)],modelRows:[{rowId:'row',canonicalProfileId:'profile',quantity:1,selections:[],loadouts:[]}]}]});
const check=(name,run)=>{run();checks.push(name);};
check('one source-declared equipment occurrence transfers exactly once to the existing MODEL',()=>{
  const state=make(),unit=state.units[0];bindSingletonModelEquipment(state,[binding]);
  assert.equal(unit.selections.length,0);assert.equal(unit.modelRows[0].selections.length,1);
  const selected=unit.modelRows[0].selections[0];assert.equal(selected.selectionKey,equipment.selectionKey);assert.deepEqual(selected.sourceReferences,equipment.sourceReferences);
  assert.equal(selected.quantityEvidence.scope,'UNIT');assert.equal(selected.quantityEvidence.modelQuantity,1);assert.equal(selected.perModelQuantity,1);
  const prior=clone(state);bindSingletonModelEquipment(state,[binding]);assert.deepEqual(state,prior);
});
check('multiple MODELs never receive a UNIT-pooled bearer',()=>{
  const state=make();state.units[0].startingStrength=2;state.units[0].modelRows[0].quantity=2;
  const before=clone(state);bindSingletonModelEquipment(state,[binding]);assert.deepEqual(state,before);
});
check('raw UNIT quantity cannot override explicit multi-row Starting Strength',()=>{
  const state=make();state.units[0].startingStrength=10;state.units[0].raw={quantity:1};state.units[0].modelRows.push({rowId:'others',canonicalProfileId:'profile',quantity:9,selections:[],loadouts:[]});
  const before=clone(state);bindSingletonModelEquipment(state,[binding]);assert.deepEqual(state,before);
});
for(const [name,edit]of [['unrequested proof',binding=>{delete binding.modelEffectRequiresConfirmedBearer;}],['foreign UNIT',binding=>{binding.ownerId='foreign';}],['foreign field',binding=>{binding.canonicalFieldPaths.gear=['/other'];}]])check(name+' does not relocate equipment',()=>{
  const state=make(),declaration=clone(binding);edit(declaration);const before=clone(state);bindSingletonModelEquipment(state,[declaration]);assert.deepEqual(state,before);
});
check('weapons and provided weapons remain on their existing path',()=>{
  const state=make();state.units[0].selections[0].canonicalProfileIds=['weapon'];const before=clone(state);bindSingletonModelEquipment(state,[binding]);assert.deepEqual(state,before);
});
check('quantity and duplicate negatives reject the intended proof failure',()=>{
  const bad=make();bad.units[0].selections[0].quantityEvidence.selectedQuantity=2;
  assert.throws(()=>bindSingletonModelEquipment(bad,[binding]),/original physical quantity proof/);
  const duplicate=make();duplicate.units[0].modelRows[0].selections.push(clone(equipment));
  assert.throws(()=>bindSingletonModelEquipment(duplicate,[binding]),/Duplicate physical singleton equipment occurrence/);
});
check('same-datasheet UNIT instances remain independent',()=>{
  const state=make(),second=clone(state.units[0]);second.instanceId='unit-2';second.selections=[];state.units.push(second);
  bindSingletonModelEquipment(state,[binding]);assert.equal(state.units[0].modelRows[0].selections.length,1);assert.equal(state.units[1].modelRows[0].selections.length,0);
});
const members=[{id:'required',ownerId:'unit',profileId:'profile',quantity:{min:1,max:1}},{id:'optional',ownerId:'unit',profileId:'profile',quantity:{min:0,max:2}}];
check('composition requires a unique source-required member, not merely a shared profile',()=>{
  const unit=make().units[0],row=unit.modelRows[0];assert.equal(resolveSingletonCompositionMember(unit,row,members).id,'required');
  for(const edit of [m=>{m[0].quantity.min=0;},m=>{m[1].quantity.min=1;},m=>{m[0].profileId='different';},m=>{m[1].ownerId='foreign';}]){
    const bad=clone(members);edit(bad);assert.equal(resolveSingletonCompositionMember(unit,row,bad),null);
  }
  unit.startingStrength=2;row.quantity=2;assert.equal(resolveSingletonCompositionMember(unit,row,members),null);
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,results:checks}));
