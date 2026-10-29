/** Deterministic evidence for the conditions migration. No sources are fetched.
 * --write regenerates the two audit documents; --check compares exact bytes.
 * --package FILE and --parity FILE accept stable external measurements. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {conditionDefinitions,conditionSpec,conditionIdentity,translateFieldArguments} from '../../books/shared/rule-contract-v2/conditions.mjs';
import {conditionDeclarationView,validateBookConditions} from '../../books/shared/rule-contract-v2/conditions-build.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const base='98342d0670117e15dd8fb7871b2132252a128a92';
const artifacts={
 'adeptus-mechanicus':'roster-runtime','blood-angels':'roster-import','chaos-space-marines':'roster-runtime',
 'dark-angels':'roster-import','death-guard':'rule-contract-effective','emperors-children':'roster-attachments',
 'space-marines':'roster-import','tau-empire':'roster-import','tyranids':'roster-runtime'
};
const args=process.argv.slice(2),mode=args[0];
assert.ok(['--write','--check'].includes(mode),'Use --write or --check');
const measurementFiles={};
for(let index=1;index<args.length;index+=2){
 const option=args[index];assert.ok(['--package','--parity'].includes(option),'Unsupported argument '+option);
 assert.ok(args[index+1]&&!args[index+1].startsWith('--'),option+' needs a JSON measurement file');
 assert.ok(!measurementFiles[option],'Duplicate measurement option '+option);measurementFiles[option]=args[index+1];
}
const compare=(a,b)=>a<b?-1:a>b?1:0;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const clone=structuredClone;
const gitCache=new Map();
const git=file=>{
 if(!gitCache.has(file))gitCache.set(file,execFileSync('git',['show',`${base}:${file}`],{cwd:root,maxBuffer:64*1024*1024}));
 return gitCache.get(file);
};
const read=file=>fs.readFileSync(path.join(root,file));
const oldText=file=>git(file).toString('utf8');
const sourceReferences=new Map();
function reference(file,anchor){
 assert.ok(!path.isAbsolute(file)&&!file.split('/').includes('..'),'Non-portable source path');
 const text=read(file).toString('utf8'),index=text.indexOf(anchor);
 assert.ok(index>=0,`Missing code reference ${file}: ${anchor}`);
 const value={path:file,line:text.slice(0,index).split('\n').length,anchor};
 sourceReferences.set(file+':'+value.line,value);return value;
}
const sharedRefs={
 dictionary:reference('books/shared/rule-contract-v2/conditions.mjs','export const conditionDefinitions'),
 translation:reference('books/shared/rule-contract-v2/conditions.mjs','export function translateFieldArguments'),
 compiler:reference('books/shared/rule-contract-v2/conditions-build.mjs','export function compileBookConditions'),
 inverse:reference('books/shared/rule-contract-v2/conditions-build.mjs','export function conditionDeclarationView'),
 physicalContext:reference('books/shared/roster-v2/context.mjs','export function predicateContext'),
 equipment:reference('books/shared/roster-v2/effects.mjs','equipmentRequirementSatisfied'),
 rosterComputations:reference('books/shared/roster-v2/condition-context.mjs','export function computeRosterCondition')
};
const schemaFiles={
 'adeptus-mechanicus':['books/adeptus-mechanicus/v2/rule-contract-schema.mjs'],
 'blood-angels':['books/blood-angels/v2/rule-contract-schema.mjs','books/space-marines/v2/rule-contract-schema.mjs'],
 'chaos-space-marines':['books/chaos-space-marines/v2/rule-contract-build.mjs'],
 'dark-angels':['books/dark-angels/v2/rule-contract-schema.mjs'],
 'death-guard':['books/death-guard/v2/rule-contract-schema.mjs','books/death-guard/v2/rule-contract-state-fields.mjs'],
 'emperors-children':['books/emperors-children/v2/rule-contract-schema.mjs','books/emperors-children/v2/rule-contract-permission-declarations.mjs'],
 'space-marines':['books/space-marines/v2/rule-contract-schema.mjs'],
 'tau-empire':['books/tau-empire/v2/rule-contract-schema.mjs'],
 'tyranids':['books/tyranids/v2/roster-source-choices.mjs']
};
const spec=(contextLevel,valueType)=>({contextLevel,valueType});
function literalFields(file){
 return Object.fromEntries([...oldText(file).matchAll(/\b([A-Za-z]\w*):\s*\{contextLevel:'(ROSTER|BATTLE)',valueType:'(boolean|string|number)'/g)]
  .map(match=>[match[1],spec(match[2],match[3])]));
}
/** These are source-code declaration forms, not gameplay-text heuristics. */
function originalSchemaFields(bookId,book){
 if(book.rosterSchema?.stateFields)return clone(book.rosterSchema.stateFields);
 if(bookId==='blood-angels')return literalFields('books/space-marines/v2/rule-contract-schema.mjs');
 if(['space-marines','tau-empire'].includes(bookId))return literalFields(schemaFiles[bookId][0]);
 if(bookId==='death-guard'){
  const text=oldText('books/death-guard/v2/rule-contract-state-fields.mjs');
  return JSON.parse(text.slice(text.indexOf('Object.freeze(')+'Object.freeze('.length,text.lastIndexOf(');')));
 }
 if(bookId==='dark-angels'){
  const text=oldText(schemaFiles[bookId][0]),result=literalFields(schemaFiles[bookId][0]);
  for(const match of text.matchAll(/for\s*\(const key of\s*(\[[^\]]+\])\)\s*stateFields\[key\]=\{contextLevel:'(ROSTER|BATTLE)',valueType:'(boolean|string|number)'\}/g))
   for(const key of [...match[1].matchAll(/'([^']+)'/g)].map(value=>value[1]))result[key]=spec(match[2],match[3]);
  for(const match of text.matchAll(/stateFields\.([A-Za-z]\w*)=\{contextLevel:'(ROSTER|BATTLE)',valueType:'(boolean|string|number)'\}/g))result[match[1]]=spec(match[2],match[3]);
  return result;
 }
 if(bookId==='emperors-children'){
  const file=schemaFiles[bookId][0],text=oldText(file),result=literalFields(file);
  const id=text.match(/export const bladeId='([^']+)'/);assert.ok(id,'Missing original explicit Blade identity');
  result['selectedUpgrade:'+id[1]]=spec('ROSTER','string');
  const permissions=oldText(schemaFiles[bookId][1]);
  for(const match of permissions.matchAll(/event:\{[^}]*key:'([^']+)'/g))result[match[1]]=spec('BATTLE','boolean');
  return result;
 }
 if(bookId==='tyranids'){
  const file=schemaFiles[bookId][0],text=oldText(file),result=literalFields(file);
  const key=text.match(/export const trygonChoiceField='([^']+)'/);assert.ok(key,'Missing original explicit source-choice key');
  result[key[1]]=spec('ROSTER','string');return result;
 }
 throw new Error('Unregistered schema producer '+bookId);
}
const excluded=entity=>entity.kind==='STRATAGEM'||entity.ruleContract?.kind==='STRATAGEM';
const pointer=key=>String(key).replaceAll('~','~0').replaceAll('/','~1');
function nodes(value,prefix='',out=[]){
 if(!value||typeof value!=='object')return out;
 if(value.predicate==='FIELD')out.push({path:prefix,node:value});
 for(const [key,child]of Object.entries(value))if(key!=='evidence')nodes(child,prefix+'/'+pointer(key),out);
 return out;
}
function containsField(value,key){return nodes(value).some(row=>row.node.arguments?.key===key&&row.node.arguments.equals===true);}
function stripPermittedMetadata(book){
 const copy=clone(book);delete copy.conditionBindingOptions;delete copy.conditionSchema;return copy;
}
/** Step zero removed only the already proved Bodyguard-only annotation. */
function removeProvedFabiusAliases(before,current){
 let count=0;
 for(const entity of before.entities)for(const clause of entity.ruleContract?.clauses||[]){
  if(clause.recipientScope!=='BODYGUARD_COMPONENT_MODELS')continue;
  assert.equal(entity.id,'datasheet-fabius-bile:section:1:block:0:text','Unexpected Bodyguard alias owner');
  assert.ok(['bodyguard-melee-strength','bodyguard-toughness'].includes(clause.id),'Unexpected Bodyguard alias clause');
  const target=current.entities.find(row=>row.id===entity.id).ruleContract.clauses.find(row=>row.id===clause.id);
  assert.deepEqual(target.recipients,clause.recipients,'Fabius recipient addresses changed');
  assert.ok(clause.recipients.length&&clause.recipients.every(row=>row.from==='SOURCE_FORMED_MODELS'));
  assert.ok(containsField(clause,'isBodyguardComponentOfSource')||containsField(clause,'isBodyguardModel'),'Bodyguard restriction lost');
  assert.ok(!Object.hasOwn(target,'recipientScope'),'Unused Bodyguard alias retained');
  delete clause.recipientScope;count++;
 }
 return count;
}
const physicalNames=new Set(['createPhysicalEquipmentConditionContext','createVerifiedPhysicalConditionContext','createSourceEquipmentConditionContext',
 'createSelectedSourceChoiceConditionContext','createEquippedWeaponChoiceConditionContext','createInitialAttachmentConditionContext']);
