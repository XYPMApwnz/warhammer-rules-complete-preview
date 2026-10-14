/** Four final binding adaptations, exercised through existing shared APIs. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {buildECContracts} from './rule-contract-build.mjs';
import {createFormationContext} from './rule-contract-formation-context.mjs';
import {bladeId,bladeField} from './rule-contract-final-bindings.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
import {validateRoster,changeAttachment,predicateContext} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../../shared/roster-v2/effects.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(directory,'../../..');
const facts=JSON.parse(fs.readFileSync(path.join(directory,'generated/effective.json'),'utf8')),original=JSON.stringify(facts);
const {book,schema,contracts,artifact}=buildECContracts({facts}),canonical=new Map(facts.entities.map(e=>[e.id,e]));
const finals=contracts.slice(21),BG='detachment-spectacle-of-slaughter:enhancement:2';
const RHINO='datasheet-chaos-rhino:section:2',RAIDER='datasheet-chaos-land-raider:section:2';
const expected=[
  [bladeId,'detachment-carnival-of-excess','EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities.'],
  [BG,'detachment-spectacle-of-slaughter','FLAWLESS BLADES unit only. Enemy units cannot target this unit with snap shooting attacks.'],
  [RHINO,'unit-chaos-rhino','This model has a transport capacity of 12 EMPEROR’S CHILDREN INFANTRY models (excluding TERMINATOR and FLAWLESS BLADE models).'],
  [RAIDER,'unit-chaos-land-raider','This model has a transport capacity of 14 EMPEROR’S CHILDREN INFANTRY models. Each TERMINATOR and FLAWLESS BLADE model takes up the space of 2 models.']
];
let checks=0,mutations=0;
const check=fn=>{fn();checks++;};
const mutate=(value,change,compare)=>{compare(value);const bad=structuredClone(value);change(bad);assert.throws(()=>compare(bad),assert.AssertionError);mutations++;};
function inventory(values) {
  assert.deepEqual(values.map(c=>c.ruleId).sort(),expected.map(e=>e[0]).sort());
  for(const [id,owner,text] of expected) {
    const c=values.find(c=>c.ruleId===id);assert.equal(c.ownerId,owner);
    assert.equal(c.clauses[0].sourceText,text);assert.deepEqual(c.currentness.factualOwner,canonical.get(id).provenance);
  }
  const blade=values.find(c=>c.ruleId===bladeId),beguiling=values.find(c=>c.ruleId===BG);
  assert.equal(blade.roles[0].subject,'MODEL');assert.equal(blade.weaponSelection.cardinality,'ONE');
  assert.equal(blade.weaponSelection.timing,'At the start of the battle');assert.equal(blade.weaponSelection.equippedOnly,true);
  assert.equal(blade.clauses[0].rosterEffects.length,39);
  for(const effect of blade.clauses[0].rosterEffects) {
    assert.equal(effect.operation,'MODIFY_STAT');assert.equal(effect.targetBinding,'SOURCE_MODEL');assert.equal(effect.targetSubject,'MODEL');
    assert.equal(effect.field,'attacks');assert.equal(effect.mode,'ADD');assert.equal(effect.value,1);assert.equal(effect.weaponMode,'melee');
    assert.equal(effect.weaponIds.length,1);assert.equal(canonical.get(effect.weaponIds[0]).data.mode,'melee');
    const choice=effect.conditions.find(c=>c.predicate.arguments?.key===bladeField)?.predicate;
    assert.ok(choice);const option=book.rosterSelectionOptions.find(o=>o.id===choice.arguments.equals);
    assert.equal(option?.data.weaponProfileId,effect.weaponIds[0]);
  }
  assert.equal(blade.clauses[1].rosterClassification,'BATTLE_ONLY');assert.deepEqual(blade.clauses[1].rosterEffects,[]);
  assert.equal(blade.clauses[1].conditions[0].contextLevel,'BATTLE');
  assert.equal(beguiling.roles[0].subject,'UNIT');assert.equal(beguiling.assignment.classification,'UNIT_UPGRADE');
  assert.equal(beguiling.clauses[0].rosterEffects[0].ability.canonicalId,BG);
  assert.equal(beguiling.clauses[0].rosterEffects[0].unitScope,'FORMED');
  assert.equal(beguiling.clauses[1].conditions[0].arguments.key,'snapShootingAttack');
  assert.equal(beguiling.clauses[1].conditions[0].roleId,'attacker');assert.deepEqual(beguiling.clauses[1].rosterEffects,[]);
  for(const [id,capacity,slotRules] of [[RHINO,12,0],[RAIDER,14,1]]) {
    const c=values.find(c=>c.ruleId===id);assert.equal(c.declarationType,'TRANSPORT_DECLARATION');
    assert.equal(c.transport.capacity,capacity);assert.equal(c.transport.defaultSlots,1);assert.equal(c.transport.slotRules.length,slotRules);
    assert.equal(c.clauses[0].rosterClassification,'NOT_AN_EFFECT');assert.deepEqual(c.clauses[0].rosterEffects,[]);
  }
  assert.equal(values.find(c=>c.ruleId===RAIDER).transport.slotRules[0].slots,2);
}
check(()=>inventory(finals));
check(()=>{
  const expectedWeapons=facts.entities.filter(e=>e.kind==='WEAPON_PROFILE'&&e.data.mode==='melee'&&
    canonical.get(e.parentId).data.factionKeywords.includes('EMPEROR’S CHILDREN'));
  assert.equal(expectedWeapons.length,39);assert.equal(book.rosterSelectionOptions.length,39);
  assert.deepEqual(book.rosterSelectionOptions.map(o=>o.data.weaponProfileId).sort(),expectedWeapons.map(w=>w.id).sort());
  for(const option of book.rosterSelectionOptions) {
    assert.equal(option.kind,'UPGRADE_OPTION');assert.equal(option.parentId,bladeId);
    assert.equal(option.id,bladeId+'::choice::'+option.data.weaponProfileId);
    assert.deepEqual(Object.keys(option.data).sort(),['modelProfileIds','selectionRuleId','timing','unitId','weaponProfileId']);
    assert.equal(option.data.unitId,canonical.get(option.data.weaponProfileId).parentId);
    assert.deepEqual(option.provenance.weaponSource,canonical.get(option.data.weaponProfileId).provenance);
  }
  const originals=book.entities.filter(e=>canonical.has(e.id));
  assert.deepEqual(originals.map(e=>[e.id,e.parentId,e.data,e.provenance,e.fieldProvenance]),facts.entities.map(e=>[e.id,e.parentId,e.data,e.provenance,e.fieldProvenance]));
  assert.deepEqual(book.entities.filter(e=>!canonical.has(e.id)),book.rosterSelectionOptions,'Only reference-only decision bindings may supplement the disposable book');
});
check(()=>{
  for(const [id,recordId,cost] of [[bladeId,'mfm-enhancement-acbd1e73b225a230',35],[BG,'mfm-enhancement-d87365e1c9c26b33',15]]) {
    const c=finals.find(c=>c.ruleId===id),r=resolveOwnedFact(recordId);assert.equal(c.mfmReferences.enhancementId,recordId);
    assert.equal(r.value,cost);assert.equal(r.detachmentId,c.mfmReferences.detachmentId);assert.deepEqual(r.qualifierIds,[]);
    assert.equal(r.provenance.sourceVersion,'v1.6');assert.equal(r.provenance.effectiveDate,null);
  }
});
const rawPaths=[...new Set(expected.map(([id])=>canonical.get(id).provenance.document))];
const raw=JSON.parse(execFileSync(process.env.PYTHON||'python',['-B','-c',
  'import sys,json; from lxml import html; sys.stdout.reconfigure(encoding="utf-8");print(json.dumps({p:" ".join(html.parse(p).getroot().itertext()) for p in sys.argv[1:]},ensure_ascii=False))',
  ...rawPaths.map(p=>path.join(root,p))],{encoding:'utf8',maxBuffer:8*1024*1024}));
const sha=b=>createHash('sha256').update(b).digest('hex').toUpperCase(),norm=t=>t.replace(/\s/g,'');
for(const [id,,text] of expected)check(()=>{
  const e=canonical.get(id),p=path.join(root,e.provenance.document);
  assert.equal(sha(fs.readFileSync(p)),e.provenance.sha256);assert.ok(norm(raw[p]).includes(norm(text)));
  const official=JSON.parse(fs.readFileSync(path.join(directory,'official-bindings.json'),'utf8'));
  assert.ok(!official.occurrences.some(o=>o.patches.some(p=>p.sourceId===id)),'Unexpected official overlay requires reconciliation');
});

const loadouts={'lord-exultant':[1,5,6,8],'flawless-blades':[1,2],'lucius-the-eternal':[1],infractors:[1,4],
  'chaos-rhino':[1],'chaos-land-raider':[1],'chaos-terminators':[1,5],'daemonettes':[1],'noise-marines':[4,5]};
const gear=(name,quantity)=>loadouts[name].map(n=>({selectionKey:'weapon/'+n,physicalQuantity:quantity,perModelQuantity:1,
  canonicalProfileIds:[`datasheet-${name}:weapon:${n}`],canonicalEquipmentIds:[]}));
const unit=(id,name,quantity=1,enhancementIds=[])=>({instanceId:id,canonicalUnitId:'unit-'+name,startingStrength:quantity,warlord:false,
  enhancementIds,selections:[],equipmentContextKnown:true,modelRows:[{rowId:'models',quantity,canonicalProfileId:`datasheet-${name}:profile:1`,selections:gear(name,quantity),loadouts:[]}]});
const state=(detachments,units)=>({schema:'roster-v2/roster',bookId:'emperors-children',rosterId:'ec/final-bindings',
  detachments:detachments.map((d,i)=>({instanceId:'d/'+i,canonicalDetachmentId:'detachment-'+d})),units,attachments:[],warlordInstanceId:null});
const optionId=weaponId=>bladeId+'::choice::'+weaponId;
function choose(unit,weaponId,row=unit.modelRows[0]) {
  const id=optionId(weaponId);unit.selectedUpgradeIds=[id];
  for(const r of unit.modelRows)r.selections=r.selections.filter(s=>!s.canonicalOptionIds?.length);
  row.selections.push({selectionKey:'possessed-choice',physicalQuantity:1,canonicalProfileIds:[],canonicalEquipmentIds:[],
    canonicalOptionIds:[id],selectionField:'selectedUpgradeIds',selectionCardinality:'MANY',exclusiveGroupId:bladeId});
}
function evaluate(input,b=book) {
  const s=validateRoster(b,input,b.rosterAttachmentPolicies),context=createFormationContext(b,s,schema);
  return {state:s,projection:executeRosterEffects(b,s,context)};
}
const physical=(r,id)=>r.projection.units.find(u=>u.instanceId===id),weapons=(r,id)=>physical(r,id).profiles.flatMap(m=>m.weapons);
const has=(r,id,rule)=>physical(r,id).abilities?.some(a=>a.canonicalId===rule)||false;
const change=(r,action,leader,target)=>evaluate(changeAttachment(book,r.state,book.rosterAttachmentPolicies,action,leader,target));
const bladeState=()=>state(['carnival-of-excess'],[unit('bearer','lord-exultant',1,[bladeId]),unit('other','lord-exultant'),unit('bodyguard','infractors',10)]);
function bladeResult(r,selectedId) {
  for(const w of weapons(r,'bearer')) {
    const original=canonical.get(w.canonicalProfileId).data;
    assert.equal(w.data.attacks,w.canonicalProfileId===selectedId?String(Number(original.attacks)+1):original.attacks);
    for(const field of ['strength','ap','damage'])assert.deepEqual(w.data[field],original[field],'No battle payload or unrelated weapon change');
    const abilities=[...original.abilities];
    // The previous, source-confirmed Perfectionists contract still grants
    // LETHAL HITS while this Lord leads. It is not a Possessed Blade delta.
    if(r.state.attachments.some(a=>a.leaderInstanceId==='bearer'))abilities.push('LETHAL HITS');
    assert.deepEqual(w.data.abilities,abilities,'No optional fight-use abilities applied permanently');
  }
  for(const w of weapons(r,'other'))assert.deepEqual(w.data,canonical.get(w.canonicalProfileId).data);
}
check(()=>{
  const input=bladeState();let r=evaluate(input);bladeResult(r,null);
  assert.ok(physical(r,'bearer').conditional.some(c=>c.ruleId===bladeId),'Missing choice remains conditional');
  choose(input.units[0],'datasheet-lord-exultant:weapon:8');r=evaluate(input);bladeResult(r,'datasheet-lord-exultant:weapon:8');
  assert.equal(weapons(r,'bearer').length,4,'Choice does not create duplicate equipment');
  r=change(r,'ATTACH','bearer','bodyguard');bladeResult(r,'datasheet-lord-exultant:weapon:8');
  assert.equal(physical(r,'bodyguard').applied.filter(a=>a.ruleId===bladeId).length,0);
  r=change(r,'DETACH','bearer');bladeResult(r,'datasheet-lord-exultant:weapon:8');
  r=change(r,'REATTACH','bearer','bodyguard');bladeResult(r,'datasheet-lord-exultant:weapon:8');
  const next=structuredClone(r.state);choose(next.units[0],'datasheet-lord-exultant:weapon:6');r=evaluate(next);bladeResult(r,'datasheet-lord-exultant:weapon:6');
  assert.deepEqual(evaluate(r.state).projection,r.projection);
  const off=structuredClone(r.state);off.units[0].enhancementIds=[];r=evaluate(off);bladeResult(r,null);
});
check(()=>{
  const valid=bladeState();choose(valid.units[0],'datasheet-lord-exultant:weapon:8');
  for(const [alter,message] of [
    [x=>choose(x.units[0],'datasheet-lord-exultant:weapon:1'),/Unresolved selected option/],
    [x=>choose(x.units[0],'datasheet-lucius-the-eternal:weapon:1'),/Foreign weapon choice owner/],
    [x=>x.units[0].modelRows[0].selections=x.units[0].modelRows[0].selections.filter(s=>!s.canonicalProfileIds.includes('datasheet-lord-exultant:weapon:8')),/not equipped/],
    [x=>x.units[0].modelRows[0].selections.push(structuredClone(x.units[0].modelRows[0].selections.at(-1))),/Duplicate Possessed Blade selection/],
    [x=>x.units[0].selectedUpgradeIds.push(optionId('datasheet-lord-exultant:weapon:6')),/choice state/],
    [x=>x.units[0].modelRows[0].selections.at(-1).physicalQuantity=0,/cannot add equipment/],
    [x=>{x.units[0].modelRows[0].selections[3].physicalQuantity=2;x.units[0].modelRows[0].selections[3].perModelQuantity=2;},/not equipped/]
  ]) {const bad=structuredClone(valid);alter(bad);assert.throws(()=>evaluate(bad),message);}
  const wrong=bladeState();wrong.detachments=[{instanceId:'wrong',canonicalDetachmentId:'detachment-mercurial-host'}];
  assert.throws(()=>evaluate(wrong),/Enhancement context/);
});
check(()=>{
  const bodyguard=unit('mixed','infractors',10,[bladeId]);bodyguard.modelRows=[
    {rowId:'bearer',quantity:1,canonicalProfileId:'datasheet-infractors:profile:1',selections:gear('infractors',1),loadouts:[]},
    {rowId:'others',quantity:9,canonicalProfileId:'datasheet-infractors:profile:1',selections:gear('infractors',9),loadouts:[]}];
  bodyguard.enhancementAssignments=[{enhancementId:bladeId,modelScopeId:'mixed/bearer/PROFILE/bearer'}];choose(bodyguard,'datasheet-infractors:weapon:4');
  const input=state(['carnival-of-excess'],[bodyguard]),r=evaluate(input);
  assert.equal(physical(r,'mixed').profiles[0].weapons.find(w=>w.data.mode==='melee').data.attacks,'5');
  assert.equal(physical(r,'mixed').profiles[1].weapons.find(w=>w.data.mode==='melee').data.attacks,'4');
  const wrong=structuredClone(input);const selection=wrong.units[0].modelRows[0].selections.pop();wrong.units[0].modelRows[1].selections.push(selection);
  assert.throws(()=>evaluate(wrong),/physical bearer binding/);
});
check(()=>{
  let r=evaluate(state(['spectacle-of-slaughter'],[unit('a','flawless-blades',3,[BG]),unit('b','flawless-blades',3),unit('l','lucius-the-eternal')]));
  assert.ok(has(r,'a',BG));assert.equal(has(r,'b',BG),false);r=change(r,'ATTACH','l','a');assert.ok(has(r,'l',BG));
  const c=finals.find(c=>c.ruleId===BG),event=c.clauses[1],actor=event.roles.find(r=>r.id==='attacker');
  const context={subject:'UNIT',unitId:'enemy',keywords:new Set(),roster:{},battle:{}};
  assert.equal(schema.evaluateRole(actor,event.conditions,context),'UNKNOWN');context.battle.snapShootingAttack=false;
  assert.equal(schema.evaluateRole(actor,event.conditions,context),'FALSE');context.battle.snapShootingAttack=true;
  assert.equal(schema.evaluateRole(actor,event.conditions,context),'TRUE');
  r=change(r,'DETACH','l');assert.equal(has(r,'l',BG),false);r=change(r,'REATTACH','l','b');assert.equal(has(r,'l',BG),false);
  r=change(r,'DETACH','l');r=change(r,'REATTACH','l','a');assert.ok(has(r,'l',BG));assert.equal(has(r,'b',BG),false);
  const wrong=structuredClone(r.state);wrong.units[0].enhancementIds=[];wrong.units[2].enhancementIds=[BG];r=evaluate(wrong);
  assert.equal(has(r,'l',BG),false,'UNIT upgrade cannot borrow Bodyguard identity');
});
function transports(values) {
  for(const [id,allowed] of [[RHINO,['lord-exultant','noise-marines']],[RAIDER,['lord-exultant','noise-marines','chaos-terminators','flawless-blades']]]) {
    const c=values.find(c=>c.ruleId===id),passenger=c.roles.find(r=>r.id==='passenger');
    for(const name of ['lord-exultant','noise-marines','chaos-terminators','flawless-blades','chaos-rhino','daemonettes']) {
      const e=canonical.get('unit-'+name),context={subject:'MODEL',modelId:e.data.profileIds[0],unitId:e.id,
        keywords:new Set([...e.data.keywords,...e.data.factionKeywords]),roster:{},battle:{}};
      assert.equal(schema.evaluateRole(passenger,[],context),allowed.includes(name)?'TRUE':'FALSE',id+'/'+name);
      if(id===RAIDER&&allowed.includes(name)) {
        const slots=c.transport.slotRules.filter(rule=>schema.evaluatePredicate(rule.selector,context)==='TRUE');
        assert.equal(slots.length?slots[0].slots:c.transport.defaultSlots,['chaos-terminators','flawless-blades'].includes(name)?2:1);
      }
    }
  }
}
check(()=>transports(finals));
check(()=>{
  const input=state(['carnival-of-excess'],[unit('rhino','chaos-rhino'),unit('raider','chaos-land-raider'),unit('troops','noise-marines',6)]),r=evaluate(input);
  assert.deepEqual(r.state.units,input.units);assert.deepEqual(r.state.attachments,[]);
  for(const u of r.projection.units)assert.ok(!u.applied.some(a=>[RHINO,RAIDER].includes(a.ruleId)),'Transport declaration must not embark or mutate');
});
check(()=>assert.deepEqual(buildECContracts({finalInputs:[]}).contracts,contracts.slice(0,21),'Previous twenty families / twenty-one owners unchanged'));

mutate(finals,x=>x.pop(),inventory);mutate(finals,x=>x.push(structuredClone(x[0])),inventory);
mutate(finals,x=>x[0].clauses[0].rosterEffects[0].value=2,inventory);
mutate(finals,x=>x[0].clauses[0].rosterEffects[0].weaponIds=[],inventory);
mutate(finals,x=>x[1].clauses[1].conditions[0].arguments.key='rangedAttack',inventory);
mutate(finals,x=>x[2].transport.capacity=13,inventory);mutate(finals,x=>x[3].transport.slotRules[0].slots=1,inventory);
mutate(finals,x=>x[2].roles.find(r=>r.id==='passenger').selector.args.pop(),transports);
mutate(book,x=>x.entities.find(e=>e.id===bladeId).ruleContract.clauses[0].rosterEffects.forEach(e=>e.conditions=e.conditions.filter(c=>c.predicate.arguments?.key!==bladeField)),x=>{
  const r=evaluate(bladeState(),x);bladeResult(r,null);
});
assert.equal(JSON.stringify(facts),original);assert.equal(artifact.scope.finalBindingRules,4);
console.log(JSON.stringify({status:'PASS',contracts:4,canonicalWeaponOptions:39,checks,mutations,previous20:'PASS',battleSimulation:false}));
