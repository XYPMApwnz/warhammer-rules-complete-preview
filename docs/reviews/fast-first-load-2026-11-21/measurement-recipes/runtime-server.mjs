import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import http2 from 'node:http2';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.cer':'application/x-x509-ca-cert'};
export const compressible=file=>/\.(html|mjs|js|css|json|svg|txt|webmanifest)$/.test(file);
const bodies=new Map();
const gzipRoots=new Map();
export const registerGzipRoot=(root,gzipRoot)=>gzipRoots.set(path.resolve(root),gzipRoot);
export function bodyFor(root,relative){
 const key=path.join(root,relative);let body=bodies.get(key);
 if(!body){const raw=fs.readFileSync(key),cached=gzipRoots.has(path.resolve(root))?path.join(gzipRoots.get(path.resolve(root)),relative+'.gz'):null;body={raw,gzip:compressible(relative)?cached&&fs.existsSync(cached)?fs.readFileSync(cached):gzipSync(raw,{level:6}):null,sha256:createHash('sha256').update(raw).digest('hex')};bodies.set(key,body);}
 return body;
}
/** Origin-level shaping includes service-worker requests as well as page traffic.
 * One shared 9 Mbps bucket, 170 ms response latency; no CPU slowdown. */
export function createResponder(rootProvider,{prefix='/',records=[],shape=()=>null,publicCA=null}={}){
 const pending=new Set(),streams=[];let tokens=0,last=performance.now();
 const timer=setInterval(()=>{
  const now=performance.now(),condition=shape(),bps=condition?.downloadBps||Infinity;
  tokens=Number.isFinite(bps)?Math.min(bps*.05,tokens+bps*(now-last)/1000):Infinity;last=now;
  for(let n=streams.length;n>0&&tokens>=1;n--){const stream=streams.shift();if(stream.response.destroyed){pending.delete(stream);continue;}
   const size=Math.min(16384,stream.body.length-stream.offset,Math.floor(tokens));
   if(size){stream.response.write(stream.body.subarray(stream.offset,stream.offset+size));stream.offset+=size;tokens-=size;}
   if(stream.offset===stream.body.length)stream.response.end();else streams.push(stream);
  }
 },10);timer.unref();
 const handler=(request,response)=>{
  const started=performance.now(),snapshot=rootProvider(),record={started,method:request.method,url:request.url,version:snapshot.label,status:null,bodyBytes:0,rawBytes:0,finished:null};records.push(record);
  const marker={response};pending.add(marker);response.on('finish',()=>{record.finished=performance.now();pending.delete(marker);});response.on('close',()=>{record.aborted=!response.writableFinished;pending.delete(marker);});
  const send=(status,headers,body)=>{
   const deliver=()=>{if(response.destroyed)return;record.status=status;response.writeHead(status,headers);
    if(request.method==='HEAD'||status===304){response.end();return;}
    record.bodyBytes=body.length;
    if(shape()?.downloadBps&&body.length){const stream={response,body,offset:0};streams.push(stream);}else response.end(body);
   };
   const delay=shape()?.latencyMs||0;if(delay)setTimeout(deliver,delay);else deliver();
  };
  try{
   if(!['GET','HEAD'].includes(request.method)){send(405,{},Buffer.alloc(0));return;}
   const url=new URL(request.url,'http://localhost');
   if(publicCA&&url.pathname==='/preview-ca.cer'){const body=fs.readFileSync(publicCA);record.rawBytes=body.length;send(200,{'Content-Type':types['.cer'],'Content-Length':body.length,'Cache-Control':'no-store'},body);return;}
   if(url.pathname==='/favicon.ico'){send(204,{},Buffer.alloc(0));return;}
   if(!url.pathname.startsWith(prefix)){send(404,{},Buffer.from('Not in the runtime package'));return;}
   let relative=decodeURIComponent(url.pathname.slice(prefix.length));if(!relative||relative.endsWith('/'))relative+='index.html';
   if(relative.includes('\\')||relative.includes('\0'))throw Error('Unsafe path');
   const file=path.resolve(snapshot.root,relative);if(!file.startsWith(path.resolve(snapshot.root)+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error('Missing runtime file');
   const content=bodyFor(snapshot.root,relative),gzip=content.gzip&&/\bgzip\b/.test(request.headers['accept-encoding']||''),body=gzip?content.gzip:content.raw;
   const etag='"'+content.sha256+(gzip?'-gzip':'')+'"';record.relative=relative;record.rawBytes=content.raw.length;record.encoding=gzip?'gzip':'identity';
   const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':body.length,'Cache-Control':relative==='service-worker.js'?'no-cache':'public, max-age=600','ETag':etag,'Vary':'Accept-Encoding','X-Preview-Package':snapshot.label};
   if(gzip)headers['Content-Encoding']='gzip';
   if(relative==='service-worker.js')headers['Service-Worker-Allowed']=prefix;
   if(request.headers['if-none-match']===etag){delete headers['Content-Length'];send(304,headers,Buffer.alloc(0));}else send(200,headers,body);
  }catch(error){record.error=error.message;send(404,{'Content-Type':'text/plain'},Buffer.from('Missing runtime resource'));}
 };
 return {handler,records,get pending(){return pending.size;},close(){clearInterval(timer);},http:()=>http.createServer(handler),https:options=>https.createServer(options,handler),http2:options=>http2.createSecureServer({...options,allowHTTP1:true},handler)};
}
