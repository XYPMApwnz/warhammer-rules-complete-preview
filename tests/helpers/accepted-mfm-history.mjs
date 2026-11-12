/** Immutable accepted-transition checks run their original code and codec. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';import {fileURLToPath,pathToFileURL} from 'node:url';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment} from './qa-temp.mjs';
export const ACCEPTED_MFM_HISTORY='35a5e4d59c9343b4c74f8e9b4833ee095f59f411';
const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const git=(root,args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
const safe=file=>{assert(typeof file==='string'&&!file.includes('\\')&&!file.includes(':')&&!path.posix.isAbsolute(file)&&!file.split('/').some(p=>!p||p==='.'||p==='..'),'Unsafe historical test path');return file;};
export function assertAcceptedMfmTree(root,label='MFM transition'){
 assert.equal(git(root,['rev-parse','HEAD']).trim(),ACCEPTED_MFM_HISTORY,'Historical '+label+' checkout must use its exact accepted commit');
 assert.equal(git(root,['status','--porcelain=v1','--untracked-files=all']).trim(),'','Historical '+label+' checkout contains changed bytes');
}
export function assertAcceptedMfmFixture(file,{root=defaultRoot,label='MFM transition'}={}){
 safe(file);const old=execFileSync('git',['show',ACCEPTED_MFM_HISTORY+':'+file],{cwd:root,maxBuffer:16*1024*1024});
 assert(fs.readFileSync(path.join(root,file)).equals(old),'The historical '+label+' fixture and its SHA values cannot be repinned');
}
export function verifyAcceptedMfmHistory({root=defaultRoot,script,args=[],fixtures=[],decodedFiles=[],checkout,label='MFM transition'}={}){
 safe(script);fixtures.forEach(file=>assertAcceptedMfmFixture(file,{root,label}));decodedFiles.forEach(safe);
 let scratch;
 try{
  if(!checkout){scratch=createQaTempDir('wh-accepted-mfm-history-');checkout=path.join(scratch,'checkout');
   execFileSync('git',['clone','--local','--no-hardlinks','--no-checkout','--config','core.autocrlf=false',root,checkout],{env:qaTempEnvironment(),stdio:'pipe'});
   git(checkout,['checkout','--detach',ACCEPTED_MFM_HISTORY]);}
  assertAcceptedMfmTree(checkout,label);
  const output=execFileSync(process.execPath,[script,...args],{cwd:checkout,env:qaTempEnvironment(),encoding:'utf8',maxBuffer:32*1024*1024});
  let decoded={};
  if(decodedFiles.length){
   const module=pathToFileURL(path.join(checkout,'books/shared/source-refs-v2/producer-io.mjs')).href;
   const worker=`import fs from 'node:fs';import path from 'node:path';import{parseProducerJSON}from ${JSON.stringify(module)};const[root,files]=process.argv.slice(1),decoded={};for(const file of JSON.parse(files))decoded[file]=parseProducerJSON(fs.readFileSync(path.join(root,file),'utf8'));process.stdout.write(JSON.stringify(decoded));`;
   decoded=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',worker,checkout,JSON.stringify(decodedFiles)],{cwd:checkout,env:qaTempEnvironment(),encoding:'utf8',maxBuffer:96*1024*1024}));
  }
  assertAcceptedMfmTree(checkout,label);return{commit:ACCEPTED_MFM_HISTORY,status:'PASS',output,decoded};
 }finally{if(scratch)cleanupQaTempDir(scratch);}
}
