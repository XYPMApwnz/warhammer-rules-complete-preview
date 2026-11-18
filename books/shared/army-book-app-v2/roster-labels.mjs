/** Physical display names only. Never merge units or infer missing composition. */
export function rosterUnitNames(state,titleForId) {
  const peers=new Map();
  for(const unit of state.units||[]){
    const list=peers.get(unit.canonicalUnitId)||[];list.push(unit);peers.set(unit.canonicalUnitId,list);
  }
  const composition=unit=>{
    const rows=unit.modelRows||[];
    if(rows.length&&rows.every(row=>row.canonicalProfileId&&Number.isInteger(row.quantity)&&row.quantity>0)){
      const quantities=new Map();
      for(const row of rows)quantities.set(row.canonicalProfileId,(quantities.get(row.canonicalProfileId)||0)+row.quantity);
      const sorted=[...quantities].sort(([a],[b])=>a.localeCompare(b));
      return {key:JSON.stringify(sorted),count:rows.reduce((sum,row)=>sum+row.quantity,0),profiles:sorted};
    }
    return Number.isInteger(unit.startingStrength)&&unit.startingStrength>0
      ?{key:'strength:'+unit.startingStrength,count:unit.startingStrength}:null;
  };
  return new Map((state.units||[]).map(unit=>{
    const copies=peers.get(unit.canonicalUnitId),title=titleForId(unit.canonicalUnitId)||'Imported unit';
    if(copies.length===1)return [unit.instanceId,title];
    const shape=composition(unit);
    if(!shape)return [unit.instanceId,`${title} #${copies.indexOf(unit)+1}`];
    const identical=copies.filter(copy=>composition(copy)?.key===shape.key);
    const differentShapeAtSameSize=copies.some(copy=>{const other=composition(copy);return other?.count===shape.count&&other.key!==shape.key;});
    // Identical one-MODEL copies need only their physical ordinal. Keep the
    // composition label whenever it distinguishes different MODEL profiles.
    if(shape.count===1&&!differentShapeAtSameSize&&identical.length>1)
      return [unit.instanceId,`${title} #${identical.indexOf(unit)+1}`];
    const profiles=differentShapeAtSameSize?shape.profiles?.map(([id,quantity])=>{const name=titleForId(id);return name?`${quantity} ${name}`:null;}):null;
    const size=profiles?.every(Boolean)?profiles.join(', '):`${shape.count} ${shape.count===1?'model':'models'}`;
    return [unit.instanceId,`${title} (${size})${identical.length>1?' #'+(identical.indexOf(unit)+1):''}`];
  }));
}

/** The published source explicitly labels these records, without target inference. */
export function coreStratagemCards(cards) {
  return [...cards.values()].filter(card=>card.domain==='CORE'&&card.kind==='CORE_MAIN_RULE'&&
    card.fields.some(field=>field.source?.path==='/semanticContent'&&String(field.value).split('\n').some(line=>line.trim()==='Core Stratagem')));
}
