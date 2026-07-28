import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const args=process.argv.slice(2);
const check=args.includes('--check');
const configArg=args.find(arg=>!arg.startsWith('--'));
if(!configArg)throw new Error('Usage: node extract-bsdata-11e.mjs <config.json> [--check]');

const configPath=path.resolve(configArg);
const configDir=path.dirname(configPath);
const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const resolvePath=value=>path.resolve(configDir,value);
const sha256=buffer=>crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
const json=value=>`${JSON.stringify(value,null,2)}\n`;
const textCorrections=new Map(Object.entries(config.textCorrections||{}));
const clean=value=>{
  const normalized=String(value??'')
    .replaceAll('^^**',' ').replaceAll('**^^',' ').replaceAll('**',' ').replaceAll('^^',' ')
    .replaceAll('\u00a0',' ').replaceAll('\u2011','-').replaceAll('\ufffd','')
    .replace(/[ \t]+/g,' ').trim();
  return textCorrections.get(normalized)||normalized;
};
const key=value=>clean(value).toLowerCase().replace(/\s*\[legends]\s*$/i,'');
const slug=value=>key(value).replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const plural=value=>/s$/i.test(value)?value:/x$/i.test(value)?`${value}es`:`${value}s`;
const unique=(items,marker)=>{
  const seen=new Set();
  return items.filter(item=>{const id=marker(item);if(seen.has(id))return false;seen.add(id);return true;});
};

const inputs=config.inputs.map(input=>{
  const file=resolvePath(input.path);
  const raw=fs.readFileSync(file);
  return {role:input.role,file:path.basename(file),sha256:sha256(raw),data:JSON.parse(raw.toString('utf8'))};
});
const snapshot={
  schema:1,
  source:{repository:config.source.repository,commit:config.source.commit},
  documents:inputs
};
const roots=inputs.map(input=>input.data.catalogue||input.data.gameSystem);
const faction=inputs.find(input=>input.role==='faction')?.data.catalogue;
if(!faction)throw new Error('Config must identify one input with role "faction"');

const byId=new Map();
const index=value=>{
  if(!value||typeof value!=='object')return;
  if(value.id&&!byId.has(value.id))byId.set(value.id,value);
  for(const child of Object.values(value)){
    if(Array.isArray(child))child.forEach(index);
    else if(child&&typeof child==='object')index(child);
  }
};
roots.forEach(index);

const pointsCostType=roots.flatMap(root=>root.costTypes||[]).find(item=>item.name==='pts')?.id||'51b2-306e-1021-d207';
const pointCost=entry=>Number((entry?.costs||[]).find(cost=>cost.name==='pts'||cost.typeId===pointsCostType)?.value||0);
const blockedBranch=new RegExp(config.filters.blockedBranches.join('|'),'i');
const blockedNamePatterns=(config.filters.excludeNamePatterns||[]).map(pattern=>new RegExp(pattern,'i'));
const excludedNames=new Set((config.filters.excludeNames||[]).map(key));
const excludedCategories=new Set((config.filters.excludePrimaryCategories||[]).map(key));
const imperialArmourNames=new Set((config.filters.imperialArmourNames||[]).map(key));

function graph(entry){
  const profiles=[];
  const rules=[];
  const nodes=[];
  const visited=new Set();
  const walk=node=>{
    if(!node||typeof node!=='object'||visited.has(node.id))return;
    if(node!==entry&&blockedBranch.test(clean(node.name)))return;
    if(node.id)visited.add(node.id);
    nodes.push(node);
    profiles.push(...(node.profiles||[]).filter(profile=>profile.hidden!==true));
    for(const child of [...(node.selectionEntries||[]),...(node.selectionEntryGroups||[])])walk(child);
    for(const link of [...(node.entryLinks||[]),...(node.infoLinks||[])]){
      if(link.hidden===true)continue;
      const target=byId.get(link.targetId);
      if(!target)continue;
      if(link.type==='profile'||target.typeName)profiles.push(target);
      else if(link.type==='rule'){
        const suffix=(link.modifiers||[]).filter(mod=>mod.type==='append'&&mod.field==='name').map(mod=>clean(mod.value)).join(' ');
        rules.push({
          title:clean(`${link.name||target.name||''} ${suffix}`),
          text:clean(target.description||target.characteristics?.find(item=>item.name==='Description')?.$text)
        });
      }else if(['selectionEntry','selectionEntryGroup'].includes(link.type))walk(target);
    }
  };
  walk(entry);
  return {
    profiles:unique(profiles,profile=>profile.id||`${profile.typeName}:${profile.name}:${JSON.stringify(profile.characteristics)}`),
    rules:unique(rules.filter(rule=>rule.title),rule=>`${key(rule.title)}:${rule.text}`),
    nodes
  };
}

