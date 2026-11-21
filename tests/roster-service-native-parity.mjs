/** Strict service observations from independently loaded immutable checkouts.
 * Fixtures and selected bindings are explicit QA inputs, never application defaults.
 * No source translation, renderer, interpreter or condition reader is mocked. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

const args=process.argv.slice(2),value=name=>args[args.indexOf(name)+1];
const root=path.resolve(value('--root')),out=value('--out'),compare=args.includes('--compare')?value('--compare'):null;
const selected=new Set(value('--books').split(',')),fixtures=JSON.parse(fs.readFileSync(value('--fixtures'),'utf8'));
const load=file=>import(pathToFileURL(path.join(root,file)));
const boots=Object.fromEntries(fixtures.bookIds.map(id=>[id,`books/${id}/v2/${id==='adeptus-mechanicus'?'roster-runtime':'roster-boot'}.mjs`]));
const originalFetch=globalThis.fetch;
const read=async url=>{
  const parsed=new URL(url);if(parsed.protocol!=='file:')return originalFetch(url);
  const bytes=fs.readFileSync(fileURLToPath(parsed));return {ok:true,json:async()=>JSON.parse(bytes),text:async()=>bytes.toString()};
};
globalThis.fetch=read;
const encode=value=>JSON.stringify(value,(_key,item)=>item instanceof Set?[...item]:item);
const clone=value=>JSON.parse(encode(value));
const attempt=action=>{try{return {value:action()};}catch(error){return {error:{name:error.name,message:error.message}};}};
const observations=[],timings=[],integration=[];
const shared=await load('books/shared/roster-v2/runtime.mjs');
function observe(service){
  const state=service.state,projection=service.projection;
  if(!state)return {state,projection,snapshot:attempt(()=>service.snapshot())};
  return clone({state,projection,snapshot:service.snapshot(),
    groups:'groups' in service?service.groups:projection?.formedUnits||[],
    points:service.points,chapterContexts:service.chapterContexts,
    units:state.units.map(unit=>({instanceId:unit.instanceId,
      candidates:attempt(()=>service.candidates(unit.instanceId)),
      context:attempt(()=>service.context(unit.instanceId)),
      models:projection.units.find(row=>row.instanceId===unit.instanceId)?.profiles.map(model=>({scopeId:model.scopeId,
        context:attempt(()=>service.context(unit.instanceId,'MODEL',model.scopeId))})),
      effective:attempt(()=>service.effective(unit.instanceId)),related:attempt(()=>service.related(unit.instanceId)),
      sourceChoices:service.sourceChoices?.(unit.instanceId),modelScopes:service.modelScopes?.(unit.instanceId),
      chapterContext:service.chapterContext?.(unit.instanceId)}))});
}
const ordered=fixtures.cases.filter(row=>selected.has(row.bookId)).sort((a,b)=>a.bookId<b.bookId?-1:a.bookId>b.bookId?1:a.id<b.id?-1:a.id>b.id?1:0);
try{for(const fixture of ordered){
  const module=await load(boots[fixture.bookId]);
  const start=performance.now(),service=await module.createBrowserRoster({fetch:read});
  const initMs=performance.now()-start;
  integration.push({bookId:fixture.bookId,id:fixture.id,shared:shared.isSharedRosterService?.(service)||false});
  const frames=[],returns=[],na=[];
  const frame=phase=>frames.push({phase,value:observe(service)});
  const rejected=(phase,action)=>{
    const before=observe(service),result=attempt(action);
    assert(result.error||result.value?.status&&result.value.status!=='READY',phase+' was accepted');
    assert.deepEqual(observe(service),before,phase+' changed published observations');
    returns.push({phase,...clone(result)});
  };
  frame('fresh');returns.push({phase:'draft',...clone(attempt(()=>service.draft(fixture.text)))});
  const choices=structuredClone(fixture.bindings||{});
  let began=performance.now(),result=service.import(fixture.text,choices),importMs=performance.now()-began;
  returns.push({phase:'import',result:clone(result)});frame('imported');
  if(result.status!=='READY'){na.push('No READY snapshot from this explicit fixture; subsequent physical operations are not reached.');
    observations.push({bookId:fixture.bookId,id:fixture.id,returns,frames,na});console.log('PENDING '+fixture.bookId+' '+fixture.id);continue;}
  const imported=service.snapshot();
  for(const edge of fixture.attachments||[]){const state=service.state;
    returns.push({phase:'attach-explicit',result:clone(service.attach(state.units[edge.leaderOrdinal-1].instanceId,state.units[edge.bodyguardOrdinal-1].instanceId))});frame('attached/'+edge.leaderOrdinal);}
  if(!fixture.attachments?.length){let pair;
    for(const unit of service.state.units){const candidates=attempt(()=>service.candidates(unit.instanceId)).value;
      if(candidates?.length){pair={leader:unit.instanceId,bodyguard:candidates[0].instanceId};break;}}
    if(pair){returns.push({phase:'attach-validated-test-candidate',pair,result:clone(service.attach(pair.leader,pair.bodyguard))});frame('attached');}
    else na.push('No validated attachment candidate in this physical fixture.');
  }
  if(fixture.initialAttachments){const state=service.snapshot();state.initialAttachments=structuredClone(state.attachments);service.load(state);frame('initial-history');}
  for(const choice of [...(fixture.sourceChoices||[]),...(fixture.sourceChoice?[fixture.sourceChoice]:[])]){
    returns.push({phase:'explicit-source-choice',choice,result:clone(service.setSourceChoice(choice.source,choice.ruleId,choice.value))});frame('source-choice/'+choice.source);
  }
  let saved=service.snapshot();began=performance.now();service.load(saved);const loadMs=performance.now()-began;frame('reloaded');
  returns.push({phase:'identical-reimport',...clone(attempt(()=>service.import(fixture.text,choices)))});frame('reimported');
  service.load(saved);
  if(saved.attachments.length){const edge=saved.attachments[0];
    service.detach(edge.leaderInstanceId);frame('detached');service.reattach(edge.leaderInstanceId,edge.bodyguardInstanceId);frame('reattached');service.load(saved);
  }
  rejected('foreign-unit',()=>{const bad=structuredClone(saved);bad.units[0].canonicalUnitId='i4-foreign-unit';return service.load(bad);});
  if(saved.units[0].modelRows?.length)rejected('foreign-model-profile',()=>{const bad=structuredClone(saved);bad.units[0].modelRows[0].canonicalProfileId='i4-foreign-model';return service.load(bad);});
  rejected('foreign-enhancement',()=>{const bad=structuredClone(saved);bad.units[0].enhancementIds.push('i4-foreign-enhancement');return service.load(bad);});
  rejected('illegal-attachment',()=>service.attach('i4-foreign-leader',saved.units[0].instanceId));
  rejected('malformed-snapshot',()=>service.load({...saved,units:null}));
  rejected('invalid-import',()=>service.import('Not a New Recruit army export'));
  if(service.setSourceChoice)rejected('unknown-source-choice',()=>service.setSourceChoice(saved.units[0].instanceId,'i4-foreign-source','i4-foreign-option'));
  else na.push('No sourceChoices/setSourceChoice capability on this book service.');
  const assignment=saved.units.flatMap(unit=>(unit.enhancementAssignments||[]).map(row=>({instanceId:unit.instanceId,row})))[0];
  if(assignment)rejected('foreign-model-scope',()=>{const bad=structuredClone(saved);bad.units.find(unit=>unit.instanceId===assignment.instanceId).enhancementAssignments[0].modelScopeId='i4-foreign-scope';return service.load(bad);});
  else na.push('This fixture contains no physical enhancement assignment to mutate.');
  // A changed roster name retains all canonical equipment but changes import identity.
  const changed=fixture.text+'\nChar999: 1x Definitely foreign unit (1 pts)\n';
  rejected('changed-invalid-import',()=>service.import(changed));
  service.load(imported);
  const lines=fixture.text.split('\n'),starts=lines.flatMap((line,index)=>/^(?:Char\d+:\s*)?\d+x /.test(line.trim())?[index]:[]);
  const blocks=starts.map((start,index)=>lines.slice(start,starts[index+1]??lines.length).join('\n'));
  const repeat=blocks.findLast(block=>!/^\s*Enhancement:/mi.test(block));
  if(repeat){
    const changedValid=fixture.text+'\n'+repeat;
    returns.push({phase:'changed-import',...clone(attempt(()=>service.import(changedValid,choices)))});frame('changed-pending');
    returns.push({phase:'confirmed-replacement',...clone(attempt(()=>service.import(changedValid,choices,{replaceExisting:true})))});frame('replaced');
  }else na.push('No unchanged enhancement-free exported component to repeat for a valid replacement fixture.');
  service.load(saved);frame('restored');
  observations.push({bookId:fixture.bookId,id:fixture.id,returns,frames,na});
  timings.push({bookId:fixture.bookId,id:fixture.id,initMs,importMs,loadMs});
  console.log('CAPTURED '+fixture.bookId+' '+fixture.id+' '+frames.length+' frames');
}
  const payload={schema:'roster-service-native-parity/v1',observations};
  fs.writeFileSync(out,JSON.stringify(payload)+'\n');
  fs.writeFileSync(out+'.integration.json',JSON.stringify(integration,null,2)+'\n');
  fs.writeFileSync(out+'.timings.json',JSON.stringify(timings,null,2)+'\n');
  if(args.includes('--require-shared'))assert(integration.every(row=>row.shared),'A selected service bypassed the shared lifecycle');
  if(compare)assert.deepEqual(payload,JSON.parse(fs.readFileSync(compare,'utf8')),'Native public service observations changed');
  console.log(JSON.stringify({status:'PASS',cases:observations.length,frames:observations.reduce((n,row)=>n+row.frames.length,0),sha256:createHash('sha256').update(encode(payload)).digest('hex'),compared:Boolean(compare)}));
}finally{globalThis.fetch=originalFetch;}
