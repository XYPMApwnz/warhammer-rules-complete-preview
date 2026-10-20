import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTyranidsContracts} from './rule-contract-build.mjs';
import {createTyranidsBrowserRoster,createBrowserRoster} from './roster-boot.mjs';
import {resolveImportedPoints} from './roster-points.mjs';
import {prepareRosterPresentationCards,projectInstanceCards,projectPersonalBook,projectFormedUnitCards} from '../../shared/army-book-app-v2/personal.mjs';
import {assertSourceEffectExpectation} from '../../shared/roster-v2/source-effect-expectations-qa.mjs';

const {book}=buildTyranidsContracts(),before=JSON.stringify(book);
const text=`+ FACTION KEYWORD: Tyranids
+ DETACHMENT: Invasion Fleet
1x Broodlord (80 pts)
• 1x Broodlord: Broodlord claws and talons
5x Genestealers (75 pts)
• 5x Genestealers: Genestealer claws and talons
5x Genestealers (75 pts)
• 5x Genestealers: Genestealer claws and talons
1x Psychophage (95 pts)
• 1x Psychophage: Psychoclastic torrent, Talons and betentacled maw
1x Psychophage (95 pts)
• 1x Psychophage: Psychoclastic torrent, Talons and betentacled maw
`;
const service=createTyranidsBrowserRoster(book),result=service.import(text);
assert.equal(result.status,'READY',JSON.stringify(result.needsBindings));
const baseline=service.projection,basePoints=resolveImportedPoints(book,service.state);
const effective=id=>service.effective('parsed-unit-'+id);
const fnp=id=>effective(id).profiles.flatMap(profile=>profile.abilities).filter(ability=>ability.name==='Feel No Pain');
assert.equal(fnp(1).length,0);assert.deepEqual(fnp(4).map(ability=>ability.value),[5]);assert.deepEqual(fnp(5).map(ability=>ability.value),[5]);
assert.deepEqual(service.candidates('parsed-unit-1').map(row=>row.instanceId),['parsed-unit-2','parsed-unit-3']);
service.attach('parsed-unit-1','parsed-unit-2');
const attached=service.projection;
assert.ok(effective(2).weapons.every(weapon=>weapon.fields.find(field=>field.label==='abilities').value.some(ability=>ability.toUpperCase()==='DEVASTATING WOUNDS')));
assert.deepEqual(attached.units.find(unit=>unit.instanceId==='parsed-unit-3'),baseline.units.find(unit=>unit.instanceId==='parsed-unit-3'));
assert.deepEqual(resolveImportedPoints(book,service.state),basePoints);
const reloaded=createTyranidsBrowserRoster(book);reloaded.load(service.snapshot());assert.deepEqual(reloaded.projection,attached);
service.detach('parsed-unit-1');assert.deepEqual(service.projection,baseline);
service.reattach('parsed-unit-1','parsed-unit-3');
assert.deepEqual(service.projection.units.find(unit=>unit.instanceId==='parsed-unit-2'),baseline.units.find(unit=>unit.instanceId==='parsed-unit-2'));
service.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(service.projection,attached);
assert.throws(()=>service.attach('parsed-unit-4','parsed-unit-5'));
const related=service.related('parsed-unit-1');
for(const rule of book.entities.filter(entity=>['ENHANCEMENT','STRATAGEM'].includes(entity.kind)&&entity.parentId==='detachment-invasion-fleet')) {
  const row=related.find(row=>row.ruleId===rule.id);assert.ok(row,rule.id);
  if(!rule.ruleContract){assert.equal(row.state,'UNKNOWN');assert.equal(row.applicability,'CONDITIONAL');}
}
const mutant=service.snapshot();mutant.units[0].modelRows[0].sourceRuleReferenceIds=['datasheet-psychophage:rule-reference:2'];
assert.throws(()=>createTyranidsBrowserRoster(book).load(mutant));
assert.throws(()=>createTyranidsBrowserRoster({...book,bookId:'foreign'}));
const loaded=await createBrowserRoster({fetch:async url=>{
  assert.ok(url.pathname.endsWith('/generated/roster-runtime.json'));return {ok:true,json:async()=>book};}});
assert.equal(loaded.import(text).status,'READY');
// Production Effective/Guide projection preserves UNIT inventory while leaving
// unknown MODEL weapon ownership empty, independently for repeated units.
const aggregate=createTyranidsBrowserRoster(book),aggregateText='+ DETACHMENT: Invasion Fleet\n'+
  '10x Termagants (60 pts): 10x Fleshborer, 10x Chitinous claws and teeth\n'+
  '10x Termagants (60 pts): 10x Termagant spinefists, 10x Chitinous claws and teeth\n';
