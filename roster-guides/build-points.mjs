import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

const deathGuard=read('books/death-guard/content/death-guard-rules.en.json');
const dgUnits={};
for(const unit of deathGuard.sections.filter(section=>section.kind==='unit')){
  const pointsBlock=unit.blocks.find(block=>block.type==='points');
  dgUnits[normalize(unit.title)]={title:unit.title,points:unit.points,wargear:pointsBlock?.wargear||[]};
}
const dgEnhancements={};
for(const section of deathGuard.sections){
  for(const subsection of section.subsections||[]){
    for(const enhancement of (subsection.blocks||[]).filter(block=>block.type==='enhancement')){
      const match=enhancement.title.match(/^(.*?)\s+[-–—]\s+(\d+)\s*pts$/i);
      if(!match)throw new Error(`Enhancement points missing: ${enhancement.title}`);
      const effects={
        'daemon weapon of nurgle':'critical-hit-5',
        'furnace of plagues':'furnace',
        'arch contaminator':'conditional',
        'revolting regeneration':'persistent',
        'eye of affliction':'conditional',
        'bilemaw blight':'plague-wind-range-12',
        'shriekworm familiar':'persistent',
        'tendrilous emissions':'conditional',
        'final ingredient':'once',
        'visions of virulence':'conditional',
        'needle of nurgle':'narthecium-d3',
        'cornucophagus':'setup',
        'beckoning blight':'persistent',
        'fell harvester':'melee-a-2',
        'entropic knell':'conditional',
        'tome of bounteous blessings':'conditional',
        'witherbone pipes':'attachment',
        'lord of the walking pox':'attachment',
        'sorrowsyphon':'attachment',
        'talisman of burgeoning':'attachment',
        'face of death':'persistent',
        'vile vigour':'attachment',
        'warprot talisman':'once',
        'helm of the fly king':'attachment',
        'parasitic woe reaper':'persistent',
        'lancet of the worldsore':'mobile',
        'insectile murmuration':'conditional',
        'plagueveil':'persistent',
        'rejuvenating swarm':'conditional',
        'host of the hybridised pox':'once'
      };
      dgEnhancements[normalize(match[1])]={title:match[1],value:Number(match[2]),text:enhancement.text,effect:effects[normalize(match[1])]||''};
    }
  }
}

const mechanicus=read('books/adeptus-mechanicus/content/adeptus-mechanicus-codex-datasheets.en.json');
const mechanicusUnits={};
for(const unit of mechanicus.datasheets){
  const values=(unit.points||[]).map(Number).filter(Number.isFinite);
  if(values.length===1)mechanicusUnits[normalize(unit.title)]={title:unit.title,points:[{label:'',value:values[0]}],wargear:[]};
}

const catalog={
  'death guard':{units:dgUnits,enhancements:dgEnhancements},
  'adeptus mechanicus':{units:mechanicusUnits,enhancements:{}}
};
fs.writeFileSync(path.join(root,'roster-guides','points-data.js'),`window.WH_POINTS_CATALOG=Object.freeze(${JSON.stringify(catalog)});\n`);
console.log(`Points catalog: ${Object.keys(dgUnits).length} Death Guard units, ${Object.keys(dgEnhancements).length} Enhancements, ${Object.keys(mechanicusUnits).length} Adeptus Mechanicus units.`);
