/** Disposable capability bounds and mandatory-recipient feasibility.
 * Only typed canonical identities/relations enter this module; no source prose.
 */
export function buildAttachmentFeasibility(book, composition) {
  const units=book.entities.filter(e=>e.kind==='DATASHEET');
  const compositionKeys=composition.map(row=>row.unitId+'\0'+row.profileId);
  if(new Set(compositionKeys).size!==compositionKeys.length||composition.some(row=>!units.some(unit=>unit.id===row.unitId&&unit.data.profileIds.includes(row.profileId))))throw new TypeError('Duplicate or unresolved intrinsic composition');
  const rows=new Map(units.map(unit=>[unit.id,{unitId:unit.id,canBeAttached:false,
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
  if(matches.length!==1||typeof row.canBeAttached!=='boolean'||!Number.isSafeInteger(row.intrinsicCharacterModelsMax)||row.intrinsicCharacterModelsMax<0||!Number.isSafeInteger(row.maxCharacterModels)||row.maxCharacterModels<row.intrinsicCharacterModelsMax||!Array.isArray(row.leaderTargetIds)||new Set(row.leaderTargetIds).size!==row.leaderTargetIds.length||row.leaderTargetIds.some(id=>!book.entities.some(e=>e.id===id&&e.kind==='DATASHEET'))) throw new TypeError('Unresolved static capability: '+unitId);
  return row;
}

export function validateCompatibilityFeasibility(book) {
  const units=book.entities.filter(e=>e.kind==='DATASHEET');
  const projection=book.compatibilityFeasibility;
  if(projection?.schema!=='roster-v2/static-feasibility'||projection.authority!=='DISPOSABLE_PROJECTION'||!Array.isArray(projection.units)||projection.units.length!==units.length)throw new TypeError('Unresolved static capability projection');
  for(const unit of units)staticCapabilities(book,unit.id);
  const policies=book.rosterAttachmentPolicies;
  if(!Array.isArray(policies))throw new TypeError('Unresolved static capability policies');
  const expected=new Map(units.map(unit=>[unit.id,{attached:false,maximum:staticCapabilities(book,unit.id).intrinsicCharacterModelsMax,targets:new Set()}]));
  const account=members=>{
    const count=members.reduce((n,id)=>n+staticCapabilities(book,id).intrinsicCharacterModelsMax,0);
    for(const id of members){const row=expected.get(id);row.attached=true;row.maximum=Math.max(row.maximum,count);}
  };
  for(const policy of policies){
    if(!expected.has(policy.sourceId)||!expected.has(policy.targetId)||policy.sourceId===policy.targetId||![0,1].includes(policy.additionalLeaders))throw new TypeError('Unresolved static capability policy');
    expected.get(policy.sourceId).targets.add(policy.targetId);account([policy.targetId,policy.sourceId]);
    for(const other of policies.filter(other=>other.targetId===policy.targetId&&other.sourceId!==policy.sourceId&&(policy.additionalLeaders===1||other.additionalLeaders===1)))account([policy.targetId,policy.sourceId,other.sourceId]);
  }
  for(const unit of units){
    const row=staticCapabilities(book,unit.id),derived=expected.get(unit.id);
    if(row.canBeAttached!==derived.attached||row.maxCharacterModels!==derived.maximum||JSON.stringify([...row.leaderTargetIds].sort())!==JSON.stringify([...derived.targets].sort()))throw new TypeError('Unresolved static capability policy parity: '+unit.id);
  }
}

// Prove that a selector is unsatisfiable with the relationship false, while
// leaving every unrelated predicate unknown. This handles compound negation
// without promoting an optional ANY branch into a mandatory requirement.
const withoutLeaderRelation=node=>{
  if(node?.op){
    const values=node.args.map(withoutLeaderRelation);
    if(node.op==='NOT')return values[0]===null?null:!values[0];
    if(node.op==='ALL')return values.includes(false)?false:values.includes(null)?null:true;
    if(node.op==='ANY')return values.includes(true)?true:values.includes(null)?null:false;
    throw new TypeError('Unknown recipient predicate operation');
  }
  return node?.predicate==='FIELD'&&node.arguments?.key==='canBeLedByPrimary'?node.arguments.equals===false:null;
};
const requiresLeaderRelation=node=>withoutLeaderRelation(node)===false;

/** Product compatibility includes existence of source-required linked recipients.
 * Battle requirements remain unavailable; this never executes the action.
 */
export function evaluateRequiredRecipients(contract,sourceUnitId,candidates,{book,contextFor,evaluateRole}) {
  const recipientRoles=[...contract.roles.filter(role=>role.purpose==='EFFECT_RECIPIENT'),...(contract.clauses||[]).flatMap(clause=>(clause.roles||[]).filter(role=>clause.effectRecipientRoleIds?.includes(role.id)))];
  const roles=[...new Map(recipientRoles.map(role=>[JSON.stringify(role),role])).values()].filter(role=>
    [role.selector,...(role.conditions||[])].some(requiresLeaderRelation));
  if(!roles.length)return 'TRUE';
  const targets=staticCapabilities(book,sourceUnitId).leaderTargetIds;
  let result='TRUE';
  for(const role of roles) {
    const states=candidates.filter(candidate=>targets.includes(candidate.canonicalUnitId)).map(candidate=>{
      const context=contextFor(candidate,role.subject);
      if(!context)return 'FALSE';
      return evaluateRole(role,[],{...context,roster:{...context.roster,otherFriendlyUnit:true,canBeLedByPrimary:true}});
    });
    if(states.includes('INVALID'))return 'INVALID';
    if(!states.some(state=>state==='TRUE'||state==='UNKNOWN'))return 'FALSE';
    if(!states.includes('TRUE'))result='UNKNOWN';
  }
  return result;
}

export const includeRecipientFeasibility=(state,recipient)=>state==='INVALID'||recipient==='INVALID'?'INVALID':state==='FALSE'||recipient==='FALSE'?'FALSE':state==='UNKNOWN'||recipient==='UNKNOWN'?'UNKNOWN':'TRUE';
