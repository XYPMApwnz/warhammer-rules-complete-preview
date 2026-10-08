import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolveOwnedFact} from './mfm-boundary.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {buildRelatedRules} from './related-rules-build.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {buildGlossaryProjection} from './glossary-build.mjs';
import {buildDatasheetReferenceBindings} from './presentation-reference-build.mjs';
import {buildDatasheetPresentation} from '../../shared/army-book-app-v2/datasheet-v1.mjs';
import {projectBookPresentation} from '../../shared/army-book-app-v2/book-v1-projection.mjs';

export function readAppInputs() {
  // The effective Rule Contract snapshot already contains the complete Effective Book.
  const model=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
  const ids=new Set();
  for (const key of ['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings']) for (const b of model.mfm[key]) ids.add(b.mfmRecordId);
  for (const r of model.mfm.relations) if (r.mfmRecordId) ids.add(r.mfmRecordId);
  const records=new Map();
  for (const id of ids) {
    const record=resolveOwnedFact(id);records.set(id,record);
    for (const child of [...(record.qualifierIds||[]),...(record.enhancementCostIds||[])]) ids.add(child);
  }
  const artwork=JSON.parse(fs.readFileSync(new URL('../presentation/unit-images.json',import.meta.url),'utf8'));
  const datasheetBindings=JSON.parse(fs.readFileSync(new URL('./normal-datasheet-bindings.json',import.meta.url),'utf8'));
  return {model,records,coreCatalog:createEffectiveCoreCatalog(),artwork,datasheetBindings};
}
export function buildApp(inputs=readAppInputs()) {
  const payload=projectArmyBook(inputs.model,inputs.records,{title:'Death Guard',edition:'11th Edition'});
  // Recompile from the same factual snapshot. A generated index never owns facts.
  payload.relatedRules=buildRelatedRules(inputs.model);
  const glossary=buildGlossaryProjection(inputs.model,inputs.coreCatalog || createEffectiveCoreCatalog());
  payload.cards.push(...glossary.coreCards);
  payload.glossary=glossary.index;
  payload.datasheetPresentation=buildDatasheetPresentation(inputs.model,inputs.artwork || JSON.parse(fs.readFileSync(new URL('../presentation/unit-images.json',import.meta.url),'utf8')),
    {bindings:inputs.datasheetBindings,records:inputs.records});
  payload.datasheetPresentation.referenceBindings=buildDatasheetReferenceBindings(payload.cards);
  payload.bookPresentation=projectBookPresentation(inputs.model,inputs.records);
  payload.bookPresentation.coverImage='../../../assets/death-guard-cover.jpg';
  return payload;
}
export function writeApp({check=false}={}) {
  const payload=buildApp();
  const output=new Map([['./generated/app-presentation.json',JSON.stringify(payload,null,2)+'\n'],['./app.html',`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Guard · Army Book V2</title><link rel="stylesheet" href="../../shared/army-book-app-v2/styles.css"><link rel="stylesheet" href="../../shared/army-book-app-v2/datasheet-v1.css"><link rel="stylesheet" href="../../shared/army-book-app-v2/book-v1.css"></head>
<body><p role="status">Loading Army Book…</p><script type="module">
import {mount} from '../../shared/army-book-app-v2/runtime.mjs';
import {createBrowserRoster} from './roster-boot.mjs';
const response=await fetch('./generated/app-presentation.json');
if (!response.ok) throw new Error('Army Book payload unavailable');
mount(document,await response.json(),{roster:await createBrowserRoster()});
</script></body></html>\n`]]);
  for (const [file,value] of output) {
    const location=new URL(file,import.meta.url);
    if (check) {if (fs.readFileSync(location,'utf8')!==value) throw new Error(`Stale Army Book App output: ${file}`);}
    else fs.writeFileSync(location,value);
  }
  return payload;
}
if (process.argv[1]===fileURLToPath(import.meta.url)) {const p=writeApp({check:process.argv.includes('--check')});console.log(JSON.stringify({status:'PASS',cards:p.cards.length,facts:p.factManifest.length}));}
