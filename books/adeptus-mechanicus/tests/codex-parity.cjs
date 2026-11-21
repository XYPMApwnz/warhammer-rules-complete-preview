const {launchQaBrowser}=require('../../../tests/helpers/qa-browser.cjs');
const assert = require('node:assert/strict');
const path = require('node:path');

async function main() {
if (!process.argv.includes('--live-diagnostic')) throw new Error('codex-parity.cjs queries mutable live source data; pass --live-diagnostic explicitly. Normal source verification is local and frozen.');
const { chromium } = require('playwright');
const source = require(path.resolve(__dirname, '..', 'content', 'adeptus-mechanicus-codex-detachments.en.json'));
const parity = require(path.resolve(__dirname, '..', 'content', 'adeptus-mechanicus-codex-parity.en.json'));
const prefixes = ['Cohort Cybernetica', 'Data-Psalm Conclave', 'Explorator Maniple', 'Rad-Zone Corps', 'Skitarii Hunter Cohort'];
const browser = await launchQaBrowser(chromium,{ executablePath: process.env.BROWSER_EXECUTABLE, headless: true });
const page = await browser.newPage();
await page.goto(source.source.referenceUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

const remote = await page.locator('.str11Wrap').evaluateAll((nodes, prefixes) => nodes.map(node => ({
  title: node.querySelector('.str11Name')?.textContent.trim(),
  category: node.querySelector('.str11Type')?.textContent.trim(),
  text: node.querySelector('.str11Text')?.innerText.trim()
})).filter(entry => prefixes.some(prefix => (entry.category || '').startsWith(prefix))), prefixes);
const anchors={
  'Cohort Cybernetica':'Cyber-Psalm-Programming',
  'Data-psalm Conclave':'Benedictions-Of-The-Omnissiah',
  'Explorator Maniple':'Acquisition-At-Any-Cost',
  'Rad-zone Corps':'Rad-bombardment',
  'Skitarii Hunter Cohort':'Stealth-Optimisation'
};
const remoteRules=await page.evaluate(anchors=>{
  const rules={};
  for(const [detachment,anchor] of Object.entries(anchors)){
    const marker=[...document.querySelectorAll('a[name]')].find(node=>node.name===anchor),clone=marker?.parentElement?.cloneNode(true);
    if(!clone)continue;
    clone.querySelectorAll('.ShowFluff,h3,a[name],div[style*="height"]').forEach(node=>node.remove());
    rules[detachment]=clone.innerText.trim();
  }
  const enhancements=[...document.querySelectorAll('ul.EnhancementsPts')].map(list=>{
    const box=list.closest('.BreakInsideAvoid'),heading=list.querySelector('li>span')?.cloneNode(true);
    heading?.querySelectorAll('.EnhUpgrade').forEach(node=>node.remove());
    return {title:heading?.textContent.trim()||'',text:[...box.querySelectorAll('p:not(.ShowFluff)')].map(node=>node.innerText.trim()).filter(Boolean).join('\n\n')};
  }).filter(item=>item.title&&item.text);
  return {rules,enhancements};
},anchors);
await browser.close();

function fields(text) {
  const value = String(text || '').replace(/\r/g, '');
  const read = (name, next) => value.match(new RegExp(`${name}:\\s*([\\s\\S]*?)${next ? `(?=\\n\\n${next}:|$)` : '$'}`, 'i'))?.[1]?.trim() || '';
  return {
    when: read('WHEN', 'TARGET'),
    target: read('TARGET', 'EFFECT'),
    effect: read('EFFECT', 'RESTRICTIONS'),
    restrictions: read('RESTRICTIONS', '')
  };
}

function normal(value) {
  return String(value || '')
    .replace(/[‘’]/g, "'")
    .replace(/orthe/gi, 'or the')
    .replace(/\]/g, ')')
    .replace(/emphatic/gi, 'empathic')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const remoteByTitle = new Map();
for (const entry of remote) {
  const key = normal(entry.title);
  if (!remoteByTitle.has(key) || entry.text.includes('\n\n')) remoteByTitle.set(key, fields(entry.text));
}
const differences = [];
for (const detachment of source.detachments) {
  for (const stratagem of detachment.stratagems) {
    const actual = remoteByTitle.get(normal(stratagem.title));
    if (!actual) {
      differences.push(`${stratagem.title}: missing from current 11E reference`);
      continue;
    }
    for (const field of ['when', 'target', 'effect', 'restrictions']) {
      if (normal(stratagem[field]) !== normal(actual[field])) differences.push(`${stratagem.title} / ${field}\nLOCAL: ${stratagem[field] || '-'}\nLIVE:  ${actual[field] || '-'}`);
    }
  }
}
const remoteEnhancements=new Map(remoteRules.enhancements.map(item=>[normal(item.title),item.text]));
for(const detachment of parity.detachments){
  if(normal(detachment.rule.text)!==normal(remoteRules.rules[detachment.title]))differences.push(`${detachment.title}: Detachment rule text mismatch`);
  for(const enhancement of detachment.enhancements){
    const actual=remoteEnhancements.get(normal(enhancement.title));
    if(!actual)differences.push(`${enhancement.title}: current 11E Enhancement not found`);
    else if(normal(enhancement.text)!==normal(actual))differences.push(`${enhancement.title}: Enhancement text mismatch`);
  }
}

assert.deepEqual(differences, []);
console.log(`Codex parity passed: ${source.detachments.length} Detachment rules, ${parity.detachments.reduce((sum,item)=>sum+item.enhancements.length,0)} Enhancements, ${source.detachments.reduce((sum, item) => sum + item.stratagems.length, 0)} Stratagems.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
