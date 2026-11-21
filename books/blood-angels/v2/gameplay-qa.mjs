/** Independent source-authored expectations frozen before the gameplay producer.
 * Constructed physical diagnostics test projections, not army legality, browser
 * acceptance, physical import or actual New Recruit export compatibility. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildBloodAngelsContracts} from './rule-contract-build.mjs';
import {createBloodAngelsRosterRuntime} from './roster-runtime.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {projectInstanceCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {projectAbilityPresentation} from '../../shared/army-book-app-v2/ability-presentation.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {readSpaceMarinesRosterCorrections} from '../../space-marines/v2/roster-source-review.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const own=read('./generated/effective.json'),sm=read('../../space-marines/v2/generated/effective.json');
const sources=new Map([...own.entities,...sm.entities].map(e=>[e.id,e]));
const INTERCESSORS='unit-sm-59162946fee84360',CAPTAIN='unit-ba-09adea2bf319462fb4ed';
const DEFAULT_DET='detachment-sm-6341f5a9b9584677';
// Numeric values, abilities and literal quotes below come from accepted source
// clauses. Production declaration effects are never used to construct EXPECTED.
const scenarios=[
 {rule:'ability-ba-3c7cd126400b4e7cb0fc',quote:'Forlorn Hero: This unit has Scouts 6".',expect:{ability:'core-scouts',range:6}},
 {rule:'ability-ba-40389ffef38645ca922a',quote:'Fury Unbound: This unit’s melee attacks have [LETHAL HITS].',physicalSource:'peer',formation:true,expect:{weaponAbility:'LETHAL HITS',mode:'melee'}},
 {rule:'ability-ba-7cbf2dc160514d6d83d6',quote:'Lost to Fury: This unit’s melee attacks have [SUSTAINED HITS 1].',expect:{weaponAbility:'SUSTAINED HITS 1',mode:'melee'}},
 {rule:'ability-ba-630ec2727ede4d3f85a2',quote:'Blood Chalice: This unit has +1 T.',expect:{stats:{T:1}}},
 {rule:'ability-ba-f103714e8c8e4f6f9352',quote:'Savage Fury: This unit has +1 to charge rolls.',expect:{charge:1}},
 {rule:'ability-ba-da87d6022de8416d9040',quote:'Relic Shield: This model has +1 W.',equipment:true,expect:{stats:{W:1},modelOnly:true}},
 {rule:'enhancement-ba-c3527131d00a41efae68',quote:'This unit has Scouts 6".',unit:CAPTAIN,expect:{ability:'core-scouts',range:6}},
 {rule:'enhancement-ba-c6832a51a86e4ae784ba',quote:'This model’s melee attacks have +2 A.',unit:'unit-ba-014cc7b19aca4d5b84a3',expect:{weaponStats:{attacks:2},mode:'melee',modelOnly:true}}
];
const weapons=u=>[...u.weapons,...u.profiles.flatMap(p=>p.weapons)];
const number=(raw,delta)=>{const m=String(raw).match(/^(-?\d+)(["+]?)$/);assert.ok(m,'Unreviewed numeric source '+raw);return Number(m[1])+delta;};
const traces=(u,rule)=>u.applied.filter(t=>t.ruleId===rule);
const stat=(p,k)=>p.profile.stats?.[k]??p.profile[k];

export function runBloodAngelsGameplayQA(built=buildBloodAngelsContracts()){
 const book=clone(built.book);built={...built,book};
 // A diagnostic policy tests the source-proven Lemartes formation grant. Full
 // attachment-permission activation/import remains outside this stage.
 book.rosterAttachmentPolicies=[...(book.rosterAttachmentPolicies||[]),{sourceId:'unit-ba-3483c88a4df4495ca2e2',targetId:'unit-ba-6903525e7ae0497e943a',role:'LEADER',sourceIds:['relation-ba-c7c8453869a4424992f7'],additionalLeaders:0}];
 const index=new Map(book.entities.map(e=>[e.id,e]));
 const payload=buildGameplayPresentation(built),cards=new Map(payload.cards.map(c=>[c.id,c]));
 const checks=[],mutations=[],results=[];
 const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
 function physical(id,unitId,{enhancement,equipment,double=false}={}){
  const source=index.get(unitId);assert.equal(source?.kind,'DATASHEET');
  const rows=source.data.profileIds.map((profileId,n)=>({rowId:'row-'+n,canonicalProfileId:profileId,quantity:1,compositionScope:'MODEL_ROW',
   selections:source.data.weaponIds.map((w,j)=>({selectionKey:id+'/'+n+'/weapon/'+j,canonicalProfileIds:[w],canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1}))}));
  if(equipment)rows[0].selections.push({selectionKey:id+'/equipment',canonicalProfileIds:[],canonicalEquipmentIds:[equipment],canonicalFieldPaths:{[equipment]:['/text']},physicalQuantity:1,perModelQuantity:1});
  if(double){const next=clone(rows[0]);next.rowId='second-model';next.selections=next.selections.filter(s=>!s.canonicalEquipmentIds.length).map((s,n)=>({...s,selectionKey:id+'/second/'+n}));rows.push(next);}
  return {instanceId:id,canonicalUnitId:unitId,startingStrength:rows.length,modelRows:rows,selections:[],equipmentContextKnown:true,
   enhancementIds:enhancement?[enhancement]:[],enhancementAssignments:enhancement?[{enhancementId:enhancement,modelScopeId:id+'/row-0/PROFILE/row-0'}]:[],warlord:null};
 }
 const roster=(units,det=DEFAULT_DET)=>({schema:'roster-v2/roster',bookId:'blood-angels',rosterId:'independent-source-diagnostic',
  detachmentIds:[det],detachments:[{instanceId:'detachment',canonicalDetachmentId:det}],units,attachments:[],warlordInstanceId:null});
 function fixture(row){
  const source=sources.get(row.rule),unit=row.unit||source.parentId;
  if(row.formation){const state=roster([physical('source','unit-ba-6903525e7ae0497e943a',{double:true}),physical('peer',unit),physical('unrelated',INTERCESSORS)]);
   state.attachments=[{leaderInstanceId:'peer',bodyguardInstanceId:'source',role:'LEADER'}];return state;}
  return roster([physical('source',unit,{enhancement:source.kind==='ENHANCEMENT'?row.rule:null,equipment:row.equipment?row.rule:null,double:true}),
   physical('peer',unit),physical('unrelated',INTERCESSORS)],source.kind==='ENHANCEMENT'?source.parentId:DEFAULT_DET);
 }
 function serviceFor(state,candidate=built){
  candidate={...candidate,book:clone(candidate.book)};
  const reviewed=readSpaceMarinesRosterCorrections({facts:sm}).modelMappings;
  const composition=candidate.book.rosterProfileBindings.map(binding=>{
   const member=candidate.book.entities.find(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===binding.unitId&&
    (e.data.modelProfileId===binding.profileId||reviewed.some(r=>r.memberId===e.id&&r.profileId===binding.profileId)));
   assert.ok(member?.data.quantity);return {...binding,maxModels:member.data.quantity.max};
  });
  // Rebuild the existing disposable feasibility projection after introducing
  // diagnostic policies; the production membership/capacity guards still run.
  candidate.book.compatibilityFeasibility=buildAttachmentFeasibility(candidate.book,composition);
  const service=createBloodAngelsRosterRuntime(candidate);service.load(state);return service;
 }
 function expected(service,state,row){
  const unit=service.projection.units.find(u=>u.instanceId==='source'),base=formRoster(book,state).units.find(u=>u.instanceId==='source'),exp=row.expect;
  for(const model of exp.modelOnly?unit.profiles.slice(0,1):unit.profiles){
   const before=base.profiles.find(p=>p.scopeId===model.scopeId);
   for(const [key,value]of Object.entries(exp.stats||{}))assert.equal(Number.parseFloat(stat(model,key)),number(stat(before,key),value),row.rule+' '+key);
  }
  if(exp.modelOnly)for(const model of unit.profiles.slice(1)){
   const before=base.profiles.find(p=>p.scopeId===model.scopeId);assert.deepEqual(model.profile,before.profile,'Effect escaped exact MODEL bearer');
  }
  if(exp.ability)assert.ok(unit.abilities.some(a=>a.canonicalId===exp.ability&&a.parameters.range===exp.range),'Source-defined Scouts range absent');
  if(exp.charge)assert.equal(unit.metrics.chargeRoll?.modifier,1);
  if(exp.weaponAbility||exp.weaponStats){
   const affected=weapons(unit).filter(w=>w.data.mode===exp.mode&&(!exp.modelOnly||w.scopeId===unit.profiles[0].scopeId));assert.ok(affected.length,'Vacuous weapon EXPECTED');
   for(const weapon of affected){
    const before=weapons(base).find(w=>w.scopeId===weapon.scopeId&&w.selectionKey===weapon.selectionKey&&w.canonicalProfileId===weapon.canonicalProfileId);assert.ok(before);
    if(exp.weaponAbility)assert.ok(weapon.data.abilities.some(a=>a.toUpperCase()===exp.weaponAbility));
    for(const [key,value]of Object.entries(exp.weaponStats||{}))assert.equal(Number.parseFloat(weapon.data[key]),number(before.data[key],value));
   }
   for(const weapon of weapons(unit).filter(w=>w.data.mode!==exp.mode||exp.modelOnly&&w.scopeId!==unit.profiles[0].scopeId)){
    const before=weapons(base).find(w=>w.scopeId===weapon.scopeId&&w.selectionKey===weapon.selectionKey&&w.canonicalProfileId===weapon.canonicalProfileId);
    for(const key of Object.keys(exp.weaponStats||{}))assert.equal(weapon.data[key],before.data[key]);
    if(exp.weaponAbility)assert.equal(weapon.data.abilities.includes(exp.weaponAbility),before.data.abilities.includes(exp.weaponAbility),'Wrong weapon mode changed');
   }
  }
  assert.ok(traces(unit,row.rule).length,'Missing source trace '+row.rule);
  for(const trace of traces(unit,row.rule)){assert.equal(trace.targetInstanceId,'source');assert.equal(trace.sourceInstanceId,row.physicalSource||'source');assert.ok(trace.sourceFields.length);}
  assert.deepEqual(weapons(unit).map(w=>[w.scopeId,w.selectionKey,w.canonicalProfileId,w.physicalQuantity]),weapons(base).map(w=>[w.scopeId,w.selectionKey,w.canonicalProfileId,w.physicalQuantity]));
 }
 for(const row of scenarios){
  const source=sources.get(row.rule);assert.ok(source.data.text.includes(row.quote));
  const state=fixture(row),service=serviceFor(state),unit=service.projection.units[0];
  check(row.rule+'-positive',()=>expected(service,state,row));
  check(row.rule+'-scope-and-repeated-unit',()=>{
   assert.equal(traces(service.projection.units[2],row.rule).length,0);
   if(source.kind==='ENHANCEMENT'||row.equipment)assert.equal(traces(service.projection.units[1],row.rule).length,0);
   else if(!row.formation)assert.ok(traces(service.projection.units[1],row.rule).length);
  });
  check(row.rule+'-snapshot-recompute-reload',()=>{
   const before=clone(service.projection),snapshot=service.snapshot();service.recompute();assert.deepEqual(service.projection,before);
   service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.projection,before);
  });
  check(row.rule+'-effective-guide-values-and-source',()=>{
   const effective=service.effective('source'),variants=projectInstanceCards(cards,state.units[0],effective);assert.ok(variants.get(state.units[0].canonicalUnitId)?.length);
   assert.ok(effective.applied.some(t=>t.ruleId===row.rule));
   for(const model of effective.profiles){const card=variants.get(model.id)?.find(c=>c.scopeId===model.scopeId);assert.ok(card);
    for(const key of Object.keys(row.expect.stats||{})){const value=model.fields.find(f=>f.label===key)?.value??model.fields.find(f=>f.label==='stats')?.value?.[key];
     assert.notEqual(value,undefined,'Calculated MODEL field absent from Effective');
     assert.ok(card.fields.some(f=>f.value===value&&(f.source?.path.endsWith('/'+key)||f.presentationPath==='/'+key)),'Calculated MODEL field absent from Guide');}}
   for(const weapon of effective.weapons){const card=variants.get(weapon.id)?.find(c=>c.scopeId===weapon.scopeId&&c.selectionKey===weapon.selectionKey);assert.ok(card);
    for(const key of Object.keys(row.expect.weaponStats||{}))assert.equal(card.fields.find(f=>f.source?.path==='/'+key)?.value,weapon.fields.find(f=>f.label===key)?.value);}
   if(row.expect.ability){const presentation=projectAbilityPresentation({instanceId:'source',profiles:effective.profiles,unitAbilities:effective.unitAbilities,applied:effective.applied});
    assert.ok(presentation.core.some(a=>a.canonicalId===row.expect.ability&&a.sources.some(t=>t.ruleId===row.rule)),'Granted ability attribution lost');}
   if(row.expect.charge){const metric=variants.get(state.units[0].canonicalUnitId)[0].rosterUnitMetrics.find(m=>m.key==='chargeRoll');assert.equal(metric.displayValue,'+1');assert.ok(metric.sources.some(t=>t.ruleId===row.rule));}
   const guide=projectPersonalBook(payload,service.snapshot());assert.equal(guide.instances.length,3);
  });
  check(row.rule+'-missing-effect-mutation',()=>{
   const altered={...built,book:clone(book)};for(const clause of altered.book.entities.find(e=>e.id===row.rule).ruleContract.clauses){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
   assert.throws(()=>expected(serviceFor(state,altered),state,row));mutations.push(row.rule);
  });
  if(row.equipment||source.kind==='ENHANCEMENT')check(row.rule+'-remove-selection',()=>{
   const next=clone(state);next.units[0].enhancementIds=[];next.units[0].enhancementAssignments=[];
   for(const model of next.units[0].modelRows)model.selections=model.selections.filter(s=>!s.canonicalEquipmentIds.includes(row.rule));
   assert.equal(traces(serviceFor(next).projection.units[0],row.rule).length,0);
  });
  if(source.kind==='ENHANCEMENT')check(row.rule+'-wrong-detachment',()=>{
   const next=clone(state);next.detachmentIds=[DEFAULT_DET];next.detachments=[{instanceId:'different',canonicalDetachmentId:DEFAULT_DET}];
   const before=clone(service.projection);assert.throws(()=>service.load(next),/Unresolved Enhancement context/);
   assert.deepEqual(service.projection,before,'Rejected wrong-Detachment assignment damaged prior snapshot');
  });
  if(row.equipment)check(row.rule+'-unknown-equipment-bearer-not-model-effect',()=>{
   const next=clone(state);next.units[0].selections=next.units[0].modelRows[0].selections.filter(s=>s.canonicalEquipmentIds.length);
   next.units[0].modelRows[0].selections=next.units[0].modelRows[0].selections.filter(s=>!s.canonicalEquipmentIds.length);
   assert.equal(traces(serviceFor(next).projection.units[0],row.rule).length,0);
  });
  results.push({ruleId:row.rule,expected:row.expect,source:source.provenance,status:'PASS',fixture:state,validity:'CONSTRUCTED_SCOPE_DIAGNOSTIC',browserVerified:false});
 }
 check('formed-unit-grant-detach-reattach-isolation',()=>{
  const rule='ability-ba-40389ffef38645ca922a',sourceUnit=sources.get(rule).parentId,bodyguard='unit-ba-6903525e7ae0497e943a';
  const candidate={...built,book:clone(book)};
  candidate.book.rosterAttachmentPolicies=[{sourceId:sourceUnit,targetId:bodyguard,role:'LEADER',sourceIds:['relation-ba-c7c8453869a4424992f7'],additionalLeaders:0}];
  const state=roster([physical('source',sourceUnit),physical('bodyguard',bodyguard),physical('peer',bodyguard)]),service=serviceFor(state,candidate);
  const body=()=>service.projection.units.find(u=>u.instanceId==='bodyguard');
  assert.equal(traces(body(),rule).length,0);service.attach('source','bodyguard');
  assert.ok(traces(body(),rule).length,'UNIT attack grant did not follow attached formation');
  for(const w of weapons(body()).filter(w=>w.data.mode==='melee'))assert.ok(w.data.abilities.some(a=>a.toUpperCase()==='LETHAL HITS'));
  assert.equal(traces(service.projection.units.find(u=>u.instanceId==='peer'),rule).length,0);
  const attached=clone(service.projection);service.recompute();assert.deepEqual(service.projection,attached);
  service.detach('source');assert.equal(traces(body(),rule).length,0);service.reattach('source','bodyguard');assert.deepEqual(service.projection,attached);
 });
 check('enhancement-physical-eligibility-no-forged-chapter',()=>{
  for(const row of scenarios.filter(r=>sources.get(r.rule).kind==='ENHANCEMENT')){
   const entity=index.get(row.rule),role=entity.ruleContract.roles.find(r=>r.id===entity.ruleContract.assignment.ownerRoleId);assert.equal(role.subject,'MODEL');
   const candidate={...built,book:clone(book)},unit=row.unit;
   for(const binding of candidate.book.rosterProfileBindings.filter(b=>b.unitId===unit))binding.intrinsicKeywords=binding.intrinsicKeywords.filter(k=>k!==(row.rule==='enhancement-ba-c6832a51a86e4ae784ba'?'DEATH COMPANY':'ADEPTUS ASTARTES'));
   assert.equal(traces(serviceFor(fixture(row),candidate).projection.units[0],row.rule).length,0);
  }
 });
 check('all-eight-enhancement-selectors-source-positive-negative',()=>{
  const jump='unit-ba-5269d704246f4e3a8d81',dc='unit-ba-014cc7b19aca4d5b84a3';
  const cases=[
   ['enhancement-ba-2e1605fc8a6b4631b096',jump,'JUMP PACK'],['enhancement-ba-3cc1e896eab1460c8748',CAPTAIN,'ADEPTUS ASTARTES'],
   ['enhancement-ba-3f19e1f57dd94fcc92ae',CAPTAIN,'ADEPTUS ASTARTES'],['enhancement-ba-9b2691d5805d46df9b88',dc,'DEATH COMPANY'],
   ['enhancement-ba-c3527131d00a41efae68',CAPTAIN,'ADEPTUS ASTARTES'],['enhancement-ba-c6832a51a86e4ae784ba',dc,'DEATH COMPANY'],
   ['enhancement-ba-e41fcde20bd649ef8d51',CAPTAIN,'ADEPTUS ASTARTES'],['enhancement-ba-e4821c7600234224bb54',jump,'JUMP PACK']
  ];
  for(const [id,unitId,keyword]of cases){
   const source=sources.get(id);assert.ok(source.data.text.includes(keyword+' model only.')||source.data.text.includes('ADEPTUS ASTARTES JUMP PACK model only.'));
   const contract=index.get(id).ruleContract;assert.ok(contract?.assignment);const role=contract.roles.find(r=>r.id===contract.assignment.ownerRoleId);assert.equal(role.subject,'MODEL');
   const state=roster([physical('source',unitId)]),service=serviceFor(state),scope=service.projection.units[0].profiles[0].scopeId,ctx=service.context('source','MODEL',scope);
   assert.equal(built.schema.evaluatePredicate(contract.assignment.selector,ctx),'TRUE',id+' source-eligible MODEL');
   const wrong={...ctx,keywords:new Set(ctx.keywords)};wrong.keywords.delete(keyword);
   assert.equal(built.schema.evaluatePredicate(contract.assignment.selector,wrong),'FALSE',id+' wrong MODEL keywords');
  }
 });
 check('legacy-of-the-angel-strict-literal-eligibility-preserved',()=>{
  const rule=sources.get('detachment-rule-ba-10c56bef78b24440bb5f');assert.ok(rule.data.text.includes('Friendly BLOOD ANGELS CHARACTER units:'));
  const state=roster([physical('generic',INTERCESSORS),physical('captain',CAPTAIN)],rule.parentId),service=serviceFor(state);
  assert.ok(service.projection.units.every(u=>!traces(u,rule.id).length),'Unknown roll/reroll capabilities must remain textual');
  assert.ok(!service.projection.units[0].keywords.includes('BLOOD ANGELS'));
 });
 check('dante-proven-assault-marker-physical-formation-and-replacement-delta',()=>{
  const rule='ability-ba-eb9da07320a4443fb871',dante='unit-ba-92fdb23a526b4c328367',enhancement='enhancement-sm-96a03924178349b9';
  assert.ok(sources.get(rule).data.text.includes('The assault doctrine and tactical doctrine are active for this unit'));
  assert.ok(sources.get(enhancement).data.text.includes('If the assault doctrine is active for this unit, +2 S and AP.'));
  const metadata=book.rosterPermanentDoctrineSources.find(r=>r.ruleId===rule);assert.ok(metadata);
  assert.equal(metadata.unitId,dante);assert.deepEqual(metadata.activeDoctrines,['ASSAULT','TACTICAL']);assert.equal(metadata.evaluatedContext,'ASSAULT_ONLY');
  const candidate={...built,book:clone(book)};
  const guard='unit-ba-5981fb6513b9436487f0';
  // Dante's recipient is source-proven. The deliberately constructed
  // Enhancement on a Guard model tests physical scope, not army legality.
  candidate.book.rosterAttachmentPolicies=[{sourceId:dante,targetId:guard,role:'LEADER',sourceIds:['relation-ba-57ff2bf53e4e457383ff'],additionalLeaders:0}];
  const state=roster([physical('dante',dante),physical('bodyguard',guard,{enhancement}),physical('peer',guard)],sources.get(enhancement).parentId),service=serviceFor(state,candidate);
  const verifyDelta=delta=>{
   const u=service.projection.units.find(u=>u.instanceId==='bodyguard'),base=formRoster(book,service.snapshot()).units.find(u=>u.instanceId==='bodyguard');
   for(const w of weapons(u).filter(w=>w.data.mode==='melee')){const before=weapons(base).find(b=>b.selectionKey===w.selectionKey&&b.scopeId===w.scopeId&&b.canonicalProfileId===w.canonicalProfileId);
    assert.equal(Number.parseFloat(w.data.strength),number(before.data.strength,delta));assert.equal(Number.parseFloat(w.data.ap),number(before.data.ap,-delta));}
  };
  assert.equal(service.context('dante').roster.permanentDoctrineSourcePresent,true);assert.equal(service.context('peer').roster.permanentDoctrineSourcePresent,false);verifyDelta(1);
  service.attach('dante','bodyguard');assert.equal(service.context('bodyguard').roster.permanentDoctrineSourcePresent,true);verifyDelta(2);
  const formed=clone(service.projection);service.recompute();assert.deepEqual(service.projection,formed);service.load(JSON.parse(JSON.stringify(service.snapshot())));assert.deepEqual(service.projection,formed);
  service.detach('dante');assert.equal(service.context('bodyguard').roster.permanentDoctrineSourcePresent,false);verifyDelta(1);
  service.reattach('dante','bodyguard');verifyDelta(2);
 });
 check('native-invulnerable-model-scope',()=>{
  const panels=own.entities.filter(e=>e.kind==='INVULNERABLE_SAVE');assert.equal(panels.length,9);
  const state=roster(own.entities.filter(e=>e.kind==='DATASHEET').map((e,n)=>physical('own-'+n,e.id))),service=serviceFor(state);
  for(const source of panels){const unit=service.projection.units.find(u=>u.canonicalUnitId===source.parentId);
   for(const id of source.data.sourceProfileIds){const model=unit.profiles.find(p=>p.canonicalProfileId===id);assert.ok(model);assert.equal(Number.parseInt(stat(model,'INSV')),4);}}
 });
 check('native-core-ability-presence-and-qualified-values',()=>{
  const review=read('./native-ability-review.json');assert.equal(review.nativeAbilities.length,20);
  const state=roster(own.entities.filter(e=>e.kind==='DATASHEET').map((e,n)=>physical('own-'+n,e.id))),service=serviceFor(state);
  for(const proof of review.nativeAbilities){const source=sources.get(proof.id);assert.equal(source.data.text,proof.quote);assert.equal(source.parentId,proof.ownerId);
   const unit=service.projection.units.find(u=>u.canonicalUnitId===proof.ownerId);assert.ok(unit);
   for(const id of proof.modelProfileIds){const model=unit.profiles.find(p=>p.canonicalProfileId===id);assert.ok(model);
    // The shared V2 FNP primitive predates canonical ability bags and is
    // explicitly {name,value}; its identity is fixed by the reviewed Core ID.
    const ability=model.abilities.find(a=>a.canonicalId===proof.canonicalAbilityId||proof.canonicalAbilityId==='core-feel-no-pain'&&a.name==='Feel No Pain');assert.ok(ability,'Native Core source absent '+proof.id);
    for(const [key,value]of Object.entries(proof.parameters))assert.equal(ability.parameters?.[key]??ability[key],value);}
  }
 });
 check('black-rage-unknown-position-no-phantom-oc-zero',()=>{
  const rage=own.entities.filter(e=>e.kind==='DATASHEET_ABILITY'&&e.data.title==='Black Rage');assert.equal(rage.length,5);
  for(const rule of rage){assert.ok(rule.data.text.includes('or not within 12"'));const state=roster([physical('source',rule.parentId)]),service=serviceFor(state),base=formRoster(book,state).units[0];
   assert.equal(traces(service.projection.units[0],rule.id).length,0);
   assert.deepEqual(service.projection.units[0].profiles.map(p=>stat(p,'OC')),base.profiles.map(p=>stat(p,'OC')));}
 });
 check('eight-source-qualified-policies-visible-without-calculation',()=>{
  const policyCases=own.entities.filter(e=>e.kind==='DATASHEET_ABILITY'&&e.data.title==='Black Rage').map(e=>({id:e.id,
   quote:'This unit’s melee attacks can re-roll hit rolls of 1.',kind:'REROLL',payload:{roll:'HIT',results:'ONES',weaponMode:'melee'}}));
  policyCases.push(
   {id:'ability-ba-44df419581d3449eaff9',quote:'Attacks that target this unit have -1 D.',kind:'INCOMING_MODIFIER',payload:{field:'DAMAGE',mode:'ADD',value:-1}},
   {id:'ability-ba-458e6e2c7c07492ea9ca',quote:'Melee attacks that target this unit have -1 to hit rolls.',kind:'INCOMING_MODIFIER',payload:{field:'HIT_ROLL',mode:'ADD',value:-1,weaponMode:'melee'}},
   {id:'ability-ba-cfcc3c874e5644a8adb5',quote:'Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls.',kind:'INCOMING_MODIFIER',payload:{field:'WOUND_ROLL',mode:'ADD',value:-1,comparison:'ATTACK_STRENGTH_GT_TARGET_TOUGHNESS'}});
  assert.equal(policyCases.length,8);
  for(const p of policyCases){
   const source=sources.get(p.id);assert.ok(source.data.text.includes(p.quote));
   const state=roster([physical('source',source.parentId),physical('peer',source.parentId),physical('unrelated',INTERCESSORS)]),service=serviceFor(state),unit=service.projection.units[0],base=formRoster(book,state).units[0];
   const rows=unit.conditional.filter(r=>r.ruleId===p.id&&r.policy);assert.equal(rows.length,1);const row=rows[0];
   assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert.equal(row.state,'UNKNOWN');assert.equal(row.policy.kind,p.kind);assert.deepEqual(row.policy.payload,p.payload);
   assert.equal(row.sourceInstanceId,'source');assert.deepEqual(row.recipientInstanceIds,['source']);assert.deepEqual(row.sourceProvenance,source.provenance);
   assert.equal(traces(unit,p.id).length,0,'Display policy mutated a calculated value');assert.deepEqual(unit.profiles.map(m=>m.profile),base.profiles.map(m=>m.profile));
   assert.ok(service.projection.units[2].conditional.every(r=>r.ruleId!==p.id));
   assert.ok(service.projection.units[1].conditional.filter(r=>r.ruleId===p.id&&r.policy).every(r=>r.sourceInstanceId==='peer'&&r.recipientInstanceIds.includes('peer')));
   const effective=service.effective('source'),display=effective.conditional.find(r=>r.ruleId===p.id&&r.policy);assert.ok(display?.sourceLabel.includes('source'));
   const variants=projectInstanceCards(cards,state.units[0],effective),root=variants.get(source.parentId)[0];
   assert.ok(root.rosterConditionalPolicies.some(r=>r.ruleId===p.id&&r.execution==='CONDITIONAL_TEXT_ONLY'&&r.state==='UNKNOWN'));
   const snapshot=service.snapshot(),before=clone(service.projection);service.recompute();assert.deepEqual(service.projection,before);service.load(snapshot);assert.deepEqual(service.projection,before);
  }
 });
 check('unknown-psychic-and-combat-event-not-executed',()=>{
  const unresolved=own.entities.filter(e=>e.kind==='DATASHEET_ABILITY'&&(e.data.supplemental||e.data.title.startsWith('Finest Hour')||e.data.title==='Mass of Doom'));
  assert.equal(unresolved.length,4);
  for(const rule of unresolved){const service=serviceFor(roster([physical('source',rule.parentId)]));assert.equal(traces(service.projection.units[0],rule.id).length,0);}
 });
 check('all-native-members-and-inherited-references',()=>{
  const ledger=read('./inherited-sm-references.json');assert.equal(ledger.references.length,180);
  assert.equal(book.entities.filter(e=>e.kind==='DATASHEET').length,81);
  for(const r of ledger.references){const e=index.get(r.canonicalId);assert.equal(e.bookId,'space-marines');assert.equal(e.sourceEntityId,r.sourceEntityId);assert.deepEqual(e.provenance,r.provenance);}
  assert.equal(book.entities.filter(e=>e.kind==='PROFILE').length,106);assert.equal(book.entities.filter(e=>e.kind==='WEAPON_PROFILE').length,400);
  for(const row of own.entities)assert.deepEqual(index.get(row.id)?.provenance,row.provenance);
 });
 check('complete-native-rule-text-and-cp-when-target-effect-parity',()=>{
  const nativeCards=new Map(built.native.payload.cards.map(c=>[c.id,c]));
  const owners=own.entities.filter(e=>['DATASHEET_ABILITY','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(e.kind));
  assert.equal(owners.length,31+3+8+12);
  for(const source of owners){const before=nativeCards.get(source.id),after=cards.get(source.id);assert.ok(before&&after);
   for(const field of before.fields){const current=after.fields.find(f=>f.id===field.id);assert.ok(current,'Dropped native rule field '+field.id);assert.deepEqual(current.value,field.value,'Changed source rule text/conditions '+field.id);}
   assert.deepEqual(after.provenance,source.provenance);
  }
  const canonical=built.native.canonicalEntities;
  for(const [kind,count]of [['DATASHEET',81],['ARMY_RULE',3],['DETACHMENT',18],['STRATAGEM',60]])assert.equal(canonical.filter(e=>e.kind===kind).length,count);
  assert.equal(canonical.filter(e=>e.kind==='ENHANCEMENT'&&e.data.itemKind!=='UNIT_UPGRADE').length,32);
  assert.equal(canonical.filter(e=>e.kind==='ENHANCEMENT'&&e.data.itemKind==='UNIT_UPGRADE').length,8);
 });
 check('shield-physical-quantity-loadout-and-field-controls',()=>{
  const rule='ability-ba-da87d6022de8416d9040',unitId=sources.get(rule).parentId;
  const state=roster([physical('source',unitId,{equipment:rule})]),row=state.units[0].modelRows[0],shield=row.selections.find(s=>s.canonicalEquipmentIds.includes(rule));
  row.quantity=2;state.units[0].startingStrength=2;
  for(const selected of row.selections.filter(s=>s.canonicalProfileIds.length))selected.physicalQuantity=2;
  const baseline=Number.parseInt(sources.get(row.canonicalProfileId).data.stats.W);
  const partial=serviceFor(state);assert.equal(traces(partial.projection.units[0],rule).length,0);assert.equal(Number.parseInt(stat(partial.projection.units[0].profiles[0],'W')),baseline);
  const uniform=clone(state);uniform.units[0].modelRows[0].selections.find(s=>s.canonicalEquipmentIds.includes(rule)).physicalQuantity=2;
  const all=serviceFor(uniform);assert.equal(Number.parseInt(stat(all.projection.units[0].profiles[0],'W')),baseline+1);assert.equal(all.projection.units[0].profiles[0].quantity,2);
  const split=clone(state),splitRow=split.units[0].modelRows[0];splitRow.selections=splitRow.selections.filter(s=>!s.canonicalEquipmentIds.includes(rule));
  splitRow.loadouts=[{loadoutId:'shielded',quantity:1,selections:[clone(shield)]},{loadoutId:'bare',quantity:1,selections:[]}];
  const divided=serviceFor(split),profiles=divided.projection.units[0].profiles;assert.equal(profiles.length,2);
  assert.equal(Number.parseInt(stat(profiles.find(p=>p.scopeId.endsWith('/LOADOUT/shielded')),'W')),baseline+1);
  assert.equal(Number.parseInt(stat(profiles.find(p=>p.scopeId.endsWith('/LOADOUT/bare')),'W')),baseline);
  const wrong=clone(uniform);wrong.units[0].modelRows[0].selections.find(s=>s.canonicalEquipmentIds.includes(rule)).canonicalFieldPaths[rule]=['/title'];
  assert.equal(traces(serviceFor(wrong).projection.units[0],rule).length,0);
 });
 check('no-da-keywords-or-inferred-ba-chapter',()=>{
  const state=roster([physical('source',INTERCESSORS)]),service=serviceFor(state),unit=service.projection.units[0];
  for(const k of ['BLOOD ANGELS','DEATHWING','RAVENWING','DOOMED','GRACE'])assert.ok(!unit.keywords.includes(k));
  const jump=index.get('unit-ba-5269d704246f4e3a8d81');assert.ok(!jump.data.keywords.includes('IMPERIUM'));
 });
 check('invalid-load-preserves-runtime-state',()=>{
  const state=fixture(scenarios[0]),service=serviceFor(state),before=clone(service.projection),snapshot=service.snapshot(),bad=clone(snapshot);
  bad.units[0].modelRows[0].canonicalProfileId='fabricated-profile';assert.throws(()=>service.load(bad));assert.deepEqual(service.snapshot(),snapshot);assert.deepEqual(service.projection,before);
 });
 return {status:'PASS',checks,scenarios:results,negativeMutationControls:mutations,counts:{sourceAuthoredScenarios:scenarios.length,checks:checks.length,nativeInSv:9,datasheets:81,inheritedReferences:180},
  limitations:{browserVerified:false,realNewRecruitExportTested:false,fixtures:'CONSTRUCTED_PHYSICAL_DIAGNOSTICS',chapterGrants:0,sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN'}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const result=runBloodAngelsGameplayQA();console.log(JSON.stringify(result,null,2));}
