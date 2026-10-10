// V2-owned New Recruit text decoder. No canonical catalogs or gameplay evaluation.
// Preserve lexical export behavior; canonical resolution belongs to import.mjs.

export const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const integer = value => {
    const token = String(value || '').trim();
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(token)) return null;
    const parsed = Number(token.replaceAll(',', ''));
    return Number.isSafeInteger(parsed) ? parsed : null;
  };
  const splitList = items => items.flatMap(item => {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let index = 0; index < item.length; index += 1) {
      if (item[index] === '(') depth += 1;
      if (item[index] === ')') depth = Math.max(0, depth - 1);
      if (item[index] === ',' && depth === 0) {
        parts.push(item.slice(start, index).trim());
        start = index + 1;
      }
    }
    parts.push(item.slice(start).trim());
    return parts.filter(Boolean);
  });
  const selectionParts = value => {
    const parts = splitList([String(value || '')]);
    return {
      warlord:parts.some(item => normalize(item) === 'warlord'),
      value:parts.filter(item => normalize(item) !== 'warlord').join(', ')
    };
  };
  const enhancementParts = value => {
    const cost = Number(String(value).match(/\(\+(\d+)\s*pts?\)/i)?.[1] || 0) || null;
    const owner = String(value).match(/\(on\s+(Char\d+)\s*:\s*([^)]+)\)\s*$/i);
    const name = String(value)
      .replace(/\s*\(\+\d+\s*pts?\)\s*$/i, '')
      .replace(/\s*\(on\s+Char\d+\s*:[^)]+\)\s*$/i, '')
      .trim();
    return { name, normalizedName: normalize(name), exportedCost: cost, ownerSourceRef: owner?.[1] || '', ownerLabel: owner?.[2]?.trim() || '' };
  };

  function reconcileEnhancements(raw, units, warnings) {
    const bySource = new Map();
    for (const unit of units.filter(unit => unit.sourceRef)) {
      const key = unit.sourceRef.toLowerCase(), entries = bySource.get(key) || [];
      entries.push(unit);
      bySource.set(key, entries);
    }
    const resolved = raw.map(item => {
      if (item.ownerUnitId) {
        const owner = units.find(unit => unit.id === item.ownerUnitId);
        return { ...item, ownerUnitId:owner?.id || '', ownerName:owner?.name || item.ownerLabel || '', ownerStatus:owner ? 'resolved' : 'unresolved' };
      }
      const candidates = bySource.get(item.ownerSourceRef.toLowerCase()) || [];
      const labelMatches = item.ownerLabel ? candidates.filter(unit => normalize(unit.name) === normalize(item.ownerLabel)) : candidates;
      const owner = candidates.length === 1 && labelMatches.length === 1 ? labelMatches[0] : null;
      const ambiguous = candidates.length > 1 || (candidates.length === 1 && item.ownerLabel && !labelMatches.length);
      return {
        ...item,
        ownerUnitId:owner?.id || '',
        ownerName:owner?.name || (ambiguous ? '' : item.ownerLabel || ''),
        ownerStatus:owner ? 'resolved' : ambiguous ? 'ambiguous' : 'unresolved',
        ...(ambiguous ? { ownerCandidates:[...new Set([...candidates.map(unit => unit.name), item.ownerLabel].filter(Boolean))] } : {})
      };
    });
    const merged = new Map();
    for (const item of resolved) {
      const key = `${item.normalizedName}\0${item.ownerUnitId || item.ownerSourceRef.toLowerCase() || 'unresolved'}`;
      const previous = merged.get(key);
      merged.set(key, previous ? {
        ...previous,
        exportedCost:previous.exportedCost ?? item.exportedCost,
        source:previous.source === item.source ? previous.source : 'header+inline'
      } : item);
    }
    let entries = [...merged.values()];
    for (const name of new Set(entries.map(item => item.normalizedName))) {
      const group = entries.filter(item => item.normalizedName === name);
      const headers = group.filter(item => item.source === 'header');
      const inline = group.filter(item => item.source === 'inline');
      if (headers.length !== 1 || inline.length !== 1) continue;
      const header = headers[0], body = inline[0];
      entries = entries.filter(item => item !== header && item !== body);
      entries.push({
        ...header,
        exportedCost:body.exportedCost ?? header.exportedCost,
        ownerUnitId:'',
        ownerName:'',
        ownerStatus:'ambiguous',
        ownerCandidates:[header.ownerName || header.ownerLabel, body.ownerName || body.ownerLabel].filter(Boolean),
        source:'header+inline'
      });
    }
    for (const item of entries) {
      if (item.ownerStatus === 'ambiguous') warnings.push(item.source === 'header+inline'
        ? `${item.name}: Enhancement owner conflicts between header and inline metadata.`
        : `${item.name}: Enhancement owner metadata is ambiguous or conflicting.`);
      else if (item.ownerStatus !== 'resolved') warnings.push(`${item.name}: Enhancement owner could not be resolved.`);
    }
    return entries;
  }

