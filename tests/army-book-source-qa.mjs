import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {indexCanonicalById,mergeCanonicalById} from '../books/shared/tools/canonical-join-contract.mjs';

const root=path.resolve(import.meta.dirname,'..');
const books={
  'tau-empire':{pages:61,detachments:3,updates:25,faqs:2,datasheets:39,imperialArmour:0,legends:0,units:39,enhancements:23,flagship:'Commander Farsight'},
  'chaos-space-marines':{pages:102,detachments:17,updates:4,faqs:15,datasheets:54,imperialArmour:0,legends:53,units:107,enhancements:62,flagship:'Abaddon the Despoiler'},
  orks:{pages:87,detachments:7,updates:42,faqs:5,datasheets:57,imperialArmour:1,legends:30,units:88,enhancements:44,flagship:'Ghazghkull Thraka'},
  'emperors-children':{pages:10,detachments:4,updates:17,faqs:3,datasheets:23,imperialArmour:0,legends:0,units:23,enhancements:34,flagship:'Fulgrim'},
  'space-marines':{pages:219,detachments:16,updates:5,faqs:14,datasheets:101,imperialArmour:2,legends:0,units:103,enhancements:87,flagship:'Intercessor Squad'},
  'dark-angels':{pages:17,detachments:5,updates:4,faqs:1,datasheets:16,imperialArmour:0,legends:3,units:19,enhancements:26,flagship:"Lion El'Jonson"}
};

const errors=[];
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const targetHtml=id=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'books',id,'scripts','target-data.js'),'utf8'),sandbox);return sandbox.window.WH_ARMY_BOOK_TARGETS.html;};
const rosterCatalog=id=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'books',id,'scripts','roster-data.js'),'utf8'),sandbox);return sandbox.window.WH_BOOK_ROSTER_CATALOG;};
const renderedBook=id=>fs.readFileSync(path.join(root,'books',id,'reader.html'),'utf8')+targetHtml(id);
const expect=(condition,message)=>{if(!condition)errors.push(message);};
const inventory=data=>[...(data.datasheets||[]),...(data.imperialArmour||[]),...(data.legends||[])];

// Exercise current canonical ID indexing and merge primitives without a stale synthetic CLI fixture.
function canonicalIdCompilerControls(){
  const first={id:'unit-first',title:'First definition',category:'Infantry',keywords:['INFANTRY']};
  const second={...first,id:'unit-second',title:'Second definition'};
  const duplicate={...second,id:first.id};
  const ids=records=>[...indexCanonicalById(records,{label:'synthetic source'}).keys()];
  assert.deepEqual(ids([first,second]),['unit-first','unit-second'],'unique canonical definitions retain exact identity and order');
  assert.throws(()=>ids([first,duplicate]),/duplicate synthetic source canonical ID unit-first/,'local duplicate rejected');
  assert.throws(()=>ids([{...first,layer:'datasheets'},{...duplicate,layer:'imperialArmour'}]),/duplicate synthetic source canonical ID unit-first/,'cross-layer duplicate rejected');
  assert.throws(()=>ids([{...first,owner:'dependency-current'},{...duplicate,owner:'dependency-legends'}]),/duplicate synthetic source canonical ID unit-first/,'dependency duplicate rejected before merge');
  const merged=mergeCanonicalById([first,second],[{...first,title:'Local overlay'}],{label:'synthetic unit',onConflict:'prefer-overlay'});
  assert.deepEqual(merged.map(({id,title})=>({id,title})),[{id:first.id,title:'Local overlay'},{id:second.id,title:second.title}],'local-over-dependency precedence preserved');
  const overlays=new Map([[second.id,['OVERLAY']]]),overlaid=merged.map(unit=>({...unit,intrinsicKeywords:[...(unit.keywords||[]),...(overlays.get(unit.id)||[])]}));
  assert.ok(overlaid.find(unit=>unit.id===second.id).intrinsicKeywords.includes('OVERLAY'),'dependency keyword augmentation uses exact canonical ID');
  assert.throws(()=>mergeCanonicalById([first],[duplicate],{label:'synthetic unit'}),/synthetic unit canonical ID collision unit-first/,'destructive merge fails closed');
  if(process.argv.includes('--duplicate-id-mutation')){
    const lossy=[first,duplicate].reduce((map,record)=>map.set(record.id,record),new Map());
    assert.notDeepEqual([...lossy.values()].map(({id,title})=>({id,title})),[first,second].map(({id,title})=>({id,title})),'the oracle detects count-preserving last-write-wins substitution');
    console.log('Duplicate canonical ID mutation: KILLED (last-write-wins substitution differs from the exact identity set)');
  }
  console.log('Canonical ID controls passed: unique, duplicate, cross-layer, dependency, overlay and pre-merge rejection');
}
canonicalIdCompilerControls();

for(const [id,expected] of Object.entries(books)){
  const base=`books/${id}`;
  const config=read(`${base}/book.config.json`);
  const pack=read(`${base}/${config.sources.factionPack}`);
  const codex=read(`${base}/${config.sources.codexDatasheets}`);
  const points=read(`${base}/${config.sources.points||`content/${id}-points.en.json`}`);
  const manifest=read(`${base}/${config.sources.manifest}`);
  const label=`${id}:`;
  expect(pack.meta?.pageCount===expected.pages,`${label} expected ${expected.pages} Faction Pack pages`);
  for(const field of ['detachments','updates','faqs'])expect((pack[field]||[]).length===expected[field],`${label} expected ${expected[field]} ${field}`);
  for(const field of ['datasheets','imperialArmour','legends'])expect((codex[field]||[]).length===expected[field],`${label} expected ${expected[field]} ${field}`);
  expect((points.units||[]).length===expected.units,`${label} expected ${expected.units} points units`);
  expect((points.enhancements||[]).length===expected.enhancements,`${label} expected ${expected.enhancements} Enhancements`);
  expect(inventory(codex).some(unit=>unit.title===expected.flagship),`${label} missing flagship datasheet ${expected.flagship}`);
  const ids=inventory(codex).map(unit=>unit.id);
  expect(new Set(ids).size===ids.length,`${label} duplicate datasheet IDs`);
  expect(manifest.gates?.publishAsComplete===false,`${label} verification source gate must remain active`);
  const codexLayer=manifest.layers?.find(layer=>layer.role==='codex-structure');
  expect(Boolean(codexLayer?.commit),`${label} missing pinned Codex snapshot commit`);
  expect(codexLayer?.commit===points.source?.commit,`${label} points and Codex snapshot commits differ`);
}

