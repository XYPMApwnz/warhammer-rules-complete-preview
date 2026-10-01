import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {buildRuleContractV2} from './rule-contract-build.mjs';
import {evaluatePredicate,evaluateRole,publicResult,validateContracts} from './rule-contract-schema.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url));
let census;
export function staticStratagemSourceCensus() {
  if (!census) {
    const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
    const python=process.env.PYTHON||(fs.existsSync(bundled)?bundled:'python3');
    census=JSON.parse(execFileSync(python,['-X','utf8',path.join(directory,'stratagem-static-source-qa.py')],{encoding:'utf8'}));
  }
  return census;
}
const intrinsic=new Set(['UNIT_KEYWORD','MODEL_KEYWORD','UNIT_ID','MODEL_ID','MODEL_ABILITY']);
const forbiddenFields=new Set(['excludesVehicles','enemyTargetExcludesAircraft','enemyAttackTargetExcludesMonsterAndVehicle']);
const normalize=text=>String(text).replace(/[\u2010\u2011]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/(^|\s)[-•▪]\s+/g,'$1').replace(/\s+([.,:;!?)\]])/g,'$1').replace(/\s*\/\s*/g,'/').replace(/\s+/g,' ').trim();
const semantics=value=>Array.isArray(value)?value.map(semantics):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([key])=>!['evidence','sourceFields'].includes(key)).map(([key,child])=>[key,semantics(child)])):value;
const logic=node=>{
  if (!node.op) return semantics(node);
  let args=node.args.map(logic);
  if (['ALL','ANY'].includes(node.op)) {
    args=args.flatMap(child=>child.op===node.op?child.args:[child]);
    args=[...new Map(args.map(child=>[JSON.stringify(child),child])).values()].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if(args.length===1)return args[0];
  }
  return {op:node.op,subject:node.subject,args};
};
function predicates(value,at=[]) {
  const found=[];
  if (!value||typeof value!=='object') return found;
  if (value.predicate) found.push({node:value,at});
  for (const [key,child] of Object.entries(value)) if (child&&typeof child==='object') found.push(...predicates(child,[...at,key]));
  return found;
}
const get=(value,at)=>at.reduce((node,key)=>node[key],value);
const roleById=(model,ruleId,roleId)=>model.entities.find(e=>e.id===ruleId).ruleContract.roles.find(r=>r.id===roleId);
const staticConditions=role=>(role.conditions||[]).filter(node=>predicates(node).every(({node:atom})=>atom.contextLevel==='STATIC')).map(logic);
const sourceTruth=(node,enabled)=>node.op==='ALL'?node.args.every(child=>sourceTruth(child,enabled)):node.op==='ANY'?node.args.some(child=>sourceTruth(child,enabled)):node.op==='NOT'?!sourceTruth(node.args[0],enabled):node.predicate==='ALWAYS'?true:enabled.has(node.arguments.keyword||node.arguments.ability);

/** Source-first expectations are QA only; no production component reads them. */
export function assertStaticStratagemContexts(model) {
  const source=staticStratagemSourceCensus(),entities=model.entities.filter(e=>e.kind==='STRATAGEM');
  validateContracts(model);
  assert.deepEqual(new Set(entities.map(e=>e.id)),new Set(source.rules.map(r=>r.ruleId)),'Complete independent Stratagem source denominator');
  const expectedRoles=new Map();
  for (const row of source.rules) {
    const entity=entities.find(e=>e.id===row.ruleId);
    assert.equal(entity.parentId,row.detachmentId,'Source Detachment identity');
    assert.deepEqual(Object.fromEntries(entity.data.lines.map(line=>[line.label,normalize(line.text)])),Object.fromEntries(Object.entries(row.fields).map(([key,text])=>[key,normalize(text)])),'Complete accepted source clauses preserved');
  }
  for (const row of source.records) for (const roleId of row.compareRoleIds) {
    const entity=entities.find(e=>e.id===row.ruleId),contract=entity.ruleContract,role=roleById(model,row.ruleId,roleId);
    assert.ok(role,`${row.ruleId}/${roleId}: unresolved source participant`);
    assert.equal(role.subject,row.subject,'Source MODEL/UNIT context');
    assert.deepEqual(logic(role.selector),logic(row.selector),`${row.ruleId}/${roleId}: intrinsic selector lost, widened or flattened into contextual state`);
    assert.deepEqual(staticConditions(role).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),(row.staticConditions||[]).map(logic).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),'Source static ability/identity prerequisite');
    if (row.requiredBinding) {
      const binding=row.requiredBinding,actor=roleById(model,row.ruleId,binding.actorRoleId);
      assert.equal(role.binding,binding.binding,'Source enemy is THIS attack target');
      assert.equal(role.actorRoleId,binding.actorRoleId,'Canonical local attacking participant');
      assert.equal(actor?.subject,binding.actorSubject,'Attacking MODEL identity');
      assert.equal(role.allegiance,binding.recipientAllegiance,'Enemy target allegiance');
      const effects=contract.clauses.filter(clause=>clause.operation&&clause.roles.some(r=>r.id===actor.id));
      assert.ok(effects.length,'Source attack actor owns an actual effect operation');
      assert.ok(effects.every(clause=>clause.roles.some(r=>r.id===roleId)),'The actual effect clause binds its actor and the same attack target; metadata co-location is insufficient');
    }
    expectedRoles.set(JSON.stringify([row.ruleId,roleId]),role);
  }
  let staticPredicatesTotal=0,aliasesChecked=0;
  for (const entity of entities) {
    const contract=entity.ruleContract;
    for (const {node} of predicates(contract)) if(node.predicate==='FIELD') assert.ok(!forbiddenFields.has(node.arguments.key),'Intrinsic exclusion cannot be a ROSTER/BATTLE flag');
    for (const role of contract.roles) {
      const nodes=predicates({selector:role.selector,conditions:role.conditions}).filter(({node})=>intrinsic.has(node.predicate));
      if(nodes.length)assert.ok(expectedRoles.has(JSON.stringify([entity.id,role.id])),'Unsourced intrinsic role selector');
      for(const {node}of nodes)assert.equal(node.contextLevel,'STATIC','Intrinsic fact context');
      staticPredicatesTotal+=nodes.length;
    }
    for (const clause of contract.clauses) for (const alias of clause.roles) if(expectedRoles.has(JSON.stringify([entity.id,alias.id]))) {
      assert.deepEqual(semantics(alias),semantics(roleById(model,entity.id,alias.id)),'Local clause participant cannot compete with its canonical role');
      aliasesChecked++;
    }
  }
  return {...source.totals,canonicalRolesChecked:expectedRoles.size,staticPredicatesTotal,clauseAliasesChecked:aliasesChecked,wrongContext:0,staticAsBattle:0,staticAsRoster:0,unresolved:0};
}

