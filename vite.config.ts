import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    // Every asset is either WebP/JPEG or already-minified JS, so inlining tiny
    // files only bloats the entry chunk.
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        // Split the heavy, rarely-changing vendors into their own chunks so a
        // content edit does not invalidate 1.5MB of cached library code.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber'],
          'vendor-gsap': ['gsap', '@gsap/react'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
});
