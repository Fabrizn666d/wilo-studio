import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const outputDirectory = "artifacts/visual/work-showcase";

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const results = [];

const viewports = [
  { name: "desktop", width: 1920, height: 1080 },
  { name: "desktop-1600", width: 1600, height: 900 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-compact", width: 1366, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

const selectedViewports = process.env.QA_VIEWPORT
  ? viewports.filter(({ name }) => name === process.env.QA_VIEWPORT)
  : process.env.QA_FAST === "1" ? viewports.slice(0, 1) : viewports;

for (const viewport of selectedViewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => window.sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(`${baseUrl}/#trabajos`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const section = page.locator("#trabajos");
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(5200);

  const metrics = await section.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const slides = Array.from(element.querySelectorAll("article"));
    const visibleSlides = slides.filter((slide) => slide.getAttribute("data-hidden") !== "true");
    const active = slides.find((slide) => slide.getAttribute("data-active") === "true");
    const activeRect = active?.getBoundingClientRect();
    const heading = element.querySelector("header h2");
    const subtitle = element.querySelector("header p");
    const activeDevice = active?.querySelector('[aria-hidden="true"]');
    const previousButton = element.querySelector('button[aria-label="Ver proyecto anterior"]');
    const navigation = previousButton?.parentElement;
    const footer = element.querySelector('[aria-label="Identidad de nuestros proyectos"]');
    const relativeRect = (node) => {
      const nodeRect = node?.getBoundingClientRect();
      return nodeRect ? {
        top: Math.round(nodeRect.top - rect.top),
        bottom: Math.round(nodeRect.bottom - rect.top),
        height: Math.round(nodeRect.height),
      } : null;
    };
    const headingRect = relativeRect(heading);
    const subtitleRect = relativeRect(subtitle);
    const deviceRect = relativeRect(activeDevice);
    const navigationRect = relativeRect(navigation);
    const footerRect = relativeRect(footer);
    const visibleDevices = visibleSlides.map((slide) => {
      const device = slide.querySelector('[aria-hidden="true"]');
      const deviceRect = device?.getBoundingClientRect();
      return deviceRect ? {
        top: Math.round(deviceRect.top - rect.top),
        bottom: Math.round(deviceRect.bottom - rect.top),
        left: Math.round(deviceRect.left),
        right: Math.round(deviceRect.right),
      } : null;
    }).filter(Boolean);
    return {
      title: element.querySelector("h2")?.textContent?.trim(),
      sectionHeight: Math.round(rect.height),
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      visibleSlides: visibleSlides.length,
      activeCenteredDelta: activeRect
        ? Math.round(Math.abs((activeRect.left + activeRect.width / 2) - (rect.left + rect.width / 2)))
        : null,
      clippedDevices: visibleDevices.filter((device) => (
        device.top < -1 || device.bottom > rect.height + 1 || device.left < -1 || device.right > innerWidth + 1
      )).length,
      footerBlocks: footer?.children.length ?? 0,
      footerText: footer?.textContent?.replace(/\s+/g, " ").trim(),
      verticalLayout: {
        heading: headingRect,
        subtitle: subtitleRect,
        activeDevice: deviceRect,
        navigation: navigationRect,
        stats: footerRect,
        headingTop: headingRect?.top ?? null,
        headingToSubtitle: headingRect && subtitleRect ? subtitleRect.top - headingRect.bottom : null,
        subtitleToDevice: subtitleRect && deviceRect ? deviceRect.top - subtitleRect.bottom : null,
        deviceToNavigation: deviceRect && navigationRect ? navigationRect.top - deviceRect.bottom : null,
        navigationToStats: navigationRect && footerRect ? footerRect.top - navigationRect.bottom : null,
        statsBottomSpace: footerRect ? Math.round(rect.height - footerRect.bottom) : null,
      },
    };
  });

  await section.screenshot({ path: `${outputDirectory}/work-${viewport.name}-initial.png` });
  await page.screenshot({ path: `${outputDirectory}/work-${viewport.name}-viewport.png` });

  const activeName = section.locator("h3");
  const beforeNext = await activeName.textContent();
  await section.getByRole("button", { name: "Ver proyecto siguiente" }).click();
  await page.waitForTimeout(900);
  const afterNext = await activeName.textContent();
  const region = page.getByRole("region", { name: "Proyectos de Wilo Studio" });
  const bounds = await region.boundingBox();
  if (bounds) {
    await page.mouse.move(bounds.x + bounds.width * .63, bounds.y + bounds.height * .43);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * .31, bounds.y + bounds.height * .43, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(900);
  }
  const afterDrag = await activeName.textContent();
  const beforeAutoplay = afterDrag;
  if (process.env.QA_AUTOPLAY === "1") await page.waitForTimeout(7800);
  const afterAutoplay = await activeName.textContent();
  const interaction = {
    arrowChanged: beforeNext !== afterNext,
    dragChanged: !bounds || afterNext !== afterDrag,
    autoplayChanged: process.env.QA_AUTOPLAY === "1" ? beforeAutoplay !== afterAutoplay : null,
  };

  await section.screenshot({ path: `${outputDirectory}/work-${viewport.name}.png` });
  results.push({ viewport: viewport.name, errors, ...metrics, ...interaction });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
