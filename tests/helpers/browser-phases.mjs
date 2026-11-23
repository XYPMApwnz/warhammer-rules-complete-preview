/** Node-side deadlines for browser work; phase evidence contains no page text. */
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';

const phases=new Set(['browser-launch','context-open','page-open','book-open','frame-sync','contents-title','contents-before','contents-navigate','contents-settle','contents-diagnostics','contents-geometry','screenshot','boundary-list','boundary-before','boundary-ready','boundary-after','snapshot','select-card','dialog-open','dialog-links','dialog-close','failure-state','context-close','browser-close','server-close']);
const books=new Set(['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','death-guard','emperors-children','space-marines','tau-empire','tyranids']);

export function createBrowserPhases(file){
  const observations=[],counts={};let totalCount=0;
  function details(value){
    const result={};
    for(const key of Object.keys(value))if(!['book','width','ordinal'].includes(key))throw Error('Unknown browser phase field');
    if(value.book!==undefined){if(!books.has(value.book))throw Error('Unknown browser phase book');result.book=value.book;}
    if(value.width!==undefined){if(!Number.isSafeInteger(value.width)||value.width<1||value.width>10000)throw Error('Invalid browser phase width');result.width=value.width;}
    if(value.ordinal!==undefined){if(!Number.isSafeInteger(value.ordinal)||value.ordinal<1||value.ordinal>10000)throw Error('Invalid browser phase ordinal');result.ordinal=value.ordinal;}
    return result;
  }
  const save=()=>{if(file)fs.writeFileSync(file,JSON.stringify({schema:'browser-phases/v1',totalCount,counts,observations},null,2)+'\n');};
  async function run(phase,operation,context={},timeoutMs=30000){
    if(!phases.has(phase))throw Error('Unknown browser phase');
    if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw Error('Invalid browser phase deadline');
    const entry={phase,...details(context),status:'START',elapsedMs:0};
    const count=counts[phase]??={started:0,passed:0,failed:0,timedOut:0,elapsedMs:0};
    count.started++;totalCount++;observations.push(entry);if(observations.length>128)observations.shift();save();
    const started=performance.now();let timer,timedOut=false;
    try{
      const result=await Promise.race([Promise.resolve().then(operation),new Promise((_,reject)=>{timer=setTimeout(()=>{timedOut=true;const error=new Error('QA_BROWSER_PHASE_TIMEOUT');error.code='QA_BROWSER_PHASE_TIMEOUT';reject(error);},timeoutMs);})]);
      entry.status='PASS';count.passed++;return result;
    }catch(error){entry.status=timedOut?'TIMEOUT':'FAIL';count[timedOut?'timedOut':'failed']++;throw error;}
    finally{clearTimeout(timer);entry.elapsedMs=Math.round(performance.now()-started);count.elapsedMs+=entry.elapsedMs;save();}
  }
  return {run,observations,counts,get totalCount(){return totalCount;}};
}
