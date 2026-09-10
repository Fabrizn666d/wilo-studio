import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const generatedRoot = "C:/Users/FAbri/.codex/generated_images/01a0675f-3e26-79f2-bc76-d3c64bd186e9";
const outputRoot = "public/wilo-lab";
const assets = {
  "dashboard.webp": "exec-85ab0b16-1757-4fc0-9ef1-028017677551.png",
  "crm.webp": "exec-d594eb1a-0b8e-4eca-81ee-5bf2b7ba67be.png",
  "tracking.webp": "exec-1b0bb9c3-c837-4954-bb84-560e43d1dd16.png",
  "api.webp": "exec-9d93b137-31ec-4612-aa95-e672ca4b2d69.png",
  "admin.webp": "exec-49f836e6-9467-4667-b739-5ec330145b5d.png",
  "quote.webp": "exec-769a7419-2cfb-4d48-9a9c-2d720377c1e2.png",
  "intelligence.webp": "exec-dcd4ed9f-5c4c-4cbc-9bf5-ff7a01a7480f.png",
  "custom-project.webp": "exec-f9f58bb6-ef87-4fe5-8935-3b5eca2d88f8.png",
};

await mkdir(outputRoot, { recursive: true });

await Promise.all(Object.entries(assets).map(async ([outputName, inputName]) => {
  await sharp(`${generatedRoot}/${inputName}`)
    .resize(1600, 1000, { fit: "cover", position: "centre" })
    .webp({ effort: 5, quality: 90, smartSubsample: true })
    .toFile(`${outputRoot}/${outputName}`);
}));

console.log(`Installed ${Object.keys(assets).length} Wilo Lab assets in ${outputRoot}.`);
