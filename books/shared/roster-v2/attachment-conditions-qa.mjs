import assert from 'node:assert/strict';
import {createRosterAttachmentService} from './attachment-service.mjs';

// Independent synthetic registry: no faction facts, contracts or effects.
const book={bookId:'sample',entities:[{id:'det',kind:'DETACHMENT'},
  {id:'permission',kind:'ENHANCEMENT',parentId:'det'},
  {id:'same',kind:'UPGRADE_OPTION',parentId:'det',data:{keyword:'GROUP_A'}},
  {id:'other',kind:'UPGRADE_OPTION',parentId:'det',data:{keyword:'GROUP_B'}},
  {id:'constraint',kind:'DETACHMENT_RULE',parentId:'det'},
  ...['crew','officer','assistant'].flatMap(id=>[{id,kind:'DATASHEET',data:{profileIds:[id+'/profile'],weaponIds:[],ruleReferenceIds:[],keywords:[],factionKeywords:[]}},
    {id:id+'/profile',kind:'PROFILE',parentId:id,data:{name:id}},{id:id+'/evidence',kind:'DATASHEET_SECTION',parentId:id}])],
  rosterAttachmentConstraints:[{detachmentId:'det',sharedKeywords:['GROUP_A','GROUP_B'],optionKeywords:{same:'GROUP_A',other:'GROUP_B'},sourceIds:['constraint']}]};
const selection=id=>({physicalQuantity:1,canonicalProfileIds:[],canonicalEquipmentIds:[],canonicalOptionIds:[id],selectionField:'selectedGroupId',selectionCardinality:'ONE'});
const unit=(instanceId,canonicalUnitId,option,enhancements=[])=>({instanceId,canonicalUnitId,startingStrength:1,warlord:null,enhancementIds:enhancements,
  selectedGroupId:option,selections:option?[selection(option)]:[],modelRows:[{rowId:'row',canonicalProfileId:canonicalUnitId+'/profile',quantity:1,selections:[]}]});
const state={schema:'roster-v2/roster',bookId:'sample',rosterId:'s',detachments:[{instanceId:'d',canonicalDetachmentId:'det'}],warlordInstanceId:null,attachments:[],
  units:[unit('body','crew','same'),unit('leader-a','officer','same'),unit('leader-b','officer','other'),unit('support-a','assistant','same',['permission']),unit('support-b','assistant','same')]};
const policies=[{sourceId:'officer',targetId:'crew',role:'LEADER',additionalLeaders:0,sourceIds:['officer/evidence']},
  {sourceId:'assistant',targetId:'crew',role:'SUPPORT',additionalLeaders:0,sourceIds:['assistant/evidence','permission'],availability:[{detachmentId:'det',enhancementId:'permission'}]}];
const original=structuredClone(book),make=()=>{const service=createRosterAttachmentService(book,{policies,importService:{}});service.load(state);return service;};
const service=make();assert.deepEqual(service.candidates('body').map(item=>item.instanceId),['leader-a','support-a']);
assert.throws(()=>service.attach('body','leader-b'));assert.throws(()=>service.attach('body','support-b'));
service.attach('body','leader-a');service.attach('body','support-a');const attached=service.snapshot();
const reverse=make();reverse.attach('body','support-a');reverse.attach('body','leader-a');assert.deepEqual(reverse.snapshot(),attached);
const corrupted=structuredClone(attached);corrupted.units[1].selectedGroupId='other';corrupted.units[1].selections=[selection('other')];
assert.throws(()=>service.load(corrupted),'A formed keyword union cannot satisfy component-relative prerequisites');assert.deepEqual(service.snapshot(),attached);
const missing=structuredClone(state);missing.units[1].selections=[];delete missing.units[1].selectedGroupId;service.load(missing);
assert(!service.candidates('body').some(item=>item.instanceId==='leader-a'),'Missing choice cannot be invented');
const intrinsic=structuredClone(book);intrinsic.entities.find(entity=>entity.id==='officer').data.keywords=['GROUP_A'];
const fixed=createRosterAttachmentService(intrinsic,{policies,importService:{}});fixed.load(missing);assert(fixed.candidates('body').some(item=>item.instanceId==='leader-a'));
service.load(state);service.attach('body','support-a');service.detach('support-a');assert.deepEqual(service.snapshot().units,state.units);service.reattach('body','support-a');
const unowned=structuredClone(state);unowned.units[3].enhancementIds=[];service.load(unowned);assert(!service.candidates('body').some(item=>item.instanceId==='support-a'));
service.load(state);assert(service.candidates('body').some(item=>item.instanceId==='support-a'));
assert.deepEqual(book,original);assert.equal(service.effective,undefined);
console.log(JSON.stringify({status:'PASS',sharedChoiceRestriction:'PASS',intrinsicChoice:'PASS',formedUnionRejected:'PASS',physicalPermission:'PASS',removeRestore:'PASS',effectsExecuted:0}));
