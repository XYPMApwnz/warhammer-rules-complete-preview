import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=relative=>fs.readFileSync(new URL(relative,import.meta.url),'utf8');
const load=()=>{const scope={console,CustomEvent:class CustomEvent{constructor(type,options={}){this.type=type;this.detail=options.detail;}},window:{addEventListener(){},dispatchEvent(){}}};scope.window.window=scope.window;for(const file of ['../../shared/rule-facts.js','../../../roster-guides/points-data.js','../../../roster-guides/points-validator.js','../scripts/roster-data.js','../../shared/roster-context.js'])vm.runInNewContext(read(file),scope,{filename:file});return scope.window;};
const root=load(),catalog=root.WH_BOOK_ROSTER_CATALOG,api=root.WHArmyRosterContext,ruleId='tyranids-detachment-rule-surprise-assault',detachmentId='subterranean-assault';
const detachment=catalog.detachments.find(item=>item.id===detachmentId),grant=detachment?.keywordGrants?.[0];
assert.deepEqual(JSON.parse(JSON.stringify(grant)),{sourceRuleId:ruleId,subject:'model',selector:{unitIds:['unit-trygon']},keyword:'CHARACTER',selectionRequired:true,maxSelected:2});
assert.ok(detachment.detachmentRuleIds.includes(ruleId));

const canonical=id=>catalog.units.find(unit=>unit.id===id);
const raw=(id,canonicalUnitId,warlord=false)=>{const unit=canonical(canonicalUnitId),model=unit.gameSelections.models[0];return{id,canonicalUnitId,name:unit.title,quantity:1,points:0,wargear:'',models:model?[{quantity:1,name:model.title,wargear:'',loadouts:[]}]:[],warlord};};
const baseUnits=[raw('trygon-a','unit-trygon'),raw('trygon-b','unit-trygon'),raw('trygon-c','unit-trygon'),raw('mawloc-a','unit-mawloc')];
const rosterFor=({enhancementOwner='',warlord='' }={})=>({faction:'Tyranids',declared:0,calculated:0,unitLineTotal:0,detachments:[{id:detachmentId,name:'SUBTERRANEAN ASSAULT'}],enhancements:enhancementOwner?[{id:'trygon-prime',name:'Trygon Prime',ownerUnitId:enhancementOwner,ownerStatus:'resolved'}]:[],warnings:[],units:baseUnits.map(unit=>({...unit,warlord:unit.id===warlord}))});
const project=(options={},chosenCatalog=catalog)=>api.project({catalog:chosenCatalog,roster:rosterFor(options),record:{id:'surprise-assault-fixture',attachments:{},rosterChoices:{[ruleId]:options.choices||[]}},provider:{gameEffects:()=>[]}});
const byId=projection=>new Map(projection.units.map(unit=>[unit.raw.id,unit]));
const hasCharacter=(projection,id)=>byId(projection).get(id).context.keywordProfile.effective.includes('CHARACTER');

const zero=project();for(const id of ['trygon-a','trygon-b','trygon-c','mawloc-a'])assert.equal(hasCharacter(zero,id),false,`zero choice leaked CHARACTER to ${id}`);assert.equal(zero.rosterChoiceState.rejected.length,0);
const one=project({choices:['trygon-b']});assert.equal(hasCharacter(one,'trygon-b'),true);assert.equal(hasCharacter(one,'trygon-a'),false);assert.equal(hasCharacter(one,'trygon-c'),false);
const two=project({choices:['trygon-c','trygon-a']});assert.equal(hasCharacter(two,'trygon-c'),true);assert.equal(hasCharacter(two,'trygon-a'),true);assert.equal(hasCharacter(two,'trygon-b'),false);assert.deepEqual([...two.rosterChoiceState.choices[ruleId]],['trygon-c','trygon-a']);
const three=project({choices:['trygon-c','trygon-a','trygon-b']});assert.deepEqual([...three.rosterChoiceState.choices[ruleId]],['trygon-c','trygon-a']);assert.equal(hasCharacter(three,'trygon-b'),false);assert.equal(three.rosterChoiceState.rejected[0].reason,'selection-limit-exceeded');
const ineligible=project({choices:['trygon-a','mawloc-a']});assert.equal(hasCharacter(ineligible,'trygon-a'),true);assert.equal(hasCharacter(ineligible,'mawloc-a'),false);assert.equal(ineligible.rosterChoiceState.rejected[0].reason,'ineligible-canonical-unit');

