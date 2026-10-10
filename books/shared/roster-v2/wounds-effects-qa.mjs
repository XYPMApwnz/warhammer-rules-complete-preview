/** Standalone numeric MODEL controls. No army facts, declarations or UI. */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {changeAttachment,validateRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects,validateRosterEffects} from './effects.mjs';

const clone=value=>structuredClone(value),id=name=>'synthetic-wounds:'+name;
const evidence={field:['text'],quote:'The assigned eligible bearer gains one Wound.'};
const atom=(predicate,subject,arguments_)=>({predicate,subject,arguments:arguments_,contextLevel:'STATIC',evidence:clone(evidence)});
const evaluator=withRosterDetachments(createRuleContractSchema({}));
export function woundsFixture(parameters={field:'W',mode:'ADD',value:1}) {
  const entities=[{id:id('detachment'),kind:'DETACHMENT',data:{title:'Synthetic detachment'}}],rosterProfileBindings=[];
  for(const [name,profiles] of [['mixed',['bearer','sibling']],['receiver',['receiver-model']]]) {
    entities.push({id:id(name),kind:'DATASHEET',data:{title:name,profileIds:profiles.map(id),weaponIds:[],
      keywords:name==='mixed'?['CHARACTER']:['INFANTRY'],factionKeywords:[],ruleReferenceIds:[]}});
    for(const profile of profiles) {
      entities.push({id:id(profile),parentId:id(name),kind:'PROFILE',data:{name:profile,stats:{M:'6"',T:'4',W:'5',SV:'3+',LD:'6+',OC:'1'}}});
      rosterProfileBindings.push({unitId:id(name),profileId:id(profile),intrinsicKeywords:profile==='bearer'?['ELIGIBLE']:[],abilities:[],referenceIds:[]});
    }
  }
  const selector=atom('MODEL_KEYWORD','MODEL',{keyword:'ELIGIBLE'});
  // Assignment belongs to the physical unit; its eligible MODEL recipient is
  // selected independently. This deliberately exercises a mixed-profile unit.
  const ownerSelector=atom('UNIT_ID','UNIT',{id:id('mixed')});
  const role={id:'owner',subject:'UNIT',allegiance:'FRIENDLY',purpose:'OWNER',selector:ownerSelector,conditions:[]};
  const effect={id:id('effect'),operation:'MODIFY_STAT',...parameters,targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',
    conditions:[{binding:'TARGET',predicate:clone(selector)}],lifetime:'WHILE_ASSIGNED',sourceFields:[['text']],evidence:clone(evidence)};
  entities.push({id:id('enhancement'),parentId:id('detachment'),kind:'ENHANCEMENT',data:{text:evidence.quote},provenance:{sourceId:id('source')},
    ruleContract:{schema:'rule-contract/v2',ruleId:id('enhancement'),ownerId:id('detachment'),sourceId:id('source'),kind:'ENHANCEMENT',
      executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',detachmentId:id('detachment'),roles:[role],conditions:[],
      assignment:{ownerRoleId:'owner',selector:clone(ownerSelector)},sourceFields:[['text']],clauses:[{
        id:id('clause'),roles:[clone(role)],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]}});
  const book={bookId:id('book'),entities,rosterProfileBindings,rosterAttachmentPolicies:[{
    sourceId:id('mixed'),targetId:id('receiver'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  const unit=(instanceId,name)=>({instanceId,canonicalUnitId:id(name),startingStrength:name==='mixed'?2:1,
    modelRows:(name==='mixed'?['bearer','sibling']:['receiver-model']).map(profile=>({rowId:profile,canonicalProfileId:id(profile),quantity:1,selections:[],loadouts:[]})),
    selections:[],enhancementIds:instanceId==='a'?[id('enhancement')]:[],warlord:null});
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:id('roster'),detachments:[{instanceId:'d',canonicalDetachmentId:id('detachment')}],
    detachmentIds:[id('detachment')],units:[unit('a','mixed'),unit('b','mixed'),unit('bodyguard','receiver')],attachments:[],warlordInstanceId:null};
  return {book,state,effect};
}
export function runWounds(book,state,api=evaluator) {
  const before=JSON.stringify({book,state});
  api.validateContracts(book);validateRosterEffects(book,api.validatePredicate,api.evaluatePredicate);
  const result=executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),api);
  assert.equal(JSON.stringify({book,state}),before,'Canonical or imported data mutated');
  return result;
}
const model=(result,instance,profile)=>result.units.find(unit=>unit.instanceId===instance).profiles.find(row=>row.canonicalProfileId===id(profile));
export function verifyWounds(parameters={field:'W',mode:'ADD',value:1}) {
  const {book,state,effect}=woundsFixture(parameters),result=runWounds(book,state);
  assert.equal(model(result,'a','bearer').profile.stats.W,'6','Expected source-proven +1 W');
  assert.equal(model(result,'a','sibling').profile.stats.W,'5');
  assert.equal(model(result,'b','bearer').profile.stats.W,'5');
  assert.equal(model(result,'bodyguard','receiver-model').profile.stats.W,'5');
  const proof=result.units.find(unit=>unit.instanceId==='a').applied;
  assert.equal(proof.length,1);assert.equal(proof[0].ruleId,id('enhancement'));assert.equal(proof[0].sourceInstanceId,'a');
  assert.equal(proof[0].targetInstanceId,'a');assert.equal(proof[0].targetProfileId,id('bearer'));
  assert.equal(proof[0].targetCompositionId,model(result,'a','bearer').scopeId);
  assert.equal(proof[0].before,'5');assert.equal(proof[0].after,'6');assert.deepEqual(proof[0].targetFieldPath,['stats','W']);
  assert.deepEqual(proof[0].sourceFields,[['text']]);assert.equal(proof[0].lifetime,'WHILE_ASSIGNED');
  const removed=clone(state);removed.units[0].enhancementIds=[];
  assert.equal(model(runWounds(book,removed),'a','bearer').profile.stats.W,'5');
  removed.units[0].enhancementIds=[id('enhancement')];assert.deepEqual(runWounds(book,removed),result);
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard');
  const attachedResult=runWounds(book,attached);
  assert.equal(model(attachedResult,'a','bearer').profile.stats.W,'6');
  assert.equal(model(attachedResult,'a','sibling').profile.stats.W,'5');
  assert.equal(model(attachedResult,'bodyguard','receiver-model').profile.stats.W,'5');
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','a');
  assert.deepEqual(runWounds(book,detached),result);
  assert.deepEqual(runWounds(book,changeAttachment(book,detached,book.rosterAttachmentPolicies,'ATTACH','a','bodyguard')),attachedResult);
  const switched=clone(state),switchedBook=clone(book);switchedBook.entities.push({id:id('other-detachment'),kind:'DETACHMENT',data:{title:'Other synthetic detachment'}});
  switched.detachmentIds=[id('other-detachment')];switched.detachments=[{instanceId:'d',canonicalDetachmentId:id('other-detachment')}];
  assert.throws(()=>runWounds(switchedBook,switched),/Unresolved Enhancement context/);
  const ineligible=clone(book);ineligible.rosterProfileBindings.find(row=>row.profileId===id('bearer')).intrinsicKeywords=[];
  assert.equal(model(runWounds(ineligible,state),'a','bearer').profile.stats.W,'5');
  const flat=clone(book),flatProfile=flat.entities.find(row=>row.id===id('bearer'));Object.assign(flatProfile.data,flatProfile.data.stats);delete flatProfile.data.stats;
  assert.equal(model(runWounds(flat,state),'a','bearer').profile.W,'6');
  const composed=clone(book),clause=composed.entities.at(-1).ruleContract.clauses[0];
  clause.rosterEffects.push({...clone(effect),id:id('second'),value:2});
  assert.equal(model(runWounds(composed,state),'a','bearer').profile.stats.W,'8');
  for(const mutation of [{targetSubject:'UNIT',targetBinding:'SOURCE_UNIT'}, {value:0.5},{weaponMode:'melee'}]) {
    const invalid=clone(book);Object.assign(invalid.entities.at(-1).ruleContract.clauses[0].rosterEffects[0],mutation);
    assert.throws(()=>validateRosterEffects(invalid,evaluator.validatePredicate,evaluator.evaluatePredicate),/Invalid characteristic/);
  }
  const absent=clone(book);delete absent.entities.find(row=>row.id===id('bearer')).data.stats.W;
  assert.throws(()=>runWounds(absent,state),/Missing characteristic base/);
  const malformed=clone(book);malformed.entities.find(row=>row.id===id('bearer')).data.stats.W='unknown';
  assert.throws(()=>runWounds(malformed,state),/Unsupported characteristic expression/);
  const duplicateOwner=clone(book);duplicateOwner.entities.find(row=>row.id===id('bearer')).data.W='5';
  assert.throws(()=>runWounds(duplicateOwner,state),/Duplicate MODEL characteristic owner/);
  const sentinel=clone(book);sentinel.entities.find(row=>row.id===id('bearer')).data.stats.W='-';
  assert.equal(model(runWounds(sentinel,state),'a','bearer').profile.stats.W,'-');
  return {status:'PASS',mixedProfileScope:true,physicalInstanceIsolation:true,removeRestore:true,attachDetach:true,immutableFacts:true,composition:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const result=verifyWounds();
  assert.throws(()=>verifyWounds({field:'W',mode:'ADD',value:2}),/Expected source-proven/,'Wrong W modifier escaped focused QA');
  console.log(JSON.stringify({...result,wrongModifierMutationRejected:true,armyFactualImports:0}));
}
