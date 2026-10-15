import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is deployed to https://<owner>.github.io/Ai-hub/ (no custom domain
// is configured for this repository), so every asset URL must be prefixed with
// the repository path.
export default defineConfig({
  base: '/Ai-hub/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Fail loudly if a chunk grows unexpectedly instead of silently bloating.
    chunkSizeWarningLimit: 700,
  },
  server: {
    port: 5173,
  },
});