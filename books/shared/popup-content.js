(function(){
  'use strict';

  const splitParts=value=>String(value||'')
    .replace(/\u0412(?=\u00b7)/g,'')
    .split(/\s*[\u00b7\u2022]\s*/)
    .map(part=>part.trim())
    .filter(Boolean);

  const normalize=value=>String(value||'')
    .replace(/[\[\]]/g,'')
    .replace(/[\u2018\u2019]/g,"'")
    .replace(/\s+/g,' ')
    .trim()
    .toUpperCase();

  function findAbilityTerm(label,terms){
    const wanted=normalize(label);
    const base=wanted.startsWith('ANTI-')?'ANTI':wanted.replace(/\s+\d+\+?$/,'');
    return Object.entries(terms||{}).find(([,term])=>{
      const title=normalize(term.title);
      return title===wanted||title===base;
    })?.[0]||'';
  }

  function parseWeapon(summary){
    const parts=splitParts(summary);
    if(parts.length<6)return null;
    const values={};
    let mode='';
    let abilities=[];

    parts.forEach((part,index)=>{
      if(index===0&&/^(Ranged|Melee)$/i.test(part)){mode=part;return;}
      if(index===1&&mode&&!/^(?:Range|A|BS|WS|S|AP|D|Abilities?)\s+/i.test(part)){values.Range=part;return;}
      const match=part.match(/^(Range|A|BS|WS|S|AP|D|Abilities?)\s+(.+)$/i);
      if(!match)return;
      const label=match[1];
      const value=match[2].trim();
      if(/^Abilities?$/i.test(label))abilities=value.split(/\s*,\s*/).filter(Boolean);
      else values[label==='Range'?'Range':label.toUpperCase()]=value;
    });

    const skill=values.BS?'BS':values.WS?'WS':'';
    if(!values.Range||!values.A||!skill||!values.S||!values.AP||!values.D)return null;
    if(!mode)mode=values.Range.toLowerCase()==='melee'||skill==='WS'?'Melee':'Ranged';
    return{mode,abilities,stats:[['Range',values.Range],['A',values.A],[skill,values[skill]],['S',values.S],['AP',values.AP],['D',values.D]]};
  }

  function renderWeapon(profile,terms){
    const wrap=document.createElement('div');wrap.className='popup-weapon-profile';
    const kind=document.createElement('div');kind.className='popup-profile-kind';kind.textContent=profile.mode.toUpperCase()+' WEAPON';
    const table=document.createElement('table');table.className='popup-weapon-table';table.setAttribute('aria-label',profile.mode+' weapon characteristics');
    const head=document.createElement('thead'),headRow=document.createElement('tr'),body=document.createElement('tbody'),bodyRow=document.createElement('tr');
    profile.stats.forEach(([label,value])=>{
      const th=document.createElement('th'),td=document.createElement('td');
      th.scope='col';th.textContent=label;td.textContent=value;headRow.append(th);bodyRow.append(td);
    });
    head.append(headRow);body.append(bodyRow);table.append(head,body);wrap.append(kind,table);

    if(profile.abilities.length){
      const row=document.createElement('div');row.className='popup-weapon-abilities';
      const label=document.createElement('span');label.className='popup-abilities-label';label.textContent='Abilities';
      const list=document.createElement('div');list.className='popup-ability-list';
      profile.abilities.forEach(ability=>{
        const termId=findAbilityTerm(ability,terms);
        const chip=document.createElement(termId?'button':'span');
        chip.className='popup-ability-chip';chip.textContent=ability;
        if(termId){chip.type='button';chip.dataset.term=termId;}
        list.append(chip);
      });
      row.append(label,list);wrap.append(row);
    }
    return wrap;
  }

  function renderUnit(parts){
    if(parts.length<5||!parts.every(part=>/^(M|T|Sv|W|Ld|OC|Inv)\s+/i.test(part)))return null;
    const list=document.createElement('dl');list.className='popup-stats';list.setAttribute('aria-label','Unit characteristics');
    parts.forEach(part=>{
      const [label,...value]=part.split(/\s+/),stat=document.createElement('div'),name=document.createElement('dt'),score=document.createElement('dd');
      stat.className='popup-stat';name.textContent=label;score.textContent=value.join(' ');stat.append(name,score);list.append(stat);
    });
    return list;
  }

  function render(term,terms){
    const weapon=parseWeapon(term.summary);
    if(weapon)return{node:renderWeapon(weapon,terms),classes:['popup-profile','popup-weapon']};
    const unit=renderUnit(splitParts(term.summary));
    if(unit)return{node:unit,classes:['popup-profile','popup-statline']};
    const paragraph=document.createElement('p');paragraph.textContent=term.summary;
    return{node:paragraph,classes:[]};
  }

  window.WHPopupContent=Object.freeze({parseWeapon,render});
}());
