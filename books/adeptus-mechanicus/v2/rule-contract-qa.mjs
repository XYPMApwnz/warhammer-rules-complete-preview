import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {buildAdMechContracts,compileAdMechContracts,artifacts,readJson,declarationFiles,directory} from './rule-contract-build.mjs';
import {compilerInputs,createAdMechCompatibilityCompiler} from './rule-contract-context.mjs';
import {validateContractBinding,inspectDeclarationEvidence,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
import {rejectPairwiseAuthority} from '../../shared/rule-contract-v2/compatibility.mjs';

const canonical=readJson('generated/effective.json'),built=buildAdMechContracts(),compiled=compileAdMechContracts(built);
const index=new Map(canonical.entities.map(entity=>[entity.id,entity]));
const leaves=value=>!value||typeof value!=='object'?[]:typeof value.predicate==='string'?[value]:
  Object.values(value).flatMap(child=>Array.isArray(child)?child.flatMap(leaves):leaves(child));
const get=(entity,field)=>field.reduce((value,key)=>value?.[key],entity.data);
let controls=0,mutations=0;
const check=(value,message)=>{controls++;assert.ok(value,message);};
const equivalent=(a,b,message)=>{controls++;assert.deepEqual(a,b,message);};
const negative=(run,message)=>{mutations++;assert.throws(run,undefined,message);};

// Independent identity/owner denominator: count substantive current source
// owners, not compiler rows, declarations or legacy certification counts.
const expected=canonical.entities.filter(entity=>
  ['ARMY_RULE_COMPONENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','SOURCE_ERRATUM','WEAPON_PROFILE_SELECTION'].includes(entity.kind)||
  entity.kind==='DATASHEET_SECTION'&&entity.data.title!=='UNIT COMPOSITION'||
  entity.kind==='WARGEAR_OPTION'&&entity.data.text!=='None');
equivalent(expected.length,204,'Current accepted owner census changed; review required');
equivalent(built.schema.evaluator.validateContracts(built.book).rules,189,'Represented owner census changed');
equivalent(built.blockedIds.size,15,'Complete blocked owner census changed');
equivalent(new Set([...built.book.entities.filter(entity=>entity.ruleContract).map(entity=>entity.id),...built.blockedIds]),
  new Set(expected.map(entity=>entity.id)),'Source rule owner left unaccounted');
for(const entity of built.book.entities) {
  const original=index.get(entity.id),{ruleContract,...facts}=entity;
  equivalent(facts,original,'Contract build changed canonical facts');
  if(!ruleContract)continue;
  const declaration=bindDeclarationClauses(structuredClone(built.declarations.get(entity.id)));
  validateContractBinding({entity,bookId:built.book.bookId,schema:'rule-contract/v2',declaration,
    currentness:ruleContract.currentness},ruleContract);
  inspectDeclarationEvidence(ruleContract,index,original);
  check(ruleContract.sourceId===original.provenance.sourceId,'Source provenance');
  if(['STRATAGEM','ENHANCEMENT','DETACHMENT_RULE'].includes(original.kind))
    equivalent(ruleContract.detachmentId,original.parentId,'Canonical Detachment ownership missing');
  for(const predicate of leaves(ruleContract)) {
    check(predicate.contextLevel===({MODEL_KEYWORD:'STATIC',UNIT_KEYWORD:'STATIC',MODEL_ID:'STATIC',UNIT_ID:'STATIC',
      MODEL_ABILITY:'STATIC',DETACHMENT:'ROSTER',LEADING:'ROSTER',BODYGUARD_ID:'ROSTER',CHARACTER_MODEL_COUNT:'ROSTER',ALWAYS:'STATIC'}[predicate.predicate]||predicate.contextLevel),'Typed context drift');
    if(predicate.predicate==='FIELD'&&predicate.arguments.key==='phase')
      check(['COMMAND','MOVEMENT','SHOOTING','CHARGE','FIGHT'].includes(predicate.arguments.equals),'Multiple incompatible phase encodings');
  }
}
check(built.blocked.every(item=>item.ruleId&&JSON.stringify(item).includes('BLOCKED_MISSING_GENERIC_PRIMITIVE')),'Explicit bounded blockers');
for(const entity of built.book.entities.filter(entity=>entity.kind==='ENHANCEMENT'&&entity.ruleContract)) {
  const owner=entity.ruleContract.roles.find(role=>role.id===entity.ruleContract.assignment.ownerRoleId);
  check(owner.subject==='MODEL','Published normal Enhancement owner is MODEL');
  check(leaves(owner.selector).some(atom=>atom.predicate==='MODEL_KEYWORD'&&atom.arguments.keyword==='CHARACTER'&&
    atom.evidence.otherEntityId==='book-introduction'),'Source-global CHARACTER restriction dropped');
  check(!leaves(owner.selector).some(atom=>atom.contextLevel==='BATTLE'),'Battle activation confused with owner eligibility');
}
for(const unitId of ['skitarii-rangers','skitarii-vanguard']) {
  const clause=built.book.entities.find(entity=>entity.id===`datasheet-${unitId}:section:1`).ruleContract.clauses.find(clause=>clause.operation==='GRANT_WEAPON_ABILITY');
  equivalent(clause.operationParameters.targetBinding,'SOURCE_UNIT','Omnispex invented an attachment requirement');
  equivalent(clause.operationParameters.targetSubject,'UNIT');
}

// Literal source conditions and roles are inspected separately from producer
// validation. Unknown means absent roster/battle state, never parser failure.
const stratagems=canonical.entities.filter(entity=>entity.kind==='STRATAGEM');
equivalent(stratagems.length,51);
for(const entity of stratagems) {
  const contract=built.book.entities.find(record=>record.id===entity.id).ruleContract;
  check(contract,'Every current Stratagem has a contract');
  equivalent(contract.cp,entity.data.cp);
  const target=entity.data.lines.find(line=>line.label==='TARGET'),field=['lines',entity.data.lines.indexOf(target),'text'];
  const atoms=leaves(contract),primary=contract.roles.find(role=>contract.compatibilityRoleIds.includes(role.id));
  if(/^One [^.]* model from your army/.test(target.text))equivalent(primary.subject,'MODEL','MODEL target flattened to UNIT');
  for(const [pattern,key,value]of [
    [/not been selected to shoot/,'selectedToShootThisPhase',false],
    [/not been selected to fight/,'selectedToFightThisPhase',false],
    [/not been selected to move/,'selectedToMoveThisPhase',false],
    [/not within Engagement Range|unengaged/,'withinEngagementRangeOfEnemy',false],
    [/below its Starting Strength/,'belowStartingStrength',true]
  ])if(pattern.test(target.text))check(atoms.some(atom=>atom.predicate==='FIELD'&&atom.arguments.key===key&&
    atom.arguments.equals===value&&atom.contextLevel==='BATTLE'),'Source TARGET condition omitted: '+entity.id+'/'+key);
  for(const match of target.text.matchAll(/excluding ([A-Z][A-Z -]+?)(?: units| models|\))/g)) {
    const words=match[1].trim();
    check(atoms.some(atom=>atom.predicate.endsWith('_KEYWORD')&&atom.arguments.keyword===words&&atom.contextLevel==='STATIC'),
      'Static TARGET exclusion omitted: '+entity.id+'/'+words);
  }
  check(contract.sourceFields.some(path=>JSON.stringify(path)===JSON.stringify(field)),'TARGET evidence severed');
}

