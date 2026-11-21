import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {validateGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
import {createReferenceContract} from '../../shared/army-book-app-v2/reference-contract.mjs';
import {registration} from './registration.mjs';
const read=name=>parseSourceFixtureJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const built=buildCSMContracts(),facts=built.facts,payload=read('./generated/app-presentation.json');
const index=new Map(facts.entities.map(e=>[e.id,e])),cards=new Map(payload.cards.map(c=>[c.id,c]));
assert.equal(cards.size,payload.cards.length);
const expected={DATASHEET:54,MODEL_PROFILE:60,WEAPON_PROFILE:315,DATASHEET_ABILITY:89,ARMY_RULE:2,
  DETACHMENT:17,DETACHMENT_RULE:17,ENHANCEMENT:62,STRATAGEM:93,ATTACHMENT_DECLARATION:21,
  WARGEAR_OPTION:87,EQUIPMENT_ABILITY:7,UNIT_COMPOSITION:54,UPGRADE_DECLARATION:3};
for(const [kind,n]of Object.entries(expected)){const entities=facts.entities.filter(e=>e.kind===kind);assert.equal(entities.length,n);entities.forEach(e=>assert.ok(cards.has(e.id),'Missing canonical card '+e.id));}
const at=(value,path)=>path.slice(1).split('/').reduce((v,k)=>v?.[k.replaceAll('~1','/').replaceAll('~0','~')],value);
let checked=0;
for(const card of payload.cards.filter(c=>c.domain!=='CORE'))for(const field of card.fields){
  const owner=index.get(field.source.entityId);assert.ok(owner,'Foreign factual owner');
  const value=field.source.path==='/displayName'?owner.displayName:at(owner.data,field.source.path);
  assert.deepEqual(field.value,value,'Changed/missing factual owner '+field.id);checked++;
}
const refs=createReferenceContract({cards,index:payload.glossary,registryId:facts.bookId});
for(const id of payload.ruleContractIds){assert.ok(refs.resolve(id)?.sections.length,'Empty canonical rule definition '+id);}
const glossary=validateGlossary(payload.glossary,payload.cards);
assert.equal(new Set(payload.ruleContractIds).size,315);
assert.equal(typeof registration.createRoster,'function');
assert.ok(!payload.cards.some(c=>c.fields.some(f=>f.source?.path.startsWith('/roster'))));
assert.ok(cards.has('army-rule-cult-of-the-dark-gods'));
assert.ok(payload.relatedRules.rows.every(r=>r.applicability!=='INVALID'));
const binding=read('./app-datasheet-bindings.json');
for(const visual of binding.tableVisuals){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL(visual.asset,import.meta.url))).digest('hex'),visual.source.assetSha256);
  assert.ok(cards.get(visual.tableId).fields.find(f=>f.source.path===visual.fieldPath)?.visual);
}
for(const e of facts.entities.filter(e=>['FAQ','OFFICIAL_UPDATE','ERRATA'].includes(e.kind)&&!e.factOwnerId))assert.ok(payload.groups.find(g=>g.id==='updates').itemIds.includes(e.id));
const publicProjection=JSON.stringify([...cards.values()].filter(c=>c.domain!=='CORE').map(c=>[c.title,...c.fields.map(f=>f.displayValue??f.value)]));
assert.doesNotMatch(publicProjection,/schemaVersion|sourceEntityId|AUTHORITATIVE_CURRENT|ACCEPTED_SECONDARY|Points v1\.5-scoped-six/);
console.log(JSON.stringify({status:'PASS',canonicalEntities:facts.entities.length,counts:expected,sourceFieldsChecked:checked,
  contracts:payload.ruleContractIds.length,glossary,tableVisuals:binding.tableVisuals.length,rosterConnected:true,legacyReads:0}));
