import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourcePath=path.join(root,'sources','bsdata-adeptus-mechanicus-11e.json');
const outputPath=path.join(root,'content','adeptus-mechanicus-codex-datasheets.en.json');
const points=JSON.parse(fs.readFileSync(path.join(root,'content','adeptus-mechanicus-points.en.json'),'utf8'));
const source=JSON.parse(fs.readFileSync(sourcePath,'utf8')).catalogue;
const previous=JSON.parse(fs.readFileSync(outputPath,'utf8'));
const previousByTitle=new Map(previous.datasheets.map(unit=>[unit.title.toLowerCase(),unit]));
const SOURCE_URL='https://github.com/BSData/wh40k-11e/blob/main/Imperium%20-%20Adeptus%20Mechanicus.json';

const clean=value=>String(value??'')
  .replaceAll('^^**','').replaceAll('**^^','').replaceAll('**','')
  .replaceAll('\u00a0',' ').replaceAll('\u2011','-').replaceAll('\ufffd','')
  .replace(/\bmdel\b/gi,'model')
  .replace(/[ \t]+/g,' ').trim();
const key=value=>clean(value).toLowerCase().replace(/\s*\[legends]\s*$/i,'');
const enhancementNames=new Set(points.enhancements.map(item=>key(item.title)));
const excludedBranches=/^(crusade|mighty champions|battle honours|weapon modifications|relic upgrades|enhancements)$/i;
const index=new Map();
const visit=value=>{
  if(!value||typeof value!=='object')return;
  if(value.id)index.set(value.id,value);
  for(const child of Object.values(value)){
    if(Array.isArray(child))child.forEach(visit);
    else if(child&&typeof child==='object')visit(child);
  }
};
visit(source);

const unique=(items,marker)=>{
  const seen=new Set();
  return items.filter(item=>{const id=marker(item);if(seen.has(id))return false;seen.add(id);return true;});
};
const characteristics=profile=>Object.fromEntries((profile.characteristics||[]).map(item=>[clean(item.name),clean(item.$text)]));
const profilesFor=entry=>{
  const output=[];
  const seen=new Set();
  const walk=node=>{
    if(!node||seen.has(node.id))return;
    if(excludedBranches.test(clean(node.name))||enhancementNames.has(key(node.name)))return;
    if(node.id)seen.add(node.id);
    output.push(...(node.profiles||[]).filter(profile=>profile.hidden!==true));
    for(const name of ['selectionEntries','selectionEntryGroups'])for(const child of node[name]||[])walk(child);
    for(const link of [...(node.entryLinks||[]),...(node.infoLinks||[])]){
      if(link.hidden===true||link.modifiers?.length)continue;
      const target=index.get(link.targetId);
      if(!target)continue;
      if(target.modifiers?.length||excludedBranches.test(clean(target.name))||enhancementNames.has(key(target.name)))continue;
      if(link.type==='profile'||target.typeName)output.push(target);
      else if(link.type==='selectionEntry'||link.type==='selectionEntryGroup')walk(target);
    }
  };
  walk(entry);
  return unique(output,profile=>profile.id||`${profile.typeName}:${profile.name}:${JSON.stringify(profile.characteristics)}`);
};
const rulesFor=entry=>(entry.infoLinks||[]).filter(link=>link.type==='rule'&&link.hidden!==true).map(link=>{
  const target=index.get(link.targetId)||{};
  const suffix=(link.modifiers||[]).filter(mod=>mod.type==='append'&&mod.field==='name').map(mod=>clean(mod.value)).join(' ');
  return {title:clean(`${link.name||target.name||''} ${suffix}`),text:clean(target.description||target.characteristics?.find(item=>item.name==='Description')?.$text)};
});
const categoryFor=(title,categories)=>{
  if(/\[Legends]/i.test(title))return 'Warhammer Legends';
  const values=new Set(categories.map(item=>item.toLowerCase()));
  if(values.has('epic hero'))return 'Epic Heroes';
  if(values.has('character'))return 'Characters';
  if(values.has('battleline'))return 'Battleline';
  if(values.has('dedicated transport'))return 'Dedicated Transports';
  return 'Other';
};
const compositionFor=(entry,old,title)=>{
  if(old&&!/^See the model selections/i.test(old))return old;
  const groups=(entry.selectionEntryGroups||[]).map(group=>{
    const selectionConstraints=(group.constraints||[]).filter(item=>item.field==='selections'&&item.scope==='parent');
    const min=selectionConstraints.find(item=>item.type==='min')?.value;
    const max=selectionConstraints.find(item=>item.type==='max')?.value;
    if(!Number.isFinite(min)||!Number.isFinite(max))return '';
    const count=min===max?String(min):`${min}-${max}`;
    const label=clean(group.name).replace(/^\d+\s*-\s*\d+\s+/,'');
    const options=(group.selectionEntries||[]).map(item=>clean(item.name));
    return `${count} ${label}${options.length?`. Available builds: ${options.join('; ')}`:''}.`;
  }).filter(Boolean);
  return groups.join(' ')||`1 ${title}.`;
};

