/** Explicit, cloning producer boundary for canonical FIELD conditions.
 * Source evidence and Stratagem contracts are never interpreted or modified. */
import {conditionDefinitions,conditionSpec,conditionIdentity,isCanonicalCondition,translateFieldArguments,declarationFieldArguments} from './conditions.mjs';

const clone=structuredClone,own=(value,key)=>Object.hasOwn(value,key);
const requireValue=(value,message)=>{if(!value)throw new TypeError('Condition compiler: '+message);};
const excluded=entity=>entity.kind==='STRATAGEM'||entity.ruleContract?.kind==='STRATAGEM';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const compare=(a,b)=>a<b?-1:a>b?1:0;
function visitFields(value,fn){
 if(!value||typeof value!=='object')return;
 if(value.predicate==='FIELD')fn(value);
 for(const [key,child]of Object.entries(value))if(key!=='evidence')visitFields(child,fn);
}
const stratagemFields=book=>{
 const keys=new Set();for(const entity of book.entities||[])if(excluded(entity))visitFields(entity.ruleContract,node=>keys.add(node.arguments.key));return keys;
};
const schemaParameters=args=>Object.fromEntries(Object.entries(args).filter(([key])=>!['key','equals'].includes(key)));
/** Every declared variant survives, including unused definitions. Parameters
 * supplied by an individual predicate's evidence are wildcarded in schemas. */
export function compileConditionSchema(input,{book,stratagemKeys=new Set()}={}){
 const stateFields={},conditionFields=[];
 for(const [oldKey,spec]of Object.entries(input||{})){
  const args=translateFieldArguments({key:oldKey},{book});
  const parameters=schemaParameters(args),options=book?.conditionBindingOptions||{};
  if(!own(options,'equipmentBearerMode'))delete parameters.quantityProof;
  if(!own(options,'selectedUpgradeMode'))delete parameters.selectionMode;
  const definition=conditionSpec(args);
  requireValue(definition.level===spec.contextLevel&&definition.valueType===spec.valueType,'schema type or level drift '+oldKey);
  conditionFields.push({key:args.key,arguments:parameters,...clone(spec)});
  const canonicalSpec={contextLevel:spec.contextLevel,valueType:spec.valueType};
  if(own(spec,'intrinsicAllKeywords'))canonicalSpec.intrinsicAllKeywords=clone(spec.intrinsicAllKeywords);
  if(!own(stateFields,args.key))stateFields[args.key]=canonicalSpec;
  else requireValue(stateFields[args.key].contextLevel===canonicalSpec.contextLevel&&stateFields[args.key].valueType===canonicalSpec.valueType,'conflicting canonical field declaration');
  if(stratagemKeys.has(oldKey))stateFields[oldKey]=clone(spec);
 }
 conditionFields.sort((a,b)=>compare(conditionIdentity({key:a.key,...a.arguments}),conditionIdentity({key:b.key,...b.arguments})));
 return {stateFields,conditionFields};
}
function restoreConditionSchema(schema,{book,stratagemKeys}){
 const stateFields={};
 for(const key of stratagemKeys)if(schema.stateFields?.[key])stateFields[key]=clone(schema.stateFields[key]);
 for(const row of schema.conditionFields||[]){
  const {key,arguments:parameters,...spec}=row;
  const old=declarationFieldArguments({key,...parameters},{book}).key;
  if(own(stateFields,old))requireValue(same(stateFields[old],spec),'conflicting producer field declaration');
  stateFields[old]=clone(spec);
 }
 const result={...schema,stateFields};delete result.conditionFields;return result;
}
/** Match per-schema qualifiers without requiring node-derived parameters to
 * exist on a declaration. The dictionary independently validates real nodes. */
