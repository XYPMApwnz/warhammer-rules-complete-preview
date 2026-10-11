/** Book-owned configuration; all player views use the shared application. */
export const registration=Object.freeze({
  id:'chaos-space-marines',title:'Chaos Space Marines',
  home:{shelf:{id:'chaos',title:'Chaos',subtitle:'Armies of Chaos',order:30},
    cover:new URL('../assets/chaos-space-marines-cover-480.webp',import.meta.url).href,
    coverAlt:'Chaos Space Marines army book',accent:'#a27e39',label:'Interactive army book',order:20},
  assetBaseURL:new URL('./',import.meta.url).href,
  styles:[new URL('./theme.css',import.meta.url).href],
  routeAliases:['/books/chaos-space-marines/v2/app.html'],
  async loadPayload(){const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('CSM V2 presentation unavailable');return response.json();},
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
