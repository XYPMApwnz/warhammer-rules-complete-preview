(function(){
  'use strict';

  const FOCUSABLE='a[href],button,input,select,textarea,[tabindex]';
  const SCROLL_KEYS=new Set(['PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' ']);

  class NavigationController{
    constructor({breakpoint=800,trackingGap=18,epsilon=1,settleDistance=2,stableFrames=6,maxTransitionMs=2200}={}){
      this.options={breakpoint,trackingGap,epsilon,settleDistance,stableFrames,maxTransitionMs};
      this.header=document.getElementById('appHeader');
      this.panel=document.getElementById('tocPanel');
      this.tree=document.getElementById('tocTree');
      this.main=document.getElementById('main');
      this.menuButton=document.getElementById('navMenu');
      this.collapseButton=document.getElementById('navCollapse');
      this.scrim=document.getElementById('tocScrim');
      this.glossary=document.getElementById('glossary');
      this.glossaryTools=this.glossary?.querySelector('.glossary-tools')||null;
      this.readerTools=document.getElementById('readerTools');

      this.mobile=window.innerWidth<=breakpoint;
      this.state={owner:'reader',active:'',drawer:false,collapsed:false,transition:0};
      this.raf={read:0,geometry:0,transition:0};
      this.metrics={headerBottom:0,readerSticky:0,glossarySticky:0,ranges:[]};
      this.supportsInert='inert'in HTMLElement.prototype;
      this.activeButtons=new Set();
      this.items=this.collectItems();
      this.byId=new Map(this.items.map(item=>[item.id,item]));

      this.bind();
      this.closeAllBranches();
      this.applyViewportState();
      this.refreshGeometry();
      this.activate(this.initialId(),{reveal:true,keepVisible:false});

      if('ResizeObserver'in window){
        this.resizeObserver=new ResizeObserver(()=>this.scheduleGeometry());
        this.resizeObserver.observe(this.main);
        if(this.readerTools)this.resizeObserver.observe(this.readerTools);
        if(this.glossaryTools)this.resizeObserver.observe(this.glossaryTools);
      }
    }

    get active(){return this.state.active||this.items[0]?.id||'';}
    initialId(){return location.hash&&this.byId.has(location.hash.slice(1))?location.hash.slice(1):this.pickActive()?.id||this.items[0]?.id||'';}

    direct(node,className){return[...node.children].find(child=>child.classList.contains(className))||null;}
    row(node){return this.direct(node,'toc-row');}
    branch(node){return this.direct(node,'toc-branch');}
    toggle(node){return this.row(node)?.querySelector('[data-nav-toggle]')||null;}
    parentNode(node){const list=node.parentElement;return list?.classList.contains('toc-branch')?list.parentElement:null;}

    collectItems(){
      return[...this.tree.querySelectorAll('[data-nav-id]')].map(node=>{
        const row=this.row(node);
        const button=row?.querySelector('[data-nav-target]');
        const id=button?.dataset.navTarget||'';
        const section=id?document.querySelector('[data-track="'+CSS.escape(id)+'"]'):null;
        return{
          id,node,row,button,section,
          depth:Number(node.dataset.navDepth)||1,
          glossaryNested:Boolean(section&&section!==this.glossary&&section.closest('#glossary'))
        };
      }).filter(item=>item.id&&item.button&&item.section);
    }

    bind(){
      this.tree.addEventListener('click',event=>{
        const arrow=event.target.closest('[data-nav-toggle]');
        if(arrow&&this.tree.contains(arrow)){
          event.preventDefault();
          this.toggleBranch(arrow.closest('[data-nav-id]'));
          return;
        }
        const title=event.target.closest('[data-nav-target]');
        if(!title||!this.tree.contains(title))return;
        event.preventDefault();
        const node=title.closest('[data-nav-id]');
        this.revealPath(node,{includeSelf:true});
        this.go(title.dataset.navTarget);
      });

      this.menuButton.addEventListener('click',()=>this.setDrawer(!this.state.drawer,{restoreFocus:true}));
      this.collapseButton.addEventListener('click',()=>this.setCollapsed(!this.state.collapsed));
      this.scrim.addEventListener('click',()=>this.setDrawer(false,{restoreFocus:true}));

      window.addEventListener('scroll',()=>this.scheduleRead(),{passive:true});
      window.addEventListener('resize',()=>this.handleResize(),{passive:true});
      window.addEventListener('wheel',()=>this.cancelTransition(),{passive:true});
      window.addEventListener('touchstart',()=>this.cancelTransition(),{passive:true});
      window.addEventListener('pointerdown',()=>this.cancelTransition(),{passive:true});
      document.addEventListener('keydown',event=>this.handleKeydown(event));
    }

    handleKeydown(event){
      if(SCROLL_KEYS.has(event.key))this.cancelTransition();
      if(event.key==='Tab'&&this.state.drawer)this.trapDrawerFocus(event);
      if(event.key==='Escape'&&this.state.drawer&&!document.querySelector('#popupLayer .term-popup')){
        event.preventDefault();
        this.setDrawer(false,{restoreFocus:true});
      }
    }

    closeAllBranches(){for(const item of this.items)this.closeBranch(item.node,{deep:true});}
    closeBranch(node,{deep=true}={}){
      const branch=this.branch(node);
      if(!branch)return;
      branch.hidden=true;
      this.toggle(node)?.setAttribute('aria-expanded','false');
      if(deep)for(const child of branch.children)if(child.matches('[data-nav-id]'))this.closeBranch(child,{deep:true});
    }
    openBranch(node){
      const branch=this.branch(node);
      if(!branch)return;
      for(const sibling of node.parentElement.children){
        if(sibling!==node&&sibling.matches('[data-nav-id]'))this.closeBranch(sibling,{deep:true});
      }
      branch.hidden=false;
      this.toggle(node)?.setAttribute('aria-expanded','true');
    }
    toggleBranch(node){
      const branch=this.branch(node);
      if(!branch)return;
      branch.hidden?this.openBranch(node):this.closeBranch(node,{deep:true});
    }
    revealPath(node,{includeSelf=false}={}){
      const ancestors=[];
      for(let parent=this.parentNode(node);parent;parent=this.parentNode(parent))ancestors.unshift(parent);
      for(const parent of ancestors)this.openBranch(parent);
      if(includeSelf)this.openBranch(node);
    }

    setInteractive(root,interactive){
      if(this.supportsInert){root.inert=!interactive;return;}
      const saved='data-nav-tabindex';
      for(const control of root.querySelectorAll(FOCUSABLE)){
        if(!interactive&&!control.hasAttribute(saved)){
          control.setAttribute(saved,control.getAttribute('tabindex')??'');
          control.setAttribute('tabindex','-1');
        }else if(interactive&&control.hasAttribute(saved)){
          const value=control.getAttribute(saved);
          control.removeAttribute(saved);
          value===''?control.removeAttribute('tabindex'):control.setAttribute('tabindex',value);
        }
      }
    }
    applyViewportState(){
      const panelHidden=this.mobile?!this.state.drawer:this.state.collapsed;
      this.setInteractive(this.panel,!panelHidden);
      this.panel.setAttribute('aria-hidden',String(panelHidden));

      const documentBlocked=this.mobile&&this.state.drawer;
      this.setInteractive(this.main,!documentBlocked);
      documentBlocked?this.main.setAttribute('aria-hidden','true'):this.main.removeAttribute('aria-hidden');

      this.scrim.setAttribute('aria-hidden',String(!this.state.drawer));
      document.body.classList.toggle('nav-drawer-open',this.state.drawer);
      document.body.classList.toggle('nav-collapsed',this.state.collapsed);
      this.menuButton.setAttribute('aria-expanded',String(this.state.drawer));
      this.menuButton.setAttribute('aria-label',this.state.drawer?'Close navigation':'Open navigation');
      this.collapseButton.setAttribute('aria-expanded',String(!this.state.collapsed));
      this.collapseButton.setAttribute('aria-label',this.state.collapsed?'Expand navigation':'Collapse navigation');
      this.collapseButton.textContent=this.state.collapsed?'▶':'◀';
    }
    setDrawer(open,{restoreFocus=false}={}){
      const next=this.mobile&&Boolean(open);
      if(next===this.state.drawer)return;
      this.state.drawer=next;
      this.applyViewportState();
      if(next)requestAnimationFrame(()=>this.panel.querySelector('[data-nav-target]')?.focus({preventScroll:true}));
      else if(restoreFocus)this.menuButton.focus({preventScroll:true});
    }
    setCollapsed(collapsed){
      const next=this.mobile?false:Boolean(collapsed);
      if(next===this.state.collapsed)return;
      this.state.collapsed=next;
      this.applyViewportState();
      if(next)this.collapseButton.focus({preventScroll:true});
    }
    trapDrawerFocus(event){
      const controls=[...this.panel.querySelectorAll(FOCUSABLE)].filter(control=>control.tabIndex>=0&&!control.closest('[hidden]'));
      if(!controls.length)return;
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
    handleResize(){
      const mobile=window.innerWidth<=this.options.breakpoint;
      if(mobile!==this.mobile){
        this.mobile=mobile;
        this.state.drawer=false;
        if(mobile)this.state.collapsed=false;
        this.applyViewportState();
      }
      this.scheduleGeometry();
    }

    pathButtons(item){
      const buttons=new Set([item.button]);
      for(let parent=this.parentNode(item.node);parent;parent=this.parentNode(parent)){
        const button=this.row(parent)?.querySelector('[data-nav-target]');
        if(button)buttons.add(button);
      }
      return buttons;
    }
    activate(id,{reveal=true,keepVisible=true}={}){
      const item=this.byId.get(id);
      if(!item)return;
      const next=this.pathButtons(item);
      for(const button of this.activeButtons){
        if(next.has(button))continue;
        button.classList.remove('is-current','is-ancestor');
        button.removeAttribute('aria-current');
      }
      for(const button of next){
        const current=button===item.button;
        button.classList.toggle('is-current',current);
        button.classList.toggle('is-ancestor',!current);
        current?button.setAttribute('aria-current','location'):button.removeAttribute('aria-current');
      }
      this.activeButtons=next;
      this.state.active=id;
      if(reveal)this.revealPath(item.node);
      if(keepVisible)this.keepRowVisible(item.row);
    }
    keepRowVisible(row){
      if(!row||this.panel.getAttribute('aria-hidden')==='true')return;
      const panel=this.panel.getBoundingClientRect();
      const item=row.getBoundingClientRect();
      const gap=12;
      if(item.top<panel.top+gap)this.panel.scrollTop-=panel.top+gap-item.top;
      else if(item.bottom>panel.bottom-gap)this.panel.scrollTop+=item.bottom-panel.bottom+gap;
    }

    stickyClearance(itemOrElement){
      const item=itemOrElement?.section?itemOrElement:this.byId.get(itemOrElement?.dataset?.track||itemOrElement?.id);
      if(item)return item.glossaryNested?this.metrics.glossarySticky:0;
      return itemOrElement!==this.glossary&&itemOrElement?.closest?.('#glossary')?this.metrics.glossarySticky:0;
    }
    readerClearance(){return this.metrics.readerSticky||0;}
    controlLine(item){return window.scrollY+this.metrics.headerBottom+this.readerClearance()+this.options.trackingGap+this.stickyClearance(item);}
    destination(element){
      const top=window.scrollY+element.getBoundingClientRect().top;
      return Math.max(0,top-this.metrics.headerBottom-this.readerClearance()-this.options.trackingGap-this.stickyClearance(element));
    }
    scheduleGeometry(){
      if(this.raf.geometry)return;
      this.raf.geometry=requestAnimationFrame(()=>{this.raf.geometry=0;this.refreshGeometry();});
    }
    scheduleMetrics(){this.scheduleGeometry();}
    refreshGeometry(){
      const scrollY=window.scrollY;
      this.metrics.headerBottom=this.header.getBoundingClientRect().bottom;
      this.metrics.readerSticky=(this.readerTools?.getBoundingClientRect().height||0)+10;
      this.metrics.glossarySticky=this.glossaryTools?.getBoundingClientRect().height||0;
      const ranges=this.items.map(item=>{
        const rect=item.section.getBoundingClientRect();
        return{item,top:scrollY+rect.top,bottom:scrollY+rect.bottom,measurable:rect.width>0||rect.height>0};
      }).filter(range=>range.measurable).sort((a,b)=>a.top-b.top||a.item.depth-b.item.depth);

      const glossaryRanges=ranges.filter(range=>range.item.glossaryNested);
      glossaryRanges.forEach((range,index)=>{
        const next=glossaryRanges[index+1];
        const rootBottom=scrollY+(this.glossary?.getBoundingClientRect().bottom||range.bottom-scrollY);
        range.bottom=Math.max(range.bottom,next?.top??rootBottom);
      });
      this.metrics.ranges=ranges;
      this.readViewport();
    }
    pickActive(){
      let winner=null;
      for(const range of this.metrics.ranges){
        const line=this.controlLine(range.item);
        if(range.top>line+this.options.epsilon||range.bottom<=line)continue;
        if(!winner||range.item.depth>winner.item.depth||(range.item.depth===winner.item.depth&&range.top>winner.top))winner=range;
      }
      if(winner)return winner.item;

      for(const range of this.metrics.ranges){
        const line=this.controlLine(range.item);
        if(range.top>line+this.options.epsilon)continue;
        if(!winner||range.top>winner.top||(range.top===winner.top&&range.item.depth>winner.item.depth))winner=range;
      }
      return winner?.item||this.items[0]||null;
    }
    scheduleRead(){
      if(this.state.owner!=='reader'||this.raf.read)return;
      this.raf.read=requestAnimationFrame(()=>{this.raf.read=0;this.readViewport();});
    }
    readViewport(){
      if(this.state.owner!=='reader')return;
      const item=this.pickActive();
      if(item)this.activate(item.id,{reveal:true,keepVisible:true});
    }

    highlightTarget(element){
      if(element.matches?.('.glossary-card,.rule-card,.enhancement,.unit-card,.ability,.stratagem,.roster-card'))return element;
      if(element.classList?.contains('hero'))return element.querySelector('h1')||element;
      if(element.classList?.contains('detachment-part')){
        if(element.querySelector(':scope > .detachment-content > .stratagem'))return element.querySelector(':scope > .detachment-content > .stratagem');
        if(element.querySelector(':scope > .stratagem'))return element.querySelector(':scope > .stratagem');
      }
      const heading=[...element.children].find(child=>child.matches?.('.section-title,.category-title,.detachment-part-title')||/^H[1-6]$/.test(child.tagName||''));
      return heading||[...element.children].find(child=>child.matches?.('.glossary-card,.rule-card,.enhancement,.unit-card,.ability,.stratagem'))||element;
    }
    highlight(element){
      const target=this.highlightTarget(element);
      if(!target)return;
      target.classList.remove('destination-highlight');
      void target.offsetWidth;
      target.classList.add('destination-highlight');
      window.setTimeout(()=>target.classList.remove('destination-highlight'),2300);
    }

    go(id){
      const item=this.byId.get(id);
      if(!item)return;
      this.setDrawer(false,{restoreFocus:this.mobile});
      this.navigate(id,item.section);
    }
    navigate(id,element,settled){
      if(!this.byId.has(id)){
        const owner=[...this.items].reverse().find(item=>item.section.contains(element));
        if(owner)id=owner.id;
      }
      this.beginTransition(id,this.destination(element),()=>{this.highlight(element);settled?.();});
    }
    restore(id,scrollY,settled){this.beginTransition(id,Math.max(0,scrollY),settled);}
    beginTransition(id,destination,settled){
      this.cancelTransition({read:false});
      const token=++this.state.transition;
      this.state.owner='controller';
      this.activate(id,{reveal:true,keepVisible:true});
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top:destination,behavior:reduced?'auto':'smooth'});
      this.waitForSettle(destination,token,settled);
    }
    waitForSettle(destination,token,settled){
      const started=performance.now();
      let previous=window.scrollY,stable=0;
      const inspect=now=>{
        if(token!==this.state.transition)return;
        const current=window.scrollY;
        stable=Math.abs(current-previous)<=this.options.epsilon?stable+1:0;
        previous=current;
        const done=Math.abs(current-destination)<this.options.settleDistance||stable>=this.options.stableFrames||now-started>=this.options.maxTransitionMs;
        if(done){
          this.raf.transition=0;
          this.state.owner='reader';
          settled?.();
          this.refreshGeometry();
          return;
        }
        this.raf.transition=requestAnimationFrame(inspect);
      };
      this.raf.transition=requestAnimationFrame(inspect);
    }
    cancelTransition({read=true}={}){
      if(this.state.owner!=='controller')return;
      this.state.transition++;
      if(this.raf.transition)cancelAnimationFrame(this.raf.transition);
      this.raf.transition=0;
      const root=document.documentElement;
      const previousBehavior=root.style.scrollBehavior;
      root.style.scrollBehavior='auto';
      window.scrollTo({top:window.scrollY,left:window.scrollX,behavior:'auto'});
      root.style.scrollBehavior=previousBehavior;
      this.state.owner='reader';
      if(read)this.scheduleRead();
    }
  }

  window.DGNavigation=NavigationController;
}());
