import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {consumeMfm} from './mfm-boundary.mjs';
import {buildECImportBindings} from './roster-import-bindings.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url)));
export function buildECImportBook(facts=read('./generated/effective.json')) {
  const original=JSON.stringify(facts),book=structuredClone(facts),mfm=consumeMfm(facts.entities);
  const source=new URL('../sources/bsdata-emperors-children-11e.json',import.meta.url),bytes=fs.readFileSync(source);
  book.importSourceEvidence={document:'books/emperors-children/sources/bsdata-emperors-children-11e.json',
    sha256:createHash('sha256').update(bytes).digest('hex').toUpperCase(),purpose:'Export names only; accepted V2 records remain factual authority'};
  for(const e of book.entities)if(e.kind==='MODEL_PROFILE')e.kind='PROFILE';
  const contracts=read('./generated/rule-contracts.json');
  book.entities.push(...structuredClone(contracts.selectionOptions));
  book.importBindings=buildECImportBindings(book,JSON.parse(bytes),contracts);
  book.rosterEquipmentCaptionBindings=book.importBindings.equipmentSelections;
  book.rosterEquipmentRestrictions=structuredClone(contracts.equipmentRestrictions);
  book.mfmImportReferences=mfm; // Central IDs/provenance only, never copied costs/schedules.
  assert.equal(JSON.stringify(facts),original);assert.ok(book.entities.every(e=>!e.ruleContract));
  return book;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])){
  const file=new URL('./generated/roster-import.json',import.meta.url),text=JSON.stringify(buildECImportBook(),null,2)+'\n';
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),text,'Stale EC import input');else fs.writeFileSync(file,text);
  console.log(JSON.stringify({status:'PASS',datasheets:23,detachments:10,enhancements:34,importOnly:true}));
}
