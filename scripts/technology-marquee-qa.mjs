import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
await mkdir("artifacts/visual/technology", { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
await context.addInitScript(() => window.sessionStorage.setItem("wilo-loader-seen", "skip"));
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${baseURL}/#tecnologia`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForSelector("#tecnologia");
await page.waitForTimeout(900);

const marquee = page.locator('[aria-label="Tecnologías utilizadas por Wilo Studio"]');
const track = marquee.locator("> div");
const initialX = await track.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
await page.waitForTimeout(650);
const nextX = await track.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
const state = await marquee.evaluate((element) => {
  const groups = [...element.firstElementChild.children];
  const images = [...element.querySelectorAll("img")];
  return {
    groups: groups.length,
    firstWidth: groups[0]?.getBoundingClientRect().width,
    secondWidth: groups[1]?.getBoundingClientRect().width,
    images: images.length,
    broken: images.filter((image) => !image.complete || image.naturalWidth === 0).length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});
if (state.groups !== 2 || state.images !== 16 || state.broken) throw new Error(`Marquee incompleto: ${JSON.stringify(state)}`);
if (Math.abs(state.firstWidth - state.secondWidth) > 1) throw new Error("Los grupos del loop no tienen el mismo ancho");
if (Math.abs(nextX - initialX) < 2) throw new Error("El marquee no se está desplazando");
if (state.overflow > 2) throw new Error(`Overflow horizontal: ${state.overflow}px`);
await page.screenshot({ path: "artifacts/visual/technology/technology-1440.png", fullPage: false });

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await reducedContext.addInitScript(() => window.sessionStorage.setItem("wilo-loader-seen", "skip"));
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${baseURL}/#tecnologia`, { waitUntil: "networkidle", timeout: 60_000 });
const reducedAnimation = await reducedPage.locator('[aria-label="Tecnologías utilizadas por Wilo Studio"] > div').evaluate((element) => getComputedStyle(element).animationName);
if (reducedAnimation !== "none") throw new Error(`Reduced motion conserva animationName=${reducedAnimation}`);
await reducedContext.close();
if (errors.length) throw new Error(`Errores de navegador:\n${errors.join("\n")}`);
await browser.close();
console.log(JSON.stringify({ ...state, movedBy: nextX - initialX, reducedAnimation, errors }, null, 2));
