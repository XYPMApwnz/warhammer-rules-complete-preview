/** Targeted mixed-owner consumer proof over the existing physical/context and
 * presentation functions. Fixtures are constructed diagnostics, not exports or
 * claims of army legality, Chapter assignment or implemented DA gameplay. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildDarkAngelsMixedBook} from './book-build.mjs';
import {validateRoster,formRoster} from '../../shared/roster-v2/context.mjs';
import {projectEffectiveInstance} from '../../shared/roster-v2/effective-instance.mjs';
import {projectInstanceCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {projectSelectedComposition} from '../../shared/army-book-app-v2/effective-datasheet-presentation.mjs';

const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url),'utf8'));
const clone=structuredClone;

export function verifyMixedOwnerContext(built=buildDarkAngelsMixedBook()){
  const book=built.book||built.model,payload=built.payload;
  const original=JSON.stringify(book),index=new Map(book.entities.map(entity=>[entity.id,entity]));
  const sm=read('../../space-marines/v2/generated/roster-import.json');
  const membership=read('./inherited-sm-references.json');
  const inheritedUnits=new Set(membership.references.filter(row=>row.kind==='DATASHEET').map(row=>row.canonicalId));
  const expected=sm.importBindings.equipmentSelections.filter(row=>inheritedUnits.has(row.ownerId));
  assert.ok(expected.length,'Missing real inherited SM equipment controls');
  const bindings=book.rosterEquipmentCaptionBindings||[];
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  const detachment=book.entities.find(entity=>entity.kind==='DETACHMENT'&&entity.bookId==='dark-angels');
  assert.ok(detachment,'Missing owned DA Detachment negative Chapter-context control');
  const fixture=(owner,binding,ordinal)=>{
    const profiles=owner.data.profileIds;
    return {schema:'roster-v2/roster',bookId:'dark-angels',rosterId:`mixed-context/${ordinal}`,
      detachments:[{instanceId:'detachment/da',canonicalDetachmentId:detachment.id}],
      attachments:[],warlordInstanceId:null,
      units:[0,1].map(copy=>({instanceId:`physical/${ordinal}/${copy}`,canonicalUnitId:owner.id,
        startingStrength:profiles.length,warlord:false,enhancementIds:[],
        modelRows:profiles.map((id,i)=>({rowId:`row/${i}`,canonicalProfileId:id,quantity:1,selections:i?[]:[{
          selectionKey:`weapon/${ordinal}/${copy}`,physicalQuantity:1,perModelQuantity:1,
          canonicalProfileIds:[owner.data.weaponIds[0]],canonicalEquipmentIds:[]}]})),
        selections:copy?[]:[{selectionKey:`equipment/${ordinal}`,physicalQuantity:2,
          canonicalProfileIds:[],canonicalEquipmentIds:clone(binding.canonicalEquipmentIds),
          canonicalFieldPaths:clone(binding.canonicalFieldPaths),sourceReferences:clone(binding.sourceReferences)}]
      }))};
  };
  let negativeControls=0,scopeControls=0;
  const results=[];
  for(const [ordinal,source]of expected.entries()){
    const owner=index.get(source.ownerId);
    assert.equal(owner?.bookId,'space-marines');
    const derived=bindings.find(binding=>binding.ownerId===source.ownerId&&
      JSON.stringify(binding.canonicalEquipmentIds)===JSON.stringify(source.canonicalEquipmentIds));
    assert.ok(derived,`${source.ownerId}: missing consumer caption binding`);
    const expectedReferences=source.sourceReferences.map(reference=>({...clone(reference),bookId:'dark-angels'}));
    assert.deepEqual(derived.sourceReferences,expectedReferences,'Only consumer-domain caption metadata may change');
    const state=fixture(owner,derived,ordinal),verified=validateRoster(book,state,[]);
    assert.deepEqual(verified.units[0].selections,state.units[0].selections);
    const physical=formRoster(book,verified),effective=projectEffectiveInstance(book,physical,verified.units[0].instanceId);
    const variants=projectInstanceCards(cards,verified.units[0],effective);
    const personal=projectPersonalBook(payload,verified);
    assert.equal(personal.instances.length,2);
    assert.ok(personal.allowedIds.has(owner.id));
    const selected=projectSelectedComposition(verified.units[0],variants.get(owner.id)[0].rosterComposition);
    assert.equal(selected.inventory.length,1);assert.equal(selected.inventory[0].total,2);
    assert.equal(projectSelectedComposition(verified.units[1],[]).inventory.length,0);
    const equipment=index.get(source.canonicalEquipmentIds[0]);
    assert.equal(equipment.bookId,'space-marines');assert.equal(equipment.parentId,owner.id);
    assert.deepEqual(equipment.provenance,sm.entities.find(entity=>entity.id===equipment.id).provenance);
    const reference=derived.sourceReferences.find(reference=>reference.caption);
    const sourceField=cards.get(reference.entityId).fields.find(field=>field.source?.path===reference.path);
    const fact=sm.entities.find(entity=>entity.id===reference.entityId);
    const literal=reference.path.slice(1).split('/').reduce((value,key)=>value[key],fact.data);
    const caption=sourceField.value.slice(reference.caption.start,reference.caption.end);
    assert.equal(caption,literal.slice(reference.caption.start,reference.caption.end));
    for(const unit of physical.units){
      assert.equal(unit.canonicalUnitId,owner.id);
      assert.ok(!unit.keywords.includes('DARK ANGELS'),'Inherited membership or DA Detachment must not invent Chapter context');
      for(const model of unit.profiles){
        assert.equal(index.get(model.canonicalProfileId).parentId,owner.id);
        for(const weapon of model.weapons){
          assert.equal(index.get(weapon.canonicalProfileId).parentId,owner.id);
          assert.equal(weapon.scopeId,model.scopeId);assert.equal(weapon.physicalQuantity,1);scopeControls++;
        }
      }
    }
    // Existing UNIT inventory has no invented model bearer, even with a known
    // canonical equipment owner and quantity. A reload remains byte-equivalent.
    assert.ok(!Object.hasOwn(verified.units[0].selections[0],'modelInstanceId'));
    assert.deepEqual(validateRoster(book,JSON.parse(JSON.stringify(verified)),[]),verified);
    const rejects=(mutate,pattern)=>{
      const negative=clone(state);mutate(negative);
      assert.throws(()=>validateRoster(book,negative,[]),pattern);negativeControls++;
    };
    rejects(state=>{state.units[0].selections[0].sourceReferences=clone(source.sourceReferences);},/Foreign equipment caption reference/);
    rejects(state=>{state.units[0].selections[0].sourceReferences[0].entityId='unresolved-canonical-equipment';},/Foreign equipment caption reference/);
    rejects(state=>{state.units[0].selections[0].sourceReferences[0].bookId='other-consumer';},/Foreign equipment caption reference/);
    rejects(state=>{state.units[0].selections[0].sourceReferences[0].path='/missing';},/equipment caption reference/);
    const foreign=expected.find(row=>row.ownerId!==source.ownerId);
    rejects(state=>{state.units[0].selections[0].canonicalEquipmentIds=clone(foreign.canonicalEquipmentIds);},/Foreign equipment owner/);
    const foreignUnit=book.entities.find(entity=>entity.kind==='DATASHEET'&&entity.id!==owner.id);
    rejects(state=>{state.units[0].modelRows[0].canonicalProfileId=foreignUnit.data.profileIds[0];},/Invalid MODEL profile/);
    rejects(state=>{state.units[0].modelRows[0].selections[0].canonicalProfileIds=[foreignUnit.data.weaponIds[0]];},/Foreign weapon profile/);
    const excluded=sm.entities.find(entity=>entity.kind==='DATASHEET'&&!inheritedUnits.has(entity.id));
    assert.ok(excluded&&!index.has(excluded.id));
    rejects(state=>{state.units[0].canonicalUnitId=excluded.id;},/Unresolved canonical unit/);
    results.push({ownerId:owner.id,equipmentId:equipment.id,sourceOwner:equipment.bookId,
      consumerBookId:reference.bookId,caption,quantity:2,independentRecipientQuantity:0,status:'PASS'});
  }
  const da=read('./generated/effective.json');
  for(const [ordinal,binding]of bindings.filter(row=>index.get(row.ownerId)?.bookId==='dark-angels').entries()){
    const owner=index.get(binding.ownerId),state=validateRoster(book,fixture(owner,binding,'da/'+ordinal),[]);
    const physical=formRoster(book,state),effective=projectEffectiveInstance(book,physical,state.units[0].instanceId);
    const variants=projectInstanceCards(cards,state.units[0],effective),personal=projectPersonalBook(payload,state);
    const inventory=projectSelectedComposition(state.units[0],variants.get(owner.id)[0].rosterComposition).inventory;
    assert.equal(inventory.length,1);assert.equal(inventory[0].total,2);
    assert.equal(projectSelectedComposition(state.units[1],[]).inventory.length,0);
    assert.ok(personal.allowedIds.has(owner.id));
    const reference=binding.sourceReferences[0],equipment=index.get(reference.entityId);
    const source=da.entities.find(entity=>entity.id===equipment.id);
    assert.equal(equipment.bookId,'dark-angels');assert.equal(equipment.parentId,owner.id);
    assert.deepEqual(equipment.provenance,source.provenance);
    const field=cards.get(equipment.id).fields.find(value=>value.source.path===reference.path);
    const literal=reference.path.slice(1).split('/').reduce((value,key)=>value[key],source.data);
    const caption=field.value.slice(reference.caption.start,reference.caption.end);
    assert.equal(caption,literal.slice(reference.caption.start,reference.caption.end));
    assert.ok(!Object.hasOwn(state.units[0].selections[0],'modelInstanceId'));
    results.push({ownerId:owner.id,equipmentId:equipment.id,sourceOwner:equipment.bookId,
      consumerBookId:reference.bookId,caption,quantity:2,independentRecipientQuantity:0,status:'PASS'});
  }
  assert.equal(JSON.stringify(book),original,'Context/presentation consumers mutated the mixed model');
  return {status:'PASS',equipmentOccurrences:results.length,inheritedEquipmentOccurrences:expected.length,
    ownedEquipmentOccurrences:results.length-expected.length,results,negativeControls,scopeControls,
    ownerAwareGuard:'UNCHANGED_CONSUMER_DOMAIN_METADATA',sharedProductionChanges:0,
    chapterContextInferred:false,chapterGrantsActivated:0,sourceFactsMutated:false,
    constructedDiagnosticFixtures:true,realNewRecruitExportTested:false,browserVerified:false};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1]))
  console.log(JSON.stringify(verifyMixedOwnerContext()));
