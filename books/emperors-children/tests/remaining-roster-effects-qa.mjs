import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value),plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams,location:{href:'http://localhost/books/emperors-children/reader.html',pathname:'/books/emperors-children/reader.html',search:''},document:{documentElement:{dataset:{bookId:'emperors-children'}},querySelectorAll:()=>[],querySelector:()=>null},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},dispatchEvent(){},addEventListener(){}};
scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js','books/emperors-children/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=scope.WH_BOOK_ROSTER_CATALOG;
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id),contract=(catalog,id)=>catalog.effectContracts.find(item=>item.canonicalRecordId===id);
const selectionTitle=(unit,id)=>unit.gameSelections.selections.find(item=>item.id===id)?.title;
const rawFor=(catalog,unitId,instanceId)=>{const unit=byId(catalog,unitId),models=unit.gameSelections.models.map(model=>{const defaults=unit.gameSelections.wargearDefaults.find(item=>item.modelId===model.id)?.selections||[],wargear=defaults.map(item=>`${item.quantity===1?'':`${item.quantity}x `}${selectionTitle(unit,item.selectionId)}`).join(', ');return{quantity:model.min,name:model.aliases?.[0]||model.title,loadouts:[{quantity:model.min,wargear}]};});return{id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models,warlord:false};};
const enhancement=(id,owner)=>({id,ruleId:id,name:baseline.enhancements.find(item=>item.id===id).title,ownerUnitId:owner,ownerStatus:'resolved'});
const project=(catalog,units,{detachmentId,enhancements=[],attachments={},effectChoices={}}={})=>{scope.WH_BOOK_ROSTER_CATALOG=catalog;const roster={faction:"Emperor's Children",declared:0,calculated:0,unitLineTotal:0,detachments:detachmentId?[{id:detachmentId,name:detachmentId}]:[],enhancements,warnings:[],units};return scope.WHArmyRosterContext.project({catalog,roster,record:{id:'ec-remaining-effects',roster,attachments,effectChoices},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)}}).game;};
const profile=(unit,id)=>unit.effective.weaponProfiles.find(item=>item.id===id),restriction=unit=>unit.effective.targetingRestrictions?.find(item=>item.id==='core-rule-15-09-snap-shooting');

const parity=JSON.parse(read('books/emperors-children/content/emperors-children-codex-parity.en.json'));
const possessedSource=parity.detachments.find(item=>item.id==='carnival-of-excess').enhancements.find(item=>item.id==='enhancement-possessed-blade');
assert.match(possessedSource.text,/select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon/,'Possessed Blade exact accepted selection semantics');
const pack=JSON.parse(read('books/emperors-children/content/emperors-children-faction-pack.en.json'));
const beguilingSource=pack.detachments.find(item=>item.id==='spectacle-of-slaughter').enhancements.find(item=>item.id==='beguiling-grotesquerie');
assert.equal(beguilingSource.text,'FLAWLESS BLADES unit only. Enemy units cannot target this unit with snap shooting attacks.','Beguiling exact accepted restriction');

