/** Audit-only shared HTTPS CONNECT shaper. No TLS interception or app edits. */
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import {createHash,X509Certificate} from 'node:crypto';
import {createResponder,bodyFor} from './runtime-server.mjs';
export const PREFIX='/warhammer-rules-complete-preview/';
// Fast downstream delay compensates the measured Windows timer/relay overhead;
// short-request calibration records the achieved RTT, not just these timer inputs.
export const NETWORKS={unlimited:{bitsPerSecond:0,rttMs:0,upDelayMs:0,downDelayMs:0},fast4g:{bitsPerSecond:9000000,rttMs:170,upDelayMs:85,downDelayMs:70},slow4g:{bitsPerSecond:1600000,rttMs:150,upDelayMs:75,downDelayMs:75}};
export async function startLocal({packageRoot,label='fast-first-load measurement'}={}){
 if(!packageRoot)throw new TypeError('An explicit packageRoot is required');
 const root=path.resolve(packageRoot);
 const records=[],legacy={condition:null};
 const responder=createResponder(()=>({label,root}),{prefix:PREFIX,records,shape:()=>legacy.condition});
 const key=fs.readFileSync('E:/Warhammer/qa-tmp/preview-v1/tls/server.key'),cert=fs.readFileSync('E:/Warhammer/qa-tmp/preview-v1/tls/server.pem');
 const leaf=new X509Certificate(cert),spki=createHash('sha256').update(leaf.publicKey.export({format:'der',type:'spki'})).digest('base64');
 // Audit-origin correction: Node's 10 MiB default session budget rejects
 // concurrently queued DG PNG streams on a shaped link (ENHANCE_YOUR_CALM).
 // This transport limit is not a Pages/app policy. Keep all runtime bytes intact.
 const server=responder.http2({key,cert,maxSessionMemory:128});
 // Calibration resources exist only in the observation server, outside the app.
 server.removeAllListeners('request');server.on('request',(req,res)=>{
  const url=new URL(req.url,'https://local');
  if(url.pathname===PREFIX+'__audit/calibration.html'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'}).end('<!doctype html><title>Transport calibration</title><p>Audit transport calibration</p>');return;}
  if(url.pathname===PREFIX+'__audit/calibration-sw.js'){res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'}).end("self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('message',e=>e.waitUntil(fetch(e.data.url,{cache:'no-store'}).then(r=>r.arrayBuffer()).then(b=>e.ports[0].postMessage({bytes:b.byteLength}))));");return;}
  responder.handler(req,res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='https://127.0.0.1:'+server.address().port+PREFIX;
 return{base,spki,records,legacy,prewarm(){const m=JSON.parse(fs.readFileSync(path.join(root,'PAGES_RUNTIME_MANIFEST.json')));for(const row of m.files)bodyFor(root,row.path);bodyFor(root,'PAGES_RUNTIME_MANIFEST.json');},
  get pending(){return responder.pending;},async close(){responder.close();await new Promise(resolve=>server.close(resolve));}};
}
export async function startProxy(){
 let condition=NETWORKS.unlimited,tokens=0,last=performance.now(),serial=0;
 const sockets=new Set(),connections=[],downstream=[];
 const server=http.createServer((_req,res)=>res.writeHead(405).end());
 const timer=setInterval(()=>{
  const now=performance.now(),rate=condition.bitsPerSecond/8;
  tokens=rate?Math.min(rate*.025,tokens+rate*(now-last)/1000):Infinity;last=now;
  let turns=downstream.length;
  while(turns--&&downstream.length&&tokens>=1){const state=downstream.shift();if(state.client.destroyed||!state.queue.length){state.scheduled=false;state.queued=0;continue;}
   let sent=0;
   // Drain ready TLS fragments within this connection's fair turn. One fragment
   // per timer tick would invent latency for small H2 headers/END_STREAM frames.
   while(state.queue.length&&tokens>=1&&sent<65536&&state.client.writableLength<=262144){
    const row=state.queue[0];if(now<row.at)break;
    const count=Math.min(row.buffer.length-row.offset,65536-sent,Math.floor(tokens));
    state.client.write(row.buffer.subarray(row.offset,row.offset+count));row.offset+=count;tokens-=count;sent+=count;state.queued-=count;state.record.downstreamBytes+=count;state.record.lastByteEpoch=Date.now();
    if(row.offset===row.buffer.length)state.queue.shift();
   }
   if(state.queue.length)downstream.push(state);else state.scheduled=false;
   const bufferLimit=Math.max(65536,condition.bitsPerSecond/8*condition.rttMs/1000+65536);
   if(state.queued<bufferLimit/2&&!state.upstream.destroyed)state.upstream.resume();
  }
 },5);timer.unref();
 server.on('connect',(request,client,head)=>{
  client.setNoDelay(true);
  const address=new URL('https://'+request.url),host=address.hostname,port=Number(address.port||443);
  if(!['127.0.0.1','localhost','xypmapwnz.github.io'].includes(host)){client.end('HTTP/1.1 403 Forbidden\r\n\r\n');return;}
  const record={id:++serial,host,port,startedEpoch:Date.now(),upstreamBytes:0,downstreamBytes:0,closedEpoch:null},state={queued:0,queue:[],scheduled:false,client,record};connections.push(record);
  const upstream=net.connect({host,port,highWaterMark:16384});upstream.setNoDelay(true);state.upstream=upstream;sockets.add(upstream);sockets.add(client);
  const sendUp=buffer=>{record.upstreamBytes+=buffer.length;if(!condition.upDelayMs){if(!upstream.destroyed)upstream.write(buffer);}else setTimeout(()=>{if(!upstream.destroyed)upstream.write(buffer);},condition.upDelayMs);};
  upstream.once('connect',()=>{client.write('HTTP/1.1 200 Connection Established\r\n\r\n');if(head.length)sendUp(head);});
  client.on('data',sendUp);
  upstream.on('data',buffer=>{
   if(!condition.bitsPerSecond&&!condition.rttMs){record.downstreamBytes+=buffer.length;record.lastByteEpoch=Date.now();if(!client.write(buffer))upstream.pause();return;}
   state.queued+=buffer.length;record.maxBufferedBytes=Math.max(record.maxBufferedBytes||0,state.queued);state.queue.push({buffer,offset:0,at:performance.now()+condition.downDelayMs});if(!state.scheduled){state.scheduled=true;downstream.push(state);}
   if(state.queued>Math.max(65536,condition.bitsPerSecond/8*condition.rttMs/1000+65536))upstream.pause();
  });
  client.on('drain',()=>{if(!condition.bitsPerSecond&&!condition.rttMs)upstream.resume();});
  // TCP end follows queued bytes, not merely receipt of the server's FIN.
  upstream.on('end',()=>{const close=()=>{if(client.destroyed)return;if(state.queued)setTimeout(close,10);else client.end();};close();});
  const finish=()=>{record.closedEpoch??=Date.now();sockets.delete(client);sockets.delete(upstream);client.destroy();upstream.destroy();};
  client.on('close',finish);client.on('error',finish);upstream.on('error',error=>{record.error=error.code||error.message;finish();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return{url:'http://127.0.0.1:'+server.address().port,connections,setCondition(value){condition=value;tokens=0;last=performance.now();},
  snapshot(){return{downstreamBytes:connections.reduce((n,r)=>n+r.downstreamBytes,0),upstreamBytes:connections.reduce((n,r)=>n+r.upstreamBytes,0),active:sockets.size,queuedBytes:downstream.reduce((n,r)=>n+r.queued,0)};},
  async close(){clearInterval(timer);for(const socket of sockets)socket.destroy();await new Promise(resolve=>server.close(resolve));}};
}
