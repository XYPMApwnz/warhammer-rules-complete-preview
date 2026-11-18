import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {rosterBasePoints} from 'file:///E:/Warhammer/worktrees/roster-navigation-v1/books/shared/army-book-app-v2/cosmetics.mjs';
const root='E:/Warhammer/worktrees/roster-navigation-v1',base='c477d20aaa16f850b56f18aa878d6b5fb8b4057f';
const source=execFileSync('git',['show',base+':books/shared/army-book-app-v2/datasheet-v1.mjs'],{cwd:root,encoding:'utf8'});
const start=source.indexOf('    const priced=roster.points?.units?.find'),end=source.indexOf("    cost.append(el('strong','ds-instance-price'",start);
assert(start>=0&&end>start,'Exact accepted price-reader boundary');
const body=source.slice(start,end).replace(/    const cost=root\.querySelector\('\.ds-cost'\);cost\.replaceChildren\(\);cost\.dataset\.rosterPrice='';\r?\n/,'');
const accepted=new Function('roster','instanceId','cards','card','unit',body+'\nreturn actual;');
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'],rows=[];
for(const book of books){const payload=JSON.parse(fs.readFileSync(path.join(root,'books',book,'v2/generated/app-presentation.json'))),cards=new Map(payload.cards.map(card=>[card.id,card]));let checked=0,units=0;
  for(const card of payload.cards.filter(card=>card.kind==='DATASHEET')){units++;
    const bounds=(card.children||[]).map(id=>cards.get(id)).filter(card=>card.kind==='MFM_UNIT_POINTS').flatMap(card=>card.fields.filter(field=>/\/(minModels|maxModels)$/.test(field.source?.path||'')).map(field=>field.value)).filter(Number.isFinite);
    const counts=[...new Set([1,...bounds,...bounds.map(value=>value+1),...bounds.filter(value=>value>1).map(value=>value-1)])];
    for(const count of counts)for(const ordinal of [1,2,3,4])for(const native of [null,{totalPoints:123,enhancementPoints:13},{total:321,enhancementPoints:21},{basePoints:42},{totalPoints:null,basePoints:77}]){
      const state={units:Array.from({length:ordinal},(_,index)=>({instanceId:'physical-'+index,canonicalUnitId:card.id,startingStrength:count}))},unit=state.units.at(-1);
      const priced=native?{...native,unitInstanceId:unit.instanceId}:null,roster={state,points:priced?{units:[priced]}:undefined};
      assert.equal(rosterBasePoints(cards,state,unit,priced),accepted(roster,unit.instanceId,cards,card,unit),book+' '+card.id+' count '+count+' copy '+ordinal);checked++;
    }
  }rows.push({book,units,checked});
}
const report={status:'PASS',acceptedSource:base,headCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),scope:'Accepted card price-reader code vs shared reader, all nine datasheet inventories; model boundaries and neighbours, copies 1–4, five native-price states.',cases:rows.reduce((sum,row)=>sum+row.checked,0),rows};
fs.writeFileSync(new URL('../PRICE_READER_EQUIVALENCE.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
