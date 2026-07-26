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
