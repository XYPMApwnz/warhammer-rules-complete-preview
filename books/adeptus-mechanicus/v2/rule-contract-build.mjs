import {finalizeRecipientBook} from '../../shared/rule-contract-v2/finalize-recipients.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {mergeContractDeclarations,bindDeclarationClauses,bindCanonicalContract,inspectDeclarationEvidence,
  validateContractBinding} from '../../shared/rule-contract-v2/bindings.mjs';
import {createAdMechSchema} from './rule-contract-schema.mjs';
import {createAdMechCompatibilityCompiler} from './rule-contract-context.mjs';
import {summarizeCompatibility} from '../../shared/rule-contract-v2/compatibility.mjs';

export const directory=path.dirname(fileURLToPath(import.meta.url));
export const declarationFiles=['contract-datasheet-army-declarations.json',
  'contract-enhancement-detachment-declarations.json','contract-stratagem-declarations.json'];
export const readJson=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));

/** Build-time lowering of a book-owned canonical UNIT membership relationship.
 * The existing UNIT_ID language encodes its denotation; no unit/rule answers
 * are authored here and no MODEL ability or runtime text lookup is involved. */
function bindUnitMembership(declaration,index) {
  const membership=declaration.unitMembership;
  if(!membership)return;
  assert.equal(membership.subject,'UNIT');
  assert.equal(index.get(membership.ruleId)?.kind,'ARMY_RULE','Unresolved membership rule');
  assert.ok(index.get(membership.ruleId).data.componentIds.some(id=>index.get(id)?.data.text.includes(membership.evidence.quote)),
    'Membership prerequisite lost source evidence');
  const members=[];
  for(const unit of index.values())if(unit.kind==='DATASHEET') {
    for(const referenceId of unit.data.ruleReferenceIds) {
      const reference=index.get(referenceId);
      assert.equal(reference?.kind,'RULE_REFERENCE','Unresolved UNIT rule reference');
      assert.equal(reference.parentId,unit.id,'Foreign UNIT rule reference');
      reference.data.groups.forEach((group,g)=>group.entries.forEach((entry,e)=>{
        if(!entry.sourceTooltipIds.includes(membership.sourceTooltipId))return;
        assert.equal(group.label,'ARMY RULES','Army membership in wrong reference scope');
        assert.ok(!members.some(member=>member.unitId===unit.id),'Duplicate UNIT membership');
        members.push({unitId:unit.id,referenceId,entryId:entry.id,
          evidence:{otherEntityId:referenceId,field:['groups',g,'entries',e,'sourceTooltipIds'],quote:membership.sourceTooltipId}});
      }));
    }
  }
  assert.ok(members.length,'Unresolved canonical UNIT membership');
  members.sort((a,b)=>a.unitId.localeCompare(b.unitId,'en'));
  membership.references=members;
  const selector={op:'ANY',args:members.map(member=>({predicate:'UNIT_ID',subject:'UNIT',contextLevel:'STATIC',
    arguments:{id:member.unitId},evidence:member.evidence}))};
  const roles=[...declaration.roles,...declaration.clauses.flatMap(clause=>clause.roles)];
  assert.ok(roles.some(role=>role.id===membership.roleId),'Missing UNIT membership role');
  for(const role of roles.filter(role=>role.id===membership.roleId)) {
    assert.equal(role.subject,'UNIT','UNIT prerequisite changed subject');
    role.selector=structuredClone(selector);
  }
}

/** Enumerate existing semantic owners, independently of declarations/old matrices. */
export function ownerInventory(book) {
  return book.entities.map(entity=>{
    let disposition='FACT_OR_REFERENCE';
    if(['ARMY_RULE_COMPONENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','SOURCE_ERRATUM','WEAPON_PROFILE_SELECTION'].includes(entity.kind))disposition='RULE_OWNER';
    if(entity.kind==='DATASHEET_SECTION')disposition=entity.data.title==='UNIT COMPOSITION'?'COMPOSITION_FACT':'RULE_OWNER';
    if(entity.kind==='WARGEAR_OPTION')disposition=entity.data.text?.trim()==='None'?'EXPLICIT_ABSENCE':'RULE_OWNER';
    if(entity.kind==='ARMY_RULE')disposition='RULE_REFERENCE_CONTAINER';
    if(entity.kind==='ATTACHMENT_DECLARATION')disposition='REFERENCE_TO_SECTION_OWNER';
    if(entity.kind==='BOOK_USAGE')disposition='PRODUCT_SCOPE_INSTRUCTIONS';
    return {id:entity.id,kind:entity.kind,disposition,...(disposition==='REFERENCE_TO_SECTION_OWNER'?{ownerId:entity.data.sourceSectionId}:{})};
  });
}

