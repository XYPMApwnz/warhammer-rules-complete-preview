/** Read-only inventory. No import service, effect executor, producer, or network. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=process.argv[2]||'E:/Warhammer/worktrees/roster-navigation-v1';
const out=path.dirname(fileURLToPath(import.meta.url));
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
const source=fs.readFileSync(path.join(root,'books/shared/roster-v2/import.mjs'),'utf8');
const norm=source.slice(source.indexOf('export const normalizeImportLabel'),source.indexOf('const entryLabel'));
const plausible=source.slice(source.indexOf('const plausible ='),source.indexOf('function identityCandidates'));
const original=source.slice(source.indexOf('function selectionCandidates('),source.indexOf('\nfunction splitGear('));
const needle='return {exact:unique(groups.get(key) || []),plausible:';
if(!original.includes(needle))throw Error('Native candidate function changed; inspect instrumentation');
const instrumented=original.replace(needle,'return {allGroups:[...groups].map(([label,bindings])=>({label,bindings:unique(bindings)})),exact:unique(groups.get(key) || []),plausible:');
const kindDeclaration=source.slice(source.indexOf('const equipmentKinds ='),source.indexOf('\nconst quantity ='));
const {selectionCandidates}=await import('data:text/javascript;base64,'+Buffer.from('const clone=structuredClone;\n'+kindDeclaration+norm+plausible+instrumented+'\nexport {selectionCandidates};').toString('base64'));
const codeHashes=new Map();
const hashFile=relative=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,relative))).digest('hex');
const moduleAt=async relative=>{codeHashes.set(relative,hashFile(relative));return import(pathToFileURL(path.join(root,relative)));};
const {createEquipmentReferenceResolver}=await moduleAt('books/shared/army-book-app-v2/equipment-reference.mjs');
const {loadDetachmentPresentationSources}=await moduleAt('books/shared/army-book-app-v2/personal.mjs');
const {focusedRuleField}=await moduleAt('books/shared/army-book-app-v2/rule-popup.mjs');
const rows=[],summary=[],sourceRows=[],inputs=[],missing=[],contractTargets=[],lexicalOnly=[],excludedWeaponEquipment=[],coverage=[];
const pointer=p=>'/'+p.map(s=>String(s).replaceAll('~','~0').replaceAll('/','~1')).join('/');
const canonical=v=>JSON.stringify(v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(canonical(v[k]))])):v);
const single=(card,key)=>card?.fields.find(f=>(f.presentationPath??f.source?.path)==='/'+key);
const exactPaths=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const candidateRef=({owner,effect})=>({ruleId:owner.id,ruleKind:owner.kind,fieldPath:effect.source.path,factId:effect.id,text:effect.value});
for(const book of books){
 const readPaths=new Set();
 const read=relative=>{readPaths.add(relative);return JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));};
 const payload=read(`books/${book}/v2/generated/app-presentation.json`),cards=new Map(payload.cards.map(c=>[c.id,c]));
 const nativeFile=book==='death-guard'?'rule-contract-effective':book==='adeptus-mechanicus'?'roster-runtime':'roster-import';
 const native=read(`books/${book}/v2/generated/${nativeFile}.json`);
 let metadata=native.importBindings||{};
 if(['death-guard','chaos-space-marines'].includes(book))metadata=(await moduleAt(`books/${book}/v2/roster-import-bindings.mjs`)).buildImportBindings(native,book==='chaos-space-marines'?{modelNames:read(`books/${book}/v2/model-name-aliases.json`)}:{});
 if(book==='adeptus-mechanicus'){
  const aliases=read(`books/${book}/v2/roster-import-aliases.json`);
  metadata={weaponSelections:aliases.weaponSelections,equipmentSelections:(await moduleAt(`books/${book}/v2/roster-import.mjs`)).withEquipmentCaptionBindings(native).rosterEquipmentCaptionBindings};
 }
 const entities=new Map(native.entities.map(e=>[e.id,e])),units=native.entities.filter(e=>e.kind==='DATASHEET');
 const rules=await loadDetachmentPresentationSources({payload,assetBaseURL:pathToFileURL(path.join(root,`books/${book}/v2/registration.mjs`)),fetch:async url=>{
  const file=fileURLToPath(url),relative=path.relative(root,file).replaceAll('\\','/');readPaths.add(relative);
  if(!fs.existsSync(file))return {ok:false};const text=fs.readFileSync(file,'utf8');return {ok:true,text:async()=>text,json:async()=>JSON.parse(text)};
 }});
 const resolver=createEquipmentReferenceResolver({cards,rules}),boundAbilities=payload.datasheetPresentation?.normal?.boundAbilities||[];
 const found=new Map(),allUnitIds=new Set(units.map(u=>u.id));let aliasRows=0,excludedProvidedWeapon=0;
 for(const entity of native.entities){
  if(!allUnitIds.has(entity.parentId))continue;
  if(entity.kind==='WARGEAR_OPTION')sourceRows.push({book,unitId:entity.parentId,entityId:entity.id,path:'/text',category:'WARGEAR_OPTION',text:entity.data.text});
  if(entity.data.wargearAbility===true||['EQUIPMENT_ABILITY','WARGEAR_ABILITY'].includes(entity.kind))sourceRows.push({book,unitId:entity.parentId,entityId:entity.id,path:'/text',category:'CANONICAL_EQUIPMENT_ABILITY',text:entity.data.text});
  for(const [i,block] of (entity.data.blocks||[]).entries())if(block.wargearAbility===true)sourceRows.push({book,unitId:entity.parentId,entityId:entity.id,path:`/blocks/${i}/text`,category:'MARKED_WARGEAR_ABILITY',text:block.text});
 }
 for(const rule of rules.values())for(const clause of rule.ruleContract?.clauses||[]){
  const requirements=[];
  if(clause.canonicalEquipmentRequirement)requirements.push({entityId:clause.canonicalEquipmentRequirement.entityId,field:clause.canonicalEquipmentRequirement.field});
  for(const effect of clause.rosterEffects||[])if(effect.equipmentRequirement?.binding==='SOURCE'&&effect.equipmentRequirement.kind==='EQUIPMENT_PRESENT')requirements.push({entityId:effect.equipmentRequirement.equipmentId,field:effect.equipmentRequirement.sourceFieldPath});
  for(const requirement of requirements)contractTargets.push({book,unitId:rule.parentId,ruleId:rule.id,clauseId:clause.id,equipmentId:requirement.entityId,requiredPath:requirement.field?pointer(requirement.field):null,sourceFields:clause.sourceFields});
 }
 for(const unit of units){
  const groups=selectionCandidates(entities,unit,'',metadata.weaponSelections||[],metadata.equipmentSelections||[]).allGroups;
  for(const {label,bindings}of groups)for(const selection of bindings){
   if(!selection.canonicalEquipmentIds?.length||selection.canonicalProfileIds?.length)continue;
   const declarations=(metadata.equipmentSelections||[]).filter(b=>b.ownerId===unit.id&&exactPaths(b.canonicalEquipmentIds,selection.canonicalEquipmentIds)&&exactPaths(b.canonicalFieldPaths,selection.canonicalFieldPaths)&&exactPaths(b.sourceReferences||[],selection.sourceReferences||[]));
   const sameLabel=declarations.filter(b=>b.label.normalize('NFKD').replace(/\p{M}/gu,'').replace(/[’‘']/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()===label);
   const declaration=sameLabel.length===1?sameLabel[0]:declarations.length===1?declarations[0]:null;
   if(declaration?.providedWeaponProfileIds?.length){excludedProvidedWeapon++;excludedWeaponEquipment.push({book,unitId:unit.id,label:declaration.label,declaration,selection});continue;}
   const hasExplicitMarker=selection.canonicalEquipmentIds.some(id=>(selection.canonicalFieldPaths?.[id]||[]).some(p=>sourceRows.some(s=>s.book===book&&s.entityId===id&&s.path===p&&s.category!=='WARGEAR_OPTION')))||(selection.sourceReferences||[]).some(ref=>sourceRows.some(s=>s.book===book&&s.entityId===ref.entityId&&s.path===ref.path&&s.category!=='WARGEAR_OPTION'));
   if(!declaration&&!hasExplicitMarker){lexicalOnly.push({book,unitId:unit.id,unitTitle:cards.get(unit.id)?.title,label,selection,reason:'No explicit native equipment binding or canonical equipment-ability marker; shared lexical clause candidate is not proof of a distinct nonweapon item.'});continue;}
   const genericId=declaration?.genericEquipmentId||null;
   const captionRefs=(selection.sourceReferences||[]).filter(ref=>ref.caption).map(ref=>({entityId:ref.entityId,path:ref.path,caption:ref.caption}));
   const identity={unitId:unit.id,canonicalEquipmentIds:selection.canonicalEquipmentIds,canonicalFieldPaths:selection.canonicalFieldPaths,sourceEquipmentIdentity:genericId,captionReferences:captionRefs};
   const key=canonical(identity);aliasRows++;
   if(found.has(key)){found.get(key).labels.push(label);continue;}
   const checks=[];
   for(const id of selection.canonicalEquipmentIds){
    const target=cards.get(id);if(!target)throw Error('Missing published equipment '+book+' '+id);
    const paths=selection.canonicalFieldPaths[id]||[],selectedField=target.fields.find(f=>paths.includes(f.source?.path))||single(target,'text');
    const equipment=selection.canonicalEquipmentIds.length===1;
    const references=equipment?(selection.sourceReferences||[]).flatMap(ref=>{const owner=cards.get(ref.entityId),effect=owner?.fields.find(f=>f.source?.path===ref.path),marker=owner?.fields.find(f=>f.source?.path===ref.path.replace(/\/text$/,'/wargearAbility'));return typeof effect?.value==='string'&&marker?.value===true?[{owner,effect}]:[];}):[];
    const generic=cards.get(genericId),genericField=generic?.kind==='EQUIPMENT_RULE'&&single(generic,'text');
    const marker=target.fields.find(f=>f.source?.path===selectedField?.source?.path?.replace(/\/text$/,'/wargearAbility'));
    const direct=equipment&&(['ABILITY','WARGEAR_ABILITY','SUPPLEMENTAL_DATASHEET_RULE','EQUIPMENT_RULE'].includes(target.kind)||target.kind==='DATASHEET_SECTION'&&marker?.value===true)&&selectedField;
    const bound=boundAbilities.filter(b=>b.unitId===unit.id&&b.itemId===id).map(b=>({owner:cards.get(b.ruleId),effect:cards.get(b.ruleId)?.fields.find(f=>f.source?.path===b.fieldPath)})).filter(v=>v.effect);
    const contract=resolver.resolve(unit.id,id,selection);
    const candidates=genericField?[{owner:generic,effect:genericField}]:direct?[{owner:target,effect:selectedField}]:references.length?references:bound.length?bound:contract;
    const supported=candidates.filter(v=>v.owner.kind!=='WARGEAR_OPTION'&&focusedRuleField(v.owner,{fieldPath:v.effect.source.path})===v.effect);
    const distinct=[...new Map(supported.map(v=>[v.effect.id,v])).values()];
    checks.push({equipmentId:id,equipmentKind:target.kind,equipmentTitle:target.title,paths,
     helperCount:contract.length,helperEffects:contract.map(candidateRef),presenterStatus:distinct.length===1?'LINKED':distinct.length>1?'AMBIGUOUS':'UNLINKED',
     presenterRoute:genericField?'generic-source-equipment':direct?'selected-marked-ability':references.length?'explicit-marked-source-reference':bound.length?'normal-bound-ability':contract.length?'explicit-native-contract':'none',presenterEffects:distinct.map(candidateRef)});
   }
   const row={book,unitId:unit.id,unitTitle:cards.get(unit.id)?.title,identity,labels:[label],declarationLabel:declaration?.label||null,checks};found.set(key,row);
  }
 }
 const bookRows=[...found.values()];rows.push(...bookRows);
 const missingDeclarations=(metadata.equipmentSelections||[]).filter(binding=>!binding.providedWeaponProfileIds?.length&&!bookRows.some(r=>r.unitId===binding.ownerId&&exactPaths(r.identity.canonicalEquipmentIds,binding.canonicalEquipmentIds)&&exactPaths(r.identity.canonicalFieldPaths,binding.canonicalFieldPaths)&&(r.identity.sourceEquipmentIdentity||null)===(binding.genericEquipmentId||null)));
 coverage.push({book,explicitNonweaponDeclarations:(metadata.equipmentSelections||[]).filter(binding=>!binding.providedWeaponProfileIds?.length).length,missingDeclarations});
 if(missingDeclarations.length)throw Error('Explicit equipment binding omitted: '+book);
 const addressed=new Set(bookRows.flatMap(r=>[...r.checks.flatMap(c=>c.paths.map(p=>c.equipmentId+'::'+p)),...r.checks.flatMap(c=>c.presenterEffects.map(e=>e.ruleId+'::'+e.fieldPath))]));
 for(const binding of metadata.equipmentSelections||[])if(!binding.providedWeaponProfileIds?.length)for(const ref of [...binding.evidence||[],...binding.sourceOccurrences||[],...binding.sourcePermissionReferences||[]])addressed.add(ref.entityId+'::'+ref.path);
 const notCandidates=sourceRows.filter(r=>r.book===book&&!addressed.has(r.entityId+'::'+r.path));
 missing.push(...notCandidates);
 const helper=bookRows.filter(r=>r.checks.every(c=>c.helperCount>0)),linked=bookRows.filter(r=>r.checks.every(c=>c.presenterStatus==='LINKED'));
 summary.push({book,datasheets:units.length,datasheetsWithEquipment:new Set(bookRows.map(r=>r.unitId)).size,nonweaponEquipmentIdentities:bookRows.length,distinctUnitEquipmentEntityPairs:new Set(bookRows.flatMap(r=>r.checks.map(c=>JSON.stringify([r.unitId,c.equipmentId])))).size,
  aliasCandidates:aliasRows,excludedProvidedWeaponCandidates:excludedProvidedWeapon,helperResolvable:helper.length,helperExactlyOne:helper.filter(r=>r.checks.every(c=>c.helperCount===1)).length,
  presenterLinked:linked.length,presenterUnlinked:bookRows.filter(r=>r.checks.some(c=>c.presenterStatus==='UNLINKED')).length,presenterAmbiguous:bookRows.filter(r=>r.checks.some(c=>c.presenterStatus==='AMBIGUOUS')).length,
  optionRows:sourceRows.filter(r=>r.book===book&&r.category==='WARGEAR_OPTION').length,markedAbilityBlocks:sourceRows.filter(r=>r.book===book&&r.category==='MARKED_WARGEAR_ABILITY').length,canonicalEquipmentAbilityEntities:sourceRows.filter(r=>r.book===book&&r.category==='CANONICAL_EQUIPMENT_ABILITY').length,unclassifiedSourceRows:notCandidates.length,lexicalOnlyCandidates:lexicalOnly.filter(r=>r.book===book).length});
 inputs.push({book,nativeFile,retainedRuleCount:rules.size,readPaths:[...readPaths].sort(),sha256:Object.fromEntries([...readPaths].filter(p=>fs.existsSync(path.join(root,p))).sort().map(p=>[p,hashFile(p)]))});
 console.log(book+': '+bookRows.length+' identities, '+helper.length+' helper-resolvable, '+linked.length+' presenter-linked');
}
const result={sha:'c477d20aaa16f850b56f18aa878d6b5fb8b4057f',root,method:'Complete sequential enumeration of native candidate groups for every canonical DATASHEET in nine published books. The production selectionCandidates body is unchanged except adding allGroups to its returned object. Native book bindings are loaded without running services. Equipment candidates with profiles or declared providedWeaponProfileIds are excluded. Candidates require explicit native equipment binding or source equipment-ability marker; shared lexical clauses alone are recorded separately. Identity uses UNIT + canonical equipment IDs/paths + genericEquipmentId + exact caption span where a source row names several items. Aliases do not establish effect relations.',instrumentedFunctionSha256:crypto.createHash('sha256').update(original).digest('hex'),codeSha256:Object.fromEntries(codeHashes),coverage,summary,rows,sourceRows,unclassifiedSourceRows:missing,lexicalOnlyCandidates:lexicalOnly,excludedWeaponEquipment,contractTargets,inputs};
fs.writeFileSync(path.join(out,'ALL_DATASHEET_EQUIPMENT_INVENTORY.json'),JSON.stringify(result,null,2)+'\n');
const esc=v=>String(v??'—').replaceAll('|','\\|').replaceAll('\n',' ');
const sums=Object.fromEntries(Object.keys(summary[0]).filter(k=>k!=='book').map(k=>[k,summary.reduce((n,r)=>n+r[k],0)]));
const md=['# All-datasheet native equipment inventory','',`Snapshot: \`${result.sha}\`. Read-only, all ${sums.datasheets} datasheets across all nine book contexts, zero builds/import services/network.`, '',result.method,'',
 '## Counting boundary','',
 'The primary denominator is canonical selectable equipment identity occurrences per UNIT, not a global unique named item catalog, roster observations, raw option rows, aliases, or quantities. Exact source caption spans distinguish several selectable items stored in one option field; generic equipment IDs distinguish drone types. Repeated aliases with the same identity count once. The SM dependency remains repeated in DA/BA book-context totals; the total is not globally deduplicated.', '',
 'Equipment with a weapon profile, including explicitly provided drone weapon profiles, is excluded. A source-backed equipment item may own an entire ability block rather than a separate equipment entity. The secondary entity-pair count deliberately collapses distinct fields/items sharing one entity and therefore is not the primary item count.', '',
 '**The helper-only count is distinct from the existing presenter count.** equipment-reference.mjs handles native canonicalEquipmentRequirement / SOURCE EQUIPMENT_PRESENT contract relations. The presenter additionally supports the selected marked ability itself, explicit marked source references, normal.boundAbilities and generic equipment IDs. A helper count of zero does not mean the UI has no explicit relationship.', '',
 '| Book | Datasheets | With equipment | Nonweapon identities | Entity pairs | Aliases | Helper resolves | Helper exactly one | Presenter linked | Unlinked | Ambiguous |',
 '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
 ...summary.map(r=>`| ${r.book} | ${r.datasheets} | ${r.datasheetsWithEquipment} | ${r.nonweaponEquipmentIdentities} | ${r.distinctUnitEquipmentEntityPairs} | ${r.aliasCandidates} | ${r.helperResolvable} | ${r.helperExactlyOne} | ${r.presenterLinked} | ${r.presenterUnlinked} | ${r.presenterAmbiguous} |`),
 `| TOTAL book contexts | ${sums.datasheets} | ${sums.datasheetsWithEquipment} | ${sums.nonweaponEquipmentIdentities} | ${sums.distinctUnitEquipmentEntityPairs} | ${sums.aliasCandidates} | ${sums.helperResolvable} | ${sums.helperExactlyOne} | ${sums.presenterLinked} | ${sums.presenterUnlinked} | ${sums.presenterAmbiguous} |`, '',
 '## Exact identities without a helper contract relation','',
 '| Book | UNIT | Source caption / accepted alias | Equipment ID and exact path | Other explicit presenter route | Presenter state |',
 '|---|---|---|---|---|---|',
 ...rows.filter(r=>r.checks.some(c=>!c.helperCount)).map(r=>`| ${r.book} | ${esc(r.unitTitle)} — \`${r.unitId}\` | ${esc(r.declarationLabel||r.labels.join('; '))} | ${r.checks.filter(c=>!c.helperCount).map(c=>'`'+c.equipmentId+'::'+c.paths.join(',')+'`').join('; ')} | ${r.checks.map(c=>c.presenterRoute).join('; ')} | ${r.checks.map(c=>c.presenterStatus).join('; ')} |`), '',
 '## Exact identities without any presenter relationship','',
 ...rows.filter(r=>r.checks.some(c=>c.presenterStatus==='UNLINKED')).map(r=>`- ${r.book}: ${r.unitTitle} (\`${r.unitId}\`), ${esc(r.declarationLabel||r.labels.join('; '))}: ${r.checks.filter(c=>c.presenterStatus==='UNLINKED').map(c=>'`'+c.equipmentId+'::'+c.paths.join(',')+'`').join('; ')}`),
 ...(sums.presenterUnlinked?[]:['None in this native selectable-equipment universe.']), '',
 '## Ambiguous effects','',
 ...rows.filter(r=>r.checks.some(c=>c.presenterStatus==='AMBIGUOUS')).map(r=>`- ${r.book}: \`${r.unitId}\`, ${esc(r.labels.join('; '))}: multiple exact effect fields; see JSON.`),
 ...(sums.presenterAmbiguous?[]:['None.']), '',
 '## Raw source coverage and limits','',
 '| Book | All wargear option rows | Marked ability blocks | Canonical equipment abilities | Source rows not addressed by equipment bindings/effect links | Excluded provided-weapon candidates | Lexical-only clause candidates |',
 '|---|---:|---:|---:|---:|---:|---:|---:|',...summary.map(r=>`| ${r.book} | ${r.optionRows} | ${r.markedAbilityBlocks} | ${r.canonicalEquipmentAbilityEntities} | ${r.unclassifiedSourceRows} | ${r.excludedProvidedWeaponCandidates} | ${r.lexicalOnlyCandidates} |`),'',
 'Fixed/non-selectable canonical equipment ability entities are included in the source coverage scan. Every nonweapon canonical equipment ability is already addressed by an enumerated native identity or explicit linked effect; this does not require that it be optional. The two uncovered marked Tau blocks belong to explicitly excluded weapon-providing MV15 Gun Drone and Recon Drone selections. Contract equipment targets are also retained independently, and every retained target has an enumerated identity. Every explicit native nonweapon equipment declaration is represented (coverage assertion in recipe). Canonical generic equipment rules retain their original global IDs through each unit occurrence.', '',
 '### Shared lexical-only clause candidates (excluded from nonweapon item denominator)','',
 ...lexicalOnly.map(r=>`- ${r.book}, ${r.unitTitle} (\`${r.unitId}\`): \`${r.selection.canonicalEquipmentIds.join(',')}\` ${esc(r.label)}.`),'',
 'All raw WARGEAR_OPTION rows and wargearAbility-marked blocks are retained in JSON, including rows not admitted as nonweapon candidates. These unclassified rows include weapon replacement choices, combined/multiple-choice clauses and fixed or otherwise unlowered narrative equipment. No title/prose-based guess labels them nonweapon or links them to an effect. Consequently this is exhaustive for the current native canonical selectable-equipment identity universe across every datasheet, not a claim that all source-mentioned physical equipment has a canonical selectable identity. The latter requires accepted source-owned item-level lowering, not an audit-side name parser.', '',
 'A LINKED presenter result requires exactly one focused non-option effect field, with existing canonical owner, exact field path and nonblank published source text. Contract conditions and effects are never executed. JSON retains each helper effect independently, including helper multiplicity. Text-only links are not semantic execution certification.', '',
 'Reusable recipe: `inventory-all-datasheet-equipment.mjs`. The recipe prints only per-book counts. Exact input paths, source rows, candidate identities, contract targets and effect text are retained in `ALL_DATASHEET_EQUIPMENT_INVENTORY.json`.'];
fs.writeFileSync(path.join(out,'ALL_DATASHEET_EQUIPMENT_INVENTORY.md'),md.join('\n')+'\n');
console.log(JSON.stringify({totals:sums,summary}));
