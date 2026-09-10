import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.ABOUT_WILO_QA_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/about-wilo/mobile-final";
const requestedViewport = Number(process.env.ABOUT_WILO_VIEWPORT || 0);
const viewports = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 412, height: 915 },
  { width: 430, height: 932 },
  { width: 844, height: 390 },
].filter(({ width }) => !requestedViewport || width === requestedViewport);

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport,
    hasTouch: true,
    isMobile: true,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(`${baseUrl}/#sobre-wilo`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("#sobre-wilo[data-motion-ready='true']", { timeout: 60_000 });
  await page.locator("#sobre-wilo img").first().waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(1_000);

  const metrics = await page.locator("#sobre-wilo").evaluate((section) => {
    const headline = section.querySelector("h2");
    const activeCard = section.querySelector("[data-position='0']");
    const copy = section.querySelector("[class*='measureCopy'] p");
    const subhead = section.querySelector("[class*='subhead']");
    const logoHeading = section.querySelector("[class*='logoHeading'] strong");
    const logoViewport = section.querySelector("[class*='logoMarqueeViewport']");
    const activeRect = activeCard?.getBoundingClientRect();
    const headlineRect = headline?.getBoundingClientRect();
    const logoHeadingRect = logoHeading?.getBoundingClientRect();
    return {
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      headline: headline?.textContent?.replace(/\s+/g, " ").trim(),
      headlineInsideViewport: headlineRect
        ? headlineRect.left >= -1 && headlineRect.right <= innerWidth + 1
        : false,
      bodyFont: copy ? Number.parseFloat(getComputedStyle(copy).fontSize) : null,
      subheadFont: subhead ? Number.parseFloat(getComputedStyle(subhead).fontSize) : null,
      activeCardWidthRatio: activeRect ? Number((activeRect.width / innerWidth).toFixed(3)) : null,
      activeCardInsideSafeArea: activeRect
        ? activeRect.left >= 10 && activeRect.right <= innerWidth - 10
        : false,
      slideCount: section.querySelectorAll("[data-slide-index]").length,
      logoCount: section.querySelectorAll("[aria-label^='Marcas y proyectos'] img").length,
      logoHeadingCentered: logoHeadingRect
        ? Math.abs((logoHeadingRect.left + logoHeadingRect.width / 2) - (section.getBoundingClientRect().left + section.getBoundingClientRect().width / 2)) <= 2
        : false,
      logoOverflow: logoViewport ? getComputedStyle(logoViewport).overflowX : null,
      logoAnimationTiming: section.querySelector("[class*='logoMarqueeTrack']")
        ? getComputedStyle(section.querySelector("[class*='logoMarqueeTrack']")).animationTimingFunction
        : null,
      oldRowsAbsent: !section.textContent?.includes("Nuestro origen")
        && !section.textContent?.includes("Webs · Tiendas · Sistemas · Apps"),
      statValues: Array.from(section.querySelectorAll("[data-stat-value]"), (node) => node.textContent),
    };
  });

  const marquee = page.locator("#sobre-wilo [class*='logoMarqueeTrack']");
  const marqueeStart = await marquee.evaluate((node) => getComputedStyle(node).transform);
  await page.waitForTimeout(900);
  const marqueeEnd = await marquee.evaluate((node) => getComputedStyle(node).transform);
  metrics.logoMarqueeMoves = marqueeStart !== marqueeEnd;

  await page.screenshot({ path: `${output}/about-mobile-${viewport.width}x${viewport.height}.png` });
  results.push({ viewport, errors, metrics });
  await context.close();
}

if (!requestedViewport || requestedViewport === 390) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(`${baseUrl}/#sobre-wilo`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const carousel = page.locator("#sobre-wilo [role='region']");
  await carousel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const client = await context.newCDPSession(page);
  const box = await carousel.boundingBox();
  let touchInteraction = null;
  if (box) {
    const x = Math.round(box.x + box.width * .62);
    const y = Math.round(Math.max(90, Math.min(740, box.y + box.height * .43)));
    const initial = await page.locator("#sobre-wilo [aria-pressed='true']").getAttribute("aria-label");
    const beforeOffsets = await page.locator("#sobre-wilo [data-slide-index]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-phase-offset")));
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 6; step += 1) {
      await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - step * 18, y }] });
      await page.waitForTimeout(24);
    }
    const duringOffsets = await page.locator("#sobre-wilo [data-slide-index]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-phase-offset")));
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(1_700);
    const after = await page.locator("#sobre-wilo [aria-pressed='true']").getAttribute("aria-label");
    const snappedOffsets = await page.locator("#sobre-wilo [data-slide-index]").evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("data-phase-offset"))));

    const verticalStart = await page.evaluate(() => scrollY);
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 6; step += 1) {
      await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - step * 24 }] });
      await page.waitForTimeout(24);
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(500);
    const verticalEnd = await page.evaluate(() => scrollY);
    touchInteraction = {
      initial,
      after,
      horizontalResponded: beforeOffsets.some((value, index) => value !== duringOffsets[index]),
      magneticSnapOffset: Math.min(...snappedOffsets.map(Math.abs)),
      verticalScrollDelta: verticalEnd - verticalStart,
    };
  }
  results.push({ touchInteraction, errors });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
