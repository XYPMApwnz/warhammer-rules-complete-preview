/** Book-owned loaders and presentation configuration, never gameplay facts. */
export function createBookRegistry(registrations) {
  const books=new Map(),aliases=new Map();
  for(const input of registrations) {
    if(!input || typeof input.id!=='string' || !/^[a-z0-9][a-z0-9-]*$/.test(input.id) ||
      typeof input.title!=='string' || !input.title.trim() || typeof input.loadPayload!=='function' ||
      input.createRoster!==undefined && typeof input.createRoster!=='function')throw new TypeError('Invalid book registration');
    if(books.has(input.id))throw new TypeError('Duplicate book registration');
    const styles=Object.freeze([...(input.styles || [])]);
    for(const url of [...styles,input.assetBaseURL].filter(Boolean))new URL(url);
    const routeAliases=Object.freeze([...(input.routeAliases || [])]);
    for(const alias of routeAliases) {
      if(typeof alias!=='string' || !alias.startsWith('/') || aliases.has(alias))throw new TypeError('Duplicate or invalid book route alias');
      aliases.set(alias,input.id);
    }
    books.set(input.id,Object.freeze({...input,styles,routeAliases}));
  }
  return Object.freeze({entries:Object.freeze([...books.values()]),get:id=>books.get(id)||null,
    has:id=>books.has(id),forPath:pathname=>books.get(aliases.get(pathname))||null});
}
