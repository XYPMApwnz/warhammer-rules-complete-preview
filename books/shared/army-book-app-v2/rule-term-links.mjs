/** Disposable links into the already loaded, exact local glossary inventory.
 * No fetch, source mutation, inferred alias or gameplay interpretation.
 */
const word = character => Boolean(character && /[\p{L}\p{N}_]/u.test(character));
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const caseKey = value => value.toLowerCase();

/** Compile once per glossary. Ambiguous display terms never acquire a target. */
export function createExactTermMatcher({cards,index}) {
  const cardMap=cards instanceof Map?cards:new Map((cards||[]).map(card=>[card.id,card]));
  const inventory=new Map();
  const add=(label,targetId)=>{
    if(typeof label!=='string'||!label.trim()||label!==label.trim()||!cardMap.has(targetId))return;
    const key=caseKey(label),row=inventory.get(key)||{label,targets:new Set()};
    row.targets.add(targetId);inventory.set(key,row);
  };
  for(const entry of index?.entries||[]) {
    add(entry.label,entry.targetId);
    // Search normalization is not authority to invent punctuation-free terms.
    // Only aliases explicitly enrolled for normal display matching participate.
    for(const alias of entry.aliases||[])if(alias.match==='NORMALIZED')add(alias.label,entry.targetId);
  }
  const terms=[...inventory].filter(([,row])=>row.targets.size===1).map(([key,row])=>({key,label:row.label,targetId:[...row.targets][0]}));
  terms.sort((a,b)=>b.label.length-a.label.length||(a.key<b.key?-1:a.key>b.key?1:0));
  const targets=new Map(terms.map(term=>[term.key,term.targetId]));
  const pattern=terms.length?new RegExp(terms.map(term=>escapePattern(term.label)).join('|'),'giu'):null;
  const ambiguous=[...inventory].filter(([,row])=>row.targets.size>1).map(([key,row])=>({term:row.label,targetIds:[...row.targets].sort()}));
  function match(text,{title=null}={}) {
    text=String(text??'');if(!pattern||!text)return [];
    let prefixEnd=0;
    if(typeof title==='string'&&title&&caseKey(text.slice(0,title.length))===caseKey(title)&&/^(?:\s*[:—–]|\s*$)/u.test(text.slice(title.length)))prefixEnd=title.length;
    pattern.lastIndex=0;const matches=[];
    for(const found of text.matchAll(pattern)) {
      const start=found.index,end=start+found[0].length;
      if(start<prefixEnd||word(text[start-1])||word(text[end]))continue;
      matches.push({start,end,text:found[0],targetId:targets.get(caseKey(found[0]))});
    }
    return matches;
  }
  return Object.freeze({match,terms:Object.freeze(terms.map(term=>Object.freeze({...term}))),ambiguous:Object.freeze(ambiguous)});
}

const skip='a,button,script,style,template,noscript,code,pre,input,textarea,select,option,svg,h1,h2,h3,h4,h5,h6,summary,.ds-inline-rule-title,[aria-hidden="true"]';
const ownerSelector='[data-card-id],[data-canonical-id],[data-rule-term-title]';
const revealBoundary='.unit-card,.v2-book-record,.v1-reference-article,[data-rule-term-title]';
const titleFor=(owner,cards)=>owner?.dataset.ruleTermTitle||cards.get(owner?.dataset.cardId||owner?.dataset.canonicalId)?.title;

/** Identify only our exact anchor replacements. Visible boundaries separately
 * report real size changes; other text, structural and mixed batches remeasure.
 */
export function onlyRuleTermDecorations(records) {
  return records.length>0&&records.every(record=>record.type==='childList'&&record.removedNodes.length===1&&record.removedNodes[0].nodeType===3&&
    [...record.addedNodes].some(node=>node.nodeType===1&&node.matches('a.rule-term-link'))&&
    [...record.addedNodes].every(node=>node.nodeType===3||node.nodeType===1&&node.matches('a.rule-term-link'))&&
    [...record.addedNodes].map(node=>node.textContent).join('')===record.removedNodes[0].nodeValue);
}

/** anchor(label,targetId,true,{reference:true}) uses the caller's canonical route.
 * Call link only on selected rule-prose fragments; it never scans another root.
 * {title} suppresses a repeated full-text title prefix on detached fragments.
 */
