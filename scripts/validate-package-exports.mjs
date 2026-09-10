import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import * as React from "react";
import { renderToString } from "react-dom/server";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import pkg from "../package.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
assert.equal(pkg.dependencies.mazey, "^5.9.1");
assert.ok(!Object.hasOwn(pkg.devDependencies, "mazey"), "Mazey must be a runtime dependency only");
assert.deepEqual(pkg.files, [ "dist", "LICENSE", "README.md" ]);

const esmSource = readFileSync(path.join(root, pkg.module), "utf8");
const cjsSource = readFileSync(path.join(root, pkg.main), "utf8");
assert.match(esmSource, /import\s*\{[^}]*getSystemTheme[^}]*\}\s*from\s*["']mazey["']/);
assert.match(cjsSource, /require\(["']mazey["']\)/);
for (const source of [ esmSource, cjsSource ]) {
  assert.doesNotMatch(source, /prefers-color-scheme/, "Module outputs must not embed the OS reader");
}

const esm = await import(pathToFileURL(path.join(root, pkg.module)));
const cjs = createRequire(import.meta.url)(path.join(root, pkg.main));
assert.equal(typeof esm.ThemeToggle, "function");
assert.equal(typeof cjs.ThemeToggle, "function");

const declarations = readFileSync(path.join(root, pkg.types), "utf8");
assert.match(declarations, /ThemeToggle/);
assert.match(declarations, /ThemeToggleProps/);
assert.match(declarations, /ThemeToggleTheme/);
assert.match(declarations, /import[^;]*ResolvedTheme[^;]*from ['"]mazey['"]/);
assert.match(declarations, /type ThemeToggleTheme = ResolvedTheme/);
assert.match(declarations, /interface ThemeToggleProps/);
assert.match(declarations, /theme\?: ThemeToggleTheme/);
assert.match(declarations, /onThemeChange: /);
const iife = readFileSync(path.join(root, pkg.unpkg), "utf8");
assert.match(iife, /MAZEY_UI/);
assert.doesNotMatch(iife, /process\.env|require\(/);
for (const systemTheme of [ "light", "dark", null ]) {
  const context = { React };
  let reads = 0;
  if (systemTheme !== null) {
    context.window = {
      matchMedia(query) {
        assert.equal(query, "(prefers-color-scheme: dark)");
        reads++;
        return { matches: systemTheme === "dark" };
      },
    };
  }
  runInNewContext(iife, context);
  assert.equal(typeof context.MAZEY_UI.ThemeToggle, "function");
  const html = renderToString(React.createElement(context.MAZEY_UI.ThemeToggle, {
    onThemeChange: () => undefined,
  }));
  assert.ok(html.includes(`data-mazey-ui-theme="${systemTheme ?? "light"}"`));
  assert.equal(reads, systemTheme === null ? 0 : 1);
  renderToString(React.createElement(context.MAZEY_UI.ThemeToggle, {
    theme: "dark", onThemeChange: () => undefined,
  }));
  assert.equal(reads, systemTheme === null ? 0 : 1, "Controlled IIFE must skip OS detection");
}
assert.match(readFileSync(path.join(root, "dist/styles.css"), "utf8"), /\.mazey-ui-theme-toggle/);

for (const file of requiredFiles.filter((file) => file.endsWith(".map"))) {
  const map = JSON.parse(readFileSync(path.join(root, file), "utf8"));
  assert.equal(map.version, 3);
  assert.ok(map.sources.length > 0, `Empty source map: ${file}`);
}

const cache = mkdtempSync(path.join(tmpdir(), "mazey-ui-pack-"));
try {
  // Use the shell to support npm.cmd on Windows; keep paths out of shell text.
  const [ packed ] = JSON.parse(execSync("npm pack --dry-run --ignore-scripts --json", {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, npm_config_cache: cache },
  }));
  assert.deepEqual(packed.files.map((file) => file.path).sort(), [ ...requiredFiles, "LICENSE", "README.md", "package.json" ].sort());
} finally {
  rmSync(cache, { recursive: true, force: true });
}

console.log("Validated runtime dependencies, exports, declarations, standalone IIFE, CSS, source maps, and packed contents.");
