import {requiredKeywordField} from '../keyword-values.mjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyBsdataSource,verifyTrackedInputs} from './verify-bsdata-source.mjs';
import {createArmyCoreAbilityBindings} from './army-core-ability-binding.mjs';

const args=process.argv.slice(2);
const check=args.includes('--check');
const candidateDirIndex=args.indexOf('--candidate-dir');
const candidateDirArg=candidateDirIndex<0?null:args[candidateDirIndex+1];
if(candidateDirIndex>=0&&(!candidateDirArg||candidateDirArg.startsWith('--')))throw new Error('--candidate-dir requires a path');
const configArg=args.find(arg=>!arg.startsWith('--'));
if(!configArg)throw new Error('Usage: node extract-bsdata-11e.mjs <config.json> [--check]');

const configPath=path.resolve(configArg);
const configDir=path.dirname(configPath);
const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const coreAbilityBindings=createArmyCoreAbilityBindings({repoRoot:repo});
const resolvePath=value=>path.resolve(configDir,value);
const pathKey=value=>process.platform==='win32'?value.toLowerCase():value;
const resolvedPath=value=>{
  let current=path.resolve(value),suffix=[];
  while(!fs.existsSync(current)){
    const parent=path.dirname(current);
    if(parent===current)break;
    suffix.unshift(path.basename(current));
    current=parent;
  }
  return path.resolve(fs.realpathSync.native(current),...suffix);
};
const pathWithin=(candidate,root)=>{
  const relative=path.relative(pathKey(root),pathKey(candidate));
  return relative===''||(!relative.startsWith(`..${path.sep}`)&&relative!=='..'&&!path.isAbsolute(relative));
};
const candidateOnly=config.writePolicy?.mode==='candidate-only';
let candidateDir=null;
if(!check&&candidateOnly){
  if(!candidateDirArg)throw new Error(`${config.faction?.id||'book'}: write-run requires --candidate-dir`);
  candidateDir=resolvedPath(candidateDirArg);
  const allowedRoots=[resolvedPath(os.tmpdir()),resolvedPath(path.join(repo,'tmp','candidates',config.faction.id))];
  if(!allowedRoots.some(root=>pathWithin(candidateDir,root)))throw new Error(`${config.faction?.id||'book'}: candidate destination is outside approved roots`);
}else if(candidateDirArg&&!candidateOnly){
  throw new Error(`${config.faction?.id||'book'}: --candidate-dir requires candidate-only write policy`);
}
const sha256=buffer=>crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
const json=value=>`${JSON.stringify(value,null,2)}\n`;
const persistentChildSourceIds=new Set(config.persistentChildSourceIds||[]);
if(persistentChildSourceIds.size!==(config.persistentChildSourceIds||[]).length||(config.persistentChildSourceIds||[]).some(id=>typeof id!=='string'||!id.trim()))throw new Error(`${config.faction?.id||'book'}: persistentChildSourceIds must contain unique source IDs`);
if(config.allowPartialPersistentChildSourceIds!==undefined&&typeof config.allowPartialPersistentChildSourceIds!=='boolean')throw new Error(`${config.faction?.id||'book'}: allowPartialPersistentChildSourceIds must be boolean`);
const observedPersistentChildSourceIds=new Set();
const persistentChildIdentity=sourceId=>{if(!persistentChildSourceIds.has(sourceId))return{};observedPersistentChildSourceIds.add(sourceId);return{sourceChildId:sourceId};};
const textCorrections=new Map(Object.entries(config.textCorrections||{}));
const keywordCorrections=new Map(Object.entries(config.keywordCorrections||{}).map(([from,to])=>[from.toLowerCase(),to]));
const clean=value=>{
  const normalized=String(value??'')
    .replaceAll('^^**',' ').replaceAll('**^^',' ').replaceAll('**',' ').replaceAll('^^',' ')
    .replaceAll('\u00a0',' ').replaceAll('\u2011','-').replaceAll('\ufffd','')
    .replace(/[ \t]+/g,' ').replace(/\s+([,.;:])/g,'$1').trim();
  return textCorrections.get(normalized)||normalized;
};
const key=value=>clean(value).toLowerCase().replace(/\s*\[legends]\s*$/i,'');
const slug=value=>key(value).replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const plural=value=>/s$/i.test(value)?value:/x$/i.test(value)?`${value}es`:`${value}s`;
const weaponFactKey=weapon=>JSON.stringify([weapon.name,weapon.mode,weapon.range,weapon.a,weapon.skill,weapon.s,weapon.ap,weapon.d,weapon.abilities]);
const canonicalWeaponFacts=items=>{
  const output=[],indexByFact=new Map();
  for(const item of items){
    const fact=weaponFactKey(item),index=indexByFact.get(fact);
    if(index===undefined){indexByFact.set(fact,output.length);output.push(item);continue;}
    const existing=output[index];
    if(existing.sourceChildId&&item.sourceChildId&&existing.sourceChildId!==item.sourceChildId)throw new Error(`Conflicting persistent weapon profile identities for ${item.name}: ${existing.sourceChildId}, ${item.sourceChildId}`);
    if(!existing.sourceChildId&&item.sourceChildId)output[index]=item;
  }
  return output;
};
const unique=(items,marker)=>{
  const seen=new Set();
  return items.filter(item=>{const id=marker(item);if(seen.has(id))return false;seen.add(id);return true;});
};

