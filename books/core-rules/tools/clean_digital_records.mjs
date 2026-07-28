import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const file=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../content/core-rules.digital-11e.json');
const data=JSON.parse(fs.readFileSync(file,'utf8'));

const byCode=new Map(data.records.map(record=>[record.code,record]));
const addChild=(code,title,text,kind='digital-clarification')=>{
  if(byCode.has(code))return;
  const record={code,title,text,kind};
  data.records.push(record);
  byCode.set(code,record);
};
const removeSection=(code,start,end='')=>{
  const record=byCode.get(code);
  if(!record)return;
  const from=record.text.indexOf(start);
  if(from<0)return;
  const to=end?record.text.indexOf(end,from+start.length):-1;
  record.text=(record.text.slice(0,from)+(to>=0?record.text.slice(to):'')).replace(/\n{3,}/g,'\n\n').trim();
};

addChild('03.04.01','What Is Engagement','While opposing models are within each other\u2019s engagement range, they are able to fight in vicious melee, so unless they are seeking to make melee attacks, models should keep out of their foes\u2019 reach.');
addChild('19.04.01','Only In Death Does Duty End','Leader and support units often have abilities that make the models they are leading more powerful. In the same way, some bodyguard units\u2019 abilities can enhance the power of those leading them. The rules in Abilities in Attached Units mean that once the models conferring such effects are destroyed, that attached unit does not continue to benefit from them. Should those models later be revived, however, those abilities will once more apply to their attached unit.');

const modifiers=byCode.get('02.02.01');
if(modifiers){
  modifiers.title='Modifiers';
  if(!modifiers.text.startsWith('WHAT ARE MODIFIERS?'))modifiers.text=`WHAT ARE MODIFIERS?\nMany rules in the game modify a value, characteristic or roll elsewhere in the game. A rule that does so is known as a modifier. A value that has been changed is a modified rule (for example, a modified characteristic, modified roll or modified value).\nOne of the most common ways for modifiers to be presented is as +1 or -1 to a characteristic, roll or value.\nIf a rule has +1 to a characteristic, it improves it by the value after the \u2018+\u2019 symbol. For example, \u2018This weapon has +1 AP\u2019 would improve an AP characteristic of -2 to -3.\nIf a rule has -1 to a characteristic, it worsens it by the value after the \u2018-\u2019 symbol. For example, \u2018This unit has -1 Sv\u2019 would worsen a Sv characteristic of 3+ to 4+.\n\n${modifiers.text}`;
  modifiers.text=modifiers.text.replaceAll('1""','1"');
}
const torrentRestriction=byCode.get('24.37.01');
if(torrentRestriction)torrentRestriction.title='Torrent Restrictions';

removeSection('03.02','IF YOU CANNOT SET UP A UNIT');
removeSection('03.03','WHAT IS COHERENCY?','COHERENCY\n');
removeSection('03.04','WHAT IS ENGAGEMENT?','ENGAGEMENT\n');
removeSection('09.02','SELECTING UNITS TO MOVE','SEE ALSO');
removeSection('11.02','FAILED CHARGES','SEE ALSO');
removeSection('19.04','ONLY IN DEATH DOES DUTY END');

const strength=byCode.get('01.02.01');
if(strength)strength.text=strength.text.replace(/UNIT STRENGTH\nSTARTING STRENGTH OF 1STARTING STRENGTH OF 2 OR MORE\nBELOW STARTING STRENGTHModel\u2019s remaining wounds are less than its W characteristic\.Number of remaining models in the unit is less than its starting strength\.\nAT HALF-STRENGTHModel\u2019s remaining wounds are half of its W characteristic\.Number of remaining models in the unit is half of its starting strength\.\nBELOW HALF-STRENGTHModel\u2019s remaining wounds are less than half of its W characteristic\.Number of remaining models in the unit is less than half of its starting strength\./,'UNIT STRENGTH\nBelow Starting Strength\nStarting strength of 1: The model\u2019s remaining wounds are less than its W characteristic.\nStarting strength of 2 or more: The number of remaining models is less than the unit\u2019s starting strength.\nAt Half-Strength\nStarting strength of 1: The model\u2019s remaining wounds are half of its W characteristic.\nStarting strength of 2 or more: The number of remaining models is half of the unit\u2019s starting strength.\nBelow Half-Strength\nStarting strength of 1: The model\u2019s remaining wounds are less than half of its W characteristic.\nStarting strength of 2 or more: The number of remaining models is less than half of the unit\u2019s starting strength.');

const attached=byCode.get('19.04');
if(attached)attached.text=attached.text.replace(/ABILITIES IN ATTACHED UNITS\nSOURCE OF ABILITY\/RULEAPPLIES TO THE ATTACHED UNIT UNTIL\nLeader\/support unitThe last model in that leader\/support unit is destroyed\.\*\nBodyguard unit \(for example from a datasheet ability\)The last model in that bodyguard unit is destroyed\.\nA specific model \(for example the bearer of an enhancement or an item of wargear\)That model is destroyed\./,'ABILITIES IN ATTACHED UNITS\nLeader/support unit: Applies until the last model in that leader/support unit is destroyed.*\nBodyguard unit (for example, from a datasheet ability): Applies until the last model in that bodyguard unit is destroyed.\nA specific model (for example, the bearer of an enhancement or an item of wargear): Applies until that model is destroyed.');

const battleSize=byCode.get('25.03');
if(battleSize)battleSize.text=battleSize.text.replace(/BATTLE SIZEPoints TotalDetachment Points \(DP\)Enhancement LimitUnit Limit\*\nINCURSION1000222\nSTRIKE FORCE2000343/,'BATTLE SIZE\nIncursion: 1000 points; 2 Detachment Points; Enhancement limit 2; Unit limit 2.\nStrike Force: 2000 points; 3 Detachment Points; Enhancement limit 4; Unit limit 3.');

for(const record of data.records){
  let text=record.text||'';
  for(const other of data.records){
    if(other.code===record.code||!other.text)continue;
    const child=other.code.startsWith(record.code+'.');
    const variants=[
      `${other.code} ${other.title}\n${other.text}`,
      `${other.title} ${other.code}${other.text}`,
      `${other.title} ${other.code}\n${other.text}`,
      `${other.title}\n${other.text}`,
      `${other.title.toUpperCase()}\n${other.text}`
    ];
    for(const block of variants)text=text.replaceAll(block,'');
    if(record.code.split('.').length===2&&other.code.split('.').length===2){
      const marker=`\n${other.title} ${other.code}`;
      const index=text.indexOf(marker);
      if(index>=0&&text.slice(index+marker.length).replace(/^\s*/,'').startsWith(other.text.slice(0,80)))text=text.slice(0,index);
    }
  }
  const lines=text.replace(/\n{3,}/g,'\n\n').trim().split('\n');
  record.text=lines.filter((line,index)=>!index||line.trim().toLowerCase()!==lines[index-1].trim().toLowerCase()).join('\n');
}

data.records.sort((a,b)=>{
  const left=a.code.split('.').map(Number),right=b.code.split('.').map(Number);
  for(let index=0;index<Math.max(left.length,right.length);index++){
    const difference=(left[index]??-1)-(right[index]??-1);
    if(difference)return difference;
  }
  return 0;
});

fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
