import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {extract,countsFor} from './mfm-dom.mjs';
import {readCurrentMfmRelease} from '../../../mfm/content/current-mfm-release.mjs';
import {readBookPassport} from './book-passport.mjs';

export const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase();
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const fingerprint=v=>hash(JSON.stringify(stable(v)));
export const json=v=>JSON.stringify(v,null,2)+'\n';
const read=(root,p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
async function launchCaptureBrowser(){
 const{chromium}=await import('playwright');
 const executablePath=process.env.WH_PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
 return chromium.launch({headless:true,...(executablePath?{executablePath}:fs.existsSync(chromium.executablePath())?{}:{channel:'chrome'})});
}
const locator=u=>`${u.sourceGroup}\0${u.status}\0${u.title}`;
const exactly=(items,predicate,label)=>{const found=items.filter(predicate);if(found.length!==1)throw Error(`${label}: expected exactly one source occurrence, found ${found.length}`);return found[0];};
const ordered=(v,index,profiles)=>{
 const p=profiles[index];
 if(!p||!v||typeof v!=='object')return v;
 if(Array.isArray(v))return v.map((x,i)=>ordered(x,p[i],profiles));
 return Object.fromEntries([...Object.keys(p),...Object.keys(v).filter(k=>!Object.hasOwn(p,k))].filter(k=>Object.hasOwn(v,k)).map(k=>[k,ordered(v[k],p[k],profiles)]));
};

// Replay metadata is an explicit acceptance input. It contains no extracted prices.
export async function parseSavedMfm({root,input,version,replay=false,observedAt=new Date().toISOString(),browserFactory}){
 const release=readCurrentMfmRelease({repoRoot:root});
 const seed=read(root,'mfm/capture/replay-v1.6.json');
 const identities=read(root,release.identityRegistryPath);
 const replayIdentities=read(root,seed.identityRegistryPath);
 const rows=[...release.factions,...release.dependencies];
 const launch=browserFactory??launchCaptureBrowser;
 const browser=await launch(),context=await browser.newContext({javaScriptEnabled:false});
 await context.route('**/*',r=>r.abort());
 const page=await context.newPage(),files=new Map(),captures=[];
 try{
  for(const row of rows){
   const current=read(root,row.capturePath),frozen=seed.sources.find(s=>s.file===path.basename(row.capturePath));
   if(!frozen)throw Error(`${row.sourceId}: missing explicit replay metadata`);
   const accepted=replay?frozen.metadata:current;
   const binding=(replay?replayIdentities:identities).factionBindings.find(b=>b.factionId===row.bookId);
   const parsed={units:[],detachments:[]},raws=[];
   for(const raw of accepted.rawArtifacts){
    const rawFile=path.join(input,raw.path);
    if(!fs.existsSync(rawFile))throw Error(`MFM input is incomplete: ${raw.path} is missing`);
    const bytes=fs.readFileSync(rawFile);
    await page.setContent(bytes.toString('utf8'),{waitUntil:'domcontentloaded',timeout:30000});
    let got;
    try{got=await extract(page,{legendsOnly:raw.state==='LEGENDS_VISIBLE'});}catch(e){throw Error(`MFM website changed: ${raw.path}: ${e.message}`);}
    if(got.version!==version)throw Error(`MFM website changed: ${raw.path}: expected ${version}, observed ${got.version||'no version'}`);
    parsed.units.push(...got.units);parsed.detachments.push(...got.detachments);
    const rawOut={...raw,sha256:hash(bytes),bytes:bytes.length};raws.push(rawOut);
    files.set(`mfm/sources/${version}/${raw.path}`,bytes);
   }
   let payload;
   if(current.unit){
    const unit=exactly(parsed.units,u=>u.title===current.sourceLocator.sourceTitle&&u.sourceGroup===current.sourceLocator.partition,row.sourceId);
    payload={...accepted,unit};
   }else{
    // Existing ownership is explicit. Known shared SM/DW rows are not recaptured as BA/DA facts.
    const ownTitles=new Set(binding.unitBindings.filter(b=>b.unitPointRecordId).map(b=>b.sourceTitle));
    const ownDets=new Set(binding.detachmentBindings.map(b=>b.sourceTitle));
    // Explicit accepted foreign occurrences, not a join by display name against
    // another book. A changed group/status or new occurrence requires review.
    const scope=current.enrollmentScope?(current.enrollmentScope.foreignOccurrences??read(root,'mfm/capture/owner-scope.json')[row.bookId]):null;
    const foreignUnits=new Set((scope?.units??[]).map(locator));
    const foreignDets=new Set(scope?.detachments??[]);
    const units=scope?parsed.units.filter(u=>ownTitles.has(u.title)||!foreignUnits.has(locator(u))):parsed.units;
    const detachments=scope?parsed.detachments.filter(d=>ownDets.has(d.title)||!foreignDets.has(d.title)):parsed.detachments;
    payload={...accepted,sourceGroups:[...new Set(units.map(u=>u.sourceGroup))],counts:countsFor(units,detachments),units,detachments};
   }
   payload.rawArtifacts=raws;
   if(!replay){
    const day=observedAt.slice(0,10);
    for(const key of ['capturedAt','observedAt','verifiedAt'])payload[key]=key==='capturedAt'?observedAt:day;
    Object.assign(payload,{version,currentnessCutoff:day,sourceUpdatedAt:null,effectiveDate:null,currentness:'CURRENT',currentnessEvidence:{liveVersion:version,observedAt:day,effectiveDate:null,officialEffectiveDateStatus:'NOT_ESTABLISHED'}});
    if(payload.sourceId)payload.sourceId=row.sourceId.replace(/v1\.\d+$/,version);
   }
   delete payload.captureSha256;
   payload.captureSha256=fingerprint(payload);
   if(replay)payload=ordered(payload,frozen.serialization,seed.profiles);
   const capturePath=`mfm/sources/${version}/${path.basename(row.capturePath)}`;
   files.set(capturePath,Buffer.from(json(payload)));captures.push({row,capturePath,payload});
  }
 }finally{await browser.close();}
 return{files,captures,release,identities:replay?replayIdentities:identities};
}

/** Re-bind the authored opaque identities to independently extracted evidence. */
export function replayMfmIdentityRegistry(parsed){
 const registry=structuredClone(parsed.identities);
 for(const capture of parsed.captures){
  const binding=capture.payload.unit?registry.crossFactionUnitDependencies.find(b=>path.posix.basename(b.sourceCapturePath)===path.posix.basename(capture.capturePath)):
   registry.factionBindings.find(b=>b.factionId===capture.payload.factionId);
  if(!binding)throw Error('Replay has no explicit owner identity '+capture.capturePath);
  binding.sourceCapturePath=capture.capturePath;
  binding.sourceCaptureSha256=capture.payload.captureSha256;
 }
 return registry;
}

export async function captureLiveInput({root,version,destination,browserFactory}){
 const release=readCurrentMfmRelease({repoRoot:root});
 const browser=await(browserFactory?browserFactory():launchCaptureBrowser());
 try{
  for(const row of [...release.factions,...release.dependencies]){
   readBookPassport(row.bookId,{root});
   const source=read(root,row.capturePath),context=await browser.newContext(),page=await context.newPage();
   // Only the official MFM surface may be contacted by capture.
   await context.route('**/*',r=>new URL(r.request().url()).hostname==='mfm.warhammer-community.com'?r.continue():r.abort());
   await page.goto(source.url,{waitUntil:'networkidle',timeout:120000});
   for(const artifact of source.rawArtifacts){
    const legends=artifact.state==='LEGENDS_VISIBLE';
    if(await page.locator('#show-legends').count()){
     if(await page.locator('#show-legends').isChecked()!==legends){
      await page.locator('[role="switch"][aria-labelledby="show-legends-label"]').click();
      await page.waitForFunction(want=>document.querySelector('#show-legends')?.checked===want,legends);
     }
    }else if(legends)throw Error('MFM website changed: Legends control is missing');
    const parsed=await extract(page,{legendsOnly:legends});
    if(parsed.version!==version)throw Error(`MFM website changed: requested ${version}; observed ${parsed.version}`);
    fs.writeFileSync(path.join(destination,artifact.path),await page.content());
   }
   await context.close();
  }
 }finally{await browser.close();}
}
