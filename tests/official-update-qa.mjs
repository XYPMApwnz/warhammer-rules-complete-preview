import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const runtimeVersions=json('books/shared/runtime-asset-versions.json');
const generatedBook=bookId=>{
  const sandbox={window:{}};
  vm.runInNewContext(read(`books/${bookId}/scripts/target-data.js`),sandbox);
  return sandbox.window.WH_ARMY_BOOK_TARGETS;
};
const clean=value=>String(value??'').replaceAll('\u00a0',' ').replace(/\r\n?/g,'\n').replace(/[ \t]+/g,' ').trim();
const slug=value=>clean(value).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const decode=html=>clean(html.replace(/<[^>]+>/g,' ').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>'))
  .replace(/\s+([,.;:!?%)’'])/g,'$1').replace(/([’'])\s+/g,'$1');
const normalizedSurface=(value,fieldName='')=>Array.isArray(value)?value.map(item=>normalizedSurface(item,fieldName)):value&&typeof value==='object'
  ?Object.fromEntries(Object.entries(value).map(([name,item])=>[name,normalizedSurface(item,name)]))
  :typeof value==='string'?(fieldName==='abilities'?clean(value).toLowerCase():clean(value)).replace(/\s+/g,' '):value;
const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

function exactlyOne(items,label){
  assert.equal(items.length,1,`${label}: expected exactly one target, found ${items.length}`);
  return items[0];
}

function getById(value,id){
  const matches=[];
  const visit=item=>{
    if(!item||typeof item!=='object')return;
    if(item.id===id)matches.push(item);
    for(const child of Object.values(item))visit(child);
  };
  visit(value);
  return matches;
}

function extractAt(html,tag,index){
  const tags=new RegExp(`<\\/?${tag}\\b[^>]*>`,'gi');
  tags.lastIndex=index;
  let depth=0;
  for(let match;(match=tags.exec(html));){
    depth+=match[0][1]==='/'?-1:1;
    if(depth===0)return html.slice(index,tags.lastIndex);
  }
  throw new Error(`Unclosed <${tag}> at ${index}`);
}

function elementsByAttribute(html,name,value){
  const result=[],pattern=new RegExp(`<([a-z][\\w-]*)\\b[^>]*\\s${escapeRegExp(name)}="${escapeRegExp(value)}"[^>]*>`,'gi');
  for(let match;(match=pattern.exec(html));)result.push(extractAt(html,match[1],match.index));
  return result;
}

function elementById(html,id){
  const result=elementsByAttribute(html,'id',id);
  return exactlyOne(result,`#${id}`);
}

function attr(html,name){
  return new RegExp(`\\b${escapeRegExp(name)}="([^"]*)"`,'i').exec(html)?.[1]??null;
}

function field(scope,name){
  return elementsByAttribute(scope,'data-source-field',name);
}

function textField(scope,name){
  const value=decode(exactlyOne(field(scope,name),`[data-source-field="${name}"]`));
  return ['when','target','effect','restrictions'].includes(name)?value.replace(new RegExp(`^${name}\\s+`,'i'),''):value;
}

function listField(scope,name,child='li'){
  const block=exactlyOne(field(scope,name),`[data-source-field="${name}"]`);
  return [...block.matchAll(new RegExp(`<${child}\\b[^>]*>([\\s\\S]*?)<\\/${child}>`,'gi'))].map(match=>decode(match[1]));
}

function weaponField(scope,profileKey){
  const row=exactlyOne(field(scope,`weapons.${profileKey}`),`weapon ${profileKey}`);
  const value=name=>textField(row,name);
  const nameField=exactlyOne(field(row,'name'),`weapon ${profileKey} name`);
  const weaponName=/<button\b(?=[^>]*\bclass="[^"]*\bweapon-button\b[^"]*")[^>]*>([\s\S]*?)<\/button>/i.exec(nameField);
  const abilityTokens=[...nameField.matchAll(/<(button|span)\b(?=[^>]*\bclass="[^"]*\btag\b[^"]*")[^>]*>([\s\S]*?)<\/\1>/gi)];
  if(profileKey==='solar-atomiser'){
    const melta=exactlyOne(abilityTokens.filter(match=>attr(match[0],'data-term')==='core-melta'),'Solar atomiser MELTA token');
    assert.equal(decode(melta[2]),'MELTA 3','Solar atomiser must expose the complete atomic MELTA 3 token');
  }
  return {
    name:weaponName?decode(weaponName[1]):value('name'),
    mode:attr(row,'data-mode'),
    range:value('range'),
    a:value('a'),
    skill:value('skill'),
    s:value('s'),
    ap:value('ap'),
    d:value('d'),
    abilities:(abilityTokens.length?abilityTokens.map(match=>decode(match[2])).join(', '):((/<small>([\s\S]*?)<\/small>/i.exec(row)?.[1]&&decode(RegExp.$1))||'')).replace(/\s*-\s*/g,'-')
  };
}

