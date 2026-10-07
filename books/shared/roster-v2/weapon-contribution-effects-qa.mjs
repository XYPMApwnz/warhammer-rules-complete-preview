/** Independent synthetic guards: canonical weapon contributions are references,
 * never imported equipment ownership or a second weapon-fact catalog. */
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {changeAttachment,validateRoster,withRosterDetachments} from './context.mjs';
import {executeRosterEffects,validateRosterEffects} from './effects.mjs';
import {createRosterRuntime} from './runtime.mjs';
import {buildAttachmentFeasibility} from './compatibility-feasibility.mjs';
import {projectInstanceCards} from '../army-book-app-v2/personal.mjs';

const clone=value=>structuredClone(value),id=name=>'synthetic-contribution:'+name;
const evidence={field:['text'],quote:'Reviewed synthetic bearer contribution evidence.'};
const evaluator=withRosterDetachments(createRuleContractSchema({stateFields:{}}));
const atom=(predicate,subject,arguments_)=>({predicate,subject,arguments:arguments_,contextLevel:'STATIC',evidence:clone(evidence)});
const checks=[];const check=(name,run)=>{run();checks.push(name);};
const getUnit=(projection,instance='owner-a')=>projection.units.find(unit=>unit.instanceId===instance);
const contributed=(projection,instance='owner-a')=>getUnit(projection,instance).profiles.flatMap(model=>model.weapons)
  .filter(weapon=>weapon.canonicalProfileId===id('gift-weapon'));
