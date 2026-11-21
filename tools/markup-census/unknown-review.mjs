/** The owner's exact 171-entry annotation review; never a gameplay producer. */
import {createHash} from 'node:crypto';
import {OWNER_ONLY_REASON,reviewedPresentationScope} from './owner-only.mjs';

export const UNKNOWN_REVIEW_SOURCE='f8694aefa39e996b9a3d4e0e14072b62b8c3e9e1:docs/reviews/markup-unknown-2026-11-21/PROPOSALS.json';
export const UNKNOWN_APPROVAL_FINGERPRINT='62a06e9993572596f3385baef5445705091ce26f6f30d1aaa2a66cef2ffe2375';
const fields=['book','id','name','sourceEntityId','kind','sourceFields','sourceFingerprint','bindingFingerprint','clauseIds','category','reason','presentationScope','physicalOwner','sourceQuote','basis','principleConflict','conflictNote','mixed','mixedNote','nextStep'];
const header=['schema','base','authority','decisionDate','sourceReview','records'];
const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const key=row=>row.book+'\0'+row.id;
const demand=(condition,code,row,message)=>{if(!condition)throw new TypeError('Markup census '+code+': '+(row?.book||'registry')+' · '+(row?.id||'-')+': '+message);};

/** Stable ordered semantic pin, independent of Git checkout depth or JSON keys. */
export function unknownApprovalFingerprint(records){
 return createHash('sha256').update(JSON.stringify(records.map(record=>fields.map(field=>record[field])))).digest('hex');
}

export function validateUnknownReview(review){
 demand(exact(review,header)&&review.schema==='markup-unknown-review/v1'&&review.authority==='owner'&&
  review.base==='6f2e5fb23643fc0041efcd7006f3e150bd5ce4be'&&review.decisionDate==='2026-11-21'&&
  review.sourceReview===UNKNOWN_REVIEW_SOURCE&&Array.isArray(review.records),'UNKNOWN_REVIEW_SCHEMA',null,'the exact owner-reviewed source is required');
 const records=new Map();
 for(const record of review.records){
  demand(exact(record,fields)&&['book','id','name','sourceEntityId','kind','reason','physicalOwner','sourceQuote','basis'].every(field=>nonempty(record[field]))&&
   ['TEXT_ONLY_INTENDED','UNKNOWN'].includes(record.category)&&digest(record.sourceFingerprint)&&digest(record.bindingFingerprint)&&
   Array.isArray(record.sourceFields)&&record.sourceFields.length&&record.sourceFields.every(field=>Array.isArray(field)&&field.length&&field.every(part=>nonempty(part)||Number.isSafeInteger(part)&&part>=0))&&
   Array.isArray(record.clauseIds)&&record.clauseIds.every(nonempty)&&new Set(record.clauseIds).size===record.clauseIds.length&&
   typeof record.principleConflict==='boolean'&&typeof record.mixed==='boolean'&&['conflictNote','mixedNote','nextStep'].every(field=>typeof record[field]==='string'),
  'UNKNOWN_REVIEW_SCHEMA',record,'invalid named decision or source evidence');
  demand(!records.has(key(record)),'DUPLICATE_ID',record,'duplicate approved review occurrence');records.set(key(record),record);
  demand(record.reason===OWNER_ONLY_REASON?record.category==='TEXT_ONLY_INTENDED'&&record.presentationScope===reviewedPresentationScope(record.kind):record.presentationScope===null,
   'UNKNOWN_REVIEW_SCOPE',record,'retain the approved physical owner or army/process scope');
  demand(record.category!=='UNKNOWN'||nonempty(record.nextStep),'UNKNOWN_NEXT_STEP',record,'named unresolved debt needs its approved next step');
 }
 demand(unknownApprovalFingerprint(review.records)===UNKNOWN_APPROVAL_FINGERPRINT,'UNKNOWN_REVIEW_CHANGED',null,
  'approved identities, sources, categories, scope, reasons and next steps cannot be silently repinned');
 return records;
}

/** Supplemental next steps do not rewrite the immutable historical debt rows. */
export function checkUnknownReview({review,registry,debt}){
 const reviewed=validateUnknownReview(review),decisions=new Map(registry.records.map(row=>[key(row),row])),active=new Map(debt.records.map(row=>[key(row),row]));
 const nextSteps=[];
 for(const [identity,record] of reviewed){
  const decision=decisions.get(identity);
  demand(decision&&['category','reason','sourceEntityId','kind','sourceFields','sourceFingerprint'].every(field=>same(record[field],decision[field]))&&
   record.presentationScope===(decision.presentationScope??null)&&same(record.clauseIds,decision.proof?.clauseIds)&&record.bindingFingerprint===decision.proof?.bindingFingerprint,
   'UNKNOWN_REVIEW_MISMATCH',record,'current decision must match this exact approved source and binding');
  if(record.category==='UNKNOWN'){
   const historical=active.get(identity);
   demand(historical?.category==='UNKNOWN'&&historical.sourceFingerprint===record.sourceFingerprint,'UNKNOWN_DEBT_MISMATCH',record,'approved unresolved source must remain exact named active debt');
   nextSteps.push({book:record.book,id:record.id,name:record.name,sourceFingerprint:record.sourceFingerprint,
    nextStep:record.nextStep,historicalNextStep:historical.nextStep,review:review.sourceReview});
  }else demand(!active.has(identity),'UNKNOWN_DEBT_MISMATCH',record,'approved closure must not remain active debt');
 }
 demand(active.size===nextSteps.length,'UNKNOWN_DEBT_MISMATCH',null,'every remaining debt entry requires the reviewed named next step');
 return {reviewed:reviewed.size,closed:reviewed.size-nextSteps.length,remaining:nextSteps.length,nextSteps};
}

/** New evidence schema only; old owner-only and recipient adapters stay exact. */
export function unknownReviewEvidence(review,{evidence,row,canonicalId}){
 const record=validateUnknownReview(review).get(key(row));
 return Boolean(record)&&evidence.identity===row.id&&record.category==='TEXT_ONLY_INTENDED'&&row.category===record.category&&
  record.reason===row.reason&&record.sourceEntityId===canonicalId&&record.kind===row.kind&&
  record.sourceFingerprint===row.sourceFingerprint&&record.bindingFingerprint===row.bindingFingerprint&&
  record.presentationScope===(row.presentationScope??null)&&same(record.sourceFields,row.sourceFields)&&same(record.clauseIds,row.clauseIds);
}
