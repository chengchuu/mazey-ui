import {
  beforeEach, describe, expect, it, vi, 
} from "vitest";

const resolveThemePreference = vi.fn();
const setThemePreference = vi.fn();

vi.mock("mazey", () => ({
  resolveThemePreference,
  setThemePreference,
}));

const runtimeConfig = {
  packageName: "mazey-ui",
  installCommand: "npm install mazey-ui",
  themeStorageKey: "mazey-ui-theme",
  themeColorLight: "#f7f9fc",
  themeColorDark: "#0d1424",
  pwa: { enabled: false, scope: "/mazey-ui/", serviceWorkerUrl: "/mazey-ui/service-worker.js" },
};

function buttonHtml() {
  return "<meta data-theme-color><button type=\"button\" data-theme-toggle><svg data-theme-icon=\"light\"></svg><svg data-theme-icon=\"dark\" hidden></svg></button>";
}

describe("website theme runtime", () => {
  beforeEach(() => {
    window.mazeyUiThemeCleanup?.();
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal("__SITE_RUNTIME_CONFIG__", runtimeConfig);
    localStorage.clear();
    document.head.innerHTML = buttonHtml();
    document.body.innerHTML = buttonHtml();
    delete window.mazeyUiThemeCleanup;
    resolveThemePreference.mockReturnValue({ value: "light", label: "Light", source: "system" });
    setThemePreference.mockReturnValue(true);
  });

  it("applies the resolved concrete theme without persisting the project key", async () => {
    await import("../../site/theme");

    expect(resolveThemePreference).toHaveBeenCalledWith("mazey-ui-theme");
    expect(localStorage.getItem("mazey-ui-theme")).toBeNull();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.bsTheme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.querySelector("[data-theme-toggle]")).toHaveAccessibleName("Current theme: Light. Switch to dark theme.");
  });

  it("retains and applies the next theme when persistence fails", async () => {
    setThemePreference.mockReturnValue(false);
    await import("../../site/theme");
    document.querySelector<HTMLButtonElement>("[data-theme-toggle]")?.click();

    expect(setThemePreference).toHaveBeenCalledWith("mazey-ui-theme", "dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.querySelector("[data-theme-icon=\"dark\"]")).not.toHaveAttribute("hidden");
    expect(document.querySelector("[data-theme-icon=\"light\"]")).toHaveAttribute("hidden");
  });

  it("synchronizes TypeDoc changes and restores unsupported values", async () => {
    document.body.insertAdjacentHTML("beforeend", "<select id=\"tsd-theme\"><option value=\"light\">Light</option><option value=\"dark\">Dark</option><option value=\"invalid\">Invalid</option></select>");
    await import("../../site/theme");
    const select = document.querySelector<HTMLSelectElement>("#tsd-theme")!;

    select.value = "dark";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("tsd-theme")).toBe("dark");

    select.value = "invalid";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(select.value).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("replaces duplicate initialization and provides idempotent cleanup", async () => {
    const module = await import("../../site/theme");
    const cleanup = module.initializeThemeControls("mazey-ui-theme");
    cleanup();
    cleanup();
    vi.clearAllMocks();
    document.querySelector<HTMLButtonElement>("[data-theme-toggle]")?.click();
    expect(setThemePreference).not.toHaveBeenCalled();
  });
});
