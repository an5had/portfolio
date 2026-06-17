// Auto-loads every photo dropped into src/assets/photos (sorted by filename).
const mods = import.meta.glob('./assets/photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
});

export const PHOTOS = Object.keys(mods)
  .sort()
  .map((k) => mods[k]);
