/** Blood Angels consumer registration; canonical owners stay BA and SM. */
export const registration=Object.freeze({
  id:'blood-angels',title:'Blood Angels',assetBaseURL:new URL('./',import.meta.url).href,
  home:Object.freeze({shelf:Object.freeze({id:'imperium',title:'Imperium',subtitle:'Armies of the Imperium',order:10}),
    cover:new URL('../assets/blood-angels-cover-480.webp',import.meta.url).href,
    coverAlt:'Blood Angels cover',coverFit:'cover',accent:'#dc8c82',label:'Interactive army book',order:7}),
  styles:[new URL('./theme.css',import.meta.url).href],routeAliases:[],
  async loadPayload(){
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Blood Angels V2 presentation unavailable');
    return response.json();
  },
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
