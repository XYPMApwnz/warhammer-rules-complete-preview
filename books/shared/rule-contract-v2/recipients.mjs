/** Lossless producer translation of declared recipient addresses.
 * This module never interprets source prose or selects physical roster units.
 */
import {conditionDeclarationView} from './conditions-build.mjs';
const clone=structuredClone;
const own=(value,key)=>Object.hasOwn(value,key);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=message=>{throw new TypeError('Recipient contract: '+message);};
const requireValue=(value,message)=>{if(!value)fail(message);};
const array=value=>Array.isArray(value)?value:[];
const FROM=new Set(['SOURCE_MODEL','SOURCE_UNIT','SOURCE_UNIT_MODELS','SOURCE_FORMED_MODELS','LEADERS_OF_SOURCE','ROSTER_UNITS','ROSTER_MODELS']);
const WHO=new Set(['MODEL','UNIT','PLAYER','ROSTER']);
const STATUSES=new Set(['RECORDED','NOT_RECORDED','NOT_APPLICABLE']);
const ADDRESS=['targetBinding','targetSubject','unitScope','recipientSelectors','containingUnitScope'];
const POLICY_ADDRESS=['recipientScope','recipientKeywords','aura'];
const RECIPIENT_FIELDS=new Set(['id','who','side','from','how','scope','unitKeywords','modelKeywords','roleId','purpose','binding','actorRoleId','sourceRoleId','anchorRoleId','prerequisites','distinctFromRoleIds','conditions','selector','recipientSelectors','containingUnitScope','aura','allegiance','required','optional','evidence','textKind']);
const roleIndex=(rule,clause)=>new Map([...array(rule.ruleContract?.roles),...array(clause.roles)].map(role=>[role.id,role]));
const excludedStratagem=rule=>rule.kind==='STRATAGEM'||rule.ruleContract?.kind==='STRATAGEM';
const leaves=node=>node?.op?array(node.args).flatMap(leaves):node?.predicate?[node]:[];
const explicitRolePurposes=new Set(['RECIPIENT','EFFECT_RECIPIENT']);
const commandPoints=clause=>clause.scope==='ROSTER_COMMAND_POINTS'||clause.effect?.scope==='ROSTER_COMMAND_POINTS'||array(clause.semanticEffects).some(effect=>effect.scope==='ROSTER_COMMAND_POINTS');
const copyFields=(target,source,keys)=>{for(const key of keys)if(own(source,key))target[key]=clone(source[key]);return target;};
const idsOf=(value,singular='recipientId',plural='recipientIds')=>{
 requireValue(!(own(value,singular)&&own(value,plural)),'conflicting recipient reference forms');
 const ids=own(value,singular)?[value[singular]]:own(value,plural)?value[plural]:[];
 requireValue(Array.isArray(ids)&&new Set(ids).size===ids.length&&ids.every(id=>typeof id==='string'&&id),'malformed recipient reference');
 return ids;
};
const setIds=(value,ids)=>{
 requireValue(ids.length>0,'empty declared recipient address');
 if(ids.length===1)value.recipientId=ids[0];else value.recipientIds=[...ids];
};
const legacyRoleIds=value=>{
 const primary=value.recipientRoleId??value.targetRoleId;
 if(own(value,'recipientRoleId')&&own(value,'targetRoleId'))requireValue(value.recipientRoleId===value.targetRoleId,'conflicting primary recipient roles');
 const ids=own(value,'recipientRoleIds')?value.recipientRoleIds:primary===undefined?[]:[primary];
 requireValue(Array.isArray(ids)&&new Set(ids).size===ids.length&&ids.every(id=>typeof id==='string'&&id),'malformed producer recipient roles');
 if(primary!==undefined)requireValue(ids.includes(primary),'primary recipient role missing from explicit full set');
 return ids;
};

/** Resolve only the canonical clause address. No legacy address fallback. */
export function resolveRecipient(rule,clause,id){
 requireValue(!excludedStratagem(rule),'Stratagem recipient declarations are outside this translation');
 requireValue(rule?.ruleContract?.clauses?.includes(clause),'foreign clause');
 requireValue(typeof id==='string'&&id,'missing recipient ID');
 const matches=array(clause.recipients).filter(recipient=>recipient.id===id);
 requireValue(matches.length===1,'unresolved or duplicate recipient ID '+id);
 const occurrences=rule.ruleContract.clauses.flatMap(item=>array(item.recipients)).filter(recipient=>recipient.id===id);
 requireValue(occurrences.length===1,'recipient ID is not unique within rule '+id);
 validateRecipient(matches[0],rule,clause);
 return matches[0];
}

