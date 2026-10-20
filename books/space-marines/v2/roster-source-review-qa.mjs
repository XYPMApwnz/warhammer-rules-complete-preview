/** Targeted accepted-source adjudication; no source refresh and no runtime oracle. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readSpaceMarinesRosterCorrections,validateSpaceMarinesRosterCorrections} from './roster-source-review.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone,sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const facts=read('./generated/effective.json'),review=read('./roster-source-corrections.json');
const original=JSON.stringify(facts),result=readSpaceMarinesRosterCorrections({facts});
assert.deepEqual(result.modelMappings.map(r=>[r.memberId,r.profileId]),[
 ['composition-sm-b2e054ed2ab6473c','model-sm-55bf1242f2bb4dae'],
 ['composition-sm-dc1b983be26846bf','model-sm-eaba389795c342e3']]);
assert.deepEqual(result.scopeCorrections.map(r=>[r.entityId,r.previousScope,r.scope]),[
 ['enhancement-sm-1599eafe5bab4e91','MODEL','UNIT'],['enhancement-sm-32c4e009e6c84003','MODEL','UNIT']]);
for(const row of [...result.modelMappings,...result.scopeCorrections]){
 assert.ok(row.evidence.length>=2);assert.ok(row.evidence.every(e=>e.entityId&&Array.isArray(e.path)));
 assert.ok(row.provenance.sourceId&&row.provenance.sha256&&row.provenance.pointer&&row.provenance.reviewId);
}
// Independent RAW/XPath check. Source section records identify their heading;
// their adjacent body is checked separately, rather than treating a heading as
// evidence for the entire composition/replacement paragraph.
const python=process.env.CODEX_PYTHON||'C:/Users/denis/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const script=String.raw`
import json,sys,hashlib
from pathlib import Path
from lxml import html
f=json.load(sys.stdin);root=Path(f['root']);docs={};records={};checks=0
sha=lambda v:hashlib.sha256(v).hexdigest().upper()
norm=lambda v:' '.join(v.split())
for row in f['review']['corrections']+f['review']['unresolved']:
 proofs=row['sourceProof'] if isinstance(row['sourceProof'],list) else [row['sourceProof']]
 for proof in proofs:
  src=proof['source'];raw=(root/src['document']).read_bytes();assert sha(raw)==src['sha256']
  tree=docs.setdefault(src['document'],html.fromstring(raw).getroottree())
  nodes=tree.xpath(src['pointer']);assert len(nodes)==1;n=nodes[0]
  text=norm(n.text_content());assert text==proof['selectedSourceText']
  assert sha(text.encode())==proof['selectedTextSha256']
  assert sha(html.tostring(n,encoding='unicode').encode())==proof['selectedHtmlSha256']
  records[proof['canonicalId']]=(n,tree);checks+=1
for row in f['review']['corrections']:
 if row['type']=='SOURCE_CONTEXTUAL_COMPOSITION_PROFILE_BINDING':
  context=row['context'];tree=records[row['compositionId']][1]
  units=tree.xpath(context['unitPointer']);assert len(units)==1;unit=units[0]
  assert 'datasheet' in unit.get('class','').split()
  heads=tree.xpath(context['unitHeaderPointer']);assert len(heads)==1;head=heads[0]
  assert unit in head.iterancestors();assert norm(head.text_content())=='Vanguard Veteran Squad With Jump Packs'
  assert sha(html.tostring(head,encoding='unicode').encode())==context['unitHeaderHtmlSha256']
  profiles=unit.xpath('.//span[contains(concat(" ",normalize-space(@class)," ")," dsModelName ")]')
  assert sorted(norm(n.text_content()) for n in profiles)==['Vanguard Veteran','Vanguard Veteran Sergeant']
  composition=records[row['compositionId']][0];profile=records[row['modelProfileId']][0]
  assert unit in composition.iterancestors();assert unit in profile.iterancestors()
  names=profile.xpath('.//span[contains(concat(" ",normalize-space(@class)," ")," dsModelName ")]');assert len(names)==1
  short=norm(names[0].text_content());assert short==('Vanguard Veteran Sergeant' if row['sourceRole']=='SERGEANT' else 'Vanguard Veteran')
  assert norm(composition.text_content())==('1 '+short+' with Jump Pack model' if row['sourceRole']=='SERGEANT' else '4-9 '+short+' with Jump Pack models')
  comphead=records['section-sm-d342cadab9a64c24'][0];compbody=comphead.getnext();assert compbody is not None
  assert unit in compbody.iterancestors()
  para=norm(compbody.text_content());assert 'The Vanguard Veteran Sergeant with Jump Pack is equipped with:' in para
  assert 'Every Vanguard Veteran with Jump Pack is equipped with:' in para
  assert '1 Heavy Bolt Pistol; 1 Relic Blade.' in para and '1 Heavy Bolt Pistol; 1 Master-crafted Power Weapon.' in para
  gearhead=records['section-sm-c6194f07927c474c'][0];gearbody=gearhead.getnext();assert gearbody is not None
  assert unit in gearbody.iterancestors();assert 'Sergeant with Jump Pack can have their Relic Blade replaced' in norm(gearbody.text_content())
 else:
  node=records[row['canonicalId']][0];paragraphs=node.xpath('./p[not(contains(concat(" ",normalize-space(@class)," ")," legend2 "))]')
  assert len(paragraphs)==1;gameplay=norm(paragraphs[0].text_content())
  assert gameplay.startswith('ADEPTUS ASTARTES unit only.') and 'this unit' in gameplay.lower()
  assert row['unchanged']['itemKind']=='ENHANCEMENT'
  ancestors=node.xpath('ancestor::div[h2[@id="Enhancements-14"]]')
  assert len(ancestors)==1;assert norm(ancestors[0].xpath('./h2')[0].text_content())=='Enhancements'
  if row['canonicalId']=='enhancement-sm-32c4e009e6c84003':assert 'This unit’s ranged weapons have [IGNORES COVER].' in gameplay
  else:assert 'that move does not prevent this unit from being eligible to start an action.' in gameplay
unresolved=f['review']['unresolved'][0];assert unresolved['status']=='NOT_PROVEN'
assert norm(records[unresolved['canonicalId']][0].text_content())=='1 Dainal Kornelius model'
assert 'Dainal Komelius' in norm(records[unresolved['candidateModelProfileId']][0].text_content())
print(json.dumps({'rawProofOccurrencesChecked':checks,'uniqueRawProofsChecked':len(records),'contextualRoleMappings':2,'unitScopeCorrections':2,'dainal':'NOT_PROVEN'}))
`;
const parsed=spawnSync(python,['-X','utf8','-c',script],{input:JSON.stringify({root:fileURLToPath(new URL('../../../',import.meta.url)),review}),encoding:'utf8'});
assert.equal(parsed.status,0,parsed.stderr);const source=JSON.parse(parsed.stdout);
let controls=0;
function reject(mutate){const r=clone(review),f=clone(facts);mutate(r,f);assert.throws(()=>validateSpaceMarinesRosterCorrections(r,{facts:f}));controls++;}
reject(r=>r.corrections.shift());
reject(r=>r.corrections.push(clone(r.corrections[0])));
reject(r=>r.corrections[0].modelProfileId='model-sm-eaba389795c342e3');
reject(r=>r.corrections[0].canonicalOwnerId='unit-sm-c7226873c51d43c0');
reject(r=>r.corrections[0].sourceRole='ORDINARY_VETERAN');
reject(r=>r.corrections[0].context.unitPointer+='/div[1]');
reject(r=>r.corrections[0].sourceProof[0].selectedSourceText+=' changed');
reject(r=>r.corrections[0].sourceProof[0].source.pointer+='/div[1]');
reject(r=>r.corrections[0].sourceProof[0].source.sha256='0'.repeat(64));
reject(r=>r.corrections[0].globalAliasesAdded=true);
reject(r=>r.corrections[2].new.scope='MODEL');
reject(r=>r.corrections[2].unchanged.itemKind='UNIT_UPGRADE');
reject(r=>r.corrections[2].unchanged.text+=' changed effect');
reject(r=>r.corrections[3].executableBindingChangeAuthorizedByThisEvidence=true);
reject(r=>r.unresolved[0].status='SOURCE_CONFIRMED');
reject((r,f)=>f.entities.find(e=>e.id==='composition-sm-11f249c8e3af4b85').data.modelProfileId='model-sm-1e6ba64c42ba4d79');
reject((r,f)=>f.entities.find(e=>e.id==='model-sm-55bf1242f2bb4dae').parentId='unit-sm-c7226873c51d43c0');
reject((r,f)=>f.entities.find(e=>e.id==='model-sm-55bf1242f2bb4dae').data.stats.W='99');
reject((r,f)=>f.entities.find(e=>e.id==='composition-sm-b2e054ed2ab6473c').data.quantity.max=99);
reject((r,f)=>f.entities.find(e=>e.id==='enhancement-sm-1599eafe5bab4e91').data.scope='UNIT');
reject((r,f)=>f.entities.find(e=>e.id==='enhancement-sm-32c4e009e6c84003').data.text+=' changed');
assert.equal(JSON.stringify(facts),original,'Source review changed factual records');
assert.equal(sha(JSON.stringify(read('./generated/effective.json'))),sha(original),'Source owner changed on disk');
console.log(JSON.stringify({status:'PASS',...source,negativeMutationControls:controls,
 sourceNamesUnchanged:true,aliasesAdded:0,sourceBytesPreserved:true,realNewRecruitExportTested:false}));
