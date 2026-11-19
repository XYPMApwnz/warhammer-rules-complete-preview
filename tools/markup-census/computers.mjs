/** Reach actual dispatch cases without guessing roster facts or their results. */
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {inventoryFingerprint} from './native-inventory.mjs';
const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));

export async function probeConditionComputers({inventory,root=defaultRoot,compute,bind}={}){
 compute??=(await import(pathToFileURL(path.join(root,'books/shared/roster-v2/condition-computations.mjs')))).computeRosterCondition;
 bind??=(await import(pathToFileURL(path.join(root,'books/shared/roster-v2/condition-binding.mjs')))).createRosterConditionBinding;
 if(typeof compute!=='function')throw new TypeError('Markup census MISSING_COMPUTER: computeRosterCondition export is absent');
 const kinds=[...new Set(inventory.rows.flatMap(row=>(row.conditions||[]).filter(condition=>condition.contextLevel==='ROSTER')
  .map(condition=>condition.declaredComputation?.kind).filter(Boolean)))].sort();
 const contextAccess=Symbol('actual computer requested a roster input');
 const input=new Proxy({}, {get(){throw contextAccess;}}),context={book:input,epicOwners:input,records:input,state:input,unit:input,rows:input,context:input,abilityProjection:input};
 const dispatch=kinds.map(kind=>{
  let available=false,detail;
  try{const result=compute({kind},context);available=kind==='CONTEXT_FIELD'&&result?.skip===true;detail=available?'Explicit native context-field passthrough':'Dispatch returned without reading its declared input';}
  catch(error){available=error===contextAccess;detail=available?'Actual native dispatch case reached its context input':String(error?.message||error);}
  return {kind,available,detail};
 });
 const physical=await import(pathToFileURL(path.join(root,'books/shared/roster-v2/physical-condition-context.mjs')));
 const contextModule=await import(pathToFileURL(path.join(root,'books/shared/roster-v2/context.mjs')));
 const effects=await import(pathToFileURL(path.join(root,'books/shared/roster-v2/effects.mjs')));
 const binder=typeof bind==='function'?bind.toString():'';
 const caseText=key=>{
  const start=binder.indexOf("case '"+key+"':");if(start<0)return null;
  const rest=binder.slice(start),end=rest.slice(6).search(/\b(?:case\s+'[^']+'\s*:|default\s*:)/);
  return end<0?rest:rest.slice(0,end+6);
 };
 const routes={createPhysicalEquipmentConditionContext:'equipmentBearerSatisfied',createVerifiedPhysicalConditionContext:'physicalProfilePresent',
  createSourceEquipmentConditionContext:'sourceEquipmentSelected',createSelectedSourceChoiceConditionContext:'selectedSourceChoice',
  createInitialAttachmentConditionContext:'initialAttachmentBattleline'};
 const wiring=new Map(),families=new Map();
 for(const row of inventory.rows)for(const condition of row.conditions||[]){
  if(condition.contextLevel!=='ROSTER'||condition.predicate!=='FIELD'||condition.declaredComputation?.kind)continue;
  const key=condition.arguments.key,declared=condition.spec?.computedBy;
  if(!declared)continue; // Existing partial/unknown semantics are not invented.
  const kind='FIELD:'+row.book+':'+key;if(families.has(kind))continue;
  if(!wiring.has(row.book))wiring.set(row.book,inventory.inputs.filter(input=>input.path.startsWith('books/'+row.book+'/v2/')&&input.path.endsWith('.mjs')).filter(input=>{
   const text=fs.readFileSync(path.join(root,input.path),'utf8');
   return /createRosterConditionBinding|conditionInputs|createPhysicalEquipmentConditionContext|createVerifiedPhysicalConditionContext|createSourceEquipmentConditionContext|createSelectedSourceChoiceConditionContext|createEquippedWeaponChoiceConditionContext|createInitialAttachmentConditionContext/.test(text);
  }).map(input=>({path:input.path,sha256:input.sha256})));
  let implementation=null,route=null;
  if(declared==='predicateContext'){implementation=contextModule.predicateContext;route='shared physical context';}
  else if(declared==='executeRosterEffects'){implementation=effects.equipmentSatisfied;route='source effect equipment context';}
  else{
   const names=String(declared).split('/').map(value=>value.trim());
   const name=names.find(value=>typeof physical[value]==='function');
   implementation=name?physical[name]:null;
   route=name==='createEquippedWeaponChoiceConditionContext'?binder:caseText(routes[name]);
  }
  const available=typeof implementation==='function'&&Boolean(route);
  families.set(kind,{kind,key,book:row.book,available,detail:available?'Reviewed native physical implementation and declared wiring are present':'Physical condition implementation or binder dispatch is absent',
   fingerprint:inventoryFingerprint({key,declared,implementation:implementation?.toString()||null,route,nativeWiring:wiring.get(row.book)})});
 }
 return [...dispatch,...families.values()];
}
