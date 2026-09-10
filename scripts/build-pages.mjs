import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import projectConfig from "../project.config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "docs");
const apiSource = path.join(root, "dist-api");
const siteSource = path.join(root, "dist-dev");
const marker = "<!-- mazey-ui-pages -->";

function files(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const file = path.join(directory, entry);
    return statSync(file).isDirectory() ? files(file) : [ file ];
  });
}

function themeToggle() {
  return "<button class=\"theme-toggle\" type=\"button\" data-theme-toggle aria-label=\"Current theme: Light. Switch to dark theme.\"><svg width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\" aria-hidden=\"true\" focusable=\"false\" data-theme-icon=\"light\"><path d=\"M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708\"/></svg><svg width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\" aria-hidden=\"true\" focusable=\"false\" data-theme-icon=\"dark\" hidden><path d=\"M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278\"/><path d=\"M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z\"/></svg></button>";
}

function transformApi(html, relative) {
  const selectors = [ ...html.matchAll(/<select\b(?=[^>]*\bid=["']tsd-theme["'])[^>]*>[\s\S]*?<\/select>/gi) ];
  if (selectors.length !== 1) throw new Error(`Expected one TypeDoc theme selector in ${relative}`);
  const osOptions = [ ...selectors[0][0].matchAll(/<option\b(?=[^>]*\bvalue=["']os["'])[^>]*>[\s\S]*?<\/option>/gi) ];
  if (osOptions.length !== 1) throw new Error(`Expected one TypeDoc OS option in ${relative}`);
  let output = html.replace(selectors[0][0], selectors[0][0].replace(osOptions[0][0], ""));
  const descriptions = [ ...output.matchAll(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/gi) ];
  if (descriptions.length !== 1) throw new Error(`Expected one TypeDoc description in ${relative}`);
  output = output.replace(descriptions[0][0], "");
  const themeBootstraps = [ ...output.matchAll(/<script>[^<]*document\.documentElement\.dataset\.theme[^<]*document\.body\.style\.display[^<]*<\/script>/gi) ];
  if (themeBootstraps.length !== 1) throw new Error(`Expected one TypeDoc theme bootstrap in ${relative}`);
  output = output.replace(themeBootstraps[0][0], "");
  const route = relative.replaceAll(path.sep, "/").replace(/index\.html$/, "");
  const canonical = new URL(route, new URL("api/", projectConfig.urls.site)).href;
  const sourceTitle = output.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  if (!sourceTitle) throw new Error(`Missing title in ${relative}`);
  const title = relative === "index.html" ? projectConfig.site.pages.api.title : `${sourceTitle.replace(/ \| .*$/, "")} - Mazey UI API`;
  const description = relative === "index.html" ? projectConfig.site.pages.api.description : `TypeScript API reference for ${sourceTitle.replace(/ \| .*$/, "")} in Mazey UI.`;
  const socialImage = new URL(`images/${projectConfig.assets.openGraph}`, projectConfig.urls.site).href;
  const metadata = `${marker}<meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><link rel="icon" href="${projectConfig.site.basePath}images/${projectConfig.assets.favicon}" type="image/png"><link rel="manifest" href="${projectConfig.pwa.manifest}"><meta name="theme-color" content="${projectConfig.site.theme.lightColor}" data-theme-color><meta property="og:type" content="website"><meta property="og:site_name" content="Mazey UI"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${socialImage}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Mazey UI logo and component artwork."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${socialImage}"><meta name="twitter:image:alt" content="Mazey UI logo and component artwork."><link rel="stylesheet" href="${projectConfig.site.basePath}assets/shared.css"><link rel="stylesheet" href="${projectConfig.site.basePath}assets/api.css"><script src="${projectConfig.site.basePath}assets/theme.js" defer></script><script src="${projectConfig.site.basePath}assets/shared.js" defer></script><script src="${projectConfig.site.basePath}assets/api.js" defer></script>`;
  output = output.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`).replace("</head>", `${metadata}</head>`);
  const titleLinks = [ ...output.matchAll(/<a href="[^"]*index\.html" class="title">[\s\S]*?<\/a>/gi) ];
  if (titleLinks.length !== 1) throw new Error(`Expected one TypeDoc toolbar title in ${relative}`);
  const nav = `<nav class="site-project-links" aria-label="Project links"><a href="${projectConfig.urls.site}">Home</a><a href="${new URL("playground/", projectConfig.urls.site).href}">Playground</a><a href="${new URL("api/", projectConfig.urls.site).href}">API</a><a href="${projectConfig.urls.github}">GitHub</a><a href="${projectConfig.urls.npm}">npm</a>${themeToggle()}</nav>`;
  output = output.replace(titleLinks[0][0], `${titleLinks[0][0]}${nav}`);
  const update = "<aside class=\"site-pwa-update\" aria-label=\"Website update\" data-pwa-update hidden><span>A new website version is available.</span><button class=\"btn btn-sm btn-primary\" type=\"button\" data-pwa-update-now>Update now</button></aside>";
  output = output.replace("</body>", `${update}</body>`);
  let primaryHeadingSeen = false;
  return output.replace(/<h1(\b[^>]*)>([\s\S]*?)<\/h1>/gi, (_heading, attributes, content) => {
    if (!primaryHeadingSeen) {
      primaryHeadingSeen = true;
      return `<h1${attributes}>${content}</h1>`;
    }
    return `<h2${attributes}>${content}</h2>`;
  });
}

rmSync(docs, { recursive: true, force: true });
mkdirSync(docs, { recursive: true });
cpSync(siteSource, docs, { recursive: true });
cpSync(apiSource, path.join(docs, "api"), { recursive: true });
cpSync(path.join(root, "images"), path.join(docs, "images"), { recursive: true });

for (const file of files(path.join(docs, "api")).filter((entry) => entry.endsWith(".html"))) {
  const relative = path.relative(path.join(docs, "api"), file);
  writeFileSync(file, transformApi(readFileSync(file, "utf8"), relative));
}

const manifest = {
  name: projectConfig.pwa.name,
  short_name: projectConfig.pwa.shortName,
  description: projectConfig.pwa.description,
  id: projectConfig.site.basePath,
  start_url: projectConfig.site.basePath,
  scope: projectConfig.site.basePath,
  display: "standalone",
  background_color: projectConfig.pwa.backgroundColor,
  theme_color: projectConfig.pwa.themeColor,
  icons: [
    { src: `${projectConfig.site.basePath}images/logo-192x192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: `${projectConfig.site.basePath}images/logo-512x512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
    { src: `${projectConfig.site.basePath}images/logo-maskable-512x512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};
writeFileSync(path.join(docs, "manifest.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(docs, "robots.txt"), `User-agent: *\nAllow: ${projectConfig.site.basePath}\nSitemap: ${new URL("sitemap.xml", projectConfig.urls.site).href}\n`);
const sitemapUrls = [ projectConfig.urls.site, new URL("playground/", projectConfig.urls.site).href, new URL("api/", projectConfig.urls.site).href ];
writeFileSync(path.join(docs, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>\n`);

const pageHash = createHash("sha256");
for (const file of files(docs).filter((entry) => !entry.endsWith(".map")).sort()) {
  pageHash.update(path.relative(docs, file));
  pageHash.update(readFileSync(file));
}
const fingerprint = pageHash.digest("hex").slice(0, 16);
const shell = [ `${projectConfig.site.basePath}index.html`, `${projectConfig.site.basePath}playground/index.html`, `${projectConfig.site.basePath}api/index.html`, projectConfig.pwa.manifest ];
const worker = readFileSync(path.join(root, "site/service-worker.js"), "utf8")
  .replace("__CACHE_NAME__", `${projectConfig.pwa.cachePrefix}${fingerprint}`)
  .replace("__BASE_PATH__", projectConfig.site.basePath)
  .replace("__APP_SHELL__", JSON.stringify(shell));
writeFileSync(path.join(docs, "service-worker.js"), worker);
console.log(`Assembled ${files(docs).length} Pages files with cache fingerprint ${fingerprint}.`);
