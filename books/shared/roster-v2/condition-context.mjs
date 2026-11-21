import {epicHeroUnitIds} from './compatibility-context.mjs';
/** Physical roster inputs for explicitly declared common condition computations.
 * An available computation never supplies values for undeclared parameter tuples.
 */
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {conditionIdentity} from '../rule-contract-v2/conditions.mjs';
import {validateRoster,formRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects} from './effects.mjs';

import {computeRosterCondition} from './condition-computations.mjs';
export {computeRosterCondition} from './condition-computations.mjs';
import {createRosterConditionBinding} from './condition-binding.mjs';
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

export function createRosterConditionContext(book,state,{abilityProjection=formRoster(book,state)}={}){
  const schema=createRuleContractSchema(book.rosterSchema);
  if(canonicalPlan(book))return createRosterConditionBinding({book,state,schema,inputs:book.conditionComputations,abilityProjection,rosterDetachments:true});
  const records=new Map(book.entities.map(entity=>[entity.id,entity])),epicOwners=epicHeroUnitIds(book);
  const kernel=withRosterDetachments(schema);
  const computations=Object.entries(book.rosterContextBindings||{}).map(([key,binding])=>({key,...binding}));
  const bind=context=>{
    if(!context)return context;
    const unit=state.units.find(item=>item.instanceId===context.instanceId),roster={...context.roster};
    if(!unit)return context;
    const rows=context.subject==='MODEL'?unit.modelRows.filter(row=>row.canonicalProfileId===context.modelId):unit.modelRows;
    for(const binding of computations){
      const result=computeRosterCondition(binding,{book,epicOwners,records,state,unit,rows,context,abilityProjection});
      if(result.skip)continue;
      if(result.value!==undefined)roster[binding.key]=result.value;
      else delete roster[binding.key];
    }
    return {...context,roster};
  };
  return {...kernel,evaluatePredicate:(node,context)=>kernel.evaluatePredicate(node,bind(context)),
    evaluateRole:(role,conditions,context)=>kernel.evaluateRole(role,conditions,bind(context))};
}

/** Prepare one complete generation without publishing it. Book-owned admission
 * and typed context preparation remain callbacks, not a second interpreter.
 * Only a recorded prerequisite ability dependency requests a preliminary pass.
 */
export function prepareRosterConditionExecution(book,input,{validationBook=book,validateSelections=()=>{},
  createContext=createRosterConditionContext}={}){
  if(typeof validateSelections!=='function'||typeof createContext!=='function')throw new TypeError('Invalid roster execution preparation');
  const state=validateRoster(validationBook,input,book.rosterAttachmentPolicies);
  validateSelections(book,state);
  const leaves=node=>node.op?node.args.flatMap(leaves):[node];
  const dependent=clause=>clause.rosterEffects.some(effect=>effect.conditions.some(condition=>
    leaves(condition.predicate).some(node=>findRosterConditionComputation(book,node)?.kind==='LED_BODYGUARD_ABILITY')));
  const twoPass=book.entities.some(rule=>rule.ruleContract?.clauses.some(dependent));
  let first;
  if(twoPass){
    // Rebuild from this invocation's canonical base. Dependent grants cannot
    // establish their own prerequisite, and no previous projection is input.
    const dependencies=clone(book);
    for(const rule of dependencies.entities)for(const clause of rule.ruleContract?.clauses||[])
      if(dependent(clause)){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
    first=executeRosterEffects(dependencies,state,createContext(book,state));
  }
  const context=createContext(book,state,{abilityProjection:first});
  const projection=executeRosterEffects(book,state,context);
  if(projection.schema!=='roster-v2/effective'||projection.rosterId!==state.rosterId||projection.units.length!==state.units.length||
    projection.units.some((unit,index)=>unit.instanceId!==state.units[index].instanceId||unit.canonicalUnitId!==state.units[index].canonicalUnitId)||
    new Set(projection.units.map(unit=>unit.instanceId)).size!==state.units.length)
    throw new TypeError('Invalid roster execution projection');
  return {state,context,projection,passes:twoPass?2:1};
}

/** Compatibility API for callers that consume only the completed projection. */
export function evaluateRosterConditionDeclarations(book,input,options){
  return prepareRosterConditionExecution(book,input,options).projection;
}
