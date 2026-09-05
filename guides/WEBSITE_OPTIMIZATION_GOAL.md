# Production website and package delivery goal

## Objective

Prepare `mazey-ui` for its first public release with a production-ready package build and a
responsive, accessible, crawlable, theme-aware, Progressive Web App (PWA)-installable website at
`https://chengchuu.github.io/mazey-ui/`.

The implementation must preserve the package's existing public runtime contract while adding a
Home page, a React playground at `/mazey-ui/playground/`, and TypeDoc API documentation at
`/mazey-ui/api/`. All browser-loaded assets and routes must work under the `/mazey-ui/` GitHub
Pages base path.

## Current state

The repository currently provides the controlled React 19 `ThemeToggle` component through the
package root and publishes its stylesheet through `mazey-ui/styles.css`. The package build uses
Vite, and the repository does not yet contain the website, TypeDoc assembly, SEO and PWA
validation, or GitHub Pages and npm publication workflows required by this goal.

The repository is unreleased and has no compatibility migration requirement for existing users.
Even so, preserve these public exports unless a verified implementation constraint requires a
change:

- `ThemeToggle`
- `ThemeToggleProps`
- `ThemeToggleTheme`
- the package root import
- `mazey-ui/styles.css`

## Package and build result

- Replace the package's Vite build with Rollup while retaining `dist/index.js`,
  `dist/index.cjs`, `dist/index.d.ts`, and `dist/styles.css`.
- Add source maps and a browser IIFE bundle at `dist/mazey-ui.min.js` with the browser global
  `MAZEY_UI`.
- Keep Mazey, React, ReactDOM, and the React JSX runtime external in ESM and CommonJS outputs. Externalize Mazey in declarations and declare it as a runtime dependency at `^5.9.1`. Bundle the used Mazey OS reader into the IIFE without requiring a Mazey global. Keep React
  peers external in the IIFE and bundle only the production JSX runtime needed by that output.
- Add `unpkg` and `jsdelivr` package metadata that points to the validated browser bundle.
- Generate CSS through the owning build stage instead of maintaining duplicate output by hand.
- Validate declarations, ESM, CommonJS, IIFE, CSS, source maps, exports, and packed contents.
- Keep all website, documentation, application-wide theme, SEO, and PWA code outside the package runtime and the
  published package allowlist.
- Remove obsolete Vite package-build configuration and dependencies only after Rollup provides
  equivalent validated outputs. Retain Vitest and ESLint unless a verified incompatibility
  requires a focused change.

Use a build-only configuration module as the source of truth for package identity, repository and
npm URLs, the production site URL, the Pages base path, stable routes, theme keys, PWA cache
prefixes, commands, and asset paths. Do not expose website metadata through the package runtime.

## Website and documentation result

- Build the Home page and playground with Webpack and Bootstrap.
- Generate API documentation with TypeDoc, then assemble all stable routes and shared assets into
  `docs` deterministically.
- Make repeated documentation builds remove stale generated output.
- Give each primary page semantic landmarks, one descriptive `h1`, responsive navigation,
  keyboard-accessible controls, accurate labels, and crawlable initial HTML.
- Link Home, Playground, Install, Usage, API, GitHub, and npm wherever each destination is useful.
- Import `ThemeToggle` only from the public package root in website examples.
- Make the playground exercise the controlled component contract with light and dark preview
  state, relevant native button properties, explanatory content, accessible status text, and a
  `<noscript>` message. Do not duplicate the component's theme-toggle behavior.
- Transform TypeDoc output through an idempotent build step. Preserve TypeDoc content and native
  controls while adding project navigation, shared theme and PWA metadata, update controls, and
  depth-correct subpath assets.

Do not edit `docs`, `dist`, `dist-dev`, `lib`, `coverage`, or TypeDoc HTML as source. Regenerate
owned artifacts through their scripts.

## Theme and accessibility result

Keep the package component and website on the concrete `"light" | "dark"` contract documented in
`AGENTS.md`. Do not expose `system`, `auto`, or another third theme state in application state or
website controls.

