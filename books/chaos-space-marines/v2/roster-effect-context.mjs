/** Explicit CSM roster input -> reviewed book-owned context fields. Boolean
 * logic, selectors, recipients and effects remain in the existing shared V2
 * interpreters. This module owns only input normalization, not an interpreter. */
const assert={ok:(condition,message)=>{if(!condition)throw new TypeError(message);}};
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {validateRoster,formRoster,withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../../shared/roster-v2/effects.mjs';

const clone=structuredClone;
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

export function createCSMRosterEffectContext(book,state,{abilityProjection=formRoster(book,state)}={}) {
  const records=new Map(book.entities.map(e=>[e.id,e]));
  const kernel=withRosterDetachments(createRuleContractSchema(book.rosterSchema));
  const bind=context=>{
    if(!context)return context;
    const unit=state.units.find(u=>u.instanceId===context.instanceId),roster={...context.roster};
    if(!unit)return context;
    const rows=context.subject==='MODEL'?unit.modelRows.filter(r=>r.canonicalProfileId===context.modelId):unit.modelRows;
    for(const [key,binding] of Object.entries(book.rosterContextBindings)) {
      let value;
      switch(binding.kind) {
        case 'CONTEXT_FIELD':continue;
        case 'ENHANCEMENT_ASSIGNED':value=unit.enhancementIds.includes(binding.ruleId);break;
        case 'SELECTED_MARK':
          if(unit.selectedMarkId!==undefined)value=unit.selectedMarkId===binding.markId;
          break;
        case 'MARK_SELECTION_ELIGIBLE': {
          // Mustering eligibility observes source input, not this grant's own
          // effective keyword or a neighbouring Attached Unit component.
          const data=records.get(unit.canonicalUnitId).data;
          const keywords=new Set([...data.keywords,...data.factionKeywords]);
          const upgrades=new Set([...(unit.selectedUpgradeIds||[]),...unit.modelRows.flatMap(row=>row.selectedUpgradeIds||[])]);
          for(const id of upgrades)for(const clause of records.get(id)?.ruleContract?.clauses||[])
            for(const effect of clause.rosterEffects||[])if(['GRANT_MODEL_KEYWORD','GRANT_UNIT_KEYWORD'].includes(effect.operation))
              keywords.add(effect.keyword);
          value=keywords.has('HERETIC ASTARTES')&&!keywords.has('EPIC HERO')&&!binding.keywords.some(keyword=>keywords.has(keyword));
          break;
        }
        case 'SELECTED_OPTION': {
          const choices=[...(unit.selectedUpgradeIds||[]),...rows.flatMap(r=>r.selectedUpgradeIds||[])];
          const ids=[...new Set(choices.filter(id=>(records.get(id)?.canonicalOwnerId||records.get(id)?.parentId)===binding.declarationId))];
          assert.ok(ids.length<=1,'Ambiguous selected canonical Upgrade');
          if(ids.length)value=ids[0];
          else if(unit.selectedUpgradeIds!==undefined||rows.every(r=>r.selectedUpgradeIds!==undefined))value='';
          break;
        }
        case 'PROFILE_PRESENT':value=unit.modelRows.some(r=>r.quantity>0&&
          records.get(r.canonicalProfileId)?.data.composition.modelProfileSourceId===binding.profileId);break;
        case 'SAVE_IMPROVEMENT': {
          const profile=records.get(context.modelId)?.data;
          if(profile){const current=profile.stats?.INSV??profile.INSV;value=current===undefined||Number.parseInt(current)>binding.value;}
          break;
        }
        case 'INITIAL_ATTACHMENT': {
          if(state.initialAttachments!==undefined) {
            const current=state.attachments.find(e=>e.leaderInstanceId===unit.instanceId);
            value=Boolean(current&&state.initialAttachments.some(e=>e.leaderInstanceId===unit.instanceId&&e.bodyguardInstanceId===current.bodyguardInstanceId));
          }
          break;
        }
        case 'LED_BODYGUARD_ABILITY': {
          const edge=state.attachments.find(e=>e.leaderInstanceId===unit.instanceId);
          if(!edge){value=false;break;}
          const bodyguard=abilityProjection.units.find(u=>u.instanceId===edge.bodyguardInstanceId);
          const matches=a=>a.canonicalId===binding.canonicalId&&JSON.stringify(a.parameters)===JSON.stringify(binding.parameters);
          // A UNIT grant or an ability shared by every bodyguard MODEL suffices.
          // One isolated model's Scouts is not silently promoted to UNIT-wide.
          value=Boolean(bodyguard?.abilities?.some(matches)||bodyguard?.profiles.length&&bodyguard.profiles.every(p=>p.abilities.some(matches)));
          break;
        }
        default:throw new TypeError('Unresolved book-owned roster field binding');
      }
      if(value!==undefined)roster[key]=value;else delete roster[key];
    }
    return {...context,roster};
  };
  return {...kernel,evaluatePredicate:(node,context)=>kernel.evaluatePredicate(node,bind(context)),
    evaluateRole:(role,conditions,context)=>kernel.evaluateRole(role,conditions,bind(context))};
}

/** Declaration and imported-runtime boundary. Both passes rebuild from the
 * same immutable canonical base using the same shared interpreter. The first
 * supplies effective ability prerequisites without self-enabling Scouts grants.
 */
export function evaluateCSMRosterDeclarations(book,input,{validationBook=book}={}) {
  // Imported choices retain canonical declaration ownership. Executable
  // UPGRADE_OPTION parents are dispatch addresses, not exclusive-choice groups.
  const state=validateRoster(validationBook,input,book.rosterAttachmentPolicies);
  validateSelections(book,state);
  const dependencies=clone(book);
  const leaves=node=>node.op?node.args.flatMap(leaves):[node];
  for(const rule of dependencies.entities)for(const clause of rule.ruleContract?.clauses||[]) {
    const depends=clause.rosterEffects.some(effect=>effect.conditions.some(condition=>
      leaves(condition.predicate).some(node=>book.rosterContextBindings[node.arguments?.key]?.kind==='LED_BODYGUARD_ABILITY')));
    if(depends){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
  }
  const first=executeRosterEffects(dependencies,state,createCSMRosterEffectContext(book,state));
  return executeRosterEffects(book,state,createCSMRosterEffectContext(book,state,{abilityProjection:first}));
}