function nativeSourceReferences(bookId){
 const directory=path.join(root,'books',bookId,'v2'),result=[];
 for(const name of fs.readdirSync(directory).sort(compare)){
  if(!name.endsWith('.mjs')||name.includes('-qa.')||name.includes('fixtures'))continue;
  const file=`books/${bookId}/v2/${name}`,text=read(file).toString('utf8');
  for(const name of physicalNames)if(text.includes(name))result.push(reference(file,name));
 }
 return result;
}
function availability(book,arguments_,nativeRefs){
 const identity=conditionIdentity(arguments_);
 const plan=(book.conditionComputations||[]).find(row=>conditionIdentity({key:row.key,...row.arguments})===identity);
 if(plan&&plan.kind!=='CONTEXT_FIELD')return {status:'DECLARED_COMPUTATION',computedBy:'computeRosterCondition',kind:plan.kind,source:sharedRefs.rosterComputations};
 const definition=conditionSpec(arguments_),declared=String(definition?.computedBy||'');
 if(declared==='computeRosterCondition')return {status:'NO_COMPUTER_FOR_THIS_IDENTITY',reason:'A dictionary computation name does not establish an existing plan for this parameterized identity.'};
 if(declared==='predicateContext')return {status:'SHARED_PHYSICAL_CONTEXT',computedBy:declared,source:sharedRefs.physicalContext};
 if(declared==='executeRosterEffects')return {status:'SOURCE_EFFECT_CONTEXT',computedBy:declared,source:sharedRefs.equipment,
  limitation:'Available only in an effect source context carrying the existing equipment requirement. Other contexts may remain UNKNOWN.'};
 const names=declared.split('/').map(value=>value.trim()).filter(name=>physicalNames.has(name));
 if(arguments_.key==='selectedUpgrade'&&arguments_.selectionMode!=='VALIDATED_EQUIPPED_WEAPON')return {status:'NO_COMPUTER_FOR_THIS_IDENTITY',reason:'No matching canonical option computation is declared for this identity.'};
 const sources=nativeRefs.filter(ref=>names.includes(ref.anchor));
 if(sources.length)return {status:'NATIVE_ADAPTER_CALLS_SHARED_COMPUTER',computedBy:names,sources};
 return {status:'NO_COMPUTER_FOUND',reason:declared?'No existing invocation was found for this book and condition identity.':'No production computer is declared; supplied context remains possible and absence remains UNKNOWN.'};
}
const books=[],allMappings=[],unknownRoster=[],allOriginalDeclarations=[],codeInputs=new Map();
const explicitComputationConstants=[];
let unchangedStratagems=0,fabiusAliasesRemoved=0,baselineDataBytes=0,currentDataBytes=0;
for(const [bookId,artifact]of Object.entries(artifacts)){
 const file=`books/${bookId}/v2/generated/${artifact}.json`,beforeBytes=git(file),currentBytes=read(file);
 const before=JSON.parse(beforeBytes),current=JSON.parse(currentBytes),inverse=conditionDeclarationView(current);
 assert.equal(current.bookId,bookId);assert.equal(current.conditionSchema,'conditions/v1','Missing compiled native condition boundary');
 const validation=validateBookConditions(current),nativeRefs=nativeSourceReferences(bookId);
 assert.equal(new Set(before.entities.map(row=>row.id)).size,before.entities.length,'Duplicate baseline entity');
 assert.equal(new Set(current.entities.map(row=>row.id)).size,current.entities.length,'Duplicate feature entity');
 const actual=new Map(current.entities.map(row=>[row.id,row])),fields=originalSchemaFields(bookId,before),mappings=[],stratagemFields=new Map();
 const schemaUsage=new Map();
 for(const entity of before.entities)for(const row of nodes(entity.ruleContract)){
  const key=row.node.arguments.key;if(!schemaUsage.has(key))schemaUsage.set(key,{nonStratagemOccurrences:0,stratagemOccurrences:0});
  schemaUsage.get(key)[excluded(entity)?'stratagemOccurrences':'nonStratagemOccurrences']++;
 }
 for(const [oldKey,spec_]of Object.entries(fields).sort(([a],[b])=>compare(a,b))){
  const translated=translateFieldArguments({key:oldKey},{book:current});
  const usage=schemaUsage.get(oldKey)||{nonStratagemOccurrences:0,stratagemOccurrences:0};
  const row={bookId,oldKey,...spec_,key:translated.key,arguments:Object.fromEntries(Object.entries(translated).filter(([key])=>key!=='key')),
   ...usage,unusedInFrozenArtifact:usage.nonStratagemOccurrences+usage.stratagemOccurrences===0,
   sources:schemaFiles[bookId]};allOriginalDeclarations.push(row);
 }
 for(const entity of before.entities){
  const target=actual.get(entity.id);assert.ok(target,'Lost entity '+entity.id);
  if(excluded(entity)){
   assert.equal(JSON.stringify(target),JSON.stringify(entity),'Excluded Stratagem changed '+entity.id);unchangedStratagems++;
   for(const row of nodes(entity.ruleContract)){
    const key=row.node.arguments.key;if(!stratagemFields.has(key))stratagemFields.set(key,[]);stratagemFields.get(key).push(entity.id);
   }
   continue;
  }
  assert.equal(new Set((entity.ruleContract?.clauses||[]).map(row=>row.id)).size,entity.ruleContract?.clauses?.length||0,'Duplicate clause identity');
  const oldNodes=nodes(entity.ruleContract),newNodes=new Map(nodes(target.ruleContract).map(row=>[row.path,row.node]));
  assert.equal(newNodes.size,oldNodes.length,'FIELD occurrence lost or duplicated '+entity.id);
  for(const {path:location,node}of oldNodes){
   const translated=translateFieldArguments(node.arguments,{book:current,node,entity});
   const actualNode=newNodes.get(location);assert.ok(actualNode,'FIELD path changed '+entity.id+location);
   assert.deepEqual(actualNode.arguments,translated,'FIELD translation mismatch '+entity.id+location);
   assert.deepEqual(actualNode.evidence,node.evidence,'FIELD source evidence changed');
   assert.equal(actualNode.subject,node.subject);assert.equal(actualNode.contextLevel,node.contextLevel);
   const computer=node.contextLevel==='ROSTER'?availability(current,translated,nativeRefs):{status:'BATTLE_INPUT_ONLY',computedBy:null};
   const row={bookId,entityId:entity.id,entityKind:entity.kind,path:'/ruleContract'+location,oldArguments:node.arguments,
    arguments:actualNode.arguments,subject:node.subject,level:node.contextLevel,valueType:typeof node.arguments.equals,
    sourceId:entity.provenance?.sourceId||entity.ruleContract?.sourceId||'UNKNOWN',evidencePath:'/ruleContract'+location+'/evidence',
    sourceEvidence:node.evidence?{field:node.evidence.field,otherEntityId:node.evidence.otherEntityId||null,quote:String(node.evidence.quote||'').slice(0,160)}:null,
    computer,translationCode:sharedRefs.translation};
   mappings.push(row);allMappings.push(row);
   if(node.contextLevel==='ROSTER'&&computer.status.startsWith('NO_COMPUTER'))unknownRoster.push(row);
  }
 }
 const oldForComparison=stripPermittedMetadata(before),newForComparison=stripPermittedMetadata(inverse);
 for(const [key,binding]of Object.entries(oldForComparison.rosterContextBindings||{}))if(binding.kind==='MARK_SELECTION_ELIGIBLE'){
  const migrated=newForComparison.rosterContextBindings[key],source='books/chaos-space-marines/v2/roster-effect-context.mjs',text=oldText(source);
  const anchor="keywords.has('HERETIC ASTARTES')&&!keywords.has('EPIC HERO')";
  assert.ok(text.includes(anchor),'Missing original literal keyword restriction proof');
  for(const [field,value]of [['requiredKeywords',['HERETIC ASTARTES']],['excludedKeywords',['EPIC HERO']]]){
   assert.deepEqual(migrated[field],value,'Migrated computation changed an original literal restriction');
   delete migrated[field];explicitComputationConstants.push({bookId,key,field,value,source:{base,path:source,line:text.slice(0,text.indexOf(anchor)).split('\n').length,anchor}});
  }
 }
 fabiusAliasesRemoved+=removeProvedFabiusAliases(oldForComparison,newForComparison);
 assert.deepEqual(newForComparison,oldForComparison,bookId+': non-condition facts, recipient semantics, effects, source metadata or declarations changed');
 const presentation=`books/${bookId}/v2/generated/app-presentation.json`;
 assert.ok(read(presentation).equals(git(presentation)),bookId+': card presentation bytes changed');
 const plans=current.conditionComputations||[],missingPlanKeys=[];
 for(const [key]of Object.entries(before.rosterContextBindings||{})){
  const translated=translateFieldArguments({key},{book:current});
  if(!plans.some(row=>conditionIdentity({key:row.key,...row.arguments})===conditionIdentity(translated)))missingPlanKeys.push(key);
 }
 assert.deepEqual(missingPlanKeys,[],'Existing computation binding disappeared');
 const sourcePaths=[file,...schemaFiles[bookId]];
 for(const source of sourcePaths)codeInputs.set(source,{path:source,sha256:sha(read(source))});
 books.push({bookId,input:file,baselineSha256:sha(beforeBytes),currentSha256:sha(currentBytes),baselineBytes:beforeBytes.length,currentBytes:currentBytes.length,
  byteGrowth:currentBytes.length-beforeBytes.length,nonStratagemFieldOccurrences:mappings.length,
  nonStratagemOldKeys:new Set(mappings.map(row=>row.oldArguments.key)).size,canonicalConditionKeys:new Set(mappings.map(row=>row.arguments.key)).size,
  originalSchemaDeclarations:Object.keys(fields).length,preservedNormalizedSchemaDeclarations:current.rosterSchema?.conditionFields?.length||null,
  unknownRosterOccurrences:mappings.filter(row=>row.level==='ROSTER'&&row.computer.status.startsWith('NO_COMPUTER')).length,
  movedComputations:plans,retainedStratagemFields:[...stratagemFields].sort(([a],[b])=>compare(a,b)).map(([key,ids])=>({key,entityIds:[...new Set(ids)].sort(compare)})),
  parity:{stratagemSerializedBytes:'PASS',nonConditionFacts:'PASS',recipientSemantics:'PASS',effectsAndLifetimes:'PASS',sourceEvidence:'PASS',presentationBytes:'PASS'},validation});
 baselineDataBytes+=beforeBytes.length;currentDataBytes+=currentBytes.length;
}
assert.equal(books.length,9);assert.equal(unchangedStratagems,526);assert.equal(fabiusAliasesRemoved,2);
const dictionary=Object.values(conditionDefinitions).map(row=>({key:row.key,level:row.level,valueType:row.valueType,arguments:row.arguments||{},computedBy:row.computedBy||null})).sort((a,b)=>compare(a.key,b.key));
for(const file of ['books/shared/rule-contract-v2/conditions.mjs','books/shared/rule-contract-v2/conditions-build.mjs',
 'books/shared/rule-contract-v2/schema.mjs','books/shared/roster-v2/condition-context.mjs','books/shared/roster-v2/physical-condition-context.mjs'])codeInputs.set(file,{path:file,sha256:sha(read(file))});
