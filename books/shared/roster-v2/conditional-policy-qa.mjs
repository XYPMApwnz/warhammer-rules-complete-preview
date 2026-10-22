/** Synthetic conditional-policy contract controls. No dice or source parsing.
 * Draft target location: books/shared/roster-v2/conditional-policy-qa.mjs.
 */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {validateRoster,withRosterDetachments,changeAttachment,formRoster} from './context.mjs';
import {validateRosterEffects,executeRosterEffects} from './effects.mjs';
import {projectEffectiveInstance} from './effective-instance.mjs';
const clone=structuredClone,id=value=>'synthetic-policy:'+value;
const contextQuote='Reviewed synthetic conditional policy source, including all qualifiers and exact recipient.';
const evidence={field:['text'],quote:contextQuote};
const atom=(predicate,subject,args)=>({predicate,subject,arguments:args,contextLevel:'STATIC',evidence:clone(evidence)});
const api=withRosterDetachments(createRuleContractSchema());
const checks=[];const check=(name,fn)=>{fn();checks.push(name);};
const payloads={
 QUALIFIED_FNP:{threshold:4,damageKinds:['PSYCHIC_ATTACK','MORTAL_WOUND']},
 REROLL:{roll:'HIT',results:'ALL',weaponMode:'melee'},
 INCOMING_MODIFIER:{field:'WOUND_ROLL',mode:'ADD',value:-1,comparison:'ATTACK_STRENGTH_GT_TARGET_TOUGHNESS'},
 IGNORE_MODIFIERS:{fields:['BS','WS'],optional:true},
 STRATAGEM_TARGET_RESTRICTION:{action:'PROHIBIT',stratagemId:id('stratagem'),ownerBookId:id('book')}
};
function fixture(kind='QUALIFIED_FNP',recipientScope='PHYSICAL_UNIT'){
 const entities=[{id:id('detachment'),kind:'DETACHMENT',bookId:id('book'),data:{title:'Synthetic detachment'}},
  {id:id('stratagem'),kind:'STRATAGEM',bookId:id('book'),parentId:id('detachment'),provenance:{sourceId:id('stratagem/source')},data:{title:'Synthetic exact Stratagem',text:contextQuote}}];
 for(const name of ['bodyguard','leader'])entities.push(
  {id:id(name),kind:'DATASHEET',data:{title:name,keywords:[],factionKeywords:[],profileIds:[id(name+'/model')],weaponIds:[],ruleReferenceIds:[],sectionIds:[],wargearOptionIds:[]}},
  {id:id(name+'/model'),parentId:id(name),kind:'PROFILE',data:{name,M:'6"',T:'4',SV:'3+',INSV:'5+',W:'2',LD:'6+',OC:'1'}});
 const owner={id:'owner',subject:'UNIT',purpose:'OWNER',allegiance:'FRIENDLY',selector:atom('UNIT_ID','UNIT',{id:id('leader')}),conditions:[]};
 const clause={id:id('clause'),roles:[clone(owner)],conditions:[],sourceFields:[['text']],rosterClassification:'DISPLAY_ONLY',rosterEffects:[],
  conditionalPolicy:{kind,recipientScope,payload:clone(payloads[kind]),evidence:clone(evidence),contextQuote}};
 const rule={id:id('rule'),parentId:id('leader'),kind:'DATASHEET_ABILITY',provenance:{sourceId:id('source')},data:{text:contextQuote},
  ruleContract:{schema:'rule-contract/v2',ruleId:id('rule'),ownerId:id('leader'),sourceId:id('source'),kind:'DATASHEET_ABILITY',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',roles:[owner],conditions:[],sourceFields:[['text']],clauses:[clause]}};
 entities.push(rule);
 const unit=(instanceId,name)=>({instanceId,canonicalUnitId:id(name),startingStrength:1,enhancementIds:[],warlord:false,equipmentContextKnown:true,selections:[],modelRows:[{rowId:'model',quantity:1,canonicalProfileId:id(name+'/model'),selections:[],loadouts:[]}]});
 const book={bookId:id('book'),entities,rosterAttachmentPolicies:[{sourceId:id('leader'),targetId:id('bodyguard'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
 const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:id('roster'),detachments:[{instanceId:'main',canonicalDetachmentId:id('detachment')}],units:[unit('a','bodyguard'),unit('b','bodyguard'),unit('l','leader'),unit('l2','leader')],attachments:[],warlordInstanceId:null};
 return {book,state,rule,clause,policy:clause.conditionalPolicy};
}
function run(book,state){const oldBook=clone(book),oldState=clone(state);api.validateContracts(book);validateRosterEffects(book,api.validatePredicate,api.evaluatePredicate);const result=executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),api);assert.deepEqual(book,oldBook);assert.deepEqual(state,oldState);return result;}
const unit=(result,name)=>result.units.find(row=>row.instanceId===name);
const rows=(result,name)=>unit(result,name).conditional.filter(row=>row.policy);
const numerical=result=>{const value=clone(result);for(const unit of value.units)unit.conditional=unit.conditional.filter(row=>!row.policy);return value;};
function baseline(f){const off=clone(f.book);delete off.entities.find(row=>row.id===f.rule.id).ruleContract.clauses[0].conditionalPolicy;return run(off,f.state);}
function invariant(f,result){assert.deepEqual(numerical(result),baseline(f),'Policies never change numerical profiles, abilities, metrics, applied traces or inventory');for(const u of result.units)for(const row of rows(result,u.instanceId)){assert.equal(row.state,'UNKNOWN');assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert.equal(row.ruleId,f.rule.id);assert.equal(row.clauseId,f.clause.id);assert.ok(['l','l2'].includes(row.sourceInstanceId));assert.deepEqual(row.policy,f.policy);}}
for(const kind of Object.keys(payloads))check(kind+' is opt-in, source-bound and non-numeric',()=>{const f=fixture(kind);const result=run(f.book,f.state);invariant(f,result);assert.equal(rows(result,'a').length,0);assert.equal(rows(result,'b').length,0);for(const name of ['l','l2']){assert.equal(rows(result,name).length,1);assert.equal(rows(result,name)[0].sourceInstanceId,name);assert.deepEqual(rows(result,name)[0].recipientInstanceIds,[name]);}assert.deepEqual(run(f.book,JSON.parse(JSON.stringify(f.state))),result);assert.deepEqual(run(f.book,f.state),result);});
check('formed propagation, source provenance and detach',()=>{const f=fixture('QUALIFIED_FNP','FORMED_UNIT');f.state=changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'ATTACH','l','a');let result=run(f.book,f.state);invariant(f,result);assert.deepEqual(rows(result,'a')[0].recipientInstanceIds.slice().sort(),['a','l']);assert.equal(rows(result,'a')[0].sourceInstanceId,'l');assert.equal(rows(result,'b').length,0);f.state=changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'DETACH','l');result=run(f.book,f.state);invariant(f,result);assert.equal(rows(result,'a').length,0);assert.deepEqual(rows(result,'l')[0].recipientInstanceIds,['l']);});
check('three aura source spans never select recipients from roster',()=>{for(const [kind,payload]of [['QUALIFIED_FNP',payloads.QUALIFIED_FNP],['REROLL',{roll:'HIT',results:'ONES',weaponMode:'melee'}],['REROLL',{roll:'WOUND',results:'ONES',weaponMode:'melee'}]]){const f=fixture(kind,'AURA_UNRESOLVED');f.policy.payload=clone(payload);f.policy.aura={range:6,allegiance:'FRIENDLY',unitKeyword:'DARK ANGELS'};f.state=changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'ATTACH','l','a');const result=run(f.book,f.state);invariant(f,result);assert.equal(rows(result,'a').length,0);assert.equal(rows(result,'b').length,0);for(const name of ['l','l2'])assert.deepEqual(rows(result,name)[0].recipientInstanceIds,[]);}});
check('qualified FNP cannot become ordinary FNP or suppress it',()=>{const f=fixture();f.rule.ruleContract.clauses.push({id:'ordinary-fnp',roles:clone(f.clause.roles),conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[{id:id('ordinary-fnp'),operation:'GRANT_MODEL_ABILITY',targetSubject:'MODEL',targetBinding:'SOURCE_UNIT_MODELS',ability:{name:'Feel No Pain',value:6},conditions:[],evidence:clone(evidence),sourceFields:[['text']],lifetime:'WHILE_SOURCE_UNIT_PRESENT'}]});const result=run(f.book,f.state);invariant(f,result);assert.equal(rows(result,'l')[0].policy.payload.threshold,4);for(const name of ['l','l2'])assert.deepEqual(unit(result,name).profiles[0].abilities.filter(row=>row.name==='Feel No Pain'),[{name:'Feel No Pain',value:6}]);});
check('MODEL Enhancement bearer is validated and retained',()=>{const f=fixture('REROLL','FORMED_UNIT');f.rule.parentId=id('detachment');f.rule.kind='ENHANCEMENT';f.rule.ruleContract.kind='ENHANCEMENT';f.rule.ruleContract.ownerId=id('detachment');f.rule.ruleContract.detachmentId=id('detachment');const owner={id:'owner',subject:'MODEL',purpose:'OWNER',allegiance:'FRIENDLY',selector:atom('MODEL_ID','MODEL',{id:id('leader/model')}),conditions:[]};f.rule.ruleContract.roles=[owner];f.clause.roles=[clone(owner)];f.rule.ruleContract.assignment={ownerRoleId:'owner',selector:clone(owner.selector),identity:'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE'};unit(f.state,'l').enhancementIds=[f.rule.id];const formed=formRoster(f.book,validateRoster(f.book,f.state,f.book.rosterAttachmentPolicies));const scope=unit(formed,'l').profiles[0].scopeId;unit(f.state,'l').enhancementAssignments=[{enhancementId:f.rule.id,modelScopeId:scope}];let result=run(f.book,f.state);assert.equal(rows(result,'l').length,1);assert.equal(rows(result,'l')[0].sourceModelScopeId,scope);assert.equal(rows(result,'l2').length,0);const off=clone(f.state);unit(off,'l').enhancementIds=[];unit(off,'l').enhancementAssignments=[];assert.equal(rows(run(f.book,off),'l').length,0);const wrong=clone(f.state);unit(wrong,'l').enhancementAssignments[0].modelScopeId='unresolved';assert.throws(()=>run(f.book,wrong));});
check('same source text has independent physical source identities',()=>{const f=fixture('REROLL');const result=run(f.book,f.state);assert.notEqual(rows(result,'l')[0].sourceInstanceId,rows(result,'l2')[0].sourceInstanceId);assert.deepEqual(rows(result,'l')[0].policy,rows(result,'l2')[0].policy);});
const reject=(mutate)=>{const f=fixture();mutate(f);assert.throws(()=>run(f.book,f.state));};
check('policy keys, source and payload fail closed',()=>{for(const mutate of [f=>f.policy.unknown=true,f=>f.policy.kind='OTHER',f=>f.policy.recipientScope='ROSTER',f=>delete f.policy.evidence,f=>f.policy.evidence.quote='not accepted',f=>f.policy.contextQuote='invented qualifier',f=>f.policy.payload.extra=true,f=>f.policy.payload.threshold=1,f=>f.policy.payload.threshold=4.5,f=>f.policy.payload.threshold='4',f=>f.policy.payload.damageKinds=['ALL'],f=>f.policy.payload.damageKinds=[],f=>f.policy.aura={range:6,allegiance:'FRIENDLY',unitKeyword:'DARK ANGELS'}])reject(mutate);});
check('all kind-specific payloads reject malformed values',()=>{for(const[kind,patch]of [['REROLL',{roll:'DAMAGE'}],['REROLL',{results:'FAILED'}],['REROLL',{weaponMode:'psychic'}],['INCOMING_MODIFIER',{field:'T'}],['INCOMING_MODIFIER',{mode:'SET'}],['INCOMING_MODIFIER',{value:'-1'}],['INCOMING_MODIFIER',{comparison:'ATTACKER_IS_ENEMY'}],['IGNORE_MODIFIERS',{fields:['AP']}],['IGNORE_MODIFIERS',{optional:false}],['STRATAGEM_TARGET_RESTRICTION',{action:'ALLOW'}],['STRATAGEM_TARGET_RESTRICTION',{stratagemId:'missing'}],['STRATAGEM_TARGET_RESTRICTION',{stratagemId:id('leader/model')}]] ){const f=fixture(kind);Object.assign(f.policy.payload,patch);assert.throws(()=>run(f.book,f.state));}});
check('unresolved aura metadata fail closed',()=>{for(const patch of [{range:-6},{range:'6'},{allegiance:'ENEMY'},{unitKeyword:''},{unknown:true}]){const f=fixture('REROLL','AURA_UNRESOLVED');f.policy.aura={range:6,allegiance:'FRIENDLY',unitKeyword:'DARK ANGELS',...patch};assert.throws(()=>run(f.book,f.state));}const f=fixture('REROLL','AURA_UNRESOLVED');assert.throws(()=>run(f.book,f.state));});
check('canonical Stratagem ownership and source cannot be severed',()=>{for(const mutate of [f=>f.book.entities.find(row=>row.id===id('stratagem')).parentId='missing',f=>f.book.entities.find(row=>row.id===id('stratagem')).parentId=id('leader'),f=>delete f.book.entities.find(row=>row.id===id('stratagem')).provenance]){const f=fixture('STRATAGEM_TARGET_RESTRICTION');mutate(f);assert.throws(()=>run(f.book,f.state));}});
check('policy cannot sneak executable BATTLE effect or numeric mutation',()=>{const f=fixture();f.clause.rosterEffects=[{id:id('bad'),operation:'MODIFY_STAT',targetSubject:'MODEL',targetBinding:'SOURCE_UNIT_MODELS',field:'T',mode:'ADD',value:4,conditions:[],evidence:clone(evidence),sourceFields:[['text']],lifetime:'ROSTER'}];assert.throws(()=>run(f.book,f.state));});
check('effective policy provenance and current physical recipient guards',()=>{
 const f=fixture('QUALIFIED_FNP','FORMED_UNIT');f.state=changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'ATTACH','l','a');
 const result=run(f.book,f.state);assert.ok(projectEffectiveInstance(f.book,result,'a').conditional.some(r=>r.policy));
 for(const change of [row=>row.policy.payload.threshold=3,row=>row.sourceProvenance.sourceId='foreign',row=>row.sourceInstanceId='b',row=>row.recipientInstanceIds=['b'],row=>row.sourceModelScopeId=unit(result,'l').profiles[0].scopeId]){
  const altered=clone(result);change(rows(altered,'a')[0]);assert.throws(()=>projectEffectiveInstance(f.book,altered,'a'));
 }
 const aura=fixture('QUALIFIED_FNP','AURA_UNRESOLVED');aura.policy.aura={range:6,allegiance:'FRIENDLY',unitKeyword:'DARK ANGELS'};const p=run(aura.book,aura.state);unit(p,'a').conditional.push(clone(rows(p,'l')[0]));assert.throws(()=>projectEffectiveInstance(aura.book,p,'a'));
});
check('nested activation choice is source-owned and remains unresolved',()=>{
 const f=fixture('QUALIFIED_FNP','AURA_UNRESOLVED');f.policy.aura={range:6,allegiance:'FRIENDLY',unitKeyword:'DARK ANGELS'};
 f.policy.activationReferenceId=id('activation');f.book.entities.push({id:id('activation'),kind:'DATASHEET_ABILITY',parentId:id('leader'),provenance:{sourceId:id('activation/source')},data:{title:'Optional battle choice',text:'Choose this permission at the Command phase; no choice is assumed.'}});
 const projected=projectEffectiveInstance(f.book,run(f.book,f.state),'l');assert.equal(projected.conditional.find(r=>r.policy).activationContext.canonicalId,id('activation'));
 f.policy.activationReferenceId=id('bodyguard');assert.throws(()=>run(f.book,f.state));
});
check('Advance and Leadership are permission-only rerolls, never numbers',()=>{
 for(const roll of ['ADVANCE','LEADERSHIP']){
  const f=fixture('REROLL');f.policy.payload={roll,results:'ALL'};
  const result=run(f.book,f.state);invariant(f,result);
  assert.equal(projectEffectiveInstance(f.book,result,'l').conditional.find(row=>row.policy).policy.payload.roll,roll);
  f.policy.payload.results='ONES';assert.throws(()=>run(f.book,f.state));
  f.policy.payload={roll,results:'ALL',weaponMode:'melee'};assert.throws(()=>run(f.book,f.state));
 }
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,names:checks,conditionalPoliciesOnly:true,battleSimulation:false}));
