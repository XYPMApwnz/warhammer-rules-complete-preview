import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyCoreCurrentOfficial,loadCoreCurrentOfficial,loadCoreSourceRegistry,validateCoreCurrentOfficial,validateCoreSourceRegistry} from '../content/core-current-official.mjs';
import {recordText} from '../content/record-content.mjs';
import {createCoreFactProjection} from '../content/core-fact-projection.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'content','core-rules.digital-11e.json'),'utf8'));
const source=loadCoreCurrentOfficial();
const registry=loadCoreSourceRegistry();
const effective=applyCoreCurrentOfficial(base,source);
const byCode=new Map(effective.records.map(record=>[record.code,record]));
assert.equal(byCode.size,effective.records.length,'effective Core IDs must be unique');
assert.deepEqual(new Set(effective.records.map(record=>record.code)),new Set(base.records.map(record=>record.code)),'official overrides must not silently add or drop base rule identities');
assert.deepEqual(new Set(source.ruleOverrides.map(update=>update.code)),new Set(['01.02.03','08.02.01','15.05','15.06','17.03']),'only adjudicated Core changes are accepted');
assert.deepEqual(new Set(effective.universalRulesUpdates.map(update=>update.id)),new Set([
  'uru-2026-07-22-stratagem-cp-cost',
  'uru-2026-07-22-stratagem-reuse',
  'uru-2026-07-22-defensive-stratagem-range',
  'uru-2026-07-22-identical-destroyed-unit',
  'uru-2026-08-26-disembark-move-types'
]),'each official universal update needs a stable identity');

const revival=recordText(byCode.get('01.02.03'));
assert(revival.includes('returns on its own as a unit of one')&&!revival.includes('still part of that attached unit'),'current official revival semantics must win');
assert(recordText(byCode.get('08.02.01')).includes('single extra CP per battle round'),'the official additional CP cap must be retained');
assert(byCode.get('15.06').compatibilityAliases.includes('Tank Shock'),'the explicitly confirmed former name must resolve to Crushing Impact');
assert(byCode.get('15.05').compatibilityAliases.includes('Grenade Stratagem')&&byCode.get('15.05').compatibilityAliases.includes('Grenades Stratagem'),'corroborated former Grenade names must resolve only to Explosives');
assert(recordText(byCode.get('17.03')).includes('targets of ranged attacks (excluding attacks made with [BLAST] weapons)'),'the corroborated Blast erratum must be in the effective main rule');
assert.equal(effective.records.filter(record=>record.code==='17.03').length,1,'the main-rule erratum must not create a duplicate rule');

const older=structuredClone(base);
const oldRevival=older.records.find(record=>record.code==='01.02.03');
const oldCp=older.records.find(record=>record.code==='08.02.01');
oldRevival.text=source.ruleOverrides.find(update=>update.code==='01.02.03').previousLine;
oldRevival.lists=[];
oldCp.text=oldCp.text.replace(/\s*In addition[^\n]*single extra CP per battle round\.?/i,'');
const repaired=applyCoreCurrentOfficial(older,source);
assert(recordText(repaired.records.find(record=>record.code==='01.02.03')).includes('returns on its own as a unit of one'),'later GW override must defeat older secondary revival text');
assert(!recordText(repaired.records.find(record=>record.code==='01.02.03')).includes('still part of that attached unit'),'superseded revival semantics must disappear');
assert(recordText(repaired.records.find(record=>record.code==='08.02.01')).includes('single extra CP per battle round'),'later GW cap must defeat an older secondary omission');
assert(!recordText(oldRevival).includes('returns on its own as a unit of one'),'negative control must actually poison the older snapshot');
assert(!recordText(oldCp).includes('single extra CP per battle round'),'negative control must actually remove the cap');
const unanchored=structuredClone(older);
unanchored.records.find(record=>record.code==='01.02.03').text=unanchored.records.find(record=>record.code==='01.02.03').text.replace(/If a leader or support model in an attached unit is destroyed and subsequently revived,[^\n]*/, 'Unidentified older wording.');
assert.throws(()=>applyCoreCurrentOfficial(unanchored,source),/missing official override anchor/,'unknown older wording must fail closed rather than silently retain it');
const secondaryOverride=structuredClone(source);
secondaryOverride.ruleOverrides[0].sourceClass='WAHA_SECONDARY';
assert.throws(()=>applyCoreCurrentOfficial(base,secondaryOverride),/Unknown Core authority class/,'secondary material cannot masquerade as an official override');
const secondaryOverOfficial=structuredClone(source);
Object.assign(secondaryOverOfficial.ruleOverrides[0],{sourceClass:'CURRENT_SECONDARY_CORROBORATED',sourceId:'waha-core-live-2026-09-20',sourceArtifact:'https://wahapedia.ru/wh40k11ed/the-rules/core-rules/',sourceDate:'2026-09-20',officialCorroboration:'gw-core-original-2026-06-01'});
assert.throws(()=>validateCoreCurrentOfficial(secondaryOverOfficial),/cannot displace an applicable official update/,'newer applicable official Core facts must defeat secondary wording');
const eventOverride=structuredClone(source);
Object.assign(eventOverride.ruleOverrides[0],{sourceId:'gw-tacoma-faq-2026-07-17',sourceArtifact:'https://assets.warhammer-community.com/articles/0-2026/july/wc06-07/faq-warhammer-open-tacoma-dtb3ingprd-cvcl2agtfd.pdf',sourceDate:'2026-07-17'});
assert.throws(()=>validateCoreCurrentOfficial(eventOverride),/Non-global source cannot own a Core rule/,'Tacoma event FAQ cannot become a global Core override');
const staleUniversal=structuredClone(source);
Object.assign(staleUniversal.universalRulesUpdates[0],{sourceId:'gw-universal-rules-updates-2026-07-22-v1-0',sourceArtifact:'https://assets.warhammer-community.com/eng_22-07_warhammer_40,000_universal_rules_updates-coltxp7ngi-3kvdfxwyon.pdf',sourceDate:'2026-07-22'});
assert.throws(()=>validateCoreCurrentOfficial(staleUniversal),/Superseded Core source/,'v1.0 cannot supersede the applicable v1.1 update');
const duplicateRegistry=structuredClone(registry);
duplicateRegistry.sources.push({...duplicateRegistry.sources[0]});
assert.throws(()=>validateCoreSourceRegistry(duplicateRegistry),/duplicate Core source/,'duplicate source identities must fail');

