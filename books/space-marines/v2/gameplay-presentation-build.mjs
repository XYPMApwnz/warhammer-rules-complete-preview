import {serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
/** Isolated native gameplay presentation. Existing projectors and presenters
 * consume it; this is not an application registration or import adapter. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {nativeAbilityReview} from './native-ability-bindings.mjs';
import {buildGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';

// Exact accepted RAW tooltip addresses select existing definitions. These are
// navigation bindings only: they never seed or execute an Army/battle ability.
const textReferences={
  '#tooltip_content00021':{id:'army-rule-sm-fcdb8cd8bb5f40dd',labels:['Combat Doctrines'],group:'ARMY RULES'},
  '#tooltip_content00266':{id:'army-rule-sm-940f2057cc7c4551',labels:['Transhuman Strategist'],group:'ARMY RULES'},
  '#tooltip_content00265':{id:'army-rule-sm-a3907d06530b419a',labels:['Librarius'],group:'ARMY RULES'},
  '#tooltip_content00264':{id:'core-leader',labels:['Leader'],group:'Conditional source references'},
  '#tooltip_content00277':{id:'core-support',labels:['Support'],group:'Conditional source references'},
  '#tooltip_content00128':{id:'core-damaged',labels:['Damaged 4','Damaged 6'],group:'Conditional source references'}
};

export function buildGameplayPresentation(built=buildSpaceMarinesContracts()){
  built={...built,book:prepareSourceProducer(built.book),...(built.facts?{facts:prepareSourceProducer(built.facts)}:{}),...(built.native?{native:{...built.native,model:prepareSourceProducer(built.native.model),payload:prepareSourceProducer(built.native.payload)}}:{})};
  const payload=structuredClone(built.native.payload),before=JSON.stringify(built.book);
  const glossary=prepareSourceProducer(buildGlossary({model:built.book,coreCatalog:createEffectiveCoreCatalog()}));
  payload.cards.push(...glossary.coreCards);payload.factManifest.push(...glossary.coreFactManifest);
  payload.glossary=glossary.index;
  const cards=new Map(payload.cards.map(card=>[card.id,card])),fields={};
  assert.equal(cards.size,payload.cards.length,'Duplicate canonical presentation identity');
  for(const correction of built.book.rosterReviewedScopeCorrections||[]){
    const card=cards.get(correction.entityId||correction.id),field=card.fields.find(field=>field.source?.path==='/scope');
    assert.equal(field?.value,'MODEL');
    field.displayValue='UNIT';field.reviewedSourceCorrection=structuredClone(correction);
  }
  for(const proof of nativeAbilityReview){
    const card=cards.get(proof.id),field=card.fields.find(field=>field.source.path==='/label');
    assert.equal(card.parentId,proof.ownerId);assert.equal(field.value,proof.quote);
    const text=proof.canonicalAbilityId?null:textReferences[proof.sourceTooltip];
    if(text)assert.ok(text.labels.includes(proof.quote),'Changed exact source navigation binding');
    const targetId=proof.canonicalAbilityId||text?.id;assert.ok(cards.has(targetId),'Unresolved native rule reference');
    const group=proof.canonicalAbilityId?'CORE ABILITIES':text.group;
    card.referenceGroupLabel=group;
    fields[field.id]=[{start:0,end:field.value.length,targetId,group,parameters:structuredClone(proof.parameters),
      ...(proof.canonicalAbilityId==='core-feel-no-pain'?{legacyValue:true}:{})}];
  }
  payload.datasheetPresentation.referenceBindings={schema:'army-book-app-v2/datasheet-reference-bindings/v1',fields};
  payload.ruleContractIds=built.artifact.contracts.map(contract=>contract.ruleId);
  payload.rulePresentationLimitations={...payload.rulePresentationLimitations,
    scope:'STAGE_4D_ISOLATED_NATIVE_GAMEPLAY',runtime:'EXISTING_SHARED_PHYSICAL_RUNTIME',
    executableBindings:'PARTIAL_SOURCE_REVIEWED',ruleSemantics:'SEE_LITERAL_CLAUSE_LEDGER',
    battleState:'NOT_SIMULATED',importer:'BOOK_OWNED_CONSTRUCTED_FIXTURES_VERIFIED_REAL_EXPORT_NOT_TESTED',frontend:'NOT_REGISTERED_OR_BROWSER_VERIFIED',
    unitDetectionMetric:'EXPLICIT_UNIT_SCOPE_SUPPORTED_BY_SHARED_EFFECTIVE_GUIDE',
    unresolvedEnhancementScopes:built.artifact.pending.map(row=>row.ruleId)};
  assert.equal(JSON.stringify(built.book),before,'Presentation changed execution/source owner');
  return payload;
}

export function writeGameplayPresentation({check=false}={}){
  const payload=buildGameplayPresentation(),path=new URL('./generated/gameplay-presentation.json',import.meta.url);
  const bytes=serializeSourceJSON(payload);
  if(check)assert.equal(fs.readFileSync(path,'utf8'),bytes,'Stale native gameplay presentation');else fs.writeFileSync(path,bytes);
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const payload=writeGameplayPresentation({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',cards:payload.cards.length,sourceReferences:Object.keys(payload.datasheetPresentation.referenceBindings.fields).length,browser:'NOT_RUN'}));
}
