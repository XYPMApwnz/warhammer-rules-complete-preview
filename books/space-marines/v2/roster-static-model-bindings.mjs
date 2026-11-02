/** Physical source bindings using existing V2 FIELD predicates and operations.
 * Canonical source facts stay immutable. Derived clause addresses refer only to
 * already imported MODEL scopes; they never create a MODEL or guess a bearer.
 */
import {recipientDeclarationView} from '../../shared/rule-contract-v2/recipients.mjs';
import {finalizeOwnedRecipientBook} from '../../shared/rule-contract-v2/finalize-recipients.mjs';
import {sameSourceEvidence,sourceSnapshot,copySourceEvidence} from '../../shared/source-refs-v2/source-refs.mjs';

const clone=structuredClone;
const requireValue=(value,message)=>{if(!value)throw new TypeError(message);};
export const physicalStaticBindings=Object.freeze([Object.freeze({
  ruleId:'ability-sm-c4061e257e81492f',
  sourceUnitId:'unit-sm-3460439c3a774c66',
  sourceProfileId:'model-sm-574846fb8e3e4e77',
  quote:'Veteran Bodyguard: While this model is attached to a unit, other CHARACTER models in this unit have Feel No Pain 4+.',
  field:['text'],operation:'GRANT_MODEL_ABILITY',ability:{name:'Feel No Pain',value:4},
  recipientKeyword:'CHARACTER',excludeExactSourceModel:true,
  sourceEvidence:{sourceId:'space-marines-waha-11e-2026-10-20',
    document:'books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html',
    sha256:'66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D',
    pointer:'/html/body/div/div[1]/div[3]/div[2]/div[18]/div[2]/div[2]/div[2]',
    sourceEntityId:'sm-source-4e2754ee64f14fb7',authority:'ACCEPTED_SECONDARY'}
})]);

/** SM-only producer stage. The common contract producer remains unchanged so
 * supplement consumers cannot inherit this runtime operation accidentally. */
export function prepareSpaceMarinesStaticModels(book){
  const result=recipientDeclarationView(book),index=new Map(result.entities.map(entity=>[entity.id,entity]));
  for(const binding of physicalStaticBindings){
    const rule=index.get(binding.ruleId),profile=index.get(binding.sourceProfileId);
    requireValue(rule?.parentId===binding.sourceUnitId&&rule.data.text===binding.quote&&
      profile?.kind==='PROFILE'&&profile.parentId===binding.sourceUnitId&&
      sameSourceEvidence(rule,binding,{book:result,otherSlot:'sourceEvidence'}),'Unreviewed physical static MODEL source');
    const contract=rule.ruleContract;
    requireValue(contract?.ruleId===rule.id,'Missing canonical physical static contract');
    const template=contract.clauses.find(clause=>clause.sourceText===binding.quote&&clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0);
    requireValue(template,'Physical static binding requires the original canonical display clause');
    const id=template.id+'::static-model';
    requireValue(!contract.clauses.some(clause=>clause.id===id),'Duplicate static MODEL operation');
    const proof={field:clone(binding.field),quote:binding.quote};
    contract.clauses.push({...clone(template),id,rosterClassification:'ROSTER_EXECUTABLE',
      rosterClassificationNote:{reason:'Static source operation requires one confirmed physical MODEL in its attached formation',canonicalClauseId:template.id},
      rosterEffects:[{id:id+'/feel-no-pain',operation:binding.operation,ability:clone(binding.ability),
        targetBinding:'SOURCE_FORMED_MODELS',targetSubject:'MODEL',lifetime:'WHILE_ATTACHED',
        physicalSource:{kind:'STATIC_MODEL',sourceProfileId:binding.sourceProfileId,canonicalClauseId:template.id,
          clauseIdPrefix:'::physical-static/',effectIdSuffix:'/feel-no-pain',excludeExactSourceModel:true},
        conditions:[{binding:'SOURCE',predicate:{predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',arguments:{key:'attached',equals:true},evidence:clone(proof)}},
          {binding:'TARGET',predicate:{predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',arguments:{keyword:binding.recipientKeyword},evidence:clone(proof)}}],
        sourceFields:[clone(binding.field)],evidence:clone(proof),
        ...copySourceEvidence({provenance:{canonicalRuleId:rule.id,canonicalOwnerId:rule.parentId,canonicalClauseId:template.id,
          sourceEvidence:sourceSnapshot(rule,{book:result})}},{book:result})}]});
  }
  return finalizeOwnedRecipientBook(result);
}
