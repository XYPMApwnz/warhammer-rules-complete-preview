const STORAGE_KEY='wh40k-rosters-v1';
const CORRUPT_BACKUP_KEY='wh40k-rosters-v1-corrupt-backup';
const KNOWN_FACTIONS=new Set(['death guard','adeptus mechanicus','tyranids','t au empire','emperor s children','chaos space marines','space marines','blood angels','dark angels']);
const FACTION_ALIASES=Object.freeze({'tau empire':'t au empire'});
const FACTION_PARENTS=Object.freeze({'death guard':'chaos','adeptus mechanicus':'imperium','tyranids':'xenos','t au empire':'xenos','emperor s children':'chaos','chaos space marines':'chaos','space marines':'imperium','blood angels':'imperium','dark angels':'imperium'});
const FACTION_LABELS=Object.freeze({'death guard':'Death Guard','adeptus mechanicus':'Adeptus Mechanicus','tyranids':'Tyranids','t au empire':"T'au Empire",'emperor s children':"Emperor's Children",'chaos space marines':'Chaos Space Marines','space marines':'Space Marines','blood angels':'Blood Angels','dark angels':'Dark Angels'});
const FACTION_READERS=Object.freeze({'death guard':'../books/death-guard/index.html','adeptus mechanicus':'../books/adeptus-mechanicus/index.html','tyranids':'../books/tyranids/index.html','t au empire':'../books/tau-empire/index.html','emperor s children':"../books/emperors-children/index.html",'chaos space marines':'../books/chaos-space-marines/index.html','space marines':'../books/space-marines/index.html','blood angels':'../books/blood-angels/index.html','dark angels':'../books/dark-angels/index.html'});
const savedHost=document.querySelector('#saved-roster-list');
const rosterResult=document.querySelector('#roster-result');

