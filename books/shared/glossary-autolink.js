(function(){
  'use strict';

  const SKIP_SELECTOR='a,button,input,textarea,select,option,script,style,code,pre,h1,h2,h3,h4,h5,h6,[data-no-autolink],.toc-panel,.popup-close,.popup-actions,.rule-head,.stratagem-head';
  let activeBook='';
  let matcher=null;
  let termsByToken=new Map();
  let preferredByToken={};
  let lastReport={linked:0,ambiguous:[]};

  const escapeRegExp=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const normalize=value=>String(value||'')
    .replace(/[\u2018\u2019]/g,"'")
    .replace(/[\u2013\u2014]/g,'-')
    .replace(/\s+/g,' ')
    .trim()
    .toLowerCase();
  const tokenPattern=value=>escapeRegExp(value)
    .replace(/'/g,"['\\u2018\\u2019]")
    .replace(/-/g,'[-\\u2013\\u2014]')
    .replace(/ /g,'\\s+');

  function configure(bookId){
    activeBook=bookId||activeBook;
    preferredByToken=window.WH40K_GLOSSARY_MATCHES||{};
    const entries=window.WH40K_GLOSSARY?.linkables?.(activeBook)||[];
    termsByToken=new Map();
    for(const entry of entries){
      for(const label of [entry.title,...(entry.aliases||[]),...(entry.matchLabels||[])]){
        const token=normalize(label);
        if(token.length<3)continue;
        const candidates=termsByToken.get(token)||[];
        if(!candidates.some(candidate=>candidate.id===entry.id))candidates.push(entry);
        termsByToken.set(token,candidates);
      }
    }
    const alternation=[...termsByToken.keys()].sort((a,b)=>b.length-a.length||a.localeCompare(b)).map(tokenPattern).join('|');
    matcher=alternation?new RegExp(`(^|[^A-Za-z0-9])(${alternation})(?=$|[^A-Za-z0-9])`,'gi'):null;
    return entries.length;
  }

  function eligible(node,root){
    const parent=node.parentElement;
    return Boolean(parent&&root.contains(parent)&&node.nodeValue.trim()&&!parent.closest(SKIP_SELECTOR));
  }

  function matches(text,unitId='',glossaryId='',contextTermId=''){
    if(!matcher)return[];
    const found=[];
    matcher.lastIndex=0;
    for(let match=matcher.exec(text);match;match=matcher.exec(text)){
      const prefix=match[1]||'';
      const label=match[2];
      const start=match.index+prefix.length;
      const candidates=termsByToken.get(normalize(label))||[];
      const entry=candidates.find(candidate=>unitId&&(candidate.owners||[]).includes(unitId))
        ||candidates.find(candidate=>glossaryId===`glossary-${candidate.id}`)
        ||candidates.find(candidate=>contextTermId===candidate.id)
        ||candidates.find(candidate=>candidate.termId===preferredByToken[normalize(label)])
        ||(candidates.length===1?candidates[0]:null);
      const display=/^\d{2}\.\d{2}(?:\.\d{2})?$/.test(label)?entry?.title||label:label;
      found.push({start,end:start+label.length,label,display,id:entry?.id||'',ambiguous:!entry,candidates:candidates.map(candidate=>candidate.id)});
      if(matcher.lastIndex===match.index)matcher.lastIndex++;
    }
    return found;
  }

  function textNodes(root){
    const nodes=[];
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    for(let node=walker.nextNode();node;node=walker.nextNode())if(eligible(node,root))nodes.push(node);
    return nodes;
  }

  function linkNode(node,hits){
    const fragment=document.createDocumentFragment();
    const text=node.nodeValue;
    let cursor=0;
    for(const hit of hits){
      fragment.append(text.slice(cursor,hit.start));
      const button=document.createElement('button');
      button.type='button';button.className='term-button';button.dataset.term=hit.id;button.dataset.autolink='true';button.textContent=hit.display;
      fragment.append(button);cursor=hit.end;
    }
    fragment.append(text.slice(cursor));node.replaceWith(fragment);
  }

  function apply(root=document.querySelector('.document'),bookId=''){
    try{
      if(bookId||!matcher)configure(bookId||activeBook);
      if(!root||!matcher)return 0;
      let linked=0;
      const ambiguous=[];
      for(const node of textNodes(root)){
        const contextRoot=node.parentElement.closest('.unit-card,[id^="glossary-"]');
        const unitId=contextRoot?.classList.contains('unit-card')
          ?contextRoot.id
          :(contextRoot?.querySelector('[data-journey-target^="unit-"]')?.dataset.journeyTarget||'');
        const glossaryId=node.parentElement.closest('[id^="glossary-"]')?.id||'';
        const article=node.parentElement.closest('article');
        const contextTermId=article?.querySelector('h1 [data-term],h2 [data-term],h3 [data-term],h4 [data-term],h5 [data-term]')?.dataset.term||'';
        const hits=matches(node.nodeValue,unitId,glossaryId,contextTermId);
        const resolved=hits.filter(hit=>hit.id);
        ambiguous.push(...hits.filter(hit=>hit.ambiguous));
        if(!resolved.length)continue;
        linked+=resolved.length;linkNode(node,resolved);
      }
      lastReport={linked,ambiguous};
      if(root===document.querySelector('.document')){
        document.documentElement.dataset.autolinkCount=String(linked);
        document.documentElement.dataset.autolinkAmbiguous=String(ambiguous.length);
        document.documentElement.dataset.autolinkAmbiguousTerms=ambiguous.slice(0,12).map(hit=>`${hit.label}:${hit.candidates.join('|')}`).join(';');
      }
      return linked;
    }catch(error){
      document.documentElement.dataset.autolinkError=String(error?.message||error);
      console.error('Glossary autolink failed',error);
      return 0;
    }
  }

  function audit(root=document.querySelector('.document')){
    if(!root||!matcher)return[];
    const missing=[];
    for(const node of textNodes(root)){
      const contextRoot=node.parentElement.closest('.unit-card,[id^="glossary-"]');
      const unitId=contextRoot?.classList.contains('unit-card')
        ?contextRoot.id
        :(contextRoot?.querySelector('[data-journey-target^="unit-"]')?.dataset.journeyTarget||'');
      const glossaryId=node.parentElement.closest('[id^="glossary-"]')?.id||'';
      const article=node.parentElement.closest('article');
      const contextTermId=article?.querySelector('h1 [data-term],h2 [data-term],h3 [data-term],h4 [data-term],h5 [data-term]')?.dataset.term||'';
      for(const hit of matches(node.nodeValue,unitId,glossaryId,contextTermId))missing.push({termId:hit.id,text:hit.label,context:node.nodeValue.trim().slice(0,180),ambiguous:hit.ambiguous,candidates:hit.candidates});
    }
    return missing;
  }

  function validate(root,terms){
    const unresolved=[...new Set([...root.querySelectorAll('[data-term]')].map(node=>node.dataset.term).filter(id=>!terms[id]))];
    const missing=lastReport.ambiguous;
    document.documentElement.dataset.autolinkUnresolved=String(unresolved.length);
    document.documentElement.dataset.autolinkMissing=String(missing.length);
    return{unresolved,missing};
  }

  window.WHGlossaryAutolink=Object.freeze({apply,audit,configure,validate});
}());
