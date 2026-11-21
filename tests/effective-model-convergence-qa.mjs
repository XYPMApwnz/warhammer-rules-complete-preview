import {assertQaTempPath,cleanupQaTempDir,createQaTempDir} from './helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createCanonicalBuildContext} from '../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../books/shared/tools/build-army-book.mjs';
import {runPresentationHook,validateEffectiveBookModel} from '../books/shared/tools/effective-book-model.mjs';
import {renderDeathGuardReader} from '../books/death-guard/tools/presentation-hook.mjs';
import {renderEffectiveBook as renderStructuredEffectiveBook} from '../books/shared/tools/render-structured-effective-book.mjs';
import {loadPublicationInventory,selectPublicationBooks} from '../books/shared/tools/publication-inventory.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stable=value=>value instanceof Map?['Map',[...value].sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,stable(item)])]:Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const idHash=items=>crypto.createHash('sha256').update(JSON.stringify([...items].sort())).digest('hex');
const expected={
  'death-guard':{units:36,tiers:57,wargear:2,detachments:9,enhancements:30,relations:48,effects:49,profiles:36,unitHash:'ed93e400c628d783566a6344f37e881954fce3b27a5df8ef87c0da97571bb1af',detachmentHash:'95e2dec24b53131c5a3c0d1db5c2eecb7144983a42761eff82434155bac0e399',enhancementHash:'c55483300df859d31f335907e63b788b18a8825cec4478bb6b08af551932de0e'},
  'adeptus-mechanicus':{units:34,tiers:68,wargear:2,detachments:10,enhancements:34,relations:82,effects:42,profiles:34,unitHash:'312f7dc5730f3796d98065f4e477f0132bc8a42a40d0da4b5b66931aa9bbc26d',detachmentHash:'deef2e62ed5a3112f2e8a8ce8ef038e705e45335df80f7977db283660bdb854b',enhancementHash:'d423f8f7aa131788a0291aed6321f4fb75955ae98384cc0c39bb3702ca2eea16'}
};

async function construct(id){
  const configPath=path.join(root,'books',id,'book.config.json'),context=createCanonicalBuildContext({configPath,args:['--check']});
  const config=context.config,spec=config.effectiveModel;
  assert.equal(config.buildExtension,undefined,`${id}: full semantic buildExtension must be retired`);
  assert.equal(spec?.schema,'wh40k-effective-book-model/v1');
  const reads=[],original=context.readJson;context.readJson=file=>(reads.push(String(file).replaceAll('\\','/')),original(file));
  const module=await import(pathToFileURL(path.join(root,spec.sourceAdapter)).href),adapt=module[spec.sourceAdapterExport];
  assert.equal(typeof adapt,'function',`${id}: source adapter export is missing`);
  const model=validateEffectiveBookModel(await adapt(context));
  assert.equal(reads.some(file=>/(?:reader\.html|scripts\/(?:target|roster)-data\.js|mobile\/.*\.html)$/.test(file)),false,`${id}: source adapter read a generated effective output`);
  return {config,context,model,reads};
}

const first={};
for(const id of Object.keys(expected)){
  const {config,model}=await construct(id),want=expected[id];first[id]=model;
  const relations=[...model.relationGraphs.values()].reduce((sum,graph)=>sum+Object.values(graph).reduce((n,items)=>n+(Array.isArray(items)?items.length:0),0),0);
  assert.deepEqual({units:model.units.length,tiers:model.units.reduce((n,item)=>n+item.points.length,0),wargear:model.units.reduce((n,item)=>n+(item.paidWargear||[]).length,0),detachments:model.detachments.length,enhancements:model.enhancements.length,relations,effects:model.effectContracts.length,profiles:model.ruleProfiles?.size||model.units.filter(item=>item.ruleProfile).length},{units:want.units,tiers:want.tiers,wargear:want.wargear,detachments:want.detachments,enhancements:want.enhancements,relations:want.relations,effects:want.effects,profiles:want.profiles});
  assert.equal(idHash(model.units.map(item=>item.id)),want.unitHash);
  assert.equal(idHash(model.detachments.map(item=>item.id)),want.detachmentHash);
  assert.equal(idHash(model.enhancements.map(item=>item.id)),want.enhancementHash);
  assert.equal(config.generatedOutputs.filter(item=>item.lifecycle==='NORMAL_BUILD_OUTPUT').every(item=>item.producer==='books/shared/tools/build-army-book.mjs'||item.class==='MOBILE_COMPATIBILITY_ROUTES'||item.class==='COMPATIBLE_RULES_MATRIX'),true);
}

