# Add an OS-only ThemeToggle fallback with Mazey

## Summary

Extend `ThemeToggle` with an OS-only initial fallback while preserving its controlled
behavior. When a consumer provides `theme`, the component continues to render that value and
request the opposite value through `onThemeChange`. When a consumer omits `theme`, the component
initializes its rendered fallback from `getSystemTheme() ?? "light"`.

Mazey's `getSystemTheme(): ResolvedTheme | null` reads the current operating-system color
preference without inspecting URL parameters or storage. Use Light when it returns `null`.

The fallback is initialization-only. The component does not persist a theme, mutate the document,
or update the fallback after activation. A consumer must pass the value received by
`onThemeChange` back through `theme` to update the rendered icon and accessible label.

Move `mazey` version `^5.9.1` from `devDependencies` to `dependencies` because the published
component will import it at runtime.

## Public API changes

Import the OS-theme reader and concrete theme type directly from Mazey:

```ts
import { getSystemTheme } from "mazey";
import type { ResolvedTheme } from "mazey";
```

Define `ThemeToggleTheme` as an alias of `ResolvedTheme`. Preserve `ThemeToggleProps` as an
interface, make `theme` optional, and keep `onThemeChange` required:

```ts
export type ThemeToggleTheme = ResolvedTheme;

export interface ThemeToggleProps extends Omit<
  ComponentPropsWithRef<"button">,
  "aria-label" | "aria-pressed" | "children" | "type"
> {
  theme?: ThemeToggleTheme;
  onThemeChange: (theme: ThemeToggleTheme) => void;
}
```

This contract provides these modes:

- Controlled: `theme` is present and `getSystemTheme` is skipped.
- OS fallback: `theme` is absent and the component uses the initial OS theme, or Light when
  detection is unavailable.

No storage-key prop or conditional props union is needed. Existing controlled JSX usage and
interface extension remain supported. Do not change the package version as part of this work.

## Component behavior

- Initialize a stable fallback lazily from `theme ?? getSystemTheme() ?? "light"`.
  Short-circuit OS detection when `theme` is present.
- Render from `theme ?? initialResolvedTheme` on every render.
- Consume the returned theme directly; `getSystemTheme` does not return a result object with
  `.value`, a label, or a resolution source. Convert only `null` to the concrete Light default.
- Derive the requested next theme from the currently rendered theme.
- Preserve the existing native `onClick` callback order, disabled behavior, forwarded button
  properties, ref support, accessible labels, Bootstrap Icon paths, and styles.
- Keep `onThemeChange` required and call it with the requested concrete theme.
- Do not update the resolved fallback after activation. Until the consumer supplies a new `theme`,
  repeated activations request the same opposite value and the rendered button remains unchanged.
- Do not inspect URL parameters, read or write storage, call preference-resolution or persistence
  APIs, repeat OS detection on rerenders or clicks, add media-query listeners, mutate
  `document.documentElement`, or update theme metadata in the package component.

The OS-fallback mode is for client-rendered use. Server-side rendering and hydration consumers
must provide `theme`: `getSystemTheme` returns `null` on the server, and the resulting Light
fallback may differ from the browser's OS theme. Do not add a browser-environment guard or
suppress hydration warnings inside the component.

## Dependency and bundle changes

- Move the existing `mazey` declaration to `dependencies` without changing its version.
- Run `pnpm install` to update the existing `pnpm-lock.yaml` importer classification. Do not add
  another lockfile or a `packageManager` field.
- Externalize `mazey` alongside React for ESM, CommonJS, and declaration outputs. Consumers of
  those formats must use the installed runtime dependency.
- Bundle the used Mazey OS-theme reader into `dist/mazey-ui.min.js`. Keep React and ReactDOM
  external so the `MAZEY_UI` browser IIFE does not require a separate Mazey browser global.
- Extend package validation to confirm that `mazey` is a runtime dependency, is not duplicated in
  `devDependencies`, remains external in ESM and CommonJS, appears in declarations where required,
  and leaves the IIFE free of `require()` calls and undeclared runtime globals.
- Preserve the existing package exports, output filenames, browser global, stylesheet export, and
  package allowlist.

## Documentation and examples

- Update `AGENTS.md` so the dependency rules and component ownership boundary allow the read-only
  OS-only Mazey fallback while continuing to prohibit URL/storage access, persistence, and document
  mutation.
- Update the README description, API signature, and usage examples. Show the current controlled
  form and an OS-fallback form that feeds `onThemeChange` back through `theme`.
- Update the Home page and playground examples to demonstrate the public root API without
  importing package internals.
- Keep preview state and page-wide website theme state separate. Do not require a storage key in
  component examples. Leave the website's application-level `resolveThemePreference` behavior
  unchanged.
- Update `WEBSITE_OPTIMIZATION_GOAL.md` where it states that Mazey is website-only or that package
  components never perform theme resolution.
- Document that the fallback is read-only, `onThemeChange` remains required, persistence belongs to
  the consumer, and SSR or hydration consumers must provide `theme`.

## Test plan

Add or update focused tests for these cases:

- Controlled Light and Dark rendering does not call `getSystemTheme`.
- Omitted `theme` calls `getSystemTheme` during initialization and renders OS Light or Dark.
- A `null` result produces Light without adding browser guards or exception handling.
- Rerenders, clicks, and later OS changes do not refresh the initial fallback.
- Component initialization and activation do not access URL parameters or storage.
- Activating a fallback reports the opposite concrete value but does not persist or change the
  rendered fallback internally.
- Feeding the callback value back through `theme` updates the icon, label, data attribute, and next
  requested value.
- Type checks accept controlled and omitted-theme props without a storage key, continue to require
  `onThemeChange`, and preserve interface extension.
- Server rendering with an explicit `theme` does not invoke `getSystemTheme`.
- Existing accessibility, disabled-button, native-property, ref, SVG-path, and CSS behavior remains
  unchanged.
- Package validation covers ESM, CommonJS, declarations, CSS, source maps, the standalone IIFE,
  manifest dependency ownership, and packed contents.

Run validation with repository-approved commands:

```bash
pnpm install
npm run typecheck
npm run lint
npm test
npm run build:package
npm run docs
npm run preview
npm pack --dry-run
git diff --check
```

Do not publish, deploy, create a release, commit, tag, or push while implementing or validating
this plan.

## Assumptions

- Application theme state remains limited to `light` and `dark`.
- `getSystemTheme` is the only Mazey function used by the component; `null` maps to Light.
- The component resolves only an initial display fallback; it does not become an uncontrolled
  state or persistence owner.
- Consumers using the fallback feed `onThemeChange` values back through `theme` when they want the
  rendered control to change.
- `ThemeToggleProps` remains an interface with optional `theme` and required `onThemeChange`.
- The installed Mazey browser baseline and ES2022 output remain compatible with the package's
  supported browser policy; no polyfills are added.