const characteristics=profile=>Object.fromEntries((profile.characteristics||[]).map(item=>[clean(item.name),clean(item.$text)]));
const constraints=node=>{
  const values={};
  for(const item of node?.constraints||[]){
    if(item.field==='selections'&&item.scope==='parent'&&['min','max'].includes(item.type))values[item.type]=Number(item.value);
  }
  return values;
};
const primaryCategory=entry=>clean((entry.categoryLinks||[]).find(item=>item.primary===true)?.name);
const categoriesFor=entry=>unique((entry.categoryLinks||[]).map(item=>clean(item.name).replace(/^Faction:\s*/i,'')),item=>key(item));
const categoryFor=(title,categories)=>{
  if(/\[legends]/i.test(title))return 'Warhammer Legends';
  const values=new Set(categories.map(key));
  if(values.has('epic hero'))return 'Epic Heroes';
  if(values.has('character'))return 'Characters';
  if(values.has('battleline'))return 'Battleline';
  if(values.has('dedicated transport'))return 'Dedicated Transports';
  if(values.has('monster'))return 'Monsters';
  if(values.has('infantry'))return 'Infantry';
  return 'Other';
};

function compositionFor(entry,title){
  if(entry.type==='model')return[{name:title,min:1,max:1,models:[title]}];
  const output=[];
  for(const model of (entry.selectionEntries||[]).filter(item=>item.type==='model')){
    const range=constraints(model);
    output.push({name:clean(model.name),min:range.min??0,max:range.max??range.min??0,models:[clean(model.name)]});
  }
  for(const group of entry.selectionEntryGroups||[]){
    const models=(group.selectionEntries||[]).filter(item=>item.type==='model');
    if(!models.length)continue;
    const range=constraints(group);
    const childRanges=models.map(constraints);
    output.push({
      name:clean(group.name),
      min:range.min??childRanges.reduce((sum,item)=>sum+(item.min||0),0),
      max:range.max??childRanges.reduce((sum,item)=>sum+(item.max||item.min||0),0),
      models:models.map(item=>clean(item.name))
    });
  }
  return unique(output,item=>`${key(item.name)}:${item.min}:${item.max}:${item.models.join('|')}`);
}

