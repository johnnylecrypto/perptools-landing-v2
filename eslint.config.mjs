import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Colour literals are banned outside the token file.
 *
 * The palette lives in `src/app/globals.css`; components reference it through
 * Tailwind utilities (`bg-accent`, `text-fg-subtle`), the `/alpha` modifier
 * (`bg-accent/15`), or `var(--color-*)` inside a composite value. Before this
 * rule the codebase had eighty-five colours in a hundred and ninety
 * hue/alpha combinations — sixteen near-blacks for one background — because
 * nothing stopped a value being pasted in from the design file.
 *
 * `black`, `white` and `transparent` stay legal: masks and scrims want a
 * channel, not a brand colour.
 */
const COLOUR_LITERAL = String.raw`#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])|\brgba?\(\s*\d`;

const colourMessage =
  "Hardcoded colour. Use a token: a Tailwind utility (bg-accent, text-fg-subtle), " +
  "the alpha modifier (bg-accent/15), or var(--color-*) inside a shadow or gradient. " +
  "Add the colour to @theme in globals.css if it does not exist yet.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/tests/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${COLOUR_LITERAL}/]`,
          message: colourMessage,
        },
        {
          selector: `TemplateElement[value.raw=/${COLOUR_LITERAL}/]`,
          message: colourMessage,
        },
      ],
    },
  },
]);

export default eslintConfig;
