import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
const localProviderGlobals={
  tyranids:'TYRANIDS_ROSTER_SEMANTICS','tau-empire':'TAURosterSemantics',
  'emperors-children':'ECRosterSemantics','chaos-space-marines':'CSM_ROSTER_SEMANTICS'
};
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const plain=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const semanticEffects=value=>plain(value||[]).map(stable).sort((left,right)=>JSON.stringify(left).localeCompare(JSON.stringify(right)));
const assertEqual=(actual,expected,label)=>assert.deepEqual(semanticEffects(actual),semanticEffects(expected),`${label}: provider result differs from the canonical interpreter`);
const run=(scope,relative)=>vm.runInNewContext(read(relative),scope,{filename:relative});

function loadProvider(bookId){
  let installation=null;
  const scope={console,URL,URLSearchParams,location:{pathname:`/books/${bookId}/reader.html`},document:{documentElement:{dataset:{bookId}}},addEventListener(){}};
  scope.window=scope;scope.globalThis=scope;
  run(scope,`books/${bookId}/scripts/roster-data.js`);
  run(scope,'books/shared/effect-contract-runtime.js');
  const runtime=scope.WHEffectContractRuntime;
  const paths=[];
  if(['space-marines','dark-angels','blood-angels'].includes(bookId)){
    scope.WHArmyRosterContext={install(options){installation=options;return{};}};
    run(scope,'books/shared/book-roster-enhancements.js');
    run(scope,'books/extensions/book-roster-enhancement-providers.js');
    run(scope,`books/${bookId}/scripts/roster-filter.js`);
    paths.push({name:`books/${bookId}/scripts/roster-filter.js`,role:'installed',gameEffects:installation.provider.gameEffects});
    paths.push({name:'books/shared/book-roster-enhancements.js',role:'inner',gameEffects:context=>scope.WHBookRosterEnhancements.gameEffects(context)});
  }else{
    scope.WHArmyRosterContext={install(options){installation=options;return{};}};
    scope.WHBookRosterEnhancements={decorate(){}};
    if(bookId==='death-guard'){
      run(scope,'books/death-guard/scripts/roster-semantics.js');
      run(scope,'books/death-guard/scripts/roster-filter.js');
      const provider=installation.providerFactory({units:[],roster:{enhancements:[]},record:{attachments:{}}});
      paths.push({name:'books/death-guard/scripts/roster-filter.js',role:'installed',gameEffects:provider.gameEffects});
      const compatibility=scope.DGRosterSemantics.createContext({roster:{enhancements:[]},attachments:{}});
      paths.push({name:'books/death-guard/scripts/roster-semantics.js',role:'compatibility',gameEffects:context=>{
        scope.WH_ARMY_ROSTER_PROJECTION={enhancements:context.enhancements||[]};scope.WH_ARMY_ROSTER_GAME_PROJECTION={units:context.gameUnits||[]};
        return compatibility.projectEffects(null,null,(context.detachments||[]).map(item=>item.id||item),context.gameUnit);
      }});
    }else if(bookId==='adeptus-mechanicus'){
      run(scope,'books/adeptus-mechanicus/scripts/roster-enhancements.js');
      run(scope,'books/adeptus-mechanicus/scripts/roster-filter.js');
      paths.push({name:'books/adeptus-mechanicus/scripts/roster-filter.js',role:'installed',gameEffects:installation.provider.gameEffects});
      paths.push({name:'books/adeptus-mechanicus/scripts/roster-enhancements.js',role:'compatibility',gameEffects:context=>scope.AMRosterEnhancements.projectGameEffects(null,null,context)});
    }else{
      const file=`books/${bookId}/scripts/roster-filter.js`;
      run(scope,file);
      paths.push({name:file,role:'installed',gameEffects:installation.provider.gameEffects});
      paths.push({name:`${file}#${localProviderGlobals[bookId]}`,role:'alias',gameEffects:scope[localProviderGlobals[bookId]].gameEffects});
    }
  }
  const installed=paths.find(item=>item.role==='installed');assert.ok(installed,`${bookId}: installed effect provider was not captured`);
  return{scope,runtime,catalog:scope.WH_BOOK_ROSTER_CATALOG,paths,installed};
}

