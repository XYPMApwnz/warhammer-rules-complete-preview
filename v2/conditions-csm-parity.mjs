/** Translate-2: real CSM import/execution A/B evidence, one process per root.
 * --root CHECKOUT_OR_RUNTIME_PACKAGE --out JSON [--fixtures SHARED_FIXTURE_JSON]
 * --write-fixtures JSON prepares the existing 61 text recipes once.
 * Hooks only observe lexical FIELD evaluation and execution-pass boundaries.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

const source=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const argv=process.argv.slice(2),argument=name=>argv.includes(name)?argv[argv.indexOf(name)+1]:undefined;
const root=path.resolve(argument('--root')||source),output=argument('--out'),fixtureFile=argument('--fixtures');
const prepare=argument('--write-fixtures');
const exactOutput=argument('--exact-out'),isolationOutput=argument('--isolation-out'),isolationResults=[];
if(exactOutput)fs.writeFileSync(exactOutput,'');
assert.ok(prepare||output,'Use --out JSON or --write-fixtures JSON');
const {translateFieldArguments,conditionIdentity,findConditionValue}=await import(new URL('../books/shared/rule-contract-v2/conditions.mjs',import.meta.url));
const stable=value=>JSON.stringify(canonical(value));
function canonical(value){
  if(value instanceof Set)return [...value].sort();
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>[key,canonical(value[key])]));
  return value;
}
const hash=value=>createHash('sha256').update(stable(value)).digest('hex');
const observerKey='__WH_CONDITIONS_CSM_OBSERVER__',stageKey='__WH_CONDITIONS_CSM_STAGE__',apiKey='__WH_CONDITIONS_CSM_API__';
let active=null,stage='INITIALIZATION',book,entityHint=null;
const events=new Map(),contexts=new Map(),catalog=new Map(),expectedFields=new Set(),coveredFields=new Set(),scenarios=[],ownersByRawNode=new Map(),ownersByCanonicalNode=new Map();
const relative=file=>pathToFileURL(path.join(root,file)).href;
const schemaURL=relative('books/shared/rule-contract-v2/schema.mjs');
const effectsURL=relative('books/shared/roster-v2/effects.mjs');
const stages=new Set([relative('books/chaos-space-marines/v2/roster-effect-context.mjs'),relative('books/shared/roster-v2/condition-context.mjs')]);
let schemaHooked=false,effectsHooked=false,passBoundaries=0;
registerHooks({load(url,context,nextLoad){
  const loaded=nextLoad(url,context);
  if(url!==schemaURL&&url!==effectsURL&&!stages.has(url))return loaded;
  let text=typeof loaded.source==='string'?loaded.source:Buffer.from(loaded.source).toString('utf8');
  if(url===schemaURL){
    const signature=/function evaluatePredicate\(node,\s*context\)\s*\{/;
    assert.ok(signature.test(text),'Lexical schema predicate entry was not found');
    text=text.replace(signature,`function evaluatePredicate(node,context){const result=evaluatePredicateObservedBody(node,context);if(node?.predicate==='FIELD')globalThis.${observerKey}?.(node,context,result);return result;}\nfunction evaluatePredicateObservedBody(node,context){`);
    schemaHooked=true;
  }
  if(stages.has(url)){
    text=text.replace(/const first\s*=\s*executeRosterEffects\(/g,()=>{passBoundaries++;return `globalThis.${stageKey}?.('FIRST_PASS');const first=executeRosterEffects(`;});
    text=text.replace(/return executeRosterEffects\(book,state,/g,()=>{passBoundaries++;return `globalThis.${stageKey}?.('SECOND_PASS');return executeRosterEffects(book,state,`;});
  }
  if(url===effectsURL){
    const signature=/export function executeRosterEffects\(book,\s*state,\s*\{([^}]+)\}\)\s*\{/;
    assert.ok(signature.test(text),'The actual roster-effect API boundary was not found');
    text=text.replace(signature,(_match,parameters)=>`export function executeRosterEffects(book,state,api){const result=executeRosterEffectsObservedBody(book,state,api);globalThis.${apiKey}?.(book,state,api,result);return result;}\nfunction executeRosterEffectsObservedBody(book,state,{${parameters}}){`);
    effectsHooked=true;
  }
  return {...loaded,source:text};
}});
globalThis[stageKey]=value=>{stage=value;};
const rootImport=file=>import(relative(file));
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
book=read('books/chaos-space-marines/v2/generated/roster-runtime.json');
const importBook=read('books/chaos-space-marines/v2/generated/roster-import.json');
const attachmentBindings=read('books/chaos-space-marines/v2/roster-attachment-bindings.json');
const {createCSMRosterImport}=await rootImport('books/chaos-space-marines/v2/roster-import.mjs');
const {createCSMRosterRuntime}=await rootImport('books/chaos-space-marines/v2/roster-runtime.mjs');
const {evaluateCSMRosterDeclarations,createCSMRosterEffectContext}=await rootImport('books/chaos-space-marines/v2/roster-effect-context.mjs');
const {formRoster,predicateContext}=await rootImport('books/shared/roster-v2/context.mjs');
const clone=structuredClone,leaves=node=>node?.op?node.args.flatMap(leaves):node?.predicate?[node]:[];
const ownerFor=node=>entityHint||ownersByRawNode.get(stable(node))?.[0];
const excluded=entity=>entity?.kind==='STRATAGEM'||entity?.ruleContract?.kind==='STRATAGEM';
const normalizedNode=(node,entity=ownerFor(node))=>excluded(entity)?clone(node):({...clone(node),arguments:translateFieldArguments(node.arguments,{book,node,entity})});
function walk(value,fn){if(!value||typeof value!=='object')return;if(value.predicate==='FIELD')fn(value);for(const child of Object.values(value))walk(child,fn);}
for(const entity of book.entities)walk(entity.ruleContract,node=>{
  const key=stable(node);if(!ownersByRawNode.has(key))ownersByRawNode.set(key,[]);ownersByRawNode.get(key).push(entity);
});
for(const entity of book.entities)walk(entity.ruleContract,node=>{
  const normalized=canonical(normalizedNode(node,entity)),key=stable(normalized),id=hash(normalized);
  if(!ownersByCanonicalNode.has(key))ownersByCanonicalNode.set(key,new Set());ownersByCanonicalNode.get(key).add(entity.id);
  if(!excluded(entity))expectedFields.add(id);
  if(!catalog.has(id))catalog.set(id,{id,node:normalized,owners:[]});
});
globalThis[observerKey]=(node,context,result)=>{
  if(!active)return;
  const normalized=canonical(normalizedNode(node)),id=hash(normalized);
  if(!catalog.has(id))catalog.set(id,{id,node:normalized,owners:[]});
  coveredFields.add(id);
  const bag=context?.[node.contextLevel==='BATTLE'?'battle':'roster']||{};
  const canonicalInput=excluded(ownerFor(node))?{present:false}:findConditionValue(bag,normalized.arguments);
  const rawPresent=Object.hasOwn(bag,node.arguments.key);
  const input=canonicalInput.present?canonicalInput:rawPresent?{present:true,value:bag[node.arguments.key]}:{present:false};
  const contextValue=canonical({subject:context?.subject,
    instanceId:context?.instanceId,modelId:context?.modelId,modelScopeId:context?.modelScopeId,modelInstanceId:context?.modelInstanceId,
    formedUnitId:context?.formedUnitId,unitId:context?.unitId,capabilities:context?.capabilities,
    keywords:context?.keywords,intrinsicKeywords:context?.intrinsicKeywords,owner:context?.owner,input});
  const contextId=hash(contextValue);if(!contexts.has(contextId))contexts.set(contextId,{id:contextId,context:contextValue});
  const row={scenario:active,stage,conditionId:id,contextId,result},identity=stable(row);
  if(!events.has(identity))events.set(identity,{...row,observations:0});events.get(identity).observations++;
};
globalThis[apiKey]=(executedBook,state,api,projection)=>{
  if(!active)return;
  assert.equal(typeof api.evaluatePredicate,'function','The native predicate API was not captured');
  assert.equal(typeof api.evaluateRole,'function','The native role API was not captured');
  const previousStage=stage,previousHint=entityHint,physicalContexts=[];
  for(const unit of projection.units){
    for(const subject of ['UNIT','FORMED_ATTACHED_UNIT']){
      const context=predicateContext(state,projection,unit.instanceId,subject);if(context)physicalContexts.push(context);
    }
    for(const model of unit.profiles){const context=predicateContext(state,projection,unit.instanceId,'MODEL',model.scopeId);if(context)physicalContexts.push(context);}
  }
  if(projection.units.length)physicalContexts.push(predicateContext(state,projection,projection.units[0].instanceId,'ROSTER'));
  const bySubject=new Map();for(const context of physicalContexts){if(!bySubject.has(context.subject))bySubject.set(context.subject,[]);bySubject.get(context.subject).push(context);}
  const uniqueFields=new Set(),uniqueRoles=new Set();
  try{
    for(const entity of book.entities){
      if(excluded(entity))continue;
      entityHint=entity;stage='EXPLICIT_FIELD_GRID/'+previousStage;
      walk(entity.ruleContract,node=>{
        const identity=stable(normalizedNode(node,entity));if(uniqueFields.has(identity))return;uniqueFields.add(identity);
        for(const context of bySubject.get(node.subject)||[])api.evaluatePredicate(node,context);
      });
      stage='ROLE_TREE/'+previousStage;
      for(const role of [...(entity.ruleContract?.roles||[]),...(entity.ruleContract?.clauses||[]).flatMap(clause=>clause.roles||[])]){
        const identity=stable(role);if(uniqueRoles.has(identity))continue;uniqueRoles.add(identity);
        for(const context of bySubject.get(role.subject)||[])api.evaluateRole(role,[],context);
      }
    }
  }finally{stage=previousStage;entityHint=previousHint;}
};
function normalizeProjection(projection){
  const value=clone(projection);walk(value,node=>{node.arguments=normalizedNode(node).arguments;});return canonical(value);
}
function start(id){active=id;stage='INITIALIZATION';}
function capture(id,projection,state){if(exactOutput)fs.appendFileSync(exactOutput,JSON.stringify({bookId:'chaos-space-marines',id,projection,state})+'\n');scenarios.push({id,projection:normalizeProjection(projection),state:canonical(state)});}

let fixtures;
if(fixtureFile)fixtures=JSON.parse(fs.readFileSync(fixtureFile,'utf8'));
else{
  const {buildImportedEffectFixtures}=await import(new URL('../books/chaos-space-marines/v2/roster-imported-effect-fixtures.mjs',import.meta.url));
  fixtures=buildImportedEffectFixtures(book);
}
assert.equal(fixtures.length,61,'All source-backed imported effect recipes must be present');
if(prepare){fs.writeFileSync(prepare,JSON.stringify(fixtures,null,2)+'\n');console.log(JSON.stringify({status:'PASS',fixtures:fixtures.length,output:prepare}));process.exit(0);}

for(const fixture of fixtures){
  start('import/'+fixture.id);
  const imported=createCSMRosterImport(importBook).import(fixture.text);
  const importedBytes=JSON.stringify(imported);
  if(exactOutput)fs.appendFileSync(exactOutput,JSON.stringify({bookId:'chaos-space-marines',id:active+'/import',result:imported})+'\n');
  assert.equal(imported.status,'READY','Canonical text import failed: '+fixture.id);
  const state=imported.roster;state.rosterId='conditions-csm/'+fixture.id;
  const sourceRule=book.entities.find(entity=>entity.id===fixture.owner);
  if(sourceRule.kind==='ENHANCEMENT'&&sourceRule.ruleContract.assignment){
    const raw=state.units[fixture.sourceOrdinal-1];
    const candidates=formRoster(book,state).units.find(unit=>unit.instanceId===raw.instanceId).profiles.filter(profile=>profile.canonicalProfileId===fixture.bearerProfileId&&profile.quantity===1);
    assert.equal(candidates.length,1,'Explicit fixture bearer is ambiguous');
    raw.enhancementAssignments=[{enhancementId:sourceRule.id,modelScopeId:candidates[0].scopeId}];
  }
  const service=createCSMRosterRuntime(book,importBook,attachmentBindings);service.load(state);
  if(isolationOutput&&!isolationResults.length){
    const originalBook=JSON.stringify(book),originalImporter=JSON.stringify(importBook),twin=createCSMRosterRuntime(book,importBook,attachmentBindings);
    assert.equal(JSON.stringify(createCSMRosterImport(importBook).import(fixture.text)),importedBytes);
    twin.load(clone(state));const before=JSON.stringify({state:twin.snapshot(),projection:twin.projection});
    service.load({...clone(state),rosterId:state.rosterId+'::isolation'});
    assert.equal(JSON.stringify(book),originalBook);assert.equal(JSON.stringify(importBook),originalImporter);
    assert.equal(JSON.stringify({state:twin.snapshot(),projection:twin.projection}),before);
    assert.equal(JSON.stringify(createCSMRosterImport(importBook).import(fixture.text)),importedBytes);
    twin.load(clone(state));assert.equal(JSON.stringify({state:twin.snapshot(),projection:twin.projection}),before);
    isolationResults.push({bookId:'chaos-space-marines',status:'PASS',reimportStatus:'READY'});service.load(state);
  }
  capture(active+'/unattached',service.projection,service.snapshot());
  for(const [index,edge]of fixture.attachments.entries()){
    stage='ATTACHMENT';service.attach(service.state.units[edge.bodyguardOrdinal-1].instanceId,service.state.units[edge.leaderOrdinal-1].instanceId);
    capture(active+'/attached-'+index,service.projection,service.snapshot());
  }
  if(fixture.initialAttachments){service.load({...service.snapshot(),initialAttachments:clone(service.snapshot().attachments)});capture(active+'/initial-history',service.projection,service.snapshot());}
}

// Exact constructed physical states from roster-effect-bindings-qa.mjs.
// These use the real native declaration evaluator, not a substitute interpreter.
const records=new Map(book.entities.map(entity=>[entity.id,entity]));
function physical(instanceId,canonicalUnitId,enhancementIds=[]){
  const unit=records.get(canonicalUnitId);assert.equal(unit?.kind,'DATASHEET');
  const modelRows=unit.data.profileIds.map((canonicalProfileId,index)=>{
    const quantity=records.get(canonicalProfileId).data.composition.quantity.min;
    return {rowId:`row-${index}`,canonicalProfileId,quantity,compositionScope:'MODEL_ROW',loadouts:[],selections:unit.data.weaponIds.map(id=>({selectionKey:id,canonicalProfileIds:[id],canonicalEquipmentIds:[],physicalQuantity:quantity}))};
  });
  return {instanceId,canonicalUnitId,startingStrength:modelRows.reduce((sum,row)=>sum+row.quantity,0),modelRows,selections:[],enhancementIds,warlord:null};
}
const edge=(leaderInstanceId,bodyguardInstanceId)=>({leaderInstanceId,bodyguardInstanceId,role:'LEADER'});
const stateFor=(name,detachment,units,attachments=[])=>({schema:'roster-v2/roster',bookId:book.bookId,rosterId:'conditions-csm/'+name,detachmentIds:['detachment-'+detachment],units,attachments,warlordInstanceId:null});
function execute(name,input,activeBook=book){start('constructed/'+name);const projection=evaluateCSMRosterDeclarations(activeBook,input);capture(active,projection,input);return projection;}
const fabius=stateFor('fabius','renegade-raiders',[physical('leader','unit-fabius-bile'),physical('bodyguard','unit-legionaries'),physical('other','unit-legionaries')],[edge('leader','bodyguard')]);
execute('fabius-history-unknown',fabius);fabius.initialAttachments=[];execute('fabius-history-empty',fabius);
fabius.initialAttachments=[edge('leader','bodyguard')];execute('fabius-history-matches',fabius);
fabius.attachments=[edge('leader','other')];execute('fabius-reattached-other',fabius);
fabius.attachments=[];execute('fabius-detached',fabius);
fabius.attachments=[edge('leader','bodyguard')];execute('fabius-reattached-original',fabius);
const withSupport=stateFor('fabius-support','renegade-raiders',[physical('leader','unit-fabius-bile'),physical('bodyguard','unit-legionaries'),physical('support','unit-master-of-executions'),physical('other','unit-legionaries')],[edge('leader','bodyguard'),{leaderInstanceId:'support',bodyguardInstanceId:'bodyguard',role:'SUPPORT'}]);
withSupport.initialAttachments=clone(withSupport.attachments);execute('fabius-support-only-bodyguard',withSupport);
const scoutsId='detachment-chaos-cult:enhancement:4';
const scouts=stateFor('scouts','chaos-cult',[physical('leader','unit-dark-commune',[scoutsId]),physical('bodyguard','unit-accursed-cultists'),physical('unrelated','unit-accursed-cultists')],[edge('leader','bodyguard')]);
const scoutScope=formRoster(book,scouts).units[0].profiles[0].scopeId;
scouts.units[0].enhancementAssignments=[{enhancementId:scoutsId,modelScopeId:scoutScope}];
execute('scouts-exact-prerequisite',scouts);
for(const [label,ability]of [['wrong-distance',{canonicalId:'core-scouts',name:'Scouts',parameters:{distance:9}}],['wrong-identity',{canonicalId:'synthetic-independent-scouts',name:'Scouts',parameters:{distance:6}}],['changed-caption',{canonicalId:'core-scouts',name:'Unrelated display caption',parameters:{distance:6}}]]){
  const changed=clone(book);changed.rosterReferenceSemantics['datasheet-accursed-cultists:rule-reference:2'].abilities=[ability];execute('scouts-'+label,scouts,changed);
}
const scoutPredicate=(()=>{
  const rule=records.get(scoutsId),all=[];walk(rule.ruleContract,node=>all.push(node));
  return all.find(node=>book.rosterContextBindings?.[node.arguments.key]?.kind==='LED_BODYGUARD_ABILITY'||book.conditionComputations?.some(binding=>binding.kind==='LED_BODYGUARD_ABILITY'&&conditionIdentity({key:binding.key,...binding.arguments})===conditionIdentity(node.arguments)));
})();
assert.ok(scoutPredicate,'Source-backed Scouts prerequisite FIELD was not found');
start('constructed/scouts-model-versus-unit-prerequisite');stage='DIRECT_PREREQUISITE';
const prerequisiteProjection=formRoster(book,scouts),bodyguard=prerequisiteProjection.units.find(unit=>unit.instanceId==='bodyguard');
bodyguard.abilities=[];bodyguard.profiles.forEach(profile=>profile.abilities=[]);bodyguard.profiles[0].abilities=[{canonicalId:'core-scouts',name:'Scouts',parameters:{distance:6}}];
const prerequisiteAPI=createCSMRosterEffectContext(book,scouts,{abilityProjection:prerequisiteProjection});
const prerequisiteContext=predicateContext(scouts,prerequisiteProjection,'leader','MODEL',prerequisiteProjection.units[0].profiles[0].scopeId);
assert.equal(prerequisiteAPI.evaluatePredicate(scoutPredicate,prerequisiteContext),'FALSE');
bodyguard.profiles.forEach(profile=>profile.abilities=[{canonicalId:'core-scouts',name:'Scouts',parameters:{distance:6}}]);
assert.equal(prerequisiteAPI.evaluatePredicate(scoutPredicate,prerequisiteContext),'TRUE');
scenarios.push({id:active,results:['FALSE','TRUE']});
const detached=clone(scouts);detached.attachments=[];execute('scouts-detached',detached);

active=null;assert.ok(schemaHooked&&effectsHooked,'Actual lexical and execution API boundaries were not observed');assert.equal(passBoundaries,2,'Both native execution-pass boundaries must be observed');
const eventRows=[...events.values()];
assert.ok(eventRows.length>0&&eventRows.some(event=>event.stage==='FIRST_PASS')&&eventRows.some(event=>event.stage==='SECOND_PASS'),'Both lexical evaluation passes must execute');
const missingFields=[...expectedFields].filter(id=>!coveredFields.has(id));assert.deepEqual(missingFields,[],'Source FIELD catalog has no actual scenario evaluation');
for(const entry of catalog.values())entry.owners=[...(ownersByCanonicalNode.get(stable(entry.node))||[])].sort();
const observedCalls=eventRows.reduce((sum,event)=>sum+event.observations,0);
const report={schema:'conditions-csm-parity/v2',status:'PASS',fixtureCount:fixtures.length,scenarioCount:scenarios.length,eventCount:eventRows.length,observedCalls,
  fieldCoverage:{expected:expectedFields.size,covered:[...expectedFields].filter(id=>coveredFields.has(id)).length,missing:missingFields},
  conditions:[...catalog.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0),contexts:[...contexts.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0),
  events:eventRows.sort((a,b)=>{const x=stable(a),y=stable(b);return x<y?-1:x>y?1:0;}),scenarios:scenarios.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)};
fs.writeFileSync(output,JSON.stringify(report)+'\n');
if(isolationOutput)fs.writeFileSync(isolationOutput,JSON.stringify(isolationResults,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',fixtureCount:fixtures.length,scenarioCount:scenarios.length,conditionCount:catalog.size,eventCount:eventRows.length,observedCalls,fieldCoverage:report.fieldCoverage,output}));