const dgSource=json('books/death-guard/content/death-guard-rules.en.json');
const amRules=json('books/adeptus-mechanicus/content/adeptus-mechanicus-rules.en.json');
const amSource=json('books/adeptus-mechanicus/content/adeptus-mechanicus-source.en.json');
const amCodex=json('books/adeptus-mechanicus/content/adeptus-mechanicus-codex-datasheets.en.json');
const amCodexDetachments=json('books/adeptus-mechanicus/content/adeptus-mechanicus-codex-detachments.en.json');
const amParity=json('books/adeptus-mechanicus/content/adeptus-mechanicus-codex-parity.en.json');
const tyrPack=json('books/tyranids/content/tyranids-faction-pack.en.json');
const tyrParity=json('books/tyranids/content/tyranids-codex-parity.en.json');
const tyrCodex=json('books/tyranids/content/tyranids-codex-datasheets.en.json');
const tauPack=json('books/tau-empire/content/tau-empire-faction-pack.en.json');
const tauParity=json('books/tau-empire/content/tau-empire-codex-parity.en.json');
const tauCodex=json('books/tau-empire/content/tau-empire-codex-datasheets.en.json');
const ecCodex=json('books/emperors-children/content/emperors-children-codex-datasheets.en.json');
const seekers=exactlyOne(ecCodex.datasheets.filter(unit=>unit.id==='unit-seekers'),'EC unit-seekers');
assert.deepEqual(
  exactlyOne(seekers.weapons.filter(weapon=>weapon.name==='Lashing tongue'),'Seekers Lashing tongue'),
  {name:'Lashing tongue',mode:'melee',range:'Melee',a:'2',skill:'4+',s:'4',ap:'0',d:'1',abilities:'Extra Attacks, Lethal Hits'},
  'Seekers Lashing tongue must match the reviewed official profile'
);
assert.equal(seekers.weapons.filter(weapon=>weapon.name==='Lashing tongues').length,0,'Seekers stale plural weapon identity must be absent');
const csmCodex=json('books/chaos-space-marines/content/chaos-space-marines-codex-datasheets.en.json');
const nemesisClaw=exactlyOne(csmCodex.datasheets.filter(unit=>unit.id==='unit-nemesis-claw'),'CSM unit-nemesis-claw');
assert.deepEqual(
  exactlyOne(nemesisClaw.weapons.filter(weapon=>weapon.name==='Paired accursed weapons'),'Nemesis Claw paired accursed weapons'),
  {name:'Paired accursed weapons',mode:'melee',range:'Melee',a:'4',skill:'3+',s:'5',ap:'-2',d:'1',abilities:'Twin-linked'},
  'Nemesis Claw paired accursed weapons must match the official v1.2 profile'
);
const glossary=json('glossary/registry.en.json').terms;
const glossaryV2=json('glossary/v2/generated/index.en.json').entries;
const glossaryContexts=Object.fromEntries(['death-guard','adeptus-mechanicus','tyranids','tau-empire'].map(bookId=>[
  bookId,json(`glossary/contexts/${bookId}.json`).terms
]));

const dgOfficialMarkers=[
  ['dg-fp-1.1-p7-contagion-range-cap','Gift - Contagion Range:'],
  ['dg-fp-1.1-p7-skullsquirm-blight','Gift - Skullsquirm Blight:'],
  ['dg-fp-1.1-p7-beckoning-blight','Tallyband Summoners - Beckoning Blight:'],
  ['dg-fp-1.1-p7-frame-keywords','Add FRAME to Chaos Land Raider'],
  ['dg-fp-1.1-p7-typhus-eater-plague','Typhus - Eater Plague:'],
  ['dg-fp-1.1-p7-predator-autocannon-strength','Chaos Predator Destructor - Predator autocannon:'],
  ['dg-fp-1.1-p7-death-approaches','Deathshroud Terminators - Death Approaches:'],
  ['dg-fp-1.1-p7-worldblight','Virulent Vectorium - Worldblight:'],
  ['dg-fp-1.1-p7-mortarion-lord-of-the-death-guard','Mortarion - Lord of the Death Guard:'],
  ['dg-fp-1.1-p7-spore-laced-shock-waves-faq','Spore-laced Shock Waves ability does not inflict']
];

