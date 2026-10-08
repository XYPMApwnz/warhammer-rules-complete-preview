import assert from 'node:assert/strict';
import {projectArmyBook} from './project.mjs';
import {projectInstanceCards} from './personal.mjs';

const checks=[];
for(const [groupsKey,idsKey]of [['groups','weaponProfileIds'],['profileGroups','profileIds']]) {
  const stats={M:'6"',T:'4',SV:'4+',W:'2',LD:'7+',OC:'1'};
  const weapon={name:'Example weapon',mode:'ranged',range:'24"',attacks:'1',skill:'3+',strength:'4',ap:'0',damage:'1',abilities:[]};
  const entities=[{id:'unit',kind:'DATASHEET',data:{name:'Example',profileIds:['profile-a','profile-b'],keywords:['INFANTRY']}},
    ...['profile-a','profile-b'].map(id=>({id,kind:'PROFILE',parentId:'unit',data:{name:id,...stats}})),
    ...['weapon-a','weapon-b','weapon-c'].map(id=>({id,kind:'WEAPON_PROFILE',parentId:'unit',data:{...weapon,name:id}})),
    {id:'enhancement',kind:'ENHANCEMENT',data:{name:'Example Enhancement'}},
    {id:'contributed',kind:'WEAPON_PROFILE',parentId:'enhancement',data:{...weapon,name:'Contributed weapon'}},
    {id:'selection',kind:'WEAPON_PROFILE_SELECTION',parentId:'unit',data:{text:'Select one profile.',
      [groupsKey]:[{id:'first',[idsKey]:['weapon-a','weapon-b'],sourceProfileLabels:['First','Second']},
        {id:'second',[idsKey]:['weapon-c'],sourceProfileLabels:['Third']}]}}];
  const model={bookId:'synthetic',entities,currentness:{currentness:'CURRENT',lastReconciledSource:'Synthetic'},
    mfm:{source:{label:'Synthetic'},unitBindings:[],detachmentBindings:[],enhancementBindings:[],paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]}};
  const payload=projectArmyBook(model,new Map(),{title:'Synthetic'}),cards=new Map(payload.cards.map(card=>[card.id,card]));
  const before=structuredClone(payload);
  const unit={instanceId:'copy-a',canonicalUnitId:'unit',selections:[],modelRows:['profile-a','profile-b'].map((id,i)=>({
    rowId:'row-'+i,canonicalProfileId:id,quantity:1,selections:[],loadouts:[],compositionScope:'MODEL_ROW',presentationLabel:i?'Crew':'Specialist'}))};
  const scope=i=>'copy-a/row-'+i+'/PROFILE/row-'+i;
  const profiles=unit.modelRows.map((row,i)=>({id:row.canonicalProfileId,scopeId:scope(i),quantity:1,
    fields:Object.entries(stats).map(([label,value])=>({label,value})),abilities:[],metrics:{}}));
  const record=(id,scopeId,quantity=1)=>({id,scopeId,physicalQuantity:quantity,
    fields:Object.entries(entities.find(e=>e.id===id).data).map(([label,value])=>({label,value}))});
  const effective={instanceId:'copy-a',canonicalUnitId:'unit',keywords:['INFANTRY'],profiles,
    weapons:[record('weapon-a',scope(0),2),record('weapon-b',scope(1)),record('contributed',scope(0))]};
  const variants=projectInstanceCards(cards,unit,effective),selections=variants.get('selection');
  assert.deepEqual(selections.map(card=>card.scopeId),[scope(0),scope(1)]);
  for(const [i,card]of selections.entries()) {
    assert.deepEqual(card.fields.flatMap(field=>field.targetIds||[]),[i?'weapon-b':'weapon-a']);
    assert.deepEqual(card.fields.filter(field=>field.source.path.includes('/sourceProfileLabels/')).map(field=>field.value),[i?'Second':'First']);
    assert.equal(card.fields.some(field=>field.source.path.startsWith('/'+groupsKey+'/1/')),false,'Unselected group remains');
    assert.equal(card.presentationScope.label,i?'Crew':'Specialist');
  }
  assert.equal(variants.get('weapon-a')[0].rosterQuantity,2);
  assert(variants.get('unit')[0].children.includes('contributed'));
  assert.equal(variants.get('contributed')[0].id,'contributed');
  assert.equal(variants.get('contributed')[0].scopeId,scope(0));
  const duplicate={...unit,instanceId:'copy-b'},other={...effective,instanceId:'copy-b',weapons:[record('weapon-c',null)]};
  const second=projectInstanceCards(cards,duplicate,other);
  assert.deepEqual(second.get('selection')[0].fields.flatMap(field=>field.targetIds||[]),['weapon-c']);
  assert(!second.get('unit')[0].children.includes('contributed'),'Contribution leaked');
  const empty=projectInstanceCards(cards,unit,{...effective,weapons:[]});
  assert.deepEqual(empty.get('selection'),[]);assert(!empty.get('unit')[0].children.includes('selection'));
  assert.deepEqual(projectInstanceCards(cards,unit,effective),variants,'Rebuild is not deterministic');
  assert.deepEqual(payload,before,'Canonical book was mutated');
  assert.deepEqual(cards.get('selection').fields.flatMap(field=>field.targetIds||[]),['weapon-a','weapon-b','weapon-c'],'Book lost canonical options');
  checks.push(groupsKey+': exact inventory, quantities, scoped references, contribution, duplicates, immutable book');
}
console.log(JSON.stringify({status:'PASS',checks,armyFactualReads:0}));
