(function(root){
  'use strict';
  const keyword=value=>{
    if(!root.WHRuleFacts)throw new Error('WHRuleFacts is required by roster validation');
    return root.WHRuleFacts.normalizeKeyword(value);
  };
  const normalize=value=>String(value||'').toLowerCase().replace(/\s*\[legends\]\s*$/i,'').replace(/[^a-z0-9]+/g,' ').trim();
  const record=value=>Boolean(value&&typeof value==='object'&&!Array.isArray(value));
  const own=(value,key)=>record(value)&&Object.prototype.hasOwnProperty.call(value,key)?value[key]:undefined;
  const safeInteger=(value,minimum=0)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=minimum;
  const safeAdd=(left,right)=>{if(!safeInteger(left)||!safeInteger(right))return null;const value=left+right;return Number.isSafeInteger(value)?value:null;};
  const catalogFor=faction=>own(root.WH_POINTS_CATALOG,faction);
  const canonicalUnitId=unit=>typeof unit?.canonicalUnitId==='string'?unit.canonicalUnitId:typeof unit?.canonicalDatasheetId==='string'?unit.canonicalDatasheetId:'';
  const unitsByCanonicalId=catalog=>new Map(Object.values(own(catalog,'units')||{}).filter(record).map(unit=>[unit.unitId||unit.id,unit]).filter(([id])=>typeof id==='string'&&id));
  const unitDefinition=(catalog,unit)=>{
    const explicitId=canonicalUnitId(unit);
    return explicitId?unitsByCanonicalId(catalog).get(explicitId):own(own(catalog,'units'),normalize(unit?.name));
  };
  const validAssignment=value=>value==null||record(value)&&(own(value,'maxOwners')===undefined||safeInteger(own(value,'maxOwners'),1))&&(own(value,'enhancementChoices')===undefined||safeInteger(own(value,'enhancementChoices'),1));
  const parseTierLabel=label=>{
    const text=String(label||'').trim(),lower=text.toLowerCase(),bounds={};
    const modelRange=lower.match(/(\d+)\s*(?:-|–|—|to)\s*(\d+)\s+models?/),modelExact=lower.match(/(\d+)\s+models?/);
    if(modelRange){bounds.minModels=Number(modelRange[1]);bounds.maxModels=Number(modelRange[2]);}
    else if(modelExact){bounds.minModels=Number(modelExact[1]);bounds.maxModels=Number(modelExact[1]);}
    const schedule=lower.replace(/^your\s+/,'').replace(/\s+costs?$/,'').replace(/\bunits\b/g,'unit').split(/[·:]/,1)[0].trim();
    const copyRange=schedule.match(/^(\d+)(?:st|nd|rd|th)?\s*(?:-|–|—|to)\s*(\d+)(?:st|nd|rd|th)?(?:\s+unit(?:\s+cost)?)?$/),copyPlus=schedule.match(/^(\d+)(?:st|nd|rd|th)?\s*\+(?:\s+unit(?:\s+cost)?)?$/),copyExact=schedule.match(/^(\d+)(?:st|nd|rd|th)?(?:\s+unit(?:\s+cost)?)$/);
    if(copyRange){bounds.minCopies=Number(copyRange[1]);bounds.maxCopies=Number(copyRange[2]);}
    else if(copyPlus)bounds.minCopies=Number(copyPlus[1]);
    else if(copyExact){bounds.minCopies=Number(copyExact[1]);bounds.maxCopies=Number(copyExact[1]);}
    return bounds;
  };
  const boundsKey=bounds=>`${bounds.minCopies??'*'}-${bounds.maxCopies??'*'}|${bounds.minModels??'*'}-${bounds.maxModels??'*'}`;
  const normalizeTier=row=>{
    if(!record(row)||typeof row.label!=='string'||!safeInteger(row.value))throw new Error('Point tier requires a label and non-negative integer value');
    const parsed=parseTierLabel(row.label),fields=['minModels','maxModels','minCopies','maxCopies'];
    for(const field of fields)if(own(row,field)!==undefined&&own(row,field)!==parsed[field])throw new Error(`Point tier ${JSON.stringify(row.label)} ${field} disagrees with its label`);
    if(!safeInteger(parsed.minModels,1)||!safeInteger(parsed.maxModels,parsed.minModels))throw new Error(`Point tier ${JSON.stringify(row.label)} has no supported model bounds`);
    if(parsed.minCopies!==undefined&&!safeInteger(parsed.minCopies,1)||parsed.maxCopies!==undefined&&!safeInteger(parsed.maxCopies,parsed.minCopies??1))throw new Error(`Point tier ${JSON.stringify(row.label)} has invalid copy bounds`);
    return {...row,...parsed};
  };
  const structuredTier=row=>record(row)&&safeInteger(own(row,'minModels'),1)&&safeInteger(own(row,'maxModels'),own(row,'minModels'))&&(own(row,'minCopies')===undefined||safeInteger(own(row,'minCopies'),1))&&(own(row,'maxCopies')===undefined||safeInteger(own(row,'maxCopies'),own(row,'minCopies')??1));
  const structuredTierMatches=(row,quantity,index)=>structuredTier(row)&&quantity>=row.minModels&&quantity<=row.maxModels&&index>=Number(row.minCopies??index)&&index<=Number(row.maxCopies??index);
  const labelTierMatches=(row,quantity,index)=>{const bounds=parseTierLabel(row?.label);return safeInteger(bounds.minModels,1)&&quantity>=bounds.minModels&&quantity<=bounds.maxModels&&index>=Number(bounds.minCopies??index)&&index<=Number(bounds.maxCopies??index);};
  const tierMatches=(row,quantity,index)=>['minModels','maxModels','minCopies','maxCopies'].some(field=>own(row,field)!==undefined)?structuredTierMatches(row,quantity,index):labelTierMatches(row,quantity,index);
  const tiersOverlap=(left,right)=>left.minModels<=right.maxModels&&right.minModels<=left.maxModels&&Number(left.minCopies??1)<=Number(right.maxCopies??Infinity)&&Number(right.minCopies??1)<=Number(left.maxCopies??Infinity);
  const validateStructuredTiers=rows=>{
    if(!Array.isArray(rows)||rows.length<2)throw new Error('Multi-tier point schedule requires at least two rows');
    for(const row of rows){
      if(!structuredTier(row))throw new Error(`Point tier ${JSON.stringify(row?.label)} is missing structured bounds`);
      const parsed=parseTierLabel(row.label);
      for(const field of ['minModels','maxModels','minCopies','maxCopies'])if(own(row,field)!==parsed[field])throw new Error(`Point tier ${JSON.stringify(row.label)} ${field} disagrees with its label`);
    }
    for(let left=0;left<rows.length;left++)for(let right=left+1;right<rows.length;right++)if(tiersOverlap(rows[left],rows[right]))throw new Error(`Point tiers ${JSON.stringify(rows[left].label)} and ${JSON.stringify(rows[right].label)} overlap`);
    return rows;
  };
  const normalizeTiers=rows=>validateStructuredTiers(rows.map(normalizeTier));
  const tierContract=Object.freeze({parseTierLabel,boundsKey,normalizeTier,normalizeTiers,validateStructuredTiers,structuredTier,structuredTierMatches,labelTierMatches,tierMatches});
  const physicalModelCount=unit=>{
    const models=unit?.models;
    if(models==null||(Array.isArray(models)&&models.length===0)){
      const quantity=unit?.quantity;
      return safeInteger(quantity,1)?quantity:null;
    }
    if(!Array.isArray(models))return null;
    let total=0;
    for(const model of models){
      const quantity=model?.quantity;
      if(!safeInteger(quantity,1))return null;
      total=safeAdd(total,quantity);
      if(total===null)return null;
    }
    return total||null;
  };
  const loadouts=unit=>{
    if(unit.models!=null&&!Array.isArray(unit.models))return null;
    if(!unit.models?.length){
      if(unit.wargear!=null&&typeof unit.wargear!=='string')return null;
      return unit.wargear?[{quantity:unit.quantity,text:unit.wargear}]:[];
    }
    const rows=[];
    for(const model of unit.models){
      if(!record(model)||!safeInteger(model.quantity,1)||model.loadouts!=null&&!Array.isArray(model.loadouts)||model.wargear!=null&&typeof model.wargear!=='string')return null;
      if(model.loadouts?.length){
        for(const item of model.loadouts){
          if(!record(item)||!safeInteger(item.quantity,1)||typeof item.wargear!=='string')return null;
          rows.push({quantity:item.quantity,text:item.wargear});
        }
      }else if(model.wargear)rows.push({quantity:model.quantity,text:model.wargear});
    }
    return rows;
  };
  const gearSelections=text=>{
    const selections=[];
    let depth=0,start=0;
    for(let index=0;index<text.length;index++){
      if(text[index]==='(')depth++;
      else if(text[index]===')')depth=Math.max(0,depth-1);
      else if(text[index]===','&&depth===0){selections.push(text.slice(start,index).trim());start=index+1;}
    }
    selections.push(text.slice(start).trim());
    return selections.filter(Boolean);
  };
  const gearCount=(rows,name)=>{
    let total=0;
    for(const row of rows)for(const selection of gearSelections(row.text)){
      const prefix=selection.match(/^\s*(\d+)\s*[x\u00d7]\s*/i);
      const text=prefix?selection.slice(prefix[0].length):selection;
      if(!normalize(text).includes(normalize(name)))continue;
      const quantity=prefix?Number(prefix[1]):1;
      if(!safeInteger(quantity))return null;
      const count=row.quantity*quantity;
      total=safeAdd(total,count);
      if(total===null)return null;
    }
    return total;
  };
  const enhancementName=value=>{
    const name=record(value)?own(value,'name'):value;
    return typeof name==='string'?name.replace(/\s+[-–—]\s+\d+\s*pts?\s*$/i,'').trim():'';
  };
  const list=value=>Array.isArray(value)?value:[];
  const keywords=unit=>new Set((unit?.keywords||[]).map(keyword));
  const grantedKeywords=(faction,detachment,unit)=>faction==='death guard'&&normalize(detachment)==='contagion engines'&&['unit-foetid-bloat-drone','unit-foetid-bloat-drone-with-heavy-blight-launcher','unit-helbrute','unit-myphitic-blight-hauler'].includes(unit?.unitId)?['CONTAGION ENGINE']:[];
  const ownerMatches=(enhancement,unit,faction,additionalKeywords=[],leadingUnitIds=[])=>{
    if(!enhancement.owner||!unit)return false;
    const selector=enhancement.owner.selector||{},unitKeywords=keywords(unit),abilities=new Set([...(unit.abilities||[]),...(unit.termIds||[])].map(normalize));
    [...grantedKeywords(faction,enhancement.detachment,unit),...additionalKeywords].forEach(value=>unitKeywords.add(keyword(value)));
    const matches=selector=>{
      if(selector.alternatives?.length)return selector.alternatives.some(matches);
      if((selector.unitIds||[]).length&&!selector.unitIds.includes(unit.unitId))return false;
      if((selector.allKeywords||[]).some(value=>!unitKeywords.has(keyword(value))))return false;
      if((selector.anyKeywords||[]).length&&!selector.anyKeywords.some(value=>unitKeywords.has(keyword(value))))return false;
      if((selector.noneKeywords||[]).some(value=>unitKeywords.has(keyword(value))))return false;
      if((selector.allAbilities||[]).some(value=>!abilities.has(normalize(value))))return false;
      if((selector.leadingUnitIds||[]).length&&!selector.leadingUnitIds.some(value=>leadingUnitIds.includes(value)))return false;
      return true;
    };
    return matches(selector);
  };

function assessEnhancements(roster, faction, catalog=catalogFor(faction), options={}) {
  const enhancements = [], enhancementWarnings = [], unresolved = [];
  const assignments = (roster.enhancements || []).map((input, inputIndex) => ({
    inputIndex, input, catalog: null, assessment: null,
    status: catalog ? 'unresolved' : 'unavailable'
  }));
  if (!catalog) return {
    available: false, assignments, enhancements, enhancementWarnings,
    unresolved: ['Army Book point data is unavailable.'],
    enhancementChoices: 0, enhancementAssignments: 0
  };
  const selectedDetachmentValues=(roster.detachments || [{name: roster.detachment, label: roster.detachment}]).flatMap(item => record(item) ? [item.id, item.name, item.label] : [item]).map(normalize).filter(Boolean),selectedDetachments=new Set(selectedDetachmentValues);
  for(const value of selectedDetachmentValues){const canonical=own(own(catalog,'detachments'),value);if(canonical?.id)selectedDetachments.add(normalize(canonical.id));}
  for (const assignment of assignments) {
    const raw = assignment.input, name = enhancementName(raw);
    if (!name) { assignment.status = 'empty'; continue; }
    const records=own(catalog,'enhancements'),entry=own(records,normalize(name)),explicitId=normalize(raw.ruleId||raw.id),identities=item=>[item.id,item.canonicalEnhancementId,item.ruleId,item.sourceId,item.legacyKey].map(normalize).filter(Boolean);let candidates=explicitId?Object.values(records||{}).flat().filter(record).filter(item=>identities(item).includes(explicitId)):(Array.isArray(entry)?entry:[entry]).filter(record);if(explicitId&&!candidates.length){const aliasId=explicitId.replace(/^enhancement /,'');candidates=Object.values(records||{}).flat().filter(record).filter(item=>identities(item).some(id=>id.replace(/^enhancement /,'')===aliasId));}candidates=[...new Map(candidates.map(item=>[JSON.stringify(item),item])).values()];const selected=candidates.filter(item=>{const scope=item.detachmentId||item.canonicalDetachmentId||item.detachment;return !scope||selectedDetachments.has(normalize(scope));});
    const enhancement = selected.length === 1 ? selected[0] : candidates.length === 1 ? candidates[0] : null;
    if (!record(enhancement)||!safeInteger(own(enhancement,'value'))||typeof own(enhancement,'title')!=='string'||own(enhancement,'id')!=null&&typeof own(enhancement,'id')!=='string'||!validAssignment(own(enhancement,'assignment'))) { unresolved.push(`Enhancement Detachment: ${name}`); continue; }
    const rosterUnit = (roster.units || []).find(unit => unit.id === raw.ownerUnitId), owner = unitDefinition(catalog,rosterUnit);
    const sourceCoverage=enhancement.sourceLimited||!enhancement.owner?.selector?'sourceLimited':'verified';
    const sourceMessage=sourceCoverage==='sourceLimited'?'Enhancement source/contract coverage is limited':'';
    let ownerEligibility = 'valid', ownerMessage = '';
    if (raw.ownerStatus !== 'resolved' || !rosterUnit || !owner) { ownerEligibility = 'invalid'; ownerMessage = 'Invalid Enhancement owner'; }
    else if ((enhancement.detachmentId||enhancement.canonicalDetachmentId||enhancement.detachment) && !selectedDetachments.has(normalize(enhancement.detachmentId||enhancement.canonicalDetachmentId||enhancement.detachment))) { ownerEligibility = 'invalid'; ownerMessage = 'Enhancement is not available in the selected Detachment'; }
    else if (!enhancement.owner?.selector) { ownerEligibility = 'unresolved'; ownerMessage = 'Enhancement owner contract is unavailable'; }
    else if (!ownerMatches(enhancement, owner, faction, list(options.keywordOverrides?.[rosterUnit.id]), list(options.leadingUnitIdsByInstance?.[rosterUnit.id]))) { ownerEligibility = 'invalid'; ownerMessage = keywords(owner).has('EPIC HERO') ? 'Epic Hero cannot receive this Enhancement' : 'Invalid Enhancement owner'; }
    const result = {...raw, id: enhancement.id, name: enhancement.title, currentCost: Number(enhancement.value), text: enhancement.text || '', effect: enhancement.effect || '', tags: enhancement.tags || [], assignment: enhancement.assignment || null, ownerEligibility, ownerMessage, sourceCoverage, sourceMessage};
    assignment.catalog = enhancement;
    assignment.assessment = result;
    assignment.status = 'assessed';
    enhancements.push(result);
    if (ownerMessage) enhancementWarnings.push(`${enhancement.title}: ${ownerMessage}.`);
    if (sourceMessage) enhancementWarnings.push(`${enhancement.title}: ${sourceMessage}.`);
  }
  for (const id of new Set(enhancements.map(item => item.id))) {
    const group = enhancements.filter(item => item.id === id), configuredLimit = group[0].assignment?.maxOwners, limit = configuredLimit===undefined?1:configuredLimit, seen = new Set();
    if(!safeInteger(limit,1)){
      group.forEach(item=>{item.ownerEligibility='invalid';item.ownerMessage='Invalid Enhancement assignment limit';});
      enhancementWarnings.push(`${group[0].name}: Invalid Enhancement assignment limit.`);
      continue;
    }
    group.forEach((item, index) => {
      if (item.ownerUnitId && seen.has(item.ownerUnitId)) {
        item.ownerEligibility = 'invalid'; item.ownerMessage = 'Enhancement is assigned more than once to the same unit';
        enhancementWarnings.push(`${item.name}: ${item.ownerMessage}.`);
      }
      if (item.ownerUnitId) seen.add(item.ownerUnitId);
      if (index >= limit) {
        item.ownerEligibility = 'invalid'; item.ownerMessage = 'Upgrade assignment limit exceeded';
        enhancementWarnings.push(`${item.name}: ${item.ownerMessage} (${group.length}/${limit}).`);
      }
    });
  }
  let enhancementChoices=0;
  for(const id of new Set(enhancements.map(item=>item.id))){
    const configured=enhancements.find(item=>item.id===id)?.assignment?.enhancementChoices,choices=configured===undefined?1:configured,next=safeInteger(choices,1)?safeAdd(enhancementChoices,choices):null;
    if(next===null){enhancementWarnings.push('Invalid Enhancement choice count.');continue;}
    enhancementChoices=next;
  }
  if (enhancementChoices > 3) enhancementWarnings.push(`Enhancement choice limit exceeded (${enhancementChoices}/3).`);
  return {available: true, assignments, enhancements, enhancementWarnings, unresolved, enhancementChoices, enhancementAssignments: enhancements.length};
}

  function check(roster,faction){
    const catalog=catalogFor(faction),unresolved=[],enhancementWarnings=[],detachmentWarnings=[],occurrences=new Map(),enhancements=[],unitTotals=[];let total=0;
    if(!record(catalog)||!record(own(catalog,'units'))||own(catalog,'enhancements')!==undefined&&!record(own(catalog,'enhancements'))||own(catalog,'detachments')!==undefined&&!record(own(catalog,'detachments')))return{total:null,unresolved:['Army Book point data is unavailable.'],enhancementWarnings,detachmentWarnings};
    if(!record(roster)||!Array.isArray(roster.units)||roster.enhancements!=null&&!Array.isArray(roster.enhancements)||roster.detachments!=null&&!Array.isArray(roster.detachments))return{total:null,unresolved:['Roster point structure is invalid.'],enhancementWarnings,detachmentWarnings};
    for(const unit of roster.units){
      const key=canonicalUnitId(unit)||normalize(unit?.name),definition=unitDefinition(catalog,unit),index=(occurrences.get(key)||0)+1;occurrences.set(key,index);
      if(!record(unit)||typeof unit.name!=='string'||!safeInteger(unit.quantity,1)||!record(definition)||!Array.isArray(own(definition,'points'))){unresolved.push(`Unit: ${unit?.name||'unknown'}`);continue;}
      const modelCount=physicalModelCount(unit);
      const selectedLoadouts=loadouts(unit),pointRows=definition.points;
      if(modelCount===null||selectedLoadouts===null||pointRows.some(row=>!record(row)||typeof own(row,'label')!=='string'||!safeInteger(own(row,'value')))){unresolved.push(`Unit size or repeat: ${unit.quantity}x ${unit.name}`);continue;}
      const prices=pointRows.filter(row=>tierMatches(row,modelCount,index));
      if(prices.length!==1){unresolved.push(`Unit size or repeat: ${unit.quantity}x ${unit.name}`);continue;}
      const wargear=own(definition,'wargear')===undefined?[]:definition.wargear;
      if(!Array.isArray(wargear)||wargear.some(item=>!record(item)||typeof (own(item,'label')??own(item,'name'))!=='string'||!safeInteger(own(item,'value')))){unresolved.push(`Unit points: ${unit.name}`);continue;}
      let unitTotal=prices[0].value;
      for(const item of wargear){
        const count=gearCount(selectedLoadouts,String(item.label||item.name).replace(/^per\s+/i,'')),cost=safeInteger(count)?count*item.value:NaN;
        unitTotal=Number.isSafeInteger(cost)?safeAdd(unitTotal,cost):null;
        if(unitTotal===null)break;
      }
      if(unitTotal===null){unresolved.push(`Unit points: ${unit.name}`);continue;}
      const nextTotal=safeAdd(total,unitTotal);
      if(nextTotal===null){unresolved.push(`Unit points: ${unit.name}`);continue;}
      total=nextTotal;unitTotals.push({instanceId:unit.id||null,canonicalUnitId:definition.unitId||definition.id||null,value:unitTotal});
    }
    const selectedDetachmentNames=[...new Set((roster.detachments||[{name:roster.detachment,label:roster.detachment}]).map(item=>normalize(item?.name||item?.label)).filter(Boolean))];
    const selectedDetachments=new Set(selectedDetachmentNames);
    const detachmentPointLimit=roster.pointsLimit===1000?2:roster.pointsLimit===2000?3:null;
    let detachmentPoints=0;
    for(const name of selectedDetachmentNames){
      const detachment=own(catalog.detachments,name),value=own(detachment,'detachmentPoints');
      if(!record(detachment)||!safeInteger(value)){detachmentWarnings.push(`Detachment Points unavailable: ${name}.`);continue;}
      detachmentPoints=safeAdd(detachmentPoints,value);
      if(detachmentPoints===null){detachmentPoints=0;detachmentWarnings.push(`Detachment Points unavailable: ${name}.`);break;}
    }
    if(detachmentPointLimit!==null&&detachmentPoints>detachmentPointLimit)detachmentWarnings.push(`Detachment Points limit exceeded (${detachmentPoints}/${detachmentPointLimit} DP).`);
    const assessment=assessEnhancements(roster,faction,catalog);
    unresolved.push(...assessment.unresolved);enhancementWarnings.push(...assessment.enhancementWarnings);enhancements.push(...assessment.enhancements);
    for(const row of assessment.assignments)if(row.catalog){const nextTotal=safeAdd(total,row.catalog.value);if(nextTotal===null){unresolved.push(`Enhancement points: ${row.catalog.title}`);break;}total=nextTotal;}
    const enhancementChoices=assessment.enhancementChoices;
    const declared=safeInteger(roster.declared)?roster.declared:0,unitLineTotal=safeInteger(roster.unitLineTotal??roster.calculated)?roster.unitLineTotal??roster.calculated:0;
    return{total,unitTotals,unresolved,enhancements,enhancementWarnings,enhancementChoices,enhancementAssignments:enhancements.length,detachmentPoints,detachmentPointLimit,detachmentWarnings,difference:total-declared,unitLineTotal,exportMatches:declared>0&&!unresolved.length&&declared===total};
  }
  root.WHRosterPoints=Object.freeze({check,normalize,assessEnhancements,tierContract});
}(typeof window==='undefined'?globalThis:window));
