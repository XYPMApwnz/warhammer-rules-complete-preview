const normalize=value=>String(value||'').replace(/[‘’]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();

// A unique heading is not necessarily an unambiguous prose reference. Contextual
// headings remain reachable by explicit citation, never by a naked title match.
export function createAutolinkTerms({terms,termByCode,referenceOnlyIds=[],ignoredLabels=new Set()}){
  const byId=new Map(terms.map(term=>[term.id,term]));
  const referenceOnly=new Set(referenceOnlyIds);
  for(const id of referenceOnly)if(!byId.has(id))throw new Error(`Unknown contextual autolink owner: ${id}`);
  const candidates=new Map();
  for(const term of terms){
    for(const label of [term.title?.en,...(term.aliases||[]),...(term.matchLabels||[])]){
      const token=normalize(label);
      if(token.length<3||ignoredLabels.has(token))continue;
      const entries=candidates.get(token)||[];
      if(!entries.some(entry=>entry.id===term.id))entries.push(term);
      candidates.set(token,entries);
    }
  }
  // Explicit canonical citations retain their existing resolution path.
  for(const [code,term] of termByCode)candidates.set(normalize(code),[term]);
  return new Map([...candidates].filter(([token,entries])=>entries.length===1&&(!referenceOnly.has(entries[0].id)||termByCode.get(token)?.id===entries[0].id)).map(([token,entries])=>[token,entries[0]]));
}
