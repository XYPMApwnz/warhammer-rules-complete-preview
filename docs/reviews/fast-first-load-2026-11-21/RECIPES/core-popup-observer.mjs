/** Read-only diagnostic loader: preserve assertions, collect a background popup state. */
import {registerHooks} from 'node:module';
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(!url.endsWith('/v2/core-reader-browser-qa.mjs'))return result;
 let s=String(result.source);
 const replace=(a,b)=>{if(s.split(a).length!==2)throw Error('Observer anchor is not unique: '+a.slice(0,60));s=s.replace(a,b);};
 replace('const errors=[],missing=[],results=[],screenshots=', 'const __qaConsole=[]; const errors=[],missing=[],results=[],screenshots=');
 replace('async function assertCorePopup(tab,href,readerPath){', `async function __qaPopupDiag(tab,target,readerURL,section,stage,started){
  const dir=process.env.CORE_POPUP_DIAG_OUT; if(!dir)throw Error('CORE_POPUP_DIAG_OUT is required');fs.mkdirSync(dir,{recursive:true});
  const state=await tab.evaluate(({href,readerURL,section})=>{
   const frames=document.querySelectorAll('iframe'),f=frames[0],d=f?.contentDocument;
   return {visibility:document.visibilityState,url:location.href,expectedHref:href,frameCount:frames.length,frameClass:f?.className,frameTitle:f?.title,hostHidden:f?.closest('.v2-core-host')?.hidden,frameURL:d?.URL,expectedReaderURL:readerURL,frameReadyState:d?.readyState,frameVisibility:d?.visibilityState,main:!!d?.querySelector('main.main'),glossary:!!f?.contentWindow?.WH40K_GLOSSARY,sections:d?[...d.querySelectorAll('[id]')].filter(n=>n.id===section).length:0,appReady:!!window.WarhammerAppV2};
  },{href:target.href,readerURL:readerURL.href,section}).catch(e=>({observationError:e.message}));
  const file=path.join(dir,Date.now()+'-'+stage);fs.writeFileSync(file+'.json',JSON.stringify({stage,elapsedMs:Date.now()-started,state,console:__qaConsole},null,2)+'\\n');
  if(stage==='timeout'){await tab.screenshot({path:file+'.png'}).catch(()=>{});await tab.context().tracing.stop({path:file+'-trace.zip'}).catch(()=>{});}
 }
 async function assertCorePopup(tab,href,readerPath){`);
 replace('const proof=await tab.waitForFunction(({href,readerURL,section})=>{', `const __qaStart=Date.now();const __qaTimer=setTimeout(()=>__qaPopupDiag(tab,target,readerURL,section,'deadline-probe',__qaStart).catch(()=>{}),12000);
  const proof=await tab.waitForFunction(({href,readerURL,section})=>{`);
 replace('},{href:target.href,readerURL:readerURL.href,section});', `},{href:target.href,readerURL:readerURL.href,section}).catch(async error=>{clearTimeout(__qaTimer);await __qaPopupDiag(tab,target,readerURL,section,'timeout',__qaStart);throw error;});
  clearTimeout(__qaTimer);await __qaPopupDiag(tab,target,readerURL,section,'success',__qaStart);`);
 replace('context.setDefaultTimeout(15000);', 'context.setDefaultTimeout(15000);await context.tracing.start({screenshots:false,snapshots:true,sources:false});');
 replace("page.on('pageerror',error=>errors.push", "page.on('console',m=>__qaConsole.push({type:m.type(),text:m.text(),url:page.url()}));page.on('requestfailed',r=>__qaConsole.push({type:'requestfailed',url:r.url(),error:r.failure()?.errorText}));page.on('pageerror',error=>errors.push");
 replace('await context.close();', "await context.tracing.stop({path:path.join(process.env.CORE_POPUP_DIAG_OUT,Date.now()+'-completed-trace.zip')}).catch(()=>{});await context.close();");
 return {...result,source:s};
}});
