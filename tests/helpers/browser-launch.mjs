import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {launchQaBrowser} from './qa-browser.cjs';
export {launchQaBrowser};

export const BROWSER_EXECUTABLE_ENV='WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH';

/** Classify private Chromium stderr without copying paths or message bodies. */
export function browserLaunchFailureDiagnostic(error,options={}){
  const message=String(error?.message||''),name=String(error?.name||'');
  const errorClass=['Error','TimeoutError','TypeError','RangeError','ReferenceError','SyntaxError'].includes(name)?name:'Error';
  const cause=/(?:socket.{0,100}(?:too long|ENAMETOOLONG)|(?:too long|ENAMETOOLONG).{0,100}socket)/is.test(message)?'UNIX_SOCKET_PATH_TOO_LONG':
    /ProcessSingleton|process_singleton/i.test(message)?'PROFILE_SINGLETON_FAILURE':
    /executable (?:doesn't|does not) exist|ENOENT/i.test(message)?'EXECUTABLE_UNAVAILABLE':
    /No usable sandbox|SUID sandbox|setuid sandbox/i.test(message)?'SANDBOX_UNAVAILABLE':
    /error while loading shared libraries|cannot open shared object file/i.test(message)?'SHARED_LIBRARY_UNAVAILABLE':
    errorClass==='TimeoutError'?'LAUNCH_TIMEOUT':'LAUNCH_FAILED';
  return {schema:'browser-launch-diagnostic/v1',phase:'browser-launch',status:'FAIL',errorClass,cause,
    tempPathBytes:Buffer.byteLength(String(options.env?.TMPDIR||options.env?.TEMP||''),'utf8')};
}

export function resolveChromiumLaunchOptions(env=process.env){
  const configured=String(env[BROWSER_EXECUTABLE_ENV]||'').trim();
  if(!configured)return Object.freeze({headless:true});
  const executablePath=path.resolve(configured);
  let stat;
  try{stat=fs.statSync(executablePath);}catch{
    throw new Error(`${BROWSER_EXECUTABLE_ENV} does not point to a readable browser executable: ${executablePath}`);
  }
  if(!stat.isFile())throw new Error(`${BROWSER_EXECUTABLE_ENV} must point to a browser executable file: ${executablePath}`);
  return Object.freeze({headless:true,executablePath});
}

export function launchChromium({env=process.env,launchOptions={}}={}){
  const observedChromium={launch:async options=>{
    try{return await chromium.launch(options);}
    catch(error){process.stderr.write('QA_BROWSER_LAUNCH_DIAGNOSTIC '+JSON.stringify(browserLaunchFailureDiagnostic(error,options))+'\n');throw error;}
  }};
  return launchQaBrowser(observedChromium,{...launchOptions,...resolveChromiumLaunchOptions(env)});
}
