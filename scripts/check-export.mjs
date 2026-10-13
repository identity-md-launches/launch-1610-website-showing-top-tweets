// Static checks on dist/: every asset URL is relative, every referenced local
// file exists, and the share tags are present. Run after `vite build`.
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.argv[2] ?? "dist");
const html = await readFile(`${root}/index.html`, "utf8");
const problems = [];

const refs = [...html.matchAll(/(?:src|href|content)="([^"]+)"/g)].map((m) => m[1]);
for (const ref of refs) {
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith("#") || ref.startsWith("data:")) continue;
  if (!/^\.\.?\//.test(ref)) {
    if (/\.(js|css|png|svg|ico|webp|jpg)$/.test(ref)) problems.push(`absolute asset URL: ${ref}`);
    continue;
  }
  const file = resolve(root, ref);
  try {
    await stat(file);
  } catch {
    problems.push(`missing asset: ${ref}`);
  }
}

for (const tag of [
  /<title>[^<]{3,}<\/title>/,
  /<link rel="icon"/,
  /<meta name="description" content="[^"]{10,}"/,
  /<meta property="og:title" content="[^"]{3,}"/,
  /<meta property="og:image" content="[^"]+"/,
]) {
  if (!tag.test(html)) problems.push(`share tag missing: ${tag}`);
}

const css = [...html.matchAll(/href="(\.\/assets\/[^"]+\.css)"/g)].map((m) => m[1]);
for (const ref of css) {
  const text = await readFile(resolve(root, ref), "utf8");
  if (/url\(\s*["']?\//.test(text)) problems.push(`absolute url() in ${ref}`);
}

if (problems.length) {
  console.error("export check failed:\n" + problems.map((p) => `  ${p}`).join("\n"));
  process.exit(1);
}
console.log(`export check passed: ${refs.length} references in ${root}/index.html, all relative and present`);