export function parse(text, options = {}) {
    const lines = String(text || '').replace(/\u00a0/g, ' ').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const firstUnit = lines.findIndex(line => /^(?:(?:Char\d+):\s*)?\d+x\s+\S(?:.*?\S)?\s+\((?:\d+|\d{1,3}(?:,\d{3})+)\s*pts?\)/i.test(line));
    const metadataLines = firstUnit < 0 ? lines : lines.slice(0, firstUnit);
    const values = key => {
      const prefix = new RegExp(`^\\+?\\s*${key.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*:`, 'i');
      return metadataLines.filter(line => prefix.test(line)).map(line => line.replace(prefix, '').trim()).filter(Boolean);
    };
    const value = key => values(key)[0] || '—';
    const units = [];
    const rawEnhancements = [];
    const warnings = [];
    const warlordMarkers = new Set();
    let currentUnit = null;
    let currentModel = null;

    for (const line of lines) {
      const unit = line.match(/^(?:(Char\d+):\s*)?(\d+)x\s+(\S(?:.*?\S)?)\s+\((\d+|\d{1,3}(?:,\d{3})+)\s*pts?\)(?::\s*(.*))?$/i);
      if (unit) {
        const wargear = selectionParts(unit[5]);
        currentUnit = { id:`parsed-unit-${units.length + 1}`, sourceRef:unit[1] || '', quantity:integer(unit[2]), name:unit[3], points:integer(unit[4]), wargear:wargear.value, models:[], warlord:null };
        currentModel = null;
        units.push(currentUnit);
        if (wargear.warlord) warlordMarkers.add(currentUnit.id);
        continue;
      }
      const inline = line.match(/^Enhancement:\s*(.+)$/i);
      if (inline) {
        if (currentUnit) {
          const parts = enhancementParts(inline[1]);
          rawEnhancements.push({ ...parts, source:'inline', ownerUnitId:currentUnit.id, ownerLabel:currentUnit.name });
        }
        continue;
      }
      if (/^(?:\u2022\s*)?Warlord$/i.test(line)) {
        if (currentUnit) warlordMarkers.add(currentUnit.id);
        continue;
      }
      // Explicit labelled choices are lexical input, not inferred keywords.
      // Canonical option/equipment binding remains the importer's responsibility.
      if(currentUnit&&!/^\u2022\s*\d+x\s/.test(line)&&/^(?:\u2022\s*)?[^+:]+:\s*\S/.test(line)) {
        (currentUnit.choiceLines??=[]).push(line.replace(/^\u2022\s*/,''));
        continue;
      }
      if (line.startsWith('\u2022')) {
        const model = line.match(/^\u2022\s*(\d+)x\s+([^:]+)(?::\s*(.*))?$/);
        const equipment=selectionParts(model?.[3]),inlineLoadout=equipment.value.match(/^(\d+)\s+with\s+(.+)$/i);
        currentModel = model && currentUnit ? { quantity:integer(model[1]), name:model[2], wargear:inlineLoadout?'':equipment.value, loadouts:inlineLoadout?[{quantity:integer(inlineLoadout[1]),wargear:inlineLoadout[2]}]:[] } : null;
        if (currentModel) currentUnit.models.push(currentModel);
        if (equipment.warlord && currentUnit) warlordMarkers.add(currentUnit.id);
        continue;
      }
      const loadout = line.match(/^(\d+)\s+with\s+(.+)$/i);
      if (loadout && currentModel) {
        const equipment = selectionParts(loadout[2]);
        if (equipment.value) currentModel.loadouts.push({ quantity:integer(loadout[1]), wargear:equipment.value });
        if (equipment.warlord && currentUnit) warlordMarkers.add(currentUnit.id);
      }
    }

    const sourceGroups = new Map();
    for (const unit of units.filter(item => item.sourceRef)) {
      const key = unit.sourceRef.toLowerCase(), group = sourceGroups.get(key) || [];
      group.push(unit);
      sourceGroups.set(key, group);
    }
    for (const group of sourceGroups.values()) if (group.length > 1) warnings.push(`${group[0].sourceRef}: source reference identifies multiple units.`);

    const warlordClaims = values('WARLORD').filter(item => item !== '—');
    let headerWarlord = null, headerAmbiguous = false;
    if (warlordClaims.length === 1) {
      const claim = warlordClaims[0].match(/^(?:(Char\d+)\s*:\s*)?(.+)$/i);
      const candidates = claim?.[1]
        ? sourceGroups.get(claim[1].toLowerCase()) || []
        : units.filter(unit => normalize(unit.name) === normalize(claim?.[2]));
      const labelMatches = claim?.[2] ? candidates.filter(unit => normalize(unit.name) === normalize(claim[2])) : candidates;
      if (candidates.length === 1 && labelMatches.length === 1) headerWarlord = labelMatches[0];
      else headerAmbiguous = true;
    } else if (warlordClaims.length > 1) headerAmbiguous = true;
    const markerUnits = units.filter(unit => warlordMarkers.has(unit.id));
    const markerWarlord = markerUnits.length === 1 ? markerUnits[0] : null;
    const warlordConflict = headerAmbiguous || markerUnits.length > 1 || (headerWarlord && markerWarlord && headerWarlord.id !== markerWarlord.id);
    const warlord = warlordConflict ? null : headerWarlord || markerWarlord;
    if (warlord) for (const unit of units) unit.warlord = unit.id === warlord.id;
    if (warlordConflict) warnings.push('Warlord metadata is ambiguous or conflicting.');
    else if (warlordClaims.length && !warlord) warnings.push('Warlord owner could not be resolved.');

    for (const item of splitList(values('ENHANCEMENT')).filter(item => item && item !== '—')) {
      rawEnhancements.push({ ...enhancementParts(item), source:'header', ownerUnitId:'' });
    }
    const enhancements = reconcileEnhancements(rawEnhancements, units, warnings);
    const battleSize = value('BATTLE SIZE');
    const pointsLimitMatch = battleSize.match(/([\d,]+)\s*Point limit/i);
    const pointsLimitNumber = integer(pointsLimitMatch?.[1]);
    const pointsLimit = pointsLimitMatch ? pointsLimitNumber : (/incursion/i.test(battleSize) ? 1000 : /strike force/i.test(battleSize) ? 2000 : null);
    if (pointsLimitMatch && pointsLimitNumber === null) warnings.push('Battle size point limit could not be parsed.');
    const declaredValue = value('TOTAL ARMY POINTS'), declaredMatch = declaredValue.match(/^([\d,]+)\s*pts?\b/i), declaredNumber = integer(declaredMatch?.[1]), declared = declaredNumber ?? 0;
    if (declaredValue !== '—' && declaredNumber === null) warnings.push('Total army points could not be parsed.');
    const unitLineTotal = units.reduce((total, unit) => total + unit.points, 0);
    const dispositions = splitList(values('FORCE DISPOSITION'));
    const detachments = splitList(values('DETACHMENT')).map((label, index) => ({
      label,
      name:label.replace(/\s*\([^)]*\)\s*$/, ''),
      rule:label.match(/\(([^)]*)\)/)?.[1] || '',
      disposition:dispositions[index] || dispositions[0] || '—'
    }));
    const identityHints = Array.isArray(options.identityHints?.units) ? options.identityHints.units : [];
    const hintsByInstance = new Map();
    for (const hint of identityHints) {
      if (!hint?.id) continue;
      const group = hintsByInstance.get(hint.id) || [];
      group.push(hint);
      hintsByInstance.set(hint.id, group);
    }
    for (const unit of units) {
      const hints = hintsByInstance.get(unit.id) || [], hint = hints.length === 1 ? hints[0] : null;
      const canonicalUnitId = hint?.canonicalUnitId || hint?.canonicalDatasheetId || '';
      if (typeof canonicalUnitId === 'string' && canonicalUnitId.trim()) unit.canonicalUnitId = canonicalUnitId.trim();
    }
    return {
      faction:value('FACTION KEYWORD'),
      detachment:detachments[0]?.label || '—',
      detachments,
      disposition:dispositions[0] || '—',
      enhancements,
      enhancement:enhancements[0]?.name || '—',
      declared,
      battleSize,
      pointsLimit,
      calculated:unitLineTotal,
      unitLineTotal,
      exportMatches:declared > 0 && declared === unitLineTotal,
      units,
      warnings
    };
  }
