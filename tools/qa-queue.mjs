/** Explicit sequential QA gates. Every leaf retains its output, time and status. */
import fs from 'node:fs';
import {createQaTempDir,createQaEvidenceDir,getQaTmpRoot,qaTempEnvironment,sweepQaTempDirs,cleanupQaRunTemps,registerQaCleanup} from '../tests/helpers/qa-temp.mjs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2),option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(option('--root')||fileURLToPath(new URL('../',import.meta.url)));
const harnessRoot=fileURLToPath(new URL('../',import.meta.url));
const books={am:'adeptus-mechanicus',ba:'blood-angels',csm:'chaos-space-marines',da:'dark-angels',dg:'death-guard',ec:'emperors-children',sm:'space-marines',tau:'tau-empire',tyranids:'tyranids'};
const aliases={tyr:'tyranids'};
const acceptedBookKeys=[...Object.keys(books),...Object.keys(aliases)];
if(args.includes('--help')||args.includes('-h')){
 console.log('Usage: node tools/qa-queue.mjs <quick|pre-ff> [--books=<keys>] [--list] [--out=<external-directory>]');
 console.log('Accepted book keys: '+acceptedBookKeys.join(', ')+'. Alias: tyr = tyranids. Repeated books run once.');
 console.log('quick: selected books and shared checks; without --books, shared checks only. pre-ff: all books and full verification gates.');
 process.exit(0);
}
const mode=args[0];
if(!['quick','pre-ff'].includes(mode))throw Error('Use quick or pre-ff');
const requested=(option('--books')||'').split(',').filter(Boolean);
const unknown=requested.filter(b=>!Object.hasOwn(books,b)&&!Object.hasOwn(aliases,b));
if(unknown.length)throw Error('Unknown --books key: '+unknown.join(', ')+'. Accepted book keys: '+acceptedBookKeys.join(', '));
const selected=mode==='pre-ff'?Object.keys(books):[...new Set(requested.map(b=>aliases[b]||b))];
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
// Pre-FF rebuilds these exact outputs in generated:check; quick keeps its checks.
const replacedModelChecks=new Set(Object.values(books).filter(book=>book!=='death-guard')
 .map(book=>JSON.stringify(['books/shared/tools/build-new-recruit-model-names.mjs','--book='+book,'--check'])));
function node(file,extra=[]){const id=JSON.stringify([file,...extra]);if(mode==='pre-ff'&&replacedModelChecks.has(id))return;if(seen.has(id))return;seen.add(id);jobs.push({command:process.execPath,args:[file,...extra],id:file});}
function expand(script){for(const part of script.split(/\s*&&\s*/)){const tokens=part.trim().split(/\s+/);if(tokens[0]==='npm'&&tokens[1]==='run')expand(pkg.scripts[tokens[2]]);else if(tokens[0]==='node'&&tokens[1]==='tests/helpers/run-qa-suite.mjs')for(const entry of tokens.slice(2))entry.startsWith('npm:')?expand(pkg.scripts[entry.slice(4)]):node(entry);else if(tokens[0]==='node')node(tokens[1],tokens.slice(2));else throw Error('Unsupported QA entry: '+part);}}
jobs.push({command:'git',args:['diff','--check'],id:'git diff --check'});
node('tests/qa-temp-qa.mjs');
node('tests/book-passport-qa.mjs');
node('tests/official-updates-qa.mjs');
node('tests/official-update-books-qa.mjs');
node('tests/official-update-report-qa.mjs');
node('tests/official-update-integration-qa.mjs');
  node('tests/official-effect-review-qa.mjs');
  node('tests/current-gw-contract-qa.mjs');
node('books/core-rules/tests/core-importer-candidate-qa.mjs');
node('books/core-rules/tests/core-importer-isolation-qa.mjs');
if(mode==='quick')expand(pkg.scripts['qa:workflow']);
for(const b of selected)expand(pkg.scripts['qa:'+b]);
for(const name of ['qa:effects','qa:roster','qa:integration',...(mode==='pre-ff'?['qa:workflow']:[])])expand(pkg.scripts[name]);
node('tests/source-book-clone-qa.mjs',['--root='+root]);
if(!fs.existsSync(path.join(root,'tests/source-book-clone-qa.mjs')))jobs.at(-1).args[0]=path.join(harnessRoot,'tests/source-book-clone-qa.mjs');
node('books/shared/source-refs-v2/source-catalog-qa.mjs');
if(mode==='pre-ff'){
 node('v2/unit-recipient-scope-qa.mjs');
 node('tests/book-update-declarations-qa.mjs');
 node('tests/book-update-report-qa.mjs');
 node('tests/book-update-snapshots-qa.mjs');
 node('tests/book-update-metadata-qa.mjs');
 node('tests/book-update-command-qa.mjs');
 node('tests/mfm-release-history-qa.mjs');
 node('tests/mfm-update-qa.mjs');
 node('tests/source-catalog-registry-qa.mjs');
 node('tests/source-catalog-additions-qa.mjs');
 node('books/core-rules/tests/factual-ownership-qa.mjs');
 node('books/core-rules/tests/core-waha-certification-qa.mjs');
 node('glossary/v2/tests/core-projection-qa.mjs');
 node('books/core-rules/tests/term-bindings-qa.mjs');
 node('books/core-rules/tests/reader-see-also-regression-qa.mjs');
 node('books/core-rules/tests/core-faq-anchor-qa.mjs');
 node('tests/generated-rebuild-qa.mjs');
 node('tests/csm-model-alias-bootstrap-qa.mjs');
 node('tests/source-review-execution-book-qa.mjs');
 expand(pkg.scripts['generated:check']);
 // Worker-enabled presentation QA needs a version-consistent publication,
 // not edited source files paired with the checkout's old cache inventory.
 node('tools/pages-runtime-package.mjs',['--source',root,'--out',path.join(work,'runtime')]);
 expand(pkg.scripts['test:browser']);
 // Each fixture is admitted once by the existing recipient browser runner.
 node('v2/dg-am-recipient-enrollment-browser-qa.mjs',['--fixtures=v2/fixtures/sm-da-recipient-gaps-v1-browser.json']);
 node('v2/dg-am-recipient-enrollment-browser-qa.mjs',['--fixtures=v2/fixtures/csm-tau-recipient-gaps-v1-browser.json']);
 node('books/core-rules/tests/core-switch-browser-qa.mjs');
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
 const publishedRoot=path.join(work,'runtime');
 const browserRoots=mode!=='pre-ff'?{}:job.id==='v2/detachment-recipient-browser-qa.mjs'?{F1_BROWSER_ROOT:publishedRoot}:
  job.id==='v2/card-recipient-browser-qa.mjs'?{F2_BROWSER_ROOT:publishedRoot}:{};
 const child=spawn(job.command,profile?['--cpu-prof','--cpu-prof-interval=10000','--cpu-prof-dir='+out,...job.args]:job.args,{cwd:root,
  env:{...qaTempEnvironment(),...browserRoots,QA_EVIDENCE_DIR:childEvidence},stdio:['ignore','pipe','pipe']});
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