export function fixture({mixed=false,quantity=1}={}) {
  const entities=[{id:id('detachment'),kind:'DETACHMENT',data:{title:'Synthetic detachment'}}];
  const rosterProfileBindings=[];
  for(const [name,profiles,keywords] of [
    ['bearer',mixed?['eligible','sibling']:['eligible'],['CHARACTER']],['bodyguard',['bodyguard-profile'],['INFANTRY']]
  ]) {
    entities.push({id:id(name),kind:'DATASHEET',data:{title:name,keywords,factionKeywords:[],profileIds:profiles.map(id),
      weaponIds:[id(name+'-weapon')],ruleReferenceIds:[],sectionIds:[],wargearOptionIds:[]}});
    for(const profile of profiles) {
      entities.push({id:id(profile),kind:'PROFILE',parentId:id(name),data:{name:profile,M:'6"',T:'4',SV:'3+',W:'3',LD:'6+',OC:'1'}});
      rosterProfileBindings.push({unitId:id(name),profileId:id(profile),intrinsicKeywords:profile==='eligible'?['CHARACTER']:['INFANTRY'],abilities:[],referenceIds:[]});
    }
    entities.push({id:id(name+'-weapon'),parentId:id(name),kind:'WEAPON_PROFILE',data:{name:'Ordinary weapon',mode:'ranged',
      range:'18"',attacks:'1',skill:'4+',strength:'4',ap:'0',damage:'1',abilities:[]}});
  }
  const effect={id:'gift/effect',operation:'CONTRIBUTE_WEAPON_PROFILE',targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',
    weaponProfileId:id('gift-weapon'),conditions:[],evidence:clone(evidence),sourceFields:[['text']],lifetime:'ROSTER'};
  const ownerRole={id:'owner',subject:'MODEL',allegiance:'FRIENDLY',selector:atom('MODEL_ID','MODEL',{id:id('eligible')}),conditions:[]};
  const enhancement={id:id('gift'),parentId:id('detachment'),kind:'ENHANCEMENT',provenance:{sourceId:id('source')},
    data:{title:'Synthetic bearer gift',text:evidence.quote,weaponIds:[id('gift-weapon')]}};
  enhancement.ruleContract={schema:'rule-contract/v2',ruleId:enhancement.id,ownerId:enhancement.parentId,sourceId:enhancement.provenance.sourceId,
    kind:'ENHANCEMENT',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',detachmentId:id('detachment'),roles:[ownerRole],conditions:[],
    assignment:{ownerRoleId:'owner',selector:clone(ownerRole.selector)},sourceFields:[['text']],
    clauses:[{id:'gift/clause',roles:[],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]};
  entities.push(enhancement,{id:id('gift-weapon'),parentId:enhancement.id,kind:'WEAPON_PROFILE',provenance:{sourceId:id('source')},
    data:{name:'Synthetic canonical gift',mode:'ranged',range:'24"',attacks:'2',skill:'3+',strength:'6',ap:'-2',damage:'2',abilities:['BASE ABILITY']}});
  const book={bookId:id('book'),entities,rosterProfileBindings,rosterAttachmentPolicies:[{
    sourceId:id('bearer'),targetId:id('bodyguard'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}]};
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,rosterProfileBindings.map(binding=>({...binding,maxModels:3})));
  const makeUnit=(instanceId,name,assigned=false)=>{
    const canonical=entities.find(entity=>entity.id===id(name));
    const rows=canonical.data.profileIds.map(profile=>({rowId:profile,canonicalProfileId:profile,quantity:name==='bearer'?quantity:3,selections:[],loadouts:[]}));
    return {instanceId,canonicalUnitId:canonical.id,startingStrength:rows.reduce((sum,row)=>sum+row.quantity,0),modelRows:rows,
      selections:[{selectionKey:'ordinary',physicalQuantity:1,canonicalProfileIds:[id(name+'-weapon')],canonicalEquipmentIds:[]}],
      enhancementIds:assigned?[enhancement.id]:[],warlord:null};
  };
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'synthetic-roster',
    detachments:[{instanceId:'detachment/1',canonicalDetachmentId:id('detachment')}],detachmentIds:[id('detachment')],
    units:[makeUnit('owner-a','bearer',true),makeUnit('owner-b','bearer'),makeUnit('guard-a','bodyguard'),makeUnit('guard-b','bodyguard')],
    attachments:[],warlordInstanceId:null};
  return {book,state,effect,enhancement};
}
function execute(book,state) {
  const beforeBook=clone(book),beforeState=clone(state);
  evaluator.validateContracts(book);validateRosterEffects(book,evaluator.validatePredicate,evaluator.evaluatePredicate);
  const result=executeRosterEffects(book,validateRoster(book,state,book.rosterAttachmentPolicies),evaluator);
  assert.deepEqual(book,beforeBook,'Contribution mutated canonical facts');assert.deepEqual(state,beforeState,'Contribution rewrote imported ownership');
  return result;
}
function addModifier(fixture,operation,extra) {
  const {enhancement}=fixture;
  enhancement.ruleContract.clauses[0].rosterEffects.unshift({id:'gift/'+operation,operation,targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',
    weaponIds:[id('gift-weapon')],conditions:[{binding:'TARGET',predicate:atom('MODEL_ID','MODEL',{id:id('eligible')})}],
    evidence:clone(evidence),sourceFields:[['text']],lifetime:'ROSTER',...extra});
}
export function cardsFor(book) {
  return new Map(book.entities.map(entity=>[entity.id,{id:entity.id,kind:entity.kind,parentId:entity.parentId,contextId:entity.id,
    title:entity.data.title||entity.data.name,children:entity.kind==='DATASHEET'?[...entity.data.profileIds,...entity.data.weaponIds]:[],
    fields:Object.entries(entity.data).flatMap(([key,value])=>Array.isArray(value)?value.map((item,index)=>({id:entity.id+'::/'+key+'/'+index,
      label:key,type:'tokens',value:item,source:{entityId:entity.id,path:'/'+key+'/'+index}})):
      [{id:entity.id+'::/'+key,label:key,type:'text',value,source:{entityId:entity.id,path:'/'+key}}])}]));
}

