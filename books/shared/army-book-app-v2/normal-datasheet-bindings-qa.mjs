/** Standalone normal-datasheet presentation guards. No army factual inputs. */
import assert from 'node:assert/strict';
import {buildNormalDatasheetBindings,selectsNormalDatasheetBindings} from './normal-datasheet-bindings.mjs';

const evidence={sourceId:'synthetic-accepted-source',pointer:'/datasheets/0/profile-selection',sha256:'A'.repeat(64)};
function fixture(prefix='synthetic-a') {
  const id=key=>`${prefix}:${key}`;
  const entities=[
    {id:id('unit'),kind:'DATASHEET',data:{name:'Shared display title',profileIds:[id('model')],weaponIds:[id('strike'),id('sweep'),id('ordinary')]}},
    {id:id('model'),parentId:id('unit'),kind:'PROFILE',data:{M:'6"',T:'4',SV:'3+',W:'2',LD:'7+',OC:'1'}},
    {id:id('base'),parentId:id('model'),kind:'MODEL_BASE',data:{text:'(Ø32MM)',scope:'MODEL'}},
    ...['strike','sweep','ordinary'].map(key=>({id:id(key),parentId:id('unit'),kind:'WEAPON_PROFILE',data:{name:'Identical weapon display label',mode:'melee',range:'Melee',attacks:'3',skill:'3+',strength:'4',ap:'0',damage:'1',abilities:[]}})),
    {id:id('option'),parentId:id('unit'),kind:'WARGEAR_OPTION',data:{text:'A selectable canonical item.'}},
    {id:id('rule'),parentId:id('unit'),kind:'SUPPLEMENTAL_DATASHEET_RULE',data:{text:'Bound synthetic ability: Preserve this exact accepted text.'}},
    {id:id('other-unit'),kind:'DATASHEET',data:{name:'Shared display title',profileIds:[id('other-model')],weaponIds:[id('other-weapon')]}},
    {id:id('other-model'),parentId:id('other-unit'),kind:'PROFILE',data:{M:'6"'}},
    {id:id('other-weapon'),parentId:id('other-unit'),kind:'WEAPON_PROFILE',data:{name:'Identical weapon display label',mode:'melee'}},
    {id:id('other-option'),parentId:id('other-unit'),kind:'WARGEAR_OPTION',data:{text:'A selectable canonical item.'}},
    {id:id('other-rule'),parentId:id('other-unit'),kind:'SUPPLEMENTAL_DATASHEET_RULE',data:{text:'Bound synthetic ability: Preserve this exact accepted text.'}}
  ];
  const points={id:id('points'),recordType:'MFM_UNIT_POINTS',unitReferenceId:id('unit-reference'),value:80};
  const cost={id:id('cost'),recordType:'MFM_PAID_UPGRADE',armyUnitId:id('unit'),unitReferenceId:id('unit-reference'),unitPointRecordId:points.id,label:'Canonical selectable item',value:7,sourceLabel:'per canonical selectable item'};
  const records=new Map([[points.id,points],[cost.id,cost]]);
  const model={bookId:prefix,entities,mfm:{unitBindings:[{entityId:id('unit'),mfmRecordId:points.id}],paidUpgradeBindings:[{entityId:id('unit'),mfmRecordId:cost.id}]}};
  const bindings={profileSelections:[{unitId:id('unit'),groupId:id('weapon-group'),profileIds:[id('strike'),id('sweep')],text:'Select one listed profile before choosing targets.',source:structuredClone(evidence)}],
    optionCosts:[{unitId:id('unit'),itemId:id('strike'),costRecordId:cost.id,optionIds:[id('option')]}],
    boundAbilities:[{unitId:id('unit'),itemId:id('strike'),ruleId:id('rule'),fieldPath:'/text'}]};
  return {id,model,records,bindings};
}

