/** Native snapshot adapter to the existing shared runtime; no importer or
 * attachment permissions are invented here. Rebind physical conditions on load. */
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
const clone=structuredClone;
export function createDarkAngelsRosterRuntime(built){
 const template=clone(built.book||built);let active=null;
 if(template.bookId!=='dark-angels')throw new TypeError('Wrong native roster book');
 const ready=()=>{if(!active)throw new TypeError('No physical roster');return active;};
 return {
  get book(){return clone(template);},get state(){return active?.state||null;},get projection(){return active?.projection||null;},
  load(snapshot){
   const state=clone(snapshot),schema=createDarkAngelsRuleSchema({state});
   const next=createRosterRuntime(template,schema);next.load(state);active=next;return active.state;
  },
  snapshot(){return ready().snapshot();},effective(id){return ready().effective(id);},
  context(...args){return ready().context(...args);},related(...args){return ready().related(...args);},
  recompute(){const state=this.snapshot();return this.load(state);}
 };
}
