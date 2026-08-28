# design

Master artwork kept out of `public/` on purpose: anything under `public/` is
served publicly and shipped in the deploy, and these are export sources, not
web assets.

- `logo-source.webp` — 4096x4096 master. The header/footer mark that ships is
  `public/brand/logo-mark.webp` (160x160), resized from this.
