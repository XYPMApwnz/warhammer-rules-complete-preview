/** Opt-in conditional rule policies. These describe permissions/defences;
 * they never resolve a roll, select a battle target or mutate characteristics. */
import {predicateContext,withRosterDetachments} from './context.mjs';
import {createRuleContractSchema,predicateTypes} from '../rule-contract-v2/schema.mjs';
const clone=structuredClone;
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const requireValue=(value,message)=>{if(!value)throw new TypeError(message);};
const keys=(value,required,optional=[])=>value&&typeof value==='object'&&!Array.isArray(value)&&required.every(k=>Object.hasOwn(value,k))&&Object.keys(value).every(k=>[...required,...optional].includes(k));
const uniqueStrings=(items,allowed)=>Array.isArray(items)&&items.length>0&&new Set(items).size===items.length&&items.every(v=>typeof v==='string'&&v&&(allowed===undefined||allowed.includes(v)));
export function validateConditionalPolicy(book,rule,clause){
 const policy=clause.conditionalPolicy;if(policy===undefined)return;
 const index=new Map(book.entities.map(e=>[e.id,e]));
 requireValue(clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0,'Conditional policy cannot execute roster effects');
 const detachment=rule.kind==='DETACHMENT_RULE',parent=index.get(rule.parentId);
 requireValue(rule.provenance?.sourceId&&(detachment
  ?parent?.kind==='DETACHMENT'&&parent.bookId===rule.bookId&&rule.ruleContract.detachmentId===parent.id
  :['DATASHEET_ABILITY','DATASHEET_SECTION','ENHANCEMENT'].includes(rule.kind)&&
   (rule.kind==='ENHANCEMENT'?parent?.kind==='DETACHMENT'&&rule.ruleContract.assignment:parent?.kind==='DATASHEET')),'Unresolved conditional policy source owner');
 requireValue(keys(policy,['kind','recipientScope','payload','evidence','contextQuote'],['aura','activationReferenceId','recipientKeywords','coreReference']),'Malformed conditional policy');
 requireValue(['PHYSICAL_UNIT','FORMED_UNIT','AURA_UNRESOLVED','ROSTER_UNITS'].includes(policy.recipientScope),'Invalid conditional recipient scope');
 requireValue(keys(policy.evidence,['field','quote'])&&Array.isArray(policy.evidence.field)&&policy.evidence.field.length&&policy.evidence.field.every(k=>typeof k==='string'&&k)&&typeof policy.evidence.quote==='string'&&policy.evidence.quote,'Unproven conditional policy');
 const text=policy.evidence.field.reduce((value,key)=>value?.[key],rule.data);
 requireValue(typeof text==='string'&&policy.contextQuote===text&&text.includes(policy.evidence.quote),'Unproven conditional policy context');
 if(detachment)requireValue(policy.recipientScope==='ROSTER_UNITS'&&uniqueStrings(policy.recipientKeywords)&&policy.recipientKeywords.every(keyword=>text.includes(keyword))&&policy.activationReferenceId===undefined,'Unproven Detachment UNIT selector');
 else requireValue(policy.recipientScope!=='ROSTER_UNITS'&&policy.recipientKeywords===undefined,'Detachment selector on physical source');
 if(policy.recipientScope==='AURA_UNRESOLVED')requireValue(keys(policy.aura,['range','allegiance','unitKeyword'])&&Number.isSafeInteger(policy.aura.range)&&policy.aura.range>0&&policy.aura.allegiance==='FRIENDLY'&&typeof policy.aura.unitKeyword==='string'&&policy.aura.unitKeyword,'Invalid unresolved aura');
 else requireValue(policy.aura===undefined,'Aura metadata on a resolved UNIT scope');
 if(policy.activationReferenceId!==undefined){
  const activation=index.get(policy.activationReferenceId);
  requireValue(activation&&activation.id!==rule.id&&activation.parentId===rule.parentId&&activation.bookId===rule.bookId&&['DATASHEET_ABILITY','DATASHEET_SECTION'].includes(activation.kind)&&typeof activation.data.text==='string'&&activation.provenance?.sourceId,'Unresolved conditional activation reference');
 }
 const p=policy.payload;
 const actionReference=(canonicalId,code)=>{
  const ref=policy.coreReference;
  requireValue(keys(ref,['canonicalId','ownerBookId','code','label','quote','sourceUnitIds','sourceContentHashes','provenance'])&&ref.canonicalId===canonicalId&&p.referenceId===ref.canonicalId&&ref.ownerBookId==='core-rules'&&ref.code===code&&typeof ref.label==='string'&&ref.label&&typeof ref.quote==='string'&&ref.quote&&uniqueStrings(ref.sourceUnitIds)&&uniqueStrings(ref.sourceContentHashes)&&ref.sourceContentHashes.every(hash=>/^[A-Fa-f0-9]{64}$/.test(hash))&&Boolean(ref.provenance?.base?.sourceId||ref.provenance?.sourceId),'Unresolved conditional Core action reference');
 };
 if(!['ATTACK_TARGET_RESTRICTION','ACTION_CP_MODIFIER'].includes(policy.kind))requireValue(policy.coreReference===undefined,'Unexpected conditional Core action reference');
 switch(policy.kind){
  case 'QUALIFIED_FNP':requireValue(keys(p,['threshold','damageKinds'])&&Number.isInteger(p.threshold)&&p.threshold>=2&&p.threshold<=6&&uniqueStrings(p.damageKinds,['PSYCHIC_ATTACK','MORTAL_WOUND']),'Invalid qualified FNP policy');break;
  case 'REROLL':requireValue(keys(p,['roll','results'],['weaponMode'])&&['HIT','WOUND','CHARGE','WEAPON_ATTACKS','HAZARD','ADVANCE','LEADERSHIP'].includes(p.roll)&&['ALL','ONES'].includes(p.results)&&(p.results!=='ONES'||['HIT','WOUND'].includes(p.roll))&&(p.weaponMode===undefined||['HIT','WOUND'].includes(p.roll)&&['melee','ranged'].includes(p.weaponMode)),'Invalid reroll policy');break;
  case 'INCOMING_MODIFIER':requireValue(keys(p,['field','mode','value'],['weaponMode','comparison'])&&['HIT_ROLL','WOUND_ROLL','DAMAGE'].includes(p.field)&&p.mode==='ADD'&&Number.isSafeInteger(p.value)&&p.value!==0&&(p.weaponMode===undefined||['melee','ranged'].includes(p.weaponMode))&&(p.comparison===undefined||p.field==='WOUND_ROLL'&&p.comparison==='ATTACK_STRENGTH_GT_TARGET_TOUGHNESS'),'Invalid incoming modifier policy');break;
  case 'IGNORE_MODIFIERS':requireValue(keys(p,['fields','optional'])&&uniqueStrings(p.fields,['BS','WS','HIT_ROLL'])&&p.optional===true,'Invalid ignore-modifier policy');break;
  case 'ATTACK_TARGET_RESTRICTION':
   requireValue(keys(p,['action','attackKind','referenceId'])&&p.action==='PROHIBIT'&&p.attackKind==='SNAP_SHOOTING','Invalid attack target restriction policy');
   actionReference('core-rule-15-09-snap-shooting','15.09');break;
  case 'ACTION_CP_MODIFIER':
   requireValue(keys(p,['action','mode','value','referenceId'])&&p.action==='HEROIC_INTERVENTION'&&p.mode==='ADD'&&Number.isSafeInteger(p.value)&&p.value!==0,'Invalid action CP modifier policy');
   actionReference('core-rule-15-11-heroic-intervention','15.11');break;
  case 'STRATAGEM_TARGET_RESTRICTION':{
   requireValue(keys(p,['action','stratagemId','ownerBookId'])&&p.action==='PROHIBIT','Invalid Stratagem restriction policy');
   const target=index.get(p.stratagemId),detachment=index.get(target?.parentId);
   requireValue(target?.kind==='STRATAGEM'&&target.provenance?.sourceId&&target.bookId===p.ownerBookId&&typeof p.ownerBookId==='string'&&detachment?.kind==='DETACHMENT'&&detachment.bookId===p.ownerBookId,'Unresolved conditional Stratagem owner/reference');break;
  }
  default:throw new TypeError('Unsupported conditional policy kind');
 }
}
// Source-declared UNIT keywords use the existing formed UNIT vocabulary. This
// selects consumers only; it never changes intrinsic UNIT or MODEL keywords.
const detachmentRecipients=(projection,policy)=>projection.units.filter(unit=>{
 const group=projection.formedUnits.find(row=>row.formedUnitId===unit.formedUnitId);
 return policy.recipientKeywords.every(keyword=>(group?.keywords||unit.keywords).includes(keyword));
});
const componentRecipients=(projection,unit)=>projection.formedUnits.find(group=>group.formedUnitId===unit.formedUnitId)?.memberInstanceIds||[unit.instanceId];
const evidenceText=(rule,evidence)=>evidence?.field?.reduce((value,key)=>value?.[key],rule.data);
const sourceProvenancePresent=value=>value&&typeof value==='object'&&!Array.isArray(value)&&typeof value.sourceId==='string'&&value.sourceId.trim().length>0;
const provenSelector=node=>{
 if(node?.op==='ALL')return node.args.some(provenSelector);
 if(node?.op==='ANY')return node.args.length>0&&node.args.every(provenSelector);
 return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate);
};
const conditionLeaves=node=>node?.args?node.args.flatMap(conditionLeaves):node?[node]:[];
// This derives a presentation label, never a recipient or a gameplay fact.
// A legacy role without purpose is usable only when its own source evidence
// explicitly offers selection of that already-structured physical recipient.
function offersRecipientSelection(role,clause,rule){
 const keywords=conditionLeaves(role.selector).filter(node=>['MODEL_KEYWORD','UNIT_KEYWORD'].includes(node.predicate)).map(node=>node.arguments.keyword);
 const evidence=[clause.evidence,...[...(role.conditions||[]),...(clause.conditions||[])].flatMap(conditionLeaves)
  .filter(node=>node.contextLevel==='BATTLE'&&node.roleId===role.id).map(node=>node.evidence)].filter(Boolean);
 return evidence.some(proof=>typeof proof.quote==='string'&&evidenceText(rule,proof)?.includes(proof.quote)&&keywords.some(keyword=>{
  const escaped=keyword.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  // Selecting an ability/augmentation for units is not selecting those units.
  return new RegExp('\\bselect\\s+(?:up to (?:one|two|three|four|five|six|[0-9]+)|one or more|one|two|three|a)\\s+(?:friendly\\s+)?'+escaped+'\\s+(?:units|models)\\b','i').test(proof.quote);
 }));
}
function textRoles(clause,rule){
 const roles=clause.roles||[],ids=clause.effectRecipientRoleIds;
 return roles.filter(role=>(ids?ids.includes(role.id):['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)||
   role.purpose===undefined&&offersRecipientSelection(role,clause,rule))&&
  role.allegiance==='FRIENDLY'&&['MODEL','UNIT','FORMED_ATTACHED_UNIT'].includes(role.subject)&&
  provenSelector(role.selector)&&!role.sourceRoleId&&!role.prerequisites?.length);
}
/** Exact runtime ownership chain; cycles, duplicates and missing parents fail closed. */
export function detachmentOwnerChain(book,rule){
 const chain=[],seen=new Set();let current=rule;
 while(current){
  if(seen.has(current.id)||book.entities.filter(entity=>entity.id===current.id).length!==1)return null;
  seen.add(current.id);chain.push({id:current.id,kind:current.kind,parentId:current.parentId||null});
  if(current.kind==='DETACHMENT')return chain;
  current=book.entities.find(entity=>entity.id===current.parentId);
 }
 return null;
}
const internalRuleText=value=>typeof value==='string'&&/:rule:table:|\btable-\d+-row-\d+\b|\bsource-clause-/i.test(value);
function readableClauseText(rule,clause){
 const fields=(clause.sourceFields||[]).filter(field=>!/(?:^id$|Id$|Ids$)/.test(String(field.at(-1))))
  .map(field=>field.reduce((value,key)=>value?.[key],rule.data));
 let text=fields.filter(value=>typeof value==='string'&&!internalRuleText(value)).join('\n');
 if(!text&&clause.evidence?.quote&&!clause.evidence.otherEntityId&&evidenceText(rule,clause.evidence)?.includes(clause.evidence.quote))text=clause.evidence.quote;
 const tables=fields.flatMap(value=>Array.isArray(value)?value.filter(table=>Array.isArray(table?.rows)):[]);
 text+=tables.map(table=>'\n'+table.rows.map(row=>row.join(' · ')).join('\n')).join('');
 return text&&!internalRuleText(text)?text:null;
}
/** Resolve source text structurally. IDs are addresses, never display text. */
export function detachmentTableOption(book,rule,clause){
 const id=clause.effect?.canonicalTableId,index=clause.effect?.rowIndex;
 if(typeof id!=='string'||!Number.isSafeInteger(index)||index<0)return null;
 const matches=book.entities.filter(entity=>entity.id===id),table=matches[0];
 if(matches.length!==1||table.kind!=='STRUCTURED_RULE_TABLE'||table.parentId!==rule.id||!sourceProvenancePresent(table.provenance))return null;
 const cells=table.data?.rows?.[index],proof=clause.evidence;
 if(!Array.isArray(cells)||!cells.length||!cells.every(cell=>typeof cell==='string')||!cells.some(cell=>cell.trim())||
   proof?.otherEntityId!==id||!equal(proof.field,['rows',index])||proof.quote!==JSON.stringify(cells)||cells.some(internalRuleText))return null;
 const refs=(clause.sourceFields||[]).filter(field=>field.at(-1)==='tableId');
 if(refs.length!==1||refs[0].reduce((value,key)=>value?.[key],rule.data)!==id)return null;
 const ref=refs[0],position=ref.at(-2),containerPath=ref.slice(0,-2),container=containerPath.reduce((value,key)=>value?.[key],rule.data);
 if(!Number.isSafeInteger(position)||!Array.isArray(container)||container.filter(value=>value?.tableId===id).length!==1)return null;
 const candidates=(rule.ruleContract?.clauses||[]).flatMap(candidate=>{
  if(candidate===clause||candidate.effect?.canonicalTableId||candidate.conditionalPolicy||candidate.rosterClassification!=='BATTLE_ONLY')return [];
  const text=readableClauseText(rule,candidate);if(!text||!/\bselect\b[\s\S]*\b(?:list below|following abilities)\b/i.test(text))return [];
  return (candidate.sourceFields||[]).filter(field=>equal(field.slice(0,-2),containerPath)&&Number.isSafeInteger(field.at(-2))&&field.at(-2)<position&&field.at(-1)==='text')
   .map(field=>({clause:candidate,text,position:field.at(-2)}));
 });
 if(!candidates.length)return null;
 const nearest=Math.max(...candidates.map(candidate=>candidate.position)),leaders=candidates.filter(candidate=>candidate.position===nearest);
 if(leaders.length!==1)return null;
 return {tableId:id,rowIndex:index,clauseId:clause.id,cells:clone(cells),text:cells.filter(cell=>cell.length).join(' · '),
  sourceProvenance:clone(table.provenance),leadingClauseId:leaders[0].clause.id,leadingText:leaders[0].text};
}
/** One declaration channel for textual Detachment clauses. Roles are already
 * source-bound contracts; an OWNER/ANCHOR or ALWAYS is never a recipient. */
export function detachmentTextDeclaration(book,rule,clause){
 if(rule.kind!=='DETACHMENT_RULE'||clause.rosterClassification!=='BATTLE_ONLY'||
  clause.rosterEffects.length||clause.conditionalPolicy)return null;
 const chain=detachmentOwnerChain(book,rule),owner=chain?.at(-1);
 if(!owner||rule.ruleContract.detachmentId&&rule.ruleContract.detachmentId!==owner.id||!sourceProvenancePresent(rule.provenance))return null;
 const roles=textRoles(clause,rule);if(!roles.length)return null;
 const tableReference=clause.effect?.canonicalTableId!==undefined||(clause.sourceFields||[]).some(field=>field.at(-1)==='tableId');
 const tableOption=tableReference?detachmentTableOption(book,rule,clause):null;
 if(tableReference&&!tableOption)return null;
 const text=tableOption?.text||readableClauseText(rule,clause);
 if(!text)return null;
 const tableOptions=tableOption?[]:(rule.ruleContract?.clauses||[]).map(candidate=>detachmentTableOption(book,rule,candidate)).filter(option=>option?.leadingClauseId===clause.id);
 const kindFor=role=>tableOption||tableOptions.length||offersRecipientSelection(role,clause,rule)||clause.potentialKeywordProjection&&equal(clause.potentialKeywordProjection.selector,role.selector)?'ELIGIBLE_FOR_SELECTION':
   /\b(?:models|units) have the following ability\b/i.test(clause.evidence?.quote||text)?'ABILITY_PRESENT':'CONDITIONAL';
 return {roles,text,kindFor,classification:clause.rosterClassification,chain,detachmentId:owner.id,tableOption,tableOptions};
}
const evaluators=new WeakMap();
const evaluatorFor=book=>{
 if(!evaluators.has(book))evaluators.set(book,withRosterDetachments(createRuleContractSchema(book.rosterSchema)).evaluatePredicate);
 return evaluators.get(book);
};
function detachmentTextRows(book,projection,rule,clause,evaluatePredicate=evaluatorFor(book),recipientUnit){
 const declaration=detachmentTextDeclaration(book,rule,clause);
 if(!declaration||!projection.detachmentIds.includes(declaration.detachmentId))return [];
 const rows=[];
 for(const role of declaration.roles)for(const unit of recipientUnit?[recipientUnit]:projection.units){
  const matches=model=>{
   const context=predicateContext(projection,projection,unit.instanceId,role.subject,model?.scopeId);
   if(!context||evaluatePredicate(role.selector,context)!=='TRUE')return false;
   // Unknown roster eligibility is not proof. Battle conditions only qualify
   // the visible text; mixed-level expressions are left on the source page.
   const leaves=node=>{
    if(!node||typeof node!=='object')return [];
    if(node.op){
     if(!['ALL','ANY','NOT'].includes(node.op)||!Array.isArray(node.args)||!node.args.length||node.op==='NOT'&&node.args.length!==1)return [];
     const parts=node.args.map(leaves);return parts.every(part=>part.length)?parts.flat():[];
    }
    const type=predicateTypes[node.predicate];
    return type?.subjects.includes(node.subject)&&['STATIC','ROSTER','BATTLE'].includes(node.contextLevel)&&
      (type.level==='CONTEXTUAL'||type.level===node.contextLevel)&&node.arguments&&typeof node.arguments==='object'?[node]:[];
   };
   return [...(role.conditions||[]),...(clause.conditions||[]),...(rule.ruleContract.conditions||[])].every(condition=>{
    const levels=leaves(condition).map(node=>node.contextLevel);
    if(!levels.length)return false;
    if(levels.every(level=>level==='BATTLE'))return true;
    if(levels.includes('BATTLE')||condition.roleId&&condition.roleId!==role.id||
      leaves(condition).some(node=>node.roleId&&node.roleId!==role.id))return false;
    const subject=condition.subject||context.subject;
    if(![context.subject,'ROSTER'].includes(subject))return false;
    return evaluatePredicate(condition,subject==='ROSTER'?{...context,subject}:context)==='TRUE';
   });
  };
  const models=role.subject==='MODEL'?unit.profiles.filter(matches):[];
  if(role.subject==='MODEL'?!models.length:!matches())continue;
  const recipientInstanceIds=role.subject==='MODEL'?[unit.instanceId]:componentRecipients(projection,unit);
  if(declaration.tableOption){
   const leading=rule.ruleContract.clauses.find(candidate=>candidate.id===declaration.tableOption.leadingClauseId);
   if(!detachmentTextRows(book,projection,rule,leading,evaluatePredicate,unit).some(candidate=>
    candidate.row.detachmentText.recipientSubject===(role.subject==='MODEL'?'MODEL':'UNIT')&&equal(candidate.row.recipientInstanceIds,recipientInstanceIds)&&
    equal(candidate.row.recipientModelScopeIds,models.map(model=>model.scopeId))))continue;
  }
  rows.push({unit,row:{ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',execution:'CONDITIONAL_TEXT_ONLY',
   reason:'Battle effects are not automatically calculated',sourceInstanceId:null,sourceModelScopeId:null,
   recipientInstanceIds:[...recipientInstanceIds],recipientModelScopeIds:models.map(model=>model.scopeId),
   sourceProvenance:clone(rule.provenance),sourceParentId:rule.parentId,sourceDetachmentId:declaration.detachmentId,sourceOwnerChain:clone(declaration.chain),
   detachmentText:{roleId:role.id,recipientSubject:role.subject==='MODEL'?'MODEL':'UNIT',
    kind:declaration.kindFor(role),classification:declaration.classification,text:declaration.text,
    ...(declaration.tableOption?{tableOption:clone(declaration.tableOption)}:{}),
    ...(declaration.tableOptions.length?{tableOptions:clone(declaration.tableOptions)}:{})}}});
 }
 return rows;
}
export function appendConditionalPolicy(result,rule,clause,source,ownerModel,book,evaluatePredicate){
 if(book&&rule.kind==='DETACHMENT_RULE')for(const {unit,row}of detachmentTextRows(book,result,rule,clause,evaluatePredicate))unit.conditional.push(row);
 if(!clause.conditionalPolicy)return;
 if(rule.kind==='DETACHMENT_RULE'){
  requireValue(source===null&&!ownerModel&&result.detachmentIds.includes(rule.ruleContract.detachmentId),'Unresolved conditional Detachment source');
  for(const unit of detachmentRecipients(result,clause.conditionalPolicy))unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',reason:'Battle context is not resolved; no automatic calculation',execution:'CONDITIONAL_TEXT_ONLY',policy:clone(clause.conditionalPolicy),sourceInstanceId:null,sourceModelScopeId:null,recipientInstanceIds:[...componentRecipients(result,unit)],sourceProvenance:clone(rule.provenance)});
  return;
 }
 requireValue(source,'Missing conditional physical source');
 const policy=clause.conditionalPolicy,group=result.formedUnits.find(g=>g.formedUnitId===source.formedUnitId);
 const recipients=policy.recipientScope==='AURA_UNRESOLVED'?[]:policy.recipientScope==='FORMED_UNIT'&&group?[...group.memberInstanceIds]:[source.instanceId];
 const storage=policy.recipientScope==='AURA_UNRESOLVED'?[source]:result.units.filter(u=>recipients.includes(u.instanceId));
 for(const unit of storage)unit.conditional.push({ruleId:rule.id,clauseId:clause.id,state:'UNKNOWN',reason:'Battle context is not resolved; no automatic calculation',execution:'CONDITIONAL_TEXT_ONLY',policy:clone(policy),sourceInstanceId:source.instanceId,sourceModelScopeId:ownerModel?.scopeId||null,recipientInstanceIds:[...recipients],sourceProvenance:clone(rule.provenance)});
}
export function projectDetachmentText(book,projection,unit,row){
  requireValue(row.detachmentText&&!row.policy,'Textual Detachment row cannot replace a typed policy');
  const rules=book.entities.filter(entity=>entity.id===row.ruleId),rule=rules[0],clauses=rule?.ruleContract?.clauses.filter(clause=>clause.id===row.clauseId),clause=clauses?.[0];
  requireValue(rules.length===1&&clauses?.length===1&&sourceProvenancePresent(row.sourceProvenance)&&sourceProvenancePresent(rule.provenance)&&equal(row.sourceProvenance,rule.provenance),
    'Unresolved textual Detachment source provenance');
  const expected=rule?.kind==='DETACHMENT_RULE'&&clause&&detachmentTextRows(book,projection,rule,clause,undefined,unit).find(item=>item.row.detachmentText.roleId===row.detachmentText.roleId);
  requireValue(expected&&equal(expected.row,row),'Unresolved textual Detachment recipient/provenance');
  const title=id=>{const entity=book.entities.find(entity=>entity.id===id);return entity?.data.title||entity?.data.name||entity?.displayName||id;};
  const labels=row.detachmentText.recipientSubject==='MODEL'?unit.profiles.filter(model=>row.recipientModelScopeIds.includes(model.scopeId))
   .map(model=>title(model.canonicalProfileId)+(model.quantity>1?` ×${model.quantity}`:'')):
   row.recipientInstanceIds.map(id=>title(projection.units.find(unit=>unit.instanceId===id).canonicalUnitId));
  return {...clone(row),sourceLabel:title(row.sourceDetachmentId),sourceModelLabel:null,recipientLabels:labels};
}
/** Routing is decided by the canonical clause, never by a possibly stripped policy. */
export function projectConditionalRow(book,projection,unit,row){
 const rule=book.entities.find(entity=>entity.id===row.ruleId),clause=rule?.ruleContract?.clauses.find(clause=>clause.id===row.clauseId);
 if(clause?.conditionalPolicy){
  requireValue(row.policy&&!row.detachmentText,'Missing canonical conditional policy');
  return projectConditionalPolicy(book,projection,unit,row);
 }
 if(row.detachmentText||row.execution==='CONDITIONAL_TEXT_ONLY')return projectDetachmentText(book,projection,unit,row);
 return projectConditionalPolicy(book,projection,unit,row);
}
export function projectConditionalPolicy(book,projection,unit,row){
 if(!row.policy)return clone(row);
 const index=new Map(book.entities.map(e=>[e.id,e])),rule=index.get(row.ruleId),clause=rule?.ruleContract?.clauses.find(c=>c.id===row.clauseId),source=projection.units.find(u=>u.instanceId===row.sourceInstanceId);
 requireValue(rule&&equal(row.policy,clause?.conditionalPolicy)&&equal(row.sourceProvenance,rule.provenance)&&row.execution==='CONDITIONAL_TEXT_ONLY'&&row.state==='UNKNOWN','Unresolved conditional policy provenance');
 validateConditionalPolicy(book,rule,clause);
 const title=id=>index.get(id)?.data.title||index.get(id)?.data.name||id;
 if(rule.kind==='DETACHMENT_RULE'){
  const expected=componentRecipients(projection,unit);
  requireValue(row.sourceInstanceId===null&&row.sourceModelScopeId===null&&projection.detachmentIds.includes(rule.ruleContract.detachmentId)&&detachmentRecipients(projection,row.policy).some(recipient=>recipient.instanceId===unit.instanceId)&&equal(row.recipientInstanceIds,expected),'Foreign conditional Detachment recipient');
  return {...clone(row),sourceLabel:title(rule.parentId),sourceModelLabel:null,recipientLabels:expected.map(id=>{const recipient=projection.units.find(item=>item.instanceId===id);return `${title(recipient.canonicalUnitId)} (${id})`;})};
 }
 requireValue(source,'Missing conditional physical source');
 requireValue(rule.kind==='ENHANCEMENT'?source.enhancementIds.includes(rule.id):source.canonicalUnitId===rule.parentId,'Foreign conditional physical source');
 const group=projection.formedUnits.find(g=>g.formedUnitId===source.formedUnitId),expected=row.policy.recipientScope==='AURA_UNRESOLVED'?[]:row.policy.recipientScope==='FORMED_UNIT'&&group?[...group.memberInstanceIds]:[source.instanceId];
 requireValue(equal(row.recipientInstanceIds,expected)&&(expected.length?expected.includes(unit.instanceId):unit.instanceId===source.instanceId),'Foreign conditional recipient');
 const model=row.sourceModelScopeId?source.profiles.find(p=>p.scopeId===row.sourceModelScopeId):null;
 if(row.sourceModelScopeId)requireValue(model?.quantity===1,'Unresolved conditional MODEL bearer');
 const ownerRole=rule.ruleContract.assignment&&rule.ruleContract.roles.find(r=>r.id===rule.ruleContract.assignment.ownerRoleId);
 if(ownerRole?.subject==='MODEL')requireValue(model&&(!source.enhancementAssignments?.length||source.enhancementAssignments.some(a=>a.enhancementId===rule.id&&a.modelScopeId===model.scopeId)),'Missing conditional MODEL assignment');
 if(ownerRole?.subject!=='MODEL')requireValue(row.sourceModelScopeId===null,'Unexpected conditional MODEL bearer');
 const activation=row.policy.activationReferenceId?index.get(row.policy.activationReferenceId):null;
 return {...clone(row),...(activation?{activationContext:{canonicalId:activation.id,label:title(activation.id),text:activation.data.text,provenance:clone(activation.provenance)}}:{}),sourceLabel:`${title(source.canonicalUnitId)} (${source.instanceId})`,sourceModelLabel:model?`${title(model.canonicalProfileId)} (${model.scopeId})`:null,recipientLabels:expected.map(id=>{const u=projection.units.find(u=>u.instanceId===id);return `${title(u.canonicalUnitId)} (${id})`;})};
}
