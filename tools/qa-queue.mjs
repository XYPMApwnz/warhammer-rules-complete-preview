/** Explicit sequential QA gates. Every leaf retains its output, time and status. */
import fs from 'node:fs';
import {createQaTempDir,createQaEvidenceDir,getQaTmpRoot,qaTempEnvironment,sweepQaTempDirs,cleanupQaRunTemps,registerQaCleanup} from '../tests/helpers/qa-temp.mjs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2),option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(option('--root')||fileURLToPath(new URL('../',import.meta.url)));
const harnessRoot=fileURLToPath(new URL('../',import.meta.url));
const mode=args[0];
if(!['quick','pre-ff'].includes(mode))throw Error('Use quick or pre-ff');
const books={am:'adeptus-mechanicus',ba:'blood-angels',csm:'chaos-space-marines',da:'dark-angels',dg:'death-guard',ec:'emperors-children',sm:'space-marines',tau:'tau-empire',tyranids:'tyranids'};
const selected=mode==='pre-ff'?Object.keys(books):(option('--books')||'').split(',').filter(Boolean);
if(new Set(selected).size!==selected.length||selected.some(b=>!books[b]))throw Error('Unknown or duplicate --books');
if(!args.includes('--list')&&process.env.QA_SKIP_TMP_SWEEP!=='1'){
 const sweep=sweepQaTempDirs();console.log('[qa-temp] Sweep '+JSON.stringify(sweep));
 if(sweep.errors.length)throw Error('QA temporary sweep could not clean owned stale directories');
}
const out=path.resolve(option('--out')||(args.includes('--list')?path.join(getQaTmpRoot(),'qa-plan'):createQaEvidenceDir('wh-qa-'+mode+'-')));
const work=args.includes('--list')?path.join(getQaTmpRoot(),'qa-plan-work'):createQaTempDir('wh-qa-'+mode+'-work-');
if(out===root||out.startsWith(root+path.sep))throw Error('QA evidence must be outside the checkout');
if(!args.includes('--list')){
 if(fs.existsSync(path.join(out,'RESULTS.json')))throw Error('Use a fresh output directory; previous evidence must not be overwritten');
 fs.mkdirSync(out,{recursive:true});
}
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'))),jobs=[],seen=new Set();
function node(file,extra=[]){const id=JSON.stringify([file,...extra]);if(seen.has(id))return;seen.add(id);jobs.push({command:process.execPath,args:[file,...extra],id:file});}
function expand(script){for(const part of script.split(/\s*&&\s*/)){const tokens=part.trim().split(/\s+/);if(tokens[0]==='npm'&&tokens[1]==='run')expand(pkg.scripts[tokens[2]]);else if(tokens[0]==='node'&&tokens[1]==='tests/helpers/run-qa-suite.mjs')for(const entry of tokens.slice(2))entry.startsWith('npm:')?expand(pkg.scripts[entry.slice(4)]):node(entry);else if(tokens[0]==='node')node(tokens[1],tokens.slice(2));else throw Error('Unsupported QA entry: '+part);}}
jobs.push({command:'git',args:['diff','--check'],id:'git diff --check'});
node('tests/qa-temp-qa.mjs');
if(mode==='quick')expand(pkg.scripts['qa:workflow']);
for(const b of selected)expand(pkg.scripts['qa:'+b]);
for(const name of ['qa:effects','qa:roster','qa:integration',...(mode==='pre-ff'?['qa:workflow']:[])])expand(pkg.scripts[name]);
node('tests/source-book-clone-qa.mjs',['--root='+root]);
if(!fs.existsSync(path.join(root,'tests/source-book-clone-qa.mjs')))jobs.at(-1).args[0]=path.join(harnessRoot,'tests/source-book-clone-qa.mjs');
node('books/shared/source-refs-v2/source-catalog-qa.mjs');
if(mode==='pre-ff'){
 expand(pkg.scripts['test:browser']);
 node('tools/pages-runtime-package.mjs',['--source',root,'--out',path.join(work,'runtime')]);
 node('tools/pages-runtime-package-qa.mjs',['--source',root,'--published',path.join(work,'runtime'),'--work',path.join(work,'packaging')]);
 for(const f of ['tests/source-enrollment-qa.mjs','books/shared/tools/source-freshness.mjs','tests/source-ingestion-contract-qa.mjs','books/shared/army-book-app-v2/keyword-attribution-qa.mjs'])node(f);
}
if(args.includes('--list')){console.log(JSON.stringify(jobs,null,2));process.exit(0);}
const started=Date.now(),results=[];
for(const [i,job]of jobs.entries()){
 const log=path.join(out,String(i+1).padStart(2,'0')+'-'+path.basename(job.id).replace(/[^\w.-]/g,'_')+'.log'),fd=fs.openSync(log,'w'),begin=Date.now();
 console.log(`[qa-queue] ${i+1}/${jobs.length} START ${job.id}`);
 const profile=option('--profile')==='true'&&/books\/(space-marines|tau-empire|blood-angels)\/v2\/roster/.test(job.id);
 const childEvidence=path.join(out,String(i+1).padStart(2,'0')+'-'+path.basename(job.id).replace(/[^\w.-]/g,'_')+'-evidence');
 const child=spawn(job.command,profile?['--cpu-prof','--cpu-prof-interval=10000','--cpu-prof-dir='+out,...job.args]:job.args,{cwd:root,
  env:{...qaTempEnvironment(),QA_EVIDENCE_DIR:childEvidence},stdio:['ignore','pipe','pipe']});
 const unregister=registerQaCleanup(()=>new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('close',resolve);child.kill('SIGTERM');}));
 for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{fs.writeSync(fd,chunk);process.stdout.write(chunk);});
 const timer=setInterval(()=>console.log(`[qa-queue] RUNNING ${job.id} ${Math.round((Date.now()-begin)/1000)}s`),30000);
 const result=await new Promise(resolve=>{child.on('error',error=>resolve({exitCode:null,error:error.message}));child.on('close',(exitCode,signal)=>resolve({exitCode,signal}));});
 clearInterval(timer);fs.closeSync(fd);unregister();cleanupQaRunTemps();
 for(const [source,name]of [[path.join(work,'runtime/PAGES_RUNTIME_MANIFEST.json'),'RUNTIME_MANIFEST.json'],
  [path.join(work,'packaging/RESULTS.json'),'PACKAGING_RESULTS.json']])if(fs.existsSync(source))fs.copyFileSync(source,path.join(out,name));
 results.push({...job,...result,status:result.exitCode===0?'PASS':'FAIL',elapsedMs:Date.now()-begin,log});
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({mode,root,elapsedMs:Date.now()-started,results},null,2)+'\n');
 console.log(`[qa-queue] ${results.at(-1).status} ${job.id} ${results.at(-1).elapsedMs}ms`);
}
console.log('QA_QUEUE_RESULT '+JSON.stringify({out,elapsedMs:Date.now()-started,passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length}));
process.exitCode=results.every(r=>r.status==='PASS')?0:1;
