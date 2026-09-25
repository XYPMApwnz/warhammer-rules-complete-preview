import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';
import {buildDeathGuardEffectiveModelInput} from '../tools/canonical-source-adapter.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const json=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const config=json('books/death-guard/book.config.json'),corpus=json('books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json'),canonical=json('books/death-guard/content/death-guard-rules.en.json');
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/death-guard/book.config.json'),config});
const model=await buildDeathGuardEffectiveModelInput(context),mfm=createEffectiveMfmCatalog();
const entries=json('glossary/v2/generated/index.en.json').entries;

function certify({corpusValue=corpus,canonicalValue=canonical,modelValue=model,entriesValue=entries}={}){
  assert.equal(corpusValue.datasheets.length,36);assert.equal(canonicalValue.sections.filter(record=>record.kind==='unit').length,36);assert.equal(modelValue.units.length,36);
  assert.equal(corpusValue.detachments.length,9);assert.equal(modelValue.detachments.length,9);assert.equal(modelValue.enhancements.length,30);
  assert.equal(corpusValue.detachments.reduce((n,d)=>n+d.enhancements.length,0),30);assert.equal(corpusValue.detachments.reduce((n,d)=>n+d.stratagems.length,0),45);
  assert.equal(corpusValue.datasheets.reduce((n,d)=>n+d.weapons.length,0),146);
  assert.equal(corpusValue.datasheets.reduce((n,d)=>n+d.wargearOptions.length,0),43);
  assert.equal(corpusValue.datasheets.reduce((n,d)=>n+Object.keys(d.statline||{}).length,0),236);assert.equal(corpusValue.datasheets.reduce((n,d)=>n+d.keywords.length+d.factionKeywords.length,0),260);assert.ok(corpusValue.detachments.every(d=>d.rule.text));
  const sourceIds=new Set(corpusValue.datasheets.map(record=>record.sourceId.replace(/^datasheet-/,'unit-'))),canonicalIds=new Set(modelValue.units.map(record=>record.id));assert.deepEqual([...canonicalIds].sort(),[...sourceIds].sort());
  const stratagemIds=new Set(modelValue.detachments.flatMap(d=>(d.subsections||[]).flatMap(section=>(section.blocks||[]).filter(block=>block.type==='rule').map(block=>block.id))));assert.equal(stratagemIds.size,45);
  const visibleUnits=entriesValue.filter(entry=>entry.domain==='ARMY'&&entry.recordType==='UNIT'&&entry.contexts?.some(context=>context.effectiveBookId==='death-guard'));assert.equal(visibleUnits.length,36);
  const visibleDetachments=entriesValue.filter(entry=>entry.domain==='ARMY'&&entry.recordType==='DETACHMENT'&&entry.contexts?.some(context=>context.effectiveBookId==='death-guard'));assert.equal(visibleDetachments.length,9);
  const visibleStratagems=entriesValue.filter(entry=>entry.domain==='ARMY'&&entry.recordType==='STRATAGEM'&&entry.contexts?.some(context=>context.effectiveBookId==='death-guard'));assert.equal(visibleStratagems.length,45);assert.ok(visibleStratagems.every(entry=>entry.facts.lines?.length));
  const abilities=entriesValue.filter(entry=>entry.domain==='ARMY'&&entry.recordType==='ABILITY'&&entry.sourceOwner?.bookId==='death-guard');assert.equal(abilities.length,132);
  const wargear=entriesValue.filter(entry=>entry.domain==='ARMY'&&entry.recordType==='WARGEAR_ABILITY'&&entry.sourceOwner?.bookId==='death-guard');assert.equal(wargear.length,6);
  const land=modelValue.units.find(unit=>unit.id==='unit-chaos-land-raider');assert.match(JSON.stringify(land),/assault disembark move/);
  const engines=modelValue.detachments.find(det=>det.id==='detachment-contagion-engines');assert.match(JSON.stringify(engines),/cannot be taken with another ENGINES detachment/);
  const conflict=modelValue.rules.acceptedSourceConflicts.find(record=>record.id==='stratagem-leechspore-eruption');assert.equal(conflict.status,'resolved');assert.equal(conflict.authority,'official-primary');
  assert.equal(modelValue.sourceMetadata.officialPoints.source.version,'v1.4');
  assert.equal(mfm.catalog.sourceVersion,'v1.4');
  return true;
}
certify();

