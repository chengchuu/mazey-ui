import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import pkg from "../package.json" with { type: "json" };

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const requiredFiles = [
  "dist/index.js",
  "dist/index.js.map",
  "dist/index.cjs",
  "dist/index.cjs.map",
  "dist/index.d.ts",
  "dist/styles.css",
  "dist/styles.css.map",
  "dist/mazey-ui.min.js",
  "dist/mazey-ui.min.js.map",
];

for (const file of requiredFiles) assert.ok(existsSync(path.join(root, file)), `Missing ${file}`);

assert.equal(pkg.main, "./dist/index.cjs");
assert.equal(pkg.module, "./dist/index.js");
assert.equal(pkg.types, "./dist/index.d.ts");
assert.equal(pkg.unpkg, "./dist/mazey-ui.min.js");
assert.equal(pkg.jsdelivr, "./dist/mazey-ui.min.js");
assert.equal(pkg.exports["./styles.css"], "./dist/styles.css");

const esm = await import(pathToFileURL(path.join(root, pkg.module)));
const cjs = createRequire(import.meta.url)(path.join(root, pkg.main));
assert.equal(typeof esm.ThemeToggle, "function");
assert.equal(typeof cjs.ThemeToggle, "function");

const declarations = readFileSync(path.join(root, pkg.types), "utf8");
assert.match(declarations, /ThemeToggle/);
assert.match(declarations, /ThemeToggleProps/);
assert.match(declarations, /ThemeToggleTheme/);
const iife = readFileSync(path.join(root, pkg.unpkg), "utf8");
assert.match(iife, /MAZEY_UI/);
assert.doesNotMatch(iife, /process\.env|require\(/);
assert.match(readFileSync(path.join(root, "dist/styles.css"), "utf8"), /\.mazey-ui-theme-toggle/);

console.log("Validated package exports, declarations, bundles, CSS, and source maps.");
