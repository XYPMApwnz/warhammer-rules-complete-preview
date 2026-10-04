import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {buildRuleContractV2,compileCompatibility} from './rule-contract-build.mjs';
import {buildRelatedRules,armyBookContext} from './related-rules-build.mjs';
import {buildCompatibilityFeasibility} from './feasibility-build.mjs';
import * as evaluator from './rule-contract-schema.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {buildAttachmentFeasibility,staticCapabilities,evaluateRequiredRecipients,includeRecipientFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';

const read=url=>JSON.parse(fs.readFileSync(new URL(url,import.meta.url),'utf8'));
const source=read('../sources/waha-11e-current-2026-09-25/corpus.json');
const mfm=read('../sources/official-mfm-v1.5.json');
const core=read('../../core-rules/content/core-rules.digital-11e.json');
const norm=text=>String(text).replace(/[‘’]/g,"'").replace(/[^a-z0-9]+/gi,' ').trim().toUpperCase();
const sourceId=sheet=>sheet.sourceId.replace(/^datasheet-/,'unit-');
const book=buildRuleContractV2(),byId=new Map(book.entities.map(e=>[e.id,e]));
const sheets=source.datasheets.filter(sheet=>sheet.factionKeywords.includes('DEATH GUARD'));
// Source labels are resolved here in independent QA, not in production runtime.
const sourceByLabel=new Map(sheets.map(sheet=>[norm(sheet.title),sheet]));
assert.equal(mfm.version,'v1.5');
assert.match(core.records.find(r=>r.code==='19.03').text,/models in an attached unit do not gain the keywords/);
assert.match(core.records.find(r=>r.code==='24.22').text,/one leader unit and one support unit/i);
const edges=[];
for(const record of mfm.units.filter(record=>record.status==='CURRENT'&&record.sourceGroup==='UNITS'&&record.relations?.leader)) {
  const owner=sourceByLabel.get(norm(record.title));assert(owner);
  for(const label of record.relations.leader) {
    const target=sourceByLabel.get(norm(label));assert(target);
    const leaderText=owner.sections.find(s=>s.title==='LEADER')?.blocks.map(b=>b.text).join('\n')||'';
    const extra=/even if one other Leader unit has already been attached/i.test(leaderText);
    const exceptionTargets=[...leaderText.matchAll(/^\s*-\s+([A-Z][A-Z0-9 '‑-]+?)\s*$/gm)].map(m=>norm(m[1]));
    edges.push({from:sourceId(owner),to:sourceId(target),extra:extra&&exceptionTargets.includes(norm(label))});
  }
}
assert.equal(edges.length,17);
assert.equal(edges.filter(e=>e.extra).length,7);
// Independent source model counts, not the production capability projection.
const intrinsic=new Map(sheets.map(sheet=>{
  const composition=sheet.sections.find(s=>s.title==='UNIT COMPOSITION').blocks.map(b=>b.text).join('\n');
  const count=[...composition.matchAll(/^\s*-\s+(\d+)(?:[-–](\d+))?\s+/gm)].reduce((n,m)=>n+Number(m[2]||m[1]),0);
  assert(count>0);
  return [sourceId(sheet),sheet.keywords.includes('CHARACTER')?count:0];
}));
const max=new Map(intrinsic),possible=new Set();
function witness(members) {
  const count=members.reduce((n,id)=>n+intrinsic.get(id),0);
  for(const id of members){possible.add(id);max.set(id,Math.max(max.get(id),count));}
}
for(const edge of edges) {
  witness([edge.to,edge.from]);
  for(const other of edges.filter(other=>other.to===edge.to&&other.from!==edge.from&&(edge.extra||other.extra)))witness([edge.to,edge.from,other.from]);
}
for(const sheet of sheets) {
  const id=sourceId(sheet),actual=staticCapabilities(book,id);
  assert.equal(actual.canBeAttached,possible.has(id),id);
  assert.equal(actual.maxCharacterModels,max.get(id),id);
  assert.deepEqual(actual.leaderTargetIds,[...new Set(edges.filter(e=>e.from===id).map(e=>e.to))].sort(),id);
}
const index=buildRelatedRules(book);
const row=(unitId,ruleId)=>{const row=index.rows.find(r=>r.unitId===unitId&&r.ruleId===ruleId);assert(row);return row;};
const attachedRules=source.detachments.flatMap(d=>d.stratagems).filter(r=>/DEATH GUARD Attached unit/.test(r.lines.find(l=>l.label==='TARGET')?.text));
assert.equal(attachedRules.length,3);
const countRule=source.detachments.flatMap(d=>d.stratagems).filter(r=>/includes two CHARACTER models/.test(r.lines.find(l=>l.label==='TARGET')?.text));
assert.equal(countRule.length,1);
const canonicalRule=sourceRule=>{const entity=byId.get(sourceRule.sourceId);assert.equal(entity?.provenance.sourceRecordId,sourceRule.sourceId);assert.deepEqual(entity.data.lines,sourceRule.lines);return entity;};
let ah01=0,ah02=0;
for(const sheet of sheets) {
  const id=sourceId(sheet);
  if(!possible.has(id))for(const sourceRule of attachedRules) {
    const actual=row(id,canonicalRule(sourceRule).id);
    assert.equal(actual.applicability,'NO_MATCH');assert.equal(actual.selectedDetachment.applicability,'NO_MATCH');ah01++;
  }
  if(max.get(id)<2) {
    const actual=row(id,canonicalRule(countRule[0]).id);
    assert.equal(actual.selectedDetachment.applicability,'NO_MATCH');ah02++;
  } else assert.equal(row(id,canonicalRule(countRule[0]).id).selectedDetachment.applicability,'CONDITIONAL');
}
assert.equal(ah01,45);assert.equal(ah02,19);
const mobileSource=source.detachments.flatMap(d=>d.stratagems).find(r=>r.lines.some(l=>/attaches to .* as a Leader/i.test(l.text)));
assert(mobileSource.lines.some(l=>/that your unit can lead/.test(l.text)));
const mobile=canonicalRule(mobileSource),detachment=mobile.parentId;
for(const sheet of sheets.filter(s=>s.keywords.includes('CHARACTER')))assert.equal(row(sourceId(sheet),mobile.id).selectedDetachment.applicability,
  edges.some(e=>e.from===sourceId(sheet))?'CONDITIONAL':'NO_MATCH');
const make=()=>createRosterRuntime(book,{parse,...evaluator});
const importRoster=units=>{const service=make();assert.equal(service.import(`+ DETACHMENT: Champions of Contagion\n${units}`).status,'READY');return service;};
const lord='Char1: 1x Lord of Contagion (110 pts): Manreaper';
const deathshroud='3x Deathshroud Terminators (150 pts)';
const result=service=>service.related('parsed-unit-1').find(r=>r.ruleId===mobile.id).applicability;
const absent=importRoster(lord);assert.equal(result(absent),'NO_MATCH');
const wrong=importRoster(lord+'\n1x Foetid Bloat-drone (100 pts)');assert.equal(result(wrong),'NO_MATCH');
const present=importRoster(lord+'\n'+deathshroud+'\n'+deathshroud);
assert.equal(result(present),'CONDITIONAL');assert.equal(present.context('parsed-unit-1').roster.leading,false);
present.attach('parsed-unit-1','parsed-unit-2');
assert.equal(result(present),'NO_MATCH');
assert.equal(present.context('parsed-unit-1').roster.leading,true);
assert.equal(present.context('parsed-unit-2').roster.leading,false,'AH04 is physical-component relative');
assert.equal(present.context('parsed-unit-3').roster.attached,false);
present.detach('parsed-unit-1');assert.equal(result(present),'CONDITIONAL');
present.reattach('parsed-unit-1','parsed-unit-3');assert.equal(result(present),'NO_MATCH');
assert.equal(present.context('parsed-unit-2').roster.attached,false);
const reloaded=make();reloaded.load(JSON.parse(JSON.stringify(present.snapshot())));assert.deepEqual(reloaded.related('parsed-unit-1'),present.related('parsed-unit-1'));

// Typed synthetic composition proves MODEL count never comes from UNIT union.
const fixture={entities:[{id:'bodyguard',kind:'DATASHEET',data:{profileIds:['infantry']}},{id:'leader',kind:'DATASHEET',data:{profileIds:['character']}}],
  rosterAttachmentPolicies:[{sourceId:'leader',targetId:'bodyguard',additionalLeaders:0}]};
const composition=[{unitId:'bodyguard',profileId:'infantry',maxModels:20,intrinsicKeywords:[]},{unitId:'leader',profileId:'character',maxModels:1,intrinsicKeywords:['CHARACTER']}];
const bounds=buildAttachmentFeasibility(fixture,composition);
assert(bounds.units.every(row=>row.maxCharacterModels===1));
assert.throws(()=>buildAttachmentFeasibility(fixture,[...composition,composition[1]]),/Duplicate or unresolved intrinsic composition/);
assert.throws(()=>buildAttachmentFeasibility(fixture,[...composition,{...composition[1],unitId:'unknown-unit'}]),/Duplicate or unresolved intrinsic composition/);
const countNode=canonicalRule(countRule[0]).ruleContract.roles[0].conditions.find(p=>p.predicate==='CHARACTER_MODEL_COUNT');
const bodyContext=armyBookContext(book,byId.get('unit-plague-marines'),'UNIT',detachment);
bodyContext.keywords.add('CHARACTER');bodyContext.capabilities=bounds.units[0];
assert.equal(evaluator.evaluatePredicate(countNode,bodyContext),'FALSE');

// Missing/malformed canonical bounds fail closed; renamed IDs do not switch logic.
const invalid=structuredClone(book);delete invalid.compatibilityFeasibility;
assert.throws(()=>buildRelatedRules(invalid),/Unresolved static capability/);
assert.throws(()=>createRosterRuntime(invalid,{parse,...evaluator}),/Unresolved static capability/);
const poisoned=structuredClone(book);poisoned.compatibilityFeasibility.units[0].maxCharacterModels=-1;
assert.throws(()=>buildRelatedRules(poisoned),/Unresolved static capability/);
for(const mutation of ['duplicate','extra','unknown-target']){
  const bad=structuredClone(book);
  if(mutation==='unknown-target')bad.compatibilityFeasibility.units[0].leaderTargetIds=['unknown-unit'];
  else bad.compatibilityFeasibility.units.unshift({...staticCapabilities(bad,'unit-mortarion'),unitId:mutation==='extra'?'unknown-unit':'unit-mortarion',leaderTargetIds:['unit-deathshroud-terminators'],maxCharacterModels:99});
  assert.throws(()=>buildRelatedRules(bad),/Unresolved static capability/);
  assert.throws(()=>createRosterRuntime(bad,{parse,...evaluator}),/Unresolved static capability/);
}
const renamed=structuredClone(book),rule=renamed.entities.find(e=>e.id===mobile.id);
rule.id='synthetic-canonical-rule';rule.ruleContract.ruleId=rule.id;rule.data.title='Unrelated display label';
assert.equal(buildRelatedRules(renamed).rows.find(r=>r.ruleId===rule.id&&r.unitId==='unit-mortarion').applicability,'NO_MATCH');
const displayPoison=structuredClone(book);
for(const section of displayPoison.entities.filter(e=>e.kind==='DATASHEET_SECTION')){section.data.title='Presentation poison';section.data.blocks=[];}
assert.deepEqual(buildCompatibilityFeasibility(displayPoison),book.compatibilityFeasibility,'Accepted source composition uses canonical provenance, never display title/text');
// A clause-local recipient is just as mandatory as its top-level declaration.
const local=structuredClone(mobile.ruleContract);local.roles=local.roles.filter(r=>r.purpose!=='EFFECT_RECIPIENT');
for(const clause of local.clauses)for(const role of clause.roles)delete role.purpose;
assert.equal(evaluateRequiredRecipients(local,'unit-mortarion',sheets.map(s=>({canonicalUnitId:sourceId(s)})),{book,evaluateRole:evaluator.evaluateRole,contextFor:c=>armyBookContext(book,byId.get(c.canonicalUnitId),'UNIT',detachment)}),'FALSE');
assert.equal(evaluateRequiredRecipients(local,'unit-lord-of-contagion',[],{book,evaluateRole:evaluator.evaluateRole,contextFor:()=>null}),'FALSE');
assert.equal(includeRecipientFeasibility('TRUE','UNKNOWN'),'UNKNOWN','Missing recipient battle prerequisites remain conditional');
for(const clause of local.clauses)for(const role of clause.roles)role.conditions=role.conditions.map(node=>node.arguments?.key==='canBeLedByPrimary'?{op:'NOT',subject:node.subject,args:[{op:'NOT',subject:node.subject,args:[node]}]}:node);
assert.equal(evaluateRequiredRecipients(local,'unit-mortarion',sheets.map(s=>({canonicalUnitId:sourceId(s)})),{book,evaluateRole:evaluator.evaluateRole,contextFor:c=>armyBookContext(book,byId.get(c.canonicalUnitId),'UNIT',detachment)}),'FALSE','Compound equivalent relationship is mandatory');
// Lost bounds/relations reproduce the original defects and must fail guards.
for(const [unitId,key,value]of [['unit-foetid-bloat-drone','canBeAttached',true],['unit-lord-of-contagion','maxCharacterModels',2],['unit-mortarion','leaderTargetIds',['unit-plague-marines']]]) {
  const mutation=structuredClone(book);staticCapabilities(mutation,unitId)[key]=value;
  assert.throws(()=>buildRelatedRules(mutation),/Unresolved static capability policy parity/);
  assert.throws(()=>createRosterRuntime(mutation,{parse,...evaluator}),/Unresolved static capability policy parity/);
}
// Only the explicit requested rule classes may change compatibility output.
const baseline=JSON.parse(execFileSync('git',['show','b89af33775802b1010e30f749feaf0a905357ecc:books/death-guard/v2/generated/rule-contract-effective.json'],{encoding:'utf8',maxBuffer:30e6}));
assert.deepEqual(book.entities,baseline.entities,'No canonical fact, identity or contract semantic delta');
assert.deepEqual(book.mfm,baseline.mfm);
const old=JSON.parse(execFileSync('git',['show','b89af33775802b1010e30f749feaf0a905357ecc:books/death-guard/v2/generated/related-rules-v2.json'],{encoding:'utf8',maxBuffer:10e6}));
const changed=[];const allowed=new Set([...attachedRules,...countRule,mobileSource].map(r=>canonicalRule(r).id));
for(const prior of old.rows){const current=row(prior.unitId,prior.ruleId);if(JSON.stringify(prior)!==JSON.stringify(current)){assert(allowed.has(prior.ruleId),'Unrelated compatibility delta: '+prior.ruleId);changed.push(current);}}
assert.equal(index.summary.allDetachments.INVALID+index.summary.selectedDetachment.INVALID,0);
assert.deepEqual(buildRelatedRules(book),index,'Deterministic disposable projection');
const compatibility=compileCompatibility(book);assert(compatibility.rows.every(r=>r.state!=='INVALID'));
console.log(JSON.stringify({status:'PASS',ah01RelationsFixed:ah01,ah02RelationsFixed:ah02,sourceLeaderEdges:edges.length,sourceCoexistenceEdges:edges.filter(e=>e.extra).length,
  ah03BookCanLead:'CONDITIONAL',ah03BookCannotLead:'NO_MATCH',ah03RosterPresent:'CONDITIONAL',ah03RosterAbsent:'NO_MATCH',ah03AlreadyLeading:'NO_MATCH',ah04:'UNCHANGED',
  canonicalDelta:0,mfmDelta:0,changedCompatibilityRows:changed.length,invalid:0,unresolved:0}));
