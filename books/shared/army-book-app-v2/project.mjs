/** Disposable presentation projection. No source parsing, gameplay execution or book branches. */
import {normalizeProfilePresentation} from './profile-projection.mjs';
const pointer = path => '/' + path.map(v => String(v).replace(/~/g, '~0').replace(/\//g, '~1')).join('/');
const human = value => String(value).replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
const omit = new Set(['order','sourceOrder','class','filterId','detachmentCode','url','sourceBadges','profileIds','weaponIds','sectionIds','wargearOptionIds','ruleReferenceIds','rawFactIds','componentIds','ruleId','enhancementIds','stratagemIds','visuals','flavor','sourceUpdateIds','tableSourceOccurrences']);
const centralOmit = new Set(['id','recordType','factionId','armyBookId','aliases','references','provenance','unitReferenceId','pricingGroupId','unitPointRecordId','sourceUnitPointRecordId','sourceUnitReferenceId','detachmentId','armyDetachmentId','armyEnhancementId','ownerId','armyOwnerId','mfmForceDispositionIds','missionForceDispositionIds','enhancementCostIds','qualifierIds','rawMfmTargetUnitReferenceIds']);
const labels = {M:'Move',T:'Toughness',SV:'Save',W:'Wounds',LD:'Leadership',OC:'Objective Control',INSV:'Invulnerable Save',cp:'CP',ap:'AP',skill:'Hit',attacks:'Attacks',strength:'Strength',range:'Range',damage:'Damage',scope:'Scope',text:'Rule',value:'Points',minModels:'Minimum models',maxModels:'Maximum models',minCopies:'Minimum copies',maxCopies:'Maximum copies',sourceLabel:'Applies to',detachmentPoints:'Detachment Points',targetUnitReferenceIds:'Eligible unit',sourceId:'Character',targetId:'Bodyguard',qualification:'Qualification',role:'Relation'};

export function projectArmyBook(model, ownedRecords, metadata) {
  const entities = new Map(model.entities.map(e => [e.id,e]));
  if (entities.size !== model.entities.length) throw new Error('Duplicate canonical entity');
  const cards = new Map(), manifest = [], fieldIds = new Set();
  const title = e => e.data?.title || e.data?.name || e.label || human(e.kind || e.recordType);
  for (const e of model.entities) cards.set(e.id,{id:e.id,kind:e.kind,title:title(e),parentId:e.parentId,contextId:e.parentId||e.id,source:{entityId:e.id},children:[],fields:[],links:[]});
  const contexts = new Map();
  for (const key of ['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings']) for (const b of model.mfm[key]) contexts.set(b.mfmRecordId,b.entityId);
  for (const r of model.mfm.relations) if (r.mfmRecordId) contexts.set(r.mfmRecordId,r.sourceId);
  for (const [id,r] of ownedRecords) for (const child of [...(r.qualifierIds||[]),...(r.enhancementCostIds||[])]) if (!contexts.has(child)) contexts.set(child,contexts.get(id));
  for (const [id,r] of ownedRecords) cards.set(id,{id,kind:r.recordType,title:r.label,parentId:contexts.get(id),contextId:contexts.get(id),source:{entityId:id},children:[],fields:[],links:[]});
  const unitReferences = new Map(model.mfm.unitBindings.map(b => [ownedRecords.get(b.mfmRecordId).unitReferenceId,b.entityId]));
  const centralOwnerRefs = new Map(model.mfm.enhancementBindings.map(b => [b.armyEnhancementId,b.entityId]));
  const resolveDisplay = id => cards.has(id) ? id : unitReferences.get(id) || centralOwnerRefs.get(id);
  const add = (cardId,entityId,path,value,contextId,ownerType) => {
    const id = `${entityId}::${pointer(path)}`;
    if (fieldIds.has(id)) throw new Error(`Duplicate presentation field ${id}`);
    fieldIds.add(id);
    const card = cards.get(cardId);
    if (!card) throw new Error(`Missing presentation owner ${cardId}`);
    const key = path.at(-1), label = labels[key] || human(typeof key==='number' ? path.at(-2) : key);
    const field = {id,label,value:structuredClone(value),type:'text',contextId,source:{entityId,path:pointer(path)}};
    if (path.length===1 && (key==='title'||key==='name'||ownerType==='CENTRALIZED_MFM'&&key==='label')) field.presentation='heading';
    const reference = typeof value==='string' && resolveDisplay(value);
    if (reference) {field.type='reference';field.targetIds=[reference];field.displayValue=cards.get(reference).title;}
    if (typeof value==='boolean' && key==='wargearAbility') field.displayValue=value ? 'Wargear ability' : 'Datasheet ability';
    if (Array.isArray(value) && !value.length) field.displayValue=key==='abilities' ? 'No weapon abilities' : 'None';
    if (card.kind==='PROFILE' || card.kind==='WEAPON_PROFILE' && ['range','attacks','skill','strength','ap','damage'].includes(key)) field.presentation='stat';
    if (path.includes('keywords')||path.includes('factionKeywords')||path.includes('abilities')) field.type='tokens';
    if (path[0]==='lines' && key==='text') {
      field.label=entities.get(entityId).data.lines[path[1]].label;
      field.captionFactId=`${entityId}::${pointer(['lines',path[1],'label'])}`;
    }
    if (path[0]==='lines' && key==='label') field.presentation='caption';
    if (path[0]==='table'||path[0]==='tables' && path[2]==='rows') {
      const prefix=path[0]==='table'?['table']:['tables',path[1],'rows'];
      field.presentation='table-cell';field.table={id:`${entityId}::${pointer(prefix)}`,row:path.at(-2),column:path.at(-1),columnLabel:`Column ${Number(path.at(-1))+1}`};
    }
    card.fields.push(field);
    manifest.push({id,entityId,path:[...path],value:structuredClone(value),cardId,contextId,ownerType});
  };
  const walk = (cardId,entityId,value,path,contextId,central=false) => {
    if (path.length===1 && (central ? centralOmit : omit).has(path[0])) return;
    if (!central && (path[0]==='tables' && path.at(-1)==='sourceId' || path[0]==='clauses' && path.at(-1)==='sourceLeafId')) return;
    if (Array.isArray(value)) {
      if (!value.length) { if (['abilities','targetUnitReferenceIds'].includes(path.at(-1))) add(cardId,entityId,path,value,contextId,central?'CENTRALIZED_MFM':'CANONICAL_V2'); }
      else value.forEach((v,i)=>walk(cardId,entityId,v,[...path,i],contextId,central));
    } else if (value!==null && typeof value==='object') for (const [k,v] of Object.entries(value)) walk(cardId,entityId,v,[...path,k],contextId,central);
    else add(cardId,entityId,path,value,contextId,central?'CENTRALIZED_MFM':'CANONICAL_V2');
  };
  for (const e of model.entities) walk(e.id,e.id,e.data,[],e.parentId||e.id);
  // Effective qualifications remain on their original entity owner. Confirmation
  // identities/verified field lists are provenance, not additional gameplay facts.
  for (const e of model.entities) for (const [i,q] of (e.qualifications||[]).entries()) for (const [key,value] of Object.entries(q.value)) {
    if (['qualificationId','faqId','verifiedFields'].includes(key)) continue;
    walk(e.id,e.id,value,['qualifications',i,'value',key],e.parentId||e.id);
  }
  for (const [id,r] of ownedRecords) walk(id,id,r,[],contexts.get(id),true);
  for (const [i,r] of model.mfm.relations.entries()) for (const key of ['role','sourceId','targetId','qualification']) if (Object.hasOwn(r,key)) add(r.sourceId,model.bookId,['mfm','relations',i,key],r[key],r.sourceId,r.owner);
  for (const binding of model.mfm.eligibilityEvidenceBindings) cards.get(binding.sourceEntityId).note='Base source evidence for eligibility. Current eligibility is listed in the current MFM relations on the Character datasheet.';
  for (const card of cards.values()) if (card.parentId) {
    if (!cards.has(card.parentId)) throw new Error(`Unresolved canonical parent ${card.parentId}`);
    cards.get(card.parentId).children.push(card.id);
  }
  const groups = [
    ['introduction','Introduction',['BOOK_USAGE_RULES']],['army-rules','Army Rules',['ARMY_RULE']],
    ['datasheets','Datasheets',['DATASHEET']],['detachments','Detachments',['DETACHMENT']],['updates','GW Updates',['SOURCE_ERRATUM']]
  ].map(([id,label,kinds])=>({id,label,itemIds:[...cards.values()].filter(c=>kinds.includes(c.kind)).map(c=>c.id)}));
  return normalizeProfilePresentation(model,{schema:'army-book-app-v2/presentation',book:{id:model.bookId,...metadata,currentness:`${model.currentness.currentness} · ${model.currentness.lastReconciledSource}`,mfmVersion:model.mfm.source.label},groups,cards:[...cards.values()],factManifest:manifest});
}
