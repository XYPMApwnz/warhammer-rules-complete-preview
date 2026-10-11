import assert from 'node:assert/strict';
import {modelBaseDisplayValue} from './model-base-presentation.mjs';

const ownerId='synthetic-unit';
const profile=(id,name)=>({id,ownerId,kind:'MODEL_PROFILE',data:{name}});
const member=(id,name,profileId)=>({id,ownerId,kind:'COMPOSITION_MEMBER',data:{composition:{name,modelProfileSourceId:profileId}}});
const profiles=[profile('profile-a','First profile'),profile('profile-b','Other models')];
const members=[member('member-b2','Second kind','profile-b'),member('member-a','First kind','profile-a'),member('member-b1','Third kind','profile-b')];
const entities=new Map([...profiles,...members].map(entity=>[entity.id,entity]));
const resolve=id=>entities.get(id);
const binding=(value,memberIds,profileIds)=>({value,compositionMemberSourceIds:memberIds,modelProfileSourceIds:profileIds});
const base=(id,bindings)=>({id,ownerId,data:{text:'Canonical base text',scopeBindings:bindings}});
const a=base('base-a',[binding('32mm',['member-a'],['profile-a'])]);
const b=base('base-b',[binding('40mm',['member-b1','member-b2'],['profile-b'])]);
const before=structuredClone({profiles,members,a,b});
assert.equal(modelBaseDisplayValue(a,[b,a],resolve,members),'First profile: ⌀32mm');
assert.equal(modelBaseDisplayValue(b,[b,a],resolve,members),'Other models: ⌀40mm');
assert.equal(modelBaseDisplayValue(b,[a,b],resolve,[...members].reverse()),'Other models: ⌀40mm');
// Equal values still identify separate model recipients explicitly.
const same=base('same',[binding('32mm',['member-b1','member-b2'],['profile-b'])]);
assert.equal(modelBaseDisplayValue(same,[a,same],resolve,members),'Other models: ⌀32mm');
// A single uniform declaration remains compact; an exception stays member-bound.
assert.equal(modelBaseDisplayValue(a,[a],resolve,members),undefined);
const exception=base('exception',[binding('32mm',['member-b1'],['profile-b']),binding('40mm',['member-b2'],['profile-b'])]);
assert.equal(modelBaseDisplayValue(exception,[exception],resolve,members),'Third kind: ⌀32mm; Second kind: ⌀40mm');
assert.equal(modelBaseDisplayValue(a,[a,exception],resolve,members),'First kind: ⌀32mm');
// Captions cannot supply identity or recover an invalid binding.
assert.throws(()=>modelBaseDisplayValue(base('bad',[binding('32mm',['First kind'],['profile-a'])]),[a,b],resolve,members),/Invalid/);
entities.set('foreign',{...profiles[0],id:'foreign',ownerId:'another-unit'});
assert.throws(()=>modelBaseDisplayValue(base('bad',[binding('32mm',['member-a'],['foreign'])]),[a,b],resolve,members),/Invalid/);
assert.deepEqual({profiles,members,a,b},before);
console.log('PASS: canonical base scope, grouped profiles, equal sizes, exceptions, order independence and immutability');