function factionParts(value){const match=String(value||'').trim().match(/^(?:(Chaos|Imperium|Xenos)\s*[-–—]\s*)?(.*)$/i),key=match[2].replace(/[^a-z0-9]+/gi,' ').trim().toLowerCase();return{parent:(match[1]||'').toLowerCase(),key:FACTION_ALIASES[key]||key};}
function normalizeFaction(value){return factionParts(value).key;}
function knownFaction(value){const{parent,key}=factionParts(value);return KNOWN_FACTIONS.has(key)&&(!parent||FACTION_PARENTS[key]===parent)?key:'';}
function pointsLabel(value){return ['adeptus mechanicus','tyranids','t au empire','chaos space marines','space marines','blood angels','dark angels'].includes(knownFaction(value))?'Official MFM total':'Army Book total';}
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
function isDisplayable(record){return Boolean(record?.id&&record?.name);}
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
function canonicalizeRoster(roster,faction=knownFaction(roster?.faction)){
  const source=window.WH_POINTS_CATALOG?.[faction]?.units||{},records=[...new Map(Object.values(source).filter(item=>item&&typeof item==='object').map(item=>[item.unitId||item.id,item])).values()],byId=new Map(records.map(item=>[item.unitId||item.id,item])),byTitle=new Map();
  for(const item of records){const key=unitKey(item.title),items=byTitle.get(key)||[];items.push(item);byTitle.set(key,items);}
  return {...roster,units:(roster?.units||[]).map(unit=>{const explicit=unit?.canonicalUnitId||unit?.canonicalDatasheetId;if(explicit)return byId.has(explicit)?{...unit,canonicalUnitId:explicit}:unit;const candidates=byTitle.get(unitKey(unit?.name))||[];return candidates.length===1?{...unit,canonicalUnitId:candidates[0].unitId||candidates[0].id}:unit;})};
}
function hasSafePhysicalUnitIds(roster){
  const catalog=window.WH_POINTS_CATALOG?.[knownFaction(roster?.faction)]?.units||{},canonicalIds=new Set(Object.values(catalog).map(item=>item?.unitId||item?.id).filter(Boolean)),ids=(roster?.units||[]).map(unit=>typeof unit?.id==='string'?unit.id.trim():'');
  return ids.every(Boolean)&&new Set(ids).size===ids.length&&(roster?.units||[]).every(unit=>{
    const canonical=unit.canonicalDatasheetId||unit.canonicalUnitId;
    return canonicalIds.has(canonical)&&unit.id.trim()!==String(canonical).trim();
  });
}
function escapeHtml(value){const node=document.createElement('span');node.textContent=String(value??'');return node.innerHTML;}
function randomRosterId(records){
  const used=new Set(records.map(record=>record?.id).filter(Boolean));let id;
  do{const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');id=`roster-${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;}while(used.has(id));
  return id;
}
function rosterId(text,records,requestedId=''){
  const identical=text?records.find(record=>record?.sourceText===text&&typeof record?.id==='string'&&record.id):null;
  if(identical)return identical.id;
  const occupied=requestedId?records.find(record=>record?.id===requestedId):null;
  if(requestedId&&(!occupied||occupied.sourceText===text))return requestedId;
  return randomRosterId(records);
}
function recordDetachments(record){const items=Array.isArray(record.roster.detachments)?record.roster.detachments:[{label:record.roster.detachment}];return items.map(item=>item?.label).filter(Boolean).join(' + ');}
function updatedLabel(value){const date=new Date(value);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat('en-GB').format(date):'date unknown';}
function actionButton(label,action,id,primary=false){const button=document.createElement('button');button.className=primary?'action primary':'action';button.type='button';button.textContent=label;if(action)button.dataset[action]=id;return button;}
function readerAction(record){const faction=knownFaction(record?.roster?.faction);if(faction&&FACTION_READERS[faction])return actionButton('Open','openRoster',record.id,true);const button=actionButton('Reader unavailable');button.disabled=true;return button;}
function attachmentAction(record){const roster=record?.roster,model=attachmentState(roster,record);if(!model.api)return null;const current=Object.keys(model.attachments).length>0,candidates=model.units.some(unit=>model.api.candidates({units:model.units,attachments:model.attachments,bodyguardInstanceId:unit.instanceId}).length);return current||candidates?actionButton('Attachments','editAttachments',record.id):null;}
function freshRoster(record){
  const parsed=record?.sourceText?window.WHRosterParser.parse(record.sourceText,{identityHints:record?.roster}):null;
  const source=parsed?.units?.length?parsed:record?.roster,roster=source?canonicalizeRoster(source):source;
  if(!roster)return null;
  const faction=knownFaction(roster.faction);
  roster.faction=FACTION_LABELS[faction]||roster.faction;
  roster.pointsCheck=window.WHRosterPoints.check(roster,faction);
  return roster;
}

function saveRoster(roster,sourceText){
  roster=canonicalizeRoster(roster);
  const records=getSavedRosters(),id=rosterId(sourceText,records),previous=records.find(record=>record?.id===id);
  let record={id,name:`${roster.faction} · ${roster.declared||roster.calculated} pts`,createdAt:previous?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),sourceText,roster,attachments:previous?.attachments||{}};record=validatedAttachmentRecord(record,roster);
  putSavedRosters([record,...records.filter(item=>item?.id!==id)]);
  try{navigator.storage?.persist?.().catch(()=>{});}catch{}
  return record;
}