function runSyntheticGuards() {
check('assigned owner receives one existing canonical weapon with exact physical quantity',()=>{
  const {book,state}=fixture(),result=execute(book,state),weapons=contributed(result);
  assert.equal(weapons.length,1);assert.equal(weapons[0].physicalQuantity,1);
  assert.deepEqual(weapons[0].data,book.entities.find(entity=>entity.id===id('gift-weapon')).data);
  assert.equal(weapons[0].modelInstanceId,'owner-a');assert.equal(weapons[0].scopeId,getUnit(result).profiles[0].scopeId);
});
check('identical unenhanced physical instance and Bodyguards receive nothing',()=>{
  const {book,state}=fixture(),result=execute(book,state);
  for(const instance of ['owner-b','guard-a','guard-b'])assert.equal(contributed(result,instance).length,0);
});
check('canonical datasheet weapon membership and imported selections stay unchanged',()=>{
  const {book,state}=fixture(),bookBefore=clone(book),stateBefore=clone(state);execute(book,state);
  assert.deepEqual(book,bookBefore);assert.deepEqual(state,stateBefore);
  assert(!book.entities.find(entity=>entity.id===id('bearer')).data.weaponIds.includes(id('gift-weapon')));
});
check('explicit source-backed weapon classification can supply an absent canonical mode',()=>{
  const {book,state,effect}=fixture(),canonical=book.entities.find(entity=>entity.id===id('gift-weapon'));
  delete canonical.data.mode;effect.weaponMode='ranged';const result=execute(book,state);
  assert.equal(contributed(result)[0].data.mode,'ranged');assert(!Object.hasOwn(canonical.data,'mode'));
});
check('attachment adds no weapon to Bodyguard and does not transfer physical ownership',()=>{
  const {book,state}=fixture(),attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','owner-a','guard-a'),result=execute(book,attached);
  assert.equal(contributed(result).length,1);assert.equal(contributed(result,'guard-a').length,0);assert.equal(contributed(result,'owner-b').length,0);
});
check('detach and reattach preserve the original exact bearer and canonical identity',()=>{
  const {book,state}=fixture();let attached=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','owner-a','guard-a');
  const before=execute(book,attached);let detached=changeAttachment(book,attached,book.rosterAttachmentPolicies,'DETACH','owner-a');
  assert.equal(contributed(execute(book,detached)).length,1);
  detached=changeAttachment(book,detached,book.rosterAttachmentPolicies,'REATTACH','owner-a','guard-a');
  assert.deepEqual(execute(book,detached),before);
});
check('removal clears derived inventory and reassignment restores without stale rows',()=>{
  const {book,state}=fixture(),before=execute(book,state),without=clone(state);getUnit(without).enhancementIds=[];
  assert.equal(contributed(execute(book,without)).length,0);getUnit(without).enhancementIds=[id('gift')];
  assert.deepEqual(execute(book,without),before);
});
check('moving the imported assignment to another instance changes only the effective owner',()=>{
  const {book,state}=fixture();getUnit(state).enhancementIds=[];getUnit(state,'owner-b').enhancementIds=[id('gift')];
  const result=execute(book,state);assert.equal(contributed(result).length,0);assert.equal(contributed(result,'owner-b').length,1);
});
check('mixed-profile bearer eligibility does not inherit onto sibling profiles',()=>{
  const {book,state}=fixture({mixed:true}),result=execute(book,state);
  assert.equal(contributed(result).length,1);assert.equal(getUnit(result).profiles.find(profile=>profile.canonicalProfileId===id('sibling')).weapons.length,0);
  assert.equal(contributed(result)[0].scopeId,getUnit(result).profiles.find(profile=>profile.canonicalProfileId===id('eligible')).scopeId);
});
check('ambiguous repeated eligible profile scopes fail closed instead of choosing first',()=>{
  const {book,state}=fixture({mixed:true}),owner=getUnit(state);owner.modelRows.push({...clone(owner.modelRows[0]),rowId:'second-eligible'});owner.startingStrength++;
  assert.throws(()=>execute(book,state),/ambiguous|bearer|owner|recipient|quantity/i);
});
check('an aggregate eligible profile does not invent an individual bearer',()=>{
  const {book,state}=fixture({quantity:2});assert.throws(()=>execute(book,state),/ambiguous|bearer|owner|recipient|quantity/i);
});
check('contribution is present before an earlier declared numeric weapon modifier executes',()=>{
  const f=fixture();addModifier(f,'MODIFY_STAT',{field:'strength',mode:'ADD',value:2});const result=execute(f.book,f.state);
  assert.equal(contributed(result)[0].data.strength,'8');assert.equal(f.book.entities.find(entity=>entity.id===id('gift-weapon')).data.strength,'6');
});
check('existing weapon ability grants modify contributed canonical profile after inventory construction',()=>{
  const f=fixture();addModifier(f,'GRANT_WEAPON_ABILITY',{ability:'SYNTHETIC GRANT'});const result=execute(f.book,f.state);
  assert.deepEqual(contributed(result)[0].data.abilities,['BASE ABILITY','SYNTHETIC GRANT']);
});
check('provenance binds Enhancement, source owner, exact recipient and canonical weapon reference',()=>{
  const {book,state}=fixture(),result=execute(book,state),rows=getUnit(result).applied.filter(row=>row.operation==='CONTRIBUTE_WEAPON_PROFILE');
  assert.equal(rows.length,1);const row=rows[0];
  assert.equal(row.ruleId,id('gift'));assert.equal(row.sourceInstanceId,'owner-a');assert.equal(row.targetInstanceId,'owner-a');
  assert.equal(row.targetProfileId,id('eligible'));assert.equal(row.targetWeaponProfileId,id('gift-weapon'));assert.equal(row.before,null);
  assert.equal(row.field,'weapons');assert.equal(row.targetCompositionId,getUnit(result).profiles[0].scopeId);
  assert.equal(row.after.canonicalProfileId,id('gift-weapon'));assert.equal(row.after.physicalQuantity,1);
  assert(!Object.hasOwn(row.after,'data'),'Provenance duplicated canonical weapon facts');
  assert.deepEqual(row.sourceFields,[['text']]);assert.equal(row.lifetime,'ROSTER');
});
check('repeat rebuild and snapshot roundtrip reproduce identical projection',()=>{
  const {book,state}=fixture();assert.deepEqual(execute(book,state),execute(book,JSON.parse(JSON.stringify(state))));
});
check('roster runtime effective cards retain canonical weapon and exact scope bindings',()=>{
  const {book,state}=fixture(),runtime=createRosterRuntime(book,{parse:()=>{throw new Error('Parsing is not used');},...evaluator});
  runtime.load(state);const effective=runtime.effective('owner-a'),weapons=effective.weapons.filter(weapon=>weapon.id===id('gift-weapon'));
  assert.equal(weapons.length,1);assert.equal(weapons[0].ownerInstanceId,'owner-a');assert(weapons[0].scopeId);
  const cards=cardsFor(book),variants=projectInstanceCards(cards,getUnit(state),effective),root=variants.get(id('bearer'))[0];
  assert(root.children.includes(id('gift-weapon')),'Player-facing datasheet omitted the contributed canonical child');
  const card=variants.get(id('gift-weapon'))[0];assert.equal(card.id,id('gift-weapon'));assert.equal(card.instanceId,'owner-a');assert.equal(card.scopeId,weapons[0].scopeId);
  assert.equal(card.fields.find(field=>field.source.path==='/strength').value,'6');
  assert(!projectInstanceCards(cards,getUnit(state,'owner-b'),runtime.effective('owner-b')).get(id('bearer'))[0].children.includes(id('gift-weapon')));
  const roundtrip=createRosterRuntime(book,{parse:()=>null,...evaluator});roundtrip.load(runtime.snapshot());assert.deepEqual(roundtrip.projection,runtime.projection);
});
for(const [name,mutate] of [
  ['unresolved canonical ID',f=>{f.effect.weaponProfileId=id('missing');}],
  ['title-only weapon lookup',f=>{delete f.effect.weaponProfileId;f.effect.weaponTitle='Synthetic canonical gift';}],
  ['wrong canonical record kind',f=>{f.effect.weaponProfileId=id('eligible');}],
  ['foreign datasheet weapon',f=>{f.effect.weaponProfileId=id('bearer-weapon');}],
  ['weapon not declared by Enhancement',f=>{f.enhancement.data.weaponIds=[];}],
  ['wrong canonical Enhancement parent',f=>{f.book.entities.find(entity=>entity.id===id('gift-weapon')).parentId=id('detachment');}],
  ['inline weapon facts',f=>{f.effect.weapon={strength:'99'};}],
  ['contradictory weapon classification',f=>{f.effect.weaponMode='melee';}],
  ['missing canonical and declared classification',f=>{delete f.book.entities.find(entity=>entity.id===id('gift-weapon')).data.mode;}],
  ['UNIT recipient',f=>{f.effect.targetSubject='UNIT';f.effect.targetBinding='SOURCE_UNIT';}],
  ['formed-group recipient',f=>{f.effect.targetBinding='SOURCE_FORMED_MODELS';}],
  ['global recipient',f=>{f.effect.targetBinding='ROSTER_MODELS';}],
  ['severed source evidence',f=>{f.effect.evidence.quote='Invented';}]
])check(name+' fails closed',()=>{const f=fixture();mutate(f);assert.throws(()=>execute(f.book,f.state));});

console.log(JSON.stringify({status:'PASS',checks:checks.length,names:checks},null,2));
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)runSyntheticGuards();
