/** Owned browser IPC isolation; no browser executable or gameplay assertions change. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {EventEmitter} from 'node:events';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {launchQaBrowser,browserIpcRoot} from './helpers/qa-browser.cjs';
import {QA_TEMP_MARKER,createQaTempDir,cleanupQaTempDir,assertQaTempPath,cleanupQaRunTemps} from './helpers/qa-temp.mjs';

const fakeBrowser=()=>{const browser=new EventEmitter();browser.close=async()=>{browser.emit('disconnected');return 'closed';};return browser;};
if(process.argv.includes('--fatal-probe')){
  createQaTempDir('fatal-alternate-',{root:process.env.QA_BROWSER_IPC_ROOT});
  await launchQaBrowser({launch:async()=>fakeBrowser()});
  throw Error('Intentional browser IPC fatal control');
}

const controls=[],keys=['QA_TMP_ROOT','QA_BROWSER_IPC_ROOT','TMP','TEMP','TMPDIR','KEEP_QA_TMP'];
const original=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
const arena=createQaTempDir('wh-ipc-controls-'),mainRoot=path.join(arena,'main'),ipcRoot=path.join(arena,'ipc');
fs.mkdirSync(mainRoot);fs.mkdirSync(ipcRoot);process.env.QA_TMP_ROOT=mainRoot;process.env.QA_BROWSER_IPC_ROOT=ipcRoot;process.env.KEEP_QA_TMP='0';
const check=async(name,operation)=>{await operation();controls.push({name,status:'PASS'});};
const markerFile=directory=>path.join(path.dirname(directory),QA_TEMP_MARKER);
const rewriteMarker=(directory,change)=>{const file=markerFile(directory),value=JSON.parse(fs.readFileSync(file,'utf8'));fs.writeFileSync(file,JSON.stringify({...value,...change}));};
const empty=()=>{assert.deepEqual(fs.readdirSync(mainRoot),[]);assert.deepEqual(fs.readdirSync(ipcRoot),[]);};
try{
  await check('explicit-linux-selection-without-platform-fallback',()=>{
    assert.equal(browserIpcRoot({QA_BROWSER_IPC_ROOT:'/explicit/project-ipc'},'linux'),'/explicit/project-ipc');
    assert.equal(browserIpcRoot({},'linux'),null);
    assert.equal(browserIpcRoot({QA_BROWSER_IPC_ROOT:'/explicit/project-ipc'},'win32'),null);
    assert.throws(()=>browserIpcRoot({QA_BROWSER_IPC_ROOT:''},'linux'),/explicit non-empty/);
  });
  await check('alternate-root-is-owned-and-does-not-mutate-environment',()=>{
    const before={...process.env},directory=createQaTempDir('alternate-',{root:ipcRoot});
    assertQaTempPath(directory);assert.deepEqual({...process.env},before);
    assert.equal(JSON.parse(fs.readFileSync(markerFile(directory),'utf8')).pid,process.pid);
    assert.equal(cleanupQaTempDir(directory),true);assert.equal(fs.existsSync(directory),false);empty();
  });
  await check('alternate-root-retains-checkout-and-unavailable-root-guards',()=>{
    assert.throws(()=>createQaTempDir('invalid-',{root:fileURLToPath(new URL('./',import.meta.url))}),/outside the Git checkout/);
    const blocked=path.join(arena,'blocked');fs.writeFileSync(blocked,'fixture');
    assert.throws(()=>createQaTempDir('invalid-',{root:blocked}),/No system-Temp fallback/);empty();
  });
  await check('normal-close-keeps-parent-profiles-and-cleans-child-ipc',async()=>{
    let observed,parentTemp;
    const browser=await launchQaBrowser({launch:async options=>{observed=options;parentTemp=process.env.TMPDIR;return fakeBrowser();}},
      {headless:true,executablePath:'unchanged-browser',args:['--unchanged-option']});
    assert.equal(observed.headless,true);assert.equal(observed.executablePath,'unchanged-browser');assert.deepEqual(observed.args,['--unchanged-option']);
    assert.equal(observed.downloadsPath,path.join(parentTemp,'downloads'));assert.equal(observed.tracesDir,path.join(parentTemp,'traces'));
    assert.equal(observed.env.QA_TMP_ROOT,fs.realpathSync(mainRoot));
    for(const key of ['TMP','TEMP','TMPDIR'])assert.equal(observed.env[key],observed.env.TMPDIR);
    assertQaTempPath(parentTemp);assertQaTempPath(observed.env.TMPDIR);
    if(process.platform==='linux'){assert.notEqual(observed.env.TMPDIR,parentTemp);assert.equal(path.dirname(path.dirname(observed.env.TMPDIR)),fs.realpathSync(ipcRoot));}
    else assert.equal(observed.env.TMPDIR,parentTemp);
    assert.equal(process.env.TMPDIR,fs.realpathSync(mainRoot));assert.equal(await browser.close(),'closed');empty();
  });
  await check('launch-error-identity-is-preserved-and-both-directories-are-cleaned',async()=>{
    const originalError=Error('Intentional unchanged launch failure');
    await assert.rejects(launchQaBrowser({launch:async()=>{throw originalError;}}),error=>error===originalError);empty();
    assert.equal(process.env.TMPDIR,fs.realpathSync(mainRoot));
  });
  await check('fatal-exit-cleans-alternate-and-browser-directories',()=>{
    const child=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--fatal-probe'],{env:{...process.env,QA_EVIDENCE_DIR:''},encoding:'utf8',timeout:10000});
    assert.notEqual(child.status,0);assert.match(child.stderr,/Intentional browser IPC fatal control/);empty();
  });
  await check('dead-current-run-ipc-cleanup-preserves-keep-other-run-and-live-owners',()=>{
    const exited=spawnSync(process.execPath,['-e','process.exit(0)'],{encoding:'utf8'});assert.equal(exited.status,0);
    const dead=createQaTempDir('dead-',{root:ipcRoot}),other=createQaTempDir('other-',{root:ipcRoot}),kept=createQaTempDir('kept-',{root:ipcRoot}),live=createQaTempDir('live-',{root:ipcRoot});
    rewriteMarker(dead,{pid:exited.pid});rewriteMarker(other,{pid:exited.pid,runId:'different-run'});rewriteMarker(kept,{pid:exited.pid,keep:true});
    cleanupQaRunTemps();assert.equal(fs.existsSync(dead),false);assert(fs.existsSync(other));assert(fs.existsSync(kept));assert(fs.existsSync(live));
    rewriteMarker(kept,{keep:false});for(const directory of [other,kept,live])cleanupQaTempDir(directory);empty();
  });
  if(process.platform==='linux'||process.argv.includes('--browser')){
    await check('unchanged-fourteen-qa-temp-controls-and-actual-ipc-cleanup',()=>{
      const configured=original.QA_BROWSER_IPC_ROOT;
      if(process.platform==='linux')assert(configured,'Set QA_BROWSER_IPC_ROOT to an explicit short project scratch root for Linux browser controls');
      const actualIpc=configured||ipcRoot;fs.mkdirSync(actualIpc,{recursive:true});
      const before=fs.readdirSync(actualIpc),longRoot=path.join(arena,process.platform==='linux'?'unchanged-browser-controls-with-long-nested-root':'actual'),evidence=path.join(arena,'private-qa-evidence');
      const child=spawnSync(process.execPath,[fileURLToPath(new URL('./qa-temp-qa.mjs',import.meta.url))],
        {env:{...process.env,QA_TMP_ROOT:longRoot,QA_BROWSER_IPC_ROOT:actualIpc,QA_EVIDENCE_DIR:evidence},encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
      fs.writeFileSync(path.join(arena,'private-original-control.stdout.log'),child.stdout||'');fs.writeFileSync(path.join(arena,'private-original-control.stderr.log'),child.stderr||'');
      assert.equal(child.status,0,'QA_IPC_UNCHANGED_CONTROL_FAILED; raw child diagnostics remain runner-private');
      const report=child.stdout.split(/\r?\n/).filter(line=>line.startsWith('{')).map(line=>JSON.parse(line)).find(value=>value.status==='PASS'&&Array.isArray(value.controls));
      assert(report);assert.equal(report.controls.length,14);assert(report.controls.every(control=>control.status==='PASS'));
      assert.deepEqual(fs.readdirSync(actualIpc),before,'Actual browser close/fatal paths leave no new IPC directory');
    });
  }
  console.log(JSON.stringify({status:'PASS',controls,linuxActualBrowserRequired:process.platform==='linux'}));
}finally{
  for(const [key,value]of Object.entries(original)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
  cleanupQaTempDir(arena);
}