const publicBooks=selectPublicationBooks(loadPublicationInventory({root}),'library');
assert.equal(publicBooks.length,9,'effective-model architecture scope');
const allModels=new Map(Object.entries(first));
for(const book of publicBooks.filter(book=>!allModels.has(book.id))){
  const context=createCanonicalBuildContext({configPath:path.join(root,book.config),repo:root,args:['--check']});
  assert.equal(context.config.buildExtension,undefined,`${book.id}: full semantic buildExtension must be retired`);
  const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
  validateEffectiveBookModel(model);
  assert.equal(model.schema,'wh40k-effective-book-model/v1',`${book.id}: shared effective schema`);
  assert.equal(model.book.id,book.id,`${book.id}: effective model owner`);
  assert.ok(model.units.length&&model.detachments.length&&model.effectivePointsProjection,`${book.id}: effective factual partitions`);
  allModels.set(book.id,model);
}
assert.deepEqual([...allModels.keys()].sort(),publicBooks.map(book=>book.id).sort(),'all nine public books must enter the validated effective-model lifecycle');

const tauRosterPricePoison=structuredClone(allModels.get('tau-empire'));
const tauStrike=tauRosterPricePoison.rosterCatalog.enhancements.find(item=>item.id==='enhancement-strike-swiftly');
assert.ok(tauStrike,'T’au Strike Swiftly roster projection fixture');
tauStrike.value=987651;
assert.throws(()=>validateEffectiveBookModel(tauRosterPricePoison),/conflicting roster Enhancement points/,'nested roster Enhancement price remained an independent factual owner');
const tauRosterIdentityPoison=structuredClone(allModels.get('tau-empire'));
tauRosterIdentityPoison.rosterCatalog.enhancements.find(item=>item.id==='enhancement-strike-swiftly').id='enhancement-count-preserving-roster-poison';
assert.throws(()=>validateEffectiveBookModel(tauRosterIdentityPoison),/has no canonical identity/,'nested roster Enhancement identity remained independently mutable');

const amDetachmentGlossaryPoison=structuredClone(first['adeptus-mechanicus']);
amDetachmentGlossaryPoison.glossaryFacts={detachmentSources:[{revision:'poison',detachments:[{id:amDetachmentGlossaryPoison.detachments[0].id,text:'D1_AM_DETACHMENT_GLOSSARY_POISON'}]}]};
assert.throws(()=>validateEffectiveBookModel(amDetachmentGlossaryPoison),/glossaryFacts must be derived from the final effective model/,'AM copied Detachment glossary facts remained independently mutable');
const amEnhancementGlossaryPoison=structuredClone(first['adeptus-mechanicus']);
amEnhancementGlossaryPoison.glossaryFacts={detachmentSources:[{revision:'poison',detachments:[{id:amEnhancementGlossaryPoison.detachments[0].id,enhancements:[{id:amEnhancementGlossaryPoison.enhancements[0].id,text:'D1_AM_ENHANCEMENT_GLOSSARY_POISON'}]}]}]};
assert.throws(()=>validateEffectiveBookModel(amEnhancementGlossaryPoison),/glossaryFacts must be derived from the final effective model/,'AM copied Enhancement glossary facts remained independently mutable');

const duplicate=structuredClone(first['death-guard']);duplicate.units.push(structuredClone(duplicate.units[0]));assert.throws(()=>validateEffectiveBookModel(duplicate),/duplicate death-guard unit identity/);
const unknownRelation=structuredClone(first['adeptus-mechanicus']);unknownRelation.relationGraphs.get(unknownRelation.units[0].id).canLead=[{unitId:'unit-unknown-effective-target'}];assert.throws(()=>validateEffectiveBookModel(unknownRelation),/unknown relation target/);
const substituted=structuredClone(first['death-guard']);substituted.units[0].id='unit-count-preserving-substitution';assert.throws(()=>validateEffectiveBookModel(substituted),/(conflicting unit partitions|canonical rule profile|weapon profile belongs to wrong parent)/);
await assert.rejects(()=>runPresentationHook(first['death-guard'],model=>{model.relationGraphs.set('unit-poison',{});return{};}),/semantic mutation/);

