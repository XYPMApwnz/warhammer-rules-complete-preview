/** Independent typed UNIT roll-modifier controls; no Army Book facts or dice. */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {validateRoster,withRosterDetachments,changeAttachment} from './context.mjs';
import {executeRosterEffects} from './effects.mjs';
import {compileRecipientFixture} from './recipient-fixture.mjs';
const clone=structuredClone,id=n=>'synthetic-advance:'+n;
const evidence={field:['text'],quote:'Reviewed synthetic UNIT Advance-roll modifier evidence.'};
const atom=(predicate,subject,args,level='STATIC')=>({predicate,subject,arguments:args,contextLevel:level,evidence:clone(evidence)});
const api=withRosterDetachments(createRuleContractSchema({stateFields:{equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},battleFlag:{contextLevel:'BATTLE',valueType:'boolean'}}}));
function fixture(){
  const entities=[{id:id('detachment'),kind:'DETACHMENT',data:{title:'Synthetic'}}];
  for(const name of ['bodyguard','leader']) {
    entities.push({id:id(name),kind:'DATASHEET',data:{title:name,keywords:[],factionKeywords:[],profileIds:[id(name+'/model')],weaponIds:[],ruleReferenceIds:[]}},
      {id:id(name+'/model'),parentId:id(name),kind:'PROFILE',data:{name,M:'6"',T:'4',SV:'3+',INSV:'5+',W:'2',LD:'6+',OC:'1'}});
  }
  entities.push({id:id('equipment'),parentId:id('bodyguard'),kind:'WARGEAR_OPTION',data:{text:evidence.quote}});
  const owner={id:'owner',subject:'UNIT',purpose:'OWNER',allegiance:'FRIENDLY',selector:atom('UNIT_ID','UNIT',{id:id('bodyguard')}),conditions:[]};
  const effect={id:id('effect'),operation:'MODIFY_RULE_METRIC',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'FORMED',
    field:'advanceRoll',mode:'ADD',value:1,conditions:[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},'ROSTER')}],
    equipmentRequirement:{kind:'EQUIPMENT_PRESENT',equipmentId:id('equipment'),sourceFieldPath:['text']},evidence:clone(evidence),sourceFields:[['text']],lifetime:'WHILE_EQUIPMENT_SELECTED'};
  entities.push({id:id('rule'),parentId:id('bodyguard'),kind:'DATASHEET_SECTION',provenance:{sourceId:id('source')},data:{text:evidence.quote},
    ruleContract:{schema:'rule-contract/v2',ruleId:id('rule'),ownerId:id('bodyguard'),sourceId:id('source'),kind:'DATASHEET_ABILITY',
      executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',roles:[owner],conditions:[],sourceFields:[['text']],
      clauses:[{id:'advance',roles:[clone(owner)],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]}});
  const selected={selectionKey:'instrument',physicalQuantity:1,canonicalEquipmentIds:[id('equipment')],canonicalProfileIds:[],canonicalFieldPaths:{[id('equipment')]:['/text']}};
  const unit=(instanceId,name,selections=[])=>({instanceId,canonicalUnitId:id(name),startingStrength:1,enhancementIds:[],warlord:false,
    equipmentContextKnown:true,selections,modelRows:[{rowId:'model',quantity:1,canonicalProfileId:id(name+'/model'),selections:[],loadouts:[]}]});
  const book={bookId:id('book'),entities,rosterAttachmentPolicies:[{sourceId:id('leader'),targetId:id('bodyguard'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'advance/roster',detachments:[{instanceId:'main',canonicalDetachmentId:id('detachment')}],
    units:[unit('a','bodyguard',[selected]),unit('b','bodyguard'),unit('l','leader')],attachments:[],warlordInstanceId:null};
  return {book,state,effect};
}
function run(book,state){
  const originalBook=clone(book),originalState=clone(state),canonical=compileRecipientFixture(book,api);
  const result=executeRosterEffects(canonical,validateRoster(canonical,state,canonical.rosterAttachmentPolicies),api);
  assert.deepEqual(book,originalBook);assert.deepEqual(state,originalState);return result;
}
const unit=(result,name='a')=>result.units.find(u=>u.instanceId===name);
const bonus=(result,name='a')=>unit(result,name).metrics.advanceRoll?.modifier||0;
let checks=0,mutations=0;const check=fn=>{fn();checks++;};
function invariant(result,book,{a=1,l=0}={}){
  assert.equal(bonus(result),a);assert.equal(bonus(result,'b'),0);assert.equal(bonus(result,'l'),l);
  for(const u of result.units)for(const m of u.profiles){
    assert.deepEqual(m.profile,book.entities.find(e=>e.id===m.canonicalProfileId).data,'Advance does not change MODEL or weapon characteristics');
    assert.equal(m.metrics.advanceRoll,undefined,'UNIT modifier cannot become a MODEL metric');
  }
  assert.ok(!Object.hasOwn(result,'rolls')&&!Object.hasOwn(result,'advanceRollResult'));
}
check(()=>{const {book,state}=fixture(),r=run(book,state);invariant(r,book);assert.deepEqual(unit(r).metrics.advanceRoll,{modifier:1});
  assert.equal(unit(r).applied[0].targetModelInstanceId,null);assert.equal(unit(r).applied[0].field,'advanceRoll');
  assert.deepEqual(run(book,state),r);const off=clone(state);off.units[0].selections=[];invariant(run(book,off),book,{a:0});
  off.units[0].selections=clone(state.units[0].selections);assert.deepEqual(run(book,off),r);assert.deepEqual(run(book,JSON.parse(JSON.stringify(state))),r);
});
check(()=>{const {book,state}=fixture();let attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','l','a');
  const r=run(book,attached);invariant(r,book,{l:1});assert.deepEqual(r.formedUnits[0].metrics.advanceRoll,{modifier:1});
  const off=clone(attached);off.units[0].selections=[];invariant(run(book,off),book,{a:0});
  attached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','l');invariant(run(book,attached),book);
  attached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'REATTACH','l','b');invariant(run(book,attached),book);
});
check(()=>{const {book,state,effect}=fixture();effect.unitScope='PHYSICAL';const attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','l','a');
  const result=run(book,attached);invariant(result,book);assert.equal(result.formedUnits[0].metrics.advanceRoll,undefined);
});
check(()=>{for(const patch of [{targetSubject:'MODEL',targetBinding:'SOURCE_MODEL'},{mode:'SET'},{value:1.5},{value:'1'},
  {unitScope:undefined},{unitScope:'ROSTER'},{weaponMode:'melee'},{max:2},{field:'unsupportedRoll'}]){
    const {book,state,effect}=fixture();Object.assign(effect,patch);assert.throws(()=>run(book,state),/Advance|metric|operation/i);
  }
  const {book,state,effect}=fixture();effect.operation='MODIFY_STAT';assert.throws(()=>run(book,state),/characteristic/);
});
check(()=>{const {book,state}=fixture();const wrong=clone(state);wrong.units[2].selections=wrong.units[0].selections;wrong.units[0].selections=[];
  assert.throws(()=>run(book,wrong),/Foreign equipment owner/);
  state.units[0].selections=[];delete state.units[0].equipmentContextKnown;const result=run(book,state);invariant(result,book,{a:0});
  assert.ok(unit(result).conditional.some(c=>c.ruleId===id('rule')));
});
function mutation(alter,stateChange=()=>{}){const {book,state,effect}=fixture();stateChange(state);invariant(run(book,state),book,{a:state.units[0].selections.length?1:0});
  alter(effect);assert.throws(()=>invariant(run(book,state),book,{a:state.units[0].selections.length?1:0}));mutations++;}
mutation(e=>e.value=2);mutation(e=>e.conditions=[] ,s=>s.units[0].selections=[]);
mutation(e=>e.targetBinding='ROSTER_UNITS');mutation(e=>e.equipmentRequirement.equipmentId=id('leader/model'));
console.log(JSON.stringify({status:'PASS',checks,mutations,typedUnitAdvanceModifier:true,battleSimulation:false}));
