/** Audit observer: raw worker CDP + page CDP; private roster text is never logged. */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium,devices} from 'file:///E:/Warhammer/worktrees/browser-compat-v1/node_modules/playwright/index.mjs';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const TMP='E:/Warhammer/qa-tmp/fast-first-load';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export class RawCDP{
 constructor(ws){this.ws=ws;this.next=1;this.pending=new Map();this.listeners=[];ws.addEventListener('message',event=>{
  const value=JSON.parse(event.data);if(value.id){const p=this.pending.get(value.id);if(p){this.pending.delete(value.id);value.error?p.reject(Error(JSON.stringify(value.error))):p.resolve(value.result);}}else for(const fn of this.listeners)fn(value);
 });}
 static async connect(url){const ws=new WebSocket(url);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});return new RawCDP(ws);}
 on(fn){this.listeners.push(fn);}
 send(method,params={},sessionId){const id=this.next++;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
 close(){this.ws.close();}
}
const safeHeaders=headers=>Object.fromEntries(Object.entries(headers||{}).filter(([key])=>['content-type','content-encoding','content-length','cache-control','etag','vary','age','date','last-modified','x-cache','x-cache-hits','expires','server','accept-ranges','alt-svc'].includes(key.toLowerCase())).map(([key,value])=>[key.toLowerCase(),value]));
export class NetworkLedger{
 constructor(assets,base){this.assets=assets;this.base=base;this.rows=[];this.active=new Map();this.sequence=0;this.swEvents=[];this.workerSessions=[];this.notes=[];}
 event(session,event){const {method,params:e}=event;if(!method?.startsWith('Network.'))return;
  const key=session+':'+e.requestId;let row=this.active.get(key);
  if(method==='Network.requestWillBeSent'){
   if(!/^https?:/.test(e.request.url))return;
   if(row&&e.redirectResponse){Object.assign(row,{endEpoch:e.wallTime*1000,redirect:true,status:e.redirectResponse.status});}
   const url=new URL(e.request.url),prefix=new URL(this.base).pathname;
   const relative=url.pathname.startsWith(prefix)?decodeURIComponent(url.pathname.slice(prefix.length))||'index.html':null;
   row={id:++this.sequence,session,actor:session.startsWith('worker:')?'service-worker':'page',requestId:e.requestId,url:e.request.url,
    path:url.pathname+url.search,relative,startEpoch:e.wallTime*1000,startTimestamp:e.timestamp,type:e.type,method:e.request.method,
    initiator:{type:e.initiator?.type,requestId:e.initiator?.requestId,stack:(e.initiator?.stack?.callFrames||[]).slice(0,5).map(frame=>({url:frame.url,line:frame.lineNumber,column:frame.columnNumber}))},
    priority:e.request.initialPriority,dataBytes:0,encodedChunks:0,headers:{},expectedRawBytes:relative?this.assets[relative]?.bytes??null:null};
   this.rows.push(row);this.active.set(key,row);return;
  }
  if(!row)return;
  if(method==='Network.responseReceived')Object.assign(row,{status:e.response.status,responseEpoch:row.startEpoch+(e.timestamp-row.startTimestamp)*1000,
   headers:safeHeaders(e.response.headers),protocol:e.response.protocol,mimeType:e.response.mimeType,fromServiceWorker:Boolean(e.response.fromServiceWorker),fromDiskCache:Boolean(e.response.fromDiskCache),fromPrefetchCache:Boolean(e.response.fromPrefetchCache),
   responseEncodedDataLength:e.response.encodedDataLength,timing:e.response.timing,renderBlockingBehavior:e.response.renderBlockingBehavior});
  if(method==='Network.responseReceivedExtraInfo'){row.actualStatus=e.statusCode;row.extraHeaders=safeHeaders(e.headers);}
  if(method==='Network.dataReceived'){row.dataBytes+=e.dataLength;row.encodedChunks+=e.encodedDataLength;}
  if(method==='Network.requestServedFromCache')row.servedFromCache=true;
  if(method==='Network.resourceChangedPriority')row.priority=e.newPriority;
  if(method==='Network.loadingFinished')Object.assign(row,{endEpoch:row.startEpoch+(e.timestamp-row.startTimestamp)*1000,encodedDataLength:e.encodedDataLength,
   encodedBodyLength:e.encodedBodyLength,complete:true});
  if(method==='Network.loadingFailed')Object.assign(row,{endEpoch:row.startEpoch+(e.timestamp-row.startTimestamp)*1000,failure:e.errorText,canceled:e.canceled,blockedReason:e.blockedReason});
 }
 normalized(startEpoch,endEpoch=Infinity){return this.rows.filter(row=>row.startEpoch>=startEpoch-3&&row.startEpoch<=endEpoch).map(input=>{
  const row={...input},cached=row.fromServiceWorker||row.fromDiskCache||row.fromPrefetchCache||row.servedFromCache;
  row.networkDownload=!cached;row.finished=Boolean(row.complete||row.failure);row.durationMs=row.endEpoch?row.endEpoch-row.startEpoch:null;
  row.compressedBodyBytes=0;row.decodedBodyBytes=0;row.bodyByteSource=cached?'SW/cache wrapper: zero network':'';
  if(!cached){
   if(row.actualStatus===304||[204,205].includes(row.status)||row.method==='HEAD'){row.bodyByteSource='HTTP response has no body';}
   else if(typeof row.encodedBodyLength==='number'){row.compressedBodyBytes=row.encodedBodyLength;row.bodyByteSource='CDP loadingFinished.encodedBodyLength';}
   else if(row.complete&&/^\d+$/.test(String(row.headers['content-length']??''))){row.compressedBodyBytes=Number(row.headers['content-length']);row.bodyByteSource='complete Content-Length (encoded HTTP body)';}
   else{row.compressedBodyBytes=row.encodedChunks;row.bodyByteSource='estimated encoded chunks (may include HTTP/2 frame overhead)';row.encodedBodyEstimated=true;}
   row.decodedBodyBytes=row.dataBytes||(row.complete&&row.status===200?row.expectedRawBytes||0:0);
   row.decodedByteSource=row.dataBytes?'CDP dataReceived.dataLength':row.complete&&row.expectedRawBytes?'verified publication asset size':'unavailable/empty';
  }
  row.startMs=row.startEpoch-startEpoch;row.endMs=row.endEpoch?row.endEpoch-startEpoch:null;row.responseMs=row.responseEpoch?row.responseEpoch-startEpoch:null;
  return row;
 });}
 pending(){return this.rows.filter(row=>!row.complete&&!row.failure&&!row.redirect).length;}
}
export async function openObservedBrowser({proxy,base,spki,assets,label,netlog=false}){
 fs.mkdirSync(TMP,{recursive:true});
 const profile=fs.mkdtempSync(path.join(TMP,'profile-'+label.replace(/[^a-zA-Z0-9-]/g,'-')+'-'));
 const fd=fs.openSync(path.join(profile,'chrome.log'),'w');
 const args=['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--no-startup-window',
  '--disable-background-networking','--disable-component-update','--disable-default-apps','--disable-sync','--metrics-recording-only','--disable-quic',
  '--proxy-server='+proxy.url,'--proxy-bypass-list=<-loopback>','--ignore-certificate-errors-spki-list='+spki,
  ...(netlog?['--log-net-log='+path.join(profile,'netlog.json'),'--net-log-capture-mode=Default']:[])];
 const child=spawn(CHROME,args,{stdio:['ignore',fd,fd],windowsHide:true});
 const portFile=path.join(profile,'DevToolsActivePort'),deadline=Date.now()+30000;
 while(!fs.existsSync(portFile)){if(Date.now()>deadline||child.exitCode!==null)throw Error('Isolated Chromium did not start');await sleep(50);}
 const [port,wsPath]=fs.readFileSync(portFile,'utf8').trim().split(/\r?\n/),endpoint='http://127.0.0.1:'+port;
 const raw=await RawCDP.connect('ws://127.0.0.1:'+port+wsPath),ledger=new NetworkLedger(assets,base),workerSetups=[];
 raw.on(event=>{
  if(event.method==='Target.attachedToTarget'&&event.params.targetInfo.type==='service_worker'){
   const session=event.params.sessionId;ledger.workerSessions.push({sessionId:session,url:event.params.targetInfo.url,targetId:event.params.targetInfo.targetId});
   const setup=(async()=>{try{await raw.send('Network.enable',{maxPostDataSize:0},session);await raw.send('Runtime.enable',{},session);}catch(error){ledger.notes.push('Worker observer: '+error.message);}finally{await raw.send('Runtime.runIfWaitingForDebugger',{},session).catch(()=>{});}})();workerSetups.push(setup);
  }
  if(event.sessionId)ledger.event('worker:'+event.sessionId,event);
 });
 await raw.send('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:true,flatten:true,filter:[{type:'service_worker',exclude:false},{exclude:true}]});
 const browser=await chromium.connectOverCDP(endpoint),context=await browser.newContext({...devices['Pixel 7'],viewport:{width:390,height:844},serviceWorkers:'allow'});
 const marks=[],offlineEvents=[];
 await context.exposeBinding('__loadAuditMark',(_source,value)=>marks.push(value));
 await context.exposeBinding('__loadAuditOffline',(_source,value)=>offlineEvents.push(value));
 await context.addInitScript(()=>{
  performance.setResourceTimingBufferSize(5000);window.__auditLongTasks=[];
  const mark=(name,value,extra={})=>window.__loadAuditMark({name,epoch:performance.timeOrigin+value,url:location.href,...extra}).catch(()=>{});
  let watchedApplication=false,bootstrapReady=false,importStarted=false,importReady=false;
  const inspectApplication=()=>{
   const application=window.WarhammerAppV2;
   if(application&&!watchedApplication){
    let ready;try{ready=application.ready;}catch{}
    if(ready&&typeof ready.then==='function'){
     watchedApplication=true;mark('application-ready-watch-attached',performance.now(),{visibilityState:document.visibilityState});
     ready.then(()=>{mark('application-ready',performance.now(),{visibilityState:document.visibilityState});inspectApplication();},()=>mark('application-ready-rejected',performance.now()));
    }
   }
   if(application&&!bootstrapReady&&!document.querySelector('[data-v2-loading]')){
    bootstrapReady=true;mark('bootstrap-ready-DOM',performance.now(),{visibilityState:document.visibilityState});
   }
   if(importStarted&&!importReady&&window.ArmyBookAppV2?.roster?.state?.units?.length>0&&!document.querySelector('[data-roster-view][aria-busy="true"]')){
    importReady=true;mark('roster-import-ready-DOM',performance.now(),{visibilityState:document.visibilityState});
   }
  };
  document.addEventListener('click',event=>{
   if(!importStarted&&event.target?.closest?.('[data-roster-action="review-import"]')){importStarted=true;mark('roster-import-click',performance.now());}
  },true);
  const navigationEvent=(name,field)=>{
   const navigation=performance.getEntriesByType('navigation')[0],value=navigation?.[field];
   mark(name,Number.isFinite(value)&&value>0?value:performance.now(),{visibilityState:document.visibilityState});inspectApplication();
  };
  document.addEventListener('DOMContentLoaded',()=>queueMicrotask(()=>navigationEvent('navigation-DCL','domContentLoadedEventEnd')),{once:true});
  window.addEventListener('load',()=>setTimeout(()=>navigationEvent('navigation-load','loadEventEnd'),0),{once:true});
  window.__auditOfflineEvents=[];
  navigator.serviceWorker?.addEventListener('message',event=>{
   const value=event.data;
   if(value?.type!=='WH_OFFLINE_PACKAGE_STATUS')return;
   const sample={epoch:performance.timeOrigin+performance.now(),revision:value.revision,status:value.status,completed:value.completed,total:value.total,sequence:value.sequence,coreReady:value.coreReady,cacheBytes:value.cacheBytes};
   window.__auditOfflineEvents.push(sample);
   window.__loadAuditOffline(sample).catch(()=>{});
  });
  try{new PerformanceObserver(list=>{for(const entry of list.getEntries())if(entry.name==='first-contentful-paint')mark('FCP',entry.startTime);}).observe({type:'paint',buffered:true});}catch{}
  try{new PerformanceObserver(list=>window.__auditLongTasks.push(...list.getEntries().map(entry=>({start:entry.startTime,duration:entry.duration})))).observe({type:'longtask',buffered:true});}catch{}
  let useful=false;const observer=new MutationObserver(()=>{inspectApplication();if(!useful&&(document.querySelectorAll('[data-v2-book]').length===9||document.querySelector('[data-roster-view]')||document.querySelector('.book-app'))){useful=true;mark('first-useful-DOM',performance.now());}});
  observer.observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-busy']});
  inspectApplication();
 });
 const page=await context.newPage(),cdp=await context.newCDPSession(page);
 await cdp.send('Network.enable',{maxPostDataSize:0});await cdp.send('Performance.enable');await cdp.send('Network.clearBrowserCache');
 cdp.on('Network.requestWillBeSent',params=>ledger.event('page',{method:'Network.requestWillBeSent',params}));
 for(const method of ['responseReceived','responseReceivedExtraInfo','dataReceived','requestServedFromCache','resourceChangedPriority','loadingFinished','loadingFailed'])cdp.on('Network.'+method,params=>ledger.event('page',{method:'Network.'+method,params}));
 cdp.on('ServiceWorker.workerVersionUpdated',event=>{for(const version of event.versions)ledger.swEvents.push({epoch:Date.now(),...version});});
 await cdp.send('ServiceWorker.enable').catch(error=>ledger.notes.push('SW state observer: '+error.message));
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 return{browser,context,page,cdp,raw,ledger,marks,offlineEvents,errors,profile,version:browser.version(),async close(){
  await context.close().catch(()=>{});await raw.send('Browser.close').catch(()=>{});raw.close();await browser.close().catch(()=>{});
  if(child.exitCode===null)await Promise.race([new Promise(resolve=>child.once('exit',resolve)),sleep(5000)]);
  if(child.exitCode===null)child.kill();fs.closeSync(fd);
 }};
}
