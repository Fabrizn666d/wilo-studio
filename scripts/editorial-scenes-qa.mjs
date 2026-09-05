import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const output = "artifacts/visual/editorial-scenes";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe" });
const results = [];
for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto("http://localhost:3000/#audiovisual", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("#audiovisual");
  for (const id of ["audiovisual", "proceso", "tecnologia", "store"]) {
    await page.evaluate((id) => { window.location.hash = id; }, id);
    if (viewport.width >= 1024) {
      await page.waitForFunction((id) => document.getElementById(id)?.dataset.fullpageActive === "true", id, { timeout: 15000 });
    } else {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(2500);
    const section = page.locator(`#${id}`);
    await section.screenshot({ path: `${output}/${id}-${viewport.width}.png` });
    const metrics = await section.evaluate((section) => {
      const r = section.getBoundingClientRect();
      const images = [...section.querySelectorAll("img")];
      const last = section.querySelector("[class*='sceneFooter'],[class*='storeBanner'],[class*='closing']")?.getBoundingClientRect();
      return {
        documentOverflow: document.documentElement.scrollWidth - innerWidth,
        height: Math.round(r.height),
        bottomContentInside: last ? last.bottom <= r.bottom + 1 : true,
        font: getComputedStyle(section.querySelector("h2")).fontFamily,
        missingImages: images.filter((img) => !img.complete || !img.naturalWidth).map((img) => img.currentSrc),
        processEntered: section.getAttribute("data-process-entered"),
      };
    });
    results.push({ id, viewport, metrics, errors: [...errors] });
  }
  await context.close();
}
await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
