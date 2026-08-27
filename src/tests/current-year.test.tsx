import { render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CurrentYear } from "@/components/ui/current-year";

afterEach(() => vi.useRealTimers());

describe("CurrentYear", () => {
  it("renders the build year first, so hydration has something to match", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    render(<CurrentYear buildYear={2026} />);
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("corrects itself once the year has moved on without a rebuild", () => {
    // The case this exists for: built in 2026, still being served in 2027.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01T00:00:01Z"));
    act(() => {
      render(<CurrentYear buildYear={2026} />);
    });
    expect(screen.getByText("2027")).toBeInTheDocument();
    expect(screen.queryByText("2026")).not.toBeInTheDocument();
  });
});
