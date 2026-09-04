import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.VISUAL_BASE_URL || "http://127.0.0.1:3007";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/home-sections";

const targets = [
  ["audiovisual", "#audiovisual"],
  ["education", "#education"],
  ["express", "#express"],
  ["events", "#events"],
  ["about", "#nosotros"],
  ["contact", "#contacto-home"],
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });

async function capture(viewport, suffix) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => window.sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });

  for (const [name, selector] of targets) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await section.locator("img").evaluateAll((images) => Promise.all(images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })));
    await page.waitForTimeout(450);
    await section.screenshot({ path: `${output}/${name}-${suffix}.png` });
  }

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  await context.close();
  return { suffix, overflow: dimensions.scrollWidth - dimensions.clientWidth, errors };
}

const results = [
  await capture({ width: 1672, height: 941 }, "desktop"),
  await capture({ width: 390, height: 844 }, "mobile"),
];

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.overflow > 2 || result.errors.length)) process.exitCode = 1;
