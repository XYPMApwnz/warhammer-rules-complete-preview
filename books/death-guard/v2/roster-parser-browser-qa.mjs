import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';

const {chromium} = createRequire(import.meta.url)('playwright');
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const app = '/books/death-guard/v2/app.html';
const oldParser = '/books/shared/roster-parser.js';
const newParser = '/books/shared/roster-v2/parser.mjs';
const allowed = new Map([[app, 'text/html'],
  ['/books/death-guard/v2/generated/app-presentation.json', 'application/json'],
  ['/books/shared/army-book-app-v2/runtime.mjs', 'text/javascript'],
  ['/books/shared/army-book-app-v2/glossary.mjs', 'text/javascript'],
  ['/books/shared/army-book-app-v2/styles.css', 'text/css']]);
allowRosterDependencies(allowed);
const requests = [], forbidden = [];
let isolation = 'REMOVED';
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost').pathname;
  requests.push(url);
  if (url === oldParser) {
    forbidden.push(url);
    res.writeHead(isolation === 'REMOVED' ? 404 : 200, {'Content-Type': 'text/javascript'});
    res.end('throw new Error("Legacy New Recruit parser is unavailable");');
    return;
  }
  if (!allowed.has(url)) {
    if (url !== '/favicon.ico') forbidden.push(url);
    res.writeHead(404);res.end();return;
  }
  res.writeHead(200, {'Content-Type': allowed.get(url), 'Cache-Control': 'no-store'});
  res.end(fs.readFileSync(path.join(repo, url.slice(1))));
});
const text = [
  '+ DETACHMENT: Paragons\u00a0of\u00a0Putrescence, Virulent\u00a0Vectorium (Hypervirulent Strains)',
  '+ WARLORD: Char1: Lord of Contagion',
  '+ ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)',
  'Char1: 1x Lord of Contagion (135 pts): Manreaper',
  'Enhancement: Furnace of Plagues (+25 pts)',
  '3x Deathshroud Terminators (150 pts)',
  '• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet',
  '• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet',
  '6x Deathshroud Terminators (300 pts): 6x Manreaper, 6x Plaguespurt gauntlet',
  'Char2: 1x Biologus Putrifier (50 pts): Plague knives',
  '5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives, 1x Icon of Despair',
  '10x Plague Marines (180 pts): 2x Meltagun, 8x Boltgun, 10x Plague knives',
  'Created with newrecruit.eu v36.31'
].join('\r\n');
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})});
const results = [];
const snapshot = page => page.evaluate(() => window.ArmyBookAppV2.roster.snapshot());
const settled = async page => {
  await page.waitForFunction(() => !document.querySelector('.v2-roster[aria-busy=true]'));
  assert.equal(await page.locator('.v2-roster-error').count(), 0);
};
try {
  for (const mode of ['REMOVED', 'POISONED']) for (const phone of [false, true]) {
    isolation = mode;
    const context = await browser.newContext({viewport: {width: phone ? 390 : 1440, height: phone ? 844 : 1000}, serviceWorkers: 'block', acceptDownloads: true});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + app + '#view-roster');
    await page.waitForFunction(() => !!window.ArmyBookAppV2?.rosterPanel);
    await page.evaluate(() => window.ArmyBookAppV2.rosterPanel.ready);
    await page.locator('[data-roster-input=raw-text]').fill(text);
    await page.locator('[data-roster-action=review-import]').click();await settled(page);
    assert.equal(await page.locator('[data-roster-bindings] select').count(), 0);
    const imported = await snapshot(page);
    assert.deepEqual(imported.detachmentIds, ['detachment-paragons-of-putrescence', 'detachment-virulent-vectorium']);
    assert.equal(imported.units.length, 6);
    assert.deepEqual(imported.units.map(unit => unit.startingStrength), [1, 3, 6, 1, 5, 10]);
    assert.equal(imported.warlordInstanceId, 'parsed-unit-1');
    assert.deepEqual(imported.units[0].enhancementIds, ['detachment-virulent-vectorium:enhancement:2']);
    assert.equal(imported.units[4].selections.find(selection => selection.canonicalEquipmentIds.includes('datasheet-plague-marines:wargear:8')).physicalQuantity, 1);
    const attach = async (leader, bodyguard) => {
      const root = page.locator('[data-attachment-target-instance-id="' + bodyguard + '"]');
      await root.locator('select').selectOption(leader);
      await root.locator('[data-roster-action=attach]').click();await settled(page);
    };
    await attach('parsed-unit-1', 'parsed-unit-2');
    await attach('parsed-unit-4', 'parsed-unit-5');
    const saved = await snapshot(page);
    assert.equal(saved.attachments.length, 2);
    await page.locator('[data-roster-action=open-personal-guide]').click();
    await page.evaluate(() => window.ArmyBookAppV2.openInstance('parsed-unit-1'));
    const lord = page.locator('main .unit-card[data-roster-instance-id="parsed-unit-1"]');
    await lord.waitFor();
    const strength = 'datasheet-lord-of-contagion:weapon:1::/strength';
    assert.equal(await lord.locator('[data-fact-id="' + strength + '"]').textContent(), '10');
    assert.match(await lord.textContent(), /Feel No Pain 4\+/i);
    for (const ability of ['SUSTAINED HITS 1', 'LANCE', 'DEVASTATING WOUNDS']) assert((await lord.textContent()).toUpperCase().includes(ability));
    const effective = await page.evaluate(() => Object.fromEntries(window.ArmyBookAppV2.roster.state.units.map(unit => [unit.instanceId, window.ArmyBookAppV2.roster.effective(unit.instanceId)])));
    assert(effective['parsed-unit-2'].applied.some(effect => effect.ruleId === 'datasheet-lord-of-contagion:section:1'));
    assert(!effective['parsed-unit-3'].applied.some(effect => effect.ruleId === 'datasheet-lord-of-contagion:section:1'));
    assert(!effective['parsed-unit-2'].applied.some(effect => effect.ruleId === 'detachment-virulent-vectorium:enhancement:2'));
    assert(effective['parsed-unit-5'].applied.some(effect => effect.ruleId === 'datasheet-biologus-putrifier:section:1'));
    assert(!effective['parsed-unit-6'].applied.some(effect => effect.ruleId === 'datasheet-biologus-putrifier:section:1'));
    await page.reload();await page.waitForFunction(() => !!window.ArmyBookAppV2?.rosterPanel);
    await page.evaluate(() => window.ArmyBookAppV2.rosterPanel.ready);
    assert.deepEqual(await snapshot(page), saved);
    await page.evaluate(() => window.ArmyBookAppV2.openRoster());
    await page.locator('[data-roster-action=detach][data-leader-instance-id="parsed-unit-1"]').click();await settled(page);
    assert(!(await page.evaluate(() => window.ArmyBookAppV2.roster.effective('parsed-unit-1'))).profiles.some(profile => profile.abilities.some(ability => /feel no pain/i.test(ability.name))));
    await attach('parsed-unit-1', 'parsed-unit-2');
    assert.deepEqual(await snapshot(page), saved);
    assert.equal(await page.evaluate(() => typeof globalThis.WHRosterParser), 'undefined');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    assert.deepEqual(errors, []);
    results.push({device: phone ? 'phone' : 'desktop', oldParser: mode, import: 'PASS', personalWorkflow: 'PASS', megaCase: 'PASS', duplicateIsolation: 'PASS', reload: 'PASS', detachReattach: 'PASS'});
    await context.close();
  }
  assert.deepEqual(forbidden, []);
  assert(requests.includes(newParser));
  console.log(JSON.stringify({status: 'PASS', oldV1ParserReads: 0, v1RuntimeReads: 0, newParserRequests: requests.filter(url => url === newParser).length, results}));
} finally {
  await browser.close();await new Promise(resolve => server.close(resolve));
}
