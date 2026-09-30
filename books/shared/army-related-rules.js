(function(root){
  'use strict';
  const templatePromises=new Map();
  const normalize=root.WHRuleFacts.normalizeKeyword;
  const normalizeDetachment=value=>normalize(String(value||'').replace(/^detachment-/i,'').replace(/\s*\([^)]*\)\s*$/,'')).toLowerCase().replace(/\s+/g,'-');
  const resolveRosterDetachmentIds=(guide,sections=[])=>{
    const explicit=[...new Set((guide?.detachmentIds||[]).map(normalizeDetachment).filter(Boolean))];
    if(explicit.length)return explicit;
    const records=guide?.detachments?.length?guide.detachments:guide?.detachment?[guide.detachment]:[],values=records.map(item=>item?.id||item?.label||item);
    if(values.length!==1)return[];
    const wanted=normalizeDetachment(values[0]),matches=sections.filter(section=>section.dataset.detachment&&section.dataset.detachment!=='core'&&[section.dataset.detachment,section.querySelector('h2')?.textContent].some(value=>normalizeDetachment(value)===wanted));
    return matches.length===1?[matches[0].dataset.detachment]:[];
  };
  const resolveRosterEnhancements=(guide,card)=>{
    if(!Array.isArray(guide?.units)||!Array.isArray(guide?.enhancements))return null;
    const exactInstance=card?.dataset?.rosterInstance||'',canonicalId=card?.dataset?.canonicalUnitId||String(card?.id||'').replace(/--.*$/,''),candidates=exactInstance?guide.units.filter(unit=>unit.instanceId===exactInstance):guide.units.filter(unit=>(unit.datasheetId||unit.canonicalDatasheetId||unit.canonicalUnitId)===canonicalId);
    if(!exactInstance&&candidates.length!==1)return[];
    const owners=new Set(candidates.map(unit=>unit.instanceId).filter(Boolean));
    return guide.enhancements.filter(record=>owners.has(record.owner?.instanceId||record.ownerInstanceId||record.ownerUnitId));
  };
  const enhancementRuleId=record=>record?.ruleId||record?.id||'';
  const resolveRosterEnhancementPresentation=(catalog,assignment)=>{
    const targetId=enhancementRuleId(assignment),detachmentId=assignment?.detachmentId||'';
    if(!targetId||!Array.isArray(catalog?.enhancements))return null;
    const matches=catalog.enhancements.filter(record=>(!detachmentId||record?.detachmentId===detachmentId)&&[record?.id,record?.ruleId,record?.sourceId,record?.legacyKey].filter(Boolean).includes(targetId));
    if(matches.length>1)throw new Error(`Roster Enhancement ${detachmentId||'<unscoped>'}/${targetId} must resolve exactly once`);
    return matches[0]||null;
  };
  const resolveRosterWarlord=(guide,card)=>{
    const instanceId=card.dataset.rosterInstance,canonicalId=card.dataset.canonicalUnitId||String(card.id||'').replace(/--.*$/,''),candidates=(guide?.units||[]).filter(unit=>instanceId?unit.instanceId===instanceId:(unit.datasheetId||unit.canonicalDatasheetId||unit.canonicalUnitId)===canonicalId);
    if(candidates.length!==1)return null;
    const value=candidates[0].warlord;
    return typeof value==='boolean'?value:value?.state!=='unknown'&&typeof value?.selected==='boolean'?value.selected:null;
  };
  const profile=(card,guide)=>root.WHRuleFacts.profileFromDataset(card.dataset,{id:card.id},guide?{warlord:resolveRosterWarlord(guide,card)}:{});
  const withKeywordGrants=(rule,unit)=>{
    let grants=[];
    try{grants=JSON.parse(rule.closest('[data-keyword-grants]')?.dataset.keywordGrants||'[]');}catch{}
    if(!grants.length)return unit;
    const applicable=grants.filter(grant=>root.WHRelatedRules.matches({v:1,roles:[{id:'grant',side:'friendly',subject:grant.subject||'unit',selector:grant.selector||{}}]},unit));
    const gained=applicable.filter(grant=>!grant.selectionRequired).map(grant=>normalize(grant.keyword));
    const conditional=new Set(applicable.filter(grant=>grant.selectionRequired).map(grant=>normalize(grant.keyword)));
    if(!gained.length&&!conditional.size)return unit;
    return {...unit,keywords:new Set([...unit.keywords,...gained]),conditionalKeywords:conditional};
  };
  const match=(rule,unit)=>{
    try{return root.WHRelatedRules.match(JSON.parse(rule.dataset.eligibility||''),withKeywordGrants(rule,unit));}
    catch{return {state:'no-match',matchedRoleIds:[],reasons:[]};}
  };
  const matches=(rule,unit)=>match(rule,unit).state!=='no-match';
  const renderMatchState=(card,result,labels={})=>{
    card.dataset.matchState=result.state;
    card.querySelector(':scope > .compatibility-status')?.remove();
    if(result.state!=='conditional')return;
    const status=document.createElement('p');
    status.className='compatibility-status';
    status.innerHTML='<strong>Conditionally compatible</strong>';
    const conditions=[...new Set(result.conditions?.length?result.conditions:result.condition?[result.condition]:[])];
    for(const condition of conditions.length?conditions:['']){const line=document.createElement('span');line.textContent=labels[condition]||'Check the full card conditions';status.append(line);}
    card.prepend(status);
  };
  const getTemplate=url=>{
    if(!templatePromises.has(url))templatePromises.set(url,fetch(url)
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.text();})
      .then(html=>{const template=document.createElement('template');template.innerHTML=html;return template;})
      .catch(error=>{templatePromises.delete(url);throw error;}));
    return templatePromises.get(url);
  };
  function install(options={}){
    const source=options.source||null,conditionLabels=options.conditionLabels||source?.conditionLabels||{};
    if(!source&&options.enabled!==true&&root.WHRelatedRules?.enabled!==true)return null;
    const layer=document.createElement('div');
    layer.className='related-rules-layer';layer.hidden=true;
    layer.innerHTML='<section class="related-rules-dialog" role="dialog" aria-modal="true" aria-labelledby="relatedRulesTitle"><header><div><span>Datasheet tools</span><h2 id="relatedRulesTitle">Compatible Stratagems &amp; Enhancements</h2></div><button type="button" class="related-rules-close" aria-label="Close">&times;</button></header><div class="related-rules-body"><p>Loading rules&hellip;</p></div></section>';
    document.body.append(layer);
    const body=layer.querySelector('.related-rules-body'),title=layer.querySelector('h2'),templateUrl=options.templateUrl||'./mobile/related-rules.inc?v=3';
    let unit=null,kind='stratagems',detachment='all',filterMenu,tabs,content,empty,sections=[],rosterMode=false;
    let modal;
    const filter=()=>{
      if(!content||!unit)return;
      const unitProfile=profile(unit,options.rosterGuide),assignedRecords=resolveRosterEnhancements(options.rosterGuide,unit),assigned=new Set((assignedRecords||[]).map(enhancementRuleId).filter(Boolean)),sourceRows=source?.rowsForUnit(unitProfile.id,{detachmentId:detachment,warlord:unitProfile.warlord})||null,presented=sourceRows&&(rosterMode?sourceRows:root.WHRuleFacts.filterStaticCompatible(sourceRows)),visibleRows=presented&&(rosterMode&&options.rosterEnhancements==='assigned-only'?presented.filter(row=>row.kind!=='enhancement'||assigned.has(row.ruleId)):presented),sourceById=visibleRows&&new Map(visibleRows.map(row=>[row.ruleId,row]));
      content.querySelectorAll('.stratagem,.enhancement').forEach(card=>{
        const assignedEnhancements=!source&&assignedRecords!==null?assigned:null;
        const isAssigned=assignedEnhancements?.has(card.dataset.ruleId),sourceResult=sourceById?.get(card.dataset.ruleId),exactRosterAssignment=source&&card.classList.contains('enhancement')&&assigned.has(card.dataset.ruleId),assignmentResult=exactRosterAssignment?{state:'match',matchedRoleIds:[],reasons:[],provenance:'exact-roster-assignment'}:null,result=source?sourceResult||assignmentResult:assignedEnhancements&&card.classList.contains('enhancement')?!isAssigned?{state:'no-match',matchedRoleIds:[],reasons:[]}:card.dataset.rosterAssignedOnly==='true'?{state:'match',matchedRoleIds:[],reasons:[]}:match(card,unitProfile):match(card,unitProfile);
        card.toggleAttribute('data-roster-assignment-visible',Boolean(assignmentResult&&!sourceResult));
        card.hidden=source?!result:rosterMode?result.state==='no-match':!root.WHRuleFacts.staticCompatible(result);
        if(source&&!result)card.dataset.matchState='no-match';
        if(result)renderMatchState(card,result,conditionLabels);else card.querySelector(':scope > .compatibility-status')?.remove();
      });
      const hasEnhancements=[...content.querySelectorAll('.enhancement')].some(card=>!card.hidden);
      const enhancementTab=tabs.querySelector('[data-kind="enhancements"]');
      enhancementTab.hidden=!hasEnhancements;
      if(kind==='enhancements'&&!hasEnhancements)kind='stratagems';
      if(source){const label=hasEnhancements?'Compatible Stratagems & Enhancements':'Compatible Stratagems';title.textContent=`${unit.dataset.unitTitle||unit.querySelector('.unit-name')?.textContent.trim()||unit.querySelector('h3')?.textContent.trim()||'Datasheet'} · ${label}`;if(options.updateTriggerLabel)unit.querySelector('.related-rules-trigger').textContent=label;}
      content.querySelectorAll('[data-related-kind]').forEach(group=>{
        group.hidden=group.dataset.relatedKind!==kind||![...group.querySelectorAll('.stratagem,.enhancement')].some(card=>!card.hidden);
      });
      sections.forEach(section=>{
        const selected=section.dataset.detachment==='core'||detachment==='all'||section.dataset.detachment===detachment;
        section.hidden=!selected||![...section.querySelectorAll('[data-related-kind]')].some(group=>!group.hidden);
      });
      tabs.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.kind===kind)));
      empty.hidden=sections.some(section=>!section.hidden);
      empty.textContent=typeof options.emptyMessage==='function'?options.emptyMessage({kind,detachment,unit}):`No matching ${kind} for this datasheet in the selected Detachments.`;
    };
    const close=()=>{if(layer.hidden)return;layer.hidden=true;document.documentElement.classList.remove('related-rules-open');modal.deactivate();};
    modal=root.WHModalFocus.create(layer,close);
    layer.addEventListener('click',event=>{
      if(event.target===layer||event.target.closest('.related-rules-close'))close();
      const tab=event.target.closest('[data-kind]');if(tab){kind=tab.dataset.kind;filter();}
    });
    async function open(current,state={},origin=null){
      if(!current)return null;
      unit=current;layer.dataset.unitId=current.id;kind=options.restoreKind===false?'stratagems':state.kind||'stratagems';title.textContent=`${current.dataset.unitTitle||current.querySelector('.unit-name')?.textContent.trim()||current.querySelector('h3')?.textContent.trim()||'Datasheet'} · Compatible Stratagems & Enhancements`;
      layer.hidden=false;document.documentElement.classList.add('related-rules-open');modal.activate(origin||current.querySelector('.related-rules-trigger'));
      if(!content){
        try{
          await source?.load?.();
          const fragment=(await getTemplate(templateUrl)).content.cloneNode(true);
          fragment.querySelectorAll('[id]').forEach(node=>{if(!node.dataset.ruleId)node.dataset.ruleId=node.id;node.removeAttribute('id');});
          options.decorateContent?.(fragment);
          sections=[...fragment.querySelectorAll('.related-detachment')];
          const assignedRecords=resolveRosterEnhancements(options.rosterGuide,unit);if(assignedRecords)for(const assignment of assignedRecords){const ruleId=enhancementRuleId(assignment),record=resolveRosterEnhancementPresentation(root.WH_BOOK_ROSTER_CATALOG,assignment),section=sections.find(item=>item.dataset.detachment===assignment.detachmentId),group=section?.querySelector('[data-related-kind="enhancements"]');if(!ruleId||!group||group.querySelector(`[data-rule-id="${CSS.escape(ruleId)}"]`)||!record?.text)continue;const card=document.createElement('article');card.className='enhancement surface';card.dataset.ruleId=ruleId;card.dataset.rosterAssignedOnly='true';const cost=document.createElement('div');cost.className='eyebrow';cost.textContent=`Enhancement · ${record.value} pts`;const title=document.createElement('h4');title.textContent=record.title;const text=document.createElement('p');text.dataset.sourceField='text';text.textContent=record.text;card.append(cost,title,text);group.append(card);}
          const rosterDetachments=new Set(resolveRosterDetachmentIds(options.rosterGuide,sections));rosterMode=source?Boolean(options.rosterGuide):rosterDetachments.size>0;
          if(rosterMode&&(!source||options.restrictToRosterDetachments)){sections.forEach(section=>{if(section.dataset.detachment!=='core'&&!rosterDetachments.has(section.dataset.detachment))section.remove();});sections=sections.filter(section=>section.dataset.detachment==='core'||rosterDetachments.has(section.dataset.detachment));}
          const detachmentSections=sections.filter(section=>section.dataset.detachment!=='core');
          const choices=[...(rosterMode&&detachmentSections.length===1&&options.rosterDetachment!=='all'?[]:[['all',rosterMode?'All roster detachments':'All detachments']]),...detachmentSections.map(section=>[section.dataset.detachment,section.querySelector('h2').textContent])];
          detachment=rosterMode&&options.rosterDetachment==='all'?'all':choices.length===1?choices[0][0]:'all';
          if(!rosterMode&&options.persistDetachment!==false&&options.storageKey)try{const saved=localStorage.getItem(options.storageKey);if(choices.some(([value])=>value===saved))detachment=saved;}catch{}
          filterMenu=document.createElement('details');filterMenu.className='full-related-filter';filterMenu.classList.toggle('is-static',choices.length===1);
          filterMenu.innerHTML='<summary><span>'+choices.find(([value])=>value===detachment)[1]+'</span></summary><div>'+choices.map(([value,label])=>'<button type="button" data-detachment="'+value+'" aria-pressed="'+(value===detachment)+'">'+label+'</button>').join('')+'</div>';
          tabs=document.createElement('div');tabs.className='full-related-tabs';tabs.innerHTML='<button type="button" data-kind="stratagems" aria-pressed="true">Stratagems</button><button type="button" data-kind="enhancements" aria-pressed="false">Enhancements</button>';
          const controls=document.createElement('div');controls.className='full-related-controls';if(!rosterMode)controls.append(filterMenu);controls.append(tabs);
          content=document.createElement('div');content.className='full-related-content';content.append(fragment);
          empty=document.createElement('p');empty.className='full-related-empty';body.replaceChildren(controls,content,empty);
          filterMenu.addEventListener('click',event=>{
            if(choices.length===1){event.preventDefault();return;}
            const button=event.target.closest('[data-detachment]');if(!button)return;
            detachment=button.dataset.detachment;filterMenu.querySelector('summary span').textContent=button.textContent;
            filterMenu.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
            filterMenu.open=false;if(!rosterMode&&options.persistDetachment!==false&&options.storageKey)try{localStorage.setItem(options.storageKey,detachment);}catch{}filter();
          });
        }catch{
          const message=document.createElement('p');message.textContent='Could not load related rules.';
          const retry=document.createElement('button');retry.type='button';retry.className='related-rules-retry';retry.textContent='Try again';retry.addEventListener('click',()=>open(current));
          body.replaceChildren(message,retry);return null;
        }
      }
      if(!rosterMode&&state.detachment&&sections.some(section=>section.dataset.detachment===state.detachment))detachment=state.detachment;
      filter();
      if(options.closeFilterOnOpen&&filterMenu)filterMenu.open=false;
      if(filterMenu){
        const selected=filterMenu.querySelector(`[data-detachment="${CSS.escape(detachment)}"]`);
        if(selected)filterMenu.querySelector('summary span').textContent=selected.textContent;
        filterMenu.querySelectorAll('[data-detachment]').forEach(button=>button.setAttribute('aria-pressed',String(button===selected)));
      }
      body.scrollTop=state.scrollTop||0;
      modal.focusFirst();
      return layer;
    }
    const enhance=rootNode=>{
      const cards=[...(rootNode?.matches?.('.unit-card')?[rootNode]:[]),...rootNode?.querySelectorAll?.('.unit-card')||[]];
      for(const card of cards){
        const canonicalId=card.dataset.canonicalUnitId||String(card.id||'').replace(/--.*$/,'');
        if(source&&!source.hasUnit(canonicalId))continue;
        const keywords=[...card.querySelectorAll('.unit-part')].find(part=>part.id.endsWith('-keywords'));
        if(!keywords)continue;
        if(!card.querySelector('.related-rules-trigger')){
          const button=document.createElement('button');button.type='button';button.className='related-rules-trigger';button.textContent=options.triggerLabel||'Stratagems & Enhancements';keywords.after(button);
        }
        const localNav=card.querySelector(':scope > .local-nav');
        if(document.documentElement.dataset.view==='mobile'&&localNav&&!localNav.querySelector('[data-datasheet-command="stratagems"]')){
          const command=document.createElement('button');command.type='button';command.className='local-tab datasheet-nav-command';command.dataset.datasheetCommand='stratagems';command.textContent='Stratagems';command.setAttribute('aria-haspopup','dialog');command.setAttribute('aria-label','Open compatible Stratagems for this Datasheet');localNav.append(command);
        }
      }
      return rootNode;
    };
    enhance(document);
    document.addEventListener('click',event=>{const command=event.target.closest('[data-datasheet-command="stratagems"]');if(command){event.preventDefault();open(command.closest('.unit-card'),{kind:'stratagems'},command);return;}const button=event.target.closest('.related-rules-trigger');if(button)open(button.closest('.unit-card'));});
    return{layer,close,open,enhance,snapshot(origin){if(layer.hidden||!layer.contains(origin))return null;const card=origin.closest('[data-rule-id]'),termId=origin.dataset.term||'',found=card&&termId?[...card.querySelectorAll(`[data-term="${CSS.escape(termId)}"]`)]:[];return{type:'related-rules',unitId:unit?.id||'',detachment,kind,scrollTop:body.scrollTop,ruleId:card?.dataset.ruleId||'',termId,occurrence:Math.max(0,found.indexOf(origin))};},async restore(state){const restoredUnit=document.getElementById(state?.unitId);if(!restoredUnit)return null;await open(restoredUnit,state);const card=layer.querySelector(`[data-rule-id="${CSS.escape(state.ruleId||'')}"]`),found=card&&state.termId?[...card.querySelectorAll(`[data-term="${CSS.escape(state.termId)}"]`)]:[];return found[state.occurrence]||found[0]||(source?restoredUnit.querySelector('.related-rules-trigger'):null);}};
  }
  root.WHArmyRelatedRules=Object.freeze({install,profile,match,matches,resolveRosterDetachmentIds,resolveRosterEnhancements,resolveRosterEnhancementPresentation});
}(window));