assert.equal(aggregate.import(aggregateText).status,'READY');
const payload=JSON.parse(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url)));
const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
for(const [n,expected]of [[0,['datasheet-termagants:weapon:1','datasheet-termagants:weapon:7']],
  [1,['datasheet-termagants:weapon:6','datasheet-termagants:weapon:7']]]){
  const unit=aggregate.state.units[n],view=aggregate.effective(unit.instanceId),presented=projectInstanceCards(cards,unit,view);
  assert.deepEqual(view.weapons.map(weapon=>weapon.id),expected);
  assert.ok(view.weapons.every(weapon=>weapon.physicalQuantity===10));
  for(const id of expected)assert.deepEqual(presented.get(id).map(card=>card.rosterQuantity),[10]);
  assert.ok(aggregate.projection.units[n].profiles.every(profile=>profile.weapons.length===0));
}
const aggregateRestored=createTyranidsBrowserRoster(book);aggregateRestored.load(aggregate.snapshot());
assert.deepEqual(aggregateRestored.projection,aggregate.projection);
await assert.rejects(()=>createBrowserRoster({fetch:async()=>({ok:false})}));
assert.equal(JSON.stringify(book),before,'Presentation adapter must not mutate canonical input');

// Independent accepted source -> explicit physical decision -> executor ->
// actual production Effective/Guide projector. No invented NR choice token.
export const trygonChoiceExpectation=JSON.parse(fs.readFileSync(new URL('./source-choice-expectations.json',import.meta.url))).cases[0];
const ce=trygonChoiceExpectation,ruleId=ce.source.canonicalId,optionId=ce.selection.selectedOptionId;
const rawSource=fs.readFileSync(new URL('../../../'+ce.source.document,import.meta.url));
assert.equal(createHash('sha256').update(rawSource).digest('hex').toUpperCase(),ce.source.sha256);
const plain=rawSource.toString('utf8').replace(/<[^>]*>/g,'').replaceAll('&nbsp;',' ').replace(/\s+/g,'');
for(const quote of ce.source.rawClauses)assert.ok(plain.includes(quote.replace(/\s+/g,'')),'Independent accepted source choice');
const official=fs.readFileSync(new URL('../../../'+ce.source.officialEvidence.document,import.meta.url));
assert.equal(createHash('sha256').update(official).digest('hex').toUpperCase(),ce.source.officialEvidence.sha256);
const choiceText='+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: Subterranean Assault\n'+
  'Char1: 1x Trygon (135 pts)\n• 1x Trygon: Bio-electric pulse, Trygon scything talons\nEnhancement: Trygon Prime\n'+
  '1x Trygon (135 pts)\n• 1x Trygon: Bio-electric pulse, Trygon scything talons\n'+
  '1x Psychophage (95 pts)\n• 1x Psychophage: Psychoclastic torrent, Talons and betentacled maw\n';
