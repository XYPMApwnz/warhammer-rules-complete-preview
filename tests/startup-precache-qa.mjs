/** Startup requirements come from an independent parsed import/resource graph,
 * not the precache producer's hand-maintained lists. Large lazy payloads stay lazy. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createQaEvidenceDir} from './helpers/qa-temp.mjs';

const args=process.argv.slice(2),rootFlag=args.indexOf('--product-root');
if(args.length&&(rootFlag!==0||args.length!==2||!args[1]))throw Error('Usage: node tests/startup-precache-qa.mjs [--product-root <checkout>]');
const root=path.resolve(rootFlag<0?fileURLToPath(new URL('../',import.meta.url)):args[1]);
const helper=fileURLToPath(new URL('./helpers/startup-graph.mjs',import.meta.url));
const out=path.resolve(process.env.WH_STARTUP_PRECACHE_OUT||createQaEvidenceDir('wh-startup-precache-'));
fs.mkdirSync(out,{recursive:true});
const report={schema:'v2-startup-precache-qa/v1',root,checks:[]};
function assertCovered(graph,urls){
  const paths=new Set(urls.map(url=>decodeURIComponent(new URL(url,'https://startup.invalid/').pathname).slice(1)));
  const missing=graph.nodes.filter(node=>!paths.has(node.path));
  assert.equal(missing.length,0,'Missing mandatory startup precache: '+missing.map(node=>node.path+' (from '+node.firstOwner+')').join(', '));
}
try{
  const execution=spawnSync(process.execPath,['--experimental-vm-modules',helper,'--root',root],{encoding:'utf8',maxBuffer:8*1024*1024});
  assert.equal(execution.status,0,'Startup graph parser failed: '+execution.stderr);
  const graph=JSON.parse(execution.stdout);
  fs.writeFileSync(path.join(out,'GRAPH.json'),JSON.stringify(graph,null,2)+'\n');
  const {calculateCacheRevision}=await import(pathToFileURL(path.join(root,'tools/cache-revision.mjs')).href);
  const cache=calculateCacheRevision({root});
  assertCovered(graph,cache.urls);
  report.checks.push({name:'all-eager-startup-imports-and-resources-are-mandatory',status:'PASS',nodes:graph.nodes.length,edges:graph.edges.length});
  const critical='books/shared/rule-facts.js';
  assert(graph.nodes.some(node=>node.path===critical),'The eager graph must reach the keyword bridge implementation');
  const mutated=cache.urls.filter(url=>decodeURIComponent(new URL(url,'https://startup.invalid/').pathname).slice(1)!==critical);
  assert.equal(mutated.length,cache.urls.length-1,'Mutation must remove exactly the mandatory rule-facts entry');
  let mutationMessage;
  assert.throws(()=>assertCovered(graph,mutated),error=>{mutationMessage=error.message;return error.code==='ERR_ASSERTION'&&error.message.includes(critical);},'Removing a required startup resource must fail and identify that file');
  report.checks.push({name:'removed-startup-resource-is-rejected',status:'PASS',removed:critical,message:mutationMessage});
  const forbidden=cache.urls.filter(url=>/\/v2\/generated\/.*\.json(?:[?#]|$)|glossary\/v2\/generated\/.*\.(?:json|js)(?:[?#]|$)/.test(url));
  assert.deepEqual(forbidden,[],'Army Book and large glossary payloads must remain lazy');
  assert(graph.nodes.some(node=>node.path==='books/shared/source-refs-v2/source-catalog.json'),'The source registry must be present as a genuine static JSON dependency');
  assert.equal(graph.nodes.filter(node=>/^books\/[^/]+\/book\.config\.json$/.test(node.path)).length,9,'The graph must cover every native keyword passport');
  report.checks.push({name:'nine-passports-and-source-registry-covered-without-eager-book-payloads',status:'PASS'});
  report.status='PASS';report.precacheUrls=cache.urls.length;
  console.log('Startup precache PASS '+graph.nodes.length+' graph nodes, '+cache.urls.length+' mandatory URLs; removed-resource mutation rejected');
}catch(error){report.status='FAIL';report.error=error.stack;console.error(error.stack);process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'REPORT.json'),JSON.stringify(report,null,2)+'\n');console.log('Evidence '+out);}
