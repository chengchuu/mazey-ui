import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { App } from "../../examples/App";

afterEach(() => vi.unstubAllGlobals());

describe("playground", () => {
  it("demonstrates the controlled public component contract", async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByTitle("Change preview theme");

    expect(screen.getByRole("heading", { level: 1, name: "ThemeToggle playground" })).toBeInTheDocument();
    expect(toggle).toHaveAttribute("title", "Change preview theme");
    await user.click(toggle);
    expect(toggle).toHaveAccessibleName("Current theme: Dark. Switch to light theme.");
    expect(screen.getByText("Preview theme: dark.")).toHaveAttribute("role", "status");
    expect(screen.getAllByRole("button", { name: "Current theme: Dark. Switch to light theme." })).toHaveLength(2);
  });

  it("feeds the OS fallback request back without changing the page or controlled preview", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const user = userEvent.setup();
    const rootAttributes = document.documentElement.outerHTML.split(">")[0];
    render(<App />);
    const toggle = screen.getByTitle("Change OS fallback preview theme");
    expect(toggle).toHaveAccessibleName("Current theme: Dark. Switch to light theme.");
    await user.click(toggle);
    expect(toggle).toHaveAccessibleName("Current theme: Light. Switch to dark theme.");
    expect(screen.getByText("OS fallback preview theme: light.")).toHaveAttribute("role", "status");
    expect(screen.getByTitle("Change preview theme")).toHaveAccessibleName("Current theme: Light. Switch to dark theme.");
    expect(document.documentElement.outerHTML.split(">")[0]).toBe(rootAttributes);
  });
});
