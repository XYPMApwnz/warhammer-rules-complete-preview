/** Bounded real shared-engine tests for five EC rule families / six owners. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildECContracts} from './rule-contract-build.mjs';
import {createFormationContext} from './rule-contract-formation-context.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
import {validateRoster,changeAttachment,predicateContext} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../../shared/roster-v2/effects.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(directory,'../../..');
const facts=JSON.parse(fs.readFileSync(path.join(directory,'generated/effective.json'),'utf8'));
const original=JSON.stringify(facts),{book,schema,contracts,artifact}=buildECContracts({facts});
const canonical=new Map(facts.entities.map(e=>[e.id,e])),added=contracts.slice(15,21);
const [CAC,FREN,EAGER,ICON_D,ICON_S,HOST]=[
  'detachment-elegant-brutes:enhancement:1','detachment-elegant-brutes:enhancement:2',
  'detachment-spectacle-of-slaughter:enhancement:1','datasheet-daemonettes:section:1',
  'datasheet-seekers:section:1','datasheet-lord-exultant:section:4'];
const expected=[
  [CAC,'detachment-elegant-brutes','MODEL',[['GRANT_ABILITY','MODEL','SOURCE_MODEL','core-deep-strike'],['GRANT_WEAPON_ABILITY','UNIT','SOURCE_UNIT','IGNORES COVER']]],
  [FREN,'detachment-elegant-brutes','UNIT',[['GRANT_WEAPON_ABILITY','UNIT','SOURCE_UNIT','SUSTAINED HITS 1']]],
  [EAGER,'detachment-spectacle-of-slaughter','UNIT',[['MODIFY_STAT','MODEL','SOURCE_UNIT_MODELS','M','ADD',2],['MODIFY_STAT','MODEL','SOURCE_FORMED_MODELS','M','ADD',2]]],
  [ICON_D,'unit-daemonettes','UNIT',[['MODIFY_STAT','MODEL','SOURCE_UNIT_MODELS','LD','SET',6],['MODIFY_STAT','MODEL','SOURCE_FORMED_MODELS','LD','SET',6]]],
  [ICON_S,'unit-seekers','UNIT',[['MODIFY_STAT','MODEL','SOURCE_UNIT_MODELS','LD','SET',6],['MODIFY_STAT','MODEL','SOURCE_FORMED_MODELS','LD','SET',6]]],
  [HOST,'unit-lord-exultant','MODEL',[['GRANT_ABILITY','MODEL','SOURCE_MODEL','core-infiltrators'],['GRANT_ABILITY','MODEL','SOURCE_MODEL','core-scouts']]]
];
let checks=0,mutations=0;
const check=fn=>{fn();checks++;};
const poison=(value,change,compare)=>{compare(value);const bad=structuredClone(value);change(bad);assert.throws(()=>compare(bad),assert.AssertionError);mutations++;};
const effects=c=>c.clauses.flatMap(c=>c.rosterEffects);
const signature=e=>[e.operation,e.targetSubject,e.targetBinding,...(e.operation==='MODIFY_STAT'?[e.field,e.mode,e.value]:
  [e.operation==='GRANT_ABILITY'?e.ability.canonicalId:e.ability])];
function inventory(values) {
  assert.deepEqual(values.map(c=>c.ruleId).sort(),expected.map(e=>e[0]).sort());
  for(const [id,owner,subject,operations] of expected) {
    const c=values.find(c=>c.ruleId===id);assert.equal(c.ownerId,owner);assert.equal(c.roles[0].subject,subject);
    assert.deepEqual(effects(c).map(signature),operations);
    for(const clause of c.clauses)for(const effect of clause.rosterEffects) {
      const entity=canonical.get(id),source=entity.fieldProvenance?.text||entity.provenance;
      assert.deepEqual(effect.provenance.sourceEvidence,source);assert.equal(effect.provenance.canonicalRuleId,id);
      assert.ok(clause.sourceText.includes(clause.evidence.quote));
      assert.equal(clause.sourceText,clause.sourceFields[0].reduce((v,k)=>v[k],entity.data));
      if([EAGER,ICON_D,ICON_S].includes(id)) {
        const predicate=effect.conditions.find(c=>c.predicate.arguments?.key==='attached')?.predicate;
        assert.equal(predicate?.arguments.equals,effect.targetBinding==='SOURCE_FORMED_MODELS');
      }
      if([ICON_D,ICON_S].includes(id)) {
        assert.equal(effect.equipmentRequirement?.equipmentId,id.replace(':section:1',':wargear:2'));
        assert.deepEqual(effect.equipmentRequirement.sourceFieldPath,['text']);
        assert.ok(effect.conditions.some(c=>c.predicate.arguments?.key==='equipmentRequirementSatisfied'));
      }
      if(id===HOST) {
        assert.equal(effect.conditions.length,1);assert.equal(effect.conditions[0].predicate.arguments.key,'lordOfHostDeclaredBattleline');
        assert.equal(effect.conditions[0].predicate.contextLevel,'ROSTER');assert.equal(effect.conditions[0].predicate.arguments.equals,true);
      }
    }
    if([FREN,EAGER].includes(id))assert.equal(c.assignment.classification,'UNIT_UPGRADE');
  }
  assert.deepEqual(effects(values.find(c=>c.ruleId===HOST))[1].ability.parameters,{distance:6});
}
check(()=>inventory(added));
check(()=>{
  for(const [id,recordId,price] of [[CAC,'mfm-enhancement-dacef9222772aee6',20],
    [FREN,'mfm-enhancement-ca039e696fc806bd',15],[EAGER,'mfm-enhancement-a34fca745cd9fe36',20]]) {
    const c=added.find(c=>c.ruleId===id),record=resolveOwnedFact(recordId);
    assert.equal(c.mfmReferences.enhancementId,recordId);assert.equal(c.mfmReferences.detachmentId,record.detachmentId);
    assert.equal(record.value,price);assert.deepEqual(record.qualifierIds,[]);assert.equal(record.provenance.sourceVersion,'v1.6');
    if(id!==CAC)assert.ok(record.provenance.sourceLocator.sourceTitle.endsWith('(Upgrade)'));
  }
});

// Source integrity and raw accepted occurrence reconciliation. Official native
// text is necessary for Cacophonic's two distinct recipient clauses.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
const pdf=path.join(directory,'sources/emperors-children-faction-pack-v1.3.pdf');
assert.equal(sha(fs.readFileSync(pdf)),'18A192A36C22468368D957AAC3EB230A40C8F7BBFAEFA46372D8918422B0B49A');
const paths=[...new Set(expected.map(([id])=>canonical.get(id).provenance.document))];
const source=JSON.parse(execFileSync(process.env.PYTHON||'python',['-B','-c',
  'import sys,json,pdfplumber; from lxml import html; sys.stdout.reconfigure(encoding="utf-8"); p=pdfplumber.open(sys.argv[1]); print(json.dumps({"cacophonic":p.pages[1].crop((53,433,296,469)).extract_text(x_tolerance=2,y_tolerance=3),"raw":{f:" ".join(html.parse(f).getroot().itertext()) for f in sys.argv[2:]}},ensure_ascii=False));p.close()',
  pdf,...paths.map(p=>path.join(root,p))],{encoding:'utf8',maxBuffer:10*1024*1024}));
const normalized=value=>value.replace(/[‘’]/g,"'").replace(/[▪•]/g,'').replace(/\s/g,'');
for(const [id] of expected)check(()=>{
  const e=canonical.get(id),c=added.find(c=>c.ruleId===id);
  assert.equal(sha(fs.readFileSync(path.join(root,e.provenance.document))),e.provenance.sha256);
  const quote=c.clauses[0].sourceText;
  assert.ok(normalized(id===CAC?source.cacophonic:source.raw[path.join(root,e.provenance.document)]).includes(normalized(quote)),'Source mismatch '+id);
});

const loadouts={'lord-exultant':[1,8],'lord-kakophonist':[1,3],'noise-marines':[4,5],
  'chaos-terminators':[1,5],'flawless-blades':[1,2],'lucius-the-eternal':[1],infractors:[1,4],tormentors:[2,8],daemonettes:[1],seekers:[1,2]};
const unit=(id,name,quantity=1,enhancementIds=[])=>({instanceId:id,canonicalUnitId:'unit-'+name,startingStrength:quantity,
  warlord:false,enhancementIds,selections:[],equipmentContextKnown:true,modelRows:[{rowId:'models',quantity,
    canonicalProfileId:`datasheet-${name}:profile:1`,selections:loadouts[name].map(n=>({selectionKey:'weapon/'+n,
      physicalQuantity:quantity,perModelQuantity:1,canonicalProfileIds:[`datasheet-${name}:weapon:${n}`],canonicalEquipmentIds:[]})),loadouts:[]}]});
const state=(detachments,units)=>({schema:'roster-v2/roster',bookId:'emperors-children',rosterId:'ec/formation-controls',
  detachments:detachments.map((id,i)=>({instanceId:'detachment/'+i,canonicalDetachmentId:'detachment-'+id})),units,attachments:[],warlordInstanceId:null});
function evaluate(input,runtimeBook=book) {
  const state=validateRoster(runtimeBook,input,runtimeBook.rosterAttachmentPolicies),context=createFormationContext(runtimeBook,state,schema);
  return {state,projection:executeRosterEffects(runtimeBook,state,context)};
}
const change=(r,action,leader,target)=>evaluate(changeAttachment(book,r.state,book.rosterAttachmentPolicies,action,leader,target));
const physical=(r,id)=>r.projection.units.find(u=>u.instanceId===id);
const weapons=(r,id)=>physical(r,id).profiles.flatMap(p=>p.weapons);
const hasWeapon=(w,name)=>w.data.abilities.some(a=>a.toUpperCase()===name);
const hasModel=(r,id,canonicalId)=>physical(r,id).profiles.some(p=>p.abilities.some(a=>a.canonicalId===canonicalId));
const noEffect=(r,id,rule)=>assert.equal(physical(r,id).applied.filter(a=>a.ruleId===rule).length,0);
const values=(r,id,key)=>physical(r,id).profiles.map(p=>p.profile.stats[key]);
check(()=>{
  let r=evaluate(state(['elegant-brutes'],[unit('k','lord-kakophonist',1,[CAC]),unit('other','lord-kakophonist'),
    unit('a','noise-marines',6),unit('b','noise-marines',6)]));
  assert.ok(hasModel(r,'k','core-deep-strike'));assert.equal(hasModel(r,'other','core-deep-strike'),false);
  const verify=id=>{for(const w of weapons(r,id))assert.equal(hasWeapon(w,'IGNORES COVER'),w.data.mode==='ranged');};
  verify('k');r=change(r,'ATTACH','k','a');verify('k');verify('a');
  assert.equal(hasModel(r,'a','core-deep-strike'),false);noEffect(r,'b',CAC);noEffect(r,'other',CAC);
  r=change(r,'DETACH','k');noEffect(r,'a',CAC);assert.ok(hasModel(r,'k','core-deep-strike'));
  r=change(r,'REATTACH','k','b');verify('b');noEffect(r,'a',CAC);assert.equal(hasModel(r,'b','core-deep-strike'),false);
  assert.deepEqual(evaluate(r.state).projection,r.projection);
  const off=structuredClone(r.state);off.units[0].enhancementIds=[];r=evaluate(off);assert.equal(hasModel(r,'k','core-deep-strike'),false);noEffect(r,'b',CAC);
});
check(()=>{
  let r=evaluate(state(['elegant-brutes'],[unit('t','chaos-terminators',5,[FREN]),unit('other','chaos-terminators',5),unit('k','lord-kakophonist')]));
  assert.ok(weapons(r,'t').every(w=>hasWeapon(w,'SUSTAINED HITS 1')));noEffect(r,'other',FREN);
  r=change(r,'ATTACH','k','t');assert.ok(weapons(r,'k').every(w=>hasWeapon(w,'SUSTAINED HITS 1')));
  assert.deepEqual(physical(r,'k').enhancementIds,[]);assert.deepEqual(physical(r,'t').enhancementIds,[FREN]);
  r=change(r,'DETACH','k');noEffect(r,'k',FREN);r=change(r,'REATTACH','k','other');noEffect(r,'k',FREN);
  const wrong=structuredClone(r.state);wrong.units[0].enhancementIds=[];wrong.units[2].enhancementIds=[FREN];r=evaluate(wrong);
  noEffect(r,'k',FREN);noEffect(r,'other',FREN); // no borrowed TERMINATOR eligibility
});
check(()=>{
  let r=evaluate(state(['spectacle-of-slaughter'],[unit('f','flawless-blades',3,[EAGER]),unit('other','flawless-blades',3),unit('l','lucius-the-eternal')]));
  assert.deepEqual(values(r,'f','M'),['10"']);assert.deepEqual(values(r,'other','M'),['8"']);
  r=change(r,'ATTACH','l','f');assert.deepEqual(values(r,'l','M'),['10"']);assert.deepEqual(values(r,'f','M'),['10"']);
  r=change(r,'DETACH','l');assert.deepEqual(values(r,'l','M'),['8"']);r=change(r,'REATTACH','l','other');noEffect(r,'l',EAGER);
  const wrong=structuredClone(r.state);wrong.units[0].enhancementIds=[];wrong.units[2].enhancementIds=[EAGER];r=evaluate(wrong);
  noEffect(r,'l',EAGER);noEffect(r,'other',EAGER); // physical UNIT ID cannot be borrowed
});

for(const [name,rule,start,end] of [['daemonettes',ICON_D,85,98],['seekers',ICON_S,81,94]])check(()=>{
  const equipment=`datasheet-${name}:wargear:2`,option=canonical.get(equipment);
  assert.equal(option.data.text.slice(start,end),'daemonic icon');
  const input=state(['carnival-of-excess'],[unit('selected',name,10),unit('other',name,10)]);
  const selection={selectionKey:'icon',physicalQuantity:1,canonicalProfileIds:[],canonicalEquipmentIds:[equipment],
    canonicalFieldPaths:{[equipment]:['/text']},sourceReferences:[{bookId:'emperors-children',entityId:equipment,path:'/text',caption:{start,end}}]};
  input.units[0].selections=[selection];let r=evaluate(input);
  assert.deepEqual(values(r,'selected','LD'),['6+']);assert.deepEqual(values(r,'other','LD'),['7+']);
  assert.deepEqual(r.state.units[0].selections,[selection],'No duplicate or rewritten equipment');
  assert.deepEqual(evaluate(r.state).projection,r.projection);
  for(const alter of [x=>x.units[0].selections=[],x=>x.units[0].selections[0].physicalQuantity=0,
    x=>{const e=`datasheet-${name}:wargear:1`;x.units[0].selections=[{selectionKey:'instrument',physicalQuantity:1,
      canonicalProfileIds:[],canonicalEquipmentIds:[e],canonicalFieldPaths:{[e]:['/text']}}];}]) {
    const off=structuredClone(input);alter(off);r=evaluate(off);assert.deepEqual(values(r,'selected','LD'),['7+']);noEffect(r,'selected',rule);
  }
  const foreign=structuredClone(input);foreign.units[0].selections[0].canonicalEquipmentIds=[`datasheet-${name==='seekers'?'daemonettes':'seekers'}:wargear:2`];
  assert.throws(()=>evaluate(foreign),/Foreign equipment owner/);
});

const hostState=()=>state(['court-of-the-phoenician'],[unit('l','lord-exultant'),unit('other','lord-exultant'),unit('a','infractors',10),unit('b','tormentors',10),unit('f','flawless-blades',3)]);
const confirm=input=>{input.initialAttachmentStep='DECLARE_BATTLE_FORMATIONS';input.initialAttachments=structuredClone(input.attachments);return input;};
const hostGranted=r=>{assert.ok(hasModel(r,'l','core-infiltrators'));assert.ok(hasModel(r,'l','core-scouts'));
  const scouts=physical(r,'l').profiles[0].abilities.find(a=>a.canonicalId==='core-scouts');assert.deepEqual(scouts.parameters,{distance:6});
  for(const id of ['other','a','b','f']){assert.equal(hasModel(r,id,'core-infiltrators'),false);assert.equal(hasModel(r,id,'core-scouts'),false);}};
check(()=>{
  let r=change(evaluate(hostState()),'ATTACH','l','a');assert.equal(hasModel(r,'l','core-scouts'),false,'Current attachment is not timing evidence');
  const context=createFormationContext(book,r.state,schema),predicate=effects(added.find(c=>c.ruleId===HOST))[0].conditions[0].predicate;
  assert.equal(context.evaluatePredicate(predicate,predicateContext(r.state,r.projection,'l','MODEL')),'UNKNOWN');
  r=evaluate(confirm(structuredClone(r.state)));hostGranted(r);
  r=change(r,'DETACH','l');hostGranted(r); // source specifies no loss-on-detach clause
  r=change(r,'REATTACH','l','b');hostGranted(r);assert.deepEqual(evaluate(r.state).projection,r.projection);
});
check(()=>{
  let input=confirm(hostState()),r=change(evaluate(input),'ATTACH','l','a');
  assert.equal(hasModel(r,'l','core-scouts'),false,'Later attachment cannot retroactively qualify');
  input=hostState();input.units[0].enhancementIds=['detachment-court-of-the-phoenician:enhancement:2'];
  r=change(evaluate(input),'ATTACH','l','f');r=evaluate(confirm(structuredClone(r.state)));
  assert.equal(hasModel(r,'l','core-scouts'),false,'Actual legal non-BATTLELINE bodyguard');
  r=change(r,'REATTACH','l','a');assert.equal(hasModel(r,'l','core-scouts'),false,'Original non-BATTLELINE cannot be changed after timing');
});
check(()=>{
  let r=change(evaluate(hostState()),'ATTACH','l','a'),input=structuredClone(r.state);
  input.initialAttachments=structuredClone(input.attachments);r=evaluate(input);assert.equal(hasModel(r,'l','core-scouts'),false,'Undated snapshot remains unknown');
  input.initialAttachmentStep='SHOOTING_PHASE';assert.throws(()=>evaluate(input),/timing/);
  input.initialAttachmentStep='DECLARE_BATTLE_FORMATIONS';input.initialAttachments.push(input.initialAttachments[0]);
  assert.throws(()=>evaluate(input),/capacity|already|attached|Duplicate/i);
  delete input.initialAttachments;assert.throws(()=>evaluate(input),/Missing Declare Battle Formations snapshot/);
});
check(()=>{
  for(const [id,name] of [[CAC,'lord-exultant'],[FREN,'noise-marines'],[EAGER,'infractors']]) {
    const r=evaluate(state([id.split(':')[0].replace('detachment-','')],[unit('wrong',name,name==='lord-exultant'?1:10,[id])]));noEffect(r,'wrong',id);
  }
  const wrong=state(['elegant-brutes'],[unit('t','chaos-terminators',5,[FREN])]);
  wrong.units[0].enhancementAssignments=[{enhancementId:FREN,modelScopeId:'t/models/PROFILE/models'}];
  assert.throws(()=>evaluate(wrong),/non-MODEL Enhancement/);
  for(const id of [CAC,FREN,EAGER])assert.throws(()=>evaluate(state(['mercurial-host'],[unit('wrong-detachment','lord-kakophonist',1,[id])])),/Enhancement context/);
  const noDaemonLeader=evaluate(state(['carnival-of-excess'],[unit('l','lord-exultant'),unit('d','daemonettes',10)]));
  assert.throws(()=>change(noDaemonLeader,'ATTACH','l','d'),/No canonical attachment relation/);
});
check(()=>{
  assert.deepEqual(buildECContracts({formationInputs:[],finalInputs:[]}).contracts,contracts.slice(0,15),'Previous fifteen contracts changed');
  assert.deepEqual(book.entities.filter(e=>e.authority!=='SOURCE_BACKED_SELECTION_BINDING').map(e=>[e.id,e.parentId,e.data,e.provenance,e.fieldProvenance]),facts.entities.map(e=>[e.id,e.parentId,e.data,e.provenance,e.fieldProvenance]));
  assert.equal(artifact.scope.formationRuleFamilies,5);assert.equal(artifact.scope.formationSourceOwners,6);assert.equal(added.length,6);
});

poison(added,x=>x.pop(),inventory);poison(added,x=>x.push(structuredClone(x[0])),inventory);
poison(added,x=>x[0].clauses[0].rosterEffects[0].targetSubject='UNIT',inventory);
poison(added,x=>x[1].roles[0].subject='MODEL',inventory);
poison(added,x=>x[2].clauses[0].rosterEffects[0].value=3,inventory);
poison(added,x=>delete x[3].clauses[0].rosterEffects[0].equipmentRequirement,inventory);
poison(added,x=>x[5].clauses[0].rosterEffects[0].conditions=[],inventory);
poison(added,x=>x[5].clauses[1].rosterEffects[0].ability.parameters.distance=9,inventory);
poison(book,x=>x.entities.find(e=>e.id===HOST).ruleContract.clauses.forEach(c=>c.rosterEffects.forEach(e=>e.conditions=[])),x=>{
  const r=evaluate(hostState(),x);assert.equal(hasModel(r,'l','core-scouts'),false,'Unconditional historical grant detected');
});
poison(book,x=>x.entities.find(e=>e.id===ICON_D).ruleContract.clauses.forEach(c=>c.rosterEffects.forEach(e=>{delete e.equipmentRequirement;e.conditions=e.conditions.filter(c=>c.predicate.arguments?.key!=='equipmentRequirementSatisfied');})),x=>{
  const r=evaluate(state(['carnival-of-excess'],[unit('unselected','daemonettes',10)]),x);assert.deepEqual(values(r,'unselected','LD'),['7+']);
});
assert.equal(JSON.stringify(facts),original);
console.log(JSON.stringify({status:'PASS',ruleFamilies:5,sourceOwners:6,operations:11,checks,mutations,previous15:'PASS',
  confirmedFormationOnly:'PASS',sharedRuntimeChanged:false}));
