/** Decoration waits for a real first display; canonical matching stays shared. */
import assert from 'node:assert/strict';
import {createRuleTermLinker,createVisibleRuleTermLinks,onlyRuleTermDecorations} from './rule-term-links.mjs';
let checks=0;
class Element {
  constructor({boundary=false,id,title,parent=null}={}){this.boundary=boundary;this.dataset={...(id?{cardId:id}:{}),...(title?{ruleTermTitle:title}:{})};this.parentElement=parent;this.isConnected=true;}
  closest(selector){for(let node=this;node;node=node.parentElement){if(selector.startsWith('.unit-card')?node.boundary:node.dataset.cardId||node.dataset.ruleTermTitle)return node;}return null;}
  contains(other){for(let node=other;node;node=node.parentElement)if(node===this)return true;return false;}
  getBoundingClientRect(){const top=this.top||0,height=this.height||100;return {width:100,height,top,bottom:top+height,left:0,right:100};}
}
let observer;
class Observer {
  constructor(callback){this.callback=callback;this.observed=new Set();observer=this;}
  observe(node){this.observed.add(node);}
  unobserve(node){this.observed.delete(node);}
  disconnect(){this.observed.clear();}
  emit(target,isIntersecting=true){this.callback([{target,isIntersecting}]);}
}
const make=(ObserverType=Observer,options={})=>{
  const calls=[],layouts=[],cleanups=[],frames=new Map(),listeners=new Map();let frameId=0;
  const lifecycle={active:true,cleanup:callback=>cleanups.push(callback),frame:callback=>{const id=++frameId;frames.set(id,callback);return id;},cancelFrame:id=>frames.delete(id),listen:(target,type,callback)=>listeners.set(type,callback)};
  const manager=createVisibleRuleTermLinks({document:{defaultView:{IntersectionObserver:ObserverType,innerWidth:390,innerHeight:844}},cards:new Map([['parent',{title:'Original parent'}],['child',{title:'Original child'}]]),linker:{link:(root,options)=>{calls.push({root,options});if(root.grow)options.boundary.height=150;}},lifecycle,onLayout:boundary=>layouts.push(boundary),...options});
  return {calls,layouts,manager,lifecycle,frames,scroll:()=>listeners.get('scroll')?.(),runFrame:()=>{const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback());},destroy:()=>{lifecycle.active=false;cleanups.forEach(callback=>callback());}};
};
const {manager,calls,destroy}=make(),page=new Element(),parent=new Element({id:'parent',boundary:true,parent:page}),child=new Element({id:'child',boundary:true,parent}),prose=new Element({parent:child}),detached=new Element();
manager.defer(prose);manager.defer(child);manager.defer(parent);manager.defer(detached);
assert.equal(calls.length,0,'Building the complete book never scans prose');checks++;
manager.mount(page);
assert.equal(calls.length,0,'Mounting offscreen cards never scans prose');checks++;
assert.equal(child.dataset.ruleTermState,'pending');assert.equal(parent.dataset.ruleTermState,'pending','Only actual pending groups receive presentation markers');checks++;
assert.deepEqual([...observer.observed],[child,parent],'One observer target per card, detached leftovers discarded');checks++;
observer.emit(parent,false);assert.equal(calls.length,0,'Non-visible observer records do not activate a card');checks++;
observer.emit(parent);assert.equal(calls.length,1);assert.equal(calls[0].root,parent,'Showing a parent does not process nested unseen cards');checks++;
assert.equal(parent.dataset.ruleTermState,'ready');assert.equal(child.dataset.ruleTermState,'pending','A completed group becomes ready without activating its children');checks++;
assert(!observer.observed.has(parent));assert(observer.observed.has(child));checks++;
observer.emit(child);assert.deepEqual(calls.slice(1).map(call=>call.root),[prose,child],'Original presenter order is retained inside each shown card');checks++;
assert(calls.slice(1).every(call=>call.options.boundary===child));checks++;
assert.equal(calls[1].options.outsideTitle,'Original child','Title context is captured before DOM reparenting');checks++;
assert.equal(calls[1].options.ownerRoot,prose);checks++;
observer.emit(child);assert.equal(calls.length,3,'Repeat intersections cannot add links again');checks++;
const late=new Element({parent:child});manager.defer(late);manager.mount(page,child);assert.equal(calls.length,4,'Explicit Contents targets are ready before geometry is measured');checks++;
const replacement=new Element({id:'child',boundary:true,parent:page});manager.defer(replacement);manager.mount(page);manager.reset();observer.emit(replacement);assert.equal(calls.length,4,'Reset discards work from replaced views');assert.equal(observer.observed.size,0);checks++;
assert.equal(replacement.dataset.ruleTermState,undefined,'Reset removes stale pending state instead of claiming decoration completed');checks++;
manager.defer(child);manager.mount(page);child.isConnected=false;observer.emit(child);assert.equal(calls.length,4,'Removed cards cannot acquire links');checks++;
destroy();child.isConnected=true;observer.emit(child);assert.equal(calls.length,4,'Destroyed mounts cannot acquire links');assert.equal(observer.observed.size,0);checks++;
const fallback=make(null);fallback.manager.defer(parent);fallback.manager.mount(page);assert.equal(fallback.calls.length,1,'Browsers without an observer retain canonical links');fallback.destroy();checks++;
const changed=make(),resized=new Element({boundary:true,parent:page});resized.grow=true;changed.manager.defer(resized);changed.manager.mount(page);observer.emit(resized);assert.deepEqual(changed.layouts,[resized],'Real first-show size changes still remeasure navigation');changed.destroy();checks++;
let allowed=false;const controlled=make(Observer,{canReveal:()=>allowed,viewportTop:()=>120}),passing=new Element({boundary:true,parent:page});passing.top=150;
controlled.manager.defer(passing);controlled.manager.mount(page);observer.emit(passing);assert.equal(controlled.calls.length,0,'Transient controlled-scroll intersections stay queued');assert.equal(controlled.frames.size,1);checks++;
controlled.runFrame();assert.equal(controlled.calls.length,0);assert.equal(controlled.frames.size,1,'Blocked work owns only one pending frame');checks++;
allowed=true;controlled.runFrame();assert.equal(controlled.calls.length,1,'Settled or cancelled scrolling flushes the current visible card');assert.equal(controlled.frames.size,0);observer.emit(passing);assert.equal(controlled.calls.length,1,'Stable viewport decoration occurs once');checks++;
const hidden=new Element({boundary:true,parent:page});hidden.top=1000;allowed=false;controlled.manager.defer(hidden);controlled.manager.mount(page);observer.emit(hidden);allowed=true;controlled.runFrame();assert.equal(controlled.calls.length,1,'A passed-over card outside the final viewport is never scanned');assert.equal(controlled.frames.size,0);checks++;
hidden.top=0;controlled.scroll();controlled.runFrame();assert.equal(controlled.calls.length,1,'A card covered by the sticky header is never scanned');checks++;
hidden.top=150;controlled.scroll();controlled.runFrame();assert.equal(controlled.calls.length,2,'Manual scrolling reveals previously covered pending prose');checks++;
const destination=new Element({boundary:true,parent:page});allowed=false;controlled.manager.defer(destination);controlled.manager.mount(page,destination);assert.equal(controlled.calls.length,3,'The explicit destination is decorated before controlled-scroll geometry');checks++;
const abandoned=new Element({boundary:true,parent:page});abandoned.top=150;controlled.manager.defer(abandoned);controlled.manager.mount(page);observer.emit(abandoned);assert.equal(controlled.frames.size,1);controlled.manager.reset();assert.equal(controlled.frames.size,0,'Route replacement cancels the pending reveal frame');observer.emit(abandoned);assert.equal(controlled.calls.length,3);checks++;
controlled.manager.defer(abandoned);controlled.manager.mount(page);observer.emit(abandoned);assert.equal(controlled.frames.size,1);controlled.destroy();assert.equal(controlled.frames.size,0,'Destroy cancels the pending reveal frame');observer.emit(abandoned);controlled.scroll();assert.equal(controlled.frames.size,0);assert.equal(controlled.calls.length,3,'Destroyed views cannot schedule or decorate');checks++;
let inventoryReads=0;const index={get entries(){inventoryReads++;return [];}};
const linker=createRuleTermLinker({document:{},cards:new Map(),index,anchor:()=>{}});
assert.equal(inventoryReads,0,'Constructing a linker alone does not compile the vocabulary');checks++;
assert.equal(linker.matcher,linker.matcher);assert.equal(inventoryReads,1,'The existing exact matcher is compiled at most once per mount');checks++;
linker.prepare();linker.prepare();assert.equal(inventoryReads,1);assert.deepEqual(linker.counts,{links:0,textNodes:0,byTarget:Object.create(null)},'Preparing the vocabulary reads no page prose and places no links');checks++;
const text={nodeType:3,nodeValue:'Deep Strike',textContent:'Deep Strike'},link={nodeType:1,textContent:'Deep Strike',matches:selector=>selector==='a.rule-term-link'},other={nodeType:1,matches:()=>false};
const decoration={type:'childList',removedNodes:[text],addedNodes:[link]};
assert(onlyRuleTermDecorations([decoration]));checks++;
for(const records of [[],[{...decoration,removedNodes:[]}],[{...decoration,removedNodes:[other]}],[{...decoration,addedNodes:[text]}],[{...decoration,addedNodes:[link,other]}],[{...decoration,type:'attributes'}],[decoration,{...decoration,addedNodes:[other]}],[{...decoration,addedNodes:[{...link,textContent:'Changed prose'}]}]]){
  assert(!onlyRuleTermDecorations(records),'Real or mixed layout mutations still require navigation geometry');checks++;
}
console.log(JSON.stringify({status:'PASS',checks}));
