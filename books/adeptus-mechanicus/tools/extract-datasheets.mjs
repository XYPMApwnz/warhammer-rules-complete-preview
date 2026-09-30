import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizedFileSha256} from './source-hash.mjs';
import {createArmyCoreAbilityBindings} from '../../shared/tools/army-core-ability-binding.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(root,'../..');
const coreAbilityBindings=createArmyCoreAbilityBindings({repoRoot:repo});
const sourcePath=path.join(root,'sources','bsdata-adeptus-mechanicus-11e.json');
const outputPath=path.join(root,'content','adeptus-mechanicus-codex-datasheets.en.json');
const transportProfileIds=new Set(JSON.parse(fs.readFileSync(path.join(root,'book.config.json'),'utf8')).datasheetTransportProfileIds||[]);
const points=JSON.parse(fs.readFileSync(path.join(root,'content','adeptus-mechanicus-points.en.json'),'utf8'));
const source=JSON.parse(fs.readFileSync(sourcePath,'utf8')).catalogue;
const SOURCE_URL='https://github.com/BSData/wh40k-11e/blob/main/Imperium%20-%20Adeptus%20Mechanicus.json';
const attachmentTargets={
  'Skitarii Marshal':['Hastarii Exterminators','Hastarii Fusiliers','Skitarii Rangers','Skitarii Vanguard'],
  'Technoarcheologist':['Corpuscarii Electro-Priests','Fulgurite Electro-Priests','Hastarii Exterminators','Hastarii Fusiliers','Kataphron Breachers','Kataphron Destroyers','Servitor Battleclade','Skitarii Rangers','Skitarii Vanguard'],
  'Tech-Priest Dominus':['Corpuscarii Electro-Priests','Fulgurite Electro-Priests','Hastarii Exterminators','Hastarii Fusiliers','Kataphron Breachers','Kataphron Destroyers','Servitor Battleclade','Skitarii Rangers','Skitarii Vanguard'],
  'Tech-Priest Manipulus':['Corpuscarii Electro-Priests','Fulgurite Electro-Priests','Hastarii Exterminators','Hastarii Fusiliers','Kataphron Breachers','Kataphron Destroyers','Servitor Battleclade','Skitarii Rangers','Skitarii Vanguard'],
  'Tech-Priest Enginseer':['Corpuscarii Electro-Priests','Fulgurite Electro-Priests','Kataphron Breachers','Kataphron Destroyers','Skitarii Rangers','Skitarii Vanguard']
};

const clean=value=>String(value??'')
  .replaceAll('^^**','').replaceAll('**^^','').replaceAll('**','')
  .replaceAll('\u00a0',' ').replaceAll('\u2011','-').replaceAll('\ufffd','')
  .replace(/\bmdel\b/gi,'model')
  .replace(/\bhavealready\b/gi,'have already')
  .replace(/\bConflagaration\b/g,'Conflagration')
  .replace(/[ \t]+/g,' ').trim();
const datasheetText=(title,value)=>title==='Pteraxii Sterylizors'
  ?clean(value).replaceAll('Pteraxii Skystalker Alpha','Pteraxii Sterylizor Alpha')
  :clean(value);
