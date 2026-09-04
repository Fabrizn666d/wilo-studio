import { chromium } from "playwright";

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.omodajaecoo.pe/j5/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4_000);

const structure = await page.evaluate(() => ({
  title: document.title,
  href: location.href,
  viewport: innerHeight,
  scrollHeight: document.documentElement.scrollHeight,
  bodyClasses: document.body.className,
  sections: Array.from(document.querySelectorAll("section, [data-section], [class*='section']")).slice(0, 30).map((element) => {
    const rect = element.getBoundingClientRect();
    return { tag: element.tagName, id: element.id, className: String(element.className).slice(0, 120), top: Math.round(rect.top + scrollY), height: Math.round(rect.height) };
  }),
}));

const sceneSnapshot = () => page.evaluate(() => {
  const pick = (element) => {
    if (!(element instanceof HTMLElement)) return null;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      tag: element.tagName,
      id: element.id,
      className: element.className.toString().slice(0, 160),
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      transform: style.transform,
      transition: style.transition,
      opacity: style.opacity,
      position: style.position,
    };
  };

  return {
    bodyChildren: Array.from(document.body.children).map(pick),
    cover: pick(document.querySelector(".cover-model")),
    prices: pick(document.querySelector(".precios-modelo")),
    transformed: Array.from(document.querySelectorAll("body *"))
      .map(pick)
      .filter((item) => item && item.transform !== "none")
      .slice(0, 40),
  };
});

await page.evaluate(() => scrollTo(0, 0));
await page.mouse.move(720, 450);
const initialScene = await sceneSnapshot();
const trace = [];
const startedAt = Date.now();
for (let index = 0; index < 8; index += 1) {
  await page.mouse.wheel(0, 24);
  await page.waitForTimeout(120);
  trace.push({ at: Date.now() - startedAt, y: await page.evaluate(() => Math.round(scrollY)), scene: await sceneSnapshot() });
}
for (let index = 0; index < 24; index += 1) {
  await page.waitForTimeout(75);
  trace.push({ at: Date.now() - startedAt, y: await page.evaluate(() => Math.round(scrollY)), scene: await sceneSnapshot() });
}

await browser.close();
console.log(JSON.stringify({ structure, initialScene, trace }, null, 2));
