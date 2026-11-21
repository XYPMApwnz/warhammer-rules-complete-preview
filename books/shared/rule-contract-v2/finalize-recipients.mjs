import {compileOwnedBookRecipients,validateBookRecipients} from './recipients.mjs';
import {producerDetachmentTextDeclaration} from '../roster-v2/conditional-policy.mjs';
import {compileOwnedBookConditions} from './conditions-build.mjs';
import {compileOwnedBookSourceRefs,sourceDeclarationView,ownedSourceDeclarationView,registerBookSources} from '../source-refs-v2/source-refs.mjs';

/** Finalize fully lowered producer output. Preserve contract object identity:
 * producer coverage artifacts may already hold references to those contracts.
 * Accepted facts and declaration inputs are not rewritten by this pass. */
export function finalizeRecipientBook(book) {
  return finalize(book,false);
}
/** Runtime binders pass a fresh recipientDeclarationView, never caller facts. */
export function finalizeOwnedRecipientBook(book){return finalize(book,true);}
function finalize(book,owned){
  const entities=book.entities,originalEntities=owned?entities.slice():entities;
  const originalContracts=owned?new Map(originalEntities.map(entity=>[entity.id,entity.ruleContract])):null;
  // sourceDeclarationView creates the isolated scratch graph. Hand ownership
  // through the three existing passes instead of cloning that graph repeatedly.
  const compiled=compileOwnedBookSourceRefs(compileOwnedBookConditions(compileOwnedBookRecipients((owned?ownedSourceDeclarationView:sourceDeclarationView)(book),{f1Declaration:producerDetachmentTextDeclaration})));
  const fields=Object.entries(compiled),index=new Map(compiled.entities.map(entity=>[entity.id,entity]));
  for(const key of Object.keys(book))delete book[key];
  for(const [key,value]of fields)book[key]=key==='entities'?entities:value;
  for(const [i,entity]of originalEntities.entries()){
    if(owned)entities[i]=entity;
    const normalized=index.get(entity.id);
    if(!normalized)throw new TypeError('Recipient finalization lost canonical identity');
    const contract=owned?originalContracts.get(entity.id):entity.ruleContract;
    if(contract&&normalized.ruleContract&&contract!==normalized.ruleContract){
      for(const key of Object.keys(contract))delete contract[key];
      Object.assign(contract,normalized.ruleContract);
    }
    if(normalized===entity){if(contract&&normalized.ruleContract)entity.ruleContract=contract;continue;}
    for(const key of Object.keys(entity))delete entity[key];
    for(const [key,value]of Object.entries(normalized))entity[key]=key==='ruleContract'&&contract?contract:value;
  }
  registerBookSources(book);
  validateBookRecipients(book);
  return book;
}
