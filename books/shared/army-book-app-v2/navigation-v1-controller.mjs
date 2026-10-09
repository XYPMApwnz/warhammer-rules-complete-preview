/** Actual V1 NavigationController presentation/interaction core, ported from
 * books/shared/controllers/navigation-controller.js at 5d2b976.
 * Only construction, V2 identity/mount/history and DOM target resolution are adapted.
 * Accordion, viewport/focus, geometry/scroll ownership, cancellation and settlement
 * algorithms are retained. No V1 factual or roster projection is imported. */
import {createLifecycle} from './lifecycle.mjs';

export class NavigationController{
    constructor(adapter){
      this.adapter=adapter;
      this.lifecycle=createLifecycle(window);this.destroyed=false;this.restorations=[];this.savedAttributes=new Map();
      this.breakpoint=800;this.resizeCleanupBreakpoint=800;this.trackingGap=18;this.epsilon=1;
      Object.assign(this,adapter.elements);
      this.attributeRoots=[this.panel,this.main,this.header,this.scrim,this.menuButton,this.collapseButton];
      this.rosterNavigation={active:false,items:[]};
      this.mobile=window.innerWidth<=this.breakpoint;this.viewportWidth=window.innerWidth;
      this.state={owner:'reader',active:'',instance:'',drawer:false,collapsed:false,transition:0};
      this.frames={reader:0,geometry:0,hash:0};this.geometry={headerBottom:0,ranges:[]};
      this.activeButtons=new Set();this.supportsInert='inert'in HTMLElement.prototype;
      this.highlighter=adapter.highlighter;
      for(const name of ['nav-drawer-open','nav-collapsed']){const present=document.body.classList.contains(name);this.restorations.push(()=>document.body.classList.toggle(name,present));}
      const style=document.documentElement.style,headerBottom=style.getPropertyValue('--app-header-bottom'),priority=style.getPropertyPriority('--app-header-bottom');
      this.restorations.push(()=>{if(headerBottom)style.setProperty('--app-header-bottom',headerBottom,priority);else style.removeProperty('--app-header-bottom');});
      for(const element of [this.panel,this.main,this.scrim,this.menuButton,this.collapseButton])for(const attribute of ['aria-hidden','aria-expanded','aria-label'])this.saveAttribute(element,attribute);
      const collapseText=this.collapseButton.textContent;this.restorations.push(()=>{this.collapseButton.textContent=collapseText;});
      this.lifecycle.cleanup(()=>{if(this.highlighter.destroy)this.highlighter.destroy();else this.highlighter.clear();});
      this.indexNavigationItems();this.bind();this.closeEveryBranch();this.applyViewportState();this.refreshGeometry();
      this.layoutObserver=this.lifecycle.observe(new ResizeObserver(this.lifecycle.guard(()=>this.scheduleGeometry())));
      this.layoutObserver.observe(this.header);this.layoutObserver.observe(this.main);
      this.removeParentCleanup=adapter.lifecycle?.cleanup(()=>this.destroy());
    }

