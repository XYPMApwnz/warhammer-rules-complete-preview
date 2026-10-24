/** Book-owned reviewed consumer permission over existing canonical references. */
import {buildNativeMfmBook} from '../../space-marines/v2/mfm-build.mjs';
import {buildDetachmentReferences as buildReferences,appendDetachmentReferencePresentation as appendPresentation} from '../../shared/roster-v2/detachment-reference-build.mjs';
export {deathwatchDetachmentId} from '../../shared/roster-v2/detachment-reference-build.mjs';
const permission={
 document:'books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html',
 sha256:'1843A4B2841F7C404CEF7C1B797CFC4344F39B8063ADB236B1DF63A5F43332D4',
 pointer:'/html/body/div/div[1]/div[3]/div[25]',
 scope:'DEATHWATCH ALLIES; exception to Space Marine Chapters; 500 point cap; Warlord and KILL TEAM Enhancement restrictions remain source text'
};
export function buildDetachmentReferences(native=buildNativeMfmBook()){
 return buildReferences(native,permission);
}
export function appendDetachmentReferencePresentation(payload){
 return appendPresentation(payload,buildDetachmentReferences());
}
