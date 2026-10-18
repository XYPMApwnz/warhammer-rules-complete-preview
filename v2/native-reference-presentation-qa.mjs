/** Native-reference visibility guard over accepted source occurrences, runtime
 * registration and the production presenter. This is metadata/presentation
 * coverage, not automatic execution of conditional Core rules. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {abilityParameters,collectAbilityReferences,projectAbilityPresentation} from '../books/shared/army-book-app-v2/ability-presentation.mjs';
import {prepareRosterPresentationCards,projectInstanceCards} from '../books/shared/army-book-app-v2/personal.mjs';
import {createCSMBrowserRoster} from '../books/chaos-space-marines/v2/roster-boot.mjs';
import {buildPresentationReferences} from '../books/chaos-space-marines/v2/presentation-reference-build.mjs';
import {createEffectiveCoreCatalog} from '../books/core-rules/content/effective-core-catalog.mjs';

const root=new URL('../',import.meta.url),read=path=>JSON.parse(fs.readFileSync(new URL(path,root),'utf8')),
  clone=structuredClone,dd='core-deadly-demise',fnp='core-feel-no-pain',
  rows=plan=>[...plan.core,...plan.profiles.flatMap(profile=>profile.abilities)],
  books=[['death-guard','2026-09-25','rule-contract-effective',19],
    ['adeptus-mechanicus','2026-09-25','roster-runtime',10],
    ['chaos-space-marines','2026-09-29','roster-runtime',16],
    ['emperors-children','2026-09-28','roster-attachments',10],
    ['tyranids','2026-09-27','roster-runtime',22]];

/** A runtime-authoritative marker is a promise of an actual occurrence, not a
 * label alias. Legacy entries have explicit occurrence IDs; typed entries have
 * exact canonical identities and normalized parameters. */
export function assertNativeReferenceMetadata(payload,book) {
  const cards=new Map(payload.cards.map(card=>[card.id,card])),entities=new Map(book.entities.map(entity=>[entity.id,entity]));
  let markers=0;
  for(const [fieldId,bindings]of Object.entries(payload.datasheetPresentation.referenceBindings.fields)) {
    const card=[...cards.values()].find(value=>value.fields.some(field=>field.id===fieldId));
    assert.equal(card?.kind,'RULE_REFERENCE',`Reference field lost owner: ${fieldId}`);
    const entity=entities.get(card.id);assert.equal(entity?.kind,'RULE_REFERENCE');
    assert.ok(entities.has(entity.parentId||entity.ownerId),`Missing canonical owner: ${card.id}`);
    for(const binding of bindings.filter(value=>value.runtimeEntryId)) {
      const abilities=book.rosterReferenceSemantics?.[card.id]?.abilities||[];
      const match=abilities.find(ability=>ability.id===binding.runtimeEntryId||
        binding.runtimeEntryId===card.id&&ability.canonicalId===binding.targetId);
      assert.ok(match,`Missing registered native occurrence: ${binding.runtimeEntryId}`);
      if(match.canonicalId)assert.equal(match.canonicalId,binding.targetId,'Native canonical identity drift');
      if(match.parameters||match.value!==undefined)assert.deepEqual(abilityParameters(match),
        abilityParameters({parameters:binding.parameters||{}}),'Native parameter drift');
      markers++;
    }
  }
  return markers;
}