function sizeRules(entry){
  const output=[];
  for(const modifier of entry.modifiers||[]){
    if(modifier.field!==pointsCostType||!['set','increment'].includes(modifier.type))continue;
    for(const condition of modifier.conditions||[]){
      if(condition.field!=='selections'||!['greaterThan','atLeast'].includes(condition.type))continue;
      output.push({type:modifier.type,threshold:Number(condition.value),comparison:condition.type,value:Number(modifier.value)});
    }
  }
  return output;
}
function repeatRule(entry){
  for(const modifier of entry.modifiers||[]){
    if(modifier.field!==pointsCostType||modifier.type!=='increment')continue;
    for(const group of modifier.conditionGroups||[]){
      for(const local of group.localConditionGroups||[]){
        if((local.conditions||[]).some(condition=>condition.type==='instanceOf'&&condition.childId===entry.id))return{start:Number(local.value)+1,increment:Number(modifier.value)};
      }
    }
  }
  return null;
}
function pointRows(entry,composition){
  const base=pointCost(entry);
  const rules=sizeRules(entry);
  const repeat=repeatRule(entry);
  if(base===0&&!rules.length&&!repeat){
    const pricedModels=(entry.selectionEntries||[]).filter(item=>item.type==='model'&&pointCost(item)>0);
    if(!pricedModels.length)return[];
    const rows=[];
    for(const model of pricedModels){
      const range=constraints(model);
      const sizes=new Set([range.min??1,range.max??range.min??1]);
      for(const size of [...sizes].sort((a,b)=>a-b))rows.push({
        label:`${size} ${size===1?clean(model.name):plural(clean(model.name))}`,
        value:pointCost(model)*size
      });
    }
    return unique(rows,row=>`${row.label}:${row.value}`);
  }
  const sizes=new Set();
  for(const rule of rules){
    const baseSize=rule.comparison==='greaterThan'?rule.threshold:Math.max(1,rule.threshold-1);
    sizes.add(baseSize);sizes.add(rule.comparison==='greaterThan'?rule.threshold*2:rule.threshold);
  }
  if(!sizes.size){
    const fixed=composition.filter(item=>item.min===item.max&&item.min>0).reduce((sum,item)=>sum+item.min,0);
    if(fixed)sizes.add(fixed);
  }
  if(!sizes.size)sizes.add(entry.type==='model'?1:0);
  const rows=[];
  for(const size of [...sizes].sort((a,b)=>a-b)){
    let value=base;
    for(const rule of rules){
      const applies=rule.comparison==='greaterThan'?size>rule.threshold:size>=rule.threshold;
      if(applies)value=rule.type==='set'?rule.value:value+rule.value;
    }
    rows.push({label:size?`${size} model${size===1?'':'s'}`:'',value,...(size?{minModels:size,maxModels:size}:{})});
    if(repeat)rows.push({label:`${repeat.start}+ unit${size?`: ${size} models`:''}`,value:value+repeat.increment});
  }
  const uniqueRows=unique(rows,row=>`${row.label}:${row.value}`);
  if(repeat||uniqueRows.length<2)return uniqueRows;
  const modelRows=uniqueRows.filter(row=>Number.isFinite(row.minModels));
  const boundaries=[...new Set(rules.map(rule=>rule.comparison==='greaterThan'?rule.threshold+1:rule.threshold))].sort((a,b)=>a-b);
  const maxModels=composition.reduce((sum,item)=>sum+Number(item.max||0),0);
  const minModels=composition.reduce((sum,item)=>sum+Number(item.min||0),0);
  if(modelRows.length!==uniqueRows.length||boundaries.length!==modelRows.length-1||maxModels<boundaries.at(-1))return uniqueRows;
  return modelRows.map((row,index)=>{
    const rowMin=index===0?minModels:boundaries[index-1];
    const rowMax=index<boundaries.length?boundaries[index]-1:maxModels;
    return{
      ...row,
      minModels:rowMin,
      maxModels:rowMax,
      label:rowMin===rowMax?`${rowMin} model${rowMin===1?'':'s'}`:`${rowMin}-${rowMax} models`
    };
  });
}

function relationTargets(text){
  const output=[];
  for(const match of String(text||'').matchAll(/\^\^(.+?)\^\^/g))output.push(clean(match[1]));
  return unique(output,item=>key(item));
}
function relationsFor(abilities,profiles){
  const relations={leader:[],support:[],attachedUnit:[],transport:[]};
  for(const ability of abilities){
    const name=key(ability.title);
    if(name==='leader')relations.leader.push(...relationTargets(ability.rawText));
    else if(name==='support')relations.support.push(...relationTargets(ability.rawText));
    else if(name==='attached unit'||name==='attached units')relations.attachedUnit.push(...relationTargets(ability.rawText));
  }
  for(const profile of profiles.filter(item=>item.typeName==='Transport')){
    relations.transport.push(clean(profile.characteristics?.map(item=>item.$text).filter(Boolean).join(' ')));
  }
  return Object.fromEntries(Object.entries(relations).map(([name,items])=>[name,unique(items.filter(Boolean),item=>key(item))]));
}

