/** Book configuration only. All views are mounted by the shared application. */
export const registration=Object.freeze({
  id:'death-guard',title:'Death Guard',
  home:Object.freeze({shelf:Object.freeze({id:'chaos',title:'Chaos',subtitle:'Traitor and warp-born forces',order:30}),
    cover:new URL('../../../assets/death-guard-cover-480.webp',import.meta.url).href,coverAlt:'Death Guard cover',coverFit:'cover',
    accent:'#718153',label:'Full interactive army book',order:10}),
  assetBaseURL:new URL('./',import.meta.url).href,
  styles:[],routeAliases:[],
  async loadPayload() {
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Army Book unavailable');return response.json();
  },
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