/** Build only: source interpretation is explicit book-owned typed declarations. */
export function buildAdMechContracts({book=readJson('generated/effective.json'),inputs=declarationFiles.map(readJson)}={}) {
  const index=new Map(book.entities.map(entity=>[entity.id,entity]));
  assert.equal(index.size,book.entities.length,'Duplicate canonical identity');
  const declarations=mergeContractDeclarations(inputs.map(input=>new Map(Object.entries(input.declarations))));
  for(const declaration of declarations.values())bindUnitMembership(declaration,index);
  const blocked=inputs.flatMap(input=>input.blocked||[]).map(item=>({
    status:'BLOCKED_MISSING_GENERIC_PRIMITIVE',...item,
    sourceCase:item.sourceCase||item.evidence?.quote,
    semanticAtom:item.semanticAtom||item.missingPrimitive,
    whyCompositionInsufficient:item.whyCompositionInsufficient||item.reason,
    provenance:index.get(item.ruleId)?.provenance}));
  const blockedIds=new Set(blocked.map(item=>item.ruleId));
  const inventory=ownerInventory(book),owners=inventory.filter(row=>row.disposition==='RULE_OWNER');
  assert.ok(blocked.every(item=>owners.some(owner=>owner.id===item.ruleId)),'Unknown blocked owner');
  assert.ok(blocked.every(item=>item.sourceCase&&item.semanticAtom&&item.whyCompositionInsufficient),'Incomplete primitive limitation evidence');
  for(const item of blocked)inspectDeclarationEvidence(item,index,index.get(item.ruleId));
  assert.equal(new Set(owners.map(owner=>owner.id)).size,owners.length);
  for(const id of declarations.keys())assert.ok(owners.some(owner=>owner.id===id),'Declaration without semantic owner: '+id);
  for(const owner of owners)assert.ok(declarations.has(owner.id)||blockedIds.has(owner.id),'Unbound source rule: '+owner.id);
  const schema=createAdMechSchema(declarations);
  const result=structuredClone(book);
  for(const entity of result.entities) {
    if(blockedIds.has(entity.id)||!declarations.has(entity.id))continue;
    const declaration=structuredClone(declarations.get(entity.id));
    if(['STRATAGEM','ENHANCEMENT','DETACHMENT_RULE'].includes(entity.kind))
      assert.equal(declaration.detachmentId,entity.parentId,'Missing canonical Detachment scope: '+entity.id);
    bindDeclarationClauses(declaration);
    entity.ruleContract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',declaration,
      currentness:{sourceId:entity.provenance.sourceId,sourcePath:entity.provenance.sourcePath,
        ...(entity.fieldProvenance?{fieldProvenance:entity.fieldProvenance}:{})},index});
    validateContractBinding({entity,bookId:book.bookId,schema:'rule-contract/v2',declaration,
      currentness:entity.ruleContract.currentness},entity.ruleContract);
  }
  const valid=schema.evaluator.validateContractDeclarations(result);
  assert.equal(valid.rules,owners.length-blockedIds.size,'Owner accounting mismatch');
  finalizeRecipientBook(result);
  schema.evaluator.validateContracts(result);
  return {book:result,schema,declarations,inventory,blocked,blockedIds};
}

export function compileAdMechContracts(built) {
  const compiler=createAdMechCompatibilityCompiler(built.book,built.schema.evaluator);
  const projection=compiler.compileRows({kinds:['ARMY_RULE','DATASHEET_ABILITY','DETACHMENT_RULE',
    'ENHANCEMENT','STRATAGEM','FAQ_ERRATA_RULE','OTHER_RULE'],sort:true});
  const summary=summarizeCompatibility(projection.rows);
  assert.equal(summary.INVALID,0,'Invalid compatibility evaluation');
  return {projection,summary,compiler};
}

export function artifacts(built,compiled) {
  const contracts=built.book.entities.filter(entity=>entity.ruleContract);
  const byKind={};for(const entity of contracts)byKind[entity.ruleContract.kind]=(byKind[entity.ruleContract.kind]||0)+1;
  const census={schema:'adeptus-mechanicus-rule-contract-census/v2',sourceRules:built.inventory.filter(row=>row.disposition==='RULE_OWNER').length,
    built:contracts.length,valid:contracts.length,blockedOwners:built.blockedIds.size,blockedCases:built.blocked.length,
    invalidContracts:0,unboundSourceRules:0,legacyContractReads:0,byKind,
    compatibilityRelations:compiled.projection.rows.length,compatibility:compiled.summary,inventory:built.inventory,
    blocked:built.blocked};
  return {'rule-contracts':{schema:'adeptus-mechanicus-rule-contract-overlay/v2',authority:'DISPOSABLE_PROJECTION',
    factualInput:'generated/effective.json',contracts:Object.fromEntries(contracts.map(entity=>[entity.id,entity.ruleContract])),
    registry:{stateFields:built.schema.stateFields,modelAbilities:built.schema.modelAbilities}},
    'rule-contract-compatibility':{schema:'adeptus-mechanicus-compatibility/v2',...compiled.projection},'rule-contract-census':census};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const built=buildAdMechContracts(),compiled=compileAdMechContracts(built),outputs=artifacts(built,compiled);
  for(const [name,value]of Object.entries(outputs)) {
    const text=JSON.stringify(value,null,2)+'\n',file=path.join(directory,'generated',name+'.json');
    if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),text,'Disposable projection drift: '+name);
    else fs.writeFileSync(file,text);
  }
  const census=outputs['rule-contract-census'];
  console.log(JSON.stringify({owners:census.sourceRules,built:census.built,blocked:census.blockedOwners,
    relations:census.compatibilityRelations,states:census.compatibility}));
}