function validateRecipient(recipient,rule,clause){
 requireValue(recipient&&typeof recipient==='object'&&!Array.isArray(recipient),'malformed recipient');
 requireValue(Object.keys(recipient).every(key=>RECIPIENT_FIELDS.has(key)),'unknown recipient field');
 requireValue(typeof recipient.id==='string'&&recipient.id&&WHO.has(recipient.who),'missing recipient identity/subject');
 if(own(recipient,'side'))requireValue(['FRIENDLY','ENEMY'].includes(recipient.side),'invalid recipient side');
 if(own(recipient,'from'))requireValue(FROM.has(recipient.from),'invalid recipient source binding');
 if(recipient.from)requireValue(recipient.who===(['SOURCE_UNIT','ROSTER_UNITS'].includes(recipient.from)?'UNIT':'MODEL'),'recipient subject differs from its executable binding');
 if(own(recipient,'how'))requireValue(['ROSTER','IN_BATTLE','AURA'].includes(recipient.how),'invalid recipient selection context');
 if(own(recipient,'scope'))requireValue(recipient.who==='UNIT'&&['PHYSICAL','FORMED'].includes(recipient.scope),'invalid UNIT recipient scope');
 if(own(recipient,'containingUnitScope'))requireValue(['PHYSICAL','FORMED'].includes(recipient.containingUnitScope),'invalid containing UNIT scope');
 for(const key of ['unitKeywords','modelKeywords'])if(own(recipient,key))requireValue(Array.isArray(recipient[key])&&recipient[key].every(value=>typeof value==='string'&&value),'invalid recipient keyword list');
 if(own(recipient,'conditions'))requireValue(Array.isArray(recipient.conditions),'invalid recipient conditions');
 if(own(recipient,'roleId')){
  const role=roleIndex(rule,clause).get(recipient.roleId);
  requireValue(role,'recipient has foreign participant role');
  const expected=role.subject==='FORMED_ATTACHED_UNIT'?'UNIT':role.subject==='ROSTER'&&commandPoints(clause)?'PLAYER':role.subject;
  requireValue(recipient.who===expected,'recipient subject drift from participant');
  for(const key of ['purpose','selector','conditions','sourceRoleId','anchorRoleId','actorRoleId','prerequisites','distinctFromRoleIds','required','optional','evidence'])
   requireValue(own(recipient,key)===own(role,key)&&same(recipient[key],role[key]),'recipient participant proof drift: '+key);
  if(['FRIENDLY','ENEMY'].includes(role.allegiance))requireValue(recipient.side===role.allegiance,'recipient allegiance drift');
  if(own(recipient,'binding'))requireValue(recipient.binding===role.binding,'recipient participant binding drift');
  if(role.binding&&!FROM.has(role.binding))requireValue(recipient.binding===role.binding,'missing participant relation binding');
  if(own(recipient,'allegiance'))requireValue(recipient.allegiance===role.allegiance&&!['FRIENDLY','ENEMY'].includes(role.allegiance),'invented participant allegiance');
  if(role.subject==='FORMED_ATTACHED_UNIT')requireValue(recipient.scope==='FORMED','formed participant lost UNIT scope');
 }
 if(recipient.who==='ROSTER'){
  const atoms=[...leaves(recipient.selector),...array(recipient.conditions).flatMap(leaves)];
  requireValue(atoms.length>0&&atoms.every(node=>['STATIC','ROSTER'].includes(node.contextLevel))&&clause.effect?.scope==='SOURCE_BACKED_MUSTERING_RESTRICTION',
   'ROSTER recipient lacks an explicit mustering restriction');
 }
 if(recipient.who==='PLAYER')requireValue(commandPoints(clause),'PLAYER recipient lacks command-point scope proof');
}

