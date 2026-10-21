/** Opt-in conditional rule policies. These describe permissions/defences;
 * they never resolve a roll, select a battle target or mutate characteristics. */
const clone=structuredClone;
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const requireValue=(value,message)=>{if(!value)throw new TypeError(message);};
const keys=(value,required,optional=[])=>value&&typeof value==='object'&&!Array.isArray(value)&&required.every(k=>Object.hasOwn(value,k))&&Object.keys(value).every(k=>[...required,...optional].includes(k));
const uniqueStrings=(items,allowed)=>Array.isArray(items)&&items.length>0&&new Set(items).size===items.length&&items.every(v=>typeof v==='string'&&v&&(allowed===undefined||allowed.includes(v)));
export function validateConditionalPolicy(book,rule,clause){
 const policy=clause.conditionalPolicy;if(policy===undefined)return;
 const index=new Map(book.entities.map(e=>[e.id,e]));
 requireValue(clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0,'Conditional policy cannot execute roster effects');
 requireValue(rule.provenance?.sourceId&&['DATASHEET_ABILITY','DATASHEET_SECTION','ENHANCEMENT'].includes(rule.kind)&&
  (rule.kind==='ENHANCEMENT'?index.get(rule.parentId)?.kind==='DETACHMENT'&&rule.ruleContract.assignment:index.get(rule.parentId)?.kind==='DATASHEET'),'Unresolved conditional policy source owner');
 requireValue(keys(policy,['kind','recipientScope','payload','evidence','contextQuote'],['aura','activationReferenceId']),'Malformed conditional policy');
 requireValue(['PHYSICAL_UNIT','FORMED_UNIT','AURA_UNRESOLVED'].includes(policy.recipientScope),'Invalid conditional recipient scope');
 requireValue(keys(policy.evidence,['field','quote'])&&Array.isArray(policy.evidence.field)&&policy.evidence.field.length&&policy.evidence.field.every(k=>typeof k==='string'&&k)&&typeof policy.evidence.quote==='string'&&policy.evidence.quote,'Unproven conditional policy');
 const text=policy.evidence.field.reduce((value,key)=>value?.[key],rule.data);
 requireValue(typeof text==='string'&&policy.contextQuote===text&&text.includes(policy.evidence.quote),'Unproven conditional policy context');
 if(policy.recipientScope==='AURA_UNRESOLVED')requireValue(keys(policy.aura,['range','allegiance','unitKeyword'])&&Number.isSafeInteger(policy.aura.range)&&policy.aura.range>0&&policy.aura.allegiance==='FRIENDLY'&&typeof policy.aura.unitKeyword==='string'&&policy.aura.unitKeyword,'Invalid unresolved aura');
 else requireValue(policy.aura===undefined,'Aura metadata on a resolved UNIT scope');
 if(policy.activationReferenceId!==undefined){
  const activation=index.get(policy.activationReferenceId);
  requireValue(activation&&activation.id!==rule.id&&activation.parentId===rule.parentId&&activation.bookId===rule.bookId&&['DATASHEET_ABILITY','DATASHEET_SECTION'].includes(activation.kind)&&typeof activation.data.text==='string'&&activation.provenance?.sourceId,'Unresolved conditional activation reference');
 }
 const p=policy.payload;
 switch(policy.kind){
  case 'QUALIFIED_FNP':requireValue(keys(p,['threshold','damageKinds'])&&Number.isInteger(p.threshold)&&p.threshold>=2&&p.threshold<=6&&uniqueStrings(p.damageKinds,['PSYCHIC_ATTACK','MORTAL_WOUND']),'Invalid qualified FNP policy');break;
  case 'REROLL':requireValue(keys(p,['roll','results'],['weaponMode'])&&['HIT','WOUND','CHARGE','WEAPON_ATTACKS','HAZARD'].includes(p.roll)&&['ALL','ONES'].includes(p.results)&&(p.results!=='ONES'||['HIT','WOUND'].includes(p.roll))&&(p.weaponMode===undefined||['HIT','WOUND'].includes(p.roll)&&['melee','ranged'].includes(p.weaponMode)),'Invalid reroll policy');break;
  case 'INCOMING_MODIFIER':requireValue(keys(p,['field','mode','value'],['weaponMode','comparison'])&&['HIT_ROLL','WOUND_ROLL','DAMAGE'].includes(p.field)&&p.mode==='ADD'&&Number.isSafeInteger(p.value)&&p.value!==0&&(p.weaponMode===undefined||['melee','ranged'].includes(p.weaponMode))&&(p.comparison===undefined||p.field==='WOUND_ROLL'&&p.comparison==='ATTACK_STRENGTH_GT_TARGET_TOUGHNESS'),'Invalid incoming modifier policy');break;
  case 'IGNORE_MODIFIERS':requireValue(keys(p,['fields','optional'])&&uniqueStrings(p.fields,['BS','WS','HIT_ROLL'])&&p.optional===true,'Invalid ignore-modifier policy');break;
  case 'STRATAGEM_TARGET_RESTRICTION':{
   requireValue(keys(p,['action','stratagemId','ownerBookId'])&&p.action==='PROHIBIT','Invalid Stratagem restriction policy');
   const target=index.get(p.stratagemId),detachment=index.get(target?.parentId);
   requireValue(target?.kind==='STRATAGEM'&&target.provenance?.sourceId&&target.bookId===p.ownerBookId&&typeof p.ownerBookId==='string'&&detachment?.kind==='DETACHMENT'&&detachment.bookId===p.ownerBookId,'Unresolved conditional Stratagem owner/reference');break;
  }
  default:throw new TypeError('Unsupported conditional policy kind');
 }
}
export function appendConditionalPolicy(result,rule,clause,source,ownerModel){
 if(!clause.conditionalPolicy)return;
 requireValue(source,'Missing conditional physical source');
 const policy=clause.conditionalPolicy,group=result.formedUnits.find(g=>g.formedUnitId===source.formedUnitId);
 const recipients=policy.recipientScope==='AURA_UNRESOLVED'?[]:policy.recipientScope==='FORMED_UNIT'&&group?[...group.memberInstanceIds]:[source.instanceId];
 const storage=policy.recipientScope==='AURA_UNRESOLVED'?[source]:result.units.filter(u=>recipients.includes(u.instanceId));
 for(const unit of storage)unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',reason:'Battle context is not resolved; no automatic calculation',execution:'CONDITIONAL_TEXT_ONLY',policy:clone(policy),sourceInstanceId:source.instanceId,sourceModelScopeId:ownerModel?.scopeId||null,recipientInstanceIds:[...recipients],sourceProvenance:clone(rule.provenance)});
}
export function projectConditionalPolicy(book,projection,unit,row){
 if(!row.policy)return clone(row);
 const index=new Map(book.entities.map(e=>[e.id,e])),rule=index.get(row.ruleId),clause=rule?.ruleContract?.clauses.find(c=>c.id===row.clauseId),source=projection.units.find(u=>u.instanceId===row.sourceInstanceId);
 requireValue(source&&equal(row.policy,clause?.conditionalPolicy)&&equal(row.sourceProvenance,rule.provenance)&&row.execution==='CONDITIONAL_TEXT_ONLY'&&row.state==='UNKNOWN','Unresolved conditional policy provenance');
 validateConditionalPolicy(book,rule,clause);
 requireValue(rule.kind==='ENHANCEMENT'?source.enhancementIds.includes(rule.id):source.canonicalUnitId===rule.parentId,'Foreign conditional physical source');
 const group=projection.formedUnits.find(g=>g.formedUnitId===source.formedUnitId),expected=row.policy.recipientScope==='AURA_UNRESOLVED'?[]:row.policy.recipientScope==='FORMED_UNIT'&&group?[...group.memberInstanceIds]:[source.instanceId];
 requireValue(equal(row.recipientInstanceIds,expected)&&(expected.length?expected.includes(unit.instanceId):unit.instanceId===source.instanceId),'Foreign conditional recipient');
 const model=row.sourceModelScopeId?source.profiles.find(p=>p.scopeId===row.sourceModelScopeId):null;
 if(row.sourceModelScopeId)requireValue(model?.quantity===1,'Unresolved conditional MODEL bearer');
 const ownerRole=rule.ruleContract.assignment&&rule.ruleContract.roles.find(r=>r.id===rule.ruleContract.assignment.ownerRoleId);
 if(ownerRole?.subject==='MODEL')requireValue(model&&(!source.enhancementAssignments?.length||source.enhancementAssignments.some(a=>a.enhancementId===rule.id&&a.modelScopeId===model.scopeId)),'Missing conditional MODEL assignment');
 if(ownerRole?.subject!=='MODEL')requireValue(row.sourceModelScopeId===null,'Unexpected conditional MODEL bearer');
 const activation=row.policy.activationReferenceId?index.get(row.policy.activationReferenceId):null;
 const title=id=>index.get(id)?.data.title||index.get(id)?.data.name||id;
 return {...clone(row),...(activation?{activationContext:{canonicalId:activation.id,label:title(activation.id),text:activation.data.text,provenance:clone(activation.provenance)}}:{}),sourceLabel:`${title(source.canonicalUnitId)} (${source.instanceId})`,sourceModelLabel:model?`${title(model.canonicalProfileId)} (${model.scopeId})`:null,recipientLabels:expected.map(id=>{const u=projection.units.find(u=>u.instanceId===id);return `${title(u.canonicalUnitId)} (${id})`;})};
}
