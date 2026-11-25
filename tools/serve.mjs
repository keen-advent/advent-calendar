// Minimal static file server for local development. No dependencies.
// Usage: node tools/serve.mjs [port] [folder]
//   Serves ./site by default; PORT env var wins over the port argument.
//   Pass a folder (relative to the project root) to serve something else, e.g. the
//   original prototype for side-by-side comparison.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const folder = process.argv[3] ? `${process.argv[3].replace(/\/+$/, "")}/` : "site/";
const root = fileURLToPath(new URL(`../${encodeURI(folder)}`, import.meta.url));
const port = Number(process.env.PORT) || Number(process.argv[2]) || 5178;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  let rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  if (rel === "" || rel.endsWith(sep)) rel = join(rel, "index.html");
  const file = join(root, rel);
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
