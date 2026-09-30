const SCHEMA='wh40k-effective-points-projection/v1';
const clean=value=>String(value??'').trim();
const list=value=>Array.isArray(value)?value:[];
const multiForceBooks=new Set(['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines']);
const unique=(items,keyOf,label)=>{
  const seen=new Set();
  for(const item of items){
    const key=clean(keyOf(item));
    if(!key)throw new Error(`${label} requires a canonical identity`);
    if(seen.has(key))throw new Error(`duplicate ${label} identity: ${key}`);
    seen.add(key);
  }
};
const validatePoints=(bookId,unit)=>{
  if(!Array.isArray(unit.points)||!unit.points.length)throw new Error(`${bookId}: ${unit.id} is missing a required point schedule`);
  const tiers=new Set();
  for(const [index,tier] of unit.points.entries()){
    if(typeof tier?.label!=='string'||!tier.label.trim())throw new Error(`${bookId}: ${unit.id} point tier ${index+1} requires a label`);
    if(typeof tier.value!=='number'||!Number.isFinite(tier.value))throw new Error(`${bookId}: ${unit.id} point tier ${index+1} requires a finite value`);
    const tierId=clean(tier.id)||`${tier.label}\0${tier.value}`;
    if(tiers.has(tierId))throw new Error(`${bookId}: ${unit.id} has duplicate point tier ${tierId}`);
    tiers.add(tierId);
  }
};

export function createEffectivePointsProjection(input={}){
  const book={id:clean(input.book?.id),title:clean(input.book?.title),parentBookId:input.book?.parentBookId??null};
  if(!book.id||!book.title)throw new Error('effective points projection requires book id and title');
  const units=list(input.units).map(unit=>({...unit,id:clean(unit.id),title:clean(unit.title),sourceBookId:clean(unit.sourceBookId)||book.id}));
  const alliedUnits=list(input.alliedUnits).map(unit=>({...unit,id:clean(unit.id),title:clean(unit.title),sourceBookId:clean(unit.sourceBookId)}));
  const detachments=list(input.detachments).map(item=>({...item,id:clean(item.id),title:clean(item.title),sourceBookId:clean(item.sourceBookId)||book.id}));
  const enhancements=list(input.enhancements).map(item=>({...item,id:clean(item.id),detachmentId:clean(item.detachmentId),title:clean(item.title),sourceBookId:clean(item.sourceBookId)||book.id}));
  unique(units,item=>item.id,`${book.id} unit`);
  unique(alliedUnits,item=>item.id,`${book.id} allied unit`);
  const unitIds=new Set(units.map(item=>item.id));for(const item of alliedUnits)if(unitIds.has(item.id))throw new Error(`${book.id}: allied unit collides with published unit ${item.id}`);
  unique(detachments,item=>item.id,`${book.id} Detachment`);
  unique(enhancements,item=>`${item.detachmentId}\0${item.id}`,`${book.id} scoped Enhancement`);
  const detachmentIds=new Set(detachments.map(item=>item.id));
  for(const unit of units){
    if(!unit.title)throw new Error(`${book.id}: ${unit.id} requires a title`);
    validatePoints(book.id,unit);
    if(!unit.ruleProfile||unit.ruleProfile.id!==unit.id||unit.ruleProfile.unitId!==unit.id)throw new Error(`${book.id}: ${unit.id} requires its canonical rule profile`);
  }
  for(const unit of alliedUnits){if(!unit.title||!unit.sourceBookId)throw new Error(`${book.id}: ${unit.id} requires allied identity and source owner`);validatePoints(book.id,unit);}
  for(const item of detachments){
    if(!item.title)throw new Error(`${book.id}: ${item.id} requires a title`);
    if(typeof item.detachmentPoints!=='number'||!Number.isFinite(item.detachmentPoints))throw new Error(`${book.id}: ${item.id} requires a finite Detachment point value`);
    if(multiForceBooks.has(book.id)){
      if(!Array.isArray(item.forceDispositions)||!item.forceDispositions.length||new Set(item.forceDispositions).size!==item.forceDispositions.length||item.forceDispositions.some(value=>typeof value!=='string'||!value))throw new Error(`${book.id}: ${item.id} requires non-empty duplicate-free Force Disposition membership`);
      for(const field of ['forceDispositionIds','mfmForceDispositionIds','missionForceDispositionIds'])if(!Array.isArray(item[field])||item[field].length!==item.forceDispositions.length||new Set(item[field]).size!==item[field].length)throw new Error(`${book.id}: ${item.id} has invalid ${field}`);
    }else if(item.forceDisposition!=null&&typeof item.forceDisposition!=='string')throw new Error(`${book.id}: ${item.id} requires a scalar Force Disposition`);
  }
  for(const item of enhancements){
    if(!item.id)throw new Error(`${book.id}: Enhancement requires a canonical identity`);
    if(!item.title)throw new Error(`${book.id}: ${item.id} requires a title`);
    if(!item.detachmentId||!detachmentIds.has(item.detachmentId))throw new Error(`${book.id}: ${item.id} references unknown Detachment ${item.detachmentId||'(missing)'}`);
    if(typeof item.value!=='number'||!Number.isFinite(item.value))throw new Error(`${book.id}: ${item.id} requires a finite point value`);
  }
  return {schema:SCHEMA,book,dependencies:list(input.dependencies),units,alliedUnits,detachments,enhancements};
}

