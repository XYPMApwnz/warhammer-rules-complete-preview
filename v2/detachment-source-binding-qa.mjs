/** Independent F1 proof boundaries through real native import adapters.
 * Runtime rows retain exact source provenance; presentation binds canonical
 * rule/parent cards and physical membership, without comparing optional card
 * provenance or book-specific identity decorations. Mutants are memory-only. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chargeFixtures} from './charge-qa-fixtures.mjs';
import {createAdMechRosterRuntime} from '../books/adeptus-mechanicus/v2/roster-runtime.mjs';
import {createDGRosterRuntime} from '../books/death-guard/v2/roster-boot.mjs';
import {createCSMBrowserRoster} from '../books/chaos-space-marines/v2/roster-boot.mjs';
import {normalizeCSMEffectiveBook} from '../books/chaos-space-marines/v2/roster-presentation.mjs';
import {createBloodAngelsRosterRuntime} from '../books/blood-angels/v2/roster-runtime.mjs';
import {createDarkAngelsRosterRuntime} from '../books/dark-angels/v2/roster-runtime.mjs';
import {createBloodAngelsRosterService} from '../books/blood-angels/v2/roster-import.mjs';
import {createDarkAngelsRosterService} from '../books/dark-angels/v2/roster-import.mjs';
import {createBloodAngelsRuleSchema} from '../books/blood-angels/v2/rule-contract-schema.mjs';
import {createDarkAngelsRuleSchema} from '../books/dark-angels/v2/rule-contract-schema.mjs';
import {conditionalPolicyDeclarations as baDeclarations} from '../books/blood-angels/v2/conditional-policy-declarations.mjs';
import {conditionalPolicyDeclarations as daDeclarations} from '../books/dark-angels/v2/conditional-policy-declarations.mjs';
import {createECBrowserRoster} from '../books/emperors-children/v2/roster-boot.mjs';
import {projectDetachmentText,detachmentTextDeclaration,detachmentOwnerChain,projectConditionalRow,detachmentTableOption} from '../books/shared/roster-v2/conditional-policy.mjs';
import {validateRoster,formRoster,predicateContext,withRosterDetachments} from '../books/shared/roster-v2/context.mjs';
import {enhancementOwnerContext} from '../books/shared/roster-v2/compatibility-context.mjs';
import {executeRosterEffects} from '../books/shared/roster-v2/effects.mjs';
import {projectEffectiveInstance} from '../books/shared/roster-v2/effective-instance.mjs';
import {prepareRosterPresentationCards,projectFormedUnitCards,validateDetachmentTextPresentation,groupDetachmentTextRows} from '../books/shared/army-book-app-v2/personal.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),clone=structuredClone;
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const runtimeFiles={
  'adeptus-mechanicus':'roster-runtime','death-guard':'rule-contract-effective','chaos-space-marines':'roster-runtime',
  'emperors-children':'roster-attachments','blood-angels':'roster-runtime','dark-angels':'roster-runtime',
  'space-marines':'roster-runtime','tau-empire':'roster-import','tyranids':'roster-runtime'
};
const results=[],mutations=[],census=[],typedControls=[],temporal=[],tableProofs=[],enhancementOwnerReachability=[];
function independentChain(book,rule){const index=new Map(book.entities.map(entity=>[entity.id,entity])),seen=new Set(),chain=[];while(rule){assert.ok(!seen.has(rule.id),'Independent source ownership cycle');seen.add(rule.id);chain.push({id:rule.id,kind:rule.kind,parentId:rule.parentId||null});if(rule.kind==='DETACHMENT')return chain;rule=index.get(rule.parentId);}return null;}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const rowFor=(projection,instance,rule,clause)=>projection.units.find(unit=>unit.instanceId===instance)?.conditional
  .find(row=>row.detachmentText&&row.ruleId===rule&&row.clauseId===clause);
const csmFixture=chargeFixtures.find(fixture=>fixture.id==='csm-daemonkin');
assert.ok(csmFixture,'Actual reviewed CSM fixture missing');
const ecFixture=read('books/emperors-children/v2/roster-import-fixtures.json').fixtures.find(fixture=>fixture.id==='bsdata-model-variants');
assert.ok(ecFixture,'Existing EC physical import fixture missing');
const specs=[
  {book:'adeptus-mechanicus',rule:'detachment-lords-of-the-forge:rule',clause:'baffling-data-screed',instance:'parsed-unit-1',
    expectedSubject:'MODEL',expectedKind:'ABILITY_PRESENT',
    text:`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Lords of the Forge
1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`,
    expectedUnits:['unit-tech-priest-dominus','unit-skitarii-rangers']},
  {book:'death-guard',rule:'detachment-flyblown-host:rule',clause:'selected-infiltrators',instance:'parsed-unit-1',
    expectedSubject:'UNIT',expectedKind:'ELIGIBLE_FOR_SELECTION',
    text:`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Flyblown Host
7x Plague Marines (125 pts)
• 6x Plague Marine
    4 with Boltgun, Plague knives
    2 with Plague knives, Plasma gun
• 1x Plague Champion: Boltgun, Plague knives
5x Blightlord Terminators (185 pts)`,expectedUnits:['unit-plague-marines','unit-blightlord-terminators']},
  {book:'chaos-space-marines',rule:'detachment-veterans-of-the-long-war:rule',clause:'source-clause-1-1',
    instance:csmFixture.source,expectedSubject:'MODEL',expectedKind:'CONDITIONAL',text:csmFixture.text,
    expectedUnits:['unit-master-of-possession','unit-master-of-possession','unit-legionaries','unit-legionaries','unit-chaos-lord'],
    attach:[csmFixture.source,csmFixture.bodyguard],fixture:'csm-daemonkin'},
  {book:'emperors-children',rule:'detachment-mercurial-host:rule',clause:'advance-roll',instance:'parsed-unit-1',
    expectedSubject:'UNIT',expectedKind:'CONDITIONAL',text:ecFixture.text.replace('Carnival of Excess','Mercurial Host'),
    expectedUnits:['unit-noise-marines','unit-tormentors'],fixture:'bsdata-model-variants'}
];
function input(bookId){
  const base=`books/${bookId}/v2/`,book=read(base+'generated/'+runtimeFiles[bookId]+'.json');
  const payload=read(base+'generated/app-presentation.json');
  const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
  return {book,payload,cards};
}
function serviceFor(bookId,book){
  const base=`books/${bookId}/v2/`;
  switch(bookId){
    case 'adeptus-mechanicus':return createAdMechRosterRuntime(book,read(base+'roster-import-aliases.json'));
    case 'death-guard':return createDGRosterRuntime(book);
    case 'chaos-space-marines':return createCSMBrowserRoster(book,read(base+'generated/roster-import.json'),read(base+'roster-attachment-bindings.json'));
    case 'emperors-children':return createECBrowserRoster(book);
    default:throw new TypeError('No native adapter requested for '+bookId);
  }
}
// This census records differences without making decoration equality an
// acceptance condition. Canonical IDs/kinds/parent membership are mandatory.
for(const id of Object.keys(runtimeFiles)){
  const {book,cards}=input(id),rules=book.entities.filter(rule=>rule.kind==='DETACHMENT_RULE');
  const rows=rules.map(rule=>{const card=cards.get(rule.id),parent=cards.get(rule.parentId),chain=independentChain(book,rule);
    assert.deepEqual(detachmentOwnerChain(book,rule),chain,id+': independently walked ownership');
    return {ruleId:rule.id,runtimeParentId:rule.parentId,runtimeSourceId:rule.provenance?.sourceId||null,
      cardPresent:Boolean(card),cardKind:card?.kind||null,cardParentId:card?.parentId||null,
      cardProvenancePresent:Boolean(card?.provenance),runtimeCardProvenanceEqual:same(rule.provenance,card?.provenance),
      cardIdentityPresent:Boolean(card?.identity),parentKind:parent?.kind||null,
      ownerChain:chain,canonicalParentBound:!!chain&&chain.every(link=>{const node=cards.get(link.id);return node?.id===link.id&&node.kind===link.kind&&(node.parentId||null)===link.parentId;}),
      f1Clauses:(rule.ruleContract?.clauses||[]).filter(clause=>detachmentTextDeclaration(book,rule,clause)).map(clause=>clause.id)};
  });
  for(const row of rows.filter(row=>row.f1Clauses.length))assert.ok(row.canonicalParentBound,id+': F1 rule lacks canonical presentation ownership');
  if(id==='space-marines'){for(const title of ['Unparalleled Tactician','Wrath of the First Khan','Defensive Mastery']){const nested=rules.find(rule=>rule.data.title===title);assert.ok(nested,title);const chain=independentChain(book,nested);assert.equal(chain.length,3,title+': nested ownership is retained');assert.ok((nested.ruleContract.clauses||[]).every(clause=>!detachmentTextDeclaration(book,nested,clause)),title+': DISPLAY/OWNER-only clause must not acquire F1');for(const bad of ['missing','cycle','duplicate']){const changed=clone(book),rule=changed.entities.find(item=>item.id===nested.id);if(bad==='missing')rule.parentId='nonexistent';if(bad==='cycle')changed.entities.find(item=>item.id===rule.parentId).parentId=rule.id;if(bad==='duplicate')changed.entities.push(clone(rule));assert.equal(detachmentOwnerChain(changed,rule),null);mutations.push(id+'/nested/'+title+'/'+bad);}}}
  census.push({book:id,detachmentRules:rows.length,cardProvenanceDifferences:rows.filter(row=>!row.runtimeCardProvenanceEqual).length,
    cardsWithoutIdentity:rows.filter(row=>!row.cardIdentityPresent).length,rows});
}
function reject(name,operation){
  assert.throws(operation,error=>error instanceof TypeError&&/Unresolved textual Detachment|cannot replace a typed policy|Missing canonical conditional policy/.test(error.message),name+' escaped its proof boundary');
  mutations.push(name);
}
for(const spec of specs){
  const {book,payload,cards}=input(spec.book),service=serviceFor(spec.book,book),bookBefore=clone(book),payloadBefore=clone(payload);
  const imported=service.import(spec.text);assert.equal(imported.status,'READY',spec.book+': actual import '+JSON.stringify(imported));
  assert.deepEqual(service.state.units.map(unit=>unit.canonicalUnitId),spec.expectedUnits,spec.book+': independently specified physical fixture');
  if(spec.attach)service.attach(...spec.attach);
  const snapshot=service.snapshot(),projection=service.projection,unit=projection.units.find(unit=>unit.instanceId===spec.instance);
  const viewBook=spec.book==='chaos-space-marines'?normalizeCSMEffectiveBook(book):book;
  assert.ok(unit,spec.book+': physical recipient missing');
  const row=rowFor(projection,spec.instance,spec.rule,spec.clause);assert.ok(row,spec.book+': proven F1 clause missing');
  assert.equal(row.detachmentText.recipientSubject,spec.expectedSubject);assert.equal(row.detachmentText.kind,spec.expectedKind);
  assert.equal(row.detachmentText.classification,'BATTLE_ONLY');assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');
  assert.equal(row.sourceParentId,book.entities.find(entity=>entity.id===spec.rule).parentId);
  assert.deepEqual(row.sourceOwnerChain,independentChain(book,book.entities.find(entity=>entity.id===spec.rule)));
  assert.equal(row.sourceDetachmentId,row.sourceOwnerChain.at(-1).id);
  const canonicalClause=book.entities.find(entity=>entity.id===spec.rule).ruleContract.clauses.find(clause=>clause.id===spec.clause);
  const canonicalRule=book.entities.find(entity=>entity.id===spec.rule);
  const sourceFields=(canonicalClause.sourceFields||[]).map(field=>field.reduce((value,key)=>value?.[key],canonicalRule.data));
  let exactText=sourceFields.filter(value=>typeof value==='string').join('\n');
  if(!exactText)exactText=canonicalClause.evidence.quote;
  exactText+=sourceFields.flatMap(value=>Array.isArray(value)?value.filter(table=>Array.isArray(table?.rows)):[]).map(table=>'\n'+table.rows.map(item=>item.join(' · ')).join('\n')).join('');
  assert.equal(row.detachmentText.text,exactText,'Displayed clause text is exact canonical source');
  assert.deepEqual(row.sourceProvenance,book.entities.find(entity=>entity.id===spec.rule).provenance);
  const effective=service.effective(spec.instance),projected=effective.conditional.find(item=>item.detachmentText&&item.ruleId===spec.rule&&item.clauseId===spec.clause);
  assert.ok(projected,spec.book+': native effective adapter lost F1 source binding');
  assert.doesNotThrow(()=>projectEffectiveInstance(viewBook,projection,spec.instance),'The exact public view adapter must pass before testing its missing-proof mutant');
  assert.doesNotThrow(()=>validateDetachmentTextPresentation(cards,snapshot.units.find(item=>item.instanceId===spec.instance),effective,projected));
  const view=projectFormedUnitCards(cards,service,spec.instance);
  assert.ok(view.components.some(component=>component.card.rosterDetachmentTexts?.some(item=>item.ruleId===spec.rule&&item.clauseId===spec.clause)),spec.book+': actual personal view lost F1 rule');
  assert.ok(view.components.every(component=>(component.card.rosterConditionalPolicies||[]).every(item=>!item.detachmentText)),'New text must not masquerade as an existing typed conditional policy');
  const stripped=clone(cards);for(const card of stripped.values()){delete card.provenance;delete card.identity;}
  assert.doesNotThrow(()=>validateDetachmentTextPresentation(stripped,snapshot.units.find(item=>item.instanceId===spec.instance),effective,projected),
    'Optional presentation decoration is not runtime proof');

  const projectPoison=mutate=>{const altered=clone(projection),target=altered.units.find(item=>item.instanceId===spec.instance),poison=rowFor(altered,spec.instance,spec.rule,spec.clause);
    mutate(poison,altered,target);return projectDetachmentText(book,altered,target,poison);
  };
  for(const [name,mutate]of [
    ['foreign-rule-id',poison=>poison.ruleId='foreign-rule-id'],
    ['foreign-clause-id',poison=>poison.clauseId='foreign-clause-id'],
    ['wrong-source-detachment',poison=>poison.sourceDetachmentId='foreign-owner'],
    ['missing-owner-chain',poison=>{delete poison.sourceOwnerChain;}],
    ['truncated-owner-chain',poison=>{poison.sourceOwnerChain.pop();}],
    ['wrong-owner-chain-kind',poison=>{poison.sourceOwnerChain[0].kind='ENHANCEMENT';}],
    ['wrong-owner-chain-parent',poison=>{poison.sourceOwnerChain[0].parentId='foreign-owner';}],
    ['wrong-source-parent',poison=>poison.sourceParentId='foreign-detachment'],
    ['tampered-source-provenance',poison=>poison.sourceProvenance={...poison.sourceProvenance,sourceId:'foreign-source'}],
    ['empty-source-id',poison=>{poison.sourceProvenance.sourceId='';}],
    ['missing-source-id',poison=>{delete poison.sourceProvenance.sourceId;}],
    ['changed-canonical-text',poison=>{poison.detachmentText.text+=' Invented source sentence.';}],
    ['missing-source-provenance',poison=>{delete poison.sourceProvenance;}],
    ['unselected-detachment',(_poison,altered)=>{altered.detachmentIds=[];}],
    ['foreign-recipient',poison=>{poison.recipientInstanceIds=['foreign-physical-unit'];}],
    ['missing-recipient',poison=>{delete poison.recipientInstanceIds;}],
    ['missing-model-scope-list',poison=>{delete poison.recipientModelScopeIds;}],
    ['typed-policy-substitution',poison=>{poison.policy={kind:'REROLL'};}]
  ])reject(spec.book+'/runtime/'+name,()=>projectPoison(mutate));

  const presentPoison=mutate=>{const altered=clone(cards),poison=clone(projected);mutate(altered,poison);
    return validateDetachmentTextPresentation(altered,snapshot.units.find(item=>item.instanceId===spec.instance),effective,poison);
  };
  for(const [name,mutate]of [
    ['wrong-rule-card-id',altered=>{altered.get(spec.rule).id='foreign-card-id';}],
    ['wrong-rule-card-kind',altered=>{altered.get(spec.rule).kind='ENHANCEMENT';}],
    ['wrong-parent-card-kind',altered=>{altered.get(row.sourceParentId).kind='ARMY_RULE';}],
    ['missing-owner-card',altered=>{altered.delete(row.sourceDetachmentId);}],
    ['changed-canonical-text',(_cards,poison)=>{poison.detachmentText.text+=' Invented sentence.';}],
    ['wrong-rule-parent',altered=>{altered.get(spec.rule).parentId='foreign-detachment';}],
    ['missing-recipient',(_cards,poison)=>{delete poison.recipientInstanceIds;}],
    ['foreign-recipient',(_cards,poison)=>{poison.recipientInstanceIds=['foreign-physical-unit'];}]
  ])reject(spec.book+'/presentation/'+name,()=>presentPoison(mutate));

  // projectEffectiveInstance remains the public downstream projection: corrupt
  // runtime proof must fail there too, before a renderer sees the row.
  const altered=clone(projection);delete rowFor(altered,spec.instance,spec.rule,spec.clause).sourceProvenance;
  reject(spec.book+'/effective/missing-source-proof',()=>projectEffectiveInstance(viewBook,altered,spec.instance));
  const beforeLoad=clone(service.projection),saved=service.snapshot();service.load(clone(saved));assert.deepEqual(service.projection,beforeLoad,'Recompute retained all physical values and F1 proof');
  const restored=serviceFor(spec.book,book);restored.load(clone(saved));assert.deepEqual(restored.projection,beforeLoad,'Load recomputes exactly the same source-bound rows');
  temporal.push({book:spec.book,operation:'recompute and load',status:'PASS'});
  if(spec.book==='chaos-space-marines'){const peer=projection.units.find(item=>item.canonicalUnitId===unit.canonicalUnitId&&item.instanceId!==unit.instanceId);assert.ok(peer,'Actual second identical datasheet instance missing');const copied=clone(row);copied.recipientInstanceIds=[peer.instanceId];reject(spec.book+'/runtime/same-datasheet-different-physical-instance',()=>projectDetachmentText(book,projection,unit,copied));}
  assert.deepEqual(book,bookBefore,'Proof checks modified canonical runtime book');assert.deepEqual(payload,payloadBefore,'Proof checks modified presentation payload');
  assert.deepEqual(service.snapshot(),snapshot,'Mutation controls changed real imported state');
  results.push({book:spec.book,fixture:spec.fixture||'constructed-New-Recruit-text',ruleId:spec.rule,clauseId:spec.clause,
    runtimeSourceProof:'PASS',actualAdapterEffective:'PASS',personalCanonicalOwnership:'PASS',optionalCardDecoration:'NOT_REQUIRED',
    runtimeClassification:row.detachmentText.classification,recipientSubject:row.detachmentText.recipientSubject,status:'PASS'});
}



// Other books retain their own selectors and source classifications. A table
// without a proven F1 recipient remains a normal source page, including orphan
// informational tables which have no referencing effect clause.
for(const id of ['emperors-children','tyranids']){const {book}=input(id);
 for(const table of book.entities.filter(entity=>entity.kind==='STRUCTURED_RULE_TABLE')){
  const owner=book.entities.find(entity=>entity.id===table.parentId),clauses=(owner?.ruleContract?.clauses||[]).filter(clause=>clause.effect?.canonicalTableId===table.id||
   (clause.sourceFields||[]).some(field=>{const value=field.reduce((data,key)=>data?.[key],owner.data);return value===table.id||Array.isArray(value)&&value.includes(table.id);}));
  const eligible=clauses.filter(clause=>detachmentTextDeclaration(book,owner,clause));
  tableProofs.push({book:id,tableId:table.id,ownerId:table.parentId,referencingClauses:clauses.map(clause=>clause.id),eligibleClauses:eligible.map(clause=>clause.id),
   sourceApplicability:eligible.length?'PROVEN_BY_EXISTING_CONTRACT':'N/A: no existing proven F1 recipient; table stays source-only',status:'PASS'});
 }
}

// Canonical table ownership and row evidence are independently read from
// existing source records. No selector or battle choice is invented here.
for(const id of Object.keys(runtimeFiles)){
 const {book}=input(id);
 for(const rule of book.entities.filter(entity=>entity.kind==='DETACHMENT_RULE'))for(const clause of rule.ruleContract?.clauses||[]){
  if(!clause.effect?.canonicalTableId)continue;
  const tableId=clause.effect.canonicalTableId,rowIndex=clause.effect.rowIndex,tables=book.entities.filter(entity=>entity.id===tableId),table=tables[0];
  assert.equal(tables.length,1);assert.equal(table.kind,'STRUCTURED_RULE_TABLE');assert.equal(table.parentId,rule.id);assert.ok(Array.isArray(table.data.rows[rowIndex]));
  const declaration=detachmentTextDeclaration(book,rule,clause),option=detachmentTableOption(book,rule,clause);
  if(option){assert.equal(option.tableId,tableId);assert.equal(option.rowIndex,rowIndex);assert.deepEqual(option.cells,table.data.rows[rowIndex]);assert.equal(option.text,table.data.rows[rowIndex].filter(cell=>String(cell).trim()).join(' · '));}
  if(declaration){assert.equal(declaration.tableOption.tableId,tableId);assert.equal(declaration.tableOption.rowIndex,rowIndex);
   assert.deepEqual(declaration.tableOption.cells,table.data.rows[rowIndex]);assert.equal(declaration.text,table.data.rows[rowIndex].filter(cell=>String(cell).trim()).join(' · '));
   assert.ok(rule.ruleContract.clauses.some(item=>item.id===declaration.tableOption.leadingClauseId&&!item.effect?.canonicalTableId),'Option is bound to real leading source clause');
   assert.doesNotMatch(declaration.text,/:rule:table:|table-\d+-row-\d+|source-clause-/);
   for(const [name,change]of [
    ['missing-table',model=>{model.entities=model.entities.filter(entity=>entity.id!==tableId);}],
    ['duplicate-table',model=>{model.entities.push(clone(table));}],
    ['foreign-table-owner',model=>{model.entities.find(entity=>entity.id===tableId).parentId='foreign-rule';}],
    ['out-of-range-row',(_model,_rule,bad)=>{bad.effect.rowIndex=table.data.rows.length;}],
    ['ambiguous-reference',(_model,badRule)=>{badRule.data.content.push({tableId});}],
    ['wrong-evidence-row',(_model,_rule,bad)=>{bad.evidence={...bad.evidence,field:['rows',rowIndex+1]};}],
    ['missing-canonical-table-id',(_model,_rule,bad)=>{delete bad.effect.canonicalTableId;}]
   ]){const altered=clone(book),badRule=altered.entities.find(entity=>entity.id===rule.id),bad=badRule.ruleContract.clauses.find(item=>item.id===clause.id);change(altered,badRule,bad);
    let result=null;try{result=detachmentTextDeclaration(altered,badRule,bad);}catch(error){assert.ok(error instanceof TypeError);}
    assert.equal(result,null,id+'/'+rule.id+'/'+clause.id+'/'+name+' must remain on source page');mutations.push(id+'/table/'+clause.id+'/'+name);}
  }
  tableProofs.push({book:id,ruleId:rule.id,clauseId:clause.id,tableId,rowIndex,eligible:Boolean(declaration),classification:clause.rosterClassification,
   recipientRoles:clause.roles.map(role=>({id:role.id,subject:role.subject,purpose:role.purpose})),status:'PASS'});
 }
}
{
 const {book,cards}=input('chaos-space-marines'),text=csmFixture.text.replace('Veterans of the Long War','Creations of Bile')+'\n'+
  '10x Cultist Mob (50 pts)\n• 1x Cultist Champion: Autopistol, Brutal assault weapon\n• 9x Chaos Cultist: Autopistol, Brutal assault weapon\n'+
  '1x Heretic Astartes Daemon Prince (100 pts): Infernal cannon, Hellforged weapons\nDaemonic Allegiance: Khorne\n';
 const service=serviceFor('chaos-space-marines',book);assert.equal(service.import(text).status,'READY');
 const ruleId='detachment-creations-of-bile:rule',unit=service.projection.units[0],rows=unit.conditional.filter(row=>row.ruleId===ruleId&&row.detachmentText);
 assert.equal(rows.length,7);assert.equal(rows.filter(row=>row.detachmentText.tableOption).length,6);
 assert.ok(unit.profiles.every(model=>model.keywords.includes('HERETIC ASTARTES')&&model.keywords.includes('INFANTRY')&&!model.keywords.includes('DAMNED')));
 for(const negative of service.projection.units.slice(-2)){assert.ok(!negative.conditional.some(row=>row.ruleId===ruleId&&row.detachmentText));}
 const presentation=projectFormedUnitCards(cards,service,unit.instanceId),rawCardRows=presentation.components[0].card.rosterDetachmentTexts,rawBefore=clone(rawCardRows),group=groupDetachmentTextRows(rawCardRows);
 assert.deepEqual(rawCardRows,rawBefore);assert.ok(group.every(row=>rawCardRows.includes(row)),'Grouping retains original runtime-verified row objects');
 assert.equal(group.length,1,'Source-first Creations options are grouped below one real leading clause');
 assert.equal(group[0].detachmentText.kind,'ELIGIBLE_FOR_SELECTION');assert.equal(group[0].detachmentText.tableOptions.length,6);
 for(const row of rows){assert.equal(row.detachmentText.kind,'ELIGIBLE_FOR_SELECTION');assert.deepEqual(row.recipientInstanceIds,[unit.instanceId]);assert.deepEqual(row.recipientModelScopeIds,unit.profiles.map(model=>model.scopeId));
  if(row.detachmentText.tableOption){const poisoned=clone(row);poisoned.detachmentText.tableOption.rowIndex=999;
   reject('CSM/table-row-proof/'+row.clauseId,()=>projectDetachmentText(book,service.projection,unit,poisoned));}}
 tableProofs.push({book:'chaos-space-marines',scenario:'Creations actual native physical import',rawRows:rows.length,groupedRows:group.length,
  negatives:service.projection.units.slice(-2).map(unit=>unit.canonicalUnitId),status:'PASS'});
 const huron=serviceFor('chaos-space-marines',book);assert.equal(huron.import(text.replace('Creations of Bile',"Huron's Marauders")).status,'READY');
 const hunit=huron.projection.units[0],hrows=hunit.conditional.filter(row=>row.ruleId==='detachment-huron-s-marauders:rule'&&row.detachmentText);
 assert.equal(hrows.length,2,'Huron has only proven UNIT lead and Mobile option; no invented MODEL grant');
 const hview=groupDetachmentTextRows(projectFormedUnitCards(cards,huron,hunit.instanceId).components[0].card.rosterDetachmentTexts);
 assert.equal(hview.length,1);assert.equal(hview[0].detachmentText.kind,'ELIGIBLE_FOR_SELECTION');assert.equal(hview[0].detachmentText.tableOptions.length,2);
 assert.ok(hrows.every(row=>row.detachmentText.recipientSubject==='UNIT'));assert.ok(!hrows.some(row=>row.clauseId==='table-2-row-1'),'Elite remains literal source context, not an independently proven MODEL ability');
 tableProofs.push({book:'chaos-space-marines',scenario:'Huron actual native physical import',rawRows:hrows.length,groupedRows:hview.length,contextOptions:2,noInventedModelGrant:true,status:'PASS'});
}

// Native typed-policy pairs: canonical dispatch must reject stripped row.policy
// before any untyped diagnostic fallback. The old projector remains unchanged.
assert.equal(baDeclarations.length,13);assert.equal(daDeclarations.length,17);
for(const config of [
 {book:'blood-angels',runtime:createBloodAngelsRosterRuntime,rule:'detachment-rule-ba-10c56bef78b24440bb5f',unit:'unit-ba-09adea2bf319462fb4ed',clauses:['review/detachment-rule-ba-10c56bef78b24440bb5f/text/59:88','review/detachment-rule-ba-10c56bef78b24440bb5f/text/89:120']},
 {book:'dark-angels',runtime:createDarkAngelsRosterRuntime,rule:'ability-da-531bbeae023c4f4fa766',clauses:['review/ability-da-531bbeae023c4f4fa766/text/110:135','review/ability-da-531bbeae023c4f4fa766/text/136:163']}
]){
 const {book}=input(config.book),index=new Map(book.entities.map(entity=>[entity.id,entity])),rule=index.get(config.rule);
 assert.ok(rule,'Reviewed paired typed rule exists');const unitId=config.unit||rule.parentId,canonical=index.get(unitId);
 const modelRows=canonical.data.profileIds.map((canonicalProfileId,i)=>({rowId:'row-'+i,canonicalProfileId,quantity:1,compositionScope:'MODEL_ROW',
  selections:canonical.data.weaponIds.map((weaponId,j)=>({selectionKey:`typed-source/${i}/weapon/${j}`,canonicalProfileIds:[weaponId],canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1}))}));
 const state={schema:'roster-v2/roster',bookId:config.book,rosterId:'f1-typed-source-binding',
  detachments:[{instanceId:'detachment/typed',canonicalDetachmentId:config.book==='blood-angels'?rule.parentId:'detachment-da-7e310c5c15914267a0ae'}],
  units:[{instanceId:'typed-source',canonicalUnitId:unitId,startingStrength:modelRows.length,modelRows,selections:[],equipmentContextKnown:true,enhancementIds:[],warlord:null}],attachments:[],warlordInstanceId:null};
 const service=config.runtime(book);service.load(validateRoster(book,state,book.rosterAttachmentPolicies));const projection=service.projection,unit=projection.units[0];
 for(const clauseId of config.clauses){const row=unit.conditional.find(item=>item.clauseId===clauseId&&item.policy);assert.ok(row,config.book+': native typed pair missing');
  assert.doesNotThrow(()=>projectConditionalRow(book,projection,unit,row));const stripped=clone(row);delete stripped.policy;
  reject(config.book+'/typed/missing-policy/'+clauseId,()=>projectConditionalRow(book,projection,unit,stripped));
  const altered=clone(projection);delete altered.units[0].conditional.find(item=>item.clauseId===clauseId).policy;
  reject(config.book+'/typed/effective-missing-policy/'+clauseId,()=>projectEffectiveInstance(book,altered,unit.instanceId));
  typedControls.push({book:config.book,clauseId,kind:row.policy.kind,payload:row.policy.payload,status:'PASS'});
 }
 assert.notDeepEqual(typedControls.slice(-2)[0].payload,typedControls.slice(-2)[1].payload,'HIT and WOUND source clauses remain distinct');
 const diagnostic={ruleId:'diagnostic-only',clauseId:'diagnostic',execution:'CONDITIONAL',state:'UNKNOWN',reason:'Existing unresolved service diagnostic'};
 assert.deepEqual(projectConditionalRow(book,projection,unit,diagnostic),diagnostic,'Ordinary service diagnostic rows retain pass-through behavior');
}
// A real attached Flyblown unit changes its whole physical UNIT membership;
// stale standalone and stale attached rows must fail after each graph change.
{
 const {book,cards}=input('death-guard'),service=createDGRosterRuntime(book),text=fs.readFileSync(path.join(root,'books/death-guard/v2/fixtures/omega-megaroster.txt'),'utf8');
 assert.equal(service.import(text).status,'READY');assert.equal(service.state.units.length,38);
 const owner='parsed-unit-1',leader='parsed-unit-27',rule='detachment-flyblown-host:rule',clause='selected-infiltrators';
 const standalone=clone(rowFor(service.projection,owner,rule,clause));assert.ok(standalone);service.attach(leader,owner);
 const attachedProjection=service.projection,attachedUnit=attachedProjection.units.find(unit=>unit.instanceId===owner),attached=clone(rowFor(attachedProjection,owner,rule,clause));
 assert.deepEqual(attached.recipientInstanceIds.toSorted(),[owner,leader].toSorted());
 reject('death-guard/stale-standalone-after-attach',()=>projectDetachmentText(book,attachedProjection,attachedUnit,standalone));
 for(const recipients of [[owner],[leader],['parsed-unit-2']]){const poison=clone(attached);poison.recipientInstanceIds=recipients;
  reject('death-guard/full-physical-recipient-set/'+recipients.join(','),()=>projectDetachmentText(book,attachedProjection,attachedUnit,poison));
  reject('death-guard/presentation/full-physical-recipient-set/'+recipients.join(','),()=>validateDetachmentTextPresentation(cards,service.state.units.find(unit=>unit.instanceId===owner),service.effective(owner),poison));}
 const attachedSnapshot=service.snapshot();service.detach(leader);const detachedProjection=service.projection;
 reject('death-guard/stale-attached-after-detach',()=>projectDetachmentText(book,detachedProjection,detachedProjection.units.find(unit=>unit.instanceId===owner),attached));
 service.attach(leader,owner);assert.deepEqual(service.projection,attachedProjection,'Reattach recomputes exactly same source proof and values');
 service.load(attachedSnapshot);assert.deepEqual(service.projection,attachedProjection,'Snapshot load recomputes physical membership');
 const changed=clone(attachedSnapshot);changed.detachments=changed.detachments.filter(item=>item.canonicalDetachmentId!=='detachment-flyblown-host');changed.detachmentIds=changed.detachmentIds.filter(id=>id!=='detachment-flyblown-host');const removedEnhancements=new Set(book.entities.filter(entity=>entity.kind==='ENHANCEMENT'&&entity.parentId==='detachment-flyblown-host').map(entity=>entity.id));for(const unit of changed.units){unit.enhancementIds=unit.enhancementIds.filter(id=>!removedEnhancements.has(id));if(unit.enhancementAssignments)unit.enhancementAssignments=unit.enhancementAssignments.filter(item=>!removedEnhancements.has(item.enhancementId));}service.load(changed);
 assert.ok(!rowFor(service.projection,owner,rule,clause),'Detachment switch removes prior F1 clause');
 reject('death-guard/stale-reload-after-detachment-switch',()=>projectDetachmentText(book,service.projection,service.projection.units.find(unit=>unit.instanceId===owner),attached));
 temporal.push({book:'death-guard',fixture:'omega-megaroster.txt',operations:['attach','detach','reattach','load','detachment switch'],status:'PASS'});
}

// Actual native imports, rather than a fabricated diagnostic row or a stubbed
// evaluator, guard the four canonical Enhancement owner-assignment paths. All
// three MODEL assignments are STATIC MODEL_KEYWORD atoms: physical keywords
// yield TRUE/FALSE even when Warlord is unknown. Nightforged is a known UNIT_ID
// and cannot enter the executor's MODEL-only unavailable-owner branch.
for(const config of [
 {book:'blood-angels',name:'Blazing Icon',id:'enhancement-ba-3f19e1f57dd94fcc92ae',unit:'unit-ba-09adea2bf319462fb4ed',
  predicate:'MODEL_KEYWORD',subject:'MODEL',keyword:'ADEPTUS ASTARTES',create:createBloodAngelsRosterService,schema:createBloodAngelsRuleSchema},
 {book:'blood-angels',name:'Instinctive Interception',id:'enhancement-ba-9b2691d5805d46df9b88',unit:'unit-ba-014cc7b19aca4d5b84a3',
  predicate:'MODEL_KEYWORD',subject:'MODEL',keyword:'DEATH COMPANY',create:createBloodAngelsRosterService,schema:createBloodAngelsRuleSchema},
 {book:'dark-angels',name:'Lord of the Ravenwing',id:'enhancement-da-822dfec678424ec293c2',unit:'unit-da-467009b00bb9402dadee',
  predicate:'MODEL_KEYWORD',subject:'MODEL',keyword:'RAVENWING',create:createDarkAngelsRosterService,schema:createDarkAngelsRuleSchema},
 {book:'dark-angels',name:'Nightforged Battery',id:'enhancement-da-fb83cfb304e74056b819',unit:'unit-da-48fe8c59ed2449e1a36b',peer:'unit-da-f8f0629206e744459a9f',
  predicate:'UNIT_ID',subject:'UNIT',create:createDarkAngelsRosterService,schema:createDarkAngelsRuleSchema}
]){
 const book=read(`books/${config.book}/v2/generated/roster-import.json`),index=new Map(book.entities.map(entity=>[entity.id,entity]));
 const before=clone(book),rule=index.get(config.id),selector=rule.ruleContract.assignment.selector;
 assert.equal(rule.data.title,config.name);assert.equal(selector.predicate,config.predicate);
 assert.equal(selector.subject,config.subject);assert.equal(selector.contextLevel,'STATIC');
 assert.deepEqual(selector.arguments,config.keyword?{keyword:config.keyword}:{id:config.unit});
 const expectedPolicies=config.subject==='UNIT'?2:1;
 const unitText=(id,{enhancement=false,warlord=false}={})=>{
  const members=book.importBindings.compositions.filter(row=>row.ownerId===id&&row.quantity.min>0);
  assert.ok(members.length,'Real native composition missing');
  return members.reduce((sum,row)=>sum+row.quantity.min,0)+'x '+index.get(id).data.title+' (9999 pts)\n'+
   members.map(row=>'• '+row.quantity.min+'x '+index.get(row.id).data.name+'\n').join('')+
   (warlord?'Warlord\n':'')+(enhancement?'Enhancement: '+config.name+'\n':'');
 };
 for(const mode of ['unspecified','peer',...(config.subject==='MODEL'?['owner']:[])]){
  const text='+ FACTION KEYWORD: '+(config.book==='blood-angels'?'Blood Angels':'Dark Angels')+'\n+ DETACHMENT: '+index.get(rule.parentId).data.title+'\n'+
   unitText(config.unit,{enhancement:true,warlord:mode==='owner'})+unitText(config.peer||config.unit,{warlord:mode==='peer'});
  let service=config.create(book),imported=service.import(text);const bindings={};
  if(imported.status==='NEEDS_BINDINGS'){
   assert.ok(imported.needsBindings.length&&imported.needsBindings.every(need=>need.kind==='ENHANCEMENT_BEARER'));
   bindings.enhancementBearers=Object.fromEntries(imported.needsBindings.map(need=>[need.key,need.candidates[mode==='peer'?need.candidates.length-1:0].id]));
   imported=service.import(text,bindings);
  }else if(imported.status==='READY'&&mode==='peer'&&config.subject==='MODEL'){
   const assignment=service.state.units[0].enhancementAssignments.find(row=>row.enhancementId===config.id);assert.ok(assignment);
   bindings.modelBearers={'parsed-unit-1':{[config.id]:assignment.modelScopeId}};
   service=config.create(book);imported=service.import(text,bindings);
  }
  assert.equal(imported.status,'READY',config.name+': real native import '+JSON.stringify(imported.errors));
  const state=service.snapshot();assert.equal(state.units[0].warlord,mode==='unspecified'?null:mode==='owner');
  const verified=validateRoster(book,state,book.rosterAttachmentPolicies),base=formRoster(book,verified);
  const api=withRosterDetachments(config.schema({book,state})),owner=base.units[0];
  const contexts=config.subject==='MODEL'?owner.profiles.map(model=>predicateContext(verified,base,owner.instanceId,'MODEL',model.scopeId)):
   [predicateContext(verified,base,owner.instanceId,'UNIT')];
  const states=contexts.map(context=>api.evaluatePredicate(selector,enhancementOwnerContext(rule.ruleContract,context)));
  assert.ok(states.length&&states.every(state=>['TRUE','FALSE'].includes(state)),'Valid physical owner must not produce UNKNOWN/INVALID');
  assert.ok(states.includes('TRUE'),'Native accepted bearer must have a proven physical owner');
  // The native service already invokes the real executor with its equipment
  // binder. Also exercise the exported executor with the real native schema;
  // these four STATIC owner atoms do not depend on equipment context.
  const executed=executeRosterEffects(book,verified,api);
  const rows=projection=>projection.units.flatMap(unit=>unit.conditional.filter(row=>row.ruleId===config.id).map(row=>({instanceId:unit.instanceId,row})));
  assert.deepEqual(rows(executed),rows(service.projection),'Scoped native/direct Enhancement executor drift');
  assert.ok(!executed.units.some(unit=>unit.conditional.some(row=>row.ruleId===config.id&&row.reason==='Enhancement owner context unavailable')),
   'An actual unavailable-owner diagnostic would require a fresh reachability review');
  const policies=rows(executed).filter(item=>item.row.policy);assert.equal(policies.length,expectedPolicies);
  assert.ok(policies.every(item=>item.instanceId==='parsed-unit-1'),'Unassigned repeated source acquired Enhancement policy');
  for(const unit of state.units){
   assert.doesNotThrow(()=>service.effective(unit.instanceId),'Native effective consumer must accept actual executor rows');
   assert.doesNotThrow(()=>projectEffectiveInstance(book,executed,unit.instanceId),'Effective projector must accept real scoped executor rows');
  }
  enhancementOwnerReachability.push({book:config.book,ruleId:config.id,name:config.name,warlord:state.units[0].warlord,
   mode,ownerSubject:config.subject,assignmentStates:states,typedPolicyRows:policies.length,unavailableOwnerRows:0,
   nativeImport:'READY',realExecutor:true,effective:'PASS',explicitBindings:bindings,status:'PASS'});
 }
 assert.deepEqual(book,before,'Reachability controls modified the canonical native book');
}

const result={status:'PASS',cases:results.length,mutationsRejected:mutations.length,results,mutations,census,typedControls,temporal,tableProofs,enhancementOwnerReachability,
  boundary:'Runtime source/provenance/recipient proof is checked before canonical presentation binding. Presentation decoration equality is intentionally not required.',
  realNewRecruitExportTested:false,gameplayExecutionChanged:false};
if(process.env.F1_SOURCE_BINDING_OUT){fs.mkdirSync(process.env.F1_SOURCE_BINDING_OUT,{recursive:true});
  fs.writeFileSync(path.join(process.env.F1_SOURCE_BINDING_OUT,'RESULTS.json'),JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result));
