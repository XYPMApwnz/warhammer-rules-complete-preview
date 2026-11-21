import {requiredKeywordField} from '../keyword-values.mjs';
const keys=['canLead','canSupport','canBeLedBy','canBeSupportedBy'];
const inverse={leader:['canLead','canBeLedBy'],support:['canSupport','canBeSupportedBy']};

const edgeKey=edge=>`${edge.role}\0${edge.sourceId}\0${edge.targetId}`;
const stableId=value=>typeof value==='string'&&value.length>0&&value.trim()===value;

export function applyDependencyRelationAdds({bookId='book',inheritedUnits=[],effectiveUnits=[],edges=[],adds=[]}){
  if(!Array.isArray(adds))throw new Error(`${bookId}: dependency relationAdds must be an array`);
  if(adds.length===0)return edges;
  const baseEdges=new Set(edges.map(edgeKey)),overlayEdges=new Set(),result=[...edges];
  for(const [index,record] of adds.entries()){
    const label=`${bookId}: dependency relation ADD ${index+1}`;
    if(!record||typeof record!=='object'||Array.isArray(record))throw new Error(`${label} must be an object`);
    if(Object.hasOwn(record,'operation'))throw new Error(`${label} must use implicit ADD; explicit operations are unsupported`);
    const {sourceId,role,targetId}=record;
    if(!stableId(sourceId))throw new Error(`${label} requires a stable sourceId`);
    if(!stableId(targetId))throw new Error(`${label} requires a stable targetId`);
    if(!Object.hasOwn(inverse,role))throw new Error(`${label} has unsupported relation role ${role}`);
    const sourceMatches=inheritedUnits.filter(unit=>unit.id===sourceId);
    if(sourceMatches.length===0)throw new Error(`${label} source ${sourceId} is not provided by a declared dependency`);
    if(sourceMatches.length!==1)throw new Error(`${label} source ${sourceId} is ambiguous across declared dependencies`);
    const targetMatches=effectiveUnits.filter(unit=>unit.id===targetId);
    if(targetMatches.length===0)throw new Error(`${label} target ${targetId} is not in the final effective inventory`);
    if(targetMatches.length!==1)throw new Error(`${label} target ${targetId} is ambiguous in the final effective inventory`);
    const key=edgeKey(record);
    if(baseEdges.has(key))throw new Error(`${label} duplicates an existing direct relation ${sourceId} -> ${targetId}`);
    if(overlayEdges.has(key))throw new Error(`${label} duplicates another dependency relation ADD ${sourceId} -> ${targetId}`);
    overlayEdges.add(key);
    result.push({role,sourceId,targetId});
  }
  return result;
}

export function buildRelationGraphs(units,edges,options=null){
  const graphEdges=options?.adds?.length?applyDependencyRelationAdds({...options,edges}):edges;
  const constraintByEdge=new Map();
  for(const constraint of options?.attachmentGroupConstraints||[])for(const sourceId of constraint.sourceUnitIds||[]){
    const key=edgeKey({role:constraint.role,sourceId,targetId:constraint.targetUnitId});
    if(constraintByEdge.has(key))throw new Error(`Duplicate attachment-group constraint for ${constraint.role} ${sourceId} -> ${constraint.targetUnitId}`);
    constraintByEdge.set(key,constraint);
  }
  const byId=new Map(units.map(unit=>[unit.id,unit]));
  const graphs=new Map(units.map(unit=>[unit.id,Object.fromEntries(keys.map(key=>[key,[]]))]));
  const seen=new Set(),usedConstraints=new Set();
  for(const edge of graphEdges){
    const pair=inverse[edge.role];
    if(!pair)throw new Error(`Unsupported relation role: ${edge.role}`);
    const source=byId.get(edge.sourceId),target=byId.get(edge.targetId);
    if(!source||!target)throw new Error(`Unknown relation: ${edge.sourceId} -> ${edge.targetId}`);
    const id=`${edge.role}\0${source.id}\0${target.id}`;
    if(seen.has(id))continue;seen.add(id);
    const constraint=constraintByEdge.get(id);
    if(constraint)usedConstraints.add(id);
    const fact=(unit,mandatory)=>({unitId:unit.id,keywords:requiredKeywordField(unit)||[],characterCount:(requiredKeywordField(unit)||[]).some(value=>String(value).toUpperCase()==='CHARACTER')?1:0,...(edge.removeKeywords?.length?{removeKeywords:edge.removeKeywords}: {}),...(mandatory?{mandatory:true}: {}),...(constraint?{attachmentGroupConstraint:structuredClone(constraint)}:{})});
    graphs.get(source.id)[pair[0]].push(fact(target,edge.mandatory===true));
    graphs.get(target.id)[pair[1]].push(fact(source,false));
  }
  for(const key of constraintByEdge.keys())if(!usedConstraints.has(key))throw new Error(`Attachment-group constraint has no canonical relation edge: ${key.replaceAll('\0',' -> ')}`);
  const maxCharacters=unitId=>{
    const graph=graphs.get(unitId),unit=byId.get(unitId);
    return ((requiredKeywordField(unit)||[]).some(value=>String(value).toUpperCase()==='CHARACTER')?1:0)
      +(graph.canBeLedBy.length?1:0)+(graph.canBeSupportedBy.length?1:0);
  };
  for(const [unitId,graph] of graphs){
    for(const key of keys)for(const relation of graph[key]){
      const bodyguardId=key==='canLead'||key==='canSupport'?relation.unitId:unitId;
      relation.maxCharacters=maxCharacters(bodyguardId);
    }
    for(const key of keys)graph[key].sort((a,b)=>a.unitId.localeCompare(b.unitId));
  }
  return graphs;
}
