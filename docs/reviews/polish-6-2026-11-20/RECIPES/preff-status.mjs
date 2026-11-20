import fs from 'node:fs';
const out='E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20';
const run=JSON.parse(fs.readFileSync(out+'/PRE_FF_RUN.json'));
const results=JSON.parse(fs.readFileSync(out+'/pre-ff/RESULTS.json')).results;
const fd=fs.openSync(out+'/pre-ff-console.log','r'),size=fs.fstatSync(fd).size,buffer=Buffer.alloc(Math.min(size,16384));
fs.readSync(fd,buffer,0,buffer.length,Math.max(0,size-buffer.length));fs.closeSync(fd);
const lines=buffer.toString('utf8').split(/\r?\n/).filter(line=>line.startsWith('[qa-queue]'));
console.log(JSON.stringify({status:run.status,completed:results.length,passed:results.filter(row=>row.status==='PASS').length,
 failed:results.filter(row=>row.status==='FAIL').map(({id,log})=>({id,log})),
 minutes:Math.round((Date.now()-Date.parse(run.started))/600)/100,current:lines.at(-1)}));
if(run.status!=='RUNNING')console.log(JSON.stringify(run));
