/** Test-only heartbeat stays responsive while a synchronous oracle is busy. */
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
export function qaProgress(name){
 const start=performance.now();
 const worker=new Worker(`const {parentPort,workerData}=require('node:worker_threads');const fs=require('node:fs');let phase='initialization';parentPort.on('message',value=>phase=value);setInterval(()=>fs.writeSync(1,'[qa-progress] '+workerData+' '+phase+'\\n'),25000);`,{eval:true,workerData:name});
 worker.unref();
 const progress=(group,count='')=>{worker.postMessage(group+' '+count);console.log(`[qa-profile] ${name} ${group} ${count} ${Math.round(performance.now()-start)}ms`);};
 progress.close=()=>worker.terminate();
 return progress;
}
