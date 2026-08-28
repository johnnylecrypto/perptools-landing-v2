export type Partner = {
  name: string;
  /** Optional logo in /public. Falls back to a monogram tile when absent. */
  logo?: string;
  /** Renders at full opacity with an accent glow, per the design file. */
  featured?: boolean;
};

export const partners: readonly Partner[] = [
  { name: "Animoca", logo: "/partners/animoca.svg" },
  { name: "NEAR", logo: "/partners/near.svg" },
  { name: "Shima Capital", logo: "/partners/shima.svg" },
  { name: "Sfermion", featured: true },
  { name: "DEXTools Ventures", logo: "/partners/dextools.svg" },
  { name: "BigBrain Holdings", logo: "/partners/bigbrain.svg" },
  { name: "Morningstar Ventures", logo: "/partners/morningstar.svg" },
  { name: "Orderly Network", logo: "/partners/orderly.svg" },
  { name: "DEXForce", logo: "/partners/dexforce.svg" },
];
