# mazey-ui

`mazey-ui` is a small React 19 component library. Its initial public API contains the controlled, accessible `ThemeToggle` component.

- [Website](https://chengchuu.github.io/mazey-ui/)
- [Playground](https://chengchuu.github.io/mazey-ui/playground/)
- [API documentation](https://chengchuu.github.io/mazey-ui/api/)

## Install

Install the package and its React peer dependencies:

```bash
npm install mazey-ui react react-dom
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

The component does not read or write storage, resolve operating-system preferences, or mutate the document. Apply and persist the requested theme in your application-level `onThemeChange` handler.

## API

### `ThemeToggle`

Renders a controlled button that requests the opposite concrete theme when activated.

```ts
type ThemeToggleTheme = "light" | "dark";

interface ThemeToggleProps extends Omit<
  React.ComponentPropsWithRef<"button">,
  "aria-label" | "aria-pressed" | "children" | "type"
> {
  theme: ThemeToggleTheme;
  onThemeChange: (theme: ThemeToggleTheme) => void;
}
```

The component forwards supported native button properties, including `className`, `style`, `disabled`, `ref`, `aria-*`, and `data-*`. It owns `type`, `aria-label`, `aria-pressed`, and `children` to preserve its behavior and accessibility contract.

## Customize styles

Override the namespaced custom properties on the component. The defaults change with the concrete `theme` prop.

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

## License

[MIT](LICENSE)
