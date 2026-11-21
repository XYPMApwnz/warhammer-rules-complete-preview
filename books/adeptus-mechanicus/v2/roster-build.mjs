import {serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
import {finalizeRecipientBook} from '../../shared/rule-contract-v2/finalize-recipients.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildAdMechContracts,readJson} from './rule-contract-build.mjs';
import {compilerInputs} from './rule-contract-context.mjs';
import {abilityReferences} from './ability-reference-registry.mjs';
import {buildRosterAttachmentInputs} from './roster-attachment-build.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

/** Disposable input adapter. Facts, declarations and their provenance remain
 * book-owned; the shared interpreter receives the existing typed operations. */
export function buildRosterRuntimeBook(built=buildAdMechContracts()) {
  built={...built,book:prepareSourceProducer(built.book),...(built.facts?{facts:prepareSourceProducer(built.facts)}:{}),...(built.native?{native:{...built.native,model:prepareSourceProducer(built.native.model),payload:prepareSourceProducer(built.native.payload)}}:{})};
  const canonicalBefore=structuredClone(built.book);
  const {book,policies}=buildRosterAttachmentInputs(built.book,readJson('roster-attachment-bindings.json'));
  const {composition}=compilerInputs(built.book);
  book.rosterAttachmentPolicies=policies;
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
  book.rosterAbilityReferences=abilityReferences();
  book.rosterSchema={stateFields:structuredClone(built.schema.stateFields),modelAbilities:[...built.schema.modelAbilities],contractSchema:'rule-contract/v2'};
  // Stratagem action clauses have no roster declarations. Their existing
  // BATTLE_ACTION execution mode supplies the nonexecuting runtime annotation;
  // no canonical clause or gameplay operation is added or changed.
  for(const entity of book.entities)for(const clause of entity.ruleContract?.clauses||[]) {
    if(clause.rosterClassification===undefined) {
      assert.equal(entity.ruleContract.executionMode,'BATTLE_ACTION');
      assert.equal(entity.ruleContract.kind,'STRATAGEM');
      assert.equal(clause.rosterEffects,undefined);
      clause.rosterClassification='BATTLE_ONLY';clause.rosterEffects=[];
    }
  }
  finalizeRecipientBook(book);
  built.schema.evaluator.validateContracts(book);
  validateRosterEffects(book,built.schema.evaluator.validatePredicate,built.schema.evaluator.evaluatePredicate);
  assert.deepEqual(built.book,canonicalBefore,'Runtime input build mutated canonical records');
  return book;
}
export function writeRosterRuntime({check=false}={}) {
  const book=buildRosterRuntimeBook(),value=serializeSourceJSON(book);
  const location=new URL('./generated/roster-runtime.json',import.meta.url);
  if(check)assert.equal(fs.readFileSync(location,'utf8'),value,'Stale disposable roster runtime input');else fs.writeFileSync(location,value);
  return book;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const book=writeRosterRuntime({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',contracts:book.entities.filter(e=>e.ruleContract).length,rosterClauses:book.entities.flatMap(e=>e.ruleContract?.clauses||[]).filter(c=>c.rosterClassification==='ROSTER_EXECUTABLE').length}));
}
