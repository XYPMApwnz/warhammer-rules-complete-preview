import {resolveExecutionEffect,physicalModelGroup} from './recipient-execution.mjs';
import {sourceSnapshot,copySourceEvidence,getRecordedSourceIdentity} from '../source-refs-v2/source-refs.mjs';

const requireSource=(ok,message)=>{if(!ok)throw new TypeError('Physical static MODEL binding: '+message);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=structuredClone;

/** This descriptor identifies a canonical source PROFILE, not a new recipient
 * format. Canonical recipientId and existing operation validation still apply. */
export function validatePhysicalStaticModelEffect(book,rule,clause,effect){
  const binding=effect.physicalSource;if(binding===undefined)return;
  requireSource(binding&&Object.keys(binding).sort().join()===['kind','sourceProfileId','canonicalClauseId','clauseIdPrefix','effectIdSuffix','excludeExactSourceModel'].sort().join()&&
    binding.kind==='STATIC_MODEL'&&binding.excludeExactSourceModel===true&&
    ['sourceProfileId','canonicalClauseId','clauseIdPrefix','effectIdSuffix'].every(key=>typeof binding[key]==='string'&&binding[key]),'invalid descriptor');
  const profile=book.entities.find(entity=>entity.id===binding.sourceProfileId),owner=book.entities.find(entity=>entity.id===rule.parentId);
  requireSource(rule.kind==='DATASHEET_ABILITY'&&owner?.kind==='DATASHEET'&&profile?.kind==='PROFILE'&&profile.parentId===owner.id&&
    owner.data.profileIds.includes(profile.id)&&getRecordedSourceIdentity(rule,{book}),'unconfirmed source owner or PROFILE');
  const origin=sourceSnapshot(effect,{book});
  requireSource(rule.ruleContract.clauses.some(item=>item!==clause&&item.id===binding.canonicalClauseId)&&
    origin?.canonicalRuleId===rule.id&&origin.canonicalOwnerId===owner.id&&origin.canonicalClauseId===binding.canonicalClauseId&&
    same(origin.sourceEvidence,sourceSnapshot(rule,{book}))&&!origin.physicalSourceModel,'unconfirmed source provenance');
  requireSource(effect.operation==='GRANT_MODEL_ABILITY'&&effect.targetBinding==='SOURCE_FORMED_MODELS'&&effect.targetSubject==='MODEL'&&
    effect.lifetime==='WHILE_ATTACHED'&&effect.conditions.length===2&&
    effect.conditions[0].binding==='SOURCE'&&effect.conditions[0].predicate?.predicate==='FIELD'&&
    effect.conditions[0].predicate.subject==='UNIT'&&effect.conditions[0].predicate.contextLevel==='ROSTER'&&
    effect.conditions[0].predicate.arguments?.key==='attached'&&effect.conditions[0].predicate.arguments.equals===true&&
    effect.conditions[1].binding==='TARGET'&&effect.conditions[1].predicate?.predicate==='MODEL_KEYWORD'&&
    effect.conditions[1].predicate.subject==='MODEL','invalid attached MODEL operation');
}

/** Disposable pending entries for the existing interpreter. Ambiguity withholds
 * the operation, matching the original source binding; it does not invent IDs. */
export function resolvePhysicalStaticModelEffects(book,projection){
  const entries=[];
  for(const rule of book.entities)for(const clause of rule.ruleContract?.clauses||[])for(const declaration of clause.rosterEffects||[]){
    if(!declaration.physicalSource)continue;
    const effect=resolveExecutionEffect(rule,clause,declaration),binding=effect.physicalSource;
    validatePhysicalStaticModelEffect(book,rule,clause,effect);
    for(const source of projection.units.filter(unit=>unit.canonicalUnitId===rule.parentId)){
      if(source.startingStrength!==1||source.profiles.length!==1)continue;
      const model=source.profiles[0];
      if(model.canonicalProfileId!==binding.sourceProfileId||model.quantity!==1||!model.scopeId)continue;
      physicalModelGroup(source,model);
      const pair={unitInstanceId:source.instanceId,modelScopeId:model.scopeId,canonicalProfileId:binding.sourceProfileId};
      const clauseId=rule.id+binding.clauseIdPrefix+JSON.stringify([source.instanceId,model.scopeId]);
      const field=(subject,key,equals)=>({predicate:'FIELD',subject,contextLevel:'ROSTER',arguments:{key,equals},evidence:clone(effect.evidence)});
      const {physicalSource,...operation}=effect;
      entries.push({rule,declarationClause:clause,declaration,source,clause:{...clause,id:clauseId},
        effect:{...operation,id:clauseId+binding.effectIdSuffix,conditions:[
          {binding:'SOURCE',predicate:field('UNIT','physicalUnitInstanceId',source.instanceId)},
          clone(effect.conditions[0]),
          {binding:'TARGET',predicate:{op:'NOT',args:[field('MODEL','physicalModelScopeId',model.scopeId)]}},
          clone(effect.conditions[1])],
          ...copySourceEvidence({provenance:{canonicalRuleId:rule.id,canonicalOwnerId:rule.parentId,canonicalClauseId:binding.canonicalClauseId,
            sourceEvidence:sourceSnapshot(rule,{book}),physicalSourceModel:pair}},{book})}});
    }
  }
  return entries;
}
