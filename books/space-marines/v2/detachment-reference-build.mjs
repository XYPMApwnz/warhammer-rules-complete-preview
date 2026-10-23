/** Book-owned reviewed consumer permission over existing canonical references. */
import {buildNativeMfmBook} from './mfm-build.mjs';
import {buildDetachmentReferences as buildReferences,appendDetachmentReferencePresentation as appendPresentation} from '../../shared/roster-v2/detachment-reference-build.mjs';
export {deathwatchDetachmentId} from '../../shared/roster-v2/detachment-reference-build.mjs';
const permission={
 document:'books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html',
 sha256:'DD7420597CCC235859B9326F146964746EFFBC8A48752DA4D622BC99DEE1BED7',
 pointer:'/html/body/div/div[1]/div[3]/div[41]',
 scope:'DEATHWATCH ALLIES; exception to Space Marine Chapters; 500 point cap; Warlord and KILL TEAM Enhancement restrictions remain source text'
};
export function buildDetachmentReferences(native=buildNativeMfmBook()){
 return buildReferences(native,permission);
}
export function appendDetachmentReferencePresentation(payload){
 return appendPresentation(payload,buildDetachmentReferences());
}
