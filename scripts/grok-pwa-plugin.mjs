/**
 * Dev/preview (Vite) half of the platform PWA chrome: serves the ?install=1
 * tutorial and the per-app manifest. The deployed-app half lives in
 * server/middleware/grok-pwa.ts; both share scripts/grok-pwa-shared.mjs.
 *
 * App documents are not rewritten. The app sets its own PWA tags and
 * per-page title, description and share tags (src/routes), which the old
 * head injection overwrote with one site-wide card plus a third-party banner
 * script. The OG-identity virtual module stays available for tooling.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  acceptsHtml,
  isDocumentPath,
  isInstallQuery,
  renderInstallPageHtml,
  renderWebManifest,
  snapshotOgIdentity,
} from "./grok-pwa-shared.mjs";

export const GROK_OG_IDENTITY_ID = "virtual:grok-og-identity";

const INSTALL_PAGE_PATH = join(dirname(fileURLToPath(import.meta.url)), "install-page.html");

function requestHost(req) {
  const forwarded = req.headers["x-forwarded-host"];
  const host = forwarded ?? req.headers.host ?? req.headers[":authority"];
  return Array.isArray(host) ? host[0] : host;
}

export function renderInstallPage(hostHeader, url = "/") {
  const template = readFileSync(INSTALL_PAGE_PATH, "utf8");
  return renderInstallPageHtml(template, { host: hostHeader, url });
}

function sendHtml(res, html) {
  const body = Buffer.from(html, "utf8");
  res.statusCode = 200;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "no-cache");
  res.setHeader("content-length", String(body.byteLength));
  res.end(body);
}

function serveGrokPwa(middlewares) {
  middlewares.use((req, res, next) => {
    const rawUrl = req.url ?? "";
    const pathOnly = rawUrl.split("?", 1)[0] ?? "";
    const method = (req.method ?? "GET").toUpperCase();
    if (method !== "GET") {
      next();
      return;
    }

    if (pathOnly === "/__grok/manifest.webmanifest" || pathOnly === "/__grok/manifest.json") {
      const body = Buffer.from(renderWebManifest(requestHost(req)), "utf8");
      res.statusCode = 200;
      res.setHeader("content-type", "application/manifest+json; charset=utf-8");
      res.setHeader("cache-control", "no-cache");
      res.setHeader("content-length", String(body.byteLength));
      res.end(body);
      return;
    }

    if (isInstallQuery(rawUrl) && isDocumentPath(pathOnly) && acceptsHtml(req.headers.accept)) {
      try {
        sendHtml(res, renderInstallPage(requestHost(req), rawUrl));
      } catch (err) {
        console.error("[app-builder] install page missing:", err);
        res.statusCode = 500;
        res.end("install page unavailable");
      }
      return;
    }

    next();
  });
}

export function grokPwaPlugin() {
  let root = process.cwd();
  return {
    name: "app-builder:grok-pwa",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === GROK_OG_IDENTITY_ID) return `\0${GROK_OG_IDENTITY_ID}`;
    },
    load(id) {
      if (id !== `\0${GROK_OG_IDENTITY_ID}`) return;
      return `export const grokOgIdentity = ${JSON.stringify(snapshotOgIdentity(root))};`;
    },
    configureServer(server) {
      // Registered directly (not in a returned post-hook) so it runs BEFORE
      // TanStack Start's SSR middleware, like the auth-popup plugin.
      serveGrokPwa(server.middlewares);
    },
    configurePreviewServer(server) {
      serveGrokPwa(server.middlewares);
    },
  };
}
