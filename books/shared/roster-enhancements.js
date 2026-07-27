(function (root) {
  'use strict';

  const normalize = value => root.WHRosterParser?.normalize(value) || String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const catalog = () => root.WH_POINTS_CATALOG?.['death guard']?.enhancements || {};
  const enriched = roster => (roster?.enhancements || []).map(item => {
    const entry = typeof item === 'string' ? { name:item, ownerStatus:'unresolved' } : item;
    const canonical = catalog()[normalize(entry.name)];
    return canonical ? { ...entry, ...canonical, name:canonical.title, currentCost:Number(canonical.value) } : entry;
  });
  const add = (value, amount) => {
    const text = String(value).trim();
    if (/^\d+$/.test(text)) return String(Number(text) + amount);
    const measured = text.match(/^(\d+)(["”″].*)$/);
    if (measured) return `${Number(measured[1]) + amount}${measured[2]}`;
    const sum = text.match(/^(.*\D)\+(\d+)$/);
    return sum ? `${sum[1]}+${Number(sum[2]) + amount}` : `${text}+${amount}`;
  };
  const modifyCell = (cell, amount) => {
    if (!cell || cell.dataset.rosterBase) return;
    const base = cell.textContent.trim();
    cell.dataset.rosterBase = base;
    cell.textContent = `${add(base, amount)} (+${amount})`;
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
  const weaponRows = (card, type) => [...card.querySelectorAll('.weapon-group')]
    .filter(group => normalize(group.querySelector('h5')?.textContent).includes(`${type} weapons`))
    .flatMap(group => [...group.querySelectorAll('.weapon-row:not(.weapon-head)')]);
  const meleeRows = card => weaponRows(card, 'melee');
  const effectLabels = {
    persistent:'Always active', conditional:'Conditional', attachment:'While leading', once:'Once per battle', setup:'Battle setup'
  };
  const derivedEffects = new Set(['furnace','critical-hit-5','melee-a-2','plague-wind-range-12','narthecium-d3','mobile']);
  const addNote = (group, className, text) => {
    if (!group || group.querySelector(`.${className}`)) return;
    const note = document.createElement('p');
    note.className = `roster-derived-note ${className}`;
    note.textContent = text;
    group.querySelector('h5')?.after(note);
  };
  const addMobile = card => {
    const paragraph = card.querySelector('[id$="-keywords"] .content-block p');
    if (!paragraph) return false;
    if (paragraph.querySelector('[data-roster-keyword="mobile"]')) return true;
    paragraph.append(document.createTextNode(', '));
    const keyword = document.createElement('button');
    keyword.type = 'button';
    keyword.className = 'term-button roster-derived-keyword';
    keyword.dataset.term = 'core-mobile';
    keyword.dataset.rosterKeyword = 'mobile';
    keyword.textContent = 'MOBILE';
    paragraph.append(keyword);
    return true;
  };
  const priceText = item => {
    const exported = Number(item.exportedCost), current = Number(item.currentCost);
    return Number.isFinite(exported) && Number.isFinite(current) && exported !== current
      ? `${exported} pts in export · ${current} pts current`
      : `Included +${item.exportedCost ?? item.currentCost} pts`;
  };
  const appendAbility = (card, item, failure) => {
    const rootNode = card.querySelector('[id$="-abilities"] .ability-list');
    if (!rootNode || rootNode.querySelector(`[data-roster-enhancement="${CSS.escape(item.normalizedName || normalize(item.name))}"]`)) return;
    const article = document.createElement('article');
    article.className = 'ability roster-enhancement';
    article.dataset.rosterEnhancement = item.normalizedName || normalize(item.name);
    const heading = document.createElement('h5');
    heading.textContent = item.name;
    const meta = document.createElement('small');
    meta.className = 'roster-enhancement-cost';
    meta.textContent = priceText(item);
    const text = document.createElement('p');
    text.textContent = item.text || '';
    article.append(heading, meta);
    if (effectLabels[item.effect]) {
      const mode = document.createElement('small');
      mode.className = `roster-enhancement-mode roster-enhancement-mode-${item.effect}`;
      mode.textContent = effectLabels[item.effect];
      article.append(mode);
    }
    article.append(text);
    if (failure) {
      const error = document.createElement('p');
      error.className = 'roster-enhancement-failure';
      error.textContent = `Effect could not be applied automatically. ${failure}`;
      article.append(error);
    }
    rootNode.append(article);
  };

  function applyEffect(card, item, safeToDerive) {
    if (!derivedEffects.has(item.effect)) return '';
    if (!safeToDerive) return 'This datasheet card matches multiple roster units.';
    if (item.effect === 'furnace') {
      const rows = meleeRows(card);
      if (!rows.length) return 'No matching melee weapon profiles were found.';
      for (const row of rows) {
        modifyCell(row.querySelector('[data-label="A"]'), 1);
        modifyCell(row.querySelector('[data-label="S"]'), 1);
        addDevastatingWounds(row);
      }
    }
    if (item.effect === 'critical-hit-5') {
      const group = meleeRows(card)[0]?.closest('.weapon-group');
      if (!group) return 'No matching melee weapon profiles were found.';
      if (!group.querySelector('.roster-critical-hit')) {
        const note = document.createElement('p');
        note.className = 'roster-critical-hit';
        note.textContent = 'Enhancement: unmodified Hit rolls of 5+ score a Critical Hit for these melee weapons.';
        group.querySelector('h5')?.after(note);
      }
    }
    if (item.effect === 'melee-a-2') {
      const rows = meleeRows(card);
      if (!rows.length) return 'No matching melee weapon profiles were found.';
      for (const row of rows) modifyCell(row.querySelector('[data-label="A"]'), 2);
    }
    if (item.effect === 'plague-wind-range-12') {
      const rows = weaponRows(card, 'ranged').filter(row => normalize(row.querySelector('.weapon-button')?.textContent).startsWith('plague wind'));
      if (!rows.length) return 'The Plague Wind weapon profile was not found.';
      for (const row of rows) modifyCell(row.querySelector('[data-label="Range"]'), 12);
      addNote(rows[0].closest('.weapon-group'), 'roster-plague-wind-range', 'Enhancement profile: Plague Wind has +12″ Range during your Shooting phase.');
    }
    if (item.effect === 'narthecium-d3') {
      const ability = card.querySelector('[id*="tainted-narthecium"]');
      if (!ability) return 'The Tainted Narthecium ability was not found.';
      ability.classList.add('roster-enhanced-ability');
      addNote(ability, 'roster-narthecium', 'Enhancement: return D3 destroyed models instead of 1.');
    }
    if (item.effect === 'mobile' && !addMobile(card)) return 'The Keywords block was not found.';
    return '';
  }

  function decorate(card, roster, units) {
    const unitIds = new Set(units.map(unit => unit.id));
    const owned = enriched(roster).filter(item => item.ownerStatus === 'resolved' && unitIds.has(item.ownerUnitId));
    if (!owned.length) return [];
    const safeToDerive = units.length === 1;
    for (const item of owned) {
      const failure = applyEffect(card, item, safeToDerive);
      appendAbility(card, item, failure);
    }
    return owned;
  }

  root.WHRosterEnhancements = Object.freeze({ decorate, enriched });
}(typeof window === 'undefined' ? globalThis : window));
