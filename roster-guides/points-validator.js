(function(root){
  'use strict';
  const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const copyMatches=(label,index)=>{
    const text=String(label||'').toLowerCase();
    if(!text.includes('unit'))return true;
    const range=text.match(/(\d+)(?:st|nd|rd|th)?\s*[-–—]\s*(\d+)(?:st|nd|rd|th)?\s+unit/);
    if(range)return index>=Number(range[1])&&index<=Number(range[2]);
    const plus=text.match(/(\d+)(?:st|nd|rd|th)?\+\s+unit/);
    if(plus)return index>=Number(plus[1]);
    const exact=text.match(/(\d+)(?:st|nd|rd|th)?\s+unit/);
    return !exact||index===Number(exact[1]);
  };
  const modelMatches=(label,quantity)=>{const match=String(label||'').match(/(\d+)\s+models?/i);return !match||Number(match[1])===quantity;};
  const loadouts=unit=>{
    if(!unit.models?.length)return unit.wargear?[{quantity:unit.quantity||1,text:unit.wargear}]:[];
    return unit.models.flatMap(model=>model.loadouts?.length?model.loadouts.map(item=>({quantity:item.quantity||1,text:item.wargear})):model.wargear?[{quantity:model.quantity||1,text:model.wargear}]:[]);
  };
  const gearCount=(unit,name)=>loadouts(unit).reduce((total,row)=>total+(normalize(row.text).includes(normalize(name))?row.quantity:0),0);
  const enhancementName=value=>typeof value==='object'?value.name:String(value||'').replace(/\s*\([^)]*\)\s*$/,'').replace(/\s+[-–—]\s+\d+\s*pts?\s*$/i,'').trim();

  function check(roster,faction){
    const catalog=root.WH_POINTS_CATALOG?.[faction],unresolved=[],occurrences=new Map(),enhancements=[];let total=0;
    if(!catalog)return{total:null,unresolved:['Army Book point data is unavailable.']};
    for(const unit of roster.units){
      const key=normalize(unit.name),definition=catalog.units[key],index=(occurrences.get(key)||0)+1;occurrences.set(key,index);
      if(!definition){unresolved.push(`Unit: ${unit.name}`);continue;}
      const prices=definition.points.filter(row=>copyMatches(row.label,index)&&modelMatches(row.label,unit.quantity));
      if(prices.length!==1){unresolved.push(`Unit size or repeat: ${unit.quantity}x ${unit.name}`);continue;}
      total+=Number(prices[0].value);
      for(const item of definition.wargear||[])total+=gearCount(unit,String(item.label).replace(/^per\s+/i,''))*Number(item.value);
    }
    for(const raw of roster.enhancements||[]){
      const name=enhancementName(raw);if(!name)continue;
      const enhancement=catalog.enhancements[normalize(name)];
      if(!enhancement)unresolved.push(`Enhancement: ${name}`);else{
        total+=Number(enhancement.value);
        enhancements.push({...raw,name:enhancement.title,currentCost:Number(enhancement.value),text:enhancement.text||'',effect:enhancement.effect||''});
      }
    }
    return{total,unresolved,enhancements,difference:total-Number(roster.declared||0),unitLineTotal:Number(roster.unitLineTotal??roster.calculated??0),exportMatches:Number(roster.declared||0)===Number(roster.unitLineTotal??roster.calculated??0)};
  }
  root.WHRosterPoints=Object.freeze({check,normalize});
}(typeof window==='undefined'?globalThis:window));