const bloodAngelsConfig=read('books/blood-angels/book.config.json');
const bloodAngelsCodex=read(`books/blood-angels/${bloodAngelsConfig.sources.codexDatasheets}`);
const bloodAngelsManifest=read(`books/blood-angels/${bloodAngelsConfig.sources.manifest}`);
const bloodAngelsMfm=read('books/blood-angels/sources/official-mfm-v1.2.json');
expect(bloodAngelsConfig.dependencies?.includes('space-marines'),'blood-angels: Space Marines dependency is absent');
expect(bloodAngelsConfig.expected?.codexDatasheets===15&&bloodAngelsCodex.datasheets?.length===15,'blood-angels: expected 15 local Datasheets');
expect(bloodAngelsConfig.dependencyDatasheets?.currentOnly===true,'blood-angels: shared Datasheets must use the current Space Marines inventory');
expect(bloodAngelsConfig.dependencyDetachments?.expected===16,'blood-angels: shared Space Marines Detachment dependency is absent');
expect(bloodAngelsManifest.gates?.publishAsComplete===false,'blood-angels: verification source gate must remain active');

const csmPack=read('books/chaos-space-marines/content/chaos-space-marines-faction-pack.en.json');
const csmCodex=read('books/chaos-space-marines/content/chaos-space-marines-codex-datasheets.en.json');
const csmBsdata=read('books/chaos-space-marines/sources/bsdata-chaos-space-marines-11e.json');
const csmPoints=read('books/chaos-space-marines/content/chaos-space-marines-points.en.json');
const csmRelated=read('books/chaos-space-marines/content/chaos-space-marines-related-rules.en.json');
const csmMfm=read('books/chaos-space-marines/sources/official-mfm-v1.3.json');
const csmReader=renderedBook('chaos-space-marines');
expect(csmPack.meta?.version==='1.2'&&csmPack.meta?.sha256==='F3A8D05ED88BAD5085D014BF76FAD684B60336F92CF75CF3AED30B989A33A495','chaos-space-marines: current official Faction Pack v1.2 provenance mismatch');
const normalizeHashPayload=value=>Array.isArray(value)?value.map(normalizeHashPayload):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalizeHashPayload(value[key])])):value;
const bloodAngelsMfmPayload=Object.fromEntries(bloodAngelsMfm.hashModel.fields.map(field=>[field,bloodAngelsMfm[field]]));
const bloodAngelsMfmDigest=crypto.createHash('sha256').update(JSON.stringify(normalizeHashPayload(bloodAngelsMfmPayload)),'utf8').digest('hex').toUpperCase();
expect(bloodAngelsMfm.version==='v1.2'&&bloodAngelsMfm.counts?.nativeUnits===15&&bloodAngelsMfm.counts?.canonicalSharedUnits===82&&bloodAngelsMfm.counts?.specialScopeUnits===2&&bloodAngelsMfm.counts?.localDetachments===8&&bloodAngelsMfm.counts?.localEnhancements===26,'blood-angels: official MFM v1.2 capture inventory mismatch');
expect(bloodAngelsMfm.captureSha256===bloodAngelsMfmDigest&&bloodAngelsMfm.hashModel?.scope==='normalizedPayload','blood-angels: MFM normalized payload hash mismatch');
expect(!JSON.stringify(bloodAngelsMfm).includes(' ? '),'blood-angels: MFM capture contains a damaged separator');
const csmMfmPayload=Object.fromEntries(csmMfm.hashModel.fields.map(field=>[field,csmMfm[field]]));
const csmMfmDigest=crypto.createHash('sha256').update(JSON.stringify(normalizeHashPayload(csmMfmPayload)),'utf8').digest('hex').toUpperCase();
expect(csmMfm.version==='v1.3'&&csmMfm.counts?.units===54&&csmMfm.counts?.unitPointSchedules===91&&csmMfm.counts?.pricedOptions===3&&csmMfm.counts?.detachments===17&&csmMfm.counts?.enhancements===62,'chaos-space-marines: official MFM v1.3 capture inventory mismatch');
expect(csmMfm.captureSha256===csmMfmDigest&&csmMfm.hashModel?.scope==='normalizedPayload','chaos-space-marines: MFM normalized payload hash mismatch');
expect(csmMfm.unitOverrides.length===54&&csmMfm.unitOverrides.every(item=>item.points.length),'chaos-space-marines: current unit schedules are not fully represented');
expect(csmMfm.unitOverrides.reduce((sum,item)=>sum+item.points.length,0)===91,'chaos-space-marines: expected all 91 current MFM unit schedule rows');
expect(csmMfm.unitOverrides.reduce((sum,item)=>sum+(item.paidWargear?.length||0),0)===3,'chaos-space-marines: expected all three current MFM priced options');
const csmTypes=new Map([
  ['Warpstrike Champions|Empyric Dislocation','battle-tactic'],['Warpstrike Champions|Warp-tainted','strategic-ploy'],['Warpstrike Champions|Armour of Corruption','strategic-ploy'],['Warpstrike Champions|Siegebreaker Strike','strategic-ploy'],['Warpstrike Champions|Warp Flicker','strategic-ploy'],['Warpstrike Champions|Portal of Spite','battle-tactic'],
  ['Cult of the Arkifane|Touch of the Arkifane','battle-tactic'],['Cult of the Arkifane|Biomechanoid Regeneration','epic-deed'],['Cult of the Arkifane|Balefire Boon','battle-tactic'],['Cult of the Arkifane|Forge-fire Surge','strategic-ploy'],['Cult of the Arkifane|Soul-tally Offering','battle-tactic'],['Cult of the Arkifane|Unholy Fortitude','strategic-ploy'],
  ['Creations of Bile|Monstrous Visages','strategic-ploy'],['Creations of Bile|Delayed Mutations','strategic-ploy'],['Creations of Bile|Masters Are Watching','strategic-ploy'],['Creations of Bile|Diabolic Regeneration','strategic-ploy'],['Creations of Bile|Specimens for the Spider','strategic-ploy'],['Creations of Bile|Autostimulants','strategic-ploy'],
  ['Huron’s Marauders|Hardened Killers','battle-tactic'],['Huron’s Marauders|Reavers’ Flurry','battle-tactic'],['Huron’s Marauders|At the Tyrant’s Command','strategic-ploy'],['Huron’s Marauders|To the Favoured the Spoils','strategic-ploy'],['Huron’s Marauders|Seize the Prize','battle-tactic'],['Huron’s Marauders|Encircling Surge','strategic-ploy'],
  ['Renegade Warband|Never Outgunned','epic-deed'],['Renegade Warband|Renegade Claim','strategic-ploy'],['Renegade Warband|Vengeful Destruction','battle-tactic'],['Renegade Warband|Corrupted Munitions','battle-tactic'],['Renegade Warband|Undying Hatred','strategic-ploy'],['Renegade Warband|Reavers’ Reaction','strategic-ploy']
]);
const csmStratagems=csmPack.detachments.flatMap(detachment=>detachment.stratagems.map(item=>({detachment,item})));
expect(csmTypes.size===30&&csmStratagems.filter(({detachment,item})=>item.typeStatus==='confirmed'&&csmTypes.get(`${detachment.title}|${item.title}`)===item.canonicalType).length===30,'chaos-space-marines: source-confirmed canonical Stratagem types mismatch');
expect(csmStratagems.filter(({item})=>item.typeStatus==='source-untyped'&&item.canonicalType===null&&item.sourceLabel==='Type unverified').length===15,'chaos-space-marines: source-untyped Stratagems received invented types');
for(const {detachment,item} of csmStratagems){
  const expected=item.typeStatus==='confirmed'?`data-stratagem-type="${item.canonicalType}"`:'data-stratagem-type="source-untyped"';
  const cardPattern=new RegExp(`<article class="stratagem surface" data-rule-id="${item.id}"[^>]*${expected}`);
  expect(cardPattern.test(csmReader),`chaos-space-marines: canonical type presentation missing ${detachment.title} / ${item.title}`);
}
expect(new Set(csmPoints.enhancements.map(item=>`${item.detachment}|${item.title}`)).size===62,'chaos-space-marines: detachment-qualified Enhancement identity collision');
for(const title of ['Khorne Berzerkers','Noise Marines','Plague Marines','Rubric Marines','Cerberus','Fellblade','Leviathan Dreadnought','Mastodon'])expect(!csmCodex.datasheets.some(item=>item.title===title),`chaos-space-marines: ${title} must not appear in the current Datasheets inventory`);
const csmCurrentIds=new Set(csmCodex.datasheets.map(item=>item.id));
const csmRelatedIds=[];
(function collectUnitIds(value){if(Array.isArray(value))value.forEach(collectUnitIds);else if(value&&typeof value==='object')for(const [key,item] of Object.entries(value))key==='unitIds'&&Array.isArray(item)?csmRelatedIds.push(...item):collectUnitIds(item);})(csmRelated);
expect(csmRelatedIds.every(id=>csmCurrentIds.has(id)),'chaos-space-marines: Compatible Rules reference a non-current Datasheet');
const csmByTitle=new Map(csmCodex.datasheets.map(item=>[item.title,item]));
const sourceObjects=[];
(function collectSourceObjects(value){if(Array.isArray(value))value.forEach(collectSourceObjects);else if(value&&typeof value==='object'){sourceObjects.push(value);Object.values(value).forEach(collectSourceObjects);}})(csmBsdata);
const sourceTraitor=sourceObjects.find(item=>item.type==='unit'&&item.name==='Traitor Enforcer'&&item.selectionEntries?.filter(child=>child.type==='model').length===2);
const sourceModelKeywords=Object.fromEntries(sourceTraitor?.selectionEntries?.filter(item=>item.type==='model').map(item=>[item.name,(item.categoryLinks||[]).map(link=>link.name.replace(/^Faction:\s*/i,''))])||[]);
const canonicalTraitor=csmByTitle.get('Traitor Enforcer');
const traitorRoster=rosterCatalog('chaos-space-marines').units.find(unit=>unit.id==='unit-traitor-enforcer');
expect(Boolean(sourceTraitor)&&Object.keys(sourceModelKeywords).length===2,'chaos-space-marines: Traitor Enforcer child-model BSData evidence missing');
expect(canonicalTraitor?.composition?.length===2,'chaos-space-marines: Traitor Enforcer canonical model composition missing');
for(const model of canonicalTraitor?.composition||[]){
  expect(JSON.stringify(model.intrinsicKeywords)===JSON.stringify(sourceModelKeywords[model.name]),`chaos-space-marines: Traitor Enforcer ${model.name} model-scoped keywords lost during BSData extraction`);
  const modelId=traitorRoster?.gameSelections?.models?.find(item=>item.title===model.name)?.id;
  expect(Boolean(modelId),`chaos-space-marines: Traitor Enforcer ${model.name} canonical roster model identity missing`);
  const row=csmReader.match(new RegExp(`<p class="model-keywords" data-roster-model-id="${modelId}">[\\s\\S]*?</p>`))?.[0]||'';
  for(const keyword of sourceModelKeywords[model.name]||[])expect(row.includes(`data-model-keyword="${keyword}"`),`chaos-space-marines: Traitor Enforcer ${model.name} model-scoped keyword ${keyword} is not published`);
}
expect(csmCodex.datasheets.some(unit=>unit.abilities?.some(item=>item.title==='Dark Pacts'&&item.text.includes('make a Dark Pact'))),'chaos-space-marines: frozen Datasheet evidence is missing Dark Pacts');
expect(csmReader.includes('<section class="content-group" id="army-rule-dark-pacts"'),'chaos-space-marines: Dark Pacts is absent from the rendered Army Rules section');
for(const [leader,role,targets] of [['Traitor Enforcer','leader',['TRAITOR GUARDSMEN SQUAD']],['Masters of the Maelstrom','support',['CHOSEN','LEGIONARIES','RED CORSAIRS RAIDERS']]]){
  const unit=csmByTitle.get(leader);
  for(const target of targets){
    expect(unit?.relations?.[role]?.includes(target),`chaos-space-marines: ${leader} missing frozen ${role} destination ${target}`);
    const targetId=[...csmByTitle.values()].find(item=>item.title.toUpperCase()===target)?.id;
    expect(targetId&&csmReader.includes(`data-journey-target="${targetId}"`),`chaos-space-marines: ${leader} Leader destination ${target} is not clickable`);
  }
}
const csmDefiler=csmByTitle.get('Defiler');
expect(csmDefiler?.abilities?.some(item=>item.title.startsWith('Damaged:')&&item.text.includes('1-6 wounds remaining')),'chaos-space-marines: Defiler Damaged rule is missing');
const csmTransports=csmCodex.datasheets.filter(unit=>unit.relations?.transport?.length);
expect(csmTransports.length===2&&csmReader.includes('<h4>Transport</h4>'),'chaos-space-marines: expected two rendered source-backed Transport relations');
for(const [title,options] of [['Defiler',[['Heavy reaper autocannon',15],['Hades lascannon',15]]],['Forgefiend',[['Ectoplasma cannon',5]]]]){
  const actual=(csmByTitle.get(title)?.paidWargear||[]).map(item=>[item.name,item.value]).sort(([a],[b])=>a.localeCompare(b));
  expect(JSON.stringify(actual)===JSON.stringify([...options].sort(([a],[b])=>a.localeCompare(b))),`chaos-space-marines: ${title} paid options do not match MFM v1.3`);
  for(const [name,value] of options)expect(csmReader.includes(`${name} · +${value} pts`),`chaos-space-marines: ${title} paid option ${name} is not rendered`);
}

