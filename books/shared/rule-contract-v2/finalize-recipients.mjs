import {compileBookRecipients,validateBookRecipients} from './recipients.mjs';
import {producerDetachmentTextDeclaration} from '../roster-v2/conditional-policy.mjs';
import {compileBookConditions} from './conditions-build.mjs';
import {compileBookSourceRefs,sourceDeclarationView,registerBookSources} from '../source-refs-v2/source-refs.mjs';

/** Finalize fully lowered producer output. Preserve contract object identity:
 * producer coverage artifacts may already hold references to those contracts.
 * Accepted facts and declaration inputs are not rewritten by this pass. */
export function finalizeRecipientBook(book) {
  const compiled=compileBookSourceRefs(compileBookConditions(compileBookRecipients(sourceDeclarationView(book),{f1Declaration:producerDetachmentTextDeclaration})));
  const entities=book.entities;
  for(const key of Object.keys(book))delete book[key];
  for(const [key,value]of Object.entries(compiled))book[key]=key==='entities'?entities:value;
  const index=new Map(compiled.entities.map(entity=>[entity.id,entity]));
  for(const entity of book.entities){
    const normalized=index.get(entity.id);
    if(!normalized)throw new TypeError('Recipient finalization lost canonical identity');
    const contract=entity.ruleContract;
    if(contract&&normalized.ruleContract){
      for(const key of Object.keys(contract))delete contract[key];
      Object.assign(contract,normalized.ruleContract);
    }
    for(const key of Object.keys(entity))delete entity[key];
    for(const [key,value]of Object.entries(normalized))entity[key]=key==='ruleContract'&&contract?contract:value;
  }
  registerBookSources(book);
  validateBookRecipients(book);
  return book;
}
