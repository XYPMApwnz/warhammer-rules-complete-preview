/** One Tyranids configuration shared by the main and isolated V2 hosts. */
export const registration=Object.freeze({
  id:'tyranids',title:'Tyranids',assetBaseURL:new URL('./',import.meta.url).href,
  home:Object.freeze({shelf:Object.freeze({id:'xenos',title:'Xenos',subtitle:'Alien armies',order:40}),
    accent:'#c9a4e8',label:'Interactive army book',order:10}),
  styles:[new URL('./theme.css',import.meta.url).href],
  routeAliases:[],
  async loadPayload(){
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Tyranids V2 presentation unavailable');
    return response.json();
  },
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
