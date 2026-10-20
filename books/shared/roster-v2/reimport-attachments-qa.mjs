/** Reimport is atomic: preserve CURRENT links only for an identical, fully
 * resolved input; changed candidates require an explicit replacement. These
 * constructed texts reuse accepted native units, not an army-legality test. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {commitRosterImport} from './runtime.mjs';
import {createDGRosterRuntime} from '../../death-guard/v2/roster-boot.mjs';
import {createAdMechRosterRuntime} from '../../adeptus-mechanicus/v2/roster-runtime.mjs';
import {createCSMBrowserRoster} from '../../chaos-space-marines/v2/roster-boot.mjs';
import {createECBrowserRoster} from '../../emperors-children/v2/roster-boot.mjs';
import {createTyranidsBrowserRoster} from '../../tyranids/v2/roster-boot.mjs';
import {createTauBrowserRoster} from '../../tau-empire/v2/roster-boot.mjs';
const read=file=>JSON.parse(fs.readFileSync(new URL('../../'+file,import.meta.url),'utf8'));
const copy=structuredClone;
const cases=[
  {book:'death-guard',detachment:'Virulent Vectorium',otherDetachment:'Flyblown Host',
    leader:'unit-noxious-blightbringer',bodyguard:'unit-plague-marines',
    text:'1x Noxious Blightbringer (50 pts): Plasma pistol, Cursed plague bell\n5x Plague Marines (100 pts)\n• 1x Plague Champion: Plague knives\n• 4x Plague Marines: Plague knives\n',
    make:()=>createDGRosterRuntime(read('death-guard/v2/generated/rule-contract-effective.json'))},
  {book:'adeptus-mechanicus',detachment:'Haloscreed Battle Clade',otherDetachment:'Rad-Zone Corps',
    leader:'unit-tech-priest-dominus',bodyguard:'unit-skitarii-vanguard',
    text:'1x Tech-Priest Dominus (65 pts): Volkite blaster, Macrostubber, Omnissian axe\n10x Skitarii Vanguard (95 pts)\n• 1x Vanguard Alpha: Radium carbine, Close combat weapon\n• 9x Skitarii Vanguard: Radium carbine, Close combat weapon\n',
    make:()=>createAdMechRosterRuntime(read('adeptus-mechanicus/v2/generated/roster-runtime.json'),read('adeptus-mechanicus/v2/roster-import-aliases.json'))},
  {book:'chaos-space-marines',detachment:'Veterans of the Long War',otherDetachment:'Renegade Warband',
    leader:'unit-master-of-possession',bodyguard:'unit-possessed',
    text:'1x Master of Possession (70 pts): Bolt pistol, Rite of Possession, Staff of possession\n5x Possessed (120 pts)\n• 5x Possessed: Hideous mutations\n',
    make:()=>createCSMBrowserRoster(read('chaos-space-marines/v2/generated/roster-runtime.json'),read('chaos-space-marines/v2/generated/roster-import.json'),read('chaos-space-marines/v2/roster-attachment-bindings.json'))},
  {book:'emperors-children',detachment:'Court of the Phoenician',otherDetachment:'Carnival of Excess',
    leader:'unit-lucius-the-eternal',bodyguard:'unit-flawless-blades',
    text:'1x Lucius the Eternal (130 pts): Blade of the Laer, Lash of Torment\n3x Flawless Blades (95 pts)\n• 3x Flawless Blade: Bolt pistol, Blissblade\n',
    make:()=>createECBrowserRoster(read('emperors-children/v2/generated/roster-attachments.json'))},
  {book:'tyranids',detachment:'Invasion Fleet',otherDetachment:'Crusher Stampede',
    leader:'unit-broodlord',bodyguard:'unit-genestealers',
    text:'1x Broodlord (80 pts)\n• 1x Broodlord: Broodlord claws and talons\n5x Genestealers (75 pts)\n• 5x Genestealers: Genestealer claws and talons\n',
    make:()=>createTyranidsBrowserRoster(read('tyranids/v2/generated/roster-runtime.json'))},
  {book:'tau-empire',detachment:'Mont’ka',otherDetachment:'Kauyon',
    leader:'unit-cadre-fireblade',bodyguard:'unit-breacher-team',
    text:'1x Cadre Fireblade (50 pts)\n• 1x Cadre Fireblade: Fireblade pulse rifle, Close combat weapon\n10x Breacher Team (90 pts)\n• 1x Breacher Fire Warrior Shas’ui: Pulse blaster, Pulse pistol, Close combat weapon\n• 9x Breacher Fire Warriors: Pulse blaster, Pulse pistol, Close combat weapon\n',
    make:()=>createTauBrowserRoster(read('tau-empire/v2/generated/roster-import.json'))}
];
const header=c=>'+ DETACHMENT: '+c.detachment+'\n';
function ready(service,text,options){const result=service.import(text,{},options);assert.equal(result.status,'READY',JSON.stringify(result));return result;}

export function runReimportAttachmentGuard(){
  const results=[];
  for(const c of cases){
    const text=header(c)+c.text,service=c.make();ready(service,text);
    const leader=service.state.units.find(u=>u.canonicalUnitId===c.leader)?.instanceId;
    const bodyguard=service.state.units.find(u=>u.canonicalUnitId===c.bodyguard)?.instanceId;
    assert.ok(leader&&bodyguard,c.book+' fixture identities');
    service.attach(leader,bodyguard);
    const attached=service.snapshot(),projection=copy(service.projection);
    assert.equal(attached.attachments.length,1,c.book+' native attachment');
    const imported=ready(service,text);
    assert.deepEqual(imported.roster,attached,c.book+' import result carries current links');
    assert.deepEqual(service.snapshot(),attached,c.book+' identical import snapshot');
    assert.deepEqual(service.projection,projection,c.book+' identical import effect projection');
    ready(service,text);service.load(service.snapshot());
    assert.deepEqual(service.projection,projection,c.book+' repeat/recompute must not accumulate effects');
    const unresolved=service.import('+ DETACHMENT: '+c.detachment+'\n1x Unknown canonical unit (1 pts)',{});
    assert.equal(unresolved.status,'NEEDS_BINDINGS');assert.deepEqual(service.snapshot(),attached,c.book+' unresolved import atomic');
    const contradictory=text.replace(/(^|\n)(\d+)x ([^\n]+)\n(?=•)/,(_match,start,n,label)=>`${start}${Number(n)+1}x ${label}\n`);
    assert.notEqual(contradictory,text,'Contradiction control must change an explicit UNIT total');
    const invalid=service.import(contradictory,{});
    assert.equal(invalid.status,'INVALID',c.book+' contradictory composition is a genuine invalid input');
    assert.deepEqual(service.snapshot(),attached,c.book+' INVALID import cannot commit');
    assert.deepEqual(service.projection,projection,c.book+' INVALID import cannot change effects');
    const changed=header({...c,detachment:c.otherDetachment})+c.text;
    const pending=service.import(changed,{});
    assert.equal(pending.status,'REPLACEMENT_REQUIRED',c.book+' changed input confirmation');
    assert.equal(pending.roster,null);assert.deepEqual(service.snapshot(),attached,c.book+' no confirmation means no commit');
    assert.deepEqual(service.projection,projection,c.book+' declined replacement preserves effects');
    ready(service,changed,{replaceExisting:true});
    assert.equal(service.state.attachments.length,0,c.book+' confirmed replacement does not inherit old links');
    service.load(attached);service.detach(leader);
    const detached=service.snapshot(),detachedProjection=copy(service.projection);
    ready(service,text);assert.deepEqual(service.snapshot(),detached,c.book+' explicit detach persists');
    assert.deepEqual(service.projection,detachedProjection,c.book+' no resurrected Leader effects');
    service.load(attached);service.load(detached);ready(service,text);
    assert.deepEqual(service.snapshot(),detached,c.book+' ordinary empty snapshot remains empty');
    const broken=copy(attached);broken.units=broken.units.filter(unit=>unit.instanceId!==leader);
    assert.throws(()=>service.load(broken),undefined,c.book+' whole graph validation');
    assert.deepEqual(service.snapshot(),detached,c.book+' invalid graph load atomic');
    results.push({book:c.book,attachmentsBefore:1,attachmentsAfter:1,identicalSnapshot:'PASS',effectsAndRecompute:'PASS',changedInputConfirmation:'PASS',confirmedReplacement:'PASS',invalidImportAtomic:'PASS',explicitDetach:'PASS',emptySnapshot:'PASS',wholeGraphValidation:'PASS'});
  }

  // Actual parsed duplicate UNITs demonstrate why canonical/ordinal identity
  // alone is insufficient even when both repeated Datasheets still exist.
  const tau=cases.find(c=>c.book==='tau-empire'),
    shield='1x Commander In Coldstar Battlesuit (70 pts)\n• 1x Commander In Coldstar Battlesuit: High-output burst cannon, Battlesuit fists, Shield drone\n',
    marker='1x Commander In Coldstar Battlesuit (70 pts)\n• 1x Commander In Coldstar Battlesuit: High-output burst cannon, Battlesuit fists, Marker drone\n',
    repeatedText=header(tau)+tau.text+shield+marker,duplicate=tau.make();
  ready(duplicate,repeatedText);duplicate.attach('parsed-unit-1','parsed-unit-2');
  const beforeDuplicate=duplicate.snapshot(),duplicateProjection=copy(duplicate.projection);
  const physicalChanges=[
    ['reordered-identical-datasheets',header(tau)+tau.text+marker+shield],
    ['deleted-unit',header(tau)+tau.text+shield],
    ['changed-loadout',header(tau)+tau.text+marker+marker],
    ['changed-model-count',header(tau)+tau.text.replace('10x Breacher Team','9x Breacher Team').replace('9x Breacher Fire Warriors','8x Breacher Fire Warriors')+shield+marker],
    ['changed-detachment',repeatedText.replace('Mont’ka','Kauyon')]
  ];
  for(const [id,text]of physicalChanges){
    const fresh=tau.make();ready(fresh,text);
    if(id==='reordered-identical-datasheets'){
      assert.deepEqual(fresh.state.units.map(u=>[u.instanceId,u.canonicalUnitId]),beforeDuplicate.units.map(u=>[u.instanceId,u.canonicalUnitId]));
      assert.notDeepEqual(fresh.state.units,beforeDuplicate.units,'Equal ordinal/canonical IDs do not prove equal physical loadouts');
    }
    assert.equal(duplicate.import(text,{}).status,'REPLACEMENT_REQUIRED',id);
    assert.deepEqual(duplicate.snapshot(),beforeDuplicate,id+' must preserve active roster');
    assert.deepEqual(duplicate.projection,duplicateProjection,id+' must preserve effects');
    ready(duplicate,text,{replaceExisting:true});assert.deepEqual(duplicate.state.attachments,[],id);
    duplicate.load(beforeDuplicate);
  }

  // The existing T’au decision owner must preserve a selected choice AND an
  // explicitly cleared typed field, otherwise a same-input reimport would
  // spuriously require replacement or resurrect a previously removed grant.
  const prototypeText='+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Experimental Prototype Cadre\n'+
    '1x Commander In Coldstar Battlesuit (100 pts)\n• 1x Commander in Coldstar Battlesuit: 2x T’au flamer\nEnhancement: Thermoneutronic Projector\n';
  const prototype=tau.make();ready(prototype,prototypeText);
  const prototypeChoice=prototype.sourceChoices('parsed-unit-1')[0];assert.ok(prototypeChoice.options.length);
  prototype.setSourceChoice('parsed-unit-1',prototypeChoice.id,prototypeChoice.options[0].id);
  const tauBook=read('tau-empire/v2/generated/roster-import.json');
  const unitBlock=id=>{
    const unit=tauBook.entities.find(entity=>entity.id===id);
    const rows=tauBook.entities.filter(entity=>entity.parentId===id&&entity.kind==='COMPOSITION_MEMBER'&&entity.data.quantity.min>0);
    return rows.reduce((sum,row)=>sum+row.data.quantity.min,0)+'x '+unit.data.title+' (100 pts)\n'+
      rows.map(row=>'• '+row.data.quantity.min+'x '+row.data.name+'\n').join('');
  };
  const studentText='+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Auxiliary Cadre\n'+
    unitBlock('unit-kroot-trail-shaper')+'Enhancement: Student of Kauyon\n'+unitBlock('unit-kroot-carnivores')+unitBlock('unit-kroot-carnivores');
  const student=tau.make();ready(student,studentText);
  const studentChoice=student.sourceChoices('parsed-unit-1')[0];assert.ok(studentChoice.options.length);
  student.setSourceChoice('parsed-unit-1',studentChoice.id,studentChoice.options.find(option=>option.id==='["parsed-unit-2"]').id);
  const sourceChoiceControls=[];
  for(const [name,service,text,choice,field]of [
    ['Prototype',prototype,prototypeText,prototypeChoice,'selectedTauWeaponChoiceIds'],
    ['Student',student,studentText,studentChoice,'selectedTauSourceChoiceIds']
  ]){
    const selected=service.snapshot(),selectedProjection=copy(service.projection);
    ready(service,text);assert.deepEqual(service.snapshot(),selected,name+' selected choice retained exactly');
    assert.deepEqual(service.projection,selectedProjection,name+' selected effects/provenance retained exactly');
    service.setSourceChoice('parsed-unit-1',choice.id,null);
    const cleared=service.snapshot(),clearedProjection=copy(service.projection);
    assert.deepEqual(cleared.units[0][field],[],name+' current explicit clear marker');
    ready(service,text);assert.deepEqual(service.snapshot(),cleared,name+' cleared typed field remains authoritative');
    assert.deepEqual(service.projection,clearedProjection,name+' no resurrected grant or changed provenance');
    ready(service,text);assert.deepEqual(service.projection,clearedProjection,name+' repeated cleared choice no accumulation');
    assert.equal(service.sourceChoices('parsed-unit-1').find(row=>row.id===choice.id).value,null,name+' UI choice remains cleared');
    sourceChoiceControls.push({name,selectedReimport:'PASS',clearedReimport:'PASS',exactProjectionAndProvenance:'PASS'});
  }

  // Synthetic helper inputs isolate continuity requirements independently of
  // book arithmetic. The real six factories above establish full validation.
  const previous={schema:'roster-v2/roster',bookId:'test-book',rosterId:'source-A',
    units:[{instanceId:'physical-A',canonicalUnitId:'same-datasheet',modelRows:[{quantity:2,weapon:'weapon-A'}]},
      {instanceId:'physical-B',canonicalUnitId:'same-datasheet',modelRows:[{quantity:1,weapon:'weapon-B'}]}],
    detachments:[{instanceId:'det',canonicalDetachmentId:'detachment-A'}],
    attachments:[{leaderInstanceId:'physical-A',bodyguardInstanceId:'physical-B',role:'LEADER'}]};
  const candidate=copy(previous);candidate.attachments=[];
  const changed=[
    ['reordered-equal-datasheets',s=>{[s.units[0].modelRows,s.units[1].modelRows]=[s.units[1].modelRows,s.units[0].modelRows];}],
    ['removed-unit',s=>s.units.pop()],
    ['model-count',s=>s.units[0].modelRows[0].quantity++],
    ['loadout',s=>s.units[0].modelRows[0].weapon='weapon-C'],
    ['detachment',s=>s.detachments[0].canonicalDetachmentId='detachment-B'],
    ['input-namespace',s=>s.rosterId='source-B'],
    ['book-namespace',s=>s.bookId='other-book']
  ];
  function helperContract(implementation){
    let committed=null,calls=0;
    const load=state=>{calls++;committed=copy(state);return committed;};
    const result=implementation({status:'READY',roster:copy(candidate)},copy(previous),load);
    assert.equal(result.status,'READY');assert.equal(calls,1,'full load must validate candidate before success');
    assert.deepEqual(committed,previous,'CURRENT attachments preserved');
    assert.deepEqual(previous.attachments,[{leaderInstanceId:'physical-A',bodyguardInstanceId:'physical-B',role:'LEADER'}],'helper must not mutate CURRENT state');
    const empty=copy(previous);empty.attachments=[];calls=0;
    implementation({status:'READY',roster:copy(candidate)},empty,load);
    assert.deepEqual(committed.attachments,[],'empty CURRENT list is authoritative');
    for(const [id,mutate]of changed){
      const altered=copy(candidate);mutate(altered);calls=0;committed=null;
      const result=implementation({status:'READY',roster:altered},copy(previous),load);
      assert.equal(result.status,'REPLACEMENT_REQUIRED',id);assert.equal(result.roster,null,id);
      assert.equal(calls,0,id+' pending candidate cannot be committed');
      const accepted=implementation({status:'READY',roster:altered},copy(previous),load,{replaceExisting:true});
      assert.equal(accepted.status,'READY',id);assert.deepEqual(committed.attachments,[],id+' no links after explicit replacement');
    }
    calls=0;const unresolved={status:'NEEDS_BINDINGS',roster:null};
    assert.deepEqual(implementation(unresolved,copy(previous),load),unresolved);assert.equal(calls,0);
    assert.throws(()=>implementation({status:'READY',roster:copy(candidate)},copy(previous),()=>{throw new TypeError('Graph rejected');}),/Graph rejected/);
  }
  helperContract(commitRosterImport);
  assert.throws(()=>commitRosterImport({status:'READY',roster:copy(previous)},null,()=>assert.fail('Must reject imported attachments')),/fresh imported candidate/);
  assert.throws(()=>commitRosterImport({status:'READY',roster:copy(candidate)},previous,()=>assert.fail('Must reject malformed confirmation'),{replaceExisting:'true'}),/replacement confirmation/);
  const initial=commitRosterImport({status:'READY',roster:copy(candidate)},null,state=>copy(state));
  assert.equal(initial.status,'READY');assert.deepEqual(initial.roster,candidate,'first import needs no replacement confirmation');
  const mutations=[
    ['drop-current-attachments',(result,prior,load,options)=>commitRosterImport(result,{...prior,attachments:[]},load,options)],
    ['weak-instance-only-identity',(result,prior,load,options)=>commitRosterImport({...result,roster:{...copy(prior),attachments:[]}},prior,load,options)],
    ['forced-replacement',(result,prior,load)=>commitRosterImport(result,prior,load,{replaceExisting:true})],
    ['resurrect-empty-list',(result,prior,load,options)=>commitRosterImport(result,prior.attachments.length?prior:{...prior,attachments:copy(previous.attachments)},load,options)],
    ['skip-full-graph-load',(result,prior,load,options)=>commitRosterImport(result,prior,state=>state,options)]
  ];
  for(const [id,implementation]of mutations)assert.throws(()=>helperContract(implementation),undefined,'Mutation must fail: '+id);
  return {status:'PASS',books:6,results,sourceChoiceControls,parsedPhysicalChangeControls:physicalChanges.map(([id])=>({id,status:'PASS'})),changedInputControls:changed.map(([id])=>id),mutationControls:mutations.map(([id])=>({id,status:'DETECTED'})),realNewRecruitExportTested:false};
}
export const reimportAttachmentGuardResult=runReimportAttachmentGuard();
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(reimportAttachmentGuardResult,null,2));
