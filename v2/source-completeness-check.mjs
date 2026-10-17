/** Read-only build gate. No inventory pins are generated or accepted here. */
import {assertSourceCompletenessGate,loadSourceCompletenessInputs} from '../books/shared/roster-v2/source-completeness.mjs';

if(process.argv.includes('--fresh')){
  const {loadV2ArmyModels}=await import('../glossary/v2/content/army-v2-projection.mjs');
  loadV2ArmyModels();
}
const result=assertSourceCompletenessGate(loadSourceCompletenessInputs());
console.log(JSON.stringify({check:'source-completeness',...result}));
