import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog,validateEffectiveCoreCatalog} from '../content/effective-core-catalog.mjs';
import {recordText} from '../content/record-content.mjs';

const coreRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=file=>JSON.parse(fs.readFileSync(path.join(coreRoot,file),'utf8'));
const corpus=readJson('sources/waha-core-2026-09-25/waha-core-corpus.v1.json');
const base=readJson('content/core-rules.digital-11e.json');
const identities=readJson('content/core-identities.v1.json');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(coreRoot,'content/core-rules.source.en.js'),'utf8'),sandbox);
const officialFaqs=sandbox.window.CORE_PDF_SOURCE.faqs;
const sourceUnits=corpus.pages.flatMap(page=>[...page.numbered,...page.faqs,...page.errata]);
const source=id=>{const unit=sourceUnits.find(unit=>unit.id===id);assert(unit,`missing accepted source ${id}`);return unit;};
// Whitespace, bullet markers and typographic variants have no factual significance.
// Keep words, numbers, references and punctuation so this cannot collapse distinct answers.
const normalize=value=>String(value??'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/•/g,'').replace(/\s+/g,'').toLowerCase();
const faqPair=unit=>({question:unit.content.tables.find(row=>row[0]==='Q:')[1],answer:unit.content.tables.find(row=>row[0]==='A:')[1]});
const acceptedFaqs=[...corpus.pages.flatMap(page=>page.faqs).map(unit=>({id:unit.id.replace('waha-core-faq-','core-faq-waha-'),...faqPair(unit)})),...officialFaqs];
const groups=new Map();
for(const faq of acceptedFaqs){const key=normalize(faq.question)+'|'+normalize(faq.answer);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(faq);}
const embeddedGroups=[...groups.values()].filter(group=>base.records.some(record=>normalize(recordText(record)).includes(normalize(group[0].question))&&normalize(recordText(record)).includes(normalize(group[0].answer))));
assert.equal(embeddedGroups.length,40,'independent accepted FAQ/main census changed; review source evidence');

const catalog=createEffectiveCoreCatalog();
const rule=code=>{const record=catalog.getByCode(code);assert(record,`missing rule ${code}`);return record;};
const faq=number=>catalog.getById(`core-faq-waha-${String(number).padStart(3,'0')}`);
assert.equal(catalog.records.length,370,'cleanup must preserve every canonical identity');
assert.deepEqual(new Set(catalog.mainRules.map(record=>record.id)),new Set(Object.values(identities.rules)));
assert.deepEqual(new Set(catalog.faqs.map(record=>record.id)),new Set([...Array.from({length:66},(_,index)=>`core-faq-waha-${String(index+1).padStart(3,'0')}`),...officialFaqs.map(record=>record.id)]));

const ongoingExpected=source('waha-core-erratum-001').content.text.replace(/^Change to:/,'');
assert(normalize(rule('12.08').semanticContent).includes(normalize(ongoingExpected)),'Ongoing Consolidation must include the complete enrolled erratum');
const objective=source('waha-core-rule-12-08').occurrences[0].content.lists.at(-1).items.at(-1);
assert(normalize(rule('12.08').semanticContent).includes(normalize(objective)),'Objective Consolidation lost its accepted unengaged prerequisite');
const emergencyExpected=source('waha-core-erratum-006').content;
for(const list of emergencyExpected.lists)for(const item of list.items)assert(normalize(rule('18.05').semanticContent).includes(normalize(item)),'Emergency Disembark lost a source-backed fallback/list item');
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
  assert.equal(record.provenance.sourceId,secondary?'waha-core-corpus-2026-09-25':'gw-core-launch-faq-2026-06-01');
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

const conflict=rule('09.07.01');
assert.equal(conflict.state,'SOURCE_CONFLICT');
assert.equal(conflict.semanticContent,null,'unresolved conflict must not publish either occurrence as effective fact');
assert.equal(conflict.sourceConflict.status,'UNRESOLVED_ACCEPTED_SOURCE_CONFLICT');
const serialized=JSON.stringify(conflict.sourceConflict);
for(const occurrence of source('waha-core-rule-09-07-01').occurrences){
  assert(serialized.includes(occurrence.content.contentHash),`conflict dropped occurrence ${occurrence.sourceOrder} hash`);
  assert(conflict.sourceConflict.occurrences.some(item=>item.sourceOrder===occurrence.sourceOrder),`conflict dropped occurrence ${occurrence.sourceOrder} identity`);
}
const mutateCatalog=mutate=>{const records=structuredClone(catalog.records);const byId=new Map(records.map(record=>[record.id,record]));const copy={...catalog,records,mainRules:catalog.mainRules.map(record=>byId.get(record.id)),faqs:catalog.faqs.map(record=>byId.get(record.id)),errata:catalog.errata.map(record=>byId.get(record.id))};mutate(copy,byId);return copy;};
assert.throws(()=>validateEffectiveCoreCatalog(mutateCatalog((copy,byId)=>{const record=byId.get(conflict.id);record.state='FULL_CONTENT';record.semanticContent=source('waha-core-rule-09-07-01').occurrences[1].content.text;})),/conflict|adjudicat/i,'silent occurrence selection must fail without registered evidence');
assert.throws(()=>validateEffectiveCoreCatalog(mutateCatalog((copy,byId)=>{delete byId.get(conflict.id).sourceConflict;})),/conflict/i,'dropping conflict metadata must fail closed');
assert.throws(()=>validateEffectiveCoreCatalog(mutateCatalog((copy,byId)=>{byId.get(faq(57).id).relationships.primaryRuleId='core-hazardous';})),/primary|owner|binding/i,'invented primary FAQ owner must fail');
assert.throws(()=>validateEffectiveCoreCatalog(mutateCatalog((copy,byId)=>{byId.get(faq(56).id).provenance.sourceClass='GW_CORE_FAQ';})),/provenance|source.*class|source.*binding/i,'secondary provenance cannot masquerade as official');

console.log(JSON.stringify({status:'PASS',canonicalRecords:catalog.records.length,faqIdentities:catalog.faqs.length,normalizedEmbeddedFaqGroups:embeddedGroups.length,secondaryFaqs:66,officialFaqs:5,sourceConflict:conflict.sourceConflict.status,negativeControls:4}));