function unitKey(value){return String(value||'').replace(/[^a-z0-9]+/gi,' ').trim().toLowerCase();}
function attachmentUnits(roster){const catalog=window.WH_POINTS_CATALOG?.[knownFaction(roster?.faction)]?.units||{},byId=new Map(Object.values(catalog).map(unit=>[unit.unitId||unit.id,unit]));return (roster?.units||[]).map(unit=>{const canonicalId=unit?.canonicalUnitId||unit?.canonicalDatasheetId;return{instanceId:unit.id,canonicalUnit:canonicalId?byId.get(canonicalId):catalog[unitKey(unit.name)],rosterUnit:unit};}).filter(item=>item.instanceId&&item.canonicalUnit);}
function attachmentState(roster,record){const api=window.WHArmyRosterContext?.attachments,units=attachmentUnits(roster);if(!api)return{api:null,units,attachments:{},rejected:[]};return{api,units,...api.sanitize({units,attachments:record?.attachments||{}})};}
function validatedAttachmentRecord(record,roster){const state=attachmentState(roster,record);return state.api?{...record,attachments:state.attachments}:record;}
function instanceLabel(roster,unit){const copies=roster.units.filter(item=>unitKey(item.name)===unitKey(unit.name));return copies.length>1?`${unit.name} #${copies.indexOf(unit)+1}`:unit.name;}
function attachmentOption(value,label,selected=false){const option=document.createElement('option');option.value=value;option.textContent=label;option.defaultSelected=selected;option.selected=selected;return option;}
function attachmentEditor(roster,record,bodyguard,model=attachmentState(roster,record)){
  if(!model.api||!model.units.some(item=>item.instanceId===bodyguard.id))return null;
  const current=(model.attachments[bodyguard.id]||[]).map(id=>roster.units.find(unit=>unit.id===id)).filter(Boolean),candidates=model.api.candidates({units:model.units,attachments:model.attachments,bodyguardInstanceId:bodyguard.id}).map(item=>roster.units.find(unit=>unit.id===item.instanceId)).filter(Boolean);
  if(!current.length&&!candidates.length)return null;
  const fragment=document.createDocumentFragment();
  const control=caption=>{const label=document.createElement('label'),small=document.createElement('small'),select=document.createElement('select');label.className='unit-attachment';small.textContent=caption;select.dataset.rosterId=record.id;select.dataset.attachmentBodyguard=bodyguard.id;label.append(small,select);fragment.append(label);return{label,select};};
  for(const unit of current){const {label,select}=control('Attached');select.append(attachmentOption(unit.id,instanceLabel(roster,unit),true),attachmentOption('remove:'+unit.id,'Detach Character'));const summary=document.createElement('small');summary.className='attachment-summary';summary.textContent=instanceLabel(roster,bodyguard)+' \u2190 '+instanceLabel(roster,unit);label.append(summary);}
  if(candidates.length){const {select}=control('Attached Character');select.append(attachmentOption('','+ Add Character',true));for(const unit of candidates)select.append(attachmentOption(unit.id,instanceLabel(roster,unit)));}
  return fragment;
}
function updateAttachment(recordId,bodyguardId,action){
  const records=getSavedRosters(),record=records.find(item=>item?.id===recordId),roster=freshRoster(record);
  if(!record||!roster||!action)return;
  const model=attachmentState(roster,record);if(!model.api)return;const result=action.startsWith('remove:')?model.api.detach({units:model.units,attachments:model.attachments,bodyguardInstanceId:bodyguardId,leaderInstanceId:action.slice(7)}):model.api.attach({units:model.units,attachments:model.attachments,bodyguardInstanceId:bodyguardId,leaderInstanceId:action});if(!result.changed&&JSON.stringify(result.attachments)===JSON.stringify(record.attachments||{}))return;
  const updated={...record,attachments:result.attachments,updatedAt:new Date().toISOString()};
  putSavedRosters(records.map(item=>item?.id===recordId?updated:item));renderSavedRosters();renderRoster(roster,updated);
}

function openSavedRoster(id){
  const record=getSavedRosters().find(item=>item?.id===id);
  if(!record){alert('Saved roster not found.');return;}
  const faction=knownFaction(freshRoster(record)?.faction);
  if(!faction){alert('The saved roster faction is not recognised. The record was not changed.');return;}
  const reader=FACTION_READERS[faction];
  if(!reader){alert(`${FACTION_LABELS[faction]} was saved, but a personal reader is not available yet.`);return;}
  location.href=`${reader}?roster=${encodeURIComponent(id)}`;
}
function editAttachments(id){const records=getSavedRosters(),source=records.find(item=>item?.id===id),roster=freshRoster(source);if(!source||!roster)return;const record=validatedAttachmentRecord(source,roster);if(JSON.stringify(record.attachments)!==JSON.stringify(source.attachments||{}))putSavedRosters(records.map(item=>item?.id===id?record:item));document.querySelector('#roster-input').value=record.sourceText;renderRoster(roster,record);document.querySelector('#roster-result').scrollIntoView({behavior:'smooth',block:'start'});}

