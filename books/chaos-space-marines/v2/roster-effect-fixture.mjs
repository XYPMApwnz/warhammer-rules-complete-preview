/** Deterministic canonical-identity inputs; explicitly selected MODEL weapons
 * are fixture input, not inferred ownership from an aggregate New Recruit row. */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {findRosterConditionComputation} from '../../shared/roster-v2/condition-context.mjs';

export function physical(book,instanceId,canonicalUnitId,enhancementIds=[]) {
  const records=new Map(book.entities.map(e=>[e.id,e])),unit=records.get(canonicalUnitId);
  const modelRows=unit.data.profileIds.map((id,index)=>({rowId:`model-${index}`,canonicalProfileId:id,
    quantity:records.get(id).data.composition.quantity.min,compositionScope:'MODEL_ROW',loadouts:[],selections:[]}));
  // Canonical inventories selected explicitly for these capability probes. The
  // first composition row owns them; siblings have an empty known inventory.
  const ids=canonicalUnitId==='unit-dark-apostle'
    ?['datasheet-dark-apostle:weapon:1','datasheet-dark-apostle:weapon:2']:unit.data.weaponIds;
  modelRows[0].selections=ids.map(id=>({selectionKey:`selected/${id}`,canonicalProfileIds:[id],canonicalEquipmentIds:[],
    physicalQuantity:modelRows[0].quantity,perModelQuantity:1}));
  if(canonicalUnitId==='unit-dark-apostle')modelRows[1].selections=[{selectionKey:'disciples-melee',
    canonicalProfileIds:['datasheet-dark-apostle:weapon:3'],canonicalEquipmentIds:[],physicalQuantity:modelRows[1].quantity,perModelQuantity:1}];
  return {instanceId,canonicalUnitId,startingStrength:modelRows.reduce((n,r)=>n+r.quantity,0),modelRows,
    selections:[],enhancementIds,warlord:null,selectedMarkId:null,selectedUpgradeIds:[],equipmentContextKnown:true};
}
export function fixtureState(book,detachmentId,units) {
  return {schema:'roster-v2/roster',bookId:book.bookId,rosterId:'csm-declaration-fixture',
    detachmentIds:[detachmentId],detachments:[{instanceId:'detachment/1',canonicalDetachmentId:detachmentId}],
    units,attachments:[],warlordInstanceId:null};
}
export function assignBearer(book,state,unitId,enhancementId,profileId) {
  const raw=state.units.find(u=>u.instanceId===unitId);
  if(!raw.enhancementIds.includes(enhancementId))raw.enhancementIds.push(enhancementId);
  const model=formRoster(book,state).units.find(u=>u.instanceId===unitId).profiles.find(m=>m.canonicalProfileId===profileId);
  assert.ok(model&&model.quantity===1);
  raw.enhancementAssignments=[...(raw.enhancementAssignments||[]).filter(a=>a.enhancementId!==enhancementId),
    {enhancementId,modelScopeId:model.scopeId}];
}
export function clauseFixture(book,ruleId,clauseId) {
  const records=new Map(book.entities.map(e=>[e.id,e])),rule=records.get(ruleId),clause=rule.ruleContract.clauses.find(c=>c.id===clauseId);
  const detachmentId=rule.ruleContract.detachmentId||'detachment-veterans-of-the-long-war';
  let canonicalUnitId=rule.parentId,profileId;
  if(rule.kind==='ENHANCEMENT') {
    const owner=rule.ruleContract.roles.find(r=>r.id===rule.ruleContract.assignment.ownerRoleId);
    const evaluator=createRuleContractSchema(book.rosterSchema);
    const candidates=book.rosterProfileBindings.filter(binding=>{
      const p=records.get(binding.profileId),keys=binding.intrinsicKeywords;
      return keys.includes('CHARACTER')&&!keys.includes('EPIC HERO')&&p.data.composition.quantity.min===1&&
        evaluator.evaluatePredicate(owner.selector,{subject:'MODEL',unitId:binding.unitId,modelId:binding.profileId,
          keywords:new Set(keys),intrinsicKeywords:new Set(keys),abilities:new Set(records.get(binding.unitId).data.ruleReferenceIds
            .flatMap(id=>(book.rosterReferenceSemantics[id]?.abilities||[]).map(a=>a.name))),roster:{},battle:{}})==='TRUE';
    });
    const chosen=candidates.find(c=>c.unitId==='unit-dark-apostle')||candidates.find(c=>c.unitId==='unit-chaos-lord')||candidates[0];
    assert.ok(chosen,'No canonical synthetic bearer: '+ruleId);
    canonicalUnitId=chosen.unitId;profileId=chosen.profileId;
  }else if(rule.kind==='DETACHMENT_RULE') {
    canonicalUnitId=ruleId==='detachment-chaos-cult:rule'?'unit-traitor-guardsmen-squad':
      ruleId==='detachment-cult-of-the-arkifane:rule'?'unit-chaos-rhino':
      ruleId==='detachment-devotees-of-destruction:rule'?'unit-havocs':'unit-chaos-lord';
  }
  const a=physical(book,'a',canonicalUnitId,rule.kind==='ENHANCEMENT'?[ruleId]:[]),b=physical(book,'b',canonicalUnitId);
  const state=fixtureState(book,detachmentId,[a,b]);
  if(ruleId==='detachment-pactbound-zealots:rule'&&clauseId==='source-clause-1-1')
    a.selectedMarkId='detachment-pactbound-zealots:rule:mark:1';
  if(rule.kind==='ENHANCEMENT') {
    assignBearer(book,state,'a',ruleId,profileId);
    const owner=rule.ruleContract.roles.find(r=>r.id===rule.ruleContract.assignment.ownerRoleId);
    const walk=n=>n.op?n.args.flatMap(walk):[n];
    for(const condition of owner.conditions)for(const node of walk(condition)) {
      const binding=findRosterConditionComputation(book,node);
      if(binding?.kind==='SELECTED_MARK')a.selectedMarkId=binding.markId;
    }
  }
  if(rule.kind==='UPGRADE_OPTION')a.selectedUpgradeIds=[rule.id];
  if(canonicalUnitId==='unit-helbrute')for(const unit of state.units)
    unit.modelRows[0].selections=unit.modelRows[0].selections.filter(s=>['datasheet-helbrute:weapon:10','datasheet-helbrute:weapon:11','datasheet-helbrute:weapon:12'].includes(s.canonicalProfileIds[0]));
  const requireAttached=canonicalUnitId==='unit-dark-commune'||canonicalUnitId==='unit-fabius-bile'||canonicalUnitId==='unit-master-of-possession'||
    ruleId==='detachment-chaos-cult:enhancement:4'||ruleId==='detachment-murdertalon-raiders:enhancement:1';
  const policies=book.rosterAttachmentPolicies.filter(p=>p.sourceId===canonicalUnitId);
  const policy=ruleId==='detachment-chaos-cult:enhancement:4'
    ?policies.find(p=>p.targetId==='unit-accursed-cultists')
    :policies.find(p=>p.targetId==='unit-legionaries')||policies[0];
  if(policy) {
    state.units.push(physical(book,'bodyguard',policy.targetId),physical(book,'unrelated',policy.targetId));
    if(requireAttached)state.attachments=[{leaderInstanceId:'a',bodyguardInstanceId:'bodyguard',role:policy.role}];
  }
  if(canonicalUnitId==='unit-fabius-bile')state.initialAttachments=structuredClone(state.attachments);
  return {state,rule,clause,profileId};
}