const rootLinks=new Map((source.entryLinks||[]).filter(link=>link.type==='selectionEntry').map(link=>[key(link.name),link]));
const datasheets=points.units.map(pointUnit=>{
  const link=rootLinks.get(key(pointUnit.title));
  if(!link)throw new Error(`Current catalogue has no datasheet entry for ${pointUnit.title}`);
  const entry=index.get(link.targetId);
  if(!entry)throw new Error(`Missing target ${link.targetId} for ${pointUnit.title}`);
  const old=previousByTitle.get(key(pointUnit.title))||{};
  const profiles=profilesFor(entry);
  const statProfiles=profiles.filter(profile=>profile.typeName==='Unit').map(profile=>{
    const stats=characteristics(profile);
    return {name:clean(profile.name),stats:{M:stats.M,T:stats.T,Sv:stats.Sv||stats.SV,W:stats.W,Ld:stats.LD,OC:stats.OC}};
  }).filter(profile=>Object.values(profile.stats).every(Boolean));
  if(!statProfiles.length)throw new Error(`No stat profile for ${pointUnit.title}`);
  const weapons=profiles.filter(profile=>['Ranged Weapons','Melee Weapons'].includes(profile.typeName)).map(profile=>{
    const stats=characteristics(profile);
    const ranged=profile.typeName==='Ranged Weapons';
    return {name:clean(profile.name),mode:ranged?'ranged':'melee',range:stats.Range||'-',a:stats.A||'-',skill:(ranged?stats.BS:stats.WS)||'-',s:stats.S||'-',ap:stats.AP||'-',d:stats.D||'-',abilities:clean(stats.Keywords)==='-'?'':clean(stats.Keywords)};
  });
  const abilities=profiles.filter(profile=>profile.typeName==='Abilities').map(profile=>({title:clean(profile.name),text:characteristics(profile).Description||''})).concat(rulesFor(entry));
  const categories=unique((entry.categoryLinks||[]).map(item=>clean(item.name).replace(/^Faction:\s*/i,'')),item=>item.toLowerCase());
  const invulnerable=statProfiles.map(profile=>characteristics(profiles.find(item=>item.typeName==='Unit'&&clean(item.name)===profile.name)).InSv).find(Boolean)||old.invulnerable||'';
  const status=/\[Legends]/i.test(link.name)?'Warhammer Legends':'Codex transcription';
  return {
    ...old,
    id:old.id||`unit-${key(pointUnit.title).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`,
    title:pointUnit.title,
    status,
    category:categoryFor(link.name,categories),
    points:[...new Set(pointUnit.points.map(row=>String(row.value)))],
    stats:statProfiles[0].stats,
    profiles:unique(statProfiles,item=>`${item.name}:${JSON.stringify(item.stats)}`),
    invulnerable,
    weapons:unique(weapons,item=>JSON.stringify(item)),
    abilities:unique(abilities.filter(item=>item.title),item=>item.title.toLowerCase()),
    composition:compositionFor(entry,old.composition,pointUnit.title),
    wargear:weapons.length?[`Available weapon profiles: ${[...new Set(weapons.map(item=>item.name))].join(', ')}.`]:[],
    keywords:categories,
    source:{label:'Current 11e community catalogue · BSData',url:SOURCE_URL},
    referenceUrl:SOURCE_URL
  };
}).sort((a,b)=>a.category.localeCompare(b.category)||a.title.localeCompare(b.title));

const result={schema:1,source:{title:'BSData Warhammer 40,000 11th Edition · Adeptus Mechanicus',url:SOURCE_URL,revision:String(source.revision),commit:points.source.commit,sha256:crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex').toUpperCase()},datasheets,audit:{datasheets:datasheets.length,legendsDatasheets:datasheets.filter(unit=>unit.status==='Warhammer Legends').length}};
const output=`${JSON.stringify(result,null,2)}\n`;
if(process.argv.includes('--check')){
  if(!fs.existsSync(outputPath)||fs.readFileSync(outputPath,'utf8')!==output)throw new Error('Codex datasheet snapshot is stale; run extract-datasheets.mjs');
  console.log(`Codex datasheets current: ${datasheets.length}`);
}else{
  fs.writeFileSync(outputPath,output,'utf8');
  console.log(`Extracted ${datasheets.length} current datasheets`);
}
