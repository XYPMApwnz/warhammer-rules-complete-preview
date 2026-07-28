import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(root,'../..');
const readJson=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const pack=readJson('content/tyranids-faction-pack.en.json');
const codex=readJson('content/tyranids-codex-datasheets.en.json');
const points=readJson('content/tyranids-points.en.json');
const relatedRules=readJson('content/tyranids-related-rules.en.json');
const reader=fs.readFileSync(path.join(root,'reader.html'),'utf8');
const related=fs.readFileSync(path.join(root,'mobile','related-rules.inc'),'utf8');
const context=JSON.parse(fs.readFileSync(path.join(repo,'glossary','contexts','tyranids.json'),'utf8'));

assert.equal(pack.meta.pageCount,31);
assert.equal(pack.detachments.length,4);
assert.equal(pack.detachments.flatMap(item=>item.stratagems).length,15);
assert.equal(pack.updates.length,28);
assert.equal(pack.faqs.length,14);
assert.equal(codex.audit.datasheets,50);
assert.equal(codex.audit.imperialArmour,7);
assert.equal(points.audit.enhancements,34);
assert.equal(points.units.length,57);
assert.equal(Object.keys(relatedRules.stratagems).length,15);
assert.equal(new Set(points.units.map(item=>item.id)).size,57);
for(const unit of [...codex.datasheets,...codex.imperialArmour,...codex.legends]){
  assert.ok(unit.profiles.length,`${unit.title}: missing profile`);
  assert.ok(unit.keywords.includes('Tyranids'),`${unit.title}: missing faction keyword`);
  assert.match(reader,new RegExp(`id="${unit.id}"`),`${unit.title}: missing reader anchor`);
}
for(const detachment of pack.detachments){
  assert.match(reader,new RegExp(`id="detachment-${detachment.id}"`));
  for(const stratagem of detachment.stratagems){
    assert.ok(stratagem.when&&stratagem.target&&stratagem.effect,`${stratagem.title}: incomplete card`);
    assert.match(related,new RegExp(`data-rule-id="${stratagem.id}"`));
  }
}
assert.doesNotMatch(reader,/death-guard-cover|CODEX REGISTER \/\/ XIV|Technical placeholder/);
assert.match(reader,/Reference in verification/);
assert.match(reader,/army-related-rules\.js/);
assert.match(reader,/army-book-app\.js/);
assert.ok(Object.keys(context.terms).length>=300);
assert.equal(context.terms['tyranids-detachment-rule-mindhunger'].navigation.rule,'detachment-ambush-predators');

const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(repo,'books','shared','related-rules-matcher.js'),'utf8'),sandbox);
const keywords=values=>new Set(values.map(value=>value.toUpperCase()));
const decodeAttribute=value=>value.replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&#39;',"'");
const attribute=(tag,name)=>new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]||'';
const profiles=[...(reader.match(/<article class="unit-card\b[^>]*>/g)||[])].map(tag=>{
  const intrinsic=keywords(attribute(tag,'data-keywords').split('|').filter(Boolean));
  let candidates=[];
  try{candidates=JSON.parse(decodeAttribute(attribute(tag,'data-related-candidates'))).map(candidate=>({...candidate,keywords:keywords(candidate.keywords||[])}));}catch{}
  return {unitId:attribute(tag,'id'),keywords:intrinsic,intrinsicKeywords:intrinsic,candidates:candidates.length?candidates:undefined,abilities:new Set()};
});
const allStratagems=pack.detachments.flatMap(detachment=>detachment.stratagems);
for(const stratagem of allStratagems){
  const rule=relatedRules.stratagems[stratagem.id];
  assert.ok(rule,`${stratagem.title}: missing explicit eligibility`);
  assert.ok(profiles.some(profile=>sandbox.window.WHRelatedRules.matches(rule,profile)),`${stratagem.title}: no real Tyranids datasheet can satisfy its target`);
  const encoded=JSON.stringify(rule).replaceAll('&','&amp;').replaceAll('"','&quot;');
  assert.ok(related.includes(`data-rule-id="${stratagem.id}" data-eligibility="${encoded}"`),`${stratagem.title}: generated card does not use audited eligibility`);
}
const lictor={unitId:'unit-lictor',keywords:keywords(['Tyranids','Infantry','Lictor'])};
const monster={unitId:'unit-norn-emissary',keywords:keywords(['Tyranids','Monster','Norn Emissary'])};
assert.equal(sandbox.window.WHRelatedRules.matches({v:1,roles:[{side:'friendly',subject:'unit',selector:{unitIds:['unit-lictor']}}]},lictor),true);
assert.equal(sandbox.window.WHRelatedRules.matches({v:1,roles:[{side:'friendly',subject:'unit',selector:{allKeywords:['TYRANIDS','MONSTER']}}]},lictor),false);
assert.equal(sandbox.window.WHRelatedRules.matches({v:1,roles:[{side:'friendly',subject:'unit',selector:{allKeywords:['TYRANIDS','MONSTER']}}]},monster),true);
assert.equal(sandbox.window.WHRelatedRules.matches(relatedRules.stratagems['retreat-below'],lictor),true,'Retreat Below must remain available to a non-Burrower Tyranids unit');
assert.equal(sandbox.window.WHRelatedRules.matches(relatedRules.stratagems['swarming-assault'],lictor),false,'Infantry must not receive the Monster-only Swarming Assault');
assert.equal(sandbox.window.WHRelatedRules.matches(relatedRules.stratagems['swarming-assault'],monster),true,'Tyranids Monster misses Swarming Assault');
const prime=profiles.find(profile=>profile.unitId==='unit-tyranid-prime-with-lash-whip');
assert.ok(prime,'Tyranid Prime fixture is absent');
assert.equal(sandbox.window.WHRelatedRules.matches(relatedRules.stratagems['alien-physiology'],{...prime,candidates:undefined}),false,'Unattached Tyranid Prime receives a Warriors-only Stratagem');
assert.equal(sandbox.window.WHRelatedRules.matches(relatedRules.stratagems['alien-physiology'],prime),true,'Tyranid Prime attached to Warriors loses their relevant Stratagem');

console.log('Tyranids QA passed: 57 datasheets, 10 detachments, 15 official Stratagems, glossary and Related Rules contracts.');
