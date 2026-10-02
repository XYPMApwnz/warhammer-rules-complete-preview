import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {buildRuleContractV2} from './rule-contract-build.mjs';
import {validateContracts} from './rule-contract-schema.mjs';
import {normalizeStratagemDurations} from './stratagem-durations.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url));
let census;
function sourceCensus() {
  if(!census) {
    const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
    const python=process.env.PYTHON||(fs.existsSync(bundled)?bundled:'python3');
    census=JSON.parse(execFileSync(python,['-X','utf8',path.join(directory,'stratagem-duration-source-qa.py')],{encoding:'utf8'}));
  }
  return census;
}
const effectField=entity=>['lines',entity.data.lines.findIndex(line=>line.label==='EFFECT'),'text'];
const clauseId=(row,index)=>`${row.sourceId}:effect-clause:${index}`;
export function assertSourceDurationBindings(model) {
  const source=sourceCensus(),entities=model.entities.filter(entity=>entity.kind==='STRATAGEM');
  assert.deepEqual(new Set(entities.map(entity=>entity.id)),new Set(source.stratagems.map(row=>row.sourceId)),'Independent accepted-source denominator');
  for(const row of source.stratagems) {
    const entity=entities.find(entity=>entity.id===row.sourceId),contract=entity.ruleContract,field=effectField(entity);
    assert.equal(entity.data.lines[field[1]].text,row.sourceEffect,'Exact current accepted EFFECT');
    const effects=contract.clauses.filter(clause=>clause.operation);
    assert.equal(effects.length,row.operations.length,'Source effect identities remain intact');
    for(const operation of row.operations) {
      const clause=effects.find(clause=>clause.id===clauseId(row,operation.clauseIndex));
      assert.equal(clause?.operation,operation.operation,'Source effect operation');
      assert.equal(clause.effectScope,operation.effectScope,'Source effect subject');
      const recipientIds=operation.operation.endsWith('_ANCHOR')?[]:[operation.roleId];
      assert.deepEqual(clause.effectRecipientRoleIds,recipientIds,'Actual source effect recipients, independent of normalized subject');
    }
    if(!row.expectedDurations.length) {
      assert.deepEqual(contract.duration,[{id:`${row.sourceId}:duration:source-unspecified`,endpoint:'NOT_EXPLICIT',inferredExpiry:false,sourceFields:[field]}],'Never invent source expiry');
      continue;
    }
    assert.equal(contract.duration.length,row.expectedDurations.length,'Every source boundary appears exactly once');
    let after=0;
    for(const [index,expected] of row.expectedDurations.entries()) {
      const actual=contract.duration[index],start=row.sourceEffect.indexOf(expected.sourcePhrase,after);
      assert.ok(start>=0,'Exact independent source occurrence');after=start+expected.sourcePhrase.length;
      assert.equal(actual.id,`${row.sourceId}:duration:${index+1}`);
      assert.equal(actual.endpoint,expected.endpoint,'Source boundary semantics');
      assert.deepEqual(actual.evidence,{field,quote:expected.sourcePhrase},'Duration source proof');
      assert.deepEqual(actual.sourceOccurrence,{start,end:after},'Repeated equal lifetime phrases remain distinct');
      assert.deepEqual(actual.sourceFields,[field]);
      const wanted=expected.bindings.map(binding=>({clauseId:clauseId(row,binding.clauseIndex),roleIds:[binding.roleId]}));
      assert.deepEqual(actual.bindings.map(({clauseId,roleIds})=>({clauseId,roleIds})),wanted,`${row.sourceId}: missing, wrong-role or overbroad duration binding`);
      assert.deepEqual(actual.roleIds,expected.bindings.map(binding=>binding.roleId),'Recipient projection has no anchor/trigger/selector leakage');
      for(const binding of actual.bindings) {
        if(binding.scopeEvidence) assert.deepEqual(binding.scopeEvidence,{field,quote:expected.sourceScopeQuote},'Exact source-specific lifetime scope');
        // Compound operations may have an instantaneous portion. Only the
        // source's enduring subclause receives this boundary, never its test.
        if(expected.sourcePhrase==='in the same phase'||row.expectedDurations.length>1||row.operations.some(op=>op.operation==='DEADLY_DEMISE_AUTO_ACTIVATION')) {
          assert.deepEqual(binding.scopeEvidence,{field,quote:expected.sourceScopeQuote},'Clause-specific lifetime cannot be flattened');
        }
      }
    }
  }
  return {...source.totals,missingDurationBindings:0,wrongDurationRole:0,overbroadDurationBindings:0,unresolved:0};
}