const secondAm=(await construct('adeptus-mechanicus')).model,secondDg=(await construct('death-guard')).model;
assert.equal(digest(secondAm),digest(first['adeptus-mechanicus']),'adapter construction order changed AM');
assert.equal(digest(secondDg),digest(first['death-guard']),'adapter construction order changed DG');

const dgProbe=await construct('death-guard'),dgBaseline=renderDeathGuardReader(dgProbe.context,dgProbe.model),dgShadow=structuredClone(dgProbe.model);
const dgChoicePresentationPoison=structuredClone(dgProbe.model);
dgChoicePresentationPoison.presentation.structuredChoices={'mortarion-ability-lord-of-the-death-guard':{choices:[{id:'poison',title:'Poison',text:'On a 5+'}]}};
assert.equal(renderDeathGuardReader(dgProbe.context,dgChoicePresentationPoison),dgBaseline,'DG presentation choice text changed published gameplay facts');
const dgConflictPresentationPoison=structuredClone(dgProbe.model);
dgConflictPresentationPoison.presentation.sourceConflicts=[{id:'stratagem-leechspore-eruption',productionValue:'seven or more wounds'}];
assert.equal(renderDeathGuardReader(dgProbe.context,dgConflictPresentationPoison),dgBaseline,'DG presentation conflict replacement changed published gameplay facts');
const mortarionSection=dgShadow.book.sections.find(item=>item.id==='unit-mortarion'),mortarionPoints=mortarionSection.blocks.find(item=>item.type==='points');
mortarionPoints.values[0].value=987654;
dgShadow.book.sections=dgShadow.book.sections.filter(item=>item.id!=='unit-mortarion');
const nestedEnhancement=dgShadow.detachments.flatMap(item=>(item.subsections||[]).flatMap(part=>(part.blocks||[]).filter(block=>block.type==='enhancement')))[0];
nestedEnhancement.text='D1_DG_PRESENTATION_TEXT_POISON';nestedEnhancement.owner={subject:'D1_DG_PRESENTATION_OWNER_POISON'};
dgShadow.ruleFacts.get('unit-mortarion').abilities.push('D1_DG_RULE_FACT_POISON');
assert.equal(renderDeathGuardReader(dgProbe.context,dgShadow),dgBaseline,'DG retained sections or ruleFacts changed canonical publication');
const dgContradiction=structuredClone(dgProbe.model),dgDetachment=dgContradiction.detachments[0],dgMetadata=dgDetachment.blocks.find(block=>block.type==='p'&&/Force Disposition:/i.test(block.text||''));
dgMetadata.text=dgMetadata.text.replace(/Detachment Points:\s*[^.]+/i,'Detachment Points: 987654');
assert.throws(()=>renderDeathGuardReader(dgProbe.context,dgContradiction),/presentation metadata conflicts with effective Detachment facts/,'DG presentation contradiction must fail closed');
const dgDispositionContradiction=structuredClone(dgProbe.model),dgDispositionDetachment=dgDispositionContradiction.detachments[0],dgDispositionMetadata=dgDispositionDetachment.blocks.find(block=>block.type==='p'&&/Force Disposition:/i.test(block.text||''));
dgDispositionMetadata.text=dgDispositionMetadata.text.replace(/Force Disposition:\s*[^.]+/i,'Force Disposition: D1_DG_DISPOSITION_POISON');
assert.throws(()=>renderDeathGuardReader(dgProbe.context,dgDispositionContradiction),/presentation metadata conflicts with effective Detachment facts/,'DG presentation force-Disposition contradiction must fail closed');

const amProbe=await construct('adeptus-mechanicus'),amBaseline=(await renderStructuredEffectiveBook(amProbe.context,amProbe.model)).readerSource,amShadow=structuredClone(amProbe.model);
amShadow.detachments[0].dp=987654;amShadow.detachments[0].disposition='D1_AM_DISPOSITION_POISON';
assert.equal((await renderStructuredEffectiveBook(amProbe.context,amShadow)).readerSource,amBaseline,'AM compatibility aliases changed canonical publication');

