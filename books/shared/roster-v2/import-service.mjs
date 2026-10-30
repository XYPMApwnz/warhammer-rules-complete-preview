import {parse as parseText} from './parser.mjs';
import {lexicalDraft,importNewRecruit} from './import.mjs';
import {validateRoster} from './context.mjs';
import {getRecordedSourceIdentity,registerBookSources,cloneSourceBook} from '../source-refs-v2/source-refs.mjs';

const copy=value=>structuredClone(value);
const reject=(condition,message)=>{if (!condition) throw new TypeError(message);};

/** Import-boundary names reference existing facts; they never define profiles.
 * Evidence is an existing canonical field, interpreted by the book owner. */
function importBook(book,aliases,weaponSelections,equipmentSelections,optionSelections) {
  reject(book && typeof book.bookId==='string' && Array.isArray(book.entities),'Missing canonical book');
  const view=cloneSourceBook(book),records=new Map(view.entities.map(entity=>[entity.id,entity]));
  registerBookSources(view);
  reject(records.size===view.entities.length,'Duplicate canonical identity');
  reject(Array.isArray(aliases),'Invalid import aliases');
  const evidenceField=evidence=>{
    const reference=records.get(evidence?.entityId);
    reject(reference && getRecordedSourceIdentity(reference,{book:view}) && typeof evidence.path==='string'&&evidence.path.startsWith('/'),'Missing canonical import evidence');
    let value=reference.data;
    for (const part of evidence.path.slice(1).split('/').map(part=>part.replaceAll('~1','/').replaceAll('~0','~'))) value=value?.[part];
    reject(typeof value==='string'&&value.length,'Unresolved canonical import evidence');
    return reference;
  };
  for (const binding of aliases) {
    const entity=records.get(binding?.canonicalId);
    reject(['DATASHEET','PROFILE','DETACHMENT','ENHANCEMENT'].includes(entity?.kind),'Unresolved import alias target');
    reject(Array.isArray(binding.labels) && binding.labels.length && binding.labels.every(label=>typeof label==='string'&&label.trim()),'Invalid import labels');
    const reference=evidenceField(binding.evidence);
    if (entity.kind==='PROFILE') reject(reference.parentId===entity.parentId,'Foreign profile alias evidence');
    entity.aliases=[...new Set([...(entity.aliases||[]),...binding.labels])];
  }
  reject(Array.isArray(weaponSelections),'Invalid import weapon bindings');
  for (const binding of weaponSelections) {
    const owner=records.get(binding?.ownerId);
    reject(owner?.kind==='DATASHEET' && typeof binding.label==='string'&&binding.label.trim(),'Invalid import weapon owner/label');
    reject(Array.isArray(binding.canonicalProfileIds)&&binding.canonicalProfileIds.length>0&&new Set(binding.canonicalProfileIds).size===binding.canonicalProfileIds.length,'Invalid import weapon profiles');
    for (const id of binding.canonicalProfileIds) reject(records.get(id)?.kind==='WEAPON_PROFILE'&&records.get(id).parentId===owner.id&&owner.data.weaponIds.includes(id),'Foreign import weapon profile');
    reject(Array.isArray(binding.evidence)&&binding.evidence.length>0,'Missing import weapon evidence');
    for (const evidence of binding.evidence) reject(evidenceField(evidence).parentId===owner.id,'Foreign import weapon evidence');
  }
  reject(Array.isArray(equipmentSelections)&&Array.isArray(optionSelections),'Invalid import selection metadata');
  for(const binding of equipmentSelections) {
    reject(records.get(binding.ownerId)?.kind==='DATASHEET'&&typeof binding.label==='string'&&binding.label.trim(),'Invalid equipment binding owner/label');
    reject(Array.isArray(binding.canonicalEquipmentIds)&&binding.canonicalEquipmentIds.length>0,'Missing selected equipment identities');
    for(const id of binding.canonicalEquipmentIds) {
      const item=records.get(id),paths=binding.canonicalFieldPaths?.[id];
      reject(item?.parentId===binding.ownerId&&['WARGEAR_OPTION','WARGEAR_FOOTNOTE','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE','UNIT_COMPOSITION'].includes(item.kind),'Foreign selected equipment');
      reject(Array.isArray(paths)&&paths.length>0,'Missing equipment selection address');
      for(const path of paths)evidenceField({entityId:id,path});
    }
    reject(Array.isArray(binding.evidence)&&binding.evidence.length>0,'Missing equipment evidence');
    for(const evidence of binding.evidence)reject(evidenceField(evidence).parentId===binding.ownerId,'Foreign equipment evidence');
  }
  for(const binding of optionSelections) {
    const option=records.get(binding.canonicalOptionId);
    reject(option?.kind==='UPGRADE_OPTION'&&typeof binding.label==='string'&&binding.label.trim(),'Unresolved canonical option');
    reject(/^selected[A-Z]\w*Ids?$/.test(binding.selectionField)&&['ONE','MANY'].includes(binding.selectionCardinality),'Invalid canonical option field/cardinality');
    reject(Boolean(binding.ownerId)!==Boolean(binding.detachmentId),'Option requires one canonical selection context');
    const contextId=binding.ownerId||binding.detachmentId;
    reject(records.get(contextId)?.kind===(binding.ownerId?'DATASHEET':'DETACHMENT'),'Invalid option context');
    let ancestor=option;const visited=new Set();
    while(ancestor&&ancestor.id!==contextId&&!visited.has(ancestor.id)){visited.add(ancestor.id);ancestor=records.get(ancestor.parentId);}
    reject(ancestor?.id===contextId,'Foreign canonical option context');
    if(binding.exclusiveGroupId)reject(option.parentId===binding.exclusiveGroupId,'Foreign exclusive canonical selection group');
    reject(Array.isArray(binding.evidence)&&binding.evidence.length>0,'Missing option evidence');
    for(const evidence of binding.evidence)evidenceField(evidence);
  }
  return view;
}

