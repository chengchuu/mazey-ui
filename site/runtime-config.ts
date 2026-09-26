export interface SiteRuntimeConfig {
  packageName: string;
  installCommand: string;
  themeStorageKey: string;
  themeColorLight: string;
  themeColorDark: string;
  pwa: {
    enabled: boolean;
    scope: string;
    serviceWorkerUrl: string;
  };
}

declare global {
  const __SITE_RUNTIME_CONFIG__: SiteRuntimeConfig;
}

export const runtimeConfig = __SITE_RUNTIME_CONFIG__;
