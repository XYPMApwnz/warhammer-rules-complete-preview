/** Independent synthetic controls for the existing typed numeric-effect domain.
 * Profiles are imported composition scopes, never synthetic infantry owners.
 * This suite loads no Army Book data or source grammar.
 */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {changeAttachment,validateRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects,validateRosterEffects} from './effects.mjs';
import {projectEffectiveInstance} from './effective-instance.mjs';

const clone=value=>structuredClone(value),id=name=>'synthetic-numeric:'+name;
const evidence={field:['text'],quote:'Reviewed synthetic characteristic and recipient evidence.'};
const evaluator=withRosterDetachments(createRuleContractSchema({stateFields:{
  leading:{contextLevel:'ROSTER',valueType:'boolean'},battleFlag:{contextLevel:'BATTLE',valueType:'boolean'}
}}));
const atom=(predicate,subject,arguments_,contextLevel='STATIC')=>({predicate,subject,arguments:arguments_,contextLevel,evidence:clone(evidence)});
const targetProfile=name=>({binding:'TARGET',predicate:atom('MODEL_ID','MODEL',{id:id(name)})});
const leading=()=>({binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'leading',equals:true},'ROSTER')});
const selection=(name,count=2)=>({selectionKey:name,physicalQuantity:count,canonicalProfileIds:[id(name)],canonicalEquipmentIds:[]});
const checks=[];
const check=(name,run)=>{run();checks.push(name);};

