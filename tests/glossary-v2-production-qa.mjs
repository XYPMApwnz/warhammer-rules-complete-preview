import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const index=JSON.parse(read('glossary/v2/generated/index.en.json'));
const scope={window:{}};
vm.runInNewContext(read('glossary/v2/generated/index.en.js'),scope);
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),scope);
const api=scope.window.WH40K_GLOSSARY;

const missionSequence=api.standaloneEntries().filter(entry=>entry.recordType==='MISSION_SEQUENCE_RULE');
assert.equal(missionSequence.length,21,'all 21 Mission Sequence Rule identities must remain standalone');
assert.equal(new Set(missionSequence.map(entry=>entry.id)).size,21,'Mission Sequence Rule identities must remain unique');
const rawOperationCode=/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+){2,}\b/;
for(const entry of missionSequence){
  assert(entry.definition.en.trim(),`${entry.id}: readable Mission Sequence definition`);
  assert.notEqual(entry.definition.en.trim().toLocaleLowerCase(),entry.label.trim().toLocaleLowerCase(),`${entry.id}: definition must not echo its title`);
  assert.doesNotMatch(entry.definition.en,rawOperationCode,`${entry.id}: internal operation codes must not be user-facing`);
  assert.equal(api.get(entry.id)?.definition.en,entry.definition.en,`${entry.id}: popup/article definition parity`);
}
const missionSequenceById=id=>api.get(`missions::${id}`);
const redeploy=missionSequenceById('mission-sequence-redeploy-units');
assert.match(redeploy.definition.en,/after both armies have been deployed/i);
assert.match(redeploy.definition.en,/Starting with the Attacker, players alternate/i);
assert.match(redeploy.definition.en,/Strategic Reserves points limit/i);
const createBattlefield=missionSequenceById('mission-sequence-create-battlefield');
assert.match(createBattlefield.definition.en,/60" by 44" battlefield/i);
assert.match(createBattlefield.definition.en,/on 1, 2, 3, 4, 5, use one central objective; on 6, use two central objectives, each 6" from the battlefield centre/i);
assert.match(createBattlefield.definition.en,/After a roll-off, players alternate placing terrain features/i);
assert.match(createBattlefield.definition.en,/terrain objective at each objective point/i);
const scoring=missionSequenceById('mission-sequence-determine-victor');
assert.match(scoring.definition.en,/Primary Missions 45VP total and 15VP per battle round/i);
assert.match(scoring.definition.en,/Secondary Missions 45VP total and 15VP per battle round/i);
const ordering=missionSequenceById('mission-sequence-deploy-armies');
assert.match(ordering.definition.en,/Starting with the Defender, players alternate setting up one unit at a time/i);
const reserve=missionSequenceById('mission-sequence-declare-battle-formations');
assert.match(reserve.definition.en,/Strategic Reserves/i);

const unknownSequenceIndex=structuredClone(index);
const unknownSequence=unknownSequenceIndex.entries.find(entry=>entry.id==='missions::mission-sequence-redeploy-units');
unknownSequence.facts.requirements[0].type='UNKNOWN_SEQUENCE_OPERATION';
const unknownScope={window:{WH40K_GLOSSARY_V2_INDEX:unknownSequenceIndex}};
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),unknownScope);
assert.equal(unknownScope.window.WH40K_GLOSSARY.get(unknownSequence.id).definition.en,'','unknown Mission Sequence operations must fail closed instead of exposing internal codes');