async function sharedAuthorityProbe(bookId,{dependency=false}={}){
  const configPath=path.join(root,'books',bookId,'book.config.json'),context=createCanonicalBuildContext({configPath,args:[]}),temporary=createQaTempDir(`d1-${bookId}-`),nativeClone=globalThis.structuredClone;
  assert.ok(assertQaTempPath(temporary),`${bookId}: temporary output escaped its declared root`);
  context.root=temporary;
  const modelPoint=123456,shadowPoint=987654,modelDetachmentPoints=234567,shadowDetachmentPoints=876543,modelRule='D1_MODEL_ARMY_RULE_MARKER',shadowRule='D1_SHADOW_ARMY_RULE_POISON',modelCatalog='D1 Model Roster Enhancement',shadowCatalog='D1 Shadow Roster Enhancement Poison';
  let intercepted=false,targetUnitId='';
  globalThis.structuredClone=value=>{
    const cloned=nativeClone(value);
    if(!intercepted&&value?.schema==='wh40k-effective-book-model/v1'&&value.book?.id===bookId){
      intercepted=true;
      const index=dependency?cloned.units.findIndex(item=>item.sourceBookId&&item.sourceBookId!==bookId):0;
      assert.ok(index>=0,`${bookId}: dependency probe requires an inherited unit`);targetUnitId=cloned.units[index].id;
      value.units[index].points[0].value=shadowPoint;
      value.detachments[0].detachmentPoints=shadowDetachmentPoints;
      value.rules.armyRules[0].text=shadowRule;
      value.rosterCatalog.enhancements[0].title=shadowCatalog;
      cloned.units[index].points[0].value=modelPoint;
      cloned.effectivePointsProjection.units.find(item=>item.id===targetUnitId).points[0].value=modelPoint;
      cloned.detachments[0].detachmentPoints=modelDetachmentPoints;
      cloned.effectivePointsProjection.detachments.find(item=>item.id===cloned.detachments[0].id).detachmentPoints=modelDetachmentPoints;
      cloned.rules.armyRules[0].text=modelRule;
      cloned.rosterCatalog.enhancements[0].title=modelCatalog;
    }
    return cloned;
  };
  try{await buildCanonicalBook(context);}finally{globalThis.structuredClone=nativeClone;}
  try{
    assert.equal(intercepted,true,`${bookId}: effective model construction was not intercepted`);
    const outputs=['scripts/target-data.js','scripts/roster-data.js','mobile/related-rules.inc','mobile/related-rules.source.inc'].map(file=>path.join(temporary,file)).filter(fs.existsSync).map(file=>fs.readFileSync(file,'utf8')).join('\n');
    assert.match(outputs,new RegExp(String(modelPoint)),`${bookId}: model unit points were not published`);
    assert.match(outputs,new RegExp(String(modelDetachmentPoints)),`${bookId}: model Detachment points were not published`);
    assert.match(outputs,new RegExp(modelRule),`${bookId}: model army rule was not published`);
    assert.match(outputs,new RegExp(modelCatalog),`${bookId}: model roster Enhancement was not published`);
    for(const poison of [shadowPoint,shadowDetachmentPoints,shadowRule,shadowCatalog])assert.doesNotMatch(outputs,new RegExp(String(poison)),`${bookId}: pre-model shadow fact influenced publication`);
    return {targetUnitId,digest:digest(outputs)};
  }finally{cleanupQaTempDir(temporary);}
}
const tyranidsPublication=await sharedAuthorityProbe('tyranids'),tyranidsPublicationAgain=await sharedAuthorityProbe('tyranids');
assert.equal(tyranidsPublicationAgain.digest,tyranidsPublication.digest,'shared effective publication is not deterministic');
const daDependency=await sharedAuthorityProbe('dark-angels',{dependency:true});
assert.ok(daDependency.targetUnitId.startsWith('unit-'),'dependency publication did not consume an effective canonical unit');

