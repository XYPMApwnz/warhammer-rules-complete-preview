/** Optional roster view. The injected service owns every identity, fact and effect. */
export function createRosterPanel(document, {service, bookId, open, showDetail, titleForId, openPersonalGuide, showInstance,routeURL}) {
  if (!service || !Array.isArray(service.catalog)) throw new TypeError('A canonical roster service is required.');
  for (const method of ['draft', 'import', 'load', 'snapshot', 'effective', 'related', 'candidates', 'attach', 'detach']) {
    if (typeof service[method] !== 'function') throw new TypeError(`Roster service requires ${method}().`);
  }
  const window = document.defaultView;
  const catalog = new Map(service.catalog.map(record => [record.id, record]));
  if (catalog.size !== service.catalog.length) throw new TypeError('Duplicate canonical roster catalog identity.');
  const storageKey = `army-book-app-v2:roster:${bookId}`;
  const text = value => value === null || value === undefined ? 'Unknown' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = String(value);
    return node;
  };
  const named = id => catalog.get(id)?.title || titleForId(id) || 'Unavailable entry';
  const button = (label, action, actionId) => {
    const node = el('button', 'v2-reference', label);
    node.type = 'button';
    if (actionId) node.dataset.rosterAction = actionId;
    node.addEventListener('click', () => run(action));
    return node;
  };
  const reference = (id, label = named(id), reader = false) => {
    const link = el('a', 'v2-reference', label);
    link.href = routeURL?routeURL(id,!reader):`#${encodeURIComponent(id)}`;
    link.dataset.targetId = id;
    link.addEventListener('click', event => {
      if (event.button || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      const result = reader ? open(id) : showDetail(id);
      if (result === false) setStatus('This source entry is not available in the reader.', true);
    });
    return link;
  };
  const section = el('section', 'v2-roster');
  section.dataset.rosterView = '';
  const style = el('style');
  style.textContent = `
    .v2-roster { --v2-paper:var(--book-panel, #191f1a); --v2-ink:var(--book-ink, #e2dcc9); --v2-muted:var(--book-muted-readable, #b7b8aa); --v2-line:var(--book-control-line, #566052); --v2-green:var(--book-accent, #bfd58c); display:grid; gap:20px; min-width:0; color:var(--v2-ink); }
    .v2-roster .v2-card { background:var(--v2-paper); color:var(--v2-ink); border-color:var(--v2-line); }
    .v2-roster .v2-reference { background:var(--book-panel-raised, #252c25); color:var(--v2-green); border-color:var(--book-control-line, #6c7950); }
    .v2-roster .v2-reference:hover { background:var(--book-hover, #313c2a); color:var(--book-ink-bright, #f0eddd); }
    .v2-roster :is(button,a,input,select,textarea):focus-visible { outline:2px solid var(--v2-green); outline-offset:3px; }
    .v2-roster textarea::placeholder { color:var(--v2-muted); opacity:1; }
    .v2-roster h1 { margin:0; font-size:30px; letter-spacing:-.03em; }
    .v2-roster h2 { margin:0 0 14px; font-size:19px; }
    .v2-roster h3 { margin:0 0 10px; font-size:16px; }
    .v2-roster h2,.v2-roster h3 { overflow-wrap:anywhere; }
    .v2-roster p { line-height:1.7; overflow-wrap:anywhere; }
    .v2-roster-pane { padding:24px; }
    .v2-roster-tools { display:flex; flex-wrap:wrap; gap:9px; align-items:center; }
    .v2-roster button { min-height:40px; cursor:pointer; }
    .v2-roster input,.v2-roster select,.v2-roster textarea { font:inherit; font-size:13px; color:var(--v2-ink); background:var(--v2-paper); border:1px solid var(--v2-line); border-radius:7px; padding:10px; max-width:100%; }
    .v2-roster textarea { display:block; width:100%; min-height:190px; resize:vertical; line-height:1.6; margin:10px 0 14px; }
    .v2-roster label { font-size:12px; line-height:1.6; }
    .v2-roster-field { display:grid; gap:7px; min-width:0; margin:12px 0; }
    .v2-roster select { width:100%; min-height:42px; }
    .v2-roster select[multiple] { min-height:140px; }
    .v2-roster input[type=checkbox] { min-width:18px; min-height:18px; }
    .v2-roster-status { margin:0; padding:12px 16px; border-radius:8px; background:var(--book-panel-raised, #252c25); font-size:13px; overflow-wrap:anywhere; }
    .v2-roster-error { background:#3a281d; color:#ffd799; }
    .v2-roster-bindings { display:grid; gap:13px; margin-top:18px; }
    .v2-roster-bindings fieldset { margin:0; border:1px solid var(--v2-line); padding:14px; border-radius:9px; min-width:0; }
    .v2-roster-bindings legend { padding:0 6px; font-size:13px; font-weight:700; overflow-wrap:anywhere; }
    .v2-roster-hint { color:var(--v2-muted); font-size:12px; margin:7px 0; }
    .v2-roster-instance { margin:0; }
    .v2-roster-instance-header { padding:22px 24px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; border-bottom:1px solid var(--v2-line); }
    .v2-roster-instance-header h2 { margin:4px 0 0; }
    .v2-roster-instance-header > a { margin-left:auto; }
    .v2-roster-identity { padding:16px 24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; background:var(--book-panel-raised, #252c25); }
    .v2-roster-identity dt { font-size:10px; color:var(--v2-muted); font-weight:700; margin-bottom:5px; }
    .v2-roster-identity dd { margin:0; font-size:13px; line-height:1.6; }
    .v2-roster-body { padding:22px 24px; display:grid; gap:22px; }
    .v2-roster-model { border-left:3px solid var(--book-accent, #c8d6ac); padding-left:13px; margin:13px 0; }
    .v2-roster-list { padding:0; margin:10px 0; list-style:none; display:grid; gap:9px; }
    .v2-roster-list li { padding:10px 12px; border:1px solid var(--v2-line); border-radius:7px; min-width:0; overflow-wrap:anywhere; font-size:12px; line-height:1.7; }
    .v2-roster-list .v2-reference { margin:3px 5px 3px 0; }
    .v2-roster-profile { background:var(--book-panel-raised, #252c25); border:1px solid var(--v2-line); padding:15px; border-radius:9px; margin:10px 0; }
    .v2-roster-profile dl { display:grid; grid-template-columns:repeat(auto-fit,minmax(80px,1fr)); gap:14px; margin:0; }
    .v2-roster-profile dt { color:var(--v2-muted); font-size:10px; }
    .v2-roster-profile dd { margin:4px 0 0; font-size:16px; font-weight:650; overflow-wrap:anywhere; }
    .v2-roster-provenance { margin-top:9px; font-size:11px; overflow-wrap:anywhere; color:var(--v2-muted); }
    .v2-roster-provenance summary { cursor:pointer; }
    .v2-roster-structured { padding-left:12px; border-left:2px solid var(--v2-line); margin:8px 0; }
    .v2-roster-structured dt { font-size:10px; font-weight:700; color:var(--v2-muted); }
    .v2-roster-structured dd { margin:4px 0 12px; font-size:12px; line-height:1.7; overflow-wrap:anywhere; white-space:pre-wrap; }
    .v2-roster-related-list .v2-count { display:inline-block; margin-left:6px; }
    .v2-roster-loading { opacity:.65; pointer-events:none; }
    @media(max-width:860px) { .v2-roster-pane,.v2-roster-body { padding:18px 16px; } .v2-roster-instance-header { padding:18px 16px; } .v2-roster-identity { padding:15px 16px; grid-template-columns:repeat(2,minmax(0,1fr)); } .v2-roster h1 { font-size:26px; } .v2-roster-profile dl { grid-template-columns:repeat(3,minmax(0,1fr)); } .v2-roster .v2-reference { overflow-wrap:anywhere; } }
  `;
  section.append(style);
  const heading = el('div', 'v2-roster-tools');
  heading.append(el('h1', '', 'Attachment Setup'), button('Library', () => open(null), 'library'));
  const status = el('p', 'v2-roster-status', 'Import a New Recruit text export, optionally attach eligible Characters or Support, then open your personal guide.');
  status.setAttribute('role', 'status');
  const importPane = el('section', 'v2-card v2-roster-pane');
  importPane.append(el('h2', '', 'Import roster'));
  const rawLabel = el('label', 'v2-roster-field', 'New Recruit text export');
  const raw = el('textarea');
  raw.setAttribute('aria-label', 'New Recruit text export');
  raw.placeholder = 'Paste the text export here…';
  raw.spellcheck = false;
  raw.dataset.rosterInput = 'raw-text';
  rawLabel.append(raw);
  const importActions = el('div', 'v2-roster-tools');
  importActions.append(button('Import roster', reviewImport, 'review-import'));
  const bindingArea = el('div');
  bindingArea.dataset.rosterBindings = '';
  const draftArea = el('div');
  importPane.append(rawLabel, importActions, draftArea, bindingArea);
  const backupPane = el('details', 'v2-card v2-roster-pane');
  backupPane.append(el('summary', '', 'Backup and restore'));
  const backupTools = el('div', 'v2-roster-tools');
  backupTools.style.marginTop = '14px';
  const fileLabel = el('label', 'v2-roster-field', 'Restore a V2 roster backup');
  const file = el('input');
  file.type = 'file';
  file.accept = '.json,application/json';
  file.setAttribute('aria-label', 'Restore a V2 roster backup');
  file.addEventListener('change', () => run(async () => {
    const selectedFile = file.files?.[0];
    if (!selectedFile) return;
    const state = JSON.parse(await selectedFile.text());
    checkResult(await service.load(state));
    renderRoster();
    saveAndReport('Roster backup restored.');
    file.value = '';
  }));
  fileLabel.append(file);
  backupTools.append(button('Export backup', exportBackup, 'export-backup'), button('Reload saved roster', restoreSaved, 'reload-saved'));
  backupPane.append(backupTools, fileLabel, el('p', 'v2-roster-hint', 'Imported rosters and attachments are saved in this browser. Backups contain V2 roster state.'));
  const rosterArea = el('div', 'v2-roster');
  rosterArea.dataset.rosterInstances = '';
  section.append(heading, status, importPane, backupPane, rosterArea);
  let bindings = {};
  let importText = '';
  let importResult = null;
  let busy = false;

  function setStatus(message, error = false) {
    status.textContent = String(message);
    status.classList.toggle('v2-roster-error', error);
  }
  function playerError(error) {
    const messages = {
      EMPTY_IMPORT: 'No supported units were found. Paste a New Recruit text export.',
      INVALID_COMPOSITION: 'The imported unit composition could not be read safely. Check the New Recruit export.',
      INVALID_SELECTION_QUANTITY: 'An imported wargear quantity could not be read safely. Check the New Recruit export.',
      CONFLICTING_SELECTION_QUANTITY: 'The export contains conflicting wargear quantities. Check the New Recruit export.',
      AMBIGUOUS_WARLORD_IDENTITY: 'The Warlord could not be identified safely. Check the New Recruit export.',
      UNRESOLVED_ENHANCEMENT_OWNER: 'An Enhancement owner could not be identified safely. Check the New Recruit export.',
      FOREIGN_ENHANCEMENT_CONTEXT: 'An Enhancement belongs to a Detachment that was not imported. Check the New Recruit export.'
    };
    return messages[error?.code] || 'An imported entry could not be read safely. Check the New Recruit export or roster backup.';
  }
  function actionError(message) {
    const error = new Error(message);
    error.playerMessage = message;
    return error;
  }
  function checkResult(result) {
    if (result === false || result?.status === 'INVALID' || result?.errors?.length) {
      throw actionError(result?.errors?.map(playerError).join(' ') || 'Roster state could not be validated.');
    }
    return result;
  }
  async function run(action) {
    if (busy) return;
    busy = true;
    section.setAttribute('aria-busy', 'true');
    section.classList.add('v2-roster-loading');
    try { await action(); }
    catch (error) { setStatus(error.playerMessage || 'This action could not be completed. Check the New Recruit export or roster backup and try again.', true); }
    finally { busy = false; section.removeAttribute('aria-busy'); section.classList.remove('v2-roster-loading'); }
  }
  function persist() {
    try { window.localStorage.setItem(storageKey, JSON.stringify(service.snapshot())); return null; }
    catch (error) { return error; }
  }
  function saveAndReport(message) {
    const error = persist();
    setStatus(error ? `${message} This browser could not save the roster. Export a backup to keep your changes.` : message, Boolean(error));
  }
  async function restoreSaved() {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) { setStatus('No saved V2 roster was found in this browser.'); return; }
    checkResult(await service.load(JSON.parse(saved)));
    renderRoster();
    setStatus('Saved roster reloaded and validated.');
  }
  function exportBackup() {
    if (!service.state?.units?.length) { setStatus('Import a roster before exporting a backup.', true); return; }
    const blob = new window.Blob([JSON.stringify(service.snapshot(), null, 2)], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bookId}-roster-v2.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    setStatus('Roster backup exported.');
  }
  async function reviewImport() {
    importText = raw.value;
    bindings = {};
    const draft = await service.draft(importText);
    renderDraft(draft);
    await resolveImport();
  }
  function renderDraft(draft) {
    draftArea.replaceChildren();
    if (!draft?.units?.length) return;
    const preview = el('details');
    preview.append(el('summary', 'v2-roster-hint', `Imported text: ${draft.units.length} physical unit entries`));
    const list = el('ul', 'v2-roster-list');
    draft.units.forEach(unit => {
      const item = el('li', '', `${unit.name} · ${text(unit.rawQuantity)} imported quantity`);
      item.dataset.rawUnitId = unit.id;
      list.append(item);
    });
    preview.append(list);
    draftArea.append(preview);
  }
  async function resolveImport() {
    importResult = await service.import(importText, structuredClone(bindings));
    renderDraft(importResult.draft);
    if (importResult.status === 'READY') {
      if (!service.state?.units?.length) checkResult(await service.load(importResult.roster));
      bindingArea.replaceChildren();
      renderRoster();
      saveAndReport('Roster imported. Attachments are optional. Open your personal guide when ready.');
      rosterArea.scrollIntoView({block: 'start', behavior: 'instant'});
    } else {
      renderBindings(importResult.needsBindings || []);
      const errors = (importResult.errors || []).map(playerError).join(' ');
      setStatus(errors || 'Some imported labels need clarification. Resolve the ambiguous entries below or provide a corrected New Recruit export.', importResult.status === 'INVALID');
    }
  }
  function selectRecords(records, {multiple = false, value = '', label} = {}) {
    const select = el('select');
    select.multiple = multiple;
    select.setAttribute('aria-label', label);
    if (!multiple) { const placeholder = el('option', '', 'Choose an entry…'); placeholder.value = ''; select.append(placeholder); }
    records.forEach(record => {
      const option = el('option', '', record.title);
      option.value = record.id;
      option.selected = multiple ? (value || []).includes(record.id) : record.id === value;
      select.append(option);
    });
    return select;
  }
  function renderBindings(needs) {
    bindingArea.replaceChildren();
    if (!needs.length) return;
    const form = el('form', 'v2-roster-bindings');
    const read = [];
    let blocked = false;
    for (const need of needs) {
      const fieldset = el('fieldset');
      fieldset.dataset.bindingKind = need.kind;
      fieldset.dataset.bindingKey = need.key;
      fieldset.append(el('legend', '', need.rawLabel || 'Imported entry'));
      const candidates = need.kind === 'SELECTION'
        ? (need.candidates || [])
        : (need.candidateIds || []).map(id => catalog.get(id)).filter(Boolean);
      if (!candidates.length || ['SELECTION_QUANTITY', 'SELECTION_FIELD'].includes(need.kind)) {
        blocked = true;
        fieldset.append(el('p', 'v2-roster-hint', 'This imported entry could not be identified safely. Provide a corrected New Recruit export; roster composition and quantities cannot be changed here.'));
      } else {
        fieldset.append(el('p', 'v2-roster-hint', 'This label needs clarification. Confirm which matching source entry it represents. Imported quantities remain unchanged.'));
        const label = el('label', 'v2-roster-field', 'Matching source entry');
        const select = el('select');
        select.required = true;
        select.setAttribute('aria-label', `Matching source entry for ${need.rawLabel || 'imported entry'}`);
        const placeholder = el('option', '', 'Choose a matching entry…'); placeholder.value = ''; select.append(placeholder);
        candidates.forEach((candidate, index) => {
          const ids = [...(candidate.canonicalProfileIds || []), ...(candidate.canonicalEquipmentIds || [])];
          const candidateTitle = candidate.title || candidate.label || (ids.length ? ids.map(named).join(' + ') : named(candidate.id));
          const option = el('option', '', candidateTitle);
          option.value = need.kind === 'SELECTION' ? String(index) : candidate.id;
          select.append(option);
        });
        label.append(select); fieldset.append(label);
        read.push(() => {
          if (select.value === '') throw actionError('Confirm each ambiguous imported entry.');
          const candidate = need.kind === 'SELECTION' ? candidates[Number(select.value)] : candidates.find(record => record.id === select.value);
          if (!candidate) throw actionError('The chosen import candidate is unavailable.');
          if (need.kind === 'SELECTION') {
            bindings.selections ||= {};
            const {canonicalProfileIds = [], canonicalEquipmentIds = [], canonicalFieldPaths = {}} = candidate;
            bindings.selections[need.key] = {canonicalProfileIds, canonicalEquipmentIds, canonicalFieldPaths};
          } else {
            const group = {DETACHMENT: 'detachments', DATASHEET: 'units', PROFILE: 'profiles', ENHANCEMENT: 'enhancements'}[need.kind];
            if (!group) throw actionError('This imported entry cannot be clarified here. Provide a corrected New Recruit export.');
            bindings[group] ||= {};
            bindings[group][need.key] = candidate.id;
          }
        });
      }
      form.append(fieldset);
    }
    if (read.length && !blocked) {
      const submit = el('button', 'v2-reference', 'Confirm imported identities');
      submit.type = 'submit'; submit.dataset.rosterAction = 'resolve-bindings';
      form.append(submit);
      form.addEventListener('submit', event => { event.preventDefault(); run(async () => { read.forEach(readBinding => readBinding()); await resolveImport(); }); });
    }
    bindingArea.append(form);
  }
  function identityField(label, value) {
    const field = el('div');
    field.append(el('dt', '', label));
    const description = el('dd');
    if (value?.nodeType) description.append(value); else description.textContent = text(value);
    field.append(description);
    return field;
  }
  function renderSelections(selections, container) {
    if (!selections?.length) return;
    const list = el('ul', 'v2-roster-list');
    for (const selection of selections) {
      const item = el('li');
      item.dataset.selectionKey = selection.selectionKey;
      item.append(el('strong', '', `${text(selection.physicalQuantity)} selected · `));
      [...(selection.canonicalProfileIds || []), ...(selection.canonicalEquipmentIds || [])].forEach(id => item.append(reference(id)));
      for (const [id, paths] of Object.entries(selection.canonicalFieldPaths || {})) {
        const details = el('details', 'v2-roster-provenance');
        details.append(el('summary', '', `${named(id)}: selected source fields`));
        paths.forEach(path => details.append(el('p', '', path)));
        item.append(details);
      }
      list.append(item);
    }
    container.append(list);
  }
  function structuredValue(value) {
    if (!value || typeof value !== 'object') return el('span', '', text(value));
    if (Array.isArray(value)) {
      const list = el('ul', 'v2-roster-list');
      value.forEach(item => { const row = el('li'); row.append(structuredValue(item)); list.append(row); });
      return list;
    }
    const description = el('dl', 'v2-roster-structured');
    Object.entries(value).forEach(([key, child]) => {
      const field = el('div');
      const detail = el('dd'); detail.append(structuredValue(child));
      field.append(el('dt', '', key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ')), detail);
      description.append(field);
    });
    return description;
  }
  function renderEffective(instanceId, result) {
    const section = el('section');
    section.dataset.effectiveInstanceId = instanceId;
    section.append(el('h3', '', 'Roster-known effects'));
    if (result.formedUnit) {
      const formed = el('details', 'v2-roster-provenance');
      formed.dataset.formedUnit = result.formedUnit.formedUnitId;
      formed.append(el('summary', '', 'Formed unit membership'), structuredValue(result.formedUnit)); section.append(formed);
    }
    for (const [label, records] of [['Applied effects', result.applied], ['Conditional rules', result.conditional]]) {
      if (!records?.length) continue;
      section.append(el('p', 'v2-eyebrow', label));
      const list = el('ul', 'v2-roster-list');
      records.forEach(record => {
        const item = el('li');
        if (record.ruleId) item.append(reference(record.ruleId, record.label || named(record.ruleId)));
        else item.append(el('strong', '', record.label || label));
        if (record.reason) item.append(el('p', '', record.reason));
        if (record.field !== undefined && Object.hasOwn(record, 'before') && Object.hasOwn(record, 'after')) {
          const change = el('div'); change.dataset.appliedField = record.field;
          change.append(el('p', 'v2-roster-hint', record.field), structuredValue(record.before), el('span', '', ' → '), structuredValue(record.after)); item.append(change);
        }
        const provenance = record.source || record.provenance || Object.fromEntries(['clauseId', 'effectId', 'sourceInstanceId', 'targetInstanceId', 'targetModelInstanceId', 'targetProfileId', 'targetCompositionId', 'targetWeaponProfileId', 'operation', 'sourceFields', 'lifetime'].filter(key => record[key] !== undefined).map(key => [key, record[key]]));
        if (Object.keys(provenance).length) {
          const details = el('details', 'v2-roster-provenance');
          details.append(el('summary', '', 'Effect provenance'));
          for (const [key, value] of Object.entries(provenance)) {
            const line = el('p');
            line.append(el('strong', '', `${key}: `));
            if (key === 'entityId' && typeof value === 'string') line.append(reference(value)); else line.append(structuredValue(value));
            details.append(line);
          }
          item.append(details);
        }
        list.append(item);
      });
      section.append(list);
    }
    return section;
  }
  function renderRelated(instanceId) {
    const section = el('section');
    section.dataset.rosterRelatedInstanceId = instanceId;
    section.append(el('h3', '', 'Related rules'));
    const label = el('label', 'v2-roster-field', 'Filter by Detachment');
    const selectedDetachmentIds = new Set(service.state.detachmentIds);
    const select = selectRecords(service.catalog.filter(record => record.kind === 'DETACHMENT' && selectedDetachmentIds.has(record.id)), {label: 'Related rules detachment'});
    select.options[0].textContent = 'All imported Detachments';
    label.append(select);
    const results = el('ul', 'v2-roster-list v2-roster-related-list');
    const fill = () => {
      const related = service.related(instanceId, select.value || null);
      const suppliedRows = Array.isArray(related) ? related : related.rows || [];
      const state=service.state, owner=state.units.find(unit=>unit.instanceId===instanceId);
      const rows = suppliedRows.filter(row => state.detachmentIds.includes(row.detachmentId) &&
        (row.kind!=='ENHANCEMENT' || owner.enhancementIds.includes(row.ruleId)) &&
        ['MATCH','CONDITIONAL'].includes(row.applicability));
      results.replaceChildren();
      rows.forEach(row => {
        const item = el('li');
        item.dataset.ruleId = row.ruleId;
        item.dataset.applicability = row.applicability;
        item.append(reference(row.ruleId), el('span', 'v2-count', row.applicability));
        if (row.reason) item.append(el('p', '', row.reason));
        results.append(item);
      });
      if (!rows.length) results.append(el('li', '', 'No matching or conditional rules in this filter.'));
    };
    select.addEventListener('change', () => run(fill));
    section.append(label, results); fill();
    return section;
  }
  function rosterNames(state, showInstanceNumber = false) {
    const counts = new Map();
    const occurrences = new Map();
    state.units.forEach(unit => counts.set(unit.canonicalUnitId, (counts.get(unit.canonicalUnitId) || 0) + 1));
    return new Map(state.units.map(unit => {
      const number = (occurrences.get(unit.canonicalUnitId) || 0) + 1;
      occurrences.set(unit.canonicalUnitId, number);
      return [unit.instanceId, `${named(unit.canonicalUnitId)}${showInstanceNumber || counts.get(unit.canonicalUnitId) > 1 ? ` #${number}` : ''}`];
    }));
  }
  function instanceIdentity(unit) {
    const identity = el('dl', 'v2-roster-identity');
    identity.append(identityField('Starting Strength', unit.startingStrength), identityField('Warlord', unit.warlord === null || unit.warlord === undefined ? 'Unknown' : unit.warlord ? 'Yes' : 'No'));
    const enhancements = el('span');
    (unit.enhancementIds || []).forEach(id => enhancements.append(reference(id)));
    if (!unit.enhancementIds?.length) enhancements.textContent = 'None imported';
    identity.append(identityField('Enhancements on this unit', enhancements));
    return identity;
  }
  function instanceGear(unit) {
    const gear = el('section'); gear.append(el('h3', '', 'Imported composition and selected gear'));
    renderSelections(unit.selections, gear);
    for (const row of unit.modelRows || []) {
      const models = el('div', 'v2-roster-model');
      models.dataset.modelRowId = row.rowId;
      models.append(el('p', '', `${text(row.quantity)} models · ${named(row.canonicalProfileId)}`));
      renderSelections(row.selections, models);
      for (const loadout of row.loadouts || []) {
        const loadoutSection = el('div', 'v2-roster-model');
        loadoutSection.dataset.loadoutId = loadout.loadoutId;
        loadoutSection.append(el('p', '', `${text(loadout.quantity)} models with this loadout`));
        renderSelections(loadout.selections, loadoutSection); models.append(loadoutSection);
      }
      gear.append(models);
    }
    return gear;
  }
  function renderInstanceContext(instanceId) {
    const state = service.state;
    const unit = state?.units?.find(unit => unit.instanceId === instanceId);
    if (!unit) throw new Error('Unresolved physical roster unit.');
    const names = rosterNames(state, true);
    const context = el('section', 'v2-roster');
    context.dataset.rosterContextInstanceId = instanceId;
    context.append(style.cloneNode(true), instanceIdentity(unit), instanceGear(unit));
    const members = (state.attachments || []).filter(record => record.bodyguardInstanceId === instanceId);
    const assignment = (state.attachments || []).find(record => record.leaderInstanceId === instanceId);
    if (members.length || assignment) {
      const attachments = el('section'); attachments.append(el('h3', '', 'Attachments'));
      if (assignment) attachments.append(el('p', '', `Attached to ${names.get(assignment.bodyguardInstanceId)}`));
      members.forEach(member => attachments.append(el('p', '', `${member.role==='SUPPORT_EXCEPTION'?'Supported by':'Led by'} ${names.get(member.leaderInstanceId)}`)));
      context.append(attachments);
    }
    context.append(renderEffective(instanceId, service.effective(instanceId)), renderRelated(instanceId));
    return context;
  }
  function renderRoster() {
    const previousScrollY = window.scrollY;
    const activeOwner = document.activeElement?.closest('[data-roster-instance-id]')?.dataset.rosterInstanceId;
    const activeAction = document.activeElement?.dataset.rosterAction;
    rosterArea.replaceChildren();
    const state = service.state;
    if (!state?.units?.length) return;
    const summary = el('section', 'v2-card v2-roster-pane');
    summary.append(el('h2', '', 'Attachment Setup'), el('p', 'v2-roster-hint', `${state.units.length} imported unit instances. Attachments are optional; imported army selections remain unchanged.`));
    const detachments = el('ul', 'v2-roster-list');
    detachments.dataset.rosterDetachments = '';
    for (const detachment of state.detachments) {
      const item = el('li');
      item.dataset.detachmentInstanceId = detachment.instanceId;
      item.dataset.canonicalDetachmentId = detachment.canonicalDetachmentId;
      item.append(reference(detachment.canonicalDetachmentId));
      detachments.append(item);
    }
    summary.append(el('p', 'v2-eyebrow', 'Imported Detachments'), detachments,
      button('Open personal guide', () => {
        if (typeof openPersonalGuide !== 'function') throw actionError('Personal guide navigation is unavailable.');
        return openPersonalGuide();
      }, 'open-personal-guide'));
    rosterArea.append(summary);
    const names = rosterNames(state);
    const used = new Set((state.attachments || []).map(record => record.leaderInstanceId));
    const candidatesByTarget = new Map();
    for (const leader of state.units) {
      if (used.has(leader.instanceId)) continue;
      // The V2 service evaluates canonical relations and the entire formed group.
      // This view only reverses those eligible edges for Bodyguard-first setup.
      for (const target of service.candidates(leader.instanceId) || []) {
        const candidates = candidatesByTarget.get(target.instanceId) || [];
        candidates.push(leader);
        candidatesByTarget.set(target.instanceId, candidates);
      }
    }
    for (const unit of state.units) {
      const article = el('article', 'v2-card v2-roster-instance');
      article.dataset.rosterInstanceId = unit.instanceId;
      article.dataset.canonicalUnitId = unit.canonicalUnitId;
      const heading = el('header', 'v2-roster-instance-header');
      const title = el('div');
      title.append(el('h2', '', names.get(unit.instanceId)));
      heading.append(title, button('Effective datasheet', () => {
        if (typeof showInstance !== 'function') throw actionError('Physical datasheet navigation is unavailable.');
        return showInstance(unit.instanceId);
      }, 'show-instance'));
      const body = el('div', 'v2-roster-body');
      const assignment = (state.attachments || []).find(record => record.leaderInstanceId === unit.instanceId);
      if (assignment) body.append(el('p', 'v2-roster-hint', `Attached to ${names.get(assignment.bodyguardInstanceId)}`));
      const members = (state.attachments || []).filter(record => record.bodyguardInstanceId === unit.instanceId);
      const candidates = candidatesByTarget.get(unit.instanceId) || [];
      if (members.length || candidates.length) {
        const attachments = el('section');
        attachments.dataset.attachmentTargetInstanceId = unit.instanceId;
        attachments.append(el('h3', '', 'Characters / Support'));
        for (const member of members) {
          const row = el('div', 'v2-roster-tools');
          row.dataset.attachedLeaderInstanceId = member.leaderInstanceId;
          const detach = button('Detach', async () => {
            checkResult(await service.detach(member.leaderInstanceId)); renderRoster(); saveAndReport('Character / Support detached.');
          }, 'detach');
          detach.dataset.leaderInstanceId = member.leaderInstanceId;
          row.append(el('span', '', `${member.role==='SUPPORT_EXCEPTION'?'Supported by':'Led by'} ${names.get(member.leaderInstanceId)}`), detach);
          attachments.append(row);
        }
        if (candidates.length) {
          const controls = el('div');
          const label = el('label', 'v2-roster-field', 'Eligible imported Character / Support');
          const select = selectRecords(candidates.map(candidate => ({id: candidate.instanceId, title: names.get(candidate.instanceId)})), {label: `Add Character / Support to ${names.get(unit.instanceId)}`});
          select.dataset.attachmentCandidateFor = unit.instanceId;
          label.append(select);
          controls.append(label, button('+ Add Character / Support', async () => {
            if (!select.value) throw actionError('Choose an eligible imported Character / Support.');
            checkResult(await service.attach(select.value, unit.instanceId)); renderRoster(); saveAndReport('Character / Support attached.');
          }, 'attach'));
          attachments.append(controls);
        }
        body.append(attachments);
      }
      article.append(heading, instanceIdentity(unit), body); rosterArea.append(article);
    }
    if (activeOwner) {
      const article = [...rosterArea.querySelectorAll('[data-roster-instance-id]')].find(node => node.dataset.rosterInstanceId === activeOwner);
      const preferredAction = activeAction === 'attach' ? 'detach' : activeAction === 'detach' ? 'attach' : activeAction;
      (article?.querySelector(`[data-roster-action="${preferredAction}"]`) || article?.querySelector('button'))?.focus({preventScroll: true});
      window.scrollTo({top: previousScrollY, behavior: 'instant'});
    }
  }
  function render(container) { container.replaceChildren(section); return section; }
  const ready = run(async () => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) await restoreSaved(); else renderRoster();
    } catch (error) { renderRoster(); throw error; }
  });
  raw.addEventListener('input', () => {
    bindings = {}; importResult = null; bindingArea.replaceChildren(); draftArea.replaceChildren();
    setStatus('Import this export to resolve its selected entries automatically.');
  });
  return Object.freeze({render, refresh: renderRoster, renderInstanceContext, ready, storageKey});
}
