// One-off visual QA helper: scrolls the page to trigger lazy images, then
// captures a full-page screenshot. Usage: node screenshot.mjs <url> <out.png> [width]
import { chromium } from 'playwright';

const [url = 'http://localhost:3000', out = 'shot.png', width = '1500'] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 1000 } });
await page.goto(url, { waitUntil: 'networkidle' });

// Scroll through the document so every lazy image enters the viewport.
await page.evaluate(async () => {
  const step = 800;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  window.scrollTo(0, 0);
});
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);

await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`saved ${out}`);
