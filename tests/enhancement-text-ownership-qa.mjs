import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../books/shared/tools/build-army-book.mjs';
import {validateEffectiveBookModel} from '../books/shared/tools/effective-book-model.mjs';
import {projectEffectiveEnhancementSources} from '../glossary/tools/effective-enhancement-sources.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
const models=new Map(),contexts=new Map();
for(const id of books){
  const context=createCanonicalBuildContext({args:['--check'],configPath:path.join(root,'books',id,'book.config.json'),repo:root});
  const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
  validateEffectiveBookModel(model);models.set(id,model);contexts.set(id,context);
}
assert.equal([...models.values()].reduce((sum,model)=>sum+model.enhancements.length,0),474,'all-nine canonical Enhancement inventory');
for(const [id,model] of models)for(const enhancement of model.enhancements)assert.ok(enhancement.text?.trim(),`${id}: ${enhancement.id} canonical gameplay text owner`);

const exactIds=item=>[item.id,item.ruleId,item.sourceId,item.legacyKey,...(item.canonicalEffectRecordIds||[])].filter(Boolean);
for(const [id,model] of models){
  if(!model.rosterCatalog)continue;
  for(const record of model.rosterCatalog.enhancements){
    const matches=model.enhancements.filter(item=>item.detachmentId===record.detachmentId&&exactIds(item).some(value=>exactIds(record).includes(value)));
    assert.equal(matches.length,1,`${id}: ${record.detachmentId}/${record.id} roster Enhancement identity`);
    assert.equal(record.text,matches[0].text,`${id}: ${record.detachmentId}/${record.id} roster text derives from canonical owner`);
  }
}

const tau=models.get('tau-empire'),strike=tau.enhancements.find(item=>item.id==='enhancement-strike-swiftly');
assert.ok(strike?.text.includes('6"'),'T’au Strike Swiftly accepted 6-inch canonical text');
const tauRoster=tau.rosterCatalog.enhancements.find(item=>item.detachmentId===strike.detachmentId&&exactIds(strike).some(id=>exactIds(item).includes(id)));
assert.ok(tauRoster,'T’au Strike Swiftly roster projection');
const tauRosterPoison=structuredClone(tau);tauRosterPoison.rosterCatalog.enhancements.find(item=>item.detachmentId===tauRoster.detachmentId&&item.id===tauRoster.id).text='The bearer grants a fake 99-inch Scout move.';
assert.throws(()=>validateEffectiveBookModel(tauRosterPoison),/conflicting roster Enhancement gameplay text/,'T’au nested roster text poison must fail closed');
const tauCanonicalDirection=structuredClone(tau),canonicalMarker='T’AU_CANONICAL_ENHANCEMENT_TEXT_DIRECTION';
tauCanonicalDirection.enhancements.find(item=>item.detachmentId===strike.detachmentId&&item.id===strike.id).text=canonicalMarker;
tauCanonicalDirection.rosterCatalog.enhancements.find(item=>item.detachmentId===tauRoster.detachmentId&&item.id===tauRoster.id).text=canonicalMarker;
validateEffectiveBookModel(tauCanonicalDirection);

const tauSourceContext=createCanonicalBuildContext({args:['--check'],configPath:path.join(root,'books/tau-empire/book.config.json'),repo:root}),readTauJson=tauSourceContext.readJson;
tauSourceContext.readJson=file=>{const data=readTauJson(file);if(!String(file).endsWith('tau-empire-codex-parity.en.json'))return data;const clone=structuredClone(data),source=clone.detachments.flatMap(item=>item.enhancements||[]).find(item=>item.id==='enhancement-strike-swiftly');assert.ok(source,'T’au canonical source direction fixture');source.text=canonicalMarker;return clone;};
const {effectiveBookModel:tauSourceDirection}=await buildCanonicalBook(tauSourceContext,{projectionOnly:true}),sourceDirectionCanonical=tauSourceDirection.enhancements.find(item=>item.id===strike.id),sourceDirectionRoster=tauSourceDirection.rosterCatalog.enhancements.find(item=>item.id===tauRoster.id&&item.detachmentId===tauRoster.detachmentId);
assert.equal(sourceDirectionCanonical.text,canonicalMarker,'T’au canonical model did not follow its source-backed text owner');
assert.equal(sourceDirectionRoster.text,canonicalMarker,'T’au roster projection did not derive source-backed canonical text');

