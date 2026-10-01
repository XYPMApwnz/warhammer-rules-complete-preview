import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {buildRuleContractV2,entityContext} from './rule-contract-build.mjs';
import {evaluatePredicate,evaluateRole,publicResult,validateContracts} from './rule-contract-schema.mjs';
import {normalizeTargetConditions} from './stratagem-target-conditions.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url));
let sourceCensus;
export function targetSourceCensus() {
  if (!sourceCensus) {
    const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
    const python=process.env.PYTHON||(fs.existsSync(bundled)?bundled:'python3');
    // Re-derive expectations from accepted DOM/PDF, never from production
    // declarations or a generated condition inventory. The JSON is QA only.
    sourceCensus=JSON.parse(execFileSync(python,['-X','utf8',path.join(directory,'stratagem-target-source-qa.py')],{encoding:'utf8'}));
    assert.deepEqual(sourceCensus,JSON.parse(fs.readFileSync(path.join(directory,'stratagem-target-source-evidence.json'),'utf8')),'Disposable source census is current');
  }
  return sourceCensus;
}
const signature=node=>JSON.stringify([node.predicate,node.subject,node.contextLevel,node.arguments]);
export function assertSourceTargetConditions(model) {
  const census=targetSourceCensus();
  const entities=model.entities.filter(entity=>entity.kind==='STRATAGEM');
  assert.deepEqual(new Set(entities.map(entity=>entity.id)),new Set(census.stratagems.map(row=>row.ruleId)),'Independent raw Stratagem TARGET denominator');
  for (const row of census.stratagems) {
    const entity=entities.find(entity=>entity.id===row.ruleId),contract=entity.ruleContract;
    assert.equal(contract.roles.find(role=>role.id==='primary').subject,row.primarySubject,'Source TARGET subject');
    for (const source of row.sourceClauses) assert.equal(entity.data.lines.find(line=>line.label===source.label).text,source.text,'Exact accepted TARGET/WHEN text');
    const expectedRoles=new Set(['primary',...row.expectedConditions.map(node=>node.roleId)]);
    assert.deepEqual(new Set(contract.roles.filter(role=>['PRIMARY_TARGET','SECONDARY_TARGET'].includes(role.purpose)).map(role=>role.id)),expectedRoles,'Target roles cannot become effect recipients');
    for (const id of expectedRoles) {
      const role=contract.roles.find(role=>role.id===id);
      const expected=row.expectedConditions.filter(node=>node.roleId===id);
      assert.deepEqual((role.conditions||[]).map(signature).sort(),expected.map(signature).sort(),`${row.ruleId}/${id}: source TARGET prerequisite missing, flattened, wrong context or role`);
      for (const node of role.conditions||[]) {
        const source=expected.find(atom=>signature(atom)===signature(node));
        const index=entity.data.lines.findIndex(line=>line.label===source.sourceLabel);
        assert.deepEqual(node.evidence.field,['lines',index,'text'],'Condition proof belongs to the accepted target/antecedent clause');
        assert.equal(node.evidence.otherEntityId,undefined,'No borrowed proof owner');
        assert.equal(node.evidence.quote,entity.data.lines[index].text,'Complete source clause proof');
        assert.ok(node.evidence.quote.includes(source.quote),'Exact source condition proof');
      }
    }
  }
  return {...census.totals,missing:0,wrongContext:0,wrongRole:0,unresolved:0};
}