function paidWargear(nodes){
  const items=[];
  for(const node of nodes){
    if(node.type!=='upgrade'||blockedBranch.test(clean(node.name)))continue;
    const base=pointCost(node);
    const modifiers=(node.modifiers||[]).filter(mod=>mod.field===pointsCostType&&Number(mod.value)>0).map(mod=>({type:mod.type,value:Number(mod.value),conditions:mod.conditions||mod.conditionGroups||[]}));
    if(base>0||modifiers.length)items.push({name:clean(node.name),value:base,modifiers});
  }
  return unique(items,item=>`${key(item.name)}:${item.value}:${JSON.stringify(item.modifiers)}`);
}

function parseDatasheet(link){
  const entry=byId.get(link.targetId);
  if(!entry)throw new Error(`Missing target ${link.targetId} for ${link.name}`);
  const rawTitle=clean(link.name);
  const title=clean(rawTitle.replace(/\s*\[Legends]\s*$/i,''));
  const resolved=graph(entry);
  const statProfiles=resolved.profiles.filter(profile=>profile.typeName==='Unit').map(profile=>{
    const stats=characteristics(profile);
    return{name:clean(profile.name),stats:{M:stats.M||'',T:stats.T||'',Sv:stats.Sv||stats.SV||'',W:stats.W||'',Ld:stats.LD||stats.Ld||'',OC:stats.OC||'',Invulnerable:stats.InSv||''}};
  }).filter(profile=>['M','T','Sv','W','Ld','OC'].every(name=>profile.stats[name]!==''));
  if(!statProfiles.length)throw new Error(`No unit profile for ${title}`);
  const weapons=resolved.profiles.filter(profile=>['Ranged Weapons','Melee Weapons'].includes(profile.typeName)).map(profile=>{
    const stats=characteristics(profile);
    const ranged=profile.typeName==='Ranged Weapons';
    return{name:clean(profile.name),mode:ranged?'ranged':'melee',range:stats.Range||'-',a:stats.A||'-',skill:(ranged?stats.BS:stats.WS)||'-',s:stats.S||'-',ap:stats.AP||'-',d:stats.D||'-',abilities:clean(stats.Keywords)==='-'?'':clean(stats.Keywords)};
  });
  const profileAbilities=resolved.profiles.filter(profile=>profile.typeName==='Abilities').map(profile=>{
    const rawText=(profile.characteristics||[]).find(item=>item.name==='Description')?.$text||'';
    return{title:clean(profile.name),text:clean(rawText),rawText};
  });
  const ruleAbilities=resolved.rules.map(rule=>({...rule,rawText:rule.text}));
  const allAbilities=unique([...profileAbilities,...ruleAbilities].filter(item=>item.title),item=>`${key(item.title)}:${item.text}`);
  const composition=compositionFor(entry,title);
  const categories=categoriesFor(entry);
  const legends=/\[Legends]/i.test(rawTitle);
  const imperialArmour=imperialArmourNames.has(key(rawTitle));
  const sourceLayer=imperialArmour?'imperial-armour':legends?'legends':'codex';
  return{
    id:`unit-${slug(title)}`,
    title,
    status:legends?'Warhammer Legends':'Current',
    sourceLayer,
    category:categoryFor(rawTitle,categories),
    points:pointRows(entry,composition),
    profiles:unique(statProfiles,item=>`${item.name}:${JSON.stringify(item.stats)}`),
    weapons:unique(weapons,item=>JSON.stringify(item)),
    abilities:allAbilities.map(({rawText,...ability})=>ability),
    keywords:categories,
    composition,
    paidWargear:paidWargear(resolved.nodes),
    relations:relationsFor(allAbilities,resolved.profiles)
  };
}

const rootLinks=(faction.entryLinks||[]).filter(link=>{
  if(link.type!=='selectionEntry'||link.hidden===true)return false;
  if(excludedNames.has(key(link.name))||blockedNamePatterns.some(pattern=>pattern.test(link.name)))return false;
  const entry=byId.get(link.targetId);
  return entry&&!excludedCategories.has(key(primaryCategory(entry)));
});
const parsed=rootLinks.map(parseDatasheet);
const duplicates=parsed.filter((item,index)=>parsed.findIndex(other=>other.id===item.id)!==index);
if(duplicates.length)throw new Error(`Duplicate datasheet ids: ${duplicates.map(item=>item.id).join(', ')}`);
const sortUnits=items=>items.sort((a,b)=>a.category.localeCompare(b.category)||a.title.localeCompare(b.title));

