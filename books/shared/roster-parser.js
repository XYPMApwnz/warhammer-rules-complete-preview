(function (root) {
  'use strict';

  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
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
    const bySource = new Map(units.filter(unit => unit.sourceRef).map(unit => [unit.sourceRef.toLowerCase(), unit]));
    const resolved = raw.map(item => {
      const owner = item.ownerUnitId ? units.find(unit => unit.id === item.ownerUnitId) : bySource.get(item.ownerSourceRef.toLowerCase());
      return { ...item, ownerUnitId:owner?.id || '', ownerName:owner?.name || item.ownerLabel || '', ownerStatus:owner ? 'resolved' : 'unresolved' };
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
    const entries = [...merged.values()];
    const ownersByName = new Map();
    for (const item of entries) {
      const owners = ownersByName.get(item.normalizedName) || new Set();
      owners.add(item.ownerUnitId || item.ownerSourceRef || 'unresolved');
      ownersByName.set(item.normalizedName, owners);
    }
    for (const item of entries) {
      if (ownersByName.get(item.normalizedName).size > 1) item.ownerStatus = 'ambiguous';
      if (item.ownerStatus !== 'resolved') warnings.push(`${item.name}: Enhancement owner could not be resolved.`);
    }
    return entries;
  }

  function parse(text) {
    const lines = String(text || '').replace(/\u00a0/g, ' ').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const values = key => lines.filter(line => line.toUpperCase().startsWith(`+ ${key}:`)).map(line => line.split(':').slice(1).join(':').trim()).filter(Boolean);
    const value = key => values(key)[0] || '—';
    const units = [];
    const rawEnhancements = [];
    const warnings = [];
    let currentUnit = null;
    let currentModel = null;

    for (const line of lines) {
      const unit = line.match(/^(?:(Char\d+):\s*)?(\d+)x\s+(.+?)\s+\((\d+)\s*pts?\)(?::\s*(.*))?$/i);
      if (unit) {
        currentUnit = { id:`parsed-unit-${units.length + 1}`, sourceRef:unit[1] || '', quantity:Number(unit[2]), name:unit[3], points:Number(unit[4]), wargear:unit[5] || '', models:[] };
        currentModel = null;
        units.push(currentUnit);
        continue;
      }
      const inline = line.match(/^Enhancement:\s*(.+)$/i);
      if (inline) {
        const parts = enhancementParts(inline[1]);
        rawEnhancements.push({ ...parts, source:'inline', ownerUnitId:currentUnit?.id || '', ownerLabel:currentUnit?.name || '' });
        continue;
      }
      if (line.startsWith('\u2022')) {
        const model = line.match(/^\u2022\s*(\d+)x\s+([^:]+)(?::\s*(.*))?$/);
        currentModel = model && currentUnit ? { quantity:Number(model[1]), name:model[2], wargear:model[3] || '', loadouts:[] } : null;
        if (currentModel) currentUnit.models.push(currentModel);
        continue;
      }
      const loadout = line.match(/^(\d+)\s+with\s+(.+)$/i);
      if (loadout && currentModel) {
        currentModel.loadouts.push({ quantity:Number(loadout[1]), wargear:loadout[2] });
      }
    }

    for (const item of splitList(values('ENHANCEMENT')).filter(item => item && item !== '—')) {
      rawEnhancements.push({ ...enhancementParts(item), source:'header', ownerUnitId:'' });
    }
    const enhancements = reconcileEnhancements(rawEnhancements, units, warnings);
    const declared = Number(value('TOTAL ARMY POINTS').match(/\d+/)?.[0] || 0);
    const unitLineTotal = units.reduce((total, unit) => total + unit.points, 0);
    const dispositions = splitList(values('FORCE DISPOSITION'));
    const detachments = splitList(values('DETACHMENT')).map((label, index) => ({
      label,
      name:label.replace(/\s*\([^)]*\)\s*$/, ''),
      rule:label.match(/\(([^)]*)\)/)?.[1] || '',
      disposition:dispositions[index] || dispositions[0] || '—'
    }));
    return {
      faction:value('FACTION KEYWORD'),
      detachment:detachments[0]?.label || '—',
      detachments,
      disposition:dispositions[0] || '—',
      enhancements,
      enhancement:enhancements[0]?.name || '—',
      declared,
      calculated:unitLineTotal,
      unitLineTotal,
      exportMatches:declared > 0 && declared === unitLineTotal,
      units,
      warnings
    };
  }

  root.WHRosterParser = Object.freeze({ parse, normalize });
}(typeof window === 'undefined' ? globalThis : window));
