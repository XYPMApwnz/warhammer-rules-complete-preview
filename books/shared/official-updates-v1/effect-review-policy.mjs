/** Pure safety policy; automation comes from freshly authored contracts. */
import {isDeepStrictEqual} from 'node:util';
export function changesRuleText(entry){return entry.kind?.endsWith('_TEXT')&&['SET','ADD_FIELD','REPLACE_FRAGMENT','REMOVE_FIELD'].includes(entry.operation)&&!isDeepStrictEqual(entry.expectedBefore,entry.after);}
export function hasAutomation(contract){
 if(!contract)return false;
 const visit=value=>!!value&&typeof value==='object'&&(value.rosterClassification==='ROSTER_EXECUTABLE'||
  Array.isArray(value.rosterEffects)&&value.rosterEffects.length>0||
  Array.isArray(value.semanticEffects)&&value.semanticEffects.length>0||
  Array.isArray(value.conditions)&&value.conditions.length>0||Object.values(value).some(child=>typeof child==='object'&&visit(child)));
 return visit(contract);
}
export function requireEffectReview(bookId,ruleId,entry){
 if(!['unchanged','updated'].includes(entry.effectReview)||typeof entry.effectReviewNote!=='string'||!entry.effectReviewNote.trim())
  throw Error(`GW changed a rule with automation: review effects: ${bookId} · ${ruleId} (${entry.id}); effectReview and effectReviewNote are required`);
}
