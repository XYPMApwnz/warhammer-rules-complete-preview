import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../books/shared/tools/canonical-build-contract.mjs';
import {createEffectiveMfmArmyProjection} from '../books/shared/tools/effective-mfm-army-projection.mjs';
import {applyDeathGuardMfmOwnership,buildDeathGuardCanonicalModel,buildDeathGuardEffectiveModelInput} from '../books/death-guard/tools/canonical-source-adapter.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const canonical=json('books/death-guard/content/death-guard-rules.en.json');
const projection=createEffectiveMfmArmyProjection('death-guard');
const points=projection.deathGuardPoints();
const expected={datasheets:36,detachments:9,enhancements:30};
const apply=(book=canonical,mfm=points)=>applyDeathGuardMfmOwnership(structuredClone(book),structuredClone(mfm),expected);
const rejects=(label,mutateMfm)=>{const mfm=structuredClone(points);mutateMfm(mfm);assert.throws(()=>apply(canonical,mfm),/Death Guard MFM ownership:/,label);};
const units=book=>new Map(book.sections.filter(section=>section.kind==='unit').map(unit=>[unit.id,unit]));
const detachments=book=>new Map(book.sections.filter(section=>section.id?.startsWith('detachment-')).map(item=>[item.id,item]));
const enhancementBlocks=book=>new Map([...detachments(book)].flatMap(([detachmentId,section])=>(section.subsections||[]).filter(part=>part.title==='Enhancements').flatMap(part=>(part.blocks||[]).map(item=>[`${detachmentId}\0${item.id}`,item]))));
const ownedSnapshot=book=>({
  units:[...units(book)].map(([id,unit])=>({id,points:unit.points,wargear:unit.blocks.find(block=>block.type==='points')?.wargear||[]})),
  detachments:[...detachments(book)].map(([id,item])=>({id,metadata:item.blocks.find(block=>block.type==='p'&&/Force Disposition:/i.test(block.text||''))?.text})),
  enhancements:[...enhancementBlocks(book)].map(([id,item])=>({id,title:item.title}))
});

assert.equal(points.source.version,'v1.5','current centralized MFM source');
assert.deepEqual(points.counts,{units:36,detachments:9,enhancements:30,pricedOptions:2},'centralized DG inventory');
assert.equal(points.units.reduce((total,item)=>total+item.points.length,0),60,'structured point schedules');
assert.equal(points.units.reduce((total,item)=>total+item.paidWargear.length,0),2,'paid-upgrade inventory');
for(const item of [...points.units,...points.detachments,...points.enhancements])assert.ok(item.mfmRecordId,`missing stable MFM record ID for ${item.id||item.unitId}`);
for(const item of points.units.flatMap(unit=>unit.paidWargear))assert.ok(item.mfmRecordId,'paid upgrade must have a stable MFM record ID');

const baseline=apply();
const renamed=structuredClone(points);renamed.detachments[0].title='DISPLAY-ONLY DETACHMENT RENAME';
assert.deepEqual(ownedSnapshot(apply(canonical,renamed)),ownedSnapshot(baseline),'Detachment display title must not determine MFM identity');

const changed=structuredClone(points),mortarion=changed.units.find(item=>item.unitId==='unit-mortarion');mortarion.points[0].value++;
const changedBook=apply(canonical,changed),changedMortarion=units(changedBook).get('unit-mortarion');
assert.equal(changedMortarion.points[0].value,mortarion.points[0].value,'central MFM unit value must propagate');
assert.equal(changedMortarion.blocks.find(block=>block.type==='points').values[0].value,mortarion.points[0].value,'central MFM point block value must propagate');

