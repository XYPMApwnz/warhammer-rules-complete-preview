/** Existing targeted book QA pattern. All rosters here are constructed physical
 * diagnostic snapshots; no real New Recruit export is claimed. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createSpaceMarinesPaidOptionBindings} from './roster-paid-option-bindings-build.mjs';
import {projectSpaceMarinesPaidOptions} from './roster-paid-options.mjs';

const clone=structuredClone,facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
const catalog=createEffectiveMfmCatalog().catalog,bindings=createSpaceMarinesPaidOptionBindings(),index=new Map(facts.entities.map(row=>[row.id,row]));
// Numeric/source owner expectations transcribed independently from accepted
// official hydrated DOM. No values are read from the production price result.
const expected=[
 ['mfm-paid-upgrade-1d8e8976d73dd2f9','IMPULSOR','per Orbital Comms Array',10],
 ['mfm-paid-upgrade-2dcc41d973fb7e5a','DESOLATION SQUAD','per Vengor Launcher',5],
 ['mfm-paid-upgrade-49288d49d083d7cb','TERMINATOR SQUAD','per Cyclone Missile Launcher',10],
 ['mfm-paid-upgrade-5acd905379273046','VICTRIX HONOUR GUARD','per Banner of Macragge',15],
 ['mfm-paid-upgrade-77bc7dc58d636b7a','INVADER ATVS','per Multi-melta',5],
 ['mfm-paid-upgrade-ccbd208631bacc48','REDEMPTOR DREADNOUGHT','per Macro plasma incinerator',10],
 ['mfm-paid-upgrade-f0d7680f02efab10','REPULSOR EXECUTIONER','per Heavy Laser Destroyer',10],
 ['mfm-paid-upgrade-fe9bdd5878ada46f','TERMINATOR ASSAULT SQUAD','per Storm Shield',5]
];
const python='C:/Users/denis/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const raw=spawnSync(python,['-X','utf8','-c',`import json,sys
from lxml import html
f=json.load(sys.stdin);t=html.parse(f['mfm']);out=[]
for id,owner,label,price in f['expected']:
 nodes=t.xpath('//li[span[text()=$label]]',label=label)
 assert len(nodes)==1,(id,'ambiguous paid row')
 n=nodes[0];card=n.xpath('ancestor::div[contains(@class,"print:break-inside-avoid-page")]')[0]
 assert card.xpath('./div[1]')[0].text_content().strip()==owner,(id,card.text_content())
 spans=n.xpath('./span');assert spans[1].text_content().strip()==str(price)+' pts'
 out.append(id)
s=html.parse(f['army']);proofs=[]
for p in f['proofs']:
 n=s.xpath(p['pointer']);assert len(n)==1,p
 text=' '.join(n[0].text_content().split());quote=' '.join(p['quote'].split()).removeprefix('- ');assert quote in text,(p,text)
 proofs.append(p['id'])
print(json.dumps({'paid':out,'armyProofs':proofs}))`],{
 input:JSON.stringify({expected,mfm:fileURLToPath(new URL('../../../mfm/sources/v1.6/official-mfm-sm-hydrated.html',import.meta.url)),
 army:fileURLToPath(new URL('./sources/raw/wahapedia-datasheets-probe.html',import.meta.url)),
 proofs:bindings.flatMap(row=>[{id:row.sourceId,pointer:row.sourceProvenance.pointer,quote:row.quote},...row.permissions.map(p=>({id:p.id,pointer:p.sourceContentPointer||p.provenance.pointer,quote:p.quote}))])}),encoding:'utf8'});
assert.equal(raw.status,0,raw.stderr);const sourceProof=JSON.parse(raw.stdout);assert.equal(sourceProof.paid.length,8);

const selection=(binding,key='weapon')=>({selectionKey:key,canonicalProfileIds:clone(binding.profileIds),canonicalEquipmentIds:clone(binding.equipmentIds),
 canonicalFieldPaths:Object.fromEntries(binding.equipmentIds.map(id=>[id,['/text']])),physicalQuantity:1,perModelQuantity:1,
 provenance:{source:'CONSTRUCTED_NEW_RECRUIT_COMPATIBLE_DIAGNOSTIC'}});
const unit=(binding,id='U-A',items=[])=>({instanceId:id,canonicalUnitId:binding.ownerUnitId,equipmentContextKnown:true,modelRows:[],selections:items});
const state=units=>({bookId:'space-marines',units});
const project=units=>projectSpaceMarinesPaidOptions(state(units),{bindings});
let assertions=0,negativeControls=0;const rows=[];
for(const [id,title,label,price]of expected){
 const binding=bindings.find(row=>row.costRecordId===id);assert.ok(binding);assert.equal(binding.value,price);assert.equal(binding.provenance.sourceLocator.sourceTitle,title);assert.equal(binding.provenance.sourceLocator.sourceLabel,label);
 let one=project([unit(binding,'U-A',[selection(binding)])]);assert.equal(one.status,'RESOLVED');assert.equal(one.totalPaidPoints,price);assert.equal(one.units[0].options[0].quantity,1);assert.equal(one.units[0].options[0].selections[0].scope.modelScopeId,null);assert.deepEqual(one.units[0].options[0].provenance,binding.provenance);assertions+=5;
 const none=project([unit(binding)]);assert.equal(none.status,'RESOLVED');assert.equal(none.totalPaidPoints,0);assertions+=2;
 const unknown=unit(binding);unknown.equipmentContextKnown=false;const omitted=project([unknown]);assert.equal(omitted.status,'UNRESOLVED');assert.equal(omitted.totalPaidPoints,null);assert.ok(omitted.unresolved.some(row=>row.reason==='PAID_SELECTION_UNKNOWN'));negativeControls++;
 const repeats=project([unit(binding,'U-A',[selection(binding)]),unit(binding,'U-B')]);assert.equal(repeats.totalPaidPoints,price);assert.deepEqual(repeats.units.map(row=>row.totalPaidPoints),[price,0]);assertions+=2;
 const input=state([unit(binding,'U-A',[selection(binding)])]),before=JSON.stringify(input);assert.deepEqual(projectSpaceMarinesPaidOptions(JSON.parse(before),{bindings}),one);assert.equal(JSON.stringify(input),before);assert.deepEqual(projectSpaceMarinesPaidOptions(input,{bindings}),one);assertions+=3;
 const doubled=selection(binding);doubled.physicalQuantity=2;assert.equal(project([unit(binding,'U-A',[doubled])]).totalPaidPoints,price*2);assertions++;
 const model=unit(binding);model.modelRows=[{rowId:'R1',canonicalProfileId:index.get(binding.ownerUnitId).data.profileIds[0],quantity:1,selections:[selection(binding)]}];const owner=project([model]);assert.equal(owner.totalPaidPoints,price);assert.ok(owner.units[0].options[0].selections[0].scope.modelScopeId.endsWith('/PROFILE/R1'));assertions+=2;
 const loadout=unit(binding,'LOADOUT');loadout.modelRows=[{rowId:'GROUP',quantity:3,selections:[],loadouts:[{loadoutId:'SELECTED',quantity:1,selections:[selection(binding)]},{loadoutId:'OTHER',quantity:2,selections:[]}]}];
 const precise=project([loadout]);assert.equal(precise.totalPaidPoints,price);assert.ok(precise.units[0].options[0].selections[0].scope.modelScopeId.endsWith('/LOADOUT/SELECTED'));assertions+=2;
 const inherited=unit(binding,'INHERITED');const inheritedSelection=selection(binding);inheritedSelection.physicalQuantity=3;
 inherited.modelRows=[{rowId:'GROUP',quantity:3,selections:[inheritedSelection],loadouts:[{loadoutId:'SUBGROUP',quantity:1,selections:[]}]}];
 assert.equal(project([inherited]).totalPaidPoints,price*3,'Inherited row selection is counted once, not repeated in its loadouts');assertions++;
 const wrong=unit(binding,'WRONG',[selection(binding)]);wrong.canonicalUnitId=bindings.find(row=>row.ownerUnitId!==binding.ownerUnitId).ownerUnitId;assert.equal(project([wrong]).status,'UNRESOLVED');negativeControls++;
 const permission=unit(binding,'PERMISSION',[{selectionKey:'permit',canonicalProfileIds:[],canonicalEquipmentIds:binding.permissionIds,physicalQuantity:1}]);assert.equal(project([permission]).totalPaidPoints,0);assertions++;
 const duplicate=unit(binding,'DUPE',[selection(binding),selection(binding)]);assert.equal(project([duplicate]).totalPaidPoints,null);negativeControls++;
 const badQuantity=selection(binding);delete badQuantity.physicalQuantity;assert.equal(project([unit(binding,'Q',[badQuantity])]).totalPaidPoints,null);negativeControls++;
 if(binding.equipmentIds.length){const noField=selection(binding);delete noField.canonicalFieldPaths;assert.equal(project([unit(binding,'F',[noField])]).totalPaidPoints,null);negativeControls++;}
 if(binding.profileIds.length>1){const [first,second]=binding.profileIds;const a=selection(binding,'mode-a'),b=selection(binding,'mode-b');a.canonicalProfileIds=[first];b.canonicalProfileIds=[second];assert.equal(project([unit(binding,'ALT',[a,b])]).totalPaidPoints,null);negativeControls++;
  const split=unit(binding,'SPLIT');split.modelRows=[{rowId:'R1',selections:[a]},{rowId:'R2',selections:[b]}];assert.equal(project([split]).totalPaidPoints,price*2);assertions++;}
 rows.push({costRecordId:id,sourceOwner:title,sourceLabel:label,expectedPrice:price,selected:'PASS',unselected:'PASS',unknownInventory:'UNRESOLVED',repeated:'PASS',reimport:'PASS',modelAndAggregate:'PASS'});
}
// Focused mutation guards fail against independent RAW/source invariants.
let mutations=0;
for(const [id]of expected){const bad=clone(catalog);bad.paidUpgradeRecords.find(row=>row.id===id).value+=1;assert.throws(()=>createSpaceMarinesPaidOptionBindings({catalog:bad}),/Paid price differs/);mutations++;}
for(const mutation of [
 f=>{f.entities.find(row=>row.id===bindings[0].sourceId).parentId=bindings[1].ownerUnitId;},
 f=>{f.entities.find(row=>row.id===bindings[1].sourceId).data.name='wrong weapon';},
 f=>{f.entities=f.entities.filter(row=>row.id!==bindings[2].profileIds[1]);},
 f=>{f.entities.find(row=>row.id===bindings[3].permissionIds[0]).data.text='missing source equipment';}
]){const bad=clone(facts);mutation(bad);assert.throws(()=>createSpaceMarinesPaidOptionBindings({facts:bad}));mutations++;}
const output={status:'PASS',paidOptions:rows,sourceDomProofs:sourceProof,positiveAssertions:assertions,negativeControls,mutationControls:mutations,
 realNewRecruitExportTested:false,unknownModelBearer:'INVENTORY_AND_COST_PRESERVED_MODEL_NOT_INVENTED',numericOwner:'CENTRALIZED_MFM',basePointsIncluded:false,enhancementPointsIncluded:false};
console.log(JSON.stringify(output,null,2));