const eligibleEnhancement=project({choices:['trygon-b'],enhancementOwner:'trygon-b'});assert.equal(eligibleEnhancement.enhancementAssessment.assignments[0].assessment.ownerEligibility,'valid');assert.equal(eligibleEnhancement.enhancements.length,1);
const ineligibleEnhancement=project({enhancementOwner:'trygon-b'});assert.equal(ineligibleEnhancement.enhancementAssessment.assignments[0].assessment.ownerEligibility,'invalid');assert.equal(ineligibleEnhancement.enhancements.length,0);
const selectedWarlord=project({choices:['trygon-b'],warlord:'trygon-b'});assert.deepEqual({...byId(selectedWarlord).get('trygon-b').context.warlord},{selected:true,eligibility:'valid'});
const unselectedWarlord=project({warlord:'trygon-b'});assert.deepEqual({...byId(unselectedWarlord).get('trygon-b').context.warlord},{selected:true,eligibility:'invalid'});

const selected=project({choices:['trygon-a']}),deselected=project(),reselected=project({choices:['trygon-a']});assert.equal(hasCharacter(selected,'trygon-a'),true);assert.equal(hasCharacter(deselected,'trygon-a'),false);assert.equal(hasCharacter(reselected,'trygon-a'),true);
const workflowUnits=baseUnits.map(unit=>({instanceId:unit.id,canonicalUnit:canonical(unit.canonicalUnitId)})),workflowInput={detachments:[detachment],units:workflowUnits,choices:{}};const selectedState=api.rosterChoices.select({...workflowInput,sourceRuleId:ruleId,instanceId:'trygon-a'}),deselectedState=api.rosterChoices.deselect({...workflowInput,choices:selectedState.choices,sourceRuleId:ruleId,instanceId:'trygon-a'});assert.equal(selectedState.changed,true);assert.equal(deselectedState.changed,true);assert.deepEqual(Object.keys(deselectedState.choices),[]);

const mutations=[
  ['selection cap',contract=>{contract.maxSelected=3;},mutated=>mutated.rosterChoiceState.rejected.some(item=>item.reason==='selection-limit-exceeded')],
  ['eligible identity',contract=>{contract.selector.unitIds=['unit-mawloc'];},mutated=>hasCharacter(mutated,'trygon-a')],
  ['keyword grant',contract=>{contract.keyword='MONSTER';},mutated=>hasCharacter(mutated,'trygon-a')],
  ['selection gate',contract=>{contract.selectionRequired=false;},mutated=>!hasCharacter(mutated,'trygon-b')],
  ['canonical rule identity',contract=>{contract.sourceRuleId=detachmentId;},mutated=>hasCharacter(mutated,'trygon-a')],
  ['detachment gate',(_contract,copy)=>{copy.detachments.find(item=>item.id===detachmentId).keywordGrants=[];},mutated=>hasCharacter(mutated,'trygon-a')]
];
let killed=0;for(const [name,mutate,stillCorrect] of mutations){const copy=structuredClone(catalog),contract=copy.detachments.find(item=>item.id===detachmentId).keywordGrants[0];mutate(contract,copy);const mutated=project({choices:['trygon-a','trygon-b','trygon-c']},copy);assert.equal(stillCorrect(mutated),false,`${name} mutation survived`);killed++;}

assert.equal(killed,6);console.log('Tyranids Surprise Assault roster choice: PASS (zero/one/two, rejection, CHARACTER, Enhancement, Warlord, recompute, isolation; mutations 6/6 killed).');
