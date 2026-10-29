import {formRoster,selections} from '../../shared/roster-v2/context.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {createSelectedSourceChoiceConditionContext,withDefaultConditionValue} from '../../shared/roster-v2/physical-condition-context.mjs';
import {getRecordedSourceIdentity,sameSourceEvidence,copySourceEvidence} from '../../shared/source-refs-v2/source-refs.mjs';

export const surpriseRuleId='detachment-subterranean-assault:rule';
export const trygonCharacterOptionId=surpriseRuleId+'::choice::trygon-character';
export const trygonChoiceField='selectedSurpriseAssaultChoice';
const selectionField='selectedSourceChoiceIds',clone=structuredClone;
const assert=(ok,message)=>{if(!ok)throw new TypeError(message);};
export const trygonChoiceQuote='In the Muster Armies step, you can select up to 2 TRYGON models from your army. The selected units gain the CHARACTER keyword.';

/** Disposable binding to the existing factual rule, not a second rule owner or
 * an invented New Recruit export label. The explicit UI decision uses the same
 * canonical option/physical selection snapshot already used by other books. */
export function addTyranidsSourceChoices(book) {
  const rule=book.entities.find(e=>e.id===surpriseRuleId);
  assert(rule?.kind==='DETACHMENT_RULE'&&rule.data.text.includes(trygonChoiceQuote)&&getRecordedSourceIdentity(rule,{book}),
    'Unconfirmed Surprise Assault source choice');
  const option={id:trygonCharacterOptionId,kind:'UPGRADE_OPTION',parentId:rule.id,
    authority:'SOURCE_BACKED_SELECTION_BINDING',
    data:{selectionRuleId:rule.id,unitId:'unit-trygon',modelProfileIds:['datasheet-trygon:profile:1'],
      text:'CHARACTER',timing:'MUSTER_ARMIES'},...copySourceEvidence(rule,{book})};
  assert(!book.entities.some(e=>e.id===option.id),'Duplicate source choice');
  book.entities.push(option);book.rosterSelectionOptions=[option];
}

/** Check the reverse correspondence as well: a selected field alone is never
 * proof of a physical decision. No keyword is stored in the input snapshot. */
export function validateTyranidsSourceChoices(book,state) {
  const option=book.entities.find(e=>e.id===trygonCharacterOptionId),rule=book.entities.find(e=>e.id===surpriseRuleId);
  assert(option?.parentId===rule?.id&&option?.data.unitId==='unit-trygon'&&
    sameSourceEvidence(option,rule,{book}),'Unbound source choice');
  const physical=formRoster(book,state);
  for(const unit of state.units) {
    const ids=unit[selectionField]===undefined?[]:unit[selectionField],decisions=selections(unit).filter(s=>
      s.canonicalOptionIds?.includes(option.id)||s.selectionField===selectionField||s.selectionKey?.startsWith('source-choice/'));
    assert(Array.isArray(ids)&&ids.length<=1&&ids.every(id=>id===option.id),'Unknown or duplicate source choice');
    assert(decisions.length===ids.length,'Source choice field and physical decision disagree');
    if(!ids.length)continue;
    assert(unit.canonicalUnitId===option.data.unitId&&state.detachmentIds.includes(rule.parentId),'Foreign source choice owner');
    const models=physical.units.find(u=>u.instanceId===unit.instanceId).profiles;
    assert(models.length===1&&models[0].quantity===1&&option.data.modelProfileIds.includes(models[0].canonicalProfileId),
      'Source choice requires one exact eligible physical MODEL');
    const model=models[0],s=decisions[0];
    assert(model.selections.some(row=>row.selectionKey===s.selectionKey)&&s.sourceModelScopeId===model.scopeId&&
      s.selectionKey==='source-choice/'+rule.id&&s.physicalQuantity===1&&s.perModelQuantity===1&&
      s.selectionField===selectionField&&s.selectionCardinality==='MANY'&&s.canonicalOptionIds.length===1&&
      s.canonicalProfileIds.length===0&&s.canonicalEquipmentIds.length===0&&
      JSON.stringify(s.sourceChoiceReference)===JSON.stringify({bookId:book.bookId,entityId:rule.id,path:'/text'})&&
      sameSourceEvidence(s,rule,{book,slot:'sourceProvenance',otherSlot:'provenance'}),'Invalid physical source choice evidence');
  }
  return state;
}

