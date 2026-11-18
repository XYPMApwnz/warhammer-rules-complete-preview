/** Display-only formatting. Accepted fields and roster state stay untouched. */
import {rosterUnitNames} from './roster-labels.mjs';
/** Approved import/Attachment Setup copy. This never changes native results. */
export const importMessages=Object.freeze({
  "points-heading": "Points total unavailable",
  "points-intro": "The app cannot calculate a reliable total. Check the issues below before using these points.",
  "points-paid-selection": "The export does not identify the paid equipment selected. Include equipment in your New Recruit export and import it again.",
  "points-quantity": "The export does not identify the equipment quantity. Include quantities in your New Recruit export and import it again.",
  "points-mfm-size-copy": "This unit's size or number of copies has no verified points cost. Check the current points document before using the total.",
  "points-physical-selection": "The app cannot tell which equipment selection this cost belongs to. Check the equipment in New Recruit and import a fresh export.",
  "points-selection-identity": "The app cannot identify the selected equipment. Check its name in New Recruit and import a fresh export.",
  "points-unit-owner": "The app cannot match this paid equipment to its unit. Check which unit has it in New Recruit and import a fresh export.",
  "points-equipment-source": "The app cannot verify the rules reference for this equipment. Check the cost against your rules; send the export to the site owner if it persists.",
  "points-mixed-quantity": "The app cannot verify how many paid weapons were selected. Include equipment quantities in a fresh New Recruit export.",
  "points-alternate-profiles": "The app cannot confirm which profiles belong to the same weapon. Check the selected weapons and import a fresh export.",
  "points-enhancement": "This Enhancement's cost could not be verified. Check the current points document.",
  "points-fallback": "The points total could not be verified. Check the current points document before using it.",
  "points-message-passthrough": "The points total could not be verified. Check the highlighted unit against the current points document.",
  "unknown-value": "Unavailable",
  "unavailable-entry": "Entry unavailable",
  "reader-unavailable": "This entry could not be opened. Return to the Army Book and try opening it there.",
  "heading": "Attachment Setup",
  "library": "Army Book",
  "initial-status": "No roster is loaded. Paste your New Recruit text export and select Import roster.",
  "import-summary": "Import roster",
  "raw-label": "New Recruit text export",
  "raw-placeholder": "Paste your New Recruit text export here…",
  "import-action": "Import roster",
  "backup-summary": "Backup and restore",
  "backup-restored": "Roster backup restored.",
  "backup-help": "Your roster is saved in this browser. Download a backup to keep a separate copy.",
  "backup-file-label": "Restore a roster backup",
  "backup-export": "Download backup",
  "saved-reload": "Reload saved roster",
  "player-error-empty": "No units could be imported. Paste the complete New Recruit text export and try again.",
  "player-error-composition": "The app could not read how many models of each type are in a unit. Include model quantities in your New Recruit export and try again.",
  "player-error-quantity": "The app could not read an equipment quantity. Check the quantities in New Recruit and import a fresh text export.",
  "player-error-quantity-conflict": "The export gives conflicting quantities for the same equipment. Check the quantities in New Recruit and import a fresh text export.",
  "player-error-warlord": "The app could not tell which unit is your Warlord. Check the Warlord selection in New Recruit and import a fresh text export.",
  "player-error-enhancement-owner": "The app could not tell which unit has an Enhancement. Check its assigned unit in New Recruit and import a fresh text export.",
  "player-error-enhancement-context": "An Enhancement requires a Detachment that is missing from the import. Check the Detachment and Enhancement in New Recruit, then import the complete export.",
  "player-error-fallback": "The app could not read an entry. Check the original export or restore a valid roster backup.",
  "state-invalid-fallback": "The app could not validate this roster. Import the original export or restore a valid roster backup.",
  "action-failed-fallback": "The action failed. Check your New Recruit export or roster backup and try again.",
  "no-saved-roster": "No saved roster was found in this browser. Import a New Recruit export or restore a backup.",
  "backup-before-import": "Import or restore a roster before downloading a backup.",
  "backup-exported": "Backup downloaded.",
  "saved-restored": "Saved roster reloaded.",
  "another-roster": "Import another roster",
  "replacement-kept": "Current roster kept.",
  "import-success": "Roster imported.",
  "replacement-heading": "Replace your current roster?",
  "replacement-help": "Replacing this roster clears manual attachments. Choose Replace roster to continue or Keep current roster to cancel.",
  "replacement-confirm": "Replace roster",
  "replacement-cancel": "Keep current roster",
  "replacement-status": "This export would replace your current roster. Choose Replace roster or Keep current roster.",
  "clarification-status": "Some entries need attention. Review the highlighted entries below.",
  "select-placeholder": "Choose an entry…",
  "enhancement-bearer-choice": "The Enhancement bearer needs confirmation. Choose the model carrying it.",
  "matching-choice-help": "This name needs confirmation. Choose the matching entry below.",
  "matching-label": "Choose a match",
  "matching-placeholder": "Choose a matching entry…",
  "bindings-submit": "Confirm selections",
  "binding-legend-fallback": "Imported entry",
  "detachment-match-failure": "The Detachment could not be recognized in this Army Book. Check its name and the selected Army Book.",
  "binding-blocked": "This entry could not be read. Correct the export in New Recruit and import it again.",
  "confirm-each-error": "Some entries still need a choice. Choose a match for each one before continuing.",
  "candidate-unavailable": "This match is no longer available. Import the export again and choose from the current matches.",
  "binding-unsupported": "This entry cannot be confirmed here. Send the original export to the site owner.",
  "models-label": "Models",
  "points-label": "Points",
  "points-unresolved-value": "Not calculated",
  "mfm-base-label": "Points",
  "imported-points-label": "Exported points",
  "enhancements-label": "Enhancements",
  "your-roster": "Your roster",
  "imported-detachments": "Imported Detachments",
  "enhancements-none-applied": "Not applied",
  "source-selections-heading": "Rule choices",
  "source-choice-saved": "Choice saved. Review the affected unit.",
  "source-choice-placeholder": "Not selected",
  "source-choice-apply": "Save choice",
  "source-choice-unavailable": "This choice cannot be changed here. Send the export to the site owner.",
  "warlord-label": "Warlord",
  "warlord-none": "No eligible Warlord is available in this roster.",
  "warlord-save": "Save Warlord",
  "warlord-choose-error": "A Warlord has not been selected. Choose an eligible CHARACTER from this roster.",
  "warlord-saved": "Warlord saved.",
  "invalid-enhancement-heading": "Enhancement not applied",
  "open-guide": "Open personal guide",
  "open-card": "Open card",
  "detach-action": "Detach",
  "attachment-candidate-label": "Eligible Character or Support",
  "attachment-add": "Add Character or Support",
  "guide-unavailable": "The personal guide could not be opened. Return to your Army Book and try again.",
  "card-unavailable": "This unit’s datasheet could not be opened. Return to the Army Book and try again.",
  "attachment-choose-error": "Choose an eligible Character or Support from this roster.",
  "attachments-heading": "Characters and Support",
  "detached-status": "Character or Support detached.",
  "attached-status": "Character or Support attached.",
  "input-dirty-status": "Text added. Choose Import roster to check the entries.",
  "header-message": "The export header could not be read. Export the complete list as text from New Recruit and try again.",
  "header-instruction": "Supported headers begin with three nonempty lines: list name and points, faction, then Detachment(s). Example:",
  "header-example": "Unnamed list (950 Points)\nDeath Guard\nContagion Engines and Paragons of Putrescence (2 Detachment Points)",
  "header-optional-instruction": "A Force Disposition, a battle size, or both may follow the Detachment line. Each may appear once, in either order.",
  "header-new-example": "Unnamed list (760 Points)\nDeath Guard\nShamblerot Vectorium and Virulent Vectorium (5 Detachment Points)\nDisruption\nStrike Force (2,000 Points)",
  "header-guidance": "Export the complete roster as text from New Recruit and try again. If the header still cannot be read, send the original export to the site owner.",
  "missing-weapons": "This export does not list this unit’s weapons. Include equipment in your New Recruit export, then import it again.",
  "missing-composition": "This export does not give the number of models of each type in this unit. Export it with model composition, or add a separate quantity line for each model type, then import it again.",
  "limitations-heading": "Known limitations of this Army Book",
  "rules-points-limitations-heading": "Rules and points",
  "unsupported-mechanics-general": "Some rules are not applied automatically. Check their full text before using them."
});