function run() {
  const model=buildRuleContractV2(),census=targetSourceCensus();
  validateContracts(model);
  const parity=assertSourceTargetConditions(model),mutations=[];
  const roleFor=(m,id,roleId='primary')=>m.entities.find(entity=>entity.id===id).ruleContract.roles.find(role=>role.id===roleId);
  const reject=(label,edit)=>{const poisoned=structuredClone(model);edit(poisoned);assert.throws(()=>assertSourceTargetConditions(poisoned),undefined,label);mutations.push(label);};
  // Every independent source atom must have a guard, including the secondary
  // shield's distance and BOTH visibility relationships.
  for (const row of census.stratagems) for (const expected of row.expectedConditions) {
    reject(`drop ${row.ruleId}/${expected.roleId}/${signature(expected)}`,m=>{
      const role=roleFor(m,row.ruleId,expected.roleId);
      role.conditions=role.conditions.filter(node=>signature(node)!==signature(expected));
    });
  }
  const allRot='detachment-tallyband-summoners:stratagem:3',mireslick='detachment-tallyband-summoners:stratagem:6',engines='detachment-contagion-engines:stratagem:3';
  for (const id of [allRot,mireslick,engines]) {
    const key=id===allRot?'engaged':'withinEngagementRangeOfTriggeringEnemy';
    reject(`wrong context ${id}`,m=>{roleFor(m,id).conditions.find(node=>node.arguments.key===key).contextLevel='ROSTER';});
    reject(`wrong role ${id}`,m=>{const role=roleFor(m,id),index=role.conditions.findIndex(node=>node.arguments.key===key);roleFor(m,id,m.entities.find(e=>e.id===id).ruleContract.roles.find(r=>r.purpose==='EFFECT_RECIPIENT').id).conditions.push(role.conditions.splice(index,1)[0]);});
    reject(`wrong polarity ${id}`,m=>{roleFor(m,id).conditions.find(node=>node.arguments.key===key).arguments.equals=false;});
    reject(`wrong subject ${id}`,m=>{roleFor(m,id).conditions.find(node=>node.arguments.key===key).subject='MODEL';});
  }
  reject('enemy-event identity flattened to any engagement',m=>{roleFor(m,mireslick).conditions[0].arguments.key='engaged';});
  reject('shoot-or-fight flattened to shoot',m=>{const row=census.stratagems.find(row=>row.expectedConditions.some(a=>a.arguments.key==='selectedToShootOrFightThisPhase'));roleFor(m,row.ruleId).conditions.find(a=>a.arguments.key==='selectedToShootOrFightThisPhase').arguments.key='selectedToShootThisPhase';});
  reject('TARGET proof moved to EFFECT',m=>{const entity=m.entities.find(e=>e.id===allRot),index=entity.data.lines.findIndex(line=>line.label==='EFFECT');roleFor(m,allRot).conditions[0].evidence={field:['lines',index,'text'],quote:entity.data.lines[index].text};});
  const behavior={};
  for (const [id,unitId,key,battle] of [
    [allRot,'unit-plaguebearers','engaged',{phase:'SHOOTING',turnOwner:'YOU'}],
    [mireslick,'unit-plaguebearers','withinEngagementRangeOfTriggeringEnemy',{phase:'MOVEMENT',turnOwner:'OPPONENT',enemyFallBackSelection:true,engaged:true}],
    [engines,'unit-helbrute','withinEngagementRangeOfTriggeringEnemy',{phase:'MOVEMENT',turnOwner:'OPPONENT',enemyFallBackSelection:true,isTriggerUnit:true,engaged:true}]
  ]) {
    const contract=model.entities.find(entity=>entity.id===id).ruleContract,role=roleFor(model,id);
    const context=entityContext(model,model.entities.find(entity=>entity.id===unitId),role.subject,contract.detachmentId);
    context.battle={...battle,[key]:false};
    const forbidden=evaluateRole(role,contract.conditions,context);
    assert.equal(forbidden,'FALSE',id+': source-forbidden target');assert.equal(publicResult[forbidden],'NO_MATCH');
    context.battle[key]=true;
    const allowed=evaluateRole(role,contract.conditions,context);
    assert.equal(allowed,'TRUE',id+': source-allowed target');assert.equal(publicResult[allowed],'MATCH');
    delete context.battle[key];assert.equal(evaluateRole(role,contract.conditions,context),'UNKNOWN','Genuinely unavailable engagement relation');
    context.battle[key]='unavailable';assert.equal(evaluateRole(role,contract.conditions,context),'INVALID','Invalid input is not UNKNOWN');
    behavior[id]={forbidden:'FALSE/NO_MATCH',allowed:'TRUE/MATCH',unavailable:'UNKNOWN/CONDITIONAL',invalid:'INVALID'};
  }
  let atomControls=0;
  for (const row of census.stratagems) for (const expected of row.expectedConditions) {
    const node=roleFor(model,row.ruleId,expected.roleId).conditions.find(n=>signature(n)===signature(expected));
    const context={subject:node.subject,roster:{},battle:{},abilities:new Set()};
    if (node.predicate==='FIELD') {
      const bag=context[node.contextLevel==='BATTLE'?'battle':'roster'];
      bag[node.arguments.key]=node.arguments.equals;assert.equal(evaluatePredicate(node,context),'TRUE');
      bag[node.arguments.key]=!node.arguments.equals;assert.equal(evaluatePredicate(node,context),'FALSE');
      delete bag[node.arguments.key];assert.equal(evaluatePredicate(node,context),'UNKNOWN');
    } else if (node.predicate==='MODEL_ABILITY') {
      assert.equal(evaluatePredicate(node,context),'FALSE');context.abilities.add('Deadly Demise');assert.equal(evaluatePredicate(node,context),'TRUE');
    } else if (node.predicate==='LEADING') {
      context.roster.leading=node.arguments.value;assert.equal(evaluatePredicate(node,context),'TRUE');
      context.roster.leading=!node.arguments.value;assert.equal(evaluatePredicate(node,context),'FALSE');
    } else if (node.predicate==='CHARACTER_MODEL_COUNT') {
      context.roster.characterModelCount=2;assert.equal(evaluatePredicate(node,context),'TRUE');
      context.roster.characterModelCount=1;assert.equal(evaluatePredicate(node,context),'FALSE');
    } else assert.fail('Uncovered independent source predicate');
    atomControls++;
  }
  assert.throws(()=>normalizeTargetConditions({target:{field:['lines',1,'text'],quote:'One DEATH GUARD unit from your army that has an unrecognized eligibility state.'},when:{quote:'Your Shooting phase.'},subject:'UNIT'}),/Unresolved accepted TARGET qualifier/);
  console.log(JSON.stringify({status:'PASS',...parity,atomControls,mutations:mutations.length,behavior},null,2));
}
if (process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) run();