const amOfficialMarkers=[
  ['doctrina-protector-imperative',17,'Change Protector Imperative to:'],
  ['doctrina-conqueror-imperative',17,'Change Conqueror Imperative to:'],
  ['cohort-cybernetica-cyber-psalm-programming',17,'Cyber-psalm Programming Detachment Rule'],
  ['rad-zone-corps-unit-taking-cover',17,'Rad-bombardment Detachment Rule, Battle Round 1 Section, Unit'],
  ['skitarii-hunter-cohort-stealth-optimisation',17,'Stealth Optimisation Detachment Rule'],
  ['skitarii-hunter-cohort-veiled-hunter',17,'Veiled Hunter Enhancement'],
  ['datasheets-add-doctrina-imperatives',17,'Doctrina Imperatives Faction Abilities section'],
  ['archaeopter-fusilave-stratoraptor-remove-hover',17,"Remove 'Hover'."],
  ['archaeopter-fusilave-stratoraptor-profile',17,"Change M and OC to '-'."],
  ['archaeopter-fusilave-bomb-rack',17,'Archaeopter Fusilave, Bomb Rack Ability'],
  ['archaeopter-transvector-profile',17,'Profile: Change M to 14".'],
  ['archaeopter-transvector-keywords',17,"Keywords: Remove 'AIRCRAFT'."],
  ['archaeopter-transvector-aerial-deployment',17,'Archaeopter Transvector, Aerial Deployment Ability'],
  ['belisarius-cawl-keywords',18,"Keywords section: Add 'MOBILE'."],
  ['belisarius-cawl-move',18,'Move characteristic: change to 8".'],
  ['belisarius-cawl-canticles-of-the-omnissiah',18,'Canticles of the Omnissiah Ability'],
  ['belisarius-cawl-invocation-of-machine-vengeance',18,'Invocation of Machine Vengeance Ability'],
  ['belisarius-cawl-mantra-of-discipline',18,'Mantra of Discipline Ability'],
  ['belisarius-cawl-shroudpsalm',18,'Shroudpsalm (Aura) Ability'],
  ['belisarius-cawl-solar-atomiser',18,'Solar atomiser weapon: Change A to'],
  ['cybernetica-datasmith-core-abilities',18,'Core Abilities section: Remove ‘Leader’, add ‘Support’'],
  ['cybernetica-datasmith-keywords',18,'Keywords section: Remove ‘INFANTRY’, add ‘VEHICLE’'],
  ['cybernetica-datasmith-data-severed',18,'Data-severed: If there are no KASTELAN ROBOT models'],
  ['ironstrider-ballistarii-twin-cognis-autocannon',18,'Twin Cognis Autocannon'],
  ['ironstrider-ballistarii-twin-cognis-lascannon',18,'Twin Cognis Lascannon'],
  ['kastelan-robots-repulsor-grid',18,'Kastelan Robots, Repulsor Grid ability'],
  ['onager-dunecrawler-weapon-profiles',18,'Onager Dunecrawler'],
  ['onager-dunecrawler-scuttling-walker',18,'Scuttling Walker: Each time this model makes a Normal'],
  ['serberys-raiders-tactica-obliqua',18,'Serberys Raiders, Tactica Obliqua Ability'],
  ['sicarian-infiltrators-melee-weapons',18,'Sicarian Infiltrators, Melee Weapons'],
  ['sicarian-ruststalkers-melee-weapons',19,'Sicarian Ruststalkers, Melee Weapons'],
  ['skitarii-marshal-core-abilities',19,'Skitarii Marshal, Core Abilities section'],
  ['skitarii-marshal-servo-skull-uplink',19,'Skitarii Marshal, Servo-skull Uplink Ability'],
  ['skorpius-frame-keyword',19,'Skorpius Disintegrator, Skorpius Dunerider'],
  ['skorpius-disintegrator-ferrumite-cannon',19,'Skorpius Disintegrator, Ferrumite Cannon'],
  ['skorpius-dunerider-firing-deck',19,'Skorpius Dunerider, Core Abilities'],
  ['technoarcheologist-core-abilities',19,'Technoarcheologist, Core Abilities section'],
  ['faq-auto-divinatory-targeting-protector-imperative',19,'Ballistic Skill modifiers applied?']
];

const parityByTitle=new Map(amParity.detachments.map(item=>[item.title,item]));
const amEffectiveCodexDetachments=amCodexDetachments.detachments.map(detachment=>{
  const parity=parityByTitle.get(detachment.title);
  assert.ok(parity,`Mechanicus parity missing ${detachment.title}`);
  const enhancementText=new Map(parity.enhancements.map(item=>[item.title,item.text]));
  return {...detachment,rule:{...detachment.rule,text:parity.rule.text},enhancements:detachment.enhancements.map(item=>({...item,text:enhancementText.get(item.title)||item.text}))};
});
const amDetachments=[...amRules.detachments,...amEffectiveCodexDetachments];
const amOfficialUnits=new Map(amRules.datasheets.map(unit=>[unit.id,unit]));
const amUnits=amCodex.datasheets.map(unit=>amOfficialUnits.has(unit.id)?{...unit,...amOfficialUnits.get(unit.id)}:unit);
const tyrUnits=[...tyrCodex.datasheets,...tyrCodex.imperialArmour,...tyrCodex.legends];
const tyrDetachments=[...tyrPack.detachments,...tyrParity.detachments];
const tauUnits=[...tauCodex.datasheets,...tauCodex.imperialArmour,...tauCodex.legends];
const tauDetachments=[...tauPack.detachments,...tauParity.detachments];

function parseDgKeywords(text){
  const [normal,faction]=text.split(/Faction Keywords:\s*/);
  assert.ok(faction,'DG keyword field is malformed');
  return [...normal.replace(/^Keywords:\s*/,'').split(','),...faction.split(',')].map(item=>item.trim().replace(/\s*\.$/,'').trim()).filter(Boolean);
}

