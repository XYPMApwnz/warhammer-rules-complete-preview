import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCoreFactProjection} from '../content/core-fact-projection.mjs';
import {factHash} from '../content/fact-source-bindings.mjs';
import {createReaderPresentation} from '../reader/presentation.mjs';

const bindings=JSON.parse(fs.readFileSync(new URL('../reader/presentation-bindings.json',import.meta.url),'utf8'));
const projection=createCoreFactProjection(),catalog=projection.catalog;
const before=JSON.stringify(catalog.records);
const reader=createReaderPresentation(catalog,bindings);
for(const binding of bindings.appliedErrataPanels){
  const original=catalog.getById(binding.ownerId),display=reader.recordView(original);
  assert.equal(display.text,original.text.slice(0,binding.panel.range[0]).trimEnd());
  assert.deepEqual(display.provenance,original.provenance);
  assert.deepEqual(display.relationships,original.relationships);
  assert(catalog.getById(binding.erratumId).semanticContent,'erratum no longer inspectable');
  let text=original.semanticContent;
  for(const omission of reader.popupData[original.id].omissions){assert.equal(text.slice(...omission.range),omission.expected);text=text.slice(0,omission.range[0])+text.slice(omission.range[1]);}
  assert.equal(text.trimEnd(),display.text);
}
for(const binding of bindings.visualMarkers){
  const original=catalog.getById(binding.ownerId),display=reader.recordView(original);
  assert.equal(display.text,original.text,'icon restoration removed factual text');
  assert.equal(display.inlineMarkers.length,1);
  assert(fs.existsSync(new URL(binding.asset,new URL('../reader/',import.meta.url))),'source-backed icon asset absent');
  const marker=reader.popupData[original.id].markers[0];
  assert.equal(original.semanticContent.slice(...marker.range),marker.expected,'popup marker offset differs from canonical projection');
}
assert.equal(JSON.stringify(catalog.records),before,'reader presentation mutated canonical facts or provenance');

// Non-Core synthetic owner/asset: binding, not wording/title, chooses the marker.
const text='A source-backed statement.',owner={id:'synthetic-rule',text,sourceUnitIds:['synthetic-source'],relationships:{errataIds:[]},provenance:{source:'immutable'}};
const synthetic={getById:id=>id===owner.id?owner:null,presentation:{images:{example:[{file:'existing-marker.png'}]}},sourceUnits:{'synthetic-source':{id:'synthetic-source',occurrences:[{sourceOrder:8,content:{notes:[text]}}]}}};
const declarations={schema:bindings.schema,visualMarkers:[{ownerId:owner.id,text:{path:'/text',range:[0,text.length],hash:factHash(text)},sourceNote:{unitId:'synthetic-source',sourceOrder:8,path:'/content/notes/0'},imagePath:'/example/0',enrolledFile:'existing-marker.png',asset:'../assets/diagrams/existing-marker.webp',alt:'Source marker'}]};
const shown=createReaderPresentation(synthetic,declarations);
assert.equal(shown.recordView(owner).inlineMarkers[0].src,'../assets/diagrams/existing-marker.webp');
assert.equal(shown.recordView(owner).text,text);
for(const mutate of [
  value=>{value.visualMarkers[0].ownerId='unrelated';},
  value=>{value.visualMarkers[0].enrolledFile='invented.png';},
  value=>{value.visualMarkers[0].asset='../assets/diagrams/invented.webp';},
  value=>{value.visualMarkers[0].sourceNote.sourceOrder=9;},
  value=>{value.visualMarkers[0].text.hash='stale';},
  value=>{value.visualMarkers.push(structuredClone(value.visualMarkers[0]));}
]){const changed=structuredClone(declarations);mutate(changed);assert.throws(()=>createReaderPresentation(synthetic,changed));}
const stale=structuredClone(bindings);stale.appliedErrataPanels[0].erratumId=stale.appliedErrataPanels[1].erratumId;
assert.throws(()=>createReaderPresentation(catalog,stale),/relationship/);
const unapplied=structuredClone(bindings);unapplied.appliedErrataPanels[0].effectiveClause=unapplied.appliedErrataPanels[0].panel;
assert.throws(()=>createReaderPresentation(catalog,unapplied),/unapplied/);
console.log('PASS Core reader presentation: source-bound applied errata omissions, inline markers, popup offsets, immutable facts/provenance, generic mutation controls.');