const captionName=(value,id)=>{
  if(typeof value!=='string'||!value.trim()||value===id)throw new TypeError('Missing human name for physical attribution: '+id);
  return value;
};
/** The same composition-aware name in menus, cards and attribution. */
export function physicalUnitCaption(state,cards,instanceId){
  const matches=state.units.filter(unit=>unit.instanceId===instanceId);
  if(matches.length!==1)throw new TypeError('Unresolved physical attribution unit: '+instanceId);
  const unit=matches[0];captionName(cards.get(unit.canonicalUnitId)?.title,unit.canonicalUnitId);
  return rosterUnitNames(state,id=>cards.get(id)?.title).get(instanceId);
}

/** Select the existing MFM model/copy bounds. This is the card's established
 * price reader, shared with Attachment Setup; exported prices never own it. */
export function rosterBasePoints(cards,state,unit,priced=null){
  const copyOrdinal=state.units.filter(value=>value.canonicalUnitId===unit.canonicalUnitId).findIndex(value=>value.instanceId===unit.instanceId)+1;
  const selectedPrices=[];
  for(const id of cards.get(unit.canonicalUnitId)?.children||[]){const price=cards.get(id);if(price?.kind!=='MFM_UNIT_POINTS')continue;
    const at=path=>price.fields.find(field=>field.source?.path===path)?.value;
    for(const field of price.fields.filter(field=>field.source?.path.endsWith('/value'))){
      const prefix=field.source.path.slice(0,-5),schedule=field.source.path.split('/entries/')[0];
      const min=at(prefix+'minModels'),max=at(prefix+'maxModels');
      if(typeof min==='number'&&unit.startingStrength>=min&&unit.startingStrength<=(max??min)&&
        copyOrdinal>=(at(schedule+'/minCopies')??price.pointsSchedule?.minCopies??1)&&
        copyOrdinal<=(at(schedule+'/maxCopies')??price.pointsSchedule?.maxCopies??Infinity))selectedPrices.push(field);
    }
  }
  return priced?.totalPoints!==undefined&&priced.totalPoints!==null?priced.totalPoints-(priced.enhancementPoints||0):
    priced?.total!==undefined&&priced.total!==null?priced.total-(priced.enhancementPoints||0):
    priced?.basePoints??(selectedPrices.length===1?selectedPrices[0].value:null);
}
/** Resolve the exact existing MODEL scope; IDs remain in the underlying trace.
 * Profiles are the normal presenter projection, annotated with runtime MODEL
 * identity. Neither quantities nor scope membership are inferred from an ID. */
