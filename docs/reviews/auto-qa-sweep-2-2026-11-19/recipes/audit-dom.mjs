export function inspectDocument(){
 const visible=n=>!!n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden'&&!n.closest('[aria-hidden="true"],.v2-sr-only,.sr-only,script,style,textarea');
 const main=document.querySelector('dialog[open]')||document.querySelector('main.main,main.v2-main,main.global-glossary-main,main')||document.body;
 const textNodes=[],walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode())if(node.textContent.trim()&&visible(node.parentElement))textNodes.push(node);
 const leaks=[],overflow=[],duplicates=[],empty=[],broken=[];
 const leak=/\b(?:undefined|null|NaN|NOT_PROVEN|REFERENCE_ONLY|BATTLE_ONLY|NEEDS_BINDINGS|KEEP_HIDDEN|ROSTER_EXECUTABLE|UNRESOLVED|UNKNOWN)\b|\[object Object\]|\b(?:unit|detachment|datasheet|refs|bindings)-[a-z0-9][a-z0-9_-]{7,}/g;
 for(const t of textNodes){const s=t.textContent.trim();for(const m of s.matchAll(leak))leaks.push({token:m[0],text:s.slice(0,650),cardId:t.parentElement.closest('[data-card-id],[data-roster-instance-id]')?.dataset.cardId||null,tag:t.parentElement.tagName,classes:t.parentElement.className});
  const card=t.parentElement.closest('article.unit-card,article.v2-card,article.v2-book-record,.model-profile,.weapon-row,.v2-roster-instance');
  if(!card||!s||t.parentElement.closest('svg'))continue;
  const range=document.createRange();range.selectNodeContents(t);const cr=card.getBoundingClientRect();
  for(const r of range.getClientRects())if(r.width>0&&(r.left<cr.left-3||r.right>cr.right+3)){
   let clipped=false;for(let e=t.parentElement;e&&e!==card;e=e.parentElement)if(/auto|scroll|hidden|clip/.test(getComputedStyle(e).overflowX)){clipped=true;break;}
   if(!clipped)overflow.push({text:s.slice(0,220),cardId:card.dataset.cardId||card.dataset.rosterInstanceId,left:r.left,right:r.right,cardLeft:cr.left,cardRight:cr.right});break;
  }
 }
 const cards=[...main.querySelectorAll('article.unit-card,article.v2-book-record,article.v2-roster-instance,article.rule-reference')].filter(visible);
 if(!cards.length)cards.push(main);
 for(const card of cards){const seen=new Map();for(const p of card.querySelectorAll('p')){if(!visible(p)||p.closest('article.unit-card,article.v2-book-record,article.v2-roster-instance,article.rule-reference')!==card&&card!==main)continue;const s=p.innerText.replace(/\s+/g,' ').trim();if(s.length<65)continue;const list=seen.get(s)||[];list.push(p);seen.set(s,list);}for(const [text,list] of seen)if(list.length>1)duplicates.push({cardId:card.dataset.cardId||card.dataset.rosterInstanceId,text,count:list.length,owners:list.map(p=>p.closest('[data-rule-id],[data-source-id],[data-card-id]')?.outerHTML.slice(0,220))});}
 for(const section of main.querySelectorAll('section')){if(!visible(section))continue;const heading=section.querySelector(':scope > h2,:scope > h3,:scope > header h2,:scope > header h3');if(!heading||!visible(heading))continue;const content=section.innerText.replace(heading.innerText,'').trim();if(!content&&!section.querySelector('img,input,select,button,a,table,details'))empty.push({heading:heading.innerText,classes:section.className,cardId:section.closest('[data-card-id]')?.dataset.cardId});}
 for(const img of document.images)if(visible(img)&&img.complete&&!img.naturalWidth&&img.getAttribute('src'))broken.push({src:img.src,alt:img.alt});
 return{url:location.href,title:document.title,textLength:textNodes.reduce((n,t)=>n+t.length,0),pageWidth:document.documentElement.scrollWidth,viewportWidth:document.documentElement.clientWidth,leaks,overflow,duplicates,empty,broken,visibleCards:[...main.querySelectorAll('[data-card-id]')].filter(visible).map(n=>n.dataset.cardId)};
}
