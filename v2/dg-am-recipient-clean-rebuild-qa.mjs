/** Offline clean-tree producer rebuild, followed by the normal browser path.
 * No commits, branch updates or writes to the real Git index are performed.
 * Evidence is retained only through QA_EVIDENCE_DIR (see qa-temp helper). */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import {createQaTempDir,createQaEvidenceDir,cleanupQaTempDir,qaTempEnvironment} from '../tests/helpers/qa-temp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const tmp=createQaTempDir('wh-dg-am-clean-rebuild-'),clean=path.join(tmp,'checkout');
const out=path.resolve(option('--out')||createQaEvidenceDir('wh-dg-am-clean-evidence-'));
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(clean);
const git=(args,env=process.env)=>execFileSync('git',args,{cwd:root,env,encoding:'utf8',maxBuffer:128*1024*1024}).trim();
const report={baseline:git(['rev-parse','HEAD']),steps:[],generated:[]};
function run(command,args,cwd=clean){
 console.log('RUN '+command+' '+args.join(' '));const started=Date.now();
 const result=spawnSync(command,args,{cwd,env:qaTempEnvironment(),stdio:'inherit'});
 report.steps.push({command:[command,...args],milliseconds:Date.now()-started,status:result.status===0?'PASS':'FAIL'});
 assert.equal(result.status,0,'Clean producer/browser/parity command failed');
}
try{
 const env={...process.env,GIT_INDEX_FILE:path.join(tmp,'snapshot.index')};
 git(['read-tree','HEAD'],env);git(['add','-A'],env);const tree=git(['write-tree'],env);
 const archive=path.join(tmp,'snapshot.tar');git(['archive','--format=tar','--output='+archive,tree]);
 execFileSync('tar',['-xf',archive,'-C',clean]);
 const dependencies=fs.realpathSync(path.join(root,'node_modules'));
 fs.symlinkSync(dependencies,path.join(clean,'node_modules'),process.platform==='win32'?'junction':'dir');
 for(const [command,args]of [
  [process.execPath,['books/death-guard/v2/build.mjs']],
  [process.execPath,['books/death-guard/v2/rule-contract-build.mjs']],
  [process.execPath,['books/death-guard/v2/app-build.mjs']],
  [option('--python')||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'),['books/adeptus-mechanicus/v2/build.py']],
  [process.execPath,['books/adeptus-mechanicus/v2/rule-contract-build.mjs']],
  [process.execPath,['books/adeptus-mechanicus/v2/app-build.mjs']]
 ])run(command,args);
 for(const book of ['death-guard','adeptus-mechanicus']){
  const folder=`books/${book}/v2/generated`;
  const files=git(['ls-files',folder]).split('\n').filter(Boolean);
  for(const relative of files){assert.deepEqual(fs.readFileSync(path.join(clean,relative)),fs.readFileSync(path.join(root,relative)),relative+': deterministic clean rebuild');report.generated.push(relative);}
 }
 run(process.execPath,[path.join(root,'v2/dg-am-recipient-enrollment-qa.mjs'),'--static-only','--root='+clean]);
 const browserOut=path.join(out,'browser');
 const filters=['--case','--device','--books'].flatMap(key=>option(key)?[key+'='+option(key)]:[]);
 run(process.execPath,[path.join(root,'v2/dg-am-recipient-enrollment-browser-qa.mjs'),'--root='+clean,'--out='+browserOut,...filters]);
 run(process.execPath,[path.join(root,'v2/dg-am-recipient-enrollment-qa.mjs'),'--root='+clean,'--browser='+path.join(browserOut,'results.json')]);
 if(option('--states'))run(process.execPath,[path.join(root,'v2/dg-am-recipient-enrollment-qa.mjs'),'--root='+clean,'--states='+option('--states')]);
 report.status='PASS';
}finally{
 report.status ||= 'FAIL';fs.writeFileSync(path.join(out,'clean-rebuild.json'),JSON.stringify(report,null,2)+'\n');
 // Remove the junction first so cleanup never walks the shared dependency tree.
 const link=path.join(clean,'node_modules');if(fs.existsSync(link)){
  if(process.platform==='win32')fs.rmdirSync(link);else fs.unlinkSync(link);
 }
 cleanupQaTempDir(tmp);
}
