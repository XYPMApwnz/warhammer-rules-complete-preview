/** Read keyword facts without changing their source representation or executing
 * grants. Passports choose the native layout; physical projections stay separate. */
import sm from '../../space-marines/book.config.json' with {type:'json'};
import ba from '../../blood-angels/book.config.json' with {type:'json'};
import da from '../../dark-angels/book.config.json' with {type:'json'};
import am from '../../adeptus-mechanicus/book.config.json' with {type:'json'};
import csm from '../../chaos-space-marines/book.config.json' with {type:'json'};
import dg from '../../death-guard/book.config.json' with {type:'json'};
import tau from '../../tau-empire/book.config.json' with {type:'json'};
import tyr from '../../tyranids/book.config.json' with {type:'json'};
import ec from '../../emperors-children/book.config.json' with {type:'json'};

import {keywordAccess as access} from '../keyword-values.mjs';
const books=[sm,ba,da,am,csm,dg,tau,tyr,ec];
const passports=new Map(books.map(book=>[book.id,book.passport]));
/** Reuse the already-loaded owner descriptors without fetching book config again. */
export function getBookPassport(bookId){return passports.get(bookId);}
access.registerKeywordPassports(books);
export const {KEYWORD_FORMATS,createKeywordAccess,keywordField,requiredKeywordField,keywordValues,hasKeyword,keywordGroups,keywordScopeGroups,keywordScopesForUnit,profileKeywordScopeIds}=access;
