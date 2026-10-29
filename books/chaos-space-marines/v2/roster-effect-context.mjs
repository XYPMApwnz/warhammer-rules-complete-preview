/** Native source-specific selection legality; condition computation is shared. */
const assert={ok:(condition,message)=>{if(!condition)throw new TypeError(message);}};
import {createRosterConditionContext,evaluateRosterConditionDeclarations} from '../../shared/roster-v2/condition-context.mjs';

function validateSelections(book,state) {
  const records=new Map(book.entities.map(e=>[e.id,e]));
  for(const unit of state.units) {
    if(unit.selectedMarkId!==undefined&&unit.selectedMarkId!==null) {
      const mark=records.get(unit.selectedMarkId),rule=records.get(mark?.data.selectionRuleId);
      assert.ok(mark?.kind==='UPGRADE_OPTION'&&rule?.kind==='DETACHMENT_RULE'&&state.detachmentIds.includes(rule.parentId),
        'Unresolved selected canonical Mark');
      const keys=records.get(unit.canonicalUnitId).data.keywords;
      assert.ok(!keys.includes('EPIC HERO')&&!(mark.data.keyword==='KHORNE'&&keys.includes('PSYKER')),
        'Source-excluded selected Mark');
    }
    for(const participant of [unit,...unit.modelRows])if(participant.selectedUpgradeIds!==undefined) {
      assert.ok(Array.isArray(participant.selectedUpgradeIds)&&new Set(participant.selectedUpgradeIds).size===participant.selectedUpgradeIds.length,
        'Duplicate or malformed selected canonical Upgrades');
      const parents=new Set();
      for(const id of participant.selectedUpgradeIds) {
        const option=records.get(id),declaration=records.get(option?.canonicalOwnerId||option?.parentId);
        assert.ok(option?.kind==='UPGRADE_OPTION'&&declaration?.kind==='UPGRADE_DECLARATION'&&declaration.parentId===unit.canonicalUnitId,
          'Foreign selected canonical Upgrade');
        assert.ok(!parents.has(declaration.id),'Conflicting canonical Upgrade choices');parents.add(declaration.id);
      }
      // Current selected Allegiance options belong to singleton princes.
      // Aggregate state never chooses an individual in a multi-model group.
      assert.ok(!participant.selectedUpgradeIds.length||unit.startingStrength===1,
        'Ambiguous MODEL Upgrade ownership');
    }
  }
  if(state.initialAttachments!==undefined) {
    assert.ok(Array.isArray(state.initialAttachments),'Invalid explicit initial attachment snapshot');
    const leaders=new Set();
    for(const edge of state.initialAttachments) {
      assert.ok(state.units.some(u=>u.instanceId===edge.leaderInstanceId)&&state.units.some(u=>u.instanceId===edge.bodyguardInstanceId)&&
        edge.leaderInstanceId!==edge.bodyguardInstanceId&&!leaders.has(edge.leaderInstanceId),'Invalid initial physical attachment');
      assert.ok(book.rosterAttachmentPolicies.some(p=>p.sourceId===state.units.find(u=>u.instanceId===edge.leaderInstanceId).canonicalUnitId&&
        p.targetId===state.units.find(u=>u.instanceId===edge.bodyguardInstanceId).canonicalUnitId&&p.role===edge.role),'Source-illegal initial attachment');
      leaders.add(edge.leaderInstanceId);
    }
  }
}

export const createCSMRosterEffectContext=createRosterConditionContext;

export function evaluateCSMRosterDeclarations(book,input,options={}){
  return evaluateRosterConditionDeclarations(book,input,{...options,validateSelections});
}
