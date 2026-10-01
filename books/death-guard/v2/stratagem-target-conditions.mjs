/** Build-time normalization of the accepted TARGET clause grammar.
 * This is not a runtime prose matcher or a rule-title/identity dispatch table.
 * Unrecognized target qualifiers fail construction instead of becoming UNKNOWN.
 */
import assert from 'node:assert/strict';

export function normalizeTargetConditions({target,when,subject,purpose='PRIMARY_TARGET'}) {
  const nodes=[];
  let remainder=target.quote;
  const split=/, and one friendly /i.exec(remainder);
  if (split) remainder=purpose==='SECONDARY_TARGET'?remainder.slice(split.index+6):remainder.slice(0,split.index);
  else assert.notEqual(purpose,'SECONDARY_TARGET','Secondary TARGET requires its own accepted clause');
  const original=remainder;
  const evidence=()=>({field:[...target.field],quote:target.quote});
  const atom=(predicate,contextLevel,args)=>nodes.push({predicate,subject,contextLevel,arguments:args,evidence:evidence()});
  const field=(key,contextLevel,equals)=>atom('FIELD',contextLevel,{key,equals});
  const consume=(expression,add)=>{
    const match=expression.exec(remainder);
    if (!match) return;
    add(match);
    remainder=remainder.slice(0,match.index)+' '+remainder.slice(match.index+match[0].length);
  };
  // Eligibility exceptions do not add an alive/on-battlefield requirement.
  remainder=remainder.replace(/You can (?:use this Stratagem on that model|target that unit with this Stratagem) even though it was just destroyed\./i,'');
  consume(/with the Deadly Demise ability/i,()=>atom('MODEL_ABILITY','STATIC',{ability:'Deadly Demise'}));
  consume(/\bWARLORD\b/,()=>field('isWarlord','ROSTER',true));
  consume(/(?:is )?not leading a unit/i,()=>atom('LEADING','ROSTER',{value:false}));
  consume(/(?:is )?not an Attached unit/i,()=>field('attached','ROSTER',false));
  consume(/\bAttached(?= unit\b)/i,()=>field('attached','ROSTER',true));
  consume(/includes two CHARACTER models/i,()=>atom('CHARACTER_MODEL_COUNT','ROSTER',{min:2}));
  consume(/(?:was|is) just destroyed/i,()=>field('justDestroyed','BATTLE',true));
  consume(/(?:is )?on the battlefield/i,()=>field('onBattlefield','BATTLE',true));
  consume(/(?:has )?lost one or more wounds/i,()=>field('hasLostWounds','BATTLE',true));
  consume(/(?:is )?in Strategic Reserves/i,()=>field('inStrategicReserves','BATTLE',true));
  consume(/(?:was )?selected as the target of one or more of the attacking unit[’']s attacks/i,()=>field('selectedAsEnemyAttackTarget','BATTLE',true));
  // Preserve phase-relative compound predicates; do not demand an unrelated
  // action from another phase, or reduce shoot/fight to shoot alone.
  consume(/(?:has )?not been selected to shoot or fight this phase/i,()=>field('selectedToShootOrFightThisPhase','BATTLE',false));
  consume(/(?:has )?not been selected to move or charge this phase/i,()=>field('selectedToMoveOrChargeThisPhase','BATTLE',false));
  consume(/(?:has )?not been selected to shoot this phase/i,()=>field('selectedToShootThisPhase','BATTLE',false));
  consume(/(?:has )?not been selected to fight this phase/i,()=>field('selectedToFightThisPhase','BATTLE',false));
  consume(/(?:is )?not within Engagement Range of one or more enemy units/i,()=>field('withinEnemyEngagementRange','BATTLE',false));
  consume(/(?:is )?within Engagement Range of one or more enemy units/i,()=>field('engaged','BATTLE',true));
  consume(/(?:is )?within Engagement Range of that enemy unit/i,()=>field('withinEngagementRangeOfTriggeringEnemy','BATTLE',true));
  consume(/\bunengaged\b/i,()=>field('engaged','BATTLE',false));
  consume(/\bengaged\b/i,()=>field('engaged','BATTLE',true));
  consume(/(?:is )?not Battle-shocked/i,()=>field('battleShocked','BATTLE',false));
  consume(/(?:is )?Battle-shocked/i,()=>field('battleShocked','BATTLE',true));
  if (purpose==='SECONDARY_TARGET') {
    consume(/within 3" of your unit/i,()=>field('within3OfPrimary','BATTLE',true));
    consume(/visible to both your unit and the attacking unit/i,()=>{field('visibleToPrimary','BATTLE',true);field('visibleToAttackingUnit','BATTLE',true);});
  }
  if (/^That\b/.test(original)) {
    field('isTriggerUnit','BATTLE',true);
    // The TARGET's demonstrative refers to the friendly participant named in
    // WHEN, not merely any engaged friendly unit. Keep the enemy-event binding.
    if (/that enemy unit is engaged with a friendly /i.test(when.quote)) {
      field('withinEngagementRangeOfTriggeringEnemy','BATTLE',true);
      nodes.at(-1).evidence={field:[...when.field],quote:when.quote};
    }
  }
  // Remaining lower-case qualification language is not a static keyword.
  // The source fingerprint and independent DOM census additionally lock the
  // complete current grammar/selector denominator.
  const staticRemainder=remainder.replace(/\b(?:One|one|Your|That|friendly|unit|model|from|your|army|or|that|is|was|has|and)\b/g,' ');
  assert.ok(/^[A-Z\s'’.,\/-]*$/.test(staticRemainder),`Unresolved accepted TARGET qualifier: ${remainder}`);
  return nodes;
}
