import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const viewer=read('glossary/viewer.js');
const css=read('glossary/viewer-progressive.css');
const index=read('glossary/index.html');
const compatibility=read('glossary/v2/compatibility.mjs');
const registry=JSON.parse(read('glossary/registry.en.json')).terms;
const aliases=JSON.parse(read('glossary/aliases.en.json')).aliases;
const values=Object.values(registry);
const normalize=value=>String(value||'').toLocaleLowerCase().replace(/\s+/g,' ').trim();
const placeholder=/^(?:See full rule|Open full rule|Reference entry)\.?$/i;
const meaningful=value=>Boolean(normalize(value))&&!placeholder.test(String(value).trim());
const repeatsDefinition=(summary,definition)=>{const quick=normalize(summary),full=normalize(definition);return quick&&full.startsWith(quick);};
const visibleTextBlocks=term=>{
  const summary=term.summary?.en||'',definition=term.definition?.en||'';
  return Number(meaningful(summary)&&!repeatsDefinition(summary,definition))+
    Number(meaningful(definition)&&term.presentation!=='profile');
};

assert.ok(Object.entries(registry).every(([id,term])=>term.id===id),'registry keys and canonical IDs must remain identical');
assert.equal(new Set(values.map(term=>term.id)).size,values.length,'canonical glossary IDs must remain unique');

const expectedFactualProfiles=[
  {id:'emperors-children-weapon-bolt-pistol-2',title:'Bolt pistol',locator:'unit-tormentors',summary:'Ranged · 12" · A 1 · BS 3+ · S 4 · AP 0 · D 1 · Pistol, Precision',weapon:{Range:'12"',A:'1',BS:'3+',S:'4',AP:'0',D:'1',Abilities:'Pistol, Precision'}},
  {id:'emperors-children-weapon-plasma-pistol-standard-2',title:'➤ Plasma pistol - standard',locator:'unit-tormentors',summary:'Ranged · 12" · A 1 · BS 3+ · S 7 · AP -2 · D 1 · Pistol, Precision',weapon:{Range:'12"',A:'1',BS:'3+',S:'7',AP:'-2',D:'1',Abilities:'Pistol, Precision'}},
  {id:'emperors-children-weapon-plasma-pistol-supercharge-2',title:'➤ Plasma pistol - supercharge',locator:'unit-tormentors',summary:'Ranged · 12" · A 1 · BS 3+ · S 8 · AP -3 · D 2 · Hazardous, Pistol, Precision',weapon:{Range:'12"',A:'1',BS:'3+',S:'8',AP:'-3',D:'2',Abilities:'Hazardous, Pistol, Precision'}},
  {id:'emperors-children-weapon-power-fist-2',title:'Power fist',locator:'unit-chaos-terminators',summary:'Melee · Melee · A 3 · WS 3+ · S 8 · AP -2 · D 2',weapon:{Range:'Melee',A:'3',WS:'3+',S:'8',AP:'-2',D:'2'}}
];
for(const expected of expectedFactualProfiles){
  const term=registry[expected.id];
  assert.ok(term,`${expected.id} must remain present`);
  assert.equal(term.kind,'weapon',`${expected.id} kind`);
  assert.equal(term.scope,'emperors-children',`${expected.id} scope`);
  assert.equal(term.title.en,expected.title,`${expected.id} title`);
  assert.equal(term.summary.en,expected.summary,`${expected.id} summary`);
  assert.deepEqual(term.structured.weapon,expected.weapon,`${expected.id} structured profile`);
  assert.equal(term.canonicalSource.locator,expected.locator,`${expected.id} source identity`);
}

assert.match(viewer,/const titleCounts=new Map\(\)/,'duplicate titles must be detected');
assert.match(viewer,/className='term-qualifier'/,'duplicate titles must display a source qualifier');
assert.match(viewer,/const titleMatches=ranked\.filter\(item=>item\.score<5\)/,'title and alias matches must remain ahead of body matches');
assert.match(viewer,/query&&titleMatches\.length\?titleMatches:ranked/,'body matches must remain fallback results');
assert.match(viewer,/presentationPriority=term=>term\.presentation==='profile'\?1:0/,'weapon profiles must lose only same-quality search ties');
assert.match(viewer,/a\.score-b\.score\|\|presentationPriority\(a\.term\)-presentationPriority\(b\.term\)/,'search ranking must preserve match quality before presentation priority');
assert.match(viewer,/technicalAlias=.*unit\|weapon\|ability/,'technical IDs must be recognised');
assert.match(viewer,/searchAliases=aliases\.filter/,'technical IDs must not flood prefix search results');

