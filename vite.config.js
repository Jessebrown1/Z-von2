import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    proxy: {
      // Image uploads go straight to Cloudinary now (absolute URLs), so this
      // is the only proxy needed for local dev.
      '/api': {
        target: `http://localhost:${process.env.API_PORT || 4000}`,
        changeOrigin: true,
      },
    },
  },
});
