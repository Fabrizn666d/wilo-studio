import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.ABOUT_WILO_QA_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/about-wilo";
const interactionsOnly = process.env.ABOUT_WILO_INTERACTIONS_ONLY === "1";
const viewports = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024, touch: true },
  { width: 430, height: 932, touch: true },
  { width: 390, height: 844, touch: true },
].filter((viewport) => !process.env.ABOUT_WILO_VIEWPORT || String(viewport.width) === process.env.ABOUT_WILO_VIEWPORT);

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const results = [];

async function prepare(viewport, reducedMotion = "no-preference") {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    hasTouch: viewport.touch || false,
    isMobile: viewport.touch || false,
    reducedMotion,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(`${baseUrl}/#sobre-wilo`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("#sobre-wilo", { timeout: 60_000 });
  await page.waitForFunction((desktop) => document.documentElement.classList.contains(
    desktop ? "wilo-fullpage" : "wilo-native-sections",
  ), viewport.width >= 1024 && !viewport.touch);
  if (viewport.width >= 1024 && !viewport.touch) {
    await page.waitForFunction(() => document.querySelector("#sobre-wilo")?.getAttribute("data-fullpage-active") === "true");
  } else {
    await page.locator("#sobre-wilo").scrollIntoViewIfNeeded();
  }
  await page.locator("#sobre-wilo img").first().waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(1_000);
  return { context, page, errors };
}

for (const viewport of interactionsOnly ? [] : viewports) {
  const { context, page, errors } = await prepare(viewport);
  const metrics = await page.locator("#sobre-wilo").evaluate((section) => {
    const rect = section.getBoundingClientRect();
    const frame = section.querySelector("[class*='frame']")?.getBoundingClientRect();
    const verticalEscapes = Array.from(section.querySelectorAll("*"))
      .flatMap((node) => {
        if (!(node instanceof HTMLElement)) return [];
        const style = getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden" || style.position === "fixed") return [];
        const child = node.getBoundingClientRect();
        const top = Math.round(rect.top - child.top);
        const bottom = Math.round(child.bottom - rect.bottom);
        return top > 2 || bottom > 2
          ? [{ className: typeof node.className === "string" ? node.className : node.tagName, top, bottom }]
          : [];
      })
      .sort((a, b) => Math.max(b.top, b.bottom) - Math.max(a.top, a.bottom))
      .slice(0, 6);

    return {
      mode: document.documentElement.classList.contains("wilo-fullpage") ? "fullpage" : "native",
      section: { top: Math.round(rect.top), height: Math.round(rect.height), scrollOverflow: section.scrollHeight - section.clientHeight },
      frame: frame ? { top: Math.round(frame.top), bottom: Math.round(frame.bottom), height: Math.round(frame.height) } : null,
      documentOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      verticalEscapes,
      copyOk: section.textContent?.includes("NUESTRO LÍMITE")
        && section.textContent.includes("DISEÑAMOS")
        && section.textContent.includes("Todo el Perú"),
      slideCount: section.querySelectorAll("[aria-label^='Mostrar']").length,
      statValues: Array.from(section.querySelectorAll("[data-stat-value]")).map((node) => node.textContent),
      reachCount: Array.from(section.querySelectorAll("strong")).filter((node) => ["Arequipa", "Todo el Perú", "Todo el mundo", "Ideas que funcionan"].includes(node.textContent || "")).length,
    };
  });
  await page.screenshot({ path: `${output}/about-${viewport.width}x${viewport.height}.png`, fullPage: false });
  results.push({ viewport, errors, metrics });
  await context.close();
}

if (!process.env.ABOUT_WILO_VIEWPORT || interactionsOnly) {
  const viewport = { width: 1440, height: 900 };
  const { context, page, errors } = await prepare(viewport);
  const active = () => page.locator("#sobre-wilo [aria-pressed='true']").getAttribute("aria-label");
  const initial = await active();
  await page.mouse.move(8, 86);
  await page.waitForTimeout(6_100);
  const autonomousAfter = await active();
  await page.getByRole("button", { name: "Ver capacidad siguiente" }).click();
  await page.waitForTimeout(850);
  const afterNext = await active();
  await page.locator("#sobre-wilo [role='region']").press("ArrowLeft");
  await page.waitForTimeout(850);
  const afterKeyboard = await active();
  const box = await page.locator("#sobre-wilo [role='region']").boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.58, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.5, { steps: 5 });
    await page.mouse.up();
  }
  await page.waitForTimeout(850);
  const afterDrag = await active();
  await page.waitForTimeout(750);
  const sideCard = await page.locator("#sobre-wilo [data-position='-1']").boundingBox();
  const sidePoint = sideCard ? { x: sideCard.x + sideCard.width * 0.06, y: sideCard.y + sideCard.height * 0.5 } : null;
  const sideHit = sidePoint ? await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("[data-slide-index], [data-side-hit]")?.getAttribute("aria-label"), sidePoint) : null;
  if (sidePoint) await page.mouse.click(sidePoint.x, sidePoint.y);
  await page.waitForTimeout(850);
  const afterSideClick = await active();
  await page.locator("#sobre-wilo [role='region']").hover();
  await page.mouse.wheel(72, 0);
  await page.waitForTimeout(850);
  const afterHorizontalWheel = await active();
  await page.locator("#sobre-wilo [role='region']").hover();
  const beforeHoverPause = await active();
  await page.waitForTimeout(6_800);
  const afterHoverPause = await active();
  results.push({ interactions: { initial, autonomousAfter, afterNext, afterKeyboard, afterDrag, sideCard, sidePoint, sideHit: sideHit ?? null, afterSideClick, afterHorizontalWheel, beforeHoverPause, afterHoverPause }, errors });
  await context.close();
}

if (!process.env.ABOUT_WILO_VIEWPORT || interactionsOnly) {
  const viewport = { width: 1440, height: 900 };
  const { context, page, errors } = await prepare(viewport, "reduce");
  const before = await page.locator("#sobre-wilo [aria-pressed='true']").getAttribute("aria-label");
  await page.waitForTimeout(6_800);
  const after = await page.locator("#sobre-wilo [aria-pressed='true']").getAttribute("aria-label");
  results.push({ reducedMotion: { before, after }, errors });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
