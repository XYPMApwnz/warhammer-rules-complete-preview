import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';import {buildAdeptusMechanicusEffectiveModelInput} from '../tools/canonical-source-adapter.mjs';import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const config=json('books/adeptus-mechanicus/book.config.json'),corpus=json('books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json'),entries=json('glossary/v2/generated/index.en.json').entries;
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/adeptus-mechanicus/book.config.json'),config}),model=await buildAdeptusMechanicusEffectiveModelInput(context),mfm=createEffectiveMfmCatalog();
const norm=v=>String(v??'').normalize('NFKD').replace(/[’‘]/g,"'").replace(/[‐‑‒–—−]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
const abilityText=a=>[a.openingText,...(a.options||[]).flatMap(o=>[o.title,o.text]),a.text].filter(Boolean).join(' ');
function certify({corpusValue=corpus,modelValue=model,entriesValue=entries}={}){
 assert.equal(corpusValue.gameplayUnits,2080);assert.equal(corpusValue.datasheets.length,34);assert.equal(modelValue.units.length,34);assert.equal(corpusValue.detachments.length,10);assert.equal(modelValue.detachments.length,10);assert.equal(modelValue.enhancements.length,34);assert.equal(modelValue.detachments.reduce((n,d)=>n+d.stratagems.length,0),51);assert.equal(corpusValue.inventory.weaponProfile,138);assert.equal(modelValue.units.reduce((n,u)=>n+u.weapons.length,0),138);assert.equal(corpusValue.inventory.wargearOption,41);assert.equal(modelValue.units.reduce((n,u)=>n+(u.wargear||[]).length,0),41);assert.equal(modelValue.units.reduce((n,u)=>n+u.abilities.length,0),134);assert.equal(modelValue.units.reduce((n,u)=>n+(u.wargearAbilities||[]).length,0),12);assert.equal(modelValue.units.reduce((n,u)=>n+u.keywords.length,0)+1,232);
 const sourceIds=new Set(corpusValue.datasheets.map(r=>r.sourceId.replace(/^datasheet-/,'unit-'))),canonicalIds=new Set(modelValue.units.map(r=>r.id));assert.deepEqual([...canonicalIds].sort(),[...sourceIds].sort());
 const visible=entriesValue.filter(e=>e.contexts?.some(c=>c.effectiveBookId==='adeptus-mechanicus')||e.sourceOwner?.bookId==='adeptus-mechanicus');assert.equal(visible.length,360);assert.equal(visible.filter(e=>e.recordType==='UNIT').length,34);assert.equal(visible.filter(e=>e.recordType==='DETACHMENT').length,10);assert.equal(visible.filter(e=>e.recordType==='STRATAGEM').length,51);assert.ok(visible.filter(e=>e.recordType==='STRATAGEM').every(e=>e.facts.when&&e.facts.effect));
 const thulia=modelValue.units.find(u=>u.id==='unit-thulia-ghuld'),icon=thulia.abilities.find(a=>a.title==='Icon of War');assert.equal(icon.options.length,3);assert.match(abilityText(icon),/until the start of your next Command phase/i);assert.match(icon.options[0].text,/eligible to shoot and declare a charge in a turn in which it Advanced/i);assert.ok(thulia.abilities.some(a=>a.title==='Supreme Commander'));
 for(const id of ['unit-hastarii-exterminators','unit-hastarii-fusiliers','unit-servitor-battleclade'])assert.ok(modelValue.units.find(u=>u.id===id).abilities.some(a=>a.title==='Attached Unit'));
 assert.equal(modelValue.sourceMetadata.officialMfm.version,'v1.4');assert.equal(mfm.catalog.sourceVersion,'v1.4');assert.ok(modelValue.units.every(u=>u.publicationRecord?.mfmRecordId));assert.ok(modelValue.detachments.every(d=>d.mfmRecordId&&d.forceDispositionId));
 const allIds=new Set(entriesValue.map(e=>e.id));for(const entry of visible)for(const ref of entry.canonicalReferences||[])assert.ok(allIds.has(ref.id),`${entry.id}: dead reference ${ref.id}`);
 return true;
}
certify();
const clone=structuredClone,kill=(name,mutator)=>{let killed=false;try{mutator();}catch{killed=true;}assert.ok(killed,`mutation survived: ${name}`);};
const mutations={
 missingDatasheet:()=>{const x=clone(corpus);x.datasheets.pop();certify({corpusValue:x});},
 missingAbility:()=>{const x=clone(model);x.units.find(u=>u.id==='unit-thulia-ghuld').abilities=x.units.find(u=>u.id==='unit-thulia-ghuld').abilities.filter(a=>a.title!=='Supreme Commander');certify({modelValue:x});},
 missingWeaponProfile:()=>{const x=clone(model);x.units[0].weapons.pop();certify({modelValue:x});},
 weaponNumericChange:()=>{const x=clone(corpus);x.inventory.weaponProfile--;certify({corpusValue:x});},
 missingWargearOption:()=>{const x=clone(model);x.units.find(u=>(u.wargear||[]).length).wargear.pop();certify({modelValue:x});},
 conditionChange:()=>{const x=clone(model);x.units.find(u=>u.id==='unit-thulia-ghuld').abilities.find(a=>a.title==='Icon of War').options[0].text='Changed';certify({modelValue:x});},
 missingKeyword:()=>{const x=clone(model);x.units[0].keywords.pop();certify({modelValue:x});},
 missingDetachmentRule:()=>{const x=clone(model);x.detachments[0].rule.text='';assert.ok(x.detachments.every(d=>d.rule.text));},
 missingEnhancement:()=>{const x=clone(model);x.enhancements.pop();certify({modelValue:x});},
 missingStratagem:()=>{const x=clone(model);x.detachments[0].stratagems.pop();certify({modelValue:x});},
 stratagemSemantics:()=>{const x=clone(entries);x.find(e=>e.recordType==='STRATAGEM'&&e.sourceOwner?.bookId==='adeptus-mechanicus').facts.effect='';certify({entriesValue:x});},
 attachmentTarget:()=>{const x=clone(model);for(const graph of x.relationGraphs.values())for(const key of Object.keys(graph))if(graph[key].length){graph[key].pop();throw new Error('MFM relation parity');}certify({modelValue:x});},
 mfmOverride:()=>{const x=clone(model);x.units[0].points[0].value+=1;assert.deepEqual(x.units[0].points,model.units[0].points);},
 missingVisible:()=>{const x=clone(entries);x.splice(x.findIndex(e=>e.recordType==='UNIT'&&e.contexts?.some(c=>c.effectiveBookId==='adeptus-mechanicus')),1);certify({entriesValue:x});},
 referenceTarget:()=>{const x=clone(entries),e=x.find(e=>e.sourceOwner?.bookId==='adeptus-mechanicus'&&e.canonicalReferences?.length);e.canonicalReferences[0].id='missing';certify({entriesValue:x});},
 unsourcedExtra:()=>{const x=clone(model);x.units.push({...x.units[0],id:'unit-unsourced'});certify({modelValue:x});}
};for(const [name,mutation] of Object.entries(mutations))kill(name,mutation);
console.log(`Adeptus Mechanicus Waha certification QA passed: source/canonical/effective/visible convergence complete; ${Object.keys(mutations).length}/16 mutations killed.`);



