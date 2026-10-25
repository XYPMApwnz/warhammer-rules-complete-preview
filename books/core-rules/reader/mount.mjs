import {createLifecycle} from '../../shared/army-book-app-v2/lifecycle.mjs';
import {encodeRoute,decodeRoute} from '../../shared/army-book-app-v2/route-context.mjs';
import {adaptGlobalGlossary} from '../../shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../../shared/army-book-app-v2/reference-contract.mjs';

const readerURL=new URL('./index.html',import.meta.url);

/** Placement only: existing reader navigation and search projections own these addresses. */
export function createReaderNavigation({chapterURLs,placements,baseURL=readerURL.href}) {
  if(!Array.isArray(chapterURLs)||!Array.isArray(placements)||!placements.length)throw new Error('Invalid Core reader placements');
  const base=new URL(baseURL),chapters=new Map(),targets=new Map(),owners=new Map();
  for(const address of chapterURLs) {
    const url=new URL(address,base);
    if(url.origin!==base.origin||new URL('.',url).pathname!==new URL('.',base).pathname||!url.pathname.endsWith('.html'))continue;
    const id=url.pathname.slice(url.pathname.lastIndexOf('/')+1,-5);
    chapters.set(id,url.pathname);
  }
  for(const entry of placements) {
    const id=entry.id||entry.code,url=new URL(entry.url,base);
    const chapterId=[...chapters].find(([,pathname])=>pathname===url.pathname)?.[0];
    if(url.origin!==base.origin||!chapterId||!url.hash||typeof id!=='string')throw new Error('Unbound Core reader placement');
    const sectionId=decodeURIComponent(url.hash.slice(1)),target={chapterId,sectionId,canonicalId:id};
    if(targets.has(id)||owners.has(url.pathname+url.hash))throw new Error('Duplicate Core reader placement');
    targets.set(id,target);owners.set(url.pathname+url.hash,target);
  }
  function routeFor(address) {
    const url=new URL(address,base),chapterId=[...chapters].find(([,pathname])=>pathname===url.pathname)?.[0];
    if(url.origin!==base.origin||!chapterId)return null;
    const owner=owners.get(url.pathname+url.hash);
    return {destination:'CORE_RULES',registryId:'core-rules',chapterId:chapterId==='index'?null:chapterId,
      sectionId:url.hash?decodeURIComponent(url.hash.slice(1)):null,canonicalId:owner?.canonicalId||null};
  }
  function locationFor(route) {
    if(route.destination!=='CORE_RULES'||route.registryId!=='core-rules')throw new Error('Foreign Core reader context');
    const target=route.canonicalId?targets.get(route.canonicalId):null;
    if(route.canonicalId&&!target)throw new Error('Unknown Core reader target');
    const chapterId=route.chapterId||target?.chapterId||'index',pathname=chapters.get(chapterId);
    if(!pathname||target&&target.chapterId!==chapterId||target&&route.sectionId&&target.sectionId!==route.sectionId)throw new Error('Conflicting Core reader placement');
    const url=new URL(pathname,base);url.hash=target?.sectionId||route.sectionId||'';
    return {url:url.href,chapterId,sectionId:target?.sectionId||route.sectionId||null};
  }
  return Object.freeze({routeFor,locationFor,chapterIds:Object.freeze([...chapters.keys()])});
}

export async function loadReaderNavigation(view,{signal}={}) {
  const [html,placements]=await Promise.all([
    view.fetch(readerURL,{signal}).then(response=>{if(!response.ok)throw new Error('Core navigation unavailable');return response.text();}),
    view.fetch(new URL('./search-index.json',import.meta.url),{signal}).then(response=>{if(!response.ok)throw new Error('Core placements unavailable');return response.json();})
  ]);
  const source=new view.DOMParser().parseFromString(html,'text/html');
  return createReaderNavigation({chapterURLs:[readerURL.href,...[...source.querySelectorAll('.sidebar nav a[href]')].map(link=>link.getAttribute('href'))],placements});
}

