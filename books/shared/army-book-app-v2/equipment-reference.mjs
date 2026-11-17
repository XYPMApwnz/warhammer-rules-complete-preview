/** Read-only navigation from selected equipment to explicitly bound rule text.
 * Native contracts supply the relationship; no condition or effect is run here.
 */
const validPath=path=>Array.isArray(path)&&path.length>0&&path.every(part=>
  typeof part==='string'&&part.length>0||Number.isSafeInteger(part)&&part>=0);
const pointer=path=>'/'+path.map(part=>String(part).replaceAll('~','~0').replaceAll('/','~1')).join('/');
const at=(data,path)=>{
  let value=data;
  for(const part of path){if(value===null||typeof value!=='object'||!Object.hasOwn(value,part))return undefined;value=value[part];}
  return value;
};

export function createEquipmentReferenceResolver({cards,rules}){
  if(!(cards instanceof Map)||!(rules instanceof Map))throw new TypeError('Equipment references require canonical card and native rule maps');
  const byUnit=new Map();
  const add=(rule,clause,equipmentId,path)=>{
    if(typeof rule.parentId!=='string'||typeof equipmentId!=='string'||path!==undefined&&!validPath(path))return;
    if(!byUnit.has(rule.parentId))byUnit.set(rule.parentId,new Map());
    const equipment=byUnit.get(rule.parentId),rows=equipment.get(equipmentId)||[];
    rows.push({rule,clause,path:path===undefined?null:pointer(path)});equipment.set(equipmentId,rows);
  };
  for(const rule of rules.values())for(const clause of rule.ruleContract?.clauses||[]){
    const requirement=clause.canonicalEquipmentRequirement;
    if(requirement)add(rule,clause,requirement.entityId,requirement.field);
    for(const effect of clause.rosterEffects||[]){
      const requirement=effect.equipmentRequirement;
      if(requirement?.binding==='SOURCE'&&requirement.kind==='EQUIPMENT_PRESENT')
        add(rule,clause,requirement.equipmentId,requirement.sourceFieldPath);
    }
  }
  function resolve(unitId,itemId,selection){
    if(typeof unitId!=='string'||typeof itemId!=='string'||!Array.isArray(selection?.canonicalEquipmentIds)||
      !selection.canonicalEquipmentIds.includes(itemId))return [];
    const result=new Map();
    for(const {rule,clause,path}of byUnit.get(unitId)?.get(itemId)||[]){
      if(rule.parentId!==unitId)continue;
      if(path&&!(selection.canonicalFieldPaths?.[itemId]||[]).includes(path)&&
        !(selection.sourceReferences||[]).some(reference=>reference.entityId===itemId&&reference.path===path))continue;
      const owner=cards.get(rule.id);
      if(!owner||owner.parentId!==unitId||!Array.isArray(owner.fields))continue;
      for(const sourcePath of clause.sourceFields||[]){
        if(!validPath(sourcePath)||!['text','semanticContent'].includes(sourcePath.at(-1)))continue;
        const path=pointer(sourcePath),value=at(rule.data,sourcePath);
        if(typeof value!=='string'||!value.trim())continue;
        for(const effect of owner.fields)if(typeof effect.id==='string'&&effect.source?.entityId===rule.id&&typeof effect.value==='string'&&effect.value===value&&
          (effect.source?.path===path||effect.presentationPath===path))result.set(effect.id,{owner,effect});
      }
    }
    return [...result.values()];
  }
  return Object.freeze({resolve});
}
