/** Read-only owner-only admission proof. No product facts or presentation changes. */
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {projectAttachedRuleTexts} from '../../books/shared/roster-v2/attached-rule-text.mjs';
import {presentationRecipientLinks} from '../../books/shared/rule-contract-v2/recipients.mjs';

export const OWNER_ONLY_REASON='battlefield-dependent; owner-only (owner decision 2026-11-20)';
// This proof permits the necessary-route analysis below only while the actual
// consumer is exactly the reviewed implementation. Later selector/physical
// gates can only remove candidates; they are not reimplemented by the census.
export const OWNER_ONLY_ATTACHED_CONSUMER='379dc4cacdf36fb6ee14f211feea4330f5448421a48093e770d1e146dfb9d67c';
export const OWNER_ONLY_CONSUMERS=Object.freeze({attachedProjector:OWNER_ONLY_ATTACHED_CONSUMER,
 attachedLeaves:'88bc603db13f3641ee5bc852f2b579f03dd847414a252a34025ce53d6ce1bc74'});
export const hasOwnerOnlyReason=decision=>typeof decision?.reason==='string'&&/\bowner-only\b/i.test(decision.reason);
export const isArmyOwnedKind=kind=>['ARMY_RULE','DETACHMENT_RULE'].includes(kind);
export const reviewedPresentationScope=kind=>isArmyOwnedKind(kind)?'ARMY_ELIGIBLE_RECIPIENTS':'OWNER_ONLY';
export const needsOwnerOnlyIsolation=decision=>hasOwnerOnlyReason(decision)&&!isArmyOwnedKind(decision.kind);
const copy=structuredClone;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const leaves=node=>node?.op?(node.args||[]).flatMap(leaves):node?.predicate?[node]:[];
export function ownerOnlyConsumerEvidence({attachedProjector=projectAttachedRuleTexts,
 attachedSource=fs.readFileSync(new URL('../../books/shared/roster-v2/attached-rule-text.mjs',import.meta.url),'utf8')}={}){
 const hash=text=>createHash('sha256').update(text.replaceAll('\r\n','\n')).digest('hex');
 const helpers=[...attachedSource.replaceAll('\r\n','\n').matchAll(/^const leaves=.*;$/gm)];
 // Missing/ambiguous helper shapes are not a reviewed consumer implementation.
 return {attachedProjector:hash(attachedProjector.toString()),attachedLeaves:helpers.length===1?hash(helpers[0][0]):null};
}
const channelOf=(clause,link,consumer)=>({consumer,clauseId:clause.id,path:link.path,recipientId:link.recipient.id,
 recipient:copy(link.recipient),roleId:link.role?.id||null});
export function ownerOnlyRuleDiagnostics(rule,clauses){
 const contract=rule.ruleContract||{},ownerRole=contract.roles?.find(role=>role.id===contract.assignment?.ownerRoleId);
 const ownerRoleIds=[...new Set([...(contract.roles||[]).filter(role=>role.purpose==='OWNER'||role.binding==='SOURCE_MODEL'||role.binding==='SOURCE_UNIT'&&role.scope==='PHYSICAL').map(role=>role.id),
  ...(contract.assignment?.ownerRoleId?[contract.assignment.ownerRoleId]:[])])];
 return {contractOwnerId:rule.id,ownerRoleIds,assignmentOwnerSubject:ownerRole?.subject||null,
  links:clauses.flatMap(clause=>['ATTACHED','F1'].flatMap(consumer=>presentationRecipientLinks(rule,clause,{consumer}).map(link=>({
   channel:channelOf(clause,link,consumer),roleSubject:link.role?.subject||null,referenceBranch:link.referenceBranch||null,
   clauseConditions:copy(clause.conditions||[]),clauseSourceFields:copy(clause.sourceFields||[])}))))};
}
/** Exact first necessary gate from the SHA-bound actual ATTACHED consumer.
 * It intentionally does not predict selectors/roles/roster assignments. An
 * admitted route may still be rejected later: conservative review is required.
 */
