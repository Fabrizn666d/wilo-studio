import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.LAB_QA_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/wilo-lab";

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });

async function openPage(viewport) {
  const context = await browser.newContext({
    hasTouch: Boolean(viewport.touch),
    isMobile: Boolean(viewport.touch),
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  return { context, errors, page };
}

const desktop = await openPage({ width: 1440, height: 900 });
await desktop.page.goto(`${baseUrl}/#servicios`, { waitUntil: "domcontentloaded", timeout: 60_000 });
await desktop.page.waitForFunction(() => document.querySelector("#servicios")?.getAttribute("data-fullpage-active") === "true");
const activation = desktop.page.locator("#lab [data-testid='lab-activation']");
const activationBeforeScroll = await activation.count();
await desktop.page.mouse.move(900, 500);
await desktop.page.mouse.wheel(0, 320);
await activation.waitFor({ state: "attached", timeout: 2_000 });
await desktop.page.waitForTimeout(620);
const introSnapshot = await activation.evaluate((element) => {
  const flask = element.querySelector("svg");
  const wordmark = element.querySelector("[class*='activationWordmark']");
  const rect = element.getBoundingClientRect();
  return {
    coversUsefulViewport: rect.width >= document.documentElement.clientWidth - 20 && rect.bottom >= innerHeight - 2 && rect.top > 0,
    flaskVisible: Boolean(flask && getComputedStyle(flask).visibility !== "hidden"),
    rect: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.right), Math.round(rect.bottom), document.documentElement.clientWidth, innerHeight],
    wordmark: wordmark?.textContent?.replace(/\s+/g, " ").trim() ?? null,
  };
});
await desktop.page.screenshot({ animations: "allow", path: `${output}/lab-intro-desktop.png` });
await activation.waitFor({ state: "detached", timeout: 4_000 });
await desktop.page.waitForFunction(() => document.querySelector("#lab")?.getAttribute("data-fullpage-active") === "true");
await desktop.page.waitForFunction(() => document.querySelector("#lab [data-lab-visible]")?.getAttribute("data-lab-visible") === "true");
await desktop.page.waitForTimeout(1_000);
const desktopFinal = await desktop.page.locator("#lab").evaluate((section) => ({
  benefitsRemoved: !/Interfaces reales|Flujos inteligentes|Soluciones a medida/.test(section.textContent || ""),
  eyebrowRemoved: !/05\s*[—-]\s*WILO LAB/.test(section.textContent || ""),
  labActive: section.getAttribute("data-fullpage-active") === "true",
  scrollTop: Math.round(scrollY),
  statementVisible: Boolean([...section.querySelectorAll("h3")].find((element) => element.textContent?.includes("VENDEMOS SOFTWARE"))),
}));
await desktop.page.screenshot({ path: `${output}/lab-after-intro-desktop.png` });

await desktop.page.evaluate(() => window.dispatchEvent(new CustomEvent("wilo:fullpage-request", { detail: { target: "servicios", mode: "none" } })));
await desktop.page.waitForFunction(() => document.querySelector("#servicios")?.getAttribute("data-fullpage-active") === "true");
await desktop.page.waitForTimeout(1_700);
await desktop.page.evaluate(() => window.dispatchEvent(new CustomEvent("wilo:fullpage-request", { detail: { target: "lab", mode: "none" } })));
await desktop.page.waitForTimeout(300);
const activationOnReturn = await activation.count();

const mobile = await openPage({ width: 390, height: 844, touch: true });
await mobile.page.goto(`${baseUrl}/#lab`, { waitUntil: "domcontentloaded", timeout: 60_000 });
await mobile.page.locator("#lab").evaluate((section) => section.scrollIntoView({ behavior: "instant", block: "start" }));
const mobileActivation = mobile.page.locator("#lab [data-testid='lab-activation']");
await mobileActivation.waitFor({ state: "attached", timeout: 4_000 });
await mobileActivation.evaluate((element) => element.getAnimations({ subtree: true }).forEach((animation) => {
  animation.pause();
  animation.currentTime = 600;
}));
await mobile.page.screenshot({ animations: "allow", path: `${output}/lab-intro-mobile.png` });
await mobileActivation.evaluate((element) => element.getAnimations({ subtree: true }).forEach((animation) => animation.play()));
await mobileActivation.waitFor({ state: "detached", timeout: 3_000 });
const mobileRevealed = await mobile.page.locator("#lab [data-lab-visible]").getAttribute("data-lab-visible");

console.log(JSON.stringify({
  activationBeforeScroll,
  activationOnReturn,
  desktopErrors: desktop.errors,
  desktopFinal,
  introSnapshot,
  mobileErrors: mobile.errors,
  mobileRevealed,
}, null, 2));

await desktop.context.close();
await mobile.context.close();
await browser.close();
