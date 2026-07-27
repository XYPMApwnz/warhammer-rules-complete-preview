const STORAGE_KEY='wh40k-rosters-v1';
const CORRUPT_BACKUP_KEY='wh40k-rosters-v1-corrupt-backup';
const KNOWN_FACTIONS=new Set(['death guard','adeptus mechanicus']);
const FACTION_LABELS=Object.freeze({'death guard':'Death Guard','adeptus mechanicus':'Adeptus Mechanicus'});
const FACTION_READERS=Object.freeze({'death guard':'../books/death-guard/reader.html'});
const savedHost=document.querySelector('#saved-roster-list');

function normalizeFaction(value){return String(value||'').replace(/^(?:Chaos|Imperium)\s*[-–—]\s*/i,'').replace(/\s+/g,' ').trim().toLowerCase();}
function knownFaction(value){const key=normalizeFaction(value);return KNOWN_FACTIONS.has(key)?key:'';}
function getSavedRosters(){
  try{const records=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(records)?records:[];}
  catch{return [];}
}
function putSavedRosters(records){
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw!==null){
    try{if(!Array.isArray(JSON.parse(raw)))throw new Error();}
    catch{if(localStorage.getItem(CORRUPT_BACKUP_KEY)===null)localStorage.setItem(CORRUPT_BACKUP_KEY,raw);}
  }
  localStorage.setItem(STORAGE_KEY,JSON.stringify(records));
}
function isDisplayable(record){return Boolean(record?.id&&record?.name&&Array.isArray(record?.roster?.units));}
function isImportableRecord(record){
  return Boolean(
    typeof record?.id==='string'&&record.id.trim()&&
    typeof record?.name==='string'&&record.name.trim()&&
    typeof record?.sourceText==='string'&&
    knownFaction(record?.roster?.faction)&&
    Array.isArray(record.roster.units)&&record.roster.units.length&&
    record.roster.units.every(unit=>unit&&typeof unit.name==='string'&&Number.isFinite(unit.points)&&
      (unit.models===undefined||Array.isArray(unit.models))&&
      (unit.models||[]).every(model=>model&&typeof model.name==='string'&&(model.loadouts===undefined||Array.isArray(model.loadouts))))&&
    (record.roster.detachments===undefined||Array.isArray(record.roster.detachments))
  );
}
function escapeHtml(value){const node=document.createElement('span');node.textContent=String(value??'');return node.innerHTML;}
function rosterId(text){let hash=2166136261;for(const char of text)hash=Math.imul(hash^char.charCodeAt(0),16777619);return `roster-${(hash>>>0).toString(36)}`;}
function recordDetachments(record){const items=Array.isArray(record.roster.detachments)?record.roster.detachments:[{label:record.roster.detachment}];return items.map(item=>item?.label).filter(Boolean).join(' + ');}
function updatedLabel(value){const date=new Date(value);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat('en-GB').format(date):'date unknown';}
function readerAction(record){const id=escapeHtml(record.id),faction=knownFaction(record?.roster?.faction);return faction&&FACTION_READERS[faction]?`<button class="action primary" type="button" data-open-roster="${id}">Open</button>`:'<button class="action" type="button" disabled>Reader unavailable</button>';}

function saveRoster(roster,sourceText){
  const records=getSavedRosters(),id=rosterId(sourceText),previous=records.find(record=>record?.id===id);
  const record={id,name:`${roster.faction} · ${roster.declared||roster.calculated} pts`,createdAt:previous?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),sourceText,roster};
  putSavedRosters([record,...records.filter(item=>item?.id!==id)]);
  navigator.storage?.persist?.();
  renderSavedRosters();
  return record;
}

function openSavedRoster(id){
  const record=getSavedRosters().find(item=>item?.id===id);
  if(!record){alert('Saved roster not found.');return;}
  const faction=knownFaction(record.roster?.faction);
  if(!faction){alert('The saved roster faction is not recognised. The record was not changed.');return;}
  const reader=FACTION_READERS[faction];
  if(!reader){alert(`${FACTION_LABELS[faction]} was saved, but a personal reader is not available yet.`);return;}
  location.href=`${reader}?roster=${encodeURIComponent(id)}`;
}