assert.match(viewer,/!repeatsDefinition\(summaryText,definitionText\)/,'repeated Quick Rule prefixes must remain suppressed');
assert.match(viewer,/term\.presentation!=='profile'\)detail\.append\(sectionLabel\(normalize\(definitionText\)===normalize\(summaryText\)\?'Rule':'Full rule'\)/,'a meaningful non-profile definition must always render once');
assert.doesNotMatch(viewer,/term\.presentation!=='profile'&&normalize\(definitionText\)!==normalize\(summaryText\)/,'equal summary and definition must not suppress both text blocks');
assert.match(viewer,/popupSummary\.textContent=term\.definition\?\.en\|\|''/,'popups must use the same effective definition as the full entry');

const searchable=values.filter(term=>term.presentation!=='metadata');
const contextOnlyTermIds=new Set([
  'space-marines-ability-invulnerable-save','space-marines-ability-invulnerable-save-2',
  'space-marines-ability-transport','space-marines-ability-transport-2','space-marines-ability-transport-3','space-marines-ability-transport-4','space-marines-ability-transport-5',
  'space-marines-ability-transport-6','space-marines-ability-transport-7','space-marines-ability-transport-8','space-marines-ability-transport-9','space-marines-ability-transport-10',
  'adeptus-mechanicus-datasheet-damaged-1-4-wounds-remaining',
  'emperors-children-ability-damaged-1-5-wounds-remaining','emperors-children-ability-damaged-1-6-wounds-remaining','emperors-children-ability-damaged-1-7-wounds-remaining',
  'space-marines-ability-damaged-1-4-wounds-remaining','space-marines-ability-damaged-1-5-wounds-remaining',
  'tau-empire-ability-damaged-1-4-wounds-remaining','tau-empire-ability-damaged-1-5-wounds-remaining','tau-empire-ability-damaged-1-5-wounds-remaining-2',
  'tyranids-ability-damaged-1-4-wounds-remaining','tyranids-ability-damaged-1-5-wounds-remaining'
]);
const technicalUnits=values.filter(term=>term.kind==='unit');
const contextOnly=values.filter(term=>term.kind==='unit'||contextOnlyTermIds.has(term.id));
const metadata=values.filter(term=>term.presentation==='metadata');
assert.equal(technicalUnits.filter(term=>term.scope==='death-guard').length,36,'all 36 Death Guard technical units must be classified structurally');
assert.equal(technicalUnits.filter(term=>term.scope==='adeptus-mechanicus').length,34,'all 34 Mechanicus technical units must be classified structurally');
assert.equal(contextOnly.length,93,'exactly 93 confirmed context-only entries must be classified');
assert.ok(contextOnly.every(term=>term.presentation==='metadata'),'all confirmed context-only entries must be hidden from ordinary search');
assert.equal(searchable.length,values.length-contextOnly.length,'only confirmed context-only entries may leave the catalogue');
assert.equal(metadata.length,contextOnly.length,'presentation policy must hide only context-only metadata');
assert.deepEqual(metadata.map(term=>term.id).sort(),contextOnly.map(term=>term.id).sort(),'no additional entries may be hidden');

const transports=contextOnly.filter(term=>/^space-marines-ability-transport(?:-\d+)?$/.test(term.id));
const damaged=contextOnly.filter(term=>/^Damaged:/i.test(term.title.en));
assert.equal(transports.length,10,'all 10 Transport capacity records must be hidden');
assert.equal(damaged.length,11,'all 11 Damaged profile records must be hidden');
assert.equal(registry['space-marines-ability-invulnerable-save'].definition.en,'4+','the local Invulnerable Save value must remain unchanged');
assert.equal(registry['space-marines-ability-invulnerable-save-2'].definition.en,'This model has a 4+ invulnerable save against melee attacks.','the Judiciar footnote must remain unchanged');
assert.match(registry['tau-empire-ability-damaged-1-5-wounds-remaining-2'].definition.en,/Objective Control characteristic/,'the Stormsurge-specific modifier must remain intact');

for(const id of [
  'core-characteristic-invulnerable-save','space-marines-ability-tempormortis','space-marines-ability-rampart','tau-empire-ability-shield-generator',
  'tyranids-ability-warp-field-aura-psychic','adeptus-mechanicus-datasheet-defend-the-divine-work'
])assert.ok(searchable.includes(registry[id]),`${id} must remain searchable`);
const weaponProfiles=values.filter(term=>term.kind==='weapon');
assert.equal(weaponProfiles.length,1123,'weapon profile inventory must remain stable');
assert.ok(weaponProfiles.every(term=>term.presentation==='profile'&&searchable.includes(term)),'all weapon profiles must remain searchable profiles');