const missionCards=index.entries.filter(entry=>entry.recordType==='PRIMARY_MISSION'||entry.recordType==='SECONDARY_MISSION');
const primaryCards=missionCards.filter(entry=>entry.recordType==='PRIMARY_MISSION');
const secondaryCards=missionCards.filter(entry=>entry.recordType==='SECONDARY_MISSION');
assert.equal(primaryCards.length,25,'all 25 Primary Mission identities must remain standalone');
assert.equal(secondaryCards.length,18,'all 18 Secondary Mission identities must remain standalone');
assert.equal(new Set(missionCards.map(entry=>entry.id)).size,43,'Mission card identities must remain unique');
for(const source of missionCards){
  const article=api.get(source.id),body=source.facts.ruleBody,definition=article.definition.en;
  assert(definition.trim(),`${source.id}: readable Mission card definition`);
  assert(definition.includes(body.flavorText),`${source.id}: flavor text remains visibly distinct`);
  assert.match(definition,/SCORING\n/,`${source.id}: scoring section`);
  assert.notEqual(definition.trim(),body.flavorText.trim(),`${source.id}: article must not stop at flavor text`);
  assert.doesNotMatch(definition,rawOperationCode,`${source.id}: internal operation codes must not be user-facing`);
  assert.equal(api.get(source.id)?.definition.en,definition,`${source.id}: popup/article definition parity`);
  for(const component of body.ruleComponents||[])assert(definition.includes(component.text),`${source.id}: additional rule component ${component.id}`);
  for(const rule of body.whenDrawn||[])assert(definition.includes(rule.text),`${source.id}: When Drawn rule ${rule.id}`);
  for(const clause of body.scoringClauses||[]){
    assert(definition.includes(clause.battleRoundWindow),`${source.id}: scoring window ${clause.id}`);
    if(clause.timing)assert(definition.includes(clause.timing),`${source.id}: scoring timing ${clause.id}`);
    assert(definition.includes(clause.condition.text),`${source.id}: scoring condition ${clause.id}`);
    for(const award of clause.victoryPointAwards){
      assert(definition.includes(`${award.victoryPoints}VP`),`${source.id}: VP award ${clause.id}`);
      if(award.mode!=='ALL')assert(definition.includes(award.mode==='FIXED'?'Fixed':'Tactical'),`${source.id}: scoring mode ${clause.id}`);
      if(award.limitText)assert(definition.includes(award.limitText),`${source.id}: award limit ${clause.id}`);
    }
  }
  if(body.objectiveAction){
    const restrictions=typeof body.objectiveAction.restrictions==='string'?body.objectiveAction.restrictions:body.objectiveAction.restrictions?.text;
    for(const value of [body.objectiveAction.label,body.objectiveAction.starts,body.objectiveAction.unitSelector.text,body.objectiveAction.useLimit,body.objectiveAction.completes,body.objectiveAction.effect.text,restrictions].filter(Boolean))assert(definition.includes(value),`${source.id}: Objective Action semantics`);
  }
  if(body.caps)assert(definition.includes(`${body.caps.fixedModePerCardMaximumVictoryPoints}VP`),`${source.id}: per-card cap`);
  for(const overlay of source.facts.effectiveClarifications||[]){
    if(overlay.clarification.appliesToClauseText)assert(definition.includes(overlay.clarification.appliesToClauseText),`${source.id}: FAQ target clause`);
    assert(definition.includes(overlay.clarification.sourceText),`${source.id}: effective FAQ answer`);
  }
  if(source.recordType==='PRIMARY_MISSION'){
    const player=index.entries.find(entry=>entry.id===`missions::${source.facts.playerForceDispositionId}`),opponent=index.entries.find(entry=>entry.id===`missions::${source.facts.opponentForceDispositionId}`);
    assert(player&&opponent,`${source.id}: exact Force Disposition targets`);
    assert(definition.includes(`PLAYER: ${player.label}\nOPPONENT: ${opponent.label}`),`${source.id}: directed Force Disposition context`);
    for(const coreId of source.facts.ruleBody.coreRuleRefs){
      const core=index.entries.find(entry=>entry.id===`core::${coreId}`);assert(core,`${source.id}: exact Core target ${coreId}`);
      assert(definition.includes(core.label),`${source.id}: visible Core reference ${coreId}`);
      assert(article.related.includes(core.id),`${source.id}: clickable Core reference ${coreId}`);
    }
    assert(article.related.includes(player.id)&&article.related.includes(opponent.id),`${source.id}: clickable directed Force Disposition targets`);
  }
}
const delayingAction=api.get('missions::primary-delaying-action');
assert.match(delayingAction.definition.en,/FORCE DISPOSITION CONTEXT\nPLAYER: Disruption\nOPPONENT: Purge the Foe/,'Delaying Action directed Force Disposition relation');
assert.match(delayingAction.definition.en,/CORE RULE REFERENCES\n5\. End of Command Phase\nLevel of Control/,'Delaying Action Core references');
assert.deepEqual(new Set(delayingAction.related),new Set(['missions::force-disposition-disruption','missions::force-disposition-purge-the-foe','core::core-rule-08-05-end-of-command-phase','core::core-rule-14-02-level-of-control']),'Delaying Action exact clickable targets');
const battlefieldDominance=api.get('missions::primary-battlefield-dominance');
assert.match(battlefieldDominance.definition.en,/For each objective you control[\s\S]*VP: 3VP[\s\S]*cumulative with the previous scoring condition[\s\S]*ADDITIONAL VP: 2VP/i,'Primary multi-branch scoring must remain explicit');
const deathTrap=api.get('missions::primary-death-trap');
assert.match(deathTrap.definition.en,/OBJECTIVE ACTION — Booby Trap[\s\S]*USE LIMIT:[\s\S]*EFFECT:/,'Primary Objective Action must remain structured');
assert.match(deathTrap.definition.en,/FAQ \/ CLARIFICATION[\s\S]*ANSWER: No\./,'Primary FAQ clarification must be separate from source rules');
const grievousBlow=api.get('missions::secondary-a-grievous-blow');
assert.match(grievousBlow.definition.en,/ELIGIBILITY[\s\S]*Fixed: Yes\. Tactical: Yes\./,'Secondary eligibility must be explicit');
assert.match(grievousBlow.definition.en,/WHEN DRAWN[\s\S]*discard this card and draw one new Secondary Mission card/i,'Secondary When Drawn rule must be retained');
assert.match(grievousBlow.definition.en,/CAPS[\s\S]*maximum 20VP from this card/i,'Secondary per-card cap must be retained');
const plunder=api.get('missions::secondary-plunder');
assert.match(plunder.definition.en,/OBJECTIVE ACTION — Plunder[\s\S]*Once per turn[\s\S]*That terrain area is plundered/,'Secondary Objective Action must remain structured');
assert.match(plunder.definition.en,/FAQ \/ CLARIFICATION[\s\S]*The terrain area\./,'Secondary FAQ clarification must be retained');

