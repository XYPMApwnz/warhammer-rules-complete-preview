import {createLifecycle} from '../army-book-app-v2/lifecycle.mjs';
import {adaptGlobalGlossary} from '../army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../army-book-app-v2/reference-contract.mjs';
import {createReferencePresenter} from '../army-book-app-v2/reference-v1.mjs';
import {createGlossaryCatalog} from '../army-book-app-v2/glossary-v1.mjs';
import {decodeRoute,encodeRoute} from '../army-book-app-v2/route-context.mjs';
import {positionV1Popup} from '../army-book-app-v2/popup-v1.mjs';

/** Global catalog scope; canonical search/resolution/articles are the book reference contract. */
export function mountGlobalGlossary(document,corpus,{root,entryURL,registryLabels={},coreRoutes=null,loadCoreRoutes=null}) {
  const view=document.defaultView,lifecycle=createLifecycle(view),previousTitle=document.title;
  const projection=adaptGlobalGlossary(corpus,{registryLabels}),cards=new Map(projection.cards.map(card=>[card.id,card]));
  const contract=createReferenceContract({cards,index:projection.index});
  const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const button=(label,className,action)=>{const node=el('button',className,label);node.type='button';lifecycle.listen(node,'click',action);return node;};
  const shell=el('div','v2-global-glossary v2-book-surface');shell.dataset.globalGlossary='';
  let availableCoreRoutes=coreRoutes;
  let coreNavigationStatus=Object.freeze({status:coreRoutes?'READY':loadCoreRoutes?'LOADING':'UNAVAILABLE',reason:null});
  shell.dataset.coreNavigationStatus=coreNavigationStatus.status;
  const main=el('main','global-glossary-main');main.tabIndex=-1;
  const dialog=el('dialog','term-popup');dialog.setAttribute('aria-labelledby','v2-detail-heading');
  const close=button('×','popup-close',()=>dialog.close());close.setAttribute('aria-label','Close rule reference');
  const dialogBody=el('div','global-reference-popup');dialog.append(close,dialogBody);shell.append(main,dialog);root.append(shell);
  const styles=['../army-book-app-v2/reference-v1.css','../army-book-app-v2/popup-v1.css','./glossary.css'].map(file=>{
    const link=el('link');link.rel='stylesheet';link.href=new URL(file,import.meta.url).href;document.head.append(link);return link;
  });
  let catalog=null,lastFocus=null,popupOrigin=null;
  const routeFor=id=>id?{destination:'GLOSSARY',...contract.identityFor(id)}:{destination:'GLOSSARY'};
  const urlFor=id=>encodeRoute(entryURL,routeFor(id));
  const anchor=(label,id,detail=false)=>{
    const node=el('a',detail?'v2-reference':'v2-card-link',label);node.href=urlFor(id);node.dataset.targetId=id;
    lifecycle.listen(node,'click',event=>{
      if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();detail?openPopup(id,node):navigate(id);
    });return node;
  };
  const factValue=(tag,field)=>el(tag,'',field.displayValue??String(field.value));
  const presenter=createReferencePresenter({el,factValue,anchor,contract,cards,payload:{},allowedIds:()=>null});
  function navigateRoute(route) {
    view.history.pushState(null,'',encodeRoute(entryURL,route));view.dispatchEvent(new view.PopStateEvent('popstate'));
    main.focus({preventScroll:true});view.scrollTo({top:0,behavior:'instant'});
  }
  const navigate=id=>navigateRoute(routeFor(id));
  function addCoreLink(node,id) {
    const route=availableCoreRoutes?.routeFor(id);
    if(route){
      const link=el('a','v2-permalink reference-permalink','Open in Core Rules');
      link.href=encodeRoute(entryURL,route);link.dataset.coreTarget=route.canonicalId;
      lifecycle.listen(link,'click',event=>{
        if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
        event.preventDefault();navigateRoute(route);
      });node.append(link);
    }
    return node;
  }
  const article=(id,options)=>addCoreLink(presenter.render(id,options),id);
  function openPopup(id,origin) {
    if(!dialog.open)lastFocus=origin||document.activeElement;
    popupOrigin=origin;
    dialogBody.replaceChildren(article(id,{popup:true}));
    if(!dialog.open)dialog.showModal();positionV1Popup(dialog,{origin});
  }
  lifecycle.listen(dialog,'click',event=>{if(event.target===dialog)dialog.close();});
  lifecycle.listen(dialog,'close',()=>{lastFocus?.isConnected&&lastFocus.focus({preventScroll:true});});
  lifecycle.listen(view,'resize',()=>positionV1Popup(dialog,{origin:popupOrigin}));
  function sync() {
    if(!lifecycle.active)return;
    if(dialog.open)dialog.close();
    const url=new URL(view.location.href),legacy=url.searchParams.get('legacy');let id=null;
    if(legacy) {
      id=contract.resolveAlias(legacy,{registryId:url.searchParams.get('context'),parentId:url.searchParams.get('parent'),recordType:url.searchParams.get('type')});
      if(id)view.history.replaceState(view.history.state,'',urlFor(id));
    } else {
      const route=decodeRoute(view.location.href);
      if(route.canonicalId)id=contract.resolve(route)?.targetId||null;
    }
    const targetRequested=legacy||decodeRoute(view.location.href).canonicalId;
    if(id) {
      const toolbar=el('nav','v2-breadcrumbs');toolbar.append(button('Glossary','',()=>navigate(null)));
      main.replaceChildren(toolbar,article(id));document.title=`${cards.get(id).title} · Mega Glossary`;catalog=null;
    } else if(targetRequested) {
      main.replaceChildren(el('p','v2-not-found','This reference is unavailable. Choose an entry from the Glossary.'),button('Glossary','',()=>navigate(null)));catalog=null;
    } else {
      const state=view.history.state?.globalGlossary||{};
      catalog=createGlossaryCatalog({el,button,anchor,lifecycle,contract,title:'Mega Glossary',pageSize:120,query:state.query||'',category:state.category||'',
        onChange:selection=>view.history.replaceState({...view.history.state,globalGlossary:selection},'',view.location.href)});
      main.replaceChildren(catalog.node);document.title='Mega Glossary · Warhammer 40,000';
    }
  }
  lifecycle.cleanup(()=>{if(dialog.open)dialog.close();shell.remove();styles.forEach(style=>style.remove());document.title=previousTitle;});
  sync();
  if(loadCoreRoutes){
    const controller=new view.AbortController();
    lifecycle.cleanup(()=>controller.abort());
    // Handle only this optional capability's failure. Catalog/rendering failures
    // still follow their existing error path, and the diagnostic is retained.
    const unavailable=error=>{
      if(!lifecycle.active)return;
      availableCoreRoutes=null;
      coreNavigationStatus=Object.freeze({status:'UNAVAILABLE',reason:String(error?.message||error)});
      shell.dataset.coreNavigationStatus=coreNavigationStatus.status;
      shell.dataset.coreNavigationError=coreNavigationStatus.reason;
    };
    Promise.resolve().then(()=>loadCoreRoutes(controller.signal)).then(routes=>{
      if(!lifecycle.active)return;
      if(typeof routes?.routeFor!=='function'){unavailable(new TypeError('Invalid Core navigation capability'));return;}
      availableCoreRoutes=routes;
      coreNavigationStatus=Object.freeze({status:'READY',reason:null});
      shell.dataset.coreNavigationStatus=coreNavigationStatus.status;
      for(const node of shell.querySelectorAll('.v1-reference-article[data-card-id]')){
        node.querySelector(':scope > [data-core-target]')?.remove();
        addCoreLink(node,node.dataset.cardId);
      }
      if(dialog.open)positionV1Popup(dialog,{origin:popupOrigin});
    },unavailable);
  }
  return Object.freeze({sync,destroy:lifecycle.destroy,get destroyed(){return !lifecycle.active;},
    get coreNavigationStatus(){return coreNavigationStatus;},contract,counts:projection.counts});
}
