import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.HOME_AUDIT_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";

const browser = await chromium.launch({ headless: true, executablePath });
const results = [];
const captureScreenshots = process.env.FULLPAGE_AUDIT_SCREENSHOTS === "1";
const screenshotDirectory = "artifacts/visual/fullpage";
if (captureScreenshots) await mkdir(screenshotDirectory, { recursive: true });

async function openPage(contextOptions, viewport) {
  const context = await browser.newContext({ ...contextOptions, viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("[data-fullpage-section]", { timeout: 60_000 });
  await page.waitForTimeout(600);
  return { context, page, errors };
}

const desktopViewports = process.env.FULLPAGE_QUICK === "1"
  ? [{ width: 1440, height: 900 }]
  : [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 1024, height: 768 }];

for (const viewport of desktopViewports) {
  const { context, page, errors } = await openPage({}, viewport);
  await page.waitForFunction(() => document.documentElement.classList.contains("wilo-fullpage"));

  const fit = await page.evaluate(() => Array.from(document.querySelectorAll("[data-fullpage-section]")).map((section) => {
    const element = /** @type {HTMLElement} */ (section);
    const rect = element.getBoundingClientRect();
    const candidates = Array.from(element.querySelectorAll("*")).flatMap((child) => {
      if (!(child instanceof HTMLElement)) return [];
      const style = getComputedStyle(child);
      if (style.position === "fixed" || style.display === "none" || style.visibility === "hidden") return [];
      const childRect = child.getBoundingClientRect();
      const overflow = Math.round(childRect.bottom - rect.bottom);
      return overflow > 2 ? [{ overflow, className: child.className || child.tagName }] : [];
    }).sort((a, b) => b.overflow - a.overflow).slice(0, 3);
    return {
      id: element.id,
      height: Math.round(rect.height),
      scrollOverflow: element.scrollHeight - element.clientHeight,
      bottomOverflow: candidates,
    };
  }));

  const sectionState = () => page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("[data-fullpage-section]"));
    const active = sections.findIndex((section) => section.getAttribute("data-fullpage-active") === "true");
    const section = /** @type {HTMLElement | undefined} */ (sections[active]);
    const expected = section ? Math.max(0, Math.round(section.getBoundingClientRect().top + scrollY - (active === 0 ? 0 : 72))) : -1;
    return { active, y: Math.round(scrollY), expected, hash: location.hash };
  });

  await page.evaluate(() => scrollTo(0, 0));
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);
  const transitionEarly = await sectionState();
  await page.waitForTimeout(350);
  const transitionMid = await sectionState();
  await page.waitForTimeout(1000);
  const oneWheel = await sectionState();

  await Promise.all(Array.from({ length: 8 }, async (_, index) => {
    await page.waitForTimeout(index * 8);
    await page.mouse.wheel(0, 120);
  }));
  await page.waitForTimeout(1900);
  const burst = await sectionState();

  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(1900);
  const keyboard = await sectionState();

  const beforeHorizontal = await sectionState();
  await page.mouse.wheel(180, 10);
  await page.waitForTimeout(250);
  const afterHorizontal = await sectionState();

  await page.evaluate(() => {
    const scroller = document.createElement("div");
    scroller.id = "fullpage-test-scroller";
    scroller.style.cssText = "position:fixed;z-index:9999;top:120px;left:20px;width:120px;height:90px;overflow-y:auto;background:white";
    scroller.innerHTML = '<div style="height:500px"></div>';
    document.body.append(scroller);
  });
  await page.mouse.move(60, 150);
  const beforeInternalScroll = await sectionState();
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);
  const internalScroll = await page.evaluate(() => ({ pageY: Math.round(scrollY), elementY: document.querySelector("#fullpage-test-scroller")?.scrollTop || 0 }));
  await page.evaluate(() => document.querySelector("#fullpage-test-scroller")?.remove());

  await page.evaluate(() => {
    const input = document.createElement("input");
    input.id = "fullpage-test-input";
    input.style.cssText = "position:fixed;z-index:9999;top:20px;left:20px;width:120px;height:32px";
    document.body.append(input);
    input.focus();
  });
  const beforeInputKey = await sectionState();
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(250);
  const afterInputKey = await sectionState();
  await page.evaluate(() => document.querySelector("#fullpage-test-input")?.remove());

  const historyBeforeAnchor = await page.evaluate(() => ({ length: history.length, href: location.href }));
  await page.evaluate(() => document.querySelector('a[href="/#ecosistema"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })));
  await page.waitForTimeout(1900);
  const anchor = await sectionState();
  const historyAfterAnchor = await page.evaluate(() => ({ length: history.length, href: location.href }));

  await page.evaluate(() => history.back());
  await page.waitForTimeout(1750);
  const historyBack = await sectionState();
  const historyAfterBack = await page.evaluate(() => ({ length: history.length, href: location.href }));

  await page.keyboard.press("Home");
  await page.waitForTimeout(1750);
  for (let index = 0; index < 4; index += 1) {
    await page.mouse.wheel(0, 15);
    await page.waitForTimeout(35);
  }
  await page.waitForTimeout(35);
  const belowThreshold = await sectionState();
  await page.mouse.wheel(0, 30);
  await page.waitForTimeout(1750);
  const accumulatedIntent = await sectionState();
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(1750);
  const reverse = await sectionState();

  for (let index = 0; index < 8; index += 1) {
    await page.mouse.wheel(0, 10);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(1750);
  const slowProgressiveIntent = await sectionState();
  for (let index = 0; index < 8; index += 1) {
    await page.mouse.wheel(0, -10);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(1750);
  const slowProgressiveReverse = await sectionState();

  if (captureScreenshots && viewport.width !== 1920) {
    for (const id of ["sobre-wilo", "trabajos", "servicios", "lab", "audiovisual", "proceso", "confianza", "ecosistema", "nosotros", "contacto-home", "pie-de-pagina"]) {
      await page.locator(`#${id}`).screenshot({ path: `${screenshotDirectory}/${id}-${viewport.width}x${viewport.height}.png` });
    }
  }

  results.push({
    viewport,
    errors,
    fit,
    transition: { early: transitionEarly, mid: transitionMid, settled: oneWheel },
    oneWheel,
    burst,
    keyboard,
    horizontal: { beforeHorizontal, afterHorizontal },
    internalScroll: { beforeInternalScroll, ...internalScroll },
    focusedInput: { beforeInputKey, afterInputKey },
    anchor,
    historyBack,
    historyMeta: { historyBeforeAnchor, historyAfterAnchor, historyAfterBack },
    trackpad: { belowThreshold, accumulatedIntent, reverse, slowProgressiveIntent, slowProgressiveReverse },
  });
  await context.close();
}

{
  const { context, page, errors } = await openPage({ reducedMotion: "reduce" }, { width: 1440, height: 900 });
  await page.waitForFunction(() => document.documentElement.classList.contains("wilo-fullpage"));
  const startedAt = Date.now();
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(700);
  const state = await page.evaluate(() => ({
    active: Array.from(document.querySelectorAll("[data-fullpage-section]")).findIndex((section) => section.getAttribute("data-fullpage-active") === "true"),
    y: Math.round(scrollY),
  }));
  results.push({ viewport: { width: 1440, height: 900 }, reducedMotion: true, errors, elapsed: Date.now() - startedAt, state });
  await context.close();
}

{
  const { context, page, errors } = await openPage({ hasTouch: true, isMobile: true }, { width: 390, height: 844 });
  await page.waitForFunction(() => document.documentElement.classList.contains("wilo-native-sections"));
  const mode = await page.evaluate(() => ({
    fullpage: document.documentElement.classList.contains("wilo-fullpage"),
    native: document.documentElement.classList.contains("wilo-native-sections"),
    snap: getComputedStyle(document.documentElement).scrollSnapType,
  }));
  results.push({ viewport: { width: 390, height: 844 }, errors, mode });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
