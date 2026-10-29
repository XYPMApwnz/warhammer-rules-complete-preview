/** Physical roster inputs for explicitly declared common condition computations.
 * An available computation never supplies values for undeclared parameter tuples.
 */
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {conditionIdentity,setConditionValue} from '../rule-contract-v2/conditions.mjs';
import {validateRoster,formRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects} from './effects.mjs';

const assert={ok:(condition,message)=>{if(!condition)throw new TypeError(message);}};
const clone=structuredClone;
const computationArguments=binding=>({...binding.arguments,key:binding.key});
const canonicalPlan=book=>Array.isArray(book.conditionComputations);

/** Legacy producer scratch books retain their reviewed input binding registry.
 * A canonical runtime book resolves only its parameterized computation plan.
 */
export function findRosterConditionComputation(book,nodeOrArguments){
  const args=nodeOrArguments?.arguments||nodeOrArguments;
  if(!args?.key)return undefined;
  if(!canonicalPlan(book))return book.rosterContextBindings?.[args.key];
  const identity=conditionIdentity(args);
  return book.conditionComputations.find(binding=>conditionIdentity(computationArguments(binding))===identity);
}

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

export function createRosterConditionContext(book,state,{abilityProjection=formRoster(book,state)}={}){
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const kernel=withRosterDetachments(createRuleContractSchema(book.rosterSchema));
  const canonical=canonicalPlan(book);
  const computations=canonical?book.conditionComputations:Object.entries(book.rosterContextBindings||{}).map(([key,binding])=>({key,...binding}));
  const bind=context=>{
    if(!context)return context;
    const unit=state.units.find(item=>item.instanceId===context.instanceId),roster={...context.roster};
    if(!unit)return context;
    const rows=context.subject==='MODEL'?unit.modelRows.filter(row=>row.canonicalProfileId===context.modelId):unit.modelRows;
    for(const binding of computations){
      const result=computeRosterCondition(binding,{records,state,unit,rows,context,abilityProjection});
      if(result.skip)continue;
      if(canonical)setConditionValue(roster,computationArguments(binding),result.value);
      else if(result.value!==undefined)roster[binding.key]=result.value;
      else delete roster[binding.key];
    }
    return {...context,roster};
  };
  return {...kernel,evaluatePredicate:(node,context)=>kernel.evaluatePredicate(node,bind(context)),
    evaluateRole:(role,conditions,context)=>kernel.evaluateRole(role,conditions,bind(context))};
}

/** Both passes rebuild the same canonical base; prerequisite ability grants
 * cannot enable themselves during the first pass.
 */
export function evaluateRosterConditionDeclarations(book,input,{validationBook=book,validateSelections=()=>{}}={}){
  const state=validateRoster(validationBook,input,book.rosterAttachmentPolicies);
  validateSelections(book,state);
  const dependencies=clone(book);
  const leaves=node=>node.op?node.args.flatMap(leaves):[node];
  for(const rule of dependencies.entities)for(const clause of rule.ruleContract?.clauses||[]){
    const depends=clause.rosterEffects.some(effect=>effect.conditions.some(condition=>
      leaves(condition.predicate).some(node=>findRosterConditionComputation(book,node)?.kind==='LED_BODYGUARD_ABILITY')));
    if(depends){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
  }
  const first=executeRosterEffects(dependencies,state,createRosterConditionContext(book,state));
  return executeRosterEffects(book,state,createRosterConditionContext(book,state,{abilityProjection:first}));
}