const daConfig=read('books/dark-angels/book.config.json');
const daPack=read(`books/dark-angels/${daConfig.sources.factionPack}`);
const daCodex=read(`books/dark-angels/${daConfig.sources.codexDatasheets}`);
const daPoints=read('books/dark-angels/content/dark-angels-points.en.json');
const daMfm=read('books/dark-angels/sources/official-mfm-v1.2.json');
const daManifest=read('books/dark-angels/sources/source-manifest.json');
const daReader=renderedBook('dark-angels');
const daPdf=fs.readFileSync(path.join(root,'books/dark-angels',daPack.meta.file));
const daDigest=crypto.createHash('sha256').update(daPdf).digest('hex').toUpperCase();
expect(daConfig.dependencyDetachments?.expected===16,'dark-angels: shared Space Marines Detachment dependency is absent');
expect(daDigest==='B33B79C207D910A8E6AEC4ABFA8042507154E7FF17CB88D8E9A77D4C02C78BB1','dark-angels: official PDF SHA-256 changed');
expect(daPack.meta?.sha256===daDigest,'dark-angels: generated provenance must use the committed PDF hash');
const daSerialized=JSON.stringify(daPack);
for(const corrupted of ['Dark Dngels','DDEPTUS DSTDRTES','Drmour of Contempt','Dncient','Deathwing Dssault'])expect(!daSerialized.includes(corrupted),`dark-angels: corrupted extraction remains: ${corrupted}`);
for(const required of ['Dark Angels','ADEPTUS ASTARTES','Armour of Contempt','Ancient Weapons','Deathwing Assault'])expect(daSerialized.includes(required),`dark-angels: corrected extraction missing ${required}`);
for(const required of ['Mist-wreathed Shadow Realms','Martial Exemplar','Lightning-fast Manoeuvres','Grand Master of the Ravenwing'])expect(daSerialized.includes(required),`dark-angels: Faction Pack v1.1 update missing ${required}`);

