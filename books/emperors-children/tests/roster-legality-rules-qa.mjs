import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const local=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams,location:{href:'http://localhost/books/emperors-children/reader.html',pathname:'/books/emperors-children/reader.html',search:''},document:{documentElement:{dataset:{bookId:'emperors-children'}},querySelectorAll:()=>[],querySelector:()=>null},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},dispatchEvent(){},addEventListener(){}};
scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js','books/emperors-children/scripts/roster-data.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseCatalog=local(scope.WH_BOOK_ROSTER_CATALOG),pointsCatalog=scope.WH_POINTS_CATALOG['emperor s children'];
const canonical=id=>baseCatalog.units.find(unit=>unit.id===id);
const pointUnit=id=>Object.values(pointsCatalog.units).find(unit=>unit.unitId===id);
const unit=(id,instanceId,warlord=false)=>{const source=canonical(id),points=pointUnit(id),tier=points.points[0],quantity=tier.minModels||1;return{id:instanceId,canonicalUnitId:id,name:source.title,quantity,points:1,warlord,models:[]};};
const roster=(units,{detachmentId='court-of-the-phoenician',enhancements=[],pointsLimit=2000}={})=>({faction:"Emperor's Children",pointsLimit,detachments:[{id:detachmentId,name:baseCatalog.detachments.find(item=>item.id===detachmentId).title}],units,enhancements,warnings:[]});
const project=(source,{attachments={},catalog=baseCatalog}={})=>scope.WHArmyRosterContext.project({catalog,roster:source,record:{id:'ec-legality',attachments,roster:source}});
const exalted=(owner='lord')=>({id:'enhancement-exalted-patron',ruleId:'enhancement-exalted-patron',name:'Exalted Patron',ownerUnitId:owner,ownerStatus:'resolved'});
const active=result=>result.enhancementAssessment.assignments[0]?.assessment?.ownerEligibility;

let source=roster([unit('unit-flawless-blades','blades'),unit('unit-lord-exultant','lord')],{enhancements:[exalted()]});
let result=project(source,{attachments:{blades:['lord']}});
assert.equal(active(result),'valid','Exalted Patron: Lord Exultant leading Flawless Blades accepted');
assert.deepEqual(local(result.record.attachments),{blades:['lord']},'conditional attachment is source-qualified');
assert.equal(project(source).enhancementAssessment.assignments[0].assessment.ownerEligibility,'invalid','unattached Lord Exultant rejected');
const wrongTarget=roster([unit('unit-infractors','body'),unit('unit-lord-exultant','lord')],{enhancements:[exalted()]});
assert.equal(project(wrongTarget,{attachments:{body:['lord']}}).enhancementAssessment.assignments[0].assessment.ownerEligibility,'invalid','wrong led unit rejected');
const wrongBearer=roster([unit('unit-flawless-blades','blades'),unit('unit-lord-kakophonist','lord')],{enhancements:[exalted()]});
assert.equal(project(wrongBearer,{attachments:{blades:['lord']}}).enhancementAssessment.assignments[0].assessment.ownerEligibility,'invalid','wrong bearer rejected');
assert.equal(project(source,{attachments:{blades:['lord']}}).enhancements.length,1,'attached Enhancement active');
assert.equal(project(source).enhancements.length,0,'detach/recompute invalidates Enhancement');

const fulgrim=unit('unit-fulgrim','fulgrim',true),lord=unit('unit-lord-exultant','lord');
assert.equal(project(roster([fulgrim])).game.status,'ready','Fulgrim as Warlord valid');
assert.equal(project(roster([{...fulgrim,warlord:false},{...lord,warlord:true}])).game.status,'invalid','Fulgrim present with another Warlord invalid');
assert.equal(project(roster([{...lord,warlord:true}])).game.status,'ready','Fulgrim absent leaves ordinary Warlord unchanged');

