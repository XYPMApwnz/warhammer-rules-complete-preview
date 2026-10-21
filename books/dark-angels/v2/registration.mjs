/** Dark Angels consumer registration; canonical owners stay DA and SM. */
export const registration=Object.freeze({
  id:'dark-angels',title:'Dark Angels',assetBaseURL:new URL('./',import.meta.url).href,
  home:Object.freeze({shelf:Object.freeze({id:'imperium',title:'Imperium',subtitle:'Armies of the Imperium',order:10}),
    cover:new URL('../assets/dark-angels-cover-480.webp',import.meta.url).href,
    coverAlt:'Dark Angels cover',coverFit:'cover',accent:'#96bc9d',label:'Interactive army book',order:6}),
  styles:[new URL('./theme.css',import.meta.url).href],routeAliases:[],
  async loadPayload(){
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Dark Angels V2 presentation unavailable');
    return response.json();
  },
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