function exportRoster(id){
  const record=getSavedRosters().find(item=>item?.id===id);
  if(!record)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`${record.id}.json`;link.click();URL.revokeObjectURL(url);
}

function renderSavedRosters(){
  const records=getSavedRosters().filter(isDisplayable);
  if(!records.length){savedHost.innerHTML='<div class="empty">No saved rosters yet. Create a guide below or import a backup.</div>';return;}
  savedHost.innerHTML=`<div class="saved-grid">${records.map(record=>`<article class="saved-card"><p class="eyebrow">${escapeHtml(recordDetachments(record))}</p><h3>${escapeHtml(record.name)}</h3><p>${record.roster.units.length} units · updated ${updatedLabel(record.updatedAt)}</p><div class="actions">${readerAction(record)}<button class="action" type="button" data-export-roster="${escapeHtml(record.id)}">Export</button><button class="action" type="button" data-delete-roster="${escapeHtml(record.id)}">Delete</button></div></article>`).join('')}</div>`;
}

function parseRoster(text){
  const lines=text.replace(/\u00a0/g,' ').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  const values=key=>lines.filter(line=>line.toUpperCase().startsWith(`+ ${key}:`)).map(line=>line.split(':').slice(1).join(':').trim()).filter(Boolean);
  const value=key=>values(key)[0]||'—';
  const splitList=items=>items.flatMap(item=>{const parts=[];let depth=0,start=0;for(let index=0;index<item.length;index+=1){if(item[index]==='(')depth+=1;if(item[index]===')')depth=Math.max(0,depth-1);if(item[index]===','&&depth===0){parts.push(item.slice(start,index).trim());start=index+1;}}parts.push(item.slice(start).trim());return parts.filter(Boolean);});
  const units=[];let currentUnit=null,currentModel=null;
  for(const line of lines){
    if(line.startsWith('•')){const model=line.match(/^•\s*(\d+)x\s+([^:]+)(?::\s*(.*))?$/);currentModel=model&&currentUnit?{quantity:Number(model[1]),name:model[2],wargear:model[3]||'',loadouts:[]}:null;if(currentModel)currentUnit.models.push(currentModel);continue;}
    const loadout=line.match(/^(\d+)\s+with\s+(.+)$/i);if(loadout&&currentModel){currentModel.loadouts.push({quantity:Number(loadout[1]),wargear:loadout[2]});continue;}
    if(/^[+\-]/.test(line))continue;
    const match=line.match(/^(?:Char\d+:\s*)?(\d+)x\s+(.+?)\s+\((\d+)\s*pts?\)(?::\s*(.*))?$/i);if(!match)continue;
    currentUnit={quantity:Number(match[1]),name:match[2],points:Number(match[3]),wargear:match[4]||'',models:[]};currentModel=null;units.push(currentUnit);
  }
  const declared=Number(value('TOTAL ARMY POINTS').match(/\d+/)?.[0]||0),calculated=units.reduce((total,unit)=>total+unit.points,0),dispositions=splitList(values('FORCE DISPOSITION'));
  const detachments=splitList(values('DETACHMENT')).map((label,index)=>({label,name:label.replace(/\s*\([^)]*\)\s*$/,''),rule:label.match(/\(([^)]*)\)/)?.[1]||'',disposition:dispositions[index]||dispositions[0]||'—'}));
  const factionValue=values('FACTION KEYWORD')[0]||'',factionKey=knownFaction(factionValue),faction=FACTION_LABELS[factionKey]||factionValue;
  return{faction,detachment:detachments[0]?.label||'—',detachments,disposition:dispositions[0]||'—',enhancements:values('ENHANCEMENT'),enhancement:value('ENHANCEMENT'),declared,calculated,units};
}

