import {createCompatibilityCompiler} from '../../shared/rule-contract-v2/compatibility.mjs';
import * as evaluator from './rule-contract-schema.mjs';

/** Book-owned canonical bindings. Current DG profiles share their datasheet's
 * intrinsic keywords; no other book inherits that factual declaration. */
export function createDGCompatibilityCompiler(book) {
  const profileBindings=book.entities.filter(entity=>entity.kind==='DATASHEET').flatMap(unit=>
    unit.data.profileIds.map(profileId=>({unitId:unit.id,profileId,
      intrinsicKeywords:[...unit.data.keywords,...unit.data.factionKeywords],referenceIds:[...unit.data.ruleReferenceIds]})));
  // Preserve the book's existing build-time accepted-reference normalization.
  // The shared compiler sees typed names, never reference labels/source grammar.
  const referenceSemantics=Object.fromEntries(book.entities.filter(entity=>entity.kind==='RULE_REFERENCE').map(reference=>
    [reference.id,/\bDeadly Demise\b/.test(reference.data.label.replace(/^CORE ABILITIES/,''))?['Deadly Demise']:[]]));
  return createCompatibilityCompiler({book,evaluator,profileBindings,referenceSemantics,attachmentRelations:book.mfm.relations});
}

/** Preserve the existing publication formats; shared results also retain every
 * individual MODEL profile evaluation for consumers that need that detail. */
export const relatedEvaluation=result=>({...result,roles:result.roles.map(({roleId,subject,state})=>({roleId,subject,state}))});
