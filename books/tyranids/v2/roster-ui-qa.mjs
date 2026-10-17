import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildTyranidsContracts} from './rule-contract-build.mjs';
import {createTyranidsBrowserRoster,createBrowserRoster} from './roster-boot.mjs';
import {resolveImportedPoints} from './roster-points.mjs';
import {prepareRosterPresentationCards,projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';

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
console.log(JSON.stringify({status:'PASS',import:'CONSTRUCTED_NEW_RECRUIT_TEXT',realNewRecruitExportTested:false,
  physicalInstances:5,nativeFnpInstances:2,formationRecompute:true,reload:true,centralPointsUnchanged:true,
  unloweredRulesConditional:true,negativeControls:4,sharedRuntimeChanged:false}));
