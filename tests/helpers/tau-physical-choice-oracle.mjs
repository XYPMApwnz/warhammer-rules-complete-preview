/** Frozen I-2A mutation oracle, never imported by production. These historical
 * book rewrites preserve the existing negative controls while native tests and
 * baseline A/B exercise the new immutable production path. */
import {finalizeOwnedRecipientBook} from '../../books/shared/rule-contract-v2/finalize-recipients.mjs';
import {recipientDeclarationView} from '../../books/shared/rule-contract-v2/recipients.mjs';
import {copySourceEvidence,sourceSnapshot} from '../../books/shared/source-refs-v2/source-refs.mjs';
import {weaponPartitionKey} from '../../books/shared/roster-v2/effects.mjs';
import {pendingPhysicalBindings} from '../../books/tau-empire/v2/rule-contract-declarations.mjs';
import {validateTauSourceChoices,tauStudentRuleId,tauStudentField} from '../../books/tau-empire/v2/roster-source-choices.mjs';
import {validateTauPrototypeChoices} from '../../books/tau-empire/v2/roster-weapon-choices.mjs';
import {selections} from '../../books/shared/roster-v2/context.mjs';
const clone=structuredClone,requireValue=(ok,message)=>{if(!ok)throw new TypeError(message);},assert=requireValue;
const indexOf=book=>new Map(book.entities.map(entity=>[entity.id,entity]));
const choiceKey='source-choice/'+tauStudentRuleId;
const decisionRows=unit=>selections(unit).filter(row=>row.selectionField===tauStudentField||row.selectionKey===choiceKey||row.canonicalOptionIds?.includes(tauStudentRuleId+'::choice::physical-recipients'));
const quote="KROOT SHAPER model only. In the Declare Battle Formations step, you can select up to three friendly KROOT CARNIVORES/FARSTALKERS units. Those units have Deep Strike.";
function withoutStaticChoices(book){
 const result=recipientDeclarationView(book);
 for(const rule of result.entities)if(rule.ruleContract)rule.ruleContract.clauses=rule.ruleContract.clauses.filter(clause=>!clause.rosterEffects.some(effect=>effect.physicalChoice));
 return finalizeOwnedRecipientBook(result);
}
export function bindTauStudentPairs(book,state) {
  book=withoutStaticChoices(book);
  validateTauSourceChoices(book,state);
  const result=recipientDeclarationView(book),rule=indexOf(result).get(tauStudentRuleId);
  requireValue(rule.data.text===quote,'Unreviewed Student of Kauyon source');
  const contract=rule.ruleContract;
  contract.clauses=contract.clauses.filter(clause=>!clause.physicalSourcePair);
  const template=contract.clauses.find(clause=>clause.rosterClassificationNote?.sourceChoice===rule.id);
  requireValue(template?.rosterClassification==='DISPLAY_ONLY'&&template.rosterEffects.length===0,
    'Student requires the original canonical display clause before physical lowering');
  if(!state.detachmentIds.includes(rule.parentId))return finalizeOwnedRecipientBook(result);
  const sources=state.units.filter(unit=>unit.enhancementIds.includes(rule.id)).sort((a,b)=>a.instanceId.localeCompare(b.instanceId));
  for(const source of sources)for(const decision of decisionRows(source))for(const recipient of [...decision.recipientInstanceIds].sort()){
    const pair={sourceInstanceId:source.instanceId,recipientInstanceId:recipient,sourceModelScopeId:decision.sourceModelScopeId};
    const clause=clone(template),proof={field:['text'],quote:rule.data.text};
    clause.id=rule.id+'::physical-pair/'+JSON.stringify([source.instanceId,recipient]);
    clause.physicalSourcePair=clone(pair);clause.rosterClassification='ROSTER_EXECUTABLE';
    clause.rosterClassificationNote={reason:'Confirmed physical source/recipient pair using existing typed FIELD conditions',
      sourceChoice:rule.id,canonicalClauseId:template.id};
    clause.rosterEffects=[{id:clause.id+'/deep-strike',operation:'GRANT_ABILITY',
      ability:{canonicalId:'core-deep-strike',parameters:{}},targetBinding:'ROSTER_UNITS',targetSubject:'UNIT',unitScope:'PHYSICAL',
      conditions:[['SOURCE',source.instanceId],['TARGET',recipient]].map(([binding,id])=>({binding,
        predicate:{predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',
          arguments:{key:'tauPhysicalUnitInstanceId',equals:id},evidence:clone(proof)}})),
      evidence:clone(proof),sourceFields:[['text']],lifetime:'WHILE_ASSIGNED',
      ...copySourceEvidence({provenance:{canonicalRuleId:rule.id,canonicalOwnerId:rule.parentId,canonicalClauseId:template.id,
        sourceEvidence:sourceSnapshot(rule,{book:result}),physicalSourcePair:clone(pair)}},{book:result})}];
    contract.clauses.push(clause);
  }
  return finalizeOwnedRecipientBook(result);
}

