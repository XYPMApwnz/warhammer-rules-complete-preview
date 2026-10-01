import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {extendRosterContracts,summarizeRosterContracts} from './roster-contract-build.mjs';
import {evaluatePredicate,validateContracts} from './rule-contract-schema.mjs';
import {parseSourceHtml,sourceNodeText,normalizeSourceText} from './raw-source.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(directory,'../../..');
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
const normalize=value=>normalizeSourceText(value).replace(/[‘’]/g,"'").replace(/[‑–]/g,'-').replace(/\s+/g,' ').toLowerCase();
const get=(entity,field)=>field.reduce((value,key)=>value?.[key],entity.data);
const byId=model=>new Map(model.entities.map(e=>[e.id,e]));
const hasClass=(node,token)=>(node.attrs?.class||'').split(/\s+/).includes(token);
const walk=node=>[node,...node.children.flatMap(walk)];
const text=index=>['blocks',index,'text'];

// This source adjudication is intentionally independent of producer declarations.
// Each signature below follows the quoted accepted clause, including its exact recipient.
const expected=[
 ['datasheet-biologus-putrifier:section:1','source-clause-1',text(0),'weapons equipped by models in that unit have the [LETHAL HITS] ability',[
   ['GRANT_WEAPON_ABILITY','SOURCE_FORMED_MODELS','MODEL',null,null,null,'LETHAL HITS']]],
 ['datasheet-deathshroud-terminators:section:1','source-clause-1',text(0),'that CHARACTER model has the Feel No Pain 4+ ability',[
   ['GRANT_MODEL_ABILITY','LEADERS_OF_SOURCE','MODEL',null,null,null,{name:'Feel No Pain',value:4}]]],
 ['datasheet-helbrute:section:1','source-clause-2',text(1),'add 2 to the Attacks characteristic of those two weapons',[
   ['MODIFY_STAT','SOURCE_MODEL','MODEL','attacks','ADD',2,null,'melee']]],
 ['datasheet-icon-bearer:section:1','source-clause-1',text(0),'add 1 to the Objective Control characteristic of models in that unit',[
   ['MODIFY_STAT','SOURCE_FORMED_MODELS','MODEL','OC','ADD',1]]],
 ['datasheet-lord-of-contagion:section:1','source-clause-1',text(0),'melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] and [LANCE] abilities',[
   ['GRANT_WEAPON_ABILITY','SOURCE_FORMED_MODELS','MODEL',null,null,null,'SUSTAINED HITS 1','melee'],
   ['GRANT_WEAPON_ABILITY','SOURCE_FORMED_MODELS','MODEL',null,null,null,'LANCE','melee']]],
 ['datasheet-lord-of-poxes:section:1','source-clause-1',text(0),'Add 3" to the range of this model’s Contagion Range',[
   ['MODIFY_RULE_METRIC','SOURCE_MODEL','MODEL','contagionRange','ADD',3]]],
 ['datasheet-noxious-blightbringer:section:1','source-clause-1',text(0),'add 1" to the Move characteristic of models in that unit',[
   ['MODIFY_STAT','SOURCE_FORMED_MODELS','MODEL','M','ADD',1]]],
 ['datasheet-plague-drones:section:1','source-clause-2',text(1),'Models in the bearer’s unit have a Leadership characteristic of 6+',[
   ['MODIFY_STAT','SOURCE_UNIT_MODELS','MODEL','LD','SET',6]]],
 ['datasheet-plaguebearers:section:1','source-clause-2',text(1),'Models in the bearer’s unit have a Leadership characteristic of 6+',[
   ['MODIFY_STAT','SOURCE_UNIT_MODELS','MODEL','LD','SET',6]]],
 ['detachment-virulent-vectorium:enhancement:2','weapon-modifiers',['text'],'Add 1 to the Strength and Attacks characteristics of the bearers melee weapons',[
   ['MODIFY_STAT','SOURCE_MODEL','MODEL','strength','ADD',1,null,'melee'],
   ['MODIFY_STAT','SOURCE_MODEL','MODEL','attacks','ADD',1,null,'melee'],
   ['GRANT_WEAPON_ABILITY','SOURCE_MODEL','MODEL',null,null,null,'DEVASTATING WOUNDS','melee']]],
 ['detachment-virulent-vectorium:enhancement:4','feel-no-pain',['text'],'The bearer has the Feel No Pain 5+ ability',[
   ['GRANT_MODEL_ABILITY','SOURCE_MODEL','MODEL',null,null,null,{name:'Feel No Pain',value:5}]]],
 ['detachment-shamblerot-vectorium:enhancement:1','objective-control',['text'],'add 1 to the Objective Control characteristic of models in that unit',[
   ['MODIFY_STAT','SOURCE_FORMED_MODELS','MODEL','OC','ADD',1]]],
 ['detachment-shamblerot-vectorium:enhancement:3','plague-wind-damage',['text'],'add 1 to the Damage characteristic of the bearer’s Plague Wind weapon',[
   ['MODIFY_STAT','SOURCE_MODEL','MODEL','damage','ADD',1]]],
 ['detachment-shamblerot-vectorium:enhancement:4','poxwalkers-toughness',['text'],'add 1 to the Toughness characteristic of POXWALKERS models in that unit',[
   ['MODIFY_STAT','SOURCE_FORMED_MODELS','MODEL','T','ADD',1]]],
 ['detachment-tallyband-summoners:enhancement:2','melee-attacks',['text'],'Add 2 to the Attacks characteristic of the bearer’s melee weapons',[
   ['MODIFY_STAT','SOURCE_MODEL','MODEL','attacks','ADD',2,null,'melee']]],
 ['detachment-death-lords-chosen:enhancement:2','movement',['text'],'add 1" to the Movement characteristic of models in that unit',[
   ['MODIFY_STAT','SOURCE_FORMED_MODELS','MODEL','M','ADD',1]]],
 ['detachment-contagion-engines:enhancement:2','mobile',['text'],'This unit has MOBILE',[
   ['GRANT_UNIT_KEYWORD','SOURCE_UNIT','UNIT',null,null,null,'MOBILE']]],
 ['detachment-flyblown-host:enhancement:2','detection-range',['text'],'This unit has -3" detection range',[
   ['MODIFY_RULE_METRIC','SOURCE_UNIT','UNIT','detectionRange','ADD',-3]]],
 ['detachment-shamblerot-vectorium:rule','battleline',['text'],'POXWALKERS units from your army gain the BATTLELINE keyword',[
   ['GRANT_UNIT_KEYWORD','ROSTER_UNITS','UNIT',null,null,null,'BATTLELINE']]],
 ['detachment-paragons-of-putrescence:rule','contagion-range',['text'],'Friendly DEATH GUARD CHARACTER units have +3" to their Contagion Range (to a maximum of 12")',[
   ['MODIFY_RULE_METRIC','ROSTER_UNITS','UNIT','contagionRange','ADD',3]]],
 ['detachment-contagion-engines:rule','grant-contagion-engine',['text'],'units have CONTAGION ENGINE',[
   ['GRANT_UNIT_KEYWORD','ROSTER_UNITS','UNIT',null,null,null,'CONTAGION ENGINE']]],
 ['detachment-contagion-engines:rule','ranged-assault',['text'],'Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT]',[
   ['GRANT_WEAPON_ABILITY','ROSTER_UNITS','UNIT',null,null,null,'ASSAULT','ranged']]]
];
const expectedKeys=new Set(expected.map(row=>row[0]+'\0'+row[1]));
const atomShape=(predicate,subject,contextLevel,arguments_)=>({predicate,subject,contextLevel,arguments:arguments_});
const condShape=(binding,predicate)=>({binding,predicate});
const lead=()=>condShape('SOURCE',atomShape('LEADING','MODEL','ROSTER',{value:true}));
const poxBodyguard=()=>condShape('SOURCE',atomShape('BODYGUARD_ID','MODEL','ROSTER',{id:'unit-poxwalkers'}));
const gear=subject=>condShape('SOURCE',atomShape('FIELD',subject,'ROSTER',{key:'equipmentRequirementSatisfied',equals:true}));
const unitKeyword=keyword=>condShape('TARGET',atomShape('UNIT_KEYWORD','UNIT','STATIC',{keyword}));
const expectedConditions=new Map([
 ['datasheet-biologus-putrifier:section:1\0source-clause-1',[lead()]],
 ['datasheet-deathshroud-terminators:section:1\0source-clause-1',[condShape('TARGET',atomShape('MODEL_KEYWORD','MODEL','STATIC',{keyword:'CHARACTER'})),condShape('TARGET',atomShape('LEADING','MODEL','ROSTER',{value:true}))]],
 ['datasheet-helbrute:section:1\0source-clause-2',[gear('MODEL')]],
 ['datasheet-icon-bearer:section:1\0source-clause-1',[lead()]],
 ['datasheet-lord-of-contagion:section:1\0source-clause-1',[lead()]],
 ['datasheet-noxious-blightbringer:section:1\0source-clause-1',[lead()]],
 ['datasheet-plague-drones:section:1\0source-clause-2',[gear('UNIT')]],
 ['datasheet-plaguebearers:section:1\0source-clause-2',[gear('UNIT')]],
 ['detachment-shamblerot-vectorium:enhancement:1\0objective-control',[lead(),poxBodyguard()]],
 ['detachment-shamblerot-vectorium:enhancement:3\0plague-wind-damage',[lead(),poxBodyguard()]],
 ['detachment-shamblerot-vectorium:enhancement:4\0poxwalkers-toughness',[lead(),condShape('TARGET',atomShape('MODEL_KEYWORD','MODEL','STATIC',{keyword:'POXWALKERS'}))]],
 ['detachment-death-lords-chosen:enhancement:2\0movement',[lead()]],
 ['detachment-shamblerot-vectorium:rule\0battleline',[unitKeyword('POXWALKERS')]],
 ['detachment-paragons-of-putrescence:rule\0contagion-range',[unitKeyword('DEATH GUARD'),unitKeyword('CHARACTER')]],
 ['detachment-contagion-engines:rule\0grant-contagion-engine',[condShape('TARGET',{op:'ANY',args:['FOETID BLOAT-DRONE','FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER','HELBRUTE','MYPHITIC BLIGHT-HAULER'].map(keyword=>atomShape('UNIT_KEYWORD','UNIT','STATIC',{keyword}))})]],
 ['detachment-contagion-engines:rule\0ranged-assault',[unitKeyword('CONTAGION ENGINE')]]
]);
const predicateShape=node=>node.predicate?atomShape(node.predicate,node.subject,node.contextLevel,node.arguments):{op:node.op,args:node.args.map(predicateShape)};
const conditionsShape=conditions=>conditions.map(c=>condShape(c.binding,predicateShape(c.predicate)));
function signature(effect) {return [effect.operation,effect.targetBinding,effect.targetSubject,effect.field??null,effect.mode??null,effect.value??null,effect.ability??effect.keyword??null,effect.weaponMode??null];}
const signatureExpected=values=>Array.from({length:8},(_,i)=>values[i]??null);
const clauseFor=(index,rule,clause)=>index.get(rule)?.ruleContract.clauses.find(c=>c.id===clause);
const pnodes=node=>node?.predicate?[node]:node?.args?.flatMap(pnodes)||[];
const nonEffectStratagemClauses=new Set([
 'detachment-virulent-vectorium:stratagem:6:recipient-selector','detachment-shamblerot-vectorium:stratagem:6:attacker',
 'detachment-tallyband-summoners:stratagem:2:anchor-selector','detachment-tallyband-summoners:stratagem:6:initial-trigger',
 'detachment-death-lords-chosen:stratagem:2:recipient-selector','detachment-mortarions-hammer:stratagem:3:recipient-selector',
 'detachment-champions-of-contagion:stratagem:2:recipient-selector','detachment-champions-of-contagion:stratagem:6:recipient-selector',
 'detachment-virulent-vectorium:stratagem:5:effect-clause:1','detachment-death-lords-chosen:stratagem:4:effect-clause:1',
 'detachment-mortarions-hammer:stratagem:1:effect-clause:1','detachment-mortarions-hammer:stratagem:5:effect-clause:1'
]);
function expectedClassification(entity,clause) {
  if(expectedKeys.has(entity.id+'\0'+clause.id))return 'ROSTER_EXECUTABLE';
  if(entity.ruleContract.kind==='STRATAGEM')return nonEffectStratagemClauses.has(clause.id)?'NOT_AN_EFFECT':'BATTLE_ONLY';
  if(entity.kind==='DETACHMENT_RULE')return ['include-plague-legions','warlord-restriction','exclusive-detachment'].includes(clause.id)?'NOT_AN_EFFECT':'BATTLE_ONLY';
  if(entity.kind==='ENHANCEMENT')return 'BATTLE_ONLY';
  if(entity.kind==='SOURCE_ERRATUM'||entity.kind==='BOOK_USAGE_RULES')return 'DISPLAY_ONLY';
  if(entity.ruleContract.kind==='ARMY_RULE')return entity.id==='army-rule-pact-of-decay'?'NOT_AN_EFFECT':'BATTLE_ONLY';
  if(entity.ruleContract.kind==='DATASHEET_ABILITY')return 'BATTLE_ONLY';
  if(entity.kind==='DATASHEET_SECTION'&&(['DEPLOYMENT','LORD OF THE DEATH GUARD'].includes(entity.data.title)||entity.data.title.startsWith('DAMAGED:')))return 'BATTLE_ONLY';
  return 'NOT_AN_EFFECT';
}
export function verifyRosterContracts(model) {
  const index=byId(model),rows=model.entities.flatMap(e=>(e.ruleContract?.clauses||[]).map(c=>[e,c]));
  assert.equal(rows.length,306,'Complete current clause census');
  assert.deepEqual(new Set(rows.filter(([,c])=>c.rosterEffects?.length).map(([e,c])=>e.id+'\0'+c.id)),expectedKeys,'Source-backed roster clause population');
  for(const [entity,clause] of rows) {
    assert.equal(clause.rosterClassification,expectedClassification(entity,clause),'Source classification '+entity.id+'/'+clause.id);
    assert.ok(clause.rosterClassificationNote?.reason,'Explicit classified remainder');
    if(clause.rosterClassification!=='ROSTER_EXECUTABLE')assert.deepEqual(clause.rosterEffects,[],'No implicit battle execution');
  }
  for(const [ruleId,clauseId,field,fragment,signatures] of expected) {
    const entity=index.get(ruleId),clause=clauseFor(index,ruleId,clauseId);assert.ok(normalize(get(entity,field)).includes(normalize(fragment)),'Independent source meaning '+ruleId);
    assert.deepEqual(clause.rosterEffects.map(signature),signatures.map(signatureExpected),'Independent recipient/operation/value '+ruleId+'/'+clauseId);
    for(const effect of clause.rosterEffects) {
      assert.deepEqual(effect.sourceFields,[field],'Exact existing source field binding');assert.ok(get(entity,effect.evidence.field).includes(effect.evidence.quote),'Exact evidence quote');assert.ok(effect.lifetime,'Source effect lifetime');
      assert.deepEqual(conditionsShape(effect.conditions),expectedConditions.get(ruleId+'\0'+clauseId)||[],'Independent semantic participant/condition/context '+ruleId+'/'+clauseId);
      const lifetime=entity.kind==='ENHANCEMENT'?'WHILE_ENHANCEMENT_ASSIGNED':entity.kind==='DETACHMENT_RULE'?'WHILE_DETACHMENT_SELECTED':ruleId==='datasheet-deathshroud-terminators:section:1'?'WHILE_LEADING_SOURCE_UNIT':ruleId==='datasheet-helbrute:section:1'?'WHILE_EQUIPMENT_REQUIREMENT_SATISFIED':ruleId==='datasheet-lord-of-poxes:section:1'?'WHILE_SOURCE_MODEL_HAS_RULE':['datasheet-plague-drones:section:1','datasheet-plaguebearers:section:1'].includes(ruleId)?'WHILE_DAEMONIC_ICON_BEARER_IS_IN_UNIT':'WHILE_LEADING';
      assert.equal(effect.lifetime,lifetime,'Independent source lifetime '+ruleId);
      for(const c of effect.conditions)for(const p of pnodes(c.predicate)) {
        assert.ok(['SOURCE','TARGET'].includes(c.binding),'Finite participant context binding');assert.ok(['STATIC','ROSTER'].includes(p.contextLevel),'No BATTLE roster effect condition');
        const evidenceOwner=index.get(p.evidence.otherEntityId||ruleId);assert.ok(get(evidenceOwner,p.evidence.field).includes(p.evidence.quote),'Independent condition evidence');
        assert.notEqual(evaluatePredicate(p,{subject:p.subject,keywords:new Set(),abilities:new Set(),roster:{}}),'INVALID','Use existing typed predicate evaluator');
      }
    }
  }
  const effects=(rule,clause)=>clauseFor(index,rule,clause).rosterEffects;
  const leadingEffects=['datasheet-biologus-putrifier:section:1','datasheet-icon-bearer:section:1','datasheet-lord-of-contagion:section:1','datasheet-noxious-blightbringer:section:1'];
  for(const id of leadingEffects)for(const effect of effects(id,'source-clause-1'))assert.ok(effect.conditions.some(c=>c.binding==='SOURCE'&&c.predicate.predicate==='LEADING'&&c.predicate.subject==='MODEL'),'Source model must lead');
  for(const [id,cid] of [['detachment-shamblerot-vectorium:enhancement:1','objective-control'],['detachment-shamblerot-vectorium:enhancement:3','plague-wind-damage'],['detachment-shamblerot-vectorium:enhancement:4','poxwalkers-toughness'],['detachment-death-lords-chosen:enhancement:2','movement']]) {
    const effect=effects(id,cid)[0];assert.ok(effect.conditions.some(c=>c.binding==='SOURCE'&&c.predicate.predicate==='LEADING'&&c.predicate.subject==='MODEL'),'Enhancement source model must lead');
    if(id.endsWith(':1')||id.endsWith(':3'))assert.ok(effect.conditions.some(c=>c.binding==='SOURCE'&&c.predicate.predicate==='BODYGUARD_ID'&&c.predicate.arguments.id==='unit-poxwalkers'),'Exact required Poxwalkers Bodyguard');
  }
  const silent=effects('datasheet-deathshroud-terminators:section:1','source-clause-1')[0];assert.deepEqual(silent.conditions.map(c=>[c.binding,c.predicate.predicate,c.predicate.subject,c.predicate.contextLevel]),[['TARGET','MODEL_KEYWORD','MODEL','STATIC'],['TARGET','LEADING','MODEL','ROSTER']]);
  const pox=effects('detachment-shamblerot-vectorium:enhancement:4','poxwalkers-toughness')[0];assert.ok(pox.conditions.some(c=>c.binding==='TARGET'&&c.predicate.predicate==='MODEL_KEYWORD'&&c.predicate.arguments.keyword==='POXWALKERS'),'Poxwalker models only; unit keyword union does not qualify Leader models');
  const sorrows=effects('detachment-shamblerot-vectorium:enhancement:3','plague-wind-damage')[0];assert.deepEqual(sorrows.weaponIds,['datasheet-malignant-plaguecaster:weapon:2','datasheet-malignant-plaguecaster:weapon:3'],'Both named Plague Wind profiles, no other bearer weapon');
  const frenzy=effects('datasheet-helbrute:section:1','source-clause-2')[0];assert.deepEqual(frenzy.excludeWeaponIds,['datasheet-helbrute:weapon:10']);assert.deepEqual(frenzy.equipmentRequirement,{binding:'SOURCE',kind:'WEAPON_COUNT',weaponMode:'melee',excludeWeaponIds:['datasheet-helbrute:weapon:10'],equals:2});assert.ok(frenzy.conditions.some(c=>c.binding==='SOURCE'&&c.predicate.predicate==='FIELD'&&c.predicate.subject==='MODEL'&&c.predicate.arguments.key==='equipmentRequirementSatisfied'),'Explicit selected weapon prerequisite');
  for(const unit of ['plague-drones','plaguebearers']) {
    const icon=effects(`datasheet-${unit}:section:1`,'source-clause-2')[0];assert.deepEqual(icon.equipmentRequirement,{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:`datasheet-${unit}:wargear:2`,sourceFieldPath:['text']});assert.ok(icon.conditions.some(c=>c.binding==='SOURCE'&&c.predicate.predicate==='FIELD'&&c.predicate.subject==='UNIT'&&c.predicate.arguments.key==='equipmentRequirementSatisfied'),'Icon selected in exact source unit');
  }
  for(const [id,cid] of [['datasheet-lord-of-poxes:section:1','source-clause-1'],['detachment-paragons-of-putrescence:rule','contagion-range']])assert.equal(effects(id,cid)[0].max,12,'Source Contagion Range cap');
  const cap=effects('datasheet-lord-of-poxes:section:1','source-clause-1')[0].maxEvidence;assert.deepEqual(cap,{otherEntityId:'army-rule-nurgles-gift:contagion-range',field:['text'],quote:'Contagion Range cannot be greater than 12" after modifiers.'});assert.ok(get(index.get(cap.otherEntityId),cap.field).includes(cap.quote));
  for(const id of ['datasheet-biologus-putrifier:section:1','datasheet-noxious-blightbringer:section:1'])assert.ok(clauseFor(index,id,'source-clause-1').rosterClassificationNote.deferredBattleEffects?.length,'Compound source battle branch accounted');
  return {clauses:rows.length,rosterClauses:expectedKeys.size,rosterEffects:expected.reduce((sum,row)=>sum+row[4].length,0)};
}
function rawSourceQA(model) {
  const corpus=JSON.parse(fs.readFileSync(path.join(root,'books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json'),'utf8')),index=byId(model),texts=new Map(),intrinsicFnp=[];
  let abilityBlocks=0,physicalPages=0;const rawWeaponNames=new Map();
  for(const page of corpus.pages) {
    const file=path.join(directory,'sources/accepted-waha-pages',page.file),bytes=fs.readFileSync(file);assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(),page.sha256.toUpperCase(),'Accepted raw bytes');
    const html=bytes.toString('utf8'),tree=parseSourceHtml(html),all=walk(tree),frame=all.find(n=>hasClass(n,'dsOuterFrame'));
    if(!frame)continue;physicalPages++;
    const source=corpus.datasheets.find(d=>d.url===page.url),unit=source.sourceId.replace('datasheet-','unit-'),scope=frame.children.slice(0,frame.children.findIndex(n=>hasClass(n,'ds2colKWFlat'))),physical=scope.flatMap(walk),sections=[];
    for(const n of physical.filter(n=>n.tag==='div'&&hasClass(n,'dsHeader'))) {
      const siblings=n.parent.children,start=siblings.indexOf(n),blocks=[];
      for(let i=start+1;i<siblings.length&&!hasClass(siblings[i],'dsHeader');i++)if(hasClass(siblings[i],'dsAbility')&&!/^YOUR\b.*COST/i.test(normalizeSourceText(sourceNodeText(html,siblings[i]))))blocks.push(sourceNodeText(html,siblings[i]));
      if(blocks.length)sections.push({title:normalizeSourceText(sourceNodeText(html,n)),blocks});
    }
    assert.deepEqual(sections.map(s=>s.title),source.sections.map(s=>s.title),'Raw section population');
    sections.forEach((section,i)=>section.blocks.forEach((value,block)=>{texts.set(source.sections[i].sourceId+'\0'+JSON.stringify(text(block)),normalize(value));if(section.title==='ABILITIES')abilityBlocks++;}));
    const options=physical.filter(n=>hasClass(n,'dsWargearOptionsList')).flatMap(n=>n.children.filter(z=>z.tag==='ul').flatMap(z=>z.children.filter(li=>li.tag==='li')));assert.equal(options.length,source.wargearOptions.length);
    options.forEach((n,i)=>texts.set(source.wargearOptions[i].sourceId+'\0'+JSON.stringify(['text']),normalize(sourceNodeText(html,n))));
    const weapons=physical.filter(n=>hasClass(n,'dsWeaponRow'));assert.equal(weapons.length,source.weapons.length);weapons.forEach((n,i)=>rawWeaponNames.set(source.weapons[i].sourceId,normalizeSourceText(sourceNodeText(html,walk(n).find(z=>hasClass(z,'dsWeaponName'))))));
    const label=physical.filter(n=>hasClass(n,'dsCoreArmy')).map(n=>sourceNodeText(html,n)).join(' '),match=label.match(/Feel No Pain (\d)\+/);if(match)intrinsicFnp.push([unit,Number(match[1])]);
  }
  assert.equal(physicalPages,36);assert.equal(abilityBlocks,64,'Fresh physical source ability blocks, plus one supplemental weapon ability');
  assert.deepEqual(intrinsicFnp.sort(),[['unit-chaos-spawn',5],['unit-great-unclean-one',6],['unit-mortarion',5],['unit-poxwalkers',5],['unit-rotigus',6]].sort(),'Complete intrinsic FNP references initialize model facts, not extra effect operations');
  const hub=fs.readFileSync(path.join(directory,'sources/accepted-waha-pages/death-guard.html'),'utf8'),hubTree=parseSourceHtml(hub),nodes=walk(hubTree),crusade=nodes.findIndex(n=>n.attrs?.id==='Crusade-Rules'),heads=nodes.filter((n,i)=>n.tag==='h2'&&walk(n).some(z=>hasClass(z,'dpPts'))&&i<crusade);
  assert.equal(heads.length,9,'Fresh source Detachment population');
  for(let d=0;d<heads.length;d++) {
    const start=nodes.indexOf(heads[d]),end=d+1<heads.length?nodes.indexOf(heads[d+1]):crusade,part=nodes.slice(start,end),title=normalizeSourceText(sourceNodeText(hub,heads[d])).replace(/\d+DP$/,'').trim(),det=corpus.detachments.find(x=>x.title===title);assert.ok(det,'Explicit accepted source address');
    const ruleHead=part.find(n=>n.tag==='h2'&&normalizeSourceText(sourceNodeText(hub,n))==='Detachment Rule'),wrapper=ruleHead.parent,body=wrapper.parent.children[wrapper.parent.children.indexOf(wrapper)+1];texts.set(det.rule.sourceId+'\0'+JSON.stringify(['text']),normalize(sourceNodeText(hub,body)));
    const enhancements=part.filter(n=>hasClass(n,'EnhancementsPts'));assert.equal(enhancements.length,det.enhancements.length);
    enhancements.forEach((n,i)=>texts.set(det.enhancements[i].sourceId+'\0'+JSON.stringify(['text']),normalize(n.parent.children.filter(z=>z.tag==='p'&&!hasClass(z,'ShowFluff')).map(z=>sourceNodeText(hub,z)).join(' '))));
  }
  for(const [rule,clause,field,fragment] of expected)assert.ok(texts.get(rule+'\0'+JSON.stringify(field))?.includes(normalize(fragment)),'Independent accepted raw source scope '+rule+'/'+clause);
  const named=[['datasheet-malignant-plaguecaster:weapon:2','Plague Wind – witchfire'],['datasheet-malignant-plaguecaster:weapon:3','Plague Wind – focused witchfire'],['datasheet-helbrute:weapon:10','Close combat weapon']];
  for(const [id,name] of named) {assert.equal(index.get(id).data.name,name);assert.equal(rawWeaponNames.get(id),name,'Named weapon explicit ID against raw physical profile');}
  for(const unit of ['plague-drones','plaguebearers']) {const id=`datasheet-${unit}:wargear:2`;assert.ok(texts.get(id+'\0'+JSON.stringify(['text'])).includes(normalize('1 daemonic icon.')),'Selected equipment explicit ID against raw option');assert.equal(normalize(get(index.get(id),['text'])),texts.get(id+'\0'+JSON.stringify(['text'])),'Exact raw source equipment option');}
  const pdfPath=path.join(directory,'sources/gw-death-guard-faction-pack-2026-09-30.pdf'),enrollment=read('sources/source-enrollment.json'),source=enrollment.sources.find(s=>s.path.endsWith('gw-death-guard-faction-pack-2026-09-30.pdf'));
  assert.equal(createHash('sha256').update(fs.readFileSync(pdfPath)).digest('hex').toUpperCase(),source.sha256.toUpperCase());
  const bundled=path.join(process.env.USERPROFILE||'','.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'),python=process.env.DG_QA_PYTHON||(fs.existsSync(bundled)?bundled:'python');
  const result=spawnSync(python,['-c',"import json,sys,pdfplumber\nwith pdfplumber.open(sys.argv[1]) as p:\n print(json.dumps({str(n):p.pages[n-1].crop((28,190,p.pages[n-1].width/2,p.pages[n-1].height-28)).extract_text() for n in [2,3,4]}|{'cap':p.pages[6].crop((28,200,295,805)).extract_text()},ensure_ascii=True))",pdfPath],{encoding:'utf8'});
  assert.equal(result.status,0,'Offline current official PDF extraction: '+result.stderr);const pages=JSON.parse(result.stdout);
  for(const [rule,,field,fragment] of expected) {const page=rule.startsWith('detachment-contagion-engines:')?'2':rule.startsWith('detachment-flyblown-host:')?'3':rule.startsWith('detachment-paragons-of-putrescence:')?'4':null;if(page)assert.ok(normalize(pages[page]).includes(normalize(fragment)),'Current official source roster operation '+rule);}
  assert.ok(normalize(pages.cap).includes(normalize('Contagion Range cannot be greater than 12" after modifiers.')),'Current official army cap source');
  return {rawPages:physicalPages,abilityBlocks,intrinsicFnp:intrinsicFnp.length,rawRosterClauseMeanings:expected.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const original=read('generated/rule-contract-effective.json'),before=structuredClone(original),extended=extendRosterContracts(original);assert.deepEqual(original,before,'Producer input is immutable');
  const strip=model=>{const copy=structuredClone(model);for(const entity of copy.entities)for(const clause of entity.ruleContract?.clauses||[])for(const key of ['rosterClassification','rosterClassificationNote','rosterEffects'])delete clause[key];return copy;};assert.equal(createHash('sha256').update(JSON.stringify(strip(extended))).digest('hex'),createHash('sha256').update(JSON.stringify(strip(original))).digest('hex'),'No source, data, provenance, role or old predicate modification');
  validateContracts(extended);const semantics=verifyRosterContracts(extended),source=rawSourceQA(extended);let mutations=0;
  for(const [id,cid] of expected) {
    for(const mutate of [c=>{c.rosterEffects=[];},c=>{c.rosterClassification='BATTLE_ONLY';},c=>{c.rosterEffects[0].targetBinding='ROSTER_UNITS';c.rosterEffects[0].targetSubject=c.rosterEffects[0].targetSubject==='MODEL'?'UNIT':'MODEL';}]) {
      const copy=structuredClone(extended);mutate(clauseFor(byId(copy),id,cid));assert.throws(()=>verifyRosterContracts(copy),'Missing/wrong coordinated source operation '+id);mutations++;
    }
    const effects=clauseFor(byId(extended),id,cid).rosterEffects;
    for(let number=0;number<effects.length;number++) {
      const copy=structuredClone(extended);clauseFor(byId(copy),id,cid).rosterEffects[number].lifetime='PHASE_END';assert.throws(()=>verifyRosterContracts(copy),'Wrong source lifetime');mutations++;
      for(let c=0;c<effects[number].conditions.length;c++)for(let a=0;a<pnodes(effects[number].conditions[c].predicate).length;a++)for(const field of ['subject','contextLevel','arguments']) {
        const changed=structuredClone(extended),effect=clauseFor(byId(changed),id,cid).rosterEffects[number],node=pnodes(effect.conditions[c].predicate)[a];node[field]=field==='subject'?(node.subject==='MODEL'?'UNIT':'MODEL'):field==='contextLevel'?'BATTLE':{equals:'UNSOURCED'};assert.throws(()=>verifyRosterContracts(changed),'Wrong source participant predicate');mutations++;
      }
    }
  }
  for(const [entity,clause] of extended.entities.flatMap(e=>(e.ruleContract?.clauses||[]).map(c=>[e,c])).filter(([,c])=>c.rosterClassification!=='ROSTER_EXECUTABLE')) {
    const copy=structuredClone(extended);clauseFor(byId(copy),entity.id,clause.id).rosterClassification='ROSTER_EXECUTABLE';assert.throws(()=>verifyRosterContracts(copy),'Unsupported roster promotion');mutations++;
  }
  const silent=clauseFor(byId(extended),'datasheet-deathshroud-terminators:section:1','source-clause-1').rosterEffects[0];
  const keyword=silent.conditions[0].predicate,leading=silent.conditions[1].predicate;
  assert.equal(evaluatePredicate(keyword,{subject:'MODEL',keywords:new Set(['CHARACTER']),roster:{}}),'TRUE');assert.equal(evaluatePredicate(keyword,{subject:'MODEL',keywords:new Set(['DEATH GUARD']),roster:{}}),'FALSE');assert.equal(evaluatePredicate(keyword,{subject:'UNIT',keywords:new Set(['CHARACTER']),roster:{}}),'INVALID');
  for(const value of [true,false,undefined])assert.equal(evaluatePredicate(leading,{subject:'MODEL',roster:value===undefined?{}:{leading:value}}),value===undefined?'UNKNOWN':value?'TRUE':'FALSE');
  const closure=summarizeRosterContracts(extended);assert.equal(fs.readFileSync(path.join(directory,'generated/roster-contract-closure.json'),'utf8'),JSON.stringify(closure,null,2)+'\n','Deterministic full clause ledger');
  console.log(JSON.stringify({status:'PASS',semantics,source,mutations,classifications:closure.classifications}));
}
