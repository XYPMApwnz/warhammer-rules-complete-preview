const {createQaEvidenceDir}=require('../../../tests/helpers/qa-temp.cjs');
const {launchQaBrowser}=require('../../../tests/helpers/qa-browser.cjs');
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const codexDatasheets=require(path.resolve(__dirname,'..','content','adeptus-mechanicus-codex-datasheets.en.json')).datasheets;
const codexWargear=require(path.resolve(__dirname,'..','content','adeptus-mechanicus-codex-wargear.en.json')).units;
const factionRules=require(path.resolve(__dirname,'..','content','adeptus-mechanicus-rules.en.json'));

async function main() {
const {createEffectiveMfmArmyProjection}=await import(pathToFileURL(path.resolve(__dirname,'..','..','shared','tools','effective-mfm-army-projection.mjs')).href);
const pointsCatalog=createEffectiveMfmArmyProjection('adeptus-mechanicus').pointsForArmyBook('adeptus-mechanicus');
const enginseerPoints=pointsCatalog.units.find(unit=>unit.id==='unit-tech-priest-enginseer').points[0].value;
const necromechanicPoints=pointsCatalog.enhancements.find(item=>item.id==='enhancement-necromechanic').value;
const base = process.env.AM_TEST_BASE || 'http://127.0.0.1:8766';
const executablePath = process.env.BROWSER_EXECUTABLE;
const output = createQaEvidenceDir('mechanicus-runtime-');
fs.mkdirSync(output, { recursive: true });

const browser = await launchQaBrowser(chromium,{ executablePath, headless: true });
const failures = [];

async function pageFor(name, viewport) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => failures.push(`${name}: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') failures.push(`${name}: console: ${message.text()}`);
  });
  return page;
}

async function assertNoHorizontalOverflow(page, label) {
  const sizes = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  assert.ok(sizes.scroll <= sizes.client + 1, `${label}: ${sizes.scroll}px document in ${sizes.client}px viewport`);
}

const desktop = await pageFor('desktop', { width: 1440, height: 1000 });
console.log('desktop: open');
const started = Date.now();
await desktop.goto(`${base}/books/adeptus-mechanicus/reader.html#unit-skitarii-rangers`, { waitUntil: 'domcontentloaded' });
const desktopLoadMs = Date.now() - started;
await desktop.locator('#unit-skitarii-rangers').waitFor({ state: 'visible' });
console.log('desktop: unit visible');
const generatedWargear=await desktop.evaluate(units=>{
  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
  return units.map(unit=>{
    const root=document.getElementById(unit.id),slug=unit.id.replace(/^unit-/,''),options=root?.querySelectorAll(`#${CSS.escape(slug)}-wargear-options li`)||[];
    return {title:unit.title,wargear:[...options].map(node=>clean(node.innerText)),composition:clean(root?.querySelector(`#${CSS.escape(slug)}-composition`)?.innerText.replace(/^Unit Composition\s*/i,''))};
  });
},codexDatasheets.filter(unit=>codexWargear.some(record=>record.title===unit.title)).map(unit=>({id:unit.id,title:unit.title})));
const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
for(const actual of generatedWargear){
  const expected=codexWargear.find(unit=>unit.title===actual.title);
  assert.deepEqual(actual.wargear,expected.wargear.map(clean),`${actual.title}: generated Wargear Options must match the locked snapshot`);
  assert.equal(actual.composition,clean(expected.composition),`${actual.title}: generated Unit Composition must match the locked snapshot`);
}
await desktop.waitForFunction(()=>window.DG_APP?.navigation?.state?.owner==='reader'&&document.querySelector('[data-nav-target="unit-skitarii-rangers"]')?.classList.contains('is-current'));
await desktop.locator('[data-nav-target="unit-skitarii-rangers"]').click();
await desktop.waitForFunction(() => document.querySelector('[data-nav-target="unit-skitarii-rangers"]')?.classList.contains('is-current'));
console.log('desktop: navigation current');
const rangerWargear=codexWargear.find(unit=>unit.title==='Skitarii Rangers').wargear.map(clean);
assert.deepEqual(await desktop.locator('#skitarii-rangers-wargear-options li').allInnerTexts().then(items=>items.map(clean)),rangerWargear,'Rangers Wargear Options must exactly match the locked canonical snapshot after navigation');
await desktop.locator('#unit-skitarii-rangers .related-rules-trigger').click();
await desktop.locator('.related-rules-layer:not([hidden])').waitFor();
await desktop.locator('.related-rules-layer:not([hidden]) .full-related-content').waitFor();
console.log('desktop: related rules visible');
const relatedTerm = desktop.locator('.related-rules-layer:not([hidden]) .term-button:visible').first();
assert.ok(await relatedTerm.count(), 'Related Rules must expose glossary terms');
console.log('desktop: related term', await relatedTerm.getAttribute('data-term'), await relatedTerm.textContent());
await relatedTerm.click();
console.log('desktop: popup state', await desktop.evaluate(id => ({known:Boolean(window.WH40K_GLOSSARY.forBook('adeptus-mechanicus')[id]),ids:window.DG_APP.popups.snapshot(),html:document.querySelector('#popupLayer').innerHTML.slice(0,120)}), await relatedTerm.getAttribute('data-term')));
await desktop.locator('#popupLayer .term-popup').last().waitFor({ state: 'visible' });
console.log('desktop: nested popup visible');
const layers = await desktop.evaluate(() => ({
  popup: Number(getComputedStyle(document.querySelector('#popupLayer')).zIndex),
  related: Number(getComputedStyle(document.querySelector('.related-rules-layer')).zIndex),
  locked: document.documentElement.classList.contains('popup-open') || document.body.classList.contains('popup-open')
}));
assert.ok(layers.popup > layers.related, `popup layer ${layers.popup} must be above Related Rules ${layers.related}`);
await assertNoHorizontalOverflow(desktop, 'desktop');
await desktop.screenshot({ path: path.join(output, 'desktop.png'), fullPage: false });

const tablet = await pageFor('iPad', { width: 1024, height: 1366 });
console.log('iPad: open');
await tablet.goto(`${base}/books/adeptus-mechanicus/reader.html#unit-onager-dunecrawler`, { waitUntil: 'domcontentloaded' });
await tablet.locator('#unit-onager-dunecrawler').waitFor({ state: 'visible' });
await tablet.waitForTimeout(3000);
console.log('iPad: anchor state', await tablet.evaluate(() => ({hash:location.hash,scrollY,active:window.DG_APP?.navigation.active})));
assert.equal(await tablet.locator('#unit-onager-dunecrawler .statline').first().evaluate(node => getComputedStyle(node).flexWrap), 'nowrap');
await assertNoHorizontalOverflow(tablet, 'iPad');
await tablet.screenshot({ path: path.join(output, 'ipad.png'), fullPage: false });

const mobile = await pageFor('mobile', { width: 430, height: 932 });
console.log('mobile: open');
await mobile.goto(`${base}/books/adeptus-mechanicus/mobile/skitarii-rangers.html?view=mobile`, { waitUntil: 'domcontentloaded' });
await mobile.locator('.unit-card').waitFor({ state: 'visible' });
assert.ok(await mobile.locator('.weapon-row:not(.weapon-head)').count() > 0, 'Phone Mode must render weapons');
await assertNoHorizontalOverflow(mobile, 'mobile');
await mobile.screenshot({ path: path.join(output, 'mobile.png'), fullPage: false });

const roster = await pageFor('roster', { width: 1024, height: 1366 });
const rosterSource=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Cohort Cybernetica
+ TOTAL ARMY POINTS: ${enginseerPoints+necromechanicPoints}pts
+ ENHANCEMENT: Necromechanic (on Char1: Tech-Priest Enginseer)
+ NUMBER OF UNITS: 1

Char1: 1x Tech-Priest Enginseer (${enginseerPoints} pts): Archeotech pistol, Omnissian axe, Servo arm
Enhancement: Necromechanic (+${necromechanicPoints} pts)`;
await roster.addInitScript(source=>localStorage.setItem('wh40k-rosters-v1',JSON.stringify([{id:'runtime-am',name:'Runtime Mechanicus',sourceText:source,roster:{faction:'Adeptus Mechanicus',units:[]}}])),rosterSource);
await roster.goto(`${base}/books/adeptus-mechanicus/reader.html?roster=runtime-am#unit-tech-priest-enginseer`,{waitUntil:'domcontentloaded'});
await roster.locator('#unit-tech-priest-enginseer[data-roster-selected="true"]').waitFor({state:'visible'});
assert.deepEqual(await roster.locator('.unit-card[data-roster-selected="true"]').evaluateAll(cards=>cards.map(card=>card.dataset.canonicalUnitId||card.id)),['unit-tech-priest-enginseer'],'Personal reader must resolve the exact current roster Datasheet identity');
const enhancementCard=await roster.locator('#unit-tech-priest-enginseer .roster-enhancement').innerText();
assert.match(enhancementCard,/TECH-PRIEST model only/i,'Personal reader must show the canonical Enhancement restriction');
assert.match(enhancementCard,/20 pts included/i,'Personal reader must show the current Enhancement cost');
assert.equal(clean(await roster.locator('#start .source').textContent()),`Faction Pack v${factionRules.source.version} · Munitorum Field Manual ${pointsCatalog.source.version}`,'Personal reader must expose its current authenticated points source');
assert.match(await roster.locator('#unit-tech-priest-enginseer .roster-game-exported-cost').innerText(),new RegExp(`Exported points · source roster · matches current\\s+${enginseerPoints} pts`,'i'),'Personal reader must show a matching current-points validation');
await assertNoHorizontalOverflow(roster,'roster iPad');

const metrics = await desktop.evaluate(() => ({
  nodes: document.getElementsByTagName('*').length,
  bytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
  domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0
}));

await browser.close();
assert.deepEqual(failures, []);
console.log(JSON.stringify({ desktopLoadMs, ...metrics, screenshots: output }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