function fixture() {
  const entities=[{id:id('main'),kind:'DETACHMENT',data:{title:'Synthetic detachment'}}],rosterProfileBindings=[];
  for(const [name,profiles] of [['mixed',['a','b']],['leader',['leader-profile']]]) {
    const weaponIds=profiles.flatMap(profile=>['ranged','melee'].map(mode=>id(profile+'-'+mode)));
    entities.push({id:id(name),kind:'DATASHEET',data:{title:name,keywords:name==='leader'?['CHARACTER']:['BODYGUARD'],
      factionKeywords:[],profileIds:profiles.map(id),ruleReferenceIds:[],weaponIds}});
    for(const profile of profiles) {
      entities.push({id:id(profile),parentId:id(name),kind:'PROFILE',data:{name:profile,M:'6"',T:'4',SV:'5+',LD:'6+',OC:'1',INSV:'5+'}});
      rosterProfileBindings.push({unitId:id(name),profileId:id(profile),intrinsicKeywords:name==='leader'?['CHARACTER']:['PROFILE_'+profile],abilities:[],referenceIds:[]});
      for(const mode of ['ranged','melee'])entities.push({id:id(profile+'-'+mode),parentId:id(name),kind:'WEAPON_PROFILE',data:{
        name:profile+' '+mode,mode,range:mode==='ranged'?'18"':'Melee',skill:'4+',attacks:'2',strength:'5',ap:'-1',damage:'1',abilities:[]}});
    }
  }
  const book={bookId:id('book'),entities,rosterProfileBindings,
    rosterAttachmentPolicies:[{sourceId:id('leader'),targetId:id('mixed'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  const unit=(instanceId,name)=>({instanceId,canonicalUnitId:id(name),startingStrength:name==='mixed'?4:1,
    modelRows:(name==='mixed'?['a','b']:['leader-profile']).map(profile=>({rowId:profile,canonicalProfileId:id(profile),quantity:name==='mixed'?2:1,
      selections:['ranged','melee'].map(mode=>selection(profile+'-'+mode,name==='mixed'?2:1)),loadouts:[]})),
    selections:[],enhancementIds:[],warlord:null});
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'synthetic-roster',detachments:[{instanceId:'detachment/1',canonicalDetachmentId:id('main')}],
    detachmentIds:[id('main')],units:[unit('alpha','mixed'),unit('beta','mixed'),unit('leader','leader'),unit('other-leader','leader')],attachments:[],warlordInstanceId:null};
  return {book,state};
}
const unit=(projection,instance='alpha')=>projection.units.find(row=>row.instanceId===instance);
const profile=(projection,name='a',instance='alpha')=>unit(projection,instance).profiles.find(row=>row.canonicalProfileId===id(name));
const weapon=(projection,name='a-ranged',instance='alpha')=>[...unit(projection,instance).weapons,...unit(projection,instance).profiles.flatMap(row=>row.weapons)]
  .find(row=>row.canonicalProfileId===id(name));
function rule(book,state,name,{owner='alpha',parent='mixed',targetSubject='MODEL',targetBinding='SOURCE_UNIT_MODELS',conditions=[targetProfile('a')],
  field='BS',mode='ADD',value=-1,weaponMode='ranged',...extra}={}) {
  const entity={id:id(name),parentId:id('main'),kind:'ENHANCEMENT',provenance:{sourceId:id('source/'+name)},data:{title:name,text:evidence.quote}};
  const ownerRole={id:'owner',subject:'UNIT',allegiance:'FRIENDLY',selector:atom('UNIT_ID','UNIT',{id:id(parent)}),conditions:[]};
  const effect={id:name+'/effect',operation:'MODIFY_STAT',targetSubject,targetBinding,field,mode,value,
    ...(weaponMode?{weaponMode}:{}),conditions:clone(conditions),evidence:clone(evidence),sourceFields:[['text']],lifetime:'ROSTER',...extra};
  entity.ruleContract={schema:'rule-contract/v2',ruleId:entity.id,ownerId:entity.parentId,sourceId:entity.provenance.sourceId,
    kind:'ENHANCEMENT',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',detachmentId:id('main'),roles:[ownerRole],conditions:[],
    assignment:{ownerRoleId:'owner',selector:clone(ownerRole.selector)},sourceFields:[['text']],
    clauses:[{id:name+'/clause',roles:[],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]};
  book.entities.push(entity);unit(state,owner).enhancementIds.push(entity.id);return effect;
}
function execute(book,state,options={}) {
  const baseBook=clone(book),baseState=clone(state);
  evaluator.validateContracts(book);validateRosterEffects(book,evaluator.validatePredicate,evaluator.evaluatePredicate);
  const result=executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),{...evaluator,...options});
  assert.deepEqual(book,baseBook,'Numeric operation mutated canonical facts');assert.deepEqual(state,baseState,'Numeric operation mutated imported state');
  return result;
}
function canonicalContribution(book) {
  const entity={id:id('canonical-contribution'),parentId:id('main'),kind:'ARMY_RULE',
    provenance:{sourceId:id('source/contribution')},data:{title:'Canonical synthetic contribution',text:evidence.quote}};
  entity.ruleContract={schema:'rule-contract/v2',ruleId:entity.id,ownerId:entity.parentId,sourceId:entity.provenance.sourceId,kind:'ARMY_RULE',
    executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'BATTLE',roles:[],conditions:[],sourceFields:[['text']],
    clauses:['first','second'].map(name=>({id:'canonical/'+name,roles:[],conditions:[],sourceFields:[['text']],rosterClassification:'BATTLE_ONLY',
      rosterClassificationNote:{reason:'Activation is not simulated by the current product.'},rosterEffects:[]}))};
  book.entities.push(entity);return name=>({ruleId:entity.id,clauseId:'canonical/'+name});
}
function proof(result,name,{source='alpha',target='alpha',profileName='a',weaponName='a-ranged',field='skill',characteristic='BS',before='4+',after='3+'}={}) {
  const rows=unit(result,target).applied.filter(row=>row.ruleId===id(name));assert.equal(rows.length,1);
  const row=rows[0];assert.equal(row.sourceInstanceId,source);assert.equal(row.targetInstanceId,target);
  assert.equal(row.clauseId,name+'/clause');assert.equal(row.effectId,name+'/effect');assert.equal(row.operation,'MODIFY_STAT');
  assert.equal(row.targetProfileId,profileName?id(profileName):null);assert.equal(row.targetWeaponProfileId,weaponName?id(weaponName):null);
  assert.equal(row.field,field);assert.equal(row.before,before);assert.equal(row.after,after);
  if(field==='skill')assert.equal(row.characteristic,characteristic,'BS and WS share a display field, not their typed identity');
  assert.deepEqual(row.sourceFields,[['text']]);assert.equal(row.lifetime,'ROSTER');
}

// Two occurrences deliberately share a canonical profile AND MODEL scope. Their
// imported keys, never names or modifier values, distinguish their provenance.
function occurrenceFixture() {
  const setup=fixture(),entry=unit(setup.state,'leader');
  entry.modelRows[0].selections=[{...selection('leader-profile-ranged',1),selectionKey:'selected'},
    {...selection('leader-profile-ranged',1),selectionKey:'remainder'}];
  for(const entity of setup.book.entities.filter(e=>e.kind==='DATASHEET'))
    Object.assign(entity.data,{sectionIds:[],wargearOptionIds:[]});
  return setup;
}
function occurrenceRule(book,state,name,{field='strength',value=2,operation='MODIFY_STAT'}={}) {
  const effect=rule(book,state,name,{owner:'leader',parent:'leader',targetBinding:'SOURCE_MODEL',conditions:[],field,value,mode:operation==='MODIFY_RULE_METRIC'?'SET':'ADD'});
  effect.operation=operation;
  const contract=book.entities.find(e=>e.id===id(name)).ruleContract;
  contract.roles[0].subject='MODEL';contract.roles[0].selector=atom('MODEL_ID','MODEL',{id:id('leader-profile')});
  contract.assignment.selector=clone(contract.roles[0].selector);
  return effect;
}
const chooseOccurrence=(rule,key,source,ownerModel)=>({unitInstanceId:source.instanceId,scopeId:ownerModel.scopeId,
  selectionKey:key,canonicalProfileId:id('leader-profile-ranged')});
function assertOccurrenceTrace(row,weapon,instance='leader') {
  assert.equal(row.targetInstanceId,instance);assert.equal(row.targetWeaponProfileId,weapon.canonicalProfileId);
  assert.equal(row.targetWeaponSelectionKey,weapon.selectionKey,'Trace must identify its actual weapon occurrence');
  assert.equal(row.targetWeaponScopeId,weapon.scopeId??null,'Trace must preserve exact physical scope');
}
check('ordinary and selected numeric traces address each occurrence without collapsing independent sources',()=>{
  const {book,state}=occurrenceFixture();occurrenceRule(book,state,'selected-strength');
  occurrenceRule(book,state,'range-first',{field:'range',value:6});occurrenceRule(book,state,'range-second',{field:'range',value:6});
  const result=execute(book,state,{resolveWeaponSelection:({rule,source,ownerModel})=>rule.id===id('selected-strength')?
    chooseOccurrence(rule,'selected',source,ownerModel):undefined});
  const weapons=unit(result,'leader').profiles[0].weapons;assert.equal(weapons.length,2);
  for(const w of weapons){
    assert.equal(w.data.strength,w.selectionKey==='selected'?'7':'5');assert.equal(w.data.range,'30"');
    const rows=unit(result,'leader').applied.filter(r=>r.targetWeaponSelectionKey===w.selectionKey);
    assert.equal(rows.length,w.selectionKey==='selected'?3:2,'Independent +6 range sources cannot be deduplicated');
    rows.forEach(row=>assertOccurrenceTrace(row,w));
  }
  const expected=weapons.flatMap(w=>unit(result,'leader').applied.filter(r=>r.targetWeaponSelectionKey===w.selectionKey));
  assert.equal(expected.length,5,'Every actually applied numeric trace must have an address');
  for(const field of ['targetWeaponSelectionKey','targetWeaponScopeId','targetInstanceId','targetWeaponProfileId']){
    const poisoned=clone(expected[0]);poisoned[field]='foreign';assert.throws(()=>assertOccurrenceTrace(poisoned,weapons[0]),undefined,field+' mutation escaped');
    delete poisoned[field];assert.throws(()=>assertOccurrenceTrace(poisoned,weapons[0]),undefined,'Missing '+field+' mutation escaped');
  }
  assert.equal(unit(result,'other-leader').applied.length,0);assert.deepEqual(execute(book,state,{resolveWeaponSelection:({rule,source,ownerModel})=>
    rule.id===id('selected-strength')?chooseOccurrence(rule,'selected',source,ownerModel):undefined}),result);
});
check('Critical Hit source projection joins physical occurrence and preserves independent sources',()=>{
  const {book,state}=occurrenceFixture();
  for(const [name,value] of [['critical-a',5],['critical-b',5],['critical-remainder',4]])
    occurrenceRule(book,state,name,{field:'criticalHitThreshold',value,operation:'MODIFY_RULE_METRIC'});
  const result=execute(book,state,{resolveWeaponSelection:({rule,source,ownerModel})=>chooseOccurrence(rule,
    rule.id===id('critical-remainder')?'remainder':'selected',source,ownerModel)});
  const projected=projectEffectiveInstance(book,result,'leader');
  for(const w of projected.weapons){
    assert.equal(w.fields.find(f=>f.label==='criticalHitThreshold').value,w.selectionKey==='selected'?5:4);
    assert.deepEqual(w.criticalHitSources.map(s=>s.ruleId).sort(),(w.selectionKey==='selected'?[id('critical-a'),id('critical-b')]:[id('critical-remainder')]).sort());
    w.criticalHitSources.forEach(row=>assertOccurrenceTrace(row,{...w,canonicalProfileId:w.id}));
  }
  for(const field of ['targetWeaponSelectionKey','targetWeaponScopeId','targetCompositionId','targetInstanceId','targetWeaponProfileId']){
    const poisoned=clone(result);unit(poisoned,'leader').applied.find(r=>r.ruleId===id('critical-remainder'))[field]='foreign';
    assert.throws(()=>projectEffectiveInstance(book,poisoned,'leader'),undefined,field+' Critical Hit mutation escaped');
  }
  const missing=clone(result);for(const row of unit(missing,'leader').applied){delete row.targetWeaponSelectionKey;delete row.targetWeaponScopeId;}
  assert.throws(()=>projectEffectiveInstance(book,missing,'leader'),undefined,'Ambiguous legacy canonical-only join escaped');
});
check('Critical Hit legacy fallback is limited to a singular unaddressed occurrence',()=>{
  const {book,state}=occurrenceFixture();unit(state,'leader').modelRows[0].selections.pop();
  occurrenceRule(book,state,'legacy-critical',{field:'criticalHitThreshold',value:5,operation:'MODIFY_RULE_METRIC'});
  const result=execute(book,state);for(const row of unit(result,'leader').applied){delete row.targetWeaponSelectionKey;delete row.targetWeaponScopeId;}
  const weapon=projectEffectiveInstance(book,result,'leader').weapons[0];
  assert.equal(weapon.criticalHitSources.length,1);assert.equal(weapon.criticalHitSources[0].ruleId,id('legacy-critical'));
  assert.equal(weapon.fields.find(f=>f.label==='criticalHitThreshold').value,5);
  for(const field of ['targetWeaponSelectionKey','targetWeaponScopeId']){
    const partial=clone(result);unit(partial,'leader').applied[0][field]=field==='targetWeaponSelectionKey'?'selected':weapon.scopeId;
    assert.throws(()=>projectEffectiveInstance(book,partial,'leader'),undefined,'Partial occurrence address must not use legacy fallback');
  }
  const partitioned=clone(result);unit(partitioned,'leader').profiles[0].weapons[0].quantityPartition={role:'selected'};
  assert.throws(()=>projectEffectiveInstance(book,partitioned,'leader'),undefined,'Modern partition cannot fall back even when alone');
});

check('BS improves ranged skill without changing melee skill or another MODEL profile',()=>{
  const {book,state}=fixture();rule(book,state,'bs');const result=execute(book,state);
  assert.equal(weapon(result).data.skill,'3+');assert.equal(weapon(result,'a-melee').data.skill,'4+');
  assert.equal(weapon(result,'b-ranged').data.skill,'4+');proof(result,'bs');
});
check('WS improves melee skill and preserves exact canonical weapon scope',()=>{
  const {book,state}=fixture();rule(book,state,'ws',{field:'WS',weaponMode:'melee',weaponIds:[id('a-melee')]});
  const result=execute(book,state);assert.equal(weapon(result,'a-melee').data.skill,'3+');assert.equal(weapon(result).data.skill,'4+');
  assert.equal(weapon(result,'b-melee').data.skill,'4+');proof(result,'ws',{weaponName:'a-melee',characteristic:'WS'});
});
check('Range increases only ranged profiles with exact base/effective provenance',()=>{
  const {book,state}=fixture();rule(book,state,'range',{field:'range',value:6});const result=execute(book,state);
  assert.equal(weapon(result).data.range,'24"');assert.equal(weapon(result,'a-melee').data.range,'Melee');
  proof(result,'range',{field:'range',before:'18"',after:'24"'});
});
check('AP improvement has the negative direction and exact weapon/profile scope',()=>{
  const {book,state}=fixture();rule(book,state,'ap',{field:'ap',weaponMode:'melee',weaponIds:[id('a-melee')]});const result=execute(book,state);
  assert.equal(weapon(result,'a-melee').data.ap,'-2');assert.equal(weapon(result).data.ap,'-1');assert.equal(weapon(result,'b-melee').data.ap,'-1');
  proof(result,'ap',{field:'ap',weaponName:'a-melee',before:'-1',after:'-2'});
});
check('AP without a weapon-mode limitation applies to both modes of only the selected MODEL profile',()=>{
  const {book,state}=fixture();rule(book,state,'ap-both',{field:'ap',weaponMode:null});const result=execute(book,state);
  assert.equal(weapon(result).data.ap,'-2');assert.equal(weapon(result,'a-melee').data.ap,'-2');
  assert.equal(weapon(result,'b-ranged').data.ap,'-1');assert.equal(weapon(result,'b-melee').data.ap,'-1');
});
check('ordinary MODEL SV SET preserves Invulnerable, weapons and other physical profiles',()=>{
  const {book,state}=fixture();rule(book,state,'save-set',{field:'SV',mode:'SET',value:3,weaponMode:null});
  const result=execute(book,state);assert.equal(profile(result).profile.SV,'3+');
  assert.equal(profile(result).profile.INSV,'5+');assert.equal(profile(result,'b').profile.SV,'5+');
  assert.equal(profile(result,'a','beta').profile.SV,'5+');assert.equal(profile(result,'leader-profile','leader').profile.SV,'5+');
  assert.deepEqual(weapon(result).data,book.entities.find(e=>e.id===id('a-ranged')).data);
  proof(result,'save-set',{field:'SV',weaponName:null,before:'5+',after:'3+'});
  assert.equal(unit(result).applied[0].characteristic,'SV');
  assert.deepEqual(execute(book,state),result,'Recompute must not accumulate');
  const off=clone(state);unit(off).enhancementIds=[];assert.equal(profile(execute(book,off)).profile.SV,'5+');
});
check('ordinary Save uses the existing nested MODEL stats projection',()=>{
  const {book,state}=fixture(),data=book.entities.find(e=>e.id===id('a')).data;
  data.stats={SV:data.SV};delete data.SV;
  rule(book,state,'nested-save',{field:'SV',mode:'SET',value:3,weaponMode:null});
  const result=execute(book,state);assert.equal(profile(result).profile.stats.SV,'3+');
  assert.equal(profile(result).profile.SV,undefined);assert.deepEqual(unit(result).applied[0].targetFieldPath,['stats','SV']);
  assert.equal(profile(result).profile.INSV,'5+');
});
check('ordinary Save SET resolves one physical bearer among identical MODEL profiles',()=>{
  const {book,state}=fixture(),alpha=unit(state),first=clone(alpha.modelRows[0]),second=clone(first);
  first.rowId='bearer';first.quantity=1;second.rowId='other';second.quantity=1;
  alpha.modelRows=[first,second,alpha.modelRows[1]];
  rule(book,state,'exact-save',{targetBinding:'SOURCE_MODEL',field:'SV',mode:'SET',value:3,weaponMode:null,conditions:[]});
  const contract=book.entities.find(e=>e.id===id('exact-save')).ruleContract;
  contract.roles[0].subject='MODEL';contract.roles[0].selector=atom('MODEL_ID','MODEL',{id:id('a')});
  contract.assignment.selector=clone(contract.roles[0].selector);
  alpha.enhancementAssignments=[{enhancementId:id('exact-save'),modelScopeId:'alpha/bearer/PROFILE/bearer'}];
  const result=execute(book,state),profiles=unit(result).profiles;
  assert.equal(profiles[0].profile.SV,'3+');assert.equal(profiles[1].profile.SV,'5+');
  assert.equal(profiles[2].profile.SV,'5+');assert.equal(profile(result,'a','beta').profile.SV,'5+');
  assert.equal(unit(result).applied[0].targetCompositionId,'alpha/bearer/PROFILE/bearer');
  assert.ok(profiles.every(p=>p.profile.INSV==='5+'));
});
check('ordinary Save rejects UNIT targets, ADD, weapon modes and invalid SET values',()=>{
  for(const patch of [{targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',conditions:[]},{mode:'ADD'},
    {weaponMode:'melee'},{value:'3+'},{value:1},{value:0},{value:3.5},{value:NaN}]) {
    const {book,state}=fixture();rule(book,state,'invalid-save',{field:'SV',mode:'SET',value:3,weaponMode:null,...patch});
    assert.throws(()=>execute(book,state),/Invalid characteristic operation/);
  }
  const {book,state}=fixture();rule(book,state,'unknown-stat',{field:'CHARGE',value:1,weaponMode:null});
  assert.throws(()=>execute(book,state),/Invalid characteristic operation/,'Characteristic whitelist remains closed');
});
check('ordinary Save isolation survives attach, detach and reattach',()=>{
  const {book,state}=fixture();rule(book,state,'save-attachment',{field:'SV',mode:'SET',value:3,weaponMode:null});
  const baseline=execute(book,state),attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');
  const first=execute(book,attached);assert.equal(profile(first).profile.SV,'3+');
  assert.equal(profile(first,'leader-profile','leader').profile.SV,'5+');assert.equal(profile(first,'b').profile.SV,'5+');
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','leader');assert.deepEqual(execute(book,detached),baseline);
  assert.deepEqual(execute(book,changeAttachment(book,detached,book.rosterAttachmentPolicies,'REATTACH','leader','alpha')),first);
});
check('MODEL Invulnerable SET preserves the other profile and canonical base',()=>{
  const {book,state}=fixture();rule(book,state,'invuln-set',{field:'INSV',mode:'SET',value:4,weaponMode:null});const result=execute(book,state);
  assert.equal(profile(result).profile.INSV,'4+');assert.equal(profile(result,'b').profile.INSV,'5+');
  proof(result,'invuln-set',{field:'INSV',weaponName:null,before:'5+',after:'4+'});
});
check('MODEL Invulnerable ADD improves lower target number without changing armour',()=>{
  const {book,state}=fixture();book.entities.find(row=>row.id===id('a')).data.SV='3+';
  rule(book,state,'invuln-add',{field:'INSV',value:-1,weaponMode:null});const result=execute(book,state);
  assert.equal(profile(result).profile.INSV,'4+');assert.equal(profile(result).profile.SV,'3+');
});
check('canonical Invulnerable reference supplies the correct MODEL base',()=>{
  const {book,state}=fixture(),p=book.entities.find(row=>row.id===id('a'));delete p.data.INSV;p.data.invulnerableSaveId=id('save-a');
  book.entities.push({id:id('save-a'),parentId:id('mixed'),kind:'INVULNERABLE_SAVE',data:{value:'5+',profileIds:[id('a')]}});
  rule(book,state,'reference-save',{field:'INSV',value:-1,weaponMode:null});const result=execute(book,state);
  assert.equal(profile(result).profile.INSV,'4+');assert.equal(profile(result,'b').profile.INSV,'5+');
  proof(result,'reference-save',{field:'INSV',weaponName:null,before:'5+',after:'4+'});
});
check('SET may grant a source-backed Invulnerable save to a MODEL without one',()=>{
  const {book,state}=fixture();delete book.entities.find(row=>row.id===id('a')).data.INSV;
  rule(book,state,'new-save',{field:'INSV',mode:'SET',value:4,weaponMode:null});assert.equal(profile(execute(book,state)).profile.INSV,'4+');
});
check('ADD cannot invent an absent Invulnerable base',()=>{
  const {book,state}=fixture();delete book.entities.find(row=>row.id===id('a')).data.INSV;
  rule(book,state,'absent-save',{field:'INSV',value:-1,weaponMode:null});assert.throws(()=>execute(book,state),/characteristic|Invulnerable|invulnerable|base/i);
});
check('canonical Invulnerable reference belonging to another profile fails closed',()=>{
  const {book,state}=fixture(),p=book.entities.find(row=>row.id===id('a'));delete p.data.INSV;p.data.invulnerableSaveId=id('save-b');
  book.entities.push({id:id('save-b'),parentId:id('mixed'),kind:'INVULNERABLE_SAVE',data:{value:'4+',profileIds:[id('b')]}});
  rule(book,state,'foreign-save',{field:'INSV',value:-1,weaponMode:null});assert.throws(()=>execute(book,state),/scope|profile|Invulnerable|invulnerable|reference/i);
});
check('exact physical Enhancement owner does not leak numeric effects to duplicate datasheets',()=>{
  const {book,state}=fixture();rule(book,state,'owner');const result=execute(book,state);
  assert.equal(weapon(result).data.skill,'3+');assert.equal(weapon(result,'a-ranged','beta').data.skill,'4+');
  assert.equal(unit(result,'beta').applied.length,0);assert.equal(unit(result,'other-leader').applied.length,0);
});
check('UNIT weapon modifiers keep aggregate selection ownership without inventing MODEL identity',()=>{
  const {book,state}=fixture();for(const entry of state.units.filter(row=>row.canonicalUnitId===id('mixed'))) {
    entry.selections=entry.modelRows.flatMap(row=>row.selections);entry.modelRows.forEach(row=>{row.selections=[];});
  }
  rule(book,state,'unit-aggregate',{targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',conditions:[],field:'range',value:6,weaponIds:[id('a-ranged')]});
  const result=execute(book,state);assert.equal(weapon(result).data.range,'24"');assert.equal(weapon(result,'a-melee').data.range,'Melee');
  assert.equal(weapon(result).modelInstanceId,null);assert.ok(unit(result).profiles.every(row=>row.weapons.length===0));
  proof(result,'unit-aggregate',{field:'range',before:'18"',after:'24"',profileName:null});
});
check('MODEL selection must not claim unknown aggregate weapon ownership on a mixed-profile UNIT',()=>{
  const {book,state}=fixture();unit(state).selections=[selection('a-ranged')];unit(state).modelRows.forEach(row=>{row.selections=[];});
  rule(book,state,'uncertain-owner');const result=execute(book,state);
  assert.equal(weapon(result).data.skill,'4+');assert.equal(unit(result).applied.length,0);
});
check('singleton MODEL has meaningful ownership of its UNIT aggregate weapons',()=>{
  const {book,state}=fixture();unit(state,'leader').selections=[selection('leader-profile-ranged',1)];unit(state,'leader').modelRows[0].selections=[];
  rule(book,state,'singleton',{owner:'leader',parent:'leader',conditions:[targetProfile('leader-profile')]});const result=execute(book,state);
  assert.equal(weapon(result,'leader-profile-ranged','leader').data.skill,'3+');assert.equal(unit(result,'alpha').applied.length,0);
});
check('independent numeric ADD clauses compose once and preserve each intermediate proof',()=>{
  const {book,state}=fixture();rule(book,state,'plus-one',{field:'strength',value:1});rule(book,state,'plus-two',{field:'strength',value:2});
  const result=execute(book,state);assert.equal(weapon(result).data.strength,'8');
  proof(result,'plus-one',{field:'strength',before:'5',after:'6'});proof(result,'plus-two',{field:'strength',before:'6',after:'8'});
  assert.equal(weapon(result,'b-ranged').data.strength,'5');
});
check('two roster-known activators of the same canonical contribution modify each weapon once',()=>{
  const {book,state}=fixture(),contribution=canonicalContribution(book);
  rule(book,state,'activation-a',{canonicalContribution:contribution('first')});
  rule(book,state,'activation-b',{canonicalContribution:contribution('first')});
  const result=execute(book,state);assert.equal(weapon(result).data.skill,'3+');
  assert.equal(unit(result).applied.length,1);assert.equal(weapon(result,'a-ranged','beta').data.skill,'4+');
});
check('distinct canonical contributions remain independently composable',()=>{
  const {book,state}=fixture(),contribution=canonicalContribution(book);
  rule(book,state,'contribution-a',{canonicalContribution:contribution('first')});
  rule(book,state,'contribution-b',{canonicalContribution:contribution('second')});
  const result=execute(book,state);assert.equal(weapon(result).data.skill,'2+');assert.equal(unit(result).applied.length,2);
});
check('canonical numeric contributions must bind existing rule and clause identities',()=>{
  for(const missing of ['rule','clause']) {
    const {book,state}=fixture(),contribution=canonicalContribution(book),binding=contribution('first');
    binding[missing==='rule'?'ruleId':'clauseId']=id('unresolved');rule(book,state,'broken-contribution',{canonicalContribution:binding});
    assert.throws(()=>execute(book,state),/canonical|contribution|reference|clause/i);
  }
});
check('numeric derived state rebuilds identically from reload/backup snapshots',()=>{
  const {book,state}=fixture();rule(book,state,'rebuild',{field:'range',value:6});rule(book,state,'rebuild-save',{field:'INSV',value:-1,weaponMode:null});
  const first=execute(book,state);assert.deepEqual(execute(book,JSON.parse(JSON.stringify(state))),first);assert.deepEqual(execute(book,state),first);
});
check('BS minimum is applied after all modifiers and does not introduce order dependence',()=>{
  for(const values of [[-1,1],[1,-1]]) {
    const {book,state}=fixture();book.entities.find(row=>row.id===id('a-ranged')).data.skill='2+';
    rule(book,state,'ordered-a',{value:values[0]});rule(book,state,'ordered-b',{value:values[1]});
    const result=execute(book,state);assert.equal(weapon(result).data.skill,'2+');
    for(const row of unit(result).applied)assert.equal(row.finalValue,'2+');
  }
});
check('SET and ADD share one deterministic numeric domain regardless of declaration order',()=>{
  const results=[];
  for(const reverse of [false,true]) {
    const {book,state}=fixture();
    const declarations=[['set',{mode:'SET',value:4}],['add',{value:-1}]];
    for(const [name,options] of reverse?declarations.toReversed():declarations)rule(book,state,name,options);
    results.push(weapon(execute(book,state)).data.skill);
  }
  assert.deepEqual(results,['3+','3+']);
});
for(const [name,field,mode,value,base,expected,weaponMode='ranged'] of [
  ['BS minimum','BS','ADD',-3,'2+','2+'],['BS maximum','BS','ADD',4,'5+','6+'],
  ['WS minimum','WS','ADD',-3,'2+','2+','melee'],['WS maximum','WS','ADD',4,'5+','6+','melee'],
  ['Range minimum','range','ADD',-8,'6"','1"'],['AP maximum','ap','ADD',3,'-1','0'],
  ['Invulnerable minimum','INSV','ADD',-4,'4+','2+',null]
])check(name+' is preserved by existing Core characteristic limits',()=>{
  const {book,state}=fixture(),key=['BS','WS'].includes(field)?'skill':field;
  if(field==='INSV')book.entities.find(row=>row.id===id('a')).data.INSV=base;
  else book.entities.find(row=>row.id===id('a-'+weaponMode)).data[key]=base;
  rule(book,state,'bounds',{field,mode,value,weaponMode});const result=execute(book,state);
  assert.equal(field==='INSV'?profile(result).profile.INSV:weapon(result,'a-'+weaponMode).data[key],expected);
});
check('AP opposite modifiers near zero compose before the maximum applies',()=>{
  for(const values of [[1,-1],[-1,1]]) {
    const {book,state}=fixture();book.entities.find(row=>row.id===id('a-ranged')).data.ap='0';
    rule(book,state,'ordered-ap-a',{field:'ap',value:values[0]});rule(book,state,'ordered-ap-b',{field:'ap',value:values[1]});
    assert.equal(weapon(execute(book,state)).data.ap,'0');
  }
});
check('dash, star and N/A characteristics remain unmodifiable without blocking other eligible weapons',()=>{
  for(const value of ['-','*','N/A'])for(const mode of ['SET','ADD'])for(const field of ['BS','range','ap']) {
    const {book,state}=fixture(),key=field==='BS'?'skill':field;book.entities.find(row=>row.id===id('a-ranged')).data[key]=value;
    rule(book,state,'non-numeric',{field,mode,value:mode==='SET'?3:-1});const result=execute(book,state);
    assert.equal(weapon(result).data[key],value);assert.equal(unit(result).applied.length,0);
  }
});
check('malformed numeric expressions fail closed rather than being treated as unavailable base facts',()=>{
  const {book,state}=fixture();book.entities.find(row=>row.id===id('a-ranged')).data.skill='unknown-value';
  rule(book,state,'malformed-number');assert.throws(()=>execute(book,state),/characteristic|numeric|Unsupported/i);
});
check('attach/detach/re-attach targets only the actual formed MODEL scopes',()=>{
  const {book,state}=fixture();rule(book,state,'formed-save',{owner:'leader',parent:'leader',targetBinding:'SOURCE_FORMED_MODELS',
    conditions:[leading(),targetProfile('a')],field:'INSV',value:-1,weaponMode:null});
  const baseline=execute(book,state);assert.equal(profile(baseline).profile.INSV,'5+');
  const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader','alpha'),first=execute(book,attached);
  assert.equal(profile(first).profile.INSV,'4+');assert.equal(profile(first,'b').profile.INSV,'5+');assert.equal(profile(first,'a','beta').profile.INSV,'5+');
  proof(first,'formed-save',{source:'leader',field:'INSV',weaponName:null,before:'5+',after:'4+'});
  const detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','leader');assert.deepEqual(execute(book,detached),baseline);
  const reattached=changeAttachment(book,detached,book.rosterAttachmentPolicies,'ATTACH','leader','alpha');assert.deepEqual(execute(book,reattached),first);
});
check('weapon identity and MODEL profile conditions both constrain a numeric effect',()=>{
  const {book,state}=fixture();rule(book,state,'intersection',{weaponIds:[id('b-ranged')]});const result=execute(book,state);
  assert.equal(weapon(result).data.skill,'4+');assert.equal(weapon(result,'b-ranged').data.skill,'4+');assert.equal(unit(result).applied.length,0);
});
check('numeric effects reject BATTLE conditions rather than inventing battle state',()=>{
  const {book,state}=fixture();rule(book,state,'battle',{conditions:[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'battleFlag',equals:true},'BATTLE')}]});
  assert.throws(()=>execute(book,state),/Battle predicate/);
});
check('BS cannot target melee weapon profiles',()=>{const {book,state}=fixture();rule(book,state,'wrong-bs',{weaponMode:'melee'});assert.throws(()=>execute(book,state),/characteristic|mode|scope|BS/i);});
check('WS cannot target ranged weapon profiles',()=>{const {book,state}=fixture();rule(book,state,'wrong-ws',{field:'WS'});assert.throws(()=>execute(book,state),/characteristic|mode|scope|WS/i);});
check('Range must declare ranged scope',()=>{const {book,state}=fixture();rule(book,state,'wrong-range',{field:'range',value:6,weaponMode:null});assert.throws(()=>execute(book,state),/characteristic|mode|scope|range/i);});
check('Invulnerable save is MODEL-scoped rather than a UNIT keyword-like mutation',()=>{
  const {book,state}=fixture();rule(book,state,'wrong-invuln',{field:'INSV',value:-1,weaponMode:null,targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',conditions:[]});
  assert.throws(()=>execute(book,state),/characteristic|MODEL|scope|Invulnerable/i);
});

console.log(JSON.stringify({scope:'shared-numeric-effects',checks:checks.length,bookFactualReads:0,
  BS_MODIFIER:'PASS',WS_MODIFIER:'PASS',RANGE_MODIFIER:'PASS',AP_MODIFIER:'PASS',INVULNERABLE_MODIFIER:'PASS',
  PROFILE_SCOPE_ISOLATION:'PASS',PHYSICAL_OWNER_SCOPE:'PASS',INSTANCE_ISOLATION:'PASS',BASE_FACTS_IMMUTABLE:'PASS',
  MODIFIER_COMPOSITION:'PASS',DETERMINISTIC_REBUILD:'PASS',checksPassed:checks},null,2));
