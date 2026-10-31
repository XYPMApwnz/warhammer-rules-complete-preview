/** Pure leaf computations shared by canonical and legacy condition contexts. */
const assert={ok:(condition,message)=>{if(!condition)throw new TypeError(message);}};

/** Compute one previously declared input, preserving undefined as unknown. */
export function computeRosterCondition(binding,{records,state,unit,rows,context,abilityProjection}){
  let value;
  switch(binding.kind){
    case 'CONTEXT_FIELD':return {skip:true};
    case 'ENHANCEMENT_ASSIGNED':value=unit.enhancementIds.includes(binding.ruleId);break;
    case 'SELECTED_MARK':
      if(unit.selectedMarkId!==undefined)value=unit.selectedMarkId===binding.markId;
      break;
    case 'MARK_SELECTION_ELIGIBLE':{
      // Eligibility observes source inputs, not effective formation keywords.
      const data=records.get(unit.canonicalUnitId).data;
      const keywords=new Set([...data.keywords,...data.factionKeywords]);
      const upgrades=new Set([...(unit.selectedUpgradeIds||[]),...unit.modelRows.flatMap(row=>row.selectedUpgradeIds||[])]);
      for(const id of upgrades)for(const clause of records.get(id)?.ruleContract?.clauses||[])
        for(const effect of clause.rosterEffects||[])if(['GRANT_MODEL_KEYWORD','GRANT_UNIT_KEYWORD'].includes(effect.operation))
          keywords.add(effect.keyword);
      assert.ok(Array.isArray(binding.requiredKeywords)&&Array.isArray(binding.excludedKeywords),'Missing recorded keyword eligibility inputs');
      value=binding.requiredKeywords.every(keyword=>keywords.has(keyword))&&!binding.excludedKeywords.some(keyword=>keywords.has(keyword))&&!binding.keywords.some(keyword=>keywords.has(keyword));
      break;
    }
    case 'SELECTED_OPTION':{
      const choices=[...(unit.selectedUpgradeIds||[]),...rows.flatMap(row=>row.selectedUpgradeIds||[])];
      const ids=[...new Set(choices.filter(id=>(records.get(id)?.canonicalOwnerId||records.get(id)?.parentId)===binding.declarationId))];
      assert.ok(ids.length<=1,'Ambiguous selected canonical Upgrade');
      if(ids.length)value=ids[0];
      else if(unit.selectedUpgradeIds!==undefined||rows.every(row=>row.selectedUpgradeIds!==undefined))value='';
      break;
    }
    case 'PROFILE_PRESENT':value=unit.modelRows.some(row=>row.quantity>0&&
      records.get(row.canonicalProfileId)?.data.composition.modelProfileSourceId===binding.profileId);break;
    case 'SAVE_IMPROVEMENT':{
      const profile=records.get(context.modelId)?.data;
      if(profile){const current=profile.stats?.INSV??profile.INSV;value=current===undefined||Number.parseInt(current)>binding.value;}
      break;
    }
    case 'INITIAL_ATTACHMENT':{
      if(state.initialAttachments!==undefined){
        const current=state.attachments.find(edge=>edge.leaderInstanceId===unit.instanceId);
        value=Boolean(current&&state.initialAttachments.some(edge=>edge.leaderInstanceId===unit.instanceId&&edge.bodyguardInstanceId===current.bodyguardInstanceId));
      }
      break;
    }
    case 'LED_BODYGUARD_ABILITY':{
      const edge=state.attachments.find(item=>item.leaderInstanceId===unit.instanceId);
      if(!edge){value=false;break;}
      const bodyguard=abilityProjection.units.find(item=>item.instanceId===edge.bodyguardInstanceId);
      const matches=ability=>ability.canonicalId===binding.canonicalId&&JSON.stringify(ability.parameters)===JSON.stringify(binding.parameters);
      // A UNIT grant or an ability shared by every bodyguard MODEL suffices.
      value=Boolean(bodyguard?.abilities?.some(matches)||bodyguard?.profiles.length&&bodyguard.profiles.every(profile=>profile.abilities.some(matches)));
      break;
    }
    default:throw new TypeError('Unresolved roster condition computation');
  }
  return {skip:false,value};
}
