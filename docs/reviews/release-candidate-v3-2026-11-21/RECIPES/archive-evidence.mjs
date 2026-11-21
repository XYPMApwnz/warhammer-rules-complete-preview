import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const source='E:/Warhammer/qa-evidence/release-candidate-v3-2026-11-21';
const worktree='E:/Warhammer/qa-tmp/release-candidate/evidence';
const relative='docs/reviews/release-candidate-v3-2026-11-21',target=path.join(worktree,relative);
const git=(...args)=>execFileSync('git',args,{cwd:worktree,maxBuffer:40_000_000});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(git('rev-parse','HEAD').toString().trim(),'e3db1b345eca989436eea7af758900eee7795203');
if(process.argv.includes('--verify-index')){
 const archive=JSON.parse(git('show',':'+relative+'/ARTIFACTS.json'));
 const paths=git('diff','--cached','--name-only','-z').toString().split('\0').filter(Boolean).sort();
 assert.deepEqual(paths,[relative+'/ARTIFACTS.json',...archive.files.map(row=>relative+'/'+row.path)].sort());
 for(const row of archive.files){const bytes=git('show',':'+relative+'/'+row.path);assert.equal(bytes.length,row.bytes,row.path);assert.equal(hash(bytes),row.sha256,row.path);}
 assert(archive.ignoredLogs.every(file=>paths.includes(file)));
 console.log(JSON.stringify({status:'PASS',stagedFiles:paths.length,hashedFiles:archive.files.length,bytes:archive.totalBytes,logs:archive.ignoredLogs.length}));
}else{
 assert(!fs.existsSync(target),'Use a new evidence directory');
 const accepted=JSON.parse(fs.readFileSync(source+'/ACCEPTANCE.json'));assert.equal(accepted.status,'READY_FOR_CANDIDATE_REVIEW');assert.equal(accepted.releasePublished,false);
 const files=['REPORT.md','GALLERY.html','ROLLBACK_COMMANDS.md','CANDIDATE.json','ACCEPTANCE.json','PROTECTED_REFS.json',
  'PACKAGE_METRICS.json','PAGES_RUNTIME_MANIFEST.json','PACKAGE_QA.json','PACKAGE_BUILD.log','PACKAGE_CHECK.log','PACKAGE_QA.log',
  'BROWSER_SMOKE.log','UPDATE_PATH.log','ACCEPTED_PRE_FF.json','ACCEPTED_AB.json','ACCEPTED_CENSUS.json','STAGE1_QUICK.json','STAGE1_DIFF_STAT.txt'];
 for(const directory of ['metadata','RECIPES','browser','update-path'])for(const entry of fs.readdirSync(source+'/'+directory,{withFileTypes:true})){
  assert(!entry.isSymbolicLink());if(entry.isFile()&&/\.(?:json|md|mjs|jpg)$/.test(entry.name))files.push(directory+'/'+entry.name);
 }
 const sorted=[...new Set(files)].sort(),pending=[];
 const email=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
 for(const file of sorted){
  assert(!file.includes('..')&&!file.startsWith('/')&&!file.includes('\\'));assert(!/\.(?:zip|ndjson)$/.test(file));
  const bytes=fs.readFileSync(source+'/'+file);assert(bytes.length<10_000_000,file+' size');
  const text=/\.(?:md|html|mjs|json|log|txt)$/.test(file)?bytes.toString('utf8'):null;
  if(text!==null)assert(!email.test(text),'Inspect private email before publication: '+file);
  const normalized=text!==null?Buffer.from(text.replaceAll('\r\n','\n')):bytes;
  pending.push({file,bytes:normalized,sourceBytes:bytes.length,sourceSha256:hash(bytes)});
 }
 const planned=new Set(sorted);
 for(const file of ['REPORT.md','GALLERY.html']){
  const text=pending.find(row=>row.file===file).bytes.toString('utf8');
  const pattern=file.endsWith('.html')?/(?:src|href)="([^"]+)"/g:/\]\(([^)]+)\)/g;
  for(const match of text.matchAll(pattern)){const link=match[1];if(/^(?:https?:|#)/.test(link))continue;assert(planned.has(path.posix.normalize(link.split('#')[0])),'Missing archive link: '+link);}
 }
 const totalBytes=pending.reduce((n,row)=>n+row.bytes.length,0);assert(totalBytes<60_000_000);
 fs.mkdirSync(target,{recursive:true});
 for(const row of pending){const destination=path.join(target,row.file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,row.bytes);}
 const archive={schema:'release-candidate-review-archive/v3',candidate:accepted.candidate,totalBytes,
  files:pending.map(row=>({path:row.file,bytes:row.bytes.length,sha256:hash(row.bytes),sourceArchiveInput:{bytes:row.sourceBytes,sha256:row.sourceSha256}})),
  ignoredLogs:sorted.filter(file=>file.endsWith('.log')).map(file=>relative+'/'+file),
  excludes:['browser profiles','runtime package bodies','RAW sources','trace ZIPs','full source catalog','owner email'],textNewlines:'LF; original input hashes retained'};
 fs.writeFileSync(target+'/ARTIFACTS.json',JSON.stringify(archive,null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',files:pending.length+1,totalBytes,logs:archive.ignoredLogs.length,onlyReviewDirectory:true}));
}