function sourceExpectations(faction,date,book) {
  const corpus=read(`books/${faction}/sources/waha-11e-current-${date}/corpus.json`),expected=[];
  for(const sheet of corpus.datasheets)for(const reference of sheet.ruleReferences||[]) {
    const matches=[...reference.label.matchAll(/Deadly Demise\s+(\d*D\d+(?:\+\d+)?|\d+)/g)];
    for(const match of matches) {
      const entity=book.entities.find(value=>value.id===reference.sourceId);
      assert.ok(entity,`Accepted source occurrence missing: ${reference.sourceId}`);
      const owner=book.entities.find(value=>value.kind==='DATASHEET'&&
        [value.sourceEntityId,value.provenance?.sourceId,value.provenance?.sourceRecordId,value.provenance?.sourceEntityId].includes(sheet.sourceId))||
        book.entities.find(value=>value.kind==='DATASHEET'&&value.provenance?.pointer===`/datasheets/${corpus.datasheets.indexOf(sheet)}`);
      assert.ok(owner,`Accepted source owner missing: ${sheet.sourceId}`);
      assert.equal(entity.parentId||entity.ownerId,owner.id,'Wrong source owner');
      let evidence=entity.provenance?.sourceEvidence?.find(value=>/\.html$/.test(value.document||''));
      if(faction==='chaos-space-marines')assert.ok(evidence,'CSM accepted raw source evidence missing');
      if(!evidence&&entity.provenance?.document?.endsWith('.html'))evidence={document:entity.provenance.document,sha256:entity.provenance.sha256};
      if(!evidence&&faction==='adeptus-mechanicus') {
        const page=corpus.pages.find(value=>value.url===sheet.url);
        assert.ok(page,'Accepted raw source page locator missing');
        const document=`books/${faction}/sources/waha-11e-current-${date}/${page.file}`,
          enrolled=read(`books/${faction}/v2/sources/enrollment.json`).artifacts.find(value=>value.path===document);
        assert.ok(enrolled,'Accepted raw source enrollment missing');
        evidence={document,sha256:enrolled.sha256};
      }
      if(evidence) {
        const bytes=fs.readFileSync(new URL(evidence.document,root));
        assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(),evidence.sha256.toUpperCase(),'Accepted raw source SHA');
        const visible=bytes.toString('utf8').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ');
        assert.ok(visible.includes(match[0]),`DD source quote absent: ${reference.sourceId}`);
      }
      expected.push({referenceId:reference.sourceId,ownerId:owner.id,
        parameters:{value:/^\d+$/.test(match[1])?Number(match[1]):match[1]},quote:match[0],rawVerified:!!evidence});
    }
  }
  return expected;
}

function metadataInput(payload,book,expectation,instanceId='physical-a') {
  const cards=payload.cards.filter(card=>card.id===expectation.referenceId),references=collectAbilityReferences(cards,payload.datasheetPresentation.referenceBindings);
  assert.equal(cards.length,1,'Missing source reference card');
  const reference=references.find(value=>value.canonicalId===dd);
  assert.ok(reference,'Missing canonical Core DD link');
  assert.deepEqual(reference.parameters,expectation.parameters,'Wrong source DD parameter');
  const unit=book.entities.find(entity=>entity.id===expectation.ownerId),profileId=unit.data.profileIds?.[0]||unit.data.modelProfileIds?.[0];
  assert.ok(profileId,'Missing MODEL profile');
  return {instanceId,profiles:[{id:profileId,scopeId:instanceId+'/model-1',quantity:1,
    abilities:clone(book.rosterReferenceSemantics?.[expectation.referenceId]?.abilities||[])}],references};
}
function assertVisible(input,expectation,project=projectAbilityPresentation) {
  const actual=rows(project(input)).filter(ability=>ability.canonicalId===dd);
  assert.equal(actual.length,1,'Deadly Demise missing or duplicated');
  assert.equal(actual[0].subject,'MODEL','Wrong DD recipient kind');
  assert.deepEqual(actual[0].parameters,expectation.parameters,'Wrong DD value');
  assert.deepEqual(actual[0].recipientScopes,[JSON.stringify([input.instanceId,input.profiles[0].id,input.profiles[0].scopeId])],'Wrong physical MODEL recipient');
  return actual[0];
}