/** Strict canonical declaration validation, independent of roster execution. */
export function validateRuleRecipients(book,rule){
 if(!rule.ruleContract||excludedStratagem(rule))return {status:'PASS',recipients:0};
 requireValue(Array.isArray(rule.ruleContract.clauses),'malformed canonical clause list');
 const clauses=array(rule.ruleContract.clauses),seen=new Set();let total=0;
 if(own(rule.ruleContract,'duration')&&!Array.isArray(rule.ruleContract.duration))requireValue(rule.ruleContract.duration&&typeof rule.ruleContract.duration==='object'&&
  !['roleIds','bindings','recipientIds'].some(key=>own(rule.ruleContract.duration,key)),'untranslated duration recipient addresses');
 for(const clause of clauses){
  requireValue(STATUSES.has(clause.recipientStatus)&&Array.isArray(clause.recipients),'missing canonical recipient declaration');
  requireValue(!own(clause,'effectRecipientRoleIds'),'legacy clause recipient addresses');
  requireValue(!FROM.has(clause.recipientScope)&&clause.recipientScope!=='BODYGUARD_COMPONENT_MODELS','legacy clause recipient binding alias');
  requireValue(clause.recipientStatus==='RECORDED'?clause.recipients.length>0:clause.recipients.length===0,'recipient status disagrees with addresses');
  if(clause.recipientStatus==='NOT_APPLICABLE')requireValue(clause.rosterClassification==='NOT_AN_EFFECT','unproved inapplicable recipient status');
  const referenced=new Set(),consume=value=>{for(const id of idsOf(value)){resolveRecipient(rule,clause,id);referenced.add(id);}};
  for(const recipient of clause.recipients){validateRecipient(recipient,rule,clause);requireValue(!seen.has(recipient.id),'duplicate recipient ID within rule');seen.add(recipient.id);total++;}
  consume(clause);
  if(clause.lifetime){
   requireValue(!own(clause.lifetime,'recipientRoleIds'),'legacy clause lifetime recipient addresses');
   consume(clause.lifetime);
   if(own(clause.lifetime,'recipientIds'))requireValue(clause.lifetime.recipientIds.length>0,'empty clause lifetime recipient set');
  }
  if(own(clause,'f1RecipientIds')){
   requireValue(Array.isArray(clause.f1RecipientIds)&&new Set(clause.f1RecipientIds).size===clause.f1RecipientIds.length,'invalid F1 recipient list');
   for(const id of clause.f1RecipientIds){const recipient=resolveRecipient(rule,clause,id);requireValue(recipient.roleId&&['MODEL','UNIT'].includes(recipient.who)&&['CONDITIONAL','ABILITY_PRESENT','ELIGIBLE_FOR_SELECTION','SELECTED'].includes(recipient.textKind),'unproved F1 recipient');referenced.add(id);}
  }
  for(const effect of [...array(clause.rosterEffects),...array(clause.semanticEffects),...(clause.effect?[clause.effect]:[])]){
   requireValue(!ADDRESS.some(key=>own(effect,key))&&!own(effect,'recipientRoleId')&&!own(effect,'recipientRoleIds')&&!own(effect,'targetRoleId'),'legacy effect recipient addresses');
   consume(effect);
   if(own(effect,'primaryRecipientId')){
    requireValue(Array.isArray(effect.recipientIds)&&effect.recipientIds.length>1&&effect.recipientIds.includes(effect.primaryRecipientId),'primary recipient is outside its recorded full set');
    resolveRecipient(rule,clause,effect.primaryRecipientId);
   }
   if(array(clause.rosterEffects).includes(effect)){
    const ids=idsOf(effect);requireValue(ids.length===1,'roster effect must have one exact recipient channel');
    const recipient=resolveRecipient(rule,clause,ids[0]);
    requireValue(recipient.from&&recipient.side==='FRIENDLY'&&recipient.how==='ROSTER','roster effect lost its declared execution address');
   }
  }
  if(clause.conditionalPolicy){
   requireValue(!POLICY_ADDRESS.some(key=>own(clause.conditionalPolicy,key)),'legacy policy recipient addresses');consume(clause.conditionalPolicy);
   requireValue(idsOf(clause.conditionalPolicy).length===1,'policy must have one recipient channel');
   const recipient=resolveRecipient(rule,clause,idsOf(clause.conditionalPolicy)[0]);
   const aura=recipient.how==='AURA'&&!recipient.from&&!recipient.scope&&recipient.aura;
   const physical=recipient.from==='SOURCE_UNIT'&&['PHYSICAL','FORMED'].includes(recipient.scope)&&!recipient.aura&&recipient.how===undefined&&recipient.unitKeywords===undefined;
   const roster=recipient.from==='ROSTER_UNITS'&&recipient.scope==='FORMED'&&!recipient.aura&&recipient.how===undefined&&Array.isArray(recipient.unitKeywords)&&recipient.unitKeywords.length>0;
   requireValue(recipient.who==='UNIT'&&Boolean(aura||physical||roster),'invalid canonical policy receiver');
  }
  if(clause.rosterReferenceBinding){
   const binding=clause.rosterReferenceBinding;
   requireValue(!['subject','standaloneBinding','attachedBinding','recipientId','recipientIds'].some(key=>own(binding,key)),'legacy or ambiguous reference receiver addresses');
   const standalone=resolveRecipient(rule,clause,binding.standaloneRecipientId),attached=resolveRecipient(rule,clause,binding.attachedRecipientId);
   requireValue(binding.sourceBinding==='SOURCE_MODEL'&&standalone.who==='UNIT'&&attached.who==='UNIT'&&
    standalone.from==='SOURCE_UNIT'&&attached.from==='SOURCE_UNIT'&&standalone.scope==='PHYSICAL'&&attached.scope==='FORMED'&&
    standalone.binding==='SOURCE_UNIT'&&attached.binding==='SOURCE_FORMED_MODELS','reference receiver branch drift');
   requireValue(standalone.id!==attached.id,'reference receiver branches were merged');
   requireValue(Array.isArray(binding.canonicalRuleReferences)&&binding.canonicalRuleReferences.length>0&&
    new Set(binding.canonicalRuleReferences).size===binding.canonicalRuleReferences.length&&
    binding.canonicalRuleReferences.every(id=>book.entities.some(entity=>entity.id===id)),'unresolved canonical granted reference');
   referenced.add(standalone.id);referenced.add(attached.id);
  }
  for(const recipient of clause.recipients)requireValue(referenced.has(recipient.id)||recipient.roleId&&explicitRolePurposes.has(recipient.purpose),'orphan recipient declaration');
 }
 for(const duration of array(rule.ruleContract.duration)){
  requireValue(!own(duration,'roleIds'),'legacy duration role projection');
  if(duration.endpoint==='NOT_EXPLICIT'){requireValue(!duration.bindings&&!duration.recipientIds,'invented unspecified duration recipients');continue;}
  const union=[],boundClauses=new Set();
  for(const binding of array(duration.bindings)){
   requireValue(!own(binding,'roleIds'),'legacy duration role binding');
   const clause=clauses.find(clause=>clause.id===binding.clauseId);requireValue(clause,'foreign duration clause');
   requireValue(!boundClauses.has(clause.id),'duplicate duration clause binding');boundClauses.add(clause.id);
   requireValue(Array.isArray(binding.recipientIds)&&binding.recipientIds.length>0&&new Set(binding.recipientIds).size===binding.recipientIds.length,'missing duration recipient binding');
   requireValue(same(binding.recipientIds,clause.recipientIds),'duration lost/added clause recipients');
   requireValue(same(binding.scopeEvidence,clause.lifetimeEvidence),'duration source scope drift');
   for(const id of binding.recipientIds){resolveRecipient(rule,clause,id);if(!union.includes(id))union.push(id);}
  }
  requireValue(union.length>0&&same(duration.recipientIds,union),'duration recipient projection drift');
 }
 return {status:'PASS',recipients:total};
}
export function validateBookRecipients(book){
 requireValue(Array.isArray(book?.entities),'missing canonical book');
 requireValue(new Set(book.entities.map(entity=>entity.id)).size===book.entities.length,'duplicate canonical entity identity');
 let recipients=0;for(const rule of book.entities)recipients+=validateRuleRecipients(book,rule).recipients;
 return {status:'PASS',recipients};
}

