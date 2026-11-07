import {buildUnboundBookRelatedRules} from '../../shared/rule-contract-v2/book-related.mjs';
import {createSpaceMarinesRuleSchema} from './rule-contract-schema.mjs';
import {parseProducerJSON,serializeSourceJSON,prepareSourceProducer,finalizeSourceOutput} from '../../shared/source-refs-v2/producer-io.mjs';
/** Native application projection over the existing factual, MFM and gameplay
 * producers. This module owns layout metadata only; no facts or calculations. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {buildSpaceMarinesImportBook} from './roster-import-build.mjs';
import {appendDetachmentReferencePresentation} from './detachment-reference-build.mjs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';

const clone=structuredClone,read=name=>parseProducerJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
export function assertSpaceMarinesAppSourceReview(executionBook=buildSpaceMarinesImportBook()){
  const facts=read('./generated/effective.json'),cross=read('./generated/cross-owner-references.json');
  return assertSourceCompletenessGate({review:read('./source-review.json'),books:[
    {bookId:'space-marines',facts,executionBook,sourceReview:captureSourceReview('space-marines',facts)},
    {bookId:'deathwatch',facts:cross,executionBook:null,sourceReview:captureSourceReview('space-marines',cross)}
  ],expectations:[],registeredBookIds:[],checkAllRegistrations:false});
}

export function buildApp(){
  const payload=prepareSourceProducer(buildGameplayPresentation()),facts=read('./generated/effective.json');
  payload.bookPresentation.coverImage='../assets/space-marines-cover-800.webp';
  // The established related-rule index retains canonical Detachment ownership.
  // UNKNOWN is deliberately not an eligibility or battle-state assertion.
  payload.relatedRules=buildUnboundBookRelatedRules(buildSpaceMarinesImportBook(),createSpaceMarinesRuleSchema(),{
    unitIds:payload.cards.filter(card=>card.kind==='DATASHEET').map(card=>card.id),
    ruleIds:payload.cards.filter(card=>['ENHANCEMENT','STRATAGEM'].includes(card.kind)).map(card=>card.id)});
  payload.rulePresentationLimitations={...payload.rulePresentationLimitations,
    scope:'STAGE_5A_NATIVE_APPLICATION_PREVIEW',frontend:'REQUIRES_REAL_MAIN_APPLICATION_ACCEPTANCE',
    sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false,
    unresolvedCompositionMappings:[],
    importLimitations:[],
    mfmReferenceOnly:21,unprovenChapterKeywordBindings:26,
    unsupportedAutomaticMechanics:'books/space-marines/v2/static-gameplay-review.json',
    paidOptions:'EXACT_PHYSICAL_SELECTION_REQUIRED_ELSE_UNRESOLVED',
    deathwatch:'TEXT_ONLY_SOURCE_BACKED_SELECTED_DETACHMENT_REFERENCE'};
  return finalizeSourceOutput(appendDetachmentReferencePresentation(payload));
}

export function writeApp({check=false}={}){
  const payload=buildApp(),file=new URL('./generated/app-presentation.json',import.meta.url),bytes=serializeSourceJSON(payload);
  if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale Space Marines app presentation');
  else fs.writeFileSync(file,bytes);
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const payload=writeApp({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',cards:payload.cards.length,groups:payload.groups.map(row=>({id:row.id,count:row.itemIds.length})),
    sourceCompleteness:payload.sourceCompleteness,semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false}));
}
