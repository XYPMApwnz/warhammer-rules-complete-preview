/** V2 identity/DOM adapter for the actual V1 Contents interaction core. */
import {NavigationController} from './navigation-v1-controller.mjs';
import {Highlighter} from './navigation-v1-targets.mjs';
import {getSourceContext} from '../source-refs-v2/source-refs.mjs';

const categories=[['EPIC HERO','Epic Heroes'],['CHARACTER','Characters'],['BATTLELINE','Battleline'],
  ['DEDICATED TRANSPORT','Dedicated Transports'],['FORTIFICATION','Fortifications'],['INFANTRY','Infantry'],
  ['BEAST','Beasts'],['VEHICLE','Vehicles'],['MONSTER','Monsters'],['MOUNTED','Mounted'],['SWARM','Swarms']];
const list=value=>Array.isArray(value)?value:[];
const currentRelation=relation=>relation?.certainty==='current'&&getSourceContext(relation).kind==='explicit-roster-attachment';
const keywordsFor=unit=>new Set(list(unit?.intrinsicKeywords).map(value=>String(value).trim().toUpperCase()));
// Actual V1 presentation ordering; its inputs below are adapted solely from V2.
  function physicalRosterOrder(game,catalog){
    const catalogOrder=new Map(list(catalog.units).map((unit,index)=>[unit.id,index])),catalogById=new Map(list(catalog.units).map(unit=>[unit.id,unit]));
    const units=list(game.units).map((unit,physicalOrder)=>{const canonical=catalogById.get(unit.identity?.canonicalDatasheetId);if(!canonical)return null;const keywords=keywordsFor(canonical);return{unit,canonical,instanceId:unit.identity.instanceId,targetId:canonical.id,title:unit.identity.canonicalTitle||canonical.title,canonicalOrder:catalogOrder.get(canonical.id),physicalOrder,isEpic:keywords.has('EPIC HERO'),isCharacter:keywords.has('CHARACTER')};}).filter(Boolean);
    const compare=(a,b)=>a.canonicalOrder-b.canonicalOrder||a.physicalOrder-b.physicalOrder;
    const byInstance=new Map(units.map(unit=>[unit.instanceId,unit])),edges=new Map(),leaderIds=new Set(),bodyguardIds=new Set();
    const connect=(left,right)=>{if(!byInstance.has(left)||!byInstance.has(right)||left===right)return;if(!edges.has(left))edges.set(left,new Set());if(!edges.has(right))edges.set(right,new Set());edges.get(left).add(right);edges.get(right).add(left);};
    for(const bodyguard of units)for(const relation of list(bodyguard.unit.attachments?.leaders).filter(currentRelation)){leaderIds.add(relation.instanceId);bodyguardIds.add(bodyguard.instanceId);connect(bodyguard.instanceId,relation.instanceId);}
    const visited=new Set(),components=[];
    for(const seed of units.filter(unit=>edges.has(unit.instanceId)).sort(compare)){if(visited.has(seed.instanceId))continue;const pending=[seed.instanceId],members=[];while(pending.length){const id=pending.shift();if(visited.has(id))continue;visited.add(id);const unit=byInstance.get(id);if(unit)members.push(unit);for(const next of edges.get(id)||[])if(!visited.has(next))pending.push(next);}members.sort((a,b)=>(a.isEpic?0:leaderIds.has(a.instanceId)?1:bodyguardIds.has(a.instanceId)?2:3)-(b.isEpic?0:leaderIds.has(b.instanceId)?1:bodyguardIds.has(b.instanceId)?2:3)||compare(a,b));components.push({members,epic:members.some(unit=>unit.isEpic)});}
    const componentOrder=component=>{const primary=component.members.filter(unit=>component.epic?unit.isEpic:leaderIds.has(unit.instanceId));return Math.min(...(primary.length?primary:component.members).map(unit=>unit.canonicalOrder));};
    const attachmentByInstance=new Map();
    components.forEach((component,index)=>{const groupId=`roster-attachment-${index+1}`;component.members.forEach(unit=>attachmentByInstance.set(unit.instanceId,Object.freeze({groupId,role:bodyguardIds.has(unit.instanceId)?'bodyguard':'leader'})));});
    const unattached=unit=>!edges.has(unit.instanceId),result=[],emitted=new Set(),emit=unit=>{if(!unit||emitted.has(unit.instanceId))return;emitted.add(unit.instanceId);result.push(unit);},emitComponent=component=>component.members.forEach(emit);
    units.filter(unit=>unit.isEpic&&unattached(unit)).sort(compare).forEach(emit);
    components.filter(component=>component.epic).sort((a,b)=>componentOrder(a)-componentOrder(b)).forEach(emitComponent);
    units.filter(unit=>unit.isCharacter&&!unit.isEpic&&unattached(unit)).sort(compare).forEach(emit);
    components.filter(component=>!component.epic).sort((a,b)=>componentOrder(a)-componentOrder(b)).forEach(emitComponent);
    units.sort(compare).forEach(emit);
    const copies=new Map();for(const unit of units.sort((a,b)=>a.physicalOrder-b.physicalOrder)){if(!copies.has(unit.targetId))copies.set(unit.targetId,[]);copies.get(unit.targetId).push(unit.instanceId);}
    return result.map(unit=>{const peers=copies.get(unit.targetId)||[],ordinal=peers.indexOf(unit.instanceId)+1;return{...unit,label:peers.length>1?`${unit.title} #${ordinal}`:unit.title,navigationAttachment:attachmentByInstance.get(unit.instanceId)||null};});
  }