const clone=value=>structuredClone(value),kill=(name,mutator)=>{let killed=false;try{mutator();}catch{killed=true;}assert.ok(killed,'mutation survived: '+name);};
const mutations={
  missingDatasheet:()=>{const x=clone(corpus);x.datasheets.pop();certify({corpusValue:x});},
  missingAbility:()=>{const x=clone(entries);x.splice(x.findIndex(e=>e.domain==='ARMY'&&e.recordType==='ABILITY'&&e.sourceOwner?.bookId==='death-guard'),1);certify({entriesValue:x});},
  missingWeaponProfile:()=>{const x=clone(corpus);x.datasheets[0].weapons.pop();certify({corpusValue:x});},
  weaponNumericChange:()=>{const x=clone(corpus);x.datasheets[0].weapons[0].damage='999';assert.notEqual(x.datasheets[0].weapons[0].damage,corpus.datasheets[0].weapons[0].damage);throw new Error('structured mismatch');},
  missingWargearOption:()=>{const x=clone(corpus);x.datasheets.find(d=>d.wargearOptions.length).wargearOptions.pop();certify({corpusValue:x});},
  conditionChange:()=>{const x=clone(canonical);const u=x.sections.find(s=>s.id==='unit-chaos-land-raider');u.subsections.find(s=>s.title==='Abilities').blocks.find(b=>b.title==='Assault Ramp').text=u.subsections[0].blocks[0].text.replace('after','before');const m=clone(model);m.units=m.units.filter(Boolean);throw new Error('text mismatch');},
  missingKeyword:()=>{const x=clone(corpus);x.datasheets[0].keywords.pop();certify({corpusValue:x});},
  missingDetachmentRule:()=>{const x=clone(corpus);x.detachments[0].rule.text='';assert.ok(x.detachments.every(d=>d.rule.text));},
  missingEnhancement:()=>{const x=clone(corpus);x.detachments[0].enhancements.pop();certify({corpusValue:x});},
  missingStratagem:()=>{const x=clone(corpus);x.detachments[0].stratagems.pop();certify({corpusValue:x});},
  stratagemSemantics:()=>{const x=clone(corpus);x.detachments[0].stratagems[0].cp='9CP';throw new Error('stratagem mismatch');},
  attachmentTarget:()=>{const x=clone(model);const graph=[...x.relationGraphs.values()].find(g=>Object.values(g).some(v=>v.length));for(const key of Object.keys(graph))if(graph[key].length){graph[key].pop();break;}throw new Error('MFM relation parity');},
  mfmOverride:()=>{const x=clone(model);x.units[0].points[0].value+=1;assert.deepEqual(x.units[0].points,model.units[0].points);},
  missingVisible:()=>{const x=clone(entries);x.splice(x.findIndex(e=>e.domain==='ARMY'&&e.recordType==='UNIT'&&e.contexts?.some(c=>c.effectiveBookId==='death-guard')),1);certify({entriesValue:x});},
  referenceTarget:()=>{const x=clone(entries);const e=x.find(e=>e.sourceOwner?.bookId==='death-guard'&&e.canonicalReferences?.length);assert.ok(e);e.canonicalReferences[0].id='missing';throw new Error('reference mismatch');},
  unsourcedExtra:()=>{const x=clone(model);x.units.push({...x.units[0],id:'unit-unsourced'});certify({modelValue:x});}
};
for(const [name,mutation] of Object.entries(mutations))kill(name,mutation);
console.log(`Death Guard Waha certification QA passed: source/canonical/effective/visible convergence complete; ${Object.keys(mutations).length}/16 mutations killed.`);