const projection=createCoreFactProjection();
assert.equal(recordText(projection.coreDigital.records.find(record=>record.code==='01.02.03')),revival,'Core projection must consume the effective record');
assert.deepEqual(new Set(projection.coreUniversalUpdates.map(update=>update.id)),new Set(effective.universalRulesUpdates.map(update=>update.id)),'Core projection must expose official universal updates');

const reader=fs.readFileSync(path.join(root,'reader','stratagems.html'),'utf8');
const search=JSON.parse(fs.readFileSync(path.join(root,'reader','search-index.json'),'utf8'));
const htmlText=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
for(const update of effective.universalRulesUpdates){
  assert(reader.includes(`data-update-id="${update.id}"`)&&reader.includes(htmlText(update.text)),'official universal update must be published with its exact canonical identity and semantics');
  assert(search.some(item=>item.code===update.id&&item.text===update.text),'official universal update must be searchable');
}
for(const code of ['01.02.03','08.02.01','15.05','15.06','17.03']){
  const record=byCode.get(code);
  assert(record.currentOfficialOverride?.sourceId&&record.currentOfficialOverride.sourceScope&&record.currentOfficialOverride.sourceArtifact&&record.currentOfficialOverride.sourceDate&&record.currentOfficialOverride.sourceLocator,'each override must carry explicit source provenance');
}
assert(search.find(item=>item.code==='15.06')?.text.includes('Tank Shock'),'former Tank Shock name must find current Crushing Impact record');
assert(search.find(item=>item.code==='15.05')?.text.includes('Grenade Stratagem'),'former Grenade name must find Explosives');
assert(search.find(item=>item.code==='17.03')?.text.includes('(excluding attacks made with [BLAST] weapons)'),'Reader search must use current effective main-rule text');
const moveUpdate=effective.universalRulesUpdates.find(update=>update.id==='uru-2026-08-26-disembark-move-types');
assert(moveUpdate?.sourceScope==='GLOBAL_CORE'&&moveUpdate.text.includes('assault disembark move')&&moveUpdate.text.includes('shock disembark move')&&new Set(moveUpdate.canonicalReferences).size===2&&moveUpdate.canonicalReferences.includes('18.06')&&moveUpdate.canonicalReferences.includes('18.07'),'August global disembark mapping must bind both move types');
assert(byCode.has('18.06')&&byCode.has('18.07'),'accepted deterministic Waha definitions must be available as full Core records');
assert.equal(byCode.get('18.06').title,'ASSAULT DISEMBARK MOVE');
assert.equal(byCode.get('18.07').title,'SHOCK DISEMBARK MOVE');
assert(recordText(byCode.get('18.06')).includes('SET-UP DISTANCE')&&recordText(byCode.get('18.07')).includes('SET-UP DISTANCE'),'accepted Waha move definitions must survive normalization');
assert(recordText(byCode.get('18.04')).includes('same rules and restrictions'),'the accepted Transport base must survive official normalization');
assert(recordText(projection.catalog.getByCode('18.05')).includes('If the above is not possible while remaining unengaged'),'the effective Emergency sequence must apply its enrolled source change');
const faqs=projection.coreSource.faqs||[];
assert.equal(new Set(faqs.map(faq=>faq.id)).size,faqs.length,'Core FAQ identities must remain unique');
for(const faq of faqs){
  assert(byCode.has(faq.primaryRule),`${faq.id} must bind to an existing canonical main rule`);
  for(const related of faq.relatedRules)assert(byCode.has(related),`${faq.id} must not reference an unknown Core rule ${related}`);
  assert(!byCode.has(faq.id),`${faq.id} must remain a FAQ clarification, not a rewritten main rule`);
}
console.log('Current official Core precedence, universal updates and Reader QA passed.');
