/** Book-owned source decisions over the existing physical selection snapshot.
 * These records select recipients; they never store computed abilities. */
import {formRoster,selections} from '../../shared/roster-v2/context.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';

export const tauStudentRuleId='detachment-auxiliary-cadre:enhancement:1';
export const tauStudentOptionId=tauStudentRuleId+'::choice::physical-recipients';
export const tauStudentField='selectedTauSourceChoiceIds';
export const tauStudentContextField='tauStudentRecipient';
const bodyguardRuleId='datasheet-kroot-carnivores:section:bodyguard';
const choiceKey='source-choice/'+tauStudentRuleId;
const quote='KROOT SHAPER model only. In the Declare Battle Formations step, you can select up to three friendly KROOT CARNIVORES/FARSTALKERS units. Those units have Deep Strike.';
const bodyguardQuote='If this unit has a Starting Strength of 20, you can attach up to two Leader units to it instead of one, provided those Leaders are not duplicates (e.g. you cannot attach two WAR SHAPERS to this unit). If you do, and this unit is destroyed, the Leader units attached to it become separate units with their original Starting Strengths.';
const allowedRecipients=new Set(['unit-kroot-carnivores','unit-kroot-farstalkers']);
const clone=structuredClone;
const requireValue=(ok,message)=>{if(!ok)throw new TypeError(message);};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const indexOf=book=>new Map(book.entities.map(entity=>[entity.id,entity]));
const decisionRows=unit=>selections(unit).filter(selection=>selection.selectionField===tauStudentField||
  selection.selectionKey===choiceKey||selection.canonicalOptionIds?.includes(tauStudentOptionId));

export function addTauSourceChoices(book) {
  const records=indexOf(book),rule=records.get(tauStudentRuleId),bodyguard=records.get(bodyguardRuleId);
  requireValue(rule?.kind==='ENHANCEMENT'&&rule.data.text===quote&&rule.provenance?.sourceId,
    'Unconfirmed Student of Kauyon source decision');
  requireValue(bodyguard?.parentId==='unit-kroot-carnivores'&&bodyguard.data.blocks?.some(block=>block.text===bodyguardQuote)&&
    bodyguard.provenance?.sourceId,'Unconfirmed Kroot BODYGUARD source gate');
  const option={id:tauStudentOptionId,kind:'UPGRADE_OPTION',parentId:rule.id,
    authority:'SOURCE_BACKED_SELECTION_BINDING',data:{selectionRuleId:rule.id,
      recipientUnitIds:[...allowedRecipients],maximumRecipients:3,timing:'DECLARE_BATTLE_FORMATIONS'},
    provenance:clone(rule.provenance)};
  requireValue(!records.has(option.id),'Duplicate T’au source choice');
  book.entities.push(option);book.rosterSelectionOptions=[...(book.rosterSelectionOptions||[]),option];
  // The shared checker owns capacity and distinct-Leader semantics. Its static
  // canonical edge cannot express Starting Strength; the physical source gate
  // below must run at every book-owned load/attachment boundary first.
  for(const policy of book.rosterAttachmentPolicies.filter(policy=>policy.targetId===bodyguard.parentId)) {
    policy.additionalLeaders=1;
    policy.sourceIds=[...new Set([...policy.sourceIds,bodyguard.id])];
  }
  const composition=book.rosterProfileBindings.map(binding=>({...clone(binding),
    maxModels:book.entities.filter(entity=>entity.kind==='COMPOSITION_MEMBER'&&
      entity.data.modelProfileId===binding.profileId).reduce((sum,entity)=>sum+entity.data.quantity.max,0)}));
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
  return book;
}

export function validateTauAttachmentSourceConditions(book,state) {
  const records=indexOf(book),rule=records.get(bodyguardRuleId);
  requireValue(rule?.data.blocks?.some(block=>block.text===bodyguardQuote),'Unconfirmed physical attachment source gate');
  for(const target of state.units) {
    const links=state.attachments.filter(link=>link.bodyguardInstanceId===target.instanceId);
    if(target.canonicalUnitId!=='unit-kroot-carnivores'||links.length<=1)continue;
    requireValue(target.startingStrength===20&&target.modelRows.reduce((sum,row)=>sum+row.quantity,0)===20,
      'Kroot Carnivores require confirmed Starting Strength 20 for two Leaders');
  }
  return state;
}

