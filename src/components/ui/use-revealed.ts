"use client";

import { useContext } from "react";
import { RevealContext } from "@/components/ui/reveal-context";

/** Reads the nearest `Reveal`'s triggered state. */
export function useRevealed() {
  return useContext(RevealContext);
}
