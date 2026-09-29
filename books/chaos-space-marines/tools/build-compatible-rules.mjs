import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ruleFacts from '../../shared/rule-facts.js';
import {bindRowsToCanonicalIds} from '../../shared/tools/canonical-join-contract.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const stable=value=>`${JSON.stringify(value,null,2)}\n`;
const titleKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const keyword=value=>ruleFacts.normalizeKeyword(value);
const coreContracts=[
  ['core-stratagem-command-re-roll',{}],
  ['core-stratagem-epic-challenge',{allKeywords:['CHARACTER']}],
  ['core-stratagem-insane-bravery',{}],
  ['core-stratagem-explosives',{allKeywords:['GRENADES']}],
  ['core-stratagem-crushing-impact',{anyKeywords:['MONSTER','VEHICLE']}],
  ['core-stratagem-rapid-ingress',{}],
  ['core-stratagem-fire-overwatch',{}],
  ['core-stratagem-smokescreen',{allKeywords:['SMOKE']}],
  ['core-stratagem-heroic-intervention',{}],
  ['core-stratagem-counteroffensive',{}]
];

function matches(selector,unit,grants=[]){
  const allowed=new Set(['unitIds','allKeywords','anyKeywords','noneKeywords','alternatives']);
  if(Object.keys(selector||{}).some(key=>!allowed.has(key)))throw new Error(`Unsupported selector for ${unit.id}`);
  const keywords=new Set((unit.keywords||[]).map(keyword));
  for(const grant of grants)if(grant.keyword&&matches(grant.selector,unit))keywords.add(keyword(grant.keyword));
  const test=value=>{
    if((value.unitIds||[]).length&&!value.unitIds.includes(unit.id))return false;
    if((value.allKeywords||[]).some(item=>!keywords.has(keyword(item))))return false;
    if((value.anyKeywords||[]).length&&!value.anyKeywords.some(item=>keywords.has(keyword(item))))return false;
    if((value.noneKeywords||[]).some(item=>keywords.has(keyword(item))))return false;
    return !(value.alternatives||[]).length||value.alternatives.some(test);
  };
  return test(selector||{});
}

function target(contract){
  const roles=contract?.roles||[],role=roles.find(item=>item.side==='friendly'&&item.subject==='unit');
  if(!role||roles.length!==1)throw new Error('Compatible rule must declare exactly one friendly unit target.');
  return role.selector||{};
}

export function inputs(){return{config:read('book.config.json'),pack:read('content/chaos-space-marines-faction-pack.en.json'),codex:read('content/chaos-space-marines-codex-datasheets.en.json'),points:read('content/chaos-space-marines-points.en.json'),contracts:read('content/chaos-space-marines-related-rules.en.json')}};

export function buildCompatibleRules({config,pack,codex,points,contracts}){
  const units=codex.datasheets,rows=new Map(units.map(unit=>[unit.id,new Map()]));
  if(units.length!==54)throw new Error(`Expected 54 current Datasheets, got ${units.length}`);
  const pointEnhancements=new Map();for(const item of points.enhancements){const owner=bindRowsToCanonicalIds([{title:item.detachment}],pack.detachments,{label:`CSM points Enhancement ${item.id} Detachment`})[0],key=`${owner.canonicalId}\0${item.id}`;if(pointEnhancements.has(key))throw new Error(`Duplicate CSM points Enhancement identity ${key}`);pointEnhancements.set(key,item);}
  const add=(unitId,row)=>rows.get(unitId).set(row.ruleId,row);
  for(const detachment of pack.detachments){
    const grants=contracts.keywordGrants?.[detachment.id]||[];
    for(const item of detachment.stratagems){
      const contract=contracts.stratagems[item.id];if(!contract)throw new Error(`Missing Stratagem contract ${item.id}`);
      for(const unit of units)if(matches(target(contract),unit,grants)){const conditions=contract.conditions?.length?['battle-state-unknown']:[];add(unit.id,{ruleId:item.id,kind:'stratagem',detachmentId:detachment.id,state:conditions.length?'conditional':'match',...(conditions.length?{condition:conditions[0],conditions}:{})});}
    }
    for(const item of detachment.enhancements){
      const contract=contracts.enhancements[item.id];if(!contract)throw new Error(`Missing Enhancement contract ${item.id}`);
      const raw=String(item.id).replace(/^enhancement-/,''),suffix=raw.startsWith(`${detachment.id}-`)?raw.slice(detachment.id.length+1):raw,declared=config.compatibleRulesEnhancementAliases?.[`${detachment.id}|${item.id}`],candidateIds=[item.id,`enhancement-${raw}`,`enhancement-${suffix}`,`enhancement-${detachment.id}-${suffix}`,declared].filter(Boolean),candidates=candidateIds.map(id=>pointEnhancements.get(`${detachment.id}\0${id}`)).filter(Boolean),current=[...new Set(candidates)][0];if(new Set(candidates).size!==1||!current?.id)throw new Error(`Missing or ambiguous detachment-qualified Enhancement identity ${detachment.id}: ${item.id}`);
      for(const unit of units)if(matches(target(contract),unit,grants))add(unit.id,{ruleId:current.id,kind:'enhancement',detachmentId:detachment.id,state:'match'});
    }
  }
  for(const unit of units)for(const [ruleId,selector] of coreContracts)if(matches(selector,unit))add(unit.id,{ruleId,kind:'stratagem',scope:'core',state:'conditional',condition:'battle-state-unknown',conditions:['battle-state-unknown']});
  return{schema:'chaos-space-marines-compatible-rules/v1',units:Object.fromEntries([...rows].sort(([a],[b])=>a.localeCompare(b,'en')).map(([unitId,rules])=>[unitId,[...rules.values()].sort((a,b)=>`${a.scope||a.detachmentId}|${a.kind}|${a.ruleId}`.localeCompare(`${b.scope||b.detachmentId}|${b.kind}|${b.ruleId}`,'en'))]))};
}

function main(){const value=stable(buildCompatibleRules(inputs())),file=path.join(root,'generated','compatible-rules.json');if(process.argv.includes('--check')){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n')!==value)throw new Error('Chaos Space Marines compatible-rules matrix is stale.');console.log('Chaos Space Marines compatible-rules matrix is current.');return;}fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value);console.log('Chaos Space Marines compatible-rules matrix built.');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main();
