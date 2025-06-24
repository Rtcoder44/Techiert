import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('[VITE PROXY] Forwarding:', req.method, req.url, '->', proxyReq.getHeader('host'));
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[VITE PROXY] Response from backend for:', req.url, 'Status:', proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[VITE PROXY] Proxy error:', err.message, 'for', req.url);
          });
        },
      },
    },
  },
}) 