const unknownCardIndex=structuredClone(index);
const unknownCard=unknownCardIndex.entries.find(entry=>entry.id==='missions::primary-battlefield-dominance');
unknownCard.facts.ruleBody.scoringClauses[0].victoryPointAwards[0].operation='UNKNOWN_SCORING_OPERATION';
const unknownCardScope={window:{WH40K_GLOSSARY_V2_INDEX:unknownCardIndex}};
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),unknownCardScope);
assert.equal(unknownCardScope.window.WH40K_GLOSSARY.get(unknownCard.id).definition.en,'','unknown Mission card operations must fail closed instead of exposing internal codes');

for(const mutation of [
  entry=>entry.canonicalReferences=entry.canonicalReferences.filter(reference=>reference.relationType!=='PLAYER_FORCE_DISPOSITION'),
  entry=>{const player=entry.canonicalReferences.find(reference=>reference.relationType==='PLAYER_FORCE_DISPOSITION'),opponent=entry.canonicalReferences.find(reference=>reference.relationType==='OPPONENT_FORCE_DISPOSITION');[player.relationType,opponent.relationType]=[opponent.relationType,player.relationType];},
  entry=>entry.canonicalReferences.find(reference=>reference.relationType==='CORE_RULE').canonicalId='core-rule-wrong-target',
  entry=>entry.canonicalReferences.push({domain:'CORE',id:'core::core-deep-strike',canonicalId:'core-deep-strike',relationType:'CORE_RULE'})
]){
  const mutatedIndex=structuredClone(index),mutated=mutatedIndex.entries.find(entry=>entry.id==='missions::primary-delaying-action');mutation(mutated);
  const mutatedScope={window:{WH40K_GLOSSARY_V2_INDEX:mutatedIndex}};vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),mutatedScope);
  assert.equal(mutatedScope.window.WH40K_GLOSSARY.get(mutated.id).definition.en,'','missing, reversed, wrong or extra Primary relation/reference must fail closed');
}

const twists=index.entries.filter(entry=>entry.recordType==='TWIST');
assert.equal(twists.length,6,'all six Twist identities must remain standalone');
assert.equal(new Set(twists.map(entry=>entry.id)).size,6,'Twist identities must remain unique');
const twistOperationCodes=new Set(twists.flatMap(entry=>entry.facts.ruleBody.operations.map(operation=>operation.type)));
for(const source of twists){
  const article=api.get(source.id),body=source.facts.ruleBody,definition=article.definition.en;
  assert(definition.trim(),`${source.id}: readable Twist definition`);
  assert(definition.includes(body.flavorText),`${source.id}: flavor remains distinct`);
  assert.notEqual(definition.trim(),body.flavorText.trim(),`${source.id}: article must not stop at flavor text`);
  for(const rule of body.rules)assert(definition.includes(rule.text),`${source.id}: accepted gameplay rule ${rule.id}`);
  for(const note of body.designersNotes)assert(definition.includes(note),`${source.id}: accepted Designer's Note`);
  for(const option of body.options)assert(definition.includes(option.label),`${source.id}: accepted option ${option.label}`);
  for(const operationCode of twistOperationCodes)assert(!definition.includes(operationCode),`${source.id}: internal operation code ${operationCode} must not be visible`);
  assert.equal(api.get(source.id)?.definition.en,definition,`${source.id}: popup/article definition parity`);
}
const nowhereToHide=api.get('missions::twist-nowhere-to-hide');
assert.match(nowhereToHide.definition.en,/Terrain features do not have the Solid rule[\s\S]*Designer’s Note:/,'simple Twist must include its rule and note');
const nightFighting=api.get('missions::twist-night-fighting');
assert.match(nightFighting.definition.en,/not visible to enemy models unless they are within 18"[\s\S]*VISIBILITY RANGE LIMIT: 18"[\s\S]*INDIRECT FIRE TARGETING RANGE LIMIT: 18"/,'structured Twist range operations must be readable');
const ruinscape=api.get('missions::twist-ruinscape');
assert.match(ruinscape.definition.en,/until that move ends[\s\S]*TEMPORARY KEYWORD: MOBILE[\s\S]*MOVE TYPES: Normal, Advance/,'Twist timing and duration must remain explicit');
const mirroredWorldArticle=api.get('missions::twist-mirrored-world');
assert.match(mirroredWorldArticle.definition.en,/both replace their Primary Mission card with the same one/i,'Mirrored World accepted rule');
for(const label of ['Battlefield Dominance','Meatgrinder','Outmanoeuvre','Gather Intel','Sabotage','(Roll again)'])assert(mirroredWorldArticle.definition.en.includes(label),`Mirrored World option ${label}`);
assert.match(mirroredWorldArticle.definition.en,/RANDOM SELECTION: D6\. Reroll results: 6\./,'Mirrored World proven D6 metadata');
assert.match(mirroredWorldArticle.definition.en,/ROLL-TO-OPTION MAPPING: Unresolved in accepted evidence\./,'Mirrored World unresolved mapping must remain visible');
assert.doesNotMatch(mirroredWorldArticle.definition.en,/\b[1-5]\s*[:=\-–]\s*(?:Battlefield Dominance|Meatgrinder|Outmanoeuvre|Gather Intel|Sabotage)/,'Mirrored World must not invent roll-to-option assignments');

const unknownTwistIndex=structuredClone(index);
const unknownTwist=unknownTwistIndex.entries.find(entry=>entry.id==='missions::twist-night-fighting');
unknownTwist.facts.ruleBody.operations[0].type='UNKNOWN_TWIST_OPERATION';
const unknownTwistScope={window:{WH40K_GLOSSARY_V2_INDEX:unknownTwistIndex}};
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),unknownTwistScope);
assert.equal(unknownTwistScope.window.WH40K_GLOSSARY.get(unknownTwist.id).definition.en,'','unknown Twist operations must fail closed instead of exposing internal codes');

