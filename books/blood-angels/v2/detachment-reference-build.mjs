/** Import membership, not a new factual owner or executable Deathwatch rules. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {buildNativeMfmBook} from '../../space-marines/v2/mfm-build.mjs';
const clone=structuredClone;
export const deathwatchDetachmentId='detachment-dw-c015c08e99c14972';
const ruleId='detachment-rule-dw-b41deacc51464866';
const permission={
 document:'books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html',
 sha256:'1843A4B2841F7C404CEF7C1B797CFC4344F39B8063ADB236B1DF63A5F43332D4',
 pointer:'/html/body/div/div[1]/div[3]/div[25]',
 scope:'DEATHWATCH ALLIES; exception to Space Marine Chapters; 500 point cap; Warlord and KILL TEAM Enhancement restrictions remain source text'
};
export function buildDetachmentReferences(native=buildNativeMfmBook()){
 const bytes=fs.readFileSync(new URL('../../../'+permission.document,import.meta.url));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase(),permission.sha256,'Unreviewed allied Detachment permission');
 const entities=[deathwatchDetachmentId,ruleId].map(id=>{
  const row=native.deathwatch.model.entities.find(entity=>entity.id===id);
  assert.equal(row?.bookId,'deathwatch','Foreign Detachment reference owner');
  assert.ok(!row.ruleContract,'Unreviewed allied rule execution');
  return clone(row);
 });
 assert.equal(entities[0].kind,'DETACHMENT');assert.equal(entities[1].parentId,deathwatchDetachmentId);
 const binding=clone(native.deathwatch.model.mfm.detachmentBindings.find(row=>row.entityId===deathwatchDetachmentId));
 assert.equal(binding?.bookId,'deathwatch');assert.equal(binding.mfmRecordId,'mfm-detachment-68a77cb979c24615');
 const points=clone(native.consumed.deathwatchPoints.detachments.find(row=>row.id===deathwatchDetachmentId));
 assert.equal(points.mfmRecordId,binding.mfmRecordId);
 return {entities,binding,points,membership:entities.map(row=>({id:row.id,bookId:row.bookId,sourceEntityId:row.sourceEntityId})),
  review:{permission:clone(permission),execution:'TEXT_ONLY_SOURCE_BACKED',legality:'NOT_ASSESSED',
   scope:'SELECTED_DETACHMENT_AND_RULE_REFERENCE_ONLY; NO_DEATHWATCH_UNITS_OR_ENHANCEMENT_ASSIGNMENTS'},native};
}
export function appendDetachmentReferencePresentation(payload){
 const {native}=buildDetachmentReferences(),source=native.deathwatch.payload;
 const root=source.bookPresentation.records[deathwatchDetachmentId];
 const ids=new Set([deathwatchDetachmentId,ruleId,root.pointRecordId,...root.qualifierRecordIds]);
 // Existing projection fields keep their canonical owner. Omitted assignment
 // children are outside this narrowly reviewed import membership, not aliases.
 for(const card of source.cards.filter(card=>ids.has(card.id))){
  const owner=native.deathwatch.model.entities.find(entity=>entity.id===card.id)?.bookId;
  const view=clone(card);view.identity={registryId:owner||'mfm',canonicalId:card.id};
  view.children=view.children.filter(id=>ids.has(id));view.links=view.links.filter(link=>ids.has(link.targetId));
  view.note='Deathwatch-owned allied reference. Import preserves the selected Detachment; army legality and battle-dependent effects are not automatically validated. Deathwatch units and Enhancement assignments are not enrolled here.';
  payload.cards.push(view);
 }
 payload.factManifest.push(...clone(source.factManifest.filter(field=>ids.has(field.cardId))));
 for(const id of [deathwatchDetachmentId,ruleId]){
  const record=clone(source.bookPresentation.records[id]);
  if(record.enhancementIds)record.enhancementIds=[];
  if(record.stratagemIds)record.stratagemIds=[];
  payload.bookPresentation.records[id]=record;
 }
 return payload;
}
