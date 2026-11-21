/** Player requirements for display-only names, ownership and shared prose. */
import assert from 'node:assert/strict';
import {physicalUnitCaption,physicalModelCaption} from '../books/shared/army-book-app-v2/cosmetics.mjs';
import {ruleReferenceTextFields,conditionalSourceTextKey} from '../books/shared/army-book-app-v2/effective-datasheet-presentation.mjs';
let checks=0;
const field=(key,value)=>({id:'reference::/'+key,source:{path:'/'+key},value});
const reference={fields:[field('label','Combat Doctrines'),field('text','Combat Doctrines'),field('scope','SOURCE_DECLARATION'),field('recipientBindingStatus','NOT_EXECUTABLE')]};
const original=structuredClone(reference);
assert.deepEqual(ruleReferenceTextFields(reference).map(f=>f.value),['Combat Doctrines']);checks++;
assert.deepEqual(reference,original,'Display filtering preserves every source fact');checks++;
assert.deepEqual(ruleReferenceTextFields({fields:[field('label','Rule name'),field('text','A separate complete rule.')]})
  .map(f=>f.value),['Rule name','A separate complete rule.']);checks++;
const state={units:[{instanceId:'parsed-unit-1',canonicalUnitId:'unit-out-riders'},{instanceId:'parsed-unit-2',canonicalUnitId:'unit-out-riders'}]};
const cards=new Map([['unit-out-riders',{id:'unit-out-riders',title:'Outrider Squad'}]]);
const profile=(id,scope,model,name,count)=>({id,instanceId:'parsed-unit-1',scopeId:scope,modelInstanceId:model,rosterQuantity:count,title:'PROFILE',fields:[field('name',name)]});
const sergeant=profile('profile-sergeant','scope-sergeant','model-sergeant','Outrider Sergeant',1),riders=profile('profile-rider','scope-riders',null,'Outrider',2);
const profiles=[sergeant,riders],source=structuredClone({state,profiles});
assert.equal(physicalUnitCaption(state,cards,'parsed-unit-1'),'Outrider Squad #1');checks++;
assert.equal(physicalUnitCaption(state,cards,'parsed-unit-2'),'Outrider Squad #2');checks++;
assert.equal(physicalModelCaption(state,cards,'parsed-unit-1',profiles,{scopeId:'scope-sergeant'}),'Outrider Squad #1 — Outrider Sergeant · 1 model');checks++;
assert.equal(physicalModelCaption(state,cards,'parsed-unit-1',profiles,{scopeId:'scope-riders'}),'Outrider Squad #1 — Outrider · 2 models');checks++;
assert.deepEqual({state,profiles},source,'Formatting cannot reassign, rename or resize a physical owner');checks++;
assert.throws(()=>physicalModelCaption(state,cards,'parsed-unit-2',profiles,{scopeId:'scope-sergeant'}),/Unresolved physical MODEL attribution/);checks++;
assert.throws(()=>physicalModelCaption(state,cards,'parsed-unit-1',[...profiles,sergeant],{scopeId:'scope-sergeant'}),/Unresolved physical MODEL attribution/);checks++;
assert.throws(()=>physicalModelCaption(state,cards,'parsed-unit-1',profiles,{scopeId:'scope-riders',modelInstanceId:'model-sergeant'}),/Unresolved physical MODEL attribution/);checks++;
assert.throws(()=>physicalUnitCaption(state,new Map(),'parsed-unit-1'),/Missing human name/);checks++;
const provenance={sourceId:'accepted-detachment-source',pointer:'/one-rule',sha256:'accepted-bytes'};
const row={ruleId:'rule-detachment',sourceInstanceId:null,sourceModelScopeId:null,policy:{contextQuote:'A complete rule with both permissions.'},clauseId:'hit',effect:{roll:'HIT'}};
const wound={...structuredClone(row),clauseId:'wound',effect:{roll:'WOUND'}},before=structuredClone([row,wound]);
const key=conditionalSourceTextKey(row,provenance,{sourceKind:'DETACHMENT_RULE'});
assert.equal(typeof key,'string','A canonical Detachment is a proven source without a physical bearer');checks++;
assert.equal(conditionalSourceTextKey(wound,provenance,{sourceKind:'DETACHMENT_RULE'}),key,'One source text; two independent effects');checks++;
assert.deepEqual([row,wound],before,'Neither clause nor effect is merged or mutated');checks++;
assert.equal(conditionalSourceTextKey(row,provenance),null,'An unspecified physical source is still unproven');checks++;
assert.equal(conditionalSourceTextKey(row,provenance,{sourceKind:'DATASHEET_ABILITY'}),null);checks++;
assert.equal(conditionalSourceTextKey(row,null,{sourceKind:'DETACHMENT_RULE'}),null);checks++;
for(const change of [r=>r.ruleId='different-rule',r=>r.policy.contextQuote+=' A real exception.']){
  const next=structuredClone(row);change(next);assert.notEqual(conditionalSourceTextKey(next,provenance,{sourceKind:'DETACHMENT_RULE'}),key);checks++;
}
assert.notEqual(conditionalSourceTextKey(row,{...provenance,pointer:'/different-rule'},{sourceKind:'DETACHMENT_RULE'}),key);checks++;
console.log(JSON.stringify({status:'PASS',checks,sourceFactsMutated:false,physicalRecipientsMutated:false}));
