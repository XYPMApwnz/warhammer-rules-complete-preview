/** Existing native card/presenter pipeline; no UI registration or Mega Glossary. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
import {buildGameplayPresentation as smPresentation} from '../../space-marines/v2/gameplay-presentation-build.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {buildGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
const clone=structuredClone;
export function buildGameplayPresentation(built=buildDarkAngelsContracts()){
 const before=JSON.stringify(built.book),payload=clone(built.native.payload),sm=smPresentation(built.sm);
 const central=createEffectiveMfmCatalog(),records=new Map(Object.values(central.catalog).filter(Array.isArray).flat().filter(row=>row?.id).map(row=>[row.id,row]));
 const projected=projectArmyBook(built.book,records,{title:'Dark Angels',edition:'11th Edition'});
 const cards=new Map(payload.cards.map(card=>[card.id,card])),fresh=new Map(projected.cards.map(card=>[card.id,card]));
 const smCards=new Map(sm.cards.map(card=>[card.id,card]));
 for(const card of payload.cards){
  const source=fresh.get(card.id);if(!source)continue;
  const fields=new Map(card.fields.map(field=>[field.id,field])),smFields=new Map((smCards.get(card.id)?.fields||[]).map(field=>[field.id,field]));
  card.fields=source.fields.map(field=>({...clone(fields.get(field.id)||{}),...clone(smFields.get(field.id)||{}),...field,
   ...(fields.get(field.id)?.presentationPath?{presentationPath:fields.get(field.id).presentationPath}:{}),
   ...(smFields.get(field.id)?.displayValue!==undefined?{displayValue:smFields.get(field.id).displayValue}:{})}));
 }
 // Use the established Core projector's complete canonical closure, including
 // FAQ/relationship targets whose identities do not start with core-*.
 const glossary=buildGlossary({model:built.book,coreCatalog:createEffectiveCoreCatalog()});
 for(const card of glossary.coreCards.filter(card=>!cards.has(card.id))){
  payload.cards.push(clone(card));cards.set(card.id,payload.cards.at(-1));
 }
 payload.factManifest.push(...glossary.coreFactManifest);
 payload.glossary=glossary.index;
 const fieldIds=new Set(payload.cards.flatMap(card=>card.fields.map(field=>field.id)));
 const fields=Object.fromEntries(Object.entries(sm.datasheetPresentation.referenceBindings.fields).filter(([id])=>fieldIds.has(id)));
 for(const proof of built.artifact.nativeAbilities){
  const card=cards.get(proof.id),field=card.fields.find(field=>field.source.path==='/label');
  assert.equal(field.value,proof.quote);assert.ok(cards.has(proof.canonicalAbilityId),'Missing canonical native definition');
  card.referenceGroupLabel='CORE ABILITIES';
  fields[field.id]=[{start:0,end:field.value.length,targetId:proof.canonicalAbilityId,group:'CORE ABILITIES',parameters:clone(proof.parameters)}];
 }
 payload.datasheetPresentation.referenceBindings={schema:'army-book-app-v2/datasheet-reference-bindings/v1',fields};
 payload.ruleContractIds=built.book.entities.filter(entity=>entity.ruleContract).map(entity=>entity.id);
 payload.rulePresentationLimitations={...payload.rulePresentationLimitations,scope:'STAGE_3D_SOURCE_PROVEN_STATIC_GAMEPLAY',
  chapterContext:'INTRINSIC_GENERIC_CHAPTER_NOT_PROVEN; ARMY_APPLICABILITY_VALIDATED_SEPARATELY',
  runtime:'EXISTING_SHARED_PHYSICAL_RUNTIME',sourceCoverage:clone(built.artifact.coverage),
  physicalChapterContext:'16 FIXED_SOURCE_CHAPTERS; 26 CONDITIONAL ARMY-MEMBERSHIP GRANTS; GENERIC-ONLY ARMY CONTEXT NOT_PROVEN',
  conditionalFnp:'FULL_QUALIFIED_SOURCE_TEXT; NO_UNCONDITIONAL_FNP',
  battleState:'NOT_SIMULATED',relations:'INACTIVE_SOURCE_DECLARATIONS',
  importer:'NOT_IMPLEMENTED',frontend:'NOT_REGISTERED_OR_BROWSER_VERIFIED'};
 assert.equal(cards.size,payload.cards.length);assert.equal(JSON.stringify(built.book),before);
 return payload;
}
export function writeGameplayPresentation({check=false}={}){
 const payload=buildGameplayPresentation(),file=new URL('./generated/gameplay-presentation.json',import.meta.url),bytes=JSON.stringify(payload,null,2)+'\n';
 if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale DA gameplay presentation');else fs.writeFileSync(file,bytes);
 return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({cards:writeGameplayPresentation({check:process.argv.includes('--check')}).cards.length,status:'PASS'}));
