import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parse, normalize} from '../../shared/roster-v2/parser.mjs';

// Migration reference only: V1 is never injected into a production V2 service.
// Compare complete lexical results, including warnings and unresolved ownership,
// so the move cannot silently alter downstream canonical import decisions.
const reference = {window: {}};
vm.createContext(reference);
vm.runInContext(fs.readFileSync(new URL('../../shared/roster-parser.js', import.meta.url), 'utf8'), reference);
const legacy = reference.window.WHRosterParser;
const book = JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json', import.meta.url), 'utf8'));
const cases = new Set(['', 'unrecognized partial export', '+ DETACHMENT: Unknown contingent\n1x Unknown unit (20 pts)']);
const header = '+ DETACHMENT: Virulent Vectorium (Worldblight)\n';
for (const entity of book.entities) {
  if (entity.kind === 'DATASHEET') cases.add(header + `5x ${entity.data.title} (90 pts)`);
  if (entity.kind === 'DETACHMENT') cases.add(`+ DETACHMENT: ${entity.data.title}\n1x Lord of Contagion (110 pts): Manreaper`);
  if (entity.kind === 'ENHANCEMENT') cases.add(header + `+ ENHANCEMENT: ${entity.data.title} (on Char1: Lord of Contagion)\nChar1: 1x Lord of Contagion (110 pts): Manreaper\nEnhancement: ${entity.data.title} (+25 pts)`);
  if (entity.kind === 'WEAPON_PROFILE') {
    const unit = book.entities.find(owner => owner.id === entity.parentId);
    cases.add(header + `5x ${unit.data.title} (90 pts): 2x ${entity.data.name}`);
  }
}
for (const limit of ['Incursion', 'Strike Force', 'Incursion (1,000 Point limit)', 'Incursion (1,00 Point limit)']) {
  cases.add(header + `+ BATTLE SIZE: ${limit}\n+ TOTAL ARMY POINTS: 1,000pts\n1x Lord of Contagion (110 pts)`);
}
for (const claim of ['Char1: Lord of Contagion', 'Lord of Contagion', 'Char3: Unknown unit']) {
  cases.add(header + `+ WARLORD: ${claim}\n+ ENHANCEMENT: Furnace of Plagues (on ${claim})\nChar1: 1x Lord of Contagion (135 pts): Manreaper\nChar2: 1x Lord of Contagion (110 pts): Warlord, Manreaper`);
}
cases.add([
  '+ DETACHMENT: Paragons\u00a0of\u00a0Putrescence, Virulent\u00a0Vectorium (Hypervirulent Strains)',
  '+ WARLORD: Char1: Lord of Contagion',
  '+ ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)',
  'Char1: 1x Lord of Contagion (135 pts): Manreaper',
  'Enhancement: Furnace of Plagues (+25 pts)',
  '3x Deathshroud Terminators (150 pts)',
  '• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet',
  '• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet',
  'Created with newrecruit.eu v36.31'
].join('\r\n'));
cases.add(header + '5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives, 1x Icon of Despair\n10x Plague Marines (180 pts)\n• 1x Plague Champion: Plasma gun\n• 9x Plague Marine: 9 with Boltgun, Plague knives');
cases.add(header + '+ ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)\nChar1: 1x Lord of Contagion (110 pts)\nChar1: 1x Biologus Putrifier (50 pts)');
const plain = value => JSON.parse(JSON.stringify(value));
for (const text of cases) {
  assert.deepEqual(plain(parse(text)), plain(legacy.parse(text)), text);
  assert.equal(normalize(text), legacy.normalize(text));
}
assert.equal(globalThis.WHRosterParser, undefined, 'ESM parser must not create a legacy global');
assert.deepEqual(Object.keys(await import('../../shared/roster-v2/parser.mjs')).sort(), ['normalize', 'parse']);
console.log(JSON.stringify({status: 'PASS', lexicalParityCases: cases.size, legacyReference: 'TEST_ONLY', productionLegacyGlobal: false}));
