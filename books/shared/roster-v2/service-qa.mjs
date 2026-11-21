import assert from 'node:assert/strict';
import {createRosterService,isSharedRosterService,rosterImportBindings,retainRosterBearerBindings,rejectRosterImport} from './runtime.mjs';

// This fixture tests orchestration, not a replacement gameplay interpreter.
const candidate={bookId:'service-fixture',rosterId:'same',units:[],attachments:[]};
let generation=0,preparedLoads=0,proofLoads=0;
const owner=(state=null)=>{let publishedGeneration=generation;return {catalog:[],get state(){return structuredClone(state);},
  get projection(){return state?{generation:publishedGeneration}:null;},
  load(next){if(next.reject)throw new TypeError('Owner admission rejected');state=structuredClone(next);publishedGeneration=++generation;return this.state;},
  snapshot(){return structuredClone(state);},draft:text=>({text}),context:(...args)=>args,
  effective:id=>({id}),related:id=>[{id,state:'UNKNOWN'}],candidates:id=>[id],
  attach:(...args)=>args,detach:(...args)=>args,reattach:(...args)=>args};};
const first=owner();
const service=createRosterService({runtime:first,
  importCandidate:(text,choices)=>text==='pending'?{status:'NEEDS_BINDINGS',roster:null}:
    {status:'READY',roster:{...candidate,rosterId:text==='changed'?'changed':'same'}},
  prepareRuntime(snapshot){preparedLoads++;const next=owner();next.load(snapshot);
    if(snapshot.rejectAfterPreparation)throw new TypeError('Owner post-calculation rejection');return next;},
  view:(current,service)=>({recompute:()=>service.load(service.snapshot())})});
assert(isSharedRosterService(service));assert(!isSharedRosterService(first));
assert.deepEqual(service.draft('raw'),{text:'raw'});
assert.equal(service.import('pending').status,'NEEDS_BINDINGS');assert.equal(service.state,null);
assert.equal(service.import('same').status,'READY');assert.equal(preparedLoads,1);
const before=service.snapshot(),projection=service.projection;
assert.equal(service.import('changed').status,'REPLACEMENT_REQUIRED');assert.deepEqual(service.snapshot(),before);
assert.throws(()=>service.load({...candidate,reject:true}),/Owner admission rejected/);
assert.deepEqual(service.snapshot(),before);assert.deepEqual(service.projection,projection);
assert.throws(()=>service.load({...candidate,rejectAfterPreparation:true}),/post-calculation rejection/);
assert.deepEqual(service.snapshot(),before);assert.deepEqual(service.projection,projection);
assert.equal(service.import('changed',{}, {replaceExisting:true}).status,'READY');
assert.equal(service.state.rosterId,'changed');
assert.deepEqual(service.attach('leader','bodyguard'),['leader','bodyguard']);
assert.deepEqual(service.reattach('leader','other'),['leader','other']);
assert.deepEqual(service.related('unit'),[{id:'unit',state:'UNKNOWN'}]);
const bindings=rosterImportBindings({enhancementBearers:{'["unit","rule"]':'scope'}});
assert.deepEqual(bindings,{modelBearers:{unit:{rule:'scope'}}});
const state={units:[{instanceId:'unit',enhancementAssignments:[{enhancementId:'rule',modelScopeId:'scope'}]}]};
assert(retainRosterBearerBindings({status:'NEEDS_BINDINGS',candidateRoster:state,needsBindings:[{kind:'ENHANCEMENT_BEARER'}]},state,bindings,JSON.stringify));
assert(!retainRosterBearerBindings({status:'NEEDS_BINDINGS',candidateRoster:state,needsBindings:[{kind:'WEAPON'}]},state,bindings,JSON.stringify));
const proven=owner(candidate);
const proofService=createRosterService({runtime:owner(),importCandidate:()=>({status:'READY',roster:candidate}),
  prepareImport(result){const bytes=JSON.stringify(result.roster);return next=>{
    if(JSON.stringify(next)!==bytes)return null;proofLoads++;return proven;
  };}});
proofService.import('same');assert.equal(proofLoads,1);assert.deepEqual(proofService.state,candidate);
proofService.load({...candidate,attachments:[{leaderInstanceId:'leader',bodyguardInstanceId:'bodyguard'}]});
proofService.import('same');assert.equal(proofLoads,1,'A retained attachment graph cannot reuse the original import proof');
assert.equal(proofService.snapshot().attachments.length,1);
assert.throws(()=>createRosterService({runtime:owner(),view:()=>({load(){}})}),/cannot replace the shared service lifecycle/);
const caught=createRosterService({runtime:owner(),importCandidate(){throw new Error('Native import error');},
  importError:error=>({status:'INVALID',message:error.message})});
assert.deepEqual(caught.import('bad'),{status:'INVALID',message:'Native import error'});
const thrown=createRosterService({runtime:owner(),importCandidate(){throw new Error('Native import error');}});
assert.throws(()=>thrown.import('bad'),/Native import error/);
assert.throws(()=>rejectRosterImport({status:'READY',roster:candidate}),/require the canonical commit/);
const terminal=createRosterService({runtime:owner(),importCandidate:()=>rejectRosterImport({status:'INVALID',errors:['Native rejection']})});
assert.deepEqual(terminal.import('bad',{}, {replaceExisting:'invalid'}),{status:'INVALID',errors:['Native rejection']});
console.log(JSON.stringify({status:'PASS',checks:['shared contract membership','pending admission',
  'replacement confirmation','prepared-generation rollback','post-calculation rollback','attachment argument direction',
  'UNKNOWN preservation','explicit bearer mapping','source-qualified retry',
  'validated runtime reuse','retained graph invalidates import proof','owner view cannot bypass lifecycle',
  'owner-specific return-versus-throw errors','native early rejection boundary','READY cannot bypass commit']}));
