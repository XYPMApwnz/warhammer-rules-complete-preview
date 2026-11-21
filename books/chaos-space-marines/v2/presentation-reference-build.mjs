import {parseProducerJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
import fs from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {buildGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
import {abilityParameters} from '../../shared/army-book-app-v2/ability-presentation.mjs';

export const REFERENCE_SCHEMA='army-book-app-v2/datasheet-reference-bindings/v1';
const bindings=parseProducerJSON(fs.readFileSync(new URL('./presentation-reference-bindings.json',import.meta.url),'utf8'));

/** Book-owned source-occurrence addresses bind existing canonical definitions.
 * Source labels only check that a declared occurrence still describes the same
 * accepted source; labels never choose a target or a gameplay identity.
 */
export function referenceDeclaration(reference) {
  const occurrence=bindings.occurrences[reference.id];
  if(!occurrence)throw new Error(`Unbound source reference: ${reference.id}`);
  const target=bindings.sourceTooltipTargets[occurrence.sourceTooltipId];
  if(!target)throw new Error(`Unbound source tooltip: ${reference.id}`);
  const label=reference.data.label ?? reference.data.groups?.[0]?.entries?.[0]?.label;
  if(label!==occurrence.sourceLabel)throw new Error(`Source reference label drift: ${reference.id}`);
  if(reference.data.armyRuleId && reference.data.armyRuleId!==target.targetId)
    throw new Error(`Canonical Army Rule reference drift: ${reference.id}`);
  return {...target,parameters:structuredClone(occurrence.parameters||{})};
}

export function buildPresentationReferences({model,cards,coreCatalog,runtimeBook}) {
  if(!Array.isArray(model?.entities)||!Array.isArray(cards))throw new TypeError('Missing canonical presentation inputs');
  if(!runtimeBook?.rosterReferenceSemantics||!runtimeBook.rosterAbilityReferences)
    throw new TypeError('Missing registered native reference semantics');
  const {coreCards,coreFactManifest,index}=prepareSourceProducer(buildGlossary({model,coreCatalog}));
  const targets=new Map([...cards,...coreCards].map(card=>[card.id,card]));
  if(targets.size!==cards.length+coreCards.length)throw new Error('Duplicate canonical presentation identity');
  const fields={},entries={},seen=new Set();
  for(const reference of model.entities.filter(entity=>entity.kind==='RULE_REFERENCE')) {
    const card=targets.get(reference.id),declaration=referenceDeclaration(reference),target=targets.get(declaration.targetId);
    if(card?.kind!=='RULE_REFERENCE')throw new Error(`Unresolved canonical reference owner: ${reference.id}`);
    if(!target || (declaration.group==='CORE ABILITIES'?target.domain!=='CORE':target.kind!=='ARMY_RULE'))
      throw new Error(`Unavailable canonical reference definition: ${declaration.targetId}`);
    if(seen.has(reference.id))throw new Error(`Duplicate canonical reference occurrence: ${reference.id}`);
    seen.add(reference.id);
    const field=card.fields.find(item=>item.source?.entityId===reference.id &&
      (item.source.path==='/label'||item.source.path==='/groups/0/entries/0/label'));
    if(!field || field.value!==bindings.occurrences[reference.id].sourceLabel || !field.value.length)
      throw new Error(`Reference label projection mismatch: ${reference.id}`);
    const native=runtimeBook.rosterReferenceSemantics[reference.id]?.abilities||[];
    const registered=native.some(ability=>ability.canonicalId===declaration.targetId&&
      isDeepStrictEqual(abilityParameters(ability),abilityParameters({parameters:declaration.parameters})));
    if(native.length&&!registered)throw new Error(`Native reference representation drift: ${reference.id}`);
    // Runtime-managed abilities must retain their native occurrence so an
    // override or suppression cannot resurrect the canonical baseline. Other
    // canonical references use the existing static MODEL presentation path.
    if(!registered&&runtimeBook.rosterAbilityReferences[declaration.targetId])
      throw new Error(`Missing runtime-managed native occurrence: ${reference.id}`);
    fields[field.id]=[{start:0,end:field.value.length,targetId:declaration.targetId,group:declaration.group,
      ...(registered?{runtimeEntryId:reference.id}:{}),parameters:declaration.parameters}];
    entries[reference.id]={fieldId:field.id,targetId:declaration.targetId};
  }
  if(seen.size!==Object.keys(bindings.occurrences).length)throw new Error('Unenrolled source reference bindings');
  return {coreCards,coreFactManifest,glossaryIndex:index,
    referenceBindings:{schema:REFERENCE_SCHEMA,fields,entries}};
}