function translatedRole(role,clause){
 const who=role.subject==='FORMED_ATTACHED_UNIT'?'UNIT':role.subject==='ROSTER'&&commandPoints(clause)?'PLAYER':role.subject;
 requireValue(WHO.has(who),'unsupported declared recipient subject');
 const result={who,roleId:role.id};
 if(['FRIENDLY','ENEMY'].includes(role.allegiance))result.side=role.allegiance;
 else if(own(role,'allegiance'))result.allegiance=clone(role.allegiance);
 if(role.subject==='FORMED_ATTACHED_UNIT')result.scope='FORMED';
 if(who==='ROSTER'&&clause.effect?.scope==='SOURCE_BACKED_MUSTERING_RESTRICTION')result.how='ROSTER';
 if(FROM.has(role.binding))result.from=role.binding;
 copyFields(result,role,['purpose','actorRoleId','sourceRoleId','anchorRoleId','prerequisites','distinctFromRoleIds','conditions','selector','required','optional','evidence']);
 copyFields(result,role,['how','unitKeywords','modelKeywords']);
 if(own(role,'scope')){requireValue(who==='UNIT'&&['PHYSICAL','FORMED'].includes(role.scope),'invalid declared participant scope');requireValue(!result.scope||result.scope===role.scope,'conflicting formed participant scope');result.scope=role.scope;}
 if(own(role,'binding')&&!FROM.has(role.binding))result.binding=clone(role.binding);
 return result;
}

