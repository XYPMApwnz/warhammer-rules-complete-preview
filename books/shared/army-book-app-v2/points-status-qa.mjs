/** The UI preserves pricing uncertainty; these are service-result fixtures,
 * not physical import fixtures or an alternate points calculator. */
import assert from 'node:assert/strict';
import {renderRosterPointsStatus} from './roster.mjs';

const element=tag=>({tag,dataset:{},children:[],attributes:{},value:'',
  set textContent(value){this.value=String(value);this.children=[];},
  get textContent(){return this.value+this.children.map(child=>child.textContent).join('');},
  get childElementCount(){return this.children.length;},
  append(...nodes){this.children.push(...nodes);},
  setAttribute(key,value){this.attributes[key]=value;}});
const document={createElement:element},all=node=>node?[node,...node.children.flatMap(all)]:[];
const state={units:[{instanceId:'first',canonicalUnitId:'unit-a'},{instanceId:'second',canonicalUnitId:'unit-a'}]};
const option={costRecordId:'cost-a',label:'Equipment A',selections:[{selectionKey:'first-equipment'}]};
const points={status:'UNRESOLVED',totalPoints:null,knownPoints:123,
  units:[{unitInstanceId:'first',totalPoints:null,paid:{options:[option]}},{unitInstanceId:'second',totalPoints:45,paid:{options:[]}}],
  unresolved:[{unitInstanceId:'first',costRecordIds:['cost-a'],reason:'PAID_SELECTION_UNKNOWN'}]};
const service={state,get points(){return points;}},titleForId=id=>id==='unit-a'?'Repeated unit':null;
const render=instanceId=>renderRosterPointsStatus(document,{service,instanceId,titleForId});
const before=structuredClone({state,points}),roster=render();
assert.match(roster.textContent,/Points unresolved/);assert.match(roster.textContent,/Points cannot be calculated reliably/);
assert.match(roster.textContent,/Repeated unit #1/);assert.match(roster.textContent,/Paid option: Equipment A/);
assert.match(roster.textContent,/paid equipment selection is unknown/);
assert.equal(roster.attributes.role,'status');
assert.ok(!roster.textContent.includes('123'),'Known partial subtotal is not displayed as a total');
const row=all(roster).find(node=>node.dataset.rosterPointsOptionId==='cost-a');
assert.equal(row.dataset.rosterPointsUnitId,'first');assert.equal(row.dataset.rosterPointsReason,'PAID_SELECTION_UNKNOWN');
assert.equal(render('second'),null,'A resolved physical copy does not inherit the warning');
assert.match(render('first').textContent,/Repeated unit #1/);
assert.deepEqual({state,points},before,'Presentation must not mutate service state or result');

points.unresolved=[{unitInstanceId:'first',selectionKey:'first-equipment',reason:'UNRESOLVED_PHYSICAL_QUANTITY'}];
assert.match(render().textContent,/quantity is unknown/);
assert.equal(all(render()).find(node=>node.dataset.rosterPointsOptionId)?.dataset.rosterPointsOptionId,'cost-a','Exact physical selection proof attributes the option');
points.unresolved=[{unitInstanceId:'first',reason:'MFM_COMPOSITION_TIER_NOT_PROVEN'}];
assert.match(render().textContent,/unit size or copy tier/);
assert.ok(!all(render()).some(node=>node.dataset.rosterPointsOptionId),'No option is invented for an unrelated tier failure');
points.unresolved=[{reason:'OTHER_REASON',message:'Required source information is missing.'}];
assert.match(render().textContent,/Required source information is missing/);
assert.ok(!all(render()).some(node=>node.dataset.rosterPointsUnitId),'No UNIT is invented for an unscoped issue');
points.unresolved=[];
assert.match(render().textContent,/Points unresolved/,'Unknown reason still shows the computed unresolved status');
assert.match(renderRosterPointsStatus(document,{service:{points:{status:'UNRESOLVED'}} ,instanceId:'first'}).textContent,
  /Points unresolved/,'Missing per-unit details do not hide a proven roster-wide uncertainty');

points.status='RESOLVED';points.totalPoints=168;
assert.equal(render(),null,'A resolved result has no false warning, even if no MODEL bearer was needed for its UNIT quantity');
points.totalPoints=0;assert.equal(render(),null,'A real resolved zero is not treated as missing');
assert.equal(renderRosterPointsStatus(document,{service:{state}}),null,'Other services need not implement points');
assert.equal(renderRosterPointsStatus(document,{service:{state,points:null}}),null,'An unloaded service has no warning');
points.status='UNRESOLVED';points.totalPoints=null;points.unresolved=before.points.unresolved;
assert.match(render('first').textContent,/paid equipment selection is unknown/,'Fresh render reads the current computed result');
console.log(JSON.stringify({status:'PASS',unknownPaid:true,unknownQuantity:true,scopedPhysicalCopies:true,
  exactOptionAttribution:true,noInventedOwner:true,noPartialTotal:true,resolvedAndAbsentService:true,liveResult:true,mutatesService:false}));
