/** Presentation-only reader. Canonical IDs and supplied fields are its only content authority. */
import {createLifecycle} from './lifecycle.mjs';
import {validateGlossary} from './glossary.mjs';
import {createReferenceContract} from './reference-contract.mjs';
import {encodeRoute,decodeRoute} from './route-context.mjs';
import {createReferencePresenter} from './reference-v1.mjs';
import {createGlossaryCatalog} from './glossary-v1.mjs';
import {createRosterPanel} from './roster.mjs';
import {projectPersonalBook, projectInstanceCards, projectFormedUnitCards, prepareRosterPresentationCards, instanceRoute} from './personal.mjs';
import {renderFormedUnit} from './formed-unit-presentation.mjs';
import {projectContents, mountV1Contents} from './navigation-v1.mjs';
import {createDatasheetPresenter} from './datasheet-v1.mjs';
import {installDatasheetLayout, flushDatasheetLayouts} from './datasheet-v1-layout.mjs';
import {createBookPresenter} from './book-v1.mjs';
import {createV1RelatedPanel} from './related-v1.mjs';
import {positionV1Popup} from './popup-v1.mjs';
const glossaryRoute = 'view-glossary'; // Presentation route, never a factual identity.
const rosterRoute = 'view-roster';
const personalRoute = 'view-roster-guide';
export function mount(document, payload, options = {}) {
  if (payload?.schema !== 'army-book-app-v2/presentation') throw new TypeError('Unsupported Army Book presentation.');
  const window = document.defaultView;
  const cards = new Map(payload.cards.map(card => [card.id, card]));
  const effectiveCards=prepareRosterPresentationCards(cards,payload.rosterPresentation);
  if (cards.size !== payload.cards.length) throw new Error('Duplicate canonical card ID.');
  if (cards.has(glossaryRoute)) throw new Error('Canonical identity collides with the Glossary presentation route.');
  if (options.roster && cards.has(rosterRoute)) throw new Error('Canonical identity collides with the Roster presentation route.');
  if (payload.glossary) validateGlossary(payload.glossary, payload.cards);
  const references=createReferenceContract({cards,index:payload.glossary,registryId:payload.book.id});
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
  const lifecycle=createLifecycle(window);
  const host=options.root || document.body;
  if(host.ownerDocument!==document)throw new TypeError('Mount root belongs to a different document.');
  const previousTitle=document.title,previousApi=window.ArmyBookAppV2,previousFocus=document.activeElement;
  const hadBodyClass=document.body.hasAttribute('class');
  const bodyClasses=new Map(['v2-v1-navigation','v2-book-surface','v2-datasheet-mode','v2-detail-open'].map(name=>[name,document.body.classList.contains(name)]));
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (label, className, action) => {
    const node = el('button', className, label);
    node.type = 'button';
    lifecycle.listen(node,'click', action);
    return node;
  };
  const exactValue = value => typeof value === 'object' ? JSON.stringify(value) : String(value);
  const humanKind = kind => String(kind || 'Entry').replace(/[-_]/g, ' ');
  const anchor = (label, id, detail = false, presentation = {}) => {
    const node = el('a', detail ? 'v2-reference' : 'v2-card-link', label);
    node.href = routeURL(id,detail,presentation);
    node.dataset.targetId = id;
    lifecycle.listen(node,'click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      detail ? showDetail(id,presentation) : navigate(id,false,presentation);
    });
    return node;
  };
  const shell = el('div', 'v2-shell');
  shell.dataset.armyBookV2 = '';
  const skip = el('a', 'v2-skip', 'Skip to content');
  skip.href = '#main';
  shell.append(skip);
  const header = el('header', 'v2-topbar');header.id='appHeader';
  const drawerToggle = button('☰', 'header-button nav-menu', () => {});drawerToggle.id='navMenu';
  drawerToggle.setAttribute('aria-label', 'Open navigation');
  drawerToggle.setAttribute('aria-expanded', 'false');
  drawerToggle.setAttribute('aria-controls', 'tocPanel');
  const desktopToggle=button('◀','header-button nav-collapse',()=>{});desktopToggle.id='navCollapse';
  desktopToggle.setAttribute('aria-label','Collapse navigation');desktopToggle.setAttribute('aria-expanded','true');desktopToggle.setAttribute('aria-controls','tocPanel');
  const brand = button(payload.book.title, 'v2-brand', () => library());
  const mark = el('span', 'v2-brand-mark', 'AB');
  mark.setAttribute('aria-hidden', 'true');
  brand.prepend(mark);
  header.append(drawerToggle, desktopToggle, brand, el('span', 'v2-edition', payload.book.edition || 'Army Book'), el('span', 'v2-version', 'V2'));
  shell.append(header);
  const layout = el('div', 'v2-layout');
  const sidebar = el('nav', 'toc-panel');
  sidebar.id = 'tocPanel';
  sidebar.setAttribute('aria-label', 'Rulebook navigation');
  const sidebarHead=el('h2','toc-heading','Contents');
  const shortcuts=el('div','toc-shortcuts');
  const searchLabel = el('label', 'v2-search');
  searchLabel.append(el('span', 'v2-sr-only', 'Search the army book'));
  const search = el('input');
  search.type = 'search';
  search.placeholder = 'Search rules, units, weapons…';
  search.setAttribute('autocomplete', 'off');
  searchLabel.append(search);
  const searchStatus = el('div', 'v2-search-status');
  searchStatus.setAttribute('role', 'status');
  const navigation = el('ul', 'toc-tree v2-navigation');navigation.id='tocTree';
  navigation.setAttribute('aria-label', 'Army book sections');
  sidebar.append(sidebarHead,shortcuts,searchLabel,searchStatus,navigation);
  const main = el('main', 'v2-main');
  main.id = 'main';
  main.tabIndex = -1;
  lifecycle.listen(skip,'click', event => {
    event.preventDefault();
    toggleDrawer(false);
    main.focus({preventScroll: true});
    main.scrollIntoView({block: 'start'});
  });
  const overlay = button('', 'toc-scrim', () => {});overlay.id='tocScrim';
  overlay.tabIndex = -1;
  overlay.setAttribute('aria-label', 'Close navigation');
  layout.append(sidebar, main);
  shell.append(layout, overlay);
  const dialog = el('dialog', 'v2-detail-dialog term-popup v2-book-detail');
  dialog.setAttribute('aria-labelledby', 'v2-detail-heading');
  const dialogBar = el('div', 'v2-dialog-bar');
  dialogBar.append(el('span', 'v2-eyebrow', 'RULE REFERENCE'), button('×', 'v2-icon-button popup-close', closeDetail));
  dialogBar.lastChild.setAttribute('aria-label', 'Close rule reference');
  const dialogContent = el('div', 'v2-dialog-content');
  dialog.append(dialogBar, dialogContent);
  shell.append(dialog);
  const relatedDialog=el('dialog','v2-related-dialog related-rules-layer');relatedDialog.setAttribute('aria-label','Compatible Stratagems and Enhancements');
  const relatedFrame=el('section','related-rules-dialog');
  const relatedBar=el('header');const relatedHeading=el('div');const relatedTitle=el('h2','','Compatible Stratagems & Enhancements');relatedTitle.id='v2-related-heading';relatedDialog.setAttribute('aria-labelledby',relatedTitle.id);
  relatedHeading.append(el('span','','Datasheet tools'),relatedTitle);relatedBar.append(relatedHeading,button('×','related-rules-close',()=>relatedDialog.close()));
  relatedBar.lastChild.setAttribute('aria-label','Close compatible rules');
  const relatedContent=el('div','related-rules-body v2-dialog-content');relatedFrame.append(relatedBar,relatedContent);relatedDialog.append(relatedFrame);shell.append(relatedDialog);
  lifecycle.listen(relatedDialog,'click',event=>{if(event.target===relatedDialog)relatedDialog.close();});
  host.append(shell);document.body.classList.add('v2-v1-navigation','v2-book-surface');
  const ownedStyles=[];
  const stylesheet=url=>{const link=el('link');link.rel='stylesheet';link.href=url;document.head.append(link);ownedStyles.push(link);return link;};
  for(const name of ['styles.css','datasheet-v1.css','book-v1.css'])stylesheet(new URL(name,import.meta.url).href);
  for(const url of options.styles || [])stylesheet(new URL(url,document.baseURI).href);
  const navStyles=el('link');navStyles.rel='stylesheet';navStyles.href=new URL('./navigation-v1.css',import.meta.url).href;document.head.append(navStyles);ownedStyles.push(navStyles);
  const popupStyles=el('link');popupStyles.rel='stylesheet';popupStyles.href=new URL('./popup-v1.css',import.meta.url).href;document.head.append(popupStyles);ownedStyles.push(popupStyles);
  const referenceStyles=el('link');referenceStyles.rel='stylesheet';referenceStyles.href=new URL('./reference-v1.css',import.meta.url).href;document.head.append(referenceStyles);ownedStyles.push(referenceStyles);
  document.title = `${payload.book.title} · Army Book V2`;
  let selectedId = null;
  let selectedInstanceId = null;
  let personalMode = false;
  let selectedView = 'READER';
  let glossaryQuery = '';
  let glossaryCategory = '';
  let contents=null;
  let controlledRoute=false;
  let navigationBlocked=false;
  let lastFocus = null;
  let popupOrigin=null,popupOriginRect=null;
  let activeRelatedPanel=null;
  let routeKey = null;
  let relatedDetachmentId='';
  const indexed = [...cards.values()].map(card => ({card, text: [card.title, card.kind, ...(card.fields || []).map(field => `${field.label} ${field.displayValue || ''} ${exactValue(field.value)}`)].join(' ').toLocaleLowerCase()}));
  const rosterPanel = options.roster ? createRosterPanel(document, {
    service: options.roster, bookId: payload.book.id, open: id=>id?open(id):openLibrary(), showDetail,
    openPersonalGuide, showInstance: openInstance, routeURL, lifecycle,
    titleForId: id => cards.get(id)?.title
  }) : null;
  const personalBook = () => projectPersonalBook(payload, options.roster.state);
  const scopedIds = () => personalMode ? personalBook().allowedIds : null;
  const datasheets=createDatasheetPresenter({document,payload,cards,el,factValue,anchor,showDetail,lifecycle,assetBaseURL:options.assetBaseURL,
    renderCanonicalRule:card=>bookPresenter.accepts(card)||card.kind==='STRUCTURED_RULE_TABLE'
      ?bookPresenter.render(card,{inline:true}):renderCard(card,{depth:1}),
    related:renderRelatedRules,roster:options.roster,
    navigateSection:(id,section,nav,instanceId)=>contents.controller.navigateSection(id,section,{nav,instanceId:instanceId || ''})});
  const bookPresenter=createBookPresenter({document,payload,cards,el,factValue,anchor,allowedIds:scopedIds,renderWeapon:datasheets.renderWeapon});
  const referencePresenter=createReferencePresenter({el,factValue,anchor,contract:references,cards,payload,allowedIds:scopedIds,
    renderWeapon:datasheets.renderWeapon,renderProfile:datasheets.renderProfile});
  let popupPresentation=null;

  function factValue(tag, field) {
    const value = el(tag, 'v2-field-value', field.displayValue === undefined ? exactValue(field.value) : String(field.displayValue));
    value.dataset.factId = field.id;
    value.dataset.factValue = JSON.stringify(field.value);
    if (field.runtimeDerived) value.dataset.rosterDerived = 'true';
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
      if (field.presentation === 'heading' || field.type === 'heading') return;
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

  function renderCard(card, {depth = 0, ancestors = new Set(), inDialog = false, variants = null, instanceId = null, primaryDetail = true, sourceEvidence = false} = {}) {
    if(!sourceEvidence&&card.domain==='CORE')return referencePresenter.render(card.id,{popup:inDialog});
    if(!sourceEvidence&&bookPresenter.accepts(card))return bookPresenter.render(card,{inDialog,primaryDetail});
    if(card.kind==='DATASHEET'&&!sourceEvidence) {
      const article=datasheets.renderDatasheet(card,{variants,instanceId,inDialog});
      if(inDialog&&primaryDetail)article.querySelector('.unit-header h3').id='v2-detail-heading';
      installDatasheetLayout(article,window,{lifecycle});
      return article;
    }
    if(inDialog&&['PROFILE','WEAPON_PROFILE'].includes(card.kind)) {
      const article=card.kind==='PROFILE'?datasheets.renderProfile(card,{instanceId,inDialog}):datasheets.renderWeapon(card,{instanceId,popup:true});
      article.classList.add('v2-card','v2-kind-'+card.kind);
      if(card.kind==='PROFILE')article.classList.add('unit-card','surface');
      if(primaryDetail){const title=article.querySelector('h3,h5') || article.insertBefore(el('h3','',card.title),article.firstChild);title.id='v2-detail-heading';}
      return article;
    }
    const allowed = scopedIds();
    const childrenIds = (card.children || []).filter(id=>!allowed || allowed.has(id));
    const article = el('article', `v2-card v2-kind-${String(card.kind || 'entry').replace(/[^a-z0-9-]/gi, '-')} v2-depth-${Math.min(depth, 2)}`);
    article.dataset.cardId = card.id;
    article.dataset.entityId = card.source?.entityId || card.id;
    if (instanceId) article.dataset.rosterInstanceId = instanceId;
    if (card.scopeId) article.dataset.compositionId = card.scopeId;
    const cardHeader = el('header', 'v2-card-header');
    const headingField = (card.fields || []).find(field => field.presentation === 'heading' || field.type === 'heading');
    const headingTag = `h${Math.min(depth + (inDialog ? 2 : 1), 6)}`;
    const title = headingField ? factValue(headingTag, headingField) : el(headingTag, '', card.title);
    title.className = 'v2-card-title';
    if (!depth && inDialog && primaryDetail) title.id = 'v2-detail-heading';
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
    if (card.rosterQuantity !== undefined) article.append(el('p','v2-compatible-help',`${card.rosterQuantity} ${card.kind==='WEAPON_PROFILE'?'selected':'models in this profile'}`));
    if (card.links?.length) {
      const links = el('div', 'v2-related');
      links.append(el('span', 'v2-eyebrow', 'RELATED ENTRIES'));
      card.links.filter(link=>!allowed || allowed.has(link.targetId)).forEach(link => links.append(anchor(link.label || cards.get(link.targetId).title, link.targetId, true)));
      article.append(links);
    }
    if (childrenIds.length) {
      const children = el('div', 'v2-children');
      const childNavigation = el('nav', 'v2-child-navigation');
      childNavigation.setAttribute('aria-label', `${card.title} entries`);
      childrenIds.forEach(id => childNavigation.append(anchor(cards.get(id).title, id, Boolean(instanceId))));
      const index = el('details', 'v2-entry-index');
      const indexHeading = el('summary', '', 'In this entry');
      indexHeading.append(el('span', 'v2-count', String(childrenIds.length)));
      index.append(indexHeading, childNavigation);
      children.append(index);
      const trail = new Set([...ancestors, card.id]);
      childrenIds.forEach(id => {
        if (!trail.has(id)) for (const child of variants?.get(id) || [cards.get(id)]) children.append(renderCard(child, {depth: depth + 1, ancestors: trail, inDialog, variants, instanceId,sourceEvidence}));
      });
      article.append(children);
    }
    if (!personalMode && card.kind==='DATASHEET'&&payload.relatedRules) article.append(renderRelatedRules(card.id));
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
      if(section.dataset.rosterRelatedInstanceId)continue;
      section.querySelector('.v2-detachment-filter').value=id;
      fillRelatedResults(section.dataset.unitId,section.querySelector('.v2-compatible-results'));
    }
    activeRelatedPanel?.setDetachment(id);
  }

  function renderRelatedPanel(unitId,instanceId=null) {
    const rosterMode=Boolean(instanceId);
    const rowsFor=detachmentId=>{
      if(!rosterMode)return (relatedByUnit.get(unitId)||[]).filter(row=>!detachmentId||row.detachmentId===detachmentId)
        .map(row=>detachmentId?{...row,...row.selectedDetachment}:row).filter(row=>['MATCH','CONDITIONAL'].includes(row.applicability));
      const service=options.roster,unit=service.state.units.find(u=>u.instanceId===instanceId),related=service.related(instanceId);
      return (Array.isArray(related)?related:related.rows||[]).filter(row=>service.state.detachmentIds.includes(row.detachmentId)&&
        (row.kind!=='ENHANCEMENT'||unit.enhancementIds.includes(row.ruleId))&&['MATCH','CONDITIONAL'].includes(row.applicability));
    };
    activeRelatedPanel=createV1RelatedPanel({document,lifecycle,rosterMode,detachmentId:relatedDetachmentId,
      detachments:detachmentCards.filter(card=>!rosterMode||options.roster.state.detachmentIds.includes(card.id)),rowsFor,
      renderRule:id=>bookPresenter.render(cards.get(id)),onDetachment:setRelatedDetachment});
    activeRelatedPanel.node.dataset.unitId=unitId;
    if(instanceId)activeRelatedPanel.node.dataset.rosterRelatedInstanceId=instanceId;
    return activeRelatedPanel.node;
  }

  function openRelatedRules(unitId,instanceId=null){
    if(personalMode&&!instanceId&&selectedInstanceId&&cards.get(unitId)?.id===options.roster.state.units.find(unit=>unit.instanceId===selectedInstanceId)?.canonicalUnitId)instanceId=selectedInstanceId;
    relatedTitle.textContent=`${cards.get(unitId).title} · Compatible Stratagems & Enhancements`;
    relatedContent.replaceChildren(renderRelatedPanel(unitId,instanceId));relatedContent.scrollTop=0;
    if(!relatedDialog.open)relatedDialog.showModal();relatedBar.lastChild.focus({preventScroll:true});
  }
  function renderRelatedRules(unitId,instanceId=null){
    const footer=el('section','ds-related-rules');footer.dataset.relatedUnitId=unitId;
    if(instanceId)footer.dataset.rosterRelatedInstanceId=instanceId;
    footer.append(button('Compatible Stratagems & Enhancements','ds-related-rules-button',()=>openRelatedRules(unitId,instanceId)));return footer;
  }

  function renderNavigation() {
    if(relatedDialog.open&&!window.history.state?.armyBookV2?.detailId&&!lastFocus)relatedDialog.close();
    document.body.classList.toggle('v2-datasheet-mode',Boolean(main.querySelector('.unit-card')));
    if(!contents)return;
    shortcuts.replaceChildren();
    const shortcut=(label,action,current)=>{const node=button(label,'toc-label',action);if(current)node.setAttribute('aria-current','location');shortcuts.append(node);};
    const rosterScope=personalMode||selectedView==='ROSTER'&&options.roster?.state?.units?.length;
    if(navigationBlocked){contents.clear();searchStatus.textContent='Roster context unavailable';return;}
    const state=rosterScope?options.roster.state:null,view=rosterScope?personalBook():null;
    if(payload.glossary)shortcut('Mega Glossary',()=>navigate(glossaryRoute,false,{personalBook:rosterScope}),selectedView==='GLOSSARY');
    if(rosterPanel){
      shortcut(rosterScope?'Personal guide':'Roster',rosterScope?openPersonalGuide:openRoster,selectedView==='ROSTER'||selectedView==='PERSONAL'&&!selectedInstanceId);
      if(rosterScope){shortcut('Attachment Setup',openRoster,selectedView==='ROSTER');shortcut('Full Army Book',openLibrary,false);}
    }
    const model=projectContents(payload,state,view),query=search.value.trim().toLocaleLowerCase();
    if(query){
      const terms=query.split(/\s+/),allowed=view?.allowedIds;
      const hits=indexed.filter(({card,text})=>(!allowed||allowed.has(card.id))&&terms.every(term=>text.includes(term)));
      const physical=view?.instances.filter(entry=>terms.every(term=>entry.title.toLocaleLowerCase().includes(term)))||[];
      const entries=[...physical.map(entry=>({id:entry.route,label:entry.title,canonicalId:entry.id,instanceId:entry.instanceId,children:[],searchResult:true})),
        ...hits.filter(({card})=>!view||card.kind!=='DATASHEET').map(({card})=>({id:card.id,label:card.title,canonicalId:card.id,children:[],searchResult:true}))];
      model.roots=entries;model.nodes=new Map(entries.map(entry=>[entry.id,entry]));model.groups=new Map();
      searchStatus.textContent=`${entries.length} entries found`;
    }else searchStatus.textContent='';
    let active=selectedInstanceId?instanceRoute(selectedInstanceId):selectedId||(selectedView==='READER'?'start':null);
    while(active&&!model.nodes.has(active)&&cards.has(active))active=cards.get(active).parentId;
    contents.refresh(model,active);
  }

  function renderPersonalHome(focus=false) {
    selectedView='PERSONAL';selectedId=null;selectedInstanceId=null;glossaryQuery='';
    const view=personalBook(), hero=el('section','v2-hero');
    hero.append(el('h1','', 'Personal guide'),el('p','v2-hero-subtitle',`${payload.book.title} · ${view.instances.length} imported units`));
    const sections=el('div','v2-library-sections');
    for (const group of view.groups) {const section=el('section','v2-library-section');section.dataset.groupId=group.id;section.append(el('h2','',group.label));
      const list=el('div','v2-library-grid');for (const entry of group.entries) {const link=anchor(entry.title,entry.route);link.dataset.canonicalId=entry.id;if(entry.instanceId)link.dataset.rosterNavInstanceId=entry.instanceId;list.append(link);}section.append(list);sections.append(section);}
    main.replaceChildren(hero,sections);renderNavigation();if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }

  function renderInstance(instanceId,focus=false) {
    const unit=options.roster.state.units.find(unit=>unit.instanceId===instanceId);
    if (!unit) {renderPersonalHome(focus);main.prepend(el('p','v2-not-found','This physical unit is not in the imported roster.'));return;}
    selectedView='PERSONAL';selectedInstanceId=instanceId;selectedId=unit.canonicalUnitId;glossaryQuery='';
    const title=personalBook().instances.find(entry=>entry.instanceId===instanceId).title;
    const toolbar=el('nav','v2-breadcrumbs');toolbar.append(button('Personal guide','',openPersonalGuide),el('span','', '/'),el('span','',title));
    const selected=renderPhysicalUnit(instanceId);selected.classList.add('v2-current-card');
    selected.dataset.canonicalUnitId=unit.canonicalUnitId;
    main.replaceChildren(toolbar,selected);renderNavigation();
    if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }

  function renderPhysicalUnit(instanceId) {
    const view=projectFormedUnitCards(effectiveCards,options.roster,instanceId);
    return renderFormedUnit(view,{el,renderComponent:component=>
      renderCard(component.card,{variants:component.variants,instanceId:component.unit.instanceId})});
  }

  function renderLibrary() {
    main.replaceChildren();
    const hero = el('section', 'v2-hero');
    if(payload.bookPresentation.coverImage){
      const cover=new URL(payload.bookPresentation.coverImage,options.assetBaseURL || document.baseURI).href;
      hero.dataset.bookArtwork=cover;
      hero.style.setProperty('--v1-book-cover',`url("${cover}")`);
    }
    hero.append(el('span', 'v2-eyebrow', 'YOUR ARMY. EVERY RULE.'), el('h1', '', payload.book.title), el('p', 'v2-hero-subtitle', 'Explore your army book. Find a datasheet, read a rule, or dive into a detachment.'));
    const meta = el('div', 'v2-book-meta');
    // Dataset versions/currentness remain provenance metadata, not player labels.
    if (payload.book.edition !== undefined && payload.book.edition !== null) {
      const badge = el('span', 'v2-meta-badge');
      badge.append(el('span', '', 'Edition '), el('strong', '', exactValue(payload.book.edition)));
      meta.append(badge);
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

  function renderContentsBook(id=null) {
    selectedView=personalMode?'PERSONAL':'READER';selectedId=cards.has(id)?id:null;selectedInstanceId=null;glossaryQuery='';
    personalMode?renderPersonalHome():renderLibrary();
    const pages=el('div','v1-contents-pages'),model=projectContents(payload,personalMode?options.roster.state:null,personalMode?personalBook():null);
    const groupSection=(target,label)=>{const section=el('section','v1-contents-section');section.dataset.contentsTarget=target;section.append(el('h2','v1-contents-heading',label));return section;};
    const rendered=new Set();
    const appendCard=(parent,rootId)=>{
      if(rendered.has(rootId))return;rendered.add(rootId);
      const card=renderCard(cards.get(rootId));parent.append(card);
      if(cards.get(rootId).kind==='DETACHMENT'&&!card.classList.contains('v2-book-record'))for(const child of model.nodes.get(rootId).children){
        const first=child.id&&model.groups.get(child.id)?.[0];
        const target=[...card.querySelectorAll('[data-card-id]')].find(node=>node.dataset.cardId===first);
        if(target){const heading=el('h2','v1-contents-heading',child.label);heading.dataset.contentsTarget=child.id;target.before(heading);}
      }
    };
    const appendInstance=(parent,entry)=>{
      // Canonical IDs may repeat in a personal book; the physical instance is
      // the section identity and supplies the existing effective projection.
      if(rendered.has(entry.id))return;rendered.add(entry.id);
      const view=projectFormedUnitCards(effectiveCards,options.roster,entry.instanceId);
      view.components.forEach(component=>rendered.add(instanceRoute(component.unit.instanceId)));
      // Each formed component already owns its physical Contents anchor. A
      // second outer anchor would send a Character link to the Bodyguard.
      const section=view.formedUnitId?el('section','v1-contents-section'):groupSection(entry.id,entry.label);
      section.append(renderPhysicalUnit(entry.instanceId));
      parent.append(section);
    };
    for(const group of payload.groups.filter(group=>!personalMode&&group.id==='introduction'))for(const rootId of group.itemIds)appendCard(pages,rootId);
    for(const root of model.roots){
      if(personalMode&&root.attachmentGroup){for(const member of root.members)appendInstance(pages,member);continue;}
      if(personalMode&&root.instanceId){appendInstance(pages,root);continue;}
      if(root.id==='start'||!root.id)continue;
      const section=groupSection(root.id,root.label);
      if(root.id==='nav:datasheets')for(const category of root.children){const categorySection=groupSection(category.id,category.label);for(const unit of category.children)appendCard(categorySection,unit.canonicalId);section.append(categorySection);}
      else for(const rootId of model.groups.get(root.id)||[])appendCard(section,rootId);
      pages.append(section);
    }
    main.append(pages);
    // Complete presentation reflow before the unchanged V1 controller measures
    // destinations; deferred column balancing must not move a captured target.
    flushDatasheetLayouts(pages);
    if(cards.has(id))[...pages.querySelectorAll('[data-card-id]')].find(card=>card.dataset.cardId===id)?.classList.add('v2-current-card');renderNavigation();
  }

  function physicalProfileProjection(id,instanceId) {
    if (!personalMode || !instanceId) return null;
    const unit=options.roster.state.units.find(unit=>unit.instanceId===instanceId);
    if (!unit) return null;
    const effective=options.roster.effective(instanceId);
    if(!['DATASHEET','PROFILE','WEAPON_PROFILE'].includes(effectiveCards.get(id)?.kind)&&!effective.abilities.some(ability=>ability.id===id&&ability.abilityRangeField))return null;
    if(cards.get(id).kind==='WEAPON_PROFILE'&&!effective.weapons.some(weapon=>weapon.id===id))return new Map([[id,[]]]);
    if (id!==unit.canonicalUnitId && cards.get(id).parentId!==unit.canonicalUnitId && !effective.weapons.some(weapon=>weapon.id===id)) return new Map([[id,[]]]);
    return projectInstanceCards(effectiveCards,unit,effective);
  }

  function effectiveReference(id,context) {
    const variants=physicalProfileProjection(id,context.instanceId);
    const profiles=options.roster?.effective(context.instanceId).profiles || [];
    const recipients=profiles.filter(profile=>profile.id===context.profileId&&(!context.scopeId||profile.scopeId===context.scopeId));
    const selected=(variants?.get(id)||[]).filter(card=>(!context.scopeId||card.scopeId===context.scopeId)&&
      (!context.profileId||recipients.some(profile=>card.scopeId===profile.scopeId)));
    return {variants,selected};
  }

  function renderEffectiveReference(id,context,focus) {
    selectedView='REFERENCE';selectedId=id;selectedInstanceId=context.instanceId;
    const {variants,selected}=effectiveReference(id,context);
    const toolbar=el('nav','v2-breadcrumbs');toolbar.setAttribute('aria-label','Breadcrumb');
    toolbar.append(button('Personal guide','',openPersonalGuide));
    main.replaceChildren(toolbar,...(selected.length?selected.map(card=>renderCard(card,{inDialog:true,variants,instanceId:context.instanceId})):
      [el('p','v2-not-found','This profile is not available in this roster unit.')]));
    renderNavigation();if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }

  function renderSelected(id, focus = false, instanceId = null) {
    if (personalMode && cards.get(id)?.kind==='DATASHEET') {
      const instances=personalBook().instances.filter(entry=>entry.id===id);
      return instances.length?renderInstance(instances.find(entry=>entry.instanceId===(instanceId || selectedInstanceId))?.instanceId || instances[0].instanceId,focus):renderPersonalHome(focus);
    }
    selectedView = personalMode?'PERSONAL':'READER';
    const variants=physicalProfileProjection(id,instanceId);
    selectedInstanceId = variants ? instanceId : null;
    glossaryQuery = '';
    selectedId = cards.has(id) && (!personalMode || scopedIds().has(id)) ? id : null;
    if (!selectedId) {
      personalMode?renderPersonalHome():renderContentsBook();
      if (id) {
        const warning = el('p', 'v2-not-found', 'This entry is not in this army book. Choose an entry from the library.');
        warning.setAttribute('role', 'status');
        main.prepend(warning);
      }
    } else {
      const card = cards.get(selectedId);
      const toolbar = el('nav', 'v2-breadcrumbs');
      toolbar.setAttribute('aria-label', 'Breadcrumb');
      toolbar.append(button(personalMode?'Personal guide':'Library', '', library));
      if (card.parentId && cards.has(card.parentId)) toolbar.append(el('span', '', '/'), anchor(cards.get(card.parentId).title, card.parentId));
      toolbar.append(el('span', '', '/'), el('span', 'v2-breadcrumb-current', card.title));
      const selected=(variants?.get(id) || [card]).map(card=>renderCard(card,{variants,instanceId:selectedInstanceId}));
      selected.forEach(card=>card.classList.add('v2-current-card'));
      main.replaceChildren(toolbar,...selected);
    }
    renderNavigation();
    if (focus) {
      main.focus({preventScroll: true});
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  }

  function renderReference(id,focus=false) {
    selectedView='REFERENCE';selectedId=references.canResolve(id,scopedIds())?id:null;selectedInstanceId=null;
    const toolbar=el('nav','v2-breadcrumbs');toolbar.setAttribute('aria-label','Breadcrumb');
    toolbar.append(button('Glossary','',openGlossary));
    const article=referencePresenter.render(id);article.classList.add('v2-current-card');
    main.replaceChildren(toolbar,article);renderNavigation();
    if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }

  function renderGlossary(query = '', focus = false) {
    selectedView = 'GLOSSARY';
    selectedId = null;
    selectedInstanceId = null;
    glossaryQuery = query;
    const catalog=createGlossaryCatalog({el,button,anchor,lifecycle,contract:references,allowedIds:scopedIds,
      query,category:glossaryCategory,onClose:closeGlossary,onChange:state=>{
        glossaryQuery=state.query;glossaryCategory=state.category;
        const patch=state.changed==='category'?{glossaryCategory}:{glossaryQuery};
        window.history.replaceState({...window.history.state,armyBookV2:{...window.history.state?.armyBookV2,...patch}},'',window.location.href);
      }});
    glossaryCategory=catalog.category;
    main.replaceChildren(catalog.node);
    renderNavigation();
    if (focus) {
      catalog.input.focus({preventScroll: true});
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  }

  function hashId() {
    try { return decodeURIComponent(window.location.hash.slice(1)); } catch { return ''; }
  }
  function routeInstanceId(id) {
    try { return decodeURIComponent(id.slice('roster-unit/'.length)); } catch { return null; }
  }
  function renderRoster(focus = false) {
    selectedView = 'ROSTER';
    selectedId = null;
    selectedInstanceId = null;
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
    let context;
    try {context=decodeRoute(window.location.href,{bookId:payload.book.id,identityFor:references.identityFor});}
    catch {
      if(dialog.open)dialog.close();
      main.replaceChildren(el('p','v2-not-found','This link has incomplete or invalid context. Open the book or import the roster to continue.'));return;
    }
    const rosterId=context.rosterId;
    const referenceView=context.destination==='REFERENCE'||context.destination==='GLOSSARY'&&context.canonicalId||cards.get(id)?.domain==='CORE';
    personalMode=Boolean(rosterPanel && id!==rosterRoute && rosterId && options.roster.state?.rosterId===rosterId);
    const detail = state?.armyBookV2?.detailId === id && references.canResolve(id,scopedIds());
    navigationBlocked=Boolean(rosterId&&options.roster?.state?.rosterId!==rosterId);
    const key = JSON.stringify([context,id, detail, referenceView, state?.armyBookV2?.detailReference, state?.armyBookV2?.glossaryCategory, personalMode,state?.armyBookV2?.contents,state?.armyBookV2?.backgroundContents, state?.armyBookV2?.backgroundId,state?.armyBookV2?.backgroundInstanceId, state?.armyBookV2?.backgroundView, state?.armyBookV2?.glossaryQuery]);
    if (routeKey === key) return;
    routeKey = key;
    if(contents?.controller.state.owner==='controller')contents.controller.cancelTransition();
    toggleDrawer(false);
    if(['HOME','CORE_RULES'].includes(context.destination)) {
      if(dialog.open)dialog.close();document.body.classList.remove('v2-detail-open');
      main.replaceChildren(el('p','v2-not-found','This destination is not available in this book reader.'));return;
    }
    const identity=references.identityFor(id);
    const wrongRegistry=identity?identity.registryId!==context.registryId:context.registryId!==payload.book.id;
    const physicalOwner=context.instanceId&&options.roster?.state?.units.find(unit=>unit.instanceId===context.instanceId);
    const wrongOwner=context.instanceId&&(!personalMode||!physicalOwner||cards.get(id)?.kind==='DATASHEET'&&physicalOwner.canonicalUnitId!==id);
    if(context.bookId!==payload.book.id||wrongRegistry||wrongOwner) {
      if(dialog.open)dialog.close();document.body.classList.remove('v2-detail-open');
      selectedId=selectedInstanceId=null;selectedView='REFERENCE';
      main.replaceChildren(el('p','v2-not-found','This link belongs to a different book or an unavailable roster unit.'));renderNavigation();return;
    }
    if(navigationBlocked&&!(referenceView&&cards.get(id)?.domain==='CORE')){
      selectedId=selectedInstanceId=null;selectedView='ROSTER';main.replaceChildren(el('p','v2-not-found','Imported roster context is unavailable. Import this roster to continue.'));renderNavigation();return;
    }
    if (detail) {
      if (state.armyBookV2.backgroundView === 'GLOSSARY' && payload.glossary) {
        glossaryCategory=state.armyBookV2.glossaryCategory || '';
        if (selectedView !== 'GLOSSARY' || glossaryQuery !== (state.armyBookV2.glossaryQuery || '')) renderGlossary(state.armyBookV2.glossaryQuery || '');
      } else if(state.armyBookV2.backgroundView==='REFERENCE') {
        const background=state.armyBookV2.backgroundContext;
        if(background?.instanceId)renderEffectiveReference(state.armyBookV2.backgroundId,background);
        else renderReference(state.armyBookV2.backgroundId);
      } else if (state.armyBookV2.backgroundView === 'ROSTER' && rosterPanel) {
        if (selectedView !== 'ROSTER') renderRoster();
      } else if (personalMode && state.armyBookV2.backgroundInstanceId) {
        renderSelected(state.armyBookV2.backgroundId,false,state.armyBookV2.backgroundInstanceId);
      } else if (personalMode && state.armyBookV2.backgroundView==='PERSONAL' && !state.armyBookV2.backgroundId) {
        renderPersonalHome();
      } else if(state.armyBookV2.backgroundContents){renderContentsBook(state.armyBookV2.backgroundId);window.scrollTo({top:state.armyBookV2.scrollY||0,behavior:'instant'});
      } else if (selectedView !== 'READER' || selectedId !== (state.armyBookV2.backgroundId || null)) renderSelected(state.armyBookV2.backgroundId, false);
      // A profile opened from an effective instance is the same physical
      // projection as its parent card, not a fresh canonical profile. Rule
      // definitions and Glossary details keep their canonical source path.
      const instanceId=context.instanceId;
      const {variants,selected:effectiveCards}=instanceId?effectiveReference(id,context):{};
      const projectedCards=variants?.get(id);
      dialogContent.replaceChildren(...(effectiveCards?.length
        ? effectiveCards.map((card,index)=>renderCard(card,{inDialog:true,variants,instanceId,primaryDetail:index===0}))
        : projectedCards ? [el('p','v2-not-found','This profile is not available in this roster unit.')]
        : [(cards.get(id).domain==='CORE'||state.armyBookV2.detailReference)&&!['PROFILE','WEAPON_PROFILE'].includes(cards.get(id).kind)
          ?referencePresenter.render(id,{popup:true}):renderCard(cards.get(id),{inDialog:true})]));
      dialog.dataset.canonicalId=id;
      if (!dialog.open) {
        lastFocus = popupOrigin || document.activeElement;
        dialog.showModal();
      }
      dialogContent.scrollTop = state.armyBookV2.detailScrollTop || 0;
      if(context.fieldPath){const fact=[...dialogContent.querySelectorAll('[data-fact-id]')].find(node=>node.dataset.factId===`${id}::${context.fieldPath}`);fact?.scrollIntoView({block:'nearest'});}
      document.body.classList.add('v2-detail-open');
      dialogBar.lastChild.focus({preventScroll: true});
      positionV1Popup(dialog,{origin:popupOrigin,rect:popupOriginRect});
    } else {
      if (dialog.open) dialog.close();
      document.body.classList.remove('v2-detail-open');
      if (id === glossaryRoute && payload.glossary) {glossaryCategory=state?.armyBookV2?.glossaryCategory || '';renderGlossary(state?.armyBookV2?.glossaryQuery || '', focus);}
      else if (context.destination==='UNIT_INSTANCE')renderInstance(context.instanceId,focus);
      else if (context.instanceId&&cards.get(id)?.kind==='DATASHEET')renderInstance(context.instanceId,focus);
      else if (context.instanceId&&physicalProfileProjection(id,context.instanceId))renderEffectiveReference(id,context,focus);
      else if (referenceView&&references.canResolve(id,scopedIds()))renderReference(id,focus);
      else if (id === rosterRoute && rosterPanel) renderRoster(focus);
      else if (personalMode && id===personalRoute) renderPersonalHome(focus);
      else if (personalMode && id.startsWith('roster-unit/')) renderInstance(routeInstanceId(id),focus);
      else if (rosterPanel && (id===personalRoute || id.startsWith('roster-unit/') || rosterId && !options.roster.state)) renderRoster(focus);
      else if(state?.armyBookV2?.contents||id==='start'||id?.startsWith('nav:')||!personalMode&&cards.has(id)&&cards.get(id).domain!=='CORE'&&!state?.armyBookV2)renderContentsBook(id);
      else renderSelected(id || null, focus, context.instanceId);
      if(!referenceView&&!controlledRoute&&(state?.armyBookV2?.contents||id==='start'||id?.startsWith('nav:')||!personalMode&&cards.has(id)&&cards.get(id).domain!=='CORE'&&!state?.armyBookV2)){lifecycle.frame(()=>contents.restore(id||'start',state?.armyBookV2?.scrollY));}
      else if(!focus&&!controlledRoute)lifecycle.frame(()=>window.scrollTo({top:state?.armyBookV2?.scrollY||0,behavior:'instant'}));
      if (!focus && lastFocus) {
        // Finish the existing V1 column moves before returning focus to an
        // ability trigger; moving its ancestor afterwards would blur it.
        flushDatasheetLayouts(main);
        const origin=lastFocus;
        const owner=origin.closest('[data-card-id]');
        const ownerInstance=origin.closest('[data-roster-instance-id]')?.dataset.rosterInstanceId;
        const restoreFocus=()=>{
          flushDatasheetLayouts(main);
          const candidates=[...main.querySelectorAll('[data-target-id]')].filter(node=>
            (!owner||node.closest('[data-card-id]')?.dataset.cardId===owner.dataset.cardId)&&
            (!ownerInstance||node.closest('[data-roster-instance-id]')?.dataset.rosterInstanceId===ownerInstance));
          const exact=origin.dataset.popupIdentity&&candidates.find(node=>node.dataset.popupIdentity===origin.dataset.popupIdentity);
          const unscoped=candidates.find(node=>node.dataset.targetId===origin.dataset.targetId&&!node.dataset.popupIdentity);
          const restoreTarget=origin.isConnected?origin:exact||unscoped;
          restoreTarget?.focus({preventScroll:true});
        };
        restoreFocus();
        lifecycle.frame(()=>lifecycle.frame(restoreFocus));
      }
      lastFocus = null;
    }
  }
  function routeContext(id,detail=false,routeOptions={}) {
    const physicalAlias=id?.startsWith('roster-unit/');
    const personal=id===personalRoute||physicalAlias;
    const rosterId=routeOptions.fullBook?null:routeOptions.rosterId ||
      (personal||routeOptions.personalBook||id===rosterRoute||selectedView==='ROSTER'?optionsRosterId():new URLSearchParams(window.location.search).get('roster'));
    const ownerId=routeOptions.instanceId || (personalMode?selectedInstanceId:null);
    const owner=ownerId&&options.roster?.state?.units.find(unit=>unit.instanceId===ownerId);
    const effective=owner&&options.roster.effective(ownerId);
    const kind=(owner?effectiveCards:cards).get(id)?.kind;
    const abilityTarget=effective?.abilities.some(ability=>ability.id===id&&ability.abilityRangeField);
    const projectedTarget=['DATASHEET','PROFILE','WEAPON_PROFILE'].includes(kind)||abilityTarget;
    const ownsTarget=owner&&(id===owner.canonicalUnitId||effective.profiles.some(profile=>profile.id===id)||effective.weapons.some(weapon=>weapon.id===id)||abilityTarget);
    const instanceId=physicalAlias?routeInstanceId(id):projectedTarget&&rosterId&&(routeOptions.instanceId||ownsTarget)?ownerId:null;
    const physical=physicalAlias||kind==='DATASHEET'&&instanceId&&!detail;
    const scopeId=instanceId?routeOptions.scopeId || null:null;
    const profileId=instanceId?(routeOptions.profileId || (kind==='PROFILE'?id:scopeId?effective?.profiles.find(profile=>profile.scopeId===scopeId)?.id:null)):null;
    const reference=Boolean(routeOptions.reference||detail||cards.get(id)?.domain==='CORE'||personalMode&&cards.has(id)&&!scopedIds().has(id));
    const destination=physical?'UNIT_INSTANCE':id===personalRoute?'PERSONAL_GUIDE':id===rosterRoute?'ROSTER':
      id===glossaryRoute?'GLOSSARY':reference||instanceId?'REFERENCE':'ARMY_BOOK';
    return {destination,bookId:payload.book.id,registryId:references.identityFor(id)?.registryId || payload.book.id,
      canonicalId:physical||[personalRoute,rosterRoute,glossaryRoute].includes(id)?null:id || null,
      rosterId,instanceId,profileId,scopeId,fieldPath:routeOptions.fieldPath || null};
  }
  function routeURL(id,detail=false,routeOptions={}) {return encodeRoute(window.location.href,routeContext(id,detail,routeOptions));}
  function navigate(id, detail, routeOptions = {}) {
    const glossary = id === glossaryRoute && Boolean(payload.glossary) && !detail;
    const roster = id === rosterRoute && Boolean(rosterPanel) && !detail;
    const personal = Boolean(rosterPanel) && (id===personalRoute || id?.startsWith('roster-unit/')) && !detail;
    if (id && !cards.has(id) && !glossary && !roster && !personal && !contents?.isTarget(id)) return false;
    if (personal && !rosterPanel) return false;
    if (personalMode && cards.has(id) && !scopedIds().has(id) && !references.canResolve(id,scopedIds())) return false;
    const reference=Boolean(routeOptions.reference || detail&&popupPresentation?.reference || personalMode&&cards.has(id)&&!scopedIds().has(id));
    const nextHash = id ? `#${encodeURIComponent(id)}` : '';
    let backgroundContext=window.history.state?.armyBookV2?.detailId?window.history.state.armyBookV2.backgroundContext:null;
    if(!backgroundContext)try{backgroundContext=decodeRoute(window.location.href,{bookId:payload.book.id,identityFor:references.identityFor});}catch{backgroundContext=null;}
    window.history.replaceState({...window.history.state, armyBookV2: {...window.history.state?.armyBookV2, scrollY: window.scrollY, detailScrollTop: dialogContent.scrollTop, ...(selectedView === 'GLOSSARY' ? {glossaryQuery,glossaryCategory} : {})}}, '', window.location.href);
    // History carries presentation/background only. Entity ownership is in the URL.
    const state = {armyBookV2: detail ? {detailId: id, detailReference:reference, glossaryCategory, backgroundContext, backgroundId: selectedId, backgroundInstanceId:selectedInstanceId, backgroundView: selectedView, backgroundContents:Boolean(window.history.state?.armyBookV2?.contents||main.querySelector('.v1-contents-pages')&&!personalMode), glossaryQuery: selectedView === 'GLOSSARY' ? glossaryQuery : '', scrollY: window.scrollY} : glossary ? {view: 'GLOSSARY', glossaryCategory:'', glossaryQuery: routeOptions.query || '', glossaryReturnId: selectedInstanceId?instanceRoute(selectedInstanceId):['READER','PERSONAL','REFERENCE'].includes(selectedView) ? selectedId || (personalMode?personalRoute:null) : window.history.state?.armyBookV2?.glossaryReturnId || null, glossaryReturnReference:selectedView==='REFERENCE'||Boolean(window.history.state?.armyBookV2?.glossaryReturnReference&&selectedView==='GLOSSARY'), scrollY: 0} : roster ? {view: 'ROSTER', scrollY: 0} : {selectedId: id, ...(routeOptions.contents?{contents:true}:{}), scrollY: 0}};
    const destination=new URL(routeURL(id,detail,detail?{...routeOptions,...popupPresentation}:routeOptions));
    if (window.location.hash !== nextHash || destination.search!==window.location.search || Boolean(window.history.state?.armyBookV2?.detailId) !== detail) {
      window.history.pushState(state, '', destination.href);
    } else window.history.replaceState(state, '', destination.href);
    routeKey = null;
    controlledRoute=Boolean(routeOptions.controlled);
    route({focus: !detail&&!controlledRoute});
    controlledRoute=false;
    return true;
  }
  function open(id) { return navigate(id, false); }
  function showDetail(id, presentation=null) { popupOrigin=document.activeElement;popupOriginRect=popupOrigin?.getBoundingClientRect?.();popupPresentation=presentation;return navigate(id, true); }
  function optionsRosterId(){return options.roster?.state?.rosterId || '';}
  function library() { return personalMode?navigate(personalRoute,false):navigate(null, false); }
  function openLibrary() { return navigate(null,false,{fullBook:true}); }
  function openPersonalGuide() { return options.roster?.state?.units?.length ? navigate(personalRoute,false,{rosterId:optionsRosterId()}) : false; }
  function openInstance(id) { return options.roster?.state?.units?.some(unit=>unit.instanceId===id)?navigate(instanceRoute(id),false,{rosterId:optionsRosterId()}):false; }
  function openRoster() { return rosterPanel ? navigate(rosterRoute, false) : false; }
  function openGlossary() { return payload.glossary ? navigate(glossaryRoute, false, {query: ''}) : false; }
  function closeGlossary() { const state=window.history.state?.armyBookV2;return navigate(state?.glossaryReturnId || null, false,{reference:Boolean(state?.glossaryReturnReference)}); }
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
  function toggleDrawer(value){contents?.controller.setDrawer(value);}
  lifecycle.listen(search,'input', renderNavigation);
  lifecycle.listen(dialog,'cancel', event => { event.preventDefault(); closeDetail(); });
  lifecycle.listen(dialog,'click', event => { if (event.target === dialog) closeDetail(); });
  lifecycle.listen(popupStyles,'load',()=>positionV1Popup(dialog,{origin:popupOrigin,rect:popupOriginRect}));
  lifecycle.listen(window,'resize',()=>positionV1Popup(dialog,{origin:popupOrigin,rect:popupOriginRect}),{passive:true});
  lifecycle.listen(shell,'keydown', event => {
    if (!contents?.controller.state.drawer && !dialog.open && selectedView === 'GLOSSARY' && event.key === 'Escape') {
      event.preventDefault();
      closeGlossary();
      return;
    }
  });
  lifecycle.listen(window,'popstate', () => route());
  lifecycle.listen(window,'hashchange', () => route());
  function renderAllForQA() {
    if (dialog.open) dialog.close();
    document.body.classList.remove('v2-detail-open');
    // Dedicated source-evidence surface, never a normal player datasheet.
    main.replaceChildren(...[...cards.values()].map(card => renderCard({...card, children: []},{sourceEvidence:true})));
    return main;
  }
  contents=mountV1Contents(document,{header,panel:sidebar,tree:navigation,main,menuButton:drawerToggle,collapseButton:desktopToggle,scrim:overlay},{
    parentId:id=>cards.get(id)?.parentId,
    // V1 scroll-follow tracks a continuous book. A focused V2 card has no
    // neighbouring book sections; its explicit canonical/physical selection
    // remains current even above the card (for example after history restore).
    tracking:()=>['READER','PERSONAL'].includes(selectedView)&&Boolean(main.querySelector('.v1-contents-pages')),
    navigate:(id,instanceId)=>{
      if(instanceId)return navigate(instanceRoute(instanceId),false,{rosterId:optionsRosterId(),controlled:true});
      return navigate(id,false,personalMode||selectedView==='ROSTER'&&options.roster?.state?.units?.length
        ?{personalBook:true,controlled:true}:{contents:true,controlled:true});
    },
    settled:id=>{if(hashId()===id)window.history.replaceState({...window.history.state,armyBookV2:{...window.history.state?.armyBookV2,scrollY:window.scrollY}},'',window.location.href);}
  },{lifecycle});
  lifecycle.listen(navStyles,'load',()=>{contents.controller.refreshGeometry();if(!personalMode&&main.querySelector('.v1-contents-pages')&&hashId()&&contents.isTarget(hashId()))contents.restore(hashId(),window.history.state?.armyBookV2?.scrollY);});
  lifecycle.observe(new window.MutationObserver(lifecycle.guard(()=>{
    const state=options.roster?.state;
    const signature=JSON.stringify(state?[state.rosterId,state.detachmentIds,state.units.map(unit=>[unit.instanceId,unit.canonicalUnitId,unit.enhancementIds]),state.attachments]:null);
    if(signature!==lastRosterNavigation){lastRosterNavigation=signature;renderNavigation();}
    contents.controller.scheduleGeometry();
  }))).observe(main,{childList:true,subtree:true});
  let lastRosterNavigation=null;
  const safe=callback=>lifecycle.guard(callback);
  const api = Object.freeze({get destroyed(){return !lifecycle.active;},destroy:lifecycle.destroy,payload, open:safe(open), showDetail:safe(showDetail), library:safe(library), openLibrary:safe(openLibrary), openPersonalGuide:safe(openPersonalGuide), openInstance:safe(openInstance), renderAllForQA:safe(renderAllForQA), openRelatedRules:safe(openRelatedRules), setRelatedDetachment:safe(setRelatedDetachment), openGlossary:safe(openGlossary), closeGlossary:safe(closeGlossary), openRoster:safe(openRoster), routeURL:safe(routeURL), roster: options.roster, rosterPanel, navigation:contents.controller});
  lifecycle.cleanup(()=>{
    const restoreFocus=shell.contains(document.activeElement);
    contents?.destroy();rosterPanel?.destroy();
    if(dialog.open)dialog.close();if(relatedDialog.open)relatedDialog.close();
    shell.remove();ownedStyles.forEach(style=>style.remove());
    for(const [name,present]of bodyClasses)document.body.classList.toggle(name,present);
    if(!hadBodyClass&&!document.body.className)document.body.removeAttribute('class');
    document.title=previousTitle;
    if(restoreFocus&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    lastFocus=popupOrigin=popupOriginRect=popupPresentation=activeRelatedPanel=null;
    selectedId=selectedInstanceId=routeKey=null;glossaryQuery=glossaryCategory=relatedDetachmentId='';
    if(window.ArmyBookAppV2===api){if(previousApi&&!previousApi.destroyed)window.ArmyBookAppV2=previousApi;else delete window.ArmyBookAppV2;}
  });
  window.ArmyBookAppV2 = api;
  route();
  if (rosterPanel) rosterPanel.ready.then(lifecycle.guard(()=>{routeKey=null;route();}));
  return api;
}