const results=[],loaded=new Map();
let markers=0;
for(const [faction,date,runtime,count]of books) {
  const base=`books/${faction}/v2/`,payload=read(base+'generated/app-presentation.json'),book=read(base+`generated/${runtime}.json`),
    expected=sourceExpectations(faction,date,book);
  markers+=assertNativeReferenceMetadata(payload,book);
  assert.equal(expected.length,count,'Independent accepted-source DD occurrence census');
  for(const expectation of expected) {
    const input=metadataInput(payload,book,expectation),a=assertVisible(input,expectation),
      b=assertVisible(metadataInput(payload,book,expectation,'physical-b'),expectation);
    assert.notEqual(a.identity,b.identity,'Independent physical instances collapsed');
    input.profiles[0].suppressedAbilityIds=[dd];
    assert.equal(rows(projectAbilityPresentation(input)).filter(value=>value.canonicalId===dd).length,0,'Suppression resurrected static native fact');
    input.profiles[0].suppressedAbilityIds=[];input.sourceAbilityIds=[dd];
    assert.equal(rows(projectAbilityPresentation(input)).filter(value=>value.canonicalId===dd).length,0,'Source suppression resurrected static native fact');
    input.sourceAbilityIds=[];
    input.profiles[0].abilities.push({canonicalId:dd,parameters:clone(expectation.parameters)});
    assertVisible(input,expectation); // Equal native/granted facts are displayed once.
  }
  results.push({book:faction,acceptedSourceOccurrences:expected.length,rawSourceShaAndQuoteVerified:expected.filter(value=>value.rawVerified).length,
    sourceEvidenceLevel:expected.every(value=>value.rawVerified)?'ACCEPTED_RAW_SHA_AND_QUOTE':'ACCEPTED_NORMALIZED_CORPUS; RAW_NOT_AVAILABLE_IN_THIS_CONTROL',
    presentation:expected.length,suppression:expected.length,
    scope:'Accepted source -> canonical owner -> production metadata/native occurrence -> shared presenter; not browser acceptance for other books'});
  loaded.set(faction,{book,payload,expected});
}

// All sixteen CSM source owners traverse the actual importer, executor,
// Effective projection and Personal Guide card producer, including two
// independent copies of every source owner. Expected DD values above come
// from accepted corpus/raw, never from executable declarations.
const {book,payload,expected}=loaded.get('chaos-space-marines'),
  service=createCSMBrowserRoster(book,read('books/chaos-space-marines/v2/generated/roster-import.json'),read('books/chaos-space-marines/v2/roster-attachment-bindings.json')),
  cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
const text=['+ FACTION KEYWORD: Chaos - Chaos Space Marines','+ DETACHMENT: Veterans of the Long War',
  ...expected.flatMap(expectation=>{
    const unit=book.entities.find(value=>value.id===expectation.ownerId),profiles=unit.data.profileIds.map(id=>book.entities.find(value=>value.id===id)),
      count=profiles.reduce((sum,profile)=>sum+(profile.data.composition?.quantity?.min||1),0),
      entry=[`${count}x ${unit.displayName} (0 pts)`,...profiles.map(profile=>`• ${profile.data.composition?.quantity?.min||1}x ${profile.data.name}`)];
    return [...entry,...entry];
  }),'1x Chaos Lord (0 pts)','• 1x Chaos Lord'].join('\n');
assert.equal(service.import(text).status,'READY','Source-owner diagnostic import');
assert.equal(service.state.units.length,33);
for(let index=0;index<32;index++) {
  const unit=service.state.units[index],expectation=expected[Math.floor(index/2)],effective=service.effective(unit.instanceId),
    variants=projectInstanceCards(cards,unit,effective),card=variants.get(unit.canonicalUnitId)[0],
    children=card.children.flatMap(id=>variants.get(id)||[cards.get(id)]);
  assert.equal(unit.canonicalUnitId,expectation.ownerId);
  assert.ok(effective.abilities.some(value=>value.id===expectation.referenceId),'Effective source occurrence missing');
  const input={instanceId:unit.instanceId,profiles:children.filter(value=>value.kind==='PROFILE').map(value=>({id:value.id,scopeId:value.scopeId,
    quantity:value.rosterQuantity,abilities:value.effectiveAbilities||value.rosterAbilities||[],suppressedAbilityIds:value.suppressedAbilityIds||[]})),
    references:collectAbilityReferences(children.filter(value=>value.kind==='RULE_REFERENCE'),payload.datasheetPresentation.referenceBindings),applied:effective.applied};
  assertVisible(input,expectation);
}
const foreignUnit=service.state.units[32],foreignEffective=service.effective(foreignUnit.instanceId),
  foreignVariants=projectInstanceCards(cards,foreignUnit,foreignEffective),foreignCard=foreignVariants.get(foreignUnit.canonicalUnitId)[0],
  foreignChildren=foreignCard.children.flatMap(id=>foreignVariants.get(id)||[cards.get(id)]);
