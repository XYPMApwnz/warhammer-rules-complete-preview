/** External read-only sweep helper. No clicks, source writes or application state changes. */
export async function auditNewUi(pageOrFrame, context={}) {
  return pageOrFrame.evaluate(inspectNewUi,context);
}

/** Self-contained for Playwright Page.evaluate() and Frame.evaluate(). */
export function inspectNewUi(context={}) {
  const findings=[],metrics={gainedChips:0,sourceTooltips:0,ownSourceChips:0,weaponSummaries:0,gainedSections:0,dialogs:0,ruleTermLinks:0,importOptions:0,rosterNavUnits:0,stratagemRows:0};
  const visible=node=>Boolean(node&&node.getClientRects().length)&&getComputedStyle(node).visibility!=='hidden'&&!node.closest('[hidden],[aria-hidden="true"],.v2-sr-only,.sr-only,script,style');
  const text=node=>String(node?.innerText??node?.textContent??'').replace(/\s+/g,' ').trim();
  const issue=(kind,node,detail={})=>findings.push({kind,...detail,text:text(node).slice(0,500),cardId:node?.closest('[data-card-id]')?.dataset.cardId??null,instanceId:node?.closest('[data-roster-instance-id]')?.dataset.rosterInstanceId??null});
  const parse=value=>{try{return JSON.parse(value||'null');}catch{return null;}};
  const root=document.querySelector('main.main,main.v2-main,main.global-glossary-main,main')||document.body;
  const dialogs=[...document.querySelectorAll('dialog[open]')].filter(visible);
  const scanRoots=dialogs.length?dialogs:[root];
  const word=character=>Boolean(character&&/[\p{L}\p{N}_]/u.test(character));
  const nearbyChar=(link,before)=>{
    let node=link;while(node){const sibling=before?node.previousSibling:node.nextSibling;if(sibling){const value=sibling.nodeType===3?sibling.nodeValue:sibling.textContent;return before?value?.at(-1):value?.at(0);}node=node.parentNode;if(!node||node===root||node.matches?.('p,li,section,article'))break;}return null;
  };
  const knownTargets=context.knownTargetIds?new Set(context.knownTargetIds):null;
  const termTargets=[];
  for(const scope of scanRoots)for(const link of scope.querySelectorAll('a.rule-term-link'))if(visible(link)){
    metrics.ruleTermLinks++;const target=link.dataset.targetId??null;
    termTargets.push({targetId:target,label:text(link),href:link.getAttribute('href')});
    if(word(nearbyChar(link,true))||word(nearbyChar(link,false)))issue('GLOSSARY_LINK_INSIDE_WORD',link,{targetId:target});
    if(!target||!link.getAttribute('href'))issue('GLOSSARY_LINK_MISSING_TARGET',link,{targetId:target});
    else if(knownTargets&&!knownTargets.has(target))issue('GLOSSARY_LINK_UNKNOWN_TARGET',link,{targetId:target});
  }
  for(const card of root.querySelectorAll('article.unit-card[data-roster-instance-id]'))if(visible(card)){
    const instance=card.dataset.rosterInstanceId;
    for(const chip of card.querySelectorAll('.ds-gained-chip'))if(visible(chip)){
      metrics.gainedChips++;const id=chip.getAttribute('aria-describedby')||chip.getAttribute('aria-controls'),tip=id?document.getElementById(id):null;
      // Own-unit gains are intentionally non-interactive spans in the accepted presenter.
      // Record them separately; without a native source trace this helper cannot call them foreign.
      if(chip.tagName!=='BUTTON'){metrics.ownSourceChips++;continue;}
      if(!tip||tip.getAttribute('role')!=='tooltip'||!text(tip))issue('GAINED_CHIP_MISSING_SOURCE_TOOLTIP',chip,{tooltipId:id});
      else{metrics.sourceTooltips++;if(!tip.querySelector('a[data-target-id],[data-source-rule-id],[data-policy-source]'))issue('GAINED_TOOLTIP_NO_SOURCE_REFERENCE',chip,{tooltipId:id,tooltipText:text(tip)});}
    }
    for(const line of card.querySelectorAll('[data-gained-weapon-summary]'))if(visible(line)){
      metrics.weaponSummaries++;const source=parse(line.dataset.gainedSourceIdentity);
      if(!source||!(source.canonicalRuleId||source.ruleId))issue('ALL_WEAPONS_MISSING_SOURCE_TRACE',line);
      else if(source.sourceInstanceId&&source.sourceInstanceId!==instance&&!/\s—\s\S/u.test(text(line)))issue('ALL_WEAPONS_MISSING_FOREIGN_SOURCE_CAPTION',line,{sourceInstanceId:source.sourceInstanceId});
    }
    const gained=card.querySelector(':scope > [data-datasheet-section="gained-rules"]');
    if(gained){
      metrics.gainedSections++;const sections=[...card.children].filter(n=>n.hasAttribute('data-datasheet-section')&&visible(n));
      if(sections.at(-1)!==gained)issue('GAINED_RULES_NOT_LAST_SECTION',gained,{sectionOrder:sections.map(n=>n.dataset.datasheetSection)});
      const ranks={LEADER:0,ATTACHED_UNIT:0,ENHANCEMENT:1,DETACHMENT:2},groups=[...gained.querySelectorAll(':scope > [data-gained-source-kind]')],sequence=groups.map(n=>n.dataset.gainedSourceKind);
      if(sequence.some((kind,i)=>!(kind in ranks)||i&&ranks[kind]<ranks[sequence[i-1]]))issue('GAINED_GROUP_ORDER',gained,{sequence});
    }
    const prices=[...card.querySelectorAll(':scope > .unit-header .ds-instance-price')].filter(visible);
    if(prices.length!==1)issue('ROSTER_CARD_PRICE_COUNT',card,{count:prices.length});
    for(const caption of card.querySelectorAll('[data-source-caption],[data-recipient-caption]'))if(visible(caption)&&/^(?:Source|Applies to):/i.test(text(caption))&&caption.dataset.sourceInstanceId===instance)issue('SELF_SOURCE_CAPTION_VISIBLE',caption);
    for(const strata of card.querySelectorAll(':scope > [data-datasheet-section="stratagems"]')){
      const rows=[...strata.querySelectorAll('[data-rule-id]')];metrics.stratagemRows+=rows.length;
      if(strata.open&&strata.dataset.stratagemsLoaded==='true'&&!rows.length)issue('EMPTY_ROSTER_STRATAGEMS',strata);
      for(const row of rows){if(!row.dataset.detachmentId)issue('ROSTER_STRATAGEM_WITHOUT_DETACHMENT',row);else if(context.selectedDetachmentIds&&!context.selectedDetachmentIds.includes(row.dataset.detachmentId))issue('FOREIGN_ROSTER_STRATAGEM',row,{detachmentId:row.dataset.detachmentId});}
    }
  }
  for(const dialog of dialogs){
    metrics.dialogs++;const content=dialog.querySelector('.v2-dialog-content,.global-glossary-definition,.reference-definition')||dialog;
    if(!text(content))issue('EMPTY_RULE_DIALOG',dialog);
    const focused=[...dialog.querySelectorAll('.ds-rule-popup')];
    if(focused.length>1)issue('MULTIPLE_FOCUSED_RULES_IN_DIALOG',dialog,{count:focused.length});
    for(const rule of focused){if(!text(rule.querySelector('.reference-title'))||!text(rule.querySelector('.reference-definition')))issue('RULE_DIALOG_MISSING_TITLE_OR_BODY',rule);if(!rule.dataset.ruleType||/^(?:Rule|wargear Ability|Datasheet ability\s*\/\s*Datasheet ability)$/u.test(rule.dataset.ruleType))issue('RULE_DIALOG_BAD_TYPE',rule,{type:rule.dataset.ruleType});}
    for(const leaf of dialog.querySelectorAll('*'))if(!leaf.children.length&&visible(leaf)&&/^(?:Rule|wargear Ability|wargear Ability\s*[—/]\s*Datasheet ability)$/u.test(text(leaf)))issue('INTERNAL_DIALOG_LABEL',leaf);
    for(const control of dialog.querySelectorAll('button,a'))if(visible(control)){
      const ids=(control.getAttribute('aria-labelledby')||'').split(/\s+/).filter(Boolean),name=(control.getAttribute('aria-label')||ids.map(id=>text(document.getElementById(id))).join(' ')||text(control)||control.getAttribute('title')||[...control.querySelectorAll('img[alt]')].map(n=>n.alt).join(' ')).trim();
      if(!name)issue('DIALOG_CONTROL_NO_ACCESSIBLE_NAME',control,{tag:control.tagName});
      if(text(control)==='↗'&&!control.getAttribute('aria-label')&&!control.getAttribute('title'))issue('UNLABELLED_EXTERNAL_ARROW',control);
    }
  }
  const importRoot=root.querySelector('[data-roster-view]');
  if(importRoot){
    const before=importRoot.querySelector('[data-roster-import-panel]'),raw=before?.querySelector('textarea[data-roster-input="raw-text"]');
    if(before&&raw){
      const nodes=[...before.querySelectorAll('[data-roster-known-limitations],[data-roster-scoped-limitation]')].filter(visible);for(const node of nodes)issue('IMPORT_LIMITATION_BEFORE_INPUT',node);
    }
    const internal=/\b(?:NOT_PROVEN|REFERENCE_ONLY|UNKNOWN|BATTLE_ONLY|KEEP_HIDDEN)\b|\b(?:canonical|physical|bindings?|MFM)\b|\bsource entr(?:y|ies)\b|\b(?:parsed-unit|unit|datasheet|detachment|refs|bindings)-[a-z0-9][a-z0-9:_.\/-]*/i;
    const walker=document.createTreeWalker(importRoot,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode()))if(node.textContent.trim()&&visible(node.parentElement)&&!node.parentElement.closest('textarea,input,option')&&internal.test(node.textContent))issue('INTERNAL_IMPORT_COPY',node.parentElement,{token:node.textContent.match(internal)?.[0]});
    for(const select of importRoot.querySelectorAll('select'))if(visible(select))for(const option of select.options){metrics.importOptions++;if(internal.test(option.textContent))issue('INTERNAL_IMPORT_OPTION',select,{option:option.textContent,value:option.value});}
  }
  const nav=document.querySelector('[data-roster-scope="true"]');
  if(nav){
    for(const link of nav.querySelectorAll('[data-roster-nav-instance-id]')){
      metrics.rosterNavUnits++;if(/\b\d+\s*(?:pts?|points?)\b/i.test(text(link)))issue('POINTS_IN_PERSONAL_UNIT_MENU',link);
    }
    for(const group of nav.querySelectorAll('li.roster-attachment-group')){
      const members=[...group.querySelectorAll('[data-roster-attachment-role]')];
      if(members[0]?.dataset.rosterAttachmentRole!=='bodyguard'||members.slice(1).some(n=>!n.querySelector('.roster-member-arrow')))issue('ATTACHMENT_MENU_GROUP_STRUCTURE',group,{roles:members.map(n=>n.dataset.rosterAttachmentRole)});
    }
    if(context.warlordInstanceId){const entry=[...nav.querySelectorAll('[data-roster-nav-instance-id]')].find(n=>n.dataset.rosterNavInstanceId===context.warlordInstanceId);if(entry&&!entry.querySelector('.roster-warlord[aria-label="Warlord"]'))issue('MISSING_WARLORD_CROWN',entry);}
  }
  return {findings,metrics,evidence:{termTargets,dialogTargets:dialogs.map(d=>({canonicalId:d.dataset.canonicalId??null,title:text(d.querySelector('.reference-title,h1,h2,h3'))})),notChecked:['Tooltip opening and dismissal require interaction coverage','Rule target opening requires navigator coverage','Native duplicate composition/#N equivalence requires snapshot comparison','Units drawer open/Escape requires interaction coverage','Collapsed Stratagems emptiness requires native metadata comparison or opening']}};
}