`ThemeToggle` may initialize a read-only OS fallback through Mazey's `getSystemTheme()` when
`theme` is omitted, using Light for `null`. A provided theme skips detection. The component
does not refresh this fallback, read URL parameters or storage, persist a theme, add listeners,
or mutate the document. Keep `onThemeChange` required and feed its value back through `theme`
to update the control. SSR and hydration consumers must provide `theme`.

Directly reuse these verified `mazey` APIs in the website layer:

```ts
import {
  resolveThemePreference,
  setThemePreference,
} from "mazey";
import type { ResolvedTheme } from "mazey";
```

- Choose one project-specific storage key, one canonical root selector, and one source of light
  and dark theme colors in build-only website configuration.
- Initialize the session from `resolveThemePreference(storageKey).value`. Consume only the
  concrete `ResolvedTheme` value; do not branch on Mazey's label or resolution source.
- Retain the concrete theme as session state. Derive every click's next value from that state
  instead of resolving the preference again.
- Persist an explicit selection with `setThemePreference(storageKey, nextTheme)`. Apply and retain
  `nextTheme` for the session even when persistence returns `false`.
- Do not persist the initial resolved value or duplicate Mazey's preference resolution,
  validation, or storage access.
- Synchronize the canonical root selector, Bootstrap's `data-bs-theme`, CSS `color-scheme`, the
  owned `theme-color` metadata, accessible labels, and icon visibility through one project-owned
  `applyTheme()` path.
- Keep TypeDoc's native `select#tsd-theme` and its listener. Restrict the project-facing options
  to `Light` and `Dark`, and synchronize it through TypeDoc's supported control behavior instead
  of reconstructing the generated control.
- Use project-owned two-state navbar buttons on Home, Playground, and the TypeDoc toolbar. Inline
  the official Bootstrap Icons `sun-fill` and `moon-stars-fill` SVG paths from the installed
  development dependency without icon fonts, icon CSS, a content delivery network, or runtime
  icon assets.
- Initialize static HTML as light before JavaScript runs. Show `sun-fill`, hide
  `moon-stars-fill`, and use `Current theme: Light. Switch to dark theme.` as the accessible
  label.
- In dark mode, show `moon-stars-fill`, hide `sun-fill`, and use
  `Current theme: Dark. Switch to light theme.` as the accessible label.
- Give each theme button `type="button"`; use `aria-hidden="true"`, `focusable="false"`, and
  `hidden` on the decorative SVGs. Do not add visible `L` or `D` text or `aria-pressed`.
- Use a `32px` circular, border-box button and `16px` icons by default. Preserve keyboard focus,
  semantic palette states, synchronized dimensions, and layout stability.
- Run the same resolution and application behavior in the earliest Content Security Policy
  (CSP)-compatible website bundle. Prevent duplicate event registration and let the owning
  framework manage mounting and cleanup.

## SEO and Pages result

- Give every stable HTML page a factual, unique title, description, absolute HTTPS canonical URL,
  and matching Open Graph metadata.
- Use the supplied `images/logo-open-graph-1200x630.png` as the social image with factual
  alternative text.
- Add JSON-LD only where repository evidence supports a `SoftwareSourceCode` or `WebPage`
  description.
- Generate a parseable, deduplicated `sitemap.xml` and `robots.txt` from the production URL.
- Include the Home page, playground, and API overview in the sitemap. Give generated TypeDoc
  subpages accurate self-canonicals, but omit unstable generated subpages from the sitemap.
- Resolve local browser assets from the current origin and `/mazey-ui/`; reject root-relative
  paths that escape the project scope.
- Keep the base path synchronized across configuration, Webpack, TypeDoc, navigation, metadata,
  crawler files, manifest, service worker, README, and workflows.

## PWA result

Use the supplied production assets:

- `images/logo-32x32.png`
- `images/logo-192x192.png`
- `images/logo-512x512.png`
- `images/logo-maskable-512x512.png`
- `images/logo-open-graph-1200x630.png`

Create a project-specific manifest with a verified name, description, `id`, start URL, scope,
display mode, theme colors, and the supplied install icons.

- Register the service worker only in a production-like build, after page load or idle time, on
  HTTPS or localhost, and within `/mazey-ui/`.
- Intercept only same-origin `GET` requests within the Pages scope. Ignore cross-origin,
  out-of-scope, non-`GET`, and source-map requests.
