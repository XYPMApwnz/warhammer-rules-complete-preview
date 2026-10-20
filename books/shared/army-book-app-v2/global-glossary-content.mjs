/** Pure display projection of the enrolled global corpus. No identity, alias, search or route policy. */
export function createGlobalGlossaryContent({entries, bookId:defaultBookId='', registryLabels={}}) {
  if(!Array.isArray(entries))throw new TypeError('Global glossary entries are required');
  const byId=new Map(entries.map(entry=>[entry.id,entry]));
  const canonicalArmy=new Map(entries.filter(entry=>entry.domain==='ARMY').map(entry=>[entry.sourceOwner.bookId+'\0'+entry.sourceOwner.canonicalId,entry]));
  if(byId.size!==entries.length)throw new TypeError('Duplicate qualified global glossary identity');
  const normalize=value=>String(value||'').replace(/[\u2018\u2019]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim().toLocaleLowerCase();
  const ownerLabel=id=>registryLabels[id] || String(id||'').replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase());
  const clarificationText=value=>[value.sourceQuestion,value.appliesToClauseText&&('Applies to: '+value.appliesToClauseText),value.sourceText].filter(Boolean).join('\n');
  // Typed source representations already enrolled by the Missions producer, rendered without JSON/enums.
  const typedReferenceDefinition=(body,clarifications=[])=>{
    const lines=[];
    const operations={
      IF_CUMULATIVE_CONDITION_ACHIEVED_GAIN_BOTH_CUMULATIVE_AND_PRECEDING_NORMAL_CONDITION_VP:'If a CUMULATIVE condition is achieved, gain VP for both that condition and the preceding normal condition.',
      GAIN_VP_FOR_ONLY_ONE_OR_CONDITION_OR_THE_PRECEDING_NORMAL_CONDITION:'Gain VP for only one OR condition or the preceding normal condition.',
      IGNORE_VP_ABOVE_STATED_LIMIT:'Ignore VP above the stated limit.'
    };
    for(const operation of [...(body.operations||[]),body.operation].filter(Boolean))if(operations[operation])lines.push(operations[operation]);
    const events={UNIT_DESTROYED:'is destroyed',UNIT_EMBARKS_ON_TRANSPORT:'embarks within a Transport',RULE_REMOVES_UNIT_FROM_BATTLEFIELD:'is removed from the battlefield by a rule'};
    if(body.qualifyingEvents?.length)lines.push('A unit leaves the battlefield when it '+body.qualifyingEvents.map(value=>events[value]).filter(Boolean).join(', or ')+'.');
    if(body.example==='PLACE_IN_STRATEGIC_RESERVES')lines.push('For example, a unit placed in Strategic Reserves leaves the battlefield.');
    if(body.meaning==='UNDERLINED_ONE_MEANS_EXACTLY_ONE_NOT_ONE_OR_MORE')lines.push('An underlined ONE means exactly one, rather than one or more.');
    if(body.appliesOnlyTo==='TACTICAL_SECONDARY_MISSIONS')lines.push('When Drawn rules apply only to Tactical Secondary Missions.');
    if(body.type==='COMMAND_POINT_GAIN_LIMIT') {
      if(Number.isFinite(body.maximumAdditionalCommandPointsPerPlayerPerBattleRound))lines.push('Each player can gain a maximum of '+body.maximumAdditionalCommandPointsPerPlayerPerBattleRound+' additional Command Point(s) per battle round from sources other than the Core Rules gain at the start of the Command phase.');
      if(body.secondaryMissionDiscardCpCountsTowardLimit===true)lines.push('Command Points gained by discarding Secondary Missions count towards this limit.');
    }
    for(const overlay of clarifications)if(overlay.clarification?.sourceText)lines.push(clarificationText(overlay.clarification));
    return lines.join('\n\n');
  };
  const text=value=>typeof value==='string'?value.trim():'';
  const collectContent=value=>{
    if(!Array.isArray(value))return'';
    return value.flatMap(item=>{
      if(typeof item==='string')return[item];
      if(!item||typeof item!=='object')return[];
      if(item.text)return[item.text];
      if(Array.isArray(item.rows))return[...(item.columns||[]),...item.rows.flatMap(row=>Array.isArray(row)?row:[row.label,...(row.cells||[])])].filter(Boolean);
      return[];
    }).filter(Boolean).join('\n');
  };
  const structuredOptionsDefinition=facts=>{
    if(!Array.isArray(facts.options)||!facts.options.length)return'';
    const lines=[];
    if(text(facts.openingText))lines.push(text(facts.openingText));
    for(const option of facts.options){
      if(!option||typeof option!=='object')continue;
      const heading=[text(option.label)||text(option.title),text(option.subtitle)].filter(Boolean).join(' — ');
      const optionLines=[];
      if(text(option.text))optionLines.push(text(option.text));
      if(Array.isArray(option.effects))optionLines.push(...option.effects.map(text).filter(Boolean).map(effect=>`• ${effect}`));
      if(heading&&optionLines.length)lines.push(heading,...optionLines);
    }
    return lines.join('\n');
  };
  const unitProfileDefinition=profile=>{
    if(!profile||typeof profile!=='object')return'';
    const stats=profile.stats&&typeof profile.stats==='object'?profile.stats:{};
    const value=(...keys)=>{for(const key of keys)if(stats[key]!==undefined&&stats[key]!==null&&String(stats[key]).trim())return String(stats[key]).trim();return'';};
    const characteristicLines=[['M',value('M')],['T',value('T')],['Sv',value('Sv','SV')],['W',value('W')],['Ld',value('Ld','LD')],['OC',value('OC')],['Invulnerable Save',value('INSV','Invulnerable','Inv')],['Base',value('Base')]]
      .filter(([,stat])=>stat)
      .map(([label,stat])=>`${label} ${stat}`);
    return [text(profile.name),characteristicLines.join(' · ')].filter(Boolean).join('\n');
  };
  const unitCompositionDefinition=composition=>{
    if(text(composition))return text(composition);
    if(!Array.isArray(composition))return'';
    return composition.map(item=>{
      if(!item||typeof item!=='object')return text(item);
      const label=text(item.name),minimum=Number.isFinite(item.min)?item.min:null,maximum=Number.isFinite(item.max)?item.max:null;
      const count=minimum===null?'':minimum===maximum?String(minimum):`${minimum}–${maximum}`;
      const models=Array.isArray(item.models)?item.models.map(text).filter(Boolean):[];
      const modelDetail=models.length&&!(models.length===1&&normalize(models[0])===normalize(label))?`Models: ${models.join(', ')}`:'';
      const keywords=Array.isArray(item.intrinsicKeywords)&&item.intrinsicKeywords.length?`Keywords: ${item.intrinsicKeywords.join(', ')}`:'';
      return [`• ${[label,count].filter(Boolean).join(': ')}`,modelDetail,keywords].filter(Boolean).join('\n');
    }).filter(Boolean).join('\n');
  };
  const unitDefinition=entry=>{
    const facts=entry.facts||{};
    const sections=[],composition=unitCompositionDefinition(facts.composition),profiles=(facts.profiles||[]).map(unitProfileDefinition).filter(Boolean);
    if((facts.notes||[]).length)sections.push(`UNIT NOTES\n${facts.notes.join('\n')}`);
    if(composition)sections.push(`UNIT COMPOSITION\n${composition}`);
    if(profiles.length)sections.push(`MODEL PROFILES\n${profiles.join('\n\n')}`);
    const weapons=entries.filter(candidate=>candidate.domain==='ARMY'&&candidate.recordType==='WEAPON_PROFILE'&&candidate.parent?.canonicalId===facts.id&&candidate.sourceOwner?.bookId===entry.sourceOwner?.bookId);
    if(weapons.length)sections.push(`WEAPON PROFILES\n${weapons.map(weapon=>`• ${weapon.label}: ${weaponProfileDefinition(weapon.facts||{})}`).join('\n')}`);
    const abilities=Array.isArray(facts.ruleFacts?.abilities)?facts.ruleFacts.abilities.map(ability=>{
      if(typeof ability==='string')return text(ability);
      const body=text(ability.text),heading=ability.title===ability.id?'':text(ability.title);
      if(!body)return'';
      return heading&&!normalize(body).startsWith(normalize(heading))?heading+'\n'+body:body;
    }).filter(Boolean):[];
    if(abilities.length)sections.push(`ABILITIES\n${abilities.map(ability=>`• ${ability}`).join('\n')}`);
    for(const section of facts.referenceSections||[])if(text(section.title)&&section.lines?.length)sections.push(`${section.title.toLocaleUpperCase()}\n${section.lines.join('\n')}`);
    if((facts.keywords||[]).length)sections.push(`KEYWORDS\n${facts.keywords.join(', ')}`);
    if((facts.factionKeywords||[]).length)sections.push(`FACTION KEYWORDS\n${facts.factionKeywords.join(', ')}`);
    return sections.join('\n\n');
  };
  const weaponProfileDefinition=facts=>{
    return `${facts.mode==='ranged'?'Ranged':'Melee'} · ${facts.range||facts.Range||''} · A ${facts.a||facts.A||''} · ${facts.bs||facts.BS||facts.ws||facts.WS||facts.skill||''} · S ${facts.s||facts.S||''} · AP ${facts.ap||facts.AP||''} · D ${facts.d||facts.D||''}${facts.abilities||facts.Abilities?` · ${facts.abilities||facts.Abilities}`:''}`;
  };
  const detachmentDefinition=entry=>{
    const facts=entry.facts||{},lines=[];
    const forceDispositionLabels=(entry.canonicalReferences||[]).filter(reference=>reference.relationType==='FORCE_DISPOSITION').map(reference=>byId.get(reference.id)?.label).filter(Boolean);
    const detachmentPoints=entry.mfm?.detachment?.detachmentPoints;
    if(forceDispositionLabels.length||Number.isFinite(detachmentPoints))lines.push([forceDispositionLabels.length&&`Force Disposition: ${forceDispositionLabels.join(', ')}.`,Number.isFinite(detachmentPoints)&&`Detachment Points: ${detachmentPoints}DP.`].filter(Boolean).join(' '));
    if(text(facts.tagline))lines.push(text(facts.tagline));
    if(text(facts.restrictions))lines.push(`Restrictions: ${text(facts.restrictions)}`);
    const tags=[...(facts.tags||[]),...(entry.mfm?.qualifiers||[]).map(record=>record.label)].filter(Boolean);
    if(tags.length)lines.push(`Tags: ${[...new Set(tags)].join(', ')}.`);
    for(const rule of facts.detachmentRules||[]){
      const ruleLines=[];
      const direct=['semanticContent','text','full','definition','ruleText','rulesText','description'].map(field=>text(rule[field])).find(Boolean);
      if(direct)ruleLines.push(direct);
      for(const block of rule.blocks||[]){
        if(text(block.text))ruleLines.push(text(block.text));
        else if(Array.isArray(block.rows)){
          if(block.columns?.length)ruleLines.push(block.columns.join(' | '));
          for(const row of block.rows)ruleLines.push((Array.isArray(row)?row:[row.label,...(row.cells||[])]).filter(value=>value!==null&&value!==undefined&&String(value).trim()).join(' | '));
        }
      }
      for(const collection of [rule.content,rule.clauses,rule.tables]){const content=collectContent(collection);if(content)ruleLines.push(content);}
      if(ruleLines.length)lines.push([text(rule.title),...ruleLines].filter(Boolean).join('\n'));
    }
    return lines.join('\n');
  };
  const missionSequenceRequirement=requirement=>{
    const renderers={
      MUSTER_ARMIES_AS_DESCRIBED_IN_CORE_RULES:()=>`Muster armies as described in the Core Rules.`,
      SECRET_FORCE_DISPOSITION_SELECTION:()=>`Each player secretly selects one available Force Disposition.`,
      SIMULTANEOUS_REVEAL:()=>`Reveal both players' selections simultaneously.`,
      DIRECTED_PRIMARY_MATRIX_LOOKUP:()=>`For each player, use their Force Disposition and their opponent's Force Disposition to find that player's Primary Mission in the mission matrix.`,
      SHUFFLE_AND_DRAW_ONE_DEPLOYMENT_CARD:()=>`Shuffle the Deployment cards and draw one Deployment card.`,
      MUTUAL_AGREEMENT_REQUIRED:()=>`Use a Twist only if both players agree.`,
      CHOOSE_ONE_TWIST:()=>`If both players agree to use a Twist, select one Twist.`,
      BATTLEFIELD_SIZE:value=>`Use a ${value.widthInches}\" by ${value.heightInches}\" battlefield.`,
      CENTRAL_OBJECTIVE_ROLL:value=>`Roll one D6 for the central objective setup: on ${value.singleOnResults.join(', ')}, use one central objective; on ${value.doubleOnResults.join(', ')}, use two central objectives, each ${value.doubleOffsetInches}\" from the battlefield centre.`,
      ALTERNATING_TERRAIN_PLACEMENT_AFTER_ROLL_OFF:()=>`After a roll-off, players alternate placing terrain features.`,
      TERRAIN_OBJECTIVE_AT_EACH_OBJECTIVE_POINT:()=>`Place a terrain objective at each objective point.`,
      AGREE_BATTLEFIELD_EDGE_MAPPING:()=>`Agree which battlefield edges correspond to the Attacker and Defender.`,
      ROLL_OFF_WINNER_ASSIGN_ATTACKER_DEFENDER:()=>`Roll off; the winner assigns one player as the Attacker and the other as the Defender.`,
      ATTACKER_AND_DEFENDER_DECKS_IDENTICAL:()=>`The Attacker and Defender Secondary Mission decks must contain identical cards.`,
      SECRET_FIXED_OR_TACTICAL_SELECTION:()=>`Each player secretly selects Fixed or Tactical Secondary Missions.`,
      FIXED_MODE_SELECT_EXACTLY_TWO:()=>`A player selecting Fixed Secondary Missions selects exactly two.`,
      DISPLAY_SELECTED_FIXED_MISSIONS_FACE_UP:()=>`Place selected Fixed Secondary Missions face up.`,
      FIXED_MISSIONS_CANNOT_BE_DISCARDED:()=>`Fixed Secondary Missions cannot be discarded.`,
      FIXED_MISSIONS_ACTIVE_THROUGHOUT_BATTLE:()=>`Fixed Secondary Missions remain active throughout the battle.`,
      SHUFFLE_SECONDARY_DECK_FACE_DOWN:()=>`Shuffle the Secondary Mission deck and place it face down.`,
      DRAW_TWO_AT_START_OF_COMMAND_PHASE:()=>`At the start of each Command phase, draw until you have two Secondary Missions.`,
      ONCE_PER_BATTLE_SPEND_ONE_CP_AT_END_OF_COMMAND_PHASE_TO_DISCARD_AND_DRAW:()=>`Once per battle, at the end of your Command phase, you can spend 1CP to discard one Secondary Mission and draw a replacement.`,
      END_OF_EACH_PLAYER_TURN_ACTIVE_PLAYER_RESOLVES_FIRST:()=>`At the end of each player turn, the active player resolves Secondary Missions first.`,
      OPTIONALLY_SCORE_MET_SECONDARY_CONDITIONS:()=>`A player can score a Secondary Mission whose scoring condition has been met.`,
      TACTICAL_ACHIEVED_MISSION_DISCARDED:()=>`After a Tactical Secondary Mission is achieved, discard it.`,
      ACTIVE_PLAYER_MAY_DISCARD_TACTICAL_MISSIONS_FOR_ONE_CP:()=>`The active player can discard Tactical Secondary Missions for 1CP.`,
      SECRETLY_RECORD_TRANSPORT_EMBARKATION:()=>`Each player secretly records which units will start the battle embarked within Transports.`,
      SECRETLY_RECORD_STRATEGIC_RESERVES:()=>`Each player secretly records which units will start the battle in Strategic Reserves.`,
      ALTERNATING_UNIT_DEPLOYMENT_DEFENDER_FIRST:()=>`Starting with the Defender, players alternate setting up one unit at a time.`,
      EXCLUDE_STRATEGIC_RESERVES:()=>`Do not deploy units that are in Strategic Reserves.`,
      WHOLLY_WITHIN_DEPLOYMENT_ZONE:()=>`Each deployed unit must be set up wholly within its player's deployment zone.`,
      TITANIC_SETUP_SKIPS_NEXT_SETUP_TURN:()=>`After a player sets up a TITANIC unit, that player skips their next opportunity to set up a unit.`,
      FINISHED_PLAYER_ALLOWS_OPPONENT_REMAINING_SETUPS:()=>`After one player has finished deploying, their opponent sets up all remaining units.`,
      RESOLVE_REDEPLOY_RULES_AFTER_BOTH_ARMIES_DEPLOYED:()=>`Resolve redeploy rules after both armies have been deployed.`,
      ALTERNATE_REDEPLOYS_ATTACKER_FIRST:()=>`Starting with the Attacker, players alternate resolving redeploy rules.`,
      REDEPLOY_TO_STRATEGIC_RESERVES_IGNORES_POINTS_LIMIT:()=>`Units redeployed into Strategic Reserves do not count towards the Strategic Reserves points limit.`,
      ROLL_OFF_WINNER_TAKES_FIRST_TURN:()=>`Roll off; the winner takes the first turn.`,
      ALTERNATE_PRE_BATTLE_RULES_FIRST_TURN_PLAYER_FIRST:()=>`Starting with the player taking the first turn, players alternate resolving pre-battle rules.`,
      FIRST_BATTLE_ROUND_BEGINS:()=>`The first battle round begins.`,
      BATTLE_ENDS_AFTER_COMPLETED_BATTLE_ROUNDS:value=>`The battle ends after ${value.battleRounds} completed battle rounds.`,
      CONTINUE_TURNS_WHEN_ARMY_HAS_NO_MODELS_AT_TURN_START:()=>`Players continue taking turns even if an army has no models on the battlefield at the start of a turn.`,
      BATTLE_READY_VP:value=>`A Battle Ready army scores ${value.victoryPoints}VP.`,
      WINNER_HAS_MOST_VP:()=>`The player with the most VP is the winner.`,
      EQUAL_VP_IS_DRAW:()=>`If the players have equal VP, the battle is a draw.`,
      IGNORE_VP_ABOVE_APPLICABLE_MAXIMUM:()=>`Ignore VP scored above an applicable maximum.`,
      SCORING_CAPS:value=>`Scoring limits: Primary Missions ${value.primaryTotal}VP total and ${value.primaryPerBattleRound}VP per battle round; Secondary Missions ${value.secondaryTotal}VP total and ${value.secondaryPerBattleRound}VP per battle round; each Fixed Secondary Mission ${value.fixedSecondaryPerCard}VP; Battle Ready ${value.battleReady}VP.`,
      MUSTER_ARMIES_AS_DESCRIBED_IN_WARHAMMER_40000_APP:()=>`Muster armies as described in the Warhammer 40,000 app.`,
      AFTER_MUSTERING_SELECT_ONE_AVAILABLE_FORCE_DISPOSITION:()=>`After mustering, select one available Force Disposition.`,
      RECORD_SELECTED_FORCE_DISPOSITION_ON_ROSTER:()=>`Record the selected Force Disposition on the army roster.`,
      COMPLETE_BEFORE_ATTENDING_EVENT:()=>`Complete this step before attending the event.`,
      USE_PRESELECTED_FORCE_DISPOSITION_CARD:()=>`Use the Force Disposition card selected when the army was mustered.`,
      FIND_OPPONENT_FORCE_DISPOSITION_SYMBOL_ON_OWN_CARD:()=>`On that card, find the symbol for the opponent's Force Disposition.`,
      ASSIGN_LISTED_PRIMARY_MISSION_TO_PLAYER:()=>`Use the listed Primary Mission for that player.`,
      SELECT_LAYOUT_BY_FORCE_DISPOSITION_MATCHUP:value=>`Use the terrain layout for the two players' Force Dispositions; available variants are ${value.variants.join(', ')}.`,
      ORGANIZER_SPECIFIES_OR_RANDOMLY_DETERMINES_VARIANT:()=>`The event organizer specifies the layout variant or determines it randomly.`,
      SET_UP_OFFICIAL_TERRAIN_AREAS_AND_FEATURES:()=>`Set up the official terrain areas and terrain features for the selected layout.`
    };
    return renderers[requirement?.type]?.(requirement)||'';
  };
  const missionSequenceDefinition=entry=>{
    const facts=entry.facts||{},requirements=facts.requirements||[],lines=requirements.map(missionSequenceRequirement);
    if(lines.some(line=>!line))return'';
    for(const clarification of facts.effectiveClarifications||[]){const sourceText=text(clarification?.clarification?.sourceText);if(sourceText)lines.push(`Clarification: ${sourceText}`);}
    return lines.join('\n');
  };
  const missionSourceText=value=>typeof value==='string'?text(value):value?.type==='SOURCE_RULE_TEXT'?text(value.text):'';
  const missionCardDefinition=entry=>{
    const facts=entry.facts||{},body=facts.ruleBody;
    if(!body||typeof body!=='object')return'';
    const lines=[];
    if(text(body.flavorText))lines.push(`FLAVOR\n${text(body.flavorText)}`);
    if(entry.recordType==='PRIMARY_MISSION'){
      const factReferences=Array.isArray(facts.references)?facts.references:[],canonicalReferences=Array.isArray(entry.canonicalReferences)?entry.canonicalReferences:[];
      const playerReferences=factReferences.filter(reference=>reference.relationType==='PLAYER_FORCE_DISPOSITION');
      const opponentReferences=factReferences.filter(reference=>reference.relationType==='OPPONENT_FORCE_DISPOSITION');
      const coreReferences=factReferences.filter(reference=>reference.relationType==='CORE_RULE');
      if(factReferences.length!==playerReferences.length+opponentReferences.length+coreReferences.length||playerReferences.length!==1||opponentReferences.length!==1)return'';
      if(playerReferences[0].id!==facts.playerForceDispositionId||opponentReferences[0].id!==facts.opponentForceDispositionId)return'';
      const player=byId.get(`missions::${facts.playerForceDispositionId}`),opponent=byId.get(`missions::${facts.opponentForceDispositionId}`);
      if(player?.recordType!=='FORCE_DISPOSITION'||opponent?.recordType!=='FORCE_DISPOSITION')return'';
      const canonicalRelation=(relationType,canonicalId,domain)=>canonicalReferences.filter(reference=>reference.relationType===relationType&&reference.canonicalId===canonicalId&&reference.domain===domain);
      if(canonicalRelation('PLAYER_FORCE_DISPOSITION',facts.playerForceDispositionId,'MISSIONS').length!==1||canonicalRelation('OPPONENT_FORCE_DISPOSITION',facts.opponentForceDispositionId,'MISSIONS').length!==1)return'';
      const coreRuleRefs=Array.isArray(body.coreRuleRefs)?body.coreRuleRefs:[];
      if(coreReferences.length!==coreRuleRefs.length||new Set(coreRuleRefs).size!==coreRuleRefs.length||coreReferences.some(reference=>!coreRuleRefs.includes(reference.id)))return'';
      const coreTargets=[];
      for(const coreId of coreRuleRefs){
        if(canonicalRelation('CORE_RULE',coreId,'CORE').length!==1)return'';
        const target=byId.get(`core::${coreId}`);if(target?.domain!=='CORE')return'';coreTargets.push(target);
      }
      if(canonicalReferences.length!==2+coreTargets.length)return'';
      lines.push(`FORCE DISPOSITION CONTEXT\nPLAYER: ${player.label}\nOPPONENT: ${opponent.label}`);
      if(coreTargets.length)lines.push(`CORE RULE REFERENCES\n${coreTargets.map(target=>target.label).join('\n')}`);
    }
    if(entry.recordType==='SECONDARY_MISSION'){
      const eligibility=facts.eligibility;
      if(!eligibility||typeof eligibility.fixed!=='boolean'||typeof eligibility.tactical!=='boolean')return'';
      lines.push(`ELIGIBILITY\nFixed: ${eligibility.fixed?'Yes':'No'}. Tactical: ${eligibility.tactical?'Yes':'No'}.`);
    }
    const ruleComponents=[];
    for(const component of body.ruleComponents||[]){const value=missionSourceText(component);if(!value)return'';ruleComponents.push(value);}
    if(ruleComponents.length)lines.push(`RULES\n${ruleComponents.join('\n')}`);
    const whenDrawn=[];
    for(const rule of body.whenDrawn||[]){const value=missionSourceText(rule);if(!value)return'';whenDrawn.push(value);}
    if(whenDrawn.length)lines.push(`WHEN DRAWN\n${whenDrawn.join('\n')}`);
    const scoring=[];
    const relationLabels=new Map([[null,''],[undefined,''],['OR','RELATION: alternative to the previous scoring condition.'],['CUMULATIVE','RELATION: cumulative with the previous scoring condition.']]);
    const modeLabels=new Map([['ALL',''],['FIXED','Fixed'],['TACTICAL','Tactical']]);
    const operationLabels=new Map([['AWARD','VP'],['ADD_TO_PREVIOUS_AWARD','ADDITIONAL VP']]);
    for(const clause of body.scoringClauses||[]){
      const condition=missionSourceText(clause.condition),relation=relationLabels.get(clause.relationToPrevious);
      if(!condition||relation===undefined||!text(clause.battleRoundWindow))return'';
      const clauseLines=[];
      if(relation)clauseLines.push(relation);
      clauseLines.push(text(clause.battleRoundWindow));
      if(text(clause.timing))clauseLines.push(`TIMING: ${text(clause.timing)}`);
      clauseLines.push(`CONDITION: ${condition}`);
      if(!Array.isArray(clause.victoryPointAwards)||!clause.victoryPointAwards.length)return'';
      for(const award of clause.victoryPointAwards){
        const operation=operationLabels.get(award.operation),mode=modeLabels.get(award.mode);
        if(!operation||mode===undefined||!Number.isFinite(award.victoryPoints))return'';
        const qualifiers=[mode,text(award.limitText)].filter(Boolean).join(' · ');
        clauseLines.push(`${operation}: ${award.victoryPoints}VP${qualifiers?` (${qualifiers})`:''}`);
      }
      scoring.push(clauseLines.join('\n'));
    }
    if(scoring.length)lines.push(`SCORING\n${scoring.join('\n\n')}`);
    const action=body.objectiveAction;
    if(action){
      const units=missionSourceText(action.unitSelector),effect=missionSourceText(action.effect);
      if(!text(action.label)||!text(action.starts)||!units||!text(action.completes)||!effect)return'';
      const actionLines=[`STARTS: ${text(action.starts)}`,`UNITS: ${units}`];
      if(text(action.useLimit))actionLines.push(`USE LIMIT: ${text(action.useLimit)}`);
      actionLines.push(`COMPLETES: ${text(action.completes)}`,`EFFECT: ${effect}`);
      if(action.restrictions){const restrictions=missionSourceText(action.restrictions);if(!restrictions)return'';actionLines.push(`RESTRICTIONS: ${restrictions}`);}
      lines.push(`OBJECTIVE ACTION — ${text(action.label)}\n${actionLines.join('\n')}`);
    }
    if(body.caps){
      const keys=Object.keys(body.caps);
      if(keys.length!==1||keys[0]!=='fixedModePerCardMaximumVictoryPoints'||!Number.isFinite(body.caps.fixedModePerCardMaximumVictoryPoints))return'';
      lines.push(`CAPS\nFixed mode: maximum ${body.caps.fixedModePerCardMaximumVictoryPoints}VP from this card.`);
    }
    const clarifications=[];
    for(const overlay of facts.effectiveClarifications||[]){
      if(overlay.operation!=='APPEND_CLARIFICATION')return'';
      const clarification=overlay.clarification||{},answer=text(clarification.sourceText);
      if(!answer)return'';
      clarifications.push([text(clarification.appliesToClauseText)&&`APPLIES TO: ${text(clarification.appliesToClauseText)}`,`ANSWER: ${answer}`].filter(Boolean).join('\n'));
    }
    if(clarifications.length)lines.push(`FAQ / CLARIFICATION\n${clarifications.join('\n\n')}`);
    return lines.join('\n\n');
  };
  const twistDefinition=entry=>{
    const body=entry.facts?.ruleBody;
    if(!body||typeof body!=='object')return'';
    const lines=[];
    if(text(body.flavorText))lines.push(`FLAVOR\n${text(body.flavorText)}`);
    const rules=[];
    for(const rule of body.rules||[]){const value=missionSourceText(rule);if(!value)return'';rules.push(value);}
    if(!rules.length)return'';
    lines.push(`RULES\n${rules.join('\n')}`);
    const operationDetails=[];
    for(const operation of body.operations||[]){
      if(operation.type==='BATTLELINE_ACTION_AND_SHOOTING_PERMISSION'){
        if(operation.keywordId!=='keyword-battleline')return'';
      }else if(operation.type==='REPLACE_BOTH_PRIMARY_MISSIONS'){
        if(!Array.isArray(operation.optionPrimaryMissionIds)||!operation.optionPrimaryMissionIds.length||operation.randomSelection?.die!=='D6'||!Array.isArray(operation.randomSelection.rerollResults))return'';
        operationDetails.push(`RANDOM SELECTION: ${operation.randomSelection.die}. Reroll results: ${operation.randomSelection.rerollResults.join(', ')}.`);
        if((body.options||[]).some(option=>!text(option.roll)))operationDetails.push(`ROLL-TO-OPTION MAPPING: Unresolved in accepted evidence.`);
      }else if(operation.type==='VISIBILITY_RANGE_LIMIT'){
        if(!Number.isFinite(operation.distanceInches))return'';
        operationDetails.push(`VISIBILITY RANGE LIMIT: ${operation.distanceInches}".`);
      }else if(operation.type==='INDIRECT_FIRE_TARGETING_RANGE_LIMIT'){
        if(!Number.isFinite(operation.distanceInches))return'';
        operationDetails.push(`INDIRECT FIRE TARGETING RANGE LIMIT: ${operation.distanceInches}".`);
      }else if(operation.type==='REMOVE_TERRAIN_RULE'){
        const target=byId.get(`core::${operation.canonicalTarget}`);
        if(!target)return'';
        operationDetails.push(`REMOVED TERRAIN RULE: ${target.label}.`);
      }else if(operation.type==='TEMPORARY_KEYWORD_GRANT_DURING_MOVE'){
        if(operation.keywordId!=='keyword-mobile'||!Array.isArray(operation.moveTypes)||!operation.moveTypes.length)return'';
        const moveLabels=new Map([['NORMAL','Normal'],['ADVANCE','Advance']]),moves=operation.moveTypes.map(value=>moveLabels.get(value));
        if(moves.some(value=>!value))return'';
        operationDetails.push(`TEMPORARY KEYWORD: MOBILE. MOVE TYPES: ${moves.join(', ')}.`);
      }else if(operation.type==='EXCHANGE_PRIMARY_MISSIONS'){
        // The accepted rule text completely expresses this operation.
      }else return'';
    }
    if(operationDetails.length)lines.push(`STRUCTURED DETAILS\n${operationDetails.join('\n')}`);
    if(Array.isArray(body.options)&&body.options.length){
      const options=[];
      for(const option of body.options){
        if(!text(option.label))return'';
        options.push(text(option.roll)?`${text(option.roll)}: ${text(option.label)}`:text(option.label));
      }
      lines.push(`OPTIONS\n${options.join('\n')}`);
    }
    const notes=(body.designersNotes||[]).map(text);
    if(notes.some(note=>!note))return'';
    if(notes.length)lines.push(`DESIGNER'S NOTES\n${notes.join('\n')}`);
    return lines.join('\n\n');
  };
  const forceDispositionDefinition=entry=>{
    const facts=entry.facts||{},lines=[];
    if(!Number.isInteger(facts.physicalMultiplicity)||facts.physicalMultiplicity<1)return'';
    lines.push(`PHYSICAL CARD MULTIPLICITY\n${facts.physicalMultiplicity}`);
    const assignments=[];
    for(const id of entry.mfm?.assignedDetachmentIds||[]){
      const detachment=byId.get(id),bookLabel=ownerLabel(detachment?.sourceOwner?.bookId);
      if(!detachment||detachment.recordType!=='DETACHMENT'||!bookLabel)return'';
      assignments.push(`${detachment.label} — ${bookLabel}`);
    }
    if(!assignments.length)return'';
    lines.push(`EFFECTIVE DETACHMENT ASSIGNMENTS\n${assignments.sort((a,b)=>a.localeCompare(b)).join('\n')}`);
    const relations=[];
    for(const relation of facts.missionMatrixRelations||[]){
      const opponent=byId.get(`missions::${relation.opponentForceDispositionId}`),primary=byId.get(`missions::${relation.primaryMissionId}`);
      if(!opponent||opponent.recordType!=='FORCE_DISPOSITION'||!primary||primary.recordType!=='PRIMARY_MISSION')return'';
      relations.push(`PLAYER: ${entry.label} | OPPONENT: ${opponent.label} | PRIMARY MISSION: ${primary.label}`);
    }
    if(!relations.length)return'';
    lines.push(`DIRECTED PRIMARY MISSION MATRIX\n${relations.join('\n')}`);
    return lines.join('\n\n');
  };
  const forceDispositionMatchupDefinition=entry=>{
    const facts=entry.facts||{};
    if(facts.unordered!==true||facts.reverseOrderEquivalent!==true||!Array.isArray(facts.memberForceDispositionIds)||facts.memberForceDispositionIds.length!==2)return'';
    const memberIds=[...facts.memberForceDispositionIds].sort(),members=memberIds.map(id=>byId.get(`missions::${id}`));
    if(members.some(member=>!member||member.recordType!=='FORCE_DISPOSITION'))return'';
    const lines=[`MATCHUP MEMBERS\n${members[0].label} ↔ ${members[1].label}`,`MATCHUP IDENTITY\nUnordered. Reverse order is the same matchup.`];
    const relations=[];
    for(const relation of facts.directedPrimaryRelations||[]){
      const player=byId.get(`missions::${relation.playerForceDispositionId}`),opponent=byId.get(`missions::${relation.opponentForceDispositionId}`),primary=byId.get(`missions::${relation.primaryMissionId}`);
      if(!player||player.recordType!=='FORCE_DISPOSITION'||!opponent||opponent.recordType!=='FORCE_DISPOSITION'||!primary||primary.recordType!=='PRIMARY_MISSION')return'';
      relations.push(`PLAYER: ${player.label} | OPPONENT: ${opponent.label} | PRIMARY MISSION: ${primary.label}`);
    }
    if(!relations.length)return'';
    lines.push(`DIRECTED PRIMARY MISSIONS\n${relations.join('\n')}`);
    const layouts=[];
    for(const id of facts.layoutIds||[]){const layout=byId.get(`missions::${id}`);if(!layout||layout.recordType!=='TERRAIN_LAYOUT')return'';layouts.push(layout.label);}
    if(layouts.length!==3)return'';
    lines.push(`EVENT TERRAIN LAYOUTS\n${layouts.join('\n')}`);
    return lines.join('\n\n');
  };
  const deploymentReferenceOf=entry=>{
    const facts=entry.facts||{},geometry=facts.geometry,source=geometry?.sourceRegistration,battlefield=geometry?.coordinateSystem?.battlefield;
    const expectedLayers=new Map([
      ['DEPLOYMENT_ZONES','deployment zones'],
      ['TERRITORIES','territories'],
      ['OBJECTIVE_POSITIONS','objective positions'],
      ['TERRAIN_AREAS','terrain areas'],
      ['MEASUREMENT_ENDPOINT_BINDINGS','measurement endpoint bindings']
    ]);
    if(geometry?.kind!=='DEPLOYMENT_GEOMETRY'||geometry.digitizationStatus!=='SOURCE_REGISTERED_PENDING_VERIFIED_DIGITIZATION')return null;
    if(!Number.isFinite(battlefield?.width)||!Number.isFinite(battlefield?.height)||!Array.isArray(geometry.measurements)||geometry.measurements.length!==2)return null;
    if(source?.type!=='AUTHENTICATED_RASTER_REFERENCE'||!/^https:\/\//.test(source.url||'')||!text(facts.sourceImagePath)||!source.url.endsWith(facts.sourceImagePath))return null;
    if(!Number.isInteger(source.pixelDimensions?.width)||!Number.isInteger(source.pixelDimensions?.height)||!Number.isInteger(source.byteSize)||!text(source.sha256))return null;
    if((geometry.zones||[]).length||(geometry.objectives||[]).length||(geometry.terrainAreas||[]).length)return null;
    const pendingLayers=(geometry.requiredVerifiedLayers||[]).map(value=>expectedLayers.get(value));
    if(pendingLayers.length!==expectedLayers.size||pendingLayers.some(value=>!value))return null;
    return Object.freeze({url:source.url,width:source.pixelDimensions.width,height:source.pixelDimensions.height,alt:`${entry.label} deployment reference`,battlefieldWidthInches:battlefield.width,battlefieldHeightInches:battlefield.height,sourceLocator:text(facts.provenance?.contentLocator),pendingLayers:Object.freeze(pendingLayers)});
  };
  const deploymentDefinition=entry=>{
    const reference=deploymentReferenceOf(entry);if(!reference)return'';
    return [`BATTLEFIELD\n${reference.battlefieldWidthInches}\" × ${reference.battlefieldHeightInches}\".`,`SOURCE REFERENCE\n${reference.sourceLocator}. Authenticated raster: ${reference.width} × ${reference.height}px.`,`GEOMETRY STATUS\nSource visual registered. Verified machine-readable ${reference.pendingLayers.join(', ')} remain pending digitization.`].join('\n\n');
  };
  const terrainLayoutReferenceOf=entry=>{
    const facts=entry.facts||{},geometry=facts.geometry,registration=geometry?.sourceRegistration,visuals=facts.visualReferences,battlefield=geometry?.coordinateSystem?.battlefield;
    const expectedLayers=new Map([
      ['TERRAIN_FOOTPRINT_POLYGONS','terrain footprints'],
      ['TERRAIN_POSITIONS','terrain positions'],
      ['OBJECTIVE_POSITIONS','objective positions'],
      ['MEASUREMENT_ENDPOINT_BINDINGS','measurement endpoint bindings']
    ]),orientationLabels=new Map([['attacker-top-defender-bottom','Attacker at top; Defender at bottom.'],['attacker-left-defender-right','Attacker at left; Defender at right.']]);
    const matchup=byId.get(`missions::${facts.matchupId}`),members=(matchup?.facts?.memberForceDispositionIds||[]).map(id=>byId.get(`missions::${id}`));
    if(geometry?.kind!=='TERRAIN_LAYOUT_GEOMETRY'||geometry.digitizationStatus!=='SOURCE_REGISTERED_PENDING_VERIFIED_DIGITIZATION')return null;
    if(!['A','B','C'].includes(facts.variant)||!matchup||matchup.recordType!=='FORCE_DISPOSITION_MATCHUP'||members.length!==2||members.some(member=>!member||member.recordType!=='FORCE_DISPOSITION'))return null;
    if(!matchup.facts.layoutIds?.includes(facts.id)||!Number.isFinite(battlefield?.width)||!Number.isFinite(battlefield?.height)||battlefield.width!==44||battlefield.height!==60)return null;
    if(!Array.isArray(geometry.measurements)||geometry.measurements.length!==2||(geometry.zones||[]).length||(geometry.objectives||[]).length||(geometry.terrainAreas||[]).length)return null;
    if(registration?.type!=='OFFICIAL_PDF_VECTOR_PAGE'||!text(registration.pdfPath)||!Number.isInteger(registration.page)||!registration.battlefieldBoundsPdfPoints)return null;
    if(visuals?.factualAuthority!==false||visuals.authorityClass!=='SECONDARY_VISUAL_REFERENCE'||!orientationLabels.has(visuals.orientation))return null;
    if(!/^https:\/\//.test(visuals.plain?.url||'')||!text(visuals.plain?.sha256)||!/^https:\/\//.test(visuals.measurements?.url||'')||!text(visuals.measurements?.sha256))return null;
    if(entries.filter(candidate=>candidate.recordType==='TERRAIN_LAYOUT'&&candidate.facts?.visualReferences?.measurements?.url===visuals.measurements.url).length!==1)return null;
    const pendingLayers=(geometry.requiredVerifiedLayers||[]).map(value=>expectedLayers.get(value));
    if(pendingLayers.length!==expectedLayers.size||pendingLayers.some(value=>!value))return null;
    return Object.freeze({url:visuals.measurements.url,sha256:visuals.measurements.sha256,alt:`${entry.label} measured terrain layout reference`,variant:facts.variant,matchupId:matchup.id,matchupLabel:matchup.label,memberIds:Object.freeze(members.map(member=>member.id)),memberLabels:Object.freeze(members.map(member=>member.label)),battlefieldWidthInches:battlefield.width,battlefieldHeightInches:battlefield.height,orientation:orientationLabels.get(visuals.orientation),officialSource:text(facts.provenance?.contentLocator),officialPdfPath:registration.pdfPath,officialPdfPage:registration.page,pendingLayers:Object.freeze(pendingLayers)});
  };
  const terrainLayoutDefinition=entry=>{
    const reference=terrainLayoutReferenceOf(entry);if(!reference)return'';
    return [`MATCHUP\n${reference.matchupLabel}`,`FORCE DISPOSITIONS\n${reference.memberLabels.join(' ↔ ')}`,`LAYOUT VARIANT\n${reference.variant}`,`BATTLEFIELD\n${reference.battlefieldWidthInches}\" × ${reference.battlefieldHeightInches}\". ${reference.orientation}`,`OFFICIAL SOURCE\n${reference.officialSource}. Registered Event Companion page ${reference.officialPdfPage}.`,`VISUAL REFERENCE\nAccepted secondary measurements view. The official Event Companion remains the factual authority.`,`GEOMETRY STATUS\nSource references registered. Verified machine-readable ${reference.pendingLayers.join(', ')} remain pending digitization.`].join('\n\n');
  };
  function definitionOf(entry,seen=new Set()){
    if(seen.has(entry.id))return'';
    seen=new Set([...seen,entry.id]);
    const facts=entry.facts||{};
    const owned=id=>canonicalArmy.get(entry.sourceOwner?.bookId+'\0'+id);
    const referenceContent=ids=>ids.map(id=>{const target=owned(id);return target&&[target.label,definitionOf(target,seen)].filter(Boolean).join('\n');}).filter(Boolean).join('\n\n');
    if(facts.canonicalData){
      if(text(facts.text)&&facts.tables?.length)return [facts.text,collectContent(facts.tables)].filter(Boolean).join('\n');
      if(entry.recordType==='PROFILE')return unitProfileDefinition({name:entry.label,stats:facts.stats});
      if(entry.recordType==='STRATAGEM')return [facts.cp,...(facts.lines||[]).map(line=>typeof line==='string'?line:[line.label,line.text].filter(Boolean).join(': '))].filter(Boolean).join('\n');
      if(entry.recordType==='UNIT_COMPOSITION')return collectContent(facts.equipmentAndRules);
      if(entry.recordType==='STRUCTURED_RULE_TABLE')return collectContent([{rows:facts.rows,columns:facts.columns}]);
      if(['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(entry.recordType))return facts.keyword||entry.label;
      if(entry.recordType==='INVULNERABLE_SAVE')return 'Invulnerable Save: '+facts.value;
      if(entry.recordType==='COMPOSITION_MEMBER')return text(facts.sourceText);
      if(facts.officialQuestion||facts.officialAnswer)return [facts.officialQuestion,facts.officialAnswer].filter(Boolean).join('\n');
      if(text(facts.instruction))return facts.instruction;
      if(entry.recordType==='KEYWORD_SCOPES')return (facts.scopes||[]).map(scope=>scope.label+'\n'+scope.keywords.join(', ')).join('\n\n');
      if(entry.recordType==='RULE_REFERENCE'&&facts.groups)return facts.groups.map(group=>group.label+'\n'+group.entries.map(record=>record.label).join(', ')).join('\n\n');
      if(entry.recordType==='SOURCE_UPDATE_REFERENCE')return ['Official update · Page '+facts.page,...(facts.targetIds||[]).map(id=>owned(id)?.label).filter(Boolean)].join('\n');
      if(facts.sourceSectionId)return referenceContent([facts.sourceSectionId]);
      if(facts.factReferenceId)return referenceContent([facts.factReferenceId]);
      if(facts.componentIds?.length)return referenceContent(facts.componentIds);
      if(facts.clauses?.length)return collectContent(facts.clauses);
      if(entry.recordType==='UPGRADE_DECLARATION')return referenceContent([facts.selectionRuleId,...facts.optionIds||[]].filter(Boolean));
      if(entry.recordType==='UPGRADE_OPTION'&&facts.keyword)return facts.keyword+'\n'+referenceContent([facts.selectionRuleId].filter(Boolean));
    }
    if(facts.sourceConflict?.status==='UNRESOLVED_ACCEPTED_SOURCE_CONFLICT')return [facts.sourceConflict.notice,...facts.sourceConflict.occurrences.map(occurrence=>[occurrence.title,occurrence.presentationText].join('\n'))].join('\n\n');
    if(entry.recordType==='DETACHMENT'){const definition=detachmentDefinition(entry);if(definition)return definition;}
    if(entry.recordType==='MISSION_SEQUENCE_RULE')return missionSequenceDefinition(entry);
    if(entry.recordType==='PRIMARY_MISSION'||entry.recordType==='SECONDARY_MISSION')return missionCardDefinition(entry);
    if(entry.recordType==='TWIST')return twistDefinition(entry);
    if(entry.recordType==='FORCE_DISPOSITION')return forceDispositionDefinition(entry);
    if(entry.recordType==='FORCE_DISPOSITION_MATCHUP')return forceDispositionMatchupDefinition(entry);
    if(entry.recordType==='DEPLOYMENT')return deploymentDefinition(entry);
    if(entry.recordType==='TERRAIN_LAYOUT')return terrainLayoutDefinition(entry);
    if(entry.recordType==='UPDATE'&&Array.isArray(facts.acceptedResultingSemantics))return facts.acceptedResultingSemantics.map(group=>[`ACCEPTED UPDATE — PAGE ${group.sourcePage}`,group.section,...group.items.flatMap(item=>[`CHANGED RULE\n${item.changedRule}`,`RESULTING EFFECTIVE RULE\n${text(item.resultingEffectiveRule).replace(/[■▪▫•]/g,'-')}`])].join('\n\n')).join('\n\n');
    for(const field of ['semanticContent','text','full','definition','ruleText','rulesText','answer','description']){const value=text(facts[field]);if(value)return value;}
    const structuredOptions=structuredOptionsDefinition(facts);if(structuredOptions)return structuredOptions;
    const content=collectContent(facts.content);if(content)return content;
    const blocks=collectContent(facts.blocks);if(blocks)return blocks;
    if(facts.clarification?.sourceText)return clarificationText(facts.clarification);
    if(facts.ruleBody){
      if(typeof facts.ruleBody==='string')return facts.ruleBody;
      const body=facts.ruleBody;
      const values=[body.flavorText,body.ruleText,body.text,body.scoring,body.timing,body.cap,body.objectiveAction].flatMap(value=>Array.isArray(value)?value:[value]).filter(value=>typeof value==='string'&&value.trim());
      if(values.length)return values.join('\n');
      return typedReferenceDefinition(body, facts.effectiveClarifications || []);
    }
    if(entry.recordType==='STRATAGEM'){if(Array.isArray(facts.lines)&&facts.lines.length)return facts.lines.map(line=>text(line)).filter(Boolean).join('\n');return [['WHEN',facts.when],['TARGET',facts.target],['EFFECT',facts.effect],['RESTRICTIONS',facts.restrictions]].filter(([,value])=>text(value)).map(([label,value])=>`${label}: ${value}`).join('\n');}
    if(entry.recordType==='WEAPON_PROFILE')return weaponProfileDefinition(facts);
    if(entry.recordType==='UNIT')return unitDefinition(entry);
    if(Array.isArray(facts.requirements))return facts.requirements.map(item=>typeof item==='string'?item:missionSequenceRequirement(item)).filter(Boolean).join('\n');
    for(const field of ['effect','summary','label']){const value=text(facts[field]);if(value)return value;}
    return'';
  }
  const summaryOf=(entry,definition)=>text(entry.facts?.sourceConflict?.notice)||text(entry.presentation?.editorialSummary?.text)||definition.split(/\n+/).find(Boolean)||entry.label;
  function structuredOf(entry){
    const facts=entry.facts||{};
    if(entry.recordType==='DEPLOYMENT'){const deploymentReference=deploymentReferenceOf(entry);if(deploymentReference)return{deploymentReference};}
    if(entry.recordType==='TERRAIN_LAYOUT'){const terrainLayoutReference=terrainLayoutReferenceOf(entry);if(terrainLayoutReference)return{terrainLayoutReference};}
    if(entry.recordType==='WEAPON_PROFILE'){
      const ranged=(facts.mode||'').toLowerCase()==='ranged'||String(facts.range||facts.Range||'').toLowerCase()!=='melee';
      return{weapon:{Range:facts.range??facts.Range??'',A:facts.a??facts.A??'',[ranged?'BS':'WS']:facts.skill??facts.bs??facts.BS??facts.ws??facts.WS??'',S:facts.s??facts.S??'',AP:facts.ap??facts.AP??'',D:facts.d??facts.D??'',Abilities:facts.abilities??facts.Abilities??''}};
    }
    if(entry.recordType==='UNIT'){
      const modelProfiles=(facts.profiles||[]).map(profile=>({name:profile.name,stats:profile.stats}));
      // A mixed-profile Unit must never acquire its first profile as a whole-Unit statline.
      const stats=modelProfiles.length===1?modelProfiles[0].stats:!modelProfiles.length?facts.stats:null;
      if(modelProfiles.length||stats)return{...(stats?{statline:stats}:{}),modelProfiles};
    }
    return{};
  }

  const contextualEntry=(entry,bookId='')=>{
    if(!bookId||entry.domain!=='ARMY')return entry;
    const context=(entry.contexts||[]).find(item=>item.effectiveBookId===bookId);
    if(!context)return entry;
    const facts={...entry.facts,...(context.factOverrides||{})};
    for(const field of context.omittedFactFields||[])delete facts[field];
    return {...entry,facts,mfm:context.mfm||entry.mfm};
  };
  const mfmPresentation=entry=>{
    const mfm=entry.mfm||{},lines=[];
    if(Number.isFinite(mfm.enhancementCost?.value))lines.push(mfm.enhancementCost.value+' pts');
    for(const point of mfm.pointRecords||[])for(const schedule of point.pointSchedules||[]) {
      if(text(schedule.sourceLabel))lines.push(text(schedule.sourceLabel));
      if(Number.isFinite(schedule.minCopies))lines.push('Units '+schedule.minCopies+(schedule.maxCopies==null?'+':schedule.maxCopies===schedule.minCopies?'':'–'+schedule.maxCopies));
      for(const option of schedule.entries||[]) {
        if(!Number.isFinite(option.value))continue;
        const count=Number.isFinite(option.minModels)?option.minModels===option.maxModels?String(option.minModels):option.minModels+'–'+option.maxModels:'';
        lines.push((count?count+' '+(option.maxModels===1?'model':'models'):text(option.sourceLabel))+' — '+option.value+' pts');
      }
    }
    for(const option of mfm.paidUpgrades||[])if(Number.isFinite(option.value))lines.push(option.label+' — +'+option.value+' pts');
    for(const qualifier of mfm.qualifiers||[])if(qualifier.label&&!entry.facts?.tags?.includes(qualifier.label))lines.push(qualifier.label);
    const conditionSources=new Set();let conditionalRoles=false;
    for(const [field,label]of [['leaderRelations','Leader'],['supportRelations','Support']]) {
      const relations=mfm[field]||[];
      const targets=[...new Set(relations.filter(relation=>!relation.roleCondition).flatMap(relation=>relation.targetEntryIds||[]))].map(id=>byId.get(id)?.label).filter(Boolean);
      if(targets.length)lines.push(label+': '+targets.join(', '));
      for(const relation of relations.filter(relation=>relation.roleCondition)){
        const names=(relation.targetEntryIds||[]).map(id=>byId.get(id)?.label).filter(Boolean);
        if(!names.length)continue;
        conditionalRoles=true;
        const condition=relation.roleCondition,proof=relation.roleConditionProvenance?.armyRule;
        const trigger=proof&&canonicalArmy.get(proof.armyBookId+'\0'+proof.triggerUnitId);
        const source=proof&&canonicalArmy.get(proof.armyBookId+'\0'+proof.canonicalRuleId);
        const sourceText=source?.facts.canonicalData?.conditionText||source?.facts.canonicalData?.rawText;
        const proven=condition.kind==='ARMY_UNIT_PRESENT'&&typeof condition.expectedPresent==='boolean'&&
          proof?.armyBookId===entry.sourceOwner.bookId&&proof.ownerUnitId===entry.sourceOwner.canonicalId&&
          trigger?.recordType==='UNIT'&&source?.parent?.canonicalId===entry.sourceOwner.canonicalId&&
          text(proof.sourceText)&&sourceText===proof.sourceText;
        const caption=proven?trigger.label+' '+(condition.expectedPresent?'present':'absent')+' in army':'source condition unresolved';
        lines.push(label+' (conditional; '+caption+'): '+names.join(', '));
        if(proven&&!conditionSources.has(proof.canonicalRuleId)){
          conditionSources.add(proof.canonicalRuleId);lines.push('Condition source: '+proof.sourceText);
        }
      }
    }
    if(conditionalRoles)lines.push('Army context not evaluated.');
    return Object.freeze({lines:Object.freeze(lines)});
  };
  function project(entry,{bookId=defaultBookId}={}) {
    if(!entry||!byId.has(entry.id))throw new TypeError('Unknown qualified global glossary entry');
    const contextual=contextualEntry(entry,bookId),definition=definitionOf(contextual);
    return Object.freeze({entry:contextual,definition,summary:summaryOf(contextual,definition),structured:Object.freeze(structuredOf(contextual)),mfm:mfmPresentation(contextual)});
  }
  return Object.freeze({project});
}
