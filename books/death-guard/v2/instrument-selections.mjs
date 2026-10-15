import {selections} from '../../shared/roster-v2/context.mjs';
import {normalizeImportLabel} from '../../shared/roster-v2/import.mjs';

// Book-owned import constraints bind existing option identities. Labels are
// checked only at the input boundary; gameplay dispatch uses canonical IDs.
const inputs=[
  {ownerId:'unit-plague-drones',instrumentId:'datasheet-plague-drones:wargear:1',iconId:'datasheet-plague-drones:wargear:2',
    member:'Plague Drone',aliases:['Plague Drone','Plague Drones']},
  {ownerId:'unit-plaguebearers',instrumentId:'datasheet-plaguebearers:wargear:1',iconId:'datasheet-plaguebearers:wargear:2',
    member:'Plaguebearer',aliases:['Plaguebearer','Plaguebearers']}
];
export function inspectInstrumentSelections(book,state) {
  const records=new Map(book.entities.map(e=>[e.id,e])),issues=[];
  const selected=(unit,id)=>selections(unit).filter(s=>s.physicalQuantity>0&&s.canonicalEquipmentIds.includes(id)&&s.canonicalFieldPaths?.[id]?.includes('/text'));
  const location=(unit,selection)=>{
    if(unit.selections.includes(selection))return {active:true,bearer:null};
    for(const row of unit.modelRows) {
      if(row.selections.includes(selection))return {active:row.quantity>0,row,bearer:row.quantity===1?row.rowId:null};
      for(const loadout of row.loadouts||[])if(loadout.selections.includes(selection))return {active:loadout.quantity>0,row,
        bearer:loadout.quantity===1?row.rowId+(row.quantity===1?'':'/loadout/'+loadout.loadoutId):null};
    }
    return {active:false,bearer:null};
  };
  for(const input of inputs) {
    const option=records.get(input.instrumentId),icon=records.get(input.iconId);
    if(option?.parentId!==input.ownerId||icon?.parentId!==input.ownerId||option.kind!=='WARGEAR_OPTION'||
       option.data.text!==`1 ${input.member} that is not equipped with a daemonic icon can be equipped with 1 instrument of Chaos.`||
       icon.data.text!==`1 ${input.member} that is not equipped with an instrument of Chaos can be equipped with 1 daemonic icon.`)
      throw new TypeError('Instrument source binding changed: '+input.instrumentId);
    for(const unit of state.units.filter(u=>u.canonicalUnitId===input.ownerId)) {
      const instruments=selected(unit,input.instrumentId);if(!instruments.length)continue;
      const fail=(code,message,unresolved=false)=>issues.push({code,key:unit.instanceId,kind:'EQUIPMENT_BEARER',rawLabel:'Instrument of Chaos',message,unresolved,
        sourceReferences:[{entityId:input.instrumentId,path:'/text'},{entityId:input.iconId,path:'/text'}]});
      if(instruments.length!==1||instruments[0].physicalQuantity!==1){fail('EQUIPMENT_QUANTITY','Only one Instrument may be selected per physical UNIT');continue;}
      const instrument=location(unit,instruments[0]);
      if(!instrument.active){fail('INACTIVE_EQUIPMENT_BEARER','Selected Instrument has no active physical bearer');continue;}
      if(instrument.row?.presentationLabel&&!input.aliases.map(normalizeImportLabel).includes(normalizeImportLabel(instrument.row.presentationLabel))) {
        fail('WRONG_EQUIPMENT_MODEL','Instrument must belong to a '+input.member+' model');continue;
      }
      const icons=selected(unit,input.iconId);if(!icons.length)continue;
      if(icons.length!==1||icons[0].physicalQuantity!==1){fail('EQUIPMENT_QUANTITY','Only one Daemonic Icon may be selected per physical UNIT');continue;}
      const other=location(unit,icons[0]);
      if(!instrument.bearer||!other.bearer){fail('UNRESOLVED_EQUIPMENT_BEARERS','Instrument and Icon require distinct explicit physical MODEL bearers',true);continue;}
      if(instrument.bearer===other.bearer)fail('EXCLUSIVE_MODEL_EQUIPMENT','Instrument and Icon cannot share a physical MODEL bearer');
    }
  }
  return issues;
}
