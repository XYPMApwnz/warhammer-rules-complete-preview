/** Disposable capability bounds and mandatory-recipient feasibility.
 * Only typed canonical identities/relations enter this module; no source prose.
 */
import {resolveRecipient} from '../rule-contract-v2/recipients.mjs';
export function buildAttachmentFeasibility(book, composition) {
  const units=book.entities.filter(e=>e.kind==='DATASHEET');
  const compositionKeys=composition.map(row=>row.unitId+'\0'+row.profileId);
  if(new Set(compositionKeys).size!==compositionKeys.length||composition.some(row=>!units.some(unit=>unit.id===row.unitId&&unit.data.profileIds.includes(row.profileId))))throw new TypeError('Duplicate or unresolved intrinsic composition');
  const rows=new Map(units.map(unit=>[unit.id,{unitId:unit.id,canBeAttached:false,canBeBodyguard:false,
    intrinsicCharacterModelsMax:0,maxCharacterModels:0,leaderTargetIds:[]} ]));
  for(const unit of units) {
    const profiles=composition.filter(row=>row.unitId===unit.id);
    if(profiles.length!==unit.data.profileIds.length||profiles.some(row=>!unit.data.profileIds.includes(row.profileId)||!Number.isSafeInteger(row.maxModels)||row.maxModels<1||!Array.isArray(row.intrinsicKeywords))) throw new TypeError('Unresolved intrinsic composition: '+unit.id);
    const row=rows.get(unit.id);
    row.intrinsicCharacterModelsMax=profiles.reduce((n,p)=>n+(p.intrinsicKeywords.includes('CHARACTER')?p.maxModels:0),0);
    row.maxCharacterModels=row.intrinsicCharacterModelsMax;
  }
  const policies=book.rosterAttachmentPolicies;
  if(!Array.isArray(policies))throw new TypeError('Missing canonical attachment policies');
  const account=members=>{
    const count=members.reduce((n,id)=>n+rows.get(id).intrinsicCharacterModelsMax,0);
    for(const id of members) {
      const row=rows.get(id);row.canBeAttached=true;
      row.maxCharacterModels=Math.max(row.maxCharacterModels,count);
    }
  };
  for(const policy of policies) {
    if(!rows.has(policy.sourceId)||!rows.has(policy.targetId)||policy.sourceId===policy.targetId||![0,1].includes(policy.additionalLeaders)) throw new TypeError('Unresolved attachment capability');
    const row=rows.get(policy.sourceId);
    rows.get(policy.targetId).canBeBodyguard=true;
    if(!row.leaderTargetIds.includes(policy.targetId))row.leaderTargetIds.push(policy.targetId);
    account([policy.targetId,policy.sourceId]);
    for(const second of policies.filter(p=>p.targetId===policy.targetId&&p.sourceId!==policy.sourceId)) {
      if(policy.additionalLeaders===1||second.additionalLeaders===1)account([policy.targetId,policy.sourceId,second.sourceId]);
    }
  }
  return {schema:'roster-v2/static-feasibility',authority:'DISPOSABLE_PROJECTION',
    units:[...rows.values()].map(row=>({...row,leaderTargetIds:row.leaderTargetIds.sort()}))};
}

export function staticCapabilities(book,unitId) {
  const matches=book.compatibilityFeasibility?.units?.filter(row=>row.unitId===unitId)||[];
  const row=matches[0];
  if(matches.length!==1||typeof row.canBeAttached!=='boolean'||typeof row.canBeBodyguard!=='boolean'||!Number.isSafeInteger(row.intrinsicCharacterModelsMax)||row.intrinsicCharacterModelsMax<0||!Number.isSafeInteger(row.maxCharacterModels)||row.maxCharacterModels<row.intrinsicCharacterModelsMax||!Array.isArray(row.leaderTargetIds)||new Set(row.leaderTargetIds).size!==row.leaderTargetIds.length||row.leaderTargetIds.some(id=>!book.entities.some(e=>e.id===id&&e.kind==='DATASHEET'))) throw new TypeError('Unresolved static capability: '+unitId);
  return row;
}