export function conditionSchemaSpec(args,schema){
 const parameters=schemaParameters(args);
 const matches=(schema?.conditionFields||[]).filter(row=>row.key===args.key&&Object.entries(row.arguments||{}).every(([key,value])=>same(parameters[key],value)));
 if(matches.length){
  const first=matches[0];requireValue(matches.every(row=>row.contextLevel===first.contextLevel&&row.valueType===first.valueType&&same(row.intrinsicAllKeywords,first.intrinsicAllKeywords)),'ambiguous condition schema variant');
  return first;
 }
 return schema?.stateFields?.[args.key]||null;
}
/** Returns a new book; callers must propagate its top-level schema and plan. */
export function compileBookConditions(inputBook){
 const book=clone(inputBook);
 requireValue(Array.isArray(book.entities),'missing condition entity collection');
 const legacyStratagemKeys=stratagemFields(book);
 for(const entity of book.entities)if(!excluded(entity))visitFields(entity.ruleContract,node=>{
  node.arguments=translateFieldArguments(node.arguments,{book,node,entity});
 });
 if(book.rosterSchema?.stateFields&&!book.rosterSchema.conditionFields){
  const compiled=compileConditionSchema(book.rosterSchema.stateFields,{book,stratagemKeys:legacyStratagemKeys});
  book.rosterSchema={...book.rosterSchema,...compiled};
 }
 if(book.rosterContextBindings){
  requireValue(!book.conditionComputations,'mixed legacy and canonical condition plans');
  book.conditionComputations=Object.entries(book.rosterContextBindings).map(([key,binding])=>{
   const args=translateFieldArguments({key},{book});
   return {key:args.key,arguments:schemaParameters(args),...clone(binding)};
  }).sort((a,b)=>compare(conditionIdentity({key:a.key,...a.arguments}),conditionIdentity({key:b.key,...b.arguments})));
  delete book.rosterContextBindings;
 }
 book.conditionSchema='conditions/v1';
 validateBookConditions(book);return book;
}
/** Complete temporary producer view. No runtime lookup uses this inverse. */
export function conditionDeclarationView(inputBook){
 const book=clone(inputBook),legacyStratagemKeys=stratagemFields(book);
 for(const entity of book.entities||[])if(!excluded(entity))visitFields(entity.ruleContract,node=>{
  if(isCanonicalCondition(node.arguments))node.arguments=declarationFieldArguments(node.arguments,{book});
  else requireValue(!conditionSpec(node.arguments),'malformed canonical condition in producer view');
 });
 if(book.rosterSchema?.conditionFields)book.rosterSchema=restoreConditionSchema(book.rosterSchema,{book,stratagemKeys:legacyStratagemKeys});
 if(book.conditionComputations){
  const bindings={};
  for(const row of book.conditionComputations){
   const {key,arguments:parameters,...binding}=row;
   const old=declarationFieldArguments({key,...parameters},{book}).key;
   requireValue(!own(bindings,old),'duplicate condition computation identity');bindings[old]=clone(binding);
  }
  book.rosterContextBindings=bindings;delete book.conditionComputations;
 }
 delete book.conditionSchema;return book;
}
export function validateBookConditions(book){
 let conditions=0;
 requireValue(Array.isArray(book?.entities),'missing canonical condition book');
 requireValue(!book.rosterContextBindings,'legacy condition computation registry');
 for(const entity of book.entities)if(!excluded(entity))visitFields(entity.ruleContract,node=>{
  requireValue(isCanonicalCondition(node.arguments),'invalid or untranslated FIELD '+entity.id+'/'+node.arguments?.key);
  const spec=conditionSpec(node.arguments);requireValue(spec.level===node.contextLevel,'FIELD level drift '+entity.id+'/'+node.arguments.key);
  conditions++;
 });
 for(const row of book.rosterSchema?.conditionFields||[]){
  const spec=conditionDefinitions[row.key];requireValue(spec&&spec.level===row.contextLevel&&spec.valueType===row.valueType,'invalid canonical condition schema');
 }
 const plan=new Set();for(const row of book.conditionComputations||[]){
  requireValue(conditionSpec(row)&&row.arguments&&typeof row.arguments==='object'&&typeof row.kind==='string','invalid canonical condition computation');
  const id=conditionIdentity({key:row.key,...row.arguments});requireValue(!plan.has(id),'duplicate canonical computation');plan.add(id);
 }
 return {status:'PASS',conditions,legacyStratagemKeys:[...stratagemFields(book)].sort(compare)};
}
