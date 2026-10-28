/** Disposable display groups only. Never replace canonical or physical records. */
const path=field=>field.presentationPath??field.source?.path;
const value=field=>field?.displayValue??field?.value??null;
const stable=item=>Array.isArray(item)?item.map(stable):item&&typeof item==='object'
  ?Object.fromEntries(Object.keys(item).sort().map(key=>[key,stable(item[key])])):item;
const key=item=>JSON.stringify(stable(item));
export const profileCharacteristics=['M','T','SV','W','LD','OC','INSV'];
export function profileDisplayKey(card,boundFields=new Map()) {
  const fields=[...card.fields,...(card.profileFieldIds||[]).map(id=>boundFields.get(id)).filter(Boolean)];
  return key(profileCharacteristics.map(name=>[name,String(value(fields.find(field=>path(field)==='/'+name))??'')]));
}
export function weaponDisplayKey(card) {
  const at=name=>{const field=card.fields.find(field=>path(field)==='/'+name);return field?String(value(field)):null;};
  const abilities=card.fields.filter(field=>/^\/abilities(?:\/|$)/.test(path(field)||''))
    .flatMap(field=>Array.isArray(value(field))?value(field):[value(field)]).map(stable);
  return key([card.id,at('name')??card.title,at('mode')??card.weaponMode,
    ...['range','attacks','skill','strength','ap','damage'].map(at),abilities.sort((a,b)=>key(a).localeCompare(key(b))),
    card.criticalHitThreshold??null,(card.criticalHitSources||[]).map(s=>[s.ruleId,s.sourceInstanceId,s.sourceCompositionId??null]).sort((a,b)=>key(a).localeCompare(key(b)))]);
}
export function groupDisplayRecords(records,identity) {
  const groups=new Map();
  for(const record of records){const signature=identity(record);let group=groups.get(signature);
    if(!group){group={key:signature,members:[],quantity:0};groups.set(signature,group);}
    group.members.push(record);group.quantity+=record.rosterQuantity??0;
  }
  return [...groups.values()];
}
/** Count MODEL carriers, never weapon copies or repeated captions. Call once per
 * exact source/effect contribution. A PROFILE's physical scope owns its model
 * quantity; WEAPON_PROFILE quantities are deliberately not read here. */
export function countPhysicalCarriers(records,profileCards=[],{unit}={}) {
  const groups=new Map();
  for(const record of records){
    const candidates=record.kind==='PROFILE'?[record]:profileCards.filter(profile=>
      profile.kind==='PROFILE'&&profile.instanceId===record.instanceId&&
      typeof record.scopeId==='string'&&profile.scopeId===record.scopeId);
    const profile=candidates.length===1?candidates[0]:null;
    const display=profile?.presentationScope||record.presentationScope;
    const named=profile?.fields?.find(field=>path(field)==='/name')?.value;
    const label=display?.canonicalLabelIncluded?display.label.replace(/ · Group \d+$/,''):
      display?.label||named||profile?.title||record.title||'Physical models';
    const instanceId=record.instanceId||null,profileId=profile?.id||null;
    const signature=key([instanceId,profileId,label]);
    let group=groups.get(signature);
    if(!group){group={instanceId,profileId,label,quantity:0,scopeIds:[],modelInstanceIds:[],members:[]};groups.set(signature,group);}
    const quantity=profile?.rosterQuantity;
    const modelId=record.modelInstanceId||profile?.modelInstanceId||null;
    const selections=unit?[...(unit.selections||[]),...(unit.modelRows||[]).flatMap(row=>[
      ...(row.selections||[]),...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])]
      .filter(selection=>selection.selectionKey===record.selectionKey):[];
    const selection=selections.length===1?selections[0]:null;
    // A scoped item total alone does not prove its distribution among models.
    const distribution=record.kind!=='WEAPON_PROFILE'||unit?.instanceId===instanceId&&selection&&
      selection.canonicalProfileIds?.includes(record.id)&&Number.isSafeInteger(selection.perModelQuantity)&&
      selection.perModelQuantity>0&&record.rosterQuantity===selection.perModelQuantity*quantity;
    const known=instanceId&&profile&&typeof profile.scopeId==='string'&&profile.scopeId.length&&
      Number.isSafeInteger(quantity)&&quantity>0&&(!modelId||quantity===1)&&distribution;
    const address=known?key([instanceId,modelId?'MODEL':'SCOPE',modelId||profile.scopeId]):null;
    const duplicate=address&&group.members.some(member=>member.address===address);
    // Unknown/ambiguous ownership remains visible without an invented count.
    if(!known||duplicate&&group.members.some(member=>member.address===address&&member.quantity!==quantity))group.quantity=null;
    else if(!duplicate&&group.quantity!==null)group.quantity+=quantity;
    if(known&&!duplicate){group.scopeIds.push(profile.scopeId);if(modelId)group.modelInstanceIds.push(modelId);}
    group.members.push({address,quantity:known?quantity:null,scopeId:record.scopeId||null,selectionKey:record.selectionKey||null});
  }
  return [...groups.values()];
}
export function formatPhysicalCarriers(groups) {
  return groups.map(group=>group.label+(group.quantity===null?' · model count unknown':
    ` · ${group.quantity} ${group.quantity===1?'model':'models'}`));
}
/** Source/effect identity precedes recipient aggregation. Equal rule titles or
 * final values never merge independently executed contributions. */
