# Add a Mazey-resolved ThemeToggle fallback

## Summary

Extend `ThemeToggle` with a Mazey-resolved initial fallback while preserving its controlled
behavior. When a consumer provides `theme`, the component continues to render that value and
request the opposite value through `onThemeChange`. When a consumer omits `theme`, the component
requires `storageKey` and initializes its rendered fallback from
`resolveThemePreference(storageKey).value`.

The fallback is initialization-only. The component does not persist a theme, mutate the document,
or update the fallback after activation. A consumer must pass the value received by
`onThemeChange` back through `theme` to update the rendered icon and accessible label.

Move `mazey` version `^5.9.1` from `devDependencies` to `dependencies` because the published
component will import it at runtime.

## Public API changes

Import the resolver and concrete theme type directly from Mazey:

```ts
import { resolveThemePreference } from "mazey";
import type { ResolvedTheme } from "mazey";
```

Define `ThemeToggleTheme` as an alias of `ResolvedTheme`. Replace the existing props interface
with a discriminated type union:

```ts
type ThemeToggleButtonProps = Omit<
  ComponentPropsWithRef<"button">,
  "aria-label" | "aria-pressed" | "children" | "type"
> & {
  onThemeChange: (theme: ThemeToggleTheme) => void;
};

export type ThemeToggleProps = ThemeToggleButtonProps & (
  | {
      theme: ThemeToggleTheme;
      storageKey?: string;
    }
  | {
      theme?: undefined;
      storageKey: string;
    }
);
```

This contract provides these modes:

- Controlled: `theme` is present, `storageKey` is optional, and Mazey resolution is skipped.
- Resolved fallback: `theme` is absent, `storageKey` is required, and Mazey supplies the initial
  concrete theme.

Allow `storageKey` in the controlled branch so a consumer can retain the same props while changing
from an initially resolved fallback to an explicit `theme` after the first callback.

Changing `ThemeToggleProps` from an interface to a type alias preserves existing JSX usage but is
a TypeScript compatibility change for consumers that extend it with an interface. Such consumers
must use a type intersection instead. Do not change the package version as part of this work.

## Component behavior

- Initialize a stable fallback lazily from `theme ?? resolveThemePreference(storageKey).value`.
  Short-circuit resolution when `theme` is present.
- Render from `theme ?? initialResolvedTheme` on every render.
- Consume only the resolver's concrete `.value`. Do not read or branch on its label or resolution
  source, including when Mazey returns the display label `System`.
- Derive the requested next theme from the currently rendered theme.
- Preserve the existing native `onClick` callback order, disabled behavior, forwarded button
  properties, ref support, accessible labels, Bootstrap Icon paths, and styles.
- Keep `onThemeChange` required and call it with the requested concrete theme.
- Do not update the resolved fallback after activation. Until the consumer supplies a new `theme`,
  repeated activations request the same opposite value and the rendered button remains unchanged.
- Do not call `setThemePreference`, write storage, resolve repeatedly, add media-query listeners,
  mutate `document.documentElement`, or update theme metadata in the package component.
- Let Mazey's documented `TypeError` propagate for an invalid or empty fallback `storageKey`; do
  not duplicate its validation.

The resolved-fallback mode is for client-rendered use. Server-side rendering and hydration
consumers must provide `theme` so server and browser markup cannot diverge because of storage or
operating-system preferences. Do not add a browser-environment guard or suppress hydration
warnings inside the component.

## Dependency and bundle changes

- Move the existing `mazey` declaration to `dependencies` without changing its version.
- Run `pnpm install` to update the existing `pnpm-lock.yaml` importer classification. Do not add
  another lockfile or a `packageManager` field.
- Externalize `mazey` alongside React for ESM, CommonJS, and declaration outputs. Consumers of
  those formats must use the installed runtime dependency.
- Bundle the used Mazey resolver into `dist/mazey-ui.min.js`. Keep React and ReactDOM external so
  the `MAZEY_UI` browser IIFE does not require a separate Mazey browser global.
- Extend package validation to confirm that `mazey` is a runtime dependency, is not duplicated in
  `devDependencies`, remains external in ESM and CommonJS, appears in declarations where required,
  and leaves the IIFE free of `require()` calls and undeclared runtime globals.
- Preserve the existing package exports, output filenames, browser global, stylesheet export, and
  package allowlist.

## Documentation and examples

- Update `AGENTS.md` so the dependency rules and component ownership boundary allow the read-only
  Mazey fallback while continuing to prohibit persistence and document mutation.
- Update the README description, API signature, and usage examples. Show the current controlled
  form and a resolved-fallback form that feeds `onThemeChange` back through `theme`.
- Update the Home page and playground examples to demonstrate the public root API without
  importing package internals.
- Give the playground fallback a project-specific storage key. Keep preview state and page-wide
  website theme state separate.
- Update `WEBSITE_OPTIMIZATION_GOAL.md` where it states that Mazey is website-only or that package
  components never perform theme resolution.
- Document that the fallback is read-only, `onThemeChange` remains required, persistence belongs to
  the consumer, and SSR or hydration consumers must provide `theme`.

## Test plan

Add or update focused tests for these cases:

- Controlled Light and Dark rendering does not call `resolveThemePreference`.
- Omitted `theme` calls `resolveThemePreference` with the supplied `storageKey` during
  initialization and renders its concrete `.value`.
- A result such as `{ value: "dark", label: "System" }` renders Dark without inspecting the label.
- Rerendering a fallback instance does not resolve again.
- Activating a fallback reports the opposite concrete value but does not persist or change the
  rendered fallback internally.
- Feeding the callback value back through `theme` updates the icon, label, data attribute, and next
  requested value.
- Type checks accept controlled and fallback props and reject omitted `theme` together with omitted
  `storageKey`.
- Server rendering with an explicit `theme` does not invoke Mazey resolution.
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
- `resolveThemePreference(storageKey).value` is the only Mazey result field used by the component.
- The component resolves only an initial display fallback; it does not become an uncontrolled
  state or persistence owner.
- Consumers using the fallback feed `onThemeChange` values back through `theme` when they want the
  rendered control to change.
- The accepted discriminated-union design prioritizes invalid-prop prevention over compatibility
  with interfaces that extend the current `ThemeToggleProps` interface.
- The installed Mazey browser baseline and ES2022 output remain compatible with the package's
  supported browser policy; no polyfills are added.
