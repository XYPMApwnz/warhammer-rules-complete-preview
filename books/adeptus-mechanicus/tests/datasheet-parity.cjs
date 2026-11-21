const {launchQaBrowser}=require('../../../tests/helpers/qa-browser.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');

const normalize=value=>String(value||'')
  .replace(/[➤\[\]]/g,'')
  .replace(/&/g,' and ')
  .replace(/[’‘]/g,"'")
  .replace(/[–—‑-]/g,' ')
  .replace(/[^a-z0-9+]+/gi,' ')
  .replace(/\s+/g,' ')
  .trim()
  .toLowerCase();

async function main(){
  if(!process.argv.includes('--live-diagnostic'))throw new Error('datasheet-parity.cjs queries mutable live source data; pass --live-diagnostic explicitly. Normal source verification is local and frozen.');
  const {chromium}=require('playwright');
  const codex=require(path.resolve(__dirname,'..','content','adeptus-mechanicus-codex-datasheets.en.json')).datasheets;
  const wargearSnapshot=require(path.resolve(__dirname,'..','content','adeptus-mechanicus-codex-wargear.en.json')).units;
  const wargearByTitle=new Map(wargearSnapshot.map(unit=>[unit.title.toLowerCase(),unit]));
  const pack=require(path.resolve(__dirname,'..','content','adeptus-mechanicus-rules.en.json')).datasheets;
  const packIds=new Set(pack.map(unit=>unit.id));
  const units=codex.filter(unit=>unit.status==='Codex transcription'&&!packIds.has(unit.id));
  const browser=await launchQaBrowser(chromium,{executablePath:process.env.BROWSER_EXECUTABLE,headless:true});
  const indexPage=await browser.newPage();
  await indexPage.goto('https://wahapedia.ru/wh40k11ed/factions/adeptus-mechanicus/',{waitUntil:'domcontentloaded',timeout:60000});
  const links=await indexPage.locator('a[href*="/factions/adeptus-mechanicus/"]').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>[node.textContent.trim().toLowerCase(),node.href])));
  await indexPage.close();
  const differences=[];
  let cursor=0;
  async function worker(){
    const page=await browser.newPage();
    while(cursor<units.length){
      const unit=units[cursor++],url=links[unit.title.toLowerCase()];
      if(!url){differences.push(`${unit.title}: current 11E page not found`);continue;}
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
      const remote=await page.evaluate(()=>{
        const body=document.body.innerText;
        const keywordMatch=body.match(/KEYWORDS:\s*([^\n]+)\s*\nFACTION KEYWORDS:\s*\n([^\n]+)/i);
        const keywords=keywordMatch?[...keywordMatch[1].split(';'),...keywordMatch[2].split(';')].map(value=>value.trim()).filter(Boolean):[];
        const weapons=[...document.querySelectorAll('.wTable tbody.bkg tr:not(.wTable2_long)')].map(row=>{
          const cells=[...row.cells];if(cells.length<8)return null;
          const nameCell=cells[1].cloneNode(true);nameCell.querySelectorAll('.kwbw').forEach(node=>node.remove());
          return {name:nameCell.textContent.trim(),range:cells[2].textContent.trim(),a:cells[3].textContent.trim(),skill:cells[4].textContent.trim(),s:cells[5].textContent.trim(),ap:cells[6].textContent.trim(),d:cells[7].textContent.trim()};
        }).filter(Boolean);
        const abilities=[...document.querySelectorAll('.dsAbility')].flatMap(node=>{
          const heading=[...node.children].find(child=>child.tagName==='B');if(!heading)return[];
          const title=heading.textContent.replace(/:\s*$/,'').trim();
          const text=node.innerText.slice(node.innerText.indexOf(':')+1).trim();
          return title&&text?[{title,text}]:[];
        });
        const header=label=>[...document.querySelectorAll('.dsHeader')].find(node=>node.textContent.trim()===label);
        const wargearHeader=header('WARGEAR OPTIONS');
        const list=wargearHeader?.nextElementSibling?.tagName==='UL'?wargearHeader.nextElementSibling:null;
        const wargear=list?[...list.children].map(item=>item.innerText.trim()).filter(Boolean):[];
        let sibling=list?.nextElementSibling;
        while(sibling){if(sibling.classList?.contains('dsOptionsComment'))wargear.push(sibling.innerText.trim());sibling=sibling.nextElementSibling;}
        const composition=header('UNIT COMPOSITION')?.nextElementSibling?.innerText.trim()||'';
        const wargearAbilityTitles=[];
        let abilityNode=header('WARGEAR ABILITIES')?.nextElementSibling;
        while(abilityNode&&!abilityNode.classList?.contains('dsHeader')){
          if(abilityNode.classList?.contains('dsAbility')){
            const heading=[...abilityNode.children].find(child=>child.tagName==='B');
            if(heading)wargearAbilityTitles.push(heading.textContent.replace(/:\s*$/,'').trim());
          }
          abilityNode=abilityNode.nextElementSibling;
        }
        return{body,keywords,weapons,abilities,wargear,composition,wargearAbilityTitles};
      });
      const remoteKeywords=new Set(remote.keywords.map(normalize));
      const localKeywords=new Set(unit.keywords.map(normalize));
      for(const keyword of unit.keywords)if(!remoteKeywords.has(normalize(keyword)))differences.push(`${unit.title}: extra keyword ${keyword}`);
      for(const keyword of remote.keywords)if(!localKeywords.has(normalize(keyword)))differences.push(`${unit.title}: missing keyword ${keyword}`);
      const remoteWeapons=new Set(remote.weapons.map(weapon=>[weapon.name,weapon.range,weapon.a,weapon.skill,weapon.s,weapon.ap,weapon.d].map(normalize).join('|')));
      for(const weapon of unit.weapons){
        const key=[weapon.name,weapon.range,weapon.a,weapon.skill,weapon.s,weapon.ap,weapon.d].map(normalize).join('|');
        if(!remoteWeapons.has(key))differences.push(`${unit.title}: weapon mismatch ${weapon.name} (${weapon.range}, ${weapon.a}, ${weapon.skill}, ${weapon.s}, ${weapon.ap}, ${weapon.d})`);
      }
      const remoteBody=normalize(remote.body);
      for(const ability of [...unit.abilities,...(unit.wargearAbilities||[])]){
        if(!ability.text||['doctrina imperatives','canticles of the omnissiah','leader','support'].includes(normalize(ability.title)))continue;
        if(!remoteBody.includes(normalize(ability.text)))differences.push(`${unit.title}: ability text mismatch ${ability.title}`);
      }
      const localWargearTitles=new Set((unit.wargearAbilities||[]).map(ability=>normalize(ability.title)));
      const remoteWargearTitles=new Set(remote.wargearAbilityTitles.map(normalize));
      for(const title of localWargearTitles)if(!remoteWargearTitles.has(title))differences.push(`${unit.title}: ${title} is incorrectly classified as a Wargear Ability`);
      for(const title of remoteWargearTitles)if(!localWargearTitles.has(title))differences.push(`${unit.title}: ${title} is missing from Wargear Abilities`);
      const snapshot=wargearByTitle.get(unit.title.toLowerCase());
      if(!snapshot)differences.push(`${unit.title}: exact wargear snapshot missing`);
      else{
        assert.deepEqual(snapshot.wargear.map(normalize),remote.wargear.map(normalize),`${unit.title}: wargear options changed`);
        assert.equal(normalize(snapshot.composition),normalize(remote.composition),`${unit.title}: unit composition changed`);
      }
    }
    await page.close();
  }
  await Promise.all(Array.from({length:6},worker));
  await browser.close();
  assert.deepEqual(differences,[]);
  console.log(`Datasheet parity passed: ${units.length} carried-forward Codex datasheets.`);
}

main().catch(error=>{console.error(error);process.exit(1)});
