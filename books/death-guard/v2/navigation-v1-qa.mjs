import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {projectContents} from '../../shared/army-book-app-v2/navigation-v1.mjs';
import {prepareRosterPresentationCards,projectFormedUnitCards,instanceRoute} from '../../shared/army-book-app-v2/personal.mjs';
import {renderFormedUnit} from '../../shared/army-book-app-v2/formed-unit-presentation.mjs';
import {createDGRosterRuntime} from './roster-boot.mjs';

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
// Resource ownership adds inert-after-destroy guards, snapshots and cancelable
// scheduling. Strip only those explicit additions before comparing every V1
// algorithm below. Real teardown/remount behavior is covered independently by
// books/shared/army-book-app-v2/lifecycle-browser-qa.mjs.
const lifecycleOnly = source => source
  .replaceAll('      if(this.destroyed)return;\n','')
  .replaceAll('      if(!this.lifecycle.active)return null;\n','')
  .replaceAll('      if(!this.lifecycle.active)return;\n','')
  .replaceAll('this.destroyed||','')
  .replaceAll('this.lifecycle.frame(', 'requestAnimationFrame(')
  .replaceAll('this.lifecycle.clearTimeout(', 'window.clearTimeout(')
  .replaceAll('this.lifecycle.timeout(', 'window.setTimeout(')
  .replaceAll('this.view.document', 'document')
  .replaceAll('this.view.', 'window.')
  .replaceAll("      this.saveAttribute(branch,'hidden');this.saveAttribute(toggle,'aria-expanded');\n",'')
  .replaceAll("this.saveAttribute(root,'inert');",'')
  .replaceAll('        this.saveAttribute(control,key);this.saveAttribute(control,\'tabindex\');\n','')
  .replaceAll("      for(const button of new Set([...next,...this.activeButtons])){this.saveAttribute(button,'class');this.saveAttribute(button,'aria-current');}\n",'')
  .replaceAll(`      // Removed Contents and fallback focus controls have no presentation owner.
      for(const [element,attributes] of this.savedAttributes)if(!this.attributeRoots.some(root=>root===element||root.contains(element))){
        for(const [name,value] of attributes){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);}
        this.savedAttributes.delete(element);
      }
`,'');
const identical=['indexNavigationItems','branch','parentNode','toggle','closeEveryBranch','closeBranch','openBranch','toggleBranch',
  'pathIsOpen','revealPath','setInteractive','applyViewportState','setDrawer','setCollapsed','trapDrawerFocus','handleResize',
  'buttonSet','activate','keepRowVisible','destination','scheduleGeometry','descendsFrom','lastCrossedDescendant','pickActive',
  'scheduleRead','beginTransition','reachableDestination','scrollImmediately','stopControlledScroll','waitForSettle','cancelTransition'];
for(const name of identical){
  assert.equal(lifecycleOnly(method(original,name)),method(original,name),'Lifecycle normalization touched the V1 oracle: '+name);
  assert.equal(lifecycleOnly(method(port,name)),method(original,name),'Actual V1 algorithm changed: '+name);
}
for(const [name,before,after]of [['waitForSettle','stable>=6','stable>=2'],['closeBranch','branch.hidden=true','branch.hidden=false']]){
  assert.notEqual(lifecycleOnly(method(port,name).replace(before,after)),method(original,name),'Lifecycle normalization hid an algorithm mutation: '+name);
}
const v1Targets=read('books/shared/navigation-targets.js');
const highlight=read('books/shared/army-book-app-v2/navigation-v1-targets.mjs');
for(const name of ['clear','range','show'])assert.equal(lifecycleOnly(method(highlight,name)),method(v1Targets,name),'V1 highlight algorithm changed');
const runtime=read('books/shared/army-book-app-v2/runtime.mjs');
const base=execFileSync('git',['show','5d2b9762268f5aedad393912939fbbfce9062b85:books/shared/army-book-app-v2/runtime.mjs'],{cwd:repo,encoding:'utf8'}).replace(/\r\n/g,'\n');
const slice=(text,start,end)=>text.slice(text.indexOf(start),text.indexOf(end));
// The later datasheet port changes presentation only. Keep the original field
// writer and generic renderer frozen; the new adapter has its own fact census.
const expectedFactWriter=slice(base,'  function factValue(','  function renderCard(')
  .replace("if (field.presentation === 'heading') return;","if (field.presentation === 'heading' || field.type === 'heading') return;");
