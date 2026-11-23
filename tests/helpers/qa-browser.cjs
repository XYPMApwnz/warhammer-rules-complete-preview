/** Resource lifecycle only; browser type and test launch options are preserved. */
const path=require('node:path');
const {setTimeout:delay}=require('node:timers/promises');
const {createQaTempDir,configureQaTempEnvironment,cleanupQaTempDir,registerQaCleanup,armQaExitCleanup}=require('./qa-temp.cjs');
let launches=Promise.resolve();
function browserIpcRoot(env=process.env,platform=process.platform){
  if(platform!=='linux'||env.QA_BROWSER_IPC_ROOT===undefined)return null;
  if(typeof env.QA_BROWSER_IPC_ROOT!=='string'||!env.QA_BROWSER_IPC_ROOT.trim())throw Error('QA_BROWSER_IPC_ROOT must be an explicit non-empty project scratch path');
  return env.QA_BROWSER_IPC_ROOT;
}
async function cleanupClosedProfile(scratch){
  for(let attempt=0;;attempt++){
    try{return cleanupQaTempDir(scratch);}
    catch(error){
      if(process.platform!=='win32'||error.code!=='EPERM'||attempt===2)throw error;
      await delay(500*(attempt+1));
    }
  }
}
async function cleanupBrowserTemps(scratch,ipcScratch){
  let failure;
  for(const directory of [scratch,ipcScratch].filter(Boolean)){
    try{await cleanupClosedProfile(directory);}catch(error){failure??=error;}
  }
  if(failure)throw failure;
}
function launchQaBrowser(browserType,options={}){
  const launch=launches.then(async()=>{
    const root=configureQaTempEnvironment(),scratch=createQaTempDir('wh-browser-');
    let ipcScratch;
    try{
      const ipcRoot=browserIpcRoot();
      if(ipcRoot)ipcScratch=createQaTempDir('ipc-',{root:ipcRoot});
      // Keep Playwright profiles/artifacts in the original owned directory.
      // Only Chromium's child-side IPC socket directory needs a short path.
      for(const key of ['TMP','TEMP','TMPDIR'])process.env[key]=scratch;
      const childTemp=ipcScratch||scratch;
      const browser=await browserType.launch({...options,
        downloadsPath:options.downloadsPath||path.join(scratch,'downloads'),
        tracesDir:options.tracesDir||path.join(scratch,'traces'),
        env:{...process.env,...options.env,QA_TMP_ROOT:root,TMP:childTemp,TEMP:childTemp,TMPDIR:childTemp}});
      armQaExitCleanup(); // Playwright's own exit hook must kill its child first.
      const close=browser.close.bind(browser);let closing=false;
      const unregister=registerQaCleanup(()=>browser.close());
      browser.close=async(...args)=>{
        closing=true;let failure;
        try{return await close(...args);}catch(error){failure=error;throw error;}
        finally{unregister();try{await cleanupBrowserTemps(scratch,ipcScratch);}catch(error){if(!failure)throw error;}}
      };
      browser.once('disconnected',()=>{
        const timer=setTimeout(()=>{if(!closing)cleanupBrowserTemps(scratch,ipcScratch).catch(error=>console.error(error));},250);timer.unref();
      });
      return browser;
    }catch(error){try{await cleanupBrowserTemps(scratch,ipcScratch);}catch{}throw error;}
    finally{for(const key of ['TMP','TEMP','TMPDIR'])process.env[key]=root;}
  });
  launches=launch.catch(()=>{});return launch;
}
exports.launchQaBrowser=launchQaBrowser;
exports.browserIpcRoot=browserIpcRoot;