export const effectContributionKey=source=>key([
  source.canonicalRuleId||source.ruleId,source.clauseId??null,source.effectId??null,source.operation??null,
  source.field??null,source.sourceInstanceId??null,source.sourceProfileId??null,source.sourceCompositionId??null,
  source.sourceModelInstanceId??null,source.sourceFields??null,source.lifetime??null,
  source.targetInstanceId??null,source.recipientScope??null,source.unitScope??null
]);
/** Share an effective annotation only when the same typed effect/source and
 * final presentation apply to EVERY represented physical profile scope.
 * Missing execution provenance fails closed; captions/text alone are not IDs. */
export function uniformProfileAnnotations(members,applied=[]) {
  if(members.length<2)return [];
  const annotations=members.map(card=>card.fields.flatMap(field=>{
    const address=path(field);
    if(!address?.startsWith('/rosterMetrics/'))return [];
    const metric=address.slice('/rosterMetrics/'.length);
    const sources=applied.filter(change=>change.operation==='MODIFY_RULE_METRIC'&&change.field===metric&&
      change.targetInstanceId===card.instanceId&&
      (!change.targetProfileId||change.targetProfileId===card.id)&&
      (!change.targetCompositionId||change.targetCompositionId===card.scopeId));
    if(!sources.length||sources.some(change=>['ruleId','clauseId','effectId'].some(name=>typeof change[name]!=='string'||!change[name])))return [];
    const effects=sources.map(change=>[change.operation,change.field,change.ruleId,change.clauseId,change.effectId,
      change.sourceInstanceId??null,change.sourceFields,change.lifetime]).sort((a,b)=>key(a).localeCompare(key(b)));
    const identity=key([address,effects,field.value,value(field),field.label]);
    return [{identity,card,field}];
  }));
  return annotations[0].flatMap(annotation=>{
    const matches=annotations.map(items=>items.filter(item=>item.identity===annotation.identity));
    return matches.every(items=>items.length===1)?[{identity:annotation.identity,field:annotation.field,members:matches.flat()}]:[];
  });
}
// Imported equipment identities/references have already been validated. One
// option can name several items; its canonical ID alone is not an item ID.
// Legacy selections retain their exact source addresses, including caption
// spans, without using display text or a unique physical selection key.
const equipmentIdentity=selection=>typeof selection.sourceEquipmentIdentity==='string'&&selection.sourceEquipmentIdentity.length
  ?['SOURCE_EQUIPMENT',selection.sourceEquipmentIdentity]
  :['SOURCE_REFERENCES',(selection.sourceReferences||[]).map(reference=>[
    reference.bookId??null,reference.entityId,reference.path,
    reference.caption?[reference.caption.start,reference.caption.end]:null
  ]).sort((a,b)=>key(a).localeCompare(key(b)))];
