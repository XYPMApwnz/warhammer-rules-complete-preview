/** Independent canonical/scope controls; no army data or runtime loaded. */
import assert from 'node:assert/strict';
import {projectAbilityPresentation,abilityParameters,collectAbilityReferences} from './ability-presentation.mjs';
const granted=(id,value)=>({canonicalId:id,name:'Identical display label',parameters:{value}});
const profile=(id,abilities,scopeId=id)=>({id,scopeId,quantity:1,abilities});
const reference=(canonicalId,parameters={},extra={})=>({canonicalId,parameters,group:'CORE ABILITIES',label:'Canonical source label',...extra});
const plan=(profiles,options={})=>projectAbilityPresentation({instanceId:'physical-a',profiles,...options});
const rows=result=>[...result.core,...result.profiles.flatMap(profile=>profile.abilities)];
let cases=0;
const check=(label,run)=>{run();cases++;};

check('Intrinsic occurrence plus identical grant is one Core fact',()=>{
  const ref=reference('ability-a',{distance:6},{runtimeEntryId:'source-occurrence'});
  const result=plan([profile('profile-a',[{id:'source-occurrence',name:'Unrelated imported caption'},
    {canonicalId:'ability-a',name:'Another caption',parameters:{distance:6}}])],{references:[ref]});
  assert.equal(result.core.length,1);assert.equal(result.profiles[0].abilities.length,0);
  assert.equal(result.core[0].canonicalId,'ability-a');assert.deepEqual(result.core[0].parameters,{distance:6});
});
check('Equal display labels are not identities',()=>{
  assert.equal(plan([profile('a',[granted('ability-a',5),granted('ability-b',5)])]).core.length,2);
});
check('Different values remain separate',()=>{
  assert.equal(plan([profile('a',[granted('ability-a',4),granted('ability-a',5)])]).core.length,2);
});
check('Parameter key order and numeric formatting normalize',()=>{
  assert.deepEqual(abilityParameters({value:'5+'}),{value:5});
  const a={canonicalId:'ability-a',parameters:{distance:6,nested:{b:2,a:1}}};
  const b={canonicalId:'ability-a',parameters:{nested:{a:1,b:2},distance:'6"'}};
  assert.equal(plan([profile('a',[a,b])]).core.length,1);
});
check('One profile has an ability, sibling has none',()=>{
  const result=plan([profile('a',[granted('ability-a',5)]),profile('b',[])]);
  assert.equal(result.core.length,0);assert.equal(result.profiles[0].abilities.length,1);
  assert.equal(result.profiles[1].abilities.length,0);
});
check('Different profile values remain scoped',()=>{
  const result=plan([profile('a',[granted('ability-a',4)]),profile('b',[granted('ability-a',5)])]);
  assert.equal(result.core.length,0);
  assert.deepEqual(result.profiles.map(profile=>profile.abilities[0].parameters.value),[4,5]);
  assert.notEqual(result.profiles[0].abilities[0].identity,result.profiles[1].abilities[0].identity);
});
check('Same all-model ability uses Core once',()=>{
  const result=plan([profile('a',[granted('ability-a',5)]),profile('b',[granted('ability-a',5)])]);
  assert.equal(result.core.length,1);assert.equal(result.core[0].recipientScopes.length,2);
  assert.ok(result.profiles.every(profile=>profile.abilities.length===0));
});
check('Repeated canonical profile IDs do not collapse physical scopes',()=>{
  const result=plan([profile('a',[granted('ability-a',5)],'group-1'),profile('a',[],'group-2')]);
  assert.equal(result.core.length,0);assert.equal(result.profiles[0].abilities.length,1);
  assert.equal(result.profiles[1].abilities.length,0);
});
check('Effective numeric bag replaces canonical baseline, without title join',()=>{
  const refs=[reference('ability-defence',{value:6},{legacyValue:true}),reference('ability-unrelated')];
  const result=plan([profile('a',[{name:'Renamed caption',value:4}])],{references:refs});
  assert.deepEqual(result.core.find(ability=>ability.canonicalId==='ability-defence').parameters,{value:4});
  assert.equal(result.core.filter(ability=>ability.canonicalId==='ability-defence').length,1);
  assert.ok(result.core.some(ability=>ability.canonicalId==='ability-unrelated'));
});
check('Legacy typed operation binds only its exact profile/scope',()=>{
  const result=plan([profile('a',[{name:'Any display caption',value:4}]),profile('b',[])],{
    applied:[{operation:'GRANT_MODEL_ABILITY',targetProfileId:'a',targetCompositionId:'a'}]});
  assert.equal(result.core.length,0);assert.equal(result.profiles[0].abilities[0].canonicalId,'core-feel-no-pain');
  assert.equal(result.profiles[1].abilities.length,0);
});
check('UNIT recipient and MODEL recipient remain distinct',()=>{
  const result=plan([profile('a',[granted('ability-a',5)])],{unitAbilities:[granted('ability-a',5),granted('ability-a',5)]});
  assert.equal(result.core.length,2);assert.deepEqual(result.core.map(ability=>ability.subject),['MODEL','UNIT']);
  assert.notEqual(result.core[0].identity,result.core[1].identity);
});
check('Canonical source span preserves other references and occurrence identity',()=>{
  const cards=[{fields:[{id:'field',value:'Source label'}]}];
  const references=collectAbilityReferences(cards,{fields:{field:[{start:0,end:6,targetId:'a',parameters:{distance:6},runtimeEntryId:'entry',group:'CORE ABILITIES'},
    {start:7,end:12,targetId:'b',group:'ARMY RULES'}]}});
  const result=plan([profile('a',[{id:'entry'}])],{references});
  assert.equal(result.core[0].canonicalId,'a');assert.equal(result.otherReferences[0].canonicalId,'b');
});
check('Physical owners, deterministic rebuild and immutable inputs',()=>{
  const input={instanceId:'a',profiles:[profile('p',[granted('ability-a',5)])]};
  const before=structuredClone(input),first=projectAbilityPresentation(input);
  const second=projectAbilityPresentation({...input,instanceId:'b'});
  assert.notEqual(first.core[0].identity,second.core[0].identity);
  assert.deepEqual(projectAbilityPresentation(input),first);assert.deepEqual(input,before);
});
check('Removed ability and zero-quantity profiles do not create recipients',()=>{
  const result=plan([profile('a',[]),{...profile('b',[granted('ability-a',5)]),quantity:0}],{
    references:[reference('ability-a',{value:5},{runtimeEntryId:'gone'})]});
  assert.equal(rows(result).length,0);
});
check('Unknown occurrence is not resolved by its display name',()=>{
  const result=plan([profile('a',[{id:'unknown',name:'Canonical source label'}])],{
    references:[reference('ability-a',{value:5},{runtimeEntryId:'known'})]});
  assert.equal(rows(result).length,0);
});
check('Ambiguous legacy numeric identities fail closed',()=>{
  assert.throws(()=>plan([profile('a',[{value:5}])],{references:[
    reference('ability-a',{value:5},{legacyValue:true}),reference('ability-b',{value:5},{legacyValue:true})]}),/Ambiguous legacy/);
});
console.log(JSON.stringify({status:'PASS',syntheticCases:cases,armyFactualReads:0}));
