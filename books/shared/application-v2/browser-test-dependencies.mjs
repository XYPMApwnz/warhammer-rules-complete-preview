/** Exact shell entry dependencies for existing browser QA HTTP servers. */
const dependencies=new Map([
  ['/v2/app.html','text/html'],
  ['/v2/boot.mjs','text/javascript'],
  ...['compatibility','routes','registry','runtime','home'].map(name=>[
    `/books/shared/application-v2/${name}.mjs`,'text/javascript']),
  ['/books/shared/application-v2/shell.css','text/css'],
  ['/books/shared/application-v2/home.css','text/css'],
  ...['warhammer-40000-logo-optimized.png','games-workshop-logo.png'].map(name=>[`/assets/${name}`,'image/png']),
  ...['core-rules-cover-480.webp','core-rules-cover-800.webp','adeptus-mechanicus-cover-480.webp','death-guard-cover-480.webp'].map(name=>[`/assets/${name}`,'image/webp']),
  ['/assets/core-rules-cover-fallback.jpg','image/jpeg'],
  ...['death-guard','adeptus-mechanicus'].map(book=>[
    `/books/${book}/v2/registration.mjs`,'text/javascript'])
]);

export const isApplicationTestDependency=pathname=>dependencies.has(pathname);
export function allowApplicationTestDependencies(allowed) {
  for(const [pathname,mime]of dependencies)allowed.set(pathname,mime);
}
