import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {projectContents} from '../../shared/army-book-app-v2/navigation-v1.mjs';
import {createLifecycle} from '../../shared/army-book-app-v2/lifecycle.mjs';
import {Highlighter} from '../../shared/army-book-app-v2/navigation-v1-targets.mjs';
import {buildApp,readAppInputs} from './app-build.mjs';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';
import {validatePresentation} from './app-qa.mjs';
import {buildDatasheetReferenceBindings} from './presentation-reference-build.mjs';

// This QA intentionally owns no V1 factual input. It checks the independent
// canonical fact oracle, V1 Contents behavior, and current theme/lifecycle contracts.
const base='296ecc02542c366fd73065f591745e629a0c24ce';
const directory=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(directory,'../../..');
// The historical module is a behavior oracle for projectContents, not a byte freeze.
const navigationBaseline=execFileSync('git',['show',`${base}:books/shared/army-book-app-v2/navigation-v1.mjs`],
  {cwd:repo,encoding:'utf8'});
const read=file=>fs.readFileSync(path.join(repo,file),'utf8');
const theme={navigation:read('books/shared/army-book-app-v2/navigation-v1.css'),
  datasheet:read('books/shared/datasheet-system.css'),art:read('books/shared/unit-art.css')};
function assertTheme(styles){
  for(const [property,binding,fallback]of [['panel','panel','#191f1a'],['ink','ink','#e2dcc9'],
    ['green','accent','#bfd58c'],['pink','signal','#d5488e']]){
    const declaration=styles.navigation.match(new RegExp(`--v1-nav-${property}:\\s*([^;]+);`))?.[1];
    assert.match(declaration||'',new RegExp(`^var\\(--book-${binding},\\s*${fallback}\\)$`),`Book-owned navigation theme: ${property}`);
  }
  assert.match(styles.datasheet,/background:\s*var\(--book-bg,\s*#0c110d\)/,'Book-owned datasheet background');
  assert.match(styles.art,/background:\s*rgba\(var\(--book-panel-rgb,/,'Book-owned artwork panel');
}
assertTheme(theme);
assert.throws(()=>assertTheme({...theme,navigation:theme.navigation.replace('--v1-nav-green: var(--book-accent,','--v1-nav-green: var(--book-ink,')}),
  {name:'AssertionError'},'Wrong theme mapping must be detected');
assert.throws(()=>assertTheme({...theme,art:theme.art.replaceAll('--book-panel-rgb','--wrong-panel-rgb')}),
  {name:'AssertionError'},'Artwork must not bypass the book theme');

function assertLifecycle(create=createLifecycle){
  const frames=new Map(),timers=new Map();let next=0,disconnected=0;
  const view={requestAnimationFrame(fn){const id=++next;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);},
    setTimeout(fn){const id=++next;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}};
  const target=new class extends EventTarget{
    handlers=new Set();
    addEventListener(type,fn,options){this.handlers.add(fn);super.addEventListener(type,fn,options);}
    removeEventListener(type,fn,options){this.handlers.delete(fn);super.removeEventListener(type,fn,options);}
  };
  const owner=create(view),events=[];
  owner.listen(target,'read',()=>events.push('read'));target.dispatchEvent(new Event('read'));
  const frame=frames.get(owner.frame(()=>events.push('frame'))),timer=timers.get(owner.timeout(()=>events.push('timer'),0));
  owner.observe({disconnect(){disconnected++;}});
  const classes=new Set(),node={dataset:{},classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)}};
  const highlight=new Highlighter({view,lifecycle:owner});highlight.show(node);assert.equal(classes.size,1);
  owner.destroy();owner.destroy();
  assert.equal(owner.active,false);assert.equal(target.handlers.size,0,'Destroyed listeners remain registered');
  assert.equal(frames.size,0,'Destroyed animation work remains pending');assert.equal(timers.size,0,'Destroyed timer work remains pending');
  assert.equal(disconnected,1);assert.equal(classes.size,0,'Stale destination highlight');assert.equal(highlight.current.length,0);
  target.dispatchEvent(new Event('read'));frame();timer();highlight.show(node);
  assert.deepEqual(events,['read'],'Queued callbacks must remain inert');assert.equal(classes.size,0);
  const remounted=createLifecycle(view);remounted.listen(target,'read',()=>events.push('remount'));
  target.dispatchEvent(new Event('read'));assert.deepEqual(events,['read','remount']);remounted.destroy();assert.equal(target.handlers.size,0);
}
assertLifecycle();
assert.throws(()=>assertLifecycle(view=>({...createLifecycle(view),destroy(){}})),{name:'AssertionError'},'Missing destroy must fail');
assert.throws(()=>assertLifecycle(view=>createLifecycle({...view,cancelAnimationFrame(){},clearTimeout(){}})),
  {name:'AssertionError'},'Missing cancellation must fail');

const portCss=fs.readFileSync(path.join(repo,'books/shared/army-book-app-v2/datasheet-v1.css'),'utf8');
for(const asset of ['datasheet-system.css','unit-art.css']){
  assert.ok(portCss.includes(`@import url("../${asset}");`),`Actual V1 stylesheet disconnected: ${asset}`);
  assert.ok(read('books/shared/'+asset).length,`Shared stylesheet missing: ${asset}`);
}

const inputs=readAppInputs(),payload=buildApp(inputs);
const baselineModule=navigationBaseline.replace(/from '(\.\/[^']+)'/g,(_,relative)=>
  `from '${pathToFileURL(path.resolve(repo,'books/shared/army-book-app-v2',relative)).href}'`);
