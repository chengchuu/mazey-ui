import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../../examples/App";

describe("playground", () => {
  it("demonstrates the controlled public component contract", async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole("button", { name: "Current theme: Light. Switch to dark theme." });

    expect(screen.getByRole("heading", { level: 1, name: "ThemeToggle playground" })).toBeInTheDocument();
    expect(toggle).toHaveAttribute("title", "Change preview theme");
    await user.click(toggle);
    expect(toggle).toHaveAccessibleName("Current theme: Dark. Switch to light theme.");
    expect(screen.getByText("Preview theme: dark.")).toHaveAttribute("role", "status");
    expect(screen.getAllByRole("button", { name: "Current theme: Dark. Switch to light theme." })).toHaveLength(2);
  });
});