const stale=structuredClone(canonical),staleUnits=units(stale),staleDetachments=detachments(stale),staleEnhancements=enhancementBlocks(stale);
for(const unit of staleUnits.values()){
  for(const row of unit.points||[])row.value=99999;
  const block=unit.blocks.find(item=>item.type==='points');for(const row of block?.values||[])row.value=99999;if(block)block.wargear=[{label:'poison duplicate',value:99999}];
}
for(const section of staleDetachments.values()){
  const block=section.blocks.find(item=>item.type==='p'&&/Force Disposition:/i.test(item.text||''));block.text='Force Disposition: POISON. Detachment Points: 999DP. '+String(block.text).replace(/^.*?Detachment Points:\s*[^.]+\.\s*/i,'');
}
for(const block of staleEnhancements.values())block.title=String(block.title).replace(/\d+\s*pts$/i,'999 pts');
assert.deepEqual(ownedSnapshot(apply(stale,points)),ownedSnapshot(baseline),'stale DG MFM copies must have zero effective influence');

rejects('unknown Datasheet binding',mfm=>{mfm.units[0].unitId='unit-unknown';mfm.units[0].id='unit-unknown';});
rejects('duplicate Datasheet binding',mfm=>{mfm.units[1].unitId=mfm.units[0].unitId;mfm.units[1].id=mfm.units[0].id;});
rejects('unknown Detachment binding',mfm=>{mfm.detachments[0].id='detachment-unknown';mfm.detachments[0].detachmentId='detachment-unknown';});
rejects('unknown Enhancement binding',mfm=>{mfm.enhancements[0].id='enhancement-unknown';});
rejects('wrong Enhancement scope',mfm=>{mfm.enhancements[0].detachmentId=mfm.detachments.find(item=>item.id!==mfm.enhancements[0].detachmentId).id;});
rejects('duplicate paid-upgrade binding',mfm=>{const paid=mfm.units.flatMap(item=>item.paidWargear);paid[1].mfmRecordId=paid[0].mfmRecordId;});

const context=createCanonicalBuildContext({args:[],configPath:path.join(root,'books/death-guard/book.config.json'),repo:root});
const canonicalModel=buildDeathGuardCanonicalModel(context),poisonedModel=structuredClone(canonicalModel),poisonedBlock=poisonedModel.book.sections.flatMap(section=>section.subsections||[]).flatMap(section=>section.blocks||[]).find(item=>item.type==='enhancement');
poisonedBlock.title=poisonedBlock.title.replace(/\d+\s*pts$/i,'999 pts');
const effective=buildDeathGuardEffectiveModelInput(context,poisonedModel),effectiveEnhancement=effective.enhancements.find(item=>item.id===poisonedBlock.id);
assert.notEqual(effectiveEnhancement.value,999,'stale canonical Enhancement price must not become effective');
assert.match(effectiveEnhancement.runtimeTitle,new RegExp(`- ${effectiveEnhancement.value} pts$`),'runtime title must use centralized MFM price');

const overlayEdges=[
  ['unit-biologus-putrifier','unit-plague-marines'],['unit-foul-blightspawn','unit-plague-marines'],['unit-icon-bearer','unit-plague-marines'],
  ['unit-noxious-blightbringer','unit-plague-marines'],['unit-noxious-blightbringer','unit-poxwalkers'],['unit-plague-surgeon','unit-plague-marines'],['unit-tallyman','unit-plague-marines']
].map(([sourceId,targetId])=>({role:'support',sourceId,targetId}));
const relationEdges=projection.relationEdges({effectiveUnitIds:[...units(baseline).keys()],armyEdges:overlayEdges});
assert.equal(relationEdges.filter(edge=>edge.overlaySource==='ARMY_EFFECTIVE_MODEL').length,7,'seven DG Army-owned Support overlays');

const adapter=fs.readFileSync(path.join(root,'books/death-guard/tools/canonical-source-adapter.mjs'),'utf8');
for(const forbidden of ['pointTierContract','reconcilePointRows','reconcileNamedRows','enhancementIdentity','officialEnhancements'])assert.ok(!adapter.includes(forbidden),`retired MFM co-authority helper remains: ${forbidden}`);
assert.ok(!/officialDetachments=uniqueIndex\([^\n]+slug\(/.test(adapter),'Detachment MFM identity must not derive from title');
assert.ok(!/publicationByEnhancementId[^\n]+titleKey/.test(adapter),'Enhancement MFM identity must not derive from title');

console.log('Death Guard MFM ownership QA: 24/24 PASS');
