import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { waitFor } from "@testing-library/react";

const isSafePWAEnv = vi.fn();
const isStandalonePWA = vi.fn();
const watchServiceWorkerUpdates = vi.fn();

vi.mock("mazey", () => ({
  isSafePWAEnv,
  isStandalonePWA,
  watchServiceWorkerUpdates,
}));

const runtimeConfig = {
  packageName: "mazey-ui",
  installCommand: "npm install mazey-ui",
  themeStorageKey: "mazey-ui-theme",
  themeColorLight: "#f7f9fc",
  themeColorDark: "#0d1424",
  pwa: { enabled: false, scope: "/mazey-ui/", serviceWorkerUrl: "/mazey-ui/service-worker.js" },
};

describe("website PWA runtime", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal("__SITE_RUNTIME_CONFIG__", runtimeConfig);
    isSafePWAEnv.mockReturnValue(false);
    isStandalonePWA.mockReturnValue(false);
    document.body.innerHTML = "<button type=\"button\" data-pwa-install hidden>Install app</button><span data-pwa-status></span>";
  });

  it("reports an unavailable browser install prompt without an unhandled rejection", async () => {
    const { initializePwa } = await import("../../site/pwa");
    const prompt = vi.fn().mockRejectedValue(new Error("prompt unavailable"));
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.defineProperties(event, {
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: "dismissed" }) },
    });

    initializePwa();
    window.dispatchEvent(event);
    const button = document.querySelector<HTMLButtonElement>("[data-pwa-install]")!;
    button.click();

    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
    await waitFor(() => expect(document.querySelector("[data-pwa-status]")).toHaveTextContent("The browser could not open the installation prompt."));
    expect(button).toHaveAttribute("hidden");
  });
});
