import {resolveOwnedFact} from './mfm-boundary.mjs';
import {selections} from '../../shared/roster-v2/context.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';

const projection=createEffectiveMfmArmyProjection('tyranids').pointsForArmyBook('tyranids');

/** Read-only resolution of central schedules for an imported physical roster.
 * Exported totals are comparison evidence, never another base cost. No caps,
 * Warlord, faction or army-building legality is assessed here.
 */
export function resolveImportedPoints(book,state){
  if(book.bookId!=='tyranids'||state.bookId!==book.bookId)throw new TypeError('Foreign Tyranids points context');
  const copies=new Map(),units=[];
  for(const unit of state.units){
    const copyOrdinal=(copies.get(unit.canonicalUnitId)||0)+1;copies.set(unit.canonicalUnitId,copyOrdinal);
    const bridge=book.mfmImportReferences.partitions.unitBindings.find(b=>b.entityId===unit.canonicalUnitId);
    if(!bridge||bridge.mfmRecordId!==unit.mfmUnitRecordId)throw new TypeError('Wrong central points owner');
    const point=resolveOwnedFact(bridge.mfmRecordId);
    const projected=projection.units.find(row=>row.id===unit.canonicalUnitId);
    if(projected?.mfmRecordId!==point.id)throw new TypeError('Wrong shared MFM projection');
    const candidates=projected.points.filter(row=>copyOrdinal>=(row.minCopies??1)&&copyOrdinal<=(row.maxCopies??Infinity)&&
      unit.startingStrength>=row.minModels&&unit.startingStrength<=row.maxModels);
    const selected=new Set(selections(unit).filter(s=>s.physicalQuantity>0).flatMap(s=>s.canonicalProfileIds));
    const possible=book.mfmImportReferences.partitions.paidOptionBindings.filter(b=>book.entities.find(e=>e.id===b.entityId)?.parentId===unit.canonicalUnitId);
    const paid=possible.filter(b=>selected.has(b.entityId));
    const group=book.importBindings.paidSelectionGroups.find(row=>row.unitId===unit.canonicalUnitId);
    const evidence=possible.length===0||group?.optionProfileIds.filter(id=>selected.has(id)).length===1;
    const enhancementPoints=unit.mfmEnhancementRecordIds.reduce((sum,id)=>sum+resolveOwnedFact(id).value,0);
    const paidOptionPoints=evidence?paid.reduce((sum,b)=>sum+resolveOwnedFact(b.mfmRecordId).value,0):null;
    const basePoints=candidates.length===1?candidates[0].value:null;
    const known=basePoints!==null&&paidOptionPoints!==null;
    units.push({instanceId:unit.instanceId,copyOrdinal,basePoints,enhancementPoints,paidOptionPoints,
      total:known?basePoints+enhancementPoints+paidOptionPoints:null,mfmRecordId:point.id,
      exportedPoints:unit.raw.points,provenance:point.provenance});
  }
  const known=units.every(u=>u.total!==null);
  return {status:known?'KNOWN':'UNKNOWN',sourceVersion:'v1.6',units,total:known?units.reduce((sum,u)=>sum+u.total,0):null,legality:'NOT_ASSESSED'};
}
