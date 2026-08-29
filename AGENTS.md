# Repository Guide

## Project

This repository is:

```text
mazey-ui
```

`mazey-ui` is a small React UI component library.

Core stack:

```text
React 19
TypeScript
mazey
```

Use Bootstrap Icons only when a component actually requires icons.

The first component is:

```text
ThemeToggle
```

The project should grow incrementally. Add new components only when a real product or application requirement exists.

For the complete project goals and fixed architectural decisions, read:

```text
GOAL.md
```

---

# Working Principles

Keep the repository:

```text
small
typed
accessible
reusable
maintainable
consumer-friendly
```

Prefer direct implementations over speculative abstractions.

Do not create infrastructure for hypothetical future components.

Do not introduce unnecessary:

```text
hooks
contexts
providers
stores
services
utilities
component families
design-system abstractions
```

Create shared abstractions only after multiple real components demonstrate the same requirement.

---

# Before Making Changes

Before editing:

1. Read `GOAL.md`.
2. Read this `AGENTS.md`.
3. Inspect the files relevant to the task.
4. Inspect the current Git state.
5. Preserve unrelated work.
6. Identify the public API affected by the change.
7. Avoid unnecessary dependencies.
8. Avoid unnecessary abstractions.
9. Keep accessibility part of the implementation contract.
10. Keep consumer-owned application state outside ordinary reusable components.

Useful Git commands:

```bash
git status
git diff
```

Do not assume the repository is clean.

Do not overwrite or discard unrelated user changes.

---

# Initial Scope

The initial library contains:

```text
ThemeToggle
```

Do not add unrelated components unless explicitly requested.

Future components should be introduced only when needed.

Do not attempt to build a complete UI framework or design system in advance.

---

# Component Design

Prefer native HTML semantics first.

Examples:

```text
button → <button>
input → <input>
textarea → <textarea>
select → <select>
```

Do not replace native elements with generic `<div>` elements without a concrete reason.

Public component APIs should remain small.

Prefer standard DOM behavior over custom wrappers.

Where practical, preserve standard React DOM properties such as:

```text
className
style
disabled
aria-*
data-*
```

Do not create custom props that merely duplicate native HTML behavior.

---

# React

Target:

```text
React 19
```

Use idiomatic React 19 patterns.

Do not design new code around obsolete React conventions when React 19 provides a simpler supported API.

Keep application state external when it is owned by the consuming application.

Do not hide application-global state inside ordinary UI components.

Avoid:

```text
global mutable component state
implicit document mutations
storage access in presentational controls
framework internals
unnecessary context providers
unnecessary event buses
```

---

# TypeScript

Use TypeScript for source code.

Public component props and exported APIs must be typed.

Prefer explicit public types.

Do not expose internal implementation types unless they are intentionally part of the package API.

Keep internal code direct when TypeScript already guarantees the state.

Do not add unnecessary runtime guards for internal values that are fully controlled by typed code.

---

# Theme Model

The theme model is:

```ts
type Theme = "light" | "dark";
```

Do not introduce a user-facing:

```text
system
auto
default
```

theme state unless explicitly requested.

A reusable component should consume concrete theme state.

The consuming application owns application-wide theme resolution and persistence.

---

# Theme Ownership Boundary

`mazey-ui` provides reusable UI components.

The consuming application owns:

```text
localStorage
theme storage keys
URL preference parsing
OS theme detection
document.documentElement
data-theme
data-bs-theme
<meta name="theme-color">
application persistence
global theme initialization
```

Do not silently mutate these from an ordinary reusable UI component.

If reusable theme utilities are added later, they must be intentional public APIs rather than hidden side effects.

---

# ThemeToggle

`ThemeToggle` is a controlled component.

Conceptual API:

```tsx
<ThemeToggle
  theme={theme}
  onThemeChange={handleThemeChange}
/>
```

The component receives the current concrete theme and requests the opposite theme when activated.

Behavior:

```text
light → dark
dark → light
```

Conceptually:

```ts
const nextTheme =
  theme === "light" ? "dark" : "light";
```

