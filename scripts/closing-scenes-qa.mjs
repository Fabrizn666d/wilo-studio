import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'artifacts/visual/closing-scenes';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/FAbri/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const results = [];
for (const viewport of [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', hasTouch: viewport.width < 900, isMobile: viewport.width < 900 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem('wilo-loader-seen', 'skip'));
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1800);
  for (const id of ['internacional', 'contacto-home', 'footer']) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await section.screenshot({ path: `${output}/${id}-${viewport.width}.png`, animations: 'disabled' });
    results.push({ id, viewport, ...await section.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { height: el.clientHeight, overflow: document.documentElement.scrollWidth - innerWidth, font: getComputedStyle(el).fontFamily, clippedText: [...el.querySelectorAll('h2,h3,p,a')].filter(node => { const box = node.getBoundingClientRect(); return box.width && (box.bottom > rect.bottom + 3 || box.top < rect.top - 3); }).map(node => node.textContent), brokenImages: [...el.querySelectorAll('img')].filter(img => img.complete && !img.naturalWidth).map(img => img.src) };
    }) });
  }
  if (viewport.width === 1440) {
    await page.locator('#contacto-home').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /Arequipa, Perú.*Explorar en Google Maps/ }).click();
    results.push({ mapLoaded: await page.locator('#contacto-home iframe').count(), mapSource: await page.locator('#contacto-home iframe').getAttribute('src') });
  }
  results.push({ viewport, errors });
  await context.close();
}
await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
