/** Bounded executable controls; constructed supported New Recruit TEXT only. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildTyranidsContracts} from './rule-contract-build.mjs';
import {createTyranidsRosterImport} from './roster-import.mjs';
import {resolveImportedPoints} from './roster-points.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
const clone=structuredClone;
const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
const {book,schema,contracts,deferred}=buildTyranidsContracts();
const records=new Map(facts.entities.map(e=>[e.id,e]));
const expected=[
 ['datasheet-broodlord:section:1','SOURCE_UNIT','UNIT',[['GRANT_WEAPON_ABILITY',null,null,null,'DEVASTATING WOUNDS']]],
 ['datasheet-winged-tyranid-prime:section:1','SOURCE_UNIT','UNIT',[['GRANT_WEAPON_ABILITY',null,null,null,'SUSTAINED HITS 1']]],
 ['datasheet-tyranid-prime-with-lash-whip:section:1','SOURCE_UNIT','UNIT',[['GRANT_WEAPON_ABILITY',null,null,null,'SUSTAINED HITS 1']]],
 ['datasheet-hyperadapted-raveners:section:1','SOURCE_UNIT','UNIT',[['GRANT_WEAPON_ABILITY',null,null,null,'SUSTAINED HITS 1']]],
 ['detachment-subterranean-assault:enhancement:4','SOURCE_MODEL','MODEL',[['GRANT_MODEL_KEYWORD',null,null,null,null,'SYNAPSE'],['MODIFY_STAT','strength','ADD',1,null,null,'melee'],['MODIFY_STAT','WS','ADD',-1,null,null,'melee']]],
 ['detachment-invasion-fleet:enhancement:4','SOURCE_MODEL','MODEL',[['GRANT_MODEL_ABILITY',null,null,null,{name:'Feel No Pain',value:5}]]],
 ['detachment-assimilation-swarm:enhancement:4','SOURCE_UNIT','UNIT',[['MODIFY_STAT','strength','ADD',1,null,null,'melee']]],
 ['detachment-crusher-stampede:enhancement:1','SOURCE_MODEL','MODEL',[['MODIFY_STAT','OC','ADD',3]]],
 ['detachment-unending-swarm:enhancement:1','SOURCE_UNIT_MODELS','MODEL',[['MODIFY_STAT','M','ADD',2]]],
 ['detachment-ambush-predators:enhancement:2','SOURCE_UNIT','UNIT',[['MODIFY_RULE_METRIC','detectionRange','ADD',-3]]],
 ['detachment-talons-of-the-norn-queen:enhancement:1','SOURCE_UNIT','UNIT',[['GRANT_WEAPON_ABILITY',null,null,null,'ANTI-CHARACTER 2+',null,'ranged']]],
 ['detachment-talons-of-the-norn-queen:enhancement:2','SOURCE_UNIT_MODELS','MODEL',[['MODIFY_STAT','INSV','SET',4]]]
];
let checks=0,negative=0,mutations=0;
const check=fn=>{fn();checks++;};
const signature=e=>[e.operation,e.field??null,e.mode??null,e.value??null,e.ability??null,e.keyword??null,e.weaponMode??null];
function inventory(b){
 const actual=b.entities.filter(e=>e.ruleContract);assert.deepEqual(actual.map(e=>e.id).sort(),expected.map(e=>e[0]).sort());
 for(const [id,binding,subject,operations]of expected){const entity=actual.find(e=>e.id===id),effects=entity.ruleContract.clauses[0].rosterEffects;
  assert.deepEqual(effects.filter(e=>!e.id.endsWith('/formed')).map(signature),operations.map(row=>Array.from({length:7},(_,i)=>row[i]??null)),id);
  assert.ok(effects.every(e=>e.targetSubject===subject));assert.ok(effects.filter(e=>!e.id.endsWith('/formed')).every(e=>e.targetBinding===binding));
  if(['datasheet-broodlord:section:1','datasheet-winged-tyranid-prime:section:1'].includes(id))assert.ok(effects.every(e=>e.conditions.some(c=>c.binding==='SOURCE'&&c.predicate.predicate==='LEADING'&&c.predicate.arguments.value===true)),'Missing while-leading condition');
  assert.equal(entity.ruleContract.ownerId,records.get(id).parentId);assert.ok(entity.ruleContract.sourceId);
  for(const effect of effects){assert.equal(effect.provenance.canonicalRuleId,id);assert.equal(effect.provenance.canonicalOwnerId,records.get(id).parentId);assert.ok(effect.evidence.quote);}
  for(const clause of entity.ruleContract.clauses.filter(c=>c.rosterClassification==='BATTLE_ONLY'))assert.deepEqual(clause.rosterEffects,[]);
 }
}
const members=id=>facts.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===id);
function block(id,{enhancement,gear=true}={}){
 if(id==='unit-hyperadapted-raveners'&&gear)return '5x Hyperadapted Raveners (165 pts)\n• 1x Ravener Prime: Prime claws and talons\n• 3x Raveners: Ravener heavy claws and talons\n• 1x Raveners: Venom bolt, Ravener heavy claws and talons\n';
 const explicitGear={
  'unit-trygon':'Bio-electric pulse, Trygon scything talons',
  'unit-norn-emissary':'Psychic Tendril, Monstrous scything talons, Monstrous rending claws',
  // The source permits replacing the bonesword/lash whip with one heavy venom
  // cannon; the model retains its default monstrous scything talons.
  'unit-hive-tyrant':'Heavy venom cannon, Monstrous scything talons'
 };
 if(gear&&explicitGear[id])return `1x ${records.get(id).data.title} (100 pts)\n• 1x ${members(id)[0].data.name}: ${explicitGear[id]}\n`+
  (enhancement?'Enhancement: '+records.get(enhancement).data.title+'\n':'');
 const rows=members(id),count=rows.reduce((n,m)=>n+m.data.quantity.min,0);
 return `${count}x ${records.get(id).data.title} (100 pts)\n`+rows.map(m=>{
  const binding=book.importBindings.compositions.find(c=>c.id===m.id||c.memberId===m.id);
  const weapon=gear?records.get(binding?.allowedProfileIds?.[0]):null;
  return `• ${m.data.quantity.min}x ${m.data.name}${weapon?': '+weapon.data.name:''}\n`;
 }).join('')+(enhancement?'Enhancement: '+records.get(enhancement).data.title+'\n':'');
}
function importState(ids,{detachment='Invasion Fleet',enhancement,index=0,gear=true}={}){
 const text=`+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: ${detachment}\n`+ids.map((id,i)=>block(id,{enhancement:i===index?enhancement:undefined,gear})).join('');
 const imported=createTyranidsRosterImport(book).import(text);
 assert.equal(imported.status,'READY',JSON.stringify({text,errors:imported.errors,needs:imported.needsBindings}));return imported.roster;
}
function runtime(state,b=book){const r=createRosterRuntime(b,schema);r.load(state);return r;}
const unit=(result,n)=>result.units.find(u=>u.instanceId===`parsed-unit-${n}`);
const weapons=u=>[...u.weapons,...u.profiles.flatMap(p=>p.weapons)];
const hasAbility=(w,name)=>w.data.abilities.some(a=>a.toUpperCase()===name.toUpperCase());
const noRule=(id)=>{const b=clone(book);delete b.entities.find(e=>e.id===id).ruleContract;return b;};
const stats=p=>({...p.profile,...p.profile.stats});
const add=(before,value)=>String(Number.parseFloat(before)+value)+(String(before).endsWith('"')?'"':String(before).endsWith('+')?'+':'');
check(()=>{inventory(book);assert.equal(contracts.length,12);assert.equal(book.rosterAttachmentPolicies.length,15);assert.equal(book.mfmImportReferences.sourceVersion,'v1.6');});

// Leading-only effects: exact formed members, physical duplicates, detach and removal.
for(const [leader,bodyguard,rule,ability]of [
 ['unit-broodlord','unit-genestealers','datasheet-broodlord:section:1','DEVASTATING WOUNDS'],
 ['unit-winged-tyranid-prime','unit-gargoyles','datasheet-winged-tyranid-prime:section:1','SUSTAINED HITS 1']])check(()=>{
 const state=importState([leader,bodyguard,leader,bodyguard]),r=runtime(state),baseline=r.projection;
 assert.ok(baseline.units.every(u=>!u.applied.some(a=>a.ruleId===rule)));
 r.attach('parsed-unit-1','parsed-unit-2');const attached=r.projection;
 for(const n of [1,2]){assert.ok(weapons(unit(attached,n)).length);assert.ok(weapons(unit(attached,n)).every(w=>hasAbility(w,ability)),`${rule}/${n}`);}
 for(const n of [3,4])assert.deepEqual(unit(attached,n),unit(baseline,n));
 assert.ok(unit(attached,1).applied.concat(unit(attached,2).applied).some(a=>a.ruleId===rule));
 assert.deepEqual(runtime(r.snapshot()).projection,attached);r.detach('parsed-unit-1');assert.deepEqual(r.projection,baseline);
 r.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(r.projection,attached);
 r.reattach('parsed-unit-1','parsed-unit-4');const switched=r.projection;
 assert.deepEqual(unit(switched,2),unit(baseline,2),'Previously attached Bodyguard must lose the Leader effect');
 assert.ok(weapons(unit(switched,4)).every(w=>hasAbility(w,ability)));
 assert.deepEqual(runtime(r.snapshot()).projection,switched);r.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(r.projection,attached);
 assert.throws(()=>r.attach('parsed-unit-3','parsed-unit-1'));negative++;
});

// Always-active source UNIT abilities work standalone and include a confirmed attachment.
for(const [leader,bodyguard,rule]of [
 ['unit-tyranid-prime-with-lash-whip','unit-tyranid-warriors-with-melee-bio-weapons','datasheet-tyranid-prime-with-lash-whip:section:1'],
 ['unit-hyperadapted-raveners','unit-raveners','datasheet-hyperadapted-raveners:section:1']])check(()=>{
 const state=importState([leader,bodyguard,leader,bodyguard]),base=runtime(state,noRule(rule)).projection,r=runtime(state);
 assert.ok(weapons(unit(r.projection,1)).every(w=>hasAbility(w,'SUSTAINED HITS 1')));
 assert.deepEqual(unit(r.projection,2),unit(base,2));r.attach('parsed-unit-1','parsed-unit-2');const attached=r.projection;
 assert.ok(weapons(unit(attached,2)).every(w=>hasAbility(w,'SUSTAINED HITS 1')));
 assert.deepEqual(unit(attached,4),unit(base,4));const standalone=runtime(state).projection;
 r.detach('parsed-unit-1');assert.deepEqual(r.projection,standalone);r.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(r.projection,attached);
 assert.deepEqual(runtime(r.snapshot()).projection,attached);
 if(leader==='unit-hyperadapted-raveners'){
  const u=state.units[0],shadow='datasheet-hyperadapted-raveners:rule-reference:3';
  assert.ok(u.modelRows.find(row=>row.canonicalProfileId.endsWith(':1')).sourceRuleReferenceIds.includes(shadow));
  assert.ok(u.modelRows.filter(row=>row.canonicalProfileId.endsWith(':2')).every(row=>!row.sourceRuleReferenceIds.includes(shadow)));
  assert.deepEqual(unit(attached,1).profiles.map(p=>stats(p).W),['6','3','3']);
  assert.ok(unit(attached,1).profiles.filter(p=>p.canonicalProfileId.endsWith(':2')).every(p=>!p.keywords.includes('CHARACTER')&&!p.keywords.includes('SYNAPSE')));
  assert.ok(unit(attached,1).profiles.every(p=>!p.abilities.some(a=>/Shadow in the Warp/.test(a.name))));
 }
});

const enhancementCases=[
 ['detachment-subterranean-assault:enhancement:4','unit-trygon',null],
 ['detachment-invasion-fleet:enhancement:4','unit-hive-tyrant','unit-tyrant-guard'],
 ['detachment-assimilation-swarm:enhancement:4','unit-broodlord','unit-genestealers'],
 ['detachment-assimilation-swarm:enhancement:4','unit-hive-tyrant','unit-tyrant-guard'],
 ['detachment-crusher-stampede:enhancement:1','unit-hive-tyrant','unit-tyrant-guard'],
 ['detachment-unending-swarm:enhancement:1','unit-broodlord','unit-genestealers'],
 ['detachment-ambush-predators:enhancement:2','unit-von-ryans-leapers',null],
 ['detachment-talons-of-the-norn-queen:enhancement:1','unit-norn-emissary',null],
 ['detachment-talons-of-the-norn-queen:enhancement:2','unit-norn-assimilator',null]
];
for(const [id,owner,bodyguard]of enhancementCases)check(()=>{
 const detachment=records.get(records.get(id).parentId).data.title,ids=bodyguard?[owner,bodyguard,owner,bodyguard]:[owner,owner];
 const state=importState(ids,{enhancement:id,detachment}),baseState=clone(state);baseState.units[0].enhancementIds=[];baseState.units[0].enhancementAssignments=[];
 const baseline=runtime(baseState).projection,r=runtime(state),activated=r.projection;
 assert.ok(unit(activated,1).applied.some(a=>a.ruleId===id));
 const duplicate=bodyguard?3:2;assert.deepEqual(unit(activated,duplicate),unit(baseline,duplicate));
 const compare=(result,base,n)=>{
  const actual=unit(result,n),before=unit(base,n);
  if(id.includes('subterranean')){
   assert.deepEqual(weapons(actual).map(w=>w.canonicalProfileId),['datasheet-trygon:weapon:1','datasheet-trygon:weapon:2']);
   assert.ok(weapons(actual).some(w=>w.data.mode==='melee'),'Trygon requires a non-vacuous melee delta');
   assert.ok(weapons(actual).some(w=>w.data.mode==='ranged'),'Trygon requires an unchanged ranged control');
   assert.ok(actual.profiles[0].keywords.includes('SYNAPSE'));assert.equal(before.profiles[0].keywords.includes('SYNAPSE'),false);
   weapons(actual).forEach((w,i)=>{const old=weapons(before)[i];if(w.data.mode==='melee'){assert.equal(w.data.strength,add(old.data.strength,1));assert.equal(w.data.skill,add(old.data.skill,-1));}else assert.deepEqual(w,old);});
  }else if(id.includes('invasion')){assert.deepEqual(actual.profiles[0].abilities.filter(a=>a.name==='Feel No Pain'),[{name:'Feel No Pain',value:5}]);assert.deepEqual(actual.profiles.map(p=>p.profile),before.profiles.map(p=>p.profile));}
  else if(id.includes('assimilation')){assert.ok(weapons(actual).some(w=>w.data.mode==='melee'));if(owner==='unit-hive-tyrant'&&n===1)assert.ok(weapons(actual).some(w=>w.data.mode==='ranged'));
   weapons(actual).forEach((w,i)=>{const old=weapons(before)[i];assert.equal(w.data.strength,w.data.mode==='melee'?add(old.data.strength,1):old.data.strength);assert.equal(w.data.attacks,old.data.attacks);if(w.data.mode==='ranged')assert.deepEqual(w,old);});}
  else if(id.includes('crusher'))assert.equal(stats(actual.profiles[0]).OC,add(stats(before.profiles[0]).OC,3));
  else if(id.includes('unending'))actual.profiles.forEach((p,i)=>assert.equal(stats(p).M,add(stats(before.profiles[i]).M,2)));
  else if(id.includes('ambush'))assert.deepEqual(actual.metrics.detectionRange,{modifier:-3});
  else if(id.endsWith(':1')){assert.ok(weapons(actual).some(w=>w.data.mode==='melee'));assert.ok(weapons(actual).some(w=>w.data.mode==='ranged'));
   assert.deepEqual(weapons(actual).map(w=>w.canonicalProfileId),[1,2,3,4,5].map(n=>'datasheet-norn-emissary:weapon:'+n));
   weapons(actual).forEach((w,i)=>{assert.deepEqual(w.data.abilities,w.data.mode==='ranged'?[...new Set([...weapons(before)[i].data.abilities,'ANTI-CHARACTER 2+'])]:weapons(before)[i].data.abilities);if(w.data.mode==='melee')assert.deepEqual(w,weapons(before)[i]);});}
  else {actual.profiles.forEach(p=>assert.equal(stats(p).INSV,'4+'));assert.deepEqual(actual.profiles.map(p=>stats(p).SV),before.profiles.map(p=>stats(p).SV));}
 };
 compare(activated,baseline,1);assert.deepEqual(runtime(r.snapshot()).projection,activated);
 const pointsBefore=resolveImportedPoints(book,r.snapshot());r.load(r.snapshot());assert.deepEqual(resolveImportedPoints(book,r.snapshot()),pointsBefore);assert.deepEqual(r.projection,activated);
 if(bodyguard){r.attach('parsed-unit-1','parsed-unit-2');const attached=r.projection,bare=runtime(baseState);bare.attach('parsed-unit-1','parsed-unit-2');
  compare(attached,bare.projection,1);
  if(id.includes('assimilation')||id.includes('unending'))compare(attached,bare.projection,2);else assert.deepEqual(unit(attached,2).profiles,unit(bare.projection,2).profiles);
  assert.deepEqual(unit(attached,3),unit(activated,3));assert.deepEqual(unit(attached,4),unit(activated,4));
  r.detach('parsed-unit-1');assert.deepEqual(r.projection,activated);r.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(r.projection,attached);
  if(id.includes('assimilation')||id.includes('unending')){
   r.reattach('parsed-unit-1','parsed-unit-4');const switched=r.projection,bareSwitched=runtime(baseState);bareSwitched.attach('parsed-unit-1','parsed-unit-4');
   assert.deepEqual(unit(switched,2),unit(activated,2),'Old Bodyguard must lose the formed modifier');compare(switched,bareSwitched.projection,4);
   r.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(r.projection,attached);
  }
 }
 r.load(baseState);assert.deepEqual(r.projection,baseline);r.load(state);assert.deepEqual(r.projection,activated);
 const wrong=clone(state);wrong.units[0].enhancementIds=[];wrong.units[0].enhancementAssignments=[];
 assert.ok(!unit(runtime(wrong).projection,1).applied.some(a=>a.ruleId===id));negative++;
});

// Priority relationships alone do not manufacture bonuses or move native FNP.
for(const [leader,bodyguard]of [['unit-old-one-eye','unit-carnifexes'],['unit-neurotyrant','unit-zoanthropes'],['unit-neurotyrant','unit-neurogaunts'],['unit-hive-tyrant','unit-tyrant-guard']])check(()=>{
 const state=importState([leader,bodyguard,leader,bodyguard]),r=runtime(state),base=r.projection;
 r.attach('parsed-unit-1','parsed-unit-2');const attached=r.projection;
 for(const n of [1,2]){assert.deepEqual(unit(attached,n).profiles,unit(base,n).profiles);assert.deepEqual(weapons(unit(attached,n)),weapons(unit(base,n)));assert.deepEqual(unit(attached,n).applied,[]);}
 if(leader==='unit-old-one-eye'){assert.deepEqual(unit(attached,1).profiles[0].abilities,[{name:'Feel No Pain',value:5}]);assert.ok(unit(attached,2).profiles.every(p=>!p.abilities.some(a=>a.name==='Feel No Pain')));}
 r.detach('parsed-unit-1');assert.deepEqual(r.projection,base);r.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(r.projection,attached);
});
check(()=>{
 const state=importState(['unit-old-one-eye','unit-old-one-eye','unit-psychophage','unit-psychophage']),r=runtime(state);
 assert.ok(r.projection.units.every(u=>u.profiles.every(p=>p.abilities.filter(a=>a.name==='Feel No Pain').length===1&&p.abilities.find(a=>a.name==='Feel No Pain').value===5)));
 assert.deepEqual(runtime(r.snapshot()).projection,r.projection);
 const encircling=deferred.find(d=>d.id==='detachment-ambush-predators:enhancement:1');assert.equal(encircling.executable,false);assert.equal(encircling.scope,'UNIT');assert.equal(encircling.itemKind,'UPGRADE');assert.match(encircling.sourceText,/8/);
 for(const d of deferred){assert.equal(d.executable,false);assert.ok(d.sourceText&&d.provenance.sourceId);}
 for(const d of deferred.filter(d=>d.id.startsWith('army-rule-'))){
  assert.deepEqual(d.sourceComponents.map(c=>c.sourceReference.entityId),records.get(d.id).data.componentIds);
  for(const c of d.sourceComponents)assert.equal(c.sourceText,records.get(c.sourceReference.entityId).data.text);
 }
 const adaptive=contracts.find(c=>c.ruleId==='detachment-invasion-fleet:enhancement:4');assert.match(adaptive.clauses.find(c=>c.rosterClassification==='BATTLE_ONLY').sourceText,/Feel No Pain 4\+/);
 const injected=importState(['unit-hive-tyrant'],{enhancement:'detachment-invasion-fleet:enhancement:4'});
 injected.battle={wounded:true,battleConditionSatisfied:true};injected.units[0].battle={wounded:true,battleConditionSatisfied:true};
 const out=runtime(injected).projection;assert.ok(out.units.every(u=>u.profiles.every(p=>p.abilities.find(a=>a.name==='Feel No Pain')?.value===5)));
 assert.ok(out.units[0].conditional.some(c=>c.ruleId==='detachment-invasion-fleet:enhancement:4'&&c.state==='UNKNOWN'));negative++;
 const encircled=importState(['unit-von-ryans-leapers'],{detachment:'Ambush Predators',enhancement:encircling.id});
 assert.deepEqual(unit(runtime(encircled).projection,1).applied,[],'Battle-dependent UNIT Upgrade must not perform a move');negative++;
});

// Independent comparator controls, not exceptions manufactured by the mutation.
for(const mutate of [
 b=>b.entities.find(e=>e.id==='detachment-crusher-stampede:enhancement:1').ruleContract.clauses[0].rosterEffects[0].value=4,
 b=>b.entities.find(e=>e.id==='detachment-invasion-fleet:enhancement:4').ruleContract.clauses[0].rosterEffects[0].targetBinding='SOURCE_FORMED_MODELS',
 b=>b.entities.find(e=>e.id==='datasheet-broodlord:section:1').ruleContract.ownerId='unit-genestealers',
 b=>b.entities.find(e=>e.id==='datasheet-hyperadapted-raveners:section:1').ruleContract.clauses[0].rosterEffects.push(clone(b.entities.find(e=>e.id==='datasheet-hyperadapted-raveners:section:1').ruleContract.clauses[0].rosterEffects[0]))
]){const bad=clone(book);mutate(bad);assert.throws(()=>inventory(bad));mutations++;}
check(()=>{
 const state=importState(['unit-broodlord','unit-genestealers']),bad=clone(book);
 bad.entities.find(e=>e.id==='datasheet-broodlord:section:1').ruleContract.clauses[0].rosterEffects[0].conditions=[];
 assert.throws(()=>inventory(bad));mutations++;
 const broken=clone(facts);broken.entities.find(e=>e.id==='datasheet-hyperadapted-raveners:profile:1').parentId='unit-raveners';
 assert.throws(()=>buildTyranidsContracts({facts:broken}));mutations++;
 const wrong=createTyranidsRosterImport(book).import('+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: Talons of the Norn-Queen\n'+block('unit-norn-emissary',{enhancement:'detachment-talons-of-the-norn-queen:enhancement:2'}));
 assert.notEqual(wrong.status,'READY');negative++;
 const wrongModel=createTyranidsRosterImport(book).import('+ FACTION KEYWORD: Tyranids\n+ DETACHMENT: Subterranean Assault\n'+block('unit-broodlord',{enhancement:'detachment-subterranean-assault:enhancement:4'}));
 assert.notEqual(wrongModel.status,'READY');negative++;
 const forged=importState(['unit-broodlord'],{detachment:'Subterranean Assault'}),enhancement='detachment-subterranean-assault:enhancement:4';
 forged.units[0].enhancementIds=[enhancement];forged.units[0].enhancementAssignments=[{enhancementId:enhancement,modelScopeId:unit(runtime(forged).projection,1).profiles[0].scopeId}];
 assert.ok(!unit(runtime(forged).projection,1).applied.some(a=>a.ruleId===enhancement),'Wrong MODEL owner must not acquire Trygon effects');negative++;
});
for(const fact of facts.entities){const derived=book.entities.find(e=>e.id===fact.id);
 assert.deepEqual(derived.data,fact.data,'Contract lowering changed factual content');
 assert.deepEqual(derived.provenance,fact.provenance);assert.equal(derived.parentId,fact.parentId);
}
console.log(JSON.stringify({status:'PASS',executableContracts:12,unitUpgrades:4,leaderRelations:15,checks,negative,mutations,
 REAL_NEW_RECRUIT_EXPORT_TESTED:'NO',browserTested:false,sharedChanges:false,battleSimulation:false}));
