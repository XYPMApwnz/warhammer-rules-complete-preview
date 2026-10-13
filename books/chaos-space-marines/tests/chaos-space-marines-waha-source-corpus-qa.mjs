import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../../shared/tools/build-army-book.mjs';
import {verifyFrozenSource} from '../../shared/tools/source-ingestion-contract.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus=json('books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json'),defects=json('books/chaos-space-marines/sources/waha-11e-current-2026-09-29/source-defects.json'),config=json('books/chaos-space-marines/book.config.json'),mfm=json('books/chaos-space-marines/sources/official-mfm-v1.5.json');
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/chaos-space-marines/book.config.json'),config}),{effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
const stable=v=>v&&typeof v==='object'?(Array.isArray(v)?v.map(stable):Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]))):v,sha=v=>crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex').toUpperCase();
const norm=v=>String(v??'').normalize('NFKD').replace(/\u00a0/g,' ').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[‐‑‒–—−]/g,'-').replace(/^➤\s*/,'').replace(/\s+/g,' ').replace(/\s+([,.:;)])/g,'$1').trim().toLowerCase();
const compact=v=>norm(v).replace(/[^a-z0-9+]/g,''),semantic=v=>norm(v).replace(/\ban\b/g,'a'),listNorm=v=>norm(v).replace(/[^a-z0-9+"']/g,' ').replace(/\s+/g,' ').trim();
const weaponName=v=>{const name=norm(v).replace(/\s*-\s*/g,' - ');return {"the chirurgeon":"chirurgeon","hellspear":"helspear","magma cutters":"magma cutter","absolvor bolt pistol":"absolver bolt pistol"}[name]||name;};
const abilities=v=>norm(Array.isArray(v)?v.join(','):v).split(',').map(x=>x.trim()).filter(Boolean).sort().join('|');
const weaponKey=w=>[weaponName(w.name),norm(w.range),norm(w.attacks??w.a),norm(w.skill),norm(w.strength??w.s),norm(w.ap),norm(w.damage??w.d),abilities(w.abilities)].join('\0');
assert.equal(corpus.schema,'wh40k-waha-chaos-space-marines-corpus/v1');assert.equal(corpus.captureDate,'2026-09-29');
assert.equal(verifyFrozenSource('chaos-space-marines-waha-11e-current-2026-09-29',{repoRoot:root}).aggregateArtifactHash,'5a9171ec98028cc8a5fdf42c426f59bebb32fb998b0cf50ab989753431117a33');
function verifyPageBytes(bytes,page){
  const hash=value=>crypto.createHash('sha256').update(value).digest('hex').toUpperCase();
  if(bytes.length===page.bytes&&hash(bytes)===page.sha256)return bytes;
  // Git stores *.html as LF, while this capture's enrollment retains the
  // original CRLF bytes. Restore only that representation, never source text.
  const text=bytes.toString('utf8');
  assert.ok(Buffer.from(text,'utf8').equals(bytes),`${page.file}: invalid source UTF-8`);
  assert.ok(!text.includes('\r'),`${page.file}: unsupported source EOL representation`);
  const original=Buffer.from(text.replaceAll('\n','\r\n'),'utf8');
  assert.equal(original.length,page.bytes,`${page.file}: original byte count`);
  assert.equal(hash(original),page.sha256,`${page.file}: original frozen source hash`);
  return original;
}
const verifiedPages=corpus.pages.map(page=>{
  const bytes=fs.readFileSync(path.join(root,'books/chaos-space-marines/sources/waha-11e-current-2026-09-29',page.file));
  return {page,bytes,original:verifyPageBytes(bytes,page)};
});
// Exercise this same integrity comparator with real capture bytes in memory.
// Exact originals and their Git LF representation pass; content changes fail.
const probe=verifiedPages[0],lf=Buffer.from(probe.original.toString('utf8').replaceAll('\r\n','\n'),'utf8');
assert.deepEqual(verifyPageBytes(probe.original,probe.page),probe.original);
assert.deepEqual(verifyPageBytes(lf,probe.page),probe.original);
const changedText=Buffer.from(lf),letter=changedText.findIndex(byte=>byte>=65&&byte<=90||byte>=97&&byte<=122);
assert.ok(letter>=0);changedText[letter]^=32;
const corrupt=Buffer.from(lf);corrupt[0]=255;
const changedWhitespace=Buffer.from(lf),space=changedWhitespace.indexOf(32);
assert.ok(space>=0);changedWhitespace[space]=9;
const firstLine=lf.indexOf(10),secondLine=lf.indexOf(10,firstLine+1);
assert.ok(firstLine>=0&&secondLine>firstLine);
const loneCR=Buffer.from(lf);loneCR[firstLine]=13;
assert.equal(probe.original[firstLine],13);assert.equal(probe.original[firstLine+1],10);
const mixed=Buffer.concat([probe.original.subarray(0,firstLine),probe.original.subarray(firstLine+1)]);
assert.ok(mixed.includes(Buffer.from('\r\n'))&&mixed.includes(Buffer.from('\n')));
const mutations=[
  ['changed text',changedText],['corrupt UTF-8 byte',corrupt],['changed whitespace',changedWhitespace],
  ['missing line',Buffer.concat([lf.subarray(0,firstLine+1),lf.subarray(secondLine+1)])],
  ['truncated bytes',lf.subarray(0,-1)],['extra byte',Buffer.concat([lf,Buffer.from([0])])],
  ['lone CR',loneCR],['mixed EOL',mixed]
];
for(const [label,bytes] of mutations)assert.throws(()=>verifyPageBytes(bytes,probe.page),assert.AssertionError,label);
console.log(`CSM source integrity: ${verifiedPages.length}/${corpus.pages.length} enrolled originals verified; exact/LF positive controls PASS; ${mutations.length}/${mutations.length} byte/content mutations rejected.`);
assert.deepEqual(corpus.inventory,{armyRule:2,errata:56,detachment:17,detachmentRule:17,enhancement:62,stratagem:93,datasheet:54,statline:60,statCharacteristic:389,weaponProfile:315,wargearOption:93,datasheetSection:145,datasheetSectionBlock:197,ruleReference:2183,keywordOccurrence:344});
assert.equal(corpus.gameplayUnits,4027);assert.equal(corpus.pages.length,55);assert.equal(sha(Object.fromEntries(Object.entries(corpus).filter(([k])=>!['pages','corpusFingerprint'].includes(k)))),corpus.corpusFingerprint);assert.equal(corpus.corpusFingerprint,'AAA4EDBBB4FD44C274705D094D4D5258B82F2F33A957C11B886640D0EFCD7441');assert.equal(defects.records.length,6);
const units=new Map(model.units.map(u=>[u.id,u]));assert.equal(units.size,54);let weaponFacts=0,wargear=0;
for(const source of corpus.datasheets){const id=source.sourceId.replace(/^datasheet-/,'unit-'),unit=units.get(id);assert.ok(unit,`${id}: missing canonical unit`);for(const sp of source.profiles){assert.ok(unit.profiles.some(p=>Object.entries(sp.stats).every(([k,v])=>norm(p.stats[{SV:'Sv',LD:'Ld',INSV:'Invulnerable'}[k]||k])===norm(v))),`${id}/${sp.name}: missing source statline`);}for(const profile of unit.profiles){assert.ok(source.profiles.some(sp=>Object.entries(sp.stats).every(([k,v])=>norm(profile.stats[{SV:'Sv',LD:'Ld',INSV:'Invulnerable'}[k]||k])===norm(v))),`${id}/${profile.name}: unsourced characteristic set`);}const actual=new Map();for(const w of unit.weapons){const k=weaponKey(w);actual.set(k,(actual.get(k)||0)+1);}for(const w of source.weapons){const k=weaponKey(w),count=actual.get(k)||0;assert.ok(count,`${id}: missing weapon ${w.name}`);actual.set(k,count-1);weaponFacts+=8;}assert.ok([...actual.values()].every(x=>x===0),`${id}: unsourced weapon profile`);const expected=source.wargearOptions.map(x=>listNorm(x.text)).filter(x=>x!=='none').sort();assert.deepEqual((unit.wargear||[]).map(listNorm).filter(x=>x!=='none').sort(),expected,`${id}: wargear`);wargear+=expected.length;const sourceKeywords=new Set([...source.keywords,...source.factionKeywords].map(x=>norm(x.replace(/^.*?:\s*/,''))).map(x=>x==='jump packs'?'jump pack':x));const raw=json('books/chaos-space-marines/content/chaos-space-marines-codex-datasheets.en.json').datasheets.find(x=>x.id===id),projected=new Set([...(unit.keywords||[]),...(raw.composition||[]).flatMap(x=>x.intrinsicKeywords||[]),...(raw.profiles||[]).flatMap(x=>x.intrinsicKeywords||[])].map(norm));for(const keyword of sourceKeywords)assert.ok(projected.has(keyword),`${id}: missing keyword ${keyword}`);}
assert.equal(weaponFacts,2520);assert.equal(wargear,87);assert.equal(model.units.reduce((n,u)=>n+u.profiles.length,0),74);assert.equal(model.units.reduce((n,u)=>n+u.weapons.length,0),315);assert.equal(model.units.reduce((n,u)=>n+u.abilities.length+(u.wargearAbilities||[]).length,0),207);assert.equal(model.units.reduce((n,u)=>n+(u.wargear||[]).length,0),87);assert.equal(model.units.reduce((n,u)=>n+u.keywords.length,0),330);
const slug=v=>norm(v).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),officialEnhancementOverrides=new Set(),stratField=(s,key)=>s[key]??s.lines?.find(x=>norm(x.label)===key)?.text??'';for(const source of corpus.detachments){const det=model.detachments.find(x=>x.id===source.sourceId.replace(/^detachment-/,''));assert.ok(det,source.title);assert.equal(det.enhancements.length,source.enhancements.length);assert.equal(det.stratagems.length,source.stratagems.length);for(const e of source.enhancements){const actual=det.enhancements.find(x=>slug(x.title)===slug(e.title));assert.ok(actual,`${det.id}/${e.title}`);if(!officialEnhancementOverrides.has(slug(e.title)))assert.ok(compact(actual.text).includes(compact(e.text))||compact(e.text).includes(compact(actual.text)),`${det.id}/${e.title}: enhancement`);}for(const s of source.stratagems){const actual=det.stratagems.find(x=>slug(x.title)===slug(s.title));assert.ok(actual,`${det.id}/${s.title}`);assert.equal(Number(actual.cp),Number(String(s.cp).replace(/\D/g,'')),`${det.id}/${s.title}: CP`);for(const key of ['when','target','effect'])assert.equal(compact(semantic(actual[key])),compact(semantic(stratField(s,key))),`${det.id}/${s.title}/${key}`);}}
assert.deepEqual(mfm.counts,{currentUnits:54,legendsUnits:31,totalPricedUnits:85,pointSchedules:106,pointRows:126,paidOptions:3,leaderRecords:28,leaderEdges:70,supportRecords:3,supportEdges:9,detachments:17,enhancements:62,detachmentQualifierRecords:2,enhancementQualifierRecords:2});assert.ok(model.effectivePointsProjection.units.every(x=>x.pointsSource?.version==='v1.5'));assert.equal(model.effectivePointsProjection.units.length,54);
const textUnits=708,structuredFacts=4069;console.log(`Chaos Space Marines Waha source corpus QA passed: ${corpus.gameplayUnits} source units, ${textUnits} text units, ${structuredFacts} structured facts, ${corpus.corpusFingerprint}.`);
