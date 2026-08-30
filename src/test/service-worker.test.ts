import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("site/service-worker.js", "utf8");

describe("service worker source", () => {
  it("limits requests and caches to the project scope", () => {
    expect(source).toContain("request.method !== \"GET\"");
    expect(source).toContain("url.pathname.startsWith(BASE_PATH)");
    expect(source).toContain("url.pathname.endsWith(\".map\")");
    expect(source).toContain("response.type !== \"opaque\"");
    expect(source).toContain("key.startsWith(\"mazey-ui-site-\")");
    expect(source).toContain("async function matchCache");
    expect(source).toContain("MAX_RUNTIME_ENTRIES = 80");
  });

  it("uses bounded network and cache strategies", () => {
    expect(source).toContain("networkFirst(request)");
    expect(source).toContain("cacheFirst(request)");
    expect(source).toContain("request.destination === \"image\"");
    expect(source).toContain("[ \"script\", \"style\" ]");
  });
});