const daStratagems=daPack.detachments.flatMap(detachment=>detachment.stratagems);
const daUntyped=new Set(['Searing Bursts','No Sacrifice Too Great','Revelation of Guilt','Skyborne Surveillance','Wings of Shadow','We Are Vengeance','Exacting Punishment','Terrifying Zeal','Wages of Cowardice']);
const daTypes=new Map([
  ['Overpowering Exaction','strategic-ploy'],['Armour of Contempt','battle-tactic'],['Strength in Unity','battle-tactic'],
  ['Knights of Iron','strategic-ploy'],['Illuminating Fire','battle-tactic'],['Inescapable Wrath','strategic-ploy'],
  ['Inescapable Justice','battle-tactic'],["Lion’s Will",'strategic-ploy'],['Tactical Mastery','battle-tactic'],
  ['Relics of the Dark Age','strategic-ploy'],['Leonine Aggression','strategic-ploy']
]);
expect(daStratagems.length===21,'dark-angels: expected 21 Faction Pack Stratagems');
expect(daStratagems.filter(item=>item.typeStatus==='source-untyped'&&item.canonicalType===null&&daUntyped.has(item.title)).length===9,'dark-angels: expected nine source-untyped Stratagems');
expect(daStratagems.filter(item=>item.typeStatus==='confirmed'&&daTypes.get(item.title)===item.canonicalType).length===12,'dark-angels: expected twelve source-confirmed canonical Stratagem types');

