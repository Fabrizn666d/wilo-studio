import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
const routes = [
  "/", "/proyectos", "/nosotros", "/education", "/events", "/tienda", "/checkout", "/cotizar", "/contacto",
  "/privacidad", "/terminos", "/libro-de-reclamaciones", "/medios-de-pago", "/promos", "/referidos",
  "/servicios/produccion-audiovisual", "/portafolio",
];
const targets = { en: "en", de: "de", zh: "zh-CN", ja: "ja", qu: "qu", pt: "pt" };
const separator = "|||WILO_SPLIT_9F3|||";
const protectedCopy = new Set([
  "Wilo", "WILO", "Wilo Studio", "WILO STUDIO", "Wilo Lab", "Wilo Store", "Wilo Education", "Wilo Events", "Wilo Express",
  "Adobe", "Adobe Creative Cloud", "Microsoft", "Microsoft 365 Business Standard", "Windows 11 Pro", "Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Cloudflare", "Tailwind CSS", "GitHub", "Prisma", "Nginx", "SSL", "API", "CRM", "ERP", "SaaS", "WhatsApp", "Yape / Plin",
  "Tecnova Perú", "Global Norte", "Geoingenieros", "Reuse Tecnología", "IBEX Constructora", "Biciem Ultra Trail", "Dayun Perú", "Arequipa, Perú",
]);

function shouldTranslate(value) {
  if (protectedCopy.has(value)) return false;
  if (value.length < 2 || value.length > 500 || !/\p{L}/u.test(value)) return false;
  if (/^(https?:|\/|[\w-]+\.(webp|png|jpe?g|svg))/i.test(value)) return false;
  if (/^[\d\s.,+%/$€£:-]+$/.test(value)) return false;
  if (/^[A-Z]{1,3}$/.test(value)) return false;
  if (/^[a-zA-Z]+\.(tsx?|jsx?|css|json)$/.test(value)) return false;
  return true;
}

async function collectCopy() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  await context.addCookies([{ name: "wilo_locale", value: "es", domain: "localhost", path: "/" }]);
  const page = await context.newPage();
  const copy = new Set();
  for (const route of routes) {
    await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.evaluate(() => window.localStorage.setItem("wilo_locale", "es"));
    await page.waitForTimeout(250);
    const values = await page.evaluate(() => {
      const results = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style, noscript, [data-no-i18n], [aria-hidden='true']")) continue;
        const text = node.nodeValue?.replace(/\s+/g, " ").trim();
        if (text) results.push(text);
      }
      for (const element of document.querySelectorAll("[placeholder], [aria-label], [title], img[alt]")) {
        for (const attribute of ["placeholder", "aria-label", "title", "alt"]) {
          const text = element.getAttribute(attribute)?.replace(/\s+/g, " ").trim();
          if (text) results.push(text);
        }
      }
      return results;
    });
    for (const value of values) if (shouldTranslate(value)) copy.add(value);
  }
  await browser.close();
  return [...copy].sort((a, b) => a.localeCompare(b, "es"));
}

function batchesFor(copy) {
  const batches = [];
  let batch = [];
  let length = 0;
  for (const phrase of copy) {
    if (batch.length >= 16 || length + phrase.length + separator.length > 3200) {
      batches.push(batch);
      batch = [];
      length = 0;
    }
    batch.push(phrase);
    length += phrase.length + separator.length;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

async function translateBatch(batch, target, attempt = 1) {
  const joined = batch.join(separator);
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.search = new URLSearchParams({ client: "gtx", sl: "es", tl: target, dt: "t", q: joined }).toString();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const translated = payload[0].map((item) => item[0]).join("");
    const values = translated.split(separator);
    if (values.length !== batch.length) {
      if (batch.length === 1) return [translated];
      const middle = Math.ceil(batch.length / 2);
      return [
        ...await translateBatch(batch.slice(0, middle), target),
        ...await translateBatch(batch.slice(middle), target),
      ];
    }
    return values;
  } catch (error) {
    if (attempt >= 4) throw error;
    await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    return translateBatch(batch, target, attempt + 1);
  }
}

const copy = await collectCopy();
const batches = batchesFor(copy);
await mkdir(new URL("../messages/", import.meta.url), { recursive: true });
console.log(`Traduciendo ${copy.length} textos públicos en ${batches.length} lotes por idioma.`);

for (const [locale, target] of Object.entries(targets)) {
  const dictionary = {};
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const values = await translateBatch(batch, target);
    batch.forEach((source, sourceIndex) => { dictionary[source] = values[sourceIndex].trim(); });
    process.stdout.write(`\r${locale.toUpperCase()} ${index + 1}/${batches.length}`);
  }
  for (const phrase of protectedCopy) dictionary[phrase] = phrase;
  await writeFile(new URL(`../messages/content.${locale}.json`, import.meta.url), `${JSON.stringify(dictionary, null, 2)}\n`, "utf8");
  process.stdout.write("\n");
}

await writeFile(new URL("../messages/content.es.json", import.meta.url), `${JSON.stringify(Object.fromEntries(copy.map((phrase) => [phrase, phrase])), null, 2)}\n`, "utf8");
console.log("Diccionarios locales generados en /messages.");
