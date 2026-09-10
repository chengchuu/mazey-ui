import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import projectConfig from "../project.config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolveRoot = (...parts) => path.resolve(root, ...parts);
const production = process.env.GITHUB_PAGES === "true";
const basePath = production ? projectConfig.site.basePath : "/";
const absolute = (route) => new URL(route.replace(projectConfig.site.basePath, ""), projectConfig.urls.site).href;
const openGraphImageUrl = new URL(`images/${projectConfig.assets.openGraph}`, projectConfig.urls.site).href;
const runtimeConfig = {
  packageName: projectConfig.package.name,
  installCommand: projectConfig.package.installCommand,
  themeStorageKey: projectConfig.site.theme.storageKey,
  themeColorLight: projectConfig.site.theme.lightColor,
  themeColorDark: projectConfig.site.theme.darkColor,
  pwa: {
    enabled: production,
    scope: projectConfig.site.basePath,
    serviceWorkerUrl: projectConfig.pwa.serviceWorker,
  },
};
const commonParameters = {
  BASE_PATH: basePath,
  DISPLAY_NAME: projectConfig.brand.displayName,
  FAVICON_URL: `${basePath}images/${projectConfig.assets.favicon}`,
  GITHUB_URL: projectConfig.urls.github,
  INSTALL_COMMAND: projectConfig.package.installCommand,
  LICENSE_URL: projectConfig.urls.license,
  LOGO_URL: `${basePath}images/${projectConfig.assets.logo}`,
  MANIFEST_URL: production ? projectConfig.pwa.manifest : null,
  NPM_URL: projectConfig.urls.npm,
  OPEN_GRAPH_IMAGE_URL: openGraphImageUrl,
  SITE_URL: projectConfig.urls.site,
  THEME_COLOR_LIGHT: projectConfig.site.theme.lightColor,
};

export default {
  mode: production ? "production" : "development",
  devtool: "source-map",
  entry: {
    theme: resolveRoot("site/theme.ts"),
    shared: resolveRoot("site/shared-entry.ts"),
    home: { import: resolveRoot("site/index.ts"), dependOn: "shared" },
    playground: { import: resolveRoot("examples/index.tsx"), dependOn: "shared" },
    api: { import: resolveRoot("site/api.ts"), dependOn: "shared" },
  },
  output: {
    clean: true,
    filename: "assets/[name].js",
    path: resolveRoot("dist-dev"),
    publicPath: basePath,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: { compilerOptions: { noEmit: false } },
        },
        exclude: /node_modules/,
      },
      { test: /\.css$/i, use: [ MiniCssExtractPlugin.loader, "css-loader" ] },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({ __SITE_RUNTIME_CONFIG__: JSON.stringify(runtimeConfig) }),
    new MiniCssExtractPlugin({ filename: "assets/[name].css" }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: resolveRoot("site/index.html"),
      chunks: [ "shared", "home" ],
      inject: "body",
      templateParameters: {
        ...commonParameters,
        ROOT_TITLE: projectConfig.site.pages.home.title,
        ROOT_DESCRIPTION: projectConfig.site.pages.home.description,
        ROOT_JSON_LD: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: projectConfig.brand.displayName,
          description: projectConfig.site.pages.home.description,
          url: projectConfig.urls.site,
          codeRepository: projectConfig.urls.github,
          downloadUrl: projectConfig.urls.npm,
          programmingLanguage: "TypeScript",
        }),
      },
    }),
    new HtmlWebpackPlugin({
      filename: "playground/index.html",
      template: resolveRoot("examples/index.html"),
      chunks: [ "shared", "playground" ],
      inject: "body",
      templateParameters: {
        ...commonParameters,
        PLAYGROUND_TITLE: projectConfig.site.pages.playground.title,
        PLAYGROUND_DESCRIPTION: projectConfig.site.pages.playground.description,
        PLAYGROUND_URL: absolute(projectConfig.site.routes.playground),
      },
    }),
  ],
  resolve: {
    alias: { "mazey-ui": resolveRoot("src/index.ts") },
    extensions: [ ".tsx", ".ts", ".js" ],
  },
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    static: [ resolveRoot("dist-dev"), resolveRoot("docs") ],
  },
  performance: { maxAssetSize: 400000, maxEntrypointSize: 400000 },
};
