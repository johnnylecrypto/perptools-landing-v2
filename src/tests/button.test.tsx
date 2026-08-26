import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders a button element by default", () => {
    render(<Button>Launch App</Button>);
    const button = screen.getByRole("button", { name: "Launch App" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("renders an internal link without target", () => {
    render(<Button href="/#arena">AI Arena</Button>);
    const link = screen.getByRole("link", { name: "AI Arena" });
    expect(link).toHaveAttribute("href", "/#arena");
    expect(link).not.toHaveAttribute("target");
  });

  it("hardens external links", () => {
    render(<Button href="https://app.perptools.ai">Launch App</Button>);
    const link = screen.getByRole("link", { name: "Launch App" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
