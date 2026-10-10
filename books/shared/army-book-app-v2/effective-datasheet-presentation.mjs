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
    ...['range','attacks','skill','strength','ap','damage'].map(at),abilities.sort((a,b)=>key(a).localeCompare(key(b)))]);
}
export function groupDisplayRecords(records,identity) {
  const groups=new Map();
  for(const record of records){const signature=identity(record);let group=groups.get(signature);
    if(!group){group={key:signature,members:[],quantity:0};groups.set(signature,group);}
    group.members.push(record);group.quantity+=record.rosterQuantity??0;
  }
  return [...groups.values()];
}
const selectionIdentity=selection=>key([...(selection.canonicalProfileIds||[]).map(id=>['WEAPON',id]),
  ...(selection.canonicalEquipmentIds||[]).map(id=>['EQUIPMENT',id,selection.canonicalFieldPaths?.[id]||[]])].sort((a,b)=>key(a).localeCompare(key(b))));
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
        if(!(selection.physicalQuantity>0))continue;
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
  const inventory=(unit.selections||[]).filter(selection=>selection.physicalQuantity>0).map(selection=>({selection,total:selection.physicalQuantity}));
  // Preserve unresolved scoped totals once, without assigning them to models.
  for(const row of unit.modelRows)if((row.loadouts||[]).some(loadout=>loadout.quantity>0&&loadout.quantity<row.quantity))for(const selection of row.selections||[])
    if(selection.physicalQuantity>0&&!Number.isFinite(selection.perModelQuantity))inventory.push({selection,total:selection.physicalQuantity,rowId:row.rowId});
  return {groups:[...groups.values()],inventory};
}
