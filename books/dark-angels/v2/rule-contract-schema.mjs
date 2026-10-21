/** Existing V2 predicates only. Physical presence comes from actual rows;
 * Chapter comes from reviewed Faction facts, never consumer choice or extras. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {physicalPresenceBindings} from './rule-contract-declarations.mjs';
import {resolvePhysicalChapterContexts} from './physical-chapter.mjs';
export function createDarkAngelsRuleSchema({state,book}={}){
 const stateFields={};
 for(const key of ['attached','equipmentRequirementSatisfied','smEquipmentBearerSatisfied','smPermanentAssaultSource','daAncientPresent','daChampionPresent'])stateFields[key]={contextLevel:'ROSTER',valueType:'boolean'};
 for(const key of ['smPhysicalUnitInstanceId','smPhysicalModelScopeId'])stateFields[key]={contextLevel:'ROSTER',valueType:'string'};
 for(const key of ['daPhysicalChapter','daChapterContextStatus'])stateFields[key]={contextLevel:'ROSTER',valueType:'string'};
 stateFields.battleConditionSatisfied={contextLevel:'BATTLE',valueType:'boolean'};
 const schema=createRuleContractSchema({stateFields,modelAbilities:['Deep Strike']});
 const chapters=book&&state?resolvePhysicalChapterContexts(book,state):[];
 const bind=context=>{
  if(!context)return context;
  const roster={...context.roster};
  // Caller extras cannot substitute for the verified physical source row.
  delete roster.daAncientPresent;delete roster.daChampionPresent;
  delete roster.daPhysicalChapter;delete roster.daChapterContextStatus;
  if(state){
   const unit=state.units.find(unit=>unit.instanceId===context.instanceId);
   for(const [key,proof]of Object.entries(physicalPresenceBindings))
    roster[key]=Boolean(unit&&unit.canonicalUnitId===proof.unitId&&unit.modelRows.some(row=>row.canonicalProfileId===proof.profileId&&Number.isSafeInteger(row.quantity)&&row.quantity>0));
   if(context.subject==='UNIT'){
    const chapter=chapters.find(row=>row.instanceId===unit?.instanceId&&row.canonicalUnitId===context.owner?.unitId);
    roster.daChapterContextStatus=chapter?.status||'CHAPTER_CONTEXT_NOT_PROVEN';
    if(chapter?.status==='CHAPTER_CONTEXT_PROVEN')roster.daPhysicalChapter=chapter.chapter;
   }
  }
  return {...context,roster};
 };
 return {...schema,bindPhysicalContext:bind,physicalChapterContexts:structuredClone(chapters),evaluatePredicate:(node,context)=>schema.evaluatePredicate(node,bind(context)),
  evaluateRole:(role,conditions,context)=>schema.evaluateRole(role,conditions,bind(context))};
}
