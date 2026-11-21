/** Preserve the immutable legacy plan and admit only the requested additive step. */
import assert from 'node:assert/strict';
export const SOURCE_METADATA_OUTPUT='books/shared/application-v2/generated/source-metadata.v1.json';
export function withoutSourceMetadataStep(plan){
  const producer='books/shared/tools/build-source-metadata.mjs';
  const output=SOURCE_METADATA_OUTPUT;
  const matches=plan.steps.filter(step=>step.producer===producer);
  assert.equal(matches.length,1,'One exact source metadata producer is required');
  assert.deepEqual(matches[0],{book:'source-metadata',producer,outputs:[output],args:[],runtime:'node'});
  const index=plan.steps.indexOf(matches[0]);
  assert.equal(plan.steps[index+1]?.producer,'books/core-rules/reader/build.mjs','Metadata follows book producers and precedes shared consumers');
  assert.equal(plan.files.filter(file=>file===output).length,1,'One metadata output is required');
  return {...plan,steps:plan.steps.filter(step=>step!==matches[0]),files:plan.files.filter(file=>file!==output)};
}
