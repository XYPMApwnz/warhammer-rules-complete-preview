// Shared semantic DOM reader. No network or source acceptance occurs here.
export async function extract(page,{legendsOnly=false}={}){
  return page.evaluate(({legendsOnly})=>{
    const clean=value=>String(value||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
    const title=value=>clean(value).replace(/[▲▼]+$/,'').trim();
    const annotation=value=>/^(UPDATED|.* UPDATED|.* REMOVED|.* CHANGED)$/.test(value);
    const integer=(value,suffix='pts')=>{
      const text=clean(value),match=text.match(suffix==='DP'?/^(\d+|\d{1,3}(?:,\d{3})+)DP$/:/^(\d+|\d{1,3}(?:,\d{3})+) pts$/);
      if(!match)throw new Error(`Invalid MFM numeric cell: ${text||'<missing>'}`);
      const number=Number(match[1].replaceAll(',',''));
      if(!Number.isSafeInteger(number)||number<0)throw new Error(`Invalid MFM numeric value: ${text}`);
      return number;
    };
    const spans=node=>[...node.querySelectorAll('span')].map(item=>clean(item.textContent)).filter(Boolean);
    const entries=group=>{
      const list=group.querySelector('ul');
      if(!list){
        const heading=clean(group.firstElementChild?.textContent);
        if(/^YOUR .*UNIT.* COSTS?$/.test(heading)||['WARGEAR OPTIONS','ENHANCEMENTS'].includes(heading))throw new Error(`MFM numeric list missing: ${heading}`);
        return[];
      }
      if(!list.children.length)throw new Error('MFM numeric list is empty');
      return[...list.children].map(container=>{
        const li=container.matches('li')?container:container.querySelector(':scope > li');
        if(!li)throw new Error('MFM numeric row is missing its list item');
        const row=spans(li);
        if(row.length!==2||!row[0]||!row[1])throw new Error(`Incomplete MFM numeric row: ${clean(li.textContent)||'<empty>'}`);
        const metadata=container.matches('li')?[]:[...container.children].filter(child=>child!==li).map(child=>{
          const values=spans(child),raw=clean(child.textContent),label=(values[0]||raw).replace(/:\s*$/,'');
          const rest=values.slice(1).flatMap(value=>value.split(',').map(clean).filter(Boolean));
          return{label,values:rest.length?rest:[raw.replace(/^.*?:\s*/,'')].filter(Boolean)};
        });
        return{row,metadata};
      }).filter(Boolean);
    };
    const groupData=card=>[...card.children].slice(1).map(group=>({
      title:clean(group.firstElementChild?.textContent),
      text:clean([...group.children].slice(1).map(child=>child.textContent).join(' ')),
      rawText:clean(group.textContent),entries:entries(group)
    }));
    const copyRange=label=>{
      const value=clean(label).toUpperCase();
      if(value==='YOUR UNIT COSTS')return{};
      let match=value.match(/^YOUR (\d+)(?:ST|ND|RD|TH) TO (\d+)(?:ST|ND|RD|TH) UNITS? COSTS?$/);
      if(match)return{minCopies:Number(match[1]),maxCopies:Number(match[2])};
      match=value.match(/^YOUR (\d+)(?:ST|ND|RD|TH) UNIT COSTS$/);
      if(match)return{minCopies:Number(match[1]),maxCopies:Number(match[1])};
      match=value.match(/^YOUR (\d+)(?:ST|ND|RD|TH) \+ UNIT COSTS$/);
      if(match)return{minCopies:Number(match[1])};
      throw new Error(`Unsupported MFM copy range: ${label}`);
    };
    const modelRange=label=>{
      const value=clean(label),range=value.match(/^(\d+)\s*[-–]\s*(\d+) models?$/i),single=value.match(/^(\d+) models?$/i);
      if(range)return{minModels:Number(range[1]),maxModels:Number(range[2])};
      if(single)return{minModels:Number(single[1]),maxModels:Number(single[1])};
      throw new Error(`Unsupported MFM model range: ${label}`);
    };
    const parseUnit=(card,sourceGroup,status)=>{
      const titleValue=title(card.firstElementChild?.textContent),pointSchedules=[],paidOptions=[],relations={leader:[],support:[]};
      for(const group of groupData(card)){
        if(annotation(group.title))continue;
        if(/^YOUR .*UNIT.* COSTS?$/.test(group.title)){
          const schedule={sourceLabel:group.title,...copyRange(group.title),entries:[]};
          for(const entry of group.entries){
            const [label,cost]=entry.row;
            if(!label||!cost)throw new Error(`${titleValue}: incomplete MFM point row`);
            if(/^\+/.test(label)){paidOptions.push({sourceLabel:label,title:clean(label.replace(/^\+\s*/,'')),value:integer(cost),sourceGroup:group.title});continue;}
            schedule.entries.push({sourceLabel:label,...modelRange(label),value:integer(cost)});
          }
          if(schedule.entries.length)pointSchedules.push(schedule);
        }else if(group.title==='WARGEAR OPTIONS'){
          for(const entry of group.entries){const [label,cost]=entry.row;if(!label||!cost)throw new Error(`${titleValue}: incomplete MFM paid-option row`);paidOptions.push({sourceLabel:label,title:clean(label.replace(/^per\s+/i,'')),value:integer(cost),sourceGroup:group.title});}
        }else if(group.title==='LEADER'||group.title==='SUPPORT')relations[group.title.toLowerCase()]=group.text.split(',').map(clean).filter(Boolean);
        else throw new Error(`${titleValue}: unsupported MFM unit group ${group.title||'<empty>'}`);
      }
      if(!pointSchedules.length)throw new Error(`${titleValue}: no point schedules`);
      return{title:titleValue,sourceGroup,status,pointSchedules,...(paidOptions.length?{paidOptions}:{}),...(relations.leader.length||relations.support.length?{relations:Object.fromEntries(Object.entries(relations).filter(([,values])=>values.length))}:{})};
    };
    const headings=[...document.querySelectorAll('main h3')],units=[];
    for(const heading of headings){
      const sourceGroup=clean(heading.textContent);
      if(sourceGroup==='DETACHMENTS'||(legendsOnly&&sourceGroup!=='LEGENDS')||(!legendsOnly&&sourceGroup==='LEGENDS'))continue;
      for(const card of heading.nextElementSibling.querySelectorAll('div.flex.flex-col.space-y-1.m-1'))units.push(parseUnit(card,sourceGroup,sourceGroup==='LEGENDS'?'LEGENDS':'CURRENT'));
    }
    let detachments=[];
    if(!legendsOnly){
      const heading=headings.find(node=>clean(node.textContent)==='DETACHMENTS');
      if(!heading)throw new Error('DETACHMENTS heading missing');
      detachments=[...heading.nextElementSibling.querySelectorAll('div.flex.flex-col.space-y-1.m-1')].map(card=>{
        const header=[...card.firstElementChild.querySelectorAll(':scope > span')].map(node=>clean(node.textContent));
        const title=header[0],detachmentPoints=integer(header[1],'DP'),groups=groupData(card),qualifiers=[],enhancements=[],forceDispositions=[];
        for(const group of groups){
          if(annotation(group.title))continue;
          if(!group.title&&/^(RECONNAISSANCE|DISRUPTION|PRIORITY ASSETS|PURGE THE FOE|TAKE AND HOLD)$/.test(group.rawText))forceDispositions.push(group.rawText);
          else if(/^UNIQUE:\s*/.test(group.title))qualifiers.push({kind:'UNIQUE',value:group.title.replace(/^UNIQUE:\s*/,'')});
          else if(group.title==='ENHANCEMENTS')for(const entry of group.entries){const [enhancementTitle,cost]=entry.row;if(!enhancementTitle||!cost)throw new Error(`${title}: incomplete MFM Enhancement row`);enhancements.push({title:enhancementTitle,value:integer(cost),qualifiers:entry.metadata.map(meta=>({kind:meta.label,values:meta.values}))});}
          else throw new Error(`${title}: unsupported MFM detachment group ${group.title||group.rawText||'<empty>'}`);
        }
        if(!title||!Number.isFinite(detachmentPoints)||!forceDispositions.length)throw new Error(`Incomplete detachment ${title||'<missing>'}`);
        return{title,detachmentPoints,forceDispositions,qualifiers,enhancements};
      });
    }
    const version=clean([...document.querySelectorAll('main *')].find(node=>/^v\d+\.\d+$/.test(clean(node.textContent))&&node.children.length===0)?.textContent);
    return{version,units,detachments};
  },{legendsOnly});
}

export const countsFor=(units,detachments)=>({
  currentUnits:units.filter(unit=>unit.status==='CURRENT').length,legendsUnits:units.filter(unit=>unit.status==='LEGENDS').length,totalPricedUnits:units.length,
  pointSchedules:units.reduce((sum,unit)=>sum+unit.pointSchedules.length,0),pointRows:units.reduce((sum,unit)=>sum+unit.pointSchedules.reduce((inner,schedule)=>inner+schedule.entries.length,0),0),
  paidOptions:units.reduce((sum,unit)=>sum+(unit.paidOptions?.length||0),0),leaderRecords:units.filter(unit=>unit.relations?.leader?.length).length,
  leaderEdges:units.reduce((sum,unit)=>sum+(unit.relations?.leader?.length||0),0),supportRecords:units.filter(unit=>unit.relations?.support?.length).length,
  supportEdges:units.reduce((sum,unit)=>sum+(unit.relations?.support?.length||0),0),detachments:detachments.length,
  enhancements:detachments.reduce((sum,detachment)=>sum+detachment.enhancements.length,0),detachmentQualifierRecords:detachments.reduce((sum,detachment)=>sum+detachment.qualifiers.length,0),
  enhancementQualifierRecords:detachments.reduce((sum,detachment)=>sum+detachment.enhancements.reduce((inner,enhancement)=>inner+enhancement.qualifiers.length,0),0)
});

