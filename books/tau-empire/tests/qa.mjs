import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {assertOwnedMobileRouteInventory} from '../../../tests/helpers/mobile-route-inventory.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(root,'../..');
const json=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const pack=json('content/tau-empire-faction-pack.en.json');
const codex=json('content/tau-empire-codex-datasheets.en.json');
const parity=json('content/tau-empire-codex-parity.en.json');
const wargear=json('content/tau-empire-codex-wargear.en.json');
const points=json('content/tau-empire-points.en.json');
const mfm=json('sources/official-mfm-v1.4.json');
const relatedRules=json('content/tau-empire-related-rules.en.json');
const manifest=json('sources/source-manifest.json');
const config=json('book.config.json');
const context=JSON.parse(fs.readFileSync(path.join(repo,'glossary','contexts','tau-empire.json'),'utf8')).terms;
const glossary=JSON.parse(fs.readFileSync(path.join(repo,'glossary','registry.en.json'),'utf8')).terms;
const readerShell=fs.readFileSync(path.join(root,'reader.html'),'utf8'),targetScope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'scripts','target-data.js'),'utf8'),targetScope);
const reader=readerShell+targetScope.window.WH_ARMY_BOOK_TARGETS.html;
const serviceWorker=fs.readFileSync(path.join(repo,'service-worker.js'),'utf8');
const codexParitySource=manifest.layers.find(layer=>layer.id==='codex-parity');
const rosterFilterUrl=reader.match(/\.\/scripts\/roster-filter\.js\?v=\d+/)?.[0];
assert.equal(rosterFilterUrl,`./scripts/roster-filter.js?v=${config.assetVersions.rosterFilter}`);
assert.ok(serviceWorker.includes(`./books/tau-empire/${rosterFilterUrl.slice(2)}`));
assert.equal(codexParitySource?.title,'Wahapedia Warhammer 40,000 11th Edition · T’au Empire');
const mobileStart=fs.readFileSync(path.join(root,'mobile','index.html'),'utf8');
const related=fs.readFileSync(path.join(root,'mobile','related-rules.inc'),'utf8');
const allUnits=[...codex.datasheets,...codex.imperialArmour,...codex.legends];
const mobileRouteFiles=fs.readdirSync(path.join(root,'mobile')).filter(file=>file.endsWith('.html'));
const mobileRoutes=mobileRouteFiles.map(file=>fs.readFileSync(path.join(root,'mobile',file),'utf8'));
const currentUnits=[...codex.datasheets,...codex.imperialArmour].filter(unit=>unit.status==='Current');
const key=value=>String(value).replace(/\s*\([^)]*\)\s*$/,'').trim().toLowerCase();
const decode=value=>value.replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>');
const lines=value=>decode(value).split(/\r?\n/).map(line=>line.replace(/\s+/g,' ').trim()).filter(Boolean);
const unitMarkup=(html,id)=>{const opener=new RegExp(`<article class="unit-card[^"]*" id="${id}"`).exec(html);assert.ok(opener,`${id}: card missing`);const start=opener.index,next=html.indexOf('<article class="unit-card',start+1);return html.slice(start,next<0?html.length:next);};
const sectionMarkup=(html,id)=>{const match=new RegExp(`<section class="unit-part" id="${id}">([\\s\\S]*?)<\\/section>`).exec(html);assert.ok(match,`${id}: section missing`);return match[1];};
const weaponBase=value=>{const normalized=String(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+(?:d\d+|\d+)$/,'').trim();return normalized.startsWith('anti ')?'anti':normalized;};
const coreWeaponTerms=new Map(Object.entries(glossary).filter(([id])=>id.startsWith('core-')).map(([id,term])=>[weaponBase(String(term.title?.en||'').replace(/^\[|\]$/g,'')),id]));
const localWeaponTerms=new Map(Object.entries(context).map(([id,entry])=>[weaponBase(glossary[entry.termId]?.title?.en||''),id]).filter(([base])=>base));
const expectedWeaponTerm=label=>coreWeaponTerms.get(weaponBase(label))||localWeaponTerms.get(weaponBase(label))||'';
const splitWeaponAbilities=value=>String(value||'').split(',').map(label=>label.trim().toUpperCase()).filter(Boolean);
const canonicalWeaponRows=allUnits.flatMap(unit=>unit.weapons.filter(weapon=>weapon.abilities).map(weapon=>splitWeaponAbilities(weapon.abilities)));
const extractWeaponRows=markup=>[...markup.matchAll(/<div class="weapon-tags">([\s\S]*?)<\/div>/g)].map(([,body])=>[...body.matchAll(/<(button|span)\b([^>]*)>([^<]+)<\/\1>/g)].filter(([, ,attrs])=>/\bclass="[^"]*\btag\b/.test(attrs)).map(([,element,attrs,label])=>({element,label:label.trim(),term:attrs.match(/\bdata-term="([^"]+)"/)?.[1]||''})));
const rowInventory=rows=>rows.map(row=>JSON.stringify(row.map(item=>typeof item==='string'?item:item.label))).sort();
const responsiveWeaponRows=extractWeaponRows(reader),responsiveWeaponTokens=responsiveWeaponRows.flat(),canonicalWeaponLabels=canonicalWeaponRows.flat();
const unknownWeaponLabels=[...new Set(canonicalWeaponLabels.filter(label=>!expectedWeaponTerm(label)))].sort();

assert.deepEqual([allUnits.length,canonicalWeaponRows.length,canonicalWeaponLabels.length],[43,144,213]);
assert.deepEqual(rowInventory(responsiveWeaponRows),rowInventory(canonicalWeaponRows),'responsive reader weapon token inventory/order differs');
for(const token of responsiveWeaponTokens){const expected=expectedWeaponTerm(token.label);assert.equal(token.element,expected?'button':'span',`${token.label}: wrong token kind`);assert.equal(token.term,expected,`${token.label}: wrong glossary target`);}
assert.deepEqual(unknownWeaponLabels,[]);
assert.doesNotMatch(reader,/<button class="weapon-button"[^>]*>[^<]*<\/button><small>/i);
assert.doesNotMatch(reader,/<(?:button|span)[^>]*class="[^"]*\btag\b[^"]*"[^>]*>[^<]*<button/i);
assertOwnedMobileRouteInventory({root:repo,bookId:'tau-empire'});
for(const output of mobileRoutes){assert.match(output,/data-canonical-reader="\.\.\/reader\.html"/);assert.match(output,/mobile-route-redirect\.js\?v=2/);assert.doesNotMatch(output,/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/);}
assert.match(reader,/shared\/styles\/content\.css\?v=\d+/);assert.match(reader,/shared\/styles\/popups\.css\?v=\d+/);assert.match(reader,/shared\/datasheet-system\.css\?v=\d+/);
const sourceWargearAbilities=allUnits.flatMap(unit=>(unit.wargearAbilities||[]).map(ability=>({unit,ability})));
assert.deepEqual([sourceWargearAbilities.length,new Set(sourceWargearAbilities.map(item=>item.ability.title)).size,new Set(sourceWargearAbilities.map(item=>item.unit.id)).size],[54,18,19]);
const stealthBattlesuits=allUnits.find(unit=>unit.id==='unit-stealth-battlesuits');
assert.deepEqual(stealthBattlesuits.weapons.map(weapon=>weapon.name),['Battlesuit fists','Burst cannon','Fusion blaster','Twin pulse carbine','Pulse pistol']);
assert.deepEqual(stealthBattlesuits.wargearAbilities.map(ability=>ability.title),['Homing Beacon','Marker Drone']);
const stealthWargear=wargear.units.find(unit=>unit.title==='Stealth Battlesuits');
assert.deepEqual(stealthWargear.wargear,[
  'The Stealth Shas’vre can be equipped with 1 gun drone.',
  'The Stealth Shas’vre can be equipped with 1 marker drone.',
  'The Stealth Shas’vre can be equipped with 1 pulse pistol.',
  '1 Stealth Shas’ui can be equipped with 1 homing beacon.',
  '2 models can each have their burst cannon replaced with 1 fusion blaster.'
]);
const rosterScope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'scripts','roster-data.js'),'utf8'),rosterScope);
vm.runInNewContext(fs.readFileSync(path.join(repo,'books','shared','roster-context.js'),'utf8'),rosterScope);
const stealthCatalog=rosterScope.window.WH_BOOK_ROSTER_CATALOG.units.find(unit=>unit.id==='unit-stealth-battlesuits');
const stealthSelections=stealthCatalog.gameSelections.selections,selection=title=>stealthSelections.find(item=>item.title===title);
for(const title of ['Burst cannon','Fusion blaster','Pulse pistol','Gun Drone','Marker Drone','Homing Beacon'])assert.ok(selection(title),`Stealth Battlesuits missing selectable ${title}`);
for(const title of ['Missile pod','Shield Drone','Guardian Drone'])assert.equal(selection(title),undefined,`Stealth Battlesuits exposes forbidden ${title}`);
const fusionSelection=selection('Fusion blaster'),gunDroneSelection=selection('Gun Drone'),twinPulseCarbine=stealthCatalog.gameSelections.weaponProfiles.find(profile=>profile.title==='Twin pulse carbine');
assert.equal(fusionSelection.maxTotalQuantity,2,'Stealth Battlesuits Fusion blaster maximum');
assert.deepEqual(Array.from(gunDroneSelection.profileIds),[twinPulseCarbine.id],'Gun Drone must reference its Twin pulse carbine profile');
assert.deepEqual(Array.from(gunDroneSelection.wargearAbilityIds),[],'Gun Drone must not invent an ordinary Wargear Ability');
const projectSelection=(title,quantities)=>{const rows=Array.isArray(quantities)?quantities:[quantities];return rosterScope.window.WHArmyRosterContext.project({catalog:rosterScope.window.WH_BOOK_ROSTER_CATALOG,bookId:'tau-empire',record:{id:`stealth-${title}-${rows.join('-')}`},roster:{faction:"T'au Empire",detachments:[],enhancements:[],warnings:[],units:[{id:'stealth-physical',canonicalUnitId:'unit-stealth-battlesuits',name:'Stealth Battlesuits',points:100,models:rows.map((quantity,index)=>({quantity,name:`Stealth Shas'ui ${index+1}`,loadouts:[{quantity,wargear:title}]}))}]}}).game;};
const legalFusion=projectSelection('Fusion blaster',[1,1]).units[0],illegalFusion=projectSelection('Fusion blaster',[2,1]).units[0],gunDrone=projectSelection('Gun Drone',1).units[0];
assert.ok(legalFusion.selection.loadout.weapons.every(item=>item.state==='resolved'),'two Fusion blasters must remain legal');
assert.ok(illegalFusion.selection.loadout.weapons.every(item=>item.state==='invalid'),'three Fusion blasters must fail the unit-wide maximum');
assert.ok(illegalFusion.selection.loadout.weapons.every(item=>item.reason==='selection-quantity-exceeds-maximum'&&item.selectedTotalQuantity===3));
assert.equal(gunDrone.selection.loadout.wargear[0].state,'resolved','Gun Drone must resolve as selected Wargear');
assert.ok(gunDrone.selection.loadout.selectedProfileIds.includes(twinPulseCarbine.id),'Gun Drone must activate its referenced weapon profile');
const stealthReader=unitMarkup(reader,'unit-stealth-battlesuits');
for(const option of stealthWargear.wargear)assert.ok(stealthReader.includes(option),`Stealth reader missing ${option}`);
for(const title of ['Missile pod','Shield Drone','Guardian Drone'])assert.doesNotMatch(stealthReader,new RegExp(title,'i'),`Stealth reader exposes forbidden ${title}`);
for(const unit of allUnits){
  const abilities=unit.wargearAbilities||[],id=`${unit.id.slice(5)}-wargear-abilities`;
  assert.equal(unit.abilities.some(ability=>abilities.some(wargearAbility=>key(ability.title)===key(wargearAbility.title))),false,`${unit.title}: Wargear Ability duplicated in ordinary Abilities`);
  if(!abilities.length){assert.ok(!unitMarkup(reader,unit.id).includes(`id="${id}"`),`${unit.title}: empty desktop Wargear Abilities section`);continue;}
    const responsive=sectionMarkup(unitMarkup(reader,unit.id),id);
    assert.ok(responsive.includes('These abilities apply only while the corresponding wargear is equipped.'));
    for(const ability of abilities)assert.match(responsive,new RegExp(`<button class="term-button" data-term="[^"]+"[^>]*>${ability.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}<\\/button>`));
}

