# PERPTools — Landing v2

Marketing site for PERPTools, rebuilt on **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4**.
Fully static: every route is prerendered at build time.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional; only needed to override the site origin
npm run dev                  # http://localhost:3000
```

## Scripts

| Script              | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Dev server (Turbopack)                             |
| `npm run build`     | Production build                                   |
| `npm start`         | Serve the production build                         |
| `npm run lint`      | ESLint (`eslint-config-next` core-web-vitals + TS) |
| `npm run typecheck` | `tsc --noEmit`                                     |
| `npm run test`      | Vitest + Testing Library                           |
| `npm run format`    | Prettier write (Tailwind class sorting included)   |
| `npm run check`     | format:check → lint → typecheck → test             |

CI (`.github/workflows/ci.yml`) runs `check` plus a production build on every push and PR.

## Architecture

```
src/
  app/               Routes + metadata files (sitemap, robots, opengraph-image, error, not-found)
  components/
    ui/              Style primitives — Button, Card, Badge, Section, Container, Eyebrow
    layout/          Header (client: scroll state + mobile sheet), Footer
    sections/        One file per landing section, composed by src/app/page.tsx
  content/           All copy and data, typed. No strings live in components.
  lib/               site config, formatters, cn(), useInView hook
  tests/             Vitest specs
public/              Static assets (stays at the project root)
```

Three rules keep this maintainable:

1. **Copy lives in `src/content/`.** Sections read typed objects (`src/content/hero.ts`, `src/content/arena.ts`, …).
   Swapping placeholder leaderboard data for a real API means changing one module, not a component.
2. **Server Components by default.** Only `Header`, `Stats` (count-up) and `Arena` (period tabs) are
   `"use client"`. Everything else ships zero JS.
3. **Design tokens over ad-hoc values.** Colors, radii, fonts and section rhythm are declared once in
   `src/app/globals.css` under `@theme`, which generates the Tailwind utilities (`bg-bg-1`, `text-fg-muted`,
   `border-line-accent`, `py-section`, `px-side`). Gradients and shadows are CSS variables
   (`--gradient-accent`, `--shadow-card`).

### Design tokens

| Group    | Tokens                                                    |
| -------- | --------------------------------------------------------- |
| Surfaces | `bg-0 #030507` · `bg-1` · `bg-2` · `bg-3`                 |
| Text     | `fg` · `fg-muted` · `fg-subtle` · `fg-faint`              |
| Accent   | `accent-light #83d4fb` · `accent #2bb9f3` · `accent-dark` |
| Lines    | `line` · `line-strong` · `line-accent`                    |
| Type     | Manrope (sans) · JetBrains Mono (mono)                    |

The site is dark-only by design (`color-scheme: dark`). To add a light theme, redefine the same token
names under a `:root[data-theme="light"]` block — no component changes needed.

## Adding a section

1. Add the copy to a new module in `src/content/`.
2. Create `src/components/sections/<name>.tsx` using `<Section id="...">` and `<SectionHeading id="...">`
   (the shared `id` wires up the anchor and `aria-labelledby`).
3. Render it in `src/app/page.tsx` and add the anchor to `src/content/navigation.ts`.

`src/tests/navigation.test.ts` fails if a nav anchor points at a section that doesn't exist.

## SEO & accessibility

- Metadata, Open Graph and Twitter cards in `src/app/layout.tsx`, driven by `src/lib/site.ts`.
- Generated OG image at `src/app/opengraph-image.tsx`; `sitemap.xml` and `robots.txt` are route handlers.
- JSON-LD `Organization` block on the home page.
- Skip link, focus-visible rings, labelled sections/tabs, and a `prefers-reduced-motion` bail-out for
  every animation.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the production origin so canonical URLs, sitemap and OG tags are absolute.
Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`)
are configured in `next.config.ts`.
