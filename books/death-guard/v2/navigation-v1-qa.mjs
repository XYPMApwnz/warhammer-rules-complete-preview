import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {projectContents} from '../../shared/army-book-app-v2/navigation-v1.mjs';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const read=path=>fs.readFileSync(new URL('../../../'+path,import.meta.url),'utf8').replace(/\r\n/g,'\n');
const original=read('books/shared/controllers/navigation-controller.js');
const port=read('books/shared/army-book-app-v2/navigation-v1-controller.mjs');
const method=(source,name)=>{
  const start=source.indexOf('    '+name+'(');assert.ok(start>=0,'Missing actual V1 method '+name);
  const tail=source.slice(start),first=tail.split('\n')[0];
  if(first.endsWith('}'))return first.trim();
  const end=tail.indexOf('\n    }');assert.ok(end>=0);return tail.slice(0,end+6).trim();
};
const identical=['indexNavigationItems','branch','parentNode','toggle','closeEveryBranch','closeBranch','openBranch','toggleBranch',
  'pathIsOpen','revealPath','setInteractive','applyViewportState','setDrawer','setCollapsed','trapDrawerFocus','handleResize',
  'buttonSet','activate','keepRowVisible','destination','scheduleGeometry','descendsFrom','lastCrossedDescendant','pickActive',
  'scheduleRead','beginTransition','reachableDestination','scrollImmediately','stopControlledScroll','waitForSettle','cancelTransition'];
for(const name of identical)assert.equal(method(port,name),method(original,name),'Actual V1 algorithm changed: '+name);
const v1Targets=read('books/shared/navigation-targets.js');
const highlight=read('books/shared/army-book-app-v2/navigation-v1-targets.mjs');
for(const name of ['clear','range','show'])assert.equal(method(highlight,name),method(v1Targets,name),'V1 highlight lifecycle changed');
const runtime=read('books/shared/army-book-app-v2/runtime.mjs');
const base=execFileSync('git',['show','5d2b9762268f5aedad393912939fbbfce9062b85:books/shared/army-book-app-v2/runtime.mjs'],{cwd:repo,encoding:'utf8'}).replace(/\r\n/g,'\n');
const slice=(text,start,end)=>text.slice(text.indexOf(start),text.indexOf(end));
// The later datasheet port changes presentation only. Keep the original field
// writer and generic renderer frozen; the new adapter has its own fact census.
assert.equal(slice(runtime,'  function factValue(','  function renderCard('),slice(base,'  function factValue(','  function renderCard('),'Fact writer changed');
const genericStart='    const allowed = scopedIds();\n    const childrenIds';
assert.equal(slice(runtime,genericStart,'  function fillRelatedResults('),slice(base,genericStart,'  function fillRelatedResults('),'Generic card renderer changed');
assert.ok(runtime.includes('datasheets.renderDatasheet(card,{variants,instanceId,inDialog})'),'Missing presentation-only datasheet adapter');
assert.equal(slice(runtime,'  function renderInstance(','  function renderLibrary('),slice(base,'  function renderInstance(','  function renderLibrary('),'Physical datasheet DOM changed');
assert.equal(read('books/shared/army-book-app-v2/styles.css'),execFileSync('git',['show','5d2b9762268f5aedad393912939fbbfce9062b85:books/shared/army-book-app-v2/styles.css'],{cwd:repo,encoding:'utf8'}).replace(/\r\n/g,'\n'),'Accepted card/mobile stylesheet changed');
const payload=JSON.parse(read('books/death-guard/v2/generated/app-presentation.json'));
const model=projectContents(payload);
assert.deepEqual(model.roots.map(node=>node.label),['Start','Army Rule','Detachments','Datasheets','Updates']);
const actual=model.roots.find(node=>node.id==='nav:datasheets').children.flatMap(node=>node.children.map(child=>child.canonicalId));
assert.equal(new Set(actual).size,actual.length);
assert.deepEqual(new Set(actual),new Set(payload.groups.find(group=>group.id==='datasheets').itemIds));
for(const id of payload.groups.find(group=>group.id==='detachments').itemIds){
  assert.equal(model.nodes.get(id).children.length,3,'V1 Detachment Rule / Enhancement / Stratagems structure lost');
  for(const child of model.nodes.get(id).children)assert.ok(model.groups.get(child.id).length);
}
const state={rosterId:'parity',detachmentIds:['detachment-virulent-vectorium','detachment-paragons-of-putrescence'],
  units:[{instanceId:'pm2',canonicalUnitId:'unit-plague-marines'},{instanceId:'lord',canonicalUnitId:'unit-lord-of-contagion'},
    {instanceId:'ds',canonicalUnitId:'unit-deathshroud-terminators'},{instanceId:'pm1',canonicalUnitId:'unit-plague-marines'}],
  attachments:[{leaderInstanceId:'lord',bodyguardInstanceId:'ds'}]};
const view={allowedIds:new Set(payload.cards.filter(card=>card.kind!=='ENHANCEMENT').map(card=>card.id)),
  instances:state.units.map(unit=>({id:unit.canonicalUnitId,instanceId:unit.instanceId,title:unit.canonicalUnitId==='unit-plague-marines'?'Plague Marines #'+(unit.instanceId==='pm1'?2:1):unit.canonicalUnitId}))};
const personal=projectContents(payload,state,view);
assert.equal(personal.scope,'ROSTER');
assert.deepEqual(personal.roots[1].children.map(node=>node.id),state.detachmentIds);
assert.equal(personal.roots.filter(node=>node.attachmentGroup).length,1);
assert.deepEqual(personal.roots.find(node=>node.attachmentGroup).members.map(node=>node.instanceId),['lord','ds']);
assert.equal([...personal.nodes.values()].filter(node=>node.instanceId).length,4);
assert.equal([...personal.nodes.values()].filter(node=>node.canonicalId==='unit-plague-marines').length,2);
assert.throws(()=>projectContents(payload,{...state,detachmentIds:['unknown']},view),/Unresolved/);
assert.throws(()=>projectContents(payload,{...state,attachments:[...state.attachments,...state.attachments]},view),/Invalid/);
console.log(JSON.stringify({status:'PASS',actualV1MethodsRetained:identical.length+3,datasheetChanged:'NO',fullTree:'PASS',physicalIdentity:'PASS',failClosed:'PASS'}));
