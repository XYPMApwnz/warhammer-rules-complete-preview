/** Standalone presentation boundary controls; no army factual inputs. */
import assert from 'node:assert/strict';
import {projectArmyBook} from './project.mjs';

function fixture({nested=false,mixed=false}={}) {
  const entities=[{id:'unit-example',kind:'DATASHEET',data:{name:'Example',profileIds:['profile-a'],keywords:['INFANTRY']}}];
  const stats={M:'6"',T:'4',SV:'4+',W:'2',LD:'7+',OC:'1'};
  entities.push({id:'profile-a',parentId:'unit-example',kind:'PROFILE',data:{name:'Specialist',...(nested?{stats}:{...stats})}});
  if(mixed) {
    entities[0].data.profileIds.push('profile-b');
    entities.push({id:'profile-b',parentId:'unit-example',kind:'PROFILE',data:{name:'Crew',stats:{...stats,W:'1'}}});
    entities.push({id:'save',parentId:'unit-example',kind:'INVULNERABLE_SAVE',data:{value:'6+',profileIds:['profile-a','profile-b']}});
    for(const entity of entities.filter(entity=>entity.kind==='PROFILE')) {
      entity.data.invulnerableSaveId='save';
      entity.data.keywordScopeIds=['all','faction',...(entity.id==='profile-a'?['specialist']:[])];
    }
    entities[0].data.keywordScopesId='scopes';delete entities[0].data.keywords;
    entities.push({id:'scopes',parentId:'unit-example',kind:'KEYWORD_SCOPES',data:{scopes:[
      {id:'all',label:'ALL MODELS',keywords:['INFANTRY']},
      {id:'specialist',label:'SPECIALIST',keywords:['TECHNICIAN']},
      {id:'faction',label:'FACTION KEYWORDS',keywords:['EXAMPLE_FACTION']}
    ]}});
  }
  return {bookId:'synthetic',entities,currentness:{currentness:'CURRENT',lastReconciledSource:'Synthetic'},
    mfm:{source:{label:'Synthetic'},unitBindings:[],detachmentBindings:[],enhancementBindings:[],paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]}};
}
const checks=[];
for(const options of [{},{nested:true},{nested:true,mixed:true}]) {
  const model=fixture(options),snapshot=JSON.stringify(model);
  const project=()=>projectArmyBook(model,new Map(),{title:'Synthetic'}),payload=project();
  assert.equal(JSON.stringify(model),snapshot,'Presentation must not rewrite canonical facts');
  assert.deepEqual(project(),payload,'Fresh rebuild must be deterministic');
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  for(const profileId of model.entities[0].data.profileIds) {
    const card=cards.get(profileId);
    assert.equal(card.parentId,'unit-example');
    const move=card.fields.find(field=>(field.presentationPath??field.source.path)==='/M');
    assert.equal(move.value,'6"');
    assert.equal(move.source.path,options.nested?'/stats/M':'/M','Keep original source address');
    if(options.mixed)assert.equal(card.fields.find(field=>field.source.path==='/name').presentation,'heading');
    const wound=card.fields.find(field=>(field.presentationPath??field.source.path)==='/W');
    assert.equal(wound.value,profileId==='profile-a'?'2':'1');
  }
  if(options.mixed) {
    assert.deepEqual(cards.get('profile-a').profileFieldIds,['save::/value']);
    assert.deepEqual(cards.get('profile-b').profileFieldIds,['save::/value']);
    assert.equal(payload.factManifest.filter(field=>field.id==='save::/value').length,1,'One canonical save owner');
    const unit=cards.get('unit-example'),group=unit.keywordGroups[1];
    assert.equal(group.labelFieldId,'scopes::/scopes/1/label');
    assert.equal(group.scopeId,'specialist');assert.deepEqual(group.profileIds,['profile-a']);
    assert.deepEqual(group.fieldIds,['scopes::/scopes/1/keywords/0']);
    const keyword=unit.fields.find(field=>field.id===group.fieldIds[0]);
    assert.equal(keyword.source.entityId,'scopes');assert.equal(keyword.source.path,'/scopes/1/keywords/0');
    assert.equal(cards.get('profile-b').fields.some(field=>field.value==='TECHNICIAN'),false,'Do not distribute MODEL keywords');
  }
  const fieldIds=payload.cards.flatMap(card=>card.fields.map(field=>field.id));
  assert.equal(new Set(fieldIds).size,fieldIds.length,'No competing presentation fact owners');
  checks.push(options.mixed?'mixed-profile-and-keyword-scopes':options.nested?'nested-single-profile':'flat-single-profile');
}
for(const mutation of [model=>model.entities[1].parentId='another-unit',model=>model.entities.find(entity=>entity.id==='save').data.profileIds=[]]) {
  const model=fixture({nested:true,mixed:true});mutation(model);
  assert.throws(()=>projectArmyBook(model,new Map(),{title:'Synthetic'}));
}
console.log(JSON.stringify({status:'PASS',sharedInterface:true,checks,negativeControls:2,armyFactualReads:0}));
