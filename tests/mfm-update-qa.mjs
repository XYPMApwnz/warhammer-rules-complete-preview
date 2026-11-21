/** Expectations describe a synthetic future release, never a claim about GW prices. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseSavedMfm,replayMfmIdentityRegistry,json} from '../books/shared/tools/mfm-capture.mjs';
import {launchChromium} from './helpers/browser-launch.mjs';
import {createCanonicalMfmFacts} from '../mfm/content/canonical-mfm-facts.mjs';
import {projectReleaseIdentities} from '../books/shared/tools/mfm-release-update.mjs';
import {createQaTempDir,createQaEvidenceDir,qaTempEnvironment} from './helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),scratch=createQaTempDir('wh-mfm-update-'),copy=path.join(scratch,'checkout'),input=path.join(scratch,'synthetic-pages');
const evidence=createQaEvidenceDir('wh-mfm-update-evidence-'),results=[];
const read=(dir,p)=>JSON.parse(fs.readFileSync(path.join(dir,p),'utf8'));
const write=(dir,p,v)=>fs.writeFileSync(path.join(dir,p),JSON.stringify(v,null,2)+'\n');
const replay=await parseSavedMfm({root,input:path.join(root,'mfm/sources/v1.6'),version:'v1.6',replay:true,browserFactory:()=>launchChromium()});
for(const[p,b]of replay.files)assert(b.equals(fs.readFileSync(path.join(root,p))),`Replay differs: ${p}`);
const replayRegistry=replayMfmIdentityRegistry(replay);assert(Buffer.from(json(replayRegistry)).equals(fs.readFileSync(path.join(root,'mfm/content/mfm-v1.6-scoped.identity-registry.json'))),'Replay identity registry differs');
// The authored registry is a required input; it must independently cover every parsed locator.
const facts=createCanonicalMfmFacts({repoRoot:root});assert.equal(facts.sourceSnapshots.filter(s=>!s.historical).length,11);
results.push({check:'v1.6 byte replay',files:replay.files.size+1,status:'PASS'});
const structuredReview=structuredClone({...replay,files:undefined}),dg=structuredReview.captures.find(c=>c.payload.factionId==='death-guard');
dg.payload.detachments[0].enhancements.push({title:'SYNTHETIC REVIEW ENHANCEMENT',value:1,qualifiers:[]});
const structural=projectReleaseIdentities({root,parsed:structuredReview,version:'v1.7'}),need=structural.pending.find(p=>p.kind==='REVIEW_BINDING');assert(need,'New enhancement must require an explicit binding review');
const approved=structuredClone(need.binding),addedId='mfm-enhancement-a999999999999999';approved.detachmentBindings[0].enhancementBindings.push({sourceTitle:'SYNTHETIC REVIEW ENHANCEMENT',id:addedId,qualifierBindings:[]});
const decided=projectReleaseIdentities({root,parsed:structuredReview,version:'v1.7',decisions:[{key:need.key,kind:need.kind,note:'Synthetic source-identity review, not a gameplay enhancement.',expectedBindingHash:need.expectedBindingHash,binding:approved,crossDomainChanges:[{partition:'enhancementBindings',id:addedId,expectedBefore:null,after:{bindingStatus:'REFERENCE_ONLY',reason:'SYNTHETIC_REVIEW_ONLY'}}]}]});
assert.equal(decided.pending.length,0,'An explicit new-enhancement identity decision must be consumable');
const changedId=structuredClone(approved);changedId.unitBindings[0].unitReferenceId='mfm-unit-ref-a999999999999999';
assert.throws(()=>projectReleaseIdentities({root,parsed:structuredReview,version:'v1.7',decisions:[{key:need.key,kind:need.kind,note:'Poison identity',expectedBindingHash:need.expectedBindingHash,binding:changedId}]}),/unchanged locator cannot change opaque identity/);
results.push({check:'new enhancement binding review',status:'PASS',negativeControls:1});
// An explicitly reviewed regrouping changes a reference, never the unit identity.
const regroup=structuredClone({...replay,files:undefined}),regroupDg=regroup.captures.find(c=>c.payload.factionId==='death-guard');
const moved=regroupDg.payload.units[0],oldGroup=moved.sourceGroup,destination=regroupDg.payload.units.find(u=>u.status===moved.status&&u.sourceGroup!==oldGroup).sourceGroup;
const originalBinding=regroup.identities.factionBindings.find(f=>f.factionId==='death-guard').unitBindings.find(b=>b.sourceTitle===moved.title),oldIdentity=structuredClone(originalBinding);
moved.sourceGroup=destination;
const moveDecision={key:'death-guard:missing:'+oldIdentity.unitReferenceId,kind:'REMOVE_OR_RENAME_UNIT',action:'RENAME',sourceTitle:moved.title,sourceGroup:destination,status:moved.status,note:'Synthetic exact-locator regrouping approved explicitly; opaque identities stay unchanged.'};
const movedRelease=projectReleaseIdentities({root,parsed:regroup,version:'v1.7',decisions:[moveDecision]}),movedFaction=movedRelease.registry.factionBindings.find(f=>f.factionId==='death-guard'),movedBinding=movedFaction.unitBindings.find(b=>b.unitReferenceId===oldIdentity.unitReferenceId);
assert.equal(movedRelease.pending.length,0);assert.equal(movedBinding.unitPointRecordId,oldIdentity.unitPointRecordId);
assert.equal(movedBinding.pricingGroupId,movedFaction.groupBindings.find(g=>g.sourceLabel===destination).id);
assert.deepEqual(movedBinding.paidUpgradeBindings,oldIdentity.paidUpgradeBindings);
const unknownGroup=structuredClone(regroup);unknownGroup.captures.find(c=>c.payload.factionId==='death-guard').payload.units[0].sourceGroup='SYNTHETIC_UNREVIEWED_GROUP';
assert.throws(()=>projectReleaseIdentities({root,parsed:unknownGroup,version:'v1.7',decisions:[{...moveDecision,sourceGroup:'SYNTHETIC_UNREVIEWED_GROUP'}]}),/destination pricing group needs an explicit reviewed binding/);
results.push({check:'explicit regrouping preserves opaque identities',status:'PASS',negativeControls:1});
execFileSync('git',['clone','--local','--no-hardlinks','--config','core.autocrlf=false',root,copy],{cwd:root,stdio:'pipe'});
// During development, include the same working implementation that this test imports.
const tracked=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
for(const p of tracked){const from=path.join(root,p);if(!fs.statSync(from).isFile())continue;const to=path.join(copy,p);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);}
if(fs.existsSync(path.join(root,'node_modules')))fs.symlinkSync(fs.realpathSync(path.join(root,'node_modules')),path.join(copy,'node_modules'),process.platform==='win32'?'junction':'dir');
fs.mkdirSync(input);
for(const p of fs.readdirSync(path.join(root,'mfm/sources/v1.6')).filter(x=>x.endsWith('.html'))){const html=fs.readFileSync(path.join(root,'mfm/sources/v1.6',p),'utf8').replaceAll('v1.6','v1.7');fs.writeFileSync(path.join(input,p),html);}
const browser=await launchChromium(),context=await browser.newContext({javaScriptEnabled:false});await context.route('**/*',r=>r.abort());const page=await context.newPage();let malformedHtml;
const mutations=[{file:'death-guard.html',unit:'BIOLOGUS PUTRIFIER'},{file:'tyranids.html',unit:'BROODLORD'},{file:'official-mfm-sm-hydrated.html',unit:'CAPTAIN'}];
try{
 for(const m of mutations){
  const file=path.join(input,m.file);await page.setContent(fs.readFileSync(file,'utf8'));
  await page.evaluate(({unit,file})=>{
   const clean=s=>s.replace(/\s+/g,' ').replace(/[▲▼]+$/,'').trim();
   const cards=[...document.querySelectorAll('main div.flex.flex-col.space-y-1.m-1')];
   const card=cards.find(c=>clean(c.firstElementChild?.textContent??'')===unit);if(!card)throw Error('Fixture unit missing '+unit);
   const amount=card.querySelector('ul li span:last-child');if(!amount)throw Error('Fixture point row missing');amount.textContent=amount.textContent.replace(/\d[\d,]*/,value=>String(Number(value.replaceAll(',',''))+1));
   if(file==='death-guard.html'){
    const enhancement=cards.find(c=>clean(c.firstElementChild?.textContent??'').startsWith('CHAMPIONS OF CONTAGION'))?.querySelector('ul li span:last-child');if(!enhancement)throw Error('Fixture enhancement missing');enhancement.textContent=enhancement.textContent.replace(/\d[\d,]*/,value=>String(Number(value.replaceAll(',',''))+1));
   }
   if(file==='official-mfm-sm-hydrated.html'){
    const removed=cards.find(c=>clean(c.firstElementChild?.textContent??'')==='ASTRAEUS');if(!removed)throw Error('Fixture removed unit missing');removed.remove();
    const fictional=card.cloneNode(true);fictional.firstElementChild.textContent='SYNTHETIC REVIEW UNIT';
    for(const group of [...fictional.children].slice(1))if(!group.firstElementChild?.textContent.startsWith('YOUR '))group.remove();
    card.parentElement.append(fictional);
   }
  },m);
  fs.writeFileSync(file,await page.content());
 }
 await page.setContent(fs.readFileSync(path.join(input,'death-guard.html'),'utf8'));
 await page.evaluate(()=>{const cards=[...document.querySelectorAll('main div.flex.flex-col.space-y-1.m-1')],card=cards.find(c=>c.firstElementChild?.textContent.trim()==='BIOLOGUS PUTRIFIER');card.querySelector('ul li span:last-child').remove();});
 malformedHtml=await page.content();
}finally{await browser.close();}
const {updateMfm,activateMfm}=await import(pathToFileURL(path.join(copy,'books/shared/tools/mfm-release-update.mjs')));
const args={root:copy,version:'v1.7',input,observedAt:'2026-11-12T12:00:00.000Z',browserFactory:()=>launchChromium()};
await assert.rejects(()=>updateMfm({...args,observedAt:undefined}),/Saved-page input requires/);
await assert.rejects(()=>activateMfm({root:copy,version:'../invalid'}),/explicit MFM version/);
const sourceConfigPath=path.join(copy,'books/death-guard/book.config.json'),sourceConfigBytes=fs.readFileSync(sourceConfigPath),sourceConfig=JSON.parse(sourceConfigBytes);sourceConfig.passport.mfm.currentRelease='mfm/not-selected.json';fs.writeFileSync(sourceConfigPath,JSON.stringify(sourceConfig));
const{getCurrentMfmSource}=await import(pathToFileURL(path.join(copy,'mfm/content/current-mfm-release.mjs')));assert.throws(()=>getCurrentMfmSource('death-guard',{repoRoot:copy}),/Book passport death-guard/);fs.writeFileSync(sourceConfigPath,sourceConfigBytes);
results.push({check:'release input and passport controls',status:'PASS',negativeControls:3});
const dgInput=path.join(input,'death-guard.html'),validDg=fs.readFileSync(dgInput);fs.writeFileSync(dgInput,malformedHtml);
await assert.rejects(()=>updateMfm(args),/MFM website changed/);assert(!fs.existsSync(path.join(copy,'mfm/sources/v1.7')),'Malformed DOM must not publish a partial release');fs.writeFileSync(dgInput,validDg);
const missingInput=path.join(input,'death-guard-legends.html'),missingBytes=fs.readFileSync(missingInput);fs.unlinkSync(missingInput);
await assert.rejects(()=>updateMfm(args),/MFM input is incomplete/);assert(!fs.existsSync(path.join(copy,'mfm/sources/v1.7')));fs.writeFileSync(missingInput,missingBytes);
results.push({check:'incomplete input controls',status:'PASS',negativeControls:2,partialReleaseWritten:false});
let state=await updateMfm(args);
assert.equal(state.pending.length,2,'One removed and one fictional unit must both require an explicit decision');
await assert.rejects(()=>activateMfm({root:copy,version:'v1.7',browserFactory:()=>launchChromium()}),/needs 2 explicit decisions/);
assert.equal(read(copy,'mfm/current.json').version,'v1.6');
assert.equal(state.changes.filter(c=>c.kind==='POINTS').length,3);assert.equal(state.changes.filter(c=>c.kind==='ENHANCEMENT_POINTS').length,1);
const decisions=state.pending.map(p=>p.kind==='ADD_UNIT'?{key:p.key,kind:p.kind,action:'REFERENCE_ONLY',...p.proposed,note:'Synthetic control: fictional entry is not an Army Book unit.'}:{key:p.key,kind:p.kind,action:'REMOVE',note:'Synthetic control: this reference-only Astraeus price was removed from the input.'});
const decisionFile=path.join(scratch,'decisions.json');write(scratch,'decisions.json',{decisions});
state=await updateMfm({...args,decisionsFile:decisionFile});assert.equal(state.pending.length,0);
const statePath=path.join(copy,'mfm/releases/v1.7/capture.json'),stateBytes=fs.readFileSync(statePath);
const incomplete=structuredClone(state);incomplete.files.pop();fs.writeFileSync(statePath,JSON.stringify(incomplete,null,2)+'\n');
await assert.rejects(()=>activateMfm({root:copy,version:'v1.7',browserFactory:()=>launchChromium()}),/artifact coverage differs/);
fs.writeFileSync(statePath,stateBytes);
const badPointer=structuredClone(state);badPointer.pointer.unreviewedField=true;fs.writeFileSync(statePath,JSON.stringify(badPointer,null,2)+'\n');
await assert.rejects(()=>activateMfm({root:copy,version:'v1.7',browserFactory:()=>launchChromium()}),/candidate pointer differs/);
fs.writeFileSync(statePath,stateBytes);
const dgPath='mfm/sources/v1.7/death-guard.json',originalDg=fs.readFileSync(path.join(copy,dgPath)),poisonedDg=JSON.parse(originalDg);poisonedDg.units[0].pointSchedules[0].entries[0].value+=1;write(copy,dgPath,poisonedDg);
await assert.rejects(()=>activateMfm({root:copy,version:'v1.7',browserFactory:()=>launchChromium()}),/candidate changed after review/);
fs.writeFileSync(path.join(copy,dgPath),originalDg);
const activated=await activateMfm({root:copy,version:'v1.7',activatedAt:'2026-11-12T12:01:00.000Z',browserFactory:()=>launchChromium()});assert.equal(activated.historicalAdded,11);
await assert.rejects(()=>updateMfm({...args,version:'v1.6'}),/accepted or archived MFM release cannot be overwritten/);
results.push({check:'candidate integrity controls',status:'PASS',negativeControls:4,controls:['missing artifact','unknown pointer field','normalized price edited without RAW','archived release overwrite']});
const {createCanonicalMfmFacts:afterFacts}=await import(pathToFileURL(path.join(copy,'mfm/content/canonical-mfm-facts.mjs')));
const after=afterFacts({repoRoot:copy});
for(const m of mutations){const before=facts.unitPointRecords.find(p=>p.label===m.unit&&p.status==='CURRENT'),current=after.unitPointRecords.find(p=>p.id===before.id);assert.equal(current.pointSchedules[0].entries[0].value,before.pointSchedules[0].entries[0].value+1);}
assert(!after.unitPointRecords.some(p=>p.label==='ASTRAEUS'&&p.status==='CURRENT'));
assert(after.unitPointRecords.some(p=>p.label==='SYNTHETIC REVIEW UNIT'));
// Existing enrollment tests must accept exactly the nine new current +31 historical identities.
for(const test of['tests/source-enrollment-qa.mjs','tests/source-ingestion-contract-qa.mjs']){
 const start=performance.now(),run=spawnSync(process.execPath,[test],{cwd:copy,env:{...qaTempEnvironment(),QA_SKIP_TMP_SWEEP:'1'},encoding:'utf8',maxBuffer:16000000});
 fs.writeFileSync(path.join(evidence,path.basename(test)+'.log'),run.stdout+run.stderr);assert.equal(run.status,0,`${test}: ${run.stderr}`);results.push({check:test,status:'PASS',seconds:(performance.now()-start)/1000});
}
results.push({check:'synthetic17 capture → explicit decisions → activation',status:'PASS',priceChanges:4,blockedDecisions:2,currentFactions:9,currentDependencies:2,historical:31});
fs.copyFileSync(path.join(copy,'mfm/releases/v1.7/REPORT.md'),path.join(evidence,'SYNTHETIC_REPORT.md'));
fs.writeFileSync(path.join(evidence,'RESULTS.json'),JSON.stringify({status:'PASS',scratch,copy,input,results},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',scratch,evidence,results}));
