/** Dependency links must not become authored inputs in an isolated update. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createQaTempDir,cleanupQaTempDir,qaTempEnvironment} from './helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const rules=fs.readFileSync(path.join(root,'.gitignore'),'utf8');
const scratch=createQaTempDir('wh-dependency-ignore-');
const repo=path.join(scratch,'checkout'),modules=path.join(repo,'node_modules');
const controls=[];
try{
 fs.mkdirSync(repo);execFileSync('git',['init','--quiet',repo],{env:qaTempEnvironment(),stdio:'pipe'});
 const ignore=path.join(repo,'.gitignore');fs.writeFileSync(ignore,rules);
 fs.writeFileSync(path.join(repo,'authored-control.txt'),'Synthetic authored input');
 const untracked=()=>execFileSync('git',['-C',repo,'ls-files','--others','--exclude-standard','-z'],{env:qaTempEnvironment(),encoding:'utf8'}).split('\0').filter(Boolean);
 const check=()=>{
  const files=untracked();
  assert(files.includes('authored-control.txt'),'Unrelated authored input must remain visible');
  assert(!files.some(file=>file==='node_modules'||file.startsWith('node_modules/')),'Dependency directory or symlink must not enter workState fingerprints');
 };
 fs.mkdirSync(modules);fs.writeFileSync(path.join(modules,'dependency.txt'),'Synthetic dependency');check();
 controls.push('dependency-directory');fs.unlinkSync(path.join(modules,'dependency.txt'));fs.rmdirSync(modules);
 // Git treats a symbolic link as a non-directory for ignore patterns. This
 // control also runs on Windows without permission to create actual symlinks.
 fs.writeFileSync(modules,'Synthetic dependency-link path');check();controls.push('non-directory-dependency-path');
 fs.writeFileSync(ignore,rules.replace(/^node_modules\s*$/m,'node_modules/'));
 assert.throws(check,/Dependency directory or symlink/,'Directory-only historical pattern must fail the same control');
 controls.push('directory-only-pattern-mutation');fs.writeFileSync(ignore,rules);fs.unlinkSync(modules);
 const target=path.join(scratch,'installed-dependencies');fs.mkdirSync(target);
 fs.writeFileSync(path.join(target,'dependency.txt'),'Synthetic dependency');
 let symlink='PASS';
 try{fs.symlinkSync(target,modules,'dir');check();controls.push('actual-dependency-symlink');}
 catch(error){
  if(process.platform!=='win32'||error.code!=='EPERM')throw error;
  symlink='NOT_RUN_WINDOWS_EPERM';
 }
 console.log(JSON.stringify({status:'PASS',controls,symlink}));
}finally{cleanupQaTempDir(scratch);}