export function assertEffectivePointsProjection(value,bookId=''){
  if(value?.schema!==SCHEMA)throw new Error(`${bookId||'book'}: invalid effective points projection schema`);
  if(bookId&&value.book?.id!==bookId)throw new Error(`${bookId}: effective points projection belongs to ${value.book?.id||'(missing)'}`);
  return value;
}

// Resolve compatibility metadata against the same effective catalog that owns
// publication. IDs remain authoritative; normalized forms only remove known
// canonical prefixes and punctuation inside an already selected Detachment.
export function resolveEffectiveEnhancementIdentity(enhancement,catalog,contracts={}){
  const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const identity=(value,detachmentId='')=>{
    let id=String(value||'').toLowerCase().trim().replace(/^enhancement-/,''),detachment=String(detachmentId).toLowerCase().replace(/^detachment-/,''
    );
    if(detachment&&id.startsWith(`${detachment}-`))id=id.slice(detachment.length+1);
    return id.replace(/[^a-z0-9]/g,'');
  };
  const ids=item=>[item.id,item.ruleId,item.sourceId,item.legacyKey].filter(Boolean);
  const detachments=catalog.detachments.filter(item=>enhancement.detachmentId?item.id===enhancement.detachmentId:normalize(item.title)===normalize(enhancement.detachment));
  if(detachments.length!==1||!enhancement.id)return {sourceLimited:true};
  const detachment=detachments[0],matches=(item,detachmentId)=>ids(item).some(id=>identity(id,detachmentId)===identity(enhancement.id,detachmentId));
  const candidates=catalog.enhancements.filter(item=>item.detachmentId===detachment.id&&matches(item,detachment.id));
  if(candidates.length!==1)return {sourceLimited:true};
  const canonical=candidates[0],keys=new Set(ids(canonical).map(id=>identity(id,detachment.id))),exact=Object.entries(contracts).filter(([id])=>ids(canonical).includes(id));
  const related=exact.length?exact:Object.entries(contracts).filter(([id])=>keys.has(identity(id,detachment.id))),contract=related.length===1?related[0][1]:null,owned=canonical.owner||contract?.owner;
  const roles=(contract?.roles||[]).filter(role=>role.side==='friendly'&&['unit','model'].includes(role.subject)),owner=owned?.selector?owned:roles.length===1&&roles[0].selector?{subject:roles[0].subject,selector:roles[0].selector}:null,assignment=canonical.assignment||contract?.assignment,tags=canonical.tags||contract?.tags;
  return {canonicalEnhancementId:canonical.id,canonicalDetachmentId:detachment.id,...(owner?{owner}:{}),...(assignment?{assignment}:{}),...(tags?{tags}:{}),...(!owner||canonical.sourceLimited||contract?.sourceLimited?{sourceLimited:true}:{})};
}

export function resolveEffectiveEnhancementContractId(id,detachmentId,contracts={}){
  const detachment=String(detachmentId||'').toLowerCase().replace(/^detachment-/,'');
  const identity=value=>{
    let current=String(value||'').toLowerCase().trim().replace(/^enhancement-/,'');
    if(detachment&&current.startsWith(`${detachment}-`))current=current.slice(detachment.length+1);
    return current.replace(/[^a-z0-9]/g,'');
  };
  const expected=identity(id),matches=Object.keys(contracts).filter(candidate=>identity(candidate)===expected);
  const scoped=matches.filter(candidate=>String(candidate).toLowerCase().replace(/^enhancement-/,'').startsWith(`${detachment}-`));
  if(scoped.length===1)return scoped[0];
  if(scoped.length>1||matches.length>1)throw new Error(`ambiguous Enhancement contract identity: ${id}`);
  return matches[0]||null;
}

export const effectivePointsProjectionSchema=SCHEMA;
