/** Stage 4: independent input-quantity oracle over the existing shared importer.
 * Factual identities/source text are read from accepted foundation; expected
 * physical quantities come from fixture INPUT, never production import bindings.
 * No frontend acceptance, legality assessment or battle simulation is claimed.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {buildTauImportBook} from './roster-import-build.mjs';
import {createTauRosterImport,createTauRosterRuntime} from './roster-import.mjs';
import {setTauStudentChoice,bindTauStudentPairs,tauSourceChoiceContext,bindTauShieldModels} from './roster-source-choices.mjs';
import {setTauPrototypeChoice,bindTauPrototypeChoices,tauWeaponSelectionResolver,tauPrototypeDecisions} from './roster-weapon-choices.mjs';
import {createTauRuleSchema} from './rule-contract-build.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {formRoster,selections,predicateContext} from '../../shared/roster-v2/context.mjs';

const clone=structuredClone,read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),index=new Map(facts.entities.map(e=>[e.id,e]));
const units=facts.entities.filter(e=>e.kind==='DATASHEET'),detachments=facts.entities.filter(e=>e.kind==='DETACHMENT');
const enhancements=facts.entities.filter(e=>e.kind==='ENHANCEMENT');
const members=id=>facts.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===id);
const header=names=>'+ FACTION KEYWORD: T’au Empire\n'+(names||["Mont'ka"]).map(name=>'+ DETACHMENT: '+name+'\n').join('');
const records={schema:'tau-empire-v2-physical-import-qa/v1',expectedAuthority:'ACCEPTED_FACTS_AND_CONSTRUCTED_INPUT_NOT_PRODUCTION_BINDINGS',
 checks:[],negativeControls:[],mutations:[],runtimeCases:[],fixtures:[],limitations:[],REAL_NEW_RECRUIT_EXPORT_TESTED:'NO',frontendVerified:false};
let checks=0;
function test(id,fn){
 try{fn();records.checks.push({id,status:'PASS'});}catch(error){
  records.checks.push({id,status:'FAIL',message:error.message,stack:error.stack});
  console.error(id+': '+error.stack);
 }checks++;
}
function negative(id,fn){fn();records.negativeControls.push({id,status:'PASS'});}
function mutation(id,fn){fn();records.mutations.push({id,status:'DETECTED'});}
const book=buildTauImportBook(),original=clone(book),make=()=>createTauRosterImport(book);
function ready(text,bindings={},service=make()){
 const result=service.import(text,bindings);
 assert.equal(result.status,'READY',JSON.stringify({needs:result.needsBindings,errors:result.errors}));return result;
}
function fixture(id,{quantityOffset=0,weapons=false,variant=0,equipment='',enhancement='',includeOptional=false}={}){
 const unit=index.get(id),rows=members(id).filter(m=>includeOptional||m.data.quantity.min>0).map((member,i)=>{
  const quantity=Math.max(1,member.data.quantity.min)+(i===0?quantityOffset:0);
  const profile=unit.data.weaponIds[(i+variant)%Math.max(unit.data.weaponIds.length,1)];
  const weapon=weapons&&profile?{id:profile,name:index.get(profile).data.name,perModelQuantity:1+(variant%2)}:null;
  return {memberId:member.id,profileId:member.data.modelProfileId,name:member.data.name,quantity,weapon};
 });
 const total=rows.reduce((n,r)=>n+r.quantity,0);
 const text=`${total}x ${unit.data.title} (100 pts)${equipment?': '+equipment:''}\n`+
  rows.map(row=>`• ${row.quantity}x ${row.name}${row.weapon?`: ${row.weapon.perModelQuantity}x ${row.weapon.name}`:''}\n`).join('')+
  (enhancement?'Enhancement: '+enhancement+'\n':'');
 return {text,expected:{id,models:total,rows,equipment}};
}
function assertPhysical(actual,expected){
 assert.equal(actual.canonicalUnitId,expected.id,'Canonical physical UNIT identity');
 assert.equal(actual.startingStrength,expected.models,'Input model count');
 assert.deepEqual(actual.modelRows.map(r=>[r.compositionMemberId,r.canonicalProfileId,r.quantity]),
  expected.rows.map(r=>[r.memberId,r.profileId,r.quantity]),'Exact composition instances/counts');
 for(const [i,row]of expected.rows.entries()){
  const actualRow=actual.modelRows[i],gear=[...actualRow.selections,...(actualRow.loadouts||[]).flatMap(l=>l.selections)];
  if(row.weapon){
   assert.equal(gear.length,1,'No extra default weapon after explicit replacement');
   assert.deepEqual(gear[0].canonicalProfileIds,[row.weapon.id],'Exact input physical weapon');
   assert.equal(gear[0].physicalQuantity,row.quantity*row.weapon.perModelQuantity,'Exact selected weapon quantity');
  }else assert.equal(gear.length,0,'Missing export loadout never becomes assumed default weapons');
 }
}
function runtime(state){const service=createTauRosterRuntime(book);service.load(state);return service;}

test('facts-and-source-ownership',()=>{
 assert.equal(units.length,43);assert.equal(detachments.length,7);assert.equal(enhancements.length,23);
 for(const fact of facts.entities){
  const actual=book.entities.find(e=>e.id===fact.id);assert.ok(actual,fact.id);
  if(fact.kind==='DATASHEET'){
   const copy=clone(actual.data);assert.deepEqual(copy.weaponIds.slice(0,fact.data.weaponIds.length),fact.data.weaponIds,'Original weapon identity order retained');
   const sourceOptions=facts.entities.filter(e=>e.kind==='WARGEAR_OPTION'&&e.parentId===fact.id).map(e=>e.data.text).join('\n').toLowerCase();
   const extra=copy.weaponIds.slice(fact.data.weaponIds.length);
   for(const id of extra){assert.ok(['drone-gun-drone:weapon:1','drone-missile-drone:weapon:1'].includes(id),'Only accepted generic drone weapon references may extend disposable import view');
    assert.ok(sourceOptions.includes(id==='drone-gun-drone:weapon:1'?'gun drone':'missile drone'),'Source-backed equipment occurrence required for common weapon reference');}
   copy.weaponIds=clone(fact.data.weaponIds);assert.deepEqual(copy,fact.data,'No copied/reparented/mutated canonical facts');
  }else assert.deepEqual(actual.data,fact.data,'Importer does not change canonical data');
  assert.deepEqual(actual.provenance,fact.provenance,'Source provenance retained');assert.equal(actual.parentId,fact.parentId);
 }
 const root=new URL('../../../',import.meta.url),seen=new Set();
 for(const fact of units){
  const proof=fact.provenance;if(seen.has(proof.document))continue;seen.add(proof.document);
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL(proof.document,root))).digest('hex').toUpperCase(),proof.sha256,'Accepted raw source fingerprint');
 }
});

test('all-43-datasheets-physical-input-parity',()=>{
 const cases=units.map(unit=>fixture(unit.id)),text=header()+cases.map(c=>c.text).join('\n'),service=make(),state=ready(text,{},service).roster;
 assert.equal(state.units.length,43);assert.equal(new Set(state.units.map(u=>u.instanceId)).size,43);
 state.units.forEach((unit,i)=>assertPhysical(unit,cases[i].expected));
 assert.deepEqual(make().load(service.snapshot()),state,'Snapshot/load');
 assert.deepEqual(ready(text).roster,state,'Reimport deterministic physical identity');
 records.fixtures.push({id:'all43',text,expected:cases.map(c=>c.expected)});
});

test('all56-source-composition-declarations-including-optional-models',()=>{
 const cases=units.map(unit=>fixture(unit.id,{includeOptional:true})),text=header()+cases.map(c=>c.text).join('\n');
 const state=ready(text).roster;state.units.forEach((unit,i)=>assertPhysical(unit,cases[i].expected));
 assert.equal(state.units.reduce((n,u)=>n+u.modelRows.length,0),56);records.compositionDeclarations=56;
 records.fixtures.push({id:'all56-composition-declarations',text,expected:cases.map(c=>c.expected)});
});

test('all-detachments-without-collapsing-physical-instances',()=>{
 const text=header(detachments.map(d=>d.data.title))+fixture('unit-devilfish').text;
 const state=ready(text).roster;assert.deepEqual([...state.detachmentIds].sort(),detachments.map(d=>d.id).sort());
 assert.equal(state.detachments.length,7);assert.deepEqual(make().load(state),state);
});

test('same-datasheet-different-input-quantities-loadouts',()=>{
 for(const id of ['unit-strike-team','unit-crisis-starscythe-battlesuits','unit-hammerhead-gunship']){
  const first=fixture(id,{weapons:true}),second=fixture(id,{weapons:true,variant:1});
  const text=header()+first.text+second.text,service=make(),state=ready(text,{},service).roster;
  assertPhysical(state.units[0],first.expected);assertPhysical(state.units[1],second.expected);
  assert.notEqual(state.units[0].instanceId,state.units[1].instanceId);
  const derived=runtime(state).projection;
  for(const [i,u]of derived.units.entries()){
   const selected=selections(state.units[i]).flatMap(s=>s.canonicalProfileIds);
   const profiles=[...u.weapons,...u.profiles.flatMap(p=>p.weapons)];
   assert.deepEqual([...new Set(profiles.map(w=>w.canonicalProfileId))].sort(),[...new Set(selected)].sort(),'Effective includes only selected weapon facts');
  }
  assert.deepEqual(make().load(service.snapshot()),state);
  records.fixtures.push({id:'repeated-'+id,text,expected:[first.expected,second.expected]});
 }
});

test('repeated-datasheets-different-physical-model-counts',()=>{
 const first=fixture('unit-broadside-battlesuits',{weapons:true}),second=fixture('unit-broadside-battlesuits',{weapons:true,includeOptional:true,variant:1});
 const text=header()+first.text+second.text,state=ready(text).roster;
 assertPhysical(state.units[0],first.expected);assertPhysical(state.units[1],second.expected);
 assert.deepEqual(state.units.map(u=>u.startingStrength),[1,2]);
 assert.notEqual(state.units[0].instanceId,state.units[1].instanceId);
 assert.deepEqual(make().load(state),state);
 records.fixtures.push({id:'same-datasheet-model-counts',text,expected:[first.expected,second.expected]});
});

const gearOnFirstModel=(id,label,quantity=1)=>{
 const base=fixture(id),first=base.expected.rows[0];
 return base.text.replace(`• ${first.quantity}x ${first.name}\n`,`• ${first.quantity}x ${first.name}: ${quantity}x ${label}\n`);
};
const projectedWeapons=unit=>[...unit.weapons,...unit.profiles.flatMap(profile=>profile.weapons)];
test('drone-inventory-known-and-unknown-physical-bearers',()=>{
 const unitId='unit-crisis-fireknife-battlesuits',base=fixture(unitId);
 const aggregate=header()+fixture(unitId,{equipment:'2x Shield Drone, 1x Marker Drone'}).text+base.text;
 const service=make(),state=ready(aggregate,{},service).roster,derived=runtime(state).projection;
 assert.equal(state.units[0].modelRows.reduce((n,row)=>n+row.quantity,0),3,'Drone tokens are not MODEL rows');
 assert.equal(state.units[0].selections.filter(s=>s.physicalQuantity===2).length,1,'Known UNIT equipment count retained once');
 assert.ok(state.units[0].modelRows.every(row=>row.selections.length===0),'Unknown bearer is not invented');
 const baseline=Number(index.get('datasheet-crisis-fireknife-battlesuits:profile:1').data.stats.W);
 assert.ok(derived.units[0].profiles.every(p=>Number(p.profile.stats.W)===baseline),'Unknown MODEL recipient gets no invented Shield W');
 const markerPresent=derived.units[0].keywords.includes('MARKERLIGHT');
 assert.ok(markerPresent,'Accepted Marker Drone gives its known physical UNIT MARKERLIGHT');
 records.runtimeCases.push({id:'marker-drone-unit-grant',source:'drone-marker-drone',expected:'MARKERLIGHT only selected physical UNIT',
  actual:markerPresent?'MARKERLIGHT':'NO_GRANT',status:markerPresent?'PASS':'FAIL'});
 assert.ok(!derived.units[1].keywords.includes('MARKERLIGHT'),'Marker Drone never leaks to independent duplicate');
 assert.deepEqual(make().load(service.snapshot()),state);
 const known=header()+gearOnFirstModel(unitId,'Shield Drone',2)+base.text;
 const knownState=ready(known).roster,knownDerived=runtime(knownState).projection;
 assert.equal(knownState.units[0].modelRows[0].selections[0].physicalQuantity,2);
 const actualW=Number(knownDerived.units[0].profiles[0].profile.stats.W);
 assert.equal(actualW,baseline+2,'Two known Shield Drones increase only their confirmed MODEL scope by two');
 records.runtimeCases.push({id:'shield-drone-selected-physical-model-wounds',source:'drone-shield-drone',expected:baseline+2,actual:actualW,
  status:actualW===baseline+2?'PASS':'FAIL'});
 assert.ok(knownDerived.units[0].profiles.slice(1).every(p=>Number(p.profile.stats.W)===baseline),'Bodyguard peers keep ordinary W');
 assert.ok(knownDerived.units[1].profiles.every(p=>Number(p.profile.stats.W)===baseline),'Independent instance W unchanged');
 assert.deepEqual(runtime(knownState).projection,knownDerived,'Recompute never stacks Shield W');
 records.fixtures.push({id:'unknown-drone-bearer',text:aggregate,expected:[base.expected,base.expected]});
});

const markerId='drone-marker-drone';
const markerOccurrences=units.flatMap(unit=>facts.entities.filter(entity=>entity.kind==='WARGEAR_OPTION'&&entity.parentId===unit.id&&
 entity.data.text.toLowerCase().includes('marker drone')).map(option=>({unitId:unit.id,optionId:option.id})));
const markerGrants=unit=>unit.applied.filter(row=>row.operation==='GRANT_UNIT_KEYWORD'&&row.after.includes('MARKERLIGHT'));
function assertMarkerOnly(projection,expectedId,baseline){
 for(const unit of projection.units){
  const expected=unit.instanceId===expectedId||baseline.units.find(previous=>previous.instanceId===unit.instanceId).keywords.includes('MARKERLIGHT');
  assert.equal(unit.keywords.includes('MARKERLIGHT'),expected,'Physical Marker UNIT isolation: '+unit.instanceId);
  for(const row of markerGrants(unit)){
   assert.equal(unit.instanceId,expectedId,'No foreign Marker grant');assert.equal(row.sourceInstanceId,expectedId);assert.equal(row.targetInstanceId,expectedId);
   assert.ok(row.sourceFields.length,'Source field provenance retained');
  }
 }
}
test('stage4b-all-source-backed-marker-occurrences-known-unknown-bearers',()=>{
 const source=index.get(markerId);assert.ok(source.data.text.includes('MARKERLIGHT'),'Expected keyword comes from accepted drone fact');
 assert.equal(markerOccurrences.length,12,'Independent accepted Datasheet options define Marker coverage');
 const coverage=[];
 for(const occurrence of markerOccurrences){
  const local=book.entities.find(entity=>entity.id===occurrence.optionId);
  const contract=local.ruleContract,effect=contract.clauses.find(clause=>clause.id==='marker-drone-physical-unit').rosterEffects[0];
  const expectedReferences=[markerId,...(index.get(occurrence.optionId).data.text.toLowerCase().includes('shield drone')?['drone-shield-drone']:[])];
  assert.deepEqual(contract.canonicalRuleReferences,expectedReferences,'Each equipment rule retains its one original generic factual owner');
  assert.deepEqual(effect.provenance.sourceEvidence,source.provenance,'Every occurrence retains generic source provenance');
  assert.equal(effect.provenance.physicalEquipmentReference.entityId,occurrence.optionId,'Every occurrence retains its physical source option identity');
  assert.deepEqual(effect.provenance.physicalEquipmentReference.provenance,local.provenance,'Every occurrence retains local source provenance');
  const id=occurrence.unitId,plain=header()+fixture(id).text+fixture(id).text;
  const baseline=runtime(ready(plain).roster).projection;
  for(const known of [false,true]){
   const equipped=known?gearOnFirstModel(id,'Marker Drone',1):fixture(id,{equipment:'1x Marker Drone'}).text;
   const text=header()+equipped+fixture(id).text,service=make(),state=ready(text,{},service).roster,run=runtime(state);
   const inventory=selections(state.units[0]).filter(selection=>selection.sourceEquipmentIdentity===markerId);
   assert.equal(inventory.length,1);assert.equal(inventory[0].physicalQuantity,1);
   assert.deepEqual(inventory[0].sourceEquipmentProvenance,source.provenance,'One generic source provenance');
   assert.ok(inventory[0].canonicalEquipmentIds.includes(occurrence.optionId),'Physical equipment uses correct local source occurrence');
   if(!known)assert.ok(state.units[0].modelRows.every(row=>row.selections.length===0),'Unknown bearer remains unknown');
   assertMarkerOnly(run.projection,state.units[0].instanceId,baseline);
   if(!known){
    // Diagnostic copy only: native MARKERLIGHT otherwise masks a missing
    // selected-equipment grant on four source owners. Actual source facts and
    // real projections above remain untouched and are not replaced by this.
    const probe=clone(book),owner=probe.entities.find(entity=>entity.id===id);
    owner.data.keywords=owner.data.keywords.filter(keyword=>keyword!=='MARKERLIGHT');
    for(const profile of probe.rosterProfileBindings.filter(binding=>binding.unitId===id))
     profile.intrinsicKeywords=profile.intrinsicKeywords.filter(keyword=>keyword!=='MARKERLIGHT');
    const diagnostic=createRosterRuntime(probe,createTauRuleSchema({bindContext:tauSourceChoiceContext(probe,state)}));diagnostic.load(state);
    assert.deepEqual(diagnostic.projection.units.map(unit=>unit.keywords.includes('MARKERLIGHT')),[true,false],
     'Every accepted local Marker binding executes, independently of pre-existing native keyword');
   }
   const saved=run.snapshot(),effective=clone(run.projection);
   assert.deepEqual(runtime(saved).projection,effective,'Marker projection survives snapshot/load');
   assert.deepEqual(ready(text,{},service).roster,state,'Marker reimport does not duplicate inventory');
   run.load(saved);assert.deepEqual(run.projection,effective,'Marker recompute idempotent');
   run.load(ready(plain,{},service).roster);
   assert.deepEqual(run.projection.units.map(u=>u.keywords),baseline.units.map(u=>u.keywords),'Removing equipment restores baseline keyword bags');
   run.load(ready(text,{},service).roster);assertMarkerOnly(run.projection,state.units[0].instanceId,baseline);
   coverage.push({...occurrence,bearer:known?'KNOWN_MODEL':'UNKNOWN_MODEL',status:'PASS',nativeMarkerlight:baseline.units[0].keywords.includes('MARKERLIGHT')});
  }
 }
 records.markerSourceCoverage=coverage;
});
test('stage4b-marker-shared-option-types-and-formed-physical-scope',()=>{
 const id='unit-commander-in-coldstar-battlesuit',base=fixture(id);
 for(const other of ['Shield Drone','Gun Drone']){
  const text=header()+fixture(id,{equipment:'1x Marker Drone'}).text+fixture(id,{equipment:'1x '+other}).text+base.text;
  const state=ready(text).roster,projection=runtime(state).projection;
  assert.deepEqual(projection.units.map(unit=>unit.keywords.includes('MARKERLIGHT')),[true,false,false],'Only exact generic identity grants keyword despite shared local option');
  assert.deepEqual(state.units.slice(0,2).map(unit=>unit.selections[0].canonicalEquipmentIds),[state.units[0].selections[0].canonicalEquipmentIds,state.units[0].selections[0].canonicalEquipmentIds],'Control items actually share local option identity');
  assert.equal(markerGrants(projection.units[0]).length,1,'One grant only');
 }
 const text=header()+fixture(id,{equipment:'1x Marker Drone'}).text+fixture('unit-crisis-fireknife-battlesuits').text+base.text;
 const state=ready(text).roster,run=runtime(state);run.attach('parsed-unit-1','parsed-unit-2');
 assert.deepEqual(run.projection.units.map(unit=>unit.keywords.includes('MARKERLIGHT')),[true,false,false],'Formed UNIT must not overwrite physical keyword recipients');
 const group=run.projection.formedUnits.find(group=>group.memberInstanceIds.includes('parsed-unit-1'));
 assert.ok(group.keywords.includes('MARKERLIGHT'),'Formed keyword union reflects its confirmed member');
 assert.ok(run.projection.units.flatMap(unit=>unit.profiles).every(profile=>!profile.keywords.includes('MARKERLIGHT')),'UNIT keyword does not become every MODEL keyword');
 const attached=clone(run.projection);run.detach('parsed-unit-1');run.reattach('parsed-unit-1','parsed-unit-2');
 assert.deepEqual(run.projection,attached,'Attach/detach preserves physical source and recompute');
});

const shieldId='drone-shield-drone';
const shieldRows=units.flatMap(unit=>facts.entities.filter(entity=>entity.kind==='WARGEAR_OPTION'&&entity.parentId===unit.id&&
 entity.data.text.toLowerCase().includes('shield drone')).map(option=>({unitId:unit.id,optionId:option.id})));
const shieldW=projection=>projection.units.map(unit=>unit.profiles.map(model=>Number(model.profile.stats.W)));
const shieldCount=unit=>selections(unit).filter(selection=>selection.sourceEquipmentIdentity===shieldId).reduce((n,row)=>n+row.physicalQuantity,0);
const broadsideInput=(counts,aggregate=0)=>counts.length+'x Broadside Battlesuits (100 pts)'+(aggregate?': '+aggregate+'x Shield Drone':'')+'\n'+
 counts.map((count,i)=>'• 1x Broadside '+(i===0?'Shas’vre':'Shas’ui')+(count?': '+count+'x Shield Drone':'')+'\n').join('');
test('stage4d-shield-all-source-occurrences-known-unknown-bearers',()=>{
 const oracle=read('./rule-contract-expectations.json').cases.find(row=>row.id==='shield-drone'),root=index.get(shieldId);
 assert.equal(oracle.expectedOperations[0].value,1);assert.equal(oracle.recipient,'ONE_CONFIRMED_BEARER_MODEL');
 const raw=fs.readFileSync(new URL('../../../'+oracle.source.document,import.meta.url));
 assert.equal(createHash('sha256').update(raw).digest('hex').toUpperCase(),oracle.source.sha256);
 assert.equal(createHash('sha256').update(oracle.source.quote).digest('hex').toUpperCase(),oracle.source.quoteSha256);
 const visible=raw.toString('utf8').replace(/<[^>]*>/g,'').replace(/&rsquo;|&#8217;|&#x2019;/g,'’').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,'');
 assert.ok(visible.includes(oracle.source.quote.replace(/\s+/g,'')),'Independent accepted raw Shield +1 W quote');
 assert.equal(shieldRows.length,11,'Accepted source options define Shield occurrence coverage');
 records.shieldSourceCoverage=[];
 for(const occurrence of shieldRows)for(const known of [false,true]){
  const text=header()+(known?gearOnFirstModel(occurrence.unitId,'Shield Drone',2):fixture(occurrence.unitId,{equipment:'2x Shield Drone'}).text)+fixture(occurrence.unitId).text;
  const state=ready(text).roster,base=formRoster(book,state),run=runtime(state),expected=shieldW(base);
  if(known)expected[0][0]+=2;
  assert.deepEqual(shieldW(run.projection),expected,'Only confirmed first MODEL receives source +1 W per Drone');
  assert.equal(shieldCount(state.units[0]),2);assert.equal(shieldCount(state.units[1]),0);
  const local=book.entities.find(entity=>entity.id===occurrence.optionId);
  assert.equal(local.ruleContract.canonicalRuleReferences.filter(id=>id===shieldId).length,1);
  for(const selection of selections(state.units[0]).filter(row=>row.sourceEquipmentIdentity===shieldId))
   assert.deepEqual(selection.sourceEquipmentProvenance,root.provenance);
  if(!known)assert.ok(state.units[0].modelRows.every(model=>model.selections.length===0),'Unknown bearer is never invented');
  const bound=bindTauShieldModels(book,state),effects=bound.entities.flatMap(entity=>entity.ruleContract?.clauses||[])
   .flatMap(clause=>clause.rosterEffects).filter(effect=>effect.provenance?.canonicalRuleId===shieldId);
  assert.equal(effects.length,known?1:0);
  if(known){const effect=effects[0];assert.deepEqual(effect.provenance.sourceEvidence,root.provenance);
   assert.equal(effect.value,2);assert.equal(effect.targetBinding,'SOURCE_UNIT_MODELS');
   assert.equal(effect.provenance.physicalEquipmentReference.entityId,occurrence.optionId);}
  assert.deepEqual(runtime(JSON.parse(JSON.stringify(run.snapshot()))).projection,run.projection,'Shield scope and quantity persist');
  records.shieldSourceCoverage.push({...occurrence,bearer:known?'KNOWN_MODEL':'UNKNOWN_MODEL',quantity:2,status:'PASS'});
 }
});

test('stage4d-shield-physical-quantities-scopes-attachments-and-recompute',()=>{
 const text=header()+broadsideInput([2,1,0])+broadsideInput([0,2,1])+broadsideInput([0,0,0],4);
 const service=make(),state=ready(text,{},service).roster,run=runtime(state);
 assert.equal(Number(index.get('datasheet-broadside-battlesuits:profile:1').data.stats.W),8,'Independent source profile base W');
 assert.deepEqual(shieldW(run.projection),[[10,9,8],[8,10,9],[8,8,8]],'INPUT per-MODEL counts; UNIT-level aggregate not allocated');
 assert.deepEqual(state.units.map(shieldCount),[3,3,4]);
 const models=run.projection.units[0].profiles;
 assert.equal(new Set(models.map(model=>model.canonicalProfileId)).size,1);assert.equal(new Set(models.map(model=>model.scopeId)).size,3);
 const contexts=models.map(model=>run.context('parsed-unit-1','MODEL',model.scopeId));
 assert.equal(new Set(contexts.map(context=>context.modelId)).size,1);assert.equal(new Set(contexts.map(context=>context.modelScopeId)).size,3);
 assert.deepEqual(contexts.map(context=>context.modelInstanceId),models.map(model=>model.modelInstanceId));
 const same=runtime(ready(header()+broadsideInput([2,2])).roster);
 assert.deepEqual(shieldW(same.projection),[[10,10]],'Four total Drones give +2 each, never +4 each');
 const separateInput=header()+broadsideInput([2,0,0]).replace('2x Shield Drone','1x Shield Drone, 1x Shield Drone');
 const separate=ready(separateInput).roster;
 assert.equal(shieldCount(separate.units[0]),2);assert.deepEqual(shieldW(runtime(separate).projection),[[10,8,8]],'Two explicit selections contribute once each');
 const homogeneous=ready(header()+'3x Broadside Battlesuits (100 pts)\n• 1x Broadside Shas’vre\n• 2x Broadside Shas’ui: 2x Shield Drone\n').roster;
 const grouped=runtime(homogeneous);
 assert.deepEqual(shieldW(grouped.projection),[[8,10]],'Explicit homogeneous per-model loadout remains per model, not group total');
 assert.equal(grouped.projection.units[0].profiles[1].quantity,2);assert.equal(shieldCount(homogeneous.units[0]),4);
 const saved=JSON.parse(JSON.stringify(run.snapshot())),projection=clone(run.projection);
 run.load(saved);assert.deepEqual(run.projection,projection,'Shield recompute idempotent');
 service.load(saved);assert.deepEqual(ready(text,{},service).roster,saved,'Same-input reimport exact physical inventory');
 assert.deepEqual(runtime(service.snapshot()).projection,projection);
 for(const counts of [[0,0,0],[1,0,2],[2,1,0]]){
  const next=ready(header()+broadsideInput(counts),{},service).roster;run.load(next);
  assert.deepEqual(shieldW(run.projection),[counts.map(count=>8+count)],'Remove/reselect/loadout changes recompute from input counts');
 }
 const current=run.snapshot(),currentProjection=run.projection;
 for(const [id,scope]of [['foreign','parsed-unit-999/foreign'],['stale','removed-model-scope'],['empty','']])
  negative('stage4d-'+id+'-scope',()=>{const bad=clone(current);bad.units[0].modelRows[0].selections[0].sourceModelScopeId=scope;
   assert.throws(()=>run.load(bad),/scope/i);assert.deepEqual(run.snapshot(),current);assert.deepEqual(run.projection,currentProjection);});
 negative('stage4d-foreign-source-unit',()=>{const bad=clone(current);bad.units[0].modelRows[0].selections[0].sourceInstanceId='foreign-unit';
  assert.throws(()=>run.load(bad),/scope/i);assert.deepEqual(run.snapshot(),current);});
 negative('stage4d-missing-per-model-quantity',()=>{const bad=clone(current);delete bad.units[0].modelRows[0].selections[0].perModelQuantity;
  assert.throws(()=>run.load(bad));assert.deepEqual(run.snapshot(),current);});
 negative('stage4d-unit-aggregate-spoofed-model-owner',()=>{const bad=clone(saved);bad.units[2].selections[0].sourceModelScopeId=models[0].scopeId;
  assert.throws(()=>run.load(bad),/confirmed MODEL/i);assert.deepEqual(run.snapshot(),current);});
 const leader=gearOnFirstModel('unit-commander-in-coldstar-battlesuit','Shield Drone',1);
 const bodyguard=gearOnFirstModel('unit-crisis-fireknife-battlesuits','Shield Drone',2);
 const attached=runtime(ready(header()+leader+bodyguard).roster),before=shieldW(attached.projection);
 attached.attach('parsed-unit-1','parsed-unit-2');assert.deepEqual(shieldW(attached.projection),before,'No Shield transfer across formed UNIT');
 attached.detach('parsed-unit-1');assert.deepEqual(shieldW(attached.projection),before);
 attached.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(shieldW(attached.projection),before);
 const mixedText=header()+gearOnFirstModel('unit-commander-in-coldstar-battlesuit','Shield Drone',2)
  .replace('2x Shield Drone','2x Shield Drone, 1x Gun Drone, 1x Marker Drone')+
  gearOnFirstModel('unit-commander-in-coldstar-battlesuit','Marker Drone',1).replace('1x Marker Drone','1x Marker Drone, 1x Gun Drone');
 const mixed=ready(mixedText).roster,mixedBase=shieldW(formRoster(book,mixed)),mixedProjection=runtime(mixed).projection;
 mixedBase[0][0]+=2;assert.deepEqual(shieldW(mixedProjection),mixedBase,'Only Shield identity affects W despite shared option ID');
 assert.ok(mixedProjection.units.every(unit=>unit.keywords.includes('MARKERLIGHT')),'Marker binding retained');
 records.shieldPhysicalResults={broadsideExpected:[[10,9,8],[8,10,9],[8,8,8]],broadsideActual:shieldW(projection),sameProfileFourDrones:[10,10],
  groupedPerModelQuantity:'PASS',mixedDroneTypes:'PASS',attachmentIsolation:'PASS',persistence:'PASS',recompute:'PASS'};
});

test('stage4d-independent-shield-scope-quantity-and-provenance-mutations',()=>{
 const state=ready(header()+broadsideInput([2,1,0])+broadsideInput([0,0,0])).roster,bound=bindTauShieldModels(book,state);
 const enrich=tauSourceChoiceContext(bound,state),expected=[[10,9,8],[8,8,8]];
 const clauses=domain=>domain.entities.flatMap(entity=>entity.ruleContract?.clauses||[]).filter(clause=>clause.physicalShieldSelection);
 const execute=(domain,bind=enrich)=>{const service=createRosterRuntime(domain,createTauRuleSchema({bindContext:bind}));service.load(state);return service.projection;};
 const verify=(domain,bind=enrich)=>{
  const owned=clauses(domain);assert.equal(owned.length,2);assert.equal(new Set(owned.map(row=>row.id)).size,2);
  for(const clause of owned)for(const effect of clause.rosterEffects){
   assert.equal(effect.referencedRuleId,shieldId);assert.deepEqual(effect.provenance.sourceEvidence,index.get(shieldId).provenance);
   const local=domain.entities.find(entity=>entity.ruleContract?.clauses.includes(clause));assert.ok(local.ruleContract.canonicalRuleReferences.includes(shieldId));
  }
  assert.deepEqual(shieldW(execute(domain,bind)),expected,'Independent input oracle catches missing effect, pooling and foreign recipients');
 };
 verify(bound);
 for(const [id,mutate]of [
  ['missing-binding',domain=>{const local=domain.entities.find(entity=>entity.ruleContract?.clauses.some(row=>row.physicalShieldSelection));local.ruleContract.clauses=local.ruleContract.clauses.filter(row=>!row.physicalShieldSelection);}],
  ['pooled-unit-quantity',domain=>clauses(domain).forEach(clause=>clause.rosterEffects[0].value=3)],
  ['missing-target-scope',domain=>clauses(domain).forEach(clause=>clause.rosterEffects[0].conditions=clause.rosterEffects[0].conditions.filter(row=>row.binding!=='TARGET'))],
  ['wrong-target-scope',domain=>clauses(domain)[0].rosterEffects[0].conditions.find(row=>row.binding==='TARGET').predicate.arguments.equals=formRoster(book,state).units[0].profiles[2].scopeId],
  ['wrong-physical-source',domain=>clauses(domain).forEach(clause=>clause.rosterEffects[0].conditions.find(row=>row.binding==='SOURCE').predicate.arguments.equals='parsed-unit-2')],
  ['wrong-generic-provenance',domain=>clauses(domain)[0].rosterEffects[0].provenance.sourceEvidence.sourceId='foreign'],
  ['removed-generic-reference',domain=>domain.entities.filter(entity=>entity.ruleContract).forEach(entity=>entity.ruleContract.canonicalRuleReferences=(entity.ruleContract.canonicalRuleReferences||[]).filter(id=>id!==shieldId))],
  ['duplicate-contribution',domain=>{const local=domain.entities.find(entity=>entity.ruleContract?.clauses.some(row=>row.physicalShieldSelection));local.ruleContract.clauses.push(clone(local.ruleContract.clauses.find(row=>row.physicalShieldSelection)));}]
 ])mutation('stage4d-'+id,()=>{const bad=clone(bound);mutate(bad);assert.throws(()=>verify(bad));});
 mutation('stage4d-lost-model-context-scope',()=>assert.throws(()=>verify(bound,context=>enrich(context?.subject==='MODEL'?{...context,modelScopeId:undefined}:context))));
 mutation('stage4d-canonical-profile-used-as-physical-scope',()=>{
  const first=formRoster(book,state).units[0].profiles[0].scopeId;
  assert.throws(()=>verify(bound,context=>enrich(context?.subject==='MODEL'?{...context,modelScopeId:first}:context)));
 });
 assert.deepEqual(shieldW(execute(bound,context=>enrich(context?.subject==='MODEL'?{...context,modelScopeId:undefined}:context))),[[8,8,8],[8,8,8]],
  'Missing physical MODEL scope safely withholds all Shield effects');
});

test('gun-missile-recon-mv15-source-weapons-counted-once',()=>{
 const cases=[
  {unit:'unit-commander-in-coldstar-battlesuit',label:'Gun Drone',qty:2,weapon:'drone-gun-drone:weapon:1'},
  {unit:'unit-broadside-battlesuits',label:'Missile Drone',qty:2,weapon:'drone-missile-drone:weapon:1'},
  {unit:'unit-pathfinder-team',label:'Recon Drone',qty:1,weapon:'datasheet-pathfinder-team:weapon:1'},
  {unit:'unit-the-twin-lance',label:'MV15 Gun Drone',qty:1,weapon:'datasheet-the-twin-lance:weapon:5'}
 ];
 for(const c of cases){
  const text=header()+gearOnFirstModel(c.unit,c.label,c.qty)+fixture(c.unit).text;
  const state=ready(text).roster,projection=runtime(state).projection;
  const inventory=selections(state.units[0]).filter(s=>s.canonicalEquipmentIds.length);
  assert.equal(inventory.length,1,'Equipment counted once');assert.equal(inventory[0].physicalQuantity,c.qty);
  const weapons=projectedWeapons(projection.units[0]).filter(w=>w.canonicalProfileId===c.weapon);
  const expectedWeaponQty=weapons.reduce((n,w)=>n+w.physicalQuantity,0);
  records.runtimeCases.push({id:'provided-weapon-'+c.label,source:c.weapon,expected:{physicalOccurrences:1,quantity:c.qty},
   actual:{physicalOccurrences:weapons.length,quantity:expectedWeaponQty},status:weapons.length===1&&expectedWeaponQty===c.qty?'PASS':'BLOCKED',
   reason:weapons.length===1&&expectedWeaponQty===c.qty?null:'Provided weapon requires safe physical loadout binding; source item quantity remains independent of executable weapon projection'});
  assert.ok(!projectedWeapons(projection.units[1]).some(w=>w.canonicalProfileId===c.weapon),'Unselected duplicate receives no drone weapon');
  assert.equal(state.units[0].startingStrength,fixture(c.unit).expected.models,'No fake drone MODEL');
  assert.deepEqual(make().load(state),state,'Equipment + weapon quantities survive save/load');
  assert.ok(inventory[0].sourceReferences?.length,'Canonical equipment source references retained');
  for(const proof of inventory[0].sourceReferences){assert.ok(index.has(proof.entityId),'Reference resolves exact factual owner');assert.ok(index.get(proof.entityId).provenance.sha256);}
  records.fixtures.push({id:'drone-'+c.label.toLowerCase().replaceAll(' ','-'),text,expected:[{unit:c.unit,equipment:c.label,quantity:c.qty,weapon:c.weapon}]});
 }
});

test('all19-source-named-datasheet-equipment-ability-occurrences',()=>{
 let count=0;
 for(const section of facts.entities.filter(e=>e.kind==='DATASHEET_SECTION'))for(const [i,block]of(section.data.blocks||[]).entries()){
  if(!block.wargearAbility)continue;
  const label=block.text.slice(0,block.text.indexOf(':')).replace(/\s*\(Aura\)$/i,'');
  const state=ready(header()+gearOnFirstModel(section.parentId,label,1)).roster;
  const chosen=selections(state.units[0]).filter(s=>s.canonicalEquipmentIds.length);
  assert.equal(chosen.length,1,label+' is one selected equipment item');assert.equal(chosen[0].physicalQuantity,1);
  const path=`/blocks/${i}/text`;
  assert.ok(chosen[0].canonicalFieldPaths?.[section.id]?.includes(path)||chosen[0].sourceReferences?.some(ref=>ref.entityId===section.id&&ref.path===path),
   label+' retains exact source ability occurrence/provenance');count++;
 }
 assert.equal(count,19);records.sourceNamedEquipmentOccurrences=count;
});

test('all39-common-drone-and-tidewall-source-inventory-occurrences',()=>{
 const common=facts.entities.filter(e=>e.kind==='EQUIPMENT_RULE');let count=0;
 for(const unit of units){
  const options=facts.entities.filter(e=>e.kind==='WARGEAR_OPTION'&&e.parentId===unit.id);
  for(const equipment of common){
   const source=options.find(e=>e.data.text.toLowerCase().includes(equipment.data.title.toLowerCase()));if(!source)continue;
   const label=equipment.data.title.toLowerCase(),text=header()+fixture(unit.id,{equipment:'2x '+label}).text;
   const state=ready(text).roster,chosen=state.units[0].selections;
   assert.equal(chosen.length,1,'One exact UNIT-level equipment selection');assert.equal(chosen[0].physicalQuantity,2);
   assert.ok(chosen[0].canonicalEquipmentIds.includes(source.id),'Accepted Datasheet option remains physical UNIT owner');
   assert.equal(chosen[0].sourceEquipmentIdentity,equipment.id,'One generic drone factual identity');
   assert.deepEqual(chosen[0].sourceEquipmentProvenance,equipment.provenance,'Generic drone provenance retained');
   assert.ok(state.units[0].modelRows.every(row=>row.selections.length===0),'Unknown MODEL bearer never invented');
   assert.deepEqual(make().load(state),state,'Aggregate equipment inventory reload');count++;
  }
 }
 assert.equal(count,39);records.commonDroneOccurrences=count;
 const text=header()+fixture('unit-tidewall-shieldline',{equipment:'1x Tidewall defence platform'}).text;
 const state=ready(text).roster;assert.equal(state.units[0].selections[0].physicalQuantity,1);
 assert.deepEqual(state.units[0].selections[0].canonicalEquipmentIds,['datasheet-tidewall-shieldline:wargear:1']);
 assert.ok(index.get('datasheet-tidewall-shieldline:section:1').data.blocks.some(b=>b.text.includes('Wounds characteristic of 15')));
 assert.equal(runtime(state).projection.units[0].profiles[0].profile.stats.W,'15','Existing Tidewall platform numeric effect reaches imported equipped MODEL');
 records.totalEquipmentOccurrences=count+19+1;
});

test('equipment-identity-provenance-owner-and-quantity-mutations',()=>{
 const text=header()+gearOnFirstModel('unit-commander-in-coldstar-battlesuit','Gun Drone',2),service=make();
 const state=ready(text,{},service).roster;
 for(const [id,mutate]of [
  ['equipment-wrong-source-id',s=>s.units[0].modelRows[0].selections[0].sourceEquipmentProvenance.sourceId='wrong-source'],
  ['equipment-wrong-identity',s=>s.units[0].modelRows[0].selections[0].sourceEquipmentIdentity='drone-missile-drone'],
  ['equipment-wrong-physical-owner',s=>s.units[0].modelRows[0].selections[0].canonicalEquipmentIds=['datasheet-pathfinder-team:wargear:2']],
  ['equipment-wrong-provided-weapon',s=>s.units[0].modelRows[0].selections[0].canonicalProfileIds=['datasheet-commander-in-coldstar-battlesuit:weapon:1']],
  ['equipment-duplicated-quantity',s=>s.units[0].modelRows[0].selections[0].physicalQuantity=4]
 ])mutation(id,()=>{const bad=clone(state);mutate(bad);assert.throws(()=>service.load(bad));assert.deepEqual(service.state,state,'Rejected snapshot preserves saved physical inventory');});
 assert.deepEqual(ready(text,{},service).roster,state,'Repeated equipment import never duplicates provided weapons');
});

test('existing-source-equipment-effects-through-real-import-boundary',()=>{
 const oracle=read('./rule-contract-expectations.json').cases.filter(e=>e.activation==='SELECTED_EQUIPMENT'&&e.id!=='marker-drone');
 const observable=unit=>({keywords:unit.keywords,abilities:unit.abilities,metrics:unit.metrics,
  profiles:unit.profiles.map(p=>({quantity:p.quantity,keywords:p.keywords,abilities:p.abilities,profile:p.profile})),
  weapons:projectedWeapons(unit).map(w=>({id:w.canonicalProfileId,quantity:w.physicalQuantity,data:w.data}))});
 for(const e of oracle){
  const unit=index.get(e.unit),sourceItem=e.source.quote.slice(0,e.source.quote.indexOf(':'));
  const ranged=unit.data.weaponIds.find(id=>index.get(id).data.mode==='ranged'&&(!e.weaponRestriction||index.get(id).data.name.toLowerCase()==='pulse carbine'));
  const melee=unit.data.weaponIds.find(id=>index.get(id).data.mode==='melee');
  const weaponLabels=[ranged,melee].filter(Boolean).map(id=>'1x '+index.get(id).data.name),gear=[sourceItem,...weaponLabels].join(', ');
  const plain=weaponLabels.length?gearOnFirstModel(e.unit,weaponLabels.join(', '),1).replace(': 1x 1x ',': 1x '):fixture(e.unit).text;
  const equipped=gearOnFirstModel(e.unit,gear,1),text=header()+equipped+plain;
  const state=ready(text).roster,actual=runtime(state).projection,before=runtime(ready(header()+plain+plain).roster).projection;
  const selected=actual.units[0],baseline=before.units[0];
  for(const operation of e.expectedOperations){
   if(operation.operation==='MODIFY_STAT'&&['M','W','INSV'].includes(operation.field)){
    const value=selected.profiles[0].profile.stats[operation.field]??selected.profiles[0].profile[operation.field];
    assert.equal(Number.parseFloat(value),operation.value,e.id+' numeric MODEL value');
    if(operation.field==='INSV')assert.equal(value,operation.value+'+',e.id+' typed Invulnerable Save');
   }
   else if(['GRANT_MODEL_KEYWORD','REMOVE_KEYWORD'].includes(operation.operation))
    assert.equal(selected.profiles[0].keywords.includes(operation.keyword),operation.operation==='GRANT_MODEL_KEYWORD',e.id+' exact MODEL keyword');
   else if(operation.operation==='GRANT_ABILITY')assert.ok(selected.abilities.some(a=>a.canonicalId===operation.ability.canonicalId),e.id+' UNIT ability');
   else for(const weapon of projectedWeapons(selected)){
    const old=projectedWeapons(baseline).find(w=>w.canonicalProfileId===weapon.canonicalProfileId&&w.scopeId===weapon.scopeId);
    if(!old)continue; // A source-provided drone weapon is checked independently above.
    const eligible=(!operation.weaponMode||weapon.data.mode===operation.weaponMode)&&(!e.weaponRestriction||weapon.data.name.toLowerCase()==='pulse carbine');
    if(operation.operation==='GRANT_WEAPON_ABILITY')assert.equal(weapon.data.abilities.some(a=>a.toUpperCase()===operation.ability),eligible||old.data.abilities.some(a=>a.toUpperCase()===operation.ability),e.id+' mode/scope');
    if(operation.operation==='MODIFY_STAT')assert.equal(Number.parseFloat(weapon.data[operation.field]),Number.parseFloat(old.data[operation.field])+(eligible?operation.value:0),e.id+' exact weapon modifier');
   }
  }
  assert.deepEqual(observable(actual.units[1]),observable(before.units[1]),e.id+' no independent-instance leak');
  assert.deepEqual(runtime(state).projection,actual,e.id+' stable recompute');
  records.runtimeCases.push({id:'imported-'+e.id,source:e.source,expected:e.expectedOperations,actual:'Shared executor matches independent source expectation after real import',status:'PASS'});
 }
});

test('every-datasheet-weapon-profile-exact-quantity',()=>{
 let count=0;
 for(const unit of units)for(const weaponId of unit.data.weaponIds){
  const weapon=index.get(weaponId),base=fixture(unit.id),text=header()+base.text.replace('(100 pts)',`(100 pts): 2x ${weapon.data.name}`);
  const state=ready(text).roster,selected=selections(state.units[0]);
  assert.equal(selected.length,1,'No implicit or duplicated default weapon');
  const sameSourceItem=unit.data.weaponIds.filter(id=>index.get(id).data.name===weapon.data.name||
   index.get(id).data.name.split(/\s+[–—-]\s+/)[0]===weapon.data.name);
  assert.deepEqual([...selected[0].canonicalProfileIds].sort(),sameSourceItem.sort(),'One physical source item retains its separate ranged/melee profiles');assert.equal(selected[0].physicalQuantity,2);
  assert.equal(selected[0].perModelQuantity,null,'UNIT quantity does not invent MODEL bearer');count++;
 }
 assert.equal(count,215);records.weaponProfileOccurrences=count;
});

test('alternative-profiles-never-multiply-physical-equipment',()=>{
 let families=0;
 for(const unit of units){
  const groups=new Map();for(const id of unit.data.weaponIds){const name=index.get(id).data.name,base=name.split(/\s+[–—-]\s+/)[0];
   if(base!==name){const ids=groups.get(base)||[];ids.push(id);groups.set(base,ids);}}
  for(const [name,ids]of groups){
   const expectedIds=[...new Set([...ids,...unit.data.weaponIds.filter(id=>index.get(id).data.name===name)])];
   const text=header()+fixture(unit.id,{equipment:'3x '+name}).text,state=ready(text).roster;
   const selected=selections(state.units[0]);assert.equal(selected.length,1);assert.equal(selected[0].physicalQuantity,3);
   assert.deepEqual([...selected[0].canonicalProfileIds].sort(),expectedIds.sort(),'Alternative profile identities are one source equipment family');families++;
  }
 }
 assert.ok(families>0);records.alternativeProfileFamilies=families;
});

// Expected current relations are transcribed from accepted LEADER blocks,
// excluding their explicitly non-current CRISIS BATTLESUITS target.
const leaderPairs=[
 ['unit-cadre-fireblade',['unit-breacher-team','unit-strike-team']],
 ['unit-commander-in-coldstar-battlesuit',['unit-crisis-fireknife-battlesuits','unit-crisis-starscythe-battlesuits','unit-crisis-sunforge-battlesuits']],
 ['unit-commander-in-enforcer-battlesuit',['unit-crisis-fireknife-battlesuits','unit-crisis-starscythe-battlesuits','unit-crisis-sunforge-battlesuits']],
 ['unit-ethereal',['unit-breacher-team','unit-strike-team']],
 ['unit-kroot-flesh-shaper',['unit-kroot-carnivores','unit-kroot-farstalkers']],
 ['unit-kroot-trail-shaper',['unit-kroot-carnivores','unit-kroot-farstalkers']],
 ['unit-kroot-war-shaper',['unit-kroot-carnivores','unit-kroot-farstalkers']],
 ['unit-commander-farsight',['unit-crisis-fireknife-battlesuits','unit-crisis-starscythe-battlesuits','unit-crisis-sunforge-battlesuits']],
 ['unit-darkstrider',['unit-pathfinder-team']]
];
test('all20-current-leader-relations-attach-detach-reattach',()=>{
 let count=0;
 for(const [leaderId,bodyguards]of leaderPairs){
  const source=facts.entities.find(e=>e.kind==='DATASHEET_SECTION'&&e.parentId===leaderId&&e.data.title==='LEADER');assert.ok(source);
  const sourceText=source.data.blocks.map(b=>b.text).join('\n');
  for(const bodyguardId of bodyguards){
   assert.ok(sourceText.includes(index.get(bodyguardId).data.title.toUpperCase()),'Independent source relation');
   const state=ready(header()+fixture(leaderId).text+fixture(bodyguardId).text+fixture(leaderId).text).roster;
   const [leader,bodyguard,other]=state.units,run=runtime(state),before=run.projection;
   run.attach(leader.instanceId,bodyguard.instanceId);assert.equal(run.state.attachments.length,1);
   assert.deepEqual(run.projection.units.find(u=>u.instanceId===other.instanceId),before.units.find(u=>u.instanceId===other.instanceId),'Independent physical Leader never inherits attachment effects');
   run.detach(leader.instanceId);assert.equal(run.state.attachments.length,0);assert.deepEqual(run.projection,before,'Detach recomputes baseline');
   run.reattach(leader.instanceId,bodyguard.instanceId);assert.equal(run.state.attachments.length,1);count++;
  }
 }
 assert.equal(count,20);records.leaderRelations=count;
});

test('kroot-bodyguard-starting-strength20-two-different-leaders',()=>{
 const base=fixture('unit-kroot-carnivores'),twenty=base.text.replace('10x Kroot Carnivores','20x Kroot Carnivores').replace('• 9x Kroot Carnivores','• 19x Kroot Carnivores');
 const bodyguardSource=index.get('datasheet-kroot-carnivores:section:bodyguard');
 assert.ok(bodyguardSource.data.blocks.some(block=>block.text.includes('20')&&block.text.includes('two')),'Accepted source supports two different Leaders at20');
 const text=header(['Kroot Hunting Pack'])+twenty+fixture('unit-kroot-flesh-shaper').text+fixture('unit-kroot-war-shaper').text;
 const service=make(),state=ready(text,{},service).roster,run=runtime(state);
 run.attach('parsed-unit-2','parsed-unit-1');run.attach('parsed-unit-3','parsed-unit-1');
 assert.equal(run.state.attachments.length,2);assert.equal(run.state.units[0].startingStrength,20);
 assert.ok(run.projection.formedUnits.some(group=>group.memberInstanceIds?.length===3||group.participantInstanceIds?.length===3||
  group.leaderInstanceIds?.length===2),'Both physical Leaders retained in formed UNIT');
 const formed=clone(run.projection);run.detach('parsed-unit-3');assert.equal(run.state.attachments.length,1);
 run.reattach('parsed-unit-3','parsed-unit-1');assert.deepEqual(run.projection,formed,'Two-Leader recompute stable');
 assert.deepEqual(runtime(run.snapshot()).state,run.state,'Special attachment persistence through existing runtime boundary');
 for(const [id,badText]of [
  ['kroot10-second-leader',header(['Kroot Hunting Pack'])+base.text+fixture('unit-kroot-flesh-shaper').text+fixture('unit-kroot-war-shaper').text],
  ['kroot20-same-leader-type',header(['Kroot Hunting Pack'])+twenty+fixture('unit-kroot-flesh-shaper').text+fixture('unit-kroot-flesh-shaper').text]
 ])negative(id,()=>{const bad=runtime(ready(badText).roster);bad.attach('parsed-unit-2','parsed-unit-1');assert.throws(()=>bad.attach('parsed-unit-3','parsed-unit-1'));assert.equal(bad.state.attachments.length,1);});
 records.fixtures.push({id:'kroot-two-leaders20',text,expected:[{unit:'unit-kroot-carnivores',modelQuantity:20,leaders:['unit-kroot-flesh-shaper','unit-kroot-war-shaper']}]});
});

const enhancementBearers={
 'detachment-kroot-hunting-pack:enhancement:1':'unit-kroot-flesh-shaper',
 'detachment-kroot-hunting-pack:enhancement:2':'unit-kroot-war-shaper',
 'detachment-kroot-hunting-pack:enhancement:3':'unit-kroot-trail-shaper',
 'detachment-kroot-hunting-pack:enhancement:4':'unit-kroot-war-shaper',
 'detachment-auxiliary-cadre:enhancement:1':'unit-kroot-trail-shaper',
 'detachment-advanced-acquisition-cadre:enhancement:1':'unit-stealth-battlesuits',
 'detachment-advanced-acquisition-cadre:enhancement:2':'unit-ghostkeel-battlesuit'
};
test('all23-enhancements-canonical-owner-and-persisted-physical-scope',()=>{
 for(const enhancement of enhancements){
  const id=enhancementBearers[enhancement.id]||(enhancement.data.eligibilityText.includes('BATTLESUIT')?'unit-commander-in-coldstar-battlesuit':'unit-cadre-fireblade');
  const text=header([index.get(enhancement.parentId).data.title])+fixture(id,{enhancement:enhancement.data.title}).text;
  const service=make(),result=service.import(text);
  assert.ok(['READY','NEEDS_BINDINGS'].includes(result.status),JSON.stringify({id:enhancement.id,errors:result.errors}));
  const state=result.roster||result.candidateRoster;assert.ok(state,'Unresolved physical choice must retain candidate inventory');
  assert.deepEqual(state.units[0].enhancementIds,[enhancement.id]);
  assert.equal(state.units[0].enhancementAssignments.length,enhancement.data.scope==='UNIT'?0:1,'Physical bearer scope');
  if(result.status==='READY'){
   assert.deepEqual(make().load(service.snapshot()),state);
   const effective=runtime(state).projection,plain=header([index.get(enhancement.parentId).data.title])+fixture(id).text;
   const removed=ready(plain,{},service).roster;assert.deepEqual(removed.units[0].enhancementIds,[]);assert.deepEqual(removed.units[0].enhancementAssignments,[]);
   assert.deepEqual(runtime(removed).projection,runtime(ready(plain).roster).projection,'Removal recomputes plain roster');
   const reselected=ready(text,{},service).roster;assert.deepEqual(reselected,state,'Enhancement reselect preserves exact owner');
   assert.deepEqual(runtime(reselected).projection,effective,'Enhancement reselect/recompute never stacks');
  }
  else {assert.ok(result.needsBindings.length);records.limitations.push({canonicalId:enhancement.id,status:'NEEDS_BINDINGS',needs:result.needsBindings});}
 }
});

test('prototype-exact-physical-weapon-dependencies-stay-explicit',()=>{
 const oracle=read('./rule-contract-expectations.json').deferredSelectionExpectations.find(e=>e.id==='prototype-weapon-choice');
 for(const [i,id]of oracle.canonicalIds.entries()){
  const source=index.get(id),weaponId=oracle.eligibleWeaponIds[i].find(id=>index.get(id).parentId==='unit-commander-in-coldstar-battlesuit');
  const weapon=index.get(weaponId),text=header(['Experimental Prototype Cadre'])+
   gearOnFirstModel('unit-commander-in-coldstar-battlesuit',weapon.data.name,2)+'Enhancement: '+source.data.title+'\n';
  const state=ready(text).roster,projection=runtime(state).projection;
  const selected=projectedWeapons(projection.units[0]).filter(w=>w.canonicalProfileId===weaponId);
  assert.equal(selected.length,1);assert.equal(selected[0].physicalQuantity,2,'Both INPUT copies retained without invented per-gun ownership');
  for(const field of Object.keys(oracle.expectedDeltas[i]))assert.equal(selected[0].data[field],weapon.data[field],'No unresolved one-weapon delta broadcast to duplicates');
  records.runtimeCases.push({id:'prototype-'+source.data.title,source:oracle.independentSources[i],expected:{chosenPhysicalWeapon:1,
   unchangedPhysicalWeapons:1,deltas:oracle.expectedDeltas[i]},actual:{weaponProfileId:weaponId,physicalQuantity:2,deltasApplied:0},status:'BLOCKED',
   reason:'This unchanged INPUT has one aggregate selection with quantity=2, not two proven occurrence identities; no splitting or ordinal choice is permitted'});
  records.fixtures.push({id:'prototype-'+i,text,expected:[{enhancement:id,physicalWeapons:2,oneChosen:true,expectedDeltas:oracle.expectedDeltas[i]}]});
 }
});

const prototypeOracle=read('./rule-contract-expectations.json').deferredSelectionExpectations.find(e=>e.id==='prototype-weapon-choice');
const weaponReference=(unit,weapon)=>({unitInstanceId:unit.instanceId,scopeId:weapon.scopeId??null,
 selectionKey:weapon.selectionKey,canonicalProfileId:weapon.canonicalProfileId});
function assertPrototypeProjection(actual,base,reference,deltas){
 const changes=[];
 for(const unit of actual.units)for(const weapon of projectedWeapons(unit)){
  const original=projectedWeapons(base.units.find(row=>row.instanceId===unit.instanceId)).find(row=>
   (row.scopeId??null)===(weapon.scopeId??null)&&row.selectionKey===weapon.selectionKey&&row.canonicalProfileId===weapon.canonicalProfileId);
  assert.ok(original,'Every output weapon retains input physical identity');
  const chosen=sameWeapon(weaponReference(unit,weapon),reference),expected=clone(original.data);
  if(base.detachmentIds.includes('detachment-experimental-prototype-cadre')&&
    ['BATTLESUIT','CHARACTER'].every(keyword=>unit.keywords.includes(keyword))&&weapon.data.mode==='ranged'){
   assert.ok(index.get('detachment-experimental-prototype-cadre:rule').data.text.includes('Friendly BATTLESUIT CHARACTER units’ ranged attacks have +6" R.'));
   expected.range=(Number(original.data.range.replace('"',''))+6)+'"';
  }
  if(chosen)for(const [field,delta]of Object.entries(deltas))expected[field]=String(Number(original.data[field])+delta);
  assert.deepEqual(weapon.data,expected,'Exact source-backed delta on selected weapon only: '+weapon.selectionKey);
  if(chosen)changes.push(weaponReference(unit,weapon));
 }
 assert.equal(changes.length,reference?1:0,'Exactly one proven weapon occurrence, never an aggregate or another UNIT');
}
const sameWeapon=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
test('stage4c-three-prototypes-exact-separate-input-selections-and-persistence',()=>{
 records.prototypeExactResults=[];
 for(const [i,ruleId]of prototypeOracle.canonicalIds.entries()){
  const rule=index.get(ruleId),weaponId=prototypeOracle.eligibleWeaponIds[i].find(id=>index.get(id).parentId==='unit-commander-in-coldstar-battlesuit');
  const weapon=index.get(weaponId),source=prototypeOracle.independentSources[i];
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../../../'+source.document,import.meta.url))).digest('hex').toUpperCase(),source.sha256);
  const one=gearOnFirstModel('unit-commander-in-coldstar-battlesuit',weapon.data.name,1)
   .replace('1x '+weapon.data.name,'1x '+weapon.data.name+', 1x '+weapon.data.name);
  const text=header(['Experimental Prototype Cadre'])+one+'Enhancement: '+rule.data.title+'\n'+one;
  const service=make(),state=ready(text,{},service).roster,base=formRoster(book,state),run=runtime(state);
  const physical=base.units[0],weapons=projectedWeapons(physical).filter(row=>row.canonicalProfileId===weaponId);
  assert.equal(weapons.length,2);assert.deepEqual(weapons.map(row=>row.physicalQuantity),[1,1],'Separate INPUT selections, no synthetic split');
  const first=weaponReference(physical,weapons[0]),second=weaponReference(physical,weapons[1]);
  assert.notEqual(first.selectionKey,second.selectionKey,'Only existing distinct selection identities are used');
  run.setPrototypeChoice(physical.instanceId,ruleId,first);
  assertPrototypeProjection(run.projection,base,first,prototypeOracle.expectedDeltas[i]);
  const rows=run.projection.units.flatMap(unit=>unit.applied).filter(row=>row.ruleId===ruleId);
  assert.equal(rows.length,Object.keys(prototypeOracle.expectedDeltas[i]).length);
  for(const row of rows){assert.equal(row.sourceInstanceId,physical.instanceId);assert.equal(row.targetInstanceId,physical.instanceId);
   assert.equal(row.targetWeaponSelectionKey,first.selectionKey);assert.equal(row.targetWeaponScopeId,first.scopeId);
   assert.deepEqual(row.sourceFields,[['text']]);assert.equal(row.sourceCompositionId,first.scopeId);}
  const decision=tauPrototypeDecisions(run.snapshot().units[0])[0];assert.deepEqual(decision.sourceProvenance,rule.provenance);
  const bound=bindTauPrototypeChoices(book,run.snapshot()),effects=bound.entities.find(row=>row.id===ruleId).ruleContract.clauses.flatMap(row=>row.rosterEffects);
  assert.ok(effects.every(effect=>effect.provenance.canonicalRuleId===ruleId&&effect.provenance.canonicalOwnerId===rule.parentId&&
   JSON.stringify(effect.provenance.sourceEvidence)===JSON.stringify(rule.provenance)),'Derived effects preserve original factual owner and provenance');
  const saved=JSON.parse(JSON.stringify(run.snapshot())),projection=clone(run.projection);
  assert.deepEqual(runtime(saved).projection,projection,'Snapshot JSON/load retains exact weapon selection');
  run.load(saved);assert.deepEqual(run.projection,projection,'Recompute does not accumulate modifiers');
  service.load(saved);const reimport=ready(text,{},service).roster;
  assert.deepEqual(reimport,saved,'Identical input reimport preserves validated exact source decision');
  assert.deepEqual(runtime(reimport).projection,projection);
  run.setPrototypeChoice(physical.instanceId,ruleId,second);assertPrototypeProjection(run.projection,base,second,prototypeOracle.expectedDeltas[i]);
  run.setPrototypeChoice(physical.instanceId,ruleId,null);assertPrototypeProjection(run.projection,base,null,{});
  run.setPrototypeChoice(physical.instanceId,ruleId,first);
  const valid=run.snapshot(),validProjection=run.projection;
  for(const [name,reference]of [
   ['missing',{}],['foreign-unit',{...first,unitInstanceId:base.units[1].instanceId}],
   ['wrong-owner',{...first,scopeId:base.units[1].profiles[0].scopeId}],['stale-key',{...first,selectionKey:'missing-weapon'}],
   ['wrong-canonical-profile',{...first,canonicalProfileId:index.get('unit-commander-in-coldstar-battlesuit').data.weaponIds.find(id=>id!==weaponId)}]
  ])negative('stage4c-'+i+'-'+name,()=>{assert.throws(()=>run.setPrototypeChoice(physical.instanceId,ruleId,reference));
   assert.deepEqual(run.snapshot(),valid);assert.deepEqual(run.projection,validProjection,'Rejected weapon decision preserves valid runtime');});
  const stale=clone(valid);stale.units[0].modelRows[0].selections.find(row=>row.selectionKey===first.selectionKey).selectionKey+='-edited';
  assert.throws(()=>run.load(stale),/Stale|stale|weapon/i);assert.deepEqual(run.snapshot(),valid);
  const missingReference=clone(valid);delete tauPrototypeDecisions(missingReference.units[0])[0].sourceWeaponReference;
  assert.throws(()=>run.load(missingReference));assert.deepEqual(run.snapshot(),valid);
  const staleSource=clone(valid);staleSource.units[0].enhancementIds=[];staleSource.units[0].enhancementAssignments=[];staleSource.units[0].mfmEnhancementRecordIds=[];
  assert.throws(()=>run.load(staleSource));assert.deepEqual(run.snapshot(),valid);
  run.setPrototypeChoice(physical.instanceId,ruleId,null);
  const removed=run.snapshot();removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];removed.units[0].mfmEnhancementRecordIds=[];
  run.load(removed);assertPrototypeProjection(run.projection,base,null,{});
  run.load(valid);assertPrototypeProjection(run.projection,base,first,prototypeOracle.expectedDeltas[i]);
  const changedText=text.replace('1x '+weapon.data.name+', 1x '+weapon.data.name,'1x '+weapon.data.name);
  const changed=ready(changedText,{},service).roster;
  assert.equal(tauPrototypeDecisions(changed.units[0]).length,0,'Changed input cannot inherit a positional source choice');
  assertPrototypeProjection(runtime(changed).projection,formRoster(book,changed),null,{});
  const aggregate=ready(header(['Experimental Prototype Cadre'])+gearOnFirstModel('unit-commander-in-coldstar-battlesuit',weapon.data.name,2)+'Enhancement: '+rule.data.title+'\n').roster;
  const aggregateBase=formRoster(book,aggregate),aggregateWeapon=projectedWeapons(aggregateBase.units[0])[0],aggregateRun=runtime(aggregate);
  assert.throws(()=>aggregateRun.setPrototypeChoice('parsed-unit-1',ruleId,weaponReference(aggregateBase.units[0],aggregateWeapon)),/aggregate/i);
  assertPrototypeProjection(aggregateRun.projection,aggregateBase,null,{});
  records.prototypeExactResults.push({id:ruleId,status:'PASS',source,expectedDeltas:prototypeOracle.expectedDeltas[i],
   actualStrengthDeltas:projectedWeapons(projection.units[0]).map(row=>Number(row.data.strength)-Number(weapon.data.strength)),
   aggregate:'BLOCKED_NO_SEPARATE_IDENTITY',persistence:'PASS',recompute:'PASS'});
  if(i===0){
   const paired=bindTauPrototypeChoices(book,valid),schema=createTauRuleSchema({bindContext:tauSourceChoiceContext(paired,valid)});
   const resolver=tauWeaponSelectionResolver(paired,valid);
   const diagnostic=resolve=>{const rt=createRosterRuntime(paired,{...schema,
    resolveWeaponSelection:context=>context.rule.id===ruleId?resolve(context):undefined});rt.load(valid);return rt.projection;};
   assertPrototypeProjection(diagnostic(resolver),base,first,prototypeOracle.expectedDeltas[i]);
   for(const [id,resolve]of [
    ['missing-physical-filter',()=>undefined],['wrong-selected-key',()=>({...first,selectionKey:second.selectionKey})],
    ['foreign-runtime-owner',()=>({...first,unitInstanceId:base.units[1].instanceId})],
    ['wrong-runtime-scope',()=>({...first,scopeId:base.units[1].profiles[0].scopeId})],
    ['missing-runtime-key',()=>({...first,selectionKey:undefined})]
   ])mutation('stage4c-'+id,()=>assert.throws(()=>assertPrototypeProjection(diagnostic(resolve),base,first,prototypeOracle.expectedDeltas[i])));
   assertPrototypeProjection(diagnostic(()=>null),base,null,{});
   mutation('stage4c-aggregate-physical-quantity',()=>{
    const aggregateRaw=clone(valid),selection=aggregateRaw.units[0].modelRows[0].selections.find(row=>row.selectionKey===first.selectionKey);
    selection.physicalQuantity=2;selection.perModelQuantity=2;
    const rt=createRosterRuntime(paired,{...schema,resolveWeaponSelection:resolver});rt.load(valid);
    assert.throws(()=>rt.load(aggregateRaw),/aggregate/i);assert.deepEqual(rt.snapshot(),valid,'Shared runtime also rejects aggregate targeting atomically');
   });
   mutation('stage4c-canonical-filter-intersection',()=>{
    const wrongCanonical=clone(paired);wrongCanonical.entities.find(row=>row.id===ruleId).ruleContract.clauses.flatMap(row=>row.rosterEffects)
     .forEach(effect=>effect.weaponIds=['datasheet-commander-in-coldstar-battlesuit:weapon:8']);
    const rt=createRosterRuntime(wrongCanonical,{...schema,resolveWeaponSelection:resolver});assert.throws(()=>rt.load(valid),/selection/i);
   });
   const wrongValue=clone(paired);wrongValue.entities.find(row=>row.id===ruleId).ruleContract.clauses.flatMap(row=>row.rosterEffects).find(row=>row.field==='strength').value++;
   mutation('stage4c-wrong-numeric-value',()=>assert.throws(()=>{const rt=createRosterRuntime(wrongValue,{...schema,resolveWeaponSelection:resolver});rt.load(valid);
    assertPrototypeProjection(rt.projection,base,first,prototypeOracle.expectedDeltas[i]);}));
  }
 }
});

test('stage4c-exact-weapon-other-model-isolation',()=>{
 const id='unit-crisis-starscythe-battlesuits',ruleId=prototypeOracle.canonicalIds[0],weaponId=prototypeOracle.eligibleWeaponIds[0].find(id=>index.get(id).parentId==='unit-crisis-starscythe-battlesuits');
 const weapon=index.get(weaponId),rows=members(id).filter(row=>row.data.quantity.min>0);
 const text=header(['Experimental Prototype Cadre'])+rows.reduce((sum,row)=>sum+row.data.quantity.min,0)+'x '+index.get(id).data.title+' (100 pts)\n'+
  rows.map(row=>'• '+row.data.quantity.min+'x '+row.data.name+': 1x '+weapon.data.name+'\n').join('')+'Enhancement: '+index.get(ruleId).data.title+'\n';
 const candidate=make().import(text),scope=formRoster(book,candidate.candidateRoster??candidate.roster).units[0].profiles.find(row=>row.quantity===1).scopeId;
 const state=ready(text,{modelBearers:{'parsed-unit-1':{[ruleId]:scope}}}).roster,base=formRoster(book,state),run=runtime(state);
 const bearer=base.units[0].profiles.find(row=>row.scopeId===scope),reference=weaponReference(base.units[0],bearer.weapons[0]);
 run.setPrototypeChoice('parsed-unit-1',ruleId,reference);assertPrototypeProjection(run.projection,base,reference,prototypeOracle.expectedDeltas[0]);
 const other=base.units[0].profiles.find(row=>row.scopeId!==scope);
 assert.throws(()=>run.setPrototypeChoice('parsed-unit-1',ruleId,weaponReference(base.units[0],other.weapons[0])),/owner|evidence|choice/i);
});

test('student-of-kauyon-exact-three-physical-unit-recipients',()=>{
 const rule='detachment-auxiliary-cadre:enhancement:1',source=index.get(rule);
 assert.equal(source.data.text,'KROOT SHAPER model only. In the Declare Battle Formations step, you can select up to three friendly KROOT CARNIVORES/FARSTALKERS units. Those units have Deep Strike.');
 const text=header(['Auxiliary Cadre'])+fixture('unit-kroot-trail-shaper',{enhancement:'Student of Kauyon'}).text+
  fixture('unit-kroot-carnivores').text+fixture('unit-kroot-farstalkers').text+fixture('unit-kroot-carnivores').text+fixture('unit-kroot-farstalkers').text;
 const service=make(),state=ready(text,{},service).roster,run=runtime(state),baseline=clone(run.projection);
 const hasDeepStrike=unit=>(unit.abilities||[]).some(a=>a.canonicalId==='core-deep-strike');
 assert.ok(baseline.units.every(u=>!hasDeepStrike(u)),'No automatic roster-wide Deep Strike before decision');
 run.setStudentChoice('parsed-unit-1',['parsed-unit-2','parsed-unit-3','parsed-unit-4']);
 for(const unit of run.projection.units)assert.equal(hasDeepStrike(unit),['parsed-unit-2','parsed-unit-3','parsed-unit-4'].includes(unit.instanceId),'Exactly chosen physical UNIT');
 const saved=run.snapshot();assert.deepEqual(runtime(saved).projection,run.projection,'Recipient choices survive persistence');
 const before=clone(run.projection);run.load(saved);assert.deepEqual(run.projection,before,'Recompute no duplicates');
 run.setStudentChoice('parsed-unit-1',[]);
 // A cleared selection may retain its explicit empty field in a snapshot.
 // Compare every gameplay/provenance field while normalizing only that empty
 // optional decision marker; no abilities, values or recipients are filtered.
 const cleared=clone(run.projection);if(cleared.units[0].selectedTauSourceChoiceIds?.length===0)delete cleared.units[0].selectedTauSourceChoiceIds;
 assert.deepEqual(cleared,baseline,'Choice removal removes exact grant');
 run.setStudentChoice('parsed-unit-1',['parsed-unit-2']);assert.ok(hasDeepStrike(run.projection.units[1]));
 run.setStudentChoice('parsed-unit-1',[]);
 for(const [id,sourceId,recipients]of [
  ['student-wrong-source','parsed-unit-2',['parsed-unit-3']],
  ['student-wrong-recipient','parsed-unit-1',['parsed-unit-1']],
  ['student-foreign-recipient','parsed-unit-1',['foreign-unit']],
  ['student-duplicate-recipient','parsed-unit-1',['parsed-unit-2','parsed-unit-2']],
  ['student-four-recipients','parsed-unit-1',['parsed-unit-2','parsed-unit-3','parsed-unit-4','parsed-unit-5']]
 ])negative(id,()=>{const previous=run.snapshot();assert.throws(()=>run.setStudentChoice(sourceId,recipients));assert.deepEqual(run.state,previous);});
 for(const [id,mutate]of [
  ['student-missing-selection',bad=>bad.units[0].modelRows[0].selections=[]],
  ['student-wrong-physical-owner',bad=>bad.units[0].modelRows[0].selections.find(s=>s.recipientInstanceIds).sourceInstanceId='parsed-unit-2'],
  ['student-wrong-source-id',bad=>bad.units[0].modelRows[0].selections.find(s=>s.recipientInstanceIds).sourceProvenance.sourceId='wrong-source'],
  ['student-wrong-recipient',bad=>bad.units[0].modelRows[0].selections.find(s=>s.recipientInstanceIds).recipientInstanceIds=['parsed-unit-1']]
 ])mutation(id,()=>{const bad=clone(saved);mutate(bad);assert.throws(()=>run.load(bad));});
 records.runtimeCases.push({id:'student-of-kauyon',expected:'Exactly3 chosen KROOT physical UNIT get DeepStrike;0other',actual:'Exactly3 chosen physical UNIT; removals recompute',status:'PASS'});
 records.fixtures.push({id:'student-recipients',text,expected:[{source:'parsed-unit-1',recipientInstanceIds:['parsed-unit-2','parsed-unit-3','parsed-unit-4'],negativeRecipient:'parsed-unit-5'}]});
});

const studentGrantRows=unit=>unit.applied.filter(row=>row.ruleId==='detachment-auxiliary-cadre:enhancement:1'&&
 row.operation==='GRANT_ABILITY'&&row.targetAbilityId==='core-deep-strike');
function assertStudentPairs(projection,pairs){
 for(const unit of projection.units){
  const expectedSources=Object.entries(pairs).filter(([,recipients])=>recipients.includes(unit.instanceId)).map(([source])=>source).sort();
  const grants=studentGrantRows(unit);
  assert.deepEqual(grants.map(row=>row.sourceInstanceId).sort(),expectedSources,'Exact independent physical source provenance for '+unit.instanceId);
  assert.equal((unit.abilities||[]).filter(a=>a.canonicalId==='core-deep-strike').length,expectedSources.length?1:0,'One canonical Deep Strike ability irrespective of source count');
  for(const row of grants){
   assert.equal(row.targetInstanceId,unit.instanceId);assert.deepEqual(row.sourceFields,[['text']]);
   const owner=projection.units.find(source=>source.instanceId===row.sourceInstanceId);
   assert.equal(row.sourceCompositionId,owner.enhancementAssignments[0].modelScopeId,'Grant retains exact Enhancement MODEL source');
   assert.equal(row.targetModelInstanceId,null,'UNIT ability is not a grant to every MODEL');
  }
 }
}
test('student-multiple-physical-source-provenance-remains-explicit',()=>{
 const text=header(['Auxiliary Cadre'])+fixture('unit-kroot-trail-shaper',{enhancement:'Student of Kauyon'}).text+
  fixture('unit-kroot-war-shaper',{enhancement:'Student of Kauyon'}).text+fixture('unit-kroot-carnivores').text+fixture('unit-kroot-farstalkers').text;
 const service=make(),state=ready(text,{},service).roster,run=runtime(state);
 let inventory=setTauStudentChoice(book,state,'parsed-unit-1',['parsed-unit-3']);
 inventory=setTauStudentChoice(book,inventory,'parsed-unit-2',['parsed-unit-4']);
 assert.deepEqual(make().load(inventory),inventory,'Distinct source decisions save as physical inventory');
 run.load(inventory);
 assertStudentPairs(run.projection,{'parsed-unit-1':['parsed-unit-3'],'parsed-unit-2':['parsed-unit-4']});
 const saved=run.snapshot(),effective=clone(run.projection);
 negative('student-source-removed-with-stale-choice',()=>{const bad=clone(saved);bad.units[0].enhancementIds=[];bad.units[0].enhancementAssignments=[];bad.units[0].mfmEnhancementRecordIds=[];assert.throws(()=>run.load(bad),/Student of Kauyon requires/);assert.deepEqual(run.snapshot(),saved,'Stale source edit is rejected atomically');});
 assert.deepEqual(runtime(saved).projection,effective,'Multiple-source grants survive snapshot/load');
 run.load(saved);assert.deepEqual(run.projection,effective,'Recompute never accumulates source grants');
 service.load(saved);assert.deepEqual(ready(text,{},service).roster,saved,'Same-input reimport preserves exact source choices');
 assert.deepEqual(runtime(service.snapshot()).projection,effective,'Reimport preserves exact computed provenance');
 run.setStudentChoice('parsed-unit-2',['parsed-unit-3']);
 assertStudentPairs(run.projection,{'parsed-unit-1':['parsed-unit-3'],'parsed-unit-2':['parsed-unit-3']});
 run.setStudentChoice('parsed-unit-1',[]);
 assertStudentPairs(run.projection,{'parsed-unit-2':['parsed-unit-3']});
 run.setStudentChoice('parsed-unit-2',['parsed-unit-4']);
 assertStudentPairs(run.projection,{'parsed-unit-2':['parsed-unit-4']});
 run.setStudentChoice('parsed-unit-1',['parsed-unit-3']);
 const removal=run.snapshot(),source=removal.units[0];
 source.enhancementIds=[];source.enhancementAssignments=[];source.mfmEnhancementRecordIds=[];source.selectedTauSourceChoiceIds=[];
 for(const container of [source,...source.modelRows,...source.modelRows.flatMap(row=>row.loadouts||[])])
  container.selections=container.selections.filter(selection=>!selection.recipientInstanceIds);
 run.load(removal);assertStudentPairs(run.projection,{'parsed-unit-2':['parsed-unit-4']});
 run.load(saved);assertStudentPairs(run.projection,{'parsed-unit-1':['parsed-unit-3'],'parsed-unit-2':['parsed-unit-4']});
 const removedPhysicalSource=clone(saved);removedPhysicalSource.units=removedPhysicalSource.units.filter(unit=>unit.instanceId!=='parsed-unit-1');
 run.load(removedPhysicalSource);assertStudentPairs(run.projection,{'parsed-unit-2':['parsed-unit-4']});
 run.load(saved);assertStudentPairs(run.projection,{'parsed-unit-1':['parsed-unit-3'],'parsed-unit-2':['parsed-unit-4']});
 run.setStudentChoice('parsed-unit-1',[]);run.setStudentChoice('parsed-unit-2',[]);assertStudentPairs(run.projection,{});
 records.runtimeCases.push({id:'student-independent-multiple-source-recipients',source:'detachment-auxiliary-cadre:enhancement:1',
  expected:{'parsed-unit-1':['parsed-unit-3'],'parsed-unit-2':['parsed-unit-4']},
  actual:Object.fromEntries(effective.units.filter(u=>studentGrantRows(u).length).map(u=>[u.instanceId,studentGrantRows(u).map(r=>r.sourceInstanceId)])),status:'PASS'});
 records.fixtures.push({id:'student-independent-sources',text,expected:[{source:'parsed-unit-1',recipientInstanceIds:['parsed-unit-3']},{source:'parsed-unit-2',recipientInstanceIds:['parsed-unit-4']}]});
});

test('stage4b-independent-marker-and-student-mutation-controls',()=>{
 const diagnostic=(domain,state)=>{const service=createRosterRuntime(domain,createTauRuleSchema({bindContext:tauSourceChoiceContext(domain,state)}));service.load(state);return service.projection;};
 const id='unit-commander-in-coldstar-battlesuit',text=header()+fixture(id,{equipment:'1x Marker Drone'}).text+fixture(id).text;
 const state=ready(text).roster,baseline=runtime(ready(header()+fixture(id).text+fixture(id).text).roster).projection;
 const local=markerOccurrences.find(row=>row.unitId===id).optionId;
 const assertMarkerDomain=domain=>{
  const rule=domain.entities.find(entity=>entity.id===local),clause=rule.ruleContract.clauses.find(clause=>clause.id==='marker-drone-physical-unit');
  assert.ok(clause,'Every source-backed occurrence requires its reference clause');
  assert.equal(rule.ruleContract.clauses.filter(row=>row.id==='marker-drone-physical-unit').length,1,'No duplicated physical equipment reference clause');
  assert.ok(rule.ruleContract.canonicalRuleReferences.includes(markerId),'One canonical generic factual owner');
  const effect=clause.rosterEffects[0];
  assert.equal(effect.referencedRuleId,markerId,'Exact generic Marker identity');
  assert.equal(effect.sourceRuleEvidence.evidence.otherEntityId,markerId,'Reference resolves the one generic source');
  assert.equal(effect.sourceRuleEvidence.evidence.quote,'The bearer’s unit has the MARKERLIGHT keyword','Only the static keyword clause is executable');
  assert.ok(index.get(markerId).data.text.includes(effect.sourceRuleEvidence.evidence.quote));
  assert.deepEqual(domain.entities.find(entity=>entity.id===markerId).data,index.get(markerId).data,'Full original source including conditional Observer permission remains unchanged');
  assert.deepEqual(effect.provenance.sourceEvidence,index.get(markerId).provenance,'Reference retains exact source provenance');
  const projection=diagnostic(domain,state);assertMarkerOnly(projection,'parsed-unit-1',baseline);
 };
 assertMarkerDomain(book);
 for(const [id,mutate]of [
  ['marker-removed-executable-reference',rule=>rule.ruleContract.clauses=rule.ruleContract.clauses.filter(clause=>clause.id!=='marker-drone-physical-unit')],
  ['marker-wrong-generic-root',rule=>rule.ruleContract.canonicalRuleReferences=['drone-shield-drone']],
  ['marker-wrong-root-provenance',rule=>rule.ruleContract.clauses.find(c=>c.id==='marker-drone-physical-unit').rosterEffects[0].provenance.sourceEvidence.sourceId='foreign-source'],
  ['marker-wrong-field-gate',rule=>rule.ruleContract.clauses.find(c=>c.id==='marker-drone-physical-unit').rosterEffects[0].conditions[0].predicate.arguments.equals=false],
  ['marker-wrong-keyword',rule=>rule.ruleContract.clauses.find(c=>c.id==='marker-drone-physical-unit').rosterEffects[0].keyword='FLY'],
  ['marker-duplicate-reference',rule=>rule.ruleContract.clauses.push(clone(rule.ruleContract.clauses.find(c=>c.id==='marker-drone-physical-unit')))]
 ])mutation(id,()=>{const bad=clone(book);mutate(bad.entities.find(entity=>entity.id===local));assert.throws(()=>assertMarkerDomain(bad),'Independent source/recipient oracle must reject mutation');});
 const studentText=header(['Auxiliary Cadre'])+fixture('unit-kroot-trail-shaper',{enhancement:'Student of Kauyon'}).text+
  fixture('unit-kroot-war-shaper',{enhancement:'Student of Kauyon'}).text+fixture('unit-kroot-carnivores').text+fixture('unit-kroot-farstalkers').text;
 let choices=ready(studentText).roster;
 choices=setTauStudentChoice(book,choices,'parsed-unit-1',['parsed-unit-3']);choices=setTauStudentChoice(book,choices,'parsed-unit-2',['parsed-unit-4']);
 const paired=bindTauStudentPairs(book,choices),ruleId='detachment-auxiliary-cadre:enhancement:1';
 const pairEffects=domain=>domain.entities.find(entity=>entity.id===ruleId).ruleContract.clauses.flatMap(clause=>clause.rosterEffects||[]).filter(effect=>effect.operation==='GRANT_ABILITY');
 const assertPairs=domain=>assertStudentPairs(diagnostic(domain,choices),{'parsed-unit-1':['parsed-unit-3'],'parsed-unit-2':['parsed-unit-4']});
 assertPairs(paired);assert.equal(pairEffects(paired).length,2,'One derived executable pair per selected source and recipient');
 for(const [id,mutate]of [
  ['student-remove-pair-binding',domain=>domain.entities.find(entity=>entity.id===ruleId).ruleContract.clauses=domain.entities.find(entity=>entity.id===ruleId).ruleContract.clauses.filter(clause=>!(clause.rosterEffects||[]).some(effect=>effect.operation==='GRANT_ABILITY'))],
  ['student-missing-source-gate',domain=>pairEffects(domain).forEach(effect=>effect.conditions=effect.conditions.filter(condition=>condition.binding!=='SOURCE'))],
  ['student-missing-target-gate',domain=>pairEffects(domain).forEach(effect=>effect.conditions=effect.conditions.filter(condition=>condition.binding!=='TARGET'))],
  ['student-wrong-source-instance',domain=>pairEffects(domain)[0].conditions.find(condition=>condition.binding==='SOURCE').predicate.arguments.equals='foreign-source'],
  ['student-wrong-target-instance',domain=>pairEffects(domain)[0].conditions.find(condition=>condition.binding==='TARGET').predicate.arguments.equals='parsed-unit-4'],
  ['student-wrong-ability',domain=>pairEffects(domain)[0].ability.canonicalId='core-infiltrators']
 ])mutation(id,()=>{const bad=clone(paired);mutate(bad);assert.throws(()=>assertPairs(bad),'Independent physical source-to-recipient ledger must reject mutation');});
});

test('native-core-reference-bags-preserved-through-import',()=>{
 const expected=read('./rule-contract-expectations.json').nativeExpectations.filter(seed=>seed.targetId.startsWith('core-'));
 assert.ok(Array.isArray(expected),'Existing independent native expectation inventory');
 const state=ready(header()+units.map(u=>fixture(u.id).text).join('\n')).roster,formed=formRoster(book,state);
 let found=0;
 for(const seed of expected){
  const physical=formed.units.find(u=>u.canonicalUnitId===seed.ownerId);assert.ok(physical);
  for(const profile of physical.profiles.filter(p=>seed.modelProfileIds.includes(p.canonicalProfileId))){
   const ability=profile.abilities.find(a=>a.canonicalId===seed.targetId&&JSON.stringify(a.parameters)===JSON.stringify(seed.parameters));
   assert.ok(ability,seed.canonicalId+' native identity/parameters lost in physical MODEL ability bag');
  }
  found++;
 }
 assert.equal(found,74);records.nativeCoreReferences=found;
});

test('negative-invalid-import-never-replaces-valid-saved-state',()=>{
 const service=make(),text=header()+fixture('unit-cadre-fireblade',{weapons:true}).text;
 const valid=ready(text,{},service).roster,beforeProjection=runtime(valid).projection;
 for(const [id,bad,bindings]of [
  ['foreign-faction',text.replace('T’au Empire','Death Guard'),{}],
  ['unknown-unit',header()+'1x Imaginary tau warrior (100 pts)\n',{}],
  ['unknown-weapon',text.replace(index.get(index.get('unit-cadre-fireblade').data.weaponIds[0]).data.name,'Imaginary plasma knife'),{}],
  ['wrong-canonical-selection',text,{selections:{'parsed-unit-1/model-row/1/selection/1':{canonicalProfileIds:['datasheet-devilfish:weapon:1'],canonicalEquipmentIds:[]}}}],
  ['unsupported-physical-weapon-instance-choice',text,{weaponChoices:{'parsed-unit-1':'foreign-weapon-occurrence'}}]
 ])negative(id,()=>{const out=service.import(bad,bindings);assert.notEqual(out.status,'READY');assert.deepEqual(service.state,valid);assert.deepEqual(runtime(service.state).projection,beforeProjection,'Rejected import never applies effects to saved roster');});
 for(const [id,mutate]of [
  ['wrong-model-owner',state=>state.units[0].modelRows[0].canonicalProfileId='datasheet-devilfish:profile:1'],
  ['wrong-composition-owner',state=>state.units[0].modelRows[0].compositionMemberId='datasheet-devilfish:composition:1'],
  ['duplicated-quantity',state=>state.units[0].modelRows[0].selections[0].physicalQuantity=2],
  ['missing-native-source',state=>state.units[0].modelRows[0].sourceRuleReferenceIds=[]],
  ['wrong-mfm-source-id',state=>state.units[0].mfmUnitRecordId='foreign-mfm-owner']
 ])mutation(id,()=>{const bad=clone(valid);mutate(bad);assert.throws(()=>service.load(bad));assert.deepEqual(service.state,valid);});
});

test('stage4-original20-scenario-identities-and-independent-expectations-unchanged',()=>{
 // Pinned to the original Stage4 reviewed scenario records, not contracts or
 // a desired Stage4B status distribution. Additional controls stay separate.
 const expectedFingerprint='6C84C061158673553A34992D6B0F55B8328437C6D191CC3764FC1785803DCB83';
 assert.equal(records.runtimeCases.length,20);
 const fingerprint=createHash('sha256').update(JSON.stringify(records.runtimeCases.map(({id,expected})=>({id,expected})))).digest('hex').toUpperCase();
 assert.equal(fingerprint,expectedFingerprint,'Original ordered scenario IDs and EXPECTED must remain unchanged');
 const originallyBlocked=new Set(['marker-drone-unit-grant','shield-drone-selected-physical-model-wounds',
  'prototype-Thermoneutronic Projector','prototype-Plasma Accelerator Rifle','prototype-Supernova Launcher',
  'student-independent-multiple-source-recipients']);
 records.originalScenarioComparison=records.runtimeCases.map(row=>({id:row.id,before:originallyBlocked.has(row.id)?'BLOCKED':'PASS',after:row.status}));
 records.originalScenarioExpectedFingerprint=fingerprint;
});

assert.deepEqual(book,original,'QA/import/runtime must not mutate canonical source-owned book');
records.runtimeDenominator={total:records.runtimeCases.length,pass:records.runtimeCases.filter(row=>row.status==='PASS').length,
 blocked:records.runtimeCases.filter(row=>row.status==='BLOCKED').length,fail:records.runtimeCases.filter(row=>row.status==='FAIL').length};
records.status=records.checks.some(row=>row.status==='FAIL')?'FAIL':records.runtimeDenominator.blocked?'PASS_WITH_BLOCKED_REQUIREMENTS':'PASS';records.checkCount=checks;
records.physicalDatasheets=43;records.detachments=7;records.enhancements=23;
const evidenceIndex=process.argv.indexOf('--evidence');
if(evidenceIndex!==-1){
 const directory=path.resolve(process.argv[evidenceIndex+1]);fs.mkdirSync(directory,{recursive:true});
 for(const fixture of records.fixtures)fs.writeFileSync(path.join(directory,fixture.id+'.txt'),fixture.text);
 fs.writeFileSync(path.join(directory,'roster-import-qa.json'),JSON.stringify(records,null,2)+'\n');
}
console.log(JSON.stringify({...records,fixtures:records.fixtures.map(f=>({id:f.id,physicalUnits:f.expected.length}))}));
if(records.status==='FAIL')process.exitCode=1;
