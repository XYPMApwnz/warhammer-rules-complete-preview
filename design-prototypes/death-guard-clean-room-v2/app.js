(function(){
  'use strict';

  const breakpoint=1100;
  const body=document.body;
  const panel=document.getElementById('tocPanel');
  const tree=document.getElementById('tocTree');
  const menuButton=document.getElementById('navMenu');
  const collapseButton=document.getElementById('navCollapse');
  const scrim=document.getElementById('tocScrim');
  const themeButton=document.getElementById('themeButton');
  const dialog=document.getElementById('termDialog');
  const termTitle=document.getElementById('termTitle');
  const termSummary=document.getElementById('termSummary');
  const termFull=document.getElementById('termFull');
  const terms=window.WH40K_GLOSSARY.forBook('death-guard');
  let destinations=[];
  let scrollFrame=0;
  let currentTarget='';

  function mobile(){return innerWidth<=breakpoint;}
  function branch(node){return Array.from(node.children).find(child=>child.classList.contains('toc-branch'));}
  function toggle(node){return Array.from(node.children).find(child=>child.classList.contains('toc-row'))?.querySelector('[data-nav-toggle]');}
  function label(node){return Array.from(node.children).find(child=>child.classList.contains('toc-row'))?.querySelector('[data-nav-target]');}
  function parentItem(node){const list=node.parentElement;return list?.classList.contains('toc-branch')?list.parentElement:null;}
  function setBranch(node,open){
    const list=branch(node),button=toggle(node);if(!list)return;
    list.hidden=!open;button?.setAttribute('aria-expanded',String(open));
  }
  function closeSiblings(node){
    for(const sibling of node.parentElement.children)if(sibling!==node&&sibling.matches('[data-nav-id]'))setBranch(sibling,false);
  }
  function reveal(node){
    const parents=[];for(let current=parentItem(node);current;current=parentItem(current))parents.unshift(current);
    for(const parent of parents){closeSiblings(parent);setBranch(parent,true);}
  }
  function select(button){
    if(!button||button.dataset.navTarget===currentTarget)return;
    for(const active of tree.querySelectorAll('.is-current,.is-ancestor'))active.classList.remove('is-current','is-ancestor');
    for(const current of tree.querySelectorAll('[aria-current]'))current.removeAttribute('aria-current');
    button.classList.add('is-current');button.setAttribute('aria-current','location');
    for(let node=parentItem(button.closest('[data-nav-id]'));node;node=parentItem(node))label(node)?.classList.add('is-ancestor');
    currentTarget=button.dataset.navTarget;
  }
  function setDrawer(open){
    body.classList.toggle('nav-drawer-open',open&&mobile());
    menuButton.setAttribute('aria-expanded',String(open&&mobile()));
    panel.setAttribute('aria-hidden',String(mobile()&&!(open&&mobile())));
  }
  function measure(){
    destinations=Array.from(tree.querySelectorAll('[data-nav-target]')).map(button=>{
      const target=document.getElementById(button.dataset.navTarget);
      return target&&{button,target,top:target.getBoundingClientRect().top+scrollY};
    }).filter(Boolean).sort((a,b)=>a.top-b.top);
    followScroll();
  }
  function followScroll(){
    scrollFrame=0;
    const line=scrollY+parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))+24;
    let current=destinations[0];
    for(const destination of destinations){if(destination.top>line)break;current=destination;}
    if(!current||current.button.dataset.navTarget===currentTarget)return;
    const node=current.button.closest('[data-nav-id]');
    reveal(node);select(current.button);
  }

  tree.addEventListener('click',event=>{
    const toggleButton=event.target.closest('[data-nav-toggle]');
    if(toggleButton){
      const node=toggleButton.closest('[data-nav-id]'),list=branch(node),opening=list?.hidden;
      if(opening)closeSiblings(node);setBranch(node,opening);return;
    }
    const button=event.target.closest('[data-nav-target]');if(!button)return;
    const node=button.closest('[data-nav-id]'),target=document.getElementById(button.dataset.navTarget);if(!target)return;
    reveal(node);select(button);target.scrollIntoView({block:'start'});setDrawer(false);
  });

  menuButton.addEventListener('click',()=>setDrawer(!body.classList.contains('nav-drawer-open')));
  scrim.addEventListener('click',()=>setDrawer(false));
  collapseButton.addEventListener('click',()=>{
    const collapsed=body.classList.toggle('nav-collapsed');
    collapseButton.setAttribute('aria-expanded',String(!collapsed));
    collapseButton.textContent=collapsed?'▶':'◀';
  });

  document.addEventListener('click',event=>{
    const local=event.target.closest('[data-journey-target]');
    if(local){document.getElementById(local.dataset.journeyTarget)?.scrollIntoView({block:'start'});return;}
    const trigger=event.target.closest('[data-term]');if(!trigger)return;
    const term=terms[trigger.dataset.term]||window.WH40K_GLOSSARY.get(trigger.dataset.term);if(!term)return;
    termTitle.textContent=term.title;
    termSummary.textContent=term.summary||term.definition;
    termFull.href=`../../glossary/index.html#${term.id}`;
    dialog.showModal();
  });

  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  themeButton.addEventListener('click',()=>{
    const light=document.documentElement.dataset.theme!=='light';
    document.documentElement.dataset.theme=light?'light':'dark';
    themeButton.textContent=light?'☾':'☼';
  });
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(followScroll);},{passive:true});
  addEventListener('resize',()=>{setDrawer(false);measure();},{passive:true});
  panel.setAttribute('aria-hidden',String(mobile()));
  requestAnimationFrame(measure);
}());
