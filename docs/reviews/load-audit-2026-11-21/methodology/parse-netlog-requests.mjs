/** Read-only NetLog supplement: actual origin HTTP transactions, not cache lookups. */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const allowedResponseHeaders=new Set(['cache-control','content-length','content-encoding','content-type','etag','age','last-modified','vary','expires']);
function responseHeaders(lines=[]){
 const status=Number((lines[0]||'').match(/^HTTP\/[\w.]+\s+(\d{3})/)?.[1]||0),headers={};
 for(const line of lines.slice(1)){const at=line.indexOf(':');if(at<1)continue;const key=line.slice(0,at).toLowerCase();if(allowedResponseHeaders.has(key))headers[key]=line.slice(at+1).trim();}
 return{status,headers};
}
const requestHeader=(lines,name)=>lines.find(line=>line.toLowerCase().startsWith(name.toLowerCase()+':'))?.slice(name.length+1).trim()||null;

/** source URL_REQUEST owns request-level HTTP_TRANSACTION_* sends for H1/H2.
 * Socket CONNECT and HTTP2_SESSION_SEND_HEADERS are deliberately not also counted.
 * Chrome 154 pilot verified actual-send records against the local origin server.
 */
export function parseOriginNetLog(document,{origin,startEpoch=-Infinity,endEpoch=Infinity}={}){
 const eventName=Object.fromEntries(Object.entries(document.constants.logEventTypes).map(([name,id])=>[id,name]));
 const sourceType=document.constants.logSourceType.URL_REQUEST,offset=Number(document.constants.timeTickOffset);
 const sources=new Map(),transactions=[],jobToRequest=new Map();
 for(const event of document.events){
  if(event.source.type!==sourceType)continue;
  const name=eventName[event.type],epoch=Number(event.time)+offset;
  let source=sources.get(event.source.id);if(!source){source={id:event.source.id,hop:0,url:null,method:null,startEpoch:null,last:null,devtoolsRequestId:null};sources.set(event.source.id,source);}
  const devtoolsId=event.params?.devtools_request_id??event.params?.devtoolsRequestId;
  if(typeof devtoolsId==='string'){source.devtoolsRequestId=devtoolsId;if(source.last)source.last.devtoolsRequestId=devtoolsId;}
  if(name==='URL_REQUEST_START_JOB'&&event.params?.url){
   if(source.url!==null)source.hop++;
   source.url=event.params.url;source.method=event.params.method;source.startEpoch=epoch;source.last=null;
  }
  if(name==='HTTP_STREAM_REQUEST_BOUND_TO_JOB'&&event.params?.source_dependency)jobToRequest.set(event.params.source_dependency.id,{sourceId:source.id,hop:source.hop});
  const sent=/^HTTP_TRANSACTION_(?:(?:HTTP2|QUIC)_)?SEND_REQUEST_HEADERS$/.test(name);
  if(sent){
   if(!source.url||new URL(source.url).origin!==origin)continue;
   const headers=event.params?.headers||[],row={sourceId:source.id,hop:source.hop,attempt:transactions.filter(row=>row.sourceId===source.id&&row.hop===source.hop).length+1,devtoolsRequestId:source.devtoolsRequestId,
    url:source.url,method:requestHeader(headers,':method')||source.method,requestStartEpoch:source.startEpoch,sendEpoch:epoch,
    protocol:name.includes('HTTP2')?'h2':name.includes('QUIC')?'h3':'http/1.1',referer:requestHeader(headers,'referer'),
    status:null,responseHeaders:{},responseEpoch:null,endEpoch:null,jobEncodedBytes:0,jobDecodedBytes:0,rawByteEvents:[],filteredByteEvents:[],h2DataBytes:0,h2DataEvents:[],h2Stream:null};
   transactions.push(row);source.last=row;
  }
  const row=source.last;if(!row)continue;
  if(name==='HTTP_TRANSACTION_READ_RESPONSE_HEADERS'){
   const response=responseHeaders(event.params?.headers);row.status=response.status;row.responseHeaders=response.headers;row.responseEpoch=epoch;
  }
  if(name==='URL_REQUEST_JOB_BYTES_READ'){
   const count=Number(event.params?.byte_count||0);row.jobEncodedBytes+=count;row.rawByteEvents.push({epoch,bytes:count});
  }
  if(name==='URL_REQUEST_JOB_FILTERED_BYTES_READ'){
   const count=Number(event.params?.byte_count||0);row.jobDecodedBytes+=count;row.filteredByteEvents.push({epoch,bytes:count});
  }
  if(name==='REQUEST_ALIVE'&&event.phase===document.constants.logEventPhase.PHASE_END)row.endEpoch=epoch;
 }
 // HTTP/2 DATA payload is after H2 framing and before HTTP decompression. This
 // also covers uncompressed zero-copy bodies that omit JOB_BYTES_READ events.
 const streams=new Map();
 for(const event of document.events){
  const name=eventName[event.type],epoch=Number(event.time)+offset;
  if(name==='HTTP2_SESSION_SEND_HEADERS'){
   const owner=jobToRequest.get(event.params?.source_dependency?.id);if(!owner)continue;
   const candidates=transactions.filter(row=>row.sourceId===owner.sourceId&&row.hop===owner.hop&&row.sendEpoch<=epoch+1);
   const row=candidates.at(-1);if(!row)continue;
   const stream=event.source.id+':'+event.params.stream_id;row.h2Stream=stream;streams.set(stream,row);
  }
  if(name==='HTTP2_SESSION_RECV_DATA'){
   const row=streams.get(event.source.id+':'+event.params.stream_id);if(!row)continue;
   const bytes=Number(event.params.size||0);row.h2DataBytes+=bytes;row.h2DataEvents.push({epoch,bytes});
  }
 }
 const rows=transactions.filter(row=>row.sendEpoch>=startEpoch&&row.sendEpoch<endEpoch);
 for(const row of rows){
  row.eventsAfterWindow=row.h2DataEvents.filter(event=>event.epoch>endEpoch).length+row.rawByteEvents.filter(event=>event.epoch>endEpoch).length+row.filteredByteEvents.filter(event=>event.epoch>endEpoch).length;
  row.h2DataEvents=row.h2DataEvents.filter(event=>event.epoch<=endEpoch);row.rawByteEvents=row.rawByteEvents.filter(event=>event.epoch<=endEpoch);row.filteredByteEvents=row.filteredByteEvents.filter(event=>event.epoch<=endEpoch);
  row.h2DataBytes=row.h2DataEvents.reduce((n,event)=>n+event.bytes,0);row.jobEncodedBytes=row.rawByteEvents.reduce((n,event)=>n+event.bytes,0);row.jobDecodedBytes=row.filteredByteEvents.reduce((n,event)=>n+event.bytes,0);
  const noBody=row.method==='HEAD'||row.status===304||row.status===204||row.status===205||(row.status!==null&&row.status>=100&&row.status<200);
  row.networkBodyBytes=noBody?0:(row.h2Stream!==null?row.h2DataBytes:row.jobEncodedBytes);
  row.bodyByteSource=noBody?'status-without-body':row.h2Stream!==null?'NetLog HTTP2 DATA payload':'NetLog URL_REQUEST_JOB_BYTES_READ';
  row.decodedNetworkBodyBytes=noBody?0:(row.filteredByteEvents.length?row.jobDecodedBytes:row.networkBodyBytes);
  row.contentLength=row.responseHeaders['content-length']===undefined?null:Number(row.responseHeaders['content-length']);
  row.contentLengthMatches=noBody?true:row.contentLength===null?null:row.networkBodyBytes===row.contentLength;
  row.startsMs=row.sendEpoch-startEpoch;row.responseMs=row.responseEpoch===null?null:row.responseEpoch-startEpoch;
  row.finishedMs=row.endEpoch===null?null:row.endEpoch-startEpoch;
 }
 return {schema:'load-audit-netlog-http-transactions/v1',origin,startEpoch,endEpoch,networkRequests:rows.length,
  encodedBodyBytes:rows.reduce((n,row)=>n+row.networkBodyBytes,0),decodedNetworkBodyBytes:rows.reduce((n,row)=>n+row.decodedNetworkBodyBytes,0),
  statuses:rows.reduce((result,row)=>{result[row.status]=(result[row.status]||0)+1;return result;},{}),
  bodyContentLengthMismatches:rows.filter(row=>row.contentLengthMatches===false).map(row=>({url:row.url,status:row.status,bytes:row.networkBodyBytes,contentLength:row.contentLength})),
  method:'Count actual HTTP_TRANSACTION send headers on URL_REQUEST sources; exclude socket CONNECT and HTTP2 session duplicate events. H2 body bytes use DATA-frame payloads associated by stream/job/request IDs, excluding 9-byte frame overhead; job-byte fallback is partial where zero-copy reads omit events. 304/204/HEAD network body is zero even if cached bytes are subsequently delivered.',rows};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
 const document=JSON.parse(fs.readFileSync(option('--netlog'),'utf8')),trial=JSON.parse(fs.readFileSync(option('--trial'),'utf8'));
 const request=trial.requests.find(row=>row.url?.startsWith('http'));const origin=option('--origin')||new URL(request.url).origin;
 const report=parseOriginNetLog(document,{origin,startEpoch:trial.startedEpoch,endEpoch:trial.startedEpoch+trial.totalMs});
 if(option('--out'))fs.writeFileSync(option('--out'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({origin,networkRequests:report.networkRequests,encodedBodyBytes:report.encodedBodyBytes,decodedBodyBytes:report.decodedNetworkBodyBytes,statuses:report.statuses,
  CLmismatches:report.bodyContentLengthMismatches}));
}
