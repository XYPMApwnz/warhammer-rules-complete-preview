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
const selectionIdentity=selection=>key([...(selection.canonicalProfileIds||[]).map(id=>['WEAPON',id]),
  ...(selection.canonicalEquipmentIds||[]).map(id=>['EQUIPMENT',id,selection.canonicalFieldPaths?.[id]||[]])].sort((a,b)=>key(a).localeCompare(key(b))));
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