export function validateTauSourceChoices(book,state) {
  const records=indexOf(book),rule=records.get(tauStudentRuleId),option=records.get(tauStudentOptionId);
  requireValue(option?.parentId===rule?.id&&equal(option.provenance,rule.provenance)&&
    option.data.maximumRecipients===3&&equal(option.data.recipientUnitIds,[...allowedRecipients]),'Unbound T’au source choice');
  const physical=formRoster(book,state),byInstance=new Map(state.units.map(unit=>[unit.instanceId,unit]));
  for(const unit of state.units) {
    const ids=unit[tauStudentField]===undefined?[]:unit[tauStudentField],decisions=decisionRows(unit);
    requireValue(Array.isArray(ids)&&ids.length<=1&&ids.every(id=>id===option.id),'Unknown or duplicate T’au source choice');
    requireValue(decisions.length===ids.length,'T’au source choice field and physical decision disagree');
    if(!ids.length)continue;
    const canonical=records.get(unit.canonicalUnitId),keywords=new Set([...canonical.data.keywords,...canonical.data.factionKeywords]);
    requireValue(unit.enhancementIds.includes(rule.id)&&state.detachmentIds.includes(rule.parentId)&&
      keywords.has('KROOT')&&keywords.has('SHAPER'),'Student of Kauyon requires its assigned KROOT SHAPER source');
    const assignment=unit.enhancementAssignments?.find(item=>item.enhancementId===rule.id);
    const sourceModels=physical.units.find(item=>item.instanceId===unit.instanceId).profiles;
    const models=sourceModels.filter(model=>
      (!assignment||model.scopeId===assignment.modelScopeId)&&model.keywords.includes('KROOT')&&model.keywords.includes('SHAPER'));
    requireValue(models.length===1&&models[0].quantity===1,'Student of Kauyon requires one confirmed physical MODEL bearer');
    const model=models[0],decision=decisions[0],recipients=decision.recipientInstanceIds;
    requireValue(sourceModels.filter(candidate=>candidate.selections.some(row=>row.selectionKey===decision.selectionKey)).length===1&&
      model.selections.some(row=>row.selectionKey===decision.selectionKey)&&
      decision.selectionKey===choiceKey&&decision.sourceModelScopeId===model.scopeId&&
      decision.sourceInstanceId===unit.instanceId&&decision.physicalQuantity===1&&decision.perModelQuantity===1&&
      decision.selectionField===tauStudentField&&decision.selectionCardinality==='MANY'&&
      equal(decision.canonicalOptionIds,[option.id])&&equal(decision.canonicalProfileIds,[])&&equal(decision.canonicalEquipmentIds,[])&&
      equal(decision.sourceChoiceReference,{bookId:book.bookId,entityId:rule.id,path:'/text'})&&
      equal(decision.sourceProvenance,rule.provenance),'Invalid Student of Kauyon physical source evidence');
    requireValue(Array.isArray(recipients)&&recipients.length<=3&&new Set(recipients).size===recipients.length&&
      recipients.every(id=>typeof id==='string'&&allowedRecipients.has(byInstance.get(id)?.canonicalUnitId)),
      'Student of Kauyon requires up to three distinct confirmed KROOT CARNIVORES/FARSTALKERS physical UNIT recipients');
  }
  return state;
}

export function setTauStudentChoice(book,snapshot,sourceInstanceId,recipientInstanceIds) {
  const state=clone(snapshot),unit=state.units.find(unit=>unit.instanceId===sourceInstanceId);
  requireValue(unit&&Array.isArray(recipientInstanceIds),'Unresolved Student of Kauyon source/recipients');
  validateTauSourceChoices(book,state);
  unit[tauStudentField]=[];
  for(const container of [unit,...unit.modelRows,...unit.modelRows.flatMap(row=>row.loadouts||[])])
    container.selections=(container.selections||[]).filter(selection=>!decisionRows({selections:[selection]}).length);
  if(recipientInstanceIds.length) {
    const rule=indexOf(book).get(tauStudentRuleId),physical=formRoster(book,state).units.find(item=>item.instanceId===sourceInstanceId);
    const assignment=unit.enhancementAssignments?.find(item=>item.enhancementId===rule.id);
    const models=physical.profiles.filter(model=>(!assignment||model.scopeId===assignment.modelScopeId)&&
      model.keywords.includes('KROOT')&&model.keywords.includes('SHAPER'));
    requireValue(models.length===1&&models[0].quantity===1,'Ambiguous Student of Kauyon MODEL bearer');
    const model=models[0],containers=unit.modelRows.flatMap(row=>[
      {scopeId:`${unit.instanceId}/${row.rowId}/PROFILE/${row.rowId}`,container:row},
      ...(row.loadouts||[]).map(loadout=>({scopeId:`${unit.instanceId}/${row.rowId}/LOADOUT/${loadout.loadoutId}`,container:loadout}))]);
    const recipientContainer=containers.find(item=>item.scopeId===model.scopeId)?.container;
    requireValue(recipientContainer,'Unresolved source MODEL row/loadout');
    unit[tauStudentField]=[tauStudentOptionId];
    recipientContainer.selections.push({selectionKey:choiceKey,physicalQuantity:1,perModelQuantity:1,
      canonicalProfileIds:[],canonicalEquipmentIds:[],canonicalOptionIds:[tauStudentOptionId],
      selectionField:tauStudentField,selectionCardinality:'MANY',sourceInstanceId:unit.instanceId,
      sourceModelScopeId:model.scopeId,recipientInstanceIds:clone(recipientInstanceIds),
      sourceChoiceReference:{bookId:book.bookId,entityId:rule.id,path:'/text'},sourceProvenance:clone(rule.provenance)});
  }
  return validateTauSourceChoices(book,state);
}

