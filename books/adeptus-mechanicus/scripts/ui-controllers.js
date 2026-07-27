(function(){
  'use strict';

  class GlossarySearch{
    constructor(){
      this.input=document.getElementById('glossarySearch');
      this.clear=document.getElementById('searchClear');
      this.empty=document.getElementById('noResults');
      this.cards=[...document.querySelectorAll('[data-glossary-title]')];
      this.cards.forEach(card=>card.querySelector('p')?.classList.add('glossary-summary'));
      this.origin=null;
      this.input.addEventListener('input',()=>this.apply());
      this.clear.addEventListener('click',()=>this.reset());
    }
    showAll(){this.cards.forEach(card=>{card.hidden=false;card.style.order='';});this.empty.hidden=true;}
    filter(query){
      let shown=0;
      this.cards.forEach(card=>{const title=card.dataset.glossaryTitle.toLocaleLowerCase(),haystack=(title+' '+(card.dataset.glossaryAliases||'')+' '+card.textContent).toLocaleLowerCase(),visible=haystack.includes(query);card.hidden=!visible;card.style.order=title.includes(query)?'-1':'';if(visible)shown++;});
      this.empty.hidden=shown!==0;
    }
    apply(){
      const query=this.input.value.trim().toLocaleLowerCase();
      if(!query){const top=this.origin;this.origin=null;this.showAll();if(top!==null)window.scrollTo({top,behavior:'smooth'});return;}
      if(this.origin===null)this.origin=window.scrollY;
      this.filter(query);
    }
    reset(){const top=this.origin;this.input.value='';this.origin=null;this.showAll();this.input.focus({preventScroll:true});if(top!==null)window.scrollTo({top,behavior:'smooth'});}
    snapshot(){return{query:this.input.value,origin:this.origin};}
    restore(state){
      this.input.value=state?.query||'';this.origin=state?.origin??null;
      const query=this.input.value.trim().toLocaleLowerCase();if(query)this.filter(query);else this.showAll();
    }
    reveal(target){
      const card=target?.matches?.('[data-glossary-title]')?target:target?.closest?.('[data-glossary-title]');
      if(!card?.hidden)return false;
      this.input.value='';this.origin=null;this.showAll();return true;
    }
  }

  class ThemeController{
    constructor(){
      this.button=document.getElementById('themeButton');
      let saved=null;try{saved=localStorage.getItem('adeptus-mechanicus-rules-theme');}catch(error){}
      this.set(saved||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'));
      this.button.addEventListener('click',()=>this.set(document.documentElement.dataset.theme==='dark'?'light':'dark'));
    }
    set(theme){
      document.documentElement.dataset.theme=theme;
      this.button.textContent=theme==='dark'?'☼':'☾';
      this.button.setAttribute('aria-label',theme==='dark'?'Use light theme':'Use dark theme');
      try{localStorage.setItem('adeptus-mechanicus-rules-theme',theme);}catch(error){}
    }
  }

  class TableAccessibility{
    constructor(){
      for(const table of document.querySelectorAll('.weapon-table[role="table"],.data-table[role="table"]')){
        const rows=[...table.querySelectorAll('.weapon-row,.data-row')],columns=Math.max(0,...rows.map(row=>row.children.length));
        const labels=[...(rows[0]?.children||[])].map(cell=>cell.textContent.trim());
        table.setAttribute('aria-colcount',String(columns));table.setAttribute('aria-rowcount',String(rows.length));
        rows.forEach((row,rowIndex)=>{row.setAttribute('role','row');[...row.children].forEach((cell,columnIndex)=>{cell.setAttribute('role',rowIndex===0?'columnheader':columnIndex===0?'rowheader':'cell');if(rowIndex>0&&labels[columnIndex])cell.dataset.label=labels[columnIndex];});});
      }
    }
  }

  class NavigationSearch{
    constructor(){
      this.input=document.getElementById('navSearch');
      this.tree=document.getElementById('tocTree');
      this.nodes=[...this.tree.querySelectorAll('[data-nav-id]')];
      this.branchState=new Map();
      this.input.addEventListener('input',()=>this.apply());
      this.tree.addEventListener('click',event=>{if(event.target.closest('[data-nav-target]')&&this.input.value)this.reset();},true);
    }
    apply(){
      const query=this.input.value.trim().toLocaleLowerCase();
      if(!query){this.restore();return;}
      if(!this.tree.classList.contains('is-filtering')){
        for(const branch of this.tree.querySelectorAll('.toc-branch'))this.branchState.set(branch,branch.hidden);
      }
      this.tree.classList.add('is-filtering');
      for(const branch of this.tree.querySelectorAll('.toc-branch')){
        branch.hidden=false;
        branch.parentElement.querySelector(':scope > .toc-row [data-nav-toggle]')?.setAttribute('aria-expanded','true');
      }
      this.nodes.forEach(node=>node.hidden=true);
      for(const node of this.nodes){
        const label=node.querySelector(':scope > .toc-row [data-nav-target]')?.textContent.toLocaleLowerCase()||'';
        if(!label.includes(query))continue;
        node.hidden=false;
        for(let parent=node.parentElement?.closest?.('[data-nav-id]');parent;parent=parent.parentElement?.closest?.('[data-nav-id]'))parent.hidden=false;
      }
    }
    restore(){
      this.tree.classList.remove('is-filtering');
      this.nodes.forEach(node=>node.hidden=false);
      for(const [branch,hidden] of this.branchState){
        branch.hidden=hidden;
        branch.parentElement.querySelector(':scope > .toc-row [data-nav-toggle]')?.setAttribute('aria-expanded',String(!hidden));
      }
      this.branchState.clear();
    }
    reset(){this.input.value='';this.restore();}
  }

  class GlobalSearch{
    constructor(navigation,popups,glossary){
      this.navigation=navigation;this.popups=popups;this.glossary=glossary;
      this.input=document.getElementById('globalSearch');this.clear=document.getElementById('globalSearchClear');this.results=document.getElementById('searchResults');
      this.sections=navigation.items.map(item=>({id:item.id,title:item.button.textContent.trim(),copy:item.section.querySelector('p')?.textContent.trim()||'',haystack:item.section.textContent.toLocaleLowerCase()}));
      this.terms=Object.entries(window.DG_TERMS);
      this.input.addEventListener('input',()=>this.apply());this.clear.addEventListener('click',()=>this.reset());this.results.addEventListener('click',event=>this.activate(event));
    }
    apply(){
      const query=this.input.value.trim().toLocaleLowerCase();this.results.replaceChildren();this.clear.hidden=!query;
      if(query.length<2){this.results.hidden=true;return;}
      const matches=[];
      this.sections.forEach(section=>{if((section.title+' '+section.haystack).toLocaleLowerCase().includes(query))matches.push({type:'section',id:section.id,code:'RULE',title:section.title,copy:section.copy});});
      this.terms.forEach(([id,term])=>{if((term.title+' '+term.summary).toLocaleLowerCase().includes(query))matches.push({type:'term',id,code:'TERM',title:term.title,copy:term.summary});});
      matches.sort((a,b)=>Number(!a.title.toLocaleLowerCase().includes(query))-Number(!b.title.toLocaleLowerCase().includes(query)));
      matches.slice(0,14).forEach(match=>{
        const button=document.createElement('button');button.type='button';button.className='search-result';button.dataset.searchType=match.type;button.dataset.searchId=match.id;
        const code=document.createElement('b');code.textContent=match.code;
        const body=document.createElement('span'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=match.title;detail.textContent=match.copy;body.append(title,detail);
        const arrow=document.createElement('span');arrow.textContent='→';button.append(code,body,arrow);this.results.append(button);
      });
      if(!matches.length){const empty=document.createElement('p');empty.className='search-empty';empty.textContent='No matches found.';this.results.append(empty);}
      this.results.hidden=false;
    }
    activate(event){
      const button=event.target.closest('[data-search-id]');if(!button)return;
      this.results.hidden=true;
      if(button.dataset.searchType==='section'){this.navigation.byId.get(button.dataset.searchId)?.button.click();return;}
      const term=window.DG_TERMS[button.dataset.searchId];
      const target=document.getElementById(term?.glossary||term?.rule||term?.datasheet||'');if(!target)return;
      this.glossary.reveal(target);
      this.navigation.navigate(target.closest('.unit-card')?.id||target.dataset.track||target.id,target,()=>this.popups.open(button.dataset.searchId,target));
    }
    reset(){this.input.value='';this.clear.hidden=true;this.results.hidden=true;this.results.replaceChildren();this.input.focus({preventScroll:true});}
  }

  class DoctrinaController{
    constructor(){
      this.buttons=[...document.querySelectorAll('[data-protocol]')];
      this.panels={
        protector:document.getElementById('protector-imperative'),
        conqueror:document.getElementById('conqueror-imperative')
      };
      this.buttons.forEach(button=>button.addEventListener('click',()=>this.set(button.dataset.protocol)));
      document.addEventListener('click',event=>{
        const destination=event.target.closest?.('[data-nav-target],[data-journey-target]');
        const target=destination?.dataset.navTarget||destination?.dataset.journeyTarget;
        if(target==='protector-imperative')this.set('protector');
        if(target==='conqueror-imperative')this.set('conqueror');
      },true);
      this.set('conqueror');
    }
    set(protocol){
      this.buttons.forEach(button=>{
        const active=button.dataset.protocol===protocol;
        button.classList.toggle('active',active);
        button.setAttribute('aria-pressed',String(active));
      });
      Object.entries(this.panels).forEach(([id,panel])=>{if(panel)panel.hidden=id!==protocol;});
      window.DG_APP?.navigation?.scheduleGeometry?.();
    }
  }

  window.DGGlossarySearch=GlossarySearch;
  window.DGTheme=ThemeController;
  window.DGTableAccessibility=TableAccessibility;
  window.AMNavigationSearch=NavigationSearch;
  window.AMGlobalSearch=GlobalSearch;
  window.AMDoctrina=DoctrinaController;
}());
