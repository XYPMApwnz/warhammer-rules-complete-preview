/** Independent canonical ability-range inputs; no army data or prose joins. */
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {createRosterRuntime} from './runtime.mjs';
import {buildAttachmentFeasibility} from './compatibility-feasibility.mjs';
import {compileRecipientFixture} from './recipient-fixture.mjs';
export const rangeId=name=>'synthetic-range:'+name;
export function createAbilityRangeFixture({value=2,targetId=rangeId('ability-a')}={}) {
  const id=rangeId,clone=structuredClone;
  const evidence={field:['text'],quote:'Eligible bearer models add two inches to the designated ability range.'};
  const atom=(predicate,subject,args)=>({predicate,subject,contextLevel:'STATIC',arguments:args,evidence:clone(evidence)});
  const text='Select within 4". Roll D3; other rules and values remain unchanged.';
  const entities=[{id:id('detachment'),kind:'DETACHMENT',data:{title:'Synthetic detachment'}}],rosterProfileBindings=[];
  for(const [unit,profiles]of [['mixed',['eligible','sibling']],['leader',['leader-model']]]) {
    entities.push({id:id(unit),kind:'DATASHEET',data:{title:unit,profileIds:profiles.map(id),
      keywords:unit==='leader'?['CHARACTER']:['INFANTRY'],factionKeywords:[],weaponIds:[],sectionIds:[],
      wargearOptionIds:[],ruleReferenceIds:['ability-a','ability-b'].map(id)}});
    for(const profile of profiles){
      entities.push({id:id(profile),kind:'PROFILE',parentId:id(unit),data:{name:profile,M:'6"',T:'4',SV:'3+',W:'3',LD:'7+',OC:'1'}});
      rosterProfileBindings.push({unitId:id(unit),profileId:id(profile),intrinsicKeywords:profile==='eligible'?['ELIGIBLE']:[],
        referenceIds:['ability-a','ability-b'].map(id)});
    }
  }
  for(const ability of ['ability-a','ability-b'])entities.push({id:id(ability),kind:'SUPPLEMENTAL_DATASHEET_RULE',
    parentId:id('mixed'),data:{title:'Same caption',text}});
  const owner=atom('UNIT_ID','UNIT',{id:id('mixed')});
  const effect={id:id('effect'),operation:'MODIFY_ABILITY_RANGE',ability:{canonicalId:targetId},mode:'ADD',value,
    targetSubject:'MODEL',targetBinding:'SOURCE_UNIT_MODELS',conditions:[{binding:'TARGET',predicate:atom('MODEL_KEYWORD','MODEL',{keyword:'ELIGIBLE'})}],
    evidence:clone(evidence),sourceFields:[['text']],lifetime:'WHILE_ASSIGNED'};
  entities.push({id:id('enhancement'),kind:'ENHANCEMENT',parentId:id('detachment'),data:{text:evidence.quote},
    ruleContract:{schema:'rule-contract/v2',ruleId:id('enhancement'),ownerId:id('detachment'),sourceId:id('source'),
      kind:'ENHANCEMENT',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',detachmentId:id('detachment'),
      sourceFields:[['text']],conditions:[],roles:[{id:'owner',subject:'UNIT',allegiance:'FRIENDLY',selector:owner,conditions:[]}],
      assignment:{ownerRoleId:'owner',selector:clone(owner)},clauses:[{id:id('clause'),sourceFields:[['text']],roles:[],conditions:[],
        rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]}});
  const book={bookId:id('book'),entities,rosterProfileBindings,
    rosterAbilityReferences:Object.fromEntries(['ability-a','ability-b'].map(name=>[id(name),{id:id(name),title:'Same caption',
      parameters:{range:{type:'number',min:0}},rangeBinding:{field:['text'],start:14,end:16,baseValue:4}}])),
    rosterReferenceSemantics:Object.fromEntries(['ability-a','ability-b'].map(name=>[id(name),{abilities:[{
      canonicalId:id(name),name:'Same caption',parameters:{range:4},group:'DATASHEET ABILITIES'}]}])),
    rosterAttachmentPolicies:[{sourceId:id('leader'),targetId:id('mixed'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,rosterProfileBindings.map(row=>({...row,maxModels:1})));
  const unit=(instanceId,name,assigned=false)=>({instanceId,canonicalUnitId:id(name),startingStrength:name==='mixed'?2:1,
    modelRows:(name==='mixed'?['eligible','sibling']:['leader-model']).map(profile=>({rowId:profile,canonicalProfileId:id(profile),quantity:1,selections:[],loadouts:[]})),
    enhancementIds:assigned?[id('enhancement')]:[],selections:[],warlord:null});
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:id('roster'),
    detachments:[{instanceId:'d',canonicalDetachmentId:id('detachment')}],detachmentIds:[id('detachment')],
    units:[unit('a','mixed',true),unit('b','mixed'),unit('leader','leader')],attachments:[],warlordInstanceId:null};
  const api=createRuleContractSchema({stateFields:{leading:{contextLevel:'ROSTER',valueType:'boolean'}}});
  const runtime=()=>{const service=createRosterRuntime(compileRecipientFixture(book,api,{validateContracts:false}),api);service.load(state);return service;};
  return {book,state,effect,api,runtime,canonicalText:text};
}
