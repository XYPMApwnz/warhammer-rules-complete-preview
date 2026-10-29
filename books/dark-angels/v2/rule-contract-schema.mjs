/** Existing V2 predicates only. Physical presence comes from actual rows;
 * Chapter comes from reviewed Faction facts, never consumer choice or extras. */
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {physicalPresenceBindings} from './rule-contract-declarations.mjs';
import {resolvePhysicalChapterContexts} from './physical-chapter.mjs';
import {createVerifiedPhysicalConditionContext} from '../../shared/roster-v2/physical-condition-context.mjs';
export function createDarkAngelsRuleSchema({state,book,bindContext=context=>context}={}){
 const stateFields={};
 for(const key of ['attached','equipmentRequirementSatisfied','smEquipmentBearerSatisfied','smPermanentAssaultSource','daAncientPresent','daChampionPresent','daArmyMembershipProven'])stateFields[key]={contextLevel:'ROSTER',valueType:'boolean'};
 for(const key of ['smPhysicalUnitInstanceId','smPhysicalModelScopeId'])stateFields[key]={contextLevel:'ROSTER',valueType:'string'};
 for(const key of ['daPhysicalChapter','daChapterContextStatus'])stateFields[key]={contextLevel:'ROSTER',valueType:'string'};
 stateFields.battleConditionSatisfied={contextLevel:'BATTLE',valueType:'boolean'};
 const schema=createRuleContractSchema({stateFields,modelAbilities:['Deep Strike']});
 const chapters=book&&state?resolvePhysicalChapterContexts(book,state):[];
 const physicalContext=createVerifiedPhysicalConditionContext({state,presenceBindings:physicalPresenceBindings,chapterFacts:chapters,armyProvenStatus:'DA_ARMY_CONTEXT_PROVEN'});
 const bind=(context,predicate)=>physicalContext(bindContext(context,predicate));
 return {...schema,bindPhysicalContext:bind,physicalChapterContexts:structuredClone(chapters),evaluatePredicate:(node,context)=>schema.evaluatePredicate(node,bind(context,node)),
  evaluateRole:(role,conditions,context)=>schema.evaluateRole(role,conditions,bind(context))};
}
