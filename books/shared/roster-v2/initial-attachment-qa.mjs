/** Synthetic formation-policy controls; source rules and effects remain book-owned. */
import assert from 'node:assert/strict';
import {computeRosterCondition} from './condition-computations.mjs';
import {createInitialAttachmentConditionContext} from './physical-condition-context.mjs';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {findConditionValue} from '../rule-contract-v2/conditions.mjs';

const clone=structuredClone;
const edge=(leaderInstanceId='leader',bodyguardInstanceId='bodyguard')=>({leaderInstanceId,bodyguardInstanceId,role:'LEADER'});
const physical=(instanceId,canonicalUnitId)=>({instanceId,canonicalUnitId,startingStrength:1,warlord:false,
  enhancementIds:[],selections:[],modelRows:[{rowId:'one',canonicalProfileId:canonicalUnitId+'-profile',quantity:1,selections:[]}]});
const data=(id,keywords=[],factionKeywords=[])=>({title:id,keywords,factionKeywords,profileIds:[id+'-profile'],weaponIds:[]});
const book={bookId:'synthetic-initial-formation',entities:[
  {id:'detachment',kind:'DETACHMENT',data:{}},
  {id:'source',kind:'DATASHEET',data:data('source',['CHARACTER'])},
  {id:'source-profile',kind:'PROFILE',parentId:'source',data:{name:'Source'}},
  {id:'eligible',kind:'DATASHEET',data:data('eligible',['BATTLELINE'],['EMPEROR’S CHILDREN'])},
  {id:'eligible-profile',kind:'PROFILE',parentId:'eligible',data:{name:'Bodyguard'}}],
  rosterAttachmentPolicies:[{sourceId:'source',targetId:'eligible',role:'LEADER',additionalLeaders:0,sourceIds:['synthetic-relation']}]};
const roster=()=>({schema:'roster-v2/roster',bookId:book.bookId,rosterId:'initial-formation-controls',detachmentIds:['detachment'],
  units:[physical('leader','source'),physical('other-leader','source'),physical('bodyguard','eligible')],
  attachments:[edge()],warlordInstanceId:null});
const schema=createRuleContractSchema({stateFields:{initialAttachmentBattleline:{contextLevel:'ROSTER',valueType:'boolean'}}});
const predicate={predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',arguments:{key:'initialAttachmentBattleline',equals:true}};
const binding={kind:'INITIAL_ATTACHMENT',sourceId:'source',profileId:'source-profile',step:'DECLARE_BATTLE_FORMATIONS',
  bodyguardKeywords:['EMPEROR’S CHILDREN','BATTLELINE']};
const messages={step:'Unconfirmed initial attachment timing',missing:'Missing Declare Battle Formations snapshot',malformed:'Malformed initial snapshot'};
const context=(instanceId='leader')=>({subject:'MODEL',instanceId,modelId:'source-profile',roster:{}});
const computed=(state,instanceId='leader')=>{
  const before=clone(state),result=computeRosterCondition({kind:'INITIAL_ATTACHMENT'},{state,unit:{instanceId}});
  assert.deepEqual(state,before,'Computing the default must not write historical state');
  assert.equal(result.skip,false);return result.value;
};
const declared=(state,activeBook=book,instanceId='leader')=>{
  const before=clone(state),bind=createInitialAttachmentConditionContext(activeBook,state,{binding,conditionArguments:predicate.arguments,messages});
  const output=bind(context(instanceId));assert.deepEqual(state,before,'Binding the default must not write historical state');
  return {state:schema.evaluatePredicate(predicate,output),value:findConditionValue(output.roster,predicate.arguments)};
};
let checks=0;
const check=(name,run)=>{run();checks++;};

check('implicit current formation is TRUE and unattached formation is FALSE',()=>{
  const state=roster();assert.equal(computed(state),true);assert.equal(computed(state,'other-leader'),false);
  state.attachments=[];assert.equal(computed(state),false);
  state.attachments=[edge()];assert.equal(computed(state),true);
  state.attachments=[];assert.equal(computed(state),false);
});
check('explicit empty and different initial attachments override the implicit formation',()=>{
  const state=roster();state.initialAttachments=[];assert.equal(computed(state),false);
  state.initialAttachments=[edge('leader','another-bodyguard')];assert.equal(computed(state),false);
  state.initialAttachments=[edge()];assert.equal(computed(state),true);
  state.attachments=[edge('leader','another-bodyguard')];assert.equal(computed(state),false);
  state.attachments=[];assert.equal(computed(state),false);
});
check('EC-style default requires the recorded faction and BATTLELINE keywords',()=>{
  const state=roster();assert.equal(declared(state).state,'TRUE');
  for(const field of ['keywords','factionKeywords']){
    const altered=clone(book);altered.entities.find(e=>e.id==='eligible').data[field]=[];
    assert.equal(declared(state,altered).state,'FALSE','Missing '+field+' must not qualify');
  }
  assert.equal(declared(state,book,'other-leader').state,'FALSE','A different physical source cannot borrow the attachment');
});
check('EC-style unattached and detached formation is FALSE without writing history',()=>{
  const state=roster();state.attachments=[];assert.equal(declared(state).state,'FALSE');
  state.attachments=[edge()];assert.equal(declared(state).state,'TRUE');
  state.attachments=[];assert.equal(declared(state).state,'FALSE');
  assert.equal(state.initialAttachments,undefined);assert.equal(state.initialAttachmentStep,undefined);
});
check('explicit undated EC history retains UNKNOWN rather than using the default',()=>{
  const state=roster();state.initialAttachments=[];assert.equal(declared(state).state,'UNKNOWN');
  state.initialAttachments=[edge()];assert.equal(declared(state).state,'UNKNOWN');
});
check('explicit dated history remains authoritative and survives current detachment',()=>{
  const state=roster();state.initialAttachmentStep='DECLARE_BATTLE_FORMATIONS';state.initialAttachments=[edge()];
  assert.equal(declared(state).state,'TRUE');state.attachments=[];assert.equal(declared(state).state,'TRUE');
  state.initialAttachments=[];assert.equal(declared(state).state,'FALSE');
  state.attachments=[edge()];state.initialAttachments=[edge('other-leader')];assert.equal(declared(state).state,'FALSE');
});
check('malformed timing and history preserve the existing refusal controls',()=>{
  const state=roster();state.initialAttachments=null;assert.throws(()=>declared(state),/Malformed initial snapshot/);
  state.initialAttachments=[];state.initialAttachmentStep='SHOOTING_PHASE';assert.throws(()=>declared(state),/Unconfirmed initial attachment timing/);
  state.initialAttachmentStep='DECLARE_BATTLE_FORMATIONS';delete state.initialAttachments;
  assert.throws(()=>declared(state),/Missing Declare Battle Formations snapshot/);
  state.initialAttachments=[edge(),edge()];assert.throws(()=>declared(state),/already|Duplicate/i);
});

console.log(`Shared initial attachment policy: PASS (${checks} focused formation/history controls)`);
