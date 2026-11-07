/** Owner-authored O-3 selectors; native F1 and Personal Guide boundaries. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot,sourceDeclarationView} from '../books/shared/source-refs-v2/source-refs.mjs';
import {detachmentTextDeclaration,projectConditionalRow} from '../books/shared/roster-v2/conditional-policy.mjs';
import {projectEffectiveInstance} from '../books/shared/roster-v2/effective-instance.mjs';
import {prepareRosterPresentationCards,projectFormedUnitCards,projectDetachmentFields} from '../books/shared/army-book-app-v2/personal.mjs';
import {recordReviewedDetachmentRecipients} from '../books/shared/rule-contract-v2/reviewed-detachment-recipients.mjs';
import {detachmentBookFiles,detachmentSnapshot,executeDetachmentSnapshot} from '../tests/helpers/detachment-card-text-fixtures.mjs';
import {changeAttachment} from '../books/shared/roster-v2/context.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/detachment-card-text.json',import.meta.url)));
const selected=process.argv.find(arg=>arg.startsWith('--book='))?.slice(7);
assert(!selected||Object.hasOwn(detachmentBookFiles,selected),'Unknown O-3 book');
const read=relative=>parseSourceFixtureJSON(fs.readFileSync(path.join(root,relative),'utf8'));
const entity=(book,id)=>{const rows=book.entities.filter(row=>row.id===id);assert.equal(rows.length,1,'Exact canonical identity: '+id);return rows[0];};
const textRows=(projection,instance,rule,clause)=>projection.units.find(unit=>unit.instanceId===instance).conditional
  .filter(row=>row.detachmentText&&row.ruleId===rule&&(!clause||row.clauseId===clause));
const result=[],coverage=[];
for(const bookId of Object.keys(detachmentBookFiles).filter(id=>!selected||selected===id)){
  const book=read(`books/${bookId}/v2/generated/${detachmentBookFiles[bookId]}.json`);
  const payload=read(`books/${bookId}/v2/generated/app-presentation.json`);
  const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
  const declarations=read(`books/${bookId}/v2/detachment-recipient-declarations.json`);
  // Supplements publish a reviewed subset of SM Detachments. A rule omitted
  // from the supplement is not an inherited canonical owner to enroll.
  if(['blood-angels','dark-angels'].includes(bookId))declarations.push(...read('books/space-marines/v2/detachment-recipient-declarations.json')
    .filter(row=>book.entities.some(entity=>entity.id===row.ruleId)));
  let recorded=0,notApplicable=0;
  for(const row of declarations){
    const rule=entity(book,row.ruleId),clause=rule.ruleContract.clauses.find(clause=>clause.id===row.clauseId);
    assert(clause,'Exact reviewed clause: '+row.ruleId+'/'+row.clauseId);
    assert.equal(rule.kind,'DETACHMENT_RULE');
    assert.equal(typeof sourceSnapshot(rule)?.sourceId,'string','Canonical provenance is present');
    assert.equal(clause.rosterEffects.length,0,'Source enrollment added no executable effect');
    assert.equal(clause.conditionalPolicy,undefined,'Source enrollment added no typed execution policy');
    const source=row.field.reduce((node,key)=>node?.[key],rule.data);
    assert(source.includes(row.quote),'Exact reviewed source quote survives producer');
    if(row.disposition==='NOT_APPLICABLE'){
      assert.equal(clause.rosterClassification,'NOT_AN_EFFECT');
      assert.equal(clause.recipientStatus,'NOT_APPLICABLE');
      assert.equal(detachmentTextDeclaration(book,rule,clause),null);notApplicable++;
    }else{
      assert.equal(row.disposition,'RECORD');assert.equal(clause.rosterClassification,'BATTLE_ONLY');
      assert.equal(clause.recipientStatus,'RECORDED');
      const role=clause.roles.find(role=>role.id==='detachment-text-recipient');
      assert(role);assert.equal(role.subject,row.subject);assert.equal(role.allegiance,'FRIENDLY');
      assert.equal(role.purpose,'EFFECT_RECIPIENT');assert.deepEqual(role.evidence,{field:row.field,quote:row.quote});
      const declaration=detachmentTextDeclaration(book,rule,clause);assert(declaration);
      const recipients=declaration.recipients.filter(recipient=>recipient.roleId===role.id);
      assert.equal(recipients.length,1);assert(clause.f1RecipientIds.includes(recipients[0].id));
      assert.deepEqual(recipients[0].selector,role.selector);assert.equal(recipients[0].side,'FRIENDLY');recorded++;
    }
  }
  coverage.push({bookId,recorded,notApplicable});
  for(const spec of fixture.cases.filter(row=>row.bookId===bookId)){
    const snapshot=detachmentSnapshot(book,spec),beforeBook=JSON.stringify(book),beforeState=JSON.stringify(snapshot);
    const projection=executeDetachmentSnapshot(book,snapshot);
    assert.equal(JSON.stringify(book),beforeBook,'Projection must not rewrite the canonical book');
    assert.equal(JSON.stringify(snapshot),beforeState,'Projection must not rewrite the physical roster');
    const rule=entity(book,spec.ruleId),canonical=rule.ruleContract.clauses.find(clause=>clause.id===spec.clauseId);
    assert(canonical);assert.equal(canonical.rosterEffects.length,0);
    for(const expected of spec.units){
      const rows=textRows(projection,expected.instanceId,spec.ruleId,spec.clauseId);
      assert.equal(rows.length,expected.expectText?1:0,spec.id+'/'+expected.instanceId+': exact source recipient');
      const effective=projectEffectiveInstance(book,projection,expected.instanceId);
      assert.equal(effective.conditional.filter(row=>row.detachmentText&&row.ruleId===spec.ruleId&&row.clauseId===spec.clauseId).length,rows.length);
      const view=projectFormedUnitCards(cards,{state:snapshot,effective:id=>projectEffectiveInstance(book,projection,id)},expected.instanceId);
      const component=view.components.find(component=>component.unit.instanceId===expected.instanceId);
      assert(component,'Physical recipient component survives Personal Guide');
      const displayed=(component.card.rosterDetachmentTexts||[]).filter(row=>row.ruleId===spec.ruleId&&row.clauseId===spec.clauseId);
      assert.equal(displayed.length,rows.length,'Personal Guide has the same physical recipient');
      if(expected.expectText){
        const [row]=rows;assert.equal(row.detachmentText.kind,spec.textKind);assert.equal(row.detachmentText.recipientSubject,spec.subject);
        assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert(row.detachmentText.text.includes(spec.quote));
        assert.deepEqual(sourceSnapshot(row,{slot:'sourceProvenance'}),sourceSnapshot(rule),'Exact source identity survives F1');
        assert.equal(row.sourceDetachmentId,spec.detachmentId);assert.equal(row.sourceOwnerChain.at(-1).id,spec.detachmentId);
        projectConditionalRow(book,projection,projection.units.find(unit=>unit.instanceId===expected.instanceId),row);
        const scopes=projection.units.find(unit=>unit.instanceId===expected.instanceId).profiles.map(profile=>profile.scopeId);
        assert.deepEqual(row.recipientModelScopeIds,spec.subject==='MODEL'?scopes:[],'MODEL scopes stay on the physical recipient');
        const all=(component.card.rosterDetachmentTexts||[]).filter(row=>row.ruleId===spec.ruleId);
        const plan=projectDetachmentFields(cards.get(spec.ruleId),all,new Map([[spec.ruleId,rule]]));
        assert(plan.fields.some(field=>field.kind==='TEXT'&&field.text.includes(spec.quote)),'Rendered plan preserves the complete literal expected paragraph');
        assert.equal(new Set(plan.fields.map(field=>field.id)).size,plan.fields.length,'Rendered canonical fields are not duplicated');
      }
      assert.equal(projection.units.find(unit=>unit.instanceId===expected.instanceId).applied.some(row=>row.ruleId===spec.ruleId&&row.clauseId===spec.clauseId),false,'Text enrollment must not execute a battle rule');
    }
    const unselected=structuredClone(snapshot),alternative=book.entities.find(entity=>entity.kind==='DETACHMENT'&&entity.id!==spec.detachmentId);
    assert(alternative,'Negative control requires another accepted Detachment');
    unselected.detachments=[{instanceId:'detachment/other',canonicalDetachmentId:alternative.id}];unselected.detachmentIds=[alternative.id];
    const absent=executeDetachmentSnapshot(book,unselected);
    assert(absent.units.every(unit=>!unit.conditional.some(row=>row.detachmentText&&row.ruleId===spec.ruleId)),'Unselected Detachment text is absent');
    if(spec.attachment){
      const detached=changeAttachment(book,snapshot,book.rosterAttachmentPolicies,'DETACH',spec.attachment.leader);
      const after=executeDetachmentSnapshot(book,detached);
      for(const expected of spec.units){
        assert.equal(typeof expected.expectAfterDetach,'boolean','Attachment fixture needs an explicit after-detach expectation');
        const rows=textRows(after,expected.instanceId,spec.ruleId,spec.clauseId);
        assert.equal(rows.length,expected.expectAfterDetach?1:0,spec.id+'/'+expected.instanceId+': after detach recipient');
        const view=projectFormedUnitCards(cards,{state:detached,effective:id=>projectEffectiveInstance(book,after,id)},expected.instanceId);
        const component=view.components.find(component=>component.unit.instanceId===expected.instanceId);
        assert.equal((component.card.rosterDetachmentTexts||[]).filter(row=>row.ruleId===spec.ruleId&&row.clauseId===spec.clauseId).length,rows.length,
          'Personal Guide agrees after detaching the source of the UNIT keyword');
      }
    }
    if(bookId==='death-guard'){
      const unit=projection.units.find(unit=>unit.instanceId==='right');
      assert.equal([...(unit.abilities||[]),...unit.profiles.flatMap(profile=>profile.abilities||[])]
        .some(ability=>ability.canonicalId==='core-infiltrators'),false,'Eligible for selection is not an automatic Infiltrators grant');
    }
    result.push({id:spec.id,status:'PASS',physicalUnits:spec.units.length,wrongDetachment:'PASS',personalGuide:'PASS',...(spec.attachment?{detach:'PASS'}:{})});
  }
  for(const exclusion of fixture.executableExclusions.filter(row=>row.bookId===bookId)){
    const clause=entity(book,exclusion.ruleId).ruleContract.clauses.find(clause=>clause.id===exclusion.clauseId);
    assert.equal(clause.rosterClassification,'ROSTER_EXECUTABLE');assert(clause.rosterEffects.length);
    assert.equal(detachmentTextDeclaration(book,entity(book,exclusion.ruleId),clause),null);
    result.push({id:exclusion.ruleId+'/'+exclusion.clauseId,status:'NOT_APPLICABLE',reason:exclusion.reason});
  }
  if(process.env.O3_BASELINE_ROOT){
    const baseline=parseSourceFixtureJSON(fs.readFileSync(path.join(process.env.O3_BASELINE_ROOT,`books/${bookId}/v2/generated/${detachmentBookFiles[bookId]}.json`),'utf8'));
    for(const rule of baseline.entities.filter(rule=>rule.kind==='DETACHMENT_RULE'))for(const clause of rule.ruleContract?.clauses||[])if(clause.rosterEffects?.length){
      const current=entity(book,rule.id).ruleContract.clauses.find(row=>row.id===clause.id);
      assert.deepEqual(sourceDeclarationView(current,{book}),sourceDeclarationView(clause,{book:baseline}),'Executable Detachment clause changed: '+rule.id+'/'+clause.id);
    }
  }
}

// These disposable inputs exercise the producer's rejection reason, rather
// than accidentally succeeding because the surrounding fixture is invalid.
function producerFixture(){
  const quote='Friendly TEST units can re-roll a Hit roll in your Shooting phase.';
  const evidence={field:['text'],quote};
  return {book:{bookId:'fixture',entities:[{id:'detachment',kind:'DETACHMENT',data:{title:'Test'}},
    {id:'rule',parentId:'detachment',kind:'DETACHMENT_RULE',data:{text:quote},ruleContract:{ruleId:'rule',roles:[],clauses:[
      {id:'battle',roles:[{id:'owner',purpose:'OWNER',subject:'UNIT',allegiance:'FRIENDLY',selector:{predicate:'ALWAYS',subject:'UNIT',contextLevel:'STATIC',arguments:{},evidence}}],
        conditions:[],sourceFields:[['text']],rosterClassification:'BATTLE_ONLY',rosterEffects:[],recipients:[]}]}}]},
    row:{ruleId:'rule',clauseId:'battle',field:['text'],quote,disposition:'RECORD',reason:'Literal friendly test unit.',subject:'UNIT',
      selector:{predicate:'UNIT_KEYWORD',arguments:{keyword:'TEST'},evidence:{field:['text'],quote:'TEST'}}}};
}
const controls=[
  ['changed-quote',x=>{x.row.quote+=' altered';},/Reviewed Detachment quote changed/],
  ['duplicate',()=>{},/Duplicate reviewed Detachment clause/],
  ['executable-target',x=>{x.book.entities[1].ruleContract.clauses[0].rosterEffects=[{id:'preserved-executable'}];},/overlaps an existing execution/],
  ['enemy-selector',x=>{x.row.selector.predicate='ENEMY_UNIT_KEYWORD';},/Unsupported recipient selector/],
  ['wrong-source-field',x=>{x.row.field=['title'];},/proof is outside its clause/],
  ['existing-recipient',x=>{x.book.entities[1].ruleContract.clauses[0].recipients=[{id:'preserved-recipient'}];},/overlaps an existing execution/]
];
for(const [name,mutate,error]of controls){const x=producerFixture();mutate(x);assert.throws(()=>recordReviewedDetachmentRecipients(x.book,name==='duplicate'?[x.row,x.row]:[x.row]),error,name+' must reject for its intended reason');}
const valid=producerFixture();recordReviewedDetachmentRecipients(valid.book,[valid.row]);
assert.equal(valid.book.entities[1].ruleContract.clauses[0].roles.at(-1).purpose,'EFFECT_RECIPIENT');
const once=structuredClone(valid.book);recordReviewedDetachmentRecipients(valid.book,[valid.row]);
assert.deepEqual(valid.book,once,'Exact producer review is stable when regenerating a closure');
console.log(JSON.stringify({status:'PASS',books:coverage,negativeControls:controls.length,cases:result}));
