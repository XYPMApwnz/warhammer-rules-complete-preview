import {parseProducerJSON,serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {buildGlossary} from '../../shared/army-book-app-v2/glossary.mjs';

export function readGlossaryInputs() {
  return {model: parseProducerJSON(fs.readFileSync(new URL('./generated/rule-contract-effective.json', import.meta.url), 'utf8')),
    coreCatalog: createEffectiveCoreCatalog()};
}

export function buildGlossaryProjection(model, coreCatalog) {
  model=prepareSourceProducer(model);
  return prepareSourceProducer(buildGlossary({model, coreCatalog}));
}

export function writeGlossary({check = false, outputPath, inputs = readGlossaryInputs()} = {}) {
  const result = prepareSourceProducer(buildGlossary(inputs));
  const filename = outputPath || fileURLToPath(new URL('./generated/glossary-v2.json', import.meta.url));
  const bytes = serializeSourceJSON(result.index);
  if (check) {
    if (!fs.existsSync(filename) || fs.readFileSync(filename, 'utf8') !== bytes) throw new Error('Glossary projection drift');
  } else {
    fs.writeFileSync(filename, bytes);
  }
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const {index, coreCards} = writeGlossary({check: process.argv.includes('--check')});
  console.log(JSON.stringify({entries: index.entries.length, coreCards: coreCards.length}));
}
