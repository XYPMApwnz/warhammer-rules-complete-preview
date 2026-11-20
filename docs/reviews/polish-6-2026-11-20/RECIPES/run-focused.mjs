import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root='E:/Warhammer/worktrees/polish-6-v1',out='E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20';
const group=process.argv[2]||'pure';
const groups={
 pure:[
  ['source-metadata',['books/shared/application-v2/source-metadata-qa.mjs']],
  ['model-base-caption',['books/shared/army-book-app-v2/model-base-caption-qa.mjs']],
  ['import-notices-all-books',['books/shared/army-book-app-v2/import-notices-qa.mjs']],
  ['term-visibility',['books/shared/army-book-app-v2/rule-term-visibility-qa.mjs']],
  ['navigation-geometry',['books/shared/army-book-app-v2/navigation-geometry-qa.mjs']],
  ['term-matcher',['books/shared/army-book-app-v2/rule-term-links-qa.mjs']],
  ['roster-navigation',['books/shared/army-book-app-v2/roster-navigation-qa.mjs']],
  ['import-copy',['books/shared/army-book-app-v2/import-messages-qa.mjs']],
  ['startup-precache',['tests/startup-precache-qa.mjs']],
 ],
 browser:[
  ['library-sources',['v2/library-sources-browser-qa.mjs','--out='+out+'/library-sources']],
  ['import-notices',['v2/import-notices-browser-qa.mjs','--out='+out+'/import-notices']],
  ['header-existing',['v2/card-texts-browser-qa.mjs','--case=headers']],
  ['lazy-link-parity',['v2/lazy-glossary-browser-qa.mjs','--base=E:/Warhammer/qa-tmp/polish-6/runtime-50','--out='+out+'/lazy-link-parity']],
  ['rule-popups-existing',['v2/rule-popups-browser-qa.mjs','--out='+out+'/rule-popups-existing']],
 ],
};
groups['browser-rest']=groups.browser.slice(1);
groups['popup-final']=groups.browser.slice(-1);
if(!groups[group])throw Error('Unknown group');
const results=[],file=out+'/focused/'+group+'.json';fs.mkdirSync(path.dirname(file),{recursive:true});
for(const [id,args]of groups[group]){
 console.log('START '+id);const started=Date.now();
 const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,env:{...process.env,
 QA_TMP_ROOT:'E:/Warhammer/qa-tmp/polish-6',QA_SKIP_TMP_SWEEP:'1',
 WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe',
 WH_STARTUP_PRECACHE_OUT:out+'/startup-final'}});
 const log=out+'/focused/'+group+'-'+id+'.log';fs.writeFileSync(log,(r.stdout||'')+(r.stderr||''));
 results.push({id,args,status:r.status===0?'PASS':'FAIL',exitCode:r.status,elapsedMs:Date.now()-started,log});
 fs.writeFileSync(file,JSON.stringify({group,results},null,2)+'\n');console.log(JSON.stringify(results.at(-1)));
 if(r.status!==0){console.log((r.stdout||'').slice(-1500)+(r.stderr||'').slice(-5000));process.exitCode=1;break;}
}
