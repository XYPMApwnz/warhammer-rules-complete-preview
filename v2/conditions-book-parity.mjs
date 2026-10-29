/** Translate-2: real native book import/execution A/B evidence.
 * One isolated process per --root CHECKOUT_OR_RUNTIME_PACKAGE --out JSON.
 * Optional --fixtures JSON shares the exact recipes between both processes;
 * --write-fixtures JSON prepares those existing source-backed recipes once.
 * Loader hooks observe lexical evaluation and retain the real interpreter. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

const source=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const argv=process.argv.slice(2),argument=name=>argv.includes(name)?argv[argv.indexOf(name)+1]:undefined;
const root=path.resolve(argument('--root')||source),output=argument('--out'),fixtureFile=argument('--fixtures'),prepare=argument('--write-fixtures');
assert.ok(prepare||output,'Use --out JSON or --write-fixtures JSON');
const {translateFieldArguments,findConditionValue}=await import(new URL('../books/shared/rule-contract-v2/conditions.mjs',import.meta.url));
const clone=structuredClone,canonical=value=>value instanceof Set?[...value].sort():Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?
 Object.fromEntries(Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>[key,canonical(value[key])])):value;
const stable=value=>JSON.stringify(canonical(value)),hash=value=>createHash('sha256').update(stable(value)).digest('hex');
const cmp=(a,b)=>a<b?-1:a>b?1:0,readSource=file=>fs.readFileSync(path.join(source,file),'utf8'),readJSON=file=>JSON.parse(readSource(file));
const artifacts={'adeptus-mechanicus':'roster-runtime','blood-angels':'roster-import','dark-angels':'roster-import','death-guard':'rule-contract-effective',
 'emperors-children':'roster-attachments','space-marines':'roster-import','tau-empire':'roster-import','tyranids':'roster-runtime'};

function extractLiteral(code,start,end,result,bindings={}){
 const first=code.indexOf(start),last=code.indexOf(end,first);assert.ok(first>=0&&last>first,'Existing fixture source boundaries changed');
 return vm.runInNewContext(code.slice(first,last)+'\n'+result,{...bindings},{timeout:1000});
}
async function recipes(){
 const rows=[];const add=(bookId,id,text,extra={})=>rows.push({bookId,id,text,...extra});
 for(const bookId of ['adeptus-mechanicus','emperors-children'])for(const fixture of readJSON(`books/${bookId}/v2/roster-import-fixtures.json`).fixtures)
  add(bookId,'native-json/'+fixture.id,fixture.text,{bindings:fixture.bindings||{}});
 for(const [bookId,files]of Object.entries({'space-marines':['newrecruit-v37.3-user-sm.txt'],'blood-angels':['newrecruit-v37.2-user-redemptor.txt'],
  'dark-angels':['newrecruit-v37.3-user-da.txt','newrecruit-v37.3-user-da-10-models.txt']}))for(const file of files)add(bookId,'native-export/'+file,readSource(`books/${bookId}/v2/fixtures/${file}`));
 add('death-guard','F2/deathshroud',readSource('v2/fixtures/f2-deathshroud-newrecruit.txt'));
 add('death-guard','F1-F2/omega',readSource('books/death-guard/v2/fixtures/omega-megaroster.txt'),{omega:true});
 const f1=readSource('v2/detachment-recipient-browser-qa.mjs');
 const literal=extractLiteral(f1,'const amRoster=','const books=', '({amRoster,dgRoster})');
 for(const detachment of ['Lords of the Forge','Haloscreed Battle Clade'])add('adeptus-mechanicus','F1/'+detachment,literal.amRoster(detachment));
 for(const detachment of ['Flyblown Host','Virulent Vectorium'])add('death-guard','F1/'+detachment,literal.dgRoster(detachment));
 const broad=extractLiteral(f1,'    const tauText=','    const broadFixtures=', '({tauText,tyrText})');
 add('tau-empire','F1/broad-fixture',broad.tauText);add('tyranids','F1/broad-fixture',broad.tyrText);
 const f2=extractLiteral(readSource('v2/card-recipient-browser-qa.mjs'),'const constructed={','const ready=', 'constructed');
 add('adeptus-mechanicus','F2/AM-1',f2.am);add('death-guard','F2/DG-1',f2.dg);
 const {chargeFixtures}=await import(new URL('./charge-qa-fixtures.mjs',import.meta.url));
 for(const fixture of chargeFixtures.filter(row=>row.bookId!=='chaos-space-marines')){
  add(fixture.bookId,'charge/'+fixture.id,fixture.text);
  if(fixture.disabledText)add(fixture.bookId,'charge/'+fixture.id+'/disabled',fixture.disabledText);
 }
 // Reuse the exact accepted-fact fixture constructors, without importing their
 // QA module, invoking producers, or executing any test body.
 const tyrFacts=readJSON('books/tyranids/v2/generated/effective.json'),tyrCode=readSource('books/tyranids/v2/roster-ui-fixtures.mjs');
 const tyrBody=tyrCode.slice(tyrCode.indexOf('const norm='),tyrCode.indexOf('for(const fixture of fixtures)')).replaceAll('export ','');
 const tyr=vm.runInNewContext(tyrBody+'\n({fixtures,make})',{facts:tyrFacts,mfm:readJSON('mfm/sources/v1.6/tyranids.json'),
  records:new Map(tyrFacts.entities.map(row=>[row.id,row])),book:readJSON('books/tyranids/v2/generated/roster-runtime.json'),assert},{timeout:2000});
 for(const fixture of tyr.fixtures)add('tyranids','native-ui/'+fixture.id,fixture.text);
 const seven=readSource('books/tyranids/v2/seven-effects-fixtures.mjs');
 const sevenRows=vm.runInNewContext(seven.slice(seven.indexOf('const unit='),seven.indexOf('export const sevenEffectFixtures')).replaceAll('export ','')+'\nsevenEffectsFixtures',
  {make:tyr.make},{timeout:2000});
 for(const fixture of sevenRows)add('tyranids','seven-effects/'+fixture.id,fixture.text);
 add('tyranids','source-choice/trygon',tyr.make('Subterranean Assault',['unit-trygon','unit-trygon']),{sourceChoice:{source:'parsed-unit-1',
  ruleId:'detachment-subterranean-assault:rule',value:'detachment-subterranean-assault:rule::choice::trygon-character'}});
 const tauFacts=readJSON('books/tau-empire/v2/generated/effective.json'),tauCode=readSource('books/tau-empire/v2/roster-import-qa.mjs');
 const tau=extractLiteral(tauCode,'function fixture(id,','function assertPhysical(', 'fixture',{index:new Map(tauFacts.entities.map(row=>[row.id,row])),
  members:id=>tauFacts.entities.filter(row=>row.kind==='COMPOSITION_MEMBER'&&row.parentId===id)});
 const header=names=>'+ FACTION KEYWORD: T’au Empire\n'+(names||["Mont'ka"]).map(name=>'+ DETACHMENT: '+name+'\n').join('');
 for(const unit of tauFacts.entities.filter(row=>row.kind==='DATASHEET'))add('tau-empire','native-unit/'+unit.id,header()+tau(unit.id).text);
 add('tau-empire','source-equipment/marker',header()+tau('unit-crisis-fireknife-battlesuits',{equipment:'2x Shield Drone, 1x Marker Drone'}).text+tau('unit-crisis-fireknife-battlesuits').text);
 add('tau-empire','source-choice/student',header(['Auxiliary Cadre'])+tau('unit-kroot-trail-shaper',{enhancement:'Student of Kauyon'}).text+
  tau('unit-kroot-war-shaper',{enhancement:'Student of Kauyon'}).text+tau('unit-kroot-carnivores').text+tau('unit-kroot-farstalkers').text,
  {sourceChoices:[{source:'parsed-unit-1',ruleId:'detachment-auxiliary-cadre:enhancement:1',value:JSON.stringify(['parsed-unit-3'])},
   {source:'parsed-unit-2',ruleId:'detachment-auxiliary-cadre:enhancement:1',value:JSON.stringify(['parsed-unit-4'])}]});
 const blade=readJSON('books/emperors-children/v2/roster-import-fixtures.json').fixtures.find(row=>row.id==='possessed-blade-missing-decision');
 add('emperors-children','source-choice/equipped-blade',blade.text,{bindings:{profiles:{'ec-weapon-choice/parsed-unit-1':'detachment-carnival-of-excess:enhancement:3::choice::datasheet-lord-exultant:weapon:7'}}});
 return rows.sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(a.id,b.id));
}

const fixtures=fixtureFile?JSON.parse(fs.readFileSync(fixtureFile,'utf8')):await recipes();
assert.deepEqual([...new Set(fixtures.map(row=>row.bookId))].sort(),Object.keys(artifacts).sort(),'Every non-CSM book needs real source-backed recipes');
if(prepare){fs.writeFileSync(prepare,JSON.stringify(fixtures,null,2)+'\n');console.log(JSON.stringify({status:'PASS',fixtures:fixtures.length,output:prepare}));process.exit(0);}

const relative=file=>pathToFileURL(path.join(root,file)).href,rootImport=file=>import(relative(file));
const schemaURL=relative('books/shared/rule-contract-v2/schema.mjs'),runtimeURL=relative('books/shared/roster-v2/runtime.mjs'),formationURL=relative('books/emperors-children/v2/rule-contract-formation-context.mjs');
const observerKey='__WH_CONDITIONS_BOOK_OBSERVER__',apiKey='__WH_CONDITIONS_BOOK_API__';
let schemaHooked=false,runtimeHooked=false,formationHooked=false,active=null,stage='INITIALIZATION',frame='initialization',book,bookId,entityHint;
const events=new Map(),catalog=new Map(),scenarios=[],apis=new Map(),books=new Map(),rawOwners=new Map(),canonicalOwners=new Map();
registerHooks({load(url,context,nextLoad){
 const loaded=nextLoad(url,context);if(![schemaURL,runtimeURL,formationURL].includes(url))return loaded;
 let text=typeof loaded.source==='string'?loaded.source:Buffer.from(loaded.source).toString('utf8');
 if(url===schemaURL){
  const signature=/function evaluatePredicate\(node,\s*context\)\s*\{/;assert.ok(signature.test(text),'Lexical schema predicate entry was not found');
  text=text.replace(signature,`function evaluatePredicate(node,context){const result=evaluatePredicateObservedBody(node,context);if(node?.predicate==='FIELD')globalThis.${observerKey}?.(node,context,result);return result;}\nfunction evaluatePredicateObservedBody(node,context){`);schemaHooked=true;
 }
 if(url===runtimeURL){
  const signature='({evaluatePredicate,evaluateRole}=withRosterDetachments({evaluatePredicate,evaluateRole}));';assert.ok(text.includes(signature),'Actual roster interpreter API boundary was not found');
  text=text.replace(signature,signature+`\nglobalThis.${apiKey}?.(book,{evaluatePredicate,evaluateRole});`);runtimeHooked=true;
 }
 if(url===formationURL){
  const signature=/export function createFormationContext\(book,\s*state,\s*schema\)\s*\{/;assert.ok(signature.test(text),'Actual formation interpreter API boundary was not found');
  text=text.replace(signature,`export function createFormationContext(book,state,schema){const result=createFormationContextObservedBody(book,state,schema);globalThis.${apiKey}?.(book,result);return result;}\nfunction createFormationContextObservedBody(book,state,schema){`);formationHooked=true;
 }
 return {...loaded,source:text};
}});
globalThis[apiKey]=(input,api)=>{apis.set(input.bookId,{book:input,api});};
function walk(value,fn){if(!value||typeof value!=='object')return;if(value.predicate==='FIELD')fn(value);for(const child of Object.values(value))walk(child,fn);}
const excluded=entity=>entity?.kind==='STRATAGEM'||entity?.ruleContract?.kind==='STRATAGEM';
const ownerFor=node=>entityHint||rawOwners.get(bookId+'/'+stable(node))?.[0];
const normalizedNode=(node,entity=ownerFor(node))=>excluded(entity)?clone(node):({...clone(node),arguments:translateFieldArguments(node.arguments,{book,node,entity})});
function indexBook(input){
 for(const entity of input.entities)walk(entity.ruleContract,node=>{
  const raw=bookId+'/'+stable(node);if(!rawOwners.has(raw))rawOwners.set(raw,[]);rawOwners.get(raw).push(entity);
  const normalized=canonical(normalizedNode(node,entity)),id=hash(normalized),key=bookId+'/'+id;
  if(!canonicalOwners.has(key))canonicalOwners.set(key,new Set());canonicalOwners.get(key).add(entity.id);
  if(!catalog.has(key))catalog.set(key,{bookId,id,node:normalized,owners:[]});
 });
}
globalThis[observerKey]=(node,context,result)=>{
 if(!active)return;
 const entity=ownerFor(node),normalized=canonical(normalizedNode(node,entity)),id=hash(normalized),key=bookId+'/'+id;
 if(!catalog.has(key))catalog.set(key,{bookId,id,node:normalized,owners:[]});
 const bag=context?.[node.contextLevel==='BATTLE'?'battle':'roster']||{},canonicalInput=excluded(entity)?{present:false}:findConditionValue(bag,normalized.arguments),rawPresent=Object.hasOwn(bag,node.arguments.key);
 const input=canonicalInput.present?canonicalInput:rawPresent?{present:true,value:bag[node.arguments.key]}:{present:false};
 const row=canonical({bookId,scenario:active+'/'+frame,stage,conditionId:id,result,context:{subject:context?.subject,instanceId:context?.instanceId,
  modelId:context?.modelId,modelScopeId:context?.modelScopeId,modelInstanceId:context?.modelInstanceId,formedUnitId:context?.formedUnitId,
  unitId:context?.unitId,capabilities:context?.capabilities,keywords:context?.keywords,intrinsicKeywords:context?.intrinsicKeywords,owner:context?.owner,input}});
 const identity=stable(row);if(!events.has(identity))events.set(identity,{...row,observations:0});events.get(identity).observations++;
};
function normalize(value){const result=clone(value);walk(result,node=>{node.arguments=normalizedNode(node).arguments;});return canonical(result);}
async function createService(id){
 const module=await rootImport(`books/${id}/v2/${{'adeptus-mechanicus':'roster-runtime.mjs','death-guard':'roster-boot.mjs','emperors-children':'roster-boot.mjs',
  'space-marines':'roster-import.mjs','blood-angels':'roster-import.mjs','dark-angels':'roster-import.mjs','tau-empire':'roster-boot.mjs','tyranids':'roster-boot.mjs'}[id]}`);
 switch(id){
  case 'adeptus-mechanicus':return module.createAdMechRosterRuntime(book,JSON.parse(fs.readFileSync(path.join(root,'books/adeptus-mechanicus/v2/roster-import-aliases.json'),'utf8')));
  case 'death-guard':return module.createDGRosterRuntime(book);
  case 'emperors-children':return module.createECBrowserRoster(book);
  case 'space-marines':return module.createSpaceMarinesRosterService(book);
  case 'blood-angels':return module.createBloodAngelsRosterService(book);
  case 'dark-angels':return module.createDarkAngelsRosterService(book);
  case 'tau-empire':return module.createTauBrowserRoster(book);
  case 'tyranids':return module.createTyranidsBrowserRoster(book);
 }
}
function selectBook(id){
 bookId=id;
 if(!books.has(id)){
  const file=`books/${id}/v2/generated/${artifacts[id]}.json`,input=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  // Explicit source-owned modes are metadata introduced by this translation;
  // they describe the pre-existing algorithm used for baseline normalization.
  input.conditionBindingOptions=readJSON(file).conditionBindingOptions||input.conditionBindingOptions;
  books.set(id,input);
 }
 book=books.get(id);indexBook(book);
}
function catalogSweep(service){
 const registered=apis.get(bookId);assert.ok(registered,'Actual native evaluator was not captured: '+bookId);
 indexBook(registered.book);stage='SOURCE_RULE_CATALOG';
 const projection=service.projection,contexts=[];
 for(const unit of projection.units){
  for(const subject of ['UNIT','FORMED_ATTACHED_UNIT']){const context=service.context(unit.instanceId,subject);if(context)contexts.push(context);}
  for(const model of unit.profiles){const context=service.context(unit.instanceId,'MODEL',model.scopeId);if(context)contexts.push(context);}
 }
 const roster=service.context(projection.units[0]?.instanceId,'ROSTER');if(roster)contexts.push(roster);
 const bySubject=new Map();for(const context of contexts){if(!bySubject.has(context.subject))bySubject.set(context.subject,[]);bySubject.get(context.subject).push(context);}
 const unique=new Set();
 for(const entity of registered.book.entities){
  entityHint=entity;
  walk(entity.ruleContract,node=>{
   const key=stable(normalizedNode(node,entity));if(unique.has(key))return;unique.add(key);
   for(const context of bySubject.get(node.subject)||[])registered.api.evaluatePredicate(node,context);
  });
  // Real role evaluation preserves combined selectors and conditions and uses
  // the native adapter's existing computer availability, including UNKNOWN.
  for(const role of [...(entity.ruleContract?.roles||[]),...(entity.ruleContract?.clauses||[]).flatMap(clause=>clause.roles||[])])
   for(const context of bySubject.get(role.subject)||[])registered.api.evaluateRole(role,[],context);
 }
 entityHint=null;
}
function capture(service,label){
 frame=label;
 stage='RELATED_AND_EFFECTIVE';
 const state=service.snapshot(),projection=service.projection,effective=[];
 for(const unit of projection.units){
  if(service.related)service.related(unit.instanceId);
  if(service.effective)effective.push({instanceId:unit.instanceId,view:service.effective(unit.instanceId)});
 }
 scenarios.push({bookId,id:active+'/'+label,state:canonical(state),projection:normalize(projection),effective:normalize(effective)});
 catalogSweep(service);
}
function operations(service,fixture){
 const standalone=service.snapshot();
 let pair;
 if(fixture.omega)pair={leader:'parsed-unit-27',target:'parsed-unit-1'};
 else for(const unit of standalone.units){const target=service.candidates?.(unit.instanceId)?.[0];if(target){pair={leader:unit.instanceId,target:target.instanceId};break;}}
 if(pair){
  frame='attached';stage='ATTACHMENT';service.attach(pair.leader,pair.target);capture(service,'attached');
  frame='reload-attached';stage='RELOAD';service.load(service.snapshot());capture(service,'reload-attached');
  if(bookId==='emperors-children'){
   frame='dated-initial-formation';stage='EXPLICIT_INITIAL_FORMATION';service.load({...service.snapshot(),initialAttachmentStep:'DECLARE_BATTLE_FORMATIONS',initialAttachments:clone(service.snapshot().attachments)});capture(service,'dated-initial-formation');
  }
  frame='detached';stage='DETACHMENT';service.detach(pair.leader);capture(service,'detached');
  const other=service.candidates?.(pair.leader)?.find(row=>row.instanceId!==pair.target)?.instanceId||pair.target;
  frame='reattached';stage='REATTACHMENT';service.reattach(pair.leader,other);capture(service,'reattached');
 }
 for(const choice of [...(fixture.sourceChoices||[]),...(fixture.sourceChoice?[fixture.sourceChoice]:[])]){
  frame='choice/'+choice.source;stage='SOURCE_CHOICE';service.setSourceChoice(choice.source,choice.ruleId,choice.value);capture(service,frame);
 }
 frame='reload';stage='RELOAD';service.load(service.snapshot());capture(service,'reload');
}

for(const fixture of fixtures){
 selectBook(fixture.bookId);active=fixture.bookId+'/'+fixture.id;frame='imported';stage='INITIALIZATION';
 const service=await createService(bookId),result=service.import(fixture.text,fixture.bindings||{});
 if(result.status!=='READY'){
  scenarios.push({bookId,id:active+'/import',importResult:normalize({status:result.status,needsBindings:result.needsBindings,errors:result.errors})});continue;
 }
 capture(service,'imported');operations(service,fixture);
}

// Existing native typed-policy physical fixtures. Leader attachment witnesses
// use recorded canonical relations, not labels or English rule interpretation.
for(const id of ['blood-angels','dark-angels']){
 selectBook(id);const records=new Map(book.entities.map(entity=>[entity.id,entity]));
 const candidates=new Map();
 for(const rule of book.entities.filter(entity=>entity.ruleContract?.clauses?.some(clause=>clause.conditionalPolicy))){
  let owner=rule;while(owner&&!['DATASHEET','DETACHMENT'].includes(owner.kind))owner=records.get(owner.parentId);
  if(owner?.kind==='DATASHEET')candidates.set(owner.id,rule.id);
 }
 if(id==='blood-angels')candidates.set('unit-ba-09adea2bf319462fb4ed','detachment-rule-ba-10c56bef78b24440bb5f');
 for(const [sourceId,ruleId]of [...candidates].sort(([a],[b])=>cmp(a,b))){
  active=id+'/typed/'+ruleId;frame='standalone';stage='INITIALIZATION';
  const physical=(canonicalUnitId,instanceId)=>{
   const unit=records.get(canonicalUnitId),modelRows=unit.data.profileIds.map((canonicalProfileId,index)=>({rowId:'row-'+index,canonicalProfileId,quantity:1,compositionScope:'MODEL_ROW',
    selections:unit.data.weaponIds.map((weaponId,j)=>({selectionKey:`typed-source/${index}/weapon/${j}`,canonicalProfileIds:[weaponId],canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1}))}));
   return {instanceId,canonicalUnitId,startingStrength:modelRows.length,modelRows,selections:[],equipmentContextKnown:true,enhancementIds:[],warlord:null};
  };
  const relation=book.rosterAttachmentPolicies.find(row=>row.sourceId===sourceId),units=[physical(sourceId,'typed-source')];
  if(relation)units.push(physical(relation.targetId,'typed-bodyguard'),physical(relation.targetId,'typed-other-bodyguard'));
  const detachment=id==='blood-angels'?'detachment-ba-23df164069854eb2996c':'detachment-da-7e310c5c15914267a0ae';
  const state={schema:'roster-v2/roster',bookId:id,rosterId:'conditions-native-typed/'+sourceId,detachments:[{instanceId:'detachment/typed',canonicalDetachmentId:detachment}],
   detachmentIds:[detachment],units,attachments:[],warlordInstanceId:null};
  const module=await rootImport(`books/${id}/v2/roster-runtime.mjs`),service=id==='blood-angels'?module.createBloodAngelsRosterRuntime(book):module.createDarkAngelsRosterRuntime(book);
  service.load(state);capture(service,'standalone');operations(service,{});
 }
}

active=null;assert.ok(schemaHooked&&runtimeHooked&&formationHooked,'Every actual native evaluator boundary must be observed');
assert.ok(events.size>0,'No lexical FIELD evaluations were observed');
for(const [key,row]of catalog)row.owners=[...(canonicalOwners.get(key)||[])].sort();
const observed=new Set([...events.values()].map(row=>row.bookId+'/'+row.conditionId));
const report={schema:'conditions-book-parity/v1',status:'PASS',fixtureCount:fixtures.length,scenarioCount:scenarios.length,eventCount:events.size,
 conditions:[...catalog.values()].sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(a.id,b.id)),
 coverage:Object.keys(artifacts).map(id=>({bookId:id,conditions:[...catalog.values()].filter(row=>row.bookId===id).length,
  observed:[...catalog.keys()].filter(key=>key.startsWith(id+'/')&&observed.has(key)).length,
  withoutPhysicalContext:[...catalog].filter(([key,row])=>row.bookId===id&&!observed.has(key)).map(([,row])=>row.id).sort()})),
 events:[...events.values()].sort((a,b)=>cmp(stable(a),stable(b))),scenarios:scenarios.sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(a.id,b.id))};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',fixtureCount:report.fixtureCount,scenarioCount:report.scenarioCount,conditionCount:catalog.size,eventCount:events.size,coverage:report.coverage,output}));
