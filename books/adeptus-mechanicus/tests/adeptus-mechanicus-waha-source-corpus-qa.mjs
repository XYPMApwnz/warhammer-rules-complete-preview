import assert from 'node:assert/strict';
import crypto from 'node:crypto';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';
import {buildAdeptusMechanicusEffectiveModelInput} from '../tools/canonical-source-adapter.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus=json('books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json');
const defects=json('books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/source-defects.json');
const config=json('books/adeptus-mechanicus/book.config.json');
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/adeptus-mechanicus/book.config.json'),config});
const model=await buildAdeptusMechanicusEffectiveModelInput(context),mfm=json('books/adeptus-mechanicus/sources/official-mfm-v1.4.json');
const stable=v=>v&&typeof v==='object'?(Array.isArray(v)?v.map(stable):Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]))):v;
const sha=v=>crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex').toUpperCase();
const norm=v=>String(v??'').normalize('NFKD').replace(/\u00a0/g,' ').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[‐‑‒–—−]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
const semanticName=v=>norm(v).replace(/^➤\s*/,'').replace(/\s*&\s*/g,' and ').replace(/-/g,' ').replace(/\s+/g,' ').trim();
const abilitySet=v=>norm(v).split(',').map(x=>x.trim()).filter(x=>x&&x!=='-').sort().join('|');
const weaponKey=w=>[semanticName(w.name),norm(w.range),norm(w.attacks??w.a),norm(w.skill),norm(w.strength??w.s),norm(w.ap),norm(w.damage??w.d),abilitySet(Array.isArray(w.abilities)?w.abilities.join(','):w.abilities)].join('\0');
const inventory={armyRule:1,errata:8,detachment:10,detachmentRule:10,enhancement:34,enhancementWeaponProfile:1,stratagem:51,datasheet:34,statline:34,statCharacteristic:233,weaponProfile:138,wargearOption:41,datasheetSection:86,datasheetSectionBlock:122,ruleReference:1045,keywordOccurrence:232};
assert.equal(corpus.schema,'wh40k-waha-adeptus-mechanicus-corpus/v1');assert.equal(corpus.edition,'11E');assert.equal(corpus.captureDate,'2026-09-25');assert.equal(corpus.currentnessCutoff,'2026-09-22');assert.equal(corpus.pages.length,35);assert.deepEqual(corpus.inventory,inventory);assert.equal(corpus.gameplayUnits,2080);
const fingerprintPayload=Object.fromEntries(Object.entries(corpus).filter(([k])=>!['pages','corpusFingerprint'].includes(k)));assert.equal(sha(fingerprintPayload),corpus.corpusFingerprint);assert.equal(corpus.corpusFingerprint,'82DFB94AE1E0C8EAE57A15F813636A6EA27495D48B8AA7511AA3C14FE507F5C4');assert.ok(corpus.pages.every(p=>/^[A-F0-9]{64}$/.test(p.sha256)&&p.bytes>0));assert.equal(new Set(corpus.pages.map(p=>p.url)).size,35);assert.equal(defects.records.length,6);
const acceptedTitles=new Map(defects.records.filter(record=>record.classification==='SECONDARY_SOURCE_TITLE_DEFECT').map(record=>[norm(record.wahaValue),norm(record.acceptedValue)]));
const units=new Map(model.units.map(u=>[u.id,u]));assert.equal(units.size,34);
let statFacts=0,weaponFacts=0,wargearFacts=0,keywordFacts=0;
for(const source of corpus.datasheets){
 const id=source.sourceId.replace(/^datasheet-/,'unit-'),unit=units.get(id);assert.ok(unit,`${id}: missing canonical unit`);
 const stats=unit.profiles?.[0]?.stats||unit.stats,keys={SV:'Sv',LD:'Ld',INSV:'invulnerable'};
 for(const [key,value] of Object.entries(source.statline)){const actual=key==='INSV'?unit.invulnerable:Object.entries(stats).find(([name])=>name.toUpperCase()===key)?.[1];assert.equal(norm(actual),norm(value),`${id}: ${key}`);statFacts++;}
 assert.deepEqual(source.weapons.map(weaponKey).sort(),unit.weapons.map(weaponKey).sort(),`${id}: weapon profiles`);weaponFacts+=source.weapons.length*8;
 assert.deepEqual(source.wargearOptions.map(x=>norm(x.text).replace(/\s+-\s+/g,' ')).sort(),(unit.wargear||[]).map(x=>norm(x).replace(/\s+-\s+/g,' ')).sort(),`${id}: wargear`);wargearFacts+=source.wargearOptions.length;
 const flat=[...(unit.keywords||[])];for(const profile of unit.composition||[])for(const keyword of profile.intrinsicKeywords||[])if(!flat.includes(`${String(profile.name).toUpperCase()}: ${keyword}`))flat.push(`${String(profile.name).toUpperCase()}: ${keyword}`);
 const expected=[...source.keywords,...source.factionKeywords].map(norm).sort();const actual=flat.map(value=>norm(value).replace(/^servitor underseer:/,'underseer:')).sort();assert.deepEqual(actual,expected,`${id}: keywords`);keywordFacts+=expected.length;
}
assert.equal(statFacts,233);assert.equal(weaponFacts,1104);assert.equal(wargearFacts,41);assert.equal(keywordFacts,232);
const dets=new Map(model.detachments.map(d=>[d.id,d]));assert.equal(dets.size,10);let enhancements=0,stratagems=0,stratagemLines=0;
for(const source of corpus.detachments){const det=dets.get(source.sourceId);assert.ok(det);assert.ok(det.rule.text);assert.equal(det.enhancements.length,source.enhancements.length);assert.equal(det.stratagems.length,source.stratagems.length);assert.deepEqual(det.stratagems.map(x=>norm(x.title)).sort(),source.stratagems.map(x=>acceptedTitles.get(norm(x.title))??norm(x.title)).sort());enhancements+=source.enhancements.length;stratagems+=source.stratagems.length;stratagemLines+=source.stratagems.reduce((n,x)=>n+x.lines.length,0);}
assert.equal(enhancements,34);assert.equal(stratagems,51);assert.equal(stratagemLines,157);
for(const id of ['unit-thulia-ghuld','unit-hastarii-exterminators','unit-hastarii-fusiliers','unit-servitor-battleclade']){const source=corpus.datasheets.find(x=>x.sourceId.replace(/^datasheet-/,'unit-')===id),unit=units.get(id),body=norm(JSON.stringify(unit));for(const section of source.sections.filter(s=>['ABILITIES','ATTACHED UNIT','SUPREME COMMANDER','ICON OF WAR'].includes(s.title.toUpperCase())))for(const block of section.blocks){const [title,...rest]=block.text.split(':');assert.ok(body.includes(norm(title)),`${id}: ${title}`);const material=norm(rest.join(':')).replace('fusiller','fusilier');assert.ok(material.split(' ').filter(Boolean).slice(0,12).every(token=>body.includes(token)),`${id}: source text tokens`);}}
assert.equal(mfm.version,'v1.4');assert.equal(mfm.currentness,'CURRENT');assert.equal(mfm.counts.currentUnits,34);assert.equal(mfm.counts.pointRows,74);assert.equal(mfm.counts.paidOptions,2);assert.equal(mfm.counts.leaderEdges,24);assert.equal(mfm.counts.supportEdges,14);assert.equal(mfm.counts.detachments,10);assert.equal(mfm.counts.enhancements,34);assert.equal(model.sourceMetadata.officialMfm.version,'v1.4');
const textUnits=corpus.armyRules.reduce((n,r)=>n+r.components.length,0)+corpus.errata.length+corpus.detachments.length+corpus.detachments.reduce((n,d)=>n+d.enhancements.length+d.stratagems.reduce((m,s)=>m+s.lines.length,0),0)+corpus.datasheets.reduce((n,d)=>n+d.wargearOptions.length+d.sections.reduce((m,s)=>m+s.blocks.length,0),0);assert.equal(textUnits,375);
const structuredFacts=statFacts+weaponFacts+8+wargearFacts+keywordFacts+enhancements+stratagems+stratagemLines+mfm.counts.pointRows+mfm.counts.paidOptions+mfm.counts.leaderEdges+mfm.counts.supportEdges+mfm.counts.detachments+mfm.counts.enhancements;assert.equal(structuredFacts,2018);
console.log(`Adeptus Mechanicus Waha source corpus QA passed: ${corpus.gameplayUnits} source units, ${textUnits} text units, ${structuredFacts} structured facts, ${corpus.corpusFingerprint}.`);




