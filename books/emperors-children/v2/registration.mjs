/** Future EC configuration. Production registry is deliberately unchanged. */
export const registration=Object.freeze({
  id:'emperors-children',title:'Emperor’s Children',
  home:Object.freeze({shelf:Object.freeze({id:'chaos',title:'Chaos',subtitle:'Armies of Chaos',order:30}),
    cover:new URL('../assets/emperors-children-cover-480.webp',import.meta.url).href,
    coverAlt:'Emperor’s Children army book',accent:'#c586cf',label:'Interactive army book',order:30}),
  assetBaseURL:new URL('./',import.meta.url).href,
  styles:[new URL('./theme.css',import.meta.url).href],routeAliases:['/books/emperors-children/v2/app.html'],
  async loadPayload(){const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('EC V2 presentation unavailable');return response.json();},
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