- Use deterministic cache fingerprints and bounded caching: network-first for documents,
  scripts, and styles; cache-first for local images and fonts.
- Cache only successful, non-opaque responses, treat Cache Storage as best effort, delete only
  obsolete `mazey-ui` caches, and retain offline fallbacks.
- Show install controls on Home and Playground only after `beforeinstallprompt`. Hide them in
  standalone mode and provide accessible status or unsupported-browser guidance.
- Show an update notice and explicit update action on Home, Playground, and API pages. Activate a
  waiting worker only after that action, then reload once on `controllerchange`.
- Reuse `isSafePWAEnv`, `isStandalonePWA`, and `watchServiceWorkerUpdates` from `mazey` after
  verifying their installed contracts.

## GitHub Actions result

- Use Node.js 22, `npm install`, and `npm run <script>` in GitHub Actions.
- Configure `actions/setup-node` with `package-manager-cache: false` and do not use
  `actions/cache`, the `cache` input, `cache-dependency-path`, `npm ci`, or a `packageManager`
  field.
- At implementation time, verify the current compatible stable action majors. The current design
  uses `actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v6`,
  `actions/upload-pages-artifact@v5`, and `actions/deploy-pages@v5` in that relative Pages order.
- Run the Pages workflow for pushes to `main` and `release/v*`, and retain manual dispatch.
- Use `contents: read`, `pages: write`, and `id-token: write`; use the `pages` concurrency group
  with `cancel-in-progress: false`; validate and upload `docs`; deploy through the protected
  `github-pages` environment.
- Allow the npm workflow to validate pull requests and manual runs, but publish only after a
  successful push to `refs/heads/release/v*` passes an explicit event and ref guard.
- Configure the npm registry URL, use `secrets.NPM_TOKEN`, and publish only to npm. Do not add
  automatic tags, GitHub Packages publication, provenance, releases, or deployment behavior
  without a separate verified policy.

Local dependency maintenance must use `pnpm install`, `pnpm add`, `pnpm update`, and
`pnpm remove`. Local development, validation, packaging, and lifecycle commands must use npm.
Preserve the tracked `pnpm-lock.yaml` policy.

## Validation and completion criteria

The goal is complete only when all applicable checks pass and the final generated artifacts have
been inspected.

1. Install or update dependencies with pnpm and verify the installed Mazey and Bootstrap Icons
   contracts before using them.
2. Add focused tests for package configuration, component behavior, playground integration,
   two-state theme initialization and toggling, persistence failure, TypeDoc synchronization, SEO
   output, PWA behavior, service-worker caching, and repeatable Pages assembly.
3. Run the repository's type-check, lint, test, package-build, documentation, SEO, PWA, and format
   checks through npm scripts.
4. Run `npm run preview` when the aggregate script exists, then run `npm pack --dry-run` and
   `npm publish --dry-run --access public` without performing a real publication.
5. Validate the packed package in a clean consumer across ESM, CommonJS, browser IIFE, types, and
   CSS.
6. Inspect the final `docs` artifact for routes, subpath assets, metadata, crawler files, manifest,
   icons, service-worker scope, offline behavior, installation, updates, and theme behavior.
7. When browser testing is available, check desktop and mobile layouts, keyboard navigation,
   accessible theme names, light-to-dark alternation, the playground, API navigation, and
   production-like PWA behavior.
8. Review the complete worktree diff and run `git diff --check`.

Report unavailable browser, network, credentials, repository settings, or GitHub environment
checks as limitations. Do not treat a skipped or blocked check as successful.

## Boundaries

- Preserve unrelated work, including the existing `AGENTS.md` changes and supplied image assets.
- Make the smallest maintainable changes that satisfy the verified architecture.
- Do not add speculative components, APIs, compatibility layers, fallbacks, or broad defensive
  guards.
- Do not change the package public API unless implementation evidence makes the change necessary;
  update implementation, types, exports, tests, documentation, and declarations together if that
  happens.
- Treat `mazey-npm-template` and `mazey` as read-only references unless the user expands the scope.
- Do not perform a real publication, deployment, release, commit, tag, or push during validation.
- External GitHub Pages settings, branch protection, the `github-pages` environment, and the
  `NPM_TOKEN` secret require repository-owner verification.
