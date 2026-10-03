// Disposable presentation bindings. Canonical rule cards remain the only
// owners of rule identity and definition content.
export const DATASHEET_REFERENCE_BINDINGS_SCHEMA = 'army-book-app-v2/datasheet-reference-bindings/v1';

const formalReferences = Object.freeze([
  Object.freeze({group: 'CORE ABILITIES', label: 'Deadly Demise 1', targetId: 'core-deadly-demise', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Deadly Demise D3', targetId: 'core-deadly-demise', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Deadly Demise D6', targetId: 'core-deadly-demise', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Deep Strike', targetId: 'core-deep-strike', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Feel No Pain 5+', targetId: 'core-feel-no-pain', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Feel No Pain 6+', targetId: 'core-feel-no-pain', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Firing Deck 2', targetId: 'core-firing-deck', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Infiltrators', targetId: 'core-infiltrators', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Leader', targetId: 'core-leader', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'CORE ABILITIES', label: 'Scouts 6"', targetId: 'core-scouts', targetKind: 'CORE_MAIN_RULE'}),
  Object.freeze({group: 'ARMY RULES', label: 'Nurgle’s Gift (Aura)', targetId: 'army-rule-nurgles-gift', targetKind: 'ARMY_RULE'}),
  Object.freeze({group: 'ARMY RULES', label: 'Pact of Decay', targetId: 'army-rule-pact-of-decay', targetKind: 'ARMY_RULE'})
]);

const groupMarkers = Object.freeze(['CORE ABILITIES', 'ARMY RULES']);
const referenceKey = reference => `${reference.group}\u0000${reference.label}`;

function groupsIn(value, fieldId) {
  const groups = groupMarkers.map(marker => ({marker, start: value.indexOf(marker)})).filter(group => group.start >= 0)
    .sort((a, b) => a.start - b.start);
  for (const marker of groupMarkers) {
    if (value.indexOf(marker) !== value.lastIndexOf(marker)) throw new Error(`Repeated rule-reference group marker: ${fieldId}/${marker}`);
  }
  if (!groups.length || groups[0].start !== 0) throw new Error(`Unsupported rule-reference group structure: ${fieldId}`);
  return groups.map((group, index) => ({marker: group.marker, start: group.start + group.marker.length,
    end: groups[index + 1]?.start ?? value.length}));
}

function tokenSpans(value, fieldId) {
  const spans = [];
  for (const group of groupsIn(value, fieldId)) {
    const body = value.slice(group.start, group.end);
    for (const match of body.matchAll(/[^,]+/g)) {
      const raw = match[0], leading = raw.length - raw.trimStart().length, trailing = raw.length - raw.trimEnd().length;
      const start = group.start + match.index + leading, end = group.start + match.index + raw.length - trailing;
      if (start < end) spans.push({group: group.marker, label: value.slice(start, end), start, end});
    }
  }
  return spans;
}

export function buildDatasheetReferenceBindings(cards) {
  if (!Array.isArray(cards)) throw new TypeError('Missing projected presentation cards');
  const cardsById = new Map(cards.map(card => [card.id, card]));
  if (cardsById.size !== cards.length) throw new Error('Duplicate projected presentation identity');
  for (const reference of formalReferences) {
    const target = cardsById.get(reference.targetId);
    if (!target || target.kind !== reference.targetKind) throw new Error(`Unavailable canonical presentation target: ${reference.targetId}`);
  }

  const expected = new Map(formalReferences.map(reference => [referenceKey(reference), reference]));
  const boundCounts = new Map(formalReferences.map(reference => [referenceKey(reference), 0]));
  const fields = {};
  for (const card of cards.filter(card => card.kind === 'RULE_REFERENCE')) {
    const referenceFields = card.fields.filter(field => field.source?.path === '/label');
    if (referenceFields.length !== 1) throw new Error(`Expected one rule-reference label: ${card.id}`);
    for (const field of referenceFields) {
      if (typeof field.value !== 'string') throw new Error(`Non-text rule-reference label: ${field.id}`);
      const bindings = [];
      for (const token of tokenSpans(field.value, field.id)) {
        const reference = expected.get(`${token.group}\u0000${token.label}`);
        if (!reference) throw new Error(`Unsupported formal rule reference: ${field.id}/${token.group}/${token.label}`);
        bindings.push({start: token.start, end: token.end, targetId: reference.targetId});
        const key = referenceKey(reference);
        boundCounts.set(key, boundCounts.get(key) + 1);
      }
      if (!bindings.length) throw new Error(`Empty rule-reference field: ${field.id}`);
      fields[field.id] = bindings;
    }
  }
  for (const reference of formalReferences) {
    if (!boundCounts.get(referenceKey(reference))) throw new Error(`Unused formal presentation reference: ${reference.group}/${reference.label}`);
  }
  return {schema: DATASHEET_REFERENCE_BINDINGS_SCHEMA, fields};
}
