import {compileBookRecipients,validateBookRecipients} from './recipients.mjs';
import {producerDetachmentTextDeclaration} from '../roster-v2/conditional-policy.mjs';
import {compileBookConditions} from './conditions-build.mjs';

/** Finalize fully lowered producer output. Preserve contract object identity:
 * producer coverage artifacts may already hold references to those contracts.
 * Accepted facts and declaration inputs are not rewritten by this pass. */
export function finalizeRecipientBook(book) {
  const compiled=compileBookConditions(compileBookRecipients(book,{f1Declaration:producerDetachmentTextDeclaration}));
  for(const [key,value]of Object.entries(compiled))if(key!=='entities')book[key]=value;
  if(!Object.hasOwn(compiled,'rosterContextBindings'))delete book.rosterContextBindings;
  const index=new Map(compiled.entities.map(entity=>[entity.id,entity]));
  for(const entity of book.entities){
    const normalized=index.get(entity.id);
    if(!normalized)throw new TypeError('Recipient finalization lost canonical identity');
    if(!entity.ruleContract)continue;
    const contract=entity.ruleContract;
    for(const key of Object.keys(contract))delete contract[key];
    Object.assign(contract,normalized.ruleContract);
  }
  validateBookRecipients(book);
  return book;
}
