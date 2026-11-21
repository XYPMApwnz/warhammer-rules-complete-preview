import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
/** F2: exact physical carrier counts through the real import/attachment and
 * presentation path. Synthetic controls are physical records, not new effects. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createDGRosterRuntime} from '../books/death-guard/v2/roster-boot.mjs';
import {createAdMechRosterRuntime} from '../books/adeptus-mechanicus/v2/roster-runtime.mjs';
import {createECBrowserRoster} from '../books/emperors-children/v2/roster-boot.mjs';
import {prepareRosterPresentationCards,projectFormedUnitCards,projectDetachmentFields} from '../books/shared/army-book-app-v2/personal.mjs';
import {countPhysicalCarriers,formatPhysicalCarriers,effectContributionKey} from '../books/shared/army-book-app-v2/effective-datasheet-presentation.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>parseSourceFixtureJSON(fs.readFileSync(path.join(root,file),'utf8'));
const book=read('books/death-guard/v2/generated/rule-contract-effective.json');
const payload=read('books/death-guard/v2/generated/app-presentation.json');
const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
const checks=[],evidence={};
const check=(name,run)=>{run();checks.push(name);};
const text=file=>fs.readFileSync(path.join(root,file),'utf8');
function imported(file){const runtime=createDGRosterRuntime(book),result=runtime.import(text(file));
  assert.equal(result.status,'READY',JSON.stringify(result));return runtime;}
function component(runtime,id,presentationCards=cards){
  const beforeState=runtime.snapshot(),beforeProjection=structuredClone(runtime.projection);
  const projected=projectFormedUnitCards(presentationCards,runtime,id).components.find(component=>component.unit.instanceId===id);
  assert.deepEqual(runtime.snapshot(),beforeState,'Presentation mutated imported state');
  assert.deepEqual(runtime.projection,beforeProjection,'Presentation mutated effective effects');
  const records=[...projected.variants.values()].flat();
  return {unit:projected.unit,unitCard:presentationCards.get(projected.unit.canonicalUnitId),
    profiles:records.filter(record=>record.kind==='PROFILE'),weapons:records.filter(record=>record.kind==='WEAPON_PROFILE')};
}
const labels=(records,view,counter=countPhysicalCarriers)=>formatPhysicalCarriers(counter(records,view.profiles,{unit:view.unit,unitCard:view.unitCard}));
const vector='datasheet-lord-of-contagion:section:1';
const hasVector=record=>record.fields.some(field=>(field.weaponGrantSources||[]).some(source=>source.canonicalRuleId===vector));
const omega=imported('books/death-guard/v2/fixtures/omega-megaroster.txt');
const omegaLord=omega.state.units.filter(unit=>unit.canonicalUnitId==='unit-lord-of-contagion')[1];
const omegaBodyguard=omega.state.units.find(unit=>unit.canonicalUnitId==='unit-blightlord-terminators');
omega.attach(omegaLord.instanceId,omegaBodyguard.instanceId);
const omegaView=component(omega,omegaBodyguard.instanceId);
const bubotic=omegaView.weapons.filter(record=>record.id==='datasheet-blightlord-terminators:weapon:6'&&hasVector(record));
function verifyOmega(counter=countPhysicalCarriers){
  assert.equal(bubotic.reduce((sum,record)=>sum+record.rosterQuantity,0),4);
  assert.deepEqual(labels(bubotic,omegaView,counter),['Blightlord Champion · 1 model','Blightlord Terminator · 3 models']);
}
check('DG Omega: four Bubotic blades on Champion one + Terminators three',()=>verifyOmega());
evidence.omega={leader:omegaLord.instanceId,bodyguard:omegaBodyguard.instanceId,weaponCopies:4,
  carriers:countPhysicalCarriers(bubotic,omegaView.profiles,{unit:omegaView.unit}),labels:labels(bubotic,omegaView)};
check('DG Omega: effect on only one Terminator retains one carrier',()=>{
  const partial=bubotic.filter(record=>record.presentationScope.label==='Blightlord Terminator').slice(0,1);
  assert.deepEqual(labels(partial,omegaView),['Blightlord Terminator · 1 model']);
});
check('Duplicate source traces and repeated weapon selections do not multiply carriers',()=>{
  assert.deepEqual(labels([...bubotic,...bubotic],omegaView),labels(bubotic,omegaView));
});

const deathshroud=imported('v2/fixtures/f2-deathshroud-newrecruit.txt');
assert.deepEqual(deathshroud.state.units.map(unit=>unit.canonicalUnitId),['unit-lord-of-contagion','unit-deathshroud-terminators']);
assert.deepEqual(deathshroud.state.units[0].enhancementIds,['detachment-virulent-vectorium:enhancement:2']);
deathshroud.attach('parsed-unit-1','parsed-unit-2');
const shroudView=component(deathshroud,'parsed-unit-2');
const gauntlets=shroudView.weapons.filter(record=>record.id==='datasheet-deathshroud-terminators:weapon:1');
const manreaper=shroudView.weapons.filter(record=>record.id==='datasheet-deathshroud-terminators:weapon:2'&&hasVector(record));
check('Verbatim New Recruit v37.6: real import, real attachment, four gauntlets / three carriers',()=>{
  assert.equal(gauntlets.reduce((sum,record)=>sum+record.rosterQuantity,0),4);
  assert.deepEqual(labels(gauntlets,shroudView),['Deathshroud Terminator Champion · 1 model','Deathshroud Terminator · 2 models']);
  assert.equal(countPhysicalCarriers(gauntlets,shroudView.profiles,{unit:shroudView.unit}).reduce((sum,group)=>sum+group.quantity,0),3);
  assert.ok(gauntlets.every(record=>!hasVector(record)),'Do not invent a gauntlet effect to obtain a caption');
});
check('Verbatim export: actual Vector of Disease Manreaper contributions retain three carriers',()=>{
  assert.deepEqual(labels(manreaper,shroudView),['Deathshroud Terminator Champion · 1 model','Deathshroud Terminator · 2 models']);
  assert.ok(manreaper.every(record=>record.fields.some(field=>(field.weaponGrantSources||[]).some(source=>
    source.canonicalRuleId===vector&&source.clauseId==='source-clause-1'&&source.operation==='GRANT_WEAPON_ABILITY'))));
});
evidence.deathshroud={importStatus:'READY',attachments:deathshroud.state.attachments,
  weaponCopies:4,carrierCount:3,gauntletLabels:labels(gauntlets,shroudView),manreaperLabels:labels(manreaper,shroudView)};
check('Reload retains physical scopes and counts',()=>{
  deathshroud.load(JSON.parse(JSON.stringify(deathshroud.snapshot())));
  const after=component(deathshroud,'parsed-unit-2');
  assert.deepEqual(labels(after.weapons.filter(record=>record.id==='datasheet-deathshroud-terminators:weapon:1'),after),evidence.deathshroud.gauntletLabels);
});
check('Detach removes actual Vector grant; reattach restores it without changing carriers',()=>{
  deathshroud.detach('parsed-unit-1');const detached=component(deathshroud,'parsed-unit-2');
  assert.ok(detached.weapons.every(record=>!hasVector(record)));
  deathshroud.reattach('parsed-unit-1','parsed-unit-2');const attached=component(deathshroud,'parsed-unit-2');
  assert.deepEqual(labels(attached.weapons.filter(record=>record.id==='datasheet-deathshroud-terminators:weapon:2'&&hasVector(record)),attached),evidence.deathshroud.manreaperLabels);
});

function singletonProof(view,weaponIds,expectedLabel,expectedProfileId,counter=countPhysicalCarriers){
  const selected=view.weapons.filter(record=>weaponIds.includes(record.id));
  assert.deepEqual(selected.map(record=>record.id).toSorted(),[...weaponIds].toSorted(),'Independently named selected weapon profiles');
  const groups=counter(selected,view.profiles,{unit:view.unit,unitCard:view.unitCard});
  assert.deepEqual(formatPhysicalCarriers(groups),[expectedLabel+' · 1 model'],'Recipient is the named physical MODEL, never a weapon');
  assert.deepEqual(groups.map(group=>group.labelIdentity),[{kind:'PROFILE',canonicalId:expectedProfileId,instanceId:view.unit.instanceId}],
    'Caption identity must be a proved PROFILE, never WEAPON_PROFILE');
  assert.ok(groups[0].members.every(member=>member.proof==='SINGLE_MODEL_COMPONENT'));
  assert.equal(new Set(groups[0].members.map(member=>member.address)).size,1,'All selected modes/items belong to the same physical MODEL');
  return groups;
}
const lordView=component(deathshroud,'parsed-unit-1');
const lordWeapons=['datasheet-lord-of-contagion:weapon:1','datasheet-lord-of-contagion:weapon:2'];
check('DG singleton Lord: actual Vector and Furnace Manreaper strike/sweep label the Lord, one MODEL',()=>{
  singletonProof(lordView,lordWeapons,'Lord of Contagion','datasheet-lord-of-contagion:profile:default');
  for(const id of lordWeapons){const record=lordView.weapons.find(record=>record.id===id),sources=record.fields.flatMap(field=>field.weaponGrantSources||[]);
    assert.ok(sources.some(source=>source.canonicalRuleId===vector),'Actual Vector contribution is present');
    assert.ok(sources.some(source=>source.canonicalRuleId==='detachment-virulent-vectorium:enhancement:2'),'Actual Furnace contribution is present');
    assert.deepEqual(labels([record],lordView),['Lord of Contagion · 1 model']);
  }
});
const amBook=read('books/adeptus-mechanicus/v2/generated/roster-runtime.json');
const am=createAdMechRosterRuntime(amBook,read('books/adeptus-mechanicus/v2/roster-import-aliases.json'));
assert.equal(am.import(`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement`).status,'READY');
const amPayload=read('books/adeptus-mechanicus/v2/generated/app-presentation.json');
const amCards=prepareRosterPresentationCards(new Map(amPayload.cards.map(card=>[card.id,card])),amPayload.rosterPresentation);
const dominusView=component(am,'parsed-unit-1',amCards),dominusWeapons=['datasheet-tech-priest-dominus:weapon:3','datasheet-tech-priest-dominus:weapon:5'];
const haloId='detachment-haloscreed-battle-clade:rule',haloRule=amBook.entities.find(rule=>rule.id===haloId);
const haloRows=am.effective('parsed-unit-1').conditional.filter(row=>row.ruleId===haloId&&row.detachmentText);
const haloSources=new Map([[haloId,haloRule]]);
check('Canonical Detachment text/table fields are unique while each clause keeps its proof and condition',()=>{
  const before=structuredClone(haloRows),plan=projectDetachmentFields(amCards.get(haloId),haloRows,haloSources);
  assert.deepEqual(plan.fields.map(field=>field.kind),['TEXT','TABLE']);
  assert.equal(plan.fields[0].text,haloRule.data.text);assert.deepEqual(plan.fields[1].rows,haloRule.data.tables[0].rows);
  const leading=plan.clauses.find(clause=>clause.row.clauseId==='halo-override-selection');
  const choice=plan.clauses.find(clause=>clause.row.clauseId==='override-choice');
  assert.deepEqual(leading.fieldIds,plan.fields.map(field=>field.id));assert.deepEqual(choice.fieldIds,[plan.fields[0].id]);
  for(const clause of plan.clauses){const canonical=haloRule.ruleContract.clauses.find(row=>row.id===clause.row.clauseId);
    assert.deepEqual(clause.evidence,canonical.evidence);assert.deepEqual(clause.conditions,canonical.conditions);}
  assert.equal(plan.fields[1].anchor.fieldId,plan.fields[0].id);
  const quote=haloRule.ruleContract.clauses.find(clause=>clause.id==='halo-override-selection').evidence.quote;
  assert.equal(plan.fields[1].anchor.offset,quote.length);assert.equal(haloRule.data.text.slice(0,quote.length),quote);
  assert.deepEqual(haloRows,before,'Field planning must not change F1 conditional/effective data');
});
check('Missing, ambiguous or foreign source-bound table position is not guessed',()=>{
  for(const quote of ['', 'not an accepted quote', 'units']){
    const rule=structuredClone(haloRule);rule.ruleContract.clauses.find(clause=>clause.id==='halo-override-selection').evidence.quote=quote;
    const plan=projectDetachmentFields(amCards.get(haloId),haloRows,new Map([[haloId,rule]]));
    assert.equal(plan.fields.filter(field=>field.kind==='TEXT').length,1);
    assert.equal(plan.fields.find(field=>field.kind==='TABLE').anchor,undefined);
  }
  const plan=projectDetachmentFields(amCards.get(haloId),haloRows);
  assert.deepEqual(plan.fields.map(field=>field.kind),['TEXT','TABLE']);
  assert.equal(plan.fields[1].anchor,undefined,'Canonical card fields remain displayable without a guessed runtime evidence boundary');
});
check('AM singleton Dominus: actual Imperatives Macrostubber/Volkite label the Dominus, one MODEL',()=>{
  singletonProof(dominusView,dominusWeapons,'Tech-priest Dominus','datasheet-tech-priest-dominus:profile:default');
  for(const id of dominusWeapons){const record=dominusView.weapons.find(record=>record.id===id),sources=record.fields.flatMap(field=>field.weaponGrantSources||[]);
    assert.ok(sources.some(source=>source.canonicalRuleId.startsWith('army-rule-doctrina-imperatives:')),'Actual activated Imperative source is present');
    assert.deepEqual(labels([record],dominusView),['Tech-priest Dominus · 1 model']);
  }
});
const ecBook=read('books/emperors-children/v2/generated/roster-attachments.json'),ec=createECBrowserRoster(ecBook);
assert.equal(ec.import(read('books/emperors-children/v2/roster-import-fixtures.json').fixtures.find(fixture=>fixture.id==='character-bodyguard').text).status,'READY');
ec.attach('parsed-unit-1','parsed-unit-2');
const ecPayload=read('books/emperors-children/v2/generated/app-presentation.json');
const ecCards=prepareRosterPresentationCards(new Map(ecPayload.cards.map(card=>[card.id,card])),ecPayload.rosterPresentation);
const exultantView=component(ec,'parsed-unit-1',ecCards),exultantWeapons=[1,2,3,5,7].map(number=>'datasheet-lord-exultant:weapon:'+number);
check('EC singleton Lord Exultant: four selected weapons, both plasma modes, one proved MODEL',()=>{
  singletonProof(exultantView,exultantWeapons,'Lord Exultant','datasheet-lord-exultant:profile:1');
  assert.equal(new Set(exultantView.weapons.map(record=>record.selectionKey)).size,4,'Four physical selected weapons, with two plasma profiles');
  for(const id of exultantWeapons){const record=exultantView.weapons.find(record=>record.id===id);
    assert.ok(record.fields.flatMap(field=>field.weaponGrantSources||[]).some(source=>source.canonicalRuleId==='datasheet-lord-exultant:section:1'),'Actual Lord ability contribution is present');
    assert.deepEqual(labels([record],exultantView),['Lord Exultant · 1 model']);
  }
});
evidence.singletonCharacters={
  deathGuard:singletonProof(lordView,lordWeapons,'Lord of Contagion','datasheet-lord-of-contagion:profile:default'),
  adMech:singletonProof(dominusView,dominusWeapons,'Tech-priest Dominus','datasheet-tech-priest-dominus:profile:default'),
  emperorsChildren:singletonProof(exultantView,exultantWeapons,'Lord Exultant','datasheet-lord-exultant:profile:1')
};
check('Singleton fallback cannot escape a physical owner or an exact selected weapon',()=>{
  for(const mutated of [{...lordView.weapons[0],selectionKey:'foreign-selection'},
    {...lordView.weapons[0],instanceId:'other-physical-lord'},
    {...lordView.weapons[0],scopeId:'foreign-model-scope'},
    {...lordView.weapons[0],id:'unselected-weapon'}]){
    const groups=countPhysicalCarriers([mutated],lordView.profiles,{unit:lordView.unit,unitCard:lordView.unitCard});
    assert.ok(groups.every(group=>group.quantity===null));
    assert.ok(groups.every(group=>group.labelIdentity.kind!=='WEAPON_PROFILE'));
  }
});
check('Aggregate multi-model weapon inventory still has unknown distribution',()=>{
  const aggregate=structuredClone(shroudView.unit),weapon={...gauntlets[0],scopeId:null,selectionKey:'aggregate-gauntlets',rosterQuantity:4};
  aggregate.selections=[{selectionKey:weapon.selectionKey,canonicalProfileIds:[weapon.id],physicalQuantity:4,perModelQuantity:null}];
  const groups=countPhysicalCarriers([weapon],shroudView.profiles,{unit:aggregate,unitCard:shroudView.unitCard});
  assert.equal(groups[0].quantity,null);assert.equal(groups[0].labelIdentity.kind,'DATASHEET');
  assert.deepEqual(formatPhysicalCarriers(groups),['Deathshroud Terminators · model count unknown']);
});

const profile=(instanceId,scopeId,quantity,extra={})=>({id:'profile-shared',kind:'PROFILE',instanceId,scopeId,
  rosterQuantity:quantity,fields:[],presentationScope:{label:'Same named model',quantity},...extra});
check('Same datasheet/name in two physical UNIT instances remains separate',()=>{
  const counted=countPhysicalCarriers([profile('one','scope-one',2),profile('two','scope-two',3)]);
  assert.deepEqual(counted.map(group=>[group.instanceId,group.quantity]),[['one',2],['two',3]]);
});
check('Multiple weapon copies on one model count one physical carrier',()=>{
  assert.equal(labels(gauntlets.slice(0,1),shroudView)[0],'Deathshroud Terminator Champion · 1 model');
  assert.equal(gauntlets[0].rosterQuantity,2);
});
check('Explicit MODEL identity deduplicates a repeated physical address',()=>{
  const p=profile('one','scope-one',1,{modelInstanceId:'physical-model-one'});
  assert.equal(countPhysicalCarriers([p,{...p,scopeId:'scope-alias'}])[0].quantity,1);
});
check('Unknown scoped quantity remains unknown while the recipient stays visible',()=>{
  const counted=countPhysicalCarriers([profile('one','scope-one',undefined)]);
  assert.equal(counted.length,1);assert.equal(counted[0].quantity,null);
  assert.deepEqual(formatPhysicalCarriers(counted),['Same named model · model count unknown']);
});
check('No physical scope means no invented carrier count',()=>{
  assert.equal(countPhysicalCarriers([profile('one',null,2)])[0].quantity,null);
});
check('Ambiguous PROFILE address cannot establish carrier quantity',()=>{
  const counted=countPhysicalCarriers([gauntlets[0]],[...shroudView.profiles,shroudView.profiles[0]],{unit:shroudView.unit});
  assert.equal(counted[0].quantity,null);
});
check('Weapon count and missing distribution proof cannot invent model ownership',()=>{
  const aggregate=structuredClone(shroudView.unit);
  aggregate.modelRows[0].selections.find(selection=>selection.selectionKey===gauntlets[0].selectionKey).perModelQuantity=null;
  const counted=countPhysicalCarriers([gauntlets[0]],shroudView.profiles,{unit:aggregate});
  assert.equal(counted[0].quantity,null);assert.equal(counted.length,1);
});
check('Conflicting quantities on one physical address fail closed',()=>{
  const p=profile('one','scope-one',2);
  assert.equal(countPhysicalCarriers([p,{...p,rosterQuantity:3}])[0].quantity,null);
});
check('Independent clause/effect/operation/physical source contributions cannot merge',()=>{
  const trace={ruleId:'same-rule',clauseId:'clause-one',effectId:'effect-one',operation:'GRANT_WEAPON_ABILITY',
    sourceInstanceId:'source-one',sourceCompositionId:'model-one',targetInstanceId:'recipient-one'};
  for(const field of ['ruleId','clauseId','effectId','operation','sourceInstanceId','sourceCompositionId','sourceModelInstanceId','targetInstanceId']){
    assert.notEqual(effectContributionKey(trace),effectContributionKey({...trace,[field]:'another'}),field);
  }
  assert.equal(effectContributionKey(trace),effectContributionKey({...trace,targetCompositionId:'other-recipient-model'}),
    'One proven effect may count its separate physical carriers together');
});

// Run a mutant of this very production helper, not a separate test algorithm.
// Restoring caption deduplication must fail the fixed real-roster expectation.
const directory=createQaEvidenceDir('wh-f2-carrier-qa-');
const helper=path.join(root,'books/shared/army-book-app-v2/effective-datasheet-presentation.mjs');
const source=fs.readFileSync(helper,'utf8');
const target='else if(!duplicate&&group.quantity!==null)group.quantity+=quantity;';
assert.equal(source.split(target).length,2,'Production mutation target changed');
const mutant=path.join(directory,'caption-dedup-mutant.mjs');
fs.writeFileSync(mutant,source.replace(target,'else if(!duplicate&&group.quantity!==null&&group.quantity===0)group.quantity+=quantity;'));
const {countPhysicalCarriers:brokenCounter}=await import(pathToFileURL(mutant));
assert.throws(()=>verifyOmega(brokenCounter),assert.AssertionError,'Text-caption deduplication survived real Omega expectation');
evidence.mutations=[{id:'production-caption-dedup',result:'REJECTED'}];
const weaponLabelTarget='const label=display?.canonicalLabelIncluded?';
assert.equal(source.split(weaponLabelTarget).length,2,'Production model-label mutation target changed');
const weaponLabelFile=path.join(directory,'weapon-label-mutant.mjs');
fs.writeFileSync(weaponLabelFile,source.replace(weaponLabelTarget,"const label=record.kind==='WEAPON_PROFILE'?record.title:display?.canonicalLabelIncluded?"));
const weaponLabelMutant=await import(pathToFileURL(weaponLabelFile));
assert.throws(()=>singletonProof(lordView,lordWeapons,'Lord of Contagion','datasheet-lord-of-contagion:profile:default',weaponLabelMutant.countPhysicalCarriers),
  assert.AssertionError,'Weapon record.title escaped the explicit expected physical MODEL label');
evidence.mutations.push({id:'production-weapon-title-as-model-label',result:'REJECTED'});
const identityTarget='const labelIdentity=profileLabel?';
assert.equal(source.split(identityTarget).length,2,'Production label identity mutation target changed');
const weaponIdentityFile=path.join(directory,'weapon-label-identity-mutant.mjs');
fs.writeFileSync(weaponIdentityFile,source.replace(identityTarget,"const labelIdentity=record.kind==='WEAPON_PROFILE'?{kind:'WEAPON_PROFILE',canonicalId:record.id,instanceId}:profileLabel?"));
const weaponIdentityMutant=await import(pathToFileURL(weaponIdentityFile));
assert.throws(()=>singletonProof(lordView,lordWeapons,'Lord of Contagion','datasheet-lord-of-contagion:profile:default',weaponIdentityMutant.countPhysicalCarriers),
  assert.AssertionError,'A weapon identity escaped the independently expected PROFILE identity');
evidence.mutations.push({id:'production-weapon-label-identity',result:'REJECTED'});
if(process.env.F2_REVIEW_BASELINE_ROOT){
  const baseline=await import(pathToFileURL(path.join(process.env.F2_REVIEW_BASELINE_ROOT,'books/shared/army-book-app-v2/effective-datasheet-presentation.mjs')));
  evidence.singletonBeforeAfter={};
  for(const [name,view,ids]of [['DG',lordView,lordWeapons],['AM',dominusView,dominusWeapons],['EC',exultantView,exultantWeapons]]){
    const records=view.weapons.filter(record=>ids.includes(record.id)),options={unit:view.unit,unitCard:view.unitCard};
    evidence.singletonBeforeAfter[name]={before:formatPhysicalCarriers(baseline.countPhysicalCarriers(records,view.profiles,options)),
      after:formatPhysicalCarriers(countPhysicalCarriers(records,view.profiles,options))};
  }
}
fs.writeFileSync(path.join(directory,'RESULTS.json'),JSON.stringify({checks,evidence},null,2));
console.log('F2_CARD_RECIPIENT_QA '+JSON.stringify({status:'PASS',checks:checks.length,mutations:evidence.mutations.length,evidence:directory,omega:evidence.omega.labels,deathshroud:evidence.deathshroud}));
