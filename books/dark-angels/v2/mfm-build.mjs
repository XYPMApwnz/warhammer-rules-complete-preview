/** Native DA pricing projection using the existing central V2 MFM projector.
 * A reader, physical importer and mixed-owner gameplay remain separate stages.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {consumeMfm} from './mfm-boundary.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;

export function buildNativeMfmBook({facts=read('./generated/effective.json'),canonicalFacts,bindings}={}){
  assert.equal(facts.bookId,'dark-angels');
  const consumed=consumeMfm(facts.entities,{canonicalFacts,bindings});
  const model={...clone(facts),mfm:{source:clone(consumed.source),...clone(consumed.partitions),
    relations:[],eligibilityEvidenceBindings:[],physicalPricing:'NOT_IMPLEMENTED'}};
  const payload={...clone(consumed.points),owner:'CENTRALIZED_MFM',bookId:'dark-angels',
    scope:'DA_OWNED_PRICING_ONLY',mixedOwnerRuntimeStatus:'NOT_PROVEN',
    inheritedPricingReferences:clone(read('./mfm-boundary.json').inheritedPricingReferences||[]),
    paidOptionPhysicalSelections:'NOT_PROVEN_NO_CHARGE',relationsActivated:false};
  const census={source:clone(consumed.source),
    provenBindings:Object.fromEntries(['unitBindings','detachmentBindings','enhancementBindings'].map(part=>[part,consumed.partitions[part].length])),
    pointsCoverage:clone(payload.counts),
    pointSchedules:[...consumed.records.values()].filter(row=>row.recordType==='MFM_UNIT_POINTS').reduce((sum,row)=>sum+row.pointSchedules.length,0),
    pointRows:[...consumed.records.values()].filter(row=>row.recordType==='MFM_UNIT_POINTS').reduce((sum,row)=>sum+row.pointSchedules.reduce((n,s)=>n+s.entries.length,0),0),
    referenceOnlyUnits:clone(consumed.referenceOnlyUnits),referenceOnlyOwners:clone(consumed.referenceOnlyOwners),
    referenceOnlyRelationTargets:clone(consumed.referenceOnlyRelationTargets),
    sharedSmPricing:{sourceOwner:'space-marines',pricedReferences:69,valuesCopied:0,runtimeActive:false},
    paidOptions:consumed.partitions.paidUpgradeBindings.length,
    paidOptionPhysicalSelections:'NOT_PROVEN_NO_CHARGE',mixedOwnerRuntime:'NOT_PROVEN',
    inheritedReferencesRuntimeActive:false,chapterGrantsActive:0,gameplayEffectsActive:0,
    rosterImporterImplemented:false,sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN'};
  return {model,payload,coverage:census,consumed};
}
export function writeNativeMfmBook({check=false}={}){
  const result=buildNativeMfmBook();
  for(const [name,value]of [['native-mfm-book',result.model],['mfm-presentation',result.payload],['mfm-coverage',result.coverage]]){
    const file=new URL('./generated/'+name+'.json',import.meta.url),bytes=JSON.stringify(value,null,2)+'\n';
    if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale DA native MFM projection '+name);
    else fs.writeFileSync(file,bytes);
  }
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=writeNativeMfmBook({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',...result.coverage}));
}
