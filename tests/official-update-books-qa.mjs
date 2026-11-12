/** Every public book routes one strict official-update document through its passport. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BOOK_PASSPORT_IDS} from '../books/shared/tools/book-passport.mjs';
import {readOfficialUpdates} from '../books/shared/official-updates-v1/book.mjs';
import {OFFICIAL_SCHEMA,validateOfficialUpdates} from '../books/shared/official-updates-v1/apply.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2);
for(const arg of args)assert(arg.startsWith('--book='),'Unknown option: '+arg);
const requested=args.map(arg=>arg.slice('--book='.length));
for(const id of requested)assert(BOOK_PASSPORT_IDS.includes(id),'Unknown book: '+id);
assert.equal(new Set(requested).size,requested.length,'Duplicate --book selection');
const ids=requested.length?requested:BOOK_PASSPORT_IDS;
if(!requested.length)assert.equal(ids.length,9,'All nine public books must be covered');
const results=[];
for(const bookId of ids){
  const configFile=path.join(root,'books',bookId,'book.config.json');
  const configBytes=fs.readFileSync(configFile);
  const {document,passport,file}=readOfficialUpdates(bookId,{root});
  assert.equal(document.schema,OFFICIAL_SCHEMA,bookId+': no legacy format fallback');
  assert.equal(document.bookId,bookId,bookId+': official document belongs to another book');
  assert.equal(document.stage,passport.official.stage,bookId+': application stage differs from passport');
  assert.equal(file,passport.official.input,bookId+': input did not come from passport');
  assert(file.startsWith(`books/${bookId}/`),bookId+': official input must be book-owned');
  assert(passport.sources.inputs.some(input=>input.path===file),bookId+': official input is not declared among source inputs');
  const inputFile=path.join(root,file),inputBytes=fs.readFileSync(inputFile);
  const pristine=structuredClone(document);
  const seed=document.entries[0]||{
    id:'synthetic-empty-book-schema-control',
    source:{id:'synthetic-gw',document:`books/${bookId}/synthetic-source.pdf`,version:'v0',page:1,authority:'OFFICIAL_GW'},
    target:{id:'synthetic-stable-rule',field:['text']},kind:'ABILITY_TEXT',operation:'SET',expectedBefore:'before',after:'after'
  };
  let controls=0;
  const reject=(label,mutate,detail,{documentLevel=false}={})=>{
    const poisoned=structuredClone(document);
    if(!poisoned.entries.length)poisoned.entries.push(structuredClone(seed));
    mutate(poisoned);
    const owner=documentLevel?'document':poisoned.entries[0].id;
    assert.throws(()=>validateOfficialUpdates(poisoned,{bookId,stage:passport.official.stage}),error=>{
      assert(error instanceof Error,bookId+': '+label+' did not produce an Error');
      assert(error.message.includes(`Official update ${bookId} · ${owner}:`),bookId+': '+label+' lacks exact book/update owner: '+error.message);
      assert(detail.test(error.message),bookId+': '+label+' wrong diagnostic: '+error.message);
      return true;
    },bookId+': '+label+' mutation survived');
    controls++;
  };
  reject('unknown kind',d=>{d.entries[0].kind='UNKNOWN_GW_KIND';},/unknown kind UNKNOWN_GW_KIND/);
  reject('unknown field',d=>{d.entries[0].target.field=['unknownGwField'];},/unknown field unknownGwField/);
  reject('missing before',d=>{d.entries[0].operation='SET';delete d.entries[0].expectedBefore;},/expectedBefore is required/);
  reject('unknown schema',d=>{d.schema='unknown-official-format/v0';},/schema or owner mismatch/,{documentLevel:true});
  reject('wrong passport stage',d=>{d.stage=passport.official.stage==='canonical-facts'?'source-corpus':'canonical-facts';},/stage does not match the book passport/,{documentLevel:true});
  assert.deepEqual(document,pristine,bookId+': schema controls changed accepted declarations');
  assert(fs.readFileSync(configFile).equals(configBytes),bookId+': validation changed the passport file');
  assert(fs.readFileSync(inputFile).equals(inputBytes),bookId+': validation changed official input bytes');
  results.push({bookId,input:file,stage:document.stage,entries:document.entries.length,negativeControls:controls});
}
console.log(JSON.stringify({status:'PASS',books:results.length,negativeControls:results.reduce((sum,row)=>sum+row.negativeControls,0),results}));
