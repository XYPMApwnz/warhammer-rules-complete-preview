import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog,validateEffectiveCoreCatalog} from '../content/effective-core-catalog.mjs';
import {loadCoreCurrentOfficial} from '../content/core-current-official.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const contentRoot=path.join(root,'content');
const json=file=>JSON.parse(fs.readFileSync(path.join(contentRoot,file),'utf8'));
const windowValue=(file,key)=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(contentRoot,file),'utf8'),sandbox,{filename:file});return structuredClone(sandbox.window[key]);};
const base=json('core-rules.digital-11e.json');
const identities=json('core-identities.v1.json');
const current=loadCoreCurrentOfficial(contentRoot);
const coreSource=windowValue('core-rules.source.en.js','CORE_PDF_SOURCE');
const catalog=createEffectiveCoreCatalog({root:contentRoot});

assert.equal(catalog.schema,'wh40k-effective-core-catalog/v1');
assert.equal(catalog.mainRules.length,base.records.length,'effective main partition must cover every accepted base rule');
assert.equal(catalog.errata.length,9,'effective errata partition must preserve seven Waha units plus two stronger GW-only identities');
assert.equal(catalog.faqs.length,71,'effective FAQ partition must preserve 66 Waha units plus five stronger GW records');
assert.equal(catalog.universalUpdates.length,current.universalRulesUpdates.length,'effective URU partition must preserve every accepted update identity');
assert.equal(catalog.sourceMappings.length,353,'every effective Waha source unit must have an explicit canonical mapping');
assert.equal(catalog.wahaCorpusFingerprint,'7AD0124845D23DB5CAADEE077732F8BDB6ECD9B2D713E6977F7917BBE0B14D5F');
assert.equal(catalog.records.length,new Set(catalog.records.map(record=>record.id)).size,'effective Core IDs must be unique');
validateEffectiveCoreCatalog(catalog);

const renamed=structuredClone(base);
renamed.records[0].title='Synthetic title that must not establish identity';
renamed.records.at(-1).title='Another synthetic display rename';
const renamedCatalog=createEffectiveCoreCatalog({root:contentRoot,base:renamed});
for(const rule of base.records){
  const lookup=c=>rule.sourceNode?c.getByAnchor(rule.sourceNode.anchor):c.getByCode(rule.code);
  assert.equal(lookup(renamedCatalog).id,lookup(catalog).id,`${rule.code}: title rename changed factual identity`);
}

assert.deepEqual(new Set(Object.keys(identities.rules)),new Set(base.records.filter(record=>!record.sourceNode).map(record=>record.code)),'stored unambiguous Core identities must exactly cover accepted rules');
for(const [code,id] of Object.entries(identities.rules))assert.equal(catalog.getByCode(code)?.id,id,`${code}: stored identity was not authoritative`);
for(const record of catalog.records)for(const target of Object.values(record.relationships||{}).flat().filter(Boolean))assert(catalog.getById(target),`${record.id}: unresolved relationship ${target}`);

assert.deepEqual(new Set(catalog.identityOnly.map(record=>record.code)),new Set(Object.keys(identities.pending)),'identity-only partition differs from accepted pending identities');
for(const record of catalog.identityOnly){
  assert.equal(record.state,'IDENTITY_ONLY');
  assert.equal(record.evidenceStatus,'EVIDENCE_PENDING');
  assert.equal(record.semanticContent,null,`${record.id}: pending identity fabricated semantic content`);
}
const moveUpdate=catalog.getById('uru-2026-08-26-disembark-move-types');
assert.deepEqual(new Set(moveUpdate.relationships.canonicalReferenceIds),new Set([
  'core-rule-18-06-assault-disembark-move','core-rule-18-07-shock-disembark-move'
]),'URU references must resolve to full accepted Waha canonical records');
assert.equal(catalog.identityOnly.length,0,'the certified corpus must not leave Core identities pending');
for(const mapping of catalog.sourceMappings){
  assert(mapping.canonicalIds.length>0,`${mapping.sourceEffectiveId}: source unit has no canonical owner`);
  for(const id of mapping.canonicalIds)assert(catalog.getById(id),`${mapping.sourceEffectiveId}: unknown canonical owner ${id}`);
}
assert.equal(catalog.getByCode('18.07').sourceStructure.text.includes('AFTER MOVING'),true,'known Waha 18.07 anomaly must be preserved verbatim as operational source content');

const duplicateOwnerBase=structuredClone(base);
duplicateOwnerBase.records.find(record=>record.code==='01.02.03').text+='\n'+current.ruleOverrides.find(update=>update.code==='01.02.03').previousLine;
assert.throws(()=>createEffectiveCoreCatalog({root:contentRoot,base:duplicateOwnerBase}),/(?:Duplicate official semantic owner|Ambiguous or missing official override anchor)/,'duplicated base/current semantics must fail closed');

const mainMutation=structuredClone(base);
mainMutation.records.find(record=>record.code==='02.01').text+='\nSYNTHETIC MAIN PROPAGATION';
assert.match(createEffectiveCoreCatalog({root:contentRoot,base:mainMutation}).getByCode('02.01').semanticContent,/SYNTHETIC MAIN PROPAGATION/);

const overrideMutation=structuredClone(current);
overrideMutation.ruleOverrides.find(update=>update.code==='01.02.03').currentLine+=' SYNTHETIC OVERRIDE PROPAGATION';
assert.match(createEffectiveCoreCatalog({root:contentRoot,currentOfficial:overrideMutation}).getByCode('01.02.03').semanticContent,/SYNTHETIC OVERRIDE PROPAGATION/);

const faqMutation=structuredClone(coreSource);
faqMutation.faqs[0].answer+=' SYNTHETIC FAQ PROPAGATION';
assert.match(createEffectiveCoreCatalog({root:contentRoot,coreSource:faqMutation}).getById(faqMutation.faqs[0].id).semanticContent,/SYNTHETIC FAQ PROPAGATION/);

const uruMutation=structuredClone(current);
uruMutation.universalRulesUpdates[0].text+=' SYNTHETIC URU PROPAGATION';
assert.match(createEffectiveCoreCatalog({root:contentRoot,currentOfficial:uruMutation}).getById(uruMutation.universalRulesUpdates[0].id).semanticContent,/SYNTHETIC URU PROPAGATION/);

const factualSnapshot=value=>JSON.stringify({records:value.records,aliases:value.aliases,asOf:value.asOf});
assert.equal(factualSnapshot(createEffectiveCoreCatalog({root:contentRoot})),factualSnapshot(createEffectiveCoreCatalog({root:contentRoot})),'effective Core rebuild must be deterministic');

for(const file of ['effective-core-catalog.mjs','core-fact-projection.mjs']){
  const source=fs.readFileSync(path.join(contentRoot,file),'utf8');
  assert(!source.includes('glossary/registry')&&!source.includes('reader.html'),`${file}: generated presentation input became a Core factual dependency`);
}

console.log(`Effective Core catalog QA passed: ${catalog.records.length} normalized records, ${catalog.identityOnly.length} identity-only pending stubs, stable title-independent IDs and resolved relationships.`);
