import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCaptureSession,requireSourceToolMode,verifyFrozenSource} from './source-ingestion-contract.mjs';

const moduleDir=path.dirname(fileURLToPath(import.meta.url));
const repoRoot=path.resolve(moduleDir,'../../..');
const cutoff='2026-09-30';
const sourceUpdatedAt='2026-09-30';
const downloadsUrl='https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/';
const factions=[
  ['death-guard','Death Guard'],['adeptus-mechanicus','Adeptus Mechanicus'],['tyranids','Tyranids'],['tau-empire',"T'au Empire"],['emperors-children',"Emperor's Children"],['chaos-space-marines','Chaos Space Marines']
];
const sourceIds=['shared-mfm-v1.5-currentness',...factions.map(([slug])=>`${slug}-mfm-v1.5`)];
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase();
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const stableHash=value=>sha(Buffer.from(JSON.stringify(stable(value)),'utf8'));

async function extract(page,{legendsOnly=false}={}){
  return page.evaluate(({legendsOnly})=>{
    const clean=value=>String(value||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
    const title=value=>clean(value).replace(/[▲▼]+$/,'').trim();
    const annotation=value=>/^(UPDATED|.* UPDATED|.* REMOVED|.* CHANGED)$/.test(value);
    const integer=value=>{const matches=[...clean(value).matchAll(/\d[\d,]*/g)];return Number.parseInt(matches.at(-1)?.[0].replaceAll(',','')||'',10)};
    const spans=node=>[...node.querySelectorAll('span')].map(item=>clean(item.textContent)).filter(Boolean);
    const entries=group=>{
      const list=group.querySelector('ul');
      if(!list)return[];
      return[...list.children].map(container=>{
        const li=container.matches('li')?container:container.querySelector(':scope > li');
        if(!li)return null;
        const row=spans(li);
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
            if(!label||!cost)continue;
            if(/^\+/.test(label)){paidOptions.push({sourceLabel:label,title:clean(label.replace(/^\+\s*/,'')),value:integer(cost),sourceGroup:group.title});continue;}
            schedule.entries.push({sourceLabel:label,...modelRange(label),value:integer(cost)});
          }
          if(schedule.entries.length)pointSchedules.push(schedule);
        }else if(group.title==='WARGEAR OPTIONS'){
          for(const entry of group.entries){const [label,cost]=entry.row;if(label&&cost)paidOptions.push({sourceLabel:label,title:clean(label.replace(/^per\s+/i,'')),value:integer(cost),sourceGroup:group.title});}
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
        const title=header[0],detachmentPoints=integer(header[1]),groups=groupData(card),qualifiers=[],enhancements=[],forceDispositions=[];
        for(const group of groups){
          if(annotation(group.title))continue;
          if(!group.title&&/^(RECONNAISSANCE|DISRUPTION|PRIORITY ASSETS|PURGE THE FOE|TAKE AND HOLD)$/.test(group.rawText))forceDispositions.push(group.rawText);
          else if(/^UNIQUE:\s*/.test(group.title))qualifiers.push({kind:'UNIQUE',value:group.title.replace(/^UNIQUE:\s*/,'')});
          else if(group.title==='ENHANCEMENTS')for(const entry of group.entries){const [enhancementTitle,cost]=entry.row;if(enhancementTitle&&cost)enhancements.push({title:enhancementTitle,value:integer(cost),qualifiers:entry.metadata.map(meta=>({kind:meta.label,values:meta.values}))});}
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

const countsFor=(units,detachments)=>({
  currentUnits:units.filter(unit=>unit.status==='CURRENT').length,legendsUnits:units.filter(unit=>unit.status==='LEGENDS').length,totalPricedUnits:units.length,
  pointSchedules:units.reduce((sum,unit)=>sum+unit.pointSchedules.length,0),pointRows:units.reduce((sum,unit)=>sum+unit.pointSchedules.reduce((inner,schedule)=>inner+schedule.entries.length,0),0),
  paidOptions:units.reduce((sum,unit)=>sum+(unit.paidOptions?.length||0),0),leaderRecords:units.filter(unit=>unit.relations?.leader?.length).length,
  leaderEdges:units.reduce((sum,unit)=>sum+(unit.relations?.leader?.length||0),0),supportRecords:units.filter(unit=>unit.relations?.support?.length).length,
  supportEdges:units.reduce((sum,unit)=>sum+(unit.relations?.support?.length||0),0),detachments:detachments.length,
  enhancements:detachments.reduce((sum,detachment)=>sum+detachment.enhancements.length,0),detachmentQualifierRecords:detachments.reduce((sum,detachment)=>sum+detachment.qualifiers.length,0),
  enhancementQualifierRecords:detachments.reduce((sum,detachment)=>sum+detachment.enhancements.reduce((inner,enhancement)=>inner+enhancement.qualifiers.length,0),0)
});

async function capture(candidateDir){
  const session=createCaptureSession({repoRoot,sourceId:'supported-mfm-v1.5-capture',authority:'official-games-workshop',sourceType:'official-web-capture',candidateDir,extractorPath:'books/shared/tools/capture-current-mfm.mjs',notes:'Captures the current official MFM semantic DOM because the official surface exposes no public structured API response.'});
  const {chromium}=await import('playwright'),browser=await chromium.launch({channel:'chrome',headless:true});
  const downloads=await browser.newPage();
  await downloads.goto(downloadsUrl,{waitUntil:'networkidle',timeout:120_000});
  await session.capturePage(downloads,downloadsUrl,'warhammer-40000-downloads');
  const downloadsText=await downloads.locator('body').innerText(),downloadsHtml=await downloads.content();
  if(!/MUNITORUM FIELD MANUAL[\s\S]*UPDATED 30\/09\/2026/i.test(downloadsText))throw new Error('Official Downloads page does not confirm MFM updated 30/09/2026');
  const downloadsPath='books/shared/sources/mfm-v1.5/warhammer-40000-downloads.html';session.writeCandidate(downloadsPath,downloadsHtml);
  const observations=[];
  for(const [slug,label] of factions){
    const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),url=`https://mfm.warhammer-community.com/en/${slug}`;
    await page.goto(url,{waitUntil:'networkidle',timeout:120_000});
    if(await page.locator('#show-legends').count()&&await page.evaluate(()=>document.querySelector('#show-legends')?.checked===true)){await page.evaluate(()=>document.querySelector('[role="switch"][aria-labelledby="show-legends-label"]').click());await page.waitForTimeout(1000);}
    await session.capturePage(page,url,`${slug}-mfm-current`);
    const current=await extract(page),currentHtml=await page.content();
    if(current.version!=='v1.5')throw new Error(`${slug}: expected v1.5, got ${current.version||'<missing>'}`);
    const rawPath=`books/${slug}/sources/official-mfm-v1.5.html`;session.writeCandidate(rawPath,currentHtml);
    let legends=[],legendsHtml=null,legendsPath=null;
    if(await page.locator('#show-legends').count()){
      await page.evaluate(()=>document.querySelector('[role="switch"][aria-labelledby="show-legends-label"]').click());await page.waitForTimeout(1000);
      if(await page.evaluate(()=>document.querySelector('#show-legends')?.checked===true)){await session.capturePage(page,url,`${slug}-mfm-legends`);legends=(await extract(page,{legendsOnly:true})).units;legendsHtml=await page.content();}
    }
    if(legendsHtml){legendsPath=`books/${slug}/sources/official-mfm-v1.5-legends.html`;session.writeCandidate(legendsPath,legendsHtml);}
    const units=[...current.units,...legends],rawArtifacts=[{path:path.basename(rawPath),sha256:sha(Buffer.from(currentHtml,'utf8')),bytes:Buffer.byteLength(currentHtml,'utf8'),state:'CURRENT'}];
    if(legendsPath)rawArtifacts.push({path:path.basename(legendsPath),sha256:sha(Buffer.from(legendsHtml,'utf8')),bytes:Buffer.byteLength(legendsHtml,'utf8'),state:'LEGENDS_VISIBLE'});
    const payload={schema:'warhammer-mfm-live-capture/v1',title:'Munitorum Field Manual',edition:'Warhammer 40,000 11th Edition',factionId:slug,factionLabel:label,version:'v1.5',sourceUpdatedAt,capturedAt:cutoff,currentnessCutoff:cutoff,currentness:'CURRENT',authority:'OFFICIAL_GAMES_WORKSHOP_LIVE_MFM',url,currentnessEvidence:{downloadsUrl,downloadsUpdatedAt:sourceUpdatedAt,liveVersion:'v1.5'},rawArtifacts,sourceGroups:[...new Set(units.map(unit=>unit.sourceGroup))],counts:countsFor(units,current.detachments),units,detachments:current.detachments};
    payload.captureSha256=stableHash(payload);
    const normalizedPath=`books/${slug}/sources/official-mfm-v1.5.json`;session.writeCandidate(normalizedPath,`${JSON.stringify(payload,null,2)}\n`);
    observations.push({factionId:slug,url,version:'v1.5',counts:payload.counts,captureSha256:payload.captureSha256,normalizedArtifact:normalizedPath,rawArtifacts:[rawPath,...(legendsPath?[legendsPath]:[])]});
    await context.close();
  }
  await downloads.close();await browser.close();
  const currentness={schema:'warhammer-mfm-currentness-capture/v1',title:'Munitorum Field Manual currentness observation',edition:'Warhammer 40,000 11th Edition',version:'v1.5',sourceUpdatedAt,capturedAt:cutoff,currentnessCutoff:cutoff,currentness:'CURRENT',authority:'OFFICIAL_GAMES_WORKSHOP',downloads:{url:downloadsUrl,updatedAt:sourceUpdatedAt,rawArtifact:{path:path.basename(downloadsPath),sha256:sha(Buffer.from(downloadsHtml,'utf8')),bytes:Buffer.byteLength(downloadsHtml,'utf8')}},factions:observations};
  currentness.captureSha256=stableHash(currentness);
  session.writeCandidate('books/shared/sources/mfm-v1.5/currentness.json',`${JSON.stringify(currentness,null,2)}\n`);
  session.finalize({upstreamVersion:'v1.5'});
}

async function main(){
  const mode=requireSourceToolMode(process.argv.slice(2),{toolName:'capture-current-mfm.mjs'});
  if(mode.kind==='verify'){
    for(const sourceId of sourceIds)verifyFrozenSource(sourceId);
    console.log(`Current MFM source capture verified: ${factions.length} faction captures at v1.5 plus official currentness evidence.`);
    return;
  }
  await capture(mode.candidateDir);
}

main().catch(error=>{console.error(error);process.exit(1)});
