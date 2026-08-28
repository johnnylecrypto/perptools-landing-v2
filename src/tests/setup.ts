import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/* JSDOM ships no matchMedia. Components that ask about reduced motion would
   otherwise throw mid-render, which surfaces as a hydration failure and hides
   whatever the test was actually about. Nothing matches, so components take
   their full-motion path. */
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

afterEach(cleanup);