const {book:view,profileBindings,composition}=compilerInputs(built.book),compiler=compiled.compiler,evaluator=built.schema.evaluator;
equivalent(profileBindings.length,35);
const mixed='unit-servitor-battleclade',underseer='datasheet-servitor-battleclade:profile:servitor-underseer',
  servitors='datasheet-servitor-battleclade:profile:combat-and-gun-servitors';
const under=compiler.context(mixed,'MODEL',{profileId:underseer}),others=compiler.context(mixed,'MODEL',{profileId:servitors});
check(under.intrinsicKeywords.has('TECH-PRIEST')&&!others.intrinsicKeywords.has('TECH-PRIEST'),'Underseer keyword leaked');
check(compiler.context(mixed,'UNIT').keywords.has('TECH-PRIEST'),'UNIT did not inherit its own MODEL keyword union');
equivalent(composition.filter(row=>row.unitId===mixed).map(row=>row.maxModels),[1,8]);
const objectiveModelRule='detachment-explorator-maniple:stratagem:3';
const modelResult=compiler.evaluateRule(mixed,objectiveModelRule);
equivalent(modelResult.roles[0].profileResults.map(row=>row.state),['UNKNOWN','FALSE'],'Mixed MODEL applicability lost');

// Real source-required secondary friendly target; enemy/objective presence
// remains unknown and optional friendly recipients do not become mandatory.
const smokeRule='detachment-explorator-maniple:stratagem:5';
check(['UNKNOWN','FALSE'].includes(compiler.evaluateRule('unit-skitarii-rangers',smokeRule).state));
const broad=compiler.evaluateRule('unit-skorpius-dunerider','detachment-rad-zone-corps:stratagem:1');
equivalent(broad.roles.find(role=>role.roleId==='target').state,'FALSE','Primary STATIC VEHICLE exclusion became conditional');
equivalent(broad.state,'UNKNOWN','Source-permitted optional SKITARII non-BATTLELINE recipient incorrectly excluded');
equivalent(compiler.evaluateRule('unit-kataphron-breachers','detachment-haloscreed-battle-clade:stratagem:6').state,
  'FALSE','Single-target STATIC KATAPHRON exclusion became conditional');
