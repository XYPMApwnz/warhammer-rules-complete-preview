import fs from 'node:fs';
import http2 from 'node:http2';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out='E:/Warhammer/qa-evidence/load-audit-v1-2026-11-21',root='E:/Warhammer/qa-tmp/load-audit/package';
const manifest=JSON.parse(fs.readFileSync(root+'/PAGES_RUNTIME_MANIFEST.json'));
const origin='https://xypmapwnz.github.io',prefix='/warhammer-rules-complete-preview/';
const session=http2.connect(origin);session.on('error',()=>{});
const headersOnly=()=>{};
function get(file){return new Promise((resolve,reject)=>{const start=Date.now(),req=session.request({':method':'GET',':path':prefix+file,'accept-encoding':'gzip, deflate, br, zstd'}),chunks=[];let headers;
 req.on('response',value=>headers=value);req.on('data',chunk=>chunks.push(chunk));req.on('error',reject);req.setTimeout(45000,()=>{req.close();reject(Error('Pages probe timed out: '+file));});
 req.on('end',()=>{try{const body=Buffer.concat(chunks),encoding=headers['content-encoding']||'identity';let decoded;
  if(encoding==='gzip')decoded=zlib.gunzipSync(body);else if(encoding==='br')decoded=zlib.brotliDecompressSync(body);else if(encoding==='deflate')decoded=zlib.inflateSync(body);else if(encoding==='zstd')decoded=zlib.zstdDecompressSync(body);else decoded=body;
  const safe=Object.fromEntries(Object.entries(headers).filter(([name])=>[':status','content-encoding','content-length','content-type','cache-control','etag','vary','age','date','last-modified','x-cache','x-cache-hits','expires','server','alt-svc'].includes(name)));
  resolve({path:file,status:headers[':status'],protocol:session.socket.alpnProtocol,encoding,encodedBytes:body.length,decodedBytes:decoded.length,decodedSha256:createHash('sha256').update(decoded).digest('hex'),headers:safe,elapsedMs:Date.now()-start,...(file==='PAGES_RUNTIME_MANIFEST.json'?{runtime:JSON.parse(decoded)}:{})});
 }catch(error){reject(error);}});req.end();});}
const results={schema:'live-pages-compression-probe/v1',origin,started:new Date().toISOString(),rows:[]};
try{
 const live=await get('PAGES_RUNTIME_MANIFEST.json');assert.equal(live.status,200);assert.equal(live.runtime.contentSha256,manifest.contentSha256);results.liveContentSha256=live.runtime.contentSha256;delete live.runtime;results.rows.push(live);
 const selected=[...manifest.files].sort((a,b)=>b.bytes-a.bytes).slice(0,20);
 for(const item of selected){const row=await get(item.path);assert.equal(row.status,200);assert.equal(row.decodedSha256,item.sha256,item.path+' changed on live Pages');results.rows.push(row);fs.writeFileSync(out+'/PAGES_COMPRESSION.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({path:row.path,encoding:row.encoding,raw:row.decodedBytes,encoded:row.encodedBytes}));}
 results.status='PASS';
}catch(error){results.status='FAIL';results.error=error.message;throw error;}
finally{results.finished=new Date().toISOString();fs.writeFileSync(out+'/PAGES_COMPRESSION.json',JSON.stringify(results,null,2)+'\n');session.close();}