Call:

```ts
onThemeChange(nextTheme);
```

Do not:

```text
read localStorage
write localStorage
resolve the theme again
query the OS theme
mutate document.documentElement
set data-theme
set data-bs-theme
update browser theme-color metadata
```

inside the controlled component.

The `theme` prop is the rendering source of truth.

---

# ThemeToggle Accessibility

Use exactly these accessible labels.

Light:

```text
Current theme: Light. Switch to dark theme.
```

Dark:

```text
Current theme: Dark. Switch to light theme.
```

Do not use:

```text
aria-pressed
```

for the theme toggle.

Do not add visible:

```text
L
D
Light
Dark
```

text unless explicitly requested.

Use a native:

```html
<button type="button">
```

The icon is decorative because the button already has a complete accessible name.

The component must remain keyboard-operable.

Provide a clearly visible `:focus-visible` treatment.

Do not rely on color or icon shape alone to communicate the action.

---

# ThemeToggle Dimensions

Default button size:

```text
32px × 32px
```

Default icon size:

```text
16px × 16px
```

Default button shape:

```text
circle
```

Required base behavior:

```css
.mazey-ui-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  border-radius: 50%;
}
```

Icon foundation:

```css
.mazey-ui-theme-toggle__icon {
  display: block;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}
```

Avoid layout shifts when the icon changes.

---

# Bootstrap Icons

Use official Bootstrap Icons when icons are required.

For `ThemeToggle`, use:

```text
sun-fill
moon-stars-fill
```

Use the installed `bootstrap-icons` package as the authoritative source of SVG path data.

Copy the official SVG path data into project-owned inline SVG markup.

Do not load:

```text
Bootstrap Icons CSS
Bootstrap Icons icon font
Bootstrap Icons CDN assets
a runtime icon package solely for ThemeToggle
```

The internal SVG contract is:

```text
width="16"
height="16"
viewBox="0 0 16 16"
fill="currentColor"
aria-hidden="true"
focusable="false"
```

Treat `bootstrap-icons` as a development dependency when it is only used as the source for inline SVG assets.

---

# Theme Palette

Default semantic colors:

## Light

```css
--color-primary: #4d8ffb;
--color-on-primary: #141414;
--color-surface: #ffffff;
--color-heading: #2d2d2d;
--color-body: #626262;
--color-muted: #828282;
--color-divider: #f6f6f6;
--color-field: #ebebeb;
--color-focus: #d9d9d9;
--color-fieldset: #c0c0c0;
--color-code-bg: #eeeeee;
--color-code: #e83e8c;
--color-highlight: #fff9c0;
```

## Dark

```css
--color-primary: #5089e8;
--color-on-primary: #141414;
--color-surface: #141414;
--color-heading: #d6d6d6;
--color-body: #a5a5a5;
--color-muted: #878787;
--color-divider: #1d1d1d;
--color-field: #272727;
--color-focus: #373737;
--color-fieldset: #4e4e4e;
--color-code-bg: #242424;
--color-code: #d44386;
--color-highlight: #413f2b;
```

Important:

```css
--color-on-primary: #141414;
```

is intentional in both themes.

Do not replace it with white without verifying contrast.

---

# Public CSS Namespace

Avoid generic public CSS names in the distributed library.

Prefer:

```text
--mazey-ui-primary
--mazey-ui-on-primary
--mazey-ui-surface
--mazey-ui-heading
--mazey-ui-body
--mazey-ui-muted
--mazey-ui-divider
--mazey-ui-field
--mazey-ui-focus
```

Prefer namespaced classes such as:

```text
mazey-ui-theme-toggle
mazey-ui-theme-toggle__icon
```

Avoid generic classes such as:

```text
theme-toggle
button
icon
field
card
```

when they could collide with consumer styles.

---

# Styling

Prefer plain semantic CSS.

Use CSS custom properties for themeable values.

Prefer:

```css
color: var(--mazey-ui-body);
background: var(--mazey-ui-surface);
border-color: var(--mazey-ui-field);
```

Avoid duplicating complete light and dark component styles when semantic tokens can express the difference.

