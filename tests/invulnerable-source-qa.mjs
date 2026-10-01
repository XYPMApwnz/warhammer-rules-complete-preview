import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../books/shared/tools/build-army-book.mjs';
import {parseArmyBookTargetCatalog} from '../books/shared/tools/build-army-book-targets.mjs';
import {canonicalStatProfilesForUnit} from '../books/shared/tools/canonical-unit-stats.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines'];
const key=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const inv=stats=>String(stats?.Invulnerable||stats?.Inv||stats?.INSV||stats?.INV||'');
const save=stats=>String(stats?.Sv||stats?.SV||'');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fixtures=books.map(book=>{
  const directories=fs.readdirSync(path.join(root,'books',book,'sources')).filter(name=>name.startsWith('waha-11e-current-'));
  assert.equal(directories.length,1,`${book}: ambiguous pinned current corpus`);
  return {book,directory:path.join(root,'books',book,'sources',directories[0]),html:parseArmyBookTargetCatalog(read(`books/${book}/scripts/target-data.js`)).html};
});

// Independent raw-DOM oracle: deliberately does not import the repaired extractor
// or accepted-invulnerable-projection. DG's accepted transcript is the available
// pinned evidence because its manifest-listed raw pages are not shipped locally.
const pythonSource=String.raw`
import sys,json,re,hashlib
from pathlib import Path
from lxml import html
def norm(value):return ' '.join(value.split())
def ident(value):return re.sub('[^a-z0-9]+','',value.lower())
def cls(name):return 'contains(concat(" ",normalize-space(@class)," ")," '+name+' ")'
output=[]
for fixture in json.load(sys.stdin):
 directory=Path(fixture['directory']);corpus=json.loads((directory/'corpus.json').read_text(encoding='utf-8-sig'));records=[]
 for unit in corpus['datasheets']:
  page=next(p for p in corpus['pages'] if p['url']==unit['url']);source=directory/page['file'];profiles=[]
  if source.exists():
   assert hashlib.sha256(source.read_bytes()).hexdigest().upper()==page['sha256'].upper(),str(source)+': pinned raw hash'
   tree=html.fromstring(source.read_bytes());frames=tree.xpath('//div['+cls('dsOuterFrame')+' and '+cls('datasheet')+']');assert len(frames)==1
   frame=frames[0];bases=frame.xpath('.//*['+cls('dsProfileBaseWrap')+']')
   for base in bases:
    names=base.xpath('./*['+cls('dsProfileWrapRight')+']');name=re.sub(r'\s*\([^)]*\)\s*$','',norm(names[0].text_content())) if names else unit['title']
    values=base.xpath('.//*['+cls('dsCharValue')+']');stats=dict(zip(['M','T','SV','W','LD','OC'],[norm(x.text_content()) for x in values]))
    # Read raw panels in this profile's own group; global panels apply to all
    # profiles unless the source explicitly restricts the eligible model.
    own=base.xpath('.//*['+cls('dsInvulWrap')+']');container=base if own else base.getparent();panels=own or container.xpath('./*['+cls('dsInvulWrap')+']')
    if panels:
     saves=[norm(x.text_content()) for panel in panels for x in panel.xpath('.//*['+cls('dsCharInvulValue')+']')];assert len(set(saves))==1 and re.fullmatch(r'\d\+',saves[0])
     comments=container.xpath('./*['+cls('dsInvulComment')+']');eligible=True
     if comments:
      assert len(comments)==1;match=re.fullmatch(r'\*?\s*(.+?)\s+model only\.?',norm(comments[0].text_content()),flags=re.I);assert match
      eligible=ident(match[1])==ident(name)
     if eligible:stats['INSV']=saves[0]
    profiles.append({'name':name or unit['title'],'stats':stats})
  else:
   assert fixture['book']=='death-guard','missing raw source '+str(source)
   profiles=unit.get('profiles') or [{'name':unit['title'],'stats':unit['statline']}]
  records.append({'sourceId':unit['sourceId'],'title':unit['title'],'profiles':profiles})
 reader=html.fromstring('<div>'+fixture['html']+'</div>');cards={}
 for card in reader.xpath('.//*['+cls('unit-card')+']'):
  rendered=[]
  for line in card.xpath('.//*['+cls('statline')+']'):
   parent=line.getparent();labels=parent.xpath('./h5');name=norm(labels[0].text_content()) if labels else parent.get('data-profile','');stats={}
   for stat in line.xpath('./*['+cls('stat')+']'):
    label=stat.xpath('./b');value=stat.xpath('./span')
    if label and value:stats[norm(label[0].text_content())]=norm(value[0].text_content())
   rendered.append({'name':name,'stats':stats})
  cards[card.get('id')]=rendered
 output.append({'book':fixture['book'],'records':records,'cards':cards})
json.dump(output,sys.stdout,ensure_ascii=False)
`;
const bundledPython=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
const python=process.env.PYTHON||(fs.existsSync(bundledPython)?bundledPython:'python');
const oracle=spawnSync(python,['-B','-c',pythonSource],{input:JSON.stringify(fixtures),encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,PYTHONIOENCODING:'utf-8',PYTHONDONTWRITEBYTECODE:'1'}});
assert.equal(oracle.status,0,oracle.stderr);
const evidence=JSON.parse(oracle.stdout);
const runtime={window:{}};
vm.runInNewContext(read('books/shared/roster-context.js'),runtime);
const api=runtime.window.WHArmyRosterContext;
let sourceRecords=0,sourceProfiles=0,checked=0,negative=0,multipart=0,duplicates=0;
const perBook={};
for(const bookEvidence of evidence){
  const book=bookEvidence.book,context=createCanonicalBuildContext({args:['--check'],configPath:path.join(root,'books',book,'book.config.json'),repo:root});
  const {effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
  const published={window:{}};vm.runInNewContext(read(`books/${book}/scripts/roster-data.js`),published);
  const catalog=published.window.WH_BOOK_ROSTER_CATALOG;
  assert.ok(catalog,`${book}: current roster publication`);
  perBook[book]={records:0,sourceProfiles:0,profilesChecked:0};
  for(const source of bookEvidence.records){
    const candidates=model.units.filter(unit=>unit.id===source.sourceId.replace(/^datasheet-/,'unit-')||key(unit.title)===key(source.title));
    assert.equal(candidates.length,1,`${book}/${source.sourceId}: source identity binding`);
    const unit=candidates[0],catalogUnit=catalog.units.find(item=>item.id===unit.id);
    assert.ok(catalogUnit,`${book}/${unit.id}: roster identity`);
    const expectedPositive=source.profiles.filter(profile=>inv(profile.stats));
    if(expectedPositive.length){sourceRecords++;sourceProfiles+=expectedPositive.length;perBook[book].records++;perBook[book].sourceProfiles+=expectedPositive.length;}
    const canonicalProfiles=unit.profiles?.length?unit.profiles:(unit.blocks||[]).filter(block=>block.type==='statline').map(block=>({name:unit.title,stats:block.values}));
    if(!canonicalProfiles.length&&unit.stats)canonicalProfiles.push({name:unit.title,stats:unit.stats});
    assert.ok(canonicalProfiles.length,`${book}/${unit.id}: canonical profiles`);
    const normalizedProfiles=canonicalStatProfilesForUnit(unit,{preserveMultipartProfiles:true});
    const globalSave=source.profiles.every(profile=>inv(profile.stats)===inv(source.profiles[0].stats))?inv(source.profiles[0].stats):null;
    const readerProfiles=bookEvidence.cards[unit.id];assert.ok(readerProfiles?.length,`${book}/${unit.id}: reader profiles`);
    assert.equal(readerProfiles.length,canonicalProfiles.length,`${book}/${unit.id}: reader profile identity/count`);
    const imported={id:`invuln-${book}-${unit.id}`,faction:catalog.book.title,detachments:[],enhancements:[],units:[{id:'physical-a',canonicalUnitId:unit.id,quantity:1},{id:'physical-b',canonicalUnitId:unit.id,quantity:1}]};
    const game=api.project({catalog,roster:imported,record:{id:imported.id,roster:imported}}).game.units;
    assert.equal(game.length,2,`${book}/${unit.id}: physical duplicate isolation`);
    assert.deepEqual(JSON.parse(JSON.stringify(game[0].effective.stats)),JSON.parse(JSON.stringify(game[1].effective.stats)),`${book}/${unit.id}: duplicate base stats`);
    assert.notEqual(game[0].identity.instanceId,game[1].identity.instanceId);duplicates++;
    if(canonicalProfiles.length>1)multipart++;
    for(const [index,profile] of canonicalProfiles.entries()){
      const sourceProfile=source.profiles.find(item=>key(item.name)===key(profile.name))||(source.profiles.length===1?source.profiles[0]:null);
      const expected=globalSave!==null?globalSave:inv(sourceProfile?.stats);
      if(globalSave===null)assert.ok(sourceProfile,`${book}/${unit.id}/${profile.name}: scoped source profile`);
      assert.equal(inv(profile.stats)||unit.invulnerable||'',expected,`${book}/${unit.id}/${profile.name}: canonical/effective Invulnerable Save`);
      const normalizedProfile=normalizedProfiles.find(item=>key(item.title)===key(profile.name));
      if(normalizedProfiles.length){assert.ok(normalizedProfile,`${book}/${unit.id}/${profile.name}: normalized profile identity`);assert.equal(inv(normalizedProfile.stats),expected,`${book}/${unit.id}/${profile.name}: normalized global/scoped Invulnerable Save`);}
      if(profile.invulnerableSource){
        assert.equal(profile.invulnerableSource.sourceId,source.sourceId,`${unit.id}: defensive source owner`);
        const corpus=JSON.parse(read(`books/${book}/sources/${path.basename(fixtures.find(item=>item.book===book).directory)}/corpus.json`));
        assert.equal(profile.invulnerableSource.captureDate,corpus.captureDate,`${unit.id}: accepted capture provenance`);
        const accepted=corpus.datasheets.find(item=>item.sourceId===source.sourceId);
        assert.deepEqual(profile.invulnerableSource.profileSourceIds,accepted.profiles.filter(item=>inv(item.stats)===expected).map(item=>item.sourceId),`${unit.id}: accepted profile provenance`);
      }
      if(sourceProfile)assert.equal(save(profile.stats),save(sourceProfile.stats),`${book}/${unit.id}/${profile.name}: ordinary armour save unchanged`);
      assert.equal(inv(readerProfiles[index].stats),expected,`${book}/${unit.id}/${profile.name}: player-visible Invulnerable Save`);
      assert.equal(save(readerProfiles[index].stats),save(profile.stats),`${book}/${unit.id}/${profile.name}: visible armour save`);
      const rosterProfiles=catalogUnit.gameSelections?.statProfiles||[];
      const rosterProfile=rosterProfiles.find(item=>key(item.title)===key(profile.name));
      if(rosterProfiles.length){assert.ok(rosterProfile,`${book}/${unit.id}/${profile.name}: roster profile identity`);assert.equal(inv(rosterProfile.stats),expected,`${book}/${unit.id}/${profile.name}: roster profile Invulnerable Save`);}
      else assert.equal(inv(catalogUnit.gameSelections.stats),expected,`${book}/${unit.id}: roster base Invulnerable Save`);
      for(const instance of game){
        const effectiveProfiles=instance.effective.statProfiles||[];
        const effectiveProfile=effectiveProfiles.find(item=>key(item.title||item.name)===key(profile.name));
        if(effectiveProfiles.length){assert.ok(effectiveProfile,`${book}/${unit.id}/${profile.name}: imported effective profile identity`);assert.equal(inv(effectiveProfile.stats),expected,`${book}/${unit.id}/${profile.name}: imported effective Invulnerable Save`);}
        else assert.equal(inv(instance.effective.stats),expected,`${book}/${unit.id}: imported effective base Invulnerable Save`);
      }
      if(expected){checked++;perBook[book].profilesChecked++;}else negative++;
    }
  }
}
console.log(JSON.stringify({INVULN_SOURCE_RECORDS:sourceRecords,INVULN_SOURCE_PROFILES:sourceProfiles,INVULN_PROFILES_CHECKED:checked,CORRECT:checked,INCORRECT:0,UNRESOLVED:0,negativeProfiles:negative,multipartUnits:multipart,duplicateUnits:duplicates,perBook},null,2));
