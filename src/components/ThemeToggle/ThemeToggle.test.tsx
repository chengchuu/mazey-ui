import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getSystemTheme } from "mazey";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ThemeToggle } from "./ThemeToggle";
import type { ThemeToggleTheme } from "./ThemeToggle";

vi.mock("mazey", { spy: true });

beforeEach(() => {
  vi.mocked(getSystemTheme).mockReset().mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const themeToggleCss = readFileSync(
  resolve(process.cwd(), "src/components/ThemeToggle/ThemeToggle.css"),
  "utf8",
);

const sunPath = "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708";
const moonPaths = [
  "M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278",
  "M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z",
];

function contrastRatio(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const channels = [ 1, 3, 5 ].map((index) => {
      const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    const [ red, green, blue ] = channels;
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const values = [ luminance(foreground), luminance(background) ].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("ThemeToggle", () => {
  it("renders the light theme with the exact accessible and icon contracts", () => {
    render(<ThemeToggle theme="light" onThemeChange={vi.fn()} />);

    const button = screen.getByRole("button", {
      name: "Current theme: Light. Switch to dark theme.",
    });
    const icon = button.querySelector("svg");

    expect(button).toHaveAttribute("type", "button");
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(icon).toHaveAttribute("data-icon", "sun-fill");
    expect(icon).toHaveAttribute("width", "16");
    expect(icon).toHaveAttribute("height", "16");
    expect(icon).toHaveAttribute("viewBox", "0 0 16 16");
    expect(icon).toHaveAttribute("fill", "currentColor");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("focusable", "false");
    expect(icon?.querySelector("path")).toHaveAttribute("d", sunPath);
    expect(getSystemTheme).not.toHaveBeenCalled();
  });

  it("renders the dark theme with the official moon-stars-fill paths", () => {
    render(<ThemeToggle theme="dark" onThemeChange={vi.fn()} />);

    const button = screen.getByRole("button", {
      name: "Current theme: Dark. Switch to light theme.",
    });
    const paths = Array.from(button.querySelectorAll("path"));

    expect(button.querySelector("svg")).toHaveAttribute("data-icon", "moon-stars-fill");
    expect(paths.map((path) => path.getAttribute("d"))).toEqual(moonPaths);
    expect(getSystemTheme).not.toHaveBeenCalled();
  });

  it("does not forward aria-pressed from an untyped consumer", () => {
    const javascriptProps = {
      theme: "light" as const,
      onThemeChange: vi.fn(),
      "aria-pressed": true,
    };

    render(createElement(ThemeToggle, javascriptProps));

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
  });

  it("requests the opposite theme and follows controlled updates", async () => {
    const user = userEvent.setup();
    const changes: string[] = [];

    function ControlledToggle() {
      const [ theme, setTheme ] = useState<"light" | "dark">("light");

      return (
        <ThemeToggle
          theme={theme}
          onThemeChange={(nextTheme) => {
            changes.push(nextTheme);
            setTheme(nextTheme);
          }}
        />
      );
    }

    render(<ControlledToggle />);
    const button = screen.getByRole("button");

    await user.click(button);
    expect(button).toHaveAccessibleName("Current theme: Dark. Switch to light theme.");

    button.focus();
    await user.keyboard("{Enter}");
    expect(changes).toEqual([ "dark", "light" ]);
    expect(button).toHaveAccessibleName("Current theme: Light. Switch to dark theme.");
  });

  it("preserves supported native button attributes, events, class names, styles, and refs", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onThemeChange = vi.fn();
    let buttonRef: HTMLButtonElement | null = null;

    render(
      <ThemeToggle
        ref={(node) => { buttonRef = node; }}
        theme="light"
        onThemeChange={onThemeChange}
        onClick={onClick}
        className="consumer-class"
        style={{ margin: 4 }}
        aria-describedby="theme-help"
        data-testid="theme-toggle"
      />,
    );

    const button = screen.getByTestId("theme-toggle");
    await user.click(button);

    expect(button).toHaveClass("mazey-ui-theme-toggle", "consumer-class");
    expect(button).toHaveStyle({ margin: "4px" });
    expect(button).toHaveAttribute("aria-describedby", "theme-help");
    expect(buttonRef).toBe(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onThemeChange).toHaveBeenCalledWith("dark");
    expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(onThemeChange.mock.invocationCallOrder[0]);
  });

  it("does not request a theme change when disabled", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();

    render(<ThemeToggle theme="dark" onThemeChange={onThemeChange} disabled />);
    await user.click(screen.getByRole("button"));

    expect(onThemeChange).not.toHaveBeenCalled();
  });

  it.each([ "light", "dark", null ] as const)("initializes from the OS result %s", (systemTheme) => {
    vi.mocked(getSystemTheme).mockReturnValue(systemTheme);
    render(<ThemeToggle onThemeChange={vi.fn()} />);

    const theme = systemTheme ?? "light";
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-mazey-ui-theme", theme);
    expect(button).toHaveAccessibleName(theme === "light"
      ? "Current theme: Light. Switch to dark theme."
      : "Current theme: Dark. Switch to light theme.");
    expect(button.querySelector("svg")).toHaveAttribute("data-icon", theme === "light" ? "sun-fill" : "moon-stars-fill");
    expect(getSystemTheme).toHaveBeenCalledOnce();
  });

  it("keeps the initial fallback through rerenders, clicks, OS changes, and controlled updates", async () => {
    const user = userEvent.setup();
    vi.mocked(getSystemTheme).mockReturnValue("dark");
    const onThemeChange = vi.fn();
    const { rerender } = render(<ThemeToggle onThemeChange={onThemeChange} />);
    const button = screen.getByRole("button");

    vi.mocked(getSystemTheme).mockReturnValue("light");
    rerender(<ThemeToggle onThemeChange={onThemeChange} title="Rerendered" />);
    await user.click(button);
    await user.click(button);
    expect(onThemeChange.mock.calls).toEqual([ [ "light" ], [ "light" ] ]);
    expect(button).toHaveAccessibleName("Current theme: Dark. Switch to light theme.");
    expect(button).toHaveAttribute("data-mazey-ui-theme", "dark");

    rerender(<ThemeToggle theme="light" onThemeChange={onThemeChange} />);
    expect(button).toHaveAccessibleName("Current theme: Light. Switch to dark theme.");
    rerender(<ThemeToggle onThemeChange={onThemeChange} />);
    expect(button).toHaveAttribute("data-mazey-ui-theme", "dark");
    expect(getSystemTheme).toHaveBeenCalledOnce();
  });

  it("feeds fallback requests back through the optional theme prop", async () => {
    const user = userEvent.setup();
    vi.mocked(getSystemTheme).mockReturnValue("dark");
    const changes = vi.fn();
    function FallbackToggle() {
      const [ theme, setTheme ] = useState<ThemeToggleTheme>();
      return <ThemeToggle theme={theme} onThemeChange={(nextTheme) => {
        changes(nextTheme);
        setTheme(nextTheme);
      }} />;
    }
    render(<FallbackToggle />);
    const button = screen.getByRole("button");
    await user.click(button);
    expect(button).toHaveAccessibleName("Current theme: Light. Switch to dark theme.");
    expect(button).toHaveAttribute("data-mazey-ui-theme", "light");
    expect(button.querySelector("svg")).toHaveAttribute("data-icon", "sun-fill");
    await user.click(button);
    expect(button).toHaveAccessibleName("Current theme: Dark. Switch to light theme.");
    expect(button).toHaveAttribute("data-mazey-ui-theme", "dark");
    expect(button.querySelector("svg")).toHaveAttribute("data-icon", "moon-stars-fill");
    expect(changes.mock.calls).toEqual([ [ "light" ], [ "dark" ] ]);
    expect(getSystemTheme).toHaveBeenCalledOnce();
  });

  it("uses the real OS reader without URL, storage, listeners, or document theme effects", async () => {
    const actual = await vi.importActual<typeof import("mazey")>("mazey");
    vi.mocked(getSystemTheme).mockImplementation(actual.getSystemTheme);
    const user = userEvent.setup();
    const media = { matches: true, addEventListener: vi.fn(), addListener: vi.fn() };
    const matchMedia = vi.fn(() => media);
    vi.stubGlobal("matchMedia", matchMedia);
    const localStorageRead = vi.spyOn(window, "localStorage", "get");
    const sessionStorageRead = vi.spyOn(window, "sessionStorage", "get");
    const storageRead = vi.spyOn(Storage.prototype, "getItem");
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    const queryRead = vi.spyOn(URLSearchParams.prototype, "get");
    const locationRead = vi.spyOn(window, "location", "get");
    const rootAttributes = document.documentElement.outerHTML.split(">")[0];
    const head = document.head.innerHTML;
    const onThemeChange = vi.fn();
    const { rerender } = render(<ThemeToggle onThemeChange={onThemeChange} />);
    const button = screen.getByRole("button");
    media.matches = false;
    rerender(<ThemeToggle onThemeChange={onThemeChange} />);
    await user.click(button);

    expect(onThemeChange).toHaveBeenCalledWith("light");
    expect(button).toHaveAttribute("data-mazey-ui-theme", "dark");
    expect(matchMedia).toHaveBeenCalledExactlyOnceWith("(prefers-color-scheme: dark)");
    for (const spy of [ localStorageRead, sessionStorageRead, storageRead, storageWrite, queryRead, locationRead, media.addEventListener, media.addListener ]) {
      expect(spy).not.toHaveBeenCalled();
    }
    expect(document.documentElement.outerHTML.split(">")[0]).toBe(rootAttributes);
    expect(document.head.innerHTML).toBe(head);
  });

  it("retains the initial controlled value when theme is later omitted", () => {
    const onThemeChange = vi.fn();
    const { rerender } = render(<ThemeToggle theme="dark" onThemeChange={onThemeChange} />);
    rerender(<ThemeToggle onThemeChange={onThemeChange} />);
    expect(screen.getByRole("button")).toHaveAttribute("data-mazey-ui-theme", "dark");
    expect(getSystemTheme).not.toHaveBeenCalled();
  });

  it("ships the required stable sizing and interaction styles", () => {
    expect(themeToggleCss).toMatch(/display:\s*inline-flex/);
    expect(themeToggleCss).toMatch(/align-items:\s*center/);
    expect(themeToggleCss).toMatch(/justify-content:\s*center/);
    expect(themeToggleCss).toMatch(/width:\s*32px/);
    expect(themeToggleCss).toMatch(/height:\s*32px/);
    expect(themeToggleCss).toMatch(/box-sizing:\s*border-box/);
    expect(themeToggleCss).toMatch(/border-radius:\s*50%/);
    expect(themeToggleCss).toMatch(/\.mazey-ui-theme-toggle:hover:not\(:disabled\)/);
    expect(themeToggleCss).toMatch(/\.mazey-ui-theme-toggle:active:not\(:disabled\)/);
    expect(themeToggleCss).toMatch(/\.mazey-ui-theme-toggle:focus-visible/);
    expect(themeToggleCss).toMatch(/outline:\s*2px solid var\(--mazey-ui-theme-toggle-primary\)/);
    expect(themeToggleCss).toMatch(/\.mazey-ui-theme-toggle__icon[\s\S]*width:\s*16px/);
    expect(themeToggleCss).toMatch(/\.mazey-ui-theme-toggle__icon[\s\S]*height:\s*16px/);
    expect(themeToggleCss).toMatch(/flex:\s*0 0 16px/);
    expect(themeToggleCss).toContain("var(--mazey-ui-primary, #4d8ffb)");
    expect(themeToggleCss).toContain("var(--mazey-ui-primary, #5089e8)");
    expect(themeToggleCss).toContain("var(--mazey-ui-on-primary, #141414)");
    expect(themeToggleCss).toContain("var(--mazey-ui-surface, #ffffff)");
    expect(themeToggleCss).toContain("var(--mazey-ui-surface, #141414)");
    expect(themeToggleCss).toContain("var(--mazey-ui-body, #626262)");
    expect(themeToggleCss).toContain("var(--mazey-ui-body, #a5a5a5)");
    expect(themeToggleCss).not.toMatch(/^\s*--mazey-ui-(?:primary|on-primary|surface|heading|body|field):/m);
    expect(contrastRatio("#626262", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#a5a5a5", "#141414")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#141414", "#4d8ffb")).toBeGreaterThanOrEqual(3);
    expect(contrastRatio("#141414", "#5089e8")).toBeGreaterThanOrEqual(3);
  });
});