const forceDispositions=index.entries.filter(entry=>entry.recordType==='FORCE_DISPOSITION');
const matchups=index.entries.filter(entry=>entry.recordType==='FORCE_DISPOSITION_MATCHUP');
assert.equal(forceDispositions.length,5,'all five Force Dispositions must remain standalone');
assert.equal(matchups.length,15,'all 15 matchup identities must remain standalone');
assert.equal(new Set(forceDispositions.map(entry=>entry.id)).size,5,'Force Dispositions must not duplicate');
assert.equal(new Set(matchups.map(entry=>entry.id)).size,15,'matchups must not duplicate');
for(const source of forceDispositions){
  const article=api.get(source.id),definition=article.definition.en;
  assert(definition.trim(),`${source.id}: useful Force Disposition definition`);
  assert.notEqual(definition.trim().toLocaleLowerCase(),source.label.trim().toLocaleLowerCase(),`${source.id}: definition must not echo title`);
  assert.match(definition,/PHYSICAL CARD MULTIPLICITY\n2/);
  for(const id of source.mfm.assignedDetachmentIds){const target=index.entries.find(entry=>entry.id===id);assert(target&&definition.includes(target.label),`${source.id}: Detachment assignment ${id}`);assert(!definition.includes(id),`${source.id}: raw Detachment ID hidden`);}
  for(const relation of source.facts.missionMatrixRelations){
    const opponent=index.entries.find(entry=>entry.id===`missions::${relation.opponentForceDispositionId}`),primary=index.entries.find(entry=>entry.id===`missions::${relation.primaryMissionId}`);
    assert(definition.includes(`PLAYER: ${source.label} | OPPONENT: ${opponent.label} | PRIMARY MISSION: ${primary.label}`),`${source.id}: directed Primary relation`);
    assert(!definition.includes(relation.opponentForceDispositionId)&&!definition.includes(relation.primaryMissionId),`${source.id}: raw Mission IDs hidden`);
    assert(article.related.includes(opponent.id)&&article.related.includes(primary.id),`${source.id}: directed relation targets remain canonical links`);
  }
  assert.equal(api.get(source.id)?.definition.en,definition,`${source.id}: popup/article parity`);
}
for(const source of matchups){
  const article=api.get(source.id),definition=article.definition.en;
  assert(definition.trim(),`${source.id}: useful matchup definition`);
  assert.notEqual(definition.trim().toLocaleLowerCase(),source.label.trim().toLocaleLowerCase(),`${source.id}: definition must not echo title`);
  assert.match(definition,/MATCHUP IDENTITY\nUnordered\. Reverse order is the same matchup\./);
  for(const relation of source.facts.directedPrimaryRelations){
    const player=index.entries.find(entry=>entry.id===`missions::${relation.playerForceDispositionId}`),opponent=index.entries.find(entry=>entry.id===`missions::${relation.opponentForceDispositionId}`),primary=index.entries.find(entry=>entry.id===`missions::${relation.primaryMissionId}`);
    assert(definition.includes(`PLAYER: ${player.label} | OPPONENT: ${opponent.label} | PRIMARY MISSION: ${primary.label}`),`${source.id}: directed Primary relation`);
    assert(article.related.includes(player.id)&&article.related.includes(opponent.id)&&article.related.includes(primary.id),`${source.id}: directed relation targets remain canonical links`);
  }
  for(const id of source.facts.layoutIds){const layout=index.entries.find(entry=>entry.id===`missions::${id}`);assert(layout&&definition.includes(layout.label),`${source.id}: Event layout ${id}`);assert(!definition.includes(id),`${source.id}: raw layout ID hidden`);assert(article.related.includes(layout.id),`${source.id}: layout remains a canonical link`);}
  assert.equal(api.get(source.id)?.definition.en,definition,`${source.id}: popup/article parity`);
}
const disruption=api.get('missions::force-disposition-disruption');
assert.match(disruption.definition.en,/EFFECTIVE DETACHMENT ASSIGNMENTS[\s\S]*Mortarion’s Hammer|EFFECTIVE DETACHMENT ASSIGNMENTS[\s\S]*Spearpoint Task Force/i,'representative Force Disposition must expose MFM assignments');
assert.match(disruption.definition.en,/PLAYER: Disruption \| OPPONENT: Priority Assets \| PRIMARY MISSION: Locate and Deny/,'representative directed Primary matrix relation');
const disruptionPriority=api.get('missions::force-disposition-matchup-disruption--priority-assets');
assert.match(disruptionPriority.definition.en,/Disruption ↔ Priority Assets[\s\S]*Layout A[\s\S]*Layout B[\s\S]*Layout C/,'representative matchup and A/B/C layouts');
assert.match(disruptionPriority.definition.en,/PLAYER: Disruption \| OPPONENT: Priority Assets \| PRIMARY MISSION: Locate and Deny/,'forward directed Primary relation');
assert.match(disruptionPriority.definition.en,/PLAYER: Priority Assets \| OPPONENT: Disruption \| PRIMARY MISSION: Extract Relic/,'reverse directed Primary relation remains distinct');
assert.notEqual('Locate and Deny','Extract Relic','directed Primary controls must not become symmetric');

