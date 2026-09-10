import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.LAB_QA_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/wilo-lab";

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const results = [];

async function prepare(viewport, reducedMotion = "no-preference") {
  const context = await browser.newContext({
    hasTouch: viewport.touch || false,
    isMobile: viewport.touch || false,
    reducedMotion,
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(`${baseUrl}/#lab`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("#lab [role='region']", { timeout: 60_000 });
  if (viewport.width >= 1024 && !viewport.touch) {
    await page.waitForFunction(() => document.querySelector("#lab")?.getAttribute("data-fullpage-active") === "true");
  } else {
    await page.locator("#lab").evaluate((section) => section.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(120);
  }
  await page.locator("#lab article[data-active='true'] img").first().waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForFunction(
    () => document.querySelector("#lab [data-lab-visible]")?.getAttribute("data-lab-visible") === "true",
    undefined,
    { timeout: reducedMotion === "reduce" ? 4_000 : 10_000 },
  );
  await page.waitForTimeout(reducedMotion === "reduce" ? 300 : 1800);
  return { context, errors, page };
}

function activeTitle(page) {
  return page.locator("#lab article[data-active='true']").getAttribute("data-card");
}

const requestedViewport = process.env.LAB_QA_VIEWPORT;
const viewports = [
  { name: "reference-1920", width: 1920, height: 1080 },
  { name: "mockup-1536", width: 1551, height: 1096 },
  { name: "desktop-1600", width: 1600, height: 900 },
  { name: "desktop-1366", width: 1366, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "mobile-430", width: 430, height: 932, touch: true },
  { name: "mobile", width: 390, height: 844, touch: true },
].filter((viewport) => !requestedViewport || viewport.name === requestedViewport);

for (const viewport of viewports) {
  const { context, errors, page } = await prepare(viewport);
  const metrics = await page.locator("#lab").evaluate(async (section) => {
    const active = section.querySelector("article[data-active='true'] > div")?.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const visibleCards = [...section.querySelectorAll("article[data-card]")]
      .filter((card) => Number.parseFloat(getComputedStyle(card).opacity) > .1)
      .map((card) => card.getAttribute("data-card"));
    const navigation = document.querySelector("[data-home-navigation]");
    const explorer = section.querySelector("[class*='explorer']");
    const handwritten = section.querySelector("[class*='handNote']");
    const manualIntersectionRatio = explorer ? await new Promise((resolve) => {
      const observer = new IntersectionObserver(([entry]) => {
        resolve(entry?.intersectionRatio ?? -1);
        observer.disconnect();
      });
      observer.observe(explorer);
    }) : -1;
    const requiredLabels = ["crm", "dashboard", "tracking", "api"].map((key) => {
      const card = section.querySelector(`article[data-card='${key}']`);
      const label = card?.querySelector("strong");
      const rect = label?.getBoundingClientRect();
      const x = rect ? Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2)) : 0;
      const y = rect ? Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2)) : 0;
      const hit = rect ? document.elementFromPoint(x, y) : null;
      const owner = hit?.closest("article");
      const ownerTarget = hit?.closest("button")?.getAttribute("data-stage-target") ?? null;
      return {
        exposed: Boolean(card && rect && Number.parseFloat(getComputedStyle(card).opacity) > .1 && rect.width > 0 && rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight && owner === card),
        key,
        label: label?.textContent?.trim() ?? null,
        ownerCard: owner?.getAttribute("data-card") ?? null,
        ownerTarget,
        hit: hit?.className ?? null,
        rect: rect ? [Math.round(rect.left), Math.round(rect.top), Math.round(rect.right), Math.round(rect.bottom)] : null,
      };
    });
    const stagePositions = [...section.querySelectorAll("article[data-card]")]
      .filter((card) => Math.abs(Number(card.getAttribute("data-offset"))) <= 2)
      .map((card) => ({ card: card.getAttribute("data-card"), offset: Number(card.getAttribute("data-offset")) }));
    return {
      activeInsideViewport: Boolean(active && active.left >= -1 && active.right <= innerWidth + 1),
      activationExists: Boolean(section.querySelector("[data-testid='lab-activation']")),
      explorerVisibleState: explorer?.getAttribute("data-lab-visible") ?? null,
      explorerRect: explorer ? (() => { const rect = explorer.getBoundingClientRect(); return [Math.round(rect.top), Math.round(rect.bottom), Math.round(rect.height), innerHeight]; })() : null,
      opacityChain: [section, explorer, explorer?.querySelector("h2"), explorer?.querySelector("article[data-active='true']")].map((element) => element ? getComputedStyle(element).opacity : null),
      manualIntersectionRatio,
      cardCount: section.querySelectorAll("article").length,
      documentOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      explorerFont: explorer ? getComputedStyle(explorer).fontFamily : null,
      handwritingFont: handwritten ? getComputedStyle(handwritten).fontFamily : null,
      independentLabImages: [...section.querySelectorAll("img")]
        .filter((image) => image.getAttribute("src")?.includes("wilo-lab")).length,
      navigationFont: navigation ? getComputedStyle(navigation).fontFamily : null,
      navigationTheme: navigation?.getAttribute("data-theme"),
      overflowX: getComputedStyle(section).overflowX,
      requiredLabels,
      sectionHeight: Math.round(sectionRect.height),
      stagePositions,
      visibleCards,
    };
  });
  await page.locator("#lab").screenshot({ path: `${output}/lab-${viewport.name}.png` });
  if (viewport.touch) await page.screenshot({ path: `${output}/lab-${viewport.name}-viewport.png` });
  if (viewport.name === "reference-1920") await page.screenshot({ path: `${output}/lab-reference-1920-with-nav.png` });
  results.push({ errors, metrics, viewport: viewport.name });
  await context.close();
}

