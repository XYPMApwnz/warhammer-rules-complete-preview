/** Frozen header-transition evidence belongs to its accepted MFM release. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment} from './qa-temp.mjs';

export const PLAIN_HEADER_HISTORY='35a5e4d59c9343b4c74f8e9b4833ee095f59f411';
const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const fixture='v2/fixtures/new-recruit-plain-header.json';
const git=(root,args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
export function assertPlainHeaderHistoryTree(root){
 assert.equal(git(root,['rev-parse','HEAD']).trim(),PLAIN_HEADER_HISTORY,'Historical plain-header checkout must use its exact accepted commit');
 assert.equal(git(root,['status','--porcelain=v1','--untracked-files=all']).trim(),'','Historical plain-header checkout contains changed bytes');
}
export function assertPlainHeaderFixture(root=defaultRoot){
 const old=execFileSync('git',['show',PLAIN_HEADER_HISTORY+':'+fixture],{cwd:root,maxBuffer:4*1024*1024});
 assert(fs.readFileSync(path.join(root,fixture)).equals(old),'The historical plain-header fixture and its SHA values cannot be repinned');
}
export function verifyPlainHeaderHistory({root=defaultRoot,book,checkout}={}){
 assertPlainHeaderFixture(root);
 let scratch;
 try{
  if(!checkout){
   scratch=createQaTempDir('wh-plain-header-history-');checkout=path.join(scratch,'checkout');
   execFileSync('git',['clone','--local','--no-hardlinks','--no-checkout','--config','core.autocrlf=false',root,checkout],{env:qaTempEnvironment(),stdio:'pipe'});
   git(checkout,['checkout','--detach',PLAIN_HEADER_HISTORY]);
  }
  assertPlainHeaderHistoryTree(checkout);
  const output=execFileSync(process.execPath,['v2/new-recruit-plain-header-qa.mjs',...(book?['--book='+book]:[])],{cwd:checkout,env:qaTempEnvironment(),encoding:'utf8',maxBuffer:32*1024*1024});
  assertPlainHeaderHistoryTree(checkout);
  return{commit:PLAIN_HEADER_HISTORY,book:book||'all',status:'PASS',output};
 }finally{if(scratch)cleanupQaTempDir(scratch);}
}
