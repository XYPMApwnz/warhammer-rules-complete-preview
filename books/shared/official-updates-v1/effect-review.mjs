/** Producer-only guard. Reads declarations, never previous generated outputs. */
import {readOfficialUpdates} from './book.mjs';
import {changesRuleText,hasAutomation,requireEffectReview} from './effect-review-policy.mjs';
import {getRecordedSourceIdentity} from '../source-refs-v2/source-refs.mjs';
import {resolveOfficialUpdateTarget} from './apply.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function officialTextRuleOwners(book,document,entry,{sourceIndex}={}){
 if(document.stage==='canonical-facts'){
  const selected=resolveOfficialUpdateTarget(book,document,entry);
  if(selected.entityPath[0]!=='entities'||!Number.isSafeInteger(selected.entityPath[1]))throw Error(`Official update ${document.bookId} · ${entry.id}: automation owner must be an exact canonical entity`);
  return [book.entities[selected.entityPath[1]]];
 }
 const locator=entry.target.sourceLocator;
 if(!locator)throw Error(`Official update ${document.bookId} · ${entry.id}: source-corpus text requires an exact source locator`);
 const suffix=[...locator.pointer.slice((locator.identityPointer||locator.pointer).length),...entry.target.field];
 const identity=locator.identity+(suffix.length?'#/'+suffix.join('/'):'');
 const matching=id=>sourceIndex?sourceIndex.get(id)||[]:book.entities.filter(entity=>getRecordedSourceIdentity(entity)===id);
 const specific=matching(identity);return specific.length?specific:matching(locator.identity);
}
export function collectOfficialEffectReviews(book,document){
 const rows=[],sourceIndex=new Map();
 if(document.stage==='source-corpus')for(const entity of book.entities){const id=getRecordedSourceIdentity(entity);if(id){const records=sourceIndex.get(id)||[];records.push(entity);sourceIndex.set(id,records);}}
 for(const entry of document.entries.filter(changesRuleText)){
  const owners=officialTextRuleOwners(book,document,entry,{sourceIndex});
  if(owners.length>1)throw Error(`Official update ${document.bookId} · ${entry.id}: ambiguous automation owner`);
  const entity=owners[0];if(!entity?.ruleContract||!hasAutomation(entity.ruleContract))continue;
  // An entity can own several source fields; a sibling text block cannot
  // authorize a change to another block's automation.
  const fields=entity.ruleContract.sourceFields||[];
  const selected=document.stage==='canonical-facts'?resolveOfficialUpdateTarget(book,document,entry):null;
  const field=selected?[...selected.dataPath.slice(3),...entry.target.field]:entry.target.field;
  if(document.stage==='canonical-facts'&&fields.length&&!fields.some(path=>same(path,field)||path.every((key,i)=>field[i]===key)||field.every((key,i)=>path[i]===key)))continue;
  rows.push({entry,entityId:entity.id});
 }
 return rows;
}
export function assertBookOfficialEffectReviews(book,{root,document}={}){
 const bookId=book.bookId||book.book?.id;
 if(!bookId)throw Error('Official effect review requires an explicit book identity');
 document??=readOfficialUpdates(bookId,{root}).document;
 const rows=collectOfficialEffectReviews(book,document);
 for(const {entry,entityId}of rows)requireEffectReview(bookId,entityId,entry);
 return rows;
}
