# mazey-ui Project Goal

## 1. Project Overview

Project name:

```text
mazey-ui
```

`mazey-ui` is a new frontend UI component library built for React applications.

The project should begin small. Components are added only when a real application requirement exists.

The initial library contains one component:

```text
ThemeToggle
```

Future components may be introduced incrementally as needed.

The project should remain:

```text
small
reusable
typed
accessible
maintainable
framework-focused
consumer-friendly
```

Do not build a large general-purpose design system in advance.

---

## 2. Core Technology

The project uses:

```text
React 19
TypeScript
mazey
```

Icons may use:

```text
Bootstrap Icons
```

when a component actually requires an icon.

Do not introduce another icon library unless explicitly required.

React and React DOM are consumer framework dependencies and should be treated as peer dependencies for the published library.

`mazey` is part of the intended project dependency model.

Build tooling is not fixed by this document and should not be inferred without an explicit project decision.

---

## 3. Development Principle

Build components according to actual requirements.

Use this progression:

```text
real requirement
    ↓
define component API
    ↓
implement component
    ↓
test behavior and accessibility
    ↓
document public usage
    ↓
publish through the library's public exports
```

Do not pre-create speculative component families, hooks, contexts, providers, utilities, or abstractions.

Prefer direct implementations until multiple real components demonstrate a reusable pattern.

---

## 4. Initial Scope

The first component is:

```text
ThemeToggle
```

Initial project scope:

```text
mazey-ui
└─ ThemeToggle
```

Do not add unrelated UI components during the initial implementation.

Examples of future components may include buttons, fields, cards, overlays, or feedback components, but they are outside the current scope until explicitly requested.

---

## 5. Theme Model

The theme model has exactly two concrete states:

```ts
type ResolvedTheme = "light" | "dark";
```

There is no required user-facing `"system"` state in the component API.

The operating-system color scheme may be used by consuming applications during initial preference resolution, but the reusable `ThemeToggle` component should operate only on a concrete:

```text
light
dark
```

value.

---

## 6. Default Theme Palette

The default semantic theme is derived from the established project palette.

### Light Theme

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

### Dark Theme

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

is intentional for both themes.

Do not replace it with white without rechecking contrast.

---

## 7. Library CSS Namespace

Application-level generic variables such as:

```text
--color-primary
--color-surface
```

are useful as semantic concepts, but a reusable published library should avoid unnecessary collisions with consumer styles.

Prefer a package-specific public namespace such as:

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
--mazey-ui-fieldset
--mazey-ui-code-bg
--mazey-ui-code
--mazey-ui-highlight
```

Likewise, public component class names should be namespaced.

For example:

```text
mazey-ui-theme-toggle
mazey-ui-theme-toggle__icon
```

Avoid short generic class names that can easily conflict with consumer applications.

---

## 8. Theme Ownership Boundary

`mazey-ui` provides reusable UI components.

A consuming application owns application-wide theme state.

The reusable library should not silently own or mutate:

```text
localStorage
storage keys
URL query parameters
document.documentElement
data-theme
data-bs-theme
<meta name="theme-color">
operating-system theme listeners
application theme persistence
```

unless such behavior is intentionally exposed through a separate public API in the future.

The preferred architecture is:

```text
Mazey or application logic resolves theme
        ↓
application stores current concrete theme
        ↓
ThemeToggle receives current theme
        ↓
user activates ThemeToggle
        ↓
ThemeToggle requests the opposite theme
        ↓
application persists and applies the theme
```

This keeps the component usable by applications with different theme-management strategies.

---

## 9. `ThemeToggle` Component API

`ThemeToggle` should be a controlled React component.

Conceptual usage:

```tsx
<ThemeToggle
  theme={theme}
  onThemeChange={handleThemeChange}
/>
```

Core API:

```ts
export type ThemeToggleTheme = "light" | "dark";