const legionArmy=(copies,pointsLimit,warlord=false)=>roster(Array.from({length:copies},(_,index)=>unit('unit-daemonettes',`daemonettes-${index+1}`,warlord&&index===0)),{detachmentId:'carnival-of-excess',pointsLimit});
for(const [pointsLimit,at,above] of [[1000,5,6],[2000,10,11],[3000,15,16]]){
  assert.equal(project(legionArmy(at,pointsLimit)).game.status,'ready',`${pointsLimit}: at cap accepted`);
  const over=project(legionArmy(above,pointsLimit));assert.equal(over.game.status,'invalid',`${pointsLimit}: above cap rejected`);assert.equal(over.game.legality.issues[0].reason,'points-cap-exceeded');
}
const keeperRoster=roster([unit('unit-keeper-of-secrets','keeper',true)],{detachmentId:'carnival-of-excess',pointsLimit:2000});
result=project(keeperRoster);assert.equal(result.game.status,'invalid','LEGIONS OF EXCESS Warlord rejected');assert.equal(result.units[0].context.warlord.eligibility,'invalid');
assert.equal(project(roster([{...lord,warlord:true}],{detachmentId:'carnival-of-excess'})).game.status,'ready','unrelated Warlord unaffected');
const isolated=project(roster([unit('unit-keeper-of-secrets','keeper-1'),unit('unit-keeper-of-secrets','keeper-2',true)],{detachmentId:'carnival-of-excess'}));assert.equal(isolated.units.find(item=>item.raw.id==='keeper-1').context.warlord.eligibility,'not-selected');assert.equal(isolated.units.find(item=>item.raw.id==='keeper-2').context.warlord.eligibility,'invalid');

const liveExalted=Object.values(pointsCatalog.enhancements).flat().find(e=>e.id==='enhancement-exalted-patron');
let killed=0;const mutation=(label,mutate,assertKilled)=>{const catalog=local(baseCatalog),priorLeading=local(liveExalted.owner.selector.leadingUnitIds);try{mutate(catalog,liveExalted);assertKilled(catalog);killed++;}finally{liveExalted.owner.selector.leadingUnitIds=priorLeading;}};
mutation('leading target removed',(catalog,points)=>{catalog.enhancements.find(e=>e.id==='enhancement-exalted-patron').owner.selector.leadingUnitIds=[];points.owner.selector.leadingUnitIds=[];},catalog=>assert.equal(project(source,{catalog}).enhancementAssessment.assignments[0].assessment.ownerEligibility,'valid'));
mutation('leading target wrong',(catalog,points)=>{catalog.enhancements.find(e=>e.id==='enhancement-exalted-patron').owner.selector.leadingUnitIds=['unit-infractors'];points.owner.selector.leadingUnitIds=['unit-infractors'];},catalog=>assert.equal(project(source,{attachments:{blades:['lord']},catalog}).enhancementAssessment.assignments[0].assessment.ownerEligibility,'invalid'));
mutation('mandatory Warlord removed',(catalog)=>catalog.rosterLegality.mandatoryWarlords=[],catalog=>assert.equal(project(roster([{...fulgrim,warlord:false},{...lord,warlord:true}]),{catalog}).game.status,'ready'));
mutation('mandatory identity wrong',(catalog)=>catalog.rosterLegality.mandatoryWarlords[0].unitIds=['unit-lord-kakophonist'],catalog=>assert.equal(project(roster([{...fulgrim,warlord:false},{...lord,warlord:true}]),{catalog}).game.status,'ready'));
for(const [index,pointsLimit,above] of [[0,1000,6],[1,2000,11],[2,3000,16]])mutation(`cap ${pointsLimit} removed`,catalog=>catalog.rosterLegality.pointCaps[0].limits.splice(index,1),catalog=>assert.equal(project(legionArmy(above,pointsLimit),{catalog}).game.status,'ready'));
mutation('Warlord prohibition removed',catalog=>catalog.rosterLegality.warlordProhibitions=[],catalog=>assert.equal(project(keeperRoster,{catalog}).game.status,'ready'));
assert.equal(killed,8,'all legality mutation controls killed');
console.log(`Emperor's Children roster legality QA passed: 3/3 rules, 10 positive controls, 8 negative controls, 4 recompute controls, 3 physical-instance controls, ${killed}/8 mutations killed.`);