const check=(condition,message)=>{if(!condition)throw new TypeError(message);};
export function projectContents(payload,state=null,personal=null){
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  const nodes=new Map(), groups=new Map();
  const record=id=>{const card=cards.get(id);check(card,'Unresolved V2 Contents identity: '+id);return card;};
  const leaf=(id,label,instanceId)=>{const card=record(id),node={id,label:label||card.title,canonicalId:id,instanceId,children:[]};
    if(instanceId)node.id='roster-unit/'+encodeURIComponent(instanceId);
    nodes.set(node.id,node);return node;};
  const branch=(id,label,children,targets=children.flatMap(node=>groups.get(node.id)||[node.canonicalId]).filter(Boolean))=>{
    const node={id,label,children};nodes.set(id,node);groups.set(id,targets);return node;};
  const armyGroup=payload.groups.find(group=>group.id==='army-rules');
  const army=(armyGroup?.itemIds||[]).map(id=>{
    const node=leaf(id);node.children=(record(id).children||[]).filter(child=>record(child).kind==='ARMY_RULE_COMPONENT').map(child=>leaf(child));return node;
  });
  const detachment=id=>{
    const card=record(id),node=leaf(id);
    for(const [kind,label] of [['DETACHMENT_RULE','Detachment Rule'],['ENHANCEMENT','Enhancement'],['STRATAGEM','Stratagems']]){
      const ids=(card.children||[]).filter(child=>record(child).kind===kind&&(!personal||personal.allowedIds.has(child)));
      if(ids.length)node.children.push(branch('nav:'+id+':'+kind,label,[],ids));
    }
    return node;
  };
  if(personal){
    check(state?.units?.length&&state.detachmentIds?.length,'Imported roster context unavailable.');
    const selected=[...new Set(state.detachmentIds)];
    check(selected.every(id=>record(id).kind==='DETACHMENT'),'Unresolved selected Detachment.');
    const physical=new Map(personal.instances.map(entry=>[entry.instanceId,leaf(entry.id,entry.title,entry.instanceId)]));
    check(physical.size===state.units.length&&state.units.every(unit=>physical.has(unit.instanceId)),'Missing physical Contents identity.');
    const membership=new Map(),edges=new Map();
    for(const edge of state.attachments||[]){
      check(physical.has(edge.leaderInstanceId)&&physical.has(edge.bodyguardInstanceId)&&edge.leaderInstanceId!==edge.bodyguardInstanceId&&!membership.has(edge.leaderInstanceId),'Invalid Contents attachment.');
      membership.set(edge.leaderInstanceId,edge.bodyguardInstanceId);
      const list=edges.get(edge.bodyguardInstanceId)||[];list.push(edge.leaderInstanceId);edges.set(edge.bodyguardInstanceId,list);
    }
    const physicalNodes=[],emitted=new Set();
    const emit=id=>{check(!emitted.has(id),'Duplicate physical Contents entry.');emitted.add(id);return physical.get(id);};
    const catalog={units:[...cards.values()].filter(card=>card.kind==='DATASHEET').map(card=>({id:card.id,title:card.title,intrinsicKeywords:card.fields.filter(field=>/^\/keywords\/\d+$/.test(field.source?.path||'')).map(field=>field.value)}))};
    const game={units:state.units.map(unit=>({identity:{instanceId:unit.instanceId,canonicalDatasheetId:unit.canonicalUnitId,canonicalTitle:record(unit.canonicalUnitId).title},attachments:{leaders:(state.attachments||[]).filter(edge=>edge.bodyguardInstanceId===unit.instanceId).map(edge=>({instanceId:edge.leaderInstanceId,certainty:'current',provenance:{kind:'explicit-roster-attachment'}}))}}))};
    const order=physicalRosterOrder(game,catalog).map(unit=>unit.instanceId);
    for(const id of order){
      if(emitted.has(id))continue;
      const bodyguard=membership.get(id)||(edges.has(id)?id:null);
      if(bodyguard){
        check(!membership.has(bodyguard),'Cyclic Contents attachment.');
        const members=[...edges.get(bodyguard).map(leader=>({...emit(leader),attachmentRole:'leader'})),{...emit(bodyguard),attachmentRole:'bodyguard'}];
        physicalNodes.push({attachmentGroup:bodyguard,members});
      }else physicalNodes.push(emit(id));
    }
    check(emitted.size===physical.size,'Unaccounted physical Contents entry.');
    return {nodes,groups,roots:[branch('nav:army-rules','Army Rule',army),branch('nav:detachments','Detachments',selected.map(detachment)),...physicalNodes],scope:'ROSTER'};
  }
  const roots=[branch('start','Start',[],[])];
  if(army.length)roots.push(branch('nav:army-rules','Army Rule',army));
  const detachments=payload.groups.find(group=>group.id==='detachments');
  if(detachments?.itemIds.length)roots.push(branch('nav:detachments','Detachments',detachments.itemIds.map(detachment)));
  const buckets=new Map();
  for(const id of payload.groups.find(group=>group.id==='datasheets')?.itemIds||[]){
    const keywords=new Set(record(id).fields.filter(field=>/^\/keywords\/\d+$/.test(field.presentationPath??field.source?.path??'')).map(field=>field.value));
    const [key,label]=categories.find(([keyword])=>keywords.has(keyword))||['OTHER','Other datasheets'];
    if(!buckets.has(key))buckets.set(key,{label,items:[]});buckets.get(key).items.push(leaf(id));
  }
  const categoryNodes=[];
  for(const key of ['EPIC HERO','CHARACTER','BATTLELINE','INFANTRY','BEAST','VEHICLE','DEDICATED TRANSPORT','FORTIFICATION','MONSTER','MOUNTED','SWARM','OTHER']){
    if(buckets.has(key)){const {label,items}=buckets.get(key);categoryNodes.push(branch('nav:category:'+key,label,items));}
  }
  if(categoryNodes.length)roots.push(branch('nav:datasheets','Datasheets',categoryNodes));
  const updates=payload.groups.find(group=>group.id==='updates');
  if(updates?.itemIds.length)roots.push(branch('nav:updates','Updates',updates.itemIds.map(id=>leaf(id))));
  return {nodes,groups,roots,scope:'FULL'};
}