export interface ThemeToggleProps {
  theme: ThemeToggleTheme;
  onThemeChange: (theme: ThemeToggleTheme) => void;
}
```

Standard button behavior should remain available where practical.

The implementation may support appropriate native button properties such as:

```text
className
style
disabled
aria-*
data-*
```

through a typed React button-props model.

Do not create unnecessary wrapper APIs around standard HTML behavior.

---

## 10. Theme Toggle Behavior

Given:

```text
light
```

the next theme is:

```text
dark
```

Given:

```text
dark
```

the next theme is:

```text
light
```

Conceptually:

```ts
const nextTheme =
  theme === "light" ? "dark" : "light";
```

On activation:

```text
current theme
    ↓
derive opposite theme
    ↓
call onThemeChange(nextTheme)
```

The component itself should not resolve theme preferences again.

It should not query storage to determine the next state.

The concrete `theme` prop is the source of truth for rendering.

---

## 11. Accessible Labels

Use these exact accessible labels.

Light theme:

```text
Current theme: Light. Switch to dark theme.
```

Dark theme:

```text
Current theme: Dark. Switch to light theme.
```

The label communicates both:

```text
current state
next action
```

Do not use:

```text
aria-pressed
```

for this control.

Do not add visible:

```text
L
D
Light
Dark
```

labels unless future product requirements explicitly request visible text.

---

## 12. Theme Toggle Geometry

Default button size:

```text
32px × 32px
```

Shape:

```text
circle
```

Default icon size:

```text
16px × 16px
```

The control must preserve:

```text
stable dimensions
centered icon
no icon layout shift
keyboard focus visibility
hover feedback
active feedback
disabled behavior when supported
```

Required sizing foundation:

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

---

## 13. Bootstrap Icons

Use the official Bootstrap Icons:

```text
sun-fill
moon-stars-fill
```

The Bootstrap Icons npm package should be used as the authoritative source for SVG path data.

Use project-owned inline SVG in the rendered component.

Do not load:

```text
Bootstrap Icons CSS
Bootstrap Icons icon fonts
Bootstrap Icons CDN resources
a runtime icon component solely for this control
```

The icon dependency is used during development to verify and source the SVG data.

The consumer should not need the Bootstrap Icons package at runtime solely because `ThemeToggle` uses these icons internally.

SVG contract:

```text
width="16"
height="16"
viewBox="0 0 16 16"
fill="currentColor"
aria-hidden="true"
focusable="false"
```

The icon is decorative because the button has an accessible name.

---

## 14. Icon State

For:

```text
theme = light
```

render or expose:

```text
sun-fill
```

For:

```text
theme = dark
```

render or expose:

```text
moon-stars-fill
```

The visible icon must always correspond to the current concrete theme.

Do not use icon state as an independent source of theme truth.

---

## 15. Semantic Styling

Components should use semantic CSS variables rather than embedding separate hard-coded light and dark palettes throughout component styles.

Prefer:

```css
color: var(--mazey-ui-body);
background: var(--mazey-ui-surface);
border-color: var(--mazey-ui-field);
```

Use primary color for suitable states such as:

```text
focus
selected state
accent
border interaction
control emphasis
```

Do not use the light primary:

```text
#4d8ffb
```

for small essential normal text on a white background without checking contrast.

Prefer semantic derivation for hover or active states rather than introducing arbitrary one-off colors.

---

## 16. React Design Rules

Target:

```text
React 19
```

Use idiomatic React 19 APIs.

Keep components controlled when external application state is authoritative.

Prefer native HTML semantics.

Forward standard DOM functionality where practical.

Avoid:

```text
hidden global state
document mutation inside ordinary UI components
storage access inside presentational controls
framework-internal APIs
unnecessary contexts
unnecessary providers
unnecessary custom event systems
```

Do not design the project around older React patterns when React 19 provides a simpler public API.

---

## 17. Package Dependency Model

React and React DOM should be peer dependencies for the reusable package.

Conceptually:

```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

They may also appear in development dependencies so the library itself can build and test.

The project uses:

```text
mazey
```

