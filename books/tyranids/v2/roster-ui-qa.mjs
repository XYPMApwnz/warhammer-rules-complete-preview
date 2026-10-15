import assert from 'node:assert/strict';
import {buildTyranidsContracts} from './rule-contract-build.mjs';
import {createTyranidsBrowserRoster,createBrowserRoster} from './roster-boot.mjs';
import {resolveImportedPoints} from './roster-points.mjs';

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
await assert.rejects(()=>createBrowserRoster({fetch:async()=>({ok:false})}));
assert.equal(JSON.stringify(book),before,'Presentation adapter must not mutate canonical input');
console.log(JSON.stringify({status:'PASS',import:'CONSTRUCTED_NEW_RECRUIT_TEXT',realNewRecruitExportTested:false,
  physicalInstances:5,nativeFnpInstances:2,formationRecompute:true,reload:true,centralPointsUnchanged:true,
  unloweredRulesConditional:true,negativeControls:4,sharedRuntimeChanged:false}));
