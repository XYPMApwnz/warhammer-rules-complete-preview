/** Book-owned import vocabulary. Every target is an existing V2 canonical
 * identity; labels are accepted only at the text-import boundary. These
 * bindings neither select missing equipment nor execute an option's effect. */
const requireFact=(condition,message)=>{if(!condition)throw new TypeError(message);};

// Explicit grammatical variants of the source's composition names. This is
// not a fuzzy identity resolver, and shared statline names are never aliases
// for several independently owned composition members.
const singularMembers=[
  ['cultist-mob',2,'Chaos Cultist'],['legionaries',2,'Legionary'],
  ['dark-apostle',2,'Dark Disciple'],['dark-commune',4,'Blessed Blade'],
  ['accursed-cultists',1,'Torment'],['accursed-cultists',2,'Mutant'],
  ['chaos-terminator-squad',2,'Chaos Terminator'],
  ['fellgor-beastmen',2,'Fellgor Beastman'],['havocs',2,'Havoc'],
  ['mutilators',1,'Mutilator'],['obliterators',1,'Obliterator'],
  ['raptors',2,'Raptor'],['red-corsairs-raiders',2,'Red Corsairs Raider'],
  ['traitor-guardsmen-squad',2,'Traitor Guardsman'],['warp-talons',2,'Warp Talon'],
  ['chaos-bikers',2,'Chaos Biker']
];

// Source-backed physical weapon names, explicitly bound to their canonical
// profiles. An imported piece of equipment selects all its alternate modes;
// the profiles retain their independent canonical identities.
const weaponFamilies=[
  ['legionaries','Missile launcher',[9,10]],['legionaries','Plasma gun',[11,12]],['legionaries','Plasma pistol',[13,14]],
  ['chaos-lord','Plasma pistol',[1,2]],['chaos-lord-with-jump-pack','Plasma pistol',[2,3]],
  ['dark-commune','Warp Curse',[2,3]],
  ['heretic-astartes-daemon-prince','Hellforged weapons',[2,3]],
  ['heretic-astartes-daemon-prince-with-wings','Hellforged weapons',[2,3]],
  ['master-of-possession','Rite of Possession',[2,3]],['red-corsairs-reave-captain','Plasma pistol',[2,3]],
  ['sorcerer','Infernal Gaze',[2,3]],['sorcerer-in-terminator-armour','Infernal Gaze',[3,4]],
  ['warpsmith','Plasma pistol',[3,4]],['vashtorr-the-arkifane','Vashtorr’s hammer',[2,3]],
  ['chosen','Plasma pistol',[4,5]],['fellgor-beastmen','Plasma pistol',[4,5]],
  ['havocs','Havoc missile launcher',[6,7]],['havocs','Plasma gun',[10,11]],['havocs','Plasma pistol',[12,13]],
  ['mutilators','Fleshmetal weapons',[1,2,3]],
  ['nemesis-claw','Missile launcher',[6,7]],['nemesis-claw','Plasma gun',[8,9]],['nemesis-claw','Plasma pistol',[10,11]],
  ['obliterators','Fleshmetal guns',[1,2,3]],['raptors','Plasma pistol',[4,5]],['raptors','Plasma gun',[6,7]],
  ['traitor-guardsmen-squad','Cultist grenade launcher',[3,4]],['traitor-guardsmen-squad','Plasma gun',[9,10]],
  ['chaos-bikers','Plasma gun',[6,7]],['chaos-bikers','Plasma pistol',[8,9]],
  ['defiler','Heavy missile launcher',[8,9]],['defiler','Shearing claws',[10,11]],
  ['helbrute','Missile launcher',[4,5]],['khorne-lord-of-skulls','Great cleaver of Khorne',[6,7]],
  ['abaddon-the-despoiler','Talon of Horus',[1,3]],
  ['cypher','Cypher’s bolt pistol',[1,3]],['cypher','Cypher’s plasma pistol',[2,4]],
  ['haarken-worldclaimer','Helspear',[1,3]],['fellgor-beastmen','Corrupted stave',[3,8]]
];

const equipment=[
  ['legionaries','Chaos icon','wargear:3','/text',true],
  ['chosen','Chaos icon','wargear:5','/text',true],
  ['possessed','Chaos icon','wargear:1','/text',true],
  ['chaos-bikers','Chaos icon','wargear:4','/text',true],
  ['sorcerer-in-terminator-armour','Chaos familiar','wargear:2','/text'],
  ['nemesis-claw','Voice eater','wargear:6','/text'],
  // The fixed Iconarch item has no separate selectable-option record. Its
  // existing composition address is the selection owner; the ability record
  // is evidence about what that item does, not proof of imported ownership.
  ['dark-commune','Chaos icon','section:2','/equipmentAndRules/0/text',true]
];