const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const eligible=(unit,selector={})=>{
  if(selector.all&&!selector.all.every(item=>eligible(unit,item)))return false;
  if((selector.any||selector.anyOf)&&!(selector.any||selector.anyOf).some(item=>eligible(unit,item)))return false;
  if(selector.not&&eligible(unit,selector.not))return false;
  const keywords=new Set((unit.intrinsicKeywords||[]).map(normalize)),abilities=new Set((unit.gameSelections?.abilities||[]).map(item=>normalize(item.id)));
  return !((selector.unitIds||[]).length&&!selector.unitIds.includes(unit.id))
    &&!(selector.allKeywords||[]).some(keyword=>!keywords.has(normalize(keyword)))
    &&(!((selector.anyKeywords||[]).length)||selector.anyKeywords.some(keyword=>keywords.has(normalize(keyword))))
    &&!(selector.noneKeywords||[]).some(keyword=>keywords.has(normalize(keyword)))
    &&!(selector.allAbilities||[]).some(id=>!abilities.has(normalize(id)));
};
const contextFor=(catalog,enhancement,index)=>{
  const contract=catalog.effectContracts.find(item=>item.sourceKind==='enhancement'&&[enhancement.id,enhancement.ruleId,enhancement.sourceId].filter(Boolean).includes(item.canonicalRecordId)),selector=contract?.selector||enhancement.owner?.selector||{},hasSelector=Object.keys(selector).length>0,owner=(hasSelector?catalog.units.find(unit=>eligible(unit,selector)):null)||catalog.units.find(unit=>(unit.intrinsicKeywords||[]).some(keyword=>normalize(keyword)==='character'))||catalog.units[0],instanceId=`provider-equality-${index}`,keywords=owner.intrinsicKeywords||[],loadout=owner.gameSelections||{};
  const gameUnit={identity:{instanceId,canonicalDatasheetId:owner.id},attachments:{leading:[],leaders:[]},rosterState:{detachments:[enhancement.detachmentId],keywordProfile:{intrinsic:keywords,added:[],removed:[],effective:keywords}},selection:{modelCount:{value:1,state:'resolved'},loadout:{weaponResolution:{state:'resolved'},weapons:[],selectedProfileIds:(loadout.weaponProfiles||[]).map(item=>item.id),selectedWargearAbilityIds:(loadout.wargearAbilities||[]).map(item=>item.id)}},item:{catalogUnit:owner}};
  return{item:{raw:{id:instanceId},catalogUnit:owner},gameUnit,gameUnits:[gameUnit],byInstance:new Map([[instanceId,gameUnit]]),detachments:[{id:enhancement.detachmentId}],enhancements:[{catalog:enhancement,input:{ownerStatus:'resolved',ownerUnitId:instanceId}}]};
};
const contractSentinel=contract=>contract.clauses.flatMap(clause=>clause.operations.map(operation=>{
  const target=typeof operation.canonicalTarget==='string'?operation.canonicalTarget:operation.canonicalTarget?.id,parameters=plain(operation.parameters||{}),referenceKind=parameters.referenceKind;
  return{id:operation.id,canonicalSourceRecord:contract.canonicalRecordId,operationType:operation.type,component:'oracle-component',operation:'oracle-operation',targetId:target,canonicalTarget:plain(operation.canonicalTarget),parameters,...parameters,selector:plain(contract.selector||{}),clauseSelector:plain(clause.selector||{}),scope:contract.scope,conditions:plain(clause.conditions||[]),timingState:plain(contract.timingState),stackingPolicy:contract.stackingPolicy,referenceScope:contract.referenceScope||null,state:operation.type==='CANONICAL_REFERENCE'?'reference':'active',certainty:'current',...(operation.type==='CANONICAL_REFERENCE'?{canonicalReference:{kind:referenceKind,id:target}}:{}),source:{kind:contract.sourceKind,id:contract.canonicalRecordId},provenance:plain(contract.source)};
}));

