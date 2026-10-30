/** O-1: independent named-rule expectations on constructed physical rosters.
 * These snapshots are QA fixtures, not claimed user exports. No source facts,
 * gameplay effects or persistent state are modified by presentation checks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
import {validateRoster,changeAttachment} from '../books/shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../books/shared/roster-v2/effects.mjs';
import {createRosterConditionContext} from '../books/shared/roster-v2/condition-context.mjs';
import {projectEffectiveInstance} from '../books/shared/roster-v2/effective-instance.mjs';
import {presentationRecipientLinks,validatePresentationRecipientLink,validateBookRecipients,resolveRecipient} from '../books/shared/rule-contract-v2/recipients.mjs';
import {detachmentTextDeclaration} from '../books/shared/roster-v2/conditional-policy.mjs';
import {normalizeCSMEffectiveBook} from '../books/chaos-space-marines/v2/roster-presentation.mjs';
import {createSpaceMarinesRosterRuntime} from '../books/space-marines/v2/roster-runtime.mjs';
import {createBloodAngelsRosterRuntime} from '../books/blood-angels/v2/roster-runtime.mjs';
import {createDarkAngelsRosterRuntime} from '../books/dark-angels/v2/roster-runtime.mjs';
import {createCSMBrowserRoster} from '../books/chaos-space-marines/v2/roster-boot.mjs';
import {createECBrowserRoster} from '../books/emperors-children/v2/roster-boot.mjs';
import {createTauBrowserRoster} from '../books/tau-empire/v2/roster-boot.mjs';
import {createTyranidsBrowserRoster} from '../books/tyranids/v2/roster-boot.mjs';
import {validateAttachedRuleTextPresentation} from '../books/shared/army-book-app-v2/personal.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const clone=structuredClone,read=file=>parseSourceFixtureJSON(fs.readFileSync(path.join(root,file),'utf8'));
const files={'death-guard':'rule-contract-effective','adeptus-mechanicus':'roster-runtime',
  'chaos-space-marines':'roster-runtime','emperors-children':'roster-attachments',
  'blood-angels':'roster-runtime','dark-angels':'roster-runtime','space-marines':'roster-runtime',
  'tau-empire':'roster-import','tyranids':'roster-runtime'};
const books=new Map(Object.entries(files).map(([id,file])=>[id,read(`books/${id}/v2/generated/${file}.json`)]));
const importMetadata=new Map();
const checks=[],failures=[],observations=[];
const check=(name,run)=>{try{run();checks.push(name);}catch(error){failures.push({name,message:error.message,stack:error.stack});}};
const entity=(book,id)=>{const found=book.entities.find(record=>record.id===id);assert.ok(found,'Missing fixture identity '+id);return found;};
const title=record=>record.data.title||record.data.name;
const normalize=value=>String(value).replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();

// These named obligations are fixed independently of the projection algorithm.
// An ability name locates the accepted named block, never a production recipient.
const dg=[
 ['Foul Infusion','biologus-putrifier','plague-marines'],
 ['Unclean Icon','icon-bearer','plague-marines'],
 ['Vector of Disease','lord-of-contagion','deathshroud-terminators'],
 ['Sickening Vitality','noxious-blightbringer','poxwalkers'],
 ['Silent Bodyguard','lord-of-contagion','deathshroud-terminators',null,true],
 ['Witherbone Pipes','noxious-blightbringer','poxwalkers','detachment-shamblerot-vectorium:enhancement:1'],
 ['Talisman of Burgeoning','noxious-blightbringer','poxwalkers','detachment-shamblerot-vectorium:enhancement:4'],
 ['Vile Vigour','lord-of-contagion','deathshroud-terminators','detachment-death-lords-chosen:enhancement:2']
];
const am=[
 ['Robotic Bodyguard','cybernetica-datasmith','kastelan-robots',null,true],
 ['Lord of the Machine Cult','tech-priest-dominus','skitarii-rangers'],
 ['Galvanic Field','tech-priest-manipulus','skitarii-rangers'],
 ['Seekers of Divine Arcana','technoarcheologist','skitarii-rangers'],
 ['Transoracular Dyad Wafers','cybernetica-datasmith','kastelan-robots','detachment-haloscreed-battle-clade:enhancement:1'],
 ['Martial Signatum Amplificator','tech-priest-dominus','skitarii-rangers','detachment-eradication-cohort:enhancement:2'],
 ['Temporcopia','tech-priest-dominus','skitarii-rangers','detachment-data-psalm-conclave:enhancement:4'],
 ['Genetor','tech-priest-manipulus','skitarii-rangers','detachment-explorator-maniple:enhancement:2'],
 ['Artisan','tech-priest-manipulus','skitarii-rangers','detachment-explorator-maniple:enhancement:4'],
 ['Clandestine Infiltrator','skitarii-marshal','skitarii-rangers','detachment-skitarii-hunter-cohort:enhancement:2'],
 ['Malphonic Susurrus','tech-priest-manipulus','skitarii-rangers','detachment-rad-zone-corps:enhancement:2'],
 ['Peerless Eradicator','tech-priest-manipulus','skitarii-rangers','detachment-rad-zone-corps:enhancement:3'],
 ['Electromiasmic Brazier','tech-priest-manipulus','skitarii-rangers','detachment-luminen-auto-choir:enhancement:2'],
 ['Vingh’s Wafers of Dynamism','cybernetica-datasmith','kastelan-robots','detachment-lords-of-the-forge:enhancement:1'],
 ['Explorator Dispensation','skitarii-marshal','skitarii-rangers','detachment-cohort-acquisitus:enhancement:1']
];

function physical(book,id,instanceId,enhancementId){
  const unit=entity(book,id);
  if(!importMetadata.has(book.bookId)){
    const input=`books/${book.bookId}/v2/generated/roster-import.json`;
    importMetadata.set(book.bookId,book.importBindings||(fs.existsSync(path.join(root,input))?read(input).importBindings:undefined));
  }
  const members=importMetadata.get(book.bookId)?.compositions?.filter(binding=>binding.ownerId===id)||[];
  const modelRows=(members.length?members:[{profileId:unit.data.profileIds[0],quantity:{min:1}}]).map((member,index)=>({
    rowId:index?'row-'+index:'row',canonicalProfileId:member.profileId,...(member.id?{compositionMemberId:member.id}:{}),
    quantity:member.quantity.min,selections:[],loadouts:[]}));
  return {instanceId,canonicalUnitId:id,startingStrength:modelRows.reduce((sum,row)=>sum+row.quantity,0),warlord:null,selections:[],
    enhancementIds:enhancementId?[enhancementId]:[],
    ...(enhancementId?{enhancementAssignments:[{enhancementId,modelScopeId:`${instanceId}/row/PROFILE/row`}]}:{}),
    modelRows};
}
function fixture(book,entry){
  const [name,leader,body,enhancementId,reverse]=entry;
  const unitId=id=>id.startsWith('unit-')?id:'unit-'+id;
  const detachmentId=enhancementId?entity(book,enhancementId).parentId:book.entities.find(record=>record.kind==='DETACHMENT'&&
    !(book.rosterAttachmentConstraints||[]).some(constraint=>constraint.detachmentId===record.id)).id;
  const snapshot={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'o1-independent-fixture',
    detachments:[{instanceId:'detachment/1',canonicalDetachmentId:detachmentId}],detachmentIds:[detachmentId],
    units:[physical(book,unitId(leader),'leader',enhancementId),physical(book,unitId(body),'body'),
      physical(book,unitId(body),'control'),physical(book,unitId(leader),'other-leader')],
    attachments:[],warlordInstanceId:null};
  const state=validateRoster(book,snapshot,book.rosterAttachmentPolicies);
  const sourceId=reverse?'body':'leader',recipientId=reverse?'leader':'body';
  const owner=unitId(reverse?body:leader);
  const candidates=enhancementId?[entity(book,enhancementId)]:book.entities.filter(record=>record.parentId===owner&&record.ruleContract);
  const rules=candidates.flatMap(rule=>enhancementId||normalize(title(rule)||rule.displayName)===normalize(name)?[{rule,text:rule.data.text}]:
    (rule.data.blocks||[]).filter(block=>normalize(block.text).startsWith(normalize(name)+':')).map(block=>({rule,text:block.text})));
  assert.equal(rules.length,1,`Exactly one source block for ${name}`);
  return {name,state,sourceId,recipientId,...rules[0]};
}
function view(book,state,id){
  const beforeState=clone(state);
  const evaluator=createRosterConditionContext(book,state);
  const projection=executeRosterEffects(book,state,evaluator);
  const beforeProjection=clone(projection);
  const result=projectEffectiveInstance(book.bookId==='chaos-space-marines'?normalizeCSMEffectiveBook(book):book,projection,id,{state,evaluatePredicate:evaluator.evaluatePredicate});
  assert.deepEqual(state,beforeState,'Presentation changed the physical roster');
  assert.deepEqual(projection,beforeProjection,'Presentation changed effective gameplay');
  return {result,projection,rows:result.attachedRuleTexts||[]};
}
function matching(rows,scenario){return rows.filter(row=>row.ruleId===scenario.rule.id&&row.sourceInstanceId===scenario.sourceId&&
  normalize(row.text)===normalize(scenario.text));}
function attached(book,state,body='body'){return changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','leader',body);}

for(const [bookId,entries]of [['death-guard',dg],['adeptus-mechanicus',am]]){
  const book=books.get(bookId);
  for(const entry of entries)check(`${bookId}/${entry[0]}: named text, original source, isolation and transitions`,()=>{
    const scenario=fixture(book,entry),base=clone(scenario.state);
    assert.equal(matching(view(book,base,scenario.recipientId).rows,scenario).length,0,'Detached source must not leak');
    const state=attached(book,base),current=view(book,state,scenario.recipientId);
    const rows=matching(current.rows,scenario);
    assert.equal(rows.length,1,`Full original named rule appears exactly once: ${entry[0]}`);
    const row=rows[0];
    assert.equal(row.recipientInstanceId,scenario.recipientId);
    assert.ok(row.sourceLabel&&normalize(row.sourceLabel).includes(normalize(title(entity(book,state.units.find(unit=>unit.instanceId===scenario.sourceId).canonicalUnitId)))), 'Physical owner is named');
    assert.ok(Array.isArray(row.proofs)&&row.proofs.length,'Recipient proof retained');
    assert.ok(row.sourcePath,'Canonical named source block path retained');
    assert.equal(matching(view(book,state,'control').rows,scenario).length,0,'Duplicate bodyguard outside group must not inherit');
    assert.equal(matching(view(book,state,'other-leader').rows,scenario).length,0,'Duplicate leader outside group must not inherit');
    assert.equal(matching(view(book,state,scenario.sourceId).rows,scenario).length,0,'Do not duplicate owner text');
    const detached=changeAttachment(book,state,book.rosterAttachmentPolicies,'DETACH','leader');
    assert.equal(matching(view(book,detached,scenario.recipientId).rows,scenario).length,0,'Detach removes dependent text');
    const restored=attached(book,detached);
    assert.deepEqual(view(book,restored,scenario.recipientId).rows,current.rows,'Reattach restores exactly the same projection');
    assert.deepEqual(view(book,JSON.parse(JSON.stringify(restored)),scenario.recipientId).rows,current.rows,'Reload is stable');
    if(entry[3]){
      const removed=clone(state);removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];
      assert.equal(matching(view(book,removed,scenario.recipientId).rows,scenario).length,0,'Removed Enhancement must disappear');
    }
    observations.push({book:bookId,rule:entry[0],source:title(entity(book,state.units.find(unit=>unit.instanceId===scenario.sourceId).canonicalUnitId)),
      recipient:title(entity(book,state.units.find(unit=>unit.instanceId===scenario.recipientId).canonicalUnitId)),status:'PASS'});
  });
}

check('AM unrelated named ABILITIES block and NOT_RECORDED remain hidden',()=>{
  const book=books.get('adeptus-mechanicus'),scenario=fixture(book,am[2]),state=attached(book,scenario.state);
  const text=view(book,state,'body').rows.map(row=>row.text).join('\n');
  assert.match(text,/Galvanic Field/);assert.doesNotMatch(text,/Defend the Divine Work/);
  const marshal=fixture(book,am.at(-1));
  assert.doesNotMatch(view(book,attached(book,marshal.state),'body').rows.map(row=>row.text).join('\n'),/Control Edict|Servo-skull Uplink/);
});
check('DG personal ability and unrecorded sibling are not copied',()=>{
  const book=books.get('death-guard'),scenario=fixture(book,dg[2]),state=attached(book,scenario.state);
  assert.doesNotMatch(view(book,state,'body').rows.map(row=>row.text).join('\n'),/Unholy Resilience/);
  assert.doesNotMatch(view(book,state,'leader').rows.map(row=>row.text).join('\n'),/Death Approaches|Icon of Despair/);
});
check('AM UNKNOWN roster prerequisite does not become TRUE',()=>{
  const book=books.get('adeptus-mechanicus');
  const scenario=fixture(book,['Electro-infusion','tech-priest-dominus','fulgurite-electro-priests',null,true]);
  assert.equal(matching(view(book,attached(book,scenario.state),'leader').rows,scenario).length,0);
});
check('The seven unproved range-origin links remain hidden on other components',()=>{
  const book=books.get('adeptus-mechanicus');
  const names=['Mechanicus Locum','Cantic Thrallnet','Necromechanic','Lord of Machines'];
  for(const name of names){
    const rule=book.entities.find(record=>record.kind==='ENHANCEMENT'&&title(record)===name);
    const leader=name==='Cantic Thrallnet'?'skitarii-marshal':'tech-priest-dominus';
    const scenario=fixture(book,[name,leader,'skitarii-rangers',rule.id]);
    assert.equal(view(book,attached(book,scenario.state),'body').rows.filter(row=>row.ruleId===rule.id).length,0,name);
  }
  const enginseer=physical(book,'unit-tech-priest-enginseer','leader');
  const normal=fixture(book,am[1]).state;normal.units[0]=enginseer;
  const bound=attached(book,normal);
  assert.doesNotMatch(view(book,bound,'body').rows.map(row=>row.text).join('\n'),/Omnissiah.s Blessing/);
  const csm=books.get('chaos-space-marines');
  const helm=csm.entities.find(record=>record.kind==='ENHANCEMENT'&&normalize(title(record))==='Helm of All-seeing');
  assert.ok(helm,'Named Helm fixture exists');
  const scenario=fixture(csm,['Helm of All-seeing','warpsmith','legionaries',helm.id]);
  const texts=view(csm,attached(csm,scenario.state),'body').rows.map(row=>row.text).join('\n');
  assert.doesNotMatch(texts,/Helm of All-seeing|Master of Mechanisms/);
});

for(const [bookId,book]of books)check(`${bookId}: derived links have backing consumers; F1 subset and orphan validation preserved`,()=>{
  const before=JSON.stringify(book);validateBookRecipients(book);
  let f1Count=0,linkCount=0;
  for(const rule of book.entities.filter(rule=>rule.ruleContract&&rule.kind!=='STRATAGEM'&&rule.ruleContract.kind!=='STRATAGEM')){
    for(const clause of rule.ruleContract.clauses){
      const f1=presentationRecipientLinks(rule,clause,{consumer:'F1'});
      assert.deepEqual(f1.map(link=>link.recipient.id),clause.f1RecipientIds||[],'F1 admission list stays exact and ordered');
      if(f1.length){
        const declaration=detachmentTextDeclaration(book,rule,clause);
        assert.deepEqual(declaration.recipients.map(recipient=>recipient.id),clause.f1RecipientIds);
        f1Count+=f1.length;
      }
      const links=presentationRecipientLinks(rule,clause);
      if(clause.recipientStatus!=='RECORDED')assert.equal(links.length,0);
      for(const link of links){assert.equal(link.recipient,resolveRecipient(rule,clause,link.recipient.id));assert.ok(link.consumer);linkCount++;}
    }
  }
  assert.equal(JSON.stringify(book),before,'Derived bindings must not rewrite canonical artifacts');
  const candidate=clone(book),owner=candidate.entities.find(rule=>rule.ruleContract?.clauses.some(clause=>clause.recipients?.some(recipient=>!recipient.roleId)));
  if(owner){
    const clause=owner.ruleContract.clauses.find(clause=>clause.recipients?.some(recipient=>!recipient.roleId));
    const orphan=clone(clause.recipients.find(recipient=>!recipient.roleId));orphan.id+=':orphan';clause.recipients.push(orphan);
    assert.throws(()=>validateBookRecipients(candidate),/orphan recipient declaration/,'Derived presentation may not legalize an orphan');
  }
  observations.push({book:bookId,contractLinks:linkCount,f1Recipients:f1Count,status:'PASS'});
});

const otherCases=[
 ['chaos-space-marines',['Daemonkin (Psychic)','master-of-possession','legionaries']],
 ['emperors-children',['Perfectionists','lord-exultant','infractors']],
 ['tau-empire',['Failure Is Not an Option','ethereal','strike-team']],
 ['tyranids',['Relentless Hunger','hive-tyrant','tyrant-guard','detachment-unending-swarm:enhancement:1']]
];
for(const [bookId,entry]of otherCases)check(`${bookId}: actual attached named text and duplicate isolation`,()=>{
  const book=books.get(bookId),scenario=fixture(book,entry);
  const factories={
    'chaos-space-marines':()=>createCSMBrowserRoster(book,read('books/chaos-space-marines/v2/generated/roster-import.json'),read('books/chaos-space-marines/v2/roster-attachment-bindings.json')),
    'emperors-children':()=>createECBrowserRoster(book),
    'tau-empire':()=>createTauBrowserRoster(book),
    'tyranids':()=>createTyranidsBrowserRoster(book)
  };
  const runtime=factories[bookId]();runtime.load(scenario.state);runtime.attach('leader','body');
  const before=clone(runtime.projection),saved=runtime.snapshot(),rows=runtime.effective('body').attachedRuleTexts||[];
  assert.equal(matching(rows,scenario).length,1,entry[0]);
  assert.equal(matching(runtime.effective('control').attachedRuleTexts||[],scenario).length,0);
  assert.deepEqual(runtime.projection,before);assert.deepEqual(runtime.snapshot(),saved);
  runtime.detach('leader');assert.equal(matching(runtime.effective('body').attachedRuleTexts||[],scenario).length,0);
  observations.push({book:bookId,rule:entry[0],recipient:entry[2],status:'PASS'});
});
const marineCases=[
 ['space-marines',createSpaceMarinesRosterRuntime,['Honour of the Company','unit-sm-eb2d6ede583e4473','unit-sm-59162946fee84360']],
 ['blood-angels',createBloodAngelsRosterRuntime,['Blood Chalice','unit-ba-1388b9b0dc5d40c1aba4','unit-sm-717dd0d07e764a70']],
 ['dark-angels',createDarkAngelsRosterRuntime,['The Lion Helm','unit-da-f8f0629206e744459a9f','unit-sm-3ce46dddf62b45f1']]
];
for(const [bookId,factory,entry]of marineCases)check(`${bookId}: native bound runtime attached text`,()=>{
  const book=read(`books/${bookId}/v2/generated/roster-import.json`),scenario=fixture(book,entry),runtime=factory(book);
  if(entry[0]==='The Lion Helm')equip(scenario.state,'leader',scenario.rule.id);
  runtime.load(scenario.state);runtime.attach('leader','body');
  const before=runtime.projection,state=runtime.snapshot(),rows=runtime.effective('body').attachedRuleTexts||[];
  assert.equal(matching(rows,scenario).length,1,entry[0]);
  assert.deepEqual(runtime.projection,before);assert.deepEqual(runtime.snapshot(),state);
  assert.equal(matching(runtime.effective('control').attachedRuleTexts||[],scenario).length,0);
  runtime.detach('leader');assert.equal(matching(runtime.effective('body').attachedRuleTexts||[],scenario).length,0);
  observations.push({book:bookId,rule:entry[0],recipient:entry[2],status:'PASS'});
});

function equip(state,instanceId,equipmentId){
  const unit=state.units.find(unit=>unit.instanceId===instanceId);unit.equipmentContextKnown=true;
  unit.selections.push({selectionKey:'o1-equipment/'+equipmentId,canonicalProfileIds:[],canonicalEquipmentIds:[equipmentId],
    physicalQuantity:1,canonicalFieldPaths:{[equipmentId]:['/text']}});
}
for(const [bookId,factory]of [['space-marines',createSpaceMarinesRosterRuntime],['blood-angels',createBloodAngelsRosterRuntime],['dark-angels',createDarkAngelsRosterRuntime]])
check(`${bookId}: Grav-chutes requires recorded physical equipment, in the reverse direction`,()=>{
  const book=read(`books/${bookId}/v2/generated/roster-import.json`);
  const leader=book.entities.find(record=>record.kind==='DATASHEET'&&title(record).toLowerCase()==='lieutenant in phobos armour');
  assert.ok(leader,'Accepted Phobos leader');
  const scenario=fixture(book,['Grav-chutes',leader.id,'unit-sm-5d6184dd92154615',null,true]),runtime=factory(book);
  runtime.load(scenario.state);runtime.attach('leader','body');
  assert.equal(matching(runtime.effective('leader').attachedRuleTexts||[],scenario).length,0,'Missing equipment is not proof');
  const selected=runtime.snapshot();equip(selected,'body',scenario.rule.id);runtime.load(selected);
  assert.equal(matching(runtime.effective('leader').attachedRuleTexts||[],scenario).length,1,'Explicit selected source carries the full rule');
  assert.equal(matching(runtime.effective('other-leader').attachedRuleTexts||[],scenario).length,0,'Independent identical leader stays isolated');
  const removed=runtime.snapshot();removed.units.find(unit=>unit.instanceId==='body').selections=[];runtime.load(removed);
  assert.equal(matching(runtime.effective('leader').attachedRuleTexts||[],scenario).length,0,'Explicit absence is FALSE');
});

check('CSM proven range-origin keeps Tempting Addendum on the source group only',()=>{
  const book=books.get('chaos-space-marines'),rule=entity(book,'detachment-soulforged-warpack:enhancement:3');
  const scenario=fixture(book,['Tempting Addendum','warpsmith','legionaries',rule.id]);
  const state=attached(book,scenario.state),current=view(book,state,'body');
  const rows=matching(current.rows,scenario);assert.equal(rows.length,1);
  assert.ok(rows[0].proofs.every(proof=>proof.relation==='RANGE_ORIGIN'));
  assert.equal(matching(view(book,state,'control').rows,scenario).length,0,'An unrelated unit is not a display recipient');
  const altered=clone(book),copy=entity(altered,rule.id);
  for(const clause of copy.ruleContract.clauses)for(const recipient of clause.recipients||[])
    for(const condition of recipient.conditions||[])if(condition.arguments?.from==='SOURCE_MODEL')delete condition.arguments.from;
  for(const clause of copy.ruleContract.clauses)for(const role of clause.roles||[])
    for(const condition of role.conditions||[])if(condition.arguments?.from==='SOURCE_MODEL')delete condition.arguments.from;
  const evaluator=createRosterConditionContext(altered,state);
  const result=projectEffectiveInstance(normalizeCSMEffectiveBook(altered),current.projection,'body',{state,evaluatePredicate:evaluator.evaluatePredicate});
  assert.equal(matching(result.attachedRuleTexts||[],scenario).length,0,'A distance without an explicit origin is not proof');
});

check('A sourceFields mutation cannot copy the neighboring NOT_RECORDED ability',()=>{
  const baseline=books.get('adeptus-mechanicus'),scenario=fixture(baseline,am[2]),state=attached(baseline,scenario.state);
  const projection=view(baseline,state,'body').projection,altered=clone(baseline),rule=entity(altered,scenario.rule.id);
  rule.ruleContract.clauses.find(clause=>clause.id==='block-1').sourceFields=[['blocks',1,'text']];
  const evaluator=createRosterConditionContext(altered,state);
  assert.throws(()=>projectEffectiveInstance(altered,projection,'body',{state,evaluatePredicate:evaluator.evaluatePredicate}),/source block/);
});
check('Presentation rejects foreign components, text, source paths and card ownership',()=>{
  const book=books.get('death-guard'),scenario=fixture(book,dg[2]),state=attached(book,scenario.state);
  const effective=view(book,state,'body').result,row=matching(effective.attachedRuleTexts,scenario)[0];
  const unit=state.units.find(unit=>unit.instanceId==='body');
  const cards=new Map(read('books/death-guard/v2/generated/app-presentation.json').cards.map(card=>[card.id,card]));
  assert.equal(validateAttachedRuleTextPresentation(cards,unit,effective,row),row.text);
  for(const patch of [{recipientInstanceId:'control'},{sourceInstanceId:'other-leader'},{text:'Altered text'},
    {sourcePath:['blocks',1,'text']},{proofs:[]},{sourceOwnerChain:[]}])
    assert.throws(()=>validateAttachedRuleTextPresentation(cards,unit,effective,{...row,...patch}));
  const foreign=new Map([...cards].map(([id,card])=>[id,clone(card)]));
  foreign.get(row.ruleId).parentId='unit-typhus';
  assert.throws(()=>validateAttachedRuleTextPresentation(foreign,unit,effective,row),/ownership/);
  const altered=new Map([...cards].map(([id,card])=>[id,clone(card)]));
  const field=altered.get(row.ruleId).fields.find(field=>field.source?.path==='/blocks/0/text');field.value+=' Changed';
  assert.throws(()=>validateAttachedRuleTextPresentation(altered,unit,effective,row),/canonical text/);
});
check('Fabius: current attachment cannot substitute for initialAttachments',()=>{
  const book=books.get('chaos-space-marines'),scenario=fixture(book,['Enhanced Warriors','fabius-bile','chosen']);
  const state=attached(book,scenario.state);
  assert.equal(matching(view(book,state,'body').rows,scenario).length,0,'Unknown initial attachment is withheld');
  const initial=clone(state);initial.initialAttachments=clone(state.attachments);
  assert.equal(matching(view(book,initial,'body').rows,scenario).length,1,'Explicit initial attachment permits the bodyguard text');
  const falseInitial=clone(state);falseInitial.initialAttachments=[];
  assert.equal(matching(view(book,falseInitial,'body').rows,scenario).length,0,'Explicit negative initial history is withheld');
});
check('Derived recipient link mutations cannot substitute foreign rule/clause/path/proof',()=>{
  const book=books.get('death-guard'),rule=entity(book,'datasheet-lord-of-contagion:section:1');
  const clause=rule.ruleContract.clauses[0],link=presentationRecipientLinks(rule,clause)[0];
  assert.ok(link);validatePresentationRecipientLink(rule,clause,link);
  for(const patch of [{ruleId:'foreign'},{clauseId:'foreign'},{path:'ROLE'},{recipient:{...link.recipient,id:'foreign'}},
    {effect:{...link.effect,id:'foreign'}},{consumer:'F1'}])
    assert.throws(()=>validatePresentationRecipientLink(rule,clause,{...link,...patch}),undefined,JSON.stringify(patch));
  const foreign=entity(book,'datasheet-deathshroud-terminators:section:1');
  assert.throws(()=>validatePresentationRecipientLink(foreign,foreign.ruleContract.clauses[0],link));
});
check('Mixed Boolean roster/BATTLE conditions retain FALSE and UNKNOWN roster gates',()=>{
  const baseline=books.get('death-guard'),scenario=fixture(baseline,dg[2]),state=attached(baseline,scenario.state);
  const originalRule=entity(baseline,scenario.rule.id),source=clone(originalRule.ruleContract.clauses[0].rosterEffects[0].conditions[0].predicate);
  const battle={predicate:'FIELD',subject:'MODEL',contextLevel:'BATTLE',arguments:{key:'phaseIsFight',equals:true},evidence:source.evidence};
  for(const [name,predicate,expected]of [
    ['ALL TRUE roster and BATTLE',{op:'ALL',args:[source,battle]},1],
    ['ALL FALSE roster and BATTLE',{op:'ALL',args:[{...source,arguments:{value:false}},battle]},0],
    ['ALL UNKNOWN roster and BATTLE',{op:'ALL',args:[{predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',arguments:{key:'memberOfBearerUnit',equals:true},evidence:source.evidence},battle]},0],
    ['ANY FALSE roster and BATTLE',{op:'ANY',args:[{...source,arguments:{value:false}},battle]},0],
    ['ANY UNKNOWN roster and BATTLE',{op:'ANY',args:[{predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',arguments:{key:'memberOfBearerUnit',equals:true},evidence:source.evidence},battle]},0],
    ['ANY TRUE roster and BATTLE',{op:'ANY',args:[source,battle]},1],
    ['NOT UNKNOWN roster and BATTLE',{op:'NOT',args:[{op:'ALL',args:[{predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',arguments:{key:'memberOfBearerUnit',equals:true},evidence:source.evidence},battle]}]},0],
    ['NOT TRUE roster and BATTLE',{op:'NOT',args:[{op:'ALL',args:[source,battle]}]},0],
    ['BATTLE-only NOT',{op:'NOT',args:[battle]},1]
  ]){
    const book=clone(baseline),rule=entity(book,scenario.rule.id);
    // Only the presentation input is mutated. The projection is the unchanged
    // original executor result, so no synthetic battle effect is executed.
    for(const effect of rule.ruleContract.clauses[0].rosterEffects)effect.conditions=[{binding:'SOURCE',predicate}];
    const projection=view(baseline,state,'body').projection;
    const evaluator=createRosterConditionContext(book,state);
    const rows=projectEffectiveInstance(book,projection,'body',{state,evaluatePredicate:evaluator.evaluatePredicate}).attachedRuleTexts||[];
    assert.equal(matching(rows,scenario).length,expected,name);
  }
});

const report={status:failures.length?'NEW_FAIL':'PASS',checks,failures,observations,
  limitations:'Constructed physical snapshots; browser visibility is a separate QA gate. No gameplay facts or stored roster inputs are changed.'};
const out=process.argv.find(arg=>arg.startsWith('--out='))?.slice(6);
if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'attached-rule-text-node.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exitCode=1;
