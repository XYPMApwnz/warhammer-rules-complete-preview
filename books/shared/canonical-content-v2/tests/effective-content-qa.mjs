import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {applySourceBoundEdits,normalizeFaqOwnership,validateFaqOwnership,separateEmbeddedFaqPanels,separateAppliedErrataPanels,faqPresentationIdentity,applySourceConflicts,validateSourceConflicts,sourceConflictNotice} from '../effective-content.mjs';

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const base=[{id:'rule-a',text:'Target must be available.',provenance:{},relationships:{}},{id:'rule-child',text:'Separate child clause.',provenance:{},relationships:{parentRuleId:'rule-a'}}];
const patch={id:'change-a',semanticContent:'Target must be available and unengaged.',provenance:{sourceContentHash:'change-hash'},relationships:{targetRuleId:'rule-a'}};
const edit={targetRuleId:'rule-a',targetPath:'/text',previousHash:hash(base[0].text),operation:'REPLACE_VALUE',source:{recordId:patch.id,contentHash:'change-hash',path:'/semanticContent'}};
const edited=applySourceBoundEdits(base,[edit],{sourceRecords:new Map([[patch.id,patch]]),sourceUnits:new Map()});
assert.equal(edited[0].text,patch.semanticContent);
assert.equal(base[0].text,'Target must be available.','effective edits mutate accepted base');
assert.equal(edited[0].provenance.effectiveSourceBindings[0].before,base[0].text);
assert.equal(edited[0].provenance.effectiveSourceBindings[0].sourceRecordId,patch.id);
assert.equal(edited[1].relationships.parentRuleId,'rule-a','source edit collapsed parent-child records');
assert.throws(()=>applySourceBoundEdits(base,[{...edit,previousHash:'wrong'}],{sourceRecords:new Map([[patch.id,patch]]),sourceUnits:new Map()}),/anchor/i);
assert.throws(()=>applySourceBoundEdits(base,[{...edit,source:{...edit.source,contentHash:'stale'}}],{sourceRecords:new Map([[patch.id,patch]]),sourceUnits:new Map()}),/source binding/i);

