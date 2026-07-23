(function(){
  'use strict';
  const compactGlossaryQuery='(max-width:800px)';

  class GlossarySearch{
    constructor(){
      this.root=document.getElementById('glossary');
      this.input=document.getElementById('glossarySearch');
      this.clear=document.getElementById('searchClear');
      this.empty=document.getElementById('noResults');
      this.groups=[...this.root.children].filter(section=>section.classList.contains('content-group')).map(section=>{
        const grid=section.querySelector('.glossary-grid');
        return{section,grid,cards:[...grid.children].filter(card=>card.hasAttribute('data-glossary-title'))};
      });
      this.cards=this.groups.flatMap(group=>group.cards);
      this.groupById=new Map(this.groups.map(group=>[group.section.id,group]));
      this.groupForCard=new Map(this.groups.flatMap(group=>group.cards.map(card=>[card,group])));
      this.mobile=matchMedia(compactGlossaryQuery).matches;
      this.activeId=this.groups[0]?.section.id||'';
      this.origin=null;
      this.ready=false;
      this.categories=this.buildCategories();
      this.input.addEventListener('input',()=>this.apply());
      this.clear.addEventListener('click',()=>this.reset());
      this.categories.addEventListener('click',event=>{
        const button=event.target.closest('[data-glossary-category]');if(!button)return;
        document.querySelector('[data-nav-target="'+button.dataset.glossaryCategory+'"]')?.click();
      });
      document.getElementById('tocTree')?.addEventListener('click',event=>{
        const id=event.target.closest('[data-nav-target]')?.dataset.navTarget;
        if(this.mobile&&this.groupById.has(id)){this.input.value='';this.origin=null;this.activate(id);}
      },true);
      window.addEventListener('resize',()=>this.syncViewport(),{passive:true});
      this.syncViewport(true);
    }
    buildCategories(){
      const bar=document.createElement('div');bar.className='mobile-glossary-categories surface';bar.hidden=true;bar.setAttribute('aria-label','Glossary categories');
      for(const group of this.groups){
        const button=document.createElement('button');button.type='button';button.dataset.glossaryCategory=group.section.id;button.textContent=group.section.querySelector('.category-title')?.textContent.trim()||group.section.id;bar.append(button);
      }
      this.empty.after(bar);return bar;
    }
    syncViewport(initial=false){
      const mobile=matchMedia(compactGlossaryQuery).matches;if(!initial&&mobile===this.mobile)return;
      this.mobile=mobile;
      if(mobile)this.activate(this.activeId||this.groups[0]?.section.id);
      else{
        this.categories.hidden=true;
        for(const group of this.groups){group.section.hidden=false;group.grid.replaceChildren(...group.cards);}
        this.cards.forEach(card=>{card.hidden=false;card.style.order='';});
        this.linkCards(this.cards);this.layoutChanged();
      }
    }
    markReady(){this.ready=true;for(const card of this.cards)if(card.isConnected)card.dataset.glossaryLinked='true';}
    linkCards(cards){
      if(!this.ready)return;
      for(const card of cards)if(!card.dataset.glossaryLinked){window.WHGlossaryAutolink?.apply(card);card.dataset.glossaryLinked='true';}
    }
    layoutChanged(){document.dispatchEvent(new CustomEvent('dg:glossary-layout'));}
    updateCategories(){for(const button of this.categories.children)button.classList.toggle('is-current',button.dataset.glossaryCategory===this.activeId);}
    activate(id){
      const active=this.groupById.get(id)||this.groups[0];if(!active)return;
      this.activeId=active.section.id;this.categories.hidden=!this.mobile;this.updateCategories();
      if(!this.mobile)return;
      for(const group of this.groups){
        const current=group===active;group.section.hidden=!current;
        if(current){group.grid.replaceChildren(...group.cards);group.cards.forEach(card=>{card.hidden=false;card.style.order='';});this.linkCards(group.cards);}
        else group.grid.replaceChildren();
      }
      this.empty.hidden=true;this.layoutChanged();
    }
    showAll(){
      if(this.mobile){this.activate(this.activeId);return;}
      this.cards.forEach(card=>{card.hidden=false;card.style.order='';});this.groups.forEach(group=>group.section.hidden=false);this.empty.hidden=true;
    }
    filter(query){
      let shown=0;
      if(this.mobile){
        this.categories.hidden=true;
        for(const group of this.groups){
          const matches=group.cards.filter(card=>card.dataset.glossaryTitle.toLocaleLowerCase().includes(query));
          group.section.hidden=!matches.length;group.grid.replaceChildren(...matches);this.linkCards(matches);
          for(const card of matches){const exact=card.dataset.glossaryTitle.toLocaleLowerCase()===query;card.hidden=false;card.style.order=exact?'-1':'';shown++;}
        }
        this.layoutChanged();
      }else this.cards.forEach(card=>{const title=card.dataset.glossaryTitle.toLocaleLowerCase(),visible=title.includes(query);card.hidden=!visible;card.style.order=title===query?'-1':'';if(visible)shown++;});
      this.empty.hidden=shown!==0;
    }
    apply(){
      const query=this.input.value.trim().toLocaleLowerCase();
      if(!query){const top=this.origin;this.origin=null;this.showAll();if(top!==null)window.scrollTo({top,behavior:'smooth'});return;}
      if(this.origin===null)this.origin=window.scrollY;
      this.filter(query);
    }
    reset(){const top=this.origin;this.input.value='';this.origin=null;this.showAll();this.input.focus({preventScroll:true});if(top!==null)window.scrollTo({top,behavior:'smooth'});}
    snapshot(){return{query:this.input.value,origin:this.origin,activeId:this.activeId};}
    restore(state){
      this.input.value=state?.query||'';this.origin=state?.origin??null;this.activeId=state?.activeId||this.activeId;
      const query=this.input.value.trim().toLocaleLowerCase();if(query)this.filter(query);else this.showAll();
    }
    resolveTarget(id){
      const card=this.cards.find(item=>item.id===id);if(!card)return document.getElementById(id);
      if(this.mobile){this.input.value='';this.origin=null;this.activate(this.groupForCard.get(card)?.section.id);}
      return card;
    }
    reveal(target){
      const card=target?.matches?.('[data-glossary-title]')?target:target?.closest?.('[data-glossary-title]');
      if(!card)return false;
      this.input.value='';this.origin=null;
      if(this.mobile)this.activate(this.groupForCard.get(card)?.section.id);else this.showAll();
      return true;
    }
  }

  class ThemeController{
    constructor(){
      this.button=document.getElementById('themeButton');
      let saved=null;try{saved=localStorage.getItem('dg-v4-theme');}catch(error){}
      this.set(saved||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'));
      this.button.addEventListener('click',()=>this.set(document.documentElement.dataset.theme==='dark'?'light':'dark'));
    }
    set(theme){
      document.documentElement.dataset.theme=theme;
      this.button.textContent=theme==='dark'?'☼':'☾';
      this.button.setAttribute('aria-label',theme==='dark'?'Use light theme':'Use dark theme');
      try{localStorage.setItem('dg-v4-theme',theme);}catch(error){}
    }
  }

  class TableAccessibility{
    constructor(){
      for(const table of document.querySelectorAll('.weapon-table[role="table"]')){
        const rows=[...table.querySelectorAll('.weapon-row')];
        table.setAttribute('aria-colcount','7');table.setAttribute('aria-rowcount',String(rows.length));
        rows.forEach((row,rowIndex)=>{row.setAttribute('role','row');[...row.children].forEach((cell,columnIndex)=>cell.setAttribute('role',rowIndex===0?'columnheader':columnIndex===0?'rowheader':'cell'));});
      }
    }
  }

  window.DGGlossarySearch=GlossarySearch;
  window.DGTheme=ThemeController;
  window.DGTableAccessibility=TableAccessibility;
}());
