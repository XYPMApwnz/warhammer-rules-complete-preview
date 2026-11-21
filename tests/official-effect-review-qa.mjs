/** Automation review is mandatory evidence, never an inferred effect update. */
import assert from 'node:assert/strict';
import {applyOfficialUpdates,validateOfficialUpdates} from '../books/shared/official-updates-v1/apply.mjs';
import {assertBookOfficialEffectReviews,collectOfficialEffectReviews} from '../books/shared/official-updates-v1/effect-review.mjs';
import {renderBookUpdateReport} from '../books/shared/tools/book-update-report.mjs';
const source={id:'accepted',document:'accepted.pdf',version:'v2',page:1,authority:'OFFICIAL_GW'};
const entry={id:'text-update',kind:'DETACHMENT_RULE_TEXT',operation:'SET',source,target:{id:'rule',field:['text']},expectedBefore:'Old wording.',after:'New wording.'};
const document={schema:'army-book-official-updates/v1',bookId:'synthetic',stage:'canonical-facts',selection:{collection:['entities'],identity:'id',data:['data']},order:'declared',entries:[entry]};
const clause={id:'roster',sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[{operation:'ADD',field:'W',value:1}],conditions:[]};
const book={bookId:'synthetic',entities:[{id:'rule',data:{text:'Old wording.'},ruleContract:{sourceFields:[['text']],clauses:[clause]}}]};
const original=structuredClone(book);let controls=0;
const reject=(fn,pattern)=>{assert.throws(fn,pattern);controls++;assert.deepEqual(book,original,'Review refusal must preserve every input byte');};
const message=/GW changed a rule with automation: review effects: synthetic · rule/;
reject(()=>applyOfficialUpdates(book,document),message);
reject(()=>assertBookOfficialEffectReviews(book,{document}),message);
for(const effectReview of ['unchanged','updated']){
 const accepted=structuredClone(document);Object.assign(accepted.entries[0],{effectReview,effectReviewNote:'Reviewed the existing +1 W and confirmed the intended implementation.'});
 const applied=applyOfficialUpdates(book,accepted);assert.equal(applied.model.entities[0].data.text,'New wording.');assert.deepEqual(applied.model.entities[0].ruleContract,book.entities[0].ruleContract,'The review flag cannot edit automation');
 assert.equal(assertBookOfficialEffectReviews(applied.model,{document:accepted}).length,1);
 const report=renderBookUpdateReport({books:[{bookId:'synthetic',changes:[],metadataChanges:0}],officialUpdates:applied.applied});
 assert(report.includes(effectReview)&&report.includes(accepted.entries[0].effectReviewNote));
 assert(report.indexOf('## Automation review for GW text updates')<report.indexOf('## synthetic'),'Automation review appears before per-book changes');
}
for(const patch of [{effectReview:'unknown',effectReviewNote:'Review.'},{effectReview:'unchanged'},{effectReviewNote:'No status.'},{effectReview:'updated',effectReviewNote:' '}])
 reject(()=>validateOfficialUpdates({...document,entries:[{...entry,...patch}]}),/effectReview requires/);
for(const contract of [{sourceFields:[['text']],clauses:[{conditions:[{predicate:'LEADING'}]}]},
 {sourceFields:[['text']],clauses:[{semanticEffects:[{operation:'ADD'}]}]},
 {sourceFields:[['text']],clauses:[{rosterClassification:'ROSTER_EXECUTABLE'}]}]){
 const candidate=structuredClone(book);candidate.entities[0].ruleContract=contract;
 reject(()=>assertBookOfficialEffectReviews(candidate,{document}),message);
}
const staticBook=structuredClone(book);staticBook.entities[0].ruleContract={sourceFields:[['text']],clauses:[{rosterClassification:'BATTLE_ONLY',conditions:[],rosterEffects:[]}]};
assert.equal(assertBookOfficialEffectReviews(staticBook,{document}).length,0,'Static text without automation needs no invented review');
const sibling=structuredClone(book);sibling.entities[0].ruleContract.sourceFields=[['blocks',1,'text']];
assert.equal(collectOfficialEffectReviews(sibling,document).length,0,'A sibling field does not own this automation');
const locatorDoc=structuredClone(document);locatorDoc.entries[0].target={sourceLocator:{pointer:['entities',0],identityPath:['id'],identity:'rule'},field:['text']};
reject(()=>assertBookOfficialEffectReviews(book,{document:locatorDoc}),message);
const corpusDoc=structuredClone(document);corpusDoc.stage='source-corpus';corpusDoc.entries[0].target={sourceLocator:{pointer:['source',0,'blocks',0],identityPointer:['source',0],identityPath:['sourceId'],identity:'section'},field:['text']};
const corpusBook=structuredClone(book);corpusBook.entities[0].provenance={sourceId:'section#/blocks/0/text'};
assert.equal(collectOfficialEffectReviews(corpusBook,corpusDoc).length,1,'Exact source-node ownership resolves without a name lookup');
reject(()=>assertBookOfficialEffectReviews(corpusBook,{document:corpusDoc}),message);
const duplicate=structuredClone(book);duplicate.entities.push(structuredClone(duplicate.entities[0]));
reject(()=>assertBookOfficialEffectReviews(duplicate,{document}),/exactly 1, found 2/);
const sourceLocated=structuredClone(book);sourceLocated.entities[0].provenance={sourceId:'accepted-source-rule'};
const sourceLocatorDoc=structuredClone(document);sourceLocatorDoc.entries[0].target={sourceLocator:{pointer:['entities',0],identityPath:['provenance','sourceId'],identity:'accepted-source-rule'},field:['text']};
reject(()=>assertBookOfficialEffectReviews(sourceLocated,{document:sourceLocatorDoc}),message);
const nestedDoc=structuredClone(sourceLocatorDoc);nestedDoc.selection.data=[];nestedDoc.entries[0].target.sourceLocator.pointer.push('data');nestedDoc.entries[0].target.sourceLocator.identityPointer=['entities',0];
reject(()=>assertBookOfficialEffectReviews(sourceLocated,{document:nestedDoc}),message);
console.log(JSON.stringify({status:'PASS',negativeControls:controls,reviewStatuses:['unchanged','updated'],automationImmutable:true,sourceCorpusOwnership:true}));
