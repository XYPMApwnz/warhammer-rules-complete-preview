/** Presentation-only source lookup over real executor results. Constructed
 * physical snapshots are not player exports or army-legality examples. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot} from '../books/shared/source-refs-v2/source-refs.mjs';
import {executeDetachmentSnapshot} from '../tests/helpers/detachment-card-text-fixtures.mjs';
import {prepareCSMRosterDeclarations} from '../books/chaos-space-marines/v2/roster-effect-context.mjs';
import {normalizeCSMEffectiveBook} from '../books/chaos-space-marines/v2/roster-presentation.mjs';
import {createTyranidsRuleSchema} from '../books/tyranids/v2/roster-source-choices.mjs';
import {validateRoster,withRosterDetachments} from '../books/shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../books/shared/roster-v2/effects.mjs';
import {projectEffectiveInstance} from '../books/shared/roster-v2/effective-instance.mjs';
import {executableDetachmentSources,prepareRosterPresentationCards} from '../books/shared/army-book-app-v2/personal.mjs';

import {files,cases,createExecutableDetachmentSnapshot} from '../tests/helpers/executable-detachment-cases.mjs';

const read=relative=>parseSourceFixtureJSON(fs.readFileSync(new URL('../'+relative,import.meta.url),'utf8'));
const selected=process.argv.find(arg=>arg.startsWith('--book='))?.slice(7);
assert(!selected||Object.hasOwn(cases,selected),'Unknown native book');
const results=[];let mutations=0;
for(const [bookId,specs]of Object.entries(cases).filter(([id])=>!selected||id===selected)){
  const book=read(`books/${bookId}/v2/generated/${files[bookId]}.json`);
  const payload=read(`books/${bookId}/v2/generated/app-presentation.json`);
  const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
  const sources=new Map(book.entities.filter(entity=>entity.kind==='DETACHMENT_RULE').map(entity=>[entity.id,entity]));
  const observed=book.entities.filter(entity=>entity.kind==='DETACHMENT_RULE'&&entity.ruleContract?.clauses.some(clause=>clause.rosterClassification==='ROSTER_EXECUTABLE')).map(entity=>entity.id).sort();
  assert.deepEqual(observed,specs.map(([id])=>id).sort(),bookId+': independently enumerated executable rule inventory');
  for(const [ruleId,title,unitId]of specs){
    const rule=sources.get(ruleId),unit=book.entities.find(entity=>entity.id===unitId);
    assert.equal(rule.data.title||rule.displayName,title);assert.equal(unit?.kind,'DATASHEET',unitId);
    const snapshot=createExecutableDetachmentSnapshot(book,ruleId,unitId);
    const originalBook=JSON.stringify(book),originalState=JSON.stringify(snapshot),originalCards=JSON.stringify([...cards]);
    const projection=bookId==='chaos-space-marines'?prepareCSMRosterDeclarations(book,snapshot).projection:
      bookId==='tyranids'?executeRosterEffects(book,validateRoster(book,snapshot,book.rosterAttachmentPolicies),
        withRosterDetachments(createTyranidsRuleSchema({book,state:snapshot}))):executeDetachmentSnapshot(book,snapshot);
    const viewBook=bookId==='chaos-space-marines'?normalizeCSMEffectiveBook(book):book;
    const effective=projectEffectiveInstance(viewBook,projection,'physical/right');
    const before=JSON.stringify(effective),groups=executableDetachmentSources(cards,effective,sources);
    const match=groups.filter(group=>group.rule.id===ruleId);
    assert.equal(match.length,1,bookId+'/'+ruleId+': one source from an actual execution trace');
    assert.equal(match[0].card,cards.get(ruleId));assert.equal(match[0].rule,rule);
    const traces=[...effective.applied,...effective.conditional.filter(row=>!row.policy&&!row.detachmentText)]
      .filter(row=>row.ruleId===ruleId&&rule.ruleContract.clauses.some(clause=>clause.id===row.clauseId&&clause.rosterClassification==='ROSTER_EXECUTABLE'));
    assert(traces.length,'No invented eligibility without an execution trace');assert.deepEqual(match[0].contributions,traces);
    assert.notEqual(match[0].contributions[0],traces[0],'Contributions are disposable copies');
    for(const row of traces){
      const clause=rule.ruleContract.clauses.find(clause=>clause.id===row.clauseId);
      for(const field of clause.sourceFields){
        const text=field.reduce((node,key)=>node?.[key],rule.data);if(typeof text!=='string')continue;
        const pointer='/'+field.join('/');
        assert(cards.get(ruleId).fields.some(published=>(published.source?.path===pointer||published.presentationPath===pointer)&&published.value===text),
          'Full original canonical source field is present verbatim in the publication');
      }
    }
    assert.deepEqual(sourceSnapshot(match[0].rule),sourceSnapshot(rule),'Original canonical source identity survives');
    assert.equal(JSON.stringify(effective),before);assert.equal(JSON.stringify(book),originalBook);
    assert.equal(JSON.stringify(snapshot),originalState);assert.equal(JSON.stringify([...cards]),originalCards);
    assert.deepEqual(executableDetachmentSources(cards,{...effective,applied:[],conditional:[]},sources),[],
      'Selected detachment and matching keywords alone never admit prose');
    assert.deepEqual(executableDetachmentSources(cards,effective,new Map()),[],'Missing source metadata never guesses a source');
    // Each malformed proof is isolated to avoid an unrelated earlier failure.
    const actual=traces.find(row=>row.effectId)||traces[0];
    const single=row=>({...effective,applied:row.effectId?[row]:[],conditional:row.effectId?[]:[row]});
    assert.throws(()=>executableDetachmentSources(cards,single({...actual,targetInstanceId:'physical/control'}),sources),/another physical unit/);mutations++;
    assert.throws(()=>executableDetachmentSources(cards,single({...actual,clauseId:'missing-canonical-clause'}),sources),/text clause/);mutations++;
    if(actual.effectId){assert.throws(()=>executableDetachmentSources(cards,single({...actual,effectId:'missing-canonical-effect'}),sources),/text effect/);mutations++;}
    const changedCards=new Map(cards),changed=structuredClone(cards.get(ruleId));
    const clause=rule.ruleContract.clauses.find(clause=>clause.id===actual.clauseId);
    const path=clause.sourceFields.find(field=>typeof field.reduce((node,key)=>node?.[key],rule.data)==='string');assert(path);
    const pointer='/'+path.join('/');
    for(const field of changed.fields)if(field.source?.path===pointer||field.presentationPath===pointer)field.value+=' altered';
    changedCards.set(ruleId,changed);
    assert.throws(()=>executableDetachmentSources(changedCards,single(actual),sources),/published source/);mutations++;
    results.push({bookId,ruleId,status:'PASS',applied:traces.filter(row=>row.effectId).length,unknown:traces.filter(row=>row.state==='UNKNOWN').length});
  }
}
assert.equal(results.length,selected?cases[selected].length:29);
console.log(JSON.stringify({status:'PASS',books:new Set(results.map(row=>row.bookId)).size,rules:results.length,negativeControls:mutations,results},null,2));