export function potentiallyForeignAttached(link,diagnostics,row){
 const recipient=link.channel.recipient;
 const origins=[...(recipient.conditions||[]),...(link.clauseConditions||[])].flatMap(leaves).filter(node=>
  node.predicate==='FIELD'&&node.contextLevel==='BATTLE'&&node.arguments?.from==='SOURCE_MODEL'&&
  node.arguments.ruleId===row.sourceEntityId&&Number.isFinite(node.arguments.inches)&&node.arguments.inches>0);
 const rangeOrigin=origins.length>0&&diagnostics.assignmentOwnerSubject==='MODEL';
 if(!rangeOrigin&&(recipient.side==='ENEMY'||recipient.how==='AURA'||recipient.how==='IN_BATTLE'))return false;
 const scope=recipient.who==='UNIT'&&recipient.from==='SOURCE_UNIT'&&recipient.scope===undefined?'FORMED':recipient.scope;
 const eligible=rangeOrigin||recipient.from==='SOURCE_FORMED_MODELS'||recipient.from==='LEADERS_OF_SOURCE'||
  recipient.who==='UNIT'&&scope==='FORMED'&&(recipient.from==='SOURCE_UNIT'||
   recipient.from===undefined&&link.roleSubject==='FORMED_ATTACHED_UNIT'&&recipient.side==='FRIENDLY');
 return Boolean(eligible&&link.referenceBranch!=='standalone');
}
/** Shared canonical fields are still one rendered source. Logical clause IDs
 * cannot waive an owner-only boundary when a sibling emits the complete field.
 * Title/name/identity metadata alone is not treated as a body-text leak.
 */
export function ownerOnlySharedSourceViolations(row,inventory){
 const body=field=>Array.isArray(field)&&field.length&&!/(?:^title$|^name$|^label$|^id$|Id$|Ids$)/.test(String(field.at(-1)));
 const fields=(row.sourceFields||[]).filter(body),prefix=(left,right)=>left.every((part,i)=>part===right[i]);
 const errors=[];
 for(const other of inventory?.rows||[]){
  if(other===row||other.book!==row.book||other.id===row.id)continue;
  const diagnostic=other.ownerOnlyDiagnostics;
  const sharedOwner=other.sourceEntityId===row.sourceEntityId||row.ownerOnlyDiagnostics?.contractOwnerId&&
   diagnostic?.contractOwnerId===row.ownerOnlyDiagnostics.contractOwnerId;
  if(!sharedOwner||!diagnostic)continue;
  for(const link of diagnostic.links||[]){
   const foreign=link.channel.consumer==='F1'||link.channel.consumer==='ATTACHED'&&potentiallyForeignAttached(link,diagnostic,other)||
    ['POLICY','SEMANTIC_EFFECT','DECLARATION_EFFECT'].includes(link.channel.path);
   if(!foreign)continue;
   const overlap=(link.clauseSourceFields||[]).filter(body).find(field=>fields.some(owned=>prefix(field,owned)||prefix(owned,field)));
   if(overlap)errors.push('shared source field /'+overlap.join('/')+' via '+other.id+' / '+link.channel.consumer+' '+link.channel.clauseId);
  }
 }
 return errors;
}
export function ownerOnlyViolations(row,inventory){
 const diagnostic=row.ownerOnlyDiagnostics;
 if(!diagnostic||!Array.isArray(diagnostic.links)||!Array.isArray(diagnostic.ownerRoleIds))return ['missing native owner/consumer diagnostics'];
 if(!same(diagnostic.links.map(link=>link.channel),row.presentationChannels||[]))return ['native diagnostic/presentation channel mismatch'];
 const errors=ownerOnlySharedSourceViolations(row,inventory);
 for(const link of diagnostic.links){
  if(link.channel.consumer==='ATTACHED'&&potentiallyForeignAttached(link,diagnostic,row))
   errors.push('ATTACHED '+link.channel.clauseId+' / '+link.channel.recipientId);
  // F1 addresses explicitly select recipients in roster views. A new F1 path
  // needs review rather than assuming its field names imply physical ownership.
  if(link.channel.consumer==='F1')errors.push('F1 '+link.channel.clauseId+' / '+link.channel.recipientId);
  // Policies use another physical storage consumer. None belongs to the
  // approved 45; any new policy requires review, including a purported aura
  // owner-storage path, rather than silently assuming its ownership proof.
  if(link.channel.path==='POLICY')errors.push('POLICY '+link.channel.clauseId+' / '+link.channel.recipientId);
  if(['SEMANTIC_EFFECT','DECLARATION_EFFECT'].includes(link.channel.path))
   errors.push('additional effect path '+link.channel.clauseId+' / '+link.channel.recipientId);
 }
 const ownerRoles=new Set(diagnostic.ownerRoleIds);
 for(const target of row.relatedRuleRows||[]){
  const relevant=[...(target.roles||[]),...(target.selectedDetachment?.roles||[])].filter(role=>role.state!=='FALSE');
  if(target.unitId!==row.ownerId&&(relevant.some(role=>!ownerRoles.has(role.roleId))||target.state!=='FALSE'&&!relevant.length))
   errors.push('related target '+target.unitId+' / '+relevant.filter(role=>!ownerRoles.has(role.roleId)).map(role=>role.roleId).join(','));
 }
 if(row.effects?.length||row.nativeCorePresence?.abilities?.length||row.equipmentBindings?.some(item=>item.providedWeaponProfileIds?.length)||
  row.equipmentReferences?.some(item=>item.effects?.length))errors.push('executable/weapon path requires a different reviewed category');
 return errors;
}
