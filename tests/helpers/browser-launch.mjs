import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {launchQaBrowser} from './qa-browser.cjs';
export {launchQaBrowser};

export const BROWSER_EXECUTABLE_ENV='WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH';

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
  return launchQaBrowser(chromium,{...launchOptions,...resolveChromiumLaunchOptions(env)});
}