const checks=[],mutations=[];
for(const prefix of ['synthetic-a','synthetic-b']) {
  const {id,model,records,bindings}=fixture(prefix);
  const before={model:structuredClone(model),records:structuredClone(records),bindings:structuredClone(bindings)};
  const output=buildNormalDatasheetBindings(model,records,bindings);
  assert.equal(output.basePlacement,'composition','Normal model-base metadata belongs outside Weapons');
  assert.equal(output.profileSelections.length,1,'One explicit instruction per canonical group');
  assert.equal(output.profileSelections[0].text,bindings.profileSelections[0].text);
  assert.deepEqual(output.profileSelections[0].profileIds,[id('strike'),id('sweep')]);
  assert.equal(output.profileSelections.some(group=>group.profileIds.includes(id('ordinary'))),false,'Do not infer profile groups from profile count or display title');
  assert.equal(output.optionCosts.length,1);
  assert.equal(output.optionCosts[0].costRecordId,id('cost'));
  assert.ok(output.optionCosts[0].valueField,'Numeric cost keeps its exact canonical value binding');
  assert.deepEqual(output.optionCosts[0].valueField.source,{entityId:id('cost'),path:'/value'});
  assert.equal(output.optionCosts[0].valueField.value,7);
  assert.equal(records.get(output.optionCosts[0].costRecordId).value,7,'Do not reconstruct costs from source labels');
  assert.equal(output.boundAbilities.length,1);
  assert.deepEqual(output.boundAbilities[0],{unitId:id('unit'),itemId:id('strike'),ruleId:id('rule'),fieldPath:'/text'});
  for(const kind of ['profileSelections','optionCosts','boundAbilities'])assert.ok(output[kind].every(binding=>binding.unitId===id('unit')),'Same display title must not associate unrelated canonical owners');
  assert.deepEqual(buildNormalDatasheetBindings(model,records,bindings),output,'Rebuild is deterministic');
  assert.deepEqual(model,before.model,'Canonical model was mutated');
  assert.deepEqual(records,before.records,'Canonical MFM values were mutated');
  assert.deepEqual(bindings,before.bindings,'Book-owned declarations were mutated');

  const repeated=structuredClone(bindings);
  for(const key of ['profileSelections','optionCosts','boundAbilities'])repeated[key].push(structuredClone(repeated[key][0]));
  assert.deepEqual(buildNormalDatasheetBindings(model,records,repeated),output,'Repeated canonical presentation sources must not repeat player output');
  const empty=buildNormalDatasheetBindings(model,records);
  assert.equal(empty.profileSelections.length,0,'Multiple canonical profiles alone do not establish a selection instruction');
  assert.equal(empty.boundAbilities.length,0,'Same ability/weapon titles do not establish an item relationship');
  assert.equal(selectsNormalDatasheetBindings({normal:output},null),output);
  assert.equal(selectsNormalDatasheetBindings({normal:output},undefined),output);
  assert.equal(selectsNormalDatasheetBindings({normal:output},'physical-instance-a'),null,'Normal-only presentation must not alter Personal Guide');
  checks.push(prefix+':exact-identity-group-cost-bound-ability-immutable-deterministic-personal-exclusion');
}

// Both already accepted typed storage shapes share one normalized group API.
for(const shape of ['profileGroups','groups']) {
  const {id,model,records}=fixture('synthetic-'+shape);
  model.entities.push({id:id('instruction'),kind:'WEAPON_PROFILE_SELECTION',parentId:id('unit'),data:{text:'Canonical source-backed instruction.',[shape]:[
    shape==='profileGroups'?{profileGroupId:id('group'),profileIds:[id('strike'),id('sweep')]}:{id:id('group'),weaponProfileIds:[id('strike'),id('sweep')]}
  ]},provenance:structuredClone(evidence)});
  const output=buildNormalDatasheetBindings(model,records);
  assert.equal(output.profileSelections.length,1);
  assert.deepEqual(output.profileSelections[0].profileIds,[id('strike'),id('sweep')]);
  assert.equal(output.profileSelections[0].text,'Canonical source-backed instruction.');
  assert.equal(output.profileSelections[0].instructionId,id('instruction'));
  checks.push(shape+':canonical-instruction-normalized-once');
}

