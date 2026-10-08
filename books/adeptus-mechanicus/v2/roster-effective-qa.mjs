import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {buildAdMechContracts,readJson} from './rule-contract-build.mjs';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';
import {buildRosterRuntimeBook} from './roster-build.mjs';

// Integration uses the entire current book and public roster service. Canonical
// contracts are never stripped down to the operation under test.
const enh=(det,n)=>`detachment-${det}:enhancement:${n}`;
const assignments=[
  ['haloscreed-battle-clade',1,'cybernetica-datasmith','kastelan-robots'],
  ['haloscreed-battle-clade',2,'tech-priest-dominus','servitor-battleclade'],
  ['haloscreed-battle-clade',3,'tech-priest-dominus','skitarii-rangers'],
  ['haloscreed-battle-clade',4,'tech-priest-dominus','fulgurite-electro-priests'],
  ['eradication-cohort',1,'skitarii-marshal','skitarii-vanguard'],
  ['eradication-cohort',2,'tech-priest-dominus','servitor-battleclade'],
  ['eradication-cohort',3,'tech-priest-dominus','skitarii-rangers'],
  ['eradication-cohort',4,'skitarii-marshal','skitarii-vanguard'],
  ['data-psalm-conclave',1,'tech-priest-dominus','fulgurite-electro-priests'],
  ['data-psalm-conclave',4,'tech-priest-dominus','fulgurite-electro-priests'],
  ['skitarii-hunter-cohort',2,'skitarii-marshal','skitarii-rangers'],
  ['cohort-cybernetica',4,'tech-priest-dominus','servitor-battleclade'],
  ['rad-zone-corps',2,'tech-priest-dominus','servitor-battleclade'],
  ['rad-zone-corps',3,'tech-priest-dominus','skitarii-vanguard'],
  ['rad-zone-corps',4,'tech-priest-dominus','servitor-battleclade'],
  ['luminen-auto-choir',2,'tech-priest-dominus','corpuscarii-electro-priests'],
  ['lords-of-the-forge',2,'tech-priest-dominus','servitor-battleclade'],
  ['cohort-acquisitus',1,'skitarii-marshal','skitarii-rangers'],
  ['cohort-acquisitus',2,'serberys-raiders',null]
];
export function effectiveIntegrationFixture(book) {
  const index=new Map(book.entities.map(e=>[e.id,e]));
  const make=(instanceId,name,enhancementIds=[])=>{
    const canonicalUnitId='unit-'+name,unit=index.get(canonicalUnitId);
    assert.ok(unit,`Source-backed fixture identity missing: ${canonicalUnitId}`);
    const mixed=unit.data.profileIds.length>1;
    const quantity=mixed?9:name.startsWith('skitarii-')&&name!=='skitarii-marshal'?10:name.includes('electro-priests')?5:name==='kastelan-robots'?2:name==='serberys-raiders'?3:1;
    const chosen=new Map();
    for(const id of unit.data.weaponIds){const w=index.get(id);if(!chosen.has(w.data.mode))chosen.set(w.data.mode,id);}
    return {instanceId,canonicalUnitId,startingStrength:quantity,
      modelRows:unit.data.profileIds.map((canonicalProfileId,i)=>({rowId:`row-${i}`,canonicalProfileId,quantity:mixed?(i===0?1:8):quantity,selections:[],loadouts:[]})),
      selections:[...chosen.values()].map((id,i)=>({selectionKey:`weapon-${i}`,physicalQuantity:quantity,canonicalProfileIds:[id],canonicalEquipmentIds:[]})),
      equipmentContextKnown:true,warlord:null,enhancementIds};
  };
  const units=[],attachments=[];
  for(const [det,n,name,bodyName]of assignments){
    const key=`${det}-${n}`,owner=make(`owner-${key}`,name,[enh(det,n)]);
    units.push(owner,make(`duplicate-${key}`,name));
    if(bodyName){const body=make(`body-${key}`,bodyName);units.push(body,make(`other-body-${key}`,bodyName));
      attachments.push({leaderInstanceId:owner.instanceId,bodyguardInstanceId:body.instanceId,role:['cybernetica-datasmith','skitarii-marshal'].includes(name)?'SUPPORT':'LEADER'});}
  }
  const equip=(u,id,block)=>u.selections.push({selectionKey:'equipment',physicalQuantity:1,canonicalProfileIds:[],canonicalEquipmentIds:[id],canonicalFieldPaths:{[id]:[`/blocks/${block}/text`]}});
  for(const name of ['archaeopter-fusilave','archaeopter-stratoraptor','archaeopter-transvector','onager-dunecrawler','skitarii-rangers','skitarii-vanguard']){
    const u=make(`equipment-${name}`,name),block=name.startsWith('archaeopter-')?1:2;
    if(name==='onager-dunecrawler') {
      const equipmentId='datasheet-onager-dunecrawler:wargear:3';
      u.selections.push({selectionKey:'equipment',physicalQuantity:1,canonicalProfileIds:[],
        canonicalEquipmentIds:[equipmentId],canonicalFieldPaths:{[equipmentId]:['/text']}});
    } else equip(u,`datasheet-${name}:section:1`,block);
    units.push(u,make(`no-equipment-${name}`,name));
  }
  for(const name of ['tech-priest-manipulus','technoarcheologist']){
    const u=make(name,name),body=make(`body-${name}`,'servitor-battleclade');units.push(u,body,make(`duplicate-${name}`,name));
    attachments.push({leaderInstanceId:u.instanceId,bodyguardInstanceId:body.instanceId,role:name==='technoarcheologist'?'SUPPORT':'LEADER'});
  }
  units.push(make('global-mixed-a','servitor-battleclade'),make('global-mixed-b','servitor-battleclade'),make('global-corpus','corpuscarii-electro-priests'),make('global-robots','kastelan-robots'));
  const detachmentIds=book.entities.filter(e=>e.kind==='DETACHMENT').map(e=>e.id);
  return {schema:'roster-v2/roster',bookId:book.bookId,rosterId:'am-complete-effective-integration',units,attachments,warlordInstanceId:null,
    detachmentIds,detachments:detachmentIds.map((canonicalDetachmentId,i)=>({instanceId:`det-${i}`,canonicalDetachmentId}))};
}

