import {getQaTmpRoot} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {BROWSER_EXECUTABLE_ENV,launchChromium,resolveChromiumLaunchOptions} from './helpers/browser-launch.mjs';
import {extractControllerClass} from './helpers/controller-source-extraction.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const controllerCases=[
  ['NavigationController','DGNavigation','books/shared/controllers/navigation-controller.js'],
  ['PopupController','DGPopups','books/shared/controllers/popup-controller.js']
];

for(const [className,globalName,relative] of controllerCases){
  const source=fs.readFileSync(path.join(root,relative),'utf8').replace(/\r\n/g,'\n');
  const lf=extractControllerClass(source,className,globalName);
  const crlf=extractControllerClass(source.replace(/\n/g,'\r\n'),className,globalName);
  assert.ok(lf,`${className} extraction must find the exact controller boundary`);
  assert.equal(crlf,lf,`${className} extraction must be identical under LF and CRLF`);
  assert.doesNotThrow(()=>Function(`"use strict";return (${lf});`)(),`${className} extraction must parse`);
}

assert.deepEqual(resolveChromiumLaunchOptions({}),{headless:true},'default launch must use Playwright-managed Chromium');
const managed=await launchChromium({env:{}});
await managed.close();

const executablePath=chromium.executablePath();
assert.equal(resolveChromiumLaunchOptions({[BROWSER_EXECUTABLE_ENV]:executablePath}).executablePath,path.resolve(executablePath),'explicit browser override must be accepted');

const missing=path.join(getQaTmpRoot(),'qa-h1-missing-browser-executable');
assert.throws(()=>resolveChromiumLaunchOptions({[BROWSER_EXECUTABLE_ENV]:missing}),new RegExp(`${BROWSER_EXECUTABLE_ENV} does not point to a readable browser executable`),'invalid override must fail clearly');

console.log('QA-H1 portability QA: PASS (LF/CRLF extraction, managed Chromium default, explicit override, invalid override).');
