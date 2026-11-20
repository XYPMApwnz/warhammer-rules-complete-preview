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
access.registerKeywordPassports([sm,ba,da,am,csm,dg,tau,tyr,ec]);
export const {KEYWORD_FORMATS,createKeywordAccess,keywordField,requiredKeywordField,keywordValues,hasKeyword,keywordGroups,keywordScopeGroups,keywordScopesForUnit,profileKeywordScopeIds}=access;
