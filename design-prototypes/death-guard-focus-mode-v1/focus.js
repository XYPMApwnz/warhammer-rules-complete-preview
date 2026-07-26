(function () {
  'use strict';

  const dialog = document.getElementById('termDialog');
  const title = document.getElementById('termTitle');
  const summary = document.getElementById('termSummary');
  const full = document.getElementById('termFull');
  const terms = window.WH40K_GLOSSARY.forBook('death-guard');
  document.addEventListener('click', event => {
    const targetLink = event.target.closest('[data-journey-target]');
    if (targetLink) {
      const id = targetLink.dataset.journeyTarget;
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
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

  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}());