/** Compile a fully lowered rule. The caller retains the original facts. */
export function compileRuleRecipients(book,inputRule,options={}){
 const rule=clone(inputRule),contract=rule.ruleContract;if(!contract||excludedStratagem(rule))return rule;
 requireValue(Array.isArray(contract.clauses),'malformed producer clause list');
 requireValue(new Set(contract.clauses.map(clause=>clause.id)).size===contract.clauses.length,'duplicate producer clause identity');
 if(own(contract,'duration')&&!Array.isArray(contract.duration))requireValue(contract.duration&&typeof contract.duration==='object'&&
  !['roleIds','bindings','recipientIds'].some(key=>own(contract.duration,key)),'malformed producer duration recipient list');
 if(array(contract.clauses).every(clause=>Array.isArray(clause.recipients)&&STATUSES.has(clause.recipientStatus))){validateRuleRecipients(book,rule);return rule;}
 requireValue(!array(contract.clauses).some(clause=>own(clause,'recipients')||own(clause,'recipientStatus')),'mixed legacy/canonical recipient declarations');
 const maps=new Map(),f1Declaration=options.f1Declaration||options.producerDetachmentTextDeclaration;
 for(const clause of array(contract.clauses)){
  requireValue(typeof clause.id==='string'&&clause.id,'missing producer clause identity');
  for(const key of ['roles','rosterEffects','semanticEffects','effectRecipientRoleIds'])if(own(clause,key))requireValue(Array.isArray(clause[key]),'malformed producer '+key);
  for(const key of ['effect','conditionalPolicy'])if(own(clause,key))requireValue(clause[key]&&typeof clause[key]==='object'&&!Array.isArray(clause[key]),'malformed producer '+key);
  const original=clone(clause),roles=roleIndex(rule,clause),recipients=[],roleRecipients=new Map(),channelCounts=new Map();
  const add=(channel,value)=>{
   const ordinal=(channelCounts.get(channel)||0)+1;channelCounts.set(channel,ordinal);
   const recipient={id:`${clause.id}::recipient/${channel}/${ordinal}`,...value};recipients.push(recipient);return recipient;
  };
  const roleRecipient=id=>{
   requireValue(typeof id==='string'&&roles.has(id),'unresolved explicit recipient role '+id);
   if(!roleRecipients.has(id))roleRecipients.set(id,add('role',translatedRole(roles.get(id),clause)));return roleRecipients.get(id);
  };
  const roleIds=new Set(array(original.effectRecipientRoleIds));
  for(const role of array(original.roles))if(explicitRolePurposes.has(role.purpose))roleIds.add(role.id);
  const translateEffect=(effect,channel,required=false)=>{
   const explicit=legacyRoleIds(effect);
   if(own(effect,'targetBinding')){
    requireValue(FROM.has(effect.targetBinding)&&['MODEL','UNIT'].includes(effect.targetSubject),'unsupported executable recipient binding');
    requireValue(explicit.length<=1,'executable effect has multiple role addresses');
    const participant=explicit.length?roles.get(explicit[0]):null;
    requireValue(!explicit.length||participant,'unresolved executable effect recipient role');
    const value=participant?translatedRole(participant,clause):{};
    requireValue(!participant||value.who===effect.targetSubject,'effect participant subject drift');
    Object.assign(value,{who:effect.targetSubject,from:effect.targetBinding,side:'FRIENDLY',how:'ROSTER'});
    if(participant){roleIds.add(participant.id);if(participant.subject==='FORMED_ATTACHED_UNIT')requireValue(effect.unitScope==='FORMED','effect lacks its formed participant scope');}
    copyFields(value,effect,['recipientSelectors','containingUnitScope']);
    if(own(effect,'unitScope')){requireValue(value.who==='UNIT','MODEL effect cannot have UNIT scope');value.scope=clone(effect.unitScope);}
    const recipient=add(channel,value);effect.recipientId=recipient.id;
   }else if(explicit.length){
    const ids=explicit.map(id=>{roleIds.add(id);const recipient=roleRecipient(id);if(own(effect,'targetSubject'))requireValue(recipient.who===effect.targetSubject,'semantic effect recipient subject drift');return recipient.id;});setIds(effect,ids);
    const primary=effect.recipientRoleId??effect.targetRoleId;
    if(primary!==undefined&&ids.length>1)effect.primaryRecipientId=roleRecipient(primary).id;
   }else if(effect.scope==='ROSTER_COMMAND_POINTS')effect.recipientId=add(channel,{who:'PLAYER'}).id;
   else if(required)fail('roster effect has no declared recipient');
   for(const key of [...ADDRESS,'recipientRoleId','recipientRoleIds','targetRoleId'])delete effect[key];
  };
  for(const effect of array(clause.rosterEffects))translateEffect(effect,'effect',true);
  for(const effect of array(clause.semanticEffects))translateEffect(effect,'semantic');
  if(clause.effect)translateEffect(clause.effect,'declaration');
  if(clause.lifetime&&own(clause.lifetime,'recipientRoleIds')){
   const ids=clause.lifetime.recipientRoleIds;
   requireValue(Array.isArray(ids)&&ids.length>0&&new Set(ids).size===ids.length,'malformed clause lifetime recipient set');
   clause.lifetime.recipientIds=ids.map(id=>roleRecipient(id).id);
   delete clause.lifetime.recipientRoleIds;
  }
  if(clause.conditionalPolicy){
   const policy=clause.conditionalPolicy,value={who:'UNIT'};
   if(policy.recipientScope==='FORMED_UNIT'||policy.recipientScope==='PHYSICAL_UNIT')Object.assign(value,{from:'SOURCE_UNIT',scope:policy.recipientScope==='FORMED_UNIT'?'FORMED':'PHYSICAL'});
   else if(policy.recipientScope==='ROSTER_UNITS')Object.assign(value,{from:'ROSTER_UNITS',scope:'FORMED',unitKeywords:clone(policy.recipientKeywords)});
   else if(policy.recipientScope==='AURA_UNRESOLVED'){value.how='AURA';value.aura=clone(policy.aura);if(['FRIENDLY','ENEMY'].includes(policy.aura?.allegiance))value.side=policy.aura.allegiance;}
   else fail('unsupported conditional policy recipient scope');
   policy.recipientId=add('policy',value).id;for(const key of POLICY_ADDRESS)delete policy[key];
  }
  if(clause.rosterReferenceBinding){
   const binding=clause.rosterReferenceBinding;
   requireValue(binding.sourceBinding==='SOURCE_MODEL'&&binding.subject==='UNIT'&&binding.standaloneBinding==='SOURCE_UNIT'&&binding.attachedBinding==='SOURCE_FORMED_MODELS','unsupported producer reference receiver address');
   // The established reference consumer returns UNIT instance IDs for both
   // branches. Its attached spelling is not a grant to individual MODELs.
   // Keep that spelling as source metadata, with the proved UNIT branch scope.
   binding.standaloneRecipientId=add('reference',{who:binding.subject,from:'SOURCE_UNIT',scope:'PHYSICAL',binding:binding.standaloneBinding}).id;
   binding.attachedRecipientId=add('reference',{who:binding.subject,from:'SOURCE_UNIT',scope:'FORMED',binding:binding.attachedBinding}).id;
   delete binding.subject;delete binding.standaloneBinding;delete binding.attachedBinding;
  }
  const f1=f1Declaration?.(book,inputRule,original);
  if(f1){
   requireValue(Array.isArray(f1.roles)&&typeof f1.kindFor==='function','invalid F1 producer admission callback');
   clause.f1RecipientIds=f1.roles.map(role=>{requireValue(same(role,roles.get(role.id)),'F1 recipient participant proof drift');roleIds.add(role.id);const recipient=roleRecipient(role.id);recipient.textKind=f1.kindFor(role);return recipient.id;});
  }
  for(const id of roleIds)roleRecipient(id);
  if(own(original,'effectRecipientRoleIds'))clause.recipientIds=array(original.effectRecipientRoleIds).map(id=>roleRecipient(id).id);
  delete clause.effectRecipientRoleIds;
  clause.recipients=recipients;
  if(FROM.has(clause.recipientScope)){
   requireValue(recipients.length>0&&recipients.every(recipient=>recipient.from===clause.recipientScope),'clause recipient binding alias disagrees with declared recipients');
   delete clause.recipientScope;
  }
  if(clause.recipientScope==='BODYGUARD_COMPONENT_MODELS'){
   const participants=recipients.filter(recipient=>recipient.roleId);
   const bodyguardOnly=recipient=>array(recipient.conditions).flatMap(leaves).some(node=>node.predicate==='FIELD'&&node.subject==='MODEL'&&node.contextLevel==='ROSTER'&&node.arguments?.key==='isBodyguardComponentOfSource'&&node.arguments.equals===true);
   requireValue(participants.length>0&&participants.every(bodyguardOnly)&&recipients.every(recipient=>recipient.who==='MODEL'&&recipient.from==='SOURCE_FORMED_MODELS'),'bodyguard clause alias lacks exact component recipient proof');
   requireValue(array(clause.rosterEffects).every(effect=>array(effect.conditions).some(condition=>condition.binding==='TARGET'&&leaves(condition.predicate).some(node=>node.predicate==='FIELD'&&node.subject==='MODEL'&&node.contextLevel==='ROSTER'&&node.arguments?.key==='isBodyguardModel'&&node.arguments.equals===true))),'bodyguard executable effect lost its component restriction');
   delete clause.recipientScope;
  }
  clause.recipientStatus=recipients.length?'RECORDED':clause.rosterClassification==='NOT_AN_EFFECT'?'NOT_APPLICABLE':'NOT_RECORDED';
  maps.set(clause.id,{clause,roleRecipients,oldRoleIds:array(original.effectRecipientRoleIds)});
 }
 for(const duration of array(contract.duration)){
  if(duration.endpoint==='NOT_EXPLICIT'){requireValue(!duration.roleIds&&!duration.bindings,'invented unspecified duration recipients');continue;}
  const union=[];
  for(const binding of array(duration.bindings)){
   const item=maps.get(binding.clauseId);requireValue(item,'duration has foreign clause');
   requireValue(Array.isArray(binding.roleIds)&&same(binding.roleIds,item.oldRoleIds),'duration role binding drift');
   binding.recipientIds=binding.roleIds.map(id=>{const recipient=item.roleRecipients.get(id);requireValue(recipient,'unresolved duration recipient');return recipient.id;});
   delete binding.roleIds;for(const id of binding.recipientIds)if(!union.includes(id))union.push(id);
  }
  requireValue(union.length>0,'duration without explicit recipients');duration.recipientIds=union;delete duration.roleIds;
 }
 if(options.validate!==false)validateRuleRecipients(book,rule);
 return rule;
}