const hiddenExistingPrimary=searchable.filter(term=>(meaningful(term.summary?.en)||meaningful(term.definition?.en))&&visibleTextBlocks(term)===0&&term.presentation!=='profile');
assert.deepEqual(hiddenExistingPrimary.map(term=>term.id),[],'searchable entries must not hide existing primary text');
assert.equal(hiddenExistingPrimary.filter(term=>term.presentation==='atomic').length,0,'atomic entries must show their explanation');
assert.equal(hiddenExistingPrimary.filter(term=>term.presentation==='reference').length,0,'reference entries must show their explanation');

const characteristics=searchable.filter(term=>term.kind==='characteristic');
assert.equal(characteristics.length,13,'all current characteristics must remain covered');
assert.ok(characteristics.every(term=>visibleTextBlocks(term)>0),'all characteristics must show their definition');
const invulnerable=registry['core-characteristic-invulnerable-save'];
assert.ok(invulnerable&&searchable.includes(invulnerable),'Invulnerable Save characteristic must remain searchable');
assert.equal(invulnerable.definition.en,'An alternative saving throw that is not modified by Armour Penetration.','the source definition must remain unchanged');
assert.equal(visibleTextBlocks(invulnerable),1,'Invulnerable Save characteristic must show its definition exactly once');

for(const label of ['Source revision','Source locator','Contributing sources'])assert.ok(viewer.includes(`'${label}'`),`${label} must be available in Registry details`);
assert.doesNotMatch(index,/<b>\s*3\s*<\/b>\s*connected books/i,'connected-book copy must not contain a stale hardcoded count');
assert.match(index,/<script type="module" src="\.\/v2\/compatibility\.mjs"/,'old Glossary entry must delegate to the shared application');
assert.doesNotMatch(index,/viewer\.js|glossary-v2-runtime\.js|glossary-autolink\.js/,'compatibility entry must not mount a second viewer/resolver');
assert.match(compatibility,/import \{encodeRoute\} from .*route-context\.mjs/,'compatibility entry must use the shared route contract');
assert.match(compatibility,/destination:'GLOSSARY'/,'compatibility entry must open the global catalog');
assert.match(compatibility,/location\.replace\(target\.href\)/,'redirect must replace the legacy history entry');
assert.match(css,/\.filters\{[^}]*flex-wrap:wrap[^}]*overflow:visible/,'filter chips must wrap instead of clipping');

// Execute the production parser without running the producer or cache writer.
const builder=read('glossary/tools/build-glossary.mjs');
const cleanSource=builder.slice(builder.indexOf('const clean='),builder.indexOf('const cleanRuleText='));
const parserSource=builder.match(/function weaponProfile\(summary\)\{[\s\S]*?\n\}/)[0];
const productionParser=vm.runInNewContext(cleanSource+'\n'+parserSource+'\nweaponProfile');
const parse=value=>JSON.parse(JSON.stringify(productionParser(value)));
const plain='Ranged · 18" · A 1 · BS 3+ · S 4 · AP -1 · D 1';
assert.equal(parse(plain+' · Pistol').Abilities,'Pistol','PISTOL_PROFILE_REGRESSION');
assert.equal(parse(plain).Abilities,undefined,'stats-only profile stays stats-only');
assert.equal(parse(plain+' · Abilities Pistol').Abilities,'Pistol','labelled abilities remain supported');
assert.equal(parse(plain+' · Pistol · unrelated body').Abilities,undefined,'do not collect arbitrary extra body fields');
assert.equal(parse(plain.replace(' · S 4',' · unrelated body · S 4')+' · Pistol').Abilities,undefined,'do not collect unmatched middle fields');
const daScope={window:{}};vm.runInNewContext(read('books/dark-angels/scripts/data.js'),daScope);
const daPistol=daScope.window.DG_TERMS['dark-angels-weapon-heavy-bolt-pistol'];
assert.equal(parse(daPistol.full).Abilities,'Pistol','DA uses the same production parser without global registration');
for(const [suffix,abilities] of [['plasma-pistol-standard','Pistol'],['plasma-pistol-supercharge','Hazardous, Pistol']]){
  const term=registry['space-marines-weapon-'+suffix];
  assert.equal(term.structured.weapon.Abilities,abilities,'profile mode isolation');
  assert.equal(parse(term.definition.en).Abilities,abilities,'production parser preserves this mode only');
}
// Browser coverage follows the active entry point; legacy factual/parser guards above remain intact.
if(process.argv.includes('--browser'))await import('../v2/glossary-browser-qa.mjs');
console.log(`Glossary viewer QA passed: ${values.length} canonical entries, ${Object.keys(aliases).length} aliases, ${hiddenExistingPrimary.length} hidden-primary violations, ${characteristics.length} visible characteristics; weapon abilities and mode isolation preserved.`);
