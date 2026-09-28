import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {beginLegacyCaptureTool,captureFetchText} from '../../shared/tools/source-ingestion-contract.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const output=file=>path.join(root,file);
const sourceUrl='https://wahapedia.ru/wh40k11ed/factions/t-au-empire/';
const decode=value=>String(value??'').replace(/&nbsp;/gi,' ').replace(/&(?:apos|#39|rsquo|lsquo);/gi,"'").replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const key=value=>decode(value).normalize('NFKC').toLowerCase().replace(/[’‘']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const unique=values=>[...new Set(values)].sort((a,b)=>a.localeCompare(b,'en'));
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(name=>[name,ordered(value[name])])):value;
export const stable=value=>`${JSON.stringify(ordered(value),null,2)}\n`;
const coreByName=new Map(Object.entries({
  'COMMAND RE-ROLL':'core-stratagem-command-re-roll','EPIC CHALLENGE':'core-stratagem-epic-challenge','INSANE BRAVERY':'core-stratagem-insane-bravery','EXPLOSIVES':'core-stratagem-explosives','CRUSHING IMPACT':'core-stratagem-crushing-impact','RAPID INGRESS':'core-stratagem-rapid-ingress','FIRE OVERWATCH':'core-stratagem-fire-overwatch','SMOKESCREEN':'core-stratagem-smokescreen','HEROIC INTERVENTION':'core-stratagem-heroic-intervention','COUNTEROFFENSIVE':'core-stratagem-counteroffensive','COUNTER-OFFENSIVE':'core-stratagem-counteroffensive'
}).map(([name,id])=>[key(name),id]));
const factionAliases=new Map();

function endOfDiv(html,start){const tags=/<\/?div\b[^>]*>/gi;tags.lastIndex=start;let depth=0;for(let match;(match=tags.exec(html));){depth+=match[0][1]==='/'?-1:1;if(depth===0)return tags.lastIndex;}return -1;}
export function parseRules(html){
  const header=/<div class="dsHeader[^\"]*">STRATAGEMS<\/div>/i.exec(html),start=header?.index??-1,left=start<0?-1:html.lastIndexOf('<div class="dsLeft',start),end=left<0?-1:endOfDiv(html,left);
  if(start<0||end<0)return null;
  const result={faction:[],core:[],boarding:[]};
  for(const match of html.slice(start,end).matchAll(/<div class="([^"]*\bs10Wrap\b[^"]*)"[^>]*>[\s\S]*?<div class="s10Name">([\s\S]*?)<\/div>/gi)){
    const classes=match[1].split(/\s+/),name=decode(match[2]);
    if(classes.includes('sShowBoardingActions'))result.boarding.push(name);else if(classes.includes('sShowCoreStratagemsNonBA'))result.core.push(name);else result.faction.push(name);
  }
  return Object.fromEntries(Object.entries(result).map(([name,values])=>[name,unique(values)]));
}
export function inventory(){
  const codex=read('content/tau-empire-codex-datasheets.en.json'),pack=read('content/tau-empire-faction-pack.en.json'),parity=read('content/tau-empire-codex-parity.en.json');
  const units=[...(codex.datasheets||[]),...(codex.imperialArmour||[])].map(unit=>({unitId:unit.id,name:unit.title}));
  const detachments=[...pack.detachments,...parity.detachments],rules=detachments.flatMap(detachment=>detachment.stratagems.map(rule=>({ruleId:rule.id,name:rule.title})));
  const index=items=>items.reduce((map,item)=>{const name=key(item.name);map.set(name,[...(map.get(name)||[]),item]);return map;},new Map());
  return {units:units.sort((a,b)=>a.unitId.localeCompare(b.unitId)),rules:rules.sort((a,b)=>a.ruleId.localeCompare(b.ruleId)),unitByName:index(units),ruleByName:index(rules)};
}
export function buildImport({pages,retrievedAt}){
  const source=inventory(),unresolved={ambiguous:[],duplicates:[],parse:[],unknown:[]},units={},coreUnits={},seenRules=new Set(),seenCore=new Set(),boarding=new Set();
  for(const [name,items] of source.unitByName)if(items.length>1)unresolved.duplicates.push({kind:'datasheet',name,candidates:items.map(item=>item.unitId)});
  for(const [name,items] of source.ruleByName)if(items.length>1)unresolved.duplicates.push({kind:'stratagem',name,candidates:items.map(item=>item.ruleId)});
  for(const unit of source.units){
    const parsed=parseRules(pages.get(unit.unitId)||'');
    if(!parsed){unresolved.parse.push({unitId:unit.unitId,reason:'missing Stratagems block'});units[unit.unitId]=[];coreUnits[unit.unitId]=[];continue;}
    parsed.boarding.forEach(name=>boarding.add(name));
    units[unit.unitId]=unique(parsed.faction.flatMap(name=>{const sourceKey=key(name),matches=source.ruleByName.get(factionAliases.get(sourceKey)||sourceKey)||[];if(matches.length===1){seenRules.add(matches[0].ruleId);return[matches[0].ruleId];}unresolved[matches.length?'ambiguous':'unknown'].push({kind:'faction-stratagem',unitId:unit.unitId,name,candidates:matches.map(item=>item.ruleId)});return[];}));
    coreUnits[unit.unitId]=unique(parsed.core.flatMap(name=>{const id=coreByName.get(key(name));if(id){seenCore.add(id);return[id];}unresolved.unknown.push({kind:'core-stratagem',unitId:unit.unitId,name});return[];}));
  }
  const sourceMeta={edition:'11',faction:"T'au Empire",kind:'Wahapedia',url:sourceUrl};
  const summary={datasheets:{canonical:source.units.length,imported:Object.keys(units).length},factionStratagems:{canonical:source.rules.length,observed:seenRules.size},coreStratagems:{canonical:10,observed:seenCore.size},associations:{faction:Object.values(units).flat().length,core:Object.values(coreUnits).flat().length},boardingActionNamesIgnored:boarding.size,unresolved:Object.values(unresolved).flat().length};
  return {snapshot:{schema:'wahapedia-compatible-rules-snapshot/v1',retrievedAt,source:sourceMeta,units,coreUnits},report:{schema:'compatible-rules-import-report/v1',retrievedAt,source:sourceMeta,summary,aliasesApplied:[],boardingActionsIgnored:unique(boarding),unresolved}};
}
async function main(){
  const {mode,session}=beginLegacyCaptureTool({argv:process.argv.slice(2),toolName:'import-wahapedia-compatible-rules.mjs',sourceId:'tau-compatible-rules-live',authority:'secondary',sourceType:'wahapedia-html',extractorPath:'books/tau-empire/tools/import-wahapedia-compatible-rules.mjs',localInputs:[
    {path:'books/tau-empire/content/tau-empire-codex-datasheets.en.json',kind:'canonical-source-input',owner:"T'au codex datasheets"},
    {path:'books/tau-empire/content/tau-empire-faction-pack.en.json',kind:'canonical-source-input',owner:"T'au Faction Pack"},
    {path:'books/tau-empire/content/tau-empire-codex-parity.en.json',kind:'canonical-source-input',owner:"T'au codex parity"}
  ]});
  if(mode.kind==='verify'){
    const snapshot=read('sources/wahapedia-compatible-rules.snapshot.json'),report=read('reports/compatible-rules-import-report.json'),summary=report.summary;
    if(stable(snapshot)!==fs.readFileSync(output('sources/wahapedia-compatible-rules.snapshot.json'),'utf8').replace(/\r\n?/g,'\n')||stable(report)!==fs.readFileSync(output('reports/compatible-rules-import-report.json'),'utf8').replace(/\r\n?/g,'\n'))throw new Error("T'au compatible-rules import artifacts are not deterministic.");
    if(Object.keys(snapshot.units||{}).length!==43||Object.keys(snapshot.coreUnits||{}).length!==43||summary.datasheets.imported!==43||summary.associations.faction!==541||summary.associations.core!==290||summary.unresolved!==0)throw new Error("T'au compatible-rules import inventory mismatch.");
    console.log("T'au Wahapedia snapshot is current: 43 current datasheets, 541 faction + 290 Core associations.");return;
  }
  const at=process.argv.indexOf('--retrieved-at'),retrievedAt=process.argv[at+1];if(!/^\d{4}-\d{2}-\d{2}$/.test(retrievedAt||''))throw new Error('Pass --retrieved-at YYYY-MM-DD.');
  const headers={'user-agent':'warhammer-rules-compatible-rules-importer/1.0'};
  const source=inventory(),index=await captureFetchText(session,sourceUrl,{name:'tau-empire-index',headers}),urls=new Map();
  for(const match of index.matchAll(/href="\/wh40k11ed\/factions\/t-au-empire\/([^"#?]+)"/gi)){const units=source.unitByName.get(key(decodeURIComponent(match[1]).replaceAll('-',' ')))||[];if(units.length===1&&!urls.has(units[0].unitId))urls.set(units[0].unitId,`${sourceUrl}${match[1]}`);}
  const missing=source.units.filter(unit=>!urls.has(unit.unitId));if(missing.length)throw new Error(`Missing Wahapedia URLs: ${missing.map(unit=>unit.unitId).join(', ')}`);
  const pages=new Map(await Promise.all(source.units.map(async unit=>[unit.unitId,await captureFetchText(session,urls.get(unit.unitId),{name:unit.unitId,headers})]))),result=buildImport({pages,retrievedAt});
  session.writeCandidate('books/tau-empire/reports/compatible-rules-import-report.json',stable(result.report));
  if(result.report.summary.unresolved)throw new Error(`Unresolved import rows: ${result.report.summary.unresolved}`);
  session.writeCandidate('books/tau-empire/sources/wahapedia-compatible-rules.snapshot.json',stable(result.snapshot));
  session.finalize();
  console.log(`Imported ${result.report.summary.datasheets.imported} T'au datasheets: ${result.report.summary.associations.faction} faction + ${result.report.summary.associations.core} Core associations.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