export function validateCompatibilityFeasibility(book) {
  const units=book.entities.filter(e=>e.kind==='DATASHEET');
  const projection=book.compatibilityFeasibility;
  if(projection?.schema!=='roster-v2/static-feasibility'||projection.authority!=='DISPOSABLE_PROJECTION'||!Array.isArray(projection.units)||projection.units.length!==units.length)throw new TypeError('Unresolved static capability projection');
  for(const unit of units)staticCapabilities(book,unit.id);
  const policies=book.rosterAttachmentPolicies;
  if(!Array.isArray(policies))throw new TypeError('Unresolved static capability policies');
  const expected=new Map(units.map(unit=>[unit.id,{attached:false,bodyguard:false,maximum:staticCapabilities(book,unit.id).intrinsicCharacterModelsMax,targets:new Set()}]));
  const account=members=>{
    const count=members.reduce((n,id)=>n+staticCapabilities(book,id).intrinsicCharacterModelsMax,0);
    for(const id of members){const row=expected.get(id);row.attached=true;row.maximum=Math.max(row.maximum,count);}
  };
  for(const policy of policies){
    if(!expected.has(policy.sourceId)||!expected.has(policy.targetId)||policy.sourceId===policy.targetId||![0,1].includes(policy.additionalLeaders))throw new TypeError('Unresolved static capability policy');
    expected.get(policy.sourceId).targets.add(policy.targetId);expected.get(policy.targetId).bodyguard=true;account([policy.targetId,policy.sourceId]);
    for(const other of policies.filter(other=>other.targetId===policy.targetId&&other.sourceId!==policy.sourceId&&(policy.additionalLeaders===1||other.additionalLeaders===1)))account([policy.targetId,policy.sourceId,other.sourceId]);
  }
  for(const unit of units){
    const row=staticCapabilities(book,unit.id),derived=expected.get(unit.id);
    if(row.canBeAttached!==derived.attached||row.canBeBodyguard!==derived.bodyguard||row.maxCharacterModels!==derived.maximum||JSON.stringify([...row.leaderTargetIds].sort())!==JSON.stringify([...derived.targets].sort()))throw new TypeError('Unresolved static capability policy parity: '+unit.id);
  }
}

// Prove that a selector is unsatisfiable with the relationship false, while
// leaving every unrelated predicate unknown. This handles compound negation
// without promoting an optional ANY branch into a mandatory requirement.
const withoutRelation=(node,key)=>{
  if(node?.op){
    const values=node.args.map(child=>withoutRelation(child,key));
    if(node.op==='NOT')return values[0]===null?null:!values[0];
    if(node.op==='ALL')return values.includes(false)?false:values.includes(null)?null:true;
    if(node.op==='ANY')return values.includes(true)?true:values.includes(null)?null:false;
    throw new TypeError('Unknown recipient predicate operation');
  }
  return node?.predicate==='FIELD'&&node.arguments?.key===key?node.arguments.equals===false:null;
};
const requiresRelation=(node,key)=>withoutRelation(node,key)===false;
const explicitlyRequired=role=>role.required===true&&['TARGET','ANCHOR'].includes(role.purpose);
const clauseRecipientRoles=(contract,clause)=>{
  // Stratagems are outside the recipient-format migration. Their existing
  // action participants and explicit receiver edges retain the old contract.
  if(contract.kind==='STRATAGEM')return clause.effectRecipientRoleIds||[];
  if(Object.hasOwn(clause,'effectRecipientRoleIds')||!Array.isArray(clause.recipients)||
      !['RECORDED','NOT_RECORDED','NOT_APPLICABLE'].includes(clause.recipientStatus))
    throw new TypeError('Missing canonical compatibility recipient declaration');
  if(clause.recipientIds===undefined)return [];
  if(!Array.isArray(clause.recipientIds)||new Set(clause.recipientIds).size!==clause.recipientIds.length)
    throw new TypeError('Invalid compatibility recipient references');
  return clause.recipientIds.map(id=>{
    const recipient=resolveRecipient({ruleContract:contract},clause,id);
    if(!recipient.roleId)throw new TypeError('Missing compatibility recipient participant');
    return recipient.roleId;
  });
};

/** A secondary target is required; a linked effect recipient must be explicitly
 * separate from/leadable by the actor. Passive beneficiaries and created units
 * are not additional targets that must already exist in the imported roster.
 */
export function requiredRecipientRoles(contract) {
  const recipientRoles=[...contract.roles.filter(role=>['SECONDARY_TARGET','EFFECT_RECIPIENT'].includes(role.purpose)||
    explicitlyRequired(role)),
    ...(contract.clauses||[]).flatMap(clause=>{
      const recipientIds=clauseRecipientRoles(contract,clause);
      return (clause.roles||[]).filter(role=>explicitlyRequired(role)||recipientIds.includes(role.id));
    })];
  return [...new Map(recipientRoles.map(role=>[JSON.stringify(role),role])).values()].filter(role=>
    role.allegiance==='FRIENDLY'&&['MODEL','UNIT','FORMED_ATTACHED_UNIT'].includes(role.subject)&&
    role.required!==false&&role.optional!==true&&
    (explicitlyRequired(role)||
      (role.binding==='INDEPENDENT_ENTITY'&&
        (role.purpose==='SECONDARY_TARGET'||[role.selector,...(role.conditions||[])].some(node=>
          requiresRelation(node,'canBeLedByPrimary')||requiresRelation(node,'otherFriendlyUnit'))))));
}

/** Product compatibility includes existence of source-required linked recipients.
 * Battle requirements remain unavailable; this never executes the action.
 */
