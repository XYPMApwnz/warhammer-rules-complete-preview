import {selections} from '../../shared/roster-v2/context.mjs';
const assert=(ok,message)=>{if(!ok)throw new TypeError(message);};
/** Existing physical rows/loadouts establish distinct bearers. Aggregate
 * equipment cannot prove two mutually exclusive items belong to different models. */
export function validateInstrumentSelections(book,state) {
  const selected=(unit,id)=>selections(unit).filter(s=>s.physicalQuantity>0&&s.canonicalEquipmentIds.includes(id)&&s.canonicalFieldPaths?.[id]?.includes('/text'));
  const active=(unit,selection)=>unit.selections?.includes(selection)||unit.modelRows.some(row=>
    row.selections.includes(selection)||row.loadouts?.some(loadout=>loadout.quantity>0&&loadout.selections.includes(selection)));
  const bearer=(unit,selection)=>{
    if(unit.startingStrength===1)return unit.instanceId;
    if(unit.selections?.includes(selection))return null;
    for(const row of unit.modelRows) {
      if(row.selections.includes(selection))return row.quantity===1?unit.instanceId+'/'+row.rowId:null;
      for(const loadout of row.loadouts||[])if(loadout.selections.includes(selection))return loadout.quantity===1?
        unit.instanceId+'/'+row.rowId+(row.quantity===1?'':'/loadout/'+loadout.loadoutId):null;
    }
    return null;
  };
  for(const binding of book.rosterEquipmentRestrictions||[])for(const unit of state.units.filter(u=>u.canonicalUnitId===binding.ownerId)) {
    const instruments=selected(unit,binding.instrumentId);if(!instruments.length)continue;
    assert(instruments.length===1&&instruments[0].physicalQuantity===1,'Only one Instrument per physical UNIT may be selected');
    assert(active(unit,instruments[0]),'Instrument selection has no physical MODEL bearer');
    const icons=selected(unit,binding.iconId);if(!icons.length)continue;
    assert(icons.length===1&&icons[0].physicalQuantity===1,'Only one Daemonic Icon per physical UNIT may be selected');
    const left=bearer(unit,instruments[0]),right=bearer(unit,icons[0]);
    assert(left&&right,'Instrument and Icon require distinct explicit physical MODEL bearers');
    assert(left!==right,'Instrument and Icon cannot share a physical MODEL bearer');
  }
}
