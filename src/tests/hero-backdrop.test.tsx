import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroBackdrop } from "@/components/sections/hero/hero-backdrop";

/**
 * Media extensions inject controls into a `<video>` before React hydrates, and
 * React used to call that a mismatch and re-render the branch. In React 19 a
 * mismatch arrives through `onRecoverableError` — not as a throw, and not on
 * `console.error`, which is why it has to be read off that channel.
 */
function hydrateWith(inject: (container: HTMLElement) => void) {
  const container = document.createElement("div");
  container.innerHTML = renderToString(<HeroBackdrop />);
  document.body.appendChild(container);

  inject(container);

  const recovered: string[] = [];
  // React narrates the same mismatch to the console; the test asserts on the
  // structured channel instead, so silence the duplicate.
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});

  act(() => {
    hydrateRoot(container, <HeroBackdrop />, {
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

describe("HeroBackdrop hydration", () => {
  it("survives an extension injecting a node into the video", () => {
    const recovered = hydrateWith((container) => {
      const video = container.querySelector("video");
      expect(video).not.toBeNull();
      const intruder = document.createElement("div");
      intruder.setAttribute("data-wxt-integrated", "");
      intruder.className = "youtube-dubbing-button";
      video!.appendChild(intruder);
    });

    expect(recovered).toBe("");
  });

  it("still reports a genuine mismatch elsewhere in the tree", () => {
    // The guard is scoped to the video. A real mismatch outside it has to keep
    // shouting, or this fix would be hiding the bugs it is meant to leave alone.
    const recovered = hydrateWith((container) => {
      const noise = container.querySelector("[class*='noise']");
      expect(noise).not.toBeNull();
      noise!.appendChild(document.createElement("span"));
    });

    expect(recovered).toMatch(/hydrat/i);
  });
});