const invalidCases=[
  ['missing unit',f=>{f.bindings.profileSelections[0].unitId='missing-unit';}],
  ['missing weapon profile',f=>{f.bindings.profileSelections[0].profileIds[0]='missing-weapon';}],
  ['profile kind',f=>{f.bindings.profileSelections[0].profileIds[0]=f.id('model');}],
  ['cross-owner profile',f=>{f.bindings.profileSelections[0].profileIds[0]=f.id('other-weapon');}],
  ['duplicate profile identity',f=>{f.bindings.profileSelections[0].profileIds[1]=f.id('strike');}],
  ['mixed weapon mode',f=>{f.model.entities.find(entity=>entity.id===f.id('sweep')).data.mode='ranged';}],
  ['instruction evidence severed',f=>{delete f.bindings.profileSelections[0].source;}],
  ['group conflicting instruction',f=>{f.bindings.profileSelections.push({...structuredClone(f.bindings.profileSelections[0]),text:'A conflicting instruction.'});}],
  ['cost missing canonical record',f=>{f.bindings.optionCosts[0].costRecordId='missing-cost';}],
  ['cost wrong record kind',f=>{f.bindings.optionCosts[0].costRecordId=f.id('points');}],
  ['cost cross-owner item',f=>{f.bindings.optionCosts[0].itemId=f.id('other-weapon');}],
  ['cost cross-owner option',f=>{f.bindings.optionCosts[0].optionIds=[f.id('other-option')];}],
  ['cost wrong MFM unit owner',f=>{f.records.get(f.id('cost')).unitReferenceId=f.id('other-unit-reference');}],
  ['cost nonnumeric canonical value',f=>{f.records.get(f.id('cost')).value='7';}],
  ['cost conflicting canonical owner',f=>{
    const alternate={...f.records.get(f.id('cost')),id:f.id('other-cost'),value:12};f.records.set(alternate.id,alternate);
    f.bindings.optionCosts.push({...f.bindings.optionCosts[0],costRecordId:alternate.id});
  }],
  ['ability missing canonical rule',f=>{f.bindings.boundAbilities[0].ruleId='missing-rule';}],
  ['ability cross-owner item',f=>{f.bindings.boundAbilities[0].itemId=f.id('other-weapon');}],
  ['ability cross-owner rule',f=>{f.bindings.boundAbilities[0].ruleId=f.id('other-rule');}],
  ['ability missing source field',f=>{f.bindings.boundAbilities[0].fieldPath='/missing';}],
  ['ability conflicting item owner',f=>{f.bindings.boundAbilities.push({...f.bindings.boundAbilities[0],itemId:f.id('sweep')});}]
];
for(const [name,mutate]of invalidCases) {
  const f=fixture();mutate(f);
  assert.throws(()=>buildNormalDatasheetBindings(f.model,f.records,f.bindings),undefined,name+' must fail closed');
  mutations.push(name);
}
const left=fixture('isolated-left'),right=fixture('isolated-right');
const leftOutput=buildNormalDatasheetBindings(left.model,left.records,left.bindings);
const rightOutput=buildNormalDatasheetBindings(right.model,right.records,right.bindings);
assert.ok(!JSON.stringify(leftOutput).includes('isolated-right'));
assert.ok(!JSON.stringify(rightOutput).includes('isolated-left'));
assert.throws(()=>buildNormalDatasheetBindings(left.model,left.records,right.bindings),'Cross-book registry identities must not resolve through matching labels');
checks.push('cross-book-identity-isolation');
console.log(JSON.stringify({status:'PASS',checks,negativeControls:mutations.length+1,mutations,armyFactualReads:0}));
