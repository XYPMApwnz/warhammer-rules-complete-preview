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

/** anchor(label,targetId,true,{reference:true}) uses the caller's canonical route.
 * Call link only on selected rule-prose fragments; it never scans another root.
 * {title} suppresses a repeated full-text title prefix on detached fragments.
 */
export function createRuleTermLinker({document,cards,index,anchor}) {
  if(!document||typeof anchor!=='function')throw new TypeError('Rule term links require a document and canonical anchor factory');
  const matcher=createExactTermMatcher({cards,index}),processed=new WeakMap();
  const counts={links:0,textNodes:0,byTarget:Object.create(null)};
  const cardMap=cards instanceof Map?cards:new Map((cards||[]).map(card=>[card.id,card]));
  function link(root,{title=null}={}) {
    if(!root)return {links:0,textNodes:0};
    const nodes=[],walker=document.createTreeWalker(root,4);let textNode;
    while((textNode=walker.nextNode()))nodes.push(textNode);
    let added=0,scanned=0;
    for(const node of nodes) {
      const parent=node.parentElement,text=node.nodeValue;
      if(!parent||parent.closest(skip)||processed.get(node)===text)continue;
      const strong=parent.closest('strong,b');
      if(strong&&strong.parentElement?.firstElementChild===strong&&/^\s*:/u.test(strong.nextSibling?.textContent||''))continue;
      processed.set(node,text);scanned++;
      const owner=parent.closest('[data-card-id],[data-canonical-id],[data-rule-term-title]');
      const ownerTitle=title||owner?.dataset.ruleTermTitle||cardMap.get(owner?.dataset.cardId||owner?.dataset.canonicalId)?.title;
      const matches=matcher.match(text,{title:ownerTitle});if(!matches.length)continue;
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
  return Object.freeze({link,counts,matcher});
}
