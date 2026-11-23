/** Fresh per-pass lookups must agree with the original live DOM scan. */
import assert from 'node:assert/strict';
import {createContentsSectionLookup,createContentsSectionCache} from './navigation-v1.mjs';
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

// Additional identity-cache regressions; all original checks above
// remain unchanged and still exercise the fresh, independent lookup factory.
let cacheChecks=0,domScans=0,leafQueries=0;
const identitySelector='[data-contents-target],[data-roster-instance-id],[data-card-id]';
class CacheElement{
  constructor(name,dataset={},children=[]){this.nodeType=1;this.name=name;this.dataset={...dataset};this.children=children;this.hero=false;}
  get firstElementChild(){return this.children.find(child=>child.nodeType===1)||null;}
  matches(selector){return selector===identitySelector?['contentsTarget','rosterInstanceId','cardId'].some(key=>Object.hasOwn(this.dataset,key)):selector==='.v2-hero'&&this.hero;}
  querySelectorAll(selector){const descendants=[];const visit=node=>{for(const child of node.children||[]){if(child.nodeType!==1)continue;descendants.push(child);visit(child);}};visit(this);if(this===cacheMain)domScans++;return descendants.filter(node=>node.matches(selector));}
  querySelector(selector){if(!this.firstElementChild)leafQueries++;return this.querySelectorAll(selector)[0]||null;}
}
class CacheObserver{
  constructor(callback){this.callback=callback;this.records=[];this.disconnected=false;CacheObserver.last=this;}
  observe(target,options){this.target=target;this.options=options;}
  takeRecords(){return this.records.splice(0);}
  disconnect(){this.disconnected=true;this.records=[];}
  deliver(records){this.callback(records);}
}
const cacheHero=new CacheElement('hero');cacheHero.hero=true;
const cacheHeading=new CacheElement('heading',{contentsTarget:'group'});
const cacheFirst=new CacheElement('first canonical',{cardId:'shared'});
const cacheSecond=new CacheElement('second canonical',{cardId:'shared'});
const cachePhysical=new CacheElement('physical',{rosterInstanceId:'unit-a',cardId:'bodyguard'});
const cacheOther=new CacheElement('other canonical',{cardId:'other'});
const cacheMain=new CacheElement('main',{},[cacheHero,cacheHeading,cacheFirst,cacheSecond,cachePhysical,cacheOther]);
const cacheModel={nodes:new Map([['physical-route',{instanceId:'unit-a',canonicalId:'shared'}],['canonical-route',{canonicalId:'shared'}]]),groups:new Map([['group',['shared']]])};
const identityCache=createContentsSectionCache(cacheMain,cacheModel,{MutationObserver:CacheObserver}),cacheObserver=CacheObserver.last;
const childMutation=(addedNodes=[],removedNodes=[])=>({type:'childList',addedNodes,removedNodes});
const attrMutation=attributeName=>({type:'attributes',attributeName});
assert.deepEqual(cacheObserver.options,{childList:true,subtree:true,attributes:true,attributeFilter:['data-contents-target','data-roster-instance-id','data-card-id']});cacheChecks++;
assert.equal(identityCache.resolve('group'),cacheHeading);assert.equal(identityCache.resolve('physical-route'),cachePhysical);assert.equal(identityCache.resolve('canonical-route'),cacheFirst);cacheChecks++;
const firstCacheScans=domScans;
for(let pass=0;pass<100;pass++){const snapshot=identityCache.snapshot();assert.equal(snapshot('shared'),cacheFirst);assert.equal(identityCache.resolve('physical-route'),cachePhysical);}
assert.equal(domScans,firstCacheScans,'Unchanged identity DOM is indexed once across geometry passes and direct calls');cacheChecks++;
const leafAnchor=new CacheElement('glossary anchor'),plainText={nodeType:3};
cacheObserver.records.push(childMutation([leafAnchor,plainText],[plainText]));
const beforeLeafQueries=leafQueries;
assert.equal(identityCache.resolve('shared'),cacheFirst);assert.equal(domScans,firstCacheScans,'Prose-only mutations do not rebuild identity maps');assert.equal(leafQueries,beforeLeafQueries,'Text and leaf anchors never issue subtree identity queries');cacheChecks++;

// No observer callback delivery occurs before the immediate direct lookup.
cacheFirst.dataset.cardId='retired';cacheObserver.records.push(attrMutation('data-card-id'));
assert.equal(identityCache.resolve('shared'),cacheSecond,'Pending synchronous identity changes are drained before direct lookup');assert(domScans>firstCacheScans);cacheChecks++;
const changedScans=domScans;
cachePhysical.dataset.rosterInstanceId='unit-b';cacheObserver.records.push(attrMutation('data-roster-instance-id'));
assert.equal(identityCache.snapshot()('physical-route'),null,'Pending physical identity change is drained before a geometry snapshot');assert(domScans>changedScans);cacheChecks++;
cacheHeading.dataset.contentsTarget='retired-group';cacheObserver.records.push(attrMutation('data-contents-target'));
assert.equal(identityCache.resolve('group'),cacheSecond,'Removed explicit heading returns to canonical group priority');cacheChecks++;

