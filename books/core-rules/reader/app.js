(function () {
  'use strict';

  const body = document.body;
  const menu = document.getElementById('navButton');
  const scrim = document.getElementById('navScrim');
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('main.main');
  const topbar = document.querySelector('.topbar');
  const mobileDrawer = matchMedia('(max-width: 1100px)');
  const dialog = document.getElementById('termDialog');
  const close = document.getElementById('termClose');
  const title = document.getElementById('termTitle');
  const summary = document.getElementById('termSummary');
  const full = document.getElementById('termFull');
  const rule = document.getElementById('termRule');
  const popupReturn = document.getElementById('popupReturn');
  const imageDialog = document.getElementById('imageDialog');
  const imageClose = document.getElementById('imageClose');
  const imagePreview = document.getElementById('imagePreview');
  const imageCaption = document.getElementById('imageCaption');
  const searchButton = document.getElementById('searchButton');
  const searchDialog = document.getElementById('searchDialog');
  const searchInput = document.getElementById('searchInput');
  const searchStatus = document.getElementById('searchStatus');
  const searchResults = document.getElementById('searchResults');
  const glossary = window.WH40K_GLOSSARY;
  const presentation = JSON.parse(document.getElementById('readerPresentation')?.textContent || '{}');
  let searchReady;
  const searchContext = () => searchReady ??= Promise.all([
    import('../../shared/army-book-app-v2/global-glossary.mjs'),
    import('../../shared/army-book-app-v2/reference-contract.mjs'),
    import('./mount.mjs')
  ]).then(async ([{adaptGlobalGlossary},{createReferenceContract},{loadReaderNavigation,createCoreReferenceRoutes}])=>{
    const corpus=window.WH40K_GLOSSARY_V2_INDEX,projection=adaptGlobalGlossary(corpus);
    const contract=createReferenceContract({cards:new Map(projection.cards.map(card=>[card.id,card])),index:projection.index});
    const navigation=await loadReaderNavigation(window),routes=createCoreReferenceRoutes(corpus,navigation);
    return {contract,navigation,routes};
  });
  let searchSequence=0;
  let termOpener;
  let drawerScrollY = 0;

  function showTerm(trigger) {
    const term=glossary.resolveView('core-rules',trigger.dataset.term);
    if(!term)return;
    termOpener = trigger;
    title.textContent = term.title;
    summary.textContent = term.definition;
    const view=presentation[term.canonicalId];
    if(view){
      let definition=term.definition;
      const valid=(view.omissions||[]).every(item=>definition.slice(...item.range)===item.expected)&&(view.markers||[]).every(item=>definition.slice(...item.range)===item.expected);
      if(valid){
        for(const item of [...(view.omissions||[])].sort((a,b)=>b.range[0]-a.range[0]))definition=definition.slice(0,item.range[0])+definition.slice(item.range[1]);
        summary.replaceChildren();
        let offset=0;
        for(const marker of [...(view.markers||[])].sort((a,b)=>a.offset-b.offset)){
          summary.append(document.createTextNode(definition.slice(offset,marker.offset)));
          const image=document.createElement('img');image.className='rule-marker';image.src=marker.src;image.alt=marker.alt;
          summary.append(image);offset=marker.offset;
        }
        summary.append(document.createTextNode(definition.slice(offset).trimEnd()));
      }
    }
    full.href = `../../../glossary/index.html#${encodeURIComponent(term.id)}`;
    const fullRulePath=trigger.dataset.fullRulePath;
    rule.hidden = !fullRulePath;
    if (fullRulePath) rule.href = window.WHGlossaryReturn.href(fullRulePath);
    dialog.dataset.openTerm = term.id;
    dialog.dataset.sourceTerm = trigger.dataset.term;
    dialog.showModal();
  }

  const normalizeSearch = value => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const drawerControls = () => [...sidebar.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(node => !node.hidden);
  function isolateDrawerBackground(value) {
    main.inert = value;
    for (const node of topbar.children) if (node !== menu) node.inert = value;
  }
  function drawer(open, { restoreFocus = true } = {}) {
    const wasOpen = body.classList.contains('nav-open');
    const next = Boolean(open && mobileDrawer.matches);
    if (next && !wasOpen) drawerScrollY = scrollY;
    body.classList.toggle('nav-open', next);
    menu.setAttribute('aria-expanded', String(next));
    menu.setAttribute('aria-label', next ? 'Close navigation' : 'Open navigation');
    scrim.hidden = !next;
    scrim.setAttribute('aria-hidden', String(!next));
    sidebar.inert = mobileDrawer.matches && !next;
    sidebar.setAttribute('aria-hidden', String(mobileDrawer.matches && !next));
    isolateDrawerBackground(next);
    if (next) requestAnimationFrame(() => drawerControls()[0]?.focus());
    else if (wasOpen) {
      scrollTo(0, drawerScrollY);
      if (restoreFocus) menu.focus();
    }
  }

  document.addEventListener('click', event => {
    const navLink = event.target.closest('.sidebar a');
    if (navLink && matchMedia('(max-width: 1100px)').matches) drawer(false);

    const imageLink = event.target.closest('.rule-visuals a');
    if (imageLink) {
      event.preventDefault();
      const image = imageLink.querySelector('img');
      imagePreview.src = imageLink.href;
      imagePreview.alt = image.alt;
      imageCaption.textContent = imageLink.closest('figure').querySelector('figcaption strong').textContent;
      imageDialog.showModal();
      return;
    }

    const trigger = event.target.closest('[data-term]');
    if (!trigger) return;
    if (trigger.closest('summary')) event.preventDefault();
    showTerm(trigger);
  });

  function rememberPopup(){
    const triggers=[...document.querySelectorAll('[data-term]')];
    window.WHGlossaryReturn?.save({termId:dialog.dataset.sourceTerm,glossaryEntryId:dialog.dataset.openTerm,triggerIndex:termOpener?triggers.indexOf(termOpener):-1});
    return window.WHGlossaryReturn?.read();
  }
  full.addEventListener('click',rememberPopup);
  rule.addEventListener('click', () => {
    const record=rememberPopup();
    window.WHGlossaryReturn?.setRestoreMode('manual');
    if(record){popupReturn.href=record.path;popupReturn.hidden=false;}
    dialog.close();
  });

  menu.addEventListener('click', () => drawer(!body.classList.contains('nav-open')));
  scrim.addEventListener('click', () => drawer(false));
  mobileDrawer.addEventListener('change', () => drawer(false, { restoreFocus: false }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  imageClose.addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => { if (event.target === imageDialog) imageDialog.close(); });

  function openSearch() {
    if (!searchDialog.open) searchDialog.showModal();
    searchInput.focus();
  }

  searchButton.addEventListener('click', openSearch);
  searchDialog.addEventListener('click', event => { if (event.target === searchDialog) searchDialog.close(); });
  searchResults.addEventListener('click', event => { if (event.target.closest('a')) searchDialog.close(); });
  searchInput.addEventListener('input', async () => {
    const sequence=++searchSequence;
    const query = normalizeSearch(searchInput.value);
    if (query.length < 2) {
      searchStatus.textContent = 'Type at least two characters.';
      searchResults.replaceChildren();
      return;
    }
    let search;
    try{search=await searchContext();}catch(error){
      if(sequence===searchSequence){searchStatus.textContent='Search unavailable. Reload and try again.';searchStatus.dataset.error=String(error?.message||error);searchResults.replaceChildren();}
      return;
    }
    if(sequence!==searchSequence)return;
    const matches=search.contract.search(searchInput.value).filter(item=>
      search.contract.identityFor(item.targetId)?.registryId==='core-rules'&&
      search.contract.resolve(item.targetId).sections.some(section=>section.fields.some(field=>typeof field.value==='string'&&field.value.trim()))).slice(0,40);
    searchStatus.textContent = matches.length ? `${matches.length}${matches.length === 40 ? '+' : ''} results` : 'No matching rules.';
    searchResults.replaceChildren(...matches.map(item=>{
      const route=search.routes.routeFor(item.targetId);
      const link=document.createElement('a');link.href=route?search.navigation.locationFor(route).url:`../../../glossary/index.html#${encodeURIComponent(item.targetId)}`;
      const kind=document.createElement('small');kind.textContent=item.categoryLabel;
      const heading=document.createElement('strong');heading.textContent=item.label;
      const excerpt=document.createElement('span');excerpt.textContent=search.contract.resolve(item.targetId).sections.flatMap(section=>section.fields.map(field=>field.value)).join(' ').slice(0,180);
      link.append(kind,heading,excerpt);return link;
    }));
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && body.classList.contains('nav-open')) {
      event.preventDefault();
      drawer(false);
      return;
    }
    if (event.key === 'Tab' && body.classList.contains('nav-open')) {
      const controls = drawerControls();
      const first = controls[0];
      const last = controls.at(-1);
      if (!event.shiftKey && document.activeElement === menu) {
        event.preventDefault();
        first?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        menu.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        menu.focus();
      } else if (event.shiftKey && document.activeElement === menu) {
        event.preventDefault();
        last?.focus();
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
  });

  drawer(false, { restoreFocus: false });

  const pageLinks=[...document.querySelectorAll('.on-page a')];
  const pageTargets=pageLinks.map(link=>document.getElementById(link.hash.slice(1))).filter(Boolean);
  if(pageTargets.length){
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if(!visible)return;
      for(const link of pageLinks)link.toggleAttribute('aria-current',(link.dataset.readerSection||link.hash)===`#${visible.target.id}`);
    },{rootMargin:'-20% 0px -65% 0px'});
    pageTargets.forEach(target=>observer.observe(target));
  }

  function restorePopup(returnRecord){requestAnimationFrame(()=>{
    const triggers=[...document.querySelectorAll('[data-term]')];
    const indexed=triggers[returnRecord.triggerIndex];
    const trigger=indexed?.dataset.term===returnRecord.termId?indexed:triggers.find(node=>node.dataset.term===returnRecord.termId);
    window.scrollTo(returnRecord.scrollX||0,returnRecord.scrollY||0);
    requestAnimationFrame(()=>{if(trigger)showTerm(trigger);popupReturn.hidden=true;window.WHGlossaryReturn.clear();});
  });}

  window.WHPageState?.installTermDialog({dialog,triggers:()=>[...document.querySelectorAll('[data-term]')],opener:()=>termOpener,open:showTerm});

  const returnRecord=window.WHGlossaryReturn?.read();
  if(returnRecord){
    popupReturn.href=returnRecord.path;
    if(window.WHGlossaryReturn.shouldRestoreAutomatically(returnRecord))restorePopup(returnRecord);
    else popupReturn.hidden=false;
  }
  popupReturn.addEventListener('click',event=>{
    const record=window.WHGlossaryReturn?.read();
    if(!record)return;
    if(!window.WHGlossaryReturn?.isSameDocument(record)){window.WHGlossaryReturn?.setRestoreMode('automatic');return;}
    event.preventDefault();
    history.replaceState(history.state,'',record.path);
    restorePopup(record);
  });

  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('../../../service-worker.js',{updateViaCache:'none'}).catch(()=>{});
}());
