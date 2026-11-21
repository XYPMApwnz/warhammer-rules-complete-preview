/** GW exceptions are exact source-field proofs, never gameplay exceptions. */
import assert from 'node:assert/strict';
import {assertCurrentGwContracts,currentGwContractExpectation} from './helpers/current-gw-contract.mjs';

const before='Select the following rule.',after='Select the listed rule.';
const field=['text'],evidence={field,quote:before};
const contract={ruleId:'rule',sourceFields:[field],roles:[{id:'owner',selector:{predicate:'ALWAYS',arguments:{},evidence:structuredClone(evidence)}}],
 clauses:[{id:'clause',sourceFields:[field],sourceText:before,evidence:structuredClone(evidence),conditions:[{predicate:'FIELD',arguments:{equals:true},evidence:structuredClone(evidence)}],rosterEffects:[]}],cp:1,when:'Original timing'};
const historicalBook={entities:[{id:'rule',data:{text:before},ruleContract:contract}]};
const currentBook=structuredClone(historicalBook);currentBook.entities[0].data.text=after;
const entry={id:'accepted',source:{id:'gw',document:'gw.pdf',version:'v2',page:1,authority:'OFFICIAL_GW'},target:{id:'rule',field},
 kind:'DETACHMENT_RULE_TEXT',operation:'SET',expectedBefore:before,after};
const document={schema:'army-book-official-updates/v1',bookId:'synthetic',stage:'canonical-facts',selection:{collection:['entities'],identity:'id',data:['data']},order:'declared',entries:[entry]};
const historicalRows=[{entityId:'rule',contract}];
const options={historicalBook,currentBook,document};
const projected=currentGwContractExpectation(historicalRows,options);
assert.equal(projected.authorized.length,1);
assert.equal(projected.authorized[0].paths.length,4,'Exactly one sourceText and three exact evidence quotes');
assertCurrentGwContracts(projected.rows,historicalRows,options);
assert.equal(historicalRows[0].contract.clauses[0].sourceText,before,'Historical inputs remain immutable');

let rejected=0;
const refuses=(label,action,pattern)=>{assert.throws(action,pattern,label);rejected++;};
// Required mutation (a): changed text without an authored update.
refuses('text without GW entry',()=>assertCurrentGwContracts(projected.rows,historicalRows,{...options,document:{...document,entries:[]}}),/outside exact applied GW fields/);
// Required mutation (b): matching entry but a different HEAD factual value.
const wrongHead=structuredClone(currentBook);wrongHead.entities[0].data.text='Unreviewed';
refuses('HEAD differs from after',()=>assertCurrentGwContracts(projected.rows,historicalRows,{...options,currentBook:wrongHead}),/HEAD field differs from declared after/);
// Required mutation (c): text permission never covers roles, conditions, CP or timing.
for(const[name,mutate]of[
 ['role',c=>c.roles[0].selector.arguments.unreviewed=true],
 ['condition',c=>c.clauses[0].conditions[0].arguments.equals=false],
 ['effect',c=>c.clauses[0].rosterEffects.push({operation:'ADD',field:'W',value:999})],
 ['CP',c=>c.cp=2],['timing',c=>c.when='Unreviewed timing']
]){const changed=structuredClone(projected.rows);mutate(changed[0].contract);refuses(name,()=>assertCurrentGwContracts(changed,historicalRows,options),/outside exact applied GW fields/);}
const wrongBefore=structuredClone(document);wrongBefore.entries[0].expectedBefore='Not the historical value';
refuses('historical value must equal expectedBefore',()=>assertCurrentGwContracts(projected.rows,historicalRows,{...options,document:wrongBefore}),/outside exact applied GW fields/);
const wrongField=structuredClone(document);wrongField.entries[0].target.field=['description'];
refuses('a different field does not authorize text',()=>assertCurrentGwContracts(projected.rows,historicalRows,{...options,document:wrongField}),/outside exact applied GW fields/);
const duplicate=structuredClone(currentBook);duplicate.entities.push(structuredClone(duplicate.entities[0]));
refuses('ambiguous stable ID',()=>currentGwContractExpectation(historicalRows,{...options,currentBook:duplicate}),/expected exactly 1/);
const foreignEvidence=structuredClone(historicalRows);foreignEvidence[0].contract.clauses[0].evidence.field=['description'];
const foreignActual=currentGwContractExpectation(foreignEvidence,options).rows;
foreignActual[0].contract.clauses[0].evidence.quote=after;
refuses('a quote from another field is not covered',()=>assertCurrentGwContracts(foreignActual,foreignEvidence,options),/outside exact applied GW fields/);
const partialEvidence=structuredClone(historicalRows);partialEvidence[0].contract.clauses[0].evidence.quote='Prefix '+before;
const partialActual=currentGwContractExpectation(partialEvidence,options).rows;
partialActual[0].contract.clauses[0].evidence.quote='Prefix '+after;
refuses('no substring-based quote permission',()=>assertCurrentGwContracts(partialActual,partialEvidence,options),/outside exact applied GW fields/);

const locator=structuredClone(document);delete locator.entries[0].target.id;
locator.entries[0].target.sourceLocator={pointer:['entities',0],identityPath:['id'],identity:'rule'};
assertCurrentGwContracts(projected.rows,historicalRows,{...options,document:locator});
const unchanged={...options,currentBook:historicalBook};
assert.deepEqual(currentGwContractExpectation(historicalRows,unchanged).rows,historicalRows,'An old update cannot grant a fresh exception');
console.log(JSON.stringify({status:'PASS',negativeControls:rejected,exactSourceFields:true,historicalFixturesModified:false,gameplayFieldsExact:true}));
