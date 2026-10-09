/** Book configuration only. All views are mounted by the shared application. */
export const registration=Object.freeze({
  id:'death-guard',title:'Death Guard',
  assetBaseURL:new URL('./',import.meta.url).href,
  styles:[],routeAliases:['/books/death-guard/v2/app.html'],
  async loadPayload() {
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Army Book unavailable');return response.json();
  },
  async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}
});
