// @vitest-environment node
import { renderToString } from "react-dom/server";
import { getSystemTheme } from "mazey";
import { expect, it, vi } from "vitest";
import { ThemeToggle } from "../index";

vi.mock("mazey", { spy: true });

it.each([ "light", "dark" ] as const)("renders explicit %s on the server without OS detection", (theme) => {
  const html = renderToString(<ThemeToggle theme={theme} onThemeChange={() => undefined} />);
  expect(html).toContain(`data-mazey-ui-theme="${theme}"`);
  expect(getSystemTheme).not.toHaveBeenCalled();
});