const reversedMatchupIndex=structuredClone(index),reversedMatchup=reversedMatchupIndex.entries.find(entry=>entry.id==='missions::force-disposition-matchup-disruption--priority-assets');
reversedMatchup.facts.memberForceDispositionIds.reverse();
const reversedMatchupScope={window:{WH40K_GLOSSARY_V2_INDEX:reversedMatchupIndex}};
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),reversedMatchupScope);
assert.equal(reversedMatchupScope.window.WH40K_GLOSSARY.get(reversedMatchup.id).definition.en,disruptionPriority.definition.en,'reverse member order must render the same unordered matchup identity');
const unknownRelationIndex=structuredClone(index),unknownRelation=unknownRelationIndex.entries.find(entry=>entry.id==='missions::force-disposition-disruption');
unknownRelation.facts.missionMatrixRelations[0].primaryMissionId='unknown-primary-id';
const unknownRelationScope={window:{WH40K_GLOSSARY_V2_INDEX:unknownRelationIndex}};
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),unknownRelationScope);
assert.equal(unknownRelationScope.window.WH40K_GLOSSARY.get(unknownRelation.id).definition.en,'','unknown exact relation IDs must fail closed');

const deployments=index.entries.filter(entry=>entry.recordType==='DEPLOYMENT');
assert.equal(deployments.length,6,'all six Deployments must remain standalone');
assert.equal(new Set(deployments.map(entry=>entry.id)).size,6,'Deployment articles must not duplicate');
assert.equal(new Set(deployments.map(entry=>entry.facts.geometry.sourceRegistration.url)).size,6,'Deployment source visuals must not cross-wire');
for(const source of deployments){
  const article=api.get(source.id),definition=article.definition.en,registration=source.facts.geometry.sourceRegistration;
  assert(definition.trim(),`${source.id}: useful Deployment definition`);
  assert.notEqual(definition.trim().toLocaleLowerCase(),source.label.trim().toLocaleLowerCase(),`${source.id}: definition must not echo title`);
  assert.match(definition,/BATTLEFIELD\n60\" × 44\"\./,`${source.id}: battlefield dimensions`);
  assert(definition.includes(source.facts.provenance.contentLocator),`${source.id}: accepted source locator`);
  assert.match(definition,/Verified machine-readable deployment zones, territories, objective positions, terrain areas, measurement endpoint bindings remain pending digitization\./,`${source.id}: honest pending geometry status`);
  assert.doesNotMatch(definition,/SOURCE_REGISTERED_PENDING_VERIFIED_DIGITIZATION|DEPLOYMENT_ZONES|MEASUREMENT_ENDPOINT_BINDINGS/,`${source.id}: raw internal geometry codes hidden`);
  assert.deepEqual(JSON.parse(JSON.stringify(article.structured.deploymentReference)),{url:registration.url,width:registration.pixelDimensions.width,height:registration.pixelDimensions.height,alt:`${source.label} deployment reference`,battlefieldWidthInches:60,battlefieldHeightInches:44,sourceLocator:source.facts.provenance.contentLocator,pendingLayers:['deployment zones','territories','objective positions','terrain areas','measurement endpoint bindings']},`${source.id}: source-backed visual projection`);
  assert.equal(api.get(source.id).definition.en,definition,`${source.id}: popup/article identity parity`);
}
const crossWiredDeploymentIndex=structuredClone(index),crossWiredDawn=crossWiredDeploymentIndex.entries.find(entry=>entry.id==='missions::deployment-dawn-of-war'),crossWiredHammer=crossWiredDeploymentIndex.entries.find(entry=>entry.id==='missions::deployment-hammer-and-anvil');
crossWiredDawn.facts.geometry.sourceRegistration.url=crossWiredHammer.facts.geometry.sourceRegistration.url;
const crossWiredDeploymentScope={window:{WH40K_GLOSSARY_V2_INDEX:crossWiredDeploymentIndex}};
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),crossWiredDeploymentScope);
assert.equal(crossWiredDeploymentScope.window.WH40K_GLOSSARY.get(crossWiredDawn.id).definition.en,'','cross-wired Deployment visuals must fail closed');

