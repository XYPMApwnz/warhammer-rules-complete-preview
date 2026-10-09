/** Book configuration only. All views are mounted by the shared application. */
export const registration=Object.freeze({
  id:'adeptus-mechanicus',title:'Adeptus Mechanicus',
  assetBaseURL:new URL('./',import.meta.url).href,
  styles:[new URL('./theme.css',import.meta.url).href],routeAliases:['/books/adeptus-mechanicus/v2/app.html'],
  async loadPayload() {
    const response=await fetch(new URL('./generated/app-presentation.json',import.meta.url));
    if(!response.ok)throw new Error('Army Book unavailable');return response.json();
  },
  async createRoster(){return (await import('./roster-runtime.mjs')).createBrowserRoster();}
});
