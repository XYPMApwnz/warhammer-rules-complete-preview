(function(){
  'use strict';
  const api=window.WH40K_GLOSSARY;
  const terms=Object.keys(api.forBook('death-guard')).filter(id=>api.resolve(id)===id).map(id=>api.get(id)).filter(term=>term&&term.presentation!=='metadata').sort((a,b)=>a.title.en.localeCompare(b.title.en));
  const search=document.getElementById('search'),filters=document.getElementById('filters'),list=document.getElementById('termList'),detail=document.getElementById('termDetail'),resultCount=document.getElementById('resultCount'),libraryBack=document.getElementById('libraryBack'),popup=document.getElementById('termPopup'),popupTitle=document.getElementById('termPopupTitle'),popupSummary=document.getElementById('termPopupSummary'),popupFull=document.getElementById('termPopupFull');
  let category='all',selected='',visibleLimit=120,searchTimer=0;
  const returnRecord=window.WHGlossaryReturn?.read();
  const placeholder=/^(weapon|datasheet) profile\.?$/i;
  const kindLabels={
    ability:'Ability','army-rules':'Army rules',characteristic:'Characteristic','core-ability':'Core ability','core-concept':'Core concept','core-rule':'Core rule','core-rules-11e':'Core rules',detachment:'Detachment','detachment-rule':'Detachment rule',enhancement:'Enhancement','faction-concept':'Faction concept','faction-term':'Faction term','game-state':'Game state',keyword:'Keyword',phase:'Phase',plagues:'Plague',step:'Step',stratagem:'Stratagem',unit:'Unit',weapon:'Weapon profile'
  };
  const scopeLabels={global:'Core Rules','death-guard':'Death Guard','adeptus-mechanicus':'Adeptus Mechanicus'};
  const humanize=value=>String(value||'').replaceAll('-',' ').replace(/\b\w/g,letter=>letter.toUpperCase());
  const kindLabel=term=>kindLabels[term.kind]||humanize(term.kind);
  const scopeLabel=term=>scopeLabels[term.scope]||humanize(term.scope);
  const displayTitle=term=>term.title.en.replace(/^\[(.+)\]$/,'$1');
  const normalize=value=>String(value||'').toLocaleLowerCase().replace(/\s+/g,' ').trim();
  if(returnRecord){libraryBack.href=returnRecord.path;libraryBack.textContent='← Return to popup';}
  document.getElementById('termCount').textContent=api.counts.terms;
  document.getElementById('aliasCount').textContent=api.counts.aliases;
  const categories=['all',...new Set(terms.map(term=>term.kind))];

  function filterButton(value){const node=document.createElement('button');node.type='button';node.textContent=value==='all'?'All':kindLabels[value]||humanize(value);node.classList.toggle('active',value===category);node.addEventListener('click',()=>{category=value;visibleLimit=120;renderFilters();renderList();});return node;}
  function renderFilters(){filters.replaceChildren(...categories.map(filterButton));}
  function score(term,query){
    if(!query)return 0;
    const title=normalize(displayTitle(term)),aliases=(term.aliases||[]).map(normalize),words=query.split(' ').filter(Boolean),summary=normalize(term.summary?.en),definition=normalize(term.definition?.en);
    if(title===query)return 0;
    if(title.startsWith(query))return 1;
    if(aliases.includes(query))return 2;
    if(aliases.some(alias=>alias.startsWith(query)))return 3;
    if(words.every(word=>title.includes(word)))return 4;
    if(summary.includes(query))return 5;
    if(definition.includes(query))return 6;
    return Number.POSITIVE_INFINITY;
  }
  function visibleTerms(){const query=normalize(search.value);return terms.map(term=>({term,score:score(term,query)})).filter(item=>(category==='all'||item.term.kind===category)&&Number.isFinite(item.score)).sort((a,b)=>a.score-b.score||displayTitle(a.term).localeCompare(displayTitle(b.term))).map(item=>item.term);}
  function renderList(){
    const visible=visibleTerms(),shown=visible.slice(0,visibleLimit);
    resultCount.textContent=`${shown.length} of ${visible.length} entries shown`;
    const nodes=shown.map(term=>{const node=document.createElement('button');node.type='button';node.className='term-button';node.classList.toggle('active',term.id===selected);const title=document.createElement('strong');title.textContent=displayTitle(term);const meta=document.createElement('small');meta.textContent=`${kindLabel(term)} · ${scopeLabel(term)}`;node.append(title,meta);node.addEventListener('click',()=>select(term.id));return node;});
    if(shown.length<visible.length){const more=document.createElement('button');more.type='button';more.className='term-button load-more';more.textContent=`Show ${Math.min(120,visible.length-shown.length)} more`;more.addEventListener('click',()=>{visibleLimit+=120;renderList();});nodes.push(more);}
    list.replaceChildren(...nodes);
  }

  function renderProfile(structured){
    const profile=structured?.weapon||structured?.statline;if(!profile)return null;
    const grid=document.createElement('div');grid.className='profile-grid';
    for(const [label,value] of Object.entries(profile)){const cell=document.createElement('div'),key=document.createElement('small'),data=document.createElement('strong');key.textContent=label;data.textContent=Array.isArray(value)?value.join(', '):String(value);cell.append(key,data);grid.append(cell);}
    return grid;
  }

  function renderReferences(label,ids,limit=24){
    const resolved=[...new Set(ids)].map(id=>api.get(id)).filter(Boolean);
    if(!resolved.length)return null;
    const section=document.createElement('section');section.className='reference-section';
    const grid=document.createElement('div');grid.className='reference-grid';
    const appendCard=linked=>{const card=document.createElement('button');card.type='button';card.className='reference-card';const title=document.createElement('strong');title.textContent=displayTitle(linked);const meta=document.createElement('small');meta.textContent=`${kindLabel(linked)} · ${scopeLabel(linked)}`;card.append(title,meta);card.addEventListener('click',()=>select(linked.id));grid.append(card);};
    resolved.slice(0,limit).forEach(appendCard);
    section.append(sectionLabel(`${label} · ${resolved.length}`),grid);
    if(resolved.length>limit){const remainder=document.createElement('button');remainder.type='button';remainder.className='reference-remainder';remainder.textContent=`Show ${resolved.length-limit} more references`;remainder.addEventListener('click',()=>{resolved.slice(limit).forEach(appendCard);remainder.remove();});section.append(remainder);}
    return section;
  }

  function sectionLabel(text){const label=document.createElement('p');label.className='detail-label';label.textContent=text;return label;}
  function renderDefinition(text){
    const container=document.createElement('div');container.className='definition';
    let bulletList=null;
    for(const rawLine of String(text||'').split(/\n+/)){
      const line=rawLine.trim();if(!line)continue;
      if(line.startsWith('•')){if(!bulletList){bulletList=document.createElement('ul');container.append(bulletList);}const item=document.createElement('li');item.textContent=line.slice(1).trim();bulletList.append(item);continue;}
      bulletList=null;
      const node=document.createElement(/^[A-Z0-9][A-Z0-9 /'’&()-]{2,}$/.test(line)?'h3':'p');node.textContent=line;container.append(node);
    }
    return container;
  }
  function detailsBlock(label,className){const node=document.createElement('details'),summary=document.createElement('summary'),content=document.createElement('div');node.className=className;summary.textContent=label;content.className='details-content';node.append(summary,content);return{node,content};}

  function renderTerm(id){
    const term=api.get(id);if(!term){showCatalogue(false);return;}
    selected=term.id;document.body.classList.add('article-open');renderList();detail.replaceChildren();
    const another=document.createElement('button');another.type='button';another.className='search-another';another.textContent='← Search another term';another.addEventListener('click',()=>showCatalogue(true,true));
    const categoryLine=document.createElement('p'),title=document.createElement('h2');categoryLine.className='kind';categoryLine.textContent=`${kindLabel(term)} · ${scopeLabel(term)}`;title.textContent=displayTitle(term);title.dataset.term=term.id;detail.append(another,categoryLine,title);
    const summaryText=term.summary?.en||'',definitionText=term.definition?.en||'';
    if(summaryText&&!placeholder.test(summaryText)){const quick=renderDefinition(summaryText);quick.classList.add('summary');detail.append(sectionLabel('Quick rule'),quick);}
    const profile=renderProfile(term.structured);if(profile)detail.append(sectionLabel('Profile'),profile);
    if(definitionText&&!placeholder.test(definitionText)&&term.presentation!=='profile'&&normalize(definitionText)!==normalize(summaryText))detail.append(sectionLabel('Full rule'),renderDefinition(definitionText));
    if(term.fullRulePath){const action=document.createElement('a');action.className='full-rule-action';action.href=new URL(`../${term.fullRulePath.replace(/^\/+/, '')}`,location.href).href;action.textContent='Open full rule →';detail.append(action);}
    const groups=[['Rules of this unit type',term.references?.intrinsicRules||[]],['Referenced by core rules',term.references?.referencedByRules||[]],['Common rules',term.references?.commonRules||[]],['Faction terms',term.references?.factionTerms||[]],['Related keywords',term.references?.relatedKeywords||[]],['Related terms',term.related||[]]];
    const seenConnections=new Set();
    const uniqueGroups=groups.map(([label,ids])=>[label,ids.filter(id=>{const linked=api.get(id);if(!linked||seenConnections.has(linked.id))return false;seenConnections.add(linked.id);return true;})]);
    const connectionCount=seenConnections.size;
    if(connectionCount){const connections=detailsBlock(`Explore connections · ${connectionCount} related rules and terms`,'connection-details');for(const [label,ids] of uniqueGroups){const section=renderReferences(label,ids,label==='Faction terms'?16:24);if(section)connections.content.append(section);}detail.append(connections.node);}
    const registry=detailsBlock('Registry details','registry-details'),source=term.canonicalSource||{};
    const meta=document.createElement('div');meta.className='meta-grid';
    for(const [label,value] of [['Internal ID',term.id],['Kind',term.kind],['Scope',term.scope],['Presentation',term.presentation],['Status',term.status],['Canonical source',source.documentId||'unknown'],['Aliases',(term.aliases||[]).join(', ')||'None'],['Edition',term.edition]]){const cell=document.createElement('div'),key=document.createElement('small'),data=document.createElement('b');key.textContent=label;data.textContent=value||'—';cell.append(key,data);meta.append(cell);}registry.content.append(meta);detail.append(registry.node);
    window.WHGlossaryAutolink?.apply(detail,term.scope==='global'?'core-rules':term.scope);
    for(const trigger of detail.querySelectorAll(`[data-autolink][data-term="${CSS.escape(term.id)}"]`))trigger.replaceWith(document.createTextNode(trigger.textContent));
    if(matchMedia('(max-width:760px)').matches)detail.scrollIntoView({block:'start'});
  }

  function select(id){const term=api.get(id);if(!term)return;const url=new URL(location.href);url.hash=term.id;if(location.hash.slice(1)!==encodeURIComponent(term.id))history.pushState(null,'',url);renderTerm(term.id);}
  function showCatalogue(focus=false,push=false){selected='';document.body.classList.remove('article-open');detail.replaceChildren(Object.assign(document.createElement('p'),{className:'empty',textContent:'Select a term from the archive.'}));renderList();if(push){const url=new URL(location.href);url.hash='';history.pushState(null,'',url);}if(focus){search.focus();document.querySelector('.catalogue')?.scrollIntoView({block:'start'});}}
  function syncFromUrl(){const id=decodeURIComponent(location.hash.slice(1));const term=api.get(id);if(term)renderTerm(term.id);else showCatalogue(false);}
  function openPopup(id){const term=api.get(id);if(!term)return;popup.dataset.term=term.id;popupTitle.textContent=displayTitle(term);popupSummary.textContent=term.summary?.en||term.definition?.en||'';popup.showModal();}
  detail.addEventListener('click',event=>{const trigger=event.target.closest('[data-autolink][data-term]');if(!trigger)return;event.preventDefault();openPopup(trigger.dataset.term);});
  document.getElementById('termPopupClose').addEventListener('click',()=>popup.close());
  popup.addEventListener('click',event=>{if(event.target===popup)popup.close();});
  popupFull.addEventListener('click',()=>{const id=popup.dataset.term;popup.close();if(id)select(id);});
  search.addEventListener('input',()=>{window.clearTimeout(searchTimer);searchTimer=window.setTimeout(()=>{visibleLimit=120;renderList();},100);});
  window.addEventListener('popstate',syncFromUrl);
  renderFilters();renderList();syncFromUrl();
}());
