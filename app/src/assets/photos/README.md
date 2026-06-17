# Photos for "Through my lens"

Drop your photographs into this folder (`app/src/assets/photos/`).

- Any number of files, any names.
- Supported: `.jpg` `.jpeg` `.png` `.webp`
- They load automatically, sorted by filename — so prefix with `01-`, `02-`, etc. to control the order.

The gallery (`src/components/Lens.jsx`) uses Vite's `import.meta.glob`, so Vite
optimises and fingerprints each image at build time. No code changes needed.

Until real photos are added, the gallery shows numbered placeholder frames.
