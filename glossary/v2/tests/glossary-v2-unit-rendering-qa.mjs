import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGlobalGlossaryContent} from '../../../books/shared/army-book-app-v2/global-glossary-content.mjs';
import {adaptGlobalGlossary} from '../../../books/shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../../../books/shared/army-book-app-v2/reference-contract.mjs';

const root=new URL('../../../',import.meta.url);
const read=file=>JSON.parse(fs.readFileSync(new URL(file,root),'utf8'));
const index=read('glossary/v2/generated/index.en.json');
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire'];
const sources=new Map(books.map(book=>[book,read(`books/${book}/v2/generated/effective.json`).entities]));
const units=[...sources].flatMap(([book,entities])=>entities.filter(entity=>entity.kind==='DATASHEET').map(entity=>({book,entity})));
assert.equal(units.length,242,'All 36 DG, 34 AdMech, 54 CSM, 23 EC 52 Tyranids and 43 T’au canonical datasheets are required');
const owner=entity=>entity.parentId||entity.ownerId;
const statsOf=(entity,byId)=>{
  const stats={...(entity.data.stats||entity.data.statline||Object.fromEntries(Object.entries(entity.data).filter(([key])=>['M','T','SV','W','LD','OC','INSV'].includes(key))))};
  if(entity.data.invulnerableSaveId){
    const save=byId.get(entity.data.invulnerableSaveId);
    assert.equal(save.kind,'INVULNERABLE_SAVE');assert.ok(save.data.profileIds.includes(entity.id));
    assert.equal(owner(save),owner(entity),'Invulnerable Save remains with the physical profile owner');stats.INSV=save.data.value;
  }
  return stats;
};
const statsLabels={M:'M',T:'T',SV:'Sv',W:'W',LD:'Ld',OC:'OC',INSV:'Invulnerable Save'};
const sourceText=entity=>{
  const body=entity.data.text||entity.data.blocks?.map(block=>block.text||'').filter(Boolean).join('\n')||'';
  const faq=(entity.qualifications||[]).filter(item=>item.value?.faqId&&typeof item.value.sourceText==='string').map(item=>item.value.sourceText);
  return [body,...new Set(faq.filter(value=>!body.replace(/\s+/g,' ').includes(value.replace(/\s+/g,' '))))].filter(Boolean).join('\n\n');
};

