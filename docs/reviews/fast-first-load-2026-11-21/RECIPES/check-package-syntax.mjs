import fs from 'node:fs';import path from 'node:path';
import {assertBrowserSource,BROWSER_SYNTAX_TARGETS} from 'file:///E:/Warhammer/worktrees/fast-first-load-v1/tools/browser-compatibility.mjs';
const root='E:/Warhammer/qa-tmp/fast-first-load/package-final-c4',out='E:/Warhammer/qa-evidence/fast-first-load-v1-2026-11-21';
const manifest=JSON.parse(fs.readFileSync(root+'/PAGES_RUNTIME_MANIFEST.json')),modules=[],inline=[];
for(const {path:file} of manifest.files){
 const source=()=>fs.readFileSync(path.join(root,file),'utf8');
 if(/\.(?:mjs|js)$/.test(file)){assertBrowserSource(source(),file);modules.push(file);}
 if(file.endsWith('.html')){let n=0;for(const block of source().matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
  if(/\bsrc\s*=|\btype\s*=\s*["'](?:application\/ld\+json|application\/json)["']/i.test(block[1])||!block[2].trim())continue;
  const name=file+'#inline-'+(++n);assertBrowserSource(block[2],name);inline.push(name);
 }}
}
const report={status:'PASS',runtimeContentSha256:manifest.contentSha256,targets:BROWSER_SYNTAX_TARGETS,modules:modules.length,inlineScripts:inline.length,scope:'Exact published bodies and inline scripts; existing target guard reused, no transpilation. Runtime API/actual Safari engine validation is separate.'};
fs.writeFileSync(out+'/PACKAGE_SYNTAX.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
