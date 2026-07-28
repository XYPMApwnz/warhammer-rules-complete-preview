import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const books={
  'tau-empire':{pages:61,detachments:3,updates:25,faqs:2,datasheets:39,imperialArmour:4,legends:20,units:63,enhancements:23,flagship:'Commander Farsight'},
  'chaos-space-marines':{pages:102,detachments:9,updates:4,faqs:15,datasheets:58,imperialArmour:0,legends:53,units:111,enhancements:0,flagship:'Abaddon the Despoiler'},
  orks:{pages:85,detachments:6,updates:36,faqs:5,datasheets:57,imperialArmour:1,legends:30,units:88,enhancements:42,flagship:'Ghazghkull Thraka'},
  'emperors-children':{pages:10,detachments:4,updates:17,faqs:3,datasheets:23,imperialArmour:0,legends:0,units:23,enhancements:31,flagship:'Fulgrim'},
  'space-marines':{pages:217,detachments:15,updates:4,faqs:14,datasheets:83,imperialArmour:1,legends:75,units:159,enhancements:85,flagship:'Intercessor Squad'},
  'dark-angels':{pages:16,detachments:5,updates:3,faqs:1,datasheets:16,imperialArmour:0,legends:3,units:19,enhancements:26,flagship:"Lion El'Jonson"}
};

const errors=[];
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const expect=(condition,message)=>{if(!condition)errors.push(message);};
const inventory=data=>[...(data.datasheets||[]),...(data.imperialArmour||[]),...(data.legends||[])];

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
scan(read('glossary/registry.en.json'),'glossary/registry.en.json');

const tyranids=read('books/tyranids/content/tyranids-points.en.json');
for(const [title,labels] of [['Termagants',['10 models','11-20 models']],['Hormagaunts',['10 models','11-20 models']]]){
  const unit=tyranids.units.find(item=>item.title===title);
  expect(JSON.stringify(unit?.points.map(item=>item.label))===JSON.stringify(labels),`tyranids: ${title} model ranges are not explicit`);
  expect(unit?.points.every(item=>Number.isInteger(item.minModels)&&Number.isInteger(item.maxModels)),`tyranids: ${title} points lack structural model ranges`);
}

if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Army Book source QA passed');