/** Navigation follows existing canonical source relationships, never matching titles. */
export function createCoreReferenceRoutes(corpus,navigation) {
  const entries=new Map(corpus.entries.map(entry=>[entry.id,entry]));
  function targets(entry,trail=new Set()) {
    if(!entry||trail.has(entry.id))return [];
    if(entry.domain==='CORE'){
      try{return [navigation.routeFor(navigation.locationFor({destination:'CORE_RULES',registryId:'core-rules',canonicalId:entry.sourceOwner.canonicalId}).url)];}catch{}
    }
    const next=new Set([...trail,entry.id]);
    return (entry.canonicalReferences||[]).filter(ref=>ref.domain==='CORE'&&
      (entry.domain==='CORE'?['sourceRuleId','targetRuleId'].includes(ref.relationType):['CORE ABILITIES','Conditional source references'].includes(ref.relationType)))
      .flatMap(ref=>{
        const target=entries.get(ref.id);
        return target?.domain==='CORE'&&(!ref.canonicalId||ref.canonicalId===target.sourceOwner.canonicalId)?targets(target,next):[];
      });
  }
  return Object.freeze({routeFor(id){
    const routes=new Map(targets(entries.get(id)).filter(Boolean).map(route=>[JSON.stringify(route),route]));
    return routes.size===1?[...routes.values()][0]:null;
  }});
}

