import assert from 'node:assert/strict';
import fs from 'node:fs';
import {consumeMfm,resolveOwnedFact} from './mfm-boundary.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const effective=read('./generated/effective.json'),bindings=read('./mfm-bindings.json');
const result=consumeMfm(effective.entities);
const reviewedCoreReferences=read('./source-bindings.json').coreReferences;
const core=createEffectiveCoreCatalog();
// This checks the factual reference interface only. Core owns its semantics;
// the Army Book supplies exact target IDs and source-written parameter values.
function validateCoreReferences(book){
  const map=book.coreReferences,references=book.entities.filter(row=>row.kind==='RULE_REFERENCE');
  assert.ok(map&&typeof map==='object','missing Core reference map');
  const labels=[...new Set(references.map(row=>row.data.label))].sort();
  assert.deepEqual(Object.keys(map).sort(),labels,'missing/extra native Core reference labels');
  assert.equal(labels.length,19);
  for(const nativeLabel of labels){
    const binding=map[nativeLabel];
    assert.deepEqual(Object.keys(binding).sort(),['group','parameters','targetId'],'Core references must not copy Core content');
    let expectedParameters={},nativeTitle=nativeLabel;
    const valueMatch=/^(Deadly Demise|Firing Deck) (.+)$/.exec(nativeLabel),distanceMatch=/^Scouts (\d+)"$/.exec(nativeLabel);
    if(valueMatch){
      nativeTitle=valueMatch[1];
      expectedParameters={value:/^\d+$/.test(valueMatch[2])?Number(valueMatch[2]):valueMatch[2]};
    }else if(distanceMatch){nativeTitle='Scouts';expectedParameters={distance:Number(distanceMatch[1])};}
    assert.deepEqual(binding.parameters,expectedParameters,'wrong native Core reference parameters');
    if(nativeLabel==='For the Greater Good'){
      assert.equal(binding.targetId,'army-rule-for-the-greater-good:definition','wrong Tau Army Rule target');
      assert.equal(binding.group,'ARMY RULES');
      const fact=book.entities.find(row=>row.id===binding.targetId);
      assert.equal(fact?.kind,'ARMY_RULE_COMPONENT','missing Tau Army Rule fact');
      assert.ok(fact.data.text?.trim()&&fact.provenance?.sourceId,'missing Tau Army Rule content/provenance');
    }else{
      assert.equal(binding.group,'CORE ABILITIES');
      assert.ok(binding.targetId.startsWith('core-'),'wrong Core factual owner');
      const fact=core.getById(binding.targetId);
      assert.equal(fact?.id,binding.targetId,'unresolved exact Core identity');
      assert.equal(fact.kind,'ability');assert.equal(fact.state,'FULL_CONTENT');
      assert.equal(fact.title.toUpperCase(),nativeTitle.toUpperCase(),'wrong native Core target');
      assert.ok(typeof fact.semanticContent==='string'&&fact.semanticContent.trim(),'missing Core semantic content');
      assert.ok(fact.provenance?.base?.sourceId||fact.provenance?.sourceId,'missing Core provenance');
      assert.ok(Object.isFrozen(fact),'Core fact must remain owned by its effective catalog');
    }
  }
  for(const reference of references){
    assert.ok(reference.provenance?.sourceId,'missing native reference provenance');
    assert.ok(!Object.hasOwn(reference.data,'semanticContent')&&!Object.hasOwn(reference.data,'text'),'copied Core content in native reference');
  }
  assert.deepEqual(map,reviewedCoreReferences,'unreviewed Core reference map');
  return {nativeLabels:labels.length,coreLabels:labels.filter(value=>value!=='For the Greater Good').length,
    localArmyRuleLabels:1,nativeOccurrences:references.length};
}
const coreReferences=validateCoreReferences(effective);
for(const [partition,count] of Object.entries({unitBindings:43,detachmentBindings:7,enhancementBindings:23,paidOptionBindings:7,leaderBindings:9}))
  assert.equal(result.partitions[partition].length,count,partition);
assert.equal(result.leaderRelations.length,20);
assert.equal(new Set(result.leaderRelations.map(r=>r.sourceId+'\0'+r.targetId)).size,20);
let schedules=0,rows=0;
for(const bridge of bindings.unitBindings){
  const fact=resolveOwnedFact(bridge.mfmRecordId);
  schedules+=fact.pointSchedules.length;
  rows+=fact.pointSchedules.reduce((sum,r)=>sum+r.entries.length,0);
  assert.equal(fact.provenance.effectiveDate,null);
  assert.equal(fact.provenance.observedAt,'2026-10-14');
  assert.equal(fact.provenance.verifiedAt,'2026-10-14');
}
const paidProfiles=bindings.paidOptionBindings.flatMap(row=>row.relatedEntityIds);
assert.equal(new Set(paidProfiles).size,10);
assert.deepEqual(bindings.paidOptionBindings.filter(r=>r.entityKind==='WARGEAR_OPTION').map(r=>r.entityId),
  ['datasheet-tidewall-shieldline:wargear:1']);