const loaded=new Map(),sourceContracts=books.reduce((sum,book)=>sum+JSON.parse(read(`books/${book}/sources/${book}-effect-contracts.v1.json`)).contracts.length,0);
const effectTypes=new Set(),samples={};let effectiveBindings=0,providerPaths=0,realComparisons=0,nonEmptyBooks=0;
for(const bookId of books){
  const book=loadProvider(bookId);loaded.set(bookId,book);effectiveBindings+=book.catalog.effectContracts.length;providerPaths+=book.paths.length;
  for(const contract of book.catalog.effectContracts){
    for(const clause of contract.clauses)for(const operation of clause.operations)effectTypes.add(operation.type);
    const sentinel=contractSentinel(contract);book.scope.WHEffectContractRuntime={project(){return plain(sentinel);}};
    const oracleContext={gameUnit:{identity:{instanceId:'oracle'}},gameUnits:[],byInstance:new Map(),detachments:[],enhancements:[]};
    for(const provider of book.paths)assertEqual(provider.gameEffects(oracleContext),sentinel,`${bookId}/${provider.name}/${contract.canonicalRecordId}`);
  }
  book.scope.WHEffectContractRuntime=book.runtime;
  let emitted=0;
  for(const [index,enhancement] of book.catalog.enhancements.entries()){
    const context=contextFor(book.catalog,enhancement,index),canonical=book.runtime.project(context);emitted+=canonical.length;
    for(const provider of book.paths){assertEqual(provider.gameEffects(context),canonical,`${bookId}/${provider.name}/${enhancement.id}`);realComparisons+=1;}
    const sample={bookId,provider:book.installed,context,canonical};
    if(bookId==='chaos-space-marines'&&enhancement.id==='enhancement-living-carapace'&&canonical.some(effect=>effect.delta===1))samples.numeric=sample;
    if(!samples.multiple&&canonical.length>1)samples.multiple=sample;
    if(!samples.condition&&canonical.some(effect=>effect.condition))samples.condition=sample;
    if(!samples.reference&&canonical.some(effect=>effect.canonicalReference))samples.reference=sample;
    if(!samples.scope&&canonical.some(effect=>effect.targetInstanceId&&effect.source?.ownerInstanceId))samples.scope=sample;
  }
  assert.ok(emitted>0,`${bookId}: representative current provider states emitted no canonical effects`);nonEmptyBooks+=1;
}
assert.equal(sourceContracts,549,'unique source effect contracts');
assert.equal(effectiveBindings,775,'effective effect bindings');
assert.equal(effectTypes.size,11,'canonical effect operation vocabulary');
assert.equal(nonEmptyBooks,9,'all supported books must exercise a non-empty actual interpreter result');

const transformed=(provider,transform)=>({gameEffects(context){return transform(provider.gameEffects(context));}});
const killed=(label,sample,transform)=>{
  assert.ok(sample,`${label}: representative real interpreter output is absent`);
  assert.throws(()=>assertEqual(transformed(sample.provider,transform).gameEffects(sample.context),sample.canonical,label),/provider result differs/,`${label} must be detected behaviorally`);
  console.log(`${label}=KILLED`);
};
killed('NUMERIC_MUTATION',samples.numeric,effects=>effects.map(effect=>typeof effect.delta==='number'?{...effect,delta:effect.delta+7}:effect));
killed('G1_PROVIDER_PLUS_7_ATTACK',samples.numeric,effects=>effects.map(effect=>typeof effect.delta==='number'?{...effect,delta:effect.delta+7}:effect));
killed('EFFECT_INSERTION_MUTATION',samples.numeric,effects=>[...effects,{...effects[0],id:'inserted-effect'}]);
killed('EFFECT_REMOVAL_MUTATION',samples.numeric,effects=>effects.slice(1));
killed('TARGET_MUTATION',samples.numeric,effects=>effects.map((effect,index)=>index?effect:{...effect,targetId:'T'}));
killed('CONDITION_MUTATION',samples.condition,effects=>effects.map(effect=>effect.condition?{...effect,condition:null,state:'active',certainty:'current'}:effect));
killed('SCOPE_MUTATION',samples.scope,effects=>effects.map((effect,index)=>index?effect:{...effect,targetInstanceId:'wrong-runtime-subject',source:{...effect.source,ownerInstanceId:'wrong-runtime-owner'}}));
killed('CANONICAL_REFERENCE_MUTATION',samples.reference,effects=>effects.map(effect=>effect.canonicalReference?{...effect,canonicalReference:{...effect.canonicalReference,id:'core-deep-strike'}}:effect));
killed('COUNT_PRESERVING_EFFECT_SUBSTITUTION',samples.multiple,effects=>effects.map((effect,index)=>index?effect:{...effects[1],id:effect.id}));

console.log('CURRENT_PROVIDER_INTERPRETER_MISMATCHES=0');
console.log('PROVIDER_POSTPROCESS_FACTUAL_MUTATIONS=0');
console.log(`Effect provider/interpreter equality QA: PASS (${sourceContracts} source contracts, ${effectiveBindings} effective bindings, ${effectTypes.size} operation types, ${providerPaths} audited provider surfaces, ${realComparisons} representative runtime comparisons).`);
