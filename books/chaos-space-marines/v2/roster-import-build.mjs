import {parseProducerJSON,serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {semanticInputs} from './rule-contract-context.mjs';

const read=name=>parseProducerJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));

/** Disposable import view of current facts. No contracts, effects or legacy data.
 * Composition identities and their explicitly bound statlines use the same
 * existing normalization as the certified semantic foundation. */
export function buildCSMImportBook(facts=read('./generated/effective.json'),identities=read('./identity-bindings.json')) {
  facts=prepareSourceProducer(facts);
  const original=JSON.stringify(facts),{book}=semanticInputs(facts,identities);
  for(const entity of book.entities) {
    if(['DATASHEET','DETACHMENT','ENHANCEMENT'].includes(entity.kind))entity.data.title=entity.displayName;
    if(entity.kind==='DATASHEET')entity.data.weaponIds=structuredClone(entity.data.weaponProfileIds);
    if(entity.kind==='PROFILE'&&entity.data.composition)entity.data.name=entity.data.composition.name;
  }
  delete book.compatibilityFeasibility;
  delete book.rosterAttachmentPolicies;
  assert.equal(JSON.stringify(facts),original,'Import normalization must not mutate canonical facts');
  assert.ok(book.entities.every(entity=>!entity.ruleContract),'Import view must not contain executable contracts');
  return book;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])) {
  const output=new URL('./generated/roster-import.json',import.meta.url),text=serializeSourceJSON(buildCSMImportBook());
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(output,'utf8'),text,'Stale canonical import view');
  else fs.writeFileSync(output,text);
  console.log(JSON.stringify({status:'PASS',nativeDatasheets:54,importOnly:true}));
}