async function finalProjectionHandoffProbe(bookId){
  const configPath=path.join(root,'books',bookId,'book.config.json'),context=createCanonicalBuildContext({configPath,args:['--check']}),nativeClone=globalThis.structuredClone;
  const pointMarker=345671,rosterMarker=345672,glossaryMarker=`D1_FINAL_GLOSSARY_${bookId.toUpperCase().replaceAll('-','_')}`;
  let modelPass=0,targetUnitId='',targetEnhancementId='',targetDetachmentId='',targetGlossaryId='';
  globalThis.structuredClone=value=>{
    const cloned=nativeClone(value);
    if(value?.schema==='wh40k-effective-book-model/v1'&&value.book?.id===bookId){
      modelPass+=1;
      if(modelPass===2){
        const unit=cloned.units.find(item=>item.points?.length),projectedUnit=unit&&cloned.effectivePointsProjection.units.find(item=>item.id===unit.id);
        assert.ok(unit&&projectedUnit,`${bookId}: final points handoff fixture`);targetUnitId=unit.id;unit.points[0].value=pointMarker;projectedUnit.points[0].value=pointMarker;
        const enhancement=cloned.enhancements.find(item=>cloned.rosterCatalog.enhancements.some(roster=>roster.detachmentId===item.detachmentId&&[item.id,item.ruleId,item.sourceId,item.legacyKey,...(item.canonicalEffectRecordIds||[])].filter(Boolean).includes(roster.id)));
        assert.ok(enhancement,`${bookId}: final roster handoff fixture`);targetEnhancementId=enhancement.id;targetDetachmentId=enhancement.detachmentId;enhancement.value=rosterMarker;
        cloned.effectivePointsProjection.enhancements.find(item=>item.detachmentId===targetDetachmentId&&item.id===targetEnhancementId).value=rosterMarker;
        cloned.rosterCatalog.enhancements.find(item=>item.detachmentId===targetDetachmentId&&[enhancement.id,enhancement.ruleId,enhancement.sourceId,enhancement.legacyKey,...(enhancement.canonicalEffectRecordIds||[])].filter(Boolean).includes(item.id)).value=rosterMarker;
        const glossary=cloned.glossary[0];assert.ok(glossary,`${bookId}: final glossary handoff fixture`);targetGlossaryId=glossary.id;glossary.summary=glossaryMarker;
      }
    }
    return cloned;
  };
  let result;
  try{result=await buildCanonicalBook(context,{projectionOnly:true});}finally{globalThis.structuredClone=nativeClone;}
  assert.equal(modelPass,2,`${bookId}: expected intermediate and final effective-model passes`);
  const model=result.effectiveBookModel;
  assert.equal(result.effectivePointsProjection.units.find(item=>item.id===targetUnitId).points[0].value,pointMarker,`${bookId}: returned early points projection instead of final model projection`);
  assert.equal(model.rosterCatalog.enhancements.find(item=>item.detachmentId===targetDetachmentId&&item.value===rosterMarker)?.value,rosterMarker,`${bookId}: returned early roster projection instead of final model projection`);
  assert.equal(model.glossary.find(item=>item.id===targetGlossaryId).summary,glossaryMarker,`${bookId}: returned early glossary projection instead of final model projection`);
}
for(const bookId of ['tyranids','space-marines','dark-angels'])await finalProjectionHandoffProbe(bookId);

const sharedBuilder=fs.readFileSync(path.join(root,'books/shared/tools/build-army-book.mjs'),'utf8');
assert.match(sharedBuilder,/createEffectiveBookModel\(/,'shared seven-book path must validate the same effective model contract');
const dgRenderer=fs.readFileSync(path.join(root,'books/death-guard/tools/presentation-hook.mjs'),'utf8');
assert.doesNotMatch(dgRenderer,/export\s+(?:async\s+)?function\s+buildCanonicalBook/,'DG presentation hook must not own full semantic assembly');
const amRenderer=fs.readFileSync(path.join(root,'books/shared/tools/render-structured-effective-book.mjs'),'utf8');
assert.doesNotMatch(amRenderer,/createAdeptusMechanicusCanonicalModel|buildAdeptusMechanicusEffectiveModelInput/,'shared structured renderer must consume the effective model');

console.log('Effective model convergence QA: PASS (9/9 validated lifecycle; DG/AM shared schema; effective publication authority; shadow poison isolation; frozen inventories; generated-output independence; fail-closed mutations; presentation isolation; construction-order independence).');