export function createRuleTermLinker({document,cards,index,anchor,availableTargets}) {
  if(!document||typeof anchor!=='function')throw new TypeError('Rule term links require a document and canonical anchor factory');
  let compiledMatcher;
  const matcher=()=>compiledMatcher ||= createExactTermMatcher({cards,index});
  const processed=new WeakMap();
  const counts={links:0,textNodes:0,byTarget:Object.create(null)};
  const cardMap=cards instanceof Map?cards:new Map((cards||[]).map(card=>[card.id,card]));
  function prepare() {
    const compiled=matcher();
    // Prepare the engine's one- and two-byte string paths against whitespace,
    // never a page text node. No enrolled term can be whitespace-only.
    for(const text of [' ','\u2003',' ','\u2003'])compiled.match(text);
  }
  function link(root,{title=null,ownerRoot=null,outsideTitle=null,boundary=null}={}) {
    if(!root)return {links:0,textNodes:0};
    const available=availableTargets?.();
    // A visible parent section must not scan its still-unseen child cards.
    const filter=boundary?{acceptNode:node=>node.nodeType===1
      ?node!==root&&node.matches(revealBoundary)?2:3
      :node.parentElement?.closest(revealBoundary)===boundary?1:2}:undefined;
    const nodes=[],walker=document.createTreeWalker(root,boundary?5:4,filter);let textNode;
    while((textNode=walker.nextNode()))nodes.push(textNode);
    let added=0,scanned=0;
    for(const node of nodes) {
      const parent=node.parentElement,text=node.nodeValue;
      if(!parent||parent.closest(skip)||processed.get(node)===text)continue;
      const strong=parent.closest('strong,b');
      if(strong&&strong.parentElement?.firstElementChild===strong&&/^\s*:/u.test(strong.nextSibling?.textContent||''))continue;
      processed.set(node,text);scanned++;
      const owner=parent.closest(ownerSelector);
      const ownerTitle=title||(ownerRoot&&!ownerRoot.contains(owner)?outsideTitle:titleFor(owner,cardMap));
      const matches=matcher().match(text,{title:ownerTitle}).filter(match=>!available||available.has(match.targetId));if(!matches.length)continue;
      const fragment=document.createDocumentFragment();let offset=0;
      const appendText=value=>{if(!value)return;const child=document.createTextNode(value);processed.set(child,value);fragment.append(child);};
      for(const match of matches) {
        appendText(text.slice(offset,match.start));
        const reference=anchor(match.text,match.targetId,true,{reference:true});
        if(!reference||reference.tagName!=='A')throw new TypeError('Rule term anchor factory must return a canonical link');
        reference.classList.add('rule-term-link');fragment.append(reference);offset=match.end;added++;
        counts.byTarget[match.targetId]=(counts.byTarget[match.targetId]||0)+1;
      }
      appendText(text.slice(offset));node.replaceWith(fragment);
    }
    counts.links+=added;counts.textNodes+=scanned;return {links:added,textNodes:scanned};
  }
  return Object.freeze({link,prepare,counts,get matcher(){return matcher();}});
}

/** Continuous books keep their existing DOM and Contents geometry. Only the
 * disposable prose decoration waits for the first display of its card/section.
 * Requests retain presenter order and their original detached title context.
 */
export function createVisibleRuleTermLinks({document,cards,linker,lifecycle,onLayout=()=>{},canReveal=()=>true,viewportTop=()=>0}) {
  const cardMap=cards instanceof Map?cards:new Map((cards||[]).map(card=>[card.id,card]));
  const view=document.defaultView,visible=new Set();
  let requests=[],groups=new Map(),revealFrame=0;
  const reveal=boundary=>{
    const pending=groups.get(boundary);if(!pending||!boundary.isConnected)return;
    groups.delete(boundary);visible.delete(boundary);observer?.unobserve(boundary);
    const before=boundary.getBoundingClientRect();
    for(const request of pending)linker.link(request.root,{...request.options,boundary});
    const after=boundary.getBoundingClientRect();
    if(before.width!==after.width||before.height!==after.height)onLayout(boundary);
    boundary.dataset.ruleTermState='ready';
  };
  const scheduleVisible=()=>{if(lifecycle.active&&visible.size&&!revealFrame)revealFrame=lifecycle.frame(()=>{revealFrame=0;flushVisible();});};
  const flushVisible=()=>{
    if(!lifecycle.active)return;
    // Intermediate sections passing through a controlled smooth scroll must
    // not grow above the already measured destination. Keep them pending.
    if(!canReveal()){scheduleVisible();return;}
    if(revealFrame){lifecycle.cancelFrame(revealFrame);revealFrame=0;}
    const top=viewportTop();
    for(const boundary of [...visible]){
      if(!groups.has(boundary)||!boundary.isConnected){visible.delete(boundary);continue;}
      const box=boundary.getBoundingClientRect();
      if(box.bottom>top&&box.top<view.innerHeight&&box.right>0&&box.left<view.innerWidth)reveal(boundary);
    }
  };
  const Observer=view.IntersectionObserver;
  const observer=Observer?new Observer(entries=>{
    if(!lifecycle.active)return;
    for(const entry of entries)if(entry.isIntersecting&&groups.has(entry.target))visible.add(entry.target);else visible.delete(entry.target);
    flushVisible();
  }):null;
  if(observer){lifecycle.listen(view,'scroll',scheduleVisible,{passive:true});lifecycle.listen(view,'resize',scheduleVisible,{passive:true});}
  const reset=()=>{observer?.disconnect();if(revealFrame)lifecycle.cancelFrame(revealFrame);revealFrame=0;requests=[];for(const boundary of groups.keys())delete boundary.dataset.ruleTermState;groups.clear();visible.clear();};
  lifecycle.cleanup(reset);
  return Object.freeze({
    defer(root,options={}){
      if(root)requests.push({root,options:{...options,ownerRoot:root,outsideTitle:titleFor(root.closest(ownerSelector),cardMap)}});
    },
    mount(root,target=null){
      for(const request of requests){
        if(!root.contains(request.root))continue;
        const boundary=request.root.closest(revealBoundary)||request.root;
        const pending=groups.get(boundary);
        if(pending)pending.push(request);
        else{groups.set(boundary,[request]);boundary.dataset.ruleTermState='pending';}
      }
      requests=[];
      // An explicit destination is ready before Contents measures its position.
      if(target)for(const boundary of [...groups.keys()])if(boundary===target||target.contains(boundary))reveal(boundary);
      if(observer)for(const boundary of groups.keys())observer.observe(boundary);
      else for(const boundary of [...groups.keys()])reveal(boundary);
    },
    reset
  });
}
