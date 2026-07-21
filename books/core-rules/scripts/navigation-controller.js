(function () {
  'use strict';

  class CoreNavigation {
    constructor() {
      this.header = document.getElementById('appHeader');
      this.panel = document.getElementById('tocPanel');
      this.main = document.getElementById('main');
      this.menuButton = document.getElementById('navMenu');
      this.collapseButton = document.getElementById('navCollapse');
      this.scrim = document.getElementById('tocScrim');
      this.items = [...document.querySelectorAll('[data-nav-id]')].map((node) => {
        const id = node.dataset.navId;
        return { id, node, section:document.querySelector(`[data-track="${id}"]`), button:node.querySelector(':scope > .toc-row [data-nav-target]'), depth:Number(node.dataset.navDepth) };
      }).filter((item) => item.section && item.button);
      this.byId = new Map(this.items.map((item) => [item.id, item]));
      this.state = { owner:'reader', active:'cover', drawer:false, collapsed:false, transition:0 };
      this.mobile = window.innerWidth <= 800;
      this.frame = 0;
      this.bind(); this.select('cover'); this.onResize();
    }

    row(node){ return node?.querySelector(':scope > .toc-row'); }
    branch(node){ return node?.querySelector(':scope > [data-nav-branch]'); }
    toggle(node){ return this.row(node)?.querySelector('[data-nav-toggle]'); }
    parentNode(node){ return node?.parentElement?.closest?.('[data-nav-id]') || null; }

    bind() {
      this.items.forEach((item) => item.button.addEventListener('click', () => this.go(item.id)));
      this.panel.querySelectorAll('[data-nav-toggle]').forEach((button) => button.addEventListener('click', () => this.toggleBranch(button.closest('[data-nav-id]'))));
      this.menuButton.addEventListener('click', () => this.mobile ? this.setDrawer(!this.state.drawer) : this.setCollapsed(false));
      this.collapseButton.addEventListener('click', () => this.setCollapsed(!this.state.collapsed));
      this.scrim.addEventListener('click', () => this.setDrawer(false));
      window.addEventListener('scroll', () => this.scheduleRead(), { passive:true });
      window.addEventListener('resize', () => this.onResize(), { passive:true });
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && this.state.drawer && !document.querySelector('.term-popup')) this.setDrawer(false); });
    }

    closeBranch(node) { const branch=this.branch(node),toggle=this.toggle(node); if(!branch)return; branch.hidden=true; toggle?.setAttribute('aria-expanded','false'); toggle?.setAttribute('aria-label',`Expand ${this.row(node)?.querySelector('[data-nav-target] span')?.textContent||'section'}`); if(toggle)toggle.textContent='▶'; }
    openBranch(node) { const branch=this.branch(node),toggle=this.toggle(node); if(!branch)return; for(const peer of node.parentElement.children)if(peer!==node&&peer.matches?.('[data-nav-id]'))this.closeBranch(peer); branch.hidden=false; toggle?.setAttribute('aria-expanded','true'); toggle?.setAttribute('aria-label',`Collapse ${this.row(node)?.querySelector('[data-nav-target] span')?.textContent||'section'}`); if(toggle)toggle.textContent='▼'; }
    toggleBranch(node) { const branch=this.branch(node); if(branch) (branch.hidden ? this.openBranch(node) : this.closeBranch(node)); }
    revealPath(node) { for(let parent=this.parentNode(node);parent;parent=this.parentNode(parent)) this.openBranch(parent); }

    setInteractive(root, interactive) {
      root.inert = !interactive;
      root.setAttribute('aria-hidden', String(!interactive));
    }
    syncVisibility() {
      const panelHidden = this.mobile ? !this.state.drawer : this.state.collapsed;
      this.setInteractive(this.panel, !panelHidden);
      const blocked = this.mobile && this.state.drawer;
      this.setInteractive(this.main, !blocked);
      this.menuButton.setAttribute('aria-expanded', String(this.mobile ? this.state.drawer : !this.state.collapsed));
      this.scrim.setAttribute('aria-hidden', String(!this.state.drawer));
    }
    setDrawer(open) {
      const returnFocus = this.state.drawer && this.panel.contains(document.activeElement);
      this.state.drawer = this.mobile && Boolean(open);
      document.body.classList.toggle('nav-drawer-open', this.state.drawer);
      this.menuButton.setAttribute('aria-expanded', String(this.state.drawer));
      this.menuButton.setAttribute('aria-label', this.state.drawer ? 'Close contents' : 'Open contents');
      this.syncVisibility();
      if (returnFocus && !this.state.drawer) this.menuButton.focus({ preventScroll:true });
    }
    setCollapsed(collapsed) {
      this.state.collapsed = this.mobile ? false : Boolean(collapsed);
      document.body.classList.toggle('nav-collapsed', this.state.collapsed);
      this.collapseButton.setAttribute('aria-expanded', String(!this.state.collapsed));
      this.collapseButton.setAttribute('aria-label', this.state.collapsed ? 'Expand contents' : 'Collapse contents');
      this.collapseButton.textContent = this.state.collapsed ? '▶' : '◀';
      this.menuButton.setAttribute('aria-label', this.state.collapsed ? 'Expand contents' : 'Open contents');
      this.syncVisibility();
    }
    onResize() { const mobile=window.innerWidth<=800; if(mobile!==this.mobile){this.mobile=mobile;this.state.drawer=false;this.state.collapsed=false;document.body.classList.remove('nav-drawer-open','nav-collapsed');} this.syncVisibility(); this.scheduleRead(); }

    select(id, { reveal=true } = {}) {
      const selected=this.byId.get(id); if(!selected)return;
      this.state.active=id;
      this.items.forEach((item) => { item.button.classList.remove('is-current','is-ancestor'); item.button.removeAttribute('aria-current'); });
      selected.button.classList.add('is-current'); selected.button.setAttribute('aria-current','location');
      for(let parent=this.parentNode(selected.node);parent;parent=this.parentNode(parent)) this.row(parent)?.querySelector('[data-nav-target]')?.classList.add('is-ancestor');
      this.revealPath(selected.node); if(this.branch(selected.node))this.openBranch(selected.node); if(reveal)this.keepVisible(this.row(selected.node));
    }
    keepVisible(row) { if(!row || this.panel.inert)return; const panel=this.panel.getBoundingClientRect(),item=row.getBoundingClientRect(),gap=12; if(item.top<panel.top+gap)this.panel.scrollTop-=panel.top+gap-item.top; else if(item.bottom>panel.bottom-gap)this.panel.scrollTop+=item.bottom-panel.bottom+gap; }
    offsetFor(element) { const sticky=element.closest?.('#glossary') && element.id!=='glossary' ? document.querySelector('.glossary-tools')?.getBoundingClientRect().height || 0 : 0; return this.header.getBoundingClientRect().height + 18 + sticky; }
    destination(element) { return Math.max(0, window.scrollY + element.getBoundingClientRect().top - this.offsetFor(element)); }
    highlight(element) { const target=element.querySelector?.(':scope > .section-body > *') || element; target.classList.remove('destination-highlight'); void target.offsetWidth; target.classList.add('destination-highlight'); setTimeout(()=>target.classList.remove('destination-highlight'),2300); }
    go(id) { const item=this.byId.get(id); if(!item)return; this.setDrawer(false); this.navigate(id,item.section); }
    navigate(id,element,settled) { this.controlledScroll(id,this.destination(element),()=>{this.highlight(element);settled?.();}); }
    restore(id,scrollY,settled) { this.controlledScroll(id,Math.max(0,scrollY),settled); }
    controlledScroll(id,destination,settled) {
      const token=++this.state.transition; this.state.owner='controller'; this.select(id);
      window.scrollTo({top:destination,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
      const started=Date.now(); let previous=window.scrollY,stable=0;
      const inspect=()=>{ if(token!==this.state.transition)return; const current=window.scrollY; stable=Math.abs(current-previous)<1?stable+1:0; previous=current; if(Math.abs(current-destination)<2||stable>=6||Date.now()-started>2200){this.state.owner='reader';settled?.();this.readViewport();return;} requestAnimationFrame(inspect); };
      requestAnimationFrame(inspect);
    }
    scheduleRead(){if(this.state.owner!=='reader'||this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=0;this.readViewport();});}
    readViewport(){if(this.state.owner!=='reader')return;const line=this.header.getBoundingClientRect().bottom+78;const measured=this.items.map(item=>({item,rect:item.section.getBoundingClientRect()}));let winner=measured.filter(value=>value.rect.top<=line&&value.rect.bottom>line).sort((a,b)=>b.item.depth-a.item.depth||b.rect.top-a.rect.top)[0];if(!winner)winner=measured.filter(value=>value.rect.top<=line).sort((a,b)=>b.rect.top-a.rect.top||b.item.depth-a.item.depth)[0]||measured[0];if(winner&&winner.item.id!==this.state.active)this.select(winner.item.id);}
  }

  window.CoreNavigation = CoreNavigation;
}());