export function tauSourceChoiceContext(book,state) {
  validateTauSourceChoices(book,state);
  // This context is bound only after the import boundary validates equipment
  // identity, source caption, quantity and provenance. Shared option IDs alone
  // cannot distinguish different drones selected from the same source field.
  const markers=new Set(state.units.filter(unit=>selections(unit).some(selection=>
    selection.sourceEquipmentIdentity==='drone-marker-drone'&&selection.physicalQuantity>0)).map(unit=>unit.instanceId));
  return context=>context?{...context,roster:{...context.roster,
    tauPhysicalUnitInstanceId:context.instanceId||'',tauMarkerSelected:markers.has(context.instanceId)}}:context;
}

/** Lower validated decisions to existing SOURCE and TARGET FIELD conditions.
 * Physical IDs are runtime bindings, never new factual owners. Rebuild from
 * the canonical display clause on every load, so choices cannot accumulate. */
export function bindTauStudentPairs(book,state) {
  validateTauSourceChoices(book,state);
  const result=clone(book),rule=indexOf(result).get(tauStudentRuleId);
  requireValue(rule.data.text===quote,'Unreviewed Student of Kauyon source');
  const contract=rule.ruleContract;
  contract.clauses=contract.clauses.filter(clause=>!clause.physicalSourcePair);
  const template=contract.clauses.find(clause=>clause.rosterClassificationNote?.sourceChoice===rule.id);
  requireValue(template?.rosterClassification==='DISPLAY_ONLY'&&template.rosterEffects.length===0,
    'Student requires the original canonical display clause before physical lowering');
  if(!state.detachmentIds.includes(rule.parentId))return result;
  const sources=state.units.filter(unit=>unit.enhancementIds.includes(rule.id)).sort((a,b)=>a.instanceId.localeCompare(b.instanceId));
  for(const source of sources)for(const decision of decisionRows(source))for(const recipient of [...decision.recipientInstanceIds].sort()){
    const pair={sourceInstanceId:source.instanceId,recipientInstanceId:recipient,sourceModelScopeId:decision.sourceModelScopeId};
    const clause=clone(template),proof={field:['text'],quote:rule.data.text};
    clause.id=rule.id+'::physical-pair/'+JSON.stringify([source.instanceId,recipient]);
    clause.physicalSourcePair=clone(pair);clause.rosterClassification='ROSTER_EXECUTABLE';
    clause.rosterClassificationNote={reason:'Confirmed physical source/recipient pair using existing typed FIELD conditions',
      sourceChoice:rule.id,canonicalClauseId:template.id};
    clause.rosterEffects=[{id:clause.id+'/deep-strike',operation:'GRANT_ABILITY',
      ability:{canonicalId:'core-deep-strike',parameters:{}},targetBinding:'ROSTER_UNITS',targetSubject:'UNIT',unitScope:'PHYSICAL',
      conditions:[['SOURCE',source.instanceId],['TARGET',recipient]].map(([binding,id])=>({binding,
        predicate:{predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',
          arguments:{key:'tauPhysicalUnitInstanceId',equals:id},evidence:clone(proof)}})),
      evidence:clone(proof),sourceFields:[['text']],lifetime:'WHILE_ASSIGNED',
      provenance:{canonicalRuleId:rule.id,canonicalOwnerId:rule.parentId,canonicalClauseId:template.id,
        sourceEvidence:clone(rule.provenance),physicalSourcePair:clone(pair)}}];
    contract.clauses.push(clause);
  }
  return result;
}

function physicalInput(state) {
  const strip=unit=>{
    const copy=clone(unit);delete copy[tauStudentField];
    for(const container of [copy,...copy.modelRows,...copy.modelRows.flatMap(row=>row.loadouts||[])])
      container.selections=(container.selections||[]).filter(selection=>!decisionRows({selections:[selection]}).length);
    return copy;
  };
  const sort=value=>Array.isArray(value)?value.map(sort):value&&typeof value==='object'?
    Object.fromEntries(Object.keys(value).sort().map(key=>[key,sort(value[key])])):value;
  return JSON.stringify(sort({detachmentIds:state.detachmentIds,units:state.units.map(strip)}));
}

export function preserveTauSourceChoices(book,incoming,previous) {
  if(!previous||incoming.rosterId!==previous.rosterId)return incoming;
  validateTauSourceChoices(book,previous);
  if(physicalInput(incoming)!==physicalInput(previous))return incoming;
  let state=clone(incoming);
  for(const unit of previous.units)if(unit[tauStudentField]?.length)
    state=setTauStudentChoice(book,state,unit.instanceId,decisionRows(unit)[0].recipientInstanceIds);
  return state;
}
