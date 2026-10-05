/** Disposable presentation views. Roster services own eligibility and effects. */
const clone = value => structuredClone(value);
const assert = (value, message) => { if (!value) throw new TypeError(message); };
export const instanceRoute = id => `roster-unit/${encodeURIComponent(id)}`;
export function projectPersonalBook(payload, state) {
  assert(state?.units?.length && state.detachmentIds?.length, 'No imported roster');
  const cards = new Map(payload.cards.map(card => [card.id,card]));
  const detachments = new Set(state.detachmentIds), enhancements = new Set(state.units.flatMap(unit=>unit.enhancementIds));
  const units = new Set(state.units.map(unit=>unit.canonicalUnitId)), allowedIds = new Set();
  const permitted = card => card && (card.kind!=='DETACHMENT' || detachments.has(card.id)) &&
    (card.kind!=='ENHANCEMENT' || enhancements.has(card.id)) &&
    (card.kind!=='DATASHEET' || units.has(card.id)) &&
    (!['STRATAGEM','DETACHMENT_RULE'].includes(card.kind) || detachments.has(card.parentId));
  const visit = id => { const card=cards.get(id); if (!permitted(card) || allowedIds.has(id)) return;
    allowedIds.add(id); (card.children || []).forEach(visit); };
  const roots = payload.cards.filter(card=>card.kind==='ARMY_RULE').map(card=>card.id);
  [...roots,...detachments,...units].forEach(visit);
  for (const id of [...detachments,...enhancements,...units]) assert(allowedIds.has(id),'Unresolved personal book identity: '+id);
  const copies = new Map();
  state.units.forEach(unit=>{const list=copies.get(unit.canonicalUnitId)||[];list.push(unit.instanceId);copies.set(unit.canonicalUnitId,list);});
  const instances=state.units.map(unit=>({id:unit.canonicalUnitId,instanceId:unit.instanceId,route:instanceRoute(unit.instanceId),
    title:cards.get(unit.canonicalUnitId).title+(copies.get(unit.canonicalUnitId).length>1?` #${copies.get(unit.canonicalUnitId).indexOf(unit.instanceId)+1}`:'')}));
  const entries = ids => [...ids].map(id=>({id,title:cards.get(id).title,route:id}));
  return {allowedIds,instances,groups:[
    {id:'army-rules',label:'Army Rules',entries:entries(roots)},
    {id:'detachments',label:'Detachments',entries:entries(detachments)},
    {id:'enhancements',label:'Enhancements',entries:entries(enhancements)},
    {id:'datasheets',label:'Datasheets',entries:instances}
  ].filter(group=>group.entries.length)};
}
/** Overlay values by canonical field address, never display title. Multiple
 * composition scopes retain separate variants of the SAME canonical profile. */