for(const {path:file}of sourceReferences.values())codeInputs.set(file,{path:file,sha256:sha(read(file))});
const outputJson=path.join(root,'docs/audit/condition-translation-2.json'),outputMd=path.join(root,'docs/audit/condition-translation-2.md');
const savedMeasurements=fs.existsSync(outputJson)?JSON.parse(fs.readFileSync(outputJson,'utf8')):{};
function measurement(option,property,reason){
 const value=measurementFiles[option]?JSON.parse(fs.readFileSync(measurementFiles[option],'utf8')):
  savedMeasurements[property]||{status:'NOT_MEASURED',reason};
 assert.ok(value&&typeof value==='object'&&!Array.isArray(value),'Malformed '+property);
 assert.ok(!/(?:[A-Z]:[\\/]|\/Users\/|\/home\/|\d{4}-\d\d-\d\dT)/.test(JSON.stringify(value)),property+' must not include checkout paths or timestamps');
 return value;
}
const packageMeasurements=measurement('--package','packageMeasurements','Packaging measurements are supplied after the final package/determinism run.');
const scenarioParityMeasurements=measurement('--parity','scenarioParityMeasurements','Actual before/after scenario trace measurements have not been attached. Static translation and the producer inverse do not establish scenario parity.');
if(scenarioParityMeasurements.status==='MEASURED')assert.equal(scenarioParityMeasurements.zeroDifference,true,'Measured scenario parity must explicitly report zeroDifference=true');
const report={schema:'condition-translation-2/v1',base,bookIds:Object.keys(artifacts),excludedBookIds:['orks'],excludedEntityKinds:['STRATAGEM'],
 scope:'Existing FIELD conditions only. This migration does not infer gameplay semantics or compute formerly unavailable facts.',
 verification:{runtime:'STATIC_TRANSLATION_AND_EXACT_INVERSE',
  scenarioTruthParity:scenarioParityMeasurements.status==='MEASURED'?'EXTERNAL_SCENARIO_TRACE_MEASURED':'NOT_MEASURED',browser:'SEPARATE_BROWSER_SUITE_REQUIRED'},
 summary:{books:books.length,fieldOccurrences:allMappings.length,originalSchemaDeclarations:allOriginalDeclarations.length,dictionaryKeys:dictionary.length,
  unchangedStratagems,authorizedFabiusAliasesRemoved:fabiusAliasesRemoved,unknownRosterOccurrences:unknownRoster.length,
  baselineDataBytes,currentDataBytes,dataByteGrowth:currentDataBytes-baselineDataBytes},
 dictionary,books,originalSchemaDeclarations:allOriginalDeclarations,explicitComputationConstants,
 mappings:allMappings.sort((a,b)=>compare(a.bookId,b.bookId)||compare(a.entityId,b.entityId)||compare(a.path,b.path)),
 rosterConditionsWithoutComputer:unknownRoster.sort((a,b)=>compare(a.bookId,b.bookId)||compare(a.entityId,b.entityId)||compare(a.path,b.path)),
 sourceReferences:[...sourceReferences.values()].sort((a,b)=>compare(a.path,b.path)||a.line-b.line),
 inputs:[...codeInputs.values()].sort((a,b)=>compare(a.path,b.path)),packageMeasurements,scenarioParityMeasurements,
 limitations:[
  'A computer can exist while a particular physical or historical context is unavailable. That remains UNKNOWN.',
  'A dictionary computedBy label alone is not evidence of an existing parameterized computation plan.',
  'Source-effect equipment checks are available only through their existing source execution context.',
  'Conditions inside immutable evidence values are source material, not a second executable condition vocabulary.',
  'Unused schema declarations mean unused in the frozen artifact; dynamic physical bindings can instantiate additional conditions later.',
  'Scenario truth parity, browser behavior and package certification are separate evidence; this inventory does not claim those tests passed.'
 ]};
