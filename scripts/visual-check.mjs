import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.VISUAL_BASE_URL || "http://localhost:3007";
const executablePath = "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath });
const issues = [];

async function inspect(context, path, name, options = {}) {
  const page = await context.newPage();
  if (!options.loader) {
    await page.addInitScript(() => window.sessionStorage.setItem("wilo-loader-seen", "skip"));
  }
  page.on("console", (message) => {
    if (message.type() === "error") issues.push(`${name} console: ${message.text()}`);
  });
  page.on("pageerror", (error) => issues.push(`${name} pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) issues.push(`${name} HTTP ${response.status()}: ${response.url()}`);
  });
  await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(1_200);
  if (options.loader) await page.waitForTimeout(2_800);
  if (options.scroll) {
    await page.evaluate(async () => {
      const step = Math.max(450, window.innerHeight * 0.8);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
  }
  const audit = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelectorAll("h1").length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyText: document.body.innerText.length,
    lang: document.documentElement.lang,
    duplicateIds: Array.from(document.querySelectorAll("[id]"))
      .map((element) => element.id)
      .filter((id, index, ids) => ids.indexOf(id) !== index),
    missingAlt: document.querySelectorAll("img:not([alt])").length,
    unlabeledControls: Array.from(document.querySelectorAll("button, input:not([type='hidden']), select, textarea"))
      .filter((element) => {
        if (!(element instanceof HTMLElement) || element.closest("[aria-hidden='true']")) return false;
        const label = element.closest("label")?.textContent?.trim();
        const name = element.getAttribute("aria-label") || element.getAttribute("aria-labelledby") || label || element.textContent?.trim();
        return !name;
      }).length,
  }));
  if (audit.h1 !== 1) issues.push(`${name}: h1=${audit.h1}`);
  if (audit.overflow > 2) issues.push(`${name}: horizontal overflow=${audit.overflow}px`);
  if (audit.bodyText < 120) issues.push(`${name}: too little visible text (${audit.bodyText})`);
  if (audit.lang !== "es") issues.push(`${name}: unexpected html lang=${audit.lang}`);
  if (audit.duplicateIds.length) issues.push(`${name}: duplicate ids=${audit.duplicateIds.join(",")}`);
  if (audit.missingAlt) issues.push(`${name}: images without alt=${audit.missingAlt}`);
  if (audit.unlabeledControls) issues.push(`${name}: unlabeled controls=${audit.unlabeledControls}`);
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: options.fullPage ?? false });
  await page.close();
  return audit;
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const results = [];
results.push(["home-desktop", await inspect(desktop, "/", "home-desktop", { loader: true, scroll: true, fullPage: true })]);
results.push(["store-desktop", await inspect(desktop, "/tienda", "store-desktop", { scroll: true, fullPage: true })]);
results.push(["contact-desktop", await inspect(desktop, "/contacto", "contact-desktop", { scroll: true, fullPage: true })]);
results.push(["services-desktop", await inspect(desktop, "/servicios", "services-desktop", { scroll: true, fullPage: true })]);
results.push(["audiovisual-desktop", await inspect(desktop, "/servicios/produccion-audiovisual", "audiovisual-desktop", { scroll: true, fullPage: true })]);
results.push(["infrastructure-events-desktop", await inspect(desktop, "/servicios/infraestructura-eventos", "infrastructure-events-desktop", { scroll: true, fullPage: true })]);
results.push(["projects-desktop", await inspect(desktop, "/proyectos", "projects-desktop", { scroll: true, fullPage: true })]);
results.push(["project-desktop", await inspect(desktop, "/proyectos/tecnova-peru", "project-desktop", { scroll: true, fullPage: true })]);
results.push(["about-desktop", await inspect(desktop, "/nosotros", "about-desktop", { scroll: true, fullPage: true })]);
results.push(["clients-desktop", await inspect(desktop, "/clientes", "clients-desktop", { scroll: true, fullPage: true })]);
results.push(["education-desktop", await inspect(desktop, "/education", "education-desktop", { scroll: true, fullPage: true })]);
results.push(["events-desktop", await inspect(desktop, "/events", "events-desktop", { scroll: true, fullPage: true })]);
results.push(["express-desktop", await inspect(desktop, "/express", "express-desktop", { scroll: true, fullPage: true })]);
await desktop.close();

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
results.push(["home-mobile", await inspect(mobile, "/", "home-mobile", { loader: true, scroll: true, fullPage: true })]);
results.push(["store-mobile", await inspect(mobile, "/tienda", "store-mobile", { scroll: true, fullPage: true })]);
results.push(["checkout-mobile", await inspect(mobile, "/checkout", "checkout-mobile", { scroll: true, fullPage: true })]);
results.push(["projects-mobile", await inspect(mobile, "/proyectos", "projects-mobile", { scroll: true, fullPage: true })]);
results.push(["audiovisual-mobile", await inspect(mobile, "/servicios/produccion-audiovisual", "audiovisual-mobile", { scroll: true, fullPage: true })]);
results.push(["about-mobile", await inspect(mobile, "/nosotros", "about-mobile", { scroll: true, fullPage: true })]);
results.push(["education-mobile", await inspect(mobile, "/education", "education-mobile", { scroll: true, fullPage: true })]);
results.push(["events-mobile", await inspect(mobile, "/events", "events-mobile", { scroll: true, fullPage: true })]);
await mobile.close();
await browser.close();

for (const [name, result] of results) console.log(name, JSON.stringify(result));
if (issues.length) {
  console.error("ISSUES");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
}