const allowedDetachments=new Set((config.enhancements?.detachments||[]).map(key));
const enhancementItems=[];
const findEnhancements=value=>{
  if(!value||typeof value!=='object')return;
  if(/ Enhancements$/i.test(value.name||'')){
    const detachment=clean(value.name).replace(/ Enhancements$/i,'');
    if(allowedDetachments.has(key(detachment))){
      for(const candidate of [...(value.selectionEntries||[]),...(value.entryLinks||[])]){
        const entry=candidate.targetId?byId.get(candidate.targetId):candidate;
        if(!entry)continue;
        const value=pointCost(entry)||pointCost(candidate);
        if(value<=0)continue;
        const resolved=graph(entry);
        const ability=resolved.profiles.find(profile=>profile.typeName==='Abilities');
        const profile=resolved.profiles.find(item=>['Ranged Weapons','Melee Weapons'].includes(item.typeName));
        enhancementItems.push({
          id:`enhancement-${slug(candidate.name||entry.name)}`,
          title:clean(candidate.name||entry.name),
          detachment,
          value,
          text:ability?clean(characteristics(ability).Description):'',
          profile:profile?{name:clean(profile.name),type:profile.typeName,characteristics:characteristics(profile)}:null
        });
      }
    }
  }
  for(const child of Object.values(value)){
    if(Array.isArray(child))child.forEach(findEnhancements);
    else if(child&&typeof child==='object')findEnhancements(child);
  }
};
roots.forEach(findEnhancements);
const enhancements=unique(enhancementItems,item=>`${key(item.detachment)}:${key(item.title)}`).sort((a,b)=>a.detachment.localeCompare(b.detachment)||a.title.localeCompare(b.title));

const sourceMeta={
  title:`BSData Warhammer 40,000 11th Edition · ${config.faction.title}`,
  repository:config.source.repository,
  commit:config.source.commit,
  revision:String(faction.revision),
  url:config.source.url,
  snapshotSha256:sha256(Buffer.from(json(snapshot)))
};
const datasheets={
  schema:1,
  source:sourceMeta,
  datasheets:sortUnits(parsed.filter(item=>item.sourceLayer==='codex')),
  imperialArmour:sortUnits(parsed.filter(item=>item.sourceLayer==='imperial-armour')),
  legends:sortUnits(parsed.filter(item=>item.sourceLayer==='legends')),
  audit:{
    rootEntries:(faction.entryLinks||[]).length,
    excludedEntries:(faction.entryLinks||[]).length-rootLinks.length,
    datasheets:parsed.filter(item=>item.sourceLayer==='codex').length,
    imperialArmour:parsed.filter(item=>item.sourceLayer==='imperial-armour').length,
    imperialArmourLegends:parsed.filter(item=>item.sourceLayer==='imperial-armour'&&item.status==='Warhammer Legends').length,
    currentImperialArmour:parsed.filter(item=>item.sourceLayer==='imperial-armour'&&item.status!=='Warhammer Legends').length,
    legends:parsed.filter(item=>item.sourceLayer==='legends').length
  }
};
const points={
  schema:1,
  source:sourceMeta,
  units:parsed.map(({id,title,status,sourceLayer,points,paidWargear})=>({id,title,status,sourceLayer,points,paidWargear})).sort((a,b)=>a.title.localeCompare(b.title)),
  enhancements,
  audit:{units:parsed.length,enhancements:enhancements.length}
};

const outputs=[
  [resolvePath(config.outputs.snapshot),json(snapshot)],
  [resolvePath(config.outputs.datasheets),json(datasheets)],
  [resolvePath(config.outputs.points),json(points)]
];
for(const [file,content] of outputs){
  if(check){
    if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==content)throw new Error(`${path.basename(file)} is stale; rerun extractor`);
  }else{
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,content);
  }
}
console.log(`${check?'Checked':'Extracted'} ${datasheets.audit.datasheets} codex, ${datasheets.audit.imperialArmour} Imperial Armour, ${datasheets.audit.legends} Legends datasheets and ${enhancements.length} Enhancements`);
