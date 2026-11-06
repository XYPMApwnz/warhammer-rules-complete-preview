/** Presentation-only admission for a recorded, unscoped source UNIT. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
import {projectAttachedRuleTexts} from '../books/shared/roster-v2/attached-rule-text.mjs';
import {createRosterConditionContext} from '../books/shared/roster-v2/condition-context.mjs';
import {validateRuleRecipients} from '../books/shared/rule-contract-v2/recipients.mjs';

const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/unit-recipient-scope-browser.json',import.meta.url),'utf8'));
const read=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))});
const observations=[];
for(const fixture of fixtures){
  const {createBrowserRoster}=await import(`../books/${fixture.bookId}/v2/roster-boot.mjs`);
  const runtime=await createBrowserRoster({fetch:read});
  for(const c of fixture.browserCases){
    const imported=runtime.import(c.text,{}, {replaceExisting:true});
    assert.equal(imported.status,'READY',c.id+': '+JSON.stringify(imported.needsBindings));
    for(const edge of [...runtime.state.attachments])runtime.detach(edge.leaderInstanceId);
    assert.equal(runtime.state.units.length,3);
    assert(runtime.candidates('parsed-unit-1').some(row=>row.instanceId==='parsed-unit-2'),c.id+': accepted attachment');
    runtime.attach('parsed-unit-1','parsed-unit-2');
    const state=runtime.snapshot(),projection=JSON.stringify(runtime.projection);
    const select=id=>runtime.effective(id).attachedRuleTexts.filter(row=>row.ruleId===c.canonical.ruleId&&JSON.stringify(row.sourcePath)===JSON.stringify(c.canonical.sourcePath));
    const rows=select(c.target);
    assert.equal(rows.length,c.expectedAttached?1:0,c.id+': one complete original block');
    for(const row of rows){
      assert.equal(row.text,c.canonical.text);assert.equal(row.sourceInstanceId,c.ownerInstance);
      assert.equal(row.recipientInstanceId,c.target);assert(row.sourceLabel&&row.proofs.length);
    }
    assert.equal(select('parsed-unit-3').length,0,c.id+': independent duplicate');
    assert.equal(JSON.stringify(runtime.projection),projection,c.id+': presentation changed execution');
    assert.deepEqual(runtime.snapshot(),state,c.id+': presentation changed state');
    if(fixture.bookId==='tau-empire'){
      // This independent scope control uses the very same proven source and
      // satisfied roster gates. A negative cannot pass because another gate
      // happened to be UNKNOWN (as with some CSM enhancement witnesses).
      const book=parseSourceFixtureJSON(fs.readFileSync(new URL('../books/tau-empire/v2/generated/roster-import.json',import.meta.url),'utf8'));
      const original=JSON.stringify(book),rule=book.entities.find(row=>row.id===c.canonical.ruleId);
      const clause=rule.ruleContract.clauses.find(row=>row.id==='volley-fire');
      assert.equal(clause.recipients.length,1);assert.equal(clause.recipients[0].scope,undefined);
      for(const [scope,count]of [[undefined,1],['FORMED',1],['PHYSICAL',0]]){
        const candidate=structuredClone(book),source=candidate.entities.find(row=>row.id===rule.id);
        const recipient=source.ruleContract.clauses.find(row=>row.id===clause.id).recipients[0];
        if(scope!==undefined)recipient.scope=scope;
        validateRuleRecipients(candidate,source);
        const before=JSON.stringify(candidate),context=createRosterConditionContext(candidate,state,{abilityProjection:runtime.projection});
        const actual=projectAttachedRuleTexts(candidate,runtime.projection,c.target,{state,evaluatePredicate:context.evaluatePredicate}).filter(row=>row.ruleId===rule.id);
        assert.equal(actual.length,count,'Same satisfied gates, scope '+String(scope));
        assert.equal(JSON.stringify(candidate),before,'Presentation must not write a default scope into data');
        assert.equal(JSON.stringify(runtime.projection),projection,'Scope presentation must not recalculate effects');
        observations.push({caseId:c.id,scope:scope??'ABSENT',count,status:'PASS'});
      }
      assert.equal(JSON.stringify(book),original);
    }
    runtime.detach('parsed-unit-1');assert.equal(select(c.target).length,0,c.id+': detach');
    runtime.load(state);assert.deepEqual(select(c.target),rows,c.id+': reload');
    observations.push({caseId:c.id,status:'PASS',blocks:rows.length});
    console.log('PASS '+c.id);
  }
}
const csm=parseSourceFixtureJSON(fs.readFileSync(new URL('../books/chaos-space-marines/v2/generated/roster-runtime.json',import.meta.url),'utf8'));
const personal=csm.entities.find(rule=>rule.id==='detachment-nightmare-hunt:enhancement:3');
const clause=personal.ruleContract.clauses.find(clause=>clause.id==='battle-clause-1');
assert.equal(clause.roles.find(role=>role.id==='bearer-unit').scope,'PHYSICAL','Personal source declaration must survive regeneration');
assert.equal(clause.recipients.find(recipient=>recipient.roleId==='bearer-unit').scope,'PHYSICAL','Canonical recipient must retain the declared scope');
validateRuleRecipients(csm,personal);
observations.push({caseId:'unit-no-scope:physical-terrorglut-declaration',scope:'PHYSICAL',status:'PASS'});
console.log(JSON.stringify({status:'PASS',checks:observations.length,observations}));
