import {
  resolveThemePreference,
  setThemePreference,
} from "mazey";
import type { ResolvedTheme } from "mazey";
import { runtimeConfig } from "./runtime-config";

const initializationKey = "mazeyUiThemeCleanup";

declare global {
  interface Window {
    [initializationKey]?: () => void;
  }
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.bsTheme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>("meta[data-theme-color]");
  if (themeColor) {
    themeColor.content = theme === "light"
      ? runtimeConfig.themeColorLight
      : runtimeConfig.themeColorDark;
  }

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    const isLight = theme === "light";
    button.setAttribute(
      "aria-label",
      isLight
        ? "Current theme: Light. Switch to dark theme."
        : "Current theme: Dark. Switch to light theme.",
    );
    button.querySelector<SVGElement>("[data-theme-icon=\"light\"]")?.toggleAttribute("hidden", !isLight);
    button.querySelector<SVGElement>("[data-theme-icon=\"dark\"]")?.toggleAttribute("hidden", isLight);
  });

  const typeDocTheme = document.querySelector<HTMLSelectElement>("select#tsd-theme");
  if (typeDocTheme) typeDocTheme.value = theme;
  try {
    localStorage.setItem("tsd-theme", theme);
  } catch {
    // TypeDoc storage is a browser boundary and may be unavailable.
  }
}

export function initializeThemeControls(storageKey: string): () => void {
  window[initializationKey]?.();
  let resolvedTheme = resolveThemePreference(storageKey).value;
  applyTheme(resolvedTheme);

  const handleClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest("[data-theme-toggle]")) return;
    resolvedTheme = resolvedTheme === "light" ? "dark" : "light";
    setThemePreference(storageKey, resolvedTheme);
    applyTheme(resolvedTheme);
  };

  const handleChange = (event: Event) => {
    if (!(event.target instanceof HTMLSelectElement) || event.target.id !== "tsd-theme") return;
    if (event.target.value !== "light" && event.target.value !== "dark") {
      applyTheme(resolvedTheme);
      return;
    }
    resolvedTheme = event.target.value;
    setThemePreference(storageKey, resolvedTheme);
    applyTheme(resolvedTheme);
  };

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  const cleanup = () => {
    document.removeEventListener("click", handleClick);
    document.removeEventListener("change", handleChange);
    if (window[initializationKey] === cleanup) delete window[initializationKey];
  };
  window[initializationKey] = cleanup;
  return cleanup;
}

initializeThemeControls(runtimeConfig.themeStorageKey);