function renderRoster(roster,record){
  const grouped=new Map();for(const unit of roster.units){const entry=grouped.get(unit.name)||{...unit,copies:0,total:0};entry.copies+=1;entry.total+=unit.points;grouped.set(unit.name,entry);}
  const matches=roster.declared===roster.calculated;
  const hasReader=Boolean(FACTION_READERS[knownFaction(roster.faction)]);
  document.querySelector('#roster-result').innerHTML=`<p class="eyebrow">Preview // ${roster.units.length} units</p><h2>${escapeHtml(roster.faction)}</h2><p class="help">${escapeHtml((roster.detachments||[{label:roster.detachment}]).map(item=>item.label).join(' + '))} · ${escapeHtml(roster.disposition)}</p><div class="summary"><div class="stat"><small>Declared in export</small><strong>${roster.declared||'—'} pts</strong></div><div class="stat"><small>Item total</small><strong>${roster.calculated} pts</strong></div></div><div class="status ${matches?'':'warn'}">${matches?'✓ The item total matches the exported total.':'! The item total does not match the exported total.'}<br>Current points and roster legality were not checked.</div><ul class="units">${[...grouped.values()].map(unit=>`<li><strong>${escapeHtml(unit.name)}${unit.copies>1?` ×${unit.copies}`:''}</strong><span>${unit.total} pts</span></li>`).join('')}</ul><div class="actions">${hasReader?'<button class="action primary" id="open-guide" type="button">Open personal guide</button>':'<p class="help">Saved. A personal reader is not available for this faction yet.</p>'}</div>`;
  if(!hasReader)return;
  document.querySelector('#open-guide').addEventListener('click',()=>openSavedRoster(record.id));
}

document.querySelector('#roster-form').addEventListener('submit',event=>{
  event.preventDefault();const input=document.querySelector('#roster-input'),roster=parseRoster(input.value);
  if(!roster.units.length){document.querySelector('#roster-result').innerHTML='<p class="eyebrow">Import error</p><h2>No units found</h2><p class="help">Paste a New Recruit export containing entries such as “1x Unit (100 pts)”.</p>';return;}
  const faction=knownFaction(roster.faction);
  if(!faction){document.querySelector('#roster-result').innerHTML=roster.faction?`<p class="eyebrow">Unknown faction</p><h2>${escapeHtml(roster.faction)}</h2><p class="help">This faction is not recognised. The roster was not saved.</p>`:'<p class="eyebrow">Import error</p><h2>Faction not found</h2><p class="help">The export has no FACTION KEYWORD line. The roster was not saved.</p>';return;}
  roster.faction=FACTION_LABELS[faction];
  const record=saveRoster(roster,input.value);renderRoster(roster,record);
});
document.querySelector('#roster-clear').addEventListener('click',()=>{document.querySelector('#roster-form').reset();document.querySelector('#roster-result').innerHTML='<p class="eyebrow">Preview</p><h2>No roster loaded</h2><p class="help">The faction, Detachment, export total check and recognised units will appear here.</p>';document.querySelector('#roster-input').focus();});
savedHost.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.openRoster)openSavedRoster(button.dataset.openRoster);if(button.dataset.exportRoster)exportRoster(button.dataset.exportRoster);if(button.dataset.deleteRoster&&confirm('Delete this roster from this device?')){putSavedRosters(getSavedRosters().filter(record=>record?.id!==button.dataset.deleteRoster));renderSavedRosters();}});
document.querySelector('#import-roster').addEventListener('click',()=>document.querySelector('#import-roster-file').click());
document.querySelector('#import-roster-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{const record=JSON.parse(await file.text());if(!isImportableRecord(record))throw new Error();const faction=knownFaction(record.roster.faction),records=getSavedRosters();record.roster.faction=FACTION_LABELS[faction];putSavedRosters([{...record,updatedAt:new Date().toISOString()},...records.filter(item=>item?.id!==record.id)]);renderSavedRosters();if(!FACTION_READERS[faction])alert(`${FACTION_LABELS[faction]} was imported, but a personal reader is not available yet.`);}catch{alert('Could not import the roster backup.');}event.target.value='';});

renderSavedRosters();
const requestedRoster=new URLSearchParams(location.search).get('roster');
if(requestedRoster)openSavedRoster(requestedRoster);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('../service-worker.js'));
