/** Actual V1 NavigationController presentation/interaction core, ported from
 * books/shared/controllers/navigation-controller.js at 5d2b976.
 * Only construction, V2 identity/mount/history and DOM target resolution are adapted.
 * Accordion, viewport/focus, geometry/scroll ownership, cancellation and settlement
 * algorithms are retained. No V1 factual or roster projection is imported. */
export class NavigationController{
    constructor(adapter){
      this.adapter=adapter;
      this.breakpoint=800;this.resizeCleanupBreakpoint=800;this.trackingGap=18;this.epsilon=1;
      Object.assign(this,adapter.elements);
      this.rosterNavigation={active:false,items:[]};
      this.mobile=window.innerWidth<=this.breakpoint;this.viewportWidth=window.innerWidth;
      this.state={owner:'reader',active:'',instance:'',drawer:false,collapsed:false,transition:0};
      this.frames={reader:0,geometry:0,hash:0};this.geometry={headerBottom:0,ranges:[]};
      this.activeButtons=new Set();this.supportsInert='inert'in HTMLElement.prototype;
      this.highlighter=adapter.highlighter;
      this.indexNavigationItems();this.bind();this.closeEveryBranch();this.applyViewportState();this.refreshGeometry();
      this.layoutObserver=new ResizeObserver(()=>this.scheduleGeometry());
      this.layoutObserver.observe(this.header);this.layoutObserver.observe(this.main);
    }

    get active(){return this.state.active||'start';}
    get activeInstance(){return this.state.instance||'';}

    indexNavigationItems(){
      this.items=[...this.tree.querySelectorAll('[data-nav-id]')].map(node=>{
        const row=this.direct(node,'toc-row');
        const button=row?.querySelector('[data-nav-target]');
        const id=button?.dataset.navTarget||'';
        const instanceId=button?.dataset.rosterInstance||'';
        return{id,instanceId,key:instanceId||id,node,row,button,depth:Number(node.dataset.navDepth)};
      }).filter(item=>item.id&&item.button);
      this.byId=new Map();this.byInstance=new Map();for(const item of this.items){if(!this.byId.has(item.id))this.byId.set(item.id,item);if(item.instanceId)this.byInstance.set(item.instanceId,item);}
    }
    direct(node,className){return[...node.children].find(child=>child.classList.contains(className))||null;}
    targetKind(id){return this.adapter.kind(id);}
    canonicalTarget(id){return id;}
    itemFor(id,instanceId=''){return instanceId?this.byInstance.get(instanceId)||null:this.byId.get(this.adapter.itemId?.(id)||id)||null;}
    sectionFor(item,requestedId=item?.id){return item?this.adapter.section(requestedId,item.instanceId):null;}
    branch(node){return this.direct(node,'toc-branch');}
    parentNode(node){const list=node.parentElement;return list?.classList.contains('toc-branch')?list.parentElement:null;}
    toggle(node){return this.direct(node,'toc-row')?.querySelector('[data-nav-toggle]')||null;}

