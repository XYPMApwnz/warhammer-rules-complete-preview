/** The header transition keeps its original fixture and full historical test. */
import {ACCEPTED_MFM_HISTORY,assertAcceptedMfmTree,assertAcceptedMfmFixture,verifyAcceptedMfmHistory} from './accepted-mfm-history.mjs';
export const PLAIN_HEADER_HISTORY=ACCEPTED_MFM_HISTORY;
const fixture='v2/fixtures/new-recruit-plain-header.json';
export const assertPlainHeaderHistoryTree=root=>assertAcceptedMfmTree(root,'plain-header');
export const assertPlainHeaderFixture=root=>assertAcceptedMfmFixture(fixture,{root,label:'plain-header'});
export function verifyPlainHeaderHistory({root,book,checkout}={}){
 return{...verifyAcceptedMfmHistory({root,checkout,script:'v2/new-recruit-plain-header-qa.mjs',args:book?['--book='+book]:[],fixtures:[fixture],label:'plain-header'}),book:book||'all'};
}
