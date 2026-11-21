import assert from 'node:assert/strict';
import {createLifecycle} from './lifecycle.mjs';
import {createVisibleUnitArtLoader} from './datasheet-v1-layout.mjs';

let watcher;
class IntersectionObserver {
  constructor(callback, options) {
    this.callback=callback;this.options=options;this.targets=new Set();this.disconnected=false;watcher=this;
  }
  observe(target) { this.targets.add(target); }
  unobserve(target) { this.targets.delete(target); }
  disconnect() { this.targets.clear();this.disconnected=true; }
  notify(target, {intersects=false,width=0,height=0}={}) {
    this.callback([{target,isIntersecting:intersects,intersectionRect:{width,height}}]);
  }
}
const view={IntersectionObserver},lifecycle=createLifecycle(view);
const sources=[];
const image=()=>({width:1200,height:1600,alt:'',dataset:{},isConnected:false,
  visible:true,getClientRects(){return this.visible?[{width:100,height:140}]:[];},
  set src(value){sources.push({image:this,url:value,loading:this.loading,decoding:this.decoding});}});
const load=createVisibleUnitArtLoader(view,{lifecycle}),first=image(),second=image();
load(first,'https://example.invalid/first.png');load(second,'https://example.invalid/second.png');
assert.equal(sources.length,0,'Constructing a book must not request any unit art');
assert.equal(watcher.targets.size,2,'One shared observer must watch both images');
assert.deepEqual(watcher.options,{rootMargin:'0px',threshold:0},'Art must not preload outside the viewport');
assert.deepEqual([first.width,first.height],[1200,1600],'Placeholder dimensions changed');
watcher.notify(first,{intersects:true,width:100,height:140});
assert.equal(sources.length,0,'Detached images must remain deferred');
first.isConnected=true;
watcher.notify(first);
watcher.notify(first,{intersects:true,width:0,height:140});
assert.equal(sources.length,0,'Offscreen or zero-area intersections must remain deferred');
first.visible=false;watcher.notify(first,{intersects:true,width:100,height:140});
assert.equal(sources.length,0,'A stale intersection must not load a hidden image');
first.visible=true;watcher.notify(first,{intersects:true,width:100,height:140});
assert.equal(sources.length,1);assert.equal(sources[0].url,'https://example.invalid/first.png');
assert.equal(sources[0].loading,'lazy');assert.equal(sources[0].decoding,'async');
assert.equal(first.dataset.unitArtState,'loading');assert(!watcher.targets.has(first));
assert.deepEqual([first.width,first.height],[1200,1600],'Loading changed reserved geometry');
watcher.notify(first,{intersects:true,width:100,height:140});
assert.equal(sources.length,1,'A visible image must be requested only once');
second.isConnected=true;lifecycle.destroy();
watcher.notify(second,{intersects:true,width:100,height:140});
assert.equal(sources.length,1,'A destroyed presentation must not issue a late request');
assert.equal(watcher.disconnected,true,'Presentation cleanup must disconnect the observer');
load(image(),'https://example.invalid/after-dispose.png');
assert.equal(watcher.targets.size,0,'A destroyed loader must not retain new images');

const fallback=image();createVisibleUnitArtLoader({})(fallback,'https://example.invalid/fallback.png');
assert.equal(sources.length,2);assert.equal(sources[1].loading,'lazy','Fallback must set lazy before src');
const revision='0123456789abcdef';
const taggedLoad=createVisibleUnitArtLoader({IntersectionObserver,WHPwaExpectedRevision:revision,location:{href:'https://example.invalid/preview/v2/app.html'}});
const cases=[
  ['/preview/books/example/assets/unit.png','https://example.invalid/preview/books/example/assets/unit.png?wh-pwa='+revision],
  ['https://example.invalid/preview/books/example/assets/unit.png?wh-pwa='+revision,'https://example.invalid/preview/books/example/assets/unit.png?wh-pwa='+revision],
  ['https://example.invalid/preview/books/example/assets/unit.png?wh-pwa=fedcba9876543210','https://example.invalid/preview/books/example/assets/unit.png?wh-pwa=fedcba9876543210'],
  ['https://outside.invalid/preview/unit.png','https://outside.invalid/preview/unit.png'],
  ['https://example.invalid/another-app/unit.png','https://example.invalid/another-app/unit.png']
];
for(const [url,expected]of cases){const art=image();art.isConnected=true;taggedLoad(art,url);watcher.notify(art,{intersects:true,width:100,height:140});assert.equal(sources.at(-1).url,expected,'Publication tag mismatch for '+url);}
const invalidRevision=image();createVisibleUnitArtLoader({WHPwaExpectedRevision:'not-a-revision',location:{href:'https://example.invalid/preview/v2/app.html'}})(invalidRevision,'../unit.png');
assert.equal(sources.at(-1).url,'../unit.png','Unknown revision must retain the original URL');
console.log('PASS unit art visibility: deferred, visible once, stable dimensions, lifecycle cleanup, scoped revision tags');
