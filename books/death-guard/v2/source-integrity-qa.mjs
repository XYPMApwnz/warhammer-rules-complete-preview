import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory,'../../..');
const digest = bytes => createHash('sha256').update(bytes).digest('hex').toUpperCase();
const readJson = file => JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const manifestPath = 'books/death-guard/v2/sources/contagion-range-image-capture-manifest.json';

// Independently verify the accepted source bytes and the complete source-image
// chain, rather than deriving expectations from generated canonical output.
export function verifySourceIntegrity({enrollment, evidence, readBytes, gitBytes, textAttribute}) {
  const source = enrollment.sources.find(row => row.path === manifestPath);
  assert.ok(source,'Capture manifest must be an enrolled source');
  assert.equal(source.byteIntegrity?.contract,'RAW_BYTES_SHA256','Exact-byte integrity contract required');
  assert.equal(source.byteIntegrity.transformations,'NONE','Hash transformations forbidden');
  assert.equal(source.byteIntegrity.checkoutTextConversion,'FORBIDDEN','Checkout conversion forbidden');
  assert.equal(textAttribute,'unset','Pinned manifest must disable Git text conversion');
  const bytes = readBytes(manifestPath);
  assert.ok(Buffer.isBuffer(bytes),'Integrity consumes raw bytes, never decoded/normalized text');
  assert.equal(digest(bytes),source.sha256,'Capture manifest source integrity');
  assert.deepEqual(bytes,gitBytes(source.byteIntegrity.acceptedGitHead,manifestPath),'Accepted Git byte identity');
  const independent = evidence.sourceCaptureIntegrity.find(row => row.path === manifestPath);
  assert.equal(independent?.sha256,source.sha256,'Independent source inventory binding');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schema,'dg-v2-referenced-image-capture/v1');
  assert.equal(manifest.historicalByteIdentity,'NOT_ASSERTED','Do not invent historical image bytes');
  assert.deepEqual(source.sourcePaths,manifest.images.map(image => image.path),'Exact image identities');
  assert.deepEqual(source.sourceSha256s,manifest.images.map(image => image.sha256),'Exact image byte bindings');
  assert.deepEqual(source.provenance.sourcePaths,source.sourcePaths);
  assert.deepEqual(source.provenance.sha256s,source.sourceSha256s);
  assert.equal(source.provenance.captureManifestPath,manifestPath);
  const hub = 'books/death-guard/v2/sources/accepted-waha-pages/death-guard.html';
  const hubBytes = readBytes(hub);
  assert.equal(digest(hubBytes),manifest.acceptedHubSha256,'Referenced accepted hub byte identity');
  assert.equal(source.provenance.acceptedHubSha256,manifest.acceptedHubSha256);
  for (const image of manifest.images) {
    assert.equal(digest(readBytes(image.path)),image.sha256,'Referenced image source integrity');
    const enrolledImage = enrollment.sources.find(row => row.path === image.path);
    assert.equal(enrolledImage?.sha256,image.sha256,'Image enrollment binding');
    assert.equal(enrolledImage.url,image.url,'Exact image URL identity');
    assert.ok(hubBytes.toString('utf8').includes(new URL(image.url).pathname),'Image referenced by accepted hub');
  }
  assert.deepEqual(enrollment.supplementalImageFacts,manifest.interpretation,'Source interpretation preserved');
  return {manifestSha256:source.sha256,images:manifest.images.length};
}

export function runSourceIntegrityQa() {
  const enrollment = readJson('books/death-guard/v2/sources/source-enrollment.json');
  const evidence = readJson('books/death-guard/v2/sources/official-source-evidence.json');
  const readBytes = file => fs.readFileSync(path.join(root,file));
  const gitBytes = (head,file) => execFileSync('git',['--no-optional-locks','show',`${head}:${file}`],{cwd:root,maxBuffer:16*1024*1024});
  const attributes = execFileSync('git',['check-attr','-z','text','--',manifestPath],{cwd:root,encoding:'utf8'}).split('\0');
  const context = {enrollment,evidence,readBytes,gitBytes,textAttribute:attributes[2]};
  const baseline = verifySourceIntegrity(context);
  let mutations = 0;
  const reject = (overrides,pattern) => {
    assert.throws(() => verifySourceIntegrity({...context,...overrides}),pattern);
    mutations++;
  };
  // No repository writes: every changed input below exists only in memory.
  const replaceBytes = (file,transform) => name => name === file ? transform(readBytes(name)) : readBytes(name);
  reject({readBytes:replaceBytes(manifestPath,bytes => Buffer.from(bytes.toString('utf8').replaceAll('\n','\r\n')))},/source integrity/);
  reject({readBytes:replaceBytes(manifestPath,bytes => Buffer.concat([bytes,Buffer.from(' ')]))},/source integrity/);
  reject({readBytes:replaceBytes(manifestPath,bytes => bytes.toString('utf8'))},/raw bytes/);
  const badSha = structuredClone(enrollment);
  badSha.sources.find(row => row.path === manifestPath).sha256 = '0'.repeat(64);
  reject({enrollment:badSha},/source integrity/);
  const normalizedPolicy = structuredClone(enrollment);
  normalizedPolicy.sources.find(row => row.path === manifestPath).byteIntegrity.transformations = 'NORMALIZE_LF';
  reject({enrollment:normalizedPolicy},/transformations forbidden/);
  reject({textAttribute:'set'},/disable Git text conversion/);
  const badEvidence = structuredClone(evidence);
  badEvidence.sourceCaptureIntegrity.find(row => row.path === manifestPath).sha256 = '0'.repeat(64);
  reject({evidence:badEvidence},/Independent source inventory binding/);
  const image = enrollment.sources.find(row => row.type === 'SUPPLEMENTAL_WAHA_IMAGE');
  reject({readBytes:replaceBytes(image.path,bytes => Buffer.concat([bytes,Buffer.from([0])]))},/image source integrity/);
  const coordinatedBytes = Buffer.concat([readBytes(manifestPath),Buffer.from(' ')]);
  const coordinatedEnrollment = structuredClone(enrollment);
  coordinatedEnrollment.sources.find(row => row.path === manifestPath).sha256 = digest(coordinatedBytes);
  reject({enrollment:coordinatedEnrollment,readBytes:replaceBytes(manifestPath,() => coordinatedBytes)},/Accepted Git byte identity/);
  return {...baseline,mutations};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`DG V2 source integrity QA PASS: ${JSON.stringify(runSourceIntegrityQa())}`);
}