function dgObserved(target){
  const node=exactlyOne(getById(dgSource.sections,target.owner),`DG source ${target.owner}`);
  if(target.field==='keywords')return parseDgKeywords(exactlyOne(node.blocks.filter(block=>block.text?.startsWith('Keywords:')),`DG ${target.owner}.keywords`).text);
  if(target.field==='text'&&node.blocks?.length===1)return node.blocks[0].text;
  assert.ok(target.field in node,`DG ${target.owner}.${target.field} is not addressable`);
  return node[target.field];
}

function amUnit(id){
  return exactlyOne(amUnits.filter(unit=>unit.id===id),`Mechanicus source ${id}`);
}

function amObserved(target){
  if(target.kind==='army-rule-branch'){
    assert.equal(amRules.armyRule.id,target.ruleId);
    return exactlyOne(amRules.armyRule.options.filter(item=>item.id===target.branchId),`Mechanicus ${target.branchId}`)[target.field];
  }
  if(['detachment-rule','enhancement','stratagem'].includes(target.kind)){
    const det=exactlyOne(amDetachments.filter(item=>item.id===target.detachmentId),`Mechanicus ${target.detachmentId}`);
    if(target.kind==='detachment-rule'){
      assert.equal(det.rule.id,target.ruleId);
      return det.rule[target.field];
    }
    const collection=target.kind==='enhancement'?det.enhancements:det.stratagems;
    return exactlyOne(collection.filter(item=>item.id===(target.enhancementId||target.stratagemId)),`Mechanicus ${target.enhancementId||target.stratagemId}`)[target.field];
  }
  const unit=amUnit(target.unitId);
  if(target.kind==='datasheet-stat')return unit.stats[target.field];
  if(target.kind==='weapon-profile')return exactlyOne(unit.weapons.filter(item=>slug(item.name)===target.profileKey),`Mechanicus weapon ${target.profileKey}`);
  if(target.kind==='datasheet-keyword')return unit.keywords.find(item=>slug(item)===slug(target.keyword))??null;
  const ability=unit.abilities.find(item=>slug(item.title)===target.abilityKey);
  if(target.kind==='datasheet-core-ability')return ability?.title??null;
  assert.equal(target.kind,'datasheet-ability');
  if(ability)return ability[target.field];
  const canticles=unit.abilities.find(item=>slug(item.title)==='canticles-of-the-omnissiah');
  const option=canticles?.options?.find(item=>item.id===target.abilityKey);
  assert.ok(option,`Mechanicus ${target.unitId}.${target.abilityKey} is not addressable`);
  return option[target.field];
}

function tyrObserved(update,target){
  if(target.kind==='army-rule')return exactlyOne(tyrPack.updates.filter(item=>item.id===update.id),`Tyranids ${update.id}`).change;
  if(['detachment-rule','enhancement-text','stratagem-field'].includes(target.kind)){
    const det=exactlyOne(tyrDetachments.filter(item=>item.id===target.owner),`Tyranids ${target.owner}`);
    if(target.kind==='detachment-rule')return det.rule[target.field];
    const collection=target.kind==='enhancement-text'?det.enhancements:det.stratagems;
    return exactlyOne(collection.filter(item=>target.enhancementId?item.id===target.enhancementId:slug(item.title)===slug(target.title)),`Tyranids ${target.owner}.${target.title}`)[target.field];
  }
  const unit=exactlyOne(tyrUnits.filter(item=>item.id===target.unitId),`Tyranids ${target.unitId}`);
  if(target.kind==='ability')return exactlyOne(unit.abilities.filter(item=>slug(item.title)===slug(target.title)),`Tyranids ${target.title}`)[target.field];
  if(target.kind==='keyword')return unit.keywords.some(item=>slug(item)===slug(target.value));
  if(target.kind==='weapon-stat')return exactlyOne(unit.weapons.filter(item=>slug(item.name)===slug(target.title)),`Tyranids ${target.title}`)[target.field];
  if(target.kind==='stat')return exactlyOne(unit.profiles.filter(item=>slug(item.name)===slug(target.profile)),`Tyranids ${target.profile}`).stats[target.field];
  if(target.kind==='core-ability')return unit.abilities.some(item=>slug(item.title)===slug(target.title));
  throw new Error(`Unsupported Tyranids target kind ${target.kind}`);
}

