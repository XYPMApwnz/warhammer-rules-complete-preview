import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const out='E:/Warhammer/qa-evidence/visual-polish-v1-2026-11-22',recipe='E:/Warhammer/qa-evidence/card-polish-2-v1-2026-11-14/RECIPES/capture-native.mjs';
const sides=[['base','E:/Warhammer/worktrees/release-ci-fix-v1','f5d73d531edbea8f8c919265477404c9b1b0eec4'],['head','E:/Warhammer/worktrees/visual-polish-v1','a0ad3a4de80f3af327bea4ed6dd298048add1e42']];
fs.mkdirSync(out+'/ab',{recursive:true});fs.copyFileSync(recipe,out+'/ab/capture-native.mjs');
for(const [side,root,sha] of sides){const start=Date.now(),p=spawnSync(process.execPath,[recipe,'--root='+root,'--out='+out+'/ab/'+side],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,QA_TMP_ROOT:'E:/Warhammer/qa-tmp/visual-polish/ab-tmp'}});
 fs.writeFileSync(out+'/ab/'+side+'.log',(p.stdout||'')+(p.stderr||''));if(p.status!==0){console.log((p.stderr||p.stdout||'').slice(-5000));throw Error('A/B '+side+' failed');}
 const m=JSON.parse(fs.readFileSync(out+'/ab/'+side+'/MANIFEST.json'));assert.equal(m.sha,sha);assert.equal(m.status,'PASS');assert.deepEqual(m.counts,{cases:199,ready:177,needsBindings:22,other:0,frames:507});console.log(JSON.stringify({side,status:'PASS',elapsedMs:Date.now()-start,counts:m.counts}));
}
const read=side=>JSON.parse(fs.readFileSync(out+'/ab/'+side+'/MANIFEST.json'));
const before=read('base'),after=read('head');assert.equal(before.fixtureSha256,after.fixtureSha256);
const books=[];for(const book of before.books){const matching=after.books.find(row=>row.bookId===book.bookId);assert(matching);const a=fs.readFileSync(out+'/ab/base/'+book.file),b=fs.readFileSync(out+'/ab/head/'+matching.file);assert(a.equals(b),book.bookId+' native observation difference');books.push({book:book.bookId,cases:book.cases,bytes:a.length,sha256:book.sha256,status:'BYTE_IDENTICAL'});}
fs.writeFileSync(out+'/ab/RESULTS.json',JSON.stringify({status:'PASS',base:before.sha,head:after.sha,counts:before.counts,fixtureSha256:before.fixtureSha256,masking:'NONE; complete import/snapshot/projection/effective/related/points observations',differences:0,books},null,2)+'\n');console.log('A/B PASS: 199 rosters / 507 states, zero differences, no masking.');
