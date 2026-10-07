import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';
import {projectPersonalBook,projectInstanceCards,instanceRoute} from '../../shared/army-book-app-v2/personal.mjs';
import {projectContents} from '../../shared/army-book-app-v2/navigation-v1.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const book=read('./generated/roster-runtime.json'),payload=read('./generated/app-presentation.json');
const cards=new Map(payload.cards.map(card=>[card.id,card])),records=new Map(book.entities.map(record=>[record.id,record]));
const before=JSON.stringify([book,payload]);
const service=createAdMechRosterRuntime(book,read('./roster-import-aliases.json'));
const halo='detachment-haloscreed-battle-clade',forge='detachment-lords-of-the-forge';
const assigned=[halo+':enhancement:2',forge+':enhancement:2'];
const text=`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade, Lords of the Forge
+ WARLORD: Char1: Tech-priest Dominus
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
Char2: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: TL-4Ø9
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`;
assert.equal(service.import(text).status,'READY');
assert.equal(service.state.units.length,5);
const owner='parsed-unit-1',duplicate='parsed-unit-2',mixed='parsed-unit-3';
let scopes=0,physical=0,related=0;
function inspect(){
  const state=service.state,view=projectPersonalBook(payload,state),contents=projectContents(payload,state,view);
  const selected=new Set(state.detachmentIds),enhancements=new Set(state.units.flatMap(unit=>unit.enhancementIds));
  const units=new Set(state.units.map(unit=>unit.canonicalUnitId));
  // Independent canonical containment/assignment defines the book's corpus.
  for(const card of payload.cards){
    if(card.kind==='DETACHMENT')assert.equal(view.allowedIds.has(card.id),selected.has(card.id));
    if(card.kind==='ENHANCEMENT')assert.equal(view.allowedIds.has(card.id),enhancements.has(card.id));
    if(card.kind==='DATASHEET')assert.equal(view.allowedIds.has(card.id),units.has(card.id));
    if(['STRATAGEM','DETACHMENT_RULE'].includes(card.kind))assert.equal(view.allowedIds.has(card.id),selected.has(card.parentId));
    scopes++;
  }
  assert.deepEqual(view.groups.find(group=>group.id==='enhancements').entries.map(entry=>entry.id).sort(),assigned.toSorted());
  const physicalNodes=contents.roots.flatMap(root=>root.attachmentGroup?root.members:root.instanceId?[root]:[]);
  assert.deepEqual(physicalNodes.map(node=>node.instanceId).sort(),state.units.map(unit=>unit.instanceId).sort());
  assert.equal(new Set(physicalNodes.map(node=>node.id)).size,5);
  for(const unit of state.units){
    const effective=service.effective(unit.instanceId),variants=projectInstanceCards(cards,unit,effective);
    assert.deepEqual(service.context(unit.instanceId).battle,{},'Personal guide invented battle state');
    assert.ok(effective.applied.every(change=>!change.ruleId.startsWith('army-rule-doctrina-imperatives:')),
      'Ordinary battle-dependent Imperative executed as a roster effect');
    assert.equal(view.instances.find(entry=>entry.instanceId===unit.instanceId).route,instanceRoute(unit.instanceId));
    assert.equal(variants.get(unit.canonicalUnitId)[0].instanceId,unit.instanceId);
    for(const profile of effective.profiles){
      const projected=variants.get(profile.id).find(card=>card.scopeId===profile.scopeId);
      assert.equal(projected.instanceId,unit.instanceId);
      assert.equal(projected.rosterQuantity,profile.quantity);
      assert.deepEqual(projected.rosterAbilities,profile.abilities.filter(ability=>ability.canonicalId||ability.value!==undefined));
    }
    for(const weapon of effective.weapons){
      const projected=variants.get(weapon.id).find(card=>card.scopeId===(weapon.scopeId||null));
      assert.equal(projected.instanceId,unit.instanceId);
      for(const field of weapon.fields.filter(field=>['skill','range','ap','attacks','strength'].includes(field.label)))
        assert.equal(projected.fields.find(item=>item.source.path==='/'+field.label)?.value,field.value);
    }
    for(const change of effective.applied){
      const contract=records.get(change.ruleId).ruleContract;
      assert.equal(contract.clauses.find(clause=>clause.id===change.clauseId).rosterClassification,'ROSTER_EXECUTABLE');
      assert.equal(change.targetInstanceId,unit.instanceId);
      assert.ok(!contract.detachmentId||selected.has(contract.detachmentId));
    }
    for(const row of service.related(unit.instanceId)){
      assert.ok(selected.has(row.detachmentId));assert.equal(row.instanceId,unit.instanceId);
      assert.notEqual(row.state,'INVALID');assert.ok(['TRUE','FALSE','UNKNOWN'].includes(row.state));related++;
    }
    physical++;
  }
  return state;
}
inspect();service.attach(owner,mixed);const attached=inspect(),effectiveAttached=service.effective(mixed);
assert.ok(effectiveAttached.formedUnit.memberInstanceIds.includes(owner));
const value=(weapon,key)=>weapon.fields.find(field=>field.label===key)?.value;
for(const id of [owner,mixed])for(const weapon of service.effective(id).weapons){
  const base=records.get(weapon.id).data;
  if(base.skill!=='N/A')assert.equal(value(weapon,'skill'),`${Number(base.skill.replace('+',''))-1}+`);
  if(base.mode==='ranged')for(const ability of ['HEAVY','ASSAULT'])assert.ok(value(weapon,'abilities').includes(ability));
  assert.equal(value(weapon,'ap'),base.ap,'Battle-only Imperative AP became permanent');
}
for(const weapon of service.effective(duplicate).weapons){
  const base=records.get(weapon.id).data;if(base)assert.equal(value(weapon,'skill'),base.skill,'Duplicate inherited another owner\'s Imperatives');
}
assert.ok(service.effective(duplicate).weapons.some(weapon=>records.get(weapon.id).parentId===assigned[1]));
assert.ok(!service.effective(owner).weapons.some(weapon=>records.get(weapon.id).parentId===assigned[1]));
assert.equal(new Set(effectiveAttached.profiles.map(profile=>profile.id)).size,2);
service.detach(owner);inspect();assert.equal(service.effective(mixed).formedUnit,null);
service.attach(owner,mixed);inspect();assert.deepEqual(service.effective(mixed),effectiveAttached);
const reversed=structuredClone(attached);reversed.detachmentIds.reverse();reversed.detachments.reverse();reversed.units.reverse();
service.load(reversed);inspect();assert.deepEqual(service.effective(mixed),effectiveAttached);
assert.equal(JSON.stringify([book,payload]),before,'Canonical inputs mutated');
console.log(JSON.stringify({status:'PASS',scopeChecks:scopes,physicalChecks:physical,relatedChecks:related,
  selectedDetachmentsOnly:true,assignedEnhancementsOnly:true,selectedStratagemsOnly:true,physicalOwnerIsolation:true,
  mixedProfiles:true,formedContext:true,deterministic:true,battleEffectLeakage:0,legacyRuntimeReads:0}));
