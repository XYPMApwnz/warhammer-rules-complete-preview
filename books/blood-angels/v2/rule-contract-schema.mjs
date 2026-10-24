/** Reuse the existing physical/state predicates; no Chapter inference. */
import {createSpaceMarinesRuleSchema} from '../../space-marines/v2/rule-contract-schema.mjs';
export function createBloodAngelsRuleSchema({bindContext=context=>context}={}){
 const schema=createSpaceMarinesRuleSchema({bindContext});
 return {...schema,bindPhysicalContext:bindContext};
}
