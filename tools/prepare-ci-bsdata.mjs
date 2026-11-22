/** Private transport only; the existing authenticated preparation owns verification. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createQaTempDir,cleanupQaTempDir,assertQaTempPath} from '../tests/helpers/qa-temp.mjs';

export const KEY_ENV='BSDATA_MIRROR_SSH_KEY';
const fail=code=>{throw Error(code);};
const repositoryKey=value=>String(value).replace(/\.git$/,'').replace(/\/$/,'');
export function safeChildEnvironment(input=process.env){
 const result={...input};
 for(const key of Object.keys(result))if(/^BSDATA_MIRROR_SSH_KEY$/i.test(key)||/^GIT_SSH/i.test(key)||/^SSH_/i.test(key)||/^GIT_ASKPASS$/i.test(key))delete result[key];
 return result;
}
export function validateTransport(config,accepted,key){
 if(config?.schema!=='ci-bsdata-private-transport/v1'||typeof config.repository!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(config.repository))fail('BSDATA_CI_INVALID_TRANSPORT');
 if(config.sshUrl!==`ssh://git@ssh.github.com:443/${config.repository}.git`||typeof config.branch!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_./-]*$/.test(config.branch)||config.branch.includes('..'))fail('BSDATA_CI_INVALID_TRANSPORT');
 if(typeof config.knownHost!=='string'||!/^\[ssh\.github\.com\]:443 ssh-ed25519 [A-Za-z0-9+/]+={0,3}$/.test(config.knownHost))fail('BSDATA_CI_INVALID_HOST_KEY');
 if(typeof accepted?.commit!=='string'||!/^[0-9a-f]{40}$/.test(accepted.commit)||typeof accepted.repository!=='string'||!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(accepted.repository))fail('BSDATA_CI_INVALID_ACCEPTED_SOURCE');
 if(typeof key!=='string'||!key.trim()||key.includes('\0'))fail('BSDATA_CI_KEY_REQUIRED');
 if(!key.trim().startsWith('-----BEGIN OPENSSH PRIVATE KEY-----')||!key.trim().endsWith('-----END OPENSSH PRIVATE KEY-----'))fail('BSDATA_CI_INVALID_KEY_FORMAT');
}
// Git invokes this through its shell; quote every argument, including paths.
export function shellQuote(value){return "'"+String(value).replaceAll("'","'\\''")+"'";}
export function sshCommand(key,knownHosts){
 const portable=value=>String(value).replaceAll('\\','/');
 return ['ssh','-i',portable(key),'-o','IdentitiesOnly=yes','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','UserKnownHostsFile='+portable(knownHosts),'-o','PasswordAuthentication=no','-o','KbdInteractiveAuthentication=no','-o','ConnectTimeout=30','-o','ConnectionAttempts=1','-o','ServerAliveInterval=15','-o','ServerAliveCountMax=2','-o','LogLevel=ERROR'].map(shellQuote).join(' ');
}
export function prepareCiBsdata({source,env=process.env,runner=spawnSync,transportConfig}={}){
 let work,keyFile;
 try{
  if(typeof source!=='string'||!source)fail('BSDATA_CI_SOURCE_REQUIRED');
  const root=fs.realpathSync(source),helper=path.join(root,'tools/prepare-sm-bsdata.mjs');
  const config=transportConfig??JSON.parse(fs.readFileSync(new URL('./ci-bsdata-mirror.json',import.meta.url),'utf8'));
  const accepted=JSON.parse(fs.readFileSync(path.join(root,'books/space-marines/sources/bsdata-extract.config.json'),'utf8')).source;
  validateTransport(config,accepted,env[KEY_ENV]);
  if(!fs.statSync(helper).isFile())fail('BSDATA_CI_HELPER_UNAVAILABLE');
  work=createQaTempDir('wh-ci-bsdata-private-');assertQaTempPath(work);
  fs.chmodSync(work,0o700);
  keyFile=path.join(work,'identity');const hosts=path.join(work,'known_hosts'),cache=path.join(work,'cache');
  fs.writeFileSync(keyFile,env[KEY_ENV].trim().replaceAll('\r\n','\n')+'\n',{mode:0o600,flag:'wx'});
  fs.writeFileSync(hosts,config.knownHost+'\n',{mode:0o600,flag:'wx'});
  const cleanEnv=safeChildEnvironment(env);
  const gitEnv={...cleanEnv,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never',GIT_SSH_COMMAND:sshCommand(keyFile,hosts),GIT_SSH_VARIANT:'ssh'};
  const invoke=(command,args,childEnv,code)=>{
   const result=runner(command,args,{cwd:root,env:childEnv,encoding:'utf8',maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});
   if(result?.error||result?.status!==0)fail(code);
   return String(result.stdout||'').trim();
  };
  const git=args=>invoke('git',args,gitEnv,'BSDATA_CI_GIT_FAILED');
  git(['clone','--no-tags','--single-branch','--branch',config.branch,'--',config.sshUrl,cache]);
  const head=git(['-C',cache,'rev-parse','--verify','HEAD']);
  if(head!==accepted.commit)fail('BSDATA_CI_HEAD_MISMATCH');
  git(['-C',cache,'checkout','--detach',accepted.commit]);
  // Only the fresh private transport copy is relabelled with its accepted origin.
  git(['-C',cache,'remote','set-url','origin',accepted.repository]);
  const origin=git(['-C',cache,'remote','get-url','origin']);
  if(repositoryKey(origin)!==repositoryKey(accepted.repository))fail('BSDATA_CI_ORIGIN_MISMATCH');
  if(git(['-C',cache,'status','--porcelain=v1','--untracked-files=all']))fail('BSDATA_CI_DIRTY_CACHE');
  // No credential, agent socket or SSH override is inherited by the verifier.
  fs.rmSync(keyFile,{force:true});
  invoke(process.execPath,[helper,'--cache='+cache],cleanEnv,'BSDATA_CI_AUTHENTICATED_PREPARATION_FAILED');
  return {status:'PASS',commit:accepted.commit,transport:'private-read-only-mirror',verification:'existing prepare-sm-bsdata --cache'};
 }catch(error){
  if(/^BSDATA_CI_[A-Z_]+$/.test(error?.message||''))throw error;
  fail('BSDATA_CI_PREPARATION_FAILED');
 }finally{
  if(work){
   try{
    if(keyFile)fs.rmSync(keyFile,{force:true});
    cleanupQaTempDir(work);
    // KEEP_QA_TMP must not retain private source/key material from this transport.
    if(fs.existsSync(work)){assertQaTempPath(work);fs.rmSync(work,{recursive:true,force:true});}
   }catch{fail('BSDATA_CI_CLEANUP_FAILED');}
  }
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2);
  if(args.length!==1||!args[0].startsWith('--source=')||args[0]==='--source=')fail('BSDATA_CI_INVALID_ARGUMENTS');
  console.log(JSON.stringify(prepareCiBsdata({source:args[0].slice('--source='.length)})));
 }catch(error){
  console.error(/^BSDATA_CI_[A-Z_]+$/.test(error?.message||'')?error.message:'BSDATA_CI_PREPARATION_FAILED');process.exitCode=1;
 }
}