function exportRoster(id){
  const record=getSavedRosters().find(item=>item?.id===id);
  if(!record)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`${record.id}.json`;link.click();URL.revokeObjectURL(url);
}

function renderSavedRosters(){
  let stored=getSavedRosters(),changed=false;
  stored=stored.map(record=>{if(!isDisplayable(record))return record;try{const fresh=freshRoster(record),byInstance=new Map((fresh?.units||[]).map(unit=>[unit.id,unit]));let recordChanged=false;const units=record.roster.units.map(unit=>{const canonicalUnitId=byInstance.get(unit?.id)?.canonicalUnitId;if(!canonicalUnitId||unit.canonicalUnitId===canonicalUnitId)return unit;recordChanged=true;return {...unit,canonicalUnitId};});if(!recordChanged)return record;changed=true;return {...record,roster:{...record.roster,units}};}catch{return record;}});
  if(changed)putSavedRosters(stored);
  const records=stored.filter(isDisplayable).map(record=>{try{const roster=freshRoster(record);if(!roster||!Array.isArray(roster.units)||roster.units.some(unit=>!unit||typeof unit!=='object'))throw new Error('Malformed saved roster');return{record,roster};}catch{return{record,roster:null};}});
  if(!records.length){savedHost.innerHTML='<div class="empty">No saved rosters yet. Create a guide below or import a backup.</div>';return;}
  const grid=document.createElement('div');grid.className='saved-grid';
  for(const view of records){const{record,roster}=view,card=document.createElement('article'),actions=document.createElement('div');card.className='saved-card';actions.className='actions';if(!roster){card.dataset.rosterRecovery='required';card.innerHTML=`<p class="eyebrow">Recovery needed</p><h3>${escapeHtml(record.name)}</h3><p>This saved roster could not be read. Export its original backup for recovery, or delete it from this device.</p>`;actions.append(actionButton('Export','exportRoster',record.id),actionButton('Delete','deleteRoster',record.id));}else{card.innerHTML=`<p class="eyebrow">${escapeHtml(recordDetachments({...record,roster}))}</p><h3>${escapeHtml(record.name)}</h3><p>${roster.units.length} units · updated ${updatedLabel(record.updatedAt)}</p>`;actions.append(readerAction({...record,roster}));const attachments=attachmentAction({...record,roster});if(attachments)actions.append(attachments);actions.append(actionButton('Export','exportRoster',record.id),actionButton('Delete','deleteRoster',record.id));}card.append(actions);grid.append(card);}
  savedHost.replaceChildren(grid);
}

function clearRosterPreview(){delete rosterResult.dataset.rosterId;rosterResult.innerHTML='<p class="eyebrow">Preview</p><h2>No roster loaded</h2><p class="help">The faction, Detachment, export total check and recognised units will appear here.</p>';}

function parseRoster(text){
  return window.WHRosterParser.parse(text);
}

