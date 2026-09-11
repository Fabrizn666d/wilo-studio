import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.WILO_QA_URL ?? "http://localhost:3000/#servicios";
const outputDir = "artifacts/services-carousel";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { checks: {}, viewports: {}, errors: [] };

async function openServices(page) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.locator("#servicios").waitFor({ state: "attached" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});
  await page.locator("#servicios").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
}

function numberFromStatus(status) {
  return Number(status.match(/Servicio\s+(\d+)\s+de/)?.[1] ?? 0);
}

async function activeNumber(page) {
  return numberFromStatus(await page.locator("#servicios [aria-live='polite']").textContent());
}

async function sectionMetrics(page) {
  return page.locator("#servicios").evaluate((section) => {
    const sectionRect = section.getBoundingClientRect();
    const cards = [...section.querySelectorAll("article[data-service]")];
    const images = [...section.querySelectorAll("img")];
    const failedImages = images.filter((img) => img.complete && img.naturalWidth === 0).length;
    const visibleCards = cards.filter((card) => {
      const rect = card.getBoundingClientRect();
      return rect.right > 0 && rect.left < window.innerWidth && rect.bottom > sectionRect.top && rect.top < sectionRect.bottom;
    }).length;
    const active = section.querySelector("[data-service][data-active='true']");
    const viewport = section.querySelector("[aria-roledescription='carrusel']");
    const activeRect = active?.getBoundingClientRect();
    const viewportRect = viewport?.getBoundingClientRect();
    return {
      cardCount: cards.length,
      imageCount: images.length,
      failedImages,
      visibleCards,
      sectionHeight: Math.round(sectionRect.height),
      horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      activeCenterDelta: activeRect && viewportRect
        ? Math.round((activeRect.left + activeRect.width / 2) - (viewportRect.left + viewportRect.width / 2))
        : null,
      forbiddenBranches: ["Wilo Express", "Wilo Education", "Wilo Events", "Wilo Store"].filter((text) => section.textContent?.includes(text)),
      unwantedLabels: ["ARRASTRA PARA EXPLORAR", "DESPLAZAMIENTO INFINITO"].filter((text) => section.textContent?.includes(text)),
    };
  });
}

async function testViewport(name, viewport) {
  const page = await browser.newPage({ viewport, reducedMotion: "no-preference" });
  page.on("console", (message) => {
    if (message.type() === "error") report.errors.push(`${name}: ${message.text()}`);
  });
  page.on("pageerror", (error) => report.errors.push(`${name}: ${error.message}`));
  await openServices(page);
  report.viewports[name] = await sectionMetrics(page);
  await page.locator("#servicios").screenshot({ path: `${outputDir}/${name}.png`, animations: "disabled" });
  await page.close();
}

await testViewport("desktop-1920x1080", { width: 1920, height: 1080 });
await testViewport("tablet-1024x768", { width: 1024, height: 768 });
await testViewport("mobile-390x844", { width: 390, height: 844 });

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
page.on("pageerror", (error) => report.errors.push(`interaction: ${error.message}`));
await openServices(page);

const carousel = page.locator("#servicios [aria-roledescription='carrusel']");
const beforeHover = await activeNumber(page);
const carouselBox = await carousel.boundingBox();
if (!carouselBox) throw new Error("Carousel viewport not found");
await page.mouse.move(carouselBox.x + carouselBox.width * .18, carouselBox.y + carouselBox.height * .45);
await page.waitForTimeout(100);
await page.mouse.move(carouselBox.x + carouselBox.width * .78, carouselBox.y + carouselBox.height * .55);
await page.waitForTimeout(150);
const afterHover = await activeNumber(page);
report.checks.hoverDoesNotScrub = beforeHover === afterHover;
await page.waitForTimeout(5_100);
report.checks.autoplayContinuesOnHover = afterHover !== await activeNumber(page);

let loopGuard = 0;
while (await activeNumber(page) !== 17 && loopGuard < 17) {
  await page.getByRole("button", { name: "Ver servicio anterior" }).click();
  await page.waitForTimeout(850);
  loopGuard += 1;
}
const wrappedBack = await activeNumber(page);
await page.getByRole("button", { name: "Ver siguiente servicio" }).click();
await page.waitForTimeout(900);
const wrappedForward = await activeNumber(page);
report.checks.loop17to1 = wrappedBack === 17 && wrappedForward === 1;

const beforeDrag = await activeNumber(page);
await page.mouse.move(carouselBox.x + carouselBox.width * .55, carouselBox.y + carouselBox.height * .55);
await page.mouse.down();
await page.mouse.move(carouselBox.x + carouselBox.width * .32, carouselBox.y + carouselBox.height * .55, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(1300);
const afterDrag = await activeNumber(page);
const dragMetrics = await sectionMetrics(page);
report.checks.dragChangesCard = beforeDrag !== afterDrag;
report.checks.magneticSnap = Math.abs(dragMetrics.activeCenterDelta ?? 999) <= 4;

await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
await page.locator(".preloader").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});
await page.locator("#servicios").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await page.mouse.move(30, 110);
const beforeAutoplay = await activeNumber(page);
await page.waitForTimeout(6200);
const afterAutoplay = await activeNumber(page);
report.checks.autoplay = beforeAutoplay !== afterAutoplay;
await page.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "no-preference" });
const mobile = await mobileContext.newPage();
await openServices(mobile);
const mobileCarousel = mobile.locator("#servicios [aria-roledescription='carrusel']");
const mobileBox = await mobileCarousel.boundingBox();
const beforeSwipe = await activeNumber(mobile);
if (mobileBox) {
  const cdp = await mobileContext.newCDPSession(mobile);
  const x1 = mobileBox.x + mobileBox.width * .75;
  const x2 = mobileBox.x + mobileBox.width * .25;
  const y = mobileBox.y + mobileBox.height * .55;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x1, y, id: 1 }] });
  for (let step = 1; step <= 12; step += 1) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x1 + (x2 - x1) * (step / 12), y, id: 1 }] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await mobile.waitForTimeout(1200);
}
report.checks.mobileSwipe = beforeSwipe !== await activeNumber(mobile);
await mobile.close();
await mobileContext.close();

report.checks.catalogHas17Cards = Object.values(report.viewports).every((entry) => entry.cardCount === 17);
report.checks.imagesLoad = Object.values(report.viewports).every((entry) => entry.imageCount === 17 && entry.failedImages === 0);
report.checks.noOtherWiloBranches = Object.values(report.viewports).every((entry) => entry.forbiddenBranches.length === 0);
report.checks.noUnwantedLabels = Object.values(report.viewports).every((entry) => entry.unwantedLabels.length === 0);
report.checks.noHorizontalOverflow = Object.values(report.viewports).every((entry) => entry.horizontalOverflow <= 1);

await browser.close();
console.log(JSON.stringify(report, null, 2));

if (Object.values(report.checks).some((value) => value !== true) || report.errors.length) process.exitCode = 1;
