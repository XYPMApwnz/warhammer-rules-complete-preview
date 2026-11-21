/** One reviewed physical identity join, corroborated by the saved BSData graph.
 * Source labels, factual data and generic roster identity rules stay unchanged.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';

const UNIT='unit-sm-c7226873c51d43c0',MEMBER='composition-sm-11f249c8e3af4b85',PROFILE='model-sm-1e6ba64c42ba4d79';
const SECTION='section-sm-507cbcfad6964570';
const SNAPSHOT='books/space-marines/sources/bsdata-space-marines-11e.json';
const PIN='2C3427A887B90BEBD652A37CC5FC0DEAAB4DE000D15AE1E73EDAF024AE0D4163';
const FILE_PIN='46737F8D6DE3A962B1EB2623133416EE2C33DD7C532B93DF999ED67B7F5048A0';
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const root=new URL('../../../',import.meta.url);
const at=(value,pointer)=>pointer.slice(1).split('/').reduce((node,key)=>node?.[key],value);
const sameSet=(actual,expected,label)=>assert.deepEqual([...actual].sort(),[...expected].sort(),label);
let capturedSource;
function corroboratingSource(){
  const file=new URL(SNAPSHOT,root),stat=fs.statSync(file);
  const stamp=[stat.size,stat.mtimeMs,stat.ctimeMs].join(':');
  if(capturedSource?.stamp===stamp)return capturedSource.data;
  const bytes=fs.readFileSync(file);assert.equal(sha(bytes),PIN,'Wardens corroborating source bytes changed');
  const data=JSON.parse(bytes);
  assert.deepEqual(data.documents[2].data,data.documents[9].data,'Duplicate source occurrences diverged');
  capturedSource={stamp,data};return data;
}

export function validateWardensSourceCorrection(row,{facts,index,proof}={}){
  assert.equal(row?.type,'SOURCE_CORROBORATED_COMPOSITION_PROFILE_BINDING');
  assert.equal(row.id,'sm-o3-reviewed-'+MEMBER);assert.equal(row.status,'SOURCE_CONFIRMED');
  assert.equal(row.canonicalOwnerId,UNIT);assert.equal(row.compositionId,MEMBER);assert.equal(row.modelProfileId,PROFILE);
  assert.equal(row.sourceRole,'NAMED_PSYKER');assert.equal(row.preserveSourceLabels,true);assert.equal(row.globalAliasesAdded,false);
  assert.deepEqual(row.old,{profileBindingStatus:'NOT_PROVEN',modelProfileId:null});
  assert.deepEqual(row.new,{profileBindingStatus:'SOURCE_CONFIRMED',modelProfileId:PROFILE});
  assert.deepEqual(row.context,{unitId:UNIT,compositionId:MEMBER,modelProfileId:PROFILE,unitTitle:'Wardens of Ultramar',
    compositionLabel:'Dainal Kornelius',profileLabel:'Dainal Komelius',uniqueNamedKeyword:'PSYKER',fixedQuantity:1,
    sourceLoadout:'Dainal Kornelius is equipped with: 1 Astropathic Blast; 1 Force Stave.',statsAreCorroborationNotIdentityKey:true});
  const c=row.corroboration;
  assert.deepEqual(c,{document:SNAPSHOT,sha256:PIN,repository:'https://github.com/BSData/wh40k-11e',
    commit:'fa30730fca11fbfe87be90684d481d50e0efaf66',documentIndex:2,duplicateDocumentIndex:9,
    duplicateIsNotIndependentEvidence:true,sourceFile:'Imperium - Ultramarines.json',sourceFileSha256:FILE_PIN,
    unitPointer:'/documents/2/data/catalogue/sharedSelectionEntries/15',unitId:'b793-b77e-9e49-d397',
    modelPointer:'/documents/2/data/catalogue/sharedSelectionEntries/15/selectionEntries/4',modelId:'cc2c-abb5-1cb7-d195',
    profilePointer:'/documents/2/data/catalogue/sharedSelectionEntries/15/profiles/1',profileId:'fec7-5099-b5b8-9760',
    profileName:'Gaius Silva, Aemelia Minervas, Dainal Kornelius, Lucia Vestha'});
  const source=corroboratingSource();assert.equal(source.source.repository,c.repository);assert.equal(source.source.commit,c.commit);
  for(const number of [c.documentIndex,c.duplicateDocumentIndex]){
    const doc=source.documents[number];assert.equal(doc.file,c.sourceFile);assert.equal(doc.sha256,FILE_PIN);
  }
  const sourceUnit=at(source,c.unitPointer),sourceModel=at(source,c.modelPointer),sourceProfile=at(source,c.profilePointer);
  assert.equal(sourceUnit.id,c.unitId);assert.equal(sourceUnit.name,row.context.unitTitle);assert.equal(sourceUnit.type,'unit');
  assert.equal(sourceModel.id,c.modelId);assert.equal(sourceModel.name,row.context.compositionLabel);assert.equal(sourceModel.type,'model');
  assert.equal(sourceProfile.id,c.profileId);assert.equal(sourceProfile.name,c.profileName);assert.equal(sourceProfile.typeName,'Unit');
  const namedModels=sourceUnit.selectionEntries.filter(entry=>entry.type==='model');
  sameSet(namedModels.map(entry=>entry.name),['Ancient Gadriel','Veteran Sergeant Metaurus','Gaius Silva','Aemelia Minervas','Dainal Kornelius','Lucia Vestha'],'Wardens physical population changed');
  for(const model of namedModels)for(const type of ['min','max']){
    const constraints=model.constraints.filter(constraint=>constraint.type===type&&constraint.field==='selections'&&constraint.scope==='parent');
    assert.equal(constraints.length,1);assert.equal(constraints[0].value,1,'Wardens fixed-one model quantity changed');
  }
  const psykers=namedModels.filter(model=>model.categoryLinks?.some(category=>category.name==='Psyker'&&category.targetId==='13bf-2bee-3ae0-b414'));
  assert.deepEqual(psykers.map(model=>model.id),[c.modelId],'Wardens PSYKER is not uniquely the reviewed physical model');
  sameSet(sourceModel.selectionEntries.map(entry=>entry.name),['Astropathic Blast','Force Stave'],'Wardens source-owned loadout changed');
  assert.ok(sourceProfile.name.split(', ').includes(sourceModel.name),'Named source profile does not include this model');

  sameSet(row.sourceProof.map(item=>item.canonicalId),[MEMBER,PROFILE,SECTION],'Wardens raw proof coverage changed');
  row.sourceProof.forEach(proof);
  assert.equal(row.sourceProof.find(item=>item.canonicalId===MEMBER).selectedSourceText,'1 Dainal Kornelius model');
  assert.equal(row.sourceProof.find(item=>item.canonicalId===PROFILE).selectedSourceText,'6" 3 4+ 3 6+ 1 Dainal Komelius(⌀40mm)');
  assert.equal(row.sourceProof.find(item=>item.canonicalId===SECTION).selectedSourceText,'UNIT COMPOSITION');
  const unit=index.get(UNIT),member=index.get(MEMBER),profile=index.get(PROFILE),section=index.get(SECTION);
  assert.equal(unit.kind,'DATASHEET');assert.equal(unit.data.title,row.context.unitTitle);
  assert.equal(member.kind,'COMPOSITION_MEMBER');assert.equal(profile.kind,'MODEL_PROFILE');
  for(const entity of [member,profile,section])assert.equal(entity.parentId,UNIT,'Foreign Wardens proof owner');
  assert.equal(member.data.name,row.context.compositionLabel);assert.equal(profile.data.name,row.context.profileLabel);
  assert.equal(member.data.profileBindingStatus,'NOT_PROVEN');assert.equal(member.data.modelProfileId,null);
  assert.deepEqual(member.data.quantity,{min:1,max:1});assert.ok(section.data.text.split('\n').includes(row.context.sourceLoadout));
  const declarations=unit.data.modelKeywordDeclarations.filter(declaration=>declaration.keywords.includes('PSYKER'));
  assert.equal(declarations.length,1,'Canonical Wardens named PSYKER is ambiguous');
  assert.equal(declarations[0].modelSourceName,row.context.profileLabel);assert.equal(declarations[0].sourceProfileId,PROFILE);
  assert.equal(declarations[0].profileBindingStatus,'SOURCE_CONFIRMED');assert.equal(declarations[0].scope,'SOURCE_NAMED_MODEL');
  assert.equal(declarations[0].pointer,'/html/body/div/div[1]/div[3]/div[2]/div[32]/div[3]/div[1]/span[3]');
  sameSet(unit.data.compositionMemberIds,[MEMBER,'composition-sm-14ec619a8d084ef8','composition-sm-4a079de71db2454f',
    'composition-sm-a27c7cddaf7e46cb','composition-sm-a2e6d59944df4e43','composition-sm-d38a96d955d04000'],'Canonical Wardens composition population changed');
  sameSet(unit.data.profileIds,[PROFILE,'model-sm-3b16612be262433d','model-sm-4d02fb9f504a444d',
    'model-sm-5e6df789f1434020','model-sm-915fe837347f46fb','model-sm-c8cf0383f7ad4a77'],'Canonical Wardens profile population changed');
  const stats=Object.fromEntries(sourceProfile.characteristics.filter(characteristic=>characteristic.name!=='InSv')
    .map(characteristic=>[characteristic.name==='Sv'?'SV':characteristic.name,characteristic.$text]));
  assert.deepEqual(stats,profile.data.stats,'Corroborating named profile stats changed');
  return {memberId:MEMBER,profileId:PROFILE,evidence:[{entityId:MEMBER,path:['text']},{entityId:PROFILE,path:['name']},
    {entityId:UNIT,path:['modelKeywordDeclarations']},{entityId:SECTION,path:['text']}],
    provenance:{...structuredClone(sourceSnapshot(member,{book:facts})),reviewId:row.id,reviewType:row.type}};
}
