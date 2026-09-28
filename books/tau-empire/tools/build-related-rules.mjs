import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ACCEPTED_CONTRACT_SHA256='ecd160dea2281e0d0e44686a5c9604d85ba3af8040fa56616dfb42bd076eafa1';
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const readText=file=>fs.readFileSync(file,'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(`T’au Related Rules contract: ${message}`);};
const sameSet=(left,right)=>left.size===right.size&&[...left].every(value=>right.has(value));
const exactKeys=(value,allowed,label)=>{
  assert(value&&typeof value==='object'&&!Array.isArray(value),`${label} must be an object`);
  const extra=Object.keys(value).filter(key=>!allowed.includes(key));
  assert(!extra.length,`${label} has unsupported fields: ${extra.join(', ')}`);
};
const within=(file,root)=>{
  const relative=path.relative(root,file);
  return relative===''||(!relative.startsWith(`..${path.sep}`)&&relative!=='..'&&!path.isAbsolute(relative));
};

const role=(selector,id='friendly-target',count=1)=>({id,side:'friendly',subject:'unit',count,selector});
const rule=(roles,conditions=[])=>({v:1,roles,conditions});
const tau={allKeywords:["T'AU EMPIRE"]},infantry={allKeywords:["T'AU EMPIRE",'INFANTRY']},battlesuit={allKeywords:["T'AU EMPIRE",'BATTLESUIT']},kroot={allKeywords:['KROOT']};
const codex={
  'stratagem-a-tempting-trap':rule([role(tau)],['not-selected-to-shoot','trap-objective','battle-round-3-plus']),
  'stratagem-combat-embarkation':rule([role(infantry),role({allKeywords:['TRANSPORT']},'friendly-transport')],['charge-target','within-3-of-transport','transport-capacity']),
  'stratagem-coordinate-to-engage':rule([role({allKeywords:["T'AU EMPIRE"],noneKeywords:['FORTIFICATION']})],['selected-as-observer']),
  'stratagem-photon-grenades':rule([role({allKeywords:["T'AU EMPIRE",'GRENADES']})],['charge-target']),
  'stratagem-point-blank-ambush':rule([role(tau)],['not-selected-to-shoot','battle-round-3-plus']),
  'stratagem-wall-of-mirrors':rule([role({unitIds:['unit-stealth-battlesuits','unit-ghostkeel-battlesuit','unit-commander-shadowsun']})],['not-engaged']),
  'stratagem-aggressive-mobility':rule([role(tau)],['not-selected-to-move']),
  'stratagem-combat-debarkation':rule([role(infantry)],['disembarked-this-turn']),
  'stratagem-counterfire-defence-systems':rule([role(tau)],['targeted-by-enemy-attack']),
  'stratagem-focused-fire':rule([role(tau,'friendly-targets',2)],['not-selected-to-shoot','battle-round-1-to-3']),
  'stratagem-pinpoint-counter-offensive':rule([role({allKeywords:["T'AU EMPIRE"],noneKeywords:['KROOT']})],['unit-destroyed']),
  'stratagem-pulse-onslaught':rule([role({allKeywords:["T'AU EMPIRE",'INFANTRY'],noneKeywords:['KROOT']})],['unit-shot','enemy-hit']),
  'stratagem-fail-safe-detonator':rule([role(battlesuit)],['battlesuit-model-destroyed']),
  'stratagem-grav-inhibitor-field':rule([role(battlesuit)],['charge-target']),
  'stratagem-stimm-injectors':rule([role(battlesuit)],['targeted-by-enemy-attack']),
  'stratagem-the-arrokon-protocol':rule([role(battlesuit)],['not-selected-to-shoot']),
  'stratagem-the-shortened-blade':rule([role(battlesuit)],['arriving-by-deep-strike','cannot-charge']),
  'stratagem-the-torchstar-gambit':rule([role({allKeywords:["T'AU EMPIRE",'BATTLESUIT','FLY']})],['attacks-resolved']),
  'stratagem-a-trap-well-laid':rule([role(kroot)],['not-selected-to-shoot-or-fight']),
  'stratagem-emp-grenades':rule([role({allKeywords:['KROOT','GRENADES']})],['within-8-of-enemy-vehicle']),
  'stratagem-guerrilla-warriors':rule([role(kroot)],['fell-back']),
  'stratagem-hidden-hunters':rule([role(kroot)],['targeted-by-enemy-attack']),
  'stratagem-join-the-hunt':rule([role({alternatives:[{allKeywords:['KROOT','INFANTRY']},{unitIds:['unit-kroot-hounds']}]})],['unit-destroyed','once-per-battle']),
  'stratagem-the-grisly-feast':rule([role(kroot)],['destroyed-enemy-this-phase'])
};

export function loadAuthenticatedInputs(bookRoot=defaultRoot){
  const contractPath=path.join(bookRoot,'sources','tau-empire-related-rules-contracts.v1.json');
  const contractBytes=fs.readFileSync(contractPath);
  assert(sha256(contractBytes)===ACCEPTED_CONTRACT_SHA256,'accepted contract artifact hash mismatch');
  const accepted=JSON.parse(contractBytes.toString('utf8'));
  exactKeys(accepted,['schema','bookId','sourceBindings','stratagems','enhancements'],'accepted artifact');
  assert(accepted.schema==='tau-related-rules-contracts/v1','unsupported schema');
  assert(accepted.bookId==='tau-empire','wrong book identity');
  const inputs={accepted};
  for(const [sourceId,binding] of Object.entries(accepted.sourceBindings||{})){
    exactKeys(binding,['authority','role','path','sha256','repositoryCommit','documentHashes'],`source ${sourceId}`);
    assert(binding.path&&binding.sha256,`${sourceId} has incomplete authentication`);
    const file=path.resolve(bookRoot,...binding.path.replaceAll('\\','/').split('/'));
    assert(within(file,bookRoot),`${sourceId} path escapes the book root`);
    assert(fs.existsSync(file),`${sourceId} is missing: ${binding.path}`);
    const bytes=fs.readFileSync(file);
    assert(sha256(bytes)===binding.sha256.toLowerCase(),`${sourceId} hash mismatch`);
    inputs[sourceId]=binding.path.endsWith('.json')?JSON.parse(bytes.toString('utf8')):null;
  }
  const bsdata=inputs['pinned-bsdata'];
  assert(bsdata.source?.commit===accepted.sourceBindings['pinned-bsdata'].repositoryCommit,'pinned BSData commit mismatch');
  const documentHashes=Object.fromEntries((bsdata.documents||[]).map(item=>[item.role,item.sha256]));
  assert(documentHashes.faction===accepted.sourceBindings['pinned-bsdata'].documentHashes.faction,'pinned BSData faction document mismatch');
  assert(documentHashes['game-system']===accepted.sourceBindings['pinned-bsdata'].documentHashes.gameSystem,'pinned BSData game-system document mismatch');
  const pack=inputs['faction-pack-canonical'];
  assert(pack.meta?.sha256?.toLowerCase()===accepted.sourceBindings['faction-pack-v1.1'].sha256,'Faction Pack canonical input is not bound to the retained official PDF');
  return inputs;
}

const primitiveStrings=value=>{
  const found=new Set();
  const visit=item=>{
    if(typeof item==='string')found.add(item);
    else if(Array.isArray(item))item.forEach(visit);
    else if(item&&typeof item==='object')Object.values(item).forEach(visit);
  };
  visit(value);return found;
};

export function validateContracts(inputs){
  const {accepted}=inputs,pack=inputs['faction-pack-canonical'],parity=inputs['codex-parity'],datasheets=inputs['codex-datasheets'];
  const packStratagems=pack.detachments.flatMap(detachment=>detachment.stratagems.map(item=>({id:item.id,detachmentId:detachment.id})));
  const sourceEnhancements=[...pack.detachments,...parity.detachments].flatMap(detachment=>detachment.enhancements.map(item=>({id:item.id,detachmentId:detachment.id})));
  assert(accepted.stratagems.length===7,'expected exactly 7 accepted Faction Pack Stratagem contracts');
  assert(accepted.enhancements.length===23,'expected exactly 23 accepted Enhancement contracts');
  const validateUnique=(records,label)=>{
    const ids=records.map(item=>item.id);assert(new Set(ids).size===ids.length,`${label} contains a duplicate contract`);return new Set(ids);
  };
  assert(sameSet(validateUnique(accepted.stratagems,'Stratagems'),new Set(packStratagems.map(item=>item.id))),'missing or unknown Faction Pack Stratagem contract');
  assert(sameSet(validateUnique(accepted.enhancements,'Enhancements'),new Set(sourceEnhancements.map(item=>item.id))),'missing or unknown Enhancement contract');
  const sourceIds=new Set(Object.keys(accepted.sourceBindings));
  const validateRefs=(record,label)=>{
    assert(Array.isArray(record.sourceRefs)&&record.sourceRefs.length,`${label} has no source locator`);
    for(const ref of record.sourceRefs){
      exactKeys(ref,['sourceId','locator'],`${label} source reference`);
      assert(sourceIds.has(ref.sourceId),`${label} references an unknown source ${ref.sourceId}`);
      assert(ref.locator&&Object.keys(ref.locator).length,`${label} has an empty source locator`);
    }
  };
  for(const record of accepted.stratagems){
    exactKeys(record,['id','detachmentId','contract','timingScope','sourceRefs','confidence'],`Stratagem ${record.id}`);
    assert(packStratagems.some(item=>item.id===record.id&&item.detachmentId===record.detachmentId),`${record.id} has the wrong Detachment`);
    exactKeys(record.contract,['v','roles','conditions'],`${record.id} contract`);
    assert(record.contract.v===1&&Array.isArray(record.contract.roles)&&record.contract.roles.length&&Array.isArray(record.contract.conditions),`${record.id} has an invalid eligibility contract`);
    exactKeys(record.timingScope,['turn','phases','window'],`${record.id} timing scope`);
    assert(['own','opponent'].includes(record.timingScope.turn)&&Array.isArray(record.timingScope.phases)&&record.timingScope.phases.length&&['end','trigger'].includes(record.timingScope.window),`${record.id} has an invalid timing scope`);
    assert(record.confidence==='accepted-primary',`${record.id} must retain accepted primary confidence`);
    validateRefs(record,record.id);
  }
  const canonicalUnitIds=new Set((datasheets.datasheets||[]).map(item=>item.id));
  for(const id of Object.values(pack.datasheets||{}).flat().map(item=>item.id))canonicalUnitIds.add(id.startsWith('unit-')?id:`unit-${id}`);
  const sourceStrings=primitiveStrings(inputs['pinned-bsdata']);
  for(const record of accepted.enhancements){
    exactKeys(record,['id','detachmentId','owner','assignment','tags','sourceRefs','confidence','confidenceDetail'],`Enhancement ${record.id}`);
    assert(sourceEnhancements.some(item=>item.id===record.id&&item.detachmentId===record.detachmentId),`${record.id} has the wrong Detachment`);
    exactKeys(record.owner,['subject','selector'],`${record.id} owner`);
    exactKeys(record.owner.selector,['unitIds','noneKeywords'],`${record.id} owner selector`);
    assert(['unit','model'].includes(record.owner.subject),`${record.id} has an invalid owner subject`);
    assert(Array.isArray(record.owner.selector.unitIds)&&record.owner.selector.unitIds.length,`${record.id} has no exact owner IDs`);
    assert(record.owner.selector.unitIds.every(id=>canonicalUnitIds.has(id)),`${record.id} has an unknown canonical owner ID`);
    assert(JSON.stringify(record.owner.selector.noneKeywords)===JSON.stringify(['EPIC HERO']),`${record.id} must retain the EPIC HERO exclusion`);
    exactKeys(record.assignment,['maxOwners','enhancementChoices','payPointsPerOwner'],`${record.id} assignment`);
    assert(record.assignment.enhancementChoices===1&&record.assignment.payPointsPerOwner===true,`${record.id} has an invalid assignment`);
    const upgrade=record.tags.length===1&&record.tags[0]==='UPGRADE';
    assert(upgrade?(record.owner.subject==='unit'&&record.assignment.maxOwners===3):(record.tags.length===0&&record.owner.subject==='model'&&record.assignment.maxOwners===1),`${record.id} has a conflicting owner/assignment contract`);
    assert(record.confidence==='source-limited',`${record.id} must retain source-limited confidence`);
    if(record.id==='enhancement-strike-swiftly')assert(record.confidenceDetail==='SOURCE_LIMITED_MEDIUM'&&record.owner.selector.unitIds.length===10,'Strike Swiftly exact S7 owner evidence changed');
    validateRefs(record,record.id);
    const bsdataRef=record.sourceRefs.find(ref=>ref.sourceId==='pinned-bsdata');
    assert(bsdataRef?.locator?.selectionId&&sourceStrings.has(bsdataRef.locator.selectionId),`${record.id} BSData selection locator does not resolve`);
  }
}

export function buildRelatedRules({bookRoot=defaultRoot}={}){
  const inputs=loadAuthenticatedInputs(path.resolve(bookRoot));
  validateContracts(inputs);
  const packRules=Object.fromEntries(inputs.accepted.stratagems.map(record=>[record.id,record.contract]));
  const enhancements=Object.fromEntries(inputs.accepted.enhancements.map(record=>[record.id,{v:1,tags:record.tags,owner:record.owner,assignment:record.assignment}]));
  return{schema:1,faction:"T'au Empire",stratagems:{...packRules,...codex},enhancements};
}

export function serializeRelatedRules(value){return `${JSON.stringify(value,null,2)}\n`;}

if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url)){
  const outputPath=path.join(defaultRoot,'content','tau-empire-related-rules.en.json');
  const result=buildRelatedRules();
  const output=serializeRelatedRules(result);
  if(process.argv.includes('--check')){
    if(readText(outputPath)!==output)throw new Error('T’au Related Rules are stale; run build-related-rules.mjs');
    console.log(`T’au Related Rules current: ${Object.keys(result.stratagems).length} Stratagems, ${Object.keys(result.enhancements).length} Enhancements`);
  }else{
    fs.writeFileSync(outputPath,output,'utf8');
    console.log(`Built T’au Related Rules: ${Object.keys(result.stratagems).length} Stratagems, ${Object.keys(result.enhancements).length} Enhancements`);
  }
}
