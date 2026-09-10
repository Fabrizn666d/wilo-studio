import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
const browserPath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:/Users/FAbri/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath: browserPath });
const results = [];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, hasTouch: viewport.width < 600, isMobile: viewport.width < 600 });
  await context.addInitScript(() => {
    sessionStorage.setItem("wilo-loader-seen", "skip");
    localStorage.setItem("wilo_locale", "es");
  });
  const page = await context.newPage();
  const errors = [];
  const failedResponses = [];
  let currentStep = 0;
  let phase = "steps";
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url(), method: response.request().method(), currentStep, phase }); });
  await page.goto(`${baseURL}/cotizar?service=webs-corporativas`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => document.documentElement.dataset.locale === "es");

  const steps = [];
  for (let step = 1; step <= 8; step += 1) {
    currentStep = step;
    const progress = page.locator(".wizard-progress");
    await progress.waitFor({ state: "visible" });
    steps.push(await progress.getAttribute("aria-label"));
    if (step === 8) break;
    const fieldset = page.locator(".quote-wizard fieldset");
    if (step === 1) {
      const selected = fieldset.locator("button[aria-pressed='true']");
      if (!await selected.count()) await fieldset.locator("button").first().click();
    } else if (step <= 6) {
      await fieldset.locator("button").first().click();
    } else {
      const fields = fieldset.locator('input:not([type="checkbox"])');
      await fields.nth(0).fill("QA Wilo");
      await fields.nth(1).fill("Wilo Studio QA");
      await fields.nth(2).fill("999999999");
      await fieldset.locator('input[type="email"]').fill("qa@example.com");
      await fieldset.locator('input[type="checkbox"]').check();
    }
    const continueButton = page.getByRole("button", { name: /Continuar/ });
    if (await continueButton.isDisabled()) throw new Error(`Paso ${step}: Continuar permanece deshabilitado`);
    await continueButton.click();
  }

  const summary = await page.locator(".quote-summary").innerText();
  const draftBeforeReload = await page.evaluate(() => sessionStorage.getItem("wilo-quote-draft-v2"));
  await page.waitForTimeout(500);
  phase = "reload";
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.locale === "es");
  await page.waitForFunction(() => document.querySelector(".wizard-progress")?.getAttribute("aria-label") === "Paso 8 de 8");
  const restoredStep = await page.locator(".wizard-progress").getAttribute("aria-label");
  results.push({
    viewport,
    steps,
    summaryReady: summary.includes("Webs corporativas") && summary.includes("QA Wilo"),
    draftPersisted: Boolean(draftBeforeReload),
    restoredStep,
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    failedResponses,
    errors,
  });
  await context.close();
}

await browser.close();
const failures = results.filter((result) =>
  result.steps.join("|") !== Array.from({ length: 8 }, (_, index) => `Paso ${index + 1} de 8`).join("|")
  || !result.summaryReady
  || !result.draftPersisted
  || result.restoredStep !== "Paso 8 de 8"
  || result.overflow > 2
  || result.errors.length
);
console.log(JSON.stringify({ results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
