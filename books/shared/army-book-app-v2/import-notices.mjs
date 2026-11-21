/** Informational projection over an imported header and existing presentation
 * fields. It never validates an import, writes a roster or supplies a rule. */
const label=value=>typeof value==='string'?value.normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g,' ').trim():'';
const nonnegative=value=>Number.isSafeInteger(value)&&value>=0;
const sourceField=(record,field,cards,path)=>{
  if(!field||field.source?.entityId!==record.pointRecordId||field.source.path!==path||
    field.contextId!==record.id||field.id!==`${record.pointRecordId}::${path}`)return null;
  const owner=cards.get(record.pointRecordId),matches=owner?.fields?.filter(item=>item.id===field.id)||[];
  return ['MFM_DETACHMENT','DETACHMENT_ROSTER_METADATA'].includes(owner?.kind)&&owner.parentId===record.id&&matches.length===1&&
    matches[0].source?.entityId===record.pointRecordId&&matches[0].source.path===path&&matches[0].value===field.value?field:null;
};

export function importRosterNotices({metadata,state,bookPresentation,cards=new Map(),battleSizes=[]}={}){
  if(!metadata?.plainHeader||!Array.isArray(state?.detachmentIds)||!state.detachmentIds.length||
    bookPresentation?.schema!=='army-book-app-v2/book-v1-presentation')return [];
  const records=bookPresentation.records||{},selected=state.detachmentIds.map(id=>records[id]);
  if(selected.some(record=>record?.kind!=='DETACHMENT'))return [];
  const notices=[];
  // Both explicit size and points limit must agree with one supplied Core row.
  // The declared header DP value is deliberately not a price authority.
  const sizes=(Array.isArray(battleSizes)?battleSizes:[]).filter(row=>label(row.label)===label(metadata.battleSize)&&
    nonnegative(row.pointsLimit)&&row.pointsLimit===metadata.pointsLimit&&nonnegative(row.detachmentPoints));
  const prices=selected.map(record=>sourceField(record,record.detachmentPoints,cards,'/detachmentPoints')?.value);
  if(sizes.length===1&&prices.every(nonnegative)){
    const total=prices.reduce((sum,value)=>sum+value,0),limit=sizes[0].detachmentPoints;
    if(Number.isSafeInteger(total)&&total>limit)notices.push({kind:'DETACHMENT_POINTS_OVER_BATTLE_SIZE',
      total,limit,battleSize:metadata.battleSize});
  }
  const disposition=label(metadata.disposition);
  if(disposition&&disposition!=='—'){
    // Resolve the lexical header only against the book's existing proved
    // labels, then compare existing IDs (or the explicitly named relation
    // shape) across every selection. No canonical identity is synthesized.
    const memberships=record=>{
      const named=cards.get(record.pointRecordId)?.kind==='DETACHMENT_ROSTER_METADATA';
      return (record.forceDispositions||[]).map((field,index)=>{
        const path=`/${named?'forceDispositions':'forceDispositionIds'}/${index}`;
        const name=named?field.value:field.displayValue;
        return sourceField(record,field,cards,path)&&typeof field.value==='string'&&label(name)?
          {identity:named?'label:'+label(field.value):'id:'+field.value,name}:null;
      });
    };
    const known=Object.values(records).filter(record=>record.kind==='DETACHMENT').flatMap(memberships).filter(Boolean);
    const ids=new Set(known.filter(field=>label(field.name)===disposition).map(field=>field.identity));
    const selectedMemberships=selected.map(memberships);
    if(ids.size===1&&selectedMemberships.every(fields=>fields.length&&fields.every(Boolean))&&
      !selectedMemberships.flat().some(field=>ids.has(field.identity)))
      notices.push({kind:'FORCE_DISPOSITION_NOT_SELECTED',disposition:metadata.disposition});
  }
  return notices;
}