Use derived states carefully.

Do not introduce permanent one-off color tokens unless they represent a reusable semantic role.

The light primary:

```text
#4d8ffb
```

does not provide enough contrast for small essential normal text on white.

Do not use it for such text without verifying contrast.

---

# Dependencies

Keep dependencies minimal.

Do not install packages merely because they may be useful later.

React and React DOM should be treated as peer dependencies for the published library.

They may also be development dependencies for local development, testing, and building.

The project uses:

```text
mazey
```

as an intended dependency.

Use:

```text
bootstrap-icons
```

only when icons are actually needed.

Do not introduce another icon library without an explicit requirement.

---

# Local Package Operations

Use pnpm for local dependency operations.

Install:

```bash
pnpm install
```

Add:

```bash
pnpm add <package>
```

Add a development dependency:

```bash
pnpm add -D <package>
```

Update:

```bash
pnpm update
```

Remove:

```bash
pnpm remove <package>
```

Do not use npm for ordinary local dependency modifications.

---

# Local Development and Lifecycle Commands

Use npm for local project scripts and lifecycle commands.

Examples:

```bash
npm run lint
npm run test
npm run build
npm run typecheck
npm pack
```

Use the scripts that actually exist in `package.json`.

Do not invent required scripts without checking the repository.

---

# Lockfile Policy

Do not infer the lockfile policy from the fact that:

```text
pnpm handles local dependency operations
npm handles project scripts
npm is used in GitHub Actions
```

For an existing repository:

```text
preserve the existing lockfile policy
```

For a greenfield repository:

```text
the project or team must explicitly choose the lockfile policy
```

Do not silently introduce a second lockfile.

Do not silently replace the selected lockfile.

Do not add a `packageManager` field solely to enforce command usage.

---

# GitHub Actions

In GitHub Actions, use:

```bash
npm install
npm run <script>
```

Typical validation may resemble:

```bash
npm install
npm run lint
npm run test
npm run build
```

Do not use:

```bash
npm ci
```

Do not add npm dependency caching.

Do not add a repository-owned package-manager installer unless explicitly requested.

Do not add:

```json
{
  "packageManager": "..."
}
```

to `package.json`.

---

# ESLint

Use the repository's ESLint configuration.

The baseline core rules are:

```json
{
  "rules": {
    "semi": ["warn", "always"],
    "quotes": ["warn", "double"],
    "indent": ["warn", 2, { "SwitchCase": 1 }],
    "comma-dangle": ["warn", "always-multiline"],
    "eol-last": ["warn", "always"],
    "spaced-comment": ["warn", "always"],
    "object-curly-spacing": ["warn", "always"],
    "array-bracket-spacing": ["warn", "always"],
    "object-curly-newline": [
      "warn",
      {
        "ImportDeclaration": {
          "multiline": true,
          "minProperties": 4
        }
      }
    ]
  }
}
```

Use:

```ts
const projectName = "mazey-ui";
```

Use semicolons.

Use double quotes.

Use 2-space indentation.

Use spaces inside object braces:

```ts
const options = { enabled: true };
```

Use spaces inside array brackets:

```ts
const themes = [ "light", "dark" ];
```

Use multiline imports when at least four members are imported:

```ts
import {
  first,
  second,
  third,
  fourth,
} from "example-package";
```

Do not add Prettier unless explicitly requested.

If a formatter is introduced later, align it with the ESLint formatting rules.

---

# Error Handling

Avoid defensive programming unless it protects a real external boundary.

Appropriate boundaries may include:

```text
DOM
browser APIs
storage
network
third-party code
```

Do not add unnecessary:

```text
broad try...catch
redundant optional chaining
fallback objects
silent failures
speculative fallback UI
guards for internal TypeScript-guaranteed state
```

Let invalid internal state fail normally.

Keep internal code simple.

---

# Testing

Tests should verify public behavior rather than implementation details.

For `ThemeToggle`, prioritize:

## Rendering

Verify:

