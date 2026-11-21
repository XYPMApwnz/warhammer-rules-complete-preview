/** Complete factual comparison of two accepted MFM capture payloads.
 * Exact source locators address records; this report never decides identity.
 */
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?
  Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const shown=value=>value===undefined?'(not present)':structuredClone(value);
const unitKey=row=>JSON.stringify([row.sourceGroup,row.status,row.title]);
const metadata=new Set(['schema','title','edition','factionId','factionLabel','version','sourceUpdatedAt','capturedAt',
  'observedAt','verifiedAt','effectiveDate','currentnessCutoff','currentness','authority','url','currentnessEvidence',
  'rawArtifacts','captureSha256','sourceId','counts','enrollmentScope']);
const order=(a,b)=>a<b?-1:a>b?1:0;

export function diffMfmCapture(before,after,{bookId}={}){
  const changes=[];
  const emit=(kind,context,selection,a,b)=>changes.push({kind,book:bookId??after.factionId??before.factionId,
    title:context.title??after.factionLabel??before.factionLabel??'MFM',selection:selection||'Record',before:shown(a),after:shown(b)});
  const kindFor=(field,context)=>{
    if(field==='detachmentPoints')return'DETACHMENT_POINTS';
    if(field==='forceDispositions'||field==='forceDisposition')return'FORCE_DISPOSITIONS';
    if(field==='qualifiers')return'QUALIFIERS';
    if(field==='leader'||field==='support')return`RELATION_${field.toUpperCase()}`;
    if(field==='value')return context.area==='entry'?'POINTS':context.area==='paidOptions'?'PAID_OPTION_POINTS':context.area==='enhancements'?'ENHANCEMENT_POINTS':'FACT_CHANGED';
    if(field==='minCopies'||field==='maxCopies')return'POINT_SCHEDULE';
    if(field==='minModels'||field==='maxModels')return'POINT_RANGE';
    return'FACT_CHANGED';
  };
  const arrayKey=field=>({units:unitKey,detachments:row=>row.title,pointSchedules:row=>row.sourceLabel,
    entries:row=>row.sourceLabel,paidOptions:row=>JSON.stringify([row.sourceGroup,row.sourceLabel]),
    enhancements:row=>row.title})[field];
  const addedKind=field=>({units:'UNIT',detachments:'DETACHMENT',pointSchedules:'POINT_SCHEDULE',entries:'POINT_RANGE',
    paidOptions:'PAID_OPTION',enhancements:'ENHANCEMENT'})[field]??'FACT';
  const childContext=(field,row,context)=>{
    if(field==='units')return{title:row.title,selection:`${row.sourceGroup} · ${row.status}`,area:'units'};
    if(field==='detachments')return{title:row.title,selection:'Detachment',area:'detachments'};
    if(field==='enhancements')return{title:row.title,selection:context.title,area:'enhancements'};
    const label=row.sourceLabel??row.title;
    return{...context,area:field==='entries'?'entry':field,
      selection:[context.selection,label].filter(Boolean).join(' · ')};
  };
  const walk=(a,b,context,field='')=>{
    if(same(a,b))return;
    if(Array.isArray(a)&&Array.isArray(b)){
      const key=arrayKey(field);
      if(!key){emit(kindFor(field,context),context,context.selection,a,b);return;}
      const aKeys=a.map(key),bKeys=b.map(key);
      if(new Set(aKeys).size!==aKeys.length||new Set(bKeys).size!==bKeys.length){
        emit('FACT_CHANGED',context,`${context.selection} · ${field} (duplicate source locators)`,a,b);return;
      }
      const left=new Map(a.map(row=>[key(row),row])),right=new Map(b.map(row=>[key(row),row]));
      for(const id of [...new Set([...aKeys,...bKeys])].sort(order)){
        const previous=left.get(id),next=right.get(id),child=childContext(field,next??previous,context);
        if(!left.has(id))emit(addedKind(field)+'_ADDED',child,child.selection,undefined,next);
        else if(!right.has(id))emit(addedKind(field)+'_REMOVED',child,child.selection,previous,undefined);
        else walk(previous,next,child);
      }
      if(aKeys.length===bKeys.length&&aKeys.every(id=>right.has(id))&&!same(aKeys,bKeys))
        emit('ORDER_CHANGED',context,`${context.selection} · ${field} order`,aKeys,bKeys);
      return;
    }
    if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
      for(const key of [...new Set([...Object.keys(a),...Object.keys(b)])].sort(order)){
        const selection=['value','pointSchedules','entries','paidOptions','enhancements','relations','detachments','units'].includes(key)?context.selection:
          [context.selection,key].filter(Boolean).join(' · ');
        walk(a[key],b[key],{...context,selection},key);
      }
      return;
    }
    emit(kindFor(field,context),context,context.selection,a,b);
  };
  const context={title:after.factionLabel??before.factionLabel??'MFM',selection:'',area:'capture'};
  for(const key of [...new Set([...Object.keys(before),...Object.keys(after)])].filter(key=>!metadata.has(key)).sort(order)){
    if(key==='unit'){
      const left=before.unit,right=after.unit;
      if(left&&right&&unitKey(left)===unitKey(right))walk(left,right,childContext('units',right,context));
      else walk(left?[left]:[],right?[right]:[],context,'units');
    }else walk(before[key],after[key],{...context,selection:['units','detachments'].includes(key)?'':key},key);
  }
  return changes;
}