assert.deepEqual([pack.meta.version,pack.meta.pageCount,pack.meta.sha256],['1.1',61,'32B985646BAA02A3B505FF3404E91D374A5F53C1D3B8000D7166CA94D1B52675']);
assert.equal(pack.meta.legalFrom,'2026-07-22');
assert.equal(manifest.layers.find(layer=>layer.id==='faction-pack-v1.1')?.legalFrom,pack.meta.legalFrom);
assert.deepEqual([pack.detachments.length,pack.detachments.flatMap(item=>item.stratagems).length,pack.updates.length,pack.faqs.length],[3,7,25,2]);
assert.deepEqual([codex.datasheets.length,codex.imperialArmour.length,codex.legends.length],[39,4,0]);
assert.deepEqual([parity.detachments.length,parity.detachments.flatMap(item=>item.stratagems).length],[4,24]);
assert.deepEqual([mfm.version,mfm.counts.currentUnits,mfm.counts.detachments,mfm.counts.enhancements],['v1.4',43,7,23]);
assert.equal(wargear.units.length,39);
assert.equal(points.units.length,39);
assert.deepEqual([
  points.units.filter(unit=>unit.pointsSource?.label==='Official MFM v1.2').length,
  points.units.filter(unit=>unit.pointsSource?.label==='Official MFM v1.3').length
],[0,39]);
assert.equal(Object.keys(relatedRules.stratagems).length,31);
assert.equal(Object.keys(relatedRules.enhancements).length,23);
assert.equal(new Set([...pack.detachments,...parity.detachments].map(item=>key(item.title))).size,7);
assert.equal(new Set(points.enhancements.map(item=>key(item.title))).size,23);
assert.equal(config.coverImage,'assets/tau-empire-cover-800.webp');
assert.ok(fs.existsSync(path.join(root,config.coverImage)));
assert.ok(reader.includes('class="hero section surface faction-hero faction-hero-cover"'));
assert.ok(!reader.includes(`src="./${config.coverImage}"`));
const bookCss=fs.readFileSync(path.join(root,'styles','book.css'),'utf8');
assert.ok(bookCss.includes(`url("../${config.coverImage}") center 23% / cover no-repeat`));
assert.ok(mobileStart.includes('data-canonical-reader="../reader.html"')&&mobileStart.includes('data-canonical-target="start"'));
assert.ok(fs.readFileSync(path.join(repo,'index.html'),'utf8').includes(`src="books/tau-empire/${config.coverImage}"`));
assert.ok(fs.readFileSync(path.join(repo,'service-worker.js'),'utf8').includes(`./books/tau-empire/${config.coverImage}`));

