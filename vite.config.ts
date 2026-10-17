import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset URLs relative, so the built app works from any path
// (GitHub Pages project sites, subfolders, or a plain web server).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, strictPort: true },
});