const selectionIdentity=selection=>key([...(selection.canonicalProfileIds||[]).map(id=>['WEAPON',id]),
  ...(selection.canonicalEquipmentIds||[]).map(id=>['EQUIPMENT',id,selection.canonicalFieldPaths?.[id]||[],equipmentIdentity(selection)])].sort((a,b)=>key(a).localeCompare(key(b))));
// Roster options (for example a selected UNIT keyword) are not physical items.
// Keep their state/presentation elsewhere; inventory requires an actual item ID.
const physicalSelection=selection=>selection.physicalQuantity>0&&
  ((selection.canonicalProfileIds?.length||0)+(selection.canonicalEquipmentIds?.length||0)>0);
/** A selection may reference alternate profiles of ONE item. Its count is not
 * multiplied by the number of canonical profiles. Aggregate inventory stays
 * aggregate; only explicit imported row/loadout ownership permits 'each'. */
export function projectSelectedComposition(unit,composition) {
  const groups=new Map();
  for(const row of unit.modelRows){
    const caption=composition.find(member=>member.rowId===row.rowId)?.label;
    const loadouts=row.loadouts||[],allocated=loadouts.reduce((sum,loadout)=>sum+loadout.quantity,0);
    const parts=[...loadouts.map(loadout=>({quantity:loadout.quantity,selections:loadout.selections||[],scopeId:`${unit.instanceId}/${row.rowId}/LOADOUT/${loadout.loadoutId}`})),
      {quantity:row.quantity-allocated,selections:[],scopeId:`${unit.instanceId}/${row.rowId}/PROFILE/${row.rowId}`}].filter(part=>part.quantity>0);
    for(const part of parts){
      const items=new Map();
      for(const [selection,count]of [...(row.selections||[]).map(selection=>[selection,row.quantity]),...part.selections.map(selection=>[selection,part.quantity])]){
        if(!physicalSelection(selection))continue;
        const perModel=Number.isFinite(selection.perModelQuantity)?selection.perModelQuantity:null;
        const signature=selectionIdentity(selection),previous=items.get(signature);
        // A legacy total on a subdivided row cannot be allocated to subgroups.
        const total=perModel!==null?perModel*part.quantity:count===part.quantity?selection.physicalQuantity:null;
        if(total===null)continue;
        if(previous){previous.total+=total;previous.perModel=previous.perModel!==null&&perModel!==null?previous.perModel+perModel:null;previous.selections.push(selection);}
        else items.set(signature,{identity:signature,selections:[selection],perModel,total});
      }
      const equipment=[...items.values()].sort((a,b)=>a.identity.localeCompare(b.identity));
      const signature=key([row.canonicalProfileId,caption,equipment.map(item=>[item.identity,item.perModel,item.perModel===null?item.total:null])]);
      let group=groups.get(signature);
      if(!group){group={profileId:row.canonicalProfileId,label:caption,quantity:0,scopeIds:[],rowIds:[],equipment};groups.set(signature,group);}
      else group.equipment.forEach((item,index)=>item.total+=equipment[index].total);
      group.quantity+=part.quantity;group.scopeIds.push(part.scopeId);group.rowIds.push(row.rowId);
    }
  }
  const inventory=(unit.selections||[]).filter(physicalSelection).map(selection=>({selection,total:selection.physicalQuantity}));
  // Preserve unresolved scoped totals once, without assigning them to models.
  for(const row of unit.modelRows)if((row.loadouts||[]).some(loadout=>loadout.quantity>0&&loadout.quantity<row.quantity))for(const selection of row.selections||[])
    if(physicalSelection(selection)&&!Number.isFinite(selection.perModelQuantity))inventory.push({selection,total:selection.physicalQuantity,rowId:row.rowId});
  return {groups:[...groups.values()],inventory};
}
