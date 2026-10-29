/** Reproducible migration inventory and immutable-baseline parity checks. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {validateBookRecipients,compileBookRecipients} from '../../books/shared/rule-contract-v2/recipients.mjs';
import {producerDetachmentTextDeclaration} from '../../books/shared/roster-v2/conditional-policy.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const base='aa79193e7a458ad77c32b986c2fe9e84f26bd26f';
const artifacts={
 'adeptus-mechanicus':'roster-runtime','blood-angels':'roster-import',
 'chaos-space-marines':'roster-runtime','dark-angels':'roster-import',
 'death-guard':'rule-contract-effective','emperors-children':'roster-attachments',
 'space-marines':'roster-import','tau-empire':'roster-import','tyranids':'roster-runtime'
};
const stratagem=entity=>entity.kind==='STRATAGEM'||entity.ruleContract?.kind==='STRATAGEM';
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const legacyKeys=new Set(['effectRecipientRoleIds','recipientRoleId','recipientRoleIds','targetBinding','targetSubject','unitScope','recipientSelectors','containingUnitScope','recipientScope','recipientKeywords','aura','roleIds']);
const legacyPaths=(value,prefix='')=>!value||typeof value!=='object'?[]:Object.entries(value).flatMap(([key,child])=>{
 const pointer=prefix+'/'+key.replaceAll('~','~0').replaceAll('/','~1');
 return [...(legacyKeys.has(key)?[pointer]:[]),...legacyPaths(child,pointer)];
});
const facts=book=>{const result=structuredClone(book);for(const entity of result.entities)delete entity.ruleContract;return result;};
const books=[];
for(const [bookId,artifact]of Object.entries(artifacts)){
 const file=`books/${bookId}/v2/generated/${artifact}.json`;
 const bytes=fs.readFileSync(path.join(root,file)),book=JSON.parse(bytes);
 const before=JSON.parse(execFileSync('git',['show',`${base}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}));
 const presentation=`books/${bookId}/v2/generated/app-presentation.json`;
 const originalPresentation=execFileSync('git',['show',`${base}:${presentation}`],{cwd:root,maxBuffer:64*1024*1024});
 assert.ok(fs.readFileSync(path.join(root,presentation)).equals(originalPresentation),bookId+': canonical card presentation bytes changed');
 assert.equal(book.bookId,bookId);
 validateBookRecipients(book);
 const translated=JSON.parse(JSON.stringify(compileBookRecipients(before,{f1Declaration:producerDetachmentTextDeclaration})));
 assert.deepEqual(book,translated,bookId+': regenerated contracts differ from exact baseline translation');
 assert.deepEqual(facts(book),facts(before),bookId+': non-contract facts or metadata changed');
 const oldIndex=new Map(before.entities.map(entity=>[entity.id,entity]));
 const counts={RECORDED:0,NOT_RECORDED:0,NOT_APPLICABLE:0};
 const notRecorded=[],descriptors=[],stratagems=[],stratagemLegacyAddresses=[];
 for(const entity of book.entities){
  if(stratagem(entity)){
   assert.equal(JSON.stringify(entity),JSON.stringify(oldIndex.get(entity.id)),bookId+': excluded Stratagem changed '+entity.id);
   stratagems.push(entity.id);
   const fields=legacyPaths(entity.ruleContract);
   if(fields.length)stratagemLegacyAddresses.push({entityId:entity.id,fields:fields.sort(cmp)});
   continue;
  }
  for(const clause of entity.ruleContract?.clauses||[]){
   counts[clause.recipientStatus]++;
   if(clause.recipientStatus==='NOT_RECORDED')notRecorded.push({entityId:entity.id,clauseId:clause.id,sourceId:entity.ruleContract.sourceId});
   for(const recipient of clause.recipients)descriptors.push({entityId:entity.id,clauseId:clause.id,recipientId:recipient.id});
  }
 }
 notRecorded.sort((a,b)=>cmp(a.entityId,b.entityId)||cmp(a.clauseId,b.clauseId));
 descriptors.sort((a,b)=>cmp(a.entityId,b.entityId)||cmp(a.clauseId,b.clauseId)||cmp(a.recipientId,b.recipientId));
 books.push({bookId,input:file,sha256:createHash('sha256').update(bytes).digest('hex'),counts,descriptorCount:descriptors.length,
  stratagemCount:stratagems.length,preservedStratagemIds:stratagems.sort(cmp),stratagemLegacyAddresses:stratagemLegacyAddresses.sort((a,b)=>cmp(a.entityId,b.entityId)),notRecorded,descriptors,
  contractTranslationParity:'PASS',nonContractFactsParity:'PASS',stratagemSerializationParity:'PASS',presentationBytesParity:'PASS'});
}
const report={schema:'recipient-translation-1/v1',base,excludedBooks:['orks'],excludedEntityKinds:['STRATAGEM'],
 terminology:'Descriptor counts are encoding channels, not distinct physical models or additional effects.',
 scope:'Existing clauses only. No new clause or recipient is inferred for an uncontracted textual rule.',
 legacyReads:{
  stratagemCompatibility:'compatibility-feasibility.mjs retains effectRecipientRoleIds for STRATAGEM only.',
  sourceDeclarations:'Producer-only compiler and declaration validators read accepted existing input encodings. They do not provide a runtime fallback.',
  validationViews:'recipientDeclarationView produces a temporary inverse for source evidence guards; no old recipient fields are serialized into migrated canonical clauses.',
  executionViews:'resolveExecutionEffect derives temporary operation arguments from recipientId. Physical execution and provenance fields retain their original meaning.'
 },books};
const output=path.join(root,'docs/audit/recipient-translation-1.json'),text=JSON.stringify(report,null,2)+'\n';
assert.ok(['--write','--check'].includes(process.argv[2]),'Use --write or --check');
if(process.argv[2]==='--write')fs.writeFileSync(output,text,'utf8');else assert.equal(fs.readFileSync(output,'utf8'),text,'Stale recipient translation report');
console.log(JSON.stringify({status:'PASS',books:books.map(({bookId,counts,descriptorCount,stratagemCount})=>({bookId,counts,descriptorCount,stratagemCount})),
 unchangedStratagems:books.reduce((n,book)=>n+book.stratagemCount,0),nonContractFactsParity:'PASS'}));
