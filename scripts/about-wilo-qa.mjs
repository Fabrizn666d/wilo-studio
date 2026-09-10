import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.ABOUT_WILO_QA_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/about-wilo";
const interactionsOnly = process.env.ABOUT_WILO_INTERACTIONS_ONLY === "1";
const forceReducedMotion = process.env.ABOUT_WILO_REDUCED === "1";
const disableJavaScript = process.env.ABOUT_WILO_NO_JS === "1";
const viewports = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024, touch: true },
  { width: 375, height: 667, touch: true },
  { width: 393, height: 852, touch: true },
  { width: 412, height: 915, touch: true },
  { width: 430, height: 932, touch: true },
  { width: 390, height: 844, touch: true },
  { width: 844, height: 390, touch: true },
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
    javaScriptEnabled: !disableJavaScript,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  if (!disableJavaScript) await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(`${baseUrl}/#sobre-wilo`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("#sobre-wilo", { timeout: 60_000 });
  if (!disableJavaScript) {
    await page.waitForFunction((desktop) => document.documentElement.classList.contains(
      desktop ? "wilo-fullpage" : "wilo-native-sections",
    ), viewport.width >= 1024 && !viewport.touch);
  }
  if (!disableJavaScript && viewport.width >= 1024 && !viewport.touch) {
    await page.waitForFunction(() => document.querySelector("#sobre-wilo")?.getAttribute("data-fullpage-active") === "true");
  } else {
    await page.locator("#sobre-wilo").scrollIntoViewIfNeeded();
  }
  await page.locator("#sobre-wilo img").first().waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(1_000);
  return { context, page, errors };
}

for (const viewport of interactionsOnly ? [] : viewports) {
  const { context, page, errors } = await prepare(viewport, forceReducedMotion ? "reduce" : "no-preference");
  const metrics = await page.locator("#sobre-wilo").evaluate((section) => {
    const rect = section.getBoundingClientRect();
    const frame = section.querySelector("[class*='frame']")?.getBoundingClientRect();
    const copy = section.querySelector("[class*='copy']")?.getBoundingClientRect();
    const logoHeading = section.querySelector("[class*='logoHeading'] strong")?.getBoundingClientRect();
    const logoViewport = section.querySelector("[class*='logoMarqueeViewport']");
    const logoSequences = Array.from(section.querySelectorAll("[class*='logoMarqueeSequence']"));
    const carousel = section.querySelector("[class*='carousel']")?.getBoundingClientRect();
    const stats = section.querySelector("[class*='statsRail']")?.getBoundingClientRect();
    const visibleLogoCells = Array.from(section.querySelectorAll("[class*='logoCell']"))
      .filter((cell) => getComputedStyle(cell).display !== "none" && cell.getBoundingClientRect().height > 0);
    const visibleCards = Array.from(section.querySelectorAll("[data-slide-index]"))
      .filter((node) => Number(getComputedStyle(node).opacity) > 0.35)
      .map((node) => node.getBoundingClientRect());
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
        && section.textContent.includes("CREATIVIDAD."),
      slideCount: section.querySelectorAll("[aria-label^='Mostrar']").length,
      statValues: Array.from(section.querySelectorAll("[data-stat-value]")).map((node) => node.textContent),
      dedicatedAboutAssets: Array.from(section.querySelectorAll("[data-slide-index] img"))
        .every((image) => image.getAttribute("src")?.includes("about")),
      logoCount: section.querySelectorAll("[aria-label^='Marcas y proyectos'] img").length,
      logoLabel: section.textContent.includes("MARCAS Y PROYECTOS")
        && section.textContent.includes("QUE CONFÍAN EN WILO"),
      logoHeadingCentered: logoHeading
        ? Math.abs((logoHeading.left + logoHeading.width / 2) - (rect.left + rect.width / 2)) <= 2
        : false,
      logoHeadingCenter: logoHeading ? Math.round(logoHeading.left + logoHeading.width / 2) : null,
      viewportCenter: Math.round(rect.left + rect.width / 2),
      logoOverflow: logoViewport ? getComputedStyle(logoViewport).overflowX : null,
      logoAnimationTiming: section.querySelector("[class*='logoMarqueeTrack']")
        ? getComputedStyle(section.querySelector("[class*='logoMarqueeTrack']")).animationTimingFunction
        : null,
      logoSequenceWidths: logoSequences.map((sequence) => Math.round(sequence.getBoundingClientRect().width)),
      carouselStatsGap: carousel && stats ? Math.round(stats.top - carousel.bottom) : null,
      cardTransforms: Array.from(section.querySelectorAll("[data-slide-index]"), (card) => ({
        offset: card.getAttribute("data-phase-offset"),
        transform: card.style.transform,
        computedTransform: getComputedStyle(card).transform,
        opacity: card.style.opacity,
        rect: (() => {
          const cardRect = card.getBoundingClientRect();
          return { top: Math.round(cardRect.top), bottom: Math.round(cardRect.bottom), left: Math.round(cardRect.left), right: Math.round(cardRect.right) };
        })(),
      })),
      logoRowTops: [...new Set(visibleLogoCells.map((cell) => Math.round(cell.getBoundingClientRect().top)))],
      removedRows: !section.textContent.includes("Nuestro origen")
        && !section.textContent.includes("Todo el Perú")
        && !section.textContent.includes("Webs · Tiendas · Sistemas · Apps"),
      copyToCardsGap: copy && visibleCards.length
        ? Math.round(Math.min(...visibleCards.map((card) => card.left)) - copy.right)
        : null,
    };
  });
  const logoTrack = page.locator("#sobre-wilo [class*='logoMarqueeTrack']");
  const logoTransformStart = await logoTrack.evaluate((track) => getComputedStyle(track).transform);
  await page.waitForTimeout(900);
  const logoTransformEnd = await logoTrack.evaluate((track) => getComputedStyle(track).transform);
  metrics.logoMarqueeMoves = logoTransformStart !== logoTransformEnd;
  metrics.logoMarqueeTransforms = [logoTransformStart, logoTransformEnd];
  await page.screenshot({ path: `${output}/about-${viewport.width}x${viewport.height}${forceReducedMotion ? "-reduced" : ""}${disableJavaScript ? "-no-js" : ""}.png`, fullPage: false });
  if (viewport.touch && viewport.width <= 430) {
    await page.locator("#sobre-wilo").screenshot({ path: `${output}/about-${viewport.width}x${viewport.height}-section.png` });
  }
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
  const marquee = await page.locator("#sobre-wilo [class*='logoMarqueeViewport']").evaluate((viewport) => ({
    overflowX: getComputedStyle(viewport).overflowX,
    animationName: getComputedStyle(viewport.querySelector("[class*='logoMarqueeTrack']")).animationName,
    visibleSequences: Array.from(viewport.querySelectorAll("[class*='logoMarqueeSequence']"))
      .filter((sequence) => getComputedStyle(sequence).display !== "none").length,
  }));
  results.push({ reducedMotion: { before, after, marquee }, errors });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
