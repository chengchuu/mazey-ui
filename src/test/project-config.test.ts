import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import pkg from "../../package.json";

const projectConfigSource = readFileSync(resolve("project.config.js"), "utf8");
const apiCss = readFileSync(resolve("site/api.css"), "utf8");
const siteCss = readFileSync(resolve("site/site.css"), "utf8");
const pwaSource = readFileSync(resolve("site/pwa.ts"), "utf8");

describe("project delivery configuration", () => {
  it("keeps package and site build boundaries separate", () => {
    expect(pkg.main).toBe("./dist/index.cjs");
    expect(pkg.module).toBe("./dist/index.js");
    expect(pkg.exports["./styles.css"]).toBe("./dist/styles.css");
    expect(pkg.files).toEqual([ "dist", "LICENSE", "README.md" ]);
    expect(pkg.dependencies).toEqual({
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    });
    expect("peerDependencies" in pkg).toBe(false);
    expect(projectConfigSource).toContain("const basePath = siteUrl.pathname.endsWith(\"/\")");
    expect(projectConfigSource).toContain("https://www.npmjs.com/package/mazey-ui");
  });

  it("uses the requested GitHub Actions without package-manager caching", () => {
    const pages = readFileSync(resolve(".github/workflows/pages.yml"), "utf8");
    const publish = readFileSync(resolve(".github/workflows/publish-npm.yml"), "utf8");
    for (const workflow of [ pages, publish ]) {
      expect(workflow).toContain("actions/checkout@v7");
      expect(workflow).toContain("actions/setup-node@v7");
      expect(workflow).toContain("package-manager-cache: false");
      expect(workflow).toContain("npm install");
      expect(workflow).not.toMatch(/npm ci|actions\/cache|cache-dependency-path|cache:\s*(?:npm|pnpm)/);
    }
    expect(pages).toContain("actions/configure-pages@v6");
    expect(pages).toContain("actions/upload-pages-artifact@v5");
    expect(pages).toContain("actions/deploy-pages@v5");
    expect(publish).toContain("github.event_name == 'push'");
    expect(publish).toContain("refs/heads/release/v");
    expect((publish.match(/NPM_TOKEN/g) || [])).toHaveLength(1);
  });

  it("keeps update prompts and the TypeDoc toolbar responsive", () => {
    expect(siteCss).toMatch(/\.pwa-update\s*\{[^}]*width:\s*min\(26rem, calc\(100vw - 2rem\)\)[^}]*box-sizing:\s*border-box/s);
    expect(siteCss).toMatch(/\.pwa-update\[hidden\]\s*\{\s*display:\s*none/);
    expect(apiCss).toMatch(/\.site-project-links\s*\{[^}]*flex:\s*1[^}]*min-width:\s*0[^}]*overflow-x:\s*auto/s);
    expect(apiCss).toMatch(/\.site-pwa-update\s*\{[^}]*width:\s*min\(26rem, calc\(100vw - 2rem\)\)[^}]*box-sizing:\s*border-box/s);
    expect(apiCss).toContain(".site-project-links a:not(:first-child)");
  });

  it("reloads only after explicit service-worker update activation", () => {
    expect(pwaSource).toContain("let reloadRequested = false;");
    expect(pwaSource).toContain("if (!reloadRequested) return;");
    expect(pwaSource).toContain("reloadRequested = watcher.activateWaiting();");
    expect(pwaSource).toContain("if (reloadRequested) updateButton.disabled = true;");
  });
});
