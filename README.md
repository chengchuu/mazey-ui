# mazey-ui

`mazey-ui` is a small React 19 component library. Its initial public API contains the accessible `ThemeToggle` component with controlled behavior and an optional, read-only OS fallback.

- [Website](https://chengchuu.github.io/mazey-ui/)
- [Playground](https://chengchuu.github.io/mazey-ui/playground/)
- [API documentation](https://chengchuu.github.io/mazey-ui/api/)

## Install

```bash
npm install mazey-ui
```

## Use ThemeToggle

Import the component and its stylesheet. The consuming application owns theme resolution, persistence, and document updates.

```tsx
import { useState } from "react";
import { ThemeToggle, type ThemeToggleTheme } from "mazey-ui";
import "mazey-ui/styles.css";

export function App() {
  const [ theme, setTheme ] = useState<ThemeToggleTheme>("light");

  return (
    <ThemeToggle
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
```

`ThemeToggle` renders a native 32 px by 32 px button with a 16 px inline Bootstrap Icon. It requests `"dark"` when `theme` is `"light"`, and requests `"light"` when `theme` is `"dark"`.

When `theme` is provided, the component skips OS detection. It never reads URL parameters or storage, writes storage, or mutates the document. Apply and persist the requested theme in your application-level `onThemeChange` handler.

### Start from the OS preference

For client-rendered use, omit the initial `theme`. The component initializes its display from Mazey's `getSystemTheme()`, using Light when detection returns `null`. Feed each requested value back through `theme` to update the icon and accessible label:

```tsx
import { useState } from "react";
import { ThemeToggle, type ThemeToggleTheme } from "mazey-ui";
import "mazey-ui/styles.css";

export function OSFallbackToggle() {
  const [ theme, setTheme ] = useState<ThemeToggleTheme>();

  return <ThemeToggle theme={theme} onThemeChange={setTheme} />;
}
```

The fallback is initialization-only: rerenders, clicks, and later OS changes do not refresh it. `onThemeChange` remains required. Without passing the callback value back through `theme`, repeated activations request the same opposite value and the rendered button stays unchanged. Persistence belongs to the consumer; no storage key is needed by the component.

For server-side rendering (SSR) or hydration, provide `theme`. OS detection returns `null` on the server, so a Light fallback can differ from the browser's preference.

## API

### `ThemeToggle`

Renders the supplied theme or the initial OS fallback and requests the opposite concrete theme when activated.

```ts
import type { ResolvedTheme } from "mazey";

type ThemeToggleTheme = ResolvedTheme; // "light" | "dark"

interface ThemeToggleProps extends Omit<
  React.ComponentPropsWithRef<"button">,
  "aria-label" | "aria-pressed" | "children" | "type"
> {
  theme?: ThemeToggleTheme;
  onThemeChange: (theme: ThemeToggleTheme) => void;
}
```

The component forwards supported native button properties, including `className`, `style`, `disabled`, `ref`, `aria-*`, and `data-*`. It owns `type`, `aria-label`, `aria-pressed`, and `children` to preserve its behavior and accessibility contract.

## Customize styles

Override the namespaced custom properties on the component. The defaults follow the rendered concrete theme.

```css
.my-theme-toggle {
  --mazey-ui-primary: #7057ff;
  --mazey-ui-surface: #ffffff;
  --mazey-ui-heading: #252525;
  --mazey-ui-body: #525252;
  --mazey-ui-field: #e5e5e5;
}
```

```tsx
<ThemeToggle
  className="my-theme-toggle"
  theme={theme}
  onThemeChange={setTheme}
/>
```

## Develop

Use pnpm for dependency operations. The repository commits `pnpm-lock.yaml` as its only dependency lockfile. Use npm for project scripts and package lifecycle commands.

```bash
pnpm install
npm run lint
npm run test
npm run typecheck
npm run build:package
npm run docs
npm run preview
npm pack
```

The package build produces ESM, CommonJS, declarations, CSS, source maps, and the `MAZEY_UI` browser IIFE. Webpack owns the Home and playground builds, TypeDoc owns API generation, and the Pages assembly script creates the final `docs/` artifact under `/mazey-ui/`.

Mazey is a runtime dependency for ESM, CommonJS, and declarations. The browser IIFE bundles the OS reader and requires React externally; it does not require a Mazey browser global.

## License

[MIT](LICENSE)
