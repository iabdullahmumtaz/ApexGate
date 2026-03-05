import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiUrl = process.env.VITE_API_URL || 'http://localhost:6016';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5016,
    strictPort: true,
    proxy: {
      '/admin': { target: apiUrl, changeOrigin: true },
      '/health': { target: apiUrl, changeOrigin: true },
    },
  },
});