const cell=value=>String(value??'—').replaceAll('|','\\|').replaceAll('\n',' ');
const lines=['# Condition translation 2 audit','',`Base: \`${base}\`. Native books: nine. Orks and all Stratagem data are excluded.`,
 '', 'This report inventories recorded conditions and proves the exact producer inverse. It does not infer a recipient, a battle fact or a missing roster computation.',
 '', '## Inventory and byte growth','', '| Book | FIELD occurrences | Old keys | Canonical keys | Original schema declarations | Moved computations | ROSTER occurrences without computer | Data bytes before / after |',
 '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'];
for(const row of books)lines.push(`| ${row.bookId} | ${row.nonStratagemFieldOccurrences} | ${row.nonStratagemOldKeys} | ${row.canonicalConditionKeys} | ${row.originalSchemaDeclarations} | ${row.movedComputations.length} | ${row.unknownRosterOccurrences} | ${row.baselineBytes} / ${row.currentBytes} |`);
lines.push('',`Runtime JSON byte growth: **${report.summary.dataByteGrowth} bytes**. All **${unchangedStratagems}** excluded Stratagem entities retain exact serialized bytes. All nine card-presentation artifacts retain exact bytes.`,
 '', 'All recipient declarations, effects, durations, source evidence and non-condition facts match the baseline after the explicit inverse. The only additional difference is removal of the two authorized Fabius Bodyguard aliases; their existing Bodyguard selectors remain unchanged.',
 '', 'Package measurements: `'+JSON.stringify(packageMeasurements)+'`.', '', '## Shared dictionary','', '| Key | Level | Equals type | Parameters | Computed by |','| --- | --- | --- | --- | --- |');
