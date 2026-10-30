import {parseProducerJSON,serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
/** Isolated native V2 datasheet view. Facts remain in the Stage 2A foundation.
 * Same disposable PROFILE/layout adaptation used by Tyranids/T'au app-build.
 * No legacy Army builder, MFM lookup, roster engine or executable rules.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {buildDatasheetPresentation} from '../../shared/army-book-app-v2/datasheet-v1.mjs';

const read=name=>parseProducerJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const sorted=entities=>[...entities].sort((a,b)=>a.id.localeCompare(b.id));
const key=field=>field.source.path;
const one=(card,path)=>{const field=card.fields.find(f=>key(f)===path);assert.ok(field,`${card.id}: missing ${path}`);return field;};

export function buildNativeDatasheets({facts=read('./generated/effective.json'),base=read('./generated/base.json')}={}){
  facts=prepareSourceProducer(facts);
  base=prepareSourceProducer(base);
  const before=JSON.stringify(facts),baseBefore=JSON.stringify(base);
  const unitIds=new Set(facts.entities.filter(e=>e.kind==='DATASHEET').map(e=>e.id));
  const selected=facts.entities.filter(e=>unitIds.has(e.id)||unitIds.has(e.parentId));
  const original=new Map(selected.map(e=>[e.id,e])),raw=new Map(base.entities.map(e=>[e.id,e]));
  assert.equal(unitIds.size,14);assert.equal(original.size,selected.length);
  assert.ok(selected.every(e=>e.bookId==='blood-angels'));
  const model={...clone(facts),entities:sorted(clone(selected)),currentness:{currentness:'ACCEPTED_SNAPSHOT',
    lastReconciledSource:'Accepted Blood Angels 11E capture 22 October 2026; partial official corroboration'},
    mfm:{source:{label:'NOT_ENROLLED'},unitBindings:[],detachmentBindings:[],enhancementBindings:[],
      paidUpgradeBindings:[],leaderEligibilityBindings:[],qualifierBindings:[],relations:[],eligibilityEvidenceBindings:[]}};
  const entities=new Map(model.entities.map(e=>[e.id,e]));
  for(const entity of model.entities){
    entity.sourceKind=entity.kind; // Disposable view alias, never a new canonical identity.
    if(entity.kind==='MODEL_PROFILE')entity.kind='PROFILE';
    if(entity.kind==='WEAPON_PROFILE'){
      // Existing ranged/melee layout vocabulary, derived from explicit source Range.
      assert.ok(entity.data.range==='Melee'||/^\d+"$/.test(entity.data.range),'Unclassified weapon range');
      entity.data.mode=entity.data.range==='Melee'?'melee':'ranged';
    }
    if(entity.kind==='INVULNERABLE_SAVE'){
      entity.data.profileIds=clone(entity.data.sourceProfileIds);
      const staticRecipient=!entity.data.conditionText||entity.data.scopeQualification==='EXPLICIT_NAMED_MODEL';
      if(staticRecipient)for(const id of entity.data.sourceProfileIds){
        const profile=entities.get(id);
        assert.equal(profile?.kind==='MODEL_PROFILE'||profile?.kind==='PROFILE',true,'Unknown save recipient');
        assert.equal(profile.parentId,entity.parentId,'Foreign save recipient');
        assert.ok(!profile.data.invulnerableSaveId,'Overlapping static invulnerable declarations');
        profile.data.invulnerableSaveId=entity.id;
      }
    }
  }
  const payload=prepareSourceProducer(projectArmyBook(model,new Map(),{title:'Blood Angels',edition:'11th Edition'}));
  const cards=new Map(payload.cards.map(c=>[c.id,c]));
  payload.datasheetPresentation=buildDatasheetPresentation(model,{units:{}},{bindings:{},records:new Map()});
  const roles=payload.datasheetPresentation.sectionRoles;
  // Retain all factual fields and their canonical addresses. Only text layout is aliased.
  for(const entity of model.entities){
    const card=cards.get(entity.id);
    card.provenance=clone(entity.provenance);card.fieldProvenance=clone(entity.fieldProvenance||{});
    if(['DATASHEET_SECTION','DATASHEET_ABILITY','INVULNERABLE_SAVE'].includes(entity.sourceKind)){
      one(card,'/text').presentationPath='/blocks/0/text';
      if(entity.sourceKind!=='DATASHEET_SECTION'){
        card.kind='DATASHEET_SECTION';
        roles[entity.id]=entity.sourceKind==='DATASHEET_ABILITY'?'abilities':'additional';
      }
    }
  }
  for(const unit of model.entities.filter(e=>e.kind==='DATASHEET')){
    const card=cards.get(unit.id),sections=model.entities.filter(e=>e.parentId===unit.id&&e.sourceKind==='DATASHEET_SECTION');
    for(const section of sections.filter(e=>['ABILITIES','WARGEAR ABILITIES','CHIEF LIBRARIAN (PSYKER LEVEL 3)'].includes(e.data.title))){
      const abilities=model.entities.filter(e=>e.parentId===unit.id&&e.sourceKind==='DATASHEET_ABILITY'&&e.data.section===section.data.title);
      let remaining=raw.get(section.id).data.text;
      for(const ability of abilities){const text=raw.get(ability.id).data.text;assert.ok(remaining.includes(text),'Uncovered source ability');remaining=remaining.replace(text,'');}
      assert.equal(remaining.replace(section.data.title,'').trim(),'','Unrepresented ability-section paragraph');
      // Whole source section stays as evidence. Show each effective ability once,
      // including field-level official corrections, instead of its older aggregate.
      card.children=card.children.filter(id=>id!==section.id);
    }
    const wargearSections=sections.filter(e=>e.data.title==='WARGEAR OPTIONS');
    for(const option of model.entities.filter(e=>e.parentId===unit.id&&e.sourceKind==='WARGEAR_OPTION')){
      assert.equal(wargearSections.filter(s=>s.data.text.includes(option.data.text)).length,1,'Uncovered wargear option');
      // Full source list retains paragraphs/nesting. Canonical option cards remain addressable.
      card.children=card.children.filter(id=>id!==option.id);
    }
    if(unit.data.modelKeywordDeclarations.length){
      const common=one(card,'/keywordScope'),faction=one(card,'/sourcePartition');
      common.displayValue='Keywords';faction.displayValue='Faction Keywords';
      card.keywordGroups=[{profileIds:clone(unit.data.profileIds),labelFieldId:common.id,
        fieldIds:card.fields.filter(f=>/^\/keywords\/\d+$/.test(key(f))).map(f=>f.id)},
      {profileIds:clone(unit.data.profileIds),labelFieldId:faction.id,
        fieldIds:card.fields.filter(f=>/^\/factionKeywords\/\d+$/.test(key(f))).map(f=>f.id)}];
      unit.data.modelKeywordDeclarations.forEach((declaration,i)=>{
        assert.equal(declaration.profileBindingStatus,'SOURCE_CONFIRMED');
        const profile=entities.get(declaration.sourceProfileId);assert.equal(profile?.parentId,unit.id);
        card.keywordGroups.push({profileIds:[profile.id],labelFieldId:one(card,`/modelKeywordDeclarations/${i}/modelSourceName`).id,
          fieldIds:card.fields.filter(f=>new RegExp(`^/modelKeywordDeclarations/${i}/keywords/\\d+$`).test(key(f))).map(f=>f.id)});
      });
    }
  }
  payload.groups=payload.groups.filter(group=>group.itemIds.length);
  payload.sourceCompleteness={sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN',contentCertified:false};
  payload.sourceEnrollment=read('./sources/enrollment.json');
  payload.rulePresentationLimitations={scope:'STAGE_2C_NATIVE_VIEW',points:'OWNED_BY_CENTRAL_MFM_V1_6',
    relations:'SOURCE_DECLARATIONS_ONLY',battleState:'NOT_EVALUATED',runtime:'NOT_IMPLEMENTED',
    unresolvedCompositionProfiles:model.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.data.profileBindingStatus==='NOT_PROVEN').map(e=>e.id)};
  assert.equal(JSON.stringify(facts),before,'Projection mutated effective factual owner');
  assert.equal(JSON.stringify(base),baseBefore,'Projection mutated base factual owner');
  assert.deepEqual([...cards.keys()].sort(),[...original.keys()].sort(),'Lost or invented canonical card');
  return {model,payload};
}

export function writeNativeDatasheets({check=false}={}){
  const result=buildNativeDatasheets();
  for(const [name,value] of [['native-datasheets',result.model],['datasheet-presentation',result.payload]]){
    const file=new URL(`./generated/${name}.json`,import.meta.url),bytes=serializeSourceJSON(value);
    if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,`Stale native output: ${name}`);else fs.writeFileSync(file,bytes);
  }
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const {model,payload}=writeNativeDatasheets({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',datasheets:model.entities.filter(e=>e.kind==='DATASHEET').length,
    records:model.entities.length,cards:payload.cards.length,points:'CENTRAL_MFM',runtime:'NOT_IMPLEMENTED'}));
}