assert.equal(foreignUnit.canonicalUnitId,'unit-chaos-lord');
assert.equal(rows(projectAbilityPresentation({instanceId:foreignUnit.instanceId,
  profiles:foreignChildren.filter(value=>value.kind==='PROFILE').map(value=>({id:value.id,scopeId:value.scopeId,
    quantity:value.rosterQuantity,abilities:value.effectiveAbilities||value.rosterAbilities||[]})),
  references:collectAbilityReferences(foreignChildren.filter(value=>value.kind==='RULE_REFERENCE'),payload.datasheetPresentation.referenceBindings)}))
  .filter(value=>value.canonicalId===dd).length,0,'DD leaked to an unrelated source owner');
const stable=service.snapshot();service.load(clone(stable));assert.deepEqual(service.snapshot(),stable,'Recompute changed physical input');
assert.equal(service.import(text).status,'READY');assert.deepEqual(service.snapshot(),stable,'Reimport changed physical input');

const mutations=[];
function catches(id,run){assert.throws(run,undefined,`Mutation escaped: ${id}`);mutations.push(id);}
const expectation=expected.find(value=>value.ownerId==='unit-helbrute'),input=metadataInput(payload,book,expectation);
const producerInputs={model:book,cards:payload.cards.filter(card=>card.domain!=='CORE'),coreCatalog:createEffectiveCoreCatalog(),runtimeBook:book};
const rebuilt=buildPresentationReferences(producerInputs);
assert.deepEqual(rebuilt.referenceBindings,payload.datasheetPresentation.referenceBindings,'Generated native presentation metadata differs from producer');
catches('managed-native-membership-deleted-build-fails',()=>{
  const changed=clone(book),id='datasheet-chaos-spawn:rule-reference:1';delete changed.rosterReferenceSemantics[id];
  buildPresentationReferences({...producerInputs,runtimeBook:changed});
});
catches('registered-native-parameter-drift-build-fails',()=>{
  const changed=clone(book),ability=changed.rosterReferenceSemantics['datasheet-chaos-spawn:rule-reference:1'].abilities[0];
  ability.parameters={value:2};ability.value=2;
  buildPresentationReferences({...producerInputs,runtimeBook:changed});
});
catches('missing-runtime-occurrence',()=>{
  const changed=clone(payload),field=Object.values(changed.datasheetPresentation.referenceBindings.fields).flat().find(value=>value.targetId===dd);
  field.runtimeEntryId='nonexistent';assertNativeReferenceMetadata(changed,book);
});
catches('wrong-native-parameter',()=>{
  const changed=clone(book),entry=Object.values(changed.rosterReferenceSemantics).find(value=>value.abilities?.some(ability=>ability.canonicalId===fnp));
  entry.abilities[0].parameters={value:2};entry.abilities[0].value=2;assertNativeReferenceMetadata(payload,changed);
});
catches('wrong-owner',()=>{
  const changed=clone(book);changed.entities.find(value=>value.id===expectation.referenceId).parentId='unit-legionaries';
  sourceExpectations('chaos-space-marines','2026-09-29',changed);
});
catches('csm-raw-provenance-removed',()=>{
  const changed=clone(book);changed.entities.find(value=>value.id===expectation.referenceId).provenance.sourceEvidence=[];
  sourceExpectations('chaos-space-marines','2026-09-29',changed);
});
catches('wrong-dd-parameter',()=>{const changed=clone(input);changed.references.find(value=>value.canonicalId===dd).parameters={value:99};assertVisible(changed,expectation);});
catches('wrong-core-identity',()=>{const changed=clone(input);changed.references.find(value=>value.canonicalId===dd).canonicalId='core-stealth';assertVisible(changed,expectation);});
catches('missing-presentation',()=>assertVisible(input,expectation,value=>({...projectAbilityPresentation(value),core:[]})));
catches('wrong-recipient',()=>assertVisible(input,expectation,value=>{const plan=projectAbilityPresentation(value);plan.core.find(row=>row.canonicalId===dd).subject='UNIT';return plan;}));
catches('duplicate-presentation',()=>assertVisible(input,expectation,value=>{const plan=projectAbilityPresentation(value);plan.core.push(clone(plan.core.find(row=>row.canonicalId===dd)));return plan;}));
catches('missing-reference',()=>{const changed=clone(input);changed.references=[];assertVisible(changed,expectation);});

