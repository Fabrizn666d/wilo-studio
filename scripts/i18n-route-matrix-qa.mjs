import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
const output = "artifacts/visual/i18n/routes";
const browserPath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:/Users/FAbri/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const locales = [
  { code: "es", lang: "es-PE", option: 0 },
  { code: "en", lang: "en", option: 1 },
  { code: "de", lang: "de", option: 2 },
  { code: "zh", lang: "zh-CN", option: 3 },
  { code: "ja", lang: "ja", option: 4 },
  { code: "qu", lang: "qu-PE", option: 5 },
  { code: "pt", lang: "pt-BR", option: 6 },
];
const routes = ["/", "/nosotros", "/tienda", "/cotizar", "/events", "/education"];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: browserPath });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
await context.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
const page = await context.newPage();
const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") browserErrors.push(message.text());
});

async function selectLocale(locale) {
  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector('button[aria-haspopup="listbox"]');
  const trigger = page.locator('button[aria-haspopup="listbox"]').first();
  await trigger.click();
  await page.getByRole("option").nth(locale.option).click();
  await page.waitForFunction(({ code, lang }) =>
    localStorage.getItem("wilo_locale") === code && document.documentElement.lang === lang,
  locale);
}

async function readRoute(route, locale) {
  const response = await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("main");
  await page.waitForFunction((lang) => document.documentElement.lang === lang, locale.lang);
  await page.waitForFunction((code) => document.documentElement.dataset.locale === code, locale.code);
  await page.waitForTimeout(250);
  return page.evaluate(({ route, code }) => {
    const main = document.querySelector("main");
    const text = main?.innerText.replace(/\s+/g, " ").trim() || "";
    const images = [...document.images];
    return {
      route,
      locale: code,
      lang: document.documentElement.lang,
      statusText: text.slice(0, 220),
      text,
      textLength: text.length,
      heading: main?.querySelector("h1,h2")?.textContent?.replace(/\s+/g, " ").trim() || "",
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
    };
  }, { route, code: locale.code }).then((data) => ({ ...data, status: response?.status() ?? null }));
}

const spanish = {};
await selectLocale(locales[0]);
for (const route of routes) spanish[route] = (await readRoute(route, locales[0])).text;

const results = [];
for (const locale of locales) {
  await selectLocale(locale);
  for (const route of routes) {
    const result = await readRoute(route, locale);
    result.translated = locale.code === "es" || result.text !== spanish[route];
    delete result.text;
    results.push(result);
  }
}

await context.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ja-JP" });
await mobileContext.addInitScript(() => {
  sessionStorage.setItem("wilo-loader-seen", "skip");
  localStorage.setItem("wilo_locale", "ja");
  document.cookie = "wilo_locale=ja; path=/; max-age=31536000; samesite=lax";
});
const mobile = await mobileContext.newPage();
await mobile.goto(`${baseURL}/education`, { waitUntil: "domcontentloaded", timeout: 60_000 });
await mobile.waitForFunction(() => document.documentElement.lang === "ja");
await mobile.waitForTimeout(500);
const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await mobile.screenshot({ path: `${output}/education-ja-390.png`, fullPage: true, animations: "disabled" });
await mobileContext.close();
await browser.close();

const failures = results.filter((result) =>
  result.status !== 200
  || result.lang !== locales.find((locale) => locale.code === result.locale)?.lang
  || !result.heading
  || !result.translated
  || result.overflow > 2
  || result.brokenImages.length
);
if (mobileOverflow > 2) failures.push({ route: "/education", locale: "ja-mobile", overflow: mobileOverflow });
if (browserErrors.length) failures.push({ browserErrors });

await writeFile(`${output}/report.json`, JSON.stringify({ results, mobileOverflow, browserErrors, failures }, null, 2));
console.log(JSON.stringify({ checks: results.length, routes: routes.length, locales: locales.map(({ code }) => code), mobileOverflow, browserErrors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
