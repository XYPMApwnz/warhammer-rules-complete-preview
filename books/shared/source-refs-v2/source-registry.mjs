// Node-only producer adapter. Matching is literal and registry-backed; hashes,
// filenames and version numbers never establish a source identity.
import fs from 'node:fs';
import path from 'node:path';
const read = file => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
const posix = value => value.replaceAll('\\', '/');
export function loadSourceRegistry(repoRoot, { bookId } = {}) {
  const root = path.resolve(repoRoot), rows = [], identities = [];
  const add = (sourceId, document, registry, pointer) => { if (typeof sourceId === 'string' && typeof document === 'string') rows.push({ sourceId, document: posix(document), registry, pointer }); };
  const globalPath = 'books/source-ingestion-contract.json', global = read(path.join(root, globalPath));
  for (const [i, source] of (global?.sources || []).entries()) if (!bookId || source.book === bookId) for (const [j, artifact] of (source.artifacts || []).entries()) add(source.sourceId, artifact.path, globalPath, `/sources/${i}/artifacts/${j}`);
  const books = bookId ? [bookId] : fs.readdirSync(path.join(root, 'books'), { withFileTypes: true }).filter(item => item.isDirectory() && item.name !== 'shared' && item.name !== 'orks').map(item => item.name).sort();
  for (const book of books) {
    const manifestPath = `books/${book}/sources/source-manifest.json`, manifest = read(path.join(root, manifestPath));
    for (const key of ['layers', 'sources']) for (const [i, source] of (manifest?.[key] || []).entries()) {
      const id = source.sourceId || source.id;
      for (const document of source.paths || []) add(id, document, manifestPath, `/${key}/${i}`);
      if (source.localFile) add(id, `books/${book}/sources/${source.localFile}`, manifestPath, `/${key}/${i}`);
      if (source.url) add(id, source.url, manifestPath, `/${key}/${i}`);
    }
    const enrollmentPath = `books/${book}/v2/sources/enrollment.json`, enrollment = read(path.join(root, enrollmentPath));
    for (const [id, source] of Object.entries(enrollment?.sourceIds || {})) {
      identities.push({ sourceId: id, ...source, registry: enrollmentPath, pointer: `/sourceIds/${id}` });
      if (source.sourcePath) add(id, source.sourcePath, enrollmentPath, `/sourceIds/${id}`);
    }
    for (const key of ['currentOfficialSource', 'centralMfm']) {
      const source = enrollment?.[key], id = typeof source === 'string' ? source : source?.sourceId || source?.id;
      if (id) { identities.push({ sourceId: id, ...(typeof source === 'object' ? source : {}), registry: enrollmentPath, pointer: `/${key}` }); if (source?.url) add(id, source.url, enrollmentPath, `/${key}`); }
    }
  }
  rows.sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0);
  function resolve(document, recordedSourceId) {
    const exact = rows.filter(row => row.document === document);
    const recorded = exact.find(row => row.sourceId === recordedSourceId) || identities.find(row => row.sourceId === recordedSourceId && row.sourceDirectory && typeof document === 'string' && document.startsWith(`${row.sourceDirectory}/`)) || (document === undefined && (rows.find(row => row.sourceId === recordedSourceId) || identities.find(row => row.sourceId === recordedSourceId)));
    if (recorded) return { sourceId: recordedSourceId, status: 'RECORDED_REGISTERED_ID' };
    const candidates = [...new Set(exact.map(row => row.sourceId))].sort();
    if (candidates.length === 1) return { sourceId: candidates[0], status: 'UNIQUE_DOCUMENT_REGISTRY_MATCH' };
    return { sourceId: null, status: 'UNRESOLVED_SOURCE', reason: candidates.length ? 'AMBIGUOUS_DOCUMENT' : 'UNREGISTERED_DOCUMENT', ...(candidates.length ? { candidates } : {}) };
  }
  return { rows, identities, resolve };
}
export const loadBookSourceRegistry = loadSourceRegistry;
