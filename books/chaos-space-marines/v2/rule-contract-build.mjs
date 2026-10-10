import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {bindCanonicalContract,bindDeclarationClauses,inspectDeclarationEvidence,
  mergeContractDeclarations} from '../../shared/rule-contract-v2/bindings.mjs';
import {summarizeCompatibility,rejectPairwiseAuthority} from '../../shared/rule-contract-v2/compatibility.mjs';
import {semanticInputs,bindModelDenotations,createCSMCompatibilityCompiler} from './rule-contract-context.mjs';

export const directory=path.dirname(fileURLToPath(import.meta.url));
export const declarationFiles=['contract-datasheet-army-declarations.json','contract-enhancement-detachment-declarations.json',
  'contract-stratagem-declarations.json','contract-construction-declarations.json'];
export const readJson=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
export const ruleKinds=new Set(['ARMY_RULE','DATASHEET_ABILITY','EQUIPMENT_ABILITY','SPECIAL_DATASHEET_RULE',
  'NAMED_RULE_COMPONENT','UPGRADE_DECLARATION','UPGRADE_OPTION','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM',
  'WARGEAR_OPTION','UNIT_COMPOSITION','ATTACHMENT_DECLARATION','TRANSPORT_DECLARATION','FAQ','ERRATA',
  'OFFICIAL_UPDATE','STRUCTURED_RULE_TABLE','SOURCE_PRESENTATION_NOTE']);
export const states=['BUILT','BATTLE_ONLY_NO_RUNTIME_NEEDED','BLOCKED_BY_CONFIRMED_GENERIC_CAPABILITY','NOT_EFFECT_OR_PRESENTATION_ONLY'];

/** Census comes from canonical source kinds, not a legacy owner list. */
export function ownerInventory(facts) {
  return facts.entities.map(entity=>({id:entity.id,kind:entity.kind,ownerId:entity.ownerId,
    disposition:ruleKinds.has(entity.kind)?'RULE_OWNER':'FACT_OR_REFERENCE',
    ...(entity.factOwnerId?{factOwnerId:entity.factOwnerId}:{})}));
}

export function createCSMSchema(declarations) {
  const stateFields={},abilities=new Set();
  const visit=value=>{
    if(!value||typeof value!=='object')return;
    if(value.predicate==='FIELD') {
      const {key,equals}=value.arguments;
      const spec={contextLevel:value.contextLevel,valueType:typeof equals,
        ...(key==='isWarlord'?{intrinsicAllKeywords:['CHARACTER']}:{})};
      if(stateFields[key])assert.deepEqual(stateFields[key],spec,'Context registry drift');
      stateFields[key]=spec;
    }
    if(value.predicate==='MODEL_ABILITY')abilities.add(value.arguments.ability);
    for(const child of Object.values(value))Array.isArray(child)?child.forEach(visit):visit(child);
  };
  for(const declaration of declarations.values())visit(declaration);
  const modelAbilities=[...abilities].sort();
  return {stateFields,modelAbilities,evaluator:createRuleContractSchema({stateFields,modelAbilities})};
}

