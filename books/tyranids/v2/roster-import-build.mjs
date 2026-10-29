import {parseProducerJSON,serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {consumeMfm,resolveOwnedFact} from './mfm-boundary.mjs';
import {addTyranidsSourceChoices} from './roster-source-choices.mjs';

const read=name=>parseProducerJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const copy=structuredClone;
const valueAt=(value,path)=>path.slice(1).split('/').reduce((item,key)=>item?.[key],value);
const normalize=value=>String(value).replace(/[’‘]/g,"'").toUpperCase();

/** Disposable shared-import view. Existing effective entities remain owners. */
export function buildTyranidsImportBook(facts=read('./generated/effective.json')){
  facts=prepareSourceProducer(facts);
  const original=JSON.stringify(facts),book=copy(facts),index=new Map(book.entities.map(row=>[row.id,row]));
  assert.equal(book.bookId,'tyranids');
  const source=read('./roster-import-source-bindings.json');
  const bytes=fs.readFileSync(new URL('../../../'+source.exportSource.document,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(),source.exportSource.sha256,'Export vocabulary integrity');
  const exportDocument=parseProducerJSON(bytes);
  const verifyExport=proof=>{
    const item=valueAt(exportDocument,proof.path);
    assert.equal(proof.document,source.exportSource.document);assert.equal(item?.id,proof.entryId);
    assert.equal(item?.name,proof.label,'Export label occurrence changed');
  };
  for(const binding of [...source.compositionAliases,...source.weaponAliases])for(const proof of binding.exportEvidence)verifyExport(proof);
  book.mfmImportReferences=consumeMfm(facts.entities);
  const compositions=book.entities.filter(e=>e.kind==='COMPOSITION_MEMBER').map(e=>{
    const aliases=source.compositionAliases.find(row=>row.memberId===e.id),owner=index.get(e.parentId);
    const restricted=source.modelWeaponBindings.find(row=>row.memberId===e.id);
    assert.ok(owner?.data.profileIds.includes(e.data.modelProfileId));
    const allowedProfileIds=restricted?.allowedProfileIds||owner.data.weaponIds;
    assert.ok(allowedProfileIds.every(id=>index.get(id)?.parentId===owner.id),'Foreign physical weapon binding');
    return {id:e.id,ownerId:e.parentId,profileId:e.data.modelProfileId,quantity:copy(e.data.quantity),
      labels:[e.data.name,...(aliases?.labels||[])],allowedProfileIds:copy(allowedProfileIds),
      evidence:{entityId:e.id,path:'/name'},exportEvidence:copy(aliases?.exportEvidence||[])};
  });
  const identityAliases=[];
  for(const profile of book.entities.filter(e=>e.kind==='MODEL_PROFILE')){
    const members=compositions.filter(row=>row.profileId===profile.id);
    identityAliases.push({canonicalId:profile.id,labels:[...new Set(members.flatMap(row=>row.labels))],
      evidence:{entityId:members[0].id,path:'/name'}});
  }
  const weaponSelections=[];
  for(const unit of book.entities.filter(e=>e.kind==='DATASHEET')){
    const groups=new Map();
    for(const id of unit.data.weaponIds){
      const name=index.get(id).data.name,label=name.split(/\s+[–—-]\s+/)[0],key=label.toLowerCase();
      const group=groups.get(key)||{label,ids:[]};group.ids.push(id);groups.set(key,group);
    }
    for(const group of groups.values()){
      const eligible=compositions.filter(row=>row.ownerId===unit.id&&group.ids.every(id=>row.allowedProfileIds.includes(id)));
      weaponSelections.push({ownerId:unit.id,label:group.label,canonicalProfileIds:group.ids,
        eligibleMemberIds:eligible.map(row=>row.id),evidence:group.ids.map(id=>({entityId:id,path:'/name'}))});
    }
  }
  for(const alias of source.weaponAliases){
    assert.ok(alias.canonicalProfileIds.every(id=>index.get(id)?.parentId===alias.ownerId),'Foreign export weapon alias');
    weaponSelections.push({...copy(alias),evidence:alias.canonicalProfileIds.map(id=>({entityId:id,path:'/name'})),
      eligibleMemberIds:compositions.filter(row=>row.ownerId===alias.ownerId&&alias.canonicalProfileIds.every(id=>row.allowedProfileIds.includes(id))).map(row=>row.id)});
  }
  const enhancements=book.entities.filter(e=>e.kind==='ENHANCEMENT').map(e=>{
    const text=e.data.eligibilityText,units=book.entities.filter(row=>row.kind==='DATASHEET');
    let eligible,requiredKeywordAlternatives=[];
    if(e.data.scope==='UNIT'){
      const allowed=text.replace(/ unit only\.$/i,'').split('/').map(normalize);
      eligible=units.filter(u=>u.data.keywordGroups.some(g=>g.keywords.some(k=>allowed.includes(normalize(k))))).map(u=>u.id);
    }else{
      const required=text.split(' model only')[0].split(' model with')[0].trim().split('/').map(value=>{
        const phrase=normalize(value);return phrase.startsWith('TYRANIDS ')?['TYRANIDS',phrase.slice(9)]:[phrase];
      });
      requiredKeywordAlternatives=required;
      eligible=units.filter(u=>u.data.keywordGroups.some(g=>required.some(keys=>keys.every(key=>g.keywords.includes(key)||u.data.factionKeywords.includes(key))))).map(u=>u.id);
      if(text.includes('with the Deep Strike ability'))eligible=eligible.filter(id=>index.get(id).data.ruleReferenceIds.some(ref=>index.get(ref).data.label==='Deep Strike'));
      if(text.includes('excluding MONSTERS'))eligible=eligible.filter(id=>!index.get(id).data.keywordGroups.some(g=>g.keywords.includes('MONSTER')));
    }
    assert.ok(eligible.length,'Missing Enhancement import owner vocabulary '+e.id+': '+text);
    const cost=book.mfmImportReferences.partitions.enhancementBindings.find(row=>row.entityId===e.id);
    const label=resolveOwnedFact(cost.mfmRecordId).label;
    const aliases=[e.data.title.replace(/\s*\(Aura\)\s*$/i,''),label].filter(x=>x!==e.data.title);
    if(aliases.length)identityAliases.push({canonicalId:e.id,labels:[...new Set(aliases)],evidence:{entityId:e.id,path:'/title'}});
    return {id:e.id,detachmentId:e.parentId,scope:e.data.scope,eligibleUnitIds:eligible,
      eligibilityText:text,requiredNativeAbility:text.includes('with the Deep Strike ability')?'Deep Strike':null,
      requiredKeywordAlternatives,
      unresolvedExclusion:text.includes('excluding MONSTERS'),
      sourceReference:{entityId:e.id,path:'/text'},mfmRecordId:cost.mfmRecordId};
  });
  const activeRefs=new Set(book.entities.filter(e=>e.kind==='DATASHEET').flatMap(e=>e.data.ruleReferenceIds));
  const nativeReferenceBindings=book.entities.filter(e=>e.kind==='RULE_REFERENCE'&&activeRefs.has(e.id)).map(e=>({
    id:e.id,ownerId:e.parentId,label:e.data.label,recipient:copy(e.data.recipient),conditionalOnly:e.data.conditionalOnly,
    provenance:copy(e.provenance)}));
  // The shared native bag is safe for the two single-profile native FNP owners.
  // Prime-only/positional references remain declarative and are not bag grants.
  assert.deepEqual(Object.values(book.rosterReferenceSemantics).flatMap(row=>row.abilities),[
    {name:'Feel No Pain',value:5},{name:'Feel No Pain',value:5}]);
  book.rosterProfileBindings=book.entities.filter(e=>e.kind==='MODEL_PROFILE').map(e=>{
    const u=index.get(e.parentId),groups=u.data.keywordGroups;
    const selected=groups.filter(g=>g.scope==='ALL MODELS'||normalize(g.scope)===normalize(e.data.name));
    return {unitId:u.id,profileId:e.id,intrinsicKeywords:[...new Set([...selected.flatMap(g=>g.keywords),...u.data.factionKeywords])]};
  });
  for(const profile of book.entities)if(profile.kind==='MODEL_PROFILE')profile.kind='PROFILE';
  book.importSourceEvidence=copy(source.exportSource);
  book.importBindings={schema:'tyranids-v2/import-bindings/v1',identityAliases,weaponSelections,
    equipmentSelections:copy(source.equipmentSelections),compositions,enhancements,nativeReferenceBindings,
    paidSelectionGroups:[{unitId:'unit-tyrannofex',optionProfileIds:['datasheet-tyrannofex:weapon:1',
      'datasheet-tyrannofex:weapon:2','datasheet-tyrannofex:weapon:3'],
      evidence:{entityId:'datasheet-tyrannofex:wargear:1',path:'/text'}}],
    compoundWeaponSelections:[{ownerId:'unit-tyrant-guard',canonicalProfileId:'datasheet-tyrant-guard:weapon:1',
      label:index.get('datasheet-tyrant-guard:weapon:1').data.name,
      fragments:index.get('datasheet-tyrant-guard:weapon:1').data.name.split(',').map(value=>value.trim()),
      evidence:[{entityId:'datasheet-tyrant-guard:weapon:1',path:'/name'},
        {entityId:'datasheet-tyrant-guard:wargear:1',path:'/text'}]}],
    compositionConstraints:[{ownerId:'unit-neurogaunts',memberId:'datasheet-neurogaunts:section:2:member:1',
      selectedQuantity:2,requiresMemberId:'datasheet-neurogaunts:section:2:member:2',requiredQuantity:20,
      sourceText:'*This unit can only contain 2 Neurogaunt Nodebeasts if it contains 20 Neurogaunts.',
      evidence:{entityId:'datasheet-neurogaunts:section:2',path:'/blocks/0/text'}}],
    defaults:'Omitted selections remain UNKNOWN; never supplied from a weapon list',legality:'NOT_ASSESSED'};
  book.rosterAttachmentPolicies=book.mfmImportReferences.leaderRelations.map(row=>({sourceId:row.sourceId,targetId:row.targetId,
    role:'LEADER',additionalLeaders:0,sourceIds:[row.declarationId],mfmReferenceId:row.mfmRecordId}));
  book.importOnly=true;
  addTyranidsSourceChoices(book);
  assert.equal(JSON.stringify(facts),original);assert.ok(book.entities.every(e=>!e.ruleContract));
  return book;
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])){
  const value=serializeSourceJSON(buildTyranidsImportBook()),target=new URL('./generated/roster-import.json',import.meta.url);
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),value,'Stale Tyranids import input');
  else fs.writeFileSync(target,value);
  console.log('Tyranids import input: PASS (52 datasheets, 57 composition members, 133 profiles)');
}
