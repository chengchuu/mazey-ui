import {
  isSafePWAEnv,
  isStandalonePWA,
  watchServiceWorkerUpdates,
} from "mazey";
import { runtimeConfig } from "./runtime-config";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function initializePwa() {
  const installButton = document.querySelector<HTMLButtonElement>("[data-pwa-install]");
  const status = document.querySelector<HTMLElement>("[data-pwa-status]");
  const update = document.querySelector<HTMLElement>("[data-pwa-update]");
  const updateButton = document.querySelector<HTMLButtonElement>("[data-pwa-update-now]");
  let installPrompt: InstallPromptEvent | null = null;

  if (installButton && isStandalonePWA()) installButton.hidden = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event as InstallPromptEvent;
    if (installButton) installButton.hidden = false;
    if (status) status.textContent = "This website can be installed.";
  });
  installButton?.addEventListener("click", async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (status) status.textContent = choice.outcome === "accepted" ? "Installation accepted." : "Installation dismissed.";
    } catch {
      if (status) status.textContent = "The browser could not open the installation prompt.";
    } finally {
      installButton.hidden = true;
    }
  });

  if (!runtimeConfig.pwa.enabled || !isSafePWAEnv({ scope: runtimeConfig.pwa.scope })) return;
  window.addEventListener("load", () => {
    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(runtimeConfig.pwa.serviceWorkerUrl, {
          scope: runtimeConfig.pwa.scope,
        });
        let reloadRequested = false;
        const watcher = watchServiceWorkerUpdates(registration, navigator.serviceWorker, {
          onUpdateAvailable() {
            if (update) update.hidden = false;
          },
          onControllerChange() {
            if (!reloadRequested) return;
            reloadRequested = false;
            if (update) update.hidden = true;
            window.location.reload();
          },
        });
        updateButton?.addEventListener("click", () => {
          reloadRequested = watcher.activateWaiting();
          if (reloadRequested) updateButton.disabled = true;
        });
      } catch {
        if (status) status.textContent = "Offline support is unavailable in this browser or context.";
      }
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => void register());
    else globalThis.setTimeout(() => void register(), 0);
  }, { once: true });
}
