import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {recordText} from '../content/record-content.mjs';

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
  if(!record||record.content)return;
  const from=recordText(record).indexOf(start);
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
const youClarification=byCode.get('01.01.01');
if(youClarification)youClarification.presentation='inline';

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
  if(record.content)continue;
  let text=recordText(record);
  for(const other of data.records){
    const otherText=recordText(other);
    if(other.code===record.code||!otherText)continue;
    const child=other.code.startsWith(record.code+'.');
    const variants=[
      `${other.code} ${other.title}\n${otherText}`,
      `${other.title} ${other.code}${otherText}`,
      `${other.title} ${other.code}\n${otherText}`,
      `${other.title}\n${otherText}`,
      `${other.title.toUpperCase()}\n${otherText}`
    ];
    for(const block of variants)text=text.replaceAll(block,'');
    if(record.code.split('.').length===2&&other.code.split('.').length===2){
      const marker=`\n${other.title} ${other.code}`;
      const index=text.indexOf(marker);
      if(index>=0&&text.slice(index+marker.length).replace(/^\s*/,'').startsWith(otherText.slice(0,80)))text=text.slice(0,index);
    }
  }
  const lines=text.replace(/\n{3,}/g,'\n\n').trim().split('\n');
  record.text=lines.filter((line,index)=>!index||line.trim().toLowerCase()!==lines[index-1].trim().toLowerCase()).join('\n');
}

const lines=record=>recordText(record).split('\n').map(line=>line.trim()).filter(Boolean);
const paragraph=text=>({type:'paragraph',text});
const heading=text=>({type:'heading',text});
const list=items=>({type:'list',items});

const strengthLines=lines(strength);
if(strength&&!strength.content&&strengthLines.includes('UNIT STRENGTH')){
  strength.content=[
    ...strengthLines.slice(0,2).map(paragraph),
    heading('UNIT STRENGTH'),
    {type:'comparison-table',columns:['Starting Strength of 1','Starting Strength of 2 or more'],rows:[
      {label:'Below Starting Strength',cells:[strengthLines[4].replace(/^Starting strength of 1:\s*/i,''),strengthLines[5].replace(/^Starting strength of 2 or more:\s*/i,'')]},
      {label:'At Half-Strength',cells:[strengthLines[7].replace(/^Starting strength of 1:\s*/i,''),strengthLines[8].replace(/^Starting strength of 2 or more:\s*/i,'')]},
      {label:'Below Half-Strength',cells:[strengthLines[10].replace(/^Starting strength of 1:\s*/i,''),strengthLines[11].replace(/^Starting strength of 2 or more:\s*/i,'')]}
    ]},
    paragraph(strengthLines[12]),
    heading(strengthLines[13]),
    paragraph(strengthLines[14])
  ];
  delete strength.text;
}

const wound=byCode.get('05.02'),woundLines=lines(wound);
if(wound&&!wound.content){
  wound.content=[
    paragraph(woundLines[0]),
    list(woundLines.slice(1,4).map(line=>line.replace(/^•\s*/,''))),
    heading('ATTACK’S STRENGTH VS TARGET’S TOUGHNESS'),
    {type:'matrix',caption:'Required result',rows:woundLines.slice(5,11).map(line=>{
      const match=line.replace(/^•\s*/,'').match(/^(.*?):\s*([^:]+)$/);
      return {condition:match?.[1]||line,result:match?.[2]||''};
    })},
    heading(woundLines[11]),paragraph(woundLines[12]),{type:'see-also',items:[woundLines[14].replace(/^•\s*/,'')]}
  ];
  delete wound.text;
}

const saveRolls=byCode.get('05.03'),saveLines=lines(saveRolls);
if(saveRolls&&!saveRolls.content){
  const stepIndexes=saveLines.map((line,index)=>/^• (Create Groups|Allocation Order|Make Save Rolls):/.test(line)?index:-1).filter(index=>index>=0);
  saveRolls.content=[paragraph(saveLines[0]),{type:'procedure',steps:stepIndexes.map((start,index)=>{
    const end=stepIndexes[index+1]??saveLines.length;
    const [label,text]=saveLines[start].replace(/^•\s*/, '').split(/:\s*(.*)/s);
    return {label,text,items:saveLines.slice(start+1,end).map(line=>line.replace(/^•\s*/,''))};
  })}];
  delete saveRolls.text;
}

const attachedLines=lines(attached);
if(attached&&!attached.content&&attachedLines.includes('ABILITIES IN ATTACHED UNITS')){
  attached.content=[
    ...attachedLines.slice(0,2).map(paragraph),heading('ABILITIES IN ATTACHED UNITS'),
    {type:'comparison-table',columns:['Source of ability/rule','Applies to the attached unit until'],rows:attachedLines.slice(3,6).map(line=>{
      const [label,cell]=line.split(/:\s*(.*)/s);return {label,cells:[cell.replace(/^Applies until\s+/i,'')]};
    })},
    paragraph(attachedLines[6]),paragraph(attachedLines[7]),{type:'see-also',items:[attachedLines[9].replace(/^•\s*/,'')]}
  ];
  delete attached.text;
}

const headingRules=new Map([
  ['03.03',['REGAINING COHERENCY','COHERENCY']],
  ['16.01',['WHERE TO FIND ACTIONS']]
]);
for(const [code,headings] of headingRules){
  const record=byCode.get(code);
  if(!record||record.content)continue;
  record.content=lines(record).map(line=>headings.includes(line)?heading(line):/^•\s*/.test(line)?list([line.replace(/^•\s*/,'')]):paragraph(line));
  delete record.text;
}

const namedStageCodes=new Set(['09.04','09.05','09.06','09.07','10.04','10.05','10.06','10.07','11.04','12.03','12.05','12.06','12.08','15.09','18.04','18.05','20.04','21.02','24.32']);
const stagePattern=/^(MAXIMUM DISTANCE|SET-UP DISTANCE|ELIGIBLE IF|EFFECT|BEFORE MOVING|WHILE MOVING|AFTER MOVING|WHILE SHOOTING|AFTER SHOOTING):\s*(.*)$/;
const trailingHeadings=new Map([['10.07','INDIRECT FIRE'],['12.06','OVERRUN FIGHTS'],['18.04','RAPID DISEMBARK']]);
for(const code of namedStageCodes){
  const record=byCode.get(code);
  if(!record||record.content)continue;
  const sourceLines=lines(record),trailing=trailingHeadings.get(code),trailingIndex=trailing?sourceLines.indexOf(trailing):-1;
  const stageLines=trailingIndex>=0?sourceLines.slice(0,trailingIndex):sourceLines;
  const stages=[];
  for(const line of stageLines){
    const match=line.match(stagePattern);
    if(match){stages.push({label:match[1],text:match[2],items:[]});continue;}
    const current=stages.at(-1);
    if(!current)continue;
    if(/^•\s*/.test(line))current.items.push(line.replace(/^•\s*/,''));
    else if(current.items.length)current.items[current.items.length-1]+=` ${line}`;
    else current.text=`${current.text} ${line}`.trim();
  }
  record.content=[{type:'named-stages',stages}];
  if(trailingIndex>=0)record.content.push(heading(trailing),...sourceLines.slice(trailingIndex+1).map(paragraph));
  delete record.text;
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