function renderRoster(roster,record){
  const check=roster.pointsCheck,attachmentModel=attachmentState(roster,record);
  const currentPointsLabel=pointsLabel(roster.faction);
  const complete=check&&check.total!==null&&!check.unresolved.length;
  const matches=complete&&check.difference===0;
  const exportStatus=check?.exportMatches
    ?'<div class="status">✓ Declared total matches the current authoritative roster total.</div>'
    :`<div class="status warn">! Roster total warning: the export declares ${roster.declared} pts, but the current authoritative total is ${check?.total??'—'} pts.</div>`;
  const pointsStatus=!check||check.total===null
    ?`<div class="status warn">! ${currentPointsLabel} data is unavailable. The roster was still saved.</div>`
    :check.unresolved.length
      ?`<div class="status warn">! ${currentPointsLabel} validation is incomplete. The roster was still saved.<br>${check.unresolved.map(escapeHtml).join('<br>')}</div>`
      :matches
        ?`<div class="status">✓ The ${currentPointsLabel} matches the exported total.</div>`
        :`<div class="status warn">! Points warning: the export declares ${roster.declared} pts, but the ${currentPointsLabel} is ${check.total} pts (${check.difference>0?'+':''}${check.difference}). The roster was still saved.</div>`;
  let enhancementStatus=check?.enhancementWarnings?.length
    ?`<div class="status warn">! Enhancement legality warnings. The roster was still saved.<br>${check.enhancementWarnings.map(escapeHtml).join('<br>')}</div>`
    :check?`<div class="status">✓ Enhancement owners checked · ${check.enhancementChoices} choices · ${check.enhancementAssignments} assignments.</div>`:'';
  const detachmentStatus=check?.detachmentWarnings?.length
    ?`<div class="status warn">! Detachment Points legality warning. The roster was still saved.<br>${check.detachmentWarnings.map(escapeHtml).join('<br>')}</div>`
    :Number.isFinite(check?.detachmentPointLimit)
      ?`<div class="status">✓ Detachment Points checked · ${check.detachmentPoints}/${check.detachmentPointLimit} DP.</div>`
      :check?'<div class="status warn">! Detachment Points were not checked because Battle Size is unavailable.</div>':'';
  enhancementStatus=detachmentStatus+enhancementStatus;
  const formationStatus=attachmentModel.formationIssues?.length?`<div class="status warn">! Attachment formation warning.<br>${attachmentModel.formationIssues.map(issue=>escapeHtml(issue.reason==='mandatory-no-valid-target'?'A mandatory Support unit has no valid Bodyguard and cannot deploy; it counts as destroyed during the first battle round.':'A mandatory Support unit must be attached to an available Bodyguard.')).join('<br>')}</div>`:'';
  const hasReader=Boolean(FACTION_READERS[knownFaction(roster.faction)]);
  rosterResult.dataset.rosterId=record.id;
  rosterResult.innerHTML=`<p class="eyebrow">Preview // ${roster.units.length} units</p><h2>${escapeHtml(roster.faction)}</h2><p class="help">${escapeHtml((roster.detachments||[{label:roster.detachment}]).map(item=>item.label).join(' + '))} · ${escapeHtml(roster.disposition)}</p><div class="summary"><div class="stat"><small>Declared in export</small><strong>${roster.declared||'—'} pts</strong></div><div class="stat"><small>${currentPointsLabel}</small><strong>${check?.total??'—'} pts</strong></div></div>${exportStatus}${pointsStatus}${enhancementStatus}${formationStatus}<p class="help">Unit limits and wargear legality are not checked.</p><ul class="units">${roster.units.map(unit=>{const owned=(check?.enhancements||[]).filter(item=>item.ownerUnitId===unit.id);return `<li><div><strong>${escapeHtml(unit.name)}${owned.map(item=>{const exported=Number(item.exportedCost),current=Number(item.currentCost),price=Number.isFinite(exported)&&Number.isFinite(current)&&exported!==current?`${exported} pts in export · ${current} pts current`:`included +${item.exportedCost??item.currentCost} pts`;return `<small class="unit-enhancement">${escapeHtml(item.name)} · ${price}${item.ownerEligibility!=='valid'?` · ${escapeHtml(item.ownerMessage)}`:''}</small>`;}).join('')}</strong></div><span>${unit.points} pts in export</span></li>`}).join('')}</ul><div class="actions">${hasReader?'<button class="action primary" id="open-guide" type="button">Open personal guide</button>':'<p class="help">Saved. A personal reader is not available for this faction yet.</p>'}</div>`;
  document.querySelectorAll('#roster-result .units > li > div').forEach((host,index)=>{const editor=attachmentEditor(roster,record,roster.units[index],attachmentModel);if(editor)host.append(editor);});
  if(!hasReader)return;
  document.querySelector('#open-guide').addEventListener('click',()=>openSavedRoster(record.id));
}