/** The certified standalone reader is the sole Core presenter in both entry modes. */
export function mountCoreReader(document,{root,entryURL,route,navigate}) {
  const view=document.defaultView,lifecycle=createLifecycle(view),previousTitle=document.title;
  const host=document.createElement('div');host.className='v2-core-host';host.dataset.coreReader='';
  const frame=document.createElement('iframe');frame.className='v2-core-reader';frame.title='Core Rules reader';
  host.append(frame);root.append(host);
  const controller=new view.AbortController();
  let navigation,references,documentLife=null,pending=null,sequence=0,currentAddress='',currentLocation=null,departing=false;
  const metadata=loadReaderNavigation(view,{signal:controller.signal}).then(value=>navigation=value);
  function capture() {
    if(!lifecycle.active||departing||!currentLocation||view.location.href!==currentAddress||frame.contentWindow?.location.href!==currentLocation.url||!frame.contentWindow.WHPageState)return;
    frame.contentWindow.WHPageState.capture();
    view.history.replaceState({...view.history.state,coreReader:{chapterId:currentLocation.chapterId,readerURL:frame.contentWindow.location.href,state:frame.contentWindow.history.state}},'',view.location.href);
  }
  function linkRoute(link) {
    const url=new URL(link.href,frame.contentWindow.location.href),entry=new URL(entryURL);
    if(url.origin===entry.origin&&url.pathname===entry.pathname)return decodeRoute(url.href);
    const core=navigation.routeFor(url.href);if(core)return core;
    if(url.origin===readerURL.origin&&url.pathname===new URL('../../../index.html',import.meta.url).pathname)return {destination:'HOME'};
    if(url.origin===readerURL.origin&&url.pathname===new URL('../../../glossary/index.html',import.meta.url).pathname) {
      if(!url.hash)return {destination:'GLOSSARY'};
      const id=decodeURIComponent(url.hash.slice(1));
      const target=references.resolveAlias(id,{registryId:'core-rules'}),identity=references.identityFor(target);
      if(identity?.registryId==='core-rules')return {destination:'REFERENCE',...identity};
    }
    return null;
  }
  function rewriteLinks(doc) {
    for(const link of doc.querySelectorAll('a[href]')) {
      const target=linkRoute(link);if(!target)continue;
      if(link.closest('.on-page')&&target.sectionId)link.dataset.readerSection='#'+target.sectionId;
      const href=encodeRoute(entryURL,target);
      if(link.href!==href)link.href=href;
      if(link.target!=='_top')link.target='_top';
    }
  }
  async function present() {
    const request=pending,child=frame.contentWindow,doc=frame.contentDocument;
    if(!request||child.location.href!==request.location.url)return;
    if(!doc.querySelector('main.main')||!child.WH40K_GLOSSARY)throw new Error('Core reader unavailable');
    if(!references) {
      // Use the existing shared binding/resolution contract, including qualified subentry identity.
      const projection=adaptGlobalGlossary(child.WH40K_GLOSSARY_V2_INDEX);
      references=createReferenceContract({cards:new Map(projection.cards.map(card=>[card.id,card])),index:projection.index});
    }
    documentLife?.destroy();documentLife=createLifecycle(child);
    documentLife.listen(doc,'click',event=>{
      const link=event.target.closest?.('a[href]');
      if(!link||event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
      const target=linkRoute(link);if(!target)return;
      // Let the existing same-document popup return restore its own reading context.
      if(link.id==='popupReturn'&&child.WHGlossaryReturn?.isSameDocument()) {
        queueMicrotask(lifecycle.guard(()=>{
          const restored=navigation.routeFor(child.location.href);if(!restored)return;
          currentAddress=encodeRoute(entryURL,restored);currentLocation=navigation.locationFor(restored);
          view.history.replaceState(view.history.state,'',currentAddress);
        }));return;
      }
      event.preventDefault();capture();departing=true;queueMicrotask(lifecycle.guard(()=>navigate(target)));
    },true);
    const observer=documentLife.observe(new child.MutationObserver(()=>rewriteLinks(doc)));
    observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
    documentLife.listen(doc,'click',()=>queueMicrotask(documentLife.guard(capture)));
    documentLife.listen(doc,'close',capture,true);
    let captureFrame=0;
    documentLife.listen(child,'scroll',()=>{if(!captureFrame)captureFrame=documentLife.frame(()=>{captureFrame=0;capture();});},{passive:true});
    rewriteLinks(doc);
    await focusLocation(request.location);
    if(!lifecycle.active||request!==pending)return;
    document.title=doc.title;host.removeAttribute('aria-busy');request.resolve();pending=null;
  }
  async function focusLocation(location) {
    const child=frame.contentWindow,doc=frame.contentDocument,saved=view.history.state?.coreReader;
    if(saved?.chapterId===location.chapterId&&saved.readerURL===location.url) {
      child.history.replaceState(saved.state,'',location.url);await child.WHPageState.restore();return;
    }
    // New routes reset transient reader UI; history restoration above owns saved popups.
    for(const dialog of doc.querySelectorAll('dialog[open]'))dialog.close();
    if(doc.body.classList.contains('nav-open'))doc.getElementById('navButton').click();
    if(location.sectionId) {
      const target=doc.getElementById(location.sectionId);
      if(!target)throw new Error('Core section unavailable');
      for(let parent=target;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
      target.scrollIntoView({block:'start',behavior:'instant'});
    } else child.scrollTo({top:0,behavior:'instant'});
  }
  function fail(error) {if(pending){pending.reject(error);pending=null;}}
  lifecycle.listen(frame,'load',()=>{present().catch(fail);});
  async function sync(nextRoute) {
    const token=++sequence;await metadata;
    if(!lifecycle.active||token!==sequence)return;
    const location=navigation.locationFor(nextRoute);
    pending?.resolve();currentAddress=view.location.href;currentLocation=location;departing=false;
    const result=new Promise((resolve,reject)=>{pending={location,resolve,reject};});
    host.setAttribute('aria-busy','true');
    if(frame.contentWindow.location.pathname===new URL(location.url).pathname&&frame.contentDocument.readyState==='complete') {
      frame.contentWindow.history.replaceState(null,'',location.url);present().catch(fail);
    } else frame.contentWindow.location.replace(location.url);
    return result;
  }
  lifecycle.cleanup(()=>{++sequence;controller.abort();pending?.resolve();pending=null;documentLife?.destroy();host.remove();document.title=previousTitle;});
  const ready=sync(route);
  return Object.freeze({ready,sync,capture,destroy:lifecycle.destroy,get destroyed(){return !lifecycle.active;}});
}
