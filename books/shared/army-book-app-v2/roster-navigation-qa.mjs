import assert from 'node:assert/strict';
import fs from 'node:fs';
import {rosterUnitNames,coreStratagemCards} from './roster-labels.mjs';
import {projectContents} from './navigation-v1.mjs';
import {projectPersonalBook} from './personal.mjs';

const state={units:[
  {instanceId:'ten',canonicalUnitId:'troops',startingStrength:10,modelRows:[{canonicalProfileId:'sergeant',quantity:1},{canonicalProfileId:'trooper',quantity:9}]},
  {instanceId:'five',canonicalUnitId:'troops',startingStrength:5,modelRows:[{canonicalProfileId:'sergeant',quantity:1},{canonicalProfileId:'trooper',quantity:4}]},
  {instanceId:'other-ten',canonicalUnitId:'troops',startingStrength:10,modelRows:[{canonicalProfileId:'trooper',quantity:9},{canonicalProfileId:'sergeant',quantity:1}]},
  {instanceId:'leader',canonicalUnitId:'leader',startingStrength:1,modelRows:[]}
]};
const original=structuredClone(state),names=rosterUnitNames(state,id=>id==='troops'?'Troops':'Leader');
assert.equal(names.get('ten'),'Troops (10 models) #1');
assert.equal(names.get('five'),'Troops (5 models)');
assert.equal(names.get('other-ten'),'Troops (10 models) #2');
assert.equal(names.get('leader'),'Leader');
assert.deepEqual(state,original,'Display names never edit roster state');
const mixed=rosterUnitNames({units:[
  {instanceId:'a',canonicalUnitId:'squad',startingStrength:5,modelRows:[{canonicalProfileId:'marine',quantity:4},{canonicalProfileId:'sergeant',quantity:1}]},
  {instanceId:'b',canonicalUnitId:'squad',startingStrength:5,modelRows:[{canonicalProfileId:'marine',quantity:4},{canonicalProfileId:'specialist',quantity:1}]}
]},id=>({squad:'Squad',marine:'Marine',sergeant:'Sergeant',specialist:'Specialist'})[id]);
assert.equal(mixed.get('a'),'Squad (4 Marine, 1 Sergeant)');
assert.equal(mixed.get('b'),'Squad (4 Marine, 1 Specialist)');
assert([...mixed.values()].every(name=>!name.includes('#')),'Different model composition never receives a copy number');
let checked=0;
for(const book of ['space-marines','blood-angels','dark-angels','adeptus-mechanicus','chaos-space-marines','death-guard','tau-empire','tyranids','emperors-children']){
  const payload=JSON.parse(fs.readFileSync(new URL(`../../${book}/v2/generated/app-presentation.json`,import.meta.url))),cards=new Map(payload.cards.map(card=>[card.id,card]));
  const units=payload.cards.filter(card=>card.kind==='DATASHEET').slice(0,3),detachments=payload.cards.filter(card=>card.kind==='DETACHMENT');
  const roster={units:units.map((unit,index)=>({instanceId:'instance-'+index,canonicalUnitId:unit.id,startingStrength:1,modelRows:[],enhancementIds:[],selections:[]})),
    detachmentIds:[detachments[0].id],attachments:[{leaderInstanceId:'instance-0',bodyguardInstanceId:'instance-2',role:'SUPPORT'},
      {leaderInstanceId:'instance-1',bodyguardInstanceId:'instance-2',role:'LEADER'}],warlordInstanceId:'instance-1'};
  const before=structuredClone(roster),personal=projectPersonalBook(payload,roster),model=projectContents(payload,roster,personal);
  assert.deepEqual(model.roots.map(root=>root.label),['Army Rule','Detachments','Stratagems','Units']);
  const group=model.roots[3].children.find(entry=>entry.attachmentGroup);
  assert.deepEqual(group.members.map(member=>member.instanceId),['instance-2','instance-1','instance-0']);
  assert.deepEqual(group.members.map(member=>member.attachmentRole),['bodyguard','leader','support']);
  assert.equal(group.members[1].warlord,true);
  const strata=model.roots[2].children;
  assert.deepEqual(strata.filter(entry=>entry.label!=='Core Stratagems').map(entry=>entry.label),[detachments[0].title]);
  const independent=payload.cards.filter(card=>card.domain==='CORE'&&card.fields.some(field=>field.source?.path==='/semanticContent'&&/\nCore Stratagem\n/.test(field.value)));
  assert.equal(independent.length,10,'Accepted Core source has ten explicitly labelled Stratagems');
  assert.deepEqual(coreStratagemCards(cards).map(card=>card.id),independent.map(card=>card.id));
  assert.deepEqual(strata.at(-1).children.map(entry=>entry.canonicalId),independent.map(card=>card.id));
  for(const entry of strata[0].children)assert.equal(cards.get(entry.canonicalId).parentId,detachments[0].id);
  assert.deepEqual(roster,before,'Contents/reference projection cannot change gameplay');checked++;
}
console.log(`Roster navigation: PASS (${checked} books; exact composition, attachment order, scope and Core reference checks).`);
