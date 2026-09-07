import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.ABOUT_WILO_QA_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/about-wilo";

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });

async function snapshot(page) {
  return page.locator("#sobre-wilo").evaluate((section) => {
    const styleOf = (selector) => {
      const node = section.querySelector(selector);
      if (!(node instanceof HTMLElement)) return null;
      const style = getComputedStyle(node);
      return { opacity: style.opacity, transform: style.transform, filter: style.filter, clipPath: style.clipPath };
    };
    return {
      y: Math.round(scrollY),
      active: section.getAttribute("data-active"),
      entered: section.getAttribute("data-entered"),
      opening: section.getAttribute("data-opening"),
      counted: section.getAttribute("data-counted"),
      stats: Array.from(section.querySelectorAll("[data-stat-value]"), (node) => node.textContent),
      eyebrow: styleOf("[class*='eyebrow']"),
      headline: styleOf("h2"),
      carousel: styleOf("[role='region']"),
      activeCard: styleOf("[data-position='0']"),
      nearCard: styleOf("[data-position='1']"),
      capability: styleOf("[class*='capabilityRail'] > div"),
      marquee: styleOf("[class*='clientMarquee']"),
      reach: styleOf("[class*='reachStrip'] > div"),
    };
  });
}

const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForFunction(() => document.documentElement.classList.contains("wilo-fullpage")
  && document.querySelector("#sobre-wilo")?.getAttribute("data-motion-ready") === "true");
await page.evaluate(() => scrollTo(0, 0));
const before = await snapshot(page);
await page.mouse.move(20, 120);
await page.mouse.wheel(0, 100);
await page.waitForFunction(() => document.querySelector("#sobre-wilo")?.getAttribute("data-entered") === "true");
const atEntry = await snapshot(page);
await page.waitForTimeout(520);
const revealed = await snapshot(page);
await page.waitForFunction(() => document.querySelector("#sobre-wilo")?.getAttribute("data-counted") === "true");
const countStart = await snapshot(page);
await page.waitForTimeout(260);
const countMiddle = await snapshot(page);
await page.waitForTimeout(1900);
const countFinal = await snapshot(page);
await page.screenshot({ path: `${output}/about-motion-final-1440x900.png`, fullPage: false });

await page.mouse.move(20, 120);
await page.mouse.wheel(0, -100);
await page.waitForTimeout(1800);
const afterExit = await snapshot(page);
await page.mouse.wheel(0, 100);
await page.waitForTimeout(1800);
const afterReentry = await snapshot(page);

await context.close();

const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
await reducedPage.goto(`${baseUrl}/#sobre-wilo`, { waitUntil: "domcontentloaded", timeout: 60_000 });
await reducedPage.waitForFunction(() => document.querySelector("#sobre-wilo")?.getAttribute("data-entered") === "true");
await reducedPage.waitForTimeout(100);
const reduced = await snapshot(reducedPage);
await reducedContext.close();

await browser.close();
console.log(JSON.stringify({ errors, before, atEntry, revealed, countStart, countMiddle, countFinal, afterExit, afterReentry, reduced }, null, 2));
