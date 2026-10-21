/** Source-backed RCS Advance/Charge span; independent expected values, no dice. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDarkAngelsImportBook} from './roster-import-build.mjs';
import {createDarkAngelsRosterService} from './roster-import.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';
const book=buildDarkAngelsImportBook(),service=createDarkAngelsRosterService(book),clone=structuredClone;
const ruleId='ability-da-61ae3e245d824682a480',champion='model-da-d9a85659ae224494b0a7';
const source=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8')).entities.find(row=>row.id===ruleId);
assert.ok(source.data.text.includes('- This unit has +1 to advance rolls and charge rolls.'));
const text=`+ FACTION KEYWORD: Dark Angels
+ DETACHMENT: Tactical Brethren
1x Sammael (9999 pts)
• 1x Sammael: 1x Bolt Pistol, 1x The Raven Sword
3x Ravenwing Black Knights (9999 pts)
• 1x Ravenwing Huntmaster: 1x Bolt Pistol, 1x Corvus Hammers
• 2x Ravenwing Black Knight
3x Ravenwing Black Knights (9999 pts)
• 1x Ravenwing Huntmaster: 1x Bolt Pistol, 1x Corvus Hammers
• 2x Ravenwing Black Knight
3x Ravenwing Command Squad (9999 pts)
• 1x Ravenwing Champion: 1x Bolt Pistol, 1x Corvus Hammers
• 1x Ravenwing Apothecary
• 1x Ravenwing Ancient
`;
assert.equal(service.import(text).status,'READY');const initial=service.snapshot(),points=clone(service.points);
const payload=buildGameplayPresentation(),cards=new Map(payload.cards.map(c=>[c.id,c]));
const expect=(id,value)=>{const e=service.effective(id);assert.equal(e.unitMetrics?.advanceRoll?.modifier||0,value);assert.equal(e.unitMetrics?.chargeRoll?.modifier||0,value);assert.ok(e.profiles.every(p=>!Object.hasOwn(p.metrics,'advanceRoll')));if(value){const traces=e.unitMetricSources.filter(r=>r.field==='advanceRoll');assert.equal(traces.length,1);assert.equal(traces[0].sourceInstanceId,'parsed-unit-4');assert.equal(traces[0].ruleId,ruleId);const card=projectInstanceCards(cards,service.state.units.find(u=>u.instanceId===id),e).get(e.canonicalUnitId)[0];const metric=card.rosterUnitMetrics.find(m=>m.key==='advanceRoll');assert.equal(metric.label,'Advance-roll modifier');assert.equal(metric.displayValue,'+1');assert.equal(metric.sources[0].sourceInstanceId,'parsed-unit-4');}return e;};
expect('parsed-unit-4',1);expect('parsed-unit-2',0);expect('parsed-unit-3',0);
service.attach('parsed-unit-1','parsed-unit-2');service.attach('parsed-unit-4','parsed-unit-2');
expect('parsed-unit-2',1);expect('parsed-unit-1',1);expect('parsed-unit-3',0);
const attached=service.snapshot();service.load(JSON.parse(JSON.stringify(attached)));expect('parsed-unit-2',1);assert.deepEqual(service.snapshot(),attached);
service.detach('parsed-unit-4');expect('parsed-unit-2',0);expect('parsed-unit-4',1);assert.deepEqual(service.points,points);
service.load(initial);const missing=clone(initial),unit=missing.units[3];unit.modelRows=unit.modelRows.filter(r=>r.canonicalProfileId!==champion);unit.startingStrength=unit.modelRows.reduce((n,r)=>n+r.quantity,0);unit.equipmentContextKnown=false;service.load(missing);expect('parsed-unit-4',0);expect('parsed-unit-3',0);
service.load(initial);expect('parsed-unit-4',1);assert.deepEqual(service.snapshot(),initial);
for(const mutate of [effect=>effect.value=2,effect=>effect.unitScope='PHYSICAL']){const altered=clone(book);const clause=altered.entities.find(r=>r.id===ruleId).ruleContract.clauses.find(c=>c.id==='honour-or-death-charge');mutate(clause.rosterEffects.find(e=>e.field==='advanceRoll'));const bad=createDarkAngelsRosterService(altered);assert.equal(bad.import(text).status,'READY');bad.attach('parsed-unit-4','parsed-unit-2');assert.throws(()=>assert.equal(bad.effective('parsed-unit-2').unitMetrics?.advanceRoll?.modifier,1));}
console.log(JSON.stringify({status:'PASS',sourceClause:ruleId,advance:1,charge:1,modelScopeUnchanged:true,repeatedUnitIsolated:true,championRequired:true,attachmentLifecycle:true,snapshot:true,pointsUnchanged:true,mutations:2,realNewRecruitExportTested:false}));