document.querySelector('#roster-form').addEventListener('submit',event=>{
  event.preventDefault();setTimeout(()=>document.querySelector('#roster-result').scrollIntoView({behavior:'smooth',block:'start'}),0);const input=document.querySelector('#roster-input');let roster=parseRoster(input.value);
  if(!roster.units.length){delete rosterResult.dataset.rosterId;rosterResult.innerHTML='<p class="eyebrow">Import error</p><h2>No units found</h2><p class="help">Paste a New Recruit export containing entries such as “1x Unit (100 pts)”.</p>';return;}
  const faction=knownFaction(roster.faction);
  if(!faction){delete rosterResult.dataset.rosterId;rosterResult.innerHTML=roster.faction?`<p class="eyebrow">Unknown faction</p><h2>${escapeHtml(roster.faction)}</h2><p class="help">This faction is not recognised. The roster was not saved.</p>`:'<p class="eyebrow">Import error</p><h2>Faction not found</h2><p class="help">The export has no FACTION KEYWORD line. The roster was not saved.</p>';return;}
  roster.faction=FACTION_LABELS[faction];
  roster=canonicalizeRoster(roster,faction);
  roster.pointsCheck=window.WHRosterPoints.check(roster,faction);
  let record;
  try{record=saveRoster(roster,input.value);}
  catch{delete rosterResult.dataset.rosterId;rosterResult.innerHTML='<p class="eyebrow">Save error</p><h2>Roster not saved</h2><p class="help">The browser could not store this roster. Your roster text is still in the editor. Check available site storage, then try again.</p>';return;}
  renderSavedRosters();renderRoster(roster,record);
});
document.querySelector('#roster-clear').addEventListener('click',()=>{document.querySelector('#roster-form').reset();clearRosterPreview();document.querySelector('#roster-input').focus();});
document.querySelector('#roster-result').addEventListener('change',event=>{const select=event.target.closest('[data-attachment-bodyguard]');if(select)updateAttachment(select.dataset.rosterId,select.dataset.attachmentBodyguard,select.value);});
savedHost.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.openRoster)openSavedRoster(button.dataset.openRoster);if(button.dataset.editAttachments)editAttachments(button.dataset.editAttachments);if(button.dataset.exportRoster)exportRoster(button.dataset.exportRoster);if(button.dataset.deleteRoster&&confirm('Delete this roster from this device?')){const id=button.dataset.deleteRoster;putSavedRosters(getSavedRosters().filter(record=>record?.id!==id));renderSavedRosters();if(rosterResult.dataset.rosterId===id)clearRosterPreview();}});
document.querySelector('#import-roster').addEventListener('click',()=>document.querySelector('#import-roster-file').click());
document.querySelector('#import-roster-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{const record=JSON.parse(await file.text());if(!isImportableRecord(record))throw new Error();const parsed=window.WHRosterParser.parse(record.sourceText,{identityHints:record.roster});if(parsed.units.length)record.roster=parsed;const faction=knownFaction(record.roster.faction);if(!faction)throw new Error();record.roster=canonicalizeRoster(record.roster,faction);if(!hasSafePhysicalUnitIds(record.roster))throw new Error();const records=getSavedRosters(),id=rosterId(record.sourceText,records,record.id);record.roster.faction=FACTION_LABELS[faction];record.roster.pointsCheck=window.WHRosterPoints.check(record.roster,faction);putSavedRosters([{...record,id,updatedAt:new Date().toISOString()},...records.filter(item=>item?.id!==id)]);renderSavedRosters();if(!FACTION_READERS[faction])alert(`${FACTION_LABELS[faction]} was imported, but a personal reader is not available yet.`);}catch{alert('Could not import the roster backup.');}event.target.value='';});

renderSavedRosters();
const requestedRoster=new URLSearchParams(location.search).get('roster');
if(requestedRoster)openSavedRoster(requestedRoster);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('../service-worker.js',{updateViaCache:'none'}).catch(()=>{}));
