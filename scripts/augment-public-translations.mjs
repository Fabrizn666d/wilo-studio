import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
const targets = { en: "en", de: "de", zh: "zh-CN", ja: "ja", qu: "qu", pt: "pt" };
const separator = "|||WILO_SPLIT_9F3|||";

function eligible(value) {
  if (value.length < 2 || value.length > 500 || !/\p{L}/u.test(value)) return false;
  if (/^(https?:|\/|[\w-]+\.(webp|png|jpe?g|svg))/i.test(value)) return false;
  if (/^[\d\s.,+%/$€£:-]+$/.test(value) || /^[A-Z]{1,3}$/.test(value)) return false;
  return true;
}

async function collect(page, copy) {
  await page.waitForTimeout(180);
  const values = await page.evaluate(() => {
    const output = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, noscript, [data-no-i18n], [aria-hidden='true']")) continue;
      const value = node.nodeValue?.replace(/\s+/g, " ").trim();
      if (value) output.push(value);
    }
    for (const element of document.querySelectorAll("[placeholder], [aria-label], [title], img[alt]")) {
      for (const attribute of ["placeholder", "aria-label", "title", "alt"]) {
        const value = element.getAttribute(attribute)?.replace(/\s+/g, " ").trim();
        if (value) output.push(value);
      }
    }
    return output;
  });
  for (const value of values) if (eligible(value)) copy.add(value);
}

async function translateBatch(batch, target, attempt = 1) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.search = new URLSearchParams({ client: "gtx", sl: "es", tl: target, dt: "t", q: batch.join(separator) }).toString();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const translated = payload[0].map((item) => item[0]).join("");
    const values = translated.split(separator);
    if (values.length === batch.length) return values;
    if (batch.length === 1) return [translated];
    const middle = Math.ceil(batch.length / 2);
    return [...await translateBatch(batch.slice(0, middle), target), ...await translateBatch(batch.slice(middle), target)];
  } catch (error) {
    if (attempt >= 4) throw error;
    await new Promise((resolve) => setTimeout(resolve, attempt * 600));
    return translateBatch(batch, target, attempt + 1);
  }
}

function batchesFor(copy) {
  const batches = [];
  for (let index = 0; index < copy.length; index += 14) batches.push(copy.slice(index, index + 14));
  return batches;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
await context.addInitScript(() => {
  window.sessionStorage.setItem("wilo-loader-seen", "skip");
  window.localStorage.setItem("wilo_locale", "es");
});
const page = await context.newPage();
const copy = new Set();

await page.goto(`${baseURL}/tienda`, { waitUntil: "networkidle" });
await page.locator(".product-card button").first().click();
await collect(page, copy);

await page.goto(`${baseURL}/checkout`, { waitUntil: "networkidle" });
await collect(page, copy);
await page.getByRole("button", { name: "Factura", exact: true }).click();
await page.getByRole("button", { name: /Yape, Plin o transferencia/ }).click();
await collect(page, copy);

await page.goto(`${baseURL}/tienda/adobe-creative-cloud`, { waitUntil: "networkidle" });
await collect(page, copy);

await page.evaluate(() => window.sessionStorage.removeItem("wilo-quote-draft-v2"));
await page.goto(`${baseURL}/cotizar`, { waitUntil: "networkidle" });
for (let step = 1; step <= 8; step += 1) {
  await collect(page, copy);
  if (step === 8) break;
  const fieldset = page.locator(".quote-wizard fieldset");
  if (step <= 6) await fieldset.locator("button").first().click();
  if (step === 7) {
    await fieldset.locator('input:not([type="checkbox"])').nth(0).fill("QA Wilo");
    await fieldset.locator('input:not([type="checkbox"])').nth(1).fill("Wilo QA");
    await fieldset.locator('input:not([type="checkbox"])').nth(2).fill("999999999");
    await fieldset.locator('input[type="email"]').fill("qa@example.com");
    await fieldset.locator('input[type="checkbox"]').check();
  }
  await page.getByRole("button", { name: /Continuar/ }).click();
}

await page.goto(`${baseURL}/tienda`, { waitUntil: "networkidle" });
await page.getByRole("textbox", { name: "Buscar productos" }).fill("producto-inexistente-qa");
await collect(page, copy);
await browser.close();

const existingSpanish = JSON.parse(await readFile(new URL("../messages/content.es.json", import.meta.url), "utf8"));
const missing = [...copy].filter((phrase) => !(phrase in existingSpanish)).sort((a, b) => a.localeCompare(b, "es"));
console.log(`Estados dinámicos: ${copy.size} textos; ${missing.length} nuevos.`);
if (!missing.length) process.exit(0);

for (const phrase of missing) existingSpanish[phrase] = phrase;
await writeFile(new URL("../messages/content.es.json", import.meta.url), `${JSON.stringify(existingSpanish, null, 2)}\n`, "utf8");

const batches = batchesFor(missing);
for (const [locale, target] of Object.entries(targets)) {
  const dictionary = JSON.parse(await readFile(new URL(`../messages/content.${locale}.json`, import.meta.url), "utf8"));
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const values = await translateBatch(batch, target);
    batch.forEach((source, sourceIndex) => { dictionary[source] = values[sourceIndex].trim(); });
    process.stdout.write(`\r${locale.toUpperCase()} ${index + 1}/${batches.length}`);
  }
  await writeFile(new URL(`../messages/content.${locale}.json`, import.meta.url), `${JSON.stringify(dictionary, null, 2)}\n`, "utf8");
  process.stdout.write("\n");
}
