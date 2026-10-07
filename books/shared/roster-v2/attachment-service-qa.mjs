import assert from 'node:assert/strict';
import {createRosterAttachmentService} from './attachment-service.mjs';

// Synthetic physical owners only: this guard loads no army or effect registry.
const book={bookId:'synthetic',entities:[{id:'formation',kind:'DETACHMENT',data:{}},
  ...['crew','officer','assistant'].flatMap(id=>[
    {id,kind:'DATASHEET',data:{profileIds:[id+'/profile'],weaponIds:[],ruleReferenceIds:[],keywords:id==='crew'?['INFANTRY']:['CHARACTER'],factionKeywords:['SAMPLE']}},
    {id:id+'/profile',kind:'PROFILE',parentId:id,data:{name:id}},
    {id:id+'/upgrade',kind:'ENHANCEMENT',parentId:'formation',data:{}},
    {id:id+'/evidence',kind:'DATASHEET_SECTION',parentId:id,data:{}}])]};
const policy=(sourceId,role)=>({sourceId,targetId:'crew',role,additionalLeaders:0,sourceIds:[sourceId+'/evidence']});
const policies=[policy('officer','LEADER'),policy('assistant','SUPPORT')];
const unit=(instanceId,canonicalUnitId)=>({instanceId,canonicalUnitId,startingStrength:canonicalUnitId==='crew'?4:1,
  warlord:null,enhancementIds:[canonicalUnitId+'/upgrade'],selections:[],
  modelRows:[{rowId:'row',canonicalProfileId:canonicalUnitId+'/profile',quantity:canonicalUnitId==='crew'?4:1,selections:[]}]});
const state={schema:'roster-v2/roster',bookId:'synthetic',rosterId:'test',detachments:[{instanceId:'det',canonicalDetachmentId:'formation'}],
  warlordInstanceId:null,units:[unit('a','crew'),unit('b','crew'),unit('l1','officer'),unit('l2','officer'),unit('s1','assistant'),unit('s2','assistant')],attachments:[]};
const original=structuredClone(book),make=()=>{const service=createRosterAttachmentService(book,{importService:{},policies});service.load(state);return service;};
const a=make(),b=make();
assert.deepEqual(a.candidates('a').map(item=>item.instanceId),['l1','l2','s1','s2']);
a.attach('a','l1');a.attach('a','s1');b.attach('a','s1');b.attach('a','l1');
assert.deepEqual(a.state,b.state,'Attachment order must not change physical state');assert.deepEqual(a.groups,b.groups);
assert.equal(a.context('a').roster.leading,false);assert.equal(a.context('l1').roster.leading,true);assert.equal(a.context('s1').roster.leading,true);
assert(a.context('a').keywords.has('CHARACTER'));assert(!a.context('a','MODEL').keywords.has('CHARACTER'));
assert(!a.context('b').keywords.has('CHARACTER'));assert.equal(a.context('b').roster.attached,false);
assert.deepEqual(a.state.units.map(item=>item.enhancementIds),state.units.map(item=>item.enhancementIds),'AH05 preserves Bodyguard Upgrade and both independent participant Enhancements');
const attached=a.snapshot();
for(const [recipient,participant] of [['a','l2'],['a','s2'],['b','l1'],['l1','a'],['a','a']]) {
  assert.throws(()=>a.attach(recipient,participant));assert.deepEqual(a.state,attached,'Failed action is atomic');
}
a.detach('l1');assert.equal(a.context('l1').roster.leading,false);a.reattach('a','l1');assert.deepEqual(a.state,attached);
a.reattach('b','l1');assert.equal(a.context('b').roster.attached,true);assert.equal(a.context('a').roster.leading,false);
a.load(JSON.parse(JSON.stringify(attached)));assert.deepEqual(a.state,attached);
const leaked=structuredClone(attached);leaked.attachments.push({...leaked.attachments[0],bodyguardInstanceId:'b'});
assert.throws(()=>a.load(leaked));assert.deepEqual(a.state,attached);
assert.equal(a.effective,undefined);assert.equal(a.projection,undefined);assert.equal(a.applyEffects,undefined);
assert.deepEqual(book,original,'Canonical facts remain immutable');
const badPolicies=structuredClone(policies);badPolicies[0].sourceIds=['missing'];
assert.throws(()=>createRosterAttachmentService(book,{importService:{},policies:badPolicies}));
console.log(JSON.stringify({status:'PASS',ordinaryLeaderSupportCapacity:'PASS',orderIndependence:'PASS',AH04:'PASS',AH05:'PASS',instanceIsolation:'PASS',atomicRejection:'PASS',roundtrip:'PASS',armyFactualReads:0,effectsLoaded:0}));
