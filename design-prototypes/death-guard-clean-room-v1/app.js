const terms = {
  'objective-marker': ['Objective Marker', 'A battlefield marker used to score objectives and determine control.', 'core-objective-marker'],
  'death-guard': ['DEATH GUARD', 'Faction keyword used to identify Death Guard units for rules interactions.', 'keyword-death-guard'],
  'battle-shocked': ['Battle-shocked', 'A Battle-shocked unit has OC 0 and is affected by the other restrictions of Battle-shock.', 'core-battle-shocked'],
  'critical-hit': ['Critical Hit', 'An unmodified Hit roll of 6 is a Critical Hit. Some rules score one on another result.', 'core-critical-hit'],
  'feel-no-pain': ['Feel No Pain', 'Each time this model would lose a wound, roll one D6. On the listed result, that wound is not lost.', 'core-feel-no-pain'],
  'sustained-hits': ['Sustained Hits', 'Each Critical Hit scores the listed number of additional hits.', 'core-sustained-hits'],
  'lethal-hits': ['Lethal Hits', 'On a Critical Hit, you can choose for that attack to automatically wound.', 'core-lethal-hits']
};

const dialog = document.querySelector('#termDialog');
const title = document.querySelector('#termTitle');
const summary = document.querySelector('#termSummary');
const full = document.querySelector('#termFull');
const menu = document.querySelector('#menu');

menu.open = matchMedia('(min-width: 801px)').matches;

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link?.closest('#menu') && link.hash) {
    menu.querySelector('.is-current')?.classList.remove('is-current');
    menu.querySelector('[aria-current]')?.removeAttribute('aria-current');
    link.classList.add('is-current');
    link.setAttribute('aria-current', 'location');
    if (matchMedia('(max-width: 800px)').matches) menu.open = false;
  }

  const trigger = event.target.closest('[data-term]');
  if (!trigger) return;
  const [termTitle, termSummary, glossaryId] = terms[trigger.dataset.term];
  title.textContent = termTitle;
  summary.textContent = termSummary;
  full.href = `../../glossary/index.html#${glossaryId}`;
  dialog.showModal();
});

dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
