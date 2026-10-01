import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {buildFactualV2} from './build.mjs';
import {buildRuleContractV2,compileCompatibility,previousAmbiguityDomain,summarize,entityContext} from './rule-contract-build.mjs';
import {validateContracts,evaluatePredicate,evaluateRole} from './rule-contract-schema.mjs';
import {parseSourceHtml,sourceNode,sourceNodeText,normalizeSourceText} from './raw-source.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(directory,'../../..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const evidence=read('books/death-guard/v2/rule-contract-source-evidence.json');
const corpus=read('books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json');
const normalized=value=>normalizeSourceText(value).toLowerCase();
const sourceProofText=value=>normalized(value).replace(/\s+-\s+/g,' ').replace(/([.!?])\s*/g,'$1 ').replace(/\s+/g,' ').trim();
const byId=model=>new Map(model.entities.map(entity=>[entity.id,entity]));
const atoms=value=>{const found=[];const walk=node=>{if(!node||typeof node!=='object')return;if(node.predicate)found.push(node);for(const child of Object.values(node))if(Array.isArray(child))child.forEach(walk);else if(child&&typeof child==='object')walk(child);};walk(value);return found;};
const hasKeyword=(selector,keyword)=>atoms(selector).some(atom=>atom.predicate.endsWith('_KEYWORD')&&atom.arguments.keyword===keyword);
const phaseWords=text=>[...new Set([...text.matchAll(/\b(Command|Movement|Shooting|Charge|Fight) phase/gi)].map(match=>match[1].toUpperCase()))];
let sourceChecks=0;
/** Frozen source-first census is QA evidence, rechecked against pinned raw input. */
export function sourceGuard(model) {
  validateContracts(model);
  const index=byId(model);
  const expectedRuleIds=[...corpus.armyRules.flatMap(rule=>[rule.sourceId,...(rule.components||[]).map(c=>c.sourceId)]),...corpus.datasheets.flatMap(unit=>[...unit.sections.map(section=>section.sourceId),...unit.wargearOptions.map(option=>option.sourceId)]),...corpus.detachments.flatMap(det=>[det.rule.sourceId,...det.enhancements.map(e=>e.sourceId),...det.stratagems.map(s=>s.sourceId)]),...corpus.errata.map(e=>e.sourceId),
    'book-death-guard:introduction','source-erratum:dg-waha:0005','datasheet-defiler:profile-selection:1',
    ...model.entities.filter(e=>['SUPPLEMENTAL_DATASHEET_RULE','WARGEAR_FOOTNOTE'].includes(e.kind)).map(e=>e.id)];
  assert.deepEqual(new Set(model.entities.filter(e=>e.ruleContract).map(e=>e.id)),new Set(expectedRuleIds),'Complete source-owned inventory');
  assert.deepEqual(new Set(evidence.stratagems.map(r=>r.sourceId)),new Set(corpus.detachments.flatMap(d=>d.stratagems.map(s=>s.sourceId))),'Independent Stratagem denominator');
  assert.deepEqual(new Set(evidence.enhancementsAndDetachments.map(r=>r.id)),new Set(corpus.detachments.flatMap(d=>[d.rule.sourceId,...d.enhancements.map(e=>e.sourceId)])),'Independent Enhancement/Detachment denominator');
  const hub=fs.readFileSync(path.join(directory,'sources/accepted-waha-pages/death-guard.html'),'utf8'),tree=parseSourceHtml(hub);
  const pdf=fs.readFileSync(path.join(directory,'sources/gw-death-guard-faction-pack-2026-09-30.pdf'));
  for(const record of evidence.stratagems) {
    const entity=index.get(record.sourceId),contract=entity.ruleContract,primary=contract.roles.find(role=>role.id==='primary');
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,record.sourceProof.path))).digest('hex').toUpperCase(),record.sourceProof.sha256,'Pinned raw source proof');
    const sourceText=sourceProofText(sourceNodeText(hub,sourceNode(tree,record.sourceProof.rawLocator)));
    for(const clause of record.sourceClauses)assert.ok(sourceText.includes(sourceProofText(clause.text)),record.sourceId+': raw source clause');
    assert.deepEqual(entity.data.lines,record.sourceClauses,'Current canonical facts match independent source census');
    assert.equal(contract.detachmentId,record.detachmentId,'Stratagem Detachment scope');
    assert.ok(atoms(contract.conditions).some(a=>a.predicate==='DETACHMENT'&&a.arguments.id===record.detachmentId),'Missing Stratagem Detachment predicate');
    assert.equal(contract.cp,record.cp,'Source CP');
    assert.equal(primary.subject,record.primarySubject.subject,'Source target subject');
    for(const keyword of record.primarySubject.allKeywords) {
      if(keyword==='WARLORD')assert.ok(atoms(primary.conditions).some(a=>a.predicate==='FIELD'&&a.contextLevel==='ROSTER'&&a.arguments.key==='isWarlord'&&a.arguments.equals===true),'Physical imported Warlord identity');
      else assert.ok(hasKeyword(primary.selector,keyword),record.sourceId+': dropped keyword '+keyword);
    }
    for(const group of record.primarySubject.anyKeywordGroups||[])for(const keyword of group)assert.ok(hasKeyword(primary.selector,keyword),'Dropped disjunctive selector');
    const when=record.sourceClauses.find(line=>line.label==='WHEN').text;
    const timing=atoms(contract.timing);
    assert.deepEqual(new Set(timing.filter(a=>a.predicate==='FIELD'&&a.arguments.key==='phase').map(a=>a.arguments.equals)),new Set(phaseWords(when)),'Source timing phase changed');
    for(const predicate of record.battlePredicates) {
      if(predicate.op==='SELECTED_TO_SHOOT_THIS_PHASE'&&record.battlePredicates.some(p=>p.op==='SELECTED_TO_SHOOT_OR_FIGHT_THIS_PHASE'))continue;
      const key=predicate.op.toLowerCase().replace(/_([a-z])/g,(_,letter)=>letter.toUpperCase());
      assert.ok(atoms(primary.conditions).some(a=>a.predicate==='FIELD'&&a.arguments.key===key&&a.contextLevel==='BATTLE'),'Missing source battle prerequisite '+record.sourceId+'/'+predicate.op);
    }
    for(const predicate of record.rosterPredicates) {
      const required=predicate.op==='HAS_ABILITY'?'MODEL_ABILITY':predicate.op==='IS_LEADING_UNIT'?'LEADING':predicate.op==='CONTAINS_CHARACTER_MODELS_MINIMUM'?'CHARACTER_MODEL_COUNT':'FIELD';
      assert.ok(atoms(primary.conditions).some(a=>a.predicate===required),'Missing source roster prerequisite');
    }
    assert.ok(contract.clauses.length>=record.effects.length,'Every source effect scope retained');
    sourceChecks++;
  }
  for(const record of evidence.enhancementsAndDetachments) {
    const entity=index.get(record.id),contract=entity.ruleContract;
    assert.equal(contract.detachmentId,record.parentId,'Enhancement/Detachment scope');
    assert.ok(atoms(contract.conditions).some(a=>a.predicate==='DETACHMENT'&&a.arguments.id===record.parentId),'Missing detachment applicability predicate');
    assert.equal(normalized(entity.data.text),normalized(record.rawText),'Exact independent current source text');
    assert.ok(record.rawLocator,'Explicit accepted raw source address; independently verified with lxml');
    if(entity.kind==='ENHANCEMENT') {
      const role=contract.roles.find(role=>role.id==='eligible-owner');
      assert.equal(role.subject,record.ownerSubject,'Enhancement owner subject');
      if(role.subject==='MODEL')assert.ok(hasKeyword(role.selector,'CHARACTER'),'Book Introduction CHARACTER ownership');
      const sourcePrefix=record.ownerSelector;
      for(const keyword of new Set(model.entities.filter(e=>e.kind==='DATASHEET').flatMap(e=>[...e.data.keywords,...e.data.factionKeywords]))) {
        if(sourcePrefix?.includes(keyword)&&keyword!=='CHARACTER')assert.ok(hasKeyword(role.selector,keyword),'Source Enhancement selector widened: '+record.id+'/'+keyword);
      }
      assert.equal(contract.pointOwner.owner,'CENTRALIZED_MFM');
      assert.ok(model.mfm.enhancementBindings.some(binding=>binding.mfmRecordId===contract.pointOwner.recordId),'No duplicate point owner');
      if(record.rosterConditions?.some(condition=>/leading/i.test(condition)))assert.ok(atoms(contract).some(a=>a.predicate==='LEADING'),'Source leading prerequisite');
    }else{
      assert.ok(['GLOBAL_DETACHMENT_RULE','STATIC_SELECTOR_RULE','ROSTER_CONDITIONAL_RULE','BATTLE_STATE_ONLY','DISPLAY_ONLY','AMBIGUOUS_SOURCE'].includes(contract.applicabilityClass),'Detachment classification');
      if(/^Friendly DEATH GUARD CHARACTER units/.test(entity.data.text)) {
        const selector=contract.roles[0].selector;
        assert.ok(hasKeyword(selector,'DEATH GUARD')&&hasKeyword(selector,'CHARACTER'),'Source Detachment selector widened');
      }
    }
    sourceChecks++;
  }
  assert.equal(createHash('sha256').update(pdf).digest('hex').toUpperCase(),evidence.enhancementsAndDetachments[0]?.pdfSha256||'EBF3F985BAD14FE61B0224FC0BA35BAB952D4306AB5691629B599114086CB2DD','Pinned accepted official PDF');
  return true;
}
const model=buildRuleContractV2();
const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
const python=process.env.PYTHON||(fs.existsSync(bundled)?bundled:'python3');
const rawProof=JSON.parse(execFileSync(python,['-X','utf8',path.join(directory,'rule-contract-source-qa.py')],{encoding:'utf8'}));
assert.equal(rawProof.rawSourceRecords,84);
sourceGuard(model);
const factual=buildFactualV2().effective;
assert.deepEqual(model.entities.map(({ruleContract,...entity})=>entity),factual.entities,'No factual delta');
assert.deepEqual(model.mfm,factual.mfm,'No MFM delta');
const projection=compileCompatibility(model),closure=summarize(model,projection,previousAmbiguityDomain(model));
assert.deepEqual(closure.relations,{STRATAGEM:591,DETACHMENT_RULE:211,ENHANCEMENT:164},'Re-enumerated exact historical domain');
assert.equal(closure.outcomes.INVALID,0);assert.equal(closure.outcomes.UNRESOLVED,0);
const controls=[];
const mutate=(name,edit,guard=sourceGuard)=>{
  const changed=structuredClone(model);edit(changed);assert.throws(()=>guard(changed),undefined,name);controls.push(name);
};
const rule=(m,id)=>m.entities.find(e=>e.id===id).ruleContract;
const strat='detachment-virulent-vectorium:stratagem:6',enh='detachment-virulent-vectorium:enhancement:1',det='detachment-paragons-of-putrescence:rule';
const replacePrimary=(m,node)=>{rule(m,strat).roles[0].selector=node;};
const sample=()=>structuredClone(atoms(rule(model,strat).roles[0].selector)[0]);
for(const [name,edit]of [
  ['MODEL predicate on UNIT',m=>{const node=sample();node.predicate='MODEL_KEYWORD';replacePrimary(m,node);}],
  ['UNIT keyword as MODEL identity',m=>{const node=sample();node.subject='MODEL';node.predicate='MODEL_ID';node.arguments={id:'DEATH GUARD'};replacePrimary(m,node);}],
  ['unresolved canonical ID',m=>{const node=sample();node.predicate='UNIT_ID';node.arguments={id:'unit-does-not-exist'};replacePrimary(m,node);}],
  ['unknown predicate',m=>{const node=sample();node.predicate='UNKNOWN_PREDICATE';replacePrimary(m,node);}],
  ['missing required subject',m=>{delete rule(m,strat).roles[0].subject;}],
  ['malformed role',m=>{delete rule(m,strat).roles[0].id;}],
  ['impossible target scope',m=>{rule(m,strat).roles[0].subject='WEAPON';}],
  ['battle predicate classified STATIC',m=>{atoms(rule(m,strat).conditions).find(a=>a.contextLevel==='BATTLE').contextLevel='STATIC';}],
  ['title-only factual target',m=>{const node=sample();node.predicate='UNIT_ID';node.arguments={title:'Plague Marines'};replacePrimary(m,node);}],
  ['duplicate independent semantic owner',m=>{m.entities.push(structuredClone(m.entities.find(e=>e.id===strat)));}]
])mutate(name,edit,validateContracts);
const negativeControls=controls.length;
mutate('dropped Stratagem keyword',m=>{const selector=rule(m,strat).roles[0].selector;selector.args=selector.args.filter(a=>a.arguments?.keyword!=='INFANTRY');});
mutate('dropped Stratagem Detachment scope',m=>{rule(m,strat).conditions=rule(m,strat).conditions.filter(a=>a.predicate!=='DETACHMENT');});
mutate('timing changed',m=>{atoms(rule(m,strat).timing).find(a=>a.arguments?.key==='phase').arguments.equals='MOVEMENT';});
mutate('target subject changed',m=>{rule(m,strat).roles[0].subject='MODEL';});
mutate('battle condition removed',m=>{rule(m,strat).roles[0].conditions=[];});
mutate('Enhancement owner selector widened',m=>{rule(m,enh).roles[0].selector.args=rule(m,enh).roles[0].selector.args.filter(a=>a.arguments?.keyword!=='CHARACTER');});
mutate('Detachment selector widened',m=>{rule(m,det).roles[0].selector.args=rule(m,det).roles[0].selector.args.filter(a=>a.arguments?.keyword!=='CHARACTER');});
mutate('canonical rule ID changed',m=>{rule(m,strat).ruleId='wrong-id';});
mutate('source provenance severed',m=>{rule(m,strat).sourceId='unaccepted-source';});
const poisoned=structuredClone(projection);poisoned.rows[0].applicability='MANUALLY_POISONED';
assert.deepEqual(compileCompatibility(model),projection,'Generated poison has no authority over rebuild');
assert.notDeepEqual(poisoned,compileCompatibility(model));controls.push('generated compatibility row poisoned');
// No accepted current 11e DG source requires an EPIC HERO exclusion here.
// Exercise NOT without inventing that exclusion in production ownership.
const epicExclusion={op:'NOT',args:[{predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',arguments:{keyword:'EPIC HERO'}}]};
assert.equal(evaluatePredicate(epicExclusion,{subject:'MODEL',keywords:new Set(['EPIC HERO'])}),'FALSE');
assert.equal(evaluatePredicate(epicExclusion.args[0],{subject:'MODEL',keywords:new Set(['EPIC HERO'])}),'TRUE');
controls.push('synthetic EPIC HERO exclusion loss; current corpus NOT_APPLICABLE');
const unit=model.entities.find(e=>e.id==='unit-biologus-putrifier'),contract=rule(model,'detachment-shamblerot-vectorium:enhancement:4');
const context=entityContext(model,unit,'MODEL',contract.detachmentId);
assert.equal(evaluateRole(contract.roles[0],contract.conditions,context),'UNKNOWN','Missing leading context');
context.roster.leading=false;assert.equal(evaluateRole(contract.roles[0],contract.conditions,context),'FALSE');
context.roster.leading=true;assert.equal(evaluateRole(contract.roles[0],contract.conditions,context),'TRUE');
context.roster.leading=false;assert.equal(evaluateRole(contract.roles[0],contract.conditions,context),'FALSE','Detach clears applicability');
assert.equal(evaluatePredicate({predicate:'NOT_A_PREDICATE',subject:'MODEL',contextLevel:'STATIC'},{subject:'MODEL'}),'INVALID');
assert.equal(evaluatePredicate({predicate:'FIELD',subject:'MODEL',contextLevel:'BATTLE',arguments:{key:'parserFailedPretendingUnknown',equals:true}},{subject:'MODEL'}),'INVALID');
const deadly=model.entities.find(e=>e.id==='unit-chaos-rhino');
assert.ok(entityContext(model,deadly,'MODEL','detachment-virulent-vectorium').abilities.has('Deadly Demise'),'Static accepted Core ability survives normalization');
assert.ok(!entityContext(model,model.entities.find(e=>e.id==='unit-plague-marines'),'MODEL','detachment-virulent-vectorium').abilities.has('Deadly Demise'),'No invented static Core ability');
const plague=rule(model,'detachment-virulent-vectorium:stratagem:3'),bioContext=entityContext(model,unit,'MODEL',plague.detachmentId);
bioContext.roster.isWarlord=false;bioContext.battle={onBattlefield:true,phase:'COMMAND',turnOwner:'YOU'};
assert.equal(evaluateRole(plague.roles[0],plague.conditions,bioContext),'FALSE','Army-wide benefit does not grant target eligibility');
const importedWarlord=structuredClone(bioContext);importedWarlord.roster.isWarlord=true;
assert.equal(evaluateRole(plague.roles[0],plague.conditions,importedWarlord),'TRUE','Correct physical Warlord eligible');
assert.equal(evaluateRole(plague.roles[0],plague.conditions,bioContext),'FALSE','Separate instance stays ineligible');
const resilient=rule(model,'detachment-virulent-vectorium:stratagem:2');
const timingContext={subject:'ROSTER',roster:{detachmentId:resilient.detachmentId},battle:{phase:'FIGHT',turnOwner:'YOU',enemyTargetSelectionJustFinished:true}};
for(const condition of resilient.conditions)assert.equal(evaluatePredicate(condition,timingContext),'TRUE','Friendly Fight phase is allowed');
timingContext.battle.phase='SHOOTING';assert.ok(resilient.conditions.some(condition=>evaluatePredicate(condition,timingContext)==='FALSE'),'Friendly Shooting phase is excluded');
timingContext.battle.turnOwner='OPPONENT';for(const condition of resilient.conditions)assert.equal(evaluatePredicate(condition,timingContext),'TRUE','Opponent Shooting phase is allowed');
const marine=model.entities.find(e=>e.id==='unit-plague-marines');
const formed=entityContext(model,marine,'UNIT','detachment-paragons-of-putrescence');
assert.equal(evaluatePredicate({predicate:'UNIT_KEYWORD',subject:'UNIT',contextLevel:'STATIC',arguments:{keyword:'CHARACTER'}},formed),'UNKNOWN','Unavailable formation keyword context');
assert.equal(evaluatePredicate({predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',arguments:{keyword:'CHARACTER'}},entityContext(model,marine,'MODEL','detachment-paragons-of-putrescence')),'FALSE','Bodyguard models do not inherit CHARACTER');
console.log(JSON.stringify({status:'PASS',sourceRecordsChecked:84,sourceChecks,canonicalRuleOwners:closure.rulesTotal,datasheetAbilityClauses:model.entities.filter(e=>e.ruleContract?.kind==='DATASHEET_ABILITY').reduce((n,e)=>n+(e.data.blocks?.length||1),0),schemaNegativeControls:negativeControls,mutations:controls.length-negativeControls,relations:closure.relations,outcomes:closure.outcomes,factualDelta:0,mfmDelta:0,controls},null,2));