for(const unit of allUnits){
  assert.ok(unit.profiles.length,`${unit.title}: missing profile`);
  assert.ok(unit.keywords.some(keyword=>key(keyword)==="t'au empire"),`${unit.title}: faction keyword missing`);
  assert.match(reader,new RegExp(`id="${unit.id}"`),`${unit.title}: reader anchor missing`);
}
for(const record of wargear.units){
  const unit=allUnits.find(item=>key(item.title)===key(record.title));assert.ok(unit,`${record.title}: Wargear owner missing`);
  const expected=record.wargear.map(lines);
  const desktop=[...unitMarkup(reader,unit.id).matchAll(/<li class="wargear-option">([\s\S]*?)<\/li>/g)].map(match=>lines(match[1]));
  assert.deepEqual(desktop,expected,`${record.title}: desktop Wargear differs`);
}

const byTitle=title=>currentUnits.find(unit=>unit.title===title);
const update=id=>{const matches=pack.updates.filter(item=>item.id===id);assert.equal(matches.length,1,`${id}: official update cardinality`);return matches[0];};
const sameText=(a,b)=>String(a||'').replace(/\s+/g,' ').trim()===String(b||'').replace(/\s+/g,' ').trim();
const coveredUpdates=new Set();
const cover=(id,condition)=>{assert.ok(condition,`${id}: official update is not effective`);coveredUpdates.add(id);};
const ability=(unitTitle,abilityTitle)=>[...(byTitle(unitTitle)?.abilities||[]),...(byTitle(unitTitle)?.wargearAbilities||[])].find(item=>key(item.title)===key(abilityTitle));
const detachment=id=>[...pack.detachments,...parity.detachments].find(item=>item.id===id);
cover('army-for-the-greater-good',sameText(ability('Breacher Team','For The Greater Good')?.text,update('army-for-the-greater-good').change));
for(const [id,detachmentId,kind,title] of [
  ['kauyon-through-unity-devastation','kauyon','enhancements','Through Unity, Devastation'],
  ['montka-coordinated-exploitation','montka','enhancements','Coordinated Exploitation'],
  ['montka-strike-swiftly','montka','enhancements','Strike Swiftly'],
  ['retaliation-puretide-engram-neurochip','retaliation-cadre','enhancements','Puretide Engram Neurochip']
])cover(id,sameText(detachment(detachmentId)[kind].find(item=>key(item.title)===key(title))?.text,update(id).change));
for(const [id,detachmentId] of [['kauyon-patient-hunter','kauyon'],['montka-killing-blow','montka'],['retaliation-bonded-heroes','retaliation-cadre']])cover(id,sameText(detachment(detachmentId).rule.text,update(id).change));
cover('kauyon-photon-grenades',sameText(detachment('kauyon').stratagems.find(item=>item.id==='stratagem-photon-grenades')?.when,update('kauyon-photon-grenades').change));
const shortened=detachment('retaliation-cadre').stratagems.find(item=>item.id==='stratagem-the-shortened-blade')?.effect||'';
cover('retaliation-shortened-blade',shortened.includes('6"')&&!shortened.includes('3"'));
for(const title of ['Devilfish','Hammerhead Gunship','Piranhas','Sky Ray Gunship','Tidewall Droneport','Tidewall Gunrig','Tidewall Shieldline'])cover('datasheets-add-frame',byTitle(title).keywords.includes('Frame'));
for(const [id,unitTitle,abilityTitle] of [
  ['crisis-sunforge-sunforge','Crisis Sunforge Battlesuits','Sunforge'],
  ['firesight-precise-targeting','Firesight Team','Precise Targeting'],
  ['kroot-trail-shaper-ambush','Kroot Trail Shaper','Kroot Ambush'],
  ['kroot-trail-shaper-trail-finding','Kroot Trail Shaper','Trail Finding'],
  ['pathfinder-target-uploaded','Pathfinder Team','Target Uploaded'],
  ['riptide-nova-charge','Riptide Battlesuit','Nova Charge'],
  ['stealth-forward-observers','Stealth Battlesuits','Forward Observers'],
  ['sun-shark-pulse-bombs','Sun Shark Bomber','Pulse Bombs'],
  ['twin-lance-neocapacitor-shields','The Twin Lance','Neocapacitor Shields']
])cover(id,sameText(ability(unitTitle,abilityTitle)?.text,update(id).change));
cover('ethereal-faction-ability',Boolean(ability('Ethereal','For The Greater Good')));
cover('stealth-homing-beacon',/8"/.test(ability('Stealth Battlesuits','Homing Beacon')?.text||'')&&!/9"/.test(ability('Stealth Battlesuits','Homing Beacon')?.text||''));
for(const title of ['Razorshark Strike Fighter','Sun Shark Bomber'])cover('aircraft-add-frame',byTitle(title).keywords.includes('Frame'));
for(const title of ['Razorshark Strike Fighter','Sun Shark Bomber'])cover('aircraft-profile',byTitle(title).profiles.every(profile=>profile.stats.M==='-'&&profile.stats.OC==='-'));
const riptide=byTitle('Riptide Battlesuit'),ion=name=>riptide.weapons.find(item=>key(item.name)===key(name));
cover('riptide-ion-accelerator',JSON.stringify([ion('➤ Ion accelerator - standard'),ion('➤ Ion accelerator - supercharge')].map(item=>[item?.range,item?.a,item?.skill,item?.s,item?.ap,item?.d,item?.abilities]))===JSON.stringify([['72"','6','4+','9','-2','3',''],['72"','6','4+','10','-3','4','Hazardous']]));
assert.deepEqual([...coveredUpdates].sort(),pack.updates.map(item=>item.id).sort(),'every official T’au update must have an effective assertion');
for(const title of ['Cadre Fireblade','Commander in Coldstar Battlesuit','Commander in Enforcer Battlesuit','Ethereal','Kroot Flesh Shaper','Kroot Trail Shaper','Kroot War Shaper','Commander Farsight','Darkstrider']){
  const unit=byTitle(title);assert.ok(unit,`${title}: leader missing`);
  assert.ok(!unit.keywords.includes('Leader'),`${title}: Leader leaked into keywords`);
  assert.ok(unit.abilities.some(ability=>ability.title==='Leader'),`${title}: Leader ability missing`);
}
const crisisRelations=['Crisis Fireknife Battlesuits','Crisis Starscythe Battlesuits','Crisis Sunforge Battlesuits'];
for(const title of ['Commander Farsight','Commander in Coldstar Battlesuit','Commander in Enforcer Battlesuit']){
  const unit=byTitle(title);
  assert.deepEqual(unit.relations.leader,crisisRelations,`${title}: Crisis Leader graph differs`);
  assert.equal(unit.abilities.filter(item=>item.title==='Leader').length,1,`${title}: individual Leader list leaked into abilities`);
  const desktop=unitMarkup(reader,unit.id);
  for(const target of crisisRelations){
    assert.ok(desktop.includes(target),`${title}: desktop relation missing ${target}`);
  }
  const facts=JSON.parse(decode(desktop.match(/data-rule-facts="([^"]+)"/)?.[1]||'{}'));
  assert.deepEqual(facts.relations.canLead.map(item=>item.unitId),crisisRelations.map(target=>allUnits.find(unit=>unit.title===target)?.id).sort(),`${title}: compiled Leader graph differs`);
}
for(const [local,entry] of Object.entries(context).filter(([id])=>id.includes('ability-leader'))){
  assert.equal(entry.termId,'core-leader',`${local}: Leader must resolve to the canonical Core term`);
}
const frameTitles=['Devilfish','Hammerhead Gunship','Manta','Piranhas','Sky Ray Gunship','Ta’unar Supremacy Armour','Tidewall Droneport','Tidewall Gunrig','Tidewall Shieldline','Razorshark Strike Fighter','Sun Shark Bomber'];
assert.deepEqual(currentUnits.filter(unit=>unit.keywords.some(keyword=>key(keyword)==='frame')).map(unit=>unit.title).sort(),frameTitles.sort());
for(const title of ['Tiger Shark','AX-1-0 Tiger Shark','Manta','Ta’unar Supremacy Armour'])assert.ok(byTitle(title),`${title}: current Forge World datasheet missing from the published book`);
assert.doesNotMatch(JSON.stringify({codex,parity}),/bearer is select(?:[,.]|\s+and)|have the select ability|Monsteror|Vehicleunit|warrior s\b|fight ing\b/i);
assert.match(parity.detachments.find(item=>item.id==='montka')?.enhancements.find(item=>item.id==='enhancement-strike-swiftly')?.text||'',/Scouts 6" ability/);
assert.deepEqual(points.units.find(unit=>unit.title==='Pathfinder Team').paidWargear.map(item=>[item.name,item.value]),[['Ion rifle',5]]);
assert.deepEqual(points.units.find(unit=>unit.title==='Tidewall Shieldline').paidWargear.map(item=>[item.name,item.value]),[['Tidewall Defence Platform',20]]);
for(const [title,values] of [['Commander Farsight',[70]],['Devilfish',[75,85]],['Pathfinder Team',[85,100]],['Riptide Battlesuit',[190,220]],['Stormsurge',[375,400]]])assert.deepEqual(points.units.find(unit=>unit.title===title).points.map(item=>item.value),values,`${title}: MFM values differ`);

for(const detachment of [...pack.detachments,...parity.detachments]){
  assert.match(reader,new RegExp(`id="detachment-${detachment.id}"`));
  for(const suffix of ['rule','enhancements','stratagems'])assert.match(reader,new RegExp(`data-nav-id="${detachment.id}-${suffix}" data-nav-depth="3"`),`${detachment.title}: ${suffix} third-level route missing`);
}
assert.ok(related.lastIndexOf('data-detachment="core"')>related.indexOf('data-detachment="advanced-acquisition-cadre"'),'Core Stratagems must follow faction Stratagems');
assert.match(reader,/army-book-app\.js/,'T’au must use the shared Army Book runtime contract');
assert.match(reader,/army-related-rules/,'T\'au must load the shared Compatible Rules runtime');
assert.doesNotMatch(reader,/related-rules-matcher/,'T\'au must not load the legacy Compatible Rules matcher');
assert.match(reader,/scripts\/roster-filter\.js\?v=\d+/);
assert.match(reader,/scripts\/app\.js\?v=\d+/);
assert.doesNotMatch(related,/data-eligibility|data-keyword-grants/,'matrix template must not retain legacy matcher inputs');
assert.match(reader,/Reference in verification/);
assert.ok(Object.values(context).every(entry=>glossary[entry.termId]),"every T'au context entry must resolve a canonical glossary term");
assert.ok(reader.includes('data-term="core-deep-strike"')&&!context['tau-empire-ability-deep-strike'],'Core Deep Strike must use the canonical term without a local duplicate');

const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(repo,'books','shared','related-rules-matcher.js'),'utf8'),sandbox);
const keywordSet=values=>new Set(values.map(value=>value.toUpperCase()));
const profiles=currentUnits.map(unit=>({unitId:unit.id,keywords:keywordSet(unit.keywords),intrinsicKeywords:keywordSet(unit.keywords),abilities:new Set(unit.abilities.map(item=>item.title.toUpperCase()))}));
for(const stratagem of [...pack.detachments,...parity.detachments].flatMap(detachment=>detachment.stratagems)){
  const contract=relatedRules.stratagems[stratagem.id];assert.ok(contract,`${stratagem.title}: eligibility missing`);
  assert.ok(profiles.some(profile=>sandbox.window.WHRelatedRules.matches(contract,profile)),`${stratagem.title}: no current datasheet satisfies eligibility`);
  assert.match(related,new RegExp(`data-rule-id="${stratagem.id}"`));
}
const coordinate=relatedRules.stratagems['stratagem-coordinate-to-engage'];
assert.equal(sandbox.window.WHRelatedRules.match(coordinate,profiles.find(item=>item.unitId==='unit-breacher-team')).state,'conditional');
for(const id of ['unit-tidewall-droneport','unit-tidewall-gunrig','unit-tidewall-shieldline']){
  assert.equal(sandbox.window.WHRelatedRules.match(coordinate,profiles.find(item=>item.unitId===id)).state,'no-match',`${id}: Fortification cannot be an Observer`);
}
assert.equal(new Set([...related.matchAll(/data-rule-id="([^"]+)"/g)].map(match=>match[1])).size,54,'Related Rules inventory differs from 31 Stratagems + 23 Enhancements');
console.log(`T'au weapon tokens: ${canonicalWeaponLabels.length} labels, ${responsiveWeaponTokens.length} responsive, ${responsiveWeaponTokens.filter(token=>token.term).length} interactive, ${responsiveWeaponTokens.filter(token=>!token.term).length} unknown (${unknownWeaponLabels.join(', ')}).`);
const {stratagemTypes}=await import(new URL('../scripts/stratagem-types.mjs',import.meta.url));
assert.equal(stratagemTypes.size,31,'T’au Stratagem map must cover all rendered faction Stratagems');
assert.equal([...stratagemTypes.values()].filter(type=>type==='unknown').length,7,'T’au must preserve seven source-untyped Stratagems as unknown');
assert.equal([...stratagemTypes.values()].filter(type=>type!=='unknown').length,24,'T’au must preserve 24 source-typed Stratagems');
assert.match(fs.readFileSync(new URL('../scripts/app.js',import.meta.url),'utf8'),/presentation\.decorate\(document\)/);
console.log("T'au Empire QA passed: official v1.1 pack and v1.4 MFM, 43 current datasheets, 7 detachments, exact Wargear, Glossary and Related Rules contracts.");
