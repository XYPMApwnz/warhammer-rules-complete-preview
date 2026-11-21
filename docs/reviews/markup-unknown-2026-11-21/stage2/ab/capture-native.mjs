import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const option = name => args.find(arg => arg.startsWith(name + '='))?.slice(name.length + 1);
const root = path.resolve(option('--root'));
const out = path.resolve(option('--out'));
const selected = option('--book');
const fixtureFile = 'E:/Warhammer/qa-evidence/i4-unified-roster-service-20261103/browser-fixtures.json';
const fixtureBytes = fs.readFileSync(fixtureFile);
const fixtures = JSON.parse(fixtureBytes);
const hash = value => createHash('sha256').update(value).digest('hex');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], {cwd:root, encoding:'utf8'}).trim();
fs.mkdirSync(out, {recursive:true});
const manifestFile = path.join(out, 'MANIFEST.json');
if (fs.existsSync(manifestFile)) throw Error('Capture output already contains a manifest');
fs.copyFileSync(fixtureFile, path.join(out, 'fixtures.json'));
const manifest = {
  schema:'core-refresh-native-capture/v1', root, sha,
  command:[process.execPath, process.argv[1], ...args],
  fixtureFile, fixtureSha256:hash(fixtureBytes),
  startedUtc:new Date().toISOString(), status:'RUNNING',
  scope:'Existing 199 native fixtures with full decoded public service import/snapshot/projection/effective/related/points observations. No semantic filtering.',
  books:[], cases:[], counts:{cases:0, ready:0, needsBindings:0, other:0, frames:0}
};
const save = () => fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
save();
const read = async url => {
  const parsed = new URL(url);
  assert.equal(parsed.protocol, 'file:', 'The capture is offline');
  const bytes = fs.readFileSync(fileURLToPath(parsed));
  return {ok:true, json:async()=>JSON.parse(bytes), text:async()=>bytes.toString('utf8')};
};
globalThis.fetch = read;
const {sourceDeclarationView:decode} = await import(pathToFileURL(path.join(root, 'books/shared/source-refs-v2/source-refs.mjs')));
const plain = value => value === undefined ? {qaUndefined:true} : JSON.parse(JSON.stringify(decode(value), (_key, item) => item instanceof Set ? [...item] : item));
try {
  for (const bookId of fixtures.bookIds.filter(id => !selected || id === selected)) {
    const started = Date.now();
    const moduleFile = path.join(root, 'books', bookId, 'v2', bookId === 'adeptus-mechanicus' ? 'roster-runtime.mjs' : 'roster-boot.mjs');
    const module = await import(pathToFileURL(moduleFile));
    const service = await module.createBrowserRoster({fetch:read});
    const records = [];
    for (const fixture of fixtures.cases.filter(row => row.bookId === bookId)) {
      const frameStart = Date.now();
      const imported = service.import(fixture.text, fixture.bindings || {}, {replaceExisting:true});
      const frames = [];
      const capture = stage => frames.push({
        stage,
        snapshot:plain(service.snapshot()),
        projection:plain(service.projection),
        effective:service.state.units.map(unit => plain(service.effective(unit.instanceId))),
        related:service.state.units.flatMap(unit => plain(service.related(unit.instanceId))),
        points:plain(service.points)
      });
      if (imported.status === 'READY') {
        capture('import');
        for (const edge of fixture.attachments || []) {
          const units = service.state.units;
          service.attach(units[edge.leaderOrdinal - 1].instanceId, units[edge.bodyguardOrdinal - 1].instanceId);
          capture('attach-explicit/' + edge.leaderOrdinal);
        }
        if (fixture.initialAttachments) {
          const state = service.snapshot();
          state.initialAttachments = structuredClone(state.attachments);
          service.load(state);
          capture('initial-history');
        }
        for (const choice of [...(fixture.sourceChoices || []), ...(fixture.sourceChoice ? [fixture.sourceChoice] : [])]) {
          service.setSourceChoice(choice.source, choice.ruleId, choice.value);
          capture('source-choice/' + choice.source);
        }
        service.load(service.snapshot());
        capture('reload');
        if (!service.state.attachments.length) {
          let edge;
          for (const unit of service.state.units) {
            const target = service.candidates(unit.instanceId)[0];
            if (target) { edge = {leader:unit.instanceId, target:target.instanceId}; break; }
          }
          if (edge) {
            service.attach(edge.leader, edge.target); capture('attach');
            service.detach(edge.leader); capture('detach');
          }
        } else {
          for (const edge of [...service.state.attachments]) service.detach(edge.leaderInstanceId);
          capture('detach-existing');
        }
      }
      const record = {bookId, fixtureId:fixture.id, imported:plain(imported), frames};
      records.push(record);
      manifest.cases.push({bookId, fixtureId:fixture.id, importStatus:imported.status, frames:frames.map(row=>row.stage), elapsedMs:Date.now()-frameStart});
      manifest.counts.cases++;
      manifest.counts.frames += frames.length;
      if (imported.status === 'READY') manifest.counts.ready++;
      else if (imported.status === 'NEEDS_BINDINGS') manifest.counts.needsBindings++;
      else manifest.counts.other++;
      console.log('CAPTURED ' + bookId + '/' + fixture.id + ' ' + imported.status + ' ' + frames.length + ' frames');
      save();
    }
    const file = bookId + '.ndjson';
    fs.writeFileSync(path.join(out,file), records.map(record=>JSON.stringify(record)).join('\n') + '\n');
    const bytes = fs.readFileSync(path.join(out,file));
    manifest.books.push({bookId, file, bytes:bytes.length, sha256:hash(bytes), cases:records.length, elapsedMs:Date.now()-started});
    save();
  }
  manifest.status = 'PASS';
  manifest.finishedUtc = new Date().toISOString();
  save();
  console.log(JSON.stringify({status:manifest.status, sha, counts:manifest.counts, out}));
} catch (error) {
  manifest.status='FAIL'; manifest.error={message:error.message,stack:error.stack}; save(); throw error;
}
