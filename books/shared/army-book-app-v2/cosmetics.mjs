/** Display-only formatting. Accepted fields and roster state stay untouched. */
const importCopy=new Map([
  ['Source and physical import limitations','Import limitations'],
  ['Gameplay and points limitations','Rules and points'],
  ['Chapter context and keyword grants','Dark Angels keywords'],
  ['Source and import limitations','Import limitations'],
  ['Two weapon mappings remain NOT_PROVEN: Chainsword / Astartes Chainsword and Bolt Rifle Fire / Focused or Saturation profiles.',
    'Two weapons cannot be told apart from the export: Chainsword vs Astartes Chainsword, and the Bolt Rifle firing modes (Focused Fire or Saturation).'],
  ['Ambiguous selections are rejected without replacing the saved roster.',
    'If your list needs one of them, the import stops and your saved roster is kept.'],
  ['An authentic Blood Angels New Recruit export has not been verified.',
    'This importer has not yet been checked against a real Blood Angels export.'],
  ['Black Rage retains its source OR and unknown positional context.',
    'Black Rage can apply when any one of its listed conditions is met. The app cannot check battlefield positions.'],
  ['Legacy of the Angel requires BLOOD ANGELS and CHARACTER; general Space Marines units do not gain BLOOD ANGELS automatically.',
    'Legacy of the Angel only applies to a BLOOD ANGELS CHARACTER. General Space Marines units do not automatically count as BLOOD ANGELS.'],
  ['Stormlance remains a source conflict.','Check Stormlance against your rules, as the available references disagree.'],
  ['Ten MFM reference-only relations remain inactive.',''],
  ['Unsupported mechanics retain full text; paid equipment requires an exact physical selection, otherwise points are unresolved.',
    'Some rules are shown in full but are not applied automatically. To calculate paid equipment costs, the app needs to know exactly what was selected, how many, and who has it; otherwise the points total stays unresolved.'],
  ['A roster containing only general Space Marines units has unconfirmed Dark Angels army context. DEATHWING and RAVENWING grants remain inactive until a source-confirmed Dark Angels unit and validated roster membership establish that context. Opening this book, a Detachment or an attachment does not establish Chapter context.',
    'A list made only of general Space Marines units does not tell the app that it is a Dark Angels army. A confirmed Dark Angels unit must be in the roster, and the units receiving DEATHWING or RAVENWING must belong to that army. Opening the book, choosing a Detachment or attaching units is not enough.'],
  ['This importer has constructed-input coverage; an authentic Dark Angels New Recruit export has not been verified.',
    'This importer has been tested with sample lists, but has not yet been checked against a real Dark Angels export.']
]);
export function playerImportCopy(value){
  let text=String(value??'');
  for(const [before,after]of importCopy)text=text.replaceAll(before,after);
  return text.replace(/ {2,}/g,' ').trim();
}
export function warlordDisplay(unit,state){
  if(unit.warlord===true||typeof state?.warlordInstanceId==='string'&&state.warlordInstanceId===unit.instanceId)return 'Yes';
  return state?.warlordInstanceId||state?.units?.some(item=>item.warlord===true)?'No':'Not set';
}
/** Remove a heading only when the card already supplies that exact heading.
 * Other bullets and every remaining character keep their source meaning. */
export function enhancementTextParts(title,value){
  if(typeof value!=='string')return {body:value,restriction:null,upgrade:false};
  const lines=value.split('\n'),first=lines[0].trim();
  const duplicate=first==='- '+title||first==='- '+title+'UPGRADE'||first==='- '+title+' UPGRADE';
  if(!duplicate)return {body:value,restriction:null,upgrade:false};
  const upgrade=duplicate&&first!=='- '+title;
  let body=duplicate?lines.slice(1).join('\n'):value;
  const restriction=body.match(/^(?=[^\n.]*\b(?:model|unit)\b)([^\n.]+\bonly(?:\s*\([^\n.]*\))?\.)\s*/);
  if(restriction)body=body.slice(restriction[0].length);
  return {body,restriction:restriction?.[1]||null,upgrade};
}
/** A source-bound named block outranks a generic datasheet section caption.
 * Ambiguous or unheaded fields keep their existing caption, never a guess. */
export function sourceRuleCaption(origin,cards){
  const id=origin.canonicalRuleId??origin.ruleId,card=cards.get(id),fallback=origin.label??card?.title??id;
  if(card?.kind!=='DATASHEET_SECTION'||!['ABILITIES','WARGEAR ABILITIES'].includes(card.title))return fallback;
  const names=new Set();
  for(const path of origin.sourceFields||[]){
    const pointer='/'+path.map(key=>String(key).replaceAll('~','~0').replaceAll('/','~1')).join('/');
    const fields=card.fields.filter(field=>field.source?.path===pointer||field.presentationPath===pointer);
    if(fields.length!==1||typeof fields[0].value!=='string')return fallback;
    const match=fields[0].value.match(/^([^:\n]+):\s*\S/);
    if(!match)return fallback;
    names.add(match[1]);
  }
  return names.size===1?[...names][0]:fallback;
}
