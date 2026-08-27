export type Partner = {
  name: string;
  /** Optional logo in /public. Falls back to a monogram tile when absent. */
  logo?: string;
  /** Renders at full opacity with an accent glow, per the design file. */
  featured?: boolean;
};

export const partners: readonly Partner[] = [
  { name: "Animoca", logo: "/logo-animoca.svg" },
  { name: "NEAR", logo: "/logo-near.svg" },
  { name: "Shima Capital", logo: "/logo-shima.svg" },
  { name: "Sfermion", featured: true },
  { name: "DEXTools Ventures", logo: "/logo-dextools.svg" },
  { name: "BigBrain Holdings", logo: "/logo-bigbrain.svg" },
  { name: "Morningstar Ventures", logo: "/logo-morningstar.svg" },
  { name: "Orderly Network", logo: "/logo-orderly.svg" },
  { name: "DEXForce", logo: "/logo-dexforce.svg" },
];
