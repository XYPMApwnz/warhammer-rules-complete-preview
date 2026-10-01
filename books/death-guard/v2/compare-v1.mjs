import {resolveOwnedFact} from './mfm-boundary.mjs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';

/** V1 is a comparison target only. It cannot supply V2 facts or resolve gaps. */
const normalized = value => String(value ?? '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[‐‑‒–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
const sorted = values => [...values].map(normalized).sort();
const titleWithoutPrice = value => String(value || '').replace(/\s+[-–—]\s+\d+\s*(pts|CP)$/i, '');
const displayText = block => block.title ? `${block.title}: ${block.text || ''}` : block.text || '';

export async function loadV1ComparisonModel(root) {
  const [{createCanonicalBuildContext}, {buildCanonicalBook}] = await Promise.all([
    import(pathToFileURL(path.join(root, 'books/shared/tools/canonical-build-contract.mjs')).href),
    import(pathToFileURL(path.join(root, 'books/shared/tools/build-army-book.mjs')).href)
  ]);
  const context = createCanonicalBuildContext({repo: root, configPath: path.join(root, 'books/death-guard/book.config.json'), args: ['--check']});
  const projection = await buildCanonicalBook(context, {projectionOnly: true});
  return projection.effectiveBookModel;
}

export function compareV1Facts(model, v1Content, {bindings = PINNED_V1_BINDINGS, v1EffectiveModel} = {}) {
  if (!['dg-v2-canonical/v1', 'dg-v2-effective/v1'].includes(model?.schema) || !Array.isArray(v1Content?.sections)) throw new Error('Invalid V2/V1 comparison input');
  const entities = new Map(model.entities.map(entity => [entity.id, entity])), sections = new Map(v1Content.sections.map(section => [section.id, section]));
  const facts = [], unresolved = [];
  const domainCoverage = {};
  const record = (entity, domain, field, v2, v1, explanation) => {
    let status = v1 === undefined ? 'MISSING_V1' : JSON.stringify(v2) === JSON.stringify(v1) ? 'EXACT' : normalized(v2) === normalized(v1) ? 'NORMALIZED_EQUAL' : 'DIFFERENT';
    const overlays = (model.appliedOverlays || []).filter(operation => operation.operation !== 'QUALIFY' && JSON.stringify(operation.baseValue) !== JSON.stringify(operation.effectiveValue) && operation.targetId === entity.id && (JSON.stringify(operation.field) === JSON.stringify(field) || field[0] === 'blocks' && operation.field[0] === 'blocks'));
    const overlay = overlays[0];
    const declared = REPRESENTATION_ADJUDICATIONS[`${entity.id}|${field.join('/')}`];
    let overlayExplainsEntireDifference = false;
    if (overlay) {
      let baseline = overlay.baseValue;
      if (field[0] === 'blocks') {
        const baseBlocks = structuredClone(entity.data.blocks);
        for (const operation of overlays) {
          let host = baseBlocks;
          for (const part of operation.field.slice(1, -1)) host = host?.[part];
          if (host && operation.field.length > 1) host[operation.field.at(-1)] = structuredClone(operation.baseValue);
        }
        baseline = baseBlocks.map(block => block.text).join('\n');
      }
      overlayExplainsEntireDifference = JSON.stringify(baseline) === JSON.stringify(v1) || normalized(baseline) === normalized(v1) || !!declared && JSON.stringify(baseline) === JSON.stringify(declared.sourceValue) && JSON.stringify(v1) === JSON.stringify(declared.v1Value);
    }
    let classification = status === 'EXACT' ? 'UNCHANGED' : status === 'NORMALIZED_EQUAL' ? 'REPRESENTATION_ONLY' : 'UNRESOLVED_SOURCE_CONFLICT', proof;
    if (status === 'DIFFERENT' && declared && [declared.sourceValue, ...(declared.alternativeSourceValues || [])].some(value => JSON.stringify(v2) === JSON.stringify(value)) && JSON.stringify(v1) === JSON.stringify(declared.v1Value)) {classification = declared.classification; proof = declared.proof;}
    else if (status === 'DIFFERENT' && overlayExplainsEntireDifference) {classification = 'EXPECTED_CURRENT_GW_UPDATE'; proof = {sourceId: overlay.sourceId, operationId: overlay.id, provenance: overlay.provenance, reason: 'The complete V1 difference is accounted for by the accepted before/after field values; unrelated fields cannot inherit this classification'};}
    else if (status === 'DIFFERENT' && (['PROFILE', 'WEAPON_PROFILE'].includes(domain) || domain.startsWith('MFM_') || domain === 'LEADER_SUPPORT_RELATIONS')) {classification = 'V1_DEFECT'; proof = {sourceId: entity.provenance.sourceId, pointer: entity.provenance.pointer, reason: 'Accepted source characteristic, weapon or centrally owned MFM field differs from the explicit persistent V1 target'};}
    else if (status === 'MISSING_V1') {proof = {sourceId: entity.provenance.sourceId, pointer: entity.provenance.pointer, reason: 'Missing target or comparison binding requires explicit source adjudication; absence alone is not classified as a V1 defect'};}
    facts.push({entityId: entity.id, sourceRecordId: entity.provenance.sourceRecordId, sourceId: entity.provenance.sourceId, domain, field, sourcePointer: entity.provenance.pointer, v2, ...(v1 === undefined ? {} : {v1}), status, classification, ...(proof ? {proof} : {}), ...(explanation ? {explanation} : {})});
  };
  const owner = entity => sections.get(entity.parentId || entity.id);
  const block = (section, id) => section?.subsections?.flatMap(part => part.blocks || []).find(item => item.id === id);
  const subSection = (entity, id) => owner(entity)?.subsections?.find(part => part.id === id);
  const profileFields = {M: 'M', T: 'T', SV: 'Sv', W: 'W', LD: 'Ld', OC: 'OC', INSV: 'Inv'};
  for (const entity of model.entities) {
    const {kind, data} = entity, sid = entity.provenance.sourceRecordId;
    if (kind === 'DATASHEET') {
      const unit = sections.get(bindings.units[sid]);
      record(entity, kind, ['title'], data.title, unit?.title);
      const keywordsSection = unit?.subsections?.find(part => part.id === `${unit.id.replace(/^unit-/, '')}-keywords`), text = keywordsSection?.blocks?.map(item => item.text || '').join('\n') || '';
      const match = text.match(/Keywords:\s*(.*?)\.\s*Faction Keywords:\s*([^.]*)\./i);
      record(entity, 'KEYWORDS', ['keywords'], sorted(data.keywords), match ? sorted(match[1].split(',')) : undefined);
      record(entity, 'FACTION_KEYWORDS', ['factionKeywords'], sorted(data.factionKeywords), match ? sorted(match[2].split(',')) : undefined);
    } else if (kind === 'PROFILE') {
      const stats = owner(entity)?.blocks?.find(item => item.type === 'statline')?.values;
      for (const [key, value] of Object.entries(data)) record(entity, kind, [key], value, stats?.[profileFields[key]]);
      for (const [v2Key, v1Key] of Object.entries(profileFields)) if (!Object.hasOwn(data, v2Key) && stats && Object.hasOwn(stats, v1Key)) record(entity, kind, [v2Key], undefined, stats[v1Key], 'V1 characteristic absent in accepted V2 source');
    } else if (kind === 'WEAPON_PROFILE') {
      const weapon = owner(entity)?.blocks?.find(item => item.id === bindings.weapons[sid]);
      for (const [sourceKey, v1Key] of Object.entries({name: 'name', mode: 'mode', range: 'range', attacks: 'a', skill: 'skill', strength: 's', ap: 'ap', damage: 'd'})) record(entity, kind, [sourceKey], data[sourceKey], weapon?.[v1Key]);
      record(entity, kind, ['abilities'], sorted(data.abilities), weapon ? sorted(String(weapon.abilities || '').split(',').filter(value => value.trim() && value.trim() !== '-')) : undefined);
    } else if (kind === 'DATASHEET_SECTION') {
      const sectionId = bindings.sections[sid], section = subSection(entity, sectionId);
      let v1Blocks = section?.blocks;
      if (data.title === 'ABILITIES') v1Blocks = v1Blocks?.filter(item => !['CORE', 'FACTION'].includes(item.title));
      if (bindings.sectionBlocks?.[sid]) v1Blocks = owner(entity)?.subsections?.flatMap(part => part.blocks || []).filter(item => bindings.sectionBlocks[sid].includes(item.id));
      const v1Text = data.title === 'LORD OF THE DEATH GUARD' ? v1Blocks?.flatMap(item => item.choices || []).map(displayText).join('\n') : v1Blocks?.map(item => data.title === 'ABILITIES' ? displayText(item) : item.text || '').join('\n');
      record(entity, kind, ['blocks', 'text'], data.blocks.map(item => item.text).join('\n'), v1Text, 'Text comparison retains conditions and numerals; differences need source adjudication');
    } else if (kind === 'WARGEAR_OPTION') {
      const unit = owner(entity), part = unit?.subsections?.find(item => item.id === bindings.wargearSections?.[unit?.id]);
      record(entity, kind, ['text'], data.text, part?.blocks?.[data.order - 1]?.text, 'Pinned source option order selects a comparison row, never authoritative identity');
    } else if (kind === 'RULE_REFERENCE') {
      const unit = owner(entity), abilities = unit?.subsections?.find(item => item.id === bindings.abilitySections?.[unit?.id])?.blocks;
      const core = abilities?.find(item => item.title === 'CORE')?.text || '', faction = abilities?.find(item => item.title === 'FACTION')?.text || '';
      record(entity, kind, ['label'], data.label, abilities ? `${core ? `CORE ABILITIES${core}` : ''}${faction ? `ARMY RULES${faction}` : ''}` : undefined);
    } else if (kind === 'SUPPLEMENTAL_DATASHEET_RULE' || kind === 'WARGEAR_FOOTNOTE') {
      const target = bindings.rawFacts?.[sid], targetPart = owner(entity)?.subsections?.find(part => part.id === target?.sectionId);
      const targetBlock = target?.blockId ? block(owner(entity), target.blockId) : targetPart?.blocks?.[target?.blockIndex];
      const text = target?.footnote ? targetBlock?.text?.match(/That Helbrute fist cannot then be replaced\./)?.[0] : targetBlock ? displayText(targetBlock) : undefined;
      record(entity, kind, ['text'], data.text, text);
    } else if (kind === 'DETACHMENT') {
      record(entity, kind, ['title'], data.title, sections.get(entity.id)?.title);
    } else if (kind === 'DETACHMENT_RULE') {
      const rule = block(sections.get(entity.parentId), bindings.rules[sid]);
      record(entity, kind, ['title'], data.title, rule?.title);
      record(entity, kind, ['text'], data.text, rule?.text);
      if (data.tables?.length) {
        const tables = sections.get(entity.parentId)?.subsections?.flatMap(part => part.blocks || []).filter(item => item.type === 'table');
        record(entity, kind, ['tables'], data.tables, tables);
      }
    } else if (kind === 'ENHANCEMENT') {
      const enhancement = block(sections.get(entity.parentId), bindings.enhancements[sid]);
      record(entity, kind, ['title'], data.title, enhancement ? titleWithoutPrice(enhancement.title) : undefined);
      record(entity, kind, ['text'], data.text, enhancement?.text);
    } else if (kind === 'STRATAGEM') {
      const stratagem = block(sections.get(entity.parentId), bindings.stratagems[sid]);
      record(entity, kind, ['title'], data.title, stratagem ? titleWithoutPrice(stratagem.title) : undefined);
      record(entity, kind, ['cp'], data.cp, stratagem?.title?.match(/(\d+\s*CP)$/i)?.[1]);
      record(entity, kind, ['category'], data.category, stratagem?.category);
      for (const [i, line] of data.lines.entries()) {
        const value = stratagem?.lines?.find(value => value.startsWith(`${line.label}:`));
        record(entity, kind, ['lines', i, 'text'], line.text, value?.slice(line.label.length + 1).trim());
      }
    } else if (kind === 'ARMY_RULE_COMPONENT') {
      const army = sections.get('army-rule-nurgles-gift'), section = army?.subsections?.find(part => part.id === bindings.armyComponents[sid]);
      if (sid === 'army-rule-nurgles-gift:contagion-range') {
        record(entity, kind, ['text'], data.text, army?.blocks?.filter(item => item.type === 'p').map(item => item.text).join('\n'));
        if (data.table) record(entity, kind, ['table'], data.table.map(row => Array.isArray(row) ? row : [row.battleRound, row.range]), army?.blocks?.find(item => item.type === 'table')?.rows);
      } else record(entity, kind, ['text'], data.text, section?.blocks?.map(item => item.text || '').join('\n'));
    } else if (kind === 'ARMY_RULE') {
      if (data.text !== undefined) record(entity, kind, ['text'], data.text, sections.get('army-rule-nurgles-gift')?.subsections?.find(part => part.id === bindings.armyComponents[entity.id])?.blocks?.map(item => item.text || '').join('\n'));
    } else if (kind === 'SOURCE_ERRATUM') {
      const binding = ERRATA_COMPARISON_BINDINGS[entity.id], update = v1EffectiveModel?.sourceMetadata?.officialUpdates?.updates?.find(update => update.id === binding?.updateId), target = update?.targets?.find(target => target.owner === binding.owner);
      const effectiveText = data.text.replace(/^(?:Change to:|Add)\s*/i, '').replace(/^['‘"]|['’"]$/g, '');
      record(entity, kind, ['effectiveText'], effectiveText, target?.effectiveAfter, 'Explicit comparison-only Waha instruction to persistent V1 official ledger target binding');
      const fact = facts.at(-1);
      if (fact.status === 'DIFFERENT' && normalized(effectiveText.replace(/^•\s*/gm, '')) === normalized(target?.effectiveAfter)) {fact.classification = 'REPRESENTATION_ONLY'; fact.proof = {sourceId: entity.provenance.sourceId, sourcePointer: entity.provenance.pointer, updateId: binding.updateId, reason: 'Errata bullet markers and inline presentation differ; complete effective wording and numerals are preserved'};}
    }
  }
  const sourceUnitIds = new Set(model.entities.filter(entity => entity.kind === 'DATASHEET').map(entity => entity.id));
  for (const unit of v1Content.sections.filter(section => section.kind === 'unit')) if (!sourceUnitIds.has(unit.id)) unresolved.push({classification: 'V1_EXTRA_UNIT', canonicalId: unit.id});
  const inventory = [];
  const checkInventory = (domain, expected, actual) => {
    const sourceIds = new Set(expected), targetIds = new Set(actual);
    const missing = [...sourceIds].filter(id => !targetIds.has(id)), extra = [...targetIds].filter(id => !sourceIds.has(id));
    inventory.push({domain, sourceIds: [...sourceIds].sort(), v1Ids: [...targetIds].sort(), missing, extra});
    for (const id of missing) unresolved.push({classification: 'MISSING_V1_ENTITY', domain, id});
    for (const id of extra) unresolved.push({classification: 'V1_EXTRA_ENTITY', domain, id});
  };
  checkInventory('DATASHEET', [...sourceUnitIds], v1Content.sections.filter(section => section.kind === 'unit').map(section => section.id));
  checkInventory('WEAPON_PROFILE', model.entities.filter(entity => entity.kind === 'WEAPON_PROFILE').map(entity => bindings.weapons[entity.provenance.sourceRecordId]), v1Content.sections.filter(section => section.kind === 'unit').flatMap(unit => unit.blocks.filter(block => block.type === 'weapon').map(block => block.id)));
  checkInventory('DETACHMENT', model.entities.filter(entity => entity.kind === 'DETACHMENT').map(entity => entity.id), v1Content.sections.filter(section => section.id.startsWith('detachment-')).map(section => section.id));
  for (const [kind, key, type] of [['ENHANCEMENT', 'enhancements', 'enhancement'], ['STRATAGEM', 'stratagems', 'rule']]) checkInventory(kind, model.entities.filter(entity => entity.kind === kind).map(entity => bindings[key][entity.provenance.sourceRecordId]), v1Content.sections.filter(section => section.id.startsWith('detachment-')).flatMap(section => section.subsections.flatMap(part => part.blocks.filter(block => block.type === type).map(block => block.id))));
  checkInventory('V1_DATASHEET_SECTIONS_BY_SOURCE_BINDING', PINNED_SOURCE_BOUND_V1_INVENTORY.sectionIds, v1Content.sections.filter(section => section.kind === 'unit').flatMap(unit => unit.subsections.map(section => section.id)));
  checkInventory('V1_ABILITIES_BY_SOURCE_BINDING', PINNED_SOURCE_BOUND_V1_INVENTORY.abilityIds, v1Content.sections.filter(section => section.kind === 'unit').flatMap(unit => unit.subsections.flatMap(section => section.blocks.filter(block => block.type === 'ability').map(block => block.id))));
  const valueAt = (value, field) => field.reduce((host, key) => host?.[key], value);
  const integrityFacts = [];
  for (const operation of model.appliedOverlays || []) {
    const entity = entities.get(operation.targetId), source = model.sources?.find(source => source.id === operation.sourceId);
    const expectedProvenance = {sourceId: operation.sourceId, effectiveFrom: source?.effectiveFrom, operationId: operation.id};
    const actual = entity?.fieldProvenance?.[operation.field.join('/')];
    const actualProvenance = actual && {sourceId: actual.sourceId, effectiveFrom: actual.effectiveFrom, operationId: actual.operationId};
    const matches = source?.authority === 'OFFICIAL_GW' && JSON.stringify(expectedProvenance) === JSON.stringify(actualProvenance);
    integrityFacts.push({operationId: operation.id, targetId: operation.targetId, field: operation.field, sourceId: operation.sourceId, status: matches ? 'PASS' : 'FAIL', expected: expectedProvenance, actual: actualProvenance});
    if (!matches) facts.push({entityId: operation.targetId, domain: 'SOURCE_UPDATE_PROVENANCE', field: operation.field, sourceId: operation.sourceId, status: 'DIFFERENT', classification: 'V2_DEFECT', proof: {operationId: operation.id, reason: 'Projected source ownership does not match the registered official operation'}});
    if (operation.operation !== 'QUALIFY' && JSON.stringify(valueAt(entity?.data, operation.field)) !== JSON.stringify(operation.effectiveValue)) facts.push({entityId: operation.targetId, domain: 'SOURCE_UPDATE_PROJECTION', field: operation.field, sourceId: operation.sourceId, status: 'DIFFERENT', classification: 'V2_DEFECT', proof: {operationId: operation.id, reason: 'Projected value differs from the accepted effective official operation value'}});
  }
  const qualificationCoverage = [];
  for (const entity of model.entities) for (const qualification of entity.qualifications || []) {
    const source = model.sources?.find(source => source.id === qualification.sourceId), operation = (model.appliedOverlays || []).find(operation => operation.operation === 'QUALIFY' && operation.targetId === entity.id && JSON.stringify(operation.field) === JSON.stringify(qualification.field) && operation.sourceId === qualification.sourceId);
    const valid = source?.authority === 'OFFICIAL_GW' && operation && JSON.stringify(qualification.value) === JSON.stringify(operation.qualificationValue) && JSON.stringify(qualification.provenance) === JSON.stringify(operation.provenance);
    const coverage = {targetId: entity.id, field: qualification.field, sourceId: qualification.sourceId, operationId: operation?.id, status: valid ? 'PASS' : 'FAIL', semantics: qualification.value};
    qualificationCoverage.push(coverage);
    if (!valid) facts.push({entityId: entity.id, domain: 'OFFICIAL_QUALIFICATION', field: qualification.field, status: 'DIFFERENT', classification: 'V2_DEFECT', proof: {reason: 'Qualification has no identical accepted official operation'}});
    if (qualification.value.faqId === 'gw-dg-v1.3-spore-laced-shock-waves') {
      const target = v1EffectiveModel?.sourceMetadata?.officialUpdates?.updates?.find(update => update.id === 'dg-fp-1.1-p7-spore-laced-shock-waves-faq')?.targets?.find(target => target.owner === 'faq-spore-laced-shock-waves');
      record(entity, 'FAQ_SEMANTICS', ['inflictsMortalWoundsEveryTurn'], qualification.value.inflictsMortalWoundsEveryTurn, target?.effectiveAfter === 'FAQ: Plagueburst Crawler’s Spore-laced Shock Waves ability does not inflict mortal wounds every turn to units affected by the ability.' ? false : undefined, 'Explicit persistent FAQ binding: official answer No agrees with the prior V1 negative clarification');
    } else if (qualification.value.contagionRangeCap !== undefined) {
      const target = v1EffectiveModel?.sourceMetadata?.officialUpdates?.updates?.find(update => update.id === 'dg-fp-1.1-p7-contagion-range-cap')?.targets?.find(target => target.owner === 'contagion-range-cap');
      record(entity, 'FAQ_SEMANTICS', ['contagionRangeCap'], qualification.value.contagionRangeCap, target?.effectiveAfter?.match(/cannot be greater than (\d+)"/) ? Number(target.effectiveAfter.match(/cannot be greater than (\d+)"/)[1]) : undefined);
    } else if (qualification.value.qualificationId === 'universal-assault-disembark') {
      const target = v1EffectiveModel?.units?.find(unit => unit.id === 'unit-chaos-land-raider')?.subsections?.flatMap(section => section.blocks).find(block => block.id === 'chaos-land-raider-ability-assault-ramp');
      record(entity, 'UNIVERSAL_RULE_QUALIFICATION', ['assaultDisembarkRuleReference'], '18.06', target?.text?.includes('assault disembark move (Core Rules, 18.06)') ? '18.06' : undefined, 'The same formal Core Rules reference is preserved by the persistent V1 Assault Ramp record');
    }
  }
  const currentOfficialIds = [...new Set((model.appliedOverlays || []).map(operation => operation.sourceId))];
  const v1OfficialDocumentIds = [...new Set((v1EffectiveModel?.sourceMetadata?.officialUpdates?.updates || []).map(update => update.source.documentId))];
  domainCoverage.sourceUpdateProvenance = {status: integrityFacts.every(fact => fact.status === 'PASS') ? 'PASS' : 'FAIL', records: integrityFacts, currentOfficialSourceIds: currentOfficialIds, v1OfficialDocumentIds, identityPolicy: 'Document and Waha instruction identities remain separate; no title-based equivalence is assumed'};
  domainCoverage.qualifications = {status: qualificationCoverage.every(record => record.status === 'PASS') ? 'PASS' : 'FAIL', records: qualificationCoverage, valuePolicy: 'Confirmations validate source ownership; they do not automatically classify value differences as GW changes'};
  domainCoverage.sourceErrata = {sourceIds: model.entities.filter(entity => entity.kind === 'SOURCE_ERRATUM').map(entity => entity.id), explicitV1Bindings: ERRATA_COMPARISON_BINDINGS};
  if (currentOfficialIds.length) facts.push({entityId: 'official-document-ownership', domain: 'OFFICIAL_SOURCE_VERSION', field: ['sourceIds'], v2: currentOfficialIds, v1: v1OfficialDocumentIds, status: JSON.stringify(currentOfficialIds) === JSON.stringify(v1OfficialDocumentIds) ? 'EXACT' : 'DIFFERENT', classification: JSON.stringify(currentOfficialIds) === JSON.stringify(v1OfficialDocumentIds) ? 'UNCHANGED' : 'EXPECTED_CURRENT_GW_UPDATE', proof: {reason: 'V2 explicitly enrolls the current official packets, while V1 official update provenance remains bound to its previously accepted packet. This is a provenance change, separate from gameplay value changes'}});
  if (model.mfm) {
    if (!v1EffectiveModel) unresolved.push({classification: 'V1_EFFECTIVE_MFM_COMPARISON_NOT_PROVIDED'});
    else {
      const central = createEffectiveMfmArmyProjection('death-guard').deathGuardPoints();
      const comparisonEntity = binding => ({id: binding.entityId, provenance: {sourceId: resolveOwnedFact(binding.mfmRecordId).provenance.sourceId, sourceRecordId: binding.mfmRecordId, pointer: `central-mfm:${binding.mfmRecordId}`}});
      for (const binding of model.mfm.unitBindings) {
        const source = central.units.find(unit => unit.mfmRecordId === binding.mfmRecordId), target = v1EffectiveModel.units.find(unit => unit.id === binding.entityId), entity = comparisonEntity(binding);
        record(entity, 'MFM_UNIT_POINTS', ['points'], source.points.map(({label, value}) => ({label, value})), target?.points?.map(({label, value}) => ({label, value})));
      }
      for (const binding of model.mfm.paidUpgradeBindings) {
        const source = resolveOwnedFact(binding.mfmRecordId), target = v1EffectiveModel.units.find(unit => unit.id === binding.entityId)?.blocks?.find(block => block.type === 'points')?.wargear?.find(option => option.mfmRecordId === binding.mfmRecordId);
        record(comparisonEntity(binding), 'MFM_PAID_UPGRADE', ['value'], source.value, target?.value);
      }
      for (const binding of model.mfm.enhancementBindings) record(comparisonEntity(binding), 'MFM_ENHANCEMENT_COST', ['value'], resolveOwnedFact(binding.mfmRecordId).value, v1EffectiveModel.enhancements.find(enhancement => enhancement.id === binding.armyEnhancementId && enhancement.detachmentId === binding.armyDetachmentId)?.value);
      for (const binding of model.mfm.detachmentBindings) {
        const source = central.detachments.find(detachment => detachment.mfmRecordId === binding.mfmRecordId), target = v1EffectiveModel.detachments.find(detachment => detachment.id === binding.entityId), entity = comparisonEntity(binding);
        for (const field of ['detachmentPoints', 'forceDisposition', 'forceDispositionIds', 'mfmForceDispositionIds', 'missionForceDispositionIds']) record(entity, 'MFM_DETACHMENT', [field], source[field], target?.[field]);
      }
      const v1Relations = [...v1EffectiveModel.relationGraphs.entries()].flatMap(([sourceId, graph]) => [['LEADER', 'canLead'], ['SUPPORT', 'canSupport']].flatMap(([role, field]) => (graph[field] || []).map(target => `${role}|${sourceId}|${target.unitId}`)));
      const v2Relations = model.mfm.relations.map(relation => `${relation.role.toUpperCase()}|${relation.sourceId}|${relation.targetId}`);
      checkInventory('LEADER_SUPPORT_RELATIONS', v2Relations, v1Relations);
      const entity = {id: 'centralized-mfm-relations', provenance: {sourceId: model.mfm.source?.sourceId || 'centralized-death-guard-mfm-v1.5', sourceRecordId: 'LEADER_SUPPORT_RELATIONS', pointer: 'central-mfm:relations'}};
      record(entity, 'LEADER_SUPPORT_RELATIONS', ['edges'], v2Relations.sort(), v1Relations.sort());
    }
  }
  for (const fact of facts) if (fact.classification === 'UNRESOLVED_SOURCE_CONFLICT') unresolved.push({classification: fact.classification, entityId: fact.entityId, field: fact.field, sourcePointer: fact.sourcePointer});
  for (const gap of model.captureGaps || []) unresolved.push({classification: 'SOURCE_CAPTURE_GAP', ...structuredClone(gap)});
  const counters = Object.fromEntries(['EXACT', 'NORMALIZED_EQUAL', 'DIFFERENT', 'MISSING_V1', 'SOURCE_EVIDENCE_ONLY'].map(status => [status, facts.filter(fact => fact.status === status).length]));
  const summary = Object.fromEntries(['UNCHANGED', 'EXPECTED_CURRENT_GW_UPDATE', 'V1_DEFECT', 'V2_DEFECT', 'REPRESENTATION_ONLY', 'UNRESOLVED_SOURCE_CONFLICT'].map(classification => [classification, facts.filter(fact => fact.classification === classification).length]));
  return {schema: 'dg-v2-v1-factual-comparison/v1', comparisonOnly: true, factualOracle: 'V2 accepted source provenance', facts, counters, summary, inventory, domainCoverage, sourceCaptureGaps: structuredClone(model.captureGaps || []), unresolved, conclusion: 'Differences retain source proof; unresolved semantics are not promoted to defects'};
}

export const compareV1 = compareV1Facts;

// Frozen source-record to existing V1 persistent identity registry.
// Comparison-only: never used by normalization or as a factual oracle.
export const PINNED_V1_BINDINGS = Object.freeze({
  "units": {
    "datasheet-beasts-of-nurgle": "unit-beasts-of-nurgle",
    "datasheet-biologus-putrifier": "unit-biologus-putrifier",
    "datasheet-blightlord-terminators": "unit-blightlord-terminators",
    "datasheet-chaos-land-raider": "unit-chaos-land-raider",
    "datasheet-chaos-predator-annihilator": "unit-chaos-predator-annihilator",
    "datasheet-chaos-predator-destructor": "unit-chaos-predator-destructor",
    "datasheet-chaos-rhino": "unit-chaos-rhino",
    "datasheet-chaos-spawn": "unit-chaos-spawn",
    "datasheet-daemon-prince-of-nurgle": "unit-daemon-prince-of-nurgle",
    "datasheet-daemon-prince-of-nurgle-with-wings": "unit-daemon-prince-of-nurgle-with-wings",
    "datasheet-deathshroud-terminators": "unit-deathshroud-terminators",
    "datasheet-defiler": "unit-defiler",
    "datasheet-foetid-bloat-drone": "unit-foetid-bloat-drone",
    "datasheet-foetid-bloat-drone-with-heavy-blight-launcher": "unit-foetid-bloat-drone-with-heavy-blight-launcher",
    "datasheet-foul-blightspawn": "unit-foul-blightspawn",
    "datasheet-great-unclean-one": "unit-great-unclean-one",
    "datasheet-helbrute": "unit-helbrute",
    "datasheet-icon-bearer": "unit-icon-bearer",
    "datasheet-lord-of-contagion": "unit-lord-of-contagion",
    "datasheet-lord-of-poxes": "unit-lord-of-poxes",
    "datasheet-lord-of-virulence": "unit-lord-of-virulence",
    "datasheet-malignant-plaguecaster": "unit-malignant-plaguecaster",
    "datasheet-miasmic-malignifier": "unit-miasmic-malignifier",
    "datasheet-mortarion": "unit-mortarion",
    "datasheet-myphitic-blight-hauler": "unit-myphitic-blight-hauler",
    "datasheet-noxious-blightbringer": "unit-noxious-blightbringer",
    "datasheet-nurglings": "unit-nurglings",
    "datasheet-plague-drones": "unit-plague-drones",
    "datasheet-plague-marines": "unit-plague-marines",
    "datasheet-plague-surgeon": "unit-plague-surgeon",
    "datasheet-plaguebearers": "unit-plaguebearers",
    "datasheet-plagueburst-crawler": "unit-plagueburst-crawler",
    "datasheet-poxwalkers": "unit-poxwalkers",
    "datasheet-rotigus": "unit-rotigus",
    "datasheet-tallyman": "unit-tallyman",
    "datasheet-typhus": "unit-typhus"
  },
  "weapons": {
    "datasheet-beasts-of-nurgle:weapon:1": "beasts-of-nurgle-weapon-putrid-appendages",
    "datasheet-biologus-putrifier:weapon:1": "biologus-putrifier-weapon-hyper-blight-grenades",
    "datasheet-biologus-putrifier:weapon:2": "biologus-putrifier-weapon-injector-pistol",
    "datasheet-biologus-putrifier:weapon:3": "biologus-putrifier-weapon-plague-knives",
    "datasheet-blightlord-terminators:weapon:1": "blightlord-terminators-weapon-blight-launcher",
    "datasheet-blightlord-terminators:weapon:2": "blightlord-terminators-weapon-combi-bolter",
    "datasheet-blightlord-terminators:weapon:3": "blightlord-terminators-weapon-combi-weapon",
    "datasheet-blightlord-terminators:weapon:4": "blightlord-terminators-weapon-plague-spewer",
    "datasheet-blightlord-terminators:weapon:5": "blightlord-terminators-weapon-reaper-autocannon",
    "datasheet-blightlord-terminators:weapon:6": "blightlord-terminators-weapon-bubotic-blade",
    "datasheet-blightlord-terminators:weapon:7": "blightlord-terminators-weapon-close-combat-weapon",
    "datasheet-blightlord-terminators:weapon:8": "blightlord-terminators-weapon-flail-of-corruption",
    "datasheet-chaos-land-raider:weapon:1": "chaos-land-raider-weapon-combi-bolter",
    "datasheet-chaos-land-raider:weapon:2": "chaos-land-raider-weapon-combi-weapon",
    "datasheet-chaos-land-raider:weapon:3": "chaos-land-raider-weapon-havoc-launcher",
    "datasheet-chaos-land-raider:weapon:4": "chaos-land-raider-weapon-soulshatter-lascannon",
    "datasheet-chaos-land-raider:weapon:5": "chaos-land-raider-weapon-twin-heavy-bolter",
    "datasheet-chaos-land-raider:weapon:6": "chaos-land-raider-weapon-armoured-tracks",
    "datasheet-chaos-predator-annihilator:weapon:1": "chaos-predator-annihilator-weapon-combi-bolter",
    "datasheet-chaos-predator-annihilator:weapon:2": "chaos-predator-annihilator-weapon-combi-weapon",
    "datasheet-chaos-predator-annihilator:weapon:3": "chaos-predator-annihilator-weapon-heavy-bolter",
    "datasheet-chaos-predator-annihilator:weapon:4": "chaos-predator-annihilator-weapon-havoc-launcher",
    "datasheet-chaos-predator-annihilator:weapon:5": "chaos-predator-annihilator-weapon-lascannon",
    "datasheet-chaos-predator-annihilator:weapon:6": "chaos-predator-annihilator-weapon-predator-twin-lascannon",
    "datasheet-chaos-predator-annihilator:weapon:7": "chaos-predator-annihilator-weapon-armoured-tracks",
    "datasheet-chaos-predator-destructor:weapon:1": "chaos-predator-destructor-weapon-combi-bolter",
    "datasheet-chaos-predator-destructor:weapon:2": "chaos-predator-destructor-weapon-combi-weapon",
    "datasheet-chaos-predator-destructor:weapon:3": "chaos-predator-destructor-weapon-havoc-launcher",
    "datasheet-chaos-predator-destructor:weapon:4": "chaos-predator-destructor-weapon-heavy-bolter",
    "datasheet-chaos-predator-destructor:weapon:5": "chaos-predator-destructor-weapon-lascannon",
    "datasheet-chaos-predator-destructor:weapon:6": "chaos-predator-destructor-weapon-predator-autocannon",
    "datasheet-chaos-predator-destructor:weapon:7": "chaos-predator-destructor-weapon-armoured-tracks",
    "datasheet-chaos-rhino:weapon:1": "chaos-rhino-weapon-combi-bolter",
    "datasheet-chaos-rhino:weapon:2": "chaos-rhino-weapon-combi-weapon",
    "datasheet-chaos-rhino:weapon:3": "chaos-rhino-weapon-havoc-launcher",
    "datasheet-chaos-rhino:weapon:4": "chaos-rhino-weapon-armoured-tracks",
    "datasheet-chaos-spawn:weapon:1": "chaos-spawn-weapon-hideous-mutations",
    "datasheet-daemon-prince-of-nurgle:weapon:1": "daemon-prince-of-nurgle-weapon-infernal-cannon",
    "datasheet-daemon-prince-of-nurgle:weapon:2": "daemon-prince-of-nurgle-weapon-hellforged-weapons-strike",
    "datasheet-daemon-prince-of-nurgle:weapon:3": "daemon-prince-of-nurgle-weapon-hellforged-weapons-sweep",
    "datasheet-daemon-prince-of-nurgle-with-wings:weapon:1": "daemon-prince-of-nurgle-with-wings-weapon-infernal-cannon",
    "datasheet-daemon-prince-of-nurgle-with-wings:weapon:2": "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-strike",
    "datasheet-daemon-prince-of-nurgle-with-wings:weapon:3": "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-sweep",
    "datasheet-deathshroud-terminators:weapon:1": "deathshroud-terminators-weapon-plaguespurt-gauntlet",
    "datasheet-deathshroud-terminators:weapon:2": "deathshroud-terminators-weapon-manreaper-strike",
    "datasheet-deathshroud-terminators:weapon:3": "deathshroud-terminators-weapon-manreaper-sweep",
    "datasheet-defiler:weapon:1": "defiler-weapon-ectoplasma-destructor",
    "datasheet-defiler:weapon:2": "defiler-weapon-excruciator-cannon",
    "datasheet-defiler:weapon:3": "defiler-weapon-hades-battle-cannon",
    "datasheet-defiler:weapon:4": "defiler-weapon-hades-lascannon",
    "datasheet-defiler:weapon:5": "defiler-weapon-heavy-baleflamer",
    "datasheet-defiler:weapon:6": "defiler-weapon-heavy-missile-launcher-krak",
    "datasheet-defiler:weapon:7": "defiler-weapon-heavy-missile-launcher-frag",
    "datasheet-defiler:weapon:8": "defiler-weapon-heavy-reaper-autocannon",
    "datasheet-defiler:weapon:9": "defiler-weapon-magma-cutters",
    "datasheet-defiler:weapon:10": "defiler-weapon-electroscourge",
    "datasheet-defiler:weapon:11": "defiler-weapon-shearing-claws-strike",
    "datasheet-defiler:weapon:12": "defiler-weapon-shearing-claws-sweep",
    "datasheet-foetid-bloat-drone:weapon:1": "foetid-bloat-drone-weapon-plaguespitter",
    "datasheet-foetid-bloat-drone:weapon:2": "foetid-bloat-drone-weapon-fleshmower",
    "datasheet-foetid-bloat-drone:weapon:3": "foetid-bloat-drone-weapon-plague-probe",
    "datasheet-foetid-bloat-drone-with-heavy-blight-launcher:weapon:1": "foetid-bloat-drone-with-heavy-blight-launcher-weapon-heavy-blight-launcher",
    "datasheet-foetid-bloat-drone-with-heavy-blight-launcher:weapon:2": "foetid-bloat-drone-with-heavy-blight-launcher-weapon-plague-probe",
    "datasheet-foul-blightspawn:weapon:1": "foul-blightspawn-weapon-plague-sprayer",
    "datasheet-foul-blightspawn:weapon:2": "foul-blightspawn-weapon-close-combat-weapon",
    "datasheet-great-unclean-one:weapon:1": "great-unclean-one-weapon-plague-flail",
    "datasheet-great-unclean-one:weapon:2": "great-unclean-one-weapon-putrid-vomit",
    "datasheet-great-unclean-one:weapon:3": "great-unclean-one-weapon-bileblade",
    "datasheet-great-unclean-one:weapon:4": "great-unclean-one-weapon-bilesword-strike",
    "datasheet-great-unclean-one:weapon:5": "great-unclean-one-weapon-bilesword-sweep",
    "datasheet-great-unclean-one:weapon:6": "great-unclean-one-weapon-doomsday-bell",
    "datasheet-helbrute:weapon:1": "helbrute-weapon-combi-bolter",
    "datasheet-helbrute:weapon:2": "helbrute-weapon-heavy-flamer",
    "datasheet-helbrute:weapon:3": "helbrute-weapon-missile-launcher-frag",
    "datasheet-helbrute:weapon:4": "helbrute-weapon-missile-launcher-krak",
    "datasheet-helbrute:weapon:5": "helbrute-weapon-multi-melta",
    "datasheet-helbrute:weapon:6": "helbrute-weapon-plasma-cannon",
    "datasheet-helbrute:weapon:7": "helbrute-weapon-twin-autocannon",
    "datasheet-helbrute:weapon:8": "helbrute-weapon-twin-heavy-bolter",
    "datasheet-helbrute:weapon:9": "helbrute-weapon-twin-lascannon",
    "datasheet-helbrute:weapon:10": "helbrute-weapon-close-combat-weapon",
    "datasheet-helbrute:weapon:11": "helbrute-weapon-helbrute-fist",
    "datasheet-helbrute:weapon:12": "helbrute-weapon-helbrute-hammer",
    "datasheet-helbrute:weapon:13": "helbrute-weapon-power-scourge",
    "datasheet-icon-bearer:weapon:1": "icon-bearer-weapon-boltgun",
    "datasheet-icon-bearer:weapon:2": "icon-bearer-weapon-plague-knife",
    "datasheet-lord-of-contagion:weapon:1": "lord-of-contagion-weapon-manreaper-strike",
    "datasheet-lord-of-contagion:weapon:2": "lord-of-contagion-weapon-manreaper-sweep",
    "datasheet-lord-of-poxes:weapon:1": "lord-of-poxes-weapon-plasma-pistol-standard",
    "datasheet-lord-of-poxes:weapon:2": "lord-of-poxes-weapon-plasma-pistol-supercharge",
    "datasheet-lord-of-poxes:weapon:3": "lord-of-poxes-weapon-great-plague-blade",
    "datasheet-lord-of-virulence:weapon:1": "lord-of-virulence-weapon-twin-plague-spewer",
    "datasheet-lord-of-virulence:weapon:2": "lord-of-virulence-weapon-power-fist",
    "datasheet-malignant-plaguecaster:weapon:1": "malignant-plaguecaster-weapon-bolt-pistol",
    "datasheet-malignant-plaguecaster:weapon:2": "malignant-plaguecaster-weapon-plague-wind-witchfire",
    "datasheet-malignant-plaguecaster:weapon:3": "malignant-plaguecaster-weapon-plague-wind-focused-witchfire",
    "datasheet-malignant-plaguecaster:weapon:4": "malignant-plaguecaster-weapon-corrupted-staff",
    "datasheet-miasmic-malignifier:weapon:1": "miasmic-malignifier-weapon-miasmic-gouts",
    "datasheet-mortarion:weapon:1": "mortarion-weapon-lantern",
    "datasheet-mortarion:weapon:2": "mortarion-weapon-rotwind",
    "datasheet-mortarion:weapon:3": "mortarion-weapon-silence-strike",
    "datasheet-mortarion:weapon:4": "mortarion-weapon-silence-sweep",
    "datasheet-myphitic-blight-hauler:weapon:1": "myphitic-blight-hauler-weapon-bile-spurt",
    "datasheet-myphitic-blight-hauler:weapon:2": "myphitic-blight-hauler-weapon-missile-launcher-frag",
    "datasheet-myphitic-blight-hauler:weapon:3": "myphitic-blight-hauler-weapon-missile-launcher-krak",
    "datasheet-myphitic-blight-hauler:weapon:4": "myphitic-blight-hauler-weapon-multi-melta",
    "datasheet-myphitic-blight-hauler:weapon:5": "myphitic-blight-hauler-weapon-gnashing-maw",
    "datasheet-noxious-blightbringer:weapon:1": "noxious-blightbringer-weapon-plasma-pistol-standard",
    "datasheet-noxious-blightbringer:weapon:2": "noxious-blightbringer-weapon-plasma-pistol-supercharge",
    "datasheet-noxious-blightbringer:weapon:3": "noxious-blightbringer-weapon-cursed-plague-bell",
    "datasheet-nurglings:weapon:1": "nurglings-weapon-diseased-claws-and-teeth",
    "datasheet-plague-drones:weapon:1": "plague-drones-weapon-deaths-heads",
    "datasheet-plague-drones:weapon:2": "plague-drones-weapon-foul-mouthparts",
    "datasheet-plague-drones:weapon:3": "plague-drones-weapon-plaguesword",
    "datasheet-plague-marines:weapon:1": "plague-marines-weapon-blight-launcher",
    "datasheet-plague-marines:weapon:2": "plague-marines-weapon-boltgun",
    "datasheet-plague-marines:weapon:3": "plague-marines-weapon-bolt-pistol",
    "datasheet-plague-marines:weapon:4": "plague-marines-weapon-meltagun",
    "datasheet-plague-marines:weapon:5": "plague-marines-weapon-plague-belcher",
    "datasheet-plague-marines:weapon:6": "plague-marines-weapon-plague-spewer",
    "datasheet-plague-marines:weapon:7": "plague-marines-weapon-plasma-gun-standard",
    "datasheet-plague-marines:weapon:8": "plague-marines-weapon-plasma-gun-supercharge",
    "datasheet-plague-marines:weapon:9": "plague-marines-weapon-plasma-pistol-standard",
    "datasheet-plague-marines:weapon:10": "plague-marines-weapon-plasma-pistol-supercharge",
    "datasheet-plague-marines:weapon:11": "plague-marines-weapon-bubotic-weapons",
    "datasheet-plague-marines:weapon:12": "plague-marines-weapon-heavy-plague-weapon",
    "datasheet-plague-marines:weapon:13": "plague-marines-weapon-plague-knives",
    "datasheet-plague-marines:weapon:14": "plague-marines-weapon-power-fist",
    "datasheet-plague-surgeon:weapon:1": "plague-surgeon-weapon-bolt-pistol",
    "datasheet-plague-surgeon:weapon:2": "plague-surgeon-weapon-balesword",
    "datasheet-plaguebearers:weapon:1": "plaguebearers-weapon-plaguesword",
    "datasheet-plagueburst-crawler:weapon:1": "plagueburst-crawler-weapon-entropy-cannon",
    "datasheet-plagueburst-crawler:weapon:2": "plagueburst-crawler-weapon-heavy-slugger",
    "datasheet-plagueburst-crawler:weapon:3": "plagueburst-crawler-weapon-plagueburst-mortar",
    "datasheet-plagueburst-crawler:weapon:4": "plagueburst-crawler-weapon-plaguespitter",
    "datasheet-plagueburst-crawler:weapon:5": "plagueburst-crawler-weapon-rothail-volley-gun",
    "datasheet-plagueburst-crawler:weapon:6": "plagueburst-crawler-weapon-armoured-tracks",
    "datasheet-poxwalkers:weapon:1": "poxwalkers-weapon-improvised-weapon",
    "datasheet-rotigus:weapon:1": "rotigus-weapon-streams-of-brackish-filth",
    "datasheet-rotigus:weapon:2": "rotigus-weapon-gnarlrod-strike",
    "datasheet-rotigus:weapon:3": "rotigus-weapon-gnarlrod-sweep",
    "datasheet-tallyman:weapon:1": "tallyman-weapon-plasma-pistol-standard",
    "datasheet-tallyman:weapon:2": "tallyman-weapon-plasma-pistol-supercharge",
    "datasheet-tallyman:weapon:3": "tallyman-weapon-close-combat-weapon",
    "datasheet-typhus:weapon:1": "typhus-weapon-lakrimae-strike",
    "datasheet-typhus:weapon:2": "typhus-weapon-lakrimae-sweep"
  },
  "sections": {
    "datasheet-beasts-of-nurgle:section:1": "beasts-of-nurgle-abilities",
    "datasheet-beasts-of-nurgle:section:2": "beasts-of-nurgle-composition",
    "datasheet-biologus-putrifier:section:1": "biologus-putrifier-abilities",
    "datasheet-biologus-putrifier:section:2": "biologus-putrifier-composition",
    "datasheet-biologus-putrifier:section:3": "biologus-putrifier-leader",
    "datasheet-blightlord-terminators:section:1": "blightlord-terminators-abilities",
    "datasheet-blightlord-terminators:section:2": "blightlord-terminators-composition",
    "datasheet-chaos-land-raider:section:1": "chaos-land-raider-abilities",
    "datasheet-chaos-land-raider:section:2": "chaos-land-raider-transport",
    "datasheet-chaos-land-raider:section:3": "chaos-land-raider-composition",
    "datasheet-chaos-land-raider:section:4": "chaos-land-raider-damaged",
    "datasheet-chaos-predator-annihilator:section:1": "chaos-predator-annihilator-abilities",
    "datasheet-chaos-predator-annihilator:section:2": "chaos-predator-annihilator-composition",
    "datasheet-chaos-predator-annihilator:section:3": "chaos-predator-annihilator-damaged",
    "datasheet-chaos-predator-destructor:section:1": "chaos-predator-destructor-abilities",
    "datasheet-chaos-predator-destructor:section:2": "chaos-predator-destructor-composition",
    "datasheet-chaos-predator-destructor:section:3": "chaos-predator-destructor-damaged",
    "datasheet-chaos-rhino:section:1": "chaos-rhino-abilities",
    "datasheet-chaos-rhino:section:2": "chaos-rhino-transport",
    "datasheet-chaos-rhino:section:3": "chaos-rhino-composition",
    "datasheet-chaos-spawn:section:1": "chaos-spawn-abilities",
    "datasheet-chaos-spawn:section:2": "chaos-spawn-composition",
    "datasheet-daemon-prince-of-nurgle:section:1": "daemon-prince-of-nurgle-abilities",
    "datasheet-daemon-prince-of-nurgle:section:2": "daemon-prince-of-nurgle-composition",
    "datasheet-daemon-prince-of-nurgle-with-wings:section:1": "daemon-prince-of-nurgle-with-wings-abilities",
    "datasheet-daemon-prince-of-nurgle-with-wings:section:2": "daemon-prince-of-nurgle-with-wings-composition",
    "datasheet-deathshroud-terminators:section:1": "deathshroud-terminators-abilities",
    "datasheet-deathshroud-terminators:section:2": "deathshroud-terminators-composition",
    "datasheet-defiler:section:1": "defiler-abilities",
    "datasheet-defiler:section:2": "defiler-composition",
    "datasheet-defiler:section:3": "defiler-damaged",
    "datasheet-foetid-bloat-drone:section:1": "foetid-bloat-drone-abilities",
    "datasheet-foetid-bloat-drone:section:2": "foetid-bloat-drone-composition",
    "datasheet-foetid-bloat-drone-with-heavy-blight-launcher:section:1": "foetid-bloat-drone-with-heavy-blight-launcher-abilities",
    "datasheet-foetid-bloat-drone-with-heavy-blight-launcher:section:2": "foetid-bloat-drone-with-heavy-blight-launcher-composition",
    "datasheet-foul-blightspawn:section:1": "foul-blightspawn-abilities",
    "datasheet-foul-blightspawn:section:2": "foul-blightspawn-composition",
    "datasheet-foul-blightspawn:section:3": "foul-blightspawn-leader",
    "datasheet-great-unclean-one:section:1": "great-unclean-one-abilities",
    "datasheet-great-unclean-one:section:2": "great-unclean-one-composition",
    "datasheet-great-unclean-one:section:3": "great-unclean-one-damaged",
    "datasheet-helbrute:section:1": "helbrute-abilities",
    "datasheet-helbrute:section:2": "helbrute-composition",
    "datasheet-icon-bearer:section:1": "icon-bearer-abilities",
    "datasheet-icon-bearer:section:2": "icon-bearer-composition",
    "datasheet-icon-bearer:section:3": "icon-bearer-leader",
    "datasheet-lord-of-contagion:section:1": "lord-of-contagion-abilities",
    "datasheet-lord-of-contagion:section:2": "lord-of-contagion-composition",
    "datasheet-lord-of-contagion:section:3": "lord-of-contagion-leader",
    "datasheet-lord-of-poxes:section:1": "lord-of-poxes-abilities",
    "datasheet-lord-of-poxes:section:2": "lord-of-poxes-composition",
    "datasheet-lord-of-poxes:section:3": "lord-of-poxes-leader",
    "datasheet-lord-of-virulence:section:1": "lord-of-virulence-abilities",
    "datasheet-lord-of-virulence:section:2": "lord-of-virulence-composition",
    "datasheet-lord-of-virulence:section:3": "lord-of-virulence-leader",
    "datasheet-malignant-plaguecaster:section:1": "malignant-plaguecaster-abilities",
    "datasheet-malignant-plaguecaster:section:2": "malignant-plaguecaster-composition",
    "datasheet-malignant-plaguecaster:section:3": "malignant-plaguecaster-leader",
    "datasheet-miasmic-malignifier:section:1": null,
    "datasheet-miasmic-malignifier:section:2": "miasmic-malignifier-abilities",
    "datasheet-miasmic-malignifier:section:3": "miasmic-malignifier-composition",
    "datasheet-mortarion:section:1": null,
    "datasheet-mortarion:section:2": null,
    "datasheet-mortarion:section:3": "mortarion-abilities",
    "datasheet-mortarion:section:4": "mortarion-composition",
    "datasheet-mortarion:section:5": "mortarion-damaged",
    "datasheet-myphitic-blight-hauler:section:1": "myphitic-blight-hauler-abilities",
    "datasheet-myphitic-blight-hauler:section:2": "myphitic-blight-hauler-composition",
    "datasheet-noxious-blightbringer:section:1": "noxious-blightbringer-abilities",
    "datasheet-noxious-blightbringer:section:2": "noxious-blightbringer-composition",
    "datasheet-noxious-blightbringer:section:3": "noxious-blightbringer-leader",
    "datasheet-nurglings:section:1": "nurglings-abilities",
    "datasheet-nurglings:section:2": "nurglings-composition",
    "datasheet-plague-drones:section:1": "plague-drones-abilities",
    "datasheet-plague-drones:section:2": "plague-drones-composition",
    "datasheet-plague-marines:section:1": "plague-marines-abilities",
    "datasheet-plague-marines:section:2": "plague-marines-composition",
    "datasheet-plague-surgeon:section:1": "plague-surgeon-abilities",
    "datasheet-plague-surgeon:section:2": "plague-surgeon-composition",
    "datasheet-plague-surgeon:section:3": "plague-surgeon-leader",
    "datasheet-plaguebearers:section:1": "plaguebearers-abilities",
    "datasheet-plaguebearers:section:2": "plaguebearers-composition",
    "datasheet-plagueburst-crawler:section:1": "plagueburst-crawler-abilities",
    "datasheet-plagueburst-crawler:section:2": "plagueburst-crawler-composition",
    "datasheet-plagueburst-crawler:section:3": "plagueburst-crawler-damaged",
    "datasheet-poxwalkers:section:1": "poxwalkers-abilities",
    "datasheet-poxwalkers:section:2": "poxwalkers-composition",
    "datasheet-rotigus:section:1": "rotigus-abilities",
    "datasheet-rotigus:section:2": "rotigus-composition",
    "datasheet-rotigus:section:3": "rotigus-damaged",
    "datasheet-tallyman:section:1": "tallyman-abilities",
    "datasheet-tallyman:section:2": "tallyman-composition",
    "datasheet-tallyman:section:3": "tallyman-leader",
    "datasheet-typhus:section:1": "typhus-abilities",
    "datasheet-typhus:section:2": "typhus-composition",
    "datasheet-typhus:section:3": "typhus-leader"
  },
  "enhancements": {
    "detachment-virulent-vectorium:enhancement:1": "enhancement-daemon-weapon-of-nurgle",
    "detachment-virulent-vectorium:enhancement:2": "enhancement-furnace-of-plagues",
    "detachment-virulent-vectorium:enhancement:3": "enhancement-arch-contaminator",
    "detachment-virulent-vectorium:enhancement:4": "enhancement-revolting-regeneration",
    "detachment-shamblerot-vectorium:enhancement:1": "enhancement-witherbone-pipes",
    "detachment-shamblerot-vectorium:enhancement:2": "enhancement-lord-of-the-walking-pox",
    "detachment-shamblerot-vectorium:enhancement:3": "enhancement-sorrowsyphon",
    "detachment-shamblerot-vectorium:enhancement:4": "enhancement-talisman-of-burgeoning",
    "detachment-tallyband-summoners:enhancement:1": "enhancement-beckoning-blight",
    "detachment-tallyband-summoners:enhancement:2": "enhancement-fell-harvester",
    "detachment-tallyband-summoners:enhancement:3": "enhancement-entropic-knell",
    "detachment-tallyband-summoners:enhancement:4": "enhancement-tome-of-bounteous-blessings",
    "detachment-death-lords-chosen:enhancement:1": "enhancement-face-of-death",
    "detachment-death-lords-chosen:enhancement:2": "enhancement-vile-vigour",
    "detachment-death-lords-chosen:enhancement:3": "enhancement-warprot-talisman",
    "detachment-death-lords-chosen:enhancement:4": "enhancement-helm-of-the-fly-king",
    "detachment-mortarions-hammer:enhancement:1": "enhancement-eye-of-affliction",
    "detachment-mortarions-hammer:enhancement:2": "enhancement-bilemaw-blight",
    "detachment-mortarions-hammer:enhancement:3": "enhancement-shriekworm-familiar",
    "detachment-mortarions-hammer:enhancement:4": "enhancement-tendrilous-emissions",
    "detachment-champions-of-contagion:enhancement:1": "enhancement-final-ingredient",
    "detachment-champions-of-contagion:enhancement:2": "enhancement-visions-of-virulence",
    "detachment-champions-of-contagion:enhancement:3": "enhancement-needle-of-nurgle",
    "detachment-champions-of-contagion:enhancement:4": "enhancement-cornucophagus",
    "detachment-paragons-of-putrescence:enhancement:1": "enhancement-rejuvenating-swarm",
    "detachment-paragons-of-putrescence:enhancement:2": "enhancement-host-of-the-hybridised-pox",
    "detachment-contagion-engines:enhancement:1": "enhancement-parasitic-woe-reaper",
    "detachment-contagion-engines:enhancement:2": "enhancement-lancet-of-the-worldsore",
    "detachment-flyblown-host:enhancement:1": "enhancement-insectile-murmuration",
    "detachment-flyblown-host:enhancement:2": "enhancement-plagueveil"
  },
  "stratagems": {
    "detachment-virulent-vectorium:stratagem:1": "stratagem-putrid-detonation",
    "detachment-virulent-vectorium:stratagem:2": "stratagem-disgustingly-resilient",
    "detachment-virulent-vectorium:stratagem:3": "stratagem-plaguesurge",
    "detachment-virulent-vectorium:stratagem:4": "stratagem-leechspore-eruption",
    "detachment-virulent-vectorium:stratagem:5": "stratagem-overwhelming-generosity",
    "detachment-virulent-vectorium:stratagem:6": "stratagem-creeping-blight",
    "detachment-shamblerot-vectorium:stratagem:1": "stratagem-grip-of-the-walking-pox",
    "detachment-shamblerot-vectorium:stratagem:2": "stratagem-smeared-with-filth",
    "detachment-shamblerot-vectorium:stratagem:3": "stratagem-gnawing-hunger",
    "detachment-shamblerot-vectorium:stratagem:4": "stratagem-hidden-amongst-the-dead",
    "detachment-shamblerot-vectorium:stratagem:5": "stratagem-shock-and-horror",
    "detachment-shamblerot-vectorium:stratagem:6": "stratagem-shambling-wall",
    "detachment-tallyband-summoners:stratagem:1": "stratagem-persistent-pests",
    "detachment-tallyband-summoners:stratagem:2": "stratagem-clutching-corruption",
    "detachment-tallyband-summoners:stratagem:3": "stratagem-all-is-rot",
    "detachment-tallyband-summoners:stratagem:4": "stratagem-fleshy-avalanche",
    "detachment-tallyband-summoners:stratagem:5": "stratagem-avatars-of-decay",
    "detachment-tallyband-summoners:stratagem:6": "stratagem-mireslick",
    "detachment-death-lords-chosen:stratagem:1": "stratagem-blooming-pestilence",
    "detachment-death-lords-chosen:stratagem:2": "stratagem-grim-reapers",
    "detachment-death-lords-chosen:stratagem:3": "stratagem-undying-spite",
    "detachment-death-lords-chosen:stratagem:4": "stratagem-signal-pox",
    "detachment-death-lords-chosen:stratagem:5": "stratagem-mortarion-s-teachings",
    "detachment-death-lords-chosen:stratagem:6": "stratagem-sickening-impact",
    "detachment-mortarions-hammer:stratagem:1": "stratagem-blighted-land",
    "detachment-mortarions-hammer:stratagem:2": "stratagem-relentless-grind",
    "detachment-mortarions-hammer:stratagem:3": "stratagem-drawn-to-despair",
    "detachment-mortarions-hammer:stratagem:4": "stratagem-font-of-filth",
    "detachment-mortarions-hammer:stratagem:5": "stratagem-eyestinger-storm",
    "detachment-mortarions-hammer:stratagem:6": "stratagem-stinking-mire",
    "detachment-champions-of-contagion:stratagem:1": "stratagem-blessings-of-filth",
    "detachment-champions-of-contagion:stratagem:2": "stratagem-malignance-magnified",
    "detachment-champions-of-contagion:stratagem:3": "stratagem-grotesque-fortitude",
    "detachment-champions-of-contagion:stratagem:4": "stratagem-rabid-infusion",
    "detachment-champions-of-contagion:stratagem:5": "stratagem-mobile-vector",
    "detachment-champions-of-contagion:stratagem:6": "stratagem-deaths-heads",
    "detachment-paragons-of-putrescence:stratagem:1": "stratagem-territorial-infection",
    "detachment-paragons-of-putrescence:stratagem:2": "stratagem-aggravus-spasms",
    "detachment-paragons-of-putrescence:stratagem:3": "stratagem-simultaneous-contamination",
    "detachment-contagion-engines:stratagem:1": "stratagem-fresh-vectors",
    "detachment-contagion-engines:stratagem:2": "stratagem-bloodrust-deluge",
    "detachment-contagion-engines:stratagem:3": "stratagem-soulrot-flux",
    "detachment-flyblown-host:stratagem:1": "stratagem-nauseating-paroxysms",
    "detachment-flyblown-host:stratagem:2": "stratagem-droning-horror",
    "detachment-flyblown-host:stratagem:3": "stratagem-eye-of-the-swarm"
  },
  "rules": {
    "detachment-virulent-vectorium:rule": "rule-worldblight",
    "detachment-shamblerot-vectorium:rule": "rule-numberless-horde",
    "detachment-tallyband-summoners:rule": "rule-reverberant-rancidity",
    "detachment-death-lords-chosen:rule": "rule-deadly-vectors",
    "detachment-mortarions-hammer:rule": "rule-miasmic-bombardment",
    "detachment-champions-of-contagion:rule": "rule-manifold-maladies",
    "detachment-paragons-of-putrescence:rule": "rule-hypervirulent-strains",
    "detachment-contagion-engines:rule": "rule-warped-and-rusted-animus",
    "detachment-flyblown-host:rule": "rule-verminous-haze"
  },
  "wargearSections": {
    "unit-plague-marines": "plague-marines-wargear-options",
    "unit-blightlord-terminators": "blightlord-terminators-wargear-options",
    "unit-deathshroud-terminators": "deathshroud-terminators-wargear-options",
    "unit-chaos-land-raider": "chaos-land-raider-wargear-options",
    "unit-chaos-predator-annihilator": "chaos-predator-annihilator-wargear-options",
    "unit-chaos-predator-destructor": "chaos-predator-destructor-wargear-options",
    "unit-defiler": "defiler-wargear",
    "unit-foetid-bloat-drone": "foetid-bloat-drone-wargear-options",
    "unit-helbrute": "helbrute-wargear-options",
    "unit-plagueburst-crawler": "plagueburst-crawler-wargear-options",
    "unit-chaos-rhino": "chaos-rhino-wargear-options",
    "unit-great-unclean-one": "great-unclean-one-wargear-options",
    "unit-plague-drones": "plague-drones-wargear-options",
    "unit-plaguebearers": "plaguebearers-wargear-options"
  },
  "abilitySections": {
    "unit-mortarion": "mortarion-abilities",
    "unit-typhus": "typhus-abilities",
    "unit-biologus-putrifier": "biologus-putrifier-abilities",
    "unit-daemon-prince-of-nurgle": "daemon-prince-of-nurgle-abilities",
    "unit-daemon-prince-of-nurgle-with-wings": "daemon-prince-of-nurgle-with-wings-abilities",
    "unit-foul-blightspawn": "foul-blightspawn-abilities",
    "unit-icon-bearer": "icon-bearer-abilities",
    "unit-lord-of-contagion": "lord-of-contagion-abilities",
    "unit-lord-of-poxes": "lord-of-poxes-abilities",
    "unit-lord-of-virulence": "lord-of-virulence-abilities",
    "unit-malignant-plaguecaster": "malignant-plaguecaster-abilities",
    "unit-noxious-blightbringer": "noxious-blightbringer-abilities",
    "unit-plague-surgeon": "plague-surgeon-abilities",
    "unit-tallyman": "tallyman-abilities",
    "unit-plague-marines": "plague-marines-abilities",
    "unit-blightlord-terminators": "blightlord-terminators-abilities",
    "unit-deathshroud-terminators": "deathshroud-terminators-abilities",
    "unit-poxwalkers": "poxwalkers-abilities",
    "unit-chaos-spawn": "chaos-spawn-abilities",
    "unit-chaos-land-raider": "chaos-land-raider-abilities",
    "unit-chaos-predator-annihilator": "chaos-predator-annihilator-abilities",
    "unit-chaos-predator-destructor": "chaos-predator-destructor-abilities",
    "unit-defiler": "defiler-abilities",
    "unit-foetid-bloat-drone": "foetid-bloat-drone-abilities",
    "unit-foetid-bloat-drone-with-heavy-blight-launcher": "foetid-bloat-drone-with-heavy-blight-launcher-abilities",
    "unit-helbrute": "helbrute-abilities",
    "unit-myphitic-blight-hauler": "myphitic-blight-hauler-abilities",
    "unit-plagueburst-crawler": "plagueburst-crawler-abilities",
    "unit-chaos-rhino": "chaos-rhino-abilities",
    "unit-miasmic-malignifier": "miasmic-malignifier-abilities",
    "unit-beasts-of-nurgle": "beasts-of-nurgle-abilities",
    "unit-great-unclean-one": "great-unclean-one-abilities",
    "unit-nurglings": "nurglings-abilities",
    "unit-plague-drones": "plague-drones-abilities",
    "unit-plaguebearers": "plaguebearers-abilities",
    "unit-rotigus": "rotigus-abilities"
  },
  "armyComponents": {
    "army-rule-nurgles-gift:afflicted": "afflicted",
    "army-rule-nurgles-gift:skullsquirm-blight": "skullsquirm-blight",
    "army-rule-nurgles-gift:rattlejoint-ague": "rattlejoint-ague",
    "army-rule-nurgles-gift:scabrous-soulrot": "scabrous-soulrot",
    "army-rule-pact-of-decay": "pact-of-decay"
  },
  "sectionBlocks": {
    "datasheet-miasmic-malignifier:section:1": [
      "miasmic-malignifier-ability-fortification-setup"
    ],
    "datasheet-miasmic-malignifier:section:2": [
      "miasmic-malignifier-ability-putrescent-fog-aura",
      "miasmic-malignifier-ability-diseased-cover",
      "miasmic-malignifier-ability-fortification"
    ],
    "datasheet-mortarion:section:1": [
      "mortarion-ability-lord-of-the-death-guard"
    ],
    "datasheet-mortarion:section:2": [
      "mortarion-ability-supreme-commander"
    ],
    "datasheet-mortarion:section:3": [
      "mortarion-ability-lord-of-the-death-guard",
      "mortarion-ability-host-of-plagues"
    ],
    "datasheet-deathshroud-terminators:section:1": [
      "deathshroud-terminators-ability-silent-bodyguard",
      "deathshroud-terminators-ability-death-approaches",
      "deathshroud-terminators-ability-icon-of-despair-aura"
    ],
    "datasheet-plague-drones:section:1": [
      "plague-drones-ability-deaths-heads",
      "plague-drones-ability-daemonic-icon",
      "plague-drones-ability-instrument-of-chaos"
    ],
    "datasheet-plague-marines:section:1": [
      "plague-marines-ability-infused-with-the-blessings-of-nurgle",
      "plague-marines-ability-icon-of-despair-aura"
    ],
    "datasheet-plaguebearers:section:1": [
      "plaguebearers-ability-infected-outbreak",
      "plaguebearers-ability-daemonic-icon",
      "plaguebearers-ability-instrument-of-chaos"
    ],
    "datasheet-great-unclean-one:section:1": [
      "great-unclean-one-ability-daemon-lord-of-nurgle-aura",
      "great-unclean-one-ability-nurgles-rot-psychic"
    ]
  },
  "rawFacts": {
    "datasheet-great-unclean-one:raw-dsAbility:1": {
      "blockId": "great-unclean-one-ability-reverberating-summons"
    },
    "datasheet-helbrute:raw-dsOptionsComment:1": {
      "sectionId": "helbrute-wargear-options",
      "blockIndex": 3,
      "footnote": true
    }
  }
});

// Independently reviewed pinned source/V1 representation pairs.
// Exact pair guards ensure changed conditions or numerals cannot inherit this classification.
const REPRESENTATION_ADJUDICATIONS = Object.freeze({
  "datasheet-beasts-of-nurgle:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1-2 Beasts of Nurgle\nEvery model is equipped with: putrid appendages.",
    "v1Value": "1-2 Beasts of Nurgle. Every model is equipped with: putrid appendages.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/0/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-biologus-putrifier:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Biologus Putrifier\nThis model is equipped with: hyper blight grenades; injector pistol; plague knives.",
    "v1Value": "1 Biologus Putrifier. This model is equipped with: hyper blight grenades; injector pistol; plague knives.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/1/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-biologus-putrifier:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following unit:\n- PLAGUE MARINES\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "v1Value": "This model can be attached to the following units: Plague Marines.\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/1/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-blightlord-terminators:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Blightlord Champion\n- 2-9 Blightlord Terminators\nEvery model is equipped with: combi-bolter; bubotic blade.",
    "v1Value": "1 Blightlord Champion; 2-9 Blightlord Terminators. Every model is equipped with: combi-bolter; bubotic blade.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/2/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-chaos-land-raider:wargear:1|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be equipped with one of the following:\n- 1 combi-bolter\n- 1 combi-weapon",
    "v1Value": "This model can be equipped with one of the following: 1 combi-bolter; 1 combi-weapon.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/3/wargearOptions/0",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-chaos-land-raider:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Chaos Land Raider\nThis model is equipped with: 2 soulshatter lascannons; twin heavy bolter; armoured tracks.",
    "v1Value": "1 Chaos Land Raider. This model is equipped with: 2 soulshatter lascannons; twin heavy bolter; armoured tracks.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/3/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-chaos-predator-annihilator:wargear:1|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be equipped with one of the following:\n- 2 lascannons\n- 2 heavy bolters",
    "v1Value": "This model can be equipped with one of the following: 2 lascannons; 2 heavy bolters.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/4/wargearOptions/0",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-chaos-predator-annihilator:wargear:2|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be equipped with one of the following:\n- 1 combi-weapon\n- 1 combi-bolter",
    "v1Value": "This model can be equipped with one of the following: 1 combi-weapon; 1 combi-bolter.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/4/wargearOptions/1",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-chaos-predator-annihilator:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Chaos Predator Annihilator\nThis model is equipped with: Predator twin lascannon; armoured tracks.",
    "v1Value": "1 Chaos Predator Annihilator. This model is equipped with: Predator twin lascannon; armoured tracks.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/4/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-chaos-predator-destructor:wargear:1|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be equipped with one of the following:\n- 2 heavy bolters\n- 2 lascannons",
    "v1Value": "This model can be equipped with one of the following: 2 heavy bolters; 2 lascannons.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/5/wargearOptions/0",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-chaos-predator-destructor:wargear:2|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be equipped with one of the following:\n- 1 combi-bolter\n- 1 combi-weapon",
    "v1Value": "This model can be equipped with one of the following: 1 combi-bolter; 1 combi-weapon.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/5/wargearOptions/1",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-chaos-predator-destructor:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Chaos Predator Destructor\nThis model is equipped with: predator autocannon; armoured tracks.",
    "v1Value": "1 Chaos Predator Destructor. This model is equipped with: predator autocannon; armoured tracks.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/5/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-chaos-rhino:wargear:1|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be equipped with one of the following:\n- 1 additional combi-bolter\n- 1 combi-weapon",
    "v1Value": "This model can be equipped with one of the following: 1 additional combi-bolter; 1 combi-weapon.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/6/wargearOptions/0",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-chaos-rhino:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Chaos Rhino\nThis model is equipped with: combi-bolter; armoured tracks.",
    "v1Value": "1 Chaos Rhino. This model is equipped with: combi-bolter; armoured tracks.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/6/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-chaos-spawn:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 2 Chaos Spawn\nEvery model is equipped with: hideous mutations.",
    "v1Value": "2 Chaos Spawn. Every model is equipped with: hideous mutations.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/7/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-daemon-prince-of-nurgle:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Daemon Prince of Nurgle\nThis model is equipped with: infernal cannon; hellforged weapons.",
    "v1Value": "1 Daemon Prince of Nurgle. This model is equipped with: infernal cannon; hellforged weapons.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/8/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-daemon-prince-of-nurgle-with-wings:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Daemon Prince of Nurgle with Wings\nThis model is equipped with: infernal cannon; hellforged weapons.",
    "v1Value": "1 Daemon Prince of Nurgle with Wings. This model is equipped with: infernal cannon; hellforged weapons.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/9/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-deathshroud-terminators:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Deathshroud Champion\n- 2-5 Deathshroud Terminators\nEvery model is equipped with: plaguespurt gauntlet; manreaper.",
    "v1Value": "1 Deathshroud Champion; 2-5 Deathshroud Terminators. Every model is equipped with: plaguespurt gauntlet; manreaper.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/10/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-defiler:wargear:2|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model’s excruciator cannons can be replaced with 2 magma cutters",
    "v1Value": "This model’s excruciator cannons can be replaced with 2 magma cutters.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/11/wargearOptions/1",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-defiler:wargear:3|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model’s heavy baleflamer can be replaced with one of the following:\n- 1 Hades lascannon\n- 1 heavy reaper autocannon\n- 1 electroscourge (a model cannot be equipped with more than one electroscourge)",
    "v1Value": "This model’s heavy baleflamer can be replaced with one of the following: 1 Hades lascannon; 1 heavy reaper autocannon; 1 electroscourge (a model cannot be equipped with more than one electroscourge).",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/11/wargearOptions/2",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-defiler:wargear:4|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model’s heavy missile launcher can be replaced with one of the following:\n- 1 Hades lascannon\n- 1 heavy reaper autocannon\n- 1 electroscourge (a model cannot be equipped with more than one electroscourge)",
    "v1Value": "This model’s heavy missile launcher can be replaced with one of the following: 1 Hades lascannon; 1 heavy reaper autocannon; 1 electroscourge (a model cannot be equipped with more than one electroscourge).",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/11/wargearOptions/3",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-defiler:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Defiler\nThis model is equipped with: 1 Hades battle cannon; 2 excruciator cannons; 1 heavy missile launcher; 1 heavy baleflamer; 1 shearing claws",
    "v1Value": "1 Defiler. This model is equipped with: 1 Hades battle cannon; 2 excruciator cannons; 1 heavy missile launcher; 1 heavy baleflamer; 1 shearing claws.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/11/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-defiler:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
    "v1Value": "DAMAGED: 1-6 WOUNDS REMAINING. While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/11/sections/2",
      "reason": "The same 1-6 wound threshold appears in the V1 heading and body. Only heading placement differs."
    }
  },
  "datasheet-foetid-bloat-drone:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Foetid Bloat-drone\nThis model is equipped with: fleshmower; plague probe.",
    "v1Value": "1 Foetid Bloat-drone. This model is equipped with: fleshmower; plague probe.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/12/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-foetid-bloat-drone-with-heavy-blight-launcher:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Foetid Bloat-drone\nThis model is equipped with: heavy blight launcher; plague probe.",
    "v1Value": "1 Foetid Bloat-drone. This model is equipped with: heavy blight launcher; plague probe.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/13/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-foul-blightspawn:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Foul Blightspawn\nThis model is equipped with: plague sprayer; close combat weapon.",
    "v1Value": "1 Foul Blightspawn. This model is equipped with: plague sprayer; close combat weapon.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/14/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-foul-blightspawn:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following unit:\n- PLAGUE MARINES\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "v1Value": "This model can be attached to the following units: Plague Marines.\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/14/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-great-unclean-one:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Great Unclean One\nThis model is equipped with: plague flail; putrid vomit; bilesword.",
    "v1Value": "1 Great Unclean One. This model is equipped with: plague flail; putrid vomit; bilesword.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/15/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-helbrute:wargear:1|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model’s multi-melta can be replaced with one of the following:\n- 1 plasma cannon\n- 1 twin autocannon\n- 1 twin lascannon\n- 1 twin heavy bolter\n- 1 additional Helbrute fist",
    "v1Value": "This model’s multi-melta can be replaced with one of the following: 1 plasma cannon; 1 twin autocannon; 1 twin lascannon; 1 twin heavy bolter; 1 additional Helbrute fist.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/16/wargearOptions/0",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-helbrute:wargear:2|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "1 of this model’s Helbrute fists can be replaced with 1 missile launcher",
    "v1Value": "1 of this model’s Helbrute fists can be replaced with 1 missile launcher.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/16/wargearOptions/1",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-helbrute:wargear:3|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "1 of this model’s Helbrute fists can be replaced with one of the following:\n- 1 Helbrute hammer\n- 1 power scourge",
    "v1Value": "1 of this model’s Helbrute fists can be replaced with one of the following: 1 Helbrute hammer; 1 power scourge.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/16/wargearOptions/2",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-helbrute:wargear:4|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "For each Helbrute fist this model is equipped with, it can be equipped with one of the following:\n- 1 combi-bolter*\n- 1 heavy flamer*",
    "v1Value": "For each Helbrute fist this model is equipped with, it can be equipped with one of the following: 1 combi-bolter; 1 heavy flamer. That Helbrute fist cannot then be replaced.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/16/wargearOptions/3",
      "reason": "The pinned Helbrute HTML binds the starred combi-bolter/heavy-flamer choices to the cannot-replace footnote. V1 inlines that exact restriction."
    }
  },
  "datasheet-helbrute:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Helbrute\nThis model is equipped with: multi-melta; Helbrute fist; close combat weapon.",
    "v1Value": "1 Helbrute. This model is equipped with: multi-melta; Helbrute fist; close combat weapon.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/16/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-helbrute:raw-dsOptionsComment:1|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "* That Helbrute fist cannot then be replaced.",
    "v1Value": "That Helbrute fist cannot then be replaced.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "raw:Helbrute.html:character-offset:86584",
      "reason": "The asterisk is a footnote marker. V1 preserves the same cannot-replace restriction inline."
    }
  },
  "datasheet-icon-bearer:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Icon Bearer\nThis model is equipped with: boltgun; plague knife.",
    "v1Value": "1 Icon Bearer. This model is equipped with: boltgun; plague knife.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/17/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-icon-bearer:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following unit:\n- PLAGUE MARINES\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same Leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "v1Value": "This model can be attached to the following units: Plague Marines.\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same Leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/17/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-lord-of-contagion:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Lord of Contagion\nThis model is equipped with: manreaper.",
    "v1Value": "1 Lord of Contagion. This model is equipped with: manreaper.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/18/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-lord-of-contagion:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following units:\n- BLIGHTLORD TERMINATORS\n- DEATHSHROUD TERMINATORS",
    "v1Value": "This model can be attached to the following units: Blightlord Terminators; Deathshroud Terminators.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/18/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-lord-of-poxes:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Lord of Poxes\nThis model is equipped with: plasma pistol; great plague blade.",
    "v1Value": "1 Lord of Poxes. This model is equipped with: plasma pistol; great plague blade.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/19/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-lord-of-poxes:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following unit:\n- PLAGUE MARINES",
    "v1Value": "This model can be attached to the following units: Plague Marines.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/19/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-lord-of-virulence:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Lord of Virulence\nThis model is equipped with: twin plague spewer; power fist.",
    "v1Value": "1 Lord of Virulence. This model is equipped with: twin plague spewer; power fist.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/20/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-lord-of-virulence:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following units:\n- BLIGHTLORD TERMINATORS\n- DEATHSHROUD TERMINATORS",
    "v1Value": "This model can be attached to the following units: Blightlord Terminators; Deathshroud Terminators.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/20/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-malignant-plaguecaster:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Malignant Plaguecaster\nThis model is equipped with: bolt pistol; Plague Wind; corrupted staff.",
    "v1Value": "1 Malignant Plaguecaster. This model is equipped with: bolt pistol; Plague Wind; corrupted staff.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/21/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-malignant-plaguecaster:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following units:\n- PLAGUE MARINES\n- POXWALKERS",
    "v1Value": "This model can be attached to the following units: Plague Marines; Poxwalkers.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/21/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-miasmic-malignifier:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "Putrescent Fog (Aura): Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" of this model.\nDiseased Cover: Each time a ranged attack is allocated to a model, if that model is not fully visible to the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack.\nFortification: While an enemy unit is only within Engagement Range of one or more FORTIFICATIONS from your army:\n- That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n- Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so.",
    "v1Value": "Putrescent Fog (Aura): Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" of this model.\nDiseased Cover: Each time a ranged attack is allocated to a model, if that model is not fully visible to the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack.\nFortification: While an enemy unit is only within Engagement Range of one or more FORTIFICATIONS from your army:\n• That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n• Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/22/sections/1",
      "reason": "Minus and bullet list markers differ. Every Fortification exception and numeral remains identical."
    }
  },
  "datasheet-miasmic-malignifier:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Miasmic Malignifier\nThis model is equipped with: miasmic gouts.",
    "v1Value": "1 Miasmic Malignifier. This model is equipped with: miasmic gouts.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/22/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-mortarion:section:1|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "Diseased Influence: Just after an enemy unit ends a Normal, Advance or Fall Back move within 8\" of a friendly DEATH GUARD unit that is within 6\" of this model, if that DEATH GUARD unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 5\".\nBoon of Death: In the Fight phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. If it does, until the end of the phase, each time a model in that DEATH GUARD unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 2+, do not remove it from play; that destroyed model can fight after the attacking unit has finished making its attacks, and it is then removed from play.\nInflamed Reprisal: In your opponent’s Shooting phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. If it does, after the attacking unit has finished making its attacks, that Death Guard unit can shoot as if it were your Shooting phase, but when resolving those attacks, worsen the BS characteristic of that attack by 1 and it can only target that enemy unit (and only if it is an eligible target).",
    "v1Value": "Diseased Influence: Just after an enemy unit ends a Normal, Advance or Fall Back move within 8\" of a friendly DEATH GUARD unit that is within 6\" of this model, if that DEATH GUARD unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 5\".\nBoon of Death: In the Fight phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. Until the end of the phase, each time a model in that unit is destroyed by a melee attack, if it has not fought this phase, roll one D6. On a 2+, do not remove it from play; it can fight after the attacking unit has finished its attacks, then it is removed from play.\nInflamed Reprisal: In your opponent’s Shooting phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. If it does, after the attacking unit has finished making its attacks, that DEATH GUARD unit can shoot as if it were your Shooting phase, but when resolving those attacks, worsen the BS characteristic of that attack by 1 and it can only target that enemy unit (and only if it is an eligible target).",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/23/sections/0",
      "reason": "The three choices retain the same 8 inch, 6 inch, 5 inch and 2+ values, timing and recipients. Boon of Death uses pronouns for the same destroyed model in the selected friendly Death Guard unit."
    },
    "alternativeSourceValues": [
      "Diseased Influence: Just after an enemy unit ends a Normal, Advance or Fall Back move within 8\" of a friendly DEATH GUARD unit that is within 6\" of this model, if that DEATH GUARD unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 5\".\nBoon of Death: In the Fight phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. If it does, until the end of the phase, each time a model in that DEATH GUARD unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 2+, do not remove it from play; that destroyed model can fight after the attacking unit has finished making its attacks, and it is then removed from play.\nInflamed Reprisal: In your opponent’s Shooting phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. If it does, after the attacking unit has finished making its attacks, that DEATH GUARD unit can shoot as if it were your Shooting phase, but when resolving those attacks, worsen the BS characteristic of that attack by 1 and it can only target that enemy unit (and only if it is an eligible target)."
    ]
  },
  "datasheet-mortarion:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "Lord of the Death Guard: Once per turn, this model can use one of the Lord of the Death Guard abilities (see left).\nHost of Plagues: At the end of your Movement phase, roll one D6 for each enemy unit within 6\" of this model, adding 1 to the result if that enemy unit is Afflicted: on a 3+, that enemy unit suffers D3 mortal wounds.",
    "v1Value": "Lord of the Death Guard: Once per turn, this model can use one of the following abilities. Diseased Influence: Just after an enemy unit ends a Normal, Advance or Fall Back move within 8\" of a friendly DEATH GUARD unit that is within 6\" of this model, if that DEATH GUARD unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 5\". Boon of Death: In the Fight phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. Until the end of the phase, each time a model in that unit is destroyed by a melee attack, if it has not fought this phase, roll one D6. On a 2+, do not remove it from play; it can fight after the attacking unit has finished its attacks, then it is removed from play. Inflamed Reprisal: In your opponent’s Shooting phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. If it does, after the attacking unit has finished making its attacks, that DEATH GUARD unit can shoot as if it were your Shooting phase, but when resolving those attacks, worsen the BS characteristic of that attack by 1 and it can only target that enemy unit (and only if it is an eligible target).\nHost of Plagues: At the end of your Movement phase, roll one D6 for each enemy unit within 6\" of this model, adding 1 to the result if that enemy unit is Afflicted: on a 3+, that enemy unit suffers D3 mortal wounds.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/23/sections/2",
      "reason": "V1 coalesces the separately captured choices into Lord of the Death Guard. The once-per-turn choice limit and Host of Plagues remain unchanged."
    }
  },
  "datasheet-mortarion:section:4|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Mortarion – EPIC HERO\nThis model is equipped with: Lantern; Rotwind; Silence.",
    "v1Value": "1 Mortarion – EPIC HERO. This model is equipped with: Lantern; Rotwind; Silence.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/23/sections/3",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-myphitic-blight-hauler:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1-2 Myphitic Blight-hulers\nEvery model is equipped with: bile spurt; missile launcher; multi-melta; gnashing maw.",
    "v1Value": "1-2 Myphitic Blight-haulers. Every model is equipped with: bile spurt; missile launcher; multi-melta; gnashing maw.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/24/sections/1",
      "reason": "The accepted source-defects ledger identifies the Blight-hulers spelling error. The unit identity, 1-2 composition and equipment remain unchanged."
    }
  },
  "datasheet-noxious-blightbringer:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Noxious Blightbringer\nThis model is equipped with: plasma pistol; cursed plague bell.",
    "v1Value": "1 Noxious Blightbringer. This model is equipped with: plasma pistol; cursed plague bell.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/25/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-noxious-blightbringer:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following units:\n- PLAGUE MARINES\n- POXWALKERS\nYou can attach this model to a PLAGUE MARINES or POXWALKERS unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same Leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "v1Value": "This model can be attached to the following units: Plague Marines; Poxwalkers.\nYou can attach this model to a PLAGUE MARINES or POXWALKERS unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same Leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/25/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-nurglings:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 3-6 Nurgling Swarms\nEvery model is equipped with: diseased claws and teeth.",
    "v1Value": "3-6 Nurgling Swarms. Every model is equipped with: diseased claws and teeth.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/26/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-plague-drones:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Plaguebringer\n- 2-5 Plague Drones\nEvery model is equipped with: death’s heads; foul mouthparts; plaguesword.",
    "v1Value": "1 Plaguebringer; 2-5 Plague Drones. Every model is equipped with: death’s heads; foul mouthparts; plaguesword.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/27/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-plague-marines:wargear:1|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "The Plague Champion’s boltgun can be replaced with one of the following:\n- 1 bolt pistol\n- 1 plasma gun\n- 1 plasma pistol",
    "v1Value": "The Plague Champion’s boltgun can be replaced with one of the following: 1 bolt pistol; 1 plasma gun; 1 plasma pistol.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/28/wargearOptions/0",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-plague-marines:wargear:2|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "The Plague Champion’s plague knives can be replaced with one of the following:\n- 1 bubotic weapons\n- 1 power fist",
    "v1Value": "The Plague Champion’s plague knives can be replaced with one of the following: 1 bubotic weapons; 1 power fist.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/28/wargearOptions/1",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-plague-marines:wargear:5|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "For every 5 models in this unit, 1 Plague Marine’s boltgun can be replaced with one of the following:\n- 1 meltagun\n- 1 plague belcher\n- 1 plasma gun",
    "v1Value": "For every 5 models in this unit, 1 Plague Marine’s boltgun can be replaced with one of the following: 1 meltagun; 1 plague belcher; 1 plasma gun.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/28/wargearOptions/4",
      "reason": "The source uses bullet choices; V1 uses semicolons and a trailing period. Exact quantities, equipment alternatives, replacement conditions and exclusions remain unchanged."
    }
  },
  "datasheet-plague-marines:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Plague Champion\n- 4-9 Plague Marines\nEvery model is equipped with: boltgun; plague knives.",
    "v1Value": "1 Plague Champion; 4-9 Plague Marines. Every model is equipped with: boltgun; plague knives.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/28/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-plague-surgeon:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Plague Surgeon\nThis model is equipped with: bolt pistol; balesword.",
    "v1Value": "1 Plague Surgeon. This model is equipped with: bolt pistol; balesword.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/29/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-plague-surgeon:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following unit:\n- PLAGUE MARINES\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same Leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "v1Value": "This model can be attached to the following units: Plague Marines.\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same Leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/29/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-plaguebearers:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Plagueridden\n- 9 Plaguebearers\nEvery model is equipped with: plaguesword.",
    "v1Value": "1 Plagueridden; 9 Plaguebearers. Every model is equipped with: plaguesword.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/30/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-plagueburst-crawler:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Plagueburst Crawler\nThis model is equipped with: 2 entropy cannons; heavy slugger; Plagueburst mortar; armoured tracks.",
    "v1Value": "1 Plagueburst Crawler. This model is equipped with: 2 entropy cannons; heavy slugger; Plagueburst mortar; armoured tracks.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/31/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-poxwalkers:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 10-20 Poxwalkers\nEvery model is equipped with: improvised weapon.",
    "v1Value": "10-20 Poxwalkers. Every model is equipped with: improvised weapon.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/32/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-rotigus:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Rotigus – EPIC HERO\nThis model is equipped with: streams of brackish filth; gnarlrod.",
    "v1Value": "1 Rotigus – EPIC HERO. This model is equipped with: streams of brackish filth; gnarlrod.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/33/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-tallyman:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Tallyman\nThis model is equipped with: plasma pistol; close combat weapon.",
    "v1Value": "1 Tallyman. This model is equipped with: plasma pistol; close combat weapon.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/34/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-tallyman:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following unit:\n- PLAGUE MARINES\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "v1Value": "This model can be attached to the following units: Plague Marines.\nYou can attach this model to a PLAGUE MARINES unit, even if one other Leader unit has already been attached to it (you cannot attach more than one of the same leader to the same unit). If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/34/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-typhus:section:2|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- 1 Typhus – EPIC HERO\nThis model is equipped with: Lakrimae.",
    "v1Value": "1 Typhus – EPIC HERO. This model is equipped with: Lakrimae.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/35/sections/1",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "datasheet-typhus:section:3|blocks/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "This model can be attached to the following units:\n- BLIGHTLORD TERMINATORS\n- DEATHSHROUD TERMINATORS\n- POXWALKERS",
    "v1Value": "This model can be attached to the following units: Blightlord Terminators; Deathshroud Terminators; Poxwalkers.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/datasheets/35/sections/2",
      "reason": "The source uses bullet model rows or Leader lists. V1 uses inline punctuation. Exact model counts, equipment, eligibility and attachment exceptions remain unchanged."
    }
  },
  "army-rule-nurgles-gift:contagion-range|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more DEATH GUARD models from your army, it is Afflicted (see below).\nCONTAGION RANGE\nContagion Range changes over the course of the battle:\nContagion Range cannot be greater than 12\" after modifiers.",
    "v1Value": "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more DEATH GUARD models from your army, it is Afflicted.\nContagion Range cannot be greater than 12\" after modifiers.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/armyRules/0/components/0",
      "reason": "V1 omits the see-below label and Contagion Range heading. The Afflicted condition and 12 inch cap agree. The numeric round table is compared separately."
    }
  },
  "army-rule-nurgles-gift:scabrous-soulrot|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "Worsen the Move, Leadership, and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model’s Objective Control characteristic to a minimum of 1).",
    "v1Value": "Worsen the Move, Leadership and Objective Control characteristics of models in this unit by 1. This rule can only worsen a model’s Objective Control characteristic to a minimum of 1.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/armyRules/0/components/4",
      "reason": "Comma, parentheses and sentence placement differ. Both texts apply -1 Move, Leadership and Objective Control with the same minimum Objective Control of 1."
    }
  },
  "detachment-virulent-vectorium:stratagem:4|lines/1/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "One DEATH GUARD model your army that has lost one or more wounds.",
    "v1Value": "One DEATH GUARD model from your army that has lost one or more wounds.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/0/stratagems/3",
      "reason": "The accepted source-defects ledger identifies the missing connective from. The same Death Guard model, army ownership and lost-wound condition remain explicit."
    }
  },
  "detachment-shamblerot-vectorium:rule|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "In your Command phase in each of the following battle rounds, depending on your chosen battle size, add a new POXWALKERS unit with a Starting Strength of 10 to your army, in Strategic Reserves.\nBATTLE SIZEBATTLE ROUNDSIncursion2,3Strike Force2, 3, 4Onslaught2, 3, 4, 5\nKEYWORDS\nPOXWALKERS units from your army gain the BATTLELINE keyword.",
    "v1Value": "In your Command phase in each of the following battle rounds, depending on your chosen battle size, add a new POXWALKERS unit with a Starting Strength of 10 to your army, in Strategic Reserves.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/1/rule",
      "reason": "The V1 parent rule also contains the Poxwalkers BATTLELINE paragraph and every battle-size round mapping. The source embeds flattened table markup in its text."
    }
  },
  "detachment-shamblerot-vectorium:rule|tables": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": [
      {
        "sourceId": "detachment-shamblerot-vectorium:rule:table:1",
        "rows": [
          [
            "BATTLE SIZEBATTLE ROUNDSIncursion2,3Strike Force2, 3, 4Onslaught2, 3, 4, 5"
          ],
          [
            "BATTLE SIZE",
            "BATTLE ROUNDS"
          ],
          [
            "Incursion",
            "2,3"
          ],
          [
            "Strike Force",
            "2, 3, 4"
          ],
          [
            "Onslaught",
            "2, 3, 4, 5"
          ]
        ]
      },
      {
        "sourceId": "detachment-shamblerot-vectorium:rule:table:2",
        "rows": [
          [
            "BATTLE SIZE",
            "BATTLE ROUNDS"
          ],
          [
            "Incursion",
            "2,3"
          ],
          [
            "Strike Force",
            "2, 3, 4"
          ],
          [
            "Onslaught",
            "2, 3, 4, 5"
          ]
        ]
      }
    ],
    "v1Value": [
      {
        "type": "table",
        "columns": [
          "Battle Size",
          "Battle Rounds"
        ],
        "rows": [
          [
            "Incursion",
            "2, 3"
          ],
          [
            "Strike Force",
            "2, 3, 4"
          ],
          [
            "Onslaught",
            "2, 3, 4, 5"
          ]
        ]
      }
    ],
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/1/rule",
      "reason": "The V1 parent rule also contains the Poxwalkers BATTLELINE paragraph and every battle-size round mapping. The source embeds flattened table markup in its text."
    }
  },
  "detachment-tallyband-summoners:rule|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "While a PLAGUE LEGIONS unit from your army is within 7\" of one or more DEATH GUARD units from your army, that PLAGUE LEGIONS unit has the Nurgle’s Gift ability.\nWhile a DEATH GUARD unit from your army is within 7\" of one or more PLAGUE LEGIONS units from your army, add 3\" to that DEATH GUARD units Contagion Range.\nPLAGUE LEGIONS\nYou can include PLAGUE LEGIONS units in your army, even though they do not have the DEATH GUARD Faction keyword. The combined points cost of such units you can include in your army is:\n- Incursion: Up to 500 pts\n- Strike Force: Up to 1000 pts\n- Onslaught: Up to 1500 pts\nNo PLAGUE LEGIONS models from your army can be your WARLORD.",
    "v1Value": "While a PLAGUE LEGIONS unit from your army is within 7\" of one or more DEATH GUARD units from your army, that PLAGUE LEGIONS unit has the Nurgle’s Gift ability. While a DEATH GUARD unit from your army is within 7\" of one or more PLAGUE LEGIONS units from your army, add 3\" to that DEATH GUARD unit’s Contagion Range.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/2/rule",
      "reason": "The V1 Plague Legions subsection retains the 500/1000/1500 point caps and Warlord restriction. Both auras retain their 7 inch and +3 inch values."
    }
  },
  "detachment-mortarions-hammer:rule|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "At the start of the battle round, select a number of enemy units more than 12\" away from every model from your army that is on the battlefield. Until the end of the battle round, those enemy units are Afflicted. The maximum number of units you can select in this way depends on the battle size, as shown below.\nBATTLE SIZEUNITSIncursion1Strike Force2Onslaught3",
    "v1Value": "At the start of the battle round, select a number of enemy units more than 12\" away from every model from your army that is on the battlefield. Until the end of the battle round, those enemy units are Afflicted. The maximum number of units you can select in this way depends on the battle size, as shown below.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/4/rule",
      "reason": "The V1 separate table retains Incursion 1, Strike Force 2 and Onslaught 3. Source text also includes the flattened table markup."
    }
  },
  "detachment-mortarions-hammer:rule|tables": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": [
      {
        "sourceId": "detachment-mortarions-hammer:rule:table:1",
        "rows": [
          [
            "BATTLE SIZEUNITSIncursion1Strike Force2Onslaught3"
          ],
          [
            "BATTLE SIZE",
            "UNITS"
          ],
          [
            "Incursion",
            "1"
          ],
          [
            "Strike Force",
            "2"
          ],
          [
            "Onslaught",
            "3"
          ]
        ]
      },
      {
        "sourceId": "detachment-mortarions-hammer:rule:table:2",
        "rows": [
          [
            "BATTLE SIZE",
            "UNITS"
          ],
          [
            "Incursion",
            "1"
          ],
          [
            "Strike Force",
            "2"
          ],
          [
            "Onslaught",
            "3"
          ]
        ]
      }
    ],
    "v1Value": [
      {
        "type": "table",
        "columns": [
          "Battle Size",
          "Units"
        ],
        "rows": [
          [
            "Incursion",
            "1"
          ],
          [
            "Strike Force",
            "2"
          ],
          [
            "Onslaught",
            "3"
          ]
        ]
      }
    ],
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/4/rule",
      "reason": "The V1 separate table retains Incursion 1, Strike Force 2 and Onslaught 3. Source text also includes the flattened table markup."
    }
  },
  "detachment-champions-of-contagion:stratagem:5|lines/2/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "Select one other friendly DEATH GUARD unit (excluding Battle-shocked units and Attached units that already have two Leader units or one of your CHARACTER units leading it] within 2\" horizontally and 5\" vertically of your unit that your unit can lead (as described in the Leader section of its datasheet]. Your unit attaches to that unit as a Leader. Change that unit’s Starting Strength accordingly.",
    "v1Value": "Select one other friendly DEATH GUARD unit (excluding Battle-shocked units and Attached units that already have two Leader units or one of your CHARACTER units leading it) within 2\" horizontally and 5\" vertically of your unit that your unit can lead (as described in the Leader section of its datasheet). Your unit attaches to that unit as a Leader. Change that unit’s Starting Strength accordingly.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/5/stratagems/4",
      "reason": "Closing brackets replace parentheses in the source. Leader capacity, exclusions, horizontal 2 inch and vertical 5 inch restrictions remain unchanged."
    }
  },
  "detachment-paragons-of-putrescence:enhancement:2|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "DEATH GUARD INFANTRY model only. (Once per battle, per army) In your Command phase, you can use this ability. If you do, select one of the Plague listed in Nurgle’s Gift. Enemy units within Contagion Range of this unit also have the effect of that Plague in addition to your army’s chosen Plague until the end of the battle.",
    "v1Value": "DEATH GUARD INFANTRY model only. (Once per battle, per army) In your Command phase, you can use this ability. If you do, select one of the Plagues listed in Nurgle’s Gift. Enemy units within Contagion Range of this unit also have the effect of that Plague in addition to your army’s chosen Plague until the end of the battle.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/6/enhancements/1",
      "reason": "Plague/Plagues is a grammatical difference. Both select one plague from Nurgles Gift, once per battle per army, with the same timing and recipients."
    }
  },
  "detachment-contagion-engines:rule|text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "- Friendly FOETID BLOAT-DRONE/FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER/HELBRUTE/MYPHITIC BLIGHT-HAULER units have CONTAGION ENGINE.\n- Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT].\nThis detachment has the ENGINES tag and cannot be taken with another ENGINES detachment.",
    "v1Value": "Friendly FOETID BLOAT-DRONE/FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER/HELBRUTE/MYPHITIC BLIGHT-HAULER units have CONTAGION ENGINE. Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT]. This detachment has the ENGINES tag and cannot be taken with another ENGINES detachment.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/7/rule",
      "reason": "Only bullet markers differ. The four eligible unit names, CONTAGION ENGINE keyword, ranged ASSAULT and ENGINES restriction agree."
    }
  },
  "detachment-contagion-engines:stratagem:3|lines/2/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "When an enemy unit engaged with your unit is selected to make a fall-back move, roll one D6: - On a 1, that enemy unit suffers 1 mortal wound. - On a 2-5, that enemy unit suffers D3 mortal wounds. - On a 6, that enemy unit suffers 3 mortal wounds.",
    "v1Value": "When an enemy unit engaged with your unit is selected to make a fall-back move, roll one D6:\n• On a 1, that enemy unit suffers 1 mortal wound.\n• On a 2-5, that enemy unit suffers D3 mortal wounds.\n• On a 6, that enemy unit suffers 3 mortal wounds.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/7/stratagems/2",
      "reason": "Only list formatting differs. Both retain the Fall Back trigger and the 1 / D3 / 3 mortal-wound outcomes for rolls 1 / 2-5 / 6."
    }
  },
  "detachment-flyblown-host:stratagem:2|lines/2/text": {
    "classification": "REPRESENTATION_ONLY",
    "sourceValue": "Your unit’s ranged attacks: - Can re-roll hit rolls of 1. - That target a unit within half range, can re-roll wound rolls of 1.",
    "v1Value": "Your unit’s ranged attacks:\n• Can re-roll hit rolls of 1.\n• That target a unit within half range, can re-roll wound rolls of 1.",
    "proof": {
      "sourceId": "dg-waha-2026-09-25",
      "sourcePointer": "/detachments/8/stratagems/1",
      "reason": "Only list formatting differs. Both retain ranged Hit rolls of 1 and half-range Wound rolls of 1 as reroll conditions."
    }
  }
});

