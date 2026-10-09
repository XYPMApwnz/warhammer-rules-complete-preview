import {legacyBookURL} from './routes.mjs';
export function openCompatibilityBook(location,bookId) {
  location.replace(legacyBookURL(location.href,new URL('../../../v2/app.html',import.meta.url),bookId));
}

export function renderCompatibilityEntry({title,bookId}) {
  const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  if(!/^[a-z0-9][a-z0-9-]*$/.test(bookId))throw new TypeError('Invalid book identity');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · Army Book V2</title></head>
<body><p role="status">Opening Army Book…</p><script type="module">
import {openCompatibilityBook} from '../../shared/application-v2/compatibility.mjs';
openCompatibilityBook(window.location,${JSON.stringify(bookId)});
</script></body></html>\n`;
}