export function bindTauPrototypeChoices(book,state){
  book=withoutStaticChoices(book);
  const choices=validateTauPrototypeChoices(book,state),result=recipientDeclarationView(book);
  for(const spec of pendingPhysicalBindings){
    const rule=result.entities.find(entity=>entity.id===spec.ruleId);
    rule.ruleContract.clauses=rule.ruleContract.clauses.filter(clause=>!clause.physicalWeaponSource);
    assert(rule.ruleContract.clauses.every(clause=>clause.rosterEffects.length===0),'Prototype canonical template must remain non-executable');
  }
  for(const choice of choices){
    const rule=result.entities.find(entity=>entity.id===choice.ruleId),template=rule.ruleContract.clauses[0];
    const clause=clone(template),proof={field:['text'],quote:rule.data.text};
    clause.id=rule.id+'::physical-source/'+JSON.stringify(choice.unitInstanceId);clause.rosterClassification='ROSTER_EXECUTABLE';
    clause.physicalWeaponSource=choice.unitInstanceId;
    clause.rosterClassificationNote={reason:'Validated physical weapon choice; quantity-two partition exists only in the effective projection',canonicalClauseId:template.id};
    clause.rosterEffects=choice.spec.operationSpecs.map((operation,index)=>({id:clause.id+'/effect-'+(index+1),...clone(operation),
      targetBinding:'SOURCE_MODEL',targetSubject:'MODEL',weaponIds:[choice.reference.canonicalProfileId],weaponMode:'ranged',
      conditions:[{binding:'SOURCE',predicate:{predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',
        arguments:{key:'tauPhysicalUnitInstanceId',equals:choice.unitInstanceId},evidence:clone(proof)}}],
      sourceFields:[['text']],evidence:clone(proof),lifetime:'WHILE_ASSIGNED',
      ...copySourceEvidence({provenance:{canonicalRuleId:rule.id,canonicalOwnerId:rule.parentId,canonicalClauseId:template.id,sourceEvidence:sourceSnapshot(rule,{book:result})}},{book:result})}));
    rule.ruleContract.clauses.push(clause);
  }
  return finalizeOwnedRecipientBook(result);
}

export function tauWeaponSelectionResolver(book,state){
  const choices=validateTauPrototypeChoices(book,state);
  return ({rule,source})=>pendingPhysicalBindings.some(spec=>spec.ruleId===rule.id)?
    (()=>{const choice=choices.find(choice=>choice.ruleId===rule.id&&choice.unitInstanceId===source?.instanceId);
      if(!choice)return null;
      const reference=clone(choice.reference);
      if(choice.aggregate)reference.selectionKey=weaponPartitionKey({...reference,sourceRuleId:choice.ruleId},'selected');
      return reference;})():undefined;
}

export function tauWeaponPartitionResolver(book,state){
  const choices=validateTauPrototypeChoices(book,state).filter(choice=>choice.aggregate);
  return ()=>choices.map(choice=>({...clone(choice.reference),sourceRuleId:choice.ruleId}));
}
