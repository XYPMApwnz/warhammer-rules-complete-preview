/** Optional roster view. The injected service owns every identity, fact and effect. */
export function createRosterPanel(document, {service, bookId, open, showDetail, titleForId}) {
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
  const named = id => catalog.get(id)?.title || titleForId(id) || id;
  const button = (label, action, actionId) => {
    const node = el('button', 'v2-reference', label);
    node.type = 'button';
    if (actionId) node.dataset.rosterAction = actionId;
    node.addEventListener('click', () => run(action));
    return node;
  };
  const reference = (id, label = named(id), reader = false) => {
    const link = el('a', 'v2-reference', label);
    link.href = `#${encodeURIComponent(id)}`;
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
    .v2-roster { display:grid; gap:20px; min-width:0; }
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
    .v2-roster-status { margin:0; padding:12px 16px; border-radius:8px; background:#edf3e3; font-size:13px; overflow-wrap:anywhere; }
    .v2-roster-error { background:#fff0db; color:#70480e; }
    .v2-roster-bindings { display:grid; gap:13px; margin-top:18px; }
    .v2-roster-bindings fieldset { margin:0; border:1px solid var(--v2-line); padding:14px; border-radius:9px; min-width:0; }
    .v2-roster-bindings legend { padding:0 6px; font-size:13px; font-weight:700; overflow-wrap:anywhere; }
    .v2-roster-hint { color:var(--v2-muted); font-size:12px; margin:7px 0; }
    .v2-roster-instance { margin:0; }
    .v2-roster-instance-header { padding:22px 24px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; border-bottom:1px solid var(--v2-line); }
    .v2-roster-instance-header h2 { margin:4px 0 0; }
    .v2-roster-instance-header > a { margin-left:auto; }
    .v2-roster-identity { padding:16px 24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; background:#f5f7ec; }
    .v2-roster-identity dt { font-size:10px; color:var(--v2-muted); font-weight:700; margin-bottom:5px; }
    .v2-roster-identity dd { margin:0; font-size:13px; line-height:1.6; }
    .v2-roster-body { padding:22px 24px; display:grid; gap:22px; }
    .v2-roster-model { border-left:3px solid #c8d6ac; padding-left:13px; margin:13px 0; }
    .v2-roster-list { padding:0; margin:10px 0; list-style:none; display:grid; gap:9px; }
    .v2-roster-list li { padding:10px 12px; border:1px solid var(--v2-line); border-radius:7px; min-width:0; overflow-wrap:anywhere; font-size:12px; line-height:1.7; }
    .v2-roster-list .v2-reference { margin:3px 5px 3px 0; }
    .v2-roster-profile { background:#f6f8ee; border:1px solid var(--v2-line); padding:15px; border-radius:9px; margin:10px 0; }
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
  heading.append(el('h1', '', 'Roster'), button('Library', () => open(null), 'library'));
  const status = el('p', 'v2-roster-status', 'Import a New Recruit text export to view physical units and their effective rules.');
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
  importActions.append(button('Review import', reviewImport, 'review-import'));
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
  function checkResult(result) {
    if (result === false || result?.status === 'INVALID' || result?.errors?.length) {
      throw new Error(result?.errors?.map(error => error.message || error.code || String(error)).join(' ') || 'Roster state could not be validated.');
    }
    return result;
  }
  async function run(action) {
    if (busy) return;
    busy = true;
    section.setAttribute('aria-busy', 'true');
    section.classList.add('v2-roster-loading');
    try { await action(); }
    catch (error) { setStatus(error.message || String(error), true); }
    finally { busy = false; section.removeAttribute('aria-busy'); section.classList.remove('v2-roster-loading'); }
  }
  function persist() {
    try { window.localStorage.setItem(storageKey, JSON.stringify(service.snapshot())); return null; }
    catch (error) { return error; }
  }
  function saveAndReport(message) {
    const error = persist();
    setStatus(error ? `${message} This browser could not save the roster: ${error.message}` : message, Boolean(error));
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
      const item = el('li', '', `${unit.name} · ${text(unit.rawQuantity)} imported quantity · ${unit.id}`);
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
      saveAndReport('Roster imported. Physical unit ownership and selected quantities are preserved.');
    } else {
      renderBindings(importResult.needsBindings || []);
      const errors = (importResult.errors || []).map(error => error.message || error.code).join(' ');
      setStatus(errors || 'Choose the canonical entries for the imported labels below.', importResult.status === 'INVALID');
    }
  }
  function selectRecords(records, {multiple = false, value = '', label} = {}) {
    const select = el('select');
    select.multiple = multiple;
    select.setAttribute('aria-label', label);
    if (!multiple) { const placeholder = el('option', '', 'Choose an entry…'); placeholder.value = ''; select.append(placeholder); }
    records.forEach(record => {
      const option = el('option', '', `${record.title} · ${record.id}`);
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
    for (const need of needs) {
      const fieldset = el('fieldset');
      fieldset.dataset.bindingKind = need.kind;
      fieldset.dataset.bindingKey = need.key;
      fieldset.append(el('legend', '', need.rawLabel || need.key), el('p', 'v2-roster-hint', `Imported entry: ${need.key}`), el('p', 'v2-roster-hint', need.kind === 'SELECTION_QUANTITY' ? 'Enter the total physical quantity selected in this unit.' : `Bind this imported ${need.kind.toLowerCase().replaceAll('_', ' ')} using a canonical entry.`));
      if (need.kind === 'SELECTION_QUANTITY') {
        const label = el('label', 'v2-roster-field', 'Physical quantity');
        const input = el('input');
        input.type = 'number'; input.min = '0'; input.step = '1'; input.required = true;
        input.setAttribute('aria-label', 'Physical quantity');
        const existing = bindings.selections?.[need.key]?.physicalQuantity;
        if (existing !== undefined) input.value = String(existing);
        label.append(input); fieldset.append(label);
        read.push(() => {
          const value = Number(input.value);
          if (input.value === '' || !Number.isSafeInteger(value) || value < 0) throw new Error('Enter a nonnegative whole physical quantity.');
          bindings.selections ||= {};
          bindings.selections[need.key] = {...bindings.selections[need.key], physicalQuantity: value};
        });
      } else if (need.kind === 'SELECTION_FIELD') {
        const record = catalog.get(need.ownerId);
        const fields = record?.fields || record?.fieldPaths || [];
        const selectedPaths = bindings.selections?.[need.key]?.canonicalFieldPaths?.[need.ownerId] || [];
        const inputs = [];
        fields.forEach(field => {
          const path = typeof field === 'string' ? field : field.path;
          const label = el('label', 'v2-roster-field');
          const input = el('input'); input.type = 'checkbox'; input.value = path; input.checked = selectedPaths.includes(path);
          label.append(input, el('span', '', typeof field === 'string' ? field : `${field.label || path}${field.value === undefined ? '' : ': ' + text(field.value)}`));
          fieldset.append(label); inputs.push(input);
        });
        if (!fields.length) fieldset.append(el('p', 'v2-roster-hint', 'The service did not supply canonical field paths for this equipment fact.'));
        read.push(() => {
          const paths = inputs.filter(input => input.checked).map(input => input.value);
          if (!paths.length) throw new Error('Choose the exact canonical source fields for this equipment selection.');
          bindings.selections ||= {};
          const existing = bindings.selections[need.key] || {};
          bindings.selections[need.key] = {...existing, canonicalFieldPaths: {...existing.canonicalFieldPaths, [need.ownerId]: paths}};
        });
      } else if (need.kind === 'SELECTION') {
        const existing = bindings.selections?.[need.key] || {};
        const records = service.catalog.filter(record => record.parentId === need.ownerId);
        const weaponLabel = el('label', 'v2-roster-field', 'Weapon profiles (choose every applicable alternate)');
        const weapons = selectRecords(records.filter(record => record.kind === 'WEAPON_PROFILE'), {multiple: true, value: existing.canonicalProfileIds, label: 'Canonical weapon profiles'});
        weaponLabel.append(weapons);
        const equipmentLabel = el('label', 'v2-roster-field', 'Equipment facts');
        const equipment = selectRecords(records.filter(record => ['WARGEAR_OPTION', 'WARGEAR_FOOTNOTE', 'DATASHEET_SECTION', 'SUPPLEMENTAL_DATASHEET_RULE'].includes(record.kind)), {multiple: true, value: existing.canonicalEquipmentIds, label: 'Canonical equipment facts'});
        equipmentLabel.append(equipment);
        const pathsArea = el('div');
        const pathInputs = new Map();
        const renderPaths = () => {
          pathsArea.replaceChildren();
          pathInputs.clear();
          [...equipment.selectedOptions].forEach(option => {
            const record = catalog.get(option.value);
            const paths = record.fields || record.fieldPaths || [];
            if (!paths.length) {
              pathsArea.append(el('p', 'v2-roster-hint', `${record.title}: no selectable source field paths were supplied. The service will validate this equipment binding.`));
              return;
            }
            const list = el('fieldset');
            list.append(el('legend', '', `${record.title}: source fields`));
            const inputs = [];
            paths.forEach(field => {
              const path = typeof field === 'string' ? field : field.path;
              const label = el('label', 'v2-roster-field');
              const input = el('input'); input.type = 'checkbox'; input.value = path;
              input.checked = (existing.canonicalFieldPaths?.[record.id] || []).includes(path);
              label.append(input, el('span', '', typeof field === 'string' ? field : `${field.label || field.path}${field.value === undefined ? '' : ': ' + text(field.value)}`));
              list.append(label); inputs.push(input);
            });
            pathInputs.set(record.id, inputs); pathsArea.append(list);
          });
        };
        equipment.addEventListener('change', renderPaths);
        renderPaths();
        fieldset.append(weaponLabel, equipmentLabel, pathsArea, el('p', 'v2-roster-hint', 'Select profiles, equipment, or both. On a phone, tap the entries in each list to select them.'));
        read.push(() => {
          const canonicalProfileIds = [...weapons.selectedOptions].map(option => option.value);
          const canonicalEquipmentIds = [...equipment.selectedOptions].map(option => option.value);
          if (!canonicalProfileIds.length && !canonicalEquipmentIds.length) throw new Error('Bind each selection to at least one canonical profile or equipment fact.');
          const canonicalFieldPaths = {};
          for (const [id, inputs] of pathInputs) { const selected = inputs.filter(input => input.checked).map(input => input.value); if (selected.length) canonicalFieldPaths[id] = selected; }
          bindings.selections ||= {};
          bindings.selections[need.key] = {...existing, canonicalProfileIds, canonicalEquipmentIds, canonicalFieldPaths};
        });
      } else {
        const records = service.catalog.filter(record => record.kind === need.kind && (!need.ownerId || record.parentId === need.ownerId));
        const group = {DATASHEET: 'units', PROFILE: 'profiles', ENHANCEMENT: 'enhancements'}[need.kind];
        const value = need.kind === 'DETACHMENT' ? bindings.detachmentId || '' : bindings[group]?.[need.key] || '';
        const label = el('label', 'v2-roster-field', 'Canonical entry');
        const select = selectRecords(records, {value, label: `Canonical entry for ${need.rawLabel || need.key}`});
        select.required = true;
        label.append(select); fieldset.append(label);
        if (!records.length) fieldset.append(el('p', 'v2-roster-hint', 'No canonical candidates were supplied for this owner and kind.'));
        read.push(() => {
          if (!select.value) throw new Error('Choose a canonical entry for every imported label.');
          if (need.kind === 'DETACHMENT') bindings.detachmentId = select.value;
          else if (group) { bindings[group] ||= {}; bindings[group][need.key] = select.value; }
          else throw new Error(`Unsupported binding kind: ${need.kind}`);
        });
      }
      form.append(fieldset);
    }
    const submit = el('button', 'v2-reference', 'Resolve bindings');
    submit.type = 'submit'; submit.dataset.rosterAction = 'resolve-bindings';
    form.append(submit);
    form.addEventListener('submit', event => { event.preventDefault(); run(async () => { read.forEach(readBinding => readBinding()); await resolveImport(); }); });
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
    section.append(el('h3', '', 'Effective rules'));
    for (const [label, records] of [['Model profiles', result.profiles], ['Selected weapons', result.weapons]]) {
      if (!records?.length) continue;
      section.append(el('p', 'v2-eyebrow', label));
      for (const record of records) {
        const card = el('div', 'v2-roster-profile');
        card.dataset.effectiveId = record.id;
        if (record.modelInstanceId) card.dataset.modelInstanceId = record.modelInstanceId;
        if (record.ownerInstanceId) card.dataset.ownerInstanceId = record.ownerInstanceId;
        card.append(el('h3', '', record.title || named(record.id)));
        const stats = el('dl');
        for (const field of record.fields || []) {
          const cell = el('div');
          const value = el('dd'); value.append(structuredValue(field.value));
          value.dataset.effectiveField = field.label;
          if (field.source?.entityId) value.dataset.sourceEntityId = field.source.entityId;
          cell.append(el('dt', '', field.label), value); stats.append(cell);
        }
        card.append(stats);
        if (record.physicalQuantity !== undefined) card.append(el('p', 'v2-roster-hint', `${record.physicalQuantity} selected in this physical scope`));
        if (record.metrics && Object.keys(record.metrics).length) {
          const metrics = el('section'); metrics.dataset.effectiveMetrics = '';
          metrics.append(el('p', 'v2-eyebrow', 'Effective rule metrics'), structuredValue(record.metrics)); card.append(metrics);
        }
        if (record.abilities?.length) {
          const abilities = el('section'); abilities.dataset.effectiveModelAbilities = '';
          abilities.append(el('p', 'v2-eyebrow', 'Model abilities'), structuredValue(record.abilities)); card.append(abilities);
        }
        section.append(card);
      }
    }
    for (const [label, values, kind] of [['Intrinsic keywords of this physical unit', result.intrinsicKeywords, 'MODEL'], ['Formed unit keywords', result.keywords, 'UNIT']]) {
      if (!values?.length) continue;
      section.append(el('p', 'v2-eyebrow', label));
      const keywords = el('p'); keywords.dataset.keywordSubject = kind;
      values.forEach(keyword => keywords.append(el('span', 'v2-reference', typeof keyword === 'string' ? keyword : text(keyword.value ?? keyword.label))));
      section.append(keywords);
    }
    if (result.formedUnit) {
      const formed = el('details', 'v2-roster-provenance');
      formed.dataset.formedUnit = result.formedUnit.formedUnitId;
      formed.append(el('summary', '', 'Formed unit membership'), structuredValue(result.formedUnit)); section.append(formed);
    }
    if (result.abilities?.length) {
      section.append(el('p', 'v2-eyebrow', 'Effective abilities'));
      const abilities = el('ul', 'v2-roster-list');
      result.abilities.forEach(ability => {
        const item = el('li');
        if (ability.id) { item.dataset.effectiveAbilityId = ability.id; item.append(reference(ability.id, ability.title || named(ability.id))); }
        else if (ability.title) item.append(el('strong', '', ability.title));
        if (ability.text !== undefined) item.append(structuredValue(ability.text));
        abilities.append(item);
      });
      section.append(abilities);
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
        const provenance = record.source || record.provenance || Object.fromEntries(['clauseId', 'effectId', 'sourceInstanceId', 'targetInstanceId', 'targetModelInstanceId', 'targetWeaponProfileId', 'operation', 'sourceFields', 'lifetime'].filter(key => record[key] !== undefined).map(key => [key, record[key]]));
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
    const select = selectRecords(service.catalog.filter(record => record.kind === 'DETACHMENT'), {label: 'Related rules detachment'});
    select.options[0].textContent = 'All Detachments';
    label.append(select);
    const results = el('ul', 'v2-roster-list v2-roster-related-list');
    const fill = () => {
      const related = service.related(instanceId, select.value || null);
      const suppliedRows = Array.isArray(related) ? related : related.rows || [];
      const rows = suppliedRows.filter(row => !['NO_MATCH', 'INVALID'].includes(row.applicability) && !['FALSE', 'INVALID'].includes(row.state));
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
  function renderRoster() {
    const previousScrollY = window.scrollY;
    const activeOwner = document.activeElement?.closest('[data-roster-instance-id]')?.dataset.rosterInstanceId;
    const activeAction = document.activeElement?.dataset.rosterAction;
    rosterArea.replaceChildren();
    const state = service.state;
    if (!state?.units?.length) return;
    const summary = el('section', 'v2-card v2-roster-pane');
    summary.append(el('h2', '', 'Physical units'), el('p', 'v2-roster-hint', `${state.units.length} imported entries · ${named(state.detachmentId)}`));
    rosterArea.append(summary);
    const byInstance = new Map(state.units.map(unit => [unit.instanceId, unit]));
    const instanceName = id => { const unit = byInstance.get(id); return unit ? `${named(unit.canonicalUnitId)} · ${unit.instanceId}` : id; };
    for (const unit of state.units) {
      const article = el('article', 'v2-card v2-roster-instance');
      article.dataset.rosterInstanceId = unit.instanceId;
      article.dataset.canonicalUnitId = unit.canonicalUnitId;
      const heading = el('header', 'v2-roster-instance-header');
      const title = el('div');
      title.append(el('span', 'v2-eyebrow', unit.instanceId), el('h2', '', named(unit.canonicalUnitId)));
      heading.append(title, reference(unit.canonicalUnitId, 'Datasheet', true));
      const identity = el('dl', 'v2-roster-identity');
      identity.append(identityField('Starting Strength', unit.startingStrength), identityField('Warlord', unit.warlord === null || unit.warlord === undefined ? 'Unknown' : unit.warlord ? 'Yes' : 'No'));
      const enhancements = el('span');
      (unit.enhancementIds || []).forEach(id => enhancements.append(reference(id)));
      if (!unit.enhancementIds?.length) enhancements.textContent = 'None imported';
      identity.append(identityField('Enhancements on this unit', enhancements));
      const body = el('div', 'v2-roster-body');
      const gear = el('section'); gear.append(el('h3', '', 'Imported models and selected gear'));
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
      body.append(gear);
      const attachment = (state.attachments || []).find(record => record.leaderInstanceId === unit.instanceId);
      const candidates = service.candidates(unit.instanceId);
      if (attachment || candidates?.length) {
        const attach = el('section'); attach.append(el('h3', '', 'Attachment'));
        if (attachment) {
          attach.append(el('p', '', `Attached to ${instanceName(attachment.bodyguardInstanceId)}`), button('Detach', async () => { checkResult(await service.detach(unit.instanceId)); renderRoster(); saveAndReport('Character detached.'); }, 'detach'));
        } else {
          const label = el('label', 'v2-roster-field', 'Eligible Bodyguard unit');
          const select = selectRecords(candidates.map(candidate => ({id: candidate.instanceId, title: candidate.title || instanceName(candidate.instanceId)})), {label: `Attach ${instanceName(unit.instanceId)} to a Bodyguard`});
          label.append(select);
          attach.append(label, button('Attach', async () => { if (!select.value) throw new Error('Choose an eligible physical Bodyguard unit.'); checkResult(await service.attach(unit.instanceId, select.value)); renderRoster(); saveAndReport('Character attached.'); }, 'attach'));
        }
        body.append(attach);
      }
      body.append(renderEffective(unit.instanceId, service.effective(unit.instanceId)), renderRelated(unit.instanceId));
      article.append(heading, identity, body); rosterArea.append(article);
    }
    if (activeOwner) {
      const article = [...rosterArea.querySelectorAll('[data-roster-instance-id]')].find(node => node.dataset.rosterInstanceId === activeOwner);
      const preferredAction = activeAction === 'attach' ? 'detach' : activeAction === 'detach' ? 'attach' : activeAction;
      (article?.querySelector(`[data-roster-action="${preferredAction}"]`) || article?.querySelector('a'))?.focus({preventScroll: true});
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
    setStatus('Review this export to generate explicit canonical bindings.');
  });
  return Object.freeze({render, refresh: renderRoster, ready, storageKey});
}
