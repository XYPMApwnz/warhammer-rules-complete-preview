// Browser-safe test driver, never imported by product consumers.
export function runAttachmentFixture(service,fixture) {
  const imported=service.import(fixture.text);
  if(imported.status!=='READY')throw new Error(JSON.stringify(imported));
  const initial=service.snapshot(),trace=[];
  const id=ordinal=>initial.units[ordinal-1].instanceId;
  for(const [action,bodyguard,participant] of fixture.actions) {
    if(action==='DETACH')service.detach(id(participant));
    else service[action==='ATTACH'?'attach':'reattach'](id(bodyguard),id(participant));
    trace.push({state:service.state,groups:service.groups,contexts:initial.units.map(unit=>{
      const context=service.context(unit.instanceId);
      return {instanceId:unit.instanceId,keywords:[...context.keywords].sort(),roster:context.roster,
        profiles:service.modelScopes(unit.instanceId).map(scope=>({...scope,keywords:[...service.context(unit.instanceId,'MODEL',scope.scopeId).keywords].sort()}))};
    })});
  }
  return {initial,trace};
}
