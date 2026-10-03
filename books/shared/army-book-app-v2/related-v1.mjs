/** V1 army-related-rules.js dialog templates, with supplied V2 results only.
 * No matcher, catalog fetch, roster inference or executable predicates here.
 */
export function createV1RelatedPanel({document,detachments,rosterMode,detachmentId='',rowsFor,renderRule,onDetachment}) {
  const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const node=el('div','v1-related-panel');
  const controls=el('div','full-related-controls');
  if(rosterMode)controls.classList.add('is-roster');
  const tabs=el('div','full-related-tabs');tabs.setAttribute('aria-label','Related rule categories');
  let kind='stratagems',selected=rosterMode?'':detachmentId;
  const content=el('div','full-related-content');
  const empty=el('p','full-related-empty');
  const filter=rosterMode?null:el('details','full-related-filter');
  const choices=[{id:'',title:'All Detachments'},...detachments];
  let summary;
  const choose=id=>{selected=id;if(filter){summary.textContent=choices.find(choice=>choice.id===id)?.title||'All Detachments';filter.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.detachment===id)));filter.open=false;}render();};
  const showKind=()=>{
    let found=false;
    for(const section of content.children){
      let visible=false;
      for(const group of section.querySelectorAll('[data-related-kind]')){group.hidden=group.dataset.relatedKind!==kind||!group.children.length;if(!group.hidden)visible=true;}
      section.hidden=!visible;found ||= visible;
    }
    tabs.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.kind===kind)));
    empty.hidden=found;empty.textContent=`No matching ${kind} for this datasheet in the selected Detachments.`;
  };
  function render(){
    content.replaceChildren();
    const rows=rowsFor(selected);
    for(const detachment of detachments){
      const members=rows.filter(row=>row.detachmentId===detachment.id);
      if(!members.length)continue;
      const section=el('section','related-detachment');section.dataset.detachmentId=detachment.id;section.dataset.detachment=detachment.id;
      section.append(el('h2','',detachment.title));
      for(const [category,recordKind]of [['stratagems','STRATAGEM'],['enhancements','ENHANCEMENT']]){
        const group=el('div','detachment-content');group.dataset.relatedKind=category;
        for(const row of members.filter(row=>row.kind===recordKind)){
          const card=renderRule(row.ruleId);card.classList.add('v2-compatible-item');
          card.dataset.ruleId=row.ruleId;card.dataset.applicability=row.applicability;card.dataset.detachmentId=row.detachmentId;
          const status=el('p','compatibility-status');status.append(el('strong','',row.applicability==='CONDITIONAL'?'Conditionally compatible':'Compatible'));
          if(row.applicability==='CONDITIONAL')status.append(el('span','','Check the full card conditions'));
          card.prepend(status);group.append(card);
        }
        section.append(group);
      }
      content.append(section);
    }
    showKind();
  }
  if(filter){
    const head=el('summary');summary=el('span','',choices.find(choice=>choice.id===selected)?.title||'All Detachments');head.append(summary);
    const menu=el('div');
    for(const choice of choices){const button=el('button','',choice.title);button.type='button';button.dataset.detachment=choice.id;button.setAttribute('aria-pressed',String(choice.id===selected));button.addEventListener('click',()=>{choose(choice.id);onDetachment?.(choice.id);});menu.append(button);}
    filter.append(head,menu);controls.append(filter);
  }
  for(const [value,label]of [['stratagems','Stratagems'],['enhancements','Enhancements']]){
    const button=el('button','',label);button.type='button';button.dataset.kind=value;button.setAttribute('aria-pressed',String(value===kind));button.addEventListener('click',()=>{kind=value;showKind();});tabs.append(button);
  }
  controls.append(tabs);node.append(controls,content,empty);render();
  return {node,setDetachment:id=>{if(!rosterMode)choose(id);}};
}