// Expectations use Army Book V2 owners, never the old viewer or legacy book model.
function verify(candidate){
  const sourceUnits=candidate.entries.filter(entry=>entry.domain==='ARMY'&&entry.recordType==='UNIT');
  assert.equal(sourceUnits.length,units.length,'Missing/extra unit');
  const byOwner=new Map();
  for(const entry of candidate.entries.filter(entry=>entry.domain==='ARMY')){
    const key=`${entry.sourceOwner.bookId}/${entry.sourceOwner.canonicalId}`;
    assert.ok(!byOwner.has(key),`Duplicate canonical owner ${key}`);byOwner.set(key,entry);
  }
  const display=createGlobalGlossaryContent({entries:candidate.entries});
  const projection=adaptGlobalGlossary(candidate);
  const contract=createReferenceContract({cards:new Map(projection.cards.map(card=>[card.id,card])),index:projection.index});
  for(const {book,entity} of units){
    const entry=byOwner.get(`${book}/${entity.id}`);assert.ok(entry,`${book}/${entity.id}: missing unit`);
    assert.equal(entry.label,entity.displayName||entity.data.title,`${entry.id}: exact canonical Unit label`);
    assert.equal(entry.parent,null,`${entry.id}: Unit must not become another Unit's child`);
    assert.deepEqual(entry.facts.canonicalData,entity.data,`${entry.id}: canonical factual data`);
    const ownEntities=sources.get(book),byId=new Map(ownEntities.map(row=>[row.id,row]));
    const children=ownEntities.filter(row=>owner(row)===entity.id);
    const abilities=children.filter(row=>['DATASHEET_ABILITY','EQUIPMENT_ABILITY','SUPPLEMENTAL_DATASHEET_RULE'].includes(row.kind)||row.kind==='DATASHEET_SECTION'&&row.data.title==='ABILITIES');
    assert.deepEqual(entry.facts.ruleFacts.abilities.map(row=>row.id),abilities.map(row=>row.id),`${entry.id}: complete ability inventory`);
    const scopes=byId.get(entity.data.keywordScopesId)?.data.scopes||[];
    const keywords=entity.data.keywords||[...new Set([...children.filter(row=>row.kind==='KEYWORD_MEMBERSHIP').map(row=>row.data.keyword),...scopes.filter(row=>row.label!=='FACTION KEYWORDS').flatMap(row=>row.keywords||[])])];
    const factionKeywords=entity.data.factionKeywords||[...new Set([...children.filter(row=>row.kind==='FACTION_KEYWORD').map(row=>row.data.keyword),...scopes.filter(row=>row.label==='FACTION KEYWORDS').flatMap(row=>row.keywords||[])])];
    assert.deepEqual(entry.facts.keywords,keywords,`${entry.id}: intrinsic Keywords`);
    assert.deepEqual(entry.facts.factionKeywords,factionKeywords,`${entry.id}: Faction Keywords remain distinct`);
    const profileIds=entity.data.profileIds||entity.data.modelProfileIds||[];
    assert.deepEqual(entry.facts.profiles.map(profile=>profile.canonicalId),profileIds,`${entry.id}: exact model-profile inventory and order`);
    const content=display.project(entry),definition=content.definition;
    assert.doesNotMatch(definition,/\[object Object\]/,`${entry.id}: readable definition`);
    for(const heading of ['UNIT COMPOSITION','MODEL PROFILES','ABILITIES','KEYWORDS'])
      assert.ok(definition.includes(heading),`${entry.id}: ${heading}`);
    const composition=children.find(row=>row.kind==='UNIT_COMPOSITION');
    if(composition){
      for(const id of composition.data.memberIds||[]){
        const member=byId.get(id);assert.ok(member,`${entry.id}: composition owner ${id}`);
        assert.ok(definition.includes(member.data.sourceText.replace(/^[-•]\s*/,'')),`${entry.id}: source composition quantity/name ${id}`);
      }
      for(const block of composition.data.equipmentAndRules||[])if(block.text)
        assert.ok(definition.includes(block.text),`${entry.id}: composition equipment/qualifier`);
    }else{
      const sections=children.filter(row=>row.kind==='DATASHEET_SECTION'&&row.data.title==='UNIT COMPOSITION');
      assert.equal(sections.length,1,`${entry.id}: canonical composition section`);
      for(const memberId of sections[0].data.memberIds||[])assert.ok(definition.includes(byId.get(memberId).data.sourceText.replace(/^[-\u2022]\s*/,'')),`${entry.id}: composition member source identity`);
      assert.ok(definition.includes(sourceText(sections[0])),`${entry.id}: complete composition source text`);
    }
    for(const profile of entry.facts.profiles){
      const canonical=byId.get(profile.canonicalId);assert.equal(owner(canonical),entity.id,`${entry.id}: profile physical owner`);
      assert.equal(profile.name,canonical.displayName||canonical.data.name||entity.data.title,`${entry.id}: exact model profile label`);
      assert.deepEqual(profile.stats,statsOf(canonical,byId),`${entry.id}: every model characteristic`);
      for(const [key,value] of Object.entries(statsOf(canonical,byId)))if(statsLabels[key])
        assert.ok(definition.includes(`${statsLabels[key]} ${value}`),`${entry.id}/${canonical.id}: rendered ${key}`);
    }
    if(entry.facts.profiles.length>1){
      assert.equal(content.structured.statline,undefined,`${entry.id}: mixed profiles must not collapse into one statline`);
      assert.equal(content.structured.modelProfiles.length,profileIds.length,`${entry.id}: mixed model profiles preserved`);
    }
    const weapons=children.filter(row=>row.kind==='WEAPON_PROFILE');
    assert.equal(definition.includes('WEAPON PROFILES'),weapons.length>0,`${entry.id}: weapon section must match source-owned inventory`);
    const renderedWeapons=candidate.entries.filter(row=>row.domain==='ARMY'&&row.recordType==='WEAPON_PROFILE'&&row.sourceOwner.bookId===book&&row.parent?.canonicalId===entity.id);
    assert.deepEqual(renderedWeapons.map(row=>row.sourceOwner.canonicalId).sort(),weapons.map(row=>row.id).sort(),`${entry.id}: exact physical weapon inventory`);
    for(const weapon of weapons){
      const row=byOwner.get(`${book}/${weapon.id}`),data=weapon.data;
      assert.equal(row.label,data.name,`${row.id}: exact canonical weapon label`);
      assert.deepEqual(row.facts.canonicalData,data,`${row.id}: complete weapon data`);
      assert.equal(row.parent.canonicalId,entity.id,`${row.id}: physical weapon owner`);
      const text=display.project(row).definition;
      for(const [label,key] of [['A','attacks'],['S','strength'],['AP','ap'],['D','damage']])
        assert.ok(text.includes(`${label} ${data[key]}`),`${row.id}: rendered ${key}`);
      assert.ok(text.includes(data.range)&&text.includes(data.skill),`${row.id}: range and skill`);
      for(const ability of data.abilities||[])assert.ok(text.includes(ability),`${row.id}: weapon qualifier ${ability}`);
      assert.ok(definition.includes(`• ${row.label}: ${text}`),`${entry.id}: physical weapon occurrence retained`);
    }
    for(const ability of entry.facts.ruleFacts.abilities){
      const canonical=byId.get(ability.id);assert.equal(owner(canonical),entity.id,`${entry.id}: ability physical owner`);
      assert.equal(ability.text,sourceText(canonical),`${entry.id}: exact ability text`);
      if(ability.text)assert.ok(definition.includes(ability.text),`${entry.id}: full ability condition/timing visible`);
    }
    for(const reference of entry.facts.referenceSections)for(const line of reference.lines)
      assert.ok(definition.includes(line),`${entry.id}: special section visible`);
    const article=contract.resolve(entry.id);
    assert.ok(article,`${entry.id}: reachable production reference`);
    assert.equal(article.sections[0].fields[0].value,definition,`${entry.id}: popup/article uses the exact display projection`);
  }
}
verify(index);

