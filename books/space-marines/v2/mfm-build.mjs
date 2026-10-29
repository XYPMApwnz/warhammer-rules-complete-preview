import {serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
/** Native MFM presentation stage; the central catalog owns all numeric facts.
 * No legacy builder, import, gameplay execution or app registration.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildNativeBook} from './book-build.mjs';
import {consumeMfm} from './mfm-boundary.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {projectBookPresentation} from '../../shared/army-book-app-v2/book-v1-projection.mjs';

const sort=values=>[...values].sort((a,b)=>a.id.localeCompare(b.id));
const clone=structuredClone;

function projectPricedBook(native,consumed){
  const model=clone(native.model),ids=new Set(model.entities.map(entity=>entity.id));
  model.mfm={source:{label:'v1.6'},...Object.fromEntries(Object.entries(consumed.partitions).map(([part,rows])=>
    [part,rows.filter(binding=>ids.has(binding.entityId)).map(value=>clone(value))])),
    relations:[],eligibilityEvidenceBindings:[]};
  // Conditional relations remain typed source declarations until an actual
  // army context is supplied. They are not flattened into unconditional text.
  model.mfm.relationDeclarations=consumed.relationDeclarations.filter(declaration=>ids.has(declaration.sourceId));
  const records=new Map();
  const own=id=>{
    if(records.has(id))return;
    const fact=consumed.records.get(id);assert.ok(fact,'Unresolved central MFM fact '+id);records.set(id,fact);
    for(const child of [...fact.qualifierIds||[],...fact.enhancementCostIds||[]])own(child);
  };
  for(const rows of Object.values(consumed.partitions))for(const binding of rows)if(ids.has(binding.entityId))own(binding.mfmRecordId);
  for(const declaration of model.mfm.relationDeclarations)for(const target of declaration.targets.filter(target=>!target.entityId))own(target.mfmUnitReferenceId);
  for(const entity of model.entities.filter(entity=>entity.kind==='DETACHMENT'))entity.data.ruleId=entity.data.ruleIds[0];
  const generated=prepareSourceProducer(projectArmyBook(model,records,{title:native.payload.book.title,edition:'11th Edition'}));
  const projected=new Map(generated.cards.map(card=>[card.id,card]));
  const cards=native.payload.cards.map(card=>{
    const view=clone(card),fresh=projected.get(card.id);
    view.children=[...view.children,...fresh.children.filter(id=>!ids.has(id))];return view;
  });
  cards.push(...generated.cards.filter(card=>!ids.has(card.id)));
  const payload={...clone(native.payload),book:generated.book,cards:sort(cards),factManifest:sort([
    ...native.payload.factManifest,...generated.factManifest.filter(field=>field.ownerType==='CENTRALIZED_MFM')]),
    bookPresentation:prepareSourceProducer(projectBookPresentation(model,records))};
  payload.rulePresentationLimitations={...payload.rulePresentationLimitations,scope:'STAGE_4A_NATIVE_MFM_BOOK',
    points:'CONFIRMED_CENTRAL_MFM_V1_6',relations:consumed.relationStatus,runtime:'NOT_IMPLEMENTED',
    paidOptions:'CENTRAL_UNIT_OWNED_PRICES_NOT_PHYSICAL_SELECTION_BINDINGS'};
  payload.mfmSource=clone(consumed.source);
  payload.mfmRelationDeclarations=clone(model.mfm.relationDeclarations);
  payload.mfmRelations=clone(consumed.relations.filter(edge=>ids.has(edge.sourceId)&&ids.has(edge.targetId)));
  return {model,payload};
}

export function buildNativeMfmBook({facts,base,cross,canonicalFacts,presentUnitIds}={}){
  const native=buildNativeBook({facts,base,cross});
  const consumed=consumeMfm([...native.model.entities,...native.deathwatch.model.entities],{canonicalFacts,presentUnitIds});
  const main=projectPricedBook(native,consumed),deathwatch=projectPricedBook(native.deathwatch,consumed);
  const coverage={sourceLedger:clone(native.coverage),source:clone(consumed.source),
    provenBindings:Object.fromEntries(['unitBindings','detachmentBindings','enhancementBindings'].map(part=>[part,consumed.partitions[part].length])),
    referenceOnlyUnits:clone(consumed.referenceOnlyUnits),referenceOnlyOwners:clone(consumed.referenceOnlyOwners),
    conditionalRelationStatus:consumed.relationStatus,relationDeclarations:consumed.relationDeclarations.length,
    activeNativeRelationEdges:consumed.relations.length,
    referenceOnlyRecipientOccurrences:consumed.relationDeclarations.flatMap(row=>row.targets).filter(target=>target.status==='REFERENCE_ONLY').length,
    paidOptions:consumed.partitions.paidUpgradeBindings.length,paidOptionPhysicalSelections:'NOT_IMPLEMENTED',
    pointsCoverage:{spaceMarines:consumed.nativePoints.counts,deathwatch:consumed.deathwatchPoints.counts},
    executableEffects:'NOT_IMPLEMENTED',semanticCompleteness:'NOT_PROVEN'};
  return {...main,deathwatch,coverage,consumed};
}

export function writeNativeMfmBook({check=false}={}){
  const result=buildNativeMfmBook();
  for(const [name,value]of [['native-mfm-book',result.model],['mfm-presentation',result.payload],
    ['deathwatch-mfm-presentation',result.deathwatch.payload],['mfm-coverage',result.coverage]]){
    const file=new URL('./generated/'+name+'.json',import.meta.url),bytes=serializeSourceJSON(value);
    if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale native MFM output '+name);else fs.writeFileSync(file,bytes);
  }
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=writeNativeMfmBook({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',sourceCounts:result.coverage.sourceLedger.sourceCounts,
    provenBindings:result.coverage.provenBindings,pointsCoverage:result.coverage.pointsCoverage,
    conditionalRelationStatus:result.coverage.conditionalRelationStatus,
    relationDeclarations:result.coverage.relationDeclarations,referenceOnlyRecipientOccurrences:result.coverage.referenceOnlyRecipientOccurrences}));
}
