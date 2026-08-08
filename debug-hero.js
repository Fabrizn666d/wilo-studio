const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:3000?debug=1');
  await page.waitForTimeout(1000);
  const info = await page.$eval('.hero-art', el => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {bg:s.backgroundImage, size:s.backgroundSize, pos:s.backgroundPosition, w:r.width, h:r.height, z:s.zIndex, display:s.display};
  });
  console.log(JSON.stringify(info,null,2));
  await browser.close();
})();
