(function () {
  'use strict';

  class CoreTheme {
    constructor(){this.button=document.getElementById('themeButton');let saved=null;try{saved=localStorage.getItem('core-prototype-theme');}catch(_){}this.set(saved||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'));this.button.addEventListener('click',()=>this.set(document.documentElement.dataset.theme==='dark'?'light':'dark'));}
    set(theme){document.documentElement.dataset.theme=theme;this.button.textContent=theme==='dark'?'☼':'☾';this.button.setAttribute('aria-label',theme==='dark'?'Use light theme':'Use dark theme');try{localStorage.setItem('core-prototype-theme',theme);}catch(_){} }
  }

  class CoreGlossarySearch {
    constructor(){this.input=document.getElementById('glossarySearch');this.clear=document.getElementById('glossaryClear');this.empty=document.getElementById('noResults');this.cards=[...document.querySelectorAll('[data-glossary-title]')];this.input.addEventListener('input',()=>this.apply());this.clear.addEventListener('click',()=>this.reset());}
    apply(){const query=this.input.value.trim().toLocaleLowerCase('en');let shown=0;this.cards.forEach((card)=>{const visible=!query||card.dataset.glossarySearch.includes(query);card.hidden=!visible;if(visible)shown++;});this.empty.hidden=shown!==0;}
    reset(){this.input.value='';this.apply();this.input.focus({preventScroll:true});}
    reveal(target){if(!target?.closest?.('#glossary'))return;this.input.value='';this.apply();}
  }

  class CoreNavSearch {
    constructor(){this.input=document.getElementById('navSearch');this.nodes=[...document.querySelectorAll('[data-nav-id]')];this.input.addEventListener('input',()=>this.apply());}
    apply(){const query=this.input.value.trim().toLocaleLowerCase('en');if(!query){this.nodes.forEach((node)=>node.hidden=false);return;}this.nodes.forEach((node)=>node.hidden=true);this.nodes.forEach((node)=>{const label=node.querySelector(':scope > .toc-row [data-nav-target]')?.textContent.toLocaleLowerCase('en')||'';if(!label.includes(query))return;node.hidden=false;for(let parent=node.parentElement?.closest?.('[data-nav-id]');parent;parent=parent.parentElement?.closest?.('[data-nav-id]'))parent.hidden=false;});}
  }

  class CoreGlobalSearch {
    constructor(navigation,popups,glossary){this.navigation=navigation;this.popups=popups;this.glossary=glossary;this.input=document.getElementById('globalSearch');this.clear=document.getElementById('searchClear');this.results=document.getElementById('searchResults');this.sections=window.CORE_RULES.groups.flatMap((group)=>group.sections.map((section)=>({...section,group:group.title})));this.terms=Object.entries(window.CORE_RULES.terms);this.pdf=window.CORE_PDF_SOURCE;this.rules=this.sections.flatMap((section)=>(this.pdf.rules[section.id]||[]).map((rule)=>({section,rule,id:window.CORE_RENDER.ruleAnchor(section.id,rule.code)})));this.input.addEventListener('input',()=>this.apply());this.clear.addEventListener('click',()=>this.reset());this.results.addEventListener('click',(event)=>this.activate(event));}
    apply(){const query=this.input.value.trim().toLocaleLowerCase('en');this.results.replaceChildren();this.clear.hidden=!query;if(query.length<2){this.results.hidden=true;return;}const matches=[];this.sections.forEach((section)=>{const haystack=`${section.number} ${section.title} ${section.summary} ${section.group}`.toLocaleLowerCase('en');if(haystack.includes(query))matches.push({type:'section',id:section.id,code:'SECTION',title:section.title,copy:`${section.group} · PDF source`});});this.rules.forEach(({section,rule,id})=>{if(`${rule.code} ${rule.title} ${rule.text}`.toLocaleLowerCase('en').includes(query))matches.push({type:'source-rule',id,code:'RULE',title:rule.title,copy:`${section.title} · PDF source`});});this.terms.forEach(([id,term])=>{if(`${term.title} ${term.summary}`.toLocaleLowerCase('en').includes(query))matches.push({type:'term',id,code:'TERM',title:term.title,copy:term.summary});});matches.slice(0,14).forEach((match)=>{const button=document.createElement('button');button.type='button';button.className='search-result';button.dataset.searchType=match.type;button.dataset.searchId=match.id;const code=document.createElement('b');code.textContent=match.code;const copy=document.createElement('span');const title=document.createElement('strong');title.textContent=match.title;const detail=document.createElement('small');detail.textContent=match.copy;copy.append(title,detail);const arrow=document.createElement('span');arrow.textContent='→';button.append(code,copy,arrow);this.results.append(button);});if(!matches.length){const empty=document.createElement('p');empty.className='search-empty';empty.textContent='No matches found.';this.results.append(empty);}this.results.hidden=false;}
    activate(event){const button=event.target.closest('[data-search-id]');if(!button)return;const id=button.dataset.searchId;this.results.hidden=true;if(button.dataset.searchType==='section'||button.dataset.searchType==='source-rule'){this.navigation.go(id);return;}const card=document.getElementById(`glossary-${id}`);if(!card)return;this.glossary.reveal(card);this.navigation.navigate('glossary',card,()=>{const trigger=card.querySelector(`[data-term="${id}"]`);if(trigger)this.popups.open(id,trigger);});}
    reset(){this.input.value='';this.results.hidden=true;this.results.replaceChildren();this.clear.hidden=true;this.input.focus({preventScroll:true});}
  }

  class CoreTables {
    constructor(){for(const table of document.querySelectorAll('.weapon-table[role="table"]')){const rows=[...table.querySelectorAll('.weapon-row')],columns=Math.max(0,...rows.map((row)=>row.children.length));table.setAttribute('aria-colcount',String(columns));table.setAttribute('aria-rowcount',String(rows.length));rows.forEach((row,rowIndex)=>{row.setAttribute('role','row');[...row.children].forEach((cell,columnIndex)=>cell.setAttribute('role',rowIndex===0?'columnheader':columnIndex===0?'rowheader':'cell'));});}}
  }

  window.CoreTheme=CoreTheme;
  window.CoreGlossarySearch=CoreGlossarySearch;
  window.CoreNavSearch=CoreNavSearch;
  window.CoreGlobalSearch=CoreGlobalSearch;
  window.CoreTables=CoreTables;
}());