// Generic presenter controls use synthetic canonical IDs, independent of names.
// Registered numeric native occurrences must not reintroduce 5+ after 4+ wins.
const reference={canonicalId:fnp,parameters:{value:5},group:'CORE ABILITIES',label:'Feel No Pain 5+',runtimeEntryId:'native-fnp',legacyValue:true},
  numeric={instanceId:'fnp-a',profiles:[{id:'p',scopeId:'fnp-a/m1',quantity:1,abilities:[{canonicalId:fnp,name:'Any display label',parameters:{value:4},value:4},
    {canonicalId:'independent-defence',parameters:{value:5}}]}],references:[reference]},
  numericPlan=projectAbilityPresentation(numeric);
const baselineNumeric=clone(numeric);baselineNumeric.profiles[0].abilities[0]={id:'native-fnp',value:5};
assert.deepEqual(rows(projectAbilityPresentation(baselineNumeric)).filter(value=>value.canonicalId===fnp).map(value=>value.parameters.value),[5]);
assert.deepEqual(rows(numericPlan).filter(value=>value.canonicalId===fnp).map(value=>value.parameters.value),[4]);
assert.ok(rows(numericPlan).some(value=>value.canonicalId==='independent-defence'),'Independent ability suppressed');
numeric.profiles[0].suppressedAbilityIds=[fnp];
assert.equal(rows(projectAbilityPresentation(numeric)).filter(value=>value.canonicalId===fnp).length,0);
numeric.profiles.push({id:'bodyguard',scopeId:'fnp-a/m2',quantity:1,abilities:[]});
assert.equal(rows(projectAbilityPresentation(numeric)).filter(value=>value.canonicalId===fnp).length,0,'MODEL suppression or empty Bodyguard leaked');
numeric.profiles[0].suppressedAbilityIds=[];
const scoped=projectAbilityPresentation(numeric);assert.equal(scoped.core.filter(value=>value.canonicalId===fnp).length,0);
assert.equal(scoped.profiles[0].abilities.filter(value=>value.canonicalId===fnp).length,1);
assert.equal(scoped.profiles[1].abilities.length,0,'Granted MODEL FNP leaked to Bodyguard');

export const nativeReferencePresentationGuardResult={status:'PASS',runtimeMarkersChecked:markers,deadlyDemise:results,
  csmExecutorEffectivePersonalInstances:32,csmUnrelatedOwnerNegativeInstances:1,csmSourceOccurrences:16,mutations,numericOverrideSuppressionAndIndependentAbility:'PASS',
  limitations:'This checks declared native reference metadata and independently identified DD source occurrences; it does not prove arbitrary English semantic completeness or replace browser evidence.'};
console.log(JSON.stringify(nativeReferencePresentationGuardResult));
