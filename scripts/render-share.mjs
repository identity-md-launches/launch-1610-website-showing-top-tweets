// Re-export the share card from the site's actual hero, CSS tokens and SVG mascot.
// Build first, then run against a preview URL. No AI asset or external font needed.
// IMD_PLAYWRIGHT may point to an installation outside the repository.
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.IMD_PLAYWRIGHT
  ? pathToFileURL(process.env.IMD_PLAYWRIGHT).href
  : "playwright");
const url = process.argv[2];
if (!url) throw new Error("Usage: node scripts/render-share.mjs <preview-url>");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator(".hero-art").waitFor();
  await page.evaluate(() => {
    const hero = document.querySelector(".hero").cloneNode(true);
    document.body.replaceChildren(hero);
  });
  await page.addStyleTag({ content: `
    body { min-height: 630px; display: grid; align-items: center; }
    .hero { width: 100%; padding: 0 88px; gap: 48px; }
    .hero h1 { font-size: 64px; }
    .hero-line { font-size: 28px; margin-block-start: 24px; }
    .hero-art { width: 340px; height: 340px; }
  ` });
  await page.screenshot({ path: "public/og.png" });
  console.log("Exported public/og.png at 1200×630 from the hero, without controls.");
} finally {
  await browser.close();
}
