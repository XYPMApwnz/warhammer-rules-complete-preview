/** Independent native keyword census. Reads committed facts only; never builds. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {createKeywordAccess} from '../books/shared/roster-v2/keywords.mjs';

// Expectations are the audited native layouts at 2d5defae, not inferred from
// the passport or from the production keyword accessor under test.
const census=[
 {id:'death-guard',format:'flat',units:36,mixed:[]},
 {id:'adeptus-mechanicus',format:'linked-scopes',units:34,mixed:['unit-servitor-battleclade']},
 {id:'chaos-space-marines',format:'composition-memberships',units:54,mixed:[
  'unit-dark-apostle','unit-dark-commune','unit-traitor-enforcer','unit-fabius-bile','unit-masters-of-the-maelstrom']},
 {id:'emperors-children',format:'flat',units:23,mixed:[]},
 {id:'tyranids',format:'profile-groups',units:52,mixed:['unit-hyperadapted-raveners']},
 {id:'tau-empire',format:'flat',units:43,mixed:[]},
 {id:'space-marines',format:'profile-declarations',units:85,mixed:[
  'unit-sm-c7226873c51d43c0','unit-sm-e43fc0c6d8b14ad8','unit-sm-f169827c554c4eee']},
 {id:'dark-angels',format:'profile-declarations',artifact:'mixed-owner-book.json',units:83,mixed:['unit-sm-e43fc0c6d8b14ad8']},
 {id:'blood-angels',format:'profile-declarations',artifact:'mixed-owner-book.json',units:81,mixed:['unit-sm-e43fc0c6d8b14ad8']}
];
const read=relative=>parseProducerJSON(fs.readFileSync(new URL('../'+relative,import.meta.url),'utf8'));
const ordered=words=>[...new Set(words)].sort();
const same=(actual,expected,message)=>assert.deepEqual(ordered(actual),ordered(expected),message);
const name=value=>value.trim().replace(/\s+/g,' ').toUpperCase();
const loaded=new Map(),results=[];

/** Source-layout oracle: does not import scope helpers, producer adapters,
 * roster bindings, or production keyword-reading functions. In particular,
 * CSM MODEL identity is a composition member, not its shared statline. */
