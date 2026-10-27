/** Book configuration only. All views are mounted by the shared application. */
export const registration=Object.freeze({
  id:'adeptus-mechanicus',title:'Adeptus Mechanicus',
  home:Object.freeze({shelf:Object.freeze({id:'imperium',title:'Imperium',subtitle:'Armies of the Imperium',order:10}),
    cover:new URL('../../../assets/adeptus-mechanicus-cover-480.webp',import.meta.url).href,coverAlt:'Adeptus Mechanicus cover',
    accent:'#9e3d30',label:'Interactive army book',order:10}),
  assetBaseURL:new URL('./',import.meta.url).href,
  styles:[new URL('./theme.css',import.meta.url).href],routeAliases:[],
  async loadPayload() {
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Army Book unavailable');return response.json();
  },
  async createRoster(){return (await import('./roster-runtime.mjs')).createBrowserRoster();}
});
