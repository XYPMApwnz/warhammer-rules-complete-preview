/** Public membership is native registration, not retired HTML/link inventories. */
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {armyBooks} from '../v2/army-books.mjs';
import {loadPublicationInventory,selectArmyBookBuildBooks,selectFreshnessOnlyBooks,selectPublicationBooks,validatePublicationInventory} from '../books/shared/tools/publication-inventory.mjs';
import {validateRuntimeManifest} from '../tools/pages-runtime-package.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),inventory=loadPublicationInventory({root}),supported=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
const exact=(actual,label)=>{assert.equal(actual.length,new Set(actual).size,label+' duplicates');assert.deepEqual(actual.slice().sort(),supported.slice().sort(),label+' owner set');};
for(const field of ['library','offline'])exact(selectPublicationBooks(inventory,field).map(b=>b.id),field);
exact(armyBooks.map(b=>b.id),'V2 registry');exact(selectArmyBookBuildBooks(inventory).map(b=>b.id),'native build selection');assert.deepEqual(selectFreshnessOnlyBooks(inventory).map(b=>b.id),['orks']);assert.deepEqual(selectPublicationBooks(inventory,'mobile'),[],'Old mobile stubs are not responsive V2 publication');
const orks=inventory.books.find(b=>b.id==='orks');assert.equal(orks.library,false);assert.equal(orks.offline,false);assert.equal(orks.mobile,false);assert.equal(orks.freshness,true);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'),'utf8')),allowed=validateRuntimeManifest(manifest);for(const id of supported){assert(allowed.has(`books/${id}/v2/registration.mjs`));assert(allowed.has(`books/${id}/v2/generated/app-presentation.json`));}assert(![...allowed].some(p=>p.startsWith('books/orks/')),'Orks cannot enter actual runtime');assert(![...allowed].some(p=>p.startsWith('roster-guides/')||/^books\/[^/]+\/(?:reader|index)\.html$/.test(p)),'Legacy UI publication survived');
assert.throws(()=>exact(supported.slice(1),'missing'),/owner set/);assert.throws(()=>exact([...supported,'orks'],'foreign'),/owner set/);
const missing=structuredClone(inventory);missing.books=missing.books.filter(b=>b.id!=='orks');assert.match(validatePublicationInventory({root,inventory:missing}).join('\n'),/missing=orks/);
for(const field of ['offline','mobile']){const copy=structuredClone(inventory);copy.books.find(b=>b.id==='orks')[field]=true;assert.match(validatePublicationInventory({root,inventory:copy}).join('\n'),/requires library publication/);}
const dup=structuredClone(inventory);dup.books.push(structuredClone(dup.books[0]));assert.match(validatePublicationInventory({root,inventory:dup}).join('\n'),/Duplicate publication IDs/);
console.log(JSON.stringify({status:'PASS',configured:inventory.books.length,published:supported.length,responsiveMobile:'native V2',legacyMobileRoutes:0,orks:'freshness-only'}));
