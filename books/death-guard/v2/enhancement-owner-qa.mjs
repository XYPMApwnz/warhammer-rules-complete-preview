import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {inspect,isDeepStrictEqual} from 'node:util';
import {buildRuleContractV2,compileCompatibility} from './rule-contract-build.mjs';
import {buildRelatedRules,armyBookContext} from './related-rules-build.mjs';
import * as evaluator from './rule-contract-schema.mjs';
import {enhancementOwnerContext} from '../../shared/roster-v2/compatibility-context.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';

const source=JSON.parse(fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-25/corpus.json',import.meta.url)));
const book=buildRuleContractV2(),records=new Map(book.entities.map(e=>[e.id,e]));
const rules=source.detachments.flatMap(d=>d.enhancements),sheets=source.datasheets;
assert.equal(rules.length,30);
const unitId=sheet=>sheet.sourceId.replace(/^datasheet-/,'unit-');
// Source-only owner census. Recognise qualifier words from accepted keyword
// vocabulary, rather than reading executable selectors to derive expectations.
const engineSource=source.detachments.find(d=>d.sourceId==='detachment-contagion-engines').rule.text;
const engineGrant=engineSource.match(/Friendly (.+?) units have (CONTAGION ENGINE)\./);
assert(engineGrant);
const engineOwners=engineGrant[1].split('/');
const vocabulary=[...new Set([...sheets.flatMap(s=>[...s.keywords,...s.factionKeywords]),engineGrant[2]])].sort((a,b)=>b.length-a.length);
function terms(value) {
  const found=[];let rest=value.trim();
  while(rest){const word=vocabulary.find(k=>rest===k||rest.startsWith(k+' '));assert(word,'Unclassified source owner qualifier: '+rest);found.push(word);rest=rest.slice(word.length).trim();}
  return found;
}
function ownerSpec(rule) {
  const clause=rule.text.split('.')[0];
  const qualifier=clause.match(/^(?:Friendly )?(.+?) (model|unit) only(?: \(excluding (.+?) models\))?$/) || clause.match(/^(.+?) only$/);
  assert(qualifier,'Unclassified source owner clause: '+clause);
  const subject=qualifier[2]==='unit'?'UNIT':'MODEL';
  return {subject,alternatives:qualifier[1].split('/').map(terms),excluded:qualifier[3]?terms(qualifier[3]):[]};
}
const specs=new Map(rules.map(r=>[r.sourceId,ownerSpec(r)]));
function keywords(sheet,detachmentId) {
  const own=new Set([...sheet.keywords,...sheet.factionKeywords]);
  if(detachmentId==='detachment-contagion-engines'&&engineOwners.some(k=>own.has(k)))own.add(engineGrant[2]);
  return own;
}
function eligible(spec,own) {
  return (spec.subject!=='MODEL'||own.has('CHARACTER'))&&spec.alternatives.some(all=>all.every(k=>own.has(k)))&&!spec.excluded.some(k=>own.has(k));
}
let ownerCases=0;
for(const rule of rules) {
  const contract=records.get(rule.sourceId).ruleContract,spec=specs.get(rule.sourceId);
  assert.equal(contract.roles[0].subject,spec.subject);
  assert.equal(records.get(rule.sourceId).data.text.split('.')[0],rule.text.split('.')[0],'Accepted owner restriction preserved');
  for(const sheet of sheets) {
    const unit=records.get(unitId(sheet)),context=armyBookContext(book,unit,spec.subject,contract.detachmentId);
    const expected=eligible(spec,keywords(sheet,contract.detachmentId))?'TRUE':'FALSE';
    assert.equal(evaluator.evaluatePredicate(contract.roles[0].selector,enhancementOwnerContext(contract,context)),expected,rule.sourceId+'/'+unit.id);
    // Poison only formation identity/keywords. Owner result must remain exact.
    const poisoned={...context,unitId:'unit-plague-marines',keywords:new Set(vocabulary),unknownKeywords:new Set(vocabulary)};
    assert.equal(evaluator.evaluatePredicate(contract.roles[0].selector,enhancementOwnerContext(contract,poisoned)),expected);
    ownerCases+=2;
  }
}
const index=buildRelatedRules(book),compatibility=compileCompatibility(book);
const baseline=JSON.parse(execFileSync('git',['show','c89bb144f30b70fe6d44fb0ce764d2710fcf3ea4:books/death-guard/v2/generated/related-rules-v2.json'],{encoding:'utf8',maxBuffer:20e6}));
const pmRules=rules.filter(r=>/^PLAGUE MARINES unit only\./.test(r.text));assert.equal(pmRules.length,2);
// Exact owner-approved Core 25.04 corrections, independently enumerated before test edits.
const epicHeroEnhancementPairs = [
  [
    "unit-mortarion",
    "detachment-mortarions-hammer:enhancement:1"
  ],
  [
    "unit-mortarion",
    "detachment-mortarions-hammer:enhancement:3"
  ],
  [
    "unit-mortarion",
    "detachment-tallyband-summoners:enhancement:1"
  ],
  [
    "unit-mortarion",
    "detachment-tallyband-summoners:enhancement:2"
  ],
  [
    "unit-mortarion",
    "detachment-virulent-vectorium:enhancement:1"
  ],
  [
    "unit-mortarion",
    "detachment-virulent-vectorium:enhancement:2"
  ],
  [
    "unit-mortarion",
    "detachment-virulent-vectorium:enhancement:3"
  ],
  [
    "unit-mortarion",
    "detachment-virulent-vectorium:enhancement:4"
  ],
  [
    "unit-typhus",
    "detachment-death-lords-chosen:enhancement:1"
  ],
  [
    "unit-typhus",
    "detachment-death-lords-chosen:enhancement:2"
  ],
  [
    "unit-typhus",
    "detachment-death-lords-chosen:enhancement:3"
  ],
  [
    "unit-typhus",
    "detachment-death-lords-chosen:enhancement:4"
  ],
  [
    "unit-typhus",
    "detachment-mortarions-hammer:enhancement:1"
  ],
  [
    "unit-typhus",
    "detachment-mortarions-hammer:enhancement:3"
  ],
  [
    "unit-typhus",
    "detachment-paragons-of-putrescence:enhancement:2"
  ],
  [
    "unit-typhus",
    "detachment-shamblerot-vectorium:enhancement:2"
  ],
  [
    "unit-typhus",
    "detachment-shamblerot-vectorium:enhancement:4"
  ],
  [
    "unit-typhus",
    "detachment-tallyband-summoners:enhancement:1"
  ],
  [
    "unit-typhus",
    "detachment-tallyband-summoners:enhancement:2"
  ],
  [
    "unit-typhus",
    "detachment-virulent-vectorium:enhancement:1"
  ],
  [
    "unit-typhus",
    "detachment-virulent-vectorium:enhancement:2"
  ],
  [
    "unit-typhus",
    "detachment-virulent-vectorium:enhancement:3"
  ],
  [
    "unit-typhus",
    "detachment-virulent-vectorium:enhancement:4"
  ]
];
const epicPairs=new Set(epicHeroEnhancementPairs.map(pair=>pair.join("\0"))),epicChanged=[];
const changed=[];
for(const previous of baseline.rows) {
  const current=index.rows.find(r=>r.ruleId===previous.ruleId&&r.unitId===previous.unitId);
  if(JSON.stringify(current)!==JSON.stringify(previous)) {
    const pair=[current.unitId,current.ruleId];
    if(epicPairs.has(pair.join("\0"))){
      assert.equal(previous.kind,"ENHANCEMENT");
      assert(sheets.find(sheet=>unitId(sheet)===current.unitId).keywords.includes("EPIC HERO"));
      assert(["MATCH","CONDITIONAL"].includes(previous.applicability));
      assert.deepEqual(current,{...previous,state:"FALSE",applicability:"NO_MATCH",
        selectedDetachment:{...previous.selectedDetachment,state:"FALSE",applicability:"NO_MATCH"}});
      epicChanged.push(pair);continue;
    }
    assert(pmRules.some(r=>r.sourceId===current.ruleId));
    assert(!sheets.find(s=>unitId(s)===current.unitId).keywords.includes('PLAGUE MARINES'));
    assert.equal(current.applicability,'NO_MATCH');assert.equal(current.selectedDetachment.applicability,'NO_MATCH');changed.push(current);
  }
}
const sourcePm=source.datasheets.find(s=>s.keywords.includes('PLAGUE MARINES'));
const sourcePmLeaders=book.rosterAttachmentPolicies.filter(p=>p.targetId===unitId(sourcePm));
assert.equal(changed.length,pmRules.length*sourcePmLeaders.length);
assert.deepEqual(epicChanged.sort(),structuredClone(epicHeroEnhancementPairs).sort(),"Only the exact 23 approved Epic pairs changed");
assert.equal(index.summary.allDetachments.INVALID+index.summary.selectedDetachment.INVALID,0);
assert(compatibility.rows.every(r=>r.state!=='INVALID'));
// The new owner scope must not alter a UNIT-target Stratagem context (AH-04).
const context=armyBookContext(book,records.get('unit-biologus-putrifier'),'UNIT');
assert.equal(enhancementOwnerContext({kind:'STRATAGEM'},context),context);
assert.throws(()=>enhancementOwnerContext({kind:'ENHANCEMENT'},{subject:'UNIT'}),/Unresolved Enhancement owner/);
const identityRole={subject:'UNIT',selector:{predicate:'UNIT_ID',subject:'UNIT',contextLevel:'STATIC',arguments:{id:'unit-plague-marines'}}};
assert.equal(evaluator.evaluateRole(identityRole,[],enhancementOwnerContext({kind:'ENHANCEMENT'},context)),'FALSE');

const make=()=>createRosterRuntime(book,{parse,...evaluator});
const imported=make();
const result=imported.import('+ DETACHMENT: Flyblown Host, Virulent Vectorium\nChar1: 1x Biologus Putrifier (50 pts)\nEnhancement: Furnace of Plagues (+25 pts)\n5x Plague Marines (90 pts)\nEnhancement: Plagueveil (+20 pts)\nChar2: 1x Biologus Putrifier (50 pts)\n5x Plague Marines (90 pts)');
assert.equal(result.status,'READY');
assert.deepEqual(result.needsBindings,[]);assert.deepEqual(result.errors,[]);
const plagueveil='detachment-flyblown-host:enhancement:2',furnace='detachment-virulent-vectorium:enhancement:2';
// Assert the import itself owns both Enhancements; never repair its snapshot.
assert.deepEqual(result.draft.enhancements.map(e=>[e.name,e.ownerUnitId,e.ownerStatus]),[
  ['Furnace of Plagues','parsed-unit-1','resolved'],['Plagueveil','parsed-unit-2','resolved']]);
assert.deepEqual(imported.state.units.map(u=>[u.instanceId,u.enhancementIds]),[
  ['parsed-unit-1',[furnace]],['parsed-unit-2',[plagueveil]],['parsed-unit-3',[]],['parsed-unit-4',[]]]);
assert.equal(specs.get(plagueveil).subject,'UNIT');assert.equal(specs.get(furnace).subject,'MODEL');
const ownIds=imported.state.units.map(u=>[u.instanceId,u.enhancementIds]);
function check(service) {
  for(const id of ['parsed-unit-1','parsed-unit-3'])for(const rule of pmRules)assert.equal(service.related(id).find(r=>r.ruleId===rule.sourceId).applicability,'NO_MATCH');
  for(const id of ['parsed-unit-2','parsed-unit-4'])for(const rule of pmRules)assert.notEqual(service.related(id).find(r=>r.ruleId===rule.sourceId).applicability,'NO_MATCH');
  assert.deepEqual(service.state.units.map(u=>[u.instanceId,u.enhancementIds]),ownIds);
  const bearer=service.projection.units.find(u=>u.instanceId==='parsed-unit-1');
  assert.equal(bearer.profiles.length,1);assert.equal(bearer.profiles[0].quantity,1);
  const contract=records.get(furnace).ruleContract;
  assert.equal(evaluator.evaluatePredicate(contract.roles[0].selector,
    enhancementOwnerContext(contract,service.context(bearer.instanceId,'MODEL',bearer.profiles[0].scopeId))),'TRUE');
  assert(service.projection.units.find(u=>u.instanceId==='parsed-unit-2').applied.some(e=>e.ruleId===plagueveil),
    'Imported Plagueveil must execute from its physical UNIT owner');
  for(const unit of service.projection.units)for(const effect of unit.applied.filter(r=>pmRules.some(p=>p.sourceId===r.ruleId))) {
    const group=service.projection.formedUnits.find(g=>g.bodyguardInstanceId==='parsed-unit-2');
    assert((group?.memberInstanceIds||['parsed-unit-2']).includes(unit.instanceId),'No propagation into a duplicate group');
    assert.equal(effect.sourceInstanceId,'parsed-unit-2');assert.equal(effect.targetInstanceId,unit.instanceId);
  }
}
check(imported);
imported.attach('parsed-unit-1','parsed-unit-2');imported.attach('parsed-unit-3','parsed-unit-4');check(imported);
assert.equal(imported.context('parsed-unit-1').roster.leading,true);assert.equal(imported.context('parsed-unit-2').roster.leading,false);
assert(imported.context('parsed-unit-1').keywords.has('PLAGUE MARINES'),'Formed keywords remain shared outside owner eligibility');
imported.detach('parsed-unit-1');check(imported);imported.reattach('parsed-unit-1','parsed-unit-2');check(imported);
const reload=make();reload.load(JSON.parse(JSON.stringify(imported.snapshot())));check(reload);
assert.deepEqual(reload.related('parsed-unit-1'),imported.related('parsed-unit-1'));
const invalidOwner=imported.snapshot();invalidOwner.units[1].enhancementIds=[];invalidOwner.units[0].enhancementIds.push(pmRules[1].sourceId);
const rejected=make();rejected.load(invalidOwner);
assert.equal(rejected.related('parsed-unit-1').find(r=>r.ruleId===pmRules[1].sourceId).applicability,'NO_MATCH');
assert(!rejected.projection.units.some(u=>u.applied.some(e=>e.ruleId===pmRules[1].sourceId)),'A formed keyword must not authorise an ineligible physical effect source');

// Census all 30 owner selectors through physical runtime contexts before and
// after every permitted attachment, including duplicate physical units.
const all=make(),detachmentIds=book.entities.filter(e=>e.kind==='DETACHMENT').map(e=>e.id);
const fixture={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'owner-census',detachmentIds,warlordInstanceId:null,attachments:[],
  units:sheets.flatMap(sheet=>[1,2].map(copy=>({instanceId:unitId(sheet)+'/'+copy,canonicalUnitId:unitId(sheet),startingStrength:1,warlord:null,enhancementIds:[],selections:[],
    modelRows:[{rowId:'profile',canonicalProfileId:records.get(unitId(sheet)).data.profileIds[0],quantity:1,selections:[],loadouts:[]}]})))};
function scan(service) {
  for(const unit of service.projection.units) {
    const sheet=sheets.find(s=>unitId(s)===unit.canonicalUnitId);
    const related=service.related(unit.instanceId);
    for(const rule of rules) {
      const contract=records.get(rule.sourceId).ruleContract,spec=specs.get(rule.sourceId),ctx=service.context(unit.instanceId,spec.subject);
      const expected=eligible(spec,keywords(sheet,contract.detachmentId))?'TRUE':'FALSE';
      assert.equal(evaluator.evaluatePredicate(contract.roles[0].selector,enhancementOwnerContext(contract,ctx)),expected,rule.sourceId+'/'+unit.instanceId);
      if(expected==='FALSE')assert.equal(related.find(r=>r.ruleId===rule.sourceId).applicability,'NO_MATCH');
      ownerCases++;
    }
  }
}
all.load(fixture);scan(all);
for(const policy of book.rosterAttachmentPolicies){all.attach(policy.sourceId+'/1',policy.targetId+'/1');scan(all);all.detach(policy.sourceId+'/1');}
// Source and effect definitions are immutable: eligibility is a consumer fix.
const baselineBook=JSON.parse(execFileSync('git',['show','c89bb144f30b70fe6d44fb0ce764d2710fcf3ea4:books/death-guard/v2/generated/rule-contract-effective.json'],{encoding:'utf8',maxBuffer:30e6}));
// Keep the historical equality requirement, but never ask node:assert to
// format a diff of the entire book. Store only the first 20 bounded values.
function historicalDifferences(actual,expected) {
  let count=0;const first=[];
  const value=(item,present)=>present?inspect(item,{depth:0,maxArrayLength:3,maxStringLength:160,breakLength:Infinity,compact:true}):'<missing>';
  function visit(a,b,at,hasA=true,hasB=true) {
    if(hasA===hasB&&Object.is(a,b))return;
    const objects=hasA&&hasB&&a!==null&&b!==null&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b);
    if(objects){
      for(const key of new Set([...Object.keys(a),...Object.keys(b)]))
        visit(a[key],b[key],at+'/'+key.replaceAll('~','~0').replaceAll('/','~1'),Object.hasOwn(a,key),Object.hasOwn(b,key));
      return;
    }
    count++;
    if(first.length<20)first.push({path:at||'/',historical:value(b,hasB),current:value(a,hasA)});
  }
  visit(actual,expected,'');return {count,first};
}
if(!isDeepStrictEqual(book,baselineBook)){
  const differences=historicalDifferences(book,baselineBook);
  console.error('DG_OWNER_MEMORY '+JSON.stringify({...process.memoryUsage(),maxRssBytes:process.resourceUsage().maxRSS*1024}));
  throw Error('book differs from historical c89bb144: '+differences.count+' differences, first: '+JSON.stringify(differences.first));
}
assert.deepEqual(buildRelatedRules(book),index);
console.log(JSON.stringify({status:'PASS',enhancementsScanned:rules.length,modelOwners:rules.filter(r=>specs.get(r.sourceId).subject==='MODEL').length,unitOwners:rules.filter(r=>specs.get(r.sourceId).subject==='UNIT').length,
  ownerCases,relationsFixed:changed.length,characterOwner:'NO_MATCH',plagueMarinesOwner:'EXPECTED',formedKeywordLeakage:0,ownerInstanceLeakage:0,ah04:'UNCHANGED',invalid:0,unresolved:0}));