export function buildCSMContracts({facts=readJson('generated/effective.json'),inputs=declarationFiles.map(readJson),
  identities=readJson('identity-bindings.json')}={}) {
  const original=JSON.stringify(facts),semantic=semanticInputs(facts,identities),{book}=semantic;
  const index=new Map(book.entities.map(entity=>[entity.id,entity]));
  const inventory=ownerInventory(facts),owners=inventory.filter(row=>row.disposition==='RULE_OWNER');
  const reviewed=inputs.flatMap(input=>input.owners),classifications=new Map();
  for(const row of reviewed) {
    assert.ok(row.ruleId&&!classifications.has(row.ruleId),'Duplicate semantic classification owner');
    assert.ok(owners.some(owner=>owner.id===row.ruleId),'Unknown rule owner: '+row.ruleId);
    assert.ok(states.includes(row.status)&&row.reason,'Missing owner disposition/rationale: '+row.ruleId);
    const entity=index.get(row.ruleId);
    assert.ok(Array.isArray(row.evidence)&&row.evidence.length,'Classification without evidence: '+row.ruleId);
    for(const evidence of row.evidence)inspectDeclarationEvidence({evidence},index,entity);
    const hasContract=['BUILT','BATTLE_ONLY_NO_RUNTIME_NEEDED'].includes(row.status);
    assert.equal(!!row.declaration,hasContract,'Classification/declaration mismatch: '+row.ruleId);
    if(entity.factOwnerId)assert.equal(row.status,'NOT_EFFECT_OR_PRESENTATION_ONLY','Repeated source occurrence became semantic authority');
    if(row.status==='BLOCKED_BY_CONFIRMED_GENERIC_CAPABILITY') {
      assert.ok(row.blockers?.length,'Blocked owner without source-proven capability');
      for(const blocker of row.blockers) {
        for(const field of ['missingCapability','sourceClause','subject','recipient','condition','expectedRosterEffect','whyExistingLanguageInsufficient'])
          assert.ok(blocker[field]!==undefined,'Incomplete blocker: '+row.ruleId+'/'+field);
        assert.ok(blocker.evidence,'Blocker without exact canonical source address');
        inspectDeclarationEvidence(blocker,index,entity);
        for(const id of blocker.affectedCanonicalAbilityIds||[])
          assert.ok(['ARMY_RULE','DATASHEET_ABILITY','NAMED_RULE_COMPONENT'].includes(index.get(id)?.kind),
            'Blocked ability reference is not canonical: '+id);
      }
    }
    classifications.set(row.ruleId,row);
  }
  assert.deepEqual(new Set(classifications.keys()),new Set(owners.map(row=>row.id)),'Unclassified canonical rule owner');
  const declarations=mergeContractDeclarations(inputs.map(input=>new Map(input.owners.filter(row=>row.declaration)
    .map(row=>[row.ruleId,bindModelDenotations(structuredClone(row.declaration),semantic)]))));
  const schema=createCSMSchema(declarations);
  for(const [id,declaration] of declarations) {
    const entity=index.get(id);
    const rejectExecution=value=>{
      if(!value||typeof value!=='object')return;
      assert.ok(!Object.hasOwn(value,'rosterEffects'),'Effect execution declarations are out of scope');
      for(const child of Object.values(value))Array.isArray(child)?child.forEach(rejectExecution):rejectExecution(child);
    };
    rejectExecution(declaration);
    for(const clause of declaration.clauses)for(const effect of clause.semanticEffects||[]) {
      assert.ok(clause.roles.some(role=>role.id===effect.recipientRoleId&&role.subject===effect.targetSubject),
        'Unresolved semantic effect recipient: '+id+'/'+clause.id);
      for(const weaponId of [...(effect.weaponIds||[]),...(effect.excludeWeaponIds||[])])
        assert.equal(index.get(weaponId)?.kind,'WEAPON_PROFILE','Unresolved canonical weapon scope');
    }
    if(['DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(entity.kind))
      assert.equal(declaration.detachmentId,entity.parentId,'Detachment source scope severed');
    bindDeclarationClauses(declaration);
    entity.ruleContract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',declaration,index,
      currentness:{acceptedBaseHead:facts.acceptedBaseHead,sourceEvidence:entity.provenance.sourceEvidence}});
  }
  const valid=schema.evaluator.validateContracts(book);
  assert.equal(valid.rules,declarations.size);
  rejectPairwiseAuthority(book);
  assert.equal(JSON.stringify(facts),original,'Canonical factual input mutated');
  return {facts,...semantic,schema,declarations,classifications,inventory};
}

export function compileCSMContracts(built) {
  const compiler=createCSMCompatibilityCompiler(built,built.schema.evaluator);
  // The compiler takes only its existing explicit book/binding options.
  const projection=compiler.compileRows({kinds:['ARMY_RULE','DATASHEET_ABILITY','DETACHMENT_RULE','ENHANCEMENT',
    'STRATAGEM','FAQ_ERRATA_RULE','OTHER_RULE'],sort:true});
  const summary=summarizeCompatibility(projection.rows);
  assert.equal(summary.INVALID,0,'Invalid compatibility evaluation');
  return {compiler,projection,summary};
}

export function artifacts(built,compiled) {
  const counts=Object.fromEntries(states.map(state=>[state,[...built.classifications.values()].filter(row=>row.status===state).length]));
  const blocked=[...built.classifications.values()].filter(row=>row.status==='BLOCKED_BY_CONFIRMED_GENERIC_CAPABILITY');
  const contracts=Object.fromEntries(built.book.entities.filter(entity=>entity.ruleContract).map(entity=>[entity.id,entity.ruleContract]));
  return {'rule-contracts':{schema:'csm-rule-contract-overlay/v2',authority:'DISPOSABLE_PROJECTION',
    factualInput:'generated/effective.json',contracts,registry:{stateFields:built.schema.stateFields,modelAbilities:built.schema.modelAbilities},
    modelBindings:built.profileBindings},
    'rule-contract-census':{schema:'csm-rule-contract-census/v2',ruleOwners:built.classifications.size,
      counts,validContracts:Object.keys(contracts).length,unclassifiedRuleOwners:0,invalidRuleContracts:0,unboundRuleContracts:0,
      compatibility:compiled.summary,inventory:built.inventory,
      classifications:[...built.classifications.values()].map(({declaration,...row})=>row)},
    'rule-contract-blockers':{schema:'csm-rule-contract-blockers/v2',owners:blocked},
    'rule-contract-compatibility':{schema:'csm-rule-compatibility/v2',...compiled.projection}};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const built=buildCSMContracts(),compiled=compileCSMContracts(built),outputs=artifacts(built,compiled);
  for(const [name,value] of Object.entries(outputs)) {
    const text=JSON.stringify(value,null,2)+'\n',file=path.join(directory,'generated',name+'.json');
    if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),text,'Disposable projection drift: '+name);
    else fs.writeFileSync(file,text);
  }
  console.log(JSON.stringify({owners:built.classifications.size,counts:outputs['rule-contract-census'].counts,
    valid:built.declarations.size,compatibility:compiled.summary}));
}
