/** Browser-native projection of source-verified book-owned bindings. The producer owns proof checks and the central MFM owns prices. */
const clone=structuredClone;
const assert={equal:(a,b,message)=>{if(a!==b)throw new TypeError(message||"Wrong physical book");},ok:(value,message)=>{if(!value)throw new TypeError(message);}};
function occurrences(unit){
 const rows=[];
 const add=(values,scope)=>{for(const selection of values||[])rows.push({selection,scope});};
 add(unit.selections,{kind:'UNIT',unitInstanceId:unit.instanceId,modelScopeId:null});
 for(const row of unit.modelRows||[]){
  add(row.selections,{kind:'MODEL',unitInstanceId:unit.instanceId,modelScopeId:`${unit.instanceId}/${row.rowId}/PROFILE/${row.rowId}`});
  for(const loadout of row.loadouts||[])add(loadout.selections,{kind:'MODEL',unitInstanceId:unit.instanceId,modelScopeId:`${unit.instanceId}/${row.rowId}/LOADOUT/${loadout.loadoutId}`});
 }
 return rows;
}

/** Independent UNIT totals only. This never adds base/Enhancement points or
 * trusts an imported total, so the caller adds the paid subtotal exactly once. */
export function projectBloodAngelsPaidOptions(state,{bindings}={}){
 assert.equal(state?.bookId,'blood-angels');assert.ok(Array.isArray(bindings),'Missing source-verified paid option bindings');
 const allIds=new Set(bindings.flatMap(row=>[...row.profileIds,...row.equipmentIds]));
 const unitIds=new Set(),units=[];
 for(const unit of state.units||[]){
  assert.ok(unit.instanceId&&!unitIds.has(unit.instanceId),'Duplicate physical UNIT');unitIds.add(unit.instanceId);
  const expected=bindings.filter(binding=>binding.ownerUnitId===unit.canonicalUnitId),unresolved=[],selected=occurrences(unit),keys=new Set();
  if(expected.length&&(unit.equipmentContextKnown===false||(unit.equipmentContextKnown!==true&&!selected.length)))
   unresolved.push({reason:'PAID_SELECTION_UNKNOWN',costRecordIds:expected.map(row=>row.costRecordId)});
  for(const {selection,scope}of selected){
   const key=selection.selectionKey;
   if(!key||keys.has(key))unresolved.push({reason:'DUPLICATE_OR_MISSING_PHYSICAL_SELECTION_ID',selectionKey:key??null,scope});
   keys.add(key);
   if(!Number.isInteger(selection.physicalQuantity)||selection.physicalQuantity<0)unresolved.push({reason:'UNRESOLVED_PHYSICAL_QUANTITY',selectionKey:key,scope});
   const ids=[...(selection.canonicalProfileIds||[]),...(selection.canonicalEquipmentIds||[])];
   if(!ids.length&&selection.physicalQuantity>0)unresolved.push({reason:'UNRESOLVED_SELECTION_IDENTITY',selectionKey:key,scope});
   if(ids.some(id=>allIds.has(id)&&!expected.some(binding=>binding.profileIds.includes(id)||binding.equipmentIds.includes(id))))unresolved.push({reason:'WRONG_PAID_OPTION_UNIT_OWNER',selectionKey:key,scope});
  }
  const options=expected.map(binding=>{
   const matches=selected.filter(({selection})=>selection.canonicalProfileIds?.some(id=>binding.profileIds.includes(id))||selection.canonicalEquipmentIds?.some(id=>binding.equipmentIds.includes(id)));
   if(binding.selectionResolution?.kind==='EXCLUSIVE_PAID_WEAPON_SLOT'){
    const positive=rows=>rows.some(({selection})=>Number.isSafeInteger(selection.physicalQuantity)&&selection.physicalQuantity>0);
    const unpaid=selected.filter(({selection})=>selection.canonicalProfileIds?.some(id=>binding.selectionResolution.unpaidProfileIds.includes(id)));
    const alreadyUnknown=unresolved.some(issue=>issue.reason==='PAID_SELECTION_UNKNOWN'&&
     (issue.costRecordId===binding.costRecordId||issue.costRecordIds?.includes(binding.costRecordId)));
    if(!positive(matches)&&!positive(unpaid)&&!alreadyUnknown)unresolved.push({reason:'PAID_SELECTION_UNKNOWN',costRecordId:binding.costRecordId});
   }
   const proof=[];
   for(const occurrence of matches){
    const {selection,scope}=occurrence;
    const equipment=selection.canonicalEquipmentIds?.filter(id=>binding.equipmentIds.includes(id))||[];
    if(equipment.some(id=>!selection.canonicalFieldPaths?.[id]?.includes('/text')))unresolved.push({reason:'PAID_EQUIPMENT_FIELD_NOT_PROVEN',costRecordId:binding.costRecordId,selectionKey:selection.selectionKey,scope});
    if(selection.canonicalProfileIds?.some(id=>!binding.profileIds.includes(id)))unresolved.push({reason:'MIXED_WEAPON_SELECTION_PHYSICAL_QUANTITY_NOT_PROVEN',costRecordId:binding.costRecordId,selectionKey:selection.selectionKey,scope});
    proof.push({selectionKey:selection.selectionKey,physicalQuantity:selection.physicalQuantity,scope,canonicalProfileIds:clone(selection.canonicalProfileIds||[]),canonicalEquipmentIds:clone(equipment),selectionProvenance:clone(selection.provenance||null)});
   }
   // Alternative profiles in one selection share its physical quantity. When
   // split over selections, a physical weapon correlation was not established.
   if(binding.alternativeProfilesOnePurchase){
    const byScope=new Map();for(const item of proof){const key=JSON.stringify(item.scope),rows=byScope.get(key)||[];rows.push(item);byScope.set(key,rows);}
    for(const rows of byScope.values())if(rows.length>1&&new Set(rows.flatMap(row=>row.canonicalProfileIds)).size>1)
     unresolved.push({reason:'ALTERNATIVE_PROFILE_OCCURRENCE_NOT_PROVEN',costRecordId:binding.costRecordId,selectionKeys:rows.map(row=>row.selectionKey)});
   }
   const quantity=proof.reduce((sum,row)=>sum+(Number.isInteger(row.physicalQuantity)&&row.physicalQuantity>=0?row.physicalQuantity:0),0);
   return {costRecordId:binding.costRecordId,label:binding.label,ownerUnitId:binding.ownerUnitId,unitInstanceId:unit.instanceId,
    quantity,value:binding.value,points:quantity*binding.value,selections:proof,provenance:clone(binding.provenance),sourceProvenance:clone(binding.sourceProvenance)};
  });
  const knownPaidPoints=options.reduce((sum,row)=>sum+row.points,0);
  units.push({unitInstanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,status:unresolved.length?'UNRESOLVED':'RESOLVED',knownPaidPoints,totalPaidPoints:unresolved.length?null:knownPaidPoints,options,unresolved});
 }
 const unresolved=units.flatMap(row=>row.unresolved.map(issue=>({unitInstanceId:row.unitInstanceId,...issue}))),knownPaidPoints=units.reduce((sum,row)=>sum+row.knownPaidPoints,0);
 return {owner:'CENTRALIZED_MFM',source:'blood-angels-and-inherited-space-marines-mfm-v1.6',status:unresolved.length?'UNRESOLVED':'RESOLVED',knownPaidPoints,totalPaidPoints:unresolved.length?null:knownPaidPoints,units,unresolved};
}
