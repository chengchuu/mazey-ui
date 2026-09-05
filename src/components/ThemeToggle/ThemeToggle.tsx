import { useState } from "react";
import { getSystemTheme } from "mazey";
import type { ResolvedTheme } from "mazey";
import type {
  ComponentPropsWithRef,
  MouseEvent,
} from "react";
import "./ThemeToggle.css";

export type ThemeToggleTheme = ResolvedTheme;

export interface ThemeToggleProps extends Omit<
  ComponentPropsWithRef<"button">,
  "aria-label" | "aria-pressed" | "children" | "type"
> {
  /** Render this theme, or use the initial OS preference when omitted. Provide it for SSR and hydration. */
  theme?: ThemeToggleTheme;
  /** Request the opposite theme. Pass it back through theme to update the control. */
  onThemeChange: (theme: ThemeToggleTheme) => void;
}

const iconPaths: Record<ThemeToggleTheme, readonly string[]> = {
  light: [
    "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708",
  ],
  dark: [
    "M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278",
    "M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z",
  ],
};

const accessibleLabels: Record<ThemeToggleTheme, string> = {
  light: "Current theme: Light. Switch to dark theme.",
  dark: "Current theme: Dark. Switch to light theme.",
};

export function ThemeToggle({
  theme,
  onThemeChange,
  className,
  onClick,
  ref,
  ...buttonProps
}: ThemeToggleProps) {
  const [ initialResolvedTheme ] = useState(() => theme ?? getSystemTheme() ?? "light");
  const resolvedTheme = theme ?? initialResolvedTheme;
  const nextTheme = resolvedTheme === "light" ? "dark" : "light";
  const iconName = resolvedTheme === "light" ? "sun-fill" : "moon-stars-fill";
  const classes = [ "mazey-ui-theme-toggle", className ].filter(Boolean).join(" ");

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    onThemeChange(nextTheme);
  }

  return (
    <button
      {...buttonProps}
      ref={ref}
      type="button"
      className={classes}
      data-mazey-ui-theme={resolvedTheme}
      aria-label={accessibleLabels[resolvedTheme]}
      aria-pressed={undefined}
      onClick={handleClick}
    >
      <svg
        className="mazey-ui-theme-toggle__icon"
        data-icon={iconName}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        {iconPaths[resolvedTheme].map((path) => <path key={path} d={path} />)}
      </svg>
    </button>
  );
}
