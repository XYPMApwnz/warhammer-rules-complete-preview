import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync(file,'utf8');
const load=(file,key)=>{const scope={window:{}};vm.runInNewContext(read(file),scope,{filename:file});return JSON.parse(JSON.stringify(scope.window[key]));};
const one=(items,label)=>{assert.equal(items.length,1,`${label}: expected exactly one record`);return items[0];};
const normalized=value=>String(value).replace(/[‘’]/g,"'").replace(/[▪•■]/g,'').replace(/\s+/g,' ').trim();
const oathId='space-marines-army-rule-oath-of-moment';
const oathAbilityId='space-marines-ability-oath-of-moment';
const auditedIds=['unit-eradicator-squad-with-heavy-bolters','unit-wardens-of-ultramar'];

const manifest=JSON.parse(read('books/space-marines/sources/source-manifest.json'));
const source=manifest.layers.find(item=>item.id==='faction-pack-v1.2');
assert.equal(source.version,'1.2');
assert.equal(source.legalFrom,'2026-08-26');
assert.equal(source.sha256,'F1F96C0A3DDA8DFC2D5686B4AA60E7959697651EDBC51F5A344439FF6AC1A1F9');

const pack=JSON.parse(read('books/space-marines/content/space-marines-faction-pack.en.json'));
const oathUpdate=one(pack.updates.filter(item=>item.id==='oath-of-moment'),'official Oath update');
assert.deepEqual(oathUpdate.sourcePages,[60]);
assert.match(oathUpdate.change,/Munitorum Field Manual sections/);
const extractionConfig=JSON.parse(read('books/space-marines/sources/bsdata-extract.config.json'));
for(const title of ['Eradicator Squad with Heavy Bolters','Wardens of Ultramar']){
  assert.equal(one(extractionConfig.unitCorrections[title].addAbilities,`${title} producer correction`).text,oathUpdate.change);
}
assert.equal(extractionConfig.unitCorrections['Land Speeder'].weaponAbilities['Heavy Flamer'],'Torrent');
assert.match(pack.pages['30'].text,/ERADICATOR SQUAD[\s\S]*WITH HEAVY BOLTERS[\s\S]*FACTION: Oath of Moment/);
assert.match(pack.pages['42'].text,/WARDENS OF ULTRAMAR[\s\S]*FACTION: Oath of Moment/);
assert.match(pack.pages['31'].text,/Heavy flamer \[TORRENT\] 12" D6 N\/A 5 -1 1/);
assert.doesNotMatch(pack.pages['31'].text,/Heavy flamer \[[^\]]*IGNORES COVER/);
assert.match(pack.pages['3'].text,/RAPTORIAL COGITATOR CORE UPGRADE[\s\S]*ranged attacks have \[IGNORES COVER\]/);

const canonical=JSON.parse(read('books/space-marines/content/space-marines-codex-datasheets.en.json'));
const byId=new Map(canonical.datasheets.map(unit=>[unit.id,unit]));
for(const id of auditedIds){
  const ability=one(byId.get(id).abilities.filter(item=>item.title==='Oath of Moment'),`${id} Oath membership`);
  assert.equal(ability.text,oathUpdate.change);
}
const landSpeeder=byId.get('unit-land-speeder');
const heavyFlamer=one(landSpeeder.weapons.filter(item=>item.name==='Heavy Flamer'),'Land Speeder Heavy Flamer');
assert.deepEqual(heavyFlamer,{name:'Heavy Flamer',mode:'ranged',range:'12"',a:'D6',skill:'N/A',s:'5',ap:'-1',d:'1',abilities:'Torrent'});
assert.deepEqual(landSpeeder.weapons.filter(item=>item.name!=='Heavy Flamer'),[
  {name:'Stormfury Missile Launcher',mode:'ranged',range:'48"',a:'1',skill:'3+',s:'12',ap:'-3',d:'D6+1',abilities:''},
  {name:'Onslaught gatling cannon',mode:'ranged',range:'24"',a:'8',skill:'3+',s:'5',ap:'0',d:'1',abilities:'Devastating Wounds'},
  {name:'Multi-melta',mode:'ranged',range:'18"',a:'2',skill:'3+',s:'9',ap:'-4',d:'D6',abilities:'Melta 2'},
  {name:'Close combat weapon',mode:'melee',range:'Melee',a:'4',skill:'3+',s:'4',ap:'0',d:'1',abilities:''}
]);

const intercessor=byId.get('unit-intercessor-squad');
const intercessorOath=one(intercessor.abilities.filter(item=>item.title==='Oath of Moment'),'unrelated Intercessor Oath');
assert.equal(intercessorOath.text,oathUpdate.change);

console.log('W2-25 Space Marine facts QA passed');
