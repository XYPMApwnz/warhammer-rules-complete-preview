/** Native New Recruit vocabulary and physical import regressions. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createExportFactionCheck} from '../books/shared/roster-v2/export-faction.mjs';
import {singletonEquipmentGameSignature} from '../tests/helpers/new-recruit-observation.mjs';
import {sourceDeclarationView} from '../books/shared/source-refs-v2/source-refs.mjs';
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-export.json',import.meta.url),'utf8'));
const selected=process.argv.find(arg=>arg.startsWith('--book='))?.slice('--book='.length);
assert(!selected||fixtures.factions.some(row=>row.bookId===selected),'Unknown book');
const read=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))});
globalThis.fetch=read;
const checks=[];
const gameHash=view=>createHash('sha256').update(JSON.stringify(singletonEquipmentGameSignature(view))).digest('hex');
const stats=view=>view.profiles[0].fields.find(field=>field.label==='stats').value;
function breakOneSourceReference(value){
  if(!value||typeof value!=='object')return false;
  const ref=value.sourceRefs?.[0];
  if(ref&&(ref.ref||ref.referenceId)){
    const isLookup=Boolean(ref.ref);ref[isLookup?'ref':'referenceId']='refs-0000000000000000';
    return isLookup?'Missing source refs entry: refs-0000000000000000':'Source reference content changed';
  }
  for(const child of Object.values(value)){const failure=breakOneSourceReference(child);if(failure)return failure;}
  return false;
}
for(const c of fixtures.factions.filter(row=>!selected||row.bookId===selected)){
  console.log('New Recruit checks: '+c.bookId);
  const entry=c.bookId==='adeptus-mechanicus'?'roster-runtime':'roster-boot';
  const {createBrowserRoster}=await import(`../books/${c.bookId}/v2/${entry}.mjs`);
  const runtime=await createBrowserRoster({fetch:read});
  let sourceNegativeChecked=false;
  if(c.catalogueEvidence.document){
    const captured=JSON.parse(fs.readFileSync(new URL('../'+c.catalogueEvidence.document,import.meta.url),'utf8'));
    const observed=c.catalogueEvidence.path.slice(1).split('/').reduce((value,key)=>value[key],captured);
    assert.equal(c.catalogue,observed,'Independent captured catalogue identity');
  }else assert.equal(c.catalogueEvidence.authority,'OWNER_PROVIDED_TASK');
  const variants=[...new Set([c.shortLabel,c.catalogue,c.catalogue.replaceAll("'",'’'),...c.legacyLabels,'—','', '///'])];
  for(const faction of variants){
    const text=c.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,'+ FACTION KEYWORD: '+faction);
    const result=runtime.import(text,c.bindings,{replaceExisting:true});
    const accepted=faction!=='///'||c.normalizedEmptyAccepted;
    assert.equal(result.status,accepted?'READY':'INVALID',c.bookId+': '+faction+' '+JSON.stringify(result.errors||result.needsBindings));
    assert.equal(result.errors?.some(error=>error.code==='FOREIGN_FACTION_EXPORT')||false,!accepted);
    checks.push({book:c.bookId,faction,status:'PASS',result:result.status});
  }
  const before=JSON.stringify(runtime.state);
  const result=runtime.import(c.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,'+ FACTION KEYWORD: A Different Army'),c.bindings,{replaceExisting:true});
  assert.equal(result.status,c.factionGate?'INVALID':'READY',c.bookId+': foreign header');
  assert.equal(result.errors?.some(error=>error.code==='FOREIGN_FACTION_EXPORT')||false,c.factionGate);
  if(c.factionGate)assert.equal(JSON.stringify(runtime.state),before,'A foreign export cannot replace the active roster');
  checks.push({book:c.bookId,faction:'A Different Army',status:'PASS',result:result.status});
  const otherFaction=c.bookId==='tau-empire'?'Xenos - Tyranids':"Xenos - T'au Empire";
  const other=runtime.import(c.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,'+ FACTION KEYWORD: '+otherFaction),c.bindings,{replaceExisting:true});
  assert.equal(other.status,c.factionGate?'INVALID':'READY','Another real captured catalogue cannot impersonate this book');
  assert.equal(other.errors?.some(error=>error.code==='FOREIGN_FACTION_EXPORT')||false,c.factionGate);
  checks.push({book:c.bookId,faction:otherFaction,status:'PASS',result:other.status});
  for(const gear of fixtures.compactEquipment.filter(row=>row.bookId===c.bookId)){
    for(const [format,text]of [['compact',gear.compactText],['row',gear.rowText],['loadout',gear.loadoutText],['absent',gear.absentText]]){
      const imported=runtime.import(text,{}, {replaceExisting:true});
      assert.equal(imported.status,'READY',gear.unit+'/'+gear.equipment+'/'+format+': '+JSON.stringify(imported.errors||imported.needsBindings));
      const view=runtime.effective('parsed-unit-1');
      assert.equal(gameHash(view),format==='absent'?gear.expectedAbsentGameSha256:gear.expectedGameSha256,gear.unit+'/'+gear.equipment+'/'+format+': source-backed gameplay control');
      for(const [field,value]of Object.entries((format==='absent'?gear.independentAbsentStats:gear.independentStats)||{}))assert.equal(stats(view)[field],value,'Independent literal '+field);
      const snapshot=runtime.snapshot(),prior=sourceDeclarationView(runtime.projection);runtime.load(snapshot);
      assert.deepEqual(sourceDeclarationView(runtime.projection),prior,'Reload preserves every source value and gameplay field across the existing source codec');
      assert.equal(runtime.import(text,{}, {replaceExisting:true}).status,'READY');
      assert.deepEqual(sourceDeclarationView(runtime.projection),prior,'Identical reimport preserves every source value and the same single effect');
      if(!sourceNegativeChecked){
        const broken=structuredClone(runtime.projection);
        const expectedFailure=breakOneSourceReference(broken);
        if(expectedFailure){
          assert.throws(()=>sourceDeclarationView(broken),error=>error.message===expectedFailure,'The reload source oracle must reject the precise corrupted reference form');
          sourceNegativeChecked=true;checks.push({book:c.bookId,control:'broken source reference',status:'PASS'});
        }
      }
      checks.push({book:c.bookId,unit:gear.unit,equipment:gear.equipment,format,status:'PASS'});
    }
  }
  if(['space-marines','dark-angels','blood-angels'].includes(c.bookId)&&fixtures.realCompactCaptain){
    const text=fixtures.realCompactCaptain.text.replace('Imperium - Adeptus Astartes - Space Marines',c.shortLabel);
    for(const equipped of [true,false]){
      const imported=runtime.import(equipped?text:text.replace(', Relic shield',''),{}, {replaceExisting:true});
      assert.equal(imported.status,'READY');
      assert.equal(stats(runtime.effective('parsed-unit-1')).W,equipped?'6':'5','Actual compact Captain line retains its MODEL-owned shield');
      checks.push({book:c.bookId,unit:'Captain',format:'owner-provided compact line',equipped,status:'PASS'});
    }
  }
  for(const multi of (fixtures.multiModel||[]).filter(row=>row.bookId===c.bookId)){
    assert.equal(runtime.import(multi.text,{}, {replaceExisting:true}).status,'READY');
    const unit=runtime.state.units[0];assert.equal(unit.startingStrength,10);
    assert.equal(unit.selections.length,1,'Pooled equipment remains UNIT-owned');
    const all=sourceDeclarationView({state:runtime.snapshot(),projection:runtime.projection});
    assert.equal(createHash('sha256').update(JSON.stringify(all)).digest('hex'),multi.expectedFullStateAndProjectionSha256,
      'Multi-MODEL state, effects, conditions, scopes and sources match the unmodified baseline');
    checks.push({book:c.bookId,control:'UNIT equipment on ten MODELs',header:multi.header,status:'PASS'});
  }
}
const strict=createExportFactionCheck({factionIdentityLabels:['T’au Empire',"Xenos - T'au Empire"]});
assert(strict('Xenos - T’au Empire'));assert(!strict('Not T’au Empire'));assert(!strict('///'));
assert.throws(()=>createExportFactionCheck({factionIdentityLabels:[]}),/vocabulary/);
assert.throws(()=>createExportFactionCheck({factionIdentityLabels:['T’au Empire'],allowNormalizedEmptyFaction:'yes'}),/vocabulary/);
console.log(JSON.stringify({status:'PASS',checks:checks.length,results:checks}));
