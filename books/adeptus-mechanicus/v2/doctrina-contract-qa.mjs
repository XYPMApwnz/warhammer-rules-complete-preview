import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildAdMechContracts,compileAdMechContracts,readJson,directory} from './rule-contract-build.mjs';
import {validateContractBinding,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';

// Independent source/reference checks. Neither old contracts nor compatibility
// rows define the source membership set or the battle-only classification.
const canonical=readJson('generated/effective.json'),built=buildAdMechContracts(),compiled=compileAdMechContracts(built);
const root=path.resolve(directory,'../../..'),army='army-rule-doctrina-imperatives',intro=army+':introduction';
const ids=[intro,army+':protector-imperative',army+':conqueror-imperative'];
const index=new Map(canonical.entities.map(e=>[e.id,e]));
const leaves=node=>!node||typeof node!=='object'?[]:node.predicate?[node]:Object.values(node).flatMap(leaves);
const corpus=JSON.parse(fs.readFileSync(path.join(root,index.get(intro).provenance.sourcePath),'utf8'));
const htmlPath=index.get(intro).fieldProvenance.text.sourcePath,htmlBytes=fs.readFileSync(path.join(root,htmlPath));
assert.equal(createHash('sha256').update(htmlBytes).digest('hex').toUpperCase(),index.get(intro).fieldProvenance.text.sha256);
const html=htmlBytes.toString('utf8'),tooltip=html.indexOf('id="tooltip_content00094"');
assert.ok(tooltip>=0&&html.slice(tooltip,tooltip+200).includes('Doctrina Imperatives'));
assert.ok(html.slice(tooltip,tooltip+2200).includes(index.get(intro).data.text),'Raw introduction authority lost');
assert.equal(corpus.armyRules[0].components[0].text,'','Do not substitute empty capture introduction');
for(let i=1;i<3;i++)assert.equal(index.get(ids[i]).data.text,corpus.armyRules[0].components[i].text);

const sourceMembers=[];
for(const unit of canonical.entities.filter(e=>e.kind==='DATASHEET'))for(const referenceId of unit.data.ruleReferenceIds) {
  const reference=index.get(referenceId);
  const raw=reference.provenance.pointer.slice(1).split('/').reduce((v,k)=>v[k],corpus);
  const page=corpus.pages.find(page=>page.url===unit.data.url);
  const sourceHtml=fs.readFileSync(path.join(path.dirname(path.join(root,reference.provenance.sourcePath)),page.file),'utf8');
  const tables=[...sourceHtml.matchAll(/<table\b[^>]*class="[^"]*dsCoreArmy[^"]*"[^>]*>[\s\S]*?<\/table>/g)];
  assert.equal(tables.length,1);
  const armyRow=[...tables[0][0].matchAll(/<tr>[\s\S]*?<\/tr>/g)].find(row=>row[0].includes('>ARMY RULES</td>'))?.[0];
  assert.ok(armyRow?.includes('data-tooltip-content="#tooltip_content00094"'));
  assert.ok(raw.label.includes('ARMY RULESDoctrina Imperatives'));
  for(const group of reference.data.groups)for(const entry of group.entries)
    if(group.label==='ARMY RULES'&&entry.label==='Doctrina Imperatives') {
      assert.deepEqual(entry.sourceTooltipIds,['#tooltip_content00094']);
      assert.equal(reference.parentId,unit.id);sourceMembers.push(unit.id);
    }
}
assert.equal(new Set(sourceMembers).size,34);
assert.equal(sourceMembers.length,34);
assert.equal(built.blockedIds.size,3);
let checks=0,mutations=0;
const check=(actual,expected,message)=>{checks++;assert.deepEqual(actual,expected,message);};
const negative=run=>{mutations++;assert.throws(run);};
for(const [i,id]of ids.entries()) {
  const entity=built.book.entities.find(e=>e.id===id),contract=entity.ruleContract,role=contract.roles[0];
  check(contract.kind,'ARMY_RULE');check(contract.contextLevel,'BATTLE');check(role.subject,'UNIT');
  check(contract.ownerId,army);check(contract.sourceId,index.get(id).provenance.sourceId);
  check(contract.currentness.fieldProvenance,index.get(id).fieldProvenance);
  check(contract.unitMembership.references.map(r=>r.unitId).sort(),sourceMembers.slice().sort());
  check(leaves(role.selector).map(p=>p.arguments.id).sort(),sourceMembers.slice().sort());
  check(leaves(contract).some(p=>p.predicate==='MODEL_ABILITY'),false);
  check(contract.clauses.length,i===0?1:3);
  for(const clause of contract.clauses) {
    check(clause.rosterClassification,'BATTLE_ONLY');check(clause.rosterEffects,[]);
    check(clause.operation,undefined,'No executable Imperative operation');
    check(clause.lifetimeEvidence.quote,'Until the end of the battle round');
    check(clause.lifetimeEvidence.otherEntityId,intro);
    assert.ok(clause.evidence.quote&&index.get(id).data.text.includes(clause.evidence.quote));
  }
  for(const unitId of sourceMembers) {
    const context=compiled.compiler.context(unitId,'UNIT');
    check(context.battle,{});check(context.roster,{});
    check(built.schema.evaluator.evaluateRole(role,contract.conditions,context),'UNKNOWN');
    check(compiled.compiler.evaluateRule(unitId,id).applicability,'CONDITIONAL');
    const both={protectorImperativeActive:true,conquerorImperativeActive:true};
    check(built.schema.evaluator.evaluateRole(role,[],{...context,battle:both}),'TRUE','Both active is representable without an exclusive state machine');
    check(built.schema.evaluator.evaluateRole(role,[],{...context,battle:{protectorImperativeActive:false,conquerorImperativeActive:false}}),'FALSE');
    check(built.schema.evaluator.evaluateRole(role,[],{...context,roster:both}),'UNKNOWN','Roster must not activate Imperatives');
  }
  const candidate=structuredClone(entity);
  candidate.ruleContract.roles[0].conditions=[];
  negative(()=>validateContractBinding({entity,bookId:built.book.bookId,schema:'rule-contract/v2',
    declaration:bindDeclarationClauses(structuredClone(built.declarations.get(id))),currentness:contract.currentness},candidate.ruleContract));
  const widened=structuredClone(entity);
  widened.ruleContract.roles[0].selector={predicate:'ALWAYS',subject:'UNIT',contextLevel:'STATIC',arguments:{}};
  negative(()=>validateContractBinding({entity,bookId:built.book.bookId,schema:'rule-contract/v2',
    declaration:bindDeclarationClauses(structuredClone(built.declarations.get(id))),currentness:contract.currentness},widened.ruleContract));
  const misplaced=structuredClone(built.book);
  const field=leaves(misplaced.entities.find(e=>e.id===id).ruleContract.roles[0].conditions)[0];field.contextLevel='ROSTER';
  negative(()=>built.schema.evaluator.validateContracts(misplaced));
  const wrong=structuredClone(built.book);wrong.entities.find(e=>e.id===id).ruleContract.roles[0].subject='MODEL';
  negative(()=>built.schema.evaluator.validateContracts(wrong));
}
for(const key of ['protectorImperativeActive','conquerorImperativeActive'])
  check(built.schema.stateFields[key],{contextLevel:'BATTLE',valueType:'boolean'});

// No current nonmembers exist: remove actual canonical memberships to exercise
// the negative path, rather than pretending that a current unit lacks Doctrina.
const ranger='unit-skitarii-rangers',referenceId=index.get(ranger).data.ruleReferenceIds[0];
for(const change of [
  book=>{book.entities.find(e=>e.id===ranger).data.ruleReferenceIds=[];},
  book=>{for(const g of book.entities.find(e=>e.id===referenceId).data.groups)
    g.entries=g.entries.filter(e=>!e.sourceTooltipIds.includes('#tooltip_content00094'));}
]) {
  const book=structuredClone(canonical);change(book);
  const next=buildAdMechContracts({book}),compiler=compileAdMechContracts(next).compiler;
  for(const id of ids)check(compiler.evaluateRule(ranger,id).state,'FALSE','Known nonmember must fail before unknown battle state');
  for(const id of ids)check(compiler.evaluateRule('unit-kastelan-robots',id).state,'UNKNOWN','Other members must remain conditional');
}
const renamed=structuredClone(canonical);
for(const g of renamed.entities.find(e=>e.id===referenceId).data.groups)for(const e of g.entries)
  if(e.sourceTooltipIds.includes('#tooltip_content00094'))e.label='Presentation alias';
const renamedCompiler=compileAdMechContracts(buildAdMechContracts({book:renamed})).compiler;
for(const id of ids)check(renamedCompiler.evaluateRule(ranger,id).state,'UNKNOWN','Canonical reference identity must not join by display title');
const foreign=structuredClone(canonical);foreign.entities.find(e=>e.id===referenceId).parentId='unit-kastelan-robots';
negative(()=>buildAdMechContracts({book:foreign}));

// The compound final clauses keep source BATTLELINE OR proximity and attack
// context. An unknown conditional clause cannot execute other battle clauses.
for(const [i,key]of [[1,'meleeAttackTargetsUnit'],[2,'modelInUnitMakingAttack']]) {
  const contract=built.book.entities.find(e=>e.id===ids[i]).ruleContract,clause=contract.clauses[2];
  const base=compiled.compiler.context('unit-tech-priest-dominus','UNIT');
  const active={protectorImperativeActive:true,conquerorImperativeActive:true,[key]:true};
  const evaluate=(keywords,battle)=>built.schema.evaluator.evaluateRole(clause.roles[0],clause.conditions,{...base,keywords:new Set(keywords),unknownKeywords:new Set(),battle});
  check(evaluate([],active),'UNKNOWN');
  check(evaluate([],{...active,withinFriendlyMechanicusBattleline6:false}),'FALSE');
  check(evaluate([],{...active,withinFriendlyMechanicusBattleline6:true}),'TRUE');
  check(evaluate(['BATTLELINE'],active),'TRUE');
  check(evaluate(['BATTLELINE'],{...active,[key]:false}),'FALSE');
}
console.log(JSON.stringify({status:'PASS',owners:3,sourceUnitMemberships:34,battleOnlyClauses:7,checks,mutations,
  blockedBefore:18,resolved:3,blockedAfter:15,newSharedPrimitives:0,rosterEffects:0,activationEngine:false}));
