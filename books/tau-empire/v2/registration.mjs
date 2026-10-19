/** Isolated registration only; the main application registry is unchanged. */
export const registration=Object.freeze({
  id:'tau-empire',title:'T’au Empire',assetBaseURL:new URL('./',import.meta.url).href,
  home:Object.freeze({shelf:Object.freeze({id:'xenos',title:'Xenos',subtitle:'Alien armies',order:40}),
    accent:'#77cbd0',label:'Interactive army book',order:20}),
  styles:[new URL('./theme.css',import.meta.url).href],routeAliases:[],
  async loadPayload(){const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('T’au V2 presentation unavailable');return response.json();},
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
