import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const outputPath = join(dist, "standalone.html");

let html = await readFile(join(dist, "index.html"), "utf8");

html = await inlineStyles(html);
html = await inlineScripts(html);
html = await inlineManifestAndIcon(html);
html = html.replace(/<script\b[^>]*src="\/sw\.js"[^>]*><\/script>/g, "");

await writeFile(outputPath, html, "utf8");
console.log(`Created ${outputPath}`);

async function inlineStyles(source) {
  return replaceAsync(source, /<link rel="stylesheet" crossorigin href="([^"]+)">/g, async (_match, href) => {
    const css = await readDistAsset(href);
    return `<style>${css}</style>`;
  });
}

async function inlineScripts(source) {
  return replaceAsync(source, /<script type="module" crossorigin src="([^"]+)"><\/script>/g, async (_match, href) => {
    let js = await readDistAsset(href);
    js = disableServiceWorkerRegistration(js);
    return `<script type="module">${js}</script>`;
  });
}

async function inlineManifestAndIcon(source) {
  let next = source;
  next = next.replace(/<link rel="manifest" href="\/manifest\.webmanifest" \/>/, "");

  const icon = await readFile(join(dist, "icon.svg"), "utf8").catch(() => "");
  if (icon) {
    const iconUrl = `data:image/svg+xml;base64,${Buffer.from(icon).toString("base64")}`;
    next = next.replace(/<link rel="icon" href="\/icon\.svg" \/>/, `<link rel="icon" href="${iconUrl}" />`);
  }

  return next;
}

async function readDistAsset(href) {
  const normalized = href.replace(/^\//, "");
  return readFile(join(dist, normalized), "utf8");
}

function disableServiceWorkerRegistration(js) {
  return js
    .replaceAll('"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})});', "")
    .replaceAll("'serviceWorker'in navigator&&window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})});", "");
}

async function replaceAsync(source, pattern, replacer) {
  const matches = [...source.matchAll(pattern)];
  let result = source;

  for (const match of matches.reverse()) {
    const replacement = await replacer(...match);
    result = `${result.slice(0, match.index)}${replacement}${result.slice(match.index + match[0].length)}`;
  }

  return result;
}

// Keep this script honest: fail if Vite changes the asset shape and nothing was inlined.
const assetFiles = await readdir(join(dist, "assets")).catch(() => []);
if (!html.includes("<script type=\"module\">") || !html.includes("<style>") || assetFiles.length === 0) {
  throw new Error("Standalone build did not inline the expected Vite assets.");
}