/** Import-only boundary. No effect projection, battle state or attachment edits.
 * Callers get the same canonical UNIT_INSTANCE snapshot used by Roster V2. */
export function createRosterImportService(book,{parse=parseText,identityAliases=[],weaponSelections=[],equipmentSelections=[],optionSelections=[],deferredUnits=[]}={}) {
  registerBookSources(book);
  const canonical=copy(book),declaredSelections=copy(weaponSelections),equipment=copy(equipmentSelections),options=copy(optionSelections),deferred=copy(deferredUnits),view=importBook(canonical,identityAliases,declaredSelections,equipment,options);
  let state=null;
  const service={
    get state(){return state?copy(state):null;},
    draft:text=>lexicalDraft(text,parse),
    import(text,bindings) {
      const result=importNewRecruit(text,{parse,bindings,book:view,weaponSelections:declaredSelections,equipmentSelections:equipment,optionSelections:options,deferredUnits:deferred});
      if (result.status==='READY') service.load(result.roster);
      return result;
    },
    load(snapshot) {
      // This stage cannot accept an attachment/effect snapshot from a later
      // runtime. Neither imported Enhancements nor Detachments execute here.
      reject(Array.isArray(snapshot?.attachments)&&snapshot.attachments.length===0,'Import-only snapshot cannot contain attachments');
      const verified=validateRoster(canonical,snapshot,[]);
      // Backup values are checked independently of selection-row presence.
      // Book metadata supplies the output fields, cardinality and ownership;
      // no army-specific choice names participate in validation.
      for(const unit of verified.units)for(const name of Object.keys(unit).filter(key=>/^selected[A-Z]\w*Ids?$/.test(key))) {
        const declarations=options.filter(item=>item.selectionField===name),cardinality=declarations[0]?.selectionCardinality;
        reject(cardinality&&declarations.every(item=>item.selectionCardinality===cardinality),'Unknown canonical option field/cardinality');
        const value=unit[name],ids=cardinality==='ONE'?[value]:value;
        reject(Array.isArray(ids)&&new Set(ids).size===ids.length,'Invalid selected canonical options');
        const selected=ids.map(id=>declarations.find(item=>item.canonicalOptionId===id&&
          (item.ownerId===unit.canonicalUnitId||verified.detachmentIds.includes(item.detachmentId))));
        reject(selected.every(Boolean),'Unresolved selected canonical option ownership');
        for(const group of new Set(selected.map(item=>item.exclusiveGroupId).filter(Boolean)))
          reject(selected.filter(item=>item.exclusiveGroupId===group).length<=1,'Contradictory exclusive canonical options');
      }
      state=verified;
      return service.state;
    },
    snapshot(){reject(state,'No imported roster');return copy(state);}
  };
  return service;
}
