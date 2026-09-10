import sharp from "sharp";

const targetPath = "C:/Users/FAbri/Downloads/User attachment.png";
const finalPath = "artifacts/visual/wilo-lab/lab-reference-1920.png";
const outputPath = "artifacts/visual/wilo-lab/lab-target-vs-final.png";
const panelWidth = 900;
const panelHeight = 600;

const [target, implementation] = await Promise.all([
  sharp(targetPath).resize(panelWidth, panelHeight, { fit: "contain", background: "#071014" }).png().toBuffer(),
  sharp(finalPath).resize(panelWidth, panelHeight, { fit: "contain", background: "#071014" }).png().toBuffer(),
]);

const labels = Buffer.from(`
  <svg width="1840" height="56" xmlns="http://www.w3.org/2000/svg">
    <rect width="1840" height="56" fill="#050b0e" />
    <text x="24" y="36" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="700">TARGET APROBADO</text>
    <text x="964" y="36" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="700">IMPLEMENTACIÓN FINAL</text>
  </svg>
`);

await sharp({ create: { width: 1840, height: 656, channels: 3, background: "#050b0e" } })
  .composite([
    { input: labels, left: 0, top: 0 },
    { input: target, left: 0, top: 56 },
    { input: implementation, left: 940, top: 56 },
  ])
  .png()
  .toFile(outputPath);

console.log(outputPath);
