/** Accepted Redemptor RAW: Heavy Onslaught may be replaced by Macro Plasma.
 * Official SM MFM v1.6: first two UNIT170, third+190, Macro10 per purchase.
 * Constructed inputs/explicit projector mutations are diagnostics, not authentic
 * New Recruit exports or assertions of full army/loadout legality. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createBloodAngelsRosterService} from './roster-import.mjs';
import {projectBloodAngelsPaidOptions} from './roster-paid-options.mjs';
import {createBloodAngelsPaidOptionBindings} from './roster-paid-option-bindings-build.mjs';

const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8')),clone=structuredClone;
const book=read('./generated/roster-import.json'),mixed=read('./generated/mixed-owner-book.json');
const COST='mfm-paid-upgrade-ccbd208631bacc48',UNIT='unit-sm-32e5b655a21342f6';
const UNPAID='weapon-sm-4ba707edc43c44f6',PERMISSION='wargear-sm-cd58de47865c4207';
const quote='This model’s Heavy Onslaught Gatling Cannon can be replaced with 1 Macro Plasma Incinerator.';
const binding=book.mfmPhysicalPaidOptions.find(b=>b.costRecordId===COST);
const header='+ FACTION KEYWORD: Blood Angels\n+ DETACHMENT: Gladius Task Force\n';
const block=items=>'1x Redemptor Dreadnought (9999 pts)\n• 1x Redemptor Dreadnought'+
  (items.length?': '+items.map(x=>'1x '+x).join(', '):'')+'\n';
const input=(...units)=>header+units.map(block).join('');
const cases=[],test=(id,run)=>{try{run();cases.push({id,status:'PASS'});}catch(e){cases.push({id,status:'FAIL',error:e.stack});}};
const ready=(s,text,options={})=>{const r=s.import(text,{},options);assert.equal(r.status,'READY');return r;};
const service=()=>createBloodAngelsRosterService(book);
const point=(s,total)=>{assert.equal(s.points.status,total===null?'UNRESOLVED':'RESOLVED');assert.equal(s.points.totalPoints,total);};
const items=s=>s.state.units[0].modelRows[0].selections;
const paid=state=>projectBloodAngelsPaidOptions(state,{bindings:book.mfmPhysicalPaidOptions});

test('partial-fragstorm-does-not-prove-main-slot',()=>{
  const s=service();ready(s,input(['Fragstorm Grenade Launchers']));point(s,null);
  assert.equal(s.state.units[0].equipmentContextKnown,true);assert.equal(s.points.knownPoints,170);
  assert.equal(s.points.units[0].paid.knownPaidPoints,0);
  assert.ok(s.points.units[0].paid.unresolved.some(x=>x.reason==='PAID_SELECTION_UNKNOWN'));
});
test('source-pinned-exclusive-alternative-and-price',()=>{
  assert.equal(binding.ownerUnitId,UNIT);assert.equal(binding.value,10);
  assert.equal(binding.provenance.sourceId,'space-marines-mfm-v1.6');
  assert.equal(binding.selectionResolution.kind,'EXCLUSIVE_PAID_WEAPON_SLOT');
  assert.deepEqual(binding.selectionResolution.unpaidProfileIds,[UNPAID]);
  assert.equal(binding.selectionResolution.permissionId,PERMISSION);assert.equal(binding.selectionResolution.quote,quote);
  const source=mixed.entities.find(e=>e.id===PERMISSION);assert.equal(source.parentId,UNIT);
  assert.ok(source.data.text.includes(quote));assert.deepEqual(binding.selectionResolution.sourceProvenance,source.provenance);
  assert.equal(book.importBindings.defaults,'OMITTED_LOADOUT_UNKNOWN');
});
for(const [id,gear,total]of[
  ['bare',[],null],['independent-Icarus',['Icarus Rocket Pod'],null],
  ['independent-flamer',['Heavy Flamer'],null],['independent-fist',['Redemptor Fist'],null],
  ['explicit-unpaid-main',['Heavy Onslaught Gatling Cannon'],170],
  ['explicit-paid-main',['Macro Plasma Incinerator'],180],
  ['complete-default',['Fragstorm Grenade Launchers','Heavy Flamer','Heavy Onslaught Gatling Cannon','Redemptor Fist'],170],
  ['complete-paid',['Fragstorm Grenade Launchers','Heavy Flamer','Macro Plasma Incinerator','Redemptor Fist'],180],
  ['unpaid-with-optional',['Heavy Onslaught Gatling Cannon','Icarus Rocket Pod'],170],
  ['paid-with-optional',['Macro Plasma Incinerator','Icarus Rocket Pod'],180]
])test(id+'-recompute-reload-keep-reimport',()=>{
  const s=service(),text=input(gear);ready(s,text);point(s,total);
  const snapshot=s.snapshot(),projection=clone(s.projection),points=clone(s.points);
  s.recompute();assert.deepEqual(s.projection,projection);assert.deepEqual(s.points,points);
  s.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(s.snapshot(),snapshot);assert.deepEqual(s.points,points);
  ready(s,text);assert.deepEqual(s.snapshot(),snapshot);assert.deepEqual(s.points,points);
});
test('bare-unknown-has-one-reason-not-P1-duplicate',()=>{
  const s=service();ready(s,input([]));point(s,null);
  assert.equal(s.points.units[0].paid.unresolved.filter(x=>x.reason==='PAID_SELECTION_UNKNOWN').length,1);
});
test('replace-updates-slot-knownness-without-default-selections',()=>{
  const s=service();ready(s,input(['Fragstorm Grenade Launchers']));point(s,null);
  assert.equal(items(s).length,1);
  ready(s,input(['Macro Plasma Incinerator']),{replaceExisting:true});point(s,180);
  ready(s,input(['Heavy Onslaught Gatling Cannon']),{replaceExisting:true});point(s,170);
  ready(s,input(['Icarus Rocket Pod']),{replaceExisting:true});point(s,null);assert.equal(items(s).length,1);
});
for(const [id,units,total]of[
  ['partial-and-unpaid',[['Fragstorm Grenade Launchers'],['Heavy Onslaught Gatling Cannon']],null],
  ['paid-and-unpaid',[['Macro Plasma Incinerator'],['Heavy Onslaught Gatling Cannon']],350],
  ['two-paid',[['Macro Plasma Incinerator'],['Macro Plasma Incinerator']],360],
  ['third-copy-tier',[['Heavy Onslaught Gatling Cannon'],['Heavy Onslaught Gatling Cannon'],['Heavy Onslaught Gatling Cannon']],530]
])test('repeated-UNIT-'+id,()=>{
  const s=service();ready(s,input(...units));point(s,total);
  assert.equal(new Set(s.state.units.map(x=>x.instanceId)).size,units.length);
  if(total===null){assert.equal(s.points.units[0].paid.status,'UNRESOLVED');assert.equal(s.points.units[1].paid.status,'RESOLVED');}
});
test('alternative-profiles-one-physical-purchase',()=>{
  const s=service();ready(s,input(['Macro Plasma Incinerator']));point(s,180);
  const option=s.points.units[0].paid.options.find(x=>x.costRecordId===COST);
  assert.equal(option.quantity,1);assert.equal(option.points,10);assert.equal(option.selections.length,1);
  assert.equal(option.selections[0].canonicalProfileIds.length,2);
});
test('true-empty-flag-is-not-physical-slot-proof',()=>{
  const state={bookId:'blood-angels',units:[{instanceId:'synthetic',canonicalUnitId:UNIT,equipmentContextKnown:true,selections:[],modelRows:[]}]};
  const actual=paid(state);assert.equal(actual.status,'UNRESOLVED');assert.equal(actual.totalPaidPoints,null);
});
for(const [id,mutate]of[
  ['unknown-quantity',s=>delete s.physicalQuantity],['negative-quantity',s=>s.physicalQuantity=-1],['zero-paid-occurrence',s=>s.physicalQuantity=0]
])test('SOURCE_INVALID-projector-mutation-'+id,()=>{
  const s=service();ready(s,input(['Macro Plasma Incinerator']));const state=s.snapshot();mutate(state.units[0].modelRows[0].selections[0]);
  assert.equal(paid(state).totalPaidPoints,null);
});
test('SOURCE_INVALID-split-alternative-occurrences-remain-unresolved',()=>{
  const s=service();ready(s,input(['Macro Plasma Incinerator']));const state=s.snapshot(),row=state.units[0].modelRows[0],one=row.selections[0],second=clone(one);
  one.canonicalProfileIds=[binding.profileIds[0]];second.canonicalProfileIds=[binding.profileIds[1]];second.selectionKey+='/SPLIT';row.selections.push(second);
  assert.equal(paid(state).totalPaidPoints,null);
});
test('SOURCE_INVALID-duplicate-occurrence-remains-unresolved',()=>{
  const s=service();ready(s,input(['Macro Plasma Incinerator']));const state=s.snapshot(),row=state.units[0].modelRows[0];row.selections.push(clone(row.selections[0]));
  assert.equal(paid(state).totalPaidPoints,null);
});
test('invalid-physical-snapshot-rejected-keeps-prior-roster',()=>{
  const s=service();ready(s,input(['Macro Plasma Incinerator']));const saved=s.snapshot(),bad=clone(saved);
  bad.units[0].modelRows[0].selections[0].canonicalProfileIds=['NONEXISTENT_WEAPON'];
  assert.throws(()=>s.load(bad));assert.deepEqual(s.snapshot(),saved);point(s,180);
});
for(const [id,mutate]of[
  ['permission-owner',b=>b.entities.find(x=>x.id===PERMISSION).parentId='FOREIGN'],
  ['permission-quote',b=>b.entities.find(x=>x.id===PERMISSION).data.text='UNREVIEWED'],
  ['unpaid-owner',b=>b.entities.find(x=>x.id===UNPAID).parentId='FOREIGN']
])test('SOURCE_INVALID-binding-proof-mutation-'+id,()=>{
  const bad=clone(mixed);mutate(bad);assert.throws(()=>createBloodAngelsPaidOptionBindings({book:bad}));
});
const failed=cases.filter(x=>x.status==='FAIL');
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',checks:cases.length,passed:cases.length-failed.length,failed:failed.length,
  sourceReview:'Accepted SM RAW wargear-sm-cd58de47865c4207 + official SM MFM v1.6',
  fixtures:'CONSTRUCTED_PARTIAL_INPUTS_AND_EXPLICIT_SOURCE_INVALID_MUTATIONS;NOT_REAL_NEW_RECRUIT_EXPORTS',
  smDaFixClaimed:false,cases},null,2));
if(failed.length)process.exitCode=1;
