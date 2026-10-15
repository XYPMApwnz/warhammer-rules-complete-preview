/** Import vocabulary and ownership references, never new factual owners. */
import assert from 'node:assert/strict';
const clone=structuredClone;
const singular=[['noise-marines',2,'Noise Marine'],['tormentors',2,'Tormentor'],['infractors',2,'Infractor'],
  ['chaos-terminators',2,'Chaos Terminator'],['daemonettes',2,'Daemonette'],['seekers',2,'Seeker'],['fiends',2,'Fiend'],['flawless-blades',1,'Flawless Blade']];
const upgrades=new Map([['detachment-spectacle-of-slaughter:enhancement:1','unit-flawless-blades'],
  ['detachment-spectacle-of-slaughter:enhancement:2','unit-flawless-blades'],['detachment-elegant-brutes:enhancement:2','unit-chaos-terminators']]);
export function buildECImportBindings(book,bsdata,contractArtifact) {
  const index=new Map(book.entities.map(e=>[e.id,e])),evidence=(entityId,path)=>({entityId,path});
  const compositions=book.entities.filter(e=>e.kind==='COMPOSITION_MEMBER').map(e=>({id:e.id,ownerId:e.parentId,
    profileId:e.data.modelProfileId,quantity:clone(e.data.quantity),labels:[e.data.name],evidence:evidence(e.id,'/name')}));
  for(const [name,n,label]of singular){const c=compositions.find(c=>c.id===`datasheet-${name}:section:2:member:${n}`);assert.ok(c);c.labels.push(label);}
  const data=bsdata.documents[0].data.catalogue,base='/documents/0/data/catalogue/sharedSelectionEntries/';
  const aliases=[['noise-marines',2,31,'selectionEntryGroups/0/selectionEntries/0'],['noise-marines',2,31,'selectionEntryGroups/0/selectionEntries/1'],
    ['tormentors',2,15,'selectionEntryGroups/0/selectionEntries/0'],['tormentors',2,15,'selectionEntryGroups/0/selectionEntries/1'],['tormentors',2,15,'selectionEntryGroups/0/selectionEntries/2'],
    ...Array.from({length:8},(_,i)=>['chaos-terminators',2,20,`selectionEntryGroups/0/selectionEntries/${i}`])];
  for(const [name,n,unit,path]of aliases){assert.equal(data.sharedSelectionEntries[unit].name,index.get('unit-'+name).data.title,'Foreign BSData export owner');
    const raw=path.split('/').reduce((v,k)=>v[k],data.sharedSelectionEntries[unit]);
    assert.equal(raw.type,'model','Only physical BSData MODEL names may alias composition members');
    const c=compositions.find(c=>c.id===`datasheet-${name}:section:2:member:${n}`);c.labels.push(raw.name);
    (c.exportEvidence??=[]).push({document:book.importSourceEvidence.document,path:base+unit+'/'+path,entryId:raw.id,label:raw.name});
  }
  const enhancementAlias=data.sharedSelectionEntryGroups[0].selectionEntries[8];
  assert.equal(enhancementAlias.id,'336d-3ff2-42d5-e7d0');assert.equal(enhancementAlias.name,'Sublime Presence');
  assert.equal(index.get('detachment-rapid-evisceration:enhancement:1').data.title,'Sublime Prescience');
  const identityAliases=[{canonicalId:'detachment-rapid-evisceration:enhancement:1',labels:['Sublime Presence'],
    evidence:evidence('detachment-rapid-evisceration:enhancement:1','/title'),
    sourceAdjudication:{ownerId:'detachment-rapid-evisceration',entryId:enhancementAlias.id,
      document:book.importSourceEvidence.document,path:'/documents/0/data/catalogue/sharedSelectionEntryGroups/0/selectionEntries/8'}}];
  const weaponSelections=[];
  for(const unit of book.entities.filter(e=>e.kind==='DATASHEET')){
    const families=new Map();for(const id of unit.data.weaponIds){const w=index.get(id),label=w.data.name.split(/\s+[–—-]\s+/)[0];
      const group=families.get(label)||[];group.push(id);families.set(label,group);}
    for(const [label,ids]of families)if(ids.length>1)weaponSelections.push({ownerId:unit.id,label,canonicalProfileIds:ids,evidence:ids.map(id=>evidence(id,'/name'))});
  }
  const tongue=book.entities.find(e=>e.parentId==='unit-seekers'&&e.kind==='WEAPON_PROFILE'&&e.data.name==='Lashing tongue');assert.ok(tongue);
  weaponSelections.push({ownerId:'unit-seekers',label:'Lashing tongues',canonicalProfileIds:[tongue.id],evidence:[evidence(tongue.id,'/name')]});
  const equipmentSelections=[];
  for(const name of ['daemonettes','seekers','keeper-of-secrets'])for(const n of name==='keeper-of-secrets'?[0]:[1,2]){
    const aegis=n===0,label=aegis?'shining aegis':n===1?'instrument of Chaos':'daemonic icon',ownerId='unit-'+name;
    const optionId=`datasheet-${name}:wargear:${aegis?1:n}`,id=aegis?`datasheet-${name}:section:1`:optionId,path=aegis?'/blocks/2/text':'/text';
    const text=index.get(optionId).data.text,start=text.indexOf(label);assert.ok(start>=0&&text.indexOf(label,start+label.length)<0);
    equipmentSelections.push({ownerId,label,canonicalEquipmentIds:[id],canonicalFieldPaths:{[id]:[path]},
      evidence:[evidence(id,path),evidence(optionId,'/text')],sourceReferences:[{entityId:optionId,path:'/text',bookId:book.bookId,caption:{start,end:start+label.length}}],
      ...(aegis?{}:{eligibleMemberId:`datasheet-${name}:section:2:member:2`})});
  }
  const enhancements=book.entities.filter(e=>e.kind==='ENHANCEMENT').map(e=>({id:e.id,detachmentId:e.parentId,
    scope:upgrades.has(e.id)?'UNIT':'MODEL',...(upgrades.has(e.id)?{unitId:upgrades.get(e.id)}:{}),sourceReference:evidence(e.id,'/text'),
    assignmentReference:contractArtifact.contracts.find(c=>c.ruleId===e.id)?.assignment||null}));
  for(const [name,n]of [['tormentors',5],['infractors',3]]){
    const id=`datasheet-${name}:wargear:${n}`,text=index.get(id).data.text,label='icon of excess',start=text.indexOf(label);assert.ok(start>=0);
    equipmentSelections.push({ownerId:'unit-'+name,label,canonicalEquipmentIds:[id],canonicalFieldPaths:{[id]:['/text']},
      evidence:[evidence(id,'/text')],sourceReferences:[{entityId:id,path:'/text',bookId:book.bookId,caption:{start,end:start+label.length}}],
      eligibleMemberId:`datasheet-${name}:section:2:member:2`});
  }
  const selectionOptions=clone(contractArtifact.selectionOptions);
  assert.equal(selectionOptions.length,39);
  return {schema:'ec-v2/import-bindings/v1',identityAliases,weaponSelections,equipmentSelections,compositions,enhancements,
    weaponChoices:selectionOptions.map(o=>({id:o.id,...o.data,provenance:o.provenance})),
    legality:'NOT_ASSESSED',defaults:'Only explicit exported selections; omitted loadouts remain unknown'};
}