export function runEffectiveIntegration() {
  const built=buildAdMechContracts(),book=built.book,index=new Map(book.entities.map(e=>[e.id,e])),before=structuredClone(book);
  const prepared=buildRosterRuntimeBook(built);
  const create=()=>createAdMechRosterRuntime(prepared,readJson('roster-import-aliases.json'),{evaluator:built.schema.evaluator});
  const service=create(),state=effectiveIntegrationFixture(book),touched=new Set(),effectIds=new Set();
  const clauses=book.entities.flatMap(e=>(e.ruleContract?.clauses||[]).filter(c=>c.rosterClassification==='ROSTER_EXECUTABLE').map(c=>[e,c]));
  assert.equal(clauses.length,43);assert.equal(built.blockedIds.size,0);
  let rebuilds=0,provenanceChecks=0,effectiveChecks=0;
  const physical=(projection,id)=>projection.units.find(u=>u.instanceId===id);
  function run(snapshot){
    const saved=structuredClone(snapshot);service.load(snapshot);assert.deepEqual(snapshot,saved,'Public runtime mutated imported state');
    const projection=service.projection;assert.deepEqual(book,before,'Canonical book changed');rebuilds++;
    for(const u of projection.units){
      const effective=service.effective(u.instanceId);assert.equal(effective.canonicalUnitId,u.canonicalUnitId);assert.equal(effective.instanceId,u.instanceId);
      assert.equal(effective.profiles.length,u.profiles.length);assert.equal(effective.weapons.length,u.weapons.length+u.profiles.reduce((n,p)=>n+p.weapons.length,0));
      assert.deepEqual(effective.applied.map(({label,...p})=>p),u.applied);effectiveChecks++;
      for(const p of u.applied){
        const owner=index.get(p.ruleId),clause=owner?.ruleContract.clauses.find(c=>c.id===p.clauseId),effect=clause?.rosterEffects.find(e=>e.id===p.effectId);
        assert.ok(effect,'Applied change has no current source-backed declaration');assert.equal(clause.rosterClassification,'ROSTER_EXECUTABLE','Battle effect executed');
        assert.equal(p.targetInstanceId,u.instanceId);assert.equal(p.operation,effect.operation);assert.deepEqual(p.sourceFields,effect.sourceFields);assert.equal(p.lifetime,effect.lifetime);
        if(owner.kind==='ENHANCEMENT')assert.ok(snapshot.units.find(x=>x.instanceId===p.sourceInstanceId)?.enhancementIds.includes(p.ruleId),'Enhancement source ownership lost');
        if(owner.kind==='DETACHMENT_RULE')assert.equal(p.sourceInstanceId,null,'Global rule invented physical source');
        assert.ok(!owner.ruleContract.detachmentId||snapshot.detachmentIds.includes(owner.ruleContract.detachmentId),'Unselected Detachment effect');
        if(p.targetProfileId){assert.ok(u.profiles.some(m=>m.canonicalProfileId===p.targetProfileId&&m.scopeId===p.targetCompositionId),'Wrong MODEL/profile scope');}
        if(p.targetWeaponProfileId)assert.equal(index.get(p.targetWeaponProfileId)?.kind,'WEAPON_PROFILE');
        if(effect.targetBinding==='SOURCE_MODEL')assert.equal(p.targetInstanceId,p.sourceInstanceId,'Bearer-only effect leaked');
        touched.add(`${p.ruleId}/${p.clauseId}`);effectIds.add(`${p.ruleId}/${p.clauseId}/${p.effectId}`);provenanceChecks++;
      }
    }
    return projection;
  }
  const aloneState={...structuredClone(state),attachments:[]},alone=run(aloneState),attached=run(state);
  const wanted=new Set(clauses.map(([e,c])=>`${e.id}/${c.id}`));assert.deepEqual(touched,wanted,'Some current roster-known source clause never reached an effective physical datasheet');
  const wantedEffects=new Set(clauses.flatMap(([e,c])=>c.rosterEffects.map(x=>`${e.id}/${c.id}/${x.id}`)));assert.deepEqual(effectIds,wantedEffects);

  // Expected numeric/ability outcomes come from the source review, independent
  // of the service's evidence/provenance structures.
  const weapons=(id)=>service.effective(id).weapons;
  const field=(w,label)=>w.fields.find(f=>f.label===label)?.value;
  for(const [det,n]of [['haloscreed-battle-clade',2],['eradication-cohort',1]]){
    for(const prefix of ['owner-','body-'])for(const w of weapons(`${prefix}${det}-${n}`)){
      const base=index.get(w.id).data;
      if(base.skill!=='N/A')assert.equal(field(w,'skill'),`${Number(base.skill.replace('+',''))-1}+`,'Imperative BS/WS improvement');
      if(base.mode==='ranged'){assert.ok(field(w,'abilities').includes('HEAVY'));assert.ok(field(w,'abilities').includes('ASSAULT'));}
      assert.equal(field(w,'ap'),base.ap,'Attack-scoped Conqueror AP became permanent');
    }
  }
  for(const w of weapons('owner-eradication-cohort-4')){
    const base=index.get(w.id).data;if(base.mode==='melee'){
      assert.equal(field(w,'attacks'),String(Number(base.attacks)+2));assert.equal(field(w,'ap'),String(Number(base.ap)-1));assert.equal(field(w,'damage'),String(Number(base.damage)+1));
    }
  }
  for(const w of weapons('owner-eradication-cohort-3')){
    const base=index.get(w.id).data;if(base.mode==='ranged'){assert.equal(field(w,'range'),`${Number(base.range.replace('"',''))+6}"`);assert.equal(field(w,'strength'),String(Number(base.strength)+1));}
  }
  for(const w of weapons('owner-haloscreed-battle-clade-4')){const base=index.get(w.id).data;if(base.mode==='melee'){
    assert.equal(field(w,'attacks'),String(Number(base.attacks)+3));assert.equal(field(w,'damage'),String(Number(base.damage)+1));
  }}
  for(const w of weapons('owner-haloscreed-battle-clade-3')){const base=index.get(w.id).data;if(base.mode==='ranged')assert.equal(field(w,'range'),`${Number(base.range.replace('"',''))+6}"`);}
  assert.equal(physical(attached,'owner-data-psalm-conclave-1').profiles[0].profile.stats.LD,'6+');
  for(const m of physical(attached,'body-technoarcheologist').profiles)assert.equal(m.profile.stats.OC,String(Number(index.get(m.canonicalProfileId).data.stats.OC)+1));
  for(const m of physical(attached,'global-robots').profiles)assert.equal(m.profile.stats.M,`${Number(index.get(m.canonicalProfileId).data.stats.M.replace('"',''))+2}"`);
  const hasWeaponAbility=(id,ability,mode)=>{for(const w of weapons(id))if(!mode||index.get(w.id).data.mode===mode)assert.ok(field(w,'abilities').includes(ability),`${id}: missing ${ability}`);};
  for(const name of ['skitarii-rangers','skitarii-vanguard'])hasWeaponAbility('equipment-'+name,'IGNORES COVER','ranged');
  hasWeaponAbility('body-tech-priest-manipulus','LETHAL HITS');hasWeaponAbility('global-corpus','LETHAL HITS','ranged');
  hasWeaponAbility('owner-cohort-cybernetica-4','ANTI-VEHICLE 4+','ranged');hasWeaponAbility('body-rad-zone-corps-3','SUSTAINED HITS 1','ranged');
  hasWeaponAbility('owner-rad-zone-corps-4','ANTI-INFANTRY 2+','ranged');hasWeaponAbility('owner-rad-zone-corps-4','ANTI-MONSTER 4+','ranged');
  const modelKeywords=(id,keyword,value=true)=>assert.ok(physical(attached,id).profiles.every(m=>m.keywords.includes(keyword)===value),`${id}: wrong MODEL keyword ${keyword}`);
  for(const name of ['archaeopter-fusilave','archaeopter-stratoraptor','archaeopter-transvector']){modelKeywords('equipment-'+name,'SMOKE');modelKeywords('no-equipment-'+name,'SMOKE',false);}
  modelKeywords('equipment-onager-dunecrawler','SMOKE',false);modelKeywords('no-equipment-onager-dunecrawler','SMOKE');
  modelKeywords('owner-haloscreed-battle-clade-1','HALO OVERRIDE');modelKeywords('body-haloscreed-battle-clade-1','HALO OVERRIDE');
  modelKeywords('body-eradication-cohort-2','SKITARII');
  const loneDatasmith=physical(alone,'duplicate-haloscreed-battle-clade-1');assert.ok(loneDatasmith.keywords.includes('INFANTRY')&&!loneDatasmith.keywords.includes('VEHICLE'));
  assert.ok(loneDatasmith.profiles.every(m=>m.keywords.includes('VEHICLE')&&!m.keywords.includes('INFANTRY')),'UNIT removal rewrote MODEL intrinsic keyword');
  const unitAbility=(id,canonicalId,parameters={})=>assert.ok(physical(attached,id).abilities?.some(a=>a.canonicalId===canonicalId&&JSON.stringify(a.parameters)===JSON.stringify(parameters)),`${id}: missing UNIT ability ${canonicalId}`);
  unitAbility('body-data-psalm-conclave-4','core-fights-first');unitAbility('body-luminen-auto-choir-2','core-stealth');unitAbility('body-cohort-acquisitus-1','core-infiltrators');
  unitAbility('owner-cohort-acquisitus-2','core-lone-operative',{distance:15});
  for(const id of ['owner-skitarii-hunter-cohort-2','body-skitarii-hunter-cohort-2'])assert.ok(physical(attached,id).profiles.every(m=>m.abilities.some(a=>a.canonicalId==='core-scouts'&&a.parameters.distance===6)&&m.abilities.some(a=>a.canonicalId==='core-infiltrators')));
  assert.ok(physical(attached,'body-rad-zone-corps-2').profiles.every(m=>m.abilities.some(a=>a.canonicalId==='core-stealth')));
  assert.ok(physical(attached,'equipment-skitarii-rangers').keywords.includes('RECON AUGURY'));
  const ability=(u,name,value)=>u.profiles.every(m=>m.abilities.some(a=>a.name===name&&a.value===value));
  assert.ok(ability(physical(attached,'owner-haloscreed-battle-clade-4'),'Feel No Pain',4));
  assert.ok(ability(physical(attached,'owner-haloscreed-battle-clade-1'),'Feel No Pain',4),'Silent Protocol must grant Datasmith FNP4');
  for(const id of ['global-mixed-a','global-mixed-b']){
    const u=physical(attached,id),[underseer,servitors]=u.profiles;
    assert.ok(underseer.keywords.includes('TECH-PRIEST'));assert.ok(!servitors.keywords.includes('TECH-PRIEST'));
    assert.equal(underseer.profile.INSV,'4+');assert.ok(underseer.abilities.some(a=>a.name==='Feel No Pain'&&a.value===5));
    assert.ok(!servitors.abilities.some(a=>a.name==='Feel No Pain'));assert.equal(servitors.profile.INSV,index.get(servitors.canonicalProfileId).data.INSV);
  }
  const contribution=enh('lords-of-the-forge',2)+':weapon:1';
  assert.equal(weapons('owner-lords-of-the-forge-2').filter(w=>w.id===contribution).length,1);
  assert.equal(weapons('body-lords-of-the-forge-2').filter(w=>w.id===contribution).length,0);
  assert.equal(weapons('duplicate-lords-of-the-forge-2').filter(w=>w.id===contribution).length,0);
  for(const u of attached.units.filter(u=>u.instanceId.startsWith('duplicate-')||u.instanceId.startsWith('other-body-')))
    assert.deepEqual(u,physical(alone,u.instanceId),'Attachment or Enhancement leaked to another physical instance');

  // Every attach/detach action goes through the same public service as the UI.
  for(const link of state.attachments)service.detach(link.leaderInstanceId);
  assert.deepEqual(service.projection,alone,'Detach failed to remove attachment-dependent changes');
  for(const link of state.attachments)service.attach(link.leaderInstanceId,link.bodyguardInstanceId);
  assert.deepEqual(service.projection,attached,'Reattach failed to restore effects');
  const noEnhancements=structuredClone(state);for(const u of noEnhancements.units)u.enhancementIds=[];
  const removed=run(noEnhancements);assert.ok(removed.units.every(u=>u.applied.every(p=>index.get(p.ruleId).kind!=='ENHANCEMENT')));
  assert.ok(removed.units.every(u=>[...u.weapons,...u.profiles.flatMap(m=>m.weapons)].every(w=>w.canonicalProfileId!==contribution)));
  assert.deepEqual(run(state),attached,'Restoring Enhancements changed effective state');
  const noDetachments=structuredClone(state);noDetachments.detachmentIds=['detachment-rad-zone-corps'];noDetachments.detachments=[{instanceId:'rad-only',canonicalDetachmentId:'detachment-rad-zone-corps'}];
  for(const u of noDetachments.units)u.enhancementIds=[];
  const unselected=run(noDetachments);assert.ok(unselected.units.every(u=>u.applied.every(p=>!index.get(p.ruleId).ruleContract.detachmentId)));
  assert.deepEqual(run(state),attached,'Rebuild accumulated changes');
  const reversed=structuredClone(state);reversed.units.reverse();reversed.attachments.reverse();reversed.detachmentIds.reverse();reversed.detachments.reverse();
  const reordered=run(reversed);for(const u of attached.units)assert.deepEqual(physical(reordered,u.instanceId),u,'Import/attachment/Detachment ordering changed effective state');
  const fresh=create();fresh.load(JSON.parse(JSON.stringify(state)));assert.deepEqual(fresh.projection,attached,'Reload or new service changed results');
  // Two independently owned Enhancements can contribute the same canonical
  // Imperative to one group; the shared contribution identity applies it once.
  service.load(state);service.reattach('owner-haloscreed-battle-clade-2','body-eradication-cohort-1');
  const composedState=service.snapshot(),composed=run(composedState);
  assert.equal(composed.formedUnits.find(g=>g.memberInstanceIds.includes('body-eradication-cohort-1')).memberInstanceIds.length,3);
  for(const id of ['owner-haloscreed-battle-clade-2','owner-eradication-cohort-1','body-eradication-cohort-1'])for(const w of service.effective(id).weapons){
    const base=index.get(w.id).data;if(base.skill!=='N/A')assert.equal(field(w,'skill'),`${Number(base.skill.replace('+',''))-1}+`,'Same canonical Imperative contribution was doubled');
  }
  const reversedGroup=structuredClone(composedState);reversedGroup.attachments.reverse();reversedGroup.detachmentIds.reverse();reversedGroup.detachments.reverse();
  const composedReversed=run(reversedGroup);for(const u of composed.units)assert.deepEqual(physical(composedReversed,u.instanceId),u,'Leader/Support order changed one formed group');
  const removedOwner=structuredClone(composedState);removedOwner.units.find(u=>u.instanceId==='owner-haloscreed-battle-clade-2').enhancementIds=[];
  const retained=run(removedOwner);for(const id of ['owner-haloscreed-battle-clade-2','owner-eradication-cohort-1','body-eradication-cohort-1'])
    assert.deepEqual(physical(retained,id).profiles,physical(composed,id).profiles,'Removing one owner removed another owner\'s independent Imperative contribution');
  run(state);
  let relatedChecks=0;for(const id of ['owner-haloscreed-battle-clade-2','global-mixed-a','equipment-onager-dunecrawler'])for(const row of service.related(id)){
    assert.ok(state.detachmentIds.includes(row.detachmentId));assert.notEqual(row.state,'INVALID');assert.equal(row.instanceId,id);relatedChecks++;
  }
  return {status:'PASS',rosterClauses:43,projectedClauses:touched.size,sourceOperations:effectIds.size,physicalInstances:state.units.length,rebuilds,provenanceChecks,effectiveChecks,
    relatedChecks,immutableCanonicalFacts:true,mixedProfileIsolation:true,physicalOwnerIsolation:true,attachmentReversibility:true,enhancementRemoveRestore:true,deterministic:true,battleEffectLeakage:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(runEffectiveIntegration()));
