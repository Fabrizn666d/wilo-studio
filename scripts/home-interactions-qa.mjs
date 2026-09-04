import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3007";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  || "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";

let checks = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  checks += 1;
}

const browser = await chromium.launch({ headless: true, executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => window.sessionStorage.setItem("wilo-loader-seen", "skip"));
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });

  const carousel = page.getByRole("region", { name: "Proyectos de Wilo Studio" });
  const carouselTitle = page.locator("#trabajos h3");
  const initialProject = await carouselTitle.textContent();
  await page.getByRole("button", { name: "Ver proyecto siguiente" }).click();
  await page.waitForTimeout(850);
  const nextProject = await carouselTitle.textContent();
  console.log(JSON.stringify({ debug: "carousel-next", initialProject, nextProject, errors }));
  assert(Boolean(initialProject && nextProject && initialProject !== nextProject), "carousel next arrow did not change the active project");

  await carousel.focus();
  await carousel.press("ArrowLeft");
  await page.waitForTimeout(850);
  assert((await carouselTitle.textContent()) === initialProject, "carousel keyboard navigation did not return to the previous project");

  const box = await carousel.boundingBox();
  assert(Boolean(box), "carousel region has no interactive bounds");
  if (box) {
    await page.mouse.move(box.x + box.width * .67, box.y + box.height * .5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .27, box.y + box.height * .5, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(950);
    assert((await carouselTitle.textContent()) !== initialProject, "carousel drag did not change the active project");
  }

  const deepDive = page.locator("#proyectos");
  await deepDive.scrollIntoViewIfNeeded();
  await deepDive.getByRole("button", { name: /Geoingenieros/i }).click();
  await page.waitForTimeout(1_250);
  assert((await deepDive.locator("h3").textContent())?.includes("Geoingenieros"), "project deep dive selector did not update the case");

  const capabilities = page.locator("#servicios");
  await capabilities.scrollIntoViewIfNeeded();
  await capabilities.getByRole("button", { name: "Explorar Automatización & APIs" }).click();
  await page.waitForTimeout(450);
  assert((await capabilities.locator("h3").textContent())?.includes("Automatización"), "capability explorer did not update the active capability");

  const lab = page.locator("#lab");
  await lab.scrollIntoViewIfNeeded();
  await lab.getByRole("button", { name: "Mostrar el módulo CRM" }).click();
  await page.waitForTimeout(350);
  assert(await lab.getByRole("button", { name: "Mostrar el módulo CRM" }).getAttribute("aria-pressed") === "true", "Wilo Lab panel selection did not update");

  assert(errors.length === 0, `browser errors: ${errors.join(" | ")}`);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.addInitScript(() => window.sessionStorage.setItem("wilo-loader-seen", "skip"));
  await mobile.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });
  const dimensions = await mobile.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert(dimensions.scroll - dimensions.client <= 2, `mobile home overflows by ${dimensions.scroll - dimensions.client}px`);

  const routes = [
    "/proyectos", "/servicios", "/education", "/express", "/events", "/nosotros", "/contacto",
    "/portafolio", "/portafolio/tecnova", "/servicios/desarrollo-web", "/servicios/plataformas-sistemas",
  ];
  for (const route of routes) {
    const response = await page.request.get(`${baseUrl}${route}`, { maxRedirects: 0 });
    assert([200, 307, 308].includes(response.status()), `${route} returned ${response.status()}`);
  }

  console.log(JSON.stringify({ ok: true, checks, initialProject, draggedProject: await carouselTitle.textContent() }));
} finally {
  await browser.close();
}
