import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import projectConfig from "../project.config.js";

const docs = path.resolve("docs");
const manifest = JSON.parse(readFileSync(path.join(docs, "manifest.webmanifest"), "utf8"));
assert.equal(manifest.id, projectConfig.site.basePath);
assert.equal(manifest.scope, projectConfig.site.basePath);
assert.equal(manifest.start_url, projectConfig.site.basePath);
assert.deepEqual(manifest.icons.map((icon) => icon.sizes), [ "192x192", "512x512", "512x512" ]);
for (const icon of manifest.icons) assert.ok(existsSync(path.join(docs, icon.src.replace(projectConfig.site.basePath, ""))));
const worker = readFileSync(path.join(docs, "service-worker.js"), "utf8");
assert.match(worker, /mazey-ui-site-[a-f0-9]{16}/);
assert.match(worker, /request\.method !== "GET"/);
assert.match(worker, /url\.pathname\.endsWith\("\.map"\)/);
assert.match(worker, /response\.type !== "opaque"/);
assert.ok(!worker.includes("__CACHE_NAME__"));
console.log("Validated manifest, supplied icons, service-worker scope, and cache policy.");
