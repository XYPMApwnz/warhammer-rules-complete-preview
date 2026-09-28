import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ruleFacts from '../../shared/rule-facts.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const stable=value=>`${JSON.stringify(value,null,2)}\n`;
const pair=(unitId,ruleId)=>`${unitId}|${ruleId}`;
const conditionNames={attachment:'attachment-unknown','second-unit':'second-unit-unknown',detachment:'detachment-not-selected',warlord:'warlord-unknown','second-character':'second-character-unknown','battle-state':'battle-state-unknown'};

function ownerMatches(owner,unit){
  if(!['model','unit'].includes(owner?.subject))throw new Error(`Unsupported Enhancement owner subject: ${owner?.subject}`);
  const selector=owner.selector||{},allowed=new Set(['unitIds','allKeywords','anyKeywords','noneKeywords']);
  if(Object.keys(selector).some(key=>!allowed.has(key)))throw new Error('Unsupported Enhancement owner selector.');
  const keywords=new Set((unit.keywords||[]).map(ruleFacts.normalizeKeyword));
  if((selector.unitIds||[]).length&&!selector.unitIds.includes(unit.id))return false;
  if((selector.allKeywords||[]).some(keyword=>!keywords.has(ruleFacts.normalizeKeyword(keyword))))return false;
  if((selector.anyKeywords||[]).length&&!selector.anyKeywords.some(keyword=>keywords.has(ruleFacts.normalizeKeyword(keyword))))return false;
  return !(selector.noneKeywords||[]).some(keyword=>keywords.has(ruleFacts.normalizeKeyword(keyword)));
}

export function inputs(){
  const pack=read('content/tau-empire-faction-pack.en.json'),parity=read('content/tau-empire-codex-parity.en.json'),codex=read('content/tau-empire-codex-datasheets.en.json');
  return {pack,parity,datasheets:[...(codex.datasheets||[]),...(codex.imperialArmour||[])],contracts:read('content/tau-empire-related-rules.en.json'),snapshot:read('sources/wahapedia-compatible-rules.snapshot.json'),ledger:read('sources/compatible-rules-correction-ledger.json')};
}

export function buildCompatibleRules({pack,parity,datasheets,contracts,snapshot,ledger}){
  const detachments=[...parity.detachments,...pack.detachments],detachmentByRule=new Map(detachments.flatMap(detachment=>[...detachment.stratagems,...detachment.enhancements].map(rule=>[rule.id,detachment.id]))),rows=new Map(datasheets.map(unit=>[unit.id,new Map()]));
  const corrections=new Map();
  for(const entry of ledger.entries)for(const unitId of entry.unitIds)for(const ruleId of entry.ruleIds){const id=pair(unitId,ruleId);if(corrections.has(id))throw new Error(`Duplicate correction ${id}`);corrections.set(id,entry);}
  const add=(unitId,ruleId,entry={},scope)=>{
    if(!rows.has(unitId))throw new Error(`Unknown Codex unit ${unitId}`);
    if(entry.decision==='reject'||entry.decision==='unresolved')return;
    const conditions=entry.decision==='conditional'?[entry.conditionKind,...(entry.additionalConditions||[])].map(kind=>conditionNames[kind]):[];
    if(conditions.some(value=>!value))throw new Error(`Unknown condition ${unitId}|${ruleId}`);
    const row={ruleId};if(scope==='core')row.scope='core';else{row.detachmentId=detachmentByRule.get(ruleId);if(!row.detachmentId)throw new Error(`Missing Detachment for ${ruleId}`);}
    row.state=conditions.length?'conditional':'match';if(conditions.length){row.condition=conditions[0];row.conditions=conditions;}
    rows.get(unitId).set(ruleId,row);
  };
  for(const [unitId,ruleIds] of Object.entries(snapshot.units))for(const ruleId of ruleIds)add(unitId,ruleId,corrections.get(pair(unitId,ruleId))||{},null);
  for(const [unitId,ruleIds] of Object.entries(snapshot.coreUnits))for(const ruleId of ruleIds)add(unitId,ruleId,corrections.get(pair(unitId,ruleId))||{},'core');
  for(const [id,entry] of corrections)if(entry.side==='matcher-only'&&!['reject','unresolved'].includes(entry.decision)){const [unitId,ruleId]=id.split('|');add(unitId,ruleId,entry,entry.scope==='core'?'core':null);}
  for(const detachment of detachments)for(const enhancement of detachment.enhancements){
    const ruleId=enhancement.id,contract=contracts.enhancements[ruleId]||contracts.enhancements[ruleId.replace(/^enhancement-/,'')];if(!contract?.owner)throw new Error(`Missing owner contract ${ruleId}`);
    for(const unit of datasheets)if(ownerMatches(contract.owner,unit))rows.get(unit.id).set(ruleId,{ruleId,kind:'enhancement',detachmentId:detachment.id,state:'match'});
  }
  return {schema:'tau-empire-compatible-rules/v1',units:Object.fromEntries([...rows].sort(([a],[b])=>a.localeCompare(b,'en')).map(([unitId,rules])=>[unitId,[...rules.values()].sort((a,b)=>a.ruleId.localeCompare(b.ruleId,'en'))]))};
}

function main(){const value=stable(buildCompatibleRules(inputs())),file=path.join(root,'generated','compatible-rules.json');if(process.argv.includes('--check')){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n')!==value)throw new Error("T'au compatible-rules matrix is stale.");console.log("T'au compatible-rules matrix is current.");return;}fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value);}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main();