const configuredInputs=config.inputs.map(input=>({...input,file:resolvePath(input.path)}));
const inputs=configuredInputs.map(input=>{
  const file=input.file;
  const sourceText=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
  const item={role:input.role,file:path.basename(file),sha256:sha256(Buffer.from(sourceText,'utf8')),data:JSON.parse(sourceText)};
  if(input.provenance){
    item.provenance=input.provenance.kind==='repository-generated'
      ?{kind:'repository-generated',producer:input.provenance.producer}
      :{repository:config.source.repository,commit:input.provenance.commit||config.source.commit};
  }
  return item;
});
const defaultCheckout=resolvePath(config.source.checkout||path.dirname(config.inputs.find(input=>input.role==='faction')?.path||config.inputs[0].path));
const sourceGroups=new Map(),repositoryGroups=new Map();
for(const input of configuredInputs){
  if(input.provenance?.kind==='repository-generated'){
    const checkout=resolvePath(input.provenance.checkout||repo),marker=pathKey(checkout),group=repositoryGroups.get(marker)||{checkout,inputFiles:[]};
    group.inputFiles.push(input.file);repositoryGroups.set(marker,group);
    continue;
  }
  const checkout=resolvePath(input.provenance?.checkout||defaultCheckout),commit=input.provenance?.commit||config.source.commit;
  const marker=`${pathKey(checkout)}\0${String(commit).toLowerCase()}`,group=sourceGroups.get(marker)||{checkout,commit,inputFiles:[]};
  group.inputFiles.push(input.file);sourceGroups.set(marker,group);
}
for(const group of sourceGroups.values())verifyBsdataSource({checkout:group.checkout,expectedCommit:group.commit,inputFiles:group.inputFiles});
for(const group of repositoryGroups.values())verifyTrackedInputs(group);
const snapshot={
  schema:1,
  source:{repository:config.source.repository,commit:config.source.commit},
  documents:inputs
};
const roots=inputs.map(input=>input.data.catalogue||input.data.gameSystem);
const faction=inputs.find(input=>input.role==='faction')?.data.catalogue;
if(!faction)throw new Error('Config must identify one input with role "faction"');

const byId=new Map();
const sourceRoleById=new Map();
const index=(value,sourceRole)=>{
  if(!value||typeof value!=='object')return;
  if(value.id&&!byId.has(value.id)){
    byId.set(value.id,value);
    sourceRoleById.set(value.id,sourceRole);
  }
  for(const child of Object.values(value)){
    if(Array.isArray(child))child.forEach(item=>index(item,sourceRole));
    else if(child&&typeof child==='object')index(child,sourceRole);
  }
};
inputs.forEach(input=>index(input.data.catalogue||input.data.gameSystem,input.role));