export function buildImportBindings(book) {
  requireFact(Array.isArray(book?.entities),'Missing canonical CSM import book');
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  requireFact(records.size===book.entities.length,'Duplicate canonical import identity');
  const textAt=({entityId,path})=>{
    let value=records.get(entityId)?.data;
    for(const part of path.slice(1).split('/').map(part=>part.replaceAll('~1','/').replaceAll('~0','~')))value=value?.[part];
    requireFact(typeof value==='string'&&value.length,'Missing canonical import evidence: '+entityId+path);
    return value;
  };
  const evidence=(entityId,path)=>{const ref={entityId,path};textAt(ref);return ref;};
  const identityAliases=singularMembers.map(([slug,ordinal,label])=>{
    const canonicalId=`datasheet-${slug}:section:2:member:${ordinal}`,entity=records.get(canonicalId);
    requireFact(entity?.kind==='PROFILE'&&entity.data.composition,'Missing canonical composition import alias');
    return {canonicalId,labels:[label],evidence:evidence(canonicalId,'/composition/name')};
  });
  const weaponSelections=weaponFamilies.map(([slug,label,ordinals])=>{
    const ownerId=`unit-${slug}`,owner=records.get(ownerId),canonicalProfileIds=ordinals.map(n=>`datasheet-${slug}:weapon:${n}`);
    requireFact(owner?.kind==='DATASHEET','Missing canonical weapon owner');
    for(const id of canonicalProfileIds)requireFact(records.get(id)?.kind==='WEAPON_PROFILE'&&records.get(id).parentId===ownerId&&
      owner.data.weaponIds.includes(id),'Foreign canonical import weapon');
    // Validate the reviewed name-to-profiles declaration against the source
    // names, rather than discovering an authoritative join from source prose.
    requireFact(canonicalProfileIds.every(id=>{const name=records.get(id).data.name;return name===label||
      name.startsWith(label+' – ')||name.startsWith(label+' - ');}), 'Canonical weapon family evidence drift');
    return {ownerId,label,canonicalProfileIds,evidence:canonicalProfileIds.map(id=>evidence(id,'/name'))};
  });
  const equipmentSelections=equipment.map(([slug,label,suffix,path,quoteCaption])=>{
    const ownerId=`unit-${slug}`,id=`datasheet-${slug}:${suffix}`,entity=records.get(id),ref=evidence(id,path);
    requireFact(entity?.parentId===ownerId&&['WARGEAR_OPTION','UNIT_COMPOSITION','DATASHEET_SECTION'].includes(entity.kind),
      'Foreign canonical equipment selection');
    requireFact(textAt(ref).toLowerCase().includes(label.toLowerCase()),'Canonical equipment label evidence drift');
    // A display span quotes the equipment name from its existing source field.
    // It neither renames the ability nor changes the selected item's identity.
    const sourceReferences=[];
    if(quoteCaption) {
      const text=textAt(ref),start=text.indexOf(label);
      requireFact(start>=0&&text.indexOf(label,start+label.length)<0,'Ambiguous canonical equipment caption');
      sourceReferences.push({...ref,bookId:book.bookId,caption:{start,end:start+label.length}});
    }
    return {ownerId,label,canonicalEquipmentIds:[id],canonicalFieldPaths:{[id]:[path]},evidence:[ref],
      ...(sourceReferences.length?{sourceReferences}:{})};
  });
  const optionSelections=[];
  for(const slug of ['heretic-astartes-daemon-prince','heretic-astartes-daemon-prince-with-wings']) {
    const ownerId=`unit-${slug}`,declarationId=`datasheet-${slug}:section:3`,declaration=records.get(declarationId);
    requireFact(declaration?.kind==='UPGRADE_DECLARATION'&&declaration.parentId===ownerId,'Missing canonical Allegiance owner');
    for(const [index,label] of ['Khorne','Tzeentch','Nurgle','Slaanesh'].entries()) {
      const canonicalOptionId=`${declarationId}:option:${index+1}`,option=records.get(canonicalOptionId);
      requireFact(option?.kind==='UPGRADE_OPTION'&&option.parentId===declarationId&&declaration.data.optionIds.includes(option.id),
        'Missing canonical Allegiance option');
      const refs=[evidence(canonicalOptionId,'/text'),evidence(declarationId,'/blocks/0/text')];
      requireFact(textAt(refs[0]).startsWith(label+':'),'Canonical Allegiance evidence drift');
      for(const selectionLabel of [label,`Daemonic Allegiance: ${label}`])optionSelections.push({ownerId,label:selectionLabel,
        canonicalOptionId,selectionField:'selectedUpgradeIds',selectionCardinality:'MANY',exclusiveGroupId:declarationId,evidence:refs});
    }
  }
  const detachmentId='detachment-pactbound-zealots',ruleId=detachmentId+':rule';
  for(const [index,label] of ['Khorne','Tzeentch','Nurgle','Slaanesh','Chaos Undivided'].entries()) {
    const canonicalOptionId=`${ruleId}:mark:${index+1}`,option=records.get(canonicalOptionId);
    requireFact(option?.kind==='UPGRADE_OPTION'&&option.parentId===ruleId&&option.data.selectionRuleId===ruleId&&
      option.data.keyword===label.toUpperCase(),'Missing canonical Mark option');
    for(const selectionLabel of [label,`Mark of ${label}`,`Mark: ${label}`,`Mark of Chaos: ${label}`])optionSelections.push({detachmentId,label:selectionLabel,
      canonicalOptionId,selectionField:'selectedMarkId',selectionCardinality:'ONE',evidence:[evidence(canonicalOptionId,'/keyword'),evidence(ruleId,'/content/0/text')]});
  }
  const alliedSource=evidence('army-rule-cult-of-the-dark-gods','/blocks/0/text');
  const deferredUnits=['Khorne Berzerkers','Rubric Marines','Plague Marines','Noise Marines'].map(label=>{
    requireFact(textAt(alliedSource).includes(label.toUpperCase()),'Deferred allied source evidence drift');
    requireFact(!book.entities.some(entity=>entity.kind==='DATASHEET'&&entity.displayName?.toLowerCase()===label.toLowerCase()),
      'Native import foundation now contains a formerly deferred allied unit');
    return {label,reason:'DEFERRED_CROSS_REGISTRY_DEPENDENCY'};
  });
  return {identityAliases,weaponSelections,equipmentSelections,optionSelections,deferredUnits};
}