const unknown=compiler.evaluateRule('unit-skitarii-rangers','detachment-haloscreed-battle-clade:stratagem:1');
equivalent(unknown.state,'UNKNOWN','Missing battle/Detachment state invented');
const unselected=compiler.evaluateRule('unit-skitarii-rangers','detachment-haloscreed-battle-clade:stratagem:1',
  {detachmentIds:['detachment-rad-zone-corps']});
equivalent(unselected.state,'FALSE','Unselected Detachment leaked');
const reconRule='detachment-cohort-acquisitus:stratagem:2';
equivalent(compiler.evaluateRule('unit-skitarii-rangers',reconRule,{detachmentIds:['detachment-cohort-acquisitus']}).state,
  'UNKNOWN','Selected Detachment keyword grant omitted from applicability');
check(compiler.context('unit-skitarii-rangers','UNIT',{detachmentId:'detachment-cohort-acquisitus'}).keywords.has('RECON AUGURY'));
check(compiler.context('unit-skitarii-rangers','UNIT').unknownKeywords.has('RECON AUGURY'));
check(!compiler.context('unit-skitarii-rangers','MODEL',{detachmentId:'detachment-cohort-acquisitus',profileId:'datasheet-skitarii-rangers:profile:default'}).keywords.has('RECON AUGURY'),
  'UNIT keyword grant incorrectly became a MODEL keyword');

const ownerRule='detachment-haloscreed-battle-clade:enhancement:4',dominus='unit-tech-priest-dominus';
equivalent(compiler.evaluateRule(dominus,ownerRule,{detachmentIds:['detachment-haloscreed-battle-clade']}).state,'TRUE','Eligible exact physical owner rejected');
equivalent(compiler.evaluateRule(mixed,ownerRule,{detachmentIds:['detachment-haloscreed-battle-clade']}).state,'FALSE','Non-CHARACTER Underseer admitted as Enhancement owner');
const instances=[{instanceId:'copy-a',canonicalUnitId:dominus},{instanceId:'copy-b',canonicalUnitId:dominus},
  {instanceId:'bodyguard',canonicalUnitId:mixed}];
function availableContext(instance,subject) {
  const base=compiler.context(instance.canonicalUnitId,subject,{profileId:instance.profileId});
  return {...base,instanceId:instance.instanceId,owner:{...base.owner,instanceId:instance.instanceId},
    keywords:new Set([...base.keywords,'CHARACTER']),roster:{leading:instance.instanceId==='copy-a'}};
}
const physical=compiler.evaluateRule(mixed,ownerRule,{mode:'ROSTER',instanceId:'bodyguard',instances,availableContext,
  detachmentIds:['detachment-haloscreed-battle-clade']});
equivalent(physical.state,'FALSE','Formed CHARACTER contaminated physical MODEL ownership');
for(const instanceId of ['copy-a','copy-b'])equivalent(compiler.evaluateRule(dominus,ownerRule,{mode:'ROSTER',instanceId,instances,availableContext,
  detachmentIds:['detachment-haloscreed-battle-clade']}).state,'TRUE','Independent physical owners contaminated');
const leadingClause=built.book.entities.find(entity=>entity.id==='datasheet-tech-priest-dominus:section:1').ruleContract.clauses[0];
const leadingAtom=leaves(leadingClause.conditions).find(atom=>atom.predicate==='LEADING');
equivalent(leadingAtom.subject,'MODEL');
equivalent(evaluator.evaluatePredicate(leadingAtom,{subject:'MODEL',roster:{leading:false}}),'FALSE');
equivalent(evaluator.evaluatePredicate(leadingAtom,{subject:'MODEL',roster:{leading:true}}),'TRUE');
equivalent(evaluator.evaluatePredicate(leadingAtom,{subject:'MODEL',roster:{}}),'UNKNOWN');

for(const detachment of canonical.entities.filter(entity=>entity.kind==='DETACHMENT')) {
  const projection=compiler.compileRows({kinds:['STRATAGEM','ENHANCEMENT','DETACHMENT_RULE'],
    contextForRule:()=>({detachmentIds:[detachment.id]})});
  for(const row of projection.rows) {
    const owner=index.get(row.ruleId).parentId;
    check(owner===detachment.id||row.state==='FALSE','Cross-Detachment leakage');
    check(row.state!=='INVALID','Invalid selected-Detachment context');
  }
}
equivalent(compiled.projection.rows.length,34*built.schema.evaluator.validateContracts(built.book).rules);
equivalent(compiled.summary.INVALID,0);
equivalent(artifacts(built,compiled),artifacts(buildAdMechContracts(),compileAdMechContracts(buildAdMechContracts())),'Nondeterministic disposable rebuild');