```text
one button
type="button"
correct icon for light
correct icon for dark
16px × 16px SVG dimensions
official Bootstrap Icon SVG paths
```

## Accessibility

Verify:

```text
exact accessible labels
no aria-pressed
SVG aria-hidden="true"
SVG focusable="false"
keyboard activation
visible focus treatment
```

## Behavior

Verify:

```text
light requests dark
dark requests light
controlled rerenders remain correct
disabled behavior when supported
```

## DOM Integration

Where part of the public API, verify:

```text
className
style
standard button attributes
aria-*
data-*
ref behavior
```

## Styling

Verify:

```text
32px × 32px default control
16px × 16px icon
border-box sizing
circular shape
centered icon
no layout shift
hover state
focus-visible state
light readability
dark readability
```

Do not add a heavy testing framework solely to test one simple implementation unless it is justified by the project architecture.

---

# Public API

Expose only intentional package APIs.

Conceptually:

```ts
export {
  ThemeToggle,
} from "./components/ThemeToggle";

export type {
  ThemeToggleProps,
  ThemeToggleTheme,
} from "./components/ThemeToggle";
```

Do not export internal helpers merely because they exist.

Treat exported names as public compatibility commitments.

Keep the initial package API small.

---

# Repository Structure

Keep the initial repository structure minimal.

A reasonable structure is:

```text
mazey-ui/
├─ src/
│  ├─ components/
│  │  └─ ThemeToggle/
│  │     ├─ ThemeToggle.tsx
│  │     ├─ ThemeToggle.css
│  │     ├─ ThemeToggle.test.tsx
│  │     └─ index.ts
│  │
│  └─ index.ts
│
├─ eslint.config.js
├─ tsconfig.json
├─ package.json
├─ README.md
├─ AGENTS.md
├─ GOAL.md
└─ LICENSE
```

Do not create empty directories for possible future architecture.

Do not create placeholder components.

---

# Generated Files

Do not hand-edit generated output.

If the repository later contains generated:

```text
dist/
coverage/
docs/
typedoc output
bundled assets
```

change the owning source or configuration instead.

Regenerate the artifact through the appropriate script.

---

# Scope Boundaries

Do not add without an explicit requirement:

```text
large component catalog
theme provider
theme context
global store
global theme manager
automatic localStorage ownership
automatic document theme mutation
post-initialization OS theme tracking
CSS-in-JS framework
second icon library
Bootstrap CSS dependency
routing
backend
API client
analytics
authentication
CMS
application state framework
design-system generator
```

Keep the project focused on reusable frontend UI components.

---

# Adding Future Components

When a new component is requested:

1. Identify the real use case.
2. Define the smallest useful public API.
3. Prefer native HTML semantics.
4. Apply the shared semantic theme.
5. Verify keyboard behavior.
6. Verify accessibility.
7. Add focused tests.
8. Add only the dependencies actually required.
9. Export only the supported public API.
10. Avoid premature shared abstractions.

Extract shared internal patterns only after multiple implemented components need them.

---

# Validation

Before handoff, run the relevant project-defined checks.

Expected categories include:

```bash
npm run lint
npm run test
npm run build
npm pack
```

Run only scripts that actually exist.

Also inspect:

```bash
git status
git diff
git diff --check
```

If a validation command fails, report it clearly.

Do not hide or silently ignore failures.

---

# Handoff Report

When completing repository work, report:

```text
files changed
dependencies added
dependencies removed
public API changes
tests added or changed
validation commands executed
failed checks
skipped checks
existing unrelated changes
```

Keep the report factual.

---

# Git Safety

Do not run destructive Git commands unless explicitly requested.

Avoid:

```bash
git reset --hard
git clean -fd
git checkout -- .
```

Do not discard unrelated user changes.

Do not:

```text
commit
tag
push
publish
deploy
```

unless explicitly requested.

---

# Core Rule

Follow this project model:

```text
real UI requirement
        ↓
small reusable API
        ↓
accessible React component
        ↓
focused tests
        ↓
intentional public export
        ↓
add another component only when needed
```

The repository should grow from real requirements rather than from speculative design-system architecture.
