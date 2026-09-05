import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const output = 'artifacts/visual/master-final';
await mkdir(output, { recursive: true });
const baseline = process.argv.includes('--baseline');
const phase = baseline ? 'before' : 'after';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/FAbri/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const heroFiles = ['components/home/HeroWilo.tsx', 'components/home/HeroPointerGrid.tsx', 'components/home/hero-wilo.module.css', 'public/images/wilo/hero/misti.webp', 'public/images/wilo/hero/chameleon-pc.webp'];
const hashes = Object.fromEntries(await Promise.all(heroFiles.map(async (file) => [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
await writeFile(`${output}/hero-${phase}-hashes.json`, JSON.stringify(hashes, null, 2));
const results = [];
for (const viewport of baseline ? [{ width:1440, height:900 },{ width:390, height:844 }] : [{width:1920,height:1080},{width:1440,height:900},{width:1366,height:768},{width:430,height:932},{width:390,height:844}]) {
  const context = await browser.newContext({ viewport, reducedMotion:'reduce', hasTouch:viewport.width<900, isMobile:viewport.width<900 });
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>sessionStorage.setItem('wilo-loader-seen','skip'));
  await page.goto('http://127.0.0.1:3000/', {waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('[data-fullpage-section="hero"]');
  await page.waitForTimeout(2200);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`${output}/hero-${phase}-${viewport.width}.png`,animations:'disabled'});
  if (!baseline) {
    const sections = await page.locator('[data-fullpage-section]').evaluateAll(nodes=>nodes.map(node=>node.id));
    for (const id of sections.filter(id=>id && id!=='inicio')) {
      await page.evaluate(id=>window.dispatchEvent(new CustomEvent('wilo:fullpage-request',{detail:{target:id,mode:'none'}})),id);
      await page.waitForTimeout(700);
      const section=page.locator(`[id="${id}"]`);
      await section.screenshot({path:`${output}/${id}-${viewport.width}.png`,animations:'disabled'});
      const metrics=await section.evaluate(el=>({ height:el.clientHeight,overflow:document.documentElement.scrollWidth-innerWidth,heading:el.querySelector('h2')?.textContent,font:getComputedStyle(el).fontFamily,links:[...el.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),brokenImages:[...el.querySelectorAll('img')].filter(img=>img.complete&&!img.naturalWidth).map(img=>img.getAttribute('src')) }));
      results.push({id,viewport,...metrics});
    }
  }
  results.push({viewport,errors});
  await context.close();
}
await browser.close();
await writeFile(`${output}/report-${phase}.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify({phase,hashes,results},null,2));
