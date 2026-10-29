import {prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
/** Reviewed consumer permission; canonical facts remain Deathwatch-owned. */
import {buildNativeMfmBook} from '../../space-marines/v2/mfm-build.mjs';
import {buildDetachmentReferences as buildReferences,appendDetachmentReferencePresentation as appendPresentation} from '../../shared/roster-v2/detachment-reference-build.mjs';
export {deathwatchDetachmentId} from '../../shared/roster-v2/detachment-reference-build.mjs';
const permission={
 document:'books/dark-angels/v2/sources/raw/wahapedia-dark-angels-main.html',
 sha256:'67E319B48234DFE7CA854A66E3408146FE637ACB4722AC1DFBC5FC86847DE3DC',
 pointer:'//*[@id="Deathwatch-Support"]',
 scope:'DEATHWATCH ALLIES; exception to Space Marine Chapters; 500 point cap; Warlord and KILL TEAM Enhancement restrictions remain source text'
};
export function buildDetachmentReferences(native=buildNativeMfmBook()){
  native={...native,model:prepareSourceProducer(native.model),payload:prepareSourceProducer(native.payload)};
 return buildReferences(native,permission);
}
export function appendDetachmentReferencePresentation(payload){
 return appendPresentation(payload,buildDetachmentReferences());
}
