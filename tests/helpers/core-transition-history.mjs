/** Historical transition evidence never borrows HEAD producer code or data. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createQaTempDir} from './qa-temp.mjs';

export const CORE_TRANSITION_COMMIT='913cfef538bc96b7f2d9b55e21995c631cabffeb';
const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const caches=new Map(),codecs=new Map();
const git=(root,args,options={})=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024,...options});
const safe=file=>{
 if(typeof file!=='string'||path.posix.isAbsolute(file)||file.includes('\\')||file.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Unsafe historical Core path '+String(file));
 return file;
};
export function readCoreTransitionFile(file,{repoRoot=defaultRoot}={}){
 file=safe(file);const key=path.resolve(repoRoot)+'\0'+file;
 if(!caches.has(key))caches.set(key,git(repoRoot,['show',CORE_TRANSITION_COMMIT+':'+file]));
 return Buffer.from(caches.get(key));
}

/** Only the historical codec and its enrolled lookup metadata are materialized. */
export function coreTransitionCodecRoot({repoRoot=defaultRoot}={}){
 const key=path.resolve(repoRoot);if(codecs.has(key))return codecs.get(key);
 const scratch=createQaTempDir('wh-core-transition-codec-');
 const files=git(repoRoot,['ls-tree','-r','--name-only','-z',CORE_TRANSITION_COMMIT],{encoding:'utf8'}).split('\0').filter(Boolean)
  .filter(file=>file.startsWith('books/shared/source-refs-v2/')||file==='books/source-ingestion-contract.json'||/^books\/[^/]+\/(?:sources\/source-manifest\.json|v2\/sources\/enrollment\.json)$/.test(file));
 for(const file of files){const target=path.join(scratch,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,readCoreTransitionFile(file,{repoRoot}));}
 codecs.set(key,scratch);return scratch;
}
export function readCoreTransitionJSON(file,{repoRoot=defaultRoot}={}){
 const codec=pathToFileURL(path.join(coreTransitionCodecRoot({repoRoot}),'books/shared/source-refs-v2/producer-io.mjs')).href;
 const script=`import fs from 'node:fs';import {parseProducerJSON} from ${JSON.stringify(codec)};process.stdout.write(JSON.stringify(parseProducerJSON(fs.readFileSync(0,'utf8'))));`;
 return JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',script],{input:readCoreTransitionFile(file,{repoRoot}),maxBuffer:128*1024*1024,encoding:'utf8'}));
}
export function createCoreTransitionCheckout({repoRoot=defaultRoot}={}){
 const folder=createQaTempDir('wh-core-transition-checkout-'),checkout=path.join(folder,'checkout');
 git(repoRoot,['clone','--local','--no-hardlinks','--no-checkout','--config','core.autocrlf=false',repoRoot,checkout]);
 git(checkout,['checkout','--detach',CORE_TRANSITION_COMMIT]);
 return{folder,checkout};
}
