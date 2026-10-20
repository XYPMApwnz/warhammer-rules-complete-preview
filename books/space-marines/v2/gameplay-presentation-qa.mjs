/** Whole native inventory projection checks. This exercises existing Effective
 * and Personal projectors, not browser layout or a registered SM application. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {buildGameplayPresentation,writeGameplayPresentation} from './gameplay-presentation-build.mjs';
import {createSpaceMarinesRosterRuntime} from './roster-runtime.mjs';
import {nativeAbilityReview} from './native-ability-bindings.mjs';
import {collectAbilityReferences,projectAbilityPresentation} from '../../shared/army-book-app-v2/ability-presentation.mjs';
import {projectInstanceCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';

const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
const built=buildSpaceMarinesContracts(),payload=buildGameplayPresentation(built),cards=new Map(payload.cards.map(card=>[card.id,card]));
const boundFields=new Map(payload.cards.flatMap(card=>card.fields.map(field=>[field.id,field])));
const units=facts.entities.filter(entity=>entity.kind==='DATASHEET');
const detachmentId='detachment-sm-6341f5a9b9584677';
const physical=units.map(unit=>({instanceId:'presentation/'+unit.id,canonicalUnitId:unit.id,
  startingStrength:unit.data.profileIds.length,modelRows:unit.data.profileIds.map((id,index)=>({rowId:id,
    canonicalProfileId:id,compositionScope:'MODEL_ROW',quantity:1,
    selections:index?[]:unit.data.weaponIds.map(id=>({selectionKey:unit.id+'/'+id,canonicalProfileIds:[id],
      canonicalEquipmentIds:[],perModelQuantity:1,physicalQuantity:1}))})),
  selections:[],enhancementIds:[],warlord:null}));
const state={schema:'roster-v2/roster',bookId:'space-marines',rosterId:'native-presentation-diagnostic',
  detachments:[{instanceId:'det/presentation',canonicalDetachmentId:detachmentId}],detachmentIds:[detachmentId],
  units:physical,attachments:[],warlordInstanceId:null};
const runtime=createSpaceMarinesRosterRuntime(built);runtime.load(state);
const personal=projectPersonalBook(payload,runtime.state);
assert.equal(personal.instances.length,85);assert.equal(new Set(personal.instances.map(row=>row.instanceId)).size,85);
let profiles=0,weapons=0,references=0,sourceTexts=0;
for(const unit of runtime.state.units){
  assert.ok(personal.allowedIds.has(unit.canonicalUnitId));
  const effective=runtime.effective(unit.instanceId),variants=projectInstanceCards(cards,unit,effective);
  const root=variants.get(unit.canonicalUnitId)[0];assert.equal(root.instanceId,unit.instanceId);
  for(const row of effective.profiles){
    const card=variants.get(row.id).find(card=>card.scopeId===row.scopeId);assert.ok(card);profiles++;
    assert.equal(card.rosterQuantity,row.quantity);
    const visibleFields=[...card.fields,...(card.profileFieldIds||[]).map(id=>boundFields.get(id))];
    for(const field of row.fields){
      if(field.label==='stats')for(const [name,value]of Object.entries(field.value))assert.ok(visibleFields.some(f=>(f.source?.path==='/stats/'+name||f.presentationPath==='/'+name)&&f.value===value),'Missing effective MODEL statistic '+row.id+' '+name+' '+value);
    }
  }
  for(const row of effective.weapons){
    const card=variants.get(row.id).find(card=>card.scopeId===row.scopeId&&card.selectionKey===row.selectionKey);
    assert.ok(card,'Weapon occurrence lost by presentation');assert.equal(card.rosterQuantity,row.physicalQuantity);weapons++;
  }
  const children=root.children.map(id=>cards.get(id));
  const refs=collectAbilityReferences(children.filter(card=>card.kind==='RULE_REFERENCE'),payload.datasheetPresentation.referenceBindings);
  const expected=nativeAbilityReview.filter(row=>row.ownerId===unit.canonicalUnitId);
  assert.equal(refs.length,expected.length);
  for(const proof of expected){
    const ref=refs.find(row=>row.fieldId===proof.id+'::/label');assert.ok(ref&&cards.has(ref.canonicalId));
    assert.equal(ref.label,proof.quote);references++;
    if(!proof.canonicalAbilityId)assert.notEqual(ref.group,'CORE ABILITIES','Conditional source reference became a native grant');
  }
  const abilityView=projectAbilityPresentation({instanceId:unit.instanceId,profiles:effective.profiles,
    unitAbilities:effective.unitAbilities,applied:effective.applied,references:refs});
  for(const proof of expected.filter(row=>!row.canonicalAbilityId))assert.ok(abilityView.otherReferences.some(row=>row.fieldId===proof.id+'::/label'),'Conditional/Army reference hidden in physical view');
  for(const ability of facts.entities.filter(entity=>entity.parentId===unit.canonicalUnitId&&entity.kind==='DATASHEET_ABILITY')){
    assert.ok(cards.get(ability.id).fields.some(field=>field.source.path==='/text'&&field.value===ability.data.text),'Full native rule body lost');sourceTexts++;
  }
}
assert.equal(profiles,117);assert.equal(references,232);assert.equal(weapons,386);
for(const source of facts.entities.filter(entity=>['ARMY_RULE','DETACHMENT_RULE','ENHANCEMENT'].includes(entity.kind))){
  assert.ok(cards.get(source.id).fields.some(field=>field.source.path==='/text'&&field.value===source.data.text),'Full conditional rule text lost');
}
for(const source of facts.entities.filter(entity=>entity.kind==='STRATAGEM')){
  const card=cards.get(source.id),contract=built.book.entities.find(entity=>entity.id===source.id).ruleContract;
  assert.ok(card.fields.some(field=>field.source.path==='/cp'));assert.ok(card.fields.some(field=>field.source.path==='/lines/0/label'&&field.value==='WHEN:'));
  assert.ok(contract.clauses.every(clause=>!clause.rosterEffects.length),'Battle event was assumed by roster projection');
}
assert.deepEqual(buildGameplayPresentation(built),payload,'Nondeterministic gameplay presentation');
writeGameplayPresentation({check:true});
console.log(JSON.stringify({status:'PASS',physicalUnits:physical.length,modelProfiles:profiles,weaponOccurrences:weapons,
  sourceReferences:references,fullDatasheetAbilityTexts:sourceTexts,fullStratagems:84,
  effectiveProjection:'PASS',personalProjection:'PASS',conditionalSourcesNotAutoApplied:true,deterministic:true,
  browserAcceptance:'NOT_RUN',realNewRecruitExportTested:false,constructedDiagnosticFixture:true}));
