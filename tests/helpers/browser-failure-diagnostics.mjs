import fs from 'node:fs/promises';
import path from 'node:path';

// Observe only: no request routing, tracing, polling, navigation or test timeouts.
export function createBrowserFailureDiagnostics(){
  const contexts=[],events=[];
  let nextPage=0,nextRequest=0;
  function observe(context,label){
    const requests=new WeakMap(),pending=new Map(),pages=new Map();
    const state={context,label,pending,pages};contexts.push(state);
    const record=(type,data)=>events.push({at:new Date().toISOString(),context:label,type,...data});
    function pageOpened(page){
      if(pages.has(page))return;
      const pageId=++nextPage;pages.set(page,pageId);
      record('page',{page:pageId,url:page.url()});
      page.on('console',message=>record('console',{page:pageId,level:message.type(),text:message.text(),location:message.location()}));
      page.on('pageerror',error=>record('pageerror',{page:pageId,message:error.message,stack:error.stack}));
      page.on('framenavigated',frame=>record('navigation',{page:pageId,url:frame.url(),name:frame.name()}));
      page.on('request',request=>{
        const id=++nextRequest;requests.set(request,id);
        const item={id,page:pageId,url:request.url(),method:request.method(),resourceType:request.resourceType()};
        pending.set(id,item);record('request',item);
      });
      page.on('response',response=>record('response',{id:requests.get(response.request()),page:pageId,url:response.url(),status:response.status()}));
      page.on('requestfinished',request=>{const id=requests.get(request);pending.delete(id);record('requestfinished',{id,page:pageId,url:request.url()});});
      page.on('requestfailed',request=>{const id=requests.get(request);pending.delete(id);record('requestfailed',{id,page:pageId,url:request.url(),failure:request.failure()});});
    }
    context.on('page',pageOpened);
    for(const page of context.pages())pageOpened(page);
  }
  async function write(directory,error){
    const capturedAt=new Date().toISOString(),recordedEvents=events.slice();
    const pendingRequests=contexts.flatMap(({label,pending})=>[...pending.values()].map(item=>({context:label,...item})));
    await fs.mkdir(directory,{recursive:true});
    const failures=[],snapshots=[];
    const attempt=async(label,operation)=>{
      let timer;
      try{return await Promise.race([operation(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Diagnostic capture exceeded 2000ms')),2000);})]);}
      catch(captureError){failures.push({label,message:String(captureError)});return null;}
      finally{clearTimeout(timer);}
    };
    // Capture before the caller closes its browser; never mask the original error.
    for(const {label,pages} of contexts){
      for(const [page,pageId] of pages){
        if(page.isClosed())continue;
        const snapshot={context:label,page:pageId,url:page.url(),frames:[]};snapshots.push(snapshot);
        for(const [index,frame] of page.frames().entries()){
          const file=`page-${pageId}-frame-${index}.html`;
          const item={url:frame.url(),name:frame.name(),file};snapshot.frames.push(item);
          const dom=await attempt(`${file}:DOM`,()=>frame.content());
          if(dom!==null)await fs.writeFile(path.join(directory,file),dom,'utf8');
          item.state=await attempt(`${file}:state`,()=>frame.evaluate(()=>{
            const app=window.WarhammerAppV2,module=app?.activeModule;
            return {url:location.href,readyState:document.readyState,visibility:document.visibilityState,
              activeElement:document.activeElement?.outerHTML,appPresent:!!app,
              activeModule:module?{type:module.constructor?.name,destroyed:module.destroyed??null}:null,
              coreHosts:[...document.querySelectorAll('.v2-core-host')].map(node=>({hidden:node.hidden})),
              glossaryReady:!!window.WH40K_GLOSSARY,
              dialogs:[...document.querySelectorAll('dialog')].map(node=>({id:node.id,open:node.open}))};
          }));
        }
      }
    }
    const report={schema:'browser-failure-diagnostics/v1',capturedAt,
      error:{name:error?.name,message:error?.message,stack:error?.stack},snapshots,
      pendingRequests,events:recordedEvents,captureErrors:failures};
    const file=path.join(directory,'FAILURE.json');
    await fs.writeFile(file,JSON.stringify(report,null,2)+'\n','utf8');
    return file;
  }
  return {observe,write};
}