const newChoiceService=(candidate=book)=>{const s=createTyranidsBrowserRoster(candidate);assert.equal(s.import(choiceText).status,'READY');return s;};
const selected=newChoiceService(),choiceBaseline=selected.projection;
assert.ok(selected.projection.units.slice(0,2).every(u=>!u.keywords.includes('CHARACTER')),'Enhancement/Char sourceRef never imply choice');
assert.equal(selected.sourceChoices('parsed-unit-3').length,0);
function verifyChoice(s,candidate=book,{presentationLost=false}={}) {
  const entity=candidate.entities.find(e=>e.id===ruleId),fact=book.entities.find(e=>e.id===ruleId);
  assert.equal(entity.parentId,ce.source.ownerId);assert.equal(entity.data.text,ce.source.quote);assert.deepEqual(entity.provenance,fact.provenance);
  const effect=entity.ruleContract?.clauses.find(c=>c.id===ce.expectedClauseId)?.rosterEffects[0];assert.ok(effect,'Choice binding required');
  assert.equal(effect.conditions.find(c=>c.binding==='TARGET').predicate.args.find(p=>p.predicate==='FIELD').arguments.equals,optionId,'Explicit selection gate');
  const state=s.snapshot(),u=state.units[0],v=s.effective(u.instanceId),other=s.projection.units[1];
  const presented=projectInstanceCards(cards,u,v).get(u.canonicalUnitId)[0];
  const values=presented.fields.filter(f=>f.type==='tokens').map(f=>f.value);
  if(presentationLost)values.splice(values.indexOf('CHARACTER'),1);
  assertSourceEffectExpectation({expectation:{...ce,expectedOperation:ce.expectedOperations[0]},book:candidate,
    applied:v.applied.filter(a=>a.ruleId===ruleId&&a.operation==='GRANT_UNIT_KEYWORD'),
    observation:{unitCharacter:v.keywords.filter(k=>k==='CHARACTER').length,visibleCharacter:values.filter(k=>k==='CHARACTER').length,
      ordinaryCharacter:other.keywords.includes('CHARACTER'),modelCharacter:v.profiles.some(p=>p.keywords.includes('CHARACTER'))},
    expectedObservation:{unitCharacter:1,visibleCharacter:1,ordinaryCharacter:false,modelCharacter:false}});
  assert.ok(projectPersonalBook(payload,state).allowedIds.has(ruleId),'Guide source owner');
  const personal=projectFormedUnitCards(cards,s,u.instanceId).components[0].card;
  assert.ok(personal.fields.some(f=>f.type==='tokens'&&f.value==='CHARACTER'),'Personal physical keyword');
  assert.equal(cards.get(ruleId).fields.find(f=>f.source.path==='/text').value,ce.source.quote,'Full Guide source text');
  const decision=u.modelRows[0].selections.find(row=>row.canonicalOptionIds?.includes(optionId));
  assert.equal(decision.sourceModelScopeId,v.profiles[0].scopeId);assert.equal(decision.sourceChoiceReference.entityId,ruleId);
  assert.deepEqual(decision.sourceProvenance,entity.provenance);
  assert.ok(v.applied.filter(a=>a.ruleId===ruleId).every(a=>a.targetInstanceId===u.instanceId));
}
selected.setSourceChoice('parsed-unit-1',ruleId,optionId);verifyChoice(selected);
const selectedSnapshot=selected.snapshot(),selectedProjection=selected.projection;
const modelFacts=unit=>unit.profiles.map(p=>({profile:p.profile,keywords:p.keywords,abilities:p.abilities,weapons:p.weapons.map(w=>w.data)}));
assert.deepEqual(modelFacts(selectedProjection.units[0]),modelFacts(choiceBaseline.units[0]),'UNIT choice does not change MODEL or weapon facts');
assert.deepEqual(selectedProjection.units[1],choiceBaseline.units[1],'Independent Trygon unchanged');
assert.deepEqual(selectedProjection.units[2],choiceBaseline.units[2],'Foreign unit unchanged');
const choiceReload=createTyranidsBrowserRoster(book);choiceReload.load(selectedSnapshot);verifyChoice(choiceReload);
assert.deepEqual(choiceReload.projection,selectedProjection);
assert.equal(choiceReload.import(choiceText).status,'READY');verifyChoice(choiceReload);assert.deepEqual(choiceReload.snapshot(),selectedSnapshot);
choiceReload.setSourceChoice('parsed-unit-1',ruleId,null);
assert.deepEqual(choiceReload.projection.units.map(u=>u.keywords),choiceBaseline.units.map(u=>u.keywords));
assert.deepEqual(modelFacts(choiceReload.projection.units[0]),modelFacts(choiceBaseline.units[0]),'Removing only choice preserves independent Enhancement stats/weapons/abilities');
assert.ok(choiceReload.projection.units[0].profiles[0].keywords.includes('SYNAPSE'),'Removing source choice keeps independent Enhancement');
choiceReload.setSourceChoice('parsed-unit-1',ruleId,optionId);verifyChoice(choiceReload);assert.deepEqual(choiceReload.projection,selectedProjection);
const noEnh=choiceText.replace('Enhancement: Trygon Prime\n',''),withoutEnh=createTyranidsBrowserRoster(book);
assert.equal(withoutEnh.import(noEnh).status,'READY');withoutEnh.setSourceChoice('parsed-unit-1',ruleId,optionId);
assert.ok(withoutEnh.projection.units[0].keywords.includes('CHARACTER'));assert.ok(!withoutEnh.projection.units[0].keywords.includes('SYNAPSE'));
const beforeNamespaceReplacement=choiceReload.snapshot(),beforeNamespaceProjection=choiceReload.projection;
assert.equal(choiceReload.import(choiceText+'\n').status,'REPLACEMENT_REQUIRED');
assert.deepEqual(choiceReload.snapshot(),beforeNamespaceReplacement,'Unconfirmed changed namespace preserves source choices and roster');
assert.deepEqual(choiceReload.projection,beforeNamespaceProjection,'Unconfirmed changed namespace preserves computed effects');
assert.equal(choiceReload.import(choiceText+'\n',{},{replaceExisting:true}).status,'READY');
assert.ok(!choiceReload.projection.units[0].keywords.includes('CHARACTER'),'Changed input namespace requires explicit confirmation');
const noSource=createTyranidsBrowserRoster(book);assert.equal(noSource.import(choiceText.replace('Subterranean Assault','Invasion Fleet').replace('Enhancement: Trygon Prime\n','')).status,'READY');
assert.equal(noSource.sourceChoices('parsed-unit-1').length,0);assert.throws(()=>noSource.setSourceChoice('parsed-unit-1',ruleId,optionId));
const choiceNegatives=[];
for(const [name,mutate]of [
  ['orphan-field',s=>{s.units[0].modelRows[0].selections=s.units[0].modelRows[0].selections.filter(r=>!r.canonicalOptionIds);}],
  ['missing-field',s=>{delete s.units[0].selectedSourceChoiceIds;}],
  ['wrong-option',s=>{s.units[0].selectedSourceChoiceIds=['unknown-choice'];}],
  ['wrong-model',s=>{s.units[0].modelRows[0].selections.at(-1).sourceModelScopeId=s.units[1].instanceId;}],
  ['wrong-provenance',s=>{s.units[0].modelRows[0].selections.at(-1).sourceProvenance.sourceId='foreign';}],
  ['duplicate-choice',s=>{s.units[0].modelRows[0].selections.push(structuredClone(s.units[0].modelRows[0].selections.at(-1)));}],
  ['foreign-recipient',s=>{s.units[2].selectedSourceChoiceIds=s.units[0].selectedSourceChoiceIds;s.units[2].modelRows[0].selections.push(s.units[0].modelRows[0].selections.pop());delete s.units[0].selectedSourceChoiceIds;}]
]) {const s=structuredClone(selectedSnapshot);mutate(s);assert.throws(()=>selected.load(s),name);assert.deepEqual(selected.snapshot(),selectedSnapshot,'Invalid load preserves previous roster');choiceNegatives.push(name);}
assert.throws(()=>selected.setSourceChoice('parsed-unit-3',ruleId,optionId));assert.throws(()=>selected.setSourceChoice('parsed-unit-1','foreign-rule',optionId));
assert.deepEqual(selected.snapshot(),selectedSnapshot);
const choiceMutations=[];
for(const [name,mutate]of [
  ['missing-binding',b=>{delete b.entities.find(e=>e.id===ruleId).ruleContract;}],
  ['wrong-keyword',b=>{b.entities.find(e=>e.id===ruleId).ruleContract.clauses[0].rosterEffects[0].keyword='SYNAPSE';}],
  ['wrong-recipient-scope',b=>{b.entities.find(e=>e.id===ruleId).ruleContract.clauses[0].rosterEffects[0].unitScope='FORMED';}],
  ['wrong-selection-gate',b=>{b.entities.find(e=>e.id===ruleId).ruleContract.clauses[0].rosterEffects[0].conditions.find(c=>c.binding==='TARGET').predicate.args.find(p=>p.predicate==='FIELD').arguments.equals='foreign';}],
  ['wrong-detachment',b=>{b.entities.find(e=>e.id===ruleId).ruleContract.detachmentId='detachment-invasion-fleet';}]
]){const b=structuredClone(book);mutate(b);assert.throws(()=>{const s=newChoiceService(b);s.setSourceChoice('parsed-unit-1',ruleId,optionId);verifyChoice(s,b);},name);choiceMutations.push(name);}
assert.throws(()=>verifyChoice(selected,book,{presentationLost:true}),'Computed keyword missing in production presentation must fail');choiceMutations.push('missing-presentation');
export const trygonChoiceGuardResult={id:ce.id,status:'PASS',physicalUnits:3,negativeControls:choiceNegatives,
  mutations:choiceMutations,sourceVerified:true,executorAndProductionPresentation:true,saveLoadReimport:true,
  modelScope:'Selected MODEL decision, PHYSICAL UNIT keyword; no MODEL keyword mutation',realNewRecruitExportTested:false};
console.log(JSON.stringify(trygonChoiceGuardResult));
console.log(JSON.stringify({status:'PASS',import:'CONSTRUCTED_NEW_RECRUIT_TEXT',realNewRecruitExportTested:false,
  physicalInstances:5,nativeFnpInstances:2,formationRecompute:true,reload:true,centralPointsUnchanged:true,
  unloweredRulesConditional:true,negativeControls:4,sharedRuntimeChanged:false}));