export function projectInstanceCards(cards, unit, effective) {
  assert(effective.instanceId===unit.instanceId && effective.canonicalUnitId===unit.canonicalUnitId,'Wrong physical projection');
  const variants=new Map(), root=clone(cards.get(unit.canonicalUnitId));
  assert(root?.kind==='DATASHEET','Unresolved canonical datasheet');
  const scopeCaptions=new Map();
  unit.modelRows.forEach((row,index)=>{
    if(row.compositionScope!=='MODEL_ROW')return;
    const label=typeof row.presentationLabel==='string'&&row.presentationLabel.trim()
      ?row.presentationLabel:'Composition group '+(index+1);
    const profileScope=`${unit.instanceId}/${row.rowId}/PROFILE/${row.rowId}`;
    const profile=effective.profiles.find(item=>item.scopeId===profileScope);
    if(profile)scopeCaptions.set(profileScope,{label,quantity:profile.quantity});
    (row.loadouts||[]).forEach((loadout,loadoutIndex)=>{
      const scopeId=`${unit.instanceId}/${row.rowId}/LOADOUT/${loadout.loadoutId}`;
      const profile=effective.profiles.find(item=>item.scopeId===scopeId);
      if(profile)scopeCaptions.set(scopeId,{
        label:row.loadouts.length>1||scopeCaptions.has(profileScope)?`${label} · Loadout ${loadoutIndex+1}`:label,quantity:profile.quantity
      });
    });
  });
  const annotate = (card, scope) => ({...clone(card),instanceId:unit.instanceId,scopeId:scope || null});
  const overlay = (record, source) => {
    const base=cards.get(record.id);assert(base,'Unresolved effective profile: '+record.id);
    const card=annotate(base,record.scopeId), values=new Map(record.fields.map(field=>[field.label,field.value]));
    if(scopeCaptions.has(record.scopeId))card.presentationScope=clone(scopeCaptions.get(record.scopeId));
    card.fields=card.fields.flatMap(field=> {
      const path=field.source?.path || '', parts=path.slice(1).split('/');
      if (!values.has(parts[0])) return [field];
      const value=values.get(parts[0]);
      if (Array.isArray(value)) return []; // Reproject the entire typed array below.
      if (parts.length!==1) return [field];
      return [{...field,value:clone(value),displayValue:undefined,runtimeDerived:true}];
    });
    for (const [key,value] of values) if (Array.isArray(value)) {
      const template=base.fields.find(field=>field.source?.path.startsWith('/'+key+'/'));
      if (!value.length) card.fields.push({...(base.fields.find(field=>field.source?.path==='/'+key) || {label:key,type:'text'}),
        id:`${base.id}::/${key}`,value:[],displayValue:'None',contextId:base.contextId,
        source:{entityId:base.id,path:`/${key}`},runtimeDerived:true});
      value.forEach((item,index)=>card.fields.push({...(template || {label:key,type:'tokens'}),
        id:`${base.id}::/${key}/${index}`,value:clone(item),displayValue:undefined,
        contextId:base.contextId,source:{entityId:base.id,path:`/${key}/${index}`},runtimeDerived:true}));
    }
    if (source==='PROFILE') {
      card.rosterAbilities=clone(record.abilities || []);card.rosterMetrics=clone(record.metrics || {});card.rosterQuantity=record.quantity;
      const derivedField=(path,label,value,displayValue)=>({id:`${base.id}::/${path}`,label,type:'text',value:clone(value),displayValue,
        contextId:base.contextId,source:{entityId:base.id,path:`/${path}`},runtimeDerived:true});
      card.rosterAbilities.forEach((ability,index)=>card.fields.push(derivedField(`rosterAbilities/${index}`,`${ability.name}: `,ability,
        ability.value===undefined?ability.name:`${ability.value}+`)));
      const metricLabels={contagionRange:'Contagion Range',detectionRange:'Detection Range'};
      for (const [key,metric] of Object.entries(card.rosterMetrics)) {
        assert(Object.hasOwn(metricLabels,key),'Unsupported effective metric presentation: '+key);
        card.fields.push(derivedField(`rosterMetrics/${key}`,metricLabels[key],metric,
          `${metric.modifier>=0?'+':''}${metric.modifier}"${metric.max===undefined?'':` (maximum ${metric.max}")`}`));
      }
    }
    else card.rosterQuantity=record.physicalQuantity;
    return card;
  };
  for (const kind of ['PROFILE','WEAPON_PROFILE']) {
    const records=kind==='PROFILE'?effective.profiles:effective.weapons;
    for (const id of root.children.filter(id=>cards.get(id)?.kind===kind)) variants.set(id,[]);
    for (const record of records) { const list=variants.get(record.id)||[];list.push(overlay(record,kind));variants.set(record.id,list); }
  }
  const selections=[...(unit.selections || []),...unit.modelRows.flatMap(row=>[...(row.selections||[]),...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])];
  const selectedEquipment=new Set(selections.filter(selection=>selection.physicalQuantity>0).flatMap(selection=>selection.canonicalEquipmentIds));
  const selectedSourceFields=new Set(selections.filter(selection=>selection.physicalQuantity>0)
    .flatMap(selection=>(selection.sourceReferences || []).map(ref=>JSON.stringify([ref.entityId,ref.path]))));
  for (const id of root.children) {
    const section=cards.get(id);if (section?.kind!=='DATASHEET_SECTION') continue;
    const optionalBlocks=(section.fields || []).filter(field=>field.value===true && /^\/blocks\/\d+\/wargearAbility$/.test(field.source?.path || ''));
    if (!optionalBlocks.length) continue;
    const omitted=optionalBlocks.filter(field=>!selectedSourceFields.has(JSON.stringify([id,field.source.path.replace(/wargearAbility$/,'text')]))).map(field=>field.source.path.replace(/wargearAbility$/,''));
    const projected=annotate(section);projected.fields=projected.fields.filter(field=>!omitted.some(prefix=>field.source?.path.startsWith(prefix)));
    variants.set(id,projected.fields.some(field=>field.presentation!=='heading')?[projected]:[]);
  }
  root.children=root.children.filter(id=>!variants.has(id)||variants.get(id).length)
    .filter(id=>cards.get(id)?.kind!=='WARGEAR_OPTION'||selectedEquipment.has(id));
  const firstKeyword=root.fields.find(field=>field.source?.path.startsWith('/keywords/'));
  root.fields=root.fields.filter(field=>!field.source?.path.startsWith('/keywords/'));
  effective.keywords.forEach((keyword,index)=>root.fields.push({...firstKeyword,id:`${root.id}::/keywords/${index}`,
    label:'Effective unit keywords',type:'tokens',value:keyword,contextId:root.contextId,
    source:{entityId:root.id,path:`/keywords/${index}`},runtimeDerived:true}));
  variants.set(root.id,[annotate(root)]);
  return variants;
}
