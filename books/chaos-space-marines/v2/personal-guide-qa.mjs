/** Every executable clause enters through native text import and the production
 * browser service, then the same disposable personal views used by all books. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {book,importBook,bindings,fixtures,checkEffects,imported,removeSelection} from './roster-runtime-qa.mjs';
import {createCSMBrowserRoster} from './roster-boot.mjs';
import {buildCSMRosterPresentation} from './roster-presentation.mjs';
import * as personal from '../../shared/army-book-app-v2/personal.mjs';
import {collectAbilityReferences,projectAbilityPresentation} from '../../shared/army-book-app-v2/ability-presentation.mjs';
import {deferredClause} from './roster-effect-build.mjs';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {createCSMCompatibilityCompiler} from './rule-contract-context.mjs';

const clone=structuredClone;
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const identity=record=>JSON.stringify([record.id,record.scopeId||null]);
const fieldValue=(card,key)=>card.fields.filter(field=>[`${key}`,`/${key}`,`/stats/${key}`].includes(field.presentationPath||field.source?.path))
  .map(field=>field.value);
const abilitiesWithoutGroups=abilities=>abilities.map(({group,...ability})=>ability);

export function makePersonalPayload() {
  const payload=read('./generated/app-presentation.json');
  assert.deepEqual(payload.rosterPresentation,buildCSMRosterPresentation(read('./generated/effective.json')),
    'Generated roster presentation must match current canonical bindings');
  return payload;
}

export function createImportedPersonalCase(fixture) {
  const service=createCSMBrowserRoster(book,importBook,bindings);
  let result=service.import(fixture.text);
  if(result.status==='NEEDS_BINDINGS') {
    const expected=imported(fixture),choices={enhancementBearers:{}};
    for(const need of result.needsBindings) {
      assert.equal(need.kind,'ENHANCEMENT_BEARER','Known canonical import vocabulary remains resolved');
      const [instanceId,enhancementId]=JSON.parse(need.key);
      const assignment=expected.units.find(unit=>unit.instanceId===instanceId).enhancementAssignments.find(item=>item.enhancementId===enhancementId);
      assert.ok(need.candidates.some(candidate=>candidate.id===assignment.modelScopeId),'Explicit source fixture owner is a canonical candidate');
      choices.enhancementBearers[need.key]=assignment.modelScopeId;
      assert.throws(()=>service.import(fixture.text,{enhancementBearers:{[need.key]:'foreign-model-scope'}}),/Unresolved explicit Enhancement bearer/,'Foreign physical bearer rejected');
    }
    assert.equal(service.state,null,'Ambiguous bearer never creates guessed roster state');
    result=service.import(fixture.text,choices);
  }
  assert.equal(result.status,'READY',fixture.id+' actual browser-service import');
  assert.deepEqual(service.state.units.map(unit=>[unit.canonicalUnitId,unit.modelRows,unit.selections]),
    imported(fixture).units.map(unit=>[unit.canonicalUnitId,unit.modelRows,unit.selections]),'Browser import preserves native canonical selections/composition');
  for(const edge of fixture.attachments)service.attach(service.state.units[edge.leaderOrdinal-1].instanceId,
    service.state.units[edge.bodyguardOrdinal-1].instanceId);
  if(fixture.initialAttachments)service.load({...service.snapshot(),initialAttachments:clone(service.snapshot().attachments)});
  return service;
}

export function inspectPersonalInstance(service,cards,payload,unit) {
  const effective=service.effective(unit.instanceId),variants=personal.projectInstanceCards(cards,unit,effective);
  const root=variants.get(unit.canonicalUnitId)[0];
  const children=root.children.flatMap(id=>variants.get(id)||[cards.get(id)]);
  const models=children.filter(card=>card.kind==='PROFILE'),weapons=children.filter(card=>card.kind==='WEAPON_PROFILE');
  assert.deepEqual(models.map(identity).sort(),effective.profiles.map(identity).sort(),'Exact physical MODEL scope inventory');
  assert.deepEqual(weapons.map(identity).sort(),effective.weapons.map(identity).sort(),'Selected effective weapons only');
  for(const profile of effective.profiles) {
    const card=models.find(card=>identity(card)===identity(profile));
    assert.equal(card.instanceId,unit.instanceId,'Physical MODEL presentation ownership');
    for(const field of profile.fields) {
      if(field.label==='Base')continue;
      const values=field.label==='stats'?Object.entries(field.value):[[field.label,field.value]];
      for(const [key,value]of values)if(['M','T','SV','W','LD','OC','INSV'].includes(key))
        assert.ok(fieldValue(card,key).some(actual=>JSON.stringify(actual)===JSON.stringify(value)),`Effective MODEL ${key} visible: ${profile.id}`);
    }
    assert.deepEqual(abilitiesWithoutGroups(card.effectiveAbilities),abilitiesWithoutGroups(profile.abilities),'Exact effective ability parameters and canonical identities');
    assert.deepEqual(card.suppressedAbilityIds||[],profile.suppressedAbilityIds||[],'Canonical ability suppression scope');
  }
  for(const weapon of effective.weapons) {
    const card=weapons.find(card=>identity(card)===identity(weapon));
    assert.equal(card.instanceId,unit.instanceId,'Physical weapon presentation ownership');
    for(const field of weapon.fields)if(['range','attacks','skill','strength','ap','damage'].includes(field.label))
      assert.ok(fieldValue(card,field.label).some(value=>JSON.stringify(value)===JSON.stringify(field.value)),`Effective weapon ${field.label} visible: ${weapon.id}`);
    const actual=card.fields.filter(field=>field.source?.path.startsWith('/abilities/')).map(field=>field.value);
    assert.deepEqual(actual,weapon.fields.find(field=>field.label==='abilities')?.value||[],'Effective weapon abilities');
  }
  assert.deepEqual(root.rosterComposition.map(row=>[row.profileId,row.quantity]),unit.modelRows.map(row=>[row.canonicalProfileId,row.quantity]),'Physical model composition retained');
  const selections=[...(unit.selections||[]),...unit.modelRows.flatMap(row=>[...(row.selections||[]),...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])];
  assert.deepEqual(new Set(root.rosterEquipmentIds),new Set(selections.filter(selection=>selection.physicalQuantity>0).flatMap(selection=>selection.canonicalEquipmentIds)), 'Selected equipment only');
  const plan=projectAbilityPresentation({instanceId:unit.instanceId,
    profiles:models.map(card=>({id:card.id,scopeId:card.scopeId,quantity:card.rosterQuantity,
      abilities:card.effectiveAbilities,suppressedAbilityIds:card.suppressedAbilityIds})),
    unitAbilities:root.rosterUnitAbilities,
    sourceAbilityIds:children.filter(card=>card.effectiveAbilityId).map(card=>card.effectiveAbilityId),
    references:collectAbilityReferences(children.filter(card=>card.kind==='RULE_REFERENCE'),payload.datasheetPresentation.referenceBindings),
    applied:effective.applied});
  const entries=[...plan.core,...plan.profiles.flatMap(profile=>profile.abilities)];
  assert.equal(new Set(entries.map(entry=>entry.identity)).size,entries.length,'Semantic ability display identities unique');
  for(const reference of plan.otherReferences)assert.ok(!plan.core.some(ability=>ability.canonicalId===reference.canonicalId&&
    JSON.stringify(ability.parameters)===JSON.stringify(reference.parameters)),'Canonical Army Rule not duplicated in Core Abilities');
  for(const record of effective.abilities.filter(record=>record.abilityRangeField)) {
    const card=children.find(card=>card.id===record.id&&card.scopeId===record.scopeId);
    assert.ok(card,'Scoped canonical ability range card exists');
    const expected=record.abilityRangeField.slice(1).split('/').reduce((value,key)=>value[key],record.text);
    assert.ok(card.fields.some(field=>field.source?.entityId===record.id&&field.source.path===record.abilityRangeField&&field.value===expected),'Effective canonical range text visible');
  }
  for(const profile of effective.profiles)for(const id of profile.suppressedAbilityIds||[])
    assert.ok(!plan.profiles.find(item=>item.id===profile.id&&item.scopeId===profile.scopeId).abilities.some(ability=>ability.canonicalId===id), 'Suppressed canonical ability not shown on suppressed profile');
  return {effective,variants,root,plan,children};
}

export async function runPersonalGuideQA() {
  assert.equal(typeof personal.prepareRosterPresentationCards,'function','Production shared roster presentation adapter exists');
  const payload=makePersonalPayload(),normalBefore=JSON.stringify(payload.cards),bookBefore=JSON.stringify(book),importBefore=JSON.stringify(importBook);
  const cards=personal.prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
  const matrix=[],checks={physicalInstances:0,profileScopes:0,effectiveWeapons:0,removeRestore:0,detachReattach:0,detachmentRemoveRestore:0,conditionalRows:0};
  const conditionalKinds=new Set();
  const allowed=new Set(book.rosterEffectCensus.lowered),classCounts={};
  for(const entity of book.entities)for(const clause of entity.ruleContract?.clauses||[]) {
    classCounts[clause.rosterClassification]=(classCounts[clause.rosterClassification]||0)+1;
    if(clause.rosterClassification!=='ROSTER_EXECUTABLE')assert.deepEqual(clause.rosterEffects,[],'Non-executing clause payload');
  }
  assert.deepEqual(classCounts,{BATTLE_ONLY:304,DISPLAY_ONLY:30,ROSTER_EXECUTABLE:57,NOT_AN_EFFECT:17});
  // Army Rules preserve their canonical conditional reference path; they are
  // not dispatched as global roster effects or fabricated Related dialog rows.
  const built=buildCSMContracts(),compiler=createCSMCompatibilityCompiler(built,built.schema.evaluator);
  const pactsOwner=built.facts.entities.find(entity=>entity.kind==='ARMY_RULE_MEMBERSHIP'&&entity.data.armyRuleId==='army-rule-dark-pacts').ownerId;
  const pacts=compiler.evaluateRule(pactsOwner,'army-rule-dark-pacts');
  assert.equal(pacts.state,'UNKNOWN');assert.equal(pacts.applicability,'CONDITIONAL');
  assert.ok(payload.cards.find(card=>card.id==='army-rule-dark-pacts').fields.some(field=>field.presentationPath==='/clauses/0/text'&&typeof field.value==='string'),'Canonical Dark Pacts text available');
  for(const fixture of fixtures) {
    const service=createImportedPersonalCase(fixture),state=service.snapshot(),projection=service.projection;
    const applied=checkEffects(projection,fixture,state),guide=personal.projectPersonalBook(payload,state);
    assert.equal(guide.instances.length,state.units.length,'Every physical roster instance in Personal Guide');
    const selected=new Set(state.detachmentIds),enhancements=new Set(state.units.flatMap(unit=>unit.enhancementIds));
    for(const id of guide.allowedIds) {
      const card=cards.get(id);
      if(card.kind==='DETACHMENT')assert.ok(selected.has(id),'Unselected Detachment excluded');
      if(card.kind==='ENHANCEMENT')assert.ok(enhancements.has(id),'Unassigned Enhancement excluded');
      if(['DETACHMENT_RULE','STRATAGEM'].includes(card.kind))assert.ok(selected.has(card.parentId),'Unselected Detachment content excluded');
      if(card.kind==='DATASHEET')assert.ok(state.units.some(unit=>unit.canonicalUnitId===id),'Unimported datasheet excluded');
    }
    const views=new Map();
    for(const unit of state.units) {
      const view=inspectPersonalInstance(service,cards,payload,unit);views.set(unit.instanceId,view);
      checks.physicalInstances++;checks.profileScopes+=view.effective.profiles.length;checks.effectiveWeapons+=view.effective.weapons.length;
      for(const row of view.effective.applied)assert.ok(allowed.has(`${row.ruleId}::${row.clauseId}`),'Battle-only or deferred effect leakage');
      for(const row of view.effective.conditional) {
        const owner=book.entities.find(entity=>entity.id===row.ruleId);
        if(owner.ruleContract.clauses.find(clause=>clause.id===row.clauseId).rosterClassification==='BATTLE_ONLY') {
          assert.equal(row.state,'UNKNOWN','Battle condition remains unknown');conditionalKinds.add(owner.kind);
        }
      }
      for(const related of service.related(unit.instanceId)) {
        assert.ok(selected.has(related.detachmentId),'Related Rules respects selected Detachment');
        assert.ok(['MATCH','CONDITIONAL','NO_MATCH'].includes(related.applicability),'Valid Related Rules public state');
        if(related.applicability==='CONDITIONAL')checks.conditionalRows++;
        const contract=book.entities.find(entity=>entity.id===related.ruleId).ruleContract;
        if(contract.kind==='ENHANCEMENT'&&!unit.enhancementIds.includes(related.ruleId))assert.equal(related.applicability,'NO_MATCH','Exact Enhancement owner');
      }
      const formed=personal.projectFormedUnitCards(cards,service,unit.instanceId);
      assert.deepEqual(new Set(formed.components.map(component=>component.unit.instanceId)),new Set(view.effective.formedUnit?.memberInstanceIds||[unit.instanceId]),'All formed components projected');
    }
    const presented=applied.map(row=>{
      const view=views.get(row.targetInstanceId);
      assert.ok(view,'Applied effect physical recipient represented');
      if(row.targetProfileId)assert.ok(view.effective.profiles.some(profile=>profile.id===row.targetProfileId&&profile.scopeId===row.targetCompositionId),'Applied MODEL recipient represented');
      if(row.targetWeaponProfileId)assert.ok(view.effective.weapons.some(weapon=>weapon.id===row.targetWeaponProfileId&&weapon.scopeId===row.targetCompositionId),'Applied weapon recipient represented');
      if(row.operation==='GRANT_UNIT_KEYWORD')assert.ok(view.root.fields.some(field=>field.value===fixture.expectedOperations.find(effect=>effect.operation===row.operation).keyword),'Granted UNIT keyword visible');
      if(row.operation==='GRANT_MODEL_KEYWORD')assert.ok(view.root.fields.some(field=>field.value===fixture.expectedOperations.find(effect=>effect.operation===row.operation).keyword),'Granted MODEL keyword visible');
      if(['GRANT_ABILITY','GRANT_MODEL_ABILITY'].includes(row.operation)) {
        const expected=fixture.expectedOperations.find(effect=>effect.operation===row.operation).ability;
        const entries=[...view.plan.core,...view.plan.profiles.flatMap(profile=>profile.abilities)];
        assert.ok(entries.some(ability=>expected.canonicalId?ability.canonicalId===expected.canonicalId:
          ability.canonicalId==='core-feel-no-pain'&&ability.parameters.value<=expected.value),'Granted effective ability has a presentation surface');
      }
      if(row.operation==='MODIFY_ABILITY_RANGE')assert.ok(view.children.some(card=>card.effectiveAbilityId===row.targetAbilityId&&card.scopeId===row.targetCompositionId),'Exact canonical ability range presentation');
      if(row.operation==='REMOVE_ABILITY')assert.ok(!view.plan.core.some(ability=>ability.canonicalId===row.targetAbilityId),'Removed ability not promoted to Core Abilities');
      return {effectId:row.effectId,instanceId:row.targetInstanceId,modelScope:row.targetCompositionId,weaponId:row.targetWeaponProfileId,operation:row.operation,field:row.field,result:'PASS'};
    });
    const canonical=book.entities.find(entity=>entity.id===fixture.owner);
    if(canonical.kind==='ENHANCEMENT'||canonical.kind==='UPGRADE_OPTION') {
      const removed=clone(state);
      if(canonical.kind==='ENHANCEMENT') {
        removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];
        if(fixture.owner==='detachment-murdertalon-raiders:enhancement:2')removed.attachments=[];
      } else removeSelection(removed,fixture.owner);
      service.load(removed);
      assert.ok(service.projection.units.every(unit=>unit.applied.every(row=>row.ruleId!==fixture.owner||row.clauseId!==fixture.clauseId)),'Removed owned selection stops executing');
      for(const unit of service.state.units)inspectPersonalInstance(service,cards,payload,unit);
      service.load(state);assert.deepEqual(service.projection,projection,'Owned selection restore deterministic');checks.removeRestore++;
    }
    for(const edge of state.attachments) {
      service.detach(edge.leaderInstanceId);
      assert.equal(personal.projectFormedUnitCards(cards,service,edge.leaderInstanceId).components.length,1,'Detached component independently visible');
      service.reattach(edge.leaderInstanceId,edge.bodyguardInstanceId);
      assert.deepEqual(service.projection,projection,'Reattached formed presentation source deterministic');checks.detachReattach++;
    }
    if(canonical.ruleContract?.detachmentId) {
      const removed=clone(state),detachmentId=canonical.ruleContract.detachmentId;
      removed.detachments=[{instanceId:'replacement-detachment',canonicalDetachmentId:detachmentId==='detachment-veterans-of-the-long-war'?
        'detachment-deceptors':'detachment-veterans-of-the-long-war'}];
      removed.detachmentIds=removed.detachments.map(item=>item.canonicalDetachmentId);
      removed.attachments=[];
      // Remove source-dependent selections/permissions exactly as existing
      // runtime QA does; selecting an illegal Mark is not a valid mutation.
      for(const unit of removed.units) {
        unit.enhancementIds=[];unit.enhancementAssignments=[];
        if(unit.selectedMarkId)removeSelection(removed,unit.selectedMarkId);
      }
      if(fixture.owner==='detachment-murdertalon-raiders:enhancement:2')removed.attachments=[];
      service.load(removed);assert.ok(service.projection.units.every(unit=>unit.applied.every(row=>row.ruleId!==fixture.owner)),'Removed Detachment no stale source effect');
      service.load(state);assert.deepEqual(service.projection,projection,'Detachment restore deterministic');checks.detachmentRemoveRestore++;
    }
    assert.deepEqual(service.snapshot(),state,'Presentation preserves physical roster ownership');
    matrix.push({CLAUSE_ID:fixture.id,OWNER:fixture.owner,NEW_RECRUIT_TEXT:fixture.text,SOURCE_EVIDENCE:fixture.sourceEvidence,SOURCE_CLAUSE:fixture.sourceClause,
      ROSTER_PREREQUISITES:{detachmentIds:state.detachmentIds,
      units:state.units.map(unit=>({instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,enhancementIds:unit.enhancementIds,
        enhancementAssignments:unit.enhancementAssignments,modelRows:unit.modelRows,selections:unit.selections,
        selectedMarkId:unit.selectedMarkId,selectedUpgradeIds:unit.selectedUpgradeIds})),attachments:state.attachments},
      EXPECTED_EFFECT:fixture.expectedOperations,ACTUAL_EFFECT:applied,PRESENTATION_CHECKS:presented,RESULT:'PASS'});
  }
  assert.deepEqual(new Set(matrix.map(row=>row.CLAUSE_ID)),allowed,'Exactly all executable clauses');
  assert.deepEqual(book.rosterEffectCensus.deferred,[deferredClause]);
  assert.equal(matrix.length,57);assert.ok(checks.conditionalRows>0);
  assert.ok(conditionalKinds.has('ENHANCEMENT')&&conditionalKinds.has('DETACHMENT_RULE'),'Representative Enhancement and Detachment battle-only text remains conditional');
  assert.equal(JSON.stringify(payload.cards),normalBefore,'Normal book cards unchanged');
  assert.equal(JSON.stringify(book),bookBefore,'Canonical/effect book unchanged');assert.equal(JSON.stringify(importBook),importBefore,'Import facts unchanged');
  const artifact={schema:'csm-v2/shared-personal-guide-audit/v1',baseHead:'14916f21f04037cbc1663312354968fbf1138f08',
    status:'PASS',executableClauses:57,deferred:[deferredClause],classification:classCounts,darkPactsConditional:pacts.applicability,
    battleConditionalKinds:[...conditionalKinds].sort(),checks,matrix};
  const directory=process.env.CSM_PERSONAL_QA_ARTIFACTS||'E:/Warhammer/qa-artifacts/csm-personal-guide-14916f21';
  fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'personal-guide-execution-matrix.json'),JSON.stringify(artifact,null,2)+'\n');
  console.log(JSON.stringify({...artifact,matrix:undefined,artifact:path.join(directory,'personal-guide-execution-matrix.json')}));
  return artifact;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1]))await runPersonalGuideQA();
