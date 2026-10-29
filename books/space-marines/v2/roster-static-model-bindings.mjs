/** Physical source bindings using existing V2 FIELD predicates and operations.
 * Canonical source facts stay immutable. Derived clause addresses refer only to
 * already imported MODEL scopes; they never create a MODEL or guess a bearer.
 */
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {recipientDeclarationView} from '../../shared/rule-contract-v2/recipients.mjs';
import {finalizeRecipientBook} from '../../shared/rule-contract-v2/finalize-recipients.mjs';
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

/** Rebuild per physical source on every load, just as existing V2 source-choice
 * bindings do. No stored derived clauses, grants or old source scopes survive.
 */
export function bindSpaceMarinesStaticModels(book,state){
  const result=recipientDeclarationView(book),index=new Map(result.entities.map(entity=>[entity.id,entity]));
  for(const binding of physicalStaticBindings){
    const rule=index.get(binding.ruleId),profile=index.get(binding.sourceProfileId);
    requireValue(rule?.parentId===binding.sourceUnitId&&rule.data.text===binding.quote&&
      profile?.kind==='PROFILE'&&profile.parentId===binding.sourceUnitId&&
      sameSourceEvidence(rule,binding,{book:result,otherSlot:'sourceEvidence'}),
      'Unreviewed physical static MODEL source');
    const contract=rule.ruleContract;
    requireValue(contract?.ruleId===rule.id,'Missing canonical physical static contract');
    contract.clauses=contract.clauses.filter(clause=>!clause.physicalStaticSource);
    const template=contract.clauses.find(clause=>clause.sourceText===binding.quote&&
      clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0);
    requireValue(template,'Physical static binding requires the original canonical display clause');
    const formed=formRoster(result,state);
    for(const source of formed.units.filter(unit=>unit.canonicalUnitId===binding.sourceUnitId)
      .sort((a,b)=>a.instanceId.localeCompare(b.instanceId))){
      // A grouped quantity, a foreign profile or multiple possible source MODEL
      // rows cannot prove this ability's exact "other MODEL" exclusion.
      if(source.startingStrength!==1||source.profiles.length!==1)continue;
      const model=source.profiles[0];
      if(model.canonicalProfileId!==binding.sourceProfileId||model.quantity!==1||!model.scopeId)continue;
      const pair={unitInstanceId:source.instanceId,modelScopeId:model.scopeId,
        canonicalProfileId:binding.sourceProfileId};
      const proof={field:clone(binding.field),quote:binding.quote};
      const field=(subject,key,equals)=>({predicate:'FIELD',subject,contextLevel:'ROSTER',
        arguments:{key,equals},evidence:clone(proof)});
      const clause=clone(template);
      clause.id=rule.id+'::physical-static/'+JSON.stringify([source.instanceId,model.scopeId]);
      clause.physicalStaticSource=clone(pair);clause.rosterClassification='ROSTER_EXECUTABLE';
      clause.rosterClassificationNote={reason:'Confirmed physical source MODEL; other CHARACTER MODELs in its attached formation only',
        canonicalClauseId:template.id};
      clause.rosterEffects=[{id:clause.id+'/feel-no-pain',operation:binding.operation,
        ability:clone(binding.ability),targetBinding:'SOURCE_FORMED_MODELS',targetSubject:'MODEL',
        lifetime:'WHILE_ATTACHED',conditions:[
          {binding:'SOURCE',predicate:field('UNIT','smPhysicalUnitInstanceId',source.instanceId)},
          {binding:'SOURCE',predicate:field('UNIT','attached',true)},
          {binding:'TARGET',predicate:{op:'NOT',args:[field('MODEL','smPhysicalModelScopeId',model.scopeId)]}},
          {binding:'TARGET',predicate:{predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',
            arguments:{keyword:binding.recipientKeyword},evidence:clone(proof)}}],
        sourceFields:[clone(binding.field)],evidence:clone(proof),
        ...copySourceEvidence({provenance:{canonicalRuleId:rule.id,canonicalOwnerId:rule.parentId,canonicalClauseId:template.id,
          sourceEvidence:sourceSnapshot(rule,{book:result}),physicalSourceModel:clone(pair)}},{book:result})}];
      contract.clauses.push(clause);
    }
  }
  return finalizeRecipientBook(result);
}
