import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='E:/Warhammer/qa-evidence/markup-unknown-v1-2026-11-21';
const source=JSON.parse(fs.readFileSync(out+'/analysis-input/ALL_UNKNOWN.json'));
const files=['space-marines.json','dark-angels.json','blood-angels-and-other.json'];
const proposals=files.flatMap(file=>JSON.parse(fs.readFileSync(out+'/agent-analysis/'+file)));
const key=r=>r.book+'\0'+r.id,byKey=new Map(source.rows.map(r=>[key(r),r]));
assert.equal(proposals.length,171);assert.equal(new Set(proposals.map(key)).size,171);assert.deepEqual([...new Set(proposals.map(key))].sort(),[...byKey.keys()].sort());
const ownerReason='battlefield-dependent; owner-only (owner decision 2026-11-20)';
const bookLabels={'space-marines':'Space Marines','dark-angels':'Dark Angels','blood-angels':'Blood Angels','death-guard':'Death Guard','chaos-space-marines':'Chaos Space Marines','tyranids':'Tyranids'};
const strings=value=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(strings):value&&typeof value==='object'?Object.values(value).flatMap(strings):[];
const norm=s=>s.replace(/\s+/g,' ').trim();
const rows=proposals.map(proposal=>{
 const original=byKey.get(key(proposal)),texts=original.sourceValues.flatMap(v=>strings(v.value)).join('\n');
 assert(norm(texts).includes(norm(proposal.sourceQuote)),key(proposal)+' quote not in source');assert(norm(proposal.sourceQuote).split(' ').length<=35);
 assert(['TEXT_ONLY_INTENDED','RECIPIENTS_ONLY','EXECUTED','UNKNOWN'].includes(proposal.proposedCategory));assert(['S','M','L'].includes(proposal.size));
 if(proposal.proposedCategory==='UNKNOWN')assert(proposal.nextStep?.trim());
 let physicalOwner=proposal.ownerName||bookLabels[proposal.book]+' army';
 if(original.kind==='ARMY_RULE')physicalOwner=bookLabels[proposal.book]+' army; exact actor/eligible units remain source-defined';
 if(original.kind==='DETACHMENT_RULE')physicalOwner='Selected '+original.owner.name+' detachment / army';
 if(original.kind==='ENHANCEMENT')physicalOwner=(/\bunit only\./i.test(texts)?'Selected upgraded UNIT':'Selected physical bearer MODEL')+'; source detachment '+original.owner.name+'; preserve the exact source eligibility';
 let registryReason=proposal.proposedCategory==='UNKNOWN'?original.currentDecision.reason:ownerReason;
 let presentationScope=proposal.proposedCategory==='TEXT_ONLY_INTENDED'?'OWNER_ONLY':null;
 if(proposal.proposedCategory==='TEXT_ONLY_INTENDED'&&['ARMY_RULE','DETACHMENT_RULE'].includes(original.kind)){
  presentationScope=null;
  registryReason=original.name==='Space Marine Chapters'?'Muster-legality text by product boundary: New Recruit owns army construction; no chapter validator is introduced.':original.name==='Transhuman Strategist'?'Battle-round CP-gain process tied to the source-defined WARLORD; retain army reference text without CP automation or a physical receiver.':original.name==='Special Move Types'?'Battle move/disembark reference: preserve source eligibility and timing without assuming battlefield transport membership.':'Selected army/detachment process permission: deliberate existing reference text; no physical UNIT result or new execution is asserted.';
 }
 if(proposal.proposedCategory==='TEXT_ONLY_INTENDED'&&proposal.name.toUpperCase()==='SUPREME COMMANDER'){
  registryReason='Muster-legality text by product boundary: retain the mandatory WARLORD statement; no automatic assignment or new legality operation.';presentationScope=null;
 }
 let mixed=proposal.mixed,mixedNote=proposal.mixedNote||'';
 if(original.kind==='ENHANCEMENT'){
  mixed=true;mixedNote=proposal.mixedNote||'Roster-side bearer/UNIT eligibility and selection are distinct from the rule\'s battlefield or phase-dependent effect. Preserve the former without making the latter true.';
 }
 if(proposal.book==='chaos-space-marines'){mixed=false;mixedNote='Composite roster rule, not a roster/battlefield mixture: allied identity, factionKeywords replacement and muster points caps require separate proof; no battle-time state is involved.';}
 return{...proposal,physicalOwner,sourceContainerId:original.ownerId,sourceContainerName:original.owner.name||bookLabels[proposal.book]+' army',kind:original.kind,currentCategory:'UNKNOWN',registryReason,presentationScope,
  mixed,mixedNote,currentDecisionReason:original.currentDecision.reason,currentDecisionPartial:original.currentDecision.partial,
  sourceFingerprint:original.sourceFingerprint,bindingFingerprint:original.bindingFingerprint,nativeInput:original.nativeInput,sourceEntityId:original.sourceEntityId,sourceFields:original.sourceFields,
  stage1ProductChange:false,approvalRequired:true};
}).sort((a,b)=>a.book.localeCompare(b.book,'en')||a.id.localeCompare(b.id,'en'));
for(const id of new Set(rows.map(r=>r.id))){
 const group=rows.filter(r=>r.id===id),flagged=group.find(r=>r.principleConflict);
 if(flagged)for(const row of group){row.principleConflict=true;row.conflictNote=flagged.conflictNote;}
 const mixed=group.find(r=>r.mixed);
 if(mixed)for(const row of group){row.mixed=true;if(!row.mixedNote)row.mixedNote=mixed.mixedNote;}
}
for(const row of rows.filter(r=>r.id==='ability-sm-b67c5ff6ac7d4436')){
 row.principleConflict=true;row.conflictNote='A timed friendly-unit selection can include the owner\'s formed unit; it is not an automatic benefit of attachment. Keep the source at its owner until a source-bound battlefield choice exists; do not add a permanent Bodyguard grant.';
}
const categories=['TEXT_ONLY_INTENDED','RECIPIENTS_ONLY','EXECUTED','UNKNOWN'];
const counts=Object.fromEntries(categories.map(category=>[category,rows.filter(r=>r.proposedCategory===category).length]));assert.deepEqual(counts,{TEXT_ONLY_INTENDED:156,RECIPIENTS_ONLY:0,EXECUTED:0,UNKNOWN:15});
const inherited=[];for(const id of new Set(rows.map(r=>r.id))){const same=rows.filter(r=>r.id===id);if(same.length>1){assert.equal(new Set(same.map(r=>r.proposedCategory)).size,1,'Inherited category conflict '+id);inherited.push({id,books:same.map(r=>r.book),category:same[0].proposedCategory});}}
const review=rows.map(row=>{const original=byKey.get(key(row));return{book:row.book,id:row.id,name:row.name,kind:row.kind,nativeInput:row.nativeInput,sourceEntityId:row.sourceEntityId,sourceFields:original.sourceValues,sourceFingerprint:row.sourceFingerprint,bindingFingerprint:row.bindingFingerprint,
 physicalOwner:row.physicalOwner,sourceContainerId:row.sourceContainerId,currentClauses:original.clauses.map(c=>({id:c.id,classification:c.rosterClassification,recipientStatus:c.recipientStatus})),operations:original.operations,consumedPresentationChannels:original.presentationChannels.length,ownerOnlyDiagnosticLinks:original.ownerOnlyDiagnostics?.links?.length??null}});
