import { chromium } from "playwright";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const baseUrl = process.env.ECOSYSTEM_BASE_URL || "http://localhost:3000";
const publicDir = path.join(root, "public", "ecosystem");
const tempDir = path.join(root, ".tmp", "ecosystem-assets");

const targets = {
  studio: path.join(publicDir, "studio", "studio-devices.png"),
  express: path.join(publicDir, "express", "express-devices.png"),
  education: path.join(publicDir, "education", "education-robot.webp"),
  events: path.join(publicDir, "events", "events-stage.webp"),
};

await Promise.all([
  mkdir(path.dirname(targets.studio), { recursive: true }),
  mkdir(path.dirname(targets.express), { recursive: true }),
  mkdir(path.dirname(targets.education), { recursive: true }),
  mkdir(path.dirname(targets.events), { recursive: true }),
  mkdir(tempDir, { recursive: true }),
]);

await Promise.all([
  copyFile(path.join(root, "public", "images", "wilo", "generated", "education-robot-v2.webp"), targets.education),
  copyFile(path.join(root, "public", "images", "wilo", "generated", "events-stage-v2.webp"), targets.events),
]);

const browser = await chromium.launch({ headless: true });

async function captureRoute(route, viewport, output) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForTimeout(6_500);
    await page.screenshot({ path: output, type: "png", fullPage: false });
  } finally {
    await page.close();
  }
}

async function renderDevices({ desktopCapture, mobileCapture, output, accent, badge }) {
  const [desktop, mobile] = await Promise.all([readFile(desktopCapture), readFile(mobileCapture)]);
  const page = await browser.newPage({ viewport: { width: 1200, height: 760 }, deviceScaleFactor: 1.5 });
  try {
    await page.setContent(`<!doctype html>
      <html><head><style>
      *{box-sizing:border-box}html,body{width:1200px;height:760px;margin:0;overflow:hidden;background:transparent}
      body{position:relative;font-family:Arial,sans-serif}
      .shadow{position:absolute;right:55px;bottom:42px;width:1040px;height:105px;border-radius:50%;background:rgba(9,16,31,.24);filter:blur(34px)}
      .laptop{position:absolute;right:95px;bottom:74px;width:920px;height:590px;filter:drop-shadow(0 30px 24px rgba(4,8,18,.3));transform:perspective(1500px) rotateX(1deg) rotateY(-5deg);transform-origin:bottom center}
      .screenShell{position:absolute;inset:0 0 66px;border:15px solid #171a20;border-bottom-width:21px;border-radius:24px 24px 12px 12px;background:#08090c;box-shadow:inset 0 0 0 2px #323641}
      .screenShell::before{position:absolute;z-index:2;top:-10px;left:50%;width:7px;height:7px;border-radius:50%;background:#454a54;content:''}
      .screen{position:absolute;inset:4px;overflow:hidden;border-radius:7px;background:#050505}
      .screen img{width:100%;height:100%;object-fit:cover;object-position:top center}
      .base{position:absolute;right:-58px;bottom:0;left:-58px;height:72px;border-radius:5px 5px 55px 55px;background:linear-gradient(180deg,#d8dce2 0%,#9097a1 48%,#6c727b 100%);clip-path:polygon(6% 0,94% 0,100% 72%,96% 100%,4% 100%,0 72%)}
      .base::after{position:absolute;top:0;left:42%;width:16%;height:14px;border-radius:0 0 12px 12px;background:#9ea4ad;content:''}
      .phone{position:absolute;z-index:3;right:9px;bottom:40px;width:258px;height:530px;border:12px solid #151820;border-radius:48px;background:#101218;box-shadow:0 32px 55px rgba(4,8,18,.36),inset 0 0 0 2px #3b414d;transform:rotate(2deg)}
      .phone::before{position:absolute;z-index:3;top:10px;left:50%;width:78px;height:20px;border-radius:14px;background:#111318;content:'';transform:translateX(-50%)}
      .phoneScreen{position:absolute;inset:5px;overflow:hidden;border-radius:32px;background:#050505}
      .phoneScreen img{width:100%;height:100%;object-fit:cover;object-position:top center}
      .badge{position:absolute;z-index:4;right:188px;bottom:52px;display:grid;width:128px;height:128px;place-items:center;border:6px solid rgba(255,255,255,.76);border-radius:34px;background:${accent};box-shadow:0 18px 32px rgba(4,8,18,.22);color:#fff;font-size:21px;font-weight:900;line-height:1;text-align:center;transform:rotate(-6deg)}
      </style></head><body>
      <div class="shadow"></div>
      <div class="laptop"><div class="screenShell"><div class="screen"><img alt="" src="data:image/png;base64,${desktop.toString("base64")}"></div></div><div class="base"></div></div>
      <div class="phone"><div class="phoneScreen"><img alt="" src="data:image/png;base64,${mobile.toString("base64")}"></div></div>
      <div class="badge">${badge}</div>
      </body></html>`, { waitUntil: "load" });
    await page.screenshot({ path: output, type: "png", omitBackground: true });
  } finally {
    await page.close();
  }
}

try {
  const captures = {
    studioDesktop: path.join(tempDir, "studio-desktop.png"),
    studioMobile: path.join(tempDir, "studio-mobile.png"),
    expressDesktop: path.join(tempDir, "express-desktop.png"),
    expressMobile: path.join(tempDir, "express-mobile.png"),
  };

  await captureRoute("/", { width: 1440, height: 900 }, captures.studioDesktop);
  await captureRoute("/tienda", { width: 430, height: 880 }, captures.studioMobile);
  await captureRoute("/express", { width: 1440, height: 900 }, captures.expressDesktop);
  await captureRoute("/express", { width: 430, height: 880 }, captures.expressMobile);

  await renderDevices({ desktopCapture: captures.studioDesktop, mobileCapture: captures.studioMobile, output: targets.studio, accent: "#111111", badge: "HECHO<br>A MEDIDA" });
  await renderDevices({ desktopCapture: captures.expressDesktop, mobileCapture: captures.expressMobile, output: targets.express, accent: "#1e73ea", badge: "LANZA<br>EN DÍAS" });
  console.log(JSON.stringify({ ok: true, targets }, null, 2));
} finally {
  await browser.close();
}
