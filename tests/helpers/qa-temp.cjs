/** Project-owned QA scratch space. Never sweep the operating-system Temp. */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const PROJECT='XYPMApwnz/warhammer-rules-complete-preview';
const SCHEMA='warhammer-rules-complete-preview/qa-temp-v1';
const MARKER='.warhammer-qa-temp.json';
const repo=path.resolve(__dirname,'../..');
const defaultRoot=process.platform==='win32'?'E:/Warhammer/qa-tmp':path.resolve(repo,'../qa-tmp');
const owned=new Map(),closing=new Set();
const runId=process.env.QA_RUN_ID||randomUUID();
let signalClosing=false;
let fatalClosing=false;
const inside=(parent,child)=>child!==parent&&child.startsWith(parent+path.sep);
function validateRoot(value){
  const root=path.resolve(value);
  if(root===repo||inside(repo,root))throw Error('QA_TMP_ROOT must be outside the Git checkout: '+root);
  if(process.platform==='win32')for(const system of [process.env.LOCALAPPDATA&&path.join(process.env.LOCALAPPDATA,'Temp'),process.env.SystemRoot&&path.join(process.env.SystemRoot,'Temp')].filter(Boolean))
    if(root.toLowerCase()===path.resolve(system).toLowerCase()||inside(path.resolve(system).toLowerCase(),root.toLowerCase()))
      throw Error('QA_TMP_ROOT must not use system Temp: '+root);
  try{fs.mkdirSync(root,{recursive:true});fs.accessSync(root,fs.constants.W_OK);}
  catch(error){throw Error('QA_TMP_ROOT is unavailable: '+root+'; set a writable project scratch directory. No system-Temp fallback. '+error.message);}
  const real=fs.realpathSync(root);
  if(process.platform==='win32')for(const system of [process.env.LOCALAPPDATA&&path.join(process.env.LOCALAPPDATA,'Temp'),process.env.SystemRoot&&path.join(process.env.SystemRoot,'Temp')].filter(Boolean))
    if(real.toLowerCase()===path.resolve(system).toLowerCase()||inside(path.resolve(system).toLowerCase(),real.toLowerCase()))
      throw Error('QA_TMP_ROOT resolves into system Temp: '+real);
  if(real!==root&&process.platform!=='win32'||real.toLowerCase()!==root.toLowerCase()){
    if(real===repo||inside(repo,real))throw Error('QA_TMP_ROOT resolves into the checkout: '+real);
  }
  return real;
}
function getQaTmpRoot(){return validateRoot(process.env.QA_TMP_ROOT||defaultRoot);}
function configureQaTempEnvironment(){
  const root=getQaTmpRoot();process.env.QA_TMP_ROOT=root;process.env.QA_RUN_ID=runId;
  for(const key of ['TMP','TEMP','TMPDIR'])process.env[key]=root;
  return root;
}
function qaTempEnvironment(env=process.env){
  const root=configureQaTempEnvironment();return {...env,QA_TMP_ROOT:root,QA_RUN_ID:runId,TMP:root,TEMP:root,TMPDIR:root};
}
const label=value=>String(value||'wh-qa-').replace(/[^a-zA-Z0-9_.-]/g,'-');
function markerAt(dir){
  try{if(fs.lstatSync(dir).isSymbolicLink())return null;const marker=JSON.parse(fs.readFileSync(path.join(dir,MARKER),'utf8'));
    return marker.schema===SCHEMA&&marker.project===PROJECT&&Number.isSafeInteger(marker.pid)&&marker.pid>0&&
      Number.isFinite(Date.parse(marker.createdAt))&&typeof marker.keep==='boolean'?marker:null;
  }catch{return null;}
}
function createQaTempDir(prefix='wh-qa-'){
  const root=configureQaTempEnvironment(),container=fs.mkdtempSync(path.join(root,label(prefix)));
  const marker={schema:SCHEMA,project:PROJECT,pid:process.pid,createdAt:new Date().toISOString(),keep:process.env.KEEP_QA_TMP==='1',runId,host:os.hostname()};
  fs.writeFileSync(path.join(container,MARKER),JSON.stringify(marker,null,2)+'\n');
  // The caller receives an empty directory, just as with mkdtemp. Ownership
  // metadata lives beside it so Git clones/copy fixtures see no extra input.
  const work=path.join(container,'work');fs.mkdirSync(work);owned.set(container,{root,marker});
  armQaExitCleanup();return work;
}
function managedContainer(value){
  const target=path.resolve(value);
  for(const [container,record]of owned)if(target===container||inside(container,target))return {container,...record};
  const root=getQaTmpRoot();if(!inside(root,target))return null;
  const container=path.join(root,path.relative(root,target).split(path.sep)[0]),marker=markerAt(container);
  return marker?{container,root,marker}:null;
}
function removeOwned(record){
  if(!record)return false;
  const {container,root}=record,marker=markerAt(container);
  if(!fs.existsSync(container)){owned.delete(container);return true;}
  if(!marker||marker.keep)return false;
  if(path.dirname(container)!==root||!inside(root,container)||fs.realpathSync(container)!==container)
    throw Error('Refusing unsafe QA cleanup target: '+container);
  fs.rmSync(container,{recursive:true,force:true,maxRetries:5,retryDelay:100});owned.delete(container);return true;
}
function cleanupQaTempDir(value){return removeOwned(managedContainer(value));}
function assertQaTempPath(value){
  const record=managedContainer(value);
  if(!record||!markerAt(record.container)||!inside(record.root,path.resolve(value))||
    fs.realpathSync(record.container)!==record.container)throw Error('Unowned QA temporary path: '+value);
  return true;
}
function alive(pid){try{process.kill(pid,0);return true;}catch(error){return error.code!=='ESRCH';}}
function sweepQaTempDirs({root=getQaTmpRoot(),now=Date.now(),maxAgeMs=24*60*60*1000}={}){
  root=validateRoot(root);const removed=[],preserved=[],errors=[];
  for(const entry of fs.readdirSync(root,{withFileTypes:true})){
    if(!entry.isDirectory())continue;const container=path.join(root,entry.name),marker=markerAt(container);
    if(!marker)continue;
    if(marker.keep||now-Date.parse(marker.createdAt)<=maxAgeMs||marker.host&&marker.host!==os.hostname()||alive(marker.pid)){
      preserved.push(container);continue;
    }
    try{if(removeOwned({container,root,marker}))removed.push(container);}catch(error){errors.push({path:container,error:error.message});}
  }
  return {removed,preserved,errors};
}
function cleanupQaRunTemps(){
  const root=getQaTmpRoot();
  for(const entry of fs.readdirSync(root,{withFileTypes:true})){
    if(!entry.isDirectory())continue;const container=path.join(root,entry.name),marker=markerAt(container);
    if(marker?.runId===runId&&!marker.keep&&marker.pid!==process.pid&&!alive(marker.pid))removeOwned({container,root,marker});
  }
}
function createQaEvidenceDir(prefix='qa-evidence-',explicit){
  const destination=explicit||process.env.QA_EVIDENCE_DIR;
  if(!destination)return createQaTempDir(prefix);
  const base=path.resolve(destination);if(base===repo||inside(repo,base))throw Error('QA evidence must be outside the checkout: '+base);
  fs.mkdirSync(base,{recursive:true});return fs.mkdtempSync(path.join(base,label(prefix)));
}
function registerQaCleanup(fn){
  closing.add(fn);
  if(!process.listeners('uncaughtException').includes(onFatal))process.on('uncaughtException',onFatal);
  return ()=>{closing.delete(fn);if(!closing.size)process.removeListener('uncaughtException',onFatal);};
}
function cleanupSync(){
  for(const [container,record]of [...owned])try{removeOwned({container,...record});}catch(error){
    console.error('[qa-temp] Cleanup failed: '+error.message);process.exitCode=process.exitCode||1;
  }
}
function armQaExitCleanup(){process.removeListener('exit',cleanupSync);process.once('exit',cleanupSync);}
async function closeResources(){
  let timer;
  try{await Promise.race([Promise.allSettled([...closing].map(fn=>fn())),new Promise(resolve=>{timer=setTimeout(resolve,5000);})]);}
  finally{clearTimeout(timer);}
}
function onFatal(error){
  if(fatalClosing){process.removeListener('uncaughtException',onFatal);throw error;}
  fatalClosing=true;
  void (async()=>{
    try{await closeResources();cleanupQaRunTemps();cleanupSync();}
    finally{
      // Preserve the original exception/stack and Node's nonzero failure.
      // Only teardown is delayed; this handler never converts an assert to PASS.
      process.removeListener('uncaughtException',onFatal);
      process.nextTick(()=>{throw error;});
    }
  })();
}
async function onSignal(signal){
  if(signalClosing)return;signalClosing=true;
  await closeResources();cleanupQaRunTemps();cleanupSync();
  process.exit(signal==='SIGINT'?130:143);
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{void onSignal(signal);});
armQaExitCleanup();
configureQaTempEnvironment();
exports.QA_TEMP_MARKER=MARKER;
exports.QA_TEMP_SCHEMA=SCHEMA;
exports.QA_TEMP_PROJECT=PROJECT;
exports.getQaTmpRoot=getQaTmpRoot;
exports.configureQaTempEnvironment=configureQaTempEnvironment;
exports.qaTempEnvironment=qaTempEnvironment;
exports.createQaTempDir=createQaTempDir;
exports.createQaEvidenceDir=createQaEvidenceDir;
exports.cleanupQaTempDir=cleanupQaTempDir;
exports.assertQaTempPath=assertQaTempPath;
exports.cleanupQaRunTemps=cleanupQaRunTemps;
exports.sweepQaTempDirs=sweepQaTempDirs;
exports.registerQaCleanup=registerQaCleanup;
exports.armQaExitCleanup=armQaExitCleanup;
