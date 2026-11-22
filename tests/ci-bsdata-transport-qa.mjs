/** Private transport boundaries, with fixture-only Git responses; no network or real keys. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {KEY_ENV,prepareCiBsdata,safeChildEnvironment,validateTransport,shellQuote,sshCommand} from '../tools/prepare-ci-bsdata.mjs';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';

const commit='a'.repeat(40),accepted={commit,repository:'https://github.com/Fixture/accepted-upstream'};
const config={schema:'ci-bsdata-private-transport/v1',repository:'Fixture/private-mirror',branch:'pinned',sshUrl:'ssh://git@ssh.github.com:443/Fixture/private-mirror.git',knownHost:'[ssh.github.com]:443 ssh-ed25519 AAAAC3NzaFixture'};
const fixtureKey='-----BEGIN OPENSSH PRIVATE KEY-----\nFIXTURE_ONLY_NOT_A_KEY\n-----END OPENSSH PRIVATE KEY-----';
const controls=[];
const control=(name,fn)=>{fn();controls.push(name);};
control('missing-key-fails-closed',()=>assert.throws(()=>validateTransport(config,accepted,''),/BSDATA_CI_KEY_REQUIRED/));
control('untrusted-mirror-url-is-rejected',()=>assert.throws(()=>validateTransport({...config,sshUrl:'ssh://git@elsewhere.invalid/Fixture/private-mirror.git'},accepted,fixtureKey),/BSDATA_CI_INVALID_TRANSPORT/));
control('host-key-injection-is-rejected',()=>assert.throws(()=>validateTransport({...config,knownHost:config.knownHost+'\nanything'},accepted,fixtureKey),/BSDATA_CI_INVALID_HOST_KEY/));
control('malformed-accepted-sha-is-rejected',()=>assert.throws(()=>validateTransport(config,{...accepted,commit:'latest'},fixtureKey),/BSDATA_CI_INVALID_ACCEPTED_SOURCE/));
control('secret-and-ssh-state-never-enter-verifier-environment',()=>{
 const env=safeChildEnvironment({[KEY_ENV]:fixtureKey,GIT_SSH:'foreign',GIT_SSH_COMMAND:'foreign',GIT_SSH_VARIANT:'foreign',SSH_AUTH_SOCK:'foreign',SSH_AGENT_PID:'99',SSH_ASKPASS:'foreign',GIT_ASKPASS:'foreign',QA_PYTHON:'python',PATH:'fixture'});
 assert.deepEqual(env,{QA_PYTHON:'python',PATH:'fixture'});
});
control('Windows-environment-case-variants-cannot-leak-credentials',()=>{
 assert.deepEqual(safeChildEnvironment({bsdata_mirror_ssh_key:fixtureKey,git_ssh_command:'foreign',ssh_auth_sock:'foreign',git_askpass:'foreign',PATH:'fixture'}),{PATH:'fixture'});
});
control('SSH-enables-only-explicit-key-and-pinned-host-with-safe-quoting',()=>{
 const command=sshCommand("C:/fixture's folder/key",'C:/fixture folder/known_hosts');
 for(const required of ['IdentitiesOnly=yes','StrictHostKeyChecking=yes','BatchMode=yes','PasswordAuthentication=no','KbdInteractiveAuthentication=no'])assert(command.includes(required));
 assert(command.includes(shellQuote("C:/fixture's folder/key")));assert.equal(shellQuote("a'b"),"'a'\\''b'");
});

const arena=createQaTempDir('wh-ci-bsdata-controls-');
try{
 const source=path.join(arena,'target');fs.mkdirSync(path.join(source,'books/space-marines/sources'),{recursive:true});fs.mkdirSync(path.join(source,'tools'));
 fs.writeFileSync(path.join(source,'books/space-marines/sources/bsdata-extract.config.json'),JSON.stringify({source:accepted}));
 fs.writeFileSync(path.join(source,'tools/prepare-sm-bsdata.mjs'),'// Fixture-only verifier entry.');
 const scenario=({head=commit,origin=accepted.repository,dirty='',failAt,keep=false}={})=>{
  const calls=[];let keyPath,cachePath;
  const runner=(command,args,options)=>{
   calls.push({command,args:[...args],env:options.env});
   if(command==='git'){
    assert(!Object.hasOwn(options.env,KEY_ENV));assert(!Object.hasOwn(options.env,'SSH_AUTH_SOCK'));
    if(args[0]==='clone'){
     cachePath=args.at(-1);keyPath=path.join(path.dirname(cachePath),'identity');
     assert(fs.existsSync(keyPath));assert(fs.existsSync(path.join(path.dirname(cachePath),'known_hosts')));
     if(process.platform!=='win32')assert.equal(fs.statSync(keyPath).mode&0o777,0o600);
     fs.mkdirSync(cachePath);
    }
    if(failAt==='git')return {status:1,stderr:'PRIVATE_ERROR '+fixtureKey};
    if(args.includes('rev-parse'))return {status:0,stdout:head};
    if(args.includes('get-url'))return {status:0,stdout:origin};
    if(args.includes('status'))return {status:0,stdout:dirty};
    return {status:0,stdout:''};
   }
   assert.equal(command,process.execPath);assert.equal(args[0],path.join(source,'tools/prepare-sm-bsdata.mjs'));
   assert.equal(args[1],'--cache='+cachePath);assert(!fs.existsSync(keyPath),'Credential must be gone before authenticated verifier starts');
   assert(!Object.hasOwn(options.env,KEY_ENV));assert(!Object.keys(options.env).some(k=>/^GIT_SSH|^SSH_/.test(k)));
   return failAt==='helper'?{status:1,stderr:'PRIVATE_INPUT_CONTENT'}:{status:0,stdout:'Private verifier output is captured, not echoed.'};
  };
  const previous=process.env.KEEP_QA_TMP;if(keep)process.env.KEEP_QA_TMP='1';
  let result,error;
  try{result=prepareCiBsdata({source,env:{...process.env,[KEY_ENV]:fixtureKey,SSH_AUTH_SOCK:'foreign',GIT_SSH_COMMAND:'foreign'},runner,transportConfig:config});}
  catch(caught){error=caught;}
  finally{if(previous===undefined)delete process.env.KEEP_QA_TMP;else process.env.KEEP_QA_TMP=previous;}
  if(keyPath)assert(!fs.existsSync(keyPath));if(cachePath)assert(!fs.existsSync(cachePath));
  return {calls,result,error};
 };
 control('private-clone-goes-through-existing-cache-verifier',()=>{
  const {calls,result,error}=scenario();assert.equal(error,undefined);assert.equal(result.status,'PASS');assert.equal(result.commit,commit);
  const clone=calls[0].args;assert.deepEqual(clone.slice(0,-1),['clone','--no-tags','--single-branch','--branch','pinned','--',config.sshUrl]);
  assert(calls.some(row=>row.args.includes('set-url')&&row.args.at(-1)===accepted.repository));assert.equal(calls.at(-1).command,process.execPath);
 });
 control('wrong-mirror-head-never-reaches-verifier',()=>{const r=scenario({head:'b'.repeat(40)});assert.match(r.error.message,/BSDATA_CI_HEAD_MISMATCH/);assert(r.calls.every(row=>row.command==='git'));});
 control('wrong-origin-never-reaches-verifier',()=>{const r=scenario({origin:'https://github.com/Fixture/other'});assert.match(r.error.message,/BSDATA_CI_ORIGIN_MISMATCH/);assert(r.calls.every(row=>row.command==='git'));});
 control('dirty-private-cache-never-reaches-verifier',()=>{const r=scenario({dirty:' M example.json'});assert.match(r.error.message,/BSDATA_CI_DIRTY_CACHE/);assert(r.calls.every(row=>row.command==='git'));});
 control('git-failure-exposes-only-fixed-error-code-and-cleans',()=>{const r=scenario({failAt:'git'});assert.equal(r.error.message,'BSDATA_CI_GIT_FAILED');assert(!JSON.stringify(r.error.message).includes('PRIVATE'));});
 control('verifier-failure-exposes-only-fixed-error-code-and-cleans',()=>{const r=scenario({failAt:'helper'});assert.equal(r.error.message,'BSDATA_CI_AUTHENTICATED_PREPARATION_FAILED');});
 control('debug-KEEP-cannot-retain-private-source-or-key',()=>{const r=scenario({keep:true});assert.equal(r.error,undefined);});
}finally{cleanupQaTempDir(arena);}
console.log(JSON.stringify({status:'PASS',checks:controls.length,controls}));
