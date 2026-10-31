/** Resource lifecycle only; browser type and test launch options are preserved. */
const path=require('node:path');
const {createQaTempDir,configureQaTempEnvironment,cleanupQaTempDir,registerQaCleanup,armQaExitCleanup}=require('./qa-temp.cjs');
let launches=Promise.resolve();
function launchQaBrowser(browserType,options={}){
  const launch=launches.then(async()=>{
    const root=configureQaTempEnvironment(),scratch=createQaTempDir('wh-browser-');
    // Playwright allocates its profile/artifact directories in the Node parent
    // before spawning Chromium. Give that allocation an owned parent too.
    for(const key of ['TMP','TEMP','TMPDIR'])process.env[key]=scratch;
    try{
      const browser=await browserType.launch({...options,
        downloadsPath:options.downloadsPath||path.join(scratch,'downloads'),
        tracesDir:options.tracesDir||path.join(scratch,'traces'),
        env:{...process.env,...options.env,QA_TMP_ROOT:root,TMP:scratch,TEMP:scratch,TMPDIR:scratch}});
      armQaExitCleanup(); // Playwright's own exit hook must kill its child first.
      const close=browser.close.bind(browser);let closed=false;
      const unregister=registerQaCleanup(()=>browser.close());
      browser.close=async(...args)=>{
        try{return await close(...args);}finally{closed=true;unregister();cleanupQaTempDir(scratch);}
      };
      browser.once('disconnected',()=>{
        const timer=setTimeout(()=>{if(!closed)cleanupQaTempDir(scratch);},250);timer.unref();
      });
      return browser;
    }catch(error){cleanupQaTempDir(scratch);throw error;}
    finally{for(const key of ['TMP','TEMP','TMPDIR'])process.env[key]=root;}
  });
  launches=launch.catch(()=>{});return launch;
}
exports.launchQaBrowser=launchQaBrowser;
