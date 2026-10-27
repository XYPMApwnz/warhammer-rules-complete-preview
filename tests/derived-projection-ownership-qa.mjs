import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../books/shared/tools/build-army-book.mjs';
import {createEffectiveBookModel,validateEffectiveBookModel} from '../books/shared/tools/effective-book-model.mjs';
import {createPointsCatalogFromProjections} from '../books/shared/points/effective-catalog.mjs';
import {projectEffectiveEnhancementSources} from '../glossary/tools/effective-enhancement-sources.mjs';
import {projectDeathGuardGlossaryFacts} from '../books/death-guard/tools/canonical-source-adapter.mjs';
import {renderEffectiveBook as renderDeathGuard} from '../books/death-guard/tools/presentation-hook.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
const models=new Map(),contexts=new Map(),projections=new Map();
for(const id of books){
  const context=createCanonicalBuildContext({args:['--check'],configPath:path.join(root,'books',id,'book.config.json'),repo:root});
  const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
  validateEffectiveBookModel(model);models.set(id,model);contexts.set(id,context);projections.set(id,model.effectivePointsProjection);
}

const cloneProjections=()=>new Map([...projections].map(([id,value])=>[id,structuredClone(value)]));
const assessmentRuntime=catalog=>{const scope={window:{WH_POINTS_CATALOG:catalog}};vm.createContext(scope);vm.runInContext(fs.readFileSync(path.join(root,'books/shared/rule-facts.js'),'utf8'),scope);vm.runInContext(fs.readFileSync(path.join(root,'books/shared/points/points-validator.js'),'utf8'),scope);return scope.window.WHRosterPoints;};
const am=models.get('adeptus-mechanicus'),explorator=am.effectivePointsProjection.enhancements.find(item=>item.id==='enhancement-explorator-dispensation');
assert.ok(explorator,'AM Explorator Dispensation points projection');
const amMarshal={id:'marshal-a',canonicalUnitId:'unit-skitarii-marshal',name:'Skitarii Marshal',quantity:1,models:[]},amMarshalTwo={...amMarshal,id:'marshal-b'};
const exploratorRoster={units:[amMarshal,amMarshalTwo],detachments:[{id:explorator.detachmentId}],enhancements:[amMarshal,amMarshalTwo].map(unit=>({id:explorator.id,name:explorator.title,ownerUnitId:unit.id,ownerStatus:'resolved'})),declared:0,unitLineTotal:0};
const assess=points=>points.assessEnhancements(exploratorRoster,'adeptus mechanicus');
const baselineCatalog=createPointsCatalogFromProjections(cloneProjections()).catalog,baselineAssessment=assess(assessmentRuntime(baselineCatalog));
assert.deepEqual(Array.from(baselineAssessment.enhancements,item=>item.ownerEligibility),['valid','invalid'],'AM canonical maxOwners=1 baseline');

const compatibilityPoison=cloneProjections(),poisonedExplorator=compatibilityPoison.get('adeptus-mechanicus').enhancements.find(item=>item.id===explorator.id);
poisonedExplorator.publicationRecord.assignment={...poisonedExplorator.publicationRecord.assignment,maxOwners:3};
poisonedExplorator.publicationRecord.owner={subject:'unit',selector:{unitIds:['unit-not-the-owner']}};
poisonedExplorator.publicationRecord.tags=['R1_COMPAT_TAG_POISON'];
poisonedExplorator.compatibilityIdentity={...poisonedExplorator.compatibilityIdentity,canonicalDetachmentId:'detachment-r1-wrong-scope'};
const poisonCatalog=createPointsCatalogFromProjections(compatibilityPoison).catalog,poisonedPublished=Object.values(poisonCatalog['adeptus mechanicus'].enhancements).flat().find(item=>item.id===explorator.id),poisonAssessment=assess(assessmentRuntime(poisonCatalog));
assert.deepEqual(Array.from(poisonAssessment.enhancements,item=>item.ownerEligibility),['valid','invalid'],'nested assignment poison influenced assessment');
assert.deepEqual(poisonedPublished.owner,explorator.owner,'nested owner poison influenced points projection');
assert.deepEqual(poisonedPublished.tags,explorator.tags,'nested tags poison influenced points projection');
assert.equal(poisonedPublished.detachmentId,explorator.detachmentId,'nested Detachment scope poison influenced points projection');

