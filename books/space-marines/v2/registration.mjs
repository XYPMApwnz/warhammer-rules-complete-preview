/** Native Space Marines configuration for the existing Unified V2 shell. */
export const registration=Object.freeze({
  id:'space-marines',title:'Space Marines',assetBaseURL:new URL('./',import.meta.url).href,
  home:Object.freeze({shelf:Object.freeze({id:'imperium',title:'Imperium',subtitle:'Armies of the Imperium',order:10}),
    cover:new URL('../assets/space-marines-cover-480.webp',import.meta.url).href,
    coverAlt:'Space Marines cover',coverFit:'cover',accent:'#89b8ec',label:'Interactive army book',order:5}),
  styles:[new URL('./theme.css',import.meta.url).href],routeAliases:[],
  async loadPayload(){
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Space Marines V2 presentation unavailable');
    return response.json();
  },
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
