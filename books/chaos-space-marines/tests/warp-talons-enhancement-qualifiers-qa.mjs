import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value);
const plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams,location:{href:'http://localhost/books/chaos-space-marines/reader.html',pathname:'/books/chaos-space-marines/reader.html',search:''},document:{documentElement:{dataset:{bookId:'chaos-space-marines'}},querySelectorAll:()=>[],querySelector:()=>null},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},dispatchEvent(){},addEventListener(){}};
scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js','books/chaos-space-marines/scripts/roster-data.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseCatalog=plain(scope.WH_BOOK_ROSTER_CATALOG),pointsCatalog=scope.WH_POINTS_CATALOG['chaos space marines'];
const canonical=id=>baseCatalog.units.find(unit=>unit.id===id);
const pointUnit=id=>Object.values(pointsCatalog.units).find(unit=>unit.unitId===id);
const unit=(id,instanceId)=>{const source=canonical(id),points=pointUnit(id),tier=points.points[0],quantity=tier.minModels||1;return{id:instanceId,canonicalUnitId:id,name:source.title,quantity,points:1,models:[]};};
const enhancement=(id,title,owner='lord')=>({id,ruleId:id,name:title,ownerUnitId:owner,ownerStatus:'resolved'});
const cases=[
  {id:'enhancement-pact-of-cursed-pinions',title:'Pact of Cursed Pinions',detachmentId:'murdertalon-raiders'},
  {id:'enhancement-sorrowscent-vulture',title:'Sorrowscent Vulture',detachmentId:'nightmare-hunt'}
];
const roster=(units,testCase,owner='lord')=>({faction:'Chaos Space Marines',pointsLimit:2000,detachments:[{id:testCase.detachmentId,name:baseCatalog.detachments.find(item=>item.id===testCase.detachmentId).title}],units,enhancements:[enhancement(testCase.id,testCase.title,owner)],warnings:[]});
const project=(source,{attachments={},catalog=baseCatalog}={})=>scope.WHArmyRosterContext.project({catalog,roster:source,record:{id:'csm-warp-talons-qualifiers',attachments,roster:source}});
const eligibility=result=>result.enhancementAssessment.assignments[0]?.assessment?.ownerEligibility;

const mfm=JSON.parse(read('books/chaos-space-marines/sources/official-mfm-v1.4.json'));
const pack=JSON.parse(read('books/chaos-space-marines/content/chaos-space-marines-faction-pack.en.json'));
let positive=0,negative=0,detach=0,physical=0,killed=0;
for(const testCase of cases){
  const detachment=mfm.detachments.find(item=>item.title.toLowerCase()===testCase.detachmentId.replaceAll('-',' '));
  const current=detachment.enhancements.find(item=>item.title===testCase.title);
  assert.deepEqual(current.qualifiers,[{kind:'LEADER',values:['WARP TALONS']}],`${testCase.title}: exact current MFM qualifier`);
  const sourceDetachment=pack.detachments.find(item=>item.id===testCase.detachmentId);
  assert.match(sourceDetachment.enhancements.find(item=>item.title===testCase.title).text,/^LEADER: WARP TALONS\n/,`${testCase.title}: certified source qualifier`);

  const source=roster([unit('unit-warp-talons','talons'),unit('unit-chaos-lord-with-jump-pack','lord')],testCase);
  let result=project(source,{attachments:{talons:['lord']}});
  assert.equal(eligibility(result),'valid',`${testCase.title}: correct bearer leading Warp Talons accepted`);positive++;
  assert.deepEqual(plain(result.record.attachments),{talons:['lord']},`${testCase.title}: conditional Warp Talons attachment accepted`);positive++;
  assert.equal(project(source).enhancementAssessment.assignments[0].assessment.ownerEligibility,'invalid',`${testCase.title}: unattached bearer rejected`);negative++;detach++;

  const wrongTarget=roster([unit('unit-raptors','raptors'),unit('unit-chaos-lord-with-jump-pack','lord')],testCase);
  assert.equal(eligibility(project(wrongTarget,{attachments:{raptors:['lord']}})),'invalid',`${testCase.title}: bearer leading wrong unit rejected`);negative++;
  const wrongBearer=roster([unit('unit-warp-talons','talons'),unit('unit-haarken-worldclaimer','haarken')],testCase,'haarken');
  assert.equal(eligibility(project(wrongBearer,{attachments:{talons:['haarken']}})),'invalid',`${testCase.title}: wrong bearer rejected`);negative++;

  const isolated=roster([unit('unit-warp-talons','talons-a'),unit('unit-warp-talons','talons-b'),unit('unit-chaos-lord-with-jump-pack','lord-a'),unit('unit-chaos-lord-with-jump-pack','lord-b')],testCase,'lord-a');
  assert.equal(eligibility(project(isolated,{attachments:{'talons-a':['lord-a'],'talons-b':['lord-b']}})),'valid',`${testCase.title}: assigned physical pair accepted`);physical++;
  assert.equal(eligibility(project(isolated,{attachments:{'talons-b':['lord-b']}})),'invalid',`${testCase.title}: another physical pair cannot satisfy assigned bearer`);physical++;detach++;
  assert.equal(eligibility(project(isolated,{attachments:{'talons-a':['lord-a']}})),'valid',`${testCase.title}: other duplicate does not affect assigned pair`);physical++;

  const mutate=(label,change,assertKilled)=>{const catalog=clone(baseCatalog),points=Object.values(pointsCatalog.enhancements).find(item=>item.id===testCase.id),prior=clone(points.owner.selector);try{change(catalog.enhancements.find(item=>item.id===testCase.id).owner.selector,points.owner.selector);assertKilled(catalog);killed++;}finally{points.owner.selector=prior;}};
  mutate('leading qualifier removed',(local,points)=>{local.leadingUnitIds=[];points.leadingUnitIds=[];},catalog=>assert.equal(eligibility(project(source,{catalog})),'valid',`${testCase.title}: removing leading requirement mutation killed`));
  mutate('leading target wrong',(local,points)=>{local.leadingUnitIds=['unit-raptors'];points.leadingUnitIds=['unit-raptors'];},catalog=>assert.equal(eligibility(project(source,{attachments:{talons:['lord']},catalog})),'invalid',`${testCase.title}: wrong target mutation killed`));
  mutate('bearer identity wrong',(local,points)=>{local.unitIds=['unit-haarken-worldclaimer'];points.unitIds=['unit-haarken-worldclaimer'];},catalog=>assert.equal(eligibility(project(source,{attachments:{talons:['lord']},catalog})),'invalid',`${testCase.title}: wrong bearer mutation killed`));
}
assert.equal(killed,6,'all qualifier mutation controls killed');
console.log(`CSM Warp Talons Enhancement qualifier QA passed: 2/2 qualifiers, ${positive} positive, ${negative} negative, ${detach} detach, ${physical} physical-instance controls, ${killed}/6 mutations killed.`);