    saveAttribute(element,name){
      if(!element)return;
      let saved=this.savedAttributes.get(element);if(!saved){saved=new Map();this.savedAttributes.set(element,saved);}if(saved.has(name))return;
      saved.set(name,element.getAttribute(name));
    }
    destroy(){
      if(this.destroyed)return;
      if(this.state.owner==='controller')this.stopControlledScroll();
      this.destroyed=true;
      this.removeParentCleanup?.();
      this.state.transition++;this.state.owner='reader';
      this.lifecycle.destroy();
      for(const [element,attributes] of this.savedAttributes)for(const [name,value] of attributes){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);}
      this.savedAttributes.clear();
      for(const restore of this.restorations.reverse())restore();
      this.restorations=[];this.activeButtons.clear();this.frames={reader:0,geometry:0,hash:0};
    }

    get active(){return this.state.active||'start';}
    get activeInstance(){return this.state.instance||'';}

    indexNavigationItems(){
      if(this.destroyed)return;
      // Removed Contents and fallback focus controls have no presentation owner.
      for(const [element,attributes] of this.savedAttributes)if(!this.attributeRoots.some(root=>root===element||root.contains(element))){
        for(const [name,value] of attributes){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);}
        this.savedAttributes.delete(element);
      }
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
      this.lifecycle.listen(this.tree,'click',event=>{
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

      this.lifecycle.listen(this.menuButton,'touchstart',event=>{event.preventDefault();this.menuButton.click();},{passive:false});
      this.lifecycle.listen(this.menuButton,'click',()=>this.setDrawer(!this.state.drawer));
      this.lifecycle.listen(this.collapseButton,'click',()=>this.setCollapsed(!this.state.collapsed));
      this.lifecycle.listen(this.scrim,'click',()=>this.setDrawer(false));
      this.lifecycle.listen(window,'scroll',()=>this.scheduleRead(),{passive:true});
      this.lifecycle.listen(window,'resize',()=>this.handleResize(),{passive:true});
      this.lifecycle.listen(window,'wheel',event=>this.cancelTransition(event),{passive:true});
      this.lifecycle.listen(window,'touchstart',event=>this.cancelTransition(event),{passive:true});
      this.lifecycle.listen(window,'pointerdown',event=>this.cancelTransition(event),{passive:true});
      this.lifecycle.listen(document,'keydown',event=>{
        if(['PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' '].includes(event.key))this.cancelTransition();
        if(event.key==='Tab'&&this.state.drawer)this.trapDrawerFocus(event);
        if(event.key==='Escape'&&this.state.drawer&&!document.querySelector('dialog[open]'))this.setDrawer(false);
      });
    }

    closeEveryBranch(){for(const item of this.items)this.closeBranch(item.node,{deep:true});}
    closeBranch(node,{deep=true}={}){
      if(this.destroyed)return;
      const branch=this.branch(node),toggle=this.toggle(node);if(!branch)return;
      this.saveAttribute(branch,'hidden');this.saveAttribute(toggle,'aria-expanded');
      branch.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');
      if(deep)for(const child of branch.children)if(child.matches('[data-nav-id]'))this.closeBranch(child,{deep:true});
    }
    openBranch(node){
      if(this.destroyed)return;
      const branch=this.branch(node),toggle=this.toggle(node);if(!branch)return;
      this.saveAttribute(branch,'hidden');this.saveAttribute(toggle,'aria-expanded');
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
      if(this.destroyed||!root)return;
      if(this.supportsInert){this.saveAttribute(root,'inert');root.inert=!interactive;return;}
      const key='data-nav-saved-tabindex';
      const selector='a,button,input,select,textarea,[tabindex]';
      const controls=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
      for(const control of controls){
        this.saveAttribute(control,key);this.saveAttribute(control,'tabindex');
        if(!interactive&&!control.hasAttribute(key)){
          control.setAttribute(key,control.getAttribute('tabindex')??'');control.setAttribute('tabindex','-1');
        }else if(interactive&&control.hasAttribute(key)){
          const saved=control.getAttribute(key);control.removeAttribute(key);
          if(saved==='')control.removeAttribute('tabindex');else control.setAttribute('tabindex',saved);
        }
      }
    }
    applyViewportState(){
      if(this.destroyed)return;
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
      if(this.destroyed)return;
      const next=this.mobile&&Boolean(open);if(next===this.state.drawer)return;
      const returnFocus=this.state.drawer;
      this.state.drawer=next;this.applyViewportState();
      if(next)this.lifecycle.frame(()=>this.panel.querySelector('[data-nav-target]')?.focus({preventScroll:true}));
      else if(returnFocus)this.menuButton.focus({preventScroll:true});
    }
    setCollapsed(collapsed){
      if(this.destroyed)return;
      const next=this.mobile?false:Boolean(collapsed);if(next===this.state.collapsed)return;
      const returnFocus=!this.state.collapsed&&this.panel.contains(document.activeElement);
      this.state.collapsed=next;this.applyViewportState();
      if(returnFocus&&next)this.collapseButton.focus({preventScroll:true});
    }
    trapDrawerFocus(event){
      if(this.destroyed)return;
      const controls=[this.menuButton,...this.panel.querySelectorAll('a,button,input,select,textarea,[tabindex]')].filter(control=>control&&control.tabIndex>=0&&!control.closest('[hidden]'));
      if(controls.length<2)return;
      const menu=controls[0],first=controls[1],last=controls[controls.length-1],active=document.activeElement;
      if(event.shiftKey&&active===first){event.preventDefault();menu.focus();}
      else if(!event.shiftKey&&active===menu){event.preventDefault();first.focus();}
      else if(!event.shiftKey&&active===last){event.preventDefault();menu.focus();}
      else if(event.shiftKey&&active===menu){event.preventDefault();last.focus();}
    }
    handleResize(){
      if(this.destroyed)return;
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
      this.lifecycle.frame(()=>this.scheduleGeometry());
    }

    buttonSet(item){
      const buttons=new Set([item.button]);
      for(let parent=this.parentNode(item.node);parent;parent=this.parentNode(parent)){
        const button=this.direct(parent,'toc-row')?.querySelector('[data-nav-target]');if(button)buttons.add(button);
      }
      return buttons;
    }
    activate(id,{instanceId='',keepVisible=true,behavior='auto'}={}){
      if(this.destroyed)return;
      const item=this.itemFor(id,instanceId);if(!item)return;
      const next=this.buttonSet(item);
      for(const button of new Set([...next,...this.activeButtons])){this.saveAttribute(button,'class');this.saveAttribute(button,'aria-current');}
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
      if(this.destroyed||!row||this.panel.inert||this.panel.getAttribute('aria-hidden')==='true')return;
      const panel=this.panel.getBoundingClientRect(),item=row.getBoundingClientRect(),gap=12;
      if(item.top<panel.top+gap)this.panel.scrollTo({top:this.panel.scrollTop-(panel.top+gap-item.top),behavior});
      else if(item.bottom>panel.bottom-gap)this.panel.scrollTo({top:this.panel.scrollTop+(item.bottom-panel.bottom+gap),behavior});
    }

    destination(element,inset=this.geometry.headerBottom+this.trackingGap){
      return Math.max(0,window.scrollY+element.getBoundingClientRect().top-inset);
    }
    scheduleGeometry(){
      if(this.destroyed||this.frames.geometry)return;
      this.frames.geometry=this.lifecycle.frame(()=>{this.frames.geometry=0;this.refreshGeometry();});
    }
    refreshGeometry(){
      if(this.destroyed)return;
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
      if(this.destroyed||this.state.owner!=='reader'||this.frames.reader)return;
      this.frames.reader=this.lifecycle.frame(()=>{this.frames.reader=0;this.readViewport();});
    }
    readViewport(){
      if(this.destroyed||this.state.owner!=='reader'||!this.adapter.tracking())return;
      const item=this.pickActive();
      if(item&&(item.id!==this.state.active||item.instanceId!==this.state.instance))this.activate(item.id,{instanceId:item.instanceId});
      else if(item&&!this.pathIsOpen(item.node))this.revealPath(item.node,{includeSelf:true});
    }

    async go(id,{historyMode='none',instanceId=''}={}){
      if(this.destroyed)return;
      const item=this.itemFor(id,instanceId);if(!item)return;
      if(this.mobile&&this.targetKind(id)==='branch'){this.toggleBranch(item.node);return;}
      this.adapter.navigate(id,instanceId,historyMode);
      if(this.destroyed)return;
      const current=this.itemFor(id,instanceId),section=this.sectionFor(current);
      if(!section)return;
      this.setDrawer(false);this.refreshGeometry();this.navigate(id,section,null,instanceId);
    }
    navigate(id,element,settled,instanceId=''){
      if(this.destroyed)return;
      const targets=this.adapter.resolve(element);
      if(!targets.scrollTarget)return;
      this.beginTransition(id,this.destination(targets.scrollTarget),()=>{this.highlighter.show(targets.highlightTarget);this.adapter.settled?.(id);settled?.();},instanceId);
    }
    navigateSection(id,section,{nav=null,settled,instanceId=''}={}){
      if(this.destroyed)return;
      const targets=this.adapter.resolve(section);if(!targets.scrollTarget)return;
      const navHeight=nav?.getBoundingClientRect().height||0;
      const inset=this.geometry.headerBottom+navHeight+this.trackingGap;
      const highlightTarget=targets.kind==='logical-section'?targets.highlightTarget:section;
      const complete=()=>{this.highlighter.show(highlightTarget);settled?.();};
      this.beginTransition(id,this.destination(targets.scrollTarget,inset),complete,instanceId);
    }
    beginTransition(id,destination,settled,instanceId=''){
      if(this.destroyed)return;
      if(this.state.owner==='controller')this.stopControlledScroll();
      const token=++this.state.transition;this.state.owner='controller';this.activate(id,{instanceId,behavior:'auto'});
      const reachable=this.reachableDestination(destination);
      if(this.mobile||matchMedia('(prefers-reduced-motion:reduce)').matches)this.scrollImmediately(reachable);
      else window.scrollTo({top:reachable,behavior:'smooth'});
      this.waitForSettle(reachable,token,settled);
    }
    reachableDestination(destination){return Math.min(Math.max(0,destination),Math.max(0,document.documentElement.scrollHeight-window.innerHeight));}
    scrollImmediately(top){
      if(this.destroyed)return;
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
          this.lifecycle.frame(()=>{if(token!==this.state.transition)return;this.state.owner='reader';settled?.();this.refreshGeometry();});
          return;
        }
        this.lifecycle.frame(inspect);
      };
      this.lifecycle.frame(inspect);
    }
    cancelTransition(event){
      if(this.destroyed)return;
      const target=event?.target;
      if(target&&(this.panel.contains(target)||this.menuButton.contains(target)||this.collapseButton.contains(target)))return;
      if(this.state.owner!=='controller')return;
      this.stopControlledScroll();this.state.transition++;this.state.owner='reader';this.scheduleRead();
    }
  }
