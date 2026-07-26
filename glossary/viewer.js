(function(){
  'use strict';
  const api=window.WH40K_GLOSSARY;
  const terms=Object.keys(api.forBook('death-guard')).filter(id=>api.resolve(id)===id).map(id=>api.get(id)).filter(term=>term&&term.presentation!=='metadata').sort((a,b)=>a.title.en.localeCompare(b.title.en));
  const search=document.getElementById('search'),filters=document.getElementById('filters'),list=document.getElementById('termList'),detail=document.getElementById('termDetail'),resultCount=document.getElementById('resultCount'),libraryBack=document.getElementById('libraryBack'),popup=document.getElementById('termPopup'),popupTitle=document.getElementById('termPopupTitle'),popupSummary=document.getElementById('termPopupSummary'),popupFull=document.getElementById('termPopupFull');
  let category='all',selected='',visibleLimit=120,searchTimer=0;
  const returnRecord=window.WHGlossaryReturn?.read();
  if(returnRecord){libraryBack.href=returnRecord.path;libraryBack.textContent='← Return to popup';}
  document.getElementById('termCount').textContent=api.counts.terms;
  document.getElementById('aliasCount').textContent=api.counts.aliases;
  const categories=['all',...new Set(terms.map(term=>term.kind))];
  const placeholder=/^(weapon|datasheet) profile\.?$/i;

  function filterButton(value){const node=document.createElement('button');node.type='button';node.textContent=value==='all'?'All':value.replaceAll('-',' ');node.classList.toggle('active',value===category);node.addEventListener('click',()=>{category=value;visibleLimit=120;renderFilters();renderList();});return node;}
  function renderFilters(){filters.replaceChildren(...categories.map(filterButton));}
  function visibleTerms(){const query=search.value.trim().toLowerCase();return terms.filter(term=>(category==='all'||term.kind===category)&&(!query||`${term.title.en} ${term.summary?.en||''} ${term.definition.en} ${(term.aliases||[]).join(' ')}`.toLowerCase().includes(query)));}
  function renderList(){
    const visible=visibleTerms(),shown=visible.slice(0,visibleLimit);
    resultCount.textContent=`${shown.length} of ${visible.length} entries shown`;
    const nodes=shown.map(term=>{const node=document.createElement('button');node.type='button';node.className='term-button';node.classList.toggle('active',term.id===selected);const title=document.createElement('strong');title.textContent=term.title.en;const meta=document.createElement('small');meta.textContent=`${term.presentation} // ${term.kind} // ${term.scope}`;node.append(title,meta);node.addEventListener('click',()=>select(term.id));return node;});
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
    const resolved=ids.map(id=>api.get(id)).filter(Boolean);
    if(!resolved.length)return null;
    const section=document.createElement('section');section.className='reference-section';
    const grid=document.createElement('div');grid.className='reference-grid';
    for(const linked of resolved.slice(0,limit)){
      const card=document.createElement('button');card.type='button';card.className='reference-card';
      const title=document.createElement('strong');title.textContent=linked.title.en;
      const meta=document.createElement('small');meta.textContent=`${linked.kind} // ${linked.scope}`;
      card.append(title,meta);card.addEventListener('click',()=>select(linked.id));grid.append(card);
    }
    section.append(sectionLabel(`${label} // ${resolved.length}`),grid);
    if(resolved.length>limit){const remainder=document.createElement('button');remainder.type='button';remainder.className='reference-remainder';remainder.textContent=`Show ${resolved.length-limit} more references`;remainder.addEventListener('click',()=>{for(const linked of resolved.slice(limit)){const card=document.createElement('button');card.type='button';card.className='reference-card';const title=document.createElement('strong');title.textContent=linked.title.en;const meta=document.createElement('small');meta.textContent=`${linked.kind} // ${linked.scope}`;card.append(title,meta);card.addEventListener('click',()=>select(linked.id));grid.append(card);}remainder.remove();});section.append(remainder);}
    return section;
  }

  function sectionLabel(text){const label=document.createElement('p');label.className='detail-label';label.textContent=text;return label;}

  function renderDefinition(text){
    const container=document.createElement('div');container.className='definition';
    let list=null;
    for(const rawLine of String(text||'').split(/\n+/)){
      const line=rawLine.trim();if(!line)continue;
      if(line.startsWith('•')){
        if(!list){list=document.createElement('ul');container.append(list);}
        const item=document.createElement('li');item.textContent=line.slice(1).trim();list.append(item);continue;
      }
      list=null;
      const node=document.createElement(/^[A-Z0-9][A-Z0-9 /'’&()-]{2,}$/.test(line)?'h3':'p');
      node.textContent=line;container.append(node);
    }
    return container;
  }

  function select(id){
    const term=api.get(id);if(!term)return;selected=term.id;
    if(location.hash.slice(1)!==encodeURIComponent(term.id))history.replaceState(null,'','#'+encodeURIComponent(term.id));
    renderList();detail.replaceChildren();
    const source=term.canonicalSource||{},kind=document.createElement('p'),title=document.createElement('h2');kind.className='kind';kind.textContent=`${term.kind} // ${term.edition}`;title.textContent=term.title.en;title.dataset.term=term.id;detail.append(kind,title);
    const summaryText=term.summary?.en||'',definitionText=term.definition?.en||'';
    if(summaryText&&!placeholder.test(summaryText)&&summaryText!==definitionText&&term.presentation!=='profile'){const summary=document.createElement('p');summary.className='summary';summary.textContent=summaryText;detail.append(sectionLabel('Quick reference // popup'),summary);}
    const profile=renderProfile(term.structured);if(profile)detail.append(sectionLabel('Structured profile'),profile);
    if(definitionText&&!placeholder.test(definitionText)&&term.presentation!=='profile')detail.append(sectionLabel(term.presentation==='atomic'?'Complete rule // popup-ready':term.presentation==='reference'?'Core concept':'Full rule'),renderDefinition(definitionText));
    const intrinsicReferences=renderReferences('Rules of this unit type',term.references?.intrinsicRules||[]);
    if(intrinsicReferences)detail.append(intrinsicReferences);
    const conditionalReferences=renderReferences('Referenced by core rules',term.references?.referencedByRules||[]);
    if(conditionalReferences)detail.append(conditionalReferences);
    const commonReferences=renderReferences('Keyword framework',term.references?.commonRules||[]);
    if(commonReferences)detail.append(commonReferences);
    const factionReferences=renderReferences('Faction references',term.references?.factionTerms||[],16);
    if(factionReferences)detail.append(factionReferences);
    const relatedKeywords=renderReferences('Related keywords',term.references?.relatedKeywords||[]);
    if(relatedKeywords)detail.append(relatedKeywords);
    const meta=document.createElement('div');meta.className='meta-grid';
    for(const [label,value] of [['Scope',term.scope],['Status',term.status],['Canonical source',source.documentId||'unknown']]){const cell=document.createElement('div'),key=document.createElement('small'),data=document.createElement('b');key.textContent=label;data.textContent=value;cell.append(key,data);meta.append(cell);}detail.append(meta);
    window.WHGlossaryAutolink?.apply(detail,term.scope==='global'?'core-rules':term.scope);
    for(const trigger of detail.querySelectorAll(`[data-autolink][data-term="${CSS.escape(term.id)}"]`))trigger.replaceWith(document.createTextNode(trigger.textContent));
  }

  function openPopup(id){const term=api.get(id);if(!term)return;popup.dataset.term=term.id;popupTitle.textContent=term.title.en;popupSummary.textContent=term.summary?.en||term.definition?.en||'';popup.showModal();}
  detail.addEventListener('click',event=>{const trigger=event.target.closest('[data-autolink][data-term]');if(!trigger)return;event.preventDefault();openPopup(trigger.dataset.term);});
  document.getElementById('termPopupClose').addEventListener('click',()=>popup.close());
  popup.addEventListener('click',event=>{if(event.target===popup)popup.close();});
  popupFull.addEventListener('click',()=>{const id=popup.dataset.term;popup.close();if(id)select(id);});

  search.addEventListener('input',()=>{window.clearTimeout(searchTimer);searchTimer=window.setTimeout(()=>{visibleLimit=120;renderList();},100);});window.addEventListener('hashchange',()=>select(decodeURIComponent(location.hash.slice(1))));renderFilters();renderList();const initial=decodeURIComponent(location.hash.slice(1));select(api.get(initial)?.id||api.get('core-lethal-hits')?.id||terms[0].id);
}());