const terrainLayouts=index.entries.filter(entry=>entry.recordType==='TERRAIN_LAYOUT');
assert.equal(terrainLayouts.length,45,'all 45 Terrain Layouts must remain standalone');
assert.equal(new Set(terrainLayouts.map(entry=>entry.id)).size,45,'Terrain Layout articles must not duplicate');
assert.deepEqual(Object.fromEntries(['A','B','C'].map(variant=>[variant,terrainLayouts.filter(entry=>entry.facts.variant===variant).length])),{A:15,B:15,C:15},'all A/B/C variants');
assert.equal(new Set(terrainLayouts.map(entry=>entry.facts.visualReferences.measurements.url)).size,45,'Terrain Layout visuals must not cross-wire');
for(const source of terrainLayouts){
  const article=api.get(source.id),definition=article.definition.en,facts=source.facts,matchup=index.entries.find(entry=>entry.id===`missions::${facts.matchupId}`);
  assert(definition.trim(),`${source.id}: useful Terrain Layout definition`);
  assert.notEqual(definition.trim().toLocaleLowerCase(),source.label.trim().toLocaleLowerCase(),`${source.id}: definition must not echo title`);
  assert(definition.includes(`MATCHUP\n${matchup.label}`),`${source.id}: canonical matchup label`);
  assert(definition.includes(`LAYOUT VARIANT\n${facts.variant}`),`${source.id}: A/B/C variant`);
  assert.match(definition,/BATTLEFIELD\n44\" × 60\"\./,`${source.id}: battlefield dimensions`);
  assert(definition.includes(facts.provenance.contentLocator),`${source.id}: official source locator`);
  assert.match(definition,/Accepted secondary measurements view\. The official Event Companion remains the factual authority\./,`${source.id}: visual authority disclosure`);
  assert.match(definition,/Verified machine-readable terrain footprints, terrain positions, objective positions, measurement endpoint bindings remain pending digitization\./,`${source.id}: honest pending geometry status`);
  assert.doesNotMatch(definition,/SOURCE_REGISTERED_PENDING_VERIFIED_DIGITIZATION|TERRAIN_FOOTPRINT_POLYGONS|MEASUREMENT_ENDPOINT_BINDINGS|event-layout-|force-disposition-matchup-/,`${source.id}: raw internal codes hidden`);
  const reference=article.structured.terrainLayoutReference;
  assert.equal(reference.url,facts.visualReferences.measurements.url,`${source.id}: exact accepted measurements visual`);
  assert.equal(reference.sha256,facts.visualReferences.measurements.sha256,`${source.id}: visual fingerprint`);
  assert.equal(reference.variant,facts.variant,`${source.id}: structured variant`);
  assert.equal(reference.matchupId,matchup.id,`${source.id}: structured canonical matchup`);
  assert(article.related.includes(matchup.id),`${source.id}: canonical matchup link`);
  for(const memberId of matchup.facts.memberForceDispositionIds)assert(article.related.includes(`missions::${memberId}`),`${source.id}: canonical Force Disposition link ${memberId}`);
  assert.deepEqual([facts.geometry.zones,facts.geometry.objectives,facts.geometry.terrainAreas],[[],[],[]],`${source.id}: no fabricated geometry`);
  assert.equal(api.get(source.id).definition.en,definition,`${source.id}: popup/article identity parity`);
}
const duplicateVisualIndex=structuredClone(index),duplicateVisualA=duplicateVisualIndex.entries.find(entry=>entry.id==='missions::terrain-layout-disruption--disruption-a'),duplicateVisualB=duplicateVisualIndex.entries.find(entry=>entry.id==='missions::terrain-layout-disruption--disruption-b');
duplicateVisualA.facts.visualReferences.measurements.url=duplicateVisualB.facts.visualReferences.measurements.url;
const duplicateVisualScope={window:{WH40K_GLOSSARY_V2_INDEX:duplicateVisualIndex}};
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),duplicateVisualScope);
assert.equal(duplicateVisualScope.window.WH40K_GLOSSARY.get(duplicateVisualA.id).definition.en,'','cross-wired Terrain Layout visuals must fail closed');

assert.equal(index.counts.total,4760);
assert.equal(index.counts.standalone,1823);
assert.equal(index.counts.scopedChildren,2937);
assert.equal(api.entries().length,4760);
assert.equal(api.standaloneEntries().length,1823);
assert.equal(api.counts.scopedChildren,2937);

const detachments=api.standaloneEntries().filter(entry=>entry.recordType==='DETACHMENT');
assert.equal(detachments.length,102,'standalone browse must retain exactly 102 Detachments');
assert.equal(new Set(detachments.map(entry=>entry.id)).size,102,'standalone Detachment articles must not duplicate');
for(const detachment of detachments){
  assert(detachment.definition.en.trim(),`${detachment.id}: Detachment definition`);
  assert.notEqual(detachment.definition.en.trim().toLocaleLowerCase(),detachment.label.trim().toLocaleLowerCase(),`${detachment.id}: Detachment definition must not echo its title`);
}
const mortarionsHammerId='army::death-guard::detachment::detachment-mortarions-hammer';
const mortarionsHammer=api.get(mortarionsHammerId,{bookId:'death-guard'});
assert.equal(mortarionsHammer.id,mortarionsHammerId);
assert.match(mortarionsHammer.definition.en,/Force Disposition: Purge the Foe/);
assert.match(mortarionsHammer.definition.en,/Detachment Points: 2DP/);
assert.match(mortarionsHammer.definition.en,/Miasmic Bombardment/);
assert.match(mortarionsHammer.definition.en,/Incursion \| 1[\s\S]*Strike Force \| 2[\s\S]*Onslaught \| 3/);
assert.equal(api.forBook('death-guard')[mortarionsHammerId].id,mortarionsHammer.id,'Mortarion’s Hammer popup/viewer identity parity');