assert.equal(slice(runtime,'  function factValue(','  function renderCard('),expectedFactWriter,'Fact writer changed beyond the approved heading de-duplication');
const genericStart='    const allowed = scopedIds();\n    const childrenIds';
const expectedGeneric=slice(base,genericStart,'  function fillRelatedResults(')
  .replace("field => field.presentation === 'heading'","field => field.presentation === 'heading' || field.type === 'heading'")
  .replace('{depth: depth + 1, ancestors: trail, inDialog, variants, instanceId}', '{depth: depth + 1, ancestors: trail, inDialog, variants, instanceId,sourceEvidence}');
assert.equal(slice(runtime,genericStart,'  function fillRelatedResults(').replace('createV1RelatedPanel({document,lifecycle,','createV1RelatedPanel({document,'),expectedGeneric,'Generic card renderer changed beyond source evidence propagation, heading de-duplication and lifecycle injection');
assert.ok(runtime.includes('datasheets.renderDatasheet(card,{variants,instanceId,inDialog})'),'Missing presentation-only datasheet adapter');
// Check the current component pipeline, not historical single-card DOM bytes.
const instanceRenderer=slice(runtime,'  function renderInstance(','  function renderPhysicalUnit(');
const physicalRenderer=slice(runtime,'  function renderPhysicalUnit(','  function renderLibrary(');
assert.ok(instanceRenderer.includes('renderPhysicalUnit(instanceId)'),'Physical route bypasses formed presentation');
for(const call of ['projectFormedUnitCards(effectiveCards,options.roster,instanceId)',
  'renderFormedUnit(view,','renderCard(component.card,{variants:component.variants,instanceId:component.unit.instanceId})'])
  assert.ok(physicalRenderer.includes(call),'Incomplete physical renderer wiring: '+call);
const appStyles=read('books/shared/army-book-app-v2/styles.css');
for(const selector of ['.toc-panel','.toc-tree','.toc-row','.toc-scrim','.nav-collapse'])assert.equal(appStyles.includes(selector),false,`Generic stylesheet crossed the frozen V1 navigation boundary: ${selector}`);
const payload=JSON.parse(read('books/death-guard/v2/generated/app-presentation.json'));
const book=JSON.parse(read('books/death-guard/v2/generated/rule-contract-effective.json'));
const originalBook=JSON.stringify(book),originalCards=JSON.stringify(payload.cards);
const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
const roster=createDGRosterRuntime(book);
assert.equal(roster.import(`+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet
Char2: 1x Lord of Contagion (110 pts): Manreaper
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`).status,'READY');
const [lord,bodyguard,otherLord,otherBodyguard]=roster.state.units.map(unit=>unit.instanceId);
assert.deepEqual(roster.state.units.map(unit=>unit.enhancementIds.length),[1,0,0,0],'Import must preserve the physical Enhancement owner');
assert.deepEqual(roster.state.units[1].modelRows.map(row=>row.quantity),[1,2]);
const independent=[otherLord,otherBodyguard].map(id=>projectFormedUnitCards(cards,roster,id));
function assertComponents(view,ids){
  assert.deepEqual(view.components.map(component=>component.unit.instanceId),ids,'Missing, duplicated or reordered physical component');
  for(const component of view.components){
    const id=component.unit.instanceId,unit=roster.state.units.find(unit=>unit.instanceId===id),effective=roster.effective(id);
    assert.deepEqual(component.unit,unit,'Physical selections or ownership changed');
    assert.equal(component.card.instanceId,id);assert.equal(component.card.id,unit.canonicalUnitId);
    assert.deepEqual(component.card.rosterComposition.map(row=>[row.profileId,row.quantity]),
      unit.modelRows.map(row=>[row.canonicalProfileId,row.quantity]),'Mixed composition changed');
    for(const [kind,records]of [['PROFILE',effective.profiles],['WEAPON_PROFILE',effective.weapons]]){
      const actual=[...component.variants.values()].flat().filter(card=>card.kind===kind);
      assert.deepEqual(actual.map(card=>[card.id,card.scopeId]).sort(),records.map(record=>[record.id,record.scopeId]).sort());
      assert.ok(actual.every(card=>card.instanceId===id),'Foreign profile/weapon owner');
      for(const record of records){
        const variant=actual.find(card=>card.id===record.id&&card.scopeId===record.scopeId);
        assert.equal(variant.rosterQuantity,kind==='PROFILE'?record.quantity:record.physicalQuantity);
        const labels=kind==='PROFILE'?['M','T','SV','W','LD','OC','INSV']:['range','attacks','skill','strength','ap','damage'];
        for(const field of record.fields.filter(field=>labels.includes(field.label)))
          assert.ok(variant.fields.some(actual=>actual.source?.path==='/'+field.label&&actual.value===field.value),
            'Missing or incorrect effective characteristic: '+record.id+'/'+field.label);
      }
    }
    for(const ability of effective.abilities.filter(ability=>cards.get(ability.id)?.kind!=='WARGEAR_OPTION'))
      assert.ok(component.card.children.includes(ability.id),'Component ability omitted: '+ability.id);
    assert.deepEqual(new Set(component.card.rosterEquipmentIds),new Set([
      ...(unit.selections||[]),...unit.modelRows.flatMap(row=>[...(row.selections||[]),
        ...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])
    ].filter(selection=>selection.physicalQuantity>0).flatMap(selection=>selection.canonicalEquipmentIds)),
    'Legal but unselected equipment must not leak into the physical view');
  }
}
const project=id=>projectFormedUnitCards(cards,roster,id);
assertComponents(project(bodyguard),[bodyguard]);assertComponents(project(lord),[lord]);
roster.attach(lord,bodyguard);
const beforePresentation=roster.snapshot(),beforeProjection=roster.projection,formed=project(bodyguard);
assertComponents(formed,[bodyguard,lord]);assert.deepEqual(project(lord),formed,'Character route must resolve the complete formed unit');
// The real generic composer must render every independently owned component.
const el=(tag,className)=>({tag,className,dataset:{},attributes:{},children:[],
  setAttribute(name,value){this.attributes[name]=value;},append(child){this.children.push(child);}});