for(const row of dictionary)lines.push(`| ${cell(row.key)} | ${row.level} | ${row.valueType} | ${cell(JSON.stringify(row.arguments))} | ${cell(row.computedBy)} |`);
lines.push('', '## Old key to canonical condition','', 'Rows group identical recorded translations. Individual condition paths, evidence, expected values, subjects and levels remain in the JSON report.');
for(const book of books){
 const groups=new Map();for(const row of report.mappings.filter(row=>row.bookId===book.bookId)){
  const parameters=Object.fromEntries(Object.entries(row.arguments).filter(([key])=>!['key','equals'].includes(key)));
  const id=JSON.stringify([row.oldArguments.key,row.arguments.key,parameters,row.level,row.valueType]);
  if(!groups.has(id))groups.set(id,{old:row.oldArguments.key,key:row.arguments.key,parameters,level:row.level,type:row.valueType,count:0});groups.get(id).count++;
 }
 lines.push('',`### ${book.bookId}`,'','| Old key | Canonical key | Parameters | Level / type | Occurrences |','| --- | --- | --- | --- | ---: |');
 for(const row of [...groups.values()].sort((a,b)=>compare(a.old,b.old)||compare(JSON.stringify(a.parameters),JSON.stringify(b.parameters))))lines.push(`| ${cell(row.old)} | ${cell(row.key)} | ${cell(JSON.stringify(row.parameters))} | ${row.level} / ${row.type} | ${row.count} |`);
}
lines.push('', '## Existing roster conditions without a computer','', 'This list is based on the exact parameterized plan and production adapter invocation, not the dictionary label alone. Explicit supplied context can still be known; absence must remain UNKNOWN.',
 '', '| Book | Rule | Old key | Canonical key | Location |','| --- | --- | --- | --- | --- |');
