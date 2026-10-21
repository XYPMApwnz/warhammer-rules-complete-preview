/** Application metadata over the existing native mixed-owner projection. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {buildDarkAngelsImportBook} from './roster-import-build.mjs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';
const clone=structuredClone,read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
export function assertDarkAngelsAppSourceReview(executionBook=buildDarkAngelsImportBook()){
  const facts=read('./generated/effective.json');
  return assertSourceCompletenessGate({review:read('./app-source-review.json'),books:[
    {bookId:'dark-angels',facts,executionBook,sourceReview:captureSourceReview('dark-angels',facts)}
  ],expectations:[],registeredBookIds:[],checkAllRegistrations:false});
}
export function buildApp(){
  const payload=buildGameplayPresentation(),conditional={state:'UNKNOWN',applicability:'CONDITIONAL',roles:[]};
  payload.bookPresentation.coverImage='../assets/dark-angels-cover-800.webp';
  // Related cards preserve their source-owned Detachment, never guessed eligibility.
  payload.relatedRules={schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',
    contextPolicy:{roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',
    rows:payload.cards.filter(card=>card.kind==='DATASHEET').flatMap(unit=>
      payload.cards.filter(card=>['ENHANCEMENT','STRATAGEM'].includes(card.kind)).map(rule=>({
        unitId:unit.id,ruleId:rule.id,kind:rule.kind,detachmentId:rule.parentId,
        ...clone(conditional),selectedDetachment:clone(conditional)})))};
  payload.sourceCompleteness=assertDarkAngelsAppSourceReview();
  payload.rulePresentationLimitations={...payload.rulePresentationLimitations,
    scope:'STAGE_4A_NATIVE_MIXED_OWNER_APPLICATION',runtime:'EXISTING_PHYSICAL_IMPORT_AND_TYPED_EFFECTS',
    importer:'NATIVE_CONSTRUCTED_INPUT_VERIFIED',relations:'SOURCE_REVIEWED_NATIVE_PERMISSIONS; LAZARUS_SOURCE_CONFLICT_INACTIVE',
    sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN',realNewRecruitExportTested:false,
    mfmReferenceOnly:10,physicalPaidOptions:'EXACT_PHYSICAL_SELECTION_REQUIRED_ELSE_UNRESOLVED',
    unsupportedAutomaticMechanics:'books/dark-angels/v2/rule-clause-review.json',
    frontend:'LOCAL_APPLICATION; REQUIRES_BROWSER_ACCEPTANCE',
    importLimitations:[{
      ownerId:'dark-angels',title:'Chapter context and keyword grants',
      message:'A roster containing only general Space Marines units has unconfirmed Dark Angels army context. DEATHWING and RAVENWING grants remain inactive until a source-confirmed Dark Angels unit and validated roster membership establish that context. Opening this book, a Detachment or an attachment does not establish Chapter context.'
    },{
      ownerId:'unit-da-efa93d33ea414d8b8f11',title:'Source and import limitations',
      message:'Lazarus Leader recipients remain a source conflict and the disputed attachments are unavailable. Ten MFM reference-only relations remain inactive. This importer has constructed-input coverage; an authentic Dark Angels New Recruit export has not been verified.'
    }]};
  return payload;
}
export function writeApp({check=false}={}){
  const payload=buildApp(),file=new URL('./generated/app-presentation.json',import.meta.url),bytes=JSON.stringify(payload,null,2)+'\n';
  if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale Dark Angels app presentation');else fs.writeFileSync(file,bytes);
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const payload=writeApp({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',cards:payload.cards.length,groups:payload.groups.map(row=>({id:row.id,count:row.itemIds.length})),
    sourceCompleteness:payload.sourceCompleteness,realNewRecruitExportTested:false}));
}