export function setTyranidsSourceChoice(book,snapshot,instanceId,ruleId,optionId) {
  const state=clone(snapshot),unit=state.units.find(u=>u.instanceId===instanceId);
  assert(ruleId===surpriseRuleId&&[null,trygonCharacterOptionId].includes(optionId),'Unknown source decision');
  assert(unit?.canonicalUnitId==='unit-trygon','Foreign physical source recipient');
  validateTyranidsSourceChoices(book,state);
  unit[selectionField]=[];
  for(const container of [unit,...unit.modelRows,...unit.modelRows.flatMap(r=>r.loadouts||[])])
    container.selections=container.selections.filter(s=>!s.canonicalOptionIds?.includes(trygonCharacterOptionId));
  if(optionId) {
    const rule=book.entities.find(e=>e.id===ruleId),physical=formRoster(book,state).units.find(u=>u.instanceId===instanceId);
    assert(state.detachmentIds.includes(rule.parentId)&&physical.profiles.length===1&&physical.profiles[0].quantity===1,
      'Unresolved physical source choice context');
    const model=physical.profiles[0];
    unit[selectionField]=[optionId];
    unit.modelRows[0].selections.push({selectionKey:'source-choice/'+ruleId,canonicalProfileIds:[],canonicalEquipmentIds:[],
      canonicalOptionIds:[optionId],selectionField,selectionCardinality:'MANY',physicalQuantity:1,perModelQuantity:1,
      sourceModelScopeId:model.scopeId,sourceChoiceReference:{bookId:book.bookId,entityId:ruleId,path:'/text'},
      ...copySourceEvidence(rule,{book,targetSlot:'sourceProvenance'})});
  }
  return validateTyranidsSourceChoices(book,state);
}

/** One verified decision supplies a scalar FIELD to the existing evaluator.
 * Absence means no selection; Enhancement, SYNAPSE and names are irrelevant. */
export function tyranidsSourceChoiceContext(book,state) {
  validateTyranidsSourceChoices(book,state);
  return createSelectedSourceChoiceConditionContext(state,{selectionField,ruleId:surpriseRuleId});
}

export function createTyranidsRuleSchema({bindContext=context=>context}={}) {
  const kernel=createRuleContractSchema({stateFields:{attached:{contextLevel:'ROSTER',valueType:'boolean'},
    battleConditionSatisfied:{contextLevel:'BATTLE',valueType:'boolean'},
    [trygonChoiceField]:{contextLevel:'ROSTER',valueType:'string'}}});
  const bind=context=>bindContext(withDefaultConditionValue(context,{key:'selectedSourceChoice',ruleId:surpriseRuleId},''));
  return {...kernel,evaluatePredicate:(node,context)=>kernel.evaluatePredicate(node,bind(context)),
    evaluateRole:(role,conditions,context)=>kernel.evaluateRole(role,conditions,bind(context))};
}

/** Same exact export namespace and physical input permit retaining a player's
 * choice on reimport. Changed exports require a new explicit confirmation. */
export function preserveTyranidsSourceChoices(book,incoming,previous) {
  if(!previous||incoming.rosterId!==previous.rosterId)return incoming;
  let state=clone(incoming);
  validateTyranidsSourceChoices(book,previous);
  for(const unit of previous.units)if(unit[selectionField]!==undefined)
    state=setTyranidsSourceChoice(book,state,unit.instanceId,surpriseRuleId,unit[selectionField][0]||null);
  return state;
}