const nestedFirst=new CacheElement('nested canonical',{cardId:'shared'}),wrapper=new CacheElement('wrapper',{},[nestedFirst]);
cacheMain.children.unshift(wrapper);cacheObserver.records.push(childMutation([wrapper]));
assert.equal(identityCache.resolve('shared'),nestedFirst,'Inserted nested identities override later duplicates immediately');cacheChecks++;
cacheMain.children.shift();cacheObserver.records.push(childMutation([],[wrapper]));
assert.equal(identityCache.resolve('shared'),cacheSecond,'Removing an ancestor invalidates its nested identity');cacheChecks++;
cacheFirst.dataset.cardId='shared';cacheMain.children.splice(cacheMain.children.indexOf(cacheFirst),1);cacheMain.children.push(cacheFirst);
cacheObserver.records.push(attrMutation('data-card-id'),childMutation([cacheFirst],[cacheFirst]));
assert.equal(identityCache.resolve('shared'),cacheSecond,'Last duplicate never replaces the first match');cacheChecks++;
cacheMain.children.splice(cacheMain.children.indexOf(cacheFirst),1);cacheMain.children.unshift(cacheFirst);cacheObserver.deliver([childMutation([cacheFirst],[cacheFirst])]);
assert.equal(identityCache.resolve('shared'),cacheFirst,'Delivered reorder mutations also refresh first-in-DOM priority');cacheChecks++;
const newHeading=new CacheElement('new explicit heading',{contentsTarget:'group',cardId:'other'});
cacheMain.children.push(newHeading);cacheObserver.records.push(childMutation([newHeading]));
assert.equal(identityCache.resolve('group'),newHeading,'Explicit heading beats canonical fallback even when later in DOM');cacheChecks++;
delete newHeading.dataset.contentsTarget;cacheObserver.records.push(attrMutation('data-contents-target'));
assert.equal(identityCache.resolve('group'),cacheFirst,'Removing a heading attribute invalidates its former identity');cacheChecks++;
newHeading.dataset.contentsTarget='group';cacheObserver.records.push(attrMutation('data-contents-target'));
assert.equal(identityCache.resolve('group'),newHeading,'Adding a heading attribute restores heading priority');cacheChecks++;

const replacementModel={nodes:new Map([['canonical-route',{canonicalId:'other'}]]),groups:new Map()};
identityCache.setModel(replacementModel);assert.equal(identityCache.resolve('canonical-route'),cacheOther,'A replacement model cannot retain a closure over the old routing maps');cacheChecks++;
const modelScans=domScans;replacementModel.nodes.set('canonical-route',{canonicalId:'shared'});identityCache.setModel(replacementModel);
assert.equal(identityCache.resolve('canonical-route'),cacheFirst);assert(domScans>modelScans,'Model refresh invalidates even with the same object identity');cacheChecks++;
const nextHero=new CacheElement('replacement hero');nextHero.hero=true;cacheHero.hero=false;cacheMain.children.push(nextHero);
const heroScans=domScans;assert.equal(identityCache.resolve('start'),nextHero,'Start follows live hero class changes without an identity mutation');assert.equal(domScans,heroScans+1,'Start performs only its live hero query and no identity rebuild');cacheChecks++;
nextHero.hero=false;assert.equal(identityCache.snapshot()('start'),cacheMain,'Missing hero falls back to main');cacheChecks++;

identityCache.setModel({nodes:new Map(),groups:new Map()});assert.equal(identityCache.resolve('canonical-route'),null,'Clearing the model drops former route ownership');cacheChecks++;
const beforeDestroy=identityCache.snapshot();identityCache.destroy();identityCache.destroy();cacheObserver.deliver([attrMutation('data-card-id')]);
assert(cacheObserver.disconnected);assert.equal(identityCache.resolve('shared'),null);assert.equal(beforeDestroy('shared'),null);assert.equal(identityCache.snapshot()('shared'),null,'Disposed snapshots do not retain an observable detached target');cacheChecks++;

const fallback=createContentsSectionCache(cacheMain,cacheModel,{MutationObserver:null});assert.equal(fallback.resolve('shared'),cacheFirst);
cacheMain.children.splice(cacheMain.children.indexOf(cacheFirst),1);
assert.equal(fallback.resolve('shared'),cacheSecond,'Without MutationObserver every new lookup sees current DOM');cacheChecks++;
const fallbackScans=domScans,fallbackSnapshot=fallback.snapshot(),afterFallbackSnapshot=domScans;
for(let n=0;n<100;n++)assert.equal(fallbackSnapshot('shared'),cacheSecond);
assert.equal(afterFallbackSnapshot,fallbackScans+2,'Fallback snapshot performs one identity scan and one hero query');assert.equal(domScans,afterFallbackSnapshot,'A single fallback geometry pass still shares its fresh snapshot');cacheChecks++;
fallback.destroy();
let lifecycleDispose,forgotten=0;
const lifecycleCache=createContentsSectionCache(cacheMain,cacheModel,{MutationObserver:CacheObserver,lifecycle:{cleanup(callback){lifecycleDispose=callback;return ()=>forgotten++;}}});
const lifecycleObserver=CacheObserver.last;assert.equal(lifecycleCache.resolve('shared'),cacheSecond);lifecycleDispose();
assert(lifecycleObserver.disconnected);assert.equal(lifecycleCache.resolve('shared'),null);assert.equal(forgotten,1);cacheChecks++;
console.log(JSON.stringify({status:'PASS',cacheChecks}));