    bind(){
      this.tree.addEventListener('click',event=>{
        const toggle=event.target.closest('[data-nav-toggle]');
        if(toggle&&this.tree.contains(toggle)){
          event.preventDefault();this.toggleBranch(toggle.closest('[data-nav-id]'));return;
        }
        const label=event.target.closest('[data-nav-target]');
        if(!label||!this.tree.contains(label))return;
        event.preventDefault();
        const node=label.closest('[data-nav-id]');
        if(this.mobile&&this.targetKind(label.dataset.navTarget)==='branch'){this.toggleBranch(node);return;}
        if(label.dataset.navTarget==='start')this.closeEveryBranch();
        else this.revealPath(node,{includeSelf:true});
        this.go(label.dataset.navTarget,{historyMode:'push',instanceId:label.dataset.rosterInstance||''});
      });

      this.menuButton.addEventListener('touchstart',event=>{event.preventDefault();this.menuButton.click();},{passive:false});
      this.menuButton.addEventListener('click',()=>this.setDrawer(!this.state.drawer));
      this.collapseButton.addEventListener('click',()=>this.setCollapsed(!this.state.collapsed));
      this.scrim.addEventListener('click',()=>this.setDrawer(false));
      window.addEventListener('scroll',()=>this.scheduleRead(),{passive:true});
      window.addEventListener('resize',()=>this.handleResize(),{passive:true});
      window.addEventListener('wheel',event=>this.cancelTransition(event),{passive:true});
      window.addEventListener('touchstart',event=>this.cancelTransition(event),{passive:true});
      window.addEventListener('pointerdown',event=>this.cancelTransition(event),{passive:true});
      document.addEventListener('keydown',event=>{
        if(['PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' '].includes(event.key))this.cancelTransition();
        if(event.key==='Tab'&&this.state.drawer)this.trapDrawerFocus(event);
        if(event.key==='Escape'&&this.state.drawer&&!document.querySelector('dialog[open]'))this.setDrawer(false);
      });
    }

    closeEveryBranch(){for(const item of this.items)this.closeBranch(item.node,{deep:true});}
    closeBranch(node,{deep=true}={}){
      const branch=this.branch(node),toggle=this.toggle(node);if(!branch)return;
      branch.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');
      if(deep)for(const child of branch.children)if(child.matches('[data-nav-id]'))this.closeBranch(child,{deep:true});
    }
    openBranch(node){
      const branch=this.branch(node),toggle=this.toggle(node);if(!branch)return;
      if(branch.hidden){
        for(const peer of node.parentElement.children)if(peer!==node&&peer.matches('[data-nav-id]'))this.closeBranch(peer,{deep:true});
        branch.hidden=false;
      }
      if(toggle)toggle.setAttribute('aria-expanded','true');
    }
    toggleBranch(node){
      const branch=this.branch(node);if(!branch)return;
      if(branch.hidden)this.openBranch(node);else this.closeBranch(node,{deep:true});
    }
    pathIsOpen(node){
      for(let current=node;current;current=this.parentNode(current))if(this.branch(current)?.hidden)return false;
      return true;
    }
    revealPath(node,{includeSelf=false}={}){
      const path=[];for(let parent=this.parentNode(node);parent;parent=this.parentNode(parent))path.unshift(parent);
      for(const parent of path)this.openBranch(parent);
      if(includeSelf)this.openBranch(node);
    }

    setInteractive(root,interactive){
      if(!root)return;
      if(this.supportsInert){root.inert=!interactive;return;}
      const key='data-nav-saved-tabindex';
      const selector='a,button,input,select,textarea,[tabindex]';
      const controls=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
      for(const control of controls){
        if(!interactive&&!control.hasAttribute(key)){
          control.setAttribute(key,control.getAttribute('tabindex')??'');control.setAttribute('tabindex','-1');
        }else if(interactive&&control.hasAttribute(key)){
          const saved=control.getAttribute(key);control.removeAttribute(key);
          if(saved==='')control.removeAttribute('tabindex');else control.setAttribute('tabindex',saved);
        }
      }
    }
    applyViewportState(){
      const panelHidden=this.mobile?!this.state.drawer:this.state.collapsed;
      this.setInteractive(this.panel,!panelHidden);
      this.panel.setAttribute('aria-hidden',String(panelHidden));
      const documentBlocked=this.mobile&&this.state.drawer;
      this.setInteractive(this.main,!documentBlocked);
      for(const child of this.header?.children||[])if(child!==this.menuButton)this.setInteractive(child,!documentBlocked);
      if(documentBlocked)this.main.setAttribute('aria-hidden','true');else this.main.removeAttribute('aria-hidden');
      this.scrim.setAttribute('aria-hidden',String(!this.state.drawer));
      document.body.classList.toggle('nav-drawer-open',this.state.drawer);
      document.body.classList.toggle('nav-collapsed',this.state.collapsed);
      this.menuButton.setAttribute('aria-expanded',String(this.state.drawer));
      this.menuButton.setAttribute('aria-label',this.state.drawer?'Close navigation':'Open navigation');
      this.collapseButton.setAttribute('aria-expanded',String(!this.state.collapsed));
      this.collapseButton.setAttribute('aria-label',this.state.collapsed?'Expand navigation':'Collapse navigation');
      this.collapseButton.textContent=this.state.collapsed?'▶':'◀';
    }
    setDrawer(open){
      const next=this.mobile&&Boolean(open);if(next===this.state.drawer)return;
      const returnFocus=this.state.drawer;
      this.state.drawer=next;this.applyViewportState();
      if(next)requestAnimationFrame(()=>this.panel.querySelector('[data-nav-target]')?.focus({preventScroll:true}));
      else if(returnFocus)this.menuButton.focus({preventScroll:true});
    }
    setCollapsed(collapsed){
      const next=this.mobile?false:Boolean(collapsed);if(next===this.state.collapsed)return;
      const returnFocus=!this.state.collapsed&&this.panel.contains(document.activeElement);
      this.state.collapsed=next;this.applyViewportState();
      if(returnFocus&&next)this.collapseButton.focus({preventScroll:true});
    }
    trapDrawerFocus(event){
      const controls=[this.menuButton,...this.panel.querySelectorAll('a,button,input,select,textarea,[tabindex]')].filter(control=>control&&control.tabIndex>=0&&!control.closest('[hidden]'));
      if(controls.length<2)return;
      const menu=controls[0],first=controls[1],last=controls[controls.length-1],active=document.activeElement;
      if(event.shiftKey&&active===first){event.preventDefault();menu.focus();}
      else if(!event.shiftKey&&active===menu){event.preventDefault();first.focus();}
      else if(!event.shiftKey&&active===last){event.preventDefault();menu.focus();}
      else if(event.shiftKey&&active===menu){event.preventDefault();last.focus();}
    }
    handleResize(){
      const crossedCleanupBreakpoint=(this.viewportWidth<=this.resizeCleanupBreakpoint)!==(window.innerWidth<=this.resizeCleanupBreakpoint);
      const widthChanged=Math.abs(window.innerWidth-this.viewportWidth)>1;
      this.viewportWidth=window.innerWidth;
      if(widthChanged&&this.state.owner==='controller')this.cancelTransition();
      const focusWasInPanel=this.panel.contains(document.activeElement);
      const mobile=window.innerWidth<=this.breakpoint;
      if(mobile!==this.mobile||(crossedCleanupBreakpoint&&this.state.drawer)){
        this.mobile=mobile;this.state.drawer=false;if(mobile)this.state.collapsed=false;this.applyViewportState();
      }
      if(focusWasInPanel&&this.panel.getAttribute('aria-hidden')==='true')this.menuButton.focus({preventScroll:true});
      requestAnimationFrame(()=>this.scheduleGeometry());
    }

    buttonSet(item){
      const buttons=new Set([item.button]);
      for(let parent=this.parentNode(item.node);parent;parent=this.parentNode(parent)){
        const button=this.direct(parent,'toc-row')?.querySelector('[data-nav-target]');if(button)buttons.add(button);
      }
      return buttons;
    }
    activate(id,{instanceId='',keepVisible=true,behavior='auto'}={}){
      const item=this.itemFor(id,instanceId);if(!item)return;
      const next=this.buttonSet(item);
      for(const button of this.activeButtons)if(!next.has(button)){
        button.classList.remove('is-current','is-ancestor');button.removeAttribute('aria-current');
      }
      item.button.classList.remove('is-ancestor');item.button.classList.add('is-current');item.button.setAttribute('aria-current','location');
      for(const button of next)if(button!==item.button){button.classList.remove('is-current');button.classList.add('is-ancestor');button.removeAttribute('aria-current');}
      this.activeButtons=next;this.state.active=item.id;this.state.instance=item.instanceId;
      this.revealPath(item.node,{includeSelf:true});
      if(keepVisible)this.keepRowVisible(item.row,behavior);
    }
    keepRowVisible(row,behavior='auto'){
      if(!row||this.panel.inert||this.panel.getAttribute('aria-hidden')==='true')return;
      const panel=this.panel.getBoundingClientRect(),item=row.getBoundingClientRect(),gap=12;
      if(item.top<panel.top+gap)this.panel.scrollTo({top:this.panel.scrollTop-(panel.top+gap-item.top),behavior});
      else if(item.bottom>panel.bottom-gap)this.panel.scrollTo({top:this.panel.scrollTop+(item.bottom-panel.bottom+gap),behavior});
    }

    destination(element,inset=this.geometry.headerBottom+this.trackingGap){
      return Math.max(0,window.scrollY+element.getBoundingClientRect().top-inset);
    }
    scheduleGeometry(){
      if(this.frames.geometry)return;
      this.frames.geometry=requestAnimationFrame(()=>{this.frames.geometry=0;this.refreshGeometry();});
    }
    refreshGeometry(){
      const scrollY=window.scrollY;
      this.geometry.headerBottom=this.header.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty('--app-header-bottom',`${Math.max(0,this.geometry.headerBottom)}px`);
      this.geometry.ranges=this.items.map(item=>{
        const supplied=this.adapter.range?.(item);if(supplied)return {item,...supplied};
        const section=this.sectionFor(item);if(!section)return null;
        const rect=section.getBoundingClientRect(),leadingMargin=parseFloat(getComputedStyle(section).marginTop)||0;
        return{item,top:scrollY+rect.top-leadingMargin,bottom:scrollY+rect.bottom,measurable:rect.width>0||rect.height>0};
      }).filter(Boolean);
      this.readViewport();
    }
    descendsFrom(item,ancestor){
      for(let node=this.parentNode(item.node);node;node=this.parentNode(node))if(node===ancestor.node)return true;
      return false;
    }
    lastCrossedDescendant(parent,scrollY){
      let descendant=null;
      for(const range of this.geometry.ranges){
        if(range.measurable===false)continue;
        if(!this.descendsFrom(range.item,parent.item))continue;
        const line=scrollY+this.geometry.headerBottom+this.trackingGap;
        if(range.top<=line+this.epsilon&&(!descendant||range.top>descendant.top||range.top===descendant.top&&range.item.depth>descendant.item.depth))descendant=range;
      }
      return descendant;
    }
    pickActive(){
      const scrollY=window.scrollY;let winner=null;
      for(const range of this.geometry.ranges){
        if(range.measurable===false)continue;
        const line=scrollY+this.geometry.headerBottom+this.trackingGap;
        if(range.top<=line+this.epsilon&&range.bottom>line&&(!winner||range.item.depth>winner.item.depth||range.item.depth===winner.item.depth&&range.top>winner.top))winner=range;
      }
      if(winner)return this.lastCrossedDescendant(winner,scrollY)?.item||winner.item;
      for(const range of this.geometry.ranges){
        if(range.measurable===false)continue;
        const line=scrollY+this.geometry.headerBottom+this.trackingGap;
        if(range.top<=line+this.epsilon&&(!winner||range.top>winner.top||range.top===winner.top&&range.item.depth>winner.item.depth))winner=range;
      }
      return winner?.item||this.items[0]||null;
    }
    scheduleRead(){
      if(this.state.owner!=='reader'||this.frames.reader)return;
      this.frames.reader=requestAnimationFrame(()=>{this.frames.reader=0;this.readViewport();});
    }
    readViewport(){
      if(this.state.owner!=='reader'||!this.adapter.tracking())return;
      const item=this.pickActive();
      if(item&&(item.id!==this.state.active||item.instanceId!==this.state.instance))this.activate(item.id,{instanceId:item.instanceId});
      else if(item&&!this.pathIsOpen(item.node))this.revealPath(item.node,{includeSelf:true});
    }

    async go(id,{historyMode='none',instanceId=''}={}){
      const item=this.itemFor(id,instanceId);if(!item)return;
      if(this.mobile&&this.targetKind(id)==='branch'){this.toggleBranch(item.node);return;}
      this.adapter.navigate(id,instanceId,historyMode);
      const current=this.itemFor(id,instanceId),section=this.sectionFor(current);
      if(!section)return;
      this.setDrawer(false);this.refreshGeometry();this.navigate(id,section,null,instanceId);
    }
    navigate(id,element,settled,instanceId=''){
      const targets=this.adapter.resolve(element);
      if(!targets.scrollTarget)return;
      this.beginTransition(id,this.destination(targets.scrollTarget),()=>{this.highlighter.show(targets.highlightTarget);this.adapter.settled?.(id);settled?.();},instanceId);
    }
    navigateSection(id,section,{nav=null,settled,instanceId=''}={}){
      const targets=this.adapter.resolve(section);if(!targets.scrollTarget)return;
      const navHeight=nav?.getBoundingClientRect().height||0;
      const inset=this.geometry.headerBottom+navHeight+this.trackingGap;
      const highlightTarget=targets.kind==='logical-section'?targets.highlightTarget:section;
      const complete=()=>{this.highlighter.show(highlightTarget);settled?.();};
      this.beginTransition(id,this.destination(targets.scrollTarget,inset),complete,instanceId);
    }
    beginTransition(id,destination,settled,instanceId=''){
      if(this.state.owner==='controller')this.stopControlledScroll();
      const token=++this.state.transition;this.state.owner='controller';this.activate(id,{instanceId,behavior:'auto'});
      const reachable=this.reachableDestination(destination);
      if(this.mobile||matchMedia('(prefers-reduced-motion:reduce)').matches)this.scrollImmediately(reachable);
      else window.scrollTo({top:reachable,behavior:'smooth'});
      this.waitForSettle(reachable,token,settled);
    }
    reachableDestination(destination){return Math.min(Math.max(0,destination),Math.max(0,document.documentElement.scrollHeight-window.innerHeight));}
    scrollImmediately(top){
      const root=document.documentElement,previous=root.style.scrollBehavior;
      root.style.scrollBehavior='auto';
      window.scrollTo({left:window.scrollX,top,behavior:'auto'});
      root.style.scrollBehavior=previous;
    }
    stopControlledScroll(){
      this.scrollImmediately(window.scrollY);
    }
    waitForSettle(destination,token,settled){
      const started=Date.now();let previous=window.scrollY,stable=0;
      const inspect=()=>{
        if(token!==this.state.transition)return;
        const current=window.scrollY,reachable=this.reachableDestination(destination),atDestination=Math.abs(current-reachable)<2;
        stable=atDestination&&Math.abs(current-previous)<1?stable+1:0;previous=current;
        if(stable>=6){
          this.state.owner='reader';settled?.();this.readViewport();return;
        }
        if(Date.now()-started>2200){
          this.stopControlledScroll();
          this.scrollImmediately(this.reachableDestination(destination));
          requestAnimationFrame(()=>{if(token!==this.state.transition)return;this.state.owner='reader';settled?.();this.refreshGeometry();});
          return;
        }
        requestAnimationFrame(inspect);
      };
      requestAnimationFrame(inspect);
    }
    cancelTransition(event){
      const target=event?.target;
      if(target&&(this.panel.contains(target)||this.menuButton.contains(target)||this.collapseButton.contains(target)))return;
      if(this.state.owner!=='controller')return;
      this.stopControlledScroll();this.state.transition++;this.state.owner='reader';this.scheduleRead();
    }
  }