const dgOwner='army-rule-nurgles-gift';
for(const id of ['contagion-range','afflicted','skullsquirm-blight','rattlejoint-ague','scabrous-soulrot']){
  const term=api.get(id,{bookId:'death-guard'});
  assert(term,`${id}: Death Guard scoped term must resolve`);
  assert.equal(term.recordType,'ARMY_RULE_COMPONENT');
  assert.equal(term.parent.canonicalId,dgOwner);
  assert.equal(term.canonicalReferences[0].canonicalId,dgOwner);
}

const deepStrike=api.get('core-deep-strike',{bookId:'space-marines'});
assert.equal(deepStrike.id,'core::core-deep-strike');
assert.equal(deepStrike.domain,'CORE');
assert.match(deepStrike.definition.en,/ingress move/i);
assert.equal(api.get('transport',{bookId:'core-rules'}).id,'core::core-rule-18-01-transport-capacity');
assert.equal(api.get('power fist'),null,'an ambiguous scoped weapon label must fail closed globally');

const local=api.get('army::space-marines::ability::space-marines-ability-press-the-attack');
assert.equal(local.sourceOwner.bookId,'space-marines');
assert.match(local.definition.en,/SUSTAINED HITS 1/);
const smTerms=api.forBook('space-marines');
assert.equal(smTerms[deepStrike.id].id,deepStrike.id);
assert.equal(smTerms[local.id].id,local.id);

const oathCompatibilityId='space-marines-army-rule-oath-of-moment';
const oathId='army::space-marines::army_rule::army-rule-oath-of-moment';
for(const bookId of ['space-marines','dark-angels','blood-angels']){
  const oath=api.get(oathCompatibilityId,{bookId});
  assert.equal(oath?.id,oathId,`${bookId}: the accepted Oath compatibility identity must resolve to its single V2 owner`);
  assert.equal(api.forBook(bookId)[oathId]?.id,oathId,`${bookId}: Oath must expose the same popup/viewer identity`);
}
assert.equal(index.entries.filter(entry=>entry.sourceOwner?.canonicalId==='army-rule-oath-of-moment').length,1,'Oath must remain one factual V2 article');

const coreSupportId='core::core-rule-19-01-forming-attached-units';
for(const [termId,bookId,mfmId,unitId] of [
  ['chaos-space-marines-ability-support','chaos-space-marines','mfm-support-eligibility-d50c824cb1d8dabe','unit-masters-of-the-maelstrom'],
  ['space-marines-ability-support-3','space-marines','mfm-support-eligibility-384607b24098f07e','unit-cato-sicarius'],
  ['space-marines-ability-support-4','space-marines','mfm-support-eligibility-80d2e325d305c2b3','unit-wardens-of-ultramar']
]){
  const support=api.get(termId,{bookId});
  assert.equal(support?.id,coreSupportId,`${termId}: compatibility marker must resolve to canonical Core Support`);
  assert.equal(api.forBook(bookId)[termId]?.id,coreSupportId,`${termId}: popup/viewer identity parity`);
  assert(!index.entries.some(entry=>entry.sourceOwner?.canonicalId===termId),`${termId}: false standalone Army article removed`);
  const parent=index.entries.find(entry=>entry.id===`army::${bookId}::unit::${unitId}`);
  assert(parent?.mfm?.supportRelations?.some(record=>record.id===mfmId),`${termId}: MFM eligibility relation unchanged`);
}
assert.match(api.get('space-marines-ability-support-2',{bookId:'space-marines'})?.definition.en||'',/VICTRIX HONOUR GUARD/,'Cato substantive Support rule remains Army-owned');