if (!requestedViewport || process.env.LAB_QA_INTERACTIONS === "1") {
  const { context, errors, page } = await prepare({ width: 1440, height: 900 });
  await page.mouse.move(4, 4);
  const initial = await activeTitle(page);
  await page.waitForTimeout(6_800);
  const afterAutoplay = await activeTitle(page);

  const carousel = page.locator("#lab [role='region']");
  await carousel.hover();
  const beforePause = await activeTitle(page);
  await page.waitForTimeout(6_800);
  const afterPause = await activeTitle(page);

  await page.getByRole("button", { name: /Ver m.dulo siguiente/ }).click();
  await page.waitForTimeout(850);
  const afterNext = await activeTitle(page);
  await carousel.press("ArrowLeft");
  await page.waitForTimeout(850);
  const afterKeyboard = await activeTitle(page);

  const beforeDrag = await activeTitle(page);
  const box = await page.locator("#lab article[data-active='true'] [class*='panelFrame']").boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * .6, box.y + box.height * .45);
    await page.mouse.down();
    const trackedPanel = page.locator("#lab article[data-card='tracking']");
    const dragTransformBefore = await trackedPanel.evaluate((element) => getComputedStyle(element).transform);
    await page.mouse.move(box.x + box.width * .5, box.y + box.height * .45, { steps: 5 });
    await page.waitForTimeout(120);
    const dragTransformDuring = await trackedPanel.evaluate((element) => getComputedStyle(element).transform);
    results.push({ dragProgress: { movedBeforeRelease: dragTransformBefore !== dragTransformDuring } });
    await page.mouse.move(box.x + box.width * .2, box.y + box.height * .45, { steps: 4 });
    await page.mouse.up();
  }
  await page.waitForTimeout(900);
  const afterDrag = await activeTitle(page);

  await page.locator("#lab button[aria-controls='wilo-lab-stage']").filter({ hasText: "Dashboard" }).click();
  await page.waitForTimeout(900);
  const clickCardLabel = async (key) => {
    const label = page.locator(`#lab article[data-card='${key}'] [class*='panelCaption'] strong`);
    const bounds = await label.boundingBox();
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  };
  await clickCardLabel("tracking");
  await page.waitForTimeout(900);
  const afterSideClick = await activeTitle(page);
  await clickCardLabel("api");
  await page.waitForTimeout(900);
  const afterApiClick = await activeTitle(page);
  await page.locator("#lab button[aria-controls='wilo-lab-stage']").filter({ hasText: "Dashboard" }).click();
  await page.waitForTimeout(900);
  await clickCardLabel("crm");
  await page.waitForTimeout(900);
  const afterCrmClick = await activeTitle(page);

  await carousel.press("End");
  await page.waitForTimeout(900);
  const finalCard = await activeTitle(page);
  const ctaVisible = await page.locator("#lab").getByRole("link", { name: /NTANOS TU IDEA/ }).isVisible();
  await page.locator("#lab").screenshot({ path: `${output}/lab-cta-desktop.png` });
  await page.getByRole("button", { name: /Ver m.dulo siguiente/ }).click();
  await page.waitForTimeout(900);
  const afterLoop = await activeTitle(page);
  results.push({
    errors,
    interactions: { afterApiClick, afterAutoplay, afterCrmClick, afterDrag, beforeDrag, afterKeyboard, afterLoop, afterNext, afterPause, afterSideClick, beforePause, ctaVisible, finalCard, initial },
  });
  await context.close();
}

if (!requestedViewport) {
  const { context, errors, page } = await prepare({ width: 1440, height: 900 }, "reduce");
  await page.mouse.move(4, 4);
  const before = await activeTitle(page);
  await page.waitForTimeout(5_300);
  const after = await activeTitle(page);
  results.push({ errors, reducedMotion: { after, before } });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