function tauObserved(update,target){
  if(target.kind==='army-rule')return exactlyOne(tauPack.updates.filter(item=>item.id===update.id),`T'au ${update.id}`).change;
  if(['detachment-rule','enhancement','stratagem-field'].includes(target.kind)){
    const id=target.detachmentId||target.owner;
    const det=exactlyOne(tauDetachments.filter(item=>item.id===id),`T'au ${id}`);
    if(target.kind==='detachment-rule')return det.rule[target.field];
    const collection=target.kind==='enhancement'?det.enhancements:det.stratagems;
    return exactlyOne(collection.filter(item=>item.id===(target.enhancementId||target.stratagemId)),`T'au ${target.enhancementId||target.stratagemId}`)[target.field];
  }
  const unit=exactlyOne(tauUnits.filter(item=>item.id===target.unitId),`T'au ${target.unitId}`);
  if(target.kind==='wargear-ability')return exactlyOne(unit.wargearAbilities.filter(item=>slug(item.title)===slug(target.title)),`T'au ${target.title}`)[target.field];
  if(target.kind==='ability')return exactlyOne(unit.abilities.filter(item=>slug(item.title)===slug(target.title)),`T'au ${target.title}`)[target.field];
  if(target.kind==='keyword')return unit.keywords.some(item=>slug(item)===slug(target.value));
  if(target.kind==='weapon-profile')return exactlyOne(unit.weapons.filter(item=>slug(item.name)===target.profileKey),`T'au ${target.profileKey}`);
  if(target.kind==='stat')return exactlyOne(unit.profiles.filter(item=>slug(item.name)===slug(target.profile)),`T'au ${target.profile}`).stats[target.field];
  if(target.kind==='core-ability')return unit.abilities.some(item=>slug(item.title)===slug(target.title));
  throw new Error(`Unsupported T'au target kind ${target.kind}`);
}

function targetScope(bookId,target,html){
  if(bookId==='death-guard'){
    const ids=elementsByAttribute(html,'id',target.owner);
    if(ids.length)return exactlyOne(ids,`#${target.owner}`);
    return exactlyOne(elementsByAttribute(html,'data-rule-id',target.owner),`[data-rule-id="${target.owner}"]`);
  }
  if(target.kind==='army-rule-branch')return elementById(html,target.branchId);
  if(target.unitId)return elementById(html,target.unitId);
  if(target.kind==='army-rule')return elementById(html,`army-rule-${slug(target.title)}`);
  if(target.detachmentId)return elementById(html,bookId==='tau-empire'?`detachment-${target.detachmentId}`:target.detachmentId);
  if(target.kind==='detachment-rule'&&target.owner)return elementById(html,`${target.owner}-rule`);
  if(target.owner)return elementById(html,`detachment-${target.owner}`);
  if(target.ruleId)return elementById(html,target.ruleId);
  throw new Error(`${bookId}: no deterministic scope for ${JSON.stringify(target)}`);
}

