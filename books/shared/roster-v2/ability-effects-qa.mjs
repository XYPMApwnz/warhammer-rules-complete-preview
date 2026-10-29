/** Standalone synthetic guards for canonical, explicitly scoped ability grants.
 * No book facts, source grammar, or individual infantry ownership are imported.
 */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {changeAttachment,validateRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects} from './effects.mjs';
import {createRosterRuntime} from './runtime.mjs';
import {buildAttachmentFeasibility} from './compatibility-feasibility.mjs';
import {compileRecipientFixture} from './recipient-fixture.mjs';

const evaluator=withRosterDetachments(createRuleContractSchema({stateFields:{
  leading:{contextLevel:'ROSTER',valueType:'boolean'},
  battleFlag:{contextLevel:'BATTLE',valueType:'boolean'}
}}));
const checks=[];
const check=(name,run)=>{run();checks.push(name);};
const clone=value=>structuredClone(value);
const id=name=>'synthetic-abilities:'+name;
const evidence={field:['text'],quote:'Reviewed synthetic ability grant and recipient evidence.'};
const atom=(predicate,subject,arguments_,contextLevel='STATIC')=>
  ({predicate,subject,arguments:arguments_,contextLevel,evidence:clone(evidence)});
const always=subject=>atom('ALWAYS',subject,{});
const leading=()=>({binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER')});
const targetProfile=name=>({binding:'TARGET',predicate:atom('MODEL_ID','MODEL',{id:id(name)})});

function fixture() {
  const entities=[{id:id('main'),kind:'DETACHMENT',data:{title:'Synthetic detachment'}}];
  const rosterProfileBindings=[];
  for(const [name,keywords,profiles] of [
    ['mixed',['BODYGUARD'],[['profile-a',['PROFILE_A']],['profile-b',['PROFILE_B']]]],
    ['leader',['CHARACTER'],[['leader-profile',['CHARACTER']]]]
  ]) {
    entities.push({id:id(name),kind:'DATASHEET',data:{title:name,keywords,factionKeywords:[],
      profileIds:profiles.map(([profile])=>id(profile)),ruleReferenceIds:[],weaponIds:[]}});
    for(const [profile,intrinsicKeywords] of profiles) {
      entities.push({id:id(profile),parentId:id(name),kind:'PROFILE',data:{name:profile,M:'6"',T:'4',LD:'6+',OC:'1'}});
      rosterProfileBindings.push({unitId:id(name),profileId:id(profile),intrinsicKeywords,abilities:[],referenceIds:[]});
    }
  }
  const book={bookId:id('book'),entities,rosterProfileBindings,
    rosterAbilityReferences:{
      [id('quiet')]:{id:id('quiet'),title:'Quiet advance',parameters:{}},
      [id('scout')]:{id:id('scout'),title:'Recon advance',parameters:{distance:{type:'number',min:0}}},
      [id('conceal')]:{id:id('conceal'),title:'Distant concealment',parameters:{distance:{type:'number',min:0}}}
    },
    rosterAttachmentPolicies:[{sourceId:id('leader'),targetId:id('mixed'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  const unit=(instanceId,name)=>({instanceId,canonicalUnitId:id(name),startingStrength:name==='mixed'?4:1,
    modelRows:(name==='mixed'?['profile-a','profile-b']:['leader-profile']).map(profile=>({
      rowId:profile,canonicalProfileId:id(profile),quantity:name==='mixed'?2:1,selections:[],loadouts:[]})),
    selections:[],enhancementIds:[],warlord:null});
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'synthetic-roster',
    detachments:[{instanceId:'detachment/1',canonicalDetachmentId:id('main')}],detachmentIds:[id('main')],
    units:[unit('alpha','mixed'),unit('beta','mixed'),unit('leader','leader'),unit('other-leader','leader')],
    attachments:[],warlordInstanceId:null};
  return {book,state};
}
function rule(book,name,{parent='mixed',enhancement=false,targetSubject='MODEL',targetBinding='SOURCE_UNIT_MODELS',
  ability='quiet',parameters={},conditions=[],...extra}={}) {
  const ownerId=id(enhancement?'main':parent),kind=enhancement?'ENHANCEMENT':parent==='main'?'DETACHMENT_RULE':'DATASHEET_ABILITY';
  const entity={id:id(name),parentId:ownerId,kind,provenance:{sourceId:id('source/'+name)},data:{title:name,text:evidence.quote}};
  const ownerRole={id:'owner',subject:'UNIT',allegiance:'FRIENDLY',selector:atom('UNIT_ID','UNIT',{id:id(parent)}),conditions:[]};
  const effect={id:name+'/effect',operation:'GRANT_ABILITY',targetSubject,targetBinding,
    ability:{canonicalId:id(ability),parameters:clone(parameters)},conditions,evidence:clone(evidence),sourceFields:[['text']],lifetime:'ROSTER',...extra};
  entity.ruleContract={schema:'rule-contract/v2',ruleId:entity.id,ownerId,sourceId:entity.provenance.sourceId,
    kind,executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',
    ...(parent==='main'||enhancement?{detachmentId:id('main')}:{}),
    roles:enhancement?[ownerRole]:[],conditions:[],sourceFields:[['text']],
    ...(enhancement?{assignment:{ownerRoleId:'owner',selector:clone(ownerRole.selector)}}:{}),
    clauses:[{id:name+'/clause',roles:[],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]};
  book.entities.push(entity);
  return effect;
}
function execute(book,state) {
  const originalBook=clone(book),originalState=clone(state);
  const canonical=compileRecipientFixture(book,evaluator);
  const result=executeRosterEffects(canonical,validateRoster(canonical,state,canonical.rosterAttachmentPolicies),evaluator);
  assert.deepEqual(book,originalBook,'Execution changed canonical facts or ability definitions');
  assert.deepEqual(state,originalState,'Execution changed imported physical-instance state');
  return result;
}
const unit=(projection,instanceId='alpha')=>projection.units.find(row=>row.instanceId===instanceId);
const profile=(projection,name,instanceId='alpha')=>unit(projection,instanceId).profiles.find(row=>row.canonicalProfileId===id(name));
const abilities=object=>object.abilities||[];
const has=(object,name)=>abilities(object).some(ability=>ability.canonicalId===id(name));
const effects=(projection,name,instanceId='alpha')=>unit(projection,instanceId).applied.filter(row=>row.ruleId===id(name));
function owned(book,state,name,options={}) {
  const {owner='alpha',...declaration}=options;
  const effect=rule(book,name,{enhancement:true,...declaration});
  unit(state,owner).enhancementIds.push(id(name));
  return effect;
}
function proof(row,name,{source='alpha',target='alpha',profileName=null,ability='quiet',parameters={}}={}) {
  assert.equal(row.ruleId,id(name));assert.equal(row.clauseId,name+'/clause');assert.equal(row.effectId,name+'/effect');
  assert.equal(row.sourceInstanceId,source);assert.equal(row.targetInstanceId,target);
  assert.equal(row.targetProfileId,profileName?id(profileName):null);
  assert.equal(row.operation,'GRANT_ABILITY');assert.equal(row.field,'abilities');
  assert.equal(row.targetAbilityId,id(ability));assert.deepEqual(row.abilityParameters,parameters);
  assert.deepEqual(row.sourceFields,[['text']]);assert.equal(row.lifetime,'ROSTER');
  assert.ok(row.after.some(entry=>entry.canonicalId===id(ability)&&JSON.stringify(entry.parameters)===JSON.stringify(parameters)));
  assert.ok(!(row.before||[]).some(entry=>entry.canonicalId===id(ability)));
}
const semantic=projection=>({
  units:projection.units.map(row=>({instanceId:row.instanceId,abilities:abilities(row),
    profiles:row.profiles.map(model=>({scopeId:model.scopeId,abilities:abilities(model)})).sort((a,b)=>a.scopeId.localeCompare(b.scopeId)),
    applied:row.applied.map(clone).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
  })).sort((a,b)=>a.instanceId.localeCompare(b.instanceId)),
  formedUnits:projection.formedUnits.map(row=>({id:row.formedUnitId,abilities:abilities(row)})).sort((a,b)=>a.id.localeCompare(b.id))
});

check('MODEL grant keeps exact canonical identity, title, parameters, profile scope, and provenance',()=>{
  const {book,state}=fixture();owned(book,state,'profile-scout',{ability:'scout',parameters:{distance:6},conditions:[targetProfile('profile-a')]});
  const result=execute(book,state),a=profile(result,'profile-a'),b=profile(result,'profile-b');
  assert.deepEqual(abilities(a),[{canonicalId:id('scout'),name:'Recon advance',parameters:{distance:6}}]);
  assert.equal(has(b,'scout'),false);assert.equal(has(unit(result),'scout'),false);
  assert.equal(a.modelInstanceId,null,'Quantity-two profile groups are not invented individuals');
  const rows=effects(result,'profile-scout');assert.equal(rows.length,1);
  proof(rows[0],'profile-scout',{profileName:'profile-a',ability:'scout',parameters:{distance:6}});
  assert.equal(rows[0].targetModelInstanceId,null);assert.ok(rows[0].targetCompositionId.includes('alpha/profile-a/'));
});
check('exact physical Enhancement owner isolates duplicate canonical units and profiles',()=>{
  const {book,state}=fixture();owned(book,state,'owner-only');const result=execute(book,state);
  assert.ok(unit(result).profiles.every(model=>has(model,'quiet')));
  for(const other of ['beta','leader','other-leader']) {
    assert.ok(unit(result,other).profiles.every(model=>!has(model,'quiet')));
    assert.equal(effects(result,'owner-only',other).length,0);
  }
  assert.equal(effects(result,'owner-only').length,2);
});
check('UNIT PHYSICAL grants leave intrinsic MODEL abilities and unrelated duplicates unchanged',()=>{
  const {book,state}=fixture();owned(book,state,'unit-only',{targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'),result=execute(book,attached);
  assert.equal(has(unit(result),'quiet'),true);assert.equal(has(unit(result,'leader'),'quiet'),false);
  assert.equal(has(unit(result,'beta'),'quiet'),false);assert.equal(has(result.formedUnits[0],'quiet'),false);
  assert.ok(result.units.every(row=>row.profiles.every(model=>!has(model,'quiet'))));
  const rows=effects(result,'unit-only');assert.equal(rows.length,1);proof(rows[0],'unit-only');
});
check('UNIT FORMED grants cover the actual formed unit without rewriting any MODEL ability',()=>{
  const {book,state}=fixture();owned(book,state,'formed-unit',{parent:'leader',owner:'leader',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'FORMED',conditions:[leading()]});
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'),result=execute(book,attached);
  for(const target of ['alpha','leader']) {assert.equal(has(unit(result,target),'quiet'),true);proof(effects(result,'formed-unit',target)[0],'formed-unit',{source:'leader',target});}
  assert.equal(has(result.formedUnits[0],'quiet'),true);
  for(const target of ['beta','other-leader']) assert.equal(has(unit(result,target),'quiet'),false);
  assert.ok(result.units.every(row=>row.profiles.every(model=>!has(model,'quiet'))));
});
check('FORMED UNIT scope uses standalone UNIT when source does not require attachment',()=>{
  const {book,state}=fixture();owned(book,state,'standalone-unit',{targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'FORMED'});
  const result=execute(book,state);assert.equal(has(unit(result),'quiet'),true);assert.equal(result.formedUnits.length,0);
  assert.equal(has(unit(result,'beta'),'quiet'),false);assert.ok(unit(result).profiles.every(model=>!has(model,'quiet')));
});
check('SOURCE_FORMED_MODELS covers bearer and actually led profiles, not unrelated physical copies',()=>{
  const {book,state}=fixture();owned(book,state,'bearer-led',{parent:'leader',owner:'leader',targetBinding:'SOURCE_FORMED_MODELS',ability:'scout',parameters:{distance:6},conditions:[leading()]});
  const result=execute(book,changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'));
  for(const target of ['alpha','leader']) assert.ok(unit(result,target).profiles.every(model=>has(model,'scout')));
  for(const target of ['beta','other-leader']) assert.ok(unit(result,target).profiles.every(model=>!has(model,'scout')));
  assert.ok(result.units.every(row=>!has(row,'scout')),'MODEL grants are not copied into UNIT ability storage');
  assert.equal(effects(result,'bearer-led').length,2);assert.equal(effects(result,'bearer-led','leader').length,1);
  proof(effects(result,'bearer-led','leader')[0],'bearer-led',{source:'leader',target:'leader',profileName:'leader-profile',ability:'scout',parameters:{distance:6}});
});
check('MODEL recipients can explicitly exclude the bearer while selecting only led profiles',()=>{
  const {book,state}=fixture();owned(book,state,'led-only',{parent:'leader',owner:'leader',targetBinding:'SOURCE_FORMED_MODELS',conditions:[leading(),targetProfile('profile-b')]});
  const result=execute(book,changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'));
  assert.equal(has(profile(result,'profile-a'),'quiet'),false);assert.equal(has(profile(result,'profile-b'),'quiet'),true);
  assert.equal(has(profile(result,'leader-profile','leader'),'quiet'),false);assert.equal(has(profile(result,'profile-b','beta'),'quiet'),false);
  proof(effects(result,'led-only')[0],'led-only',{source:'leader',profileName:'profile-b'});
});
check('SOURCE_MODEL gives an imported singleton its physical MODEL identity',()=>{
  const {book,state}=fixture();owned(book,state,'single-bearer',{parent:'leader',owner:'leader',targetBinding:'SOURCE_MODEL'});
  const result=execute(book,state),rows=effects(result,'single-bearer','leader');assert.equal(rows.length,1);
  assert.equal(rows[0].targetModelInstanceId,'leader');proof(rows[0],'single-bearer',{source:'leader',target:'leader',profileName:'leader-profile'});
  assert.equal(has(profile(result,'leader-profile','other-leader'),'quiet'),false);
});
check('LEADERS_OF_SOURCE changes only the actual attached leading profile',()=>{
  const {book,state}=fixture();owned(book,state,'actual-leader',{targetBinding:'LEADERS_OF_SOURCE'});
  const result=execute(book,changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'));
  assert.equal(has(profile(result,'leader-profile','leader'),'quiet'),true);
  assert.ok(unit(result).profiles.every(model=>!has(model,'quiet')));assert.equal(has(profile(result,'leader-profile','other-leader'),'quiet'),false);
  proof(effects(result,'actual-leader','leader')[0],'actual-leader',{target:'leader',profileName:'leader-profile'});
});
check('roster UNIT grants apply typed selectors without implementing global MODEL targeting',()=>{
  const {book,state}=fixture();rule(book,'roster-units',{parent:'main',targetSubject:'UNIT',targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL',
    conditions:[{binding:'TARGET',predicate:atom('UNIT_ID','UNIT',{id:id('mixed')})}]});
  const result=execute(book,state);
  for(const target of ['alpha','beta']) {assert.equal(has(unit(result,target),'quiet'),true);proof(effects(result,'roster-units',target)[0],'roster-units',{source:null,target});}
  for(const target of ['leader','other-leader']) assert.equal(has(unit(result,target),'quiet'),false);
  assert.ok(result.units.every(row=>row.profiles.every(model=>!has(model,'quiet'))));
});
check('PHYSICAL UNIT target identity remains component-relative inside an actual formation',()=>{
  for(const [canonicalName,expected] of [['mixed',['alpha','beta']],['leader',['leader','other-leader']]]) {
    const {book,state}=fixture();rule(book,'physical-target-identity',{parent:'main',targetSubject:'UNIT',targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL',
      conditions:[{binding:'TARGET',predicate:atom('UNIT_ID','UNIT',{id:id(canonicalName)})}]});
    const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'),result=execute(book,attached);
    assert.deepEqual(result.units.filter(row=>has(row,'quiet')).map(row=>row.instanceId).sort(),expected.slice().sort(),
      'An attached Leader must not borrow the Bodyguard identity; the physical Leader must still match its own identity');
    assert.equal(has(result.formedUnits[0],'quiet'),false,'PHYSICAL grants never become formation-owned abilities');
    assert.ok(result.units.every(row=>row.profiles.every(model=>!has(model,'quiet'))));
  }
});
check('PHYSICAL UNIT target keyword cannot be borrowed from a different formed-unit component',()=>{
  for(const [keyword,expected] of [['BODYGUARD',['alpha','beta']],['CHARACTER',['leader','other-leader']]]) {
    const {book,state}=fixture();rule(book,'physical-target-keyword',{parent:'main',targetSubject:'UNIT',targetBinding:'ROSTER_UNITS',unitScope:'PHYSICAL',
      conditions:[{binding:'TARGET',predicate:atom('UNIT_KEYWORD','UNIT',{keyword})}]});
    const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'),result=execute(book,attached);
    assert.deepEqual(result.units.filter(row=>has(row,'quiet')).map(row=>row.instanceId).sort(),expected.slice().sort(),
      'A physical recipient must satisfy its own keyword selector, despite shared formed-unit keywords');
    assert.equal(has(result.formedUnits[0],'quiet'),false);
    assert.ok(result.units.every(row=>row.profiles.every(model=>!has(model,'quiet'))));
  }
});
check('physical UNIT owner selector cannot be borrowed from an attached Bodyguard',()=>{
  const {book,state}=fixture();rule(book,'wrong-owner',{enhancement:true,targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  unit(state,'leader').enhancementIds.push(id('wrong-owner'));
  const result=execute(book,changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'));
  assert.ok(result.units.every(row=>!has(row,'quiet')&&row.applied.length===0));
});
check('source parameters remain distinct for separate canonical ability references and owners',()=>{
  const {book,state}=fixture();owned(book,state,'six-inch',{ability:'scout',parameters:{distance:6}});
  owned(book,state,'fifteen-inch',{owner:'beta',ability:'conceal',parameters:{distance:15},targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  const result=execute(book,state);
  assert.deepEqual(abilities(profile(result,'profile-a'))[0].parameters,{distance:6});
  assert.deepEqual(abilities(unit(result,'beta'))[0],{canonicalId:id('conceal'),name:'Distant concealment',parameters:{distance:15}});
  assert.equal(has(unit(result),'conceal'),false);assert.equal(has(profile(result,'profile-a','beta'),'scout'),false);
});
check('identical display titles do not collapse canonical identities or physical parameter values',()=>{
  const {book,state}=fixture();book.rosterAbilityReferences[id('quiet')].title='Shared display title';book.rosterAbilityReferences[id('scout')].title='Shared display title';
  owned(book,state,'same-title-one');owned(book,state,'same-title-two',{ability:'scout',parameters:{distance:6}});
  owned(book,state,'other-distance',{owner:'beta',ability:'scout',parameters:{distance:12}});
  const result=execute(book,state),a=abilities(profile(result,'profile-a')),b=abilities(profile(result,'profile-a','beta'));
  assert.equal(a.length,2);assert.ok(a.every(entry=>entry.name==='Shared display title'));
  assert.deepEqual(a.find(entry=>entry.canonicalId===id('scout')).parameters,{distance:6});
  assert.deepEqual(b,[{canonicalId:id('scout'),name:'Shared display title',parameters:{distance:12}}]);
});
check('detach and reattach reconstruct scoped MODEL and UNIT grants from immutable state',()=>{
  const {book,state}=fixture();owned(book,state,'attached-models',{parent:'leader',owner:'leader',targetBinding:'SOURCE_FORMED_MODELS',conditions:[leading()]});
  owned(book,state,'attached-unit',{parent:'leader',owner:'leader',ability:'conceal',parameters:{distance:15},targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'FORMED',conditions:[leading()]});
  const base=semantic(execute(book,state));
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'),first=semantic(execute(book,attached));
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','leader');
  assert.deepEqual(semantic(execute(book,detached)),base);
  const moved=changeAttachment(book,attached,book.rosterAttachmentPolicies,'REATTACH','leader','beta'),next=execute(book,moved);
  assert.equal(has(unit(next),'conceal'),false);assert.ok(unit(next).profiles.every(model=>!has(model,'quiet')));
  assert.equal(has(unit(next,'beta'),'conceal'),true);assert.ok(unit(next,'beta').profiles.every(model=>has(model,'quiet')));
  const restored=changeAttachment(book,moved,book.rosterAttachmentPolicies,'REATTACH','leader','alpha');
  assert.deepEqual(semantic(execute(book,restored)),first);assert.deepEqual(semantic(execute(book,JSON.parse(JSON.stringify(restored)))),first);
});
check('same grant from independent clauses does not duplicate canonical results',()=>{
  const {book,state}=fixture();owned(book,state,'repeat-a',{targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  owned(book,state,'repeat-b',{targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  const result=execute(book,state);assert.equal(abilities(unit(result)).filter(entry=>entry.canonicalId===id('quiet')).length,1);
});
check('effective datasheet API preserves separate canonical UNIT and MODEL ability grants',()=>{
  const {book,state}=fixture();
  for(const entity of book.entities.filter(entity=>entity.kind==='DATASHEET'))
    Object.assign(entity.data,{sectionIds:[],wargearOptionIds:[]});
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,book.rosterProfileBindings.map(binding=>({
    unitId:binding.unitId,profileId:binding.profileId,intrinsicKeywords:binding.intrinsicKeywords,
    maxModels:binding.unitId===id('mixed')?2:1})));
  owned(book,state,'api-unit',{ability:'conceal',parameters:{distance:15},targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  owned(book,state,'api-model',{ability:'scout',parameters:{distance:6},conditions:[targetProfile('profile-a')]});
  const runtime=createRosterRuntime(compileRecipientFixture(book,evaluator),evaluator);runtime.load(state);
  const effective=runtime.effective('alpha');
  assert.deepEqual(effective.unitAbilities,[{canonicalId:id('conceal'),name:'Distant concealment',parameters:{distance:15}}]);
  assert.ok(effective.profiles.find(profile=>profile.id===id('profile-a')).abilities.some(ability=>ability.canonicalId===id('scout')));
  assert.ok(effective.profiles.every(profile=>!profile.abilities.some(ability=>ability.canonicalId===id('conceal'))));
  assert.equal(runtime.effective('beta').unitAbilities,undefined);
  assert.ok(runtime.effective('beta').profiles.every(profile=>profile.abilities.length===0));
  assert.deepEqual(runtime.effective('alpha'),effective);
});
check('deterministic rebuild preserves ability and provenance output under independent roster order changes',()=>{
  const {book,state}=fixture();owned(book,state,'ordered-model',{conditions:[targetProfile('profile-a')]});
  owned(book,state,'ordered-unit',{owner:'beta',ability:'scout',parameters:{distance:6},targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'PHYSICAL'});
  const expected=semantic(execute(book,state)),reordered=clone(state);reordered.units.reverse();
  assert.deepEqual(semantic(execute(book,reordered)),expected);assert.deepEqual(semantic(execute(book,state)),expected);
});
check('unknown canonical ability references, parameters, and invalid parameter types fail closed',()=>{
  for(const options of [
    {ability:'unresolved'},
    {ability:'scout',parameters:{distance:'6'}},
    {ability:'scout',parameters:{distance:-1}},
    {ability:'scout',parameters:{}},
    {ability:'scout',parameters:{distance:Infinity}},
    {ability:'quiet',parameters:{distance:6}},
    {ability:'scout',parameters:{distance:6,unreviewed:true}}
  ]) {const {book,state}=fixture();owned(book,state,'invalid-reference',options);assert.throws(()=>execute(book,state));}
});
check('MODEL/UNIT binding confusion and missing UNIT scope fail validation',()=>{
  for(const options of [
    {targetSubject:'MODEL',targetBinding:'SOURCE_UNIT'},
    {targetSubject:'MODEL',unitScope:'FORMED'},
    {targetSubject:'UNIT',targetBinding:'SOURCE_UNIT_MODELS',unitScope:'PHYSICAL'},
    {targetSubject:'UNIT',targetBinding:'SOURCE_UNIT'},
    {targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'UNREVIEWED'},
    {conditions:[{binding:'TARGET',predicate:always('UNIT')}]}
  ]) {const {book,state}=fixture();owned(book,state,'invalid-scope',options);assert.throws(()=>execute(book,state));}
});
check('missing provenance evidence or battle predicates cannot authorize roster ability execution',()=>{
  const falseProof=fixture(),effect=owned(falseProof.book,falseProof.state,'false-proof');effect.evidence.quote='Invented ability evidence.';
  assert.throws(()=>execute(falseProof.book,falseProof.state));
  const battle=fixture();owned(battle.book,battle.state,'battle-effect',{conditions:[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'battleFlag',equals:true},'BATTLE')}]});
  assert.throws(()=>execute(battle.book,battle.state));
});

console.log(JSON.stringify({status:'PASS',checks:checks.length,names:checks},null,2));
