import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
const locales = [
  { code: "en", label: "English", lang: "en", work: "WORK", about: "OUR LIMIT" },
  { code: "de", label: "Deutsch", lang: "de", work: "ARBEITEN", about: "UNSERE GRENZE" },
  { code: "zh", label: "中文", lang: "zh-CN", work: "作品", about: "我们的边界" },
  { code: "ja", label: "日本語", lang: "ja", work: "実績", about: "私たちの限界" },
  { code: "qu", label: "Runasimi", lang: "qu-PE", work: "LLAMK'AYKUNA", about: "ÑUQAYKUPA QURPANQA" },
  { code: "pt", label: "Português", lang: "pt-BR", work: "TRABALHOS", about: "NOSSO LIMITE" },
  { code: "es", label: "Español", lang: "es-PE", work: "TRABAJOS", about: "NUESTRO LÍMITE" },
];

await mkdir("artifacts/visual/i18n", { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
await context.addInitScript(() => {
  window.sessionStorage.setItem("wilo-loader-seen", "skip");
  if (!window.localStorage.getItem("wilo_locale")) window.localStorage.setItem("wilo_locale", "es");
});
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${baseURL}/`, { waitUntil: "networkidle", timeout: 60_000 });
for (const locale of locales) {
  const trigger = page.locator('button[aria-haspopup="listbox"]').first();
  await trigger.click();
  await page.getByRole("option", { name: new RegExp(`^${locale.label}`) }).click();
  await page.waitForFunction((lang) => document.documentElement.lang === lang, locale.lang);
  await page.waitForFunction((code) => window.localStorage.getItem("wilo_locale") === code, locale.code);
  await page.waitForFunction(({ work, about }) => {
    const workText = document.querySelector("#work-title")?.textContent ?? "";
    const sectionText = document.querySelector("#sobre-wilo")?.textContent ?? "";
    return workText.includes(work) && sectionText.includes(about);
  }, { work: locale.work, about: locale.about });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) throw new Error(`${locale.code}: overflow horizontal de ${overflow}px en Home`);
}

await page.getByRole("option").count().catch(() => 0);
await page.goto(`${baseURL}/tienda`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForFunction(() => document.documentElement.lang === "es-PE");
const spanishStore = (await page.locator("main").innerText()).toLocaleLowerCase();
if (!spanishStore.includes("tienda oficial wilo")) throw new Error("La persistencia a español falló en /tienda");

const trigger = page.locator('button[aria-haspopup="listbox"]').first();
await trigger.click();
await page.getByRole("option", { name: /^Deutsch/ }).click();
await page.waitForFunction(() => document.documentElement.lang === "de");
await page.waitForTimeout(600);
const germanStore = (await page.locator("main").innerText()).toLocaleLowerCase();
if (germanStore.includes("tienda oficial wilo") || !germanStore.includes("offizieller wilo-shop")) throw new Error("El contenido de /tienda no cambió a alemán");
await page.screenshot({ path: "artifacts/visual/i18n/store-de-1440.png", fullPage: true });

await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => document.documentElement.lang === "de");
if ((await page.locator('button[aria-haspopup="listbox"]').first().innerText()).includes("DE") === false) throw new Error("El selector no conservó DE tras recargar");

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${baseURL}/`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForFunction(() => document.documentElement.lang === "de");
await page.waitForTimeout(500);
const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (mobileOverflow > 2) throw new Error(`DE mobile: overflow horizontal de ${mobileOverflow}px`);
await page.screenshot({ path: "artifacts/visual/i18n/home-de-390.png", fullPage: false });

if (errors.length) throw new Error(`Errores de navegador:\n${errors.join("\n")}`);
console.log(JSON.stringify({ locales: locales.map(({ code }) => code), persistence: true, storeTranslated: true, desktopOverflow: 0, mobileOverflow, errors }, null, 2));
await browser.close();
