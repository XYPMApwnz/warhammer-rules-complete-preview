import {createHash} from 'node:crypto';

/** Pinned source facts only. No V1 adapter, publication, effects or title joins. */
export function normalizeDeathGuardCorpus(corpus, {sourceId = 'dg-waha-2026-09-25', sourcePath = 'books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json', rawHubHtml, rawHubPath = 'books/death-guard/v2/sources/accepted-waha-pages/death-guard.html', rawPages = {}, normalizationSupplements = []} = {}) {
  if (corpus?.schema !== 'wh40k-waha-death-guard-corpus/v1') throw new Error('Unsupported DG pinned corpus');
  const entities = [], ids = new Set(), captureGaps = [], excludedFacts = [];
  const add = (id, kind, parentId, data, sourceRecordId, pointer) => {
    if (!id || ids.has(id)) throw new Error(`Missing or duplicate source identity: ${id}`);
    ids.add(id);
    const entity = {id, kind, ...(parentId ? {parentId} : {}), data: structuredClone(data), provenance: {sourceId, sourceRecordId, sourcePath, pointer}};
    entities.push(entity);
    return entity;
  };
  const omit = (record, keys) => Object.fromEntries(Object.entries(record).filter(([key]) => !keys.includes(key)));
  const exclusion = (record, field, pointer, reason = 'MFM_OWNED') => {
    if (Object.hasOwn(record, field)) excludedFacts.push({sourceId, sourceRecordId: record.sourceId, pointer: `${pointer}/${field}`, value: structuredClone(record[field]), reason});
  };
  const plainHtml = value => value.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<li\b[^>]*>/gi, '\n- ').replace(/<\/li>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).split('\n').map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
  const comparableText = value => String(value).replace(/[•]/g, '').replace(/(^|\s)-\s/g, '$1').replace(/\s+/g, ' ').trim();
  const rawDivs = (html, token) => {
    const values = [], openings = /<div\b[^>]*>/gi;
    for (const opening of html.matchAll(openings)) {
      const classes = opening[0].match(/\bclass=["']([^"']*)["']/i)?.[1]?.split(/\s+/) || [];
      if (!classes.includes(token)) continue;
      const tags = /<\/?div\b[^>]*>/gi; tags.lastIndex = opening.index + opening[0].length;
      let depth = 1, closing;
      while ((closing = tags.exec(html))) {depth += /^<\/div/i.test(closing[0]) ? -1 : 1; if (!depth) break;}
      if (depth) throw new Error(`Unclosed accepted raw ${token} node`);
      values.push({offset: opening.index, text: plainHtml(html.slice(opening.index + opening[0].length, closing.index))});
    }
    return values;
  };
  for (const [i, unit] of corpus.datasheets.entries()) {
    const pointer = `/datasheets/${i}`, id = unit.sourceId.replace(/^datasheet-/, 'unit-');
    if (id === unit.sourceId) throw new Error('Datasheet identity has no declared source prefix');
    const profileId = `${unit.sourceId}:profile:default`;
    add(profileId, 'PROFILE', id, unit.statline, unit.sourceId, `${pointer}/statline`);
    for (const [j, weapon] of unit.weapons.entries()) add(weapon.sourceId, 'WEAPON_PROFILE', id, omit(weapon, ['sourceId']), weapon.sourceId, `${pointer}/weapons/${j}`);
    for (const [j, option] of unit.wargearOptions.entries()) add(option.sourceId, 'WARGEAR_OPTION', id, omit(option, ['sourceId']), option.sourceId, `${pointer}/wargearOptions/${j}`);
    for (const [j, section] of unit.sections.entries()) {
      const sectionPointer = `${pointer}/sections/${j}`, blocks = [];
      for (const [k, block] of section.blocks.entries()) {
        if (section.title === 'UNIT COMPOSITION' && /^YOUR\b.*COST/i.test(block.text || '')) {
          excludedFacts.push({sourceId, sourceRecordId: section.sourceId, pointer: `${sectionPointer}/blocks/${k}`, value: structuredClone(block), reason: 'MFM_OWNED_PRICING_PANEL'});
        } else blocks.push(structuredClone(block));
      }
      add(section.sourceId, 'DATASHEET_SECTION', id, {...omit(section, ['sourceId', 'blocks']), blocks}, section.sourceId, sectionPointer);
    }
    for (const [j, reference] of unit.ruleReferences.entries()) add(reference.sourceId, 'RULE_REFERENCE', id, omit(reference, ['sourceId']), reference.sourceId, `${pointer}/ruleReferences/${j}`);
    const rawFactIds = [], page = corpus.pages.find(page => page.url === unit.url);
    if (page && Object.hasOwn(rawPages, page.file)) {
      const raw = Buffer.isBuffer(rawPages[page.file]) ? rawPages[page.file] : Buffer.from(rawPages[page.file]);
      if (createHash('sha256').update(raw).digest('hex').toUpperCase() !== page.sha256.toUpperCase()) throw new Error(`Raw ${page.file} does not match pinned source`);
      const html = raw.toString('utf8'), start = html.search(/<div\b[^>]*class=["'][^"']*\bdsOuterFrame\b[^"']*["']/i), end = html.indexOf('ds2colKWFlat', start);
      if (start < 0 || end < 0) throw new Error(`Missing accepted raw datasheet boundary: ${page.file}`);
      const frame = html.slice(start, end), knownText = comparableText(unit.sections.flatMap(section => section.blocks.map(block => block.text)).join('\n'));
      for (const token of ['dsAbility', 'dsOptionsComment']) for (const [j, node] of rawDivs(frame, token).entries()) {
        if (token === 'dsAbility' && /^YOUR\b.*COST/i.test(node.text)) {
          if (!knownText.includes(comparableText(node.text))) excludedFacts.push({sourceId, sourceRecordId: unit.sourceId, pointer: `raw:${page.file}:character-offset:${start + node.offset}`, value: {text: node.text}, reason: 'MFM_OWNED_PRICING_PANEL'});
          continue;
        }
        if (!node.text || token === 'dsAbility' && knownText.includes(comparableText(node.text))) continue;
        const rawId = `${unit.sourceId}:raw-${token}:${j + 1}`;
        const entity = add(rawId, token === 'dsAbility' ? 'SUPPLEMENTAL_DATASHEET_RULE' : 'WARGEAR_FOOTNOTE', id, {text: node.text}, rawId, `raw:${page.file}:character-offset:${start + node.offset}`);
        entity.provenance.sourcePath = `books/death-guard/v2/sources/accepted-waha-pages/${page.file}`;
        entity.provenance.sha256 = page.sha256;
        entity.provenance.rawLocator = {classToken: token, occurrence: j + 1};
        rawFactIds.push(rawId);
      }
    }
    add(id, 'DATASHEET', null, {...omit(unit, ['sourceId', 'statline', 'weapons', 'sections', 'wargearOptions', 'ruleReferences', 'normalizedContentFingerprint']), profileIds: [profileId], weaponIds: unit.weapons.map(x => x.sourceId), sectionIds: unit.sections.map(x => x.sourceId), wargearOptionIds: unit.wargearOptions.map(x => x.sourceId), ruleReferenceIds: unit.ruleReferences.map(x => x.sourceId), rawFactIds}, unit.sourceId, pointer);
  }
  let recovered = null;
  if (rawHubHtml !== undefined) {
    const raw = Buffer.isBuffer(rawHubHtml) ? rawHubHtml : Buffer.from(rawHubHtml);
    const hash = createHash('sha256').update(raw).digest('hex').toUpperCase(), expected = corpus.pages.find(page => page.file === 'death-guard.html')?.sha256;
    if (!expected || hash !== expected.toUpperCase()) throw new Error('Raw DG hub does not match pinned corpus hash');
    const html = raw.toString('utf8');
    const plain = value => value.replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim();
    const afflicted = html.match(/<span class="hi_custom">AFFLICTED<\/span><br>([\s\S]*?)<div/);
    const skullsquirm = html.match(/<p[^>]*class="impact18"[^>]*>Skullsquirm Blight<\/p>([\s\S]*?)<\/td>/);
    const lines = [...(skullsquirm?.[1] || '').matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => plain(match[1]));
    if (!afflicted || lines.length !== 2) throw new Error('Pinned raw army component structure is ambiguous');
    recovered = {hash, values: {'army-rule-nurgles-gift:afflicted': plain(afflicted[1]), 'army-rule-nurgles-gift:skullsquirm-blight': lines.join('\n')}};
  }
  for (const [i, rule] of corpus.armyRules.entries()) {
    const pointer = `/armyRules/${i}`;
    for (const [j, component] of (rule.components || []).entries()) {
      const entity = add(component.sourceId, 'ARMY_RULE_COMPONENT', rule.sourceId, omit(component, ['sourceId']), component.sourceId, `${pointer}/components/${j}`);
      if (!component.text && recovered?.values[component.sourceId]) {
        entity.data.text = recovered.values[component.sourceId];
        entity.provenance.recoveredFrom = {sourcePath: rawHubPath, sha256: recovered.hash, sourceRecordId: component.sourceId, method: 'PINNED_RAW_HTML_COMPONENT'};
      } else if (!component.text) captureGaps.push({entityId: component.sourceId, field: ['text'], classification: 'EMPTY_SOURCE_CAPTURE', sourceId, pointer: `${pointer}/components/${j}/text`});
      if (component.visuals?.length) captureGaps.push({entityId: component.sourceId, field: ['table'], classification: 'VISUAL_TABLE_NOT_CAPTURED', sourceId, pointer: `${pointer}/components/${j}/visuals`, evidence: [...component.visuals]});
    }
    add(rule.sourceId, 'ARMY_RULE', null, {...omit(rule, ['sourceId', 'components', 'normalizedContentFingerprint']), ...(rule.components ? {componentIds: rule.components.map(x => x.sourceId)} : {})}, rule.sourceId, pointer);
  }
  for (const [i, detachment] of corpus.detachments.entries()) {
    const pointer = `/detachments/${i}`;
    for (const field of ['detachmentPoints', 'forceDisposition']) exclusion(detachment, field, pointer);
    add(detachment.sourceId, 'DETACHMENT', null, {...omit(detachment, ['sourceId', 'rule', 'enhancements', 'stratagems', 'detachmentPoints', 'forceDisposition', 'normalizedContentFingerprint']), ruleId: detachment.rule.sourceId, enhancementIds: detachment.enhancements.map(x => x.sourceId), stratagemIds: detachment.stratagems.map(x => x.sourceId)}, detachment.sourceId, pointer);
    add(detachment.rule.sourceId, 'DETACHMENT_RULE', detachment.sourceId, omit(detachment.rule, ['sourceId']), detachment.rule.sourceId, `${pointer}/rule`);
    for (const [j, enhancement] of detachment.enhancements.entries()) {
      exclusion(enhancement, 'wahaPoints', `${pointer}/enhancements/${j}`);
      add(enhancement.sourceId, 'ENHANCEMENT', detachment.sourceId, omit(enhancement, ['sourceId', 'wahaPoints']), enhancement.sourceId, `${pointer}/enhancements/${j}`);
    }
    for (const [j, stratagem] of detachment.stratagems.entries()) add(stratagem.sourceId, 'STRATAGEM', detachment.sourceId, omit(stratagem, ['sourceId']), stratagem.sourceId, `${pointer}/stratagems/${j}`);
  }
  for (const [i, erratum] of corpus.errata.entries()) add(erratum.sourceId, 'SOURCE_ERRATUM', null, omit(erratum, ['sourceId']), erratum.sourceId, `/errata/${i}`);
  for (const supplement of normalizationSupplements) {
    const target = entities.find(entity => entity.id === supplement.targetId), field = supplement.field;
    const gapIndex = captureGaps.findIndex(gap => gap.entityId === supplement.targetId && JSON.stringify(gap.field) === JSON.stringify(field) && gap.classification === 'VISUAL_TABLE_NOT_CAPTURED');
    const hashes = supplement.provenance?.sha256s || [supplement.provenance?.sha256];
    if (!target || !Array.isArray(field) || field.length !== 1 || field[0] !== 'table' || Object.hasOwn(target.data, field[0]) || gapIndex < 0 || !supplement.sourceId || !supplement.provenance?.capturedAt || !Array.isArray(supplement.value) || !supplement.provenance?.sourcePaths?.length || hashes.length !== supplement.provenance.sourcePaths.length || !hashes.every(hash => /^[a-f0-9]{64}$/i.test(hash || ''))) throw new Error('Invalid or overwriting source normalization supplement');
    target.data[field[0]] = structuredClone(supplement.value);
    target.fieldProvenance = {...target.fieldProvenance, [field[0]]: {sourceId: supplement.sourceId, ...structuredClone(supplement.provenance), authority: 'SUPPLEMENTAL_REFERENCED_IMAGE_CAPTURE'}};
    captureGaps.splice(gapIndex, 1);
  }
  return {schema: 'dg-v2-canonical/v1', bookId: 'death-guard', baseSourceId: sourceId, entities, captureGaps, excludedFacts, sourceMetadata: {sourcePath, edition: corpus.edition, captureDate: corpus.captureDate, currentnessCutoff: corpus.currentnessCutoff, corpusFingerprint: corpus.corpusFingerprint, scope: structuredClone(corpus.scope), pages: structuredClone(corpus.pages)}};
}

export const normalize = normalizeDeathGuardCorpus;
