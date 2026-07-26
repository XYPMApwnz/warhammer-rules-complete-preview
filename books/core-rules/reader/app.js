(function () {
  'use strict';

  const body = document.body;
  const menu = document.getElementById('navButton');
  const scrim = document.getElementById('navScrim');
  const dialog = document.getElementById('termDialog');
  const close = document.getElementById('termClose');
  const title = document.getElementById('termTitle');
  const summary = document.getElementById('termSummary');
  const full = document.getElementById('termFull');
  const imageDialog = document.getElementById('imageDialog');
  const imageClose = document.getElementById('imageClose');
  const imagePreview = document.getElementById('imagePreview');
  const imageCaption = document.getElementById('imageCaption');
  const searchButton = document.getElementById('searchButton');
  const searchDialog = document.getElementById('searchDialog');
  const searchInput = document.getElementById('searchInput');
  const searchStatus = document.getElementById('searchStatus');
  const searchResults = document.getElementById('searchResults');
  let searchIndex;

  const normalizeSearch = value => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  function drawer(open) {
    body.classList.toggle('nav-open', open);
    menu.setAttribute('aria-expanded', String(open));
    scrim.hidden = !open;
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
    title.textContent = trigger.dataset.termTitle || trigger.textContent.trim();
    summary.textContent = trigger.dataset.termSummary;
    full.href = `../../../glossary/index.html#${trigger.dataset.term}`;
    dialog.showModal();
  });

  menu.addEventListener('click', () => drawer(!body.classList.contains('nav-open')));
  scrim.addEventListener('click', () => drawer(false));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  imageClose.addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => { if (event.target === imageDialog) imageDialog.close(); });

  async function openSearch() {
    searchDialog.showModal();
    searchInput.focus();
    if (!searchIndex) {
      searchStatus.textContent = 'Loading search index…';
      searchIndex = await fetch('search-index.json').then(response => response.json());
      searchStatus.textContent = 'Type at least two characters.';
    }
  }

  searchButton.addEventListener('click', openSearch);
  searchDialog.addEventListener('click', event => { if (event.target === searchDialog) searchDialog.close(); });
  searchInput.addEventListener('input', () => {
    const query = normalizeSearch(searchInput.value);
    if (!searchIndex) return;
    if (query.length < 2) {
      searchStatus.textContent = 'Type at least two characters.';
      searchResults.replaceChildren();
      return;
    }
    const matches = searchIndex.filter(item => normalizeSearch(`${item.code} ${item.title} ${item.chapter} ${item.text}`).includes(query)).slice(0, 40);
    searchStatus.textContent = matches.length ? `${matches.length}${matches.length === 40 ? '+' : ''} results` : 'No matching rules.';
    searchResults.innerHTML = matches.map(item => `<a href="${item.url}"><small>${item.code} · ${item.chapter}</small><strong>${item.title}</strong><span>${item.text.slice(0, 180)}</span></a>`).join('');
  });
  addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
  });

  const pageLinks=[...document.querySelectorAll('.on-page a')];
  const pageTargets=pageLinks.map(link=>document.getElementById(link.hash.slice(1))).filter(Boolean);
  if(pageTargets.length){
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if(!visible)return;
      for(const link of pageLinks)link.toggleAttribute('aria-current',link.hash===`#${visible.target.id}`);
    },{rootMargin:'-20% 0px -65% 0px'});
    pageTargets.forEach(target=>observer.observe(target));
  }

  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('../../../service-worker.js');
}());