const makeFaq=(id,question,answer)=>({id,question,answer,provenance:{sourceUnitId:`source-${id}`,sourceContentHash:`hash-${id}`},relationships:{primaryRuleId:'unproven-owner',relatedRuleIds:[]}});
const faqInputs=[makeFaq('faq-zero','Can this happen?','It depends.'),makeFaq('faq-one','Must this happen?','Yes.'),makeFaq('faq-many','Which rules interact?','Both rules apply.')];
const bindings=[
  {faqId:'faq-zero',sourceContentHash:'hash-faq-zero',relatedRuleIds:[],evidence:['accepted standalone FAQ']},
  {faqId:'faq-one',sourceContentHash:'hash-faq-one',primaryRuleId:'rule-a',relatedRuleIds:['rule-a'],evidence:['accepted unique source owner']},
  {faqId:'faq-many',sourceContentHash:'hash-faq-many',relatedRuleIds:['rule-a','rule-child'],evidence:['accepted two related rules, no primary']}
];
const faqs=normalizeFaqOwnership(faqInputs,bindings);validateFaqOwnership(faqs,bindings);
assert.equal(faqs[0].relationships.primaryRuleId,undefined);assert.deepEqual(faqs[0].relationships.relatedRuleIds,[]);
assert.equal(faqs[1].relationships.primaryRuleId,'rule-a');
assert.equal(faqs[2].relationships.primaryRuleId,undefined);assert.deepEqual(faqs[2].relationships.relatedRuleIds,['rule-a','rule-child']);
assert.equal(faqInputs[0].relationships.primaryRuleId,'unproven-owner','normalization mutated factual input');
const fakePrimary=structuredClone(faqs);fakePrimary[2].relationships.primaryRuleId='rule-a';
assert.throws(()=>validateFaqOwnership(fakePrimary,bindings),/ownership|primary/i);
assert.throws(()=>normalizeFaqOwnership(faqInputs,[{...bindings[0],sourceContentHash:'wrong'}]),/evidence/i);
assert.notEqual(faqPresentationIdentity(faqs[0]),faqPresentationIdentity({...faqs[0],answer:'No.'}),'different answers conflated');
assert.equal(faqPresentationIdentity(faqs[0]),faqPresentationIdentity({...faqs[0],id:'other-source',question:'Can  this happen?'}),'formatting aliases not normalized');
const alias={...faqs[0],id:'faq-second-occurrence'};
const separated=separateEmbeddedFaqPanels([{...base[0],text:'Main condition.\nFAQ\nShow\nQ:Can this happen?\nA:It depends.'}],[faqs[0],alias]);
assert.equal(separated[0].text,'Main condition.');
assert.deepEqual(new Set(separated[0].relationships.faqIds),new Set(['faq-zero','faq-second-occurrence']),'dedup lost source occurrence identity');
const adjacent=separateEmbeddedFaqPanels([{...base[0],text:'Main condition.FAQ\nShow\nQ:Can this happen?\nA:It depends.'}],faqs);
assert.equal(adjacent[0].text,'Main condition.','FAQ marker adjacent to source prose remains duplicated');
assert.throws(()=>separateEmbeddedFaqPanels([{...base[0],text:'Main condition.\nFAQ\nQ:Unenrolled?\nA:Unknown.'}],faqs),/Unbound/i,'unowned FAQ payload silently deleted');
const applied=separateAppliedErrataPanels([{...base[0],text:patch.semanticContent+'\nErrata\n'+patch.semanticContent}],[patch]);
assert.equal(applied[0].text,patch.semanticContent);assert.deepEqual(applied[0].relationships.errataIds,[patch.id]);
const notApplied={...base[0],text:base[0].text+'\nErrata\n'+patch.semanticContent};
assert.equal(separateAppliedErrataPanels([notApplied],[patch])[0].text,notApplied.text,'unapplied source change silently removed');

const unit={id:'source-conflict',code:'77.01',occurrences:[
  {sourceOrder:9,title:'First Version',content:{text:'First Version77.01 Choose one.',contentHash:'version-one',lists:[]}},
  {sourceOrder:10,title:'Second Version',content:{text:'Second Version77.01 Choose two.',contentHash:'version-two',lists:[]}}
]};
const conflictBinding={targetRuleId:'rule-a',occurrences:unit.occurrences.map(occurrence=>({sourceUnitId:unit.id,sourceOrder:occurrence.sourceOrder,contentHash:occurrence.content.contentHash}))};
const context={sourceUnits:new Map([[unit.id,unit]])};
const conflicts=applySourceConflicts(base,[conflictBinding],context);validateSourceConflicts(conflicts,[conflictBinding],context);
assert.equal(conflicts[0].semanticContent,null);assert.equal(conflicts[0].state,'SOURCE_CONFLICT');
assert.equal(conflicts[0].sourceConflict.occurrences.length,2);assert.match(sourceConflictNotice(conflicts[0]),/No version has been established as current/);
assert.equal(conflicts[1].relationships.parentRuleId,'rule-a','conflict collapsed separate child identity');
const selected=structuredClone(conflicts);selected[0].state='FULL_CONTENT';selected[0].semanticContent='Choose two.';
assert.throws(()=>validateSourceConflicts(selected,[conflictBinding],context),/silently adjudicated/i);
const dropped=structuredClone(conflicts);dropped[0].sourceConflict.occurrences.pop();
assert.throws(()=>validateSourceConflicts(dropped,[conflictBinding],context),/variants changed/i);
assert.throws(()=>applySourceConflicts(base,[conflictBinding],{...context,adjudications:[{targetRuleId:'rule-a'}]}),/explicitly updated accepted binding/i,'unregistered adjudication silently resolved a conflict');

console.log('Shared effective content QA passed without Core or army factual imports: source-bound changes, FAQ zero/one/many relationships, panel deduplication, parent-child preservation, explicit unresolved conflicts and fail-closed mutations.');
