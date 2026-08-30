import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import projectConfig from "../project.config.js";

const docs = path.resolve("docs");
const files = (directory) => readdirSync(directory).flatMap((name) => {
  const file = path.join(directory, name);
  return statSync(file).isDirectory() ? files(file) : [ file ];
});
const stable = [ "index.html", "playground/index.html", "api/index.html" ];
const canonicals = new Set();
for (const relative of stable) {
  const html = readFileSync(path.join(docs, relative), "utf8");
  assert.match(html, /<html[^>]*lang=(?:"en"|en)/i);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${relative} must contain one h1`);
  assert.equal((html.match(/<meta\b(?=[^>]*\bname=(?:"description"|description))[^>]*>/gi) || []).length, 1, `${relative} must contain one description`);
  assert.match(html, /<meta\s+property=(?:"og:title"|og:title)/i);
  assert.match(html, /<meta\s+property=(?:"og:image"|og:image)/i);
  assert.match(html, /<meta\s+name=(?:"twitter:card"|twitter:card)/i);
  const canonical = html.match(/<link\s+rel=(?:"canonical"|canonical)\s+href=(?:"([^"]+)"|([^\s>]+))/i)?.slice(1).find(Boolean);
  assert.ok(canonical?.startsWith("https://chengchuu.github.io/mazey-ui/"));
  assert.ok(!canonicals.has(canonical));
  canonicals.add(canonical);
  assert.equal((html.match(/data-theme-toggle/g) || []).length, 1);
}
for (const file of files(path.join(docs, "api")).filter((entry) => entry.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  assert.equal((html.match(/<select\b[^>]*id=(?:"tsd-theme"|tsd-theme)/gi) || []).length, 1);
  assert.ok(!/option\b[^>]*value=(?:"os"|os)/i.test(html));
  assert.match(html, /option\b[^>]*value=(?:"light"|light)/i);
  assert.match(html, /option\b[^>]*value=(?:"dark"|dark)/i);
  assert.equal((html.match(/<meta\b(?=[^>]*\bname=(?:"description"|description))[^>]*>/gi) || []).length, 1, `${file} must contain one description`);
  assert.ok(!/document\.body\.style\.display/.test(html), `TypeDoc theme bootstrap remains in ${file}`);
  assert.ok(html.indexOf("class=\"title\"") < html.indexOf("class=\"site-project-links\""), `Project links must follow the TypeDoc title in ${file}`);
  assert.ok(!/href="\/(?!mazey-ui\/)/.test(html), `Out-of-scope path in ${file}`);
}
assert.match(readFileSync(path.join(docs, "sitemap.xml"), "utf8"), /<urlset/);
assert.match(readFileSync(path.join(docs, "robots.txt"), "utf8"), new RegExp(projectConfig.site.basePath));
console.log("Validated Pages SEO, theme controls, TypeDoc controls, and scoped paths.");
