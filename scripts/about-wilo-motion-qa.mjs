import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.ABOUT_WILO_QA_URL || "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const output = "artifacts/visual/about-wilo/motion-v3";

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript(() => sessionStorage.setItem("wilo-loader-seen", "skip"));
await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForFunction(() => document.documentElement.classList.contains("wilo-fullpage")
  && document.querySelector("#sobre-wilo")?.getAttribute("data-motion-ready") === "true");
await page.evaluate(() => scrollTo(0, 0));

async function snapshot(name) {
  const state = await page.locator("#sobre-wilo").evaluate((section) => {
    const rect = section.getBoundingClientRect();
    const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const styleOf = (node) => {
      const style = getComputedStyle(node);
      return { opacity: Number(style.opacity), transform: style.transform, filter: style.filter };
    };
    return {
      scrollY: Math.round(scrollY),
      visibleRatio: Number((visible / Math.min(rect.height, innerHeight)).toFixed(3)),
      progress: Number(getComputedStyle(section).getPropertyValue("--about-progress")),
      active: section.getAttribute("data-active"),
      counted: section.getAttribute("data-counted"),
      stats: Array.from(section.querySelectorAll("[data-stat-value]"), (node) => node.textContent),
      headline: styleOf(section.querySelector("h2")),
      carousel: styleOf(section.querySelector("[role='region']")),
      cards: Array.from(section.querySelectorAll("[data-slide-index]"), (node) => ({
        key: node.getAttribute("data-slide-key"),
        active: node.getAttribute("aria-pressed"),
        offset: node.getAttribute("data-phase-offset"),
        ...styleOf(node),
      })),
    };
  });
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: false });
  return state;
}

const transition = [];
transition.push({ name: "00-hero", state: await snapshot("00-hero") });
await page.mouse.move(20, 120);
await page.mouse.wheel(0, 100);
for (const [name, wait] of [["01-entry", 100], ["02-quarter", 170], ["03-half", 220], ["04-landed", 550]]) {
  await page.waitForTimeout(wait);
  transition.push({ name, state: await snapshot(name) });
}

await page.waitForTimeout(2_100);
const countersFinal = await snapshot("05-counters-final");
const idleStart = await snapshot("06-idle-start");
await page.waitForTimeout(15_000);
const idleEnd = await snapshot("07-idle-after-15s");

const carousel = page.locator("#sobre-wilo [role='region']");
const box = await carousel.boundingBox();
let dragMid = null;
let dragEnd = null;
if (box) {
  const startX = box.x + box.width * 0.62;
  const y = box.y + box.height * 0.48;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 75, y, { steps: 7 });
  dragMid = await snapshot("08-drag-75px");
  await page.mouse.move(startX - 150, y, { steps: 7 });
  dragEnd = await snapshot("09-drag-150px");
  await page.mouse.up();
}
await page.waitForTimeout(900);
const inertia = await snapshot("10-inertia-snap");
await page.waitForTimeout(650);
const magneticSnap = await snapshot("11-magnetic-snap-exact");

let smallDragSnap = null;
let flickBefore = null;
let flickAfter = null;
let autoplayBefore = null;
let autoplayAfter = null;
if (box) {
  const startX = box.x + box.width * 0.58;
  const y = box.y + box.height * 0.48;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 18, y, { steps: 4 });
  await page.waitForTimeout(260);
  await page.mouse.move(startX - 25, y, { steps: 3 });
  await page.waitForTimeout(100);
  await page.mouse.up();
  await page.waitForTimeout(1_350);
  smallDragSnap = await snapshot("12-small-drag-returns");

  flickBefore = await page.locator("#sobre-wilo [aria-pressed='true']").getAttribute("data-slide-key");
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 22, y, { steps: 2 });
  await page.waitForTimeout(16);
  await page.mouse.move(startX - 78, y, { steps: 2 });
  await page.mouse.up();
  await page.waitForTimeout(1_450);
  flickAfter = await page.locator("#sobre-wilo [aria-pressed='true']").getAttribute("data-slide-key");
  await page.mouse.move(20, 120);
  autoplayBefore = await snapshot("13-autoplay-resume-before");
  await page.waitForTimeout(2_800);
  autoplayAfter = await snapshot("14-autoplay-resumed");
}

await page.mouse.move(20, 120);
await page.mouse.wheel(0, -100);
await page.waitForTimeout(1_200);
await page.mouse.wheel(0, 100);
await page.waitForTimeout(1_200);
const reentry = await snapshot("15-reentry");

await context.close();
await browser.close();

const cardTransformsChanged = idleStart.cards.some((card, index) => card.transform !== idleEnd.cards[index]?.transform);
const dragOffsetsChanged = dragMid && dragEnd
  ? dragMid.cards.some((card, index) => card.offset !== dragEnd.cards[index]?.offset)
  : false;
const nearestOffset = (state) => Math.min(...state.cards.map((card) => Math.abs(Number(card.offset))));
console.log(JSON.stringify({
  errors,
  transition,
  countersFinal: countersFinal.stats,
  idle: { cardTransformsChanged, start: idleStart.cards.map((card) => card.offset), end: idleEnd.cards.map((card) => card.offset) },
  drag: { dragOffsetsChanged, mid: dragMid?.cards.map((card) => card.offset), end: dragEnd?.cards.map((card) => card.offset) },
  magneticSnap: {
    inertia: inertia.cards.map((card) => card.offset),
    settled: magneticSnap.cards.map((card) => card.offset),
    nearestOffset: nearestOffset(magneticSnap),
    smallDragNearestOffset: smallDragSnap ? nearestOffset(smallDragSnap) : null,
    flickBefore,
    flickAfter,
  },
  autoplayResumed: autoplayBefore && autoplayAfter
    ? autoplayBefore.cards.some((card, index) => card.offset !== autoplayAfter.cards[index]?.offset)
    : false,
  reentryCounters: reentry.stats,
}, null, 2));
