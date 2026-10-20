/** Focused physical bearer, graph and persistence controls. Constructed INPUT. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildSpaceMarinesImportBook} from './roster-import-build.mjs';
import {createSpaceMarinesRosterService} from './roster-import.mjs';
const book=buildSpaceMarinesImportBook(),clone=structuredClone,index=new Map(book.entities.map(row=>[row.id,row]));
const header='+ DETACHMENT: Gladius Task Force\n',captain='unit-sm-99eb03d4f2d448e2',shield='ability-sm-aa81f0067a3140de';
const ready=(service,text,bindings={},options)=>{const result=service.import(text,bindings,options);assert.equal(result.status,'READY',JSON.stringify(result.errors||result.needsBindings));return result;};
const unitText=(id,extra='',gear='')=>{
  const members=book.importBindings.compositions.filter(row=>row.ownerId===id&&row.quantity.min>0),count=members.reduce((sum,row)=>sum+row.quantity.min,0);
  return count+'x '+index.get(id).data.title+' (9999 pts)'+(gear?': '+gear:'')+'\n'+members.map(row=>'• '+row.quantity.min+'x '+index.get(row.id).data.name+'\n').join('')+extra;
};

const sourceUnit=index.get(shield).parentId,inventory=unitText(sourceUnit,'','1x Storm Shield');
const aggregate=createSpaceMarinesRosterService(book);ready(aggregate,header+inventory);
assert.equal(aggregate.points.totalPoints,175);assert.ok(aggregate.projection.units[0].profiles.every(row=>row.profile.stats.W==='3'));
const scoped=createSpaceMarinesRosterService(book),first=book.importBindings.compositions.find(row=>row.ownerId===sourceUnit&&row.quantity.min>0);
const name=index.get(first.id).data.name,owned=unitText(sourceUnit).replace('• '+first.quantity.min+'x '+name+'\n','• '+first.quantity.min+'x '+name+': 1x Storm Shield\n');
ready(scoped,header+owned);assert.equal(scoped.points.totalPoints,170+5*first.quantity.min);
for(const model of scoped.projection.units[0].profiles)assert.equal(model.profile.stats.W,model.canonicalProfileId===first.profileId?'4':'3');
assert.ok(scoped.projection.units[0].applied.filter(row=>row.ruleId===shield).every(row=>row.targetCompositionId?.includes('/PROFILE/')));

const armour='enhancement-sm-33db6f7f8bc04d0c',det=index.get(armour).parentId;
const two='+ DETACHMENT: '+index.get(det).data.title+'\n2x Captain (9999 pts)\n• 1x Captain\n• 1x Captain\nEnhancement: '+index.get(armour).data.title+'\n';
const bearer=createSpaceMarinesRosterService(book),needs=bearer.import(two);assert.equal(needs.status,'NEEDS_BINDINGS');
const choice=needs.needsBindings.find(row=>row.kind==='ENHANCEMENT_BEARER');assert.equal(choice.candidates.length,2);
const selected=choice.candidates[1].id;ready(bearer,two,{enhancementBearers:{[choice.key]:selected}});
assert.equal(bearer.state.units[0].enhancementAssignments[0].modelScopeId,selected);
const saved=bearer.snapshot(),projection=bearer.projection;ready(bearer,two);assert.deepEqual(bearer.snapshot(),saved);
assert.deepEqual(bearer.projection,projection);bearer.recompute();assert.deepEqual(bearer.projection,projection);
const restored=createSpaceMarinesRosterService(JSON.parse(JSON.stringify(book)));restored.load(JSON.parse(JSON.stringify(saved)));
assert.deepEqual(restored.projection,projection,'JSON reload lost the exact physical Enhancement bearer');
const bad=clone(saved);bad.units[0].enhancementAssignments[0].modelScopeId='unproved/model';
assert.throws(()=>bearer.load(bad));assert.deepEqual(bearer.snapshot(),saved);

const cato='unit-sm-02d5dee4717544ad',marneus='unit-sm-1af70808102d4286',victrix='unit-sm-f169827c554c4eee';
for(const [includeMarneus,expectedRole]of [[false,'LEADER'],[true,'SUPPORT']]){
  const service=createSpaceMarinesRosterService(book),text=header+unitText(cato)+unitText(victrix)+(includeMarneus?unitText(marneus):'');ready(service,text);
  service.attach('parsed-unit-1','parsed-unit-2');assert.equal(service.state.attachments[0].role,expectedRole);
  const attached=service.snapshot();ready(service,text);assert.deepEqual(service.snapshot(),attached);
  service.detach('parsed-unit-1');ready(service,text);assert.equal(service.state.attachments.length,0);
  service.reattach('parsed-unit-1','parsed-unit-2');assert.equal(service.state.attachments[0].role,expectedRole);
}
const unknown=createSpaceMarinesRosterService(book);ready(unknown,header+unitText('unit-sm-4fce70f042cc4e5d'));
assert.equal(unknown.points.totalPoints,null);const forged=unknown.snapshot();forged.units[0].equipmentContextKnown=true;
assert.throws(()=>unknown.load(forged));assert.equal(unknown.points.totalPoints,null);
// The actual runtime dependency closure can load in a browser. Node source
// readers remain producer-only; no compatibility shim or registration is added.
const visited=new Set();function visit(url){
  if(visited.has(url.href))return;visited.add(url.href);const text=fs.readFileSync(url,'utf8');
  for(const match of text.matchAll(/^import\s+.*?from\s+['"]([^'"]+)['"]/gm)){
    assert.ok(!match[1].startsWith('node:'),'Node-only producer leaked into browser runtime');
    if(match[1].startsWith('.'))visit(new URL(match[1],url));
  }
}visit(new URL('./roster-boot.mjs',import.meta.url));
console.log(JSON.stringify({status:'PASS',paidUnitUnknownBearer:175,paidModelScopes:'PASS',exactEnhancementBearer:'PASS',
  ambiguousBearer:'NEEDS_BINDINGS',bearerReimport:'PASS',jsonSnapshotReload:'PASS',invalidSnapshotAtomic:'PASS',
  catoRoles:['LEADER','SUPPORT'],explicitDetach:'PASS',unknownPaidInventory:'UNRESOLVED',forgedInventoryFlag:'REJECTED',
  browserNativeModules:visited.size,browserAcceptance:'NOT_RUN',realNewRecruitExportTested:false}));
