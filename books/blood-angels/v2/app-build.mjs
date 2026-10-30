import {parseProducerJSON,serializeSourceJSON,prepareSourceProducer,finalizeSourceOutput} from '../../shared/source-refs-v2/producer-io.mjs';
/** Application metadata over the existing native mixed-owner projection. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {buildBloodAngelsRosterBook} from './roster-build.mjs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';
import {appendDetachmentReferencePresentation} from './detachment-reference-build.mjs';
const clone=structuredClone,read=name=>parseProducerJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
export function assertBloodAngelsAppSourceReview(executionBook=buildBloodAngelsRosterBook()){
  const facts=read('./generated/effective.json');
  return assertSourceCompletenessGate({review:read('./app-source-review.json'),books:[
    {bookId:'blood-angels',facts,executionBook,sourceReview:captureSourceReview('blood-angels',facts)}
  ],expectations:[],registeredBookIds:[],checkAllRegistrations:false});
}
export function buildApp(){
  const payload=prepareSourceProducer(buildGameplayPresentation()),conditional={state:'UNKNOWN',applicability:'CONDITIONAL',roles:[]};
  payload.bookPresentation.coverImage='../assets/blood-angels-cover-800.webp';
  // Related cards preserve their source-owned Detachment, never guessed eligibility.
  payload.relatedRules={schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',
    contextPolicy:{roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',
    rows:payload.cards.filter(card=>card.kind==='DATASHEET').flatMap(unit=>
      payload.cards.filter(card=>['ENHANCEMENT','STRATAGEM'].includes(card.kind)).map(rule=>({
        unitId:unit.id,ruleId:rule.id,kind:rule.kind,detachmentId:rule.parentId,
        ...clone(conditional),selectedDetachment:clone(conditional)})))};
  payload.sourceCompleteness=assertBloodAngelsAppSourceReview();
  payload.rulePresentationLimitations={...payload.rulePresentationLimitations,
    scope:'STAGE_4A_NATIVE_MIXED_OWNER_APPLICATION',runtime:'EXISTING_PHYSICAL_IMPORT_AND_TYPED_EFFECTS',
    importer:'NATIVE_CONSTRUCTED_INPUT_VERIFIED',relations:'SOURCE_REVIEWED_NATIVE_PERMISSIONS; REFERENCE_ONLY_INACTIVE',
    sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false,
    mfmReferenceOnly:10,physicalPaidOptions:'EXACT_PHYSICAL_SELECTION_REQUIRED_ELSE_UNRESOLVED',
    unsupportedAutomaticMechanics:'books/blood-angels/v2/rule-clause-review.json',
    frontend:'LOCAL_APPLICATION; REQUIRES_BROWSER_ACCEPTANCE',
    importLimitations:[{
      ownerId:'blood-angels',title:'Source and physical import limitations',
      message:'Two weapon mappings remain NOT_PROVEN: Chainsword / Astartes Chainsword and Bolt Rifle Fire / Focused or Saturation profiles. Ambiguous selections are rejected without replacing the saved roster. An authentic Blood Angels New Recruit export has not been verified.'
    },{
      ownerId:'blood-angels',title:'Gameplay and points limitations',
      message:'Black Rage retains its source OR and unknown positional context. Legacy of the Angel requires BLOOD ANGELS and CHARACTER; general Space Marines units do not gain BLOOD ANGELS automatically. Stormlance remains a source conflict. Ten MFM reference-only relations remain inactive. Unsupported mechanics retain full text; paid equipment requires an exact physical selection, otherwise points are unresolved.'
    }]};
  // Allied source references are reachable from imported occurrences. They do
  // not expand the BA-owned/inherited SM browsing groups or rule assignments.
  return finalizeSourceOutput(appendDetachmentReferencePresentation(payload));
}
export function writeApp({check=false}={}){
  const payload=buildApp(),file=new URL('./generated/app-presentation.json',import.meta.url),bytes=serializeSourceJSON(payload);
  if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale Blood Angels app presentation');else fs.writeFileSync(file,bytes);
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const payload=writeApp({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',cards:payload.cards.length,groups:payload.groups.map(row=>({id:row.id,count:row.itemIds.length})),
    sourceCompleteness:payload.sourceCompleteness,realNewRecruitExportTested:false}));
}
