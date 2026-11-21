/** Process-level QA scratch lifecycle controls. No application fixtures. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {QA_TEMP_MARKER,createQaTempDir,createQaEvidenceDir,getQaTmpRoot,sweepQaTempDirs,cleanupQaTempDir} from './helpers/qa-temp.mjs';
import {launchChromium} from './helpers/browser-launch.mjs';

const self=fileURLToPath(import.meta.url),mode=process.argv[2];
if(mode==='probe'){
  const directory=createQaTempDir('wh-lifecycle-');
  console.log(JSON.stringify({directory,root:getQaTmpRoot(),tmp:process.env.TMP,temp:process.env.TEMP,tmpdir:process.env.TMPDIR}));
  if(process.argv[3]==='assert')assert.fail('Intentional QA lifecycle failure');
  if(process.argv[3]==='exception')throw Error('Intentional QA lifecycle exception');
  if(process.argv[3]==='wait'){process.on('message',message=>{if(message==='SIGINT')process.emit('SIGINT');});console.log('WAITING');setInterval(()=>{},1000);}
}else if(mode==='browser'){
  const root=getQaTmpRoot(),browser=await launchChromium();
  const live=fs.readdirSync(root).filter(name=>fs.existsSync(path.join(root,name,QA_TEMP_MARKER)));
  assert.ok(live.length,'Browser profile has a marked owner');
  if(process.argv[3]==='assert')assert.fail('Intentional browser assertion with an open profile');
  await browser.close();assert.deepEqual(fs.readdirSync(root),[],'Closing the browser removes its profile/artifact parent');
}else{
  const arena=createQaTempDir('wh-temp-controls-'),root=path.join(arena,'isolated-root');fs.mkdirSync(root);
  const evidence=createQaEvidenceDir('temp-lifecycle-'),controls=[];
  const env=(extra={})=>({...process.env,QA_TMP_ROOT:root,QA_EVIDENCE_DIR:'',KEEP_QA_TMP:'0',...extra});
  const child=(args,extra={})=>spawnSync(process.execPath,[self,...args],{env:env(extra),encoding:'utf8'});
  const resultDirectory=result=>JSON.parse(result.stdout.split(/\r?\n/).find(line=>line.startsWith('{'))).directory;
  const control=(name,fn)=>{fn();controls.push({name,status:'PASS'});};
  control('ordinary-exit-removes-owned-directory-and-redirects-environment',()=>{
    const result=child(['probe']);assert.equal(result.status,0,result.stderr);
    const state=JSON.parse(result.stdout.trim());assert.equal(state.tmp,root);assert.equal(state.temp,root);assert.equal(state.tmpdir,root);
    assert.equal(fs.existsSync(state.directory),false);assert.deepEqual(fs.readdirSync(root),[]);
  });
  control('assertion-failure-removes-owned-directory-without-hiding-failure',()=>{
    const result=child(['probe','assert']);assert.notEqual(result.status,0);assert.match(result.stderr,/Intentional QA lifecycle failure/);
    assert.equal(fs.existsSync(resultDirectory(result)),false);assert.deepEqual(fs.readdirSync(root),[]);
  });
  control('uncaught-exception-removes-owned-directory',()=>{
    const result=child(['probe','exception']);assert.notEqual(result.status,0);assert.match(result.stderr,/Intentional QA lifecycle exception/);
    assert.equal(fs.existsSync(resultDirectory(result)),false);assert.deepEqual(fs.readdirSync(root),[]);
  });
  const pythonCode=["import sys",`sys.path.insert(0,${JSON.stringify(path.dirname(fileURLToPath(new URL('./helpers/qa_temp.py',import.meta.url))))})`,
    "from qa_temp import create_qa_temp_dir", "with create_qa_temp_dir('wh-python-control-') as directory:",
    " print(directory,flush=True)", " if sys.argv[1]=='assert': raise AssertionError('Intentional Python lifecycle failure')"].join('\n');
  for(const outcome of ['normal','assert','keep'])control('python-'+outcome+'-lifecycle',()=>{
    const result=spawnSync(process.env.PYTHON||'python',['-B','-c',pythonCode,outcome],{env:env({KEEP_QA_TMP:outcome==='keep'?'1':'0'}),encoding:'utf8'});
    if(outcome==='assert'){assert.notEqual(result.status,0);assert.match(result.stderr,/Intentional Python lifecycle failure/);}
    else assert.equal(result.status,0,result.stderr);
    const directory=result.stdout.trim();assert.ok(directory.startsWith(root+path.sep));
    assert.equal(fs.existsSync(directory),outcome==='keep');
    if(outcome==='keep'){
      const marker=JSON.parse(fs.readFileSync(path.join(directory,QA_TEMP_MARKER)));assert.equal(marker.keep,true);
      sweepQaTempDirs({root,now:Date.now()+26*60*60*1000});assert.ok(fs.existsSync(directory));
    }
  });
  let kept;
  control('KEEP-retains-directory-and-age-sweep-never-removes-it',()=>{
    const result=child(['probe'],{KEEP_QA_TMP:'1'});assert.equal(result.status,0,result.stderr);kept=path.dirname(resultDirectory(result));
    assert.ok(fs.existsSync(kept));const file=path.join(kept,QA_TEMP_MARKER),marker=JSON.parse(fs.readFileSync(file));
    marker.createdAt=new Date(Date.now()-26*60*60*1000).toISOString();fs.writeFileSync(file,JSON.stringify(marker));
    sweepQaTempDirs({root});assert.ok(fs.existsSync(kept));
  });
  control('age-sweep-removes-only-old-marked-inactive-unkept-directory',()=>{
    const old=child(['probe'],{KEEP_QA_TMP:'1'}),fresh=child(['probe'],{KEEP_QA_TMP:'1'});
    const oldContainer=path.dirname(resultDirectory(old)),freshContainer=path.dirname(resultDirectory(fresh));
    for(const container of [oldContainer,freshContainer]){
      const file=path.join(container,QA_TEMP_MARKER),marker=JSON.parse(fs.readFileSync(file));marker.keep=false;
      if(container===oldContainer)marker.createdAt=new Date(Date.now()-26*60*60*1000).toISOString();fs.writeFileSync(file,JSON.stringify(marker));
    }
    const unmarked=path.join(root,'unmarked-fixture');fs.mkdirSync(unmarked);fs.utimesSync(unmarked,0,0);
    const sweep=sweepQaTempDirs({root});assert.deepEqual(sweep.errors,[]);assert.ok(sweep.removed.includes(oldContainer));
    assert.ok(!fs.existsSync(oldContainer));assert.ok(fs.existsSync(freshContainer));assert.ok(fs.existsSync(unmarked));assert.ok(fs.existsSync(kept));
  });
  async function waitingChild(){
    const process=spawn(globalThis.process.execPath,[self,'probe','wait'],{env:env(),stdio:['ignore','pipe','pipe','ipc']});
    let output='';await new Promise((resolve,reject)=>{process.stdout.on('data',chunk=>{output+=chunk;if(output.includes('WAITING'))resolve();});process.once('error',reject);process.once('exit',code=>{if(!output.includes('WAITING'))reject(Error('Probe exited early: '+code));});});
    return {process,directory:JSON.parse(output.split(/\r?\n/)[0]).directory};
  }
  const live=await waitingChild(),container=path.dirname(live.directory),file=path.join(container,QA_TEMP_MARKER);
  const marker=JSON.parse(fs.readFileSync(file));marker.createdAt=new Date(Date.now()-26*60*60*1000).toISOString();fs.writeFileSync(file,JSON.stringify(marker));
  control('old-active-owner-is-never-swept',()=>{sweepQaTempDirs({root});assert.ok(fs.existsSync(container));});
  const stopped=new Promise(resolve=>live.process.once('exit',resolve));live.process.kill('SIGKILL');await stopped;
  control('hard-kill-leaves-directory-until-eligible-next-sweep',()=>{
    assert.ok(fs.existsSync(container));const sweep=sweepQaTempDirs({root});assert.ok(sweep.removed.includes(container));assert.ok(!fs.existsSync(container));
  });
  const signalled=await waitingChild(),signalDone=new Promise(resolve=>signalled.process.once('exit',resolve));
  signalled.process.send('SIGINT');assert.equal(await signalDone,130);
  control('delivered-signal-handler-cleans-before-exit',()=>assert.equal(fs.existsSync(signalled.directory),false));
  // Fixture-only cleanup, including deliberately forged KEEP/fresh/unmarked
  // cases. It is inside this test's owned arena, never an actual debug run.
  fs.rmSync(root,{recursive:true,force:true});fs.mkdirSync(root);
  control('browser-close-removes-owned-playwright-profiles',()=>{const result=child(['browser']);assert.equal(result.status,0,result.stderr);assert.deepEqual(fs.readdirSync(root),[]);});
  control('fatal-browser-assertion-removes-owned-profile-parent',()=>{
    const result=child(['browser','assert']);assert.notEqual(result.status,0);assert.match(result.stderr,/Intentional browser assertion/);
    assert.deepEqual(fs.readdirSync(root),[],result.stderr);
  });
  control('unavailable-root-is-fatal-with-no-system-temp-fallback',()=>{
    const blocked=path.join(arena,'not-a-directory');fs.writeFileSync(blocked,'fixture');
    const result=child(['probe'],{QA_TMP_ROOT:blocked});assert.notEqual(result.status,0);assert.match(result.stderr,/QA_TMP_ROOT is unavailable.*No system-Temp fallback/s);
  });
  const report={status:'PASS',controls,hardKillLimit:'SIGKILL/forced OS termination cannot execute cleanup; inactive owned folders are reclaimed by the next eligible age sweep.',
    windowsSignalLimit:'Windows forced TerminateProcess is a hard kill; only signals delivered to Node handlers can run cleanup.'};
  fs.writeFileSync(path.join(evidence,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');
  cleanupQaTempDir(arena);console.log(JSON.stringify(report));
}
