import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createCatalogGameUnit} from '../../../tests/helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value);
const plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,window:{},globalThis:null,addEventListener(){}};scope.globalThis=scope;scope.window=scope;vm.createContext(scope);
for(const file of ['books/chaos-space-marines/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/chaos-space-marines/scripts/roster-filter.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=scope.WH_BOOK_ROSTER_CATALOG;
const contract=(catalog,id)=>catalog.effectContracts.find(item=>item.canonicalRecordId===id);
const condition={selector:{on:'source',sourceUnitIds:['unit-master-of-possession'],requiresLeading:true}};

const attach=(leader,bodyguard)=>{
  const fact={certainty:'current',provenance:{kind:'explicit-roster-attachment'}};
  leader.attachments.leading.push({...fact,instanceId:bodyguard.identity.instanceId});
  bodyguard.attachments.leaders.push({...fact,instanceId:leader.identity.instanceId});
};
const resolvedEnhancement=(catalog,ownerId)=>({input:{ownerStatus:'resolved',ownerUnitId:ownerId},catalog:catalog.enhancements.find(item=>item.id==='enhancement-empyric-symbiote')});
const effects=(catalog,units,{enhancementOwnerId=null,detachment=true}={})=>{
  scope.WH_BOOK_ROSTER_CATALOG=catalog;
  const byInstance=new Map(units.map(unit=>[unit.identity.instanceId,unit])),enhancements=enhancementOwnerId?[resolvedEnhancement(catalog,enhancementOwnerId)]:[],detachments=detachment?[{id:'renegade-warband'}]:[];
  return units.flatMap(gameUnit=>scope.CSM_ROSTER_SEMANTICS.gameEffects({gameUnit,gameUnits:units,byInstance,enhancements,detachments})||[]);
};
const modifier=(list,instanceId,targetId)=>{const rows=list.filter(item=>item.targetInstanceId===instanceId&&item.component==='stat'&&item.operation==='add'&&item.modifierOnly===true&&item.targetId===targetId);return{delta:rows.reduce((sum,item)=>sum+Number(item.delta||0),0),ids:rows.map(item=>item.id).sort()};};
const unit=(catalog,id,instance,enhancements=[])=>createCatalogGameUnit({catalog,datasheetId:id,instanceId:instance,enhancementIds:enhancements});

const corpus=JSON.parse(read('books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json'));
const masterSource=corpus.datasheets.find(item=>item.sourceId==='datasheet-master-of-possession'),masterSection=masterSource.sections.find(item=>item.sourceId==='datasheet-master-of-possession:section:1');
assert.ok(masterSection.blocks.some(item=>item.text==='Daemonkin (Psychic): While this model is leading a unit, add 1 to Advance and Charge rolls made for that unit.'),'accepted Daemonkin source wording');
const symbioteSource=corpus.detachments.find(item=>item.sourceId==='detachment-renegade-warband').enhancements.find(item=>item.sourceId==='detachment-renegade-warband:enhancement:4');
assert.equal(symbioteSource.text,'HERETIC ASTARTES model only. Add 1 to Advance and Charge rolls made for the bearer’s unit.','accepted Empyric Symbiote source wording');

const certify=catalog=>{
  const daemonkin=contract(catalog,'chaos-space-marines-ability-daemonkin-psychic'),symbiote=contract(catalog,'enhancement-empyric-symbiote');
  assert.equal(daemonkin.scope,'attached-group','Daemonkin uses formed Attached Unit scope');
  assert.deepEqual(plain(daemonkin.clauses[0].selector),{excludeSourceUnit:true},'Daemonkin canonical reference remains Bodyguard-only');
  assert.deepEqual(plain(daemonkin.clauses[0].conditions),[condition],'Daemonkin reference requires leading');
  assert.deepEqual(plain(daemonkin.clauses[1]),{selector:{},conditions:[condition],operations:[
    {id:'daemonkin-advance',canonicalTarget:'Advance',parameters:{delta:1,modifierOnly:true},type:'CHARACTERISTIC_ADD'},
    {id:'daemonkin-charge',canonicalTarget:'Charge',parameters:{delta:1,modifierOnly:true},type:'CHARACTERISTIC_ADD'},
  ]},'Daemonkin exact Advance and Charge operations');
  assert.equal(daemonkin.stackingPolicy,'apply-once-per-source','Daemonkin applies once per physical source');
  assert.equal(daemonkin.source.sourceId,'chaos-space-marines-waha-11e-current-2026-09-29','Daemonkin current factual owner');
  assert.equal(daemonkin.source.locator,'books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json#datasheet-master-of-possession:section:1','Daemonkin exact source record');
  assert.equal(symbiote.scope,'owner-or-attached-group','Empyric Symbiote uses bearer-unit scope');
  assert.deepEqual(plain(symbiote.clauses[0].operations.slice(1)),[
    {id:'empyric-symbiote-advance',canonicalTarget:'Advance',parameters:{delta:1,modifierOnly:true},type:'CHARACTERISTIC_ADD'},
    {id:'empyric-symbiote-charge',canonicalTarget:'Charge',parameters:{delta:1,modifierOnly:true},type:'CHARACTERISTIC_ADD'},
  ],'Empyric Symbiote exact Advance and Charge operations');
  assert.equal(symbiote.stackingPolicy,'apply-once-per-source','Empyric Symbiote applies once per physical source');
  assert.equal(symbiote.source.sourceId,'chaos-space-marines-faction-pack-v1.2','Empyric Symbiote current factual owner');

  let advance=0,charge=0,detach=0,recompute=0,physical=0,stacking=0,negative=0;
  let master=unit(catalog,'unit-master-of-possession','master'),body=unit(catalog,'unit-possessed','body'),duplicate=unit(catalog,'unit-possessed','body-duplicate');
  let result=effects(catalog,[master,body,duplicate],{detachment:false});
  for(const id of ['master','body'])for(const target of ['Advance','Charge']){assert.equal(modifier(result,id,target).delta,0,`Daemonkin ${target} absent while not leading`);negative++;}
  attach(master,body);result=effects(catalog,[master,body,duplicate],{detachment:false});
  for(const id of ['master','body']){
    assert.deepEqual(modifier(result,id,'Advance'),{delta:1,ids:['daemonkin-advance']},`${id}: Daemonkin +1 Advance`);advance++;
    assert.deepEqual(modifier(result,id,'Charge'),{delta:1,ids:['daemonkin-charge']},`${id}: Daemonkin +1 Charge`);charge++;
  }
  for(const target of ['Advance','Charge']){assert.equal(modifier(result,'body-duplicate',target).delta,0,`Daemonkin ${target} does not leak to duplicate`);physical++;}
  master=unit(catalog,'unit-master-of-possession','master');body=unit(catalog,'unit-possessed','body');result=effects(catalog,[master,body],{detachment:false});
  for(const id of ['master','body'])for(const target of ['Advance','Charge']){assert.equal(modifier(result,id,target).delta,0,`detach removes Daemonkin ${target} from ${id}`);detach++;}
  attach(master,body);result=effects(catalog,[master,body],{detachment:false});
  assert.equal(modifier(result,'body','Advance').delta,1,'reattach recomputes Daemonkin Advance');recompute++;
  assert.equal(modifier(result,'master','Charge').delta,1,'reattach recomputes Daemonkin Charge');recompute++;

  master=unit(catalog,'unit-chaos-lord','symbiote-master',['enhancement-empyric-symbiote']);body=unit(catalog,'unit-legionaries','symbiote-body');duplicate=unit(catalog,'unit-chaos-lord','plain-master');
  result=effects(catalog,[master,body,duplicate],{enhancementOwnerId:'symbiote-master'});
  for(const target of ['Advance','Charge']){assert.equal(modifier(result,'symbiote-master',target).delta,1,`unattached bearer gains +1 ${target}`);target==='Advance'?advance++:charge++;assert.equal(modifier(result,'symbiote-body',target).delta,0,`unattached unit does not gain ${target}`);negative++;assert.equal(modifier(result,'plain-master',target).delta,0,`duplicate physical Character does not gain ${target}`);physical++;}
  attach(master,body);result=effects(catalog,[master,body,duplicate],{enhancementOwnerId:'symbiote-master'});
  for(const id of ['symbiote-master','symbiote-body'])for(const target of ['Advance','Charge']){assert.equal(modifier(result,id,target).delta,1,`formed bearer unit gains +1 ${target}`);target==='Advance'?advance++:charge++;}
  master=unit(catalog,'unit-chaos-lord','symbiote-master',['enhancement-empyric-symbiote']);body=unit(catalog,'unit-legionaries','symbiote-body');result=effects(catalog,[master,body],{enhancementOwnerId:'symbiote-master'});
  for(const target of ['Advance','Charge']){assert.equal(modifier(result,'symbiote-master',target).delta,1,`detach retains bearer ${target}`);detach++;assert.equal(modifier(result,'symbiote-body',target).delta,0,`detach removes propagated ${target}`);detach++;}
  result=effects(catalog,[master,body]);for(const target of ['Advance','Charge']){assert.equal(modifier(result,'symbiote-master',target).delta,0,`Enhancement absent removes ${target}`);negative++;}
  attach(master,body);result=effects(catalog,[master,body],{enhancementOwnerId:'symbiote-master'});assert.equal(modifier(result,'symbiote-body','Advance').delta,1,'reattach recomputes Empyric Advance');recompute++;assert.equal(modifier(result,'symbiote-body','Charge').delta,1,'reattach recomputes Empyric Charge');recompute++;

  master=unit(catalog,'unit-master-of-possession','symbiote-master',['enhancement-empyric-symbiote']);body=unit(catalog,'unit-possessed','symbiote-body');attach(master,body);result=effects(catalog,[master,body],{enhancementOwnerId:'symbiote-master'});
  for(const id of ['symbiote-master','symbiote-body'])for(const target of ['Advance','Charge']){const actual=modifier(result,id,target),expectedIds=[`daemonkin-${target.toLowerCase()}`,`empyric-symbiote-${target.toLowerCase()}`].sort();assert.deepEqual(actual,{delta:2,ids:expectedIds},`${id}: independent sources stack through existing modifier semantics`);stacking++;}
  return{advance,charge,detach,recompute,physical,stacking,negative};
};

const controls=certify(baseline);
assert.deepEqual(controls,{advance:5,charge:5,detach:8,recompute:4,physical:4,stacking:4,negative:8},'focused control inventory');
let mutations=0;
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_DAEMONKIN_ADVANCE',catalog=>{contract(catalog,'chaos-space-marines-ability-daemonkin-psychic').clauses[1].operations.shift();});
killed('MISSING_DAEMONKIN_CHARGE',catalog=>{contract(catalog,'chaos-space-marines-ability-daemonkin-psychic').clauses[1].operations.pop();});
killed('WRONG_DAEMONKIN_SCOPE',catalog=>{contract(catalog,'chaos-space-marines-ability-daemonkin-psychic').scope='attached-group-excluding-source';});
killed('MISSING_LEADING_CONDITION',catalog=>{contract(catalog,'chaos-space-marines-ability-daemonkin-psychic').clauses[1].conditions=[];});
killed('MISSING_SYMBIOTE_ADVANCE',catalog=>{contract(catalog,'enhancement-empyric-symbiote').clauses[0].operations=contract(catalog,'enhancement-empyric-symbiote').clauses[0].operations.filter(item=>item.id!=='empyric-symbiote-advance');});
killed('MISSING_SYMBIOTE_CHARGE',catalog=>{contract(catalog,'enhancement-empyric-symbiote').clauses[0].operations=contract(catalog,'enhancement-empyric-symbiote').clauses[0].operations.filter(item=>item.id!=='empyric-symbiote-charge');});
killed('WRONG_SYMBIOTE_SCOPE',catalog=>{contract(catalog,'enhancement-empyric-symbiote').scope='owner';});
killed('WRONG_SYMBIOTE_DELTA',catalog=>{contract(catalog,'enhancement-empyric-symbiote').clauses[0].operations.find(item=>item.id==='empyric-symbiote-charge').parameters.delta=2;});
assert.equal(mutations,8,'source-backed mutation controls');
console.log(`CSM Advance/Charge effects: source 2/2; executable 2/2; Advance ${controls.advance}/${controls.advance}; Charge ${controls.charge}/${controls.charge}; detach ${controls.detach}/${controls.detach}; recompute ${controls.recompute}/${controls.recompute}; physical ${controls.physical}/${controls.physical}; stacking ${controls.stacking}/${controls.stacking}; negative ${controls.negative}/${controls.negative}; mutations ${mutations}/${mutations} KILLED; PASS`);