function rawFacts(book,unit,format){
 const entities=new Map(book.entities.map(entity=>[entity.id,entity]));
 if(format==='linked-scopes'){
  const owner=entities.get(unit.data.keywordScopesId);
  assert.equal(owner.kind,'KEYWORD_SCOPES');assert.equal(owner.parentId,unit.id);
  const groups=owner.data.scopes;
  return {unit:groups.filter(group=>group.label!=='FACTION KEYWORDS').flatMap(group=>group.keywords),
   faction:groups.filter(group=>group.label==='FACTION KEYWORDS').flatMap(group=>group.keywords),
   models:unit.data.profileIds.map(id=>({id,keywords:entities.get(id).data.keywordScopeIds.flatMap(scopeId=>{
    const matches=groups.filter(group=>group.id===scopeId);assert.equal(matches.length,1);
    return matches[0].keywords;
   })}))};
 }
 if(format==='composition-memberships'){
  const children=unit.data.childIds.map(id=>entities.get(id));
  const words=children.filter(entity=>['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(entity.kind));
  const members=children.filter(entity=>entity.kind==='COMPOSITION_MEMBER');
  for(const member of members){
   const statline=member.data.composition.modelProfileSourceId;
   assert(unit.data.modelGroups.some(group=>group.modelProfileId===statline&&group.compositionMemberIds.includes(member.id)));
  }
  return {unit:words.filter(word=>word.kind==='KEYWORD_MEMBERSHIP'&&word.data.unitContribution===true).map(word=>word.data.keyword),
   faction:words.filter(word=>word.kind==='FACTION_KEYWORD').map(word=>word.data.keyword),
   models:members.map(member=>({id:member.id,keywords:words.filter(word=>word.data.compositionMemberSourceIds.includes(member.id)).map(word=>word.data.keyword)}))};
 }
 const base=unit.data.keywords,faction=unit.data.factionKeywords;
 return {unit:base,faction,models:unit.data.profileIds.map(id=>{
  let keywords=[...base,...faction];
  if(format==='profile-declarations')keywords.push(...unit.data.modelKeywordDeclarations.filter(declaration=>declaration.sourceProfileId===id).flatMap(declaration=>declaration.keywords));
  if(format==='profile-groups')keywords=[...faction,...unit.data.keywordGroups.filter(group=>
   name(group.scope)==='ALL MODELS'||name(group.scope)===name(entities.get(id).data.name)).flatMap(group=>group.keywords)];
  return {id,keywords};
 })};
}

for(const expected of census){
 const book=read(`books/${expected.id}/v2/generated/${expected.artifact||'effective.json'}`);
 const passport=read(`books/${expected.id}/book.config.json`).passport;
 assert.equal(passport.keywords.format,expected.format,expected.id+': native format changed');
 const access=createKeywordAccess(book,{passport});
 const before=JSON.stringify(book),units=book.entities.filter(entity=>entity.kind==='DATASHEET'),mixed=[];
 assert.equal(units.length,expected.units,expected.id+': native membership changed');
 let modelCount=0;
 for(const unit of units){
  const raw=rawFacts(book,unit,expected.format),where=expected.id+' / '+unit.id;
  same(access.unitKeywords(unit),raw.unit,where+': declared UNIT keywords');
  same(access.unitKeywords(unit.id),raw.unit,where+': identity-based UNIT lookup');
  same(access.factionKeywords(unit),raw.faction,where+': faction keywords');
  same(access.allUnitKeywords(unit),[...raw.unit,...raw.faction],where+': declared UNIT and faction union');
  same(access.modelIds(unit),raw.models.map(model=>model.id),where+': MODEL identities');
  const modelUnion=raw.models.flatMap(model=>model.keywords);
  same(access.allModelKeywords(unit),modelUnion,where+': aggregate MODEL keywords');
  for(const model of raw.models){
   same(access.modelKeywords(unit,model.id),model.keywords,where+' / '+model.id+': intrinsic MODEL keywords');
   modelCount++;
  }
  for(const keyword of ordered([...raw.unit,...raw.faction,...modelUnion,'__ABSENT_NATIVE_KEYWORD__']))
   assert.equal(access.hasModelKeyword(unit,keyword),modelUnion.includes(keyword),where+': MODEL membership '+keyword);
  if(new Set(raw.models.map(model=>JSON.stringify(ordered(model.keywords)))).size>1)mixed.push(unit.id);
 }
 same(mixed,expected.mixed,expected.id+': truly mixed MODEL keyword units');
 assert.equal(JSON.stringify(book),before,expected.id+': read access mutated native facts');
 // Wrong declarations must not silently fall back to whatever flat arrays exist.
 const wrong=expected.format==='linked-scopes'?'flat':'linked-scopes';
 assert.throws(()=>{
  const incorrect=createKeywordAccess(book,{passport:{...passport,keywords:{format:wrong}}});
  incorrect.unitKeywords(units[0]);
 },error=>error instanceof Error&&error.message.includes(expected.id)&&error.message.includes(units[0].id),
 expected.id+': wrong format must identify the book and native UNIT');
 assert.throws(()=>createKeywordAccess(book,{passport:{...passport,keywords:{format:'unknown-keyword-format'}}}),
 error=>error instanceof Error&&error.message.includes(expected.id)&&error.message.includes('unknown-keyword-format'),
 expected.id+': unknown format must be rejected');
 loaded.set(expected.id,{book,passport,access});
 results.push({book:expected.id,units:units.length,modelScopes:modelCount,mixedUnits:mixed.length});
}

// Fixed independent source examples guard against merging models that share
// the same statline: OTHER MODELS in Dark Commune and the Masters' first profile.
const csm=loaded.get('chaos-space-marines');
for(const control of [
 {unit:'unit-dark-commune',positive:'datasheet-dark-commune:section:2:member:2',negative:'datasheet-dark-commune:section:2:member:3'},
 {unit:'unit-masters-of-the-maelstrom',positive:'datasheet-masters-of-the-maelstrom:section:2:member:2',negative:'datasheet-masters-of-the-maelstrom:section:2:member:1'}
]){
 const member=id=>csm.book.entities.find(entity=>entity.id===id);
 assert.equal(member(control.positive).data.composition.modelProfileSourceId,member(control.negative).data.composition.modelProfileSourceId,
  control.unit+': shared-statline control no longer shares a statline');
 assert(csm.access.modelKeywords(control.unit,control.positive).includes('PSYKER'),control.unit+': named PSYKER lost its keyword');
 assert(!csm.access.modelKeywords(control.unit,control.negative).includes('PSYKER'),control.unit+': PSYKER leaked to another composition member');
 assert.throws(()=>csm.access.modelKeywords(control.unit,member(control.positive).data.composition.modelProfileSourceId),
  /ambiguous MODEL statline/,control.unit+': ambiguous statline must require composition identity');
}

// Mutate only a disposable native source scope, after creating its accessor.
// This proves MODEL membership is read from its owner rather than cached or
// reconstructed from the aggregate UNIT keyword list.
const am=loaded.get('adeptus-mechanicus'),mutation=structuredClone(am.book);
const access=createKeywordAccess(mutation,{passport:am.passport});
const unit='unit-servitor-battleclade',underseer='datasheet-servitor-battleclade:profile:servitor-underseer';
const servitors='datasheet-servitor-battleclade:profile:combat-and-gun-servitors';
const otherBefore=access.modelKeywords(unit,servitors);
assert(access.modelKeywords(unit,underseer).includes('TECH-PRIEST'));
const owner=mutation.entities.find(entity=>entity.id==='datasheet-servitor-battleclade:keyword-scopes');
const scope=owner.data.scopes.find(group=>group.id==='datasheet-servitor-battleclade:keyword-scope:underseer');
assert.deepEqual(scope.keywords,['TECH-PRIEST']);scope.keywords=[];
assert(!access.modelKeywords(unit,underseer).includes('TECH-PRIEST'),'Changed MODEL source scope was not observed');
assert.equal(access.hasModelKeyword(unit,'TECH-PRIEST'),false,'Removed MODEL keyword survives the union');
same(access.modelKeywords(unit,servitors),otherBefore,'MODEL mutation changed another model');
assert(am.access.modelKeywords(unit,underseer).includes('TECH-PRIEST'),'Disposable mutation reached original facts');

// Published execution views have already adapted native facts for the roster
// kernel. Compare against those exact fields and explicit MODEL bindings, not
// against the native-layout oracle or an accessor-derived expectation.
const runtimeResults=[],runtimeFailures=[];
for(const expected of census){
 const passport=loaded.get(expected.id).passport,artifact=passport.runtime.executionArtifact;
 const book=read(artifact),access=createKeywordAccess(book,{passport});
 const units=book.entities.filter(entity=>entity.kind==='DATASHEET');
 const before=JSON.stringify(book);let modelScopes=0;
 const check=(unit,profile,field,run)=>{
  try{run();}catch(error){runtimeFailures.push({book:expected.id,artifact,unit:unit.id,
   ...(profile?{profile}:{}),field,message:error.message});}
 };
 for(const unit of units){
  check(unit,null,'keywords',()=>assert.deepEqual(access.unitKeywords(unit),unit.data.keywords));
  check(unit,null,'factionKeywords',()=>assert.deepEqual(access.factionKeywords(unit),unit.data.factionKeywords));
  for(const profile of unit.data.profileIds){
   check(unit,profile,'intrinsicKeywords',()=>{
    let expectedKeywords;
    if(book.rosterProfileBindings!==undefined){
     const bindings=book.rosterProfileBindings.filter(binding=>binding.unitId===unit.id&&binding.profileId===profile);
     assert.equal(bindings.length,1,'Published MODEL must have exactly one explicit runtime binding');
     expectedKeywords=bindings[0].intrinsicKeywords;
    }else expectedKeywords=[...unit.data.keywords,...unit.data.factionKeywords];
    assert.deepEqual(access.modelKeywords(unit,profile),expectedKeywords);
   });
   modelScopes++;
  }
 }
 assert.equal(JSON.stringify(book),before,expected.id+': keyword access mutated its published execution view');
 runtimeResults.push({book:expected.id,units:units.length,modelScopes});
}
assert.equal(runtimeFailures.length,0,'Published runtime keyword parity failed: '+JSON.stringify({
 failures:runtimeFailures.length,firstFailures:runtimeFailures.slice(0,10)},null,2));

console.log(JSON.stringify({status:'PASS',books:results,runtimeViews:runtimeResults,
 controls:{wrongFormat:9,unknownFormat:9,sharedStatlines:2,modelSourceMutation:1}},null,2));