fs.writeFileSync(out+'/PROPOSALS.json',JSON.stringify({schema:'markup-unknown-stage1-proposals/v1',base:source.base,approvalRequired:true,rows},null,2)+'\n');
fs.writeFileSync(out+'/SOURCE_REVIEW.json',JSON.stringify({schema:'markup-unknown-canonical-source-review/v1',base:source.base,rawHtmlCopied:false,rows:review},null,2)+'\n');
fs.writeFileSync(out+'/PROPOSAL_VALIDATION.json',JSON.stringify({status:'PASS',N:171,uniqueIds:new Set(rows.map(r=>r.id)).size,exactBookIds:true,exactSourceClues:true,sourceQuoteWordLimit:35,sourceFingerprintsRetained:true,counts,inheritedCategoriesAgree:true,inherited,
 byBook:Object.fromEntries([...new Set(rows.map(r=>r.book))].map(book=>[book,Object.fromEntries(categories.map(c=>[c,rows.filter(r=>r.book===book&&r.proposedCategory===c).length]))])),
 flags:{principle1vs2:rows.filter(r=>r.principleConflict).length,mixed:rows.filter(r=>r.mixed).length},implementationPerformed:false},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',N:rows.length,counts,principleFlags:rows.filter(r=>r.principleConflict).length,mixed:rows.filter(r=>r.mixed).length}));
