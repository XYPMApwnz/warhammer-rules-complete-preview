/** Add source-proven import names to the existing PROFILE/composition vocabulary.
 * No canonical record, quantity, equipment selection or gameplay rule is edited. */
export function appendModelNameAliases(identityAliases,data,compositions=[]){
 if(data?.schema!=='new-recruit-model-aliases/v1'||!Array.isArray(data.identityAliases))throw new TypeError('Invalid MODEL name vocabulary');
 for(const alias of data.identityAliases){
  if(!identityAliases.some(row=>row.canonicalId===alias.canonicalId&&row.labels.includes(alias.labels[0])))identityAliases.push(structuredClone(alias));
  // Supplement importers independently certify the physical composition member.
  // Extend only the exact source-evidenced member, never all of a profile's uses.
  const members=compositions.filter(row=>row.profileId===alias.canonicalId&&row.id===alias.evidence.entityId);
  if(members.length>1)throw new TypeError('Ambiguous MODEL name composition evidence');
  if(members.length===1){
   const member=members[0],added=alias.labels.filter(label=>!member.labels.includes(label));
   if(added.length)member.bsdataModelNameLabels=[...new Set([...(member.bsdataModelNameLabels||[]),...added])];
   member.labels=[...new Set([...member.labels,...alias.labels])];
  }
 }
 return identityAliases;
}
