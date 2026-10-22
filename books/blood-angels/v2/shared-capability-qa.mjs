/** Source-first controls for exactly seventeen reviewed capability-gap clauses.
 * Constructed diagnostic inputs exercise physical import; they are neither
 * authenticated New Recruit exports nor proof of complete army legality. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildBloodAngelsContracts} from './rule-contract-build.mjs';
import {conditionalPolicyDeclarations} from './conditional-policy-declarations.mjs';
import {buildBloodAngelsRosterBook} from './roster-build.mjs';
import {createBloodAngelsRosterService} from './roster-import.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {projectInstanceCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {projectEffectiveInstance} from '../../shared/roster-v2/effective-instance.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const ID={captain:'unit-ba-09adea2bf319462fb4ed',dcCaptain:'unit-ba-014cc7b19aca4d5b84a3',
 dc:'unit-ba-548417d73e544f7f920e',ordinary:'unit-sm-59162946fee84360',smCaptain:'unit-sm-99eb03d4f2d448e2',
 engines:'unit-ba-56917c1cd6a94406970f',advance:'ability-ba-16b14dac906045e3a48b',
 legacy:'detachment-rule-ba-10c56bef78b24440bb5f',blazing:'enhancement-ba-3f19e1f57dd94fcc92ae',
 interception:'enhancement-ba-9b2691d5805d46df9b88',defaultDet:'detachment-sm-6341f5a9b9584677'};
const EXPECT={
 [ID.advance]:{quote:'Overcharged Engines: This unit can re-roll advance rolls.',kind:'REROLL',payload:{roll:'ADVANCE',results:'ALL'}},
 [ID.blazing]:{quote:'Enemy units cannot target this unit with snap shooting attacks.',kind:'ATTACK_TARGET_RESTRICTION',
  payload:{action:'PROHIBIT',attackKind:'SNAP_SHOOTING',referenceId:'core-rule-15-09-snap-shooting'}},
 [ID.interception]:{quote:'When you target this unit with the Heroic Intervention stratagem, that use is -1 CP.',kind:'ACTION_CP_MODIFIER',
  payload:{action:'HEROIC_INTERVENTION',mode:'ADD',value:-1,referenceId:'core-rule-15-11-heroic-intervention'}}
};

export function runBloodAngelsSharedCapabilityQA(){
 const review=read('./shared-capability-review.json'),ledger=read('./rule-clause-review.json'),built=buildBloodAngelsContracts();
 const book=buildBloodAngelsRosterBook({built}),index=new Map(book.entities.map(e=>[e.id,e]));
 const newIds=new Set(review.records.filter(row=>row.newStructuredPolicy).map(row=>row.recordId));
 const checks=[],mutations=[],physical=[];
 const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});process.stderr.write(id+' PASS\n');};
 const policies=(service,instance,rule)=>service.projection.units.find(u=>u.instanceId===instance).conditional.filter(row=>row.policy&&(!rule||row.ruleId===rule));
 const strip=value=>{const result=clone(value);for(const unit of result.units)unit.conditional=unit.conditional.filter(row=>!newIds.has(row.clauseId));return result;};
 const withoutNew=clone(book);
 for(const entity of withoutNew.entities)for(const clause of entity.ruleContract?.clauses||[])if(newIds.has(clause.id))delete clause.conditionalPolicy;
 const fixture=(id,{enhancement}={})=>{
  const composition=book.importBindings.compositions.filter(row=>row.ownerId===id&&row.quantity.min>0);
  assert.ok(composition.length,'Missing independent physical source composition');
  const count=composition.reduce((sum,row)=>sum+row.quantity.min,0);
  return count+'x '+index.get(id).data.title+' (9999 pts)\n'+composition.map(row=>'• '+row.quantity.min+'x '+index.get(row.id).data.name+'\n').join('')+
   (enhancement?'Enhancement: '+index.get(enhancement).data.title+'\n':'');
 };
 const header=det=>'+ FACTION KEYWORD: Blood Angels\n+ DETACHMENT: '+index.get(det).data.title+'\n';
 const ready=(service,text,bindings={},options)=>{const result=service.import(text,bindings,options);assert.equal(result.status,'READY',JSON.stringify({errors:result.errors,needs:result.needsBindings}));return result;};
 const imported=(text)=>{const service=createBloodAngelsRosterService(book);ready(service,text);return service;};
 const parity=service=>{
  const off=createBloodAngelsRosterService(withoutNew);off.load(service.snapshot());
  assert.deepEqual(strip(service.projection),off.projection,'Conditional metadata changed values, inventory, recipients, applied traces or old policies');
  assert.deepEqual(service.points,off.points,'Conditional policy changed MFM/paid-equipment pricing');
  for(const unit of service.projection.units)for(const row of unit.conditional.filter(row=>newIds.has(row.clauseId))){
   assert.equal(row.state,'UNKNOWN');assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert.ok(row.sourceProvenance.sourceId);
   assert.equal(unit.applied.filter(effect=>effect.clauseId===row.clauseId).length,0,'Conditional permission was executed');
  }
 };
 const reload=service=>{
  const before=clone(service.projection),points=clone(service.points),snapshot=service.snapshot();
  service.recompute();assert.deepEqual(service.projection,before);assert.deepEqual(service.points,points);
  const other=createBloodAngelsRosterService(book);other.load(JSON.parse(JSON.stringify(snapshot)));
  assert.deepEqual(other.projection,before);assert.deepEqual(other.points,points);parity(service);
 };

 check('17-source-identities-and-unchanged-233-clause-census',()=>{
  assert.equal(review.records.length,17);assert.equal(new Set(review.records.map(row=>row.recordId)).size,17);
  assert.deepEqual(review.globalClauseCensusBefore,review.globalClauseCensusAfter);
  assert.deepEqual(built.artifact.coverage.classifications,{TEXT_ONLY_SOURCE_BACKED:187,NOT_PROVEN:9,EXECUTABLE_PROVEN:37});
  assert.equal(ledger.records.length,233);assert.equal(newIds.size,5);
  let conditional=0;
  for(const row of review.records){const source=ledger.records.find(item=>item.id===row.recordId),entity=index.get(row.canonicalId);
   assert.ok(source);assert.equal(source.status,'TEXT_ONLY_SOURCE_BACKED');assert.equal(source.quote,row.quote);
   assert.equal(source.sourceEntityId,row.sourceEntityId);assert.deepEqual(entity.provenance,row.sourceProvenance);
   assert.equal(entity.data.text,row.fullContext);assert.equal(row.executable,false);
   const clause=entity.ruleContract.clauses.find(item=>item.id===row.recordId);assert.ok(clause);assert.equal(clause.rosterEffects.length,0);
   if(row.capabilityStatusAfter==='CONDITIONAL_TEXT_ONLY'){assert.ok(clause.conditionalPolicy);conditional++;}
   else assert.equal(clause.conditionalPolicy,undefined,'A doctrine fragment was silently automated');
  }
  assert.equal(conditional,13);assert.equal(conditionalPolicyDeclarations.length,13);
 });
 check('eight-existing-conditional-policies-retain-exact-payloads',()=>{
  const expected=[
   ...['1d205c52ba9d49fbbcfd','72b0b3cfecf1494fab5e','9c4c7122376a4a73b2b0','dde72ebbc35a41cba614','de9ed78c7327410a8010'].map(id=>({rule:'ability-ba-'+id,kind:'REROLL',payload:{roll:'HIT',results:'ONES',weaponMode:'melee'}})),
   {rule:'ability-ba-44df419581d3449eaff9',kind:'INCOMING_MODIFIER',payload:{field:'DAMAGE',mode:'ADD',value:-1}},
   {rule:'ability-ba-458e6e2c7c07492ea9ca',kind:'INCOMING_MODIFIER',payload:{field:'HIT_ROLL',mode:'ADD',value:-1,weaponMode:'melee'}},
   {rule:'ability-ba-cfcc3c874e5644a8adb5',kind:'INCOMING_MODIFIER',payload:{field:'WOUND_ROLL',mode:'ADD',value:-1,comparison:'ATTACK_STRENGTH_GT_TARGET_TOUGHNESS'}}
  ];
  for(const proof of expected){const rows=index.get(proof.rule).ruleContract.clauses.filter(clause=>clause.conditionalPolicy);assert.equal(rows.length,1);
   assert.equal(rows[0].conditionalPolicy.kind,proof.kind);assert.equal(rows[0].conditionalPolicy.recipientScope,'FORMED_UNIT');assert.deepEqual(rows[0].conditionalPolicy.payload,proof.payload);}
 });
 check('advance-reroll-repeated-physical-sources-no-peer-numeric-change',()=>{
  const text=header(ID.defaultDet)+fixture(ID.engines)+fixture(ID.engines)+fixture(ID.ordinary),service=imported(text);
  for(const id of ['parsed-unit-1','parsed-unit-2']){const rows=policies(service,id,ID.advance);assert.equal(rows.length,1);assert.equal(rows[0].sourceInstanceId,id);
   assert.equal(rows[0].policy.kind,EXPECT[ID.advance].kind);assert.deepEqual(rows[0].policy.payload,EXPECT[ID.advance].payload);assert.equal(rows[0].policy.evidence.quote,EXPECT[ID.advance].quote);}
  assert.equal(policies(service,'parsed-unit-3',ID.advance).length,0);const snapshot=service.snapshot();ready(service,text);assert.deepEqual(service.snapshot(),snapshot);reload(service);
  physical.push({case:'Advance',recipients:['parsed-unit-1','parsed-unit-2'],negative:'parsed-unit-3',status:'PASS'});
 });
 const legacyDet=index.get(ID.legacy).parentId;
 check('legacy-both-keywords-formed-unit-detach-reattach-and-no-model-keyword-grant',()=>{
  const text=header(legacyDet)+fixture(ID.captain)+fixture(ID.ordinary)+fixture(ID.ordinary)+fixture(ID.smCaptain),service=imported(text);
  assert.equal(policies(service,'parsed-unit-1',ID.legacy).length,2);
  for(const id of ['parsed-unit-2','parsed-unit-3','parsed-unit-4'])assert.equal(policies(service,id,ID.legacy).length,0,'Generic/CHARACTER-only UNIT qualified');
  const keywords=clone(service.projection.units[1].profiles.map(profile=>profile.keywords));service.attach('parsed-unit-1','parsed-unit-2');
  for(const id of ['parsed-unit-1','parsed-unit-2']){const rows=policies(service,id,ID.legacy);assert.equal(rows.length,2);
   assert.deepEqual(rows.map(row=>row.policy.payload).sort((a,b)=>a.roll.localeCompare(b.roll)),[{roll:'HIT',results:'ONES'},{roll:'WOUND',results:'ONES'}]);
   for(const row of rows){assert.equal(row.sourceInstanceId,null);assert.equal(row.sourceModelScopeId,null);assert.deepEqual(new Set(row.recipientInstanceIds),new Set(['parsed-unit-1','parsed-unit-2']));}}
  assert.deepEqual(service.projection.units[1].profiles.map(profile=>profile.keywords),keywords);
  assert.ok(!service.projection.units[1].keywords.includes('BLOOD ANGELS'),'Intrinsic generic UNIT acquired a Chapter');
  assert.equal(policies(service,'parsed-unit-3',ID.legacy).length,0);reload(service);
  const snapshot=service.snapshot();ready(service,text);assert.deepEqual(service.snapshot(),snapshot,'Reimport lost attached formation');
  service.detach('parsed-unit-1');assert.equal(policies(service,'parsed-unit-2',ID.legacy).length,0);
  service.reattach('parsed-unit-1','parsed-unit-3');assert.equal(policies(service,'parsed-unit-3',ID.legacy).length,2);assert.equal(policies(service,'parsed-unit-2',ID.legacy).length,0);reload(service);
  physical.push({case:'Legacy',positive:'BA Captain + generic Intercessors formed UNIT',negative:'SM Captain + generic/generic-only/wrong Detachment',status:'PASS'});
 });
 check('legacy-wrong-detachment-generic-only-and-foreign-chapter-fail-closed',()=>{
  const wrong=imported(header(ID.defaultDet)+fixture(ID.captain)+fixture(ID.ordinary));wrong.attach('parsed-unit-1','parsed-unit-2');assert.ok(wrong.projection.units.every(unit=>!unit.conditional.some(row=>row.ruleId===ID.legacy)));parity(wrong);
  const generic=imported(header(legacyDet)+fixture(ID.smCaptain)+fixture(ID.ordinary));generic.attach('parsed-unit-1','parsed-unit-2');assert.ok(generic.projection.units.every(unit=>!unit.conditional.some(row=>row.ruleId===ID.legacy)));reload(generic);
  const saved=generic.snapshot();assert.notEqual(generic.import(header(legacyDet)+'1x Azrael (9999 pts)\n',{}, {replaceExisting:true}).status,'READY');assert.deepEqual(generic.snapshot(),saved);
 });

 const enhancementCases=[{id:ID.blazing,source:ID.captain,bodyguard:ID.ordinary},{id:ID.interception,source:ID.dcCaptain,bodyguard:ID.dc}];
 for(const row of enhancementCases)check('exact-enhancement-bearer-formation-and-negative-controls/'+row.id,()=>{
  const source=index.get(row.id),expected=EXPECT[row.id],text=header(source.parentId)+fixture(row.source,{enhancement:row.id})+fixture(row.bodyguard)+fixture(row.source);
  const service=imported(text),owner=service.state.units[0];assert.equal(owner.enhancementAssignments.length,1);const scope=owner.enhancementAssignments[0].modelScopeId;
  const first=policies(service,'parsed-unit-1',row.id);assert.equal(first.length,1);assert.equal(first[0].sourceModelScopeId,scope);assert.equal(first[0].sourceInstanceId,'parsed-unit-1');assert.equal(first[0].policy.kind,expected.kind);assert.deepEqual(first[0].policy.payload,expected.payload);assert.equal(first[0].policy.evidence.quote,expected.quote);
  assert.equal(policies(service,'parsed-unit-2',row.id).length,0);assert.equal(policies(service,'parsed-unit-3',row.id).length,0);
  service.attach('parsed-unit-1','parsed-unit-2');assert.equal(policies(service,'parsed-unit-2',row.id).length,1);assert.equal(policies(service,'parsed-unit-2',row.id)[0].sourceModelScopeId,scope);reload(service);
  const saved=service.snapshot();ready(service,text);assert.deepEqual(service.snapshot(),saved);
  const corrupt=clone(saved);corrupt.units[0].enhancementAssignments[0].modelScopeId='foreign-physical-MODEL';assert.throws(()=>service.load(corrupt));assert.deepEqual(service.snapshot(),saved);
  const changed=header(source.parentId)+fixture(row.source)+fixture(row.bodyguard)+fixture(row.source);
  assert.equal(service.import(changed).status,'REPLACEMENT_REQUIRED');assert.deepEqual(service.snapshot(),saved);
  ready(service,changed,{}, {replaceExisting:true});assert.ok(service.projection.units.every(unit=>!unit.conditional.some(policy=>policy.ruleId===row.id)),'Unassigned policy persisted');reload(service);
  physical.push({case:row.id,bearer:scope,recipient:'Exact assigned bearer UNIT or current formation',negative:'Unassigned/repeated/foreign MODEL',status:'PASS'});
 });
 check('enhancement-wrong-detachment-and-wrong-bearer-do-not-replace-prior-roster',()=>{
  const service=imported(header(ID.defaultDet)+fixture(ID.ordinary)),before=service.snapshot();
  for(const text of [header(ID.defaultDet)+fixture(ID.captain,{enhancement:ID.blazing}),header(index.get(ID.interception).parentId)+fixture(ID.captain,{enhancement:ID.interception})]){
   assert.notEqual(service.import(text,{}, {replaceExisting:true}).status,'READY');assert.deepEqual(service.snapshot(),before);
  }
 });
 check('conditional-policies-have-canonical-core-actions-not-swapped-stratagem-recipients',()=>{
  const core=createEffectiveCoreCatalog();
  for(const {id}of enhancementCases){const policy=index.get(id).ruleContract.clauses.find(row=>row.conditionalPolicy).conditionalPolicy,reference=core.getById(EXPECT[id].payload.referenceId);
   assert.equal(reference.state,'FULL_CONTENT');assert.equal(policy.coreReference.canonicalId,reference.id);assert.equal(policy.coreReference.quote,reference.semanticContent);assert.deepEqual(policy.coreReference.sourceContentHashes,reference.sourceContentHashes);assert.deepEqual(policy.coreReference.provenance,reference.provenance);
   assert.notEqual(policy.kind,'STRATAGEM_TARGET_RESTRICTION');assert.notEqual(policy.payload.referenceId,'core-stratagem-fire-overwatch');
  }
 });
 check('effective-and-personal-guide-preserve-unknown-state-and-canonical-source',()=>{
  const payload=buildGameplayPresentation(built),cards=new Map(payload.cards.map(card=>[card.id,card]));
  for(const config of [{rule:ID.advance,det:ID.defaultDet,unit:ID.engines},{rule:ID.legacy,det:legacyDet,unit:ID.captain},...enhancementCases.map(row=>({rule:row.id,det:index.get(row.id).parentId,unit:row.source,enhancement:row.id}))]){
   const service=imported(header(config.det)+fixture(config.unit,{enhancement:config.enhancement})),instance=service.state.units[0],effective=service.effective(instance.instanceId);
   const rows=effective.conditional.filter(row=>row.ruleId===config.rule&&row.policy);assert.ok(rows.length);for(const policy of rows){assert.equal(policy.execution,'CONDITIONAL_TEXT_ONLY');assert.equal(policy.state,'UNKNOWN');assert.deepEqual(policy.sourceProvenance,index.get(config.rule).provenance);assert.ok(policy.sourceLabel);}
   const variants=projectInstanceCards(cards,instance,effective),root=variants.get(instance.canonicalUnitId)[0];
   assert.equal(root.rosterConditionalPolicies.filter(row=>row.ruleId===config.rule).length,rows.length);assert.equal(projectPersonalBook(payload,service.state).instances.length,1);parity(service);
  }
 });
 check('frozen-core-action-identity-and-content-hash-mutations-rejected-by-producer',()=>{
  for(const id of [ID.blazing,ID.interception])for(const key of ['id','code','sourceContentHash','quote']){
   const declarations=clone(conditionalPolicyDeclarations),declaration=declarations.find(row=>row.recordId.includes(id));
   declaration.coreDependency[key]=key==='sourceContentHash'?'0'.repeat(64):'unaccepted-source-identity';
   assert.throws(()=>buildBloodAngelsContracts({conditionalInputs:declarations}),undefined,'Unproved Core '+key+' accepted');mutations.push({ruleId:id,field:'coreDependency.'+key,status:'REJECTED'});
  }
 });
 check('null-detachment-source-presentation-rejects-forged-owner-and-physical-policy',()=>{
  const payload=buildGameplayPresentation(built),cards=new Map(payload.cards.map(card=>[card.id,card]));
  const service=imported(header(legacyDet)+fixture(ID.captain)),instance=service.state.units[0],effective=service.effective(instance.instanceId);
  assert.ok(projectInstanceCards(cards,instance,effective).get(instance.canonicalUnitId)[0].rosterConditionalPolicies.some(row=>row.ruleId===ID.legacy&&row.sourceInstanceId===null));
  for(const [name,change]of [['canonical-identity',card=>card.identity.canonicalId='foreign-rule'],['registry-owner',card=>card.identity.registryId='foreign-owner'],['source-provenance',card=>card.provenance.sourceId='invented-source'],['parent-kind',card=>card.parentId=ID.captain]]){
   const altered=new Map(cards),rule=clone(altered.get(ID.legacy));change(rule);altered.set(ID.legacy,rule);
   assert.throws(()=>projectInstanceCards(altered,instance,effective));mutations.push({ruleId:ID.legacy,field:name,status:'REJECTED'});
  }
  const advance=imported(header(ID.defaultDet)+fixture(ID.engines)),physical=advance.state.units[0],forged=clone(advance.effective(physical.instanceId));
  const row=forged.conditional.find(item=>item.ruleId===ID.advance&&item.policy);row.sourceInstanceId=null;row.sourceModelScopeId=null;row.policy.recipientScope='ROSTER_UNITS';
  assert.throws(()=>projectInstanceCards(cards,physical,forged));mutations.push({ruleId:ID.advance,field:'physical-policy-null-source',status:'REJECTED'});
 });
 check('effective-core-source-quote-and-recipient-forgeries-rejected',()=>{
  for(const id of [ID.blazing,ID.interception]){
   const service=imported(header(index.get(id).parentId)+fixture(id===ID.blazing?ID.captain:ID.dcCaptain,{enhancement:id})+fixture(ID.ordinary));
   for(const [name,change]of [['quote',row=>row.policy.coreReference.quote='invented Core source text'],['identity',row=>row.policy.coreReference.canonicalId='core-stratagem-fire-overwatch'],['recipient',row=>row.recipientInstanceIds=['parsed-unit-2']],['bearer',row=>row.sourceModelScopeId='foreign-model']]){
    const projection=clone(service.projection),policy=projection.units[0].conditional.find(row=>row.ruleId===id&&row.policy);change(policy);
    assert.throws(()=>projectEffectiveInstance(book,projection,'parsed-unit-1'));mutations.push({ruleId:id,field:name,status:'REJECTED'});
   }
  }
 });
 return {status:'PASS',checks,physical,mutations,reviewedClauseCount:17,newExecutableClauses:0,newConditionalPolicies:5,
  clauseDisposition:{EXECUTABLE_PROVEN:0,CONDITIONAL_TEXT_ONLY:13,TEXT_ONLY_SOURCE_BACKED:4,NOT_PROVEN:0},
  globalClauseCensus:review.globalClauseCensusAfter,realNewRecruitExportTested:false,fixtureValidity:'CONSTRUCTED_DIAGNOSTIC_NOT_COMPLETE_ARMY_LEGALITY',
  browserAcceptance:'NOT_CLAIMED_BY_THIS_NATIVE_QA'};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(runBloodAngelsSharedCapabilityQA()));
