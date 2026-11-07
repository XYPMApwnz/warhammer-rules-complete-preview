/** Owner requirements and source-preserving negative controls, without gameplay. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {playerImportCopy,warlordDisplay,enhancementTextParts,sourceRuleCaption} from './cosmetics.mjs';
const controls=[];
const check=(name,fn)=>{fn();controls.push(name);};
check('warlord is a roster-wide display decision',()=>{
  const yes={instanceId:'leader',warlord:true},other={instanceId:'unit',warlord:null};
  const state={warlordInstanceId:'leader',units:[yes,other]},before=JSON.stringify(state);
  assert.equal(warlordDisplay(yes,state),'Yes');assert.equal(warlordDisplay(other,state),'No');
  assert.equal(warlordDisplay(other,{warlordInstanceId:null,units:[other]}),'Not set');
  assert.equal(warlordDisplay({...other,warlord:false},{warlordInstanceId:null,units:[]}),'Not set');
  assert.equal(warlordDisplay({warlord:null},undefined),'Not set');
  assert.equal(JSON.stringify(state),before);
});
check('duplicate heading removed, exact restriction and weapon text retained',()=>{
  assert.deepEqual(enhancementTextParts('Relentless Advance','- Relentless Advance\nGRAVIS model only. This unit has Scouts 5".'),
    {body:'This unit has Scouts 5".',restriction:'GRAVIS model only.',upgrade:false});
  assert.deepEqual(enhancementTextParts('Deathwing Assault','- Deathwing Assault\nDEATHWING model with the Deep Strike ability only. Keep this text.'),
    {body:'Keep this text.',restriction:'DEATHWING model with the Deep Strike ability only.',upgrade:false});
  assert.deepEqual(enhancementTextParts('Test','- TestUPGRADE\nINFANTRY unit only (excluding EPIC HERO units). Keep this text.'),
    {body:'Keep this text.',restriction:'INFANTRY unit only (excluding EPIC HERO units).',upgrade:true});
});
check('genuine bullet paragraphs are not a redundant rule heading',()=>{
  const text='- Friendly units re-roll hit rolls of 1.\n- Enemy attacks have -1 to hit rolls.';
  assert.equal(enhancementTextParts('Prey on the Weak',text).body,text);
  assert.equal(enhancementTextParts('Different title','- Actual title\nKeep this text.').body,'- Actual title\nKeep this text.');
  const unchanged='HERETIC ASTARTES model only. Add 1 to Charge rolls made for the bearer’s unit.';
  assert.deepEqual(enhancementTextParts('Empyric Symbiote',unchanged),{body:unchanged,restriction:null,upgrade:false});
});
check('only the exact uniquely bound named source supplies a caption',()=>{
  const card={kind:'DATASHEET_SECTION',title:'ABILITIES',fields:[{source:{path:'/blocks/1/text'},value:'Daemonic Icon: Models have Leadership 6+.'}]};
  const origin={canonicalRuleId:'section',label:'ABILITIES',sourceFields:[['blocks',1,'text']]},cards=new Map([['section',card]]);
  assert.equal(sourceRuleCaption(origin,cards),'Daemonic Icon');
  assert.equal(sourceRuleCaption({...origin,sourceFields:[['blocks',0,'text']]},cards),'ABILITIES');
  assert.equal(sourceRuleCaption(origin,new Map([['section',{...card,fields:[...card.fields,...card.fields]}]])),'ABILITIES');
  assert.equal(sourceRuleCaption(origin,new Map([['section',{...card,fields:[{source:{path:'/blocks/1/text'},value:'No named rule in this field.'}]}]])),'ABILITIES');
});
const counts={};
const keywordCaptions=[
 ['adeptus-mechanicus','datasheet-archaeopter-fusilave:section:1',1,'Chaff Launcher'],
 ['adeptus-mechanicus','datasheet-archaeopter-stratoraptor:section:1',1,'Chaff Launcher'],
 ['adeptus-mechanicus','datasheet-archaeopter-transvector:section:1',1,'Chaff Launcher'],
 ['adeptus-mechanicus','datasheet-cybernetica-datasmith:section:1',1,'Data-severed'],
 ['tau-empire','datasheet-ethereal:section:1',2,'Hover Drone'],
 ['tau-empire','datasheet-tiger-shark:section:1',1,'Transport Bay']
];
for(const book of ['adeptus-mechanicus','blood-angels','dark-angels','chaos-space-marines','death-guard','emperors-children','space-marines','tau-empire','tyranids']){
 const payload=JSON.parse(fs.readFileSync(new URL(`../../${book}/v2/generated/app-presentation.json`,import.meta.url),'utf8'));
 const notices=payload.rulePresentationLimitations?.importLimitations||[];
 const cards=new Map(payload.cards.map(card=>[card.id,card]));
 for(const [,id,index,expected]of keywordCaptions.filter(row=>row[0]===book))check(book+' '+id+' exact keyword source caption',()=>{
  assert.equal(sourceRuleCaption({canonicalRuleId:id,label:'ABILITIES',sourceFields:[['blocks',index,'text']]},cards),expected);
 });
 check(book+' import notices retain player warnings without diagnostic jargon',()=>{
  const before=JSON.stringify(notices);
  for(const row of notices)assert.doesNotMatch(playerImportCopy(row.title)+' '+playerImportCopy(row.message),/NOT_PROVEN|\bMFM\b|source OR|constructed-input|canonical|binding/i);
  assert.equal(JSON.stringify(notices),before);
 });
 if(['space-marines','blood-angels','dark-angels'].includes(book)){
  const enhancements=payload.cards.filter(c=>c.kind==='ENHANCEMENT');let duplicates=0,restrictions=0;
  for(const card of enhancements){
   const field=card.fields.find(f=>(f.presentationPath??f.source?.path)==='/text');assert(field);
   const parts=enhancementTextParts(card.title,field.value);
   if(field.value.startsWith('- '+card.title+'\n')||field.value.startsWith('- '+card.title+'UPGRADE\n'))duplicates++;
   if(parts.restriction)restrictions++;
   assert(!parts.body.startsWith('- '+card.title+'\n'),'Repeated title survives: '+card.id);
   assert(parts.restriction,'An Enhancement restriction was lost: '+card.id);
  }
  counts[book]={enhancements:enhancements.length,duplicateHeadings:duplicates,separateRestrictions:restrictions};
 }
}
console.log(JSON.stringify({status:'PASS',controls,counts}));
