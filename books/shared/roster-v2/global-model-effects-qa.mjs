/** Independent global MODEL recipient controls. Only synthetic declarations,
 * physical roster instances and profile bindings are loaded; no book facts. */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {changeAttachment,validateRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects} from './effects.mjs';
import {compileRecipientFixture} from './recipient-fixture.mjs';

const clone=value=>structuredClone(value),id=name=>'synthetic-global-model:'+name;
const evidence={field:['text'],quote:'Reviewed synthetic containing unit and exact model recipient declaration.'};
const api=withRosterDetachments(createRuleContractSchema({stateFields:{
  optionalRosterFlag:{contextLevel:'ROSTER',valueType:'boolean'},
  battleFlag:{contextLevel:'BATTLE',valueType:'boolean'}
}}));
const atom=(predicate,subject,args={},contextLevel='STATIC')=>({predicate,subject,arguments:args,contextLevel,evidence:clone(evidence)});
const always=subject=>atom('ALWAYS',subject);
const keyword=(subject,key)=>atom(subject+'_KEYWORD',subject,{keyword:key});
const checks=[];
const check=(name,run)=>{run();checks.push(name);};

function fixture() {
  const entities=[{id:id('main'),kind:'DETACHMENT',data:{title:'Synthetic deployment'}},
    {id:id('unselected'),kind:'DETACHMENT',data:{title:'Unselected deployment'}}],rosterProfileBindings=[];
  const definitions=[
    ['platform',['CONSTRUCT'],[['analyst',['SCHOLAR']],['shell',['SHELL']]]],
    ['escort',['CHARACTER'],[['escort-profile',['CHARACTER','SCHOLAR']]]],
    ['observer',['OBSERVER'],[['observer-profile',['SCHOLAR']]]]
  ];
  for(const [name,keywords,profiles] of definitions) {
    entities.push({id:id(name),kind:'DATASHEET',data:{title:name,keywords,factionKeywords:['SYNTHETIC_FACTION'],
      profileIds:profiles.map(([profile])=>id(profile)),ruleReferenceIds:[],weaponIds:profiles.map(([profile])=>id(profile+'-rifle'))}});
    for(const [profile,intrinsicKeywords] of profiles) {
      entities.push({id:id(profile),parentId:id(name),kind:'PROFILE',data:{name:profile,M:'5"',T:'4',SV:'3+',INSV:'6+',LD:'6+',OC:'1'}});
      entities.push({id:id(profile+'-rifle'),parentId:id(name),kind:'WEAPON_PROFILE',data:{name:profile+' rifle',mode:'ranged',
        range:'18"',skill:'4+',attacks:'2',strength:'5',ap:'-1',damage:'1',abilities:[]}});
      rosterProfileBindings.push({unitId:id(name),profileId:id(profile),intrinsicKeywords,abilities:[],referenceIds:[]});
    }
  }
  const book={bookId:id('book'),entities,rosterProfileBindings,
    rosterAbilityReferences:{[id('recon')]:{id:id('recon'),title:'Synthetic reconnaissance',parameters:{distance:{type:'number',min:0}}}},
    rosterAttachmentPolicies:[{sourceId:id('escort'),targetId:id('platform'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  const physical=(instanceId,name)=>{
    const profiles=definitions.find(row=>row[0]===name)[2];
    return {instanceId,canonicalUnitId:id(name),startingStrength:name==='platform'?3:1,
      modelRows:profiles.map(([profile],index)=>({rowId:profile,canonicalProfileId:id(profile),quantity:name==='platform'&&index===1?2:1,
        selections:[{selectionKey:profile+'-rifle',physicalQuantity:name==='platform'&&index===1?2:1,
          canonicalProfileIds:[id(profile+'-rifle')],canonicalEquipmentIds:[]}],loadouts:[]})),
      selections:[],enhancementIds:[],warlord:null};
  };
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'global-synthetic',
    detachments:[{instanceId:'selected/1',canonicalDetachmentId:id('main')}],detachmentIds:[id('main')],
    units:[physical('one','platform'),physical('two','platform'),physical('escort','escort'),physical('outside','observer')],
    attachments:[],warlordInstanceId:null};
  return {book,state};
}
function rule(book,name,{unitSelector=keyword('UNIT','CONSTRUCT'),modelSelector=keyword('MODEL','SCHOLAR'),
  containingUnitScope='PHYSICAL',operation='MODIFY_STAT',field='M',mode='ADD',value=2,...extra}={}) {
  const entity={id:id(name),parentId:id('main'),kind:'DETACHMENT_RULE',provenance:{sourceId:id('source/'+name)},
    data:{title:name,text:evidence.quote}};
  const effect={id:name+'/effect',operation,targetSubject:'MODEL',targetBinding:'ROSTER_MODELS',
    recipientSelectors:{unit:clone(unitSelector),model:clone(modelSelector)},containingUnitScope,
    ...(operation==='MODIFY_STAT'?{field,mode,value}:{}),conditions:[],lifetime:'ROSTER',evidence:clone(evidence),sourceFields:[['text']],...extra};
  entity.ruleContract={schema:'rule-contract/v2',ruleId:entity.id,ownerId:entity.parentId,sourceId:entity.provenance.sourceId,
    kind:'DETACHMENT_RULE',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',detachmentId:id('main'),
    roles:[],conditions:[],sourceFields:[['text']],clauses:[{id:name+'/clause',roles:[],conditions:[],sourceFields:[['text']],
      rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]};
  book.entities.push(entity);return effect;
}
function execute(book,state,evaluator=api) {
  const bookBefore=clone(book),stateBefore=clone(state);
  const canonical=compileRecipientFixture(book,evaluator);
  const result=executeRosterEffects(canonical,validateRoster(canonical,state,canonical.rosterAttachmentPolicies),evaluator);
  assert.deepEqual(book,bookBefore,'Global selector mutated canonical facts');
  assert.deepEqual(state,stateBefore,'Global selector mutated imported state');
  return result;
}
const unit=(result,instance='one')=>result.units.find(row=>row.instanceId===instance);
const profile=(result,name='analyst',instance='one')=>unit(result,instance).profiles.find(row=>row.canonicalProfileId===id(name));
const applied=(result,instance='one')=>unit(result,instance).applied;
const attached=(book,state)=>changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','escort','one');
const stable=result=>({...result,units:result.units.toSorted((a,b)=>a.instanceId.localeCompare(b.instanceId))});
function proof(row,name,instance,profileName) {
  assert.equal(row.ruleId,id(name));assert.equal(row.clauseId,name+'/clause');assert.equal(row.effectId,name+'/effect');
  assert.equal(row.sourceInstanceId,null,'A Detachment effect has no physical source');
  assert.equal(row.targetInstanceId,instance);assert.equal(row.targetProfileId,id(profileName));
  assert.equal(row.targetCompositionId,`${instance}/${profileName}/PROFILE/${profileName}`);
  assert.deepEqual(row.sourceFields,[['text']]);assert.equal(row.lifetime,'ROSTER');
}

check('global MODEL operation requires no physical source instance',()=>{
  const {book,state}=fixture();rule(book,'global');const result=execute(book,state);
  assert.equal(profile(result).profile.M,'7"');proof(applied(result)[0],'global','one','analyst');
});
check('mixed-profile intrinsic keywords do not leak from eligible sibling',()=>{
  const {book,state}=fixture();rule(book,'mixed');const result=execute(book,state);
  assert.equal(profile(result).profile.M,'7"');assert.equal(profile(result,'shell').profile.M,'5"');
  assert.equal(applied(result).length,1);assert.equal(profile(result,'shell').keywords.includes('SCHOLAR'),false);
});
check('containing UNIT and MODEL selectors must both pass',()=>{
  const {book,state}=fixture();rule(book,'both');const result=execute(book,state);
  assert.equal(profile(result,'observer-profile','outside').profile.M,'5"');
  assert.equal(profile(result,'escort-profile','escort').profile.M,'5"');assert.equal(applied(result,'outside').length,0);
});
check('global selector enumerates duplicate physical instances independently',()=>{
  const {book,state}=fixture();rule(book,'copies');const result=execute(book,state);
  for(const instance of ['one','two']) {assert.equal(profile(result,'analyst',instance).profile.M,'7"');proof(applied(result,instance)[0],'copies',instance,'analyst');}
  assert.notEqual(profile(result,'analyst','one').scopeId,profile(result,'analyst','two').scopeId);
});
check('only imported physical instances are enumerated, never absent canonical units',()=>{
  const {book,state}=fixture();rule(book,'present');state.units=state.units.filter(row=>row.instanceId==='one');
  const result=execute(book,state);assert.equal(result.units.length,1);assert.equal(result.units[0].applied.length,1);
  assert.ok(result.units[0].applied.every(row=>row.targetInstanceId==='one'));
});
check('composition quantities do not invent separate infantry identities',()=>{
  const {book,state}=fixture();rule(book,'quantity',{modelSelector:keyword('MODEL','SHELL')});const result=execute(book,state);
  assert.equal(profile(result,'shell').quantity,2);assert.equal(profile(result,'shell').modelInstanceId,null);
  assert.equal(applied(result).length,1);assert.equal(applied(result)[0].targetModelInstanceId,null);
  assert.equal(applied(result)[0].targetCompositionId,profile(result,'shell').scopeId);
});
check('one canonical MODEL profile split into loadout scopes is evaluated independently',()=>{
  const {book,state}=fixture();rule(book,'loadouts',{modelSelector:keyword('MODEL','SHELL')});
  unit(state).modelRows.find(row=>row.rowId==='shell').loadouts=[{loadoutId:'alternate',quantity:1,selections:[]}];
  const result=execute(book,state),models=unit(result).profiles.filter(row=>row.canonicalProfileId===id('shell'));
  assert.equal(models.length,2);assert.ok(models.every(row=>row.profile.M==='7"'));assert.equal(applied(result).length,2);
  assert.equal(new Set(applied(result).map(row=>row.targetCompositionId)).size,2);
});
check('MODEL identity can select one explicit canonical profile',()=>{
  const {book,state}=fixture();rule(book,'profile',{modelSelector:atom('MODEL_ID','MODEL',{id:id('shell')})});const result=execute(book,state);
  assert.equal(profile(result).profile.M,'5"');assert.equal(profile(result,'shell').profile.M,'7"');
});
check('UNIT identity selector selects containing physical identity without model identity substitution',()=>{
  const {book,state}=fixture();rule(book,'unit-id',{unitSelector:atom('UNIT_ID','UNIT',{id:id('platform')}),modelSelector:always('MODEL')});
  const result=execute(book,state);assert.equal(applied(result).length,2);assert.equal(applied(result,'outside').length,0);
});
check('PHYSICAL eligibility does not include attached member via Bodyguard keywords',()=>{
  const {book,state}=fixture();rule(book,'physical');const result=execute(book,attached(book,state));
  assert.equal(profile(result,'escort-profile','escort').profile.M,'5"');assert.equal(profile(result).profile.M,'7"');
});
check('FORMED eligibility includes attached qualifying models exactly once',()=>{
  const {book,state}=fixture();rule(book,'formed',{containingUnitScope:'FORMED'});const result=execute(book,attached(book,state));
  assert.equal(profile(result,'escort-profile','escort').profile.M,'7"');assert.equal(applied(result,'escort').length,1);
  assert.equal(profile(result,'shell').profile.M,'5"');proof(applied(result,'escort')[0],'formed','escort','escort-profile');
});
check('FORMED eligibility still supports standalone qualifying units',()=>{
  const {book,state}=fixture();rule(book,'standalone',{containingUnitScope:'FORMED'});const result=execute(book,state);
  assert.equal(profile(result).profile.M,'7"');assert.equal(profile(result,'escort-profile','escort').profile.M,'5"');
});
check('formed CHARACTER does not become a MODEL keyword on Bodyguard profiles',()=>{
  const {book,state}=fixture();rule(book,'character',{unitSelector:keyword('UNIT','CHARACTER'),modelSelector:keyword('MODEL','CHARACTER'),containingUnitScope:'FORMED'});
  const result=execute(book,attached(book,state));assert.equal(profile(result).profile.M,'5"');assert.equal(profile(result,'shell').profile.M,'5"');
  assert.equal(profile(result,'escort-profile','escort').profile.M,'7"');
});
check('attached member is not selected if its own MODEL selector fails',()=>{
  const {book,state}=fixture();rule(book,'shell-only',{modelSelector:keyword('MODEL','SHELL'),containingUnitScope:'FORMED'});
  const result=execute(book,attached(book,state));assert.equal(profile(result,'shell').profile.M,'7"');assert.equal(profile(result,'escort-profile','escort').profile.M,'5"');
});
check('detachment without selected membership never applies',()=>{
  const {book,state}=fixture();rule(book,'unselected-rule');const entity=book.entities.at(-1);
  entity.parentId=id('unselected');entity.ruleContract.ownerId=entity.parentId;entity.ruleContract.detachmentId=entity.parentId;
  const result=execute(book,state);assert.ok(result.units.every(row=>row.applied.length===0));
});
check('existing MODEL Invulnerable operation preserves exact profile and before/effective proof',()=>{
  const {book,state}=fixture();rule(book,'save',{field:'INSV',mode:'SET',value:4});const result=execute(book,state),row=applied(result)[0];
  assert.equal(profile(result).profile.INSV,'4+');assert.equal(profile(result,'shell').profile.INSV,'6+');
  assert.equal(profile(result).profile.SV,'3+');assert.equal(row.before,'6+');assert.equal(row.after,'4+');proof(row,'save','one','analyst');
});
check('nested MODEL characteristic keeps canonical shape and exact source-to-field provenance',()=>{
  const {book,state}=fixture();rule(book,'nested-move');
  for(const entity of book.entities.filter(row=>row.kind==='PROFILE')) {
    entity.data.stats={M:entity.data.M,T:entity.data.T};delete entity.data.M;delete entity.data.T;
  }
  const result=execute(book,state),row=applied(result)[0];
  assert.equal(profile(result).profile.stats.M,'7"');assert.equal(profile(result).profile.stats.T,'4');
  assert.equal(profile(result).profile.M,undefined);assert.equal(profile(result,'shell').profile.stats.M,'5"');
  assert.equal(row.before,'5"');assert.equal(row.after,'7"');assert.deepEqual(row.targetFieldPath,['stats','M']);
  proof(row,'nested-move','one','analyst');
  assert.equal(book.entities.find(entity=>entity.id===id('analyst')).data.stats.M,'5"');
});
check('nested MODEL Invulnerable numeric operation preserves sibling and duplicate scope',()=>{
  const {book,state}=fixture();rule(book,'nested-save',{field:'INSV',mode:'SET',value:4});
  for(const entity of book.entities.filter(row=>row.kind==='PROFILE')) {entity.data.stats={INSV:entity.data.INSV};delete entity.data.INSV;}
  const result=execute(book,state);assert.equal(profile(result).profile.stats.INSV,'4+');
  assert.equal(profile(result,'shell').profile.stats.INSV,'6+');assert.equal(profile(result).profile.INSV,undefined);
  assert.deepEqual(applied(result)[0].targetFieldPath,['stats','INSV']);
  assert.notEqual(profile(result,'analyst','one').scopeId,profile(result,'analyst','two').scopeId);
  assert.equal(book.entities.find(entity=>entity.id===id('analyst')).data.stats.INSV,'6+');
});
check('ambiguous flat and nested MODEL characteristic owners fail closed',()=>{
  const {book,state}=fixture();rule(book,'ambiguous-move');book.entities.find(row=>row.id===id('analyst')).data.stats={M:'5"'};
  assert.throws(()=>execute(book,state),/ambig|characteristic|owner|duplicate/i);
});
check('existing ranged BS operation affects selected MODEL weapons only',()=>{
  const {book,state}=fixture();rule(book,'bs',{field:'BS',value:-1,weaponMode:'ranged'});const result=execute(book,state);
  assert.equal(profile(result).weapons[0].data.skill,'3+');assert.equal(profile(result,'shell').weapons[0].data.skill,'4+');
  assert.equal(applied(result)[0].targetWeaponProfileId,id('analyst-rifle'));assert.equal(applied(result)[0].characteristic,'BS');
});
check('existing canonical MODEL ability grant preserves parameters and sibling isolation',()=>{
  const {book,state}=fixture();rule(book,'ability',{operation:'GRANT_ABILITY',ability:{canonicalId:id('recon'),parameters:{distance:6}}});
  const result=execute(book,state);assert.deepEqual(profile(result).abilities,[{canonicalId:id('recon'),name:'Synthetic reconnaissance',parameters:{distance:6}}]);
  assert.deepEqual(profile(result,'shell').abilities,[]);assert.equal(applied(result)[0].targetAbilityId,id('recon'));
});
check('independent global numeric rules compose through existing modifier machinery',()=>{
  const {book,state}=fixture();rule(book,'movement-a');rule(book,'movement-b',{value:1});const result=execute(book,state);
  assert.equal(profile(result).profile.M,'8"');assert.equal(applied(result).length,2);assert.equal(profile(result,'shell').profile.M,'5"');
});
check('duplicate-instance reordering preserves effective state and provenance',()=>{
  const {book,state}=fixture();rule(book,'order');const original=execute(book,attached(book,state));
  const reordered=attached(book,state);reordered.units.reverse();assert.deepEqual(stable(execute(book,reordered)),stable(original));
});
check('reload and backup roundtrip preserve recipient identity and output',()=>{
  const {book,state}=fixture();rule(book,'roundtrip',{containingUnitScope:'FORMED'});const ready=attached(book,state),first=execute(book,ready);
  assert.deepEqual(execute(book,JSON.parse(JSON.stringify(ready))),first);assert.deepEqual(execute(book,ready),first);
});
check('detach removes only eligibility gained through the formed containing unit',()=>{
  const {book,state}=fixture();rule(book,'detach',{containingUnitScope:'FORMED'});const ready=attached(book,state),first=execute(book,ready);
  const detached=changeAttachment(book,ready,book.rosterAttachmentPolicies,'DETACH','escort'),after=execute(book,detached);
  assert.equal(profile(first,'escort-profile','escort').profile.M,'7"');assert.equal(profile(after,'escort-profile','escort').profile.M,'5"');
  assert.equal(profile(after).profile.M,'7"');assert.equal(profile(after,'analyst','two').profile.M,'7"');
  const reattached=changeAttachment(book,detached,book.rosterAttachmentPolicies,'ATTACH','escort','one');assert.deepEqual(execute(book,reattached),first);
});
check('reattach to another physical copy moves only formed eligibility',()=>{
  const {book,state}=fixture();rule(book,'reattach',{unitSelector:keyword('UNIT','CHARACTER'),containingUnitScope:'FORMED'});
  const ready=attached(book,state),first=execute(book,ready),moved=changeAttachment(book,ready,book.rosterAttachmentPolicies,'REATTACH','escort','two'),after=execute(book,moved);
  assert.equal(profile(first).profile.M,'7"');assert.equal(profile(first,'analyst','two').profile.M,'5"');
  assert.equal(profile(after).profile.M,'5"');assert.equal(profile(after,'analyst','two').profile.M,'7"');
});
check('unknown roster selector defers and does not invent effective numeric values',()=>{
  const {book,state}=fixture();rule(book,'unknown',{unitSelector:atom('FIELD','UNIT',{key:'optionalRosterFlag',equals:true},'ROSTER')});
  const result=execute(book,state);assert.equal(profile(result).profile.M,'5"');assert.equal(applied(result).length,0);
  assert.ok(unit(result).conditional.some(row=>row.ruleId===id('unknown')&&row.state==='UNKNOWN'));
});
check('known static failure dominates an unavailable roster condition',()=>{
  const {book,state}=fixture();rule(book,'false',{unitSelector:{op:'ALL',args:[keyword('UNIT','ABSENT'),atom('FIELD','UNIT',{key:'optionalRosterFlag',equals:true},'ROSTER')]}});
  const result=execute(book,state);assert.equal(applied(result).length,0);assert.equal(unit(result).conditional.length,0);
});
check('MODEL static failure dominates an unknown containing UNIT selector',()=>{
  const {book,state}=fixture();rule(book,'cross-selector-false',{
    unitSelector:atom('FIELD','UNIT',{key:'optionalRosterFlag',equals:true},'ROSTER'),modelSelector:keyword('MODEL','ABSENT')});
  const result=execute(book,state);assert.ok(result.units.every(row=>row.applied.length===0&&row.conditional.length===0));
});
check('invalid selector context fails closed instead of being treated as unknown',()=>{
  const {book,state}=fixture();rule(book,'invalid');
  assert.throws(()=>execute(book,state,{...api,evaluatePredicate:()=> 'INVALID'}),/invalid/i);
});
check('missing explicit intrinsic profile binding fails closed',()=>{
  const {book,state}=fixture();rule(book,'missing-binding');book.rosterProfileBindings=book.rosterProfileBindings.filter(row=>row.profileId!==id('shell'));
  assert.throws(()=>execute(book,state),/binding|profile/i);
});
check('absent profile metadata cannot inherit containing UNIT keywords as MODEL facts',()=>{
  const {book,state}=fixture();rule(book,'no-bindings');delete book.rosterProfileBindings;
  assert.throws(()=>execute(book,state),/binding|profile/i);
});
for(const [name,mutate] of [
  ['missing selector pair',effect=>{delete effect.recipientSelectors;}],
  ['missing UNIT selector',effect=>{delete effect.recipientSelectors.unit;}],
  ['missing MODEL selector',effect=>{delete effect.recipientSelectors.model;}],
  ['wrong UNIT selector subject',effect=>{effect.recipientSelectors.unit=keyword('MODEL','SCHOLAR');}],
  ['wrong MODEL selector subject',effect=>{effect.recipientSelectors.model=keyword('UNIT','CONSTRUCT');}],
  ['battle condition in UNIT selector',effect=>{effect.recipientSelectors.unit=atom('FIELD','UNIT',{key:'battleFlag',equals:true},'BATTLE');}],
  ['nested battle condition in MODEL selector',effect=>{effect.recipientSelectors.model={op:'ALL',args:[always('MODEL'),atom('FIELD','MODEL',{key:'battleFlag',equals:true},'BATTLE')]};}],
  ['unknown MODEL canonical identity',effect=>{effect.recipientSelectors.model=atom('MODEL_ID','MODEL',{id:id('missing')});}],
  ['unknown containing UNIT canonical identity',effect=>{effect.recipientSelectors.unit=atom('UNIT_ID','UNIT',{id:id('missing')});}],
  ['missing containing UNIT scope',effect=>{delete effect.containingUnitScope;}],
  ['invalid containing UNIT scope',effect=>{effect.containingUnitScope='INTRINSIC_MODEL';}],
  ['global MODEL binding with UNIT recipient',effect=>{effect.targetSubject='UNIT';}],
  ['source evidence severed',effect=>{effect.evidence.quote='Unreviewed invented source wording';}]
])check(name+' is rejected by the shared validator',()=>{
  const {book,state}=fixture(),effect=rule(book,'negative');mutate(effect);assert.throws(()=>execute(book,state));
});

console.log(JSON.stringify({status:'PASS',syntheticChecks:checks.length,bookFactualReads:0,checks}));
