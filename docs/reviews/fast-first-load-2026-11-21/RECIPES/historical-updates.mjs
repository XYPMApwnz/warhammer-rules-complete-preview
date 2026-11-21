/** Actual historical packages, isolated origin, real native imports. Author-only recipe.
 * node historical-updates.mjs --old-package <dir> --new-package <dir> --source <feature checkout> --out <evidence dir>
 * Run separately for 1fd0b279 and e3db1b34/runtime-base. No package is rebuilt or edited.
 * Browser profiles and exact storage snapshots never enter evidence. No raw exports are published.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createResponder} from '../measurement-recipes/runtime-server.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((rows, arg, i, all) => {
  if (arg.startsWith('--')) rows.push([arg.slice(2), all[i + 1]]);
  return rows;
}, []));
for (const key of ['old-package', 'new-package', 'source', 'out']) assert(args[key] && !args[key].startsWith('--'), 'Missing --' + key);
const source = path.resolve(args.source), out = path.resolve(args.out);
const oldRoot = path.resolve(args['old-package']), newRoot = path.resolve(args['new-package']);
assert.notEqual(oldRoot, newRoot, 'Historical and candidate packages must be different directories');
const sha = value => createHash('sha256').update(value).digest('hex');
const manifest = root => JSON.parse(fs.readFileSync(path.join(root, 'PAGES_RUNTIME_MANIFEST.json'), 'utf8'));
const oldManifest = manifest(oldRoot), newManifest = manifest(newRoot);
assert(oldManifest.cacheRevision && newManifest.cacheRevision, 'Both packages need manifest revision metadata');
assert.notEqual(oldManifest.cacheRevision, newManifest.cacheRevision, 'Update requires distinct revisions');
const historicalSources = {
  d389549067279096e9a645bab8dbaa6be682967190155ce1f8ec37db8eaf35d3: '1fd0b279051d76f1a262f7c8f117e35551b7de39',
  '0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909': 'e3db1b345eca989436eea7af758900eee7795203 (runtime-identical base)',
};
assert(historicalSources[oldManifest.contentSha256], 'Old input is not either verified historical package');
// Only newly created, explicitly owned scratch. Never remove historical packages or preview files.
const scratch = path.join('E:/Warhammer/qa-tmp/fast-first-load/historical-updates', randomUUID());
fs.mkdirSync(scratch, {recursive: true});
fs.mkdirSync(out, {recursive: true});
const {chromium} = await import(pathToFileURL(path.join(source, 'node_modules/playwright/index.mjs')).href);
const report = {schema: 'fast-first-load-historical-update/v1', status: 'RUNNING',
  old: {root: oldRoot, source: historicalSources[oldManifest.contentSha256], contentSha256: oldManifest.contentSha256, revision: oldManifest.cacheRevision},
  candidate: {root: newRoot, contentSha256: newManifest.contentSha256, revision: newManifest.cacheRevision},
  privacy: 'No raw import, storage, trace, or browser profile is written to evidence.', scratch, scenarios: []};
const prefix = '/warhammer-rules-complete-preview/';
let serving = {root: oldRoot, label: 'historical'};
const requests = [];
const responder = createResponder(() => serving, {prefix, records: requests});
const server = responder.http();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}${prefix}`, entry = base + 'v2/app.html';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const safeError = error => String(error?.message || error).split('\n')[0].replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[private]');
async function poll(fn, timeout = 180000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { const value = await fn(); if (value) return value; }
    catch (error) { if (!/context|navigation|target.*closed/i.test(error.message)) throw error; }
    await sleep(150);
  }
  throw new Error('Historical-update condition timed out');
}
async function ready(page) {
  await poll(() => page.evaluate(() => !!window.WarhammerAppV2));
  await page.evaluate(() => WarhammerAppV2.ready);
  await poll(() => page.evaluate(() => !document.querySelector('[data-v2-loading]')));
}
async function go(page, query = '') { await page.goto(entry + query, {waitUntil: 'load', timeout: 180000}); await ready(page); }
async function roster(page, book) {
  await go(page, '?v2=ROSTER&book=' + book);
  await poll(() => page.evaluate(id => window.ArmyBookAppV2?.payload?.book?.id === id && !!ArmyBookAppV2.roster, book));
  await page.evaluate(() => ArmyBookAppV2.rosterPanel?.ready);
}
async function openImport(page) {
  const raw = page.locator('[data-roster-input="raw-text"]');
  const closed = raw.locator('xpath=ancestor::details[not(@open)][1]');
  if (await closed.count()) await closed.locator(':scope > summary').click();
  await raw.waitFor({state: 'visible'});
  return raw;
}
async function imported(page, book) {
  return page.evaluate(id => !!window.ArmyBookAppV2?.roster?.state?.units?.length && localStorage.getItem('army-book-app-v2:roster:' + id) !== null, book);
}
async function importFixture(page, book, file, expectedHash) {
  const bytes = fs.readFileSync(file);
  if (expectedHash) assert.equal(sha(bytes), expectedHash, 'Owner fixture bytes changed');
  return importText(page, book, bytes, {file: path.relative(source, file).replaceAll('\\', '/'), sha256: sha(bytes)});
}
async function importText(page, book, bytes, provenance) {
  await (await openImport(page)).fill(bytes.toString('utf8'));
  await page.locator('[data-roster-action="review-import"]').click();
  await poll(() => page.evaluate(() => !document.querySelector('.v2-roster[aria-busy="true"]')));
  const replace = page.locator('[data-roster-action="confirm-replace-roster"]');
  if (await replace.isVisible().catch(() => false)) { await replace.click(); await poll(() => page.evaluate(() => !document.querySelector('.v2-roster[aria-busy="true"]'))); }
  const accepted = await imported(page, book);
  return {...provenance, accepted};
}
// Exact values stay in Node memory. Hash-only assertions cannot dump private snapshots on failure.
async function storage(page) {
  return page.evaluate(() => Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]));
}
function storageProof(rows) { const bytes = Buffer.from(JSON.stringify(rows)); return {entries: rows.length, bytes: bytes.length, sha256: sha(bytes)}; }
async function unchanged(page, reference, label) {
  const proof = storageProof(await storage(page));
  assert.equal(proof.sha256, reference.sha256, label + ': exact localStorage changed');
  return proof;
}
async function workerState(page, waiting = false) {
  return page.evaluate(async waiting => {
    const registration = await navigator.serviceWorker.getRegistration();
    const worker = waiting ? registration?.waiting : registration?.active;
    if (!worker) return null;
    const ask = type => new Promise(resolve => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); resolve(null); }, 4000);
      channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
      worker.postMessage({type}, [channel.port2]);
    });
    return {version: await ask('GET_VERSION'), status: await ask('WH_OFFLINE_PACKAGE_STATUS_QUERY'), controlled: navigator.serviceWorker.controller === worker};
  }, waiting);
}
async function fullReady(page, revision) {
  let prepareRequested = false;
  const state = await poll(async () => {
    const current = await workerState(page);
    if (current?.version?.revision !== revision || !current.controlled) return false;
    const status = current.status;
    if (status?.revision === revision && status.status === 'ready' && status.total > 0 && status.completed === status.total) return current;
    // New protocol only. Legacy install already prepares all files before activation.
    if (!prepareRequested && status?.coreReady !== undefined) {
      prepareRequested = true;
      await page.evaluate(revision => navigator.serviceWorker.controller?.postMessage({type: 'WH_PWA_PREPARE_OFFLINE', revision, afterStartup: false}), revision);
    }
    return false;
  });
  return {revision, completed: state.status.completed, total: state.status.total, controlled: state.controlled};
}
async function readable(page, book, expectedCount) {
  await roster(page, book);
  const count = await page.evaluate(() => ArmyBookAppV2.roster.state.units.length);
  assert.equal(count, expectedCount, 'Saved native ' + book + ' roster must be readable without reimport');
  assert.equal(await page.locator('[data-roster-instance-id]').count(), expectedCount, 'Each saved unit has a rendered roster article');
  return {units: count, pointsStatus: await page.evaluate(() => ArmyBookAppV2.roster.points?.status ?? null)};
}
let context;
try {
  for (const width of [390, 1440]) {
    const scenario = {width, status: 'RUNNING', imports: [], errors: {console: 0, page: 0}, started: new Date().toISOString()};
    report.scenarios.push(scenario);
    serving = {root: oldRoot, label: 'historical'};
    context = await chromium.launchPersistentContext(path.join(scratch, 'profile-' + width), {
      headless: true, viewport: {width, height: 900}, serviceWorkers: 'allow',
      executablePath: process.env.WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      env: {...process.env, TMP: scratch, TEMP: scratch, TMPDIR: scratch},
    });
    context.setDefaultTimeout(30000);
    const attachDiagnostics = page => { page.on('console', message => { if (message.type() === 'error') scenario.errors.console++; }); page.on('pageerror', () => scenario.errors.page++); };
    const working = context.pages()[0] || await context.newPage(); attachDiagnostics(working);
    await go(working); scenario.oldOffline = await fullReady(working, oldManifest.cacheRevision);
    const counts = {};
    await roster(working, 'death-guard');
    for (const version of ['v37.25', 'v37.15']) {
      const metadata = JSON.parse(fs.readFileSync(path.join(source, 'v2/fixtures/new-recruit-plain-header' + (version === 'v37.25' ? '-v37.25' : '') + '.json'), 'utf8')).owner;
      const attempt = await importFixture(working, 'death-guard', path.join(source, 'v2/fixtures', metadata.file), metadata.sha256);
      scenario.imports.push({...attempt, book: 'death-guard', version, kind: 'AUTHENTIC_STORED_EXPORT'});
      if (attempt.accepted) { scenario.dgAcceptedVersion = version; break; }
    }
    if (!await imported(working, 'death-guard')) {
      // Reuse the unchanged DERIVED fixture already imported through the actual old native UI
      // during the 2026-11-14 preview audit. Do not derive or transform a new roster here.
      const archive = path.resolve(args['historical-fixtures'] || 'E:/Warhammer/qa-evidence/preview-v1-2026-11-14/FIXTURES.json');
      const archiveBytes = fs.readFileSync(archive);
      const existing = JSON.parse(archiveBytes.toString('utf8')).fixtures.find(row => row.id === 'dg-short-derived-labelled');
      assert(existing?.bookId === 'death-guard' && existing.kind === 'DERIVED_NOT_REAL_EXPORT', 'Expected explicitly DERIVED historical DG fixture');
      const bytes = Buffer.from(existing.text, 'utf8');
      assert.equal(sha(bytes), 'ab88387de19a9020f96668c16198cb5ec87ab4c6c35670d8075aac8964300b1f', 'Historical derived DG fixture changed');
      assert.equal(sha(bytes), existing.utf8Sha256, 'Historical archive provenance hash mismatch');
      const attempt = await importText(working, 'death-guard', bytes, {
        file: archive, recordId: existing.id, sha256: sha(bytes), archiveSha256: sha(archiveBytes),
        kind: existing.kind, source: existing.source, derivation: existing.derivation,
        expectedUnitEntries: existing.expectedUnitEntries,
        acceptanceEvidence: 'E:/Warhammer/qa-evidence/preview-v1-2026-11-14/UPDATE-OBSERVATIONS-V3/OBSERVATIONS.md:11-15',
        fallbackReason: 'Both unchanged authentic owner plain exports were unsupported by this historical runtime.',
      });
      scenario.imports.push({...attempt, book: 'death-guard'});
      if (attempt.accepted) {
        assert.equal(await working.evaluate(() => ArmyBookAppV2.roster.state.units.length), existing.expectedUnitEntries, 'Historical derived native import changed its exact unit count');
        scenario.dgAcceptedVersion = 'DERIVED_NOT_REAL_EXPORT: dg-short-derived-labelled (unchanged prior preview fixture)';
      }
    }
    assert(await imported(working, 'death-guard'), 'OLD_DG_UNSUPPORTED: authentic attempts and unchanged historical DERIVED fallback did not save a roster');
    counts['death-guard'] = await working.evaluate(() => ArmyBookAppV2.roster.state.units.length);
    await roster(working, 'space-marines');
    scenario.imports.push({...await importFixture(working, 'space-marines', path.join(source, 'books/space-marines/v2/fixtures/newrecruit-v37.3-user-sm.txt')), book: 'space-marines', kind: 'AUTHENTIC_STORED_EXPORT'});
    assert(await imported(working, 'space-marines'), 'Historical native SM import did not save a roster');
    counts['space-marines'] = await working.evaluate(() => ArmyBookAppV2.roster.state.units.length);
    // Warm exactly the preserved-roster books, not an unsupported promise that all large books are precached.
    for (const book of Object.keys(counts)) { await go(working, '?v2=ARMY_BOOK&book=' + book); await readable(working, book, counts[book]); }
    await fullReady(working, oldManifest.cacheRevision);
    const draft = 'Unfinished update verification: keep this draft.';
    await (await openImport(working)).fill(draft);
    const sentinel = randomUUID(); await working.evaluate(value => { window.__historicalUpdateDocument = value; }, sentinel);
    const reference = storageProof(await storage(working)); scenario.storageBefore = reference;
    serving = {root: newRoot, label: 'candidate'};
    const updatedAt = performance.now();
    // Browser update check is not consent; never send SKIP_WAITING from the recipe.
    await working.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); });
    await poll(async () => (await workerState(working, true))?.version?.revision === newManifest.cacheRevision);
    await poll(() => working.locator('[data-pwa-updater][data-state="ready"]').isVisible());
    await working.waitForTimeout(2000);
    assert.equal(await working.evaluate(() => window.__historicalUpdateDocument), sentinel, 'Working screen auto-reloaded');
    assert.equal(await working.locator('[data-roster-input="raw-text"]').inputValue(), draft, 'Unsaved working draft changed');
    assert.equal((await workerState(working))?.version?.revision, oldManifest.cacheRevision, 'Waiting update activated without working-screen consent');
    await unchanged(working, reference, 'Working update banner');
    scenario.workingScreen = {banner: true, noAutoReload: true, draftUnchanged: true};
    await working.screenshot({path: path.join(out, 'working-banner-' + width + '.png'), fullPage: false});
    // A separate document reaches Loading. The application, not the recipe, must activate the update.
    const startup = await context.newPage(); attachDiagnostics(startup);
    const startupAt = performance.now();
    await go(startup);
    await poll(async () => { const state = await workerState(startup); return state?.controlled && state.version?.revision === newManifest.cacheRevision; });
    assert.equal(await startup.evaluate(() => window.WHPwaExpectedRevision), newManifest.cacheRevision, 'HTML and controlling revision must match');
    scenario.updateToWorkingMs = Math.round(performance.now() - updatedAt);
    scenario.startupToWorkingMs = Math.round(performance.now() - startupAt);
    await unchanged(startup, reference, 'Candidate startup');
    scenario.savedOnline = {};
    for (const book of Object.keys(counts)) {
      scenario.savedOnline[book] = await readable(startup, book, counts[book]);
      await unchanged(startup, reference, 'Candidate saved ' + book);
    }
    scenario.newOffline = await fullReady(startup, newManifest.cacheRevision);
    assert.equal(await working.evaluate(() => window.__historicalUpdateDocument), sentinel, 'Another document activation reloaded the working screen');
    assert.equal(await working.locator('[data-roster-input="raw-text"]').inputValue(), draft, 'Another document activation changed unsaved draft');
    await unchanged(working, reference, 'Working screen after activation');
    await startup.screenshot({path: path.join(out, 'saved-roster-new-' + width + '.png'), fullPage: false});
    await context.setOffline(true);
    await go(startup);
    scenario.savedOffline = {};
    for (const book of Object.keys(counts)) scenario.savedOffline[book] = await readable(startup, book, counts[book]);
    scenario.storageAfter = await unchanged(startup, reference, 'Candidate offline');
    scenario.offlineHome = true;
    await startup.screenshot({path: path.join(out, 'saved-roster-offline-' + width + '.png'), fullPage: false});
    scenario.status = 'PASS';
    await context.close(); context = null;
  }
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL'; report.error = safeError(error); process.exitCode = 1;
} finally {
  if (context) await context.close().catch(() => {});
  responder.close(); await new Promise(resolve => server.close(resolve));
  report.requests = {total: requests.length, historical: requests.filter(row => row.version === 'historical').length,
    candidate: requests.filter(row => row.version === 'candidate').length, failed: requests.filter(row => row.status >= 400).length};
  report.notes = [
    'Exact localStorage proof covers all origin keys, not only DG/SM. Contents exist only in browser and Node memory.',
    'Old DG v37.25 is attempted first, then actual v37.15. Failed attempts remain in the report. If both fail, the unchanged DERIVED dg-short-derived-labelled fixture from the prior actual-old preview audit is attempted with exact SHA and provenance. No input is converted.',
    'This recipe checks two actual historical origins separately; it does not replace the separate revision-switch-during-background negative control.',
    'Offline assertion covers home and the warmed saved DG/SM rosters. Large untouched books are lazy in the accepted model.',
    'Profiles remain in the named qa-tmp scratch folder for owner-approved cleanup; no preview or package file is changed.',
  ];
  fs.writeFileSync(path.join(out, 'REPORT.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({status: report.status, report: path.join(out, 'REPORT.json'), scratch}));
}