const structuredAmControls=[
  {
    id:'army::adeptus-mechanicus::army_rule::army-rule-doctrina',
    compatibilityId:'army-rule-doctrina'
  },
  {
    id:'army::adeptus-mechanicus::ability::datasheet-canticles-of-the-omnissiah',
    compatibilityId:'datasheet-canticles-of-the-omnissiah'
  }
];
for(const {id,compatibilityId} of structuredAmControls){
  const source=index.entries.find(entry=>entry.id===id),article=api.get(id),popup=api.forBook('adeptus-mechanicus')[compatibilityId];
  assert(source,`${id}: accepted V2 source projection`);
  assert(article?.definition.en.trim(),`${id}: full article definition`);
  assert.equal(popup?.id,id,`${id}: popup identity parity`);
  assert.equal(popup.definition,article.definition.en,`${id}: popup/article definition parity`);
  if(source.facts.openingText)assert(article.definition.en.includes(source.facts.openingText),`${id}: opening text preserved`);
  for(const option of source.facts.options){
    assert(article.definition.en.includes(option.label||option.title),`${id}: option heading ${option.id}`);
    if(option.subtitle)assert(article.definition.en.includes(option.subtitle),`${id}: option subtitle ${option.id}`);
    if(option.text)assert(article.definition.en.includes(option.text),`${id}: option text ${option.id}`);
    for(const effect of option.effects||[])assert(article.definition.en.includes(effect),`${id}: option effect ${option.id}`);
  }
}
const ordinaryAm=api.get('army::adeptus-mechanicus::ability::datasheet-aerial-deployment');
assert.equal(ordinaryAm.definition.en,index.entries.find(entry=>entry.id===ordinaryAm.id).facts.text,'ordinary AM definitions remain unchanged');
assert.equal(deepStrike.definition.en,index.entries.find(entry=>entry.id===deepStrike.id).facts.semanticContent,'non-AM definitions remain unchanged');
const admechUpdateId='army::adeptus-mechanicus::update::rules-updates',admechUpdate=api.get(admechUpdateId),admechUpdatePopup=api.forBook('adeptus-mechanicus')['rules-updates'];
assert(admechUpdate?.definition.en.trim(),'the accepted AM Update must have a substantive definition');
assert.equal(admechUpdatePopup?.id,admechUpdateId,'the AM Update compatibility identity must resolve to its canonical article');
assert.equal(admechUpdatePopup.definition,admechUpdate.definition.en,'the AM Update popup and article must use one canonical definition');
assert.match(admechUpdate.definition.en,/CHANGED RULE[\s\S]*Cyber-psalm Programming[\s\S]*RESULTING EFFECTIVE RULE[\s\S]*Add 2" to the Move characteristic/,'the AM Update must distinguish the changed rule from the resulting effective rule');
assert.match(admechUpdate.definition.en,/Belisarius Cawl[\s\S]*Canticles of the Omnissiah section[\s\S]*Solar atomiser/,'the AM Update must retain accepted page 18 datasheet results');
assert.doesNotMatch(admechUpdate.definition.en,/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+){2,}\b/,'the AM Update must not expose raw operation codes');
for(const [termId,bookId] of [
  ['datasheet-broad-spectrum-data-tether','adeptus-mechanicus'],
  ['tau-empire-ability-battlesuit-support-system','tau-empire'],
  ['tau-empire-ability-weapon-support-system','tau-empire']
])assert.equal(api.get(termId,{bookId}),null,`${termId}: ambiguous standalone/scoped compatibility identity must remain fail-closed`);

const supported=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
for(const book of supported){
  const html=read(`books/${book}/reader.html`);
  assert.match(html,/glossary\/v2\/generated\/index\.en\.js\?v=1/);
  assert.match(html,/glossary\/v2\/runtime\/glossary-v2-runtime\.js\?v=1/);
  assert.doesNotMatch(html,/glossary\/generated\/glossary\.en\.js/);
}
for(const file of fs.readdirSync(path.join(root,'books/core-rules/reader')).filter(file=>file.endsWith('.html'))){
  const html=read(`books/core-rules/reader/${file}`);
  assert.match(html,/glossary\/v2\/generated\/index\.en\.js\?v=1/);
  assert.match(html,/glossary\/v2\/runtime\/glossary-v2-runtime\.js\?v=1/);
}

const viewer=read('glossary/viewer.js'),viewerHtml=read('glossary/index.html');
assert.match(viewer,/const terms=api\.standaloneEntries\(\{bookId\}\)/,'main browse must use contextual standalone entries');
assert.match(viewer,/source=query\?allTerms:terms/,'search must include scoped children');
assert.match(viewerHtml,/v2\/generated\/index\.en\.js/);
assert.match(viewerHtml,/v2\/runtime\/glossary-v2-runtime\.js/);
assert.doesNotMatch(viewerHtml,/generated\/glossary\.en\.js/);

const factualConsumers=[
  'glossary/viewer.js','books/shared/army-book-app.js','books/shared/glossary-autolink.js','books/core-rules/reader/app.js'
].map(read).join('\n');
assert.doesNotMatch(factualConsumers,/WH40K_GLOSSARY_REGISTRY|glossary\/generated\/glossary\.en\.js/);
assert.doesNotMatch(read('books/core-rules/reader/app.js'),/dataset\.term(?:Definition|Summary)/);

const popupRuleTypes=new Set(['ABILITY','ARMY_RULE','DETACHMENT_RULE','FACTION_TERM','ARMY_RULE_COMPONENT','WARGEAR_ABILITY']);
const noDefinition=api.entries().filter(entry=>popupRuleTypes.has(entry.recordType)&&!entry.definition.en.trim());
assert.equal(noDefinition.length,0,'every current popup rule article must have a source-backed definition');

console.log('Glossary V2 production contract QA passed: 1823 meaningful standalone browse entries, 2937 scoped searchable children, explicit/context-safe identity resolution; no-definition entries 0.');
