/** Isolated Tyranids configuration; not enrolled in the production registry. */
export const registration=Object.freeze({
  id:'tyranids',title:'Tyranids',assetBaseURL:new URL('./',import.meta.url).href,
  styles:[new URL('./theme.css',import.meta.url).href],
  routeAliases:[],
  async loadPayload(){
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Tyranids V2 presentation unavailable');
    return response.json();
  },
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
