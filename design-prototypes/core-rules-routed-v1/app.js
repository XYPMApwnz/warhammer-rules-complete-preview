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

  function drawer(open) {
    body.classList.toggle('nav-open', open);
    menu.setAttribute('aria-expanded', String(open));
    scrim.hidden = !open;
  }

  document.addEventListener('click', event => {
    const navLink = event.target.closest('.sidebar a');
    if (navLink && matchMedia('(max-width: 1100px)').matches) drawer(false);

    const trigger = event.target.closest('[data-term]');
    if (!trigger) return;
    title.textContent = trigger.dataset.termTitle || trigger.textContent.trim();
    summary.textContent = trigger.dataset.termSummary;
    full.href = `../../glossary/index.html#${trigger.dataset.term}`;
    dialog.showModal();
  });

  menu.addEventListener('click', () => drawer(!body.classList.contains('nav-open')));
  scrim.addEventListener('click', () => drawer(false));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}());
