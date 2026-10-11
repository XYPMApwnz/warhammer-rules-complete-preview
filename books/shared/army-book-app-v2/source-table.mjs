/** Render explicitly bound source geometry; facts and source addresses stay intact. */
export const hasSourceTableLayout = fields => fields.some(field =>
  field.table?.rowSpan !== undefined || field.table?.columnSpan !== undefined || field.table?.header !== undefined);

export function renderSourceTable({el, fields, factValue, metadata, className = ''}) {
  const wrap = el('div', `${className} source-table-scroll`.trim());
  const table = el('table', 'source-fact-table');
  table.dataset.tableId = fields[0].table.id;
  if (metadata?.columns?.length) {
    const head = el('thead'), row = el('tr');
    for (const label of metadata.columns) {
      const cell = el('th', '', label);cell.scope = 'col';row.append(cell);
    }
    head.append(row);table.append(head);
  }
  const rows = new Map();
  for (const field of fields) {
    const row = field.table.row;
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row).push(field);
  }
  const body = el('tbody');
  for (const [rowId, rowFields] of [...rows].sort(([a], [b]) => a - b)) {
    const row = el('tr');row.dataset.rowId = String(rowId);
    for (const field of rowFields.toSorted((a, b) => a.table.column - b.table.column)) {
      const cell = el(field.table.header ? 'th' : 'td');
      for (const [key, property] of [['rowSpan', 'rowSpan'], ['columnSpan', 'colSpan']]) {
        const span = field.table[key];
        if (span === undefined) continue;
        if (!Number.isInteger(span) || span < 1) throw new TypeError('Invalid bound source table span');
        cell[property] = span;
      }
      if (field.table.header) cell.scope = (field.table.columnSpan || 1) > 1 ? 'colgroup' : 'col';
      cell.append(factValue('span', field));
      if (field.visual) {
        const image = el('img');Object.assign(image, field.visual);image.src = field.visual.url;cell.append(image);
      }
      row.append(cell);
    }
    body.append(row);
  }
  table.append(body);wrap.append(table);return wrap;
}