as an intended npm dependency.

Use:

```text
bootstrap-icons
```

as a development dependency when sourcing icons.

Do not add dependencies merely because they may become useful later.

---

## 18. Package-Management Workflow

### Local Dependency Operations

Use pnpm for local dependency operations:

```bash
pnpm install
pnpm add
pnpm update
pnpm remove
```

Examples:

```bash
pnpm add mazey
pnpm add -D bootstrap-icons
```

### Local Development and Lifecycle Commands

Use npm for project scripts and lifecycle commands:

```bash
npm run <script>
npm pack
```

Examples:

```bash
npm run lint
npm run test
npm run build
npm pack
```

Do not infer the package lockfile from the fact that pnpm is used for local dependency operations and npm is used for lifecycle commands.

---

## 19. Lockfile Policy

`mazey-ui` is a greenfield project.

The lockfile policy must be explicitly defined by the project or team.

Do not infer a lockfile policy from:

```text
pnpm install
npm run ...
GitHub Actions using npm install
```

Once a lockfile policy is selected:

```text
preserve it
do not silently replace it
do not introduce a second lockfile
```

Do not add a `packageManager` field solely to enforce the command policy.

---

## 20. GitHub Actions

In GitHub Actions, use:

```bash
npm install
npm run <script>
```

Typical validation flow may include:

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

Do not configure npm dependency caching unless the project policy is explicitly changed.

Do not add:

```json
{
  "packageManager": "..."
}
```

to `package.json`.

---

## 21. ESLint Style

Use the established reusable ESLint core-rule baseline.

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

Style examples:

```ts
const projectName = "mazey-ui";
```

```ts
const values = [ "light", "dark" ];
```

Imports with at least four members should be multiline.

Do not add Prettier unless explicitly requested.

If another formatter is introduced later, align its formatting rules with ESLint.

---

## 22. Initial Repository Direction

Keep the initial structure small.

Recommended conceptual layout:

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

The exact testing and build-tool configuration should follow explicit project decisions.

Do not create unused directories such as:

```text
hooks/
contexts/
providers/
services/
store/
themes/
primitives/
utilities/
```

without an actual requirement.

---

## 23. Public Exports

The initial public API should expose only intentional library functionality.

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

Do not expose internal helpers unless they are intentionally part of the supported public API.

Keep public exports small and stable.

---

## 24. Testing Goals

The first component establishes conventions for future `mazey-ui` components, so test the public contract carefully.

### Rendering

Verify:

```text
one button is rendered
type="button"
correct icon for light
correct icon for dark
16px × 16px SVG dimensions
official Bootstrap Icon path data
```

### Accessibility

Verify exact labels:

```text
Current theme: Light. Switch to dark theme.
Current theme: Dark. Switch to light theme.
```

Also verify:

```text
no aria-pressed
icon aria-hidden="true"
icon focusable="false"
keyboard activation works
focus-visible treatment exists
```

### Behavior

Verify:

```text
light → requests dark
dark → requests light
repeated controlled updates alternate correctly
disabled state does not request a change when supported
```

### DOM Integration

Where supported, verify:

```text
className forwarding
standard button attributes
aria-* attributes
data-* attributes
ref behavior when part of the public API
```

### Styling

Verify:

```text
32px × 32px default button
border-box sizing
circular shape
16px × 16px icon
centered icon
no icon layout shift
hover treatment
focus-visible treatment
dark-theme readability
light-theme readability
```

---

## 25. Error-Handling Policy

Avoid defensive programming for internal states guaranteed by TypeScript and the component contract.

Use defensive handling only for real external boundaries when needed.

Examples:

```text
DOM APIs
browser APIs
storage
network
third-party code
```

Do not add:

```text
broad try...catch
speculative fallback objects
redundant optional chaining
silent internal error suppression
fallback UI without a defined requirement
```

Keep internal component logic direct.

---

## 26. Accessibility

Accessibility is part of the component contract, not an optional enhancement.

Every component should use appropriate native semantics first.

