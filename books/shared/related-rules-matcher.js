(function(root){
  'use strict';

  const supportedSubjects=new Set(['unit','model','objective']);
  const relationKeys=['canLead','canSupport','canBeLedBy','canBeSupportedBy'];
  const normalize=value=>String(value||'').replace(/\s+/g,' ').trim().toUpperCase();
  const set=values=>new Set([...(values||[])].map(normalize).filter(Boolean));
  const selectorOf=target=>({
    unitIds:target.units||[],
    allKeywords:target.all||[],
    anyKeywords:target.any||[],
    noneKeywords:target.none||[],
    alternatives:target.alternatives||[],
    attached:target.attached,
    minCharacters:target.minCharacters,
    warlord:target.warlord,
    allAbilities:target.allAbilities||[]
  });
  function canonical(value){
    if(value?.roles)return value;
    if(value?.owner)return {...value,roles:[{
      id:'owner',side:'friendly',subject:value.owner.subject,count:1,relationMode:'direct',selector:value.owner.selector||{}
    }]};
    return {v:1,roles:(value?.targets||[]).map((target,index)=>({
      id:`target-${index+1}`,side:target.side||'friendly',subject:target.subject||'unit',count:target.count||1,
      selector:selectorOf(target)
    })),conditions:value?.conditions||[]};
  }
  function keywordResult(selector,keywords,context){
    const conditionalKeywords=context.conditionalKeywords||set();
    const ids=selector.unitIds||[];
    const contextIds=context.unitIds||new Set([context.unitId].filter(Boolean));
    if(ids.length&&!ids.some(id=>contextIds.has(id)))return 'no-match';
    const possibleKeywords=context.possibleKeywords||keywords;
    if((selector.noneKeywords||[]).some(value=>possibleKeywords.has(normalize(value))))return 'no-match';
    let conditional=false;
    for(const value of selector.allKeywords||[]){
      const keyword=normalize(value);
      if(!keywords.has(keyword)){
        if(conditionalKeywords.has(keyword))conditional=true;
        else return 'no-match';
      }
    }
    if((selector.anyKeywords||[]).length&&!(selector.anyKeywords||[]).some(value=>keywords.has(normalize(value)))){
      if((selector.anyKeywords||[]).some(value=>conditionalKeywords.has(normalize(value))))conditional=true;
      else return 'no-match';
    }
    if((selector.allAbilities||[]).some(value=>!context.abilities?.has(normalize(value))))return 'no-match';
    if(selector.attached!=null){
      if(context.attachmentKnown===false){
        if(context.attached!=null&&Boolean(context.attached)!==selector.attached)return 'no-match';
        return 'conditional';
      }
      if(Boolean(context.attached)!==selector.attached)return 'no-match';
    }
    if(selector.minCharacters!=null){
      if(context.characterCount==null)return 'conditional';
      if(context.characterCount<selector.minCharacters){
        if((context.possibleCharacterCount||0)>=selector.minCharacters)return 'conditional';
        return 'no-match';
      }
    }
    if(selector.warlord!=null){
      if(context.warlord==null)return 'conditional';
      if(Boolean(context.warlord)!==selector.warlord)return 'no-match';
    }
    return conditional?'conditional':'match';
  }
  function relationContexts(context){
    if(context.attachmentKnown===true&&!context.formationRequired)return [context];
    const relations=relationKeys.flatMap(key=>context.relations?.[key]||[]);
    const contexts=context.formationRequired?[]:[{...context,attached:false,attachmentKnown:true}];
    for(const relation of relations){
      const removed=relation.removeKeywords||set(),combined=new Set([...(root.WHRuleFacts.keywordAccess.requiredKeywordField(context)||set()),...(root.WHRuleFacts.keywordAccess.requiredKeywordField(relation)||set())]);
      for(const keyword of removed)combined.delete(keyword);
      const conditionalKeywords=new Set(context.conditionalKeywords||set());
      for(const keyword of removed)conditionalKeywords.delete(keyword);
      const mandatory=relation.mandatory===true;
      contexts.push({...context,unitIds:new Set([context.unitId,relation.unitId].filter(Boolean)),keywords:combined,conditionalKeywords,possibleKeywords:combined,attached:true,attachmentKnown:true,characterCount:(context.characterCount||0)+(relation.characterCount||0),possibleCharacterCount:relation.maxCharacters??null});
    }
    return contexts;
  }
  function selectorResult(selector,context,subject,relationMode){
    const choices=selector.alternatives?.length?selector.alternatives:[selector];
    const candidates=subject==='model'
      ?(context.members||[{keywords:root.WHRuleFacts.keywordAccess.requiredKeywordField(context, "intrinsicKeywords")||root.WHRuleFacts.keywordAccess.requiredKeywordField(context)}]).map(member=>({...context,...member,unitId:member.unitId||context.unitId,keywords:root.WHRuleFacts.keywordAccess.requiredKeywordField(member)||root.WHRuleFacts.keywordAccess.requiredKeywordField(context, "intrinsicKeywords")}))
      :(relationMode==='direct'?[context]:(context.candidates||relationContexts(context)));
    const results=candidates.map(raw=>{
      const candidate={...context,...raw};
      let conditional=false;
      for(const choice of choices){
        const result=keywordResult(choice,root.WHRuleFacts.keywordAccess.requiredKeywordField(candidate)||candidate.effectiveKeywords||set(),candidate);
        if(result==='match')return 'match';
        if(result==='conditional')conditional=true;
      }
      return conditional?'conditional':'no-match';
    });
    if(results.every(result=>result==='match'))return 'match';
    if(results.every(result=>result==='no-match'))return 'no-match';
    return 'conditional';
  }
  function match(eligibility,context){
    const schema=canonical(eligibility),roles=schema.roles.filter(role=>role.side==='friendly'||role.side==='either');
    let conditional=false;
    for(const role of roles){
      const subject=role.subject||'unit';
      if(!supportedSubjects.has(subject))return {state:'no-match',matchedRoleIds:[],reasons:[`Unsupported subject: ${subject}`]};
      if(subject==='objective')continue;
      const result=selectorResult(role.selector||{},context,subject,role.relationMode);
      if(result==='match')return {state:schema.conditions?.length?'conditional':'match',matchedRoleIds:[role.id],reasons:schema.conditions||[]};
      if(result==='conditional')conditional=true;
    }
    return {state:conditional?'conditional':'no-match',matchedRoleIds:[],reasons:[]};
  }
  root.WHRelatedRules=Object.freeze({enabled:false,normalize,canonical,match,matches:(eligibility,context)=>match(eligibility,context).state!=='no-match'});
}(typeof window==='undefined'?globalThis:window));
