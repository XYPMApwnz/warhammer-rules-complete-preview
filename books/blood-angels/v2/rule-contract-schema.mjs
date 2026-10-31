/** Reuse the existing physical/state predicates; no Chapter inference. */
import {createSpaceMarinesRuleSchema} from '../../space-marines/v2/rule-contract-schema.mjs';
export function createBloodAngelsRuleSchema(options={}){
 const schema=createSpaceMarinesRuleSchema(options);
 return {...schema,bindPhysicalContext:schema.bindContext};
}
