import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const legacyPatterns=[
  /books\/death-guard\/generated\//,
  /(?:compatible-rules|correction-ledger|enhancement-owner-matrix)/,
  /books\/death-guard\/(?:scripts|mobile)\//,
  /(?:legacy-matcher|effect-contract-runtime|roster-context)\.(?:m?js)/,
  /(?:^|\/)(?:glossary|glossary-data)(?:\/|\.)/,
  /\/generated\/related-rules-v2\.json$/
];
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..').replace(/\\/g,'/')+'/';
const filename=file=>String(file instanceof URL?fileURLToPath(file):file).replace(/\\/g,'/').replace(root,'');
const forbidden=file=>legacyPatterns.some(pattern=>pattern.test(filename(file)));

// Instrument before the compiler loads. Generated rows and every legacy
// compatibility/owner/matcher/Glossary dependency are actively poisoned.
if(process.argv.includes('--isolation')) {
  const reads=[],read=fs.readFileSync,poison=process.argv.includes('--poison');
  fs.readFileSync=function(file,...args){reads.push(filename(file));if(poison&&forbidden(file))return args[0]?'INVALID_LEGACY_OR_CACHE':Buffer.from('INVALID_LEGACY_OR_CACHE');return read.call(this,file,...args);};
  syncBuiltinESMExports();
  const model=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
  const {buildRelatedRules}=await import('./related-rules-build.mjs');
  const index=buildRelatedRules(model);
  console.log(JSON.stringify({hash:hash(index),forbiddenReads:reads.filter(forbidden),reads}));
  process.exit(0);
}

const {buildRelatedRules,writeRelatedRules,armyBookContext,evaluateRelatedRule}=await import('./related-rules-build.mjs');
const {previousAmbiguityDomain}=await import('./rule-contract-build.mjs');
const {evaluateRole,evaluatePredicate,publicResult}=await import('./rule-contract-schema.mjs');
const {assertSourceTargetConditions}=await import('./stratagem-target-qa.mjs');
const model=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
const index=buildRelatedRules(model),byId=new Map(model.entities.map(entity=>[entity.id,entity]));
const byPair=new Map(index.rows.map(row=>[row.unitId+'\0'+row.ruleId,row]));
assert.equal(byPair.size,index.rows.length,'No duplicate canonical relationships');
assert.equal(index.rows.length,36*75,'Complete current unit × rule domain');
const sourceParity=assertSourceTargetConditions(model);
assert.equal(sourceParity.missing+sourceParity.wrongContext+sourceParity.wrongRole+sourceParity.unresolved,0);

const sourceDomain=previousAmbiguityDomain(model).filter(row=>['STRATAGEM','ENHANCEMENT'].includes(byId.get(row.ruleId).ruleContract.kind));
const outcomes=()=>({MATCH:0,CONDITIONAL:0,NO_MATCH:0,INVALID:0,UNRESOLVED:0});
const domainSummary={STRATAGEM:0,ENHANCEMENT:0,allDetachments:outcomes(),selectedDetachment:outcomes()};
for(const source of sourceDomain) {
  const row=byPair.get(source.unitId+'\0'+source.ruleId);assert.ok(row,'Source relationship is accounted');
  domainSummary[row.kind]++;domainSummary.allDetachments[row.applicability]++;domainSummary.selectedDetachment[row.selectedDetachment.applicability]++;
}
assert.equal(domainSummary.STRATAGEM,591);assert.equal(domainSummary.ENHANCEMENT,164);
assert.equal(domainSummary.allDetachments.INVALID+domainSummary.selectedDetachment.INVALID,0);