const daCurrent=daCodex.datasheets,daLegends=daCodex.legends;
expect(daCurrent.length===16,'dark-angels: current local inventory must contain 16 datasheets');
expect(daLegends.length===3,'dark-angels: source archive must retain three Legends datasheets');
const categoryCounts=Object.groupBy(daCurrent,unit=>unit.category);
for(const [category,count] of Object.entries({'Characters':1,'Epic Heroes':7,'Infantry':3,'Vehicle':4,'Mounted':1}))expect((categoryCounts[category]||[]).length===count,`dark-angels: expected ${count} ${category}`);
expect(!categoryCounts.Other,'dark-angels: source categories must not fall through to Other');

const chapterKeywords=new Set(daConfig.dependencyDatasheets.excludeAnyKeywords);
const smConfig=read('books/space-marines/book.config.json');
const smCodex=read('books/space-marines/content/space-marines-codex-datasheets.en.json');
const compatibilityKeywords=unit=>smConfig.unitCompatibleChapterKeywords?.[unit.id]||[];
const inclusionKeywords=unit=>[...(unit.keywords||[]),...compatibilityKeywords(unit)];
const intrinsicKeywordMatches=(unit,keyword)=>(unit.keywords||[]).some(value=>value.toUpperCase()===keyword);
const smCurrent=[...smCodex.datasheets,...smCodex.imperialArmour];
const smGeneric=smCurrent.filter(unit=>!inclusionKeywords(unit).some(keyword=>chapterKeywords.has(keyword.toUpperCase())));
const pedro=smCodex.datasheets.find(unit=>unit.id==='unit-pedro-kantor');
expect(Boolean(pedro),'space-marines: Pedro Kantor source datasheet missing');
expect(!intrinsicKeywordMatches(pedro,'IMPERIAL FISTS'),'space-marines: Pedro Kantor must not have intrinsic IMPERIAL FISTS');
expect(intrinsicKeywordMatches(pedro,'CRIMSON FISTS'),'space-marines: Pedro Kantor must have intrinsic CRIMSON FISTS');
expect(compatibilityKeywords(pedro).map(keyword=>keyword.toUpperCase()).includes('IMPERIAL FISTS'),'space-marines: Pedro Kantor must declare IMPERIAL FISTS compatibility');
expect(!smGeneric.includes(pedro),'dark-angels: Pedro Kantor compatibility must exclude him from generic dependency candidates');
const lysander=smCodex.datasheets.find(unit=>unit.id==='unit-darnath-lysander');
expect(Boolean(lysander),'space-marines: Darnath Lysander source datasheet missing');
expect(intrinsicKeywordMatches(lysander,'IMPERIAL FISTS'),'space-marines: Darnath Lysander intrinsic IMPERIAL FISTS identity changed');
expect(compatibilityKeywords(lysander).length===0,'space-marines: Darnath Lysander must not require compatibility metadata');
expect(!smGeneric.includes(lysander),'dark-angels: intrinsic IMPERIAL FISTS units must remain excluded');
expect(smCodex.datasheets.filter(unit=>intrinsicKeywordMatches(unit,'CRIMSON FISTS')).every(unit=>unit.id==='unit-pedro-kantor'),'space-marines: CRIMSON FISTS leaked beyond Pedro Kantor');
expect(smCurrent.length-smGeneric.length===19,'dark-angels: expected 19 source-keyworded other-Chapter Space Marines exclusions');
expect(smGeneric.length===84,'dark-angels: expected 84 generic Space Marines dependency candidates');
const daReaderUnitIds=[...daReader.matchAll(/<article class="unit-card[^>]* id="([^"]+)"/g)].map(match=>match[1]);
expect(daReaderUnitIds.length===100,'dark-angels: reader must render 16 local and 84 shared datasheets');
expect(new Set(daReaderUnitIds).size===100,'dark-angels: reader contains duplicate canonical datasheet IDs');
for(const unit of daCurrent)expect(daReaderUnitIds.includes(unit.id),`dark-angels: reader lost local datasheet ${unit.title}`);
for(const unit of smGeneric)expect(daReaderUnitIds.includes(unit.id),`dark-angels: reader lost shared Space Marines datasheet ${unit.title}`);
for(const unit of daLegends)expect(!daReader.includes(`id="${unit.id}"`),`dark-angels: reader leaks Legends ${unit.title}`);
for(const unit of smCurrent.filter(unit=>!smGeneric.includes(unit)))expect(!daReaderUnitIds.includes(unit.id),`dark-angels: reader leaks other-Chapter Space Marines datasheet ${unit.title}`);
const sharedCategoryCounts=Object.groupBy(smGeneric,unit=>unit.category);
for(const [category,count] of Object.entries({'Battleline':4,'Characters':23,'Dedicated Transports':4,'Fortification':1,'Infantry':23,'Mounted':2,'Vehicle':27}))expect((sharedCategoryCounts[category]||[]).length===count,`dark-angels: expected ${count} shared Space Marines ${category}`);
for(const title of ['Hellblaster Squad','Intercessor Squad','Bladeguard Veteran Squad','Terminator Squad','Terminator Assault Squad','Outrider Squad','Land Raider','Redemptor Dreadnought'])expect(daReaderUnitIds.includes(smGeneric.find(unit=>unit.title===title)?.id),`dark-angels: representative shared datasheet missing ${title}`);
expect(!daReader.includes('data-nav-id="datasheets-dark-angels"')&&!daReader.includes('data-nav-id="datasheets-space-marines"'),'dark-angels: Datasheets navigation must remain unified');
expect(daReader.includes('data-term="space-marines-weapon-'),'dark-angels: shared datasheets must preserve canonical Space Marines term identity');
expect(!daReader.includes('data-term="dark-angels-weapon-plasma-incinerator'),'dark-angels: shared datasheet terms must not be duplicated under Dark Angels identity');
for(const [leader,target] of [['Belial','Terminator Squad'],['Azrael','Hellblaster Squad'],['Sammael','Outrider Squad']]){const targetId=smGeneric.find(unit=>unit.title===target)?.id;expect(daReader.includes(`data-journey-target="${targetId}"`),`dark-angels: ${leader} must link to shared ${target}`);}

const unitByTitle=new Map(daCurrent.map(unit=>[unit.title,unit]));
expect(daCurrent.some(unit=>(unit.relations?.leader||[]).length||(unit.relations?.support||[]).length),'dark-angels: Leader/support relations must not remain globally empty');
for(const [title,target,role='leader'] of [['Asmodai','Inner Circle Companions'],['Belial','Terminator Squad'],['Sammael','Outrider Squad'],['Ravenwing Command Squad','Ravenwing Black Knights','support']])expect(unitByTitle.get(title)?.relations?.[role]?.includes(target),`dark-angels: ${title} missing ${role} destination ${target}`);
expect(unitByTitle.get('Ezekiel')?.relations?.leader?.includes('Sternguard Veteran Squad'),'dark-angels: Ezekiel exact canonical target must remain resolved');

for(const title of ['Deathwing Knights','Deathwing Terminator Squad'])expect(unitByTitle.get(title)?.wargearAbilities?.some(item=>item.title==='Watcher in the Dark'),`dark-angels: ${title} must preserve source-owned Watcher in the Dark wargear`);
for(const [unit,title] of [['Azrael','The Lion Helm'],['Lazarus','The Spiritshield Helm'],['Deathwing Knights','Teleport Homer'],['Ravenwing Command Squad','Narthecium'],['Ravenwing Command Squad','Astartes Banner'],['Ravenwing Command Squad','Honour or Death']])expect(unitByTitle.get(unit)?.abilities.some(item=>item.title===title),`dark-angels: ${unit} must keep ${title} as an ordinary datasheet ability`);
expect(!daCurrent.some(unit=>(unit.wargearAbilities||[]).some(item=>item.title==='Invulnerable Save')),'dark-angels: Invulnerable Save must not be inferred as a Wargear Ability');
expect(/that use is [-\u2011]1 CP/i.test(unitByTitle.get('Ravenwing Command Squad')?.abilities.find(item=>item.title==='Honour or Death')?.text||''),'dark-angels: Honour or Death must use the official -1 CP update');
expect(unitByTitle.get("Lion El'Jonson")?.abilities.some(item=>item.title==='Mist-wreathed Shadow Realms'),'dark-angels: Lion must preserve the v1.1 reserve ability');
expect(unitByTitle.get("Lion El'Jonson")?.abilities.some(item=>item.title==='Martial Exemplar (Aura)'),'dark-angels: Lion must preserve the v1.1 Martial Exemplar aura');
expect(unitByTitle.get('Inner Circle Companions')?.abilities.find(item=>item.title==='Braziers of Judgement')?.text==='This unit has Stealth. Melee attacks that target this unit have -1 to Hit rolls.','dark-angels: Braziers of Judgement must use clean v1.1 wording');

const deathwingAssault=daPoints.enhancements.filter(item=>item.title==='Deathwing Assault');
expect(deathwingAssault.length===2,'dark-angels: expected two Deathwing Assault Enhancements');
expect(new Set(deathwingAssault.map(item=>item.id)).size===2,'dark-angels: Deathwing Assault IDs must be detachment-qualified');
expect(new Set(deathwingAssault.map(item=>item.detachment)).size===2,'dark-angels: Deathwing Assault instances must retain separate Detachments');
expect(new Set(deathwingAssault.map(item=>item.value)).size===2,'dark-angels: Deathwing Assault instances must retain separate points');
expect(daMfm.version==='v1.2'&&daMfm.sourceUpdatedAt==='2026-07-22'&&daMfm.capturedAt==='2026-08-11','dark-angels: MFM v1.2 dated capture metadata is invalid');
expect(daMfm.counts.nativeUnits===16&&daMfm.counts.canonicalSharedUnits===82&&daMfm.counts.specialScopeUnits===2&&daMfm.counts.routeUnits===100,'dark-angels: MFM inventory classification is invalid');
expect(daMfm.counts.localDetachments===8&&daMfm.counts.localEnhancements===26&&daMfm.counts.unresolved===0,'dark-angels: MFM local inventory must be fully resolved');
expect(daMfm.dependencyInventory.specialScope.map(item=>item.title).join('|')==='Astraeus|Thunderhawk Gunship','dark-angels: MFM special/Imperial Armour classification changed');
expect(daMfm.dependencyInventory.specialScope.every(item=>item.includedInCurrentDatasheets===false),'dark-angels: MFM-only special-scope records must not enter current Datasheets');
expect(daReader.includes('unit-astraeus')&&daReader.includes('unit-thunderhawk-gunship'),'dark-angels: current Space Marines Imperial Armour dependency is absent from navigation');
const daBlackKnights=daPoints.units.find(item=>item.title==='Ravenwing Black Knights');
expect(daBlackKnights?.points.length===4&&daBlackKnights.points.map(item=>item.value).join('|')==='75|150|85|160','dark-angels: Ravenwing Black Knights must use the current MFM copy-tier schedule');
expect(daPoints.enhancements.find(item=>item.title==='Stalwart Champion')?.value===15,'dark-angels: Stalwart Champion must use current MFM points');
expect(daManifest.layers.some(layer=>layer.id==='faction-pack-v1.2'&&layer.status==='current'&&layer.sha256===daDigest),'dark-angels: source manifest must identify current Faction Pack v1.2');
expect(daManifest.layers.some(layer=>layer.id==='mfm'&&layer.version==='v1.3'&&layer.status==='dated-capture'),'dark-angels: source manifest must identify current dated MFM capture');
expect(daManifest.gates?.publishAsComplete===false,'dark-angels: publishAsComplete must remain false');
expect(daReader.includes('data-term="space-marines-army-rule-oath-of-moment"'),'dark-angels: Oath of Moment must use the shared Space Marines identity');
expect(!daReader.includes('data-term="dark-angels-army-rule-oath-of-moment"'),'dark-angels: Oath of Moment must not be duplicated as a local identity');

const ownershipFixture=read('tests/fixtures/army-book-owned-datasheets.json');
const ownershipSources=[
  ['death-guard',read('books/death-guard/content/death-guard-rules.en.json').sections.filter(item=>item.kind==='unit').map(item=>item.id)],
  ...['adeptus-mechanicus','tyranids','tau-empire','emperors-children','space-marines'].map(id=>{const codex=read(`books/${id}/content/${id}-codex-datasheets.en.json`);return[id,[...(codex.datasheets||[]),...(codex.imperialArmour||[])].map(item=>item.id)];})
];
const sortedIds=items=>[...new Set(items)].sort();
const compareOwnershipLayer=(bookId,layer,expectedIds,actualIds)=>{
  const expected=sortedIds(expectedIds);
  const actual=sortedIds(actualIds);
  for(const id of expected.filter(id=>!actual.includes(id)))errors.push(`${bookId}: expected Datasheet ID ${id} is absent from ${layer}`);
  for(const id of actual.filter(id=>!expected.includes(id)))errors.push(`${bookId}: actual ${layer} contains unexpected Datasheet ID ${id}`);
};
for(const [id,sourceIds] of ownershipSources){
  const fixture=ownershipFixture.books[id];
  expect(!!fixture,`${id}: audited ownership fixture is absent`);
  if(!fixture)continue;
  expect(Array.isArray(fixture.datasheetIds),`${id}: audited ownership fixture datasheetIds is not an array`);
  expect(fixture.provenance?.inventoryPath,`${id}: audited ownership fixture provenance is absent`);
  expect(fixture.datasheetIds.length===new Set(fixture.datasheetIds).size,`${id}: audited ownership fixture contains duplicate Datasheet IDs`);
  const readerHtml=renderedBook(id);
  const desktopIds=sortedIds([...readerHtml.matchAll(/<article class="unit-card[^"]*" id="(unit-[^"]+)"/g)].map(match=>match[1]));
  compareOwnershipLayer(id,'extracted local inventory',fixture.datasheetIds,sourceIds);
  compareOwnershipLayer(id,'canonical reader output',fixture.datasheetIds,desktopIds);
}
expect(Object.keys(ownershipFixture.books).length===ownershipSources.length,'audited ownership fixture book count does not match working Army Books');
const canonicalBookIds=['death-guard','adeptus-mechanicus','tau-empire','emperors-children','tyranids','chaos-space-marines','space-marines','dark-angels','blood-angels'];
const redirectRuntime=fs.readFileSync(path.join(root,'books/shared/mobile-route-redirect.js'),'utf8');
expect(/destination\.search=location\.search/.test(redirectRuntime),'Mobile redirect no longer preserves query parameters');
expect(!/destination\.searchParams\.delete\('view'\)/.test(redirectRuntime),'Mobile redirect must preserve the responsive view selector');
expect(/destination\.hash=location\.hash\|\|root\.dataset\.canonicalTarget\|\|''/.test(redirectRuntime),'Mobile redirect no longer preserves an explicit hash or falls back to its canonical target');
expect(/location\.replace\(destination\.href\)/.test(redirectRuntime),'Mobile redirect no longer replaces the compatibility route');
for(const id of canonicalBookIds){
  const readerHtml=renderedBook(id);
  const mobileDir=path.join(root,'books',id,'mobile');
  const routes=fs.readdirSync(mobileDir).filter(file=>file.endsWith('.html'));
  expect(routes.length>0,`${id}: no Mobile compatibility routes found`);
  expect(/<article\b[^>]*\bclass="[^"]*\bunit-card\b/.test(readerHtml),`${id}: canonical reader has no Datasheet content`);
  for(const route of routes){
    const html=fs.readFileSync(path.join(mobileDir,route),'utf8');
    const target=html.match(/data-canonical-target="([^"]+)"/)?.[1];
    expect(/data-canonical-reader="\.\.\/reader\.html"/.test(html),`${id}/${route}: compatibility route does not name the canonical reader`);
    expect(Boolean(target),`${id}/${route}: compatibility route has no canonical target`);
    expect(target&&readerHtml.includes(`id="${target}"`),`${id}/${route}: canonical target ${target||'(missing)'} is absent from reader.html`);
    expect(/\.\.\/\.\.\/shared\/mobile-route-redirect\.js\?v=2/.test(html),`${id}/${route}: shared redirect runtime is absent`);
    expect(!/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/.test(html),`${id}/${route}: compatibility route contains duplicated Army Book content`);
  }
}
const dgOwned=read('books/death-guard/content/death-guard-rules.en.json').sections;
for(const id of ["unit-beasts-of-nurgle","unit-great-unclean-one","unit-nurglings","unit-plague-drones","unit-plaguebearers","unit-rotigus"])expect(dgOwned.some(item=>item.id===id&&item.kind==='unit'&&item.local!==false),`death-guard: source-owned ${id} was pruned as a dependency`);
const ecRaw=read('books/emperors-children/sources/bsdata-emperors-children-11e.json');
const ecFaction=ecRaw.documents?.find(item=>item.role==='faction')?.data?.catalogue;
const ecRootLinks=Array.isArray(ecFaction?.entryLinks)?ecFaction.entryLinks:(ecFaction?.entryLinks?.entryLink||[]);
for(const title of ["Shalaxi Helbane","Keeper of Secrets","Daemonettes","Fiends","Seekers"])expect(ecRootLinks.some(item=>item.name===title),`emperors-children: faction catalogue root is missing ${title}`);
const tyrPackOwnership=read('books/tyranids/content/tyranids-faction-pack.en.json').datasheets;
const tyrCodex=read('books/tyranids/content/tyranids-codex-datasheets.en.json');
const hyperadaptedRaveners=tyrCodex.datasheets.find(item=>item.id==='unit-hyperadapted-raveners');
const hyperadaptedProvenance=tyrPackOwnership.imperialArmour.find(item=>item.id==='hyperadapted-raveners');
expect(tyrCodex.datasheets.length===50,'tyranids: current canonical Datasheet inventory must contain 50 units');
expect(hyperadaptedRaveners?.status==='Current','tyranids: Hyperadapted Raveners must remain current');
expect(hyperadaptedRaveners?.sourceLayer==='faction-pack','tyranids: Hyperadapted Raveners must retain faction-pack ownership');
expect(!tyrCodex.imperialArmour.some(item=>item.id==='unit-hyperadapted-raveners'),'tyranids: Hyperadapted Raveners must not enter canonical Imperial Armour output');
expect(!tyrCodex.legends.some(item=>item.id==='unit-hyperadapted-raveners'),'tyranids: Hyperadapted Raveners must not be classified as Legends');
expect(hyperadaptedProvenance?.provenance?.sourceId==='tyranids-faction-pack-v1.2'&&hyperadaptedProvenance.sourcePages.join('|')==='13|14','tyranids: Hyperadapted Raveners lost official Faction Pack pages 13-14 provenance');
expect(ownershipFixture.books.tyranids.datasheetIds.includes('unit-hyperadapted-raveners'),'tyranids: current Hyperadapted Raveners ownership is absent from the audited fixture');
expect(ownershipFixture.books.tyranids.datasheetIds.includes('unit-raveners'),'tyranids: ordinary Raveners are absent from audited local ownership');
for(const id of ['unit-kroot-carnivores','unit-vespid-stingwings'])expect(ownershipFixture.books['tau-empire'].datasheetIds.includes(id),`tau-empire: source-owned ${id} is absent from audited local ownership`);
for(const id of ['unit-shalaxi-helbane','unit-keeper-of-secrets','unit-daemonettes','unit-fiends','unit-seekers'])expect(ownershipFixture.books['emperors-children'].datasheetIds.includes(id),`emperors-children: source-owned ${id} is absent from audited local ownership`);
for(const id of ['unit-marneus-calgar-in-armour-of-antilochus','unit-intercessor-squad'])expect(ownershipFixture.books['space-marines'].datasheetIds.includes(id),`space-marines: source-owned ${id} is absent from audited local ownership`);
expect(ownershipFixture.books['adeptus-mechanicus'].datasheetIds.includes('unit-thulia-ghuld'),'adeptus-mechanicus: source-owned unit-thulia-ghuld is absent from audited local ownership');

const badPatterns=[
  /\b(?:TYRANIDS|ASTARTES|INFANTRY|VEHICLE|MONSTER|CHARACTER|PSYKER|BATTLELINE|MOUNTED|TRANSPORT)(?:unit|units|model|models|or|and|when)\b/i,
  /\b[A-Za-z]+[a-z](?:Ability|Section)\b/,
  /\b(?:wearer|bearer) of 1\b/i,
  /\*\*|\^\^/,
  /\bAdpetus\b|\bMonsters models\b|\btht\b/
];
const scan=(value,file,trail=[])=>{
  if(trail.at(-1)==='pages')return;
  if(typeof value==='string')for(const pattern of badPatterns)if(pattern.test(value))errors.push(`${file}:${trail.join('.')}: suspicious text ${JSON.stringify(value.slice(0,180))}`);
  else if(Array.isArray(value))value.forEach((item,index)=>scan(item,file,[...trail,index]));
  else if(value&&typeof value==='object')for(const [key,item] of Object.entries(value))scan(item,file,[...trail,key]);
};
for(const id of ['tyranids',...Object.keys(books)]){
  for(const suffix of ['faction-pack.en.json','codex-datasheets.en.json','points.en.json']){
    const file=`books/${id}/content/${id}-${suffix}`;
    if(fs.existsSync(path.join(root,file)))scan(read(file),file);
  }
}
// The retired registry is not a factual owner. Native glossary parity checks current canonical source text.

const tyranids=read('books/tyranids/content/tyranids-points.en.json');
for(const [title,labels] of [['Termagants',['10 models','11-20 models']],['Hormagaunts',['10 models','11-20 models']]]){
  const unit=tyranids.units.find(item=>item.title===title);
  expect(JSON.stringify(unit?.points.map(item=>item.label))===JSON.stringify(labels),`tyranids: ${title} model ranges are not explicit`);
  expect(unit?.points.every(item=>Number.isInteger(item.minModels)&&Number.isInteger(item.maxModels)),`tyranids: ${title} points lack structural model ranges`);
}

if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Army Book source QA passed');
