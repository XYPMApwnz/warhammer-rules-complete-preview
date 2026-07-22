(function(){
  'use strict';

  const direct=(root,selector)=>Array.from(root.children).find(node=>node.matches?.(selector))||null;
  const directParts=card=>Array.from(card.children).filter(node=>node.matches?.('.unit-part'));

  function buildIdentity(head,keywordPart){
    const primary=head?.firstElementChild;
    const keywordList=keywordPart?.querySelector('.keyword-list');
    const keywords=keywordList?Array.from(keywordList.children):Array.from(keywordPart?.querySelectorAll('.term-button[data-term]')||[]);
    if(!primary||!keywords.length||primary.querySelector('.ds-identity'))return;
    const identity=document.createElement('div');
    identity.className='ds-identity';
    keywords.slice(0,5).forEach(keyword=>{
      const label=document.createElement('span');
      label.textContent=keyword.textContent.trim();
      identity.append(label);
    });
    if(identity.children.length)primary.append(identity);
  }

  function buildCost(head,pointsPanel){
    const cost=head?.querySelector('.points,.unit-status');
    if(!cost||!pointsPanel)return;
    const rows=Array.from(pointsPanel.children).filter(node=>node.classList.contains('points-row'));
    const mainRows=rows.filter(row=>!row.classList.contains('points-option'));
    const optionRows=rows.filter(row=>row.classList.contains('points-option'));
    if(!mainRows.length)return;

    cost.textContent='';
    cost.classList.add('ds-cost');
    const grid=document.createElement('div');
    grid.className='ds-cost-grid';
    mainRows.forEach(row=>{
      const cell=document.createElement('div');
      cell.className='ds-cost-cell';
      const label=document.createElement('small');
      label.textContent=row.querySelector('span')?.textContent.trim()||'Unit';
      const value=document.createElement('strong');
      value.textContent=row.querySelector('strong')?.textContent.trim()||'';
      cell.append(label,value);
      grid.append(cell);
    });
    cost.append(grid);

    if(optionRows.length){
      const extras=document.createElement('div');
      extras.className='ds-surcharges';
      optionRows.forEach(row=>{
        const item=document.createElement('span');
        const value=row.querySelector('strong')?.cloneNode(true);
        const label=row.querySelector('span')?.cloneNode(true);
        if(value)item.append(value);
        if(label)item.append(label);
        extras.append(item);
      });
      cost.append(extras);
    }
    pointsPanel.remove();
  }

  function moveProfiles(card,profile,localNav){
    if(!profile||!localNav)return;
    const profiles=Array.from(profile.children).filter(node=>node.matches('.model-profile,.statline'));
    if(!profiles.length)return;
    const strip=document.createElement('div');
    strip.className='ds-profile-strip';
    profiles.forEach(node=>strip.append(node));
    card.insertBefore(strip,localNav);
  }

  function buildColumns(card,profile,abilities,damaged){
    if(!profile||!abilities)return;
    const grid=document.createElement('div');
    grid.className='ds-main-grid';
    const arsenal=document.createElement('div');
    arsenal.className='ds-arsenal';
    const support=document.createElement('div');
    support.className='ds-support';
    card.insertBefore(grid,profile);
    grid.append(arsenal,support);
    arsenal.append(profile);
    support.append(abilities);
    if(damaged)support.append(damaged);
    const profileHeading=direct(profile,'h4');
    if(profileHeading)profileHeading.textContent='Weapons';
  }

  function enhance(card){
    if(card.classList.contains('ds-layout'))return;
    const head=direct(card,'.unit-head,.unit-header');
    const localNav=direct(card,'.local-nav');
    const parts=directParts(card);
    const profile=parts.find(part=>part.id.endsWith('-profile'))||parts[0];
    const abilities=parts.find(part=>part.id.endsWith('-abilities'))||null;
    const damaged=parts.find(part=>part.id.endsWith('-damaged'))||null;
    const keywords=parts.find(part=>part.id.endsWith('-keywords'))||null;
    const pointsPanel=profile&&direct(profile,'.points-panel');
    buildIdentity(head,keywords);
    buildCost(head,pointsPanel);
    moveProfiles(card,profile,localNav);
    buildColumns(card,profile,abilities,damaged);
    card.classList.add('ds-layout');
  }

  document.querySelectorAll('.unit-card').forEach(enhance);
}());
