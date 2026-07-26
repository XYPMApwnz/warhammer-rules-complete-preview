(function () {
  'use strict';

  const navButton = document.getElementById('navButton');
  const scrim = document.getElementById('navScrim');
  const dialog = document.getElementById('termDialog');
  const title = document.getElementById('termTitle');
  const summary = document.getElementById('termSummary');
  const full = document.getElementById('termFull');
  const terms = window.WH40K_GLOSSARY.forBook('death-guard');

  function drawer(open) {
    document.body.classList.toggle('route-nav-open', open);
    navButton.setAttribute('aria-expanded', String(open));
    scrim.hidden = !open;
  }

  document.addEventListener('click', event => {
    const local = event.target.closest('[data-journey-target]');
    if (local) {
      document.getElementById(local.dataset.journeyTarget)?.scrollIntoView({ block: 'start' });
      return;
    }

    const trigger = event.target.closest('[data-term]');
    if (!trigger) return;
    const term = terms[trigger.dataset.term] || window.WH40K_GLOSSARY.get(trigger.dataset.term);
    if (!term) return;
    title.textContent = term.title;
    summary.textContent = term.summary || term.definition;
    full.href = `../../glossary/index.html#${term.id}`;
    dialog.showModal();
  });

  navButton.addEventListener('click', () => drawer(!document.body.classList.contains('route-nav-open')));
  scrim.addEventListener('click', () => drawer(false));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}());
