import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.HOME_AUDIT_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const captureScreenshots = process.env.HOME_AUDIT_SCREENSHOTS === "1";
const screenshotDirectory = "artifacts/visual/home-layout";

const viewports = [
  { name: "desktop-wide", width: 1920, height: 1080 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const selectors = [
  ["hero", "main > section:first-of-type"],
  ["about-wilo", "#sobre-wilo"],
  ["work", "#trabajos"],
  ["services", "#servicios"],
  ["lab", "#lab"],
  ["audiovisual", "#audiovisual"],
  ["process", "#proceso"],
  ["trust", "#proceso + section"],
  ["ecosystem", "#ecosistema"],
  ["about", "#nosotros"],
  ["contact", "#contacto-home"],
  ["footer", "#pie-de-pagina"],
];

const browser = await chromium.launch({ headless: true, executablePath });
const results = [];
if (captureScreenshots) await mkdir(screenshotDirectory, { recursive: true });

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => window.sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForFunction(() => document.documentElement.classList.contains(
    window.innerWidth >= 1024 ? "wilo-fullpage" : "wilo-native-sections",
  ));

  const audit = await page.evaluate((targets) => {
    const viewportWidth = document.documentElement.clientWidth;
    const sectionData = targets.map(([name, selector]) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) return { name, missing: true };
      const rect = element.getBoundingClientRect();
      const descendants = Array.from(element.querySelectorAll("*"));
      const escaped = descendants
        .filter((child) => child instanceof HTMLElement)
        .map((child) => {
          const childRect = child.getBoundingClientRect();
          return {
            tag: child.tagName.toLowerCase(),
            className: typeof child.className === "string" ? child.className.split(" ").slice(0, 2).join(".") : "",
            left: Math.round(childRect.left),
            right: Math.round(childRect.right),
            width: Math.round(childRect.width),
          };
        })
        .filter((child) => child.width > 1 && (child.left < -2 || child.right > viewportWidth + 2))
        .sort((a, b) => Math.max(-a.left, a.right - viewportWidth) - Math.max(-b.left, b.right - viewportWidth))
        .slice(-3);

      return {
        name,
        top: Math.round(rect.top + window.scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        ownOverflow: element.scrollWidth - element.clientWidth,
        escaped,
      };
    });

    return {
      viewportWidth,
      documentOverflow: Math.max(0, document.documentElement.scrollWidth - viewportWidth),
      pageHeight: document.documentElement.scrollHeight,
      sections: sectionData,
    };
  }, selectors);

  results.push({ viewport: viewport.name, errors, ...audit });
  if (captureScreenshots && ["desktop", "mobile"].includes(viewport.name)) {
    for (const [name, selector] of selectors) {
      const section = page.locator(selector);
      if (await section.count()) {
        await section.screenshot({ path: `${screenshotDirectory}/${name}-${viewport.name}.png` });
      }
    }
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