function run() {
  const model=buildRuleContractV2(),source=sourceCensus(),summary=assertSourceDurationBindings(model);
  validateContracts(model);
  const mutations=[];
  const rule=(m,id)=>m.entities.find(entity=>entity.id===id).ruleContract;
  const reject=(label,edit)=>{const changed=structuredClone(model);edit(changed);assert.throws(()=>assertSourceDurationBindings(changed),undefined,label);mutations.push(label);};
  for(const row of source.stratagems) for(const [index,expected] of row.expectedDurations.entries()) {
    reject(`drop boundary ${row.sourceId}/${index}`,m=>rule(m,row.sourceId).duration.splice(index,1));
    reject(`wrong endpoint ${row.sourceId}/${index}`,m=>rule(m,row.sourceId).duration[index].endpoint='NOT_EXPLICIT');
    reject(`invent primary recipient ${row.sourceId}/${index}`,m=>{
      const d=rule(m,row.sourceId).duration[index];d.roleIds.push('primary');d.bindings[0].roleIds.push('primary');
    });
    for(const binding of expected.bindings) reject(`drop recipient ${row.sourceId}/${index}/${binding.roleId}`,m=>{
      const d=rule(m,row.sourceId).duration[index];d.bindings=d.bindings.filter(b=>!b.roleIds.includes(binding.roleId));d.roleIds=d.roleIds.filter(id=>id!==binding.roleId);
    });
    for(const [bindingIndex] of expected.bindings.entries()) if(rule(model,row.sourceId).duration[index].bindings[bindingIndex].scopeEvidence) {
      reject(`flatten scope ${row.sourceId}/${index}/${bindingIndex}`,m=>{
        const c=rule(m,row.sourceId),b=c.duration[index].bindings[bindingIndex];delete b.scopeEvidence;delete c.clauses.find(clause=>clause.id===b.clauseId).lifetimeEvidence;
      });
    }
  }
  for(const row of source.stratagems.filter(row=>!row.expectedDurations.length)) {
    reject(`invent expiry ${row.sourceId}`,m=>rule(m,row.sourceId).duration[0].endpoint='END_CURRENT_PHASE');
  }
  const shambling='detachment-shamblerot-vectorium:stratagem:6',wall=rule(model,shambling);
  const attack=wall.clauses.find(clause=>clause.operation==='REDIRECT_DAMAGE_TO_POXWALKERS_NO_SAVE');
  assert.equal(attack.roles[0].id,'primary-model-attack');assert.equal(attack.roles[0].subject,'ROSTER');assert.equal(attack.effectScope,'ATTACK');
  const expiryBound=wall.duration.some(d=>d.endpoint==='END_CURRENT_PHASE'&&d.bindings.some(b=>b.clauseId===attack.id&&b.roleIds.includes('primary-model-attack')));
  assert.equal(expiryBound,true);
  reject('Shambling Wall attacker is not an effect recipient',m=>rule(m,shambling).duration[0].roleIds.push('attacking-enemy'));
  const rot='detachment-tallyband-summoners:stratagem:3';
  reject('same endpoint cannot crossbind separate source clauses',m=>{
    const c=rule(m,rot);c.duration[0].bindings.push(c.duration[1].bindings[0]);c.duration[0].roleIds.push(...c.duration[1].roleIds);
  });
  // Generic build-time shape controls: no title or canonical rule ID branching.
  const field=['lines',0,'text'],quote='Until the end of the phase, redirect an attack.';
  const clauses=[{id:'independent:clause',effectRecipientRoleIds:['attack'],roles:[{id:'attack',subject:'ROSTER'}]}];
  assert.deepEqual(normalizeStratagemDurations('independent',{field,quote},clauses)[0].roleIds,['attack']);
  assert.throws(()=>normalizeStratagemDurations('independent',{field,quote:quote+' '+quote},clauses),'Multiple source boundaries require explicit clause scope');
  const negatives=[];
  const schemaReject=(label,edit)=>{const changed=structuredClone(model);edit(changed);assert.throws(()=>validateContracts(changed),undefined,label);negatives.push(label);};
  schemaReject('missing effect recipient',m=>rule(m,shambling).duration[0].bindings[0].roleIds=[]);
  schemaReject('unknown clause',m=>rule(m,shambling).duration[0].bindings[0].clauseId='unresolved');
  schemaReject('unknown role',m=>rule(m,shambling).duration[0].roleIds.push('unresolved'));
  schemaReject('non-effect trigger bound',m=>rule(m,shambling).duration[0].bindings.push({clauseId:`${shambling}:attacker`,roleIds:['attacking-enemy']}));
  schemaReject('wrong clause boundary',m=>{const c=rule(m,rot);c.duration[0].bindings=[c.duration[1].bindings[0]];c.duration[0].roleIds=[...c.duration[1].roleIds];});
  schemaReject('source occurrence severed',m=>rule(m,shambling).duration[0].sourceOccurrence.start++);
  console.log(JSON.stringify({status:'PASS',...summary,shamblingWall:{operation:attack.operation,roleId:attack.roles[0].id,endpoint:'END_CURRENT_PHASE',expiryBound},mutations:mutations.length,schemaNegativeControls:negatives.length,genericControls:2}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))run();
