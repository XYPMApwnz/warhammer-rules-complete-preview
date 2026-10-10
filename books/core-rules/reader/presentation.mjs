import {factAt,factHash} from '../content/fact-source-bindings.mjs';

const quoted=value=>value.replace(/[‘’]/g,"'").replace(/[“”]/g,'"');
const removeRanges=(text,ranges)=>ranges.slice().sort((a,b)=>b[0]-a[0]).reduce((value,[start,end])=>value.slice(0,start)+value.slice(end),text).trimEnd();
const offsetAfter=(offset,ranges)=>offset-ranges.reduce((total,[start,end])=>total+Math.max(0,Math.min(offset,end)-start),0);
function boundText(record,address){
  const value=factAt(record,address);
  if(factHash(value)!==address.hash)throw new Error(`Stale reader presentation binding: ${record.id}`);
  return value;
}

// Presentation slices refer to canonical owners; neither facts nor provenance are rewritten.
export function createReaderPresentation(catalog,bindings){
  if(bindings.schema!=='core-reader-presentation/v1')throw new Error('Unknown reader presentation bindings');
  const views=new Map(),popupData={};
  const viewFor=id=>{
    if(!views.has(id)){
      const record=catalog.getById(id);
      if(!record||typeof record.text!=='string')throw new Error(`Missing reader presentation owner: ${id}`);
      views.set(id,{record,omissions:[],markers:[]});
    }
    return views.get(id);
  };
  for(const binding of bindings.appliedErrataPanels||[]){
    const view=viewFor(binding.ownerId),erratum=catalog.getById(binding.erratumId);
    if(!view.record.relationships.errataIds.includes(binding.erratumId)||erratum?.relationships.targetRuleId!==view.record.id)throw new Error('Unbound reader erratum relationship');
    boundText(view.record,binding.panel);
    const effective=boundText(view.record,binding.effectiveClause),source=boundText(erratum,binding.sourceClause);
    if(quoted(effective)!==quoted(source)||binding.effectiveClause.range[1]>binding.panel.range[0])throw new Error('Reader cannot hide an unapplied change');
    view.omissions.push(binding.panel.range);
  }
  for(const binding of bindings.visualMarkers||[]){
    const view=viewFor(binding.ownerId),text=boundText(view.record,binding.text);
    const image=factAt(catalog.presentation.images,{path:binding.imagePath});
    const enrolledAsset=`../assets/diagrams/${image.file.replace(/\.png$/i,'.webp')}`;
    const unit=catalog.sourceUnits[binding.sourceNote.unitId];
    const occurrence=unit?.occurrences.find(item=>item.sourceOrder===binding.sourceNote.sourceOrder);
    if(!view.record.sourceUnitIds.includes(unit?.id)||!occurrence||factAt(occurrence,{path:binding.sourceNote.path})!==text||image.file!==binding.enrolledFile||binding.asset!==enrolledAsset||!binding.alt)throw new Error('Unbound reader visual marker');
    view.markers.push({range:binding.text.range,src:binding.asset,alt:binding.alt});
  }
  for(const [id,view] of views){
    const ordered=view.omissions.slice().sort((a,b)=>a[0]-b[0]);
    if(ordered.some(([start],index)=>index&&start<ordered[index-1][1]))throw new Error('Overlapping reader omissions');
    if(new Set(view.markers.map(marker=>marker.range.join(':'))).size!==view.markers.length||view.markers.some(marker=>ordered.some(([start,end])=>marker.range[0]<end&&marker.range[1]>start)))throw new Error('Overlapping reader visual markers');
    const raw=view.record.text;
    // Shared canonical reference views expose semanticContent, before reader formatting.
    if((view.record.semanticContent??raw)!==raw)throw new Error('Reader and canonical reference text require separate presentation addresses');
    const omissions=view.omissions.map(([start,end])=>{
      return {range:[start,end],expected:raw.slice(start,end)};
    });
    const markers=view.markers.map(marker=>{
      const [start,end]=marker.range;
      return {range:[start,end],expected:raw.slice(start,end),offset:offsetAfter(end,view.omissions),src:marker.src,alt:marker.alt};
    });
    popupData[id]={omissions,markers};
    view.display={...view.record,text:removeRanges(raw,view.omissions),inlineMarkers:view.markers.map(marker=>({...marker,offset:offsetAfter(marker.range[1],view.omissions)}))};
  }
  return {recordView:record=>views.get(record.id)?.display||record,popupData};
}