For `ThemeToggle`:

```text
native button
type="button"
descriptive accessible name
keyboard activation
visible keyboard focus
decorative SVG hidden from accessibility APIs
no reliance on color alone
```

Future components must follow the same principle.

---

## 27. Scope Boundaries

Do not add without an explicit requirement:

```text
large component catalog
design-system generator
CSS-in-JS framework
second icon library
theme context
theme provider
global theme store
automatic document mutation
automatic localStorage ownership
automatic OS-theme subscriptions
analytics
backend
API client
CMS
authentication
routing
application state management
Bootstrap CSS dependency
speculative utility framework
```

The initial goal is not to compete with a full UI framework.

The goal is to create reusable components that solve real project needs.

---

## 28. Future Components

New components should be introduced only when needed.

For every future component:

1. Define the real use case.
2. Define the smallest useful public API.
3. Prefer native browser behavior.
4. Apply the shared semantic theme.
5. Ensure keyboard and accessibility behavior.
6. Add focused tests.
7. Export only the supported API.
8. Avoid abstractions that exist only for hypothetical future components.

When multiple implemented components demonstrate the same pattern, extract a reusable internal abstraction at that time.

---

## 29. Initial Success Criteria

The first milestone is complete when `mazey-ui` provides a production-ready `ThemeToggle` that:

```text
supports React 19
uses TypeScript
accepts a controlled light/dark theme
requests the opposite theme on activation
uses the exact accessible labels
uses official inline Bootstrap Icons
is 32px × 32px by default
uses 16px × 16px icons
works with keyboard input
has visible focus treatment
supports light and dark semantic styling
does not own application persistence
does not mutate application-global theme state
is tested
is exported through the public package API
builds successfully
can be packed successfully
```

---

## 30. Validation

Before handoff, run the project-defined validation commands.

Expected command categories:

```bash
npm run lint
npm run test
npm run build
npm pack
```

Also inspect repository state:

```bash
git status
git diff
git diff --check
```

Report:

```text
files changed
dependencies changed
tests added or changed
validation commands executed
failed or skipped checks
existing unrelated changes
```

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

## 31. Final Fixed Decisions

Treat these decisions as fixed unless explicitly changed:

```text
Project:
mazey-ui

Project type:
frontend UI component library

Initial component:
ThemeToggle

Framework:
React 19

Language:
TypeScript

Core npm dependency:
mazey

Icons:
Bootstrap Icons when needed

Theme states:
light | dark

Theme control model:
controlled component

Theme ownership:
consumer application

Light primary:
#4d8ffb

Dark primary:
#5089e8

Primary foreground:
#141414

Light surface:
#ffffff

Dark surface:
#141414

ThemeToggle size:
32px × 32px

ThemeToggle icon size:
16px × 16px

Light icon:
Bootstrap Icons sun-fill

Dark icon:
Bootstrap Icons moon-stars-fill

Icon delivery:
inline SVG

Light accessible label:
Current theme: Light. Switch to dark theme.

Dark accessible label:
Current theme: Dark. Switch to light theme.

aria-pressed:
not used

Visible Light/Dark text:
not used

Public CSS namespace:
--mazey-ui-*

Local dependency operations:
pnpm

Local scripts/lifecycle:
npm

Package validation:
npm pack

GitHub Actions installation:
npm install

GitHub Actions scripts:
npm run <script>

npm ci:
not used

GitHub Actions npm dependency caching:
not used

packageManager field:
not added

Lockfile:
explicit project/team policy required

Formatting:
ESLint baseline rules

Prettier:
not added unless explicitly requested
```

---

## 32. Core Principle

The project should follow this model:

```text
Start with one real component
        ↓
make its API small and reusable
        ↓
make behavior accessible and testable
        ↓
keep application state outside the component
        ↓
establish stable library conventions
        ↓
add another component only when needed
```

Key rule:

> Build `mazey-ui` from real UI requirements rather than predicting a complete design system in advance.