const canonicalDirection=cloneProjections(),canonicalExplorator=canonicalDirection.get('adeptus-mechanicus').enhancements.find(item=>item.id===explorator.id);
canonicalExplorator.assignment={...canonicalExplorator.assignment,maxOwners:3};
const canonicalCatalog=createPointsCatalogFromProjections(canonicalDirection).catalog,canonicalAssessment=assess(assessmentRuntime(canonicalCatalog));
assert.deepEqual(Array.from(canonicalAssessment.enhancements,item=>item.ownerEligibility),['valid','valid'],'assessment did not follow canonical assignment direction');
const canonicalOwnerDirection=cloneProjections(),canonicalOwner=canonicalOwnerDirection.get('adeptus-mechanicus').enhancements.find(item=>item.id===explorator.id);canonicalOwner.owner={subject:'unit',selector:{unitIds:['unit-r1-canonical-owner-direction']}};
assert.deepEqual(Array.from(assess(assessmentRuntime(createPointsCatalogFromProjections(canonicalOwnerDirection).catalog)).enhancements,item=>item.ownerEligibility),['invalid','invalid'],'assessment did not follow canonical owner direction');
const canonicalTagDirection=cloneProjections(),canonicalTag=canonicalTagDirection.get('adeptus-mechanicus').enhancements.find(item=>item.id===explorator.id);canonicalTag.tags=[...(canonicalTag.tags||[]),'R1_CANONICAL_TAG_DIRECTION'];
const canonicalTagPublished=Object.values(createPointsCatalogFromProjections(canonicalTagDirection).catalog['adeptus mechanicus'].enhancements).flat().find(item=>item.id===explorator.id);assert.ok(canonicalTagPublished.tags.includes('R1_CANONICAL_TAG_DIRECTION'),'points projection did not follow canonical tags direction');
const canonicalScopeDirection=cloneProjections(),canonicalScope=canonicalScopeDirection.get('adeptus-mechanicus').enhancements.find(item=>item.id===explorator.id),otherDetachment=am.effectivePointsProjection.detachments.find(item=>item.id!==explorator.detachmentId);canonicalScope.detachmentId=otherDetachment.id;
assert.deepEqual(Array.from(assess(assessmentRuntime(createPointsCatalogFromProjections(canonicalScopeDirection).catalog)).enhancements,item=>item.ownerEligibility),['invalid','invalid'],'assessment did not follow canonical Detachment scope direction');
for(const projection of projections.values())for(const item of projection.enhancements){const records=Object.values(baselineCatalog[{'death-guard':'death guard','adeptus-mechanicus':'adeptus mechanicus','tyranids':'tyranids','tau-empire':'t au empire','emperors-children':'emperor s children','chaos-space-marines':'chaos space marines','space-marines':'space marines','dark-angels':'dark angels','blood-angels':'blood angels'}[projection.book.id]].enhancements).flat(),publishedId=item.publicationRecord?.id||item.compatibilityIdentity?.id||item.compatibilityIdentity?.canonicalEnhancementId||item.id,published=records.find(record=>record.id===publishedId&&record.detachmentId===item.detachmentId);assert.ok(published,`${projection.book.id}: missing canonical Enhancement assessment projection ${item.id}`);assert.equal(published.detachmentId,item.detachmentId,`${projection.book.id}/${item.id}: Detachment scope projection`);for(const field of ['owner','assignment','tags','value','text']){const expected=field==='text'?(item.text||''):field==='tags'?(published.tags===undefined?undefined:item.tags||[]):field==='owner'||field==='assignment'?(item[field]||undefined):item[field];assert.deepEqual(published[field],expected,`${projection.book.id}/${item.id}: ${field} projection`);}}

const amCanonical=am.enhancements.find(item=>item.id==='enhancement-explorator-dispensation'),amReferencePoison=structuredClone(am),nested=amReferencePoison.detachments.find(item=>item.id===amCanonical.detachmentId).enhancements.find(item=>item.id===amCanonical.id);
Object.assign(nested,{title:'Stealth-screened Cybercanids Upgrade',tags:['R1_TAG_POISON'],eligibility:{unitIds:['unit-r1-poison']},assignment:{maxOwners:99}});
const amPoisonProjection=projectEffectiveEnhancementSources(amReferencePoison),amPoisonRecord=amPoisonProjection.find(item=>item.id===amCanonical.detachmentId).enhancements.find(item=>item.id===amCanonical.id);
assert.equal(amPoisonRecord.title,amCanonical.runtimeTitle||amCanonical.title,'AM reference title poison influenced glossary identity');
assert.deepEqual(amPoisonRecord.tags,amCanonical.tags||[],'AM reference tags poison influenced glossary');
assert.deepEqual(amPoisonRecord.eligibility,amCanonical.eligibility||null,'AM reference eligibility poison influenced glossary');
const amReverse=structuredClone(am),amReverseCanonical=amReverse.enhancements.find(item=>item.id===amCanonical.id&&item.detachmentId===amCanonical.detachmentId);amReverseCanonical.title='R1 Canonical Explorator Direction';amReverseCanonical.runtimeTitle='R1 Canonical Explorator Direction';
assert.equal(projectEffectiveEnhancementSources(amReverse).find(item=>item.id===amCanonical.detachmentId).enhancements.find(item=>item.id===amCanonical.id).title,'R1 Canonical Explorator Direction','AM glossary projection ignored canonical title direction');

