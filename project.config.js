import pkg from "./package.json" with { type: "json" };

const siteUrl = new URL(pkg.homepage);
const basePath = siteUrl.pathname.endsWith("/") ? siteUrl.pathname : `${siteUrl.pathname}/`;
const githubUrl = "https://github.com/chengchuu/mazey-ui";
const npmUrl = "https://www.npmjs.com/package/mazey-ui";
const lightColor = "#f7f9fc";
const darkColor = "#0d1424";

const config = {
  package: {
    name: pkg.name,
    version: pkg.version,
    installCommand: `npm install ${pkg.name}`,
    iifeGlobal: "MAZEY_UI",
  },
  brand: {
    displayName: "Mazey UI",
    shortName: "Mazey UI",
  },
  urls: {
    site: siteUrl.href,
    github: githubUrl,
    npm: npmUrl,
    license: `${githubUrl}/blob/main/LICENSE`,
  },
  site: {
    basePath,
    routes: {
      home: basePath,
      playground: `${basePath}playground/`,
      api: `${basePath}api/`,
    },
    pages: {
      home: {
        title: "Mazey UI - Accessible React UI Components",
        description: "Accessible, strongly typed React UI components with a controlled light and dark theme contract.",
      },
      playground: {
        title: "Mazey UI Playground - ThemeToggle Component",
        description: "Try the controlled Mazey UI ThemeToggle component in light, dark, and disabled states.",
      },
      api: {
        title: "Mazey UI API Documentation",
        description: "TypeScript API documentation for the Mazey UI ThemeToggle component and its public types.",
      },
    },
    theme: {
      storageKey: "mazey-ui-theme",
      selector: "data-theme",
      primary: "#4d8ffb",
      lightColor,
      darkColor,
    },
  },
  assets: {
    favicon: "logo-32x32.png",
    logo: "logo-192x192.png",
    openGraph: "logo-open-graph-1200x630.png",
  },
  pwa: {
    cachePrefix: "mazey-ui-site-",
    manifest: `${basePath}manifest.webmanifest`,
    serviceWorker: `${basePath}service-worker.js`,
    name: "Mazey UI",
    shortName: "Mazey UI",
    description: "Documentation and interactive examples for the Mazey UI React component library.",
    backgroundColor: lightColor,
    themeColor: "#4d8ffb",
  },
};

export default Object.freeze(config);
