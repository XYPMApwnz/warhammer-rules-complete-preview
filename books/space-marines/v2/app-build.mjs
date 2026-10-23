/** Native application projection over the existing factual, MFM and gameplay
 * producers. This module owns layout metadata only; no facts or calculations. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {buildSpaceMarinesImportBook} from './roster-import-build.mjs';
import {appendDetachmentReferencePresentation} from './detachment-reference-build.mjs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';

const clone=structuredClone,read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
export function assertSpaceMarinesAppSourceReview(executionBook=buildSpaceMarinesImportBook()){
  const facts=read('./generated/effective.json'),cross=read('./generated/cross-owner-references.json');
  return assertSourceCompletenessGate({review:read('./source-review.json'),books:[
    {bookId:'space-marines',facts,executionBook,sourceReview:captureSourceReview('space-marines',facts)},
    {bookId:'deathwatch',facts:cross,executionBook:null,sourceReview:captureSourceReview('space-marines',cross)}
  ],expectations:[],registeredBookIds:[],checkAllRegistrations:false});
}

export function buildApp(){
  const payload=buildGameplayPresentation(),facts=read('./generated/effective.json');
  const conditional={state:'UNKNOWN',applicability:'CONDITIONAL',roles:[]};
  payload.bookPresentation.coverImage='../assets/space-marines-cover-800.webp';
  // The established related-rule index retains canonical Detachment ownership.
  // UNKNOWN is deliberately not an eligibility or battle-state assertion.
  payload.relatedRules={schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',
    contextPolicy:{roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',
    rows:facts.entities.filter(entity=>entity.kind==='DATASHEET').flatMap(unit=>
      facts.entities.filter(entity=>['ENHANCEMENT','STRATAGEM'].includes(entity.kind)).map(rule=>({
        unitId:unit.id,ruleId:rule.id,kind:rule.kind,detachmentId:rule.parentId,
        ...clone(conditional),selectedDetachment:clone(conditional)})))};
  payload.rulePresentationLimitations={...payload.rulePresentationLimitations,
    scope:'STAGE_5A_NATIVE_APPLICATION_PREVIEW',frontend:'REQUIRES_REAL_MAIN_APPLICATION_ACCEPTANCE',
    sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false,
    unresolvedCompositionMappings:['Dainal Kornelius / Dainal Komelius'],
    importLimitations:[{
      ownerId:'unit-sm-c7226873c51d43c0',bindingKind:'PROFILE',rawLabel:'Dainal Kornelius',
      title:'Wardens of Ultramar: automatic import unavailable',
      message:'Wardens of Ultramar is not currently supported by automatic import. The accepted source uses Dainal Kornelius in the unit composition and Dainal Komelius in the MODEL profile. Their correspondence has not been confirmed by official data. Other supported units can be imported.'
    }],
    mfmReferenceOnly:21,unprovenChapterKeywordBindings:26,
    unsupportedAutomaticMechanics:'books/space-marines/v2/static-gameplay-review.json',
    paidOptions:'EXACT_PHYSICAL_SELECTION_REQUIRED_ELSE_UNRESOLVED',
    deathwatch:'TEXT_ONLY_SOURCE_BACKED_SELECTED_DETACHMENT_REFERENCE'};
  return appendDetachmentReferencePresentation(payload);
}

export function writeApp({check=false}={}){
  const payload=buildApp(),file=new URL('./generated/app-presentation.json',import.meta.url),bytes=JSON.stringify(payload,null,2)+'\n';
  if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale Space Marines app presentation');
  else fs.writeFileSync(file,bytes);
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const payload=writeApp({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',cards:payload.cards.length,groups:payload.groups.map(row=>({id:row.id,count:row.itemIds.length})),
    sourceCompleteness:payload.sourceCompleteness,semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false}));
}
