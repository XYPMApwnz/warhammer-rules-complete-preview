/** Canonical recipient translation over real execution declarations and mutations.
 * This does not build books, fetch sources or evaluate a physical roster.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as policy from '../roster-v2/conditional-policy.mjs';
import {compileBookRecipients,compileRuleRecipients,validateBookRecipients,validateRuleRecipients,resolveRecipient,recipientDeclarationView} from './recipients.mjs';

const clone=structuredClone;
const declaration=policy.producerDetachmentTextDeclaration||policy.detachmentTextDeclaration;
const artifacts={'adeptus-mechanicus':'roster-runtime','blood-angels':'roster-import','chaos-space-marines':'roster-runtime','dark-angels':'roster-import','death-guard':'rule-contract-effective','emperors-children':'roster-attachments','space-marines':'roster-import','tau-empire':'roster-import','tyranids':'roster-runtime'};
const results=[];
let primaryMutationsRejected=0,referenceMutationsRejected=0;
for(const [bookId,artifact]of Object.entries(artifacts)){
 const file=new URL(`../../${bookId}/v2/generated/${artifact}.json`,import.meta.url),input=JSON.parse(fs.readFileSync(file,'utf8')),before=JSON.stringify(input);
 const book=compileBookRecipients(input,{f1Declaration:declaration});
 assert.equal(JSON.stringify(input),before,'Compiler mutated the execution source');
 assert.deepEqual(compileBookRecipients(book,{f1Declaration:declaration}),book,'Compilation is not idempotent');
 const scratch=recipientDeclarationView(book);
 assert.deepEqual(compileBookRecipients(scratch,{f1Declaration:declaration}),book,'Producer validation view changed canonical recipients');
 const stratagems=input.entities.filter(rule=>rule.kind==='STRATAGEM'||rule.ruleContract?.kind==='STRATAGEM');
 for(const source of stratagems){
  assert.deepEqual(book.entities.find(rule=>rule.id===source.id),source,'Compiler changed an excluded Stratagem');
  assert.deepEqual(scratch.entities.find(rule=>rule.id===source.id),source,'Declaration view changed an excluded Stratagem');
  assert.equal(JSON.stringify(book.entities.find(rule=>rule.id===source.id)),JSON.stringify(source),'Stratagem serialization changed');
  assert.equal(JSON.stringify(scratch.entities.find(rule=>rule.id===source.id)),JSON.stringify(source),'Stratagem validation-view serialization changed');
  assert.deepEqual(compileRuleRecipients(input,source,{f1Declaration:declaration}),source,'Rule compiler changed an excluded Stratagem');
 }
 const validated=validateBookRecipients(book);
 const policies=book.entities.flatMap(rule=>(rule.ruleContract?.clauses||[]).filter(clause=>clause.conditionalPolicy).map(clause=>({rule,clause})));
 if(bookId==='blood-angels'){
  const summary=JSON.parse(fs.readFileSync(new URL('../../blood-angels/v2/generated/rule-contracts.json',import.meta.url),'utf8')).conditionalPolicies;
  assert.equal(summary.length,13);
  for(const row of summary){
   assert.ok(!Object.hasOwn(row,'recipientScope'),'Legacy recipient scope survived in the policy summary');
   const rule=book.entities.find(entity=>entity.id===row.ruleId),clause=rule.ruleContract.clauses.find(item=>item.id===row.clauseId);
   assert.equal(row.recipientId,clause.conditionalPolicy.recipientId);
   assert.ok(resolveRecipient(rule,clause,row.recipientId));
  }
 }
 if(bookId==='blood-angels')for(const {rule,clause}of policies.filter(({rule})=>rule.data.title==='Black Rage')){
  const recipient=resolveRecipient(rule,clause,clause.conditionalPolicy.recipientId);
  assert.equal(recipient.who,'UNIT');assert.equal(recipient.from,'SOURCE_UNIT');assert.equal(recipient.scope,'FORMED');
 }
 if(bookId==='chaos-space-marines'){
  const lifetimes=book.entities.filter(rule=>rule.kind!=='STRATAGEM'&&rule.ruleContract?.kind!=='STRATAGEM').flatMap(rule=>(rule.ruleContract?.clauses||[]).filter(clause=>clause.lifetime?.recipientIds).map(clause=>({rule,clause})));
  assert.equal(lifetimes.length,17,'Recorded CSM clause lifetime recipient sets disappeared');
  for(const {rule,clause}of lifetimes){
   assert.ok(!Object.hasOwn(clause.lifetime,'recipientRoleIds'));
   const inverse=scratch.entities.find(entity=>entity.id===rule.id).ruleContract.clauses.find(item=>item.id===clause.id).lifetime;
   assert.deepEqual(inverse.recipientRoleIds,clause.lifetime.recipientIds.map(id=>resolveRecipient(rule,clause,id).roleId));
   assert.deepEqual(inverse.sourceBoundaries,clause.lifetime.sourceBoundaries);
   assert.deepEqual(inverse.evidence,clause.lifetime.evidence);
  }
  const recipients=book.entities.filter(rule=>rule.kind!=='STRATAGEM'&&rule.ruleContract?.kind!=='STRATAGEM').flatMap(rule=>(rule.ruleContract?.clauses||[]).flatMap(clause=>clause.recipients));
  assert.equal(recipients.filter(recipient=>recipient.who==='PLAYER').length,6);
  assert.equal(recipients.filter(recipient=>recipient.who==='ROSTER').length,1);
  const primaries=book.entities.flatMap(rule=>(rule.ruleContract?.clauses||[]).filter(clause=>clause.effect?.primaryRecipientId).map(clause=>({rule,clause})));
  assert.equal(primaries.length,3,'Recorded CSM primary/full recipient addresses disappeared');
  for(const {rule,clause}of primaries){
   assert.ok(clause.effect.recipientIds.includes(clause.effect.primaryRecipientId));
   const source=input.entities.find(entity=>entity.id===rule.id).ruleContract.clauses.find(item=>item.id===clause.id);
   const inverse=scratch.entities.find(entity=>entity.id===rule.id).ruleContract.clauses.find(item=>item.id===clause.id);
   if(source.effect.recipientRoleId){assert.equal(inverse.effect.recipientRoleId,source.effect.recipientRoleId);assert.deepEqual(inverse.effect.recipientRoleIds,source.effect.recipientRoleIds);}
   const changed=clone(book),changedRule=changed.entities.find(entity=>entity.id===rule.id),changedClause=changedRule.ruleContract.clauses.find(item=>item.id===clause.id);
   changedClause.effect.primaryRecipientId='outside-full-set';
   assert.throws(()=>validateBookRecipients(changed),TypeError,'Primary recipient outside full set accepted');
   primaryMutationsRejected++;
  }
  const references=book.entities.flatMap(rule=>(rule.ruleContract?.clauses||[]).filter(clause=>clause.rosterReferenceBinding).map(clause=>({rule,clause})));
  assert.equal(references.length,1,'Declared CSM reference receiver channel disappeared');
  for(const {rule,clause}of references){
   const binding=clause.rosterReferenceBinding,standalone=resolveRecipient(rule,clause,binding.standaloneRecipientId),attached=resolveRecipient(rule,clause,binding.attachedRecipientId);
   assert.equal(binding.sourceBinding,'SOURCE_MODEL');assert.equal(standalone.who,'UNIT');assert.equal(attached.who,'UNIT');
   assert.equal(standalone.scope,'PHYSICAL');assert.equal(attached.scope,'FORMED');assert.equal(attached.binding,'SOURCE_FORMED_MODELS');
   const source=input.entities.find(entity=>entity.id===rule.id).ruleContract.clauses.find(item=>item.id===clause.id).rosterReferenceBinding;
   const inverse=scratch.entities.find(entity=>entity.id===rule.id).ruleContract.clauses.find(item=>item.id===clause.id).rosterReferenceBinding;
   assert.deepEqual(binding.canonicalRuleReferences,source.canonicalRuleReferences);
   if(source.subject)assert.deepEqual(inverse,source,'Reference declaration inverse changed its recorded source binding');
   const changed=clone(book),changedRule=changed.entities.find(entity=>entity.id===rule.id),changedClause=changedRule.ruleContract.clauses.find(item=>item.id===clause.id);
   changedClause.rosterReferenceBinding.attachedRecipientId=binding.standaloneRecipientId;
   assert.throws(()=>validateBookRecipients(changed),TypeError,'Attached reference receiver accepted a standalone branch');referenceMutationsRejected++;
  }
 }
 for(const rule of book.entities.filter(rule=>rule.kind!=='STRATAGEM'&&rule.ruleContract?.kind!=='STRATAGEM'))for(const clause of rule.ruleContract?.clauses||[]){
  const original=input.entities.find(entity=>entity.id===rule.id).ruleContract.clauses.find(item=>item.id===clause.id);
  if(!original.rosterEffects?.length&&!original.conditionalPolicy&&!original.effectRecipientRoleIds?.length&&!original.recipientIds?.length&&!original.f1RecipientIds?.length&&!original.effect?.recipientRoleId&&!original.effect?.recipientRoleIds&&!original.effect?.recipientId&&!original.effect?.recipientIds&&
   !original.semanticEffects?.length&&original.roles?.every(role=>['OWNER','ANCHOR','TRIGGER_ACTOR'].includes(role.purpose)))
   assert.equal(clause.recipients.length,0,'Source ownership leaked into a recipient declaration');
 }
 results.push({bookId,recipients:validated.recipients,policies:policies.length,excludedStratagems: stratagems.length,status:'PASS'});
}

const atom={predicate:'UNIT_KEYWORD',subject:'UNIT',arguments:{keyword:'TEST'},contextLevel:'STATIC',evidence:{field:['text'],quote:'source'}};
const role={id:'recipient',purpose:'RECIPIENT',subject:'UNIT',allegiance:'FRIENDLY',selector:atom,conditions:[]};
const fixture={bookId:'test',entities:[{id:'rule',kind:'DATASHEET_ABILITY',parentId:'unit',data:{text:'source'},provenance:{sourceId:'accepted'},ruleContract:{roles:[],clauses:[{id:'one',roles:[role],conditions:[],sourceFields:[['text']],operation:'TEST',effectRecipientRoleIds:['recipient'],rosterClassification:'BATTLE_ONLY',rosterEffects:[]},{id:'two',roles:[clone(role)],conditions:[],sourceFields:[['text']],operation:'TEST',effectRecipientRoleIds:['recipient'],rosterClassification:'BATTLE_ONLY',rosterEffects:[]}],duration:[{id:'duration',endpoint:'END_CURRENT_TURN',roleIds:['recipient'],bindings:[{clauseId:'one',roleIds:['recipient']},{clauseId:'two',roleIds:['recipient']}]}]}}]};
for(const clause of fixture.entities[0].ruleContract.clauses)clause.lifetime={sourceBoundaries:['end of turn'],recipientRoleIds:['recipient']};
const compiled=compileBookRecipients(fixture),rule=compiled.entities[0],clauses=rule.ruleContract.clauses;
assert.deepEqual(clauses.map(clause=>clause.lifetime.recipientIds),clauses.map(clause=>clause.recipientIds));
assert.deepEqual(recipientDeclarationView(compiled),fixture,'Clause lifetime recipient set changed during translation');
assert.notEqual(clauses[0].recipientIds[0],clauses[1].recipientIds[0],'Duration recipient IDs are not rule-unique');
assert.deepEqual(rule.ruleContract.duration[0].recipientIds,clauses.flatMap(clause=>clause.recipientIds));
const rejected=[];
for(const [name,mutate]of [
 ['missing-recipient',book=>{book.entities[0].ruleContract.clauses[0].recipients=[];}],
 ['foreign-recipient',book=>{book.entities[0].ruleContract.clauses[0].recipientIds=['foreign'];}],
 ['duplicate-rule-recipient',book=>{const rows=book.entities[0].ruleContract.clauses;rows[1].recipients[0].id=rows[0].recipients[0].id;}],
 ['duration-foreign-clause-recipient',book=>{const contract=book.entities[0].ruleContract;contract.duration[0].bindings[0].recipientIds=[contract.clauses[1].recipientIds[0]];}],
 ['clause-lifetime-foreign-recipient',book=>{const rows=book.entities[0].ruleContract.clauses;rows[0].lifetime.recipientIds=[rows[1].recipientIds[0]];}],
 ['clause-lifetime-legacy-address',book=>{book.entities[0].ruleContract.clauses[0].lifetime.recipientRoleIds=['recipient'];}],
 ['legacy-address',book=>{book.entities[0].ruleContract.clauses[0].effectRecipientRoleIds=['recipient'];}],
 ['recipient-proof-drift',book=>{book.entities[0].ruleContract.clauses[0].recipients[0].selector.arguments.keyword='OTHER';}],
 ['recipient-purpose-drift',book=>{book.entities[0].ruleContract.clauses[0].recipients[0].purpose='OWNER';}],
 ['invented-source-role',book=>{book.entities[0].ruleContract.clauses[0].recipients[0].sourceRoleId='owner';}],
 ['invented-anchor-role',book=>{book.entities[0].ruleContract.clauses[0].recipients[0].anchorRoleId='owner';}],
 ['unproved-roster-subject',book=>{book.entities[0].ruleContract.clauses[0].recipients[0].who='ROSTER';}]
]){const changed=clone(compiled);mutate(changed);assert.throws(()=>validateBookRecipients(changed),TypeError,name);rejected.push(name);}
const ownerOnly=clone(fixture.entities[0]);ownerOnly.ruleContract.duration=[];ownerOnly.ruleContract.clauses=ownerOnly.ruleContract.clauses.slice(0,1);
const sourceClause=ownerOnly.ruleContract.clauses[0];delete sourceClause.effectRecipientRoleIds;delete sourceClause.lifetime;sourceClause.roles[0].purpose='TARGET';
assert.equal(compileRuleRecipients(fixture,ownerOnly).ruleContract.clauses[0].recipients.length,0,'TARGET alone became recipient proof');
assert.throws(()=>resolveRecipient(rule,clone(clauses[0]),clauses[0].recipientIds[0]),TypeError,'Foreign clause snapshot accepted');
assert.equal(validateRuleRecipients(compiled,rule).status,'PASS');
for(const [kind,contractKind]of [['STRATAGEM','OTHER_RULE'],['OTHER_RULE','STRATAGEM']]){
 const source=clone(fixture.entities[0]);source.kind=kind;source.ruleContract.kind=contractKind;
 const book={bookId:'test',entities:[source]};
 assert.deepEqual(compileBookRecipients(book),book,'Stratagem exclusion requires only one explicit kind marker');
 assert.deepEqual(recipientDeclarationView(book),book,'Validation view ignored an excluded Stratagem marker');
}
console.log(JSON.stringify({status:'PASS',books:results,mutationsRejected:rejected.length+primaryMutationsRejected+referenceMutationsRejected,rejected,primaryMutationsRejected,referenceMutationsRejected,durationClauseLocal:true,ownerAndTargetIsolation:true}));
