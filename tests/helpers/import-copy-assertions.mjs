/** Player-authored export input is deliberately separate from app-authored copy.
 * Native option captions and accessible names are checked even when the browser
 * does not expose them as ordinary text nodes with layout rectangles. */
import assert from 'node:assert/strict';

const forbidden=[
  /\b(?:NOT_PROVEN|REFERENCE_ONLY|UNKNOWN|BATTLE_ONLY|KEEP_HIDDEN)\b/,
  /\b(?:canonical|physical|bindings?|MFM)\b/i,
  /\bsource entr(?:y|ies)\b/i,
  /\b(?:parsed-unit|unit|datasheet|detachment|refs|bindings)-[a-z0-9][a-z0-9:_.\/-]*/i
];

export function assertPlayerImportCopy(records){
  for(const row of records)for(const pattern of forbidden)
    assert.doesNotMatch(row.text,pattern,`Internal import copy in ${row.location}: ${JSON.stringify(row.text)}`);
  return records.length;
}

/** This function is intentionally self-contained for Playwright evaluate(). */
export function collectPlayerImportCopy(root){
  const records=[{location:'Attachment Setup text',text:root.innerText}];
  const visible=node=>Boolean(node.getClientRects().length)&&getComputedStyle(node).visibility!=='hidden';
  for(const node of root.querySelectorAll('[aria-label],[placeholder],[title]')){
    if(node.matches('textarea[data-roster-input="raw-text"]')){
      // The placeholder and accessible field label belong to the app. The
      // editable value itself is the user's original export and is not copied.
      for(const name of ['aria-label','placeholder'])if(node.hasAttribute(name))
        records.push({location:'export field '+name,text:node.getAttribute(name)});
      continue;
    }
    if(!visible(node))continue;
    for(const name of ['aria-label','placeholder','title'])if(node.hasAttribute(name))
      records.push({location:node.tagName.toLowerCase()+' '+name,text:node.getAttribute(name)});
  }
  for(const select of root.querySelectorAll('select'))if(visible(select))
    for(const option of select.options)
      records.push({location:'select option',text:option.textContent});
  return records;
}
