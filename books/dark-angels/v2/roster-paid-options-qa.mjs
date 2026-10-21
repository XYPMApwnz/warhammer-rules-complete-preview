/** Constructed physical diagnostics; expectations come from accepted RAW. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createDarkAngelsPaidOptionBindings} from './roster-paid-option-bindings-build.mjs';
import {projectDarkAngelsPaidOptions} from './roster-paid-options.mjs';

const clone=structuredClone,bindings=createDarkAngelsPaidOptionBindings();
const expected=[
 ['mfm-paid-upgrade-1d8e8976d73dd2f9','IMPULSOR','per Orbital Comms Array',10,'space-marines'],
 ['mfm-paid-upgrade-2dcc41d973fb7e5a','DESOLATION SQUAD','per Vengor Launcher',5,'space-marines'],
 ['mfm-paid-upgrade-49288d49d083d7cb','TERMINATOR SQUAD','per Cyclone Missile Launcher',10,'space-marines'],
 ['mfm-paid-upgrade-77bc7dc58d636b7a','INVADER ATVS','per Multi-melta',5,'space-marines'],
 ['mfm-paid-upgrade-ccbd208631bacc48','REDEMPTOR DREADNOUGHT','per Macro plasma incinerator',10,'space-marines'],
 ['mfm-paid-upgrade-f0d7680f02efab10','REPULSOR EXECUTIONER','per Heavy Laser Destroyer',10,'space-marines'],
 ['mfm-paid-upgrade-fe9bdd5878ada46f','TERMINATOR ASSAULT SQUAD','per Storm Shield',5,'space-marines'],
 ['mfm-paid-upgrade-3c211afc5aea6e89','DEATHWING TERMINATOR SQUAD','per Cyclone Missile Launcher',10,'dark-angels']
];
assert.deepEqual(bindings.map(row=>row.costRecordId).sort(),expected.map(row=>row[0]).sort());
assert.ok(!bindings.some(row=>row.costRecordId==='mfm-paid-upgrade-5acd905379273046'),'Foreign Chapter paid equipment admitted');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const python='C:/Users/denis/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const proof=spawnSync(python,['-X','utf8','-c',`import json,sys
from pathlib import Path
from lxml import html
v=json.load(sys.stdin);root=Path(v['root']);out=[]
paths={'space-marines':'mfm/sources/v1.6/official-mfm-sm-hydrated.html','dark-angels':'books/dark-angels/v2/sources/raw/mfm-da-hydrated.html'}
trees={k:html.parse(str(root/p)) for k,p in paths.items()}
for id,owner,label,price,faction in v['expected']:
 t=trees[faction];matches=[]
 for n in t.xpath('//li[span[text()=$label]]',label=label):
  cards=n.xpath('ancestor::div[contains(@class,"print:break-inside-avoid-page")]')
  if cards and cards[0].xpath('./div[1]')[0].text_content().strip()==owner:matches.append(n)
 assert len(matches)==1,(owner,'ambiguous owner/option')
 n=matches[0];assert n.xpath('./span')[1].text_content().strip()==str(price)+' pts'
 out.append({'costRecordId':id,'owner':owner,'expectedPrice':price,'document':paths[faction],'pointer':t.getpath(n)})
for p in v['nativeProofs']:
 t=html.parse(str(root/p['document']));nodes=t.xpath(p['pointer']);assert len(nodes)==1,p
 text=' '.join(nodes[0].text_content().split());assert ' '.join(p['quote'].split()) in text,(p,text)
print(json.dumps(out))`],{input:JSON.stringify({root:repo,expected,nativeProofs:bindings.flatMap(row=>[
 {document:row.sourceProvenance.document,pointer:row.sourceProvenance.pointer,quote:row.quote},
 ...row.permissions.map(p=>({document:p.provenance.document,pointer:p.sourceContentPointer||p.provenance.pointer,quote:p.quote.replace(/^- /,'')}))])}),encoding:'utf8'});
assert.equal(proof.status,0,proof.stderr);const sourceProofs=JSON.parse(proof.stdout);assert.equal(sourceProofs.length,8);

const selection=(b,key='P')=>({selectionKey:key,physicalQuantity:1,perModelQuantity:1,
 canonicalProfileIds:clone(b.profileIds),canonicalEquipmentIds:clone(b.equipmentIds),
 canonicalFieldPaths:Object.fromEntries(b.equipmentIds.map(id=>[id,['/text']])),
 provenance:{source:'CONSTRUCTED_DIAGNOSTIC_NOT_REAL_NEW_RECRUIT_EXPORT'}});
const unit=(b,id='A',items=[])=>({instanceId:id,canonicalUnitId:b.ownerUnitId,equipmentContextKnown:true,modelRows:[],selections:items});
const state=units=>({bookId:'dark-angels',units});
const project=units=>projectDarkAngelsPaidOptions(state(units),{bindings});
let positive=0,negative=0,mutations=0;const cases=[];
for(const [id,title,label,price,owner]of expected){
 const b=bindings.find(row=>row.costRecordId===id);
 assert.equal(b.value,price);assert.equal(b.provenance.sourceLocator.sourceTitle,title);
 assert.equal(b.provenance.sourceLocator.sourceLabel,label);assert.equal(b.provenance.sourceId,owner+'-mfm-v1.6');
 const original=state([unit(b,'A',[selection(b)])]),serialized=JSON.stringify(original);
 const one=project(original.units);assert.equal(one.status,'RESOLVED');assert.equal(one.totalPaidPoints,price);
 assert.equal(one.units[0].options[0].quantity,1);assert.equal(one.units[0].options[0].selections[0].scope.modelScopeId,null);
 assert.deepEqual(one.units[0].options[0].provenance,b.provenance);positive++;
 const none=project([unit(b)]);assert.equal(none.totalPaidPoints,0);assert.equal(none.status,'RESOLVED');positive++;
 const unknown=unit(b);unknown.equipmentContextKnown=false;
 const missing=project([unknown]);assert.equal(missing.status,'UNRESOLVED');assert.equal(missing.totalPaidPoints,null);negative++;
 const omitted=unit(b);delete omitted.equipmentContextKnown;assert.equal(project([omitted]).totalPaidPoints,null);negative++;
 const two=selection(b);two.physicalQuantity=2;assert.equal(project([unit(b,'TWO',[two])]).totalPaidPoints,price*2);positive++;
 const repeated=project([unit(b,'A',[selection(b)]),unit(b,'B')]);assert.deepEqual(repeated.units.map(row=>row.totalPaidPoints),[price,0]);positive++;
 assert.deepEqual(project(JSON.parse(serialized).units),one);assert.deepEqual(project(original.units),one);assert.equal(JSON.stringify(original),serialized);positive++;
 const badQuantity=selection(b);delete badQuantity.physicalQuantity;
 assert.equal(project([unit(b,'BAD-Q',[badQuantity])]).totalPaidPoints,null);negative++;
 const badId=selection(b);delete badId.selectionKey;assert.equal(project([unit(b,'BAD-ID',[badId])]).totalPaidPoints,null);negative++;
 assert.equal(project([unit(b,'DUP',[selection(b),selection(b)])]).totalPaidPoints,null);negative++;
 const wrong=unit(b,'WRONG',[selection(b)]);wrong.canonicalUnitId=bindings.find(row=>row.ownerUnitId!==b.ownerUnitId).ownerUnitId;
 assert.equal(project([wrong]).totalPaidPoints,null);negative++;
 const permission={selectionKey:'PERMISSION',physicalQuantity:1,canonicalProfileIds:[],canonicalEquipmentIds:b.permissionIds};
 assert.equal(project([unit(b,'PERMISSION',[permission])]).totalPaidPoints,0);positive++;
 const model=unit(b,'MODEL');model.modelRows=[{rowId:'ROW',quantity:1,selections:[selection(b)]}];
 assert.equal(project([model]).totalPaidPoints,price);assert.ok(project([model]).units[0].options[0].selections[0].scope.modelScopeId.endsWith('/PROFILE/ROW'));positive++;
 const loadout=unit(b,'LOADOUT');loadout.modelRows=[{rowId:'ROW',quantity:3,selections:[],loadouts:[{loadoutId:'YES',quantity:1,selections:[selection(b)]},{loadoutId:'NO',quantity:2,selections:[]}]}];
 assert.equal(project([loadout]).totalPaidPoints,price);positive++;
 if(b.equipmentIds.length){const noField=selection(b);delete noField.canonicalFieldPaths;
  assert.equal(project([unit(b,'FIELD',[noField])]).totalPaidPoints,null);negative++;}
 if(b.profileIds.length>1){
  const a=selection(b,'A'),c=selection(b,'C');a.canonicalProfileIds=[b.profileIds[0]];c.canonicalProfileIds=[b.profileIds[1]];
  assert.equal(project([unit(b,'ALT',[a,c])]).totalPaidPoints,null);negative++;
  const split=unit(b,'SPLIT');split.modelRows=[{rowId:'A',selections:[a]},{rowId:'C',selections:[c]}];
  assert.equal(project([split]).totalPaidPoints,price*2);positive++;
 }
 cases.push({costRecordId:id,sourceOwner:owner,sourceUnit:title,expectedPrice:price,status:'PASS'});
}
assert.throws(()=>projectDarkAngelsPaidOptions({bookId:'space-marines',units:[]},{bindings}));negative++;
const catalog=createEffectiveMfmCatalog().catalog;
for(const [id]of expected){const bad=clone(catalog);bad.paidUpgradeRecords.find(row=>row.id===id).value+=1;
 assert.throws(()=>createDarkAngelsPaidOptionBindings({catalog:bad}));mutations++;}
const nativeFacts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
for(const corrupt of [
 f=>{f.entities.find(row=>row.id==='weapon-da-f42a813127b24522bedd').parentId='unit-not-proven';},
 f=>{f.entities.find(row=>row.id==='wargear-da-84b413422f4243e79aba').data.text='Missing replacement';},
 f=>{f.entities=f.entities.filter(row=>row.id!=='weapon-da-9dbed74da29b40e0a872');}
]){const bad=clone(nativeFacts);corrupt(bad);assert.throws(()=>createDarkAngelsPaidOptionBindings({facts:bad}));mutations++;}
console.log(JSON.stringify({status:'PASS',paidOptions:cases,officialSourceProofs:sourceProofs,
 positiveControls:positive,negativeControls:negative,mutationControls:mutations,
 realNewRecruitExportTested:false,unknownBearer:'UNIT_INVENTORY_PRICED_WITHOUT_INVENTED_MODEL',
 numericOwner:'CENTRALIZED_MFM',includesBaseOrEnhancementPoints:false},null,2));
