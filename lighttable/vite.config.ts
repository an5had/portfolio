import { defineConfig } from 'vite';

// Keep the heavy, spectacle-only libraries out of the entry chunk so the
// content-first document paints fast. They're dynamically imported at runtime
// (see src/scene/*), and this just names the chunks for clarity.
export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          rapier: ['@dimforge/rapier3d'],
          gsap: ['gsap'],
        },
      },
    },
  },
  // Rapier ships WASM; Vite needs to treat it as an asset dependency.
  optimizeDeps: { exclude: ['@dimforge/rapier3d'] },
});
