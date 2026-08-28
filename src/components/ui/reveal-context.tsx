"use client";

import { createContext } from "react";

/**
 * Whether the reveal this element sits inside has been triggered.
 *
 * Lets counters and other JS-driven pieces start on the same beat as the CSS
 * cascade, instead of each watching the viewport for itself and drifting apart
 * on a tall section.
 */
export const RevealContext = createContext(false);
