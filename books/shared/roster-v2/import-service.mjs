import {parse as parseText} from './parser.mjs';
import {lexicalDraft,importNewRecruit} from './import.mjs';
import {validateRoster} from './context.mjs';

const copy=value=>structuredClone(value);
const reject=(condition,message)=>{if (!condition) throw new TypeError(message);};

/** Import-boundary names reference existing facts; they never define profiles.
 * Evidence is an existing canonical field, interpreted by the book owner. */
function importBook(book,aliases,weaponSelections) {
  reject(book && typeof book.bookId==='string' && Array.isArray(book.entities),'Missing canonical book');
  const view=copy(book),records=new Map(view.entities.map(entity=>[entity.id,entity]));
  reject(records.size===view.entities.length,'Duplicate canonical identity');
  reject(Array.isArray(aliases),'Invalid import aliases');
  const evidenceField=evidence=>{
    const reference=records.get(evidence?.entityId);
    reject(reference && reference.provenance?.sourceId && typeof evidence.path==='string'&&evidence.path.startsWith('/'),'Missing canonical import evidence');
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
  return view;
}

/** Import-only boundary. No effect projection, battle state or attachment edits.
 * Callers get the same canonical UNIT_INSTANCE snapshot used by Roster V2. */
export function createRosterImportService(book,{parse=parseText,identityAliases=[],weaponSelections=[]}={}) {
  const canonical=copy(book),declaredSelections=copy(weaponSelections),view=importBook(canonical,identityAliases,declaredSelections);
  let state=null;
  const service={
    get state(){return state?copy(state):null;},
    draft:text=>lexicalDraft(text,parse),
    import(text,bindings) {
      const result=importNewRecruit(text,{parse,bindings,book:view,weaponSelections:declaredSelections});
      if (result.status==='READY') service.load(result.roster);
      return result;
    },
    load(snapshot) {
      // This stage cannot accept an attachment/effect snapshot from a later
      // runtime. Neither imported Enhancements nor Detachments execute here.
      reject(Array.isArray(snapshot?.attachments)&&snapshot.attachments.length===0,'Import-only snapshot cannot contain attachments');
      const verified=validateRoster(canonical,snapshot,[]);
      state=verified;
      return service.state;
    },
    snapshot(){reject(state,'No imported roster');return copy(state);}
  };
  return service;
}
