import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
const routes = [
  "/", "/proyectos", "/nosotros", "/education", "/events", "/tienda", "/checkout", "/cotizar", "/contacto",
  "/privacidad", "/terminos", "/libro-de-reclamaciones", "/medios-de-pago", "/promos", "/referidos",
  "/servicios/produccion-audiovisual", "/portafolio",
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
await context.addCookies([{ name: "wilo_locale", value: "es", domain: "localhost", path: "/" }]);
const page = await context.newPage();
const copy = new Set();

for (const route of routes) {
  await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(350);
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
  for (const value of values) {
    if (value.length < 2 || value.length > 500 || !/\p{L}/u.test(value)) continue;
    if (/^(https?:|\/|[\w-]+\.(webp|png|jpe?g|svg))/.test(value)) continue;
    copy.add(value);
  }
}

console.log(JSON.stringify([...copy].sort((a, b) => a.localeCompare(b, "es")), null, 2));
await browser.close();