// Every exact parent scope can be filtered without leaking another Detachment.
const detachments=model.entities.filter(entity=>entity.kind==='DETACHMENT');
let filterChecks=0;
for(const unit of model.entities.filter(entity=>entity.kind==='DATASHEET'))for(const selected of detachments) {
  const rows=index.rows.filter(row=>row.unitId===unit.id&&row.detachmentId===selected.id);
  assert.equal(new Set(rows.map(row=>row.ruleId)).size,rows.length);
  for(const row of rows) {
    assert.equal(byId.get(row.ruleId).parentId,selected.id);
    assert.deepEqual(row.selectedDetachment,evaluateRelatedRule(model,unit,byId.get(row.ruleId),selected.id));
  }
  filterChecks++;
}
let wrongDetachmentChecks=0;
for(const source of sourceDomain) {
  const rule=byId.get(source.ruleId),unit=byId.get(source.unitId);
  const wrong=detachments.find(detachment=>detachment.id!==rule.ruleContract.detachmentId);
  assert.equal(evaluateRelatedRule(model,unit,rule,wrong.id).state,'FALSE','An explicitly different Detachment cannot activate this rule');
  wrongDetachmentChecks++;
}
const row=(unitId,ruleId)=>{const result=byPair.get(unitId+'\0'+ruleId);assert.ok(result);return result;};
const match=row('unit-biologus-putrifier','detachment-mortarions-hammer:enhancement:1');
assert.equal(match.state,'UNKNOWN','All does not infer selected Detachment');assert.equal(match.selectedDetachment.state,'TRUE');
const noMatch=row('unit-chaos-rhino','detachment-mortarions-hammer:enhancement:1');
assert.equal(noMatch.state,'FALSE');assert.equal(noMatch.selectedDetachment.state,'FALSE','Non-Character cannot own Character enhancement');
const conditional=row('unit-biologus-putrifier','detachment-shamblerot-vectorium:enhancement:4');
assert.equal(conditional.selectedDetachment.state,'UNKNOWN','Leading state remains unavailable');
const bio=byId.get('unit-biologus-putrifier'),owner=byId.get(conditional.ruleId).ruleContract;
const context=armyBookContext(model,bio,owner.roles[0].subject,conditional.detachmentId);
assert.deepEqual(context.roster,{detachmentId:conditional.detachmentId});assert.deepEqual(context.battle,{});
assert.equal(evaluateRole(owner.roles[0],owner.conditions,{...context,roster:{...context.roster,leading:false}}),'FALSE');
assert.equal(evaluateRole(owner.roles[0],owner.conditions,{...context,roster:{...context.roster,leading:true}}),'TRUE');
const plagueMarines=byId.get('unit-plague-marines');
assert.equal(evaluatePredicate({predicate:'UNIT_KEYWORD',subject:'UNIT',contextLevel:'STATIC',arguments:{keyword:'CHARACTER'}},armyBookContext(model,plagueMarines,'UNIT','detachment-paragons-of-putrescence')),'UNKNOWN','Potential formation does not infer actual attachment');
assert.equal(evaluatePredicate({predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',arguments:{keyword:'CHARACTER'}},armyBookContext(model,plagueMarines,'MODEL','detachment-paragons-of-putrescence')),'FALSE','MODEL has only its own keywords');
const engine=byId.get('unit-helbrute'),engineKeyword={predicate:'UNIT_KEYWORD',subject:'UNIT',contextLevel:'STATIC',arguments:{keyword:'CONTAGION ENGINE'}};
assert.throws(()=>armyBookContext(model,engine,'UNIT','unknown-detachment'),/Invalid canonical Detachment context/,'Unresolved filter identity must fail, never become UNKNOWN');
assert.equal(evaluatePredicate(engineKeyword,armyBookContext(model,engine,'UNIT')),'UNKNOWN','Unselected Detachment grant is unknown');
assert.equal(evaluatePredicate(engineKeyword,armyBookContext(model,engine,'UNIT','detachment-contagion-engines')),'TRUE');
assert.equal(evaluatePredicate(engineKeyword,armyBookContext(model,engine,'UNIT','detachment-virulent-vectorium')),'FALSE');
assert.equal(armyBookContext(model,engine,'MODEL','detachment-contagion-engines').keywords.has('CONTAGION ENGINE'),false,'UNIT grant is not MODEL identity');

const fixedControls={};
for(const [ruleId,unitId,key,battle] of [
  ['detachment-tallyband-summoners:stratagem:3','unit-plaguebearers','engaged',{phase:'SHOOTING',turnOwner:'YOU'}],
  ['detachment-tallyband-summoners:stratagem:6','unit-plaguebearers','withinEngagementRangeOfTriggeringEnemy',{phase:'MOVEMENT',turnOwner:'OPPONENT',enemyFallBackSelection:true,engaged:true}],
  ['detachment-contagion-engines:stratagem:3','unit-helbrute','withinEngagementRangeOfTriggeringEnemy',{phase:'MOVEMENT',turnOwner:'OPPONENT',enemyFallBackSelection:true,isTriggerUnit:true,engaged:true}]
]) {
  const contract=byId.get(ruleId).ruleContract,primary=contract.roles.find(role=>role.id==='primary'),c=armyBookContext(model,byId.get(unitId),primary.subject,contract.detachmentId);
  const baseline=row(unitId,ruleId);assert.equal(baseline.selectedDetachment.state,'UNKNOWN','Book has no battle state');
  c.battle={...battle,[key]:false};assert.equal(evaluateRole(primary,contract.conditions,c),'FALSE');
  c.battle[key]=true;assert.equal(evaluateRole(primary,contract.conditions,c),'TRUE');
  delete c.battle[key];assert.equal(evaluateRole(primary,contract.conditions,c),'UNKNOWN');
  c.battle[key]='broken';assert.equal(evaluateRole(primary,contract.conditions,c),'INVALID');
  fixedControls[ruleId]={forbidden:'FALSE/NO_MATCH',allowed:'TRUE/MATCH',book:'UNKNOWN/CONDITIONAL',malformedContext:'INVALID'};
}
for(const result of index.rows)for(const evaluation of [result,result.selectedDetachment])assert.equal(evaluation.applicability,publicResult[evaluation.state]);
const mutations=[];
for(const [label,change]of [
  ['unknown predicate is build failure',m=>{m.entities.find(e=>e.id===match.ruleId).ruleContract.roles[0].selector={predicate:'PARSER_FAILED',subject:'MODEL',contextLevel:'STATIC',arguments:{}};}],
  ['unresolved canonical identity is build failure',m=>{m.entities.find(e=>e.id===match.unitId).data.profileIds=['unknown-profile'];}],
  ['duplicate canonical identity is build failure',m=>m.entities.push(structuredClone(m.entities.find(e=>e.id===match.unitId)))],
  ['malformed subject is build failure',m=>{m.entities.find(e=>e.id===match.ruleId).ruleContract.roles[0].subject='UNRESOLVED_SUBJECT';}]
]){const changed=structuredClone(model);change(changed);assert.throws(()=>buildRelatedRules(changed),undefined,label);mutations.push(label);}
const poisonedIndex=structuredClone(index);poisonedIndex.rows[0].applicability='POISON';poisonedIndex.rows[0].ruleId='POISON';
assert.notDeepEqual(poisonedIndex,buildRelatedRules(model));assert.deepEqual(buildRelatedRules(model),index,'Poisoned cache has no authority');mutations.push('generated row poison discarded');
const changed=structuredClone(model),changedBio=changed.entities.find(e=>e.id===bio.id);changedBio.data.keywords=changedBio.data.keywords.filter(k=>k!=='CHARACTER');
assert.equal(buildRelatedRules(changed).rows.find(r=>r.unitId===bio.id&&r.ruleId===match.ruleId).selectedDetachment.state,'FALSE','Canonical fact poison changes answer');mutations.push('canonical keyword poison reflected');
const isolation=poison=>{const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--isolation',...(poison?['--poison']:[])],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);};
const baseline=isolation(false),legacyPoison=isolation(true);assert.deepEqual(baseline.forbiddenReads,[]);assert.deepEqual(legacyPoison.forbiddenReads,[]);assert.equal(baseline.hash,legacyPoison.hash);
// Actually delete a disposable output, rebuild twice from the same authority,
// and compare exact bytes. This fixture never writes any historical worktree.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'dg-related-rules-determinism-'));
try{const file=path.join(temp,'index.json'),text=JSON.stringify(index,null,2)+'\n';fs.writeFileSync(file,text);fs.unlinkSync(file);fs.writeFileSync(file,JSON.stringify(buildRelatedRules(model),null,2)+'\n');assert.equal(fs.readFileSync(file,'utf8'),text);}finally{const file=path.join(temp,'index.json');if(fs.existsSync(file))fs.unlinkSync(file);fs.rmdirSync(temp);}
writeRelatedRules({check:true,model});
const core=JSON.parse(fs.readFileSync(new URL('../../core-rules/content/core-rules.digital-11e.json',import.meta.url),'utf8'));
assert.ok(!core.records.some(record=>record.ruleContract||record.applicability),'Core exposes structured applicability; defer must be revisited');
console.log(JSON.stringify({status:'PASS',index:index.summary,domain:domainSummary,sourceTargetConditions:sourceParity,detachmentFilterChecks:filterChecks,wrongDetachmentChecks,crossDetachmentLeakage:0,representativeStates:['MATCH','CONDITIONAL','NO_MATCH'],fixedControls,mutations,legacyPoisonClasses:legacyPatterns.length,v1CompatibilityReads:0,generatedIndexDeterminism:'PASS',coreStratagemsStatus:index.coreStratagemsStatus,manualPairwiseRelations:0,titleOrProseFactualJoins:0},null,2));
