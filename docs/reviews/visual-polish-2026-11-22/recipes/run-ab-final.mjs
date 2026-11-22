import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const out='E:/Warhammer/qa-evidence/visual-polish-v1-2026-11-22';
const recipe='E:/Warhammer/qa-evidence/card-polish-2-v1-2026-11-14/RECIPES/capture-native.mjs';
const root='E:/Warhammer/worktrees/visual-polish-v1',sha='9e04d5d43240795979d0257a27ba4c35cd2259f6';
assert(!fs.existsSync(out+'/ab/final-head'));
const p=spawnSync(process.execPath,[recipe,'--root='+root,'--out='+out+'/ab/final-head'],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,QA_TMP_ROOT:'E:/Warhammer/qa-tmp/visual-polish/ab-final-tmp'}});
fs.writeFileSync(out+'/ab/final-head.log',(p.stdout||'')+(p.stderr||''));assert.equal(p.status,0,'Final A/B capture failed');
const before=JSON.parse(fs.readFileSync(out+'/ab/base/MANIFEST.json')),after=JSON.parse(fs.readFileSync(out+'/ab/final-head/MANIFEST.json'));
assert.equal(before.sha,'f5d73d531edbea8f8c919265477404c9b1b0eec4');assert.equal(after.sha,sha);assert.equal(after.status,'PASS');assert.equal(before.fixtureSha256,after.fixtureSha256);
assert.deepEqual(after.counts,{cases:199,ready:177,needsBindings:22,other:0,frames:507});
const books=[];
for(const book of before.books){const peer=after.books.find(row=>row.bookId===book.bookId);assert(peer);const a=fs.readFileSync(out+'/ab/base/'+book.file),b=fs.readFileSync(out+'/ab/final-head/'+peer.file);assert(a.equals(b),book.bookId+' native observation difference');books.push({book:book.bookId,cases:book.cases,bytes:a.length,sha256:book.sha256,status:'BYTE_IDENTICAL'});}
const result={status:'PASS',base:before.sha,head:after.sha,counts:after.counts,fixtureSha256:before.fixtureSha256,baseline:'Fresh complete f5d73d53 capture retained from this task, same immutable accepted SHA',masking:'NONE; full native import, snapshot, projection, effective, related and points bytes',differences:0,books};
fs.writeFileSync(out+'/ab/FINAL_RESULTS.json',JSON.stringify(result,null,2)+'\n');console.log('Final SHA A/B PASS: 199 rosters / 507 states, zero differences, no masking.');
