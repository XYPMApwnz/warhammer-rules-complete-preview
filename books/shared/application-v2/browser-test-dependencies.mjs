/** Exact shell entry dependencies for existing browser QA HTTP servers. */
const dependencies=new Map([
  ['/v2/app.html','text/html'],
  ['/v2/boot.mjs','text/javascript'],
  ...['compatibility','routes','registry','runtime'].map(name=>[
    `/books/shared/application-v2/${name}.mjs`,'text/javascript']),
  ['/books/shared/application-v2/shell.css','text/css'],
  ...['death-guard','adeptus-mechanicus'].map(book=>[
    `/books/${book}/v2/registration.mjs`,'text/javascript'])
]);

export const isApplicationTestDependency=pathname=>dependencies.has(pathname);
export function allowApplicationTestDependencies(allowed) {
  for(const [pathname,mime]of dependencies)allowed.set(pathname,mime);
}
