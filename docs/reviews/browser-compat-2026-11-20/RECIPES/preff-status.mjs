import fs from 'node:fs';
const out='E:/Warhammer/qa-evidence/browser-compat-v1-2026-11-20';
const run=JSON.parse(fs.readFileSync(out+'/PRE_FF_RUN.json'));
const results=JSON.parse(fs.readFileSync(out+'/pre-ff/RESULTS.json')).results;
const fd=fs.openSync(out+'/pre-ff-console.log','r'),size=fs.fstatSync(fd).size,buffer=Buffer.alloc(Math.min(size,16384));
fs.readSync(fd,buffer,0,buffer.length,Math.max(0,size-buffer.length));fs.closeSync(fd);
const lines=buffer.toString('utf8').split(/\r?\n/).filter(line=>line.startsWith('[qa-queue]'));
console.log(JSON.stringify({status:run.status,completed:results.length,passed:results.filter(row=>row.status==='PASS').length,
 failed:results.filter(row=>row.status==='FAIL').map(({id,log})=>({id,log})),
 minutes:Math.round((Date.now()-Date.parse(run.started))/600)/100,current:lines.at(-1)}));
if(run.status!=='RUNNING')console.log(JSON.stringify(run));

const generatedLog=out+'/pre-ff/156-check-generated-rebuild.mjs.log';
if(run.status==='RUNNING'&&lines.at(-1)?.includes('check-generated-rebuild')&&fs.existsSync(generatedLog)){const handle=fs.openSync(generatedLog,'r'),length=fs.fstatSync(handle).size,tail=Buffer.alloc(Math.min(length,65536));fs.readSync(handle,tail,0,tail.length,Math.max(0,length-tail.length));fs.closeSync(handle);const progress=tail.toString().split(/\r?\n/).filter(line=>line.startsWith('[generated:check]')&&line.includes('BUILD')).at(-1);if(progress)console.log(progress);}