const abilityText=(unitTitle,title,value)=>{
  if(/^(?:leader|support)$/i.test(clean(title))&&attachmentTargets[unitTitle])return `This model can be attached to the following units:\n${attachmentTargets[unitTitle].map(target=>`■ ${target}`).join('\n')}`;
  const text=clean(value);
  if(unitTitle==='Cybernetica Datasmith'&&clean(title)==='Data-severed')return text.replace(/[ \t]+\n/g,'\n');
  if(!/^broad spectrum data-tether$/i.test(clean(title)))return text;
  if(unitTitle==='Onager Dunecrawler')return 'The bearer loses the SMOKE keyword, but each time you target the bearer with a Stratagem, roll one D6: on a 5+, you gain 1CP.';
  return 'Each time you target this unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.';
};
const key=value=>clean(value).toLowerCase().replace(/\s*\[legends]\s*$/i,'');
const enhancementNames=new Set(points.enhancements.map(item=>key(item.title)));
const excludedBranches=/^(crusade|mighty champions|battle honours|weapon modifications|relic upgrades|enhancements)$/i;
const nonDatasheetCategories=new Set(['recon augury']);
const alwaysDatasheetAbilities=new Set(['achillan eye']);
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
const publicAbility=item=>{
  if(item.title!=='Canticles of the Omnissiah')return {title:item.title,text:item.text,...(item.sourceAbilityId?{sourceAbilityId:item.sourceAbilityId}:{}),...(item.coreAbilityId?{coreAbilityId:item.coreAbilityId}:{})};
  const [openingText,...blocks]=item.text.split(/\n{2,}/);
  return {
    title:item.title,
    openingText,
    options:blocks.map(block=>{
      const separator=block.indexOf(':');
      const title=block.slice(0,separator);
      return {
        id:key(title).replace(/\s*\(aura\)\s*$/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
        title,
        text:block.slice(separator+1).trim()
      };
    })
  };
};
const characteristics=(profile,categoryIds=new Set())=>{
  const values=new Map((profile.characteristics||[]).map(item=>[item.typeId,{name:clean(item.name),value:clean(item.$text)}]));
  for(const modifier of profile.modifiers||[]){
    if(modifier.type!=='set'||!values.has(modifier.field))continue;
    const conditions=modifier.conditions||[];
    if(!conditions.length||conditions.every(condition=>condition.type==='instanceOf'&&categoryIds.has(condition.childId)))values.get(modifier.field).value=clean(modifier.value);
  }
  return Object.fromEntries([...values.values()].map(item=>[item.name,item.value]));
};
const profilesFor=entry=>{
  const output=[];
  const seen=new Set();
  const walk=node=>{
    if(!node||seen.has(node.id))return;
    if(excludedBranches.test(clean(node.name))||enhancementNames.has(key(node.name)))return;
    if(node.id)seen.add(node.id);
    output.push(...(node.profiles||[]).filter(profile=>profile.hidden!==true).map(profile=>({profile,ownerType:node.type||'group',ownerName:clean(node.name)})));
    for(const name of ['selectionEntries','selectionEntryGroups'])for(const child of node[name]||[])walk(child);
    for(const link of [...(node.entryLinks||[]),...(node.infoLinks||[])]){
      if(link.hidden===true||link.modifiers?.length)continue;
      const target=index.get(link.targetId);
      if(!target)continue;
      if(target.modifiers?.length||excludedBranches.test(clean(target.name))||enhancementNames.has(key(target.name)))continue;
      if(link.type==='profile'||target.typeName)output.push({profile:target,ownerType:node.type||'group',ownerName:clean(node.name)});
      else if(link.type==='selectionEntry'||link.type==='selectionEntryGroup')walk(target);
    }
  };
  walk(entry);
  return unique(output,item=>item.profile.id||`${item.profile.typeName}:${item.profile.name}:${JSON.stringify(item.profile.characteristics)}`);
};
const hunterCohortOnly=link=>(link.modifiers||[]).some(modifier=>modifier.type==='set'&&modifier.field==='hidden'&&modifier.value===true&&(modifier.conditions||[]).some(condition=>condition.scope==='force'&&condition.childName==='Skitarii Hunter Cohort'));
const rulesFor=entry=>(entry.infoLinks||[]).filter(link=>link.type==='rule'&&link.hidden!==true&&!hunterCohortOnly(link)).map(link=>{
  const target=index.get(link.targetId)||{};
  const suffix=(link.modifiers||[]).filter(mod=>mod.type==='append'&&mod.field==='name').map(mod=>clean(mod.value)).join(' ');
  return coreAbilityBindings.bindAbility({title:clean(`${link.name||target.name||''} ${suffix}`),text:clean(target.description||target.characteristics?.find(item=>item.name==='Description')?.$text),origin:'rule',sourceAbilityId:link.targetId});
});
const categoryFor=(title,categoryLinks)=>{
  if(/\[Legends]/i.test(title))return 'Warhammer Legends';
  const primary=clean(categoryLinks.find(item=>item.primary===true)?.name).replace(/^Faction:\s*/i,'');
  if(/^epic hero$/i.test(primary))return 'Epic Heroes';
  if(/^character$/i.test(primary))return 'Characters';
  if(/^battleline$/i.test(primary))return 'Battleline';
  if(/^dedicated transport$/i.test(primary))return 'Dedicated Transports';
  return primary||'Other';
};
const compositionFor=(entry,old,title)=>{
  if(entry.type==='model')return `1 ${title}.`;
  const rows=[...(entry.selectionEntryGroups||[]),...(entry.selectionEntries||[]).filter(item=>item.type==='model')].filter(item=>!excludedBranches.test(clean(item.name))&&!enhancementNames.has(key(item.name))).map(item=>{
    const constraints=(item.constraints||[]).filter(rule=>rule.field==='selections'&&rule.scope==='parent');
    const min=constraints.find(rule=>rule.type==='min')?.value;
    const max=constraints.find(rule=>rule.type==='max')?.value;
    if(!Number.isFinite(min)&&!Number.isFinite(max))return '';
    const low=Number.isFinite(min)?min:0;
    const high=Number.isFinite(max)?max:low;
    if(!high)return '';
    const count=low===high?String(low):`${low}-${high}`;
    const label=clean(item.name).replace(/^\d+(?:\s*-\s*\d+)?\s+/, '');
    return `${count} ${label}.`;
  }).filter(Boolean);
  return rows.join(' ')||old||`1 ${title}.`;
};

const selectionBounds=node=>{
  const constraints=(node?.constraints||[]).filter(rule=>rule.field==='selections'&&rule.scope==='parent');
  return {
    min:constraints.find(rule=>rule.type==='min')?.value,
    max:constraints.find(rule=>rule.type==='max')?.value
  };
};
const countLabel=node=>{
  const {min,max}=selectionBounds(node);
  if(Number.isFinite(min)&&Number.isFinite(max)&&min===max)return `${min}`;
  if(Number.isFinite(min)&&Number.isFinite(max))return `${min}-${max}`;
  if(Number.isFinite(max))return `up to ${max}`;
  if(Number.isFinite(min))return `at least ${min}`;
  return '';
};
const linkedTarget=link=>index.get(link.targetId);
const optionChildren=node=>[
  ...(node.selectionEntries||[]),
  ...(node.entryLinks||[]).filter(link=>link.type==='selectionEntry').map(link=>linkedTarget(link)||link)
].filter(item=>!excludedBranches.test(clean(item.name))&&!enhancementNames.has(key(item.name)));
const choiceGroups=node=>[
  ...(node.selectionEntryGroups||[]),
  ...(node.entryLinks||[]).filter(link=>link.type==='selectionEntryGroup').map(link=>linkedTarget(link)||link)
].filter(item=>!excludedBranches.test(clean(item.name))&&!/weapon modifications/i.test(clean(item.name)));
const nestedChoiceGroups=node=>{
  const output=[],seen=new Set();
  const visit=current=>{
    for(const group of choiceGroups(current)){
      if(group.id&&seen.has(group.id))continue;
      if(group.id)seen.add(group.id);
      if(optionChildren(group).length)output.push(group);
      visit(group);
    }
  };
  visit(node);return output;
};
const wargearFor=(entry,unitTitle)=>{
  const output=[];
  const top=[...(entry.selectionEntries||[]).filter(item=>item.type==='model'),...(entry.selectionEntryGroups||[])].filter(item=>!excludedBranches.test(clean(item.name)));
  for(const node of top){
    const subject=/^(?:wargear|weapons?|selections?)$/i.test(clean(node.name))?unitTitle:clean(node.name);
    const nestedModels=[...(node.selectionEntries||[])].filter(item=>item.type==='model');
    if(nestedModels.length){
      const rows=nestedModels.map(model=>`${countLabel(model)||'select'} ${clean(model.name)}`);
      if(rows.length)output.push(`${subject}: ${rows.join('; ')}.`);
      continue;
    }
    const mandatory=optionChildren(node).filter(item=>selectionBounds(item).min>=1).map(item=>clean(item.name));
    if(mandatory.length)output.push(`${subject} is equipped with: ${mandatory.join('; ')}.`);
    const optional=optionChildren(node).filter(item=>!selectionBounds(item).min&&Number.isFinite(selectionBounds(item).max)).map(item=>clean(item.name));
    if(optional.length)output.push(`${subject} can be equipped with: ${optional.join('; ')}.`);
    for(const group of nestedChoiceGroups(node)){
      const choices=optionChildren(group).map(item=>clean(item.name));
      if(!choices.length)continue;
      const bounds=selectionBounds(group),amount=Number.isFinite(bounds.min)&&bounds.min===bounds.max?bounds.min:`${bounds.min??0}-${bounds.max??choices.length}`;
      output.push(`${subject}: select ${amount} from ${choices.join('; ')}.`);
    }
  }
  return unique(output,item=>item.toLowerCase());
};

const rootLinks=new Map((source.entryLinks||[]).filter(link=>link.type==='selectionEntry').map(link=>[key(link.name),link]));
const datasheets=points.units.map(pointUnit=>{
  const link=rootLinks.get(key(pointUnit.title));
  if(!link)throw new Error(`Current catalogue has no datasheet entry for ${pointUnit.title}`);
  const entry=index.get(link.targetId);
  if(!entry)throw new Error(`Missing target ${link.targetId} for ${pointUnit.title}`);
  const categoryLinks=entry.categoryLinks||[];
  const categoryIds=new Set(categoryLinks.map(item=>item.targetId).filter(Boolean));
  const profileRecords=profilesFor(entry);
  const profiles=profileRecords.map(item=>item.profile);
  const statProfiles=profiles.filter(profile=>profile.typeName==='Unit').map(profile=>{
    const stats=characteristics(profile,categoryIds);
    return {name:datasheetText(pointUnit.title,profile.name),stats:{M:stats.M,T:stats.T,Sv:stats.Sv||stats.SV,W:stats.W,Ld:stats.LD,OC:stats.OC}};
  }).filter(profile=>Object.values(profile.stats).every(Boolean));
  if(!statProfiles.length)throw new Error(`No stat profile for ${pointUnit.title}`);
  const weapons=profiles.filter(profile=>['Ranged Weapons','Melee Weapons'].includes(profile.typeName)).map(profile=>{
    const stats=characteristics(profile,categoryIds);
    const ranged=profile.typeName==='Ranged Weapons';
    return {name:clean(profile.name),mode:ranged?'ranged':'melee',range:stats.Range||'-',a:stats.A||'-',skill:(ranged?stats.BS:stats.WS)||'-',s:stats.S||'-',ap:stats.AP||'-',d:stats.D||'-',abilities:clean(stats.Keywords)==='-'?'':clean(stats.Keywords)};
  });
  if(pointUnit.title==='Onager Dunecrawler'){
    const dissipated=weapons.find(weapon=>/eradication beamer - dissipated/i.test(weapon.name));
    if(dissipated)dissipated.s='9'; // Faction Pack v1.1, p. 18.
  }
  const abilityRecords=profileRecords.filter(item=>item.profile.typeName==='Abilities').map(item=>coreAbilityBindings.bindAbility({title:clean(item.profile.name),text:abilityText(pointUnit.title,item.profile.name,characteristics(item.profile,categoryIds).Description||''),origin:item.ownerType==='upgrade'?'wargear':'datasheet',ownerName:item.ownerName,sourceAbilityId:item.profile.id}));
  const conditionalTitles=new Set(abilityRecords.filter(item=>item.origin==='wargear'&&key(item.ownerName)!==key(pointUnit.title)&&!alwaysDatasheetAbilities.has(key(item.title))).map(item=>key(item.title)));
  const abilities=abilityRecords.filter(item=>(item.origin!=='wargear'||alwaysDatasheetAbilities.has(key(item.title)))&&!conditionalTitles.has(key(item.title))).concat(rulesFor(entry));
  // Enrolled Transport profiles retain their accepted Capacity prose without runtime semantics.
  const transport=profiles.filter(item=>item.typeName==='Transport'&&transportProfileIds.has(item.id)).map(profile=>{
    const text=characteristics(profile,categoryIds).Capacity;
    if(!text)throw new Error(`Transport profile ${profile.id} has no Capacity text`);
    return text;
  });
  const wargearAbilities=abilityRecords.filter(item=>item.origin==='wargear'&&conditionalTitles.has(key(item.title))&&!abilities.some(ability=>key(ability.title)===key(item.title)));
  const categories=unique(categoryLinks.map(item=>clean(item.name).replace(/^Faction:\s*/i,'')).filter(item=>!nonDatasheetCategories.has(key(item))),item=>item.toLowerCase());
  if(pointUnit.title==='Cybernetica Datasmith'){
    const infantry=categories.findIndex(item=>key(item)==='infantry');
    if(infantry!==-1)categories.splice(infantry,1,'Vehicle'); // Faction Pack v1.2, p. 18; Data-severed owns the conditional return to INFANTRY.
  }
  const invulnerable=profiles.filter(item=>item.typeName==='Unit').map(item=>characteristics(item,categoryIds).InSv).find(Boolean)||'';
  const status=/\[Legends]/i.test(link.name)?'Warhammer Legends':'Codex transcription';
  const result={
    id:`unit-${key(pointUnit.title).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`,
    title:pointUnit.title,
    status,
    category:categoryFor(link.name,categoryLinks),
    points:[...new Set(pointUnit.points.map(row=>String(row.value)))],
    stats:statProfiles[0].stats,
    profiles:unique(statProfiles,item=>`${item.name}:${JSON.stringify(item.stats)}`),
    invulnerable,
    weapons:unique(weapons,item=>JSON.stringify(item)),
    abilities:unique(abilities.filter(item=>item.title),item=>item.title.toLowerCase()).map(publicAbility),
    wargearAbilities:unique(wargearAbilities.filter(item=>item.title),item=>item.title.toLowerCase()).map(publicAbility),
    ...(transport.length?{relations:{transport}}:{}),
    composition:datasheetText(pointUnit.title,compositionFor(entry,'',pointUnit.title)),
    wargear:wargearFor(entry,pointUnit.title),
    availableProfiles:[...new Set(weapons.map(item=>item.name))],
    keywords:categories,
    source:{label:'Current 11e community catalogue · BSData',url:SOURCE_URL},
    referenceUrl:SOURCE_URL
  };
  return result;
}).sort((a,b)=>a.category.localeCompare(b.category)||a.title.localeCompare(b.title));

const publishedDatasheets=datasheets.filter(unit=>unit.status!=='Warhammer Legends');
const result={schema:1,source:{title:'BSData Warhammer 40,000 11th Edition ? Adeptus Mechanicus',url:SOURCE_URL,revision:String(source.revision),commit:points.source.commit,sha256:normalizedFileSha256(sourcePath)},datasheets:publishedDatasheets,audit:{datasheets:publishedDatasheets.length,legendsDatasheets:0}};
const output=`${JSON.stringify(result,null,2)}\n`;
if(process.argv.includes('--check')){
  if(!fs.existsSync(outputPath)||fs.readFileSync(outputPath,'utf8')!==output)throw new Error('Codex datasheet snapshot is stale; run extract-datasheets.mjs');
  console.log(`Codex datasheets current: ${publishedDatasheets.length}`);
}else{
  fs.writeFileSync(outputPath,output,'utf8');
  console.log(`Extracted ${publishedDatasheets.length} current datasheets`);
}