function run() {
  const model=buildRuleContractV2(),source=staticStratagemSourceCensus(),parity=assertStaticStratagemContexts(model),mutations=[];
  let sourceTruthCases=0,staticIncompatibilityControls=0;
  const checkedRoles=new Set();
  for (const row of source.records)for(const roleId of row.compareRoleIds) {
    const key=JSON.stringify([row.ruleId,roleId]);if(checkedRoles.has(key))continue;checkedRoles.add(key);
    const role=roleById(model,row.ruleId,roleId),expected=[row.selector,...(row.staticConditions||[])];
    const variables=[...new Set(predicates(expected).map(({node})=>node.arguments.keyword||node.arguments.ability))];
    for(let bits=0;bits<2**variables.length;bits++) {
      const enabled=new Set(variables.filter((_,i)=>bits&(2**i))),truth=expected.every(node=>sourceTruth(node,enabled));
      const context={subject:role.subject,keywords:enabled,unknownKeywords:new Set(),abilities:enabled,roster:{}};
      const actual=[evaluatePredicate(role.selector,context),...staticConditions(role).map(node=>evaluatePredicate(node,context))];
      assert.ok(actual.every(state=>state==='TRUE'||state==='FALSE'),'Known intrinsic facts never need roster/battle context');
      assert.equal(actual.every(state=>state==='TRUE'),truth,'Independent source Boolean selector truth table');
      if(!truth) {
        const contract=model.entities.find(e=>e.id===row.ruleId).ruleContract;
        assert.equal(evaluateRole(role,contract.conditions,context),'FALSE','Known intrinsic incompatibility beats unavailable roster/battle state');
        staticIncompatibilityControls++;
      }
      sourceTruthCases++;
    }
  }
  const reject=(label,edit,guard=assertStaticStratagemContexts)=>{const changed=structuredClone(model);edit(changed);assert.throws(()=>guard(changed),undefined,label);mutations.push(label);};
  let intrinsicMutationAtoms=0,contextualMutationAtoms=0;
  for (const entity of model.entities.filter(e=>e.kind==='STRATAGEM')) {
    for (const role of entity.ruleContract.roles) for (const {node,at} of predicates(role).filter(({node})=>intrinsic.has(node.predicate))) {
      intrinsicMutationAtoms++;
      for(const level of ['BATTLE','ROSTER']) {
        reject(`intrinsic context ${entity.id}/${role.id}/${at}/${level}`,m=>{get(roleById(m,entity.id,role.id),at).contextLevel=level;});
        // A contextual FIELD passes structural schema, but must fail the
        // independent source guard even if its proof is still a real quote.
        reject(`flatten static ${entity.id}/${role.id}/${at}/${level}`,m=>{
          const n=get(roleById(m,entity.id,role.id),at),subject=n.subject,evidence=n.evidence;
          for(const key of Object.keys(n))delete n[key];
          Object.assign(n,{predicate:'FIELD',subject,contextLevel:level,arguments:{key:level==='BATTLE'?'engaged':'attached',equals:true},evidence});
          validateContracts(m);
        });
        assert.equal(evaluatePredicate({...node,contextLevel:level},{subject:node.subject,keywords:new Set([node.arguments.keyword]),abilities:new Set(['Deadly Demise']),roster:{},battle:{}}),'INVALID','Runtime must enforce the schema context too');
      }
      reject(`drop intrinsic ${entity.id}/${role.id}/${at}`,m=>{
        const n=get(roleById(m,entity.id,role.id),at),subject=n.subject,evidence=n.evidence;
        for(const key of Object.keys(n))delete n[key];Object.assign(n,{predicate:'ALWAYS',subject,contextLevel:'STATIC',arguments:{},evidence});
      });
    }
    for (const {node,at} of predicates({roles:entity.ruleContract.roles,conditions:entity.ruleContract.conditions}).filter(({node})=>node.predicate==='FIELD')) {
      contextualMutationAtoms++;
      reject(`contextual as STATIC ${entity.id}/${at}`,m=>{
        const c=m.entities.find(e=>e.id===entity.id).ruleContract;get(c,at).contextLevel='STATIC';
      },validateContracts);
      assert.equal(evaluatePredicate({...node,contextLevel:'STATIC'},{subject:node.subject,roster:{},battle:{}}),'INVALID');
    }
    for (const [i,clause]of entity.ruleContract.clauses.entries())for(const [j,alias]of clause.roles.entries())if(predicates(alias).some(({node})=>intrinsic.has(node.predicate))) {
      reject(`competing clause selector ${entity.id}/${i}/${j}`,m=>{
        const c=m.entities.find(e=>e.id===entity.id).ruleContract;
        const changed=structuredClone(c.clauses[i].roles[j]);
        changed.selector={predicate:'ALWAYS',subject:changed.subject,contextLevel:'STATIC',arguments:{},evidence:predicates(changed.selector)[0].node.evidence};
        c.clauses[i].roles[j]=changed;
      });
    }
  }
  for(const row of source.records.filter(r=>r.requiredBinding)) {
    const id=row.compareRoleIds[0];
    reject(`sever attack binding ${row.ruleId}`,m=>{roleById(m,row.ruleId,id).binding='INDEPENDENT_ENTITY';});
    reject(`wrong attack actor ${row.ruleId}`,m=>{roleById(m,row.ruleId,id).actorRoleId='primary';},validateContracts);
    reject(`remove clause target ${row.ruleId}`,m=>{
      const c=m.entities.find(e=>e.id===row.ruleId).ruleContract;
      for(const clause of c.clauses)if(clause.roles.some(r=>r.id===row.requiredBinding.actorRoleId))clause.roles=clause.roles.filter(r=>r.id!==id);
    });
    reject(`relocate target binding to metadata ${row.ruleId}`,m=>{
      const c=m.entities.find(e=>e.id===row.ruleId).ruleContract;
      for(const clause of c.clauses)if(clause.operation)clause.roles=clause.roles.filter(r=>r.id!==id);
      const metadata=c.clauses.find(clause=>!clause.operation&&clause.roles.some(r=>r.id===id));
      metadata.roles.push(roleById(m,row.ruleId,row.requiredBinding.actorRoleId));
    });
  }
  const deaths='detachment-champions-of-contagion:stratagem:6',role=roleById(model,deaths,'selected-enemy');
  const behavior={};
  for (const keywords of [new Set(['VEHICLE']),new Set(['VEHICLE','INFANTRY'])])for(const flag of [undefined,false,true,'malformed']) {
    const context={subject:'UNIT',keywords,roster:{},battle:{within8OfPrimary:true,visibleToPrimary:true,...(flag===undefined?{}:{excludesVehicles:flag})}};
    const state=evaluateRole(role,[],context);assert.equal(state,'FALSE');assert.equal(publicResult[state],'NO_MATCH');
  }
  assert.equal(evaluateRole(role,[],{subject:'UNIT',keywords:new Set(['VEHICLE']),roster:{}}),'FALSE','Known incompatibility survives entirely unavailable battle context');
  const eligible={subject:'UNIT',keywords:new Set(['INFANTRY']),roster:{},battle:{}};
  assert.equal(evaluateRole(role,[],eligible),'UNKNOWN');eligible.battle={within8OfPrimary:true,visibleToPrimary:true};assert.equal(evaluateRole(role,[],eligible),'TRUE');
  behavior.deathsHeads={vehicle:'FALSE/NO_MATCH',legacyFlagIgnored:true,eligibleUnknown:'UNKNOWN/CONDITIONAL',eligibleAllowed:'TRUE/MATCH'};
  for(const row of source.records.filter(r=>r.requiredBinding)) {
    const recipient=roleById(model,row.ruleId,row.compareRoleIds[0]);
    for(const keyword of predicates(row.selector).map(({node})=>node.arguments.keyword)) {
      assert.equal(evaluateRole(recipient,[],{subject:'UNIT',keywords:new Set([keyword]),roster:{}}),'FALSE','Bound enemy intrinsic exclusion survives missing battle context');
    }
  }
  console.log(JSON.stringify({status:'PASS',...parity,sourceTruthCases,staticIncompatibilityControls,intrinsicMutationAtoms,contextualMutationAtoms,mutations:mutations.length,behavior},null,2));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))run();
