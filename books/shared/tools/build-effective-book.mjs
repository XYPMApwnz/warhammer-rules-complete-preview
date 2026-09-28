import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {assertRosterUnitGameplayProjection,assertWeaponProfileIdentityProjection,createRosterCatalog,serializeRosterCatalog} from './build-roster-catalog.mjs';
import {createArmyBookTargetBuild} from './build-army-book-targets.mjs';
import {validateEffectContractsAgainstCatalog} from './effect-contract.mjs';
import {runPresentationHook,validateEffectiveBookModel} from './effective-book-model.mjs';
import {assertRosterBaseStatProjection} from './canonical-unit-stats.mjs';
import {assertRosterWeaponFactProjection} from './canonical-weapon-profile-facts.mjs';

const moduleFor=async(context,relative,label)=>{
  if(typeof relative!=='string'||!relative.trim())throw new Error(`${context.config.id}: ${label} is required`);
  const file=path.resolve(context.repo,relative);
  if(!file.startsWith(path.resolve(context.repo)+path.sep)||!fs.existsSync(file))throw new Error(`${context.config.id}: invalid ${label}: ${relative}`);
  return import(pathToFileURL(file).href);
};

export async function buildEffectiveBook(context,{projectionOnly=false}={}){
  const spec=context.config.effectiveModel;
  if(!spec||spec.schema!=='wh40k-effective-book-model/v1')throw new Error(`${context.config.id}: effectiveModel contract is missing or unsupported`);
  const adapter=await moduleFor(context,spec.sourceAdapter,'effectiveModel.sourceAdapter');
  const adapt=adapter[spec.sourceAdapterExport||'buildEffectiveBookModel'];
  if(typeof adapt!=='function')throw new Error(`${context.config.id}: source adapter export is missing`);
  const model=validateEffectiveBookModel(await adapt(context));
  if(model.book.id!==context.config.id)throw new Error(`${context.config.id}: source adapter returned ${model.book.id}`);
  if(projectionOnly)return {effectivePointsProjection:model.effectivePointsProjection,effectiveBookModel:model};

  const rosterEnhancements=model.enhancements.map(item=>item.type?{
    type:item.type,id:item.id,title:item.runtimeTitle||item.title,text:item.text||'',tags:item.tags||[],
    ...(item.assignment?{assignment:item.assignment}:{}),...(item.owner?{owner:item.owner}:{}),
    detachmentId:item.detachmentId,sourceBookId:item.sourceBookId,legacyKey:item.legacyKey||item.ruleId||item.id
  }:{
    title:item.runtimeTitle||item.title,text:item.text||'',id:item.id,...(item.eligibility?{eligibility:item.eligibility}:{}),tags:item.tags||[],
    ...(item.assignment?{assignment:item.assignment}:{}),
    detachmentId:item.detachmentId,sourceBookId:item.sourceBookId,legacyKey:item.legacyKey||item.ruleId||item.id
  });
  const rosterCatalog=createRosterCatalog({
    config:context.config,
    units:model.units,
    detachments:model.detachments,
    relationGraphs:model.relationGraphs,
    enhancementContracts:rosterEnhancements,
    effectContracts:model.effectContracts
  });
  assertWeaponProfileIdentityProjection(model.units,rosterCatalog.units,{label:`${context.config.id} effective roster projection`});
  assertRosterBaseStatProjection(model.units,rosterCatalog.units,{label:`${context.config.id} effective roster base-stat projection`,effectContracts:model.effectContracts,projectStatProfiles:rosterCatalog.statProfiles===true,preserveMultipartStatProfiles:rosterCatalog.preserveMultipartStatProfiles===true});
  assertRosterWeaponFactProjection(model.units,rosterCatalog.units,{label:`${context.config.id} effective roster weapon-fact projection`});
  assertRosterUnitGameplayProjection(model.units,model.relationGraphs,rosterCatalog.units,{label:`${context.config.id} effective roster unit-gameplay projection`,enforceCompositionConstraints:rosterCatalog.compositionConstraints===true,projectStatProfiles:rosterCatalog.statProfiles===true,preserveMultipartStatProfiles:rosterCatalog.preserveMultipartStatProfiles===true});
  validateEffectContractsAgainstCatalog(model.effectContractSet,rosterCatalog);

  const renderer=await moduleFor(context,spec.renderer,'effectiveModel.renderer');
  const render=renderer[spec.rendererExport||'renderEffectiveBook'];
  if(typeof render!=='function')throw new Error(`${context.config.id}: effective renderer export is missing`);
  const rendered=await runPresentationHook(model,readonly=>render(context,readonly,{rosterCatalog}));
  if(!rendered||typeof rendered.readerSource!=='string'||typeof rendered.indexHtml!=='string'||typeof rendered.dataJs!=='string')throw new Error(`${context.config.id}: renderer returned an incomplete publication result`);
  if(typeof rendered.validate==='function')throw new Error(`${context.config.id}: renderer result must contain data only`);
  const targetBuild=createArmyBookTargetBuild(rendered.readerSource,{runtimeVersions:context.runtimeVersions});
  const outputs=new Map([
    ['index.html',rendered.indexHtml],
    ['reader.html',targetBuild.readerHtml],
    ['scripts/data.js',rendered.dataJs],
    ['scripts/target-data.js',targetBuild.targetDataJs],
    ['scripts/roster-data.js',serializeRosterCatalog(rosterCatalog)]
  ]);
  for(const [relative,content] of rendered.additionalOutputs||[]){
    if(outputs.has(relative))throw new Error(`${context.config.id}: duplicate rendered output ${relative}`);
    outputs.set(relative,content);
  }
  return {outputs,normalizeLineEndings:rendered.normalizeLineEndings===true,summary:rendered.summary,effectiveBookModel:model};
}