// Reviewed comparison-only identities, frozen against the accepted source census.
const PINNED_SOURCE_BOUND_V1_INVENTORY = Object.freeze({
  "sectionIds": [
    "beasts-of-nurgle-abilities",
    "beasts-of-nurgle-composition",
    "beasts-of-nurgle-keywords",
    "biologus-putrifier-abilities",
    "biologus-putrifier-composition",
    "biologus-putrifier-keywords",
    "biologus-putrifier-leader",
    "blightlord-terminators-abilities",
    "blightlord-terminators-composition",
    "blightlord-terminators-keywords",
    "blightlord-terminators-wargear-options",
    "chaos-land-raider-abilities",
    "chaos-land-raider-composition",
    "chaos-land-raider-damaged",
    "chaos-land-raider-keywords",
    "chaos-land-raider-transport",
    "chaos-land-raider-wargear-options",
    "chaos-predator-annihilator-abilities",
    "chaos-predator-annihilator-composition",
    "chaos-predator-annihilator-damaged",
    "chaos-predator-annihilator-keywords",
    "chaos-predator-annihilator-wargear-options",
    "chaos-predator-destructor-abilities",
    "chaos-predator-destructor-composition",
    "chaos-predator-destructor-damaged",
    "chaos-predator-destructor-keywords",
    "chaos-predator-destructor-wargear-options",
    "chaos-rhino-abilities",
    "chaos-rhino-composition",
    "chaos-rhino-keywords",
    "chaos-rhino-transport",
    "chaos-rhino-wargear-options",
    "chaos-spawn-abilities",
    "chaos-spawn-composition",
    "chaos-spawn-keywords",
    "daemon-prince-of-nurgle-abilities",
    "daemon-prince-of-nurgle-composition",
    "daemon-prince-of-nurgle-keywords",
    "daemon-prince-of-nurgle-with-wings-abilities",
    "daemon-prince-of-nurgle-with-wings-composition",
    "daemon-prince-of-nurgle-with-wings-keywords",
    "deathshroud-terminators-abilities",
    "deathshroud-terminators-composition",
    "deathshroud-terminators-keywords",
    "deathshroud-terminators-wargear-abilities",
    "deathshroud-terminators-wargear-options",
    "defiler-abilities",
    "defiler-composition",
    "defiler-damaged",
    "defiler-keywords",
    "defiler-wargear",
    "foetid-bloat-drone-abilities",
    "foetid-bloat-drone-composition",
    "foetid-bloat-drone-keywords",
    "foetid-bloat-drone-wargear-options",
    "foetid-bloat-drone-with-heavy-blight-launcher-abilities",
    "foetid-bloat-drone-with-heavy-blight-launcher-composition",
    "foetid-bloat-drone-with-heavy-blight-launcher-keywords",
    "foul-blightspawn-abilities",
    "foul-blightspawn-composition",
    "foul-blightspawn-keywords",
    "foul-blightspawn-leader",
    "great-unclean-one-abilities",
    "great-unclean-one-composition",
    "great-unclean-one-damaged",
    "great-unclean-one-keywords",
    "great-unclean-one-wargear-options",
    "helbrute-abilities",
    "helbrute-composition",
    "helbrute-keywords",
    "helbrute-wargear-options",
    "icon-bearer-abilities",
    "icon-bearer-composition",
    "icon-bearer-keywords",
    "icon-bearer-leader",
    "lord-of-contagion-abilities",
    "lord-of-contagion-composition",
    "lord-of-contagion-keywords",
    "lord-of-contagion-leader",
    "lord-of-poxes-abilities",
    "lord-of-poxes-composition",
    "lord-of-poxes-keywords",
    "lord-of-poxes-leader",
    "lord-of-virulence-abilities",
    "lord-of-virulence-composition",
    "lord-of-virulence-keywords",
    "lord-of-virulence-leader",
    "malignant-plaguecaster-abilities",
    "malignant-plaguecaster-composition",
    "malignant-plaguecaster-keywords",
    "malignant-plaguecaster-leader",
    "miasmic-malignifier-abilities",
    "miasmic-malignifier-composition",
    "miasmic-malignifier-keywords",
    "mortarion-abilities",
    "mortarion-composition",
    "mortarion-damaged",
    "mortarion-keywords",
    "myphitic-blight-hauler-abilities",
    "myphitic-blight-hauler-composition",
    "myphitic-blight-hauler-keywords",
    "noxious-blightbringer-abilities",
    "noxious-blightbringer-composition",
    "noxious-blightbringer-keywords",
    "noxious-blightbringer-leader",
    "nurglings-abilities",
    "nurglings-composition",
    "nurglings-keywords",
    "plague-drones-abilities",
    "plague-drones-composition",
    "plague-drones-keywords",
    "plague-drones-wargear-abilities",
    "plague-drones-wargear-options",
    "plague-marines-abilities",
    "plague-marines-composition",
    "plague-marines-keywords",
    "plague-marines-wargear-abilities",
    "plague-marines-wargear-options",
    "plague-surgeon-abilities",
    "plague-surgeon-composition",
    "plague-surgeon-keywords",
    "plague-surgeon-leader",
    "plaguebearers-abilities",
    "plaguebearers-composition",
    "plaguebearers-keywords",
    "plaguebearers-wargear-abilities",
    "plaguebearers-wargear-options",
    "plagueburst-crawler-abilities",
    "plagueburst-crawler-composition",
    "plagueburst-crawler-damaged",
    "plagueburst-crawler-keywords",
    "plagueburst-crawler-wargear-options",
    "poxwalkers-abilities",
    "poxwalkers-composition",
    "poxwalkers-keywords",
    "rotigus-abilities",
    "rotigus-composition",
    "rotigus-damaged",
    "rotigus-keywords",
    "tallyman-abilities",
    "tallyman-composition",
    "tallyman-keywords",
    "tallyman-leader",
    "typhus-abilities",
    "typhus-composition",
    "typhus-keywords",
    "typhus-leader"
  ],
  "abilityIds": [
    "beasts-of-nurgle-ability-core",
    "beasts-of-nurgle-ability-faction",
    "beasts-of-nurgle-ability-grotesque-regeneration",
    "biologus-putrifier-ability-core",
    "biologus-putrifier-ability-extraction-of-fresh-disease",
    "biologus-putrifier-ability-faction",
    "biologus-putrifier-ability-foul-infusion",
    "blightlord-terminators-ability-blistering-fusillade",
    "blightlord-terminators-ability-core",
    "blightlord-terminators-ability-faction",
    "chaos-land-raider-ability-assault-ramp",
    "chaos-land-raider-ability-core",
    "chaos-land-raider-ability-faction",
    "chaos-predator-annihilator-ability-core",
    "chaos-predator-annihilator-ability-faction",
    "chaos-predator-annihilator-ability-metalophagic-infection",
    "chaos-predator-destructor-ability-core",
    "chaos-predator-destructor-ability-faction",
    "chaos-predator-destructor-ability-hail-of-corrosive-disease",
    "chaos-rhino-ability-core",
    "chaos-rhino-ability-faction",
    "chaos-rhino-ability-fire-support",
    "chaos-spawn-ability-core",
    "chaos-spawn-ability-faction",
    "chaos-spawn-ability-lethal-ichor",
    "daemon-prince-of-nurgle-ability-core",
    "daemon-prince-of-nurgle-ability-death-guard-defenders",
    "daemon-prince-of-nurgle-ability-faction",
    "daemon-prince-of-nurgle-ability-fevered-strategist",
    "daemon-prince-of-nurgle-ability-miasma-of-pestilence-aura",
    "daemon-prince-of-nurgle-with-wings-ability-core",
    "daemon-prince-of-nurgle-with-wings-ability-enfeebling-miasma-aura",
    "daemon-prince-of-nurgle-with-wings-ability-faction",
    "daemon-prince-of-nurgle-with-wings-ability-horrifying-visage",
    "deathshroud-terminators-ability-core",
    "deathshroud-terminators-ability-death-approaches",
    "deathshroud-terminators-ability-faction",
    "deathshroud-terminators-ability-icon-of-despair-aura",
    "deathshroud-terminators-ability-silent-bodyguard",
    "defiler-ability-barrage-of-filth",
    "defiler-ability-core",
    "defiler-ability-faction",
    "defiler-ability-scuttling-walker",
    "foetid-bloat-drone-ability-core",
    "foetid-bloat-drone-ability-faction",
    "foetid-bloat-drone-ability-hovering-death",
    "foetid-bloat-drone-with-heavy-blight-launcher-ability-core",
    "foetid-bloat-drone-with-heavy-blight-launcher-ability-explosive-blight",
    "foetid-bloat-drone-with-heavy-blight-launcher-ability-faction",
    "foul-blightspawn-ability-blinding-spray",
    "foul-blightspawn-ability-core",
    "foul-blightspawn-ability-faction",
    "foul-blightspawn-ability-putrefying-stink",
    "great-unclean-one-ability-core",
    "great-unclean-one-ability-daemon-lord-of-nurgle-aura",
    "great-unclean-one-ability-faction",
    "great-unclean-one-ability-nurgles-rot-psychic",
    "great-unclean-one-ability-reverberating-summons",
    "helbrute-ability-core",
    "helbrute-ability-diseased-malice",
    "helbrute-ability-faction",
    "helbrute-ability-froth-spattered-frenzy",
    "icon-bearer-ability-blessed-icon-of-disease",
    "icon-bearer-ability-core",
    "icon-bearer-ability-faction",
    "icon-bearer-ability-unclean-icon",
    "lord-of-contagion-ability-core",
    "lord-of-contagion-ability-faction",
    "lord-of-contagion-ability-unholy-resilience",
    "lord-of-contagion-ability-vector-of-disease",
    "lord-of-poxes-ability-core",
    "lord-of-poxes-ability-faction",
    "lord-of-poxes-ability-gift-of-poxes",
    "lord-of-poxes-ability-shroud-of-disease",
    "lord-of-virulence-ability-blight-bombardment",
    "lord-of-virulence-ability-core",
    "lord-of-virulence-ability-faction",
    "lord-of-virulence-ability-virulent-aura",
    "malignant-plaguecaster-ability-core",
    "malignant-plaguecaster-ability-faction",
    "malignant-plaguecaster-ability-gift-of-contagion-psychic",
    "malignant-plaguecaster-ability-pestilent-fallout-psychic",
    "miasmic-malignifier-ability-core",
    "miasmic-malignifier-ability-diseased-cover",
    "miasmic-malignifier-ability-faction",
    "miasmic-malignifier-ability-fortification",
    "miasmic-malignifier-ability-fortification-setup",
    "miasmic-malignifier-ability-putrescent-fog-aura",
    "mortarion-ability-core",
    "mortarion-ability-faction",
    "mortarion-ability-host-of-plagues",
    "mortarion-ability-lord-of-the-death-guard",
    "mortarion-ability-supreme-commander",
    "myphitic-blight-hauler-ability-core",
    "myphitic-blight-hauler-ability-faction",
    "myphitic-blight-hauler-ability-tank-hunters",
    "noxious-blightbringer-ability-core",
    "noxious-blightbringer-ability-faction",
    "noxious-blightbringer-ability-sickening-vitality",
    "noxious-blightbringer-ability-tocsin-of-misery-aura",
    "nurglings-ability-core",
    "nurglings-ability-faction",
    "nurglings-ability-mischief-makers",
    "plague-drones-ability-core",
    "plague-drones-ability-daemonic-icon",
    "plague-drones-ability-deaths-heads",
    "plague-drones-ability-faction",
    "plague-drones-ability-instrument-of-chaos",
    "plague-marines-ability-faction",
    "plague-marines-ability-icon-of-despair-aura",
    "plague-marines-ability-infused-with-the-blessings-of-nurgle",
    "plague-surgeon-ability-core",
    "plague-surgeon-ability-faction",
    "plague-surgeon-ability-inflamed-infections",
    "plague-surgeon-ability-tainted-narthecium",
    "plaguebearers-ability-core",
    "plaguebearers-ability-daemonic-icon",
    "plaguebearers-ability-faction",
    "plaguebearers-ability-infected-outbreak",
    "plaguebearers-ability-instrument-of-chaos",
    "plagueburst-crawler-ability-core",
    "plagueburst-crawler-ability-faction",
    "plagueburst-crawler-ability-spore-laced-shock-waves",
    "poxwalkers-ability-core",
    "poxwalkers-ability-curse-of-the-walking-pox",
    "poxwalkers-ability-faction",
    "rotigus-ability-core",
    "rotigus-ability-deluge-of-nurgle-aura",
    "rotigus-ability-faction",
    "rotigus-ability-virulent-blessing-psychic",
    "tallyman-ability-core",
    "tallyman-ability-faction",
    "tallyman-ability-malicious-calculations",
    "tallyman-ability-sevenfold-chant",
    "typhus-ability-core",
    "typhus-ability-eater-plague-psychic",
    "typhus-ability-faction",
    "typhus-ability-the-destroyer-hive"
  ]
});
const ERRATA_COMPARISON_BINDINGS = Object.freeze({
  "errata-1": {
    "updateId": "dg-fp-1.1-p7-contagion-range-cap",
    "owner": "contagion-range-cap"
  },
  "errata-2": {
    "updateId": "dg-fp-1.1-p7-skullsquirm-blight",
    "owner": "skullsquirm-blight"
  },
  "errata-3": {
    "updateId": "dg-fp-1.1-p7-worldblight",
    "owner": "rule-worldblight"
  },
  "errata-4": {
    "updateId": "dg-fp-1.1-p7-beckoning-blight",
    "owner": "enhancement-beckoning-blight"
  }
});
