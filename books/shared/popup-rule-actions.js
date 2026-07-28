(function(root){
  'use strict';

  function destination(value,base){
    if(!value)return null;
    try{const url=new URL(value,base);return{url,document:url.pathname+url.search,hash:url.hash.slice(1)};}catch{return null;}
  }

  function resolvePopupRuleAction(term,{base=location.href,resolveHref=value=>value,hasTarget=id=>Boolean(document.getElementById(id))}={}){
    const local=term?.rule&&hasTarget(term.rule)?destination('#'+term.rule,base):null;
    const canonical=term?.fullRulePath?destination(resolveHref(term.fullRulePath),base):null;
    const current=destination(base,base);
    if(canonical&&current&&canonical.url.pathname===current.url.pathname){canonical.url.search=current.url.search;canonical.document=canonical.url.pathname+canonical.url.search;}
    if(!local&&!canonical)return[];
    if(local&&canonical&&local.url.pathname===canonical.url.pathname&&local.url.hash===canonical.url.hash)return[{label:'Open full rule',target:term.rule,type:'rule'}];
    const actions=[];
    if(local)actions.push({label:canonical?'Show in this book':'Open full rule',target:term.rule,type:'rule'});
    if(canonical){
      if(current&&canonical.document===current.document&&canonical.hash&&hasTarget(canonical.hash))actions.push({label:local?'Open canonical rule':'Open full rule',target:canonical.hash,type:'rule'});
      else actions.push({label:local?'Open canonical rule':'Open full rule',href:canonical.url.href,canonical:true});
    }
    return actions;
  }

  root.WHPopupRuleActions=Object.freeze({resolve:resolvePopupRuleAction});
}(window));
