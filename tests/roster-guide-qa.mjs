import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const shared=fs.readFileSync(path.join(root,'books/shared/roster-entities.js'),'utf8');
const context={};vm.runInNewContext(shared,context,{filename:'roster-entities.js'});
const entities=context.WHRosterEntities;
const glossaryContext={};glossaryContext.window=glossaryContext;
vm.runInNewContext(fs.readFileSync(path.join(root,'glossary/generated/glossary.en.js'),'utf8'),glossaryContext,{filename:'glossary.en.js'});
const failures=[];
const assert=(ok,message)=>{if(!ok)failures.push(message);};
const walk=(value,visit)=>{
  if(Array.isArray(value))return value.forEach(item=>walk(item,visit));
  if(!value||typeof value!=='object')return;
  visit(value);Object.values(value).forEach(item=>walk(item,visit));
};

const supported=fs.readdirSync(path.join(root,'books'),{withFileTypes:true})
  .filter(entry=>entry.isDirectory()&&fs.existsSync(path.join(root,'books',entry.name,'scripts','roster-filter.js')))
  .map(entry=>entry.name);

for(const bookId of supported){
  const bookRoot=path.join(root,'books',bookId);
  const dataPath=path.join(bookRoot,'content',`${bookId}-rules.en.json`);
  const readerPath=path.join(bookRoot,'reader.html');
  const relatedPath=path.join(bookRoot,'mobile','related-rules.inc');
  assert(fs.existsSync(dataPath),`${bookId}: missing canonical roster data`);
  assert(fs.existsSync(readerPath),`${bookId}: missing roster reader`);
  assert(fs.existsSync(relatedPath),`${bookId}: missing related rules inventory`);
  if(!fs.existsSync(dataPath)||!fs.existsSync(readerPath)||!fs.existsSync(relatedPath))continue;

  const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
  const reader=fs.readFileSync(readerPath,'utf8');
  const related=fs.readFileSync(relatedPath,'utf8');
  const inventory={units:[],weapons:[],abilities:[],detachments:[],enhancements:[],stratagems:[],coreStratagems:[]};
  for(const section of data.sections||[]){
    if(section.kind==='unit')inventory.units.push(section);
    if(section.id?.startsWith('detachment-')){
      inventory.detachments.push(section);
      (section.subsections||[]).filter(part=>part.title==='Stratagems').forEach(part=>inventory.stratagems.push(...(part.blocks||[])));
    }
  }
  walk(data.sections,node=>{
    if(node.type==='weapon')inventory.weapons.push(node);
    if(node.type==='ability')inventory.abilities.push(node);
    if(node.type==='enhancement')inventory.enhancements.push(node);
  });
  inventory.coreStratagems=[...related.matchAll(/id="core-stratagem-[^"]+"/g)];

  inventory.units.forEach(unit=>assert(reader.includes(`id="${unit.id}"`),`${bookId}: unit ${unit.id} is absent from Roster Guide`));
  inventory.weapons.forEach(weapon=>{
    assert(reader.includes(`data-term="${weapon.termId}"`),`${bookId}: weapon ${weapon.name} is absent from Roster Guide`);
    const family=entities.weaponFamily(weapon.name);
    assert(entities.loadoutIncludesProfile([family],weapon.name),`${bookId}: loadout ${family} drops profile ${weapon.name}`);
  });
  inventory.abilities.filter(ability=>ability.id).forEach(ability=>assert(reader.includes(`id="${ability.id}"`),`${bookId}: ability ${ability.id} is absent from Roster Guide`));
  inventory.detachments.forEach(detachment=>assert(reader.includes(`id="${detachment.id}"`),`${bookId}: detachment ${detachment.id} is absent from Roster Guide`));
  [...inventory.enhancements,...inventory.stratagems].filter(entity=>entity.id).forEach(entity=>assert(related.includes(`id="${entity.id}"`),`${bookId}: ${entity.type} ${entity.id} is absent from related rules`));
  assert(inventory.coreStratagems.length>0,`${bookId}: Core Stratagems are absent from related rules`);
  console.log(`PASS  ${bookId}: ${inventory.units.length} units, ${inventory.weapons.length} weapon profiles, ${inventory.abilities.length} abilities, ${inventory.detachments.length} detachments, ${inventory.enhancements.length} enhancements, ${inventory.stratagems.length} faction + ${inventory.coreStratagems.length} core stratagems`);
}

assert(supported.length>0,'No books declare Roster Guide support');
assert(entities.weaponFamily('Plasma gun – supercharge')==='plasma gun','Plasma gun profile family is not canonical');
assert(entities.loadoutIncludesProfile(['Plasma gun'],'Plasma gun – standard'),'Plasma gun standard profile is lost');
assert(entities.loadoutIncludesProfile(['Plasma gun'],'Plasma gun – supercharge'),'Plasma gun supercharge profile is lost');
const plasmaProfiles=entities.weaponGroups(glossaryContext.WH40K_GLOSSARY.forBook('death-guard'),'unit-plague-marines').get('plasma gun')||[];
assert(plasmaProfiles.length===2,'Plasma gun does not expose both standard and supercharge profiles');

const relatedContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'books/death-guard/scripts/related-rules.js'),'utf8'),relatedContext,{filename:'related-rules.js'});
const granted=relatedContext.window.DGRelatedRules.grantedKeywords;
assert(granted('poxwalkers',['shamblerot-vectorium']).some(item=>item.id==='keyword-battleline'),'Shamblerot Vectorium does not grant BATTLELINE to Poxwalkers');
assert(!granted('poxwalkers',[]).length,'Poxwalkers receive a Detachment keyword without that Detachment');
assert(granted('myphitic-blight-hauler',['contagion-engines']).some(item=>item.id==='keyword-contagion-engine'),'Contagion Engines does not grant CONTAGION ENGINE to eligible units');
assert(!granted('plague-marines',['contagion-engines']).length,'Contagion Engines grants its keyword to an ineligible unit');

if(failures.length){failures.forEach(message=>console.error(`FAIL  ${message}`));process.exitCode=1;}
else console.log(`Roster Guide contract passed for ${supported.length} book(s).`);
