import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
const output = "artifacts/visual/responsive-matrix";
const browserPath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:/Users/FAbri/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";

const homeViewports = [
  [1920, 1080], [1600, 900], [1440, 900], [1366, 768],
  [1024, 768], [834, 1112], [768, 1024],
  [430, 932], [412, 915], [390, 844], [375, 812], [360, 800],
].map(([width, height]) => ({ width, height }));

const routeViewports = [
  { width: 1440, height: 900 },
  { width: 834, height: 1112 },
  { width: 390, height: 844 },
];

const routes = [
  "/tienda",
  "/cotizar",
  "/events",
  "/education",
  "/nosotros",
  "/servicios/produccion-audiovisual",
  "/contacto",
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: browserPath });
const results = [];

async function inspect(path, viewport, capture = false) {
  const context = await browser.newContext({
    viewport,
    hasTouch: viewport.width < 900,
    isMobile: viewport.width < 600,
  });
  await context.addInitScript(() => {
    sessionStorage.setItem("wilo-loader-seen", "skip");
    localStorage.setItem("wilo_locale", "es");
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const response = await page.goto(`${baseURL}${path}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("main", { timeout: 30_000 });
  await page.waitForFunction(() => document.documentElement.dataset.locale === "es", null, { timeout: 30_000 });
  await page.waitForTimeout(path === "/" ? 1_200 : 700);

  if (path === "/") {
    await page.locator("#footer").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  }

  const metrics = await page.evaluate(() => {
    const allImages = [...document.images];
    const headings = [...document.querySelectorAll("main h1, main h2")];
    const clippedHeadings = headings.filter((heading) => {
      const rect = heading.getBoundingClientRect();
      const style = getComputedStyle(heading);
      return Number.parseFloat(style.opacity) > 0.05
        && style.visibility !== "hidden"
        && rect.width > 2
        && rect.height > 2
        && (rect.left < -2 || rect.right > innerWidth + 2);
    }).map((heading) => heading.textContent?.trim());
    const footer = document.querySelector("#footer");
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      main: Boolean(document.querySelector("main")),
      primaryHeading: document.querySelector("main h1, main h2")?.textContent?.trim() || "",
      clippedHeadings,
      brokenImages: allImages.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      fullpageMode: document.documentElement.dataset.fullpageMode || null,
      footerVisible: footer ? footer.getBoundingClientRect().height > 0 : false,
    };
  });

  if (capture) {
    const safePath = path === "/" ? "home" : path.replaceAll("/", "-").replace(/^-/, "");
    await page.screenshot({ path: `${output}/${safePath}-${viewport.width}.png`, fullPage: path !== "/", animations: "disabled" });
  }

  const result = { path, viewport, status: response?.status() ?? null, ...metrics, errors };
  results.push(result);
  await context.close();
  return result;
}

for (const viewport of homeViewports) {
  await inspect("/", viewport, [1440, 834, 390, 360].includes(viewport.width));
}

for (const viewport of routeViewports) {
  for (const route of routes) {
    await inspect(route, viewport, route === "/tienda" || route === "/cotizar");
  }
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify(results, null, 2));

const failures = results.filter((result) =>
  result.status !== 200
  || !result.main
  || !result.primaryHeading
  || result.overflow > 2
  || result.clippedHeadings.length
  || result.brokenImages.length
  || result.errors.length
  || (result.path === "/" && !result.footerVisible)
);

const summary = {
  checks: results.length,
  homeViewports: homeViewports.length,
  routeChecks: routeViewports.length * routes.length,
  maximumOverflow: Math.max(...results.map((result) => result.overflow)),
  failures,
};
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
