import assert from 'node:assert/strict';

/** Inspect rendered text only; retained provenance datasets are not visibility. */
export async function assertNoVisibleLegacyAttribution(locator){
  const result=await locator.evaluateAll(roots=>{
    let count=0;const first=[];
    const visible=node=>{
      for(let current=node.parentElement;current;current=current.parentElement){
        const style=getComputedStyle(current);
        if(current.hidden||style.display==='none'||['hidden','collapse'].includes(style.visibility)||
          Number(style.opacity)===0||style.contentVisibility==='hidden')return false;
        if(current.tagName==='DETAILS'&&!current.open){
          const summary=current.querySelector(':scope > summary');
          if(!summary?.contains(node))return false;
        }
      }
      const range=document.createRange();range.selectNodeContents(node);
      return [...range.getClientRects()].some(rect=>rect.width>0&&rect.height>0);
    };
    for(const root of roots){
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      for(let node=walker.nextNode();node;node=walker.nextNode()){
        const text=node.textContent.trim();
        if(!/^(?:[·—-]\s*)?(?:Source:|Applies to:)/.test(text)||!visible(node))continue;
        count++;if(first.length<20)first.push({text:text.slice(0,240),tag:node.parentElement.tagName});
      }
    }
    return {count,first};
  });
  assert.equal(result.count,0,'Visible legacy Source/Applies attribution: '+JSON.stringify(result));
}
