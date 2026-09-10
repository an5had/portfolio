# Craft interactive site — scaffold

A runnable Vite + TypeScript starter implementing the content-first, award-craft
architecture. **Copy it, then adapt** — don't rebuild from scratch. Every "change
this" point is marked in the code.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/  (deploy to Cloudflare Pages)
```

## File map

| Path | What it is | You'll edit… |
|---|---|---|
| `index.html` | The semantic, content-first document + layer stack + all SEO/OG/JSON-LD | **a lot** — your copy, meta, chapters |
| `src/tokens.css` | The metaphor as design tokens | rename to your object's parts |
| `src/styles.css` | Structural CSS (references tokens) | rarely |
| `src/main.ts` | Boot sequence (content-first order) | wiring only |
| `src/loader/preloader.ts` | Phased, byte-accurate asset preloader | the `manifest` |
| `src/loader/orchestrator.ts` | The intro as a GSAP timeline | the choreography |
| `src/scroll/scroll.ts` | Lenis smooth scroll + snap + opacity reveal | tuning |
| `src/scroll/marks.ts` | The hand-drawn annotation layer | mark placement |
| `src/scene/stage.ts` | Three.js stage (guarded, lazy physics) | lights/camera |
| `src/scene/pendulum.ts` | The Rapier signature interaction | `RIG` tuning, geometry |
| `src/scene/face-texture.ts` | Live-drawn badge texture (counter) | the face design |
| `src/shaders/aquarelle.ts` | Watercolor/ink-bleed reveal material | ink color, edge |
| `src/sound/sound.ts` | Web Audio engine + haptics | asset URLs |
| `functions/api/visit.ts` | Cloudflare presence/geo edge function | your KV/DO logic |

## Adaptation order

1. **Metaphor** → rename `tokens.css`, set `theme-color` and the palette.
2. **Content** → replace the chapters in `index.html` with real copy (this is the
   site; make it good here first).
3. **Interaction** → retune `RIG` in `pendulum.ts` until the weight feels right;
   swap the geometry/texture for your object.
4. **Imagery** → add per-section props; use `aquarelle.ts` for signature reveals.
5. **Loader** → author the intro composition in `orchestrator.ts` (comp space).
6. **Assets** → fill `preloader.ts`'s manifest with real files + sizes + `sm` variants.
7. **Deploy** → Cloudflare Pages (`dist/`), bind `VISITS` KV, ship favicons + `og.jpg`.

## The one rule

Every word is real DOM text at first paint. The canvas is decoration. If a change
would hide content behind JS or WebGL, restructure. See `../references/architecture.md`.

## Notes

- `@dimforge/rapier3d` ships WASM and is **lazy-imported** in `stage.ts` — it must
  not enter the entry chunk. `pendulum.ts` types Rapier loosely (`any`) so the
  project type-checks before the dependency is installed.
- Fonts referenced in `tokens.css` (`Geist Pixel`, `SF Rounded`, `Nanum Pen Script`)
  need to be self-hosted in `public/fonts/` with matching `@font-face` rules, or
  swapped for the system fallbacks already in the stacks.
- Run the dev server and the browser/preview tools while tuning — motion and physics
  are felt, not reasoned.