export function physicalModelCaption(state,cards,instanceId,profiles,{scopeId=null,modelInstanceId=null,profileId=null}={}){
  if(!scopeId&&!modelInstanceId&&!profileId)throw new TypeError('Missing physical MODEL attribution identity');
  const matches=profiles.filter(profile=>profile.instanceId===instanceId&&
    (!scopeId||profile.scopeId===scopeId)&&(!modelInstanceId||profile.modelInstanceId===modelInstanceId)&&
    (!profileId||profile.id===profileId));
  if(matches.length!==1)throw new TypeError('Unresolved physical MODEL attribution: '+instanceId);
  const profile=matches[0],field=profile.fields.find(field=>(field.presentationPath??field.source?.path)==='/name');
  const name=captionName(profile.presentationScope?.label||field?.value||(profile.title!=='PROFILE'?profile.title:null),profile.id);
  const quantity=profile.rosterQuantity;
  if(!Number.isSafeInteger(quantity)||quantity<1||modelInstanceId&&quantity!==1)throw new TypeError('Unresolved physical MODEL attribution quantity');
  const peers=profiles.filter(other=>other.id===profile.id),ordinal=peers.findIndex(other=>other.scopeId===profile.scopeId)+1;
  const group=peers.length>1&&!profile.presentationScope?.label?' · Group '+ordinal:'';
  const unit=state.units.find(unit=>unit.instanceId===instanceId),unitLabel=physicalUnitCaption(state,cards,instanceId);
  const namedScope=name===cards.get(unit.canonicalUnitId).title?unitLabel:unitLabel+' — '+name;
  return namedScope+group+' · '+quantity+(quantity===1?' model':' models');
}
const importCopy=new Map([
  ['Source and physical import limitations',importMessages['limitations-heading']],
  ['Gameplay and points limitations','Rules and points'],
  ['Chapter context and keyword grants','Dark Angels keywords'],
  ['Source and import limitations',importMessages['limitations-heading']],
  ['Two weapon mappings remain NOT_PROVEN: Chainsword / Astartes Chainsword and Bolt Rifle Fire / Focused or Saturation profiles.',
    'Two weapons cannot be told apart from the export: Chainsword vs Astartes Chainsword, and the Bolt Rifle firing modes (Focused Fire or Saturation).'],
  ['Ambiguous selections are rejected without replacing the saved roster.',
    "Your saved roster has not changed. Review the highlighted entry before trying the import again."],
  ['An authentic Blood Angels New Recruit export has not been verified.',
    ""],
  ['Black Rage retains its source OR and unknown positional context.',
    "Battlefield conditions are not checked automatically. Check Black Rage during the battle."],
  ['Legacy of the Angel requires BLOOD ANGELS and CHARACTER; general Space Marines units do not gain BLOOD ANGELS automatically.',
    "Legacy of the Angel needs an eligible BLOOD ANGELS CHARACTER. Check the affected unit’s keywords before using this rule."],
  ['Stormlance remains a source conflict.',"Stormlance: sources disagree on Detachment Points. Check the current Munitorum Field Manual."],
  ['Ten MFM reference-only relations remain inactive.',''],
  ['Unsupported mechanics retain full text; paid equipment requires an exact physical selection, otherwise points are unresolved.',
    'Some rules are shown in full but are not applied automatically. To calculate paid equipment costs, the app needs to know exactly what was selected, how many, and who has it; otherwise the points total stays unresolved.'],
  ['A roster containing only general Space Marines units has unconfirmed Dark Angels army context. DEATHWING and RAVENWING grants remain inactive until a source-confirmed Dark Angels unit and validated roster membership establish that context. Opening this book, a Detachment or an attachment does not establish Chapter context.',
    "The imported roster does not confirm Dark Angels army membership for these units. Check the affected units’ keyword rules before using DEATHWING or RAVENWING."],
  ['This importer has constructed-input coverage; an authentic Dark Angels New Recruit export has not been verified.',
    ""]
]);
export function playerImportCopy(value){
  let text=String(value??'');
  for(const [before,after]of importCopy)text=text.replaceAll(before,after);
  return text.replace(/ {2,}/g,' ').trim();
}
const plainHeaderHelp=Object.freeze({
  message:importMessages["header-message"],
  instruction:importMessages["header-instruction"],
  example:importMessages["header-example"],
  optionalInstruction:importMessages["header-optional-instruction"],
  newExample:importMessages["header-new-example"],
  guidance:importMessages["header-guidance"]
});
/** Explain missing recognized header metadata only after import is unresolved.
 * This does not inspect, repair or admit any input spelling or header format. */
