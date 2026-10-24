/** Constructed import-boundary diagnostics, never real New Recruit exports. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {importModelLabelCandidates,importNewRecruit} from './import.mjs';
import {parse} from './parser.mjs';
import {createRosterImportService} from './import-service.mjs';
import {formRoster} from './context.mjs';
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
const make=(bookId)=>{
 const entity=(id,kind,data,parentId=null)=>({id,kind,bookId,parentId,data,provenance:{sourceId:'CONSTRUCTED_DIAGNOSTIC'}});
 return {bookId,rosterAttachmentPolicies:[],entities:[entity('det','DETACHMENT',{title:'Test Detachment'}),
  entity('unit','DATASHEET',{title:'Test Squad',profileIds:['regular','leader'],weaponIds:['gun'],keywords:[],factionKeywords:[],ruleReferenceIds:[]}),
  entity('regular','PROFILE',{name:'Test Models',stats:{},composition:{quantity:{min:1,max:3}}},'unit'),entity('leader','PROFILE',{name:'Test Leader',stats:{}},'unit'),
  entity('other-unit','DATASHEET',{title:'Other Squad',profileIds:['foreign'],weaponIds:[],keywords:[],factionKeywords:[],ruleReferenceIds:[]}),
  entity('foreign','PROFILE',{name:'Test Model',stats:{}},'other-unit'),entity('gun','WEAPON_PROFILE',{name:'Gun',stats:{}},'unit')]};
};
const header='+ DETACHMENT: Test Detachment\n';let assertions=0;
for(const bookId of books){
 const book=make(bookId),service=createRosterImportService(book,{}),text=header+'3x Test Squad (999 pts)\n• 2x Test Model: 2 with Gun\n• 1x Test Leader: Gun';
 const result=service.import(text);assert.equal(result.status,'READY');assert.deepEqual(result.roster.units[0].modelRows.map(r=>[r.canonicalProfileId,r.quantity]),[['regular',2],['leader',1]]);
 const profiles=formRoster(book,result.roster).units[0].profiles;assert.equal(profiles.find(r=>r.canonicalProfileId==='regular').weapons[0].physicalQuantity,2);
 const snapshot=service.snapshot();service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.snapshot(),snapshot);assert.equal(service.import(text).status,'READY');assert.deepEqual(service.snapshot(),snapshot);
 const repeated=service.import(text+'\n3x Test Squad (999 pts)\n• 2x Test Model: 2 with Gun\n• 1x Test Leader: Gun');assert.equal(repeated.status,'READY');
 assert.equal(repeated.roster.units.length,2);assert.notEqual(repeated.roster.units[0].modelRows[0].rowId,repeated.roster.units[1].modelRows[0].rowId);
 const saved=service.snapshot(),foreign=service.import(text,{profiles:{'parsed-unit-1/model-row/1':'foreign'}});assert.equal(foreign.status,'INVALID');assert.deepEqual(service.snapshot(),saved);
 const unknown=service.import(text.replace('2x Test Model','2x Unknown Model'));assert.equal(unknown.status,'NEEDS_BINDINGS');assert.deepEqual(service.snapshot(),saved);
 const grouped=service.import(header+'3x Test Squad (999 pts): 3 with Gun');assert.equal(grouped.status,'NEEDS_BINDINGS');assert.equal(grouped.needsBindings.find(r=>r.kind==='PROFILE').candidateIds.length,2);
 const singularBook=make(bookId);singularBook.entities.find(r=>r.id==='regular').data.name='Test Model';const singular=createRosterImportService(singularBook,{}).import(header+'1x Test Squad (999 pts)\n• 1x Test Models: Gun');assert.equal(singular.status,'READY');assert.equal(singular.roster.units[0].modelRows[0].canonicalProfileId,'regular');
 const properBook=make(bookId);properBook.entities.find(r=>r.id==='regular').data={name:'Named Minervas',stats:{},composition:{quantity:{min:1,max:1}}};const proper=createRosterImportService(properBook,{}).import(header+'1x Test Squad (999 pts)\n• 1x Named Minerva: Gun');assert.equal(proper.status,'NEEDS_BINDINGS');
 const exactBook=make(bookId);exactBook.entities.find(r=>r.id==='leader').data.name='Test Model';
 const exact=createRosterImportService(exactBook,{}).import(header+'1x Test Squad (999 pts)\n• 1x Test Model: Gun');assert.equal(exact.status,'READY');assert.equal(exact.roster.units[0].modelRows[0].canonicalProfileId,'leader');
 const collisionBook=make(bookId);collisionBook.entities.find(r=>r.id==='leader').data.name='Test Models';collisionBook.entities.find(r=>r.id==='leader').data.composition={quantity:{min:1,max:3}};
 const collision=createRosterImportService(collisionBook,{}).import(header+'1x Test Squad (999 pts)\n• 1x Test Model: Gun');assert.equal(collision.status,'NEEDS_BINDINGS');assert.equal(collision.needsBindings.find(r=>r.kind==='PROFILE').candidateIds.length,2);
 const aliasBook=make(bookId);aliasBook.entities.find(r=>r.id==='leader').aliases=['Test Model'];
 const alias=createRosterImportService(aliasBook,{}).import(header+'1x Test Squad (999 pts)\n• 1x Test Model: Gun');assert.equal(alias.status,'READY');assert.equal(alias.roster.units[0].modelRows[0].canonicalProfileId,'leader');assertions+=24;
}
for(const label of ['Terminus','Chassis','Crisis'])assert.deepEqual(importModelLabelCandidates([{label}],label.slice(0,-1),r=>[r.label]),[]);
assertions+=3;
// Native source-owned proper name: this is a shared identity diagnostic,
// not certification of a complete Wardens roster or its separate importer gap.
const sm=JSON.parse(fs.readFileSync(new URL('../../space-marines/v2/generated/roster-import.json',import.meta.url),'utf8'));
const namedProfile=sm.entities.find(row=>row.id==='model-sm-c8cf0383f7ad4a77');
assert.equal(namedProfile.data.name,'Aemelia Minervas');
const composition=sm.importBindings.compositions.find(row=>row.profileId===namedProfile.id);
assert.deepEqual(composition.quantity,{min:1,max:1});
const diagnostic='+ DETACHMENT: Tactical Brethren\n1x Wardens of Ultramar (999 pts)\n• 1x Aemelia Minerva';
const wrongName=importNewRecruit(diagnostic,{parse,book:sm});
assert.equal(wrongName.status,'NEEDS_BINDINGS');
assert.ok(wrongName.needsBindings.some(row=>row.kind==='PROFILE'));
const correctName=importNewRecruit(diagnostic.replace('Aemelia Minerva','Aemelia Minervas'),{parse,book:sm});
assert.equal(correctName.status,'READY');
assert.equal(correctName.roster.units[0].modelRows[0].canonicalProfileId,namedProfile.id);
assertions+=6;
console.log(JSON.stringify({status:'PASS',books:books.length,assertions,scope:'regular -s/-ies MODEL spelling with source-backed plural quantity, exact canonical UNIT declaration only',limitations:'No irregular inflection, token deletion, cross-owner title joins or source aliases invented'}));
