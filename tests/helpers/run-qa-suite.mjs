/** Run existing QA processes sequentially and retain every exit status.
 * A failed upstream check must not hide mandatory downstream coverage. */
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {qaTempEnvironment,cleanupQaRunTemps} from './qa-temp.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const entries=process.argv.slice(2),results=[];
if(!entries.length)throw new Error('Provide Node test paths or npm:<script> entries');
for(const entry of entries){
  console.log(`[qa-suite] START ${entry}`);
  const npm=entry.startsWith('npm:');
  if(npm&&!process.env.npm_execpath){
    console.error('Nested npm checks must be launched through npm run');
    results.push({entry,status:'FAIL',exitCode:null,error:'Missing npm_execpath'});
    continue;
  }
  const args=npm?[process.env.npm_execpath,'run',entry.slice(4)]:[path.resolve(root,entry)];
  const child=spawnSync(process.execPath,args,{cwd:root,env:qaTempEnvironment(),stdio:'inherit'});
  cleanupQaRunTemps();
  const passed=child.status===0&&!child.error;
  results.push({entry,status:passed?'PASS':'FAIL',exitCode:child.status,
    ...(child.signal?{signal:child.signal}:{}),...(child.error?{error:child.error.message}:{})});
  console.log(`[qa-suite] ${passed?'PASS':'FAIL'} ${entry} (exit ${child.status})`);
}
const status=results.every(result=>result.status==='PASS')?'PASS':'FAIL';
console.log('QA_SUITE_RESULT '+JSON.stringify({status,results}));
process.exitCode=status==='PASS'?0:1;
