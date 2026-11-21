import assert from 'node:assert/strict';

/** Independent player-facing guard; retained identity datasets are not leaks. */
export function inspectPlayerDialog(){
  const dialog=document.querySelector('dialog[open]');if(!dialog)return {dialogs:0,leaks:[]};
  const visible=node=>{for(let current=node;current;current=current.parentElement){const style=getComputedStyle(current);if(current.hidden||style.display==='none'||style.visibility==='hidden'||style.opacity==='0')return false;}return !!node.getClientRects().length;};
  const leaks=[],walker=document.createTreeWalker(dialog,NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
    if(!visible(node.parentElement)||node.parentElement.closest('script,style,code[hidden]'))continue;
    const text=node.textContent.trim();
    if(text==='Rule'||text.includes('wargear Ability')||text.includes('Choose a named ability from the Glossary to read its complete rule.')||/\b(?:unit|datasheet|detachment|ability|army-rule|core|refs|bindings)-[a-z0-9][a-z0-9_-]{7,}|(?:^|\s)\/(?:text|title|blocks|fields|semanticContent|qualifications|wargearAbility)(?:\b|\/)/.test(text))leaks.push({reason:'technical-text',text});
  }
  for(const node of dialog.querySelectorAll('a,button,[role="button"]'))if(visible(node)){
    const name=node.getAttribute('aria-label')||node.textContent.trim()||node.querySelector('img[alt]')?.alt;
    if(!name||node.textContent.trim()==='↗')leaks.push({reason:'unnamed-or-arrow-only-action',tag:node.tagName,text:node.textContent});
  }
  return {dialogs:1,leaks};
}

export async function assertPlayerDialog(page){
  const result=await page.evaluate(inspectPlayerDialog);
  assert.equal(result.leaks.length,0,'Player dialog contains technical text or unnamed controls: '+JSON.stringify(result.leaks));
  return result;
}

export async function assertDialogActionLabel(page){
  const dialog=page.locator('dialog[open]');
  assert.equal(await dialog.getByRole('link',{name:'Open full entry',exact:true}).count(),0,'The removed generic action label is absent');
  assert.equal(await dialog.getByRole('link',{name:'Open in Glossary',exact:true}).count(),1,'One explicitly named Glossary action');
}

/** The same title and body have separate elements in a focused rule dialog. */
export async function dialogTextWithRuleCaption(dialog){
  const text=await dialog.innerText(),focused=dialog.locator('.ds-rule-popup');
  if(!await focused.count())return text;
  const title=await focused.locator('.reference-title').innerText(),body=await focused.locator('.reference-definition').innerText();
  return text+'\n'+title+': '+body;
}

/** Full inline source text replaces its redundant title button. Exact canonical
 * navigation remains available in the abbreviated Glossary result. */
export async function openInlineRuleReference(page,metadata,target){
  assert.equal(await metadata.count(),1,'One exact retained canonical source identity');
  assert.equal(await metadata.getAttribute('data-target-id'),target);
  assert.equal(await metadata.isVisible(),false,'Redundant full-text title button is not visible');
  const title=await page.evaluate(id=>ArmyBookAppV2.payload.cards.find(card=>card.id===id).title,target);
  await page.evaluate(query=>ArmyBookAppV2.openGlossary(query),title);
  const result=page.locator(`.v2-glossary-result[data-target-id="${target}"]`);
  assert.equal(await result.count(),1,'Same exact canonical rule is available as an abbreviated Glossary entry');
  return result;
}
