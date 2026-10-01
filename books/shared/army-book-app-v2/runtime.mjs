/** Presentation-only reader. Canonical IDs and supplied fields are its only content authority. */
import {searchGlossary, validateGlossary} from './glossary.mjs';
import {createRosterPanel} from './roster.mjs';
const glossaryRoute = 'view-glossary'; // Presentation route, never a factual identity.
const rosterRoute = 'view-roster';
export function mount(document, payload, options = {}) {
  if (payload?.schema !== 'army-book-app-v2/presentation') throw new TypeError('Unsupported Army Book presentation.');
  const window = document.defaultView;
  const cards = new Map(payload.cards.map(card => [card.id, card]));
  if (cards.size !== payload.cards.length) throw new Error('Duplicate canonical card ID.');
  if (cards.has(glossaryRoute)) throw new Error('Canonical identity collides with the Glossary presentation route.');
  if (options.roster && cards.has(rosterRoute)) throw new Error('Canonical identity collides with the Roster presentation route.');
  if (payload.glossary) validateGlossary(payload.glossary, payload.cards);
  for (const card of cards.values()) {
    for (const id of [...(card.children || []), ...(card.links || []).map(link => link.targetId), ...(card.fields || []).flatMap(field => field.targetIds || [])]) {
      if (!cards.has(id)) throw new Error(`Missing canonical target: ${id}`);
    }
  }
  const relatedByUnit=new Map();
  const detachmentCards=[...cards.values()].filter(card=>card.kind==='DETACHMENT');
  if (payload.relatedRules) {
    const index=payload.relatedRules;
    if (index.schema!=='army-book-related-rules/v2'||index.authority!=='DISPOSABLE_PROJECTION'||!Array.isArray(index.rows)) throw new TypeError('Invalid related rules projection.');
    const mapping={TRUE:'MATCH',FALSE:'NO_MATCH',UNKNOWN:'CONDITIONAL',INVALID:'INVALID'};
    const seen=new Set();
    for (const row of index.rows) {
      const unit=cards.get(row.unitId),rule=cards.get(row.ruleId),detachment=cards.get(row.detachmentId);
      const key=JSON.stringify([row.unitId,row.ruleId]);
      if (seen.has(key)||unit?.kind!=='DATASHEET'||!['STRATAGEM','ENHANCEMENT'].includes(row.kind)||rule?.kind!==row.kind||rule.parentId!==row.detachmentId||detachment?.kind!=='DETACHMENT') throw new TypeError('Invalid canonical related rules identity.');
      for (const result of [row,row.selectedDetachment]) if (!result||!Object.hasOwn(mapping,result.state)||mapping[result.state]!==result.applicability||result.state==='INVALID') throw new TypeError('Invalid related rules evaluation.');
      seen.add(key);
      if (!relatedByUnit.has(row.unitId)) relatedByUnit.set(row.unitId,[]);
      relatedByUnit.get(row.unitId).push(row);
    }
  }
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (label, className, action) => {
    const node = el('button', className, label);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  };
  const exactValue = value => typeof value === 'object' ? JSON.stringify(value) : String(value);
  const humanKind = kind => String(kind || 'Entry').replace(/[-_]/g, ' ');
  const anchor = (label, id, detail = false) => {
    const node = el('a', detail ? 'v2-reference' : 'v2-card-link', label);
    node.href = `#${encodeURIComponent(id)}`;
    node.dataset.targetId = id;
    node.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      detail ? showDetail(id) : open(id);
    });
    return node;
  };
  const shell = el('div', 'v2-shell');
  shell.dataset.armyBookV2 = '';
  const skip = el('a', 'v2-skip', 'Skip to content');
  skip.href = '#v2-main';
  shell.append(skip);
  const header = el('header', 'v2-topbar');
  const drawerToggle = button('☰', 'v2-icon-button v2-menu-toggle', () => toggleDrawer(!drawerOpen));
  drawerToggle.setAttribute('aria-label', 'Open book navigation');
  drawerToggle.setAttribute('aria-expanded', 'false');
  drawerToggle.setAttribute('aria-controls', 'v2-sidebar');
  const desktopToggle = button('☰', 'v2-icon-button v2-desktop-nav-toggle', () => {
    const collapsed = shell.classList.toggle('v2-nav-collapsed');
    desktopToggle.setAttribute('aria-expanded', String(!collapsed));
    desktopToggle.setAttribute('aria-label', collapsed ? 'Expand book navigation' : 'Collapse book navigation');
  });
  desktopToggle.setAttribute('aria-label', 'Collapse book navigation');
  desktopToggle.setAttribute('aria-expanded', 'true');
  desktopToggle.setAttribute('aria-controls', 'v2-sidebar');
  const brand = button(payload.book.title, 'v2-brand', () => library());
  const mark = el('span', 'v2-brand-mark', 'AB');
  mark.setAttribute('aria-hidden', 'true');
  brand.prepend(mark);
  header.append(drawerToggle, desktopToggle, brand, el('span', 'v2-edition', payload.book.edition || 'Army Book'), el('span', 'v2-version', 'V2'));
  shell.append(header);
  const layout = el('div', 'v2-layout');
  const sidebar = el('aside', 'v2-sidebar');
  sidebar.id = 'v2-sidebar';
  sidebar.setAttribute('aria-label', 'Book navigation');
  const sidebarHead = el('div', 'v2-sidebar-head');
  sidebarHead.append(el('span', 'v2-eyebrow', 'THE LIBRARY'), button('×', 'v2-icon-button v2-drawer-close', () => toggleDrawer(false)));
  sidebarHead.lastChild.setAttribute('aria-label', 'Close book navigation');
  const searchLabel = el('label', 'v2-search');
  searchLabel.append(el('span', 'v2-sr-only', 'Search the army book'));
  const search = el('input');
  search.type = 'search';
  search.placeholder = 'Search rules, units, weapons…';
  search.setAttribute('autocomplete', 'off');
  searchLabel.append(search);
  const searchStatus = el('div', 'v2-search-status');
  searchStatus.setAttribute('role', 'status');
  const navigation = el('nav', 'v2-navigation');
  navigation.setAttribute('aria-label', 'Army book sections');
  sidebar.append(sidebarHead, searchLabel, searchStatus, navigation);
  const sidebarFooter = el('div', 'v2-sidebar-footer');
  sidebarFooter.append(el('span', 'v2-eyebrow', 'ARMY BOOK READER'), el('p', '', 'One library. Every rule within reach.'));
  sidebar.append(sidebarFooter);
  const main = el('main', 'v2-main');
  main.id = 'v2-main';
  main.tabIndex = -1;
  skip.addEventListener('click', event => {
    event.preventDefault();
    toggleDrawer(false);
    main.focus({preventScroll: true});
    main.scrollIntoView({block: 'start'});
  });
  const overlay = button('', 'v2-drawer-overlay', () => toggleDrawer(false));
  overlay.tabIndex = -1;
  overlay.setAttribute('aria-label', 'Close navigation');
  layout.append(sidebar, main);
  shell.append(layout, overlay);
  const dialog = el('dialog', 'v2-detail-dialog');
  dialog.setAttribute('aria-labelledby', 'v2-detail-heading');
  const dialogBar = el('div', 'v2-dialog-bar');
  dialogBar.append(el('span', 'v2-eyebrow', 'RULE REFERENCE'), button('×', 'v2-icon-button', closeDetail));
  dialogBar.lastChild.setAttribute('aria-label', 'Close rule reference');
  const dialogContent = el('div', 'v2-dialog-content');
  dialog.append(dialogBar, dialogContent);
  shell.append(dialog);
  document.body.replaceChildren(shell);
  document.title = `${payload.book.title} · Army Book V2`;
  let selectedId = null;
  let selectedView = 'READER';
  let glossaryQuery = '';
  let drawerOpen = false;
  let lastFocus = null;
  let routeKey = null;
  let relatedDetachmentId='';
  const narrow = window.matchMedia('(max-width: 860px)');
  const indexed = [...cards.values()].map(card => ({card, text: [card.title, card.kind, ...(card.fields || []).map(field => `${field.label} ${field.displayValue || ''} ${exactValue(field.value)}`)].join(' ').toLocaleLowerCase()}));
  const rosterPanel = options.roster ? createRosterPanel(document, {
    service: options.roster, bookId: payload.book.id, open, showDetail,
    titleForId: id => cards.get(id)?.title
  }) : null;

  function factValue(tag, field) {
    const value = el(tag, 'v2-field-value', field.displayValue === undefined ? exactValue(field.value) : String(field.displayValue));
    value.dataset.factId = field.id;
    value.dataset.factValue = JSON.stringify(field.value);
    if (field.contextId) value.dataset.contextId = field.contextId;
    if (field.source?.entityId) value.dataset.entityId = field.source.entityId;
    return value;
  }

  function renderField(field, caption) {
    const row = el('div', `v2-field v2-field-${field.type || 'text'}${field.presentation === 'stat' ? ' v2-stat' : ''}`);
    row.dataset.fieldId = field.id;
    if (caption) {
      const label = factValue('dt', caption);
      label.classList.add('v2-field-label');
      row.append(label);
    } else row.append(el('dt', 'v2-field-label', field.label));
    const value = factValue('dd', field);
    row.append(value);
    if (field.targetIds?.length) {
      const references = el('div', 'v2-field-references');
      field.targetIds.forEach(id => references.append(anchor(cards.get(id).title, id, true)));
      row.append(references);
    }
    if (payload.sourceDisclosure && field.source) {
      const disclosure = el('details', 'v2-source');
      disclosure.append(el('summary', '', 'Source'), el('code', '', `${field.source.entityId} · ${field.source.path}`));
      row.append(disclosure);
    }
    return row;
  }

  function renderTable(fields) {
    const wrap = el('div', 'v2-table-scroll');
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', fields[0].table.label || 'Rule table');
    const table = el('table', 'v2-fact-table');
    table.dataset.tableId = fields[0].table.id;
    if (fields[0].table.label) table.append(el('caption', '', fields[0].table.label));
    const columns = new Map();
    const rows = new Map();
    fields.forEach(field => {
      if (!columns.has(field.table.column)) columns.set(field.table.column, field.table.columnLabel || field.label);
      if (!rows.has(field.table.row)) rows.set(field.table.row, new Map());
      if (rows.get(field.table.row).has(field.table.column)) throw new Error(`Duplicate presentation table coordinate: ${field.table.id}`);
      rows.get(field.table.row).set(field.table.column, field);
    });
    const head = el('thead');
    const headRow = el('tr');
    const byIndex = (a, b) => typeof a === 'number' && typeof b === 'number' ? a - b : 0;
    const columnIds = [...columns.keys()].sort(byIndex);
    columnIds.forEach(id => { const th = el('th', '', columns.get(id)); th.scope = 'col'; headRow.append(th); });
    head.append(headRow);
    const body = el('tbody');
    [...rows.keys()].sort(byIndex).forEach(rowId => {
      const cells = rows.get(rowId);
      const tr = el('tr');
      tr.dataset.rowId = String(rowId);
      columnIds.forEach(columnId => {
        const td = el('td');
        const field = cells.get(columnId);
        if (field) {
          td.append(factValue('span', field));
          if (field.targetIds?.length) {
            const refs = el('div', 'v2-field-references');
            field.targetIds.forEach(id => refs.append(anchor(cards.get(id).title, id, true)));
            td.append(refs);
          }
        }
        tr.append(td);
      });
      body.append(tr);
    });
    table.append(head, body);
    wrap.append(table);
    return wrap;
  }

  function renderFields(fields) {
    const captions = new Map(fields.filter(field => field.presentation === 'caption').map(field => [field.id, field]));
    for (const id of captions.keys()) if (fields.filter(field => field.captionFactId === id).length !== 1) throw new Error(`Unbound or repeated presentation caption: ${id}`);
    const container = el('div', 'v2-field-sections');
    const renderedTables = new Set();
    let list = null;
    let stats = null;
    let tokens = null;
    let tokenLabel = null;
    fields.forEach(field => {
      if (field.presentation === 'caption') return;
      if (field.presentation === 'heading') return;
      if (field.type !== 'tokens') { tokens = null; tokenLabel = null; }
      if (field.type === 'tokens') {
        list = null;
        if (!tokens || tokenLabel !== field.label) {
          const group = el('div', 'v2-token-group');
          group.append(el('span', 'v2-field-label', field.label));
          tokens = el('dl', 'v2-token-list');
          tokenLabel = field.label;
          group.append(tokens);
          container.append(group);
        }
        tokens.append(renderField(field));
      } else if (field.presentation === 'table-cell' && field.table) {
        list = null;
        if (!renderedTables.has(field.table.id)) {
          renderedTables.add(field.table.id);
          container.append(renderTable(fields.filter(item => item.presentation === 'table-cell' && item.table?.id === field.table.id)));
        }
      } else if (field.presentation === 'stat') {
        list = null;
        if (!stats) { stats = el('dl', 'v2-stats'); container.append(stats); }
        stats.append(renderField(field));
      } else {
        if (!list) { list = el('dl', 'v2-fields'); container.append(list); }
        list.append(renderField(field, captions.get(field.captionFactId)));
      }
    });
    return container;
  }

  function renderCard(card, {depth = 0, ancestors = new Set(), inDialog = false} = {}) {
    const article = el('article', `v2-card v2-kind-${String(card.kind || 'entry').replace(/[^a-z0-9-]/gi, '-')} v2-depth-${Math.min(depth, 2)}`);
    article.dataset.cardId = card.id;
    article.dataset.entityId = card.source?.entityId || card.id;
    const cardHeader = el('header', 'v2-card-header');
    const headingField = (card.fields || []).find(field => field.presentation === 'heading');
    const headingTag = `h${Math.min(depth + (inDialog ? 2 : 1), 6)}`;
    const title = headingField ? factValue(headingTag, headingField) : el(headingTag, '', card.title);
    title.className = 'v2-card-title';
    if (!depth && inDialog) title.id = 'v2-detail-heading';
    cardHeader.append(el('span', 'v2-kind', humanKind(card.kind)), title);
    const permalink = anchor('↗', card.id);
    permalink.className = 'v2-permalink';
    permalink.setAttribute('aria-label', `Open ${card.title}`);
    permalink.title = 'Open this entry';
    cardHeader.append(permalink);
    article.append(cardHeader);
    if (card.fields?.length) article.append(renderFields(card.fields));
    if (card.note) article.append(el('aside', 'v2-annotations', typeof card.note === 'string' ? card.note : card.note.text || JSON.stringify(card.note)));
    if (card.annotations?.length) {
      const notes = el('aside', 'v2-annotations');
      card.annotations.forEach(note => notes.append(el('p', '', typeof note === 'string' ? note : note.text || JSON.stringify(note))));
      article.append(notes);
    }
    if (card.links?.length) {
      const links = el('div', 'v2-related');
      links.append(el('span', 'v2-eyebrow', 'RELATED ENTRIES'));
      card.links.forEach(link => links.append(anchor(link.label || cards.get(link.targetId).title, link.targetId, true)));
      article.append(links);
    }
    if (card.children?.length) {
      const children = el('div', 'v2-children');
      const childNavigation = el('nav', 'v2-child-navigation');
      childNavigation.setAttribute('aria-label', `${card.title} entries`);
      card.children.forEach(id => childNavigation.append(anchor(cards.get(id).title, id)));
      const index = el('details', 'v2-entry-index');
      const indexHeading = el('summary', '', 'In this entry');
      indexHeading.append(el('span', 'v2-count', String(card.children.length)));
      index.append(indexHeading, childNavigation);
      children.append(index);
      const trail = new Set([...ancestors, card.id]);
      card.children.forEach(id => {
        if (!trail.has(id)) children.append(renderCard(cards.get(id), {depth: depth + 1, ancestors: trail, inDialog}));
      });
      article.append(children);
    }
    if (card.kind==='DATASHEET'&&payload.relatedRules) article.append(renderRelatedRules(card.id));
    return article;
  }

  function fillRelatedResults(unitId,container) {
    container.replaceChildren();
    const rows=(relatedByUnit.get(unitId)||[]).filter(row=>!relatedDetachmentId||row.detachmentId===relatedDetachmentId);
    for (const kind of ['STRATAGEM','ENHANCEMENT']) {
      const group=el('section','v2-compatible-group');
      group.dataset.ruleKind=kind;
      group.append(el('h3','',kind==='STRATAGEM'?'Stratagems':'Enhancements'));
      const list=el('ul','v2-compatible-list');
      for (const row of rows.filter(row=>row.kind===kind)) {
        const result=relatedDetachmentId?row.selectedDetachment:row;
        if (!['MATCH','CONDITIONAL'].includes(result.applicability)) continue;
        const item=el('li','v2-compatible-item');
        item.dataset.ruleId=row.ruleId;
        item.dataset.applicability=result.applicability;
        item.dataset.detachmentId=row.detachmentId;
        const line=el('div','v2-compatible-rule');
        line.append(anchor(cards.get(row.ruleId).title,row.ruleId,true),el('span',`v2-applicability v2-applicability-${result.applicability.toLowerCase()}`,result.applicability==='MATCH'?'Match':'Conditional'));
        item.append(line,el('span','v2-compatible-detachment',cards.get(row.detachmentId).title));
        list.append(item);
      }
      group.append(list.children.length?list:el('p','v2-empty','No compatible rules for this datasheet in this selection.'));
      container.append(group);
    }
  }

  function setRelatedDetachment(id) {
    if (id&&!detachmentCards.some(card=>card.id===id)) throw new TypeError('Unknown canonical Detachment filter.');
    relatedDetachmentId=id;
    for (const section of shell.querySelectorAll('.v2-compatible')) {
      section.querySelector('.v2-detachment-filter').value=id;
      fillRelatedResults(section.dataset.unitId,section.querySelector('.v2-compatible-results'));
    }
  }

  function renderRelatedRules(unitId) {
    const section=el('section','v2-compatible');
    section.dataset.unitId=unitId;
    section.append(el('h2','','Related / Compatible Rules'),el('p','v2-compatible-help','Match: this datasheet meets the known eligibility conditions. Conditional: eligibility also depends on detachment, roster or battle conditions.'));
    const label=el('label','v2-detachment-label','Detachment');
    const select=el('select','v2-detachment-filter');
    select.setAttribute('aria-label','Related rules detachment');
    const all=el('option','','All Detachments');all.value='';select.append(all);
    for (const card of detachmentCards) {const option=el('option','',card.title);option.value=card.id;select.append(option);}
    select.value=relatedDetachmentId;
    select.addEventListener('change',()=>setRelatedDetachment(select.value));
    label.append(select);
    const results=el('div','v2-compatible-results');
    results.setAttribute('aria-live','polite');
    section.append(label,results);
    fillRelatedResults(unitId,results);
    return section;
  }

  function renderNavigation() {
    navigation.replaceChildren();
    const query = search.value.trim().toLocaleLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    if (terms.length) {
      const matches = indexed.filter(item => terms.every(term => item.text.includes(term)));
      searchStatus.textContent = `${matches.length} ${matches.length === 1 ? 'entry' : 'entries'} found`;
      for (const {card} of matches) {
        const hit = anchor(card.title, card.id);
        hit.className = 'v2-search-result';
        hit.append(el('span', 'v2-search-kind', humanKind(card.kind)));
        if (card.id === selectedId) hit.setAttribute('aria-current', 'page');
        navigation.append(hit);
      }
      if (!matches.length) navigation.append(el('p', 'v2-empty', 'No matching entries. Try another term.'));
      return;
    }
    searchStatus.textContent = '';
    const home = button('Library overview', 'v2-library-link', library);
    if (!selectedId && selectedView === 'READER') home.setAttribute('aria-current', 'page');
    navigation.append(home);
    if (rosterPanel) {
      const roster = button('Roster', 'v2-library-link', openRoster);
      if (selectedView === 'ROSTER') roster.setAttribute('aria-current', 'page');
      navigation.append(roster);
    }
    if (payload.glossary) {
      const glossary = button('Glossary', 'v2-library-link', openGlossary);
      if (selectedView === 'GLOSSARY') glossary.setAttribute('aria-current', 'page');
      navigation.append(glossary);
    }
    for (const group of payload.groups) {
      const section = el('details', 'v2-nav-group');
      section.open = true;
      section.dataset.groupId = group.id;
      const summary = el('summary', '', group.label);
      summary.append(el('span', 'v2-count', String(group.itemIds.length)));
      section.append(summary);
      const items = el('div', 'v2-nav-items');
      for (const id of group.itemIds) {
        const card = cards.get(id);
        if (!card) throw new Error(`Missing group card: ${id}`);
        const link = anchor(card.title, id);
        if (id === selectedId) link.setAttribute('aria-current', 'page');
        items.append(link);
      }
      section.append(items);
      navigation.append(section);
    }
  }

  function renderLibrary() {
    main.replaceChildren();
    const hero = el('section', 'v2-hero');
    hero.append(el('span', 'v2-eyebrow', 'YOUR ARMY. EVERY RULE.'), el('h1', '', payload.book.title), el('p', 'v2-hero-subtitle', 'Explore your army book. Find a datasheet, read a rule, or dive into a detachment.'));
    const meta = el('div', 'v2-book-meta');
    for (const [label, value] of [['Edition', payload.book.edition], ['Rules', payload.book.currentness], ['Points', payload.book.mfmVersion]]) {
      if (value !== undefined && value !== null) {
        const badge = el('span', 'v2-meta-badge');
        badge.append(el('span', '', `${label} `), el('strong', '', exactValue(value)));
        meta.append(badge);
      }
    }
    hero.append(meta);
    main.append(hero);
    const sections = el('div', 'v2-library-sections');
    for (const group of payload.groups) {
      const section = el('section', 'v2-library-section');
      section.dataset.groupId = group.id;
      const heading = el('div', 'v2-section-heading');
      heading.append(el('h2', '', group.label), el('span', 'v2-count', String(group.itemIds.length)));
      section.append(heading);
      const items = el('div', 'v2-library-grid');
      for (const id of group.itemIds) {
        const card = cards.get(id);
        const link = anchor('', id);
        link.className = 'v2-library-card';
        link.append(el('span', 'v2-kind', humanKind(card.kind)), el('strong', '', card.title), el('span', 'v2-library-arrow', '↗'));
        items.append(link);
      }
      section.append(items);
      sections.append(section);
    }
    main.append(sections);
  }

  function renderSelected(id, focus = false) {
    selectedView = 'READER';
    glossaryQuery = '';
    selectedId = cards.has(id) ? id : null;
    if (!selectedId) {
      renderLibrary();
      if (id) {
        const warning = el('p', 'v2-not-found', 'This entry is not in this army book. Choose an entry from the library.');
        warning.setAttribute('role', 'status');
        main.prepend(warning);
      }
    } else {
      const card = cards.get(selectedId);
      const toolbar = el('nav', 'v2-breadcrumbs');
      toolbar.setAttribute('aria-label', 'Breadcrumb');
      toolbar.append(button('Library', '', library));
      if (card.parentId && cards.has(card.parentId)) toolbar.append(el('span', '', '/'), anchor(cards.get(card.parentId).title, card.parentId));
      toolbar.append(el('span', '', '/'), el('span', 'v2-breadcrumb-current', card.title));
      const selected = renderCard(card);
      selected.classList.add('v2-current-card');
      main.replaceChildren(toolbar, selected);
    }
    renderNavigation();
    if (focus) {
      main.focus({preventScroll: true});
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  }

  function renderGlossary(query = '', focus = false) {
    selectedView = 'GLOSSARY';
    selectedId = null;
    glossaryQuery = query;
    const section = el('section', 'v2-card v2-glossary');
    const heading = el('header', 'v2-card-header');
    heading.append(el('h1', 'v2-card-title', 'Glossary'), button('Close glossary', 'v2-library-link', closeGlossary));
    const body = el('div', 'v2-compatible');
    const label = el('label', 'v2-search');
    label.append(el('span', 'v2-sr-only', 'Search glossary'));
    const input = el('input');
    input.type = 'search';
    input.placeholder = 'Search glossary';
    input.setAttribute('aria-label', 'Search glossary');
    input.setAttribute('autocomplete', 'off');
    input.value = query;
    label.append(input);
    const status = el('p', 'v2-search-status');
    status.setAttribute('role', 'status');
    const results = el('ul', 'v2-compatible-list v2-glossary-results');
    const renderResults = () => {
      const matches = searchGlossary(payload.glossary, glossaryQuery);
      status.textContent = `${matches.length} ${matches.length === 1 ? 'entry' : 'entries'} found`;
      results.replaceChildren();
      for (const entry of matches) {
        const item = el('li', 'v2-compatible-item');
        const link = anchor(entry.matchedLabel || entry.label, entry.targetId, true);
        link.classList.add('v2-glossary-result');
        item.append(link, el('p', 'v2-search-kind', `${entry.category}${entry.contextLabel ? ' · ' + entry.contextLabel : ''}`));
        results.append(item);
      }
      if (!matches.length) results.append(el('li', 'v2-empty', 'No matching entries. Try another term.'));
    };
    input.addEventListener('input', () => {
      glossaryQuery = input.value;
      window.history.replaceState({...window.history.state, armyBookV2: {...window.history.state?.armyBookV2, glossaryQuery}}, '', window.location.href);
      renderResults();
    });
    body.append(label, status, results);
    section.append(heading, body);
    main.replaceChildren(section);
    renderResults();
    renderNavigation();
    if (focus) {
      input.focus({preventScroll: true});
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  }

  function hashId() {
    try { return decodeURIComponent(window.location.hash.slice(1)); } catch { return ''; }
  }
  function renderRoster(focus = false) {
    selectedView = 'ROSTER';
    selectedId = null;
    rosterPanel.render(main);
    renderNavigation();
    if (focus) {
      main.focus({preventScroll: true});
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  }
  function route({focus = false} = {}) {
    const id = hashId();
    const state = window.history.state;
    const detail = state?.armyBookV2?.detailId === id && cards.has(id);
    const key = JSON.stringify([id, detail, state?.armyBookV2?.backgroundId, state?.armyBookV2?.backgroundView, state?.armyBookV2?.glossaryQuery]);
    if (routeKey === key) return;
    routeKey = key;
    toggleDrawer(false);
    if (detail) {
      if (state.armyBookV2.backgroundView === 'GLOSSARY' && payload.glossary) {
        if (selectedView !== 'GLOSSARY' || glossaryQuery !== (state.armyBookV2.glossaryQuery || '')) renderGlossary(state.armyBookV2.glossaryQuery || '');
      } else if (state.armyBookV2.backgroundView === 'ROSTER' && rosterPanel) {
        if (selectedView !== 'ROSTER') renderRoster();
      } else if (selectedView !== 'READER' || selectedId !== (state.armyBookV2.backgroundId || null)) renderSelected(state.armyBookV2.backgroundId, false);
      dialogContent.replaceChildren(renderCard(cards.get(id), {inDialog: true}));
      if (!dialog.open) {
        lastFocus = document.activeElement;
        dialog.showModal();
      }
      dialogContent.scrollTop = state.armyBookV2.detailScrollTop || 0;
      document.body.classList.add('v2-detail-open');
      dialogBar.lastChild.focus({preventScroll: true});
    } else {
      if (dialog.open) dialog.close();
      document.body.classList.remove('v2-detail-open');
      if (id === glossaryRoute && payload.glossary) renderGlossary(state?.armyBookV2?.glossaryQuery || '', focus);
      else if (id === rosterRoute && rosterPanel) renderRoster(focus);
      else renderSelected(id || null, focus);
      if (!focus) window.requestAnimationFrame(() => window.scrollTo({top: state?.armyBookV2?.scrollY || 0, behavior: 'instant'}));
      if (!focus && lastFocus) {
        const restoreTarget = lastFocus.isConnected ? lastFocus : [...main.querySelectorAll('[data-target-id]')].find(node => node.dataset.targetId === lastFocus.dataset.targetId);
        restoreTarget?.focus({preventScroll: true});
      }
      lastFocus = null;
    }
  }
  function navigate(id, detail, options = {}) {
    const glossary = id === glossaryRoute && Boolean(payload.glossary) && !detail;
    const roster = id === rosterRoute && Boolean(rosterPanel) && !detail;
    if (id && !cards.has(id) && !glossary && !roster) return false;
    const nextHash = id ? `#${encodeURIComponent(id)}` : '';
    window.history.replaceState({...window.history.state, armyBookV2: {...window.history.state?.armyBookV2, scrollY: window.scrollY, detailScrollTop: dialogContent.scrollTop, ...(selectedView === 'GLOSSARY' ? {glossaryQuery} : {})}}, '', window.location.href);
    const state = {armyBookV2: detail ? {detailId: id, backgroundId: selectedId, backgroundView: selectedView, glossaryQuery: selectedView === 'GLOSSARY' ? glossaryQuery : '', scrollY: window.scrollY} : glossary ? {view: 'GLOSSARY', glossaryQuery: options.query || '', glossaryReturnId: selectedView === 'READER' ? selectedId : window.history.state?.armyBookV2?.glossaryReturnId || null, scrollY: 0} : roster ? {view: 'ROSTER', scrollY: 0} : {selectedId: id, scrollY: 0}};
    if (window.location.hash !== nextHash || Boolean(window.history.state?.armyBookV2?.detailId) !== detail) {
      window.history.pushState(state, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    } else window.history.replaceState(state, '', window.location.href);
    routeKey = null;
    route({focus: !detail});
    return true;
  }
  function open(id) { return navigate(id, false); }
  function showDetail(id) { return navigate(id, true); }
  function library() { return navigate(null, false); }
  function openRoster() { return rosterPanel ? navigate(rosterRoute, false) : false; }
  function openGlossary() { return payload.glossary ? navigate(glossaryRoute, false, {query: ''}) : false; }
  function closeGlossary() { return navigate(window.history.state?.armyBookV2?.glossaryReturnId || null, false); }
  function closeDetail() {
    if (window.history.state?.armyBookV2?.detailId) {
      window.history.replaceState({...window.history.state, armyBookV2: {...window.history.state.armyBookV2, detailScrollTop: dialogContent.scrollTop}}, '', window.location.href);
      window.history.back();
    }
    else {
      dialog.close();
      if (lastFocus?.isConnected) lastFocus.focus();
    }
  }
  function toggleDrawer(value) {
    const wasOpen = drawerOpen;
    const focusWasInside = sidebar.contains(document.activeElement);
    drawerOpen = Boolean(value && narrow.matches);
    shell.classList.toggle('v2-drawer-open', drawerOpen);
    drawerToggle.setAttribute('aria-expanded', String(drawerOpen));
    if (narrow.matches) {
      sidebar.inert = !drawerOpen;
      main.inert = drawerOpen;
      header.inert = drawerOpen;
      sidebar.setAttribute('aria-hidden', String(!drawerOpen));
      if (drawerOpen) search.focus();
    } else {
      sidebar.inert = main.inert = header.inert = false;
      sidebar.removeAttribute('aria-hidden');
    }
    document.body.classList.toggle('v2-navigation-open', drawerOpen);
    if (wasOpen && !drawerOpen && focusWasInside) drawerToggle.focus({preventScroll: true});
  }
  search.addEventListener('input', renderNavigation);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDetail(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDetail(); });
  shell.addEventListener('keydown', event => {
    if (!drawerOpen && !dialog.open && selectedView === 'GLOSSARY' && event.key === 'Escape') {
      event.preventDefault();
      closeGlossary();
      return;
    }
    if (!drawerOpen) return;
    if (event.key === 'Escape') { toggleDrawer(false); drawerToggle.focus(); }
    if (event.key === 'Tab') {
      const focusable = [...sidebar.querySelectorAll('a[href], button, input, summary')].filter(node => node.getClientRects().length);
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    }
  });
  narrow.addEventListener('change', () => toggleDrawer(false));
  window.addEventListener('popstate', () => route());
  window.addEventListener('hashchange', () => route());
  function renderAllForQA() {
    if (dialog.open) dialog.close();
    document.body.classList.remove('v2-detail-open');
    main.replaceChildren(...[...cards.values()].map(card => renderCard({...card, children: []})));
    return main;
  }
  const api = Object.freeze({payload, open, showDetail, library, renderAllForQA, setRelatedDetachment, openGlossary, closeGlossary, openRoster, roster: options.roster, rosterPanel});
  window.ArmyBookAppV2 = api;
  route();
  return api;
}
