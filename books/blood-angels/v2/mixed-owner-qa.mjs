/** Independent Stage 2C checks. Expected membership/ownership comes from the
 * reviewed ledgers and accepted canonical owners, never the mixed projection.
 * Constructed physical snapshots prove shared runtime projections, not NR
 * export support, browser acceptance, gameplay completeness or legality. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateRoster,formRoster,predicateContext} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {projectEffectiveInstance} from '../../shared/roster-v2/effective-instance.mjs';
import {projectInstanceCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {projectSelectedComposition} from '../../shared/army-book-app-v2/effective-datasheet-presentation.mjs';
import {createReferenceContract} from '../../shared/army-book-app-v2/reference-contract.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const ids=rows=>rows.map(row=>row.id).sort();
const index=rows=>new Map(rows.map(row=>[row.id,row]));
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function physical(unit,instanceId){
  const modelRows=unit.data.profileIds.map((id,n)=>({rowId:'model-row-'+n,canonicalProfileId:id,
    compositionScope:'MODEL_ROW',quantity:1,selections:unit.data.weaponIds.map((weaponId,w)=>({
      selectionKey:instanceId+'/row/'+n+'/weapon/'+w,canonicalProfileIds:[weaponId],
      canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1}))}));
  return {instanceId,canonicalUnitId:unit.id,startingStrength:modelRows.length,modelRows,
    selections:[],equipmentContextKnown:true,enhancementIds:[],warlord:null};
}
export function runMixedOwnerQA({canonicalEntities,book,payload,points,relationReferences,build}){
  const canonicalModel={entities:canonicalEntities};
  const own=read('./generated/effective.json'),sm=read('../../space-marines/v2/generated/effective.json');
  const ledger=read('./inherited-sm-references.json');
  const boundary=read('./mfm-boundary.json'),bindings=read('./mfm-bindings.json');
  const originals=new Map([...own.entities,...sm.entities].map(row=>[row.id,row]));
  const accepted=new Set(ledger.references.map(row=>row.canonicalId)),ownIndex=index(own.entities),smIndex=index(sm.entities);
  const records=index(canonicalModel.entities),runtime=index(book.entities),cards=index(payload.cards);
  const checks=[],negative=[];const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
  const reject=(id,fn)=>check(id,()=>{assert.throws(fn);negative.push(id);});
  check('stage2a-accepted-input-byte-pins-unchanged',()=>{
    const review=read('./source-review.json');assert.ok(review.reviewedArtifacts.length>=6);
    for(const pin of review.reviewedArtifacts){
      const bytes=fs.readFileSync(new URL('../../../'+pin.path,import.meta.url));
      assert.equal(bytes.length,pin.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase(),pin.sha256);
    }
  });
  check('source-reviewed-reference-set',()=>{
    assert.equal(ledger.references.length,180);assert.equal(accepted.size,180);
    const inheritedKinds=new Set(['DATASHEET','DETACHMENT','DETACHMENT_RULE','ARMY_RULE','ENHANCEMENT','STRATAGEM']);
    assert.deepEqual(canonicalModel.entities.filter(row=>row.bookId==='space-marines'&&inheritedKinds.has(row.kind)).map(row=>row.id).sort(),[...accepted].sort());
    for(const reference of ledger.references){
      const expected=smIndex.get(reference.canonicalId),actual=records.get(reference.canonicalId);
      assert.equal(expected?.bookId,'space-marines');assert.equal(actual?.bookId,'space-marines');
      assert.equal(actual.sourceEntityId,reference.sourceEntityId);assert.equal(actual.kind,reference.kind);
      assert.deepEqual(actual.provenance,expected.provenance);assert.deepEqual(actual.data,expected.data);
      assert.deepEqual(reference.provenance,expected.provenance);
    }
  });
  const ownUnits=own.entities.filter(row=>row.kind==='DATASHEET');
  const inheritedUnits=ledger.references.filter(row=>row.kind==='DATASHEET').map(row=>smIndex.get(row.canonicalId));
  const expectedUnits=[...ownUnits,...inheritedUnits];
  const expectedUnitIds=new Set(ids(expectedUnits));
  check('81-physical-membership-14-own-67-inherited',()=>{
    assert.equal(ownUnits.length,14);assert.equal(inheritedUnits.length,67);
    assert.deepEqual(ids(canonicalModel.entities.filter(row=>row.kind==='DATASHEET')),ids(expectedUnits));
    const foreign=sm.entities.filter(row=>row.kind==='DATASHEET'&&!expectedUnitIds.has(row.id));
    assert.equal(foreign.length,18);assert.ok(foreign.every(row=>!records.has(row.id)));
  });
  check('native-rule-membership-counts-and-ownership',()=>{
    for(const [kind,count]of [['ARMY_RULE',3],['DETACHMENT',18],['DETACHMENT_RULE',18],['STRATAGEM',60]])
      assert.equal(canonicalModel.entities.filter(row=>row.kind===kind).length,count);
    const items=canonicalModel.entities.filter(row=>row.kind==='ENHANCEMENT');
    assert.equal(items.filter(row=>row.data.itemKind==='UNIT_UPGRADE').length,8);
    assert.equal(items.filter(row=>row.data.itemKind!=='UNIT_UPGRADE').length,32);
    assert.equal(canonicalModel.entities.filter(row=>row.kind==='MODEL_PROFILE').length,106);
    assert.equal(canonicalModel.entities.filter(row=>row.kind==='WEAPON_PROFILE').length,400);
  });
  check('canonical-owner-and-facts-preserved-through-closure',()=>{
    for(const row of canonicalModel.entities){
      const expected=originals.get(row.id);assert.ok(expected,'Invented canonical entity '+row.id);
      assert.deepEqual(row,expected,'Canonical facts changed while composing '+row.id);
    }
    assert.equal(records.size,canonicalModel.entities.length);
    for(const row of own.entities)assert.deepEqual(records.get(row.id),row);
    for(const unit of inheritedUnits)for(const row of sm.entities.filter(row=>row.parentId===unit.id))
      assert.deepEqual(records.get(row.id),row,'Lost source-owned child '+row.id);
    assert.equal(read('./identity-bindings.json').bindings.length,own.entities.length);
  });
  check('all-model-weapon-and-native-rule-references-resolve-to-owner',()=>{
    for(const unit of expectedUnits){
      for(const id of unit.data.profileIds){const row=records.get(id);assert.equal(row.kind,'MODEL_PROFILE');assert.equal(row.parentId,unit.id);assert.equal(row.bookId,unit.bookId);}
      for(const id of unit.data.weaponIds){const row=records.get(id);assert.equal(row.kind,'WEAPON_PROFILE');assert.equal(row.parentId,unit.id);assert.equal(row.bookId,unit.bookId);}
      for(const id of [...unit.data.sectionIds,...unit.data.wargearOptionIds,...unit.data.ruleReferenceIds]){
        const row=records.get(id);assert.equal(row.parentId,unit.id);assert.equal(row.bookId,unit.bookId);
        assert.ok(row.provenance.sourceId&&row.provenance.sha256&&row.provenance.pointer);
      }
    }
  });
  check('accepted-source-byte-pins-and-provenance-preserved',()=>{
    const checked=new Set();
    for(const row of canonicalModel.entities){
      const p=row.provenance,key=p.document+'\0'+p.sha256;
      assert.ok(p.sourceId&&p.sourceEntityId&&p.pointer&&p.authority);
      if(checked.has(key))continue;checked.add(key);
      const file=new URL('../../../'+p.document,import.meta.url);
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase(),p.sha256);
    }
    assert.ok(checked.size>1,'Ownership proof accidentally checked an empty source set');
  });
  const referenceContract=createReferenceContract({cards,registryId:'blood-angels'});
  check('existing-qualified-reference-contract-preserves-canonical-owners',()=>{
    const subjects=canonicalModel.entities.filter(row=>accepted.has(row.id)||['MODEL_PROFILE','WEAPON_PROFILE'].includes(row.kind));
    assert.equal(subjects.length,180+106+400);
    for(const entity of subjects){
      const expected={registryId:entity.bookId,canonicalId:entity.id};
      assert.deepEqual(referenceContract.identityFor(entity.id),expected);
      const resolved=referenceContract.resolve(expected);assert.ok(resolved);
      assert.deepEqual(resolved.identity,expected);assert.equal(resolved.targetId,entity.id);
      assert.deepEqual(cards.get(entity.id).provenance,entity.provenance);
      const field=cards.get(entity.id).fields.find(row=>row.source?.path);assert.ok(field);
      assert.ok(referenceContract.resolve({...expected,fieldPath:field.source.path}));
    }
  });
  check('qualified-reference-contract-rejects-wrong-owner-and-unresolved-identity',()=>{
    const inherited=ledger.references[0];
    assert.equal(referenceContract.resolve({registryId:'blood-angels',canonicalId:inherited.canonicalId}),null);
    assert.equal(referenceContract.resolve({registryId:'space-marines',canonicalId:'unresolved-canonical-id'}),null);
    assert.equal(referenceContract.resolve({registryId:'unregistered-book',canonicalId:inherited.canonicalId}),null);
    assert.equal(referenceContract.resolve({registryId:'space-marines',canonicalId:inherited.canonicalId,fieldPath:'/not-a-field'}),null);
  });
  const central=createEffectiveMfmCatalog(),smProjection=createEffectiveMfmArmyProjection('space-marines');
  const smPoints=smProjection.pointsForArmyBook('space-marines'),smPriced=index(smPoints.units);
  check('leader-support-references-preserve-current-central-source-and-stay-inactive',()=>{
    const centralUnitRefs=index(central.catalog.unitReferences);
    const expected=[...central.catalog.leaderEligibilityRecords,...central.catalog.supportEligibilityRecords]
      .filter(row=>expectedUnitIds.has(centralUnitRefs.get(row.sourceUnitReferenceId)?.armyBinding?.armyUnitId));
    assert.equal(relationReferences.length,expected.length);assert.ok(relationReferences.length>0);
    assert.deepEqual(new Set(relationReferences.map(row=>row.role)),new Set(['LEADER','SUPPORT']));
    assert.deepEqual(relationReferences.map(row=>row.mfmRecordId).sort(),expected.map(row=>row.id).sort());
    for(const relation of relationReferences){
      const original=expected.find(row=>row.id===relation.mfmRecordId);
      assert.equal(relation.active,false);assert.deepEqual(relation.provenance,original.provenance);
      assert.equal(relation.sourceCanonicalId,centralUnitRefs.get(original.sourceUnitReferenceId).armyBinding.armyUnitId);
      assert.equal(relation.sourceOwner,records.get(relation.sourceCanonicalId).bookId);
      assert.deepEqual(relation.targets.map(row=>row.mfmUnitReferenceId),original.targetUnitReferenceIds);
      for(const target of relation.targets){
        const raw=centralUnitRefs.get(target.mfmUnitReferenceId).armyBinding;
        if(target.status==='MEMBER_SOURCE_DECLARATION'){
          assert.equal(raw.bindingStatus,'BOUND');assert.equal(target.canonicalId,raw.armyUnitId);
          assert.ok(expectedUnitIds.has(target.canonicalId));assert.equal(target.sourceOwner,records.get(target.canonicalId).bookId);
        }else{
          assert.equal(target.canonicalId,null);assert.equal(target.sourceOwner,null);
          if(target.status==='REFERENCE_ONLY')assert.notEqual(raw?.bindingStatus,'BOUND');
          else {assert.equal(target.status,'OUTSIDE_MEMBERSHIP');assert.ok(!expectedUnitIds.has(raw.armyUnitId));}
        }
      }
    }
    assert.deepEqual(book.sourceRelationReferences,relationReferences);
  });
  check('25-ba-pricing-bindings-and-69-shared-owner-boundary',()=>{
    assert.equal(bindings.unitBindings.length+bindings.detachmentBindings.length+bindings.enhancementBindings.length,25);
    assert.equal(bindings.unitBindings.length,14);assert.equal(bindings.detachmentBindings.length,3);assert.equal(bindings.enhancementBindings.length,8);
    const references=boundary.inheritedPricingReferences;
    assert.equal(references.length,69);assert.equal(new Set(references.map(row=>row.mfmRecordId)).size,69);
    const native=references.filter(row=>row.nativeCanonicalId),only=references.filter(row=>!row.nativeCanonicalId);
    assert.equal(native.length,67);assert.equal(only.length,2);
    for(const ref of references){
      assert.equal(ref.valuesCopied,false);assert.equal(ref.sourceOwner,'space-marines');
      const fact=central.getById(ref.mfmRecordId);assert.equal(fact.factionId,'space-marines');
      assert.equal(fact.provenance.sourceId,'space-marines-mfm-v1.6');
      if(ref.nativeCanonicalId)assert.equal(smPriced.get(ref.nativeCanonicalId)?.mfmRecordId,ref.mfmRecordId);
      else assert.ok(!points.units.some(row=>row.mfmRecordId===ref.mfmRecordId));
    }
    assert.ok(!canonicalModel.entities.some(row=>row.bookId==='deathwatch'));
    assert.ok(!points.units.some(row=>central.getById(row.mfmRecordId).factionId==='deathwatch'));
  });
  check('81-points-projection-no-duplicate-owner-or-charge',()=>{
    assert.equal(points.units.length,81);assert.equal(new Set(points.units.map(row=>row.id)).size,81);
    const ownPoints=read('./generated/mfm-presentation.json');
    const expected=new Map([...ownPoints.units,...smPoints.units.filter(row=>expectedUnitIds.has(row.id))].map(row=>[row.id,row]));
    for(const row of points.units){
      const original=expected.get(row.id);assert.ok(original,'Foreign priced recipient');
      assert.deepEqual(row.points,original.points);assert.deepEqual(row.paidWargear,original.paidWargear);
      assert.equal(row.mfmRecordId,original.mfmRecordId);assert.equal(row.pointsSource.version,'v1.6');
    }
    assert.deepEqual(points.units.map(row=>row.id).sort(),[...expectedUnitIds].sort());
  });
  const defaultDetachment=own.entities.find(row=>row.kind==='DETACHMENT').id;
  const state={schema:'roster-v2/roster',bookId:'blood-angels',rosterId:'stage2c-mixed-diagnostic',
    detachmentIds:[defaultDetachment],detachments:[{instanceId:'detachment',canonicalDetachmentId:defaultDetachment}],
    units:expectedUnits.map((unit,n)=>physical(unit,'physical-'+n)),attachments:[],warlordInstanceId:null};
  let projection;
  check('81-shared-runtime-effective-and-personal-projections',()=>{
    assert.equal(book.entities.filter(row=>row.ruleContract?.clauses?.some(clause=>clause.rosterEffects?.length)).length,0);
    const verified=validateRoster(book,state,[]);projection=executeRosterEffects(book,verified,{});
    const guide=projectPersonalBook(payload,state);assert.equal(guide.instances.length,81);
    for(const unit of state.units){
      const source=originals.get(unit.canonicalUnitId),effective=projectEffectiveInstance(book,projection,unit.instanceId);
      assert.equal(effective.instanceId,unit.instanceId);assert.equal(effective.canonicalUnitId,unit.canonicalUnitId);
      assert.deepEqual(effective.profiles.map(row=>row.id).sort(),[...source.data.profileIds].sort());
      assert.ok(effective.profiles.every(row=>row.ownerInstanceId===unit.instanceId));
      for(const profile of effective.profiles){
        const expected=originals.get(profile.id).data.stats;
        assert.deepEqual(profile.fields.find(row=>row.label==='stats').value,expected,'MODEL source characteristics changed');
      }
      assert.equal(effective.weapons.length,source.data.profileIds.length*source.data.weaponIds.length);
      for(const weapon of effective.weapons){
        assert.equal(records.get(weapon.id).parentId,unit.canonicalUnitId);
        assert.equal(weapon.ownerInstanceId,unit.instanceId);assert.equal(weapon.physicalQuantity,1);
        const expected=originals.get(weapon.id).data;
        for(const key of ['range','attacks','skill','strength','ap','damage'])assert.equal(weapon.fields.find(row=>row.label===key).value,expected[key]);
        assert.deepEqual(weapon.fields.find(row=>row.label==='abilities').value,expected.abilities);
      }
      const variants=projectInstanceCards(cards,unit,effective);
      assert.equal(variants.get(source.id)[0].instanceId,unit.instanceId);
      for(const profile of effective.profiles)for(const view of variants.get(profile.id))
        for(const [key,value]of Object.entries(originals.get(profile.id).data.stats))
          assert.equal(view.fields.find(field=>field.source.path==='/stats/'+key).value,value);
      for(const weapon of effective.weapons)for(const view of variants.get(weapon.id))
        for(const key of ['range','attacks','skill','strength','ap','damage'])
          assert.equal(view.fields.find(field=>field.source.path==='/'+key).value,originals.get(weapon.id).data[key]);
      assert.equal(effective.applied.length,0);
    }
  });
  check('chapter-context-never-inferred-or-keywords-granted',()=>{
    for(const unit of state.units){
      const source=originals.get(unit.canonicalUnitId),context=predicateContext(state,projection,unit.instanceId,'UNIT');
      assert.ok(!context.roster.chapterId&&!context.roster.chapter&&!context.roster.bloodAngelsChapterContext);
      assert.equal(projectEffectiveInstance(book,projection,unit.instanceId).applied.length,0);
      if(source.bookId==='space-marines'){
        assert.ok(![...context.keywords].flatMap(value=>value.split(/\s*,\s*/)).includes('BLOOD ANGELS'));
        assert.ok(![...context.keywords].flatMap(value=>value.split(/\s*,\s*/)).includes('DEATHWING'));
        assert.ok(![...context.keywords].flatMap(value=>value.split(/\s*,\s*/)).includes('RAVENWING'));
      }
    }
    assert.ok(!book.entities.some(row=>row.ruleContract?.clauses?.some(clause=>clause.rosterEffects?.length)));
  });
  const foreign=sm.entities.find(row=>row.kind==='DATASHEET'&&!expectedUnitIds.has(row.id));
  reject('foreign-chapter-physical-unit-rejected',()=>{const altered=clone(state);altered.units[0]=physical(foreign,'foreign');validateRoster(book,altered,[]);});
  reject('unknown-canonical-unit-rejected',()=>{const altered=clone(state);altered.units[0].canonicalUnitId='unit-no-authority';validateRoster(book,altered,[]);});
  reject('foreign-model-profile-rejected',()=>{const altered=clone(state);altered.units[0].modelRows[0].canonicalProfileId=state.units[1].modelRows[0].canonicalProfileId;validateRoster(book,altered,[]);});
  reject('foreign-weapon-owner-rejected',()=>{const altered=clone(state);altered.units[0].modelRows[0].selections[0].canonicalProfileIds=[expectedUnits[1].data.weaponIds[0]];validateRoster(book,altered,[]);});
  const equipment=canonicalModel.entities.find(row=>row.bookId==='space-marines'&&row.kind==='WARGEAR_OPTION'&&typeof row.data.text==='string');
  const equipmentOwner=state.units.find(row=>row.canonicalUnitId===equipment.parentId),ownerSource=records.get(equipment.parentId);
  const caption={bookId:'blood-angels',entityId:equipment.id,path:'/text',caption:{start:0,end:equipment.data.text.length}};
  const selection={selectionKey:'source-equipment-caption',canonicalProfileIds:[],canonicalEquipmentIds:[equipment.id],
    canonicalFieldPaths:{[equipment.id]:['/text']},physicalQuantity:1,sourceReferences:[caption]};
  check('mixed-owner-equipment-caption-and-unit-quantity',()=>{
    const altered=clone(state),unit=altered.units.find(row=>row.instanceId===equipmentOwner.instanceId);unit.selections.push(clone(selection));
    validateRoster(book,altered,[]);
    const inventory=projectSelectedComposition(unit,[]).inventory;assert.equal(inventory.length,1);
    assert.equal(inventory[0].total,1);assert.equal(inventory[0].selection.canonicalEquipmentIds[0],equipment.id);
    assert.equal(records.get(equipment.id).bookId,'space-marines');assert.equal(records.get(equipment.id).parentId,ownerSource.id);
    assert.equal(unit.modelRows.flatMap(row=>row.selections).filter(row=>row.canonicalEquipmentIds.includes(equipment.id)).length,0);
    const derived=executeRosterEffects(book,altered,{}),effective=projectEffectiveInstance(book,derived,unit.instanceId);
    const personal=projectInstanceCards(cards,unit,effective).get(unit.canonicalUnitId)[0];
    assert.deepEqual(personal.rosterEquipmentIds,[equipment.id]);
    const field=cards.get(equipment.id).fields.find(row=>row.source.path==='/text');
    assert.equal(field.value,equipment.data.text);assert.equal(field.source.entityId,equipment.id);
  });
  check('identical-inherited-datasheet-physical-equipment-isolation',()=>{
    const altered=clone(state),first=altered.units.find(row=>row.instanceId===equipmentOwner.instanceId);
    const second=physical(ownerSource,'independent-identical-owner');altered.units.push(second);
    first.selections.push(clone(selection));validateRoster(book,altered,[]);
    const derived=executeRosterEffects(book,altered,{});
    const firstEffective=projectEffectiveInstance(book,derived,first.instanceId),secondEffective=projectEffectiveInstance(book,derived,second.instanceId);
    const firstPersonal=projectInstanceCards(cards,first,firstEffective).get(first.canonicalUnitId)[0];
    const secondPersonal=projectInstanceCards(cards,second,secondEffective).get(second.canonicalUnitId)[0];
    assert.deepEqual(firstPersonal.rosterEquipmentIds,[equipment.id]);assert.deepEqual(secondPersonal.rosterEquipmentIds,[]);
    assert.ok(firstEffective.weapons.every(row=>row.ownerInstanceId===first.instanceId));
    assert.ok(secondEffective.weapons.every(row=>row.ownerInstanceId===second.instanceId));
    assert.equal(projectPersonalBook(payload,altered).instances.filter(row=>row.id===ownerSource.id).length,2);
  });
  reject('equipment-caption-wrong-physical-owner-rejected',()=>{
    const altered=clone(state),unit=altered.units.find(row=>row.instanceId!==equipmentOwner.instanceId);unit.selections.push(clone(selection));validateRoster(book,altered,[]);
  });
  reject('unknown-equipment-caption-reference-rejected',()=>{
    const altered=clone(state),unit=altered.units.find(row=>row.instanceId===equipmentOwner.instanceId),selected=clone(selection);
    selected.sourceReferences[0].entityId='equipment-unreviewed';unit.selections.push(selected);validateRoster(book,altered,[]);
  });
  reject('foreign-consumer-domain-caption-rejected',()=>{
    const altered=clone(state),unit=altered.units.find(row=>row.instanceId===equipmentOwner.instanceId),selected=clone(selection);
    selected.sourceReferences[0].bookId='other-consumer';unit.selections.push(selected);validateRoster(book,altered,[]);
  });
  check('source-ambiguities-and-unresolved-relations-not-activated',()=>{
    assert.deepEqual(book.rosterAttachmentPolicies,[]);
    const coverage=read('./generated/mfm-coverage.json');assert.equal(coverage.referenceOnlyRelationTargets.length,10);
    assert.equal(boundary.relationsActivated,false);
    const issues=read('./source-issues.json').issues;
    for(const id of ['BA-SRC-DC-JUMP-CHAIN','BA-SRC-DC-BOLT-RIFLE']){
      const issue=issues.find(row=>row.id===id);assert.equal(issue.mappingStatus,'NOT_PROVEN');
      assert.deepEqual(issue.activeAliases,[]);assert.deepEqual(issue.activeWeaponRecipients,[]);
    }
    const legacy=own.entities.find(row=>row.kind==='DETACHMENT_RULE'&&row.data.sourceAnchor==='Legacy-of-the-Angel');
    assert.match(legacy.data.text,/Friendly BLOOD ANGELS CHARACTER units:/);
    assert.deepEqual(records.get(legacy.id),legacy);
    const rage=own.entities.filter(row=>row.kind==='DATASHEET_ABILITY'&&row.data.title==='Black Rage');
    assert.equal(rage.length,5);for(const rule of rage){assert.match(rule.data.text,/, or not within/);assert.deepEqual(records.get(rule.id),rule);}
    const jump=ownUnits.find(row=>row.data.sourceAnchor==='Death-Company-Captain-with-Jump-Pack');
    assert.ok(!jump.data.keywords.includes('IMPERIUM'));
    const core=jump.data.ruleReferenceIds.map(id=>records.get(id)).filter(row=>row.data.sourceSection==='CORE ABILITIES');
    assert.equal(core.length,2);assert.ok(core.every(row=>row.data.label!=='Leader'));
    const conflict=boundary.sourceConflicts.find(row=>row.status==='SOURCE_CONFLICT');
    assert.equal(conflict.canonicalOwner,'space-marines');assert.equal(conflict.consumerBook,'blood-angels');
    assert.deepEqual(new Set(conflict.observations.map(row=>row.value)),new Set([1,2]));
    for(const value of conflict.observations)assert.ok(value.document&&value.sha256&&value.pointer);
    const stormlance=sm.entities.find(row=>row.kind==='DETACHMENT'&&row.data.sourceAnchor==='Stormlance-Task-Force');
    assert.ok(stormlance&&accepted.has(stormlance.id));assert.ok(!bindings.detachmentBindings.some(row=>row.entityId===stormlance.id));
  });
  if(build){
    reject('unreviewed-cross-chapter-membership-rejected-at-composition',()=>{
      const altered=clone(ledger),ref=altered.references.find(row=>row.kind==='DATASHEET');
      ref.canonicalId=foreign.id;ref.sourceEntityId=foreign.sourceEntityId;ref.provenance=clone(foreign.provenance);
      build({membership:altered});
    });
    reject('unreviewed-canonical-membership-id-rejected-at-composition',()=>{
      const altered=clone(ledger);altered.references[0].canonicalId='unreviewed-rule';build({membership:altered});
    });
    reject('forged-reference-owner-rejected-at-composition',()=>{
      const altered=clone(ledger);altered.references[0].sourceOwner='blood-angels';build({membership:altered});
    });
    reject('unresolved-accepted-source-reference-rejected-at-composition',()=>{
      const altered=clone(sm);altered.entities=altered.entities.filter(row=>row.id!==ledger.references[0].canonicalId);build({smFacts:altered});
    });
    check('deterministic-in-memory-build',()=>assert.equal(digest(build()),digest(build())));
  }
  return {status:'PASS',checks,negativeControls:negative,counts:{inheritedReferences:180,datasheets:81,
    inheritedDatasheets:67,baOwnedDatasheets:14,modelProfiles:canonicalModel.entities.filter(row=>row.kind==='MODEL_PROFILE').length,
    weaponProfiles:canonicalModel.entities.filter(row=>row.kind==='WEAPON_PROFILE').length,
    chapterGrantsActivated:0,pricingBindings:25,sharedSmPricingReferences:69,effectiveAndPersonalPhysicalUnits:81,
    qualifiedReferenceSubjects:180+106+400,qualifiedReferenceNegativeControls:4,inactiveMfmRelationDeclarations:relationReferences.length},
    unitEvidence:state.units.map(unit=>{
      const source=originals.get(unit.canonicalUnitId),effective=projectEffectiveInstance(book,projection,unit.instanceId);
      const price=points.units.find(row=>row.id===unit.canonicalUnitId);
      return {canonicalId:source.id,sourceOwner:source.bookId,sourceEntityId:source.sourceEntityId,
        physicalInstanceId:unit.instanceId,canonicalFactsSha256:digest(source),
        modelProfileIds:source.data.profileIds,weaponProfileIds:source.data.weaponIds,
        effectiveModelProfiles:effective.profiles.length,effectiveWeaponOccurrences:effective.weapons.length,
        mfmRecordId:price.mfmRecordId,mfmOwner:central.getById(price.mfmRecordId).factionId,
        sourceNumericTierParity:'PASS',effectiveProjection:'PASS',personalProjection:'PASS'};
    }),
    realNewRecruitExportTested:false,browserAcceptance:'NOT_RUN_NOT_CLAIMED',gameplayCompleteness:'NOT_PROVEN'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const {buildBloodAngelsMixedBook}=await import('./book-build.mjs');
  const built=buildBloodAngelsMixedBook();
  console.log(JSON.stringify(runMixedOwnerQA({...built,build:options=>buildBloodAngelsMixedBook(options)}),null,2));
}
