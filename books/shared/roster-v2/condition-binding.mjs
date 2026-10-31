/** Compose declared physical condition inputs without choosing a book, inferring
 * facts, or changing the caller's evaluator/Detachment wrapper position.
 * Inputs are data; source owners still validate their selections and evidence.
 */
import {conditionSpec,setConditionValue} from '../rule-contract-v2/conditions.mjs';
import {formRoster} from './context.mjs';
import {computeRosterCondition} from './condition-context.mjs';
import {createPhysicalEquipmentConditionContext,createVerifiedPhysicalConditionContext,
  createSourceEquipmentConditionContext,createSelectedSourceChoiceConditionContext,
  createEquippedWeaponChoiceConditionContext,createInitialAttachmentConditionContext,
  withDefaultConditionValue} from './physical-condition-context.mjs';

const identity=context=>context;
const requireValue=(value,message)=>{if(!value)throw new TypeError('Roster condition binding: '+message);};
const computationKinds=Object.freeze({enhancementAssigned:'ENHANCEMENT_ASSIGNED',
  selectedModelMark:'SELECTED_MARK',selectedUnitMark:'SELECTED_MARK',needsMarkSelection:'MARK_SELECTION_ELIGIBLE',
  selectedUpgrade:'SELECTED_OPTION',sourceProfilePresent:'PROFILE_PRESENT',needsInvulnerableSave:'SAVE_IMPROVEMENT',
  attachedAtBattleStart:'INITIAL_ATTACHMENT',ledBodyguardHasAbility:'LED_BODYGUARD_ABILITY'});
const contextFields=new Set(['attached','equipmentRequirementSatisfied','isBodyguardModel']);
const dataOnly=value=>{
  requireValue(typeof value!=='function','inputs cannot contain callbacks');
  if(value&&typeof value==='object'){
    requireValue(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null,'inputs must be plain data');
    for(const child of Object.values(value))dataOnly(child);
  }
};

/** An empty input list is the original schema, with an identity context binder.
 * Predicate binding receives the whole predicate once; role binding deliberately
 * receives no predicate. Computers must not turn that into per-leaf evaluation.
 * Explicit default values run before choices, and equipped choices before
 * historical attachment inputs. No-state contexts retain schema eligibility.
 */
export function createRosterConditionBinding({book,state,schema,inputs=[],abilityProjection}={}){
  requireValue(typeof schema?.evaluatePredicate==='function'&&typeof schema?.evaluateRole==='function','missing evaluator');
  requireValue(Array.isArray(inputs),'inputs must be an array');
  dataOnly(inputs);
  const declarations=structuredClone(inputs);
  if(!declarations.length)return {...schema,bindContext:identity};
  const defaults=[],equipment=[],verified=[],choices=[],historical=[],computations=[];
  for(const input of declarations){
    requireValue(input&&typeof input==='object'&&!Array.isArray(input)&&conditionSpec(input),'unknown condition key');
    const args={...input.arguments,key:input.key};
    if(input.key==='selectedUpgrade'&&args.selectionMode==='VALIDATED_EQUIPPED_WEAPON'){
      requireValue(input.kind===undefined||input.kind==='SELECTED_OPTION','condition/computation mismatch');
      requireValue(typeof args.selectionGroupId==='string'&&args.selectionGroupId,'missing equipped choice identity');
      if(state)choices.push(createEquippedWeaponChoiceConditionContext(book,state,schema,{
        ruleId:args.selectionGroupId,conditionArguments:args,messages:input.messages}));
    }else if(input.kind!==undefined){
      if(input.kind==='CONTEXT_FIELD')requireValue(contextFields.has(input.key),'unsupported context field');
      else requireValue(computationKinds[input.key]===input.kind,'condition/computation mismatch');
      if(input.key==='selectedUpgrade')requireValue(args.selectionMode==='VALIDATED_CANONICAL_OPTION','unresolved choice mode');
      computations.push(input);
    }else switch(input.key){
      case 'equipmentBearerSatisfied':
        requireValue(['POSITIVE_SELECTION','UNIFORM_PHYSICAL_GROUP'].includes(args.quantityProof),'unresolved equipment proof');
        requireValue(typeof input.clearUnrequestedEquipment==='boolean','missing equipment clearing policy');
        if(state)equipment.push(createPhysicalEquipmentConditionContext(book,state,{
          equipmentMode:args.quantityProof,clearUnrequestedEquipment:input.clearUnrequestedEquipment}));
        break;
      case 'physicalProfilePresent':
        verified.push(createVerifiedPhysicalConditionContext({state,presenceBindings:input.presenceBindings,
          chapterFacts:input.chapterFacts,chapterProvenStatus:input.chapterProvenStatus,
          armyProvenStatus:input.armyProvenStatus,unknownChapterStatus:input.unknownChapterStatus}));
        break;
      case 'sourceEquipmentSelected':
        requireValue(typeof args.sourceEquipmentIdentity==='string'&&args.sourceEquipmentIdentity,'missing source equipment identity');
        if(state)choices.push(createSourceEquipmentConditionContext(state,{
          sourceEquipmentIdentity:args.sourceEquipmentIdentity,physicalIdentity:input.physicalIdentity}));
        break;
      case 'selectedSourceChoice':
        requireValue(typeof args.ruleId==='string'&&args.ruleId&&typeof input.selectionField==='string'&&input.selectionField,'missing source choice inputs');
        if(Object.hasOwn(input,'defaultValue')){
          requireValue(input.defaultValue==='','only an explicitly unselected choice may be defaulted');
          defaults.push(context=>withDefaultConditionValue(context,args,input.defaultValue));
        }
        if(state)choices.push(createSelectedSourceChoiceConditionContext(state,{ruleId:args.ruleId,selectionField:input.selectionField}));
        break;
      case 'initialAttachmentBattleline':
        if(state)historical.push(createInitialAttachmentConditionContext(book,state,{
          binding:input.binding,conditionArguments:args,messages:input.messages}));
        break;
      default:throw new TypeError('Roster condition binding: no declared computer for '+input.key);
    }
  }
  // The existing computation remains whole-context and uses the caller's pass
  // projection. The two-pass executor and its dependency filtering stay outside.
  const records=state&&computations.length?new Map(book.entities.map(entity=>[entity.id,entity])):null;
  const projection=state&&computations.some(input=>input.kind==='LED_BODYGUARD_ABILITY')
    ?abilityProjection??formRoster(book,state):abilityProjection;
  const compute=context=>{
    if(!records||!context)return context;
    const unit=state.units.find(item=>item.instanceId===context.instanceId);
    if(!unit)return context;
    const rows=context.subject==='MODEL'?unit.modelRows.filter(row=>row.canonicalProfileId===context.modelId):unit.modelRows;
    const roster={...context.roster};
    for(const input of computations){
      const result=computeRosterCondition(input,{records,state,unit,rows,context,abilityProjection:projection});
      if(!result.skip)setConditionValue(roster,{...input.arguments,key:input.key},result.value);
    }
    return {...context,roster};
  };
  const bindContext=(context,predicate)=>{
    for(const bind of defaults)context=bind(context);
    for(const bind of equipment)context=bind(context,predicate);
    for(const bind of verified)context=bind(context);
    for(const bind of choices)context=bind(context);
    for(const bind of historical)context=bind(context);
    return compute(context);
  };
  return {...schema,bindContext,
    evaluatePredicate:(node,context)=>schema.evaluatePredicate(node,bindContext(context,node)),
    evaluateRole:(role,conditions,context)=>schema.evaluateRole(role,conditions,bindContext(context))};
}
