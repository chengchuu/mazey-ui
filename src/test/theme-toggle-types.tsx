import { ThemeToggle } from "../index";
import type { ThemeToggleProps, ThemeToggleTheme } from "../index";
import type { ResolvedTheme } from "mazey";

interface ExtendedProps extends ThemeToggleProps {
  description: string;
}

const onThemeChange = (theme: ResolvedTheme) => { void theme; };
const theme: ThemeToggleTheme = "dark";
const extended: ExtendedProps = { description: "OS fallback", onThemeChange };

export const validUsage = [
  <ThemeToggle theme={theme} onThemeChange={onThemeChange} />,
  <ThemeToggle onThemeChange={onThemeChange} />,
  <ThemeToggle {...extended} />,
];

// @ts-expect-error onThemeChange is required even when theme is omitted.
export const missingFallbackCallback = <ThemeToggle />;
// @ts-expect-error onThemeChange is required in controlled mode.
export const missingControlledCallback = <ThemeToggle theme="light" />;
// @ts-expect-error Only concrete themes are accepted.
export const invalidTheme = <ThemeToggle theme="system" onThemeChange={onThemeChange} />;
