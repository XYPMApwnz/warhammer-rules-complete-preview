/** Source formatting controls: prose/list rendering does not own effects. */
import assert from 'node:assert/strict';
import {sourceTextBlocks,conditionalSourceTextKey} from './effective-datasheet-presentation.mjs';

let checks=0;
const text='Martial Exemplar: While a friendly unit is within 6", its attacks can:\n- Re-roll hit rolls of 1.\n- Re-roll wound rolls of 1.';
const blocks=sourceTextBlocks(text);
assert.deepEqual(blocks,[{kind:'PARAGRAPH',lines:[text.split('\n')[0]]},
  {kind:'LIST',lines:['- Re-roll hit rolls of 1.','- Re-roll wound rolls of 1.']}]);checks++;
assert.equal(blocks.map(block=>block.lines.join('\n')).join('\n'),text,'Lists retain all source characters');checks++;
assert.deepEqual(sourceTextBlocks('Before.\n• One.\n• Two.\nAfter.'),[
  {kind:'PARAGRAPH',lines:['Before.']},{kind:'LIST',lines:['• One.','• Two.']},{kind:'PARAGRAPH',lines:['After.']}]);checks++;
for(const heading of ['Supreme Commander','WARGEAR OPTIONS']){
  const body='The full restriction is retained.\n- A source option.';
  assert.equal(sourceTextBlocks(heading+'\n'+body,{heading}).map(block=>block.lines.join('\n')).join('\n'),body);checks++;
  assert.equal(sourceTextBlocks('Different heading\n'+body,{heading}).map(block=>block.lines.join('\n')).join('\n'),'Different heading\n'+body,
    'A different title is never removed');checks++;
}
const proof={sourceId:'accepted-source',pointer:'/one-rule',sha256:'source-hash'};
const row={ruleId:'rule-one',sourceInstanceId:'physical-one',sourceModelScopeId:'physical-one/model-one',
  policy:{contextQuote:text},clauseId:'hit-roll',policyPayload:{roll:'HIT'}};
const before=structuredClone(row);
const other={...structuredClone(row),clauseId:'wound-roll',policyPayload:{roll:'WOUND'}};
assert.equal(conditionalSourceTextKey(row,proof),conditionalSourceTextKey(other,proof),
  'Independent Hit and Wound rows may reference one identical rule text');checks++;
assert.deepEqual(row,before,'Computing the display reference never changes a clause or effect');checks++;
for(const change of [value=>value.ruleId='rule-two',value=>value.sourceInstanceId='physical-two',
  value=>value.sourceModelScopeId='physical-one/model-two',value=>value.policy.contextQuote+=' A different qualification.']){
  const changed=structuredClone(row);change(changed);
  assert.notEqual(conditionalSourceTextKey(changed,proof),conditionalSourceTextKey(row,proof),
    'Other rule, physical instance, MODEL scope or prose is never merged');checks++;
}
assert.notEqual(conditionalSourceTextKey(row,{...proof,pointer:'/other-rule'}),conditionalSourceTextKey(row,proof));checks++;
assert.equal(conditionalSourceTextKey(row,null),null,'Missing provenance cannot prove shared source text');checks++;
assert.equal(conditionalSourceTextKey({...row,sourceInstanceId:null},proof),null,
  'Missing physical source cannot prove shared text ownership');checks++;
console.log(JSON.stringify({status:'PASS',checks,sourceFactsMutated:false}));