for(const row of report.rosterConditionsWithoutComputer)lines.push(`| ${row.bookId} | ${cell(row.entityId)} | ${cell(row.oldArguments.key)} | ${cell(row.arguments.key)} | ${cell(row.path)} |`);
lines.push('', '## Actual scenario trace measurements','',
 'These external measurements come from separate before/after execution captures. They are distinct from the static data translation and exact producer-inverse assertions above. Counts, observation coverage, hashes and zero-difference results are recorded only when supplied by that execution harness.',
 '', '```json',JSON.stringify(scenarioParityMeasurements,null,2),'```',
 '', '## Computation ownership and Stratagem boundary','', 'Existing computation kinds and parameters move to the shared plan without inventing availability. The CSM two-pass ability dependency sequence remains an execution requirement; its actual scenario results are separate QA evidence.',
 '', 'Every retained Stratagem key and affected Stratagem identity is listed per book in the JSON report. Legacy source declarations and the temporary inverse are not a runtime fallback for migrated rules.',
 '', '## Evidence and limitations','');
for(const row of report.sourceReferences)lines.push(`- [${row.path}:${row.line}](../../${row.path}#L${row.line}): \`${row.anchor}\`.`);
lines.push('',...report.limitations.map(value=>'- '+value),'', 'Regenerate with `node tools/audit/condition-translation-report.mjs --write`; verify exact bytes with `--check`. Optional `--package FILE` and `--parity FILE` attach stable external measurements. Saved external measurements are reused when their options are omitted, including during `--check`; all repository inputs and static parity assertions are recomputed. A saved external measurement is an attestation, not a new execution of its harness.','');
const json=JSON.stringify(report,null,2)+'\n',markdown=lines.join('\n');
if(mode==='--write'){fs.writeFileSync(outputJson,json,'utf8');fs.writeFileSync(outputMd,markdown,'utf8');}
else{assert.equal(fs.readFileSync(outputJson,'utf8'),json,'Stale condition audit JSON');assert.equal(fs.readFileSync(outputMd,'utf8'),markdown,'Stale condition audit Markdown');}
console.log(JSON.stringify({status:'PASS',...report.summary,nonConditionFactsParity:'PASS',stratagemBytesParity:'PASS',packageMeasurements,scenarioParityMeasurements}));