const unknownRoster=structuredClone(tau);unknownRoster.rosterCatalog.enhancements[0].id='enhancement-unknown-text-owner';unknownRoster.rosterCatalog.enhancements[0].ruleId='enhancement-unknown-text-owner';
assert.throws(()=>validateEffectiveBookModel(unknownRoster),/has no canonical identity/,'unknown roster Enhancement identity must fail');
const wrongScope=structuredClone(tau);wrongScope.rosterCatalog.enhancements.find(item=>item.id===tauRoster.id).detachmentId='wrong-detachment';
assert.throws(()=>validateEffectiveBookModel(wrongScope),/has no canonical identity/,'wrong roster Enhancement Detachment scope must fail');
const duplicateCanonical=structuredClone(tau);duplicateCanonical.enhancements.push(structuredClone(duplicateCanonical.enhancements[0]));
assert.throws(()=>validateEffectiveBookModel(duplicateCanonical),/duplicate .*Enhancement identity/,'duplicate scoped canonical Enhancement must fail');
const substituted=structuredClone(tau);const substituteIndex=substituted.rosterCatalog.enhancements.findIndex(item=>item.id===tauRoster.id);substituted.rosterCatalog.enhancements[substituteIndex]={...structuredClone(substituted.rosterCatalog.enhancements[(substituteIndex+1)%substituted.rosterCatalog.enhancements.length]),detachmentId:tauRoster.detachmentId};
assert.throws(()=>validateEffectiveBookModel(substituted),/(duplicate roster Enhancement identity|has no canonical identity)/,'count-preserving roster Enhancement substitution must fail');

const am=models.get('adeptus-mechanicus'),amExplorator=am.enhancements.find(item=>item.id==='enhancement-explorator-dispensation');
assert.ok(amExplorator,'AM Explorator Dispensation canonical owner');
const amNested=am.detachments.find(item=>item.id===amExplorator.detachmentId).enhancements.find(item=>item.id===amExplorator.id);
assert.equal(Object.hasOwn(amNested,'text'),false,'AM nested Enhancement is an identity reference, not a text owner');
const amNestedPoison=structuredClone(am);amNestedPoison.detachments.find(item=>item.id===amExplorator.detachmentId).enhancements.find(item=>item.id===amExplorator.id).text='AM_NESTED_GLOSSARY_TEXT_POISON';
const poisonProjection=projectEffectiveEnhancementSources(amNestedPoison,{label:'AM glossary poison control'}),projectedPoison=poisonProjection.find(item=>item.id===amExplorator.detachmentId).enhancements.find(item=>item.id===amExplorator.id);
assert.equal(projectedPoison.text,amExplorator.text,'AM nested glossary text poison influenced canonical projection');
const amCanonicalDirection=structuredClone(am),amMarker='AM_CANONICAL_ENHANCEMENT_TEXT_DIRECTION';amCanonicalDirection.enhancements.find(item=>item.id===amExplorator.id&&item.detachmentId===amExplorator.detachmentId).text=amMarker;
const canonicalProjection=projectEffectiveEnhancementSources(amCanonicalDirection,{label:'AM canonical direction'}),projectedCanonical=canonicalProjection.find(item=>item.id===amExplorator.detachmentId).enhancements.find(item=>item.id===amExplorator.id);
assert.equal(projectedCanonical.text,amMarker,'AM glossary projection did not follow canonical owner');
for(const detachment of projectEffectiveEnhancementSources(am,{label:'AM reader/glossary equality'}))for(const item of detachment.enhancements)assert.equal(item.text,am.enhancements.find(record=>record.id===item.id&&record.detachmentId===detachment.id).text,`AM ${item.id}: reader/glossary text equality`);
const unknownAm=structuredClone(am);unknownAm.detachments[0].enhancements[0].id='enhancement-unknown-am-glossary';assert.throws(()=>projectEffectiveEnhancementSources(unknownAm),/must resolve exactly once/);
const duplicateAm=structuredClone(am);duplicateAm.enhancements.push(structuredClone(duplicateAm.enhancements[0]));assert.throws(()=>projectEffectiveEnhancementSources(duplicateAm),/must resolve exactly once/);

console.log('Enhancement text ownership QA: PASS (474 canonical owners; T’au roster and AM glossary poisons isolated; canonical consumers follow scoped source text; identity/scope/substitution mutations fail closed).');
