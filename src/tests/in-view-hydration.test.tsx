import { renderToString } from "react-dom/server";
import { createRoot, hydrateRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TerminalLift } from "@/components/sections/terminal-lift";
import { PointsReceipt } from "@/components/sections/points-receipt";

/**
 * `useInView` used to seed its state from `typeof IntersectionObserver`, which
 * is undefined on the server and defined in the browser — so the server sent
 * the finished entrance class and the client rendered without it. React does
 * not patch attributes up after a mismatch, so the class stayed wrong.
 *
 * JSDOM has no IntersectionObserver, which is exactly the environment that used
 * to disagree with the server, so these run against the real failure mode.
 */
function recoverableErrors(node: React.ReactElement) {
  const container = document.createElement("div");
  container.innerHTML = renderToString(node);
  document.body.appendChild(container);

  const recovered: string[] = [];
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
  act(() => {
    hydrateRoot(container, node, {
      onRecoverableError: (error) => {
        recovered.push(error instanceof Error ? error.message : String(error));
      },
    });
  });
  quiet.mockRestore();

  return recovered.join(" ");
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useInView hydration", () => {
  it("hydrates TerminalLift without a mismatch", () => {
    expect(recoverableErrors(<TerminalLift />)).toBe("");
  });

  it("hydrates PointsReceipt without a mismatch", () => {
    expect(recoverableErrors(<PointsReceipt />)).toBe("");
  });

  it("does not send the entrance class from the server", () => {
    // The server cannot know what is on screen. Shipping `is-in` was what made
    // the two renders disagree in the first place.
    expect(renderToString(<TerminalLift />)).not.toContain("is-in");
    expect(renderToString(<PointsReceipt />)).not.toContain("is-printing");
  });

  it("still reveals content where IntersectionObserver is missing", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    // Rendered, not hydrated: this is about the reveal, and hydrating an empty
    // container would be a mismatch by construction. Two passes, because the
    // effect that schedules the reveal only runs when the first act settles.
    await act(async () => {
      createRoot(container).render(<TerminalLift />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector(".lift-scene")?.className).toContain("is-in");
  });
});
