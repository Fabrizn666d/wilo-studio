import { chromium } from "playwright";

const url = process.env.RUNTIME_SMOKE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Users/FAbri/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe",
});
const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
const page = await context.newPage();
const failures = [];
const errors = [];
page.on("requestfailed", (request) => failures.push({ url: request.url(), reason: request.failure()?.errorText }));
page.on("response", (response) => {
  if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() });
});
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: "artifacts/visual/runtime-smoke.png", fullPage: false });
const metrics = await page.evaluate(() => ({
  title: document.title,
  bodyBackground: getComputedStyle(document.body).backgroundColor,
  styleSheets: [...document.styleSheets].map((sheet) => sheet.href || "inline"),
  scriptCount: document.scripts.length,
  sectionCount: document.querySelectorAll("[data-fullpage-section]").length,
  heroHeight: document.querySelector("#inicio")?.getBoundingClientRect().height || 0,
  navigationPosition: getComputedStyle(document.querySelector("header") || document.body).position,
}));
console.log(JSON.stringify({ status: response?.status(), failures, errors, metrics }, null, 2));
await browser.close();
