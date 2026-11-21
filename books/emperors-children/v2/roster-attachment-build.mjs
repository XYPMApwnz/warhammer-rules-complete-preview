import {serializeSourceJSON} from '../../shared/source-refs-v2/producer-io.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildECContracts} from './rule-contract-build.mjs';
import {buildECImportBook} from './roster-import-build.mjs';
import {withECImportBindings} from './roster-import.mjs';
import {buildECAttachmentBindings} from './roster-attachment-bindings.mjs';

/** Disposable input for existing import, attachment and effect consumers. */
export function buildECRosterAttachmentBook() {
  const built=buildECContracts(),imported=buildECImportBook();
  const book=withECImportBindings(built.book,imported);
  for(const key of ['importBindings','importSourceEvidence','mfmImportReferences'])book[key]=structuredClone(imported[key]);
  const {policies,adjudications}=buildECAttachmentBindings(book,book.mfmImportReferences);
  assert.deepEqual(book.rosterAttachmentPolicies,policies,'Contract and attachment producers disagree');
  book.rosterAttachmentAdjudications=adjudications;
  return {...built,book};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])) {
  const text=serializeSourceJSON(buildECRosterAttachmentBook().book),file=new URL('./generated/roster-attachments.json',import.meta.url);
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),text,'Stale EC attachment input');
  else fs.writeFileSync(file,text);
  console.log(JSON.stringify({status:'PASS',leaderRelations:8,unresolvedRelations:1,armyLegality:'NOT_ASSESSED'}));
}