const originalNavigation=await import('data:text/javascript;base64,'+Buffer.from(baselineModule).toString('base64'));
assert.deepEqual(projectContents(payload),originalNavigation.projectContents(payload),'DG navigation behavior changed');
const validation=validatePresentation(payload,inputs.model,inputs.records);
const expected=enumerateExpectedFacts(inputs.model,inputs.records);
assert.equal(expected.length,3654,'Canonical source-fact census changed');
assert.equal(validation.facts,expected.length);

// The source-evidence census and the player datasheet census are deliberately
// different contracts. The former is lossless. The latter admits only fields
// that a player needs, plus the exact accepted attachment exception prose;
// identity bindings and source-layout classifiers remain available through the
// explicit evidence surface instead of becoming a generic datasheet tail.
const entities=new Map(inputs.model.entities.map(entity=>[entity.id,entity]));
const recordType=id=>inputs.records.get(id)?.recordType;
const leaderException=entity=>{
  if(entity?.kind!=='DATASHEET_SECTION'||entity.data.title!=='LEADER')return false;
  return entity.data.blocks.some(block=>block.text.split('\n').filter(line=>!/^This model can be attached/.test(line)&&!/^\s*-\s/.test(line)).join('\n').trim());
};
const isPlayerDatasheetFact=fact=>{
  const entity=entities.get(fact.entityId),kind=entity?.kind||recordType(fact.entityId),path=fact.path;
  if(kind==='DATASHEET'||kind==='PROFILE')return true;
  if(kind==='WEAPON_PROFILE')return path[0]!=='mode'&&(path[0]!=='abilities'||path.length>1);
  if(kind==='MODEL_BASE')return path[0]==='text';
  if(kind==='DATASHEET_SECTION'){
    if(path[0]==='title')return true;
    if(path[0]==='blocks'&&path[2]==='text')return entity.data.title!=='LEADER'||leaderException(entity);
    return path[0]==='qualifications'&&path.at(-1)==='sourceText';
  }
  if(['WARGEAR_OPTION','SUPPLEMENTAL_DATASHEET_RULE','WARGEAR_FOOTNOTE'].includes(kind))return path[0]==='text';
  if(kind==='RULE_REFERENCE')return path[0]==='label';
  if(kind==='WEAPON_PROFILE_SELECTION')return path[0]==='text'||path.at(-2)==='profileIds';
  if(kind==='MFM_UNIT_POINTS')return path[0]==='pointSchedules'&&(
    path[2]==='entries'&&['sourceLabel','value'].includes(path[4])||
    path[2]==='sourceLabel'&&inputs.records.get(fact.entityId).pointSchedules.length>1);
  if(kind==='MFM_PAID_UPGRADE')return ['sourceLabel','value'].includes(path[0]);
  if(kind==='MFM_LEADER_ELIGIBILITY')return path[0]==='targetUnitReferenceIds';
  return false;
};
const playerFacts=expected.filter(isPlayerDatasheetFact);
assert.equal(playerFacts.length,2281,'Player datasheet fact classification changed');
assert.equal(expected.filter(fact=>entities.get(fact.entityId)?.kind==='WEAPON_PROFILE'&&fact.path[0]==='mode').length,146);
assert.equal(expected.filter(fact=>entities.get(fact.entityId)?.kind==='DATASHEET_SECTION'&&fact.path.at(-1)==='wargearAbility').length,126);
assert.equal(expected.filter(fact=>entities.get(fact.entityId)?.kind==='MODEL_BASE'&&fact.path[0]==='scope').length,36);
assert.equal(expected.filter(fact=>entities.get(fact.entityId)?.kind==='WEAPON_PROFILE_SELECTION'&&fact.path[0]==='profileGroups').length,6);
assert.equal(expected.filter(fact=>recordType(fact.entityId)==='MFM_UNIT_POINTS'&&['status','sourceGroup'].includes(fact.path[0])).length,72);

