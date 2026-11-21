/** The pinned CSM MODEL vocabulary must rebuild without its own prior file. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createQaTempDir,createQaEvidenceDir,cleanupQaTempDir,qaTempEnvironment,assertQaTempPath} from './helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const file='books/chaos-space-marines/v2/model-name-aliases.json';
const accepted='c0fab930a4f45ba05c33b66834fbf979518d91ef';
const expected=execFileSync('git',['show',accepted+':'+file],{cwd:root,maxBuffer:16*1024*1024});
assert(fs.readFileSync(path.join(root,file)).equals(expected),'Stored CSM aliases differ from the owner-pinned Git artifact');
const scratch=createQaTempDir('wh-csm-alias-bootstrap-'),copy=path.join(scratch,'checkout');
const out=createQaEvidenceDir('wh-csm-alias-bootstrap-evidence-');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
let completed=false;
try{
  fs.mkdirSync(copy,{recursive:true});
  for(const relative of execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)){
    const target=path.join(copy,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,relative),target);
  }
  if(fs.existsSync(path.join(root,'node_modules')))fs.symlinkSync(fs.realpathSync(path.join(root,'node_modules')),path.join(copy,'node_modules'),process.platform==='win32'?'junction':'dir');
  const output=path.join(copy,file);assertQaTempPath(output);fs.unlinkSync(output);assert(!fs.existsSync(output));
  const args=['books/shared/tools/build-new-recruit-model-names.mjs','--book=chaos-space-marines','--write'];
  const run=spawnSync(process.execPath,args,{cwd:copy,encoding:'utf8',env:qaTempEnvironment(),maxBuffer:16*1024*1024});
  fs.writeFileSync(path.join(out,'producer.log'),run.stdout+run.stderr);
  assert.equal(run.status,0,run.stderr);
  const actual=fs.readFileSync(output);
  fs.writeFileSync(path.join(out,'EXPECTED_FROM_GIT.json'),expected);fs.writeFileSync(path.join(out,'REBUILT.json'),actual);
  assert(actual.equals(expected),'CSM aliases rebuilt without a prior output differ from the owner-pinned Git bytes');
  assert(fs.readFileSync(path.join(root,file)).equals(expected),'Bootstrap test modified the original CSM aliases');
  completed=true;
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:'PASS',file,acceptedGitCommit:accepted,absentBeforeBuild:true,
    expectedSha256:sha(expected),rebuiltSha256:sha(actual),bytes:actual.length,command:[process.execPath,...args]},null,2)+'\n');
  console.log(JSON.stringify({status:'PASS',file,bytes:actual.length,sha256:sha(actual),evidence:out}));
}finally{
  if(!completed)fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:'FAIL',file,acceptedGitCommit:accepted},null,2)+'\n');
  cleanupQaTempDir(scratch);
}
