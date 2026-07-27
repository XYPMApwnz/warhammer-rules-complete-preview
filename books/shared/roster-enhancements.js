(function (root) {
  'use strict';

  const normalize = value => root.WHRosterParser?.normalize(value) || String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const catalog = () => root.WH_POINTS_CATALOG?.['death guard']?.enhancements || {};
  const enriched = roster => (roster?.enhancements || []).map(item => {
    const entry = typeof item === 'string' ? { name:item, ownerStatus:'unresolved' } : item;
    const canonical = catalog()[normalize(entry.name)];
    return canonical ? { ...entry, ...canonical, name:canonical.title, currentCost:Number(canonical.value) } : entry;
  });
  const addOne = value => {
    const text = String(value).trim();
    if (/^\d+$/.test(text)) return String(Number(text) + 1);
    const sum = text.match(/^(.*\D)\+(\d+)$/);
    return sum ? `${sum[1]}+${Number(sum[2]) + 1}` : `${text}+1`;
  };
  const modifyCell = cell => {
    if (!cell || cell.dataset.rosterBase) return;
    const base = cell.textContent.trim();
    cell.dataset.rosterBase = base;
    cell.textContent = `${addOne(base)} (+1)`;
    cell.classList.add('roster-modified-value');
  };
  const addDevastatingWounds = row => {
    const tags = row.querySelector('.weapon-tags');
    if (!tags || [...tags.children].some(tag => normalize(tag.textContent) === 'devastating wounds')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tag';
    button.dataset.term = 'core-devastating-wounds';
    button.textContent = 'DEVASTATING WOUNDS';
    tags.append(button);
  };
  const meleeRows = card => [...card.querySelectorAll('.weapon-group')]
    .filter(group => normalize(group.querySelector('h5')?.textContent).includes('melee weapons'))
    .flatMap(group => [...group.querySelectorAll('.weapon-row:not(.weapon-head)')]);
  const appendAbility = (card, item) => {
    const rootNode = card.querySelector('[id$="-abilities"] .ability-list');
    if (!rootNode || rootNode.querySelector(`[data-roster-enhancement="${CSS.escape(item.normalizedName || normalize(item.name))}"]`)) return;
    const article = document.createElement('article');
    article.className = 'ability roster-enhancement';
    article.dataset.rosterEnhancement = item.normalizedName || normalize(item.name);
    const heading = document.createElement('h5');
    heading.textContent = item.name;
    const meta = document.createElement('small');
    meta.className = 'roster-enhancement-cost';
    meta.textContent = `Included +${item.exportedCost ?? item.currentCost} pts`;
    const text = document.createElement('p');
    text.textContent = item.text || '';
    article.append(heading, meta, text);
    rootNode.append(article);
  };

  function decorate(card, roster, units) {
    const unitIds = new Set(units.map(unit => unit.id));
    const owned = enriched(roster).filter(item => item.ownerStatus === 'resolved' && unitIds.has(item.ownerUnitId));
    if (!owned.length) return [];
    const safeToDerive = units.length === 1;
    for (const item of owned) {
      appendAbility(card, item);
      if (!safeToDerive) continue;
      if (item.effect === 'furnace') {
        for (const row of meleeRows(card)) {
          modifyCell(row.querySelector('[data-label="A"]'));
          modifyCell(row.querySelector('[data-label="S"]'));
          addDevastatingWounds(row);
        }
      }
      if (item.effect === 'critical-hit-5') {
        const group = meleeRows(card)[0]?.closest('.weapon-group');
        if (group && !group.querySelector('.roster-critical-hit')) {
          const note = document.createElement('p');
          note.className = 'roster-critical-hit';
          note.textContent = 'Enhancement: unmodified Hit rolls of 5+ score a Critical Hit for these melee weapons.';
          group.querySelector('h5')?.after(note);
        }
      }
    }
    return owned;
  }

  root.WHRosterEnhancements = Object.freeze({ decorate, enriched });
}(typeof window === 'undefined' ? globalThis : window));
