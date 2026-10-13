/** Presentation-only import bindings quote the selected item's own canonical
 * source field. Ability headings remain independent gameplay content. */
const equipment = [
  ['deathshroud-terminators', 2, 'icon of despair'],
  ['plague-marines', 8, 'icon of despair'],
  ['plague-drones', 1, 'instrument of Chaos'],
  ['plague-drones', 2, 'daemonic icon'],
  ['plaguebearers', 1, 'instrument of Chaos'],
  ['plaguebearers', 2, 'daemonic icon']
];

export function buildImportBindings(book) {
  const records = new Map(book.entities.map(entity => [entity.id, entity]));
  const equipmentSelections = equipment.map(([slug, ordinal, label]) => {
    const ownerId = `unit-${slug}`, id = `datasheet-${slug}:wargear:${ordinal}`;
    const entity = records.get(id), text = entity?.data.text;
    if (records.get(ownerId)?.kind !== 'DATASHEET' || entity?.kind !== 'WARGEAR_OPTION' ||
        entity.parentId !== ownerId || !entity.provenance?.sourceId || typeof text !== 'string')
      throw new TypeError('Missing canonical DG equipment caption owner: ' + id);
    const start = text.indexOf(label);
    if (start < 0 || text.indexOf(label, start + label.length) !== -1)
      throw new TypeError('Missing or ambiguous canonical DG equipment caption: ' + id);
    const reference = {entityId: id, path: '/text'};
    return {ownerId, label, canonicalEquipmentIds: [id], canonicalFieldPaths: {[id]: ['/text']},
      evidence: [reference], sourceReferences: [{...reference, bookId: book.bookId,
        caption: {start, end: start + label.length}}]};
  });
  return {equipmentSelections};
}