const cards=new Map(payload.cards.map(card=>[card.id,card]));
const referenceFields=payload.cards.filter(card=>card.kind==='RULE_REFERENCE').flatMap(card=>card.fields.filter(field=>field.source.path==='/label'));
assert.equal(referenceFields.length,36);
let references=0;
for(const field of referenceFields){
  const bindings=payload.datasheetPresentation.referenceBindings.fields[field.id];
  assert.ok(bindings.length,'Missing formal reference bindings: '+field.id);
  let end=0;
  for(const binding of bindings){
    assert.ok(binding.start>=end&&binding.end>binding.start&&binding.end<=field.value.length,'Invalid reference span: '+field.id);
    assert.ok(cards.has(binding.targetId),'Unavailable canonical reference: '+binding.targetId);
    if(field.value.slice(binding.start,binding.end)==='Deep Strike')assert.equal(binding.targetId,'core-deep-strike');
    end=binding.end;references++;
  }
}
assert.equal(references,89);
assert.throws(()=>buildDatasheetReferenceBindings(payload.cards.filter(card=>card.id!=='core-deep-strike')),/Unavailable canonical presentation target/);
const unknownReference=structuredClone(payload.cards);
unknownReference.find(card=>card.kind==='RULE_REFERENCE').fields.find(field=>field.source.path==='/label').value+=', UNKNOWN FORMAL REFERENCE';
assert.throws(()=>buildDatasheetReferenceBindings(unknownReference),/Unsupported formal rule reference/);
const datasheets=inputs.model.entities.filter(entity=>entity.kind==='DATASHEET');
assert.equal(datasheets.length,36,'Datasheet census changed');
for(const unit of datasheets){
  const card=cards.get(unit.id);
  assert.ok(card&&card.kind==='DATASHEET',`Missing canonical datasheet ${unit.id}`);
  for(const id of [...unit.data.profileIds,...unit.data.weaponIds,...unit.data.sectionIds]){
    assert.ok(cards.has(id),`Missing canonical datasheet child ${unit.id}/${id}`);
    assert.equal(cards.get(id).parentId,unit.id,`Wrong canonical datasheet child owner ${id}`);
  }
}

const value=(id,key)=>inputs.model.entities.find(entity=>entity.id===id)?.data?.[key];
assert.equal(value('datasheet-lord-of-contagion:weapon:1','attacks'),'5');
assert.equal(value('datasheet-lord-of-contagion:weapon:1','strength'),'9');
assert.equal(value('datasheet-lord-of-contagion:weapon:2','attacks'),'10');
assert.equal(value('datasheet-lord-of-contagion:weapon:2','strength'),'6');
assert.deepEqual(value('datasheet-lord-of-contagion:weapon:1','abilities'),['lethal hits']);
assert.deepEqual(value('datasheet-lord-of-contagion:weapon:2','abilities'),['lethal hits']);

const sourceRules=new Map(inputs.model.entities.map(entity=>[entity.id,entity.ruleContract]).filter(([,contract])=>contract));
for(const id of ['datasheet-lord-of-contagion:section:1','datasheet-deathshroud-terminators:section:1','detachment-paragons-of-putrescence:rule','detachment-virulent-vectorium:enhancement:2']){
  assert.ok(sourceRules.get(id)?.clauses?.some(clause=>clause.rosterClassification==='ROSTER_EXECUTABLE'),`Missing executable source oracle ${id}`);
}

console.log(JSON.stringify({status:'PASS',sourceFacts:expected.length,playerDatasheetFacts:playerFacts.length,datasheets:datasheets.length,canonicalReferenceBindings:references,referenceRejectionControls:2,navigationBehaviorBaseline:base,themeContract:'PASS',lifecycleReleaseRemount:'PASS',mutationControls:4,actualV1Styles:2,megaBaseOracle:'PASS'},null,2));
