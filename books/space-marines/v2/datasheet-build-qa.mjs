/** Focused native projection oracle. Stage 2A RAW/PDF QA owns source truth;
 * this test independently checks that every accepted datasheet fact survives the
 * existing presentation boundary. No runtime output supplies expected values. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildNativeDatasheets,writeNativeDatasheets} from './datasheet-build.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),base=read('./generated/base.json');
const expectedKinds={DATASHEET:85,MODEL_PROFILE:117,WEAPON_PROFILE:386,DATASHEET_SECTION:261,
  DATASHEET_ABILITY:162,WARGEAR_OPTION:84,RULE_REFERENCE:232,COMPOSITION_MEMBER:117,
  SOURCE_RELATION:46,INVULNERABLE_SAVE:34};
const kinds=new Set(Object.keys(expectedKinds));
const expected=facts.entities.filter(entity=>kinds.has(entity.kind));
const original=new Map(expected.map(entity=>[entity.id,entity]));
const pointer=path=>'/'+path.map(key=>String(key).replaceAll('~','~0').replaceAll('/','~1')).join('/');
const at=(data,path)=>path.slice(1).split('/').map(key=>key.replaceAll('~1','/').replaceAll('~0','~')).reduce((value,key)=>value?.[key],data);
const leaves=(value,path=[])=>Array.isArray(value)?value.flatMap((child,index)=>leaves(child,[...path,index])):
  value!==null&&typeof value==='object'?Object.entries(value).flatMap(([key,child])=>leaves(child,[...path,key])):[{path:pointer(path),value}];
const sorted=items=>[...items].sort();
const hasField=(card,path,value)=>card.fields.some(field=>field.source.entityId===card.id&&field.source.path===path&&JSON.stringify(field.value)===JSON.stringify(value));
const aggregate=entity=>entity.kind==='DATASHEET_SECTION'&&['ABILITIES','WARGEAR ABILITIES'].includes(entity.data.title);

/** The approved factual input is deliberately closed: deletions, extra records,
 * value changes or owner changes cannot become a new expected result. */
function assertInput(input){
  const rows=input.entities.filter(entity=>kinds.has(entity.kind));
  assert.equal(rows.length,expected.length,'Datasheet source population changed');
  assert.equal(new Set(rows.map(entity=>entity.id)).size,rows.length,'Duplicate factual identity');
  for(const entity of rows)assert.deepEqual(entity,original.get(entity.id),'Accepted source record changed: '+entity.id);
}

