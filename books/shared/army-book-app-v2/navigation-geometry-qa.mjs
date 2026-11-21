/** Fresh per-pass lookups must agree with the original live DOM scan. */
import assert from 'node:assert/strict';
import {createContentsSectionLookup} from './navigation-v1.mjs';
import {NavigationController} from './navigation-v1-controller.mjs';
let checks=0;
const node=(name,dataset={})=>({name,dataset});
const hero=node('hero'),heading=node('heading',{contentsTarget:'group'}),headingDuplicate=node('second heading',{contentsTarget:'group'});
const first=node('first canonical',{cardId:'shared'}),second=node('second canonical',{cardId:'shared'});
const physical=node('physical bodyguard',{rosterInstanceId:'unit-a',cardId:'shared'}),physicalDuplicate=node('second bodyguard',{rosterInstanceId:'unit-a'});
const character=node('physical character',{rosterInstanceId:'unit-b',cardId:'character'});
const combined='[data-contents-target],[data-roster-instance-id],[data-card-id]';
let tree=[heading,first,physical,second,character,headingDuplicate,physicalDuplicate],scans=0;
const main={querySelector:selector=>selector==='.v2-hero'?hero:null,querySelectorAll:selector=>{
  scans++;if(selector===combined)return tree;
  const property={'[data-contents-target]':'contentsTarget','[data-roster-instance-id]':'rosterInstanceId','[data-card-id]':'cardId'}[selector];return tree.filter(node=>Object.hasOwn(node.dataset,property));
}};
const model={nodes:new Map([['physical',{instanceId:'unit-a',canonicalId:'shared'}],['character-route',{instanceId:'unit-b',canonicalId:'shared'}],['canonical-route',{canonicalId:'shared'}],['absent-physical',{instanceId:'missing',canonicalId:'shared'}]]),groups:new Map([['group',['shared','character']],['canonical-group',['shared','character']],['missing-group',['missing']],['empty-group',[]]])};
// This is intentionally the pre-change scan, rather than a second map builder.
const old=id=>{
  if(id==='start')return main.querySelector('.v2-hero')||main;
  const heading=[...main.querySelectorAll('[data-contents-target]')].find(node=>node.dataset.contentsTarget===id);if(heading)return heading;
  const row=model.nodes.get(id);
  if(row?.instanceId)return [...main.querySelectorAll('[data-roster-instance-id]')].find(node=>node.dataset.rosterInstanceId===row.instanceId)||null;
  const target=model.groups.get(id)?.[0]||row?.canonicalId||id;
  return [...main.querySelectorAll('[data-card-id]')].find(node=>node.dataset.cardId===target)||null;
};
const ids=['start','group','physical','character-route','canonical-route','canonical-group','shared','character','absent-physical','missing-group','empty-group','unknown'];
let lookup=createContentsSectionLookup(main,model);assert.equal(scans,1,'Exactly one combined DOM scan per pass');checks++;
for(const id of ids){assert.equal(lookup(id),old(id),'Original first-match/priority semantics: '+id);checks++;}
assert.equal(lookup('shared'),first);assert.equal(lookup('physical'),physical);assert.equal(lookup('group'),heading);assert.equal(lookup('character-route'),character);checks++;
const previous=scans;for(let i=0;i<100;i++)for(const id of ids)lookup(id);assert.equal(scans,previous,'Repeated geometry lookups never rescan DOM');checks++;
// Replacement and reordering are observed by the next pass, never a long-lived cache.
tree=[character,physicalDuplicate,second,headingDuplicate];lookup=createContentsSectionLookup(main,model);
for(const id of ids){assert.equal(lookup(id),old(id),'Fresh replacement semantics: '+id);checks++;}
assert.equal(lookup('shared'),second);assert.equal(lookup('physical'),physicalDuplicate);assert.equal(lookup('group'),headingDuplicate);checks++;
const wrongLast=node('mutated last match',{cardId:'shared'});tree=[first,wrongLast];lookup=createContentsSectionLookup(main,model);
assert.throws(()=>assert.equal(lookup('shared'),wrongLast),assert.AssertionError,'Last-match mutation is rejected');checks++;
tree=[];lookup=createContentsSectionLookup(main,model);assert.equal(lookup('shared'),null);assert.equal(lookup('physical'),null);checks++;
assert.throws(()=>assert.equal(lookup('shared'),first),assert.AssertionError,'Stale detached-node mutation is rejected');checks++;
const bare={querySelector:()=>null,querySelectorAll:()=>[]};assert.equal(createContentsSectionLookup(bare,model)('start'),bare);checks++;
// Exercise the actual controller hook lifetime, including failure cleanup.
const priorDocument=globalThis.document,priorWindow=globalThis.window;let started=0,finished=0,inside=false;
globalThis.window={scrollY:0};globalThis.document={documentElement:{style:{setProperty(){}}}};
try{
 const controller={destroyed:false,adapter:{beforeGeometry(){started++;inside=true;},afterGeometry(){finished++;inside=false;},range(){assert(inside);return {top:0,bottom:1};}},header:{getBoundingClientRect:()=>({bottom:10})},geometry:{},items:[{}],readViewport(){assert(inside);}};
 NavigationController.prototype.refreshGeometry.call(controller);assert.equal(started,1);assert.equal(finished,1);assert(!inside);checks++;
 controller.adapter.range=()=>{throw new Error('layout failed');};assert.throws(()=>NavigationController.prototype.refreshGeometry.call(controller),/layout failed/);assert.equal(started,2);assert.equal(finished,2);assert(!inside,'Failed geometry cannot retain a stale DOM index');checks++;
 controller.destroyed=true;NavigationController.prototype.refreshGeometry.call(controller);assert.equal(started,2);checks++;
}finally{if(priorDocument===undefined)delete globalThis.document;else globalThis.document=priorDocument;if(priorWindow===undefined)delete globalThis.window;else globalThis.window=priorWindow;}
console.log(JSON.stringify({status:'PASS',checks}));
