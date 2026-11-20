/** Header notices are separate from native import admission and saved state. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from '../roster-v2/parser.mjs';
import {lexicalDraft} from '../roster-v2/import.mjs';
import {importRosterNotices} from './import-notices.mjs';
import {importNoticeCopy} from './cosmetics.mjs';
import {projectCoreBattleSizes} from '../application-v2/source-metadata.mjs';
import {assertPlayerImportCopy} from '../../../tests/helpers/import-copy-assertions.mjs';

const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const core=read('../../core-rules/content/core-rules.digital-11e.json');
const rule=core.records.find(row=>row.code==='25.03'),battleSizes=projectCoreBattleSizes(rule);
assert.deepEqual(battleSizes,[{label:'INCURSION',pointsLimit:1000,detachmentPoints:2},
  {label:'STRIKE FORCE',pointsLimit:2000,detachmentPoints:3}]);
const notices=[];
const context=book=>{
  const payload=read(`../../${book}/v2/generated/app-presentation.json`),cards=new Map(payload.cards.map(card=>[card.id,card]));
  const entities=payload.cards.filter(card=>card.kind==='DETACHMENT').map(card=>({id:card.id,kind:card.kind,data:{title:card.title}}));
  const forceDispositions=[...new Set(Object.values(payload.bookPresentation.records).flatMap(row=>(row.forceDispositions||[]).map(field=>field.displayValue??field.value)))];
  return {cards,bookPresentation:payload.bookPresentation,battleSizes,book:{entities,importHeaderContext:{forceDispositions}}};
};
const dg=context('death-guard'),owner=fs.readFileSync(new URL('../../../v2/fixtures/new-recruit-v37.25-owner-death-guard.txt',import.meta.url),'utf8');
const metadata=lexicalDraft(owner,parse,dg.book).metadata;
const state={detachmentIds:['detachment-shamblerot-vectorium','detachment-virulent-vectorium']};
const input={...dg,metadata,state},before=structuredClone(input),ownerNotices=importRosterNotices(input);
assert.deepEqual(ownerNotices,[{kind:'DETACHMENT_POINTS_OVER_BATTLE_SIZE',total:5,limit:3,battleSize:'Strike Force'}]);
assert.deepEqual(input,before,'The projection must not modify roster, metadata, prices or memberships');
assert.match(importNoticeCopy.detachmentPoints(ownerNotices[0]),/5 DP.*Strike Force.*3 DP/);
notices.push(...ownerNotices);
// DISRUPTION belongs to the first selected Detachment; union membership must
// suppress the warning even though it does not belong to the second.
const mismatch=importRosterNotices({...input,state:{detachmentIds:['detachment-virulent-vectorium']}});
assert.deepEqual(mismatch,[{kind:'FORCE_DISPOSITION_NOT_SELECTED',disposition:'Disruption'}]);notices.push(...mismatch);
assert.deepEqual(importRosterNotices({...input,metadata:{...metadata,plainHeader:{...metadata.plainHeader,detachmentPoints:999}}}),ownerNotices,
  'Header-declared DP never replaces the book-owned Detachment prices');
const threeLines=owner.replace('Disruption\nStrike Force (2,000 Points)\n','');
assert.deepEqual(importRosterNotices({...input,metadata:lexicalDraft(threeLines,parse,dg.book).metadata}),[],
  'An existing three-line header supplies no guessed battle size or Force Disposition');
for(const patch of [{metadata:null},{metadata:{...metadata,plainHeader:undefined}},
  {metadata:{...metadata,pointsLimit:1000}},{battleSizes:[]},{state:{detachmentIds:['missing']}},
  {bookPresentation:null},{cards:new Map()}])assert.deepEqual(importRosterNotices({...input,...patch}),[]);
assert.deepEqual(importRosterNotices({...input,metadata:{...metadata,battleSize:'Incursion',pointsLimit:1000,disposition:'—'},
  state:{detachmentIds:['detachment-virulent-vectorium']}}),
  [{kind:'DETACHMENT_POINTS_OVER_BATTLE_SIZE',total:3,limit:2,battleSize:'Incursion'}],
  'This note compares table values and makes no legality claim about Core exceptions');
assert.deepEqual(importRosterNotices({...input,metadata:{...metadata,disposition:'Unknown Force Disposition'}}),ownerNotices);
// A changed source table must change the note. The UI owns no DP constants.
const changedRule=structuredClone(rule),table=changedRule.content.find(row=>row.type==='comparison-table');
table.rows.find(row=>row.label==='STRIKE FORCE').cells[table.columns.indexOf('Detachment Points (DP)')-1]='6';
assert.deepEqual(importRosterNotices({...input,battleSizes:projectCoreBattleSizes(changedRule)}),[]);
// The other declared producer shape owns exact relation labels rather than
// Force Disposition IDs. Its existing field paths still require proof.
const namedInput=structuredClone(input);
for(const record of Object.values(namedInput.bookPresentation.records).filter(row=>row.kind==='DETACHMENT')){
  const card=namedInput.cards.get(record.pointRecordId);card.kind='DETACHMENT_ROSTER_METADATA';
  for(const [index,field]of record.forceDispositions.entries()){
    const owned=card.fields.find(row=>row.id===field.id),path=`/forceDispositions/${index}`;
    for(const row of [owned,field]){row.id=`${record.pointRecordId}::${path}`;row.source.path=path;row.value=field.displayValue;}
    delete field.displayValue;
  }
}
assert.deepEqual(importRosterNotices(namedInput),ownerNotices,'Both enrolled point-owner shapes preserve the same notice');
assert.deepEqual(importRosterNotices({...namedInput,state:{detachmentIds:['detachment-virulent-vectorium']}}),mismatch,
  'Exact named relations also check membership across the selected Detachments');
// Each accepted/derived plain-header fixture keeps its own explicit selected
// identities; notice projection neither parses a second book nor imports units.
const fixtures=read('../../../v2/fixtures/new-recruit-plain-header-v37.25.json'),cases=[];
if(!process.argv.includes('--owner-only'))for(const fixture of fixtures.derived){
  const contextForBook=fixture.bookId==='death-guard'?dg:context(fixture.bookId);
  const draft=lexicalDraft(fixture.plainText,parse,contextForBook.book),fixtureState={detachmentIds:fixture.expectedDetachmentIds};
  const args={...contextForBook,metadata:draft.metadata,state:fixtureState},original=structuredClone(args);
  const result=importRosterNotices(args);assert.deepEqual(args,original);
  assert(draft.metadata.plainHeader,'The established fixture remains a recognized plain header');
  const selected=fixture.expectedDetachmentIds.map(id=>contextForBook.bookPresentation.records[id]);
  const ownedPrices=selected.map(record=>contextForBook.cards.get(record.pointRecordId).fields.find(field=>field.source.path==='/detachmentPoints').value);
  const total=ownedPrices.reduce((sum,value)=>sum+value,0);
  const hasMember=selected.some(record=>record.forceDispositions.some(field=>
    (field.displayValue??field.value).toUpperCase()===fixture.disposition.toUpperCase()));
  const expected=[];
  if(total>3)expected.push({kind:'DETACHMENT_POINTS_OVER_BATTLE_SIZE',total,limit:3,battleSize:'Strike Force'});
  if(!hasMember)expected.push({kind:'FORCE_DISPOSITION_NOT_SELECTED',disposition:fixture.disposition});
  assert.deepEqual(result,expected,fixture.bookId+': independent direct source price/membership expectation');
  const ownerKinds=selected.map(record=>contextForBook.cards.get(record.pointRecordId).kind);
  assert(ownerKinds.every(kind=>kind===(fixture.bookId==='chaos-space-marines'?'DETACHMENT_ROSTER_METADATA':'MFM_DETACHMENT')),
    'The expected enrolled source shapes remain explicit');
  assert(importRosterNotices({...args,battleSizes:battleSizes.map(row=>({...row,detachmentPoints:0}))})
    .some(row=>row.kind==='DETACHMENT_POINTS_OVER_BATTLE_SIZE'),fixture.bookId+': each selected source-owned DP price is consumed');
  cases.push({book:fixture.bookId,ownerKinds,total,sourceMembership:hasMember,notices:result});notices.push(...result);
}
assertPlayerImportCopy(notices.map(notice=>({location:'import header note',
  text:importNoticeCopy[notice.kind==='DETACHMENT_POINTS_OVER_BATTLE_SIZE'?'detachmentPoints':'forceDisposition'](notice)})));
const runtime=fs.readFileSync(new URL('./runtime.mjs',import.meta.url),'utf8');
if(!process.argv.includes('--owner-only'))assert.doesNotMatch(runtime,/Imported points/,'The T’au summary has the same points label as the other eight books');
console.log(JSON.stringify({status:'PASS',owner:ownerNotices,missingContextControls:8,sourceLimitMutation:true,anySelectedMembership:true,cases}));