function surfaceObserved(bookId,target,html){
  const scope=targetScope(bookId,target,html);
  if(bookId==='death-guard'){
    if(target.field==='keywords')return parseDgKeywords(decode(exactlyOne([...scope.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(match=>match[1]),`DG ${target.owner} keyword paragraph`)));
    if(target.kind==='weapon-profile-replacement')return decode(exactlyOne(elementsByAttribute(scope,'data-label','S'),'DG weapon S'));
    if(/^<p\b/i.test(scope))return decode(scope);
    const paragraphs=[...scope.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(match=>decode(match[1]));
    return exactlyOne(paragraphs,`DG ${target.owner} paragraph`);
  }
  if(target.kind==='army-rule-branch')return listField(scope,'effects');
  if(target.kind==='detachment-rule')return textField(target.ruleId?elementById(scope,target.ruleId):scope,'text');
  if(target.kind==='enhancement'){
    const card=exactlyOne(elementsByAttribute(scope,'data-rule-id',target.enhancementId),`enhancement ${target.enhancementId}`);
    return textField(card,'text');
  }
  if(target.kind==='stratagem'||target.kind==='stratagem-field'){
    const card=exactlyOne(elementsByAttribute(scope,'data-rule-id',target.stratagemId||slug(target.title)),`stratagem ${target.stratagemId||target.title}`);
    return textField(card,target.field);
  }
  if(target.kind==='army-rule')return textField(scope,'text');
  if(target.kind==='datasheet-stat'||target.kind==='stat'){
    const profile=target.profile?exactlyOne(elementsByAttribute(scope,'data-profile',slug(target.profile)),`profile ${target.profile}`):scope;
    const stat=exactlyOne(field(profile,`stats.${target.field}`),`stat ${target.field}`);
    return decode(exactlyOne([...stat.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/gi)].map(match=>match[1]),`stat ${target.field} value`));
  }
  if(target.kind==='weapon-profile')return weaponField(scope,target.profileKey);
  if(['weapon-stat','weapon-profile-replacement'].includes(target.kind)&&target.field){
    const row=exactlyOne(field(scope,`weapons.${slug(target.title)}`),`weapon ${target.title}`);
    return textField(row,target.field);
  }
  if(target.kind==='datasheet-keyword'){
    const matches=field(scope,`keywords.${slug(target.keyword)}`);
    return matches.length?decode(exactlyOne(matches,`keyword ${target.keyword}`)):null;
  }
  if(target.kind==='keyword')return field(scope,`keywords.${slug(target.value)}`).length===1;
  if(target.kind==='datasheet-core-ability'){
    const matches=field(scope,`abilities.${target.abilityKey}`);
    if(!matches.length)return null;
    const ability=exactlyOne(matches,`ability ${target.abilityKey}`);
    const heading=/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(ability)?.[1];
    return decode(heading||ability);
  }
  if(target.kind==='core-ability')return field(scope,`abilities.${slug(target.title)}`).length===1;
  if(target.kind==='datasheet-ability'){
    let ability=field(scope,`abilities.${target.abilityKey}`);
    if(ability.length)return target.field==='title'?decode(exactlyOne(ability,`ability ${target.abilityKey}`)).split(/\s{2,}/)[0]:textField(exactlyOne(ability,`ability ${target.abilityKey}`),target.field);
    const canticles=exactlyOne(field(scope,'abilities.canticles-of-the-omnissiah'),'Canticles');
    const option=exactlyOne(field(canticles,`options.${target.abilityKey}`),`Canticles ${target.abilityKey}`);
    return textField(option,target.field);
  }
  if(target.kind==='ability'){
    const ability=exactlyOne(field(scope,`abilities.${slug(target.title)}`),`ability ${target.title}`);
    if(!field(ability,target.field).length&&attr(ability,'data-source-value')!==null)return decode(attr(ability,'data-source-value'));
    return textField(ability,target.field);
  }
  if(target.kind==='wargear-ability')return textField(exactlyOne(field(scope,`wargearAbilities.${slug(target.title)}`),`wargear ability ${target.title}`),target.field);
  if(target.kind==='enhancement-text'){
    const card=exactlyOne(elementsByAttribute(scope,'data-rule-id',target.enhancementId),`enhancement ${target.title}`);
    return textField(card,target.field);
  }
  throw new Error(`${bookId}: unsupported surface target ${target.kind}`);
}

function mobileFile(bookId,target){
  if(bookId==='death-guard'&&target.owner==='faq-spore-laced-shock-waves')return 'books/death-guard/mobile/updates.html';
  if(target.unitId)return `books/${bookId}/mobile/${target.unitId.slice(5)}.html`;
  if(target.kind==='army-rule'||target.kind==='army-rule-branch'||bookId==='death-guard'&&['contagion-range-cap','skullsquirm-blight'].includes(target.owner))return `books/${bookId}/mobile/army-rules.html`;
  if(bookId==='death-guard')return 'books/death-guard/mobile/index.html';
  const detachment=target.detachmentId?.replace(/^detachment-/,'')||target.owner;
  return `books/${bookId}/mobile/${detachment}.html`;
}

function sameSet(actual,expected,label){
  assert.deepStrictEqual([...new Set(actual)].sort(),[...new Set(expected)].sort(),label);
}

function verifyOfficialInventory(bookId,ledger){
  let inventory;
  if(bookId==='tyranids')inventory=tyrPack.updates.map(item=>item.id);
  else if(bookId==='tau-empire')inventory=tauPack.updates.map(item=>item.id);
  else if(bookId==='death-guard'){
    const blocks=exactlyOne(dgSource.sections.filter(section=>section.id==='rules-updates'),'DG official update section').blocks;
    for(const block of blocks){
      const matches=dgOfficialMarkers.filter(([,marker])=>block.text.includes(marker));
      assert.equal(matches.length,1,`DG official block has ${matches.length} inventory markers: ${block.text}`);
    }
    for(const [id,marker] of dgOfficialMarkers)assert.equal(blocks.filter(block=>block.text.includes(marker)).length,1,`DG inventory marker ${id}`);
    inventory=dgOfficialMarkers.map(([id])=>id);
  }else{
    for(const [id,page,marker] of amOfficialMarkers){
      const transcript=amSource.pages[String(page)];
      assert.ok(transcript,`Mechanicus inventory ${id}: missing page ${page}`);
      assert.equal(transcript.split(marker).length-1,1,`Mechanicus inventory marker ${id}`);
    }
    inventory=amOfficialMarkers.map(([id])=>id);
  }
  sameSet(ledger.updates.map(item=>item.id),inventory,`${bookId}: official inventory and ledger differ`);
}

function targetConcept(target){
  if(target.kind==='army-rule')return target.title;
  if(['keyword','datasheet-keyword','keyword-addition'].includes(target.kind))return target.value||target.keyword;
  if(['core-ability','datasheet-core-ability'].includes(target.kind))return target.abilityKey||target.title||target.effectiveAfter;
  if(target.kind==='datasheet-ability')return target.abilityKey;
  return null;
}

const ruleText=value=>clean(value).replace(/:\s*\u2022\s*/g,': ').replace(/\.\s*\u2022\s*/g,'; ').toLowerCase();

function glossaryMappings(bookId,target){
  const unitId=target.unitId;
  const concept=targetConcept(target);
  const exactDefinition=typeof target.effectiveAfter==='string'?clean(target.effectiveAfter):null;
  const matches=[];
  for(const [contextId,context] of Object.entries(glossaryContexts[bookId])){
    const term=glossary[context.termId];
    if(!term)continue;
    const navigation=context.navigation||{};
    const addressMatches=unitId&&(navigation.units?.includes(unitId)||navigation.datasheet===unitId||navigation.rule===unitId)
      ||target.owner&&navigation.rule===target.owner;
    if(!addressMatches)continue;
    const title=slug(term.title?.en||'').replace(/-\d+$/,'');
    const conceptMatches=concept&&title===slug(concept).replace(/-\d+$/,'');
    const definitionMatches=exactDefinition&&clean(term.definition?.en||'')===exactDefinition;
    if(conceptMatches||definitionMatches)matches.push({contextId,termId:context.termId});
  }
  if(target.kind==='army-rule'){
    for(const [termId,term] of Object.entries(glossary))if(term.scope===bookId&&slug(term.title?.en||'')===slug(target.title)&&ruleText(term.definition?.en||'')===ruleText(exactDefinition))matches.push({contextId:null,termId});
  }
  return [...new Map(matches.map(item=>[item.termId,item])).values()];
}

function verifyGlossary(bookId,update,target){
  if(!target.glossaryTermId){
    assert.equal(target.glossary?.status,'not-applicable',`${bookId}/${update.id}: missing glossary contract`);
    assert.ok(target.glossary.reason,`${bookId}/${update.id}: glossary reason is required`);
    assert.deepStrictEqual(glossaryMappings(bookId,target),[],`${bookId}/${update.id}: glossary not-applicable has an addressable mapping`);
    return;
  }
  const v2Matches=bookId==='death-guard'?glossaryV2.filter(entry=>
    entry.contexts?.some(context=>context.effectiveBookId===bookId)
    &&[entry.sourceOwner?.canonicalId,entry.facts?.id,entry.facts?.termId].includes(target.owner)
  ):[];
  assert.ok(v2Matches.length<=1,`${bookId}/${update.id}: ambiguous Glossary V2 owner ${target.owner}`);
  const v2Entry=v2Matches[0],facts=v2Entry?.facts;
  const term=v2Entry?{
    title:{en:v2Entry.label},
    definition:{en:facts?.text||facts?.abilities||v2Entry.searchableContent||''},
    structured:facts?.type==='weapon'?{weapon:{Range:facts.range,A:facts.a,[facts.mode==='ranged'?'BS':'WS']:facts.skill,S:facts.s,AP:facts.ap,D:facts.d}}:undefined
  }:glossary[target.glossaryTermId];
  assert.ok(term,`${bookId}/${update.id}: missing glossary ${target.glossaryTermId}`);
  if(target.kind==='army-rule'){
    assert.equal(ruleText(term.definition?.en||''),ruleText(target.effectiveAfter),`${bookId}/${update.id}: glossary army rule differs`);
    assert.ok(glossaryMappings(bookId,target).some(item=>item.termId===target.glossaryTermId),`${bookId}/${update.id}: glossary ${target.glossaryTermId} is not mapped to the exact target`);
    return;
  }
  if(['army-rule','keyword','datasheet-keyword','keyword-addition','core-ability','datasheet-core-ability'].includes(target.kind)){
    assert.ok(glossaryMappings(bookId,target).some(item=>item.termId===target.glossaryTermId),`${bookId}/${update.id}: glossary ${target.glossaryTermId} is not mapped to the exact target`);
    return;
  }
  const value=target.effectiveAfter;
  if(value&&typeof value==='object'&&!Array.isArray(value)){
    assert.equal(clean(term.title.en).replace(/^➤\s*/,''),clean(value.name).replace(/^➤\s*/,''),
      `${target.glossaryTermId}: weapon name`);
    const structured=term.structured?.weapon||{};
    for(const [sourceKey,termKey] of [['range','Range'],['a','A'],['s','S'],['ap','AP'],['d','D']])assert.equal(clean(structured[termKey]),clean(value[sourceKey]),`${target.glossaryTermId}.${termKey}`);
    assert.equal(clean(structured[value.mode==='ranged'?'BS':'WS']),clean(value.skill),`${target.glossaryTermId}.skill`);
    assert.ok(clean(term.definition.en).includes(clean(value.abilities)),`${target.glossaryTermId}: abilities`);
    return;
  }
  if(['weapon-stat','weapon-profile-replacement'].includes(target.kind)&&target.field){
    const fieldName={range:'Range',a:'A',skill:'BS',s:'S',ap:'AP',d:'D'}[target.field];
    assert.ok(fieldName,`${target.glossaryTermId}: unsupported weapon field ${target.field}`);
    assert.equal(clean(term.structured?.weapon?.[fieldName]),clean(value),`${target.glossaryTermId}.${fieldName}`);
    return;
  }
  const flat=value=>clean(value).replace(/[▪■•]/g,'•').replace(/\s+/g,' ');
  const text=flat(`${term.title?.en||''} ${term.definition?.en||term.summary?.en||''}`);
  for(const part of Array.isArray(value)?value:[value])if(part!==null&&part!==false)assert.equal(text.split(flat(part)).length-1,1,`${target.glossaryTermId}: expected updated value exactly once`);
}

const configs={
  'death-guard':{complete:true,ledger:'books/death-guard/content/official-update-ledger.en.json',desktop:'books/death-guard/reader.html',source:(_u,t)=>dgObserved(t)},
  'adeptus-mechanicus':{complete:true,ledger:'books/adeptus-mechanicus/content/official-update-ledger.en.json',desktop:'books/adeptus-mechanicus/reader.html',source:(_u,t)=>amObserved(t)},
  tyranids:{complete:false,ledger:'books/tyranids/content/official-update-ledger.en.json',desktop:'books/tyranids/reader.html',source:tyrObserved},
  'tau-empire':{complete:false,ledger:'books/tau-empire/content/official-update-ledger.en.json',desktop:'books/tau-empire/reader.html',source:tauObserved}
};
const ranks={matched:0,'already-effective':0,unavailable:1,invalid:2};
let updateCount=0,targetCount=0,warnings=0;

for(const [bookId,config] of Object.entries(configs)){
  const ledger=json(config.ledger),generated=generatedBook(bookId),desktop=generated.html,updateIds=new Set(),globalAddresses=new Set();
  assert.equal(ledger.schema,1);
  assert.equal(ledger.bookId,bookId);
  assert.ok(ledger.updates.length,`${bookId}: ledger is empty`);
  verifyOfficialInventory(bookId,ledger);
  for(const update of ledger.updates){
    updateCount++;
    assert.ok(!updateIds.has(update.id),`${bookId}: duplicate update ${update.id}`);
    updateIds.add(update.id);
    assert.ok(update.source?.documentId&&Number.isInteger(update.source.page),`${bookId}/${update.id}: invalid source`);
    assert.ok(update.targets.length,`${bookId}/${update.id}: targets must not be empty`);
    if(bookId==='tyranids'||bookId==='tau-empire'){
      const official=exactlyOne((bookId==='tyranids'?tyrPack:tauPack).updates.filter(item=>item.id===update.id),`official update ${update.id}`);
      assert.ok(official.sourcePages.includes(update.source.page),`${update.id}: wrong page`);
    }
    const states=[];
    for(const target of update.targets){
      targetCount++;
      assert.ok('expectedBefore'in target&&'effectiveAfter'in target&&'unavailableReason'in target,`${bookId}/${update.id}: incomplete target`);
      const address=JSON.stringify(Object.fromEntries(Object.entries(target).filter(([name])=>!['expectedBefore','effectiveAfter','unavailableReason','glossaryTermId','glossary'].includes(name))));
      assert.ok(!address.includes('*'),`${bookId}/${update.id}: address wildcards are forbidden`);
      assert.ok(!globalAddresses.has(address),`${bookId}: duplicate target address ${address}`);
      globalAddresses.add(address);
      let observed,state;
      try{
        observed=config.source(update,target);
        state=target.expectedBefore!==null&&target.expectedBefore!==undefined&&isDeepStrictEqual(normalizedSurface(observed),normalizedSurface(target.expectedBefore))
          ?'matched'
          :isDeepStrictEqual(normalizedSurface(observed),normalizedSurface(target.effectiveAfter))?'already-effective':'invalid';
        assert.notEqual(state,'invalid',`${bookId}/${update.id}: source target does not equal expectedBefore or effectiveAfter`);
      }catch(error){
        if(target.unavailableReason&&['base-source-unavailable','source-field-unavailable'].includes(target.unavailableReason.category)){
          state='unavailable';
          assert.ok(target.unavailableReason.detail,`${bookId}/${update.id}: unavailable reason needs detail`);
        }else throw error;
      }
      states.push(state);
      assert.deepStrictEqual(normalizedSurface(surfaceObserved(bookId,target,desktop)),normalizedSurface(target.effectiveAfter),`${bookId}/${update.id}: desktop target mismatch`);
      const mobile=mobileFile(bookId,target);
      assert.ok(fs.existsSync(path.join(root,mobile)),`${bookId}/${update.id}: missing ${mobile}`);
      const mobileStub=read(mobile),routeTarget=attr(mobileStub,'data-canonical-target');
      assert.equal(attr(mobileStub,'data-canonical-reader'),'../reader.html',`${bookId}/${update.id}: mobile route lost canonical reader`);
      assert.match(mobileStub,new RegExp(`mobile-route-redirect\\.js\\?v=${runtimeVersions.shared.mobileRouteRedirect}`),`${bookId}/${update.id}: mobile route uses stale redirect runtime`);
      assert.ok(routeTarget&&(generated.targets[routeTarget]||generated.targets[generated.aliases?.[routeTarget]]),`${bookId}/${update.id}: mobile target ${routeTarget||'(missing)'} is absent from generated content`);
      verifyGlossary(bookId,update,target);
    }
    const state=states.reduce((worst,current)=>ranks[current]>ranks[worst]?current:worst,'already-effective');
    assert.notEqual(state,'invalid',`${bookId}/${update.id}: invalid update`);
    if(state==='unavailable'){
      assert.equal(config.complete,false,`${bookId}/${update.id}: unavailable targets block complete books`);
      warnings++;
    }
  }
}

console.log(`Official update QA passed: ${updateCount} updates, ${targetCount} exact targets, ${warnings} unavailable warnings.`);
