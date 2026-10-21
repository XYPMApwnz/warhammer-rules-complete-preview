/** Chapter evidence boundary, not a Chapter assignment producer. Constructed
 * snapshots test that consumer membership and unvalidated claims cannot grant
 * Chapter keywords. They do not prove a New Recruit export or army legality. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {lexicalDraft} from '../../shared/roster-v2/import.mjs';
import {validateRoster,formRoster,predicateContext} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const chapterKeywords=['DEATHWING','RAVENWING'];
const physical=(entity,instanceId)=>({instanceId,canonicalUnitId:entity.id,
  startingStrength:entity.data.profileIds.length,modelRows:entity.data.profileIds.map((id,n)=>({
    rowId:'row-'+n,canonicalProfileId:id,compositionScope:'MODEL_ROW',quantity:1,selections:[]})),
  selections:[],enhancementIds:[],warlord:null});

export function runChapterContextQA(built){
  const book=built.book,ledger=read('./chapter-conditions.json');
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const schema=built.schema||createRuleContractSchema();
  const checks=[],evidence=[];
  const check=(id,run)=>{run();checks.push({id,status:'PASS'});};
  check('26-source-backed-conditions-require-validated-army-membership',()=>{
    assert.equal(ledger.records.length,26);
    assert.equal(ledger.records.filter(row=>row.grantedKeywords.includes('DEATHWING')).length,18);
    assert.equal(ledger.records.filter(row=>row.grantedKeywords.includes('RAVENWING')).length,8);
    assert.ok(ledger.records.every(row=>row.runtimeActive===true&&row.physicalContext.armyContextRequired&&
      row.physicalContext.unitChapterKeywordRequired===false));
    const grants=book.entities.flatMap(entity=>(entity.ruleContract?.clauses||[]).flatMap(clause=>clause.rosterEffects||[]))
      .filter(effect=>effect.operation==='GRANT_UNIT_KEYWORD'&&chapterKeywords.includes(effect.keyword));
    assert.equal(grants.length,6);
    assert.ok(grants.every(effect=>effect.unitScope==='PHYSICAL'&&effect.conditions.some(condition=>
      condition.binding==='TARGET'&&condition.predicate.arguments?.key==='daArmyMembershipProven')));
  });
  check('parser-faction-is-army-metadata-not-physical-unit-proof',()=>{
    const draft=lexicalDraft('FACTION KEYWORD: Dark Angels\nDETACHMENT: Inner Circle Task Force\n1x Bladeguard Ancient (60 pts)',parse);
    assert.equal(draft.metadata.faction,'Dark Angels');assert.equal(draft.units.length,1);
    assert.ok(!Object.hasOwn(draft.units[0],'chapter')&&!Object.hasOwn(draft.units[0],'chapterConfirmed'));
  });
  const detachments=book.entities.filter(entity=>entity.kind==='DETACHMENT');
  const daDetachment=detachments.find(entity=>entity.bookId==='dark-angels');
  const smDetachment=detachments.find(entity=>entity.bookId==='space-marines');
  assert.ok(daDetachment&&smDetachment);
  const variants=['absent-context','da-faction-header','forged-unit-claims','foreign-chapter-claims','changed-detachment'];
  for(const condition of ledger.records){
    const unit=records.get(condition.recipient.canonicalId);
    assert.equal(unit?.kind,'DATASHEET');assert.equal(unit.bookId,'space-marines');
    for(const variant of variants)check(condition.recipient.canonicalId+'/'+variant,()=>{
      const state={schema:'roster-v2/roster',rosterId:'chapter-evidence-negative',bookId:book.bookId,
        detachments:[{instanceId:'detachment',canonicalDetachmentId:(variant==='changed-detachment'?smDetachment:daDetachment).id}],
        units:[physical(unit,'recipient-a'),physical(unit,'recipient-b')],attachments:[],warlordInstanceId:null};
      if(variant==='da-faction-header')state.importEvidence={faction:'Dark Angels'};
      if(variant==='forged-unit-claims')Object.assign(state.units[0],{chapter:'DARK_ANGELS',chapterConfirmed:true,
        chapterEvidence:{sourceId:'arbitrary-snapshot-claim',canonicalUnitId:unit.id}});
      if(variant==='foreign-chapter-claims')Object.assign(state.units[0],{chapter:'BLOOD_ANGELS',chapterConfirmed:true});
      const verified=validateRoster(book,state,book.rosterAttachmentPolicies||[]);
      const base=formRoster(book,verified),result=executeRosterEffects(book,verified,schema);
      for(const recipient of result.units){
        const before=base.units.find(row=>row.instanceId===recipient.instanceId);
        const context=predicateContext(verified,result,recipient.instanceId,'UNIT');
        assert.ok(!Object.hasOwn(context.roster,'chapter')&&!Object.hasOwn(context.roster,'chapterConfirmed'));
        for(const keyword of chapterKeywords){
          assert.ok(!recipient.keywords.includes(keyword),variant+' fabricated '+keyword);
          for(const model of recipient.profiles)assert.ok(!model.keywords.includes(keyword),'UNIT grant leaked into MODEL');
        }
        assert.deepEqual(recipient.keywords.filter(key=>chapterKeywords.includes(key)),
          before.keywords.filter(key=>chapterKeywords.includes(key)));
        assert.ok(!recipient.applied.some(row=>row.operation==='GRANT_UNIT_KEYWORD'&&
          (row.after||[]).some?.(key=>chapterKeywords.includes(key))));
      }
      // Recompute from immutable physical state must not accumulate a grant.
      const again=executeRosterEffects(book,verified,schema);
      assert.deepEqual(again.units.map(row=>row.keywords),result.units.map(row=>row.keywords));
      evidence.push({recipientCanonicalId:unit.id,sourceOwner:unit.bookId,expectedKeyword:condition.grantedKeywords[0],
        variant,physicalRecipients:['recipient-a','recipient-b'],unitGrant:'NOT_APPLIED',modelGrant:'NOT_APPLIED'});
    });
  }
  check('formed-keywords-are-not-a-component-chapter-proof',()=>{
    const recipient=records.get(ledger.records[0].recipient.canonicalId);
    const source=book.entities.find(entity=>entity.kind==='DATASHEET'&&entity.bookId==='dark-angels');
    const state={schema:'roster-v2/roster',rosterId:'structural-formed-context-probe',bookId:book.bookId,
      detachments:[{instanceId:'detachment',canonicalDetachmentId:daDetachment.id}],detachmentIds:[daDetachment.id],
      units:[physical(recipient,'bodyguard'),physical(source,'character')],
      attachments:[{leaderInstanceId:'character',bodyguardInstanceId:'bodyguard'}],warlordInstanceId:null};
    // Deliberately a formRoster-only structure probe: no claim that this graph
    // passes source eligibility or that DA attachment runtime is implemented.
    const projection=formRoster(book,state),context=predicateContext(state,projection,'bodyguard','UNIT');
    assert.equal(context.roster.attached,true);
    assert.ok(!Object.hasOwn(context.roster,'chapter')&&!Object.hasOwn(context.roster,'chapterConfirmed'));
    const component=projection.units.find(row=>row.instanceId==='bodyguard');
    assert.ok(component.profiles.every(model=>chapterKeywords.every(key=>!model.keywords.includes(key))));
  });
  check('existing-field-capability-is-not-an-evidence-producer',()=>{
    const isolated=createRuleContractSchema({stateFields:{diagnosticChapterConfirmed:{contextLevel:'ROSTER',valueType:'boolean'}}});
    const predicate={predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',arguments:{key:'diagnosticChapterConfirmed',equals:true}};
    assert.equal(isolated.evaluatePredicate(predicate,{subject:'UNIT',roster:{},battle:{}}),'UNKNOWN');
    assert.equal(isolated.evaluatePredicate(predicate,{subject:'UNIT',roster:{diagnosticChapterConfirmed:false},battle:{}}),'FALSE');
    assert.equal(isolated.evaluatePredicate(predicate,{subject:'UNIT',roster:{diagnosticChapterConfirmed:true},battle:{}}),'TRUE');
  });
  return {status:'PASS',checks,counts:{conditions:26,deathwingConditional:18,ravenwingConditional:8,
    physicalNegativeCases:evidence.length,repeatedUnitOccurrencesPerCase:2,structuralAttachmentProbes:1},
    evidence,chapterContextSource:'NOT_PROVEN_FOR_INHERITED_PHYSICAL_UNIT',
    blocker:'Generic-only army context remains unproven. Book, Detachment, faction header, attachment and arbitrary snapshot properties are insufficient.',
    existingCapability:'FIELD with book-owned bindContext plus GRANT_UNIT_KEYWORD / PHYSICAL needs no new shared operation.',
    codePaths:['books/shared/roster-v2/parser.mjs:224','books/shared/roster-v2/import.mjs:143',
      'books/shared/roster-v2/import.mjs:353','books/space-marines/v2/roster-import.mjs:46',
      'books/shared/roster-v2/context.mjs:245','books/shared/roster-v2/context.mjs:299'],
    realNewRecruitExportTested:false,physicalChapterAssignmentImplemented:false};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const producer=new URL('./rule-contract-build.mjs',import.meta.url);
  const built=fs.existsSync(producer)?(await import(producer)).buildDarkAngelsContracts():
    (await import('./book-build.mjs')).buildDarkAngelsMixedBook();
  console.log(JSON.stringify(runChapterContextQA(built),null,2));
}
