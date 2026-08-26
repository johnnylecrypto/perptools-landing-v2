import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Arena } from "@/components/sections/arena";
import { arena } from "@/content/arena";

describe("Arena leaderboard", () => {
  it("renders the default range rows", () => {
    render(<Arena />);
    const table = within(screen.getByRole("table"));
    for (const row of arena.leaderboard[arena.defaultRange]) {
      expect(table.getByText(row.agent)).toBeInTheDocument();
    }
  });

  it("swaps rows when another period tab is selected", async () => {
    const user = userEvent.setup();
    render(<Arena />);

    await user.click(screen.getByRole("tab", { name: "7D" }));

    expect(screen.getByRole("tab", { name: "7D" })).toHaveAttribute("aria-selected", "true");
    const table = within(screen.getByRole("table"));
    for (const row of arena.leaderboard["7D"]) {
      expect(table.getByText(row.agent)).toBeInTheDocument();
    }
  });
});