const dg=models.get('death-guard'),dgProjection=projectDeathGuardGlossaryFacts(dg),statEntry=dgProjection.glossary.find(entry=>entry.statline?.T),weaponEntry=dgProjection.glossary.find(entry=>entry.weapon?.A);
assert.ok(statEntry&&weaponEntry,'DG popup projection fixtures');
const dgPoison=structuredClone(dg),dgPoisonStat=dgPoison.glossary.find(entry=>entry.id===statEntry.id),dgPoisonWeapon=dgPoison.glossary.find(entry=>entry.id===weaponEntry.id);
dgPoisonStat.statline={...dgPoisonStat.statline,T:'92'};dgPoisonWeapon.weapon={...dgPoisonWeapon.weapon,A:'95'};dgPoison.runtime[statEntry.id].summary='M 5 · T 92 · Sv 3+ · W 99 · Ld 99+ · OC 99';dgPoison.runtime[weaponEntry.id].summary='Range 99 · A 95 · BS 1+ · S 99 · AP -99 · D 99';
const dgPoisonOutput=renderDeathGuard(contexts.get('death-guard'),dgPoison).dataJs;
assert.match(dgPoisonOutput,new RegExp(`T ${String(statEntry.statline.T).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`),'DG popup stat projection did not use canonical fact');
assert.match(dgPoisonOutput,new RegExp(`A ${String(weaponEntry.weapon.A).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`),'DG popup weapon projection did not use canonical fact');
assert.doesNotMatch(dgPoisonOutput,/T 92|A 95/,'DG poisoned popup copies reached publication');
const dgReverse=structuredClone(dg),canonicalStatUnit=dgReverse.units.find(unit=>unit.id===statEntry.sectionId),canonicalStat=canonicalStatUnit.blocks.find(block=>block.type==='statline');canonicalStat.values.T='77';
const weaponOwners=dgReverse.units.flatMap(unit=>(unit.blocks||[]).filter(block=>block.type==='weapon'&&block.termId===weaponEntry.id).map(block=>({unit,block})));assert.ok(weaponOwners.length);for(const {block} of weaponOwners)block.a='66';
const dgReverseProjection=projectDeathGuardGlossaryFacts(dgReverse);assert.equal(dgReverseProjection.glossary.find(entry=>entry.id===statEntry.id).statline.T,'77','DG popup ignored canonical stat direction');assert.equal(dgReverseProjection.glossary.find(entry=>entry.id===weaponEntry.id).weapon.A,'66','DG popup ignored canonical weapon direction');

const da=models.get('dark-angels'),daRule=da.rosterCatalog.detachmentRules[0],daPoison=structuredClone(da);daPoison.rosterCatalog.detachmentRules.find(item=>item.id===daRule.id).text='R1_STALE_DETACHMENT_RULE_TEXT';
const daRepaired=createEffectiveBookModel(daPoison),repairedRule=daRepaired.rosterCatalog.detachmentRules.find(item=>item.id===daRule.id);assert.equal(repairedRule.text,daRule.text,'roster Detachment-rule compatibility text overrode canonical owner');
const daReverse=structuredClone(da),canonicalDirectionText='R1_CANONICAL_DETACHMENT_RULE_DIRECTION',reverseRule=daReverse.detachmentRules.find(item=>item.id===daRule.id&&item.detachmentId===daRule.detachmentId);assert.ok(reverseRule,'canonical Detachment-rule owner fixture');reverseRule.text=canonicalDirectionText;
const daCanonicalDirection=createEffectiveBookModel(daReverse),directionRule=daCanonicalDirection.rosterCatalog.detachmentRules.find(item=>item.id===daRule.id);assert.equal(directionRule.text,canonicalDirectionText,'roster Detachment-rule reference ignored canonical direction');
const rosterScope={window:{WH_BOOK_ROSTER_CATALOG:daCanonicalDirection.rosterCatalog}};vm.createContext(rosterScope);vm.runInContext(fs.readFileSync(path.join(root,'books/shared/roster-context.js'),'utf8'),rosterScope);
const daUnit=daCanonicalDirection.rosterCatalog.units[0],rosterProjection=rosterScope.window.WHArmyRosterContext.project({catalog:daCanonicalDirection.rosterCatalog,roster:{units:[{id:'r1-unit',canonicalUnitId:daUnit.id,name:daUnit.title,quantity:1,models:[]}],detachments:[{id:daRule.detachmentId}],enhancements:[]},record:{attachments:{}},provider:{gameEffects:()=>[{id:'r1-reference',component:'ability',operation:'reference',canonicalReference:{kind:'detachment-rule',id:daRule.id}}]}});
assert.equal(rosterProjection.game.units[0].effects[0].canonicalReference.text,canonicalDirectionText,'actual roster-context did not resolve canonical Detachment-rule text');

const detachmentRuleRecords=[...models.values()].reduce((sum,model)=>sum+(model.rosterCatalog?.detachmentRules?.length||0),0),dgGameplayTerms=dgProjection.glossary.filter(entry=>entry.statline||entry.weapon).length;
assert.equal([...projections.values()].reduce((sum,projection)=>sum+projection.enhancements.length,0),474,'all-nine Enhancement assessment inventory');
console.log(`Derived projection ownership QA: PASS (4 factual partitions; 474 Enhancement assessments, 34 AM Enhancement references, ${dgGameplayTerms} DG popup facts, ${detachmentRuleRecords} roster Detachment-rule references; compatibility poisons isolated; reverse canonical directions followed).`);
