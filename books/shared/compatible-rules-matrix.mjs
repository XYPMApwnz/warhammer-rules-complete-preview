const rowStates=new Set(['match','conditional']);

const acceptedSchemas=options=>new Set([
  ...(options.schemas||[]),
  ...(options.schema?[options.schema]:[])
].filter(Boolean));

export function conditionsFor(row){
  return [...new Set(row?.conditions?.length?row.conditions:row?.condition?[row.condition]:[])];
}

export function validateCompatibleRulesMatrix(matrix,options={}){
  if(!matrix||typeof matrix!=='object'||Array.isArray(matrix))throw new TypeError('Compatible Rules matrix must be an object.');
  const schemas=acceptedSchemas(options);
  if(typeof matrix.schema!=='string'||!matrix.schema)throw new TypeError('Compatible Rules matrix requires a schema.');
  if(schemas.size&&!schemas.has(matrix.schema))throw new TypeError(`Unsupported Compatible Rules schema: ${matrix.schema}`);
  if(!matrix.units||typeof matrix.units!=='object'||Array.isArray(matrix.units))throw new TypeError('Compatible Rules matrix requires a units object.');
  for(const [unitId,rows] of Object.entries(matrix.units)){
    if(!Array.isArray(rows))throw new TypeError(`Compatible Rules rows must be an array: ${unitId}`);
    rows.forEach((row,index)=>{
      const label=`${unitId}[${index}]`;
      if(!row||typeof row!=='object'||Array.isArray(row))throw new TypeError(`Compatible Rules row must be an object: ${label}`);
      if(typeof row.ruleId!=='string'||!row.ruleId)throw new TypeError(`Compatible Rules row requires ruleId: ${label}`);
      if(!rowStates.has(row.state))throw new TypeError(`Invalid Compatible Rules state: ${label}`);
      for(const field of ['kind','scope','detachmentId','condition'])if(row[field]!=null&&typeof row[field]!=='string')throw new TypeError(`Compatible Rules ${field} must be a string: ${label}`);
      if(row.conditions!=null&&(!Array.isArray(row.conditions)||row.conditions.some(value=>typeof value!=='string')))throw new TypeError(`Compatible Rules conditions must be strings: ${label}`);
    });
  }
  return matrix;
}

const ruleKey=row=>`${row.scope||row.detachmentId||''}|${row.ruleId}`;
// Warlord selection is physical-instance context, never a static datasheet fact.
// Include accepted matches of the same rule as its explicitly conditional rows.
const warlordRuleKeys=matrix=>new Set(Object.values(matrix.units||{}).flat().filter(row=>conditionsFor(row).includes('warlord-unknown')).map(ruleKey));

export function getCompatibleRules(matrix,unitId,{detachmentId,resolveDetachmentSelection=false,warlord}={},warlordRules=warlordRuleKeys(matrix)){
  const selected=detachmentId&&detachmentId!=='all'?String(detachmentId).replace(/^detachment-/,''):'';
  return (matrix.units?.[unitId]||[])
    .filter(row=>(row.scope==='core'||!selected||row.detachmentId===selected)&&(warlord!==false||!warlordRules.has(ruleKey(row))))
    .map(row=>{
      if(row.state!=='conditional')return row;
      const conditions=conditionsFor(row).filter(condition=>!(resolveDetachmentSelection&&selected&&condition==='detachment-not-selected')&&!(warlord===true&&condition==='warlord-unknown'));
      if(conditions.length===conditionsFor(row).length)return row;
      return conditions.length?{...row,condition:conditions[0],conditions}:{...row,state:'match',condition:null,conditions:[]};
    });
}

export function createCompatibleRulesSource(matrix,options={}){
  validateCompatibleRulesMatrix(matrix,options);
  const warlordRules=warlordRuleKeys(matrix);
  return Object.freeze({
    schema:matrix.schema,
    conditionLabels:Object.freeze({...options.conditionLabels}),
    hasUnit:unitId=>Boolean(matrix.units[unitId]?.length),
    rowsForUnit:(unitId,context)=>getCompatibleRules(matrix,unitId,{...context,resolveDetachmentSelection:options.resolveDetachmentSelection},warlordRules),
    conditionsFor
  });
}

export async function loadCompatibleRulesSource(url,options={}){
  const request=options.fetch||globalThis.fetch;
  if(typeof request!=='function')throw new TypeError('Compatible Rules source requires fetch.');
  const response=await request(url);
  if(!response.ok)throw new Error(`Could not load Compatible Rules: HTTP ${response.status}`);
  return createCompatibleRulesSource(await response.json(),options);
}

export function createCompatibleRulesLoader(url,options={}){
  let source=null,pending=null;
  const load=()=>source?Promise.resolve(source):pending||(pending=loadCompatibleRulesSource(url,options).then(result=>(source=result)).catch(error=>{pending=null;throw error;}));
  return Object.freeze({
    schema:options.schema||'',
    conditionLabels:Object.freeze({...options.conditionLabels}),
    load,
    hasUnit:unitId=>source?source.hasUnit(unitId):true,
    rowsForUnit:(unitId,context)=>source?source.rowsForUnit(unitId,context):[],
    conditionsFor
  });
}