assert.equal(bindings.leaderBindings.flatMap(r=>r.excludedRawRecipients).length,3);
assert.ok(!result.leaderRelations.some(r=>r.targetId==='unit-crisis-battlesuits'));
const controls=[];
const mutateBinding=(name,mutate)=>{const value=structuredClone(bindings);mutate(value);assert.throws(()=>consumeMfm(effective.entities,{bindings:value}));controls.push(name);};
const mutateEntities=(name,mutate,pattern)=>{const value=structuredClone(effective.entities);mutate(value);assert.throws(()=>consumeMfm(value),pattern);controls.push(name);};
mutateBinding('unreviewed central record',r=>r.unitBindings[0].mfmRecordId=r.unitBindings[1].mfmRecordId);
mutateBinding('unreviewed Enhancement owner',r=>r.enhancementBindings[0].ownerEntityId='detachment-montka');
mutateBinding('missing unit binding',r=>r.unitBindings.pop());
mutateBinding('changed Leader recipient',r=>r.leaderBindings[0].targetUnitIds.push('unit-stormsurge'));
mutateEntities('copied unit points',r=>{r[0].data.points=999;},/Army-owned copy/);
mutateEntities('copied nested schedules',r=>{r[0].data.nested={pointSchedules:[]};},/Army-owned copy/);
mutateEntities('copied Detachment value',r=>{r.find(x=>x.kind==='DETACHMENT').data.detachmentPoints=3;},/Army-owned copy/);
mutateEntities('copied paid values',r=>{r[0].data.paidOptions=[];},/Army-owned copy/);
mutateEntities('copied force disposition',r=>{r[0].data.forceDisposition='Reconnaissance';},/Army-owned copy/);
mutateEntities('wrong canonical source',r=>{r.find(x=>x.id===bindings.unitBindings[0].entityId).sourceEntityId='datasheet-stormsurge';},/wrong canonical source/);
mutateEntities('wrong Enhancement owner',r=>{r.find(x=>x.id===bindings.enhancementBindings[0].entityId).parentId='detachment-montka';},/wrong Enhancement owner/);
mutateEntities('wrong paid profile owner',r=>{r.find(x=>x.id===bindings.paidOptionBindings[0].entityId).parentId='unit-stormsurge';},/wrong paid option owner/);
const multiprofile=bindings.paidOptionBindings.find(r=>r.relatedEntityIds.length>1);
mutateEntities('missing alternate paid profile',r=>{r.splice(r.findIndex(x=>x.id===multiprofile.relatedEntityIds[1]),1);},/wrong paid option profiles/);
const leader=bindings.leaderBindings[0];
mutateEntities('Leader relation mismatch',r=>{r.find(x=>x.sourceEntityId===leader.sourceEntityId).data.blocks[0].text='This model can lead anything.';},/Leader relation mismatch/);
const excludedLeader=bindings.leaderBindings.find(r=>r.excludedRawRecipients.length);
mutateEntities('lost excluded raw recipient',r=>{const section=r.find(x=>x.sourceEntityId===excludedLeader.sourceEntityId);
  section.data.blocks[0].text=section.data.blocks[0].text.replace('\n- CRISIS BATTLESUITS','');},/Leader relation mismatch/);
assert.throws(()=>resolveOwnedFact('mfm-unit-points-0170d0e81013dea3'),/wrong\/stale MFM owner/);controls.push('foreign MFM owner');
assert.throws(()=>resolveOwnedFact('not-a-central-MFM-fact'),/wrong\/stale MFM owner/);controls.push('missing MFM owner');
const mutateCore=(name,mutate,pattern)=>{const book=structuredClone(effective);mutate(book);assert.throws(()=>validateCoreReferences(book),pattern);controls.push(name);};
mutateCore('missing Core reference',book=>{delete book.coreReferences.Leader;},/missing\/extra native Core reference labels/);
mutateCore('wrong Core target',book=>{book.coreReferences['Deep Strike'].targetId='core-stealth';},/wrong native Core target/);
mutateCore('wrong Deadly Demise value',book=>{book.coreReferences['Deadly Demise D3'].parameters.value='D6';},/wrong native Core reference parameters/);
mutateCore('wrong Firing Deck value',book=>{book.coreReferences['Firing Deck 11'].parameters.value=20;},/wrong native Core reference parameters/);
mutateCore('wrong Scouts distance',book=>{book.coreReferences['Scouts 7"'].parameters.distance=9;},/wrong native Core reference parameters/);
mutateCore('wrong Tau Army Rule target',book=>{book.coreReferences['For the Greater Good'].targetId='core-leader';},/wrong Tau Army Rule target/);
const summary={MFM_V16:'PASS',UNIT_BINDINGS:'43/43',DETACHMENTS:'7/7',ENHANCEMENTS:'23/23',LEADER_RECORDS:'9/9',
  LEADER_RELATIONS:'20/20',PAID_OPTIONS:'7/7',PAID_SOURCE_OCCURRENCES:paidProfiles.length,SCHEDULES:schedules,POINT_ROWS:rows,
  EXCLUDED_RAW_LEGENDS_RECIPIENT_OCCURRENCES:3,CORE_FACTUAL_REFERENCES:coreReferences,CORE_TEXT_COPIED:false,
  NEGATIVE_CONTROLS:`${controls.length}/${controls.length}`,controls,VALUES_COPIED:false};
const reportIndex=process.argv.indexOf('--report');
if(reportIndex!==-1){assert.ok(process.argv[reportIndex+1],'missing --report path');fs.writeFileSync(process.argv[reportIndex+1],JSON.stringify(summary,null,2)+'\n');}
console.log(JSON.stringify(summary));
