/** Shared V1-derived catalog presentation. Resolution, scope and routing remain supplied contracts. */
export function createGlossaryCatalog({el,button,anchor,lifecycle,contract,allowedIds=()=>null,
  query='',category='',title='Glossary',onClose,onChange=()=>{},pageSize=Infinity}) {
  let currentQuery=query,currentCategory=category;
  let visibleLimit=pageSize;
  const section=el('section','v2-card v2-glossary');
  const heading=el('header','v2-card-header');
  heading.append(el('h1','v2-card-title',title));
  if(onClose)heading.append(button('Close glossary','v2-library-link',onClose));
  const body=el('div','v2-compatible');
  const label=el('label','v2-search');
  label.append(el('span','v2-sr-only','Search glossary'));
  const input=el('input');
  input.type='search';
  input.placeholder='Search glossary';
  input.setAttribute('aria-label','Search glossary');
  input.setAttribute('autocomplete','off');
  input.value=currentQuery;
  label.append(input);
  const status=el('p','v2-search-status');
  status.setAttribute('role','status');
  const results=el('ul','v2-compatible-list v2-glossary-results');
  const filters=el('div','glossary-categories');
  filters.setAttribute('role','group');filters.setAttribute('aria-label','Glossary categories');
  const categories=[{id:'',label:'All'},...contract.categories(allowedIds())];
  if(!categories.some(item=>item.id===currentCategory))currentCategory='';
  for(const item of categories) {
    const filter=button(item.label,'',()=>{
      currentCategory=item.id;
      visibleLimit=pageSize;
      onChange({query:currentQuery,category:currentCategory,changed:'category'});
      renderResults();
    });
    filter.dataset.glossaryCategory=item.id;filters.append(filter);
  }
  function renderResults() {
    for(const filter of filters.children)filter.setAttribute('aria-pressed',String(filter.dataset.glossaryCategory===currentCategory));
    const matches=contract.search(currentQuery,{allowedIds:allowedIds(),category:currentCategory});
    status.textContent=`${matches.length} ${matches.length===1?'entry':'entries'} found`;
    results.replaceChildren();
    for(const entry of matches.slice(0,visibleLimit)) {
      const item=el('li','v2-compatible-item');
      const link=anchor(entry.matchedLabel || entry.label,entry.targetId,true,{reference:true,fieldPath:entry.matchedFieldPath});
      link.classList.add('v2-glossary-result');
      item.append(link,el('p','v2-search-kind',`${entry.categoryLabel} · ${entry.contextLabel}`));
      results.append(item);
    }
    if(matches.length>visibleLimit) {
      const more=el('li');more.append(button('Show more entries','v2-glossary-more',()=>{visibleLimit+=pageSize;renderResults();}));results.append(more);
    }
    if(!matches.length)results.append(el('li','v2-empty','No matching entries. Try another term.'));
  }
  lifecycle.listen(input,'input',()=>{
    currentQuery=input.value;
    visibleLimit=pageSize;
    onChange({query:currentQuery,category:currentCategory,changed:'query'});
    renderResults();
  });
  body.append(label,filters,status,results);
  section.append(heading,body);
  renderResults();
  return Object.freeze({node:section,input,get query(){return currentQuery;},get category(){return currentCategory;}});
}
