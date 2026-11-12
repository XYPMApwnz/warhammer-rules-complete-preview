import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parseSavedMfm,captureLiveInput,hash,json} from './mfm-capture.mjs';
import {aggregateArtifactHash} from './source-ingestion-contract.mjs';
import {readCurrentMfmRelease,isModernMfmVersion} from '../../../mfm/content/current-mfm-release.mjs';
import {createCanonicalMfmFacts} from '../../../mfm/content/canonical-mfm-facts.mjs';
import {diffMfmCapture} from './mfm-release-diff.mjs';

const defaultRoot=fileURLToPath(new URL('../../../',import.meta.url));
const read=(root,p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const rows=p=>[...p.factions,...p.dependencies];
const replaceVersion=(s,old,v)=>typeof s==='string'?s.replaceAll(old,v):s;
const opaque=kind=>`mfm-${kind}-${crypto.randomBytes(8).toString('hex')}`;
const sourceKey=u=>`${u.sourceGroup}\0${u.status}\0${u.title}`;
const reason=id=>({bindingStatus:'REFERENCE_ONLY',reason:`EXPLICIT_RELEASE_REVIEW:${id}`});

function exactDecision(decisions,key,kind){
 const matches=decisions.filter(d=>d.key===key);
 if(matches.length>1)throw Error(`Duplicate MFM decision ${key}`);
 const decision=matches[0];
 if(decision&&(decision.kind!==kind||!decision.note))throw Error(`MFM decision ${key} requires kind ${kind} and a review note`);
 return decision;
}

function refreshCounts(cross){
 const c=cross.declaredCounts;
 for(const[name,key]of[['unitBindings','unitBindings'],['detachmentBindings','detachmentBindings'],['enhancementBindings','enhancementBindings'],['qualifierOwnerBindings','qualifierOwnerBindings']]){
  const values=Object.values(cross[key]);c[name]=values.filter(x=>x.bindingStatus!=='REFERENCE_ONLY').length;
  const ref=name==='unitBindings'?'unitReferenceOnly':name.replace('Bindings','ReferenceOnly');c[ref]=values.filter(x=>x.bindingStatus==='REFERENCE_ONLY').length;
 }
 c.unitReferences=Object.keys(cross.unitBindings).length;
}

export function projectReleaseIdentities({root,parsed,version,decisions=[]}){
 const registry=structuredClone(parsed.identities),cross=read(root,parsed.release.crossDomainBindingsPath),pending=[],changes=[];
 const day=parsed.captures[0].payload.currentnessCutoff;
 const decisionKeys=new Set();
 for(const capture of parsed.captures){
  const{row,payload}=capture;
  const dependency=!!payload.unit;
  let binding=dependency?registry.crossFactionUnitDependencies.find(b=>b.sourceId===row.sourceId):registry.factionBindings.find(b=>b.factionId===row.bookId);
  const old=read(root,row.capturePath);
  const structureKey=`${row.bookId}:structure`,structure=exactDecision(decisions,structureKey,'REVIEW_BINDING');
  if(structure){
   if(dependency)throw Error('Dependency ownership changes need a separate exact source-locator review');
   if(structure.expectedBindingHash!==hash(json(binding)))throw Error(`${structureKey}: reviewed identity input changed`);
   if(structure.binding?.factionId!==row.bookId)throw Error(`${structureKey}: binding owner differs`);
   const identityFields=b=>Object.fromEntries(Object.entries(b).filter(([k,v])=>typeof v==='string'&&v.startsWith('mfm-')&&(k==='id'||k.endsWith('Id'))));
   const preserve=(before,after)=>{
    if(!before||!after||typeof before!=='object'||typeof after!=='object')return;
    if(Array.isArray(before)){
     for(const b of before){if(!b||typeof b!=='object')continue;const keys=['sourceTitle','sourceLabel'].filter(k=>b[k]!==undefined);if(!keys.length)continue;const matches=(Array.isArray(after)?after:[]).filter(a=>keys.every(k=>a[k]===b[k]));if(matches.length===1)preserve(b,matches[0]);}
    }else{
     for(const[k,v]of Object.entries(identityFields(before)))if(after[k]!==v)throw Error(`${structureKey}: unchanged locator cannot change opaque identity ${k}=${v}`);
     for(const k of Object.keys(before))if(typeof before[k]==='object')preserve(before[k],after[k]);
    }
   };
   preserve(binding,structure.binding);
   const index=registry.factionBindings.indexOf(binding);binding=structuredClone(structure.binding);registry.factionBindings[index]=binding;
   for(const patch of structure.crossDomainChanges??[]){
    if(!['unitBindings','detachmentBindings','enhancementBindings','qualifierOwnerBindings'].includes(patch.partition)||typeof patch.id!=='string')throw Error(`${structureKey}: unsupported cross-domain decision`);
    const before=cross[patch.partition][patch.id]??null;
    if(JSON.stringify(before)!==JSON.stringify(patch.expectedBefore))throw Error(`${structureKey}: cross-domain decision input changed ${patch.id}`);
    if(patch.after===null)delete cross[patch.partition][patch.id];else cross[patch.partition][patch.id]=structuredClone(patch.after);
   }
   decisionKeys.add(structureKey);
  }
  if(!dependency){
   const neededTargets=new Set(payload.units.flatMap(u=>Object.values(u.relations??{}).flat()));
   for(const b of [...binding.unitBindings]){
    if(!b.unitPointRecordId)continue;
    if(payload.units.some(u=>u.title===b.sourceTitle&&u.sourceGroup===b.sourceGroup&&u.status===b.status))continue;
    const key=`${row.bookId}:missing:${b.unitReferenceId}`,d=exactDecision(decisions,key,'REMOVE_OR_RENAME_UNIT');decisionKeys.add(key);
    if(!d){pending.push({key,kind:'REMOVE_OR_RENAME_UNIT',book:row.bookId,title:b.sourceTitle,options:['Confirm removal','Rename: give the exact new source locator'],binding:structuredClone(b)});continue;}
    if(d.action==='RENAME'){
     const u=payload.units.filter(u=>u.title===d.sourceTitle&&u.sourceGroup===d.sourceGroup&&u.status===d.status);
     if(u.length!==1)throw Error(`${key}: approved rename does not identify one exact source row`);
     Object.assign(b,{sourceTitle:d.sourceTitle,sourceGroup:d.sourceGroup,status:d.status});
    }else if(d.action==='REMOVE'){
     if(neededTargets.has(b.sourceTitle)){
      // A still-used relation target retains its opaque reference, without a price.
      for(const field of ['sourceGroup','status','pricingGroupId','unitPointRecordId','paidUpgradeBindings','leaderEligibilityRecordId','supportEligibilityRecordId'])delete b[field];
     }else{
      binding.unitBindings.splice(binding.unitBindings.indexOf(b),1);delete cross.unitBindings[b.unitReferenceId];
     }
    }else throw Error(`${key}: explicit REMOVE or RENAME decision required`);
    changes.push({book:row.bookId,title:b.sourceTitle,kind:d.action,note:d.note});
   }
   for(const u of payload.units){
    if(binding.unitBindings.some(b=>b.sourceTitle===u.title&&b.sourceGroup===u.sourceGroup&&b.status===u.status&&b.unitPointRecordId))continue;
    const key=`${row.bookId}:new:${sourceKey(u)}`,d=exactDecision(decisions,key,'ADD_UNIT');decisionKeys.add(key);
    if(!d){pending.push({key,kind:'ADD_UNIT',book:row.bookId,title:u.title,sourceGroup:u.sourceGroup,status:u.status,options:['Bind to an explicit Army unit ID','REFERENCE_ONLY'],proposed:{unitReferenceId:opaque('unit-ref'),unitPointRecordId:opaque('unit-points')}});continue;}
    if(!/^mfm-unit-ref-[a-f0-9]{16}$/.test(d.unitReferenceId)||!/^mfm-unit-points-[a-f0-9]{16}$/.test(d.unitPointRecordId))throw Error(`${key}: approved opaque IDs are required`);
    const group=binding.groupBindings.find(g=>g.sourceLabel===u.sourceGroup);
    if(!group)throw Error(`${key}: new pricing group requires an explicit identity binding`);
    if(u.paidOptions?.length||Object.keys(u.relations??{}).length)throw Error(`${key}: new paid/relationship identities need explicit reviewed binding records`);
    const b={sourceTitle:u.title,unitReferenceId:d.unitReferenceId,sourceGroup:u.sourceGroup,pricingGroupId:group.id,status:u.status,unitPointRecordId:d.unitPointRecordId,paidUpgradeBindings:[]};
    if(Object.hasOwn(cross.unitBindings,b.unitReferenceId))throw Error(`${key}: proposed identity already exists`);
    binding.unitBindings.push(b);
    if(d.action==='REFERENCE_ONLY')cross.unitBindings[b.unitReferenceId]=reason(key);
    else if(d.action==='BOUND'&&d.armyUnitId&&d.armyBookId===row.bookId)cross.unitBindings[b.unitReferenceId]={bindingStatus:'BOUND',armyBookId:row.bookId,armyUnitId:d.armyUnitId};
    else throw Error(`${key}: explicit BOUND unit ID or REFERENCE_ONLY decision required`);
    changes.push({book:row.bookId,title:u.title,kind:d.action,note:d.note});
   }
   // The full reviewed binding form covers new/removed detachments, enhancements,
   // qualifiers, paid options and relationship IDs without guessing identities.
   const structuralReasons=[];
   for(const d of payload.detachments){
    const b=binding.detachmentBindings.find(x=>x.sourceTitle===d.title);
    if(!b){structuralReasons.push(`New detachment: ${d.title}`);continue;}
    for(const e of d.enhancements)if(!b.enhancementBindings.some(x=>x.sourceTitle===e.title))structuralReasons.push(`New enhancement/upgrade: ${d.title} / ${e.title}`);
    for(const e of b.enhancementBindings)if(!d.enhancements.some(x=>x.title===e.sourceTitle))structuralReasons.push(`Removed enhancement/upgrade: ${d.title} / ${e.sourceTitle}`);
    if(JSON.stringify(d.qualifiers)!==JSON.stringify(old.detachments.find(x=>x.title===d.title)?.qualifiers)){
     if(!structure)structuralReasons.push(`Changed detachment qualifiers: ${d.title}`);
    }
   }
   for(const d of binding.detachmentBindings)if(!payload.detachments.some(x=>x.title===d.sourceTitle))structuralReasons.push(`Removed detachment: ${d.sourceTitle}`);
   for(const u of payload.units){const b=binding.unitBindings.find(x=>x.sourceTitle===u.title);if(!b)continue;
    const paid=(u.paidOptions??[]).map(x=>`${x.sourceGroup}\0${x.sourceLabel}`).sort(),bound=(b.paidUpgradeBindings??[]).map(x=>`${x.sourceGroup}\0${x.sourceLabel}`).sort();
    if(JSON.stringify(paid)!==JSON.stringify(bound))structuralReasons.push(`Changed paid-option identities: ${u.title}`);
    for(const role of['leader','support'])if(u.relations?.[role]?.length&&!b[role+'EligibilityRecordId'])structuralReasons.push(`New ${role} relationship identity: ${u.title}`);
   }
   for(const target of neededTargets)if(!binding.unitBindings.some(b=>b.sourceTitle===target))structuralReasons.push(`New relationship target identity: ${target}`);
   if(structuralReasons.length)pending.push({key:structureKey,kind:'REVIEW_BINDING',book:row.bookId,title:structuralReasons.join('; '),options:['Review exact faction binding plus cross-domain dispositions; all existing opaque IDs must remain'],expectedBindingHash:hash(json(parsed.identities.factionBindings.find(b=>b.factionId===row.bookId))),binding:structuredClone(binding)});
  }
  binding.sourceId=replaceVersion(row.sourceId,parsed.release.version,version);
  binding.sourceCapturePath=capture.capturePath;binding.sourceCaptureSha256=payload.captureSha256;
  changes.push(...diffMfmCapture(old,payload,{bookId:row.bookId}));
  for(const a of Object.values(cross.relationAdjudications??{})){
   const p=a.provenance?.mfm;
   if(p?.sourceId!==row.sourceId)continue;
   // Re-authenticate the same exact relation, never silently approve a changed relation.
   const owner=binding.unitBindings?.find(b=>b.unitReferenceId===a.sourceMfmUnitReferenceId);
   const before=old.units?.find(u=>u.title===owner?.sourceTitle),after=payload.units?.find(u=>u.title===owner?.sourceTitle);
   if(JSON.stringify(before?.relations)!==JSON.stringify(after?.relations))throw Error(`${row.bookId}/${owner?.sourceTitle}: relation changed; an explicit relation adjudication is required`);
   Object.assign(p,{sourceId:binding.sourceId,sourcePath:capture.capturePath,sourceCaptureSha256:payload.captureSha256,rawArtifactSha256:payload.rawArtifacts[0].sha256});
  }
 }
 for(const d of decisions)if(!decisionKeys.has(d.key))throw Error(`Unused MFM decision ${d.key}`);
 const registryVersion=`${version}-scoped-nine`;
 registry.notes=[...parsed.identities.notes.slice(0,3),`Current release ${version}; all nine faction captures and two CSM dependencies observed ${day}. The effective date is not established.`,...parsed.identities.notes.slice(3).map(note=>`Historical identity review: ${note}`)];
 for(const target of[registry,cross])Object.assign(target,{sourceVersion:registryVersion,currentnessCutoff:day,verifiedAt:day,effectiveDate:null});
 refreshCounts(cross);
 return{registry,cross,pending,changes,registryVersion};
}

function writeFiles(root,files){
 const tempRoot=process.env.QA_TMP_ROOT||'E:/Warhammer/qa-tmp/mfm-update-v1';fs.mkdirSync(tempRoot,{recursive:true});
 const transaction=path.join(tempRoot,'mfm-transaction-'+hash(path.resolve(root)).slice(0,20)),journalPath=path.join(transaction,'journal.json');
 if(fs.existsSync(transaction))throw Error(`An interrupted MFM transaction needs recovery: ${journalPath}. No files were written.`);
 fs.mkdirSync(transaction);
 const entries=[],written=[];
 const restore=()=>{
  for(const entry of written){const target=path.join(root,entry.path);if(entry.before===null)fs.rmSync(target,{force:true});else fs.copyFileSync(path.join(transaction,entry.before),target);}
 };
 try{
  for(const[p,bytes]of files){
   if(path.isAbsolute(p)||p.includes('\\')||p.split('/').some(x=>!x||x==='.'||x==='..')||!p.startsWith('mfm/')&&!p.startsWith('books/'))throw Error(`Unsafe MFM transaction path ${p}`);
   const target=path.join(root,p),index=entries.length,old=fs.existsSync(target)?fs.readFileSync(target):null;
   if(old)fs.writeFileSync(path.join(transaction,`${index}.before`),old);
   fs.writeFileSync(path.join(transaction,`${index}.after`),bytes);
   entries.push({path:p,before:old?`${index}.before`:null,after:`${index}.after`,beforeHash:old?hash(old):null});
  }
  // Exclusive mkdir is the per-checkout lock. The durable pre-write journal
  // retains all old bytes even if the process or machine stops mid-activation.
  fs.writeFileSync(journalPath,json({root:path.resolve(root),pid:process.pid,status:'PREPARED',entries}));
  for(const entry of entries){const target=path.join(root,entry.path),current=fs.existsSync(target)?hash(fs.readFileSync(target)):null;if(current!==entry.beforeHash)throw Error(`MFM file changed concurrently: ${entry.path}`);}
  for(const entry of entries){const target=path.join(root,entry.path);fs.mkdirSync(path.dirname(target),{recursive:true});written.push(entry);fs.copyFileSync(path.join(transaction,entry.after),target);}
  fs.writeFileSync(journalPath,json({root:path.resolve(root),pid:process.pid,status:'COMMITTED',entries}));
 }catch(error){restore();throw error;}
 finally{
  // Only individually known files inside our verified transaction directory.
  for(const entry of entries)for(const file of[entry.before,entry.after].filter(Boolean))fs.rmSync(path.join(transaction,file),{force:true});
  fs.rmSync(journalPath,{force:true});fs.rmdirSync(transaction);
 }
}

export async function updateMfm({root=defaultRoot,version,input,decisionsFile,observedAt,browserFactory}={}){
 if(!isModernMfmVersion(version))throw Error('Use an explicit MFM version, for example --version=v1.7');
 const release=readCurrentMfmRelease({repoRoot:root});
 const basePointerHash=hash(fs.readFileSync(path.join(root,'mfm/current.json')));
 if(version===release.version)throw Error('The accepted current release cannot be overwritten. Use --replay for a separate verification.');
 if(read(root,'mfm/releases.json').releases.some(r=>r.version===version)||read(root,release.sourceRegistryPath).sources.some(s=>s.acceptedRevision===version&&s.artifacts?.some(a=>a.path.startsWith(`mfm/sources/${version}/`))))throw Error('An accepted or archived MFM release cannot be overwritten');
 const statePath=`mfm/releases/${version}/capture.json`;
 if(fs.existsSync(path.join(root,`mfm/sources/${version}`))&&!fs.existsSync(path.join(root,statePath)))throw Error('Refusing to overwrite an existing unowned MFM release');
 let live;
 if(!input){
  const temp=process.env.QA_TMP_ROOT||'E:/Warhammer/qa-tmp/mfm-update-v1';
  fs.mkdirSync(temp,{recursive:true});live=fs.mkdtempSync(path.join(temp,'capture-live-'));input=live;
  await captureLiveInput({root,version,destination:live,browserFactory});
 }
 observedAt??=new Date().toISOString();
 const parsed=await parseSavedMfm({root,input,version,observedAt,browserFactory});
 const decisions=decisionsFile?JSON.parse(fs.readFileSync(decisionsFile,'utf8')).decisions:[];
 if(!Array.isArray(decisions))throw Error('Decision file must contain an explicit decisions array');
 const reviewed=projectReleaseIdentities({root,parsed,version,decisions});
 const identityPath=`mfm/content/mfm-${version}-scoped.identity-registry.json`,crossPath=`mfm/content/mfm-${version}-army-mission-bindings.json`;
 const files=new Map(parsed.files);
 files.set(identityPath,Buffer.from(json(reviewed.registry)));files.set(crossPath,Buffer.from(json(reviewed.cross)));
 const pointer=structuredClone(release);Object.assign(pointer,{version,registryVersion:reviewed.registryVersion,identityRegistryPath:identityPath,crossDomainBindingsPath:crossPath});
 for(const row of rows(pointer)){const capture=parsed.captures.find(c=>path.basename(c.capturePath)===path.basename(row.capturePath));row.capturePath=capture.capturePath;row.sourceId=replaceVersion(row.sourceId,release.version,version);}
 if(hash(fs.readFileSync(path.join(root,'mfm/current.json')))!==basePointerHash)throw Error('Current MFM changed during capture; no candidate was written');
 const state={schema:'mfm-release-candidate/v1',version,basePointerHash,observedAt,pointer,pending:reviewed.pending,changes:reviewed.changes,decisions,files:[...files].map(([p,b])=>({path:p,sha256:hash(b)}))};
 files.set(statePath,Buffer.from(json(state)));
 const display=v=>v&&typeof v==='object'?JSON.stringify(v):String(v);
 const lines=[`# MFM ${version} review`,'',`Status: ${state.pending.length?'NEEDS DECISIONS — activation is blocked':'READY FOR ACTIVATION'}`,'','## Factual changes','',...state.changes.map(c=>`- ${c.book} · ${c.title}${c.selection?' · '+c.selection:''}: ${c.before!==undefined?display(c.before)+' → '+display(c.after):c.kind}`),'','## Decisions needed','',...state.pending.map(p=>`- ${p.book??''} · ${p.title}: ${p.options.join(' / ')}. Key: ${JSON.stringify(p.key)}`),'','Decisions must explicitly preserve or assign opaque identities. No name similarity is used.',''];
 files.set(`mfm/releases/${version}/REPORT.md`,Buffer.from(lines.join('\n')));
 writeFiles(root,files);
 return state;
}

export async function activateMfm({root=defaultRoot,version,activatedAt=new Date().toISOString(),browserFactory}={}){
 const current=readCurrentMfmRelease({repoRoot:root}),state=read(root,`mfm/releases/${version}/capture.json`);
 const keys=['schema','version','basePointerHash','observedAt','pointer','pending','changes','decisions','files'];
 if(Object.keys(state).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(state,k)))throw Error('MFM candidate fields differ from the supported schema');
 if(state.schema!=='mfm-release-candidate/v1'||state.version!==version)throw Error('Unsupported or mismatched MFM candidate');
 if(!Array.isArray(state.pending)||!Array.isArray(state.files)||!Array.isArray(state.decisions)||!Array.isArray(state.changes))throw Error('MFM candidate requires explicit array fields');
 if(state.pending.length)throw Error(`MFM ${version} needs ${state.pending.length} explicit decisions; nothing was activated`);
 if(state.basePointerHash!==hash(fs.readFileSync(path.join(root,'mfm/current.json'))))throw Error('Current MFM changed since capture; recapture against the new current release');
 // Re-read retained HTML offline. A normalized JSON edit cannot accept itself
 // by changing its own hash or by dropping an artifact from the state file.
 const parsed=await parseSavedMfm({root,input:path.join(root,'mfm/sources',version),version,observedAt:state.observedAt,browserFactory});
 const reviewed=projectReleaseIdentities({root,parsed,version,decisions:state.decisions});
 if(reviewed.pending.length)throw Error('MFM candidate decisions do not cover every current source occurrence');
 const expectedFiles=new Map(parsed.files),identityPath=`mfm/content/mfm-${version}-scoped.identity-registry.json`,crossPath=`mfm/content/mfm-${version}-army-mission-bindings.json`;
 expectedFiles.set(identityPath,Buffer.from(json(reviewed.registry)));expectedFiles.set(crossPath,Buffer.from(json(reviewed.cross)));
 if(state.files.length!==expectedFiles.size||new Set(state.files.map(a=>a.path)).size!==expectedFiles.size)throw Error('MFM candidate artifact coverage differs');
 for(const artifact of state.files){
  const expected=expectedFiles.get(artifact.path);
  if(!expected||artifact.sha256!==hash(expected)||!expected.equals(fs.readFileSync(path.join(root,artifact.path))))throw Error(`MFM candidate changed after review: ${artifact.path}`);
 }
 const expectedPointer=structuredClone(current);Object.assign(expectedPointer,{version,registryVersion:reviewed.registryVersion,identityRegistryPath:identityPath,crossDomainBindingsPath:crossPath});
 for(const row of rows(expectedPointer)){row.capturePath=`mfm/sources/${version}/${path.basename(row.capturePath)}`;row.sourceId=replaceVersion(row.sourceId,current.version,version);}
 if(JSON.stringify(expectedPointer)!==JSON.stringify(state.pointer))throw Error('MFM candidate pointer differs from the validated nine-faction/two-dependency release');
 const registry=read(root,current.sourceRegistryPath),files=new Map(),next=state.pointer;
 const history=read(root,'mfm/releases.json');
 if(history.releases.some(r=>r.version===current.version))throw Error('Current release was already archived');
 for(const old of rows(current)){
  const selected=rows(next).find(r=>r.bookId===old.bookId&&r.key===old.key);
  const capture=read(root,selected.capturePath),source=registry.sources.find(r=>r.sourceId===old.sourceId);
  if(!source||registry.sources.some(r=>r.sourceId===selected.sourceId))throw Error(`MFM activation source identity conflict: ${selected.sourceId}`);
  const artifacts=[{path:selected.capturePath,normalization:'lf',sha256:hash(fs.readFileSync(path.join(root,selected.capturePath),'utf8').replace(/\r\n/g,'\n')).toLowerCase()},...capture.rawArtifacts.map(a=>({path:path.posix.join(path.posix.dirname(selected.capturePath),a.path),normalization:'bytes',sha256:a.sha256.toLowerCase()}))];
  registry.sources.push({...source,sourceId:selected.sourceId,acceptedRevision:version,acceptedHash:aggregateArtifactHash(artifacts),lastChecked:capture.verifiedAt??capture.currentnessCutoff,upstreamObservedAt:capture.observedAt??capture.currentnessCutoff,upstreamCurrentness:'CURRENT',status:'VERIFIED_CURRENT',supersedesSourceId:old.sourceId,extractor:'books/shared/tools/mfm-release-cli.mjs',artifacts,notes:'Complete official MFM DOM capture; explicit stable identities and release decisions reviewed before activation.'});
  const config=read(root,`books/${old.bookId}/book.config.json`),manifestPath=path.posix.join('books',old.bookId,config.sources.manifest);
  const manifest=files.has(manifestPath)?JSON.parse(files.get(manifestPath)):read(root,manifestPath);
  const list=manifest.sources??manifest.layers;
  const previous=list.find(r=>(r.ingestionSourceId??r.sourceId??r.id)===old.sourceId);
  if(!previous)throw Error(`MFM activation: old source declaration missing ${old.sourceId}`);
  const fresh=structuredClone(previous);
  Object.assign(previous,{active:false,lifecycle:'HISTORICAL_EVIDENCE'});
  for(const key of['id','sourceId','ingestionSourceId'])if(fresh[key]===old.sourceId)fresh[key]=selected.sourceId;
  Object.assign(fresh,{active:true,lifecycle:'ACCEPTED_SOURCE',version,updated:capture.currentnessCutoff,capturedAt:capture.capturedAt,currentnessCutoff:capture.currentnessCutoff,paths:artifacts.map(a=>a.path)});
  if(fresh.title)fresh.title=replaceVersion(fresh.title,current.version,version);
  list.push(fresh);files.set(manifestPath,Buffer.from(json(manifest)));
 }
 history.releases.push({version:current.version,activatedAt,sourceIds:rows(current).map(r=>r.sourceId)});
 files.set(current.sourceRegistryPath,Buffer.from(json(registry)));files.set('mfm/releases.json',Buffer.from(json(history)));files.set('mfm/current.json',Buffer.from(json(next)));
 // Validate authenticated sources and all exact identity partitions before touching active files.
 const tempRoot=process.env.QA_TMP_ROOT||'E:/Warhammer/qa-tmp/mfm-update-v1';fs.mkdirSync(tempRoot,{recursive:true});
 const validationPath=path.join(tempRoot,`source-registry-${crypto.randomUUID()}.json`);fs.writeFileSync(validationPath,json(registry));
 try{createCanonicalMfmFacts({repoRoot:root,identityRegistry:read(root,next.identityRegistryPath),crossDomainBindings:read(root,next.crossDomainBindingsPath),sourceRegistryPath:validationPath});}
 finally{fs.rmSync(validationPath,{force:true});}
 if(state.basePointerHash!==hash(fs.readFileSync(path.join(root,'mfm/current.json'))))throw Error('Current MFM changed during activation; nothing was activated');
 writeFiles(root,files);
 return{version,currentSources:9,dependencies:2,historicalAdded:11};
}