const content=createGlobalGlossaryContent({entries:index.entries});
const abaddon=index.entries.find(entry=>entry.sourceOwner.bookId==='chaos-space-marines'&&entry.sourceOwner.canonicalId==='unit-abaddon-the-despoiler');
const talon=index.entries.filter(entry=>entry.sourceOwner.bookId==='chaos-space-marines'&&entry.parent?.canonicalId==='unit-abaddon-the-despoiler'&&entry.recordType==='WEAPON_PROFILE'&&entry.label==='Talon of Horus');
assert.equal(talon.length,2,'Same-name ranged/melee Talon profiles remain separate');
assert.deepEqual(talon.map(row=>row.facts.mode).sort(),['melee','ranged']);
assert.equal(new Set(talon.map(row=>row.sourceOwner.canonicalId)).size,2,'Weapon modes retain canonical identities');
assert.equal((content.project(abaddon).definition.match(/• Talon of Horus:/g)||[]).length,2);
const battleclade=index.entries.find(entry=>entry.sourceOwner.bookId==='adeptus-mechanicus'&&entry.sourceOwner.canonicalId==='unit-servitor-battleclade');
assert.equal(battleclade.facts.profiles.length,2,'Servitor Underseer/Servitors retain their different profiles');
assert.deepEqual(battleclade.facts.profiles.map(profile=>profile.stats.W),['2','1']);

let mutations=0;
for(const mutate of [
  value=>{value.entries=value.entries.filter(row=>row.id!==abaddon.id);},
  value=>{value.entries.push(structuredClone(value.entries.find(row=>row.id===abaddon.id)));},
  value=>{value.entries.find(row=>row.id===abaddon.id).facts.composition='Incorrect composition';},
  value=>{value.entries.find(row=>row.id===abaddon.id).facts.profiles[0].stats.T='99';},
  value=>{value.entries.find(row=>row.id===abaddon.id).facts.profiles=[];},
  value=>{value.entries.find(row=>row.id===talon[0].id).parent.canonicalId='unit-legionaries';},
  value=>{value.entries.find(row=>row.id===talon[0].id).facts.s='99';},
  value=>{value.entries.find(row=>row.id===talon[0].id).label='Incorrect weapon label';},
  value=>{value.entries.find(row=>row.id===abaddon.id).facts.ruleFacts.abilities[0].text='Lost condition';},
  value=>{value.entries.find(row=>row.id===abaddon.id).facts.ruleFacts.abilities=[];},
  value=>{value.entries.find(row=>row.id===abaddon.id).facts.factionKeywords=['DEATH GUARD'];}
]){const copy=structuredClone(index);mutate(copy);assert.throws(()=>verify(copy),assert.AssertionError,'Comparator must reject changed input');mutations++;}
console.log(JSON.stringify({status:'PASS',datasheets:units.length,books:books.length,weaponModes:talon.length,mixedProfiles:true,mutations,productionReferencePath:true}));