export function plainHeaderImportExplanation(result){
  const draft=result?.draft,metadata=draft?.metadata;
  return result?.status==='NEEDS_BINDINGS'&&!result.errors?.length&&draft?.units?.length>0&&
    !metadata?.plainHeader&&metadata?.faction==='—'&&metadata.detachment==='—'&&
    Array.isArray(draft.detachments)&&draft.detachments.length===0?plainHeaderHelp:null;
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

/** Explain incomplete physical input without supplying equipment or models. */
export const incompleteExportCopy=Object.freeze({
  weapons:importMessages["missing-weapons"],
  composition:importMessages["missing-composition"],
  noWeapons:'This unit has no listed weapon profiles.'
});

/** Human labels are a projection of existing identities, never import aliases. */
export const importNoticeCopy=Object.freeze({
  details:'Details',
  general:importMessages['limitations-heading'],
  unsupported:importMessages['unsupported-mechanics-general'],
  stormlance:'Stormlance: sources disagree on Detachment Points. Check the current Munitorum Field Manual.',
  blackRage:'Battlefield conditions are not checked automatically. Check Black Rage during the battle.',
  legacy:'Legacy of the Angel needs an eligible BLOOD ANGELS CHARACTER. Check the affected unit’s keywords before using this rule.',
  chapter:'The imported roster does not confirm Dark Angels army membership for these units. Check the affected units’ keyword rules before using DEATHWING or RAVENWING.',
  unchanged:'No roster changes were saved.',
  importedDetails:'Your current roster and saved roster were not changed.',
  quantities:'Imported quantities remain unchanged.',
  enhancementDetails:'Core Rules 25.04 prohibits Enhancements on Epic Hero units. The Enhancement is not applied, and the imported army list is invalid. Exported points are retained.',
  unverifiedWeapon:name=>`${name} cannot be identified reliably by this importer yet. Send the original export to the site owner.`,
  saveFailed:message=>`${message} Your changes are visible, but this browser could not save them. Download a backup to keep them.`,
  unitCount:n=>`${n} ${n===1?'unit':'units'}`,
  rosterSummary:n=>`${n} ${n===1?'unit':'units'}. Review your units and optional attachments.`,
  draftSummary:n=>`Imported text (${n} ${n===1?'unit':'units'})`,
  draftUnit:(name,n)=>`${name} · ${n??'Unavailable'} ${n===1?'model':'models'} in the export`,
  matchLabel:name=>`Choose a match for ${name}`,
  sourceLabel:(choice,unit)=>`${choice} for ${unit}`,
  attachLabel:name=>`Add Character or Support to ${name}`,
  enhancementWarning:(name,unit)=>`${unit}: ${name} cannot be applied to an Epic Hero. Remove it in New Recruit and import the corrected list.`
});
const internalImportLabel=/\b(?:parsed-unit-|unit-|detachment-|datasheet-|refs-|bindings-)|NOT_PROVEN|REFERENCE_ONLY|canonical|physical|source entry|binding/i;
export function importLabel(value,fallback=importMessages['binding-legend-fallback']){
  const special=new Map([
    ['Complete combined item required in one physical loadout','Equipment entry'],
    ['Venom bolt requires one explicitly identified Ravener','Venom bolt bearer'],
    ['Possessed Blade: choose the bearer’s equipped melee weapon','Possessed Blade']
  ]);
  const label=special.get(value)??value;
  return typeof label==='string'&&label.trim()&&!internalImportLabel.test(label)?label:fallback;
}
/** Reformat only the two typed choice references already supplied by native
 * services. All option IDs, order, quantity and recipient sets stay intact. */
export function importChoiceOptions(choice,{state,cards,projection}){
  const decoded=choice.options.map(option=>{try{return JSON.parse(option.id);}catch{return null;}});
  return choice.options.map((option,index)=>{
    const ref=decoded[index];
    if(Array.isArray(ref)&&ref.length&&ref.every(id=>typeof id==='string'&&state.units.some(unit=>unit.instanceId===id)))
      return {...option,title:ref.map(id=>physicalUnitCaption(state,cards,id)).join(' + ')};
    if(Array.isArray(ref))throw new TypeError('Unresolved recipient choice caption');
    if(ref&&typeof ref==='object'&&!Array.isArray(ref)&&typeof ref.canonicalProfileId==='string'&&typeof ref.selectionKey==='string'){
      const unit=projection?.units.find(unit=>unit.instanceId===ref.unitInstanceId);
      const profiles=unit?.profiles||[];
      const weapons=[...(unit?.weapons||[]),...profiles.flatMap(profile=>profile.weapons||[])];
      const matches=weapons.filter(weapon=>weapon.canonicalProfileId===ref.canonicalProfileId&&weapon.selectionKey===ref.selectionKey&&(weapon.scopeId??null)===(ref.scopeId??null));
      if(!matches.length||matches.some(weapon=>![1,2].includes(weapon.physicalQuantity)))throw new TypeError('Unresolved equipment choice caption');
      const quantity=matches[0].physicalQuantity;
      if(matches.some(weapon=>weapon.physicalQuantity!==quantity))throw new TypeError('Contradictory equipment choice quantity');
      const name=captionName(cards.get(ref.canonicalProfileId)?.title,ref.canonicalProfileId);
      const peers=decoded.filter(other=>other?.canonicalProfileId===ref.canonicalProfileId),ordinal=peers.indexOf(ref)+1;
      const scope=profiles.find(profile=>profile.scopeId===ref.scopeId);
      const modelName=scope?cards.get(scope.canonicalProfileId)?.title:null;
      return {...option,title:name+(quantity===2?' — choose 1 of 2 weapons':' — 1 weapon')+
        (peers.length>1?' · '+[modelName,'Selection '+ordinal].filter(Boolean).join(' · '):'')};
    }
    const title=importLabel(option.title,null);
    if(!title)throw new TypeError('Missing human name for rule choice');
    return {...option,title};
  });
}
export function importErrorCopy(error,{faction,book}){
  if(error?.code==='FOREIGN_FACTION_EXPORT')return `This list is for ${importLabel(faction,'another faction')}, but ${book} is open. Open the matching Army Book and import it there.`;
  return nativeImportErrors[error?.code]||importMessages['player-error-fallback'];
}


const nativeImportErrors=Object.freeze({
  "INVALID_BOOK": "The app could not check this list. Reload the Army Book and try the import again.",
  "INVALID_BINDINGS": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "EMPTY_IMPORT": "No units could be imported. Paste the complete New Recruit text export and try again.",
  "AMBIGUOUS_WARLORD_IDENTITY": "The app could not tell which unit is your Warlord. Check the Warlord selection in New Recruit and import a fresh text export.",
  "AMBIGUOUS_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "INVALID_CANONICAL_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "FOREIGN_PROFILE_OWNER": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "FOREIGN_ENHANCEMENT_CONTEXT": "An Enhancement requires a Detachment that is missing from the import. Check the Detachment and Enhancement in New Recruit, then import the complete export.",
  "CONFLICTING_IMPORTED_IDENTITY": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "AMBIGUOUS_DETACHMENT_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "FOREIGN_DETACHMENT_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "CONFLICTING_DETACHMENT_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "CONFLICTING_IMPORTED_SELECTION": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "INVALID_OPTION_QUANTITY": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "INVALID_SELECTION_BINDING": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "FOREIGN_SELECTION_OWNER": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "INVALID_SELECTION_FIELD": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "CONFLICTING_SELECTION_QUANTITY": "The export gives conflicting quantities for the same equipment. Check the quantities in New Recruit and import a fresh text export.",
  "INVALID_SELECTION_QUANTITY": "The app could not read an equipment quantity. Check the quantities in New Recruit and import a fresh text export.",
  "CONTRADICTORY_COMPOSITION": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "INVALID_COMPOSITION": "The app could not read how many models of each type are in a unit. Include model quantities in your New Recruit export and try again.",
  "AMBIGUOUS_LOADOUT_SCOPE": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "INVALID_WARLORD_IDENTITY": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "CONFLICTING_SELECTED_OPTION": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "UNRESOLVED_ENHANCEMENT_OWNER": "The app could not tell which unit has an Enhancement. Check its assigned unit in New Recruit and import a fresh text export.",
  "INVALID_ROSTER_ID": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "EQUIPMENT_QUANTITY": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "INACTIVE_EQUIPMENT_BEARER": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "WRONG_EQUIPMENT_MODEL": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "EXCLUSIVE_MODEL_EQUIPMENT": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "FOREIGN_MFM_OWNER": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "FOREIGN_PHYSICAL_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "INVALID_MODEL_BINDING": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "FOREIGN_MODEL_IDENTITY": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "SOURCE_COMPOSITION_QUANTITY": "A unit’s model count does not match its composition. Check the model counts in New Recruit and export the list again.",
  "WRONG_UPGRADE_UNIT": "An upgrade does not belong to this unit. Check the upgrade assignment in New Recruit and export the list again.",
  "WRONG_UPGRADE_SCOPE": "An upgrade could not be assigned to its intended bearer. Check the upgrade assignment in New Recruit and export the list again.",
  "CONFLICTING_MODEL_OWNER": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "FOREIGN_ENHANCEMENT_MODEL": "The Enhancement could not be matched to its bearer. Check the Enhancement and the model that has it in New Recruit, then export and import again.",
  "WRONG_ENHANCEMENT_MODEL": "The Enhancement could not be matched to its bearer. Check the Enhancement and the model that has it in New Recruit, then export and import again.",
  "DUPLICATE_EQUIPMENT": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "EXCLUSIVE_AEGIS_REPLACEMENT": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "AMBIGUOUS_WEAPON_DECISION": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "INVALID_WEAPON_DECISION_RECORD": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "FOREIGN_WEAPON_DECISION_MODEL": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "FOREIGN_WEAPON_CHOICE": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "UNEQUIPPED_WEAPON_CHOICE": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "DUPLICATE_WEAPON_DECISION": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "UNASSIGNED_WEAPON_CHOICE": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "UNKNOWN_CANONICAL_OPTION": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "INVALID_CANONICAL_STATE": "The app could not check this list. Reload the Army Book and try the import again.",
  "CONFLICTING_CANONICAL_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "FOREIGN_MODEL_BINDING": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "DUPLICATE_ENHANCEMENT_SELECTION": "An Enhancement is selected more than once. Check its assignments in New Recruit and export the list again.",
  "INVALID_COMPOUND_SELECTION": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "FOREIGN_PHYSICAL_PROFILE": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "WRONG_MODEL_WEAPON": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "SOURCE_COMPOSITION_CONDITION": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "DUPLICATE_PAID_OPTION": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "CONFLICTING_MAIN_WEAPON": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "SOURCE_VENOM_BOLT_QUANTITY": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "FOREIGN_ENHANCEMENT_ASSIGNMENT": "The Enhancement could not be matched to its bearer. Check the Enhancement and the model that has it in New Recruit, then export and import again.",
  "CONFLICTING_SOURCE_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "INPUT_QUANTITY_EVIDENCE_MISMATCH": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "WRONG_MODEL_PROFILE": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "UNKNOWN_EQUIPMENT_SOURCE": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "WRONG_PROVIDED_WEAPON": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "CONFLICTING_MODEL_BINDING": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "UNKNOWN_ENHANCEMENT": "The Enhancement could not be recognized. Check its name in New Recruit and export the list again.",
  "INVALID_PHYSICAL_STATE": "The app could not check this list. Reload the Army Book and try the import again.",
  "INVALID_MODEL_BINDINGS": "The model details in this export could not be checked. Include each model type, its quantity and equipment in New Recruit, then export and import again.",
  "INPUT_QUANTITY_MISMATCH": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "MISSING_QUANTITY_EVIDENCE": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "WRONG_EQUIPMENT_REFERENCE": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "UNREVIEWED_EQUIPMENT_BINDING": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "FOREIGN_ENHANCEMENT_BEARER": "The Enhancement could not be matched to its bearer. Check the Enhancement and the model that has it in New Recruit, then export and import again.",
  "CONFLICTING_ENHANCEMENT_BEARER": "The Enhancement could not be matched to its bearer. Check the Enhancement and the model that has it in New Recruit, then export and import again.",
  "WRONG_ENHANCEMENT_UNIT": "The Enhancement could not be matched to its bearer. Check the Enhancement and the model that has it in New Recruit, then export and import again.",
  "DUPLICATE_PHYSICAL_SELECTION": "The equipment details in this export could not be checked. Confirm the selected items and quantities in New Recruit, then export and import again.",
  "INVALID_LEXICAL_INPUT": "The action failed. Check your New Recruit export or roster backup and try again.",
  "UNSUPPORTED_SOURCE_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "INVALID_IMPORT_INPUT": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "UNSUPPORTED_BINDING": "The app could not import this entry. Export the list again from New Recruit and retry.",
  "INVALID_IMPORT_COMMIT": "The app could not check this list. Reload the Army Book and try the import again."
});
const nativeImportNeeds=Object.freeze({
  "detachment-choice": "This name matches more than one entry. Choose the entry used in your New Recruit list.",
  "datasheet-choice": "This name matches more than one entry. Choose the entry used in your New Recruit list.",
  "datasheet-blocked": "The app could not recognize this entry. Check its name and export the list again from New Recruit.",
  "profile-choice": "This name matches more than one entry. Choose the entry used in your New Recruit list.",
  "profile-blocked": "The app could not recognize this entry. Check its name and export the list again from New Recruit.",
  "enhancement-choice": "This name matches more than one entry. Choose the entry used in your New Recruit list.",
  "enhancement-blocked": "The app could not recognize this entry. Check its name and export the list again from New Recruit.",
  "detachment-membership-not-proven": "The Detachment could not be recognized in this Army Book. Check its name and the selected Army Book.",
  "csm-deferred-unit": "This unit is not supported by automatic import yet. Send the original export to the site owner.",
  "selection-choice": "This equipment name matches more than one item. Choose the item used in your New Recruit list.",
  "selection-blocked": "The app could not recognize this equipment. Include its full name in your New Recruit export and import again.",
  "selection_field": "The app could not identify which equipment rule was selected. Export the list with full equipment details and import again.",
  "selection_quantity": "This export does not say how many items were selected. Include equipment quantities in New Recruit and export the list again.",
  "option-choice-unconfirmable": "This choice is ambiguous in the export and cannot be confirmed here. Make the choice explicit in New Recruit, then export the list again.",
  "option-blocked": "The app could not recognize this choice. Make the choice explicit in New Recruit and export the list again.",
  "composition-marine": "The export does not identify each model type and its quantity. Include a separate line for each model type in New Recruit, then export and import again.",
  "composition-native": "The export does not identify each model type and its quantity. Include a separate line for each model type in New Recruit, then export and import again.",
  "bearer-space-marines": "More than one model can bear this Enhancement. Choose the model that has it.",
  "bearer-chaos-space-marines": "More than one model can bear this Enhancement. Choose the model that has it.",
  "bearer-emperors-children": "More than one model can bear this Enhancement. Choose the model that has it.",
  "bearer-no-candidate": "The export does not identify one model as the Enhancement bearer. List that model separately in New Recruit, then export and import again.",
  "ec-possessed-blade": "Possessed Blade needs a weapon choice. Choose the bearer’s equipped melee weapon.",
  "tyranids-compound_weapon_source": "This equipment is listed in separate pieces. Export it as one complete equipment item for the model that has it.",
  "tyranids-venom_bolt_model_owner": "The export does not identify which Ravener has the venom bolt. List that model separately with its equipment, then export and import again.",
  "tyranids-enhancement_eligibility_needs_bindings": "The app could not confirm who can take this Enhancement. Check its assignment in New Recruit and export the list again.",
  "tyranids-unresolved_source_restriction": "The app cannot import this Enhancement yet. Send the original export to the site owner.",
  "ec-equipment-model-owner": "The export does not identify the model with this equipment. List that model separately with its equipment, then export and import again.",
  "ba-astartes-chainsword": "Astartes Chainsword cannot be identified reliably by this importer yet. Send the original export to the site owner.",
  "ba-bolt-rifle-fire": "Bolt Rifle Fire cannot be identified reliably by this importer yet. Send the original export to the site owner.",
  "composition-marine-unconfirmable-choice": "The app cannot match these model details, so import cannot complete here. Send the New Recruit export to the app owner for review.",
  "composition-native-unconfirmable-choice": "The app cannot match these model details, so import cannot complete here. Send the New Recruit export to the app owner for review."
});
/** Explain an existing need without admitting it or changing its candidates. */
export function importNeedCopy(need,hasCandidates){
  const exact={DETACHMENT_MEMBERSHIP_NOT_PROVEN:'detachment-membership-not-proven',DEFERRED_CROSS_REGISTRY_DEPENDENCY:'csm-deferred-unit'}[need.reason];
  if(exact)return nativeImportNeeds[exact];
  if(need.kind==='PROFILE'&&need.rawLabel==='Possessed Blade: choose the bearer’s equipped melee weapon')return nativeImportNeeds['ec-possessed-blade'];
  const kind={DETACHMENT:'detachment',DATASHEET:'datasheet',PROFILE:'profile',ENHANCEMENT:'enhancement',SELECTION:'selection',
    OPTION:'option',COMPOSITION_MEMBER:'composition-native',ENHANCEMENT_BEARER:'bearer',SELECTION_FIELD:'selection_field',SELECTION_QUANTITY:'selection_quantity',
    COMPOUND_WEAPON_SOURCE:'tyranids-compound_weapon_source',VENOM_BOLT_MODEL_OWNER:'tyranids-venom_bolt_model_owner',
    ENHANCEMENT_ELIGIBILITY_NEEDS_BINDINGS:'tyranids-enhancement_eligibility_needs_bindings',UNRESOLVED_SOURCE_RESTRICTION:'tyranids-unresolved_source_restriction',
    EQUIPMENT_MODEL_OWNER:'ec-equipment-model-owner'}[need.kind];
  const key=need.kind==='ENHANCEMENT_BEARER'?(hasCandidates?'bearer-chaos-space-marines':'bearer-no-candidate'):
    need.kind==='COMPOSITION_MEMBER'?(hasCandidates?'composition-native-unconfirmable-choice':'composition-native'):
    need.kind==='OPTION'?(hasCandidates?'option-choice-unconfirmable':'option-blocked'):
    ['DETACHMENT','DATASHEET','PROFILE','ENHANCEMENT','SELECTION'].includes(need.kind)?kind+(hasCandidates?'-choice':'-blocked'):kind;
  return nativeImportNeeds[key]||importMessages[hasCandidates?'matching-choice-help':'binding-blocked'];
}
