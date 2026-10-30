import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
/** Accepted-source oracle -> native text import -> shared executor -> production
 * personal cards. Threshold is a passive attack rule, never a BS/WS change. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCSMRosterRuntimeBook} from './roster-runtime-build.mjs';
import {buildCSMImportBook} from './roster-import-build.mjs';
import {buildImportedEffectFixtures} from './roster-imported-effect-fixtures.mjs';
import {createCSMBrowserRoster} from './roster-boot.mjs';
import {physical,fixtureState,assignBearer} from './roster-effect-fixture.mjs';
import {prepareRosterPresentationCards,projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';
import {assertSourceEffectExpectation} from '../../shared/roster-v2/source-effect-expectations-qa.mjs';
import {compileBookRecipients,recipientDeclarationView,resolveRecipient} from '../../shared/rule-contract-v2/recipients.mjs';
import {producerDetachmentTextDeclaration} from '../../shared/roster-v2/conditional-policy.mjs';

const clone=structuredClone,ruleId='detachment-cult-of-the-arkifane:enhancement:3';
export const criticalHitThresholdExpectation=parseSourceFixtureJSON(fs.readFileSync(new URL('./critical-hit-source-expectations.json',import.meta.url),'utf8')).cases[0];
const source=fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-29/chaos-space-marines.html',import.meta.url));
assert.equal(createHash('sha256').update(source).digest('hex'),'54e028296c063629f43e82a9aba26943568dee3ae819e36620f72dec47529c4e');
const raw=source.toString('utf8').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ');
const accepted=criticalHitThresholdExpectation.source.quote;
assert.ok(raw.includes(accepted),'Independent accepted source restriction/threshold changed');
const expectedThreshold=Number(accepted.match(/unmodified Hit roll of (\d)\+/)[1]);
const book=buildCSMRosterRuntimeBook(),importBook=buildCSMImportBook();
const bindings=parseSourceFixtureJSON(fs.readFileSync(new URL('./roster-attachment-bindings.json',import.meta.url),'utf8'));
const payload=parseSourceFixtureJSON(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url),'utf8'));
const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
const fixture=buildImportedEffectFixtures(book).find(row=>row.owner===ruleId);
assert.ok(fixture,'Reviewed source has no executable import fixture');
assert.equal(book.entities.find(entity=>entity.id===ruleId).data.text,accepted);
const before=JSON.stringify(book),factsBefore=JSON.stringify(importBook);
const weapons=unit=>[...unit.weapons,...unit.profiles.flatMap(profile=>profile.weapons)];
const plainWeapons=projection=>projection.units.map(unit=>({id:unit.instanceId,weapons:weapons(unit).map(weapon=>{
  const data=clone(weapon.data);delete data.criticalHitThreshold;return {id:weapon.canonicalProfileId,scope:weapon.scopeId,data};
})}));

function run(inputBook=book) {
  const service=createCSMBrowserRoster(inputBook,importBook,bindings);
  let result=service.import(fixture.text);const choices={enhancementBearers:{}};
  if(result.status==='NEEDS_BINDINGS')for(const need of result.needsBindings) {
    assert.equal(need.kind,'ENHANCEMENT_BEARER');
    const named=need.candidates.filter(candidate=>candidate.title==='Dark Apostle');
    assert.equal(named.length,1,'Input explicitly designates the Dark Apostle MODEL');choices.enhancementBearers[need.key]=named[0].id;
  }
  if(result.status==='NEEDS_BINDINGS')result=service.import(fixture.text,choices);
  assert.equal(result.status,'READY');
  const [sourceUnit,duplicate,bodyguard,other]=service.state.units;
  assert.equal(sourceUnit.canonicalUnitId,'unit-dark-apostle','Fixture demonstrates exact MODEL scope in mixed composition');
  const selected=service.snapshot();
  const off=clone(selected);off.units[0].enhancementIds=[];off.units[0].enhancementAssignments=[];
  service.load(off);const baseline=plainWeapons(service.projection);
  const verify=active=>{
    const projection=service.projection;
    assert.deepEqual(plainWeapons(projection),baseline,'Threshold changed weapon characteristics or physical inventory');
    for(const physical of projection.units) {
      const target=physical.instanceId===sourceUnit.instanceId;
      for(const weapon of weapons(physical)) {
        const expected=active&&target&&weapon.canonicalProfileId!=='datasheet-dark-apostle:weapon:3'?expectedThreshold:undefined;
        assert.equal(weapon.data.criticalHitThreshold,expected,'Wrong independent threshold/recipient');
        const effective=service.effective(physical.instanceId);
        const projected=effective.weapons.find(row=>row.id===weapon.canonicalProfileId&&row.scopeId===weapon.scopeId);
        assert.equal(projected.fields.find(field=>field.label==='criticalHitThreshold')?.value,expected);
        const personal=projectInstanceCards(cards,service.state.units.find(unit=>unit.instanceId===physical.instanceId),effective);
        const card=personal.get(projected.id).find(row=>row.scopeId===projected.scopeId);
        assert.equal(card.criticalHitThreshold,expected,'Production personal cards lost computed threshold');
        if(expected!==undefined) {
          assert.ok(projected.criticalHitSources.some(source=>source.ruleId===ruleId&&source.sourceInstanceId===sourceUnit.instanceId));
          assert.ok(card.criticalHitSources.some(source=>source.ruleId===ruleId),'Production cards lost exact source');
        }
      }
    }
    if(active) {
      const target=projection.units.find(unit=>unit.instanceId===sourceUnit.instanceId);
      const sourceObservation=Object.fromEntries(weapons(target).map(weapon=>[weapon.canonicalProfileId,weapon.data.criticalHitThreshold??null]));
      assertSourceEffectExpectation({expectation:criticalHitThresholdExpectation,book:inputBook,
        applied:target.applied.filter(row=>row.ruleId===ruleId),observation:sourceObservation,
        expectedObservation:{'datasheet-dark-apostle:weapon:1':5,'datasheet-dark-apostle:weapon:2':5,'datasheet-dark-apostle:weapon:3':null}});
    }
    service.load(service.snapshot());assert.deepEqual(service.projection,projection,'Recompute accumulates or changes threshold');
  };
  verify(false);service.load(selected);verify(true);
  assert.ok(duplicate&&bodyguard&&other,'Independent same-unit and Bodyguard controls exist');
  service.attach(sourceUnit.instanceId,bodyguard.instanceId);verify(true);
  const attached=service.snapshot();service.detach(sourceUnit.instanceId);verify(true);
  service.attach(sourceUnit.instanceId,other.instanceId);verify(true);
  service.reattach(sourceUnit.instanceId,bodyguard.instanceId);verify(true);
  service.load(attached);service.load(JSON.parse(JSON.stringify(attached)));verify(true);
  service.load(off);verify(false);service.load(selected);verify(true);
  assert.equal(service.import(fixture.text,choices).status,'READY');verify(true);
  const wrong=clone(selected),forbidden=wrong.units.find(unit=>unit.instanceId===bodyguard.instanceId);
  // The independently accepted rule says MODEL bearer, never a Bodyguard unit.
  wrong.units[0].enhancementIds=[];wrong.units[0].enhancementAssignments=[];
  forbidden.enhancementIds=[ruleId];forbidden.enhancementAssignments=[];
  assert.throws(()=>service.load(wrong),/Enhancement|enhancement|bearer|owner|context/,'Wrong physical owner accepted');
  const damned=fixtureState(inputBook,'detachment-cult-of-the-arkifane',[physical(inputBook,'damned','unit-dark-commune',[ruleId])]);
  const forbiddenProfile=inputBook.rosterProfileBindings.find(binding=>binding.unitId==='unit-dark-commune'&&binding.intrinsicKeywords.includes('CHARACTER')&&binding.intrinsicKeywords.includes('DAMNED'));
  assert.ok(forbiddenProfile,'Independent DAMNED CHARACTER control exists');
  assignBearer(inputBook,damned,'damned',ruleId,forbiddenProfile.profileId);
  assert.throws(()=>service.load(damned),/Enhancement|enhancement|bearer|owner|context/,'Source-excluded DAMNED bearer accepted');
  return {source:'ACCEPTED_RAW',threshold:expectedThreshold,physicalBearer:'DARK_APOSTLE_ONLY',
    disciples:'UNCHANGED',bodyguards:'UNCHANGED',removeReimportRecompute:'PASS',presentation:'PASS'};
}
export const criticalHitThresholdGuardResult={id:criticalHitThresholdExpectation.id,status:'PASS',...run()};
const mutations=[];
for(const mutation of ['missing-binding','wrong-value','wrong-recipient','wrong-owner','wrong-gate']) {
  const changed=mutation==='missing-binding'?recipientDeclarationView(book):clone(book),rule=changed.entities.find(entity=>entity.id===ruleId),clause=rule.ruleContract.clauses.find(clause=>clause.id==='battle-clause-1');
  const effect=clause.rosterEffects[0];
  if(mutation==='missing-binding'){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
  if(mutation==='wrong-value')effect.value=4;
  if(mutation==='wrong-recipient')resolveRecipient(rule,clause,effect.recipientId).from='SOURCE_UNIT_MODELS';
  if(mutation==='wrong-owner')rule.ruleContract.assignment.selector={predicate:'MODEL_ID',subject:'MODEL',contextLevel:'STATIC',arguments:{id:'datasheet-dark-apostle:section:2:member:2'},evidence:effect.evidence};
  if(mutation==='wrong-gate')effect.conditions.push({binding:'SOURCE',predicate:{op:'NOT',args:[{predicate:'ALWAYS',subject:'MODEL',contextLevel:'STATIC',arguments:{},evidence:effect.evidence}]}});
  // Dropping an effect also drops its now-unused recipient declaration at the
  // producer boundary; the gameplay oracle still sees the missing effect.
  const candidate=mutation==='missing-binding'?compileBookRecipients(changed,{f1Declaration:producerDetachmentTextDeclaration}):changed;
  assert.throws(()=>run(candidate),undefined,mutation+' escaped accepted-source oracle');mutations.push(mutation);
}
assert.equal(JSON.stringify(book),before);assert.equal(JSON.stringify(importBook),factsBefore);
console.log(JSON.stringify({status:'PASS',...criticalHitThresholdGuardResult,mutationsRejected:mutations,realNewRecruitExportTested:false}));