const pointsCostType=roots.flatMap(root=>root.costTypes||[]).find(item=>item.name==='pts')?.id||'51b2-306e-1021-d207';
const pointCost=entry=>Number((entry?.costs||[]).find(cost=>cost.name==='pts'||cost.typeId===pointsCostType)?.value||0);
const blockedBranch=new RegExp(config.filters.blockedBranches.join('|'),'i');
const blockedNamePatterns=(config.filters.excludeNamePatterns||[]).map(pattern=>new RegExp(pattern,'i'));
const excludedNames=new Set((config.filters.excludeNames||[]).map(key));
const excludedCategories=new Set((config.filters.excludePrimaryCategories||[]).map(key));
const imperialArmourNames=new Set((config.filters.imperialArmourNames||[]).map(key));
const weaponProfileTypes=new Set(['Ranged Weapons','Melee Weapons']);
const isWeaponProfile=profile=>weaponProfileTypes.has(profile?.typeName);
const ownsWeaponProfile=node=>(node.profiles||[]).some(isWeaponProfile)||[...(node.entryLinks||[]),...(node.infoLinks||[])].some(link=>link.type==='profile'&&isWeaponProfile(byId.get(link.targetId)));

function graph(entry){
  const profiles=[];
  const profileRecords=[];
  const rules=[];
  const ruleRecords=[];
  const nodes=[];
  const visited=new Set();
  const walk=(node,parentPath=[],parentWeaponBranch=false)=>{
    if(!node||typeof node!=='object'||visited.has(node.id))return;
    if(node!==entry&&blockedBranch.test(clean(node.name)))return;
    if(node.id)visited.add(node.id);
    nodes.push(node);
    const sourcePath=[...parentPath,{type:node.type||'group',name:clean(node.name)}];
    const weaponBranch=parentWeaponBranch||(node.type==='upgrade'&&ownsWeaponProfile(node));
    for(const profile of (node.profiles||[]).filter(profile=>profile.hidden!==true)){
      profiles.push(profile);
      profileRecords.push({profile,ownerType:node.type||'group',ownerName:clean(node.name),sourceRole:sourceRoleById.get(profile.id)||'',sourceKind:weaponBranch?'weapon':'unit',sourcePath});
    }
    for(const child of [...(node.selectionEntries||[]),...(node.selectionEntryGroups||[])])walk(child,sourcePath,weaponBranch);
    for(const link of [...(node.entryLinks||[]),...(node.infoLinks||[])]){
      if(link.hidden===true)continue;
      const target=byId.get(link.targetId);
      if(!target)continue;
      if(link.type==='profile'||target.typeName){
        profiles.push(target);
        profileRecords.push({profile:target,ownerType:node.type||'group',ownerName:clean(node.name),sourceRole:sourceRoleById.get(target.id)||'',sourceKind:weaponBranch?'weapon':'unit',sourcePath});
      }
      else if(link.type==='rule'){
        const suffix=(link.modifiers||[]).filter(mod=>mod.type==='append'&&mod.field==='name').map(mod=>clean(mod.value)).join(' ');
        const rule=coreAbilityBindings.bindAbility({
          title:clean(`${link.name||target.name||''} ${suffix}`),
          text:clean(target.description||target.characteristics?.find(item=>item.name==='Description')?.$text),
          sourceAbilityId:target.id
        });
        rules.push(rule);
        ruleRecords.push({...rule,ownerType:node.type||'group',ownerName:clean(node.name),sourceRole:sourceRoleById.get(target.id)||'',sourceKind:weaponBranch?'weapon':'unit',sourcePath});
      }else if(['selectionEntry','selectionEntryGroup'].includes(link.type))walk(target,sourcePath,weaponBranch);
    }
  };
  walk(entry);
  return {
    profiles:unique(profiles,profile=>profile.id||`${profile.typeName}:${profile.name}:${JSON.stringify(profile.characteristics)}`),
    profileRecords:unique(profileRecords,item=>item.profile.id||`${item.profile.typeName}:${item.profile.name}:${JSON.stringify(item.profile.characteristics)}`),
    rules:unique(rules.filter(rule=>rule.title),rule=>`${key(rule.title)}:${rule.text}`),
    ruleRecords:unique(ruleRecords.filter(rule=>rule.title),rule=>`${key(rule.title)}:${rule.text}:${rule.ownerType}:${key(rule.ownerName)}`),
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
const categoryTitles=new Map([
  ['epic hero','Epic Heroes'],
  ['character','Characters'],
  ['battleline','Battleline'],
  ['dedicated transport','Dedicated Transports'],
  ['monster','Monsters'],
  ['infantry','Infantry']
]);
const categoryFor=(title,primary)=>{
  if(/\[legends]/i.test(title))return 'Warhammer Legends';
  const sourceCategory=clean(primary).replace(/^Faction:\s*/i,'');
  return categoryTitles.get(key(sourceCategory))||sourceCategory||'Other';
};

function compositionFor(entry,title){
  const compositionModel=(model,name,min,max)=>{
    const intrinsicKeywords=categoriesFor(model);
    return{name,min,max,models:[name],...(intrinsicKeywords.length?{intrinsicKeywords}:{})};
  };
  if(entry.type==='model')return[{name:title,min:1,max:1,models:[title]}];
  const output=[];
  for(const model of (entry.selectionEntries||[]).filter(item=>item.type==='model')){
    const range=constraints(model);
    const name=clean(model.name);
    output.push(compositionModel(model,name,range.min??0,range.max??range.min??0));
  }
  for(const group of entry.selectionEntryGroups||[]){
    const models=(group.selectionEntries||[]).filter(item=>item.type==='model');
    if(!models.length)continue;
    const range=constraints(group);
    const childRanges=models.map(constraints);
    output.push({
      name:config.transforms?.stripCompositionCountPrefixes?clean(group.name).replace(/^\d+(?:-\d+)?\s+/, ''):clean(group.name),
      min:range.min??childRanges.reduce((sum,item)=>sum+(item.min||0),0),
      max:range.max??childRanges.reduce((sum,item)=>sum+(item.max||item.min||0),0),
      models:models.map(item=>config.transforms?.stripCompositionCountPrefixes?clean(item.name).replace(/^\d+(?:-\d+)?\s+/, ''):clean(item.name))
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
  const value=String(text||''),output=[];
  for(const match of value.matchAll(/\^\^(.+?)\^\^/g))output.push(clean(match[1]));
  if(!output.length){
    const list=value.match(/attached to the following units:\s*([\s\S]+)$/i)?.[1];
    if(list)output.push(...list.split(/\s*■\s*/).map(clean).filter(Boolean));
  }
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
    return{name:clean(profile.name),mode:ranged?'ranged':'melee',range:stats.Range||'-',a:stats.A||'-',skill:(ranged?stats.BS:stats.WS)||'-',s:stats.S||'-',ap:stats.AP||'-',d:stats.D||'-',abilities:clean(stats.Keywords)==='-'?'':clean(stats.Keywords),...persistentChildIdentity(profile.id)};
  });
  const abilityRecords=resolved.profileRecords.filter(item=>item.profile.typeName==='Abilities').map(item=>{
    const rawText=(item.profile.characteristics||[]).find(characteristic=>characteristic.name==='Description')?.$text||'';
    return coreAbilityBindings.bindAbility({title:clean(item.profile.name),text:clean(rawText),sourceAbilityId:item.profile.id,rawText,ownerType:item.ownerType,ownerName:item.ownerName,sourceRole:item.sourceRole,sourceKind:item.sourceKind,sourcePath:item.sourcePath,...persistentChildIdentity(item.profile.id)});
  });
  const separateWargear=config.faction?.separateWargearAbilities===true;
  const classifyAbilities=config.faction?.classifyAbilities===true;
  const factionAbilities=new Set((config.faction?.factionAbilities||[]).map(key));
  const relationAbilities=new Set(['leader','support','attached unit','attached units']);
  const ruleRecords=resolved.ruleRecords.map(rule=>({...rule,rawText:rule.text}));
  const allRecords=[...abilityRecords,...ruleRecords];
  const upgradeAbility=item=>separateWargear&&item.ownerType==='upgrade'&&key(item.ownerName)!==key(title);
  const linkedCoreAbility=item=>upgradeAbility(item)&&item.sourceRole==='game-system';
  const wargearAbility=item=>upgradeAbility(item)&&item.sourceRole!=='game-system'&&key(item.ownerName)===key(item.title);
  const nonWargearAbilityBranches=new Set((config.faction?.nonWargearAbilityBranches||[]).map(key));
  const classifiedWargearAbility=item=>classifyAbilities&&item.ownerType==='upgrade'&&item.sourceRole==='faction'&&key(item.ownerName)===key(item.title)&&!(item.sourcePath||[]).some(node=>nonWargearAbilityBranches.has(key(node.name)));
  const weaponAbility=item=>item.sourceKind==='weapon';
  const nonIntrinsicAbility=item=>classifyAbilities&&!classifiedWargearAbility(item)&&((item.sourcePath?.length||0)>1||relationAbilities.has(key(item.title)));
  const abilityClass=item=>item.sourceRole==='game-system'?'core':factionAbilities.has(key(item.title))?'faction':'datasheet';
  const ordinaryAbility=item=>!linkedCoreAbility(item)&&!wargearAbility(item)&&!classifiedWargearAbility(item)&&!weaponAbility(item)&&!nonIntrinsicAbility(item);
  const profileAbilities=abilityRecords.filter(ordinaryAbility);
  const ruleAbilities=ruleRecords.filter(ordinaryAbility);
  const wargearAbilities=allRecords.filter(item=>wargearAbility(item)||classifiedWargearAbility(item));
  let allAbilities=unique([...profileAbilities,...ruleAbilities].filter(item=>item.title).map(item=>classifyAbilities?{...item,abilityClass:abilityClass(item)}:item),item=>`${key(item.title)}:${item.text}`);
  const relations=relationsFor(classifyAbilities?allRecords:allAbilities,resolved.profiles);
  if(config.faction?.separateLeaderRelations===true){
    allAbilities=allAbilities.filter(item=>key(item.title)!=='leader'||relationTargets(item.rawText).length===0);
  }
  const composition=compositionFor(entry,title);
  const categories=categoriesFor(entry).map(value=>keywordCorrections.get(value.toLowerCase())||value);
  const legends=/\[Legends]/i.test(rawTitle);
  const imperialArmour=imperialArmourNames.has(key(rawTitle));
  const sourceLayer=imperialArmour?'imperial-armour':legends?'legends':'codex';
  return{
    id:`unit-${slug(title)}`,
    title,
    status:legends?'Warhammer Legends':'Current',
    sourceLayer,
    category:categoryFor(rawTitle,primaryCategory(entry)),
    points:pointRows(entry,composition),
    profiles:unique(statProfiles,item=>`${item.name}:${JSON.stringify(item.stats)}`),
    weapons:canonicalWeaponFacts(weapons),
    abilities:allAbilities.map(({rawText,ownerType,ownerName,sourceRole,sourceKind,sourcePath,...ability})=>ability),
    ...(separateWargear||classifyAbilities?{wargearAbilities:unique(wargearAbilities.filter(item=>item.title),item=>`${key(item.title)}:${item.text}`).map(({rawText,ownerType,ownerName,sourceRole,sourceKind,sourcePath,...ability})=>ability)}:{}),
    keywords:categories,
    composition,
    paidWargear:paidWargear(resolved.nodes),
    relations
  };
}

const rootLinks=(faction.entryLinks||[]).filter(link=>{
  if(link.type!=='selectionEntry'||link.hidden===true)return false;
  if(excludedNames.has(key(link.name))||blockedNamePatterns.some(pattern=>pattern.test(link.name)))return false;
  const entry=byId.get(link.targetId);
  return entry&&!excludedCategories.has(key(primaryCategory(entry)));
});
const parsed=rootLinks.map(parseDatasheet);
const missingPersistentChildSourceIds=[...persistentChildSourceIds].filter(id=>!observedPersistentChildSourceIds.has(id));
if(missingPersistentChildSourceIds.length&&config.allowPartialPersistentChildSourceIds!==true)throw new Error(`${config.faction.id}: persistent child source IDs were not found: ${missingPersistentChildSourceIds.join(', ')}`);
for(const unit of parsed){
  const correction=config.unitCorrections?.[unit.title];
  if(!correction)continue;
  if(correction.sourceLayer)unit.sourceLayer=correction.sourceLayer;
  if(correction.addKeywords)unit.keywords=unique([...requiredKeywordField(unit),...correction.addKeywords],key);
  if(correction.removeKeywords){
    const removed=new Set(correction.removeKeywords.map(key));
    unit.keywords=requiredKeywordField(unit).filter(keyword=>!removed.has(key(keyword)));
  }
  if(correction.removeAbilities){
    const removed=new Set(correction.removeAbilities.map(key));
    unit.abilities=unit.abilities.filter(ability=>!removed.has(key(ability.title)));
  }
  if(correction.removeWargearAbilities){
    const removed=new Set(correction.removeWargearAbilities.map(key));
    unit.wargearAbilities=unit.wargearAbilities.filter(ability=>!removed.has(key(ability.title)));
  }
  if(correction.leaderRelations){
    unit.relations.leader=unique(correction.leaderRelations.map(clean).filter(Boolean),key);
    unit.abilities=unit.abilities.filter(ability=>key(ability.title)!=='leader'||!/^this (?:model|unit) can be attached to/i.test(ability.text));
  }
  if(correction.addLeaderRelations)unit.relations.leader=unique([...unit.relations.leader,...correction.addLeaderRelations.map(clean).filter(Boolean)],key);
  for(const [title,replacement] of Object.entries(correction.abilities||{})){
    const ability=unit.abilities.find(item=>key(item.title)===key(title));
    if(!ability)throw new Error(`${unit.title}: ability correction target not found: ${title}`);
    Object.assign(ability,replacement);
  }
  for(const [name,replacement] of Object.entries(correction.profileStats||{})){
    const profile=unit.profiles.find(item=>key(item.name)===key(name));
    if(!profile)throw new Error(`${unit.title}: profile correction target not found: ${name}`);
    Object.assign(profile.stats,replacement);
  }
  for(const ability of correction.addAbilities||[]){
    if(!unit.abilities.some(item=>key(item.title)===key(ability.title)))unit.abilities.push(ability);
  }
  if(correction.abilityOrder){
    const order=new Map(correction.abilityOrder.map((title,index)=>[key(title),index]));
    if(order.size!==unit.abilities.length||unit.abilities.some(ability=>!order.has(key(ability.title))))throw new Error(`${unit.title}: ability order does not match the complete canonical ability set`);
    unit.abilities.sort((a,b)=>order.get(key(a.title))-order.get(key(b.title)));
  }
  for(const weapon of unit.weapons){
    const profile=correction.weaponProfiles?.[weapon.name];
    if(profile)Object.assign(weapon,profile);
    const skill=correction.weaponSkills?.[weapon.name];
    if(skill)weapon.skill=skill;
    const abilities=correction.weaponAbilities?.[weapon.name];
    if(abilities!==undefined)weapon.abilities=abilities;
    const name=correction.weaponNames?.[weapon.name];
    if(name)weapon.name=name;
  }
  if(correction.removeWeapons){
    const removed=new Set(correction.removeWeapons.map(key));
    unit.weapons=unit.weapons.filter(weapon=>!removed.has(key(weapon.name)));
  }
  for(const name of Object.keys(correction.weaponProfiles||{}))if(!unit.weapons.some(weapon=>weapon.name===name))throw new Error(`${unit.title}: weapon profile correction target not found: ${name}`);
  unit.weapons=unique(unit.weapons,weapon=>[weapon.name,weapon.mode,weapon.range,weapon.a,weapon.skill,weapon.s,weapon.ap,weapon.d,weapon.abilities].map(key).join('|'));
  if(correction.gameSelectionContracts)unit.gameSelectionContracts=structuredClone(correction.gameSelectionContracts);
  for(const [name,keywords] of Object.entries(correction.compositionIntrinsicKeywords||{})){
    const item=unit.composition.find(candidate=>key(candidate.name)===key(name));
    if(!item)throw new Error(`${unit.title}: composition correction target not found: ${name}`);
    item.intrinsicKeywords=unique(keywords.map(clean).filter(Boolean),key);
  }
}
const duplicates=parsed.filter((item,index)=>parsed.findIndex(other=>other.id===item.id)!==index);
if(duplicates.length)throw new Error(`Duplicate datasheet ids: ${duplicates.map(item=>item.id).join(', ')}`);
const stableCategoryTitles=new Set([...categoryTitles.values(),'Warhammer Legends']);
const sortCategory=category=>stableCategoryTitles.has(category)?category:'Other';
const sortUnits=items=>items.sort((a,b)=>sortCategory(a.category).localeCompare(sortCategory(b.category))||a.title.localeCompare(b.title));

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
if(config.faction?.qualifyDuplicateEnhancementIds===true){
  const counts=new Map();
  for(const item of enhancements)counts.set(key(item.title),(counts.get(key(item.title))||0)+1);
  for(const item of enhancements)if(counts.get(key(item.title))>1)item.id=`enhancement-${slug(item.detachment)}-${slug(item.title)}`;
}
const publishedTitles=new Set(parsed.map(item=>key(item.title)));
for(const unit of parsed)for(const role of ['leader','support']){
  unit.relations[role]=(unit.relations[role]||[]).flatMap(target=>String(target).split(/[;,]/).map(value=>value.trim()).filter(Boolean));
  if(config.faction?.preserveExternalRelations!==true)unit.relations[role]=unit.relations[role].filter(target=>publishedTitles.has(key(target)));
}

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
  datasheets:sortUnits(parsed.filter(item=>item.sourceLayer==='codex'||item.sourceLayer==='faction-pack')),
  imperialArmour:sortUnits(parsed.filter(item=>item.sourceLayer==='imperial-armour')),
  legends:sortUnits(parsed.filter(item=>item.sourceLayer==='legends')),
  audit:{
    rootEntries:(faction.entryLinks||[]).length,
    excludedEntries:(faction.entryLinks||[]).length-rootLinks.length,
    datasheets:parsed.filter(item=>item.sourceLayer==='codex'||item.sourceLayer==='faction-pack').length,
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
if(config.outputs.officialPoints){
  const official=JSON.parse(fs.readFileSync(resolvePath(config.outputs.officialPoints),'utf8'));
  const unitOverrides=new Map((official.unitOverrides||[]).map(item=>[key(item.title),item]));
  const verifiedUnits=new Set((official.verifiedUnits||[]).map(key));
  for(const unit of points.units){
    const override=unitOverrides.get(key(unit.title));
    if(override){
      unit.points=override.points;
      if(override.paidWargear)unit.paidWargear=override.paidWargear;
      const supportRelation=override.support?.length&&(config.faction?.supportRelationOverrides||[]).some(title=>key(title)===key(unit.title));
      const relationRole=supportRelation?'support':override.leader?.length?'leader':null;
      if(relationRole){
        const targets=override[relationRole],datasheet=parsed.find(item=>item.id===unit.id),text=`This model can be attached to the following units: ${targets.join(', ')}.`;
        const separateLeaderRelation=config.faction?.classifyAbilities===true||config.faction?.separateLeaderRelations===true||(config.faction?.leaderRelationOverrides||[]).some(title=>key(title)===key(unit.title));
        if(separateLeaderRelation&&datasheet){
          if(relationRole==='support')datasheet.relations.leader=[];
          datasheet.relations[relationRole]=targets;
          datasheet.abilities=datasheet.abilities.filter(item=>!['leader','support'].includes(key(item.title))||!/^this (?:model|unit) can be attached to/i.test(item.text));
        }else{
          const ability=datasheet?.abilities.find(item=>key(item.title)==='leader');
          if(ability)ability.text=text;
          else datasheet?.abilities.push({title:'Leader',text});
        }
      }
      if(override.replaceDatasheetPoints){
        const datasheet=parsed.find(item=>item.id===unit.id);
        if(datasheet)datasheet.points=override.points;
      }
    }
    if(verifiedUnits.has(key(unit.title)))unit.pointsSource={label:`Official MFM ${official.version}`,url:official.url,verifiedAt:official.verifiedAt};
  }
  const useDetachmentEnhancementIdentity=config.enhancements?.identity==='detachment-title';
  const enhancementKey=(item,title=item.title)=>useDetachmentEnhancementIdentity?`${key(item.detachment)}|${key(title)}`:key(title);
  const officialEnhancementTitleCounts=new Map();
  for(const item of official.enhancements||[])officialEnhancementTitleCounts.set(key(item.title),(officialEnhancementTitleCounts.get(key(item.title))||0)+1);
  const officialEnhancements=new Map((official.enhancements||[]).map(item=>[enhancementKey(item),item]));
  for(const enhancement of points.enhancements){
    const current=officialEnhancements.get(enhancementKey(enhancement))||officialEnhancements.get(enhancementKey(enhancement,enhancement.title.replace(/\s+\(Aura\)$/i,'')));
    if(current){enhancement.title=current.title;enhancement.value=current.value;enhancement.pointsSource={label:`Official MFM ${official.version}`,url:official.url,verifiedAt:official.verifiedAt};officialEnhancements.delete(enhancementKey(current));}
  }
  for(const item of officialEnhancements.values()){
    const sourceItem=item.sourceTitle?points.enhancements.find(candidate=>(!useDetachmentEnhancementIdentity||key(candidate.detachment)===key(item.detachment))&&key(candidate.title)===key(item.sourceTitle)):null;
    if(sourceItem){const sourceId=sourceItem.sourceId||sourceItem.id;Object.assign(sourceItem,{...(item.id&&item.id!==sourceItem.id?{id:item.id,sourceId}:{}),title:item.title,value:item.value,text:item.text||sourceItem.text,pointsSource:{label:`Official MFM ${official.version}`,url:official.url,verifiedAt:official.verifiedAt}});continue;}
    const generatedId=useDetachmentEnhancementIdentity&&officialEnhancementTitleCounts.get(key(item.title))>1?`enhancement-${slug(item.detachment)}-${slug(item.title)}`:`enhancement-${slug(item.title)}`;
    points.enhancements.push({...(sourceItem||{}),id:item.id||sourceItem?.id||generatedId,title:item.title,detachment:item.detachment||sourceItem?.detachment||'',value:item.value,text:item.text||sourceItem?.text||'',profile:sourceItem?.profile||null,pointsSource:{label:`Official MFM ${official.version}`,url:official.url,verifiedAt:official.verifiedAt}});
  }
  for(const item of official.enhancements||[])if(!points.enhancements.some(candidate=>enhancementKey(candidate)===enhancementKey(item)))throw new Error(`Missing official enhancement: ${item.detachment} / ${item.title}`);
  points.enhancements.sort((a,b)=>a.detachment.localeCompare(b.detachment)||a.title.localeCompare(b.title));
  const detachmentTitles=new Map((config.enhancements?.detachments||[]).map(title=>[key(title),title]));
  points.detachments=(official.detachments||[]).map(item=>({...item,title:detachmentTitles.get(key(item.title))||item.title,forceDisposition:item.forceDisposition?.replace(/\b(?:And|The)\b/g,word=>word.toLowerCase())}));
  points.source={...sourceMeta,officialMfm:{version:official.version,url:official.url,verifiedAt:official.verifiedAt}};
  points.audit.enhancements=points.enhancements.length;
}

const outputPath=value=>candidateDir?path.join(candidateDir,path.basename(resolvePath(value))):resolvePath(value);
const normalizeEol=value=>value.replace(/\r\n/g,'\n');
const outputs=[
  [outputPath(config.outputs.snapshot),json(snapshot)],
  [outputPath(config.outputs.datasheets),json(datasheets)],
  [outputPath(config.outputs.points),json(points)]
];
for(const [file,content] of outputs){
  if(check){
    if(!fs.existsSync(file)||normalizeEol(fs.readFileSync(file,'utf8'))!==content)throw new Error(`${path.basename(file)} is stale; rerun extractor`);
  }else{
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,content);
  }
}
console.log(`${check?'Checked':'Extracted'} ${datasheets.audit.datasheets} codex, ${datasheets.audit.imperialArmour} Imperial Armour, ${datasheets.audit.legends} Legends datasheets and ${enhancements.length} Enhancements`);