export function evaluateRequiredRecipients(contract,sourceUnitId,candidates,{book,contextFor,evaluateRole,sourceInstanceId}) {
  const roles=requiredRecipientRoles(contract);
  if(!roles.length)return 'TRUE';
  const targets=staticCapabilities(book,sourceUnitId).leaderTargetIds;
  const byId=new Map(roles.map(role=>[role.id,role]));
  if(byId.size!==roles.length)throw new TypeError('Conflicting required recipient roles');
  for(const role of roles)if(role.distinctFromRoleIds!==undefined) {
    if(!Array.isArray(role.distinctFromRoleIds)||new Set(role.distinctFromRoleIds).size!==role.distinctFromRoleIds.length||
      !['UNIT','FORMED_ATTACHED_UNIT'].includes(role.subject)||role.distinctFromRoleIds.some(id=>
        id===role.id||!['UNIT','FORMED_ATTACHED_UNIT'].includes(byId.get(id)?.subject)))
      throw new TypeError('Unresolved distinct recipient role binding');
  }
  const source=candidates.find(candidate=>candidate.instanceId===sourceInstanceId);
  const unitIdentity=(candidate,context)=>candidate?.formedUnitId||context?.formedUnitId||candidate?.instanceId;
  const sourceIdentity=sourceInstanceId&&(source?unitIdentity(source,contextFor(source,'UNIT')):sourceInstanceId);
  const compatibilityIds=contract.compatibilityRoleIds||[contract.roles[0]?.id];
  const pinSource=roles.some(role=>role.required===true&&compatibilityIds.includes(role.id));
  const choices=roles.map(role=>{
    const values=candidates.flatMap(candidate=>{
      const context=contextFor(candidate,role.subject);
      if(!context)return [];
      const state=evaluateRole(role,[],{...context,roster:{...context.roster,
        // In book context another physical copy can have the same datasheet.
        // In roster context only the actual physical source is "this unit".
        otherFriendlyUnit:sourceInstanceId?candidate.instanceId!==sourceInstanceId:true,
        canBeLedByPrimary:targets.includes(candidate.canonicalUnitId)}});
      if(state==='FALSE')return [];
      // MODEL identity stays profile/component scoped. UNIT cardinality counts
      // an Attached Unit once, even when several imported components match.
      const identity=sourceInstanceId?(role.subject==='MODEL'?
        [candidate.instanceId,context.modelId].join('/') : unitIdentity(candidate,context)):
        candidate.canonicalUnitId+'/potential-copy/'+role.id;
      if(!identity)throw new TypeError('Missing physical recipient identity');
      return [{identity,state,isSource:sourceInstanceId?
        (role.subject==='MODEL'?candidate.instanceId===sourceInstanceId:identity===sourceIdentity):candidate.canonicalUnitId===sourceUnitId}];
    });
    return [...new Map(values.map(value=>[JSON.stringify(value),value])).values()];
  });
  if(choices.some(values=>values.some(value=>value.state==='INVALID')))return 'INVALID';
  if(choices.some(values=>!values.length))return 'FALSE';
  let result='FALSE';
  const assignment=new Map();
  function assign(index,unknown,includesSource) {
    if(index===roles.length) {
      if(pinSource&&!includesSource)return;
      result=unknown?'UNKNOWN':'TRUE';return;
    }
    const role=roles[index];
    for(const choice of choices[index]) {
      if([...assignment].some(([id,value])=>value.identity===choice.identity&&
        (role.distinctFromRoleIds?.includes(id)||byId.get(id).distinctFromRoleIds?.includes(role.id))))continue;
      assignment.set(role.id,choice);
      assign(index+1,unknown||choice.state==='UNKNOWN',includesSource||compatibilityIds.includes(role.id)&&choice.isSource);
      assignment.delete(role.id);
      if(result==='TRUE')return;
    }
  }
  assign(0,false,false);
  return result;
}

export const includeRecipientFeasibility=(state,recipient)=>state==='INVALID'||recipient==='INVALID'?'INVALID':state==='FALSE'||recipient==='FALSE'?'FALSE':state==='UNKNOWN'||recipient==='UNKNOWN'?'UNKNOWN':'TRUE';

/** A dependent role is available only when another declared participant can
 * satisfy its own selector/conditions and the prerequisite bound to it.
 * This gates that role alone; it never makes an optional recipient mandatory.
 */
export function evaluateCompatibilityRole(contract,role,context,{evaluateRole,contextsForRole},ancestors=[]) {
  if(ancestors.includes(role.id))return 'INVALID';
  let result=evaluateRole(role,contract.conditions||[],context);
  for(const prerequisite of role.prerequisites||[]) {
    const primary=contract.roles.find(value=>value.id===prerequisite.roleId);
    if(!primary||primary.id===role.id||!prerequisite.condition)return 'INVALID';
    const states=contextsForRole(primary).map(value=>includeRecipientFeasibility(
      evaluateCompatibilityRole(contract,primary,value,{evaluateRole,contextsForRole},[...ancestors,role.id]),
      evaluateRole({...primary,selector:prerequisite.condition,conditions:[]},[],value)));
    const available=states.includes('INVALID')?'INVALID':states.includes('TRUE')?'TRUE':states.includes('UNKNOWN')?'UNKNOWN':'FALSE';
    result=includeRecipientFeasibility(result,available);
  }
  return result;
}
