import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildCSMRosterEffectBook} from './roster-effect-build.mjs';
import {buildCSMImportBook} from './roster-import-build.mjs';
import {buildCSMAttachmentInputs} from './roster-attachment-build.mjs';

/** Disposable execution input. Reuses the completed declarations and current
 * native import/attachment identities; it owns no new facts or semantics. */
export function buildCSMRosterRuntimeBook() {
  const book=buildCSMRosterEffectBook(),canonical=buildCSMImportBook();
  const bindings=JSON.parse(fs.readFileSync(new URL('./roster-attachment-bindings.json',import.meta.url),'utf8'));
  const attachments=buildCSMAttachmentInputs(canonical,bindings);
  book.rosterAttachmentPolicies=attachments.policies;
  book.rosterAttachmentConstraints=attachments.book.rosterAttachmentConstraints;
  book.rosterProfileBindings=attachments.book.rosterProfileBindings;
  return book;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])) {
  const book=buildCSMRosterRuntimeBook(),output=new URL('./generated/roster-runtime.json',import.meta.url),text=JSON.stringify(book,null,2)+'\n';
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(output,'utf8'),text,'Stale CSM roster runtime input');
  else fs.writeFileSync(output,text);
  console.log(JSON.stringify({status:'PASS',declarations:book.rosterEffectCensus.lowered.length,
    deferred:book.rosterEffectCensus.deferred.length,attachmentPairs:book.rosterAttachmentPolicies.length,newPrimitives:0}));
}