export function mountV1Contents(document,elements,bridge,{lifecycle=bridge.lifecycle}={}){
  const originalNodes=[...elements.tree.childNodes],originalScope=elements.tree.getAttribute('data-scope');
  let destroyed=false,removeParentCleanup;
  const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  let model={nodes:new Map(),groups:new Map(),roots:[]},signature='',controller;
  const section=id=>{
    if(id==='start')return elements.main.querySelector('.v2-hero')||elements.main;
    const heading=[...elements.main.querySelectorAll('[data-contents-target]')].find(node=>node.dataset.contentsTarget===id);if(heading)return heading;
    const node=model.nodes.get(id);
    if(node?.instanceId)return [...elements.main.querySelectorAll('[data-roster-instance-id]')].find(card=>card.dataset.rosterInstanceId===node.instanceId)||null;
    const target=model.groups.get(id)?.[0]||node?.canonicalId||id;
    return [...elements.main.querySelectorAll('[data-card-id]')].find(card=>card.dataset.cardId===target)||null;
  };
  const resolve=element=>{
    if(element?.matches('[data-card-id]'))return {scrollTarget:element,highlightTarget:element};
    return {scrollTarget:element?.querySelector(':scope > h1,:scope > h2,:scope > h3')||element,highlightTarget:element};
  };
  const highlighter=new Highlighter({view:document.defaultView||window});
  controller=new NavigationController({elements,highlighter,section,resolve,
    kind:id=>model.nodes.get(id)?.children.length?'branch':'target',
    itemId:id=>{const seen=new Set();while(id&&!model.nodes.has(id)&&!seen.has(id)){seen.add(id);id=bridge.parentId?.(id);}return id;},
    tracking:()=>!document.querySelector('dialog[open]')&&!elements.main.inert&&(bridge.tracking?.()??true),
    range:item=>{
      const ids=model.groups.get(item.id);if(!ids?.length)return null;
      const rects=ids.map(section).filter(Boolean).map(element=>element.getBoundingClientRect()).filter(rect=>rect.width&&rect.height);
      if(!rects.length)return null;
      return {top:window.scrollY+Math.min(section(item.id)?.getBoundingClientRect().top??Infinity,...rects.map(rect=>rect.top)),bottom:window.scrollY+Math.max(...rects.map(rect=>rect.bottom)),measurable:true};
    },
    navigate:(id,instanceId,historyMode)=>bridge.navigate(id,instanceId,historyMode),
    settled:id=>bridge.settled?.(id)
  });
  const build=(entry,depth=1)=>{
    if(entry.attachmentGroup){
      const group=make('li','roster-attachment-group'),members=make('ul','roster-attachment-members');group.dataset.rosterAttachmentGroup=entry.attachmentGroup;
      entry.members.forEach(member=>{const node=build(member,1);node.dataset.rosterAttachmentGroup=entry.attachmentGroup;node.dataset.rosterAttachmentRole=member.attachmentRole;members.append(node);});group.append(members);return group;
    }
    const node=make('li');node.dataset.navId=entry.id;node.dataset.navDepth=String(depth);
    const row=make('div','toc-row'+(entry.children.length?'':' no-toggle')),label=make('button','toc-label',entry.label);label.type='button';
    label.dataset.navTarget=entry.id;label.dataset.targetId=entry.id;if(entry.searchResult)label.classList.add('v2-search-result');
    if(entry.canonicalId)label.dataset.canonicalId=entry.canonicalId;
    if(entry.instanceId){label.dataset.rosterInstance=entry.instanceId;label.dataset.rosterNavInstanceId=entry.instanceId;}
    row.append(label);node.append(row);
    if(entry.children.length){
      const toggle=make('button','toc-toggle');toggle.type='button';toggle.dataset.navToggle='';toggle.setAttribute('aria-label','Toggle '+entry.label);toggle.setAttribute('aria-expanded','false');row.append(toggle);
      const children=make('ul','toc-branch');children.hidden=true;entry.children.forEach(child=>children.append(build(child,depth+1)));node.append(children);
    }
    return node;
  };
  const destroy=()=>{
    if(destroyed)return;
    destroyed=true;removeParentCleanup?.();controller.destroy();
    elements.tree.replaceChildren(...originalNodes);
    if(originalScope===null)elements.tree.removeAttribute('data-scope');else elements.tree.setAttribute('data-scope',originalScope);
    model={nodes:new Map(),groups:new Map(),roots:[]};signature='';
  };
  removeParentCleanup=lifecycle?.cleanup(destroy);
  return {controller,section,isTarget:id=>!destroyed&&model.nodes.has(id),destroy,
    refresh(next,id){
      if(destroyed)return;
      model=next;const nextSignature=JSON.stringify(next.roots);
      if(signature!==nextSignature){
        const open=new Set([...elements.tree.querySelectorAll('[data-nav-id]')].filter(node=>node.querySelector(':scope > .toc-branch')?.hidden===false).map(node=>node.dataset.navId));
        signature=nextSignature;elements.tree.replaceChildren(...next.roots.map(entry=>build(entry)));controller.indexNavigationItems();controller.activeButtons=new Set();
        for(const item of controller.items)if(open.has(item.node.dataset.navId))controller.openBranch(item.node);
      }
      elements.tree.dataset.scope=next.scope;
      if(id&&controller.itemFor(id))controller.activate(id,{instanceId:controller.itemFor(id).instanceId,keepVisible:!controller.mobile||controller.state.drawer});
      else{for(const button of controller.activeButtons){button.classList.remove('is-current','is-ancestor');button.removeAttribute('aria-current');}controller.activeButtons.clear();controller.state.active='';controller.state.instance='';}
      controller.scheduleGeometry();
    },
    restore(id,scrollY){if(destroyed)return;const item=controller.itemFor(id),target=section(id);if(!item||!target)return;controller.refreshGeometry();const resolved=resolve(target);controller.beginTransition(id,Number.isFinite(scrollY)?scrollY:controller.destination(resolved.scrollTarget),()=>{highlighter.show(resolved.highlightTarget);bridge.settled?.(id);},item.instanceId);},
    clear(){if(destroyed)return;signature='';model={nodes:new Map(),groups:new Map(),roots:[]};elements.tree.replaceChildren();controller.indexNavigationItems();controller.activeButtons=new Set();}
  };
}
