export type Partner = {
  name: string;
  /** Optional logo in /public. Falls back to a monogram tile when absent. */
  logo?: string;
  /** Renders at full opacity with an accent glow, per the design file. */
  featured?: boolean;
};

export const partners: readonly Partner[] = [
  { name: "Animoca" },
  { name: "NEAR" },
  { name: "Shima Capital" },
  { name: "Sfermion", featured: true },
  { name: "DEXTools Ventures" },
  { name: "BigBrain Holdings" },
  { name: "Morningstar Ventures" },
  { name: "Orderly Network" },
  { name: "DEXForce" },
];
