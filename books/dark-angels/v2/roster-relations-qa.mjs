/** Independent native relation expectations; constructed physical snapshots.
 * No New Recruit export, army-legality or browser acceptance is claimed.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
import {buildDarkAngelsAttachmentPolicies} from './roster-relations-build.mjs';
import {attachmentCheck,changeAttachment,formRoster,validateRoster} from '../../shared/roster-v2/context.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const clone=structuredClone;
const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url),'utf8'));
const lazarus='unit-da-efa93d33ea414d8b8f11';
const key=row=>row.sourceId+'\0'+row.targetId;

export function runDarkAngelsRelationQA(){
  const built=buildDarkAngelsContracts(),book=clone(built.book);
  const original=JSON.stringify(book),result=buildDarkAngelsAttachmentPolicies(book);
  assert.equal(JSON.stringify(book),original,'Relation builder mutated its factual input');
  const index=new Map(book.entities.map(entity=>[entity.id,entity]));
  const units=book.entities.filter(entity=>entity.kind==='DATASHEET');
  const membership=new Set(units.map(unit=>unit.id));
  const facts=[read('./generated/effective.json'),read('../../space-marines/v2/generated/effective.json')]
    .flatMap(owner=>owner.entities);
  // Independently enumerate literal source href destinations admitted by the
  // reviewed membership. Production's declarations/coverage are not EXPECTED.
  const destinations=new Map(facts.filter(entity=>entity.kind==='DATASHEET'&&membership.has(entity.id))
    .map(unit=>[unit.data.sourceAnchor,unit]));
  const expected=[];
  for(const relation of facts.filter(entity=>membership.has(entity.parentId)&&entity.kind==='SOURCE_RELATION'&&
    ['LEADER','SUPPORT'].includes(entity.data.role))){
    for(const reference of relation.data.sourceReferences){
      const address=new URL(reference.href);
      assert.equal(address.origin+address.pathname,'https://wahapedia.ru/wh40k11ed/factions/space-marines/datasheets.html');
      const target=destinations.get(decodeURIComponent(address.hash.slice(1)));
      if(target)expected.push({sourceId:relation.parentId,targetId:target.id,role:relation.data.role,
        additionalLeaders:0,sourceIds:[relation.id]});
    }
  }
  const sorted=rows=>[...rows].sort((a,b)=>key(a).localeCompare(key(b)));
  assert.deepEqual(sorted(result.policies),sorted(expected),'Native policy differs from source-owned href permission');
  const expectedByPair=new Map(expected.map(row=>[key(row),row]));
  assert.equal(expectedByPair.size,expected.length);
  book.rosterAttachmentPolicies=clone(result.policies);
  const physical=(instanceId,id)=>({instanceId,canonicalUnitId:id,
    startingStrength:index.get(id).data.profileIds.length,
    modelRows:index.get(id).data.profileIds.map((profileId,n)=>({rowId:'profile-'+n,
      canonicalProfileId:profileId,compositionScope:'MODEL_ROW',quantity:1,selections:[]})),
    selections:[],enhancementIds:[],warlord:null});
  const detachment=book.entities.find(entity=>entity.kind==='DETACHMENT').id;
  const roster=rows=>({schema:'roster-v2/roster',bookId:book.bookId,rosterId:'da-native-relation-qa',
    detachments:[{instanceId:'detachment',canonicalDetachmentId:detachment}],detachmentIds:[detachment],
    units:rows,attachments:[],warlordInstanceId:null});
  let positive=0,negative=0;
  for(const source of units)for(const target of units){
    const state=roster([physical('source',source.id),physical('target',target.id)]);
    const wanted=expectedByPair.get(key({sourceId:source.id,targetId:target.id}));
    const actual=attachmentCheck(book,state,result.policies,'source','target');
    assert.equal(actual.valid,Boolean(wanted),source.id+'/'+target.id);
    if(wanted){
      assert.equal(actual.role,wanted.role);assert.deepEqual(actual.sourceIds,wanted.sourceIds);
      const attached=changeAttachment(book,state,result.policies,'ATTACH','source','target');
      assert.equal(attached.attachments[0].role,wanted.role);
      assert.deepEqual(validateRoster(book,attached,result.policies),attached);
      positive++;
    }else negative++;
  }
  const relation=book.entities.find(entity=>entity.kind==='SOURCE_RELATION'&&
    entity.parentId==='unit-da-f8f0629206e744459a9f');
  const mutations=[
    {id:'foreign-source-owner',change:value=>{value.entities.find(row=>row.id===relation.id).bookId='space-marines';}},
    {id:'foreign-source-parent',change:value=>{value.entities.find(row=>row.id===relation.id).parentId='unit-sm-59162946fee84360';}},
    {id:'unreviewed-target-href',change:value=>{value.entities.find(row=>row.id===relation.id).data.sourceReferences[0].href='https://invalid.example/#Assault-Intercessor-Squad';}},
    {id:'wrong-source-role',change:value=>{value.entities.find(row=>row.id===relation.id).data.role='SUPPORT';}},
    {id:'changed-target-address',change:value=>{value.entities.find(row=>row.id==='unit-sm-59162946fee84360').data.sourceAnchor='Infernus-Squad';}},
    {id:'forged-target-membership-owner',change:value=>{value.canonicalMembership.find(row=>row.id==='unit-sm-59162946fee84360').bookId='dark-angels';}}
  ];
  for(const mutation of mutations){
    const changed=clone(book);mutation.change(changed);
    assert.throws(()=>buildDarkAngelsAttachmentPolicies(changed),mutation.id);
  }
  const out='unit-sm-0dd92e6d8ad54ee6',sam='unit-da-0e189995095847bf9d47';
  const command='unit-da-467009b00bb9402dadee';
  const capacity=(first,second)=>{
    const state=roster([physical('first',first),physical('second',second),physical('bodyguard',out)]);
    state.attachments=[{leaderInstanceId:'first',bodyguardInstanceId:'bodyguard'}];
    return attachmentCheck(book,state,result.policies,'second','bodyguard').valid;
  };
  assert.equal(capacity(sam,command),true,'Independent Leader and Support slots');
  assert.equal(capacity(sam,sam),false,'Second Leader rejected');
  assert.equal(capacity(command,command),false,'Second Support rejected');
  let repeated=roster([physical('leader',sam),physical('support',command),physical('bodyguard-a',out),physical('bodyguard-b',out)]);
  repeated=changeAttachment(book,repeated,result.policies,'ATTACH','leader','bodyguard-a');
  repeated=changeAttachment(book,repeated,result.policies,'ATTACH','support','bodyguard-a');
  const formation=formRoster(book,repeated);
  assert.ok(formation.formedUnits.some(group=>['leader','support','bodyguard-a'].every(id=>group.memberInstanceIds.includes(id))));
  assert.ok(formation.formedUnits.every(group=>!group.memberInstanceIds.includes('bodyguard-b')),
    'Independent repeated Bodyguard entered another physical formation');
  repeated=changeAttachment(book,repeated,result.policies,'DETACH','support');
  repeated=changeAttachment(book,repeated,result.policies,'REATTACH','leader','bodyguard-b');
  assert.deepEqual(repeated.attachments,[{leaderInstanceId:'leader',bodyguardInstanceId:'bodyguard-b',role:'LEADER'}]);
  assert.deepEqual(validateRoster(book,JSON.parse(JSON.stringify(repeated)),result.policies),repeated);
  const lazarusPolicies=result.policies.filter(policy=>policy.sourceId===lazarus);
  const lazarusDeclaration=facts.find(entity=>entity.parentId===lazarus&&entity.kind==='SOURCE_RELATION');
  assert.ok(lazarusDeclaration);assert.deepEqual(index.get(lazarusDeclaration.id).data,lazarusDeclaration.data);
  const corroboration=read('./mfm-mapping-review.json').reviewedBindings.find(row=>row.entityId===lazarus)
    .corroboratedProperties.find(row=>row.property==='INDEPENDENT_EXACT_LEADER_RECIPIENT_CONSENSUS');
  assert.ok(corroboration,'Lazarus requires independent reviewed RAW/MFM consensus');
  const sourceTargets=corroboration.armySourceLinks.map(reference=>destinations.get(decodeURIComponent(new URL(reference.href,
    'https://wahapedia.ru').hash.slice(1))).id);
  assert.deepEqual(lazarusPolicies.map(row=>row.targetId).sort(),sourceTargets.sort());
  assert.equal(lazarusPolicies.length,7);
  assert.ok(!lazarusPolicies.some(row=>row.targetId==='unit-sm-3ce46dddf62b45f1'),'Hellblaster is not a source recipient');
  assert.equal(attachmentCheck(book,roster([physical('leader',lazarus),physical('bodyguard','unit-sm-59162946fee84360'),
    physical('other-leader',lazarus)]),result.policies,'leader','bodyguard').valid,true);
  const full=roster([physical('leader',lazarus),physical('bodyguard','unit-sm-59162946fee84360'),physical('other-leader',lazarus)]);
  full.attachments=[{leaderInstanceId:'other-leader',bodyguardInstanceId:'bodyguard',role:'LEADER'}];
  assert.equal(attachmentCheck(book,full,result.policies,'leader','bodyguard').valid,false,'Lazarus cannot exceed Leader capacity');
  assert.equal(read('./source-issues.json').issues.find(issue=>issue.id==='da-lazarus-leader-source-discrepancy').status,'SOURCE_VALID_CONSENSUS');
  const central=createEffectiveMfmCatalog().catalog;
  const unresolved=central.unitReferences.filter(reference=>reference.factionId==='dark-angels'&&
    reference.armyBinding?.bindingStatus==='REFERENCE_ONLY');
  const historical=read('./generated/mfm-coverage.json').referenceOnlyRelationTargets;
  assert.deepEqual(unresolved.map(row=>row.id).sort(),historical.map(row=>row.mfmUnitReferenceId).sort());
  assert.ok(unresolved.length&&unresolved.every(row=>row.referenceOnly===true&&!row.armyBinding.armyUnitId));
  assert.equal(result.centralMfmReferenceActivation,false);
  assert.ok(result.policies.every(policy=>!policy.mfmReferenceId),'Central reference silently promoted');
  return {status:'PASS',sourceDeclarations:result.coverage.declarations,activeNativeEdges:expected.length,
    physicalPairPositives:positive,physicalPairNegatives:negative,mutationControls:mutations.map(row=>({id:row.id,status:'PASS'})),
    capacityControls:3,repeatedBodyguardsDetachReattach:'PASS',snapshotReload:'PASS',
    daOwnedEdges:expected.filter(row=>index.get(row.sourceId).bookId==='dark-angels').length,
    inheritedSmEdges:expected.filter(row=>index.get(row.sourceId).bookId==='space-marines').length,
    lazarus:'SEVEN_SOURCE_PROVEN_NATIVE_PERMISSIONS',centralMfmReferenceOnly:unresolved.length,
    centralMfmReferenceActivation:false,realNewRecruitExportTested:false};
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(runDarkAngelsRelationQA()));