const certify=catalog=>{
  const possessed=contract(catalog,'enhancement-possessed-blade'),beguiling=contract(catalog,'enhancement-beguiling-grotesquerie');
  assert.deepEqual(plain(possessed.rosterChoice),{kind:'weapon-profile',count:1,weaponMode:'melee'},'Possessed Blade requires one exact melee profile choice');
  assert.equal(possessed.clauses[0].operations[0].canonicalTarget,'selected-effect-weapon-profile','Possessed Blade uses generic chosen-profile target');
  assert.equal(beguiling.scope,'owner-or-attached-group','Beguiling follows the upgraded formed unit');
  assert.deepEqual(plain(beguiling.clauses[0].operations),[{id:'beguiling-grotesquerie-snap-shooting-targeting-restriction',type:'TARGETING_RESTRICTION_GRANT',canonicalTarget:'core-rule-15-09-snap-shooting',parameters:{attacker:'enemy',attackMode:'snap-shooting',restriction:'cannot-target'}}],'Beguiling exact structured targeting restriction');
  let positive=0,negative=0,recompute=0,physical=0;
  const lord=rawFor(catalog,'unit-lord-exultant','lord'),otherLord=rawFor(catalog,'unit-lord-exultant','lord-2'),possessedAssignment=enhancement('enhancement-possessed-blade','lord');
  const spear='unit-lord-exultant-profile-20739776bf',close='unit-lord-exultant-profile-8dd496396b',ranged='unit-lord-exultant-profile-d55ca3e187';
  const choices=profileId=>({'enhancement-possessed-blade':[{ownerInstanceId:'lord',profileId}]});
  const choiceUnit=project(catalog,[clone(lord)],{detachmentId:'carnival-of-excess',enhancements:[possessedAssignment]}).units[0],choiceInput={catalog,units:[choiceUnit],choices:{},sourceRuleId:'enhancement-possessed-blade',ownerInstanceId:'lord'};
  const selectedChoice=scope.WHArmyRosterContext.effectChoices.select({...choiceInput,profileId:spear});assert.equal(selectedChoice.changed,true,'generic effect-choice workflow accepts one equipped melee profile');assert.deepEqual(plain(selectedChoice.choices),choices(spear),'generic effect-choice workflow stores exact owner/profile identities');
  assert.equal(scope.WHArmyRosterContext.effectChoices.select({...choiceInput,profileId:ranged}).changed,false,'generic effect-choice workflow rejects a ranged profile');
  assert.equal(scope.WHArmyRosterContext.effectChoices.deselect({...choiceInput,choices:selectedChoice.choices}).changed,true,'generic effect-choice workflow removes the physical choice');
  let game=project(catalog,[lord,otherLord],{detachmentId:'carnival-of-excess',enhancements:[possessedAssignment],effectChoices:choices(spear)}),chosen=game.units[0],copy=game.units[1];
  assert.equal(profile(chosen,spear).values.A,'6','selected melee profile gains +1 A');positive++;
  assert.equal(profile(chosen,close).values.A,'6','other bearer melee profile is unchanged');negative++;
  assert.equal(profile(chosen,ranged).values.A,'1','bearer ranged profile is unchanged');negative++;
  assert.equal(profile(chosen,spear).values.D,'2','transient optional Damage bonus is not persisted');negative++;
  assert.equal(profile(chosen,spear).tags.some(tag=>['Devastating Wounds','Hazardous'].includes(tag)),false,'transient optional tags are not persisted');negative++;
  assert.equal(profile(copy,spear).values.A,'5','duplicate physical Character is isolated');physical++;
  game=project(catalog,[clone(lord)],{detachmentId:'carnival-of-excess',enhancements:[possessedAssignment],effectChoices:choices(close)});assert.equal(profile(game.units[0],close).values.A,'7','changing the choice moves +1 A');assert.equal(profile(game.units[0],spear).values.A,'5','old choice recomputes to base');recompute+=2;
  for(const [label,effectChoices] of [['missing',{}],['ranged',choices(ranged)],['multiple',{'enhancement-possessed-blade':[{ownerInstanceId:'lord',profileId:spear},{ownerInstanceId:'lord',profileId:close}]}]]){game=project(catalog,[clone(lord)],{detachmentId:'carnival-of-excess',enhancements:[possessedAssignment],effectChoices});assert.equal(game.units[0].effects.some(item=>item.id==='possessed-blade-selected-weapon-attacks'),false,`${label} choice rejected`);negative++;}
  game=project(catalog,[clone(lord)],{detachmentId:'carnival-of-excess',effectChoices:choices(spear)});assert.equal(profile(game.units[0],spear).values.A,'5','removing Enhancement removes modifier');recompute++;

  const blades=rawFor(catalog,'unit-flawless-blades','blades'),blades2=rawFor(catalog,'unit-flawless-blades','blades-2'),lucius=rawFor(catalog,'unit-lucius-the-eternal','lucius'),beguilingAssignment=enhancement('enhancement-beguiling-grotesquerie','blades');
  game=project(catalog,[blades,blades2,lucius],{detachmentId:'spectacle-of-slaughter',enhancements:[beguilingAssignment],attachments:{blades:['lucius']}});const owner=game.units[0],unrelated=game.units[1],leader=game.units[2];
  for(const unit of [owner,leader]){assert.deepEqual(plain(restriction(unit)),{id:'core-rule-15-09-snap-shooting',attacker:'enemy',attackMode:'snap-shooting',restriction:'cannot-target',sourceEffectId:'beguiling-grotesquerie-snap-shooting-targeting-restriction'},'formed unit receives exact restriction');positive++;}
  assert.equal(restriction(unrelated),undefined,'unrelated duplicate Flawless Blades is unaffected');physical++;
  game=project(catalog,[clone(blades),clone(lucius)],{detachmentId:'spectacle-of-slaughter',enhancements:[beguilingAssignment]});assert.ok(restriction(game.units[0]),'detach retains restriction on upgraded owner');assert.equal(restriction(game.units[1]),undefined,'detach removes restriction from former attached Character');recompute+=2;
  game=project(catalog,[clone(blades),clone(lucius)],{detachmentId:'spectacle-of-slaughter',enhancements:[beguilingAssignment],attachments:{blades:['lucius']}});assert.ok(restriction(game.units[1]),'reattach recomputes restriction');recompute++;
  game=project(catalog,[clone(blades)],{detachmentId:'spectacle-of-slaughter'});assert.equal(restriction(game.units[0]),undefined,'Enhancement absent removes restriction');negative++;
  return{positive,negative,recompute,physical};
};

const controls=certify(baseline);assert.deepEqual(controls,{positive:3,negative:8,recompute:6,physical:2},'focused control inventory');
let mutations=0;const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_POSSESSED_CONTRACT',catalog=>{catalog.effectContracts=catalog.effectContracts.filter(item=>item.canonicalRecordId!=='enhancement-possessed-blade');});
killed('POSSESSED_RANGED_ALLOWED',catalog=>{contract(catalog,'enhancement-possessed-blade').rosterChoice.weaponMode='ranged';});
killed('POSSESSED_WRONG_DELTA',catalog=>{contract(catalog,'enhancement-possessed-blade').clauses[0].operations[0].parameters.delta=2;});
killed('MISSING_BEGUILING_CONTRACT',catalog=>{catalog.effectContracts=catalog.effectContracts.filter(item=>item.canonicalRecordId!=='enhancement-beguiling-grotesquerie');});
killed('BEGUILING_WRONG_SCOPE',catalog=>{contract(catalog,'enhancement-beguiling-grotesquerie').scope='owner';});
killed('BEGUILING_WRONG_TARGET',catalog=>{contract(catalog,'enhancement-beguiling-grotesquerie').clauses[0].operations[0].canonicalTarget='core-rule-15-10';});
assert.equal(mutations,6,'source-backed mutation controls');
console.log(`Emperor's Children remaining roster effects: source 2/2; executable 2/2; positive ${controls.positive}/${controls.positive}; negative ${controls.negative}/${controls.negative}; recompute ${controls.recompute}/${controls.recompute}; physical-instance ${controls.physical}/${controls.physical}; mutations ${mutations}/${mutations} KILLED; PASS`);
