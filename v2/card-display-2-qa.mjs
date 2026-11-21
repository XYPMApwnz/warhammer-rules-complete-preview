/** Presentation-only source boundaries. No game data or recipient edits. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {groupedAbilitySources} from '../books/shared/army-book-app-v2/datasheet-v1.mjs';
import {detachmentClauseSpan} from '../books/shared/army-book-app-v2/personal.mjs';
import {projectInstanceCards} from '../books/shared/army-book-app-v2/personal.mjs';
import {createSyntheticPersonalFixture} from '../books/shared/army-book-app-v2/personal-datasheet-qa.mjs';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';

const read=file=>parseSourceFixtureJSON(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));
export const books=['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','death-guard','emperors-children','space-marines','tau-empire','tyranids'];
export function displayDuplicateCensus(root=new URL('../',import.meta.url)){
  return books.map(book=>{
    const payload=JSON.parse(fs.readFileSync(new URL(`books/${book}/v2/generated/app-presentation.json`,root),'utf8'));
    const cards=new Map(payload.cards.map(card=>[card.id,card])),psychic=[],damaged=[];
    for(const unit of payload.cards.filter(card=>card.kind==='DATASHEET')){
      const children=unit.children.map(id=>cards.get(id));
      for(const [sectionId,abilities]of groupedAbilitySources(children))for(const ability of abilities)
        psychic.push({unitId:unit.id,unit:unit.title,sectionId,abilityId:ability.id,rule:ability.title,
          text:ability.fields.find(field=>field.source?.path==='/text').value});
      for(const section of children.filter(card=>card.kind==='DATASHEET_SECTION'&&
        (payload.datasheetPresentation.sectionRoles[card.id]==='damaged'||card.title.includes('DAMAGED:'))))
        damaged.push({unitId:unit.id,unit:unit.title,sectionId:section.id,title:section.title,
          fields:section.fields.filter(field=>/^\/blocks\/\d+\/text$/.test(field.presentationPath||field.source?.path||''))});
    }
    return {book,psychic,damaged};
  });
}
export function runDisplay2Guards(){
  let checks=0,negativeControls=0;
  const census=displayDuplicateCensus(),expected=[0,6,0,6,0,0,8,0,0];
  assert.deepEqual(census.map(book=>book.psychic.length),expected);checks++;
  for(const book of census)for(const row of book.psychic){
    const payload=read(`books/${book.book}/v2/generated/app-presentation.json`),cards=new Map(payload.cards.map(card=>[card.id,card]));
    const children=cards.get(row.unitId).children.map(id=>cards.get(id)),before=structuredClone(children);
    assert.ok(groupedAbilitySources(children).get(row.sectionId).some(card=>card.id===row.abilityId));
    assert.deepEqual(children,before);checks++;
    for(const alter of [
      ability=>{ability.parentId='foreign';},
      ability=>{ability.fields.find(field=>field.source?.path==='/section').value='Different section';},
      ability=>{ability.fields.find(field=>field.source?.path==='/text').value+=' Missing canonical sentence.';}
    ]){
      const changed=structuredClone(children);alter(changed.find(card=>card.id===row.abilityId));
      assert.ok(![...groupedAbilitySources(changed).values()].flat().some(card=>card.id===row.abilityId));negativeControls++;
    }
  }
  const am=read('books/adeptus-mechanicus/v2/generated/roster-runtime.json');
  const rule=am.entities.find(rule=>rule.id==='detachment-luminen-auto-choir:rule'),clause=rule.ruleContract.clauses.find(c=>c.id==='fulgurite-healing');
  const row={detachmentText:{kind:'CONDITIONAL'}};
  const span=detachmentClauseSpan(rule,clause,['text'],[row]);
  assert.equal(rule.data.text.slice(span.start,span.end),'- '+clause.evidence.quote);checks++;
  for(const alter of [
    rule=>{rule.ruleContract.clauses[1].evidence.quote='FULGURITE';},
    rule=>{rule.data.text+='\nAn unregistered source qualification.';},
    rule=>{rule.data.text+='\n'+clause.evidence.quote;},
    rule=>{rule.ruleContract.clauses[1].evidence.field=['foreign'];}
  ]){
    const bad=structuredClone(rule);alter(bad);
    assert.equal(detachmentClauseSpan(bad,bad.ruleContract.clauses[1],['text'],[row]),null);negativeControls++;
  }
  assert.equal(detachmentClauseSpan(rule,clause,['text'],[{detachmentText:{kind:'ELIGIBLE_FOR_SELECTION'}}]),null);negativeControls++;
  const choice=am.entities.find(rule=>rule.id==='detachment-data-psalm-conclave:rule');
  assert.equal(detachmentClauseSpan(choice,choice.ruleContract.clauses[0],['text'],[row]),null,
    'Uncovered canonical mode headings preserve the full choice rule');checks++;
  const forge=am.entities.find(rule=>rule.id==='detachment-lords-of-the-forge:rule');
  assert.equal(detachmentClauseSpan(forge,forge.ruleContract.clauses.at(-1),['text'],[row]),null,
    'All TECH-PRIEST paragraphs share the same recorded recipient and remain together');checks++;
  const f=createSyntheticPersonalFixture('display-physical-keywords',false);
  f.effective.physicalKeywords=['INFANTRY'];f.effective.keywords=['INFANTRY','FOREIGN_CHARACTER'];
  const before=structuredClone(f.effective);
  const card=projectInstanceCards(f.cards,f.unit,f.effective).get(f.unit.canonicalUnitId)[0];
  const shown=card.fields.filter(field=>field.source?.path.startsWith('/keywords/')).map(field=>field.value);
  assert.deepEqual(shown,['INFANTRY']);assert.deepEqual(f.effective,before);checks++;
  // Reverting the rendered bag to the formed union must fail the same oracle.
  assert.throws(()=>assert.deepEqual(f.effective.keywords,shown));negativeControls++;
  return {status:'PASS',checks,negativeControls,census};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const {census,...result}=runDisplay2Guards();
  console.log(JSON.stringify({...result,books:census.map(row=>({book:row.book,psychic:row.psychic.length,damaged:row.damaged.length}))}));
}
