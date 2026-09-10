import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.AV_QA_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/audiovisual";

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });

async function inspect(viewport, suffix) {
  const context = await browser.newContext({
    hasTouch: viewport.width < 700,
    isMobile: viewport.width < 700,
    viewport,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(`${baseUrl}/servicios/produccion-audiovisual`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.locator("#audiovisual").waitFor({ state: "visible" });
  await page.waitForTimeout(1_600);
  const metrics = await page.evaluate(() => {
    const hero = document.querySelector("#audiovisual");
    const title = hero?.querySelector("h1");
    const track = hero?.querySelector("[class*='filmTrack']");
    const rect = hero?.getBoundingClientRect();
    return {
      documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      filmAnimation: track ? getComputedStyle(track).animationName : "none",
      filmState: track ? getComputedStyle(track).animationPlayState : "missing",
      heroRect: rect ? [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)] : null,
      title: title?.textContent?.replace(/\s+/g, " ").trim(),
    };
  });
  await page.screenshot({ path: `${output}/hero-${suffix}.png`, fullPage: false, animations: "allow" });
  await context.close();
  return { errors, metrics };
}

const desktop = await inspect({ width: 1440, height: 900 }, "desktop");
const mobile = await inspect({ width: 430, height: 900 }, "mobile");

const homeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const homePage = await homeContext.newPage();
await homePage.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
await homePage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
const homeAudiovisualCount = await homePage.locator("#audiovisual").count();
await homeContext.close();
await browser.close();

const result = { desktop, homeAudiovisualCount, mobile };
console.log(JSON.stringify(result, null, 2));

if (
  desktop.errors.length
  || mobile.errors.length
  || desktop.metrics.documentOverflow
  || mobile.metrics.documentOverflow
  || desktop.metrics.filmState !== "running"
  || !desktop.metrics.title?.includes("UNA IDEA")
  || homeAudiovisualCount !== 0
) process.exitCode = 1;
