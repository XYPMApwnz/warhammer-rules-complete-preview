import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourcePath=path.join(root,'sources','bsdata-adeptus-mechanicus-11e.json');
const outputPath=path.join(root,'content','adeptus-mechanicus-points.en.json');
const source=JSON.parse(fs.readFileSync(sourcePath,'utf8')).catalogue;
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const clean=value=>String(value??'').replaceAll('^^**','').replaceAll('**^^','').replaceAll('**','').replaceAll('\u00a0',' ').replace(/\s+/g,' ').trim();
const detachmentFiles=['content/adeptus-mechanicus-rules.en.json','content/adeptus-mechanicus-codex-detachments.en.json'];
const detachmentByEnhancement=new Map(detachmentFiles.flatMap(file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')).detachments||[]).flatMap(detachment=>detachment.enhancements.map(item=>[normalize(item.title),detachment.id.replace(/^detachment-/, '')])));
const pointCost=entry=>Number((entry.costs||[]).find(cost=>cost.name==='pts')?.value||0);
const byId=new Map();

function index(node){
  if(!node||typeof node!=='object')return;
  if(node.id)byId.set(node.id,node);
  for(const value of Object.values(node))if(Array.isArray(value))value.forEach(index);
}
index(source);

function descendants(node,visit,blocked=false){
  if(!node||typeof node!=='object'||blocked)return;
  const nextBlocked=/enhancements|crusade|specialisms/i.test(node.name||'');
  visit(node,nextBlocked);
  for(const value of Object.values(node))if(Array.isArray(value))value.forEach(child=>descendants(child,visit,nextBlocked));
}

function sizeRules(entry){
  const rules=[];
  for(const modifier of entry.modifiers||[]){
    if(modifier.field!=='51b2-306e-1021-d207'||!['set','increment'].includes(modifier.type))continue;
    for(const condition of modifier.conditions||[]){
      if(condition.field!=='selections'||condition.childId!=='model')continue;
      if(!['greaterThan','atLeast'].includes(condition.type))continue;
      rules.push({type:modifier.type,threshold:Number(condition.value),comparison:condition.type,value:Number(modifier.value)});
    }
  }
  return rules;
}

function repeatRule(entry){
  for(const modifier of entry.modifiers||[]){
    if(modifier.field!=='51b2-306e-1021-d207'||modifier.type!=='increment')continue;
    const groups=modifier.conditionGroups||[];
    for(const group of groups){
      for(const local of group.localConditionGroups||[]){
        if(!(local.conditions||[]).some(condition=>condition.type==='instanceOf'&&condition.childId===entry.id))continue;
        return {start:Number(local.value)+1,increment:Number(modifier.value)};
      }
    }
  }
  return null;
}

function candidateSizes(entry,rules){
  if(entry.type==='model')return[1];
  const values=new Set();
  for(const rule of rules){
    if(rule.comparison==='greaterThan'){
      values.add(rule.threshold);
      values.add(rule.threshold*2);
    }else{
      const base=Math.max(1,rule.threshold-1);
      values.add(base);
      values.add(base*2);
    }
  }
  return values.size?[...values].sort((a,b)=>a-b):[0];
}

function priceFor(base,rules,size){
  let value=base;
  for(const rule of rules){
    const matches=rule.comparison==='greaterThan'?size>rule.threshold:size>=rule.threshold;
    if(!matches)continue;
    value=rule.type==='set'?rule.value:value+rule.value;
  }
  return value;
}

function ordinal(value){
  const mod100=value%100;
  if(mod100>=11&&mod100<=13)return`${value}th`;
  return`${value}${value%10===1?'st':value%10===2?'nd':value%10===3?'rd':'th'}`;
}

function repeatLabel(start,after){
  if(after)return`${ordinal(start)}+ unit`;
  return start===2?'1st unit':`1st–${ordinal(start-1)} unit`;
}

function unitPoints(entry){
  const base=pointCost(entry),sizes=sizeRules(entry),repeat=repeatRule(entry);
  const rows=[];
  for(const size of candidateSizes(entry,sizes)){
    const sizeLabel=size?`${size} model${size===1?'':'s'}`:'';
    const value=priceFor(base,sizes,size);
    rows.push({label:repeat?[repeatLabel(repeat.start,false),sizeLabel].filter(Boolean).join(': '):sizeLabel,value});
    if(repeat)rows.push({label:[repeatLabel(repeat.start,true),sizeLabel].filter(Boolean).join(': '),value:value+repeat.increment});
  }
  return rows;
}

function paidWargear(entry){
  const items=[];
  descendants(entry,(node,blocked)=>{
    if(node===entry||blocked||node.type!=='upgrade')return;
    const value=pointCost(node);
    if(value>0)items.push({label:`per ${clean(node.name)}`,value});
  });
  return [...new Map(items.map(item=>[normalize(item.label),item])).values()];
}

function abilityText(entry){
  for(const profile of entry.profiles||[]){
    if(profile.typeName!=='Abilities')continue;
    const text=(profile.characteristics||[]).find(item=>item.name==='Description')?.$text;
    if(text)return clean(text);
  }
  return '';
}

function weaponProfile(entry){
  const profile=(entry.profiles||[]).find(item=>['Ranged Weapons','Melee Weapons'].includes(item.typeName));
  if(!profile)return null;
  const stats=Object.fromEntries((profile.characteristics||[]).map(item=>[item.name,clean(item.$text)]));
  return{name:clean(profile.name),mode:profile.typeName==='Ranged Weapons'?'ranged':'melee',range:stats.Range,a:stats.A,skill:stats.BS||stats.WS,s:stats.S,ap:stats.AP,d:stats.D,abilities:stats.Keywords||''};
}

function enhancementEntries(){
  const group=(source.sharedSelectionEntryGroups||[]).find(entry=>entry.name==='Enhancements');
  const output=[];
  const visit=node=>{
    for(const entry of node.selectionEntries||[]){
      const value=pointCost(entry);
      if(value>0)output.push({title:clean(entry.name),value,text:abilityText(entry),profile:weaponProfile(entry)});
    }
    for(const child of node.selectionEntryGroups||[])visit(child);
  };
  visit(group||{});
  const cybercanids=[...byId.values()].find(entry=>entry.name==='Stealth-screened Cybercanids'&&pointCost(entry)>0);
  if(cybercanids)output.push({title:clean(cybercanids.name),value:pointCost(cybercanids),text:abilityText(cybercanids)});
  return output;
}

const excluded=/^(Detachment|Show\/Hide Options|Order of Battle)$/;
const units=[];
for(const link of source.entryLinks||[]){
  if(link.type!=='selectionEntry'||excluded.test(link.name)||/\[Crucible\]/.test(link.name))continue;
  const entry=byId.get(link.targetId);
  if(!entry)continue;
  const title=clean(link.name.replace(/\s*\[Legends\]\s*$/,''));
  units.push({title,points:unitPoints(entry),wargear:paidWargear(entry)});
}
const officialPointLabels={
  'Hastarii Exterminators':['1st–2nd unit: 5 models','3rd+ unit: 5 models'],
  'Hastarii Fusiliers':['1st–2nd unit: 5 models','3rd+ unit: 5 models'],
  'Ironstrider Ballistarii':['1st–2nd unit: 1 model','3rd+ unit: 1 model','1st–2nd unit: 2 models','3rd+ unit: 2 models','1st–2nd unit: 3 models','3rd+ unit: 3 models'],
  'Servitor Battleclade':['9 models'],
  'Skitarii Rangers':['10 models'],
  'Skitarii Vanguard':['10 models'],
  'Sydonian Dragoons with radium jezzails':['1 model','2 models','3 models'],
  'Sydonian Dragoons with taser lances':['1 model','2 models','3 models'],
  'Sydonian Skatros':['1 model']
};
for(const unit of units){
  const labels=officialPointLabels[unit.title];
  if(!labels)continue;
  if(labels.length!==unit.points.length)throw new Error(`Official MFM row count changed for ${unit.title}`);
  unit.points.forEach((row,index)=>row.label=labels[index]);
}

const aliases={
  'Autoclavic Denounciation':'Autoclavic Denunciation',
  'Arch Negator':'Arch-negator',
  'TL-409':'TL-4Ø9',
  'Stealth-screened Cybercanids':'Stealth-screened Cybercanids Upgrade',
  'Luminen Autochoir':'Luminen Auto-choir'
};
const effects={
  'Mechanicus Locum':'leadership-6',
  'Temporcopia':'fights-first',
  'Arch-negator':'anti-vehicle-4',
  'Autoclavic Denunciation':'anti-infantry-monster',
  'Malphonic Susurrus':'stealth',
  'Peerless Eradicator':'sustained-hits-1',
  'Clandestine Infiltrator':'infiltrators-scouts-6',
  'Explorator Dispensation':'infiltrators',
  "Vingh's Wafers of Dynamism":'mobile',
  'Electromiasmic Brazier':'stealth',
  'Stealth-screened Cybercanids Upgrade':'lone-operative-15',
  'Transoracular Dyad Wafers':'halo-override',
  'Martial Signatum Amplificator':'skitarii',
  'Belicosa-class Capacitor Vanes':'ranged-range-6-strength-1',
  "Omnissiah's Fury":'melee-attacks-2-ap-1-damage-1',
  'Sanctified Ordnance':'ranged-range-6',
  'Inloaded Lethality':'melee-attacks-3-damage-1',
  'TL-4Ø9':'tl-409-profile'
};
const enhancements=enhancementEntries().map(entry=>{
  const title=aliases[entry.title]||entry.title;
  return{...entry,title,detachment:detachmentByEnhancement.get(normalize(title))||'',effect:effects[title]||''};
});
const result={
  schema:1,
  source:{
    title:'BSData Warhammer 40,000: 11th Edition · Adeptus Mechanicus',
    url:'https://github.com/BSData/wh40k-11e/blob/fa30730fca11fbfe87be90684d481d50e0efaf66/Imperium%20-%20Adeptus%20Mechanicus.json',
    commit:'fa30730fca11fbfe87be90684d481d50e0efaf66',
    revision:source.revision,
    officialUrl:'https://mfm.warhammer-community.com/en/adeptus-mechanicus',
    officialVersion:'v1.1',
    verifiedAt:'2026-07-28',
    sha256:crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex').toUpperCase()
  },
  units,
  enhancements,
  audit:{units:units.length,enhancements:enhancements.length}
};
const output=`${JSON.stringify(result,null,2)}\n`;
if(process.argv.includes('--check')){
  if(!fs.existsSync(outputPath)||fs.readFileSync(outputPath,'utf8')!==output)throw new Error('Mechanicus points snapshot is stale; run tools/extract-points.mjs');
  console.log(`Mechanicus points snapshot is current: ${units.length} units, ${enhancements.length} Enhancements`);
}else{
  fs.writeFileSync(outputPath,output);
  console.log(`Extracted ${units.length} units and ${enhancements.length} Enhancements`);
}
