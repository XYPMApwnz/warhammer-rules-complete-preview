import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const corpus=read('sources/waha-11e-current-2026-09-25/corpus.json');
const defects=read('sources/waha-11e-current-2026-09-25/source-defects.json');
const book=read('content/death-guard-rules.en.json');
const mfm=read('sources/official-mfm-v1.4.json');
const stable=value=>value&&typeof value==='object'?(Array.isArray(value)?value.map(stable):Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]))):value;
const sha=value=>crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex').toUpperCase();
const norm=value=>String(value??'').normalize('NFKD').replace(/\u00a0/g,' ').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[‐‑‒–—−]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
const units=new Map(book.sections.filter(record=>record.kind==='unit').map(record=>[record.id,record]));

assert.equal(corpus.schema,'wh40k-waha-death-guard-corpus/v1');
assert.equal(corpus.edition,'11E');
assert.equal(corpus.captureDate,'2026-09-25');
assert.equal(corpus.pages.length,37);
assert.equal(new Set(corpus.pages.map(page=>page.url)).size,37);
assert.ok(corpus.pages.every(page=>/^[A-F0-9]{64}$/.test(page.sha256)&&page.bytes>0));
const fingerprintPayload=Object.fromEntries(Object.entries(corpus).filter(([key])=>!['pages','corpusFingerprint'].includes(key)));
assert.equal(sha(fingerprintPayload),corpus.corpusFingerprint);
assert.equal(corpus.corpusFingerprint,'8ACEC4982442530F6FFB5D8FCF8C238E5B26BD649E4C407D5E48AC64C4702FAC');
assert.deepEqual(corpus.inventory,{armyRule:2,errata:4,detachment:9,detachmentRule:9,enhancement:30,stratagem:45,datasheet:36,statline:36,statCharacteristic:236,weaponProfile:146,wargearOption:43,datasheetSection:96,datasheetSectionBlock:136,ruleReference:1250,keywordOccurrence:260});
assert.equal(corpus.gameplayUnits,2338);
assert.equal(defects.records.length,4);
assert.equal(units.size,36);

let statFacts=0,weaponFacts=0,wargearFacts=0,keywordFacts=0;
for(const source of corpus.datasheets){
  const canonicalId=source.sourceId.replace(/^datasheet-/,'unit-'),unit=units.get(canonicalId);
  assert.ok(unit,`${source.sourceId}: missing canonical Datasheet`);
  const stats=unit.blocks.find(block=>block.type==='statline')?.values||{},statKeys={SV:'Sv',LD:'Ld',INSV:'Inv'};
  for(const [key,value] of Object.entries(source.statline)){assert.equal(norm(stats[statKeys[key]||key]),norm(value),`${source.sourceId}: ${key}`);statFacts++;}
  const weapons=unit.blocks.filter(block=>block.type==='weapon');assert.equal(weapons.length,source.weapons.length,`${source.sourceId}: weapon count`);
  source.weapons.forEach((weapon,index)=>{
    const actual=weapons[index],pairs=[['name',weapon.name,actual.name],['range',weapon.range,actual.range],['attacks',weapon.attacks,actual.a],['skill',weapon.skill,actual.skill],['strength',weapon.strength,actual.s],['ap',weapon.ap,actual.ap],['damage',weapon.damage,actual.d],['abilities',weapon.abilities.join(', ')||'-',actual.abilities||'-']];
    for(const [field,expected,value] of pairs){assert.equal(norm(value),norm(expected),`${source.sourceId}: weapon ${index+1} ${field}`);weaponFacts++;}
  });
  const options=(unit.subsections||[]).find(section=>section.title==='Wargear Options')?.blocks||[];assert.equal(options.length,source.wargearOptions.length,`${source.sourceId}: wargear count`);wargearFacts+=options.length;
  const keywordText=(unit.subsections||[]).find(section=>section.title==='Keywords')?.blocks?.[0]?.text||'';
  const keywordMatch=keywordText.match(/Keywords:\s*(.*?)\.\s*Faction Keywords:\s*(.*?)\./i);assert.ok(keywordMatch,`${source.sourceId}: keyword block`);
  const actualKeywords=[...keywordMatch[1].split(','),...keywordMatch[2].split(',')].map(value=>norm(value)).sort();
  const sourceKeywords=[...source.keywords,...source.factionKeywords].map(value=>norm(value)).sort();assert.deepEqual(actualKeywords,sourceKeywords,`${source.sourceId}: keywords`);keywordFacts+=sourceKeywords.length;
}
assert.equal(statFacts,236);assert.equal(weaponFacts,1168);assert.equal(wargearFacts,43);assert.equal(keywordFacts,260);

const detachments=new Map(book.sections.filter(record=>record.id.startsWith('detachment-')).map(record=>[record.id,record]));
assert.equal(detachments.size,9);
let enhancements=0,stratagems=0,stratagemLines=0;
for(const source of corpus.detachments){
  const detachment=detachments.get(source.sourceId);assert.ok(detachment,`${source.sourceId}: missing Detachment`);
  const rule=detachment.subsections.find(section=>section.title.startsWith('Detachment Rule'))?.blocks?.[0];assert.ok(rule?.text,`${source.sourceId}: missing rule`);
  const canonicalEnhancements=detachment.subsections.find(section=>section.title==='Enhancements')?.blocks||[];assert.equal(canonicalEnhancements.length,source.enhancements.length);enhancements+=source.enhancements.length;
  const canonicalStratagems=detachment.subsections.find(section=>section.title==='Stratagems')?.blocks||[];assert.equal(canonicalStratagems.length,source.stratagems.length);stratagems+=source.stratagems.length;
  source.stratagems.forEach((record,index)=>{const actual=canonicalStratagems[index];assert.equal(norm(actual.title.replace(/\s+-\s+\d+CP$/i,'')),norm(record.title));assert.equal(norm(actual.title.match(/(\d+CP)$/i)?.[1]),norm(record.cp));assert.equal(actual.lines.length,record.lines.length);stratagemLines+=record.lines.length;});
}
assert.equal(enhancements,30);assert.equal(stratagems,45);assert.equal(stratagemLines,136);
assert.equal(mfm.version,'v1.4');assert.equal(mfm.currentness,'CURRENT');assert.equal(mfm.counts.currentUnits,36);assert.equal(mfm.counts.detachments,9);assert.equal(mfm.counts.enhancements,30);assert.equal(mfm.counts.paidOptions,2);
assert.equal(book.audit.currentMFM,'v1.4');

const textUnits=corpus.armyRules.reduce((total,record)=>total+(record.components?.length||1),0)+corpus.errata.length+corpus.detachments.length+corpus.detachments.reduce((total,record)=>total+record.enhancements.length+record.stratagems.reduce((sum,item)=>sum+item.lines.length,0),0)+corpus.datasheets.reduce((total,record)=>total+record.wargearOptions.length+record.sections.reduce((sum,section)=>sum+section.blocks.length,0),0);
assert.equal(textUnits,364);
const structuredFacts=statFacts+weaponFacts+wargearFacts+keywordFacts+enhancements+stratagems+stratagemLines+mfm.counts.pointRows+mfm.counts.paidOptions+mfm.counts.leaderEdges+mfm.counts.supportEdges+mfm.counts.detachments+mfm.counts.enhancements;
assert.equal(structuredFacts,2045);
console.log(`Death Guard Waha source corpus QA passed: ${corpus.gameplayUnits} source units, ${textUnits} text units, ${structuredFacts} structured facts, ${corpus.corpusFingerprint}.`);


