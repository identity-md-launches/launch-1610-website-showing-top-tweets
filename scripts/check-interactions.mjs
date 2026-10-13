// Check the production export at a gateway-style subpath, entirely offline.
// Install Playwright separately; set IMD_PLAYWRIGHT to its index.mjs if needed.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { pathToFileURL } from "node:url";

const { chromium, webkit } = await import(process.env.IMD_PLAYWRIGHT
  ? pathToFileURL(process.env.IMD_PLAYWRIGHT).href : "playwright");
const root = resolve("dist");
const prefix = "/preview/identity-md/";
const out = "test/scratch/interactions";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, "http://preview.invalid").pathname;
    if (!path.startsWith(prefix)) throw new Error("outside preview");
    const file = resolve(root, decodeURIComponent(path.slice(prefix.length)) || "index.html");
    if (!file.startsWith(root + sep)) throw new Error("outside export");
    res.setHeader("Content-Type", mime[extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = origin + prefix;
const results = [];
const limitations = [];
await mkdir(out, { recursive: true });
let browser;
async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, passed: true, ...(detail && { detail }) });
  } catch (error) {
    results.push({ name, passed: false, detail: error.message });
  }
}

try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ["clipboard-read", "clipboard-write"] });
  // Observe navigation destinations without depending on X's availability/login.
  await context.route("**/*", (route) => route.request().url().startsWith(origin)
    ? route.continue()
    : route.fulfill({ status: 200, contentType: "text/plain", body: "External navigation intercepted by validation." }));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("requestfailed", (req) => errors.push(req.url()));
  page.on("response", (res) => { if (res.status() >= 400) errors.push(`${res.status()} ${res.url()}`); });
  await page.goto(url, { waitUntil: "networkidle" });
  const cards = page.locator(".card");
  const firstAuthor = () => page.locator(".who-name").first().innerText();
  const search = page.getByLabel("Search tweets", { exact: true });

  await check("Sample provenance is visible immediately above the list", async () => {
    const note = page.locator(".posts-note");
    assert.match(await note.innerText(), /invented authors, dates and counts/);
    assert.match(await note.innerText(), /Not real tweets from X/);
    assert.equal(await note.isVisible(), true);
    assert.ok((await note.boundingBox()).y < (await cards.first().boundingBox()).y);
  });
  for (const width of [320, 360, 375, 390, 393, 414, 640, 768, 1440]) {
    await check(`No horizontal overflow at ${width}px`, async () => {
      await page.setViewportSize({ width, height: 844 });
      const dims = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
      assert.equal(dims.document, dims.viewport);
      await page.screenshot({ path: `${out}/${width}.png` });
      return dims;
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await check("Product and complete first-card action fit the first 390×844 screen", async () => {
    const box = await page.locator(".card-actions a").first().boundingBox();
    assert.ok(box.y >= 0 && box.y + box.height <= 844);
    assert.equal(await page.getByRole("heading", { level: 1 }).isVisible(), true);
    return box;
  });
  await check("Selected sort/topic use raised surfaces with accent borders", async () => {
    const styles = await page.locator('[aria-pressed="true"]').evaluateAll((els) => els.map((el) => {
      const s = getComputedStyle(el);
      return { background: s.backgroundColor, border: s.borderColor, color: s.color };
    }));
    assert.equal(styles.length, 2);
    for (const s of styles) assert.deepEqual(s, { background: "rgb(20, 50, 37)", border: "rgb(92, 203, 124)", color: "rgb(143, 227, 168)" });
  });
  await check("Initial Top sort and eight-card pagination", async () => {
    assert.equal(await cards.count(), 8);
    assert.equal(await firstAuthor(), "Agent Pepe");
    await page.getByRole("button", { name: "Show 6 more tweets" }).click();
    assert.equal(await cards.count(), 14);
    assert.equal(await page.locator(".more").count(), 0);
  });
  await check("All 14 card links accurately describe the quoted Identity MD search", async () => {
    const links = await page.locator(".card-actions a").evaluateAll((els) => els.map((el) => ({ label: el.textContent, href: el.href, target: el.target, rel: el.rel })));
    assert.equal(links.length, 14);
    for (const link of links) {
      assert.equal(link.label, "Search on X");
      assert.equal(new URL(link.href).searchParams.get("q"), '"Identity MD"');
      assert.equal(link.target, "_blank");
      assert.match(link.rel, /noopener/);
    }
    for (const selector of [".site-head > .btn", ".site-foot a"]) {
      assert.equal(new URL(await page.locator(selector).getAttribute("href")).searchParams.get("q"), '"Identity MD"');
    }
  });
  await check("Newest reorders the list and resets pagination", async () => {
    await page.getByRole("button", { name: "Newest", exact: true }).click();
    assert.equal(await firstAuthor(), "Pepe Prime");
    assert.equal(await cards.count(), 8);
    await page.getByRole("button", { name: "Top", exact: true }).click();
    assert.equal(await firstAuthor(), "Agent Pepe");
  });
  await check("Topic filter, combined search and active-chip toggle", async () => {
    const chip = page.getByRole("button", { name: "Contracts", exact: true });
    await chip.click();
    assert.equal(await cards.count(), 4);
    assert.equal(await page.locator("#posts-title").innerText(), "4 of 14 tweets");
    await search.fill("amphibianal");
    assert.equal(await cards.count(), 1);
    assert.equal(await firstAuthor(), "Amphibian Al");
    await search.fill("");
    await chip.click();
    assert.equal(await page.getByRole("button", { name: "All topics", exact: true }).getAttribute("aria-pressed"), "true");
  });
  await check("Search matches text, names and handles with whitespace/case normalization", async () => {
    for (const query of ["  MORNING  ", "agent pepe", "agentpepe"]) {
      await search.fill(query);
      assert.equal(await cards.count(), 1);
      assert.equal(await firstAuthor(), "Agent Pepe");
    }
  });
  await check("Empty search names the query; clearing restores results and focus", async () => {
    await search.fill("zz-no-result");
    assert.equal(await cards.count(), 0);
    assert.equal(await page.locator(".empty-title").innerText(), 'No tweets match "zz-no-result".');
    await page.getByRole("button", { name: "Clear search" }).click();
    assert.equal(await cards.count(), 8);
    assert.equal(await search.evaluate((el) => el === document.activeElement), true);
  });
  await check("Copy search link writes the actual clipboard and announces an accurate result", async () => {
    await page.getByRole("button", { name: "Copy link", exact: true }).first().click();
    assert.equal(await page.locator(".toast-text").innerText(), "Copied the X search link.");
    assert.equal(new URL(await page.evaluate(() => navigator.clipboard.readText())).searchParams.get("q"), '"Identity MD"');
    await page.getByRole("button", { name: "Dismiss", exact: true }).click();
    assert.equal(await page.locator(".toast").isVisible(), false);
  });
  await check("Clipboard failure offers the correctly named search action", async () => {
    await page.evaluate(() => Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: async () => { throw new Error("Clipboard denied for test"); } }));
    await page.getByRole("button", { name: "Copy link", exact: true }).first().click();
    assert.equal(await page.locator(".toast-text").innerText(), "Unable to copy. Use Search on X and copy its address instead.");
    await page.getByRole("button", { name: "Dismiss", exact: true }).click();
  });
  await check("Search action opens the promised URL in a separate tab", async () => {
    const popupPromise = page.waitForEvent("popup");
    await page.locator(".card-actions a").first().click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.equal(new URL(popup.url()).searchParams.get("q"), '"Identity MD"');
    assert.equal(await popup.evaluate(() => window.opener), null);
    await popup.close();
  });
  await check("Keyboard skip link, visible focus and sorting", async () => {
    await page.goto(url);
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(".skip").evaluate((el) => el === document.activeElement), true);
    await page.screenshot({ path: `${out}/focus-skip.png` });
    await page.keyboard.press("Enter");
    assert.ok(page.url().endsWith("#posts"));
    await page.getByRole("button", { name: "Newest", exact: true }).focus();
    await page.keyboard.press("Space");
    assert.equal(await firstAuthor(), "Pepe Prime");
    await page.screenshot({ path: `${out}/focus-sort.png` });
  });
  await check("Footer speaks to visitors without source-file instructions", async () => {
    assert.equal(await page.locator("footer").innerText(), "Find tweets about Identity MD on X");
    assert.equal(await page.locator("code").count(), 0);
  });
  await check("Reduced motion stops the mascot pulse", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await page.locator(".hero-art .pepe-core-pulse").evaluate((el) => getComputedStyle(el).animationName), "none");
  });
  await check("Forced colors preserves visible selection", async () => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.screenshot({ path: `${out}/forced-colors.png` });
    const styles = await page.locator('[aria-pressed="true"]').first().evaluate((el) => ({ fill: getComputedStyle(el).backgroundColor, text: getComputedStyle(el).color }));
    assert.notEqual(styles.fill, styles.text);
    await page.emulateMedia({ forcedColors: "none" });
  });
  if (process.env.IMD_AXE) {
    await check("Automated axe accessibility scan (WCAG 2.2 AA tags)", async () => {
      const { default: AxeBuilder } = await import(pathToFileURL(process.env.IMD_AXE).href);
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      assert.deepEqual(audit.violations.map((v) => ({ id: v.id, impact: v.impact })), []);
      return `${audit.passes.length} rules passed, ${audit.incomplete.length} need manual review`;
    });
  } else limitations.push("Axe scan not requested; set IMD_AXE to @axe-core/playwright/dist/index.mjs.");
  await check("No console errors, resource failures or missing files at a static subpath", () => assert.deepEqual(errors, []));
  await browser.close();
  browser = null;

  try {
    browser = await webkit.launch({ headless: true });
    await check("WebKit sort, search and first-screen action", async () => {
      const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await p.goto(url);
      await p.getByRole("button", { name: "Newest", exact: true }).click();
      assert.equal(await p.locator(".who-name").first().innerText(), "Pepe Prime");
      await p.getByLabel("Search tweets", { exact: true }).fill("agentpepe");
      assert.equal(await p.locator(".card").count(), 1);
      const box = await p.locator(".card-actions a").boundingBox();
      assert.ok(box.y + box.height <= 844);
    });
  } catch (error) {
    limitations.push(`WebKit could not launch: ${error.message}`);
  }
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
await writeFile(`${out}/results.json`, JSON.stringify({ results, limitations }, null, 2));
console.log(JSON.stringify({ results, limitations }, null, 2));
if (results.some((r) => !r.passed)) process.exitCode = 1;