const rendered=renderFormedUnit(formed,{el,renderComponent:component=>{
  assert.ok(component.card.rosterComposition.length);const node=el('article','unit-card');node.component=component;return node;
}});
assert.equal(rendered.dataset.formedUnitId,formed.formedUnitId);
assert.deepEqual(rendered.children.map(node=>node.dataset.formedComponentInstanceId),[bodyguard,lord]);
assert.deepEqual(rendered.children.map(node=>node.dataset.contentsTarget),[bodyguard,lord].map(instanceRoute));
assert.deepEqual(rendered.children.map(node=>node.component),formed.components);
assert.deepEqual(roster.snapshot(),beforePresentation);assert.deepEqual(roster.projection,beforeProjection);
for(const mutate of [view=>view.components.pop(),view=>{view.components[1].unit.enhancementIds=[];},
  view=>{view.components[0].card.rosterComposition[0].quantity++;},
  view=>{[...view.components[1].variants.values()].flat().find(card=>card.kind==='WEAPON_PROFILE').instanceId=bodyguard;},
  view=>{[...view.components[1].variants.values()].flat().find(card=>card.kind==='PROFILE').fields.find(field=>field.source?.path==='/T').value='999';}]){
  const copy=structuredClone(formed);mutate(copy);
  assert.throws(()=>assertComponents(copy,[bodyguard,lord]),{name:'AssertionError'},'Component loss/ownership/composition mutation escaped');
}
for(const members of [[bodyguard,lord,'missing-physical-member'],[bodyguard,lord,lord]])assert.throws(()=>projectFormedUnitCards(cards,{
  state:roster.state,effective(id){const current=roster.effective(id);current.formedUnit.memberInstanceIds=members;return current;}
},bodyguard),/Invalid formed presentation membership|Inconsistent formed presentation component/);
roster.detach(lord);assertComponents(project(bodyguard),[bodyguard]);assertComponents(project(lord),[lord]);
assert.equal(renderFormedUnit(project(lord),{el,renderComponent:component=>component}).unit.instanceId,lord);
roster.reattach(lord,bodyguard);assert.deepEqual(project(bodyguard),formed,'Reattach left stale presentation');
roster.load(roster.snapshot());assert.deepEqual(project(bodyguard),formed,'Reload changed component presentation');
assert.deepEqual([otherLord,otherBodyguard].map(project),independent,'Independent duplicate instances leaked');
assert.equal(JSON.stringify(book),originalBook);assert.equal(JSON.stringify(payload.cards),originalCards);
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
console.log(JSON.stringify({status:'PASS',actualV1MethodsRetained:identical.length+3,formedComponents:2,
  formedCompositionOwnership:'PASS',attachDetachReattachReload:'PASS',independentInstances:'PASS',
  componentMutationControls:5,fullTree:'PASS',physicalIdentity:'PASS',failClosed:'PASS'}));