export function assertNativeDatasheets(result){
  const {model,payload}=result;
  assert.equal(model.bookId,'space-marines');
  assert.equal(payload.schema,'army-book-app-v2/presentation');
  assert.equal(model.entities.length,1524,'Closed datasheet population');
  assert.equal(payload.cards.length,1524,'Native projection invents or loses a canonical card');
  assert.deepEqual(payload.groups.map(group=>group.id),['datasheets'],'No premature full-book publication');
  assert.equal(payload.groups[0].itemIds.length,85);
  assert.equal(payload.sourceCompleteness.semanticCompleteness,'NOT_PROVEN');
  assert.equal(payload.book.mfmVersion,'NOT_ENROLLED');
  assert.equal(payload.rulePresentationLimitations.points,'UNRESOLVED_MFM_V1_6_NOT_ENROLLED');
  assert.ok(model.entities.every(entity=>!entity.ruleContract),'No executable effects at this stage');
  for(const [key,value]of Object.entries(model.mfm))if(key!=='source')assert.deepEqual(value,[],'Unexpected active MFM binding');
  const records=new Map(model.entities.map(entity=>[entity.id,entity]));
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  assert.equal(records.size,1524,'Duplicate model identity');assert.equal(cards.size,1524,'Duplicate card identity');
  assert.deepEqual(sorted(records.keys()),sorted(original.keys()),'Canonical IDs changed');
  assert.deepEqual(sorted(cards.keys()),sorted(original.keys()),'Presentation IDs changed');
  const fields=new Set();let displayedFacts=0;
  for(const source of expected){
    const entity=records.get(source.id),card=cards.get(source.id);
    assert.equal(entity.sourceEntityId,source.sourceEntityId,'Source identity changed');
    assert.equal(entity.bookId,source.bookId,'Canonical book ownership changed');
    assert.equal(entity.sourceKind,source.kind,'Source kind lost during adaptation');
    assert.equal(entity.parentId,source.parentId,'Physical source owner changed');
    assert.equal(card.parentId,source.parentId,'Presentation source owner changed');
    assert.deepEqual(entity.provenance,source.provenance,'Source provenance changed');
    assert.deepEqual(card.provenance,source.provenance,'Presentation provenance changed');
    if(source.fieldProvenance){
      assert.deepEqual(entity.fieldProvenance,source.fieldProvenance,'Official field provenance changed');
      assert.deepEqual(card.fieldProvenance,source.fieldProvenance,'Official field provenance lost');
    }
    // Existing adapter aliases may add layout data; they cannot alter accepted
    // keys or source facts, including unknown recipient/binding declarations.
    for(const [key,value]of Object.entries(source.data)){
      if(key==='stats')for(const [stat,number]of Object.entries(value))assert.equal(entity.data.stats[stat],number);
      else assert.deepEqual(entity.data[key],value,'Factual field changed: '+source.id+'/'+key);
    }
    const aliases={MODEL_PROFILE:['invulnerableSaveId'],WEAPON_PROFILE:['mode'],INVULNERABLE_SAVE:['profileIds']}[source.kind]||[];
    for(const key of Object.keys(entity.data))assert.ok(Object.hasOwn(source.data,key)||aliases.includes(key),'Invented factual field: '+source.id+'/'+key);
    for(const field of card.fields){
      assert(!fields.has(field.id),'Duplicate presentation field');fields.add(field.id);
      assert.equal(field.source.entityId,source.id,'Foreign field owner');
      const value=at(entity.data,field.source.path);
      assert.notEqual(value,undefined,'Invented presentation source path '+field.id);
      assert.deepEqual(field.value,value,'Presentation value differs from its factual owner '+field.id);
    }
    const required={DATASHEET:['title','keywords','factionKeywords'],MODEL_PROFILE:['name','stats'],
      WEAPON_PROFILE:['name','range','attacks','skill','strength','ap','damage','abilities'],
      DATASHEET_SECTION:['title','text'],DATASHEET_ABILITY:['title','text'],WARGEAR_OPTION:['text'],
      RULE_REFERENCE:['label'],COMPOSITION_MEMBER:['text'],SOURCE_RELATION:['rawText'],INVULNERABLE_SAVE:['text']}[source.kind];
    for(const key of required)for(const leaf of leaves(source.data[key],[key])){
      assert(hasField(card,leaf.path,leaf.value),'Missing native display fact '+source.id+leaf.path);displayedFacts++;
    }
    if(source.kind==='MODEL_PROFILE')assert.equal(entity.kind,'PROFILE','Use existing native MODEL profile kind');
    if(source.kind==='WEAPON_PROFILE'){
      assert.equal(entity.data.mode,source.data.range==='Melee'?'melee':'ranged','Weapon layout does not follow explicit accepted range');
      assert(hasField(card,'/mode',entity.data.mode),'Weapon mode missing');
    }
    if(source.kind==='DATASHEET_ABILITY'){
      assert.equal(card.kind,'DATASHEET_SECTION');
      assert.equal(payload.datasheetPresentation.sectionRoles[source.id],'abilities');
      assert.equal(card.fields.find(field=>field.source.path==='/text').presentationPath,'/blocks/0/text');
    }
    if(source.kind==='RULE_REFERENCE'){
      const label=card.fields.find(field=>field.source.path==='/label');
      assert(!label.targetIds?.length,'No unproven Core/Army rule reference resolution');
    }
  }
  assert.equal(expected.filter(aggregate).length,85,'Aggregate ability census');
  for(const unit of expected.filter(entity=>entity.kind==='DATASHEET')){
    const view=cards.get(unit.id),children=expected.filter(entity=>entity.parentId===unit.id);
    const removed=children.filter(aggregate).map(entity=>entity.id);
    assert.deepEqual(sorted(view.children),sorted(children.filter(entity=>!aggregate(entity)&&entity.kind!=='WARGEAR_OPTION').map(entity=>entity.id)),
      'Lost native child or duplicate aggregate ability/wargear block '+unit.id);
    for(const id of removed)assert(!view.children.includes(id),'Duplicate aggregate ability rendered');
    for(const ability of children.filter(entity=>entity.kind==='DATASHEET_ABILITY'))assert.equal(view.children.filter(id=>id===ability.id).length,1);
    for(const profile of children.filter(entity=>entity.kind==='MODEL_PROFILE')){
      const applied=children.filter(entity=>entity.kind==='INVULNERABLE_SAVE'&&entity.data.sourceProfileIds.includes(profile.id)&&
        (!entity.data.conditionText||entity.data.scopeQualification==='EXPLICIT_NAMED_MODEL'));
      const visibleSave=cards.get(profile.id).fields.filter(field=>(field.presentationPath??field.source.path)==='/INSV');
      const referenced=(cards.get(profile.id).profileFieldIds||[]).map(id=>payload.cards.flatMap(card=>card.fields).find(field=>field.id===id));
      assert.equal(visibleSave.length+referenced.length,applied.length,'Invulnerable source profile scope changed '+profile.id);
      for(const field of [...visibleSave,...referenced])assert.equal(field.value,applied[0].data.value,'Wrong native invulnerable value');
    }
    for(const [index,named]of unit.data.modelKeywordDeclarations.entries()){
      assert(named.sourceProfileId,'Named MODEL keyword has no confirmed profile');
      assert.deepEqual(records.get(unit.id).data.modelKeywordDeclarations.find(row=>row.sourceProfileId===named.sourceProfileId),named);
      const group=view.keywordGroups.find(group=>group.labelFieldId===`${unit.id}::/modelKeywordDeclarations/${index}/modelSourceName`);
      assert(group,'Named MODEL keywords have no native layout');
      assert.deepEqual(group.profileIds,[named.sourceProfileId],'Named MODEL keywords assigned to another profile');
      assert.deepEqual(group.fieldIds.map(id=>view.fields.find(field=>field.id===id)?.value),named.keywords,'Named keyword values changed');
    }
  }
  assert.deepEqual(Object.fromEntries(Object.entries(expectedKinds).map(([kind])=>[kind,expected.filter(entity=>entity.kind===kind).length])),expectedKinds);
  assert.equal(expected.filter(entity=>entity.kind==='DATASHEET'&&entity.data.sourcePartition==='COMMON').length,67);
  assert.equal(expected.filter(entity=>entity.kind==='DATASHEET'&&entity.data.sourcePartition!=='COMMON').length,18);
  assert.equal(expected.filter(entity=>entity.kind==='COMPOSITION_MEMBER'&&entity.data.profileBindingStatus==='NOT_PROVEN').length,3);
  return {sourceRecords:expected.length,datasheets:85,modelProfiles:117,weapons:386,nativeAbilities:162,displayedFacts};
}
assertInput(facts);
const before=JSON.stringify({facts,base}),result=buildNativeDatasheets({facts,base});
const census=assertNativeDatasheets(result);
assert.equal(JSON.stringify({facts,base}),before,'Native producer mutated factual inputs');
assert.deepEqual(buildNativeDatasheets({facts,base}),result,'Native build is nondeterministic');
assert.deepEqual(buildNativeDatasheets({facts:{...facts,entities:[...facts.entities].reverse()},base:{...base,entities:[...base.entities].reverse()}}),result,'Input order changes native identity or output');
const mutate=(name,fn)=>{const changed=structuredClone(result);fn(changed);assert.throws(()=>assertNativeDatasheets(changed),undefined,'Mutation survived: '+name);};
const ability=expected.find(entity=>entity.kind==='DATASHEET_ABILITY');
const weapon=expected.find(entity=>entity.kind==='WEAPON_PROFILE');
const profile=expected.find(entity=>entity.kind==='MODEL_PROFILE');
let mutations=0;
for(const [name,fn]of [
  ['omitted weapon',r=>{r.model.entities=r.model.entities.filter(entity=>entity.id!==weapon.id);}],
  ['wrong physical owner',r=>{r.payload.cards.find(card=>card.id===weapon.id).parentId=profile.id;}],
  ['lost ability clause',r=>{r.payload.cards.find(card=>card.id===ability.id).fields.find(field=>field.source.path==='/text').value='truncated';}],
  ['extra canonical card',r=>{r.payload.cards.push({...r.payload.cards[0],id:'not-enrolled'});}],
  ['changed canonical identity',r=>{r.model.entities[0].id='invented';}],
  ['lost provenance',r=>{r.payload.cards[0].provenance={};}],
  ['scope mutation',r=>{r.model.entities.find(entity=>entity.kind==='INVULNERABLE_SAVE').data.sourceProfileIds=[];}],
  ['duplicate native ability',r=>{r.payload.cards.find(card=>card.id===ability.parentId).children.push(ability.id);}],
  ['unresolved Core reference guessed',r=>{r.payload.cards.find(card=>card.kind==='RULE_REFERENCE').fields.find(field=>field.source.path==='/label').targetIds=['core-guessed'];}],
  ['official correction discarded',r=>{const source=expected.find(entity=>entity.fieldProvenance?.text&&entity.data.text!==base.entities.find(row=>row.id===entity.id)?.data.text);assert(source);r.payload.cards.find(card=>card.id===source.id).fields.find(field=>field.source.path==='/text').value=base.entities.find(entity=>entity.id===source.id).data.text;}]
  ,['fabricated unresolved points',r=>{r.model.entities.find(entity=>entity.kind==='DATASHEET').data.points=0;}]
]){mutate(name,fn);mutations++;}
for(const [name,fn]of [
  ['missing accepted record',input=>{input.entities=input.entities.filter(entity=>entity.id!==weapon.id);}],
  ['changed input owner',input=>{input.entities.find(entity=>entity.id===weapon.id).parentId=profile.id;}],
  ['changed input number',input=>{input.entities.find(entity=>entity.id===weapon.id).data.strength='99';}],
  ['unknown accepted identity',input=>{input.entities.push({...structuredClone(weapon),id:'not-enrolled'});}]
]){const input=structuredClone(facts);fn(input);
  assert.throws(()=>assertInput(input),undefined,'Independent oracle accepts '+name);
  assert.throws(()=>buildNativeDatasheets({facts:input,base}),undefined,'Producer accepts '+name);mutations++;}
// Capture/default-input freshness must not consult legacy SM facts or central MFM.
const originalRead=fs.readFileSync,forbiddenReads=[];
const repo=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').toLowerCase();
fs.readFileSync=function guardedRead(file,...args){
  const absolute=path.resolve(file instanceof URL?fileURLToPath(file):String(file)).replaceAll('\\','/').toLowerCase();
  if(absolute.startsWith(repo+'mfm/')||absolute.startsWith(repo+'books/space-marines/')&&!absolute.startsWith(repo+'books/space-marines/v2/')){
    forbiddenReads.push(absolute);throw new Error('Forbidden factual input: '+absolute);
  }
  return originalRead.call(this,file,...args);
};
try{writeNativeDatasheets({check:true});}finally{fs.readFileSync=originalRead;}
assert.deepEqual(forbiddenReads,[]);
console.log(JSON.stringify({status:'PASS',...census,partition:{common:67,chapterTagged:18},unresolvedCompositionMappings:3,
  mutationControls:mutations,deterministic:true,reorderedInputStable:true,freshness:'PASS',mfmIntegration:false,
  runtimeEffectsImplemented:false,legacyOrCentralMfmReads:0,browserAcceptance:'NOT_RUN'},null,2));
