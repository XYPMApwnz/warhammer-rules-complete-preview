import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog,validateEffectiveCoreCatalog,retainCoreFaqAliases} from '../content/effective-core-catalog.mjs';
import {recordText} from '../content/record-content.mjs';
import {faqPresentationIdentity} from '../../shared/canonical-content-v2/effective-content.mjs';

const coreRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=file=>JSON.parse(fs.readFileSync(path.join(coreRoot,file),'utf8'));
const corpus=readJson('sources/waha-core-2026-11-11/waha-core-corpus.v1.json');
const base=readJson('content/core-rules.digital-11e.json');
const identities=readJson('content/core-identities.v1.json');
const sourceIdentities=readJson('sources/waha-core-2026-11-11/source-identities.v1.json');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(coreRoot,'content/core-rules.source.en.js'),'utf8'),sandbox);
const officialFaqs=sandbox.window.CORE_PDF_SOURCE.faqs;
const sourceUnits=corpus.pages.flatMap(page=>[...page.numbered,...page.faqs,...page.errata]);
const source=id=>{const unit=sourceUnits.find(unit=>unit.id===id);assert(unit,`missing accepted source ${id}`);return unit;};
// Whitespace, bullet markers and typographic variants have no factual significance.
// Keep words, numbers, references and punctuation so this cannot collapse distinct answers.
const normalize=value=>String(value??'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/•/g,'').replace(/\s+/g,'').toLowerCase();
const faqPair=unit=>({question:unit.content.tables.find(row=>row[0]==='Q:')[1],answer:unit.content.tables.find(row=>row[0]==='A:')[1]});
const faqIdentities=new Map(sourceIdentities.faqs.map(row=>[row.sourceId,row.canonicalId]));
const acceptedFaqs=[...corpus.pages.flatMap(page=>page.faqs).map(unit=>({id:faqIdentities.get(unit.id),...faqPair(unit)})),...officialFaqs];
const groups=new Map();
for(const faq of acceptedFaqs){const key=normalize(faq.question)+'|'+normalize(faq.answer);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(faq);}
// The refreshed snapshot separates panels before formatting. Keep this guard
// non-vacuous by deriving every embedded pair from captured source ownership.
const rawNumberedOccurrences=corpus.pages.flatMap(page=>page.numbered.flatMap(unit=>unit.occurrences));
const containsPair=(text,pair)=>normalize(text).includes(normalize(pair.question))&&normalize(text).includes(normalize(pair.answer));
const embeddedGroups=[...groups.values()].filter(group=>rawNumberedOccurrences.some(occurrence=>containsPair(occurrence.content.text,group[0])));
assert.equal(embeddedGroups.length,51,'independent accepted FAQ/main census changed; review source evidence');
assert.equal([...groups.values()].filter(group=>base.records.some(record=>containsPair(recordText(record),group[0]))).length,0,'digital snapshot must separate every FAQ panel before formatting');

const catalog=createEffectiveCoreCatalog();
const rule=code=>{const record=catalog.getByCode(code);assert(record,`missing rule ${code}`);return record;};
const faq=number=>catalog.getById(`core-faq-waha-${String(number).padStart(3,'0')}`);
assert.equal(catalog.records.length,385,'source-node split must preserve all identities and recover the lost definition');
assert.deepEqual(new Set(catalog.mainRules.map(record=>record.id)),new Set([...Object.values(identities.rules),...Object.values(identities.sourceNodes).map(entry=>entry.id)]));
assert.deepEqual(new Set(catalog.faqs.map(record=>record.id)),new Set([...Array.from({length:73},(_,index)=>`core-faq-waha-${String(index+1).padStart(3,'0')}`),...officialFaqs.map(record=>record.id)]));

const ongoingExpected=source('waha-core-erratum-001').content.text.replace(/^Change to:/,'');
assert(normalize(rule('12.08').semanticContent).includes(normalize(ongoingExpected)),'Ongoing Consolidation must include the complete enrolled erratum');
const objective=source('waha-core-rule-12-08').occurrences[0].content.lists.at(-1).items.at(-1);
assert(normalize(rule('12.08').semanticContent).includes(normalize(objective)),'Objective Consolidation lost its accepted unengaged prerequisite');
const emergencyExpected=source('waha-core-erratum-006').content;
// The accepted formatter numbers alternative rows; retain all source wording,
// punctuation and gameplay values while ignoring only that OR row marker.
const emergencyPresentation=value=>normalize(String(value).replace(/\bOR:\s*\(\d+\)/g,'Or:'));
for(const list of emergencyExpected.lists)for(const item of list.items)assert(emergencyPresentation(rule('18.05').semanticContent).includes(emergencyPresentation(item)),'Emergency Disembark lost a source-backed fallback/list item');
assert(rule('18.05').semanticContent.includes('Each model that still cannot be set up is destroyed.'),'Emergency Disembark must use the corrected final destruction condition');
for(const [code,id] of [['12.08','core-waha-errata-12-08'],['18.05','core-waha-errata-18-05'],['01.02.06','core-waha-errata-01-02-06']])assert(rule(code).relationships.errataIds.includes(id)&&catalog.getById(id)?.recordType==='ERRATA',`${code}: effective application dropped inspectable erratum identity`);

for(const [number,owner] of [[51,'core-rule-19-01-forming-attached-units'],[56,'core-lone-operative'],[61,'core-anti'],[62,'core-heavy']])assert.equal(faq(number).relationships.primaryRuleId,owner,`FAQ${number} wrong canonical owner`);
const multiRelated=new Map([
  [57,['core-rule-06-03-hazard-rolls','core-hazardous','core-rule-06-02-mortal-wounds']],
  [58,['core-scouts','core-scout-move']],
  [59,['core-feel-no-pain','core-rule-05-04-inflict-damage']],
  [60,['core-deadly-demise','core-rule-05-04-05-fight-on-death']]
]);
for(const [number,related] of multiRelated){
  const record=faq(number);
  assert(!record.relationships.primaryRuleId&&!record.primaryRule,`FAQ${number} invented a unique primary`);
  for(const id of related)assert(record.relationships.relatedRuleIds.includes(id),`FAQ${number} lost related rule ${id}`);
}
for(const record of catalog.faqs){
  const secondary=record.id.startsWith('core-faq-waha-');
  assert.equal(record.provenance.sourceClass,secondary?'ACCEPTED_OPERATIONAL_SECONDARY':'GW_CORE_FAQ');
  assert.equal(record.provenance.sourceId,secondary?'waha-core-corpus-2026-11-11':'gw-core-launch-faq-2026-06-01');
  assert.equal(record.provenance.authorityLevel,secondary?'OPERATIONAL_CONTENT_BASELINE':'GLOBAL_OFFICIAL');
  if(secondary)assert(!/page 88/.test(record.provenance.sourceLocator??''),'secondary FAQ falsely claims official page 88');
  else assert.equal(record.provenance.sourceLocator,'Rules Appendix; page 88');
}
for(const record of catalog.mainRules)for(const group of embeddedGroups){
  const pair=group[0],text=normalize(record.semanticContent);
  assert(!(text.includes(normalize(pair.question))&&text.includes(normalize(pair.answer))),`${record.id}: canonical FAQ payload remains embedded in effective MAIN_RULE`);
}
const splitting=rule('01.02.06');
assert(!/\bErrata\b\s*(?:Show\s*)?\bAdd:/i.test(splitting.semanticContent),'Splitting Units still embeds applied Errata/Add panel');
const splitPayload=source('waha-appendix-erratum-001').content.text.replace(/^Add:/,'');
assert.equal(normalize(splitting.semanticContent).split(normalize(splitPayload)).length-1,1,'Splitting Units effective clause must occur exactly once');
assert.equal(rule('18.04.01').relationships.parentRuleId,rule('18.04').id,'Rapid Disembark parent/child identity changed');
assert.notEqual(rule('18.04').id,rule('18.04.01').id);
assert.deepEqual(rule('25.03').content,base.records.find(record=>record.code==='25.03').content,'Battle Size canonical table values/structure changed');

const distinct=catalog.mainRules.filter(record=>record.sourceCode==='09.07.01');
assert.equal(distinct.length,2);
assert.equal(catalog.getByCode('09.07.01'),null,'ambiguous source citation must not choose a canonical owner');
for(const occurrence of source('waha-core-rule-09-07-01').occurrences){
  const record=catalog.getByAnchor(occurrence.stableDomId);
  assert.equal(record.state,'FULL_CONTENT');
  assert.equal(record.provenance.sourceNode.sourceOrder,occurrence.sourceOrder);
  assert.equal(record.provenance.sourceNode.contentHash,occurrence.content.contentHash);
}
const mutateCatalog=mutate=>{const records=structuredClone(catalog.records);const byId=new Map(records.map(record=>[record.id,record]));const copy={...catalog,records,mainRules:catalog.mainRules.map(record=>byId.get(record.id)),faqs:catalog.faqs.map(record=>byId.get(record.id)),errata:catalog.errata.map(record=>byId.get(record.id))};mutate(copy,byId);return copy;};
assert.throws(()=>validateEffectiveCoreCatalog(mutateCatalog((copy,byId)=>{byId.get(distinct[0].id).semanticContent=distinct[1].semanticContent;})),/source-node ownership/i,'substituting another occurrence payload must fail');
assert.throws(()=>validateEffectiveCoreCatalog(mutateCatalog((copy,byId)=>{byId.get(distinct[0].id).provenance.sourceNode=structuredClone(distinct[1].sourceNode);})),/source-node ownership/i,'cross-contaminating occurrence provenance must fail');
assert.throws(()=>validateEffectiveCoreCatalog(mutateCatalog((copy,byId)=>{byId.get(faq(57).id).relationships.primaryRuleId='core-hazardous';})),/primary|owner|binding/i,'invented primary FAQ owner must fail');
assert.throws(()=>validateEffectiveCoreCatalog(mutateCatalog((copy,byId)=>{byId.get(faq(56).id).provenance.sourceClass='GW_CORE_FAQ';})),/provenance|source.*class|source.*binding/i,'secondary provenance cannot masquerade as official');

// Canonical aliases of an identical Q/A retain their accepted source contexts
// after panels move out of the digital snapshot. This does not grant a new
// primary or related rule to either FAQ identity.
const historical=readJson('sources/core-importer-baselines/7b15dc36.v1.json');
const oldFaqs=new Map(historical.view.records.filter(record=>record.recordType==='FAQ_CLARIFICATION').map(record=>[record.id,record]));
const currentFaqs=new Map(catalog.faqs.map(record=>[record.id,record]));
const aliasGroup=id=>catalog.faqs.filter(record=>faqPresentationIdentity(record)===faqPresentationIdentity(currentFaqs.get(id))).map(record=>record.id);
const associations=historical.view.records.filter(record=>record.recordType==='MAIN_RULE').flatMap(owner=>(owner.relationships.faqIds||[]).filter(id=>aliasGroup(id).length>1).map(id=>({ownerId:owner.id,faqId:id})));
const verifyAliases=records=>{
  const byId=new Map(records.map(record=>[record.id,record]));
  for(const {ownerId,faqId} of associations){
    assert.equal(faqPresentationIdentity(oldFaqs.get(faqId)),faqPresentationIdentity(currentFaqs.get(faqId)),'accepted old FAQ wording changed');
    assert(byId.get(ownerId).relationships.faqIds.includes(faqId),`${ownerId}: lost accepted identical-Q/A alias ${faqId}`);
    const sourceFaq=acceptedFaqs.find(record=>record.id===faqId);
    assert(sourceFaq&&faqPresentationIdentity(sourceFaq)===faqPresentationIdentity(currentFaqs.get(faqId)),`${faqId}: restored alias lacks a fresh captured Q/A witness`);
  }
};
verifyAliases(catalog.mainRules);
const missingAlias=structuredClone(catalog.mainRules),example=associations[0];
missingAlias.find(record=>record.id===example.ownerId).relationships.faqIds=missingAlias.find(record=>record.id===example.ownerId).relationships.faqIds.filter(id=>id!==example.faqId);
assert.throws(()=>verifyAliases(missingAlias),/lost accepted identical-Q\/A alias/,'dropping an accepted alias association must fail');
const syntheticOwners=[{id:'owner',relationships:{faqIds:['first']}}];
const syntheticFaqs=[{id:'first',question:'Which model?',answer:'Only this model.'},{id:'alias',question:'Which model?',answer:'Only this model.'}];
const syntheticDeclarations=[{ownerId:'owner',faqId:'alias',existingGroupWitnessId:'first',sourceUnitId:'captured-faq',sourceContentHash:'captured-hash'}];
const syntheticContext={historicalRecords:[{id:'owner',relationships:{faqIds:['first','alias']}},syntheticFaqs[1]],sourceUnits:new Map([['captured-faq',{contentHash:'captured-hash',content:{tables:[['Q:','Which model?'],['A:','Only this model.']]}}]])};
assert.deepEqual(retainCoreFaqAliases(syntheticOwners,syntheticFaqs,syntheticDeclarations,syntheticContext)[0].relationships.faqIds,['first','alias']);
assert.deepEqual(syntheticOwners[0].relationships.faqIds,['first'],'alias retention mutated its input');
const otherAnswer=structuredClone(syntheticFaqs);otherAnswer[1].answer='Every model in the unit.';
assert.throws(()=>retainCoreFaqAliases(syntheticOwners,otherAnswer,syntheticDeclarations,syntheticContext),/Invalid historical FAQ appearance/,'a different answer must not acquire the existing source context');
for(const mutate of [
  declarations=>{declarations[0].ownerId='invented-owner';},
  declarations=>{declarations[0].faqId='first';},
  declarations=>{declarations[0].sourceContentHash='changed-source';}
]){
  const declarations=structuredClone(syntheticDeclarations);mutate(declarations);
  const context={...syntheticContext,historicalRecords:syntheticContext.historicalRecords.map(record=>record.id==='owner'?{...record,relationships:{faqIds:['alias']}}:record)};
  assert.throws(()=>retainCoreFaqAliases(syntheticOwners,syntheticFaqs,declarations,context),/Invalid historical FAQ appearance/,'an invented owner, non-historical appearance or changed source must fail');
}

console.log(JSON.stringify({status:'PASS',canonicalRecords:catalog.records.length,faqIdentities:catalog.faqs.length,normalizedEmbeddedFaqGroups:embeddedGroups.length,secondaryFaqs:73,officialFaqs:5,distinctSourceNodes:distinct.length,retainedDuplicateFaqContexts:associations.length,explicitRestoredAppearances:catalog.contentBindings.faqAppearanceRetentions.length,negativeControls:9}));
