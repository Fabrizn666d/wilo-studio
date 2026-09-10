import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "artifacts/visual/store-checkout";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Users/FAbri/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe",
});
const results = [];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, hasTouch: viewport.width < 800, isMobile: viewport.width < 800 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("http://127.0.0.1:3000/tienda", { waitUntil: "networkidle", timeout: 60_000 });
  const cards = page.locator(".catalog-grid article");
  await cards.first().waitFor({ state: "visible" });
  await page.screenshot({ path: `${output}/catalog-${viewport.width}.png`, fullPage: true, animations: "disabled" });
  const productCount = await cards.count();
  const firstAdd = page.locator(".catalog-grid").getByRole("button", { name: /agregar|carrito/i }).first();
  await firstAdd.click();
  await page.getByRole("link", { name: /continuar al checkout/i }).click();
  await page.waitForURL(/\/checkout/);
  await page.waitForLoadState("networkidle");
  await page.locator("#promo-code").fill("WILO10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await page.locator(".coupon-box p.success").waitFor({ state: "visible" });
  await page.screenshot({ path: `${output}/checkout-${viewport.width}.png`, fullPage: true, animations: "disabled" });
  results.push({
    viewport,
    productCount,
    couponMessage: await page.locator(".coupon-box p.success").textContent(),
    whatsappOption: await page.getByRole("button", { name: /finalizar por whatsapp/i }).count(),
    deliveryFields: await page.locator("input[name='department'], input[name='province'], input[name='district'], input[name='address']").count(),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    brokenImages: await page.locator("img").evaluateAll((images) => images.filter((image) => image.complete && !image.naturalWidth).map((image) => image.getAttribute("src"))),
    errors,
  });
  await context.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