function verify(candidate) {
  evaluator.validateContracts(candidate);
  for(const entity of candidate.entities.filter(entity=>entity.ruleContract)) {
    const declaration=bindDeclarationClauses(structuredClone(built.declarations.get(entity.id)));
    validateContractBinding({entity,bookId:candidate.bookId,schema:'rule-contract/v2',declaration,
      currentness:built.book.entities.find(original=>original.id===entity.id).ruleContract.currentness},entity.ruleContract);
  }
}
const mutate=(id,change)=>{
  const candidate=structuredClone(built.book);change(candidate.entities.find(entity=>entity.id===id));return candidate;
};
const first='detachment-haloscreed-battle-clade:stratagem:1';
negative(()=>verify(mutate(first,entity=>entity.ruleContract.roles[0].conditions.pop())),'Dropped TARGET condition');
negative(()=>verify(mutate(first,entity=>entity.ruleContract.roles[0].subject='MODEL')),'UNIT/MODEL substitution');
negative(()=>verify(mutate(first,entity=>entity.ruleContract.sourceId='unbound-source')),'Severed source');
negative(()=>verify(mutate(first,entity=>entity.ruleContract.ruleId='invented-owner')),'Changed canonical identity');
negative(()=>verify(mutate(first,entity=>entity.ruleContract.conditions=[])),'Dropped scope/timing');
const timed=built.book.entities.find(entity=>entity.ruleContract?.duration?.some(duration=>duration.bindings?.length));
negative(()=>verify(mutate(timed.id,entity=>entity.ruleContract.duration.find(duration=>duration.bindings?.length).bindings[0].roleIds=[])),'Lost duration recipient');
negative(()=>verify(mutate('detachment-rad-zone-corps:stratagem:1',entity=>{
  leaves(entity.ruleContract.roles[0].selector).find(atom=>atom.arguments.keyword==='VEHICLE').contextLevel='BATTLE';
})),'STATIC exclusion demoted');
const manual=structuredClone(built.book);manual.answers={[mixed]:{[first]:'MATCH'}};
negative(()=>rejectPairwiseAuthority(manual),'Manual authoritative unit/rule answer');
const disposable=structuredClone(built.book);disposable.generated={authority:'DISPOSABLE_PROJECTION',answers:manual.answers};
rejectPairwiseAuthority(disposable);
equivalent(createAdMechCompatibilityCompiler(disposable,evaluator).compileRows({
  kinds:['ARMY_RULE','DATASHEET_ABILITY','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','FAQ_ERRATA_RULE','OTHER_RULE'],sort:true}),
  compiled.projection,'Poisoned generated rows became factual authority');
negative(()=>verify(mutate(first,entity=>entity.ruleContract.detachmentId=undefined)),'Removed typed Detachment identity');
const poisonedSource=structuredClone(canonical);
poisonedSource.entities.find(entity=>entity.id===first).data.lines[1].text='POISONED SOURCE TARGET';
negative(()=>buildAdMechContracts({book:poisonedSource}),'Accepted source contradiction silently retained old semantics');

// Closed-input execution is stronger than naming a zero-read counter: no DG,
// V1 AM source/contracts/runtime or old generated answers exist in this tree.
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'am-contract-closed-'));
try {
  const root=path.resolve(directory,'../../..');
  const files=[...declarationFiles,'contract-composition-bindings.json','generated/effective.json',
    'rule-contract-build.mjs','rule-contract-context.mjs','rule-contract-schema.mjs'].map(name=>'books/adeptus-mechanicus/v2/'+name)
    .concat(['schema.mjs','bindings.mjs','compatibility.mjs'].map(name=>'books/shared/rule-contract-v2/'+name),
      ['compatibility-feasibility.mjs','compatibility-context.mjs'].map(name=>'books/shared/roster-v2/'+name));
  for(const name of files){const destination=path.join(temporary,name);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,name),destination);}
  execFileSync(process.execPath,[path.join(temporary,'books/adeptus-mechanicus/v2/rule-contract-build.mjs')],{encoding:'utf8'});
  for(const [name,value]of Object.entries(artifacts(built,compiled)))equivalent(JSON.parse(fs.readFileSync(path.join(temporary,'books/adeptus-mechanicus/v2/generated/'+name+'.json'),'utf8')),value,'Legacy/DG disconnect changed output');
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
console.log(JSON.stringify({status:'PASS',owners:expected.length,validContracts:built.schema.evaluator.validateContracts(built.book).rules,
  blockedOwners:built.blockedIds.size,stratagems:51,profiles:35,compatibility:compiled.summary,controls,mutations,
  legacyContractReads:0,closedInputIsolation:'PASS',effectsRuntimeStarted:false}));