/** One producer boundary after every book-owned lowering/overlay is complete. */
export function compileBookRecipients(inputBook,options={}){
 const book=clone(inputBook);
 book.entities=book.entities.map(rule=>compileRuleRecipients(book,rule,options));
 if(options.validate!==false)validateBookRecipients(book);
 return book;
}

/** Producer/validation scratch view, never an executor compatibility fallback.
 * Redundant scalar/plural producer aliases are represented by one exact set.
 */
export function recipientDeclarationView(inputBook){
 validateBookRecipients(inputBook);
 const book=inputBook.conditionSchema?conditionDeclarationView(inputBook):clone(inputBook);
 for(const rule of book.entities){
  const contract=rule.ruleContract;if(!contract||excludedStratagem(rule))continue;
  const roleIds=(clause,ids)=>ids.map(id=>{
   const recipient=resolveRecipient(rule,clause,id);
   requireValue(recipient.roleId,'declaration view cannot invent a participant role');return recipient.roleId;
  });
  // Resolve all addresses while the canonical rule is still intact.
  const effects=new Map(),policies=new Map(),references=new Map(),clauseRoles=new Map(),durations=new Map();
  for(const clause of contract.clauses){
   if(own(clause,'recipientIds'))clauseRoles.set(clause.id,roleIds(clause,clause.recipientIds));
   for(const effect of [...array(clause.rosterEffects),...array(clause.semanticEffects),...(clause.effect?[clause.effect]:[])]){
    const ids=idsOf(effect),recipients=ids.map(id=>resolveRecipient(rule,clause,id)),fields={};
    if(array(clause.rosterEffects).includes(effect)){
     requireValue(recipients.length===1&&recipients[0].from,'declaration view lost executable address');
     const recipient=recipients[0];fields.targetBinding=recipient.from;fields.targetSubject=recipient.who;
     if(own(recipient,'scope'))fields.unitScope=clone(recipient.scope);
     copyFields(fields,recipient,['recipientSelectors','containingUnitScope']);
     if(recipient.roleId)fields.recipientRoleId=recipient.roleId;
    }else if(recipients.length){
     const participantIds=recipients.map(recipient=>{requireValue(recipient.roleId||recipient.who==='PLAYER'&&effect.scope==='ROSTER_COMMAND_POINTS','declaration view cannot invent semantic participant');return recipient.roleId;});
     if(participantIds.every(Boolean)){
      if(participantIds.length===1)fields.recipientRoleId=participantIds[0];else fields.recipientRoleIds=participantIds;
      if(effect.primaryRecipientId)fields.recipientRoleId=resolveRecipient(rule,clause,effect.primaryRecipientId).roleId;
     }
    }
    effects.set(effect,fields);
   }
   if(clause.conditionalPolicy){
    const ids=idsOf(clause.conditionalPolicy);requireValue(ids.length===1,'declaration view policy address is ambiguous');
    const recipient=resolveRecipient(rule,clause,ids[0]),fields={};
    if(recipient.how==='AURA'&&recipient.aura)Object.assign(fields,{recipientScope:'AURA_UNRESOLVED',aura:clone(recipient.aura)});
    else if(recipient.from==='ROSTER_UNITS'&&recipient.scope==='FORMED')Object.assign(fields,{recipientScope:'ROSTER_UNITS',recipientKeywords:clone(recipient.unitKeywords)});
    else if(recipient.from==='SOURCE_UNIT'&&['PHYSICAL','FORMED'].includes(recipient.scope))fields.recipientScope=recipient.scope==='FORMED'?'FORMED_UNIT':'PHYSICAL_UNIT';
    else fail('declaration view cannot reconstruct a policy address');
    policies.set(clause.conditionalPolicy,fields);
   }
   if(clause.rosterReferenceBinding){
    const binding=clause.rosterReferenceBinding;
    const standalone=resolveRecipient(rule,clause,binding.standaloneRecipientId),attached=resolveRecipient(rule,clause,binding.attachedRecipientId);
    references.set(binding,{subject:standalone.who,standaloneBinding:standalone.binding,attachedBinding:attached.binding});
   }
  }
  for(const duration of array(contract.duration)){
   if(duration.endpoint==='NOT_EXPLICIT')continue;
   const union=[],bindings=duration.bindings.map(binding=>{
    const clause=contract.clauses.find(clause=>clause.id===binding.clauseId),ids=roleIds(clause,binding.recipientIds);
    for(const id of ids)if(!union.includes(id))union.push(id);
    const result={...clone(binding),roleIds:ids};delete result.recipientIds;return result;
   });
   durations.set(duration,{bindings,roleIds:union});
  }
  for(const clause of contract.clauses){
   if(clauseRoles.has(clause.id))clause.effectRecipientRoleIds=clauseRoles.get(clause.id);
   for(const effect of [...array(clause.rosterEffects),...array(clause.semanticEffects),...(clause.effect?[clause.effect]:[])]){
    Object.assign(effect,effects.get(effect));delete effect.recipientId;delete effect.recipientIds;delete effect.primaryRecipientId;
   }
   if(clause.conditionalPolicy){Object.assign(clause.conditionalPolicy,policies.get(clause.conditionalPolicy));delete clause.conditionalPolicy.recipientId;delete clause.conditionalPolicy.recipientIds;}
   if(clause.rosterReferenceBinding){Object.assign(clause.rosterReferenceBinding,references.get(clause.rosterReferenceBinding));delete clause.rosterReferenceBinding.standaloneRecipientId;delete clause.rosterReferenceBinding.attachedRecipientId;}
   if(clause.lifetime&&own(clause.lifetime,'recipientIds')){
    clause.lifetime.recipientRoleIds=clause.lifetime.recipientIds.map(id=>resolveRecipient(rule,clause,id).roleId);
    requireValue(clause.lifetime.recipientRoleIds.every(Boolean),'clause lifetime lost its participant identity');
    delete clause.lifetime.recipientIds;
   }
   delete clause.recipientIds;delete clause.f1RecipientIds;delete clause.recipients;delete clause.recipientStatus;
  }
  for(const duration of array(contract.duration))if(durations.has(duration)){Object.assign(duration,durations.get(duration));delete duration.recipientIds;}
 }
 return book;
}
