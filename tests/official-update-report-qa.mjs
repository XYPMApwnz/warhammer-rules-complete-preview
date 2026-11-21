/** Reports describe successful shared transactions without owning game facts. */
import assert from 'node:assert/strict';
import {applyOfficialUpdates} from '../books/shared/official-updates-v1/apply.mjs';
import {collectOfficialUpdates,renderBookUpdateReport} from '../books/shared/tools/book-update-report.mjs';

const document={schema:'army-book-official-updates/v1',bookId:'synthetic',stage:'canonical-facts',selection:{collection:['entities'],identity:'id',data:['data']},order:'declared',entries:[{
 id:'accepted-update',source:{id:'accepted-source',document:'accepted-source.pdf',version:'v2',page:3,authority:'OFFICIAL_GW'},
 target:{id:'weapon',field:['attacks']},kind:'WEAPON_PROFILE',operation:'SET',expectedBefore:'2',after:'3'
}]};
const input={entities:[{id:'weapon',data:{attacks:'2'}}]},first=applyOfficialUpdates(input,document);
const transaction={bookId:'synthetic',input:'updates.json',applied:first.applied};
const updates=collectOfficialUpdates([transaction,structuredClone(transaction)]);
assert.equal(updates.length,1,'Repeated builds must list an update exactly once');
assert.deepEqual(updates,first.applied,'The report retains exact source, target and typed before/after evidence');
assert.equal(input.entities[0].data.attacks,'2','Reporting must not mutate accepted inputs');

const baseReport={books:[{bookId:'synthetic',bookTitle:'Synthetic Army',changes:[],metadataChanges:0}],officialUpdates:updates};
const report=renderBookUpdateReport(baseReport);
for(const required of['Official updates applied','accepted-update','accepted-source.pdf · v2 · page 3','weapon · attacks','SET','2 → 3','No gameplay values changed.'])assert(report.includes(required),`Missing official-update report evidence: ${required}`);
assert.equal(report.match(/\| accepted-update \|/g)?.length,1,'One audit row per rule');
assert(!renderBookUpdateReport({...baseReport,officialUpdates:[]}).includes('accepted-update'),'Missing audit evidence must not be invented');

const conflict=structuredClone(transaction);conflict.applied[0].after='4';
assert.throws(()=>collectOfficialUpdates([transaction,conflict]),/audit changed between builds: synthetic · accepted-update/);
const wrongOwner=structuredClone(transaction);wrongOwner.bookId='another-book';
assert.throws(()=>collectOfficialUpdates([wrongOwner]),/ownership or identity/);
const otherTarget=structuredClone(transaction);otherTarget.applied[0].target.id='another-weapon';
assert.equal(collectOfficialUpdates([transaction,otherTarget]).length,2,'Targets remain distinct even when the update ID is repeated in a separate transaction');
const otherBook=structuredClone(transaction);otherBook.bookId='dependency';otherBook.applied[0].bookId='dependency';
const dependentReport=renderBookUpdateReport({...baseReport,officialUpdates:collectOfficialUpdates([transaction,otherBook])});
assert(dependentReport.includes('dependency (declared dependency)'),'Inherited owner updates must retain their book ownership');

const textRow={...updates[0],id:'rule-text',kind:'DETACHMENT_RULE_TEXT',before:'Add 1 to the roll.',after:'Add 2 to the roll.'};
assert(renderBookUpdateReport({...baseReport,officialUpdates:[textRow]}).includes('[-1-] [+2+]'),'Text changes use a bounded changed-word excerpt');
const checkRow={...updates[0],id:'already-current',operation:'VERIFY_CURRENT',after:'2'};
const checked=renderBookUpdateReport({...baseReport,officialUpdates:[checkRow]});
assert(checked.includes('VERIFY_CURRENT')&&checked.includes('2 → 2'),'Already-current evidence is distinguished from a changed value');
const absenceRow={...updates[0],id:'add-record',operation:'ADD_FIELD',before:undefined,after:'3'};
assert(renderBookUpdateReport({...baseReport,officialUpdates:[absenceRow]}).includes('not present → 3'),'An absent before-value must not become an empty or invented value');
console.log(JSON.stringify({status:'PASS',deduplicatedUpdates:updates.length,negativeControls:3,sourceAndTargetPreserved:true,gameplayImmutable:true}));
