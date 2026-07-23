(function(){
  'use strict';

  const params=new URLSearchParams(location.search);
  if(params.get('tapdebug')!=='1')return;

  const clock=()=>performance.now();
  const round=value=>value==null?'—':Math.max(0,Math.round(value));
  const actionableSelector='[data-term],[data-nav-target],[data-nav-toggle],[data-glossary-category],[data-popup-close],[data-journey-target],.popup-action,#navMenu,#navCollapse,#themeButton,#backButton,a,button,input';
  const entries=[];
  let pointer=null;
  let active=null;
  let sequence=0;

  const style=document.createElement('style');
  style.textContent=`
    #dgTapDiagnostics{position:fixed;z-index:2147483647;top:calc(env(safe-area-inset-top,0px) + 6px);right:6px;width:min(370px,calc(100vw - 12px));max-height:48vh;overflow:auto;padding:8px;border:1px solid #bfd58c;background:rgba(8,12,8,.96);box-shadow:0 8px 30px rgba(0,0,0,.72);color:#e2dcc9;font:12px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;text-align:left;overscroll-behavior:contain}
    #dgTapDiagnostics[data-collapsed="true"] .dg-tap-body{display:none}
    #dgTapDiagnostics .dg-tap-head{display:flex;align-items:center;gap:6px;position:sticky;top:-8px;margin:-8px -8px 6px;padding:7px 8px;background:#11170e;border-bottom:1px solid rgba(191,213,140,.3)}
    #dgTapDiagnostics strong{color:#bfd58c;letter-spacing:.08em}
    #dgTapDiagnostics .dg-tap-spacer{flex:1}
    #dgTapDiagnostics button{min-height:30px;padding:3px 8px;border:1px solid rgba(191,213,140,.4);background:#1b221b;color:#e2dcc9;font:inherit}
    #dgTapDiagnostics .dg-tap-help{margin:0 0 6px;color:#aaa;font-size:11px}
    #dgTapDiagnostics .dg-tap-row{padding:5px 0;border-top:1px solid rgba(255,255,255,.1)}
    #dgTapDiagnostics .dg-tap-row[data-slow="true"]{color:#ffad7a}
    #dgTapDiagnostics .dg-tap-name{display:block;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #dgTapDiagnostics .dg-tap-values{display:block;color:inherit}
  `;
  document.head.append(style);

  const panel=document.createElement('aside');
  panel.id='dgTapDiagnostics';
  panel.dataset.perfIgnore='true';
  panel.setAttribute('aria-label','Tap performance diagnostics');
  panel.innerHTML='<div class="dg-tap-head"><strong>TAP PERF · DG</strong><span class="dg-tap-spacer"></span><button type="button" data-copy>Copy</button><button type="button" data-clear>Clear</button><button type="button" data-collapse>−</button></div><div class="dg-tap-body"><p class="dg-tap-help">hold / up→click / JS / popup / scroll / paint / long task · ms</p><div data-results></div></div>';
  document.body.append(panel);
  const results=panel.querySelector('[data-results]');

  function actionElement(target){return target?.closest?.(actionableSelector)||null;}
  function classify(element){
    if(!element)return'unknown';
    if(element.matches('[data-term]'))return'term';
    if(element.matches('[data-popup-close]'))return'popup-close';
    if(element.matches('[data-journey-target],.popup-action'))return'popup-action';
    if(element.matches('[data-glossary-category]'))return'glossary-category';
    if(element.matches('[data-nav-toggle]'))return'nav-toggle';
    if(element.matches('[data-nav-target]'))return'nav-target';
    if(element.id==='navMenu')return'nav-menu';
    if(element.id==='navCollapse')return'nav-collapse';
    if(element.id==='themeButton')return'theme';
    if(element.id==='backButton')return'journey-back';
    if(element.matches('a'))return'link';
    return element.tagName.toLowerCase();
  }
  function label(element,type){
    const value=element?.dataset?.term||element?.dataset?.navTarget||element?.dataset?.glossaryCategory||element?.getAttribute?.('aria-label')||element?.textContent||'';
    return(type+' '+value.trim().replace(/\s+/g,' ').slice(0,54)).trim();
  }
  function line(entry){
    return`${entry.name} [${entry.pointerType}]\n  hold ${round(entry.up-entry.down)} | up→click ${round(entry.click-entry.up)} | JS ${round(entry.handlers)} | popup ${round(entry.popup)} | scroll ${round(entry.scroll)} | paint ${round(entry.paint)} | long ${round(entry.longTask)}`;
  }
  function render(){
    results.replaceChildren(...entries.slice(-8).reverse().map(entry=>{
      const row=document.createElement('div');row.className='dg-tap-row';row.dataset.id=entry.id;
      const slow=Math.max(entry.click-entry.up||0,entry.handlers||0,entry.paint||0,entry.longTask||0)>100;
      row.dataset.slow=String(slow);
      const name=document.createElement('span');name.className='dg-tap-name';name.textContent='#'+entry.id+' '+entry.name+' ['+entry.pointerType+']';
      const values=document.createElement('span');values.className='dg-tap-values';
      values.textContent=`hold ${round(entry.up-entry.down)} · up→click ${round(entry.click-entry.up)} · JS ${round(entry.handlers)} · popup ${round(entry.popup)} · scroll ${round(entry.scroll)} · paint ${round(entry.paint)} · long ${round(entry.longTask)}`;
      row.append(name,values);return row;
    }));
  }
  function update(entry,patch){Object.assign(entry,patch);render();}

  panel.addEventListener('click',async event=>{
    event.stopPropagation();
    if(event.target.closest('[data-clear]')){entries.length=0;render();return;}
    if(event.target.closest('[data-collapse]')){
      const collapsed=panel.dataset.collapsed!=='true';panel.dataset.collapsed=String(collapsed);
      event.target.textContent=collapsed?'+':'−';return;
    }
    if(event.target.closest('[data-copy]')){
      const text=['Death Guard tap diagnostics',navigator.userAgent,...entries.map(line)].join('\n');
      try{await navigator.clipboard.writeText(text);event.target.textContent='Copied';setTimeout(()=>event.target.textContent='Copy',900);}catch(error){console.warn('[DG tap perf] Copy failed',error);}
    }
  },true);

  document.addEventListener('pointerdown',event=>{
    const element=actionElement(event.target);if(!element||element.closest('[data-perf-ignore]'))return;
    pointer={element,down:clock(),up:null,pointerType:event.pointerType};
  },true);
  document.addEventListener('pointerup',event=>{
    if(pointer&&actionElement(event.target)===pointer.element)pointer.up=clock();
  },true);
  document.addEventListener('pointercancel',()=>{pointer=null;},true);

  document.addEventListener('click',event=>{
    const element=actionElement(event.target);if(!element||element.closest('[data-perf-ignore]'))return;
    const now=clock();
    if(!event.isTrusted){
      if(active&&now-active.click<1000){active.name+=' → '+label(element,classify(element));render();}
      return;
    }
    const matching=pointer&&pointer.element===element&&now-pointer.down<2500;
    const type=classify(element);
    const entry={id:++sequence,type,name:label(element,type),pointerType:matching?pointer.pointerType:'keyboard',down:matching?pointer.down:now,up:matching?(pointer.up||now):now,click:now,handlers:null,popup:null,scroll:null,paint:null,longTask:0};
    pointer=null;active=entry;entries.push(entry);render();
    queueMicrotask(()=>update(entry,{handlers:clock()-entry.click}));
    requestAnimationFrame(()=>requestAnimationFrame(()=>update(entry,{paint:clock()-entry.click})));
    console.info('[DG tap perf]',entry.name,entry);
  },true);

  const popupLayer=document.getElementById('popupLayer');
  if(popupLayer)new MutationObserver(()=>{
    if(active&&active.popup==null&&clock()-active.click<2500)update(active,{popup:clock()-active.click});
  }).observe(popupLayer,{childList:true,subtree:true});

  window.addEventListener('scroll',()=>{
    if(active&&active.scroll==null&&clock()-active.click<2500)update(active,{scroll:clock()-active.click});
  },{passive:true});

  if('PerformanceObserver'in window){
    try{
      new PerformanceObserver(list=>{
        for(const task of list.getEntries()){
          if(active&&task.startTime>=active.down-2&&task.startTime-active.click<2500)update(active,{longTask:active.longTask+task.duration});
        }
      }).observe({type:'longtask',buffered:false});
    }catch(error){}
  }

  window.DG_TAP_DIAGNOSTICS={entries,copy:()=>entries.map(line).join('\n')};
})();
